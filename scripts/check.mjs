import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, readdir, stat } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";
import vm from "node:vm";
import { apps, optionalExtras, project } from "../config/apps.mjs";
import { awaExclusions } from "../config/awa-exclusions.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIST = path.join(ROOT, "dist");
const require = createRequire(import.meta.url);
const { processResponse } = require("../src/blockad-router.cjs");
const RAW_PREFIX =
  "https://raw.githubusercontent.com/STERILITZIA02/Blockad-sr-my/main/dist/";
const STABLE_MODULE_URL =
  "https://raw.githubusercontent.com/STERILITZIA02/Blockad-sr-my/main/stable/BlockAd.Unified.sgmodule";

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function posix(value) {
  return value.replaceAll("\\", "/");
}

async function walk(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      result.push(...(await walk(absolute)));
    } else if (entry.isFile()) {
      result.push(absolute);
    }
  }
  return result;
}

function splitSections(source) {
  const sections = new Map();
  let current = "Metadata";
  sections.set(current, []);
  for (const rawLine of source.replaceAll("\r\n", "\n").split("\n")) {
    const line = rawLine.trim();
    const header = line.match(/^\[([^\]]+)\]$/);
    if (header) {
      current = header[1];
      assert.equal(sections.has(current), false, `section 重复: ${current}`);
      sections.set(current, []);
      continue;
    }
    if (line && !line.startsWith("#")) {
      sections.get(current).push(line);
    }
  }
  return sections;
}

function compilePattern(pattern, context) {
  assert.doesNotThrow(() => new RegExp(pattern), `${context}: ${pattern}`);
}

function literalHostDomains(pattern) {
  const marker = String.raw`^https:\/\/`;
  if (!pattern.startsWith(marker)) return [];
  const hostEnd = pattern.indexOf(String.raw`\/`, marker.length);
  if (hostEnd === -1) return [];
  const hostExpression = pattern
    .slice(marker.length, hostEnd)
    .replaceAll(String.raw`\.`, ".");
  return [
    ...new Set(
      [
        ...hostExpression.matchAll(
          /(?:[a-z0-9-]+\.)+(?:com|cn|net|org|io|tv|app|cloud|mobi|me|cc|fm|top|xyz|info|dev|gift|hk|tw|jp)/gi,
        ),
      ].map((match) => match[0].toLowerCase()),
    ),
  ];
}

function mitmCoversDomain(mitmHosts, domain) {
  return mitmHosts.some((rawHost) => {
    const host = rawHost.toLowerCase().replace(/^\*\./, "");
    return (
      host === domain ||
      host.endsWith(`.${domain}`) ||
      domain.endsWith(`.${host}`)
    );
  });
}

function validateModule(source, relativePath) {
  assert.match(source, /^#!name=BlockAd · /, `${relativePath}: 缺少 name`);
  assert.match(source, /^#!version=\d+\.\d+\.\d+$/m, `${relativePath}: 缺少版本`);
  assert.equal(source.includes("{{{"), false, `${relativePath}: 含未展开模板变量`);
  assert.equal(
    /[A-Za-z]:\\(?:Users|Documents|Desktop|Temp)\\/i.test(source),
    false,
    `${relativePath}: 含本机绝对路径`,
  );

  const sections = splitSections(source);
  const allowedSections = new Set(["Metadata", "Rule", "URL Rewrite", "Script", "MITM"]);
  for (const section of sections.keys()) {
    assert.equal(
      allowedSections.has(section),
      true,
      `${relativePath}: 不支持的 section ${section}`,
    );
  }

  for (const [section, lines] of sections) {
    const duplicates = lines.filter((line, index) => lines.indexOf(line) !== index);
    assert.deepEqual(
      duplicates,
      [],
      `${relativePath}: ${section} 存在重复行 ${duplicates.join(" | ")}`,
    );
  }

  for (const rule of sections.get("Rule") || []) {
    if (rule.startsWith("RULE-SET,")) {
      const match = rule.match(/^RULE-SET,(https:\/\/[^,]+),REJECT$/);
      assert.ok(match, `${relativePath}: 无效 RULE-SET ${rule}`);
      assert.equal(
        match[1].startsWith(RAW_PREFIX),
        true,
        `${relativePath}: RULE-SET 不是本仓库受控链接`,
      );
      const localPath = path.join(DIST, match[1].slice(RAW_PREFIX.length));
      assert.equal(existsSync(localPath), true, `${relativePath}: 规则文件不存在`);
    } else {
      assert.match(
        rule,
        /^(?:DOMAIN|DOMAIN-SUFFIX),[^,\s]+,REJECT$/,
        `${relativePath}: 无效 Rule ${rule}`,
      );
    }
  }

  for (const rewrite of sections.get("URL Rewrite") || []) {
    const pattern = rewrite.split(/\s+/)[0];
    compilePattern(pattern, `${relativePath} URL Rewrite`);
    assert.match(
      rewrite,
      /(?:\s-\sreject(?:-(?:dict|array|200|img))?|\shttps?:\/\/\S+\s302)$/,
      `${relativePath}: 无效 Rewrite 动作 ${rewrite}`,
    );
  }

  for (const script of sections.get("Script") || []) {
    const pattern = script.match(/,pattern=([^,]+),requires-body=1,/);
    const scriptPath = script.match(/,script-path=([^,]+)(?:,|$)/);
    assert.ok(pattern, `${relativePath}: Script 缺少 pattern`);
    assert.ok(scriptPath, `${relativePath}: Script 缺少 script-path`);
    compilePattern(pattern[1], `${relativePath} Script`);
    assert.equal(
      scriptPath[1].startsWith(RAW_PREFIX),
      true,
      `${relativePath}: Script 不是本仓库受控链接`,
    );
    const localPath = path.join(DIST, scriptPath[1].slice(RAW_PREFIX.length));
    assert.equal(existsSync(localPath), true, `${relativePath}: 脚本文件不存在`);
    if (script.includes(",argument=")) {
      const argument = script.match(/,argument="(\{.*\})"$/);
      assert.ok(argument, `${relativePath}: Script argument 格式无效`);
      assert.doesNotThrow(
        () => JSON.parse(argument[1]),
        `${relativePath}: Script argument 不是有效 JSON`,
      );
    }
  }

  for (const mitm of sections.get("MITM") || []) {
    assert.match(mitm, /^hostname\s*=\s*%APPEND%\s+/, `${relativePath}: MITM 语法无效`);
    assert.equal(
      mitm.includes("*."),
      false,
      `${relativePath}: MITM 必须使用精确主机，禁止通配`,
    );
    assert.equal(
      /(?:^|,\s*)(?:\d{1,3}\.){3}\d{1,3}(?:,|$)/.test(mitm),
      false,
      `${relativePath}: MITM 不应包含 IP`,
    );
  }
}

function validateConfigPatterns() {
  const allModules = [...apps, ...optionalExtras];
  for (const app of allModules) {
    assert.match(app.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${app.id}: id 无效`);
    assert.equal(Boolean(app.name?.trim()), true, `${app.id}: 缺少名称`);
    assert.equal(Boolean(app.description?.trim()), true, `${app.id}: 缺少说明`);
    for (const field of ["rules", "rewrites", "scripts", "mitm"]) {
      assert.equal(Array.isArray(app[field]), true, `${app.id}: ${field} 必须为数组`);
    }
    assert.equal(
      new Set(app.mitm).size,
      app.mitm.length,
      `${app.id}: MITM 主机重复`,
    );
    for (const hostname of app.mitm) {
      assert.match(
        hostname,
        /^(?:[a-z0-9-]+\.)+[a-z]{2,}$/i,
        `${app.id}: MITM 必须使用精确主机，禁止通配或端口: ${hostname}`,
      );
    }
    assert.equal(
      app.rules.length + app.rewrites.length + app.scripts.length > 0,
      true,
      `${app.id}: 组件没有任何执行规则`,
    );

    for (const rewrite of app.rewrites) {
      compilePattern(rewrite.pattern, `${app.id} Rewrite`);
      assert.equal(Boolean(rewrite.comment?.trim()), true, `${app.id}: Rewrite 缺少注释`);
      assert.equal(
        /\b\d{1,3}(?:\\\.\d{1,3}){3}\b/.test(rewrite.pattern),
        false,
        `${app.id}: Rewrite 不得匹配静态 IPv4`,
      );
      if (!rewrite.action.startsWith("reject")) {
        assert.equal(
          app.id === "zhihu-link-direct" && rewrite.action === "http://$1 302",
          true,
          `${app.id}: 未批准的外部重定向 ${rewrite.action}`,
        );
      }
      for (const domain of literalHostDomains(rewrite.pattern)) {
        assert.equal(
          mitmCoversDomain(app.mitm, domain),
          true,
          `${app.id}: Rewrite 主机 ${domain} 未被 MITM 覆盖`,
        );
      }
    }
    for (const script of app.scripts) {
      compilePattern(script.pattern, `${app.id} Script`);
      assert.equal(Boolean(script.name?.trim()), true, `${app.id}: Script 缺少名称`);
      assert.equal(
        new Set(["router", "youtube"]).has(script.engine),
        true,
        `${script.name}: 只允许本仓库本地 router/youtube 引擎`,
      );
      assert.equal(
        new RegExp(script.pattern).test(script.sampleUrl),
        true,
        `${script.name}: 示例 URL 未命中模块 pattern`,
      );
      const sampleHost = new URL(script.sampleUrl).hostname;
      assert.equal(
        mitmCoversDomain(app.mitm, sampleHost),
        true,
        `${script.name}: 示例主机 ${sampleHost} 未被 MITM 覆盖`,
      );
      if (script.engine === "router") {
        const result = processResponse({ url: script.sampleUrl, body: "{}" });
        assert.notEqual(result.route, null, `${script.name}: 本地路由未接管示例 URL`);
      }
    }
  }

  for (const app of apps) {
    assert.equal(
      typeof app.unified,
      "boolean",
      `${app.id}: 组件必须显式声明是否并入统一模块`,
    );
  }
}

async function validateManifest(actualFiles) {
  const manifestPath = path.join(DIST, "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  assert.equal(manifest.version, project.version);
  assert.equal(manifest.ref, "main");
  assert.equal(manifest.unifiedModule, "BlockAd.Unified.sgmodule");

  const unifiedSections = splitSections(
    await readFile(path.join(DIST, manifest.unifiedModule), "utf8"),
  );
  assert.equal(
    manifest.unifiedSummary.rules,
    (unifiedSections.get("Rule") || []).length,
    "manifest 统一模块规则数不一致",
  );
  assert.equal(
    manifest.unifiedSummary.rewrites,
    (unifiedSections.get("URL Rewrite") || []).length,
    "manifest 统一模块 Rewrite 数不一致",
  );
  assert.equal(
    manifest.unifiedSummary.scripts,
    (unifiedSections.get("Script") || []).length,
    "manifest 统一模块脚本数不一致",
  );
  assert.equal(
    Number.isInteger(manifest.unifiedSummary.rulesDeduplicatedByAwa) &&
      manifest.unifiedSummary.rulesDeduplicatedByAwa > 0,
    true,
    "manifest 缺少 AWAvenue 规则去重统计",
  );

  const actualRelative = actualFiles
    .filter((file) => file !== manifestPath)
    .map((file) => posix(path.relative(DIST, file)))
    .sort((left, right) => left.localeCompare(right, "en"));
  const manifestRelative = manifest.files.map((file) => file.path);
  assert.deepEqual(manifestRelative, actualRelative, "manifest 文件清单与磁盘不一致");

  for (const entry of manifest.files) {
    const file = path.join(DIST, entry.path);
    const content = await readFile(file);
    assert.equal((await stat(file)).size, entry.bytes, `${entry.path}: 字节数不一致`);
    assert.equal(sha256(content), entry.sha256, `${entry.path}: SHA-256 不一致`);
  }

  assert.equal(
    manifest.awaRuleSnapshot.excludedCount,
    awaExclusions.length,
    "AWAvenue 排除数不一致",
  );
  assert.equal(
    manifest.awaRuleSnapshot.outputRuleCount,
    manifest.awaRuleSnapshot.sourceRuleCount - awaExclusions.length,
    "AWAvenue 过滤计数不闭合",
  );
}

async function validateAwa() {
  const source = await readFile(
    path.join(DIST, "rules", "AWAvenue-Ads-Rule.list"),
    "utf8",
  );
  const lines = new Set(source.split(/\r?\n/).map((line) => line.trim()));
  const rules = [...lines].filter((line) => line && !line.startsWith("#"));
  assert.equal(
    rules.length,
    source
      .split(/\r?\n/)
      .filter((line) => line.trim() && !line.trim().startsWith("#")).length,
    "AWAvenue 发布列表存在重复规则",
  );
  for (const rule of rules) {
    assert.match(
      rule,
      /^(?:DOMAIN|DOMAIN-SUFFIX|DOMAIN-KEYWORD),[^,\s]+$/,
      `AWAvenue 发布列表含不支持或无效规则: ${rule}`,
    );
  }
  assert.equal(
    rules.some((rule) => rule.startsWith("IP-")),
    false,
    "AWAvenue 发布列表不应包含 IP/CIDR",
  );
  for (const [rule] of awaExclusions) {
    assert.equal(lines.has(rule), false, `高误伤规则仍在发布列表: ${rule}`);
  }
  assert.match(source, /^# BlockAd safety-filtered AWAvenue snapshot/);

  const unifiedSource = await readFile(
    path.join(DIST, "BlockAd.Unified.sgmodule"),
    "utf8",
  );
  const unifiedRules = splitSections(unifiedSource).get("Rule") || [];
  assert.equal(
    unifiedRules.some((rule) => rule.startsWith("RULE-SET,")),
    true,
    "统一模块缺少 AWAvenue RULE-SET",
  );
  for (const rule of unifiedRules.filter((line) => !line.startsWith("RULE-SET,"))) {
    assert.equal(
      lines.has(rule.replace(/,REJECT$/, "")),
      false,
      `统一模块重复包含 AWAvenue 已覆盖规则: ${rule}`,
    );
  }
}

async function validateScripts() {
  const routerSource = await readFile(
    path.join(DIST, "scripts", "blockad-router.js"),
    "utf8",
  );
  const sourceRouter = await readFile(
    path.join(ROOT, "src", "blockad-router.cjs"),
    "utf8",
  );
  assert.equal(routerSource, sourceRouter, "发布 router 与源码不一致");

  const youtubeSource = await readFile(
    path.join(DIST, "scripts", "youtube-response.js"),
    "utf8",
  );
  for (const [name, source] of [
    ["blockad-router.js", routerSource],
    ["youtube-response.js", youtubeSource],
  ]) {
    assert.doesNotThrow(() => new vm.Script(source, { filename: name }), `${name} 语法错误`);
    for (const pattern of [
      /\$httpClient(?:\.|\[)(?:get|post|put|delete|\w+\])/,
      /\$task\.fetch\s*\(/,
      /init-stream\.maasea\.workers\.dev/,
    ]) {
      assert.equal(pattern.test(source), false, `${name} 含外部请求能力: ${pattern}`);
    }
  }
}

async function validateSecrets(actualFiles) {
  const secretPatterns = [
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/,
    /\b(?:Authorization|Cookie)\s*[:=]\s*["'][^"']{12,}["']/i,
    /[A-Za-z]:\\Users\\[^\\]+\\/i,
  ];
  for (const file of actualFiles) {
    const source = await readFile(file, "utf8");
    for (const pattern of secretPatterns) {
      assert.equal(pattern.test(source), false, `${posix(path.relative(ROOT, file))}: 疑似敏感数据`);
    }
  }
}

async function validateOneClickInstall() {
  const install = await readFile(path.join(ROOT, "docs", "install.html"), "utf8");
  const landing = await readFile(path.join(ROOT, "docs", "index.html"), "utf8");
  const readme = await readFile(path.join(ROOT, "README.md"), "utf8");

  assert.equal(install.includes(STABLE_MODULE_URL), true, "安装页缺少稳定模块 URL");
  assert.match(
    install,
    /shadowrocket:\/\/install\?module=\$\{moduleUrl\}/,
    "安装页缺少 Shadowrocket module URL Scheme",
  );
  assert.equal(
    /(?:location\.search|URLSearchParams|document\.referrer)/.test(install),
    false,
    "安装页不得从请求或来源中读取跳转目标",
  );
  assert.equal(/<script[^>]+\bsrc=/i.test(install), false, "安装页不得加载外部脚本");
  assert.equal(/\bfetch\s*\(/.test(install), false, "安装页不得发起外部请求");
  assert.match(landing, /href="\.\/install\.html"/, "GitHub Pages 首页缺少一键导入入口");
  assert.equal(landing.includes(STABLE_MODULE_URL), true, "GitHub Pages 首页缺少稳定 URL");
  assert.match(
    readme,
    /https:\/\/sterilitzia02\.github\.io\/Blockad-sr-my\/install\.html/,
    "README 缺少 GitHub Pages 一键导入按钮",
  );
}

async function main() {
  const requiredApps = new Set([
    "general-networks",
    "qq",
    "wechat",
    "jd",
    "taobao-tmall",
    "zhihu",
    "weibo",
    "xianyu",
    "youtube",
    "baidu-netdisk",
    "douyin",
    "fanqie",
    "thunder",
    "amap",
    "privacy-pcdn",
  ]);
  const appIds = apps.map((app) => app.id);
  const uniqueAppIds = new Set(appIds);
  assert.equal(uniqueAppIds.size, appIds.length, "App 组件 id 不得重复");
  for (const requiredApp of requiredApps) {
    assert.equal(
      uniqueAppIds.has(requiredApp),
      true,
      `缺少提示要求的核心组件: ${requiredApp}`,
    );
  }

  validateConfigPatterns();
  const actualFiles = await walk(DIST);
  const modules = actualFiles.filter((file) => file.endsWith(".sgmodule"));
  assert.equal(modules.length, apps.length + optionalExtras.length + 1);
  assert.equal(
    uniqueAppIds.has("bilibili"),
    false,
    "Bilibili 由用户专用规则接管，不得生成 App 组件",
  );
  for (const file of actualFiles.filter((item) =>
    /\.(?:sgmodule|js|list|json)$/i.test(item),
  )) {
    const source = await readFile(file, "utf8");
    assert.equal(
      /bilibili|哔哩哔哩/i.test(source),
      false,
      `${posix(path.relative(ROOT, file))}: 发行运行文件不得包含 Bilibili 内容`,
    );
  }
  for (const module of modules) {
    validateModule(
      await readFile(module, "utf8"),
      posix(path.relative(ROOT, module)),
    );
  }

  await validateManifest(actualFiles);
  await validateAwa();
  await validateScripts();
  await validateSecrets(actualFiles);
  await validateOneClickInstall();

  console.log(
    JSON.stringify(
      {
        status: "ok",
        modules: modules.length,
        files: actualFiles.length,
        appComponents: apps.length,
        optionalExtras: optionalExtras.length,
        awaExcludedHighRiskRules: awaExclusions.length,
      },
      null,
      2,
    ),
  );
}

await main().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});

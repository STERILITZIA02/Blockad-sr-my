import { createHash } from "node:crypto";
import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { apps, optionalExtras, project } from "../config/apps.mjs";
import { awaExclusions } from "../config/awa-exclusions.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const EXPECTED_YOUTUBE_SHA256 =
  "f98483d5f5017514f82502253c0db5ce2d4ffb7839887aa2cadc22666f5a7f12";
const EXPECTED_AWA_SHA256 =
  "7a85b45b3e087d257c7eee2316f34013fadd353d716204444d98a231034236c9";

function parseArgs(argv) {
  const result = {
    ref: project.defaultRef,
    out: "dist",
    stable: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--ref") {
      result.ref = argv[++index];
    } else if (argument === "--out") {
      result.out = argv[++index];
    } else if (argument === "--stable") {
      result.stable = true;
    } else {
      throw new Error(`未知构建参数: ${argument}`);
    }
  }

  if (!result.ref || !/^[A-Za-z0-9._/-]+$/.test(result.ref)) {
    throw new Error(`不安全或无效的 ref: ${result.ref}`);
  }
  if (!/^(?:dist|release\/v\d+\.\d+\.\d+)$/.test(result.out.replaceAll("\\", "/"))) {
    throw new Error(`输出目录只能是 dist 或 release/vX.Y.Z: ${result.out}`);
  }
  const releaseVersion = result.out.replaceAll("\\", "/").match(/^release\/(v\d+\.\d+\.\d+)$/);
  if (releaseVersion && result.ref !== releaseVersion[1]) {
    throw new Error(`固定版本目录 ${result.out} 必须使用同名 ref: ${releaseVersion[1]}`);
  }
  if (result.stable && !releaseVersion) {
    throw new Error("--stable 只能与 release/vX.Y.Z 输出目录一起使用");
  }

  return result;
}

function sha256(bufferOrText) {
  return createHash("sha256").update(bufferOrText).digest("hex");
}

function toPosix(value) {
  return value.replaceAll("\\", "/");
}

function assertInsideRoot(target) {
  const relative = path.relative(ROOT, target);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`拒绝操作仓库外或仓库根目录: ${target}`);
  }
}

function replaceSegment(source, startMarker, endMarker, replacement) {
  const start = source.indexOf(startMarker);
  if (start === -1) {
    throw new Error(`YouTube 补丁起点不存在: ${startMarker}`);
  }
  const end = source.indexOf(endMarker, start + startMarker.length);
  if (end === -1) {
    throw new Error(`YouTube 补丁终点不存在: ${endMarker}`);
  }
  return source.slice(0, start) + replacement + source.slice(end);
}

function replaceExactOnce(source, search, replacement) {
  const first = source.indexOf(search);
  const last = source.lastIndexOf(search);
  if (first === -1 || first !== last) {
    throw new Error(`YouTube 精确补丁匹配次数不是 1: ${search.slice(0, 80)}`);
  }
  return source.slice(0, first) + replacement + source.slice(first + search.length);
}

function patchYoutube(source) {
  if (sha256(source) !== EXPECTED_YOUTUBE_SHA256) {
    throw new Error("Maasea YouTube 上游快照 SHA-256 不匹配，拒绝静默构建");
  }

  let patched = source;

  patched = replaceSegment(
    patched,
    "function Si(l){",
    "function ce(",
    "function Si(l){}",
  );
  patched = replaceExactOnce(
    patched,
    "function Br(l,e){Ni(l),Si(l),Pi(l,e)}",
    "function Br(l,e){Ni(l),Pi(l,e)}",
  );
  patched = replaceSegment(
    patched,
    "function ji(l){",
    "function Vi(",
    "function ji(l){return{bodyChanged:!1,stateChanged:!1}}",
  );

  for (const route of [
    '{path:"get_setting",msgType:Qr,handler:ji},',
    '{path:"config",msgType:kr,handler:ri},',
    '{path:"log_event",msgType:kr,handler:ri}',
  ]) {
    patched = replaceExactOnce(patched, route, "");
  }
  patched = patched.replace(",];function ii(", "];function ii(");

  patched = replaceSegment(
    patched,
    "function li(l){",
    "var wc=",
    'function li(l){if(!l.dirty)return;let e=l.whiteNo.slice(-256),t=l.blackNo.slice(-256),n=l.whiteEml.slice(-128),i=l.blackEml.slice(-128),r={version:oi,whiteNo:e,blackNo:t,whiteEml:n,blackEml:i};F.setJSON(r,fe.advertiseInfo)}',
  );

  let disabledFetchMethods = 0;
  while (patched.includes("async fetch(e){")) {
    patched = replaceSegment(
      patched,
      "async fetch(e){",
      "done(e){",
      'async fetch(){throw new Error("BlockAd: network access disabled")}',
    );
    disabledFetchMethods += 1;
  }
  if (disabledFetchMethods !== 2) {
    throw new Error(`预期禁用 2 个通用网络方法，实际为 ${disabledFetchMethods}`);
  }

  const forbiddenFragments = [
    "$httpClient[",
    "$httpClient.get",
    "$task.fetch(",
    "pictureInPictureRender=me.create",
    "backgroundPlayerRender=ge.create",
    "backgroundPlayBackSettingRenderer:{backgroundPlayback:!0",
    '{path:"get_setting"',
    '{path:"config"',
    '{path:"log_event"',
    "init-stream.maasea.workers.dev",
  ];
  for (const fragment of forbiddenFragments) {
    if (patched.includes(fragment)) {
      throw new Error(`YouTube 安全补丁后仍含禁用片段: ${fragment}`);
    }
  }

  return [
    "// BlockAd safety patch: ad filtering and optional local UI cleanup only.",
    "// Removed PiP/background/download entitlement mutation, settings injection,",
    "// external network capability, config/log collection, and unbounded learned caches.",
    "// Upstream and license: THIRD_PARTY_NOTICES.md and third_party/maasea/LICENSE",
    patched,
  ].join("\n");
}

function filterAwa(source) {
  const exclusionMap = new Map(awaExclusions);
  if (exclusionMap.size !== awaExclusions.length) {
    throw new Error("AWAvenue 排除清单存在重复规则");
  }

  const matched = new Set();
  const outputLines = [];
  const sourceLines = source.replaceAll("\r\n", "\n").split("\n");
  for (const line of sourceLines) {
    const normalized = line.trim();
    if (exclusionMap.has(normalized)) {
      matched.add(normalized);
      continue;
    }
    outputLines.push(line);
  }

  const missing = [...exclusionMap.keys()].filter((rule) => !matched.has(rule));
  if (missing.length) {
    throw new Error(
      `AWAvenue 排除项未命中固定快照，拒绝静默漂移:\n${missing.join("\n")}`,
    );
  }

  const exclusions = [...exclusionMap.entries()].map(([rule, reason]) => ({
    rule,
    reason,
  }));
  const content = [
    "# BlockAd safety-filtered AWAvenue snapshot",
    `# Excluded entries: ${exclusions.length}`,
    "# Details: AWAvenue-Ads-Rule.exclusions.json",
    "# Source is pinned and preserved verbatim under third_party/awa/.",
    "",
    ...outputLines,
  ].join("\n");

  return {
    content,
    exclusions,
    sourceRuleCount: sourceLines.filter((line) => /^(?:DOMAIN|IP-CIDR)/.test(line)).length,
    outputRuleCount: outputLines.filter((line) => /^(?:DOMAIN|IP-CIDR)/.test(line)).length,
  };
}

function formatRewrite(rewrite) {
  if (rewrite.action.startsWith("reject")) {
    return `${rewrite.pattern} - ${rewrite.action}`;
  }
  return `${rewrite.pattern} ${rewrite.action}`;
}

function formatScript(script, context) {
  const scriptFiles = {
    router: "blockad-router.js",
    youtube: "youtube-response.js",
  };
  const scriptFile = scriptFiles[script.engine];
  if (!scriptFile) {
    throw new Error(`未知本地脚本引擎: ${script.engine}`);
  }
  const parts = [
    `type=http-response`,
    `pattern=${script.pattern}`,
    "requires-body=1",
    `max-size=${script.maxSize ?? 2097152}`,
  ];
  if (script.binaryBodyMode) {
    parts.push("binary-body-mode=1");
  }
  parts.push(
    `timeout=${script.engine === "router" ? 5 : 10}`,
  );
  parts.push(`script-path=${context.scriptBase}/${scriptFile}`);
  if (script.argument) {
    parts.push(`argument="${script.argument}"`);
  }
  return `${script.name} = ${parts.join(",")}`;
}

function moduleHeader(name, description, context) {
  return [
    `#!name=BlockAd · ${name}`,
    `#!desc=${description}`,
    "#!author=STERILITZIA02",
    `#!homepage=https://github.com/${project.owner}/${project.repository}`,
    `#!version=${project.version}`,
    `#!updated=${project.generatedOn}`,
    "#!category=去广告",
    "",
    "# GENERATED FILE — 请修改 config/apps.mjs / config/legacy-apps.mjs 后重新构建。",
    `# source-ref=${context.ref}`,
  ];
}

function renderSection(lines, title, records, formatter) {
  if (!records.length) {
    return;
  }
  lines.push("", `[${title}]`);
  let previousGroup = null;
  for (const record of records) {
    if (record.group && record.group !== previousGroup) {
      lines.push("", `# --- ${record.group} ---`);
      previousGroup = record.group;
    }
    if (record.comment) {
      lines.push(`# ${record.comment}`);
    }
    lines.push(formatter(record));
  }
}

function renderModule(module, context) {
  const lines = moduleHeader(module.name, module.description, context);
  const rules = module.rules.map((line) => ({
    line: line.replace("@AWA_RULE_URL@", context.awaRuleUrl),
  }));
  renderSection(lines, "Rule", rules, (record) => record.line);
  renderSection(lines, "URL Rewrite", module.rewrites, formatRewrite);
  renderSection(lines, "Script", module.scripts, (record) =>
    formatScript(record, context),
  );
  if (module.mitm.length) {
    lines.push("", "[MITM]", `hostname = %APPEND% ${module.mitm.join(", ")}`);
  }
  lines.push("");
  return lines.join("\n");
}

function buildUnified(awaRuleSet) {
  const result = {
    id: "unified",
    name: "统一稳定版",
    description:
      "Shadowrocket 优先的去广告统一模块；按精确接口持续过滤，失败时保留原响应。不要与 components 内模块重复启用。",
    rules: [],
    rewrites: [],
    scripts: [],
    mitm: [],
    rulesDeduplicatedByAwa: 0,
  };
  const seenRules = new Set();
  const seenAwaCoveredRules = new Set();
  const seenRewrites = new Map();
  const seenScripts = new Map();
  const seenMitm = new Set();

  for (const app of apps.filter((candidate) => candidate.unified)) {
    for (const rule of app.rules) {
      const awaRule = rule.replace(/,REJECT$/, "");
      if (!rule.startsWith("RULE-SET,") && awaRuleSet.has(awaRule)) {
        if (!seenAwaCoveredRules.has(rule)) {
          seenAwaCoveredRules.add(rule);
          result.rulesDeduplicatedByAwa += 1;
        }
        continue;
      }
      if (!seenRules.has(rule)) {
        seenRules.add(rule);
        result.rules.push({ line: rule, group: app.name });
      }
    }
    for (const rewrite of app.rewrites) {
      const existing = seenRewrites.get(rewrite.pattern);
      if (existing && existing.action !== rewrite.action) {
        throw new Error(
          `同一 URL Rewrite 有冲突动作: ${rewrite.pattern} (${existing.action} / ${rewrite.action})`,
        );
      }
      if (!existing) {
        const record = { ...rewrite, group: app.name };
        seenRewrites.set(rewrite.pattern, record);
        result.rewrites.push(record);
      }
    }
    for (const script of app.scripts) {
      const signature = JSON.stringify({
        engine: script.engine,
        maxSize: script.maxSize,
        binaryBodyMode: script.binaryBodyMode,
        argument: script.argument,
      });
      const existing = seenScripts.get(script.pattern);
      if (existing && existing.signature !== signature) {
        throw new Error(`同一 Script pattern 有冲突处理器: ${script.pattern}`);
      }
      if (!existing) {
        const record = { ...script, group: app.name };
        seenScripts.set(script.pattern, { signature, record });
        result.scripts.push(record);
      }
    }
    for (const hostname of app.mitm) {
      if (!seenMitm.has(hostname)) {
        seenMitm.add(hostname);
        result.mitm.push(hostname);
      }
    }
  }

  return result;
}

function renderUnified(module, context) {
  const lines = moduleHeader(module.name, module.description, context);
  const rules = module.rules.map((record) => ({
    ...record,
    line: record.line.replace("@AWA_RULE_URL@", context.awaRuleUrl),
  }));
  renderSection(lines, "Rule", rules, (record) => record.line);
  renderSection(lines, "URL Rewrite", module.rewrites, formatRewrite);
  renderSection(lines, "Script", module.scripts, (record) =>
    formatScript(record, context),
  );
  if (module.mitm.length) {
    lines.push(
      "",
      "[MITM]",
      "# 仅列出实际脚本或 HTTPS Rewrite 所需主机；不使用 IP、共享网段或全业务通配域。",
      `hostname = %APPEND% ${module.mitm.join(", ")}`,
    );
  }
  lines.push("");
  return lines.join("\n");
}

async function writeText(file, content) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content.replaceAll("\r\n", "\n"), "utf8");
}

async function copyReleaseFile(sourceRelative, destinationRelative, outDirectory) {
  const source = path.join(ROOT, sourceRelative);
  const destination = path.join(outDirectory, destinationRelative);
  await writeText(destination, await readFile(source, "utf8"));
}

async function stageReleaseDocumentation(outDirectory) {
  const releaseNotes = `docs/RELEASE_NOTES_v${project.version}.md`;
  const releaseFiles = [
    ["README.md", "README.md"],
    ["CHANGELOG.md", "CHANGELOG.md"],
    ["THIRD_PARTY_NOTICES.md", "THIRD_PARTY_NOTICES.md"],
    ["LICENSE", "LICENSE"],
    ["docs/INSTALL.md", "docs/INSTALL.md"],
    ["docs/index.html", "docs/index.html"],
    ["docs/install.html", "docs/install.html"],
    ["docs/.nojekyll", "docs/.nojekyll"],
    ["docs/COVERAGE.md", "docs/COVERAGE.md"],
    ["docs/LEGACY_AUDIT.md", "docs/LEGACY_AUDIT.md"],
    ["docs/FINAL_AUDIT.md", "docs/FINAL_AUDIT.md"],
    ["docs/ROLLBACK.md", "docs/ROLLBACK.md"],
    ["docs/APP_PARITY.md", "docs/APP_PARITY.md"],
    ["docs/ORIGINAL_MODULE_PARITY.md", "docs/ORIGINAL_MODULE_PARITY.md"],
    ["docs/UPSTREAM_RESEARCH.md", "docs/UPSTREAM_RESEARCH.md"],
    ["docs/REPRODUCIBILITY.md", "docs/REPRODUCIBILITY.md"],
    [releaseNotes, releaseNotes],
    ["audit/legacy-inventory.json", "audit/legacy-inventory.json"],
    ["audit/app-parity.json", "audit/app-parity.json"],
    ["third_party/awa/LICENSE", "licenses/AWAvenue-GPL-3.0.txt"],
    ["third_party/maasea/LICENSE", "licenses/Maasea-Apache-2.0.txt"],
    ["package.json", "source/package.json"],
    ["package-lock.json", "source/package-lock.json"],
    ["README.md", "source/README.md"],
    ["CHANGELOG.md", "source/CHANGELOG.md"],
    ["THIRD_PARTY_NOTICES.md", "source/THIRD_PARTY_NOTICES.md"],
    ["LICENSE", "source/LICENSE"],
    ["config/apps.mjs", "source/config/apps.mjs"],
    ["config/legacy-apps.mjs", "source/config/legacy-apps.mjs"],
    ["config/parity-decisions.mjs", "source/config/parity-decisions.mjs"],
    ["config/awa-exclusions.mjs", "source/config/awa-exclusions.mjs"],
    ["audit/legacy-catalog.manual.json", "source/audit/legacy-catalog.manual.json"],
    ["audit/legacy-inventory.json", "source/audit/legacy-inventory.json"],
    ["audit/app-parity.json", "source/audit/app-parity.json"],
    ["scripts/audit-legacy.mjs", "source/scripts/audit-legacy.mjs"],
    ["scripts/audit-parity.mjs", "source/scripts/audit-parity.mjs"],
    ["scripts/build.mjs", "source/scripts/build.mjs"],
    ["scripts/check.mjs", "source/scripts/check.mjs"],
    ["scripts/check-release.mjs", "source/scripts/check-release.mjs"],
    ["scripts/check-links.mjs", "source/scripts/check-links.mjs"],
    ["scripts/package-release.ps1", "source/scripts/package-release.ps1"],
    ["src/blockad-router.cjs", "source/src/blockad-router.cjs"],
    ["test/router.test.mjs", "source/test/router.test.mjs"],
    ["docs/INSTALL.md", "source/docs/INSTALL.md"],
    ["docs/index.html", "source/docs/index.html"],
    ["docs/install.html", "source/docs/install.html"],
    ["docs/.nojekyll", "source/docs/.nojekyll"],
    ["docs/COVERAGE.md", "source/docs/COVERAGE.md"],
    ["docs/LEGACY_AUDIT.md", "source/docs/LEGACY_AUDIT.md"],
    ["docs/FINAL_AUDIT.md", "source/docs/FINAL_AUDIT.md"],
    ["docs/ROLLBACK.md", "source/docs/ROLLBACK.md"],
    ["docs/APP_PARITY.md", "source/docs/APP_PARITY.md"],
    [
      "docs/ORIGINAL_MODULE_PARITY.md",
      "source/docs/ORIGINAL_MODULE_PARITY.md",
    ],
    ["docs/UPSTREAM_RESEARCH.md", "source/docs/UPSTREAM_RESEARCH.md"],
    ["docs/REPRODUCIBILITY.md", "source/docs/REPRODUCIBILITY.md"],
    [releaseNotes, `source/${releaseNotes}`],
    [
      "third_party/awa/AWAvenue-Ads-Rule-Surge-RULE-SET.list",
      "source/third_party/awa/AWAvenue-Ads-Rule-Surge-RULE-SET.list",
    ],
    ["third_party/awa/LICENSE", "source/third_party/awa/LICENSE"],
    [
      "third_party/maasea/youtube.response.js",
      "source/third_party/maasea/youtube.response.js",
    ],
    ["third_party/maasea/LICENSE", "source/third_party/maasea/LICENSE"],
  ];
  for (const [source, destination] of releaseFiles) {
    await copyReleaseFile(source, destination, outDirectory);
  }
}

async function walkFiles(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      output.push(...(await walkFiles(absolute)));
    } else if (entry.isFile()) {
      output.push(absolute);
    }
  }
  return output;
}

async function build() {
  const options = parseArgs(process.argv.slice(2));
  const outRelative = toPosix(options.out);
  const outDirectory = path.resolve(ROOT, options.out);
  assertInsideRoot(outDirectory);

  await rm(outDirectory, { recursive: true, force: true });
  await mkdir(outDirectory, { recursive: true });

  const rawBase = `https://raw.githubusercontent.com/${project.owner}/${project.repository}/${options.ref}/${outRelative}`;
  const context = {
    ref: options.ref,
    scriptBase: `${rawBase}/scripts`,
    awaRuleUrl: `${rawBase}/rules/AWAvenue-Ads-Rule.list`,
  };

  const awaSource = await readFile(
    path.join(ROOT, "third_party", "awa", "AWAvenue-Ads-Rule-Surge-RULE-SET.list"),
  );
  if (sha256(awaSource) !== EXPECTED_AWA_SHA256) {
    throw new Error("AWAvenue 上游快照 SHA-256 不匹配，拒绝静默构建");
  }
  const awaFiltered = filterAwa(awaSource.toString("utf8"));
  const awaRuleSet = new Set(
    awaFiltered.content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => /^(?:DOMAIN|DOMAIN-SUFFIX|DOMAIN-KEYWORD),/.test(line)),
  );
  await writeText(
    path.join(outDirectory, "rules", "AWAvenue-Ads-Rule.list"),
    awaFiltered.content,
  );
  await writeText(
    path.join(outDirectory, "rules", "AWAvenue-Ads-Rule.exclusions.json"),
    `${JSON.stringify(
      {
        upstream: {
          repository: "TG-Twilight/AWAvenue-Ads-Rule",
          commit: "d77f249050b440989cc9a640eabdb18573dc7c90",
          sha256: EXPECTED_AWA_SHA256,
          ruleCount: awaFiltered.sourceRuleCount,
        },
        excludedCount: awaFiltered.exclusions.length,
        outputRuleCount: awaFiltered.outputRuleCount,
        exclusions: awaFiltered.exclusions,
      },
      null,
      2,
    )}\n`,
  );

  const routerSource = await readFile(
    path.join(ROOT, "src", "blockad-router.cjs"),
    "utf8",
  );
  await writeText(
    path.join(outDirectory, "scripts", "blockad-router.js"),
    routerSource,
  );

  const youtubeSource = await readFile(
    path.join(ROOT, "third_party", "maasea", "youtube.response.js"),
    "utf8",
  );
  await writeText(
    path.join(outDirectory, "scripts", "youtube-response.js"),
    patchYoutube(youtubeSource),
  );

  for (const app of apps) {
    await writeText(
      path.join(outDirectory, "components", `${app.id}.sgmodule`),
      renderModule(app, context),
    );
  }
  for (const extra of optionalExtras) {
    await writeText(
      path.join(outDirectory, "extras", `${extra.id}.sgmodule`),
      renderModule(extra, context),
    );
  }

  const unified = buildUnified(awaRuleSet);
  await writeText(
    path.join(outDirectory, "BlockAd.Unified.sgmodule"),
    renderUnified(unified, context),
  );

  const isRelease = outRelative.startsWith("release/");
  if (isRelease) {
    await stageReleaseDocumentation(outDirectory);
  }

  const files = (await walkFiles(outDirectory))
    .filter(
      (file) =>
        path.basename(file) !== "manifest.json" &&
        path.basename(file) !== "SHA256SUMS.txt",
    )
    .sort((left, right) => left.localeCompare(right, "en"));
  const manifestFiles = [];
  for (const file of files) {
    const content = await readFile(file);
    manifestFiles.push({
      path: toPosix(path.relative(outDirectory, file)),
      bytes: (await stat(file)).size,
      sha256: sha256(content),
    });
  }

  const manifest = {
    schemaVersion: 1,
    project: `${project.owner}/${project.repository}`,
    version: project.version,
    ref: options.ref,
    generatedOn: project.generatedOn,
    unifiedModule: "BlockAd.Unified.sgmodule",
    awaRuleSnapshot: {
      upstreamCommit: "d77f249050b440989cc9a640eabdb18573dc7c90",
      upstreamSha256: EXPECTED_AWA_SHA256,
      sourceRuleCount: awaFiltered.sourceRuleCount,
      excludedCount: awaFiltered.exclusions.length,
      outputRuleCount: awaFiltered.outputRuleCount,
    },
    unifiedSummary: {
      rules: unified.rules.length,
      rulesDeduplicatedByAwa: unified.rulesDeduplicatedByAwa,
      rewrites: unified.rewrites.length,
      scripts: unified.scripts.length,
      mitmHosts: unified.mitm.length,
    },
    components: apps.map(({ id, name, description, unified: enabledByDefault }) => ({
      id,
      name,
      description,
      enabledByDefault,
      path: `components/${id}.sgmodule`,
    })),
    extras: optionalExtras.map(({ id, name, description }) => ({
      id,
      name,
      description,
      enabledByDefault: false,
      path: `extras/${id}.sgmodule`,
    })),
    files: manifestFiles,
  };
  await writeText(
    path.join(outDirectory, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  if (isRelease) {
    const checksumFiles = (await walkFiles(outDirectory))
      .filter((file) => path.basename(file) !== "SHA256SUMS.txt")
      .sort((left, right) => left.localeCompare(right, "en"));
    const checksums = [];
    for (const file of checksumFiles) {
      checksums.push(
        `${sha256(await readFile(file))}  ${toPosix(path.relative(outDirectory, file))}`,
      );
    }
    await writeText(
      path.join(outDirectory, "SHA256SUMS.txt"),
      `${checksums.join("\n")}\n`,
    );
  }

  if (options.stable) {
    const stableModule = path.join(ROOT, "stable", "BlockAd.Unified.sgmodule");
    assertInsideRoot(stableModule);
    await mkdir(path.dirname(stableModule), { recursive: true });
    await copyFile(
      path.join(outDirectory, "BlockAd.Unified.sgmodule"),
      stableModule,
    );
  }

  console.log(
    JSON.stringify(
      {
        output: outRelative,
        version: project.version,
        ref: options.ref,
        stableUpdated: options.stable,
        components: apps.length,
        extras: optionalExtras.length,
        files: manifestFiles.length + 1 + (isRelease ? 1 : 0),
        unifiedRules: unified.rules.length,
        unifiedRulesDeduplicatedByAwa: unified.rulesDeduplicatedByAwa,
        unifiedRewrites: unified.rewrites.length,
        unifiedScripts: unified.scripts.length,
        unifiedMitmHosts: unified.mitm.length,
      },
      null,
      2,
    ),
  );
}

await build();

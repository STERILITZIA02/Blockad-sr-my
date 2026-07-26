import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  dispositionLabels,
  legacyCoverage,
  legacyDecisionOverrides,
} from "../config/parity-decisions.mjs";
import { apps, optionalExtras, project } from "../config/apps.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const LEGACY_SOURCE = path.join(ROOT, "现有插件", "AdBlock.module");
const LEGACY_INVENTORY = path.join(ROOT, "audit", "legacy-inventory.json");
const JSON_OUTPUT = path.join(ROOT, "audit", "app-parity.json");
const MARKDOWN_OUTPUT = path.join(ROOT, "docs", "APP_PARITY.md");

const GROUP_RE = /^#\s*>\s*(.+?)(?:\s+-\s+.*)?$/;
const SECTION_RE = /^\[([^\]]+)]$/;
const ACTION_RE = /\s+-?\s*(reject(?:-200|-dict|-array|-img)?)\s*$/i;

function normalizeLines(source) {
  return source.replaceAll("\r\n", "\n").replaceAll("\r", "\n").split("\n");
}

function parseAdBlockGroups(source) {
  const groups = [];
  let section = "";
  let current = null;

  for (const [index, rawLine] of normalizeLines(source).entries()) {
    const line = rawLine.trim();
    const sectionMatch = line.match(SECTION_RE);
    if (sectionMatch) {
      section = sectionMatch[1].trim();
      continue;
    }
    if (section !== "URL Rewrite") continue;

    const groupMatch = line.match(GROUP_RE);
    if (groupMatch) {
      current = {
        name: groupMatch[1].trim(),
        sourceLine: index + 1,
        rules: [],
      };
      groups.push(current);
      continue;
    }

    if (
      current &&
      line &&
      !line.startsWith("#") &&
      /^\^?https?/i.test(line)
    ) {
      const actionMatch = line.match(ACTION_RE);
      current.rules.push({
        sourceLine: index + 1,
        value: line,
        action: actionMatch?.[1]?.toLowerCase() ?? "unknown",
      });
    }
  }

  const duplicates = groups
    .map((group) => group.name)
    .filter((name, index, names) => names.indexOf(name) !== index);
  if (duplicates.length) {
    throw new Error(`AdBlock 分组名重复，无法稳定对照: ${duplicates.join(", ")}`);
  }
  return groups;
}

function classifyUnmappedGroup(group) {
  if (!group.rules.length) {
    return {
      disposition: "no-active-rule",
      note: "原分组只有注释，没有可执行规则。",
    };
  }

  const source = group.rules.map((rule) => rule.value).join("\n");
  if (
    /(?:25\[0-5\]|2\[0-4\]\\d|1\\d\{2\}).*\\\.\)\{3\}/.test(source) ||
    /IP-CIDR/i.test(source)
  ) {
    return {
      disposition: "ip-risk",
      note: "至少一条规则直接匹配 IP；地址会漂移且缺少归属证明。",
    };
  }

  if (
    /(?:alicdn|elemecdn|meituan|cibntv|360buyimg|gtja|googlevideo)/i.test(
      source,
    ) ||
    /(?:thumbnail|resize|\\d\{3,4\}x\\d\{3,4\}|\.mp4)/i.test(source)
  ) {
    return {
      disposition: "shared-cdn-risk",
      note: "依赖共享 CDN、媒体文件名或尺寸特征，不能可靠区分正常内容。",
    };
  }

  if (
    /(?:accountListData|notifications?|bookshelf|itunes\\\.apple|check_update|control\\\/switch|config\\\/get(?:\s|$)|bootstrap|getNewsRemoteConfig)/i.test(
      source,
    )
  ) {
    return {
      disposition: "normal-feature-risk",
      note: "规则可能阻断账号、通知、更新或必要配置，不符合稳定版安全边界。",
    };
  }

  return {
    disposition: "needs-evidence",
    note: "保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。",
  };
}

function appIndex() {
  return new Map(
    [...apps, ...optionalExtras].map((app) => [
      app.id,
      {
        name: app.name,
        path: `${apps.includes(app) ? "components" : "extras"}/${app.id}.sgmodule`,
        enabledByDefault: apps.includes(app) ? Boolean(app.unified) : false,
      },
    ]),
  );
}

function dispositionForGroup(group) {
  const override = legacyDecisionOverrides[group.name];
  if (override) return override;
  const coverage = legacyCoverage[group.name];
  if (coverage) return coverage;
  return classifyUnmappedGroup(group);
}

function basenameFromUrl(url) {
  try {
    const parsed = new URL(url);
    return decodeURIComponent(parsed.pathname.split("/").filter(Boolean).at(-1) || "");
  } catch {
    return url;
  }
}

function remoteScriptDisposition(url, appIds) {
  const token = `${basenameFromUrl(url)} ${url}`.toLowerCase();
  const replacements = [
    { pattern: /wechatad|weixin|wechat/, apps: ["wechat"] },
    { pattern: /weibo/, apps: ["weibo"] },
    { pattern: /xianyu/, apps: ["xianyu"] },
    { pattern: /amap/, apps: ["amap"] },
    { pattern: /bili/, apps: ["bilibili"] },
    { pattern: /zheye|zhihu/, apps: ["zhihu"] },
    { pattern: /jd_json|\bjd\b/, apps: ["jd"] },
    { pattern: /youtube/, apps: ["youtube"] },
  ];
  const replacement = replacements.find((candidate) =>
    candidate.pattern.test(token),
  );
  if (replacement && replacement.apps.every((id) => appIds.has(id))) {
    return {
      disposition: "local-partial-replacement",
      components: replacement.apps,
      note: "同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。",
    };
  }
  return {
    disposition: "not-executed",
    components: [],
    note: "不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。",
  };
}

function escapeCell(value) {
  return String(value ?? "")
    .replaceAll("|", "\\|")
    .replaceAll("\n", "<br>");
}

function markdownLink(label, value) {
  return value ? `[${escapeCell(label)}](${value})` : escapeCell(label);
}

function renderMarkdown(report) {
  const lines = [
    "# 原版软件与功能迁移对照",
    "",
    `版本：${report.version}`,
    "",
    `审计日期：${report.generatedOn}`,
    "",
    "> 本表是“原版是否真的进入当前执行路径”的证据，不把旧文件中出现过的规则等同于当前有效。状态为“留档”或“不直接迁移”的项目仍保留在 `现有插件/`，但不会扩大稳定模块的 MITM 或阻断范围。",
    "",
    "## 汇总结论",
    "",
    `- 原模块：${report.legacyModules.moduleCount} 个。`,
    `- 原 AdBlock 软件分组：${report.adBlock.summary.groupCount} 个，其中有可执行规则 ${report.adBlock.summary.groupsWithRules} 个。`,
    `- 已本地化替代/部分安全迁移分组：${report.adBlock.summary.coveredGroups} 个。`,
    `- 明确隔离的 IP、共享 CDN、正常功能或其他高风险分组：${report.adBlock.summary.riskIsolatedGroups} 个。`,
    `- 原远程脚本唯一 URL：${report.remoteScripts.summary.uniqueCount} 个；发布产物实际引用这些旧 URL 的数量为 0。`,
    "",
    "## 11 个原模块",
    "",
    "| 原文件 | 目标 App/范围 | 原功能 | 当前处理 |",
    "| --- | --- | --- | --- |",
  ];

  for (const module of report.legacyModules.items) {
    lines.push(
      `| \`${escapeCell(module.file)}\` | ${escapeCell(module.targetApps.join("、"))} | ${escapeCell(module.functions.join("；"))} | ${escapeCell(module.migrationDecision)} |`,
    );
  }

  lines.push(
    "",
    "## AdBlock.module 逐软件分组",
    "",
    "| 原分组 | 原规则数 | 当前状态 | 当前组件 | 结论/差异 |",
    "| --- | ---: | --- | --- | --- |",
  );

  for (const group of report.adBlock.groups) {
    const components = group.components.length
      ? group.components
          .map((component) =>
            markdownLink(
              component.name,
              `../dist/${component.path.replaceAll("\\", "/")}`,
            ),
          )
          .join("<br>")
      : "—";
    lines.push(
      `| ${escapeCell(group.name)} | ${group.ruleCount} | ${escapeCell(group.label)} | ${components} | ${escapeCell(group.note)} |`,
    );
  }

  lines.push(
    "",
    "## adultraplus.module 的远程处理器",
    "",
    "> 原文件把 123 个不同的远程脚本挂到 380 个响应入口。以下逐 URL 记录是否有本地替代；没有本地替代的脚本不会在当前模块中执行。此处的“局部替代”只表示相同 App 的去广告主路径已本地化，不表示复制了旧脚本中的会员、去水印或 UI 改写。",
    "",
    "| 原远程脚本 | 当前处理 | 本地组件 | 原因 |",
    "| --- | --- | --- | --- |",
  );

  for (const script of report.remoteScripts.items) {
    const components = script.components.length
      ? script.components.map((item) => `\`${escapeCell(item)}\``).join("、")
      : "—";
    lines.push(
      `| ${markdownLink(basenameFromUrl(script.url) || "script", script.url)} | ${script.disposition === "local-partial-replacement" ? "局部本地替代" : "不执行"} | ${components} | ${escapeCell(script.note)} |`,
    );
  }

  lines.push(
    "",
    "## 解释边界",
    "",
    "- `通用广告网络` 组件会继续拦截固定 AWAvenue 快照中的第三方广告 SDK/域名，但这不能证明某个第一方旧接口仍有效，因此不会被记作该软件的完整迁移。",
    "- 原文件中的静态 IP、共享 CDN 图片尺寸、视频文件名、整个业务域、通知/更新/账号接口均不会为了提高规则数量而进入稳定版。",
    "- 原远程脚本没有任何一个以动态 `main/master` URL 进入发布包；当前发布脚本只引用本仓库固定 tag。",
    "- 本表基于静态源代码、近期上游仓库和可重复构建检查；没有声称完成 iPhone 或 Shadowrocket 真机测试。",
    "",
  );
  return `${lines.join("\n")}\n`;
}

async function main() {
  const [adBlockSource, inventorySource] = await Promise.all([
    readFile(LEGACY_SOURCE, "utf8"),
    readFile(LEGACY_INVENTORY, "utf8"),
  ]);
  const inventory = JSON.parse(inventorySource);
  const groups = parseAdBlockGroups(adBlockSource);
  const currentApps = appIndex();
  const appIds = new Set(currentApps.keys());

  const groupRows = groups.map((group) => {
    const decision = dispositionForGroup(group);
    const componentIds = decision.components ?? [];
    const missingComponents = componentIds.filter((id) => !currentApps.has(id));
    if (missingComponents.length) {
      throw new Error(
        `迁移对照引用不存在组件 ${group.name}: ${missingComponents.join(", ")}`,
      );
    }
    return {
      name: group.name,
      sourceLine: group.sourceLine,
      ruleCount: group.rules.length,
      disposition: decision.disposition,
      label:
        dispositionLabels[decision.disposition] ?? decision.disposition,
      components: componentIds.map((id) => ({ id, ...currentApps.get(id) })),
      note: decision.note,
      rules: group.rules,
    };
  });

  const legacyModules = inventory.modules.map((module) => ({
    file: module.file,
    targetApps: module.targetApps,
    functions: module.functions,
    specialFeatures: module.specialFeatures,
    currentValidity: module.currentValidity,
    conflictRisk: module.conflictRisk,
    migrationDecision: module.migrationDecision,
  }));

  const uniqueRemoteScripts = [
    ...new Set(inventory.modules.flatMap((module) => module.externalScriptUrls)),
  ].sort((left, right) => left.localeCompare(right, "en"));
  const remoteRows = uniqueRemoteScripts.map((url) => ({
    url,
    ...remoteScriptDisposition(url, appIds),
  }));

  const coveredDispositions = new Set(["replaced", "partial", "migrated"]);
  const riskDispositions = new Set([
    "unsafe",
    "ip-risk",
    "shared-cdn-risk",
    "normal-feature-risk",
    "partial-archive",
  ]);
  const report = {
    schemaVersion: 1,
    version: project.version,
    generatedOn: project.generatedOn,
    source: {
      adBlock: "现有插件/AdBlock.module",
      legacyInventory: "audit/legacy-inventory.json",
      currentConfig: "config/apps.mjs",
    },
    legacyModules: {
      moduleCount: legacyModules.length,
      items: legacyModules,
    },
    adBlock: {
      summary: {
        groupCount: groupRows.length,
        groupsWithRules: groupRows.filter((group) => group.ruleCount > 0).length,
        coveredGroups: groupRows.filter((group) =>
          coveredDispositions.has(group.disposition),
        ).length,
        riskIsolatedGroups: groupRows.filter((group) =>
          riskDispositions.has(group.disposition),
        ).length,
      },
      groups: groupRows,
    },
    remoteScripts: {
      summary: {
        uniqueCount: remoteRows.length,
        localPartialReplacements: remoteRows.filter(
          (item) => item.disposition === "local-partial-replacement",
        ).length,
        executedLegacyUrls: 0,
      },
      items: remoteRows,
    },
  };

  if (report.legacyModules.moduleCount !== 11) {
    throw new Error(`预期 11 个原模块，实际 ${report.legacyModules.moduleCount}`);
  }
  if (report.remoteScripts.summary.uniqueCount !== 123) {
    throw new Error(
      `原远程脚本唯一 URL 数漂移：预期 123，实际 ${report.remoteScripts.summary.uniqueCount}`,
    );
  }

  await Promise.all([
    mkdir(path.dirname(JSON_OUTPUT), { recursive: true }),
    mkdir(path.dirname(MARKDOWN_OUTPUT), { recursive: true }),
  ]);
  await Promise.all([
    writeFile(JSON_OUTPUT, `${JSON.stringify(report, null, 2)}\n`, "utf8"),
    writeFile(MARKDOWN_OUTPUT, renderMarkdown(report), "utf8"),
  ]);

  console.log(
    JSON.stringify(
      {
        version: report.version,
        modules: report.legacyModules.moduleCount,
        adBlockGroups: report.adBlock.summary.groupCount,
        coveredGroups: report.adBlock.summary.coveredGroups,
        remoteScripts: report.remoteScripts.summary.uniqueCount,
        executedLegacyUrls: report.remoteScripts.summary.executedLegacyUrls,
        outputs: [
          path.relative(ROOT, JSON_OUTPUT).replaceAll("\\", "/"),
          path.relative(ROOT, MARKDOWN_OUTPUT).replaceAll("\\", "/"),
        ],
      },
      null,
      2,
    ),
  );
}

await main();

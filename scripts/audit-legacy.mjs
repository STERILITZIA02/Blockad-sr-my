import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, "..");
const sourceDir = join(rootDir, "现有插件");
const manualCatalogPath = join(rootDir, "audit", "legacy-catalog.manual.json");
const outputPath = join(rootDir, "audit", "legacy-inventory.json");

const SECTION_RE = /^\[([^\]]+)]$/;
const METADATA_RE = /^#!\s*([^=]+?)\s*=\s*(.*)$/;
const SCRIPT_URL_RE = /script-path=(https?:\/\/[^,\s]+)/g;
const HTTP_URL_RE = /https?:\/\/[^\s,"']+/g;

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function normalizeLines(buffer) {
  return buffer.toString("utf8").replace(/\r/g, "").split("\n");
}

function isActiveLine(line) {
  const trimmed = line.trim();
  return trimmed.length > 0 && !trimmed.startsWith("#");
}

function isUnpinnedScriptUrl(url) {
  if (/gist\.githubusercontent\.com\/[^/]+\/[a-f0-9]+\/raw\//i.test(url)) {
    return !/\/raw\/[a-f0-9]{7,40}\//i.test(url);
  }

  if (
    /(?:raw\.githubusercontent\.com|github\.com\/[^/]+\/[^/]+\/raw)\//i.test(url)
  ) {
    return /\/(?:main|master|refs\/heads\/[^/]+)\//i.test(url);
  }

  return false;
}

function parseInterface(section, line) {
  const trimmed = line.trim();

  if (section === "Script") {
    const pattern = trimmed.match(/(?:^|,)pattern=([^,]+)/);
    if (pattern) return pattern[1].trim();

    const malformedPattern = trimmed.match(
      /(?:^|,)script-path=(\^https?:\\\/\\\/[^,]+)/,
    );
    return malformedPattern?.[1]?.trim() ?? null;
  }

  if (section === "MITM") {
    return null;
  }

  return trimmed.split(/\s+/)[0] ?? null;
}

function parseMitmHosts(line) {
  const equals = line.indexOf("=");
  if (equals === -1) return [];

  return line
    .slice(equals + 1)
    .replace(/^%APPEND%\s*/i, "")
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean);
}

function collectSignals({ section, line, lineNumber, file }) {
  const signals = [];
  const scriptPathCount = (line.match(/script-path=/g) ?? []).length;

  if (section === "Script" && scriptPathCount > 1) {
    signals.push({
      code: "duplicate-script-path-key",
      severity: "error",
      file,
      line: lineNumber,
      detail: "同一脚本入口出现多个 script-path=；首个值通常实际应为 pattern=。",
    });
  }

  if (line.includes("{{{")) {
    signals.push({
      code: "unexpanded-template",
      severity: "error",
      file,
      line: lineNumber,
      detail: "包含未展开的模板变量，不能作为普通 Shadowrocket 模块直接发布。",
    });
  }

  if (/\^ttps\?:/.test(line)) {
    signals.push({
      code: "scheme-typo",
      severity: "error",
      file,
      line: lineNumber,
      detail: "协议正则缺少 h，规则不会匹配 http/https。",
    });
  }

  if (section === "Rule" && /^DOMAIN,\*/i.test(line.trim())) {
    signals.push({
      code: "invalid-domain-wildcard",
      severity: "error",
      file,
      line: lineNumber,
      detail: "DOMAIN 规则使用 * 通配；应改为精确 DOMAIN 或 DOMAIN-SUFFIX。",
    });
  }

  if (
    section === "Rule" &&
    /^(?:DOMAIN-SUFFIX|DOMAIN-KEYWORD),(?:bytedance\.com|zijieapi),REJECT/i.test(
      line.trim(),
    )
  ) {
    signals.push({
      code: "overbroad-shared-domain",
      severity: "high",
      file,
      line: lineNumber,
      detail: "整域/关键词覆盖共享业务基础设施，可能误伤登录、配置、内容或安全接口。",
    });
  }

  if (section === "URL Rewrite" && /\/ws\/valueadded\/weather\b/.test(line)) {
    signals.push({
      code: "normal-feature-block",
      severity: "high",
      file,
      line: lineNumber,
      detail: "直接拒绝高德天气接口，属于正常功能误伤。",
    });
  }

  if (
    section === "URL Rewrite" &&
    /notifications\\\/v\\d\\\/count/.test(line)
  ) {
    signals.push({
      code: "notification-count-block",
      severity: "high",
      file,
      line: lineNumber,
      detail: "通知计数不是广告专用接口，可能破坏未读状态。",
    });
  }

  return signals;
}

async function parseModule(file, manual) {
  const path = join(sourceDir, file);
  const buffer = await readFile(path);
  const lines = normalizeLines(buffer);
  const metadata = {};
  const sectionCounts = {};
  const sectionLines = {};
  const externalScriptUrls = [];
  const allHttpUrls = [];
  const mitmHosts = [];
  const interfaces = [];
  const signals = [];
  let section = "Preamble";

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index];
    const line = rawLine.trim();
    const lineNumber = index + 1;
    const sectionMatch = line.match(SECTION_RE);

    if (sectionMatch) {
      section = sectionMatch[1].trim();
      sectionCounts[section] ??= 0;
      sectionLines[section] ??= [];
      continue;
    }

    if (section === "Preamble") {
      const metadataMatch = line.match(METADATA_RE);
      if (metadataMatch) {
        metadata[metadataMatch[1].trim().toLowerCase()] =
          metadataMatch[2].trim();
      }
    }

    if (!isActiveLine(line)) continue;

    sectionCounts[section] = (sectionCounts[section] ?? 0) + 1;
    sectionLines[section] ??= [];
    sectionLines[section].push({ line: lineNumber, value: line });

    const interfaceValue = parseInterface(section, line);
    if (interfaceValue) {
      interfaces.push({
        section,
        line: lineNumber,
        matcher: interfaceValue,
      });
    }

    if (section === "MITM") {
      mitmHosts.push(...parseMitmHosts(line));
    }

    for (const match of line.matchAll(SCRIPT_URL_RE)) {
      externalScriptUrls.push(match[1]);
    }

    for (const match of line.matchAll(HTTP_URL_RE)) {
      allHttpUrls.push(match[0]);
    }

    signals.push(
      ...collectSignals({
        section,
        line,
        lineNumber,
        file,
      }),
    );
  }

  const uniqueScriptUrls = [...new Set(externalScriptUrls)].sort();
  const unpinnedScriptUrls = uniqueScriptUrls.filter(isUnpinnedScriptUrl);

  return {
    file,
    sha256: sha256(buffer),
    bytes: buffer.length,
    lines: lines.length,
    metadata,
    sectionCounts,
    interfaceCount: interfaces.length,
    interfaces,
    mitmHostCount: mitmHosts.length,
    uniqueMitmHostCount: new Set(mitmHosts).size,
    mitmHosts,
    externalScriptReferenceCount: externalScriptUrls.length,
    uniqueExternalScriptCount: uniqueScriptUrls.length,
    externalScriptUrls: uniqueScriptUrls,
    unpinnedExternalScriptCount: unpinnedScriptUrls.length,
    unpinnedExternalScriptUrls: unpinnedScriptUrls,
    uniqueHttpUrlCount: new Set(allHttpUrls).size,
    signals,
    ...manual,
  };
}

function collectCrossModuleConflicts(modules) {
  const matchers = new Map();

  for (const module of modules) {
    for (const entry of module.interfaces) {
      const key = `${entry.section}\u0000${entry.matcher}`;
      const values = matchers.get(key) ?? [];
      values.push({
        file: module.file,
        line: entry.line,
      });
      matchers.set(key, values);
    }
  }

  return [...matchers.entries()]
    .filter(([, locations]) => new Set(locations.map((item) => item.file)).size > 1)
    .map(([key, locations]) => {
      const [section, matcher] = key.split("\u0000");
      return { section, matcher, locations };
    })
    .sort((left, right) =>
      `${left.section}:${left.matcher}`.localeCompare(
        `${right.section}:${right.matcher}`,
      ),
    );
}

async function main() {
  const manualCatalog = JSON.parse(await readFile(manualCatalogPath, "utf8"));
  const manualByFile = new Map(
    manualCatalog.map((item) => [item.file, item]),
  );
  const files = (await readdir(sourceDir))
    .filter((file) => /\.(?:sg)?module$/i.test(file))
    .sort((left, right) => left.localeCompare(right, "en"));

  const missingManualEntries = files.filter((file) => !manualByFile.has(file));
  const missingSourceFiles = manualCatalog
    .map((item) => item.file)
    .filter((file) => !files.includes(file));

  if (missingManualEntries.length || missingSourceFiles.length) {
    throw new Error(
      [
        missingManualEntries.length
          ? `缺少人工审计条目: ${missingManualEntries.join(", ")}`
          : null,
        missingSourceFiles.length
          ? `人工审计引用不存在文件: ${missingSourceFiles.join(", ")}`
          : null,
      ]
        .filter(Boolean)
        .join("; "),
    );
  }

  const modules = [];
  for (const file of files) {
    modules.push(await parseModule(file, manualByFile.get(file)));
  }

  const report = {
    schemaVersion: 1,
    sourceDirectory: "现有插件",
    moduleCount: modules.length,
    totals: {
      bytes: modules.reduce((sum, item) => sum + item.bytes, 0),
      activeRewriteEntries: modules.reduce(
        (sum, item) => sum + (item.sectionCounts["URL Rewrite"] ?? 0),
        0,
      ),
      activeRuleEntries: modules.reduce(
        (sum, item) => sum + (item.sectionCounts.Rule ?? 0),
        0,
      ),
      activeScriptEntries: modules.reduce(
        (sum, item) => sum + (item.sectionCounts.Script ?? 0),
        0,
      ),
      activeHeaderRewriteEntries: modules.reduce(
        (sum, item) => sum + (item.sectionCounts["Header Rewrite"] ?? 0),
        0,
      ),
      externalScriptReferences: modules.reduce(
        (sum, item) => sum + item.externalScriptReferenceCount,
        0,
      ),
      uniqueExternalScripts: new Set(
        modules.flatMap((item) => item.externalScriptUrls),
      ).size,
      unpinnedExternalScripts: new Set(
        modules.flatMap((item) => item.unpinnedExternalScriptUrls),
      ).size,
      detectedSignals: modules.reduce(
        (sum, item) => sum + item.signals.length,
        0,
      ),
    },
    crossModuleExactMatcherConflicts: collectCrossModuleConflicts(modules),
    modules,
  };

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(
    [
      `legacy modules: ${report.moduleCount}`,
      `rewrite entries: ${report.totals.activeRewriteEntries}`,
      `rule entries: ${report.totals.activeRuleEntries}`,
      `script entries: ${report.totals.activeScriptEntries}`,
      `unique external scripts: ${report.totals.uniqueExternalScripts}`,
      `unpinned external scripts: ${report.totals.unpinnedExternalScripts}`,
      `detected signals: ${report.totals.detectedSignals}`,
      `cross-module exact matcher conflicts: ${report.crossModuleExactMatcherConflicts.length}`,
      `wrote: ${outputPath}`,
    ].join("\n"),
  );
}

await main();

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import vm from "node:vm";
import { project } from "../config/apps.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const TAG = `v${project.version}`;
const RELEASE = path.join(ROOT, "release", TAG);
const STABLE = path.join(ROOT, "stable", "BlockAd.Unified.sgmodule");
const ARTIFACTS = path.join(ROOT, "artifacts");
const PINNED_RAW_PREFIX =
  `https://raw.githubusercontent.com/${project.owner}/${project.repository}/` +
  `${TAG}/release/${TAG}/`;

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function posix(value) {
  return value.replaceAll("\\", "/");
}

async function walk(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      output.push(...(await walk(absolute)));
    } else if (entry.isFile()) {
      output.push(absolute);
    }
  }
  return output;
}

function safeRelative(base, relative, context) {
  assert.equal(path.isAbsolute(relative), false, `${context}: 不允许绝对路径`);
  const resolved = path.resolve(base, relative);
  const fromBase = path.relative(base, resolved);
  assert.equal(
    !fromBase || fromBase.startsWith("..") || path.isAbsolute(fromBase),
    false,
    `${context}: 路径越界`,
  );
  return resolved;
}

function parseChecksums(source, context) {
  const result = new Map();
  for (const line of source.trim().split(/\r?\n/)) {
    const match = line.match(/^([a-fA-F0-9]{64}) {2}(.+)$/);
    assert.ok(match, `${context}: 无效 SHA256SUMS 行: ${line}`);
    assert.equal(result.has(match[2]), false, `${context}: 重复路径 ${match[2]}`);
    result.set(match[2], match[1].toLowerCase());
  }
  return result;
}

function splitSections(source, relativePath) {
  const sections = new Map();
  let current = "Metadata";
  sections.set(current, []);
  for (const rawLine of source.replaceAll("\r\n", "\n").split("\n")) {
    const line = rawLine.trim();
    const header = line.match(/^\[([^\]]+)\]$/);
    if (header) {
      current = header[1];
      assert.equal(sections.has(current), false, `${relativePath}: section 重复`);
      sections.set(current, []);
    } else if (line && !line.startsWith("#")) {
      sections.get(current).push(line);
    }
  }
  return sections;
}

function validateModule(source, relativePath) {
  assert.match(source, /^#!name=BlockAd · /, `${relativePath}: 缺少 BlockAd name`);
  assert.match(
    source,
    new RegExp(`^#!version=${project.version.replaceAll(".", String.raw`\.`)}$`, "m"),
    `${relativePath}: 版本不匹配`,
  );
  assert.match(source, new RegExp(`^# source-ref=${TAG}$`, "m"));
  assert.equal(source.includes("{{{"), false, `${relativePath}: 未展开模板变量`);

  const sections = splitSections(source, relativePath);
  for (const line of sections.get("URL Rewrite") ?? []) {
    const [pattern] = line.split(/\s+/);
    assert.doesNotThrow(
      () => new RegExp(pattern),
      `${relativePath}: URL Rewrite 正则无效: ${pattern}`,
    );
  }
  for (const line of sections.get("Script") ?? []) {
    const pattern = line.match(/(?:^|,)pattern=([^,]+)/)?.[1];
    const scriptPath = line.match(/(?:^|,)script-path=([^,]+)/)?.[1];
    assert.ok(pattern, `${relativePath}: Script 缺少 pattern`);
    assert.ok(scriptPath, `${relativePath}: Script 缺少 script-path`);
    assert.doesNotThrow(
      () => new RegExp(pattern),
      `${relativePath}: Script 正则无效: ${pattern}`,
    );
    assert.ok(
      scriptPath.startsWith(PINNED_RAW_PREFIX),
      `${relativePath}: Script 未固定到 ${TAG}: ${scriptPath}`,
    );
    if (line.includes(",argument=")) {
      const argument = line.match(/,argument="(\{.*\})"$/);
      assert.ok(argument, `${relativePath}: Script argument 格式无效`);
      assert.doesNotThrow(
        () => JSON.parse(argument[1]),
        `${relativePath}: Script argument 不是有效 JSON`,
      );
    }
  }

  const rawUrls =
    source.match(
      /https:\/\/raw\.githubusercontent\.com\/STERILITZIA02\/Blockad-sr-my\/[^\s,",)]+/g,
    ) ?? [];
  for (const url of rawUrls) {
    assert.ok(url.startsWith(PINNED_RAW_PREFIX), `${relativePath}: 非固定 raw URL: ${url}`);
    const referenced = decodeURIComponent(url.slice(PINNED_RAW_PREFIX.length));
    const local = safeRelative(RELEASE, referenced, `${relativePath}: ${url}`);
    assert.equal(existsSync(local), true, `${relativePath}: 本仓库路径不存在: ${referenced}`);
  }
}

async function validateManifest(actualFiles) {
  const manifestPath = path.join(RELEASE, "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  assert.equal(manifest.version, project.version);
  assert.equal(manifest.ref, TAG);
  assert.equal(manifest.unifiedModule, "BlockAd.Unified.sgmodule");

  const expectedPaths = actualFiles
    .filter(
      (file) =>
        file !== manifestPath && path.basename(file) !== "SHA256SUMS.txt",
    )
    .map((file) => posix(path.relative(RELEASE, file)))
    .sort((left, right) => left.localeCompare(right, "en"));
  const manifestPaths = manifest.files.map((entry) => entry.path);
  assert.deepEqual(manifestPaths, expectedPaths, "release manifest 文件列表不一致");

  for (const entry of manifest.files) {
    const file = safeRelative(RELEASE, entry.path, `manifest: ${entry.path}`);
    const content = await readFile(file);
    assert.equal((await stat(file)).size, entry.bytes, `${entry.path}: 字节数不一致`);
    assert.equal(sha256(content), entry.sha256, `${entry.path}: manifest SHA-256 不一致`);
  }
}

async function validateReleaseChecksums(actualFiles) {
  const checksumPath = path.join(RELEASE, "SHA256SUMS.txt");
  const checksums = parseChecksums(
    await readFile(checksumPath, "utf8"),
    "release/SHA256SUMS.txt",
  );
  const expected = actualFiles
    .filter((file) => file !== checksumPath)
    .map((file) => posix(path.relative(RELEASE, file)))
    .sort((left, right) => left.localeCompare(right, "en"));
  assert.deepEqual([...checksums.keys()], expected, "release SHA256SUMS 文件列表不一致");
  for (const [relative, expectedHash] of checksums) {
    const file = safeRelative(RELEASE, relative, `release checksum: ${relative}`);
    assert.equal(sha256(await readFile(file)), expectedHash, `${relative}: SHA-256 不一致`);
  }
}

async function validateScripts() {
  for (const name of ["blockad-router.js", "youtube-response.js"]) {
    const file = path.join(RELEASE, "scripts", name);
    const source = await readFile(file, "utf8");
    assert.doesNotThrow(() => new vm.Script(source, { filename: name }));
    for (const pattern of [
      /\$httpClient(?:\.|\[)(?:get|post|put|delete|\w+\])/,
      /\$task\.fetch\s*\(/,
      /init-stream\.maasea\.workers\.dev/,
    ]) {
      assert.equal(pattern.test(source), false, `${name}: 含外部网络请求能力`);
    }
  }
}

async function validateAwaRules() {
  const source = await readFile(
    path.join(RELEASE, "rules", "AWAvenue-Ads-Rule.list"),
    "utf8",
  );
  const rules = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
  assert.equal(new Set(rules).size, rules.length, "AWAvenue 发布列表存在重复规则");
  for (const rule of rules) {
    assert.match(
      rule,
      /^(?:DOMAIN|DOMAIN-SUFFIX|DOMAIN-KEYWORD),[^,\s]+$/,
      `AWAvenue 发布列表含不支持或无效规则: ${rule}`,
    );
  }
}

async function validateSensitiveData(actualFiles) {
  const patterns = [
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/,
    /\b(?:Authorization|Cookie)\s*[:=]\s*["'][^"']{12,}["']/i,
    /[A-Za-z]:\\Users\\[^\\]+\\/i,
  ];
  for (const file of actualFiles) {
    const source = await readFile(file, "utf8");
    for (const pattern of patterns) {
      assert.equal(
        pattern.test(source),
        false,
        `${posix(path.relative(ROOT, file))}: 疑似敏感信息或本机绝对路径`,
      );
    }
  }
}

async function validateArtifacts(releaseUnified) {
  const artifactModule = path.join(ARTIFACTS, "BlockAd.Unified.sgmodule");
  const archive = path.join(ARTIFACTS, `BlockAd-SR-${TAG}.zip`);
  const sumsPath = path.join(ARTIFACTS, "SHA256SUMS.txt");
  for (const required of [artifactModule, archive, sumsPath]) {
    assert.equal(existsSync(required), true, `缺少发行资产: ${path.basename(required)}`);
  }
  assert.deepEqual(await readFile(artifactModule), releaseUnified, "发行模块与固定版本不一致");
  const checksums = parseChecksums(
    await readFile(sumsPath, "utf8"),
    "artifacts/SHA256SUMS.txt",
  );
  assert.deepEqual(
    [...checksums.keys()],
    [`BlockAd-SR-${TAG}.zip`, "BlockAd.Unified.sgmodule"],
    "Release 资产 SHA256SUMS 列表不一致",
  );
  for (const [relative, expectedHash] of checksums) {
    const file = safeRelative(ARTIFACTS, relative, `artifact checksum: ${relative}`);
    assert.equal(sha256(await readFile(file)), expectedHash, `${relative}: SHA-256 不一致`);
  }
}

async function main() {
  assert.equal(existsSync(RELEASE), true, `缺少固定版本目录: release/${TAG}`);
  const actualFiles = (await walk(RELEASE)).sort((left, right) =>
    left.localeCompare(right, "en"),
  );
  const modules = actualFiles.filter((file) => file.endsWith(".sgmodule"));
  assert.equal(modules.length, 19, "固定版本模块数量不一致");

  for (const module of modules) {
    validateModule(
      await readFile(module, "utf8"),
      posix(path.relative(ROOT, module)),
    );
  }
  await validateManifest(actualFiles);
  await validateReleaseChecksums(actualFiles);
  await validateScripts();
  await validateAwaRules();
  await validateSensitiveData(actualFiles);

  const releaseUnified = await readFile(
    path.join(RELEASE, "BlockAd.Unified.sgmodule"),
  );
  assert.deepEqual(await readFile(STABLE), releaseUnified, "stable 与固定版本模块不一致");
  await validateArtifacts(releaseUnified);

  console.log(
    JSON.stringify(
      {
        status: "ok",
        version: TAG,
        releaseFiles: actualFiles.length,
        modules: modules.length,
        pinnedRawPrefix: PINNED_RAW_PREFIX,
        stableSha256: sha256(releaseUnified),
        archiveSha256: sha256(
          await readFile(path.join(ARTIFACTS, `BlockAd-SR-${TAG}.zip`)),
        ),
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

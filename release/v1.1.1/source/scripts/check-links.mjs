import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { project } from "../config/apps.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const TAG = `v${project.version}`;
const REPOSITORY = `${project.owner}/${project.repository}`;
const RAW_ROOT = `https://raw.githubusercontent.com/${REPOSITORY}`;
const RELEASE_ROOT = `https://github.com/${REPOSITORY}/releases/download/${TAG}`;
const PAGES_ROOT = `https://${project.owner.toLowerCase()}.github.io/${project.repository}`;
const PRE_RELEASE = process.argv.includes("--pre-release");

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function download(url) {
  const response = await fetch(url, {
    headers: {
      accept: "application/octet-stream",
      "user-agent": "BlockAd-SR-release-link-check",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  });
  assert.equal(response.status, 200, `${url}: HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

async function compareRemote(url, localRelative) {
  const [remote, local] = await Promise.all([
    download(url),
    readFile(path.join(ROOT, localRelative)),
  ]);
  assert.deepEqual(remote, local, `${url}: 与 ${localRelative} 内容不一致`);
  return {
    url,
    bytes: remote.length,
    sha256: sha256(remote),
  };
}

async function main() {
  const checks = [];
  checks.push(
    await compareRemote(
      `${RAW_ROOT}/main/stable/BlockAd.Unified.sgmodule`,
      "stable/BlockAd.Unified.sgmodule",
    ),
  );
  for (const relative of [
    "BlockAd.Unified.sgmodule",
    "rules/AWAvenue-Ads-Rule.list",
    "scripts/blockad-router.js",
    "scripts/youtube-response.js",
  ]) {
    checks.push(
      await compareRemote(
        `${RAW_ROOT}/${TAG}/release/${TAG}/${relative}`,
        `release/${TAG}/${relative}`,
      ),
    );
  }

  checks.push(
    await compareRemote(
      "https://raw.githubusercontent.com/TG-Twilight/AWAvenue-Ads-Rule/" +
        "d77f249050b440989cc9a640eabdb18573dc7c90/Filters/" +
        "AWAvenue-Ads-Rule-Surge-RULE-SET.list",
      "third_party/awa/AWAvenue-Ads-Rule-Surge-RULE-SET.list",
    ),
  );
  checks.push(
    await compareRemote(
      "https://raw.githubusercontent.com/Maasea/sgmodule/" +
        "65075cdb388fc5e3094afd7e7314c67b243f3525/Script/Youtube/" +
        "youtube.response.js",
      "third_party/maasea/youtube.response.js",
    ),
  );

  const referencePage = (await download("https://yfamilys.com/shadowrocket")).toString(
    "utf8",
  );
  assert.match(referencePage, /Shadowrocket/i, "yfamilys 参考页内容异常");

  if (!PRE_RELEASE) {
    checks.push(
      await compareRemote(
        `${PAGES_ROOT}/install.html`,
        "docs/install.html",
      ),
    );
    checks.push(
      await compareRemote(
        `${PAGES_ROOT}/`,
        "docs/index.html",
      ),
    );
    for (const asset of [
      `BlockAd-SR-${TAG}.zip`,
      "BlockAd.Unified.sgmodule",
      "SHA256SUMS.txt",
    ]) {
      checks.push(
        await compareRemote(
          `${RELEASE_ROOT}/${asset}`,
          `artifacts/${asset}`,
        ),
      );
    }
  }

  console.log(
    JSON.stringify(
      {
        status: "ok",
        version: TAG,
        mode: PRE_RELEASE ? "pre-release" : "published-release",
        checkedFiles: checks.length,
        referencePage: "https://yfamilys.com/shadowrocket",
        checks,
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

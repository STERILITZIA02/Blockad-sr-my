# 构建与发行可复现性

版本：1.1.0

## 从 Git 标签完整复现

在 v1.1.0 标签的仓库根目录使用 Node.js 22 或更高版本：

```powershell
npm.cmd install
npm.cmd run verify
npm.cmd run release:build
```

`verify` 会重新读取 `现有插件/` 的 11 个审计原件、生成两份机器报告、构建所有
模块、检查正则/路径/重复项/敏感信息并运行本地响应测试。`release:build` 继续生成
固定标签目录、稳定入口、确定性 ZIP 和 SHA-256，再逐文件复核 manifest 与发行包。

## 从 GitHub Release ZIP 复现模块

正式 ZIP 故意不携带 11 个旧可执行模块，避免其中的动态远程脚本和高误伤规则被
误当作当前组件导入。它包含旧模块的完整哈希、接口、依赖、冲突和迁移结论 JSON，
以及当前模块构建所需的全部代码和固定第三方快照。

解压后进入 `source/`：

```powershell
npm.cmd install
npm.cmd run build
npm.cmd run check
npm.cmd test
```

上述命令不需要运行时 npm 依赖，也不会下载第三方脚本。`audit:legacy` 和完整
`verify` 需要仓库标签中的 `现有插件/` 原件，因此只在 Git 标签克隆中执行。

## 确定性保证

- 第三方 AWAvenue 与 Maasea 原始快照在构建前核对固定 SHA-256。
- 所有生成文本统一为 UTF-8/LF。
- ZIP 条目排序固定、时间戳固定，并拒绝绝对路径、盘符和 `..` 路径。
- 同一源码连续两次打包必须得到完全相同的 ZIP 与统一模块 SHA-256。
- `release/v1.1.0/SHA256SUMS.txt` 覆盖发行目录每个文件；GitHub Release 的
  `SHA256SUMS.txt` 覆盖 ZIP 和独立统一模块。

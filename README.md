# BlockAd SR My

面向 Shadowrocket 的统一去广告配置，由仓库中的 11 个历史模块审计、更新和
重新整合而成。

当前开发分支已经生成可复现的候选产物：

- 人工审计：[docs/LEGACY_AUDIT.md](docs/LEGACY_AUDIT.md)
- 覆盖与限制：[docs/COVERAGE.md](docs/COVERAGE.md)
- 机器清单：`audit/legacy-inventory.json`
- 候选统一模块：`dist/BlockAd.Unified.sgmodule`
- App 独立组件：`dist/components/`
- 可选便利模块：`dist/extras/`
- 完整验证：`npm.cmd run verify`

正式订阅链接、固定版本产物与 Release 会在发行审查完成后发布。不要直接启用
`现有插件/` 下的历史聚合模块；它们只用于审计、对照和回滚。

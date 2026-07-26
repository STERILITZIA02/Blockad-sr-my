# BlockAd SR My

面向 Shadowrocket 的统一去广告配置，当前正在从仓库中的 11 个历史模块进行
审计、更新和整合。

当前阶段完成了可复现的静态审计基线：

- 人工审计：[docs/LEGACY_AUDIT.md](docs/LEGACY_AUDIT.md)
- 机器清单：`audit/legacy-inventory.json`
- 重跑命令：`npm.cmd run audit:legacy`

稳定模块、安装链接和 Release 会在规则迁移、冲突审查和验证全部完成后发布。
在此之前请勿把历史聚合模块视为已验证的最终产物。

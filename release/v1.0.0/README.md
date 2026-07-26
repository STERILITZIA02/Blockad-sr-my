# BlockAd SR My

面向 Shadowrocket 的统一去广告配置。项目已把仓库中的 11 个历史模块逐项审计、
去重、修复并整合为本地执行、失败开放、可固定版本回滚的发行物。

## 直接订阅

稳定入口（内容只在正式发布时更新，内部脚本和规则固定到当前版本标签）：

```text
https://raw.githubusercontent.com/STERILITZIA02/Blockad-sr-my/main/stable/BlockAd.Unified.sgmodule
```

v1.0.0 不可变入口：

```text
https://raw.githubusercontent.com/STERILITZIA02/Blockad-sr-my/v1.0.0/release/v1.0.0/BlockAd.Unified.sgmodule
```

开发候选入口（会随 `main` 更新，不建议长期使用）：

```text
https://raw.githubusercontent.com/STERILITZIA02/Blockad-sr-my/main/dist/BlockAd.Unified.sgmodule
```

> GitHub 仓库必须保持 Public，Shadowrocket 才能在没有 GitHub 登录凭据的情况下
> 读取 raw 订阅。Private 仓库中的链接只适合仓库内校验，不能作为公开订阅。

## 安装

1. 在 Shadowrocket 中安装并信任 HTTPS 解密证书。
2. 添加上面的稳定模块 URL，启用模块后更新一次。
3. 首次启用后完全退出目标 App；若仍显示旧开屏，再清一次 App 自带缓存并重开。
4. 不要同时启用统一模块和 `components/` 中的重复组件。

完整步骤、故障处理和真机验收项见 [安装与验收指南](docs/INSTALL.md)。

## 产物

- 统一稳定模块：`stable/BlockAd.Unified.sgmodule`
- 固定版本发行目录：`release/v1.0.0/`
- App 独立组件：`release/v1.0.0/components/`
- 默认关闭的便利模块：`release/v1.0.0/extras/`
- 可复现构建输入与第三方原始快照：`release/v1.0.0/source/`
- 发行目录 SHA-256：`release/v1.0.0/SHA256SUMS.txt`
- GitHub Release 包：`BlockAd-SR-v1.0.0.zip`
- 11 个历史模块审计：[基线审计](docs/LEGACY_AUDIT.md)
- 最终迁移结论：[最终审计](docs/FINAL_AUDIT.md)
- App 覆盖与边界：[覆盖矩阵](docs/COVERAGE.md)
- 第三方来源与许可证：[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)

统一模块覆盖 QQ、微信、京东、淘宝/天猫、知乎、微博、闲鱼、YouTube、百度网盘、
抖音、番茄小说、迅雷、高德、Bilibili，以及历史聚合规则中的第三方广告 SDK 和
长尾 App。每个核心 App/功能也有独立组件，可用真实的模块启停方式作为开关。

## 设计边界

- 响应脚本不发起外部请求、不轮询、不上传 Cookie/token/设备信息。
- JSON 过滤器幂等；解析失败、超出大小或结构未知时返回原始响应。
- 不加入会员、付费、支付、账户权益或区域限制伪造。
- 不封禁全部 UDP/443、共享 CDN、大型 IP 网段或正常媒体域。
- YouTube 服务端拼接、第一方加密 feed、客户端原生广告和 App 本地旧缓存无法由
  Shadowrocket 低风险地保证全部清除。
- 本仓库完成了静态语法、正则、fixture、构建、哈希和发行包校验；没有声称完成
  iPhone 或 Shadowrocket 真机测试。

## 开发与复现

需要 Node.js 22 或更高版本；项目没有运行时 npm 依赖。

```powershell
npm.cmd install
npm.cmd run verify
npm.cmd run release:build
```

`verify` 会重建候选产物、审计 11 个历史模块、检查全部模块和运行响应过滤测试。
`release:build` 会从固定上游快照重建 v1.0.0、生成稳定入口、打包 ZIP 并复核全部
SHA-256。正式发布后，`npm.cmd run release:links` 会逐字校验稳定订阅、固定标签、
上游快照和全部 GitHub Release 资产。回滚方法见 [ROLLBACK.md](docs/ROLLBACK.md)。

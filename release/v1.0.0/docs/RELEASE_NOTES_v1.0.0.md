# BlockAd SR My v1.0.0

首个统一稳定版本。由仓库中 11 个历史 Shadowrocket 模块逐项审计、去重、修复和
迁移而来，第一支持目标为 Shadowrocket。

## 发行内容

- `BlockAd.Unified.sgmodule`：可直接导入的固定版本统一模块。
- `BlockAd-SR-v1.0.0.zip`：模块、组件、脚本、规则、文档、许可证和可复现构建输入
  完整包。
- `SHA256SUMS.txt`：Release 资产 SHA-256。

稳定订阅：

```text
https://raw.githubusercontent.com/STERILITZIA02/Blockad-sr-my/main/stable/BlockAd.Unified.sgmodule
```

固定版本订阅：

```text
https://raw.githubusercontent.com/STERILITZIA02/Blockad-sr-my/v1.0.0/release/v1.0.0/BlockAd.Unified.sgmodule
```

## 重点

- 覆盖 QQ、微信、京东、淘宝/天猫、知乎、微博、闲鱼、YouTube、百度网盘、
  抖音、番茄小说、迅雷、高德、Bilibili 及通用第三方广告 SDK。
- 16 个独立组件作为真实开关；2 个可能改变正常推荐/UI 的便利组件默认关闭。
- 所有正式脚本和规则由本仓库固定标签提供，不在运行时拉取第三方动态代码。
- 响应脚本失败开放、幂等、无外部请求、无轮询、无无限缓存。
- 排除会员/付费/账户权益伪造、大网段/共享 CDN/全 UDP 封禁。

## 自动检查

- 11/11 历史模块建立哈希、section、接口、MITM、依赖与风险清单。
- 统一模块及所有独立/可选模块 section 和正则可解析。
- 本仓库脚本、规则、模块路径和固定标签 URL 一一对应。
- 本地响应路由 fixture 全部通过。
- 固定上游 SHA-256、发行 manifest、发行目录 SHA-256 和 ZIP 内容全部复核。
- 扫描 Cookie、token、密钥、本机绝对路径和外部网络请求能力。

## 已知限制

- 未进行 iPhone 或 Shadowrocket 真机测试；需要按 `docs/INSTALL.md` 验收。
- YouTube 服务端拼接/客户端原生广告、第一方加密 feed、TLS 证书固定流量无法保证
  清除。
- 模块不能主动清除 App 已缓存的旧广告，首次启用可能需要一次性清缓存/重开。
- 精确字段优先意味着未标记的第一方运营卡片可能保留，以避免破坏登录、支付、
  消息、评论、上传、下载和播放。

完整迁移与风险说明见 `docs/FINAL_AUDIT.md` 和 `docs/COVERAGE.md`。

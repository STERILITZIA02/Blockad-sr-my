# BlockAd SR My v1.1.0

这是在 v1.0.0 核心稳定版之上的全软件覆盖审计版本。第一支持目标仍为
Shadowrocket；没有声称完成 iPhone 或 Shadowrocket 真机测试。

## 发行内容

- `BlockAd.Unified.sgmodule`：可直接导入的固定版本统一模块。
- `BlockAd-SR-v1.1.0.zip`：166 个独立组件、2 个默认关闭的便利组件、本地脚本、
  规则、审计报告、许可证和可复现构建输入。
- `SHA256SUMS.txt`：GitHub Release 资产 SHA-256。

稳定订阅：

```text
https://raw.githubusercontent.com/STERILITZIA02/Blockad-sr-my/main/stable/BlockAd.Unified.sgmodule
```

固定版本订阅：

```text
https://raw.githubusercontent.com/STERILITZIA02/Blockad-sr-my/v1.1.0/release/v1.1.0/BlockAd.Unified.sgmodule
```

## 相对 v1.0.0

- 将独立组件从 16 个扩展到 166 个，覆盖原 `AdBlock.module` 161 个软件组中的
  157 个安全迁移/替代路径；Bilibili 由用户专用规则接管，其余 3 个逐项解释。
- 腾讯新闻新增开屏与信息流 `adList/ad_list` 本地幂等过滤。
- 京东补回直播推广小窗和首页营销规则；淘宝补入营销 PopLayer。
- 微博补入实时/预加载开屏、第一方广告预加载和长文章 `uvead`。
- 抖音补入明确第一方广告路径；按用户要求从发行物中完全移除 Bilibili Rewrite、
  脚本、组件和 MITM 主机。
- 补回滴滴活动通知、车来了含广告通知、向日葵启动推广、乐橙广告推送和华住弹窗；
  共享推送通道及正常通知不拦截。
- 新增百度贴吧、小红书、美团/大众点评、什么值得买、喜马拉雅、酷安、夸克、
  滴滴、酷我、薄荷健康等混合响应的本地强信号过滤。
- 发布前补入优酷、爱阅书香、悦Me TV、搜狗输入法、超级课程表、等等付和直播吧，
  并纠正微信、追书神器的原版迁移映射。
- 统一模块对 AWAvenue 安全快照做语义相同规则去重，减少 46 条重复域匹配；
  各独立 App 组件仍可脱离统一模块单独使用。
- 发布包新增完整软件迁移表、123 个旧远程脚本处置表、上游固定点和机器审计 JSON。

## 安全边界

- 发布执行路径不引用任何原远程脚本 URL。
- 不加入会员、皮肤、倍速、付费、支付、地区、后台播放或下载权益修改。
- 不采用静态 IP、大网段、全部 UDP/443、共享播放 CDN 或业务整域封锁。
- 本地 JSON 处理器有大小、深度和对象数上限；解析失败、未知结构或超限时返回原文。
- YouTube 服务端拼接、未覆盖的第一方加密 feed、证书固定和 App 本地旧缓存仍
  可能无法处理。

## 验证

- 11/11 历史模块重新生成哈希、接口、MITM、依赖、冲突和风险清单。
- 161 个原软件组、123 个唯一远程脚本 URL 全部进入逐项迁移报告。
- 170 个 Shadowrocket 模块的 section、正则、脚本/规则路径和重复项检查通过。
- 13 个本地响应路由测试通过，包含营销通知正常字段保留、幂等、失败开放和
  超大响应回退。
- 固定上游 SHA-256、发行 manifest、发行目录 SHA-256、ZIP 路径和敏感信息扫描通过。

安装、缓存处理和真机验收项见 `docs/INSTALL.md`；回滚到 v1.0.0 见
`docs/ROLLBACK.md`。

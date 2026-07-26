# 上游检索与选择记录

审计日期：2026-07-26

本文件只记录本次实际访问和比较过的来源。近期提交或仍在被索引并不自动等于接口有效；进入稳定版还必须满足精确匹配、许可证可追溯、无外部运行时请求、无权益伪造和失败开放等条件。

## 用户提供的 Shadowrocket 索引

来源：<https://yfamilys.com/shadowrocket>

2026-07-26 对原始字节执行的只读快照检查：

| 模块 | HTTP | 字节 | SHA-256 | 与仓库原版的关键差异 |
| --- | ---: | ---: | --- | --- |
| `AdBlock.module` | 200 | 28,404 | `0ed4da35e625520612d91f6324b30e09105876a54584885ba1fe1909b25c1698` | 264 条 Rewrite 与仓库原版一致，仅旧 `#!url` 元数据不同 |
| `adultraplus.module` | 200 | 254,749 | `c88059f69bddb13e17b46d0b022d14d96abbd7346663316787edb4e948c3a7b6` | 当前标记为 202607；2,138 条 Rewrite、374 个脚本入口，较仓库原版有大量增删 |
| `gddt.module` | 200 | 1,611 | `7bd46bbd248c29d21bcf0b0f670ed0432f2f7c26bd37a2568c1667e4493b63eb` | 除旧 `#!url` 外与仓库原版一致，原有重复 `script-path=` 语法问题仍存在 |
| `YouTubeAd.sgmodule` | 200 | 1,459 | `0afef6ff0b966b94f7dea11d07a580e70383393bc1f4ac47b28258ce1afb717b` | 除旧 `#!url` 外与仓库原版一致，仍含模板变量，不能直接稳定订阅 |

选择结论：

- `AdBlock.module` 仍可作为“旧软件名—精确广告端点”的审计语料，但不能证明每个多年未变的接口仍有效。
- `adultraplus.module` 的更新说明证明聚合列表仍在变化，却不能解决动态远程脚本、许可证、重复处理器、误伤与供应链问题，因此不整体引用。
- `gddt.module` 和旧 YouTube 模块的结构性问题在当前索引仍未修复，本仓库继续采用本地修复/固定上游快照。

## 实际交叉检查的 GitHub 来源

| 来源 | 固定点 | 用途 | 采用边界 |
| --- | --- | --- | --- |
| `TG-Twilight/AWAvenue-Ads-Rule` | `d77f249050b440989cc9a640eabdb18573dc7c90` | 第三方广告网络与长尾 App 域名兜底 | 本地固定，移除 120 条 IP/共享域/高误伤项 |
| `Maasea/sgmodule` | `65075cdb388fc5e3094afd7e7314c67b243f3525` | YouTube Protobuf 广告节点过滤 | 本地固定并安全补丁；移除权益改写、外部请求和无界缓存 |
| `fmz200/wool_scripts` | `edbfac44522ef7f05718122ba95919bf2a1bdecc` | 对照核心 App 与小红书、菜鸟、高德、大众点评、什么值得买等近期接口 | 只迁移经过复核的广告专用端点；不动态引用 `main` 脚本 |
| `app2smile/rules` | `df6366a7024e0b3f0aa3510c5b791eea6f3cba89` | 对照百度贴吧与腾讯新闻当前响应结构 | 本地独立实现 JSON 强信号过滤；不采用静态 IP，未验证的 Protobuf 失败开放 |
| `Kokoryh/Sparkle` | `a26c3412a760fb8d7d4d1bcc124d126e19d630e5` | 核对 Bilibili `ViewReply.cm` 当前 Protobuf schema、gRPC framing 和 HTTP/2 MITM 要求 | 只采用 schema/协议事实；不复制 GPL 代码，不采用会员、投屏、背景、SponsorBlock、动态 UI 或外部请求逻辑 |
| `ddgksf2013/Scripts` | `97b8abea5ff52b5874c90d106d241e99894460d1` | 对照高德与微博接口 | 仅作端点事实参考，不复制或动态执行脚本 |
| `NobyDa/Script` | `7f8b309f8d943806b90c6ff25d8b8aa0c59b0c03` | 回溯微信公众号与 Bilibili 换区旧功能 | 微信逻辑独立实现；地区解锁会改写播放且不属于去广告，不并入稳定版 |
| `blackmatrix7/ios_rule_script` | `8f67b6419fe1cc2277e59347b0d59d26e160b023` | 对照悦Me TV、等等付、直播吧及高风险视频/金融旧规则 | 只取端点事实；混合响应改为本地强信号过滤，不复制脚本或宽泛 MITM |

另外读取了 `LOWERTOP/Shadowrocket` 当前手册对 Shadowrocket 2.2.81+ HTTP/2
MITM 的说明，用于评估 Bilibili gRPC 可行性；没有复制其模块代码。用户确认已有
专用规则后，本仓库发行物不再包含任何 Bilibili 入口。

详细许可证、完整提交和本地快照哈希见根目录 `THIRD_PARTY_NOTICES.md`。

## 核心 App 发布前二次核对

以下条目均在固定提交上逐文件读取，不以文件名或 README 声称代替接口审查。

| App | 对照文件/实现 | 本仓库最终选择 |
| --- | --- | --- |
| QQ / 腾讯新闻 | `TencentNews.sgmodule`、`app2smile/js/qq-news.js` | 新增当前 `getSplash/getBannerAds`，本地清空 `adList` 并移除 `widget_type=ad_list`；不拒绝新闻远程总配置、定位上报或正常栏目 |
| 微信 | `WeChatOfficialAccount.sgmodule` | 保留公众号 `getappmsgad` 的本地响应过滤，并新增 `cps_product_info` 空响应；朋友圈只拦广告专用素材域 |
| 京东 | `JD.com.sgmodule` | 保留启动/首页/订单容器的字段级过滤，补回 `getWidgetV1052` 直播推广小窗；拒绝上游 DNS、静态 IP、`mapi.m.jd.com` 整域封锁 |
| 淘宝 / 天猫 | `Taobao.sgmodule` | 保留开屏和广告服务，补入营销 `PopLayer` 模板；淘票票、飞猪由独立组件处理；不采用共享 CDN 图片尺寸规则 |
| 知乎 | `Zhihu.sgmodule` | 处理开屏、商业横幅、信息流强广告字段和链接直达可选项；拒绝远程总配置、账号/会员改写与正常搜索推荐整接口清空 |
| 微博 | `weibo.module` | 补入实时/预加载开屏、第一方广告预加载和长文章 `uvead`；不引入会员图标/皮肤改写，不拦通知激活 |
| 闲鱼 | `XianYu.sgmodule` | 开屏直接空响应，首页/同城/搜索仅删除强广告标记；保留聊天、交易和普通商品推荐 |
| YouTube | `YouTube.sgmodule`、固定 Maasea 快照 | 继续使用本地安全补丁的 Protobuf 响应过滤；上游 encrypted `initplayback` 路径会把完整目标 URL 和 client key 重定向到 `init-stream.maasea.workers.dev`，因此未采用；同时拒绝整响应清空、全 UDP/443 和后台播放/下载权益注入 |
| 百度网盘 | `BaiduNetdisk.sgmodule` | 保留广告 API、启动活动入口、明确广告素材与更新统计；拒绝视频 CDN、认证、会员和下载相关接口 |
| 抖音 / 字节系 | `ByteDance.sgmodule` | 在穿山甲/Gromore 基础上补入 `/aweme/v*/ad/` 与 `/api|motor/ad/` 精确路径；不改写主 feed，不使用静态 IP |
| 番茄小说 | `FanQieNovel.sgmodule` | 保留广告 SDK、章末广告专用素材和预加载阻断；移除上游静态 IP、整域 `novelapp` 与正常视频路径 |
| 迅雷 | `Thunder.sgmodule` | 保留 `adsp`、`cpm`、广告图片目录和 `slots:batchGet`；拒绝直播、会员场景、更新和共享静态域整域封锁 |
| 哔哩哔哩 | Sparkle/app2smile 当前 proto 定义 | 仅完成边界审计；用户已有专用规则，发行物不包含 Bilibili Rewrite、脚本、规则、组件或 MITM 主机，也不采用会员状态伪造、SponsorBlock 外部请求、投屏/背景/UI 改写 |

## 推广推送的传输边界

Apple 的 UserNotifications/APNs 官方文档确认：App 服务提供方通过 APNs 的
HTTP/2 TLS 接口发送 payload，payload 同时可承载用户消息、普通提醒和 App 自定义
数据。由此可得，Shadowrocket 在共享 APNs 传输域上无法可靠判定“营销”还是
“聊天/订单/设备告警”。

本仓库因此只处理路径明确的业务营销接口，例如 `advertisementPush`、
`MarketingRecommendRuleConfigInfo`、启动推广和含广告弹窗；混合通知响应采用本地
强信号字段过滤。APNs、友盟、极光、个推和相似共享通道明确保留。

## 原版剩余软件发布前复核

| 原分组 | 2026 固定点证据 | 最终处理 |
| --- | --- | --- |
| 优酷 | fmz200 当前配置已从旧 CIBN 视频文件名转为 `acs/un-acs.youku.com` JSON 结构 | 本地只删除 `ad/ykad`、明确广告组件和两个广告卡 ID；保留水印、正片、推荐与播放地址 |
| 爱阅书香 | fmz200 仍启用 `icc.one/iFreeTime/xid32uxaoecnfv2/` | 并入 iFreeTime 组件；删除失去当前交叉证据的 GitHub Pages 镜像 |
| 悦Me TV | blackmatrix7 已把旧 IP 更新为 `zjh5api.189smarthome.com` | 不整响应拒绝，改为本地强广告字段过滤 |
| 搜狗输入法 | fmz200 仍启用 iOS `sogou_input_.../index.html` 启动路径 | 新增精确启动推广 Rewrite；不拦词库、账号、更新或游戏中心 |
| 超级课程表 | fmz200 仍使用 `ad.myfriday.cn/d/json/1.1` | 只拒绝专用广告子域，移除旧 IP |
| 等等付 | blackmatrix7 仍启用 `api.waitwaitpay.com//api/splash` | 只拒绝 splash；支付、商户和账户接口不匹配 |
| 直播吧 | fmz200 与 blackmatrix7 都保留 `a.qiumibao.com` 两个配置入口 | 从整响应拒绝改为本地强广告字段过滤，移除旧 IP |
| 追书神器 / 微信 | 当前组件原已覆盖广告/开屏或公众号广告 | 修正迁移报告映射；通知、书架、更新、聊天和支付仍保留 |
| 饿了么 | fmz200 当前项仍依赖共享 CDN 图片尺寸、视频文件名和 sitemap | 不采用，避免误杀商品/活动正常媒体 |
| 国泰君安 | fmz200 当前项仍整接口拒绝 `kvController`，缺少字段证据 | 不采用；金融账户和交易安全优先 |
| 腾讯视频 | fmz200 当前视频 CDN、`vmind`、`getvinfo` 规则全部注释 | 不恢复；避免破坏正片、清晰度和播放回退 |

## 为什么不直接采用“支持数百 App”的聚合包

当前 `fmz200/wool_scripts` 自述其合集支持大量 App，同时也明确提示部分规则可能失效，并列出抖音、番茄小说、豆瓣信息流、虎牙等不能或不能完全去广告的 App。该说明与本项目的边界一致：域名能拒绝时可以直接拒绝；广告与正常内容混在同一响应时必须 MITM 并解析；证书固定或第一方加密时则可能无法可靠处理。

因此，本项目把“仍在上游列表出现”作为候选证据，而不是成功证明。每个进入稳定版的接口还要通过本地静态检查、冲突检查和失败开放测试；不能完成这些步骤的条目会在 `APP_PARITY.md` 中明确留档或隔离。

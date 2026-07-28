# 第三方来源与许可证记录

本项目自有代码使用仓库根目录的 MIT License。下列第三方文件保持各自许可证，不因本项目许可证而改变。

## 随发行物分发的第三方材料

### TG-Twilight/AWAvenue-Ads-Rule

- 用途：长尾 App、第三方广告 SDK 与追踪域名的基础快照。
- 固定提交：`d77f249050b440989cc9a640eabdb18573dc7c90`
- 上游文件：`Filters/AWAvenue-Ads-Rule-Surge-RULE-SET.list`
- 上游快照 SHA-256：`7a85b45b3e087d257c7eee2316f34013fadd353d716204444d98a231034236c9`
- 许可证：GPL-3.0；全文位于 `third_party/awa/LICENSE`。
- 本地原始快照：`third_party/awa/AWAvenue-Ads-Rule-Surge-RULE-SET.list`。
- 发布变更：构建时排除会影响登录、聊天/推送、支付、更新、安全扫描、正常图片/视频或共享业务域的高风险条目。完整差异见
  `config/awa-exclusions.mjs` 和生成的
  `dist/rules/AWAvenue-Ads-Rule.exclusions.json`。
- 上游地址：<https://github.com/TG-Twilight/AWAvenue-Ads-Rule>

### Maasea/sgmodule

- 用途：YouTube Protobuf 响应广告节点识别。
- 固定提交：`65075cdb388fc5e3094afd7e7314c67b243f3525`
- 上游文件：`Script/Youtube/youtube.response.js`
- 上游快照 SHA-256：`f98483d5f5017514f82502253c0db5ce2d4ffb7839887aa2cadc22666f5a7f12`
- 许可证：Apache-2.0；全文位于 `third_party/maasea/LICENSE`。
- 本地原始快照：`third_party/maasea/youtube.response.js`。
- 发布变更由 `scripts/build.mjs` 可复现：
  - 只保留广告节点过滤和本地 UI 精简；
  - 移除画中画、后台播放、下载等权益/能力注入；
  - 移除账户设置注入；
  - 不采用会把完整 `initplayback` 目标 URL 和 client key 重定向到第三方 Worker
    的 `youtube.request.js`；
  - 禁用响应脚本的外部网络请求能力；
  - 移除不需要的 config/log 路由；
  - 将学习缓存限制为固定大小。
- 上游地址：<https://github.com/Maasea/sgmodule>

## 仅用于审计和端点交叉验证、未复制代码的来源

### fmz200/wool_scripts

- 检查提交：`edbfac44522ef7f05718122ba95919bf2a1bdecc`
- 用于核对 QQ/腾讯新闻、微信、京东、淘宝、知乎、微博、闲鱼、YouTube、
  百度网盘、抖音/字节系、番茄小说、迅雷、Bilibili 及多个长尾 App 的近期端点。
- 许可证：GPL-3.0。
- 本项目的 JSON 处理器为独立实现；没有复制其脚本。
- 地址：<https://github.com/fmz200/wool_scripts>

### ddgksf2013/Scripts

- 检查提交：`97b8abea5ff52b5874c90d106d241e99894460d1`
- 用于核对高德和微博接口；上游脚本未并入本项目。
- 仓库根目录未发现可供本项目重分发的许可证，因此只作事实参考。
- 地址：<https://github.com/ddgksf2013/Scripts>

### NobyDa/Script

- 检查提交：`7f8b309f8d943806b90c6ff25d8b8aa0c59b0c03`
- 用于核对微信公众号和 Bilibili 自动换区/豆瓣评分旧功能。
- 许可证：GPL-3.0。
- 微信广告逻辑已独立重写；Bilibili 自动换区脚本声明的平台不含 Shadowrocket，
  且会主动请求豆瓣并修改区域限制字段，因此没有进入 Shadowrocket 稳定模块。
- 地址：<https://github.com/NobyDa/Script>

### app2smile/rules

- 检查提交：`df6366a7024e0b3f0aa3510c5b791eea6f3cba89`
- 用于核对百度贴吧、腾讯新闻和 Bilibili `ViewReply.cm` 的当前接口/schema。
- 许可证：MIT；只作端点和数据结构事实参考，本项目没有复制其脚本文本。
- 地址：<https://github.com/app2smile/rules>

### Kokoryh/Sparkle

- 检查提交：`a26c3412a760fb8d7d4d1bcc124d126e19d630e5`
- 用于交叉确认 Bilibili `bilibili.app.viewunite.v1.ViewReply` 顶层 field 7
  `cm`、gRPC framing、gzip 处理和 HTTP/2 MITM 要求。
- 许可证：GPL-3.0；本项目没有复制其脚本或 proto 生成代码。
- 仅完成可行性审查；按用户要求未新增 Bilibili Protobuf 处理器，以免与已有专用
  规则重复。没有采用其会员/投屏/背景、SponsorBlock 外部请求、动态 UI 或其他
  非广告逻辑。
- 地址：<https://github.com/Kokoryh/Sparkle>

### LOWERTOP/Shadowrocket 与 Apple APNs 文档

- 用于核对 Shadowrocket HTTP/2 MITM 安装前提，以及 APNs 共享传输同时承载普通
  通知和 App 自定义 payload 的安全边界。
- 只引用公开协议/产品文档事实，没有复制代码或资产。
- 地址：<https://github.com/LOWERTOP/Shadowrocket>、
  <https://developer.apple.com/documentation/usernotifications/sending-notification-requests-to-apns>

### blackmatrix7/ios_rule_script

- 检查提交：`8f67b6419fe1cc2277e59347b0d59d26e160b023`
- 用于交叉核对悦Me TV、等等付、直播吧的当前域名，以及 Surge 模块转
  Shadowrocket 时的冲突和正则处理原则。
- 许可证：GPL-2.0；只作端点事实参考。
- 仅作事实参考，不复制或动态执行其脚本。
- 地址：<https://github.com/blackmatrix7/ios_rule_script>

### yfamilys Shadowrocket 模块列表

- 用户指定的补充样本：<https://yfamilys.com/shadowrocket>。
- 用于确认原始 11 个文件的分发来源和旧功能名称。
- 该列表同时包含会员、皮肤、倍速和付费能力改写模块；这些内容不属于去广告，
  也违反本项目的权益安全边界，因此不会被动态引用或打包。
- 正式版本不依赖 yfamilys 动态内容。

### Y123456-hzy/gy-adblock-mitm-lite.sgmodule

- 检查修订：`69c5fc3590814d39fd9518bff204315371f7b39c`。
- 用于交叉验证广告 SDK 整域断开造成重试/卡顿的设备日志结论，以及穿山甲、
  Gromore、GDT 当前精确主机和广告载荷路径。
- Gist 未声明可供本项目重分发的许可证；本项目没有复制或动态执行其模块/脚本，
  只采用公开网络行为和端点事实并独立实现。
- 地址：<https://gist.github.com/Y123456-hzy/dd342a1a61daf8c250b112faa1381918>

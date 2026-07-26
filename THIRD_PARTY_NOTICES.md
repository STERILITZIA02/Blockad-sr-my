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
  - 不采用会转发播放请求的 `youtube.request.js`；
  - 禁用响应脚本的外部网络请求能力；
  - 移除不需要的 config/log 路由；
  - 将学习缓存限制为固定大小。
- 上游地址：<https://github.com/Maasea/sgmodule>

## 仅用于审计和端点交叉验证、未复制代码的来源

### fmz200/wool_scripts

- 检查提交：`edbfac44522ef7f05718122ba95919bf2a1bdecc`
- 用于核对闲鱼、京东、知乎、百度网盘、番茄小说和迅雷的近期端点。
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

### app2smile/rules 与 blackmatrix7/ios_rule_script

- 用于核对 Bilibili/QQ 等接口以及 Surge 模块转 Shadowrocket 时的冲突和正则处理原则。
- 未复制无明确重分发许可的脚本。
- 地址：<https://github.com/app2smile/rules>、
  <https://github.com/blackmatrix7/ios_rule_script>

### yfamilys Shadowrocket 模块列表

- 用户指定的补充样本：<https://yfamilys.com/shadowrocket>。
- 用于确认原始 11 个文件的分发来源和旧功能名称。
- 该列表同时包含会员、皮肤、倍速和付费能力改写模块；这些内容不属于去广告，
  也违反本项目的权益安全边界，因此不会被动态引用或打包。
- 正式版本不依赖 yfamilys 动态内容。

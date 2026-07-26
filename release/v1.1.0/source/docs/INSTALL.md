# Shadowrocket 安装与真机验收

## 安装前

- 需要能够访问 GitHub raw 内容。
- GitHub 仓库必须为 Public；Private 仓库 raw 地址不能作为无凭据订阅。
- 建议先记下当前已启用模块，以便出现误伤时快速回滚。
- 统一模块与独立组件二选一，不要重复启用。

## 安装统一稳定模块

复制下面的 URL：

```text
https://raw.githubusercontent.com/STERILITZIA02/Blockad-sr-my/main/stable/BlockAd.Unified.sgmodule
```

在 Shadowrocket 的模块管理界面添加该 URL、更新并启用。不同 Shadowrocket
版本的入口文字可能略有差异；应确认模块详情中能看到 `[Rule]`、`[URL Rewrite]`、
`[Script]` 和 `[MITM]`，而不是只保存了一个网页书签。

需要严格冻结版本时使用：

```text
https://raw.githubusercontent.com/STERILITZIA02/Blockad-sr-my/v1.1.0/release/v1.1.0/BlockAd.Unified.sgmodule
```

## 安装 HTTPS 解密证书

响应脚本和 HTTPS Rewrite 只有在 Shadowrocket 的 MITM/HTTPS 解密证书安装并受
iOS 信任时才会生效：

1. 在 Shadowrocket 设置中生成或安装 HTTPS 解密证书。
2. 按 iOS 提示安装描述文件。
3. 在 iOS 的证书信任设置中为该根证书启用完全信任。
4. 返回 Shadowrocket，确认 HTTPS 解密/MITM 已开启。

系统与客户端版本不同会改变菜单名称。不要安装来源不明的共享证书；应使用本机
Shadowrocket 生成的证书。

## 独立开关

如不希望一次启用全部 App，可从固定版本目录单独添加：

```text
https://raw.githubusercontent.com/STERILITZIA02/Blockad-sr-my/v1.1.0/release/v1.1.0/components/<组件名>.sgmodule
```

核心组件包括：

`general-networks`、`qq`、`wechat`、`jd`、`taobao-tmall`、`zhihu`、`weibo`、
`xianyu`、`youtube`、`baidu-netdisk`、`douyin`、`fanqie`、`thunder`、`amap`、
`privacy-pcdn`。

发行版共提供 166 个独立 App/功能组件。完整组件名、中文说明和默认状态见
`release/v1.1.0/manifest.json`；原软件名到当前组件的对应关系见
`docs/APP_PARITY.md`。只启用独立组件时，不要再启用统一模块或重复组件。

默认关闭的便利组件位于 `extras/`：

- `zhihu-link-direct`：知乎链接去中转。
- `xianyu-ui`：隐藏闲鱼部分搜索、消息和个人页推荐；可能同时隐藏非广告推荐。

## 首次启用与缓存

模块只能处理之后经过 Shadowrocket 的网络响应，不能主动删除已经写入 App
本地数据库或磁盘缓存的旧广告。首次启用后：

1. 完全退出目标 App。
2. 若 App 提供“清除缓存”，执行一次；不要清除账号数据。
3. 重新打开 App，分别检查冷启动和热启动。
4. 如果旧开屏仍存在，可重启 App 或设备后再测一次。

后续匹配请求会在每次响应到达时执行过滤，覆盖刷新、分页、重新进入、前后台切换、
网络切换后的重新拉取和配置过期后的更新，不使用高频轮询。

## 真机验收清单

本清单必须由用户在实际 iPhone 和当前 Shadowrocket/App 版本上完成；仓库的自动
检查不能代替真机流量和 UI 验证。

- QQ：冷启动、腾讯新闻开屏/信息流、消息、文件、语音/视频仍正常。
- 微信：公众号文章、朋友圈素材；同时检查聊天、支付、小程序和视频号。
- 京东：冷/热启动、首页、直播推广小窗、订单、物流、登录和支付。
- 淘宝/天猫：冷启动、营销弹层、首页、搜索、商品详情、购物车、订单和直播。
- 知乎：开屏、推荐、热榜、搜索；通知、评论、收藏、历史和账号页。
- 微博：冷启动、推荐/关注/热搜/搜索/评论；私信和账号页。
- 闲鱼：首页、同城、搜索；聊天、发布、商品详情和交易。
- YouTube：首页、搜索、播放前/中、暂停和推荐；登录、字幕、直播与投屏。
- 百度网盘：首页和活动入口；上传、下载、在线播放、分享和登录。
- 抖音：冷/热启动、刷新和前后台恢复；主视频流、直播、评论和发布。
- 番茄小说：开屏、章节切换、激励广告入口；正文、听书、书架和登录。
- 迅雷：首页广告位；下载、播放、直播和登录。
- 高德：开屏、首页、热词；天气、定位、路线、导航和收藏。
- Bilibili：本发行版不包含任何相关 Rewrite、脚本、规则或 MITM 主机；继续使用
  用户已有的专用规则，不与本组件叠加。
- 推广接口：京东首页营销规则、滴滴活动通知、车来了城市通知、向日葵启动推广、
  乐橙营销推送和华住弹窗；同时确认订单/行程、公交服务通知、设备告警和酒店预订
  等正常信息仍能收到。
- 长尾组件：按 `APP_PARITY.md` 中自己实际安装的 App 逐项检查开屏、首页和刷新；
  出现异常时记录时间、URL/主机和功能，不要直接扩大封禁。
- 对所有 App 重复测试下拉刷新、分页、前后台切换和 Wi-Fi/蜂窝网络切换。

## 故障处理

若出现白屏、无限加载、登录/支付/消息/上传/下载/播放异常：

1. 立即停用统一模块并重试，确认是否由模块引起。
2. 若使用独立组件，只停用对应 App 组件；不要先删除全部规则。
3. 查看 Shadowrocket 请求日志，记录发生时间、App 版本、URL 主机、状态码和
   是否命中 Rewrite/Script。
4. 不要提交 Cookie、token、完整请求头、账号或设备标识。
5. 按 [回滚指南](ROLLBACK.md) 切换到固定版本或完全停用。

YouTube 的服务端拼接广告、抖音等尚无安全解析器的第一方加密/客户端原生 feed
广告，以及 TLS 证书固定的 App，不一定能被 Shadowrocket 可靠处理。不能为了
“全去除”而封禁正常视频 CDN、全部 QUIC/UDP、APNs 或大范围共享域名。

# 原版软件与功能迁移对照

版本：1.0.0

审计日期：2026-07-26

> 本表是“原版是否真的进入当前执行路径”的证据，不把旧文件中出现过的规则等同于当前有效。状态为“留档”或“不直接迁移”的项目仍保留在 `现有插件/`，但不会扩大稳定模块的 MITM 或阻断范围。

## 汇总结论

- 原模块：11 个。
- 原 AdBlock 软件分组：161 个，其中有可执行规则 158 个。
- 已本地化替代/部分安全迁移分组：11 个。
- 明确隔离的 IP、共享 CDN、正常功能或其他高风险分组：20 个。
- 原远程脚本唯一 URL：123 个；发布产物实际引用这些旧 URL 的数量为 0。

## 11 个原模块

| 原文件 | 目标 App/范围 | 原功能 | 当前处理 |
| --- | --- | --- | --- |
| `4in1.module` | Safari/浏览器、Google 搜索 | 把“模块、插件、重写、sg、覆写”等特定 Google 搜索重定向到 yfamilys.com 的客户端配置索引 | 保留为明确标注的可选便利模块，不并入默认去广告核心。 |
| `AdBlock.module` | 21财经、4gTV、58同城、淘宝、闲鱼、飞猪、淘票票、高德地图、优酷、AcFun、字节系、百度网盘、百度贴吧、百度地图、爱奇艺、哔哩哔哩、贝壳、中国移动、中国联通、天翼云盘、CSDN、携程、得物、豆瓣、斗鱼、饿了么、京东、Keep、网易云音乐、拼多多、微博、腾讯视频、微信、喜马拉雅、小红书、YouTube、知乎、以及源文件注释列出的其他 App | 通过 URL Rewrite 拦截开屏、横幅、信息流、推广配置、广告素材和部分遥测接口 | 作为规则语料保留；只把可解释、精确且低误伤的匹配器并入稳定模块，其余进入兼容层或隔离。 |
| `adultraplus.module` | 高德地图、网易云音乐、滴滴、LINE、京东、淘宝、闲鱼、知乎、微博、小红书、百度网盘、百度贴吧、Keep、喜马拉雅、顺丰、什么值得买、酷安、彩云天气、番茄/字节广告 SDK、以及模块中数百个接口覆盖的其他 App | 大规模启动页、信息流、弹窗、活动页、热词、广告 SDK、素材和遥测拦截；380 个响应脚本入口对 JSON、HTML 或 Protobuf 响应进行过滤 | 禁止原样作为默认模块；结构化拆分、去重、修正语法并固定或本地化依赖，保留无法安全迁移的原文件用于回溯。 |
| `bili-region.module` | 哔哩哔哩 | 港澳台番剧自动换区；显示豆瓣评分 | 保留为独立可选功能模块，固定经过审查的上游版本，不和广告核心共享处理入口。 |
| `fanqie.module` | 番茄小说、部分字节系广告 SDK | 广告 SDK、素材、预加载、追踪和 PCDN 请求拦截 | 以精确广告 SDK/素材端点替换；移除共享业务域、宽泛关键词和未经复核的静态 IP 封禁。 |
| `gddt.module` | 高德地图 | 首页、开屏、消息盒子、DSP 推荐、热词和归因广告处理 | 修复为 pattern=，采用当前受维护脚本或本地处理器；不阻断正常天气和导航接口。 |
| `wechatad.module` | 微信 | 过滤微信公众号文章广告接口 | 改为本仓库内的窄接口、幂等、解析失败返回原文处理器。 |
| `weibolitead.module` | 微博轻享版/原国际版 | 开屏、推荐流、关注流、趋势页和搜索推广处理 | 修正协议匹配，按明确 API 主机拆分，并使用本地响应过滤器。 |
| `YouTubeAd.sgmodule` | YouTube | 响应内广告节点过滤；广告统计请求拦截 | 采用近期维护版本并固定提交；去除未展开模板，保留失败开放和明确限制，不宣称 100% 屏蔽。 |
| `ZhihuBlock.sgmodule` | 知乎 | 开屏、首页信息流、热榜、搜索、回答/文章推荐、商业卡片和部分弹窗过滤 | 保留明确广告字段与精确商业接口；移除通知、评论、账号和宽泛内容接口的直接拒绝。 |
| `ZhihuOpt.sgmodule` | 知乎网页、Safari/浏览器 | 知乎链接直达；移动页/桌面页 UA 显示优化 | 保留为独立可选便利模块；链接直达与 UA 优化分开，便于单独关闭。 |

## AdBlock.module 逐软件分组

| 原分组 | 原规则数 | 当前状态 | 当前组件 | 结论/差异 |
| --- | ---: | --- | --- | --- |
| 21st Century Business Herald | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| 4gTV | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| 58 | 5 | 不直接迁移：共享 CDN/媒体特征 | — | 依赖共享 CDN、媒体文件名或尺寸特征，不能可靠区分正常内容。 |
| Taobao | 2 | 部分安全迁移 | [淘宝 / 天猫](../dist/components/taobao-tmall.sgmodule) | 保留精确开屏/广告服务；不采用共享 CDN 图片尺寸猜测。 |
| Xianyu | 1 | 已本地化替代 | [闲鱼](../dist/components/xianyu.sgmodule)<br>[闲鱼可选 UI 精简](../dist/extras/xianyu-ui.sgmodule) | 开屏和显式商业卡默认处理；非广告 UI 精简单独可选。 |
| Fliggy | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Taopiaopiao | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| AMap | 1 | 部分安全迁移 | [高德地图](../dist/components/amap.sgmodule) | 保留开屏和商业接口；旧天气误拦截与整站匹配不迁移。 |
| YOUKU | 2 | 不直接迁移：误伤风险 | — | 按视频 URL 参数猜测广告，可能误伤正片或播放回退。 |
| AcFun | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| AiMeiJu | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| ByteDance | 5 | 部分安全迁移 | [抖音](../dist/components/douyin.sgmodule)<br>[番茄小说](../dist/components/fanqie.sgmodule) | 改为穿山甲/Gromore 精确广告端点；IP 与共享业务整域不迁移。 |
| Baidu NetDisk | 3 | 部分安全迁移 | [百度网盘](../dist/components/baidu-netdisk.sgmodule) | 保留广告、活动入口和明确广告素材；不修改会员、下载或播放。 |
| Baidu Tieba | 5 | 不直接迁移：IP 漂移风险 | — | 至少一条规则直接匹配 IP；地址会漂移且缺少归属证明。 |
| Baidu Map | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Baidu InputMethod | 2 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| iQIYI | 6 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| bilibili | 2 | 已本地化替代 | [哔哩哔哩](../dist/components/bilibili.sgmodule) | 保留开屏、推荐流、直播/动态显式广告；不修改会员或播放地址。 |
| BeiTaiKitchen | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| BiShiJie | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Beike | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| boohee | 1 | 不直接迁移：IP 漂移风险 | — | 至少一条规则直接匹配 IP；地址会漂移且缺少归属证明。 |
| bodivis | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| BabyHealth | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| ChinaMobile | 2 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| ChinaUnicom | 2 | 不直接迁移：正常功能风险 | — | 规则可能阻断账号、通知、更新或必要配置，不符合稳定版安全边界。 |
| Cloud189 | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| YueMeTV | 1 | 不直接迁移：IP 漂移风险 | — | 至少一条规则直接匹配 IP；地址会漂移且缺少归属证明。 |
| CNTV | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Chelaile | 3 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Caocao | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| CaijingNet | 2 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| CSDN | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Ctrip | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| DU | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| douban | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| DouYuZhiBo | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Dangdang | 2 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Daoyu | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Dida | 2 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Dianshijia | 2 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| DDpai | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| DingDongMaiCai | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| eLong | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| eDaijia | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| eleme | 4 | 不直接迁移：误伤风险 | — | 仅按共享 CDN 图片尺寸/视频文件名判断，无法证明素材一定是广告。 |
| ezviz ViedoGo | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Foodie | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| FOTOABLE | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| FlyerTea | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| FengWatch | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| feng | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| FaceBeauty | 2 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Google | 3 | 已本地化替代 | [YouTube / YouTube Music](../dist/components/youtube.sgmodule) | 由固定 Maasea 快照的安全补丁替代旧纯 Rewrite；不封禁 QUIC/播放 CDN。 |
| Gofun | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Guotai Junan Securities | 1 | 不直接迁移：误伤风险 | — | 按证券 App CDN 中任意 jpg 路径阻断，范围不具备广告专属性。 |
| HangZhou CityzenCard | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Huomao | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| HanjuTV | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Huya | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| iFLY Input | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Intsig CamScaner | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| iReader | 3 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| inanning | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| iFreeTime | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| iCleaner | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Inoreader | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| i4 | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| iFreeTimebook | 2 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| IKOSPro | 2 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| JD | 4 | 部分安全迁移 | [京东](../dist/components/jd.sgmodule) | 启动与显式广告字段由本地处理器持续过滤；保留订单、支付和物流。 |
| JiaXiaoeDianTong | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| JiaKaoBaoDian | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Jinse | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Kingsoft | 5 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Keep | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Kuaikan Comics | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| KOOWO | 3 | 不直接迁移：IP 漂移风险 | — | 至少一条规则直接匹配 IP；地址会漂移且缺少归属证明。 |
| LaiFeng | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Lenovo | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| MI | 5 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| MogoRenter | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| MojiWeather | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| ManHuaRen | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Meituan-Dianping | 5 | 不直接迁移：误伤风险 | — | 旧规则大多按共享 CDN 目录或图片尺寸判断；仅在找到精确业务接口后迁移。 |
| mwee | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| MiaoPai | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Mafengwo | 2 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| MixC | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| NetEase MailMaster | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| NetEase News | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| NetEase MoneyKeeper | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| NetEase CloudMusic | 2 | 不直接迁移：IP 漂移风险 | — | 至少一条规则直接匹配 IP；地址会漂移且缺少归属证明。 |
| NetEase Kaola | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| NetEase You | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| NetEase SnailRead | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| NationalGeographic | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| NationalGeographicChina | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| NIU | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Naver TV | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Oray | 2 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| PiaoGen | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Pinduoduo | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| PeanutWiFi | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| PConline | 5 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| QYER | 3 | 不直接迁移：正常功能风险 | — | 规则可能阻断账号、通知、更新或必要配置，不符合稳定版安全边界。 |
| Qinbaobao | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| QDReader | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| RRtv | 3 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| RELX | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Weibo | 3 | 已本地化替代 | [微博 / 微博轻享版](../dist/components/weibo.sgmodule) | 修复旧协议拼写并改用本地、窄主机、失败开放的 JSON 过滤。 |
| tianqitong | 3 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| SOHU | 4 | 不直接迁移：正常功能风险 | — | 规则可能阻断账号、通知、更新或必要配置，不符合稳定版安全边界。 |
| SMZDM | 3 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| SCore | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Shihuo | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Shouqiyueche | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Suning | 2 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| SOGO | 0 | 无可执行规则 | — | 原分组只有注释，没有可执行规则。 |
| SF Express | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| SF HiveConsumer | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| SuperFriday | 1 | 不直接迁移：IP 漂移风险 | — | 至少一条规则直接匹配 IP；地址会漂移且缺少归属证明。 |
| Snail Sleep | 2 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| FUTU | 2 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Tencent Game | 2 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Tencent Map | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Tencent Video | 5 | 不直接迁移：误伤风险 | — | 旧规则按视频 CDN 文件名/IP 猜测广告，可能破坏播放。 |
| Tencent News | 1 | 部分安全迁移 | [QQ / 腾讯系广告](../dist/components/qq.sgmodule) | 保留明确开屏/GDT 广告；不拒绝正常远程配置。 |
| Tencent Sports | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Tencent Music | 2 | 不直接迁移：IP 漂移风险 | — | 至少一条规则直接匹配 IP；地址会漂移且缺少归属证明。 |
| Tencent WeChat | 0 | 无可执行规则 | — | 原分组只有注释，没有可执行规则。 |
| TuNiu | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| TVBCLive | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| UCar | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Umeng | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Umetrip | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| VUE | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| VariFlight | 3 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| VISTOPIA | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| WeDoctor | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Weico | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Weidian | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| WaitWaitPay | 0 | 无可执行规则 | — | 原分组只有注释，没有可执行规则。 |
| WallStCN | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Xiachufang | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| XiaoChaoBrain | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Xunyou Game Booster | 2 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Ximalaya FM | 2 | 不直接迁移：IP 漂移风险 | — | 至少一条规则直接匹配 IP；地址会漂移且缺少归属证明。 |
| Xueqiu | 4 | 不直接迁移：IP 漂移风险 | — | 至少一条规则直接匹配 IP；地址会漂移且缺少归属证明。 |
| Xiaohongshu | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Youtube++ | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| YinxiangNote | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| YUNMAI | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| YXLiveVideo | 2 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Zhihu | 6 | 部分安全迁移 | [知乎](../dist/components/zhihu.sgmodule)<br>[知乎链接直达](../dist/extras/zhihu-link-direct.sgmodule) | 保留商业字段与链接直达；通知、评论、账号和整响应拒绝不迁移。 |
| zhibo8 | 2 | 不直接迁移：误伤风险 | — | 活动配置不是广告专用接口，另一路径只匹配漂移 IP。 |
| zhuishushenqi | 5 | 部分可迁移，其余留档 | — | 广告/开屏接口可迁移；通知、书架同步和 App Store 更新检查不得阻断。 |
| Zuoyebang | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| ZUIYOU | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Zhan | 1 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |
| Zhangyue | 2 | 留档：缺少近期接口证据 | — | 保留在原始文件供追溯；未找到足够证据证明当前接口仍有效且可低误伤拒绝。 |

## adultraplus.module 的远程处理器

> 原文件把 123 个不同的远程脚本挂到 380 个响应入口。以下逐 URL 记录是否有本地替代；没有本地替代的脚本不会在当前模块中执行。此处的“局部替代”只表示相同 App 的去广告主路径已本地化，不表示复制了旧脚本中的会员、去水印或 UI 改写。

| 原远程脚本 | 当前处理 | 本地组件 | 原因 |
| --- | --- | --- | --- |
| [zheye.min.js](https://gist.githubusercontent.com/blackmatrix7/f5f780d0f56b319b6ad9848fd080bb18/raw/zheye.min.js) | 局部本地替代 | `zhihu` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [netease.adblock.js](https://gist.githubusercontent.com/ddgksf2013/4f53b7c6083678df25fecc8ff68b52c4/raw/netease.adblock.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [baiduCloud.adblock.js](https://gist.githubusercontent.com/ddgksf2013/f43026707830c7818ee3ba624e383c8d/raw/baiduCloud.adblock.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [amap.js](https://github.com/ddgksf2013/Scripts/raw/master/amap.js) | 局部本地替代 | `amap` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [coolapk.js](https://github.com/ddgksf2013/Scripts/raw/master/coolapk.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [pixivAds.js](https://github.com/ddgksf2013/Scripts/raw/master/pixivAds.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [rrtv_json.js](https://github.com/ddgksf2013/Scripts/raw/master/rrtv_json.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [xianyu_ads.js](https://github.com/fmz200/wool_scripts/raw/main/Scripts/xianyu/xianyu_ads.js) | 局部本地替代 | `xianyu` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [xiaohongshu.js](https://github.com/fmz200/wool_scripts/raw/main/Scripts/xiaohongshu/xiaohongshu.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [adsense.js](https://raw.githubusercontent.com/app2smile/rules/master/js/adsense.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [baidumap.js](https://raw.githubusercontent.com/app2smile/rules/master/js/baidumap.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [qidian.js](https://raw.githubusercontent.com/app2smile/rules/master/js/qidian.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [qq-news.js](https://raw.githubusercontent.com/app2smile/rules/master/js/qq-news.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [tieba-json.js](https://raw.githubusercontent.com/app2smile/rules/master/js/tieba-json.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [tieba-proto.js](https://raw.githubusercontent.com/app2smile/rules/master/js/tieba-proto.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [vgtime.js](https://raw.githubusercontent.com/app2smile/rules/master/js/vgtime.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [suishouji.js](https://raw.githubusercontent.com/ddgksf2013/MoYu/refs/heads/master/suishouji.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [baishitv.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/master/baishitv.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [pupumarket.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/master/pupumarket.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [quark.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/master/quark.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [weixin110.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/master/weixin110.js) | 局部本地替代 | `wechat` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [12306.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/12306.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [123pan.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/123pan.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [555Ad.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/555Ad.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [ahfs.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/ahfs.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [amap.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/amap.js) | 局部本地替代 | `amap` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [amdc.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/amdc.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [applet.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/applet.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [bing.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/bing.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [cainiao_json.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/cainiao_json.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [caixinads.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/caixinads.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [caiyun_json.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/caiyun_json.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [coolapk.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/coolapk.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [dict.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/dict.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [fly.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/fly.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [iqiyi_open_ads.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/iqiyi_open_ads.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [ithome.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/ithome.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [jd_json.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/jd_json.js) | 局部本地替代 | `jd` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [keepStyle.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/keepStyle.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [qidian.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/qidian.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [redbook_json.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/redbook_json.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [shunfeng_json.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/shunfeng_json.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [smzdm_json.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/smzdm_json.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [startup.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/startup.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [stay.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/stay.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [v2ex.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/v2ex.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [weibo_json.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/weibo_json.js) | 局部本地替代 | `weibo` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [weibo_search_info.json](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/weibo_search_info.json) | 局部本地替代 | `weibo` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [weibo_search_topic.json](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/weibo_search_topic.json) | 局部本地替代 | `weibo` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [ximalaya_json.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/ximalaya_json.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [zhangshanggongjiao.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/zhangshanggongjiao.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [zhihu_openads.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/zhihu_openads.js) | 局部本地替代 | `zhihu` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [weibo_json.js](https://raw.githubusercontent.com/deezertidal/private/master/js-backup/Script/weibo_json.js) | 局部本地替代 | `weibo` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [Flightradar24.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/QuantumultX/scripts/Flightradar24.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [51card.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/51card.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [555Ad.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/555Ad.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [adrive.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/adrive/adrive.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [baidumap.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/baidumap.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [blued.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/blued.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [bohe_ads.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/bohe/bohe_ads.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [cainiao.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/cainiao/cainiao.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [caixinAd.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/caixin/caixinAd.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [cmschina.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/cmschina/cmschina.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [cnftp.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/cnftp.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [coolapk.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/coolapk.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [dianyinglieshou.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/dianyinglieshou.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [didiAds.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/didi/didiAds.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [fenbi.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/fenbi.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [fly.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/fly.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [huifutianxia_ads.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/huifutianxia_ads.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [ithome.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/ithome/ithome.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [jingdong.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/jingdong/jingdong.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [jingxiAd.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/jingxiAd.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [keep.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/keep.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [kuwo.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/kuwo/kuwo.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [lawson.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/lawson.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [ltsst-ad.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/lvtusuishenting/ltsst-ad.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [maimai_ads.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/maimai/maimai_ads.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [meiyou_ads.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/meiyou/meiyou_ads.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [myBlockAds.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/myBlockAds.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [picc_ads.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/picc/picc_ads.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [PupuSplashAds.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/PupuSplashAds.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [quark.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/quark.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [QuDa.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/QuDa.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [reddit.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/reddit.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [rrtv_json.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/rrtv_json.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [smzdm_ads.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/smzdm/smzdm_ads.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [Smzdm.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/smzdm/Smzdm.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [soda.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/soda.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [soul_ads.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/soul/soul_ads.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [umetrip_ads.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/umetrip/umetrip_ads.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [xiaotucc.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/xiaotucc.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [xmly_json.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/xmly_json.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [dict-youdao-ad.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/youdao/dict-youdao-ad.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [yx.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/yx.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [zhangshanggongjiao.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/zhangshanggongjiao.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [zhihu.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/zhihu/zhihu.js) | 局部本地替代 | `zhihu` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [zhuanzhuan.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/zhuanzhuan/zhuanzhuan.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [miguvideo_ads.js](https://raw.githubusercontent.com/fmz200/wool_scripts/refs/heads/main/Scripts/miguvideo/miguvideo_ads.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [wyres.js](https://raw.githubusercontent.com/Keywos/rule/main/script/wy/js/wyres.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [12306.js](https://raw.githubusercontent.com/kokoryh/Script/master/js/12306.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [youtube.response.js](https://raw.githubusercontent.com/Maasea/sgmodule/master/Script/Youtube/youtube.response.js) | 局部本地替代 | `youtube` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [BahamutAnimeAds.js](https://raw.githubusercontent.com/NobyDa/Script/master/Bahamut/BahamutAnimeAds.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [Wechat.js](https://raw.githubusercontent.com/NobyDa/Script/master/QuantumultX/File/Wechat.js) | 局部本地替代 | `wechat` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [xjsp.js](https://raw.githubusercontent.com/NobyDa/Script/master/QuantumultX/File/xjsp.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [Bili_Auto_Regions.js](https://raw.githubusercontent.com/NobyDa/Script/master/Surge/JS/Bili_Auto_Regions.js) | 局部本地替代 | `bilibili` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [wnbz.js](https://raw.githubusercontent.com/Sliverkiss/QuantumultX/main/AdBlock/xmApp/wnbz.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [xmApp.js](https://raw.githubusercontent.com/Sliverkiss/QuantumultX/main/AdBlock/xmApp/xmApp.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [Smzdm.js](https://raw.githubusercontent.com/ZenmoFeiShi/Qx/main/Smzdm.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [51job.js](https://raw.githubusercontent.com/zirawell/R-Store/main/Res/Scripts/AntiAd/51job.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [alicdn.js](https://raw.githubusercontent.com/zirawell/R-Store/main/Res/Scripts/AntiAd/alicdn.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [ccblife.js](https://raw.githubusercontent.com/zirawell/R-Store/main/Res/Scripts/AntiAd/ccblife.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [ddxq.js](https://raw.githubusercontent.com/zirawell/R-Store/main/Res/Scripts/AntiAd/ddxq.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [dianping.js](https://raw.githubusercontent.com/zirawell/R-Store/main/Res/Scripts/AntiAd/dianping.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [flyert.js](https://raw.githubusercontent.com/zirawell/R-Store/main/Res/Scripts/AntiAd/flyert.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [foliday.js](https://raw.githubusercontent.com/zirawell/R-Store/main/Res/Scripts/AntiAd/foliday.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [freshippo.js](https://raw.githubusercontent.com/zirawell/R-Store/main/Res/Scripts/AntiAd/freshippo.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [mafengwo.js](https://raw.githubusercontent.com/zirawell/R-Store/main/Res/Scripts/AntiAd/mafengwo.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [mdb.js](https://raw.githubusercontent.com/zirawell/R-Store/main/Res/Scripts/AntiAd/mdb.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [qmai.js](https://raw.githubusercontent.com/zirawell/R-Store/main/Res/Scripts/AntiAd/qmai.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [wechatApplet.js](https://raw.githubusercontent.com/zirawell/R-Store/main/Res/Scripts/AntiAd/wechatApplet.js) | 局部本地替代 | `wechat` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [UnblockURLinWeChat.js](https://raw.githubusercontent.com/zZPiglet/Task/master/asset/UnblockURLinWeChat.js) | 局部本地替代 | `wechat` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [FAWVW.js](https://xiangwanguan.github.io/Shadowrocket/Rewrite/JavaScript/FAWVW.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |

## 解释边界

- `通用广告网络` 组件会继续拦截固定 AWAvenue 快照中的第三方广告 SDK/域名，但这不能证明某个第一方旧接口仍有效，因此不会被记作该软件的完整迁移。
- 原文件中的静态 IP、共享 CDN 图片尺寸、视频文件名、整个业务域、通知/更新/账号接口均不会为了提高规则数量而进入稳定版。
- 原远程脚本没有任何一个以动态 `main/master` URL 进入发布包；当前发布脚本只引用本仓库固定 tag。
- 本表基于静态源代码、近期上游仓库和可重复构建检查；没有声称完成 iPhone 或 Shadowrocket 真机测试。


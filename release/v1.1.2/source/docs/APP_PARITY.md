# 原版软件与功能迁移对照

版本：1.1.2

审计日期：2026-07-28

> 本表是“原版是否真的进入当前执行路径”的证据，不把旧文件中出现过的规则等同于当前有效。状态为“留档”或“不直接迁移”的项目仍保留在 `现有插件/`，但不会扩大稳定模块的 MITM 或阻断范围。

## 汇总结论

- 原模块：11 个。
- 原 AdBlock 软件分组：161 个，其中有可执行规则 158 个。
- 已本地化替代/部分安全迁移分组：157 个。
- 明确隔离的 IP、共享 CDN、正常功能或其他高风险分组：3 个。
- 原远程脚本唯一 URL：123 个；发布产物实际引用这些旧 URL 的数量为 0。

## 11 个原模块

| 原文件 | 目标 App/范围 | 原功能 | 当前处理 |
| --- | --- | --- | --- |
| `4in1.module` | Safari/浏览器、Google 搜索 | 把“模块、插件、重写、sg、覆写”等特定 Google 搜索重定向到 yfamilys.com 的客户端配置索引 | 原文件归档，不进入 stable 或 extras；用户提供的索引仅用于审计和上游查证。 |
| `AdBlock.module` | 21财经、4gTV、58同城、淘宝、闲鱼、飞猪、淘票票、高德地图、优酷、AcFun、字节系、百度网盘、百度贴吧、百度地图、爱奇艺、哔哩哔哩、贝壳、中国移动、中国联通、天翼云盘、CSDN、携程、得物、豆瓣、斗鱼、饿了么、京东、Keep、网易云音乐、拼多多、微博、腾讯视频、微信、喜马拉雅、小红书、YouTube、知乎、以及源文件注释列出的其他 App | 通过 URL Rewrite 拦截开屏、横幅、信息流、推广配置、广告素材和部分遥测接口 | 作为规则语料保留；161 个软件组逐项对照，158 个进入精确组件或安全替代路径，其余 3 个因共享媒体、金融业务或播放误伤风险隔离。 |
| `adultraplus.module` | 高德地图、网易云音乐、滴滴、LINE、京东、淘宝、闲鱼、知乎、微博、小红书、百度网盘、百度贴吧、Keep、喜马拉雅、顺丰、什么值得买、酷安、彩云天气、番茄/字节广告 SDK、以及模块中数百个接口覆盖的其他 App | 大规模启动页、信息流、弹窗、活动页、热词、广告 SDK、素材和遥测拦截；380 个响应脚本入口对 JSON、HTML 或 Protobuf 响应进行过滤 | 禁止原样作为默认模块；结构化拆分、去重、修正语法并固定或本地化依赖，保留无法安全迁移的原文件用于回溯。 |
| `bili-region.module` | 哔哩哔哩 | 港澳台番剧自动换区；显示豆瓣评分 | 原文件归档，不进入稳定或可选发行模块；地区解锁、评分外部请求和播放改写不属于去广告安全范围。 |
| `fanqie.module` | 番茄小说、部分字节系广告 SDK | 广告 SDK、素材、预加载、追踪和 PCDN 请求拦截 | 以精确广告 SDK/素材端点替换；移除共享业务域、宽泛关键词和未经复核的静态 IP 封禁。 |
| `gddt.module` | 高德地图 | 首页、开屏、消息盒子、DSP 推荐、热词和归因广告处理 | 修复为 pattern=，采用当前受维护脚本或本地处理器；不阻断正常天气和导航接口。 |
| `wechatad.module` | 微信 | 过滤微信公众号文章广告接口 | 改为本仓库内的窄接口、幂等、解析失败返回原文处理器。 |
| `weibolitead.module` | 微博轻享版/原国际版 | 开屏、推荐流、关注流、趋势页和搜索推广处理 | 修正协议匹配，按明确 API 主机拆分，并使用本地响应过滤器。 |
| `YouTubeAd.sgmodule` | YouTube | 响应内广告节点过滤；广告统计请求拦截 | 采用近期维护版本并固定提交；去除未展开模板，保留失败开放和明确限制，不宣称 100% 屏蔽。 |
| `ZhihuBlock.sgmodule` | 知乎 | 开屏、首页信息流、热榜、搜索、回答/文章推荐、商业卡片和部分弹窗过滤 | 保留明确广告字段与精确商业接口；移除通知、评论、账号和宽泛内容接口的直接拒绝。 |
| `ZhihuOpt.sgmodule` | 知乎网页、Safari/浏览器 | 知乎链接直达；移动页/桌面页 UA 显示优化 | 仅保留链接直达为独立、默认关闭模块；全站 UA/布局伪装归档，不进入发行模块。 |

## AdBlock.module 逐软件分组

| 原分组 | 原规则数 | 当前状态 | 当前组件 | 结论/差异 |
| --- | ---: | --- | --- | --- |
| 21st Century Business Herald | 1 | 已精确迁移 | [21财经](../dist/components/21jingji.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| 4gTV | 1 | 已精确迁移 | [4gTV](../dist/components/4gtv.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| 58 | 5 | 部分安全迁移 | [58同城 / 安居客](../dist/components/58.sgmodule) | 迁移 2 条第一方广告专用 API；移除通用日志、共享图片尺寸和 58cdn 通配 MITM。 |
| Taobao | 2 | 部分安全迁移 | [淘宝 / 天猫](../dist/components/taobao-tmall.sgmodule) | 保留精确开屏/广告服务；不采用共享 CDN 图片尺寸猜测。 |
| Xianyu | 1 | 已本地化替代 | [闲鱼](../dist/components/xianyu.sgmodule)<br>[闲鱼可选 UI 精简](../dist/extras/xianyu-ui.sgmodule) | 开屏和显式商业卡默认处理；非广告 UI 精简单独可选。 |
| Fliggy | 1 | 已精确迁移 | [飞猪](../dist/components/fliggy.sgmodule) | 与 2026 fmz200 固定提交交叉确认；不采用共享 alicdn 图片尺寸规则。 |
| Taopiaopiao | 1 | 已精确迁移 | [淘票票](../dist/components/taopiaopiao.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| AMap | 1 | 部分安全迁移 | [高德地图](../dist/components/amap.sgmodule) | 保留开屏和商业接口；旧天气误拦截与整站匹配不迁移。 |
| YOUKU | 2 | 部分安全迁移 | [优酷](../dist/components/youku.sgmodule) | 用 2026 fmz200 当前 JSON 结构替代旧视频 CDN 文件名猜测；只删除明确 ad/ykad、广告组件和固定广告卡 ID。 |
| AcFun | 1 | 已精确迁移 | [AcFun](../dist/components/acfun.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| AiMeiJu | 1 | 已精确迁移 | [爱美剧](../dist/components/aimeiju.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| ByteDance | 5 | 部分安全迁移 | [抖音](../dist/components/douyin.sgmodule)<br>[番茄小说](../dist/components/fanqie.sgmodule) | 改为穿山甲/Gromore 精确广告端点；IP 与共享业务整域不迁移。 |
| Baidu NetDisk | 3 | 部分安全迁移 | [百度网盘](../dist/components/baidu-netdisk.sgmodule) | 保留广告、活动入口和明确广告素材；不修改会员、下载或播放。 |
| Baidu Tieba | 5 | 已精确迁移 | [百度贴吧](../dist/components/baidu-tieba.sgmodule) | 采用 2026 app2smile/fmz200 仍使用的广告入口；移除静态 IP，并对混合响应只删强广告标记。 |
| Baidu Map | 1 | 已精确迁移 | [百度地图](../dist/components/baidu-map.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| Baidu InputMethod | 2 | 已精确迁移 | [百度输入法](../dist/components/baidu-input.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| iQIYI | 6 | 部分安全迁移 | [爱奇艺](../dist/components/iqiyi.sgmodule) | 迁移广告命名明确的 API；旧 VIP 活动接口和共享 iqiyipic 素材通配 MITM 不迁移。 |
| bilibili | 2 | 不纳入：由专用规则接管 | — | 用户已有专用规则；本仓库不发行任何 Bilibili Rewrite、脚本、规则或 MITM 主机。 |
| BeiTaiKitchen | 1 | 已精确迁移 | [贝太厨房](../dist/components/beitai-kitchen.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| BiShiJie | 1 | 已精确迁移 | [币世界](../dist/components/bishijie.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| Beike | 1 | 已精确迁移 | [贝壳找房](../dist/components/beike.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| boohee | 1 | 已本地化替代 | [薄荷健康](../dist/components/boohee.sgmodule) | 用 2026 fmz200 当前 API 替代原漂移 IP；不删除搜索、消息或健康功能。 |
| bodivis | 1 | 已精确迁移 | [好轻 / Bodivis](../dist/components/bodivis.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| BabyHealth | 1 | 已精确迁移 | [育学园 / 宝宝健康](../dist/components/baby-health.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| ChinaMobile | 2 | 部分安全迁移 | [中国移动](../dist/components/china-mobile.sgmodule) | 只迁移 market_content；原 startInit 可能含必要配置，保留。 |
| ChinaUnicom | 2 | 部分安全迁移 | [中国联通](../dist/components/china-unicom.sgmodule) | 仅迁移 getWelcomeAd；原 accountListData 属于账号功能，明确移除。 |
| Cloud189 | 1 | 已精确迁移 | [天翼云盘](../dist/components/cloud189.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| YueMeTV | 1 | 已本地化替代 | [悦Me TV](../dist/components/yueme-tv.sgmodule) | 用 2026 blackmatrix7 固定提交中的当前域名替代原 IP，并降级为本地失败开放过滤。 |
| CNTV | 1 | 已精确迁移 | [央视网 / CNTV](../dist/components/cntv.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| Chelaile | 3 | 已精确迁移 | [车来了](../dist/components/chelaile.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| Caocao | 1 | 已精确迁移 | [曹操出行](../dist/components/caocao.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| CaijingNet | 2 | 已精确迁移 | [财经网](../dist/components/caijing.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| CSDN | 1 | 已精确迁移 | [CSDN](../dist/components/csdn.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| Ctrip | 1 | 已精确迁移 | [携程](../dist/components/ctrip.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| DU | 1 | 已精确迁移 | [得物](../dist/components/dewu.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| douban | 1 | 已精确迁移 | [豆瓣](../dist/components/douban.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| DouYuZhiBo | 1 | 已精确迁移 | [斗鱼直播](../dist/components/douyu.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| Dangdang | 2 | 部分安全迁移 | [当当](../dist/components/dangdang.sgmodule) | 仅迁移 getDeviceStartPage；旧 action=init 可能含必要配置。 |
| Daoyu | 1 | 已精确迁移 | [叨鱼](../dist/components/daoyu.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| Dida | 2 | 已精确迁移 | [嘀嗒出行](../dist/components/dida.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| Dianshijia | 2 | 已精确迁移 | [电视家](../dist/components/dianshijia.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| DDpai | 1 | 已精确迁移 | [盯盯拍](../dist/components/ddpai.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| DingDongMaiCai | 1 | 已精确迁移 | [叮咚买菜](../dist/components/dingdong-maicai.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| eLong | 1 | 已精确迁移 | [艺龙](../dist/components/elong.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| eDaijia | 1 | 已精确迁移 | [e代驾](../dist/components/edaijia.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| eleme | 4 | 不直接迁移：误伤风险 | — | 仅按共享 CDN 图片尺寸/视频文件名判断，无法证明素材一定是广告。 |
| ezviz ViedoGo | 1 | 已精确迁移 | [萤石云视频](../dist/components/ezviz.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| Foodie | 1 | 已精确迁移 | [Foodie](../dist/components/foodie.sgmodule) | 不再整接口拒绝，改为本地失败开放过滤，规避误删正常 notice。 |
| FOTOABLE | 1 | 已精确迁移 | [FOTOABLE](../dist/components/fotoable.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| FlyerTea | 1 | 已精确迁移 | [飞客茶馆](../dist/components/flyertea.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| FengWatch | 1 | 已精确迁移 | [凤凰秀 / 凤观](../dist/components/fengwatch.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| feng | 1 | 已精确迁移 | [威锋](../dist/components/feng.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| FaceBeauty | 2 | 已精确迁移 | [无他相机](../dist/components/facebeauty.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| Google | 3 | 已本地化替代 | [YouTube / YouTube Music](../dist/components/youtube.sgmodule) | 由固定 Maasea 快照的安全补丁替代旧纯 Rewrite；不封禁 QUIC/播放 CDN。 |
| Gofun | 1 | 已精确迁移 | [GoFun 出行](../dist/components/gofun.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| Guotai Junan Securities | 1 | 不直接迁移：误伤风险 | — | 按证券 App CDN 中任意 jpg 路径阻断，范围不具备广告专属性。 |
| HangZhou CityzenCard | 1 | 已精确迁移 | [杭州市民卡](../dist/components/hangzhou-city-card.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| Huomao | 1 | 已精确迁移 | [火猫直播](../dist/components/huomao.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| HanjuTV | 1 | 已精确迁移 | [韩剧 TV](../dist/components/hanju-tv.sgmodule) | 旧 kp 接口含义不透明，因此从直接拒绝降级为本地强信号过滤。 |
| Huya | 1 | 已精确迁移 | [虎牙直播](../dist/components/huya.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| iFLY Input | 1 | 已精确迁移 | [讯飞输入法](../dist/components/ifly-input.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| Intsig CamScaner | 1 | 已精确迁移 | [扫描全能王](../dist/components/camscanner.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| iReader | 3 | 已精确迁移 | [掌阅 / iReader](../dist/components/ireader.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| inanning | 1 | 已精确迁移 | [爱南宁](../dist/components/inanning.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| iFreeTime | 1 | 已精确迁移 | [iFreeTime](../dist/components/ifreetime.sgmodule) | 补入 2026 fmz200 固定提交仍在使用的爱阅书香精确入口；移除旧 GitHub Pages 镜像。 |
| iCleaner | 1 | 已精确迁移 | [iCleaner](../dist/components/icleaner.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| Inoreader | 1 | 已精确迁移 | [Inoreader](../dist/components/inoreader.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| i4 | 1 | 已精确迁移 | [爱思助手](../dist/components/i4.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| iFreeTimebook | 2 | 已精确迁移 | [iFreeTime](../dist/components/ifreetime.sgmodule) | 补入 2026 fmz200 固定提交仍在使用的爱阅书香精确入口；移除旧 GitHub Pages 镜像。 |
| IKOSPro | 2 | 已精确迁移 | [IKOS Pro](../dist/components/ikos-pro.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| JD | 4 | 部分安全迁移 | [京东](../dist/components/jd.sgmodule) | 启动与显式广告字段由本地处理器持续过滤；保留订单、支付和物流。 |
| JiaXiaoeDianTong | 1 | 已精确迁移 | [驾校一点通](../dist/components/jxedt.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| JiaKaoBaoDian | 1 | 部分安全迁移 | [驾考宝典](../dist/components/jiakaobaodian.sgmodule) | 将旧 *.kakamobi.cn 通配 MITM 收窄到有公开请求样本的 smart.789.kakamobi.cn。 |
| Jinse | 1 | 已精确迁移 | [金色财经](../dist/components/jinse.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| Kingsoft | 5 | 部分安全迁移 | [WPS / 金山词霸](../dist/components/kingsoft.sgmodule) | 旧 *.kingsoft-office-service.com 改为公开验证的 abroad-ad 精确广告主机。 |
| Keep | 1 | 已精确迁移 | [Keep](../dist/components/keep.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| Kuaikan Comics | 1 | 已精确迁移 | [快看漫画](../dist/components/kuaikan.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| KOOWO | 3 | 已本地化替代 | [酷我音乐](../dist/components/kuwo.sgmodule) | 用 2026 fmz200 的域名和入口替代原静态 IP；明确排除会员处理器。 |
| LaiFeng | 1 | 已精确迁移 | [来疯直播](../dist/components/laifeng.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| Lenovo | 1 | 已精确迁移 | [联想社区](../dist/components/lenovo.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| MI | 5 | 部分安全迁移 | [小米服务 / 米家 / 小米金融](../dist/components/xiaomi-services.sgmodule) | 移除 api.m.mi.com/v*/app/start 和普通 recommendation/banner；只保留明确广告路径。 |
| MogoRenter | 1 | 已精确迁移 | [蘑菇租房](../dist/components/mogo-renter.sgmodule) | startHomePage 不是广告专用路径，改为本地失败开放过滤。 |
| MojiWeather | 1 | 已精确迁移 | [墨迹天气](../dist/components/moji.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| ManHuaRen | 1 | 已精确迁移 | [漫画人](../dist/components/manhuaren.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| Meituan-Dianping | 5 | 部分安全迁移 | [美团 / 大众点评](../dist/components/meituan-dianping.sgmodule) | 旧共享 CDN 规则隔离；采用 2026 fmz200 中仍存在的 loadsplashconfig、adshopping、startpicture 和小程序广告接口。 |
| mwee | 1 | 已精确迁移 | [美味不用等](../dist/components/mwee.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| MiaoPai | 1 | 已精确迁移 | [秒拍](../dist/components/miaopai.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| Mafengwo | 2 | 已精确迁移 | [马蜂窝](../dist/components/mafengwo.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| MixC | 1 | 已精确迁移 | [一点万象 / MixC](../dist/components/mixc.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| NetEase MailMaster | 1 | 已精确迁移 | [网易邮箱大师](../dist/components/netease-mail.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| NetEase News | 1 | 已精确迁移 | [网易新闻](../dist/components/netease-news.sgmodule) | 旧含义不明路径已与 2026 fmz200 独立模块交叉确认。 |
| NetEase MoneyKeeper | 1 | 已精确迁移 | [网易有钱](../dist/components/netease-moneykeeper.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| NetEase CloudMusic | 2 | 部分安全迁移 | [网易云音乐](../dist/components/netease-cloudmusic.sgmodule) | 撤下 interface*.music.163.com 第一方通配 MITM；保留专用广告素材域。 |
| NetEase Kaola | 1 | 已精确迁移 | [网易考拉](../dist/components/netease-kaola.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| NetEase You | 1 | 已精确迁移 | [网易严选](../dist/components/netease-you.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| NetEase SnailRead | 1 | 已精确迁移 | [网易蜗牛读书](../dist/components/netease-snailread.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| NationalGeographic | 1 | 已精确迁移 | [国家地理](../dist/components/national-geographic.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| NationalGeographicChina | 1 | 已精确迁移 | [国家地理](../dist/components/national-geographic.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| NIU | 1 | 已精确迁移 | [小牛电动](../dist/components/niu.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| Naver TV | 1 | 已精确迁移 | [Naver TV](../dist/components/naver-tv.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| Oray | 2 | 已精确迁移 | [向日葵 / Oray](../dist/components/oray.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| PiaoGen | 1 | 已精确迁移 | [票根](../dist/components/piaogen.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| Pinduoduo | 1 | 已精确迁移 | [拼多多](../dist/components/pinduoduo.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| PeanutWiFi | 1 | 已精确迁移 | [花生地铁 WiFi](../dist/components/peanut-wifi.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| PConline | 5 | 部分安全迁移 | [太平洋电脑网 / 汽车网](../dist/components/pconline.sgmodule) | 迁移广告命名明确的 4 条；旧 auto/info/preload 正常预加载接口不迁移。 |
| QYER | 3 | 部分安全迁移 | [穷游](../dist/components/qyer.sgmodule) | 迁移开屏和广告素材；配置接口保留。 |
| Qinbaobao | 1 | 已精确迁移 | [亲宝宝](../dist/components/qinbaobao.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| QDReader | 1 | 已精确迁移 | [起点读书](../dist/components/qidian.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| RRtv | 3 | 已精确迁移 | [人人视频](../dist/components/rrtv.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| RELX | 1 | 已精确迁移 | [RELX 悦刻](../dist/components/relx.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| Weibo | 3 | 已本地化替代 | [微博 / 微博轻享版](../dist/components/weibo.sgmodule) | 修复旧协议拼写并改用本地、窄主机、失败开放的 JSON 过滤。 |
| tianqitong | 3 | 已精确迁移 | [天气通](../dist/components/tianqitong.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| SOHU | 4 | 部分安全迁移 | [搜狐新闻](../dist/components/sohu.sgmodule) | 迁移 adsense 和 tj 广告素材；旧播放器 switch/bootstrap 配置保留。 |
| SMZDM | 3 | 已精确迁移 | [什么值得买](../dist/components/smzdm.sgmodule) | 保留 2026 启动与混合响应方案；撤下共享 zdmimg 通配 MITM，不采用 vip/creator 等权益改写。 |
| SCore | 1 | 已精确迁移 | [球多多 / SCore](../dist/components/score.sgmodule) | guideimage 可能兼有正常引导，改为本地失败开放过滤。 |
| Shihuo | 1 | 已精确迁移 | [识货](../dist/components/shihuo.sgmodule) | 用 2026 fmz200 的广告专用 API 替代原 saveAppInfo 通用接口。 |
| Shouqiyueche | 1 | 已精确迁移 | [首汽约车](../dist/components/shouqi.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| Suning | 2 | 已精确迁移 | [苏宁易购](../dist/components/suning.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| SOGO | 0 | 已本地化替代 | [搜狗输入法](../dist/components/sogou-input.sgmodule) | 原分组没有启用规则；补入 2026 fmz200 固定提交仍在使用的 iOS 启动推广精确路径。 |
| SF Express | 1 | 已精确迁移 | [顺丰速运](../dist/components/sf-express.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| SF HiveConsumer | 1 | 已精确迁移 | [丰巢](../dist/components/sf-hive.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| SuperFriday | 1 | 已本地化替代 | [超级课程表 / SuperFriday](../dist/components/super-friday.sgmodule) | 用 2026 fmz200 固定提交仍在使用的 ad.myfriday.cn 替代原 IP。 |
| Snail Sleep | 2 | 已精确迁移 | [蜗牛睡眠](../dist/components/snail-sleep.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| FUTU | 2 | 部分安全迁移 | [富途](../dist/components/futu.sgmodule) | 金融应用采用最小解密面：撤下 *.futunn.com，只保留 api.futunn.com 的 ad 路径。 |
| Tencent Game | 2 | 部分安全迁移 | [腾讯游戏启动广告](../dist/components/tencent-game.sgmodule) | 只迁移明确 splash 接口；旧 game/buttons 可能是正常功能。 |
| Tencent Map | 1 | 已精确迁移 | [腾讯地图](../dist/components/tencent-map.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| Tencent Video | 5 | 不直接迁移：误伤风险 | — | 旧规则按视频 CDN 文件名/IP 猜测广告，可能破坏播放。 |
| Tencent News | 1 | 已本地化替代 | [QQ / 腾讯系广告](../dist/components/qq.sgmodule) | 开屏、adList 与 ad_list 组件由本地幂等处理器接管；不拒绝正常远程配置。 |
| Tencent Sports | 1 | 已精确迁移 | [腾讯体育](../dist/components/tencent-sports.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| Tencent Music | 2 | 已精确迁移 | [QQ 音乐启动广告](../dist/components/tencent-music.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| Tencent WeChat | 0 | 已本地化替代 | [微信](../dist/components/wechat.sgmodule) | 原分组没有启用规则；微信去广告由独立 wechatad 迁移路径持续处理。 |
| TuNiu | 1 | 已精确迁移 | [途牛](../dist/components/tuniu.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| TVBCLive | 1 | 已精确迁移 | [TVB / 埋堆堆直播](../dist/components/tvbc.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| UCar | 1 | 部分安全迁移 | [神州专车](../dist/components/ucar.sgmodule) | 旧 img*.10101111cdn.com 收窄为原模块明确出现的 img01 广告素材路径。 |
| Umeng | 1 | 已精确迁移 | [友盟广告消息](../dist/components/umeng-ads.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| Umetrip | 1 | 已精确迁移 | [航旅纵横](../dist/components/umetrip.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| VUE | 1 | 已精确迁移 | [VUE 视频](../dist/components/vue-video.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| VariFlight | 3 | 已精确迁移 | [飞常准](../dist/components/variflight.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| VISTOPIA | 1 | 已精确迁移 | [看理想](../dist/components/vistopia.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| WeDoctor | 1 | 已精确迁移 | [微医](../dist/components/wedoctor.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| Weico | 1 | 已精确迁移 | [Weico](../dist/components/weico.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| Weidian | 1 | 已精确迁移 | [微店](../dist/components/weidian.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| WaitWaitPay | 0 | 已本地化替代 | [等等付 / WaitWaitPay](../dist/components/waitwaitpay.sgmodule) | 原分组只有注释；补入 2026 blackmatrix7 固定提交仍启用的 splash 精确路径。 |
| WallStCN | 1 | 已精确迁移 | [华尔街见闻](../dist/components/wallstcn.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| Xiachufang | 1 | 已精确迁移 | [下厨房](../dist/components/xiachufang.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| XiaoChaoBrain | 1 | 已精确迁移 | [小潮脑 / 小睡眠](../dist/components/xiaochao-brain.sgmodule) | startup 不是广告专用路径，改为本地失败开放过滤。 |
| Xunyou Game Booster | 2 | 已精确迁移 | [迅游加速器](../dist/components/xunyou.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| Ximalaya FM | 2 | 已本地化替代 | [喜马拉雅](../dist/components/ximalaya.sgmodule) | 原规则只有漂移 IP；改用 2026 fmz200 仍维护的广告域，并对混合响应失败开放。 |
| Xueqiu | 4 | 部分安全迁移 | [雪球](../dist/components/xueqiu.sgmodule) | 移除 IP 和 brand/search；仅保留 promotion 广告专用路径。 |
| Xiaohongshu | 1 | 已精确迁移 | [小红书](../dist/components/xiaohongshu.sgmodule) | 交叉采用 2026 fmz200 固定提交；不移除水印、不拦 HTTPDNS、不删除普通搜索热词。 |
| Youtube++ | 1 | 已精确迁移 | [YouTube++ 第三方客户端](../dist/components/youtube-plus.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| YinxiangNote | 1 | 已精确迁移 | [印象笔记](../dist/components/yinxiang.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| YUNMAI | 1 | 已精确迁移 | [云麦好轻](../dist/components/yunmai.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| YXLiveVideo | 2 | 已精确迁移 | [一直播](../dist/components/yizhibo.sgmodule) | api_pz/pz 含义混合，改为本地失败开放过滤。 |
| Zhihu | 6 | 部分安全迁移 | [知乎](../dist/components/zhihu.sgmodule)<br>[知乎链接直达](../dist/extras/zhihu-link-direct.sgmodule) | 保留商业字段与链接直达；通知、评论、账号和整响应拒绝不迁移。 |
| zhibo8 | 2 | 部分安全迁移 | [直播吧 / 球迷报](../dist/components/zhibo8.sgmodule) | 当前 fmz200/blackmatrix7 仍使用相同域名；从整响应拒绝改为本地失败开放过滤，并移除旧漂移 IP。 |
| zhuishushenqi | 5 | 部分安全迁移 | [追书神器](../dist/components/zhuishushenqi.sgmodule) | 广告/开屏接口可迁移；通知、书架同步和 App Store 更新检查不得阻断。 |
| Zuoyebang | 1 | 已精确迁移 | [作业帮](../dist/components/zuoyebang.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| ZUIYOU | 1 | 已精确迁移 | [最右](../dist/components/zuiyou.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| Zhan | 1 | 已精确迁移 | [小站教育](../dist/components/zhan.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |
| Zhangyue | 2 | 已精确迁移 | [掌阅广告服务](../dist/components/zhangyue.sgmodule) | 仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。 |

## adultraplus.module 的远程处理器

> 原文件把 123 个不同的远程脚本挂到 380 个响应入口。以下逐 URL 记录是否有本地替代；没有本地替代的脚本不会在当前模块中执行。此处的“局部替代”只表示相同 App 的去广告主路径已本地化，不表示复制了旧脚本中的会员、去水印或 UI 改写。

| 原远程脚本 | 当前处理 | 本地组件 | 原因 |
| --- | --- | --- | --- |
| [zheye.min.js](https://gist.githubusercontent.com/blackmatrix7/f5f780d0f56b319b6ad9848fd080bb18/raw/zheye.min.js) | 局部本地替代 | `zhihu` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [netease.adblock.js](https://gist.githubusercontent.com/ddgksf2013/4f53b7c6083678df25fecc8ff68b52c4/raw/netease.adblock.js) | 局部本地替代 | `netease-cloudmusic` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [baiduCloud.adblock.js](https://gist.githubusercontent.com/ddgksf2013/f43026707830c7818ee3ba624e383c8d/raw/baiduCloud.adblock.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [amap.js](https://github.com/ddgksf2013/Scripts/raw/master/amap.js) | 局部本地替代 | `amap` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [coolapk.js](https://github.com/ddgksf2013/Scripts/raw/master/coolapk.js) | 局部本地替代 | `coolapk` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [pixivAds.js](https://github.com/ddgksf2013/Scripts/raw/master/pixivAds.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [rrtv_json.js](https://github.com/ddgksf2013/Scripts/raw/master/rrtv_json.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [xianyu_ads.js](https://github.com/fmz200/wool_scripts/raw/main/Scripts/xianyu/xianyu_ads.js) | 局部本地替代 | `xianyu` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [xiaohongshu.js](https://github.com/fmz200/wool_scripts/raw/main/Scripts/xiaohongshu/xiaohongshu.js) | 局部本地替代 | `xiaohongshu` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [adsense.js](https://raw.githubusercontent.com/app2smile/rules/master/js/adsense.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [baidumap.js](https://raw.githubusercontent.com/app2smile/rules/master/js/baidumap.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [qidian.js](https://raw.githubusercontent.com/app2smile/rules/master/js/qidian.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [qq-news.js](https://raw.githubusercontent.com/app2smile/rules/master/js/qq-news.js) | 局部本地替代 | `qq` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [tieba-json.js](https://raw.githubusercontent.com/app2smile/rules/master/js/tieba-json.js) | 局部本地替代 | `baidu-tieba` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [tieba-proto.js](https://raw.githubusercontent.com/app2smile/rules/master/js/tieba-proto.js) | 局部本地替代 | `baidu-tieba` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [vgtime.js](https://raw.githubusercontent.com/app2smile/rules/master/js/vgtime.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [suishouji.js](https://raw.githubusercontent.com/ddgksf2013/MoYu/refs/heads/master/suishouji.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [baishitv.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/master/baishitv.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [pupumarket.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/master/pupumarket.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [quark.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/master/quark.js) | 局部本地替代 | `quark` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [weixin110.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/master/weixin110.js) | 局部本地替代 | `wechat` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [12306.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/12306.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [123pan.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/123pan.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [555Ad.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/555Ad.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [ahfs.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/ahfs.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [amap.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/amap.js) | 局部本地替代 | `amap` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [amdc.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/amdc.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [applet.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/applet.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [bing.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/bing.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [cainiao_json.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/cainiao_json.js) | 局部本地替代 | `cainiao` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [caixinads.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/caixinads.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [caiyun_json.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/caiyun_json.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [coolapk.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/coolapk.js) | 局部本地替代 | `coolapk` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [dict.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/dict.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [fly.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/fly.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [iqiyi_open_ads.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/iqiyi_open_ads.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [ithome.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/ithome.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [jd_json.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/jd_json.js) | 局部本地替代 | `jd` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [keepStyle.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/keepStyle.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [qidian.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/qidian.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [redbook_json.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/redbook_json.js) | 局部本地替代 | `xiaohongshu` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [shunfeng_json.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/shunfeng_json.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [smzdm_json.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/smzdm_json.js) | 局部本地替代 | `smzdm` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [startup.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/startup.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [stay.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/stay.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [v2ex.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/v2ex.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [weibo_json.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/weibo_json.js) | 局部本地替代 | `weibo` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [weibo_search_info.json](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/weibo_search_info.json) | 局部本地替代 | `weibo` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [weibo_search_topic.json](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/weibo_search_topic.json) | 局部本地替代 | `weibo` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [ximalaya_json.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/ximalaya_json.js) | 局部本地替代 | `ximalaya` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [zhangshanggongjiao.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/zhangshanggongjiao.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [zhihu_openads.js](https://raw.githubusercontent.com/ddgksf2013/Scripts/refs/heads/master/zhihu_openads.js) | 局部本地替代 | `zhihu` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [weibo_json.js](https://raw.githubusercontent.com/deezertidal/private/master/js-backup/Script/weibo_json.js) | 局部本地替代 | `weibo` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [Flightradar24.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/QuantumultX/scripts/Flightradar24.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [51card.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/51card.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [555Ad.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/555Ad.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [adrive.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/adrive/adrive.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [baidumap.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/baidumap.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [blued.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/blued.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [bohe_ads.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/bohe/bohe_ads.js) | 局部本地替代 | `boohee` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [cainiao.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/cainiao/cainiao.js) | 局部本地替代 | `cainiao` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [caixinAd.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/caixin/caixinAd.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [cmschina.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/cmschina/cmschina.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [cnftp.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/cnftp.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [coolapk.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/coolapk.js) | 局部本地替代 | `coolapk` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [dianyinglieshou.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/dianyinglieshou.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [didiAds.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/didi/didiAds.js) | 局部本地替代 | `didi` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [fenbi.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/fenbi.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [fly.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/fly.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [huifutianxia_ads.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/huifutianxia_ads.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [ithome.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/ithome/ithome.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [jingdong.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/jingdong/jingdong.js) | 局部本地替代 | `jd` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [jingxiAd.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/jingxiAd.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [keep.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/keep.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [kuwo.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/kuwo/kuwo.js) | 局部本地替代 | `kuwo` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [lawson.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/lawson.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [ltsst-ad.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/lvtusuishenting/ltsst-ad.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [maimai_ads.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/maimai/maimai_ads.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [meiyou_ads.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/meiyou/meiyou_ads.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [myBlockAds.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/myBlockAds.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [picc_ads.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/picc/picc_ads.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [PupuSplashAds.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/PupuSplashAds.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [quark.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/quark.js) | 局部本地替代 | `quark` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [QuDa.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/QuDa.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [reddit.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/reddit.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [rrtv_json.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/rrtv_json.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [smzdm_ads.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/smzdm/smzdm_ads.js) | 局部本地替代 | `smzdm` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [Smzdm.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/smzdm/Smzdm.js) | 局部本地替代 | `smzdm` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
| [soda.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/soda.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [soul_ads.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/soul/soul_ads.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [umetrip_ads.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/umetrip/umetrip_ads.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [xiaotucc.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/xiaotucc.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [xmly_json.js](https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/xmly_json.js) | 局部本地替代 | `ximalaya` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
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
| [Bili_Auto_Regions.js](https://raw.githubusercontent.com/NobyDa/Script/master/Surge/JS/Bili_Auto_Regions.js) | 不执行 | — | 地区解锁会改写播放区域并执行外部查询，不属于去广告稳定路径。 |
| [wnbz.js](https://raw.githubusercontent.com/Sliverkiss/QuantumultX/main/AdBlock/xmApp/wnbz.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [xmApp.js](https://raw.githubusercontent.com/Sliverkiss/QuantumultX/main/AdBlock/xmApp/xmApp.js) | 不执行 | — | 不进入发布执行路径：原引用未固定或用途混杂，且未完成许可证、接口与误伤验证。 |
| [Smzdm.js](https://raw.githubusercontent.com/ZenmoFeiShi/Qx/main/Smzdm.js) | 局部本地替代 | `smzdm` | 同类广告功能已由本仓库窄接口、本地、失败开放处理器替代；未照搬脚本中的权益/UI 扩展。 |
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

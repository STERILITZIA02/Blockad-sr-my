const re = String.raw;

function rewrite(comment, pattern, action = "reject-dict") {
  return { comment, pattern, action };
}

function routerScript(name, pattern, sampleUrl, maxSize = 2097152) {
  return {
    name,
    pattern,
    sampleUrl,
    engine: "router",
    maxSize,
  };
}

function defineApp({
  id,
  name,
  description,
  legacyGroups = [],
  auditNote = "仅迁移广告专用路径；未采用静态 IP、共享 CDN 或正常功能接口。",
  auditDisposition = "migrated",
  rules = [],
  rewrites = [],
  scripts = [],
  mitm = [],
}) {
  return {
    id,
    name,
    description,
    legacyGroups,
    auditNote,
    auditDisposition,
    unified: true,
    rules,
    rewrites,
    scripts,
    mitm,
  };
}

/*
 * 这些组件来自原 AdBlock.module / adultraplus.module 的逐接口复核。
 * 原文件只用作审计语料；下面的生产配置全部本地化、去 IP、去共享 CDN
 * 猜测并改用 Shadowrocket 可直接导入的响应类型。
 */
export const legacyApps = [
  defineApp({
    id: "21jingji",
    name: "21财经",
    description: "广告专用 API；不触碰新闻正文、登录或评论。",
    legacyGroups: ["21st Century Business Herald"],
    rewrites: [
      rewrite("广告接口", re`^https:\/\/api\.21jingji\.com\/ad(?:\/|\?|$)`),
    ],
    mitm: ["api.21jingji.com"],
  }),
  defineApp({
    id: "4gtv",
    name: "4gTV",
    description: "广告拉取与广告日志；不匹配播放清单或媒体地址。",
    legacyGroups: ["4gTV"],
    rewrites: [
      rewrite(
        "广告拉取/日志",
        re`^https:\/\/service\.4gtv\.tv\/4gtv\/Data\/(?:GetAD|ADLog)(?:\/|\?|$)`,
      ),
    ],
    mitm: ["service.4gtv.tv"],
  }),
  defineApp({
    id: "58",
    name: "58同城 / 安居客",
    description: "首页广告与品牌广告目录；不采用图片尺寸猜测，也不阻断通用日志。",
    legacyGroups: ["58"],
    auditDisposition: "partial",
    auditNote: "迁移 3 条广告专用路径；移除通用日志和共享图片尺寸规则。",
    rewrites: [
      rewrite(
        "首页广告",
        re`^https:\/\/app\.58\.com\/api\/home\/(?:advertising|appadv)(?:\/|\?|$)`,
      ),
      rewrite(
        "邀请弹窗广告",
        re`^https:\/\/app\.58\.com\/api\/home\/invite\/popupAdv(?:\/|\?|$)`,
      ),
      rewrite(
        "品牌广告素材",
        re`^https:\/\/[^/]+\.58cdn\.com\.cn\/brandads(?:\/|$)`,
        "reject-img",
      ),
    ],
    mitm: ["app.58.com", "*.58cdn.com.cn"],
  }),
  defineApp({
    id: "taopiaopiao",
    name: "淘票票",
    description: "广告专用 MTop 接口；保留电影、影院、订单和支付。",
    legacyGroups: ["Taopiaopiao"],
    rewrites: [
      rewrite(
        "广告查询",
        re`^https:\/\/acs\.m\.taobao\.com\/gw\/mtop\.film\.mtopadvertiseapi\.(?:queryadvertise|queryloadingbanner)(?:\/|$)`,
      ),
    ],
    mitm: ["acs.m.taobao.com"],
  }),
  defineApp({
    id: "acfun",
    name: "AcFun",
    description: "启动闪屏接口；不拦截视频、弹幕或账号。",
    legacyGroups: ["AcFun"],
    rewrites: [
      rewrite(
        "启动闪屏",
        re`^https:\/\/api-new\.app\.acfun\.cn\/rest\/app\/flash\/screen(?:\/|\?|$)`,
      ),
    ],
    mitm: ["api-new.app.acfun.cn"],
  }),
  defineApp({
    id: "aimeiju",
    name: "爱美剧",
    description: "iOS 广告接口；不匹配剧集与播放线路。",
    legacyGroups: ["AiMeiJu"],
    rewrites: [
      rewrite(
        "广告接口",
        re`^https:\/\/api\.bjxkhc\.com\/index\.php\/app\/ios\/ads(?:\/|\?|$)`,
      ),
    ],
    mitm: ["api.bjxkhc.com"],
  }),
  defineApp({
    id: "baidu-tieba",
    name: "百度贴吧",
    description: "开屏、吧内广告配置与 JSON 信息流显式广告；Protobuf 无法解析时原样返回。",
    legacyGroups: ["Baidu Tieba"],
    auditNote: "采用 2026 app2smile/fmz200 仍使用的广告入口；移除静态 IP，并对混合响应只删强广告标记。",
    rewrites: [
      rewrite(
        "开屏日程",
        re`^https:\/\/c\.tieba\.baidu\.com\/c\/s\/splashSchedule(?:\?|$)`,
      ),
      rewrite(
        "吧内广告配置",
        re`^https:\/\/c\.tieba\.baidu\.com\/c\/f\/forum\/getAdInfo(?:\?|$)`,
      ),
      rewrite(
        "开屏广告专用入口",
        re`^https:\/\/(?:tiebac|c\.tieba)\.baidu\.com\/c\/f\/ad\/getSplashAd(?:\?|$)`,
      ),
    ],
    scripts: [
      routerScript(
        "百度贴吧_JSON信息流广告",
        re`^https:\/\/(?:tiebac|c\.tieba)\.baidu\.com\/(?:c\/(?:s\/sync|f\/(?:ad\/getFeedAd|frs\/(?:page|threadlist|generalTabList)|pb\/(?:pic)?page|excellent\/personalized))|tiebaads\/commonbatch)(?:\?|$)`,
        "https://tiebac.baidu.com/c/f/ad/getFeedAd?cmd=1",
      ),
    ],
    mitm: ["c.tieba.baidu.com", "tiebac.baidu.com"],
  }),
  defineApp({
    id: "baidu-map",
    name: "百度地图",
    description: "只匹配 qt=ads 的广告查询；保留地图、路线、定位和导航。",
    legacyGroups: ["Baidu Map"],
    rewrites: [
      rewrite(
        "广告查询",
        re`^https:\/\/newclient\.map\.baidu\.com\/client\/phpui2\/\?(?=[^#]*\bqt=ads(?:&|$))`,
      ),
    ],
    mitm: ["newclient.map.baidu.com"],
  }),
  defineApp({
    id: "baidu-input",
    name: "百度输入法",
    description: "启动广告和明确 advertisement 接口；保留词库、同步与输入服务。",
    legacyGroups: ["Baidu InputMethod"],
    rewrites: [
      rewrite(
        "启动广告",
        re`^https:\/\/mime\.baidu\.com\/v\d+\/IosStart\/getStartInfo(?:\?|$)`,
      ),
      rewrite(
        "活动广告",
        re`^https:\/\/mime\.baidu\.com\/v\d+\/activity\/advertisement(?:\/|\?|$)`,
      ),
    ],
    mitm: ["mime.baidu.com"],
  }),
  defineApp({
    id: "iqiyi",
    name: "爱奇艺",
    description: "广告信息、国际版广告接口与 oad 素材；不阻断播放、登录或会员状态。",
    legacyGroups: ["iQIYI"],
    auditDisposition: "partial",
    auditNote: "迁移广告命名明确的 4 类入口；旧 VIP interact/show 活动接口不迁移。",
    rewrites: [
      rewrite(
        "新广告信息",
        re`^https:\/\/iface\.iqiyi\.com\/api\/getNewAdInfo(?:\?|$)`,
      ),
      rewrite(
        "国际版广告",
        re`^https:\/\/intl\.iqiyi\.com\/(?:ad_external|video\/advertise)(?:\/|\?|$)`,
      ),
      rewrite(
        "oad 广告素材",
        re`^https:\/\/u\d+\.iqiyipic\.com\/image\/[^?#]+\/oad_[^?#]+`,
        "reject-img",
      ),
    ],
    mitm: ["iface.iqiyi.com", "intl.iqiyi.com", "*.iqiyipic.com"],
  }),
  defineApp({
    id: "beitai-kitchen",
    name: "贝太厨房",
    description: "iOS 启动推广接口；不匹配菜谱正文。",
    legacyGroups: ["BeiTaiKitchen"],
    rewrites: [
      rewrite(
        "启动推广",
        re`^https:\/\/channel\.beitaichufang\.com\/channel\/api\/v\d+\/promote\/ios\/start\/page(?:\?|$)`,
      ),
    ],
    mitm: ["channel.beitaichufang.com"],
  }),
  defineApp({
    id: "bishijie",
    name: "币世界",
    description: "advertising 专用入口；不匹配行情或账户。",
    legacyGroups: ["BiShiJie"],
    rewrites: [
      rewrite(
        "广告接口",
        re`^https:\/\/iapi\.bishijie\.com\/actopen\/v\d+\/advertising(?:\/|\?|$)`,
      ),
    ],
    mitm: ["iapi.bishijie.com"],
  }),
  defineApp({
    id: "beike",
    name: "贝壳找房",
    description: "启动 bootpage；保留房源、搜索、地图与账号。",
    legacyGroups: ["Beike"],
    rewrites: [
      rewrite(
        "启动页",
        re`^https:\/\/apps?\.api\.ke\.com\/config\/config\/bootpage(?:\?|$)`,
      ),
    ],
    mitm: ["app.api.ke.com", "apps.api.ke.com"],
  }),
  defineApp({
    id: "bodivis",
    name: "好轻 / Bodivis",
    description: "开屏广告接口；不匹配健康记录与设备数据。",
    legacyGroups: ["bodivis"],
    rewrites: [
      rewrite(
        "开屏广告",
        re`^https:\/\/www\.bodivis\.com\.cn\/app\/splashAdvertise(?:\?|$)`,
      ),
    ],
    mitm: ["www.bodivis.com.cn"],
  }),
  defineApp({
    id: "baby-health",
    name: "育学园 / 宝宝健康",
    description: "advert 专用路径；不匹配健康与成长数据。",
    legacyGroups: ["BabyHealth"],
    rewrites: [
      rewrite(
        "广告接口",
        re`^https:\/\/yxyapi\d+\.drcuiyutao\.com\/yxy-api-gateway\/api\/json\/advert(?:\/|\?|$)`,
      ),
    ],
    mitm: ["*.drcuiyutao.com"],
  }),
  defineApp({
    id: "china-mobile",
    name: "中国移动",
    description: "营销内容接口；不拒绝启动初始化、账户或话费查询。",
    legacyGroups: ["ChinaMobile"],
    auditDisposition: "partial",
    auditNote: "只迁移 market_content；原 startInit 可能含必要配置，保留。",
    rewrites: [
      rewrite(
        "营销内容",
        re`^https:\/\/wap\.js\.10086\.cn\/jsmccClient\/cd\/market_content\/api\/v\d+\/market_content\.page\.query(?:\?|$)`,
      ),
    ],
    mitm: ["wap.js.10086.cn"],
  }),
  defineApp({
    id: "china-unicom",
    name: "中国联通",
    description: "欢迎广告；不阻断账户列表或登录。",
    legacyGroups: ["ChinaUnicom"],
    auditDisposition: "partial",
    auditNote: "仅迁移 getWelcomeAd；原 accountListData 属于账号功能，明确移除。",
    rewrites: [
      rewrite(
        "欢迎广告",
        re`^https:\/\/m\.client\.10010\.com\/uniAdmsInterface\/getWelcomeAd(?:\?|$)`,
      ),
    ],
    mitm: ["m.client.10010.com"],
  }),
  defineApp({
    id: "cloud189",
    name: "天翼云盘",
    description: "旧开屏目录与当前 openscreen banner；保留登录、上传下载和文件列表。",
    legacyGroups: ["Cloud189"],
    rewrites: [
      rewrite(
        "开屏目录",
        re`^https:\/\/cloud\.189\.cn\/include\/splash(?:\/|$)`,
        "reject-img",
      ),
      rewrite(
        "开屏广告",
        re`^https:\/\/api\.cloud\.189\.cn\/guns\/getOpenscreenBanners(?:\?|$)`,
      ),
    ],
    mitm: ["cloud.189.cn", "api.cloud.189.cn"],
  }),
  defineApp({
    id: "cntv",
    name: "央视网 / CNTV",
    description: "广告投放目录；不匹配节目视频。",
    legacyGroups: ["CNTV"],
    rewrites: [
      rewrite(
        "广告目录",
        re`^https:\/\/www\.cntv\.cn\/nettv\/adp(?:\/|$)`,
      ),
    ],
    mitm: ["www.cntv.cn"],
  }),
  defineApp({
    id: "chelaile",
    name: "车来了",
    description: "adpub/advert、启动推广和城市通知中的显式广告；保留公交到站、定位和正常通知。",
    legacyGroups: ["Chelaile"],
    rewrites: [
      rewrite(
        "广告投放",
        re`^https:\/\/api\.chelaile\.net\.cn\/(?:adpub|goocity\/advert)(?:\/|\?|$)`,
      ),
      rewrite(
        "网页广告投放",
        re`^https:\/\/web\.chelaile\.net\.cn\/api\/adpub(?:\/|\?|$)`,
      ),
      rewrite(
        "启动跳过广告配置",
        re`^https:\/\/app\.ibuscloud\.com\/v\d+\/app\/getSkipAdvert(?:\?|$)`,
      ),
    ],
    scripts: [
      routerScript(
        "车来了_城市通知内显式广告",
        re`^https:\/\/app\.ibuscloud\.com\/v\d+\/notice\/getNoticeWithAdvByCity(?:\?|$)`,
        "https://app.ibuscloud.com/v2/notice/getNoticeWithAdvByCity",
        1048576,
      ),
    ],
    mitm: [
      "api.chelaile.net.cn",
      "web.chelaile.net.cn",
      "app.ibuscloud.com",
    ],
  }),
  defineApp({
    id: "caocao",
    name: "曹操出行",
    description: "advert-bss 专用服务；保留叫车、行程和支付。",
    legacyGroups: ["Caocao"],
    rewrites: [
      rewrite(
        "广告服务",
        re`^https:\/\/cap\.caocaokeji\.cn\/advert-bss(?:\/|\?|$)`,
      ),
    ],
    mitm: ["cap.caocaokeji.cn"],
  }),
  defineApp({
    id: "caijing",
    name: "财经网",
    description: "ad/advert 与启动广告页；保留新闻正文。",
    legacyGroups: ["CaijingNet"],
    rewrites: [
      rewrite(
        "广告接口",
        re`^https:\/\/api\.caijingmobile\.com\/(?:ad|advert)(?:\/|\?|$)`,
      ),
      rewrite(
        "iOS 启动广告",
        re`^https:\/\/m\.caijing\.com\.cn\/startup_ad_ios\.html(?:\?|$)`,
        "reject-200",
      ),
    ],
    mitm: ["api.caijingmobile.com", "m.caijing.com.cn"],
  }),
  defineApp({
    id: "csdn",
    name: "CSDN",
    description: "开屏广告接口；保留文章、搜索和账号。",
    legacyGroups: ["CSDN"],
    rewrites: [
      rewrite(
        "开屏广告",
        re`^https:\/\/(?:gw|app-gw)\.csdn\.net\/(?:cms-app\/v\d+\/home_page\/open_advertisement|silkroad-api\/api\/v\d+\/assemble\/list\/pub\/channel\/app_open_screen_ad)(?:\?|$)`,
      ),
    ],
    mitm: ["gw.csdn.net", "app-gw.csdn.net"],
  }),
  defineApp({
    id: "ctrip",
    name: "携程",
    description: "getAdsList 广告接口；保留搜索、预订、订单和支付。",
    legacyGroups: ["Ctrip"],
    rewrites: [
      rewrite(
        "广告列表",
        re`^https:\/\/m\.ctrip\.com\/restapi\/soa2\/\d+\/json\/getAdsList(?:\?|$)`,
      ),
    ],
    mitm: ["m.ctrip.com"],
  }),
  defineApp({
    id: "dewu",
    name: "得物",
    description: "advertisement 专用路径；保留商品、鉴别、订单和支付。",
    legacyGroups: ["DU"],
    rewrites: [
      rewrite(
        "广告接口",
        re`^https:\/\/app\.poizon\.com\/api\/v\d+\/app\/advertisement(?:\/|\?|$)`,
      ),
      rewrite(
        "广告接口（新主机）",
        re`^https:\/\/app\.dewu\.com\/api\/v\d+\/app\/advertisement(?:\/|\?|$)`,
      ),
    ],
    mitm: ["app.poizon.com", "app.dewu.com"],
  }),
  defineApp({
    id: "douban",
    name: "豆瓣",
    description: "开屏 app_ads；不宣称处理与正常内容混排的信息流广告。",
    legacyGroups: ["douban"],
    rewrites: [
      rewrite(
        "开屏广告",
        re`^https:\/\/api\.douban\.com\/v\d+\/app_ads(?:\/|\?|$)`,
      ),
    ],
    mitm: ["api.douban.com"],
  }),
  defineApp({
    id: "douyu",
    name: "斗鱼直播",
    description: "RTB 启动广告信息；不按直播素材 URL 猜测广告。",
    legacyGroups: ["DouYuZhiBo"],
    rewrites: [
      rewrite(
        "启动广告信息",
        re`^https:\/\/rtbapi\.douyucdn\.cn\/japi\/sign\/app\/getinfo(?:\?|$)`,
      ),
    ],
    mitm: ["rtbapi.douyucdn.cn"],
  }),
  defineApp({
    id: "dangdang",
    name: "当当",
    description: "设备启动页；不拒绝混合初始化接口。",
    legacyGroups: ["Dangdang"],
    auditDisposition: "partial",
    auditNote: "仅迁移 getDeviceStartPage；旧 action=init 可能含必要配置。",
    rewrites: [
      rewrite(
        "设备启动页",
        re`^https:\/\/e\.dangdang\.com\/media\/api\d*\.go\?(?=[^#]*\baction=getDeviceStartPage(?:&|$))`,
      ),
    ],
    mitm: ["e.dangdang.com"],
  }),
  defineApp({
    id: "daoyu",
    name: "叨鱼",
    description: "AppStartAd 专用接口；保留账号与游戏服务。",
    legacyGroups: ["Daoyu"],
    rewrites: [
      rewrite(
        "启动广告",
        re`^https:\/\/daoyu\.sdo\.com\/api\/userCommon\/getAppStartAd(?:\?|$)`,
      ),
    ],
    mitm: ["daoyu.sdo.com"],
  }),
  defineApp({
    id: "dida",
    name: "嘀嗒出行",
    description: "ad 服务与广告统计；保留叫车、行程和支付。",
    legacyGroups: ["Dida"],
    rewrites: [
      rewrite(
        "广告服务",
        re`^https:\/\/capis(?:-slb)?\.didapinche\.com\/ad(?:\/|\?|$)`,
      ),
      rewrite(
        "广告统计",
        re`^https:\/\/www\.didapinche\.com\/app\/adstat(?:\/|\?|$)`,
        "reject-200",
      ),
    ],
    mitm: ["capis.didapinche.com", "capis-slb.didapinche.com", "www.didapinche.com"],
  }),
  defineApp({
    id: "dianshijia",
    name: "电视家",
    description: "广告 API 与广告静态目录；不匹配直播流。",
    legacyGroups: ["Dianshijia"],
    rewrites: [
      rewrite(
        "广告 API",
        re`^https:\/\/api\.gaoqingdianshi\.com\/api\/v\d+\/ad(?:\/|\?|$)`,
      ),
      rewrite(
        "广告素材",
        re`^https:\/\/cdn\.dianshihome\.com\/static\/ad(?:\/|$)`,
        "reject-img",
      ),
    ],
    mitm: ["api.gaoqingdianshi.com", "cdn.dianshihome.com"],
  }),
  defineApp({
    id: "ddpai",
    name: "盯盯拍",
    description: "bootscreen 配置；保留设备连接、相册和固件功能。",
    legacyGroups: ["DDpai"],
    rewrites: [
      rewrite(
        "启动屏",
        re`^https:\/\/app\.ddpai\.com\/d\/api\/v\d+\/config\/get\/bootscreen(?:\?|$)`,
      ),
    ],
    mitm: ["app.ddpai.com"],
  }),
  defineApp({
    id: "dingdong-maicai",
    name: "叮咚买菜",
    description: "advert 专用服务；保留商品、购物车、订单、配送和支付。",
    legacyGroups: ["DingDongMaiCai"],
    rewrites: [
      rewrite(
        "广告接口",
        re`^https:\/\/maicai\.api\.ddxq\.mobi\/advert(?:\/|\?|$)`,
      ),
    ],
    mitm: ["maicai.api.ddxq.mobi"],
  }),
  defineApp({
    id: "elong",
    name: "艺龙",
    description: "adgateway 专用入口；保留搜索、预订、订单和支付。",
    legacyGroups: ["eLong"],
    rewrites: [
      rewrite(
        "广告网关",
        re`^https:\/\/mobileapi-v6\.elong\.com\/adgateway(?:\/|\?|$)`,
      ),
    ],
    mitm: ["mobileapi-v6.elong.com"],
  }),
  defineApp({
    id: "edaijia",
    name: "e代驾",
    description: "adsplash 素材；保留叫车、行程和支付。",
    legacyGroups: ["eDaijia"],
    rewrites: [
      rewrite(
        "开屏素材",
        re`^https:\/\/pic\.edaijia\.cn\/adsplash(?:\/|$)`,
        "reject-img",
      ),
    ],
    mitm: ["pic.edaijia.cn"],
  }),
  defineApp({
    id: "ezviz",
    name: "萤石云视频",
    description: "ads 专用 API；保留摄像头、直播和回放。",
    legacyGroups: ["ezviz ViedoGo"],
    rewrites: [
      rewrite("广告 API", re`^https:\/\/i\.ys7\.com\/api\/ads(?:\/|\?|$)`),
    ],
    mitm: ["i.ys7.com"],
  }),
  defineApp({
    id: "fotoable",
    name: "FOTOABLE",
    description: "Advertise 静态目录；不匹配用户作品。",
    legacyGroups: ["FOTOABLE"],
    rewrites: [
      rewrite(
        "广告素材",
        re`^https:\/\/cdn\.api\.fotoable\.com\/Advertise(?:\/|$)`,
        "reject-img",
      ),
    ],
    mitm: ["cdn.api.fotoable.com"],
  }),
  defineApp({
    id: "flyertea",
    name: "飞客茶馆",
    description: "module=advis 广告入口；保留帖子和账号。",
    legacyGroups: ["FlyerTea"],
    rewrites: [
      rewrite(
        "广告接口",
        re`^https:\/\/www\.flyertea\.com\/source\/plugin\/mobile\/mobile\.php\?(?=[^#]*\bmodule=advis(?:&|$))`,
      ),
    ],
    mitm: ["www.flyertea.com"],
  }),
  defineApp({
    id: "fengwatch",
    name: "凤凰秀 / 凤观",
    description: "带 adunitid 的广告投放请求；保留新闻和视频。",
    legacyGroups: ["FengWatch"],
    rewrites: [
      rewrite(
        "广告投放",
        re`^https:\/\/dsa-mfp\.fengshows\.cn\/mfp\/mfpMultipleDelivery\.do\?(?=[^#]*\badunitid\b)`,
      ),
    ],
    mitm: ["dsa-mfp.fengshows.cn"],
  }),
  defineApp({
    id: "feng",
    name: "威锋",
    description: "advertisement 启动入口；保留文章和论坛。",
    legacyGroups: ["feng"],
    rewrites: [
      rewrite(
        "启动广告",
        re`^https:\/\/api\.feng\.com\/v\d+\/advertisement\/[^?#]*Claunch(?:\?|$)`,
      ),
    ],
    mitm: ["api.feng.com"],
  }),
  defineApp({
    id: "facebeauty",
    name: "无他相机",
    description: "广告树与广告组件缓存；保留相机、素材和导出。",
    legacyGroups: ["FaceBeauty"],
    rewrites: [
      rewrite(
        "广告配置树",
        re`^https:\/\/api-release\.wuta-cam\.com\/ad_tree(?:\?|$)`,
      ),
      rewrite(
        "广告组件缓存",
        re`^https:\/\/res-release\.wuta-cam\.com\/json\/ads_component_cache\.json(?:\?|$)`,
      ),
    ],
    mitm: ["api-release.wuta-cam.com", "res-release.wuta-cam.com"],
  }),
  defineApp({
    id: "gofun",
    name: "GoFun 出行",
    description: "bootImage 启动图；保留租车、订单和支付。",
    legacyGroups: ["Gofun"],
    rewrites: [
      rewrite(
        "启动图",
        re`^https:\/\/gateway\.shouqiev\.com(?::8443)?\/fsda\/app\/bootImage\.json(?:\?|$)`,
      ),
    ],
    mitm: ["gateway.shouqiev.com"],
  }),
  defineApp({
    id: "hangzhou-city-card",
    name: "杭州市民卡",
    description: "ad 专用路径；保留卡片、乘车和支付。",
    legacyGroups: ["HangZhou CityzenCard"],
    rewrites: [
      rewrite(
        "广告接口",
        re`^https:\/\/smkmp\.96225\.com\/smkcenter\/ad(?:\/|\?|$)`,
      ),
    ],
    mitm: ["smkmp.96225.com"],
  }),
  defineApp({
    id: "huomao",
    name: "火猫直播",
    description: "loginAd 专用入口；保留登录和直播。",
    legacyGroups: ["Huomao"],
    rewrites: [
      rewrite(
        "登录广告",
        re`^https:\/\/api\.huomao\.com\/channels\/loginAd(?:\?|$)`,
      ),
    ],
    mitm: ["api.huomao.com"],
  }),
  defineApp({
    id: "huya",
    name: "虎牙直播",
    description: "advertiser 专用素材目录；信息流原生广告仍可能存在。",
    legacyGroups: ["Huya"],
    rewrites: [
      rewrite(
        "广告素材",
        re`^https:\/\/business\.msstatic\.com\/advertiser(?:\/|$)`,
        "reject-img",
      ),
    ],
    mitm: ["business.msstatic.com"],
  }),
  defineApp({
    id: "ifly-input",
    name: "讯飞输入法",
    description: "adservice 专用入口；保留语音识别、词库和同步。",
    legacyGroups: ["iFLY Input"],
    rewrites: [
      rewrite(
        "广告服务",
        re`^https:\/\/imeclient\.openspeech\.cn\/adservice(?:\/|\?|$)`,
      ),
    ],
    mitm: ["imeclient.openspeech.cn"],
  }),
  defineApp({
    id: "camscanner",
    name: "扫描全能王",
    description: "get_startpic 开屏接口；不修改会员、OCR 或导出。",
    legacyGroups: ["Intsig CamScaner"],
    rewrites: [
      rewrite(
        "开屏图片",
        re`^https:\/\/api\.intsig\.net\/user\/cs\/operating\/app\/get_startpic(?:\/|\?|$)`,
      ),
    ],
    mitm: ["api.intsig.net"],
  }),
  defineApp({
    id: "ireader",
    name: "掌阅 / iReader",
    description: "bookstore/self/zycl 广告入口；保留书架、阅读、同步和付费内容。",
    legacyGroups: ["iReader"],
    rewrites: [
      rewrite(
        "书城广告",
        re`^https:\/\/ih2\.ireader\.com\/zyapi\/bookstore\/ad(?:\/|\?|$)`,
      ),
      rewrite(
        "开屏广告",
        re`^https:\/\/ih2\.ireader\.com\/zyapi\/self\/screen\/ad(?:\/|\?|$)`,
      ),
      rewrite(
        "广告接口",
        re`^https:\/\/ih2\.ireader\.com\/zycl\/api\/ad(?:\/|\?|$)`,
      ),
    ],
    mitm: ["ih2.ireader.com"],
  }),
  defineApp({
    id: "inanning",
    name: "爱南宁",
    description: "advert 专用路径；保留政务和城市服务。",
    legacyGroups: ["inanning"],
    rewrites: [
      rewrite(
        "广告接口",
        re`^https:\/\/nnapp\.cloudbae\.cn:\d+\/mc\/api\/advert(?:\/|\?|$)`,
      ),
    ],
    mitm: ["nnapp.cloudbae.cn"],
  }),
  defineApp({
    id: "ifreetime",
    name: "iFreeTime",
    description: "splash 与爱阅书香固定广告入口；不匹配媒体、书库或用户数据。",
    legacyGroups: ["iFreeTime", "iFreeTimebook"],
    auditNote: "补入 2026 fmz200 固定提交仍在使用的爱阅书香精确入口；移除旧 GitHub Pages 镜像。",
    rewrites: [
      rewrite(
        "开屏接口",
        re`^https:\/\/api\.applovefrom\.com\/api\/v\d+\/splash(?:\/|\?|$)`,
      ),
      rewrite(
        "爱阅书香广告入口",
        re`^https:\/\/icc\.one\/iFreeTime\/xid32uxaoecnfv2(?:\/|\?|$)`,
      ),
    ],
    mitm: ["api.applovefrom.com", "icc.one"],
  }),
  defineApp({
    id: "icleaner",
    name: "iCleaner",
    description: "广告优先级配置文件；不修改清理功能。",
    legacyGroups: ["iCleaner"],
    rewrites: [
      rewrite(
        "广告优先级配置",
        re`^https:\/\/ib-soft\.net\/icleaner\/txt\/ad_priority\.txt(?:\?|$)`,
        "reject-200",
      ),
    ],
    mitm: ["ib-soft.net"],
  }),
  defineApp({
    id: "inoreader",
    name: "Inoreader",
    description: "adv 专用目录；保留订阅、文章和同步。",
    legacyGroups: ["Inoreader"],
    rewrites: [
      rewrite(
        "广告目录",
        re`^https:\/\/www\.inoreader\.com\/adv(?:\/|$)`,
        "reject-200",
      ),
    ],
    mitm: ["www.inoreader.com"],
  }),
  defineApp({
    id: "i4",
    name: "爱思助手",
    description: "启动广告信息；不阻断 App/设备信息查询。",
    legacyGroups: ["i4"],
    rewrites: [
      rewrite(
        "启动广告",
        re`^https:\/\/list-app-m\.i4\.cn\/(?:getopfstadinfo|adclickcb)\.xhtml(?:\?|$)`,
      ),
    ],
    mitm: ["list-app-m.i4.cn"],
  }),
  defineApp({
    id: "ikos-pro",
    name: "IKOS Pro",
    description: "广告命名目录；不匹配正常资源。",
    legacyGroups: ["IKOSPro"],
    rewrites: [
      rewrite(
        "广告素材",
        re`^https:\/\/tracker-download\.oss-cn-beijing\.aliyuncs\.com\/SIMPlus\/(?:ad_|AD\/)`,
        "reject-img",
      ),
    ],
    mitm: ["tracker-download.oss-cn-beijing.aliyuncs.com"],
  }),
  defineApp({
    id: "jxedt",
    name: "驾校一点通",
    description: "ad 专用 API；保留题库、学习记录和账号。",
    legacyGroups: ["JiaXiaoeDianTong"],
    rewrites: [
      rewrite("广告接口", re`^https:\/\/api\.jxedt\.com\/ad(?:\/|\?|$)`),
    ],
    mitm: ["api.jxedt.com"],
  }),
  defineApp({
    id: "jiakaobaodian",
    name: "驾考宝典",
    description: "advert-sdk 专用入口；保留题库与学习记录。",
    legacyGroups: ["JiaKaoBaoDian"],
    rewrites: [
      rewrite(
        "广告 SDK",
        re`^https:\/\/[^/]+\.kakamobi\.cn\/api\/open\/v\d+\/advert-sdk(?:\/|\?|$)`,
      ),
    ],
    mitm: ["*.kakamobi.cn"],
  }),
  defineApp({
    id: "jinse",
    name: "金色财经",
    description: "ad 专用 API；保留行情和文章。",
    legacyGroups: ["Jinse"],
    rewrites: [
      rewrite(
        "广告接口",
        re`^https:\/\/app-api\.jinse\.com\/v\d+\/ad(?:\/|\?|$)`,
      ),
    ],
    mitm: ["app-api.jinse.com"],
  }),
  defineApp({
    id: "kingsoft",
    name: "WPS / 金山词霸",
    description: "广告统计、广告服务、开屏和 feeds_ad 素材；不修改会员或文档功能。",
    legacyGroups: ["Kingsoft"],
    rewrites: [
      rewrite(
        "WPS 广告统计",
        re`^https:\/\/ios\.wps\.cn\/ad-statistics-service(?:\/|\?|$)`,
        "reject-200",
      ),
      rewrite(
        "金山广告服务",
        re`^https:\/\/[^/]+\.kingsoft-office-service\.com\/ad(?:\/|\?|$)`,
      ),
      rewrite(
        "词霸广告请求",
        re`^https:\/\/dict-mobile\.iciba\.com\/interface\/index\.php\?(?=[^#]*(?:\bc=ad\b|collectFeedsAdShowCount|KSFeedsAdCardViewController))`,
      ),
      rewrite(
        "词霸开屏",
        re`^https:\/\/service\.iciba\.com\/popo\/open\/screens\/v\d+\?(?=[^#]*\badjson\b)`,
      ),
      rewrite(
        "词霸信息流广告素材",
        re`^https:\/\/mobile-pic\.cache\.iciba\.com\/feeds_ad(?:\/|$)`,
        "reject-img",
      ),
    ],
    mitm: [
      "ios.wps.cn",
      "*.kingsoft-office-service.com",
      "dict-mobile.iciba.com",
      "service.iciba.com",
      "mobile-pic.cache.iciba.com",
    ],
  }),
  defineApp({
    id: "keep",
    name: "Keep",
    description: "ads 专用 API；保留训练、健康数据和账号，不删除正常课程。",
    legacyGroups: ["Keep"],
    rewrites: [
      rewrite("广告接口", re`^https:\/\/api\.gotokeep\.com\/ads(?:\/|\?|$)`),
    ],
    mitm: ["api.gotokeep.com"],
  }),
  defineApp({
    id: "kuaikan",
    name: "快看漫画",
    description: "ad/advertisement 专用 API；保留漫画、评论与购买。",
    legacyGroups: ["Kuaikan Comics"],
    rewrites: [
      rewrite(
        "广告接口",
        re`^https:\/\/api\.kkmh\.com\/v\d+\/(?:ad|advertisement)(?:\/|\?|$)`,
      ),
    ],
    mitm: ["api.kkmh.com"],
  }),
  defineApp({
    id: "laifeng",
    name: "来疯直播",
    description: "start/ads 接口；保留直播和账号。",
    legacyGroups: ["LaiFeng"],
    rewrites: [
      rewrite(
        "启动广告",
        re`^https:\/\/api\.laifeng\.com\/v\d+\/start\/ads(?:\?|$)`,
      ),
    ],
    mitm: ["api.laifeng.com"],
  }),
  defineApp({
    id: "lenovo",
    name: "联想社区",
    description: "open_ad 专用入口；保留社区内容。",
    legacyGroups: ["Lenovo"],
    rewrites: [
      rewrite(
        "开屏广告",
        re`^https:\/\/api\.club\.lenovo\.cn\/common\/open_ad(?:\?|$)`,
      ),
    ],
    mitm: ["api.club.lenovo.cn"],
  }),
  defineApp({
    id: "xiaomi-services",
    name: "小米服务 / 米家 / 小米金融",
    description: "adv、playScreen 与明确 _ad 接口；不拒绝 App 启动初始化或设备控制。",
    legacyGroups: ["MI"],
    auditDisposition: "partial",
    auditNote: "移除 api.m.mi.com/v*/app/start 和普通 recommendation/banner；只保留明确广告路径。",
    rewrites: [
      rewrite(
        "小米金融广告",
        re`^https:\/\/api\.jr\.mi\.com\/v\d+\/adv(?:\/|\?|$)`,
      ),
      rewrite(
        "小米金融开屏",
        re`^https:\/\/api\.jr\.mi\.com\/jr\/api\/playScreen(?:\?|$)`,
      ),
      rewrite(
        "小米运动明确广告",
        re`^https:\/\/api-mifit(?:-[^/.]+)?\.huami\.com\/discovery\/mi\/discovery\/[^/?#]+_ad(?:\?|$)`,
      ),
    ],
    mitm: ["api.jr.mi.com", "api-mifit.huami.com", "*.huami.com"],
  }),
  defineApp({
    id: "moji",
    name: "墨迹天气",
    description: "adoss/adlink 专用素材目录；保留天气、预警和定位。",
    legacyGroups: ["MojiWeather"],
    rewrites: [
      rewrite(
        "广告素材",
        re`^https:\/\/cdn\.moji\.com\/(?:adoss|adlink)(?:\/|$)`,
        "reject-img",
      ),
    ],
    mitm: ["cdn.moji.com"],
  }),
  defineApp({
    id: "manhuaren",
    name: "漫画人",
    description: "GetStartPageAds 开屏接口；保留漫画和收藏。",
    legacyGroups: ["ManHuaRen"],
    rewrites: [
      rewrite(
        "开屏广告",
        re`^https:\/\/mangaapi\.manhuaren\.com\/v\d+\/public\/getStartPageAds(?:\?|$)`,
      ),
    ],
    mitm: ["mangaapi.manhuaren.com"],
  }),
  defineApp({
    id: "meituan-dianping",
    name: "美团 / 大众点评",
    description: "精确开屏与 advertisement 接口；不采用共享 CDN 尺寸/文件名猜测。",
    legacyGroups: ["Meituan-Dianping"],
    auditDisposition: "partial",
    auditNote: "旧共享 CDN 规则隔离；采用 2026 fmz200 中仍存在的 loadsplashconfig、adshopping、startpicture 和小程序广告接口。",
    rewrites: [
      rewrite(
        "大众点评开屏",
        re`^https:\/\/mapi\.dianping\.com\/mapi\/operating\/(?:indexopsmodules|loadsplashconfig)(?:\?|$)`,
      ),
      rewrite(
        "大众点评广告购物位",
        re`^https:\/\/mapi\.dianping\.com\/adshopping(?:\?|$)`,
      ),
      rewrite(
        "美团启动图",
        re`^https:\/\/wmapi\.meituan\.com\/api\/v\d+\/(?:openscreen|startpicture)(?:\?|$)`,
      ),
      rewrite(
        "美团小程序广告",
        re`^https:\/\/rms\.meituan\.com\/api\/v\d+\/rmsmina\/c\/queryWechatAdvertisement(?:\?|$)`,
      ),
    ],
    scripts: [
      routerScript(
        "大众点评_首页显式广告",
        re`^https:\/\/mapi\.dianping\.com\/mapi\/intelliindex(?:\?|$)`,
        "https://mapi.dianping.com/mapi/intelliindex",
      ),
    ],
    mitm: ["mapi.dianping.com", "wmapi.meituan.com", "rms.meituan.com"],
  }),
  defineApp({
    id: "mwee",
    name: "美味不用等",
    description: "ad/getstartad 专用接口；保留排队和订座。",
    legacyGroups: ["mwee"],
    rewrites: [
      rewrite(
        "广告接口",
        re`^https:\/\/capi\.mwee\.cn\/app-api\/V\d+\/app\/(?:ad|getstartad)(?:\?|$)`,
      ),
    ],
    mitm: ["capi.mwee.cn"],
  }),
  defineApp({
    id: "miaopai",
    name: "秒拍",
    description: "ad 专用路径；保留视频。",
    legacyGroups: ["MiaoPai"],
    rewrites: [
      rewrite(
        "广告接口",
        re`^https:\/\/b-api\.ins\.miaopai\.com\/\d+\/ad(?:\/|\?|$)`,
      ),
    ],
    mitm: ["b-api.ins.miaopai.com"],
  }),
  defineApp({
    id: "mafengwo",
    name: "马蜂窝",
    description: "ad 专用路径；保留攻略、搜索和订单。",
    legacyGroups: ["Mafengwo"],
    rewrites: [
      rewrite(
        "广告接口",
        re`^https:\/\/mapi\.mafengwo\.cn\/(?:ad|travelguide\/ad)(?:\/|\?|$)`,
      ),
    ],
    mitm: ["mapi.mafengwo.cn"],
  }),
  defineApp({
    id: "mixc",
    name: "一点万象 / MixC",
    description: "ad 专用 API；保留会员卡和商场服务。",
    legacyGroups: ["MixC"],
    rewrites: [
      rewrite(
        "广告接口",
        re`^https:\/\/app\.mixcapp\.com\/mixc\/api\/v\d+\/ad(?:\/|\?|$)`,
      ),
    ],
    mitm: ["app.mixcapp.com"],
  }),
  defineApp({
    id: "netease-mail",
    name: "网易邮箱大师",
    description: "mmad 与 searchMultiAds/showAds；保留邮件收发、登录和附件。",
    legacyGroups: ["NetEase MailMaster"],
    rewrites: [
      rewrite(
        "邮箱广告配置",
        re`^https:\/\/appconf\.mail\.163\.com\/mmad(?:\/|\?|$)`,
      ),
      rewrite(
        "客户端广告配置",
        re`^https:\/\/client\.mail\.163\.com\/apptrack\/confinfo\/(?:searchMultiAds|showAds)(?:\.do)?(?:\?|$)`,
      ),
    ],
    mitm: ["appconf.mail.163.com", "client.mail.163.com"],
  }),
  defineApp({
    id: "netease-moneykeeper",
    name: "网易有钱",
    description: "searchMultiAds 专用配置；保留账本数据。",
    legacyGroups: ["NetEase MoneyKeeper"],
    rewrites: [
      rewrite(
        "广告配置",
        re`^https:\/\/client\.mail\.163\.com\/apptrack\/confinfo\/searchMultiAds(?:\.do)?(?:\?|$)`,
      ),
    ],
    mitm: ["client.mail.163.com"],
  }),
  defineApp({
    id: "netease-cloudmusic",
    name: "网易云音乐",
    description: "第一方 ad API 与明确广告域；保留音乐播放、歌单、评论和账号。",
    legacyGroups: ["NetEase CloudMusic"],
    rules: [
      "DOMAIN,iadmat.nosdn.127.net,REJECT",
      "DOMAIN,iadmusicmat.music.126.net,REJECT",
    ],
    rewrites: [
      rewrite(
        "广告 API",
        re`^https:\/\/(?:ipv4\.|interface\d*\.)?music\.163\.com\/(?:w?e?api|eapi)\/ad(?:\/|\?|$)`,
      ),
    ],
    mitm: ["music.163.com", "*.music.163.com"],
  }),
  defineApp({
    id: "netease-kaola",
    name: "网易考拉",
    description: "openad 开屏接口；保留商品、订单和支付。",
    legacyGroups: ["NetEase Kaola"],
    rewrites: [
      rewrite(
        "开屏广告",
        re`^https:\/\/sp\.kaola\.com\/api\/openad(?:\?|$)`,
      ),
    ],
    mitm: ["sp.kaola.com"],
  }),
  defineApp({
    id: "netease-you",
    name: "网易严选",
    description: "BootMedia 启动媒体；保留商品、订单和支付。",
    legacyGroups: ["NetEase You"],
    rewrites: [
      rewrite(
        "启动媒体",
        re`^https:\/\/support\.you\.163\.com\/xhr\/boot\/getBootMedia\.json(?:\?|$)`,
      ),
    ],
    mitm: ["support.you.163.com"],
  }),
  defineApp({
    id: "netease-snailread",
    name: "网易蜗牛读书",
    description: "ad 专用路径；保留阅读、书架和账号。",
    legacyGroups: ["NetEase SnailRead"],
    rewrites: [
      rewrite("广告接口", re`^https:\/\/p\.du\.163\.com\/ad(?:\/|\?|$)`),
    ],
    mitm: ["p.du.163.com"],
  }),
  defineApp({
    id: "national-geographic",
    name: "国家地理",
    description: "ad/adverts 专用路径；保留文章与图片。",
    legacyGroups: ["NationalGeographic", "NationalGeographicChina"],
    rewrites: [
      rewrite(
        "广告接口",
        re`^https:\/\/dili\.bdatu\.com\/jiekou\/ad(?:\/|\?|$)`,
      ),
      rewrite(
        "中国版广告",
        re`^https:\/\/wap\.ngchina\.cn\/news\/adverts(?:\/|\?|$)`,
      ),
    ],
    mitm: ["dili.bdatu.com", "wap.ngchina.cn"],
  }),
  defineApp({
    id: "niu",
    name: "小牛电动",
    description: "advertisement 专用 API；保留车辆和账号。",
    legacyGroups: ["NIU"],
    rewrites: [
      rewrite(
        "广告接口",
        re`^https:\/\/app-api\.niu\.com\/v\d+\/advertisement(?:\/|\?|$)`,
      ),
    ],
    mitm: ["app-api.niu.com"],
  }),
  defineApp({
    id: "naver-tv",
    name: "Naver TV",
    description: "广告调用接口；不匹配视频地址。",
    legacyGroups: ["Naver TV"],
    rewrites: [
      rewrite(
        "广告调用",
        re`^https:\/\/gfp\.veta\.naver\.com\/adcall(?:\?|$)`,
      ),
    ],
    mitm: ["gfp.veta.naver.com"],
  }),
  defineApp({
    id: "oray",
    name: "向日葵 / Oray",
    description: "ad/adver、iOS 启动和推广素材专用 API；保留远程控制、设备、更新和账号。",
    legacyGroups: ["Oray"],
    rewrites: [
      rewrite(
        "广告接口",
        re`^https:\/\/slapi\.oray\.net\/(?:client\/ad|adver)(?:\/|\?|$)`,
      ),
      rewrite(
        "iOS 启动与推广素材",
        re`^https:\/\/client-api-v2\.oray\.com\/materials\/(?:SUNLOGIN_CLIENT_IOS_PROMOTION|SLCC_IOS_STARTUP)(?:\?|$)`,
      ),
    ],
    mitm: ["slapi.oray.net", "client-api-v2.oray.com"],
  }),
  defineApp({
    id: "piaogen",
    name: "票根",
    description: "launchScreen 素材目录；保留票据业务。",
    legacyGroups: ["PiaoGen"],
    rewrites: [
      rewrite(
        "开屏素材",
        re`^https:\/\/pss\.txffp\.com\/piaogen\/images\/launchScreen(?:\/|$)`,
        "reject-img",
      ),
    ],
    mitm: ["pss.txffp.com"],
  }),
  defineApp({
    id: "pinduoduo",
    name: "拼多多",
    description: "cappuccino/splash 与专用 DSP 域；保留商品、订单和支付。",
    legacyGroups: ["Pinduoduo"],
    rules: ["DOMAIN,t-dsp.pinduoduo.com,REJECT"],
    rewrites: [
      rewrite(
        "开屏广告",
        re`^https:\/\/api\.(?:pinduoduo|yangkeduo)\.com\/api\/cappuccino\/splash(?:\?|$)`,
      ),
    ],
    mitm: ["api.pinduoduo.com", "api.yangkeduo.com"],
  }),
  defineApp({
    id: "peanut-wifi",
    name: "花生地铁 WiFi",
    description: "emptyAd/adNew 专用接口；保留联网认证。",
    legacyGroups: ["PeanutWiFi"],
    rewrites: [
      rewrite(
        "广告接口",
        re`^https:\/\/cmsapi\.wifi8\.com\/v\d+\/(?:emptyAd|adNew)(?:\/|\?|$)`,
      ),
    ],
    mitm: ["cmsapi.wifi8.com"],
  }),
  defineApp({
    id: "pconline",
    name: "太平洋电脑网 / 汽车网",
    description: "广告分析和 ad2p 接口；不阻断普通预加载。",
    legacyGroups: ["PConline"],
    auditDisposition: "partial",
    auditNote: "迁移广告命名明确的 4 条；旧 auto/info/preload 正常预加载接口不迁移。",
    rewrites: [
      rewrite(
        "广告分析",
        re`^https:\/\/agent-count\.pconline\.com\.cn\/counter\/adAnalyse(?:\/|\?|$)`,
        "reject-200",
      ),
      rewrite(
        "电脑网广告",
        re`^https:\/\/mrobot\.pconline\.com\.cn\/(?:v\d+\/ad2p|s\/onlineinfo\/ad)(?:\/|\?|$)`,
      ),
      rewrite(
        "汽车网广告",
        re`^https:\/\/mrobot\.pcauto\.com\.cn\/v\d+\/ad2p(?:\/|\?|$)`,
      ),
    ],
    mitm: [
      "agent-count.pconline.com.cn",
      "mrobot.pconline.com.cn",
      "mrobot.pcauto.com.cn",
    ],
  }),
  defineApp({
    id: "qyer",
    name: "穷游",
    description: "startpage 与 media/ad；不拒绝混合 config/get。",
    legacyGroups: ["QYER"],
    auditDisposition: "partial",
    auditNote: "迁移开屏和广告素材；配置接口保留。",
    rewrites: [
      rewrite(
        "启动页",
        re`^https:\/\/open\.qyer\.com\/qyer\/startpage(?:\/|\?|$)`,
      ),
      rewrite(
        "广告素材",
        re`^https:\/\/media\.qyer\.com\/ad(?:\/|$)`,
        "reject-img",
      ),
    ],
    mitm: ["open.qyer.com", "media.qyer.com"],
  }),
  defineApp({
    id: "qinbaobao",
    name: "亲宝宝",
    description: "ad 专用 API；保留相册和成长记录。",
    legacyGroups: ["Qinbaobao"],
    rewrites: [
      rewrite("广告接口", re`^https:\/\/api\.qbb6\.com\/ad(?:\/|\?|$)`),
    ],
    mitm: ["api.qbb6.com"],
  }),
  defineApp({
    id: "qidian",
    name: "起点读书",
    description: "getsplashscreen 开屏接口；保留书架、阅读、账号和付费内容。",
    legacyGroups: ["QDReader"],
    rewrites: [
      rewrite(
        "开屏广告",
        re`^https:\/\/mage\.if\.qidian\.com\/argus\/api\/v\d+\/client\/getsplashscreen(?:\?|$)`,
      ),
    ],
    mitm: ["mage.if.qidian.com"],
  }),
  defineApp({
    id: "rrtv",
    name: "人人视频",
    description: "广告配置/Advertising/ad 专用入口；保留视频播放和账号。",
    legacyGroups: ["RRtv"],
    rewrites: [
      rewrite(
        "广告配置",
        re`^https:\/\/msspjh\.emarbox\.com\/getAdConfig(?:\?|$)`,
      ),
      rewrite(
        "广告接口",
        re`^https:\/\/api\.videozhishi\.com\/api\/getAdvertising(?:\?|$)`,
      ),
      rewrite(
        "广告接口",
        re`^https:\/\/api\.rr\.tv\/ad(?:\/|\?|$)`,
      ),
    ],
    mitm: ["msspjh.emarbox.com", "api.videozhishi.com", "api.rr.tv"],
  }),
  defineApp({
    id: "relx",
    name: "RELX 悦刻",
    description: "screen/advert/random 专用入口；保留设备与账户功能。",
    legacyGroups: ["RELX"],
    rewrites: [
      rewrite(
        "开屏广告",
        re`^https:\/\/app\.relxtech\.com\/dianziyan-api\/api\/screen\/advert\/random(?:\?|$)`,
      ),
    ],
    mitm: ["app.relxtech.com"],
  }),
  defineApp({
    id: "tianqitong",
    name: "天气通",
    description: "tqtad/tqt_sdkad 与 advert API；保留天气和预警。",
    legacyGroups: ["tianqitong"],
    rewrites: [
      rewrite(
        "SDK 广告",
        re`^https:\/\/tqt\.weibo\.cn\/overall\/redirect\.php\?(?=[^#]*\br=(?:tqt_sdkad|tqtad)(?:&|$))`,
      ),
      rewrite(
        "广告接口",
        re`^https:\/\/tqt\.weibo\.cn\/(?:[^?#]*advert\.index|api\/advert)(?:\/|\?|$)`,
      ),
    ],
    mitm: ["tqt.weibo.cn"],
  }),
  defineApp({
    id: "sohu",
    name: "搜狐新闻",
    description: "adsense 与明确推广素材；不拒绝播放器 bootstrap 或正常控制配置。",
    legacyGroups: ["SOHU"],
    auditDisposition: "partial",
    auditNote: "迁移 adsense 和 tj 广告素材；旧播放器 switch/bootstrap 配置保留。",
    rewrites: [
      rewrite(
        "广告接口",
        re`^https:\/\/api\.k\.sohu\.com\/api\/news\/adsense(?:\?|$)`,
      ),
      rewrite(
        "推广素材",
        re`^https:\/\/pic\.k\.sohu\.com\/img\d+\/wb\/tj(?:\/|$)`,
        "reject-img",
      ),
    ],
    mitm: ["api.k.sohu.com", "pic.k.sohu.com"],
  }),
  defineApp({
    id: "smzdm",
    name: "什么值得买",
    description: "启动广告、thirdAd 与混合页面中的强标记广告；不修改会员或优惠权益。",
    legacyGroups: ["SMZDM"],
    auditNote: "结合 2026 fmz200 固定提交；只处理广告强信号，不采用 vip/creator 等权益改写。",
    rules: [
      "DOMAIN,aaid.uyunad.com,REJECT",
      "DOMAIN-SUFFIX,res-ga.smzdm.com,REJECT",
    ],
    rewrites: [
      rewrite(
        "启动广告",
        re`^https:\/\/(?:api|app-api)\.smzdm\.com\/(?:v\d+\/)?util\/loading(?:\?|$)`,
      ),
      rewrite(
        "第三方广告",
        re`^https:\/\/s\d+\.zdmimg\.com\/www\/api\/v\d+\/api\/thirdAd\.php(?:\?|$)`,
      ),
    ],
    scripts: [
      routerScript(
        "什么值得买_首页列表显式广告",
        re`^https:\/\/(?:homepage-api\.smzdm\.com\/v3\/home|haojia-api\.smzdm\.com\/(?:home\/list|ranking_list\/articles)|s-api\.smzdm\.com\/sou\/list_v10)(?:\?|$)`,
        "https://homepage-api.smzdm.com/v3/home",
      ),
    ],
    mitm: [
      "api.smzdm.com",
      "app-api.smzdm.com",
      "*.zdmimg.com",
      "homepage-api.smzdm.com",
      "haojia-api.smzdm.com",
      "s-api.smzdm.com",
    ],
  }),
  defineApp({
    id: "shouqi",
    name: "首汽约车",
    description: "recommendADs 专用接口；保留叫车、行程和支付。",
    legacyGroups: ["Shouqiyueche"],
    rewrites: [
      rewrite(
        "推荐广告",
        re`^https:\/\/gw-passenger\.01zhuanche\.com\/gw-passenger\/zhuanche-passengerController\/notk\/passenger\/recommendADs(?:\?|$)`,
      ),
    ],
    mitm: ["gw-passenger.01zhuanche.com"],
  }),
  defineApp({
    id: "suning",
    name: "苏宁易购",
    description: "ad 素材目录与广告位接口；保留商品、订单和支付。",
    legacyGroups: ["Suning"],
    rewrites: [
      rewrite(
        "广告素材",
        re`^https:\/\/image\.suning\.cn\/uimg\/ma\/ad(?:\/|$)`,
        "reject-img",
      ),
      rewrite(
        "广告位",
        re`^https:\/\/mpcs\.suning\.com\/mpcs\/dm\/getDmInfo(?:\?|$)`,
      ),
    ],
    mitm: ["image.suning.cn", "mpcs.suning.com"],
  }),
  defineApp({
    id: "sf-express",
    name: "顺丰速运",
    description: "app/ad 与 info-flow-adver；保留查件、寄件、支付和地址。",
    legacyGroups: ["SF Express"],
    rewrites: [
      rewrite(
        "App 广告",
        re`^https:\/\/ccsp-egmas\.sf-express\.com\/cx-app-base\/base\/app\/ad(?:\/|\?|$)`,
      ),
      rewrite(
        "信息流广告",
        re`^https:\/\/ucmp\.sf-express\.com\/proxy\/operation-platform\/info-flow-adver\/query(?:\?|$)`,
      ),
    ],
    mitm: ["ccsp-egmas.sf-express.com", "ucmp.sf-express.com"],
  }),
  defineApp({
    id: "sf-hive",
    name: "丰巢",
    description: "ad 专用 API；保留取件、寄件和账号。",
    legacyGroups: ["SF HiveConsumer"],
    rewrites: [
      rewrite(
        "广告接口",
        re`^https:\/\/consumer\.fcbox\.com\/v\d+\/ad(?:\/|\?|$)`,
      ),
    ],
    mitm: ["consumer.fcbox.com"],
  }),
  defineApp({
    id: "snail-sleep",
    name: "蜗牛睡眠",
    description: "screen 与 adTask；保留睡眠记录和音频。",
    legacyGroups: ["Snail Sleep"],
    rewrites: [
      rewrite(
        "开屏广告",
        re`^https:\/\/snailsleep\.net\/snail\/v\d+\/screen\/qn\/get(?:\?|$)`,
      ),
      rewrite(
        "广告任务",
        re`^https:\/\/snailsleep\.net\/snail\/v\d+\/adTask(?:\/|\?|$)`,
      ),
    ],
    mitm: ["snailsleep.net"],
  }),
  defineApp({
    id: "futu",
    name: "富途",
    description: "ad 专用 API；保留行情、交易和账号。",
    legacyGroups: ["FUTU"],
    rewrites: [
      rewrite(
        "广告接口",
        re`^https:\/\/api\d*\.futunn\.com\/(?:v\d+\/)?ad(?:\/|\?|$)`,
      ),
    ],
    mitm: ["api.futunn.com", "*.futunn.com"],
  }),
  defineApp({
    id: "tencent-game",
    name: "腾讯游戏启动广告",
    description: "splash_screen_info；不拦截游戏按钮、登录或对局接口。",
    legacyGroups: ["Tencent Game"],
    auditDisposition: "partial",
    auditNote: "只迁移明确 splash 接口；旧 game/buttons 可能是正常功能。",
    rewrites: [
      rewrite(
        "启动广告",
        re`^https:\/\/qt\.qq\.com\/lua\/mengyou\/get_splash_screen_info(?:\?|$)`,
      ),
    ],
    mitm: ["qt.qq.com"],
  }),
  defineApp({
    id: "tencent-map",
    name: "腾讯地图",
    description: "mwaSplash 开屏素材；保留地图、路线、定位和导航。",
    legacyGroups: ["Tencent Map"],
    rewrites: [
      rewrite(
        "开屏素材",
        re`^https:\/\/4gimg\.map\.qq\.com\/mwaSplash(?:\/|$)`,
        "reject-img",
      ),
    ],
    mitm: ["4gimg.map.qq.com"],
  }),
  defineApp({
    id: "tencent-sports",
    name: "腾讯体育",
    description: "SSP 广告入口；保留赛事、比分和视频。",
    legacyGroups: ["Tencent Sports"],
    rewrites: [
      rewrite(
        "SSP 广告",
        re`^https:\/\/news\.ssp\.qq\.com\/app(?:\/|\?|$)`,
      ),
    ],
    mitm: ["news.ssp.qq.com"],
  }),
  defineApp({
    id: "tencent-music",
    name: "QQ 音乐启动广告",
    description: "t_splash_info/targeted_ads 素材；保留音乐播放、歌单和账号。",
    legacyGroups: ["Tencent Music"],
    rewrites: [
      rewrite(
        "启动广告素材",
        re`^https:\/\/y\.gtimg\.cn\/music\/common\/upload\/(?:t_splash_info|targeted_ads)(?:\/|$)`,
        "reject-img",
      ),
    ],
    mitm: ["y.gtimg.cn"],
  }),
  defineApp({
    id: "tuniu",
    name: "途牛",
    description: "operation/splash 专用接口；保留搜索、预订、订单和支付。",
    legacyGroups: ["TuNiu"],
    rewrites: [
      rewrite(
        "开屏广告",
        re`^https:\/\/m\.tuniu\.com\/api\/operation\/splash(?:\/|\?|$)`,
      ),
    ],
    mitm: ["m.tuniu.com"],
  }),
  defineApp({
    id: "tvbc",
    name: "TVB / 埋堆堆直播",
    description: "ad/advert 专用 API；不匹配视频流。",
    legacyGroups: ["TVBCLive"],
    rewrites: [
      rewrite(
        "广告接口",
        re`^https:\/\/mob\.mddcloud\.com\.cn\/api\/(?:ad|advert)(?:\/|\?|$)`,
      ),
    ],
    mitm: ["mob.mddcloud.com.cn"],
  }),
  defineApp({
    id: "ucar",
    name: "神州专车",
    description: "adpos 素材目录；保留叫车、行程和支付。",
    legacyGroups: ["UCar"],
    rewrites: [
      rewrite(
        "广告位素材",
        re`^https:\/\/img\d+\.10101111cdn\.com\/adpos(?:\/|$)`,
        "reject-img",
      ),
    ],
    mitm: ["*.10101111cdn.com"],
  }),
  defineApp({
    id: "umeng-ads",
    name: "友盟广告消息",
    description: "admsg 专用入口；不阻断普通推送。",
    legacyGroups: ["Umeng"],
    rewrites: [
      rewrite(
        "广告消息",
        re`^https:\/\/msg\.umengcloud\.com\/admsg(?:\/|\?|$)`,
        "reject-200",
      ),
    ],
    mitm: ["msg.umengcloud.com"],
  }),
  defineApp({
    id: "umetrip",
    name: "航旅纵横",
    description: "advert 素材目录；保留航班、值机和行程。",
    legacyGroups: ["Umetrip"],
    rewrites: [
      rewrite(
        "广告素材",
        re`^https:\/\/img\.umetrip\.com\/fs\/advert(?:\/|$)`,
        "reject-img",
      ),
    ],
    mitm: ["img.umetrip.com"],
  }),
  defineApp({
    id: "vue-video",
    name: "VUE 视频",
    description: "ad 专用 API；保留编辑和导出。",
    legacyGroups: ["VUE"],
    rewrites: [
      rewrite(
        "广告接口",
        re`^https:\/\/api\.vuevideo\.net\/api\/v\d+\/ad(?:\/|\?|$)`,
      ),
    ],
    mitm: ["api.vuevideo.net"],
  }),
  defineApp({
    id: "variflight",
    name: "飞常准",
    description: "ad/advert 专用 API；保留航班和行程。",
    legacyGroups: ["VariFlight"],
    rewrites: [
      rewrite(
        "广告接口",
        re`^https:\/\/app\.variflight\.com\/(?:ad|v\d+\/advert)(?:\/|\?|$)`,
      ),
      rewrite(
        "广告接口",
        re`^https:\/\/api\.cdmcaac\.com\/ad(?:\/|\?|$)`,
      ),
    ],
    mitm: ["app.variflight.com", "api.cdmcaac.com"],
  }),
  defineApp({
    id: "vistopia",
    name: "看理想",
    description: "home/advertisement 专用接口；保留音频、购买和账号。",
    legacyGroups: ["VISTOPIA"],
    rewrites: [
      rewrite(
        "首页广告",
        re`^https:\/\/api\.vistopia\.com\.cn\/api\/v\d+\/home\/advertisement(?:\?|$)`,
      ),
    ],
    mitm: ["api.vistopia.com.cn"],
  }),
  defineApp({
    id: "wedoctor",
    name: "微医",
    description: "getpopad 专用弹窗；保留挂号、问诊和账号。",
    legacyGroups: ["WeDoctor"],
    rewrites: [
      rewrite(
        "广告弹窗",
        re`^https:\/\/app\.wy\.guahao\.com\/json\/white\/dayquestion\/getpopad(?:\?|$)`,
      ),
    ],
    mitm: ["app.wy.guahao.com"],
  }),
  defineApp({
    id: "weico",
    name: "Weico",
    description: "get_coopen_ads 专用接口；保留微博正文与账号。",
    legacyGroups: ["Weico"],
    rewrites: [
      rewrite(
        "合作广告",
        re`^https:\/\/overseas\.weico\.cc\/portal\.php\?(?=[^#]*\ba=get_coopen_ads(?:&|$))`,
      ),
    ],
    mitm: ["overseas.weico.cc"],
  }),
  defineApp({
    id: "weidian",
    name: "微店",
    description: "home.splash 开屏接口；保留商品、订单和支付。",
    legacyGroups: ["Weidian"],
    rewrites: [
      rewrite(
        "开屏广告",
        re`^https:\/\/thor\.weidian\.com\/ares\/home\.splash(?:\/|\?|$)`,
      ),
    ],
    mitm: ["thor.weidian.com"],
  }),
  defineApp({
    id: "wallstcn",
    name: "华尔街见闻",
    description: "advertising 专用 API；保留文章和行情。",
    legacyGroups: ["WallStCN"],
    rewrites: [
      rewrite(
        "广告接口",
        re`^https:\/\/api\.wallstcn\.com\/apiv\d+\/advertising(?:\/|\?|$)`,
      ),
    ],
    mitm: ["api.wallstcn.com"],
  }),
  defineApp({
    id: "xiachufang",
    name: "下厨房",
    description: "ad 专用 API；保留菜谱、收藏和账号。",
    legacyGroups: ["Xiachufang"],
    rewrites: [
      rewrite(
        "广告接口",
        re`^https:\/\/api\.xiachufang\.com\/v\d+\/ad(?:\/|\?|$)`,
      ),
    ],
    mitm: ["api.xiachufang.com"],
  }),
  defineApp({
    id: "xunyou",
    name: "迅游加速器",
    description: "splash_ad/ad_urls/ads 专用入口；保留加速和账号。",
    legacyGroups: ["Xunyou Game Booster"],
    rewrites: [
      rewrite(
        "广告配置",
        re`^https:\/\/portal-xunyou\.qingcdn\.com\/api\/v\d+\/ios\/configs\/(?:splash_ad|ad_urls)(?:\?|$)`,
      ),
      rewrite(
        "广告接口",
        re`^https:\/\/portal-xunyou\.qingcdn\.com\/api\/v\d+\/ios\/ads(?:\/|\?|$)`,
      ),
    ],
    mitm: ["portal-xunyou.qingcdn.com"],
  }),
  defineApp({
    id: "ximalaya",
    name: "喜马拉雅",
    description: "固定的广告专用域与混合响应中的强标记广告；不删除正常推荐、直播或会员入口。",
    legacyGroups: ["Ximalaya FM"],
    auditDisposition: "replaced",
    auditNote: "原规则只有漂移 IP；改用 2026 fmz200 仍维护的广告域，并对混合响应失败开放。",
    rules: [
      "DOMAIN,adsehera.ximalaya.com,REJECT",
      "DOMAIN,adse.wsa.ximalaya.com,REJECT",
      "DOMAIN,adbehavior.ximalaya.com,REJECT",
      "DOMAIN,adbehavior.wsa.ximalaya.com,REJECT",
      "DOMAIN-SUFFIX,ad.ximalaya.com,REJECT",
      "DOMAIN-SUFFIX,adse.ximalaya.com,REJECT",
      "DOMAIN-SUFFIX,adse-v2.ximalaya.com,REJECT",
    ],
    scripts: [
      routerScript(
        "喜马拉雅_信息流显式广告",
        re`^https:\/\/(?:mobile|mobilehera|mobwsa)\.ximalaya\.com\/(?:discovery-feed\/v\d+\/mix|football-portal\/diff2\/batch|mobile-playpage\/playpage\/tabs\/v2)(?:\/|\?|$)`,
        "https://mobile.ximalaya.com/discovery-feed/v3/mix",
      ),
    ],
    mitm: ["mobile.ximalaya.com", "mobilehera.ximalaya.com", "mobwsa.ximalaya.com"],
  }),
  defineApp({
    id: "xueqiu",
    name: "雪球",
    description: "promotion 中的展示/信息流/搜索广告；保留行情、交易和普通品牌搜索。",
    legacyGroups: ["Xueqiu"],
    auditDisposition: "partial",
    auditNote: "移除 IP 和 brand/search；仅保留 promotion 广告专用路径。",
    rewrites: [
      rewrite(
        "推广广告",
        re`^https:\/\/(?:api|promo)\.xueqiu\.com\/promotion\/(?:display_cache|display_ad|feed_display|search_ad)(?:\?|$)`,
      ),
    ],
    mitm: ["api.xueqiu.com", "promo.xueqiu.com"],
  }),
  defineApp({
    id: "xiaohongshu",
    name: "小红书",
    description: "开屏、广告资源、广告素材域与混合信息流中的强标记广告；保留笔记、评论和账号。",
    legacyGroups: ["Xiaohongshu"],
    auditNote: "交叉采用 2026 fmz200 固定提交；不移除水印、不拦 HTTPDNS、不删除普通搜索热词。",
    rules: [
      "DOMAIN,ads-img-qc.xhscdn.com,REJECT",
      "DOMAIN,ads-video-al.xhscdn.com,REJECT",
      "DOMAIN,ads-video-qc.xhscdn.com,REJECT",
      "DOMAIN,t-ads.xiaohongshu.com,REJECT",
    ],
    rewrites: [
      rewrite(
        "广告资源",
        re`^https:\/\/www\.xiaohongshu\.com\/api\/sns\/v\d+\/ads\/resource(?:\?|$)`,
      ),
      rewrite(
        "营销弹窗",
        re`^https:\/\/www\.xiaohongshu\.com\/api\/marketing\/box\/trigger(?:\?|$)`,
      ),
    ],
    scripts: [
      routerScript(
        "小红书_开屏和信息流显式广告",
        re`^https:\/\/(?:edith|rec|www|so)\.xiaohongshu\.com\/api\/sns\/(?:v\d+\/system_service\/(?:splash_config|config)|v\d+\/(?:homefeed|search\/(?:notes|banner_list|hot_list)|note\/widgets))(?:\?|$)`,
        "https://edith.xiaohongshu.com/api/sns/v1/system_service/splash_config",
      ),
    ],
    mitm: [
      "www.xiaohongshu.com",
      "edith.xiaohongshu.com",
      "rec.xiaohongshu.com",
      "so.xiaohongshu.com",
    ],
  }),
  defineApp({
    id: "yinxiang",
    name: "印象笔记",
    description: "ads 专用路径；保留笔记、同步和账号。",
    legacyGroups: ["YinxiangNote"],
    rewrites: [
      rewrite(
        "广告接口",
        re`^https:\/\/app\.yinxiang\.com\/ads(?:\/|\?|$)`,
      ),
    ],
    mitm: ["app.yinxiang.com"],
  }),
  defineApp({
    id: "yunmai",
    name: "云麦好轻",
    description: "ios/ad 专用 API；保留健康与设备数据。",
    legacyGroups: ["YUNMAI"],
    rewrites: [
      rewrite(
        "广告接口",
        re`^https:\/\/restapi\.iyunmai\.com\/api\/ios\/ad(?:\/|\?|$)`,
      ),
    ],
    mitm: ["restapi.iyunmai.com"],
  }),
  defineApp({
    id: "zhuishushenqi",
    name: "追书神器",
    description: "advert 与 iOS 开屏；保留通知、书架同步、更新检查和付费内容。",
    legacyGroups: ["zhuishushenqi"],
    auditNote: "只迁移 2 类广告接口；移除 notification、bookshelf-updated 与 iTunes lookup。",
    rewrites: [
      rewrite(
        "广告接口",
        re`^https:\/\/(?:api|b)\.zhuishushenqi\.com\/advert(?:\/|\?|$)`,
      ),
      rewrite(
        "iOS 开屏",
        re`^https:\/\/api\.zhuishushenqi\.com\/splashes\/ios(?:\?|$)`,
      ),
    ],
    mitm: ["api.zhuishushenqi.com", "b.zhuishushenqi.com"],
  }),
  defineApp({
    id: "zuoyebang",
    name: "作业帮",
    description: "adx 专用入口；保留题目、课程和账号。",
    legacyGroups: ["Zuoyebang"],
    rewrites: [
      rewrite(
        "广告交易",
        re`^https:\/\/www\.zybang\.com\/adx(?:\/|\?|$)`,
      ),
    ],
    mitm: ["www.zybang.com"],
  }),
  defineApp({
    id: "zuiyou",
    name: "最右",
    description: "ad 专用 API；保留帖子、评论和账号。",
    legacyGroups: ["ZUIYOU"],
    rewrites: [
      rewrite(
        "广告接口",
        re`^https:\/\/api\.izuiyou\.com\/ad(?:\/|\?|$)`,
      ),
    ],
    mitm: ["api.izuiyou.com"],
  }),
  defineApp({
    id: "zhan",
    name: "小站教育",
    description: "newAd 专用接口；保留课程和学习记录。",
    legacyGroups: ["Zhan"],
    rewrites: [
      rewrite(
        "广告接口",
        re`^https:\/\/tiku\.zhan\.com\/Common\/newAd(?:\/|\?|$)`,
      ),
    ],
    mitm: ["tiku.zhan.com"],
  }),
  defineApp({
    id: "zhangyue",
    name: "掌阅广告服务",
    description: "zycl/api/ad 与 saad/ad；保留书架、阅读、账号和付费内容。",
    legacyGroups: ["Zhangyue"],
    rewrites: [
      rewrite(
        "广告接口",
        re`^https:\/\/webboot\.zhangyue\.com\/zycl\/api\/ad(?:\/|\?|$)`,
      ),
      rewrite(
        "广告服务",
        re`^https:\/\/saad\.ms\.zhangyue\.net\/ad(?:\/|\?|$)`,
      ),
    ],
    mitm: ["webboot.zhangyue.com", "saad.ms.zhangyue.net"],
  }),
  defineApp({
    id: "cainiao",
    name: "菜鸟",
    description: "ads.mshow/flyad 广告专用 MTop 接口；保留物流、取件、寄件和账号。",
    auditNote: "采用 2026 fmz200 固定提交中的广告专用入口，不启用调研弹窗和非广告 UI 删除。",
    rewrites: [
      rewrite(
        "广告展示",
        re`^https:\/\/(?:guide-acs\.m\.taobao|[^/]+\.cainiao)\.com\/gw\/mtop\.cainiao\.guoguo\.nbnetflow\.ads\.mshow(?:\.cn)?(?:\/|\?|$)`,
      ),
      rewrite(
        "飞行广告",
        re`^https:\/\/guide-acs\.m\.taobao\.com\/gw\/mtop\.cainiao\.adx\.flyad\.getad(?:\/|\?|$)`,
      ),
    ],
    mitm: ["guide-acs.m.taobao.com", "*.cainiao.com"],
  }),
  defineApp({
    id: "railway-12306",
    name: "铁路 12306",
    description: "官方 ad.12306.cn 广告服务；保留登录、购票、订单和支付。",
    rules: ["DOMAIN,ad.12306.cn,REJECT"],
  }),
  defineApp({
    id: "coolapk",
    name: "酷安",
    description: "首页、详情与回复列表中仅删除带强广告标记的对象；解析失败原样返回。",
    auditNote: "采用 2026 fmz200 当前入口，但不使用外部脚本和 URL 跳转便利功能。",
    scripts: [
      routerScript(
        "酷安_显式广告",
        re`^https:\/\/api\.coolapk\.com\/v6\/(?:feed\/(?:detail|replyList)|main\/(?:dataList|indexV8|init)|page\/dataList)(?:\?|$)`,
        "https://api.coolapk.com/v6/main/indexV8",
      ),
    ],
    mitm: ["api.coolapk.com"],
  }),
  defineApp({
    id: "quark",
    name: "夸克",
    description: "open-cms 混合响应中只删除强广告标记对象；保留搜索、网盘和账号。",
    auditNote: "采用 2026 fmz200 当前入口；不复制来源不明的远程脚本。",
    scripts: [
      routerScript(
        "夸克_CMS显式广告",
        re`^https:\/\/open-cms-api\.(?:uc|quark)\.cn\/open-cms(?:\/|\?|$)`,
        "https://open-cms-api.quark.cn/open-cms",
      ),
    ],
    mitm: ["open-cms-api.uc.cn", "open-cms-api.quark.cn"],
  }),
  defineApp({
    id: "didi",
    name: "滴滴出行",
    description: "首页/feed/activity/营销通知混合响应中只删除强广告标记对象；保留叫车、行程、安全通知、支付和账号。",
    auditNote: "采用 2026 fmz200 当前入口并补回原聚合模块的 getRuled/getPreload/getPasMultiNotices；不整接口拒绝。",
    scripts: [
      routerScript(
        "滴滴_显式广告",
        re`^https:\/\/(?:ct\.xiaojukeji\.com\/agent\/v3\/feeds|res\.xiaojukeji\.com\/resapi\/activity\/(?:xpget|mget|get(?:Ruled|Preload|PasMultiNotices))|conf\.diditaxi\.com\.cn\/(?:homepage\/v\d+\/other\/fast|dynamic\/conf))(?:\?|$)`,
        "https://ct.xiaojukeji.com/agent/v3/feeds",
      ),
    ],
    mitm: ["ct.xiaojukeji.com", "res.xiaojukeji.com", "conf.diditaxi.com.cn"],
  }),
  defineApp({
    id: "fliggy",
    name: "飞猪",
    description: "当前开屏/营销屏资源接口；保留搜索、预订、订单和支付。",
    legacyGroups: ["Fliggy"],
    auditNote: "与 2026 fmz200 固定提交交叉确认；不采用共享 alicdn 图片尺寸规则。",
    rewrites: [
      rewrite(
        "营销屏资源",
        re`^https:\/\/acs\.m\.taobao\.com\/gw\/mtop\.fliggy\.crm\.screen\.(?:allresource|predict)(?:\/|\?|$)`,
      ),
      rewrite(
        "启动活动资源",
        re`^https:\/\/acs\.m\.taobao\.com\/gw\/mtop\.trip\.activity\.querytmsresources\/1\.0\?(?=[^#]*\btype=originaljson(?:&|$))`,
      ),
    ],
    mitm: ["acs.m.taobao.com"],
  }),
  defineApp({
    id: "netease-news",
    name: "网易新闻",
    description: "当前 nc/gl 启动推广入口；保留新闻、评论和账号。",
    legacyGroups: ["NetEase News"],
    auditNote: "旧含义不明路径已与 2026 fmz200 独立模块交叉确认。",
    rewrites: [
      rewrite(
        "启动推广",
        re`^https:\/\/c\.m\.163\.com\/nc\/gl(?:\/|\?|$)`,
        "reject-200",
      ),
    ],
    mitm: ["c.m.163.com"],
  }),
  defineApp({
    id: "shihuo",
    name: "识货",
    description: "当前 sh-adapi 开屏/广告接口；不阻断普通设备信息上报。",
    legacyGroups: ["Shihuo"],
    auditNote: "用 2026 fmz200 的广告专用 API 替代原 saveAppInfo 通用接口。",
    rewrites: [
      rewrite(
        "开屏与广告",
        re`^https:\/\/sh-gateway\.shihuo\.cn\/v\d+\/services\/sh-adapi\/home\/(?:screen|ad)(?:\?|$)`,
      ),
    ],
    mitm: ["sh-gateway.shihuo.cn"],
  }),
  defineApp({
    id: "kuwo",
    name: "酷我音乐",
    description: "广告专用域和混合推荐响应中的强广告标记；不修改会员、付费或音乐地址。",
    legacyGroups: ["KOOWO"],
    auditDisposition: "replaced",
    auditNote: "用 2026 fmz200 的域名和入口替代原静态 IP；明确排除会员处理器。",
    rules: [
      "DOMAIN,mobilead.kuwo.cn,REJECT",
      "DOMAIN,rich.kuwo.cn,REJECT",
      "DOMAIN-SUFFIX,ad.kuwo.cn,REJECT",
      "DOMAIN-SUFFIX,deliver.kuwo.cn,REJECT",
    ],
    scripts: [
      routerScript(
        "酷我音乐_显式广告",
        re`^https:\/\/(?:mgxhtj|nmobi|searchrecterm)\.kuwo\.cn\/(?:mgxh|mobi|recterm)\.s(?:\?|$)`,
        "https://nmobi.kuwo.cn/mobi.s",
      ),
    ],
    mitm: ["mgxhtj.kuwo.cn", "nmobi.kuwo.cn", "searchrecterm.kuwo.cn"],
  }),
  defineApp({
    id: "boohee",
    name: "薄荷健康",
    description: "当前弹窗/推广横幅与混合首页中的强广告标记；保留健康记录、设备和账号。",
    legacyGroups: ["boohee"],
    auditDisposition: "replaced",
    auditNote: "用 2026 fmz200 当前 API 替代原漂移 IP；不删除搜索、消息或健康功能。",
    rewrites: [
      rewrite(
        "设备页推广横幅",
        re`^https:\/\/api\.boohee\.com\/meta-interface\/v1\/index\/sensor-banners(?:\?|$)`,
      ),
      rewrite(
        "营销弹窗配置",
        re`^https:\/\/bohe\.sfo-tx-shanghai-01\.saas\.sensorsdata\.cn\/api\/v2\/sfo\/user_popup_configs(?:\?|$)`,
      ),
    ],
    scripts: [
      routerScript(
        "薄荷健康_首页显式广告",
        re`^https:\/\/api\.boohee\.com\/meta-interface\/(?:v2\/index|v1\/index\/plaza)(?:\?|$)`,
        "https://api.boohee.com/meta-interface/v2/index",
      ),
    ],
    mitm: [
      "api.boohee.com",
      "bohe.sfo-tx-shanghai-01.saas.sensorsdata.cn",
    ],
  }),
  defineApp({
    id: "foodie",
    name: "Foodie",
    description: "banner/notice 混合响应中只删除强广告标记；普通公告原样保留。",
    legacyGroups: ["Foodie"],
    auditNote: "不再整接口拒绝，改为本地失败开放过滤，规避误删正常 notice。",
    scripts: [
      routerScript(
        "Foodie_显式广告",
        re`^https:\/\/foodie-api\.yiruikecorp\.com\/v\d+\/(?:banner|notice)\/overview(?:\?|$)`,
        "https://foodie-api.yiruikecorp.com/v1/banner/overview",
      ),
    ],
    mitm: ["foodie-api.yiruikecorp.com"],
  }),
  defineApp({
    id: "hanju-tv",
    name: "韩剧 TV",
    description: "旧启动响应中只删除强广告标记；无法识别时原样返回。",
    legacyGroups: ["HanjuTV"],
    auditNote: "旧 kp 接口含义不透明，因此从直接拒绝降级为本地强信号过滤。",
    scripts: [
      routerScript(
        "韩剧TV_启动显式广告",
        re`^https:\/\/api\.hanju\.koudaibaobao\.com\/api\/carp\/kp(?:\?|$)`,
        "https://api.hanju.koudaibaobao.com/api/carp/kp",
      ),
    ],
    mitm: ["api.hanju.koudaibaobao.com"],
  }),
  defineApp({
    id: "mogo-renter",
    name: "蘑菇租房",
    description: "首页启动响应中只删除强广告标记；保留房源和账号。",
    legacyGroups: ["MogoRenter"],
    auditNote: "startHomePage 不是广告专用路径，改为本地失败开放过滤。",
    scripts: [
      routerScript(
        "蘑菇租房_首页显式广告",
        re`^https:\/\/api\.mgzf\.com\/renter-operation\/home\/startHomePage(?:\?|$)`,
        "https://api.mgzf.com/renter-operation/home/startHomePage",
      ),
    ],
    mitm: ["api.mgzf.com"],
  }),
  defineApp({
    id: "score",
    name: "球多多 / SCore",
    description: "guideimage 响应中只删除强广告标记；保留赛事内容。",
    legacyGroups: ["SCore"],
    auditNote: "guideimage 可能兼有正常引导，改为本地失败开放过滤。",
    scripts: [
      routerScript(
        "SCore_引导页显式广告",
        re`^https:\/\/api\.qiuduoduo\.cn\/guideimage(?:\?|$)`,
        "https://api.qiuduoduo.cn/guideimage",
      ),
    ],
    mitm: ["api.qiuduoduo.cn"],
  }),
  defineApp({
    id: "xiaochao-brain",
    name: "小潮脑 / 小睡眠",
    description: "startup 响应中只删除强广告标记；保留睡眠内容。",
    legacyGroups: ["XiaoChaoBrain"],
    auditNote: "startup 不是广告专用路径，改为本地失败开放过滤。",
    scripts: [
      routerScript(
        "小潮脑_启动显式广告",
        re`^https:\/\/api\.psy-1\.com\/cosleep\/startup(?:\?|$)`,
        "https://api.psy-1.com/cosleep/startup",
      ),
    ],
    mitm: ["api.psy-1.com"],
  }),
  defineApp({
    id: "yizhibo",
    name: "一直播",
    description: "配置响应中只删除强广告标记；保留直播和账号。",
    legacyGroups: ["YXLiveVideo"],
    auditNote: "api_pz/pz 含义混合，改为本地失败开放过滤。",
    scripts: [
      routerScript(
        "一直播_配置显式广告",
        re`^https:\/\/api\.yizhibo\.com\/common\/api\/(?:api_pz|pz)(?:\?|$)`,
        "https://api.yizhibo.com/common/api/api_pz",
      ),
    ],
    mitm: ["api.yizhibo.com"],
  }),
  defineApp({
    id: "youku",
    name: "优酷",
    description: "当前开屏、信息流、搜索和播放页显式广告；保留正片、播放地址、账号和会员状态。",
    legacyGroups: ["YOUKU"],
    auditDisposition: "partial",
    auditNote: "用 2026 fmz200 当前 JSON 结构替代旧视频 CDN 文件名猜测；只删除明确 ad/ykad、广告组件和固定广告卡 ID。",
    rewrites: [
      rewrite(
        "播放页营销弹层",
        re`^https:\/\/acs\.youku\.com\/gw\/mtop\.youku\.(?:pisp\.scripts\.get|xspace\.(?:play\.position\.preload|poplayer\.position)\.query)(?:\/|\?|$)`,
      ),
    ],
    scripts: [
      routerScript(
        "优酷_显式广告",
        re`^https:\/\/(?:(?:acs\.youku\.com\/gw\/mtop\.youku\.(?:columbus\.(?:gateway\.new\.execute|home\.(?:feed|query)|uc\.query|ycp\.query)|soku\.yksearch)|un-acs\.youku\.com\/gw\/mtop\.youku\.play\.ups\.appinfo\.get)(?:\/|\?|$)|push\.m\.youku\.com\/collect-api\/get_push_interval_config_wx(?:\?|$))`,
        "https://un-acs.youku.com/gw/mtop.youku.play.ups.appinfo.get/1.0",
        4194304,
      ),
    ],
    mitm: ["acs.youku.com", "un-acs.youku.com", "push.m.youku.com"],
  }),
  defineApp({
    id: "yueme-tv",
    name: "悦Me TV",
    description: "当前域名上的启动配置只删除强广告标记；不再匹配漂移 IP 或整响应拒绝。",
    legacyGroups: ["YueMeTV"],
    auditDisposition: "replaced",
    auditNote: "用 2026 blackmatrix7 固定提交中的当前域名替代原 IP，并降级为本地失败开放过滤。",
    scripts: [
      routerScript(
        "悦MeTV_启动显式广告",
        re`^https:\/\/zjh5api\.189smarthome\.com:\d+\/xygj-config-api\/queryData(?:\?|$)`,
        "https://zjh5api.189smarthome.com:8091/xygj-config-api/queryData",
      ),
    ],
    mitm: ["zjh5api.189smarthome.com"],
  }),
  defineApp({
    id: "sogou-input",
    name: "搜狗输入法",
    description: "iOS 启动推广页；保留输入、词库、账号和更新。",
    legacyGroups: ["SOGO"],
    auditDisposition: "replaced",
    auditNote: "原分组没有启用规则；补入 2026 fmz200 固定提交仍在使用的 iOS 启动推广精确路径。",
    rewrites: [
      rewrite(
        "iOS 启动推广页",
        re`^https:\/\/ios\.sogou\.com\/[^/]+\/sogou_input_[^/]+\/[^/]+\/index\.html(?:\?|$)`,
        "reject-200",
      ),
    ],
    mitm: ["ios.sogou.com"],
  }),
  defineApp({
    id: "super-friday",
    name: "超级课程表 / SuperFriday",
    description: "专用广告子域；不再使用旧漂移 IP。",
    legacyGroups: ["SuperFriday"],
    auditDisposition: "replaced",
    auditNote: "用 2026 fmz200 固定提交仍在使用的 ad.myfriday.cn 替代原 IP。",
    rules: ["DOMAIN,ad.myfriday.cn,REJECT"],
  }),
  defineApp({
    id: "waitwaitpay",
    name: "等等付 / WaitWaitPay",
    description: "启动 splash 精确接口；保留商户、支付和账户接口。",
    legacyGroups: ["WaitWaitPay"],
    auditDisposition: "replaced",
    auditNote: "原分组只有注释；补入 2026 blackmatrix7 固定提交仍启用的 splash 精确路径。",
    rewrites: [
      rewrite(
        "启动页",
        re`^https:\/\/api\.waitwaitpay\.com\/+api\/splash(?:\/|\?|$)`,
      ),
    ],
    mitm: ["api.waitwaitpay.com"],
  }),
  defineApp({
    id: "zhibo8",
    name: "直播吧 / 球迷报",
    description: "活动和 iOS 配置响应中只删除强广告标记；保留赛事、比分和普通配置。",
    legacyGroups: ["zhibo8"],
    auditDisposition: "partial",
    auditNote: "当前 fmz200/blackmatrix7 仍使用相同域名；从整响应拒绝改为本地失败开放过滤，并移除旧漂移 IP。",
    scripts: [
      routerScript(
        "直播吧_配置显式广告",
        re`^https:\/\/a\.qiumibao\.com\/(?:activities\/config\.php|ios\/config\/)(?:\?|$)`,
        "https://a.qiumibao.com/ios/config/?version_code=1",
      ),
    ],
    mitm: ["a.qiumibao.com"],
  }),
  defineApp({
    id: "lechange",
    name: "乐橙 / Lechange",
    description: "只拒绝明确命名的 advertisementPush 营销推送接口；保留设备告警、实时预览和账号通知。",
    auditDisposition: "replaced",
    auditNote: "从 adultraplus 的宽松通配写法收窄到固定主机与精确 advertisementPush 路径。",
    rewrites: [
      rewrite(
        "营销推送",
        re`^https:\/\/dl-cu-hz\.lechange\.cn\/oms-online\/advertisementPush(?:\/|\?|$)`,
      ),
    ],
    mitm: ["dl-cu-hz.lechange.cn"],
  }),
  defineApp({
    id: "huazhu",
    name: "华住会",
    description: "酒店广告接口与弹窗通知中的显式广告；保留预订、订单、会员、更新和正常服务通知。",
    auditDisposition: "partial",
    auditNote: "保留原聚合模块的广告路径；弹窗混合响应改为本地强信号过滤，不阻断 bundle/upgrade/check。",
    rewrites: [
      rewrite(
        "酒店广告接口",
        re`^https:\/\/hweb-manager\.huazhu\.com\/hotels\/ad(?:\/|\?|$)`,
      ),
    ],
    scripts: [
      routerScript(
        "华住会_弹窗内显式广告",
        re`^https:\/\/hweb-manager\.huazhu\.com\/notice\/getAppPopupNotifyAlert(?:\?|$)`,
        "https://hweb-manager.huazhu.com/notice/getAppPopupNotifyAlert",
        1048576,
      ),
    ],
    mitm: ["hweb-manager.huazhu.com"],
  }),
  defineApp({
    id: "youtube-plus",
    name: "YouTube++ 第三方客户端",
    description: "第三方客户端 pagead 专用 API；不影响官方 YouTube 组件。",
    legacyGroups: ["Youtube++"],
    rewrites: [
      rewrite(
        "页面广告",
        re`^https:\/\/api\.catch\.gift\/api\/v\d+\/pagead(?:\/|\?|$)`,
      ),
    ],
    mitm: ["api.catch.gift"],
  }),
];

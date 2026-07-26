import { legacyApps } from "./legacy-apps.mjs";

const re = String.raw;

export const project = Object.freeze({
  owner: "STERILITZIA02",
  repository: "Blockad-sr-my",
  defaultRef: "main",
  version: "1.1.0",
  generatedOn: "2026-07-26",
});

export const apps = [
  {
    id: "general-networks",
    name: "通用广告网络",
    description: "固定版本的社区广告域名规则；负责原聚合模块中的长尾 App 与第三方广告 SDK。",
    unified: true,
    rules: ["RULE-SET,@AWA_RULE_URL@,REJECT"],
    rewrites: [],
    scripts: [],
    mitm: [],
  },
  {
    id: "qq",
    name: "QQ / 腾讯系广告",
    description: "GDT 广告请求、素材与腾讯新闻开屏；不拦截 QQ 登录、消息、文件或语音视频。",
    unified: true,
    rules: [
      "DOMAIN,ad.qq.com,REJECT",
      "DOMAIN,adsfile.qq.com,REJECT",
      "DOMAIN,mi.gdt.qq.com,REJECT",
      "DOMAIN,v2mi.gdt.qq.com,REJECT",
      "DOMAIN,win.gdt.qq.com,REJECT",
      "DOMAIN,pgdt.gtimg.cn,REJECT",
      "DOMAIN,pgdt.ugdtimg.com,REJECT",
    ],
    rewrites: [
      {
        comment: "GDT 广告拉取；返回空对象，避免 SDK 因断连高频重试",
        pattern: re`^https:\/\/(?:mi|v2mi|win)\.gdt\.qq\.com\/gdt_(?:mview|view)\.fcg(?:\?|$)`,
        action: "reject-dict",
      },
      {
        comment: "腾讯新闻开屏",
        pattern: re`^https:\/\/r\.inews\.qq\.com\/getFullScreenPic(?:\?|$)`,
        action: "reject-dict",
      },
      {
        comment: "腾讯新闻当前开屏与横幅广告",
        pattern: re`^https:\/\/r\.inews\.qq\.com\/(?:getBannerAds|getSplash)(?:\?|$)`,
        action: "reject-dict",
      },
    ],
    scripts: [
      {
        name: "腾讯新闻_开屏与信息流显式广告",
        pattern: re`^https:\/\/(?:news\.ssp\.qq\.com\/app|r\.inews\.qq\.com\/(?:getQQNewsUnreadList|getTagFeedList|news_feed\/hot_module_list|gw\/page\/(?:event_detail|channel_feed)))(?:\?|$)`,
        sampleUrl: "https://r.inews.qq.com/gw/page/event_detail",
        engine: "router",
        maxSize: 1048576,
      },
    ],
    mitm: [
      "mi.gdt.qq.com",
      "v2mi.gdt.qq.com",
      "win.gdt.qq.com",
      "r.inews.qq.com",
      "news.ssp.qq.com",
    ],
  },
  {
    id: "wechat",
    name: "微信",
    description: "公众号文章广告与朋友圈广告素材；不处理聊天、支付、小程序业务响应。",
    unified: true,
    rules: [
      "DOMAIN,wxsnsad.tc.qq.com,REJECT",
      "DOMAIN,wxsnsdy.tc.qq.com,REJECT",
      "DOMAIN,wxsnsdy.wxs.qq.com,REJECT",
      "DOMAIN,wxsnsdythumb.wxs.qq.com,REJECT",
    ],
    rewrites: [
      {
        comment: "公众号文章联盟商品广告",
        pattern: re`^https:\/\/mp\.weixin\.qq\.com\/mp\/cps_product_info(?:\?|$)`,
        action: "reject-dict",
      },
    ],
    scripts: [
      {
        name: "微信_公众号文章广告",
        pattern: re`^https:\/\/mp\.weixin\.qq\.com\/mp\/getappmsgad(?:\?|$)`,
        sampleUrl: "https://mp.weixin.qq.com/mp/getappmsgad?f=json",
        engine: "router",
        maxSize: 1048576,
      },
    ],
    mitm: ["mp.weixin.qq.com"],
  },
  {
    id: "jd",
    name: "京东",
    description: "启动、首页楼层、配送/订单页显式广告容器和明确营销推荐配置；保留订单、支付、物流、通知和账号字段。",
    unified: true,
    rules: [
      "DOMAIN,addata.jd.com,REJECT",
      "DOMAIN,ccc-x.jd.com,REJECT",
      "DOMAIN,dsp-x.jd.com,REJECT",
      "DOMAIN,skdisplay.jd.com,REJECT",
    ],
    rewrites: [
      {
        comment: "明确商品广告素材接口",
        pattern: re`^https:\/\/api\.m\.jd\.com\/client\.action\?(?:[^#&]+&)*functionId=queryMaterialAdverts(?:&|$)`,
        action: "reject-dict",
      },
      {
        comment: "关闭首页直播推广小窗；仅匹配该广告组件接口",
        pattern: re`^https:\/\/api\.m\.jd\.com\/client\.action\?(?:[^#&]+&)*functionId=getWidgetV1052(?:&|$)`,
        action: "reject-dict",
      },
      {
        comment: "首页营销推荐规则；不匹配订单、物流或系统通知",
        pattern: re`^https:\/\/lop-proxy\.jd\.com\/queryAppHomePageMarketingRecommendRuleConfigInfo(?:\?|$)`,
        action: "reject-dict",
      },
    ],
    scripts: [
      {
        name: "京东_启动首页与订单页广告",
        pattern: re`^https:\/\/api\.m\.jd\.com\/client\.action\?(?:[^#&]+&)*functionId=(?:deliverLayer|getTabHomeInfo|myOrderInfo|orderTrackBusiness|personinfoBusiness|start|welcomeHome)(?:&|$)`,
        sampleUrl: "https://api.m.jd.com/client.action?client=apple&functionId=start",
        engine: "router",
        maxSize: 2097152,
      },
    ],
    mitm: ["api.m.jd.com", "lop-proxy.jd.com"],
  },
  {
    id: "taobao-tmall",
    name: "淘宝 / 天猫",
    description: "开屏与明确广告服务接口；不拦截商品、购物车、订单、支付或物流。",
    unified: true,
    rules: [
      "DOMAIN,adashbc.ut.taobao.com,REJECT",
      "DOMAIN,adashx.m.taobao.com,REJECT",
      "DOMAIN,adashxgc.ut.taobao.com,REJECT",
      "DOMAIN,h-adashx.ut.taobao.com,REJECT",
    ],
    rewrites: [
      {
        comment: "淘宝/天猫开屏配置",
        pattern: re`^https:\/\/(?:guide-acs|acs)\.m\.(?:taobao|tmall)\.com\/gw\/mtop\.taobao\.wireless\.home\.(?:splash|newface)\.awesome\.get\/`,
        action: "reject-dict",
      },
      {
        comment: "阿里广告服务",
        pattern: re`^https:\/\/(?:guide-acs|acs)\.m\.(?:taobao|tmall)\.com\/gw\/mtop\.alibaba\.advertisementservice\.getadv\/`,
        action: "reject-dict",
      },
      {
        comment: "淘宝当前 AI 开屏",
        pattern: re`^https:\/\/acs\.m\.taobao\.com\/gw\/mtop\.alibaba\.aicloud\.splash(?:\/|$)`,
        action: "reject-dict",
      },
      {
        comment: "淘宝营销 PopLayer 模板；不匹配业务 API",
        pattern: re`^https:\/\/poplayer\.template\.alibaba\.com\/[A-Za-z0-9_]+\.json(?:\?|$)`,
        action: "reject-dict",
      },
    ],
    scripts: [],
    mitm: [
      "guide-acs.m.taobao.com",
      "acs.m.taobao.com",
      "guide-acs.m.tmall.com",
      "acs.m.tmall.com",
      "poplayer.template.alibaba.com",
    ],
  },
  {
    id: "zhihu",
    name: "知乎",
    description: "开屏、商业横幅、回答底部商业卡片与信息流显式推广；不拦截通知、评论、账号或完整内容接口。",
    unified: true,
    rules: [
      "DOMAIN,ad.zhihu.com,REJECT",
      "DOMAIN,zhihu-web-analytics.zhihu.com,REJECT",
    ],
    rewrites: [
      {
        comment: "开屏与顶部商业横幅",
        pattern: re`^https:\/\/api\.zhihu\.com\/commercial_api\/(?:banners_v3\/(?:app_topstory_banner|mobile_banner)|launch_v2|real_time_launch_v2|app_float_layer)(?:\?|$)`,
        action: "reject-dict",
      },
      {
        comment: "回答/文章底部商业卡片",
        pattern: re`^https:\/\/api\.zhihu\.com\/commercial_api\/(?:answer|article)\/\d+\/bottom-v2(?:\?|$)`,
        action: "reject-dict",
      },
      {
        comment: "广告样式与网页商业卡片",
        pattern: re`^https:\/\/api\.zhihu\.com\/(?:ad-style-service\/request|distribute\/rhea\/qa_ad_card\/h5\/recommendation)(?:\?|$)`,
        action: "reject-dict",
      },
      {
        comment: "品牌问题卡片",
        pattern: re`^https:\/\/(?:api\.zhihu\.com\/brand\/question\/\d+\/card|www\.zhihu\.com\/api\/v\d+\/brand\/question\/\d+\/card)(?:\?|$)`,
        action: "reject-dict",
      },
      {
        comment: "知乎网页品牌广告资源",
        pattern: re`^https:\/\/zhstatic\.zhihu\.com\/brand-ad(?:\/|$)`,
        action: "reject",
      },
    ],
    scripts: [
      {
        name: "知乎_信息流显式推广",
        pattern: re`^https:\/\/api\.zhihu\.com\/(?:moments_v3|topstory\/(?:recommend|hot-lists\/total)|v2\/topstory\/hot-lists\/everyone-seeing)(?:\?|$)`,
        sampleUrl: "https://api.zhihu.com/topstory/recommend?limit=10",
        engine: "router",
        maxSize: 2097152,
      },
      {
        name: "知乎_内容页商业推荐",
        pattern: re`^https:\/\/(?:api\.zhihu\.com\/questions\/\d+\/(?:answers|feeds)|www\.zhihu\.com\/api\/v4\/(?:articles|answers)\/\d+\/recommendations?)(?:\?|$)`,
        sampleUrl: "https://api.zhihu.com/questions/123/answers?limit=10",
        engine: "router",
        maxSize: 2097152,
      },
    ],
    mitm: ["api.zhihu.com", "www.zhihu.com", "zhstatic.zhihu.com"],
  },
  {
    id: "weibo",
    name: "微博 / 微博轻享版",
    description: "开屏、推荐/关注/趋势信息流显式推广；不修改会员图标、账号、私信或支付字段。",
    unified: true,
    rules: [
      "DOMAIN,ad.weibo.com,REJECT",
      "DOMAIN,adimg.uve.weibo.com,REJECT",
      "DOMAIN,adstrategy.biz.weibo.com,REJECT",
      "DOMAIN,bootpreload.uve.weibo.com,REJECT",
    ],
    rewrites: [
      {
        comment: "微博开屏",
        pattern: re`^https:\/\/wbapp\.mobile\.sina\.cn\/wbapplua\/wbpullad\.lua(?:\?|$)`,
        action: "reject-dict",
      },
      {
        comment: "微博 SDK 广告",
        pattern: re`^https:\/\/sdkapp\.uve\.weibo\.com\/interface\/sdk\/(?:actionad|sdkad)\.php(?:\?|$)`,
        action: "reject-dict",
      },
      {
        comment: "微博当前实时/预加载开屏广告",
        pattern: re`^https:\/\/boot(?:realtime|preload)\.uve\.weibo\.com\/v\d+\/ad\/(?:realtime|preload)(?:\?|$)`,
        action: "reject-dict",
      },
      {
        comment: "微博第一方广告预加载；不匹配通知激活接口",
        pattern: re`^https:\/\/api\.weibo\.cn\/2\/ad\/preload(?:\?|$)`,
        action: "reject-dict",
      },
      {
        comment: "微博长文章广告位；保留打赏接口",
        pattern: re`^https:\/\/(?:card\.weibo\.com\/article|weibo\.com\/ttarticle)\/m\/aj\/uvead(?:\?|$)`,
        action: "reject-dict",
      },
    ],
    scripts: [
      {
        name: "微博_推荐关注趋势推广",
        pattern: re`^https:\/\/(?:m?api\.weibo\.(?:cn|com)\/\d+\/(?:cardlist|searchall|page|groups\/timeline|statuses\/(?:(?:unread_)?friends(?:\/|_)timeline|unread_hot_timeline|video_mixtimeline)|video\/(?:community_tab|tiny_stream_video_list)|search\/(?:finder|container_timeline|container_discover)|comments\/build_comments)|weibointl\.api\.weibo\.(?:cn|com)\/portal\.php)(?:\?|$)`,
        sampleUrl: "https://api.weibo.cn/2/statuses/unread_hot_timeline?count=20",
        engine: "router",
        maxSize: 2097152,
      },
    ],
    mitm: [
      "api.weibo.cn",
      "mapi.weibo.cn",
      "api.weibo.com",
      "mapi.weibo.com",
      "weibointl.api.weibo.cn",
      "weibointl.api.weibo.com",
      "wbapp.mobile.sina.cn",
      "sdkapp.uve.weibo.com",
      "bootrealtime.uve.weibo.com",
      "bootpreload.uve.weibo.com",
      "card.weibo.com",
      "weibo.com",
    ],
  },
  {
    id: "xianyu",
    name: "闲鱼",
    description: "开屏、首页/同城/搜索信息流中的显式商业卡片；保留商品、聊天、交易和用户主动浏览的推荐。",
    unified: true,
    rules: [],
    rewrites: [
      {
        comment: "闲鱼开屏",
        pattern: re`^https:\/\/(?:g-)?acs\.m\.goofish\.com\/gw\/mtop\.taobao\.idlecommerce\.splash\.ads(?:\/|$)`,
        action: "reject-dict",
      },
    ],
    scripts: [
      {
        name: "闲鱼_首页同城搜索广告",
        pattern: re`^https:\/\/(?:g-)?acs\.m\.goofish\.com\/gw\/(?:mtop\.taobao\.idlehome\.home\.nextfresh|mtop\.taobao\.idle\.local\.(?:home|flow\.plat\.section)|mtop\.taobao\.idlemtopsearch\.search)(?:\/|$)`,
        sampleUrl:
          "https://acs.m.goofish.com/gw/mtop.taobao.idlehome.home.nextfresh/1.0",
        engine: "router",
        maxSize: 2097152,
      },
    ],
    mitm: ["acs.m.goofish.com", "g-acs.m.goofish.com"],
  },
  {
    id: "youtube",
    name: "YouTube / YouTube Music",
    description: "Protobuf 响应内广告节点与广告统计；不转发播放请求、不封禁 googlevideo、不伪造后台播放或下载权益。",
    unified: true,
    rules: [
      "DOMAIN,ads.youtube.com,REJECT",
      "DOMAIN-SUFFIX,doubleclick.net,REJECT",
      "DOMAIN-SUFFIX,googleadservices.com,REJECT",
      "DOMAIN-SUFFIX,googlesyndication.com,REJECT",
    ],
    rewrites: [
      {
        comment: "YouTube 广告曝光与点击统计",
        pattern: re`^https:\/\/(?:www|s)\.youtube\.com\/(?:api\/stats\/ads|pagead|ptracking)(?:\?|\/|$)`,
        action: "reject-200",
      },
      {
        comment: "仅拒绝带 adcontext 的 QoE 广告统计",
        pattern: re`^https:\/\/s\.youtube\.com\/api\/stats\/qoe\?(?=[^#]*\badcontext\b)`,
        action: "reject-200",
      },
    ],
    scripts: [
      {
        name: "YouTube_广告响应过滤",
        pattern: re`^https:\/\/youtubei\.googleapis\.com\/youtubei\/v1\/(?:browse|next|player|search|reel\/reel_watch_sequence|guide|get_watch)(?:\?|$)`,
        sampleUrl: "https://youtubei.googleapis.com/youtubei/v1/player",
        engine: "youtube",
        maxSize: -1,
        binaryBodyMode: true,
        argument:
          '{"captionLang":"off","blockUpload":true,"blockImmersive":true,"blockShorts":false,"debug":false}',
      },
    ],
    mitm: ["youtubei.googleapis.com", "www.youtube.com", "s.youtube.com"],
  },
  {
    id: "baidu-netdisk",
    name: "百度网盘",
    description: "广告接口、开屏活动入口与明确广告资源；保留账号认证、会员状态、上传下载和视频播放。",
    unified: true,
    rules: [],
    rewrites: [
      {
        comment: "网盘广告接口",
        pattern: re`^https:\/\/pan\.baidu\.com\/rest\/(?:\d+\.\d+|[^/]+)\/pcs\/adx(?:\?|$)`,
        action: "reject-dict",
      },
      {
        comment: "网盘广告接口",
        pattern: re`^https:\/\/pan\.baidu\.com\/rest\/2\.0\/pcs\/ad(?:\?|$)`,
        action: "reject-dict",
      },
      {
        comment: "启动活动入口",
        pattern: re`^https:\/\/pan\.baidu\.com\/act\/api\/activityentry(?:\?|$)`,
        action: "reject-dict",
      },
      {
        comment: "明确命名的广告资源",
        pattern: re`^https:\/\/issuecdn\.baidupcs\.com\/issue\/netdisk\/guanggao(?:\/|$)`,
        action: "reject",
      },
      {
        comment: "仅阻断更新统计，不阻断 App 更新",
        pattern: re`^https:\/\/update\.pan\.baidu\.com\/statistics(?:\?|$)`,
        action: "reject-200",
      },
    ],
    scripts: [],
    mitm: ["pan.baidu.com", "issuecdn.baidupcs.com", "update.pan.baidu.com"],
  },
  {
    id: "douyin",
    name: "抖音",
    description: "穿山甲/Gromore 广告 SDK 的拉取、配置与明确广告素材；不解密或改写抖音主业务 feed。",
    unified: true,
    rules: [
      "DOMAIN,ad.zijieapi.com,REJECT",
      "DOMAIN,ads3-normal.zijieapi.com,REJECT",
      "DOMAIN,ads5-normal.zijieapi.com,REJECT",
      "DOMAIN,api-access.pangolin-sdk-toutiao.com,REJECT",
      "DOMAIN,api-access.pangolin-sdk-toutiao-b.com,REJECT",
      "DOMAIN,api.iegadp.qq.com,REJECT",
      "DOMAIN,activity-ag.awemeughun.com,REJECT",
      "DOMAIN,gromore.pangolin-sdk-toutiao.com,REJECT",
      "DOMAIN,p6-ad-sign.byteimg.com,REJECT",
      "DOMAIN,p9-ad-sign.byteimg.com,REJECT",
      "DOMAIN,pglstatp-toutiao.com,REJECT",
    ],
    rewrites: [
      {
        comment: "穿山甲广告拉取与配置",
        pattern: re`^https:\/\/api-access(?:[1-5])?\.pangolin-sdk-toutiao(?:-b)?\.com\/api\/ad\/union\/sdk\/(?:get_ads|settings)\/`,
        action: "reject-dict",
      },
      {
        comment: "Gromore 广告配置与竞价",
        pattern: re`^https:\/\/gromore\.pangolin-sdk-toutiao\.com\/api\/ad\/union\/mediation\/(?:config|exchange)(?:\/|$)`,
        action: "reject-dict",
      },
      {
        comment: "明确广告渲染素材",
        pattern: re`^https:\/\/[^/]+\.pglstatp-toutiao\.com\/obj\/ad-pattern\/renderer(?:\/|$)`,
        action: "reject",
      },
      {
        comment: "只匹配带 from=ad 的旧广告马赛克素材",
        pattern: re`^https:\/\/[^/]+\.pstatp\.com\/obj\/mosaic-legacy\/[^?]+\?(?=[^#]*\bfrom=ad(?:&|$))`,
        action: "reject",
      },
      {
        comment: "抖音第一方明确广告接口；不匹配普通 feed 或播放接口",
        pattern: re`^https:\/\/[^/]+\.amemv\.com\/aweme\/v\d+\/ad\/`,
        action: "reject-dict",
      },
      {
        comment: "字节系明确命名的 API/Motor 广告接口",
        pattern: re`^https:\/\/[^/]+\.(?:amemv|snssdk)\.com\/(?:api|motor)\/ad\/`,
        action: "reject-dict",
      },
    ],
    scripts: [],
    mitm: [
      "api-access.pangolin-sdk-toutiao.com",
      "api-access.pangolin-sdk-toutiao-b.com",
      "api-access1.pangolin-sdk-toutiao.com",
      "api-access2.pangolin-sdk-toutiao.com",
      "api-access3.pangolin-sdk-toutiao.com",
      "api-access4.pangolin-sdk-toutiao.com",
      "api-access5.pangolin-sdk-toutiao.com",
      "gromore.pangolin-sdk-toutiao.com",
      "*.pglstatp-toutiao.com",
      "*.pstatp.com",
      "*.amemv.com",
      "*.snssdk.com",
    ],
  },
  {
    id: "fanqie",
    name: "番茄小说",
    description: "章末/激励广告 SDK、广告素材与预加载；移除旧版整域、共享业务域和静态 IP 封禁。",
    unified: true,
    rules: [
      "DOMAIN,ad.zijieapi.com,REJECT",
      "DOMAIN,api-access.pangolin-sdk-toutiao.com,REJECT",
      "DOMAIN,api-access.pangolin-sdk-toutiao-b.com,REJECT",
      "DOMAIN,api.iegadp.qq.com,REJECT",
      "DOMAIN,activity-ag.awemeughun.com,REJECT",
      "DOMAIN,gromore.pangolin-sdk-toutiao.com,REJECT",
      "DOMAIN,p6-ad-sign.byteimg.com,REJECT",
      "DOMAIN,p9-ad-sign.byteimg.com,REJECT",
      "DOMAIN,pglstatp-toutiao.com,REJECT",
    ],
    rewrites: [
      {
        comment: "番茄使用的穿山甲广告拉取与配置",
        pattern: re`^https:\/\/api-access(?:[1-5])?\.pangolin-sdk-toutiao(?:-b)?\.com\/api\/ad\/union\/sdk\/(?:get_ads|settings)\/`,
        action: "reject-dict",
      },
      {
        comment: "章末广告素材；只匹配广告专用目录",
        pattern: re`^https:\/\/[^/]+\.(?:pglstatp-toutiao|pstatp)\.com\/(?:obj|img)\/(?:ad-app-package|ad|web\.business\.image)(?:\/|$)`,
        action: "reject",
      },
      {
        comment: "明确广告渲染素材",
        pattern: re`^https:\/\/[^/]+\.pglstatp-toutiao\.com\/obj\/ad-pattern\/renderer(?:\/|$)`,
        action: "reject",
      },
      {
        comment: "只匹配带 from=ad 的旧广告马赛克素材",
        pattern: re`^https:\/\/[^/]+\.pstatp\.com\/obj\/mosaic-legacy\/[^?]+\?(?=[^#]*\bfrom=ad(?:&|$))`,
        action: "reject",
      },
    ],
    scripts: [],
    mitm: [
      "api-access.pangolin-sdk-toutiao.com",
      "api-access.pangolin-sdk-toutiao-b.com",
      "api-access1.pangolin-sdk-toutiao.com",
      "api-access2.pangolin-sdk-toutiao.com",
      "api-access3.pangolin-sdk-toutiao.com",
      "api-access4.pangolin-sdk-toutiao.com",
      "api-access5.pangolin-sdk-toutiao.com",
      "*.pglstatp-toutiao.com",
      "*.pstatp.com",
    ],
  },
  {
    id: "thunder",
    name: "迅雷",
    description: "明确广告域名、广告图片目录与广告位批量接口；保留更新、下载、直播和会员状态。",
    unified: true,
    rules: [
      "DOMAIN,adsp.xunlei.com,REJECT",
      "DOMAIN,cpm.cm.sandai.net,REJECT",
    ],
    rewrites: [
      {
        comment: "迅雷广告图片",
        pattern: re`^https:\/\/images\.client\.vip\.xunlei\.com\/[^?#]+\/advert\/`,
        action: "reject-img",
      },
      {
        comment: "迅雷广告位批量接口",
        pattern: re`^https:\/\/api-shoulei-ssl\.xunlei\.com\/flowhub\/v\d+\/slots:batchGet(?:\?|$)`,
        action: "reject-dict",
      },
    ],
    scripts: [],
    mitm: ["images.client.vip.xunlei.com", "api-shoulei-ssl.xunlei.com"],
  },
  {
    id: "amap",
    name: "高德地图",
    description: "开屏、首页/搜索/消息中的显式商业内容；保留天气、导航、路线和定位。",
    unified: true,
    rules: ["DOMAIN,optimus-ads.amap.com,REJECT"],
    rewrites: [
      {
        comment: "高德开屏",
        pattern: re`^https:\/\/m\d+\.amap\.com\/ws\/valueadded\/alimama\/splash_screen(?:\?|$)`,
        action: "reject-dict",
      },
      {
        comment: "广告归因上报",
        pattern: re`^https:\/\/m\d+\.amap\.com\/ws\/asa\/ads_attribution(?:\?|$)`,
        action: "reject-200",
      },
      {
        comment: "当前实时开屏广告",
        pattern: re`^https:\/\/amap-aos-info-nogw\.amap\.com\/ws\/aos\/alimama\/splash_screen_rt(?:\?|$)`,
        action: "reject-dict",
      },
      {
        comment: "启动 DSP 广告初始化",
        pattern: re`^https:\/\/m\d+\.amap\.com\/ws\/shield\/dsp\/app\/startup\/init(?:\?|$)`,
        action: "reject-dict",
      },
      {
        comment: "场景商业推荐",
        pattern: re`^https:\/\/m\d+\.amap\.com\/ws\/shield\/scene\/recommend(?:\?|$)`,
        action: "reject-dict",
      },
    ],
    scripts: [
      {
        name: "高德_首页搜索消息显式广告",
        pattern: re`^https:\/\/m\d+\.amap\.com\/ws\/(?:faas\/amap-navigation\/main-page|msgbox\/pull|shield\/(?:dsp\/profile\/index\/nodefaas|search\/new_hotword))(?:\?|$)`,
        sampleUrl: "https://m5.amap.com/ws/faas/amap-navigation/main-page",
        engine: "router",
        maxSize: 2097152,
      },
    ],
    mitm: [
      "m1.amap.com",
      "m2.amap.com",
      "m3.amap.com",
      "m4.amap.com",
      "m5.amap.com",
      "m6.amap.com",
      "m7.amap.com",
      "m8.amap.com",
      "m9.amap.com",
      "m10.amap.com",
      "amap-aos-info-nogw.amap.com",
    ],
  },
  {
    id: "privacy-pcdn",
    name: "隐私与已识别 PCDN",
    description: "保留原番茄/聚合模块中的精确 PCDN 与广告遥测拦截；不使用 IP/CIDR 或共享业务整域。",
    unified: true,
    rules: [
      "DOMAIN,apd-pcdnwxlogin.teg.tencent-cloud.net,REJECT",
      "DOMAIN,apd-pcdnwxnat.teg.tencent-cloud.net,REJECT",
      "DOMAIN,apd-pcdnwxstat.teg.tencent-cloud.net,REJECT",
      "DOMAIN,pcdn.xmcdn.com,REJECT",
    ],
    rewrites: [],
    scripts: [],
    mitm: [],
  },
  ...legacyApps,
];

export const optionalExtras = [
  {
    id: "zhihu-link-direct",
    name: "知乎链接直达",
    description: "保留 ZhihuOpt 的去中转便利功能；独立启用，不修改 User-Agent。",
    rules: [],
    rewrites: [
      {
        comment: "知乎 link.zhihu.com 去中转",
        pattern: re`^https:\/\/link\.zhihu\.com\/\?target=(?:https?)?(?:%3A|:)?(?:\/\/|%2F%2F)?(.*)`,
        action: "http://$1 302",
      },
    ],
    scripts: [],
    mitm: ["link.zhihu.com"],
  },
  {
    id: "xianyu-ui",
    name: "闲鱼可选 UI 精简",
    description: "保留旧模块的搜索建议、消息页推荐和个人页推荐精简；可能隐藏非广告推荐，默认不并入统一模块。",
    rules: [],
    rewrites: [
      {
        comment: "消息页兴趣推荐",
        pattern: re`^https:\/\/acs\.m\.goofish\.com\/gw\/mtop\.taobao\.idle\.playboy\.recommend\/(?:1|2)\.0`,
        action: "reject-dict",
      },
      {
        comment: "搜索页发现/激活推荐",
        pattern: re`^https:\/\/acs\.m\.goofish\.com\/gw\/mtop\.taobao\.idlemtopsearch\.(?:item\.search\.activate|search\.discover)\/`,
        action: "reject-dict",
      },
      {
        comment: "我的页面商品推荐",
        pattern: re`^https:\/\/acs\.m\.goofish\.com\/gw\/mtop\.taobao\.idle\.item\.(?:buy\.feeds|recommend\.list)`,
        action: "reject-dict",
      },
    ],
    scripts: [],
    mitm: ["acs.m.goofish.com"],
  },
];

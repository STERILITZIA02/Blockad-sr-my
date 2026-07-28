import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { apps } from "../config/apps.mjs";

const require = createRequire(import.meta.url);
const { isAdItem, processResponse, routeIds } = require("../src/blockad-router.cjs");

function run(url, payload) {
  const body = typeof payload === "string" ? payload : JSON.stringify(payload);
  return processResponse({ url, body });
}

function parse(result) {
  return JSON.parse(result.body);
}

function appMatchesUrl(appId, url) {
  const app = apps.find((candidate) => candidate.id === appId);
  assert.ok(app, `missing app config: ${appId}`);
  return [...app.rewrites, ...app.scripts].some((entry) =>
    new RegExp(entry.pattern).test(url),
  );
}

function appMitmCoversUrl(appId, url) {
  const app = apps.find((candidate) => candidate.id === appId);
  assert.ok(app, `missing app config: ${appId}`);
  const hostname = new URL(url).hostname.toLowerCase();
  return app.mitm.some((rawPattern) => {
    const pattern = rawPattern.toLowerCase();
    if (pattern.startsWith("*.")) {
      const suffix = pattern.slice(1);
      return hostname.endsWith(suffix) && hostname.length > suffix.length;
    }
    return hostname === pattern;
  });
}

test("路由清单只包含本地 JSON 处理器覆盖的接口族", () => {
  assert.deepEqual(routeIds, [
    "tencent-news",
    "wechat",
    "jd",
    "zhihu",
    "weibo",
    "xianyu",
    "amap",
    "youku",
    "baidu-tieba",
    "meituan-dianping",
    "smzdm",
    "ximalaya",
    "xiaohongshu",
    "coolapk",
    "quark",
    "didi",
    "chelaile-promo",
    "huazhu-promo",
    "kuwo",
    "boohee",
    "foodie",
    "hanju-tv",
    "mogo-renter",
    "score",
    "xiaochao-brain",
    "yizhibo",
    "yueme-tv",
    "zhibo8",
  ]);
});

test("腾讯新闻仅清理 adList 与 ad_list 组件", () => {
  const input = {
    data: {
      widget_list: [
        { widget_type: "article_list", title: "正常新闻" },
        { widget_type: "ad_list", title: "推广" },
      ],
    },
    adList: [{ ad_id: "news-ad" }],
    account: { loggedIn: true },
  };
  const first = run("https://r.inews.qq.com/gw/page/event_detail", input);
  const output = parse(first);
  assert.equal(first.changed, true);
  assert.deepEqual(output.adList, []);
  assert.deepEqual(output.data.widget_list, [
    { widget_type: "article_list", title: "正常新闻" },
  ]);
  assert.deepEqual(output.account, input.account);

  const second = run("https://r.inews.qq.com/gw/page/event_detail", first.body);
  assert.equal(second.changed, false);
  assert.equal(second.body, first.body);
});

test("未知接口与无法解析的响应失败开放", () => {
  const unknown = run("https://example.com/api", { ads: [{ is_ad: true }] });
  assert.equal(unknown.changed, false);
  assert.equal(unknown.route, null);

  const invalid = run(
    "https://mp.weixin.qq.com/mp/getappmsgad",
    "<html>not-json</html>",
  );
  assert.equal(invalid.changed, false);
  assert.equal(invalid.body, "<html>not-json</html>");
});

test("微信公众号广告清理保留 appid 与正文相关字段", () => {
  const input = {
    appid: "wx-safe-app",
    advertisement_num: 2,
    advertisement_info: [{ ad_id: "ad-1" }],
    data: {
      title: "正常文章",
      content_url: "https://mp.weixin.qq.com/s/example",
    },
  };
  const first = run("https://mp.weixin.qq.com/mp/getappmsgad?f=json", input);
  assert.equal(first.changed, true);
  const output = parse(first);
  assert.equal(output.advertisement_num, 0);
  assert.deepEqual(output.advertisement_info, []);
  assert.equal(output.appid, input.appid);
  assert.deepEqual(output.data, input.data);

  const second = run("https://mp.weixin.qq.com/mp/getappmsgad?f=json", first.body);
  assert.equal(second.changed, false);
  assert.equal(second.body, first.body);
});

test("京东启动广告被清理且登录、订单、支付和物流不变", () => {
  const input = {
    code: "0",
    data: {
      images: [{ url: "https://ad.example/splash.jpg" }],
      orderList: [
        {
          orderId: "ORDER-1",
          paymentStatus: "PAID",
          logistics: { status: "运输中" },
        },
        { adId: "jd-ad", type: "promotion" },
      ],
      token: "fixture-token-is-never-exported",
      login: { state: "ok" },
    },
  };
  const result = run(
    "https://api.m.jd.com/client.action?client=apple&functionId=start",
    input,
  );
  const output = parse(result);
  assert.equal(result.changed, true);
  assert.deepEqual(output.data.images, []);
  assert.equal(output.data.orderList.length, 1);
  assert.equal(output.data.orderList[0].orderId, "ORDER-1");
  assert.equal(output.data.orderList[0].paymentStatus, "PAID");
  assert.equal(output.data.token, input.data.token);
  assert.deepEqual(output.data.login, input.data.login);
});

test("微信、QQ、京东和淘宝广告入口精确匹配且不覆盖核心业务", () => {
  const cases = [
    {
      app: "qq",
      ads: [
        "https://r.inews.qq.com/getSplash?device=iPhone",
        "https://news.ssp.qq.com/app?channel=news",
      ],
      protected: [
        "https://r.inews.qq.com/getNewsRemoteConfig?channel=news",
        "https://r.inews.qq.com/getUserInfo?uin=1",
      ],
    },
    {
      app: "wechat",
      ads: [
        "https://mp.weixin.qq.com/mp/getappmsgad?f=json",
        "https://mp.weixin.qq.com/mp/cps_product_info?f=json",
      ],
      protected: [
        "https://mp.weixin.qq.com/mp/profile_ext?action=home",
        "https://mp.weixin.qq.com/s/example-article",
      ],
    },
    {
      app: "jd",
      ads: [
        "https://api.m.jd.com/client.action?client=apple&functionId=start",
        "https://api.m.jd.com/client.action?functionId=queryMaterialAdverts&client=apple",
        "https://api.m.jd.com/client.action?functionId=getWidgetV1052&client=apple",
        "https://lop-proxy.jd.com/queryAppHomePageMarketingRecommendRuleConfigInfo",
      ],
      protected: [
        "https://api.m.jd.com/client.action?functionId=orderList&client=apple",
        "https://api.m.jd.com/client.action?functionId=payment&client=apple",
        "https://api.m.jd.com/client.action?functionId=logisticsTrack&client=apple",
        "https://api.m.jd.com/client.action?functionId=login&client=apple",
      ],
    },
    {
      app: "taobao-tmall",
      ads: [
        "https://guide-acs.m.taobao.com/gw/mtop.taobao.wireless.home.splash.awesome.get/1.0/",
        "https://acs.m.tmall.com/gw/mtop.alibaba.advertisementservice.getadv/1.0/",
        "https://poplayer.template.alibaba.com/startup_campaign.json?version=1",
      ],
      protected: [
        "https://acs.m.taobao.com/gw/mtop.taobao.login/1.0/",
        "https://acs.m.taobao.com/gw/mtop.trade.order.list/1.0/",
        "https://acs.m.taobao.com/gw/mtop.alipay.payment/1.0/",
        "https://acs.m.tmall.com/gw/mtop.taobao.detail.getdetail/1.0/",
      ],
    },
  ];

  for (const fixture of cases) {
    for (const url of fixture.ads) {
      assert.equal(appMatchesUrl(fixture.app, url), true, `应匹配广告入口: ${url}`);
    }
    for (const url of fixture.protected) {
      assert.equal(appMatchesUrl(fixture.app, url), false, `不应匹配核心业务: ${url}`);
    }
  }
});

test("抖音广告 SDK 精确过滤且主视频流、刷新、评论和发布不进入 MITM", async () => {
  const adPayloads = [
    "https://api-access.pangolin-sdk-toutiao.com/api/ad/union/sdk/get_ads/?aid=1",
    "https://api-access.pangolin-sdk-toutiao1.com/api/ad/union/sdk/settings/?aid=1",
    "https://api.pangolin-sdk-toutiao-b.com/api/ad/union/sdk/get_ads/?aid=1",
    "https://gromore.pangolin-sdk-toutiao.com/api/ad/union/mediation/config/",
    "https://ether-pack.pangolin-sdk-toutiao.com/union/endcard/index.html",
    "https://sf3-fe-tos.pglstatp-toutiao.com/obj/ad-pattern/renderer/package.js",
  ];
  const protectedBusinessUrls = [
    "https://aweme.snssdk.com/aweme/v1/feed/?type=0",
    "https://aweme.snssdk.com/aweme/v2/comment/list/?aweme_id=1",
    "https://aweme.snssdk.com/aweme/v1/comment/publish/",
    "https://aweme.snssdk.com/aweme/v1/comment/digg/",
    "https://aweme.snssdk.com/aweme/v1/search/item/",
    "https://aweme.snssdk.com/aweme/v1/user/profile/other/",
    "https://aweme.snssdk.com/aweme/v1/live/room/enter/",
    "https://aweme.snssdk.com/aweme/v1/aweme/post/",
    "https://api.amemv.com/aweme/v1/feed/?pull_type=1",
    "https://api.amemv.com/aweme/v2/comment/list/?aweme_id=1",
    "https://api.amemv.com/aweme/v1/comment/publish/",
    "https://api.amemv.com/aweme/v1/upload/video/",
  ];

  for (const url of adPayloads) {
    assert.equal(appMatchesUrl("douyin", url), true, `应匹配广告载荷: ${url}`);
    assert.equal(appMitmCoversUrl("douyin", url), true, `广告载荷缺少精确 MITM: ${url}`);
  }
  for (const url of protectedBusinessUrls) {
    assert.equal(appMatchesUrl("douyin", url), false, `不应改写抖音业务接口: ${url}`);
    assert.equal(appMitmCoversUrl("douyin", url), false, `不应解密抖音业务接口: ${url}`);
  }

  const blockedDomains = new Set(
    (await readFile(
      new URL("../dist/rules/AWAvenue-Ads-Rule.list", import.meta.url),
      "utf8",
    ))
      .split(/\r?\n/)
      .filter((line) => line.startsWith("DOMAIN,"))
      .map((line) => line.split(",")[1]),
  );
  for (const hostname of [
    "api-access.pangolin-sdk-toutiao.com",
    "api-access.pangolin-sdk-toutiao1.com",
    "gromore.pangolin-sdk-toutiao.com",
    "log-api.pangolin-sdk-toutiao.com",
    "mi.gdt.qq.com",
    "v2mi.gdt.qq.com",
    "win.gdt.qq.com",
  ]) {
    assert.equal(
      blockedDomains.has(hostname),
      false,
      `SDK 握手/日志域不应被通用规则整域拒绝: ${hostname}`,
    );
  }
});

test("抖音与番茄不再包含共享字节业务域或共享素材域的通配 MITM", () => {
  for (const appId of ["douyin", "fanqie"]) {
    const app = apps.find((candidate) => candidate.id === appId);
    assert.ok(app, `missing app config: ${appId}`);
    for (const forbidden of [
      "*.amemv.com",
      "*.snssdk.com",
      "*.pstatp.com",
      "*.pglstatp-toutiao.com",
    ]) {
      assert.equal(app.mitm.includes(forbidden), false, `${appId}: ${forbidden}`);
    }
  }
});

test("知乎只移除显式商业项，不误删标题中包含“广告”的正常内容", () => {
  const input = {
    data: [
      { id: "normal-1", title: "广告学课程笔记", type: "article" },
      { id: "ad-1", type: "feed_advert", promotion_extra: { creative: 1 } },
      { id: "normal-2", title: "普通回答", type: "answer" },
    ],
    paging: { is_end: false, next: "https://api.zhihu.com/next" },
  };
  const result = run("https://api.zhihu.com/topstory/recommend?limit=10", input);
  const output = parse(result);
  assert.equal(result.changed, true);
  assert.deepEqual(
    output.data.map((item) => item.id),
    ["normal-1", "normal-2"],
  );
  assert.deepEqual(output.paging, input.paging);
});

test("微博信息流去广告保留正常微博、评论和视频地址", () => {
  const input = {
    statuses: [
      {
        id: "normal",
        text: "正常微博",
        comments_count: 7,
        video_url: "https://video.example/content.mp4",
      },
      {
        id: "ad",
        mblogtypename: "广告",
        ad_info: { ad_id: "wb-ad" },
      },
    ],
  };
  const result = run(
    "https://api.weibo.cn/2/statuses/unread_hot_timeline?count=20",
    input,
  );
  const output = parse(result);
  assert.equal(result.changed, true);
  assert.equal(output.statuses.length, 1);
  assert.equal(output.statuses[0].comments_count, 7);
  assert.equal(output.statuses[0].video_url, input.statuses[0].video_url);
});

test("闲鱼和高德处理器保持幂等", () => {
  const cases = [
    {
      url: "https://acs.m.goofish.com/gw/mtop.taobao.idlehome.home.nextfresh/1.0",
      payload: {
        data: {
          sections: [
            { id: "item", dataType: "商品" },
            { id: "ad", dataType: "ad", advertId: "xianyu-ad" },
          ],
          widgetReturnDO: { ad_id: "widget-ad" },
        },
      },
    },
    {
      url: "https://m5.amap.com/ws/faas/amap-navigation/main-page",
      payload: {
        data: {
          cardList: [
            { id: "route", type: "navigation" },
            { id: "ad", type: "commercial", adId: "amap-ad" },
          ],
        },
      },
    },
  ];

  for (const fixture of cases) {
    const first = run(fixture.url, fixture.payload);
    assert.equal(first.changed, true, fixture.url);
    const second = run(fixture.url, first.body);
    assert.equal(second.changed, false, fixture.url);
    assert.equal(second.body, first.body, fixture.url);
  }
});

test("优酷只删除明确广告节点并保留正片、水印和普通推荐", () => {
  const input = {
    data: {
      data: {
        ad: { id: "pre-roll" },
        ykad: { id: "splash" },
        watermark: { url: "https://static.youku.com/watermark.png" },
      },
      "2019061000": {
        data: {
          nodes: [
            { id: "video", typeName: "PHONE_VIDEO_CARD", title: "正常正片" },
            { id: "feed-ad", typeName: "PHONE_FEED_CARD_S_AD" },
            { id: 32133, typeName: "PHONE_BANNER", title: "广告横幅" },
            { id: "recommend", typeName: "PHONE_RECOMMEND", title: "普通推荐" },
          ],
        },
      },
    },
  };
  const first = run(
    "https://un-acs.youku.com/gw/mtop.youku.play.ups.appinfo.get/1.0",
    input,
  );
  const output = parse(first);
  assert.equal(first.changed, true);
  assert.deepEqual(output.data.data.ad, {});
  assert.deepEqual(output.data.data.ykad, {});
  assert.deepEqual(output.data.data.watermark, input.data.data.watermark);
  assert.deepEqual(
    output.data["2019061000"].data.nodes.map((item) => item.id),
    ["video", "recommend"],
  );

  const second = run(
    "https://un-acs.youku.com/gw/mtop.youku.play.ups.appinfo.get/1.0",
    first.body,
  );
  assert.equal(second.changed, false);
  assert.equal(second.body, first.body);
});

test("新增热门 App 路由只删除强广告标记并保持幂等", () => {
  const cases = [
    {
      url: "https://tiebac.baidu.com/c/f/ad/getFeedAd?cmd=1",
      normal: { id: "thread", title: "普通帖子", type: "thread" },
    },
    {
      url: "https://mapi.dianping.com/mapi/intelliindex",
      normal: { id: "shop", title: "用户主动浏览的餐厅", type: "shop" },
    },
    {
      url: "https://homepage-api.smzdm.com/v3/home",
      normal: { id: "deal", title: "普通优惠信息", type: "article" },
    },
    {
      url: "https://mobile.ximalaya.com/discovery-feed/v3/mix",
      normal: { id: "album", title: "正常专辑", type: "album" },
    },
    {
      url: "https://edith.xiaohongshu.com/api/sns/v1/system_service/splash_config",
      normal: { id: "note", title: "正常笔记", type: "note" },
    },
    {
      url: "https://api.coolapk.com/v6/main/indexV8",
      normal: { id: "feed", title: "普通动态", type: "feed" },
    },
    {
      url: "https://open-cms-api.quark.cn/open-cms",
      normal: { id: "tool", title: "正常工具入口", type: "tool" },
    },
    {
      url: "https://ct.xiaojukeji.com/agent/v3/feeds",
      normal: { id: "ride", title: "正常出行入口", type: "ride" },
    },
    {
      url: "https://res.xiaojukeji.com/resapi/activity/getPasMultiNotices",
      normal: { id: "safety", title: "正常出行安全通知", type: "notice" },
    },
    {
      url: "https://app.ibuscloud.com/v2/notice/getNoticeWithAdvByCity",
      normal: { id: "bus", title: "正常公交服务通知", type: "notice" },
    },
    {
      url: "https://hweb-manager.huazhu.com/notice/getAppPopupNotifyAlert",
      normal: { id: "hotel", title: "正常酒店服务通知", type: "notice" },
    },
    {
      url: "https://nmobi.kuwo.cn/mobi.s",
      normal: { id: "song", title: "正常歌曲", type: "song" },
    },
    {
      url: "https://api.boohee.com/meta-interface/v2/index",
      normal: { id: "health", title: "正常健康记录", type: "record" },
    },
    {
      url: "https://foodie-api.yiruikecorp.com/v1/banner/overview",
      normal: { id: "notice", title: "正常服务公告", type: "notice" },
    },
    {
      url: "https://api.hanju.koudaibaobao.com/api/carp/kp",
      normal: { id: "episode", title: "正常剧集", type: "episode" },
    },
    {
      url: "https://api.mgzf.com/renter-operation/home/startHomePage",
      normal: { id: "house", title: "正常房源", type: "house" },
    },
    {
      url: "https://api.qiuduoduo.cn/guideimage",
      normal: { id: "match", title: "正常赛事", type: "match" },
    },
    {
      url: "https://api.psy-1.com/cosleep/startup",
      normal: { id: "sleep", title: "正常助眠内容", type: "audio" },
    },
    {
      url: "https://api.yizhibo.com/common/api/api_pz",
      normal: { id: "live", title: "正常直播入口", type: "live" },
    },
    {
      url: "https://zjh5api.189smarthome.com:8091/xygj-config-api/queryData",
      normal: { id: "channel", title: "正常频道配置", type: "channel" },
    },
    {
      url: "https://a.qiumibao.com/ios/config/?version_code=1",
      normal: { id: "match", title: "正常赛事配置", type: "match" },
    },
  ];

  for (const fixture of cases) {
    const input = {
      data: {
        items: [
          fixture.normal,
          {
            id: "ad",
            type: "native_ad",
            adInfo: { adId: `${fixture.normal.id}-ad` },
          },
        ],
        account: { loggedIn: true },
      },
    };
    const first = run(fixture.url, input);
    assert.equal(first.changed, true, fixture.url);
    const output = parse(first);
    assert.deepEqual(output.data.items, [fixture.normal], fixture.url);
    assert.deepEqual(output.data.account, input.data.account, fixture.url);

    const second = run(fixture.url, first.body);
    assert.equal(second.changed, false, fixture.url);
    assert.equal(second.body, first.body, fixture.url);
  }
});

test("广告识别使用组合强信号并规避常见业务字段", () => {
  assert.equal(isAdItem({ is_ad: true }), true);
  assert.equal(isAdItem({ adId: "123" }), true);
  assert.equal(
    isAdItem({
      clickTrackUrl: "https://track.example/click",
      impressionUrl: "https://track.example/show",
    }),
    true,
  );
  assert.equal(isAdItem({ adcode: "110000", title: "北京市" }), false);
  assert.equal(isAdItem({ title: "广告学", type: "article" }), false);
  assert.equal(isAdItem({ promotion_id: 0, type: "video" }), false);
});

test("超大正文快速失败开放", () => {
  const body = `{"padding":"${"x".repeat(4 * 1024 * 1024)}"}`;
  const result = run("https://api.zhihu.com/topstory/recommend", body);
  assert.equal(result.changed, false);
  assert.equal(result.body, body);
});

test("YouTube 发布脚本不含外部请求与权益伪造执行路径", async () => {
  const source = await readFile(
    new URL("../dist/scripts/youtube-response.js", import.meta.url),
    "utf8",
  );
  for (const forbidden of [
    "$httpClient.get",
    "$task.fetch(",
    "init-stream.maasea.workers.dev",
    "pictureInPictureRender=me.create",
    "backgroundPlayerRender=ge.create",
    "backgroundPlayBackSettingRenderer:{backgroundPlayback:!0",
    '{path:"get_setting"',
  ]) {
    assert.equal(source.includes(forbidden), false, forbidden);
  }
  assert.match(source, /function Br\(l,e\)\{Ni\(l\),Pi\(l,e\)\}/);
  assert.match(source, /whiteNo\.slice\(-256\)/);
  assert.match(source, /network access disabled/);
});

import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import test from "node:test";

const require = createRequire(import.meta.url);
const { isAdItem, processResponse, routeIds } = require("../src/blockad-router.cjs");

function run(url, payload) {
  const body = typeof payload === "string" ? payload : JSON.stringify(payload);
  return processResponse({ url, body });
}

function parse(result) {
  return JSON.parse(result.body);
}

test("路由清单只包含本地 JSON 处理器覆盖的接口族", () => {
  assert.deepEqual(routeIds, [
    "wechat",
    "jd",
    "zhihu",
    "weibo",
    "xianyu",
    "amap",
    "bilibili",
  ]);
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

test("闲鱼、高德和哔哩哔哩处理器保持幂等", () => {
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
    {
      url: "https://app.bilibili.com/x/v2/feed/index?idx=1",
      payload: {
        data: {
          items: [
            { id: "video", card_goto: "av", uri: "bilibili://video/1" },
            { id: "ad", card_goto: "ad", ad_info: { creative_id: 1 } },
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

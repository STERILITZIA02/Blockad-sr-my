(function blockAdRouterBootstrap(runtime) {
  "use strict";

  const MAX_BODY_CHARACTERS = 4 * 1024 * 1024;
  const MAX_VISITED_OBJECTS = 4096;
  const MAX_DEPTH = 8;

  const BRANCH_KEYS = new Set([
    "data",
    "result",
    "results",
    "response",
    "payload",
    "content",
    "contents",
    "container",
    "containers",
    "page",
    "pages",
    "home",
    "homepage",
    "feed",
    "feeds",
    "stream",
    "timeline",
    "module",
    "modules",
    "section",
    "sections",
    "floor",
    "floors",
    "card",
    "cards",
    "item",
    "items",
    "list",
    "lists",
    "entry",
    "entries",
    "recommend",
    "recommendations",
    "config",
    "body",
  ]);

  const CONTAINER_KEYS = new Set([
    "data",
    "result",
    "results",
    "items",
    "itemList",
    "list",
    "lists",
    "cards",
    "cardList",
    "sections",
    "floorList",
    "floors",
    "feeds",
    "feed",
    "stream",
    "timeline",
    "statuses",
    "entries",
    "contents",
    "modules",
    "recommend",
    "recommendations",
  ]);

  const BOOLEAN_AD_KEYS = [
    "is_ad",
    "isAd",
    "is_ads",
    "isAds",
    "is_advert",
    "isAdvert",
    "is_sponsored",
    "isSponsored",
    "ad_state",
    "adState",
  ];

  const AD_ID_KEYS = [
    "ad_id",
    "adId",
    "ads_id",
    "advert_id",
    "advertId",
    "creative_id",
    "creativeId",
    "promotion_id",
    "promotionId",
  ];

  const AD_PAYLOAD_KEYS = [
    "ad_info",
    "adInfo",
    "advertisement_info",
    "advertisementInfo",
    "promotion_extra",
    "commercial_info",
    "commercialInfo",
    "sponsor_info",
    "sponsorInfo",
    "sponsoredData",
  ];

  const TYPE_KEYS = [
    "type",
    "card_type",
    "cardType",
    "business_type",
    "businessType",
    "content_type",
    "contentType",
    "item_type",
    "itemType",
    "template",
    "layout",
    "goto",
    "card_goto",
    "dataType",
    "widget_type",
  ];

  const AD_TYPE_TOKENS = new Set([
    "ad",
    "ads",
    "advert",
    "advertise",
    "advertisement",
    "ad_card",
    "adcard",
    "brand_ad",
    "commercial",
    "commercial_card",
    "feed_ad",
    "feed_advert",
    "native_ad",
    "ad_list",
    "promotion",
    "promoted",
    "sponsor",
    "sponsored",
  ]);

  const LABEL_KEYS = ["label", "tag", "badge", "mblogtypename", "promotionLabel"];
  const AD_LABELS = new Set(["广告", "推广", "赞助", "商业推广", "推荐广告", "sponsored"]);
  const YOUKU_AD_TYPE_NAMES = new Set([
    "phone_feed_card_s_ad",
    "phone_h_uc_ad",
    "播放页广告组件",
  ]);
  const YOUKU_AD_IDS = new Set([32133, 38466]);

  function isObject(value) {
    return value !== null && typeof value === "object";
  }

  function hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
  }

  function hasMeaningfulValue(value) {
    if (value === null || value === undefined || value === false || value === 0) {
      return false;
    }
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      return normalized !== "" && normalized !== "0" && normalized !== "false" && normalized !== "null";
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    if (isObject(value)) {
      return Object.keys(value).length > 0;
    }
    return Boolean(value);
  }

  function normalizeToken(value) {
    return typeof value === "string"
      ? value.trim().toLowerCase().replace(/[\s-]+/g, "_")
      : "";
  }

  function isAdItem(value) {
    if (!isObject(value)) {
      return false;
    }

    for (const key of BOOLEAN_AD_KEYS) {
      if (hasOwn(value, key) && hasMeaningfulValue(value[key])) {
        return true;
      }
    }

    for (const key of AD_ID_KEYS) {
      if (hasOwn(value, key) && hasMeaningfulValue(value[key])) {
        return true;
      }
    }

    for (const key of AD_PAYLOAD_KEYS) {
      if (hasOwn(value, key) && hasMeaningfulValue(value[key])) {
        return true;
      }
    }

    for (const key of TYPE_KEYS) {
      const token = normalizeToken(value[key]);
      if (token && AD_TYPE_TOKENS.has(token)) {
        return true;
      }
    }

    for (const key of LABEL_KEYS) {
      const label = normalizeToken(value[key]);
      if (label && AD_LABELS.has(label)) {
        return true;
      }
    }

    const hasClickTracker =
      hasMeaningfulValue(value.click_track_url) ||
      hasMeaningfulValue(value.clickTrackUrl) ||
      hasMeaningfulValue(value.click_tracking_urls);
    const hasImpressionTracker =
      hasMeaningfulValue(value.impression_url) ||
      hasMeaningfulValue(value.impressionUrl) ||
      hasMeaningfulValue(value.impression_tracking_urls);

    return Boolean(hasClickTracker && hasImpressionTracker);
  }

  function emptyValue(value) {
    if (Array.isArray(value)) {
      return [];
    }
    if (isObject(value)) {
      return {};
    }
    if (typeof value === "number") {
      return 0;
    }
    if (typeof value === "boolean") {
      return false;
    }
    if (typeof value === "string") {
      return "";
    }
    return null;
  }

  function isAlreadyEmpty(value) {
    if (Array.isArray(value)) {
      return value.length === 0;
    }
    if (isObject(value)) {
      return Object.keys(value).length === 0;
    }
    if (typeof value === "number") {
      return value === 0;
    }
    if (typeof value === "boolean") {
      return value === false;
    }
    if (typeof value === "string") {
      return value === "";
    }
    return value === null;
  }

  function shouldDescend(key, value) {
    if (!isObject(value)) {
      return false;
    }
    if (BRANCH_KEYS.has(key) || CONTAINER_KEYS.has(key)) {
      return true;
    }
    return /(?:data|result|response|payload|content|container|page|feed|stream|timeline|module|section|floor|card|item|list|entries|config)$/i.test(
      key,
    );
  }

  function pruneKnownContainers(root, options = {}) {
    if (!isObject(root)) {
      return false;
    }

    const clearKeys = new Set(options.clearKeys || []);
    const containerKeys = new Set([...CONTAINER_KEYS, ...(options.containerKeys || [])]);
    const branchKeys = new Set([...BRANCH_KEYS, ...(options.branchKeys || [])]);
    const itemPredicate = options.itemPredicate || isAdItem;
    const queue = [{ value: root, depth: 0 }];
    const visited = new Set();
    let changed = false;
    let cursor = 0;

    while (cursor < queue.length && visited.size < MAX_VISITED_OBJECTS) {
      const current = queue[cursor++];
      const object = current.value;
      if (!isObject(object) || visited.has(object) || current.depth > MAX_DEPTH) {
        continue;
      }
      visited.add(object);

      if (Array.isArray(object)) {
        for (const item of object) {
          if (isObject(item)) {
            queue.push({ value: item, depth: current.depth + 1 });
          }
        }
        continue;
      }

      for (const [key, value] of Object.entries(object)) {
        if (clearKeys.has(key) && !isAlreadyEmpty(value)) {
          object[key] = emptyValue(value);
          changed = true;
          continue;
        }

        if (Array.isArray(value) && containerKeys.has(key)) {
          const kept = value.filter((item) => !itemPredicate(item));
          if (kept.length !== value.length) {
            object[key] = kept;
            changed = true;
          }
          for (const item of object[key]) {
            if (isObject(item)) {
              queue.push({ value: item, depth: current.depth + 1 });
            }
          }
          continue;
        }

        if (isObject(value) && (branchKeys.has(key) || shouldDescend(key, value))) {
          queue.push({ value, depth: current.depth + 1 });
        }
      }
    }

    return changed;
  }

  function setNumericFieldDeep(root, field, numericValue) {
    if (!isObject(root)) {
      return false;
    }
    const queue = [{ value: root, depth: 0 }];
    const visited = new Set();
    let changed = false;
    let cursor = 0;

    while (cursor < queue.length && visited.size < MAX_VISITED_OBJECTS) {
      const { value, depth } = queue[cursor++];
      if (!isObject(value) || visited.has(value) || depth > MAX_DEPTH) {
        continue;
      }
      visited.add(value);

      if (!Array.isArray(value) && hasOwn(value, field) && value[field] !== numericValue) {
        value[field] = numericValue;
        changed = true;
      }

      for (const [key, child] of Object.entries(value)) {
        if (isObject(child) && (Array.isArray(value) || shouldDescend(key, child))) {
          queue.push({ value: child, depth: depth + 1 });
        }
      }
    }
    return changed;
  }

  function handleWechat(body) {
    const cleared = pruneKnownContainers(body, {
      clearKeys: ["advertisement_info", "advertisementInfo", "ad_info", "adInfo"],
      branchKeys: ["advertisement"],
    });
    const zeroed = setNumericFieldDeep(body, "advertisement_num", 0);
    return cleared || zeroed;
  }

  function handleTencentNews(body) {
    return pruneKnownContainers(body, {
      clearKeys: ["adList"],
      containerKeys: ["widget_list"],
      branchKeys: ["widget_list"],
    });
  }

  function handleJd(body, url) {
    const functionId = (url.match(/[?&]functionId=([^&#]+)/) || [])[1] || "";
    const clearKeys = [
      "ad",
      "ads",
      "adList",
      "advert",
      "advertList",
      "advertisement",
      "advertisements",
      "floatLayer",
      "popupAds",
      "popups",
    ];

    if (functionId === "start") {
      clearKeys.push("images", "splash", "splashList");
    }
    if (functionId === "welcomeHome") {
      clearKeys.push("webViewFloorList");
    }

    return pruneKnownContainers(body, {
      clearKeys,
      containerKeys: ["floorList", "wareList", "orderList", "bannerList"],
      branchKeys: ["floorList", "welcomeHome", "homeFloor"],
    });
  }

  function handleZhihu(body) {
    return pruneKnownContainers(body, {
      clearKeys: [
        "ad",
        "ads",
        "ad_info",
        "adInfo",
        "advertisement",
        "advertisements",
        "commercial",
        "commercials",
        "promotion_extra",
      ],
      containerKeys: ["paging", "hot_list", "recommendations", "feed", "data"],
      branchKeys: ["paging", "hot_list", "recommendations"],
    });
  }

  function handleWeibo(body) {
    return pruneKnownContainers(body, {
      clearKeys: [
        "ad",
        "ads",
        "ad_info",
        "adInfo",
        "advertisement",
        "advertisements",
        "promotion",
        "promotions",
      ],
      containerKeys: ["statuses", "cards", "card_group", "items", "list"],
      branchKeys: ["card_group", "statuses", "timeline"],
    });
  }

  function handleXianyu(body) {
    return pruneKnownContainers(body, {
      clearKeys: [
        "ad",
        "ads",
        "adList",
        "advert",
        "advertList",
        "bannerReturnDO",
        "widgetReturnDO",
      ],
      containerKeys: ["sections", "feeds", "items", "cardList", "resultList"],
      branchKeys: ["sections", "feeds", "resultList"],
    });
  }

  function handleAmap(body) {
    return pruneKnownContainers(body, {
      clearKeys: [
        "ad",
        "ads",
        "adList",
        "advert",
        "advertList",
        "advertisement",
        "commercial",
        "commercials",
        "dsp",
      ],
      containerKeys: ["cardList", "modules", "messageList", "hotwords", "items"],
      branchKeys: ["mainPage", "messageBox", "profile", "hotword"],
    });
  }

  function isYoukuAdItem(value) {
    if (isAdItem(value)) {
      return true;
    }
    const typeName = normalizeToken(value?.typeName);
    if (YOUKU_AD_TYPE_NAMES.has(typeName)) {
      return true;
    }
    return YOUKU_AD_IDS.has(Number(value?.id));
  }

  function handleYouku(body, url) {
    const clearKeys = url.includes("/collect-api/get_push_interval_config_wx")
      ? ["tipContent", "tipContentNew"]
      : ["ad", "ykad"];
    return pruneKnownContainers(body, {
      clearKeys,
      containerKeys: ["nodes"],
      branchKeys: ["2019030100", "2019061000", "nodes"],
      itemPredicate: isYoukuAdItem,
    });
  }

  function handleGenericAdResponse(body) {
    return pruneKnownContainers(body, {
      clearKeys: [
        "ad",
        "ads",
        "ad_info",
        "adInfo",
        "adList",
        "advert",
        "advertList",
        "advertisement",
        "advertisements",
        "advertisement_info",
        "advertisementInfo",
        "launch_ad",
        "launchAd",
        "splash_ads",
        "splashAds",
        "splashList",
      ],
      containerKeys: [
        "card_group",
        "cardGroup",
        "dataList",
        "feedList",
        "homeFeed",
        "itemList",
        "moduleList",
        "resultList",
      ],
      branchKeys: [
        "card_group",
        "cardGroup",
        "dataList",
        "feedList",
        "homeFeed",
        "moduleList",
        "resultList",
      ],
    });
  }

  const ROUTES = [
    {
      id: "tencent-news",
      pattern:
        /^https:\/\/(?:news\.ssp\.qq\.com\/app|r\.inews\.qq\.com\/(?:getQQNewsUnreadList|getTagFeedList|news_feed\/hot_module_list|gw\/page\/(?:event_detail|channel_feed)))(?:\?|$)/,
      handle: handleTencentNews,
    },
    {
      id: "wechat",
      pattern: /^https:\/\/mp\.weixin\.qq\.com\/mp\/getappmsgad(?:\?|$)/,
      handle: handleWechat,
    },
    {
      id: "jd",
      pattern:
        /^https:\/\/api\.m\.jd\.com\/client\.action\?(?:[^#&]+&)*functionId=(?:deliverLayer|getTabHomeInfo|myOrderInfo|orderTrackBusiness|personinfoBusiness|start|welcomeHome)(?:&|$)/,
      handle: handleJd,
    },
    {
      id: "zhihu",
      pattern:
        /^https:\/\/(?:api\.zhihu\.com\/(?:(?:moments_v3|topstory\/(?:recommend|hot-lists\/total)|v2\/topstory\/hot-lists\/everyone-seeing)|questions\/\d+\/(?:answers|feeds))|www\.zhihu\.com\/api\/v4\/(?:articles|answers)\/\d+\/recommendations?)(?:\?|$)/,
      handle: handleZhihu,
    },
    {
      id: "weibo",
      pattern:
        /^https:\/\/(?:m?api\.weibo\.(?:cn|com)\/\d+\/(?:cardlist|searchall|page|groups\/timeline|statuses\/(?:(?:unread_)?friends(?:\/|_)timeline|unread_hot_timeline|video_mixtimeline)|video\/(?:community_tab|tiny_stream_video_list)|search\/(?:finder|container_timeline|container_discover)|comments\/build_comments)|weibointl\.api\.weibo\.(?:cn|com)\/portal\.php)(?:\?|$)/,
      handle: handleWeibo,
    },
    {
      id: "xianyu",
      pattern:
        /^https:\/\/(?:g-)?acs\.m\.goofish\.com\/gw\/(?:mtop\.taobao\.idlehome\.home\.nextfresh|mtop\.taobao\.idle\.local\.(?:home|flow\.plat\.section)|mtop\.taobao\.idlemtopsearch\.search)(?:\/|$)/,
      handle: handleXianyu,
    },
    {
      id: "amap",
      pattern:
        /^https:\/\/m\d+\.amap\.com\/ws\/(?:faas\/amap-navigation\/main-page|msgbox\/pull|shield\/(?:dsp\/profile\/index\/nodefaas|search\/new_hotword))(?:\?|$)/,
      handle: handleAmap,
    },
    {
      id: "youku",
      pattern:
        /^https:\/\/(?:(?:(?:acs\.youku\.com\/gw\/mtop\.youku\.(?:columbus\.(?:gateway\.new\.execute|home\.(?:feed|query)|uc\.query|ycp\.query)|soku\.yksearch)|un-acs\.youku\.com\/gw\/mtop\.youku\.play\.ups\.appinfo\.get)(?:\/|\?|$))|push\.m\.youku\.com\/collect-api\/get_push_interval_config_wx(?:\?|$))/,
      handle: handleYouku,
    },
    {
      id: "baidu-tieba",
      pattern:
        /^https:\/\/(?:tiebac|c\.tieba)\.baidu\.com\/(?:c\/(?:s\/sync|f\/(?:ad\/getFeedAd|frs\/(?:page|threadlist|generalTabList)|pb\/(?:pic)?page|excellent\/personalized))|tiebaads\/commonbatch)(?:\?|$)/,
      handle: handleGenericAdResponse,
    },
    {
      id: "meituan-dianping",
      pattern:
        /^https:\/\/mapi\.dianping\.com\/mapi\/intelliindex(?:\?|$)/,
      handle: handleGenericAdResponse,
    },
    {
      id: "smzdm",
      pattern:
        /^https:\/\/(?:homepage-api\.smzdm\.com\/v3\/home|haojia-api\.smzdm\.com\/(?:home\/list|ranking_list\/articles)|s-api\.smzdm\.com\/sou\/list_v10)(?:\?|$)/,
      handle: handleGenericAdResponse,
    },
    {
      id: "ximalaya",
      pattern:
        /^https:\/\/(?:mobile|mobilehera|mobwsa)\.ximalaya\.com\/(?:discovery-feed\/v\d+\/mix|football-portal\/diff2\/batch|mobile-playpage\/playpage\/tabs\/v2)(?:\/|\?|$)/,
      handle: handleGenericAdResponse,
    },
    {
      id: "xiaohongshu",
      pattern:
        /^https:\/\/(?:edith|rec|www|so)\.xiaohongshu\.com\/api\/sns\/(?:v\d+\/system_service\/(?:splash_config|config)|v\d+\/(?:homefeed|search\/(?:notes|banner_list|hot_list)|note\/widgets))(?:\?|$)/,
      handle: handleGenericAdResponse,
    },
    {
      id: "coolapk",
      pattern:
        /^https:\/\/api\.coolapk\.com\/v6\/(?:feed\/(?:detail|replyList)|main\/(?:dataList|indexV8|init)|page\/dataList)(?:\?|$)/,
      handle: handleGenericAdResponse,
    },
    {
      id: "quark",
      pattern:
        /^https:\/\/open-cms-api\.(?:uc|quark)\.cn\/open-cms(?:\/|\?|$)/,
      handle: handleGenericAdResponse,
    },
    {
      id: "didi",
      pattern:
        /^https:\/\/(?:ct\.xiaojukeji\.com\/agent\/v3\/feeds|res\.xiaojukeji\.com\/resapi\/activity\/(?:xpget|mget|get(?:Ruled|Preload|PasMultiNotices))|conf\.diditaxi\.com\.cn\/(?:homepage\/v\d+\/other\/fast|dynamic\/conf))(?:\?|$)/,
      handle: handleGenericAdResponse,
    },
    {
      id: "chelaile-promo",
      pattern:
        /^https:\/\/app\.ibuscloud\.com\/v\d+\/notice\/getNoticeWithAdvByCity(?:\?|$)/,
      handle: handleGenericAdResponse,
    },
    {
      id: "huazhu-promo",
      pattern:
        /^https:\/\/hweb-manager\.huazhu\.com\/notice\/getAppPopupNotifyAlert(?:\?|$)/,
      handle: handleGenericAdResponse,
    },
    {
      id: "kuwo",
      pattern:
        /^https:\/\/(?:mgxhtj|nmobi|searchrecterm)\.kuwo\.cn\/(?:mgxh|mobi|recterm)\.s(?:\?|$)/,
      handle: handleGenericAdResponse,
    },
    {
      id: "boohee",
      pattern:
        /^https:\/\/api\.boohee\.com\/meta-interface\/(?:v2\/index|v1\/index\/plaza)(?:\?|$)/,
      handle: handleGenericAdResponse,
    },
    {
      id: "foodie",
      pattern:
        /^https:\/\/foodie-api\.yiruikecorp\.com\/v\d+\/(?:banner|notice)\/overview(?:\?|$)/,
      handle: handleGenericAdResponse,
    },
    {
      id: "hanju-tv",
      pattern:
        /^https:\/\/api\.hanju\.koudaibaobao\.com\/api\/carp\/kp(?:\?|$)/,
      handle: handleGenericAdResponse,
    },
    {
      id: "mogo-renter",
      pattern:
        /^https:\/\/api\.mgzf\.com\/renter-operation\/home\/startHomePage(?:\?|$)/,
      handle: handleGenericAdResponse,
    },
    {
      id: "score",
      pattern: /^https:\/\/api\.qiuduoduo\.cn\/guideimage(?:\?|$)/,
      handle: handleGenericAdResponse,
    },
    {
      id: "xiaochao-brain",
      pattern: /^https:\/\/api\.psy-1\.com\/cosleep\/startup(?:\?|$)/,
      handle: handleGenericAdResponse,
    },
    {
      id: "yizhibo",
      pattern:
        /^https:\/\/api\.yizhibo\.com\/common\/api\/(?:api_pz|pz)(?:\?|$)/,
      handle: handleGenericAdResponse,
    },
    {
      id: "yueme-tv",
      pattern:
        /^https:\/\/zjh5api\.189smarthome\.com:\d+\/xygj-config-api\/queryData(?:\?|$)/,
      handle: handleGenericAdResponse,
    },
    {
      id: "zhibo8",
      pattern:
        /^https:\/\/a\.qiumibao\.com\/(?:activities\/config\.php|ios\/config\/)(?:\?|$)/,
      handle: handleGenericAdResponse,
    },
  ];

  function processResponse(input) {
    const url = typeof input?.url === "string" ? input.url : "";
    const body = typeof input?.body === "string" ? input.body : "";
    const route = ROUTES.find((candidate) => candidate.pattern.test(url));

    if (!route || !body || body.length > MAX_BODY_CHARACTERS) {
      return { body, changed: false, route: route?.id || null };
    }

    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      return { body, changed: false, route: route.id };
    }

    if (!isObject(parsed)) {
      return { body, changed: false, route: route.id };
    }

    try {
      const changed = Boolean(route.handle(parsed, url));
      return {
        body: changed ? JSON.stringify(parsed) : body,
        changed,
        route: route.id,
      };
    } catch {
      return { body, changed: false, route: route.id };
    }
  }

  const api = Object.freeze({
    processResponse,
    routeIds: Object.freeze(ROUTES.map((route) => route.id)),
    isAdItem,
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (
    runtime &&
    typeof runtime.$done === "function" &&
    runtime.$request &&
    runtime.$response
  ) {
    const result = processResponse({
      url: runtime.$request.url,
      body: runtime.$response.body,
    });
    runtime.$done(result.changed ? { body: result.body } : {});
  }
})(typeof globalThis !== "undefined" ? globalThis : this);

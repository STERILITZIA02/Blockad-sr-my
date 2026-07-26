/*
 * 原 AdBlock.module 的分组名与当前独立组件之间的人工对照。
 *
 * 这里只描述“哪个旧分组由哪个当前组件负责”，不把旧规则自动注入构建。
 * 是否迁移某条规则仍由 config/apps.mjs / config/legacy-apps.mjs 中的精确
 * 配置决定，避免审计脚本意外成为生产规则生成器。
 */
export const legacyCoverage = Object.freeze({
  "AMap": {
    components: ["amap"],
    disposition: "partial",
    note: "保留开屏和商业接口；旧天气误拦截与整站匹配不迁移。",
  },
  "Baidu NetDisk": {
    components: ["baidu-netdisk"],
    disposition: "partial",
    note: "保留广告、活动入口和明确广告素材；不修改会员、下载或播放。",
  },
  "ByteDance": {
    components: ["douyin", "fanqie"],
    disposition: "partial",
    note: "改为穿山甲/Gromore 精确广告端点；IP 与共享业务整域不迁移。",
  },
  "Google": {
    components: ["youtube"],
    disposition: "replaced",
    note: "由固定 Maasea 快照的安全补丁替代旧纯 Rewrite；不封禁 QUIC/播放 CDN。",
  },
  "JD": {
    components: ["jd"],
    disposition: "partial",
    note: "启动与显式广告字段由本地处理器持续过滤；保留订单、支付和物流。",
  },
  "Taobao": {
    components: ["taobao-tmall"],
    disposition: "partial",
    note: "保留精确开屏/广告服务；不采用共享 CDN 图片尺寸猜测。",
  },
  "Tencent News": {
    components: ["qq"],
    disposition: "replaced",
    note: "开屏、adList 与 ad_list 组件由本地幂等处理器接管；不拒绝正常远程配置。",
  },
  "Weibo": {
    components: ["weibo"],
    disposition: "replaced",
    note: "修复旧协议拼写并改用本地、窄主机、失败开放的 JSON 过滤。",
  },
  "Xianyu": {
    components: ["xianyu", "xianyu-ui"],
    disposition: "replaced",
    note: "开屏和显式商业卡默认处理；非广告 UI 精简单独可选。",
  },
  "Zhihu": {
    components: ["zhihu", "zhihu-link-direct"],
    disposition: "partial",
    note: "保留商业字段与链接直达；通知、评论、账号和整响应拒绝不迁移。",
  },
  "Tencent WeChat": {
    components: ["wechat"],
    disposition: "replaced",
    note: "原分组没有启用规则；微信去广告由独立 wechatad 迁移路径持续处理。",
  },
  "bilibili": {
    components: [],
    disposition: "user-managed",
    note: "用户已有专用规则；本仓库不发行任何 Bilibili Rewrite、脚本、规则或 MITM 主机。",
  },
});

/*
 * 没有独立组件时，以下分组必须采用指定结论，不能由启发式规则误判为
 * “待迁移”。其余分组由 scripts/audit-parity.mjs 根据每条旧规则的结构
 * 给出保守分类，并完整列入报告。
 */
export const legacyDecisionOverrides = Object.freeze({
  "eleme": {
    disposition: "unsafe",
    note: "仅按共享 CDN 图片尺寸/视频文件名判断，无法证明素材一定是广告。",
  },
  "Guotai Junan Securities": {
    disposition: "unsafe",
    note: "按证券 App CDN 中任意 jpg 路径阻断，范围不具备广告专属性。",
  },
  "Tencent Video": {
    disposition: "unsafe",
    note: "旧规则按视频 CDN 文件名/IP 猜测广告，可能破坏播放。",
  },
  "zhuishushenqi": {
    components: ["zhuishushenqi"],
    disposition: "partial",
    note: "广告/开屏接口可迁移；通知、书架同步和 App Store 更新检查不得阻断。",
  },
});

export const dispositionLabels = Object.freeze({
  replaced: "已本地化替代",
  partial: "部分安全迁移",
  migrated: "已精确迁移",
  "partial-archive": "部分可迁移，其余留档",
  unsafe: "不直接迁移：误伤风险",
  "ip-risk": "不直接迁移：IP 漂移风险",
  "shared-cdn-risk": "不直接迁移：共享 CDN/媒体特征",
  "normal-feature-risk": "不直接迁移：正常功能风险",
  "no-active-rule": "无可执行规则",
  "needs-evidence": "留档：缺少近期接口证据",
  "user-managed": "不纳入：由专用规则接管",
});

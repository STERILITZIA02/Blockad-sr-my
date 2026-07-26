# BlockAd SR My v1.1.1

这是 v1.1.0 去广告规则集的安装体验补丁。第一支持目标仍为 Shadowrocket；没有
声称完成 iPhone 或 Shadowrocket 真机测试。

## 发行内容

- `BlockAd.Unified.sgmodule`：可直接导入的固定版本统一模块。
- `BlockAd-SR-v1.1.1.zip`：166 个独立组件、2 个默认关闭的便利组件、本地脚本、
  规则、审计报告、许可证和可复现构建输入。
- `SHA256SUMS.txt`：GitHub Release 资产 SHA-256。

一键导入：

```text
https://sterilitzia02.github.io/Blockad-sr-my/install.html
```

稳定订阅：

```text
https://raw.githubusercontent.com/STERILITZIA02/Blockad-sr-my/main/stable/BlockAd.Unified.sgmodule
```

固定版本订阅：

```text
https://raw.githubusercontent.com/STERILITZIA02/Blockad-sr-my/v1.1.1/release/v1.1.1/BlockAd.Unified.sgmodule
```

## 相对 v1.1.0

- README 新增醒目的“一键导入 Shadowrocket”按钮。
- 新增本仓库 GitHub Pages 固定安装页，使用
  `shadowrocket://install?module={url}` URL Scheme 唤起 Shadowrocket。
- 安装页不接受查询参数、不执行外部请求、不加载第三方脚本，并提供手动唤起和
  原始订阅备用入口。
- 去广告规则、Rewrite、响应脚本、MITM 主机、组件数量和默认开关均保持不变。
- 按用户要求继续完全排除 Bilibili 运行内容。

## 验证

- 安装页面稳定 URL、URL Scheme、固定跳转和无外部脚本约束进入自动检查。
- 发行模块继续通过 section、正则、路径、重复项、固定上游、敏感信息、fixture、
  manifest、SHA-256 和确定性 ZIP 检查。

安装、缓存处理和真机验收项见 `docs/INSTALL.md`；回滚到 v1.1.0 见
`docs/ROLLBACK.md`。

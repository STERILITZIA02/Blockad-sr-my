# 回滚指南

## 立即恢复正常功能

1. 在 Shadowrocket 中停用 `BlockAd - 统一稳定版`。
2. 完全退出受影响 App 后重开。
3. 若异常消失，保留模块为停用状态并记录命中的 URL/主机。
4. 如已改用独立组件，只停用对应组件。

停用是首选回滚，既可立即恢复网络路径，也保留订阅信息供后续诊断。

## 回滚到 v1.0.0

未来稳定入口升级后，可删除或停用滚动稳定订阅，改用不可变链接：

```text
https://raw.githubusercontent.com/STERILITZIA02/Blockad-sr-my/v1.0.0/release/v1.0.0/BlockAd.Unified.sgmodule
```

固定标签内的模块、脚本、规则和 SHA-256 不会跟随 `main` 改变。切换时不要同时启用
新旧统一模块。

## 首个版本说明

v1.0.0 是本仓库第一套经过统一审计的稳定版本，没有更早的统一稳定标签可回滚。
如 v1.0.0 本身造成问题，应停用它，而不是重新启用 `现有插件/` 中的聚合模块。
历史模块含已确认语法错误、动态第三方脚本、重复处理器和宽泛封禁，仅作为审计证据。

## 完整性核验

下载固定版本目录或 GitHub Release ZIP 后，在 PowerShell 中运行：

```powershell
Get-FileHash .\BlockAd-SR-v1.0.0.zip -Algorithm SHA256
Get-FileHash .\BlockAd.Unified.sgmodule -Algorithm SHA256
```

结果应与 Release 附带的 `SHA256SUMS.txt` 一致。发行目录中的每个文件还可用
`release/v1.0.0/SHA256SUMS.txt` 单独复核。

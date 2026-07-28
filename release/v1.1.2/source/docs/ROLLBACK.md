# 回滚指南

## 立即恢复正常功能

1. 在 Shadowrocket 中停用 `BlockAd - 统一稳定版`。
2. 完全退出受影响 App 后重开。
3. 若异常消失，保留模块为停用状态并记录命中的 URL/主机。
4. 如已改用独立组件，只停用对应组件。

停用是首选回滚，既可立即恢复网络路径，也保留订阅信息供后续诊断。

## 从 v1.1.2 回滚到 v1.1.1

未来稳定入口升级后，可删除或停用滚动稳定订阅，改用不可变链接：

```text
https://raw.githubusercontent.com/STERILITZIA02/Blockad-sr-my/v1.1.1/release/v1.1.1/BlockAd.Unified.sgmodule
```

固定标签内的模块、脚本、规则和 SHA-256 不会跟随 `main` 改变。切换时不要同时启用
新旧统一模块。注意：v1.1.1 是直接上一版本，但包含本次修复的抖音
`amemv/snssdk` 通配 MITM 回归；如果使用抖音，不建议回滚到 v1.1.1，应直接停用
统一模块或只启用已验证的独立组件。

## 版本边界

v1.1.1 是一键安装页补丁，也是 v1.1.2 的直接上一版本；其广告配置与 v1.1.0
相同，因此两者都有本次发现的抖音通配 MITM 风险。若问题与 v1.1.2 的全仓精确
MITM 收窄有关，优先停用对应独立组件或统一模块，而不是回滚并重新引入已知回归，
更不要启用 `现有插件/` 中的旧聚合模块。
历史模块含已确认语法错误、动态第三方脚本、重复处理器和宽泛封禁，仅作为审计证据。

## 完整性核验

下载固定版本目录或 GitHub Release ZIP 后，在 PowerShell 中运行：

```powershell
Get-FileHash .\BlockAd-SR-v1.1.2.zip -Algorithm SHA256
Get-FileHash .\BlockAd.Unified.sgmodule -Algorithm SHA256
```

结果应与 Release 附带的 `SHA256SUMS.txt` 一致。发行目录中的每个文件还可用
`release/v1.1.2/SHA256SUMS.txt` 单独复核。若要冻结上一版本，则使用
`release/v1.1.1/` 及其 `SHA256SUMS.txt`，并接受上述抖音已知风险。

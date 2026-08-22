---
title: AVCheck2
description: 离线 Windows 进程识别工具；以本地版本化规则库提供可复核的安全产品识别结果。
published: 2025-12-23
updated: 2026-08-19
tags: [Python, Security Engineering, Offline, Rule Base]
draft: false
---

## 项目说明

这是对 [AVCheck](https://github.com/wwl012345/AVCheck) 的个人维护与学习分支。工具离线处理已获授权环境导出的进程列表，将进程名与本地规则库比对，输出可能关联的安全产品及命中证据。

近期改动将原有文本规则整理为版本化的 `av_signatures.json`，并补齐输入解析、结构化输出与自动化测试，使规则维护与结果复核更清晰。

## 当前能力

- 支持常规 `tasklist` 文本、Windows `tasklist /fo csv` 输出和纯进程名列表。
- 默认尝试 UTF-8 with BOM 与 GB18030 解码，也可显式指定输入编码。
- 提供去重后的产品汇总、可选命中详情与 JSON 输出，便于后续处理。
- 规则文件可替换；默认按脚本所在目录定位，降低从不同工作目录运行时的歧义。
- 使用 Python 标准库实现，环境要求为 Python 3.9+。

## 验证

仓库加入 `unittest` 测试，覆盖规则读取、大小写无关匹配、三种输入格式解析，以及常见失败时的退出码：

```powershell
python -m unittest discover -s tests -v
```

## 边界

工具不扫描文件、不修改系统设置、不访问网络，也不包含规避检测或绕过防护的能力。进程列表可能暴露设备的软件与运行环境信息；请只处理本人设备或已获授权环境的脱敏数据，且不要公开真实导出的进程清单。

规则仅依据进程名进行识别，不能证明对应产品已启用或防护正在生效；进程改名、组件更新或同名软件都可能带来漏报或误报。

## 仓库

[在 GitHub 查看 AVCheck2](https://github.com/kiteAB112/AVCheck2)

---
title: Pebble Hunting
description: 从 TweetFeed、phishunt.io、ThreatDeck 等开源项目出发，记录威胁情报的采集、核查、富集与狩猎思路。
published: 2026-11-20
tags: [Threat Intelligence, Threat Hunting, Security]
draft: false
featured: false
kind: article
discussionId: articles/pebble-hunting
---

## 0xDanielLopez

Feeds of IOCs posted by the community on Twitter/X，应该是从至少四年前就开始了这个仓库的雏形，因为能看到 2022 年的[TweetFeed](https://github.com/0xDanielLopez/TweetFeed_code) 这个项目，其中是当时作者提交的简化后的核心代码；当前这个项目已经发展为了作者称为的 “独立业余项目” ，有了一套成熟的对外提供服务的网站，官网条款写明服务免费、无需认证，真的感动啊；

且除了这个还顺带看到了作者的 phishunt.io，也是直接声明 "A free, open-source project that tracks **active suspicious phishing sites** in real time."  

### [TweetFeed](https://github.com/0xDanielLopez/TweetFeed)

其中第一个项目 ”TweetFeed collects Indicators of Compromise (IOCs) shared by the infosec community at Twitter. Here you will find malicious URLs, domains, IPs, and SHA256/MD5 hashes.“ 从 X 上面抓取各类 IOCs，其中来源从目前项目 `status.json` 中的 `sources` 中可以看出是有两类采集入口

|类别|当前数量|含义|
|---|---|---|
|`hashtag`|33|按安全标签搜索推文|
|`account`|24|跟踪指定账号或入口，其中也包含 List、搜索入口，不全是个人账号|

**33 个标签**，按内容方便理解，可以归成下面几组

|内容类别|标签|
|---|---|
|通用威胁主题|`malware`、`phishing`、`scam`、`ransomware`|
|攻击组织／活动归属|`BlueNoroff`、`Kimsuky`、`MustangPanda`|
|RAT／远控恶意软件|`AsyncRAT`、`Dcrat`、`NanoCore`、`Njrat`、`Remcos`、`ValleyRAT`、`Xworm`|
|窃密及其他恶意软件|`AmosStealer`、`Formbook`、`Lokibot`、`Lumma`、`LummaStealer`、`Rhadamanthys`、`SalatStealer`、`Vidar`|
|加载器|`GuLoader`、`HijackLoader`|
|攻击工具／被滥用的软件与技术|`CobaltStrike`、`NetSupport`、`Sliver`、`Reverse_SSH`、`PHP2Shell`|
|攻击手法／发现线索|`AiTM`、`ClickFix`、`Magecart`、`opendir`|

我刚开始没细看，还想着作者没开源的话自己根据对方目前提供的数据反推一下看看都抓取哪些账号以及有哪些特征和方式，好方便后续自己做类似的；惭愧啊




### phishunt.io

第二个则是专注钓鱼网站的项目，做的相对来说就不只是第一个那样收集和一些基础脚本了，是对钓鱼网站情报收集和分析到全流程

当前项目来看其中**主要是做品牌特征钓鱼识别相关**的，因为一方面很多钓鱼都是基于大品牌的域名类似仿冒来降低人的疑虑，所以这种域名会很多，另一方面就是对已有大品牌域名可以做分析来得到更多信息判断一个域名是否是钓鱼域名；而对于一般钓鱼网址来说，如同项目文档讲的：“**仅靠 URL 外形分析，无法看出不带品牌特征的钓鱼**”

下面来学习一下其中涉及到的情报来源和主动发现都有哪些，还是先扫盲

#### 证书透明度日志

> 传统安全防护往往需要等到恶意链接被访问、举报或收录后才能发现，而 CT 监控有机会在攻击者还在准备网站的时候，就提前捕获一些线索

CT 最初目标是：让证书颁发过程公开透明，防止 CA 私自或错误地签发证书，而域名所有者完全不知情；同时我们也可以通过配置 CT 监控规则，在其中包含我们想关注的域名关键词，例如 `example  microsoft` 等，一旦有新的证书被颁发我们就可以拿到域名标记为候选域名，并开始尝试对此域名做一些威胁分析，品牌匹配 / 拼写相似度 / 敏感关键词等等，现在也完全可以接一个 ai 来分析应该会好很多；

CT Log 是一个多运营方、分布式的体系。一个 CA 可以将证书或预证书提交到多个独立运营商维护的日志中，CA 相关的可以看我之前写的 [CA & PKI Trust](https://kiteab112.github.io/articles/ca-pki-trust/) ; CT Log 是对公众开放读取的，传统 RFC 6962 CT 日志提供这样的接口(当前 CT 生态正在引入新的 Static CT API，不能假设所有日志都使用上述旧接口)：

```http
GET /ct/v1/get-sth
GET /ct/v1/get-entries?start=0&end=100
GET /ct/v1/get-proof-by-hash
```

那么基础使用其实有两个项目足以，reloading01/certstream-server-rust + https://crt.sh/ ，用 CertStream 获取新增证书事件，使用 crt.sh 辅助历史查询


[![从证书透明度日志发现疑似仿冒域名](/articles/pebble-hunting/certificate-transparency.svg)](/articles/pebble-hunting/certificate-transparency.svg)

*另外看到了一些项目，记录一下：*

*x0rz/phishing_catcher*，八九年前的项目，以 CertStream 为基底做的读取新证书，按照可疑关键词、TLD 等规则对域名打分，输出可能涉及钓鱼的域名项目；暂时未下载下来使用，后续搞下来看看咋样，顺带看看能不能二开一下融合到后续准备的 agent 项目中

*elceef/dnstwist*，输入企业真实域名，自动生成拼写相似的候选域名，检查 DNS、邮件服务，还支持网页 HTML 相似度和截图视觉相似度比较；
	网页 HTML 相似度用的是 Fuzzy Hashing(模糊哈希)，支持两种算法 ssdeep / TLSH；但这个方法只支持如果仿冒网站用类似的技术栈情况，一旦用了不一样的技术栈就无法了
	截图视觉相似度用的是 Perceptual Hashing(感知哈希)，pHash

实际上述两种相似度判断方式因为都是写死的程序和算法，也就是几乎完全可以被有心人研究绕过，那这时候 ai 时代直接调接口吧，那就是和 ai 的安全对抗了，站在一个普通人的视角我也想不到更好的思路了，被 ai 锁死了

这个就先到这里，后续可能会更新，也可能不会


---

#### Newly Registered Domains

CZDS，zone-file telemetry，这是**官方区域文件**访问入口。申请获得具体 TLD 的权限后，可以下载完整区域文件，然后自行对比每天的变化，下面补充一个域名的生命周期相关，区域文件大概就是顶级域名管控的那个对照表吧

[![新域名的生命周期与监测入口](/articles/pebble-hunting/domain-lifecycle.svg)](/articles/pebble-hunting/domain-lifecycle.svg)

那么申请不到也没事，有一个给大白饭的免费项目，https://smet.cz/ ，提供免费的每日新增域名数据，支持 TXT、JSON 和 GZIP，不需要 API Key，可以直接下载


同时与此相关的相对可用的项目有两个，[domainthreat](https://github.com/PAST2212/domainthreat?utm_source=chatgpt.com) 是检测程序，[HaGeZi NRD](https://github.com/hagezi/nrd?utm_source=chatgpt.com) 是数据集发布项目；有意思的是，domainthreat 从 v3.24 开始，就已经接入 HaGeZi 发布的 NRD 数据源

其中 domainthreat 与 dnstwist 的实现思路不同，后者是 `输入原始域名 → 生成大量相似域名 → 检查是否存在`，前者则是 `获取已经出现的新域名 → 与品牌关键词比较 → 提取可疑域名`，更像我们提到的 phishunt.io 项目

另外就是其中涉及的算法，那这里就不多提及了，我还是认为相对于算法来说，不考虑极致的性能的话，梭哈 ai 吧；

不过 IDN 与 Homoglyph 检测 仍是很多项目需要注意的在字符串相似度中容易遗漏的一类风险，底层字符的不同

另一个 HaGeZi 的 NRD 项目是将来自 Stamus Labs 的基础数据进行整理和发布，对外提供了 NRD 和 高熵 NRD/DGA ，其中DGA的意思是 Domain Generation Algorithm，即域名生成算法，高熵就是偏向于随机生成的域名，具有较高的字符熵；其中 Stamus Labs 数据来源根据官方介绍：

[![新增域名数据的整理与发布流程](/articles/pebble-hunting/nrd-feeds.svg)](/articles/pebble-hunting/nrd-feeds.svg)

并且官方表示是免费开放给安全研究人员、开源工具用户和其他防御者，当然这里已经有项目的话，我是考虑不确定需要的情况下先使用这个开源项目即可


需要承认的一个事实是，很多注册类似域名的目的是邮箱钓鱼，那这时候就需要去关注一下相关的邮箱服务，这个前面有项目中有过融合，并且实际实现也不难，DNS 协议的 txt 记录

这个暂时也到这里扫盲就足够了；

---

#### Google Safe Browsing

> Google 提供的一套恶意 URL 识别与访问防护服务。 它的核心能力是判断一个网址是否已经被 Google 识别为钓鱼、恶意软件分发或其他不安全的网络资源；其 API 支持检查 URL 是否命中 Google 持续更新的威胁列表

Google 提供公开开发接口，两种查询方法

- urls.search：直接提交 url 
- hashes.search：提交 url 哈希前缀


至于谷歌怎么将一个网站标记为不安全各种标签的，则是涉及各种其他相关内容，这里暂不涉及；


---

通过前两类项目收集域名，并寻找品牌关键词，拼写变体等可疑模式，这是主动发现

另外则是从已有情报直接获取相关钓鱼网址，或者用情报来查询我们主动获取的可疑域名是否在其中

当然打分制一直是更好的策略，而不是简单的选择 0 或则 1



下面来看看已有情报这个项目中选取的有哪些：phishunt 公开列出的已有情报来源有五个：**OpenPhish、PhishTank、TweetFeed、Google Safe Browsing 和 urlscan.io**

其中 `OpenPhish、PhishTank、TweetFeed` 都是输入候选，分别从自动化系统，社区提交，以及作者自己另一个项目中的钓鱼相关 ioc 拿到钓鱼地址信息；后两个则都是对候选进行核查以及补充扫描证据和关联线索，其中 `urlscan.io` 真不错啊，会相当于对这个网址做一个快照，并且收集一些基础信息，相当于留下证据；免费版就这样好了，pro 版本应该会很不错


总的推测一下 phishunt.io 整体结构为下：

[![phishunt.io 的候选来源、核查与风险研判](/articles/pebble-hunting/phishunt.svg)](/articles/pebble-hunting/phishunt.svg)


到这里 phishunt.io 就暂了，感谢 0xDanielLopez 带来的项目，在这个寻找魔法的路上又看到了一些新东西



---

## gripebomb

### ThreatDeck

> 自己配置来源、关键词和处理规则的威胁情报监控工作台，解决的问题是关注的一批安全咨询接口，**研究报告情报接口持续收集内容，希望出现关心的相关公司，产品，漏洞或攻击活动发生时提醒，并保留相关指标和处理记录**(这其实和我所最初预想的产品几乎是一样的，只是我希望接上 hermes 分析)

来源包含四种类型，**RSS + JSON API + Website + Onion**(埋个坑，后续探探 Onion Routing 相关)，不同来源最终被转换成统一的 `FeedItem`，后面的匹配、保存和指标提取就能复用同一套逻辑，这绝对是做这类项目必经之路，也是最好要做的一步；

告警产生，前面提到可以根据我们关心的公司，产品，漏洞等来进行告警产生及时通知我们，项目中是通过匹配引擎进行关键词或正则匹配，这个我理解现在也是可以梭哈 ai ，不过另一个配置是告警还会进行哈希去重。当前代码把来源、关键词和内容纳入哈希，并检查一小时窗口内是否已有相同告警。因此它实现的是一定范围的重复抑制，这个我感觉还是很不错的设计，这样去重；


[![ThreatDeck 的情报采集、告警与富集流程](/articles/pebble-hunting/threatdeck.svg)](/articles/pebble-hunting/threatdeck.svg)


一个值得注意的设计是：**内容没有命中关键词，也可以照样保存和提取指标。** “收集内容”“生成告警”“查询指标背景”是不同环节；上面这个流程图也展示了关键词命中并不需要等待富集完成，富集是一个单流程，默认情况下项目中是对收集到的全部做 enrich 操作，代码里也有对应选项：`enrich_only_alert_indicators` ；不过目前项目好像自动抓取的时候是使用默认处理配置，手动抓取才传入用户配置，实际还没测试

enrich 的来源主要是两个，CISA KEV(Known Exploited Vulnerabilities) + URLhaus，目前来说是覆盖比较有限，主要是**CVE 已知利用情况**和**恶意软件分发相关指标背景** ，后续有其他计划貌似还没更新

CISA KEV 本身就是**收集被报告在现实中利用的漏洞，并附上支持其判断的引用**，包括 VulnCheck KEV和 EU KEV Catalogue，也是如此，只是由不同的机构维护以及可能关注点会有所不同；相对比来说的 `CVE，NVD，OSV，EUVD` 等就是通用漏洞库
 
这个项目也就大概看到这里，后续如果有更新那就有更新，没有的话那就没有



---

## kraloveckey

### threat-intelligence-feeds

> 情报源的目录维护，github action 自动检查链接和更新情报源状态

目前来看其中的 csv 是还在每天更新，但是目前看项目第一位就是绿色状态链接过去实际早在**2025 年 1 月 3 日起就废弃了**，这里看了下项目中检查的脚本，对于 csv 这种地址是请求文件中的第一个字节来判断的，一旦有内容响应为 206 就直接更新状态为 `Active` 了，不会进行读取和解析正文

```html
################################################################
# abuse.ch SSLBL Botnet C2 IP Blacklist (CSV)                  #
# Last updated: 2025-01-03 11:30:00 UTC                        #
#                                                              #
# Terms Of Use: https://sslbl.abuse.ch/blacklist/              #
# For questions please contact sslbl [at] abuse.ch             #
################################################################
#
# Firstseen,DstIP,DstPort
#
# ATTENTION: This list has been deprecated on 2025-01-03
#

# 也就是在这里读取到第一个 # 之后就默认这个站点是正常的
```

除此之外还有一些是直接写死为 `Active` 跳过检查；

综上这个项目更适合充当**挑选情报源的参考目录**，后续如果要使用的话还需要自己再去查查实际状态，这个其实就可以引入 ai 相关，例如我目前正在推进的一个类似项目 (intel-shelf) 的基座 ，不过是云端 hermes 定时查看和更新检查脚本来达到整体更新，其实也有考虑过是否直接使用 hermes 去查看每个情报源，但是后续再看吧




## Bert-Jan
### Open-Source-Threat-Intel-Feeds

> 情报源目录＋把情报用于日志排查的示例，上面那个`kraloveckey` 项目也把它列为来源之一

这里的状态检查同样也是只看响应头或者备用的 `GET` `Stream=True` ，同样并未对正文进行读取解析，也会出现和上面那个项目一样的情况，网站本身可以访问，但是内容实际是提示已经停止使用，却在这里会被解析为绿色状态；那从这个点来看其实也是更适合充当**挑选情报源的参考目录**，后续如果要使用的话还需要自己再去查查实际状态

另一个可以关注的点则是 **KQL (Kusto Query Language)** 是一种用于大规模日志查询、分析和关联的查询语言，由微软开发；与 SQL 比较相似，但更侧重**日志分析、时序数据和安全事件调查**

作者有在 `README` 里写了一段查询，演示如何把下面两类数据放到一起，这里不做提及，直接看作者的另一个项目如下

### Hunting-Queries-Detection-Rules

> **一批可阅读、可修改的 KQL 查询，以及这些查询背后的检测和调查思路。** 使用者把查询放到自己的 Microsoft Defender／Sentinel 环境中运行，从已有数据里找线索

其实就是我构想的那种外界情报快速同步来查询自己收集到的内部日志情报等是否匹配来进行进一步的安全分析，不过对于没构建好的日志平台的企业来说只能是从这个项目中学习作者的**检测逻辑设计、ATT&CK 映射和日志关联方法**，以及整个仓库主要围绕微软安全生态中的 KQL 展开，所以这些规则不能直接复制到 Splunk、Elastic Security、Wazuh 等其他平台运行，需要根据平台的日志结构和查询语言进行转换，当然 ai 时代想转换一下应该问题不大

[![使用 KQL 和外部情报进行威胁狩猎](/articles/pebble-hunting/kql-hunting.svg)](/articles/pebble-hunting/kql-hunting.svg)

项目分的还是蛮多类和情景的，也覆盖了全流程差不多，真好啊，但是我大概率暂时用不着，以后有机会再详细看看

| 目录方向                     | 主要用途              | 典型问题                    |
| ------------------------ | ----------------- | ----------------------- |
| Defender For Endpoint    | 分析终端进程、文件、网络和系统活动 | 有没有异常进程启动、可疑外连？         |
| 身份与云相关目录                 | 分析登录、权限、应用和云资源活动  | 有没有异常登录或权限变化？           |
| Office 365               | 分析邮件与相关活动         | 有没有可疑附件、链接或钓鱼活动？        |
| Threat Hunting           | 按指标或行为假设主动排查      | 已知 C2、可疑命名管道是否出现过？      |
| Threat Hunting Cases     | 分步骤的狩猎案例          | 发现编码 PowerShell 后怎么继续查？ |
| Vulnerability Management | 关联设备、漏洞和外部利用信息    | 哪些设备应该优先修补？             |
| DFIR                     | 事件发生后的追查          | 可疑设备或账号还做了什么？           |
| Security Operations      | 检查安全运营情况          | 日志有没有延迟、告警情况怎样？         |

```text
读取情报
→ 按指标类型筛选、去重
→ 查最近一段时间的内部事件
→ 给命中事件附上情报标签和原始推文链接
```

示例中大量使用了 Defender 的 `DeviceNetworkEvents`、`DeviceProcessEvents` 等表，如果使用的是其他 **SIEM、ELK 或自建日志系统**，可以参考它的**检测思路**，但需要根据自己的日志字段和查询语言改写，那总的思路其实就在这里了，还是很好的

除了通过 IOC 匹配规则集合来产生告警之外，还可以查行为，对一些可疑行为进行监控，在上面的分类表里也有提到，例如浏览器是否启动了命令解释器、脚本工具或其他值得关注的程序，核心逻辑可以简化成：

```kql
DeviceProcessEvents
| where InitiatingProcessFileName in~ (Browsers)
| where FileName in~ (SuspiciousChildProcesses)
```

其中：
- `DeviceProcessEvents` 是进程事件。
- `InitiatingProcessFileName` 用来识别发起创建的进程。
- `FileName` 是被创建的进程名称。
- 两个名单分别包含浏览器，以及 PowerShell、cmd、mshta 等需要关注的程序。

原查询还检查了进程的原始文件名，并输出命令行、设备、账号等背景。

它的判断依据是**进程之间的关系**，而非某个已知恶意 IP。即使目标地址从未出现在情报库里，相关行为也可能被筛出来

还有一些其实就和我们看告警或者事件来判断是否误报类似的，**经验之谈**，例如少见的对外 IPv4 连接 -- 寻找一个少见进程，直接通过非常用端口连接公网地址，用历史活动建立基线，找出新变化 -- 比如看流量啊登录这些近几个月的规律，出现有未知变化的时候就需要注意一下；

那么总的来说这个项目以及其中的 `Threating Hunting case` 其实是相当于提供了一个**相对规范化的可用的有经验的威胁持续检测和调查步骤**，数据化版；其中主要是围绕有微软安全产品的企业，可以几乎直接使用，将其中的一些规则做一下内部实际情况适配即可

其中的 `Vulnerability Management` 也是相当于把我想做的在微软安全产品日志查询下实现了，我想做的项目中就包含把一份全球性目录转换成了与企业自己的资产有关的清单，KQL

项目的内容还是蛮多的，这次就只看到这里，后续大概率会更新


---

MISP To Be Continue...

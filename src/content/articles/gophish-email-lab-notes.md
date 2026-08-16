---
title: Gophishing & Email
description: GoPhish 与邮件服务器部署、联调过程的个人记录。
published: 2026-08-16
tags: [GoPhish, Email, Docker, DNS]
draft: false
---
> 此次 process 来源于A公司要在国家安全周内部进行钓鱼演练，需要自行在服务器搭建 gophish 和 邮件服务器，下面将围绕这个过程中遇到的问题以及学习到的知识做笔记记录，后续会对知识点进行 dots 化整理到 Altas 中，过程文章则是会考虑同步到 github.io 中去


> 在考虑是把前置基础知识写在前面还是直接在写的过程中一点点加上表述，感觉第二种会好一点，按着自己的思路来，本身就是一个思考和学习的过程，会更好

---
### 前言
之前有了解过钓鱼网站，也看过一些文章，但是没有自己部署过，对其中具体的流程和相关知识点也是一知半解的状态，此次用自己的云服务器部署也是用的开源的 `Gophish` 项目以及联动 `docker-mailserver` ，这里有在网上看到 `EwoMail` ，但是这个有点老了并且也很久没更新，其中一个依赖包好像只有 `centos 7` 还有，其他更新的 OS 都已经去除了，如果还需要搭建的话要么用老系统要么自己下载依赖源安装包；

那么回到最开始，钓鱼的形式，对企业来说最常见的自然就是邮件或者短信对个人的钓鱼，点击链接，填写信息，成功上钩，实际考虑短信比较难实行以及很多人可能就不看短信，以及邮件在企业中的更常用和 Gophish 联动等有点，我们也是会使用邮件钓鱼

我个人对邮件的相关知识就只是存在有邮件服务器，其余只有之前看过一篇讲邮件 eml 格式看邮件来源的文章，不过也几乎忘光了。下述我将先从 `Gophish` 搭建和基础使用开始，在其中穿插邮件知识，先用`qq`或者其他邮件跑通，理解 `Gophish` 然后再通过搭建 `mailserver` 来完整了解在此项目中需要学习的邮件相关知识，最终跟着一封钓鱼邮件一起从 `Gophish` 的演练启动 -->  `mailserver`  --> 公司邮件服务器 --> 个人邮箱

## Gophishing

### Gophish Build

这个的搭建其实官方文档里面也有很清晰的，不过官方文档中实际有点老，`docker` 部署方式没写，而且官方并无中文版本好像，至少我没找到。这里对 GoPhish User Guide 进行了中文翻译，并将原始 Markdown 文档适配为 VitePress 站点，保留英文原文、中文译文与本地图片资源。可直接在线阅读：[GoPhish User Guide 中文翻译](https://kiteab112.github.io/gophish-user-guide-zh/)。也可以从 [GitHub 仓库](https://github.com/kiteAB112/gophish-user-guide-zh) 拉取源码，在本地部署和浏览。
> 汉化过程中只有相对原版新增一些少量内容以及部分个人书写内容，也会在其中进行说明

在服务器上面无论是直接使用预构建的二进制文件安装还是 `docker` 安装部署都是很方便的，这里还是建议后者，毕竟方便嘛，只需要修改启动命令或者使用 `docker-compose`的话就改一下 `docker-compose.yml` 和 `config.json` 即可，下面为个人测试时候的配置，根据实际情况修改即可
#### Config.json
```json
{
    "admin_server": {
        "listen_url": "0.0.0.0:3333",
        "use_tls": true,
        "cert_path": "gophish_admin.crt",
        "key_path": "gophish_admin.key"
    },

    "phish_server": {
        "listen_url": "0.0.0.0:80",
        "use_tls": false,
        "cert_path": "example.crt",
        "key_path": "example.key"
    },

    "db_name": "sqlite3",
    "db_path": "gophish.db",
    "migrations_prefix": "db/db_",
    "contact_address": "",
    "logging": {
        "filename": "",
        "level": ""
    }
}
```
> 默认情况下，下载的 GoPhish 里通常已经带有默认的自签名管理证书；如果不想用它，也可以自己通过 OpenSSL 等工具重新生成。`config.json` 本身不负责生成证书，它只是指定 GoPhish 去哪里读取证书。

#### Docker-compose.yml
```yml
services:
  gophish:
    image: gophish/gophish:latest
    container_name: gopfish
    restart: unless-stopped
    ports:
      - "3000:3333"   # Admin UI (HTTPS；实际应通过安全组、VPN、固定出口或隧道限制访问)
      - "8080:80"     # Phishing listener (HTTP)
    volumes:
      - ./config.json:/opt/gophish/config.json:ro  # 配置文件挂载
      - gopfish-data:/opt/gophish/  # 持久化这个 volumes
volumes:
  gopfish-data:
```

> `3000:3333` 的写法会绑定到宿主机所有网卡；上面只是实验 Compose 示例，安全写法还是只监听本机，然后我们端口映射到本地访问

安装完成之后会打印临时管理员凭据用于登录，登录之后修改密码即可



### Documentation
> 类似的主要还是看官方文档和汉化文档即可，下面记录的主要是个人看的过程中一些思考

#### Groups

添加时候需要的字段：“First Name”、“Last Name”、“Email” 和 “Position”；实际只需要 Email 即可，其他几个字段则是**个性化邮件内容 + 辅助统计/识别目标**

例如可以再邮件模板里面写：
```html
您好，{{.FirstName}}：

根据您当前的岗位 {{.Position}}，请完成本次安全确认。
```

另外就是文档中说明**CSV 格式要有这些列名**，不一定代表每一行的 `First Name / Last Name / Position` 都必须有值。
这个实际对于分部门统计都是很有帮助的，以及制作个性化模板。


#### Templates

> 设计这里的时候其实就决定了我们判断对方有无打开邮件，有无点击链接，有无上传数据

其中的 `tracking images` 是邮件里的**追踪像素 / 追踪图片**，它通常不是一张用户能明显看到的图片，而是一个非常小、甚至接近不可见的远程图片，当收件人打开邮件时，如果邮件客户端允许加载远程图片，就会向 GoPhish 服务器请求这个图片。GoPhish 收到请求后，就能在 `Campaign` 中标记为 `Email Opened`

至于编写模板的话，可以直接让 ai 生成，或者自己找一个适配的邮件，查看邮件原文然后 `import` 上来


#### Attachment Tracking

> 先记一个判断边界：附件中的链接被访问、远程资源被加载，并不等同于可靠地证明“用户下载并打开了附件”。Office 的安全策略、网络状态和用户选择都可能阻止加载，因此这些事件更适合用于培训改进参考。

附件追踪，目的是追踪对方是否下载打开附件，并且 `Gophish` 做了适配性，写入一些模板变量会被替换为接收邮件者的唯一信息来确保后续追踪和统计，例如一个 `.docx` 文件，你想追踪“谁点了附件里的链接”，可以在 Word 里放一个超链接，目标写成 `{{.URL}}` ，然后把这个 `.docx` 上传到 `GoPhish` 的 `Email Template` ，发送 `Campaign` 时，`GoPhish` 会把这个变量替换成当前收件人的唯一 URL:

```html
原附件：
{{.URL}}

张三收到：
https://training.example.com/?rid=abc123

李四收到：
https://training.example.com/?rid=xyz789
```

这里就要提到一个我们的判断基准需求了，我们如果是要统计对方是否下载打开文件并且点击了文件里面的链接，那么可以这样直接加上 `{{.URL}}` 变量，但是如果需要看对方是否下载打开的话，推荐 `tracking URL / tracking image` ，把这个地址作为一个**远程资源的来源**，让对方打开的时候主动加载

这里提到了 `tracking url` ，和前面的 `tracking image` 其实是基本一样的思路，不过使用地点不同而已

> 模板里的 **Add Tracking Image** 是放在邮件 HTML 正文里的。收件人打开邮件后，只要邮件客户端加载了那张远程图片，GoPhish 就能根据该收件人的唯一标识记录一次“邮件打开”事件。
> 而 Attachment Tracking 里的 tracking URL，是把追踪地址放进附件内部，例如 Word、Excel、PowerPoint 的远程资源、链接或其他可触发网络请求的位置。用户打开附件后，如果 Office 加载了那个远程资源，GoPhish 就能收到对应请求


#### Landing-pages

落地页是用户点击收到的钓鱼链接后，GoPhish 返回的实际 HTML 页面。

落地页支持模板变量、提交数据采集，以及在用户提交数据后重定向至其他网站

> 官方文档这两句话就够了


#### Sending-profiles

| 字段                        | 作用                            |
| ------------------------- | ----------------------------- |
| Name                      | 这条发送配置在 GoPhish 里的名称，只是方便自己区分 |
| SMTP From                 | 收件人看到的发件人地址/显示信息              |
| Host                      | SMTP 邮件服务器地址和端口               |
| Username                  | 登录 SMTP 服务器的账号                |
| Password                  | SMTP 密码或授权码                   |
| Ignore Certificate Errors | 是否忽略 SMTP TLS 证书错误            |
|                           |                               |

例如某些企业邮件服务器允许：
```
Username:
security-training@example.com

SMTP From:
IT Security <notice@example.com>
```

是否允许这么做，取决于 SMTP 服务器的策略。

QQ 邮箱测试时，这两个通常最好保持一致，因为公共邮箱对发件人伪造限制比较严格

> 等后面到服务器章节会专门再讲


#### Campaigns

将上述综合起来，需要关注的就只是 **Launch Date** 和 **Send Emails By** 两个字段，默认情况下，GoPhish 会在启动后尽快发送全部邮件。若希望将邮件分散到一段时间内发送，可设置 **Send Emails By**；GoPhish 会在启动日期和该日期之间均匀安排邮件发送

#### Others

邮件报告这个其实是一个不错的方式，不过需要公司邮件系统那边开一个举报可疑邮件的邮箱地址才行，并且需要让我们的 `Gophish` 可以 `imap` 读取邮件，这样公司那边可能无法支持。

至于 `webhooks` 和 `API` 使用，那绝对是 ai 最喜欢的，并且后续我们自己搭建系统和自定义报告也是会很友好的，等后续用到了再补充

以及附件参考中的工具其实也蛮好的，都是社区提供的外部资源，可以试试的



## Email

上面在 `Sending-profiles` 中有邮件服务器字段，这里我们肯定是需要自己搭建的，到时候就直接和 `Gophish` 部署在同一个服务器上面就行，也不用两个服务器再去开端口啥的。

下面就是针对 `Sending-profiles` 展开的对邮件服务器的学习了解，基础逻辑我们一定是要知道的，要是连邮件服务器的存在都不知道的可以去补充一下知识

```
GoPhish
   │
   │  根据 Sending Profile
   │  找到 SMTP Server
   ▼
发件 SMTP 服务器
   │
   │  SMTP
   ▼
互联网 / 公司邮件系统
   │
   ▼
收件方邮件服务器
   │
   ▼
员工邮箱
```

### Protocol && Port

**SMTP (Simple Mail Transfer Protocol)**
- 25 : Server → Server
- 587/465: Client → Server

> 25 主要是服务器之间投递；465 和 587 主要是客户端向邮件服务器提交邮件，465 是隐式 TLS，587 通常是 STARTTLS。


**IMAP (Internet Message Access Protocol)**
- 143/993: 客户端与服务器同步和**查看**邮箱状态；143 可使用 STARTTLS，993 是隐式 TLS

**POP3 (Post Office Protocol Version 3)**
- 110/995: 也是收邮件，不过倾向于把邮件从服务器拿到本地，也就是**下载**
- 110/995: 110 可使用 STARTTLS，995 是隐式 TLS

**DNS**
- 53: 涉及到很多记录，是之前单单域名解析所未接触的

```
example.com
   │ MX
   ▼
mail.example.com
   │ A
   ▼
1.2.3.4
```

邮件里面会大量用到：
```
A -- IPv4
AAAA -- IPv6
MX -- 邮件服务器域名
TXT -- 邮件认证相关，包括 SPF，DKIM，DMARC等
PTR -- 反向 DNS，这对邮件服务器信誉非常重要
```

**LDAP：389 / LDAPS：636**
(Lightweight Directory Access Protocol)，目录服务



### A / MX / TXT / PTR
>这几个解析配置记录实际就可以让我们看到邮件服务器的很多点了，看完这个也就不会再有大的疑惑了

**MX**，表示“发给这个域名的邮件应投递到哪个目标主机名”；该主机名再通过 A/AAAA 解析到地址。
```
user@example.com
      ↓
example.com
      ↓ MX
mail.example.com
      ↓ A
1.2.3.4
      ↓
TCP 25
```

TXT Record 本质上就是：**DNS 中存放文本信息**，邮件系统后来大量借用了 TXT Record，用它发布 `SPF,DKIM，DMARC` 等

**解析记录：**

SPF：`example.com` 声明：IP `1.2.3.4` 被允许替我发送邮件，其他 IP 不允许
```
example.com TXT "v=spf1 ip4:1.2.3.4 -all"

example.com
      ↓
SPF TXT
      ↓
允许哪些服务器发邮件？
```

DKIM：查询公钥验证签名，邮件发布的时候会用私钥签名带上 signature
```
dkim._domainkey.example.com TXT v=DKIM1; k=rsa; p=MIIBIjANBgkqh...

收到邮件
   ↓
看到 DKIM-Signature
   ↓
查询 DNS
   ↓
取得 example.com 公钥
   ↓
验证签名
```

DMARC：身份认证有问题的时候怎么处理此邮件，取决于 P 的值
```
_dmarc.example.com TXT "v=DMARC1; p=quarantine"

none
↓
先观察/报告，不强制处理

quarantine
↓
可疑，倾向垃圾邮件/隔离

reject
↓
拒收
```

PTR 前面我们有讲过了，下面就只说一下**为什么邮件服务器特别看重 PTR**。收件方可能对发信 IP 做反向查询，看看该地址对应的主机名是否合理；正确配置的 PTR 是信誉加分项，缺失或错误的 PTR 则会拉低信誉，一些策略严格的邮件服务器可能拒收或降低此类邮件的优先级。

PTR 的配置通常需要找云服务商改，例如腾讯云。这里需要补充一点：PTR 不是单独的身份验证；更理想的情况是 PTR 指向邮件主机名后，该主机名的 A/AAAA 又能正向解析回同一个公网 IP。收件方会将这种正反向一致性与 HELO/EHLO、SPF、DKIM、DMARC 等一起用于判断可信度。云服务器的出站 25 端口常被管控，也正是为了降低垃圾邮件滥用带来的信誉风险。

![](/articles/gophish-email/IMG-20260816215734543.png)

图中的反向 DNS 可以填写 `mail.example.com`，同时要确认该主机名的 A/AAAA 正向解析会回到同一个公网 IP，才是完整的正反向一致性。

等到配置域名的 DNS 解析的时候可能会有下面的疑问：DKIM 这个记录，对方怎么知道要去访问的是 `dkim._domainkey.example.top` 呢？这里是**邮件里的 `DKIM-Signature` 头明确告诉它去哪里查**，邮件服务器发出一封邮件时，会加一个类似这样的邮件头
```
DKIM-Signature: v=1;
 d=example.top;
 s=dkim;
 ...
```
- `d=example.top`：签名域名
- `s=dkim`：selector，选择器
然后收件方会按照 `DKIM` 规则拼起来成为 `dkim._domainkey.example.top`
```
收件服务器
   │
   │ 读取邮件中的 DKIM-Signature
   ▼
d = example.top
s = dkim
   │
   ▼
拼接查询域名
   │
   ▼
dkim._domainkey.example.top
   │
   │ DNS TXT 查询
   ▼
v=DKIM1; k=rsa; p=xxxxxxx...
```

`_dmarc.example.com` 则是没有选择器，直接 `_dmarc` 拼接域名查询

总
```
                           example.com
                               │
             ┌─────────────────┼──────────────────┐
             │                 │                  │
             │                 │                  │
             ▼                 ▼                  ▼
            MX               SPF TXT           DMARC TXT
             │                 │                  │
             │                 │                  │
             │                 │                  │
             │                 │                  └── _dmarc.example.com
             │                 │                      TXT
             │                 │                      v=DMARC1;
             │                 │                      p=quarantine;
             │                 │
             │                 └── example.com
             │                     TXT
             │                     v=spf1 ip4:1.2.3.4 -all
             │
             ▼
     example.com MX 10
        mail.example.com
             │
             │
             ▼
      mail.example.com
             │
             │ A
             ▼
          1.2.3.4
             │
             │
             ├─────────────────────────────┐
             │                             │
             │                             │
             ▼                             ▼
         SMTP Server                    PTR / rDNS
     mail.example.com                    查询
       TCP 25/465/587                      │
             │                             ▼
             │                         1.2.3.4
             │                             │
             │                             │ PTR
             │                             ▼
             │                      mail.example.com
             │
             │
             │ 发送邮件时
             ▼
       DKIM 私钥签名
             │
             │
             ▼
      DKIM-Signature:
      d=example.com;
      s=dkim;
             │
             │
             ▼
收件服务器根据 d + s 查询 DNS
             │
             ▼
dkim._domainkey.example.com
             │
             │ TXT
             ▼
v=DKIM1; k=rsa;
p=<DKIM 公钥>
```

![](/articles/gophish-email/IMG-20260816174917533.png)

**一图胜千言**


## Con
> 基础了解到这里，链接起来 Gophish 和我们自己的邮件服务器就很简单了，

使用 `docker-mailserver` 部署演练专用邮件服务，并创建两个本地账户：  
- `awareness@example.top`（GoPhish 发件账号）  
- `test@example.top`（内部测试收件账号）

GoPhish 与邮件服务器加入同一个 Docker 网络。Sending Profile 填写 `mailserver:587`、发件账号和对应密码，开启 TLS；暂时忽略自签名证书错误只适用于受限内网测试，取得受信任证书后应恢复严格校验。

在 `GoPhish` 的 `Users & Groups` 中仅加入 `test@example.top`，创建最小测试 Campaign 后发送。若后台显示 Sent，且邮件服务日志记录本地投递成功，即证明 `GoPhish → SMTP → 本地邮箱链路正常`。

此阶段不收集真实密码，落地页仅记录提交事件；外部投递验证需在云端出站 25 解封及 DNS 邮件认证记录生效后，以单一外部测试收件人进行。

![](/articles/gophish-email/IMG-20260816215758270.png)

![](/articles/gophish-email/IMG-20260816191600307.png)


我的 `docker` 网络配置如下：
```
Docker 网络：gopfish_default（bridge，172.19.0.0/16）
        │
        ├─ gopfish    172.19.0.2
        └─ mailserver 172.19.0.3，别名 mailserver
                         └─ SMTP Submission :587
```
前面创建 `GoPhish` 的`Compose` 没有显式定义网络，因此 Docker Compose 自动创建了 `gopfish_default`。它是一个 Docker `bridge` 网络，类似该服务器内的一台小型虚拟交换机

> 这里的 `172.x.x.x` 只是当时容器的运行快照。容器重建后 IP 可能变化，实际 `Gophish` 配置应使用 Docker 内置 DNS 的服务名 `mailserver`，不要写死容器 IP。

在邮件服务的配置中写上：
```yml
networks:
  gopfish_default:
    external: true # 不新建自己的网络，而是加入已存在的 gopfish_default
```

这里是因为 `docker-mailserver` 没有 UI 界面，在命令行中查看主题和内容；需要配置网页客户端的话可以部署一个 `Roundcube Webmail` 联动。虽然技术上可以映射端口，但不建议将 Webmail 公开暴露；更推荐只绑定服务器回环地址，再通过本机 SSH 端口转发访问 `127.0.0.1:xxx`。

![](/articles/gophish-email/IMG-20260816215822922.png)

![](/articles/gophish-email/IMG-20260816193652672.png)


后续外发到 QQ、Gmail 等仍要等腾讯云出站 25、PTR、SPF/DKIM/DMARC 生效。 


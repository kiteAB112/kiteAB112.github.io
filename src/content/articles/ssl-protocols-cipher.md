---
title: SSL Protocols&Cipher
description: 从漏扫报告中的旧版 TLS 和弱加密套件告警出发，了解协议协商、安全性及 Nginx 配置与 Windows 7 兼容性。
published: 2026-10-11
updated: 2026-10-11
tags: [Security, TLS, Nginx]
draft: false
featured: false
kind: article
discussionId: articles/ssl-protocols-cipher
---

来源是漏扫中的漏洞报告中有提到一些漏洞是通信加密允许使用过期的 TLS1.0,1.1 以及不安全的套件，下面简述一下为什么不安全，不在此深入加密算法与握手流程

---

SSL Protocols（SSL/TLS 协议） 和 SSL Ciphers（SSL/TLS 加密套件） 是评估 HTTPS、VPN、邮件服务器等加密通信安全性时非常重要的两个指标，这两个是在 TLS Handshake（握手过程）中**客户端和服务端协商选择**的，下面结合 TLS 1.3 的简化握手流程简单说明如何协商

### 阶段 1：ClientHello——客户端提出协商能力

浏览器会给服务器发送 ClientHello，包含以下信息，这里省略了 TLS 1.2 的套件以及其他字段，只展示本次协商 TLS 1.3 相关的部分

```text
Supported Versions:
    TLS 1.3
    TLS 1.2

Cipher Suites:
    TLS_AES_128_GCM_SHA256
    TLS_AES_256_GCM_SHA384
    TLS_CHACHA20_POLY1305_SHA256

Supported Groups:
    X25519
    secp256r1

Key Share:
    Group: X25519
    Public Key: ...
```


### 阶段 2：ServerHello——服务器确定参数

服务器收到 ClientHello 后，从双方兼容的选项中确定具体参数

```text
Selected Version:
    TLS 1.3

Cipher Suite:
    TLS_AES_128_GCM_SHA256

Key Share:
    Group: X25519
    Public Key: ...
```

此时客户端和服务端拥有双方的公钥份额，并各自持有自己的临时私钥

到这里就够了，服务器已经决定了**两个参数**，这里需要提及一个点是加密套件有对应的协议版本适用范围，**TLS 1.3 使用独立的套件集合**，不能直接沿用 TLS 1.2 的套件，和协议以及加密设计有关。一般来说一个 TLS 协议发布之后可能第一时间没有所有加密套件，可以通过后续 RFC 扩展，但新套件必须符合对应协议版本的机制和要求，实际能选择哪些还取决于客户端和服务端的实现与配置

### 协议版本与可用加密套件

|协议版本|典型可用加密算法/套件族|安全评价|
|---|---|---|
|SSL 2.0|RC2、RC4、DES 等早期套件|禁用|
|SSL 3.0|RC4、DES、3DES、部分 AES-CBC 扩展套件|禁用|
|TLS 1.0|RC4、3DES、AES-CBC 等|禁用|
|TLS 1.1|3DES、AES-CBC 等，支持部分后续扩展套件|禁用|
|TLS 1.2|AES-CBC、AES-GCM、AES-CCM、ChaCha20-Poly1305 等|仅保留强套件|
|TLS 1.3|AES-GCM、ChaCha20-Poly1305、AES-CCM|优先推荐|

一个 TLS Cipher Suite（加密套件）实际上是**多个密码学算法的组合**，每个算法负责不同的安全任务，举例在 TLS1.2 中是有四个部分 `密钥交换 + 身份认证 + 对称加密 + 哈希机制` ，举例：`TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256`

|组成|算法|负责什么|
|---|---|---|
|① 密钥交换|ECDHE|双方安全协商共享秘密|
|② 身份认证|RSA|证明服务器身份|
|③ 对称加密|AES-128-GCM|加密通信内容并校验完整性|
|④ 哈希机制|SHA-256|TLS 1.2 握手中的 PRF 等用途|

所以这里可以把 TLS 1.2 套件拆成这四个部分来理解，但实际协商时选择的是预定义的整个套件，不能把四个部分任意组合。TLS 1.3 则有所不同，像前面的 `TLS_AES_128_GCM_SHA256` 只指定了 AEAD 算法和 HKDF 使用的哈希算法，密钥交换与签名算法是独立协商的，不再包含在套件名称中，我们这里主要关心协议版本和套件就行

### 安全性总览

#### TLS 1.0  1.1

其中 TLS 1.0 协议设计留下的 CBC 安全问题，可以进行 BEAST（Browser Exploit Against SSL/TLS） 攻击。TLS 1.1 对此问题进行了修复，但是该协议仍然需要淘汰，主要是以下原因：缺乏现代 AEAD 加密套件支持、历史握手依赖 SHA-1 等过时机制。

结论：TLS 1.0 / 1.1 不是简单因为某个加密套件弱，而是协议能力、历史密码学机制和维护风险**整体已经不适合现代环境**。


#### TLS 1.2

TLS 1.2 的核心变化之一，是引入了更灵活、更现代的密码学机制。它支持强套件，也保留了历史套件。这使它成为典型的“**安全性高度依赖配置**”的协议，下面为推荐配置

|维度|不推荐|推荐|
|---|---|---|
|密钥交换|静态 RSA、静态 DH|ECDHE|
|对称加密|RC4、3DES、旧式 CBC|AES-GCM、ChaCha20-Poly1305|
|认证|弱证书、错误验证|正确验证的 RSA/ECDSA 证书|
|密钥参数|弱 DH 组、过短密钥|合理安全强度的参数|

结论：TLS 1.2 并不是依靠修补一个个漏洞才勉强安全，而是其协议本身已经**具备现代安全机制**，只不过仍允许使用一些应该淘汰的历史机制

#### TLS 1.3

TLS 1.3 重新设计了部分握手和密码学机制，以及移除了大量不安全的历史算法和机制，这是相对 TLS 1.2 的一个提升的安全托底

|历史机制|TLS 1.2|TLS 1.3|安全意义|
|---|---|---|---|
|静态 RSA 密钥交换|支持|移除|基于证书的完整握手使用 (EC)DHE，提供前向保密|
|CBC 加密套件|支持|移除|减少填充预言机等风险|
|RC4、3DES|历史实现支持|移除|淘汰弱密码算法|
|非 AEAD 套件|支持|移除|统一认证加密机制|
|TLS 层压缩|支持|移除|缩小压缩侧信道攻击面|
|重协商|支持|移除|简化状态机与握手逻辑|
|SHA-1 握手签名|历史兼容支持|禁止用于 TLS 1.3 握手签名|避免旧式哈希签名机制|

即使这样，TLS 1.3 还是会有安全风险，例如 0-RTT 重放风险，以及如果对于会话恢复方式选择配置为 PSK-only 的话，恢复会话时，不会重新进行一次 ECDHE 密钥交换，因此新会话的安全性仍依赖之前保存的 PSK（预共享密钥）。


结论：TLS 1.3 降低了协议层的历史攻击面和错误配置空间，但**不能替代安全实现、正确的身份认证与可靠的密钥管理**

### 举例配置修改

以 Linux + Nginx HTTPS 服务为例，假设你的服务器最初存在这些问题

```nginx
ssl_protocols TLSv1 TLSv1.1 TLSv1.2;

# 这里的配置是使用了 OpenSSL 的 Cipher String（密码套件选择表达式），通过分类和过滤规则指定允许的套件，比较方便，但这个范围仍可能包含不推荐的套件
ssl_ciphers 'HIGH:MEDIUM:!aNULL';
```

这里需要注意，`ssl_ciphers` 只配置 TLS 1.2 及更早版本的套件，不控制 TLS 1.3 的套件。对于多数现代 HTTPS 系统，使用 TLS 库维护的安全 TLS 1.3 默认套件通常已经足够，不必刻意收窄

推荐修改配置文件为，下面是配置示例，暂未进行实际验证。这里假设使用 Nginx 1.23.2 或更新版本，以及支持 TLS 1.3 的 OpenSSL 1.1.1 或更新版本；这是功能前提，实际使用还应选择仍受维护的版本。共享会话缓存从 Nginx 1.23.2 起可以自动生成、保存并定期轮换会话票据密钥，前提是没有显式配置 `ssl_session_ticket_key`，不能只靠 `ssl_session_tickets on` 就认为票据密钥已经受到妥善管理

```nginx
server {
    listen 443 ssl;
    server_name api.example.com;

    # 1. 只允许 TLS 1.2 和 TLS 1.3
    ssl_protocols TLSv1.2 TLSv1.3;

    # 2. TLS 1.2 强套件
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305';

    # 3. TLS 1.2 优先使用服务器的套件顺序
    ssl_prefer_server_ciphers on;

    # 4. 配置证书与私钥
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    # 5. 禁用 TLS 1.3 Early Data
    ssl_early_data off;

    # 6. 启用会话恢复，票据密钥轮换依赖上面说明的版本与配置
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets on;

    location / {
        proxy_pass http://127.0.0.1:8080;
    }
}
```


#### win 7

现在企业中如果还遗留有 win 7 ，由于历史因素对足够安全的协议并不一定支持，而且 Windows 7 支持 TLS 1.2，却可能连接失败，如果没有共同支持的 Cipher Suite，也会握手失败。

下面是 Windows 7 系统 Schannel 的协议支持与历史默认状态，不代表所有运行在 win 7 上的软件；使用自带 TLS 库的应用还要看自己的实现，系统补丁与配置也可能改变默认状态

|协议版本|Windows 7 系统 Schannel 支持情况|历史默认状态|
|---|---|---|
|SSL 3.0|支持|历史默认启用|
|TLS 1.0|支持|默认启用|
|TLS 1.1|支持|默认关闭|
|TLS 1.2|支持|默认关闭|
|TLS 1.3|系统 Schannel 不支持|无法通过注册表开启|

所以兼容性不仅看协议版本，还要看密码套件、证书类型及应用实现

对于 win 7 如何配置支持 TLS 1.2 的详细步骤，微软提供了相应的 Schannel 和 WinHTTP 配置方法，不做赘述，同时也不推荐企业留着 win 7

### 检测项目

有条件推荐 [testssl.sh](https://github.com/testssl/testssl.sh) 项目，可以直接检查服务端支持的协议版本、加密套件以及一些已知的 TLS 安全问题，不需要自己再写一个检测工具。这里有 Linux、WSL 或者 Docker 环境都可以用，如果本机已经有 Docker 的话直接用官方镜像就比较方便

```powershell
# 拉取 3.2 稳定版镜像
docker pull ghcr.io/testssl/testssl.sh:3.2

# example.com:443 替换成自己的或已获授权的服务地址
docker run --rm -it ghcr.io/testssl/testssl.sh:3.2 example.com:443
```

它不只是看能不能建立 HTTPS 连接，还会检查下面这些内容

- 协议版本：服务端是否还允许 SSL 2.0/3.0、TLS 1.0/1.1，以及是否支持 TLS 1.2/1.3
- 加密套件：支持哪些套件，是否存在弱加密、匿名认证，以及服务端的套件选择偏好
- 密钥交换：是否支持前向保密，DH 等密钥交换参数是否存在问题
- 证书：有效期、域名匹配、证书链、签名算法和密钥强度等
- 已知问题：例如 Heartbleed、POODLE、ROBOT 等，同时也会检查压缩、重协商和会话恢复等配置
- 其他：部分客户端的握手兼容性，以及 HTTPS 服务的 HSTS 等响应头，具体检查内容还要看目标服务与运行参数

项目也支持 HTML、JSON、CSV 等输出，需要留存报告或者后续处理的时候可以再用；Docker 中输出的报告默认在容器里，如果要保留到本机需要挂载目录，避免容器退出删除之后报告也没了

![testssl.sh 检测结果示例](/articles/ssl-protocols-cipher/IMG-20261011161444843.png)

最后如果只能使用原生 Windows，不方便使用 Docker、WSL 等环境的话，可以用 [SSLyze](https://github.com/nabla-c0d3/sslyze)，支持在 Windows 下通过 Python 安装，也能检测协议、套件、证书及部分已知 TLS 问题，直接作为命令行工具使用就行，不需要做二次开发。


最后来放一个图作为总结

![SSL/TLS 协议版本与加密套件总结](/articles/ssl-protocols-cipher/IMG-20261011152053565.png)
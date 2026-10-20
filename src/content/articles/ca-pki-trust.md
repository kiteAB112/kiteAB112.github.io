---
title: CA & PKI Trust
description: 从申请 HTTPS 证书到浏览器验证证书链，梳理 X.509、CA 与 PKI 信任体系的起点。
published: 2026-10-20
tags: [TLS, PKI, Security]
draft: false
featured: false
kind: article
discussionId: articles/ca-pki-trust
---

> 之前了解 SSL/TLS 流程时，只简单接触过 CA；给电脑导入证书的时候，也没细想背后的信任关系。这次刚好看到[这篇文章](https://www.secrss.com/articles/94843)，顺带稍微理一理。


### **X.509 证书**
对一个网站的证书来说，我们通常讨论的是 X.509 证书，其内容可以简化为

| 项目         | 备注                |
| ---------- | ----------------- |
| Subject    | 证书主体的身份信息         |
| SAN        | 证书允许匹配的域名或 IP 等标识 |
| Public Key | 主体对应的公钥           |
| Issuer     | 签发者               |
| Validity   | 证书生效和过期时间         |
| Extensions | 用途限制、CA 权限等       |
| Signature  | 签发 CA 对证书内容的数字签名  |



### **先来申请一个 HTTPS 证书**

先来生成一对公钥和私钥，后续公钥需要和身份信息绑定，由 CA 签名；然后创建 CSR（Certificate Signing Request，证书签名请求）。这个请求相当于在对 CA 说：“我是 `www.example-company.com`，这是我要使用的公钥，请 CA 审核我的申请，给我签发一张数字证书。”

```bash
# 生成私钥
openssl genpkey -algorithm RSA \
  -pkeyopt rsa_keygen_bits:3072 \
  -out server.key

# 生成 CSR
openssl req -new \
  -key server.key \
  -out server.csr \
  -subj "/CN=www.example-company.com" \
  -addext "subjectAltName=DNS:www.example-company.com"
```

可以向 [Let's Encrypt](https://letsencrypt.org/) 申请证书。上面的命令主要是把密钥和 CSR 的关系拆开来看；实际使用 Let's Encrypt 时，通常由 Certbot 等 ACME 客户端自动完成申请、域名验证和续期。

对于公开信任的域名 TLS 证书，CA 至少要**验证你对申请域名的控制权**。以 Let's Encrypt 使用的 ACME 验证为例，常见方式包括：

- `DNS-01`：要求你在 DNS 中添加指定 TXT 记录。
- `HTTP-01`：要求你在网站指定路径提供验证内容。
- `TLS-ALPN-01`：通过 443 端口上的特定 TLS 握手和验证证书证明域名控制权。

CA 完成审核后，**通过其受控的签发密钥为网站证书签名**。最后我们会拿到网站证书和中间 CA 证书，这里分别用 `server.crt`、`intermediate.crt` 作为示例文件名，实际名称取决于所用工具。后续一般会把它们组合成 `fullchain.pem`，**网站证书在前，中间 CA 证书随后**；ACME 客户端通常也会直接生成这个文件。然后在 Nginx 中配置如下：

```nginx
server {
    listen 443 ssl;
    server_name www.example-company.com;

    ssl_certificate /etc/nginx/fullchain.pem;
    ssl_certificate_key /etc/nginx/server.key;
}
```


### 浏览器如何验证证书

背景：使用 Chrome 访问 `www.example-company.com`，网站证书由 `Intermediate CA-B` 签发，`Intermediate CA-B` 由 `Root CA-A` 签发，`Root CA-A` 已经存在于浏览器接受的信任存储中。

计算机会收到下面两张证书
```
网站证书：www.example-company.com
  Subject: www.example-company.com
  Issuer: Intermediate CA-B
  Public Key: 网站公钥
  Signature: 中间CA-B的私钥生成

中间CA证书：
  Subject: Intermediate CA-B
  Issuer: Root CA-A
  Public Key: 中间CA-B的公钥
  Signature: 根CA-A的私钥生成
```

并且本身信任存储中已经有了
```
根CA证书：
  Subject: Root CA-A
  Issuer: Root CA-A
  Public Key: 根CA-A的公钥
  Signature: 通常由根CA自己签名
```

顺着这条链来看，先用中间 CA-B 的公钥验证网站证书的签名。验证成功，说明**网站证书内容由对应的签发密钥签署且未被篡改**，但还不知道 **B 是否可信**；再用根 CA-A 的公钥验证 B 的证书签名，并检查 B 是否被授权作为 CA 签发相应证书。这样，我们就把网站证书逐级关联到了**本地已经信任的根 CA**。

这里先只看证书链的签名与信任关系。浏览器实际还要检查访问的域名是否与证书 SAN 匹配、证书是否在有效期内、用途是否符合要求等；吊销状态和其他安全策略也会影响最终是否接受。

### PKI 信任体系的起点

在这个例子里，Root CA 不需要再往上找了，因为它已经是我们接受的信任锚。浏览器或操作系统预先维护了一个根证书信任存储，证书链最终关联到这里。

**根证书的自签名本身并不能让它获得信任**。这里之所以信任它，是因为它已经作为信任锚，被浏览器或操作系统接受了。

Let's Encrypt 的根 CA 之一叫：`ISRG Root X1`，其中 ISRG 是 Internet Security Research Group（互联网安全研究组织），也就是 Let's Encrypt 背后的非营利运营组织

网站证书通常由 Intermediate CA（中间 CA）签发，而不是由 Root CA（根 CA）直接签发。这样的分层可以更好地保护根 CA 私钥，根 CA 的签发系统往往离线运行或受到严格隔离和控制。

Root CA 并不是由一个全球最高级 CA 统一授权的，**在互联网 HTTPS 场景下，Root CA 最终是否可信，取决于浏览器厂商、操作系统厂商以及它们维护的根证书信任计划**。


### 想要成为 CA 吗

如果想让自己运营的 CA 获得主流浏览器的默认信任，除了建立符合要求的运营体系，还需要分别申请加入相关根证书计划，并通过各自的审核。满足要求和提交申请，并不代表一定会被收录。下面这些只是其中一些主要要求：

- CA 密钥和 HSM 的安全管理。
- 证书签发、审核、吊销和事件响应机制。
- CP/CPS（证书策略与证书实践声明）等公开文档。
- 符合 CA/Browser Forum 等相关行业要求。
- 接受 WebTrust 或适用的 ETSI 等审计。
- 向浏览器或操作系统的根证书计划提交信任收录申请。

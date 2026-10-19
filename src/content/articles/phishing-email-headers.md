---
title: Phishing & Email Headers
description: 从邮件头中的身份认证、投递路径和回复地址，结合几个示例理解钓鱼邮件排查。
published: 2026-10-19
tags: [Email, Phishing, Security]
draft: false
featured: false
kind: article
discussionId: articles/phishing-email-headers
---

> 关于如何通过邮件头来定位判断是否是钓鱼邮件相关

## Introduction

之前有在 [Gophishing & Email](/articles/gophish-email-lab-notes/) 这个文章中提到邮件中会涉及到的一些认证字段，以及结合 Gophishing 配置书写了邮件，下面就简单写一下查看邮件的时候需要查看哪些内容

| 优先级 | 字段                       | 重点检测内容                |
| --- | ------------------------ | --------------------- |
| P0  | `Authentication-Results` | SPF、DKIM、DMARC 是否通过   |
| P0  | `From`、`Return-Path`     | 显示发件人与实际退信域是否一致       |
| P0  | `Received`               | 邮件从哪些服务器经过，源 IP 是否异常  |
| P1  | `Reply-To`               | 回复地址是否被替换成攻击者邮箱       |
| P1  | `Received-SPF`           | SPF 验证结果、验证时使用的域名和 IP |
| P1  | `DKIM-Signature`         | 签名域、选择器、签名覆盖的头字段      |

实际邮件我们可以看到很多格式，包括 eml，msg，txt，htlm 等等，**其中除了 eml 其他的几乎都是被剔除了不需要用户看到的格式**，当然我们这里查看主要是看邮件头，可以直接查看的话也不用考虑这些格式问题

## Email Header Examples

### Legitimate Email

```
From: "Alice" <alice@company.example>
To: bob@partner.example
Return-Path: <alice@company.example>
Reply-To: alice@company.example
Date: Mon, 19 Oct 2026 09:30:00 +0800
Subject: Project Update

Received: from mail.company.example
    (mail.company.example [192.0.2.10])
    by mx.partner.example with ESMTPS
    id A12345;
    Mon, 19 Oct 2026 09:30:05 +0800

Authentication-Results: mx.partner.example;
    spf=pass smtp.mailfrom=company.example;
    dkim=pass header.d=company.example;
    dmarc=pass header.from=company.example;

DKIM-Signature: v=1; a=rsa-sha256;
    d=company.example; s=mail2026;
    h=from:to:subject:date;
    bh=SIMULATED_BODY_HASH;
    b=SIMULATED_SIGNATURE;

Message-ID: <202610190930@company.example>
```

认证相关全部通过，**发送 ip 获得授权以及签名域与 From 域一致**，Return-Path、Reply-To、From 一致

### Sender Spoofing

```
From: "CEO" <ceo@company.example>
To: finance@company.example
Return-Path: <payment@attacker.example>
Reply-To: payment@attacker.example
Subject: Urgent Wire Transfer

Received: from vps.attacker.example
    (vps.attacker.example [198.51.100.88])
    by mx.company.example with ESMTP;
    Mon, 19 Oct 2026 10:10:00 +0800

Authentication-Results: mx.company.example;
    spf=fail smtp.mailfrom=attacker.example;
    dkim=none;
    dmarc=fail header.from=company.example;

Received-SPF: fail
    (mx.company.example: domain of attacker.example
    does not designate 198.51.100.88 as permitted sender)
    client-ip=198.51.100.88;

Message-ID: <98172@attacker.example>
```
From 中是 `company.example` 但是 `Return-Path、Reply-To`  都是 `attacker.example`

以及去访问 ip 查找 spf 发现和 From 不一致，Dkim 也是 None，也是直接导致 `DMARC` 失败


### Lookalike Domain with SPF, DKIM, and DMARC Passing

> 这个也是我们之前写钓鱼演练的时候提到过的形式

```text
From: "Microsoft 365 Security"
    <alert@microsoft-security.example>
To: employee@company.example
Return-Path: <alert@microsoft-security.example>
Reply-To: support@microsoft-security.example
Subject: Your Microsoft 365 Account Will Expire

Received: from smtp.microsoft-security.example
    (smtp.microsoft-security.example [203.0.113.77])
    by mx.company.example with ESMTPS;
    Mon, 19 Oct 2026 11:00:00 +0800

Authentication-Results: mx.company.example;
    spf=pass smtp.mailfrom=microsoft-security.example;
    dkim=pass header.d=microsoft-security.example;
    dmarc=pass header.from=microsoft-security.example;

Message-ID: <notice-9981@microsoft-security.example>
```

SPF、DKIM、DMARC 全部通过；From、Return-Path、Reply-To 都一致；但域名是 `microsoft-security.example`，并非微软官方域名

这个只能说明这个域名被发件人完全掌控，这时候就看看域名是否是官方的，以及有些地方可以查看信誉分也可以结合看看


### Legitimate Forwarding with SPF Failure

```
From: "Alice" <alice@sender.example>
To: bob@receiver.example
Return-Path: <alice@sender.example>
Subject: Meeting Notes

Received: from forwarder.example
    (forwarder.example [203.0.113.50])
    by mx.receiver.example with ESMTPS;
    Mon, 19 Oct 2026 13:00:00 +0800

Received: from smtp.sender.example
    (smtp.sender.example [192.0.2.30])
    by forwarder.example with ESMTPS;
    Mon, 19 Oct 2026 12:59:30 +0800

Authentication-Results: mx.receiver.example;
    spf=fail smtp.mailfrom=sender.example;
    dkim=pass header.d=sender.example;
    dmarc=pass header.from=sender.example;

Message-ID: <meeting-1001@sender.example>
```

邮件原本来自 `smtp.sender.example`，中途经过 `forwarder.example` 转发，最终接收服务器检查的是转发服务器 IP，转发服务器不在原始域名 SPF 授权范围内，因此 SPF fail，DKIM 签名仍然有效且与 From 域对齐，因此 DMARC pass


### High-Confidence Phishing in Microsoft 365

```

From: "IT Support" <support@it-helpdesk.example>
To: employee@company.example
Return-Path: <bounce@it-helpdesk.example>
Subject: Password Reset Required

Received: from smtp.it-helpdesk.example
    (smtp.it-helpdesk.example [198.51.100.99])
    by mx.company.example with ESMTPS;
    Mon, 19 Oct 2026 15:00:00 +0800

Authentication-Results: mx.company.example;
    spf=pass smtp.mailfrom=it-helpdesk.example;
    dkim=pass header.d=it-helpdesk.example;
    dmarc=pass header.from=it-helpdesk.example;

X-Forefront-Antispam-Report:
    CIP:198.51.100.99;
    CTRY:US;
    SCL:9;
    SFV:SPM;
    CAT:HPHISH;

X-MS-Exchange-Organization-SCL: 9

Message-ID: <reset-9901@it-helpdesk.example>
```

SPF、DKIM、DMARC 全部通过，`CIP` 表示微软检测到的连接 IP，`SCL:9` 表示很高的垃圾邮件风险评分，`SFV:SPM` 表示被垃圾邮件过滤机制标记，`CAT:HPHISH` 表示高置信度钓鱼分类

尽管域名认证正常，微软邮件安全检测结果仍提示高风险。应结合 Defender 的邮件实体信息、URL 分析和威胁情报进行处置


## Summary

1. 身份真实性： SPF、DKIM、DMARC、域名对齐，判断发送身份是否经过有效认证。
2. 路径可信度： Received、发送 IP、PTR、HELO、邮件中继，判断真实投递路径及基础设施异常。
3. 业务合理性： From、Reply-To、Return-Path、主题、邮件内容，判断是否存在冒充或社工诱导。
4. 安全产品证据： Microsoft Defender、Exchange、邮件网关日志、URL 沙箱、账号登录日志，判断是否存在其他恶意迹象。



对于实际日常快速排查可以直接用微软官方开源工具 https://mha.azurewebsites.net/ ，这个是在线网页版，可以直接粘贴原始邮件头进行解析；github上也有对应的项目
如下面这样，会解析邮件传输路径、邮件身份认证结果以及各个邮件头字段
![Message Header Analyzer 的身份认证结果](/articles/phishing-email-headers/IMG-20261019190842387.png)

![Message Header Analyzer 的邮件传输路径和邮件头字段](/articles/phishing-email-headers/IMG-20261019191539835.png)

虽然只是把邮件头信息提取出来，但看起来也会好很多
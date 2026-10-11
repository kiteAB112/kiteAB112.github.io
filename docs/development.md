# Wuhulahu2 Technical Home

面向技术同行的个人博客，托管于 https://kiteAB112.github.io 。以技术文章和项目实践为主；未来个人服务器网站承载生活记录、部分技术内容与导航，两站独立定位。

## 技术与设计

Astro + Markdown，基于 AstroPaper v6.1.0 定制。保留单栏、文字列表、明暗配色，使用 Google Sans Code 与中文系统字体回退。Pagefind 提供全文搜索，RSS 和 sitemap 自动生成。

上游为 satnaing/astro-paper，参考提交 `35cfa7fbe0b897306d27670d3819e55d5205f3dd`，MIT 许可见 `licenses/AstroPaper.txt`。后续升级需审阅差异，不能直接覆盖定制源码。

## 目录

```text
src/
  config/        站点信息与 giscus 配置
  content/
    articles/    技术文章（kind 可为 article、experiment、note）
    projects/    个人项目
    fieldnotes/  系列记录，图片与正文放在一起
  data/stars.ts  GitHub 收藏分类及七篇精选说明
  pages/         各栏目独立路由、RSS、标签、搜索
  layouts/       页面外壳、列表布局、正文布局
  components/    导航、列表、评论等共享组件
  assets/        使用中的主题图标
  scripts/       主题、正文交互
  styles/        配色、排版与全局样式
  utils/         内容筛选、排序和 URL 工具
public/articles/ 现有文章的静态资源
```

`/articles/` 和 `/tags/` 只使用已发布技术文章；标签随文章自动生成，没有预设词库。项目和 Fieldnotes 标签只显示文字。删除的示例文章与空 Labs、Notes 栏目不再保留独立入口。

`/rss.xml` 提供已发布技术文章的全文，不包含项目、Stars 或 Fieldnotes。正文使用 Astro 渲染后的 Markdown，链接和图片地址转换为绝对地址；保留简介供列表展示。订阅简介单独使用 `src/config/site.ts` 中的 `feedDescription`。

`/projects/` 展示个人项目；`/stars/` 展示收藏分类和精选说明。现存正文地址保持不变。`/now/` 保留为带日期的手动状态记录，`/about/` 介绍作者与站点。

## 本地开发

建议 Node.js 24 LTS，最低 22.19。GitHub Actions 使用 Node.js 22 最新版。

```powershell
npm install
npm run dev
npm run check
npm run build
npm run preview
```

默认 http://localhost:4321/ 。全文搜索需要构建后的 preview。指定预览端口可用：

```powershell
node node_modules/astro/bin/astro.mjs preview --host 127.0.0.1 --port 4322
```

## 写作

元数据由 `src/content.config.ts` 校验，技术文章示例：

```yaml
---
title: 标题
description: 一句话说明问题或结论。
published: 2026-10-10
tags: [Security]
draft: true
featured: false
kind: article
discussionId: articles/stable-article-id
---
```

`updated` 可选，实际修订时填写；日期按 Asia/Shanghai 展示。`featured` 仅用于技术文章，设为 true 后进入首页精选。已有 `discussionId` 应保持稳定，改标题或文件名时也不要改，以免评论关联改变。

草稿不进入正式页面、搜索、RSS 或标签。Fieldnotes 草稿仅在 dev 可见；其图片路由使用相同可见性规则，无需构建后再删除资源。

## Fieldnotes 手动发布

继续在 `H:\Projects\ZhihuCLI\Weekly/` 写作，选定一期手动复制到 `src/content/fieldnotes/`。两份正文独立维护，不自动同步，暂不接入 Article 和 Thought。

例如 `fieldnotes-001.md` 的图片放在同级 `fieldnotes-001.assets/`，引用地址仍为 `/fieldnotes/fieldnotes-001/图片文件名.png`。各期资源独立，不共用图片目录。

保留 `issue`、`week_start`、`week_end`。第一期暂按记录结束日期排序，正式发布时再确认 `published`；未确认发布前保持 `draft: true`。

## giscus

评论组件已接入用户提供的真实仓库与 Announcements 分类 ID，配置在 `src/config/giscus.ts`。用户已开启 Discussions，并通过 giscus 配置页确认仓库满足条件。后续更换仓库或分类时，从 https://giscus.app/zh-CN 获取新的公开 ID；无需访问令牌。

组件使用 specific 映射和稳定 `discussionId`；读者点击“加载评论”后才加载远程脚本。支持主题同步和加载失败提示，不自动发表评论。

2026-10-11 已在本地验证真实评论框加载、各篇文章的独立映射及深色主题同步。验证外网加载时使用本机代理；未登录或发送测试评论。

## 检查与部署

修改后运行 `npm run check` 和 `npm run build`，检查链接、正式构建的草稿隔离和本地页面。`package.json` 的 selector parser 覆盖用于修复 typography 旧依赖；上游解决后可移除。

`.github/workflows/deploy.yml` 在推送 main 后部署 GitHub Pages。用户要求先本地预览，确认后再提交、推送；不提前触发部署或修改远端设置。不要发布凭证、私密数据或未授权内容。贡献者见 `CONTRIBUTORS.md`。

# Wuhulahu2 Technical Home

个人技术主页的最小可行版本，托管在 `kiteAB112.github.io`。它用于沉淀项目成果、技术文章、实验记录、短笔记以及当前学习方向，而不是追求一开始就成为功能复杂的博客。

## 技术栈

- [Astro](https://astro.build/)
- Markdown / 可选 MDX 内容文件
- GitHub Pages
- GitHub Actions 自动构建和部署

## 本地开发

需要 Node.js 22 或更高版本。

```powershell
npm install
npm run dev
```

打开终端显示的本地地址（通常是 `http://localhost:4321`）。

常用命令：

```powershell
npm run build    # 生成静态网站到 dist/
npm run preview  # 本地预览构建产物
npm run check    # Astro 类型与内容检查
```

## 内容发布

内容位于 `src/content/`：

```text
src/content/
├── projects/  # 项目成果
├── articles/  # 完整技术文章
├── labs/      # 可复现实验记录
└── notes/     # 简短技术笔记
```

在对应目录新增一个 `.md`（或 `.mdx`）文件，使用下面的 frontmatter：

```md
---
title: 标题
description: 一句话说明内容解决的问题或给出的结论。
published: 2026-07-12
updated: 2026-07-12 # 可选
tags: [Security, Experiment]
draft: false
---

正文从这里开始。
```

设置 `draft: true` 后，内容不会出现在公开页面或构建产物中。实验与项目推荐依次写清：问题、原理、环境与过程、结果、踩坑、复现材料和边界条件。

`src/pages/now.astro` 是手动维护的当前状态页；完成一段学习或项目推进后直接更新它即可。

## 部署到 GitHub Pages

工作流位于 `.github/workflows/deploy.yml`。向 `main` 分支推送后，它会使用 Astro 的 GitHub Action 构建，并将产物部署到 GitHub Pages。

首次启用时，在 GitHub 仓库的 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。本仓库是用户站仓库，因此 `astro.config.mjs` 仅设置：

```js
site: 'https://kiteAB112.github.io'
```

没有 `base` 路径。若日后将代码移到普通项目仓库，再按仓库名增加 `base` 即可。

本地修改不会自动发布：必须由你自行检查、提交并推送。请勿将访问令牌、私密实验数据、未授权披露的漏洞细节或敏感个人信息提交到仓库。

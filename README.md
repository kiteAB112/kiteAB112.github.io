# Wuhulahu2 Technical Home

个人技术主页，托管在 `kiteAB112.github.io`。它用于沉淀自己的项目成果、技术文章、实验记录、短笔记、开源收藏与当前学习方向；重点是让内容保持可追溯、可维护。

## 技术栈

- [Astro](https://astro.build/)
- Markdown / 可选 MDX 内容文件
- GitHub Pages
- GitHub Actions 自动构建和部署

## 页面与功能

- `Projects`：本人正在进行、已完成或公开上传的项目。
- `Stars`：长期关注的开源项目与简短的关注理由，不与个人作品混淆。
- `Articles`、`Labs`、`Notes`：分别对应完整文章、可复现实验和短笔记。
- `Now`：手动维护的当前学习与工作快照。
- 浅色 / 深色主题切换会保存在浏览器中；首次访问会跟随系统偏好。
- 宽屏页面带有个人侧栏。侧栏头像的悬浮人物效果仅在桌面端启用，不影响移动端阅读。

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
├── notes/     # 简短技术笔记
└── stars/     # 精选的 GitHub Star 项目
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

静态图片资源放在 `public/`。当前的个人头像与悬浮人物素材可在 `public/profile-avatar.png`、`public/hover-character-v2.png` 中替换；替换后建议重新执行构建检查。

## 部署到 GitHub Pages

工作流位于 `.github/workflows/deploy.yml`。向 `main` 分支推送后，它会使用 Astro 的 GitHub Action 构建，并将产物部署到 GitHub Pages。

首次启用时，在 GitHub 仓库的 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。本仓库是用户站仓库，因此 `astro.config.mjs` 仅设置：

```js
site: 'https://kiteAB112.github.io'
```

没有 `base` 路径。若日后将代码移到普通项目仓库，再按仓库名增加 `base` 即可。

本地修改不会自动发布：必须由你自行检查、提交并推送。请勿将访问令牌、私密实验数据、未授权披露的漏洞细节或敏感个人信息提交到仓库。

## 发布前检查

```powershell
npm run check
npm run build
```

确认通过后推送到 `main`，GitHub Actions 会自动部署到 <https://kiteAB112.github.io>。

## Contributors

详见 [CONTRIBUTORS.md](./CONTRIBUTORS.md)。

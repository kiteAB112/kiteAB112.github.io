# Agents Guide

本站是 wuhu 面向技术同行的 GitHub Pages 博客。协作使用中文，保留用户已有改动。

## 项目入口

先按任务需要阅读 README.md 和相关源码。AstroPaper v6.1 定制的 Astro 静态站点，没有服务端、数据库或 CMS；上游许可见 licenses/AstroPaper.txt。

- Markdown 内容为 src/content/{articles,projects,fieldnotes}/ 三个集合。
- Stars 分类和七篇精选说明由 src/data/stars.ts 维护。
- 各栏目使用独立 pages 路由；共享正文使用 ArticleLayout，列表使用 CollectionLayout。
- 站点信息在 src/config/site.ts，giscus 公开配置在 src/config/giscus.ts。空 ID 表示未启用。
- 保持已认可的单栏布局、字体、正文宽度与明暗配色。内容详情共享排版，不随意添加栏目特例。
- /now/ 是有日期的手动状态记录，勿视为实时状态。
- 标签只来自已发布技术文章，新增文章自动更新，不预设或擅自合并标签。
- 内容移动或改名时保留现存 URL 与 discussionId。

## 内容与草稿

遵循 src/content.config.ts。Fieldnotes 从 ZhihuCLI Weekly 手动复制，不自动同步；流程见 README.md。图片放在与正文同级的 <id>.assets/，通过静态资源路由保留 /fieldnotes/<id>/<filename> 地址。

Fieldnotes 草稿仅本地 dev 可见。正式构建不生成任何草稿页面、搜索/RSS 项或草稿图片；页面与图片必须共用可见性规则。其他集合草稿始终隐藏。

不要发布秘密、私密数据或未授权内容。避免在没有具体阅读需求时增加复杂功能。

## 验证与发布

实质修改后运行 npm run check 和 npm run build，验证受影响页面、链接、搜索和草稿隔离。

用户明确要求先本地预览，确认后再提交与推送。未获确认前，不提交、推送、触发部署或变更 GitHub Pages 设置。远端仓库名 kiteAB112.github.io 用于用户站点地址，不擅自更名。

未来个人服务器用于生活记录、部分技术内容和导航。本任务不操作或部署该服务器。

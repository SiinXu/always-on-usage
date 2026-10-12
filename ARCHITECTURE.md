# ARCHITECTURE
- 栈：Vite 5 多页静态 + 原生 HTML/CSS/JS。无后端。
- 内容源：`content.mjs`（agents + cases）→ `gen.mjs` 生成 HTML、`public/data/*.json`、`public/llms.txt`。改内容只改 content.mjs。
- 计算器：`src/calc.js` 纯前端评分（规则写在注释里）。案例搜索：`src/search.js`。
- i18n：`lang="zh-CN"` + `data-alt-lang="en"` 预留；JSON 字段可加 `*_en`。
- 部署：Vercel 静态（build=`npm run build`，output=`dist`）。暂未推送。

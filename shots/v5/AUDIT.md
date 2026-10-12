# v5 web-quality-audit (2026-10-12, local preview http://localhost:4340, serve dist)

依据 /workspace/web-bot-skills/web-quality-audit/SKILL.md：Lighthouse 12 (mobile, simulated throttling) + Playwright 实测 + 源码检查。

## Evidence
| Signal | Scope | Round 1 | Round 2 (after fixes) | Source |
|---|---|---|---|---|
| Performance | / mobile | 94 | 95 | Lighthouse |
| Performance | /calculator.html mobile | 93 | 93 | Lighthouse |
| Accessibility / Best practices / SEO | /, /calculator.html, /compare.html | 100 / 100 / 100 | 100 / 100 / 100 | Lighthouse |
| LCP / CLS / TBT | / mobile | 2.4s / - / 0ms | 2.3s / 0.016 / 0ms | Lighthouse |
| Horizontal overflow | 5 pages x light/dark x 1440/390 | about 390px: 15px | 0 everywhere | Playwright scrollWidth |
| Console errors | same 20 runs | 0 | 0 | Playwright |
| Knob keyboard (ArrowUp x5), lever via Space | /calculator.html | - | value 3→8, switch toggles, result updates (aria-live) | Playwright |

## High (P1) found and fixed
- **[A11y/Responsive]** /about.html 在 390px 横向溢出 15px（长路径 /data/... 不换行）。Fix: `.case-dl dd{overflow-wrap:anywhere}`。Re-verified 0px.
- **[Performance]** Google Fonts CSS render-blocking（Lighthouse 估省 690-1380ms）。Fix: 字体样式表改 `media=print onload` 非阻塞 + `<noscript>` 回退，`display=swap` 保留。Round 2 只剩自身 CSS（4.9KB gzip）的阻塞。
- **[UX/Content]** 首页 lede 写「拨一下右边的拨盘」，手机端拨盘在下方。Fix: 改为「拨一下拨盘」。
- **[Visual]** 对照标本卡展开后，剩下两张卡只占 3 列中的 2 列，留空洞。Fix: `.specs.has-open` 改 2 列（手机 1 列）。
- **[Visual]** 计算器 h1 在桌面断成「额度风 / 险计算器」。Fix: 换成可读断行的标题「额度会不会 / 烧穿」，页面 title 仍是「额度风险计算器」。

## Medium / Low
- (fixed) 区块副标题浮在右上角（taste §9.F 禁）。改为标题下方。
- (fixed) 案例横条首卡贴边：加 `scroll-padding-inline`。
- (fixed) 缺 robots.txt：gen.mjs 生成 `public/robots.txt`。
- (open, Low) `serve` 的 cleanUrls 把 `.html` 301 到无后缀地址，Lighthouse 记 redirect 600ms；这是本地预览服务器行为，部署到 Vercel/静态托管时按链接配置处理。
- (open, Low) 静态资源缓存 TTL 由托管方决定，本地 serve 不计。
- (open, Medium) 无 sitemap.xml / canonical：等域名确定后加。
- (open, Low) 首屏 FCP 2.3s 在 Lighthouse 模拟 4G 下，主要是字体与 CSS 首次请求；可后续自托管 Geist 子集。

## Not verified
- 真实用户 CrUX 数据（未上线）。
- 真机 Safari 上 `@property` border-beam：不支持时 beam 静止，不影响功能。

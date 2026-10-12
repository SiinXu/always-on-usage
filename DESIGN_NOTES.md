# DESIGN_NOTES — Always-on Usage (v5, from scratch)

> 状态：**已接受（2026-10-12）**，进入编码。
> 所有 hex 都是看 800px webp 预览目测估的近似值，不是从源站取的，写代码时按真实组件再校一次。

## Design Read（一句话）
一个**有动效、有工艺感的产品站**（不是后台仪表盘）：三家常驻 Agent 的对照做成会动的「标本卡」，
额度计算器做成一个能上手拨弄的**金属质感物件**，正文排版像高级产品发布页——ink 黑 + 铬银 + 一种电光蓝。

## 实际打开（Read 工具看过像素）的预览 —— 共 13 个文件
previews/ui-aceternity-com.webp · magicui-design.webp · www-cult-ui-com.webp · www-hover-dev.webp ·
animata-design.webp · reactbits-dev.webp · reactbits-dev-animations-metallic-paint.webp ·
www-beautifului-dev.webp · beautiful-ui-five-vercel-app.webp（与上一张是同一张图）·
www-magicpatterns-com.webp · motion-primitives-com.webp · lib-motion-dev-examples.webp ·
shaders-paper-design-liquid-metal.webp
data.json 对照：Aceternity / Magic UI / Cult UI / Hover.dev / Animata / React Bits / React Bits 金属漆
都在 section「五、动效和好看的通用组件」；data.json 里还有子条目可抓具体组件，如
`cs-magicui-design-card`（magic-card）、`cs-magicui-design-button`（shimmer button）、
`cs-magicui-design-chart`（number-ticker）、`cs2-reactbits-dev--card--components-spotlight-card--v0`、
`cs2-reactbits-dev--motion--text-animations-decrypted-text--v1`、`cs-ui-aceternity-com-background`。

## KEPT（9 条）
动效类型说明是「在本站用它做什么」，预览图本身是静态封面，动效以 data.json 链接的组件为准。

| # | 库 | 预览路径 | 借鉴 / 动效类型 | hex（估） | 圆角 | 阴影 | 字体 |
|---|---|---|---|---|---|---|---|
| 1 | Aceternity UI | previews/ui-aceternity-com.webp | 暗底 + 细网格背景、出血的倾斜组件拼贴（hero 右侧）；**spotlight** 跟随光斑、**3D tilt** 卡 | bg #0B0B0C，卡 #FFFFFF / #141416，线 #26262A | 卡 12–14px，按钮 8px | 无外阴影，靠 1px 边 + 层叠错位 | 粗几何无衬线（近 Inter Display 700） |
| 2 | Magic UI | previews/magicui-design.webp + data `cs-magicui-design-card/button/chart` | 极简排版 + 版心框线；**magic-card 光边**（glow-border 跟鼠标）、**shimmer button**、**number-ticker** 滚数 | 白 #FFFFFF，线 #E6E6E6，字 #0A0A0A，灰 #52525B | 卡 16px | 0 极浅 | 大号 Geist/Inter 700，紧字距 |
| 3 | Cult UI | previews/www-cult-ui-com.webp | **像素字 + 清爽 grotesk 混排**做标题对比（"Shadcn, / expanded"）；mono 的命令行页脚 | #FAFAFA / #111111 / 灰 #6B6B6B | — | 无 | Inter Tight 400 + 像素 mono（类 Geist Pixel） |
| 4 | Hover.dev | previews/www-hover-dev.webp | 敢用**粗黑描边 + 硬投影**的趣味交互块；**magnetic / spring** 按钮、贴纸星星 | 蓝紫 #5B54F0（只取其交互手感，不取颜色），黑 #0A0A0A | 4–6px | 硬阴影 4px 4px 0 #000 | Poppins 800 |
| 5 | Animata | previews/animata-design.webp | 大几何形状的**形变 / morph** 作章节图标（四叶→九点→半圆→箭头），可作「风险等级」形态变化 | 芥黄 #DDB91F、奶白 #FBF3D6（**只借形状语言，颜色不用**） | 形状级 | 无 | 粗圆 grotesk 大写 |
| 6 | React Bits · Metallic Paint | previews/reactbits-dev-animations-metallic-paint.webp | **流动铬金属**材质：计算器拨盘/品牌标的主材质；左侧斜向**光束 sweep** | #0A0A0A、铬 #D9D9D9→#7A7A7A→#FFFFFF | 舞台卡 20px | 内高光 inset 0 1px 0 rgba(255,255,255,.08) | 像素 mono 标题 |
| 7 | React Bits（主页） | previews/reactbits-dev.webp + data spotlight-card / decrypted-text | **decrypted text / text-reveal** 用在数字与标题入场；**spotlight card**。⚠ 只取动效，紫色丝绸背景拒绝 | 底 #120A1F（拒），字 #F2F2F2 | — | 字发光仅 1 档 | 像素 mono |
| 8 | Beautiful UI | previews/www-beautifului-dev.webp | AI 原生微交互：**pixel-grid shimmer loader**、「Thought for 4s」展开、分段 pill 切换（Drive/Dots/Orbit）——用于 Bot 运行状态的活体演示；斜纹侧边底纹 | #161618 / 卡 #1C1C1F / 边 #2A2A2E / 品牌蓝 #3E6BFF | 卡 14px，pill 999px | 无，1px 边 | Inter 500/600，mono 计时 |
| 9 | Motion（examples） | previews/lib-motion-dev-examples.webp | **编辑式非对称**：黑块压在电光蓝上的错位 hero、`FILTER://` mono 标签、Featured·Spotlight 带状横条；**particle morph** | 电光蓝 #3D8BFF，墨 #0A0A0A，奶白 #F4F1EA | 0（方块）| 无 | 粗 grotesk 800 紧字距 + mono 大写小标 |

## REJECTED
- Tremor / Radix / shadcn Charts / 任何 dashboard、KPI 条、「稳重仪表盘」——用户否决。
- 以往皮：纸面橙、Carbon 灰、Instrument 字体 + 荧光绿——禁止再出现。
- previews/reactbits-dev.webp 的紫色丝绸背景、previews/shaders-paper-design-liquid-metal.webp（粉紫网格渐变）——典型「AI 紫光」slop。
- previews/www-magicpatterns-com.webp：绿-紫软渐变 blob + pill 字，扁平、像模板 SaaS。
- previews/motion-primitives-com.webp：干净但太素，hero 居中平铺，没有可借的动效语言。
- previews/beautiful-ui-five-vercel-app.webp：与 www-beautifului-dev 完全同图，不另计。
- Hover.dev 的蓝紫、Animata 的芥黄：只借交互/形状，不借色。

## 统一 Token 系统（选一套：Ink + Chrome + Electric Blue）
**为什么**：KEPT 里最强的三张（Metallic Paint、Motion examples、Beautiful UI）共享「近黑墨底 + 银/白 + 单一冷蓝」；蓝不是紫，能避开 AI 紫光；铬金属给「工艺感」，蓝只做交互信号。

| token | dark | light |
|---|---|---|
| --bg | #0A0A0B | #F4F2EC（奶白，来自 Motion） |
| --surface | #141416 | #FFFFFF |
| --surface-2 | #1C1C1F | #ECEAE3 |
| --line | #2A2A2E | #DAD7CE |
| --ink | #F2F2F0 | #0A0A0B |
| --muted | #8A8A90 | #5E5E63 |
| --accent（电光蓝） | #3D8BFF | #1F6BFF |
| --chrome | linear(#FFFFFF→#9A9AA0→#E6E6E6→#5C5C62) | 同，降一档对比 |
| --risk-low / mid / high | #3D8BFF / #E8C547 / #FF5A3C（仅计算器） | 同 |
- 圆角：物件 20px，卡 14px，按钮 10px，pill 999px，Motion 式编辑块 0。
- 阴影：默认无；层次靠 1px line + inset 高光 `inset 0 1px 0 rgba(255,255,255,.06)`；唯一「发光」= accent 的 border-beam，1 档，不叠。
- 字体：标题 **Geist 700/800**（紧字距 -0.03em）；数字/标签 **Geist Mono**；点缀标题字 **Geist Pixel**（Cult/React Bits 那种像素字）——每页最多 1 处；中文 **HarmonyOS Sans SC / 思源黑体**。

## 布局方案（不是平铺章节，不是 KPI 条）
1. **Hero 非对称**（Motion examples + Aceternity）：左 7 列大标题（像素字一词 + Geist 粗体，decrypted-text 入场），右 5 列出血一个**正在运行的 Bot 标本**（Beautiful UI 的 pixel shimmer + 「已运行 8.9s · 本周额度 42%」number-ticker），整个块错位压在 accent 蓝色色带上。
2. **对照 = 电影式标本卡**：Grok Bot / OpenAI Dots / Meta Muse 三张大卡横向**错落高度**排列，hover 时 3D tilt + spotlight，选中卡**展开（spring layout）**成全宽，内部是触发器/浏览器 vs connector/并行/routine 的逐行 reveal。不是表格。
3. **计算器 = 手作物件**：一个 20px 圆角的铬金属「额度拨盘」舞台（Metallic Paint 材质）；Bot 数=可拖的 magnetic 旋钮，浏览器=实体拨杆 toggle，routine 频率=分段 pill；结果用 Animata 式**形状 morph**（圆→九点→箭头 对应 低/中/高）+ number-ticker，border-beam 沿舞台跑一圈表示「在烧」。
4. **案例**：Motion 式 `FILTER://` mono 筛选 + 「Featured · 踩坑」带状横条 + 编号大卡，滚动时 text-reveal。
5. **动效即层级**：每屏只有 1 个主动效（hero 运行态 / 选中卡展开 / 拨盘），其余静止；`prefers-reduced-motion` 全部降级为淡入。

## Skills 反 slop 规则（taste / impeccable / frontend-design）
1. 不用紫色/粉紫 mesh 渐变、不满屏毛玻璃；只有一种 accent，渐变只给铬金属材质。
2. 动效要有因果（表示状态：运行、展开、风险变化），禁止装饰性无限漂浮；一屏一个主角动效。
3. 禁止三列等宽卡平铺 + 居中 hero 的模板结构；靠错位、出血、尺寸对比建立层级。
（注：本轮未重读 skill 原文，以上按此前已读内容概括；接受后编码前会再读 taste-skill / impeccable 原文核对。）

## 门禁（不变）
编码后：Playwright 桌面+手机 × 明+暗 截图 → web-quality-audit → iterate-until-verified；未全过不说做完。


## Skills checked before coding（2026-10-12，编码前已重读原文）
读过：web-bot-skills/taste-skill/SKILL.md（§4、§5.D、§6、§9）、impeccable/SKILL.md（本地只有 SKILL.md，无 reference/craft-floor.md，launcher 不在，改为直接读项目 DESIGN_NOTES）、frontend-design/SKILL.md 全文。实际落地的规则：
1. **taste §9.F「NO div-based fake product UI in the hero」**：hero 右侧出血的「标本」不是假截图，而是**真能拨的额度拨盘**（旋钮/拨杆/pill 驱动真实评分函数），首页计算器就是 hero 的标本。
2. **frontend-design「AI 默认色 #F4F1EA 奶油底」+ taste §4.2 暖纸色禁令**：笔记里的 light `--bg #F4F2EC` 改为冷灰 **#F1F2F4**（铬金属是冷色系，统一冷灰，一个 palette），accent 锁定电光蓝全站唯一。
3. **taste §9.G em-dash 全禁 + §9.F 不用带底轨的进度条 + frontend-design「每屏一个编排动效、动效回应用户动作」**：文案无 `—`/`–`、链接不追加 `→`；风险结果用形状 morph + 数字 ticker 表示，不用填充轨道条；首页主动效 = 拨盘 border-beam，对照页主动效 = 卡片 spring 展开，其他元素静止；`prefers-reduced-motion` 全部降为淡入。

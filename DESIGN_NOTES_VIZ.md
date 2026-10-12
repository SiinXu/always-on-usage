# DESIGN_NOTES_VIZ — always-on-usage 可视化升级（motion-led）

范围：只升级可视化与动效（首页 hero + rails、金属拨杆计算器、对照区）。保留：10 语 i18n、「X 案例」命名（禁「软文」）、聚合 IA（教程/模板/场景/做成了什么/X 案例/附录警告）、墨黑 + 铬银 + 电光蓝。
hex 为截图目测近似；动效类型来自 data.json 组件条目（2357 条中 19 条命中 spotlight/border-beam/marquee/number-ticker/tilt/dock/shimmer），封面本身是静图。

## 已实际 Read 的预览（10 张，保留 8）

| # | 库 | 路径 | 动效类型（data.json 佐证） | hex | 圆角 | 阴影 | 字体 |
|---|---|---|---|---|---|---|---|
| 1 | Aceternity UI | previews/ui-aceternity-com.webp | spotlight、floating-dock、地球点阵自转、倾斜叠放卡（ui.aceternity.com/components/floating-dock） | bg #0B0B0C，卡 #FFFFFF / #111214，网格线 #1C1D20，点阵 #3B82F6 | 卡 12px，按钮 6px | 卡浮层 0 20px 60px rgba(0,0,0,.55) | 粗无衬线 Grotesk 700（≈Inter Display） |
| 2 | Magic UI | previews/magicui-design.webp | border-beam、number-ticker、marquee（vertical）、shimmer-button | bg #FFFFFF，线 #E5E5E5，logo 渐变 #C084FC→#FDBA74（不取） | 徽标 999px | 无，靠 1px 网格线 | Geist/Inter 700，副文 #52525B |
| 3 | Cult UI | previews/www-cult-ui-com.webp | 动画 shadcn 组件；像素等宽字作“展示字” | bg #FAFAFA，墨 #0A0A0A，次文 #6B6B6B | 0（排版型） | 无 | Grotesk 大标题 + 像素等宽 display + mono 页脚 |
| 4 | Hover.dev | previews/www-hover-dev.webp | 交互动画组件、倾斜窗口、贴纸星标弹出 | 强调 #4F46E5，网格底 #A5B4FC，墨 #0A0A0A | 窗口 6px，按钮 4px | 硬投影 6px 6px 0 #0A0A0A（neo-brutal） | Poppins 800 |
| 5 | React Bits · Metallic Paint | previews/reactbits-dev-animations-metallic-paint.webp | 液态金属 shader 流光（chrome-sweep） | bg #050505，卡 #0D0D0D，铬 #F2F2F2→#6E6E6E，斜光束 rgba(255,255,255,.08) | 卡 16px | 无，靠光束 | 像素等宽 display |
| 6 | React Bits | previews/reactbits-dev.webp | 丝绸背景流动、spotlight-card、dock（reactbits.dev/components/spotlight-card） | #1A0B2E / #7C3AED（紫，不取，只取结构） | — | 字辉光 0 0 24px rgba(255,255,255,.35) | 像素等宽 display |
| 7 | Motion Primitives | previews/motion-primitives-com.webp | tilt card、apple-style dock、text-shimmer（motion-primitives.com/docs/tilt） | bg #FFFFFF，展台 #F4F4F5，按钮 #18181B | 展台 20px，按钮 8px | 极淡 0 1px 2px rgba(0,0,0,.06) | Inter 500 |
| 8 | Motion.dev Examples | previews/lib-motion-dev-examples.webp | spotlight 精选、粒子 morph、spring 布局 | 电光蓝 #3B8BFF，墨 #0B0B0B，纸 #F5F2EA | 0（硬切块） | 无 | Grotesk 800 + 等宽小标签 FILTER:// |

拒绝：Animata（previews/animata-design.webp，芥末黄 #DDBB22 接近“纸面橙”系，弃）；paper-design liquid-metal（previews/shaders-paper-design-liquid-metal.webp，粉紫渐变 = AI 紫光味，只留“液态金属”概念给 #5 实现）。另拒：Instrument 荧光绿、Carbon、Tremor 仪表盘、平铺等宽网格。

## 调色（保留，微调一处）
- 墨 #07080A / 面 #0E1013 / 线 #1C1F24
- 铬银渐变 #F2F2F2 → #9AA0A6 → #4A4F55（来自 #5）
- 电光蓝 #3B8BFF（来自 #8，替换原偏青蓝，更饱和，作唯一强调色）
- 亮色模式：纸 #F7F7F5 / 墨 #0A0A0A，铬改为 #D9DBDE→#7A7F86
- 字体：现有 Grotesk 显示字 + 等宽小标签（#3/#8）；数字用 tabular mono。

## 1) 首页 hero + rails（motion-led，不靠 hover 放大裁切）
- Hero 右侧：金属拨杆 specimen 置于 Aceternity 式斜叠卡堆（#1），背景加一道缓慢斜光束（#5，12s 循环，opacity ≤.08）。
- 标题：Motion-primitives text-shimmer（#7）只扫一次，铬色光沿字走 1.2s。
- Rails（教程/模板/场景/做成了什么/X 案例）：改为 Magic UI marquee（#2）自动缓移，hover 暂停；卡片用 spotlight-card（#6）鼠标跟随径向光 rgba(59,139,255,.18)，**不 scale**，彻底消除贴边裁切。rail 两端渐隐 mask 48px。
- 计数“已聚合 N 条”：number-ticker（#2）进入视口时滚动。

## 2) 金属拨杆计算器（同一物件语言，更丰富）
- 旋钮：magnetic（光标 40px 内吸附 ≤6px）+ spring 回弹（stiffness 260 / damping 20）。
- 刻度：拖动时每格触发 1 帧刻痕高亮，模拟 detent。
- 铬面：chrome-sweep 光带随旋钮角度移动（#5），非循环、跟手。
- 结果区：number-ticker 数值滚动 + border-beam（#2）在“额度将耗尽”状态绕卡一周（电光蓝→铬白）。
- 保留“估算方向，非厂商 SLA”说明与 quota-report 外链。

## 3) 对照区（specimen 卡 + 动效，非 KPI）
- 三家（Grok Bot / Dots / Muse）为错落 specimen 卡，Hover.dev 式轻倾斜（tilt ≤6°，#4/#7），去掉硬投影改用铬色 1px 内描边。
- 卡内可视化：节奏/频率用“脉冲轨道”——小点沿圆轨按 cadence 速度绕行（Aceternity 地球点阵语言 #1），而非柱状图。
- 切换产品：spring layout 动画（#8），卡片位置互换而非淡入淡出。
- Dots/Muse 无数据时轨道为虚线 + “第 1 期以 Grok Bot 为主”。

## 约束
- 每屏只有一个主动效；`prefers-reduced-motion` 全部降为静态；动效仅用 transform/opacity；不新增大型 shader 依赖（金属光用 CSS 渐变 + mask）。
- 门禁：Playwright 桌面+手机 × 明暗 → web-quality-audit → iterate-until-verified。

## Design Read
墨黑展台上的铬金属物件，被一束电光蓝点亮：动效来自“光”和“物理”（spotlight、chrome-sweep、magnetic、spring、ticker），而不是 hover 放大。Aceternity 的斜叠层次 + React Bits 的液态金属 + Magic UI 的 marquee/border-beam/ticker + Motion 的 spring 布局，拒绝仪表盘克制与平铺网格。

**CSS forbidden until user accepts this file.**

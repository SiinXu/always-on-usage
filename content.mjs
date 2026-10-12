export const agents=[
{id:"grok-bot",name:"Grok Bot",vendor:"xAI",triggers:"定时 routine、邮件/Webhook、聊天唤起、Bot 间消息",browser:"内置云端浏览器 + 大量 connector（Gmail、Calendar、Notion、GitHub…）；浏览器步骤最贵",parallel:"多 Bot 并行、可派生子代理；并行数量是额度主要放大器",routine:"分钟级到每日；高频轮询最易烧额度",risk:"中-高（估算方向）",fit:"多 Bot 协作、邮件/日历分拣、带浏览器的研究与表单前置",unfit:"秒级监控、纯抓取农场、无人看管的高频浏览器循环",links:[["grokbotwiki","https://grokbotwiki.com"],["botsdots","https://botsdots.site"]]},
{id:"openai-dots",name:"OpenAI Dots",vendor:"OpenAI",triggers:"定时任务、聊天唤起、部分应用事件（估算方向）",browser:"以 connector / 工具调用为主，浏览代理按需启用",parallel:"以单代理多任务为主，并行有限（估算方向）",routine:"日级 / 周级摘要最常见",risk:"中（估算方向）",fit:"每日简报、跟进提醒、文档整理",unfit:"需要多代理分工的长链路工作流",links:[["aiformortals 对比","https://aiformortals.com"]]},
{id:"meta-muse",name:"Meta Muse",vendor:"Meta",triggers:"聊天唤起、社交/消息事件、定时提醒（估算方向）",browser:"偏向自有生态 connector，通用浏览器能力较弱（估算方向）",parallel:"单代理为主（估算方向）",routine:"日级提醒 / 内容排期",risk:"低-中（估算方向）",fit:"社交内容排期、消息生态内的轻助理",unfit:"跨 SaaS 深度自动化、需要真实浏览器登录的流程",links:[["customaise 对比","https://customaise.com"]]}];
export const cases=[
["six-bots-42-percent","6 个 Bot 一天烧掉 42% 周额度","grok-bot","高","六个 Bot 各自每 15 分钟检查一次收件箱和网页，其中两个默认开浏览器。一天下来约 600 次唤起，浏览器步骤占了大头。","合并为 1 个分拣 Bot + 按需派生子代理；轮询改为 Webhook/邮件触发；浏览器只在 connector 不覆盖时开启。","估算降到约 9% / 天"],
["browser-price-monitor-30min","每 30 分钟浏览器比价，3 天用完一周额度","grok-bot","高","用浏览器打开 8 个商品页截图比价，每 30 分钟一次，每次 8 个页面加载。","改为每日两次 + 只抓有公开 API/RSS 的源；变化才通知。","页面加载次数降约 94%"],
["hourly-digest-to-daily","每小时简报改每日一次，省下约 80% 用量","openai-dots","中","团队频道每小时一份摘要，大多数小时没有新内容。","改为早晚两次 + 空内容直接跳过。","唤起次数 24 → 2"],
["subagent-fanout-12","一次任务派生 12 个子代理，单次花掉 5% 周额度","grok-bot","高","研究任务对 12 个竞品各派生一个带浏览器的子代理。","先用搜索 + 抓取筛到 4 个，再对 4 个开浏览器深挖。","单次成本约降 2/3"],
["inbox-triage-connector","收件箱分拣从浏览器换 Connector，成本降到 1/5","grok-bot","中","用浏览器登录网页邮箱读邮件，速度慢且每封都要渲染。","改用 Gmail connector 读取与打标签。","估算约 1/5 成本"],
["muse-social-schedule","Muse 排期 30 条社交内容，额度几乎无感","meta-muse","低","每周一次批量生成 30 条帖子草稿并排期。","保持周级批处理；避免逐条唤起。","低风险基线"],
["calendar-poll-5min","日历每 5 分钟轮询，一周 2000+ 次空跑","grok-bot","高","为了「会议前 10 分钟提醒」每 5 分钟查日历。","改为每日早上生成当天提醒计划，按事件时间触发。","空跑接近 0"],
["dots-weekly-report-2-bots","2 个代理协作周报，比 1 个多花 1.8 倍","openai-dots","中","拆成「收集」「写作」两个代理，交接时重复读取全部上下文。","单代理 + 结构化中间文件；交接只传摘要。","重复上下文减少约 45%"],
["github-watch-3-repos","盯 3 个 GitHub 仓库：Webhook 比轮询省 95%","grok-bot","低","最初每 10 分钟用 connector 列 PR。","改为通知邮件触发，仅在有新 PR 时唤起。","唤起次数降约 95%"],
["login-wall-retry-loop","登录墙重试死循环，一夜烧掉 18% 周额度","grok-bot","高","浏览器遇到验证码后反复重试，没有上限，夜里无人看管。","设置重试上限（≤2）+ 失败即通知人类；高风险流程禁止夜间无人值守。","止损：单任务封顶"],
].map(([slug,title,agent,risk,what,fix,result])=>({slug,title,agent,risk,what,fix,result,estimate:true}));

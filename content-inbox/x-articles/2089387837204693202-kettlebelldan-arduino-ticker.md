---
title: "让 Bot 驱动 Arduino 跑马灯"
author: "@KettlebellDan"
post_url: "https://x.com/KettlebellDan/status/2089387837204693202"
tags: [other, coding]
date: 2026-08-17
source: public X post
---

# 让 Bot 驱动 Arduino 跑马灯

> 本文根据 @KettlebellDan 在 X 上的公开帖子整理（2026-08-17），非作者本人撰写；文中不含虚构引语，数据均以原帖为准。

## AI 也能控制你桌上的硬件。

2026-08-17，X 用户 @KettlebellDan 分享了自己用 Grok Bot 做的一件事：Bot 连接 Arduino，让 LED 显示股价、走势线与新闻。这条帖子获得了约 365 个赞、18 次转发。

## 发生了什么

按原帖描述，作者没有写复杂脚本，而是把任务直接交给一个常驻的 Bot：给它目标、连上需要的工具，让它在自己的云电脑上执行，关键动作再回来找人确认。这正是 Grok Bot 与普通聊天机器人最大的区别——它不止给建议，而是把活干完。

## 为什么行得通

Bot 的终端能力让它写固件、推数据。另外，Bot 跑在云端，关掉电脑也不中断；跑通一次后可以存成 skill，再挂成 routine 定时执行。

## 怎么抄作业

1. 让 Bot 能访问设备（同网段或串口方案）
2. 描述显示内容
3. 设定刷新 routine

小建议：先手动跑一次、确认结果靠谱，再自动化；涉及付款、删除、对外发送的动作一律保留人工审批，并留意 routine 频率对用量的消耗。

## 原帖

👉 [https://x.com/KettlebellDan/status/2089387837204693202](https://x.com/KettlebellDan/status/2089387837204693202)

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Cheers Mate 🍻** — A social platform for finding activity partners (搭子). Users can find companions for dining, drinking, karaoke, sports, travel, gaming, etc. The full flow covers: matching → venue selection → booking → AA payment.

## Current State

This project is in **prototype/demo stage**. All pages are standalone HTML files with embedded CSS and JS — no framework, no build system, no backend. The prototypes are mobile-first mockups designed to be opened directly in a browser at max-width 420px.

### Existing prototypes

| File | Page | Product spec section |
|------|------|---------------------|
| `detail-participant.html` | Activity detail (participant/客态 view) | 活动详情页 → 客态 |
| `detail-organizer.html` | Activity detail (organizer/主态 view) | 活动详情页 → 主态 |
| `message.html` | Messaging (conversation list + 1:1 chat with AI icebreaker) | 私信页 |

### Pages not yet prototyped

Per the product spec: 注册页&登录页, Landing页, 发布页, 个人/他人页

## Design System

All prototypes share the same CSS variable palette defined in `:root`:

- `--primary: #6C5CE7` / `--primary-light: #A29BFE` / `--primary-bg: #F0EEFF`
- `--green: #00B894` / `--green-bg: #E8FBF5` (success, online)
- `--orange: #FDCB6E` / `--orange-bg: #FFF8E1` (warnings, full status)
- `--red: #FF6B6B` / `--red-bg: #FFF0F0` (errors, danger actions)
- `--bg: #F7F8FA` / `--card: #FFFFFF` / `--border: #E8ECF0`
- `--text: #2D3436` / `--text-secondary: #636E72` / `--text-muted: #B2BEC3`

Common patterns across prototypes:
- `max-width: 420px; margin: 0 auto` — mobile viewport simulation
- Sticky nav with `backdrop-filter: blur(12px)` and semi-transparent white background
- Card components with `border-radius: 16px` and `box-shadow: 0 2px 12px rgba(0,0,0,0.06)`
- Emoji as avatar placeholders (e.g. 🦊 林语, 🐱 陈默, 🌸 小温, 🎵 Akira)
- Bottom action bars fixed at viewport bottom
- Sheet/overlay patterns for modals (`.show` class toggles visibility)
- Font stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', sans-serif`

## Viewing Prototypes

```bash
open /Users/bytedance/Projects/Dazi/<filename>.html
```

## Product Documentation

The full product spec lives in Feishu wiki:
- Page designs & PRD: wiki token `OWylwMcrSitPHGkRofscb17qn3f` (title: 【ASAP项目】找搭子)
- Market research & feasibility: wiki token `ZWeNwauOci9VjGk0KEbcMHWan9e` (title: Cheers Mate 🍻)
- Personal page prototype demo: `https://9f92d37fd650.aime-app.bytedance.net/`

## Key Interaction Details

- **Participant detail page**: "我要加入" button triggers confirmation modal; after joining, button changes to "已加入 ✓" and avatar wall/progress update
- **Organizer detail page**: Can manage members (私信/移除), pin/delete comments, post announcements (📢), and manage activity status via sheet overlay
- **Messaging page**: Two views toggled via `.active` class on `.view` elements; AI icebreaker suggestions can be sent as messages; activity banner is collapsible; group chats show "活动结束后48h自动解散" hint

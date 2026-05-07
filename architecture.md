# NullByte Dash: Neural Architecture Map

This document serves as a tactical guide to the codebase, mapping physical file locations to the functional elements of the dashboard.

## 📂 Project Structure Overview

```text
src/
├── app/                  # Next.js App Router (Routing Layer)
├── apps/                 # Application-specific logic (Kick Bot Core)
├── components/           # Shared UI components & design system
├── layout/               # Core dashboard framework (Sidebar, Header)
├── hooks/                # Custom React hooks (Navigation, State)
├── icons/                # Neural icon library (SVG components)
└── lib/                  # Utility functions & API helpers
```

---

## 🛰️ 1. Routing Layer (`src/app`)
Controls the URL paths and page initializations.

| Path | File Location | Description |
| :--- | :--- | :--- |
| `/` | `src/app/(admin)/page.tsx` | Automated redirect to Kick Bot Overview. |
| `/kick-bot/overview` | `src/app/(admin)/kick-bot/overview/page.tsx` | Main command stats and summary. |
| `/kick-bot/accounts` | `src/app/(admin)/kick-bot/accounts/page.tsx` | Bot unit management & token status. |
| `/kick-bot/chat` | `src/app/(admin)/kick-bot/chat/page.tsx` | Neural Live Chat & Threaded Replies. |
| `/kick-bot/automation` | `src/app/(admin)/kick-bot/automation/page.tsx` | Autopilot gates & confirmation timers. |
| `/kick-bot/logs` | `src/app/(admin)/kick-bot/logs/page.tsx` | Diagnostic event feed. |
| `/kick-bot/config` | `src/app/(admin)/kick-bot/config/page.tsx` | Webhook hub & tactical safety gates. |

---

## 🧠 2. Kick Bot Sector (`src/apps/kick-bot/components`)
Contains the actual neural logic for each tactical module.

- **`KickBotOverview.tsx`**: High-level status cards and channel metrics.
- **`AccountsControl.tsx`**: Multi-account list, avatar rendering, and broadcast toggles.
- **`LiveChatStation.tsx`**: The core chat engine, message threading, and reply anchoring.
- **`AutomationDashboard.tsx`**: Autopilot state management and temporal safety protocols.
- **`TacticalConfigHub.tsx`**: Discord Webhook orchestration and unsaved-change interlocks.
- **`LibraryManager.tsx`**: Direct JSON/Txt file management for bot brains.
- **`EmojiControl.tsx`**: Visual asset management for engagement units.
- **`SystemLogs.tsx`**: The filtration matrix for real-time diagnostic output.

---

## 🏛️ 3. Dashboard Framework (`src/layout`)
Global components that persist across all tactical pages.

- **`AppSidebar.tsx`**: The primary navigation matrix. Controls the order of modules.
- **`AppHeader.tsx`**: Top bar containing account status, search, and neural notifications.
- **`SidebarWidget.tsx`**: Specialized sidebar cards for quick status updates.

---

## 💎 4. Neural Design System (`src/components/ui`)
Reusable UI primitives that define the "NullByte" aesthetic.

- **`GlassCard.tsx`**: The base container for all tactical information.
- **`TacticalTooltip.tsx`**: Enhanced information hovers with neural styling.
- **`modal/`**: Contains `ConfirmationModal.tsx`, the primary safety gate for critical actions.
- **`button/`**: Specialized interaction components for bot triggers.

---

## 🛠️ 5. Global Config & Backend Connectors
- **`package.json`**: Dependency matrix (Next.js 16, React 19, Tailwind V4).
- **`next.config.ts`**: Server-side routing and environment configurations.
- **`src/app/api/`**: Server-side route handlers for communicating with the bot backend.

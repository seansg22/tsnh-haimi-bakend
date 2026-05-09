# tsnh-haimi-bakend

Weekly baby development reminder via OpenRouter AI + Telegram. Runs as a GitHub Actions scheduled job every Monday.

> **Note:** General parenting guidance only — not medical advice. Always consult a pediatrician for medical concerns.

---

## What it does

Each week it:
1. Calculates your baby's current age
2. Generates a personalized Vietnamese reminder via OpenRouter
3. Sends **2 Telegram messages**: one for baby, one for the mother

**Baby message covers:** milestones, what to do, activities, feeding (latch, burping, breast pump, cluster feeding), sleep (wake windows, safe sleep, settling), warning signs

**Mother message covers:** stress relief & PPD awareness, nutrition for breastfeeding, postpartum exercise

---

## Stack

Node.js + TypeScript · OpenRouter API · Telegram Bot API · pnpm · GitHub Actions

---

## Setup

```bash
git clone https://github.com/seansg22/tsnh-haimi-bakend.git
cd tsnh-haimi-bakend
pnpm install
cp .env.example .env
# fill in .env
pnpm run build
pnpm run preview   # generate + print, no send
pnpm run send      # send to Telegram (if ENABLE_TELEGRAM_SEND=true)
```

---

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `BABY_NAME` | Yes | — | Baby's name |
| `BABY_BIRTH_DATE` | Yes | — | `YYYY-MM-DD` |
| `BABY_BIRTH_WEIGHT_GRAMS` | Yes | — | e.g. `3200` |
| `BABY_GENDER` | No | `unspecified` | `female` / `male` / `other` / `unspecified` |
| `BABY_FEEDING_METHOD` | No | `breastfed` | `breastfed` / `formula` / `mixed` |
| `MOTHER_NAME` | No | `Mẹ` | Mother's name, used in the wellness message |
| `TIMEZONE` | No | `Asia/Ho_Chi_Minh` | IANA timezone |
| `OPENROUTER_API_KEY` | Yes | — | From [openrouter.ai/keys](https://openrouter.ai/keys) |
| `OPENROUTER_MODEL` | No | `openrouter/auto` | Model ID (see below) |
| `OPENROUTER_SITE_URL` | No | — | Sent as `HTTP-Referer` |
| `OPENROUTER_APP_NAME` | No | `Baby Reminder Bot` | Sent as `X-Title` |
| `TELEGRAM_BOT_TOKEN` | Conditional | — | Required when `ENABLE_TELEGRAM_SEND=true` |
| `TELEGRAM_CHAT_ID` | Conditional | — | Chat ID(s) to send to. Accepts a single ID or multiple comma-separated IDs (e.g. `123456789,987654321`). Required when `ENABLE_TELEGRAM_SEND=true` |
| `ENABLE_TELEGRAM_SEND` | No | `false` | Set to `true` to actually send |

---

## Getting API keys

**OpenRouter**
1. Sign up at [openrouter.ai](https://openrouter.ai) — no credit card needed for free models
2. Go to **Keys → Create Key**
3. Paste into `OPENROUTER_API_KEY`

Free model options: `google/gemma-3-27b-it:free`, `meta-llama/llama-3.3-70b-instruct:free`, `deepseek/deepseek-chat-v3-0324:free`
Browse all: [openrouter.ai/models?supported_parameters=free](https://openrouter.ai/models?supported_parameters=free)

**Telegram bot**
1. Message [@BotFather](https://t.me/BotFather) → `/newbot`
2. Copy the token into `TELEGRAM_BOT_TOKEN`
3. Send a message to your bot, then open `https://api.telegram.org/bot<TOKEN>/getUpdates`
4. Find `"chat": {"id": ...}` → paste into `TELEGRAM_CHAT_ID`

---

## GitHub Actions

Schedule: every **Monday 08:00 Asia/Ho_Chi_Minh** (`0 1 * * 1` UTC). Also supports manual `workflow_dispatch`.

Add these repository secrets (**Settings → Secrets → Actions**):

`BABY_NAME` · `BABY_BIRTH_DATE` · `BABY_BIRTH_WEIGHT_GRAMS` · `BABY_GENDER` · `OPENROUTER_API_KEY` · `TELEGRAM_BOT_TOKEN` · `TELEGRAM_CHAT_ID`

Optional secrets: `BABY_FEEDING_METHOD` · `MOTHER_NAME`

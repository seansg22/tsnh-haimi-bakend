# tsnh-haimi-bakend

A weekly baby development reminder that runs as a GitHub Actions scheduled job. Each Monday, it calculates your baby's current age, asks an AI model via OpenRouter to generate personalized Vietnamese parenting guidance, and sends the result to Telegram.

> **Safety note:** This app provides general parenting guidance only. It is not a medical tool, does not diagnose conditions, and does not prescribe medication. Always consult a licensed pediatrician for medical concerns.

---

## Architecture

```
src/
├── config.ts          → Load & validate environment variables (zod)
├── types.ts           → Shared TypeScript types
├── errors.ts          → Custom error classes
├── babyAge.ts         → Timezone-aware age calculation + Vietnamese label
├── promptBuilder.ts   → Build system instruction & user prompt
├── aiService.ts       → Call OpenRouter API, validate JSON response, retry on rate limit
├── formatter.ts       → Format ReminderContent into Telegram-friendly plain text
├── telegramSender.ts  → Send message via Telegram Bot API (or dry-run)
├── preview.ts         → CLI: generate and print, no send
└── send.ts            → CLI: generate, format, send (or dry-run)
```

Flow: `config → babyAge → OpenRouter → formatter → Telegram`

---

## Prerequisites

- Node.js 22+
- pnpm 9+
- An OpenRouter API key (free account works with free-tier models)
- A Telegram bot token and chat ID (optional for local preview)

---

## Setup

```bash
git clone https://github.com/seansg22/tsnh-haimi-bakend.git
cd tsnh-haimi-bakend
pnpm install
cp .env.example .env
# edit .env with your values
```

---

## Getting an OpenRouter API Key

1. Go to [openrouter.ai](https://openrouter.ai) and create a free account
2. Navigate to **Keys** in your account dashboard
3. Click **Create Key** and copy it into `OPENROUTER_API_KEY` in your `.env`

No credit card is required for free models.

## Choosing a Free Model

OpenRouter aggregates models from many providers. Free models are available but have rate limits and availability that can change.

**Recommended options:**

| Model ID | Notes |
|---|---|
| `openrouter/auto` | OpenRouter picks the best available model automatically |
| `google/gemma-3-27b-it:free` | Google Gemma 3 27B, free tier |
| `meta-llama/llama-3.3-70b-instruct:free` | Meta Llama 3.3 70B, free tier |
| `mistralai/mistral-7b-instruct:free` | Mistral 7B, free tier |
| `deepseek/deepseek-chat-v3-0324:free` | DeepSeek V3, free tier |

Browse all free models at: [openrouter.ai/models?order=throughput&supported_parameters=free](https://openrouter.ai/models?order=throughput&supported_parameters=free)

Set your chosen model in `.env`:
```env
OPENROUTER_MODEL=google/gemma-3-27b-it:free
```

**Notes on free models:**
- Free models may have rate limits (requests per minute or per day)
- Model availability can change without notice — if a model disappears, switch to another
- `openrouter/auto` is a safe default as OpenRouter will route to a capable model automatically
- If you hit a rate limit, the app will retry automatically up to 3 times with a delay

---

## Creating a Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Send `/newbot` and follow the prompts
3. Copy the token (e.g. `7123456789:AAF...`) into `TELEGRAM_BOT_TOKEN`

## Getting Your Telegram Chat ID

After creating the bot:

1. Send any message to your bot in Telegram
2. Open this URL in your browser (replace `<TOKEN>` with your bot token):
   ```
   https://api.telegram.org/bot<TOKEN>/getUpdates
   ```
3. Find `"chat": {"id": 123456789, ...}` in the response
4. Copy that number into `TELEGRAM_CHAT_ID`

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | No | `development` | Runtime environment |
| `BABY_NAME` | Yes | — | Baby's name |
| `BABY_BIRTH_DATE` | Yes | — | Birth date in `YYYY-MM-DD` format |
| `BABY_BIRTH_WEIGHT_GRAMS` | Yes | — | Birth weight in grams (e.g. `3200`) |
| `BABY_GENDER` | No | `unspecified` | `female`, `male`, `other`, or `unspecified` |
| `TIMEZONE` | No | `Asia/Ho_Chi_Minh` | IANA timezone string |
| `AI_PROVIDER` | No | `openrouter` | AI provider identifier |
| `OPENROUTER_API_KEY` | Yes | — | OpenRouter API key |
| `OPENROUTER_MODEL` | No | `openrouter/auto` | Model ID (see above for free options) |
| `OPENROUTER_SITE_URL` | No | — | Your site URL (sent as HTTP-Referer) |
| `OPENROUTER_APP_NAME` | No | `Baby Reminder Bot` | App name sent in X-Title header |
| `TELEGRAM_BOT_TOKEN` | Conditional | — | Required when sending to Telegram |
| `TELEGRAM_CHAT_ID` | Conditional | — | Required when sending to Telegram |
| `ENABLE_TELEGRAM_SEND` | No | `false` | Set to `true` to enable Telegram sending |
| `DRY_RUN` | No | `true` | Set to `false` to actually send |

`TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are only required when both `ENABLE_TELEGRAM_SEND=true` and `DRY_RUN=false`.

---

## Running Locally

### Preview (no Telegram send)

```bash
pnpm run build
pnpm run preview
```

Or without building first (via tsx):
```bash
pnpm dev
```

This prints the generated JSON and the formatted Telegram message to console. No message is sent regardless of config.

### Send (or dry-run)

```bash
pnpm run build
pnpm run send
```

With `DRY_RUN=true` (default), the formatted message is printed to console and not sent to Telegram.

To actually send:
```env
ENABLE_TELEGRAM_SEND=true
DRY_RUN=false
```

### Type checking only

```bash
pnpm run lint
```

---

## GitHub Actions Setup

### 1. Add Secrets

In your GitHub repository go to **Settings → Secrets and variables → Actions → New repository secret** and add:

| Secret name | Value |
|---|---|
| `BABY_NAME` | Your baby's name |
| `BABY_BIRTH_DATE` | e.g. `2025-12-01` |
| `BABY_BIRTH_WEIGHT_GRAMS` | e.g. `3200` |
| `BABY_GENDER` | e.g. `female` |
| `OPENROUTER_API_KEY` | Your OpenRouter API key |
| `TELEGRAM_BOT_TOKEN` | Your Telegram bot token |
| `TELEGRAM_CHAT_ID` | Your Telegram chat ID |

### 2. Push the workflow

The workflow file is at `.github/workflows/weekly-baby-reminder.yml`. Once pushed to `main`, it will run automatically every Monday at 08:00 Asia/Ho_Chi_Minh (01:00 UTC).

### 3. Manual trigger

Go to **Actions → Weekly Baby Reminder → Run workflow** to trigger it manually at any time.

---

## Schedule

The workflow runs on:
```
cron: "0 1 * * 1"
```
This is Monday 01:00 UTC, which equals Monday 08:00 Asia/Ho_Chi_Minh.

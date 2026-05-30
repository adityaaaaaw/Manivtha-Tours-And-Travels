# AI Telugu News Summarization Assistant (తెలుగు న్యూస్ ఏఐ అసిస్టెంట్)

A production-level, full-stack digital newsroom AI workspace helper built with Next.js 15, TypeScript, Tailwind CSS, Framer Motion, and Gemini 1.5 Flash. 

This platform acts as an expert digital co-editor—helping editors and media teams at digital outlets (like *Namaste Telangana* or *Eenadu*) instantly convert long-form Telugu news articles into digital headlines, bullet takeaways, social briefs, and WhatsApp-ready summaries.

---

## ⚡ Core Features

- **Wire News Preset Loader**: Choose from 3 high-quality Telugu news presets (Politics, Technology, Sports) to instantly prefill and test the workspace in one click.
- **Advanced AI Tuning**: Custom slider selectors for 3 distinct summary lengths (Short, Medium, Detailed) and 4 editorial tones (Professional Journalistic, Simple/Accessible, Social Media, and Breaking News Alerts).
- **Simulated Newsroom Logs**: An active digital clock and a terminal console that prints real-time processing steps (e.g., parsing Telugu grammar, compiling social feeds) to maintain high-pressure news desk vibes.
- **7-in-1 Generated Editorial Suite**:
  1. *Suggested Headlines*: 3-5 punchy digital headlines.
  2. *Short Summary*: 1-2 sentence quick overview.
  3. *Detailed Summary*: 1-2 paragraphs of in-depth context.
  4. *Key Facts*: 4-6 bulleted facts.
  5. *Reader Highlights*: 3 quick-glance takeaways.
  6. *WhatsApp Brief*: Scannable mobile-formatted text with emojis.
  7. *Social Media Brief*: Structured promotional draft with story-specific hashtags.
- **Production Asset Controls**: Seamless click-to-copy clipboard integrations and download-as-TXT actions for all 7 cards.
- **Resilient Fallback Alert Banner**: A user-friendly alert box that catches invalid or missing API key exceptions and guides the developer step-by-step on how to solve them without crashing.

---

## 🛠️ Step-by-Step Local Setup Guide

Follow these steps to run the application locally on your computer:

### 1. Installation
In the project root, open your terminal and install the dependencies:
```bash
npm install
```

### 2. Configure the Gemini API Key
To communicate with the Generative AI engine, you need a free API key from Google AI Studio:

1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Log in with your Google account and click **Create API Key**.
3. Create a `.env.local` file in your project's root directory (if it does not exist already, you will see a preset template named `.env.local` created for you).
4. Open `.env.local` in your editor and replace `YOUR_API_KEY_HERE` with your actual Gemini API Key:
   ```env
   # Inside .env.local
   GEMINI_API_KEY=AIzaSyA12345...your_actual_key...
   ```

> [!IMPORTANT]
> **Git Protection**: The `.gitignore` file is automatically configured to ignore `.env.local`. Never commit your actual API keys to GitHub or public version control.

### 3. Start or Restart the Next.js Server
Once the key has been saved inside `.env.local`, start the Next.js development server:
```bash
npm run dev
```

If the Next.js development server was *already running* while you created or edited the `.env.local` file, **you must restart it** for Next.js to load the new environment variables:
1. In the terminal running the server, press `Ctrl + C` (or `Cmd + C` on Mac) and confirm with `Y` (if prompted) to stop the process.
2. Run the start command again:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:3000` to access your new workspace.

---

## 🚀 Verification & Production Builds

Before launching or deploying the application, verify that the project compiles with type-safe parameters:

```bash
npm run build
```

This compiles:
- The dashboard (`/`) as a highly-optimized static asset.
- The summarization route (`/api/summarize`) as a dynamic API router.

---

## 🌐 Vercel Deployment Guide

To deploy the application to Vercel for production access:

1. Push your project code to a private GitHub repository.
2. Import the repository into your [Vercel Dashboard](https://vercel.com/new).
3. Under the **Environment Variables** section, add:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: *Your actual Google Gemini API Key*
4. Click **Deploy**. Vercel will build the Next.js App Router and host the serverless endpoints securely.

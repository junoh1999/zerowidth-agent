v0-embed-zerowidth-agent

A simple chat widget built with React + Next.js, using a serverless function to connect to the ZeroWidth API. Easily deploy to Vercel and embed in a website (like Google Sites via iframe).
✨ Features

    React chat interface

    Serverless API proxy

    Environment variables for secrets

    CORS + error handling

    One-click deploy to Vercel

    Open source (MIT)

🛠 Project Structure

v0-embed-zerowidth-agent/
├── pages/
│   ├── index.js        # Chat UI
│   └── api/proxy.js    # Serverless proxy
├── .env.example        # Env variable template
├── package.json        # Project config
├── README.md           # This file
└── LICENSE             # MIT License

🚀 Quick Setup (in VS Code)
1. Clone this repo

git clone https://github.com/your-username/v0-embed-zerowidth-agent
cd v0-embed-zerowidth-agent

2. Install dependencies

npm install

3. Set up environment variables

Create a .env file (copy from .env.example) and fill in:

ZEROWIDTH_API_URL=your_zerowidth_flow_url
BEARER_TOKEN=your_zerowidth_token

4. Start the dev server

npm run dev

Visit http://localhost:3000
🌍 Deploy on Vercel

    Push code to GitHub

    Go to vercel.com, import your repo

    Set the same environment variables in Project Settings → Environment Variables

    Click Deploy

🔗 Embed in Google Sites (or any site)

Paste this into your site (replace with your deployed URL):

<iframe src="https://your-vercel-url.vercel.app" width="600" height="400"></iframe>

🧠 Tips

    Use npm run dev to test locally

    Edit pages/index.js to customize the UI

    Need help? Check out Vercel Docs or Next.js Docs

📄 License

MIT – use freely, modify as you like.

# 📈 Stockwise

Welcome to **Stockwise** – your all-in-one platform to study companies, track your investments, follow your favourite stocks, and more! This is a modern, cross-platform app built with [Nuxt 3](https://nuxt.com/), [Capacitor](https://capacitorjs.com/), and a sprinkle of serverless magic via [AWS Lambda / Netlify Functions](https://www.netlify.com/products/functions/).

Whether you're a developer, a curious contributor, or just someone who likes to poke around, this README will help you get up and running in no time. Let's dive in!

---

## 🚀 Features

- **Track stocks, forex, and cash investments**  
- **Follow companies and get the latest news**
- **Responsive, mobile-first design** (PWA, iOS, Android)
- **Serverless backend** with Netlify Functions
- **Authentication** (AWS Cognito, JWT)
- **Ad support** (AdMob integration)

---

## 🏗️ Tech Stack

- **Frontend:** Nuxt 3, Vue 3, Tailwind CSS, Pinia
- **Mobile:** Capacitor (iOS & Android)
- **Backend:** AWS Lambda / Netlify Functions (Node.js)
- **Database:** PostgreSQL (via `postgres` npm package)
- **Authentication:** AWS Cognito, JWT
- **Ads:** AdMob (Capacitor plugin)
- **Other:** PWA, Security headers

---

## 🗂️ Project Structure

- `/pages` – All the Nuxt pages (Vue files)
- `/store` – Pinia stores (state management)
- `/assets` – CSS, fonts, images
- `/public` – Static files (headers, redirects, etc.)
- `/functions` – Netlify serverless functions (API)
- `/android` & `/ios` – Capacitor native projects
- `/static` – Static files for PWA and app linking

---

## 🧑‍💻 Scripts

- `npm run dev` – Start Nuxt in dev mode
- `npm run build` – Build for production
- `npm run start` – Start the production server
- `npm run createdb_dev` – Set up the local database

---

## 🌐 API & Serverless

All backend logic lives in Netlify Functions.  
**API calls:**  
- Local: `http://localhost:3020/api/your-function`
- Production: `https://www.stockwise.app/api/your-function`

You can call these endpoints from the frontend using `fetch`.  
**Note:** For POST requests, always `JSON.stringify` your body!

---

## 🛡️ Security

- CORS headers are set in both `netlify.toml` and `public/_headers`
- Security module: `nuxt-security`
- JWT authentication for protected routes

## 🦄 Final Words

This project is built to be fun, fast, and friendly.  
Don't be afraid to poke around, break things, and make them better.  
Happy hacking! 🚀

---

**Stockwise** – _Invest in your knowledge, not just your portfolio._

**Enjoy!** 🎉

# starbound-dorado

<div align="center">

  <!-- Logo: smaller -->
  <img src="/src/assets/icons/taskigotchi.svg" width="150" />

  <!-- Spacer -->
  <br />

  <!-- Title: bigger -->
  <img src="/src/assets/icons/title.svg" width="500" />

</div>

An interactive pet that helps you complete your day to day tasks!

Taskigotchi is a web app that has you completing tasks like chores, homework, errands, studying and more! Set your to-do list and complete tasks to earn rewards for your pet. You can buy items like hats, collars, wallpapers, floors, and furniture for your pet! 


## Features

 - As you complete tasks earn badges and achievements to show your dedication!
 - Connect with friends and compete with streaks, points and outfits!


## Technologies Used

React + Vite.js

Node.js, Express

NeonDB + PostgreSQL


> Repo: `lnguyen14123/starbound-dorado`

**Frameworks & libraries**

* **React** with **Vite** for a fast, modern frontend dev setup
* **Tailwind CSS** for utility‑first styling
* **Node.js** with **Express** for the HTTP API/server
* **PostgreSQL** (hosted on **Neon**) for the database

### Why these choices

* **React + Vite**: instant dev server, minimal config, and a great DX when building interactive UIs.
* **Tailwind CSS**: keeps styles close to components, reduces context switching, and enforces a consistent design system.
* **Node.js + Express**: straightforward REST APIs, a huge ecosystem, and easy sharing of types/JS conventions across the stack.
* **PostgreSQL (Neon)**: reliable relational database, strong SQL support, and Neon provides serverless, developer‑friendly Postgres hosting.

---

## Features

* Complete tasks to earn badges and achievements
* Add friends and compete on streaks, points, and outfits
* Spend earned points on cosmetic items for your pet

---

## Project structure (high‑level)

```
root/
├─ public/              # Static assets
├─ src/                 # React app (components, pages, hooks, etc.)
├─ server/              # Express server and routes
├─ index.html           # Vite entry HTML
├─ package.json         # Root scripts and deps
├─ tailwind.config.js   # Tailwind setup
└─ vite.config.js       # Vite config
```

> Exact file names and folders may evolve. Check the repo for the latest layout.

---

## Getting started

### Prerequisites

* **Node.js** 18+ (20+ recommended)
* **npm** (or **pnpm**/**yarn**)
* A **PostgreSQL** database (we use **Neon**) and a connection string

### 1) Clone and install

```bash
# clone
git clone https://github.com/lnguyen14123/starbound-dorado.git
cd starbound-dorado

# install root deps
npm install

# (if the backend has its own package.json inside /server, install there too)
cd server && npm install && cd ..
```

### 2) Environment variables

Create a `.env` file where your server reads config (often `server/.env`). At minimum:

```
# Server
PORT=5173                 # or 3000/8080 — match your server script
NODE_ENV=development

# Database (Postgres)
DATABASE_URL=postgres://user:password@host:port/dbname
```

If you’re using **Neon**, copy the connection string from your Neon project and paste it into `DATABASE_URL`.

### 3) Database

* Make sure your Postgres instance is reachable from your dev machine.
* If the project includes migration tooling (e.g., Prisma, Knex, SQL files), run the migrations now. If not, provision tables as specified in the server code.

### 4) Run the app

Common script patterns (check `package.json` for exact names):

```bash
# start the frontend dev server (Vite)
npm run dev

# in a second terminal, start the API server (Express)
cd server && npm start
# or: npm run dev
```

The frontend dev server typically runs on `http://localhost:5173`. The API server often runs on `http://localhost:3000`.

---

## Configuration notes

* **Tailwind**: adjust the `content` globs in `tailwind.config.js` if you add new folders.
* **Vite**: update `vite.config.js` if you need custom aliases, proxying to the API, or environment handling.
* **API URL**: if the frontend calls the backend, define a `VITE_API_URL` in a `.env` (Vite uses `import.meta.env.VITE_*`). Example:

  ```
  VITE_API_URL=http://localhost:3000
  ```

---

## Deployment

* **Frontend**: build with `npm run build`, then host the static assets (Netlify, Vercel, Cloudflare Pages, etc.).
* **Backend**: deploy the Express server (Railway, Fly.io, Render, Heroku, or your own infra). Set `DATABASE_URL` and any required secrets.
* **Database**: provision PostgreSQL on **Neon** and allow network access from the backend environment.

---

## Scripts (typical)

> See `package.json` (and `server/package.json` if present) for the authoritative list.

* `dev`: start Vite in development
* `build`: production build of the frontend
* `preview`: preview the production build locally
* `start` (server): start the API
* `dev` (server): run the API with auto‑reload

---

## Contributing

1. Create a feature branch: `git switch -c feat/<name>`
2. Commit with clear messages
3. Open a PR with context and screenshots

---

## Acknowledgments

* React, Vite, Tailwind
* Node.js, Express
* PostgreSQL on Neon

---

## License

Add a LICENSE file (MIT is common) if you haven’t already.


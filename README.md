# ATS Resume – Interview Report Generator

A full-stack web app that compares your resume with a job description and generates an interview preparation report using a locally running AI model.

After signing in, you paste a job description, upload your resume (PDF) and write a short self description. The app returns:

- a **match score** (0–100) between your resume and the job
- **skill gaps** with a severity (low / medium / high)
- likely **technical** and **behavioral** interview questions, with why they are asked and how to answer
- a **day-by-day preparation plan**

The project has two parts:

| Folder      | What it is                                            | Runs on                 |
| ----------- | ----------------------------------------------------- | ----------------------- |
| `backend/`  | Express REST API, MongoDB, JWT auth, Ollama AI calls  | `http://localhost:3000` |
| `frontend/` | React single-page app built with Vite                 | `http://localhost:5173` |

For the tech stack, folder structure, request flows and data models, see [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## 1. Prerequisites

Install these before you start:

| Tool        | Version                 | Why it is needed                               | Check with       |
| ----------- | ----------------------- | ---------------------------------------------- | ---------------- |
| **Node.js** | 20.19+ or 22.12+ (LTS)  | Runs the backend and the Vite dev server       | `node -v`        |
| **npm**     | comes with Node.js      | Installs dependencies                          | `npm -v`         |
| **MongoDB** | Atlas (cloud) or local  | Stores users, logout tokens and reports        | –                |
| **Ollama**  | latest                  | Runs the `gemma3:4b` AI model on your machine  | `ollama -v`      |

> **Hardware note:** `gemma3:4b` needs about 4 GB of free RAM. On a laptop, generating one report can take anywhere from 20 seconds to a couple of minutes.

---

## 2. Get the code

```bash
git clone git@github.com:sikarvarsunil/ai-resume-analyzer.git
cd ai-resume-analyzer
```

The folder should look like this:

```
ai-resume-analyzer/
├── backend/
├── frontend/
├── README.md
└── ARCHITECTURE.md
```

---

## 3. Set up MongoDB

Pick **one** of the options below.

### Option A – MongoDB Atlas (cloud, free tier)

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Under **Database Access**, create a database user with a username and password.
3. Under **Network Access**, add your current IP address (or `0.0.0.0/0` for local testing only).
4. Click **Connect → Drivers** and copy the connection string. It looks like:

   ```
   mongodb+srv://<username>:<password>@<cluster-host>.mongodb.net/aptResume
   ```

   The part after the last `/` (`aptResume`) is the database name. MongoDB creates it automatically.

### Option B – Local MongoDB (macOS with Homebrew)

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

Your connection string will be:

```
mongodb://127.0.0.1:27017/aptResume
```

---

## 4. Set up Ollama and the AI model

1. Install Ollama from [ollama.com/download](https://ollama.com/download), or on macOS:

   ```bash
   brew install ollama
   ```

2. Start the Ollama server (skip this if the Ollama desktop app is already running):

   ```bash
   ollama serve
   ```

3. In a new terminal, download the model the backend uses:

   ```bash
   ollama pull gemma3:4b
   ```

4. Check that it works:

   ```bash
   ollama run gemma3:4b "Say hello"
   ```

The backend expects Ollama at `http://127.0.0.1:11434`, which is Ollama's default address.

---

## 5. Set up the backend

```bash
cd backend
npm install
```

### Create the environment file

Copy the sample file (skip this if `backend/.env` already exists, otherwise it will be overwritten):

```bash
cp env.sample .env
```

Open `backend/.env` and set these values:

| Variable       | Required | Default                  | Description                                                       |
| -------------- | -------- | ------------------------ | ----------------------------------------------------------------- |
| `MONGO_URI`    | Yes      | –                        | MongoDB connection string from step 3                             |
| `TOKEN`        | Yes      | –                        | Secret used to sign login tokens (JWT). Use a long random string. |
| `PORT`         | No       | `3000`                   | Port the API listens on                                           |
| `OLLAMA_HOST`  | No       | `http://127.0.0.1:11434` | Address of the Ollama server                                      |
| `OLLAMA_MODEL` | No       | `gemma3:4b`              | Ollama model used to generate reports (run `ollama pull` for it)  |

> If you change `PORT`, also change the proxy target in `frontend/vite.config.js`, otherwise the frontend can't reach the API.

Generate a strong secret for `TOKEN` with:

```bash
openssl rand -hex 32
```

Example `backend/.env`:

```bash
export MONGO_URI=mongodb://127.0.0.1:27017/aptResume
export TOKEN=paste-the-output-of-openssl-rand-here
```

> Never commit `.env` to git. It contains your database password and signing secret.

### Start the backend

```bash
npm run dev
```

You should see:

```
server is starting on 3000
connect to the DB
```

The server restarts automatically when you edit backend files (via `nodemon`).

---

## 6. Set up the frontend

Open a **new terminal** (keep the backend running):

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints, normally [http://localhost:5173](http://localhost:5173).

The frontend has no `.env` file. During development, Vite forwards every request that starts with `/api` to `http://localhost:3000` (see `frontend/vite.config.js`), so the browser only ever talks to `localhost:5173`.

---

## 7. Use the app

1. Go to [http://localhost:5173](http://localhost:5173). You will be sent to **Login**.
2. Click **Register** and create an account (username, email, password).
3. On the Home page:
   - paste the **job description**
   - upload your **resume** as a PDF (max **3 MB**)
   - write a short **self description**
4. Click **Generate interview report** and wait. The button shows "Generating report..." while the AI works.
5. The report appears below the form, and the page scrolls to it.

---

## 8. Summary: what must be running

You need **three** things running at the same time:

| # | Process          | Command                             | Address                  |
| - | ---------------- | ----------------------------------- | ------------------------ |
| 1 | Ollama           | `ollama serve` (or the desktop app) | `http://127.0.0.1:11434` |
| 2 | Backend          | `cd backend && npm run dev`         | `http://localhost:3000`  |
| 3 | Frontend         | `cd frontend && npm run dev`        | `http://localhost:5173`  |

MongoDB must also be reachable, either Atlas in the cloud or a local service.

---

## 9. Available scripts

### Backend (`backend/`)

| Command       | What it does                                     |
| ------------- | ------------------------------------------------ |
| `npm run dev` | Starts the API with `nodemon` (auto-restart)     |
| `npm test`    | Runs the backend tests with Node's built-in test runner |

### Frontend (`frontend/`)

| Command              | What it does                                         |
| -------------------- | ---------------------------------------------------- |
| `npm run dev`        | Starts the Vite dev server with hot reload           |
| `npm run build`      | Builds a production bundle into `frontend/dist/`     |
| `npm run preview`    | Serves the production build locally                  |
| `npm run lint`       | Runs ESLint on the frontend code                     |
| `npm test`           | Runs the frontend tests once with Vitest             |
| `npm run test:watch` | Re-runs the frontend tests when files change         |

### Tests

Neither test suite needs MongoDB, Ollama or a `.env` file, so you can run them on a fresh clone:

```bash
cd backend && npm test
cd frontend && npm test
```

- **Backend** (`backend/tests/`): calls the real Express app over HTTP, with the database models, the PDF parser and the Ollama client replaced by test doubles. Covers auth (register, login, logout, get-me), report creation and history, rate limits, config and the AI response validation.
- **Frontend** (`src/**/*.test.js(x)`, next to the code they test): Vitest, React Testing Library and jsdom. Covers the API client's error handling, the `useApi` hook, the auth provider and route guards, the Register form, resume validation and logout on the Home page, and the report view. Submitting a report is only tested on the backend.

---

## 10. Troubleshooting

| Problem | Likely cause and fix |
| ------- | -------------------- |
| Backend crashes with `MONGO_URI is not defined` or `TOKEN is not defined` | `backend/.env` is missing or a variable is empty. Redo step 5. |
| `DB error ... ECONNREFUSED` or `bad auth` | MongoDB is not running, the connection string is wrong, or (Atlas) your IP is not in Network Access. |
| Red alert on the Home page: `fetch failed` or `ECONNREFUSED 127.0.0.1:11434` | Ollama is not running. Run `ollama serve`. |
| Red alert: `model "gemma3:4b" not found` | Run `ollama pull gemma3:4b`. |
| Red alert: `The request timed out` | The model took more than 2 minutes. Try again (the first request is slower while the model loads) or use a shorter resume/job description. |
| Red alert: `Invalid AI response` | The model returned JSON in the wrong shape. Submit again. Small local models occasionally produce bad output. |
| Red alert: `Unable to reach the server` | The backend is not running on port 3000. |
| Keeps redirecting to Login | Your session expired (tokens last 1 day) or you logged out. Log in again. |
| `Error: listen EADDRINUSE :::3000` | Another process is using port 3000. Stop it with `lsof -ti:3000 \| xargs kill`. |
| Resume upload rejected | The file must be a PDF and smaller than 3 MB. |
| Red alert: `Too many failed login attempts`, `Too many accounts created` or `limit of 10 reports per hour` | A rate limit was hit. Wait for the time shown, or restart the backend to reset the counters during development. |

---

## 11. TODO

Planned improvements, roughly in priority order.

### Security

- [x] Stop tracking `backend/.env` in git. It is now listed in `backend/.gitignore`.
- [x] Rotate the `TOKEN` secret and remove the unused Google API key from `backend/.env`.
- [ ] Change the MongoDB Atlas database user's password (Atlas → **Database Access**) and update `MONGO_URI` in `backend/.env`. The old password is still in the git history.
- [ ] Revoke the old Google API key in the Google Cloud / AI Studio console. It is still in the git history.
- [x] Change logout from `GET` to `POST` so it can't be triggered by a cross-site link.
- [x] Add rate limiting to the login, register and report endpoints (see [ARCHITECTURE.md](./ARCHITECTURE.md#rate-limits)).
- [ ] Before deploying behind a reverse proxy, set `app.set("trust proxy", 1)` so rate limits use the real client IP, and switch to a shared store (for example Redis) if you run more than one server instance.

### Backend

- [x] Move the port, Ollama host and model name to `.env` (`PORT`, `OLLAMA_HOST`, `OLLAMA_MODEL`).
- [x] Add a TTL index to the token blacklist so expired tokens are deleted automatically.
- [x] Return `404` from `get-me` when the user no longer exists instead of crashing.
- [x] Add endpoints to list and view past reports (`GET /api/interview`, `GET /api/interview/:id`).
- [ ] Add pagination to `GET /api/interview` once users have many reports.

### Frontend

- [ ] Add a "My reports" page that uses `GET /api/interview` and `GET /api/interview/:id`.
- [ ] Add a frontend test for submitting a report (easiest if `Home.jsx` keeps the uploaded file in state instead of reading it back from the form).

### Project

- [x] Add automated tests for the backend and frontend (see [Tests](#tests)).
- [ ] Run both test suites and the frontend lint in CI (for example GitHub Actions) on every push.
- [ ] Add a production setup: serve `frontend/dist` from Express or put both behind a reverse proxy such as Nginx.
- [x] Remove committed `.DS_Store` files and ignore them with a root `.gitignore`.

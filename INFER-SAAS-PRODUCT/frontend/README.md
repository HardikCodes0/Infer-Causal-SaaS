<div align="center">

<br/>

```
██╗███╗   ██╗███████╗███████╗██████╗
██║████╗  ██║██╔════╝██╔════╝██╔══██╗
██║██╔██╗ ██║█████╗  █████╗  ██████╔╝
██║██║╚██╗██║██╔══╝  ██╔══╝  ██╔══██╗
██║██║ ╚████║██║     ███████╗██║  ██║
╚═╝╚═╝  ╚═══╝╚═╝     ╚══════╝╚═╝  ╚═╝
```

### **Causal Inference SaaS Platform**
*From raw experiment data to AI-powered business decisions — in seconds.*

<br/>

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Groq](https://img.shields.io/badge/Groq-Llama--3-F55036?style=for-the-badge&logo=meta&logoColor=white)](https://groq.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<br/>

> **The problem:** Product managers finish an A/B test and wait days for a data scientist to write a one-off script.
> **Infer fixes that.** Upload your CSV, get statistically rigorous results, and ask the AI why it matters — all without writing a single line of code.

<br/>

</div>

---

## 📖 Table of Contents

- [What is Infer?](#-what-is-infer)
- [Sample AI Output](#-sample-ai-output)
- [Core Features](#-core-features)
- [Statistical Methods](#-statistical-methods)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Sample Output](#-sample-output)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)

---

## 🧠 What is Infer?

**Infer** is a full-stack A/B testing and causal inference platform that automates the entire "data-to-decision" pipeline for experiment analysis.

Most teams either:
- (a) Wait for a data scientist to manually run stats in a notebook, or
- (b) Use oversimplified tools that only run a basic t-test

**Infer does neither.** It runs a full suite of industry-standard statistical techniques simultaneously — CUPED variance reduction, CATE segmentation, Sequential Testing, and Bayesian inference — and then an AI layer interprets all of it in plain English, tailored to your specific data.

```
CSV Upload  →  Validation + SRM Check  →  Stats Engine  →  AI Interpreter  →  Actionable Insight
```

---

## 🤖 Sample AI Output

> *"The feature produced a statistically significant +4.8% lift in conversion rate (p=0.003, 95% CI: [+2.1%, +7.5%]). However, the CATE analysis reveals this effect is primarily driven by **new users** (+9.2% lift), while existing users showed a slight negative regression (−1.4%, not significant). Recommend a **targeted rollout to new users only** before a full launch."*

---

## ✨ Core Features

### 📊 Advanced Statistical Engine
A Python/FastAPI backend that runs six statistical analyses simultaneously on your experiment data.

### 🤖 AI Interpreter ("Stats-to-English")
Powered by **Groq/Llama-3**, the AI doesn't just summarize results — it understands your specific experiment context and answers follow-up questions like *"Should I ship this?"* or *"Why was SRM triggered?"*

### 📈 Interactive Dashboard
Built with React + Recharts. Visualizes confidence intervals, treatment effect distributions, and CATE segment performance.

### 🗂️ Experiment History
SQLite-backed persistence. Every analysis is saved, searchable, and revisitable. Rename, compare, or export past experiments.

### 📄 PDF Export
One-click professional report generation — executive-ready summary of your entire analysis.

### 🔐 JWT Authentication
Secure multi-user access with password hashing via Passlib.

---

## 📐 Statistical Methods

| Method | What It Does | Why It Matters |
|--------|-------------|----------------|
| **ATE** (Average Treatment Effect) | Measures the direct causal impact of the treatment | Core experiment result |
| **CUPED** (Controlled-experiment Using Pre-Experiment Data) | Reduces metric variance using pre-experiment covariates | Faster significance with smaller sample sizes |
| **CATE** (Conditional Average Treatment Effect) | Segments results by user attributes to find heterogeneous effects | Reveals "it works for X but not Y" insights |
| **Sequential Testing (SPRT)** | Wald's Sequential Probability Ratio Test for early stopping | Stop experiments early without inflating Type I error |
| **Bayesian Inference** | Produces probabilistic outputs (P(treatment > control)) | Intuitive confidence levels beyond p-values |
| **SRM Detection** | Chi-square test on assignment ratios | Flags broken randomization before you trust the results |

---

## 🛠️ Tech Stack

```
┌─────────────────────────────────────────────────────────┐
│                        FRONTEND                         │
│   React 18 · Tailwind CSS · Recharts · Lucide Icons     │
│   Craco (CRA config override) · Axios                   │
├─────────────────────────────────────────────────────────┤
│                         BACKEND                         │
│   Python 3.11+ · FastAPI · Pandas · NumPy · SciPy      │
│   Passlib · Python-Jose (JWT)                           │
├─────────────────────────────────────────────────────────┤
│                       DATABASE                          │
│   SQLite · SQLAlchemy ORM                               │
├─────────────────────────────────────────────────────────┤
│                       AI LAYER                          │
│   Groq API · Llama-3 70B / 8B                           │
└─────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
Infer-Causal-SaaS/
│
├── causal-inference-engine/        # Python backend
│   ├── main.py                     # FastAPI app, routes, JWT auth
│   ├── stats_engine.py             # All statistical logic (ATE, CUPED, CATE, etc.)
│   ├── ai_interpreter.py           # Groq/Llama integration
│   ├── database.py                 # SQLite models & ORM setup
│   └── requirements.txt
│
├── INFER-SAAS-PRODUCT/
│   └── frontend/                   # React application
│       ├── src/
│       │   ├── components/
│       │   │   ├── Dashboard/      # Main analysis dashboard
│       │   │   ├── Charts/         # Recharts visualizations
│       │   │   ├── AIChat/         # AI interpreter chat interface
│       │   │   ├── History/        # Experiment history panel
│       │   │   └── Auth/           # Login / signup
│       │   ├── App.jsx
│       │   └── index.js
│       ├── package.json
│       └── tailwind.config.js
│
├── start_project.bat               # One-click local dev startup (Windows)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- A [Groq API key](https://console.groq.com) (free tier available)

### 1. Clone the repository

```bash
git clone https://github.com/HardikCodes0/Infer-Causal-SaaS.git
cd Infer-Causal-SaaS
```

### 2. Backend Setup

```bash
cd causal-inference-engine

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Add your GROQ_API_KEY and JWT_SECRET_KEY to .env

# Start the API server
uvicorn main:app --reload --port 8000
```

The API will be live at `http://localhost:8000`
Interactive docs at `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
cd INFER-SAAS-PRODUCT/frontend

# Install dependencies
npm install

# Start the dev server
npm start
```

The app will open at `http://localhost:3000`

### 4. One-Click Startup (Windows)

If you're on Windows, just double-click:

```
start_project.bat
```

This boots both the backend and frontend simultaneously.

---

## 🔌 API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register` | `POST` | Register a new user |
| `/auth/login` | `POST` | Login and receive JWT token |
| `/analyze` | `POST` | Upload CSV and run full analysis |
| `/history` | `GET` | Fetch all past experiments |
| `/history/{id}` | `GET` | Fetch a specific experiment result |
| `/history/{id}` | `DELETE` | Delete an experiment |
| `/ai/ask` | `POST` | Ask the AI a follow-up question about an experiment |

> Full interactive API documentation available at `/docs` when the backend is running.

### Example Request: `/analyze`

```json
POST /analyze
Authorization: Bearer <token>

{
  "experiment_name": "Checkout Button Color Test",
  "metric": "conversion_rate",
  "pre_experiment_metric": "past_30d_conversion"
}
```
*(CSV file uploaded as multipart form data)*

### Example Response

```json
{
  "ate": {
    "effect": 0.048,
    "p_value": 0.003,
    "ci_lower": 0.021,
    "ci_upper": 0.075,
    "significant": true
  },
  "cuped_effect": 0.051,
  "srm_detected": false,
  "bayesian": {
    "prob_treatment_better": 0.981
  },
  "cate_segments": [
    { "segment": "new_user", "effect": 0.092, "significant": true },
    { "segment": "returning_user", "effect": -0.014, "significant": false }
  ],
  "sequential_test": {
    "can_stop_early": true,
    "llr": 4.72
  },
  "ai_summary": "The feature produced a statistically significant +4.8% lift..."
}
```

---

## 📊 Sample Output

### What a valid CSV should look like

```csv
user_id,variant,conversion,revenue,pre_experiment_conversion
u001,control,0,0.00,0
u002,treatment,1,29.99,1
u003,control,0,0.00,0
u004,treatment,1,49.99,0
...
```

**Required columns:** `user_id`, `variant` (control/treatment), at least one metric column.

**Optional but recommended:** A pre-experiment metric column for CUPED variance reduction.

---

## 🗺️ Roadmap

- [x] ATE, CUPED, CATE, SPRT, Bayesian, SRM
- [x] Groq/Llama-3 AI interpretation
- [x] Experiment history with SQLite
- [x] PDF export
- [x] JWT authentication
- [ ] Multi-metric analysis (analyze conversion AND revenue simultaneously)
- [ ] Experiment comparison view (A vs B vs C)
- [ ] Slack/email alerts for significant results
- [ ] Cloud deployment (Docker + Railway/Render)
- [ ] CSV template generator

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 👤 Author

**Hardik**
- GitHub: [@HardikCodes0](https://github.com/HardikCodes0)
- LinkedIn: [Connect with me](https://linkedin.com/in/) *(update link)*

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

*Built to replace the "waiting for a data scientist" bottleneck in experiment analysis.*

⭐ **Star this repo if you found it useful** ⭐

</div>

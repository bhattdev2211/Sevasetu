# SevaSetu (સેતુ) — HTML, CSS, JavaScript & Python Web Application

A full-stack implementation of the SevaSetu community support platform built using standard **HTML5**, **CSS3**, modern **vanilla JavaScript**, and a **Python** backend.

---

## 🚀 Running the Python Application

### Option 1: Zero-Dependency Standard Python (Recommended)
This requires **zero** external pip packages. It uses Python's built-in `http.server`:

```bash
# From repository root or sevasetu_python folder:
python app.py
```
Or specify a custom port:
```bash
python server.py 5000
```

Open your browser at: **`http://localhost:5000/`**

---

### Option 2: Run with Flask
If you prefer running with Flask:

```bash
# Install Flask
pip install -r requirements.txt

# Run with Flask
python flask_app.py
```

---

## 📁 Architecture & File Structure

```
sevasetu_python/
├── app.py                      # Smart launcher (auto-detects Flask or standard server)
├── server.py                   # Zero-dependency standard library HTTP & REST server
├── flask_app.py                # Full Flask application
├── requirements.txt            # Python dependencies (Flask>=3.0.0)
├── data/
│   ├── seed_data.py            # Initial seed dataset (personas, food, blood, ledger)
│   ├── db.py                   # Data persistence manager
│   └── data.json               # Auto-generated JSON database (persists changes)
├── templates/                  # Semantic HTML5 Templates
│   ├── index.html              # Landing page with live metrics
│   ├── dashboard.html          # Interactive live dashboard & persona switcher
│   ├── food.html               # FoodShare donation & volunteer pickup marketplace
│   ├── blood.html              # BloodConnect emergency board & donor registry
│   ├── funds.html              # CommunityFunds open ledger & contribution portal
│   ├── login.html              # Multi-persona & email login
│   ├── register.html           # User registration
│   └── profile.html            # User profile & personal impact metrics
└── static/
    ├── css/
    │   └── style.css           # Complete responsive stylesheet & design tokens
    └── js/
        ├── api.js              # REST API client
        ├── app.js              # Header, popovers, toasts, modals & global state
        ├── food.js             # FoodShare page logic
        ├── blood.js            # BloodConnect page logic
        ├── funds.js            # CommunityFunds page logic
        ├── dashboard.js        # Dashboard page logic
        └── auth.js             # Login, registration, and profile logic
```

---

## 🌐 Features & REST API Endpoints

### 🍲 FoodShare
* `GET /api/food` — Get all food donation listings
* `POST /api/food` — Post surplus food with pickup deadline & portions
* `POST /api/food/claim` — Volunteer claim with arrival estimate
* `POST /api/food/complete` — Mark donation as delivered to shelter

### 🩸 BloodConnect
* `GET /api/blood/requests` — Open emergency blood requests
* `POST /api/blood/requests` — Broadcast new emergency blood requirement
* `POST /api/blood/requests/fulfill` — Mark requirement as solved
* `GET /api/blood/donors` — Voluntary donor directory
* `POST /api/blood/donors` — Register as voluntary blood donor
* `POST /api/blood/donors/toggle` — Toggle donor active/offline status

### 🪙 CommunityFunds
* `GET /api/funds` — Retrieve open transactions & balance
* `POST /api/funds/transaction` — Record verified expense or donation
* `POST /api/funds/contribute` — Simulate online/UPI contribution
* `GET /api/funds/export-csv` — Download complete public ledger as `.csv`

### 👤 Personas & Authentication
* `GET /api/auth/me` — Current logged-in user
* `POST /api/auth/persona` — Switch testing persona with 1-click
* `POST /api/auth/login` — Email login
* `POST /api/auth/register` — Create account with role & city
* `POST /api/reset` — Reset all data back to initial seed defaults


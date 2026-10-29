# SevaSetu (સેવા સેતુ) — Community Help and Giving Platform

**SevaSetu** represents service, connection, generosity, trust, and community support. It is a full-stack web application built with **HTML5, modern CSS3, vanilla JavaScript (ES6+), and a Python 3 backend** (supporting both Flask and zero-dependency standard library mode).

---

## 🌟 Key Modules & Features

### 1. 🍲 FoodShare (Surplus Food Rescue & Distribution)
- **Donation Management:** Post surplus cooked meals, bakery products, raw ration kits, and packaged snacks with preparation timestamps and strict pickup deadlines.
- **Volunteer Coordination:** Volunteers can review food details, request pickup, and provide estimated arrival times.
- **Donor Governance:** Donors can review incoming pickup requests (Approve or Decline), edit active listing details, or cancel listings if collected locally.
- **Food Safety Standards:** Built-in hygiene reminders emphasizing distribution within 4-6 hours and clean container protocols.
- **Status Lifecycle:** `Available` ➔ `Requested` ➔ `Approved` ➔ `Completed` (or `Cancelled`).

### 2. 🩸 BloodConnect (Emergency Voluntary Blood Network)
- **Life Support Notice:** Prominent emergency banner directing immediate life-threatening cases to hospital blood banks and **108 / 112**.
- **Urgent Requests:** Broadcast emergency blood requirements with patient name, required units, hospital, and urgency level (`Critical`, `Urgent`, `Needed today`).
- **Consent-Gated Contact Privacy:** Donor phone numbers are masked by default to prevent spam. Requesters must submit their hospital reason through an auditable consent workflow before contact details are revealed.
- **Voluntary Donor Directory:** Filter donors by city and blood group (`O+`, `O-`, `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`).
- **Donor Autonomy:** Donors can toggle their status (`Ready to Donate` / `On Hold`) or withdraw availability at any time.
- **Compatibility Matrix:** Interactive blood compatibility chart.

### 3. 🛡️ CommunityFunds (Transparent Public Treasury & Groups)
- **Community Groups:** Create or join dedicated neighborhood relief circles (e.g. *Rajkot Disaster & Relief Circle*, *Saurashtra Annakshetra*).
- **100% Auditable Ledger:** Every single rupee received or disbursed is documented with an immutable receipt ID (e.g. `REC-2026-8842`), category tag, and recorded steward.
- **Financial Integrity:** Backend enforces strictly positive amounts (`amount > 0`), preventing negative or corrupting records.
- **Role-Based Governance:** Any supporter can contribute income; only authorized stewards (NGO Organizers, Treasurers, Admins) can log program expenditures.
- **Visual Analytics:** Real-time expense category progress bars and monthly trends.
- **Instant CSV Export:** Download the entire ledger as a CSV file for offline auditing.

### 4. 👤 Authentication, Personas & Security
- **One-Click Test Personas:** Seamlessly switch between pre-configured community roles (Volunteer, Food Donor, Blood Coordinator, NGO Organizer) without page refresh.
- **Profile Updates with Field Protection:** Permitted profile details (name, phone, city, organization) persist to the database. Protected fields (`role`, `id`, `email`) cannot be modified by user edits to preserve governance integrity.
- **Password Reset:** Functional reset workflow providing simulated verification tokens and notifications.

---

## 🚀 Running the Project

### Prerequisites
- Python 3.10+ (Tested on Python 3.14.7)

### Option 1: Quick Launch (Zero-dependency Standard Library)
You do not even need to install Flask or any pip packages! Run directly with Python's built-in standard library:
```bash
# From project root:
py app.py
# Or on Windows:
run.bat
```
Open **`http://localhost:5000/`** in your browser.

### Option 2: Run with Flask
```bash
pip install -r requirements.txt
py app.py
```
Open **`http://localhost:5000/`** in your browser.

---

## 🧪 Automated Testing

A test suite verifying all 14 database operations, security checks, and REST routes is included in `test_app.py`:

```bash
py test_app.py
```

### Verified Test Cases:
1. `test_01_summary_and_personas`: Summary metrics & persona structure.
2. `test_02_profile_update_security`: Protection of roles & IDs against unauthorized alteration.
3. `test_03_password_reset`: Password reset workflow and notification dispatch.
4. `test_04_food_workflow`: Creation, edit, claim, donor review, completion.
5. `test_05_food_cancellation`: Cancellation workflow.
6. `test_06_blood_workflow`: Emergency blood requests, fulfillment, cancellation.
7. `test_07_blood_donor_and_consent`: Donor registration, toggle, and consent-gated contact reveal.
8. `test_08_community_funds_and_groups`: Community groups, positive amount validation, calculations.
9. `test_page_routes`: All 10 HTML page routes return HTTP 200.
10. `test_404_handler`: Custom 404 page handler.
11. `test_api_initial_data`: Initial data payload.
12. `test_api_auth_profile_update`: Profile updates via REST.
13. `test_api_funds_validation`: Rejection of negative / zero transaction amounts (HTTP 400).
14. `test_api_funds_export_csv`: Live CSV export.

---

## 📁 Project Architecture

```
SevaSetu/
├── app.py                      # Root launcher (auto-routes to sevasetu_python)
├── requirements.txt            # Minimal requirements (Flask>=3.0.0)
├── run.bat                     # Windows execution helper
├── test_app.py                 # Comprehensive automated test suite
├── README.md                   # Project documentation
├── .gitignore                  # Git ignore rules for clean repository
├── sevasetu_netlify/           # 🌐 Standalone HTML/CSS/JS version for Netlify deployment
│   ├── index.html              # Landing page (relative assets & routing)
│   ├── dashboard.html          # Dashboard page
│   ├── food.html               # FoodShare page
│   ├── blood.html              # BloodConnect page
│   ├── funds.html              # CommunityFunds page
│   ├── profile.html            # Profile page
│   ├── login.html              # Login & Persona switcher page
│   ├── register.html           # Registration page
│   ├── about.html              # About page
│   ├── help.html               # Help page
│   ├── 404.html                # 404 page
│   ├── _redirects              # Netlify SPA & clean URLs configuration
│   ├── netlify.toml            # Netlify deployment and security configuration
│   ├── README.md               # Netlify deployment guide
│   ├── css/style.css           # Styling
│   ├── img/                    # SVG logo and favicon
│   └── js/                     # Client-side localStorage API & page scripts
└── sevasetu_python/            # 🐍 Full-stack Python application (Flask & Stdlib)
    ├── app.py                  # Smart launcher (auto-detects Flask or stdlib)
    ├── flask_app.py            # Flask web application & REST routes
    ├── server.py               # Zero-dependency Python HTTP server & REST routes
    ├── data/
    │   ├── db.py               # Thread-safe database manager & business logic
    │   ├── seed_data.py        # Default demo records & community groups
    │   └── data.json           # Persistent JSON storage file
    ├── static/
    │   ├── css/
    │   │   └── style.css       # Design tokens, responsive layouts, components
    │   ├── img/
    │   │   ├── logo.svg        # Scalable SVG brand logo (Bridge & Caring Hands)
    │   │   └── favicon.svg     # Geometric favicon
    │   └── js/
    │       ├── api.js          # REST API client
    │       ├── app.js          # Global app state, toasts, navigation, modal helpers
    │       ├── auth.js         # Authentication, persona switching, profile updates
    │       ├── dashboard.js    # Operational dashboard, live activity & notifications
    │       ├── food.js         # FoodShare listing, claiming, editing & donor review
    │       ├── blood.js        # BloodConnect requests, donor consent contact workflow
    │       └── funds.js        # CommunityFunds multi-group, ledger, charts & CSV export
    └── templates/
        ├── index.html          # Landing page with service pillars & guarantees
        ├── dashboard.html      # Authenticated community command dashboard
        ├── food.html           # FoodShare surplus rescue interface
        ├── blood.html          # BloodConnect emergency voluntary network
        ├── funds.html          # CommunityFunds public treasury & group ledger
        ├── profile.html        # User profile, role badges & personal impact tracker
        ├── login.html          # Sign-in & instant persona switcher
        ├── register.html       # Member registration with role & city selection
        ├── about.html          # Mission, vision, and core values
        ├── help.html           # FAQs, food safety guidelines & emergency hotlines
        └── 404.html            # User-friendly page not found template
```

---

## 🎓 College Demonstration Guide

1. **Brand & Design:** Open `http://localhost:5000/`. Highlight the new SVG logo ("Bridge of Giving"), responsive navigation, and module cards.
2. **Dashboard & Personas:** Navigate to `/dashboard`. Use the persona bar to switch between *Priya Sharma (Volunteer)*, *Rajesh Patel (Food Donor)*, *Dr. Ananya Mehta (Blood Coordinator)*, and *Vikramjit Singh (NGO Organizer)*. Show how greetings, permissions, and activities update immediately.
3. **FoodShare Rescue:** Navigate to `/food`. Click `+ Post Food Donation` to add a new listing. Switch to another persona and click `Request Pickup / Claim`. Demonstrate the donor approval and completion flow.
4. **Emergency Blood Network:** Navigate to `/blood`. Point out the emergency disclaimer (`108 / 112`). Show masked donor contact numbers. Click `Request Contact` to show the consent-gated reveal workflow.
5. **Community Funds:** Navigate to `/funds`. Select individual community groups (*Rajkot Disaster & Relief Circle*, *Saurashtra Annakshetra*). Click `Support Community Drive` to add a contribution. Show how the balance recalculates and appears with a receipt ID in the ledger. Click `Export CSV`.
6. **Profile:** Navigate to `/profile`. Click `Edit Profile Details`, change phone/organization, click `Save Changes`. Notice the update persists without allowing changes to protected system roles.

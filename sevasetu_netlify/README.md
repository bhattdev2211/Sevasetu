# 🌐 SevaSetu — Standalone HTML/CSS/JS Web Application for Netlify

> **SevaSetu (સેવાસેતુ) — Community Help and Giving Platform**
> A 100% self-contained, pure frontend web application crafted with **HTML5, Modern Vanilla CSS, and JavaScript (ES6+)**.
> Requires **zero backend servers, zero Node.js build steps, and zero runtime dependencies**.

---

## 🚀 How to Deploy on Netlify (in 30 seconds)

### Method 1: Instant Drag & Drop (Recommended)
1. Visit **[Netlify Drop](https://app.netlify.com/drop)** in your browser (log in or sign up for free).
2. Drag and drop this entire `sevasetu_netlify` folder directly into the upload area on Netlify.
3. Within 10–20 seconds, Netlify will generate your live HTTPS link (e.g. `https://sevasetu-community.netlify.app`).
4. Your application is instantly live, fully interactive, and ready for demonstrations!

### Method 2: Deploy via Git Repository
1. Push this folder to a GitHub, GitLab, or Bitbucket repository.
2. Go to **Netlify Dashboard** → **Add new site** → **Import an existing project**.
3. Select your repository.
4. Set:
   - **Base directory:** `sevasetu_netlify` (or root if this folder is the repository root)
   - **Build command:** *(leave empty)*
   - **Publish directory:** `.` (or `sevasetu_netlify`)
5. Click **Deploy Site**. Every `git push` will automatically update your live site!

### Method 3: Deploy via Netlify CLI
```bash
# In this directory
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=.
```

---

## 💻 Local Testing (Without Any Server)

You can also run SevaSetu completely offline without installing anything:

1. **Directly in Browser:** Double-click [`index.html`](./index.html) to open it in Chrome, Edge, Firefox, or Safari (`file:///` protocol works 100%).
2. **With any static server (optional):**
   ```bash
   # Using Python:
   python -m http.server 8000
   # Using Node.js:
   npx serve .
   ```

---

## 📁 Project Structure

```text
sevasetu_netlify/
├── _redirects             # Netlify clean URLs & 404 routing configuration
├── netlify.toml           # Netlify security headers and routing rules
├── README.md              # Deployment guide and documentation
│
├── index.html             # Landing page with hero counters, mission & pillars
├── dashboard.html         # Live authenticated user operational dashboard
├── food.html              # FoodShare surplus meals directory & claim workflow
├── blood.html             # BloodConnect donor directory & emergency requests
├── funds.html             # CommunityFunds transparent ledger & CSV export
├── profile.html           # User account profile view & editable settings
├── login.html             # Persona switcher & authentication sign-in
├── register.html          # New volunteer / community member registration
├── about.html             # Platform mission, impact metrics, team & values
├── help.html              # Safety guidelines, verification rules & FAQ
├── 404.html               # Custom branded 404 Not Found error page
│
├── css/
│   └── style.css          # Cohesive brand design system (Teal & Deep Navy)
│
├── img/
│   ├── logo.svg           # Scalable SVG brand logo with bridge/giving hands symbol
│   └── favicon.svg        # Clean browser favicon icon
│
└── js/
    ├── api.js             # Standalone client-side database & persistent engine (localStorage)
    ├── app.js             # Global navigation, notifications, toasts & persona menu
    ├── auth.js            # Login, registration, and user profile manager
    ├── dashboard.js       # Activity feeds, notification center & metric counters
    ├── food.js            # Food donation listing, claim modal, status tracker
    ├── blood.js           # Blood group filter, consent contact reveal & requests
    └── funds.js           # Public treasury, INR formatters, categories & CSV export
```

---

## ✨ Features Included

### 1. 🍲 FoodShare
- Browse active food donations with vegetarian/non-vegetarian tags and freshness countdowns.
- Filter by city (Rajkot, Ahmedabad, Surat, Vadodara) and meal category.
- Post new food donations with pickup locations and donor contacts.
- Volunteer pickup request workflow with donor approval or cancellation.

### 2. 🩸 BloodConnect
- Emergency blood requests with urgency badges (Critical / Urgent / Normal).
- Blood group compatibility helper and donor filter.
- **Privacy-first donor discovery:** Voluntary donor phone numbers are masked by default. Contact numbers are safely revealed only through an auditable consent workflow with WhatsApp / direct calling integration.
- Prominent emergency safety warning directing life-threatening cases to hospital blood banks or 108 emergency services.

### 3. 🛡️ CommunityFunds
- 100% publicly auditable relief treasury with unique receipt IDs (`REC-...`).
- Live calculation of total income, expenses, and net balance in Indian Rupees (₹ INR).
- Category breakdowns (Ration Relief, Medical Aid, Education Support, Community Kitchen, Logistics).
- Monthly spending analysis.
- One-click **Export Ledger to CSV** running completely in-browser without any server.
- Community group creation and membership joining.

### 4. 👤 Authentication & Personas
- Quick-switch between 4 realistic community personas directly from any page:
  - **Dev Bhatt** — NGO Organizer (Marwadi University, Rajkot)
  - **Dr. Rajesh Patel** — Volunteer Doctor (Ahmedabad)
  - **Priya Sharma** — Food Donor / Restaurant Partner (Surat)
  - **Ananya Joshi** — Student Volunteer (Vadodara)
- Persistent local storage: custom profile changes, new donations, transactions, and status updates are saved permanently in browser `localStorage`.
- One-click **🔄 Reset Sample Data** button in the top banner to restore fresh initial records anytime.

---

## 🎨 Brand & Design System

- **Primary Colors:** Deep Navy (`#0f172a`), Vibrant Teal (`#0f766e`, `#14b8a6`), Warm Off-white (`#f8fafc`).
- **Typography:** Inter (Google Fonts) with accessible contrast standards.
- **Components:** Responsive navbar with mobile hamburger menu, interactive notification popover, modal dialogs with backdrop blur, customizable toast notification system, and responsive card grids.


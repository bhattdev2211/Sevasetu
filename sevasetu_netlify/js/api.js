/**
 * SevaSetu Client-Side API & Persistence Layer for Netlify Deployment
 * 100% Pure HTML, CSS & JavaScript - zero backend required!
 * Persists all state, transactions, donations, and actions to localStorage.
 */

const SEVASETU_STORAGE_KEY = 'sevasetu_db_v1';

const INITIAL_DATA = {
  currentUser: {
    id: "user-1",
    name: "Dev Bhatt",
    email: "priya.sharma@example.org",
    role: "Volunteer",
    city: "Rajkot",
    phone: "8160504384",
    organization: "Marwadi University",
    avatarBg: "#0f766e",
    joinedDate: "Jan 2026",
    mealsRescued: 45,
    bloodDonated: true,
    contributions: 3500
  },
  personas: [
    {
      id: "user-1",
      name: "Dev Bhatt",
      email: "priya.sharma@example.org",
      role: "Volunteer",
      city: "Rajkot",
      phone: "8160504384",
      organization: "Marwadi University",
      avatarBg: "#0f766e",
      joinedDate: "Jan 2026",
      mealsRescued: 45,
      bloodDonated: true,
      contributions: 3500
    },
    {
      id: "user-2",
      name: "Rajesh Patel",
      email: "rajesh.annapurna@example.com",
      role: "Food Donor",
      city: "Ahmedabad",
      phone: "+91 98980 54321",
      organization: "Annapurna Catering & Banquet",
      avatarBg: "#d97706",
      joinedDate: "Feb 2026",
      mealsRescued: 280,
      bloodDonated: false,
      contributions: 12000
    },
    {
      id: "user-3",
      name: "Dr. Ananya Mehta",
      email: "ananya.mehta@cityhospital.org",
      role: "Blood Coordinator",
      city: "Surat",
      phone: "+91 97123 98765",
      organization: "Surat Red Cross Society",
      avatarBg: "#c43232",
      joinedDate: "Nov 2025",
      mealsRescued: 0,
      bloodDonated: true,
      contributions: 5000
    },
    {
      id: "user-4",
      name: "Vikramjit Singh",
      email: "vikram.singh@sevasetu.org",
      role: "NGO Organizer",
      city: "Vadodara",
      phone: "+91 94260 77889",
      organization: "Baroda Citizen Relief",
      avatarBg: "#1e3a5f",
      joinedDate: "Dec 2025",
      mealsRescued: 160,
      bloodDonated: true,
      contributions: 25000
    }
  ],
  foodDonations: [
    {
      id: "food-1",
      title: "Fresh Roti, Dal Makhani & Sabzi",
      description: "Surplus wedding banquet food, prepared under hygienic conditions, packed in insulated warm containers.",
      foodType: "Cooked Meals",
      dietType: "Pure Veg",
      quantity: "40 meal packets",
      approxMeals: 40,
      cookedAt: "2 hours ago",
      bestBefore: "Tonight, 10:30 PM",
      status: "Available",
      city: "Rajkot",
      location: "Kalavad Road, near Crystal Mall",
      donorName: "Shreeji Caterers (Rajesh Patel)",
      donorPhone: "+91 98251 44556",
      donorRole: "Caterer / Restaurant",
      requesterName: null,
      createdAt: "2026-10-28T18:30:00Z"
    },
    {
      id: "food-2",
      title: "Packed Lunch Boxes (Roti, Rice, Paneer Subji)",
      description: "Corporate annual meeting surplus lunch boxes. Clean, sealed meal trays with napkins and cutlery.",
      foodType: "Cooked Meals",
      dietType: "Pure Veg",
      quantity: "25 boxes",
      approxMeals: 25,
      cookedAt: "3 hours ago",
      bestBefore: "Tonight, 9:00 PM",
      status: "Requested",
      city: "Ahmedabad",
      location: "SG Highway, Prahlad Nagar",
      donorName: "TechPark Cafeteria",
      donorPhone: "+91 98790 11223",
      donorRole: "Corporate Office",
      requesterName: "Robin Hood Army - Ahmedabad Chapter",
      createdAt: "2026-10-28T17:15:00Z"
    },
    {
      id: "food-3",
      title: "Fresh Wheat Flour & Toor Dal Ration Kits",
      description: "Donated dry groceries: 10kg bags of Sharbati wheat flour and 5kg packets of polished toor dal.",
      foodType: "Raw Ration",
      dietType: "Pure Veg",
      quantity: "8 kits (80 kg total)",
      approxMeals: 150,
      cookedAt: "Packaged Stock",
      bestBefore: "Valid up to 6 months",
      status: "Available",
      city: "Surat",
      location: "Ring Road, Textile Market Zone",
      donorName: "Mahavir Traders",
      donorPhone: "+91 98241 88990",
      donorRole: "Wholesaler",
      requesterName: null,
      createdAt: "2026-10-28T14:00:00Z"
    },
    {
      id: "food-4",
      title: "Surplus Fresh Bakery Bread & Buns",
      description: "Assorted whole wheat sandwich breads, pav, and burger buns baked this morning.",
      foodType: "Bakery",
      dietType: "Pure Veg",
      quantity: "60 packets",
      approxMeals: 60,
      cookedAt: "This Morning",
      bestBefore: "Tomorrow evening",
      status: "Available",
      city: "Vadodara",
      location: "Alkapuri, RC Dutt Road",
      donorName: "Golden Crust Bakery",
      donorPhone: "+91 99090 33445",
      donorRole: "Bakery Store",
      requesterName: null,
      createdAt: "2026-10-28T11:20:00Z"
    },
    {
      id: "food-5",
      title: "Nutritious Khichdi & Buttermilk",
      description: "Cooked at temple community kitchen for noon distribution. High quality ghee and grains.",
      foodType: "Cooked Meals",
      dietType: "Pure Veg",
      quantity: "50 portions",
      approxMeals: 50,
      cookedAt: "12:00 PM",
      bestBefore: "Tonight, 8:00 PM",
      status: "Completed",
      city: "Rajkot",
      location: "Dharmendrasinhji Road",
      donorName: "Jalaram Mandir Trust",
      donorPhone: "+91 94272 55667",
      donorRole: "Community Trust",
      requesterName: "Priya Sharma (Youth Seva)",
      createdAt: "2026-10-28T09:30:00Z"
    },
    {
      id: "food-6",
      title: "Fresh Seasonal Fruit Baskets (Bananas & Apples)",
      description: "Surplus quality fruits from wholesale mandi crates. Great for shelter children & elderly homes.",
      foodType: "Packaged",
      dietType: "Pure Veg",
      quantity: "35 kg",
      approxMeals: 70,
      cookedAt: "Farm Fresh",
      bestBefore: "3 days",
      status: "Available",
      city: "Ahmedabad",
      location: "Jamalpur APMC Market",
      donorName: "Kisan Fruit Supply",
      donorPhone: "+91 97230 44112",
      donorRole: "Market Vendor",
      requesterName: null,
      createdAt: "2026-10-28T15:45:00Z"
    }
  ],
  bloodRequests: [
    {
      id: "blood-req-1",
      patientName: "Kavita Ben",
      bloodGroup: "B+",
      unitsNeeded: 2,
      hospitalName: "Civil Hospital, Rajkot",
      city: "Rajkot",
      urgency: "Critical",
      contactPerson: "Harish Bhai (Relative)",
      contactPhone: "+91 98254 33221",
      caseDetails: "Emergency surgery in Trauma Ward ICU. Need B+ plasma/blood units urgently.",
      status: "Urgent",
      createdAt: "2026-10-28T18:00:00Z"
    },
    {
      id: "blood-req-2",
      patientName: "Devang Trivedi",
      bloodGroup: "O-",
      unitsNeeded: 3,
      hospitalName: "Apollo Hospitals, Ahmedabad",
      city: "Ahmedabad",
      urgency: "Critical",
      contactPerson: "Nitin Trivedi (Father)",
      contactPhone: "+91 98982 77112",
      caseDetails: "Rare universal donor blood needed for Thalassemia child patient awaiting transfusion.",
      status: "Urgent",
      createdAt: "2026-10-28T16:20:00Z"
    },
    {
      id: "blood-req-3",
      patientName: "Sunita Chauhan",
      bloodGroup: "A+",
      unitsNeeded: 1,
      hospitalName: "SMIMER Hospital, Surat",
      city: "Surat",
      urgency: "Urgent",
      contactPerson: "Manoj Chauhan (Husband)",
      contactPhone: "+91 97120 66554",
      caseDetails: "Scheduled C-section delivery tomorrow morning. Blood bank requested 1 reserve unit.",
      status: "Donors Found",
      createdAt: "2026-10-28T13:40:00Z"
    },
    {
      id: "blood-req-4",
      patientName: "Farhan Sheikh",
      bloodGroup: "AB+",
      unitsNeeded: 2,
      hospitalName: "SSG Hospital, Vadodara",
      city: "Vadodara",
      urgency: "Needed today",
      contactPerson: "Zakir Sheikh (Brother)",
      contactPhone: "+91 94263 11889",
      caseDetails: "Orthopedic accident surgery scheduled for 6 PM. Donor replacement sought.",
      status: "Urgent",
      createdAt: "2026-10-28T12:00:00Z"
    },
    {
      id: "blood-req-5",
      patientName: "Ramesh Vaghela",
      bloodGroup: "O+",
      unitsNeeded: 2,
      hospitalName: "Sterling Hospital, Rajkot",
      city: "Rajkot",
      urgency: "Urgent",
      contactPerson: "Sanjay Vaghela",
      contactPhone: "+91 98259 44332",
      caseDetails: "Cardiac bypass procedure reserve blood.",
      status: "Fulfilled",
      createdAt: "2026-10-27T10:00:00Z"
    }
  ],
  bloodDonors: [
    {
      id: "donor-1",
      name: "Hardik Goswami",
      bloodGroup: "O-",
      city: "Ahmedabad",
      phone: "+91 98240 11992",
      lastDonated: "2026-06-15",
      isAvailable: true,
      donationCount: 6,
      verified: true
    },
    {
      id: "donor-2",
      name: "Pooja Dave",
      bloodGroup: "B+",
      city: "Rajkot",
      phone: "+91 98984 22331",
      lastDonated: "2026-05-10",
      isAvailable: true,
      donationCount: 4,
      verified: true
    },
    {
      id: "donor-3",
      name: "Bhavesh Chudasama",
      bloodGroup: "B+",
      city: "Rajkot",
      phone: "+91 98255 66778",
      lastDonated: "2026-09-02",
      isAvailable: true,
      donationCount: 9,
      verified: true
    },
    {
      id: "donor-4",
      name: "Meera Solanki",
      bloodGroup: "A+",
      city: "Surat",
      phone: "+91 97129 44556",
      lastDonated: "2026-04-20",
      isAvailable: true,
      donationCount: 3,
      verified: true
    },
    {
      id: "donor-5",
      name: "Dr. Chirag Raval",
      bloodGroup: "AB-",
      city: "Vadodara",
      phone: "+91 94268 99001",
      lastDonated: "2026-07-12",
      isAvailable: true,
      donationCount: 11,
      verified: true
    },
    {
      id: "donor-6",
      name: "Ketan Ruparelia",
      bloodGroup: "O+",
      city: "Rajkot",
      phone: "+91 98250 88776",
      lastDonated: "2026-08-18",
      isAvailable: true,
      donationCount: 8,
      verified: true
    },
    {
      id: "donor-7",
      name: "Sneha Kapadia",
      bloodGroup: "A-",
      city: "Ahmedabad",
      phone: "+91 98792 33441",
      lastDonated: "2026-03-30",
      isAvailable: false,
      donationCount: 5,
      verified: true
    },
    {
      id: "donor-8",
      name: "Mohsin Mansuri",
      bloodGroup: "AB+",
      city: "Surat",
      phone: "+91 97235 66112",
      lastDonated: "2026-07-05",
      isAvailable: true,
      donationCount: 7,
      verified: true
    }
  ],
  transactions: [
    {
      id: "txn-101",
      title: "Ration supply purchase for flood-affected families",
      type: "expense",
      amount: 14500,
      category: "Ration Relief",
      date: "2026-10-27",
      recordedBy: "Vikramjit Singh",
      notes: "Bought 30 ration packets (Rice, Atta, Oil, Pulses) with GST invoice #GST-8842",
      receiptId: "REC-2026-8842",
      groupId: "group-1"
    },
    {
      id: "txn-102",
      title: "Monthly community contribution from local traders union",
      type: "income",
      amount: 25000,
      category: "Community Contribution",
      date: "2026-10-25",
      recordedBy: "Dev Bhatt",
      notes: "Direct bank transfer from Rajkot Merchants Charitable Wing",
      receiptId: "REC-2026-7421",
      groupId: "group-1"
    },
    {
      id: "txn-103",
      title: "Emergency medicine & blood testing kits for outreach camp",
      type: "expense",
      amount: 6200,
      category: "Medical Aid",
      date: "2026-10-22",
      recordedBy: "Dr. Ananya Mehta",
      notes: "Insulin, basic antibiotics, syringe packs, blood grouping reagents",
      receiptId: "REC-2026-6190",
      groupId: "group-3"
    },
    {
      id: "txn-104",
      title: "Online crowd-fund donation for winter blanket drive",
      type: "income",
      amount: 18000,
      category: "Crowdfund / Public",
      date: "2026-10-20",
      recordedBy: "Rajesh Patel",
      notes: "Aggregated micro-donations received via UPI payment gateway",
      receiptId: "REC-2026-5501",
      groupId: "group-2"
    },
    {
      id: "txn-105",
      title: "Community kitchen gas cylinders & cooking fuel",
      type: "expense",
      amount: 3800,
      category: "Community Kitchen",
      date: "2026-10-18",
      recordedBy: "Dev Bhatt",
      notes: "4 commercial LPG refills for free evening meal kitchen",
      receiptId: "REC-2026-4412",
      groupId: "group-2"
    },
    {
      id: "txn-106",
      title: "Fuel & logistics for food rescue delivery van",
      type: "expense",
      amount: 2500,
      category: "Logistics & Fuel",
      date: "2026-10-15",
      recordedBy: "Vikramjit Singh",
      notes: "Diesel bill for weekly night food pickup vehicle across 14 banquet halls",
      receiptId: "REC-2026-3982",
      groupId: "group-1"
    },
    {
      id: "txn-107",
      title: "CSR Support from Western Auto Components",
      type: "income",
      amount: 30000,
      category: "CSR Grant",
      date: "2026-10-10",
      recordedBy: "Vikramjit Singh",
      notes: "Earmarked for child nutrition and education support kits",
      receiptId: "REC-2026-2810",
      groupId: "group-1"
    },
    {
      id: "txn-108",
      title: "Notebooks and stationery kits for slum school children",
      type: "expense",
      amount: 5500,
      category: "Education Support",
      date: "2026-10-06",
      recordedBy: "Dev Bhatt",
      notes: "150 student learning kits distributed in Mavdi slum cluster",
      receiptId: "REC-2026-1930",
      groupId: "group-1"
    }
  ],
  notifications: [
    {
      id: "notif-1",
      title: "Food Donation Requested",
      message: "Robin Hood Army requested pickup for 'Packed Lunch Boxes (25 boxes)'.",
      module: "food",
      time: "25 mins ago",
      read: false,
      link: "food.html"
    },
    {
      id: "notif-2",
      title: "Critical Blood Request in Rajkot",
      message: "B+ blood needed urgently for surgery at Civil Hospital, Rajkot.",
      module: "blood",
      time: "2 hours ago",
      read: false,
      link: "blood.html"
    },
    {
      id: "notif-3",
      title: "Funds Ledger Updated",
      message: "₹14,500 expense recorded for flood-affected families ration relief.",
      module: "funds",
      time: "Yesterday",
      read: true,
      link: "funds.html"
    },
    {
      id: "notif-4",
      title: "New Voluntary Donor Registered",
      message: "Bhavesh Chudasama (B+) registered as an available donor in Rajkot.",
      module: "blood",
      time: "2 days ago",
      read: true,
      link: "blood.html"
    }
  ],
  activities: [
    {
      id: "act-1",
      module: "Profile",
      text: "Profile details verified for Dev Bhatt (Marwadi University)",
      status: "Updated",
      tone: "info",
      city: "Rajkot",
      time: "Just now"
    },
    {
      id: "act-2",
      module: "FoodShare",
      text: "Fresh Roti, Dal & Sabzi (40 meals) posted by Shreeji Caterers",
      status: "Available",
      tone: "success",
      city: "Rajkot",
      time: "Just now"
    },
    {
      id: "act-3",
      module: "BloodConnect",
      text: "B+ needed urgently at Civil Hospital, Rajkot (Trauma Surgery)",
      status: "Urgent",
      tone: "danger",
      city: "Rajkot",
      time: "1 hour ago"
    },
    {
      id: "act-4",
      module: "FoodShare",
      text: "Packed Lunch Boxes (25) requested by Robin Hood Army volunteer",
      status: "Requested",
      tone: "warning",
      city: "Ahmedabad",
      time: "2 hours ago"
    },
    {
      id: "act-5",
      module: "CommunityFunds",
      text: "Expense: ₹14,500 recorded for Ration Relief supplies",
      status: "Recorded",
      tone: "info",
      city: "Rajkot",
      time: "Yesterday"
    },
    {
      id: "act-6",
      module: "BloodConnect",
      text: "Devang Trivedi posted emergency request for 3 units of O- at Apollo Hospitals",
      status: "Critical",
      tone: "danger",
      city: "Ahmedabad",
      time: "Yesterday"
    },
    {
      id: "act-7",
      module: "CommunityFunds",
      text: "Direct contribution: ₹25,000 received from Merchants Charitable Wing",
      status: "Received",
      tone: "success",
      city: "Rajkot",
      time: "3 days ago"
    }
  ],
  communityGroups: [
    {
      id: "group-1",
      name: "Rajkot Disaster & Relief Circle",
      description: "Community-led rapid emergency ration and medical supplies relief across Rajkot district.",
      city: "Rajkot",
      category: "Disaster Relief",
      creator: "Vikramjit Singh",
      createdAt: "2026-01-15",
      members: [
        { name: "Vikramjit Singh", role: "Admin", email: "vikram.singh@sevasetu.org" },
        { name: "Dev Bhatt", role: "Treasurer", email: "priya.sharma@example.org" },
        { name: "Rajesh Patel", role: "Member", email: "rajesh.annapurna@example.com" }
      ],
      balance: 28500
    },
    {
      id: "group-2",
      name: "Saurashtra Annakshetra & Kitchen Alliance",
      description: "Transparent pooled fund for daily free meal kitchens, grain banks, and clean drinking water.",
      city: "Ahmedabad",
      category: "Community Kitchen",
      creator: "Rajesh Patel",
      createdAt: "2026-02-01",
      members: [
        { name: "Rajesh Patel", role: "Admin", email: "rajesh.annapurna@example.com" },
        { name: "Dev Bhatt", role: "Member", email: "priya.sharma@example.org" }
      ],
      balance: 12000
    },
    {
      id: "group-3",
      name: "Gujarat Emergency Medical Care Network",
      description: "Micro-grants and travel logistics for patients requiring urgent hospital transfusions and surgery kits.",
      city: "Surat",
      category: "Medical Aid",
      creator: "Dr. Ananya Mehta",
      createdAt: "2026-02-10",
      members: [
        { name: "Dr. Ananya Mehta", role: "Admin", email: "ananya.mehta@cityhospital.org" },
        { name: "Vikramjit Singh", role: "Member", email: "vikram.singh@sevasetu.org" }
      ],
      balance: 18200
    }
  ]
};

const API = {
  _getData() {
    try {
      const stored = localStorage.getItem(SEVASETU_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('LocalStorage access issue, using in-memory state:', e);
    }
    const fresh = JSON.parse(JSON.stringify(INITIAL_DATA));
    this._saveData(fresh);
    return fresh;
  },

  _saveData(data) {
    try {
      localStorage.setItem(SEVASETU_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  },

  async request(endpoint, options = {}) {
    // If running with active backend server, attempt HTTP first
    if (window.location.protocol.startsWith('http') && !window.location.hostname.includes('netlify')) {
      try {
        const response = await fetch(endpoint, {
          ...options,
          headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
        });
        if (response.ok) {
          return await response.json();
        }
      } catch (_) {
        // Fallback to local storage silently on server disconnect or static preview
      }
    }
    return null;
  },

  // --- Initial & Summary ---
  async getInitialData() {
    const data = this._getData();
    return {
      currentUser: data.currentUser,
      personas: data.personas,
      foodDonations: data.foodDonations,
      bloodRequests: data.bloodRequests,
      bloodDonors: data.bloodDonors,
      transactions: data.transactions,
      communityGroups: data.communityGroups,
      notifications: data.notifications,
      activities: data.activities,
      summary: await this.getSummary()
    };
  },

  async getSummary() {
    const data = this._getData();
    const food = data.foodDonations || [];
    const blood = data.bloodRequests || [];
    const txns = data.transactions || [];
    const groups = data.communityGroups || [];

    const activeFoodCount = food.filter((f) => ['Available', 'Open'].includes(f.status)).length;
    const openBloodCount = blood.filter((b) => ['Urgent', 'Critical', 'Needed today'].includes(b.status)).length;
    const totalMealsRescued = food.reduce((acc, f) => acc + (Number(f.approxMeals) || 0), 0);

    const income = txns.filter((t) => t.type === 'income').reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
    const expense = txns.filter((t) => t.type === 'expense').reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
    const balance = income - expense;

    return {
      activeFoodCount,
      openBloodCount,
      totalMealsRescued,
      groupsCount: groups.length,
      fundsSummary: { income, expense, balance }
    };
  },

  // --- FoodShare ---
  async getFood() {
    return this._getData().foodDonations || [];
  },

  async postFood(item) {
    const data = this._getData();
    item.id = `food-${Date.now()}`;
    item.status = 'Available';
    item.createdAt = new Date().toISOString();
    item.approxMeals = Number(item.approxMeals) || 20;

    data.foodDonations.unshift(item);
    data.activities.unshift({
      id: `act-${Date.now()}`,
      module: 'FoodShare',
      text: `${item.title} (${item.quantity}) posted by ${item.donorName || 'Community Donor'}`,
      status: 'Available',
      tone: 'success',
      city: item.city || 'Rajkot',
      time: 'Just now'
    });
    data.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'New Food Donation Available',
      message: `${item.title} in ${item.city} (${item.quantity}) needs pickup.`,
      module: 'food',
      time: 'Just now',
      read: false,
      link: 'food.html'
    });

    this._saveData(data);
    return { success: true, item };
  },

  async editFood(id, updates) {
    const data = this._getData();
    const item = data.foodDonations.find((f) => f.id === id);
    if (!item) return { success: false, error: 'Listing not found' };

    const editable = ['title', 'description', 'quantity', 'approxMeals', 'bestBefore', 'location', 'city', 'donorPhone'];
    editable.forEach((k) => {
      if (k in updates) item[k] = updates[k];
    });
    item.updatedAt = new Date().toISOString();

    data.activities.unshift({
      id: `act-${Date.now()}`,
      module: 'FoodShare',
      text: `Donation listing '${item.title}' updated`,
      status: item.status,
      tone: 'info',
      city: item.city,
      time: 'Just now'
    });

    this._saveData(data);
    return { success: true, item };
  },

  async cancelFood(id, userName = 'Donor', reason = 'Cancelled by donor') {
    const data = this._getData();
    const item = data.foodDonations.find((f) => f.id === id);
    if (!item) return { success: false, error: 'Listing not found' };

    item.status = 'Cancelled';
    item.cancelReason = reason;

    data.activities.unshift({
      id: `act-${Date.now()}`,
      module: 'FoodShare',
      text: `Food donation '${item.title}' cancelled: ${reason}`,
      status: 'Cancelled',
      tone: 'danger',
      city: item.city,
      time: 'Just now'
    });

    this._saveData(data);
    return { success: true, item };
  },

  async claimFood(id, requesterName, notes = '') {
    const data = this._getData();
    const item = data.foodDonations.find((f) => f.id === id);
    if (!item || !['Available', 'Open'].includes(item.status)) {
      const err = new Error('Donation is not available for claim');
      err.data = { error: 'Donation is not available for claim' };
      throw err;
    }

    item.status = 'Requested';
    item.requesterName = requesterName;
    item.requesterNotes = notes;

    data.activities.unshift({
      id: `act-${Date.now()}`,
      module: 'FoodShare',
      text: `${item.title} pickup claimed by ${requesterName}`,
      status: 'Requested',
      tone: 'warning',
      city: item.city,
      time: 'Just now'
    });

    data.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'Donation Pickup Claimed',
      message: `${requesterName} requested pickup for '${item.title}'.`,
      module: 'food',
      time: 'Just now',
      read: false,
      link: 'food.html'
    });

    this._saveData(data);
    return { success: true, item };
  },

  async reviewFoodClaim(id, donorName = 'Donor', accept = true) {
    const data = this._getData();
    const item = data.foodDonations.find((f) => f.id === id);
    if (!item) return { success: false, error: 'Item not found' };

    if (accept) {
      item.status = 'Approved';
      var msg = `Pickup approved for ${item.requesterName}`;
    } else {
      const prevReq = item.requesterName;
      item.status = 'Available';
      item.requesterName = null;
      var msg = `Pickup request from ${prevReq} was declined; listing is Available again`;
    }

    data.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'Food Pickup Status Update',
      message: msg,
      module: 'food',
      time: 'Just now',
      read: false,
      link: 'food.html'
    });

    this._saveData(data);
    return { success: true, item };
  },

  async completeFood(id) {
    const data = this._getData();
    const item = data.foodDonations.find((f) => f.id === id);
    if (!item) return { success: false, error: 'Listing not found' };

    item.status = 'Completed';
    item.completedAt = new Date().toISOString();

    data.activities.unshift({
      id: `act-${Date.now()}`,
      module: 'FoodShare',
      text: `Meals from '${item.title}' successfully distributed to community!`,
      status: 'Completed',
      tone: 'success',
      city: item.city,
      time: 'Just now'
    });

    this._saveData(data);
    return { success: true, item };
  },

  // --- BloodConnect ---
  async getBloodRequests() {
    return this._getData().bloodRequests || [];
  },

  async postBloodRequest(req) {
    const data = this._getData();
    req.id = `blood-req-${Date.now()}`;
    req.status = 'Urgent';
    req.createdAt = new Date().toISOString();
    req.unitsNeeded = Number(req.unitsNeeded) || 1;

    data.bloodRequests.unshift(req);
    data.activities.unshift({
      id: `act-${Date.now()}`,
      module: 'BloodConnect',
      text: `${req.bloodGroup} needed urgently at ${req.hospitalName}, ${req.city}`,
      status: req.urgency || 'Urgent',
      tone: 'danger',
      city: req.city,
      time: 'Just now'
    });

    data.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: `URGENT: ${req.bloodGroup} Blood Needed`,
      message: `${req.unitsNeeded} units needed at ${req.hospitalName}, ${req.city}.`,
      module: 'blood',
      time: 'Just now',
      read: false,
      link: 'blood.html'
    });

    this._saveData(data);
    return { success: true, request: req };
  },

  async fulfillBloodRequest(id) {
    const data = this._getData();
    const req = data.bloodRequests.find((r) => r.id === id);
    if (!req) return { success: false, error: 'Request not found' };

    req.status = 'Fulfilled';
    data.activities.unshift({
      id: `act-${Date.now()}`,
      module: 'BloodConnect',
      text: `Emergency blood requirement (${req.bloodGroup}) at ${req.hospitalName} fulfilled!`,
      status: 'Fulfilled',
      tone: 'success',
      city: req.city,
      time: 'Just now'
    });

    this._saveData(data);
    return { success: true, request: req };
  },

  async cancelBloodRequest(id, userName = 'Requester', reason = 'Cancelled') {
    const data = this._getData();
    const req = data.bloodRequests.find((r) => r.id === id);
    if (!req) return { success: false, error: 'Request not found' };

    req.status = 'Cancelled';
    req.cancelReason = reason;

    data.activities.unshift({
      id: `act-${Date.now()}`,
      module: 'BloodConnect',
      text: `Blood request for ${req.bloodGroup} at ${req.hospitalName} was cancelled (${reason})`,
      status: 'Cancelled',
      tone: 'info',
      city: req.city,
      time: 'Just now'
    });

    this._saveData(data);
    return { success: true, request: req };
  },

  async getBloodDonors() {
    return this._getData().bloodDonors || [];
  },

  async postBloodDonor(donor) {
    const data = this._getData();
    donor.id = `donor-${Date.now()}`;
    donor.isAvailable = true;
    donor.donationCount = Number(donor.donationCount) || 1;
    donor.verified = true;
    donor.consentContact = true;
    donor.registeredAt = new Date().toISOString();

    data.bloodDonors.unshift(donor);
    data.activities.unshift({
      id: `act-${Date.now()}`,
      module: 'BloodConnect',
      text: `${donor.name} (${donor.bloodGroup}) registered as voluntary donor in ${donor.city}`,
      status: 'Available',
      tone: 'success',
      city: donor.city,
      time: 'Just now'
    });

    this._saveData(data);
    return { success: true, donor };
  },

  async toggleBloodDonor(id) {
    const data = this._getData();
    const donor = data.bloodDonors.find((d) => d.id === id);
    if (!donor) return { success: false, error: 'Donor not found' };

    donor.isAvailable = !donor.isAvailable;
    const statusStr = donor.isAvailable ? 'Available' : 'Temporarily Unavailable';

    data.activities.unshift({
      id: `act-${Date.now()}`,
      module: 'BloodConnect',
      text: `Donor ${donor.name} status updated to ${statusStr}`,
      status: statusStr,
      tone: 'info',
      city: donor.city,
      time: 'Just now'
    });

    this._saveData(data);
    return { success: true, donor };
  },

  async requestDonorContact(id, requesterName, hospitalReason) {
    const data = this._getData();
    const donor = data.bloodDonors.find((d) => d.id === id);
    if (!donor) return { success: false, error: 'Donor not found' };

    data.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'Blood Donor Contact Requested',
      message: `${requesterName} requested contact for patient at ${hospitalReason}.`,
      module: 'blood',
      time: 'Just now',
      read: false,
      link: 'blood.html'
    });

    data.activities.unshift({
      id: `act-${Date.now()}`,
      module: 'BloodConnect',
      text: `Consent-controlled contact inquiry for donor ${donor.name} (${donor.bloodGroup})`,
      status: 'Inquiry',
      tone: 'warning',
      city: donor.city,
      time: 'Just now'
    });

    this._saveData(data);
    return {
      success: true,
      donor,
      phone: donor.phone,
      name: donor.name
    };
  },

  // --- CommunityFunds & Groups ---
  async getFunds() {
    const data = this._getData();
    const summary = await this.getSummary();
    return {
      transactions: data.transactions || [],
      summary: summary.fundsSummary,
      groups: data.communityGroups || []
    };
  },

  async getGroups() {
    return this._getData().communityGroups || [];
  },

  async createGroup(groupData) {
    const data = this._getData();
    const name = (groupData.name || '').trim();
    if (!name) {
      const err = new Error('Group name is required');
      err.data = { error: 'Group name is required' };
      throw err;
    }

    const current = data.currentUser || {};
    const group = {
      id: `group-${Date.now()}`,
      name,
      description: groupData.description || 'Community relief and welfare group',
      city: groupData.city || 'Rajkot',
      category: groupData.category || 'General Welfare',
      creator: current.name || 'Community Leader',
      createdAt: new Date().toISOString().split('T')[0],
      members: [
        { name: current.name || 'Leader', role: 'Admin', email: current.email || '' }
      ],
      balance: 0
    };

    data.communityGroups.unshift(group);
    data.activities.unshift({
      id: `act-${Date.now()}`,
      module: 'CommunityFunds',
      text: `New community fund group '${name}' established by ${group.creator}`,
      status: 'Created',
      tone: 'success',
      city: group.city,
      time: 'Just now'
    });

    this._saveData(data);
    return { success: true, group };
  },

  async joinGroup(groupId, role = 'Member') {
    const data = this._getData();
    const group = data.communityGroups.find((g) => g.id === groupId);
    if (!group) return { success: false, error: 'Group not found' };

    const current = data.currentUser || {};
    const existing = (group.members || []).find((m) => m.name === current.name || m.email === current.email);
    if (!existing) {
      group.members = group.members || [];
      group.members.push({ name: current.name, role, email: current.email });
    }

    data.activities.unshift({
      id: `act-${Date.now()}`,
      module: 'CommunityFunds',
      text: `${current.name} joined community group '${group.name}' as ${role}`,
      status: 'Joined',
      tone: 'info',
      city: group.city,
      time: 'Just now'
    });

    this._saveData(data);
    return { success: true, group };
  },

  async postTransaction(txn) {
    const amount = Number(txn.amount);
    if (isNaN(amount) || amount <= 0) {
      const err = new Error('Transaction amount must be strictly greater than 0');
      err.data = { error: 'Transaction amount must be strictly greater than 0' };
      throw err;
    }

    const data = this._getData();
    txn.id = `txn-${Date.now()}`;
    txn.amount = amount;
    txn.receiptId = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    txn.date = txn.date || new Date().toISOString().split('T')[0];

    data.transactions.unshift(txn);

    const isIncome = txn.type === 'income';
    data.activities.unshift({
      id: `act-${Date.now()}`,
      module: 'CommunityFunds',
      text: `${isIncome ? 'Income' : 'Expense'}: ₹${Math.round(amount).toLocaleString('en-IN')} for ${txn.title}`,
      status: isIncome ? 'Received' : 'Recorded',
      tone: isIncome ? 'success' : 'info',
      city: txn.city || 'Rajkot',
      time: 'Just now'
    });

    this._saveData(data);
    return { success: true, transaction: txn };
  },

  async contribute(amount, name = 'Well-wisher', note = '', groupId = null) {
    const num = Number(amount);
    if (isNaN(num) || num <= 0) {
      const err = new Error('Contribution amount must be greater than 0');
      err.data = { error: 'Contribution amount must be greater than 0' };
      throw err;
    }

    return this.postTransaction({
      title: `Community contribution from ${name}`,
      type: 'income',
      amount: num,
      category: 'Crowdfund / Public',
      date: new Date().toISOString().split('T')[0],
      recordedBy: name,
      notes: note || 'Online contribution via SevaSetu portal',
      groupId
    });
  },

  exportCSV() {
    const data = this._getData();
    const txns = data.transactions || [];
    const lines = ['"Receipt ID","Date","Type","Category","Description","Amount (INR)","Recorded By","Notes"'];
    for (const t of txns) {
      const desc = (t.title || '').replace(/"/g, '""');
      const notes = (t.notes || '').replace(/"/g, '""');
      lines.push(`"${t.receiptId || ''}","${t.date || ''}","${t.type || ''}","${t.category || ''}","${desc}",${t.amount || 0},"${t.recordedBy || ''}","${notes}"`);
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sevasetu_ledger.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // --- Notifications & Activity ---
  async getNotifications() {
    return this._getData().notifications || [];
  },

  async markNotificationRead(id) {
    const data = this._getData();
    const n = (data.notifications || []).find((x) => x.id === id);
    if (n) {
      n.read = true;
      this._saveData(data);
      return { success: true };
    }
    return { success: false };
  },

  async markAllNotificationsRead() {
    const data = this._getData();
    (data.notifications || []).forEach((n) => { n.read = true; });
    this._saveData(data);
    return { success: true };
  },

  async getActivities() {
    return this._getData().activities || [];
  },

  // --- Auth & Personas ---
  async getCurrentUser() {
    return this._getData().currentUser;
  },

  async switchPersona(id) {
    const data = this._getData();
    const matched = (data.personas || []).find((p) => p.id === id);
    if (matched) {
      data.currentUser = matched;
      this._saveData(data);
      return { success: true, user: matched };
    }
    return { success: false, error: 'Persona not found' };
  },

  async login(email) {
    const data = this._getData();
    const clean = (email || '').trim().toLowerCase();
    const matched = (data.personas || []).find((p) => p.email.toLowerCase() === clean);
    if (matched) {
      data.currentUser = matched;
      this._saveData(data);
      return { success: true, user: matched };
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      email,
      role: 'Community Member',
      city: 'Rajkot',
      phone: '+91 98000 00000',
      organization: 'Individual Supporter',
      avatarBg: '#0f766e',
      joinedDate: 'Today',
      mealsRescued: 0,
      bloodDonated: false,
      contributions: 0
    };
    data.currentUser = newUser;
    this._saveData(data);
    return { success: true, user: newUser };
  },

  async register(regData) {
    const data = this._getData();
    const newUser = {
      id: `user-${Date.now()}`,
      name: regData.name || 'New User',
      email: regData.email || '',
      phone: regData.phone || '+91 98000 00000',
      city: regData.city || 'Rajkot',
      role: regData.role || 'Volunteer',
      organization: regData.organization || 'Individual',
      avatarBg: '#0f766e',
      joinedDate: 'Just now',
      mealsRescued: 0,
      bloodDonated: false,
      contributions: 0
    };
    data.currentUser = newUser;
    this._saveData(data);
    return { success: true, user: newUser };
  },

  async updateProfile(updates) {
    const data = this._getData();
    const permitted = ['name', 'phone', 'city', 'organization', 'bio', 'avatarBg'];
    const current = data.currentUser || {};

    permitted.forEach((key) => {
      if (key in updates && updates[key] !== undefined) {
        current[key] = updates[key];
      }
    });

    data.currentUser = current;
    // Update in personas if matched
    const persona = (data.personas || []).find((p) => p.id === current.id);
    if (persona) {
      permitted.forEach((key) => {
        if (key in updates) persona[key] = updates[key];
      });
    }

    data.activities.unshift({
      id: `act-${Date.now()}`,
      module: 'Profile',
      text: `Profile details updated for ${current.name}`,
      status: 'Updated',
      tone: 'info',
      city: current.city || 'Rajkot',
      time: 'Just now'
    });

    this._saveData(data);
    return { success: true, user: current };
  },

  async resetPassword(email) {
    const clean = (email || '').trim().toLowerCase();
    const data = this._getData();
    data.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'Password Reset Initiated',
      message: `A secure reset verification token was generated for ${clean}.`,
      module: 'auth',
      time: 'Just now',
      read: false,
      link: 'login.html'
    });
    this._saveData(data);
    return {
      success: true,
      message: `Password reset instructions and verification code sent to ${clean}. You may now sign in.`
    };
  },

  async resetData() {
    this._saveData(JSON.parse(JSON.stringify(INITIAL_DATA)));
    return { success: true, message: 'All data reset to initial values' };
  }
};


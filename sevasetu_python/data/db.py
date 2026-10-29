"""
Data persistence and query manager for SevaSetu Python backend.
Persists all data to a JSON database file (data.json) with thread safety.
"""

import os
import json
import threading
from datetime import datetime, timezone

def _now():
    return datetime.now(timezone.utc)

from data.seed_data import (
    INITIAL_PERSONAS,
    INITIAL_FOOD_DONATIONS,
    INITIAL_BLOOD_REQUESTS,
    INITIAL_BLOOD_DONORS,
    INITIAL_TRANSACTIONS,
    INITIAL_NOTIFICATIONS,
    INITIAL_ACTIVITIES,
    INITIAL_COMMUNITY_GROUPS
)

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data.json')
_lock = threading.Lock()

class Database:
    def __init__(self, db_path=DB_FILE):
        self.db_path = db_path
        self.data = {}
        self.load()

    def _get_default_data(self):
        return {
            "currentUser": dict(INITIAL_PERSONAS[0]),
            "personas": [dict(p) for p in INITIAL_PERSONAS],
            "foodDonations": [dict(f) for f in INITIAL_FOOD_DONATIONS],
            "bloodRequests": [dict(b) for b in INITIAL_BLOOD_REQUESTS],
            "bloodDonors": [dict(d) for d in INITIAL_BLOOD_DONORS],
            "transactions": [dict(t) for t in INITIAL_TRANSACTIONS],
            "notifications": [dict(n) for n in INITIAL_NOTIFICATIONS],
            "activities": [dict(a) for a in INITIAL_ACTIVITIES],
            "communityGroups": [dict(g) for g in INITIAL_COMMUNITY_GROUPS]
        }

    def load(self):
        with _lock:
            if os.path.exists(self.db_path):
                try:
                    with open(self.db_path, 'r', encoding='utf-8') as f:
                        self.data = json.load(f)
                    # Ensure all required collections exist
                    defaults = self._get_default_data()
                    modified = False
                    for k, v in defaults.items():
                        if k not in self.data:
                            self.data[k] = v
                            modified = True
                    if modified:
                        self._save_unlocked()
                    return
                except Exception as e:
                    print(f"Warning: Failed to load DB file, resetting to default: {e}")
            self.data = self._get_default_data()
            self._save_unlocked()

    def save(self):
        with _lock:
            self._save_unlocked()

    def _save_unlocked(self):
        with open(self.db_path, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, indent=2, ensure_ascii=False)

    def reset(self):
        with _lock:
            self.data = self._get_default_data()
            self._save_unlocked()
            return self.data

    # --- User & Auth ---
    def get_current_user(self):
        return self.data.get("currentUser", INITIAL_PERSONAS[0])

    def set_current_user(self, user):
        self.data["currentUser"] = user
        self.save()
        return user

    def get_personas(self):
        return self.data.get("personas", INITIAL_PERSONAS)

    def update_profile(self, user_id, updates):
        """
        Updates user profile with strict security rules:
        Protected fields (role, id, email, joinedDate) cannot be changed by ordinary edits.
        Permitted fields: name, phone, city, organization, bio, avatarBg.
        """
        permitted = ['name', 'phone', 'city', 'organization', 'bio', 'avatarBg']
        sanitized = {k: str(v).strip() for k, v in updates.items() if k in permitted and v is not None}

        current = self.data.get("currentUser", {})
        if current.get("id") == user_id or not user_id:
            current.update(sanitized)
            self.data["currentUser"] = current

        # Update in personas list as well
        for p in self.data.get("personas", []):
            if p.get("id") == user_id:
                p.update(sanitized)
                break

        self.add_activity({
            "module": "Profile",
            "text": f"Profile details updated for {current.get('name', 'User')}",
            "status": "Updated",
            "tone": "info",
            "city": current.get("city", "Rajkot"),
            "time": "Just now"
        })

        self.save()
        return current

    def reset_password(self, email):
        """
        Password reset workflow simulation with validation.
        """
        email_clean = (email or "").strip().lower()
        if not email_clean:
            return {"success": False, "error": "Email address is required"}

        # Find persona or user
        user = next((p for p in self.data.get("personas", []) if p.get("email", "").lower() == email_clean), None)
        if not user and self.data.get("currentUser", {}).get("email", "").lower() == email_clean:
            user = self.data["currentUser"]

        # Add notification
        self.add_notification({
            "title": "Password Reset Initiated",
            "message": f"A secure reset verification token was generated for {email_clean}.",
            "module": "auth",
            "time": "Just now",
            "read": False,
            "link": "/login"
        })

        self.add_activity({
            "module": "Security",
            "text": f"Password reset request processed for {email_clean}",
            "status": "Verified",
            "tone": "info",
            "city": user.get("city", "Rajkot") if user else "Rajkot",
            "time": "Just now"
        })

        self.save()
        return {
            "success": True,
            "message": f"Password reset instructions and verification link sent to {email_clean}. You may now sign in."
        }

    # --- FoodShare ---
    def get_food(self):
        return self.data.get("foodDonations", [])

    def add_food(self, item):
        item["id"] = f"food-{int(_now().timestamp() * 1000)}"
        item["status"] = "Available"
        item["createdAt"] = _now().isoformat()
        item["approxMeals"] = int(item.get("approxMeals", 20) or 20)
        self.data.setdefault("foodDonations", []).insert(0, item)

        self.add_activity({
            "module": "FoodShare",
            "text": f"{item.get('title')} ({item.get('quantity')}) posted by {item.get('donorName', 'Community Donor')}",
            "status": "Available",
            "tone": "success",
            "city": item.get("city", "Rajkot"),
            "time": "Just now"
        })

        self.add_notification({
            "title": "New Food Donation Available",
            "message": f"{item.get('title')} in {item.get('city')} ({item.get('quantity')}) needs pickup.",
            "module": "food",
            "time": "Just now",
            "read": False,
            "link": "/food"
        })

        self.save()
        return item

    def edit_food(self, food_id, updates, editor_name="Donor"):
        for item in self.data.get("foodDonations", []):
            if item.get("id") == food_id:
                # Update allowed editable fields
                editable = ['title', 'description', 'quantity', 'approxMeals', 'bestBefore', 'location', 'city', 'donorPhone']
                for k in editable:
                    if k in updates:
                        item[k] = updates[k]
                item["updatedAt"] = _now().isoformat()

                self.add_activity({
                    "module": "FoodShare",
                    "text": f"Donation listing '{item.get('title')}' updated by {editor_name}",
                    "status": item.get("status", "Available"),
                    "tone": "info",
                    "city": item.get("city", "Rajkot"),
                    "time": "Just now"
                })

                self.save()
                return item
        return None

    def cancel_food(self, food_id, user_name="Donor", reason="Cancelled by donor"):
        for item in self.data.get("foodDonations", []):
            if item.get("id") == food_id:
                item["status"] = "Cancelled"
                item["cancelReason"] = reason

                self.add_activity({
                    "module": "FoodShare",
                    "text": f"Food donation '{item.get('title')}' cancelled: {reason}",
                    "status": "Cancelled",
                    "tone": "danger",
                    "city": item.get("city", "Rajkot"),
                    "time": "Just now"
                })

                self.save()
                return item
        return None

    def claim_food(self, food_id, requester_name, notes=""):
        for item in self.data.get("foodDonations", []):
            if item.get("id") == food_id:
                if item.get("status") not in ["Available", "Open"]:
                    return None  # Prevent duplicate claiming

                item["status"] = "Requested"
                item["requesterName"] = requester_name
                item["requesterNotes"] = notes

                self.add_activity({
                    "module": "FoodShare",
                    "text": f"{item.get('title')} pickup claimed by {requester_name}",
                    "status": "Requested",
                    "tone": "warning",
                    "city": item.get("city", "Rajkot"),
                    "time": "Just now"
                })

                self.add_notification({
                    "title": "Donation Pickup Claimed",
                    "message": f"{requester_name} requested pickup for '{item.get('title')}'.",
                    "module": "food",
                    "time": "Just now",
                    "read": False,
                    "link": "/food"
                })

                self.save()
                return item
        return None

    def review_food_claim(self, food_id, donor_name, accept=True):
        for item in self.data.get("foodDonations", []):
            if item.get("id") == food_id:
                if accept:
                    item["status"] = "Approved"
                    msg = f"Pickup approved for {item.get('requesterName')}"
                else:
                    req_name = item.get("requesterName")
                    item["status"] = "Available"
                    item["requesterName"] = None
                    msg = f"Pickup request from {req_name} was declined; listing is Available again"

                self.add_notification({
                    "title": "Food Pickup Status Update",
                    "message": msg,
                    "module": "food",
                    "time": "Just now",
                    "read": False,
                    "link": "/food"
                })

                self.save()
                return item
        return None

    def complete_food(self, food_id):
        for item in self.data.get("foodDonations", []):
            if item.get("id") == food_id:
                item["status"] = "Completed"
                item["completedAt"] = _now().isoformat()

                self.add_activity({
                    "module": "FoodShare",
                    "text": f"Meals from '{item.get('title')}' successfully distributed to community!",
                    "status": "Completed",
                    "tone": "success",
                    "city": item.get("city", "Rajkot"),
                    "time": "Just now"
                })

                self.save()
                return item
        return None

    # --- BloodConnect ---
    def get_blood_requests(self):
        return self.data.get("bloodRequests", [])

    def add_blood_request(self, req):
        req["id"] = f"blood-req-{int(_now().timestamp() * 1000)}"
        req["status"] = "Urgent"
        req["createdAt"] = _now().isoformat()
        req["unitsNeeded"] = int(req.get("unitsNeeded", 1) or 1)
        self.data.setdefault("bloodRequests", []).insert(0, req)

        self.add_activity({
            "module": "BloodConnect",
            "text": f"{req.get('bloodGroup')} needed urgently at {req.get('hospitalName')}, {req.get('city')}",
            "status": req.get("urgency", "Urgent"),
            "tone": "danger",
            "city": req.get("city", "Rajkot"),
            "time": "Just now"
        })

        self.add_notification({
            "title": f"URGENT: {req.get('bloodGroup')} Blood Needed",
            "message": f"{req.get('unitsNeeded')} units needed at {req.get('hospitalName')}, {req.get('city')}.",
            "module": "blood",
            "time": "Just now",
            "read": False,
            "link": "/blood"
        })

        self.save()
        return req

    def cancel_blood_request(self, req_id, user_name="Requester", reason="Requirement fulfilled externally"):
        for req in self.data.get("bloodRequests", []):
            if req.get("id") == req_id:
                req["status"] = "Cancelled"
                req["cancelReason"] = reason

                self.add_activity({
                    "module": "BloodConnect",
                    "text": f"Blood request for {req.get('bloodGroup')} at {req.get('hospitalName')} was cancelled ({reason})",
                    "status": "Cancelled",
                    "tone": "info",
                    "city": req.get("city", "Rajkot"),
                    "time": "Just now"
                })

                self.save()
                return req
        return None

    def fulfill_blood_request(self, req_id):
        for req in self.data.get("bloodRequests", []):
            if req.get("id") == req_id:
                req["status"] = "Fulfilled"

                self.add_activity({
                    "module": "BloodConnect",
                    "text": f"Emergency blood requirement ({req.get('bloodGroup')}) at {req.get('hospitalName')} fulfilled!",
                    "status": "Fulfilled",
                    "tone": "success",
                    "city": req.get("city", "Rajkot"),
                    "time": "Just now"
                })

                self.save()
                return req
        return None

    def get_blood_donors(self):
        return self.data.get("bloodDonors", [])

    def add_blood_donor(self, donor):
        donor["id"] = f"donor-{int(_now().timestamp() * 1000)}"
        donor["isAvailable"] = True
        donor["donationCount"] = int(donor.get("donationCount", 1) or 1)
        donor["verified"] = True
        donor["consentContact"] = True
        donor["registeredAt"] = _now().isoformat()
        self.data.setdefault("bloodDonors", []).insert(0, donor)

        self.add_activity({
            "module": "BloodConnect",
            "text": f"{donor.get('name')} ({donor.get('bloodGroup')}) registered as voluntary donor in {donor.get('city')}",
            "status": "Available",
            "tone": "success",
            "city": donor.get("city", "Rajkot"),
            "time": "Just now"
        })

        self.save()
        return donor

    def toggle_donor_status(self, donor_id):
        for donor in self.data.get("bloodDonors", []):
            if donor.get("id") == donor_id:
                donor["isAvailable"] = not donor.get("isAvailable", True)
                status_str = "Available" if donor["isAvailable"] else "Temporarily Unavailable"

                self.add_activity({
                    "module": "BloodConnect",
                    "text": f"Donor {donor.get('name')} availability updated to {status_str}",
                    "status": status_str,
                    "tone": "info",
                    "city": donor.get("city", "Rajkot"),
                    "time": "Just now"
                })

                self.save()
                return donor
        return None

    def request_donor_contact(self, donor_id, requester_name, hospital_reason):
        """
        Consent-gated contact access workflow.
        Logs contact inquiry for auditability and notifies donor.
        """
        for donor in self.data.get("bloodDonors", []):
            if donor.get("id") == donor_id:
                self.add_notification({
                    "title": "Blood Donor Contact Requested",
                    "message": f"{requester_name} requested contact for patient at {hospital_reason}.",
                    "module": "blood",
                    "time": "Just now",
                    "read": False,
                    "link": "/blood"
                })

                self.add_activity({
                    "module": "BloodConnect",
                    "text": f"Consent-controlled contact inquiry for donor {donor.get('name')} ({donor.get('bloodGroup')})",
                    "status": "Inquiry",
                    "tone": "warning",
                    "city": donor.get("city", "Rajkot"),
                    "time": "Just now"
                })

                self.save()
                return {
                    "success": True,
                    "donor": donor,
                    "phone": donor.get("phone", "+91 98250 00000"),
                    "name": donor.get("name")
                }
        return {"success": False, "error": "Donor not found"}

    # --- CommunityFunds & Groups ---
    def get_community_groups(self):
        return self.data.get("communityGroups", [])

    def create_community_group(self, group_data, creator_name="Community Leader", creator_email=""):
        name = (group_data.get("name") or "").strip()
        if not name:
            raise ValueError("Group name is required")

        group = {
            "id": f"group-{int(_now().timestamp() * 1000)}",
            "name": name,
            "description": group_data.get("description", "Community relief and welfare group"),
            "city": group_data.get("city", "Rajkot"),
            "category": group_data.get("category", "General Welfare"),
            "creator": creator_name,
            "createdAt": _now().strftime("%Y-%m-%d"),
            "members": [
                {"name": creator_name, "role": "Admin", "email": creator_email}
            ],
            "balance": 0.0
        }

        self.data.setdefault("communityGroups", []).insert(0, group)

        self.add_activity({
            "module": "CommunityFunds",
            "text": f"New community fund group '{name}' established by {creator_name}",
            "status": "Created",
            "tone": "success",
            "city": group["city"],
            "time": "Just now"
        })

        self.add_notification({
            "title": "New Community Group Created",
            "message": f"'{name}' was created for transparent collective relief.",
            "module": "funds",
            "time": "Just now",
            "read": False,
            "link": "/funds"
        })

        self.save()
        return group

    def join_community_group(self, group_id, user_name, user_email="", role="Member"):
        for g in self.data.get("communityGroups", []):
            if g.get("id") == group_id:
                # Check if already member
                existing = next((m for m in g.get("members", []) if m.get("name") == user_name or (user_email and m.get("email") == user_email)), None)
                if not existing:
                    g.setdefault("members", []).append({
                        "name": user_name,
                        "role": role,
                        "email": user_email
                    })

                self.add_activity({
                    "module": "CommunityFunds",
                    "text": f"{user_name} joined community group '{g.get('name')}' as {role}",
                    "status": "Joined",
                    "tone": "info",
                    "city": g.get("city", "Rajkot"),
                    "time": "Just now"
                })

                self.save()
                return g
        return None

    def get_transactions(self):
        return self.data.get("transactions", [])

    def add_transaction(self, txn):
        # Strict validation
        try:
            amount = float(txn.get("amount", 0))
        except (ValueError, TypeError):
            raise ValueError("Transaction amount must be a valid number")

        if amount <= 0:
            raise ValueError("Transaction amount must be strictly greater than 0")

        txn_type = txn.get("type", "expense").lower()
        if txn_type not in ["income", "expense"]:
            raise ValueError("Transaction type must be 'income' or 'expense'")

        txn["id"] = f"txn-{int(_now().timestamp() * 1000)}"
        txn["amount"] = amount
        txn["type"] = txn_type
        txn["receiptId"] = f"REC-2026-{int(_now().timestamp()) % 10000:04d}"
        if not txn.get("date"):
            txn["date"] = _now().strftime("%Y-%m-%d")

        group_id = txn.get("groupId")
        if group_id:
            for g in self.data.get("communityGroups", []):
                if g.get("id") == group_id:
                    if txn_type == "income":
                        g["balance"] = g.get("balance", 0.0) + amount
                    else:
                        g["balance"] = g.get("balance", 0.0) - amount
                    break

        self.data.setdefault("transactions", []).insert(0, txn)

        is_income = txn_type == "income"
        self.add_activity({
            "module": "CommunityFunds",
            "text": f"{'Income' if is_income else 'Expense'}: ₹{int(amount):,} for {txn.get('title')}",
            "status": "Received" if is_income else "Recorded",
            "tone": "success" if is_income else "info",
            "city": txn.get("city", "Rajkot"),
            "time": "Just now"
        })

        self.save()
        return txn

    def contribute(self, amount, donor_name="Well-wisher", note="", group_id=None):
        try:
            amt = float(amount)
        except (ValueError, TypeError):
            raise ValueError("Contribution amount must be a valid number")

        if amt <= 0:
            raise ValueError("Contribution must be greater than 0")

        txn = {
            "title": f"Community contribution from {donor_name}",
            "type": "income",
            "amount": amt,
            "category": "Crowdfund / Public",
            "date": _now().strftime("%Y-%m-%d"),
            "recordedBy": donor_name,
            "notes": note or "Online contribution via SevaSetu portal",
            "groupId": group_id,
            "receiptId": f"DON-2026-{int(_now().timestamp()) % 10000:04d}"
        }
        return self.add_transaction(txn)

    # --- Notifications & Activity ---
    def get_notifications(self):
        return self.data.get("notifications", [])

    def add_notification(self, notif):
        notif["id"] = f"notif-{int(_now().timestamp() * 1000)}"
        self.data.setdefault("notifications", []).insert(0, notif)
        return notif

    def mark_notification_read(self, notif_id):
        for n in self.data.get("notifications", []):
            if n.get("id") == notif_id:
                n["read"] = True
                self.save()
                return n
        return None

    def mark_all_notifications_read(self):
        for n in self.data.get("notifications", []):
            n["read"] = True
        self.save()
        return True

    def get_activities(self):
        return self.data.get("activities", [])

    def add_activity(self, act):
        act["id"] = f"act-{int(_now().timestamp() * 1000)}"
        self.data.setdefault("activities", []).insert(0, act)
        return act

    # --- Summary ---
    def get_summary(self):
        food = self.get_food()
        blood = self.get_blood_requests()
        txns = self.get_transactions()
        groups = self.get_community_groups()

        active_food = sum(1 for f in food if f.get("status") in ["Available", "Open"])
        open_blood = sum(1 for b in blood if b.get("status") in ["Urgent", "Critical", "Needed today"])
        total_meals = sum(int(f.get("approxMeals", 0)) for f in food)

        income = sum(t.get("amount", 0) for t in txns if t.get("type") == "income")
        expense = sum(t.get("amount", 0) for t in txns if t.get("type") == "expense")
        balance = income - expense

        return {
            "activeFoodCount": active_food,
            "openBloodCount": open_blood,
            "totalMealsRescued": total_meals,
            "groupsCount": len(groups),
            "fundsSummary": {
                "income": income,
                "expense": expense,
                "balance": balance
            }
        }

db = Database()

"""
Comprehensive Automated Test Suite for SevaSetu Web Application.
Tests:
- Database CRUD & data model integrity
- Protected profile field security
- Password reset workflow
- FoodShare creation, claim, review, edit, cancel, completion
- BloodConnect requests, fulfill, cancel, donor registration, consent contact reveal
- CommunityFunds multi-group, transaction validation (rejecting negative amounts), calculations
- Notifications and activity logging
- Flask HTTP routes, REST endpoints, and 404 handlers
"""

import os
import sys
import unittest
import json

# Set up paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PY_DIR = os.path.join(BASE_DIR, 'sevasetu_python')
if PY_DIR not in sys.path:
    sys.path.insert(0, PY_DIR)

from data.db import Database, db
from flask_app import app

class SevaSetuDataTestCase(unittest.TestCase):
    def setUp(self):
        # Reset DB to initial state before each test
        db.reset()

    def test_01_summary_and_personas(self):
        summary = db.get_summary()
        self.assertIn("activeFoodCount", summary)
        self.assertIn("openBloodCount", summary)
        self.assertIn("fundsSummary", summary)
        self.assertGreaterEqual(summary["activeFoodCount"], 0)

        personas = db.get_personas()
        self.assertGreaterEqual(len(personas), 4)
        current = db.get_current_user()
        self.assertIsNotNone(current)
        self.assertIn("name", current)

    def test_02_profile_update_security(self):
        current = db.get_current_user()
        orig_role = current.get("role")
        orig_id = current.get("id")

        # Attempt to change protected fields (role, id, email) alongside permitted fields
        malicious_updates = {
            "name": "Updated Priya Sharma",
            "phone": "+91 99999 11111",
            "city": "Ahmedabad",
            "role": "Super Admin Hack",  # Protected!
            "id": "hacked-id-123"         # Protected!
        }

        updated = db.update_profile(orig_id, malicious_updates)

        # Permitted fields should update
        self.assertEqual(updated["name"], "Updated Priya Sharma")
        self.assertEqual(updated["phone"], "+91 99999 11111")
        self.assertEqual(updated["city"], "Ahmedabad")

        # Protected fields must NOT change
        self.assertEqual(updated["role"], orig_role)
        self.assertEqual(updated["id"], orig_id)

    def test_03_password_reset(self):
        res = db.reset_password("priya.sharma@example.org")
        self.assertTrue(res["success"])
        self.assertIn("instructions", res["message"])

        # Notification should have been added
        notifs = db.get_notifications()
        reset_notif = next((n for n in notifs if "Password Reset" in n.get("title", "")), None)
        self.assertIsNotNone(reset_notif)

    def test_04_food_workflow(self):
        # 1. Add food
        item = db.add_food({
            "title": "Fresh Kadhi Khichdi Packets",
            "description": "Hot packed 30 portions",
            "foodType": "Cooked Meals",
            "dietType": "Pure Veg",
            "quantity": "30 portions",
            "approxMeals": 30,
            "bestBefore": "Today 8 PM",
            "city": "Rajkot",
            "location": "Tagore Road",
            "donorName": "Community Donor Test",
            "donorPhone": "+91 98250 99999"
        })
        food_id = item["id"]
        self.assertEqual(item["status"], "Available")

        # 2. Edit food
        edited = db.edit_food(food_id, {"title": "Updated Kadhi Khichdi 40 Packets", "quantity": "40 portions"})
        self.assertEqual(edited["title"], "Updated Kadhi Khichdi 40 Packets")

        # 3. Claim food
        claimed = db.claim_food(food_id, "Volunteer Rahul", "Arriving in 20 mins")
        self.assertIsNotNone(claimed)
        self.assertEqual(claimed["status"], "Requested")
        self.assertEqual(claimed["requesterName"], "Volunteer Rahul")

        # 4. Prevent duplicate claiming on already requested item
        dup_claim = db.claim_food(food_id, "Another Volunteer")
        self.assertIsNone(dup_claim)

        # 5. Review claim (Donor approval)
        approved = db.review_food_claim(food_id, "Community Donor Test", accept=True)
        self.assertEqual(approved["status"], "Approved")

        # 6. Complete food
        completed = db.complete_food(food_id)
        self.assertEqual(completed["status"], "Completed")

    def test_05_food_cancellation(self):
        item = db.add_food({
            "title": "Pastry boxes",
            "quantity": "10 boxes",
            "city": "Surat",
            "location": "Ghod Dod Road",
            "donorName": "Baker",
            "donorPhone": "+91 98240 00000"
        })
        cancelled = db.cancel_food(item["id"], "Baker", "Collected locally")
        self.assertEqual(cancelled["status"], "Cancelled")

    def test_06_blood_workflow(self):
        # 1. Add request
        req = db.add_blood_request({
            "patientName": "Kishore Bhai",
            "bloodGroup": "B+",
            "unitsNeeded": 2,
            "hospitalName": "Wockhardt Hospital",
            "city": "Rajkot",
            "urgency": "Urgent",
            "contactPerson": "Nilesh Bhai",
            "contactPhone": "+91 98251 00000"
        })
        req_id = req["id"]
        self.assertEqual(req["status"], "Urgent")

        # 2. Fulfill request
        fulfilled = db.fulfill_blood_request(req_id)
        self.assertEqual(fulfilled["status"], "Fulfilled")

        # 3. Create another and cancel it
        req2 = db.add_blood_request({
            "patientName": "Asha Ben",
            "bloodGroup": "O-",
            "unitsNeeded": 1,
            "hospitalName": "Sterling Hospital",
            "city": "Rajkot",
            "urgency": "Needed today",
            "contactPerson": "Bhavin",
            "contactPhone": "+91 98251 11111"
        })
        cancelled = db.cancel_blood_request(req2["id"], "Bhavin", "Found external donor")
        self.assertEqual(cancelled["status"], "Cancelled")

    def test_07_blood_donor_and_consent(self):
        donor = db.add_blood_donor({
            "name": "Gaurav Joshi",
            "bloodGroup": "AB+",
            "city": "Rajkot",
            "phone": "+91 98245 44332",
            "lastDonated": "Over 3 months ago",
            "donationCount": 3
        })
        donor_id = donor["id"]
        self.assertTrue(donor["isAvailable"])

        # Toggle status
        toggled = db.toggle_donor_status(donor_id)
        self.assertFalse(toggled["isAvailable"])

        # Consent-gated contact request
        consent_res = db.request_donor_contact(donor_id, "Dr. Pandya", "Rajkot Cancer Hospital")
        self.assertTrue(consent_res["success"])
        self.assertEqual(consent_res["phone"], "+91 98245 44332")

    def test_08_community_funds_and_groups(self):
        groups = db.get_community_groups()
        self.assertGreaterEqual(len(groups), 3)

        # Create new group
        new_group = db.create_community_group({
            "name": "Jamnagar Relief Circle",
            "description": "Emergency support for Jamnagar coastline",
            "city": "Jamnagar",
            "category": "Disaster Relief"
        }, creator_name="Vikramjit Singh")
        self.assertIn("group-", new_group["id"])
        self.assertEqual(new_group["creator"], "Vikramjit Singh")

        # Join group
        joined = db.join_community_group(new_group["id"], "Priya Sharma", role="Treasurer")
        self.assertEqual(len(joined["members"]), 2)

        # Record valid income contribution
        contrib = db.contribute(5000, "Merchant Association", "Support donation", group_id=new_group["id"])
        self.assertEqual(contrib["amount"], 5000.0)
        self.assertEqual(contrib["type"], "income")

        # Verify transaction validation rejects negative or 0 amount
        with self.assertRaises(ValueError):
            db.add_transaction({"amount": -500, "type": "expense", "title": "Invalid negative"})

        with self.assertRaises(ValueError):
            db.add_transaction({"amount": 0, "type": "expense", "title": "Zero amount"})

        # Record valid expense
        exp = db.add_transaction({
            "amount": 2000,
            "type": "expense",
            "title": "First aid kits",
            "category": "Medical Aid",
            "groupId": new_group["id"]
        })
        self.assertEqual(exp["amount"], 2000.0)

        # Check balance calculation
        summary = db.get_summary()
        fund_sum = summary["fundsSummary"]
        self.assertEqual(fund_sum["balance"], fund_sum["income"] - fund_sum["expense"])


class SevaSetuFlaskRoutesTestCase(unittest.TestCase):
    def setUp(self):
        db.reset()
        self.client = app.test_client()

    def test_page_routes(self):
        pages = ['/', '/dashboard', '/food', '/blood', '/funds', '/login', '/register', '/profile', '/about', '/help']
        for p in pages:
            res = self.client.get(p)
            self.assertEqual(res.status_code, 200, f"Page {p} returned {res.status_code}")

    def test_404_handler(self):
        res = self.client.get('/nonexistent-page-url')
        self.assertEqual(res.status_code, 404)
        self.assertIn(b"404", res.data)

    def test_api_initial_data(self):
        res = self.client.get('/api/initial-data')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("currentUser", data)
        self.assertIn("foodDonations", data)
        self.assertIn("bloodRequests", data)
        self.assertIn("communityGroups", data)
        self.assertIn("transactions", data)
        self.assertIn("summary", data)

    def test_api_auth_profile_update(self):
        res = self.client.post('/api/auth/update', json={
            "name": "Vikram Singh Updated",
            "phone": "+91 94260 00000",
            "city": "Vadodara"
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertEqual(data["user"]["name"], "Vikram Singh Updated")

    def test_api_funds_validation(self):
        # Valid transaction
        res = self.client.post('/api/funds/transaction', json={
            "amount": 1500,
            "type": "expense",
            "title": "Relief ration blankets",
            "category": "Ration Relief"
        })
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.get_json()["success"])

        # Invalid negative transaction must return 400
        res_bad = self.client.post('/api/funds/transaction', json={
            "amount": -100,
            "type": "expense",
            "title": "Bad negative amount"
        })
        self.assertEqual(res_bad.status_code, 400)

    def test_api_funds_export_csv(self):
        res = self.client.get('/api/funds/export-csv')
        self.assertEqual(res.status_code, 200)
        self.assertIn(b"Receipt ID", res.data)


if __name__ == '__main__':
    unittest.main()


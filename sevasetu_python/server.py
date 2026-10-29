"""
SevaSetu Python Web Application Server.
Uses Python's standard library (http.server) - zero external dependencies required!
Serves HTML templates, static CSS/JS, and complete JSON REST API endpoints.
"""

import os
import sys
import json
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
import mimetypes
from datetime import datetime, timezone

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Add current dir to path to import data modules
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from data.db import db

TEMPLATES_DIR = os.path.join(BASE_DIR, 'templates')
STATIC_DIR = os.path.join(BASE_DIR, 'static')

# Map URL routes to template files
ROUTES = {
    '/': 'index.html',
    '/index': 'index.html',
    '/dashboard': 'dashboard.html',
    '/food': 'food.html',
    '/blood': 'blood.html',
    '/funds': 'funds.html',
    '/login': 'login.html',
    '/register': 'register.html',
    '/profile': 'profile.html',
    '/about': 'about.html',
    '/help': 'help.html',
}

class SevaSetuHandler(BaseHTTPRequestHandler):
    def send_json(self, data, status=200):
        response_bytes = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(response_bytes)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(response_bytes)

    def send_file_response(self, filepath, content_type=None, status=200):
        if not os.path.exists(filepath):
            self.send_error(404, f"File not found: {os.path.basename(filepath)}")
            return

        if not content_type:
            content_type, _ = mimetypes.guess_type(filepath)
            if not content_type:
                content_type = 'application/octet-stream'

        try:
            with open(filepath, 'rb') as f:
                content = f.read()

            self.send_response(status)
            self.send_header('Content-Type', content_type)
            self.send_header('Content-Length', str(len(content)))
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_error(500, f"Error reading file: {e}")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.rstrip('/') or '/'
        query = urllib.parse.parse_qs(parsed.query)

        # 1. API Endpoints
        if path.startswith('/api/'):
            return self.handle_api_get(path, query)

        # 2. Static files (/static/...)
        if path.startswith('/static/'):
            rel_path = path[len('/static/'):].replace('/', os.sep)
            filepath = os.path.join(STATIC_DIR, rel_path)
            return self.send_file_response(filepath)

        # 3. HTML Pages
        template_name = ROUTES.get(path)
        if template_name:
            template_path = os.path.join(TEMPLATES_DIR, template_name)
            return self.send_file_response(template_path, 'text/html; charset=utf-8')

        # Fallback 404 page
        template_404 = os.path.join(TEMPLATES_DIR, '404.html')
        if os.path.exists(template_404):
            return self.send_file_response(template_404, 'text/html; charset=utf-8', status=404)

        self.send_response(404)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.end_headers()
        self.wfile.write(b"<h1>404 - Page Not Found</h1><p><a href='/'>Return to SevaSetu Home</a></p>")

    def handle_api_get(self, path, query):
        if path == '/api/initial-data':
            return self.send_json({
                "currentUser": db.get_current_user(),
                "personas": db.get_personas(),
                "foodDonations": db.get_food(),
                "bloodRequests": db.get_blood_requests(),
                "bloodDonors": db.get_blood_donors(),
                "transactions": db.get_transactions(),
                "communityGroups": db.get_community_groups(),
                "notifications": db.get_notifications(),
                "activities": db.get_activities(),
                "summary": db.get_summary()
            })

        elif path == '/api/summary':
            return self.send_json(db.get_summary())

        elif path == '/api/food':
            return self.send_json(db.get_food())

        elif path == '/api/blood/requests':
            return self.send_json(db.get_blood_requests())

        elif path == '/api/blood/donors':
            return self.send_json(db.get_blood_donors())

        elif path == '/api/funds':
            return self.send_json({
                "transactions": db.get_transactions(),
                "summary": db.get_summary()["fundsSummary"],
                "groups": db.get_community_groups()
            })

        elif path == '/api/funds/groups':
            return self.send_json(db.get_community_groups())

        elif path == '/api/funds/export-csv':
            txns = db.get_transactions()
            csv_lines = ["Receipt ID,Date,Type,Category,Description,Amount (INR),Recorded By,Notes"]
            for t in txns:
                desc = t.get('title', '').replace('"', '""')
                notes = t.get('notes', '').replace('"', '""')
                csv_lines.append(f'"{t.get("receiptId")}","{t.get("date")}","{t.get("type")}","{t.get("category")}","{desc}",{t.get("amount")},"{t.get("recordedBy")}","{notes}"')
            csv_body = "\n".join(csv_lines).encode('utf-8')

            self.send_response(200)
            self.send_header('Content-Type', 'text/csv; charset=utf-8')
            self.send_header('Content-Disposition', 'attachment; filename="sevasetu_ledger.csv"')
            self.send_header('Content-Length', str(len(csv_body)))
            self.end_headers()
            self.wfile.write(csv_body)
            return

        elif path == '/api/notifications':
            return self.send_json(db.get_notifications())

        elif path == '/api/activities':
            return self.send_json(db.get_activities())

        elif path == '/api/auth/me':
            return self.send_json(db.get_current_user())

        else:
            return self.send_json({"error": "Endpoint not found"}, status=404)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.rstrip('/')

        content_length = int(self.headers.get('Content-Length', 0))
        post_data = {}
        if content_length > 0:
            raw_body = self.rfile.read(content_length).decode('utf-8')
            try:
                post_data = json.loads(raw_body)
            except Exception:
                post_data = urllib.parse.parse_qs(raw_body)

        # 1. Food actions
        if path == '/api/food':
            item = db.add_food(post_data)
            return self.send_json({"success": True, "item": item})

        elif path == '/api/food/edit':
            item = db.edit_food(post_data.get('id'), post_data, post_data.get('donorName', 'Donor'))
            return self.send_json({"success": bool(item), "item": item})

        elif path == '/api/food/cancel':
            item = db.cancel_food(post_data.get('id'), post_data.get('userName', 'Donor'), post_data.get('reason', 'Cancelled by donor'))
            return self.send_json({"success": bool(item), "item": item})

        elif path == '/api/food/claim':
            food_id = post_data.get('id')
            requester = post_data.get('requesterName', 'Volunteer')
            notes = post_data.get('notes', '')
            res = db.claim_food(food_id, requester, notes)
            if not res:
                return self.send_json({"success": False, "error": "Item not available for claim"}, status=400)
            return self.send_json({"success": True, "item": res})

        elif path == '/api/food/review':
            accept = post_data.get('accept', True)
            res = db.review_food_claim(post_data.get('id'), post_data.get('donorName', 'Donor'), accept)
            return self.send_json({"success": bool(res), "item": res})

        elif path == '/api/food/complete':
            food_id = post_data.get('id')
            res = db.complete_food(food_id)
            return self.send_json({"success": bool(res), "item": res})

        # 2. Blood actions
        elif path == '/api/blood/requests':
            req = db.add_blood_request(post_data)
            return self.send_json({"success": True, "request": req})

        elif path == '/api/blood/requests/fulfill':
            req_id = post_data.get('id')
            res = db.fulfill_blood_request(req_id)
            return self.send_json({"success": bool(res), "request": res})

        elif path == '/api/blood/requests/cancel':
            req_id = post_data.get('id')
            res = db.cancel_blood_request(req_id, post_data.get('userName', 'Requester'), post_data.get('reason', 'Cancelled'))
            return self.send_json({"success": bool(res), "request": res})

        elif path == '/api/blood/donors':
            donor = db.add_blood_donor(post_data)
            return self.send_json({"success": True, "donor": donor})

        elif path == '/api/blood/donors/toggle':
            donor_id = post_data.get('id')
            res = db.toggle_donor_status(donor_id)
            return self.send_json({"success": bool(res), "donor": res})

        elif path == '/api/blood/donors/contact':
            res = db.request_donor_contact(
                post_data.get('id'),
                post_data.get('requesterName', 'Hospital Coordinator'),
                post_data.get('hospitalReason', 'Emergency Blood Need')
            )
            return self.send_json(res)

        # 3. Funds & Groups actions
        elif path == '/api/funds/groups':
            current_user = db.get_current_user()
            try:
                group = db.create_community_group(post_data, current_user.get('name', 'Community Leader'), current_user.get('email', ''))
                return self.send_json({"success": True, "group": group})
            except ValueError as e:
                return self.send_json({"success": False, "error": str(e)}, status=400)

        elif path == '/api/funds/groups/join':
            current_user = db.get_current_user()
            group = db.join_community_group(
                post_data.get('groupId'),
                current_user.get('name', 'Volunteer'),
                current_user.get('email', ''),
                post_data.get('role', 'Member')
            )
            return self.send_json({"success": bool(group), "group": group})

        elif path == '/api/funds/transaction':
            try:
                txn = db.add_transaction(post_data)
                return self.send_json({"success": True, "transaction": txn})
            except ValueError as e:
                return self.send_json({"success": False, "error": str(e)}, status=400)

        elif path == '/api/funds/contribute':
            amount = post_data.get('amount', 1000)
            donor = post_data.get('name', 'Community Supporter')
            note = post_data.get('note', '')
            group_id = post_data.get('groupId')
            try:
                txn = db.contribute(amount, donor, note, group_id)
                return self.send_json({"success": True, "transaction": txn})
            except ValueError as e:
                return self.send_json({"success": False, "error": str(e)}, status=400)

        # 4. Notifications actions
        elif path == '/api/notifications/read':
            notif_id = post_data.get('id')
            res = db.mark_notification_read(notif_id)
            return self.send_json({"success": bool(res)})

        elif path == '/api/notifications/read-all':
            db.mark_all_notifications_read()
            return self.send_json({"success": True})

        # 5. Auth actions
        elif path == '/api/auth/persona':
            persona_id = post_data.get('id')
            personas = db.get_personas()
            matched = next((p for p in personas if p['id'] == persona_id), None)
            if matched:
                db.set_current_user(matched)
                return self.send_json({"success": True, "user": matched})
            return self.send_json({"error": "Persona not found"}, status=404)

        elif path == '/api/auth/login':
            email = post_data.get('email', '').strip()
            personas = db.get_personas()
            matched = next((p for p in personas if p['email'].lower() == email.lower()), None)
            if matched:
                db.set_current_user(matched)
                return self.send_json({"success": True, "user": matched})

            user = {
                "id": f"user-{int(datetime.now(timezone.utc).timestamp())}",
                "name": email.split('@')[0].replace('.', ' ').title() if '@' in email else "Community Member",
                "email": email,
                "role": "Community Member",
                "city": "Rajkot",
                "phone": "+91 98000 00000",
                "organization": "Individual Supporter",
                "avatarBg": "#0f766e",
                "joinedDate": "Today",
                "mealsRescued": 0,
                "bloodDonated": False,
                "contributions": 0
            }
            db.set_current_user(user)
            return self.send_json({"success": True, "user": user})

        elif path == '/api/auth/register':
            user = {
                "id": f"user-{int(datetime.now(timezone.utc).timestamp())}",
                "name": post_data.get('name', 'New User'),
                "email": post_data.get('email', ''),
                "phone": post_data.get('phone', '+91 98000 00000'),
                "city": post_data.get('city', 'Rajkot'),
                "role": post_data.get('role', 'Volunteer'),
                "organization": post_data.get('organization', 'Individual'),
                "avatarBg": "#0f766e",
                "joinedDate": "Just now",
                "mealsRescued": 0,
                "bloodDonated": False,
                "contributions": 0
            }
            db.set_current_user(user)
            return self.send_json({"success": True, "user": user})

        elif path == '/api/auth/update':
            current = db.get_current_user()
            updated = db.update_profile(current.get('id'), post_data)
            return self.send_json({"success": True, "user": updated})

        elif path == '/api/auth/password-reset':
            email = post_data.get('email', '')
            res = db.reset_password(email)
            return self.send_json(res)

        # 6. Reset action
        elif path == '/api/reset':
            db.reset()
            return self.send_json({"success": True, "message": "All data reset to defaults"})

        else:
            return self.send_json({"error": "Unknown API route"}, status=404)

def run_server(port=5000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, SevaSetuHandler)
    print(f"[*] SevaSetu server running on http://localhost:{port}/ ...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[*] Server stopped.")
        httpd.server_close()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    run_server(port)

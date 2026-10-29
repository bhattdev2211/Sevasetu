"""
SevaSetu Flask Application.
Provides Flask routes and REST API endpoints.
Run with:
    python app.py
"""

import os
import sys

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from datetime import datetime, timezone
from flask import Flask, render_template, request, jsonify, Response, send_from_directory

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from data.db import db

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, 'templates'),
    static_folder=os.path.join(BASE_DIR, 'static')
)
app.config['SECRET_KEY'] = 'sevasetu-secret-key-2026'

# --- HTML Pages ---
@app.route('/')
@app.route('/index')
def page_home():
    return render_template('index.html')

@app.route('/dashboard')
def page_dashboard():
    return render_template('dashboard.html')

@app.route('/food')
def page_food():
    return render_template('food.html')

@app.route('/blood')
def page_blood():
    return render_template('blood.html')

@app.route('/funds')
def page_funds():
    return render_template('funds.html')

@app.route('/login')
def page_login():
    return render_template('login.html')

@app.route('/register')
def page_register():
    return render_template('register.html')

@app.route('/profile')
def page_profile():
    return render_template('profile.html')

@app.route('/about')
def page_about():
    return render_template('about.html')

@app.route('/help')
def page_help():
    return render_template('help.html')

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

# --- REST APIs ---
@app.route('/api/initial-data', methods=['GET'])
def api_initial_data():
    return jsonify({
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

@app.route('/api/summary', methods=['GET'])
def api_summary():
    return jsonify(db.get_summary())

# --- Food Endpoints ---
@app.route('/api/food', methods=['GET', 'POST'])
def api_food():
    if request.method == 'POST':
        data = request.get_json() or {}
        item = db.add_food(data)
        return jsonify({"success": True, "item": item})
    return jsonify(db.get_food())

@app.route('/api/food/edit', methods=['POST'])
def api_food_edit():
    data = request.get_json() or {}
    item = db.edit_food(data.get('id'), data, data.get('donorName', 'Donor'))
    return jsonify({"success": bool(item), "item": item})

@app.route('/api/food/cancel', methods=['POST'])
def api_food_cancel():
    data = request.get_json() or {}
    item = db.cancel_food(data.get('id'), data.get('userName', 'Donor'), data.get('reason', 'Cancelled by donor'))
    return jsonify({"success": bool(item), "item": item})

@app.route('/api/food/claim', methods=['POST'])
def api_food_claim():
    data = request.get_json() or {}
    item = db.claim_food(data.get('id'), data.get('requesterName', 'Volunteer'), data.get('notes', ''))
    if not item:
        return jsonify({"success": False, "error": "Donation is not available for claim"}), 400
    return jsonify({"success": True, "item": item})

@app.route('/api/food/review', methods=['POST'])
def api_food_review():
    data = request.get_json() or {}
    accept = data.get('accept', True)
    item = db.review_food_claim(data.get('id'), data.get('donorName', 'Donor'), accept)
    return jsonify({"success": bool(item), "item": item})

@app.route('/api/food/complete', methods=['POST'])
def api_food_complete():
    data = request.get_json() or {}
    item = db.complete_food(data.get('id'))
    return jsonify({"success": bool(item), "item": item})

# --- Blood Endpoints ---
@app.route('/api/blood/requests', methods=['GET', 'POST'])
def api_blood_requests():
    if request.method == 'POST':
        data = request.get_json() or {}
        req = db.add_blood_request(data)
        return jsonify({"success": True, "request": req})
    return jsonify(db.get_blood_requests())

@app.route('/api/blood/requests/fulfill', methods=['POST'])
def api_blood_fulfill():
    data = request.get_json() or {}
    req = db.fulfill_blood_request(data.get('id'))
    return jsonify({"success": bool(req), "request": req})

@app.route('/api/blood/requests/cancel', methods=['POST'])
def api_blood_cancel():
    data = request.get_json() or {}
    req = db.cancel_blood_request(data.get('id'), data.get('userName', 'Requester'), data.get('reason', 'Cancelled'))
    return jsonify({"success": bool(req), "request": req})

@app.route('/api/blood/donors', methods=['GET', 'POST'])
def api_blood_donors():
    if request.method == 'POST':
        data = request.get_json() or {}
        donor = db.add_blood_donor(data)
        return jsonify({"success": True, "donor": donor})
    return jsonify(db.get_blood_donors())

@app.route('/api/blood/donors/toggle', methods=['POST'])
def api_blood_donor_toggle():
    data = request.get_json() or {}
    donor = db.toggle_donor_status(data.get('id'))
    return jsonify({"success": bool(donor), "donor": donor})

@app.route('/api/blood/donors/contact', methods=['POST'])
def api_blood_donor_contact():
    data = request.get_json() or {}
    res = db.request_donor_contact(
        data.get('id'),
        data.get('requesterName', 'Hospital Coordinator'),
        data.get('hospitalReason', 'Emergency Blood Need')
    )
    return jsonify(res)

# --- CommunityFunds Endpoints ---
@app.route('/api/funds', methods=['GET'])
def api_funds():
    return jsonify({
        "transactions": db.get_transactions(),
        "summary": db.get_summary()["fundsSummary"],
        "groups": db.get_community_groups()
    })

@app.route('/api/funds/groups', methods=['GET', 'POST'])
def api_funds_groups():
    if request.method == 'POST':
        data = request.get_json() or {}
        current_user = db.get_current_user()
        try:
            group = db.create_community_group(data, current_user.get('name', 'Community Leader'), current_user.get('email', ''))
            return jsonify({"success": True, "group": group})
        except ValueError as e:
            return jsonify({"success": False, "error": str(e)}), 400
    return jsonify(db.get_community_groups())

@app.route('/api/funds/groups/join', methods=['POST'])
def api_funds_group_join():
    data = request.get_json() or {}
    current_user = db.get_current_user()
    group = db.join_community_group(
        data.get('groupId'),
        current_user.get('name', 'Volunteer'),
        current_user.get('email', ''),
        data.get('role', 'Member')
    )
    return jsonify({"success": bool(group), "group": group})

@app.route('/api/funds/transaction', methods=['POST'])
def api_funds_transaction():
    data = request.get_json() or {}
    try:
        txn = db.add_transaction(data)
        return jsonify({"success": True, "transaction": txn})
    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/funds/contribute', methods=['POST'])
def api_funds_contribute():
    data = request.get_json() or {}
    try:
        txn = db.contribute(
            data.get('amount', 1000),
            data.get('name', 'Supporter'),
            data.get('note', ''),
            data.get('groupId')
        )
        return jsonify({"success": True, "transaction": txn})
    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/funds/export-csv', methods=['GET'])
def api_funds_export_csv():
    txns = db.get_transactions()
    lines = ["Receipt ID,Date,Type,Category,Description,Amount (INR),Recorded By,Notes"]
    for t in txns:
        desc = t.get('title', '').replace('"', '""')
        notes = t.get('notes', '').replace('"', '""')
        lines.append(f'"{t.get("receiptId")}","{t.get("date")}","{t.get("type")}","{t.get("category")}","{desc}",{t.get("amount")},"{t.get("recordedBy")}","{notes}"')
    csv_text = "\n".join(lines)
    return Response(
        csv_text,
        mimetype="text/csv",
        headers={"Content-disposition": "attachment; filename=sevasetu_ledger.csv"}
    )

# --- Notifications & Activity ---
@app.route('/api/notifications', methods=['GET'])
def api_notifications():
    return jsonify(db.get_notifications())

@app.route('/api/notifications/read', methods=['POST'])
def api_notifications_read():
    data = request.get_json() or {}
    res = db.mark_notification_read(data.get('id'))
    return jsonify({"success": bool(res)})

@app.route('/api/notifications/read-all', methods=['POST'])
def api_notifications_read_all():
    db.mark_all_notifications_read()
    return jsonify({"success": True})

@app.route('/api/activities', methods=['GET'])
def api_activities():
    return jsonify(db.get_activities())

# --- Auth Endpoints ---
@app.route('/api/auth/me', methods=['GET'])
def api_auth_me():
    return jsonify(db.get_current_user())

@app.route('/api/auth/persona', methods=['POST'])
def api_auth_persona():
    data = request.get_json() or {}
    persona_id = data.get('id')
    personas = db.get_personas()
    matched = next((p for p in personas if p['id'] == persona_id), None)
    if matched:
        db.set_current_user(matched)
        return jsonify({"success": True, "user": matched})
    return jsonify({"error": "Persona not found"}), 404

@app.route('/api/auth/login', methods=['POST'])
def api_auth_login():
    data = request.get_json() or {}
    email = data.get('email', '').strip()
    personas = db.get_personas()
    matched = next((p for p in personas if p['email'].lower() == email.lower()), None)
    if matched:
        db.set_current_user(matched)
        return jsonify({"success": True, "user": matched})

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
    return jsonify({"success": True, "user": user})

@app.route('/api/auth/register', methods=['POST'])
def api_auth_register():
    data = request.get_json() or {}
    user = {
        "id": f"user-{int(datetime.now(timezone.utc).timestamp())}",
        "name": data.get('name', 'New User'),
        "email": data.get('email', ''),
        "phone": data.get('phone', '+91 98000 00000'),
        "city": data.get('city', 'Rajkot'),
        "role": data.get('role', 'Volunteer'),
        "organization": data.get('organization', 'Individual'),
        "avatarBg": "#0f766e",
        "joinedDate": "Just now",
        "mealsRescued": 0,
        "bloodDonated": False,
        "contributions": 0
    }
    db.set_current_user(user)
    return jsonify({"success": True, "user": user})

@app.route('/api/auth/update', methods=['POST'])
def api_auth_update():
    data = request.get_json() or {}
    current = db.get_current_user()
    updated = db.update_profile(current.get('id'), data)
    return jsonify({"success": True, "user": updated})

@app.route('/api/auth/password-reset', methods=['POST'])
def api_auth_password_reset():
    data = request.get_json() or {}
    email = data.get('email', '')
    res = db.reset_password(email)
    return jsonify(res)

@app.route('/api/reset', methods=['POST'])
def api_reset():
    db.reset()
    return jsonify({"success": True, "message": "All data reset to defaults"})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting SevaSetu Flask server on http://localhost:{port}/ ...")
    app.run(host='0.0.0.0', port=port, debug=False)

/**
 * SevaSetu API Client
 * Interfaces with Python backend REST endpoints.
 */

const API = {
  async request(endpoint, options = {}) {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {})
      }
    };

    try {
      const response = await fetch(endpoint, config);
      if (!response.ok) {
        let errData = {};
        try {
          errData = await response.json();
        } catch (_) {}
        const error = new Error(errData.error || `HTTP error! status: ${response.status}`);
        error.status = response.status;
        error.data = errData;
        throw error;
      }
      return await response.json();
    } catch (err) {
      console.error(`API Error on ${endpoint}:`, err);
      throw err;
    }
  },

  // Initial bundle & Summary
  getInitialData() {
    return this.request('/api/initial-data');
  },

  getSummary() {
    return this.request('/api/summary');
  },

  // FoodShare
  getFood() {
    return this.request('/api/food');
  },
  postFood(data) {
    return this.request('/api/food', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  editFood(id, data) {
    return this.request('/api/food/edit', {
      method: 'POST',
      body: JSON.stringify({ id, ...data })
    });
  },
  cancelFood(id, userName = 'Donor', reason = 'Cancelled by donor') {
    return this.request('/api/food/cancel', {
      method: 'POST',
      body: JSON.stringify({ id, userName, reason })
    });
  },
  claimFood(id, requesterName, notes = '') {
    return this.request('/api/food/claim', {
      method: 'POST',
      body: JSON.stringify({ id, requesterName, notes })
    });
  },
  reviewFoodClaim(id, donorName, accept = true) {
    return this.request('/api/food/review', {
      method: 'POST',
      body: JSON.stringify({ id, donorName, accept })
    });
  },
  completeFood(id) {
    return this.request('/api/food/complete', {
      method: 'POST',
      body: JSON.stringify({ id })
    });
  },

  // BloodConnect
  getBloodRequests() {
    return this.request('/api/blood/requests');
  },
  postBloodRequest(data) {
    return this.request('/api/blood/requests', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  fulfillBloodRequest(id) {
    return this.request('/api/blood/requests/fulfill', {
      method: 'POST',
      body: JSON.stringify({ id })
    });
  },
  cancelBloodRequest(id, userName = 'Requester', reason = 'Requirement fulfilled externally') {
    return this.request('/api/blood/requests/cancel', {
      method: 'POST',
      body: JSON.stringify({ id, userName, reason })
    });
  },
  getBloodDonors() {
    return this.request('/api/blood/donors');
  },
  postBloodDonor(data) {
    return this.request('/api/blood/donors', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  toggleBloodDonor(id) {
    return this.request('/api/blood/donors/toggle', {
      method: 'POST',
      body: JSON.stringify({ id })
    });
  },
  requestDonorContact(id, requesterName, hospitalReason) {
    return this.request('/api/blood/donors/contact', {
      method: 'POST',
      body: JSON.stringify({ id, requesterName, hospitalReason })
    });
  },

  // CommunityFunds & Groups
  getFunds() {
    return this.request('/api/funds');
  },
  getGroups() {
    return this.request('/api/funds/groups');
  },
  createGroup(data) {
    return this.request('/api/funds/groups', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  joinGroup(groupId, role = 'Member') {
    return this.request('/api/funds/groups/join', {
      method: 'POST',
      body: JSON.stringify({ groupId, role })
    });
  },
  postTransaction(data) {
    return this.request('/api/funds/transaction', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  contribute(amount, name, note, groupId = null) {
    return this.request('/api/funds/contribute', {
      method: 'POST',
      body: JSON.stringify({ amount, name, note, groupId })
    });
  },

  // Notifications & Activities
  getNotifications() {
    return this.request('/api/notifications');
  },
  markNotificationRead(id) {
    return this.request('/api/notifications/read', {
      method: 'POST',
      body: JSON.stringify({ id })
    });
  },
  markAllNotificationsRead() {
    return this.request('/api/notifications/read-all', {
      method: 'POST'
    });
  },
  getActivities() {
    return this.request('/api/activities');
  },

  // Auth & Personas
  getCurrentUser() {
    return this.request('/api/auth/me');
  },
  switchPersona(id) {
    return this.request('/api/auth/persona', {
      method: 'POST',
      body: JSON.stringify({ id })
    });
  },
  login(email) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },
  register(data) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  updateProfile(data) {
    return this.request('/api/auth/update', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  resetPassword(email) {
    return this.request('/api/auth/password-reset', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  // Demo Reset
  resetData() {
    return this.request('/api/reset', {
      method: 'POST'
    });
  }
};

/**
 * BloodConnect Page Logic
 */

let allBloodRequests = [];
let allBloodDonors = [];
let bloodTab = 'requests'; // 'requests' | 'donors'
let selectedBloodGroup = 'All Groups';
let selectedCity = 'All Cities';
let searchQuery = '';

let activeContactDonor = null;

async function initBloodConnect() {
  try {
    const [reqs, donors] = await Promise.all([
      API.getBloodRequests(),
      API.getBloodDonors()
    ]);
    allBloodRequests = reqs;
    allBloodDonors = donors;

    renderActiveTab();
  } catch (err) {
    console.error('Error loading blood data:', err);
  }

  // Tab switching
  const tabReqBtn = document.getElementById('tab-btn-requests');
  const tabDonorBtn = document.getElementById('tab-btn-donors');

  if (tabReqBtn && tabDonorBtn) {
    tabReqBtn.onclick = () => {
      bloodTab = 'requests';
      tabReqBtn.classList.add('active');
      tabDonorBtn.classList.remove('active');
      renderActiveTab();
    };
    tabDonorBtn.onclick = () => {
      bloodTab = 'donors';
      tabDonorBtn.classList.add('active');
      tabReqBtn.classList.remove('active');
      renderActiveTab();
    };
  }

  // Compatibility Chart toggle
  const compatBtn = document.getElementById('toggle-compat-btn');
  const compatBox = document.getElementById('compat-matrix-card');
  if (compatBtn && compatBox) {
    compatBtn.onclick = () => {
      const isHidden = compatBox.style.display === 'none';
      compatBox.style.display = isHidden ? 'block' : 'none';
      compatBtn.textContent = isHidden ? 'Hide Compatibility Chart' : 'Show Blood Compatibility Chart';
    };
  }

  // Search & City
  const searchEl = document.getElementById('blood-search');
  if (searchEl) {
    searchEl.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase();
      renderActiveTab();
    });
  }

  const cityEl = document.getElementById('blood-city-filter');
  if (cityEl) {
    cityEl.addEventListener('change', (e) => {
      selectedCity = e.target.value;
      renderActiveTab();
    });
  }

  // Blood Group Pills
  document.querySelectorAll('.blood-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.blood-pill').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      selectedBloodGroup = pill.dataset.group;
      renderActiveTab();
    });
  });

  // Post Blood Request Form
  const postReqForm = document.getElementById('post-blood-req-form');
  if (postReqForm) {
    postReqForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        patientName: document.getElementById('req-patient-name').value.trim(),
        bloodGroup: document.getElementById('req-blood-group').value,
        unitsNeeded: Number(document.getElementById('req-units').value) || 1,
        hospitalName: document.getElementById('req-hospital').value.trim(),
        city: document.getElementById('req-city').value,
        urgency: document.getElementById('req-urgency').value,
        contactPerson: document.getElementById('req-contact-name').value.trim(),
        contactPhone: document.getElementById('req-contact-phone').value.trim(),
        caseDetails: document.getElementById('req-notes').value.trim()
      };

      if (!data.patientName || !data.hospitalName || !data.contactPhone) {
        showToast('Please provide patient name, hospital, and emergency contact phone', 'warning');
        return;
      }

      try {
        const res = await API.postBloodRequest(data);
        if (res.success) {
          allBloodRequests.unshift(res.request);
          renderActiveTab();
          closeModal('post-blood-req-modal');
          postReqForm.reset();
          showToast(`Emergency request for ${data.bloodGroup} broadcasted to voluntary donors!`, 'success');
        }
      } catch (err) {
        showToast('Error publishing blood request. Please check connection.', 'danger');
      }
    });
  }

  // Register Donor Form
  const regDonorForm = document.getElementById('reg-donor-form');
  if (regDonorForm) {
    regDonorForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const currentUser = window.appState.currentUser || {};
      const data = {
        name: document.getElementById('donor-name').value.trim() || currentUser.name || 'Anonymous Donor',
        bloodGroup: document.getElementById('donor-blood-group').value,
        city: document.getElementById('donor-city').value,
        phone: document.getElementById('donor-phone').value.trim(),
        lastDonated: document.getElementById('donor-last-date').value || 'Over 3 months ago',
        donationCount: Number(document.getElementById('donor-prev-count').value) || 1
      };

      if (!data.phone) {
        showToast('Please provide a mobile contact for voluntary verification', 'warning');
        return;
      }

      try {
        const res = await API.postBloodDonor(data);
        if (res.success) {
          allBloodDonors.unshift(res.donor);
          bloodTab = 'donors';
          if (tabDonorBtn && tabReqBtn) {
            tabDonorBtn.classList.add('active');
            tabReqBtn.classList.remove('active');
          }
          renderActiveTab();
          closeModal('reg-donor-modal');
          regDonorForm.reset();
          showToast('Thank you for registering as a voluntary lifesaver!', 'success');
        }
      } catch (err) {
        showToast('Error registering donor.', 'danger');
      }
    });
  }

  // Consent Contact Request Form
  const consentForm = document.getElementById('donor-consent-form');
  if (consentForm) {
    consentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!activeContactDonor) return;

      const requesterName = document.getElementById('consent-req-name').value.trim() || 'Verified Coordinator';
      const hospitalReason = document.getElementById('consent-req-hospital').value.trim() || 'Emergency Transfusion';

      try {
        const res = await API.requestDonorContact(activeContactDonor.id, requesterName, hospitalReason);
        if (res.success) {
          showConsentRevealedContact(activeContactDonor, res.phone);
          showToast(`Contact access granted. Audit entry logged for ${activeContactDonor.name}.`, 'success');
        } else {
          showToast(res.error || 'Contact request could not be processed', 'danger');
        }
      } catch (err) {
        showToast('Failed to request donor contact', 'danger');
      }
    });
  }
}

function renderActiveTab() {
  const container = document.getElementById('blood-content-area');
  if (!container) return;

  if (bloodTab === 'requests') {
    renderBloodRequests(container);
  } else {
    renderBloodDonors(container);
  }
}

function renderBloodRequests(container) {
  const filtered = allBloodRequests.filter((req) => {
    if (selectedBloodGroup !== 'All Groups' && req.bloodGroup !== selectedBloodGroup) return false;
    if (selectedCity !== 'All Cities' && req.city !== selectedCity) return false;
    if (searchQuery) {
      const q = searchQuery;
      const match =
        req.patientName?.toLowerCase().includes(q) ||
        req.hospitalName?.toLowerCase().includes(q) ||
        req.caseDetails?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem; color: var(--muted)">
        <div style="font-size: 3rem; margin-bottom: 0.5rem">🩸</div>
        <h3>No open blood requests found</h3>
        <p>No emergency requirements currently match your selected filters.</p>
        <button type="button" class="btn btn-blood" onclick="openModal('post-blood-req-modal')">+ Post Blood Request</button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="blood-req-grid">
      ${filtered.map((req) => {
        const isCritical = req.urgency === 'Critical' || req.urgency === 'Urgent';
        const isDone = req.status === 'Fulfilled';
        const isCancelled = req.status === 'Cancelled';

        return `
          <article class="card card-hover blood-card" style="${isCancelled ? 'opacity: 0.6; border-left-color: #94a3b8;' : ''}">
            <div class="blood-card-top">
              <div class="blood-grp-circle">${req.bloodGroup}</div>
              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap;">
                  <span class="badge ${isCritical ? 'badge-danger' : isDone ? 'badge-neutral' : 'badge-warning'}">
                    ${isCritical ? '⚡ ' + req.urgency : req.urgency}
                  </span>
                  <span class="badge ${isDone ? 'badge-success' : isCancelled ? 'badge-neutral' : 'badge-danger'}">
                    ${req.status}
                  </span>
                </div>
                <h3 style="font-size: 1.15rem; margin: 0.35rem 0 0.1rem;">${req.patientName}</h3>
                <p style="font-size: 0.86rem; color: var(--muted); margin: 0;">
                  📍 ${req.hospitalName}, <strong>${req.city}</strong>
                </p>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; background: var(--offwhite); padding: 0.55rem 0.85rem; border-radius: 8px; font-size: 0.85rem;">
              <div><small class="muted" style="display:block;">Units Required</small><strong>${req.unitsNeeded} units</strong></div>
              <div><small class="muted" style="display:block;">Contact Person</small><strong>${req.contactPerson}</strong></div>
            </div>

            <p style="font-size: 0.86rem; color: var(--muted); margin: 0.25rem 0;">${req.caseDetails || ''}</p>

            ${isCancelled ? `
              <div style="background: var(--danger-bg); color: var(--danger-text); padding: 0.35rem 0.65rem; border-radius: 6px; font-size: 0.8rem;">
                ✕ Request cancelled (${req.cancelReason || 'Fulfilled externally'})
              </div>
            ` : ''}

            <div class="blood-card-actions" style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem;">
              ${!isCancelled && !isDone ? `
                <a href="tel:${req.contactPhone}" class="btn btn-blood btn-sm" style="flex: 1;">
                  📞 Call Contact (${req.contactPhone})
                </a>
                <button type="button" class="btn btn-secondary btn-sm" onclick="fulfillBloodReq('${req.id}')" title="Mark request fulfilled">
                  ✓ Fulfilled
                </button>
                <button type="button" class="btn btn-ghost btn-sm" style="color: var(--danger-text);" onclick="cancelBloodReq('${req.id}')" title="Cancel request">
                  ✕ Cancel
                </button>
              ` : `
                <div style="color: ${isDone ? 'var(--success-text)' : 'var(--muted)'}; font-weight: 600; font-size: 0.85rem;">
                  ${isDone ? '✓ Requirement Fulfilled' : '✕ Request Closed'}
                </div>
              `}
            </div>
          </article>
        `;
      }).join('')}
    </div>
  `;
}

function renderBloodDonors(container) {
  const filtered = allBloodDonors.filter((donor) => {
    if (selectedBloodGroup !== 'All Groups' && donor.bloodGroup !== selectedBloodGroup) return false;
    if (selectedCity !== 'All Cities' && donor.city !== selectedCity) return false;
    if (searchQuery) {
      const q = searchQuery;
      if (!donor.name?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem; color: var(--muted)">
        <div style="font-size: 3rem; margin-bottom: 0.5rem">❤️</div>
        <h3>No voluntary donors found</h3>
        <p>No registered donors match this blood group or city filter.</p>
        <button type="button" class="btn btn-blood" onclick="openModal('reg-donor-modal')">❤️ Register as Voluntary Donor</button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="donor-grid">
      ${filtered.map((donor) => {
        // Mask phone for privacy protection
        const rawPhone = donor.phone || '+91 98000 00000';
        const maskedPhone = rawPhone.length > 7
          ? rawPhone.slice(0, 6) + ' ••••• ' + rawPhone.slice(-2)
          : '+91 ••••••••';

        return `
          <article class="card card-hover donor-card">
            <div style="display: flex; gap: 0.75rem; align-items: center;">
              <div class="donor-avatar">${donor.bloodGroup}</div>
              <div style="flex: 1;">
                <h3 style="margin: 0; font-size: 1.1rem;">${donor.name} ${donor.verified ? '<span title="Verified Voluntary Donor">🛡️</span>' : ''}</h3>
                <p class="muted" style="margin: 0.15rem 0 0; font-size: 0.86rem;">📍 ${donor.city}</p>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-top: 0.4rem;">
              <div>
                <span class="muted">Status:</span>
                ${donor.isAvailable ? '<span class="badge badge-success">● Ready to Donate</span>' : '<span class="badge badge-neutral">On Hold</span>'}
              </div>
              <div>
                <span class="muted">Donated:</span> <strong>${donor.donationCount} times</strong>
              </div>
            </div>

            <div style="background: var(--offwhite); padding: 0.45rem 0.75rem; border-radius: 6px; font-size: 0.82rem; margin: 0.4rem 0;">
              🔒 <strong>Protected Contact:</strong> <span class="muted">${maskedPhone}</span>
            </div>

            <p class="muted" style="font-size: 0.82rem; margin: 0 0 0.8rem;">
              Last donation: <strong>${donor.lastDonated || 'Recently'}</strong>
            </p>

            <div style="display: flex; gap: 0.5rem; margin-top: auto;">
              <button type="button" class="btn btn-blood btn-sm" style="flex: 1;" onclick="openConsentModal('${donor.id}')">
                💬 Request Contact
              </button>
              <button type="button" class="btn btn-secondary btn-sm" onclick="toggleDonor('${donor.id}')" title="Toggle active status">
                ${donor.isAvailable ? 'Go Offline' : 'Go Active'}
              </button>
            </div>
          </article>
        `;
      }).join('')}
    </div>
  `;
}

function openConsentModal(donorId) {
  activeContactDonor = allBloodDonors.find((d) => d.id === donorId);
  if (!activeContactDonor) return;

  const targetSummary = document.getElementById('consent-donor-info');
  if (targetSummary) {
    targetSummary.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <div class="donor-avatar" style="width: 38px; height: 38px; font-size: 0.95rem;">${activeContactDonor.bloodGroup}</div>
        <div>
          <strong>${activeContactDonor.name}</strong> • ${activeContactDonor.city}
          <div style="font-size: 0.78rem; color: var(--muted);">Voluntary Donor • Lifetime: ${activeContactDonor.donationCount} donations</div>
        </div>
      </div>
    `;
  }

  // Reset modal state
  const formBox = document.getElementById('donor-consent-form');
  const resultBox = document.getElementById('donor-revealed-contact');
  if (formBox) formBox.style.display = 'block';
  if (resultBox) resultBox.style.display = 'none';

  const reqNameInput = document.getElementById('consent-req-name');
  if (reqNameInput && window.appState.currentUser) {
    reqNameInput.value = window.appState.currentUser.name;
  }

  openModal('contact-consent-modal');
}

function showConsentRevealedContact(donor, phone) {
  const formBox = document.getElementById('donor-consent-form');
  const resultBox = document.getElementById('donor-revealed-contact');
  if (formBox) formBox.style.display = 'none';
  if (resultBox) {
    resultBox.style.display = 'block';
    resultBox.innerHTML = `
      <div class="consent-reveal-box">
        <strong>✓ Contact Details Verified:</strong>
        <p style="margin: 0.4rem 0 0; font-size: 1.15rem; font-weight: 800; letter-spacing: 0.5px;">
          📞 ${phone}
        </p>
        <div style="display: flex; gap: 0.5rem; margin-top: 0.85rem;">
          <a href="tel:${phone}" class="btn btn-blood btn-sm" style="flex: 1;">Call Immediately</a>
          <a href="https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Namaste ' + donor.name + ', reaching out via SevaSetu for emergency ' + donor.bloodGroup + ' blood support.')}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm" style="flex: 1;">WhatsApp</a>
        </div>
      </div>
    `;
  }
}

async function fulfillBloodReq(reqId) {
  try {
    const res = await API.fulfillBloodRequest(reqId);
    if (res.success) {
      const idx = allBloodRequests.findIndex((r) => r.id === reqId);
      if (idx !== -1) allBloodRequests[idx] = res.request;
      renderActiveTab();
      showToast('Blood requirement marked as successfully fulfilled!', 'success');
    }
  } catch (err) {
    showToast('Failed to fulfill request', 'danger');
  }
}

function cancelBloodReq(reqId) {
  confirmAction('Are you sure you want to cancel this emergency blood request?', async () => {
    try {
      const currentUser = window.appState.currentUser || {};
      const res = await API.cancelBloodRequest(reqId, currentUser.name, 'Requirement fulfilled externally');
      if (res.success) {
        const idx = allBloodRequests.findIndex((r) => r.id === reqId);
        if (idx !== -1) allBloodRequests[idx] = res.request;
        renderActiveTab();
        showToast('Blood request cancelled', 'info');
      }
    } catch (err) {
      showToast('Failed to cancel blood request', 'danger');
    }
  });
}

async function toggleDonor(donorId) {
  try {
    const res = await API.toggleBloodDonor(donorId);
    if (res.success) {
      const idx = allBloodDonors.findIndex((d) => d.id === donorId);
      if (idx !== -1) allBloodDonors[idx] = res.donor;
      renderActiveTab();
      showToast(res.donor.isAvailable ? 'Donor marked Available for calls' : 'Donor marked On Hold', 'info');
    }
  } catch (err) {
    showToast('Failed to toggle status', 'danger');
  }
}

document.addEventListener('DOMContentLoaded', initBloodConnect);

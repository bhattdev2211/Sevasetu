/**
 * FoodShare Page Logic
 */

let allFoodDonations = [];
let currentFilter = {
  search: '',
  city: 'All Cities',
  category: 'All Types',
  vegOnly: false,
  tab: 'all' // 'all' | 'available' | 'my'
};

let activeClaimFood = null;
let activeEditFood = null;

async function initFoodShare() {
  try {
    allFoodDonations = await API.getFood();
    renderFoodList();
    renderBannerStats();
  } catch (err) {
    console.error('Error loading food donations:', err);
  }

  // Search input
  const searchInput = document.getElementById('food-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentFilter.search = e.target.value.toLowerCase();
      renderFoodList();
    });
  }

  // City filter
  const citySelect = document.getElementById('food-city-filter');
  if (citySelect) {
    citySelect.addEventListener('change', (e) => {
      currentFilter.city = e.target.value;
      renderFoodList();
    });
  }

  // Category filter
  const catSelect = document.getElementById('food-cat-filter');
  if (catSelect) {
    catSelect.addEventListener('change', (e) => {
      currentFilter.category = e.target.value;
      renderFoodList();
    });
  }

  // Veg filter
  const vegCheckbox = document.getElementById('food-veg-filter');
  if (vegCheckbox) {
    vegCheckbox.addEventListener('change', (e) => {
      currentFilter.vegOnly = e.target.checked;
      renderFoodList();
    });
  }

  // Tab buttons
  document.querySelectorAll('.food-tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.food-tab-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter.tab = btn.dataset.tab;
      renderFoodList();
    });
  });

  // Post Food Form
  const postForm = document.getElementById('post-food-form');
  if (postForm) {
    postForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const currentUser = window.appState.currentUser || {};
      const formData = {
        title: document.getElementById('food-form-title').value.trim(),
        description: document.getElementById('food-form-desc').value.trim(),
        foodType: document.getElementById('food-form-type').value,
        dietType: document.getElementById('food-form-diet').value,
        quantity: document.getElementById('food-form-qty').value.trim(),
        approxMeals: Number(document.getElementById('food-form-meals').value) || 20,
        cookedAt: document.getElementById('food-form-cooked').value || 'Freshly Prepared',
        bestBefore: document.getElementById('food-form-bestbefore').value || 'Within 4 hours',
        city: document.getElementById('food-form-city').value,
        location: document.getElementById('food-form-location').value.trim(),
        donorName: document.getElementById('food-form-donor').value.trim() || currentUser.name || 'Community Donor',
        donorPhone: document.getElementById('food-form-phone').value.trim() || currentUser.phone || '+91 98000 00000',
      };

      if (!formData.title || !formData.quantity || !formData.location) {
        showToast('Please fill out all mandatory donation fields', 'warning');
        return;
      }

      try {
        const res = await API.postFood(formData);
        if (res.success) {
          allFoodDonations.unshift(res.item);
          renderFoodList();
          renderBannerStats();
          closeModal('post-food-modal');
          postForm.reset();
          showToast('Food donation listed! Nearby volunteers have been alerted.', 'success');
        }
      } catch (err) {
        showToast('Error posting donation. Please try again.', 'danger');
      }
    });
  }

  // Edit Food Form
  const editForm = document.getElementById('edit-food-form');
  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!activeEditFood) return;

      const updates = {
        title: document.getElementById('edit-food-title').value.trim(),
        description: document.getElementById('edit-food-desc').value.trim(),
        quantity: document.getElementById('edit-food-qty').value.trim(),
        approxMeals: Number(document.getElementById('edit-food-meals').value) || activeEditFood.approxMeals,
        bestBefore: document.getElementById('edit-food-bestbefore').value.trim(),
        location: document.getElementById('edit-food-location').value.trim(),
        city: document.getElementById('edit-food-city').value,
        donorPhone: document.getElementById('edit-food-phone').value.trim(),
      };

      try {
        const res = await API.editFood(activeEditFood.id, updates);
        if (res.success) {
          const idx = allFoodDonations.findIndex((f) => f.id === activeEditFood.id);
          if (idx !== -1) allFoodDonations[idx] = res.item;
          renderFoodList();
          renderBannerStats();
          closeModal('edit-food-modal');
          showToast('Listing updated successfully!', 'success');
        }
      } catch (err) {
        showToast('Failed to update listing', 'danger');
      }
    });
  }

  // Claim Food Form
  const claimForm = document.getElementById('claim-food-form');
  if (claimForm) {
    claimForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!activeClaimFood) return;

      const volunteerName = document.getElementById('claim-vol-name').value.trim() || 'Local Volunteer';
      const timeEst = document.getElementById('claim-time-est').value;
      const notes = document.getElementById('claim-notes').value.trim();

      try {
        const res = await API.claimFood(activeClaimFood.id, volunteerName, `${timeEst} - ${notes}`);
        if (res.success) {
          const idx = allFoodDonations.findIndex((f) => f.id === activeClaimFood.id);
          if (idx !== -1) allFoodDonations[idx] = res.item;
          renderFoodList();
          renderBannerStats();
          closeModal('claim-food-modal');
          claimForm.reset();
          showToast('Pickup successfully requested! Coordinates sent to donor.', 'success');
        }
      } catch (err) {
        showToast(err.data?.error || 'Error requesting food pickup', 'danger');
      }
    });
  }
}

function renderBannerStats() {
  const availCount = allFoodDonations.filter((f) => f.status === 'Available' || f.status === 'Open').length;
  const totalMeals = allFoodDonations.reduce((acc, f) => acc + (f.approxMeals || 0), 0);

  const availEl = document.getElementById('food-stat-available');
  const mealsEl = document.getElementById('food-stat-meals');
  if (availEl) availEl.textContent = availCount;
  if (mealsEl) mealsEl.textContent = `${totalMeals}+`;
}

function renderFoodList() {
  const container = document.getElementById('food-list-container');
  if (!container) return;

  const currentUserName = window.appState.currentUser?.name?.toLowerCase() || '';

  const filtered = allFoodDonations.filter((item) => {
    // Tab filter
    if (currentFilter.tab === 'available' && !['Available', 'Open'].includes(item.status)) return false;
    if (currentFilter.tab === 'my') {
      const isMine =
        item.donorName?.toLowerCase() === currentUserName ||
        item.requesterName?.toLowerCase() === currentUserName;
      if (!isMine) return false;
    }

    // City
    if (currentFilter.city !== 'All Cities' && item.city !== currentFilter.city) return false;

    // Category
    if (currentFilter.category !== 'All Types' && item.foodType !== currentFilter.category) return false;

    // Veg Only
    if (currentFilter.vegOnly && item.dietType !== 'Pure Veg') return false;

    // Search
    if (currentFilter.search) {
      const q = currentFilter.search;
      const match =
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.location?.toLowerCase().includes(q) ||
        item.donorName?.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--muted)">
        <div style="font-size: 3rem; margin-bottom: 0.5rem">🍲</div>
        <h3>No food donations found</h3>
        <p>No listings match your selected filters. Try changing city filters or be the first to post surplus meals!</p>
        <button type="button" class="btn btn-primary" onclick="openModal('post-food-modal')">+ Post Food Donation</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map((item) => {
    const isAvail = item.status === 'Available' || item.status === 'Open';
    const isReq = item.status === 'Requested';
    const isApproved = item.status === 'Approved';
    const isDone = item.status === 'Completed';
    const isCancelled = item.status === 'Cancelled';
    const isMine = item.donorName?.toLowerCase() === currentUserName;

    let badgeClass = 'badge-neutral';
    if (isAvail) badgeClass = 'badge-success';
    else if (isReq || isApproved) badgeClass = 'badge-warning';
    else if (isCancelled) badgeClass = 'badge-danger';

    return `
      <article class="card card-hover food-card" style="${isCancelled ? 'opacity: 0.65;' : ''}">
        <div class="food-card-header">
          <div class="food-tags">
            <span class="food-type-tag">${item.foodType}</span>
            <span class="diet-tag ${item.dietType === 'Pure Veg' ? 'veg-tag' : 'nonveg-tag'}">
              ${item.dietType === 'Pure Veg' ? '● Pure Veg' : '▲ Non-Veg'}
            </span>
          </div>
          <span class="badge ${badgeClass}">
            ${item.status}
          </span>
        </div>

        <h3 class="food-card-title">${item.title}</h3>
        <p class="food-card-desc">${item.description || ''}</p>

        <div class="food-meta-list">
          <div>🍱 Quantity: <strong>${item.quantity}</strong> (${item.approxMeals} meals est.)</div>
          <div>⏰ Best before: <strong style="color: #b45309">${item.bestBefore}</strong> (Prepared: ${item.cookedAt})</div>
          <div>📍 ${item.location}, <strong>${item.city}</strong></div>
          <div>👤 Donor: <strong>${item.donorName}</strong></div>
        </div>

        ${isReq && item.requesterName ? `
          <div style="background: var(--warning-bg); color: var(--warning-text); padding: 0.5rem 0.75rem; border-radius: 8px; font-size: 0.82rem; margin-top: 0.25rem;">
            ⚠️ Pickup requested by: <strong>${item.requesterName}</strong>
            ${item.requesterNotes ? `<div style="font-size: 0.76rem; margin-top: 0.2rem; opacity: 0.9;">Note: ${item.requesterNotes}</div>` : ''}
          </div>
        ` : ''}

        ${isApproved && item.requesterName ? `
          <div style="background: var(--info-bg); color: var(--info-text); padding: 0.5rem 0.75rem; border-radius: 8px; font-size: 0.82rem; margin-top: 0.25rem;">
            ✓ Pickup approved for: <strong>${item.requesterName}</strong>
          </div>
        ` : ''}

        ${isCancelled ? `
          <div style="background: var(--danger-bg); color: var(--danger-text); padding: 0.45rem 0.75rem; border-radius: 8px; font-size: 0.82rem;">
            ✕ Cancelled: ${item.cancelReason || 'Withdrawn by donor'}
          </div>
        ` : ''}

        <div class="food-card-footer" style="flex-wrap: wrap; gap: 0.5rem;">
          ${isAvail ? `
            <button type="button" class="btn btn-primary btn-sm" style="flex: 1;" onclick="openClaimModal('${item.id}')">
              ✓ Request Pickup / Claim
            </button>
          ` : ''}

          ${(isReq || isApproved) && isMine ? `
            <div style="display: flex; gap: 0.4rem; width: 100%;">
              <button type="button" class="btn btn-primary btn-sm" style="flex: 1;" onclick="reviewClaim('${item.id}', true)">
                Approve Pickup
              </button>
              <button type="button" class="btn btn-secondary btn-sm" onclick="reviewClaim('${item.id}', false)">
                Decline
              </button>
            </div>
          ` : ''}

          ${(isReq || isApproved) ? `
            <button type="button" class="btn btn-secondary btn-sm" style="flex: 1;" onclick="markDelivered('${item.id}')">
              Mark as Distributed
            </button>
          ` : ''}

          ${isDone ? `
            <div style="color: var(--success-text); font-weight: 600; font-size: 0.85rem; flex: 1;">
              ✓ Successfully Distributed
            </div>
          ` : ''}

          ${isMine && !isDone && !isCancelled ? `
            <button type="button" class="btn btn-ghost btn-sm" onclick="openEditModal('${item.id}')" title="Edit Listing">
              ✏️ Edit
            </button>
            <button type="button" class="btn btn-ghost btn-sm" style="color: var(--danger-text)" onclick="cancelListing('${item.id}')" title="Cancel Listing">
              ✕ Cancel
            </button>
          ` : ''}

          <a href="tel:${item.donorPhone}" class="btn btn-ghost btn-sm" title="Call Donor">
            📞 Call
          </a>
        </div>
      </article>
    `;
  }).join('');
}

function openClaimModal(foodId) {
  activeClaimFood = allFoodDonations.find((f) => f.id === foodId);
  if (!activeClaimFood) return;

  const summaryEl = document.getElementById('claim-modal-summary');
  if (summaryEl) {
    summaryEl.innerHTML = `
      <p style="margin: 0;"><strong>Claiming:</strong> ${activeClaimFood.title}</p>
      <p style="margin: 0.25rem 0 0;"><strong>Location:</strong> ${activeClaimFood.location}, ${activeClaimFood.city}</p>
      <p style="margin: 0.25rem 0 0;"><strong>Quantity:</strong> ${activeClaimFood.quantity} (${activeClaimFood.approxMeals} meals)</p>
      <p style="margin: 0.25rem 0 0;"><strong>Pickup Deadline:</strong> ${activeClaimFood.bestBefore}</p>
    `;
  }

  const volInput = document.getElementById('claim-vol-name');
  if (volInput && window.appState.currentUser) {
    volInput.value = window.appState.currentUser.name;
  }

  openModal('claim-food-modal');
}

function openEditModal(foodId) {
  activeEditFood = allFoodDonations.find((f) => f.id === foodId);
  if (!activeEditFood) return;

  document.getElementById('edit-food-title').value = activeEditFood.title || '';
  document.getElementById('edit-food-desc').value = activeEditFood.description || '';
  document.getElementById('edit-food-qty').value = activeEditFood.quantity || '';
  document.getElementById('edit-food-meals').value = activeEditFood.approxMeals || 20;
  document.getElementById('edit-food-bestbefore').value = activeEditFood.bestBefore || '';
  document.getElementById('edit-food-location').value = activeEditFood.location || '';
  document.getElementById('edit-food-city').value = activeEditFood.city || 'Rajkot';
  document.getElementById('edit-food-phone').value = activeEditFood.donorPhone || '';

  openModal('edit-food-modal');
}

function cancelListing(foodId) {
  confirmAction('Are you sure you want to cancel this food listing? It will no longer be available for pickup.', async () => {
    try {
      const currentUser = window.appState.currentUser || {};
      const res = await API.cancelFood(foodId, currentUser.name, 'Cancelled by donor');
      if (res.success) {
        const idx = allFoodDonations.findIndex((f) => f.id === foodId);
        if (idx !== -1) allFoodDonations[idx] = res.item;
        renderFoodList();
        renderBannerStats();
        showToast('Donation listing cancelled', 'info');
      }
    } catch (err) {
      showToast('Failed to cancel listing', 'danger');
    }
  });
}

async function reviewClaim(foodId, accept) {
  try {
    const currentUser = window.appState.currentUser || {};
    const res = await API.reviewFoodClaim(foodId, currentUser.name, accept);
    if (res.success) {
      const idx = allFoodDonations.findIndex((f) => f.id === foodId);
      if (idx !== -1) allFoodDonations[idx] = res.item;
      renderFoodList();
      showToast(accept ? 'Pickup request approved!' : 'Pickup request declined; listing restored to Available', 'info');
    }
  } catch (err) {
    showToast('Failed to update claim review', 'danger');
  }
}

async function markDelivered(foodId) {
  try {
    const res = await API.completeFood(foodId);
    if (res.success) {
      const idx = allFoodDonations.findIndex((f) => f.id === foodId);
      if (idx !== -1) allFoodDonations[idx] = res.item;
      renderFoodList();
      showToast('Food donation marked as successfully distributed! Great community work!', 'success');
    }
  } catch (err) {
    showToast('Failed to update status', 'danger');
  }
}

document.addEventListener('DOMContentLoaded', initFoodShare);

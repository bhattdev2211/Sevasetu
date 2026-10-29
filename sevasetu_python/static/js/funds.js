/**
 * CommunityFunds Page Logic
 */

let allTransactions = [];
let allCommunityGroups = [];
let selectedGroupId = 'all'; // 'all' or group ID
let fundsSummary = { income: 0, expense: 0, balance: 0 };
let fundsFilter = {
  search: '',
  type: 'all',
  category: 'All Categories'
};
let selectedPresetAmount = 1000;

const EXPENSE_CATEGORIES = [
  'Ration Relief',
  'Medical Aid',
  'Education Support',
  'Community Kitchen',
  'Logistics & Fuel',
  'Emergency Grant'
];

async function initCommunityFunds() {
  try {
    const data = await API.getFunds();
    allTransactions = data.transactions || [];
    allCommunityGroups = data.groups || [];
    fundsSummary = data.summary || { income: 0, expense: 0, balance: 0 };

    renderGroupPills();
    recalculateFundsForSelection();
  } catch (err) {
    console.error('Error loading funds data:', err);
  }

  // Filter events
  const searchEl = document.getElementById('funds-search');
  if (searchEl) {
    searchEl.addEventListener('input', (e) => {
      fundsFilter.search = e.target.value.toLowerCase();
      renderTransactionsTable();
    });
  }

  const typeEl = document.getElementById('funds-type-filter');
  if (typeEl) {
    typeEl.addEventListener('change', (e) => {
      fundsFilter.type = e.target.value;
      renderTransactionsTable();
    });
  }

  const catEl = document.getElementById('funds-cat-filter');
  if (catEl) {
    catEl.addEventListener('change', (e) => {
      fundsFilter.category = e.target.value;
      renderTransactionsTable();
    });
  }

  // Amount preset buttons
  document.querySelectorAll('.preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.preset-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedPresetAmount = Number(btn.dataset.amount);
      const customInput = document.getElementById('contrib-amount-input');
      if (customInput) customInput.value = selectedPresetAmount;
    });
  });

  const customInput = document.getElementById('contrib-amount-input');
  if (customInput) {
    customInput.addEventListener('input', (e) => {
      selectedPresetAmount = Number(e.target.value);
      document.querySelectorAll('.preset-btn').forEach((b) => {
        b.classList.toggle('active', Number(b.dataset.amount) === selectedPresetAmount);
      });
    });
  }

  // Contribute Form
  const contribForm = document.getElementById('contrib-fund-form');
  if (contribForm) {
    contribForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const amountVal = Number(document.getElementById('contrib-amount-input').value) || selectedPresetAmount;
      const name = document.getElementById('contrib-donor-name').value.trim() || 'Anonymous Well-wisher';
      const note = document.getElementById('contrib-note').value.trim();
      const targetGroup = document.getElementById('contrib-group-select')?.value || null;

      if (isNaN(amountVal) || amountVal <= 0) {
        showToast('Please enter a valid positive contribution amount', 'warning');
        return;
      }

      try {
        const res = await API.contribute(amountVal, name, note, targetGroup);
        if (res.success) {
          allTransactions.unshift(res.transaction);
          recalculateFundsForSelection();
          closeModal('contrib-fund-modal');
          contribForm.reset();
          showToast(`Thank you! ₹${amountVal.toLocaleString('en-IN')} contribution recorded with receipt ${res.transaction.receiptId}`, 'success');
        }
      } catch (err) {
        showToast(err.data?.error || 'Error recording contribution', 'danger');
      }
    });
  }

  // Record Transaction Form
  const recordForm = document.getElementById('record-txn-form');
  if (recordForm) {
    recordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const type = document.getElementById('txn-form-type').value;
      const amount = Number(document.getElementById('txn-form-amount').value) || 0;
      const title = document.getElementById('txn-form-title').value.trim();
      const category = document.getElementById('txn-form-cat').value;
      const date = document.getElementById('txn-form-date').value || new Date().toISOString().split('T')[0];
      const notes = document.getElementById('txn-form-notes').value.trim();
      const groupId = document.getElementById('txn-form-group')?.value || null;
      const currentUser = window.appState.currentUser || {};
      const recordedBy = currentUser.name || 'Community Member';

      if (isNaN(amount) || amount <= 0) {
        showToast('Transaction amount must be strictly greater than 0', 'warning');
        return;
      }
      if (!title) {
        showToast('Please enter a transaction title/description', 'warning');
        return;
      }

      // Check role authorization for expenses
      if (type === 'expense' && !['NGO Organizer', 'Volunteer', 'Treasurer', 'Admin'].includes(currentUser.role)) {
        showToast('Only authorized group organizers or treasurers can record relief expenses.', 'warning');
      }

      try {
        const res = await API.postTransaction({
          type,
          amount,
          title,
          category,
          date,
          notes,
          groupId,
          recordedBy
        });

        if (res.success) {
          allTransactions.unshift(res.transaction);
          recalculateFundsForSelection();
          closeModal('record-txn-modal');
          recordForm.reset();
          showToast(`Transaction ${res.transaction.receiptId} added to the transparent ledger!`, 'success');
        }
      } catch (err) {
        showToast(err.data?.error || 'Error saving transaction', 'danger');
      }
    });
  }

  // Create Group Form
  const createGroupForm = document.getElementById('create-group-form');
  if (createGroupForm) {
    createGroupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('group-name-input').value.trim();
      const description = document.getElementById('group-desc-input').value.trim();
      const city = document.getElementById('group-city-input').value;
      const category = document.getElementById('group-cat-input').value;

      if (!name) {
        showToast('Please enter a group name', 'warning');
        return;
      }

      try {
        const res = await API.createGroup({ name, description, city, category });
        if (res.success) {
          allCommunityGroups.unshift(res.group);
          renderGroupPills();
          selectedGroupId = res.group.id;
          recalculateFundsForSelection();
          closeModal('create-group-modal');
          createGroupForm.reset();
          showToast(`Community group '${res.group.name}' created!`, 'success');
        }
      } catch (err) {
        showToast(err.data?.error || 'Failed to create group', 'danger');
      }
    });
  }

  // Export CSV
  const exportBtn = document.getElementById('export-csv-btn');
  if (exportBtn) {
    exportBtn.onclick = () => {
      window.location.href = '/api/funds/export-csv';
    };
  }
}

function renderGroupPills() {
  const container = document.getElementById('group-pill-container');
  if (!container) return;

  const pillsHtml = `
    <button type="button" class="group-pill ${selectedGroupId === 'all' ? 'active' : ''}" onclick="selectGroup('all')">
      🌐 All Collective Funds
    </button>
    ${allCommunityGroups.map((g) => `
      <button type="button" class="group-pill ${selectedGroupId === g.id ? 'active' : ''}" onclick="selectGroup('${g.id}')">
        🏛️ ${g.name} (${g.city})
      </button>
    `).join('')}
    <button type="button" class="btn btn-secondary btn-sm" onclick="openModal('create-group-modal')" style="margin-left: auto;">
      + Start New Group
    </button>
  `;
  container.innerHTML = pillsHtml;

  // Populate group dropdowns in modals
  const groupSelectContrib = document.getElementById('contrib-group-select');
  const groupSelectTxn = document.getElementById('txn-form-group');

  const optionsHtml = `
    <option value="">General Community Pool</option>
    ${allCommunityGroups.map((g) => `<option value="${g.id}">${g.name} (${g.city})</option>`).join('')}
  `;

  if (groupSelectContrib) groupSelectContrib.innerHTML = optionsHtml;
  if (groupSelectTxn) groupSelectTxn.innerHTML = optionsHtml;
}

function selectGroup(groupId) {
  selectedGroupId = groupId;
  renderGroupPills();
  recalculateFundsForSelection();
}

function recalculateFundsForSelection() {
  let txns = allTransactions;
  if (selectedGroupId !== 'all') {
    txns = allTransactions.filter((t) => t.groupId === selectedGroupId);
  }

  const income = txns.filter((t) => t.type === 'income').reduce((acc, t) => acc + (t.amount || 0), 0);
  const expense = txns.filter((t) => t.type === 'expense').reduce((acc, t) => acc + (t.amount || 0), 0);
  const balance = income - expense;

  fundsSummary = { income, expense, balance };

  renderFundsOverview();
  renderCategoryBreakdown(txns);
  renderMonthlyBreakdown(txns);
  renderTransactionsTable(txns);
  renderGroupBanner();
}

function renderGroupBanner() {
  const banner = document.getElementById('active-group-banner');
  if (!banner) return;

  if (selectedGroupId === 'all') {
    banner.style.display = 'none';
  } else {
    const group = allCommunityGroups.find((g) => g.id === selectedGroupId);
    if (group) {
      banner.style.display = 'block';
      const currentUser = window.appState.currentUser || {};
      const isMember = group.members?.some((m) => m.name === currentUser.name || m.email === currentUser.email);

      banner.innerHTML = `
        <div class="card" style="margin-bottom: 1.25rem; background: var(--teal-50); border-color: var(--teal-100);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap;">
            <div>
              <span class="badge badge-info">${group.category}</span>
              <h3 style="margin: 0.35rem 0 0.15rem; color: var(--navy-900);">${group.name}</h3>
              <p style="margin: 0; font-size: 0.88rem; color: var(--muted);">${group.description}</p>
              <div style="font-size: 0.8rem; margin-top: 0.4rem; color: var(--teal-700);">
                Founder: <strong>${group.creator}</strong> • Members: <strong>${group.members?.length || 1} contributors</strong> • City: <strong>${group.city}</strong>
              </div>
            </div>
            <div>
              ${!isMember ? `
                <button type="button" class="btn btn-primary btn-sm" onclick="joinGroupAction('${group.id}')">
                  + Join This Group
                </button>
              ` : `
                <span class="badge badge-success">✓ You are a Member</span>
              `}
            </div>
          </div>
        </div>
      `;
    }
  }
}

async function joinGroupAction(groupId) {
  try {
    const res = await API.joinGroup(groupId, 'Member');
    if (res.success) {
      const idx = allCommunityGroups.findIndex((g) => g.id === groupId);
      if (idx !== -1) allCommunityGroups[idx] = res.group;
      renderGroupBanner();
      showToast('You have joined the community group!', 'success');
    }
  } catch (err) {
    showToast('Failed to join group', 'danger');
  }
}

function renderFundsOverview() {
  const balEl = document.getElementById('funds-stat-balance');
  const incEl = document.getElementById('funds-stat-income');
  const expEl = document.getElementById('funds-stat-expense');

  if (balEl) balEl.textContent = formatINR(fundsSummary.balance);
  if (incEl) incEl.textContent = `+${formatINR(fundsSummary.income)}`;
  if (expEl) expEl.textContent = `-${formatINR(fundsSummary.expense)}`;
}

function renderCategoryBreakdown(txns = allTransactions) {
  const container = document.getElementById('cat-spending-grid');
  if (!container) return;

  const totalExpense = fundsSummary.expense || 1;

  const items = EXPENSE_CATEGORIES.map((cat) => {
    const sum = txns
      .filter((t) => t.type === 'expense' && t.category === cat)
      .reduce((acc, t) => acc + (t.amount || 0), 0);
    const pct = Math.round((sum / totalExpense) * 100);
    return { cat, sum, pct };
  }).filter((i) => i.sum > 0);

  if (items.length === 0) {
    container.innerHTML = `<p class="muted">No relief expenses recorded yet for this view.</p>`;
    return;
  }

  container.innerHTML = items.map((i) => `
    <div style="display: flex; flex-direction: column; gap: 0.3rem;">
      <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
        <strong>${i.cat}</strong>
        <span>${formatINR(i.sum)} (${i.pct}%)</span>
      </div>
      <div class="cat-progress-track">
        <div class="cat-progress-fill" style="width: ${Math.min(100, i.pct)}%;"></div>
      </div>
    </div>
  `).join('');
}

function renderMonthlyBreakdown(txns = allTransactions) {
  const container = document.getElementById('monthly-spending-grid');
  if (!container) return;

  // Group transactions by YYYY-MM
  const monthMap = {};
  txns.forEach((t) => {
    const month = (t.date || '').slice(0, 7) || '2026-10';
    if (!monthMap[month]) monthMap[month] = { income: 0, expense: 0 };
    if (t.type === 'income') monthMap[month].income += (t.amount || 0);
    else monthMap[month].expense += (t.amount || 0);
  });

  const sortedMonths = Object.keys(monthMap).sort().reverse().slice(0, 4);

  if (sortedMonths.length === 0) {
    container.innerHTML = `<p class="muted">No monthly transaction data available.</p>`;
    return;
  }

  container.innerHTML = sortedMonths.map((m) => {
    const data = monthMap[m];
    const monthLabel = new Date(m + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.75rem; background: var(--offwhite); border-radius: 8px; font-size: 0.85rem;">
        <strong>${monthLabel}</strong>
        <div style="display: flex; gap: 1rem;">
          <span style="color: var(--success-text)">+${formatINR(data.income)}</span>
          <span style="color: var(--danger-text)">-${formatINR(data.expense)}</span>
        </div>
      </div>
    `;
  }).join('');
}

function renderTransactionsTable(txns = allTransactions) {
  const tbody = document.getElementById('ledger-table-body');
  if (!tbody) return;

  const filtered = txns.filter((t) => {
    if (fundsFilter.type !== 'all' && t.type !== fundsFilter.type) return false;
    if (fundsFilter.category !== 'All Categories' && t.category !== fundsFilter.category) return false;
    if (fundsFilter.search) {
      const q = fundsFilter.search;
      const match =
        t.title?.toLowerCase().includes(q) ||
        t.receiptId?.toLowerCase().includes(q) ||
        t.recordedBy?.toLowerCase().includes(q) ||
        t.notes?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 2rem; color: var(--muted)">
          No transactions match your search criteria.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map((t) => {
    const isIncome = t.type === 'income';
    return `
      <tr>
        <td style="white-space: nowrap; font-size: 0.82rem; color: var(--muted);">${t.date}</td>
        <td><span class="receipt-badge">${t.receiptId}</span></td>
        <td>
          <strong style="display:block; font-size: 0.9rem;">${t.title}</strong>
          ${t.notes ? `<small class="muted">${t.notes}</small>` : ''}
        </td>
        <td><span class="badge badge-neutral">${t.category}</span></td>
        <td style="font-size: 0.84rem; color: var(--muted);">${t.recordedBy}</td>
        <td style="text-align: right;">
          <span class="txn-amount ${isIncome ? 'income' : 'expense'}">
            ${isIncome ? `+${formatINR(t.amount)}` : `-${formatINR(t.amount)}`}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', initCommunityFunds);

/**
 * Dashboard Page Logic
 */

let dashActivities = [];
let dashNotifications = [];
let dashPersonas = [];
let activityFilter = 'All';
let previewEmpty = false;

async function initDashboard() {
  try {
    const data = await API.getInitialData();
    dashActivities = data.activities || [];
    dashNotifications = data.notifications || [];
    dashPersonas = data.personas || [];

    renderDashboardStats(data.summary);
    renderPersonaBar(data.personas, data.currentUser);
    renderActivityList();
    renderNotificationsList();
  } catch (err) {
    console.error('Error initializing dashboard:', err);
  }

  // Filter pills
  document.querySelectorAll('.mini-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.mini-pill').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      activityFilter = pill.dataset.module;
      renderActivityList();
    });
  });

  // Empty state preview toggle
  const emptyToggle = document.getElementById('preview-empty-toggle');
  if (emptyToggle) {
    emptyToggle.addEventListener('change', (e) => {
      previewEmpty = e.target.checked;
      renderDashboardStats(window.appState.summary || {});
      renderActivityList();
      renderNotificationsList();
    });
  }

  // Dashboard Mark All Read
  const dashMarkAllBtn = document.getElementById('dash-notif-mark-all');
  if (dashMarkAllBtn) {
    dashMarkAllBtn.onclick = async () => {
      await API.markAllNotificationsRead();
      dashNotifications.forEach((n) => (n.read = true));
      renderNotificationsList();
      renderNavNotifications(dashNotifications);
      showToast('All notifications marked as read', 'info');
    };
  }
}

function renderDashboardStats(summary) {
  const foodVal = document.getElementById('dash-stat-food');
  const bloodVal = document.getElementById('dash-stat-blood');
  const fundsVal = document.getElementById('dash-stat-funds');

  if (foodVal) foodVal.textContent = previewEmpty ? 0 : summary.activeFoodCount || 0;
  if (bloodVal) bloodVal.textContent = previewEmpty ? 0 : summary.openBloodCount || 0;
  if (fundsVal) fundsVal.textContent = previewEmpty ? '₹0' : formatINR(summary.fundsSummary?.balance || 0);
}

function renderPersonaBar(personas, currentUser) {
  const container = document.getElementById('persona-chip-list');
  if (!container || !personas) return;

  container.innerHTML = personas.map((p) => `
    <button type="button" class="persona-chip ${currentUser?.id === p.id ? 'active' : ''}" onclick="switchUserPersona('${p.id}')">
      <span class="chip-dot" style="background: ${p.avatarBg || '#0f766e'}"></span>
      <strong>${p.name}</strong> (${p.role} • ${p.city})
    </button>
  `).join('');
}

async function switchUserPersona(id) {
  try {
    const res = await API.switchPersona(id);
    if (res.success) {
      window.appState.currentUser = res.user;
      renderNavUser(res.user);
      renderPersonaBar(dashPersonas, res.user);

      const welcomeName = document.getElementById('dash-welcome-name');
      const welcomeCity = document.getElementById('dash-welcome-city');
      if (welcomeName) welcomeName.textContent = res.user.name;
      if (welcomeCity) welcomeCity.textContent = `${res.user.city} (${res.user.role})`;

      showToast(`Switched persona to ${res.user.name} (${res.user.role})`, 'success');
    }
  } catch (err) {
    showToast('Failed to switch persona', 'danger');
  }
}

function renderActivityList() {
  const container = document.getElementById('dash-activity-list');
  if (!container) return;

  if (previewEmpty) {
    container.innerHTML = `<li style="padding: 2rem; text-align: center; color: var(--muted)">No activity yet.</li>`;
    return;
  }

  const filtered = dashActivities.filter((a) => {
    if (activityFilter !== 'All' && a.module !== activityFilter) return false;
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<li style="padding: 2rem; text-align: center; color: var(--muted)">No activity in this category.</li>`;
    return;
  }

  container.innerHTML = filtered.map((a) => `
    <li class="list-item">
      <div style="flex: 1;">
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.2rem;">
          <strong style="font-size: 0.88rem;">${a.module}</strong>
          ${a.city ? `<span class="badge badge-neutral" style="font-size: 0.72rem;">${a.city}</span>` : ''}
        </div>
        <span style="font-size: 0.92rem; color: var(--text); display: block;">${a.text}</span>
        <small style="margin-top: 0.2rem;">${a.time}</small>
      </div>
      <span class="badge badge-${a.tone || 'info'}">${a.status}</span>
    </li>
  `).join('');
}

function renderNotificationsList() {
  const container = document.getElementById('dash-notifications-list');
  const countEl = document.getElementById('dash-notif-count');
  if (!container) return;

  if (previewEmpty) {
    container.innerHTML = `<li style="padding: 2rem; text-align: center; color: var(--muted)">You're all caught up!</li>`;
    if (countEl) countEl.style.display = 'none';
    return;
  }

  const unreadCount = dashNotifications.filter((n) => !n.read).length;
  if (countEl) {
    if (unreadCount > 0) {
      countEl.style.display = 'inline-flex';
      countEl.textContent = `${unreadCount} new`;
    } else {
      countEl.style.display = 'none';
    }
  }

  if (dashNotifications.length === 0) {
    container.innerHTML = `<li style="padding: 2rem; text-align: center; color: var(--muted)">No notifications.</li>`;
    return;
  }

  container.innerHTML = dashNotifications.map((n) => `
    <li class="list-item" style="cursor: pointer;" onclick="handleDashNotifClick('${n.id}', '${n.link || '/dashboard'}')">
      <span class="unread-dot" style="width: 8px; height: 8px; border-radius: 50%; background: ${n.read ? 'transparent' : 'var(--teal-600)'}; border: 1.5px solid ${n.read ? 'var(--border)' : 'var(--teal-600)'}; margin-top: 6px; flex-shrink: 0;"></span>
      <div style="flex: 1;">
        <div style="font-weight: ${n.read ? 500 : 700}; font-size: 0.92rem;">${n.title || 'Notice'}</div>
        <span style="font-size: 0.86rem; color: var(--muted); display: block;">${n.message}</span>
        <small style="margin-top: 0.2rem;">${n.time}</small>
      </div>
    </li>
  `).join('');
}

async function handleDashNotifClick(id, link) {
  await API.markNotificationRead(id);
  const matched = dashNotifications.find((n) => n.id === id);
  if (matched) matched.read = true;
  renderNotificationsList();
  renderNavNotifications(dashNotifications);
  if (link && link !== window.location.pathname) {
    window.location.href = link;
  }
}

document.addEventListener('DOMContentLoaded', initDashboard);


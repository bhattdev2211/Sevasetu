/**
 * SevaSetu Global Application Script for Netlify Deployment
 * Pure HTML, CSS, and JavaScript.
 */

window.appState = {
  currentUser: null,
  notifications: [],
  communityGroups: [],
  summary: {}
};

// --- Toast System ---
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">
      ${type === 'success' ? '✓' : type === 'danger' ? '✕' : type === 'warning' ? '⚠' : 'ℹ'}
    </span>
    <p class="toast-message">${message}</p>
    <button type="button" class="toast-close" aria-label="Dismiss">&times;</button>
  `;

  toast.querySelector('.toast-close').onclick = () => toast.remove();
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    toast.style.transition = 'all 200ms ease';
    setTimeout(() => toast.remove(), 200);
  }, 4200);
}

// --- Modal Helpers ---
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = 'unset';
  }
}

// Global modal backdrop and Escape listeners
window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-backdrop')) {
    e.target.classList.remove('open');
    document.body.style.overflow = 'unset';
  }
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-backdrop.open').forEach((m) => {
      m.classList.remove('open');
    });
    document.body.style.overflow = 'unset';
  }
});

// --- Confirmation Dialog ---
function confirmAction(message, onConfirm) {
  let modal = document.getElementById('global-confirm-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'global-confirm-modal';
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-card" style="max-width: 420px; text-align: center; background: var(--white); border-radius: var(--radius); padding: 1.75rem; border: 1px solid var(--border); box-shadow: var(--shadow-lg);">
        <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">⚠️</div>
        <h3 id="confirm-modal-title" style="margin-bottom: 0.5rem;">Please Confirm</h3>
        <p id="confirm-modal-msg" class="muted" style="font-size: 0.92rem;"></p>
        <div style="display: flex; gap: 0.75rem; justify-content: center; margin-top: 1.5rem;">
          <button type="button" class="btn btn-secondary" id="confirm-modal-cancel">Cancel</button>
          <button type="button" class="btn btn-blood" id="confirm-modal-ok">Yes, Proceed</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  document.getElementById('confirm-modal-msg').textContent = message;
  openModal('global-confirm-modal');

  document.getElementById('confirm-modal-cancel').onclick = () => {
    closeModal('global-confirm-modal');
  };

  document.getElementById('confirm-modal-ok').onclick = () => {
    closeModal('global-confirm-modal');
    if (typeof onConfirm === 'function') onConfirm();
  };
}

// --- Currency Formatter ---
function formatINR(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
}

// --- Header & Navigation Initializer ---
async function initHeader() {
  const filename = window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav-link').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === filename || (filename === '' && href === 'index.html') || (filename === 'index.html' && href === 'index.html')) {
      link.classList.add('active');
    } else if (filename.includes('food') && href.includes('food')) {
      link.classList.add('active');
    } else if (filename.includes('blood') && href.includes('blood')) {
      link.classList.add('active');
    } else if (filename.includes('funds') && href.includes('funds')) {
      link.classList.add('active');
    } else if (filename.includes('dashboard') && href.includes('dashboard')) {
      link.classList.add('active');
    } else if (filename.includes('about') && href.includes('about')) {
      link.classList.add('active');
    } else if (filename.includes('help') && href.includes('help')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  const menuToggle = document.getElementById('menu-toggle');
  const mainNav = document.getElementById('main-nav');
  if (menuToggle && mainNav) {
    menuToggle.onclick = () => {
      mainNav.classList.toggle('open');
    };
  }

  try {
    const data = await API.getInitialData();
    window.appState = data;
    renderNavUser(data.currentUser);
    renderNavNotifications(data.notifications);
  } catch (err) {
    console.warn('Initial data load:', err);
  }

  const notifBtn = document.getElementById('notif-btn');
  const notifDropdown = document.getElementById('notif-dropdown');
  const userBtn = document.getElementById('user-menu-btn');
  const userDropdown = document.getElementById('user-dropdown');

  if (notifBtn && notifDropdown) {
    notifBtn.onclick = (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle('open');
      if (userDropdown) userDropdown.classList.remove('open');
    };
  }

  if (userBtn && userDropdown) {
    userBtn.onclick = (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('open');
      if (notifDropdown) notifDropdown.classList.remove('open');
    };
  }

  window.addEventListener('click', () => {
    if (notifDropdown) notifDropdown.classList.remove('open');
    if (userDropdown) userDropdown.classList.remove('open');
  });

  const markAllBtn = document.getElementById('notif-mark-all');
  if (markAllBtn) {
    markAllBtn.onclick = async (e) => {
      e.stopPropagation();
      await API.markAllNotificationsRead();
      const updated = await API.getNotifications();
      renderNavNotifications(updated);
      showToast('All notifications marked as read', 'info');
    };
  }

  const resetBtn = document.getElementById('demo-reset-btn');
  if (resetBtn) {
    resetBtn.onclick = () => {
      confirmAction('Reset all sample data back to default values? This clears recent listings and restored initial test records.', async () => {
        await API.resetData();
        showToast('All sample data has been reset to defaults!', 'info');
        setTimeout(() => window.location.reload(), 400);
      });
    };
  }
}

function renderNavUser(user) {
  const container = document.getElementById('nav-user-area');
  if (!container) return;

  if (user) {
    container.innerHTML = `
      <button type="button" class="user-profile-btn" id="user-menu-btn" aria-label="User menu">
        <span class="user-nav-avatar" style="background: ${user.avatarBg || '#0f766e'}">
          ${user.name.charAt(0)}
        </span>
        <span class="user-nav-name">${user.name.split(' ')[0]}</span>
        <span style="font-size: 0.75rem; color: var(--muted);">&#9662;</span>
      </button>

      <div class="dropdown-panel user-dropdown" id="user-dropdown">
        <div class="dropdown-user-info">
          <strong>${user.name}</strong>
          <small class="muted" style="display:block;">${user.role} • ${user.city}</small>
        </div>
        <div class="dropdown-divider"></div>
        <a href="profile.html" class="dropdown-item">👤 My Profile & Impact</a>
        <a href="dashboard.html" class="dropdown-item">📊 Dashboard Overview</a>
        <a href="about.html" class="dropdown-item">ℹ️ About SevaSetu</a>
        <a href="help.html" class="dropdown-item">❓ Help & Guidelines</a>
        <button type="button" class="dropdown-item" id="user-reset-btn">🔄 Reset Demo Data</button>
        <div class="dropdown-divider"></div>
        <button type="button" class="dropdown-item" id="user-logout-btn" style="color: var(--danger-text)">🚪 Sign Out</button>
      </div>
    `;

    document.getElementById('user-reset-btn').onclick = () => {
      confirmAction('Reset all sample data to default seed records?', async () => {
        await API.resetData();
        showToast('All data reset to defaults!', 'info');
        setTimeout(() => window.location.reload(), 400);
      });
    };

    document.getElementById('user-logout-btn').onclick = () => {
      showToast('Signed out of session', 'info');
      setTimeout(() => { window.location.href = 'login.html'; }, 400);
    };
  } else {
    container.innerHTML = `
      <a href="login.html" class="btn btn-ghost btn-sm">Sign In</a>
      <a href="register.html" class="btn btn-primary btn-sm">Join now</a>
    `;
  }
}

function renderNavNotifications(notifications) {
  const dot = document.getElementById('notif-dot');
  const list = document.getElementById('notif-list');
  const countEl = document.getElementById('notif-unread-count');
  if (!notifications) return;

  const unread = notifications.filter((n) => !n.read).length;

  if (dot) {
    if (unread > 0) {
      dot.style.display = 'grid';
      dot.textContent = unread;
    } else {
      dot.style.display = 'none';
    }
  }

  if (countEl) {
    countEl.textContent = `${unread} new`;
  }

  if (list) {
    if (notifications.length === 0) {
      list.innerHTML = `<div style="padding: 1.25rem 1rem; text-align: center; color: var(--muted); font-size: 0.85rem;">No notifications</div>`;
    } else {
      list.innerHTML = notifications.slice(0, 6).map((n) => `
        <div class="notif-popover-item ${n.read ? 'read' : 'unread'}" onclick="handleNotifClick('${n.id}', '${n.link || 'dashboard.html'}')">
          <div style="display: flex; justify-content: space-between; gap: 0.5rem;">
            <strong style="font-size: 0.84rem;">${n.title || 'Notice'}</strong>
            <small class="muted">${n.time}</small>
          </div>
          <p style="margin: 0.2rem 0 0; font-size: 0.78rem; color: var(--text);">${n.message}</p>
        </div>
      `).join('');
    }
  }
}

async function handleNotifClick(id, link) {
  await API.markNotificationRead(id);
  const target = link.endsWith('.html') ? link : `${link.replace(/^\//, '')}.html`;
  window.location.href = target;
}

document.addEventListener('DOMContentLoaded', initHeader);


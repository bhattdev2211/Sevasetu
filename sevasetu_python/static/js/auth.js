/**
 * Authentication and Profile Management
 */

async function initAuth() {
  // If on Login page
  const personaContainer = document.getElementById('login-persona-grid');
  if (personaContainer) {
    try {
      const data = await API.getInitialData();
      const personas = data.personas || [];
      const current = data.currentUser;

      personaContainer.innerHTML = personas.map((p) => `
        <button type="button" class="persona-quick-btn ${current?.id === p.id ? 'active' : ''}" onclick="loginWithPersona('${p.id}')">
          <span class="persona-circle" style="background: ${p.avatarBg || '#0f766e'}">${p.name.charAt(0)}</span>
          <div style="text-align: left; line-height: 1.2;">
            <strong style="font-size: 0.86rem; display: block;">${p.name}</strong>
            <small class="muted" style="font-size: 0.74rem;">${p.role} • ${p.city}</small>
          </div>
          ${current?.id === p.id ? '<span style="margin-left: auto; color: var(--teal-600); font-weight: bold;">✓ Active</span>' : ''}
        </button>
      `).join('');
    } catch (err) {
      console.warn('Could not load personas for login:', err);
    }

    const loginForm = document.getElementById('email-login-form');
    if (loginForm) {
      loginForm.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        if (!email) {
          showToast('Please enter your email address', 'warning');
          return;
        }

        try {
          const res = await API.login(email);
          if (res.success) {
            showToast(`Welcome back, ${res.user.name}!`, 'success');
            setTimeout(() => { window.location.href = '/dashboard'; }, 400);
          }
        } catch (err) {
          showToast('Login failed. Please check your network and credentials.', 'danger');
        }
      };
    }

    // Password reset modal triggers
    const forgotBtn = document.getElementById('forgot-password-link');
    if (forgotBtn) {
      forgotBtn.onclick = (e) => {
        e.preventDefault();
        openModal('password-reset-modal');
      };
    }

    const resetForm = document.getElementById('password-reset-form');
    if (resetForm) {
      resetForm.onsubmit = async (e) => {
        e.preventDefault();
        const resetEmail = document.getElementById('reset-email-input').value.trim();
        if (!resetEmail) {
          showToast('Please enter an email address', 'warning');
          return;
        }

        try {
          const res = await API.resetPassword(resetEmail);
          if (res.success) {
            showToast(res.message, 'success');
            closeModal('password-reset-modal');
            resetForm.reset();
          } else {
            showToast(res.error || 'Password reset request failed', 'danger');
          }
        } catch (err) {
          showToast('Password reset failed. Please try again.', 'danger');
        }
      };
    }
  }

  // If on Register page
  const regForm = document.getElementById('register-form');
  if (regForm) {
    regForm.onsubmit = async (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const phone = document.getElementById('reg-phone').value.trim();

      if (!name || !email || !phone) {
        showToast('Please fill out all required fields marked with *', 'warning');
        return;
      }

      const data = {
        name,
        email,
        phone,
        city: document.getElementById('reg-city').value,
        role: document.getElementById('reg-role').value,
        organization: document.getElementById('reg-org').value.trim()
      };

      try {
        const res = await API.register(data);
        if (res.success) {
          showToast(`Account created! Welcome to SevaSetu, ${res.user.name}!`, 'success');
          setTimeout(() => { window.location.href = '/dashboard'; }, 400);
        }
      } catch (err) {
        showToast('Registration failed. Please check your connection.', 'danger');
      }
    };
  }

  // If on Profile page
  const profileContainer = document.getElementById('profile-content-area');
  if (profileContainer) {
    loadProfile();
  }
}

async function loginWithPersona(personaId) {
  try {
    const res = await API.switchPersona(personaId);
    if (res.success) {
      showToast(`Signed in as ${res.user.name} (${res.user.role})!`, 'success');
      setTimeout(() => { window.location.href = '/dashboard'; }, 400);
    }
  } catch (err) {
    showToast('Failed to select persona', 'danger');
  }
}

async function loadProfile() {
  try {
    const user = await API.getCurrentUser();
    if (!user) return;

    // Populate user card
    const avatarEl = document.getElementById('profile-avatar');
    const nameEl = document.getElementById('profile-name');
    const roleEl = document.getElementById('profile-role');
    const emailEl = document.getElementById('profile-email');
    const phoneEl = document.getElementById('profile-phone');
    const cityEl = document.getElementById('profile-city');
    const orgEl = document.getElementById('profile-org');

    if (avatarEl) {
      avatarEl.style.background = user.avatarBg || '#0f766e';
      avatarEl.textContent = user.name.charAt(0);
    }
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = user.role;
    if (emailEl) emailEl.textContent = user.email;
    if (phoneEl) phoneEl.textContent = user.phone || 'Not added';
    if (cityEl) cityEl.textContent = user.city;
    if (orgEl) orgEl.textContent = user.organization || 'Independent Contributor';

    // Populate Impact Counters
    const mealsEl = document.getElementById('profile-meals-stat');
    const donorEl = document.getElementById('profile-donor-stat');
    const fundsEl = document.getElementById('profile-funds-stat');

    if (mealsEl) mealsEl.textContent = `${user.mealsRescued || 45}+`;
    if (donorEl) donorEl.textContent = user.bloodDonated ? 'Active Donor' : 'Eligible';
    if (fundsEl) fundsEl.textContent = formatINR(user.contributions || 3500);

    // Profile form
    const editForm = document.getElementById('profile-edit-form');
    if (editForm) {
      document.getElementById('edit-name').value = user.name || '';
      document.getElementById('edit-phone').value = user.phone || '';
      document.getElementById('edit-city').value = user.city || 'Rajkot';
      document.getElementById('edit-org').value = user.organization || '';

      editForm.onsubmit = async (e) => {
        e.preventDefault();
        const updates = {
          name: document.getElementById('edit-name').value.trim(),
          phone: document.getElementById('edit-phone').value.trim(),
          city: document.getElementById('edit-city').value,
          organization: document.getElementById('edit-org').value.trim()
        };

        if (!updates.name) {
          showToast('Name cannot be empty', 'warning');
          return;
        }

        try {
          const res = await API.updateProfile(updates);
          if (res.success) {
            showToast('Profile details updated and saved!', 'success');
            renderNavUser(res.user);
            loadProfile();
            toggleProfileEdit(false);
          }
        } catch (err) {
          showToast('Failed to save profile changes.', 'danger');
        }
      };
    }
  } catch (err) {
    console.error('Error loading profile:', err);
  }
}

function toggleProfileEdit(showEdit) {
  const viewCard = document.getElementById('profile-view-card');
  const editCard = document.getElementById('profile-edit-card');
  if (viewCard && editCard) {
    viewCard.style.display = showEdit ? 'none' : 'block';
    editCard.style.display = showEdit ? 'block' : 'none';
  }
}

document.addEventListener('DOMContentLoaded', initAuth);

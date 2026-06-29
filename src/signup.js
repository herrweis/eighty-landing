// ─── Sign-up form ───────────────────────────────────────────────────────
// Client-side validation only. The submit is stubbed — no provider is wired
// up and no secrets are committed.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Submits the signup form to the Vercel serverless function which writes
 * to Google Sheets. The API credentials are kept server-side for security.
 */
async function submitSignup(data) {
  try {
    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      // eslint-disable-next-line no-console
      console.error('[eighty°] sign-up error:', error);
      return { ok: false, error: error.error || 'Submission failed' };
    }

    const result = await response.json();
    // eslint-disable-next-line no-console
    console.log('[eighty°] sign-up success:', data.email);
    return result;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[eighty°] sign-up network error:', error);
    return { ok: false, error: 'Network error' };
  }
}

export function initSignup() {
  const form = document.querySelector('[data-form]');
  const errorEl = document.querySelector('[data-form-error]');
  if (!form) return;

  const nameEl = form.querySelector('#name');
  const emailEl = form.querySelector('#email');

  const showError = (message) => {
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.hidden = false;
  };
  const clearError = () => {
    if (errorEl) errorEl.hidden = true;
  };

  form.addEventListener('input', clearError);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = nameEl.value.trim();
    const email = emailEl.value.trim();

    if (!name) {
      showError('Please add your name.');
      nameEl.focus();
      return;
    }
    if (!EMAIL_RE.test(email)) {
      showError('Please enter a valid email address.');
      emailEl.focus();
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      const res = await submitSignup({ name, email });
      if (res.ok) {
        showSuccess(name);
      } else {
        showError('Something went wrong. Please try again.');
        if (submitBtn) submitBtn.disabled = false;
      }
    } catch {
      showError('Something went wrong. Please try again.');
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  /** Replace the form with a confirmation in the same label style. */
  function showSuccess(fullName) {
    const firstName = fullName.split(/\s+/)[0];
    const done = document.createElement('div');
    done.className = 'signup-done';
    done.setAttribute('role', 'status');
    done.innerHTML =
      `<span>You're on the list.</span>` +
      `<span class="signup-done__sub">For ${escapeHtml(firstName)}.</span>`;
    form.replaceWith(done);
    clearError();
    done.focus?.();
  }
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

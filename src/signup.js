// ─── Sign-up form ───────────────────────────────────────────────────────
// Posts leads straight to Momence — the same public endpoint their lead-form
// plugin uses, with our own markup instead of their embed. The host id and
// token are public (they ship in Momence's embed code), so no proxy needed.
// For now every sign-up is also copied to the Google Sheet (/api/subscribe)
// as a backup while the Momence side is bedded in.

const MOMENCE = {
  endpoint: 'https://api.momence.com/integrations/customer-leads/330703/collect',
  token: 'Z37WJQ4Lja',
  sourceId: 287786, // Lead source: "Foundation Members"
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Creates the lead in Momence. Resolves { ok, fieldErrors? } — Momence
 * answers 400 with per-field errors, anything else non-200 is a hard failure.
 */
async function submitLead(fields) {
  try {
    const response = await fetch(MOMENCE.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'omit',
      body: JSON.stringify({ ...fields, token: MOMENCE.token, sourceId: MOMENCE.sourceId }),
    });

    const result = await response.json().catch(() => ({}));
    if (response.ok && result.status === 'success') return { ok: true };

    // eslint-disable-next-line no-console
    console.error('[eighty°] sign-up error:', response.status, result);
    return { ok: false, fieldErrors: response.status === 400 ? result.error : null };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[eighty°] sign-up network error:', error);
    return { ok: false };
  }
}

/** Backup copy to the Google Sheet via the Vercel function. */
async function submitToSheet(data) {
  try {
    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (response.ok) return { ok: true };

    const error = await response.json().catch(() => ({}));
    // eslint-disable-next-line no-console
    console.error('[eighty°] sheet error:', response.status, error);
    return { ok: false };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[eighty°] sheet network error:', error);
    return { ok: false };
  }
}

export function initSignup() {
  const form = document.querySelector('[data-form]');
  const errorEl = document.querySelector('[data-form-error]');
  if (!form) return;

  const firstNameEl = form.querySelector('#first-name');
  const lastNameEl = form.querySelector('#last-name');
  const emailEl = form.querySelector('#email');
  const honeypotEl = form.querySelector('[name="_website"]');
  // Momence's bot check reads time-on-form, so we send it the same way
  const mountedAt = Date.now();

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

    const firstName = firstNameEl.value.trim();
    const lastName = lastNameEl.value.trim();
    const email = emailEl.value.trim();

    if (!firstName) {
      showError('Please add your first name.');
      firstNameEl.focus();
      return;
    }
    if (!lastName) {
      showError('Please add your last name.');
      lastNameEl.focus();
      return;
    }
    if (!EMAIL_RE.test(email)) {
      showError('Please enter a valid email address.');
      emailEl.focus();
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    const [lead, sheet] = await Promise.all([
      submitLead({
        firstName,
        lastName,
        email,
        // Submitting is the opt-in (see the note under the button). Same
        // value Momence's own form sends when its consent box is ticked.
        dataCollectConsent: 'on',
        ...(honeypotEl?.value ? { _website: honeypotEl.value } : {}),
        _t: Date.now() - mountedAt,
      }),
      submitToSheet({ name: `${firstName} ${lastName}`, email }),
    ]);

    // Either copy landing means we have them
    if (lead.ok || sheet.ok) {
      showSuccess(firstName);
      return;
    }
    showError(
      lead.fieldErrors?.email
        ? 'Please check your email address.'
        : 'Something went wrong. Please try again.'
    );
    if (submitBtn) submitBtn.disabled = false;
  });

  /** Replace the form with a confirmation in the same label style. */
  function showSuccess(firstName) {
    const done = document.createElement('div');
    done.className = 'signup-done';
    done.setAttribute('role', 'status');
    done.innerHTML =
      `<span class="signup-done__row">You are on the list.</span>` +
      `<span class="signup-done__row signup-done__row--sub">For ${escapeHtml(firstName)}.</span>`;
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

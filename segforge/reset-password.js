/**
 * SegForge — Password Reset landing page logic.
 *
 * Consumes the Supabase recovery token from the email link (either the hash-based
 * implicit flow: #access_token=...&type=recovery, or the PKCE flow: ?code=...),
 * establishes a short-lived recovery session, then lets the user set a new password
 * via supabase.auth.updateUser({ password }).
 *
 * Only the public SUPABASE_URL + anon key are used here (safe to expose — the anon
 * key enforces Row Level Security). No service-role key or JWT secret is present.
 */
'use strict';

// Public values — identical to what ships in the plugin's config.js.
const SUPABASE_URL      = 'https://oeplobkecghzwwxtxpwk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lcGxvYmtlY2doend3eHR4cHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MDM4OTUsImV4cCI6MjA5NzA3OTg5NX0.7PyG20qq3MQw42tQOcc8BNZNtE642Du0O0RcK7TPlJg';

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { detectSessionInUrl: true, persistSession: false, autoRefreshToken: false },
});

const form       = document.getElementById('resetForm');
const pw1         = document.getElementById('pw1');
const pw2         = document.getElementById('pw2');
const submitBtn   = document.getElementById('submitBtn');
const msg         = document.getElementById('msg');
const introText   = document.getElementById('introText');

let hasRecoverySession = false;

function showMsg(text, kind) {
    msg.textContent = text;
    msg.className = 'msg ' + kind;
}

function disableForm() {
    pw1.disabled = pw2.disabled = submitBtn.disabled = true;
}

// A recovery link may carry an error in the hash (expired/used link).
function hashError() {
    const h = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    if (h.get('error')) {
        return h.get('error_description') || h.get('error');
    }
    return null;
}

async function init() {
    const errText = hashError();
    if (errText) {
        disableForm();
        showMsg('This reset link is invalid or has expired. Please request a new one from the app.', 'error');
        return;
    }

    // PKCE flow: ?code=... needs to be exchanged for a session.
    const codeParam = new URLSearchParams(window.location.search).get('code');
    if (codeParam) {
        const { error } = await sb.auth.exchangeCodeForSession(codeParam);
        if (error) {
            disableForm();
            showMsg('This reset link is invalid or has expired. Please request a new one from the app.', 'error');
            return;
        }
    }

    // React to the recovery session being established (implicit flow via detectSessionInUrl).
    sb.auth.onAuthStateChange((event, session) => {
        if (session) hasRecoverySession = true;
    });

    // Give detectSessionInUrl a tick, then confirm we actually have a session.
    const { data } = await sb.auth.getSession();
    if (data.session) hasRecoverySession = true;

    if (!hasRecoverySession) {
        disableForm();
        showMsg('This page must be opened from the password-reset link in your email. If your link expired, request a new one from the app.', 'error');
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showMsg('', '');

    if (!hasRecoverySession) {
        showMsg('No active reset session. Please open the link from your email again.', 'error');
        return;
    }
    if (pw1.value.length < 6) {
        showMsg('Password must be at least 6 characters.', 'error');
        return;
    }
    if (pw1.value !== pw2.value) {
        showMsg('Passwords do not match.', 'error');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating...';

    const { error } = await sb.auth.updateUser({ password: pw1.value });

    if (error) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Update Password';
        showMsg(error.message || 'Could not update password. Please try again.', 'error');
        return;
    }

    // Success — end the temporary recovery session and confirm.
    await sb.auth.signOut().catch(() => {});
    form.classList.add('hidden');
    introText.classList.add('hidden');
    showMsg('Your password has been updated. You can now sign in with your new password in the SegForge panel.', 'success');
});

init();

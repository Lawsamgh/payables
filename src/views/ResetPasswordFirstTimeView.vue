<template>
  <div class="reset-pw">
    <div class="reset-pw__bg-wrap" aria-hidden="true">
      <div class="reset-pw__bg" />
      <div class="reset-pw__bg-glow" />
      <div class="reset-pw__bg-shapes">
        <div class="reset-pw__shape reset-pw__shape--1" />
        <div class="reset-pw__shape reset-pw__shape--2" />
        <div class="reset-pw__shape reset-pw__shape--3" />
      </div>
      <div class="reset-pw__bg-grid" />
      <div class="reset-pw__bg-noise" />
    </div>

    <div class="reset-pw__card">
      <div class="reset-pw__content">
        <div class="reset-pw__brand">
          <div class="reset-pw__icon-wrap">
            <div class="reset-pw__icon">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
          </div>
          <h1 class="reset-pw__title">Set your password</h1>
          <p class="reset-pw__subtitle">
            {{
              !isTokenValid && !validating
                ? "Choose a new password to finish setting up your account."
                : tokenError || "Choose a new password to finish setting up your account."
            }}
          </p>
          <div v-if="email" class="reset-pw__email-badge">
            <svg class="reset-pw__email-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span class="reset-pw__email-value">{{ email }}</span>
          </div>
        </div>

        <div v-if="validating" class="reset-pw__state">
          <span class="reset-pw__spinner" aria-hidden="true" />
          <p class="reset-pw__state-text">Checking your reset link…</p>
        </div>

        <div v-else-if="!isTokenValid" class="reset-pw__state">
          <p class="reset-pw__error-msg">
            {{
              tokenError ||
              "This reset link is invalid or has expired. Please request a new one from your administrator."
            }}
          </p>
          <button
            type="button"
            class="reset-pw__btn reset-pw__btn--primary"
            @click="goToLogin"
          >
            Back to sign in
          </button>
        </div>

        <form v-else class="reset-pw__form" @submit.prevent="submit">
          <div class="reset-pw__field-group">
            <label class="reset-pw__field">
              <span class="reset-pw__label">New password</span>
              <div class="reset-pw__input-wrap">
                <input
                  v-model="newPassword"
                  :type="showPassword ? 'text' : 'password'"
                  class="reset-pw__input"
                  placeholder="Enter new password"
                  autocomplete="new-password"
                />
                <button
                  type="button"
                  class="reset-pw__toggle-pw"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                  @click="showPassword = !showPassword"
                >
                  <svg v-if="!showPassword" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </button>
              </div>
              <span v-if="newPassword && newPassword.length < MIN_PASSWORD_LENGTH" class="reset-pw__hint">
                Min {{ MIN_PASSWORD_LENGTH }} characters
              </span>
            </label>
          </div>
          <label class="reset-pw__field">
            <span class="reset-pw__label">Confirm new password</span>
            <div class="reset-pw__input-wrap">
              <input
                v-model="confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                class="reset-pw__input"
                placeholder="Confirm new password"
                autocomplete="new-password"
              />
            </div>
          </label>

          <div class="reset-pw__actions">
            <button
              type="submit"
              class="reset-pw__btn reset-pw__btn--primary"
              :disabled="submitting"
            >
              <span v-if="submitting" class="reset-pw__btn-content">
                <span class="reset-pw__spinner reset-pw__spinner--sm" />
                Saving…
              </span>
              <span v-else class="reset-pw__btn-content">
                Set password and continue
              </span>
            </button>
            <button
              type="button"
              class="reset-pw__btn reset-pw__btn--secondary"
              :disabled="submitting"
              @click="goToLogin"
            >
              Back to sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { LAYOUTS, runScriptWithServiceAuth } from "../utils/filemakerApi";
import { useToastStore } from "../stores/toastStore";

const route = useRoute();
const router = useRouter();
const toast = useToastStore();

const token = computed(() => String(route.query.token ?? "").trim());

const validating = ref(false);
const isTokenValid = ref(false);
const tokenError = ref<string | null>(null);
const email = ref("");

const newPassword = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const submitting = ref(false);
const formError = ref<string | null>(null);

const MIN_PASSWORD_LENGTH = 6;

function parseJsonSafe(raw: string | null | undefined): unknown | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed || (trimmed[0] !== "{" && trimmed[0] !== "[")) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

async function validateToken() {
  const t = token.value;
  if (!t) {
    isTokenValid.value = false;
    tokenError.value = "Reset link is missing or invalid.";
    return;
  }
  validating.value = true;
  tokenError.value = null;
  isTokenValid.value = false;
  try {
    const scriptParam = JSON.stringify({ token: t });
    const { error, scriptResult, scriptError } =
      await runScriptWithServiceAuth(
        LAYOUTS.PAYABLES_USERS,
        "ValidateResetToken",
        scriptParam,
      );
    const code = (scriptError ?? "0").trim();
    const payload = parseJsonSafe(scriptResult) as
      | { valid?: boolean | number; email?: string; message?: string; error?: string }
      | null;
    const scriptMsg = payload?.message ?? payload?.error ?? null;
    if (error || code !== "0") {
      tokenError.value =
        scriptMsg ||
        error ||
        "Unable to validate reset link. Please try again.";
      isTokenValid.value = false;
      return;
    }
    if (!payload) {
      const raw = (scriptResult ?? "").trim();
      if (raw && raw !== "0" && raw.toLowerCase() !== "ok") {
        tokenError.value = raw;
        return;
      }
      tokenError.value =
        "Unable to validate reset link. No response from server.";
      isTokenValid.value = false;
      return;
    }
    const isValid = payload.valid === true || payload.valid === 1;
    if (!isValid) {
      tokenError.value =
        payload.message ||
        payload.error ||
        "This reset link is invalid or has expired. Please request a new one from your administrator.";
      isTokenValid.value = false;
      return;
    }
    isTokenValid.value = true;
    email.value = (payload.email ?? "").trim();
  } finally {
    validating.value = false;
  }
}

function validateForm(): string | null {
  if (!isTokenValid.value)
    return tokenError.value || "This reset link is no longer valid.";
  if (!newPassword.value.trim()) return "Enter a new password.";
  if (newPassword.value.length < MIN_PASSWORD_LENGTH) {
    return `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (newPassword.value !== confirmPassword.value) {
    return "New password and confirmation do not match.";
  }
  return null;
}

async function submit() {
  if (submitting.value) return;
  formError.value = null;
  const validationError = validateForm();
  if (validationError) {
    formError.value = validationError;
    toast.error(validationError);
    return;
  }
  submitting.value = true;
  try {
    const scriptParam = JSON.stringify({
      token: token.value,
      password: newPassword.value.trim(),
    });
    const { error, scriptResult, scriptError } =
      await runScriptWithServiceAuth(
        LAYOUTS.PAYABLES_USERS,
        "SetInitialPasswordFromToken",
        scriptParam,
      );
    const code = (scriptError ?? "0").trim();
    const payload = parseJsonSafe(scriptResult) as
      | { success?: boolean; message?: string; error?: string }
      | null;
    const scriptMsg = payload?.message ?? payload?.error ?? null;
    if (code !== "0") {
      const msg =
        scriptMsg || error || "Could not set password. Please try again.";
      toast.error(msg);
      return;
    }
    const raw = (scriptResult ?? "").trim();
    if (payload) {
      const isSuccess = payload.success !== false && !payload.error;
      if (!isSuccess) {
        const msg =
          payload.message ||
          payload.error ||
          "Could not set password. Please try again.";
        toast.error(msg);
        return;
      }
    } else if (raw && raw !== "0" && raw.toLowerCase() !== "ok") {
      toast.error(raw);
      return;
    }

    toast.success("Password set. You can now sign in.");
    router.replace({ path: "/" });
  } finally {
    submitting.value = false;
  }
}

function goToLogin() {
  router.replace({ path: "/" });
}

onMounted(() => {
  validateToken();
});
</script>

<style scoped>
.reset-pw {
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  position: relative;
  isolation: isolate;
}

.reset-pw__bg-wrap {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.reset-pw__bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      ellipse 120% 80% at 50% -30%,
      rgba(30, 58, 138, 0.2) 0%,
      transparent 55%
    ),
    radial-gradient(
      ellipse 80% 50% at 50% 120%,
      rgba(88, 28, 135, 0.12) 0%,
      transparent 55%
    ),
    linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
}

.reset-pw__bg-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 70% 50% at 50% 50%,
    rgba(59, 130, 246, 0.08) 0%,
    transparent 60%
  );
}

.reset-pw__bg-shapes {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.reset-pw__shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  will-change: transform;
}

.reset-pw__shape--1 {
  width: 480px;
  height: 480px;
  top: -20%;
  right: -10%;
  background: radial-gradient(
    circle,
    rgba(59, 130, 246, 0.3) 0%,
    transparent 65%
  );
  animation: reset-pw-float 20s ease-in-out infinite;
}

.reset-pw__shape--2 {
  width: 380px;
  height: 380px;
  bottom: -15%;
  left: -10%;
  background: radial-gradient(
    circle,
    rgba(99, 102, 241, 0.25) 0%,
    transparent 65%
  );
  animation: reset-pw-float 24s ease-in-out infinite reverse;
  animation-delay: -6s;
}

.reset-pw__shape--3 {
  width: 280px;
  height: 280px;
  top: 50%;
  left: 15%;
  background: radial-gradient(
    circle,
    rgba(168, 85, 247, 0.18) 0%,
    transparent 65%
  );
  animation: reset-pw-float 18s ease-in-out infinite;
  animation-delay: -3s;
}

@keyframes reset-pw-float {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(25px, -15px) scale(1.02);
  }
  66% {
    transform: translate(-15px, 20px) scale(0.98);
  }
}

.reset-pw__bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(148, 163, 184, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.04) 1px, transparent 1px);
  background-size: 80px 80px;
  mask-image: radial-gradient(
    ellipse 80% 60% at 50% 50%,
    black 20%,
    transparent 70%
  );
  -webkit-mask-image: radial-gradient(
    ellipse 80% 60% at 50% 50%,
    black 20%,
    transparent 70%
  );
}

.reset-pw__bg-noise {
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.reset-pw__card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 520px;
  padding: 3rem 2.5rem;
  overflow: hidden;
  background: linear-gradient(
    165deg,
    rgba(30, 41, 59, 0.7) 0%,
    rgba(30, 41, 59, 0.5) 50%,
    rgba(30, 41, 59, 0.6) 100%
  );
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 28px;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.06) inset,
    0 0 120px -20px rgba(59, 130, 246, 0.12),
    0 32px 80px -20px rgba(0, 0, 0, 0.5);
  animation: reset-pw-in 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes reset-pw-in {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reset-pw__content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.reset-pw__brand {
  text-align: center;
}

.reset-pw__icon-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.reset-pw__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.25) 0%,
    rgba(99, 102, 241, 0.2) 100%
  );
  border: 1px solid rgba(147, 197, 253, 0.2);
  border-radius: 18px;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.05) inset,
    0 8px 24px -8px rgba(59, 130, 246, 0.35);
}

.reset-pw__icon svg {
  width: 30px;
  height: 30px;
  color: rgba(191, 219, 254, 1);
}

.reset-pw__title {
  font-size: 1.625rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.2;
  color: white;
  margin: 0 0 0.5rem;
}

.reset-pw__subtitle {
  font-size: 0.95rem;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.78);
  margin: 0;
  max-width: 340px;
  margin-left: auto;
  margin-right: auto;
}

.reset-pw__email-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 0;
  box-sizing: border-box;
}

.reset-pw__email-icon {
  width: 18px;
  height: 18px;
  color: rgba(148, 163, 184, 0.9);
  flex-shrink: 0;
}

.reset-pw__email-value {
  font-size: 0.938rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95);
  word-break: break-all;
}

.reset-pw__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
}

.reset-pw__state-text {
  font-size: 0.938rem;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}

.reset-pw__spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-top-color: white;
  border-radius: 50%;
  animation: reset-pw-spin 0.7s linear infinite;
}

.reset-pw__spinner--sm {
  width: 1rem;
  height: 1rem;
  border-width: 1.5px;
}

@keyframes reset-pw-spin {
  to {
    transform: rotate(360deg);
  }
}

.reset-pw__error-msg {
  font-size: 0.938rem;
  line-height: 1.5;
  color: rgb(252, 165, 165);
  margin: 0;
  text-align: center;
}

.reset-pw__form {
  display: flex;
  flex-direction: column;
  gap: 1.375rem;
}

.reset-pw__field-group {
  animation: reset-pw-fade-in 0.4s ease both;
}

.reset-pw__field {
  display: block;
}

.reset-pw__label {
  display: block;
  font-size: 0.813rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.92);
  margin-bottom: 0.5rem;
  letter-spacing: 0.01em;
}

.reset-pw__input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.reset-pw__input {
  width: 100%;
  padding: 0.9rem 1.25rem;
  padding-right: 2.75rem;
  font-size: 0.938rem;
  color: white;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 14px;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.reset-pw__input-wrap:not(:has(.reset-pw__toggle-pw)) .reset-pw__input {
  padding-right: 1.25rem;
}

.reset-pw__input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.reset-pw__input:hover {
  background: rgba(15, 23, 42, 0.6);
  border-color: rgba(148, 163, 184, 0.25);
}

.reset-pw__input:focus {
  outline: none;
  border-color: rgba(96, 165, 250, 0.6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  background: rgba(15, 23, 42, 0.65);
}

.reset-pw__toggle-pw {
  position: absolute;
  right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  color: rgba(148, 163, 184, 0.7);
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: color 0.2s ease, background 0.2s ease;
}

.reset-pw__toggle-pw:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.06);
}

.reset-pw__hint {
  display: block;
  margin-top: 0.375rem;
  font-size: 0.75rem;
  color: rgba(251, 191, 36, 0.9);
}

@keyframes reset-pw-fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reset-pw__actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.reset-pw__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.95rem 1.5rem;
  font-family: inherit;
  font-size: 0.938rem;
  font-weight: 600;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  transition:
    all 0.2s ease,
    transform 0.15s ease;
}

.reset-pw__btn:active:not(:disabled) {
  transform: scale(0.99);
}

.reset-pw__btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.reset-pw__btn--primary {
  color: white;
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.1) inset,
    0 4px 16px -4px rgba(59, 130, 246, 0.5);
}

.reset-pw__btn--primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.12) inset,
    0 6px 24px -4px rgba(59, 130, 246, 0.55);
}

.reset-pw__btn--secondary {
  color: rgba(255, 255, 255, 0.88);
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.25);
}

.reset-pw__btn--secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(148, 163, 184, 0.35);
  color: white;
}

.reset-pw__btn-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

</style>

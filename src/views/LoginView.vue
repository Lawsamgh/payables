<template>
  <div class="login" @mousemove="onMouseMove" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
    <div class="login__bg" aria-hidden="true" />
    <div class="login__bg-glow" aria-hidden="true" />
    <div class="login__bg-shapes" aria-hidden="true">
      <div class="login__shape login__shape--1" />
      <div class="login__shape login__shape--2" />
      <div class="login__shape login__shape--3" />
      <div class="login__shape login__shape--4" />
      <div class="login__shape login__shape--5" />
    </div>
    <div class="login__bg-drops" aria-hidden="true">
      <div class="login__drop login__drop--1" />
      <div class="login__drop login__drop--2" />
      <div class="login__drop login__drop--3" />
      <div class="login__drop login__drop--4" />
      <div class="login__drop login__drop--5" />
      <div class="login__drop login__drop--6" />
      <div class="login__drop login__drop--7" />
      <div class="login__drop login__drop--8" />
    </div>
    <div class="login__bg-grid" aria-hidden="true" />
    <div class="login__bg-dots" aria-hidden="true" />
    <div class="login__bg-noise" aria-hidden="true" />

    <svg
      class="login__cursor-flame"
      aria-hidden="true"
      :style="cursorFlameStyle"
    >
      <defs>
        <linearGradient id="flame-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="rgba(147, 197, 253, 0.95)" />
          <stop offset="35%" stop-color="rgba(99, 102, 241, 0.6)" />
          <stop offset="70%" stop-color="rgba(168, 85, 247, 0.25)" />
          <stop offset="100%" stop-color="transparent" />
        </linearGradient>
        <filter id="flame-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <polyline
        fill="none"
        stroke="url(#flame-gradient)"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        filter="url(#flame-glow)"
        :points="flamePath"
      />
    </svg>

    <div class="login__card">
      <div class="login__card-content">
      <div class="login__brand">
        <div class="login__logo">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 class="login__title">Finance Payables</h1>
        <p class="login__subtitle">Sign in to continue</p>
        <div class="login__steps" aria-hidden="true">
          <span class="login__step-dot" :class="{ 'login__step-dot--active': step === 'email' }" />
          <span class="login__step-line" :class="{ 'login__step-line--filled': step === 'password' }" />
          <span class="login__step-dot" :class="{ 'login__step-dot--active': step === 'password' }" />
        </div>
      </div>

      <div class="login__slide-track">
        <form class="login__form" @submit.prevent="step === 'email' ? proceed() : submit()">
        <Transition name="login-step" mode="out-in" @after-enter="focusPasswordInput">
          <div v-if="step === 'email'" key="email" class="login__step">
            <label v-if="!hasBaseUrl" class="login__field">
              <span class="login__label">FileMaker base URL</span>
              <input
                v-model="baseUrl"
                type="url"
                class="login__input"
                placeholder="https://host/fmi/data/v1/databases/YourDB"
                required
                autocomplete="url"
              />
            </label>
            <label class="login__field">
              <span class="login__label">Email</span>
              <input
                v-model="email"
                type="email"
                class="login__input"
                placeholder="name@example.com"
                required
                autocomplete="email"
              />
            </label>
            <Transition name="login-error">
              <p v-if="error" class="login__error">{{ error }}</p>
            </Transition>
            <button
              type="submit"
              class="login__btn"
              :disabled="loading"
            >
              Proceed
            </button>
          </div>
          <div v-else key="password" class="login__step">
            <div class="login__email-display">
              <span class="login__label">Signing in as</span>
              <span class="login__email-value">{{ email }}</span>
              <button
                type="button"
                class="login__back"
                @click="goBack"
              >
                Change
              </button>
            </div>
            <label class="login__field">
              <span class="login__label">Password</span>
              <input
                ref="passwordInputRef"
                v-model="password"
                type="password"
                class="login__input"
                placeholder="Enter your password"
                required
                autocomplete="current-password"
              />
            </label>
            <Transition name="login-error">
              <p v-if="error" class="login__error">{{ error }}</p>
            </Transition>
            <button
              type="submit"
              class="login__btn"
              :disabled="loading"
            >
              <span v-if="loading" class="login__btn-content">
                <span class="login__spinner" />
                Signing in…
              </span>
              <span v-else class="login__btn-content">Sign in</span>
            </button>
          </div>
        </Transition>
      </form>
      </div>

      <p class="login__hint">Use your FileMaker account credentials</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFileMaker } from '../composables/useFileMaker'
import { getBaseUrl, setSessionBaseUrl } from '../utils/filemakerApi'
import { useToastStore } from '../stores/toastStore'

const router = useRouter()
const toast = useToastStore()
const { login: fmLogin, hasBaseUrl, error: fmError } = useFileMaker()

const baseUrl = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const step = ref<'email' | 'password'>('email')
const passwordInputRef = ref<HTMLInputElement | null>(null)

const hasBaseUrlEnv = computed(() => !!getBaseUrl()?.trim())

// Thin line cursor flame – trail with delay
const TRAIL_LEN = 24
const trail = ref<{ x: number; y: number }[]>([])
const mouseX = ref(0)
const mouseY = ref(0)
let rafId = 0
let isPointerOver = false

const cursorFlameStyle = computed(() => ({
  opacity: isPointerOver ? 1 : 0,
}))

const flamePath = computed(() => {
  const pts = trail.value
  if (pts.length < 2) return ''
  return pts.map((p) => `${p.x},${p.y}`).join(' ')
})

function onMouseMove(e: MouseEvent) {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
}

function onMouseEnter(e: MouseEvent) {
  isPointerOver = true
  const x = e.clientX
  const y = e.clientY
  mouseX.value = x
  mouseY.value = y
  trail.value = Array.from({ length: TRAIL_LEN }, () => ({ x, y }))
}

function onMouseLeave() {
  isPointerOver = false
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function tick() {
  let px = mouseX.value
  let py = mouseY.value
  const next: { x: number; y: number }[] = []
  const factor = 0.18
  for (let i = 0; i < TRAIL_LEN; i++) {
    const pt = trail.value[i] ?? { x: px, y: py }
    const nx = lerp(pt.x, px, factor)
    const ny = lerp(pt.y, py, factor)
    next.push({ x: nx, y: ny })
    px = nx
    py = ny
  }
  trail.value = next
  rafId = requestAnimationFrame(tick)
}

onMounted(() => {
  rafId = requestAnimationFrame(tick)
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
})

async function proceed() {
  error.value = null
  if (!hasBaseUrlEnv.value && !baseUrl.value.trim()) {
    toast.error('Enter FileMaker base URL')
    return
  }
  if (!email.value.trim()) {
    toast.error('Enter your email')
    return
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value.trim())) {
    toast.error('Enter a valid email address')
    return
  }
  step.value = 'password'
}

function focusPasswordInput() {
  if (step.value === 'password') {
    passwordInputRef.value?.focus()
  }
}

function goBack() {
  error.value = null
  step.value = 'email'
}

async function submit() {
  error.value = null
  if (!password.value) {
    toast.error('Enter your password')
    return
  }

  loading.value = true
  try {
    if (!hasBaseUrlEnv.value && baseUrl.value.trim()) {
      setSessionBaseUrl(baseUrl.value.trim())
    }
    const ok = await fmLogin({
      username: email.value.trim(),
      password: password.value.trim(),
    })
    if (ok) {
      loading.value = false
      router.replace('/home')
    } else {
      error.value = null
      password.value = ''
      const msg = fmError.value || 'Invalid credentials. Please try again.'
      toast.error(msg)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login {
  width: 100%;
  height: 100vh;
  height: 100dvh;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  position: relative;
}

.login__bg {
  position: fixed;
  inset: 0;
  z-index: -5;
  background:
    radial-gradient(ellipse 120% 80% at 50% -30%, rgba(30, 58, 138, 0.2) 0%, transparent 55%),
    radial-gradient(ellipse 80% 50% at 50% 120%, rgba(88, 28, 135, 0.12) 0%, transparent 55%),
    linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
}

.login__bg-glow {
  position: fixed;
  inset: 0;
  z-index: -4;
  background: radial-gradient(
    ellipse 70% 50% at 50% 50%,
    rgba(59, 130, 246, 0.08) 0%,
    transparent 60%
  );
}

.login__bg-shapes {
  position: fixed;
  inset: 0;
  z-index: -3;
  overflow: hidden;
}

.login__shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  will-change: transform;
}

.login__shape--1 {
  width: 640px;
  height: 640px;
  top: -25%;
  right: -15%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.35) 0%, transparent 65%);
  animation: login-float 18s ease-in-out infinite;
}

.login__shape--2 {
  width: 500px;
  height: 500px;
  bottom: -20%;
  left: -12%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.28) 0%, transparent 65%);
  animation: login-float 22s ease-in-out infinite reverse;
  animation-delay: -4s;
}

.login__shape--3 {
  width: 360px;
  height: 360px;
  top: 55%;
  left: 10%;
  background: radial-gradient(circle, rgba(14, 165, 233, 0.2) 0%, transparent 65%);
  animation: login-float 20s ease-in-out infinite;
  animation-delay: -8s;
}

.login__shape--4 {
  width: 320px;
  height: 320px;
  top: 15%;
  right: 20%;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.18) 0%, transparent 65%);
  animation: login-float 25s ease-in-out infinite reverse;
  animation-delay: -2s;
}

.login__shape--5 {
  width: 280px;
  height: 280px;
  top: 40%;
  right: 5%;
  background: radial-gradient(circle, rgba(34, 197, 94, 0.12) 0%, transparent 65%);
  animation: login-float 24s ease-in-out infinite;
  animation-delay: -12s;
}

.login__bg-drops {
  position: fixed;
  inset: 0;
  z-index: -3;
  overflow: hidden;
}

.login__drop {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  will-change: transform, opacity;
}

.login__drop--1 {
  width: 200px;
  height: 200px;
  top: 8%;
  left: 12%;
  background: radial-gradient(
    circle at 30% 30%,
    rgba(59, 130, 246, 0.5) 0%,
    rgba(99, 102, 241, 0.3) 40%,
    rgba(168, 85, 247, 0.15) 70%,
    transparent 100%
  );
  animation: login-drop-float 10s ease-in-out infinite;
}

.login__drop--2 {
  width: 180px;
  height: 180px;
  top: 25%;
  right: 8%;
  background: radial-gradient(
    circle at 60% 40%,
    rgba(14, 165, 233, 0.45) 0%,
    rgba(59, 130, 246, 0.3) 50%,
    rgba(99, 102, 241, 0.1) 80%,
    transparent 100%
  );
  animation: login-drop-drift 12s ease-in-out infinite reverse;
  animation-delay: -2s;
}

.login__drop--3 {
  width: 220px;
  height: 220px;
  bottom: 15%;
  left: 5%;
  background: radial-gradient(
    circle at 40% 50%,
    rgba(168, 85, 247, 0.4) 0%,
    rgba(236, 72, 153, 0.25) 45%,
    rgba(59, 130, 246, 0.1) 75%,
    transparent 100%
  );
  animation: login-drop-wander 14s ease-in-out infinite;
  animation-delay: -4s;
}

.login__drop--4 {
  width: 160px;
  height: 160px;
  bottom: 30%;
  right: 18%;
  background: radial-gradient(
    circle at 50% 30%,
    rgba(99, 102, 241, 0.5) 0%,
    rgba(168, 85, 247, 0.35) 35%,
    rgba(236, 72, 153, 0.15) 65%,
    transparent 100%
  );
  animation: login-drop-drift 11s ease-in-out infinite reverse;
  animation-delay: -6s;
}

.login__drop--5 {
  width: 140px;
  height: 140px;
  top: 45%;
  left: 25%;
  background: radial-gradient(
    circle at 35% 60%,
    rgba(34, 211, 238, 0.4) 0%,
    rgba(59, 130, 246, 0.25) 50%,
    transparent 85%
  );
  animation: login-drop-wander 9s ease-in-out infinite;
  animation-delay: -1s;
}

.login__drop--6 {
  width: 190px;
  height: 190px;
  top: 60%;
  right: 22%;
  background: radial-gradient(
    circle at 65% 35%,
    rgba(236, 72, 153, 0.35) 0%,
    rgba(168, 85, 247, 0.3) 40%,
    rgba(59, 130, 246, 0.1) 70%,
    transparent 100%
  );
  animation: login-drop-float 13s ease-in-out infinite reverse;
  animation-delay: -8s;
}

.login__drop--7 {
  width: 170px;
  height: 170px;
  top: 12%;
  right: 35%;
  background: radial-gradient(
    circle at 45% 55%,
    rgba(59, 130, 246, 0.45) 0%,
    rgba(14, 165, 233, 0.3) 40%,
    rgba(34, 211, 238, 0.15) 70%,
    transparent 100%
  );
  animation: login-drop-drift 15s ease-in-out infinite;
  animation-delay: -3s;
}

.login__drop--8 {
  width: 150px;
  height: 150px;
  bottom: 8%;
  left: 35%;
  background: radial-gradient(
    circle at 55% 45%,
    rgba(168, 85, 247, 0.45) 0%,
    rgba(236, 72, 153, 0.3) 45%,
    rgba(251, 146, 60, 0.1) 75%,
    transparent 100%
  );
  animation: login-drop-wander 11s ease-in-out infinite reverse;
  animation-delay: -5s;
}

@keyframes login-drop-float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  20% { transform: translate(40px, -35px) scale(1.08); }
  40% { transform: translate(-30px, 25px) scale(0.92); }
  60% { transform: translate(35px, 30px) scale(1.05); }
  80% { transform: translate(-25px, -20px) scale(0.97); }
}

@keyframes login-drop-drift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-45px, 40px) scale(1.06); }
  66% { transform: translate(50px, -30px) scale(0.94); }
}

@keyframes login-drop-wander {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(60px, 0) scale(1.04); }
  50% { transform: translate(30px, -50px) scale(0.96); }
  75% { transform: translate(-40px, -25px) scale(1.03); }
}

.login__bg-grid {
  position: fixed;
  inset: 0;
  z-index: -2;
  background-image:
    linear-gradient(rgba(148, 163, 184, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.04) 1px, transparent 1px);
  background-size: 80px 80px;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 50%, black 20%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 50%, black 20%, transparent 70%);
}

.login__bg-dots {
  position: fixed;
  inset: 0;
  z-index: -2;
  background-image: radial-gradient(rgba(148, 163, 184, 0.15) 1px, transparent 1px);
  background-size: 24px 24px;
  mask-image: radial-gradient(ellipse 100% 100% at 50% 50%, black 0%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse 100% 100% at 50% 50%, black 0%, transparent 70%);
}

.login__bg-noise {
  position: fixed;
  inset: 0;
  z-index: -1;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

@keyframes login-float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -20px) scale(1.02); }
  66% { transform: translate(-20px, 25px) scale(0.98); }
}

.login__cursor-flame {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  transition: opacity 0.4s ease-out;
  will-change: opacity;
}

.login__card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 560px;
  padding: 2.75rem 2.5rem;
  overflow: hidden;
  background: rgba(30, 41, 59, 0.55);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 24px;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.04) inset,
    0 32px 64px -16px rgba(0, 0, 0, 0.45);
  animation: login-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.login__brand {
  text-align: center;
  margin-bottom: 2.25rem;
}

.login__steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.login__step-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(148, 163, 184, 0.3);
  transition: all 0.3s ease;
}

.login__step-dot--active {
  background: var(--color-accent);
  transform: scale(1.25);
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.5);
}

.login__step-line {
  width: 32px;
  height: 2px;
  border-radius: 1px;
  background: rgba(148, 163, 184, 0.25);
  transition: background 0.3s ease;
}

.login__step-line--filled {
  background: linear-gradient(90deg, var(--color-accent), rgba(99, 102, 241, 0.6));
}

.login__slide-track {
  position: relative;
  overflow: hidden;
  min-height: 220px;
}

.login__logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin-bottom: 1.25rem;
  background: rgba(59, 130, 246, 0.12);
  border-radius: 16px;
}

.login__logo svg {
  width: 28px;
  height: 28px;
  color: rgba(147, 197, 253, 0.95);
}

.login__title {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: var(--color-text);
  margin: 0 0 0.25rem;
}

.login__subtitle {
  font-size: 0.938rem;
  color: var(--color-text-muted);
  margin: 0;
}

.login__form {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.login__step {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0.25rem 0;
}

.login__email-display {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.login__email-display .login__label {
  margin-bottom: 0;
  width: 100%;
  font-size: 0.75rem;
}

.login__email-value {
  font-size: 0.938rem;
  color: var(--color-text);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.login__back {
  font-size: 0.813rem;
  font-weight: 500;
  color: var(--color-accent);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0;
  transition: opacity 0.2s;
}

.login__back:hover {
  opacity: 0.85;
}

.login__field {
  display: block;
}

.login__label {
  display: block;
  font-size: 0.813rem;
  font-weight: 500;
  color: var(--color-text-muted);
  margin-bottom: 0.5rem;
}

.login__input {
  width: 100%;
  padding: 0.875rem 1.125rem;
  font-size: 0.938rem;
  color: var(--color-text);
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 12px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.login__input::placeholder {
  color: rgba(148, 163, 184, 0.5);
}

.login__input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.login__error {
  padding: 0.75rem 1rem;
  font-size: 0.813rem;
  color: rgb(252, 165, 165);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 10px;
}

.login__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.9375rem 1.25rem;
  margin-top: 0.25rem;
  font-family: inherit;
  font-size: 0.938rem;
  font-weight: 600;
  color: white;
  background: var(--color-accent);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}

.login__btn:hover:not(:disabled) {
  background: #2563eb;
}

.login__btn:active:not(:disabled) {
  transform: scale(0.99);
}

.login__btn:disabled {
  opacity: 0.8;
  cursor: not-allowed;
}

.login__btn-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.login__spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: login-spin 0.7s linear infinite;
}

.login__hint {
  margin-top: 2rem;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  text-align: center;
}

@keyframes login-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes login-spin {
  to { transform: rotate(360deg); }
}

.login-error-enter-active,
.login-error-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.login-error-enter-from,
.login-error-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.login-step-enter-active {
  transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1), transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.login-step-leave-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
  left: 0;
  right: 0;
}

.login-step-enter-from {
  opacity: 0;
  transform: translateX(40px);
}

.login-step-leave-to {
  opacity: 0;
  transform: translateX(-40px);
}
</style>

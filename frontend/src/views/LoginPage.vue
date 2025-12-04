<template>
  <div class="login-page">
    <!-- Fond animé -->
    <div class="animated-background">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <div class="login-container">
      <!-- Section Logo -->
      <div class="logo-section">
        <div class="logo-wrapper">
          <div class="logo-ring"></div>
          <div class="logo-icon">
            <svg viewBox="0 0 100 100" class="logo-svg">
              <path
                d="M30 50 L45 65 L70 40"
                stroke="#00478F"
                stroke-width="6"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <circle
                cx="50"
                cy="50"
                r="35"
                stroke="#EAC435"
                stroke-width="3"
                fill="none"
              />
              <path
                d="M50 15 A35 35 0 0 1 85 50"
                stroke="#00478F"
                stroke-width="3"
                fill="none"
                stroke-dasharray="5,5"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 50 50"
                  to="360 50 50"
                  dur="10s"
                  repeatCount="indefinite"
                />
              </path>
            </svg>
          </div>
        </div>
        <h1 class="app-title">MassPay<span class="highlight">Pro</span></h1>
        <p class="app-subtitle">Plateforme de paiement de masse intelligente</p>
      </div>

      <!-- Formulaire de connexion -->
      <div class="login-form-section">
        <div class="form-header">
          <h2>Bienvenue</h2>
          <p>Connectez-vous pour accéder à votre espace</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              v-model="email"
              placeholder="exemple@email.com"
              required
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label for="password">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Mot de passe
            </label>
            <div class="password-input-wrapper">
              <input
                id="password"
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                placeholder="Entrez votre mot de passe"
                required
                :disabled="loading"
              />
              <button
                type="button"
                class="toggle-password"
                @click="showPassword = !showPassword"
                tabindex="-1"
              >
                <svg
                  v-if="!showPassword"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <svg
                  v-else
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                  />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              </button>
            </div>
          </div>

          <div class="form-options">
            <label class="remember-me">
              <input type="checkbox" v-model="rememberMe" />
              <span class="checkmark"></span>
              Se souvenir de moi
            </label>
            <a href="#" class="forgot-password">Mot de passe oublié ?</a>
          </div>

          <button type="submit" class="login-btn" :disabled="loading">
            <span v-if="!loading">Se connecter</span>
            <div v-else class="loading-spinner">
              <div class="spinner"></div>
              <span>Connexion...</span>
            </div>
          </button>

          <div v-if="error" class="error-message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {{ error }}
          </div>
        </form>

        <div class="form-footer">
          <p>Première connexion ? <a href="#">Créer un compte</a></p>
        </div>
      </div>
    </div>

    <!-- Informations de sécurité -->
    <div class="security-badge">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
      <span>Connexion sécurisée SSL</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "LoginPage",
  data() {
    return {
      email: "",
      password: "",
      showPassword: false,
      rememberMe: false,
      loading: false,
      error: "",
    };
  },
  methods: {
    handleLogin() {
      this.isLoading = true;
      this.errorMessage = "";

      setTimeout(() => {
        if (this.email && this.password) {
          localStorage.setItem("isAuthenticated", "true");
          localStorage.setItem("userEmail", this.email);
          localStorage.setItem("showUploadModal", "true"); // Afficher le modal au premier accès
          this.$router.push("/dashboard");
        } else {
          this.errorMessage = "Veuillez remplir tous les champs";
          this.isLoading = false;
        }
      }, 1500);
    },
  },
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #00478f 0%, #0066cc 50%, #00478f 100%);
  position: relative;
  overflow: hidden;
  padding: 20px;
}

/* Fond animé */
.animated-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(234, 196, 53, 0.15) 0%,
    transparent 70%
  );
  animation: float 20s infinite ease-in-out;
}

.circle-1 {
  width: 600px;
  height: 600px;
  top: -200px;
  left: -200px;
  animation-delay: 0s;
}

.circle-2 {
  width: 400px;
  height: 400px;
  bottom: -100px;
  right: -100px;
  animation-delay: 5s;
}

.circle-3 {
  width: 300px;
  height: 300px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 10s;
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

/* Container principal */
.login-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 1200px;
  width: 100%;
  background: #ffffff;
  border-radius: 32px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  position: relative;
  z-index: 1;
}

/* Section Logo */
.logo-section {
  background: linear-gradient(135deg, #00478f 0%, #003366 100%);
  padding: 80px 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.logo-section::before {
  content: "";
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(234, 196, 53, 0.1) 0%,
    transparent 70%
  );
  animation: rotate 30s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.logo-wrapper {
  position: relative;
  width: 180px;
  height: 180px;
  margin-bottom: 40px;
  z-index: 1;
}

.logo-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border: 3px solid rgba(234, 196, 53, 0.3);
  border-radius: 50%;
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.5;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 1;
  }
}

.logo-icon {
  width: 140px;
  height: 140px;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 2;
  margin: 20px auto;
}

.logo-svg {
  width: 80px;
  height: 80px;
}

.app-title {
  font-size: 42px;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 12px 0;
  letter-spacing: -1px;
  position: relative;
  z-index: 1;
}

.app-title .highlight {
  color: #eac435;
}

.app-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-weight: 400;
  position: relative;
  z-index: 1;
}

/* Section Formulaire */
.login-form-section {
  padding: 80px 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-header {
  margin-bottom: 40px;
}

.form-header h2 {
  font-size: 32px;
  font-weight: 700;
  color: #000000;
  margin: 0 0 8px 0;
}

.form-header p {
  font-size: 15px;
  color: #666666;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #000000;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-group label svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
  color: #00478f;
}

.form-group input {
  padding: 16px 18px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 15px;
  font-family: inherit;
  transition: all 0.3s ease;
  background: #ffffff;
}

.form-group input:focus {
  outline: none;
  border-color: #00478f;
  box-shadow: 0 0 0 4px rgba(0, 71, 143, 0.1);
}

.form-group input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.password-input-wrapper {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background 0.3s;
}

.toggle-password:hover {
  background: #f5f5f5;
}

.toggle-password svg {
  width: 20px;
  height: 20px;
  stroke-width: 2;
  color: #666666;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -8px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  color: #666666;
  user-select: none;
}

.remember-me input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  position: relative;
}

.remember-me input:checked + .checkmark {
  background: #00478f;
  border-color: #00478f;
}

.remember-me input:checked + .checkmark::after {
  content: "";
  position: absolute;
  width: 5px;
  height: 10px;
  border: solid #ffffff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  top: 2px;
}

.forgot-password {
  font-size: 14px;
  color: #00478f;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s;
}

.forgot-password:hover {
  color: #eac435;
}

.login-btn {
  padding: 18px 24px;
  background: linear-gradient(135deg, #00478f 0%, #0066cc 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
  box-shadow: 0 4px 15px rgba(0, 71, 143, 0.3);
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 71, 143, 0.4);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 10px;
  padding: 14px 16px;
  color: #c33;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: -8px;
}

.error-message svg {
  width: 20px;
  height: 20px;
  stroke-width: 2;
  flex-shrink: 0;
}

.form-footer {
  text-align: center;
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid #e0e0e0;
}

.form-footer p {
  font-size: 14px;
  color: #666666;
  margin: 0;
}

.form-footer a {
  color: #00478f;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.3s;
}

.form-footer a:hover {
  color: #eac435;
}

/* Badge de sécurité */
.security-badge {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 12px 24px;
  border-radius: 25px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 2;
}

.security-badge svg {
  width: 20px;
  height: 20px;
  stroke-width: 2;
  color: #00478f;
}

.security-badge span {
  font-size: 13px;
  font-weight: 600;
  color: #000000;
}

/* Responsive */
@media (max-width: 1024px) {
  .login-container {
    grid-template-columns: 1fr;
    max-width: 500px;
  }

  .logo-section {
    padding: 60px 40px;
  }

  .login-form-section {
    padding: 60px 40px;
  }
}

@media (max-width: 640px) {
  .login-page {
    padding: 15px;
  }

  .logo-section {
    padding: 40px 30px;
  }

  .login-form-section {
    padding: 40px 30px;
  }

  .form-header h2 {
    font-size: 26px;
  }

  .app-title {
    font-size: 32px;
  }

  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>

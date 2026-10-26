/**
 * ==============================================================================
 * AUTH GATEKEEPER - GRUPO EDÚCATE COLOMBIA
 * Control de acceso y bloqueo institucional para el Catálogo de Pruebas 2026
 * ==============================================================================
 */

const AUTH_CONFIG = {
  ACCESS_KEY: "Educate2026*", // <-- Clave institucional modificable
  SESSION_KEY: "nexus_auth_session"
};

(function () {
  // 1. Verificación inmediata de sesión
  function isAuthorized() {
    try {
      return sessionStorage.getItem(AUTH_CONFIG.SESSION_KEY) === "authorized";
    } catch (e) {
      return false;
    }
  }

  // Si ya cuenta con autorización activa, no bloquear
  if (isAuthorized()) {
    return;
  }

  // 2. Inyección inmediata de estilos de bloqueo para prevenir parpadeo (FOUC)
  const styleEl = document.createElement("style");
  styleEl.id = "auth-gatekeeper-styles";
  styleEl.textContent = `
    body.gatekeeper-locked {
      overflow: hidden !important;
      height: 100vh !important;
    }

    #auth-gatekeeper-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: linear-gradient(135deg, rgba(7, 12, 23, 0.96) 0%, rgba(13, 26, 58, 0.98) 100%);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      opacity: 1;
      visibility: visible;
      transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.35s ease;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    }

    #auth-gatekeeper-overlay.gatekeeper-hidden {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }

    .gatekeeper-card {
      background: #ffffff;
      width: 100%;
      max-width: 440px;
      border-radius: 24px;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      animation: gatekeeperSlideUp 0.38s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
    }

    @keyframes gatekeeperSlideUp {
      from { transform: translateY(28px) scale(0.96); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }

    .gatekeeper-header {
      background: linear-gradient(135deg, #070c17 0%, #0d1e44 100%);
      color: #ffffff;
      padding: 30px 28px 24px;
      text-align: center;
      position: relative;
      border-bottom: 3px solid #13a2f2;
    }

    .gatekeeper-icon-badge {
      width: 58px;
      height: 58px;
      margin: 0 auto 16px;
      border-radius: 16px;
      background: rgba(19, 162, 242, 0.15);
      border: 1px solid rgba(19, 162, 242, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #13a2f2;
      box-shadow: 0 4px 18px rgba(19, 162, 242, 0.25);
    }

    .gatekeeper-icon-badge svg {
      width: 28px;
      height: 28px;
    }

    .gatekeeper-title {
      font-size: 1.3rem;
      font-weight: 800;
      letter-spacing: -0.01em;
      color: #ffffff;
      margin-bottom: 6px;
    }

    .gatekeeper-subtitle {
      font-size: 0.82rem;
      color: rgba(255, 255, 255, 0.78);
      line-height: 1.45;
    }

    .gatekeeper-body {
      padding: 28px;
      display: flex;
      flex-direction: column;
      gap: 18px;
      background: #ffffff;
    }

    .gatekeeper-input-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .gatekeeper-label {
      font-size: 0.76rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #5c6b84;
    }

    .gatekeeper-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .gatekeeper-input {
      width: 100%;
      padding: 12px 46px 12px 16px;
      border-radius: 14px;
      border: 1.5px solid #e2e8f0;
      background: #f8fafc;
      font-family: inherit;
      font-size: 0.95rem;
      color: #0d1528;
      font-weight: 600;
      outline: none;
      transition: all 0.2s ease;
    }

    .gatekeeper-input:focus {
      border-color: #0d39f8;
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(13, 57, 248, 0.15);
    }

    .gatekeeper-input.is-invalid {
      border-color: #f43f5e !important;
      background: #fff1f2 !important;
      box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.18) !important;
      animation: gatekeeperShake 0.32s ease;
    }

    @keyframes gatekeeperShake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-6px); }
      40%, 80% { transform: translateX(6px); }
    }

    .gatekeeper-toggle-pwd {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px;
      border-radius: 8px;
      transition: color 0.18s ease;
    }

    .gatekeeper-toggle-pwd:hover {
      color: #0d1528;
    }

    .gatekeeper-error-msg {
      font-size: 0.78rem;
      font-weight: 700;
      color: #e11d48;
      display: none;
      align-items: center;
      gap: 6px;
    }

    .gatekeeper-error-msg.show {
      display: flex;
    }

    .gatekeeper-btn-submit {
      width: 100%;
      padding: 13px 20px;
      border-radius: 9999px;
      border: none;
      background: linear-gradient(135deg, #0d39f8 0%, #13a2f2 100%);
      color: #ffffff;
      font-size: 0.92rem;
      font-weight: 800;
      font-family: inherit;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: all 0.22s ease;
      box-shadow: 0 6px 18px rgba(13, 57, 248, 0.28);
    }

    .gatekeeper-btn-submit:hover {
      background: linear-gradient(135deg, #092bd0 0%, #0d8fe0 100%);
      box-shadow: 0 8px 24px rgba(13, 57, 248, 0.38);
      transform: translateY(-2px);
    }

    .gatekeeper-btn-submit:active {
      transform: translateY(0);
    }

    .gatekeeper-footer {
      padding: 14px 28px 20px;
      text-align: center;
      font-size: 0.72rem;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
      background: #fafafa;
    }
  `;
  document.head.appendChild(styleEl);

  // 3. Bloqueo del body de inmediato
  document.documentElement.classList.add("gatekeeper-locked");
  if (document.body) {
    document.body.classList.add("gatekeeper-locked");
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      document.body.classList.add("gatekeeper-locked");
    });
  }

  // 4. Creación e inyección del DOM del Gatekeeper
  function mountGatekeeper() {
    if (document.getElementById("auth-gatekeeper-overlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "auth-gatekeeper-overlay";
    overlay.innerHTML = `
      <div class="gatekeeper-card" role="dialog" aria-modal="true" aria-labelledby="gatekeeper-title-id">
        <div class="gatekeeper-header">
          <div class="gatekeeper-icon-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h2 class="gatekeeper-title" id="gatekeeper-title-id">Grupo Edúcate Colombia</h2>
          <p class="gatekeeper-subtitle">Portal Editorial · Acceso Seguro al Catálogo de Pruebas y Planes de Mejoramiento 2026</p>
        </div>

        <form class="gatekeeper-body" id="gatekeeper-form" onsubmit="return false;">
          <div class="gatekeeper-input-group">
            <label class="gatekeeper-label" for="gatekeeper-input-key">Clave Institucional de Acceso</label>
            <div class="gatekeeper-input-wrapper">
              <input 
                type="password" 
                id="gatekeeper-input-key" 
                class="gatekeeper-input" 
                placeholder="Ingrese la clave..." 
                autocomplete="current-password"
                required
              />
              <button type="button" class="gatekeeper-toggle-pwd" id="gatekeeper-toggle-pwd-btn" title="Mostrar/Ocultar clave">
                <svg id="gatekeeper-eye-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>
            <div class="gatekeeper-error-msg" id="gatekeeper-error-msg">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>Clave incorrecta. Por favor, intente nuevamente.</span>
            </div>
          </div>

          <button type="submit" class="gatekeeper-btn-submit" id="gatekeeper-submit-btn">
            <span>Ingresar al Catálogo</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </form>

        <div class="gatekeeper-footer">
          Edición Oficial 2026 · Ecosistema Integral de Evaluación Pedagógica
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Elementos interactivos
    const form = document.getElementById("gatekeeper-form");
    const input = document.getElementById("gatekeeper-input-key");
    const toggleBtn = document.getElementById("gatekeeper-toggle-pwd-btn");
    const errorMsg = document.getElementById("gatekeeper-error-msg");

    // Toggle ver/ocultar contraseña
    toggleBtn.addEventListener("click", () => {
      const isPwd = input.type === "password";
      input.type = isPwd ? "text" : "password";
      toggleBtn.innerHTML = isPwd
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
             <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
             <line x1="1" y1="1" x2="23" y2="23"></line>
           </svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
             <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
             <circle cx="12" cy="12" r="3"></circle>
           </svg>`;
    });

    // Validación de clave
    function handleValidate() {
      const enteredKey = input.value.trim();

      if (enteredKey === AUTH_CONFIG.ACCESS_KEY) {
        // Clave correcta
        try {
          sessionStorage.setItem(AUTH_CONFIG.SESSION_KEY, "authorized");
        } catch (e) {}

        errorMsg.classList.remove("show");
        input.classList.remove("is-invalid");

        // Desbloquear pantalla con transición fluida
        overlay.classList.add("gatekeeper-hidden");
        document.documentElement.classList.remove("gatekeeper-locked");
        if (document.body) {
          document.body.classList.remove("gatekeeper-locked");
        }

        setTimeout(() => {
          overlay.remove();
        }, 380);
      } else {
        // Clave incorrecta
        input.classList.remove("is-invalid");
        void input.offsetWidth; // Trigger reflow para reiniciar animación shake
        input.classList.add("is-invalid");
        errorMsg.classList.add("show");
        input.focus();
        input.select();
      }
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      handleValidate();
    });

    // Auto-focus en el campo de texto
    setTimeout(() => {
      input.focus();
    }, 150);
  }

  // Montar cuando el DOM esté listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountGatekeeper);
  } else {
    mountGatekeeper();
  }

  // 5. API pública opcional
  window.AuthGatekeeper = {
    lock: function () {
      try {
        sessionStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
      } catch (e) {}
      location.reload();
    },
    isAuthorized: isAuthorized
  };
})();

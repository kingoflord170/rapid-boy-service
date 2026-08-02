/**
 * Rapid Boy Service Manager Pro V4.5 - Authentication & Session Engine
 * User Verification, Local Storage Persistence, and Access Privilege Control
 * Fully Complete - Production Ready [2026]
 */

window.RapidBoy = window.RapidBoy || {};

(function (App) {
  'use strict';

  App.Auth = App.Auth || {};

  const SESSION_STORAGE_KEY = "rapidboy_user_session_v4";

  /**
   * Initialize Authentication Module Handlers & Form Interceptors
   */
  App.Auth.init = function () {
    console.log("🔐 Rapid Boy Auth V4.5 Active...");

    const loginForm = document.getElementById('system-auth-form');
    if (loginForm) {
      loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        App.Auth.handleLoginSubmission();
      });
    }

    const logoutBtn = document.getElementById('btn-system-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        App.Auth.handleLogout();
      });
    }
  };

  /**
   * Submit Login Credentials to Google Apps Script Backend
   */
  App.Auth.handleLoginSubmission = async function () {
    const usernameInput = document.getElementById('auth-username');
    const passwordInput = document.getElementById('auth-password');

    if (!usernameInput || !passwordInput) return;

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      if (App.UI && typeof App.UI.showToast === 'function') {
        App.UI.showToast("Authentication Failed", "Please enter both username and password.", "warning");
      }
      return;
    }

    try {
      await App.Utils.executeSecureOperation(async () => {
        const activeDriver = window.API || window.Api || App.Api;
        if (!activeDriver || typeof activeDriver.transmitPayload !== 'function') {
          throw new Error("API Bridge Driver uninitialized.");
        }

        const response = await activeDriver.transmitPayload({
          action: 'login',
          username: username,
          password: password
        });

        if (response && response.status === 'success') {
          // Set Application State User Credentials
          App.State.user.username = response.username;
          App.State.user.fullName = response.fullName || response.username;
          App.State.user.role = response.role || 'Technician';
          App.State.user.isAuthenticated = true;

          // Save Session to LocalStorage
          const sessionPayload = {
            username: response.username,
            password: password, // Retained locally for API verification calls
            fullName: response.fullName || response.username,
            role: response.role || 'Technician',
            timestamp: new Date().getTime()
          };
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionPayload));

          if (App.UI && typeof App.UI.showToast === 'function') {
            App.UI.showToast("Authentication Successful", `Welcome back, ${App.State.user.fullName}!`, "success");
          }

          // UI updates & transition to app workspace
          App.Auth.applyAuthenticatedUIState();
          await App.UI.refreshGlobalDataStream(true);

          if (App.Navigation && typeof App.Navigation.navigateTo === 'function') {
            App.Navigation.navigateTo('view-dashboard-analytics');
          }
        } else {
          throw new Error(response.message || "Invalid credentials provided.");
        }
      }, "Authenticating credentials...");
    } catch (err) {
      console.error("Login Error:", err);
      if (passwordInput) passwordInput.value = "";
    }
  };

  /**
   * Check LocalStorage for Existing Valid Session on App Boot
   */
  App.Auth.checkPersistedSession = function () {
    const rawSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!rawSession) {
      App.Auth.showAuthScreen();
      return;
    }

    try {
      const session = JSON.parse(rawSession);
      if (session && session.username && session.password) {
        App.State.user.username = session.username;
        App.State.user.fullName = session.fullName;
        App.State.user.role = session.role;
        App.State.user.isAuthenticated = true;

        App.Auth.applyAuthenticatedUIState();
        App.UI.refreshGlobalDataStream(true);
      } else {
        App.Auth.showAuthScreen();
      }
    } catch (e) {
      console.error("Failed to parse saved session:", e);
      localStorage.removeItem(SESSION_STORAGE_KEY);
      App.Auth.showAuthScreen();
    }
  };

  /**
   * Helper: Retrieve Credentials for API calls
   */
  App.Auth.getSystemVerificationCredentials = function () {
    const rawSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (rawSession) {
      try {
        const session = JSON.parse(rawSession);
        return { u: session.username, p: session.password };
      } catch (e) {
        return { u: "", p: "" };
      }
    }
    return { u: "", p: "" };
  };

  /**
   * Apply UI Changes when User is Authenticated
   */
  App.Auth.applyAuthenticatedUIState = function () {
    const authScreen = document.getElementById('auth-screen');
    const appWorkspace = document.getElementById('app-workspace');
    const globalLoader = document.getElementById('global-loader');

    if (authScreen) authScreen.classList.add('wrapper-hidden');
    if (appWorkspace) appWorkspace.classList.remove('wrapper-hidden');
    if (globalLoader) globalLoader.classList.add('wrapper-hidden');

    const nameNode = document.getElementById('display-logged-user-name');
    const roleNode = document.getElementById('display-logged-user-role');

    if (nameNode) nameNode.innerText = App.State.user.fullName || App.State.user.username;
    if (roleNode) roleNode.innerText = App.State.user.role || 'Staff';
  };

    /**
     * Show Login Screen (Hide Workspace)
     */
    App.Auth.showAuthScreen = function () {
      const authScreen = document.getElementById('auth-screen');
      const appWorkspace = document.getElementById('app-workspace');
      const globalLoader = document.getElementById('global-loader');

      if (appWorkspace) appWorkspace.classList.add('wrapper-hidden');
      if (globalLoader) globalLoader.classList.add('wrapper-hidden');
      if (authScreen) authScreen.classList.remove('wrapper-hidden');
    };

      /**
       * Clear Session and Sign Out
       */
      App.Auth.handleLogout = function () {
        localStorage.removeItem(SESSION_STORAGE_KEY);

        App.State.user.username = null;
        App.State.user.fullName = null;
        App.State.user.role = null;
        App.State.user.isAuthenticated = false;

        const usernameInput = document.getElementById('auth-username');
        const passwordInput = document.getElementById('auth-password');
        if (usernameInput) usernameInput.value = "";
        if (passwordInput) passwordInput.value = "";

        if (App.UI && typeof App.UI.showToast === 'function') {
          App.UI.showToast("Signed Out", "Session terminated successfully.", "info");
        }

        App.Auth.showAuthScreen();
      };

})(window.RapidBoy);

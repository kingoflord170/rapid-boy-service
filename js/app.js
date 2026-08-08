/**
 * Rapid Boy Service Manager Pro V4.6 - Core Application Engine
 * Namespace Routing, Global State Store, and Public Live Status Interceptor
 * Fully Complete - Production Ready [2026]
 */

window.RapidBoy = window.RapidBoy || {};

(function (App) {
  'use strict';

  // 1. Safe Reactive Global State Registry (Preventing state/sub-object overwrite)
  App.State = App.State || {};
  App.State.user = App.State.user || { username: null, fullName: null, role: null, isAuthenticated: false };
  App.State.settings = Object.assign({
    companyName: "Rapid Boy Pro",
    address: "Rapid Boy Service Center, No. 12, Main Road, Near Bus Stand, Thanjavur, Tamil Nadu - 613001",
    phone: "+919677600190",
    email: "support@rapidboyservice.com"
  }, App.State.settings || {});

  App.State.tickets = App.State.tickets || [];
  App.State.customers = App.State.customers || [];
  App.State.activeFilters = Object.assign({
    searchQuery: "",
    status: "ALL",
    technician: "ALL",
    paymentMethod: "ALL"
  }, App.State.activeFilters || {});

  App.State.meta = Object.assign({
    isOnline: navigator.onLine,
    lastSyncTimestamp: null
  }, App.State.meta || {});

  // 2. Main Module Bootstrap Sequence
  App.InitModules = function () {
    console.log("🚀 Rapid Boy Core V4.6: Bootstrapping structural runtime modules...");

    if (App.Navigation && typeof App.Navigation.init === 'function') App.Navigation.init();
    if (App.Auth && typeof App.Auth.init === 'function') App.Auth.init();
    if (App.UI && typeof App.UI.init === 'function') App.UI.init();
    if (App.Dashboard && typeof App.Dashboard.init === 'function') App.Dashboard.init();
    if (App.Form && typeof App.Form.init === 'function') App.Form.init();
    if (App.Timeline && typeof App.Timeline.init === 'function') App.Timeline.init();

    window.addEventListener('online', () => App.Utils.updateNetworkStatus(true));
    window.addEventListener('offline', () => App.Utils.updateNetworkStatus(false));
  };

  // 3. Central System Utility Helpers
  App.Utils = App.Utils || {
    async executeSecureOperation(operationFn, processingMessage) {
      if (processingMessage && App.UI && typeof App.UI.showLoader === 'function') {
        App.UI.showLoader(processingMessage);
      }
      try {
        const result = await operationFn();
        return result;
      } catch (error) {
        console.error("Rapid Boy Interceptor Catch-All:", error);
        if (App.UI && typeof App.UI.showToast === 'function') {
          App.UI.showToast("System Exception", error.message || "An unexpected error occurred.", "error");
        }
        throw error;
      } finally {
        if (processingMessage && App.UI && typeof App.UI.hideLoader === 'function') {
          App.UI.hideLoader();
        }
      }
    },

    updateNetworkStatus(status) {
      App.State.meta.isOnline = status;
      if (status) {
        if (App.UI && typeof App.UI.showToast === 'function') {
          App.UI.showToast("Network Connected", "Database pipelines online.", "success");
        }
      } else {
        if (App.UI && typeof App.UI.showToast === 'function') {
          App.UI.showToast("Offline Mode", "Network connection lost. Check your connection.", "warning");
        }
      }
    },

    formatCurrency(amount) {
      const numericValue = parseFloat(amount);
      if (isNaN(numericValue)) return "₹0.00";
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
      }).format(numericValue);
    },

    formatShortDateTime(dateTimeString) {
      if (!dateTimeString) return "N/A";
      try {
        const dateObj = new Date(dateTimeString.toString().replace(/-/g, "/"));
        if (isNaN(dateObj.getTime())) return dateTimeString;
        return dateObj.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) + ' ' + dateObj.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      } catch (e) {
        return dateTimeString;
      }
    },

    sanitizeHTML(rawString) {
      if (rawString !== 0 && !rawString) return "";
      return rawString.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
  };

// 4. Standalone Public Live Status Tracker Interceptor
function handleUrlTrackingInterceptor() {
  const urlParams = new URLSearchParams(window.location.search);
  const trackingToken = urlParams.get('track');

  if (trackingToken) {
  console.log("🎯 Secure Customer Tracking Request Active");

      const globalLoader = document.getElementById('global-loader');
      if (globalLoader) globalLoader.classList.add('wrapper-hidden');

      document.body.innerHTML = '';
      document.body.style.cssText = `
        background-color: #F8FAFC;
        margin: 0;
        padding: 16px;
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        color: #0F172A;
      `;

      const trackCard = document.createElement('div');
      trackCard.id = 'rapidboy-standalone-tracker';
      trackCard.style.cssText = `
        width: 100%;
        max-width: 480px;
        background: #FFFFFF;
        border-radius: 16px;
        padding: 24px;
        border: 1px solid rgba(15, 23, 42, 0.1);
        box-shadow: 0 20px 30px -5px rgba(0, 0, 0, 0.08);
      `;
      document.body.appendChild(trackCard);

      const renderLoadingState = () => {
        trackCard.innerHTML = `
          <div style="text-align: center; padding: 30px 0;">
            <div style="border: 3px solid #2563EB; border-top-color: transparent; width: 36px; height: 36px; border-radius: 50%; margin: 0 auto; animation: spin 0.8s linear infinite;"></div>
            <p style="margin-top: 16px; color: #64748B; font-size: 0.9rem;">Fetching live repair status for <strong>${App.Utils.sanitizeHTML(trackingToken)}</strong>...</p>
          </div>
          <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
        `;
      };

      renderLoadingState();

      const fetchStatusCall = async () => {
        try {
          let ticketRecord = null;
          const activeDriver = window.API || window.Api || App.Api;

          if (activeDriver && typeof activeDriver.transmitPayload === 'function') {
            const res = await activeDriver.transmitPayload({ action: 'getTicketStatus', ticketNumber: trackingToken });
            if (res && res.status === 'success' && res.data) {
              ticketRecord = res.data;
            }
          }

          if (ticketRecord) {
            let statusBg = '#3B82F6';
            const statusText = ticketRecord.status || 'Pending';
            const lowerStatus = statusText.toLowerCase();
            if (lowerStatus === 'delivered' || lowerStatus === 'completed' || lowerStatus === 'fixed / delivered') statusBg = '#10B981';
            else if (lowerStatus.includes('repair') || lowerStatus.includes('proceed') || lowerStatus.includes('progress')) statusBg = '#2563EB';
            else if (lowerStatus.includes('waiting') || lowerStatus.includes('awaiting')) statusBg = '#F59E0B';
            else if (lowerStatus === 'cancelled' || lowerStatus === 'return') statusBg = '#EF4444';

            let timelineEvents = [];
            try {
              if (typeof ticketRecord.timeline === 'string' && ticketRecord.timeline.trim().length > 0) {
                timelineEvents = JSON.parse(ticketRecord.timeline);
              } else if (Array.isArray(ticketRecord.timeline)) {
                timelineEvents = ticketRecord.timeline;
              }
            } catch (e) {
              timelineEvents = [];
            }

            let timelineHtml = "";
            if (timelineEvents.length > 0) {
              timelineEvents.slice(0, 3).forEach(ev => {
                timelineHtml += `
                  <div style="border-left: 2px solid #2563EB; padding-left: 8px; font-size: 0.78rem; margin-bottom: 6px;">
                    <div style="color: #64748B;">${App.Utils.sanitizeHTML(ev.date || '')} ${App.Utils.sanitizeHTML(ev.time || '')}</div>
                    <div style="color: #334155; font-weight: 500;">${App.Utils.sanitizeHTML(ev.notes || 'Status updated.')}</div>
                  </div>
                `;
              });
            } else {
              timelineHtml = `<div style="color: #64748B; font-size: 0.78rem; font-style: italic;">No recent updates logged.</div>`;
            }

            trackCard.innerHTML = `
              <div style="text-align: center; border-bottom: 1px solid #E2E8F0; padding-bottom: 14px; margin-bottom: 18px;">
                <h2 style="margin: 0; color: #2563EB; font-size: 1.3rem; font-weight: 700;">${App.Utils.sanitizeHTML(App.State.settings.companyName)}</h2>
                <p style="margin: 4px 0 0 0; color: #64748B; font-size: 0.8rem;">LIVE WORK ORDER TRACKER</p>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; background: #F8FAFC; padding: 10px 14px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #E2E8F0;">
                <span style="color: #64748B; font-size: 0.85rem;">Work Order ID:</span>
                <strong style="color: #2563EB; font-size: 1rem; font-family: monospace;">${App.Utils.sanitizeHTML(ticketRecord.ticketNumber)}</strong>
              </div>

              <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
                <div style="background: #F8FAFC; padding: 12px; border-radius: 8px; border: 1px solid #E2E8F0;">
                  <div style="color: #64748B; font-size: 0.75rem; text-transform: uppercase; font-weight: 600;">Customer Name</div>
                  <div style="color: #0F172A; font-size: 1rem; font-weight: 600; margin-top: 2px;">${App.Utils.sanitizeHTML(ticketRecord.customerName)}</div>
                </div>

                <div style="background: #F8FAFC; padding: 12px; border-radius: 8px; border: 1px solid #E2E8F0;">
                  <div style="color: #64748B; font-size: 0.75rem; text-transform: uppercase; font-weight: 600;">Device Specifications</div>
                  <div style="color: #0F172A; font-size: 0.95rem; font-weight: 600; margin-top: 2px;">
                    ${App.Utils.sanitizeHTML(ticketRecord.deviceType || 'Hardware')} – ${App.Utils.sanitizeHTML(ticketRecord.brand || '')} (${App.Utils.sanitizeHTML(ticketRecord.model || '')})
                  </div>
                  <div style="color: #64748B; font-size: 0.8rem; margin-top: 4px;">
                    Device S/N: <span style="color: #2563EB; font-family: monospace;">${App.Utils.sanitizeHTML(ticketRecord.serialNumber || 'N/A')}</span>
                  </div>
                </div>

                <div style="background: #F8FAFC; padding: 12px; border-radius: 8px; border: 1px solid #E2E8F0; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="color: #64748B; font-size: 0.75rem; text-transform: uppercase; font-weight: 600;">Repair Status</div>
                    <div style="color: #64748B; font-size: 0.8rem; margin-top: 2px;">Est Delivery: <span style="color: #D97706; font-weight: 600;">${App.Utils.sanitizeHTML(ticketRecord.deliveryDate || '2-7 Working Days')}</span></div>
                  </div>
                  <span style="background: ${statusBg}; color: #FFFFFF; padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 0.85rem;">
                    ${App.Utils.sanitizeHTML(statusText)}
                  </span>
                </div>

                <div style="background: #F8FAFC; padding: 12px; border-radius: 8px; border: 1px solid #E2E8F0;">
                  <div style="color: #64748B; font-size: 0.75rem; text-transform: uppercase; font-weight: 600; margin-bottom: 6px;">Recent Status Updates</div>
                  ${timelineHtml}
                </div>
              </div>

              <div style="background: #EFF6FF; border: 1px dashed #2563EB; border-radius: 12px; padding: 14px; margin-bottom: 16px;">
                <div style="color: #2563EB; font-weight: 600; font-size: 0.85rem; margin-bottom: 6px;">📍 Office Address & Support</div>
                <div style="color: #334155; font-size: 0.8rem; line-height: 1.4; margin-bottom: 12px;">
                  ${App.Utils.sanitizeHTML(App.State.settings.address)}
                </div>

                <a href="tel:${App.State.settings.phone}" style="display: block; text-align: center; background: #2563EB; color: #FFFFFF; text-decoration: none; padding: 10px; border-radius: 8px; font-weight: 700; font-size: 0.9rem;">
                  📞 Call Support (${App.State.settings.phone})
                </a>
              </div>
            `;
          } else {
            trackCard.innerHTML = `
              <div style="text-align: center; padding: 20px 0;">
                <div style="font-size: 2.5rem; margin-bottom: 10px;">❌</div>
                <h3 style="color: #EF4444; margin: 0 0 6px 0;">Work Order Not Found</h3>
                <p style="color: #64748B; font-size: 0.85rem; margin: 0;">Ticket ID <strong>${App.Utils.sanitizeHTML(ticketRecord.ticketNumber)}</strong> is not registered.</p>
              </div>
            `;
          }
        } catch (err) {
          console.error("Public tracker runtime failure:", err);
          trackCard.innerHTML = `
            <div style="text-align: center; padding: 20px 0;">
              <div style="font-size: 2.5rem; margin-bottom: 10px;">⚠️</div>
              <h3 style="color: #D97706; margin: 0 0 6px 0;">Connection Error</h3>
              <p style="color: #64748B; font-size: 0.85rem; margin-bottom: 16px;">Unable to fetch live status. Please check your internet connection.</p>
              <button onclick="window.location.reload()" style="background: #2563EB; color: #FFFFFF; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; cursor: pointer;">Retry Connection</button>
            </div>
          `;
        }
      };

      fetchStatusCall();
      return true;
    }
    return false;
  }

  // Force reveal Authentication Screen if session check is pending
  function forceShowAuthScreen() {
    const loader = document.getElementById('global-loader');
    if (loader) loader.classList.add('wrapper-hidden');

    const appWorkspace = document.getElementById('app-workspace');
    if (appWorkspace) appWorkspace.classList.add('wrapper-hidden');

    const authScreen = document.getElementById('auth-screen');
    if (authScreen) authScreen.classList.remove('wrapper-hidden');
  }

  // 5. DOM Initialization Entry Point (Checking tracking route first)
  document.addEventListener("DOMContentLoaded", function () {
    try {
      const isTrackingRouteActive = handleUrlTrackingInterceptor();
      if (isTrackingRouteActive) return; // Short-circuit initialization if public tracking view is active

      App.InitModules();

      if (App.Auth && typeof App.Auth.checkPersistedSession === 'function') {
        App.Auth.checkPersistedSession();
      } else {
        forceShowAuthScreen();
      }
    } catch (criticalBootError) {
      console.error("Core boot strap exception:", criticalBootError);
      forceShowAuthScreen();
    }
  });

})(window.RapidBoy);

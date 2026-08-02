/**
 * Rapid Boy Service Manager Pro V4.5 - Core Application Engine
 * Namespace Routing, Global State Store, and Public Live Status Interceptor
 * Fully Complete - Production Ready [2026]
 */

window.RapidBoy = window.RapidBoy || {};

(function (App) {
  'use strict';

  // 1. Reactive Global State Registry
  App.State = {
    user: {
      username: null,
 fullName: null,
 role: null,
 isAuthenticated: false
    },
 settings: {
   companyName: "Rapid Boy Pro",
 address: "Rapid Boy Service Center, No. 12, Main Road, Near Bus Stand, Thanjavur, Tamil Nadu - 613001",
 phone: "+919952587147",
 email: "support@rapidboyservice.com"
 },
 tickets: [],
 customers: [],
 activeFilters: {
   searchQuery: "",
 status: "ALL",
 technician: "ALL",
 paymentMethod: "ALL"
 },
 meta: {
   isOnline: navigator.onLine,
 lastSyncTimestamp: null
 }
  };

  // 2. Main Module Bootstrap Sequence
  App.InitModules = function () {
    console.log("🚀 Rapid Boy Core V4.5: Bootstrapping structural runtime modules...");

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
       App.UI.showToast("Offline Mode", "Changes will not sync until reconnected.", "warning");
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
   if (!rawString) return "";
   return rawString.toString()
   .replace(/&/g, "&amp;")
   .replace(/</g, "&lt;")
   .replace(/>/g, "&gt;")
   .replace(/"/g, "&quot;")
   .replace(/'/g, "&#039;");
 }
  };

  // 4. Standalone Public Live Status Tracker Interceptor (?track=RB-TK-2026-XXXX)
  function handleUrlTrackingInterceptor() {
    const urlParams = new URLSearchParams(window.location.search);
    const trackingTicketId = urlParams.get('track');

    if (trackingTicketId) {
      console.log("🎯 Customer Tracking Request Active for ID:", trackingTicketId);

      const globalLoader = document.getElementById('global-loader');
      if (globalLoader) globalLoader.classList.add('wrapper-hidden');

      document.body.innerHTML = '';
      document.body.style.cssText = `
      background-color: #0f172a;
      margin: 0;
      padding: 16px;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      color: #f8fafc;
      `;

      const trackCard = document.createElement('div');
      trackCard.id = 'rapidboy-standalone-tracker';
      trackCard.style.cssText = `
      width: 100%;
      max-width: 480px;
      background: #1e293b;
      border-radius: 16px;
      padding: 24px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 20px 30px -5px rgba(0, 0, 0, 0.5);
      `;
      document.body.appendChild(trackCard);

      trackCard.innerHTML = `
      <div style="text-align: center; padding: 30px 0;">
      <div style="border: 3px solid #10b981; border-top-color: transparent; width: 36px; height: 36px; border-radius: 50%; margin: 0 auto; animation: spin 0.8s linear infinite;"></div>
      <p style="margin-top: 16px; color: #94a3b8; font-size: 0.9rem;">Fetching live repair status for <strong>${App.Utils.sanitizeHTML(trackingTicketId)}</strong>...</p>
      </div>
      <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
      `;

      const fetchStatusCall = async () => {
        try {
          let ticketRecord = null;
          const activeDriver = window.API || window.Api || App.Api;

          if (activeDriver && typeof activeDriver.transmitPayload === 'function') {
            const res = await activeDriver.transmitPayload({ action: 'getTicketStatus', ticketNumber: trackingTicketId });
            if (res && res.status === 'success' && res.data) {
              ticketRecord = res.data;
            }
          }

          if (ticketRecord) {
            let statusBg = '#3b82f6';
            const statusText = ticketRecord.status || 'Pending';
            if (statusText === 'Delivered' || statusText === 'Completed') statusBg = '#10b981';
            else if (statusText === 'In Progress' || statusText === 'Repairing' || statusText === 'Proceed to Service') statusBg = '#f59e0b';
            else if (statusText === 'Cancelled') statusBg = '#ef4444';

            // Parse timeline audit events for customer transparency
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
                <div style="border-left: 2px solid #06b6d4; padding-left: 8px; font-size: 0.78rem; margin-bottom: 4px;">
                <div style="color: #94a3b8;">${App.Utils.sanitizeHTML(ev.date || '')} ${App.Utils.sanitizeHTML(ev.time || '')}</div>
                <div style="color: #cbd5e1;">${App.Utils.sanitizeHTML(ev.notes || 'Status updated.')}</div>
                </div>
                `;
              });
            } else {
              timelineHtml = `<div style="color: #94a3b8; font-size: 0.78rem; font-style: italic;">No recent updates logged.</div>`;
            }

            trackCard.innerHTML = `
            <div style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 14px; margin-bottom: 18px;">
            <h2 style="margin: 0; color: #10b981; font-size: 1.3rem; font-weight: 700;">RAPID BOY SERVICE</h2>
            <p style="margin: 4px 0 0 0; color: #64748b; font-size: 0.8rem;">LIVE WORK ORDER TRACKER</p>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); padding: 10px 14px; border-radius: 8px; margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.05);">
            <span style="color: #94a3b8; font-size: 0.85rem;">Work Order ID:</span>
            <strong style="color: #60a5fa; font-size: 1rem; font-family: monospace;">${App.Utils.sanitizeHTML(ticketRecord.ticketNumber)}</strong>
            </div>

            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
            <div style="background: rgba(255,255,255,0.02); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.04);">
            <div style="color: #64748b; font-size: 0.75rem; text-transform: uppercase; font-weight: 600;">Customer Name</div>
            <div style="color: #f8fafc; font-size: 1rem; font-weight: 600; margin-top: 2px;">${App.Utils.sanitizeHTML(ticketRecord.customerName)}</div>
            </div>

            <div style="background: rgba(255,255,255,0.02); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.04);">
            <div style="color: #64748b; font-size: 0.75rem; text-transform: uppercase; font-weight: 600;">Device Specifications & Serials</div>
            <div style="color: #f8fafc; font-size: 0.95rem; font-weight: 600; margin-top: 2px;">
            ${App.Utils.sanitizeHTML(ticketRecord.deviceType || 'Hardware')} – ${App.Utils.sanitizeHTML(ticketRecord.brand || '')} (${App.Utils.sanitizeHTML(ticketRecord.model || '')})
            </div>
            <div style="color: #94a3b8; font-size: 0.8rem; margin-top: 4px;">
            Device S/N: <span style="color: #38bdf8;">${App.Utils.sanitizeHTML(ticketRecord.serialNumber || 'N/A')}</span> | Spare S/N: <span style="color: #38bdf8;">${App.Utils.sanitizeHTML(ticketRecord.spareSerial || 'N/A')}</span>
            </div>
            </div>

            <div style="background: rgba(255,255,255,0.02); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.04); display: flex; justify-content: space-between; align-items: center;">
            <div>
            <div style="color: #64748b; font-size: 0.75rem; text-transform: uppercase; font-weight: 600;">Repair Status</div>
            <div style="color: #94a3b8; font-size: 0.8rem; margin-top: 2px;">Est Delivery: <span style="color: #f59e0b; font-weight: 600;">${App.Utils.sanitizeHTML(ticketRecord.deliveryDate || '2-7 Working Days')}</span></div>
            </div>
            <span style="background: ${statusBg}; color: #ffffff; padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 0.85rem;">
            ${App.Utils.sanitizeHTML(statusText)}
            </span>
            </div>

            <div style="background: rgba(255,255,255,0.02); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.04);">
            <div style="color: #64748b; font-size: 0.75rem; text-transform: uppercase; font-weight: 600; margin-bottom: 6px;">Recent Status Updates</div>
            ${timelineHtml}
            </div>
            </div>

            <div style="background: rgba(16, 185, 129, 0.05); border: 1px dashed rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 14px; margin-bottom: 16px;">
            <div style="color: #10b981; font-weight: 600; font-size: 0.85rem; margin-bottom: 6px;">📍 Office Address & Support</div>
            <div style="color: #cbd5e1; font-size: 0.8rem; line-height: 1.4; margin-bottom: 12px;">
            Rapid Boy Service Center,<br>
            No. 12, Main Road, Near Bus Stand,<br>
            Thanjavur, Tamil Nadu - 613001
            </div>

            <a href="tel:+919952587147" style="display: block; text-align: center; background: #10b981; color: #000000; text-decoration: none; padding: 10px; border-radius: 8px; font-weight: 700; font-size: 0.9rem;">
            📞 Call Support (+91 96776 00190 )
            </a>
            </div>
            `;
          } else {
            trackCard.innerHTML = `
            <div style="text-align: center; padding: 20px 0;">
            <div style="font-size: 2.5rem; margin-bottom: 10px;">❌</div>
            <h3 style="color: #ef4444; margin: 0 0 6px 0;">Work Order Not Found</h3>
            <p style="color: #94a3b8; font-size: 0.85rem; margin: 0;">Ticket ID <strong>${App.Utils.sanitizeHTML(trackingTicketId)}</strong> is not registered.</p>
            </div>
            `;
          }
        } catch (err) {
          console.error("Public tracker runtime failure:", err);
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

  // 5. DOM Initialization Entry Point
  document.addEventListener("DOMContentLoaded", function () {
    try {
      App.InitModules();

      const isTrackingRouteActive = handleUrlTrackingInterceptor();
      if (isTrackingRouteActive) return;

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

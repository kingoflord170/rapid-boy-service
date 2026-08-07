/**
 * Rapid Boy Service Manager Pro V4.6 - Audit Timeline & Interactive Modal Engine
 * Handles Ticket Lifecycle History, Financial Breakdown, and Tracking Actions
 * Clean Vertical History Layout (No Left Markers) with 100% Readable Dark Text Colors
 */

window.RapidBoy = window.RapidBoy || {};

(function (App) {
  'use strict';

  App.Timeline = App.Timeline || {};

  const getSafeBaseDomain = () => {
    const origin = window.location.origin;
    if (origin && origin !== "null" && origin !== "file://" && !origin.startsWith("file://")) {
      return origin;
    }
    return "https://rapidboy.netlify.app";
  };

  App.Timeline.init = function () {
    console.log("🕒 Rapid Boy Timeline Engine V4.6 Active...");
  };

  App.Timeline.showTicketTimelineModal = function (ticketNumberId) {
    const cleanSearchId = String(ticketNumberId).trim().toLowerCase();
    const ticket = (App.State.tickets || []).find(t => String(t.ticketNumber).trim().toLowerCase() === cleanSearchId);

    if (!ticket) {
      if (App.UI && typeof App.UI.showToast === 'function') {
        App.UI.showToast("Not Found", `Work order ${ticketNumberId} could not be located.`, "error");
      }
      return;
    }

    const modalBody = document.getElementById('modal-core-render-body-scroll');
    const modalTitle = document.getElementById('modal-card-title-string');
    const modalFooter = document.getElementById('modal-layout-footer-actions');

    if (!modalBody || !modalTitle || !modalFooter) return;

    modalTitle.innerText = `Audit Lifecycle & Details [ ${ticket.ticketNumber} ]`;

    // Financial Calculation from paymentHistory
    let totalPaid = 0;
    let historyArr = [];
    if (ticket.paymentHistory) {
      try {
        historyArr = typeof ticket.paymentHistory === 'string' ? JSON.parse(ticket.paymentHistory) : ticket.paymentHistory;
      } catch (e) {
        historyArr = [];
      }
    } else {
      totalPaid = parseFloat(ticket.advance) || 0;
    }
    historyArr.forEach(p => totalPaid += parseFloat(p.amount) || 0);

    const finalCost = parseFloat(ticket.finalCost) || 0;
    const calculatedBalanceDue = Math.max(0, finalCost - totalPaid);

    const baseDomain = getSafeBaseDomain();
    const trackingLink = `${baseDomain}/?track=${encodeURIComponent(ticket.trackingToken)}`;

    // Parse Timeline audit logs
    let timelineEvents = [];
    if (ticket.timeline) {
      try {
        timelineEvents = typeof ticket.timeline === 'string' ? JSON.parse(ticket.timeline) : ticket.timeline;
      } catch (e) {
        timelineEvents = [];
      }
    }

    let timelineHtml = "";
    if (timelineEvents.length === 0) {
      timelineHtml = `<div style="font-size: 0.85rem; color: #64748B; font-style: italic; padding: 10px 0; text-align: center;">No audit transition logs recorded yet.</div>`;
    } else {
      timelineEvents.forEach(ev => {
        timelineHtml += `
          <div style="background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 8px; padding: 12px; margin-bottom: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 0.78rem; font-weight: 700; color: #2563EB;">[${App.Utils.sanitizeHTML(ev.username || 'System Operator')}]</span>
              <span style="font-size: 0.75rem; color: #64748B; font-weight: 600;">${App.Utils.sanitizeHTML(ev.date || '')} – ${App.Utils.sanitizeHTML(ev.time || '')}</span>
            </div>
            <div style="font-size: 0.9rem; font-weight: 700; color: #0F172A; margin-bottom: 4px;">
              ${App.Utils.sanitizeHTML(ev.transition || 'Status Update')}
            </div>
            <div style="font-size: 0.83rem; color: #334155; background: #F8FAFC; padding: 6px 10px; border-radius: 6px; border: 1px solid #E2E8F0;">
              ${App.Utils.sanitizeHTML(ev.notes || 'No notes provided.')}
            </div>
          </div>
        `;
      });
    }

    modalBody.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <!-- Client & Device Summary Block -->
        <div style="background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 10px; padding: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <strong style="color: #0F172A; font-size: 1rem;">${App.Utils.sanitizeHTML(ticket.customerName)}</strong>
            <span style="background: rgba(37, 99, 235, 0.1); color: #2563EB; font-size: 0.75rem; padding: 2px 8px; border-radius: 4px; font-weight: 600;">${App.Utils.sanitizeHTML(ticket.customerType || 'Customer')}</span>
          </div>
          <div style="font-size: 0.85rem; color: #334155; margin-bottom: 4px;">📞 Phone: <strong style="color: #0F172A;">${App.Utils.sanitizeHTML(ticket.phoneNumber)}</strong></div>
          <div style="font-size: 0.85rem; color: #334155;">💻 Device: <strong style="color: #0F172A;">${App.Utils.sanitizeHTML(ticket.deviceType || 'Hardware')} – ${App.Utils.sanitizeHTML(ticket.brand || '')} ${App.Utils.sanitizeHTML(ticket.model || '')}</strong></div>
          ${ticket.serialNumber ? `<div style="font-size: 0.82rem; color: #334155; margin-top: 4px;">S/N: <code style="color: #2563EB; font-weight: 600;">${App.Utils.sanitizeHTML(ticket.serialNumber)}</code></div>` : ''}
        </div>

        <!-- Financial Breakdown Block -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 10px; padding: 12px; text-align: center;">
          <div>
            <span style="font-size: 0.7rem; color: #475569; display: block; font-weight: 700;">FINAL COST</span>
            <span style="font-size: 0.95rem; font-weight: 700; color: #2563EB;">₹${finalCost}</span>
          </div>
          <div>
            <span style="font-size: 0.7rem; color: #475569; display: block; font-weight: 700;">TOTAL PAID</span>
            <span style="font-size: 0.95rem; font-weight: 700; color: #10B981;">₹${totalPaid}</span>
          </div>
          <div>
            <span style="font-size: 0.7rem; color: #475569; display: block; font-weight: 700;">BALANCE DUE</span>
            <span style="font-size: 0.95rem; font-weight: 700; color: #EF4444;">₹${calculatedBalanceDue}</span>
          </div>
        </div>

        <!-- Issues -->
        <div style="font-size: 0.85rem; color: #1E293B; background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px; padding: 10px;">
          <strong style="color: #B45309;">Reported Issues:</strong> ${App.Utils.sanitizeHTML(ticket.issue || 'N/A')}
        </div>

        <!-- Live Tracker Share Link Row -->
        <div style="display: flex; gap: 8px; align-items: center;">
          <input type="text" readonly value="${trackingLink}" style="flex: 1; background: #F1F5F9; border: 1px solid #CBD5E1; border-radius: 6px; padding: 8px 10px; font-size: 0.8rem; color: #0F172A;">
          <button type="button" class="btn btn-secondary btn-small" onclick="navigator.clipboard.writeText('${trackingLink}'); window.RapidBoy.UI.showToast('Copied', 'Live tracking link copied to clipboard.', 'success');">
            <span class="material-icons-round" style="font-size: 1rem;">content_copy</span>
            <span>Copy Link</span>
          </button>
        </div>

        <!-- Audit Timeline History -->
        <div>
          <h4 style="font-size: 0.9rem; color: #0F172A; margin-bottom: 12px; border-bottom: 1px solid #CBD5E1; padding-bottom: 6px;">Audit Trail & Status History</h4>
          <div style="max-height: 240px; overflow-y: auto; padding-right: 4px;">
            ${timelineHtml}
          </div>
        </div>
      </div>
    `;

    modalFooter.innerHTML = `
      <button type="button" class="btn btn-secondary btn-small" onclick="window.RapidBoy.UI.closeSystemModal()">Close</button>
      <button type="button" class="btn btn-primary btn-small" onclick="window.RapidBoy.UI.shareTicketToWhatsApp('${ticket.ticketNumber}')">
        <span class="material-icons-round" style="font-size: 1rem;">share</span>
        <span>WhatsApp</span>
      </button>
    `;

    if (App.UI && typeof App.UI.openSystemModal === 'function') {
      App.UI.openSystemModal();
    }
  };

})(window.RapidBoy);

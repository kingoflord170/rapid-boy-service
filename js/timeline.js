/**
 * Rapid Boy Service Manager Pro V4.5 - Timeline & Audit Lifecycle Engine
 * Production Ready - Live Domain: https://rapidboy.netlify.app
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
        console.log("⏱️ Rapid Boy Timeline Core Active...");
    };

    App.Timeline.showTicketTimelineModal = function (ticketNumberId) {
        const ticket = App.State.tickets.find(t => String(t.ticketNumber).trim().toLowerCase() === String(ticketNumberId).trim().toLowerCase());

        if (!ticket) {
            if (App.UI && typeof App.UI.showToast === 'function') {
                App.UI.showToast("Timeline Error", "Target ticket record not found.", "error");
            }
            return;
        }

        const modalTitle = document.getElementById('modal-card-title-string');
        const modalBody = document.getElementById('modal-core-render-body-scroll');
        const modalFooter = document.getElementById('modal-layout-footer-actions');

        if (!modalTitle || !modalBody || !modalFooter) return;

        modalTitle.innerText = `Audit Lifecycle Trail [ ${ticket.ticketNumber} ]`;

        const baseDomain = getSafeBaseDomain();
        const liveTrackerLink = `${baseDomain}/?track=${encodeURIComponent(ticket.ticketNumber)}`;

        let timelineEvents = [];
        try {
            if (typeof ticket.timeline === 'string' && ticket.timeline.trim().length > 0) {
                timelineEvents = JSON.parse(ticket.timeline);
            } else if (Array.isArray(ticket.timeline)) {
                timelineEvents = ticket.timeline;
            }
        } catch (e) {
            timelineEvents = [];
        }

        let timelineHtml = `
        <div style="display: flex; flex-direction: column; gap: 16px; padding: 10px 0;">
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 14px; border-radius: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <strong style="color: var(--accent-cyan); font-size: 1.05rem;">${App.Utils.sanitizeHTML(ticket.customerName)}</strong>
        <span style="background: var(--accent-primary); color: #fff; padding: 4px 10px; border-radius: 12px; font-weight: 700; font-size: 0.8rem;">
        ${App.Utils.sanitizeHTML(ticket.status || 'Pending')}
        </span>
        </div>
        <div style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.4;">
        📱 <b>Device:</b> ${App.Utils.sanitizeHTML(ticket.deviceType || 'Hardware')} - ${App.Utils.sanitizeHTML(ticket.brand || '')} ${App.Utils.sanitizeHTML(ticket.model || '')}<br>
        🏷️ <b>Serials:</b> S/N: ${App.Utils.sanitizeHTML(ticket.serialNumber || 'N/A')} | Spare: ${App.Utils.sanitizeHTML(ticket.spareSerial || 'N/A')}<br>
        📞 <b>Phone:</b> ${App.Utils.sanitizeHTML(ticket.phoneNumber || 'N/A')} ${ticket.referralPerson ? '• <b>Ref:</b> ' + App.Utils.sanitizeHTML(ticket.referralPerson) : ''}<br>
        👨‍💻 <b>Assigned Techs:</b> ${App.Utils.sanitizeHTML(ticket.technician || 'Unassigned')}
        </div>
        </div>

        <div style="background: rgba(16, 185, 129, 0.05); border: 1px dashed rgba(16, 185, 129, 0.3); padding: 14px; border-radius: 10px; font-size: 0.85rem;">
        <div style="color: #10b981; font-weight: 700; margin-bottom: 6px;">💳 Financial Ledger</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; color: #e2e8f0;">
        <div><b>Final Cost:</b> ₹${ticket.finalCost || 0}</div>
        <div><b>Advance:</b> ₹${ticket.advance || 0}</div>
        <div><b>Balance:</b> <span style="color: #ef4444; font-weight: 700;">₹${ticket.balance || 0}</span></div>
        <div><b>Payment Mode:</b> <span style="color: #06b6d4; font-weight: 700;">${App.Utils.sanitizeHTML(ticket.paymentMethod || 'Cash')}</span></div>
        </div>
        ${ticket.cashReceiver ? `<div style="margin-top: 6px; color: #f59e0b;">💵 <b>Cash Received By:</b> ${App.Utils.sanitizeHTML(ticket.cashReceiver)}</div>` : ''}
        </div>

        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; font-size: 0.85rem;">
        <strong style="color: var(--accent-magenta);">⏱️ Detailed Status Audit Logs (Who, When, From → To):</strong>
        <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 10px;">
        `;

        if (timelineEvents.length === 0) {
            timelineHtml += `<p style="color: #94a3b8; font-style: italic; margin: 0;">No audit logs recorded yet.</p>`;
        } else {
            timelineEvents.forEach(ev => {
                timelineHtml += `
                <div style="border-left: 2px solid var(--accent-cyan); padding-left: 10px; font-size: 0.82rem; background: rgba(255,255,255,0.01); padding: 6px 10px; border-radius: 4px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                <span style="color: var(--accent-cyan); font-weight: 700;">👤 Agent: ${App.Utils.sanitizeHTML(ev.username || 'Operator')}</span>
                <span style="color: #94a3b8; font-size: 0.73rem;">📅 ${App.Utils.sanitizeHTML(ev.date || '')} ⏰ ${App.Utils.sanitizeHTML(ev.time || '')}</span>
                </div>
                <div style="color: #38bdf8; font-weight: 600; font-size: 0.8rem; margin: 2px 0;">🔄 Transition: ${App.Utils.sanitizeHTML(ev.transition || 'Status Change')}</div>
                <div style="color: #e2e8f0;">📝 <b>Memo:</b> ${App.Utils.sanitizeHTML(ev.notes || 'No notes provided.')}</div>
                </div>
                `;
            });
        }

        timelineHtml += `
        </div>
        </div>

        <div style="background: #0f172a; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); word-break: break-all;">
        <span style="font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 700;">Customer Tracking Link:</span>
        <a href="${liveTrackerLink}" target="_blank" style="display: block; color: #60a5fa; font-size: 0.85rem; margin-top: 4px; text-decoration: underline;">
        ${liveTrackerLink}
        </a>
        </div>
        </div>
        `;

        modalBody.innerHTML = timelineHtml;

        modalFooter.innerHTML = `
        <button type="button" class="btn btn-primary btn-small" onclick="window.RapidBoy.UI.shareTicketToWhatsApp('${ticket.ticketNumber}')">
        <span class="material-icons-round">share</span>
        <span>Share WhatsApp</span>
        </button>
        <button type="button" class="btn btn-secondary btn-small" onclick="window.RapidBoy.UI.closeSystemModal()">
        <span>Close</span>
        </button>
        `;

        if (App.UI && typeof App.UI.openSystemModal === 'function') {
            App.UI.openSystemModal();
        }
    };

})(window.RapidBoy);

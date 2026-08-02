/**
 * Rapid Boy Service Manager Pro V4.5 - User Interface, Navigation & Print Engine
 * Production Ready - Live Domain: https://rapidboy.netlify.app
 */

window.RapidBoy = window.RapidBoy || {};

(function (App) {
  'use strict';

  App.UI = App.UI || {};
  App.Navigation = App.Navigation || {};

  /**
   * Safely resolve current website domain (Avoids 'null' during local preview)
   */
  const getSafeBaseDomain = () => {
    const origin = window.location.origin;
    if (origin && origin !== "null" && origin !== "file://" && !origin.startsWith("file://")) {
      return origin;
    }
    return "https://rapidboy.netlify.app";
  };

  App.Navigation.init = function () {
    console.log("🧭 Rapid Boy Navigation Router Active...");

    const navItems = document.querySelectorAll('.nav-dock-item');
    navItems.forEach(item => {
      item.addEventListener('click', function () {
        const targetViewId = this.getAttribute('data-view-target');
        if (targetViewId) {
          App.Navigation.navigateTo(targetViewId);
        }
      });
    });
  };

  App.Navigation.navigateTo = function (viewId) {
    const allViews = document.querySelectorAll('.app-view');
    allViews.forEach(v => v.classList.remove('dynamic-view-active'));

    const targetView = document.getElementById(viewId);
    if (targetView) {
      targetView.classList.add('dynamic-view-active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const navItems = document.querySelectorAll('.nav-dock-item');
    navItems.forEach(item => {
      if (item.getAttribute('data-view-target') === viewId) {
        item.classList.add('item-active');
      } else {
        item.classList.remove('item-active');
      }
    });

    if (viewId === 'view-tickets-list') {
      if (App.Tickets && typeof App.Tickets.renderGrid === 'function') {
        App.Tickets.renderGrid();
      }
      // Handle Admin Export Button Visibility Check
      const exportBtn = document.getElementById('admin-export-btn');
      if (exportBtn) {
        if (App.State.user && App.State.user.role === 'Administrator') {
          exportBtn.classList.remove('wrapper-hidden');
        } else {
          exportBtn.classList.add('wrapper-hidden');
        }
      }
    } else if (viewId === 'view-dashboard-analytics') {
      if (App.Dashboard && typeof App.Dashboard.refreshStats === 'function') {
        App.Dashboard.refreshStats();
      }
    } else if (viewId === 'view-ticket-form') {
      const mode = document.getElementById('form-operation-mode');
      if (mode && mode.value !== 'UPDATE') {
        const heading = document.getElementById('ticket-form-title-heading');
        if (heading) heading.innerText = "New Work Order Entry";
      }
    }
  };

  App.UI.init = function () {
    console.log("🎨 Rapid Boy UI Core Active...");

    const searchInput = document.getElementById('global-search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        const val = this.value.trim().toLowerCase();
        App.State.activeFilters.searchQuery = val;

        if (clearSearchBtn) {
          if (val.length > 0) clearSearchBtn.classList.remove('hidden-element');
          else clearSearchBtn.classList.add('hidden-element');
        }

        App.Tickets.renderGrid();
      });
    }

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', function () {
        if (searchInput) searchInput.value = "";
        App.State.activeFilters.searchQuery = "";
        this.classList.add('hidden-element');
        App.Tickets.renderGrid();
      });
    }

    const techFilterSelect = document.getElementById('technician-filter-dropdown');
    if (techFilterSelect) {
      techFilterSelect.addEventListener('change', function () {
        App.State.activeFilters.technician = this.value;
        App.Tickets.renderGrid();
      });
    }

    const statusFilterSelect = document.getElementById('status-filter-dropdown');
    if (statusFilterSelect) {
      statusFilterSelect.addEventListener('change', function () {
        App.State.activeFilters.status = this.value;
        App.Tickets.renderGrid();
      });
    }

    const paymentFilterSelect = document.getElementById('payment-method-filter');
    if (paymentFilterSelect) {
      paymentFilterSelect.addEventListener('change', function () {
        App.State.activeFilters.paymentMethod = this.value;
        App.Tickets.renderGrid();
      });
    }

    const modalCloseX = document.getElementById('modal-close-trigger-x');
    if (modalCloseX) {
      modalCloseX.addEventListener('click', App.UI.closeSystemModal);
    }
  };

  App.UI.showLoader = function (messageText) {
    const loader = document.getElementById('global-loader');
    if (!loader) return;
    const textNode = loader.querySelector('.loader-sub-text');
    if (textNode && messageText) textNode.innerText = messageText;
    loader.classList.remove('wrapper-hidden');
  };

  App.UI.hideLoader = function () {
    const loader = document.getElementById('global-loader');
    if (loader) loader.classList.add('wrapper-hidden');
  };

    App.UI.showToast = function (title, message, type = 'info') {
      const container = document.getElementById('toast-container');
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;

      toast.innerHTML = `
      <span class="material-icons-round toast-icon" style="font-size: 1.2rem; color: var(--accent-cyan);">info</span>
      <div class="toast-message-content">
      <h4>${App.Utils.sanitizeHTML(title)}</h4>
      <p>${App.Utils.sanitizeHTML(message)}</p>
      </div>
      <button class="btn-icon-round-close" style="margin-left: auto;" onclick="this.parentElement.remove()">
      <span class="material-icons-round" style="font-size: 1rem;">close</span>
      </button>
      `;

      container.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 350);
      }, 4000);
    };

    App.UI.openSystemModal = function () {
      const modal = document.getElementById('global-system-modal-overlay');
      if (modal) modal.classList.remove('wrapper-hidden');
    };

      App.UI.closeSystemModal = function () {
        const modal = document.getElementById('global-system-modal-overlay');
        if (modal) modal.classList.add('wrapper-hidden');
      };

        App.UI.refreshGlobalDataStream = async function (forceFetch = false) {
          try {
            await App.Utils.executeSecureOperation(async () => {
              const activeDriver = window.API || window.Api || App.Api;
              if (activeDriver && typeof activeDriver.transmitPayload === 'function') {
                const response = await activeDriver.transmitPayload({ action: 'getTickets' });
                if (response && response.status === 'success' && Array.isArray(response.data)) {
                  App.State.tickets = response.data;
                  App.State.meta.lastSyncTimestamp = new Date().getTime();
                }
              }
            }, "Synchronizing database records...");

            if (App.Dashboard && typeof App.Dashboard.refreshStats === 'function') App.Dashboard.refreshStats();
            if (App.Tickets && typeof App.Tickets.renderGrid === 'function') App.Tickets.renderGrid();
          } catch (err) {
            console.error("Data refresh exception:", err);
          }
        };

        /**
         * 📲 WHATSAPP DISPATCHER (LIVE NETLIFY URL FIXED)
         */
        App.UI.shareTicketToWhatsApp = function (ticketNumberId) {
          const ticket = App.State.tickets.find(t => String(t.ticketNumber).trim().toLowerCase() === String(ticketNumberId).trim().toLowerCase());
          if (!ticket) return;

          const baseDomain = getSafeBaseDomain();
          const trackingLink = `${baseDomain}/?track=${encodeURIComponent(ticket.ticketNumber)}`;

          const messageText =
          `*RAPID BOY SERVICE JOB ASSIGNMENT*
          ----------------------------------
          🎫 *Ticket No:* ${ticket.ticketNumber}
          👤 *Customer Name:* ${ticket.customerName}
          📞 *Customer Phone:* ${ticket.phoneNumber}
          💻 *Device:* ${ticket.deviceType || 'Hardware'} (${ticket.brand || ''} ${ticket.model || ''})
          🛠️ *Reported Problem:* ${ticket.issue || 'Diagnostics Required'}
          ⏳ *Est. Delivery:* ${ticket.deliveryDate || '2–7 Working Days'}
          👨‍💻 *Assigned Tech:* ${ticket.technician || 'Unassigned'}
          📝 *Remarks:* ${ticket.remarks || 'None'}
          ----------------------------------
          🔗 *Live Update Tracker Link:* ${trackingLink}`;

          const rawPhone = (ticket.whatsAppNumber || ticket.phoneNumber || "").toString().replace(/[^0-9]/g, '');
          const phoneWithCountry = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

          window.open(`https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodeURIComponent(messageText)}`, '_blank');
        };

        /**
         * 👑 10. ADMIN-ONLY FILTERED DATA EXPORT (CSV)
         */
        App.UI.exportFilteredTicketsCSV = function () {
          if (!App.State.user || App.State.user.role !== 'Administrator') {
            App.UI.showToast("Access Denied", "Only administrators can export ledger datasets.", "error");
            return;
          }

          const tickets = App.State.tickets || [];
          const filters = App.State.activeFilters || { searchQuery: "", status: "ALL", technician: "ALL", paymentMethod: "ALL" };

          const filteredTickets = tickets.filter(t => {
            const q = filters.searchQuery.toLowerCase();
            const matchSearch = !q ||
            (t.ticketNumber && String(t.ticketNumber).toLowerCase().includes(q)) ||
            (t.customerName && String(t.customerName).toLowerCase().includes(q)) ||
            (t.phoneNumber && String(t.phoneNumber).toLowerCase().includes(q)) ||
            (t.serialNumber && String(t.serialNumber).toLowerCase().includes(q)) ||
            (t.deviceType && String(t.deviceType).toLowerCase().includes(q)) ||
            (t.brand && String(t.brand).toLowerCase().includes(q));

            const matchStatus = (filters.status === "ALL") || (t.status === filters.status);
            const matchTech = (filters.technician === "ALL") ||
            (t.technician && String(t.technician).split(',').map(s => s.trim()).includes(filters.technician));
            const matchPayment = (filters.paymentMethod === "ALL") ||
            (t.paymentMethod && String(t.paymentMethod).toLowerCase() === filters.paymentMethod.toLowerCase());

            return matchSearch && matchStatus && matchTech && matchPayment;
          });

          if (filteredTickets.length === 0) {
            App.UI.showToast("Export Notice", "No records match current filter criteria.", "warning");
            return;
          }

          const headers = ["TicketNumber", "CustomerName", "PhoneNumber", "CustomerType", "ReferralPerson", "DeviceType", "Brand", "Model", "SerialNumber", "SpareSerial", "AccessorySerial", "Status", "FinalCost", "Advance", "Balance", "PaymentMethod", "Technician"];
          let csvRows = [headers.join(",")];

          filteredTickets.forEach(t => {
            const row = [
              `"${t.ticketNumber || ''}"`,
              `"${(t.customerName || '').replace(/"/g, '""')}"`,
                                  `"${t.phoneNumber || ''}"`,
                                  `"${t.customerType || ''}"`,
                                  `"${(t.referralPerson || '').replace(/"/g, '""')}"`,
                                  `"${t.deviceType || ''}"`,
                                  `"${(t.brand || '').replace(/"/g, '""')}"`,
                                  `"${(t.model || '').replace(/"/g, '""')}"`,
                                  `"${t.serialNumber || ''}"`,
                                  `"${t.spareSerial || ''}"`,
                                  `"${t.accessorySerial || ''}"`,
                                  `"${t.status || ''}"`,
                                  t.finalCost || 0,
                                  t.advance || 0,
                                  t.balance || 0,
                                  `"${t.paymentMethod || ''}"`,
                                  `"${(t.technician || '').replace(/"/g, '""')}"`
            ];
            csvRows.push(row.join(","));
          });

          const blob = new Blob([csvRows.join("\n")], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.setAttribute("href", url);
          link.setAttribute("download", `RapidBoy_Filtered_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          App.UI.showToast("Export Successful", `Downloaded ${filteredTickets.length} filtered work orders.`, "success");
        };

        /**
         * 🖨️ 5. A4 FULL-PAGE PRINT ENGINE
         */
        App.UI.printTicketA4Format = function (ticketNumberId) {
          const ticket = App.State.tickets.find(t => String(t.ticketNumber).trim().toLowerCase() === String(ticketNumberId).trim().toLowerCase());
          if (!ticket) return;

          const baseDomain = getSafeBaseDomain();
          const liveTrackerLink = `${baseDomain}/?track=${encodeURIComponent(ticket.ticketNumber)}`;

          let iframe = document.getElementById('rapidboy-print-iframe');
          if (iframe) iframe.remove();

          iframe = document.createElement('iframe');
          iframe.id = 'rapidboy-print-iframe';
          iframe.style.cssText = 'position:fixed; right:0; bottom:0; width:0; height:0; border:0; visibility:hidden;';
          document.body.appendChild(iframe);

          const doc = iframe.contentWindow.document;

          const htmlContent = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
          <meta charset="UTF-8">
          <title>A4 Print - ${ticket.ticketNumber}</title>
          <style>
          @page { size: A4 portrait; margin: 10mm; }
          * { box-sizing: border-box; font-family: 'Segoe UI', Arial, sans-serif; color: #000 !important; }
          body { margin: 0; padding: 0; background: #fff !important; font-size: 10pt; line-height: 1.4; }
          .a4-container { width: 100%; max-width: 190mm; margin: 0 auto; background: #fff !important; }
          .header-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
          .brand-title { font-size: 18pt; font-weight: 800; margin: 0; }
          .brand-subtitle { font-size: 9pt; margin: 4px 0 0 0; }
          .ticket-no { font-size: 14pt; font-weight: 800; border: 2px solid #000; padding: 4px 14px; border-radius: 6px; }
          table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          table.data-table td, table.data-table th { border: 1px solid #000; padding: 8px 10px; font-size: 9.5pt; vertical-align: top; }
          table.data-table th { background: #f0f0f0 !important; text-align: left; font-weight: 700; }
          .section-title { font-size: 10pt; font-weight: 800; text-transform: uppercase; background: #000 !important; color: #fff !important; padding: 4px 10px; margin-bottom: 6px; }
          .signature-row { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; }
          .sig-box { width: 40%; border-top: 1px dashed #000; text-align: center; font-size: 9pt; font-weight: 700; padding-top: 6px; }
          .terms-block { margin-top: 20px; border-top: 1px solid #000; padding-top: 10px; }
          .terms-block h4 { margin: 0 0 6px 0; font-size: 9.5pt; text-decoration: underline; }
          .terms-block ol { margin: 0; padding-left: 20px; }
          .terms-block li { font-size: 8.5pt; margin-bottom: 4px; }
          </style>
          </head>
          <body>
          <div class="a4-container">
          <div class="header-row">
          <div>
          <h1 class="brand-title">RAPID BOY SERVICE CENTER</h1>
          <p class="brand-subtitle">No. 12, Main Road, Near Bus Stand, Thanjavur, Tamil Nadu - 613001 | Ph: +91 9952587147</p>
          </div>
          <div style="text-align: right;">
          <div class="ticket-no">${App.Utils.sanitizeHTML(ticket.ticketNumber)}</div>
          <div style="font-size: 8.5pt; margin-top: 4px;">Date: ${App.Utils.formatShortDateTime(ticket.updatedTime || new Date().toISOString())}</div>
          </div>
          </div>

          <div class="section-title">Customer & Dealer Details</div>
          <table class="data-table">
          <tr>
          <th width="20%">Customer Name:</th>
          <td width="30%"><strong>${App.Utils.sanitizeHTML(ticket.customerName)}</strong></td>
          <th width="20%">Phone Number:</th>
          <td width="30%">${App.Utils.sanitizeHTML(ticket.phoneNumber)}</td>
          </tr>
          <tr>
          <th>Customer Type:</th>
          <td>${App.Utils.sanitizeHTML(ticket.customerType || 'Customer')}</td>
          <th>Referral Person:</th>
          <td>${App.Utils.sanitizeHTML(ticket.referralPerson || 'None')}</td>
          </tr>
          </table>

          <div class="section-title">Hardware Specifications & Serial Tracking</div>
          <table class="data-table">
          <tr>
          <th width="20%">Device Category:</th>
          <td width="30%">${App.Utils.sanitizeHTML(ticket.deviceType)}</td>
          <th width="20%">Brand & Model:</th>
          <td width="30%">${App.Utils.sanitizeHTML(ticket.brand)} ${App.Utils.sanitizeHTML(ticket.model)}</td>
          </tr>
          <tr>
          <th>Device S/N Tag:</th>
          <td>${App.Utils.sanitizeHTML(ticket.serialNumber || 'N/A')}</td>
          <th>Est. Delivery:</th>
          <td><strong>${App.Utils.sanitizeHTML(ticket.deliveryDate || '2–7 Working Days')}</strong></td>
          </tr>
          <tr>
          <th>Spare Parts S/N:</th>
          <td>${App.Utils.sanitizeHTML(ticket.spareSerial || 'N/A')}</td>
          <th>Accessory S/N:</th>
          <td>${App.Utils.sanitizeHTML(ticket.accessorySerial || 'N/A')}</td>
          </tr>
          </table>

          <div class="section-title">Reported Problems & Inward Accessories</div>
          <table class="data-table">
          <tr>
          <th width="25%">Reported Issues:</th>
          <td>${App.Utils.sanitizeHTML(ticket.issue || 'Standard Checking')}</td>
          </tr>
          <tr>
          <th>Bundled Accessories:</th>
          <td>${App.Utils.sanitizeHTML(ticket.accessories || 'None')}</td>
          </tr>
          </table>

          <div class="section-title">Financial Ledger & Status</div>
          <table class="data-table">
          <tr>
          <th width="20%">Estimate Range:</th>
          <td width="30%">₹${ticket.estimationFrom || 0} - ₹${ticket.estimationTo || 0}</td>
          <th width="20%">Final Service Cost:</th>
          <td width="30%"><strong>₹${ticket.finalCost || 0}</strong></td>
          </tr>
          <tr>
          <th>Advance Paid:</th>
          <td>₹${ticket.advance || 0}</td>
          <th>Balance Due:</th>
          <td><strong style="color: red;">₹${ticket.balance || 0}</strong></td>
          </tr>
          <tr>
          <th>Payment Method:</th>
          <td>${App.Utils.sanitizeHTML(ticket.paymentMethod || 'Cash')} ${ticket.cashReceiver ? '(' + App.Utils.sanitizeHTML(ticket.cashReceiver) + ')' : ''}</td>
          <th>Current Status:</th>
          <td><strong>${App.Utils.sanitizeHTML(ticket.status || 'Pending')}</strong></td>
          </tr>
          </table>

          <div style="font-size: 9pt; margin-top: 10px; border: 1px solid #000; padding: 8px 10px;">
          🔗 <strong>Live Status Tracker URL:</strong> ${liveTrackerLink}
          </div>

          <div class="terms-block">
          <h4>Terms & Conditions</h4>
          <ol>
          <li>This work order receipt must be presented during device pickup. Devices uncollected within 30 days are subject to disposal.</li>
          <li>Rapid Boy Service Center is not liable for data loss; customers should backup critical data beforehand.</li>
          </ol>
          </div>

          <div class="signature-row">
          <div class="sig-box">Customer Signature</div>
          <div class="sig-box">Authorized Signatory</div>
          </div>
          </div>
          </body>
          </html>
          `;

          doc.open();
          doc.write(htmlContent);
          doc.close();

          setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
          }, 250);
        };

        /**
         * 🖨️ 6. A5 DUAL-PAGE PRINT ENGINE
         */
        App.UI.printTicketA5Format = function (ticketNumberId) {
          const ticket = App.State.tickets.find(t => String(t.ticketNumber).trim().toLowerCase() === String(ticketNumberId).trim().toLowerCase());
          if (!ticket) return;

          const baseDomain = getSafeBaseDomain();
          const liveTrackerLink = `${baseDomain}/?track=${encodeURIComponent(ticket.ticketNumber)}`;

          let iframe = document.getElementById('rapidboy-print-iframe');
          if (iframe) iframe.remove();

          iframe = document.createElement('iframe');
          iframe.id = 'rapidboy-print-iframe';
          iframe.style.cssText = 'position:fixed; right:0; bottom:0; width:0; height:0; border:0; visibility:hidden;';
          document.body.appendChild(iframe);

          const doc = iframe.contentWindow.document;

          const htmlContent = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
          <meta charset="UTF-8">
          <title>A5 Print - ${ticket.ticketNumber}</title>
          <style>
          @page { size: A5 portrait; margin: 4mm; }
          * { box-sizing: border-box; font-family: 'Segoe UI', Arial, sans-serif; color: #000000 !important; }
          body { margin: 0; padding: 0; background: #ffffff !important; font-size: 8.5pt; line-height: 1.25; }
          .a5-page { width: 100%; min-height: 190mm; padding: 3mm; position: relative; background: #ffffff !important; }
          .page-break { page-break-before: always; }
          .header-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 4px; margin-bottom: 6px; }
          .brand-title { font-size: 13pt; font-weight: 800; margin: 0; }
          .brand-subtitle { font-size: 7.5pt; margin: 2px 0 0 0; }
          .ticket-no { font-size: 11pt; font-weight: 800; border: 1.5px solid #000; padding: 2px 8px; border-radius: 4px; }
          table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
          table.data-table td, table.data-table th { border: 1px solid #000; padding: 4px 6px; font-size: 8pt; vertical-align: top; }
          table.data-table th { background: #f0f0f0 !important; text-align: left; font-weight: 700; }
          .section-title { font-size: 8pt; font-weight: 800; text-transform: uppercase; background: #000 !important; color: #fff !important; padding: 2px 6px; margin-bottom: 4px; }
          .signature-row { display: flex; justify-content: space-between; margin-top: 25px; padding-top: 10px; }
          .sig-box { width: 45%; border-top: 1px dashed #000; text-align: center; font-size: 7.5pt; font-weight: 700; padding-top: 4px; }
          .terms-header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 6px; margin-bottom: 10px; }
          .terms-header h2 { margin: 0; font-size: 11pt; text-transform: uppercase; }
          .terms-block { margin-bottom: 12px; }
          .terms-block h4 { margin: 0 0 4px 0; font-size: 8.5pt; text-decoration: underline; }
          .terms-block ol { margin: 0; padding-left: 16px; }
          .terms-block li { font-size: 7.5pt; margin-bottom: 4px; line-height: 1.2; }
          </style>
          </head>
          <body>
          <div class="a5-page">
          <div class="header-row">
          <div>
          <h1 class="brand-title">RAPID BOY SERVICE</h1>
          <p class="brand-subtitle">No. 12, Main Road, Near Bus Stand, Thanjavur | Ph: +91 9952587147</p>
          </div>
          <div style="text-align: right;">
          <div class="ticket-no">${App.Utils.sanitizeHTML(ticket.ticketNumber)}</div>
          <div style="font-size: 7pt; margin-top: 2px;">Date: ${App.Utils.formatShortDateTime(ticket.updatedTime || new Date().toISOString())}</div>
          </div>
          </div>

          <table class="data-table">
          <tr>
          <th width="20%">Customer:</th>
          <td width="30%"><strong>${App.Utils.sanitizeHTML(ticket.customerName)}</strong></td>
          <th width="20%">Phone:</th>
          <td width="30%">${App.Utils.sanitizeHTML(ticket.phoneNumber)}</td>
          </tr>
          <tr>
          <th>Device:</th>
          <td>${App.Utils.sanitizeHTML(ticket.deviceType)}</td>
          <th>Brand / Model:</th>
          <td>${App.Utils.sanitizeHTML(ticket.brand)} ${App.Utils.sanitizeHTML(ticket.model)}</td>
          </tr>
          <tr>
          <th>Serial No:</th>
          <td>${App.Utils.sanitizeHTML(ticket.serialNumber || 'N/A')}</td>
          <th>Spare / Acc S/N:</th>
          <td>${App.Utils.sanitizeHTML(ticket.spareSerial || 'N/A')} / ${App.Utils.sanitizeHTML(ticket.accessorySerial || 'N/A')}</td>
          </tr>
          </table>

          <div class="section-title">Reported Problem / Job Description</div>
          <table class="data-table">
          <tr><td style="height: 25px;">${App.Utils.sanitizeHTML(ticket.issue || 'Standard Checking')}</td></tr>
          </table>

          <div class="section-title">Inward Bundled Accessories</div>
          <table class="data-table">
          <tr><td>${App.Utils.sanitizeHTML(ticket.accessories || 'None Received')}</td></tr>
          </table>

          <div class="section-title">Financial Estimate & Payment Mode</div>
          <table class="data-table">
          <tr>
          <th>Estimate Range:</th>
          <td>₹${ticket.estimationFrom || 0} - ₹${ticket.estimationTo || 0}</td>
          <th>Final Cost:</th>
          <td><strong>₹${ticket.finalCost || 0}</strong></td>
          </tr>
          <tr>
          <th>Advance Paid:</th>
          <td>₹${ticket.advance || 0}</td>
          <th>Balance Due:</th>
          <td><strong style="font-size: 9.5pt;">₹${ticket.balance || 0}</strong></td>
          </tr>
          <tr>
          <th>Payment Method:</th>
          <td>${App.Utils.sanitizeHTML(ticket.paymentMethod || 'Cash')} ${ticket.cashReceiver ? '(' + App.Utils.sanitizeHTML(ticket.cashReceiver) + ')' : ''}</td>
          <th>Assigned Tech:</th>
          <td>${App.Utils.sanitizeHTML(ticket.technician || 'Allocated Staff')}</td>
          </tr>
          </table>

          <div style="font-size: 7.5pt; margin-top: 4px; border: 1px solid #000; padding: 4px 6px;">
          🔗 <strong>Live Status Tracker:</strong> ${liveTrackerLink}
          </div>

          <div class="signature-row">
          <div class="sig-box">Customer Signature</div>
          <div class="sig-box">Authorized Signatory</div>
          </div>
          </div>

          <div class="a5-page page-break">
          <div class="terms-header">
          <h2>TERMS & CONDITIONS / நிபந்தனைகள்</h2>
          <p style="font-size: 7.5pt; margin: 2px 0 0 0;">Rapid Boy Service Center Maintenance Guidelines</p>
          </div>

          <div class="terms-block">
          <h4>English Terms and Conditions</h4>
          <ol>
          <li>This receipt must be produced at the time of taking delivery of the device.</li>
          <li>Devices not claimed within 30 days from notification of completion will be disposed of to recover service costs.</li>
          <li>The service center is not responsible for data loss. Customers are advised to backup data prior to handing over.</li>
          <li>Warranty covers only replaced spare parts, not physical or liquid damages after delivery.</li>
          </ol>
          </div>

          <div class="terms-block" style="margin-top: 15px;">
          <h4>தமிழ் நிபந்தனைகள் மற்றும் விதிகள்</h4>
          <ol>
          <li>பொருட்களை திரும்பப் பெறும்போது இந்த ரசீதை கட்டாயம் சமர்ப்பிக்க வேண்டும்.</li>
          <li>சேவை முடிவடைந்து 30 நாட்களுக்குள் பெற்றுக்கொள்ளப்படாத பொருட்கள் குறித்து நிர்வாகம் பொறுப்பேற்காது.</li>
          <li>பொருட்களில் உள்ள தகவல்களுக்கு (Data Loss) சேவை மையம் பொறுப்பேற்காது.</li>
          <li>மாற்றப்பட்ட பாகங்களுக்கு மட்டுமே உத்திரவாதம் பொருந்தும்.</li>
          </ol>
          </div>

          <div class="signature-row" style="margin-top: 40px;">
          <div class="sig-box" style="margin: 0 auto; width: 60%;">I agree to the Terms & Conditions<br>(வாடிக்கையாளர் கையொப்பம்)</div>
          </div>
          </div>
          </body>
          </html>
          `;

          doc.open();
          doc.write(htmlContent);
          doc.close();

          setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
          }, 250);
        };

        /**
         * 🖨️ 7. THERMAL POS (80MM) RECEIPT PRINT ENGINE
         */
        App.UI.printTicketThermalFormat = function (ticketNumberId) {
          const ticket = App.State.tickets.find(t => String(t.ticketNumber).trim().toLowerCase() === String(ticketNumberId).trim().toLowerCase());
          if (!ticket) return;

          let iframe = document.getElementById('rapidboy-print-iframe');
          if (iframe) iframe.remove();

          iframe = document.createElement('iframe');
          iframe.id = 'rapidboy-print-iframe';
          iframe.style.cssText = 'position:fixed; right:0; bottom:0; width:0; height:0; border:0; visibility:hidden;';
          document.body.appendChild(iframe);

          const doc = iframe.contentWindow.document;

          const htmlContent = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
          <meta charset="UTF-8">
          <title>Thermal Print - ${ticket.ticketNumber}</title>
          <style>
          @page { size: 80mm auto; margin: 2mm; }
          * { box-sizing: border-box; font-family: 'Courier New', monospace; color: #000 !important; }
          body { margin: 0; padding: 4px; background: #fff !important; font-size: 9pt; line-height: 1.2; width: 72mm; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .line { border-bottom: 1px dashed #000; margin: 6px 0; }
          .flex-row { display: flex; justify-content: space-between; }
          </style>
          </head>
          <body>
          <div class="center bold" style="font-size: 11pt;">RAPID BOY SERVICE</div>
          <div class="center" style="font-size: 7.5pt;">Thanjavur | Ph: +91 9952587147</div>
          <div class="line"></div>

          <div><span class="bold">Ticket:</span> ${ticket.ticketNumber}</div>
          <div><span class="bold">Date:</span> ${App.Utils.formatShortDateTime(ticket.updatedTime || new Date().toISOString())}</div>
          <div><span class="bold">Customer:</span> ${ticket.customerName}</div>
          <div><span class="bold">Phone:</span> ${ticket.phoneNumber}</div>
          <div class="line"></div>

          <div><span class="bold">Device:</span> ${ticket.deviceType} (${ticket.brand || ''} ${ticket.model || ''})</div>
          <div><span class="bold">Serial:</span> ${ticket.serialNumber || 'N/A'}</div>
          <div><span class="bold">Spare S/N:</span> ${ticket.spareSerial || 'N/A'}</div>
          <div><span class="bold">Issues:</span> ${ticket.issue || 'N/A'}</div>
          <div class="line"></div>

          <div class="flex-row"><span>Final Cost:</span> <span class="bold">₹${ticket.finalCost || 0}</span></div>
          <div class="flex-row"><span>Advance Paid:</span> <span>₹${ticket.advance || 0}</span></div>
          <div class="flex-row bold" style="font-size: 10pt; margin-top: 4px;"><span>Balance Due:</span> <span>₹${ticket.balance || 0}</span></div>
          <div><span class="bold">Payment Mode:</span> ${ticket.paymentMethod || 'Cash'}</div>
          <div class="line"></div>

          <div class="center" style="font-size: 8pt; margin-top: 6px;">Thank you for choosing Rapid Boy!</div>
          </body>
          </html>
          `;

          doc.open();
          doc.write(htmlContent);
          doc.close();

          setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
          }, 250);
        };

})(window.RapidBoy);

/**
 * Grid Card Matrix Attachment
 */
(function (App) {
  'use strict';

  App.Tickets = App.Tickets || {};

  App.Tickets.renderGrid = function () {
    const gridContainer = document.getElementById('tickets-render-grid');
    if (!gridContainer) return;

    const tickets = App.State.tickets || [];
    const filters = App.State.activeFilters || { searchQuery: "", status: "ALL", technician: "ALL", paymentMethod: "ALL" };

    const filteredTickets = tickets.filter(t => {
      const q = filters.searchQuery.toLowerCase();
      const matchSearch = !q ||
      (t.ticketNumber && String(t.ticketNumber).toLowerCase().includes(q)) ||
      (t.customerName && String(t.customerName).toLowerCase().includes(q)) ||
      (t.phoneNumber && String(t.phoneNumber).toLowerCase().includes(q)) ||
      (t.serialNumber && String(t.serialNumber).toLowerCase().includes(q)) ||
      (t.spareSerial && String(t.spareSerial).toLowerCase().includes(q)) ||
      (t.deviceType && String(t.deviceType).toLowerCase().includes(q)) ||
      (t.brand && String(t.brand).toLowerCase().includes(q));

      const matchStatus = (filters.status === "ALL") || (t.status === filters.status);
      const matchTech = (filters.technician === "ALL") ||
      (t.technician && String(t.technician).split(',').map(s => s.trim()).includes(filters.technician));
      const matchPayment = (filters.paymentMethod === "ALL") ||
      (t.paymentMethod && String(t.paymentMethod).toLowerCase() === filters.paymentMethod.toLowerCase());

      return matchSearch && matchStatus && matchTech && matchPayment;
    });

    if (filteredTickets.length === 0) {
      gridContainer.innerHTML = `
      <div class="empty-state-card" style="grid-column: 1 / -1; text-align: center; padding: 40px 20px;">
      <span class="material-icons-round" style="font-size: 3rem; color: var(--text-muted);">search_off</span>
      <h3>No Work Orders Found</h3>
      </div>
      `;
      return;
    }

    let compiledGridHtml = "";
    filteredTickets.forEach(ticket => {

      let badgeClass = 'pill-Pending';
      if (ticket.status === 'Delivered') badgeClass = 'pill-Delivered';
      else if (ticket.status === 'In Progress' || ticket.status === 'Repairing' || ticket.status === 'Proceed to Service') badgeClass = 'pill-Repairing';
      else if (ticket.status === 'Ready for Delivery') badgeClass = 'pill-ReadyforDelivery';
      else if (ticket.status === 'Cancelled') badgeClass = 'pill-Cancelled';

      const rawTicketNum = ticket.ticketNumber ? String(ticket.ticketNumber).trim() : '';

      // 1. Payment update received button check ✅ button unless unpaid
      const isUnpaid = (ticket.paymentMethod || "").toLowerCase() === 'credit';
      const payCheckButton = isUnpaid
      ? `<button class="btn-icon-round" title="Unpaid / Credit (Click to Mark Paid)" onclick="window.RapidBoy.Tickets.markPaymentReceived('${rawTicketNum}')"><span class="material-icons-round" style="color: var(--accent-warning);">radio_button_unchecked</span></button>`
      : `<button class="btn-icon-round" title="Payment Received" style="cursor: default;"><span class="material-icons-round" style="color: var(--accent-success);">check_circle</span></button>`;

      let issuesDisplayHtml = "";
      if (ticket.issue) {
        const issueList = String(ticket.issue).split(',').map(s => s.trim()).filter(Boolean);
        const issuePills = issueList.map(iss => {
          if (iss.startsWith('[DONE]')) {
            const clean = iss.replace('[DONE]', '').trim();
            return `<span style="text-decoration: line-through; color: #64748b; font-style: italic;">✓ ${App.Utils.sanitizeHTML(clean)}</span>`;
          }
          return `<span>${App.Utils.sanitizeHTML(iss)}</span>`;
        });
        issuesDisplayHtml = issuePills.join(' • ');
      }

      compiledGridHtml += `
      <div class="ticket-data-node-card">
      <div class="node-card-top-header">
      <div class="node-id-block">
      <h4>${App.Utils.sanitizeHTML(rawTicketNum)}</h4>
      <span class="node-inward-id">${App.Utils.sanitizeHTML(ticket.inwardNumber || '')}</span>
      </div>
      <span class="status-pill ${badgeClass}">${App.Utils.sanitizeHTML(ticket.status || 'Pending')}</span>
      </div>

      <div class="node-client-block">
      <span class="node-client-name">${App.Utils.sanitizeHTML(ticket.customerName)}</span>
      <span class="node-client-type">${App.Utils.sanitizeHTML(ticket.phoneNumber)} • ${App.Utils.sanitizeHTML(ticket.customerType || 'Customer')} ${ticket.referralPerson ? '• Ref: ' + App.Utils.sanitizeHTML(ticket.referralPerson) : ''}</span>
      </div>

      <div class="node-device-info-row">
      <span class="material-icons-round">laptop</span>
      <span>${App.Utils.sanitizeHTML(ticket.deviceType || 'Hardware')} – ${App.Utils.sanitizeHTML(ticket.brand || '')} ${App.Utils.sanitizeHTML(ticket.model || '')}</span>
      </div>

      ${ticket.spareSerial ? `
        <div style="font-size: 0.78rem; color: #38bdf8; margin-bottom: 6px;">
        💾 <b>Spare S/N:</b> ${App.Utils.sanitizeHTML(ticket.spareSerial)}
        </div>
        ` : ''}

        ${issuesDisplayHtml ? `
          <div style="font-size: 0.8rem; color: #cbd5e1; margin-bottom: 10px; background: rgba(255,255,255,0.02); padding: 6px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.04);">
          🛠️ <b>Issues:</b> ${issuesDisplayHtml}
          </div>
          ` : ''}

          <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center; font-size: 0.75rem; margin-top: 8px;">
          <span style="background: rgba(6, 182, 212, 0.12); color: var(--accent-cyan); padding: 2px 8px; border-radius: 4px; font-weight: 600;">
          💳 ${App.Utils.sanitizeHTML(ticket.paymentMethod || 'Cash')}
          </span>
          ${ticket.cashReceiver ? `<span style="background: rgba(245, 158, 11, 0.12); color: #f59e0b; padding: 2px 8px; border-radius: 4px;">💵 Recv: ${App.Utils.sanitizeHTML(ticket.cashReceiver)}</span>` : ''}
          </div>

          <div class="node-financials-footer-row">
          <div>
          <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">FINAL COST</span>
          <span class="node-price-tag" style="color: var(--accent-cyan);">₹${ticket.finalCost || 0}</span>
          </div>
          <div>
          <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">ADVANCE</span>
          <span class="node-price-tag" style="color: var(--accent-success);">₹${ticket.advance || 0}</span>
          </div>
          <div>
          <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">BALANCE</span>
          <span class="node-price-tag" style="color: var(--accent-error);">₹${ticket.balance || 0}</span>
          </div>
          </div>

          <div class="form-actions-footer-bar" style="margin-top: 15px; padding-top: 12px; justify-content: flex-end; gap: 8px;">
          ${payCheckButton}
          <button class="btn-icon-round" title="View Audit Lifecycle" onclick="window.RapidBoy.Timeline.showTicketTimelineModal('${rawTicketNum}')">
          <span class="material-icons-round" style="font-size: 1.1rem;">history</span>
          </button>
          <button class="btn-icon-round" title="Edit Work Order" onclick="window.RapidBoy.Form.loadTicketIntoEditorForm('${rawTicketNum}')">
          <span class="material-icons-round" style="font-size: 1.1rem;">edit</span>
          </button>
          <button class="btn-icon-round" title="Share WhatsApp Message" onclick="window.RapidBoy.UI.shareTicketToWhatsApp('${rawTicketNum}')">
          <span class="material-icons-round" style="font-size: 1.1rem; color: #10b981;">share</span>
          </button>
          <button class="btn-icon-round" title="Print A4 Work Order" onclick="window.RapidBoy.UI.printTicketA4Format('${rawTicketNum}')">
          <span class="material-icons-round" style="font-size: 1.1rem; color: #a855f7;" title="A4 Print">description</span>
          </button>
          <button class="btn-icon-round" title="Print A5 Work Order" onclick="window.RapidBoy.UI.printTicketA5Format('${rawTicketNum}')">
          <span class="material-icons-round" style="font-size: 1.1rem; color: var(--accent-cyan);" title="A5 Print">print</span>
          </button>
          <button class="btn-icon-round" title="Thermal POS Print" onclick="window.RapidBoy.UI.printTicketThermalFormat('${rawTicketNum}')">
          <span class="material-icons-round" style="font-size: 1.1rem; color: #f59e0b;" title="Thermal Print">receipt</span>
          </button>
          </div>
          </div>
          `;
    });

    gridContainer.innerHTML = compiledGridHtml;
  };

  /**
   * Quick action to convert Credit / Unpaid status to Paid
   */
  App.Tickets.markPaymentReceived = async function (ticketNumberId) {
    const ticket = App.State.tickets.find(t => String(t.ticketNumber).trim().toLowerCase() === String(ticketNumberId).trim().toLowerCase());
    if (!ticket) return;

    ticket.paymentMethod = "Cash";
    ticket.balance = 0;
    ticket.actualAmountPaid = ticket.finalCost || ticket.advance || 0;

    try {
      await App.Utils.executeSecureOperation(async () => {
        const activeDriver = window.API || window.Api || App.Api;
        const res = await activeDriver.transmitPayload({ action: 'updateTicket', ...ticket });
        if (res && res.status === "success") {
          App.UI.showToast("Payment Updated", `Ticket ${ticket.ticketNumber} marked as Paid.`, "success");
          await App.UI.refreshGlobalDataStream(true);
        } else {
          throw new Error(res.message || "Failed to update payment status.");
        }
      }, "Updating payment status...");
    } catch (err) {
      console.error("Mark payment received error:", err);
    }
  };

})(window.RapidBoy);

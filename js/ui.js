/**
 * Rapid Boy Service Manager Pro V4.6 - User Interface, Navigation & Print Engine
 * Production Ready - Features: Date Filtering, Professional Scaled A4 & A5 Job Sheets, Spare Parts Integration
 */

window.RapidBoy = window.RapidBoy || {};

(function (App) {
  'use strict';

  App.UI = App.UI || {};
  App.Navigation = App.Navigation || {};

  const getSafeBaseDomain = () => {
    const origin = window.location.origin;
    if (origin && origin !== "null" && origin !== "file://" && !origin.startsWith("file://")) {
      return origin;
    }
    return "https://rapidboy.netlify.app";
  };

  const getLocalISODate = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
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

    // 📅 Date Filter Listeners
    const fromDateInput = document.getElementById('filter-from-date');
    if (fromDateInput) {
      fromDateInput.addEventListener('change', function () {
        App.State.activeFilters.fromDate = this.value;
        App.Tickets.renderGrid();
      });
    }

    const toDateInput = document.getElementById('filter-to-date');
    if (toDateInput) {
      toDateInput.addEventListener('change', function () {
        App.State.activeFilters.toDate = this.value;
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
      <span class="material-icons-round toast-icon" style="font-size: 1.2rem; color: var(--accent-primary);">info</span>
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
----------------------------------
🔗 *Live Tracker Link:* ${trackingLink}`;

    const rawPhone = (ticket.whatsAppNumber || ticket.phoneNumber || "").toString().replace(/[^0-9]/g, '');
    const phoneWithCountry = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

    window.open(`https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodeURIComponent(messageText)}`, '_blank');
  };

  App.UI.exportFilteredTicketsCSV = function () {
    if (!App.State.user || App.State.user.role !== 'Administrator') {
      App.UI.showToast("Access Denied", "Only administrators can export ledger datasets.", "error");
      return;
    }

    const tickets = App.State.tickets || [];
    const filters = App.State.activeFilters || { searchQuery: "", status: "ALL", technician: "ALL", paymentMethod: "ALL", fromDate: "", toDate: "" };

    const filteredTickets = tickets.filter(t => {
      const q = filters.searchQuery.toLowerCase();
      const matchSearch = !q ||
        (t.ticketNumber && String(t.ticketNumber).toLowerCase().includes(q)) ||
        (t.customerName && String(t.customerName).toLowerCase().includes(q)) ||
        (t.phoneNumber && String(t.phoneNumber).toLowerCase().includes(q)) ||
        (t.serialNumber && String(t.serialNumber).toLowerCase().includes(q));

      const matchStatus = (filters.status === "ALL") || (t.status === filters.status);
      const matchTech = (filters.technician === "ALL") ||
        (t.technician && String(t.technician).split(',').map(s => s.trim()).includes(filters.technician));
      const matchPayment = (filters.paymentMethod === "ALL") ||
        (t.paymentMethod && String(t.paymentMethod).toLowerCase() === filters.paymentMethod.toLowerCase());

      // 📅 Date Filtering Logic Applied to Export
      let matchDate = true;
      if (filters.fromDate || filters.toDate) {
        const rawDateStr = t.createdDate || t.inwardDate || "";
        if (rawDateStr) {
          try {
            const ticketDate = new Date(rawDateStr).toISOString().split('T')[0];
            if (filters.fromDate && ticketDate < filters.fromDate) matchDate = false;
            if (filters.toDate && ticketDate > filters.toDate) matchDate = false;
          } catch (e) {}
        }
      }

      return matchSearch && matchStatus && matchTech && matchPayment && matchDate;
    });

    // Sort Export Data (Latest Ticket First)
    filteredTickets.sort((a, b) => {
      const numA = parseInt(String(a.ticketNumber || '').replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(String(b.ticketNumber || '').replace(/\D/g, ''), 10) || 0;
      return numB - numA;
    });

    if (filteredTickets.length === 0) {
      App.UI.showToast("Export Notice", "No records match current filter criteria.", "warning");
      return;
    }

    const headers = ["TicketNumber", "CustomerName", "PhoneNumber", "CustomerType", "DeviceType", "Brand", "Model", "SerialNumber", "Status", "FinalCost", "PaymentMethod", "Technician"];
    let csvRows = [headers.join(",")];

    filteredTickets.forEach(t => {
      const row = [
        `"${t.ticketNumber || ''}"`,
        `"${(t.customerName || '').replace(/"/g, '""')}"`,
        `"${t.phoneNumber || ''}"`,
        `"${t.customerType || ''}"`,
        `"${t.deviceType || ''}"`,
        `"${(t.brand || '').replace(/"/g, '""')}"`,
        `"${(t.model || '').replace(/"/g, '""')}"`,
        `"${t.serialNumber || ''}"`,
        `"${t.status || ''}"`,
        t.finalCost || 0,
        `"${t.paymentMethod || ''}"`,
        `"${(t.technician || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `RapidBoy_Ledger_${getLocalISODate()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    App.UI.showToast("Export Successful", `Downloaded ${filteredTickets.length} filtered work orders.`, "success");
  };

  App.UI.showPrintOptionsModal = function (ticketNumberId) {
    const modalBody = document.getElementById('modal-core-render-body-scroll');
    const modalTitle = document.getElementById('modal-card-title-string');
    const modalFooter = document.getElementById('modal-layout-footer-actions');

    if (!modalBody || !modalTitle || !modalFooter) return;

    modalTitle.innerText = `Select Print Format [ ${ticketNumberId} ]`;

    modalBody.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px; padding: 10px 0;">
        <button type="button" class="btn btn-secondary" style="display: flex; align-items: center; justify-content: space-between; padding: 14px; font-weight: 600;" onclick="window.RapidBoy.UI.printTicketA4Format('${ticketNumberId}'); window.RapidBoy.UI.closeSystemModal();">
          <span style="display: flex; align-items: center; gap: 8px;"><span class="material-icons-round" style="color: var(--accent-primary);">description</span> A4 Print Format</span>
          <span style="font-size: 0.75rem; color: #64748B;">Standard Document</span>
        </button>

        <button type="button" class="btn btn-secondary" style="display: flex; align-items: center; justify-content: space-between; padding: 14px; font-weight: 600;" onclick="window.RapidBoy.UI.printTicketA5Format('${ticketNumberId}'); window.RapidBoy.UI.closeSystemModal();">
          <span style="display: flex; align-items: center; gap: 8px;"><span class="material-icons-round" style="color: var(--status-emerald);">receipt</span> A5 Print Format</span>
          <span style="font-size: 0.75rem; color: #64748B;">Compact Sheet</span>
        </button>

        <button type="button" class="btn btn-secondary" style="display: flex; align-items: center; justify-content: space-between; padding: 14px; font-weight: 600;" onclick="window.RapidBoy.UI.printTicketThermalFormat('${ticketNumberId}'); window.RapidBoy.UI.closeSystemModal();">
          <span style="display: flex; align-items: center; gap: 8px;"><span class="material-icons-round" style="color: var(--status-amber);">print</span> 58mm Thermal Print</span>
          <span style="font-size: 0.75rem; color: #64748B;">Receipt Roll</span>
        </button>
      </div>
    `;

    modalFooter.innerHTML = `
      <button type="button" class="btn btn-secondary btn-small" onclick="window.RapidBoy.UI.closeSystemModal()">Cancel</button>
    `;

    App.UI.openSystemModal();
  };

  /**
   * Helper to generate professional job sheet HTML markup (Shared between A4 and A5 with scaling)
   */
  const generateJobSheetMarkup = function (ticket, scaleFactor = 1) {
    const baseDomain = getSafeBaseDomain();
    const liveTrackerLink = `${baseDomain}/?track=${encodeURIComponent(ticket.ticketNumber)}`;

    let totalPaid = 0;
    let historyArr = [];
    if (ticket.paymentHistory) {
      try {
        historyArr = typeof ticket.paymentHistory === 'string' ? JSON.parse(ticket.paymentHistory) : ticket.paymentHistory;
      } catch (e) { historyArr = []; }
    }
    if (historyArr.length === 0 && ticket.advance && parseFloat(ticket.advance) > 0) {
      totalPaid = parseFloat(ticket.advance) || 0;
    } else {
      historyArr.forEach(p => totalPaid += parseFloat(p.amount) || 0);
    }

    const finalCost = parseFloat(ticket.finalCost) || 0;
    const balanceDue = Math.max(0, finalCost - totalPaid);
    const accessorySerialsStr = ticket.accessorySerial || "None";
    const accessoriesReceivedStr = ticket.accessories || "None";

    // 🛠️ Detailed Spare Parts List Processing
    let sparePartsTableHtml = '';
    try {
      let parsedParts = [];
      if (Array.isArray(ticket.sparePartsList)) {
        parsedParts = ticket.sparePartsList;
      } else if (typeof ticket.sparePartsList === 'string' && ticket.sparePartsList.trim().startsWith('[')) {
        parsedParts = JSON.parse(ticket.sparePartsList);
      }

      if (parsedParts && parsedParts.length > 0) {
        const rows = parsedParts.map((p, i) => `
          <tr>
            <td style="border: 1px solid #CBD5E1; padding: 4px;">${i + 1}</td>
            <td style="border: 1px solid #CBD5E1; padding: 4px;">${p.name || p.partName || p.item || 'Spare Part'}</td>
            <td style="border: 1px solid #CBD5E1; padding: 4px;">${p.qty || p.quantity || 1}</td>
            <td style="border: 1px solid #CBD5E1; padding: 4px;">₹${p.price || p.amount || p.rate || 0}</td>
          </tr>
        `).join('');

        sparePartsTableHtml = `
          <table style="width: 100%; border-collapse: collapse; margin-top: 4px; font-size: ${8 * scaleFactor}pt; font-weight: normal;">
            <thead style="background: #F1F5F9;">
              <tr>
                <th style="border: 1px solid #CBD5E1; padding: 4px; text-align: left;">#</th>
                <th style="border: 1px solid #CBD5E1; padding: 4px; text-align: left;">Part Name</th>
                <th style="border: 1px solid #CBD5E1; padding: 4px; text-align: left;">Qty</th>
                <th style="border: 1px solid #CBD5E1; padding: 4px; text-align: left;">Price</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        `;
      }
    } catch (e) {
      console.warn("Could not parse spare parts array", e);
    }

    const sparePartsFallback = ticket.sparePartsList || ticket.spareSerial || "None";
    const finalSparePartsRender = sparePartsTableHtml || `<span style="color: #0F172A; font-weight: 600;">${sparePartsFallback}</span>`;

    return `
      <div class="sheet-container" style="font-size: ${9.5 * scaleFactor}pt;">
        <table class="header-table">
          <tr>
            <td>
              <h1 class="company-title" style="font-size: ${18 * scaleFactor}pt;">RAPID BOY SERVICE CENTER</h1>
              <p class="company-subtitle" style="font-size: ${8.5 * scaleFactor}pt;">Advanced Chip-Level Laptop, PC & Mobile Service Hub | Thanjavur</p>
              <p class="company-subtitle" style="font-size: ${8.5 * scaleFactor}pt;">📞 Helpline: +91 96776 00190</p>
            </td>
            <td class="doc-badge">
              <h3 style="font-size: ${13 * scaleFactor}pt;">JOB SHEET / INVOICE</h3>
              <p style="font-size: ${8 * scaleFactor}pt;"><strong>Ticket ID:</strong> ${ticket.ticketNumber}</p>
              <p style="font-size: ${8 * scaleFactor}pt;"><strong>Date:</strong> ${ticket.createdDate || new Date().toLocaleDateString('en-IN')}</p>
            </td>
          </tr>
        </table>

        <table class="grid-2">
          <tr>
            <td>
              <div class="section-title" style="margin-top:0; font-size: ${9 * scaleFactor}pt;">Customer Information</div>
              <p style="margin: 3px 0;"><strong>Name:</strong> ${ticket.customerName}</p>
              <p style="margin: 3px 0;"><strong>Phone:</strong> ${ticket.phoneNumber}</p>
              <p style="margin: 3px 0;"><strong>Customer Type:</strong> ${ticket.customerType || 'Customer'}</p>
            </td>
            <td>
              <div class="section-title" style="margin-top:0; font-size: ${9 * scaleFactor}pt;">Service Metadata</div>
              <p style="margin: 3px 0;"><strong>Inward ID:</strong> ${ticket.inwardNumber || 'N/A'}</p>
              <p style="margin: 3px 0;"><strong>Assigned Tech:</strong> ${ticket.technician || 'Unassigned'}</p>
              <p style="margin: 3px 0;"><strong>Current Status:</strong> <span style="color: #2563EB; font-weight: bold;">${ticket.status}</span></p>
            </td>
          </tr>
        </table>

        <div class="section-title" style="font-size: ${9 * scaleFactor}pt;">Device & Hardware Specifications</div>
        <table class="info-table">
          <tr>
            <th>Device Category</th>
            <td>${ticket.deviceType || 'Hardware'}</td>
            <th>Brand & Model</th>
            <td>${ticket.brand || ''} ${ticket.model || ''}</td>
          </tr>
          <tr>
            <th>Serial Number / IMEI</th>
            <td colspan="3"><code style="color: #2563EB; font-weight: bold;">${ticket.serialNumber || 'Not Provided'}</code></td>
          </tr>
          <tr>
            <th>Reported Issue</th>
            <td colspan="3" style="color: #B45309; font-weight: 600;">${ticket.issue || 'Diagnostics Required'}</td>
          </tr>
          <tr>
            <th>Installed Spare Parts</th>
            <td colspan="3">${finalSparePartsRender}</td>
          </tr>
          <tr>
            <th>Received Accessories</th>
            <td>${accessoriesReceivedStr}</td>
            <th>Accessory Serials</th>
            <td>${accessorySerialsStr}</td>
          </tr>
        </table>

        <div class="section-title" style="font-size: ${9 * scaleFactor}pt;">Financial Ledger Summary</div>
        <table class="fin-box">
          <tr>
            <td>
              <span class="label" style="font-size: ${7.5 * scaleFactor}pt;">FINAL AGREED COST</span>
              <span class="val" style="font-size: ${11 * scaleFactor}pt; color: #2563EB;">₹${finalCost}</span>
            </td>
            <td>
              <span class="label" style="font-size: ${7.5 * scaleFactor}pt;">TOTAL PAID AMOUNT</span>
              <span class="val" style="font-size: ${11 * scaleFactor}pt; color: #10B981;">₹${totalPaid}</span>
            </td>
            <td>
              <span class="label" style="font-size: ${7.5 * scaleFactor}pt;">BALANCE DUE</span>
              <span class="val" style="font-size: ${11 * scaleFactor}pt; color: #EF4444;">₹${balanceDue}</span>
            </td>
          </tr>
        </table>

        ${ticket.remarks ? `<div style="margin-top: 8px; font-size: ${8.5 * scaleFactor}pt; color: #334155;"><strong>Remarks:</strong> ${ticket.remarks}</div>` : ''}

        <div style="margin-top: 10px; background: #F8FAFC; border: 1px solid #CBD5E1; padding: 6px 10px; border-radius: 6px;">
          <span style="font-size: ${7.5 * scaleFactor}pt; color: #475569;">🌐 <strong>Live Status Tracker URL:</strong> ${liveTrackerLink}</span>
        </div>

        <div class="terms-box" style="font-size: ${7 * scaleFactor}pt;">
          <strong>Terms & Conditions:</strong> Devices left over 30 days after repair incur storage charges. Warranty voids on physical/liquid damage.
        </div>

        <table class="sign-table">
          <tr>
            <td>
              <div class="sign-line">Customer Signature</div>
            </td>
            <td>
              <div class="sign-line">Authorized Signatory (Rapid Boy)</div>
            </td>
          </tr>
        </table>
      </div>
    `;
  };

  App.UI.printTicketA4Format = function (ticketNumberId) {
    const ticket = App.State.tickets.find(t => String(t.ticketNumber).trim().toLowerCase() === String(ticketNumberId).trim().toLowerCase());
    if (!ticket) return;

    let iframe = document.getElementById('rapidboy-print-iframe');
    if (iframe) iframe.remove();

    iframe = document.createElement('iframe');
    iframe.id = 'rapidboy-print-iframe';
    iframe.style.cssText = 'position:fixed; right:0; bottom:0; width:0; height:0; border:0; visibility:hidden;';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8"><title>A4 JobSheet - ${ticket.ticketNumber}</title>
        <style>
          @page { size: A4 portrait; margin: 10mm; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1E293B; line-height: 1.4; margin: 0; padding: 0; }
          .sheet-container { width: 100%; border: 1.5px solid #CBD5E1; border-radius: 8px; padding: 18px; box-sizing: border-box; background: #FFFFFF; }
          .header-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; border-bottom: 2px solid #2563EB; padding-bottom: 10px; }
          .header-table td { border: none; vertical-align: middle; }
          .company-title { font-weight: 800; color: #2563EB; margin: 0; }
          .company-subtitle { color: #64748B; margin: 2px 0 0 0; }
          .doc-badge { text-align: right; }
          .doc-badge h3 { margin: 0; color: #0F172A; text-transform: uppercase; }
          .doc-badge p { color: #475569; margin: 2px 0 0 0; }
          .section-title { font-weight: 700; color: #2563EB; text-transform: uppercase; margin: 12px 0 5px 0; border-bottom: 1px solid #E2E8F0; padding-bottom: 3px; }
          .grid-2 { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
          .grid-2 td { width: 50%; border: 1.5px solid #CBD5E1; padding: 8px 10px; vertical-align: top; background: #F8FAFC; }
          .info-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
          .info-table th, .info-table td { border: 1px solid #CBD5E1; padding: 6px 10px; text-align: left; }
          .info-table th { background: #F1F5F9; color: #334155; font-weight: 700; width: 25%; }
          .info-table td { color: #0F172A; }
          .fin-box { width: 100%; border-collapse: collapse; margin-top: 8px; }
          .fin-box td { border: 1px solid #CBD5E1; padding: 8px; text-align: center; background: #EFF6FF; }
          .fin-box td.label { font-weight: 700; color: #475569; display: block; }
          .fin-box td.val { font-weight: 800; color: #0F172A; }
          .terms-box { color: #64748B; margin-top: 12px; border-top: 1px dashed #CBD5E1; padding-top: 6px; }
          .sign-table { width: 100%; border-collapse: collapse; margin-top: 25px; }
          .sign-table td { border: none; width: 50%; text-align: center; color: #475569; padding-top: 20px; }
          .sign-line { border-top: 1px solid #94A3B8; width: 70%; margin: 0 auto; padding-top: 4px; }
        </style>
      </head>
      <body>
        ${generateJobSheetMarkup(ticket, 1.0)}
      </body>
      </html>
    `);
    doc.close();
    setTimeout(() => { iframe.contentWindow.focus(); iframe.contentWindow.print(); }, 350);
  };

  App.UI.printTicketA5Format = function (ticketNumberId) {
    const ticket = App.State.tickets.find(t => String(t.ticketNumber).trim().toLowerCase() === String(ticketNumberId).trim().toLowerCase());
    if (!ticket) return;

    let iframe = document.getElementById('rapidboy-print-iframe');
    if (iframe) iframe.remove();

    iframe = document.createElement('iframe');
    iframe.id = 'rapidboy-print-iframe';
    iframe.style.cssText = 'position:fixed; right:0; bottom:0; width:0; height:0; border:0; visibility:hidden;';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8"><title>A5 JobSheet - ${ticket.ticketNumber}</title>
        <style>
          @page { size: A5 portrait; margin: 6mm; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1E293B; line-height: 1.3; margin: 0; padding: 0; }
          .sheet-container { width: 100%; border: 1.2px solid #CBD5E1; border-radius: 6px; padding: 12px; box-sizing: border-box; background: #FFFFFF; }
          .header-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; border-bottom: 1.5px solid #2563EB; padding-bottom: 8px; }
          .header-table td { border: none; vertical-align: middle; }
          .company-title { font-weight: 800; color: #2563EB; margin: 0; }
          .company-subtitle { color: #64748B; margin: 1px 0 0 0; }
          .doc-badge { text-align: right; }
          .doc-badge h3 { margin: 0; color: #0F172A; text-transform: uppercase; }
          .doc-badge p { color: #475569; margin: 1px 0 0 0; }
          .section-title { font-weight: 700; color: #2563EB; text-transform: uppercase; margin: 8px 0 4px 0; border-bottom: 1px solid #E2E8F0; padding-bottom: 2px; }
          .grid-2 { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
          .grid-2 td { width: 50%; border: 1.2px solid #CBD5E1; padding: 6px 8px; vertical-align: top; background: #F8FAFC; }
          .info-table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
          .info-table th, .info-table td { border: 1px solid #CBD5E1; padding: 4px 6px; text-align: left; }
          .info-table th { background: #F1F5F9; color: #334155; font-weight: 700; width: 25%; }
          .info-table td { color: #0F172A; }
          .fin-box { width: 100%; border-collapse: collapse; margin-top: 6px; }
          .fin-box td { border: 1px solid #CBD5E1; padding: 6px; text-align: center; background: #EFF6FF; }
          .fin-box td.label { font-weight: 700; color: #475569; display: block; }
          .fin-box td.val { font-weight: 800; color: #0F172A; }
          .terms-box { color: #64748B; margin-top: 8px; border-top: 1px dashed #CBD5E1; padding-top: 4px; }
          .sign-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          .sign-table td { border: none; width: 50%; text-align: center; color: #475569; padding-top: 12px; }
          .sign-line { border-top: 1px solid #94A3B8; width: 70%; margin: 0 auto; padding-top: 2px; }
        </style>
      </head>
      <body>
        ${generateJobSheetMarkup(ticket, 0.78)}
      </body>
      </html>
    `);
    doc.close();
    setTimeout(() => { iframe.contentWindow.focus(); iframe.contentWindow.print(); }, 350);
  };

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
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8"><title>Thermal - ${ticket.ticketNumber}</title>
        <style>
          @page { size: 58mm auto; margin: 2mm; }
          body { font-family: 'Courier New', monospace; font-size: 8pt; width: 54mm; margin: 0; padding: 0; color: #000; }
          h3 { text-align: center; font-size: 10pt; margin: 4px 0; }
          .line { border-bottom: 1px dashed #000; margin: 4px 0; }
        </style>
      </head>
      <body>
        <h3>RAPID BOY SERVICE</h3>
        <div style="text-align: center; font-size: 7.5pt;">Thanjavur • Ph: 9677600190</div>
        <div class="line"></div>
        <div><strong>Ticket:</strong> ${ticket.ticketNumber}</div>
        <div><strong>Customer:</strong> ${ticket.customerName}</div>
        <div><strong>Phone:</strong> ${ticket.phoneNumber}</div>
        <div><strong>Device:</strong> ${ticket.deviceType} (${ticket.brand})</div>
        <div class="line"></div>
        <div><strong>Issue:</strong> ${ticket.issue}</div>
        <div><strong>Spare Parts:</strong> ${ticket.sparePartsList || ticket.spareSerial || 'None'}</div>
        <div><strong>Final Cost:</strong> ₹${ticket.finalCost || 0}</div>
        <div><strong>Status:</strong> ${ticket.status}</div>
        <div class="line"></div>
        <div style="text-align: center; font-size: 7pt; margin-top: 4px;">Thank you for your business!</div>
      </body>
      </html>
    `);
    doc.close();
    setTimeout(() => { iframe.contentWindow.focus(); iframe.contentWindow.print(); }, 250);
  };

})(window.RapidBoy);

(function (App) {
  'use strict';

  App.Tickets = App.Tickets || {};

  App.Tickets.renderGrid = function () {
    const gridContainer = document.getElementById('tickets-render-grid');
    if (!gridContainer) return;

    const tickets = App.State.tickets || [];
    const filters = App.State.activeFilters || { searchQuery: "", status: "ALL", technician: "ALL", paymentMethod: "ALL", fromDate: "", toDate: "" };

    const filteredTickets = tickets.filter(t => {
      const q = filters.searchQuery.toLowerCase();
      const matchSearch = !q ||
        (t.ticketNumber && String(t.ticketNumber).toLowerCase().includes(q)) ||
        (t.customerName && String(t.customerName).toLowerCase().includes(q)) ||
        (t.phoneNumber && String(t.phoneNumber).toLowerCase().includes(q)) ||
        (t.serialNumber && String(t.serialNumber).toLowerCase().includes(q));

      const matchStatus = (filters.status === "ALL") || (t.status === filters.status);
      const matchTech = (filters.technician === "ALL") ||
        (t.technician && String(t.technician).split(',').map(s => s.trim()).includes(filters.technician));
      const matchPayment = (filters.paymentMethod === "ALL") ||
        (t.paymentMethod && String(t.paymentMethod).toLowerCase() === filters.paymentMethod.toLowerCase());

      // 📅 Date Filtering Logic (Compares ticket createdDate or inwardDate against From/To filters)
      let matchDate = true;
      if (filters.fromDate || filters.toDate) {
        const rawDateStr = t.createdDate || t.inwardDate || "";
        if (rawDateStr) {
          try {
            const ticketDate = new Date(rawDateStr).toISOString().split('T')[0];
            if (filters.fromDate && ticketDate < filters.fromDate) matchDate = false;
            if (filters.toDate && ticketDate > filters.toDate) matchDate = false;
          } catch (e) {
            // fallback if date parsing fails
          }
        }
      }

      return matchSearch && matchStatus && matchTech && matchPayment && matchDate;
    });

    // 🚀 Sort Tickets (Latest Ticket First based on ticketNumber)
    filteredTickets.sort((a, b) => {
      const numA = parseInt(String(a.ticketNumber || '').replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(String(b.ticketNumber || '').replace(/\D/g, ''), 10) || 0;
      return numB - numA;
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
      else if (ticket.status === 'Repairing' || ticket.status === 'Proceed to Service') badgeClass = 'pill-Repairing';
      else if (ticket.status === 'Ready for Delivery') badgeClass = 'pill-ReadyforDelivery';
      else if (ticket.status === 'Waiting for Parts') badgeClass = 'pill-AwaitingParts';
      else if (ticket.status === 'Cancelled' || ticket.status === 'Return') badgeClass = 'pill-Cancelled';

      const rawTicketNum = ticket.ticketNumber ? String(ticket.ticketNumber).trim() : '';

      let totalPaid = 0;
      let historyArr = [];
      if (ticket.paymentHistory) {
        try {
          historyArr = typeof ticket.paymentHistory === 'string' ? JSON.parse(ticket.paymentHistory) : ticket.paymentHistory;
        } catch (e) { historyArr = []; }
      }
      
      if (historyArr.length === 0 && ticket.advance && parseFloat(ticket.advance) > 0) {
        totalPaid = parseFloat(ticket.advance) || 0;
      } else {
        historyArr.forEach(p => totalPaid += parseFloat(p.amount) || 0);
      }

      const finalCost = parseFloat(ticket.finalCost) || 0;
      const balanceDue = Math.max(0, finalCost - totalPaid);

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
            <span class="node-client-type">${App.Utils.sanitizeHTML(ticket.phoneNumber)} • ${App.Utils.sanitizeHTML(ticket.customerType || 'Customer')}</span>
          </div>

          <div class="node-device-info-row">
            <span class="material-icons-round">laptop</span>
            <span>${App.Utils.sanitizeHTML(ticket.deviceType || 'Hardware')} – ${App.Utils.sanitizeHTML(ticket.brand || '')} ${App.Utils.sanitizeHTML(ticket.model || '')}</span>
          </div>

          <div class="node-financials-footer-row">
            <div>
              <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">FINAL COST</span>
              <span class="node-price-tag" style="color: var(--accent-primary);">₹${finalCost}</span>
            </div>
            <div>
              <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">PAID</span>
              <span class="node-price-tag" style="color: var(--status-emerald);">₹${totalPaid}</span>
            </div>
            <div>
              <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">BALANCE</span>
              <span class="node-price-tag" style="color: var(--status-red);">₹${balanceDue}</span>
            </div>
          </div>

          <div class="form-actions-footer-bar" style="margin-top: 15px; padding-top: 12px; justify-content: flex-end; gap: 8px;">
            <button class="btn-icon-round" title="View Audit Lifecycle" onclick="window.RapidBoy.Timeline.showTicketTimelineModal('${rawTicketNum}')">
              <span class="material-icons-round" style="font-size: 1.1rem;">history</span>
            </button>
            <button class="btn-icon-round" title="Edit Work Order" onclick="window.RapidBoy.Form.loadTicketIntoEditorForm('${rawTicketNum}')">
              <span class="material-icons-round" style="font-size: 1.1rem;">edit</span>
            </button>
            <button class="btn-icon-round" title="Print Job Sheet / Receipt" onclick="window.RapidBoy.UI.showPrintOptionsModal('${rawTicketNum}')">
              <span class="material-icons-round" style="font-size: 1.1rem; color: var(--accent-primary);">print</span>
            </button>
            <button class="btn-icon-round" title="Share WhatsApp Message" onclick="window.RapidBoy.UI.shareTicketToWhatsApp('${rawTicketNum}')">
              <span class="material-icons-round" style="font-size: 1.1rem; color: #10B981;">share</span>
            </button>
          </div>
        </div>
      `;
    });

    gridContainer.innerHTML = compiledGridHtml;
  };

})(window.RapidBoy);

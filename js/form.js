/**
 * Rapid Boy Service Manager Pro V4.5 - Form Engine & Issue Completion Tracker
 * Interactive Strikethrough Checklist with Min/Max Estimation, Accessories Serial S/N, & Dynamic Payment Logic
 * Fully Complete - Production Ready [2026]
 */

window.RapidBoy = window.RapidBoy || {};

(function (App) {
  'use strict';

  App.Form = App.Form || {};

  let operationalIssuesCollection = [];

  App.Form.init = function () {
    console.log("🚀 Rapid Boy Form Engine V4.5 Active...");

    const form = document.getElementById('master-ticket-operational-form');
    if (form) {
      const newForm = form.cloneNode(true);
      form.parentNode.replaceChild(newForm, form);

      const activeForm = document.getElementById('master-ticket-operational-form');
      activeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        App.Form.handleFormSubmission();
      });

      activeForm.addEventListener('reset', () => {
        operationalIssuesCollection = [];
        App.Form.renderDynamicIssuesChecklist();
        App.Form.togglePaymentDynamicFields();
        const spareContainer = document.getElementById('dynamic-spare-parts-container');
        if (spareContainer) spareContainer.innerHTML = '';
        const accSerialContainer = document.getElementById('dynamic-accessory-serial-container');
        if (accSerialContainer) accSerialContainer.innerHTML = '';
      });
    }

    const paymentSelect = document.getElementById('form-payment-method');
    if (paymentSelect) {
      paymentSelect.addEventListener('change', App.Form.togglePaymentDynamicFields);
      App.Form.togglePaymentDynamicFields();
    }

    const addIssueBtn = document.getElementById('add-issue-node-trigger');
    const issueInput = document.getElementById('custom-issue-input-field');
    const minCostInput = document.getElementById('custom-issue-min-cost-field');
    const maxCostInput = document.getElementById('custom-issue-max-cost-field');

    if (addIssueBtn && issueInput) {
      addIssueBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const val = issueInput.value.trim();
        const minVal = parseFloat(minCostInput?.value) || 0;
        const maxVal = parseFloat(maxCostInput?.value) || 0;

        if (val) {
          operationalIssuesCollection.push({ text: val, minCost: minVal, maxCost: maxVal, isDone: false });
          issueInput.value = "";
          if (minCostInput) minCostInput.value = "";
          if (maxCostInput) maxCostInput.value = "";
          App.Form.renderDynamicIssuesChecklist();
        }
      });
    }

    const addSpareBtn = document.getElementById('add-spare-row-btn');
    if (addSpareBtn) {
      addSpareBtn.addEventListener('click', (e) => {
        e.preventDefault();
        App.Form.addSparePartRow();
      });
    }

    const addAccSerialBtn = document.getElementById('add-accessory-serial-row-btn');
    if (addAccSerialBtn) {
      addAccSerialBtn.addEventListener('click', (e) => {
        e.preventDefault();
        App.Form.addAccessorySerialRow();
      });
    }

    App.Form.setupCustomerAutoSuggest();
  };

  App.Form.togglePaymentDynamicFields = function () {
    const paymentSelect = document.getElementById('form-payment-method');
    const cashWrapper = document.getElementById('wrapper-cash-receiver');
    const upiWrapper = document.getElementById('wrapper-upi-qr-type');

    if (!paymentSelect) return;
    const mode = paymentSelect.value;

    if (mode === 'Cash') {
      if (cashWrapper) cashWrapper.style.display = 'block';
      if (upiWrapper) upiWrapper.style.display = 'none';
    } else if (mode === 'GPay / UPI') {
      if (cashWrapper) cashWrapper.style.display = 'none';
      if (upiWrapper) upiWrapper.style.display = 'block';
    } else {
      if (cashWrapper) cashWrapper.style.display = 'none';
      if (upiWrapper) upiWrapper.style.display = 'none';
    }
  };

  App.Form.addSparePartRow = function (nameVal = "", costVal = "") {
    const container = document.getElementById('dynamic-spare-parts-container');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'spare-part-row-item';
    row.style.cssText = "display: flex; gap: 10px; align-items: center;";
    row.innerHTML = `
      <input type="text" placeholder="Spare Part Name / Number" value="${App.Utils.sanitizeHTML(nameVal)}" class="spare-item-input" style="flex: 2; background: rgba(5,7,12,0.5); border: 1px solid var(--border-glass); border-radius: 10px; padding: 10px 14px; color: var(--text-main); font-size: 0.85rem; outline: none;">
      <input type="number" placeholder="Cost (₹)" value="${costVal || ''}" class="spare-item-cost" min="0" style="flex: 1; background: rgba(5,7,12,0.5); border: 1px solid var(--border-glass); border-radius: 10px; padding: 10px 14px; color: var(--text-main); font-size: 0.85rem; outline: none;">
      <button type="button" class="btn-icon-round" style="color: #ef4444;" onclick="this.parentElement.remove()" title="Remove Spare">
        <span class="material-icons-round" style="font-size: 1rem;">delete</span>
      </button>
    `;
    container.appendChild(row);
  };

  App.Form.addAccessorySerialRow = function (nameVal = "", serialVal = "") {
    const container = document.getElementById('dynamic-accessory-serial-container');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'accessory-serial-row-item';
    row.style.cssText = "display: flex; gap: 10px; align-items: center;";
    row.innerHTML = `
      <input type="text" placeholder="Accessory Name (e.g. Charger)" value="${App.Utils.sanitizeHTML(nameVal)}" class="acc-name-input" style="flex: 1; background: rgba(5,7,12,0.5); border: 1px solid var(--border-glass); border-radius: 10px; padding: 10px 14px; color: var(--text-main); font-size: 0.85rem; outline: none;">
      <input type="text" placeholder="Serial Number (S/N)" value="${App.Utils.sanitizeHTML(serialVal)}" class="acc-serial-input" style="flex: 1; background: rgba(5,7,12,0.5); border: 1px solid var(--border-glass); border-radius: 10px; padding: 10px 14px; color: var(--text-main); font-size: 0.85rem; outline: none;">
      <button type="button" class="btn-icon-round" style="color: #ef4444;" onclick="this.parentElement.remove()" title="Remove">
        <span class="material-icons-round" style="font-size: 1rem;">delete</span>
      </button>
    `;
    container.appendChild(row);
  };

  App.Form.setupCustomerAutoSuggest = function () {
    const nameInput = document.getElementById('form-customer-name');
    const phoneInput = document.getElementById('form-phone-number');

    const createSuggestBox = (inputEl) => {
      if (!inputEl) return null;
      const parentGroup = inputEl.closest('.input-group') || inputEl.parentElement;
      if (!parentGroup) return null;

      let suggestBox = parentGroup.querySelector('.rapidboy-auto-suggest-dropdown');
      if (!suggestBox) {
        suggestBox = document.createElement('div');
        suggestBox.className = 'rapidboy-auto-suggest-dropdown';
        Object.assign(suggestBox.style, {
          position: 'absolute',
          top: '100%',
          left: '0',
          right: '0',
          zIndex: '99999',
          background: '#0f172a',
          color: '#f8fafc',
          border: '1px solid #06b6d4',
          borderRadius: '8px',
          boxShadow: '0 12px 30px rgba(0,0,0,0.85)',
          maxHeight: '220px',
          overflowY: 'auto',
          marginTop: '4px',
          display: 'none'
        });
        parentGroup.style.position = 'relative';
        parentGroup.appendChild(suggestBox);
      }
      return suggestBox;
    };

    const attachSuggestListener = (inputEl) => {
      if (!inputEl) return;
      const suggestBox = createSuggestBox(inputEl);
      if (!suggestBox) return;

      inputEl.addEventListener('input', function () {
        const query = this.value.trim().toLowerCase();
        if (query.length < 2) {
          suggestBox.style.display = 'none';
          return;
        }

        let customerPool = [];
        if (App.State && App.State.tickets && Array.isArray(App.State.tickets)) {
          App.State.tickets.forEach(t => {
            if (t.customerName && t.phoneNumber) {
              customerPool.push({
                customerName: String(t.customerName).trim(),
                phoneNumber: String(t.phoneNumber).trim(),
                whatsAppNumber: String(t.whatsAppNumber || t.phoneNumber).trim(),
                customerType: String(t.customerType || 'Customer').trim(),
                referralPerson: String(t.referralPerson || '').trim()
              });
            }
          });
        }

        const uniqueMap = new Map();
        customerPool.forEach(c => {
          if (c.phoneNumber) uniqueMap.set(c.phoneNumber, c);
        });

        const matches = [];
        uniqueMap.forEach(c => {
          if (c.customerName.toLowerCase().includes(query) || c.phoneNumber.includes(query)) {
            matches.push(c);
          }
        });

        if (matches.length > 0) {
          suggestBox.innerHTML = '';
          matches.slice(0, 6).forEach(c => {
            const item = document.createElement('div');
            Object.assign(item.style, {
              padding: '10px 14px',
              cursor: 'pointer',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              fontSize: '0.85rem'
            });

            item.innerHTML = `
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong style="color:#06b6d4;">${App.Utils.sanitizeHTML(c.customerName)}</strong>
                <span style="font-size:0.75rem; background:rgba(255,255,255,0.08); padding:2px 6px; border-radius:4px; color:#cbd5e1;">${App.Utils.sanitizeHTML(c.customerType)}</span>
              </div>
              <div style="color:#94a3b8; font-size:0.78rem; margin-top:2px;">📞 ${App.Utils.sanitizeHTML(c.phoneNumber)}</div>
            `;

            item.addEventListener('mousedown', (e) => {
              e.preventDefault();
              const nameF = document.getElementById('form-customer-name');
              const phoneF = document.getElementById('form-phone-number');
              const waF = document.getElementById('form-whatsapp-number');
              const typeF = document.getElementById('form-customer-type');
              const refF = document.getElementById('form-referral-person');

              if (nameF) nameF.value = c.customerName;
              if (phoneF) phoneF.value = c.phoneNumber;
              if (waF) waF.value = c.whatsAppNumber || c.phoneNumber;
              if (typeF) typeF.value = c.customerType || 'Customer';
              if (refF) refF.value = c.referralPerson || '';

              suggestBox.style.display = 'none';

              if (App.UI && typeof App.UI.showToast === 'function') {
                App.UI.showToast("Customer Selected", `Loaded profile for ${c.customerName}`, "info");
              }
            });

            suggestBox.appendChild(item);
          });

          suggestBox.style.display = 'block';
        } else {
          suggestBox.style.display = 'none';
        }
      });

      inputEl.addEventListener('blur', () => {
        setTimeout(() => { suggestBox.style.display = 'none'; }, 200);
      });

      inputEl.addEventListener('focus', function () {
        if (this.value.trim().length >= 2) {
          this.dispatchEvent(new Event('input'));
        }
      });
    };

    attachSuggestListener(nameInput);
    attachSuggestListener(phoneInput);
  };

  App.Form.renderDynamicIssuesChecklist = function () {
    const mount = document.getElementById('dynamic-issues-checklist-mount-point');
    if (!mount) return;

    let totalMinEst = 0;
    let totalMaxEst = 0;

    if (operationalIssuesCollection.length === 0) {
      mount.innerHTML = `<div style="color:var(--text-muted); font-size:0.85rem; font-style:italic;">No active issue profiles attached yet.</div>`;
    } else {
      let html = "";
      operationalIssuesCollection.forEach((issObj, index) => {
        totalMinEst += Number(issObj.minCost || 0);
        totalMaxEst += Number(issObj.maxCost || 0);

        const textStyle = issObj.isDone ? "text-decoration: line-through; color: #64748b; font-style: italic;" : "color: #cbd5e1;";
        const statusBadge = issObj.isDone
          ? `<span style="background: rgba(16, 185, 129, 0.15); color: #10b981; font-size: 0.72rem; padding: 2px 8px; border-radius: 4px; font-weight: 700; margin-left: 8px;">✓ COMPLETED</span>`
          : `<span style="background: rgba(245, 158, 11, 0.12); color: #f59e0b; font-size: 0.72rem; padding: 2px 8px; border-radius: 4px; font-weight: 600; margin-left: 8px;">PENDING</span>`;

        html += `
          <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); padding:8px 12px; border-radius:6px; margin-bottom:6px; border: 1px solid rgba(255,255,255,0.05);">
            <div style="cursor: pointer; flex: 1; display: flex; align-items: center; justify-content: space-between;" onclick="window.RapidBoy.Form.toggleIssueCompletion(${index})">
              <div style="display: flex; align-items: center;">
                <span class="material-icons-round" style="font-size: 1.1rem; margin-right: 8px; color: ${issObj.isDone ? '#10b981' : '#64748b'};">
                  ${issObj.isDone ? 'check_box' : 'check_box_outline_blank'}
                </span>
                <span style="font-size:0.88rem; ${textStyle}">${App.Utils.sanitizeHTML(issObj.text)}</span>${statusBadge}
              </div>
              <span style="font-size:0.8rem; color: var(--accent-cyan); font-family: monospace; margin-right: 12px;">₹${issObj.minCost || 0} - ₹${issObj.maxCost || 0}</span>
            </div>
            <button type="button" style="background:none; border:none; color:#ef4444; cursor:pointer; margin-left: 10px;" onclick="window.RapidBoy.Form.removeIssue(${index})">
              <span class="material-icons-round" style="font-size:1.1rem;">delete</span>
            </button>
          </div>
        `;
      });
      mount.innerHTML = html;
    }

    const estFromField = document.getElementById('form-estimation-from');
    const estToField = document.getElementById('form-estimation-to');
    if (estFromField) estFromField.value = totalMinEst;
    if (estToField) estToField.value = totalMaxEst;
  };

  App.Form.toggleIssueCompletion = function (idx) {
    if (operationalIssuesCollection[idx]) {
      operationalIssuesCollection[idx].isDone = !operationalIssuesCollection[idx].isDone;
      App.Form.renderDynamicIssuesChecklist();
    }
  };

  App.Form.removeIssue = function (idx) {
    operationalIssuesCollection.splice(idx, 1);
    App.Form.renderDynamicIssuesChecklist();
  };

  App.Form.handleFormSubmission = async function () {
    const modeEl = document.getElementById('form-operation-mode');
    const mode = modeEl ? modeEl.value : "CREATE";
    const ticketIdEl = document.getElementById('form-ticket-id-hidden');
    const ticketId = ticketIdEl ? ticketIdEl.value : "";

    const finalCost = parseFloat(document.getElementById('form-final-cost')?.value) || 0;
    const advance = parseFloat(document.getElementById('form-advance')?.value) || 0;
    const paymentMethod = document.getElementById('form-payment-method') ? document.getElementById('form-payment-method').value : 'Cash';
    const cashReceiver = (paymentMethod === 'Cash' && document.getElementById('form-cash-receiver')) ? document.getElementById('form-cash-receiver').value : '';
    const upiQrType = (paymentMethod === 'GPay / UPI' && document.getElementById('form-upi-qr-type')) ? document.getElementById('form-upi-qr-type').value : '';

    const sparePartsList = [];
    const spareContainer = document.getElementById('dynamic-spare-parts-container');
    if (spareContainer) {
      spareContainer.querySelectorAll('.spare-part-row-item').forEach(row => {
        const nameInput = row.querySelector('.spare-item-input');
        const costInput = row.querySelector('.spare-item-cost');
        if (nameInput && nameInput.value.trim()) {
          sparePartsList.push(`${nameInput.value.trim()}${costInput && costInput.value ? ' (₹' + costInput.value + ')' : ''}`);
        }
      });
    }

    const accSerialList = [];
    const accSerialContainer = document.getElementById('dynamic-accessory-serial-container');
    if (accSerialContainer) {
      accSerialContainer.querySelectorAll('.accessory-serial-row-item').forEach(row => {
        const nameInput = row.querySelector('.acc-name-input');
        const serialInput = row.querySelector('.acc-serial-input');
        if (nameInput && nameInput.value.trim()) {
          accSerialList.push(`${nameInput.value.trim()}: S/N ${serialInput ? serialInput.value.trim() : 'N/A'}`);
        }
      });
    }

    const accessories = [];
    const accContainer = document.getElementById('accessory-checkbox-matrix-grid');
    if (accContainer) {
      accContainer.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => accessories.push(cb.value));
    }

    const technicians = [];
    const techContainer = document.getElementById('technician-checkbox-matrix-grid');
    if (techContainer) {
      techContainer.querySelectorAll('input[name="tech-nodes"]:checked').forEach(cb => technicians.push(cb.value));
    }

    const formattedIssues = operationalIssuesCollection.map(i => {
      const prefix = i.isDone ? '[DONE] ' : '';
      const costInfo = ` (${i.minCost || 0}-${i.maxCost || 0})`;
      return `${prefix}${i.text}${costInfo}`;
    }).join(', ');

    let existingTimeline = [];
    if (mode === "UPDATE" && ticketId) {
      const existingTicket = (App.State.tickets || []).find(t => String(t.ticketNumber).trim().toLowerCase() === String(ticketId).trim().toLowerCase());
      if (existingTicket && existingTicket.timeline) {
        try {
          existingTimeline = typeof existingTicket.timeline === 'string' ? JSON.parse(existingTicket.timeline) : existingTicket.timeline;
        } catch (e) {
          existingTimeline = [];
        }
      }
    }

    const newStatus = document.getElementById('form-status')?.value || "Pending";
    const statusMemo = document.getElementById('form-status-notes')?.value.trim() || "Status or ticket updated.";
    const currentUsername = (App.State.user && App.State.user.username) ? App.State.user.username : "System Operator";

    let previousStatus = "Pending";
    if (mode === "UPDATE" && ticketId) {
      const existingTicket = (App.State.tickets || []).find(t => String(t.ticketNumber).trim().toLowerCase() === String(ticketId).trim().toLowerCase());
      if (existingTicket) previousStatus = existingTicket.status || "Pending";
    }

    const nowObj = new Date();
    const dateStr = nowObj.toLocaleDateString('en-IN');
    const timeStr = nowObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const auditEntry = {
      username: currentUsername,
      date: dateStr,
      time: timeStr,
      transition: mode === "UPDATE" ? `${previousStatus} → ${newStatus}` : `Created as ${newStatus}`,
      notes: statusMemo
    };
    existingTimeline.unshift(auditEntry);

    const payload = {
      ticketNumber: ticketId,
      customerType: document.getElementById('form-customer-type')?.value || "Customer",
      customerName: document.getElementById('form-customer-name')?.value.trim() || "",
      phoneNumber: document.getElementById('form-phone-number')?.value.trim() || "",
      whatsAppNumber: document.getElementById('form-whatsapp-number')?.value.trim() || document.getElementById('form-phone-number')?.value.trim() || "",
      referralPerson: document.getElementById('form-referral-person')?.value.trim() || "",
      deviceType: document.getElementById('form-device-type')?.value || "Laptop",
      brand: document.getElementById('form-brand')?.value.trim() || "",
      model: document.getElementById('form-model')?.value.trim() || "",
      serialNumber: document.getElementById('form-serial-number')?.value.trim() || "",
      spareSerial: sparePartsList.length > 0 ? sparePartsList.join(', ') : (document.getElementById('form-spare-serial')?.value.trim() || ""),
      accessorySerial: accSerialList.length > 0 ? accSerialList.join(' | ') : (document.getElementById('form-accessory-serial')?.value.trim() || ""),
      status: newStatus,
      deliveryDate: document.getElementById('form-delivery-date')?.value || "2–7 Working Days",
      estimationFrom: parseFloat(document.getElementById('form-estimation-from')?.value) || 0,
      estimationTo: parseFloat(document.getElementById('form-estimation-to')?.value) || 0,
      finalCost: finalCost,
      advance: advance,
      paymentMethod: paymentMethod,
      cashReceiver: cashReceiver,
      upiQrType: upiQrType,
      issue: formattedIssues,
      remarks: document.getElementById('form-remarks')?.value.trim() || "",
      privateTechNotes: document.getElementById('form-private-tech-notes')?.value.trim() || "",
      statusNotes: statusMemo,
      accessories: accessories.join(', '),
      technician: technicians.join(', '),
      timeline: JSON.stringify(existingTimeline)
    };

    try {
      await App.Utils.executeSecureOperation(async () => {
        const activeDriver = window.API || window.Api || App.Api;
        const actionTarget = (mode === "UPDATE") ? "updateTicket" : "createTicket";
        const res = await activeDriver.transmitPayload({ action: actionTarget, ...payload });

        if (res && res.status === "success") {
          App.UI.showToast("Success", "Work order saved successfully.", "success");
          document.getElementById('master-ticket-operational-form')?.reset();
          operationalIssuesCollection = [];
          App.Form.renderDynamicIssuesChecklist();
          App.Form.togglePaymentDynamicFields();
          const spareContainerReset = document.getElementById('dynamic-spare-parts-container');
          if (spareContainerReset) spareContainerReset.innerHTML = '';
          const accSerialContainerReset = document.getElementById('dynamic-accessory-serial-container');
          if (accSerialContainerReset) accSerialContainerReset.innerHTML = '';

          await App.UI.refreshGlobalDataStream(true);

          if (App.Navigation && typeof App.Navigation.navigateTo === 'function') {
            App.Navigation.navigateTo('view-tickets-list');
          }
        } else {
          throw new Error(res.message || "Failed to save work order.");
        }
      }, "Saving ticket to spreadsheet...");
    } catch (e) {
      console.error("Form submit error:", e);
    }
  };

  App.Form.loadTicketIntoEditorForm = function (ticketNumberId) {
    const cleanSearchId = String(ticketNumberId).trim().toLowerCase();
    const ticket = App.State.tickets.find(t => String(t.ticketNumber).trim().toLowerCase() === cleanSearchId);

    if (!ticket) return;

    try {
      if (App.Navigation && typeof App.Navigation.navigateTo === 'function') {
        App.Navigation.navigateTo('view-ticket-form');
      }

      const heading = document.getElementById('ticket-form-title-heading');
      if (heading) heading.innerText = `Update Work Order [ ${ticket.ticketNumber} ]`;

      const opMode = document.getElementById('form-operation-mode');
      if (opMode) opMode.value = "UPDATE";

      const ticketHidden = document.getElementById('form-ticket-id-hidden');
      if (ticketHidden) ticketHidden.value = ticket.ticketNumber;

      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val !== undefined && val !== null ? val : "";
      };

      setVal('form-customer-type', ticket.customerType || "Customer");
      setVal('form-customer-name', ticket.customerName || "");
      setVal('form-phone-number', ticket.phoneNumber || "");
      setVal('form-whatsapp-number', ticket.whatsAppNumber || ticket.phoneNumber || "");
      setVal('form-referral-person', ticket.referralPerson || "");

      setVal('form-device-type', ticket.deviceType || "Laptop");
      setVal('form-brand', ticket.brand || "");
      setVal('form-model', ticket.model || "");
      setVal('form-serial-number', ticket.serialNumber || "");
      setVal('form-accessory-serial', ticket.accessorySerial || "");

      const accSerialContainer = document.getElementById('dynamic-accessory-serial-container');
      if (accSerialContainer) {
        accSerialContainer.innerHTML = "";
        if (ticket.accessorySerial && ticket.accessorySerial.includes('|')) {
          const accSerials = String(ticket.accessorySerial).split('|').map(s => s.trim());
          accSerials.forEach(acc => {
            const parts = acc.split(': S/N');
            if (parts.length === 2) {
              App.Form.addAccessorySerialRow(parts[0].trim(), parts[1].trim());
            } else if (acc) {
              App.Form.addAccessorySerialRow(acc, "");
            }
          });
        }
      }

      const spareContainer = document.getElementById('dynamic-spare-parts-container');
      if (spareContainer) {
        spareContainer.innerHTML = "";
        if (ticket.spareSerial) {
          const parts = String(ticket.spareSerial).split(',').map(s => s.trim());
          parts.forEach(p => {
            if (p) App.Form.addSparePartRow(p, "");
          });
        }
      }

      setVal('form-status', ticket.status || "Pending");
      setVal('form-delivery-date', ticket.deliveryDate || "2–7 Working Days");

      setVal('form-estimation-from', ticket.estimationFrom || 0);
      setVal('form-estimation-to', ticket.estimationTo || 0);
      setVal('form-final-cost', ticket.finalCost || 0);
      setVal('form-advance', ticket.advance || 0);

      setVal('form-payment-method', ticket.paymentMethod || "Cash");
      App.Form.togglePaymentDynamicFields();

      setVal('form-cash-receiver', ticket.cashReceiver || "Anand");
      setVal('form-upi-qr-type', ticket.upiQrType || "Rapidboy QR");

      setVal('form-remarks', ticket.remarks || "");
      setVal('form-private-tech-notes', ticket.privateTechNotes || "");
      setVal('form-status-notes', ticket.statusNotes || "");

      if (ticket.issue) {
        operationalIssuesCollection = String(ticket.issue).split(',').map(s => {
          let clean = s.trim();
          let isDone = false;
          if (clean.startsWith('[DONE]')) {
            isDone = true;
            clean = clean.replace('[DONE]', '').trim();
          }

          let minCost = 0;
          let maxCost = 0;
          let text = clean;

          const match = clean.match(/\(([\d]+)-([\d]+)\)$/);
          if (match) {
            minCost = parseFloat(match[1]) || 0;
            maxCost = parseFloat(match[2]) || 0;
            text = clean.replace(/\([\d]+-[\d]+\)$/, '').trim();
          }

          return { text: text, minCost: minCost, maxCost: maxCost, isDone: isDone };
        }).filter(item => item.text.length > 0);
      } else {
        operationalIssuesCollection = [];
      }
      App.Form.renderDynamicIssuesChecklist();

      const form = document.getElementById('master-ticket-operational-form');
      if (form) {
        form.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);

        if (ticket.accessories) {
          const accs = String(ticket.accessories).split(',').map(s => s.trim());
          form.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            if (accs.includes(cb.value)) cb.checked = true;
          });
        }

        if (ticket.technician) {
          const techs = String(ticket.technician).split(',').map(s => s.trim());
          form.querySelectorAll('input[name="tech-nodes"]').forEach(cb => {
            if (techs.includes(cb.value)) cb.checked = true;
          });
        }
      }

    } catch (err) {
      console.error("Critical Exception in loadTicketIntoEditorForm:", err);
    }
  };

})(window.RapidBoy);

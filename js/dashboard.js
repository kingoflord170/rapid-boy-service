/**
 * Rapid Boy Service Manager Pro V4.6 - Executive Telemetry & Dashboard Engine
 * Computes Financial Metrics using paymentHistory JSON, Semantic Status Counters, and Navigation Filters
 */

window.RapidBoy = window.RapidBoy || {};

(function (App) {
  'use strict';

  App.Dashboard = App.Dashboard || {};

  /**
   * Initialize Dashboard Events & Telemetry Handlers
   */
  App.Dashboard.init = function () {
    console.log("📊 Rapid Boy Dashboard V4.6 Active...");
    App.Dashboard.refreshStats();
  };

  /**
   * Refresh and Render Dashboard Financial Cards & Status Badges based on paymentHistory
   */
  App.Dashboard.refreshStats = function () {
    const tickets = App.State.tickets || [];

    let totalRevenue = 0;
    let pendingCollection = 0;
    let todayCollection = 0;

    const todayStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    // Status Counter Store matching V4.6 semantics
    const statusCounts = {
      "Pending": 0,
      "Waiting for Confirmation": 0,
      "Proceed to Service": 0,
      "Checking": 0,
      "Waiting for Parts": 0,
      "Repairing": 0,
      "Testing": 0,
      "Ready for Delivery": 0,
      "Delivered": 0,
      "Return": 0,
      "Cancelled": 0
    };

    tickets.forEach(ticket => {
      const finalCost = parseFloat(ticket.finalCost) || 0;
      totalRevenue += finalCost;

      // Calculate total paid and balance accurately from paymentHistory array
      let totalPaid = 0;
      let historyArray = [];
      
      if (ticket.paymentHistory) {
        try {
          historyArray = typeof ticket.paymentHistory === 'string' ? JSON.parse(ticket.paymentHistory) : ticket.paymentHistory;
        } catch (e) {
          historyArray = [];
        }
      } else if (ticket.advance && ticket.advance > 0) {
        // Fallback for legacy records
        totalPaid = parseFloat(ticket.advance) || 0;
      }

      historyArray.forEach(p => {
        const pAmt = parseFloat(p.amount) || 0;
        totalPaid += pAmt;

        // Check if payment was made today
        if (p.dateTime && p.dateTime.toLowerCase().includes(todayStr.toLowerCase())) {
          todayCollection += pAmt;
        }
      });

      const balanceDue = Math.max(0, finalCost - totalPaid);
      pendingCollection += balanceDue;

      // Count Statuses
      const statusKey = ticket.status ? ticket.status.trim() : "Pending";
      if (statusCounts.hasOwnProperty(statusKey)) {
        statusCounts[statusKey]++;
      } else {
        statusCounts["Pending"]++;
      }
    });

    // Update Financial Cards
    const revNode = document.getElementById('stat-total-revenue');
    const pendNode = document.getElementById('stat-pending-collection');
    const todayNode = document.getElementById('stat-today-collection');

    if (revNode) revNode.innerText = App.Utils.formatCurrency(totalRevenue);
    if (pendNode) pendNode.innerText = App.Utils.formatCurrency(pendingCollection);
    if (todayNode) todayNode.innerText = App.Utils.formatCurrency(todayCollection);

    // Render Status Counters Grid
    App.Dashboard.renderStatusCounters(statusCounts);
  };

  /**
   * Render Interactive Status Badges with Click-to-Filter Navigation
   */
  App.Dashboard.renderStatusCounters = function (counts) {
    const mountNode = document.getElementById('dashboard-status-counters-mount');
    if (!mountNode) return;

    const statusConfig = [
      { key: "Pending", label: "Pending", colorClass: "text-orange" },
      { key: "Waiting for Confirmation", label: "Waiting Conf.", colorClass: "text-amber" },
      { key: "Proceed to Service", label: "Proceed Service", colorClass: "text-blue" },
      { key: "Checking", label: "Checking", colorClass: "text-blue" },
      { key: "Waiting for Parts", label: "Awaiting Parts", colorClass: "text-amber" },
      { key: "Repairing", label: "Repairing", colorClass: "text-primary" },
      { key: "Testing", label: "Testing", colorClass: "text-blue" },
      { key: "Ready for Delivery", label: "Ready Delivery", colorClass: "text-emerald" },
      { key: "Delivered", label: "Fixed / Delivered", colorClass: "text-emerald" },
      { key: "Return", label: "Return", colorClass: "text-red" },
      { key: "Cancelled", label: "Cancelled", colorClass: "text-red" }
    ];

    let html = "";
    statusConfig.forEach(item => {
      const count = counts[item.key] || 0;
      html += `
        <div class="stat-card" onclick="window.RapidBoy.Dashboard.filterByStatus('${item.key}')">
          <div class="stat-count ${item.colorClass}">${count}</div>
          <div class="stat-label">${item.label}</div>
        </div>
      `;
    });

    mountNode.innerHTML = html;
  };

  /**
   * Filter Ticket Registry View directly by clicking a status card
   */
  App.Dashboard.filterByStatus = function (statusKey) {
    App.State.activeFilters.status = statusKey;

    const dropdown = document.getElementById('status-filter-dropdown');
    if (dropdown) dropdown.value = statusKey;

    if (App.Navigation && typeof App.Navigation.navigateTo === 'function') {
      App.Navigation.navigateTo('view-tickets-list');
    }

    if (App.Tickets && typeof App.Tickets.renderGrid === 'function') {
      App.Tickets.renderGrid();
    }
  };

})(window.RapidBoy);

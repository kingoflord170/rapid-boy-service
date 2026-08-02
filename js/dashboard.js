/**
 * Rapid Boy Service Manager Pro V4.5 - Executive Telemetry & Dashboard Engine
 * Computes Financial Metrics, Status Counters (including Return status), and Navigation Filters
 * Fully Complete - Production Ready [2026]
 */

window.RapidBoy = window.RapidBoy || {};

(function (App) {
  'use strict';

  App.Dashboard = App.Dashboard || {};

  /**
   * Initialize Dashboard Events & Telemetry Handlers
   */
  App.Dashboard.init = function () {
    console.log("📊 Rapid Boy Dashboard V4.5 Active...");
    App.Dashboard.refreshStats();
  };

  /**
   * Refresh and Render Dashboard Financial Cards & Status Badges
   */
  App.Dashboard.refreshStats = function () {
    const tickets = App.State.tickets || [];

    let totalRevenue = 0;
    let pendingCollection = 0;
    let todayCollection = 0;

    const todayStr = new Date().toISOString().split('T')[0];

    // Status Counter Store including 'Return'
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
      const advance = parseFloat(ticket.advance) || 0;
      const balance = parseFloat(ticket.balance) || 0;
      const actualPaid = parseFloat(ticket.actualAmountPaid) || 0;

      totalRevenue += finalCost;
      pendingCollection += balance;

      // Calculate today's collection
      const ticketDateStr = ticket.updatedTime ? ticket.updatedTime.toString().split(' ')[0] : '';
      if (ticketDateStr === todayStr) {
        todayCollection += actualPaid;
      }

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
      { key: "Waiting for Confirmation", label: "Waiting Conf.", colorClass: "text-yellow" },
      { key: "Proceed to Service", label: "Proceed Service", colorClass: "text-cyan" },
      { key: "Checking", label: "Checking", colorClass: "text-blue" },
      { key: "Waiting for Parts", label: "Waiting Parts", colorClass: "text-purple" },
      { key: "Repairing", label: "Repairing", colorClass: "text-magenta" },
      { key: "Testing", label: "Testing", colorClass: "text-teal" },
      { key: "Ready for Delivery", label: "Ready Delivery", colorClass: "text-green" },
      { key: "Delivered", label: "Delivered", colorClass: "text-muted" },
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

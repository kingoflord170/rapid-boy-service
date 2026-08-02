/**
 * Rapid Boy Service Manager Pro V4.5 - Frontend API Bridge Driver
 * Intercepts CORS & Preflight Redirections to communicate with Google Apps Script
 */

window.RapidBoy = window.RapidBoy || {};

(function (App) {
    'use strict';

    App.Api = App.Api || {};

    // Replace with your active Google Apps Script Web App Deployment URL
    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxIPn0hlUQDiOuTglXDFPikdvpynHjmBdoFJke00oDNatfHljrRpKnTtpROqyf_KFjQxA/exec";

    /**
     * Generic secure POST payload transmission wrapper
     */
    App.Api.transmitPayload = async function (payloadData) {
        if (!WEB_APP_URL || WEB_APP_URL === "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE") {
            console.warn("⚠️ API Warning: Web App URL is not set in js/api.js!");
        }

        // Attach active session credentials if available
        if (App.Auth && typeof App.Auth.getSystemVerificationCredentials === 'function') {
            const creds = App.Auth.getSystemVerificationCredentials();
            payloadData.authUsername = creds.u || payloadData.authUsername;
            payloadData.authPassword = creds.p || payloadData.authPassword;
        }

        try {
            const response = await fetch(WEB_APP_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain;charset=utf-8"
                },
                body: JSON.stringify(payloadData)
            });

            if (!response.ok) {
                throw new Error(`HTTP Transport Error: ${response.status}`);
            }

            const rawText = await response.text();
            let jsonResult;
            try {
                jsonResult = JSON.parse(rawText);
            } catch (parseErr) {
                throw new Error("Invalid response string received from backend endpoint.");
            }

            return jsonResult;
        } catch (err) {
            console.error("API Transmission Exception:", err);
            throw err;
        }
    };

    App.Api.getDashboardData = async function () {
        return await App.Api.transmitPayload({ action: 'getDashboardData' });
    };

    App.Api.searchCustomerSuggestions = async function (searchQuery) {
        return await App.Api.transmitPayload({ action: 'searchCustomerSuggestions', query: searchQuery });
    };

})(window.RapidBoy);

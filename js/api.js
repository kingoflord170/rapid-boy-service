/**
 * Rapid Boy Service Manager Pro V4.6 - Frontend API Bridge Driver
 * Intercepts CORS & Preflight Redirections to communicate with Google Apps Script
 */

window.RapidBoy = window.RapidBoy || {};

(function (App) {
    'use strict';

    App.Api = App.Api || {};

    // Replace with your active Google Apps Script Web App Deployment URL
    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw8waBGIp4Y4x4CALAnKdcaIOzTxacHjOUQRocL9KtdgK76aMQInWD1hNPUMHsiaZztKA/exec";

    // Request Timeout configuration (15 seconds)
    const API_TIMEOUT_MS = 15000;

    /**
     * Generic secure POST payload transmission wrapper with safety cloning, timeout, and robust parsing
     */
    App.Api.transmitPayload = async function (payloadData = {}) {
        if (!WEB_APP_URL || WEB_APP_URL === "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE") {
            throw new Error("API Critical Error: Web App URL is not set in js/api.js!");
        }

        // Clone payload safely to avoid direct object mutation side effects
        const clonedPayload = { ...payloadData };

        // Attach active session credentials safely if available
        if (App.Auth && typeof App.Auth.getSystemVerificationCredentials === 'function') {
            const creds = App.Auth.getSystemVerificationCredentials();
            if (creds && typeof creds === 'object') {
                clonedPayload.authUsername = creds.u || clonedPayload.authUsername || "";
                clonedPayload.authPassword = creds.p || clonedPayload.authPassword || "";
            }
        }

        // Setup AbortController for network timeout handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

        try {
            const response = await fetch(WEB_APP_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain;charset=utf-8"
                },
                body: JSON.stringify(clonedPayload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP Transport Error: Status ${response.status} (${response.statusText})`);
            }

            const rawText = await response.text();
            
            // Check if response accidentally returned HTML (e.g. Google Apps Script permission or script error page)
            if (!rawText || rawText.trim().startsWith("<!DOCTYPE html>") || rawText.trim().startsWith("<html")) {
                console.error("API Received HTML Response instead of JSON:", rawText.substring(0, 200));
                throw new Error("Backend endpoint returned an HTML error/login page. Please check Apps Script deployment permissions.");
            }

            let jsonResult;
            try {
                jsonResult = JSON.parse(rawText);
            } catch (parseErr) {
                console.error("JSON Parse Exception. Raw Text Received:", rawText);
                throw new Error("Invalid response format received from backend endpoint (Non-JSON).");
            }

            return jsonResult;
        } catch (err) {
            clearTimeout(timeoutId);
            if (err.name === 'AbortError') {
                console.error("API Request Timeout Exception after", API_TIMEOUT_MS, "ms");
                throw new Error("Request timed out. Backend server took too long to respond.");
            }
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

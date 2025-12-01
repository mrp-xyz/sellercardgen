// Configuration for API services
// IMPORTANT: In production, API keys should be stored securely on a backend server
// This is for prototype/development purposes only

const API_CONFIG = {
    removeBg: {
        apiKey: 'phmT66okBvFDcxrR4xsNhSiz',
        endpoint: 'https://api.remove.bg/v1.0/removebg',
        // Free tier: 50 calls/month
        // Paid plans: https://www.remove.bg/pricing
    }
};

// Export for use in other files
window.API_CONFIG = API_CONFIG;


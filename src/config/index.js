export const config = {
    api: {
        baseURL: process.env.REACT_APP_API_URL,
        timeout: 10000,
    },
    auth: {
        token: process.env.NEXT_PUBLIC_AUTH_TOKEN || '',
    },
    storage: {
        localStorageKey: process.env.NEXT_PUBLIC_STORAGE_KEY || 'app_storage',
    },
    thirdParty: {
        googleMapsAPIKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        stripePublicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '',
    },
    environment: {
        isProduction: process.env.NODE_ENV === 'production',
        isDevelopment: process.env.NODE_ENV === 'development',
    },
    features: {
        enableFeatureX: process.env.NEXT_PUBLIC_ENABLE_FEATURE_X === 'true',
        enableFeatureY: process.env.NEXT_PUBLIC_ENABLE_FEATURE_Y === 'true',
    },
    logging: {
        level: process.env.NEXT_PUBLIC_LOG_LEVEL || 'info',
        enableDebug: process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true',
    },
    analytics: {
        googleAnalyticsID: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || '',
        mixpanelToken: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || '',
    },
    localization: {
        defaultLanguage: process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'en',
        supportedLanguages: (process.env.NEXT_PUBLIC_SUPPORTED_LANGUAGES || 'en,fr').split(','),
    },
    notifications: {
        enablePushNotifications: process.env.NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS === 'true',
        pushNotificationServiceURL: process.env.NEXT_PUBLIC_PUSH_NOTIFICATION_SERVICE_URL || '',
    },
    security: {
        enableCSRFProtection: process.env.NEXT_PUBLIC_ENABLE_CSRF_PROTECTION === 'true',
        csrfToken: process.env.NEXT_PUBLIC_CSRF_TOKEN || '',
    },
    performance: {
        enableLazyLoading: process.env.NEXT_PUBLIC_ENABLE_LAZY_LOADING === 'true',
        enableCodeSplitting: process.env.NEXT_PUBLIC_ENABLE_CODE_SPLITTING === 'true',
    },
    userInterface: {
        theme: process.env.NEXT_PUBLIC_THEME || 'light',
        enableDarkMode: process.env.NEXT_PUBLIC_ENABLE_DARK_MODE === 'true',
    },
    contentDelivery: {
        enableCDN: process.env.NEXT_PUBLIC_ENABLE_CDN === 'true',
        cdnURL: process.env.NEXT_PUBLIC_CDN_URL || '',
    },
    errorHandling: {
        enableErrorTracking: process.env.NEXT_PUBLIC_ENABLE_ERROR_TRACKING === 'true',
        errorTrackingServiceURL: process.env.NEXT_PUBLIC_ERROR_TRACKING_SERVICE_URL || '',
    },
}

export default config;
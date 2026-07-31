export const COOKIE_CONSENT_STORAGE_KEY = 'lofotenpeaks_cookie_consent_v1';
export const COOKIE_CONSENT_EVENT = 'lofotenpeaks:cookie-settings';
export const COOKIE_CONSENT_VERSION = 1;
export const GOOGLE_ANALYTICS_ID = 'G-X0J3SHQZHV';

function isValidConsent(value) {
  return (
    value &&
    value.version === COOKIE_CONSENT_VERSION &&
    typeof value.analytics === 'boolean' &&
    typeof value.updatedAt === 'string'
  );
}

export function getStoredCookieConsent() {
  try {
    const storedValue = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    const parsedValue = storedValue ? JSON.parse(storedValue) : null;

    return isValidConsent(parsedValue) ? parsedValue : null;
  } catch {
    return null;
  }
}

export function storeCookieConsent({ analytics }) {
  const consent = {
    version: COOKIE_CONSENT_VERSION,
    analytics: Boolean(analytics),
    updatedAt: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(consent));
  } catch {
    // Apply the choice for this page even when browser storage is unavailable.
  }

  return consent;
}

function createGtag() {
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };

  return window.gtag;
}

export function enableGoogleAnalytics() {
  window[`ga-disable-${GOOGLE_ANALYTICS_ID}`] = false;

  const gtag = createGtag();
  gtag('consent', 'update', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });

  if (document.querySelector(`script[data-google-analytics="${GOOGLE_ANALYTICS_ID}"]`)) {
    return;
  }

  gtag('js', new Date());
  gtag('config', GOOGLE_ANALYTICS_ID, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    anonymize_ip: true,
  });

  const script = document.createElement('script');
  script.async = true;
  script.dataset.googleAnalytics = GOOGLE_ANALYTICS_ID;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`;
  document.head.appendChild(script);
}

function expireAnalyticsCookies() {
  const cookieNames = document.cookie
    .split(';')
    .map((cookie) => cookie.split('=')[0].trim())
    .filter((name) => name === '_ga' || name.startsWith('_ga_') || name === '_gid' || name.startsWith('_gat'));

  const domainAttributes = [''];
  const hostname = window.location.hostname;

  if (hostname === 'lofotenpeaks.no' || hostname.endsWith('.lofotenpeaks.no')) {
    domainAttributes.push('; domain=lofotenpeaks.no', '; domain=.lofotenpeaks.no');
  }

  cookieNames.forEach((name) => {
    domainAttributes.forEach((domainAttribute) => {
      document.cookie = `${name}=; Max-Age=0; path=/${domainAttribute}; SameSite=Lax`;
    });
  });
}

export function disableGoogleAnalytics() {
  window[`ga-disable-${GOOGLE_ANALYTICS_ID}`] = true;

  if (window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  }

  expireAnalyticsCookies();
}

export function applyCookieConsent(consent) {
  if (consent?.analytics) {
    enableGoogleAnalytics();
    return;
  }

  disableGoogleAnalytics();
}

export function openCookieSettings() {
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT));
}

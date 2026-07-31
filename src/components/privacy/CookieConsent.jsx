import { Cookie, Settings, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import {
  applyCookieConsent,
  COOKIE_CONSENT_EVENT,
  getStoredCookieConsent,
  storeCookieConsent,
} from '../../lib/cookieConsent.js';
import { theme } from '../../styles/theme.js';

const Banner = styled.aside`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  bottom: 18px;
  box-shadow: ${theme.shadow};
  display: grid;
  gap: 16px;
  left: 50%;
  max-width: 760px;
  padding: 20px;
  position: fixed;
  transform: translateX(-50%);
  width: min(calc(100% - 32px), 760px);
  z-index: 80;

  h2 {
    align-items: center;
    display: flex;
    font-size: 1.1rem;
    gap: 8px;
    margin: 0 0 6px;
  }

  p {
    color: ${theme.colors.muted};
    line-height: 1.55;
    margin: 0;
  }

  a {
    color: ${theme.colors.fjord};
    font-weight: 700;
  }
`;

const ButtonRow = styled.div`
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, minmax(0, 1fr));

  @media (max-width: 650px) {
    grid-template-columns: 1fr;
  }
`;

const ChoiceButton = styled.button`
  align-items: center;
  background: ${theme.colors.ink};
  border: 2px solid ${theme.colors.ink};
  border-radius: ${theme.radii.small};
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  font-weight: 800;
  justify-content: center;
  min-height: 46px;
  padding: 10px 14px;

  &:hover {
    filter: brightness(0.92);
  }

  &:focus-visible {
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 3px;
  }
`;

const SettingsButton = styled(ChoiceButton)`
  background: ${theme.colors.surface};
  border-color: ${theme.colors.ink};
  color: ${theme.colors.ink};
  gap: 7px;
`;

const Backdrop = styled.div`
  align-items: center;
  background: rgba(20, 22, 21, 0.72);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 20px;
  position: fixed;
  z-index: 90;
`;

const Dialog = styled.section`
  background: ${theme.colors.surface};
  border-radius: ${theme.radii.medium};
  box-shadow: ${theme.shadow};
  display: grid;
  gap: 20px;
  max-height: calc(100vh - 40px);
  max-width: 640px;
  overflow-y: auto;
  padding: 24px;
  width: 100%;

  h2,
  p {
    margin: 0;
  }

  p {
    color: ${theme.colors.muted};
    line-height: 1.55;
  }
`;

const DialogHeader = styled.div`
  align-items: flex-start;
  display: flex;
  gap: 16px;
  justify-content: space-between;
`;

const CloseButton = styled.button`
  align-items: center;
  background: transparent;
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.small};
  color: ${theme.colors.ink};
  cursor: pointer;
  display: inline-flex;
  flex: 0 0 auto;
  height: 40px;
  justify-content: center;
  width: 40px;

  &:focus-visible {
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 3px;
  }
`;

const SettingList = styled.div`
  border-bottom: 1px solid ${theme.colors.line};
  border-top: 1px solid ${theme.colors.line};
  display: grid;
`;

const Setting = styled.div`
  align-items: flex-start;
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr) auto;
  padding: 18px 0;

  & + & {
    border-top: 1px solid ${theme.colors.line};
  }

  strong {
    display: block;
    margin-bottom: 5px;
  }

  span {
    color: ${theme.colors.muted};
    display: block;
    font-size: 0.92rem;
    line-height: 1.5;
  }

  input {
    height: 22px;
    margin: 2px;
    width: 22px;
  }

  input:focus-visible {
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 3px;
  }
`;

const NecessaryStatus = styled.span`
  color: ${theme.colors.forest} !important;
  font-weight: 800;
  padding-top: 3px;
`;

const DialogActions = styled.div`
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

export function CookieConsent() {
  const [consent, setConsent] = useState(null);
  const [bannerOpen, setBannerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const closeButtonRef = useRef(null);
  const dialogRef = useRef(null);
  const returnFocusRef = useRef(null);

  useEffect(() => {
    const storedConsent = getStoredCookieConsent();
    setConsent(storedConsent);
    setAnalyticsEnabled(storedConsent?.analytics ?? false);
    setBannerOpen(!storedConsent);
    applyCookieConsent(storedConsent);
  }, []);

  useEffect(() => {
    function handleOpenSettings() {
      returnFocusRef.current = document.activeElement;
      setAnalyticsEnabled(consent?.analytics ?? false);
      setSettingsOpen(true);
    }

    window.addEventListener(COOKIE_CONSENT_EVENT, handleOpenSettings);

    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, handleOpenSettings);
  }, [consent]);

  useEffect(() => {
    if (!settingsOpen) {
      return undefined;
    }

    closeButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setSettingsOpen(false);
        returnFocusRef.current?.focus?.();
        return;
      }

      if (event.key === 'Tab') {
        const focusableElements = dialogRef.current?.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );

        if (!focusableElements?.length) {
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [settingsOpen]);

  function saveChoice(analytics) {
    const nextConsent = storeCookieConsent({ analytics });
    setConsent(nextConsent);
    setAnalyticsEnabled(analytics);
    setBannerOpen(false);
    setSettingsOpen(false);
    applyCookieConsent(nextConsent);
    returnFocusRef.current?.focus?.();
  }

  function closeSettings() {
    setSettingsOpen(false);
    returnFocusRef.current?.focus?.();
  }

  return (
    <>
      {bannerOpen && (
        <Banner aria-labelledby="cookie-consent-title">
          <div>
            <h2 id="cookie-consent-title">
              <Cookie size={20} aria-hidden="true" /> Your privacy choices
            </h2>
            <p>
              Lofoten Peaks uses necessary browser storage for sign-in and to remember this choice. With your
              permission, Google Analytics uses cookies to measure visits, sessions, approximate location, and device
              information. Analytics stays off unless you accept.{' '}
              <Link to="/privacy#cookies">Read the Privacy Policy</Link>.
            </p>
          </div>
          <ButtonRow>
            <ChoiceButton type="button" onClick={() => saveChoice(true)}>
              Accept all
            </ChoiceButton>
            <ChoiceButton type="button" onClick={() => saveChoice(false)}>
              Reject non-essential
            </ChoiceButton>
            <SettingsButton
              type="button"
              onClick={() => {
                returnFocusRef.current = document.activeElement;
                setSettingsOpen(true);
              }}
            >
              <Settings size={18} aria-hidden="true" /> Cookie settings
            </SettingsButton>
          </ButtonRow>
        </Banner>
      )}

      {settingsOpen && (
        <Backdrop>
          <Dialog
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-settings-title"
            aria-describedby="cookie-settings-description"
          >
            <DialogHeader>
              <div>
                <h2 id="cookie-settings-title">Cookie settings</h2>
                <p id="cookie-settings-description">
                  Optional technologies are disabled unless you choose to allow them.
                </p>
              </div>
              <CloseButton ref={closeButtonRef} type="button" aria-label="Close cookie settings" onClick={closeSettings}>
                <X size={20} aria-hidden="true" />
              </CloseButton>
            </DialogHeader>

            <SettingList>
              <Setting>
                <div>
                  <strong>Necessary storage</strong>
                  <span>Maintains sign-in sessions and remembers your privacy choice. This cannot be switched off.</span>
                </div>
                <NecessaryStatus>Always on</NecessaryStatus>
              </Setting>
              <Setting as="label">
                <div>
                  <strong>Analytics</strong>
                  <span>
                    Allows Google Analytics to measure how visitors use the site. Google receives usage, approximate
                    location, browser, and device information.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(event) => setAnalyticsEnabled(event.target.checked)}
                />
              </Setting>
            </SettingList>

            <p>
              See the <Link to="/privacy#cookies">cookie details and durations</Link> in the Privacy Policy.
            </p>

            <DialogActions>
              <ChoiceButton type="button" onClick={() => saveChoice(false)}>
                Reject non-essential
              </ChoiceButton>
              <ChoiceButton type="button" onClick={() => saveChoice(analyticsEnabled)}>
                Save preferences
              </ChoiceButton>
            </DialogActions>
          </Dialog>
        </Backdrop>
      )}
    </>
  );
}

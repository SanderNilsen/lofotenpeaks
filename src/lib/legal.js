export const LEGAL_DOCUMENT_VERSIONS = Object.freeze({
  terms: '2026-08-01',
  privacy: '2026-08-01',
});

export function isCurrentLegalAcceptance(status) {
  return Boolean(
    status &&
      status.acceptedTermsVersion === status.termsVersion &&
      status.acknowledgedPrivacyVersion === status.privacyVersion,
  );
}

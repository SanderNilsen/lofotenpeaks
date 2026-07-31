import { AlertTriangle, ExternalLink } from 'lucide-react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Seo } from '../../components/common/Seo.jsx';
import { COOKIE_CONSENT_STORAGE_KEY, GOOGLE_ANALYTICS_ID } from '../../lib/cookieConsent.js';
import { theme } from '../../styles/theme.js';

const Page = styled.div`
  margin: 0 auto;
  max-width: ${theme.pageWidth};
  padding: 56px 24px 24px;

  @media (max-width: 640px) {
    padding-top: 36px;
  }
`;

const Hero = styled.header`
  border-bottom: 1px solid ${theme.colors.line};
  display: grid;
  gap: 16px;
  padding-bottom: 32px;

  h1 {
    font-size: 3.8rem;
    line-height: 1;
    margin: 0;
  }

  p {
    color: ${theme.colors.muted};
    font-size: 1.08rem;
    line-height: 1.7;
    margin: 0;
    max-width: 760px;
  }

  @media (max-width: 640px) {
    h1 {
      font-size: 2.5rem;
    }
  }
`;

const Updated = styled.p`
  color: ${theme.colors.ink} !important;
  font-size: 0.94rem !important;
  font-weight: 800;
`;

const PolicyLayout = styled.div`
  align-items: start;
  display: grid;
  gap: 52px;
  grid-template-columns: minmax(190px, 250px) minmax(0, 760px);
  justify-content: space-between;
  padding-top: 38px;

  @media (max-width: 860px) {
    gap: 34px;
    grid-template-columns: 1fr;
  }
`;

const Contents = styled.nav`
  border-left: 3px solid ${theme.colors.forest};
  padding-left: 18px;
  position: sticky;
  top: 106px;

  h2 {
    font-size: 1rem;
    margin: 0 0 12px;
  }

  ol {
    display: grid;
    gap: 7px;
    list-style-position: inside;
    margin: 0;
    padding: 0;
  }

  a {
    color: ${theme.colors.muted};
    font-size: 0.9rem;
    line-height: 1.45;
    text-decoration-thickness: 1px;
    text-underline-offset: 3px;
  }

  a:hover {
    color: ${theme.colors.fjord};
  }

  a:focus-visible {
    border-radius: 2px;
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 3px;
  }

  @media (max-width: 860px) {
    position: static;
  }
`;

const Article = styled.article`
  display: grid;
  gap: 44px;
`;

const Section = styled.section`
  scroll-margin-top: 104px;

  h2 {
    font-size: 1.65rem;
    line-height: 1.25;
    margin: 0 0 16px;
  }

  h3 {
    font-size: 1.1rem;
    line-height: 1.35;
    margin: 26px 0 10px;
  }

  p,
  li {
    line-height: 1.72;
  }

  p {
    margin: 0 0 14px;
  }

  ul {
    display: grid;
    gap: 8px;
    margin: 12px 0 0;
    padding-left: 22px;
  }

  a {
    color: ${theme.colors.fjord};
    font-weight: 700;
    text-underline-offset: 3px;
  }

  a:focus-visible {
    border-radius: 2px;
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 3px;
  }
`;

const ControllerDetails = styled.dl`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  display: grid;
  margin: 20px 0 0;
  padding: 6px 20px;

  div {
    display: grid;
    gap: 12px;
    grid-template-columns: minmax(130px, 180px) minmax(0, 1fr);
    padding: 14px 0;
  }

  div + div {
    border-top: 1px solid ${theme.colors.line};
  }

  dt {
    color: ${theme.colors.muted};
    font-weight: 700;
  }

  dd {
    margin: 0;
  }

  @media (max-width: 560px) {
    div {
      gap: 5px;
      grid-template-columns: 1fr;
    }
  }
`;

const Notice = styled.div`
  background: #fff7ed;
  border: 1px solid #d79b62;
  border-radius: ${theme.radii.medium};
  color: #5b351a;
  display: grid;
  gap: 10px;
  grid-template-columns: auto minmax(0, 1fr);
  margin: 20px 0;
  padding: 16px;

  strong {
    display: block;
    margin-bottom: 4px;
  }

  p {
    margin: 0;
  }
`;

const Summary = styled.div`
  background: #e8f2ef;
  border-left: 4px solid ${theme.colors.forest};
  border-radius: 0 ${theme.radii.medium} ${theme.radii.medium} 0;
  color: #183f35;
  padding: 18px 20px;

  p:last-child {
    margin-bottom: 0;
  }
`;

const TableWrap = styled.div.attrs({ tabIndex: 0 })`
  margin: 20px 0;
  overflow-x: auto;

  &:focus-visible {
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 3px;
  }
`;

const PolicyTable = styled.table`
  border-collapse: collapse;
  min-width: 680px;
  width: 100%;

  th,
  td {
    border-bottom: 1px solid ${theme.colors.line};
    line-height: 1.55;
    padding: 14px 12px;
    text-align: left;
    vertical-align: top;
  }

  th {
    background: ${theme.colors.ink};
    color: #fff;
    font-size: 0.85rem;
  }

  td {
    background: ${theme.colors.surface};
    font-size: 0.92rem;
  }
`;

const ProviderLink = styled.a`
  align-items: center;
  display: inline-flex;
  gap: 5px;
`;

const tocItems = [
  ['controller', 'Controller'],
  ['scope', 'Scope'],
  ['data-collected', 'Data collected'],
  ['purposes', 'Purposes and legal bases'],
  ['public-information', 'Public information'],
  ['location-gpx', 'Location and GPX data'],
  ['cookies', 'Cookies and storage'],
  ['providers', 'Service providers'],
  ['transfers', 'International transfers'],
  ['retention', 'Retention'],
  ['deletion', 'Account deletion'],
  ['security', 'Security'],
  ['rights', 'Your rights'],
  ['complaints', 'Complaints'],
  ['children', 'Children'],
  ['external-content', 'External content'],
  ['changes', 'Changes'],
];

function ExternalProviderLink({ href, children }) {
  return (
    <ProviderLink href={href} target="_blank" rel="noreferrer">
      {children} <ExternalLink size={14} aria-hidden="true" />
    </ProviderLink>
  );
}

export function PrivacyPage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      return;
    }

    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    target?.scrollIntoView();
  }, [hash]);

  return (
    <Page>
      <Seo
        title="Privacy Policy"
        description="How Lofoten Peaks collects, uses, shares, and protects personal data, including account, location, check-in, comment, and analytics information."
      />

      <Hero>
        <h1>Privacy Policy</h1>
        <p>
          This policy explains how Lofoten Peaks handles personal data when you browse the hiking guide, create an
          account, check in at a summit, join the leaderboard, comment, or recommend a hike. It also explains the
          external services used to provide maps, weather, hosting, authentication, and optional analytics.
        </p>
        <Updated>Last updated: 31 July 2026</Updated>
      </Hero>

      <PolicyLayout>
        <Contents aria-label="Privacy Policy contents">
          <h2>Contents</h2>
          <ol>
            {tocItems.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`}>{label}</a>
              </li>
            ))}
          </ol>
        </Contents>

        <Article>
          <Section id="controller">
            <h2>1. Who is responsible for processing?</h2>
            <p>
              Lofoten Peaks is operated by Sander as a private individual in Norway. Sander determines
              why and how personal data is processed through lofotenpeaks.no and is the data controller under the EU
              General Data Protection Regulation (GDPR) and the Norwegian Personal Data Act.
            </p>
            <ControllerDetails>
              <div>
                <dt>Data controller</dt>
                <dd>Sander</dd>
              </div>
              <div>
                <dt>Website</dt>
                <dd>Lofoten Peaks</dd>
              </div>
              <div>
                <dt>Capacity</dt>
                <dd>Private individual</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>Norway</dd>
              </div>
              <div>
                <dt>Privacy contact</dt>
                <dd>
                  <a href="mailto:privacy@lofotenpeaks.no">privacy@lofotenpeaks.no</a>
                </dd>
              </div>
            </ControllerDetails>
          </Section>

          <Section id="scope">
            <h2>2. Scope</h2>
            <p>
              This policy applies to lofotenpeaks.no and the account, mountain-guide, summit check-in, leaderboard,
              comment, and hike-recommendation features available through the website. It does not govern external
              websites that you choose to visit through a link.
            </p>
            <Summary>
              <p>
                <strong>In short:</strong> browsing the guide does not require an account. Account features are
                optional. Precise location is requested only when you press “Use my location” for a summit check-in.
                Google Analytics is optional and must remain disabled unless you consent.
              </p>
            </Summary>
          </Section>

          <Section id="data-collected">
            <h2>3. Personal data collected</h2>

            <h3>Account and authentication data</h3>
            <p>
              When you register or sign in, the website processes your email address, password, user ID, authentication
              tokens, account creation time, email-confirmation status, and sign-in/session information. Supabase Auth
              handles the password and authentication process. Lofoten Peaks does not receive your plain-text password.
              Registration and sign-in currently use email and password only. No social login is implemented.
            </p>
            <p>
              The current website has no self-service password-reset interface. Supabase may send account confirmation
              emails if confirmation is enabled in the project settings.
            </p>

            <h3>Profile data</h3>
            <p>
              A profile may contain a display name, username, avatar URL, short biography, total points, user ID, and
              profile creation/update timestamps. Display names and usernames must not be email addresses.
            </p>

            <h3>Summit check-ins and location</h3>
            <p>
              If you choose to check in, the browser requests your current latitude and longitude. Browser-reported
              accuracy is shown temporarily on your device but is not sent to the backend. The submitted coordinates
              are sent to Supabase, compared with the configured summit coordinates, and stored with your user ID,
              mountain and trail IDs, check-in time and day, calculated distance to the summit, points, status, and any
              optional note.
            </p>

            <h3>Comments and hike recommendations</h3>
            <p>
              Comments contain your user ID, mountain/trail reference, comment text, moderation status, and timestamps.
              Hike recommendations contain your user ID, title, notes, difficulty, review status, and timestamps. New
              comments are currently approved and visible immediately. Hike recommendations are submitted as pending
              for review.
            </p>

            <h3>GPX files, route data, and guide media</h3>
            <p>
              The current public account interface does not let users upload GPX files or photos. Authorised
              administrators can upload GPX route files and mountain images for guide content. GPX files are parsed in
              the administrator&apos;s browser into route coordinates and stored in a private Supabase bucket; the
              resulting route geometry can be published on the guide map. Image files, credits, alt text, licences, and
              source links are stored for public guide content.
            </p>

            <h3>Technical and usage information</h3>
            <p>
              The hosting provider and external services may receive IP address, request date/time, requested URL,
              referrer, browser/device type, operating system, and diagnostic or security information when your browser
              connects to them. If you consent to Google Analytics, Google may also process page views, sessions,
              approximate location, browser/device information, and enabled measurement events.
            </p>

            <h3>Data not collected through current website features</h3>
            <p>
              The audited frontend contains no contact form, newsletter signup, advertising, affiliate tracking,
              payment, booking, commerce, user photo upload, or user GPX upload.
            </p>
          </Section>

          <Section id="purposes">
            <h2>4. How and why data is used</h2>
            <TableWrap>
              <PolicyTable>
                <thead>
                  <tr>
                    <th>Purpose</th>
                    <th>Data</th>
                    <th>GDPR legal basis</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Create and operate an account and session</td>
                    <td>Email, password handled by Supabase, user ID, tokens, profile and session data</td>
                    <td>
                      Article 6(1)(b), performance of the service agreement requested when you create and use an
                      account.
                    </td>
                  </tr>
                  <tr>
                    <td>Provide verified summit check-ins and award points</td>
                    <td>Current coordinates, mountain/trail, timestamp, distance, points, and optional note</td>
                    <td>
                      Article 6(1)(b), to provide the location-verified check-in feature. Retaining validation evidence
                      may also rely on Article 6(1)(f): the legitimate interest in protecting leaderboard integrity and
                      preventing false check-ins. This interest must be balanced against location privacy.
                    </td>
                  </tr>
                  <tr>
                    <td>Publish community features</td>
                    <td>Display name, username/avatar where used, approved comments, and leaderboard totals</td>
                    <td>
                      Article 6(1)(b), because public contribution and leaderboard functions are part of the account
                      service the user requests.
                    </td>
                  </tr>
                  <tr>
                    <td>Receive and review hike recommendations</td>
                    <td>Title, notes, difficulty, user ID, status, and timestamps</td>
                    <td>Article 6(1)(b), to provide the contribution workflow requested by the user.</td>
                  </tr>
                  <tr>
                    <td>Deliver maps, weather, and the public guide</td>
                    <td>Technical request data; guide/summit coordinates sent to map and weather services</td>
                    <td>
                      Article 6(1)(f): the legitimate interest in providing useful route, map, and weather information.
                      The weather request uses the hike finish point, not the visitor&apos;s current GPS location.
                    </td>
                  </tr>
                  <tr>
                    <td>Measure site use with Google Analytics</td>
                    <td>Online identifiers, page/session events, approximate location, and device/browser information</td>
                    <td>
                      Article 6(1)(a), consent. Analytics must not load before consent and can be disabled at any time.
                    </td>
                  </tr>
                  <tr>
                    <td>Protect and troubleshoot the service</td>
                    <td>IP address, request logs, authentication and diagnostic information</td>
                    <td>
                      Article 6(1)(f): the legitimate interest in service reliability, abuse prevention, and
                      information security.
                    </td>
                  </tr>
                  <tr>
                    <td>Respond to privacy requests and legal duties</td>
                    <td>Identity verification, correspondence, request history, and necessary account data</td>
                    <td>Article 6(1)(c), compliance with legal obligations under data-protection law.</td>
                  </tr>
                </tbody>
              </PolicyTable>
            </TableWrap>
            <p>
              Lofoten Peaks does not use account, location, check-in, or contribution data for advertising in the
              current implementation. The website does not make decisions that produce legal or similarly significant
              effects using solely automated processing.
            </p>
          </Section>

          <Section id="public-information">
            <h2>5. Public information</h2>
            <p>The following information is intended to be public or visible to other visitors:</p>
            <ul>
              <li>Display name and, where used, avatar on comments and the leaderboard.</li>
              <li>
                The current public profile API can expose the profile ID, display name, username, avatar URL, biography,
                total points, and profile timestamps, even where the website interface shows only part of that profile.
              </li>
              <li>Leaderboard points, number of check-ins, completed mountains, and latest check-in time.</li>
              <li>
                Approved comments, their timestamp, and the commenter&apos;s display name/avatar. The underlying public
                comment row also contains its user and guide references.
              </li>
              <li>
                Approved hike recommendations may be readable through the public data API, although the current public
                interface does not list them.
              </li>
            </ul>
            <p>
              Email addresses and passwords are not displayed on the website. Pending hike recommendations are visible
              to their author and authorised administrators rather than the public.
            </p>
            <Notice>
              <AlertTriangle size={22} aria-hidden="true" />
              <div>
                <strong>Current backend exposure requiring correction</strong>
                <p>
                  The audited Supabase row-level policy allows approved check-in rows to be read through the public API.
                  Those rows can include the user ID, precise submitted coordinates, calculated distance, timestamp,
                  points, and optional note even though the website UI does not show those fields publicly. The
                  controller should restrict direct check-in access and expose only the intended leaderboard aggregate.
                </p>
              </div>
            </Notice>
          </Section>

          <Section id="location-gpx">
            <h2>6. Location and GPX data</h2>
            <h3>Summit location</h3>
            <p>
              Location access is optional and begins only after you press “Use my location” and grant browser
              permission. The coordinates are used to check whether you are within the administrator-defined distance
              of the summit. If you do not provide location, you can still browse the guide, but cannot complete a
              verified summit check-in.
            </p>
            <p>
              Precise location can reveal where you were at a particular time. The current backend stores the submitted
              coordinate and calculated distance. See the public-access warning above. Users cannot delete individual
              check-ins through the current interface and must use the privacy contact.
            </p>

            <h3>GPX and route information</h3>
            <p>
              A GPX file can reveal exact movements, dates/times, starting points, a home location, accommodation, and
              frequently visited places. Review and, where appropriate, trim or anonymise files before uploading them.
              Do not upload another person&apos;s route or location information unless you have a lawful basis or their
              permission.
            </p>
            <p>
              At present, GPX upload is available only to administrators for guide routes. Original files are stored in
              the private <code>trail-gpx</code> Supabase bucket and can be removed from the admin guide editor. Parsed
              route geometry is published with a published guide and is therefore public. There is no user GPX upload
              feature or self-service user GPX deletion function in the current account interface.
            </p>
          </Section>

          <Section id="cookies">
            <h2>7. Cookies and similar technologies</h2>
            <p>
              Norwegian Electronic Communications Act section 3-15 requires valid prior consent for non-essential
              cookies and similar technologies. Consent must be freely given, specific, informed, unambiguous, and as
              easy to withdraw as to give. Continued browsing is not treated as consent.
            </p>
            <p>
              Lofoten Peaks uses necessary local storage for account sessions and consent preferences. Google Analytics
              is optional and must remain blocked until you choose to allow analytics. Optional choices are off by
              default.
            </p>

            <TableWrap>
              <PolicyTable>
                <thead>
                  <tr>
                    <th>Name / technology</th>
                    <th>Provider and purpose</th>
                    <th>Category</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <code>sb-&lt;project-ref&gt;-auth-token</code> (name may vary)
                    </td>
                    <td>Supabase Auth local storage used to keep a signed-in session and refresh authentication tokens.</td>
                    <td>Strictly necessary for signed-in features</td>
                    <td>Until sign-out, token/session invalidation, or browser storage is cleared.</td>
                  </tr>
                  <tr>
                    <td>
                      <code>{COOKIE_CONSENT_STORAGE_KEY}</code>
                    </td>
                    <td>Lofoten Peaks local storage recording analytics choice, policy version, and choice time.</td>
                    <td>Necessary preference/consent record</td>
                    <td>Until changed, browser storage is cleared, or the consent version is replaced.</td>
                  </tr>
                  <tr>
                    <td>
                      <code>_ga</code>
                    </td>
                    <td>Google Analytics identifier used to distinguish visitors after analytics consent.</td>
                    <td>Optional analytics</td>
                    <td>Google&apos;s default is up to 2 years, subject to browser limits and Analytics settings.</td>
                  </tr>
                  <tr>
                    <td>
                      <code>_ga_X0J3SHQZHV</code>
                    </td>
                    <td>
                      Google Analytics session-state cookie for measurement ID <code>{GOOGLE_ANALYTICS_ID}</code>.
                    </td>
                    <td>Optional analytics</td>
                    <td>Google&apos;s default is up to 2 years, subject to browser limits and Analytics settings.</td>
                  </tr>
                </tbody>
              </PolicyTable>
            </TableWrap>

            <p>
              Use “Cookie settings” in the footer to change or withdraw consent. Withdrawing analytics consent disables
              further Analytics collection in the page and attempts to remove Analytics cookies set on
              lofotenpeaks.no. You can also clear cookies and local storage in your browser.
            </p>
            <p>
              OpenStreetMap and Open-Meteo are requested directly to provide maps and weather, but the audited website
              code does not use them to place optional cookies or browser storage. Their servers may still receive
              technical request logs as described below.
            </p>
          </Section>

          <Section id="providers">
            <h2>8. Third-party service providers</h2>
            <TableWrap>
              <PolicyTable>
                <thead>
                  <tr>
                    <th>Provider</th>
                    <th>Service and data it may receive</th>
                    <th>Reason and location note</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <ExternalProviderLink href="https://www.uniweb.no/">Uniweb</ExternalProviderLink>
                    </td>
                    <td>Frontend hosting; may receive IP address, request headers, requested URLs, and server logs.</td>
                    <td>
                      Needed to deliver and secure the website. Contracting entity, server location, log retention, and
                      data-processing terms require owner verification.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <ExternalProviderLink href="https://supabase.com/privacy">Supabase</ExternalProviderLink>
                    </td>
                    <td>
                      Authentication, PostgreSQL database, API, and file storage. Receives account, profile, check-in,
                      location, comment, recommendation, admin content, and technical data.
                    </td>
                    <td>
                      Needed for account and community features. The selected project region and current DPA,
                      subprocessors, support access, backups, and transfer safeguards require owner verification.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <ExternalProviderLink href="https://policies.google.com/privacy">
                        Google Analytics
                      </ExternalProviderLink>
                    </td>
                    <td>
                      Optional audience measurement; may receive online identifiers, page/session events, approximate
                      location, IP-derived information, and browser/device data.
                    </td>
                    <td>
                      Used only after consent. Google may process data globally. Analytics property retention, enhanced
                      measurement, account linking, data sharing, and the operator&apos;s applicable transfer safeguard
                      require verification.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <ExternalProviderLink href="https://osmfoundation.org/wiki/Privacy_Policy">
                        OpenStreetMap Foundation and its tile delivery providers
                      </ExternalProviderLink>
                    </td>
                    <td>
                      Map tiles; may receive IP address, browser/device type, operating system, referrer, request time,
                      and requested map tiles.
                    </td>
                    <td>
                      Needed to show route maps. OSMF is based in the United Kingdom and uses distributed delivery
                      infrastructure, including Fastly. Current locations and safeguards should be verified.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <ExternalProviderLink href="https://open-meteo.com/en/terms">Open-Meteo</ExternalProviderLink>
                    </td>
                    <td>
                      Weather API; receives IP address, request URL, and the mountain/trail finish coordinates used for
                      the forecast. It does not receive the visitor&apos;s check-in GPS coordinates from this feature.
                    </td>
                    <td>
                      Needed to show weather. Open-Meteo states that troubleshooting logs may be kept for 90 days and
                      operates from Switzerland.
                    </td>
                  </tr>
                </tbody>
              </PolicyTable>
            </TableWrap>
            <p>
              The repository contains image-credit links to Unsplash. Images are served locally from lofotenpeaks.no;
              Unsplash receives data only if you choose to follow an external credit link.
            </p>
          </Section>

          <Section id="transfers">
            <h2>9. International data transfers</h2>
            <p>
              Some providers may process or permit remote access to personal data outside Norway or the European
              Economic Area. The repository alone cannot establish the production project region, contractual entity,
              support-access locations, subprocessors, or the controller&apos;s signed data-processing agreements.
            </p>
            <p>
              Before publication, the controller must verify and document each relevant transfer. Depending on the
              destination and provider, an appropriate safeguard may be an adequacy decision, the EU–US Data Privacy
              Framework for an eligible certified recipient, the European Commission&apos;s Standard Contractual
              Clauses, and any necessary additional safeguards and transfer assessment. No safeguard is asserted here
              until the owner verifies the production contracts and settings.
            </p>
          </Section>

          <Section id="retention">
            <h2>10. Data retention</h2>
            <p>
              The current application and SQL files do not implement automated retention jobs for user records. Until
              the owner sets and applies a retention schedule, the following criteria describe current behavior:
            </p>
            <TableWrap>
              <PolicyTable>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Current retention rule or required verification</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Account and profile</td>
                    <td>
                      Kept while the account exists and until deletion is carried out following a verified request.
                      Supabase Auth log retention must be verified.
                    </td>
                  </tr>
                  <tr>
                    <td>Check-ins and location</td>
                    <td>
                      No automatic expiry. Kept until the record/account is deleted or a valid deletion request is
                      completed. The necessity of retaining exact coordinates after validation should be reviewed.
                    </td>
                  </tr>
                  <tr>
                    <td>Comments and hike recommendations</td>
                    <td>
                      No automatic expiry. Kept until deletion of the record/account or completion of a valid request,
                      subject to any lawful need to retain a limited record.
                    </td>
                  </tr>
                  <tr>
                    <td>Admin GPX files and route geometry</td>
                    <td>Kept until an administrator removes/replaces the route or deletes its guide.</td>
                  </tr>
                  <tr>
                    <td>Consent record</td>
                    <td>Kept in local storage until changed, cleared, or replaced by a new consent version.</td>
                  </tr>
                  <tr>
                    <td>Google Analytics events</td>
                    <td>
                      The production Analytics property retention setting is not visible in the repository and must be
                      verified. Analytics cookies use the durations listed above.
                    </td>
                  </tr>
                  <tr>
                    <td>Hosting, security, and API logs</td>
                    <td>
                      Uniweb and Supabase log periods require verification. Open-Meteo states up to 90 days for
                      troubleshooting logs.
                    </td>
                  </tr>
                  <tr>
                    <td>Backups</td>
                    <td>
                      Supabase and Uniweb backup schedules, retention periods, deletion behavior, and restoration
                      procedures require verification.
                    </td>
                  </tr>
                </tbody>
              </PolicyTable>
            </TableWrap>
          </Section>

          <Section id="deletion">
            <h2>11. Account deletion and removing contributions</h2>
            <p>
              The current website does not include self-service account deletion or buttons for deleting individual
              check-ins, comments, or hike recommendations. To request deletion, contact{' '}
              <a href="mailto:privacy@lofotenpeaks.no">privacy@lofotenpeaks.no</a> and identify the account using the
              email address associated with it. Additional verification may be requested before deletion to protect
              the account.
            </p>
            <p>
              Deleting the Supabase Auth user is designed to cascade to the associated profile, check-ins, comments,
              and hike recommendations. The operator must verify that account deletion is completed in Auth as well as
              the application database and storage. Limited data may remain temporarily in backups or be retained where
              required for legal claims, security incidents, or compliance obligations.
            </p>
            <p>
              Administrators can remove an admin-uploaded GPX guide route and gallery images through the admin editor.
              Public users currently have no GPX upload feature.
            </p>
          </Section>

          <Section id="security">
            <h2>12. Data security</h2>
            <p>
              The application uses Supabase authentication, row-level database policies, role-restricted admin
              functions, a private storage bucket for admin GPX files, file-size/type controls for guide images, and
              HTTPS-capable hosting. Authentication tokens are stored by Supabase in browser local storage so signed-in
              sessions can persist.
            </p>
            <p>
              Access rules, provider accounts, deployment credentials, and software dependencies should be reviewed and
              updated regularly. The public check-in policy described above is a known issue. No internet transmission
              or storage system can be guaranteed completely secure, and this policy does not claim a certification
              that has not been independently verified.
            </p>
          </Section>

          <Section id="rights">
            <h2>13. Your GDPR rights</h2>
            <p>Depending on the circumstances and applicable exceptions, you may have the right to:</p>
            <ul>
              <li>access personal data held about you and receive a copy;</li>
              <li>correct inaccurate or incomplete data;</li>
              <li>request erasure of personal data;</li>
              <li>request restriction of processing;</li>
              <li>
                receive data you provided in a structured, commonly used, machine-readable format and ask for
                portability where the legal conditions apply;
              </li>
              <li>
                object to processing based on legitimate interests, including the interests described in section 4;
              </li>
              <li>withdraw consent at any time without affecting processing that was lawful before withdrawal; and</li>
              <li>
                not be subject to a decision based solely on automated processing that has legal or similarly
                significant effects, where Article 22 applies.
              </li>
            </ul>
            <p>
              Use “Cookie settings” to withdraw Analytics consent. For other rights, contact{' '}
              <a href="mailto:privacy@lofotenpeaks.no">privacy@lofotenpeaks.no</a>. The controller may need to verify
              your identity and will respond within the time required by law.
            </p>
          </Section>

          <Section id="complaints">
            <h2>14. Complaints</h2>
            <p>
              Please contact the controller first so the concern can be investigated. You also have the right to lodge
              a complaint with the Norwegian Data Protection Authority, Datatilsynet.
            </p>
            <p>
              <ExternalProviderLink href="https://www.datatilsynet.no/en/about-us/contact-us/how-to-complain-to-the-norwegian-dpa/">
                How to complain to Datatilsynet
              </ExternalProviderLink>
              <br />
              Datatilsynet, P.O. Box 458 Sentrum, NO-0105 Oslo, Norway
            </p>
          </Section>

          <Section id="children">
            <h2>15. Children</h2>
            <p>
              The public hiking guide is intended for a general audience. The account and community features have not
              been designed specifically for children, and the current registration flow has no age check or parental
              consent process.
            </p>
            <p>
              Norwegian law gives children additional protection, and special rules apply when consent is used as the
              legal basis for an information-society service offered directly to a child. The operator must confirm the
              intended minimum account age, the applicable legal basis, and whether age-assurance or parental
              authorisation is required before promoting accounts to children. A minimum age is not invented in this
              policy because the service decision has not been documented.
            </p>
            <p>
              A parent or guardian who believes a child has provided personal data inappropriately should contact{' '}
              <a href="mailto:privacy@lofotenpeaks.no">privacy@lofotenpeaks.no</a>.
            </p>
          </Section>

          <Section id="external-content">
            <h2>16. External links and content</h2>
            <p>
              Route maps use OpenStreetMap tiles and weather panels call Open-Meteo from your browser. Following an
              image-credit, provider-policy, or other external link takes you to a service that controls its own privacy
              practices. Review that service&apos;s privacy information before providing data.
            </p>
          </Section>

          <Section id="changes">
            <h2>17. Changes to this policy</h2>
            <p>
              This policy may be updated when features, providers, legal requirements, or data practices change. The
              “Last updated” date will be revised. Material changes affecting account users should be communicated
              through a prominent website notice and, where appropriate, by email or a new consent request before the
              change takes effect.
            </p>
            <p>
              The controller should review this policy whenever account, user GPX upload, moderation, newsletter,
              advertising, or additional analytics features are introduced.
            </p>
          </Section>
        </Article>
      </PolicyLayout>
    </Page>
  );
}

export default PrivacyPage;

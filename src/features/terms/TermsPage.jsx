import { Scale, ShieldAlert } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Seo } from '../../components/common/Seo.jsx';
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

const TermsLayout = styled.div`
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

const Summary = styled.div`
  background: #e8f2ef;
  border-left: 4px solid ${theme.colors.forest};
  border-radius: 0 ${theme.radii.medium} ${theme.radii.medium} 0;
  color: #183f35;
  display: grid;
  gap: 10px;
  padding: 18px 20px;

  p {
    margin: 0;
  }
`;

const SafetySection = styled(Section)`
  background: #fff7ed;
  border: 1px solid #d79b62;
  border-left: 5px solid ${theme.colors.warning};
  border-radius: ${theme.radii.medium};
  padding: 24px;

  h2 {
    align-items: center;
    color: #5b351a;
    display: flex;
    gap: 10px;
  }
`;

const LegalLimit = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  display: grid;
  gap: 10px;
  margin-top: 20px;
  padding: 18px;

  strong {
    align-items: center;
    display: flex;
    gap: 8px;
  }

  p {
    margin: 0;
  }
`;

const ContactDetails = styled.address`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  display: grid;
  font-style: normal;
  gap: 8px;
  margin-top: 20px;
  padding: 18px;
`;

const tocItems = [
  ['acceptance', 'Acceptance'],
  ['service', 'About the service'],
  ['accounts', 'User accounts'],
  ['user-content', 'User content'],
  ['hiking-disclaimer', 'Hiking information'],
  ['safety', 'Safety disclaimer'],
  ['liability', 'Limitation of liability'],
  ['gpx', 'GPX and route data'],
  ['community', 'Community content'],
  ['intellectual-property', 'Intellectual property'],
  ['prohibited-conduct', 'Prohibited conduct'],
  ['termination', 'Suspension and termination'],
  ['service-changes', 'Changes to the service'],
  ['terms-changes', 'Changes to these Terms'],
  ['governing-law', 'Governing law'],
  ['contact', 'Contact'],
];

export function TermsPage() {
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
        title="Terms of Service"
        description="Terms for using Lofoten Peaks, including account, community, route information, GPX, hiking safety, and liability rules."
      />

      <Hero>
        <h1>Terms of Service</h1>
        <p>
          These Terms govern your use of Lofoten Peaks. They explain the rules for accounts and community
          contributions, the limitations of hiking information, and the safety decisions every hiker must make for
          themselves.
        </p>
        <Updated>Last updated: 31 July 2026</Updated>
        <Summary>
          <p>
            <strong>Important:</strong> Lofoten Peaks is an informational hiking guide, not a professional guiding,
            emergency, rescue, or official trail-authority service.
          </p>
          <p>
            Mountain travel involves inherent risk. Conditions and access can change quickly, and no map, route line,
            GPX-derived track, forecast, comment, or difficulty rating can replace your own judgement and preparation.
          </p>
        </Summary>
      </Hero>

      <TermsLayout>
        <Contents aria-label="Terms of Service contents">
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
          <Section id="acceptance">
            <h2>1. Acceptance of the Terms</h2>
            <p>
              By accessing or using lofotenpeaks.no, creating an account, checking in, commenting, or submitting a hike
              recommendation, you agree to these Terms. If you do not agree, do not create an account or use the
              community features.
            </p>
            <p>
              If you are not legally able to accept these Terms yourself, you may use account features only with the
              involvement and permission of a parent or legal guardian. These Terms do not reduce rights that cannot be
              waived under applicable law.
            </p>
          </Section>

          <Section id="service">
            <h2>2. About the Service</h2>
            <p>
              Lofoten Peaks is an online hiking guide operated by Sander as a private individual in Norway. It
              helps visitors discover mountain hikes and route information in Lofoten. Public guide pages may include
              descriptions, photographs, difficulty ratings, distances, elevation, maps, GPX-derived route lines,
              planning notes, safety notes, and weather information.
            </p>
            <p>
              Registered users can currently maintain a public-facing profile identity, make summit check-ins using
              location verification, collect virtual points, appear on a leaderboard, post comments, and submit text
              hike recommendations for review. Points are recognition within the service only. They have no monetary
              value and cannot be transferred or exchanged.
            </p>
            <p>
              Public users cannot currently upload GPX files, route photographs, or star-rating reviews. GPX and
              gallery uploads in the current application are restricted to the site administrator. Available features
              may differ between accounts and may change as described in section 13.
            </p>
          </Section>

          <Section id="accounts">
            <h2>3. User Accounts</h2>
            <p>When you create or use an account, you agree to:</p>
            <ul>
              <li>provide accurate account and public profile information;</li>
              <li>use a display name and username that do not impersonate or mislead others;</li>
              <li>keep your password and access to your email account secure;</li>
              <li>notify Lofoten Peaks promptly if you believe your account has been compromised; and</li>
              <li>take responsibility for activity performed through your account unless caused by a security failure for which Lofoten Peaks is legally responsible.</li>
            </ul>
            <p>
              Accounts are personal and must not be sold or transferred. The current website does not provide
              self-service password reset or account deletion. Account and deletion requests can be sent to the contact
              address in section 16. Personal data is handled as described in the{' '}
              <Link to="/privacy">Privacy Policy</Link>.
            </p>
          </Section>

          <Section id="user-content">
            <h2>4. User-generated content</h2>
            <p>
              User-generated content currently includes profile names and biographies, summit check-in notes, comments,
              and hike recommendations. You remain responsible for the accuracy, legality, and safety implications of
              everything you submit.
            </p>
            <p>By submitting content, you confirm that:</p>
            <ul>
              <li>you created it or have the rights and permissions needed to publish it;</li>
              <li>it does not unlawfully disclose another person's personal or location information;</li>
              <li>it does not infringe copyright, privacy, publicity, or other rights;</li>
              <li>it is not deliberately false, dangerous, defamatory, unlawful, or misleading; and</li>
              <li>any safety or route information is presented honestly and with appropriate uncertainty.</li>
            </ul>
            <p>
              Lofoten Peaks may review, reject, hide, or remove content that violates these Terms, creates a credible
              safety risk, infringes rights, is unlawful, or is otherwise unsuitable for the hiking guide. Approval or
              publication does not mean that content has been professionally verified.
            </p>
          </Section>

          <Section id="hiking-disclaimer">
            <h2>5. Hiking information disclaimer</h2>
            <p>
              Hiking and mountain travel involve inherent risks, including serious injury and death. Information on
              Lofoten Peaks is provided for general informational and trip-planning purposes only. It is not a promise
              that a route is open, safe, suitable, accurately mapped, or appropriate for you.
            </p>
            <ul>
              <li>Mountain and coastal conditions can change rapidly.</li>
              <li>Route descriptions, access details, and safety notes may become incomplete or outdated.</li>
              <li>Difficulty ratings are subjective and cannot account for your experience, fitness, equipment, or the current conditions.</li>
              <li>Maps, coordinates, and GPX-derived route lines may contain omissions, measurement errors, or an incorrect path.</li>
              <li>Weather can change unexpectedly, including when a displayed forecast appears favourable.</li>
              <li>Snow, ice, avalanche danger, rockfall, tides, flooding, erosion, construction, land access, and seasonal closures can alter or block a route.</li>
              <li>Mobile coverage, batteries, online maps, weather data, and satellite positioning cannot be relied upon.</li>
            </ul>
            <p>
              You must independently verify information and make your own decisions about whether to start, continue,
              change, or abandon a hike.
            </p>
          </Section>

          <SafetySection id="safety">
            <h2>
              <ShieldAlert size={25} aria-hidden="true" /> 6. Safety disclaimer
            </h2>
            <p>
              Mountain conditions in Northern Norway can change rapidly and may be very different from conditions at
              the trailhead. Before and during a hike, you should:
            </p>
            <ul>
              <li>check current weather forecasts, warnings, and local trail conditions;</li>
              <li>check current avalanche conditions whenever snow or avalanche terrain may be relevant;</li>
              <li>consider tides, river levels, flooding, daylight, seasonal closures, and local access rules;</li>
              <li>carry clothing, footwear, food, water, navigation tools, and emergency equipment appropriate for the route and season;</li>
              <li>carry a suitable map and know how to navigate without mobile data, GPS, or a GPX track;</li>
              <li>understand your own fitness, experience, and skill level and those of your group;</li>
              <li>tell a reliable person where you are going and when you expect to return;</li>
              <li>turn back early if weather, visibility, terrain, equipment, health, or group conditions deteriorate; and</li>
              <li>hire a qualified local mountain guide if you lack relevant experience or are uncertain about the route or conditions.</li>
            </ul>
            <p>
              Never rely solely on Lofoten Peaks, a phone, a displayed map, or GPX-derived data. You are responsible for
              your hiking decisions, preparation, route choice, and response to changing conditions.
            </p>
          </SafetySection>

          <Section id="liability">
            <h2>7. Limitation of liability</h2>
            <p>
              Lofoten Peaks uses reasonable efforts to present useful information but does not guarantee that the
              service or its content is accurate, complete, current, continuously available, or free from technical
              errors. Weather, maps, third-party data, and community content may be delayed, unavailable, or incorrect.
            </p>
            <p>
              To the extent permitted by Norwegian law, Lofoten Peaks is not responsible for injury, accidents, death,
              rescue or evacuation costs, property damage, equipment loss, navigation mistakes, missed transport,
              inaccurate route descriptions, inaccurate GPX-derived data, outdated information, changing natural
              conditions, or reliance on user-generated or third-party content when these result from the user's hiking
              decisions, failure to prepare, or risks inherent in outdoor activity.
            </p>
            <p>
              Lofoten Peaks is also not responsible for content, availability, security, or conduct on external websites
              and services that it does not control.
            </p>
            <LegalLimit>
              <strong>
                <Scale size={19} aria-hidden="true" /> Limits required by law
              </strong>
              <p>
                Nothing in these Terms excludes or limits liability for intentional misconduct, gross negligence,
                death or personal injury caused by an act or omission for which liability cannot lawfully be excluded,
                or any other liability or mandatory right that Norwegian or applicable consumer law does not allow to
                be excluded or limited.
              </p>
            </LegalLimit>
          </Section>

          <Section id="gpx">
            <h2>8. GPX and digital route disclaimer</h2>
            <p>
              Route lines displayed by Lofoten Peaks may be derived from an administrator-uploaded GPX file, stored
              route coordinates, or a simple line between known points. These lines are guidance only. They may contain
              recording errors, low-accuracy points, gaps, unsuitable deviations, or routes that no longer reflect the
              terrain, access rules, or current conditions.
            </p>
            <p>
              GPX-derived data must never replace navigation skills, a suitable map, local signs, or direct assessment
              of the terrain. Verify the route independently, carry an appropriate backup navigation method, and be
              prepared to turn back. The public account interface does not currently accept user GPX uploads.
            </p>
          </Section>

          <Section id="community">
            <h2>9. Community content</h2>
            <p>
              Comments, check-in notes, profile information, and hike recommendations express the views and experiences
              of individual users. They may contain mistakes and are not professional advice. A check-in or points award
              does not prove that a person safely completed a route or that conditions are suitable for anyone else.
            </p>
            <p>
              Hike recommendations can be held for review before publication, while comments are currently published as
              approved by default under the database rules. Moderation status concerns publication only; it is not a
              professional safety, accuracy, or legal verification.
            </p>
            <p>
              To report content that you reasonably believe is unlawful, rights-infringing, or dangerously misleading,
              email <a href="mailto:contact@lofotenpeaks.no">contact@lofotenpeaks.no</a> with the page link, a clear
              description, and the reason for the report. Reports will be assessed in context, and content may be
              restricted while a serious report is reviewed.
            </p>
          </Section>

          <Section id="intellectual-property">
            <h2>10. Intellectual property</h2>
            <p>
              Except for user content and clearly credited third-party material, the Lofoten Peaks name, branding,
              logos, original graphics, page design, text, and software are owned by or licensed to the operator and are
              protected by applicable intellectual-property law. You may use the public website for personal,
              non-commercial trip planning. You may not copy or republish substantial parts of the service without
              permission or another lawful basis.
            </p>
            <p>
              You retain ownership of content you submit. You grant Lofoten Peaks a non-exclusive, worldwide,
              royalty-free licence to host, store, reproduce, technically format, display, and distribute that content
              only as reasonably necessary to operate, secure, moderate, and present the service. This licence ends when
              the content is deleted, except for temporary backups, legal retention, and copies already lawfully shared
              through the service.
            </p>
            <p>
              Photographs and map data may have separate credits and licence terms. Those materials remain subject to
              the rights and conditions stated by their respective owners or providers.
            </p>
          </Section>

          <Section id="prohibited-conduct">
            <h2>11. Prohibited conduct</h2>
            <p>You must not use Lofoten Peaks to:</p>
            <ul>
              <li>break the law, facilitate illegal activity, trespass, or encourage violations of local restrictions;</li>
              <li>harass, threaten, discriminate against, or impersonate another person;</li>
              <li>publish spam, scams, unauthorised advertising, or deceptive links;</li>
              <li>infringe copyright, privacy, data-protection, or other rights;</li>
              <li>upload or transmit malware, harmful code, or content intended to disrupt the service;</li>
              <li>gain unauthorised access to accounts, administration tools, databases, or service infrastructure;</li>
              <li>submit false summit locations, spoof check-ins, manipulate points, or interfere with the leaderboard;</li>
              <li>publish intentionally false, reckless, or dangerously misleading route or safety information; or</li>
              <li>collect or expose another person's private information without a lawful basis.</li>
            </ul>
          </Section>

          <Section id="termination">
            <h2>12. Suspension and termination</h2>
            <p>
              Lofoten Peaks may restrict content, suspend features, or suspend or close an account where reasonably
              necessary to address a material or repeated breach of these Terms, protect users or the service, prevent
              fraud or manipulation, respond to a credible safety risk, or comply with law. Where appropriate, the user
              should receive an explanation and a reasonable opportunity to respond.
            </p>
            <p>
              You may stop using the service at any time. Because self-service account deletion is not implemented,
              requests to delete an account or contribution must be sent to the contact address in section 16. The
              handling and retention of personal data after termination are described in the{' '}
              <Link to="/privacy">Privacy Policy</Link>.
            </p>
          </Section>

          <Section id="service-changes">
            <h2>13. Changes to the Service</h2>
            <p>
              Features, content, integrations, availability, point rules, and moderation processes may be corrected,
              changed, suspended, or discontinued. Changes may be necessary for safety, maintenance, security, legal
              compliance, provider changes, or improvements to the hiking guide. Reasonable notice should be given when
              a change materially affects registered users, unless urgent safety, security, or legal action is needed.
            </p>
          </Section>

          <Section id="terms-changes">
            <h2>14. Changes to these Terms</h2>
            <p>
              These Terms may be updated when the service, legal requirements, or safety practices change. The revised
              Terms will show a new "Last updated" date. Material changes should be communicated through a prominent
              website notice and, where appropriate, by email or a new account acknowledgement before they take effect.
            </p>
            <p>
              Continued use after an updated version takes effect means the updated Terms apply to future use, but this
              does not remove rights or remedies that arose before the change or permit retroactive changes prohibited
              by law.
            </p>
          </Section>

          <Section id="governing-law">
            <h2>15. Governing law</h2>
            <p>
              These Terms are governed by Norwegian law. Any mandatory consumer protections or rights to bring a claim
              in another competent forum remain unaffected. The parties should first try to resolve a dispute by
              contacting each other in writing. If it cannot be resolved, it may be brought before the competent courts
              under applicable procedural law.
            </p>
          </Section>

          <Section id="contact">
            <h2>16. Operator and contact</h2>
            <p>Questions, content reports, and account-related requests can be sent to:</p>
            <ContactDetails>
              <strong>Sander</strong>
              <span>Operating Lofoten Peaks as a private individual</span>
              <span>Norway</span>
              <a href="mailto:contact@lofotenpeaks.no">contact@lofotenpeaks.no</a>
            </ContactDetails>
          </Section>
        </Article>
      </TermsLayout>
    </Page>
  );
}

export default TermsPage;

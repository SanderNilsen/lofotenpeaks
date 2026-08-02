import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Seo } from '../../components/common/Seo.jsx';
import { theme } from '../../styles/theme.js';

const Page = styled.div`
  margin: 0 auto;
  max-width: ${theme.pageWidth};
  min-width: 0;
  padding: 56px 24px 24px;

  @media (max-width: 640px) {
    padding: 32px 16px 16px;
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

  > p {
    color: ${theme.colors.muted};
    font-size: 1.08rem;
    line-height: 1.7;
    margin: 0;
    max-width: 760px;
  }

  @media (max-width: 640px) {
    gap: 14px;
    padding-bottom: 24px;

    h1 {
      font-size: 2.25rem;
      line-height: 1.08;
    }

    > p {
      font-size: 1rem;
      line-height: 1.6;
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
    gap: 30px;
    grid-template-columns: minmax(0, 1fr);
    padding-top: 28px;
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

    ol {
      column-gap: 24px;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 420px) {
    ol {
      grid-template-columns: 1fr;
    }
  }
`;

const Article = styled.article`
  display: grid;
  gap: 44px;
  min-width: 0;

  @media (max-width: 640px) {
    gap: 36px;
  }
`;

const Section = styled.section`
  min-width: 0;
  overflow-wrap: anywhere;
  scroll-margin-top: 104px;

  h2 {
    font-size: 1.65rem;
    line-height: 1.25;
    margin: 0 0 16px;
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
    margin: 12px 0 16px;
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

  @media (max-width: 640px) {
    h2 {
      font-size: 1.45rem;
      line-height: 1.3;
      margin-bottom: 14px;
    }

    p,
    li {
      line-height: 1.65;
    }

    ul {
      padding-left: 20px;
    }
  }
`;

const Summary = styled.div`
  background: #e8f2ef;
  border-left: 4px solid ${theme.colors.forest};
  border-radius: 0 ${theme.radii.medium} ${theme.radii.medium} 0;
  color: #183f35;
  padding: 18px 20px;

  p {
    line-height: 1.65;
    margin: 0;
  }

  @media (max-width: 560px) {
    padding: 16px;
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
  ['about', 'About Lofoten Peaks'],
  ['accounts', 'User accounts'],
  ['user-content', 'User content'],
  ['hiking-safety', 'Hiking information and safety'],
  ['gpx-community', 'GPX and community information'],
  ['acceptable-use', 'Acceptable use'],
  ['intellectual-property', 'Intellectual property'],
  ['liability', 'Limitation of liability'],
  ['external-services', 'External services'],
  ['termination', 'Suspension and termination'],
  ['changes', 'Changes'],
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
        description="Terms for using Lofoten Peaks, including accounts, community contributions, hiking information, GPX tracks, safety, and acceptable use."
      />

      <Hero>
        <h1>Terms of Service</h1>
        <p>
          These Terms explain how you may use Lofoten Peaks, contribute to the community, and make informed decisions
          when planning outdoor activities.
        </p>
        <Updated>Last updated: 1 August 2026</Updated>
        <Summary>
          <p>
            Lofoten Peaks is a practical planning resource. Route information can help you prepare, but conditions and
            access may change, so always check current information and use your own judgement before setting out.
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
              recommendation, you agree to these Terms. If you do not agree, you should not use account or community
              features.
            </p>
            <p>
              If you are not legally able to accept these Terms yourself, you may use account features only with the
              involvement and permission of a parent or legal guardian. These Terms do not reduce rights that cannot be
              waived under applicable law.
            </p>
            <p>
              Account registration records the accepted Terms version and server timestamp. Existing account holders
              must accept the current version in Account settings before posting a comment, recommending a hike, or
              submitting a route correction. A new version applies prospectively as described in section 12.
            </p>
          </Section>

          <Section id="about">
            <h2>2. About Lofoten Peaks</h2>
            <p>
              Lofoten Peaks is an online hiking guide operated by a private individual in Norway. It helps visitors
              discover mountain hikes and route information in Lofoten. Guide pages may include descriptions,
              photographs, difficulty ratings, distances, elevation, maps, route lines, planning notes, safety notes,
              and weather information.
            </p>
            <p>
              Registered users can maintain a public-facing profile identity, make location-verified summit check-ins,
              collect virtual points and activity badges, appear on a leaderboard, post comments, and submit text hike
              recommendations for review. Points and badges have no monetary value and cannot be transferred or
              exchanged.
            </p>
            <p>
              Public users cannot currently upload GPX files, route photographs, or reviews. GPX and gallery uploads
              are restricted to the site administrator. Available features may change as described in section 12.
            </p>
          </Section>

          <Section id="accounts">
            <h2>3. User Accounts</h2>
            <p>When you create or use an account, you agree to:</p>
            <ul>
              <li>provide accurate account and public profile information;</li>
              <li>use profile information that does not impersonate or mislead others;</li>
              <li>keep your password and access to your email account secure;</li>
              <li>notify Lofoten Peaks promptly if you believe your account has been compromised; and</li>
              <li>
                take responsibility for activity through your account unless it results from a security failure for
                which Lofoten Peaks is legally responsible.
              </li>
            </ul>
            <p>
              Accounts are personal and must not be sold or transferred. The current website does not provide
              a self-service password-reset interface. You can delete your account from Account settings after a recent
              sign-in and deliberate confirmation. Account assistance can be requested through the contact address in
              section 14. Personal data is handled as described in the <Link to="/privacy">Privacy Policy</Link>.
            </p>
          </Section>

          <Section id="user-content">
            <h2>4. User Content</h2>
            <p>
              User content currently includes profile names and biographies, comments, hike recommendations, and any
              summit check-in notes submitted before that option was removed. Route corrections and comment reports are
              also user submissions, but are visible only to the submitting user and authorised administrators. You
              remain responsible for content you submit and confirm that you have the rights and permissions needed to
              provide it.
            </p>
            <p>
              Content must not unlawfully disclose another person's personal or location information, infringe
              copyright or other rights, or be deliberately false, dangerous, defamatory, unlawful, or misleading.
              Route and safety information should be shared honestly and with appropriate uncertainty.
            </p>
            <p>
              Lofoten Peaks may review, reject, hide, or remove content that breaches these Terms, creates a credible
              safety concern, infringes rights, is unlawful, or is otherwise unsuitable for the hiking guide. Approval
              or publication does not mean that content has been professionally verified.
            </p>
          </Section>

          <Section id="hiking-safety">
            <h2>5. Hiking Information and Safety</h2>
            <p>
              Lofoten Peaks is designed to help users discover and explore hiking routes in Lofoten. We aim to provide
              useful information, but route descriptions, GPX tracks, maps, difficulty ratings, weather information,
              and community content may occasionally be incomplete, inaccurate, or out of date.
            </p>
            <p>
              Mountain and coastal conditions can change quickly because of weather, snow, ice, rockfall, tides,
              visibility, trail conditions, or other natural factors.
            </p>
            <p>
              Before starting a hike, assess current conditions, check relevant forecasts and warnings, carry suitable
              equipment, and make decisions based on your own experience and abilities. Be prepared to change plans or
              turn back when conditions are not suitable.
            </p>
            <p>
              Route descriptions and GPX tracks are helpful references only. They do not replace suitable maps,
              navigation skills, local knowledge, official information, or professional guidance where appropriate.
              If you are unfamiliar with the area, terrain, or conditions, consider advice from a qualified local
              guide.
            </p>
          </Section>

          <Section id="gpx-community">
            <h2>6. GPX Tracks and Community Information</h2>
            <p>
              Route lines may be derived from an administrator-uploaded GPX file, stored route coordinates, or known
              points. They may include recording errors, gaps, deviations, or information that no longer reflects the
              terrain, access rules, or current conditions. Verify route information independently and carry an
              appropriate backup navigation method.
            </p>
            <p>
              Comments, profile information, hike recommendations, and historical check-in notes reflect individual
              users' views and experiences. They may contain mistakes and are not professional advice. A check-in or
              points award does not show that current conditions are suitable for another person.
            </p>
            <p>
              Hike recommendations may be reviewed before publication, while comments are currently visible when
              submitted. Signed-in users can report a comment from the hike page, and can submit changed access, route,
              difficulty, or safety information through the route-correction form. Authorised administrators may hide or
              remove comments, approve or reject recommendations, and review route corrections. Moderation concerns
              publication only and is not a professional safety or accuracy check. Other legal or safety concerns can be
              sent to <a href="mailto:contact@lofotenpeaks.no">contact@lofotenpeaks.no</a>.
            </p>
          </Section>

          <Section id="acceptable-use">
            <h2>7. Acceptable Use</h2>
            <p>You must not use Lofoten Peaks to:</p>
            <ul>
              <li>break the law, facilitate illegal activity, trespass, or encourage breaches of local restrictions;</li>
              <li>harass, threaten, discriminate against, or impersonate another person;</li>
              <li>publish spam, scams, unauthorised advertising, or deceptive links;</li>
              <li>infringe copyright, privacy, data-protection, or other rights;</li>
              <li>upload or transmit malware or content intended to disrupt the service;</li>
              <li>gain unauthorised access to accounts, administration tools, databases, or infrastructure;</li>
              <li>submit false summit locations, spoof check-ins, manipulate points, or interfere with the leaderboard;</li>
              <li>publish intentionally false or dangerously misleading route or safety information; or</li>
              <li>collect or expose another person's private information without a lawful basis.</li>
            </ul>
          </Section>

          <Section id="intellectual-property">
            <h2>8. Intellectual Property</h2>
            <p>
              Except for user content and clearly credited third-party material, the Lofoten Peaks name, branding,
              logos, original graphics, page design, text, and software are owned by or licensed to the operator and
              protected by applicable intellectual-property law. You may use the public website for personal,
              non-commercial trip planning. You may not copy or republish substantial parts of the service without
              permission or another lawful basis.
            </p>
            <p>
              You retain ownership of content you submit. You grant Lofoten Peaks a non-exclusive, worldwide,
              royalty-free licence to host, store, reproduce, technically format, display, and distribute that content
              as reasonably necessary to operate, secure, moderate, and present the service. This licence ends when the
              content is deleted, except for temporary backups, lawful retention, and copies already lawfully shared
              through the service.
            </p>
            <p>
              Photographs and map data may have separate credits and licence terms. Those materials remain subject to
              the rights and conditions stated by their respective owners or providers.
            </p>
          </Section>

          <Section id="liability">
            <h2>9. Limitation of Liability</h2>
            <p>
              To the extent permitted by applicable law, Lofoten Peaks is not responsible for losses or damage arising
              from use of the platform, reliance on its content, or participation in outdoor activities.
            </p>
            <p>
              Users remain responsible for planning their activities, assessing current conditions, choosing routes
              that suit their experience and abilities, and making safe decisions.
            </p>
            <p>
              Lofoten Peaks is not responsible for the content, availability, security, or practices of third-party
              websites or services that it does not control.
            </p>
            <p>
              Nothing in these Terms excludes or limits any liability, remedy, or consumer right that cannot legally be
              excluded or limited under Norwegian or other applicable law.
            </p>
          </Section>

          <Section id="external-services">
            <h2>10. External Services</h2>
            <p>
              Lofoten Peaks uses external providers for functions such as hosting, authentication, data storage, maps,
              weather information, and optional analytics. Their availability and information may change, and Lofoten
              Peaks does not control their websites, systems, terms, or privacy practices.
            </p>
            <p>
              External links are provided for convenience. Review the terms and privacy information of a third-party
              service before using it or providing personal data. Providers currently used by the website are described
              in the <Link to="/privacy#providers">Privacy Policy</Link>.
            </p>
          </Section>

          <Section id="termination">
            <h2>11. Account Suspension or Termination</h2>
            <p>
              Lofoten Peaks may restrict content, suspend features, or suspend or close an account where reasonably
              necessary to address a material or repeated breach of these Terms, protect users or the service, prevent
              fraud or manipulation, respond to a credible safety concern, or comply with law. Where appropriate, the
              user should receive an explanation and a reasonable opportunity to respond.
            </p>
            <p>
              You may stop using the service at any time. Account settings provide controls to delete comments, withdraw
              hike recommendations, and delete the account after recent authentication. Contact the address in section
              14 to request deletion of an individual check-in or if a self-service action fails. Handling and retention
              of personal data after termination are described in the <Link to="/privacy">Privacy Policy</Link>.
            </p>
          </Section>

          <Section id="changes">
            <h2>12. Changes to the Service and Terms</h2>
            <p>
              Features, content, integrations, availability, point rules, and moderation processes may be corrected,
              changed, suspended, or discontinued. Reasonable notice should be given when a change materially affects
              registered users, unless urgent safety, security, or legal action is needed.
            </p>
            <p>
              These Terms may be updated when the service, legal requirements, or operating practices change. The
              revised Terms will show a new "Last updated" date. Material changes should be communicated through a
              prominent website notice and, where appropriate, by email or a new account acknowledgement before they
              take effect.
            </p>
            <p>
              Continued use after an updated version takes effect means the updated Terms apply to future use. This
              does not remove rights or remedies that arose before the change or permit retroactive changes prohibited
              by law.
            </p>
          </Section>

          <Section id="governing-law">
            <h2>13. Governing Law</h2>
            <p>
              These Terms are governed by Norwegian law. Mandatory consumer protections and rights to bring a claim in
              another competent forum remain unaffected. The parties should first try to resolve a dispute by
              contacting each other in writing. If it cannot be resolved, it may be brought before the competent courts
              under applicable procedural law.
            </p>
          </Section>

          <Section id="contact">
            <h2>14. Contact Information</h2>
            <p>Questions, content reports, and account-related requests can be sent to:</p>
            <ContactDetails>
              <strong>Lofoten Peaks</strong>
              <span>Operated by a private individual in Norway</span>
              <a href="mailto:contact@lofotenpeaks.no">contact@lofotenpeaks.no</a>
            </ContactDetails>
          </Section>
        </Article>
      </TermsLayout>
    </Page>
  );
}

export default TermsPage;

import { ImagePlus, Lock, Mountain, Save, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Seo } from '../../components/common/Seo.jsx';
import {
  createAdminMountainGuide,
  getIsAdmin,
  uploadAdminMountainImage,
} from '../../lib/supabase/api.js';
import { theme } from '../../styles/theme.js';
import { useAuth } from '../auth/AuthProvider.jsx';

const Page = styled.section`
  margin: 0 auto;
  max-width: 920px;
  padding: 48px 24px 0;
`;

const Header = styled.header`
  margin-bottom: 24px;

  h1 {
    font-size: clamp(2.2rem, 5vw, 3.8rem);
    margin: 0 0 10px;
  }

  p {
    color: ${theme.colors.muted};
    line-height: 1.6;
    margin: 0;
    max-width: 720px;
  }
`;

const Panel = styled.section`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  display: grid;
  gap: 18px;
  padding: 22px;

  h2 {
    align-items: center;
    display: flex;
    font-size: 1.25rem;
    gap: 8px;
    margin: 0;
  }
`;

const Form = styled.form`
  display: grid;
  gap: 22px;
`;

const Fieldset = styled.fieldset`
  border: 0;
  display: grid;
  gap: 14px;
  margin: 0;
  padding: 0;

  legend {
    font-size: 1.05rem;
    font-weight: 900;
    margin-bottom: 10px;
  }
`;

const Grid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.label`
  display: grid;
  gap: 6px;

  span {
    color: ${theme.colors.muted};
    font-size: 0.76rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  input,
  select,
  textarea {
    background: ${theme.colors.background};
    border: 1px solid ${theme.colors.line};
    border-radius: ${theme.radii.small};
    color: ${theme.colors.ink};
    min-height: 44px;
    padding: 10px 11px;
    width: 100%;
  }

  textarea {
    min-height: 130px;
    resize: vertical;
  }
`;

const FullField = styled(Field)`
  grid-column: 1 / -1;
`;

const Button = styled.button`
  align-items: center;
  background: ${theme.colors.forest};
  border: 0;
  border-radius: ${theme.radii.small};
  color: ${theme.colors.surface};
  cursor: pointer;
  display: inline-flex;
  font-weight: 900;
  gap: 8px;
  justify-content: center;
  justify-self: start;
  min-height: 44px;
  padding: 10px 14px;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }
`;

const Message = styled.p`
  background: ${({ $error }) => ($error ? '#f2e6dc' : theme.colors.background)};
  border: 1px solid ${({ $error }) => ($error ? '#dfc4af' : theme.colors.line)};
  border-radius: ${theme.radii.small};
  color: ${({ $error }) => ($error ? theme.colors.warning : theme.colors.muted)};
  font-weight: 800;
  line-height: 1.55;
  margin: 0;
  padding: 12px;

  a {
    color: ${theme.colors.forest};
  }
`;

const AccountLink = styled(Link)`
  align-items: center;
  background: ${theme.colors.forest};
  border-radius: ${theme.radii.small};
  color: ${theme.colors.surface};
  display: inline-flex;
  font-weight: 900;
  gap: 8px;
  justify-content: center;
  justify-self: start;
  min-height: 44px;
  padding: 10px 14px;
  text-decoration: none;
`;

const initialForm = {
  name: '',
  slug: '',
  region: '',
  heightMeters: '',
  difficulty: 'moderate',
  summary: '',
  description: '',
  weatherLocationId: 'west-lofoten',
  summitLat: '',
  summitLng: '',
  startLat: '',
  startLng: '',
  lengthKm: '',
  elevationGainMeters: '',
  estimatedDuration: '',
  routeNote: '',
};

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toNumber(value) {
  return Number(String(value).replace(',', '.'));
}

export function AdminPage() {
  const { isConfigured, isLoading: authIsLoading, user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [heroImage, setHeroImage] = useState(null);
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  useEffect(() => {
    if (!isConfigured || !user) {
      setIsAdmin(false);
      return undefined;
    }

    let isMounted = true;
    setIsCheckingAdmin(true);

    getIsAdmin()
      .then((value) => {
        if (isMounted) {
          setIsAdmin(value);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setStatus({ type: 'error', message: error.message });
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsCheckingAdmin(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isConfigured, user]);

  const previewSlug = useMemo(() => form.slug || slugify(form.name), [form.name, form.slug]);

  function updateField(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === 'name' && !current.slug ? { slug: slugify(value) } : {}),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ type: 'loading', message: '' });

    try {
      const slug = previewSlug;
      const heroImagePath = heroImage ? await uploadAdminMountainImage({ file: heroImage, slug }) : '';

      await createAdminMountainGuide({
        id: slug,
        slug,
        name: form.name.trim(),
        region: form.region.trim(),
        heightMeters: toNumber(form.heightMeters),
        summitLat: toNumber(form.summitLat),
        summitLng: toNumber(form.summitLng),
        difficulty: form.difficulty,
        summary: form.summary.trim(),
        description: form.description.trim(),
        weatherLocationId: form.weatherLocationId,
        heroImagePath,
        lengthKm: toNumber(form.lengthKm),
        elevationGainMeters: toNumber(form.elevationGainMeters),
        estimatedDuration: form.estimatedDuration.trim(),
        startLat: toNumber(form.startLat),
        startLng: toNumber(form.startLng),
        routeNote: form.routeNote.trim(),
      });

      setForm(initialForm);
      setHeroImage(null);
      setStatus({
        type: 'success',
        message: `Mountain guide created. Open /mountains/${slug} to review it.`,
      });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
  }

  return (
    <Page>
      <Seo
        title="Admin"
        description="Admin tools for adding and managing Lofoten Peaks mountain guides."
      />
      <Header>
        <h1>Admin</h1>
        <p>Add mountain guides to Supabase so new content no longer has to be coded into static files.</p>
      </Header>

      {!isConfigured && (
        <Panel>
          <Message>Supabase is not connected. Add the Vite Supabase environment variables first.</Message>
        </Panel>
      )}

      {isConfigured && authIsLoading && (
        <Panel>
          <Message>Checking account...</Message>
        </Panel>
      )}

      {isConfigured && !authIsLoading && !user && (
        <Panel>
          <h2>
            <Lock size={18} aria-hidden="true" /> Sign In Required
          </h2>
          <Message>Use your account before opening admin tools.</Message>
          <AccountLink to="/account">
            <Lock size={18} aria-hidden="true" /> Sign in
          </AccountLink>
        </Panel>
      )}

      {isConfigured && !authIsLoading && user && isCheckingAdmin && (
        <Panel>
          <Message>Checking admin access...</Message>
        </Panel>
      )}

      {isConfigured && !authIsLoading && user && !isCheckingAdmin && !isAdmin && (
        <Panel>
          <h2>
            <Lock size={18} aria-hidden="true" /> Admin Access Required
          </h2>
          <Message $error>
            Your account is signed in, but it has not been added to public.admin_users yet.
          </Message>
        </Panel>
      )}

      {isConfigured && !authIsLoading && user && !isCheckingAdmin && isAdmin && (
        <Panel>
          <h2>
            <ShieldCheck size={18} aria-hidden="true" /> Create Mountain Guide
          </h2>
          {status.message && <Message $error={status.type === 'error'}>{status.message}</Message>}
          <Form onSubmit={handleSubmit}>
            <Fieldset>
              <legend>Mountain</legend>
              <Grid>
                <Field>
                  <span>Name</span>
                  <input required value={form.name} onChange={(event) => updateField('name', event.target.value)} />
                </Field>
                <Field>
                  <span>Slug</span>
                  <input required value={previewSlug} onChange={(event) => updateField('slug', slugify(event.target.value))} />
                </Field>
                <Field>
                  <span>Region</span>
                  <input required value={form.region} onChange={(event) => updateField('region', event.target.value)} />
                </Field>
                <Field>
                  <span>Difficulty</span>
                  <select value={form.difficulty} onChange={(event) => updateField('difficulty', event.target.value)}>
                    <option value="easy">Easy</option>
                    <option value="moderate">Moderate</option>
                    <option value="hard">Hard</option>
                    <option value="expert">Expert</option>
                  </select>
                </Field>
                <Field>
                  <span>Height meters</span>
                  <input required type="number" min="0" value={form.heightMeters} onChange={(event) => updateField('heightMeters', event.target.value)} />
                </Field>
                <Field>
                  <span>Weather area</span>
                  <select value={form.weatherLocationId} onChange={(event) => updateField('weatherLocationId', event.target.value)}>
                    <option value="west-lofoten">West Lofoten</option>
                    <option value="central-lofoten">Central Lofoten</option>
                    <option value="east-lofoten">East Lofoten</option>
                  </select>
                </Field>
                <Field>
                  <span>Summit latitude</span>
                  <input required type="number" step="any" value={form.summitLat} onChange={(event) => updateField('summitLat', event.target.value)} />
                </Field>
                <Field>
                  <span>Summit longitude</span>
                  <input required type="number" step="any" value={form.summitLng} onChange={(event) => updateField('summitLng', event.target.value)} />
                </Field>
                <FullField>
                  <span>Summary</span>
                  <input required value={form.summary} onChange={(event) => updateField('summary', event.target.value)} />
                </FullField>
                <FullField>
                  <span>Description</span>
                  <textarea required value={form.description} onChange={(event) => updateField('description', event.target.value)} />
                </FullField>
                <FullField>
                  <span>Hero image</span>
                  <input accept="image/jpeg,image/png,image/webp" type="file" onChange={(event) => setHeroImage(event.target.files?.[0] ?? null)} />
                </FullField>
              </Grid>
            </Fieldset>

            <Fieldset>
              <legend>First trail</legend>
              <Grid>
                <Field>
                  <span>Length km</span>
                  <input required type="number" min="0" step="0.1" value={form.lengthKm} onChange={(event) => updateField('lengthKm', event.target.value)} />
                </Field>
                <Field>
                  <span>Elevation gain meters</span>
                  <input required type="number" min="0" value={form.elevationGainMeters} onChange={(event) => updateField('elevationGainMeters', event.target.value)} />
                </Field>
                <Field>
                  <span>Estimated duration</span>
                  <input required placeholder="2-3 hours round trip" value={form.estimatedDuration} onChange={(event) => updateField('estimatedDuration', event.target.value)} />
                </Field>
                <Field>
                  <span>Start latitude</span>
                  <input required type="number" step="any" value={form.startLat} onChange={(event) => updateField('startLat', event.target.value)} />
                </Field>
                <Field>
                  <span>Start longitude</span>
                  <input required type="number" step="any" value={form.startLng} onChange={(event) => updateField('startLng', event.target.value)} />
                </Field>
                <FullField>
                  <span>Route note</span>
                  <input value={form.routeNote} onChange={(event) => updateField('routeNote', event.target.value)} />
                </FullField>
              </Grid>
            </Fieldset>

            <Button type="submit" disabled={status.type === 'loading'}>
              {heroImage ? <ImagePlus size={18} aria-hidden="true" /> : <Mountain size={18} aria-hidden="true" />}
              <Save size={18} aria-hidden="true" /> Create guide
            </Button>
          </Form>
        </Panel>
      )}
    </Page>
  );
}

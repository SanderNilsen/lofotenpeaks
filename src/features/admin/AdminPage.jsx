import {
  ArrowDown,
  ArrowUp,
  Camera,
  FileUp,
  ImagePlus,
  Lock,
  Mountain,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Seo } from '../../components/common/Seo.jsx';
import {
  addAdminTrailImage,
  createAdminMountainGuide,
  deleteAdminTrailImage,
  getAdminMountainGuides,
  getIsAdmin,
  updateAdminTrailImage,
  updateAdminMountainGuide,
  uploadAdminMountainImage,
  uploadAdminTrailGpx,
} from '../../lib/supabase/api.js';
import { getRoutePointCount, parseGpxToLineString } from '../../lib/gpx.js';
import { theme } from '../../styles/theme.js';
import { useAuth } from '../auth/AuthProvider.jsx';

const Page = styled.section`
  margin: 0 auto;
  max-width: ${theme.pageWidth};
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

const AdminLayout = styled.div`
  align-items: start;
  display: grid;
  gap: 20px;
  grid-template-columns: minmax(260px, 0.38fr) minmax(0, 0.62fr);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
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

const ToolRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: space-between;
`;

const GuideList = styled.div`
  display: grid;
  gap: 10px;
`;

const GuideButton = styled.button`
  background: ${({ $active }) => ($active ? theme.colors.background : 'transparent')};
  border: 1px solid ${({ $active }) => ($active ? theme.colors.forest : theme.colors.line)};
  border-radius: ${theme.radii.small};
  color: ${theme.colors.ink};
  cursor: pointer;
  display: grid;
  gap: 5px;
  padding: 12px;
  text-align: left;

  strong {
    font-size: 0.98rem;
  }

  span {
    color: ${theme.colors.muted};
    font-size: 0.86rem;
    font-weight: 700;
    line-height: 1.35;
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

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
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
  min-height: 44px;
  padding: 10px 14px;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }
`;

const SecondaryButton = styled(Button)`
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.line};
  color: ${theme.colors.ink};
`;

const DangerButton = styled(SecondaryButton)`
  color: ${theme.colors.warning};
`;

const IconButton = styled(SecondaryButton)`
  min-height: 38px;
  padding: 8px 10px;
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

const UploadNote = styled.p`
  color: ${theme.colors.muted};
  font-size: 0.9rem;
  font-weight: 700;
  grid-column: 1 / -1;
  line-height: 1.5;
  margin: 0;
`;

const SmallTextarea = styled.textarea`
  min-height: 92px !important;
`;

const GalleryManager = styled.div`
  display: grid;
  gap: 14px;
  grid-column: 1 / -1;
`;

const GalleryItem = styled.article`
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  display: grid;
  gap: 12px;
  grid-template-columns: 130px minmax(0, 1fr);
  padding: 12px;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

const GalleryThumb = styled.img`
  aspect-ratio: 4 / 3;
  border-radius: ${theme.radii.small};
  object-fit: cover;
  width: 100%;
`;

const GalleryFields = styled.div`
  display: grid;
  gap: 10px;
`;

const GalleryActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const initialForm = {
  mountainId: '',
  trailId: '',
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
  parking: '',
  trailhead: '',
  bestSeason: '',
  suitableFor: '',
  gearNotes: '',
  access: '',
  beforeYouGo: '',
  safetyNotes: '',
  heroImagePath: '',
};

const initialGalleryMeta = {
  alt: '',
  source: '',
  license: '',
  creditUrl: '',
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

function linesFromText(value) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function textFromLines(value) {
  return Array.isArray(value) ? value.join('\n') : '';
}

function formValue(value) {
  return value ?? '';
}

function formFromGuide(guide) {
  const { mountain, trail } = guide;

  return {
    mountainId: mountain.id,
    trailId: trail?.id ?? mountain.id,
    name: mountain.name,
    slug: mountain.slug,
    region: mountain.region,
    heightMeters: formValue(mountain.heightMeters),
    difficulty: mountain.difficulty ?? 'moderate',
    summary: mountain.summary ?? '',
    description: mountain.description ?? '',
    weatherLocationId: mountain.weatherLocationId ?? 'west-lofoten',
    summitLat: formValue(mountain.coordinates?.lat),
    summitLng: formValue(mountain.coordinates?.lng),
    startLat: formValue(trail?.startPoint?.[0]),
    startLng: formValue(trail?.startPoint?.[1]),
    lengthKm: formValue(trail?.lengthKm),
    elevationGainMeters: formValue(trail?.elevationGainMeters),
    estimatedDuration: trail?.estimatedDuration ?? '',
    routeNote: trail?.routeNote ?? '',
    parking: trail?.guide?.parking ?? '',
    trailhead: trail?.guide?.trailhead ?? '',
    bestSeason: trail?.guide?.bestSeason ?? '',
    suitableFor: trail?.guide?.suitableFor ?? '',
    gearNotes: trail?.guide?.gearNotes ?? '',
    access: trail?.guide?.access ?? '',
    beforeYouGo: textFromLines(trail?.guide?.beforeYouGo),
    safetyNotes: textFromLines(trail?.safetyNotes),
    heroImagePath: mountain.heroImage?.src ?? '',
  };
}

function galleryFromGuide(guide) {
  return (guide.trail?.images ?? []).map((image, index) => ({
    id: image.id,
    src: image.src,
    filePath: image.filePath,
    alt: image.alt ?? '',
    source: image.source ?? '',
    license: image.license ?? '',
    creditUrl: image.creditUrl ?? '',
    sortOrder: image.sortOrder ?? (index + 1) * 10,
  }));
}

export function AdminPage() {
  const { isConfigured, isLoading: authIsLoading, user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);
  const [mode, setMode] = useState('create');
  const [guides, setGuides] = useState([]);
  const [guidesStatus, setGuidesStatus] = useState({ type: 'idle', message: '' });
  const [selectedMountainId, setSelectedMountainId] = useState('');
  const [form, setForm] = useState(initialForm);
  const [heroImage, setHeroImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [existingGalleryImages, setExistingGalleryImages] = useState([]);
  const [galleryMeta, setGalleryMeta] = useState(initialGalleryMeta);
  const [gpxFile, setGpxFile] = useState(null);
  const [routeGeojson, setRouteGeojson] = useState(null);
  const [gpxStatus, setGpxStatus] = useState({ type: 'idle', message: '' });
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  const selectedGuide = useMemo(
    () => guides.find((guide) => guide.mountain.id === selectedMountainId),
    [guides, selectedMountainId],
  );
  const previewSlug = useMemo(() => form.slug || slugify(form.name), [form.name, form.slug]);
  const existingImageCount = existingGalleryImages.length;

  const loadGuides = useCallback(async () => {
    setGuidesStatus({ type: 'loading', message: '' });

    try {
      const nextGuides = await getAdminMountainGuides();
      setGuides(nextGuides);
      setGuidesStatus({ type: 'success', message: '' });
      return nextGuides;
    } catch (error) {
      setGuidesStatus({ type: 'error', message: error.message });
      return [];
    }
  }, []);

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

  useEffect(() => {
    if (isAdmin) {
      loadGuides();
    }
  }, [isAdmin, loadGuides]);

  function updateField(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === 'name' && !current.slug && mode === 'create' ? { slug: slugify(value) } : {}),
    }));
  }

  function updateGalleryMeta(name, value) {
    setGalleryMeta((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function updateExistingGalleryImage(imageId, field, value) {
    setExistingGalleryImages((current) =>
      current.map((image) => (image.id === imageId ? { ...image, [field]: value } : image)),
    );
  }

  function moveExistingGalleryImage(index, direction) {
    setExistingGalleryImages((current) => {
      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }

      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(nextIndex, 0, item);

      return next.map((image, imageIndex) => ({
        ...image,
        sortOrder: (imageIndex + 1) * 10,
      }));
    });
  }

  async function handleGpxChange(file) {
    setGpxFile(null);
    setRouteGeojson(null);

    if (!file) {
      setGpxStatus({ type: 'idle', message: '' });
      return;
    }

    try {
      const text = await file.text();
      const parsedRoute = parseGpxToLineString(text);

      setGpxFile(file);
      setRouteGeojson(parsedRoute);
      setGpxStatus({
        type: 'success',
        message: `${getRoutePointCount(parsedRoute)} route points ready to save.`,
      });
    } catch (error) {
      setGpxStatus({ type: 'error', message: error.message });
    }
  }

  function startCreate() {
    setMode('create');
    setSelectedMountainId('');
    setForm(initialForm);
    setHeroImage(null);
    setGalleryImages([]);
    setExistingGalleryImages([]);
    setGalleryMeta(initialGalleryMeta);
    setGpxFile(null);
    setRouteGeojson(null);
    setGpxStatus({ type: 'idle', message: '' });
    setStatus({ type: 'idle', message: '' });
  }

  function startEdit(guide) {
    setMode('edit');
    setSelectedMountainId(guide.mountain.id);
    setForm(formFromGuide(guide));
    setHeroImage(null);
    setGalleryImages([]);
    setExistingGalleryImages(galleryFromGuide(guide));
    setGalleryMeta(initialGalleryMeta);
    setGpxFile(null);
    setRouteGeojson(null);
    setGpxStatus(
      guide.trail?.routeGeojson
        ? {
            type: 'success',
            message: `${getRoutePointCount(guide.trail.routeGeojson)} saved route points are connected to this guide.`,
          }
        : { type: 'idle', message: '' },
    );
    setStatus({ type: 'idle', message: '' });
  }

  function createPayload(heroImagePath, gpxStoragePath) {
    const slug = previewSlug;
    const guide = {
      parking: form.parking.trim(),
      trailhead: form.trailhead.trim(),
      bestSeason: form.bestSeason.trim(),
      suitableFor: form.suitableFor.trim(),
      gearNotes: form.gearNotes.trim(),
      access: form.access.trim(),
      beforeYouGo: linesFromText(form.beforeYouGo),
    };

    return {
      id: form.mountainId || slug,
      trailId: form.trailId || slug,
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
      routeGeojson,
      gpxStoragePath,
      safetyNotes: linesFromText(form.safetyNotes),
      guide,
    };
  }

  async function saveGalleryImages({ trailId, slug }) {
    for (const [index, file] of galleryImages.entries()) {
      const filePath = await uploadAdminMountainImage({ file, slug });

      await addAdminTrailImage({
        trailId,
        filePath,
        alt: galleryMeta.alt.trim() || `${form.name.trim()} trail view`,
        source: galleryMeta.source.trim(),
        license: galleryMeta.license.trim(),
        creditUrl: galleryMeta.creditUrl.trim(),
        sortOrder: (existingImageCount + index + 1) * 10,
      });
    }
  }

  async function saveExistingGalleryImages() {
    await Promise.all(
      existingGalleryImages.map((image, index) =>
        updateAdminTrailImage({
          ...image,
          sortOrder: (index + 1) * 10,
        }),
      ),
    );
  }

  async function handleSaveGalleryChanges() {
    setStatus({ type: 'loading', message: '' });

    try {
      await saveExistingGalleryImages();
      const nextGuides = await loadGuides();
      const savedGuide = nextGuides.find((guide) => guide.mountain.id === form.mountainId);

      if (savedGuide) {
        setExistingGalleryImages(galleryFromGuide(savedGuide));
      }

      setStatus({ type: 'success', message: 'Gallery changes saved.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
  }

  async function handleDeleteGalleryImage(image) {
    const shouldDelete = window.confirm('Delete this image from the public guide?');

    if (!shouldDelete) {
      return;
    }

    setStatus({ type: 'loading', message: '' });

    try {
      await deleteAdminTrailImage(image);
      setExistingGalleryImages((current) =>
        current
          .filter((currentImage) => currentImage.id !== image.id)
          .map((image, index) => ({
            ...image,
            sortOrder: (index + 1) * 10,
          })),
      );
      setStatus({ type: 'success', message: 'Gallery image deleted.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ type: 'loading', message: '' });

    try {
      if (gpxStatus.type === 'error') {
        throw new Error('Fix or clear the GPX file before saving.');
      }

      const slug = previewSlug;
      const heroImagePath = heroImage
        ? await uploadAdminMountainImage({ file: heroImage, slug })
        : form.heroImagePath;
      const gpxStoragePath = gpxFile ? await uploadAdminTrailGpx({ file: gpxFile, slug }) : undefined;
      const payload = createPayload(heroImagePath, gpxStoragePath);
      const result =
        mode === 'edit'
          ? await updateAdminMountainGuide(payload)
          : await createAdminMountainGuide(payload);
      const trailId = result?.trail_id ?? payload.trailId;

      await saveGalleryImages({ trailId, slug });
      if (mode === 'edit') {
        await saveExistingGalleryImages();
      }

      const nextGuides = await loadGuides();
      const savedGuide = nextGuides.find((guide) => guide.mountain.id === payload.id);

      if (mode === 'edit' && savedGuide) {
        setForm(formFromGuide(savedGuide));
        setSelectedMountainId(savedGuide.mountain.id);
        setExistingGalleryImages(galleryFromGuide(savedGuide));
      } else {
        setForm(initialForm);
        setSelectedMountainId('');
        setMode('create');
        setExistingGalleryImages([]);
      }

      setHeroImage(null);
      setGalleryImages([]);
      setGalleryMeta(initialGalleryMeta);
      setGpxFile(null);
      setRouteGeojson(null);
      setGpxStatus({ type: 'idle', message: '' });
      setStatus({
        type: 'success',
        message:
          mode === 'edit'
            ? `Mountain guide updated. Open /mountains/${slug} to review it.`
            : `Mountain guide created. Open /mountains/${slug} to review it.`,
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
        <p>Add and update Supabase mountain guides without editing static frontend files.</p>
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
        <AdminLayout>
          <Panel>
            <ToolRow>
              <h2>
                <Mountain size={18} aria-hidden="true" /> Guides
              </h2>
              <ButtonRow>
                <SecondaryButton type="button" onClick={loadGuides}>
                  <RefreshCw size={16} aria-hidden="true" /> Refresh
                </SecondaryButton>
                <Button type="button" onClick={startCreate}>
                  <Plus size={16} aria-hidden="true" /> New
                </Button>
              </ButtonRow>
            </ToolRow>
            {guidesStatus.type === 'loading' && <Message>Loading guides...</Message>}
            {guidesStatus.type === 'error' && <Message $error>{guidesStatus.message}</Message>}
            <GuideList>
              {guides.map((guide) => (
                <GuideButton
                  key={`${guide.mountain.id}-${guide.trail?.id ?? 'mountain'}`}
                  type="button"
                  $active={guide.mountain.id === selectedMountainId}
                  onClick={() => startEdit(guide)}
                >
                  <strong>{guide.mountain.name}</strong>
                  <span>
                    {guide.mountain.region}
                    {guide.trail ? ` · ${guide.trail.estimatedDuration}` : ''}
                  </span>
                </GuideButton>
              ))}
            </GuideList>
          </Panel>

          <Panel>
            <h2>
              {mode === 'edit' ? <Save size={18} aria-hidden="true" /> : <ShieldCheck size={18} aria-hidden="true" />}
              {mode === 'edit' ? 'Edit Mountain Guide' : 'Create Mountain Guide'}
            </h2>
            {mode === 'edit' && (
              <Message>
                Editing {form.name}. <Link to={`/mountains/${previewSlug}`}>Open public guide</Link>
              </Message>
            )}
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
                    <input
                      required
                      value={previewSlug}
                      onChange={(event) => updateField('slug', slugify(event.target.value))}
                    />
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
                    <input
                      required
                      type="number"
                      min="0"
                      value={form.heightMeters}
                      onChange={(event) => updateField('heightMeters', event.target.value)}
                    />
                  </Field>
                  <Field>
                    <span>Weather area</span>
                    <select
                      value={form.weatherLocationId}
                      onChange={(event) => updateField('weatherLocationId', event.target.value)}
                    >
                      <option value="west-lofoten">West Lofoten</option>
                      <option value="central-lofoten">Central Lofoten</option>
                      <option value="east-lofoten">East Lofoten</option>
                    </select>
                  </Field>
                  <Field>
                    <span>Summit latitude</span>
                    <input
                      required
                      type="number"
                      step="any"
                      value={form.summitLat}
                      onChange={(event) => updateField('summitLat', event.target.value)}
                    />
                  </Field>
                  <Field>
                    <span>Summit longitude</span>
                    <input
                      required
                      type="number"
                      step="any"
                      value={form.summitLng}
                      onChange={(event) => updateField('summitLng', event.target.value)}
                    />
                  </Field>
                  <FullField>
                    <span>Summary</span>
                    <input required value={form.summary} onChange={(event) => updateField('summary', event.target.value)} />
                  </FullField>
                  <FullField>
                    <span>Description</span>
                    <textarea
                      required
                      value={form.description}
                      onChange={(event) => updateField('description', event.target.value)}
                    />
                  </FullField>
                  <FullField>
                    <span>{mode === 'edit' ? 'Replace hero image' : 'Hero image'}</span>
                    <input
                      accept="image/jpeg,image/png,image/webp"
                      type="file"
                      onChange={(event) => setHeroImage(event.target.files?.[0] ?? null)}
                    />
                  </FullField>
                </Grid>
              </Fieldset>

              <Fieldset>
                <legend>Trail</legend>
                <Grid>
                  <Field>
                    <span>Length km</span>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.1"
                      value={form.lengthKm}
                      onChange={(event) => updateField('lengthKm', event.target.value)}
                    />
                  </Field>
                  <Field>
                    <span>Elevation gain meters</span>
                    <input
                      required
                      type="number"
                      min="0"
                      value={form.elevationGainMeters}
                      onChange={(event) => updateField('elevationGainMeters', event.target.value)}
                    />
                  </Field>
                  <Field>
                    <span>Estimated duration</span>
                    <input
                      required
                      placeholder="2-3 hours round trip"
                      value={form.estimatedDuration}
                      onChange={(event) => updateField('estimatedDuration', event.target.value)}
                    />
                  </Field>
                  <Field>
                    <span>Start latitude</span>
                    <input
                      required
                      type="number"
                      step="any"
                      value={form.startLat}
                      onChange={(event) => updateField('startLat', event.target.value)}
                    />
                  </Field>
                  <Field>
                    <span>Start longitude</span>
                    <input
                      required
                      type="number"
                      step="any"
                      value={form.startLng}
                      onChange={(event) => updateField('startLng', event.target.value)}
                    />
                  </Field>
                  <FullField>
                    <span>Route note</span>
                    <input value={form.routeNote} onChange={(event) => updateField('routeNote', event.target.value)} />
                  </FullField>
                  <FullField>
                    <span>GPX route file</span>
                    <input
                      accept=".gpx,application/gpx+xml,application/xml,text/xml"
                      type="file"
                      onChange={(event) => handleGpxChange(event.target.files?.[0] ?? null)}
                    />
                  </FullField>
                  {gpxStatus.message && (
                    <UploadNote as="div">
                      <Message $error={gpxStatus.type === 'error'}>{gpxStatus.message}</Message>
                    </UploadNote>
                  )}
                </Grid>
              </Fieldset>

              <Fieldset>
                <legend>Planning Notes</legend>
                <Grid>
                  <Field>
                    <span>Parking</span>
                    <SmallTextarea value={form.parking} onChange={(event) => updateField('parking', event.target.value)} />
                  </Field>
                  <Field>
                    <span>Trailhead</span>
                    <SmallTextarea
                      value={form.trailhead}
                      onChange={(event) => updateField('trailhead', event.target.value)}
                    />
                  </Field>
                  <Field>
                    <span>Best season</span>
                    <SmallTextarea
                      value={form.bestSeason}
                      onChange={(event) => updateField('bestSeason', event.target.value)}
                    />
                  </Field>
                  <Field>
                    <span>Suitable for</span>
                    <SmallTextarea
                      value={form.suitableFor}
                      onChange={(event) => updateField('suitableFor', event.target.value)}
                    />
                  </Field>
                  <Field>
                    <span>Gear notes</span>
                    <SmallTextarea
                      value={form.gearNotes}
                      onChange={(event) => updateField('gearNotes', event.target.value)}
                    />
                  </Field>
                  <Field>
                    <span>Access</span>
                    <SmallTextarea value={form.access} onChange={(event) => updateField('access', event.target.value)} />
                  </Field>
                  <FullField>
                    <span>Before you go checklist</span>
                    <SmallTextarea
                      placeholder="One checklist item per line"
                      value={form.beforeYouGo}
                      onChange={(event) => updateField('beforeYouGo', event.target.value)}
                    />
                  </FullField>
                  <FullField>
                    <span>Safety notes</span>
                    <SmallTextarea
                      required
                      placeholder="One safety note per line"
                      value={form.safetyNotes}
                      onChange={(event) => updateField('safetyNotes', event.target.value)}
                    />
                  </FullField>
                </Grid>
              </Fieldset>

              <Fieldset>
                <legend>Gallery</legend>
                <Grid>
                  {mode === 'edit' && existingGalleryImages.length > 0 && (
                    <GalleryManager>
                      {existingGalleryImages.map((image, index) => (
                        <GalleryItem key={image.id}>
                          <GalleryThumb src={image.src} alt={image.alt || 'Trail gallery image'} />
                          <GalleryFields>
                            <Grid>
                              <Field>
                                <span>Alt text</span>
                                <input
                                  value={image.alt}
                                  onChange={(event) =>
                                    updateExistingGalleryImage(image.id, 'alt', event.target.value)
                                  }
                                />
                              </Field>
                              <Field>
                                <span>Source</span>
                                <input
                                  value={image.source}
                                  onChange={(event) =>
                                    updateExistingGalleryImage(image.id, 'source', event.target.value)
                                  }
                                />
                              </Field>
                              <Field>
                                <span>License</span>
                                <input
                                  value={image.license}
                                  onChange={(event) =>
                                    updateExistingGalleryImage(image.id, 'license', event.target.value)
                                  }
                                />
                              </Field>
                              <Field>
                                <span>Credit URL</span>
                                <input
                                  type="url"
                                  value={image.creditUrl}
                                  onChange={(event) =>
                                    updateExistingGalleryImage(image.id, 'creditUrl', event.target.value)
                                  }
                                />
                              </Field>
                            </Grid>
                            <GalleryActions>
                              <IconButton
                                disabled={index === 0 || status.type === 'loading'}
                                type="button"
                                onClick={() => moveExistingGalleryImage(index, -1)}
                              >
                                <ArrowUp size={16} aria-hidden="true" /> Up
                              </IconButton>
                              <IconButton
                                disabled={index === existingGalleryImages.length - 1 || status.type === 'loading'}
                                type="button"
                                onClick={() => moveExistingGalleryImage(index, 1)}
                              >
                                <ArrowDown size={16} aria-hidden="true" /> Down
                              </IconButton>
                              <DangerButton
                                disabled={status.type === 'loading'}
                                type="button"
                                onClick={() => handleDeleteGalleryImage(image)}
                              >
                                <Trash2 size={16} aria-hidden="true" /> Delete
                              </DangerButton>
                            </GalleryActions>
                          </GalleryFields>
                        </GalleryItem>
                      ))}
                      <ButtonRow>
                        <SecondaryButton
                          disabled={status.type === 'loading'}
                          type="button"
                          onClick={handleSaveGalleryChanges}
                        >
                          <Save size={16} aria-hidden="true" /> Save gallery changes
                        </SecondaryButton>
                      </ButtonRow>
                    </GalleryManager>
                  )}
                  <FullField>
                    <span>Add gallery images</span>
                    <input
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      type="file"
                      onChange={(event) => setGalleryImages([...(event.target.files ?? [])])}
                    />
                  </FullField>
                  <UploadNote>
                    {galleryImages.length > 0
                      ? `${galleryImages.length} gallery image${galleryImages.length === 1 ? '' : 's'} selected.`
                      : `${existingImageCount} gallery image${existingImageCount === 1 ? '' : 's'} saved for this guide.`}
                  </UploadNote>
                  <Field>
                    <span>Image alt text</span>
                    <input value={galleryMeta.alt} onChange={(event) => updateGalleryMeta('alt', event.target.value)} />
                  </Field>
                  <Field>
                    <span>Source</span>
                    <input
                      placeholder="Your name, photographer, or Unsplash"
                      value={galleryMeta.source}
                      onChange={(event) => updateGalleryMeta('source', event.target.value)}
                    />
                  </Field>
                  <Field>
                    <span>License</span>
                    <input
                      placeholder="Own photo, used with permission, Unsplash"
                      value={galleryMeta.license}
                      onChange={(event) => updateGalleryMeta('license', event.target.value)}
                    />
                  </Field>
                  <Field>
                    <span>Credit URL</span>
                    <input
                      type="url"
                      value={galleryMeta.creditUrl}
                      onChange={(event) => updateGalleryMeta('creditUrl', event.target.value)}
                    />
                  </Field>
                </Grid>
              </Fieldset>

              <ButtonRow>
                <Button type="submit" disabled={status.type === 'loading'}>
                  {gpxFile ? (
                    <FileUp size={18} aria-hidden="true" />
                  ) : galleryImages.length > 0 || heroImage ? (
                    <ImagePlus size={18} aria-hidden="true" />
                  ) : (
                    <Save size={18} aria-hidden="true" />
                  )}
                  {mode === 'edit' ? 'Update guide' : 'Create guide'}
                </Button>
                {mode === 'edit' && (
                  <SecondaryButton type="button" onClick={startCreate}>
                    <Plus size={18} aria-hidden="true" /> New guide
                  </SecondaryButton>
                )}
                {galleryImages.length > 0 && (
                  <SecondaryButton type="button" onClick={() => setGalleryImages([])}>
                    <Camera size={18} aria-hidden="true" /> Clear images
                  </SecondaryButton>
                )}
                {gpxFile && (
                  <SecondaryButton
                    type="button"
                    onClick={() => {
                      setGpxFile(null);
                      setRouteGeojson(null);
                      setGpxStatus({ type: 'idle', message: '' });
                    }}
                  >
                    <FileUp size={18} aria-hidden="true" /> Clear GPX
                  </SecondaryButton>
                )}
              </ButtonRow>
            </Form>
          </Panel>
        </AdminLayout>
      )}
    </Page>
  );
}

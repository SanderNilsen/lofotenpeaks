import {
  ArrowDown,
  ArrowUp,
  Camera,
  Eye,
  EyeOff,
  FileUp,
  ImagePlus,
  Lock,
  Mountain,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  Undo2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Seo } from '../../components/common/Seo.jsx';
import {
  addAdminTrailImage,
  createAdminMountainGuide,
  deleteAdminMountainGuide,
  deleteAdminTrailGpx,
  deleteAdminTrailImage,
  getAdminMountainGuides,
  getIsAdmin,
  setAdminMountainGuidePublished,
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
  padding: 48px 24px 72px;
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
  grid-template-columns: minmax(260px, 320px) minmax(0, 1fr);

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

const GuidePanel = styled(Panel)`
  align-content: start;
  grid-template-rows: auto auto auto minmax(0, 1fr);
  height: calc(100vh - 108px);
  min-height: 0;
  overflow: hidden;
  position: sticky;
  top: 92px;

  @media (max-width: 900px) {
    height: auto;
    overflow: visible;
    position: static;
  }
`;

const EditorPanel = styled(Panel)`
  min-width: 0;
  scroll-margin-top: 92px;
`;

const ToolRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: space-between;
`;

const GuideTools = styled.div`
  display: grid;
  gap: 10px;
`;

const GuideStatus = styled.div`
  display: grid;
  gap: 8px;

  &:empty {
    display: none;
  }
`;

const SearchField = styled.label`
  display: block;
  position: relative;

  svg {
    color: ${theme.colors.muted};
    left: 12px;
    pointer-events: none;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }

  input {
    background: ${theme.colors.background};
    border: 1px solid ${theme.colors.line};
    border-radius: ${theme.radii.small};
    color: ${theme.colors.ink};
    min-height: 44px;
    padding: 10px 12px 10px 38px;
    width: 100%;
  }

  input:focus {
    border-color: ${theme.colors.forest};
    outline: 2px solid rgba(47, 111, 94, 0.16);
  }
`;

const GuideFilterRow = styled.div`
  align-items: center;
  display: flex;
  gap: 10px;
  justify-content: space-between;

  select {
    background: ${theme.colors.background};
    border: 1px solid ${theme.colors.line};
    border-radius: ${theme.radii.small};
    color: ${theme.colors.ink};
    min-height: 38px;
    padding: 7px 10px;
  }

  span {
    color: ${theme.colors.muted};
    font-size: 0.82rem;
    font-weight: 800;
  }
`;

const GuideList = styled.div`
  display: grid;
  gap: 10px;
  max-height: calc(100vh - 330px);
  min-height: 0;
  overflow-y: auto;
  padding-right: 3px;

  @media (max-width: 900px) {
    max-height: 380px;
  }
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
  transition:
    background 150ms ease,
    border-color 150ms ease,
    transform 150ms ease;

  &:hover {
    background: ${theme.colors.background};
    border-color: ${theme.colors.forest};
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 3px solid rgba(47, 111, 94, 0.2);
    outline-offset: 1px;
  }

  &:disabled {
    cursor: wait;
    opacity: 0.65;
    transform: none;
  }

  strong {
    font-size: 0.98rem;
  }

  > span {
    color: ${theme.colors.muted};
    font-size: 0.86rem;
    font-weight: 700;
    line-height: 1.35;
  }
`;

const GuideMeta = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: space-between;

  > span {
    color: ${theme.colors.muted};
    font-size: 0.78rem;
    font-weight: 800;
  }
`;

const EmptyState = styled.p`
  color: ${theme.colors.muted};
  font-weight: 700;
  line-height: 1.5;
  margin: 0;
  padding: 12px 2px;
`;

const EditorHeader = styled.div`
  align-items: start;
  display: flex;
  gap: 14px;
  justify-content: space-between;

  div {
    display: grid;
    gap: 5px;
  }

  small {
    color: ${theme.colors.muted};
    font-weight: 700;
    line-height: 1.4;
  }

  @media (max-width: 680px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

const SectionNav = styled.nav`
  background: rgba(255, 255, 255, 0.96);
  border-bottom: 1px solid ${theme.colors.line};
  border-top: 1px solid ${theme.colors.line};
  display: flex;
  gap: 8px;
  margin: 0 -22px;
  overflow-x: auto;
  padding: 10px 22px;
  position: sticky;
  top: 76px;
  z-index: 10;

  a {
    background: ${theme.colors.background};
    border: 1px solid ${theme.colors.line};
    border-radius: 999px;
    color: ${theme.colors.ink};
    flex: 0 0 auto;
    font-size: 0.82rem;
    font-weight: 800;
    padding: 8px 11px;
    text-decoration: none;
  }

  a:hover,
  a:focus-visible {
    border-color: ${theme.colors.forest};
    color: ${theme.colors.forest};
  }
`;

const Form = styled.form`
  display: grid;
  gap: 22px;
`;

const Fieldset = styled.fieldset`
  background: #fbfaf8;
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  display: grid;
  gap: 14px;
  margin: 0;
  padding: 18px;
  scroll-margin-top: 150px;

  legend {
    background: ${theme.colors.surface};
    border: 1px solid ${theme.colors.line};
    border-radius: 999px;
    font-size: 1.05rem;
    font-weight: 900;
    padding: 7px 12px;
  }

  &:disabled {
    opacity: 0.75;
  }
`;

const SectionIntro = styled.p`
  color: ${theme.colors.muted};
  font-size: 0.9rem;
  line-height: 1.5;
  margin: -2px 0 2px;
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

  input:focus,
  select:focus,
  textarea:focus {
    border-color: ${theme.colors.forest};
    outline: 2px solid rgba(47, 111, 94, 0.16);
  }

  small {
    color: ${theme.colors.muted};
    font-size: 0.78rem;
    font-weight: 600;
    line-height: 1.4;
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
  text-decoration: none;

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

const DangerZone = styled.div`
  align-items: center;
  background: #f8eee7;
  border: 1px solid #dfc4af;
  border-radius: ${theme.radii.medium};
  display: flex;
  gap: 14px;
  justify-content: space-between;
  padding: 14px;

  div {
    display: grid;
    gap: 3px;
  }

  strong {
    color: ${theme.colors.warning};
  }

  span {
    color: ${theme.colors.muted};
    font-size: 0.84rem;
    line-height: 1.45;
  }

  @media (max-width: 680px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

const SaveBar = styled.div`
  align-items: center;
  background: rgba(255, 255, 255, 0.97);
  border-top: 1px solid ${theme.colors.line};
  bottom: 0;
  box-shadow: 0 -12px 24px rgba(38, 40, 36, 0.08);
  display: flex;
  gap: 14px;
  justify-content: space-between;
  margin: 0 -22px -22px;
  padding: 14px 22px;
  position: sticky;
  z-index: 12;

  @media (max-width: 680px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

const SaveSummary = styled.div`
  align-items: center;
  color: ${({ $error }) => ($error ? theme.colors.warning : theme.colors.muted)};
  display: flex;
  font-size: 0.82rem;
  font-weight: 800;
  gap: 8px;
  line-height: 1.4;
  min-width: 0;

  &::before {
    background: ${({ $dirty, $error }) =>
      $error ? theme.colors.warning : $dirty ? '#d9962b' : theme.colors.forest};
    border-radius: 999px;
    content: '';
    flex: 0 0 auto;
    height: 8px;
    width: 8px;
  }
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

const UploadControls = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  grid-column: 1 / -1;
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

const HeroChoice = styled.label`
  align-items: center;
  background: ${({ $active }) => ($active ? '#e4eee6' : theme.colors.surface)};
  border: 1px solid ${({ $active }) => ($active ? theme.colors.forest : theme.colors.line)};
  border-radius: 999px;
  color: ${({ $active }) => ($active ? theme.colors.forest : theme.colors.ink)};
  cursor: pointer;
  display: inline-flex;
  font-size: 0.78rem;
  font-weight: 900;
  gap: 7px;
  min-height: 36px;
  padding: 7px 10px;

  input {
    accent-color: ${theme.colors.forest};
    margin: 0;
  }
`;

const GalleryFileName = styled.strong`
  font-size: 0.95rem;
  overflow-wrap: anywhere;
`;

const SavedAsset = styled.div`
  align-items: center;
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  display: flex;
  gap: 12px;
  grid-column: 1 / -1;
  justify-content: space-between;
  padding: 12px;

  > div {
    display: grid;
    gap: 4px;
    min-width: 0;
  }

  strong {
    font-size: 0.95rem;
  }

  span {
    color: ${theme.colors.muted};
    font-size: 0.84rem;
    font-weight: 700;
    line-height: 1.45;
    overflow-wrap: anywhere;
  }

  @media (max-width: 680px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

const HeroPreview = styled(SavedAsset)`
  align-items: start;
  justify-content: start;

  @media (max-width: 680px) {
    align-items: stretch;
  }
`;

const HeroPreviewImage = styled.img`
  aspect-ratio: 16 / 10;
  border-radius: ${theme.radii.small};
  flex: 0 0 180px;
  object-fit: cover;
  width: 180px;

  @media (max-width: 680px) {
    flex-basis: auto;
    width: 100%;
  }
`;

const ToggleField = styled.label`
  align-items: start;
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.small};
  cursor: pointer;
  display: grid;
  gap: 10px;
  grid-column: 1 / -1;
  grid-template-columns: auto minmax(0, 1fr);
  padding: 12px;

  input {
    accent-color: ${theme.colors.forest};
    height: 18px;
    margin-top: 2px;
    width: 18px;
  }

  strong {
    display: block;
    font-size: 0.95rem;
    margin-bottom: 3px;
  }

  span {
    color: ${theme.colors.muted};
    display: block;
    font-size: 0.84rem;
    font-weight: 700;
    line-height: 1.45;
  }
`;

const StatusPill = styled.span`
  align-items: center;
  background: ${({ $published }) => ($published ? '#e4eee6' : '#f2e6dc')};
  border-radius: 999px;
  color: ${({ $published }) => ($published ? theme.colors.forest : theme.colors.warning)};
  display: inline-flex;
  font-size: 0.74rem !important;
  font-weight: 900 !important;
  gap: 5px;
  justify-self: start;
  line-height: 1;
  padding: 6px 8px;
  text-transform: uppercase;
`;

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_GPX_SIZE_BYTES = 2 * 1024 * 1024;

const initialForm = {
  mountainId: '',
  trailId: '',
  published: true,
  name: '',
  slug: '',
  region: '',
  heightMeters: '',
  checkInRadiusMeters: '200',
  checkInPoints: '10',
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
  return value === null || value === undefined ? '' : String(value);
}

function formFromGuide(guide) {
  const { mountain, trail } = guide;

  return {
    mountainId: mountain.id,
    trailId: trail?.id ?? mountain.id,
    published: mountain.published ?? true,
    name: mountain.name,
    slug: mountain.slug,
    region: mountain.region,
    heightMeters: formValue(mountain.heightMeters),
    checkInRadiusMeters: formValue(mountain.checkInRadiusMeters ?? 200),
    checkInPoints: formValue(mountain.checkInPoints ?? 10),
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

function assertFileSize(file, maxBytes, label) {
  if (file.size > maxBytes) {
    throw new Error(`${label} must be smaller than ${Math.round(maxBytes / 1024 / 1024)} MB.`);
  }
}

function isValidCoordinate(value, min, max) {
  return Number.isFinite(value) && value >= min && value <= max;
}

function validateGuidePayload(payload) {
  if (!payload.slug) {
    throw new Error('Add a valid slug before saving.');
  }

  if (!payload.heroImagePath) {
    throw new Error('Add at least one gallery image and choose a hero image before saving this guide.');
  }

  if (!Number.isFinite(payload.heightMeters) || payload.heightMeters <= 0) {
    throw new Error('Height must be a positive number.');
  }

  if (
    !Number.isFinite(payload.checkInRadiusMeters) ||
    payload.checkInRadiusMeters < 25 ||
    payload.checkInRadiusMeters > 1000
  ) {
    throw new Error('Check-in radius must be between 25 and 1000 meters.');
  }

  if (
    !Number.isInteger(payload.checkInPoints) ||
    payload.checkInPoints < 1 ||
    payload.checkInPoints > 1000
  ) {
    throw new Error('Check-in points must be a whole number between 1 and 1000.');
  }

  if (!Number.isFinite(payload.lengthKm) || payload.lengthKm <= 0) {
    throw new Error('Trail length must be a positive number.');
  }

  if (!Number.isFinite(payload.elevationGainMeters) || payload.elevationGainMeters < 0) {
    throw new Error('Elevation gain must be zero or higher.');
  }

  if (!isValidCoordinate(payload.summitLat, -90, 90) || !isValidCoordinate(payload.startLat, -90, 90)) {
    throw new Error('Latitude must be between -90 and 90.');
  }

  if (!isValidCoordinate(payload.summitLng, -180, 180) || !isValidCoordinate(payload.startLng, -180, 180)) {
    throw new Error('Longitude must be between -180 and 180.');
  }

  if (payload.safetyNotes.length === 0) {
    throw new Error('Add at least one safety note.');
  }
}

function getStorageFileName(path) {
  return path?.split('/').filter(Boolean).pop() ?? '';
}

function getImageReference(image) {
  return image?.filePath || image?.src || '';
}

function imageMatchesPath(image, path) {
  return Boolean(path && (image?.filePath === path || image?.src === path));
}

function getSavedGpxStatus(guide) {
  const routePointCount = getRoutePointCount(guide?.trail?.routeGeojson);

  if (guide?.trail?.gpxStoragePath) {
    return {
      type: 'success',
      message: `${routePointCount || 'Saved'} route points are connected from ${getStorageFileName(
        guide.trail.gpxStoragePath,
      )}.`,
    };
  }

  return guide?.trail?.routeGeojson
    ? {
        type: 'success',
        message: `${routePointCount} saved route points are connected to this guide.`,
      }
    : { type: 'idle', message: '' };
}

export function AdminPage() {
  const { isConfigured, isLoading: authIsLoading, user } = useAuth();
  const editorRef = useRef(null);
  const galleryImagesInputRef = useRef(null);
  const gpxInputRef = useRef(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);
  const [mode, setMode] = useState('create');
  const [guides, setGuides] = useState([]);
  const [guideQuery, setGuideQuery] = useState('');
  const [guideVisibility, setGuideVisibility] = useState('all');
  const [guidesStatus, setGuidesStatus] = useState({ type: 'idle', message: '' });
  const [selectedMountainId, setSelectedMountainId] = useState('');
  const [form, setForm] = useState(initialForm);
  const [savedForm, setSavedForm] = useState(initialForm);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryImagePreviews, setGalleryImagePreviews] = useState([]);
  const [existingGalleryImages, setExistingGalleryImages] = useState([]);
  const [savedGalleryImages, setSavedGalleryImages] = useState([]);
  const [galleryMeta, setGalleryMeta] = useState(initialGalleryMeta);
  const [heroNewImageIndex, setHeroNewImageIndex] = useState(null);
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
  const selectedNewHeroIndex = useMemo(() => {
    if (galleryImages.length === 0) {
      return null;
    }

    return Number.isInteger(heroNewImageIndex) &&
      heroNewImageIndex >= 0 &&
      heroNewImageIndex < galleryImages.length
      ? heroNewImageIndex
      : null;
  }, [galleryImages.length, heroNewImageIndex]);
  const currentHeroGalleryImage = useMemo(
    () => existingGalleryImages.find((image) => imageMatchesPath(image, form.heroImagePath)),
    [existingGalleryImages, form.heroImagePath],
  );
  const filteredGuides = useMemo(() => {
    const query = guideQuery.trim().toLowerCase();

    return guides.filter((guide) => {
      const matchesVisibility =
        guideVisibility === 'all' ||
        (guideVisibility === 'published' && guide.mountain.published) ||
        (guideVisibility === 'draft' && !guide.mountain.published);
      const searchableText = [
        guide.mountain.name,
        guide.mountain.region,
        guide.mountain.slug,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchesVisibility && (!query || searchableText.includes(query));
    });
  }, [guideQuery, guideVisibility, guides]);
  const hasUnsavedChanges = useMemo(
    () =>
      JSON.stringify(form) !== JSON.stringify(savedForm) ||
      JSON.stringify(existingGalleryImages) !== JSON.stringify(savedGalleryImages) ||
      JSON.stringify(galleryMeta) !== JSON.stringify(initialGalleryMeta) ||
      Boolean(heroNewImageIndex !== null || galleryImages.length > 0 || gpxFile),
    [
      existingGalleryImages,
      form,
      galleryImages.length,
      galleryMeta,
      gpxFile,
      heroNewImageIndex,
      savedForm,
      savedGalleryImages,
    ],
  );
  const saveSummary =
    status.type === 'loading'
      ? 'Saving changes…'
      : status.type === 'error'
        ? status.message
        : hasUnsavedChanges
          ? 'Unsaved changes'
          : status.type === 'success'
            ? status.message
            : mode === 'edit'
              ? 'No unsaved changes'
              : 'Ready for a new guide';
  const galleryUploadSummary =
    galleryImages.length > 0
      ? `${galleryImages.length} new image${galleryImages.length === 1 ? '' : 's'} selected. They upload when you ${
          mode === 'edit' ? 'update' : 'create'
        } the guide.${
          selectedNewHeroIndex !== null
            ? ` ${galleryImages[selectedNewHeroIndex]?.name ?? 'One selected image'} will be used as the hero.`
            : ' Choose one below if it should replace the current hero.'
        }`
      : `${existingImageCount} gallery image${existingImageCount === 1 ? '' : 's'} saved for this guide.`;

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

  useEffect(() => {
    const previews = galleryImages.map((file, index) => ({
      index,
      name: file.name,
      src: URL.createObjectURL(file),
    }));

    setGalleryImagePreviews(previews);

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.src));
    };
  }, [galleryImages]);

  useEffect(() => {
    if (!hasUnsavedChanges) {
      return undefined;
    }

    function handleBeforeUnload(event) {
      event.preventDefault();
      event.returnValue = '';
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  function updateField(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === 'name' && !current.slug && mode === 'create' ? { slug: slugify(value) } : {}),
    }));
  }

  function clearUploadInputs() {
    if (galleryImagesInputRef.current) {
      galleryImagesInputRef.current.value = '';
    }

    if (gpxInputRef.current) {
      gpxInputRef.current.value = '';
    }
  }

  function updateGalleryMeta(name, value) {
    setGalleryMeta((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSelectExistingHeroImage(image) {
    setHeroNewImageIndex(null);
    updateField('heroImagePath', getImageReference(image));
    setStatus({ type: 'idle', message: '' });
  }

  function handleSelectNewHeroImage(index) {
    setHeroNewImageIndex(index);
    setStatus({ type: 'idle', message: '' });
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
      assertFileSize(file, MAX_GPX_SIZE_BYTES, 'GPX file');
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
      if (gpxInputRef.current) {
        gpxInputRef.current.value = '';
      }
    }
  }

  function handleGalleryImagesChange(fileList) {
    try {
      const files = [...(fileList ?? [])];
      files.forEach((file) => assertFileSize(file, MAX_IMAGE_SIZE_BYTES, 'Gallery image'));
      setGalleryImages(files);
      setHeroNewImageIndex(files.length > 0 && (mode === 'create' || !form.heroImagePath) ? 0 : null);
      setStatus({ type: 'idle', message: '' });
    } catch (error) {
      setGalleryImages([]);
      setGalleryMeta(initialGalleryMeta);
      setHeroNewImageIndex(null);
      if (galleryImagesInputRef.current) {
        galleryImagesInputRef.current.value = '';
      }
      setStatus({ type: 'error', message: error.message });
    }
  }

  function scrollEditorToTop() {
    window.requestAnimationFrame(() => {
      editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function canReplaceEditor() {
    if (status.type === 'loading') {
      return false;
    }

    return (
      !hasUnsavedChanges ||
      window.confirm('You have unsaved changes. Discard them and continue?')
    );
  }

  function startCreate() {
    if (!canReplaceEditor()) {
      return;
    }

    setMode('create');
    setSelectedMountainId('');
    setForm(initialForm);
    setSavedForm(initialForm);
    setGalleryImages([]);
    setExistingGalleryImages([]);
    setSavedGalleryImages([]);
    setGalleryMeta(initialGalleryMeta);
    setHeroNewImageIndex(null);
    setGpxFile(null);
    setRouteGeojson(null);
    setGpxStatus({ type: 'idle', message: '' });
    setStatus({ type: 'idle', message: '' });
    clearUploadInputs();
    scrollEditorToTop();
  }

  function startEdit(guide) {
    if (mode === 'edit' && guide.mountain.id === selectedMountainId) {
      scrollEditorToTop();
      return;
    }

    if (!canReplaceEditor()) {
      return;
    }

    const nextForm = formFromGuide(guide);
    const nextGalleryImages = galleryFromGuide(guide);

    setMode('edit');
    setSelectedMountainId(guide.mountain.id);
    setForm(nextForm);
    setSavedForm(nextForm);
    setGalleryImages([]);
    setExistingGalleryImages(nextGalleryImages);
    setSavedGalleryImages(nextGalleryImages);
    setGalleryMeta(initialGalleryMeta);
    setHeroNewImageIndex(null);
    setGpxFile(null);
    setRouteGeojson(null);
    setGpxStatus(getSavedGpxStatus(guide));
    setStatus({ type: 'idle', message: '' });
    clearUploadInputs();
    scrollEditorToTop();
  }

  function discardChanges() {
    setForm(savedForm);
    setGalleryImages([]);
    setExistingGalleryImages(savedGalleryImages);
    setGalleryMeta(initialGalleryMeta);
    setHeroNewImageIndex(null);
    setGpxFile(null);
    setRouteGeojson(null);
    setGpxStatus(mode === 'edit' ? getSavedGpxStatus(selectedGuide) : { type: 'idle', message: '' });
    setStatus({ type: 'idle', message: '' });
    clearUploadInputs();
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
      checkInRadiusMeters: toNumber(form.checkInRadiusMeters),
      checkInPoints: toNumber(form.checkInPoints),
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

  async function uploadGalleryImageFiles({ slug }) {
    const uploadedImages = [];

    for (const [index, file] of galleryImages.entries()) {
      const filePath = await uploadAdminMountainImage({ file, slug });

      uploadedImages.push({
        filePath,
        alt: galleryMeta.alt.trim() || `${form.name.trim()} trail view`,
        source: galleryMeta.source.trim(),
        license: galleryMeta.license.trim(),
        creditUrl: galleryMeta.creditUrl.trim(),
        sortOrder: (existingImageCount + index + 1) * 10,
      });
    }

    return uploadedImages;
  }

  async function saveGalleryImages({ trailId, uploadedImages }) {
    for (const image of uploadedImages) {
      await addAdminTrailImage({
        trailId,
        filePath: image.filePath,
        alt: image.alt,
        source: image.source,
        license: image.license,
        creditUrl: image.creditUrl,
        sortOrder: image.sortOrder,
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
        const nextGalleryImages = galleryFromGuide(savedGuide);
        setExistingGalleryImages(nextGalleryImages);
        setSavedGalleryImages(nextGalleryImages);
      } else {
        setSavedGalleryImages(existingGalleryImages);
      }

      setStatus({
        type: 'success',
        message:
          form.heroImagePath !== savedForm.heroImagePath
            ? 'Gallery changes saved. Click Update guide to save the hero image change.'
            : 'Gallery changes saved.',
      });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
  }

  async function handleDeleteGalleryImage(image) {
    if (imageMatchesPath(image, form.heroImagePath) || imageMatchesPath(image, savedForm.heroImagePath)) {
      setStatus({
        type: 'error',
        message: 'Choose and update another hero image before deleting this photo.',
      });
      return;
    }

    const shouldDelete = window.confirm('Delete this image from the public guide?');

    if (!shouldDelete) {
      return;
    }

    setStatus({ type: 'loading', message: '' });

    try {
      await deleteAdminTrailImage(image);
      setExistingGalleryImages((current) => current.filter((currentImage) => currentImage.id !== image.id));
      setSavedGalleryImages((current) => current.filter((currentImage) => currentImage.id !== image.id));
      setStatus({ type: 'success', message: 'Gallery image deleted.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
  }

  async function handleDeleteSavedGpx() {
    const trailId = selectedGuide?.trail?.id ?? form.trailId;
    const storagePath = selectedGuide?.trail?.gpxStoragePath;
    const shouldDelete = window.confirm(
      'Remove the saved GPX route from this guide? This happens immediately. The public map will fall back to the start and summit line until a new GPX is uploaded.',
    );

    if (!shouldDelete) {
      return;
    }

    if (!trailId) {
      setStatus({ type: 'error', message: 'No saved trail was found for this GPX route.' });
      return;
    }

    if (
      hasUnsavedChanges &&
      !window.confirm(
        'You have unsaved form changes. The GPX will be removed immediately, while your current form edits stay in the editor. Continue?',
      )
    ) {
      return;
    }

    const shouldRefreshForm = !hasUnsavedChanges;

    setStatus({ type: 'loading', message: '' });

    try {
      await deleteAdminTrailGpx({ trailId, storagePath });
      const nextGuides = await loadGuides();
      const savedGuide = nextGuides.find((guide) => guide.mountain.id === form.mountainId);

      if (savedGuide && shouldRefreshForm) {
        const nextForm = formFromGuide(savedGuide);
        setForm(nextForm);
        setSavedForm(nextForm);
      }

      setGpxFile(null);
      setRouteGeojson(null);
      setGpxStatus(savedGuide ? getSavedGpxStatus(savedGuide) : { type: 'idle', message: '' });

      if (gpxInputRef.current) {
        gpxInputRef.current.value = '';
      }

      setStatus({ type: 'success', message: 'Saved GPX route removed.' });
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
      const preflightHeroImagePath = selectedNewHeroIndex !== null ? 'pending-upload' : form.heroImagePath;
      const preflightPayload = createPayload(preflightHeroImagePath, undefined);
      validateGuidePayload(preflightPayload);

      const uploadedGalleryImages = await uploadGalleryImageFiles({ slug });
      const heroImagePath =
        selectedNewHeroIndex !== null
          ? uploadedGalleryImages[selectedNewHeroIndex]?.filePath
          : form.heroImagePath;
      const gpxStoragePath = gpxFile ? await uploadAdminTrailGpx({ file: gpxFile, slug }) : undefined;
      const payload = createPayload(heroImagePath, gpxStoragePath);
      validateGuidePayload(payload);
      const result =
        mode === 'edit'
          ? await updateAdminMountainGuide(payload)
          : await createAdminMountainGuide(payload);
      const trailId = result?.trail_id ?? payload.trailId;

      await setAdminMountainGuidePublished({
        mountainId: payload.id,
        trailId,
        published: form.published,
      });

      await saveGalleryImages({ trailId, uploadedImages: uploadedGalleryImages });
      if (mode === 'edit') {
        await saveExistingGalleryImages();
      }

      const nextGuides = await loadGuides();
      const savedGuide = nextGuides.find((guide) => guide.mountain.id === payload.id);

      if (savedGuide) {
        const nextForm = formFromGuide(savedGuide);
        const nextGalleryImages = galleryFromGuide(savedGuide);
        setForm(nextForm);
        setSavedForm(nextForm);
        setSelectedMountainId(savedGuide.mountain.id);
        setMode('edit');
        setExistingGalleryImages(nextGalleryImages);
        setSavedGalleryImages(nextGalleryImages);
      } else {
        setForm(initialForm);
        setSavedForm(initialForm);
        setSelectedMountainId('');
        setMode('create');
        setExistingGalleryImages([]);
        setSavedGalleryImages([]);
      }

      setGalleryImages([]);
      setGalleryMeta(initialGalleryMeta);
      setHeroNewImageIndex(null);
      setGpxFile(null);
      setRouteGeojson(null);
      setGpxStatus(savedGuide ? getSavedGpxStatus(savedGuide) : { type: 'idle', message: '' });
      clearUploadInputs();
      setStatus({
        type: 'success',
        message: form.published
          ? mode === 'edit'
            ? `Mountain guide updated. Open /mountains/${slug} to review it.`
            : `Mountain guide created. Open /mountains/${slug} to review it.`
          : mode === 'edit'
            ? 'Mountain guide updated and saved as draft.'
            : 'Mountain guide created and saved as draft.',
      });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
  }

  async function handleDeleteGuide() {
    const shouldDelete = window.confirm(
      `Delete ${form.name}? This removes the mountain, trail, gallery records, comments, and check-ins connected to it. Use draft mode instead if you only want to hide it from the public site.`,
    );

    if (!shouldDelete) {
      return;
    }

    setStatus({ type: 'loading', message: '' });

    try {
      const deletedName = form.name;
      await deleteAdminMountainGuide({ mountainId: form.mountainId });
      await loadGuides();
      setMode('create');
      setSelectedMountainId('');
      setForm(initialForm);
      setSavedForm(initialForm);
      setGalleryImages([]);
      setExistingGalleryImages([]);
      setSavedGalleryImages([]);
      setGalleryMeta(initialGalleryMeta);
      setHeroNewImageIndex(null);
      setGpxFile(null);
      setRouteGeojson(null);
      setGpxStatus({ type: 'idle', message: '' });
      clearUploadInputs();
      setStatus({ type: 'success', message: `${deletedName} was deleted.` });
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
          <GuidePanel>
            <ToolRow>
              <h2>
                <Mountain size={18} aria-hidden="true" /> Guides
              </h2>
              <ButtonRow>
                <SecondaryButton
                  type="button"
                  disabled={guidesStatus.type === 'loading' || status.type === 'loading'}
                  onClick={loadGuides}
                >
                  <RefreshCw size={16} aria-hidden="true" /> Refresh
                </SecondaryButton>
                <Button type="button" disabled={status.type === 'loading'} onClick={startCreate}>
                  <Plus size={16} aria-hidden="true" /> New
                </Button>
              </ButtonRow>
            </ToolRow>
            <GuideTools>
              <SearchField>
                <Search size={17} aria-hidden="true" />
                <input
                  type="search"
                  value={guideQuery}
                  placeholder="Search name, region, or slug"
                  aria-label="Search mountain guides"
                  onChange={(event) => setGuideQuery(event.target.value)}
                />
              </SearchField>
              <GuideFilterRow>
                <span>
                  {filteredGuides.length} of {guides.length} guides
                </span>
                <select
                  value={guideVisibility}
                  aria-label="Filter guides by publishing status"
                  onChange={(event) => setGuideVisibility(event.target.value)}
                >
                  <option value="all">All guides</option>
                  <option value="published">Published</option>
                  <option value="draft">Drafts</option>
                </select>
              </GuideFilterRow>
            </GuideTools>
            <GuideStatus>
              {guidesStatus.type === 'loading' && <Message>Loading guides...</Message>}
              {guidesStatus.type === 'error' && <Message $error>{guidesStatus.message}</Message>}
            </GuideStatus>
            <GuideList>
              {filteredGuides.map((guide) => (
                <GuideButton
                  key={`${guide.mountain.id}-${guide.trail?.id ?? 'mountain'}`}
                  type="button"
                  $active={guide.mountain.id === selectedMountainId}
                  aria-pressed={guide.mountain.id === selectedMountainId}
                  disabled={status.type === 'loading'}
                  onClick={() => startEdit(guide)}
                >
                  <strong>{guide.mountain.name}</strong>
                  <span>
                    {guide.mountain.region}
                    {guide.trail ? ` · ${guide.trail.estimatedDuration}` : ''}
                  </span>
                  <GuideMeta>
                    <StatusPill $published={guide.mountain.published}>
                      {guide.mountain.published ? (
                        <Eye size={13} aria-hidden="true" />
                      ) : (
                        <EyeOff size={13} aria-hidden="true" />
                      )}
                      {guide.mountain.published ? 'Published' : 'Draft'}
                    </StatusPill>
                    <span>{guide.mountain.checkInPoints ?? 10} pts</span>
                  </GuideMeta>
                </GuideButton>
              ))}
              {guidesStatus.type !== 'loading' && filteredGuides.length === 0 && (
                <EmptyState>
                  {guides.length === 0
                    ? 'No guides yet. Create the first mountain guide.'
                    : 'No guides match this search and filter.'}
                </EmptyState>
              )}
            </GuideList>
          </GuidePanel>

          <EditorPanel ref={editorRef}>
            <EditorHeader>
              <div>
                <h2>
                  {mode === 'edit' ? (
                    <Save size={18} aria-hidden="true" />
                  ) : (
                    <ShieldCheck size={18} aria-hidden="true" />
                  )}
                  {mode === 'edit' ? 'Edit Mountain Guide' : 'Create Mountain Guide'}
                </h2>
                <small>
                  {mode === 'edit'
                    ? `Editing ${form.name}. Changes are saved only when you click Update guide.`
                    : 'Fill in the mountain details, trail information, and media below.'}
                </small>
              </div>
              {mode === 'edit' && (
                <SecondaryButton
                  as={Link}
                  to={`/mountains/${previewSlug}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Eye size={16} aria-hidden="true" /> Preview
                </SecondaryButton>
              )}
            </EditorHeader>
            <SectionNav aria-label="Guide editor sections">
              <a href="#admin-mountain">Mountain</a>
              <a href="#admin-trail">Trail</a>
              <a href="#admin-planning">Planning notes</a>
              <a href="#admin-gallery">Gallery</a>
            </SectionNav>
            {status.message && (
              <Message
                $error={status.type === 'error'}
                role={status.type === 'error' ? 'alert' : 'status'}
                aria-live="polite"
              >
                {status.message}
              </Message>
            )}
            <Form id="admin-guide-form" onSubmit={handleSubmit}>
              <Fieldset id="admin-mountain" disabled={status.type === 'loading'}>
                <legend>Mountain</legend>
                <SectionIntro>
                  Set the public identity, summit location, publishing state, and check-in reward.
                </SectionIntro>
                <Grid>
                  <ToggleField>
                    <input
                      checked={form.published}
                      type="checkbox"
                      onChange={(event) => updateField('published', event.target.checked)}
                    />
                    <span>
                      <strong>Published</strong>
                      Public guides appear on the mountains page. Drafts stay visible here only.
                    </span>
                  </ToggleField>
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
                    <small>Used in the public URL. Lowercase letters and hyphens only.</small>
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
                    <span>Check-in radius meters</span>
                    <input
                      required
                      type="number"
                      min="25"
                      max="1000"
                      value={form.checkInRadiusMeters}
                      onChange={(event) => updateField('checkInRadiusMeters', event.target.value)}
                    />
                    <small>How close someone must be to the summit to check in.</small>
                  </Field>
                  <Field>
                    <span>Points per check-in</span>
                    <input
                      required
                      type="number"
                      min="1"
                      max="1000"
                      step="1"
                      value={form.checkInPoints}
                      onChange={(event) => updateField('checkInPoints', event.target.value)}
                    />
                    <small>The reward added to the user&apos;s profile after a valid check-in.</small>
                  </Field>
                  <Field>
                    <span>Fallback weather location</span>
                    <select
                      value={form.weatherLocationId}
                      onChange={(event) => updateField('weatherLocationId', event.target.value)}
                    >
                      <option value="west-lofoten">Reine, Moskenesøya</option>
                      <option value="central-lofoten">Haukland, Vestvågøya</option>
                      <option value="east-lofoten">Svolvær, Austvågøya</option>
                    </select>
                    <small>Used only when route finish-point coordinates are unavailable.</small>
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
                </Grid>
              </Fieldset>

              <Fieldset id="admin-trail" disabled={status.type === 'loading'}>
                <legend>Trail</legend>
                <SectionIntro>
                  Add the route facts, trailhead coordinates, and optional GPX line used on the public map.
                </SectionIntro>
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
                      ref={gpxInputRef}
                      accept=".gpx,application/gpx+xml,application/xml,text/xml"
                      type="file"
                      onChange={(event) => handleGpxChange(event.target.files?.[0] ?? null)}
                    />
                    <small>Uploading a new GPX replaces the saved route when you update the guide.</small>
                  </FullField>
                  {mode === 'edit' &&
                    (selectedGuide?.trail?.routeGeojson || selectedGuide?.trail?.gpxStoragePath) && (
                      <SavedAsset>
                        <div>
                          <strong>{selectedGuide.trail.gpxStoragePath ? 'Saved GPX route' : 'Saved route data'}</strong>
                          <span>
                            {selectedGuide.trail.gpxStoragePath
                              ? getStorageFileName(selectedGuide.trail.gpxStoragePath)
                              : 'Route coordinates saved without an attached GPX file'}
                            {getRoutePointCount(selectedGuide.trail.routeGeojson)
                              ? ` · ${getRoutePointCount(selectedGuide.trail.routeGeojson)} route points`
                              : ''}
                          </span>
                          <span>
                            {gpxFile
                              ? 'A new GPX is selected and will replace this saved route when you update the guide.'
                              : 'This route is used for the public map.'}
                          </span>
                        </div>
                        <DangerButton
                          disabled={status.type === 'loading'}
                          type="button"
                          onClick={handleDeleteSavedGpx}
                        >
                          <Trash2 size={16} aria-hidden="true" />
                          {selectedGuide.trail.gpxStoragePath ? 'Remove GPX' : 'Remove route'}
                        </DangerButton>
                      </SavedAsset>
                    )}
                  {gpxStatus.message && (
                    <UploadNote as="div">
                      <Message $error={gpxStatus.type === 'error'}>{gpxStatus.message}</Message>
                    </UploadNote>
                  )}
                  {gpxFile && (
                    <UploadControls>
                      <SecondaryButton
                        type="button"
                        onClick={() => {
                          setGpxFile(null);
                          setRouteGeojson(null);
                          setGpxStatus(getSavedGpxStatus(selectedGuide));
                          if (gpxInputRef.current) {
                            gpxInputRef.current.value = '';
                          }
                        }}
                      >
                        <FileUp size={16} aria-hidden="true" /> Clear selected GPX
                      </SecondaryButton>
                    </UploadControls>
                  )}
                </Grid>
              </Fieldset>

              <Fieldset id="admin-planning" disabled={status.type === 'loading'}>
                <legend>Planning Notes</legend>
                <SectionIntro>
                  Give hikers the practical details they need before leaving for the trail.
                </SectionIntro>
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

              <Fieldset id="admin-gallery" disabled={status.type === 'loading'}>
                <legend>Gallery</legend>
                <SectionIntro>
                  Manage existing photo details or select new images to upload with the guide.
                </SectionIntro>
                <Grid>
                  {mode === 'edit' && form.heroImagePath && !currentHeroGalleryImage && (
                    <HeroPreview>
                      <HeroPreviewImage src={form.heroImagePath} alt={`${form.name || 'Mountain'} hero image`} />
                      <div>
                        <strong>Current hero image</strong>
                        <span>{getStorageFileName(form.heroImagePath) || form.heroImagePath}</span>
                        <span>
                          This image is not saved as a gallery photo. Choose a saved or newly selected gallery image
                          below, then update the guide to replace it.
                        </span>
                      </div>
                    </HeroPreview>
                  )}
                  {mode === 'create' && galleryImages.length === 0 && (
                    <UploadNote>Upload at least one gallery photo. The selected photo becomes the hero image.</UploadNote>
                  )}
                  {mode === 'edit' && existingGalleryImages.length > 0 && (
                    <GalleryManager>
                      <UploadNote>
                        {existingGalleryImages.length} saved image
                        {existingGalleryImages.length === 1 ? '' : 's'}. Choose one as the hero, edit details, reorder,
                        or delete below.
                      </UploadNote>
                      {existingGalleryImages.map((image, index) => {
                        const isHeroImage = selectedNewHeroIndex === null && imageMatchesPath(image, form.heroImagePath);

                        return (
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
                                <HeroChoice $active={isHeroImage}>
                                  <input
                                    checked={isHeroImage}
                                    name="hero-image"
                                    type="radio"
                                    onChange={() => handleSelectExistingHeroImage(image)}
                                  />
                                  {isHeroImage ? 'Hero image' : 'Use as hero'}
                                </HeroChoice>
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
                        );
                      })}
                      <ButtonRow>
                        <SecondaryButton
                          disabled={status.type === 'loading'}
                          type="button"
                          onClick={handleSaveGalleryChanges}
                        >
                          <Save size={16} aria-hidden="true" /> Save image details and order
                        </SecondaryButton>
                      </ButtonRow>
                    </GalleryManager>
                  )}
                  <FullField>
                    <span>Add gallery images</span>
                    <input
                      ref={galleryImagesInputRef}
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      type="file"
                      onChange={(event) => handleGalleryImagesChange(event.target.files)}
                    />
                  </FullField>
                  <UploadNote>{galleryUploadSummary}</UploadNote>
                  {galleryImagePreviews.length > 0 && (
                    <GalleryManager>
                      <UploadNote>Selected images. Choose which one should be the hero when the guide is saved.</UploadNote>
                      {galleryImagePreviews.map((preview) => {
                        const isHeroImage = selectedNewHeroIndex === preview.index;

                        return (
                          <GalleryItem key={`${preview.name}-${preview.index}`}>
                            <GalleryThumb src={preview.src} alt="" />
                            <GalleryFields>
                              <GalleryFileName>{preview.name}</GalleryFileName>
                              <GalleryActions>
                                <HeroChoice $active={isHeroImage}>
                                  <input
                                    checked={isHeroImage}
                                    name="hero-image"
                                    type="radio"
                                    onChange={() => handleSelectNewHeroImage(preview.index)}
                                  />
                                  {isHeroImage ? 'Hero image' : 'Use as hero'}
                                </HeroChoice>
                              </GalleryActions>
                            </GalleryFields>
                          </GalleryItem>
                        );
                      })}
                    </GalleryManager>
                  )}
                  {galleryImages.length > 0 && (
                    <UploadControls>
                      <SecondaryButton
                        type="button"
                        onClick={() => {
                          setGalleryImages([]);
                          setGalleryMeta(initialGalleryMeta);
                          setHeroNewImageIndex(null);
                          if (galleryImagesInputRef.current) {
                            galleryImagesInputRef.current.value = '';
                          }
                        }}
                      >
                        <Camera size={16} aria-hidden="true" /> Clear selected images
                      </SecondaryButton>
                    </UploadControls>
                  )}
                  {galleryImages.length > 0 && (
                    <>
                      <Field>
                        <span>Image alt text</span>
                        <input
                          value={galleryMeta.alt}
                          onChange={(event) => updateGalleryMeta('alt', event.target.value)}
                        />
                        <small>Applied to all newly selected images. You can refine each one after upload.</small>
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
                    </>
                  )}
                </Grid>
              </Fieldset>

              {mode === 'edit' && (
                <DangerZone>
                  <div>
                    <strong>Delete this guide</strong>
                    <span>
                      This also removes connected gallery records, comments, and check-ins. Use draft mode when you
                      only want to hide it.
                    </span>
                  </div>
                  <DangerButton type="button" disabled={status.type === 'loading'} onClick={handleDeleteGuide}>
                    <Trash2 size={18} aria-hidden="true" /> Delete guide
                  </DangerButton>
                </DangerZone>
              )}

              <SaveBar>
                <SaveSummary
                  $dirty={hasUnsavedChanges}
                  $error={status.type === 'error'}
                  role="status"
                  aria-live="polite"
                >
                  {saveSummary}
                </SaveSummary>
                <ButtonRow>
                  <SecondaryButton
                    type="button"
                    disabled={!hasUnsavedChanges || status.type === 'loading'}
                    onClick={discardChanges}
                  >
                    <Undo2 size={17} aria-hidden="true" /> Discard
                  </SecondaryButton>
                  {mode === 'edit' && (
                    <SecondaryButton type="button" disabled={status.type === 'loading'} onClick={startCreate}>
                      <Plus size={17} aria-hidden="true" /> New guide
                    </SecondaryButton>
                  )}
                  <Button
                    type="submit"
                    disabled={status.type === 'loading' || (mode === 'edit' && !hasUnsavedChanges)}
                  >
                    {gpxFile ? (
                      <FileUp size={18} aria-hidden="true" />
                    ) : galleryImages.length > 0 ? (
                      <ImagePlus size={18} aria-hidden="true" />
                    ) : (
                      <Save size={18} aria-hidden="true" />
                    )}
                    {status.type === 'loading'
                      ? 'Saving…'
                      : mode === 'edit'
                        ? 'Update guide'
                        : 'Create guide'}
                  </Button>
                </ButtonRow>
              </SaveBar>
            </Form>
          </EditorPanel>
        </AdminLayout>
      )}
    </Page>
  );
}

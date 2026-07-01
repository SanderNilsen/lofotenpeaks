import { requireSupabaseClient } from './client.js';

function imagePathToSrc(path) {
  if (!path) {
    return '/images/reinebringen-gallery-1.jpg';
  }

  return path;
}

function getFileName(path) {
  return path?.split('/').pop() ?? '';
}

function pointFromLatLng(lat, lng) {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return null;
  }

  return [Number(lat), Number(lng)];
}

function routeFromGeoJson(routeGeoJson) {
  if (routeGeoJson?.type !== 'LineString' || !Array.isArray(routeGeoJson.coordinates)) {
    return null;
  }

  return routeGeoJson.coordinates.map(([lng, lat]) => [lat, lng]);
}

function transformGuideRow(row) {
  const heroSrc = imagePathToSrc(row.hero_image_path);
  const remoteImages = Array.isArray(row.images) ? row.images : [];
  const images =
    remoteImages.length > 0
      ? remoteImages.map((image) => ({
          src: imagePathToSrc(image.filePath),
          alt: image.alt || `${row.mountain_name} trail view`,
        }))
      : [{ src: heroSrc, alt: `${row.mountain_name} mountain view` }];
  const startPoint = pointFromLatLng(row.start_lat, row.start_lng);
  const endPoint = pointFromLatLng(row.end_lat, row.end_lng);

  const mountain = {
    id: row.mountain_id,
    slug: row.mountain_slug,
    name: row.mountain_name,
    weatherLocationId: row.weather_location_id,
    region: row.region,
    heightMeters: row.height_meters,
    coordinates:
      row.summit_lat !== null && row.summit_lng !== null
        ? { lat: Number(row.summit_lat), lng: Number(row.summit_lng) }
        : null,
    difficulty: row.mountain_difficulty,
    summary: row.mountain_summary,
    description: row.mountain_description,
    heroImage: { src: heroSrc, alt: `${row.mountain_name} mountain view` },
    images,
    imageFiles: images.map((image) => getFileName(image.src)).filter(Boolean),
    trailIds: row.trail_id ? [row.trail_id] : [],
  };

  const trail = row.trail_id
    ? {
        id: row.trail_id,
        slug: row.trail_slug,
        mountainId: row.mountain_id,
        weatherLocationId: row.weather_location_id,
        name: row.trail_name,
        summary: row.trail_summary,
        description: row.trail_description,
        lengthKm: Number(row.length_km ?? 0),
        elevationGainMeters: row.elevation_gain_meters ?? 0,
        estimatedDuration: row.estimated_duration,
        difficulty: row.trail_difficulty,
        startPoint,
        endPoint,
        route: routeFromGeoJson(row.route_geojson) ?? [startPoint, endPoint].filter(Boolean),
        routeNote: row.route_note,
        safetyNotes: ['Verify route conditions, weather, and access locally before hiking.'],
        imageFiles: mountain.imageFiles,
      }
    : null;

  return { mountain, trail };
}

export async function getSession() {
  const client = requireSupabaseClient();
  const { data, error } = await client.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export async function signUpWithEmail({ email, password, displayName }) {
  const client = requireSupabaseClient();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signInWithEmail({ email, password }) {
  const client = requireSupabaseClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  const client = requireSupabaseClient();
  const { error } = await client.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function getProfile(userId) {
  const client = requireSupabaseClient();
  const { data, error } = await client.from('profiles').select('*').eq('id', userId).single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateProfile(userId, updates) {
  const client = requireSupabaseClient();
  const { data, error } = await client.from('profiles').update(updates).eq('id', userId).select().single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getIsAdmin() {
  const client = requireSupabaseClient();
  const { data, error } = await client.rpc('is_admin');

  if (error) {
    throw error;
  }

  return Boolean(data);
}

export async function getRemoteMountainGuides() {
  const client = requireSupabaseClient();
  const { data, error } = await client
    .from('mountain_guides')
    .select('*')
    .order('mountain_name', { ascending: true });

  if (error) {
    throw error;
  }

  const guides = (data ?? []).map(transformGuideRow);
  const mountainsById = new Map();
  const trails = [];

  guides.forEach(({ mountain, trail }) => {
    if (!mountainsById.has(mountain.id)) {
      mountainsById.set(mountain.id, mountain);
    }

    if (trail) {
      trails.push(trail);

      const savedMountain = mountainsById.get(mountain.id);
      if (!savedMountain.trailIds.includes(trail.id)) {
        savedMountain.trailIds = [...savedMountain.trailIds, trail.id];
      }
    }
  });

  return {
    mountains: [...mountainsById.values()],
    trails,
  };
}

export async function getRemoteMountainGuideBySlug(slug) {
  const client = requireSupabaseClient();
  const { data, error } = await client
    .from('mountain_guides')
    .select('*')
    .eq('mountain_slug', slug)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? transformGuideRow(data) : null;
}

export async function uploadAdminMountainImage({ file, slug }) {
  const client = requireSupabaseClient();
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const safeSlug = slug.replace(/[^a-z0-9-]/g, '-');
  const filePath = `mountains/${safeSlug}/${Date.now()}.${extension}`;
  const { error } = await client.storage.from('mountain-images').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    throw error;
  }

  const { data } = client.storage.from('mountain-images').getPublicUrl(filePath);

  return data.publicUrl;
}

export async function createAdminMountainGuide(guide) {
  const client = requireSupabaseClient();
  const { data, error } = await client.rpc('admin_create_mountain_guide', {
    p_mountain_id: guide.id,
    p_slug: guide.slug,
    p_name: guide.name,
    p_region: guide.region,
    p_height_meters: guide.heightMeters,
    p_summit_lat: guide.summitLat,
    p_summit_lng: guide.summitLng,
    p_difficulty: guide.difficulty,
    p_summary: guide.summary,
    p_description: guide.description,
    p_weather_location_id: guide.weatherLocationId,
    p_hero_image_path: guide.heroImagePath,
    p_trail_length_km: guide.lengthKm,
    p_trail_elevation_gain_meters: guide.elevationGainMeters,
    p_trail_estimated_duration: guide.estimatedDuration,
    p_start_lat: guide.startLat,
    p_start_lng: guide.startLng,
    p_route_note: guide.routeNote,
  });

  if (error) {
    throw error;
  }

  return data?.[0] ?? data;
}

export async function getLeaderboard({ limit = 20 } = {}) {
  const client = requireSupabaseClient();
  const { data, error } = await client
    .from('leaderboard')
    .select('*')
    .order('points', { ascending: false })
    .order('check_in_count', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data;
}

export async function getUserCheckIns(userId) {
  const client = requireSupabaseClient();
  const { data, error } = await client
    .from('check_ins')
    .select(
      `
        id,
        mountain_id,
        trail_id,
        checked_in_at,
        check_in_day,
        points,
        note,
        status,
        mountains(name, slug),
        trails(name, slug)
      `,
    )
    .eq('user_id', userId)
    .order('checked_in_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function getTodayCheckInForMountain({ userId, mountainId }) {
  const today = new Date().toISOString().slice(0, 10);
  const client = requireSupabaseClient();
  const { data, error } = await client
    .from('check_ins')
    .select('id, checked_in_at, check_in_day, points')
    .eq('user_id', userId)
    .eq('mountain_id', mountainId)
    .eq('check_in_day', today)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function createCheckIn(checkIn) {
  const client = requireSupabaseClient();
  const { data, error } = await client.from('check_ins').insert(checkIn).select().single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createMountainCheckIn({ userId, mountainId, trailId, note }) {
  return createCheckIn({
    user_id: userId,
    mountain_id: mountainId,
    trail_id: trailId,
    note: note?.trim() || null,
    points: 10,
    status: 'approved',
  });
}

export async function getCommentsForTrail(trailId) {
  const client = requireSupabaseClient();
  const { data, error } = await client
    .from('comments')
    .select('*, profiles(display_name, avatar_url)')
    .eq('trail_id', trailId)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

export async function createComment(comment) {
  const client = requireSupabaseClient();
  const { data, error } = await client.from('comments').insert(comment).select().single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createTrailComment({ userId, mountainId, trailId, body }) {
  return createComment({
    user_id: userId,
    mountain_id: mountainId,
    trail_id: trailId,
    body: body.trim(),
    status: 'approved',
  });
}

export async function createUserHike(hike) {
  const client = requireSupabaseClient();
  const { data, error } = await client.from('user_hikes').insert(hike).select().single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createPosterRoute(route) {
  const client = requireSupabaseClient();
  const { data, error } = await client.from('poster_routes').insert(route).select().single();

  if (error) {
    throw error;
  }

  return data;
}

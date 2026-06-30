import { requireSupabaseClient } from './client.js';

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

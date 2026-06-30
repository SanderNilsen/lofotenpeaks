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
  const { data, error } = await client.from('leaderboard').select('*').limit(limit);

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

export const LEADERBOARD_TIMEFRAMES = Object.freeze([
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'all_time', label: 'All time' },
]);

export const LEADERBOARD_METRICS = Object.freeze([
  { value: 'points', label: 'Points' },
  { value: 'unique_summits', label: 'Unique summits' },
  { value: 'approved_check_ins', label: 'Approved check-ins' },
]);

export const BADGE_FILTERS = Object.freeze([
  { value: 'all', label: 'All' },
  { value: 'unlocked', label: 'Earned' },
  { value: 'in_progress', label: 'In progress' },
]);

export const BADGE_STATES = Object.freeze({
  LOCKED: 'locked',
  IN_PROGRESS: 'in_progress',
  UNLOCKED: 'unlocked',
});

/** @typedef {'week' | 'month' | 'all_time'} LeaderboardTimeframe */
/** @typedef {'points' | 'unique_summits' | 'approved_check_ins'} LeaderboardMetric */

/**
 * @typedef {Object} LeaderboardEntry
 * @property {number} rank
 * @property {string} user_id
 * @property {string} display_name
 * @property {string | null} avatar_url
 * @property {number} points
 * @property {number} unique_summits
 * @property {number} approved_check_ins
 * @property {string} score_reached_at
 */

/**
 * @typedef {Object} BadgeDefinition
 * @property {string} badge_id
 * @property {string} name
 * @property {string} description
 * @property {string} icon_name
 * @property {number} target
 */

/**
 * @typedef {'locked' | 'in_progress' | 'unlocked'} BadgeProgressState
 */

/**
 * @typedef {BadgeDefinition & Object} UserBadge
 * @property {number} current_progress
 * @property {BadgeProgressState} badge_state
 * @property {string | null} earned_at
 * @property {boolean} is_new
 */

export function isLeaderboardTimeframe(value) {
  return LEADERBOARD_TIMEFRAMES.some((option) => option.value === value);
}

export function isLeaderboardMetric(value) {
  return LEADERBOARD_METRICS.some((option) => option.value === value);
}

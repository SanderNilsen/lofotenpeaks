export const trails = [
  {
    id: 'reinebringen-main-trail',
    slug: 'reinebringen-main-trail',
    mountainId: 'reinebringen',
    name: 'Reinebringen Main Trail',
    lengthKm: 2.0,
    elevationGainMeters: 448,
    estimatedDuration: '1.5-2.5 hours',
    difficulty: 'hard',
    startPoint: [67.9338, 13.0902],
    endPoint: [67.9324, 13.0889],
    route: [
      [67.9338, 13.0902],
      [67.9334, 13.0897],
      [67.933, 13.0893],
      [67.9327, 13.089],
      [67.9324, 13.0889],
    ],
    safetyNotes: ['Very steep sections', 'Avoid in icy or wet conditions', 'Stay on the built trail'],
  },
  {
    id: 'ryten-from-fredvang',
    slug: 'ryten-from-fredvang',
    mountainId: 'ryten',
    name: 'Ryten from Fredvang',
    lengthKm: 8.5,
    elevationGainMeters: 600,
    estimatedDuration: '3.5-5 hours',
    difficulty: 'moderate',
    startPoint: [68.0734, 13.1593],
    endPoint: [68.0804, 13.0964],
    route: [
      [68.0734, 13.1593],
      [68.076, 13.143],
      [68.0783, 13.125],
      [68.0795, 13.108],
      [68.0804, 13.0964],
    ],
    safetyNotes: ['Exposed weather near the top', 'Bring wind protection', 'Respect marked parking areas'],
  },
  {
    id: 'festvagtind-henningsvaer',
    slug: 'festvagtind-henningsvaer',
    mountainId: 'festvagtind',
    name: 'Festvagtind from Henningsvaer Road',
    lengthKm: 3.0,
    elevationGainMeters: 520,
    estimatedDuration: '2-3 hours',
    difficulty: 'hard',
    startPoint: [68.1588, 14.2308],
    endPoint: [68.1647, 14.2363],
    route: [
      [68.1588, 14.2308],
      [68.1604, 14.232],
      [68.162, 14.2337],
      [68.1636, 14.2352],
      [68.1647, 14.2363],
    ],
    safetyNotes: ['Loose rocks on steep terrain', 'Do not hike in poor visibility', 'Use proper footwear'],
  },
];

export function getTrailBySlug(slug) {
  return trails.find((trail) => trail.slug === slug);
}

export function getTrailsByMountainId(mountainId) {
  return trails.filter((trail) => trail.mountainId === mountainId);
}

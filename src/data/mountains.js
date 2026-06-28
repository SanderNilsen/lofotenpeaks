export const mountains = [
  {
    id: 'reinebringen',
    slug: 'reinebringen',
    name: 'Reinebringen',
    region: 'Moskenes',
    heightMeters: 448,
    coordinates: { lat: 67.9324, lng: 13.0889 },
    difficulty: 'hard',
    summary: 'A short, steep hike above Reine with one of Lofoten\'s most recognizable views.',
    description:
      'Reinebringen is known for a demanding climb and a wide panorama over Reine, Hamnoy, Sakrisoy, and the surrounding fjords. Treat the current route values as starter content and verify them before publishing.',
    heroImage: {
      src: '/images/homebanner.png',
      alt: 'Panorama of mountains in Lofoten',
    },
    images: [
      {
        src: '/images/homebanner.png',
        alt: 'Mountain panorama in Lofoten',
      },
      {
        src: '/images/matmorapanorama.png',
        alt: 'Lofoten mountain ridge panorama',
      },
    ],
    trailIds: ['reinebringen-main-trail'],
  },
  {
    id: 'ryten',
    slug: 'ryten',
    name: 'Ryten',
    region: 'Flakstadoya',
    heightMeters: 543,
    coordinates: { lat: 68.0804, lng: 13.0964 },
    difficulty: 'moderate',
    summary: 'A popular summit above Kvalvika beach with open coastal views.',
    description:
      'Ryten is a longer but less exposed hike than Reinebringen, with views toward Kvalvika and the open Norwegian Sea.',
    heroImage: {
      src: '/images/matmorapanorama.png',
      alt: 'Lofoten mountain panorama',
    },
    images: [
      {
        src: '/images/matmorapanorama.png',
        alt: 'Panorama from a Lofoten ridge',
      },
    ],
    trailIds: ['ryten-from-fredvang'],
  },
  {
    id: 'festvagtind',
    slug: 'festvagtind',
    name: 'Festvagtind',
    region: 'Austvagoya',
    heightMeters: 541,
    coordinates: { lat: 68.1647, lng: 14.2363 },
    difficulty: 'hard',
    summary: 'A steep hike near Henningsvaer with views over islands, sea, and fishing villages.',
    description:
      'Festvagtind is compact and steep, suited for hikers who want a big viewpoint close to Henningsvaer.',
    heroImage: {
      src: '/images/homebanner.png',
      alt: 'Lofoten peaks with fjord below',
    },
    images: [
      {
        src: '/images/homebanner.png',
        alt: 'Lofoten mountain and fjord landscape',
      },
    ],
    trailIds: ['festvagtind-henningsvaer'],
  },
];

export function getMountainBySlug(slug) {
  return mountains.find((mountain) => mountain.slug === slug);
}

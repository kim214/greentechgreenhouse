const mixkit = (id: number) => `https://assets.mixkit.co/videos/${id}/${id}-720.mp4`;
const pexels = (id: number, fps: 24 | 25 = 24) =>
  `https://videos.pexels.com/video-files/${id}/${id}-hd_1280_720_${fps}fps.mp4`;

export type SentryFeedSet = {
  overview: string;
  irrigation: string;
  ventilation: string;
  canopy: string;
};

/**
 * Live Sentry clips from a wide search:
 * - Pexels (Tima Miroshnichenko): African/Black farmers working in a greenhouse
 * - Pexels (Anna Tarazevich): tomato-house crop work
 * - Mixkit: vegetable-tunnel crews and East African crop fields
 * Getty, Envato, Storyblocks, and DW Kenya reports were found but are not free to host.
 */
const WORK = {
  checkPots: pexels(6509166),
  potting: pexels(6508942),
  tendBay: pexels(6508714),
  waterTeam: pexels(6508517),
  spray: pexels(6509155),
  tendClose: pexels(6508746),
  tomatoCheck: pexels(7332177, 25),
  tomatoTwine: pexels(7332192, 25),
  womenBay: mixkit(37007),
  tomatoCrew: mixkit(36951),
  girlsTomato: mixkit(36841),
  holdTomato: mixkit(36872),
  quality: mixkit(36957),
  tablet: mixkit(36950),
  agronomists: mixkit(36852),
  agronomistsWork: mixkit(36854),
  harvest: mixkit(9202),
  gather: mixkit(8898),
  crate: mixkit(9017),
  inspect: mixkit(5759),
  vine: mixkit(9015),
} as const;

const WATER = {
  hoseCrew: mixkit(47274),
  hoseClose: mixkit(13854),
  fieldWater: mixkit(23783),
  drip: mixkit(2852),
  spray: pexels(6509155),
  waterTeam: pexels(6508517),
} as const;

const ROOF = {
  roofSun: mixkit(2946),
  africaFarm: mixkit(11968),
  africaCorn: mixkit(11967),
  cornLook: mixkit(11969),
} as const;

const HOUSE_FEEDS: Record<string, SentryFeedSet> = {
  "GH-001": { overview: WORK.checkPots, irrigation: WATER.hoseCrew, ventilation: ROOF.roofSun, canopy: WORK.tomatoCheck },
  "GH-002": { overview: WORK.potting, irrigation: WATER.waterTeam, ventilation: ROOF.africaFarm, canopy: WORK.womenBay },
  "GH-003": { overview: WORK.tendBay, irrigation: WATER.spray, ventilation: ROOF.roofSun, canopy: WORK.tomatoTwine },
  "GH-004": { overview: WORK.waterTeam, irrigation: WATER.drip, ventilation: ROOF.africaCorn, canopy: WORK.agronomists },
  "GH-005": { overview: WORK.tomatoCheck, irrigation: WATER.hoseCrew, ventilation: ROOF.cornLook, canopy: WORK.harvest },
  "GH-006": { overview: WORK.tomatoTwine, irrigation: WATER.hoseClose, ventilation: ROOF.roofSun, canopy: WORK.tablet },
  "GH-007": { overview: WORK.tendClose, irrigation: WATER.fieldWater, ventilation: ROOF.africaFarm, canopy: WORK.quality },
  "GH-008": { overview: WORK.spray, irrigation: WATER.drip, ventilation: ROOF.africaCorn, canopy: WORK.girlsTomato },
  "GH-009": { overview: WORK.womenBay, irrigation: WATER.hoseCrew, ventilation: ROOF.cornLook, canopy: WORK.holdTomato },
  "GH-010": { overview: WORK.tomatoCrew, irrigation: WATER.spray, ventilation: ROOF.roofSun, canopy: WORK.crate },
  "GH-011": { overview: WORK.agronomistsWork, irrigation: WATER.waterTeam, ventilation: ROOF.africaFarm, canopy: WORK.vine },
  "GH-012": { overview: WORK.harvest, irrigation: WATER.drip, ventilation: ROOF.africaCorn, canopy: WORK.gather },
  "GH-013": { overview: WORK.inspect, irrigation: WATER.hoseCrew, ventilation: ROOF.cornLook, canopy: WORK.checkPots },
  "GH-014": { overview: WORK.quality, irrigation: WATER.hoseClose, ventilation: ROOF.africaFarm, canopy: WORK.potting },
  "GH-015": { overview: WORK.holdTomato, irrigation: WATER.fieldWater, ventilation: ROOF.roofSun, canopy: WORK.tendBay },
};

const FALLBACK_PACKS: SentryFeedSet[] = [
  { overview: WORK.checkPots, irrigation: WATER.hoseCrew, ventilation: ROOF.roofSun, canopy: WORK.tomatoCheck },
  { overview: WORK.potting, irrigation: WATER.waterTeam, ventilation: ROOF.africaFarm, canopy: WORK.womenBay },
  { overview: WORK.tendBay, irrigation: WATER.spray, ventilation: ROOF.africaCorn, canopy: WORK.tomatoTwine },
  { overview: WORK.waterTeam, irrigation: WATER.drip, ventilation: ROOF.cornLook, canopy: WORK.harvest },
  { overview: WORK.spray, irrigation: WATER.hoseClose, ventilation: ROOF.roofSun, canopy: WORK.inspect },
  { overview: WORK.tendClose, irrigation: WATER.fieldWater, ventilation: ROOF.africaFarm, canopy: WORK.tablet },
];

function houseIndex(code: string) {
  let hash = 0;
  for (let i = 0; i < code.length; i++) hash = (hash * 31 + code.charCodeAt(i)) >>> 0;
  return hash;
}

export function feedsForHouse(code: string | undefined): SentryFeedSet {
  if (code && HOUSE_FEEDS[code]) return HOUSE_FEEDS[code];
  return FALLBACK_PACKS[houseIndex(code ?? "CAM") % FALLBACK_PACKS.length];
}

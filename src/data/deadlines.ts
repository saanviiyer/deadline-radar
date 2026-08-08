// ============================================================================
// Deadline Radar — seed dataset
// ============================================================================
//
// HOW TO EDIT
// -----------
// Each entry in the `deadlines` array is one conference or workshop. To add a
// venue, copy an existing object, change the fields, and give it a unique `id`.
// To edit a venue, just change its fields. Nothing else in the app needs to
// change — the board, filters, calendar, countdowns, and .ics export all read
// from this array.
//
// DATE FORMAT
// -----------
// All dates are ISO 8601 strings.
//   - Date only:      "2026-09-24"           (treated as an all-day deadline)
//   - Date + time:    "2026-09-24T23:59:00Z" (UTC; use the "Z" suffix)
// "Anywhere on Earth" (AoE) deadlines are UTC-12. A 23:59 AoE deadline equals
// the *next* day at 11:59 UTC. When in doubt, use a date-only string.
//
// !!! IMPORTANT — VERIFY BEFORE YOU RELY ON THESE DATES !!!
// -----------------------------------------------------------------
// These are SEED VALUES for the 2026–2027 cycle, assembled as a realistic
// starting point. Conference dates shift every year and many 2027-cycle CFPs
// were not yet published when this file was written (2026-08). ALWAYS confirm
// against the official Call for Papers before submitting anything.
//
// The `confidence` field flags how much to trust each date:
//   "confirmed"   — matches an official CFP / announced schedule.
//   "approximate" — based on the venue's typical month in prior years; the
//                   day/month is a reasonable estimate but MUST be verified.
//   "tbd"         — the venue exists but the cycle's dates are not yet set;
//                   values shown are placeholders from a prior edition.
// Most 2027-cycle entries are intentionally "approximate" — treat every date
// as a hint, not a promise.
// ============================================================================

export type Category =
  | "ML"
  | "NeuroAI"
  | "CompBio"
  | "CV"
  | "NLP"
  | "Neuroscience"
  | "MedImaging"
  | "Robotics"
  | "Speech"
  | "DataMining"
  | "Workshop";

export type Confidence = "confirmed" | "approximate" | "tbd";

export interface Deadline {
  /** Stable unique id, e.g. "neurips-2026". */
  id: string;
  /** Short display name, e.g. "NeurIPS 2026". */
  name: string;
  /** Full venue name. */
  fullName: string;
  /** One or more category tags used for filtering. */
  categories: Category[];
  /** Abstract-registration deadline (ISO). Optional. */
  abstractDeadline?: string;
  /** Full-paper / main submission deadline (ISO). Optional. */
  paperDeadline?: string;
  /** Author-notification / decision date (ISO). Optional. */
  notificationDate?: string;
  /** Event start date (ISO). Optional. */
  eventStart?: string;
  /** Event end date (ISO). Optional. */
  eventEnd?: string;
  /** Human-readable location, e.g. "San Diego, USA". */
  location?: string;
  /** Official website / CFP URL. */
  website: string;
  /** Timezone the deadline is stated in, e.g. "AoE", "UTC". Informational. */
  timezone?: string;
  /** How much to trust the dates above. See header. */
  confidence: Confidence;
  /** Free-text caveats, e.g. "ARR rolling cycle". */
  notes?: string;
}

export const deadlines: Deadline[] = [
  // ---------------------------------------------------------------- Core ML --
  {
    id: "neurips-2026",
    name: "NeurIPS 2026",
    fullName: "Conference on Neural Information Processing Systems",
    categories: ["ML", "NeuroAI"],
    abstractDeadline: "2026-05-15",
    paperDeadline: "2026-05-22",
    notificationDate: "2026-09-18",
    eventStart: "2026-12-06",
    eventEnd: "2026-12-12",
    location: "San Diego, USA",
    website: "https://neurips.cc/",
    timezone: "AoE",
    confidence: "approximate",
    notes: "Main-track deadlines were in May 2026 (already passed). Event dates approximate.",
  },
  {
    id: "neurips-2026-workshops",
    name: "NeurIPS 2026 Workshops",
    fullName: "NeurIPS 2026 Workshop paper submissions (varies by workshop)",
    categories: ["ML", "NeuroAI", "Workshop"],
    paperDeadline: "2026-09-25",
    notificationDate: "2026-10-20",
    eventStart: "2026-12-13",
    eventEnd: "2026-12-14",
    location: "San Diego, USA",
    website: "https://neurips.cc/",
    timezone: "AoE",
    confidence: "approximate",
    notes:
      "Individual workshops set their own deadlines (typically mid/late Sept). Check each workshop's OpenReview page.",
  },
  {
    id: "iclr-2027",
    name: "ICLR 2027",
    fullName: "International Conference on Learning Representations",
    categories: ["ML"],
    abstractDeadline: "2026-09-19",
    paperDeadline: "2026-09-24",
    notificationDate: "2027-01-22",
    eventStart: "2027-04-26",
    eventEnd: "2027-04-30",
    location: "TBD",
    website: "https://iclr.cc/",
    timezone: "AoE",
    confidence: "approximate",
    notes: "Deadlines follow ICLR's usual late-Sept pattern; verify on iclr.cc.",
  },
  {
    id: "iclr-2027-workshops",
    name: "ICLR 2027 Workshops",
    fullName: "ICLR 2027 Workshop paper submissions (varies by workshop)",
    categories: ["ML", "Workshop"],
    paperDeadline: "2027-02-10",
    notificationDate: "2027-03-05",
    eventStart: "2027-04-30",
    eventEnd: "2027-05-01",
    location: "TBD",
    website: "https://iclr.cc/",
    timezone: "AoE",
    confidence: "tbd",
    notes: "Workshop list & deadlines announced after main-track notifications.",
  },
  {
    id: "icml-2027",
    name: "ICML 2027",
    fullName: "International Conference on Machine Learning",
    categories: ["ML"],
    abstractDeadline: "2027-01-22",
    paperDeadline: "2027-01-29",
    notificationDate: "2027-05-01",
    eventStart: "2027-07-11",
    eventEnd: "2027-07-17",
    location: "TBD",
    website: "https://icml.cc/",
    timezone: "AoE",
    confidence: "approximate",
    notes: "ICML deadlines are typically late January; verify on icml.cc.",
  },
  {
    id: "aaai-2027",
    name: "AAAI 2027",
    fullName: "AAAI Conference on Artificial Intelligence",
    categories: ["ML"],
    abstractDeadline: "2026-08-01",
    paperDeadline: "2026-08-08",
    notificationDate: "2026-11-10",
    eventStart: "2027-02-01",
    eventEnd: "2027-02-08",
    location: "TBD",
    website: "https://aaai.org/conference/aaai/",
    timezone: "AoE",
    confidence: "approximate",
    notes: "AAAI abstracts are typically early August; two-phase review. Verify on aaai.org.",
  },
  {
    id: "aistats-2027",
    name: "AISTATS 2027",
    fullName: "International Conference on Artificial Intelligence and Statistics",
    categories: ["ML"],
    abstractDeadline: "2026-10-08",
    paperDeadline: "2026-10-15",
    notificationDate: "2027-01-20",
    eventStart: "2027-05-03",
    eventEnd: "2027-05-05",
    location: "TBD",
    website: "https://aistats.org/",
    timezone: "AoE",
    confidence: "approximate",
    notes: "AISTATS deadline is in October (not January). Verify on aistats.org.",
  },
  {
    id: "uai-2027",
    name: "UAI 2027",
    fullName: "Conference on Uncertainty in Artificial Intelligence",
    categories: ["ML"],
    abstractDeadline: "2027-02-05",
    paperDeadline: "2027-02-12",
    notificationDate: "2027-04-30",
    eventStart: "2027-07-19",
    eventEnd: "2027-07-23",
    location: "TBD",
    website: "https://www.auai.org/",
    timezone: "AoE",
    confidence: "tbd",
    notes: "Typical mid-February deadline; dates not yet announced.",
  },
  {
    id: "colm-2027",
    name: "COLM 2027",
    fullName: "Conference on Language Modeling",
    categories: ["ML", "NLP"],
    abstractDeadline: "2027-03-20",
    paperDeadline: "2027-03-27",
    notificationDate: "2027-07-10",
    eventStart: "2027-10-06",
    eventEnd: "2027-10-09",
    location: "TBD",
    website: "https://colmweb.org/",
    timezone: "AoE",
    confidence: "tbd",
    notes: "COLM is typically late March; 2027 dates not yet announced.",
  },
  {
    id: "l4dc-2027",
    name: "L4DC 2027",
    fullName: "Learning for Dynamics & Control Conference",
    categories: ["ML", "Robotics"],
    paperDeadline: "2026-11-18",
    notificationDate: "2027-03-15",
    eventStart: "2027-06-16",
    eventEnd: "2027-06-18",
    location: "TBD",
    website: "https://l4dc.web.ox.ac.uk/",
    timezone: "AoE",
    confidence: "tbd",
    notes: "L4DC deadline is typically mid/late November; verify.",
  },

  // ----------------------------------------------------------- Vision / CV --
  {
    id: "cvpr-2027",
    name: "CVPR 2027",
    fullName: "IEEE/CVF Conference on Computer Vision and Pattern Recognition",
    categories: ["CV", "ML"],
    paperDeadline: "2026-11-14",
    notificationDate: "2027-02-26",
    eventStart: "2027-06-13",
    eventEnd: "2027-06-19",
    location: "TBD",
    website: "https://cvpr.thecvf.com/",
    timezone: "AoE",
    confidence: "approximate",
    notes: "CVPR paper deadline is typically mid-November. Verify on thecvf.com.",
  },
  {
    id: "iccv-2027",
    name: "ICCV 2027",
    fullName: "IEEE/CVF International Conference on Computer Vision",
    categories: ["CV", "ML"],
    paperDeadline: "2027-03-08",
    notificationDate: "2027-06-25",
    eventStart: "2027-10-10",
    eventEnd: "2027-10-17",
    location: "TBD",
    website: "https://iccv.thecvf.com/",
    timezone: "AoE",
    confidence: "tbd",
    notes: "ICCV runs in odd years; deadline typically early/mid-March.",
  },
  {
    id: "wacv-2027",
    name: "WACV 2027",
    fullName: "IEEE/CVF Winter Conference on Applications of Computer Vision",
    categories: ["CV"],
    paperDeadline: "2026-07-15",
    notificationDate: "2026-10-30",
    eventStart: "2027-01-05",
    eventEnd: "2027-01-09",
    location: "TBD",
    website: "https://wacv.thecvf.com/",
    timezone: "AoE",
    confidence: "approximate",
    notes: "Round-1 paper deadline was ~July 2026 (passed). Event is early Jan 2027.",
  },

  // ------------------------------------------------------------------ NLP ---
  {
    id: "arr-oct-2026",
    name: "ACL ARR — Oct 2026",
    fullName: "ACL Rolling Review — October 2026 submission cycle",
    categories: ["NLP", "ML"],
    paperDeadline: "2026-10-15",
    notificationDate: "2026-12-10",
    location: "Online (rolling review)",
    website: "https://aclrollingreview.org/dates",
    timezone: "AoE",
    confidence: "approximate",
    notes:
      "ACL/EMNLP/NAACL papers are submitted through ARR cycles, not a single venue deadline. Each cycle runs ~monthly; pick the cycle that feeds your target venue.",
  },
  {
    id: "emnlp-2026",
    name: "EMNLP 2026",
    fullName: "Conference on Empirical Methods in Natural Language Processing",
    categories: ["NLP", "ML"],
    paperDeadline: "2026-05-20",
    notificationDate: "2026-08-20",
    eventStart: "2026-11-04",
    eventEnd: "2026-11-08",
    location: "TBD",
    website: "https://2026.emnlp.org/",
    timezone: "AoE",
    confidence: "tbd",
    notes: "Commitment via ARR; direct-submission dates vary. Verify on the EMNLP 2026 site.",
  },
  {
    id: "naacl-2027",
    name: "NAACL 2027",
    fullName:
      "Annual Conference of the North American Chapter of the ACL",
    categories: ["NLP", "ML"],
    paperDeadline: "2026-12-15",
    notificationDate: "2027-03-01",
    eventStart: "2027-06-06",
    eventEnd: "2027-06-11",
    location: "TBD",
    website: "https://naacl.org/",
    timezone: "AoE",
    confidence: "tbd",
    notes: "Fed by an ARR cycle (~Dec 2026). Dates are placeholders.",
  },
  {
    id: "interspeech-2027",
    name: "INTERSPEECH 2027",
    fullName: "Conference of the International Speech Communication Association",
    categories: ["Speech", "ML"],
    paperDeadline: "2027-03-03",
    notificationDate: "2027-06-02",
    eventStart: "2027-08-22",
    eventEnd: "2027-08-26",
    location: "TBD",
    website: "https://www.isca-speech.org/",
    timezone: "AoE",
    confidence: "tbd",
    notes: "INTERSPEECH deadline is typically early March; 2027 dates not yet set.",
  },

  // ---------------------------------------------------------- Data mining ---
  {
    id: "kdd-2027",
    name: "KDD 2027",
    fullName: "ACM SIGKDD Conference on Knowledge Discovery and Data Mining",
    categories: ["DataMining", "ML"],
    abstractDeadline: "2027-02-01",
    paperDeadline: "2027-02-08",
    notificationDate: "2027-05-15",
    eventStart: "2027-08-08",
    eventEnd: "2027-08-12",
    location: "TBD",
    website: "https://www.kdd.org/",
    timezone: "AoE",
    confidence: "tbd",
    notes: "KDD has two cycles; the second is typically early Feb. Verify on kdd.org.",
  },

  // -------------------------------------------------- NeuroAI / Neuroscience -
  {
    id: "ccn-2027",
    name: "CCN 2027",
    fullName: "Conference on Cognitive Computational Neuroscience",
    categories: ["NeuroAI", "Neuroscience"],
    abstractDeadline: "2027-02-04",
    notificationDate: "2027-04-15",
    eventStart: "2027-08-11",
    eventEnd: "2027-08-14",
    location: "TBD",
    website: "https://2027.ccneuro.org/",
    timezone: "AoE",
    confidence: "approximate",
    notes: "CCN abstract deadline is typically early February. Verify on ccneuro.org.",
  },
  {
    id: "cosyne-2027",
    name: "Cosyne 2027",
    fullName: "Computational and Systems Neuroscience",
    categories: ["NeuroAI", "Neuroscience"],
    abstractDeadline: "2026-11-20",
    notificationDate: "2027-01-15",
    eventStart: "2027-03-04",
    eventEnd: "2027-03-07",
    location: "TBD",
    website: "https://www.cosyne.org/",
    timezone: "AoE",
    confidence: "approximate",
    notes: "Cosyne abstracts are typically due late November. Verify on cosyne.org.",
  },
  {
    id: "cogsci-2027",
    name: "CogSci 2027",
    fullName: "Annual Meeting of the Cognitive Science Society",
    categories: ["Neuroscience", "NeuroAI"],
    paperDeadline: "2027-02-01",
    notificationDate: "2027-04-20",
    eventStart: "2027-07-28",
    eventEnd: "2027-07-31",
    location: "TBD",
    website: "https://cognitivesciencesociety.org/",
    timezone: "AoE",
    confidence: "tbd",
    notes: "CogSci deadline is typically late January / early February.",
  },
  {
    id: "vss-2027",
    name: "VSS 2027",
    fullName: "Vision Sciences Society Annual Meeting",
    categories: ["Neuroscience"],
    abstractDeadline: "2026-12-04",
    notificationDate: "2027-02-15",
    eventStart: "2027-05-14",
    eventEnd: "2027-05-19",
    location: "St. Pete Beach, USA",
    website: "https://www.visionsciences.org/",
    timezone: "AoE",
    confidence: "approximate",
    notes: "One abstract per presenter. Abstract deadline typically early December.",
  },
  {
    id: "sfn-2026",
    name: "Neuroscience 2026 (SfN)",
    fullName: "Society for Neuroscience Annual Meeting",
    categories: ["Neuroscience"],
    abstractDeadline: "2026-05-07",
    eventStart: "2026-11-14",
    eventEnd: "2026-11-18",
    location: "San Diego, USA",
    website: "https://www.sfn.org/meetings/neuroscience-2026",
    timezone: "UTC",
    confidence: "approximate",
    notes: "Abstract deadline was ~May 2026 (passed). Meeting is mid-November.",
  },
  {
    id: "ohbm-2027",
    name: "OHBM 2027",
    fullName: "Organization for Human Brain Mapping Annual Meeting",
    categories: ["Neuroscience", "MedImaging"],
    abstractDeadline: "2026-12-11",
    notificationDate: "2027-03-01",
    eventStart: "2027-06-27",
    eventEnd: "2027-07-01",
    location: "TBD",
    website: "https://www.humanbrainmapping.org/",
    timezone: "UTC",
    confidence: "tbd",
    notes: "OHBM abstract deadline is typically mid-December.",
  },

  // ------------------------------------------------ Medical imaging / MedAI -
  {
    id: "ismrm-2027",
    name: "ISMRM 2027",
    fullName:
      "International Society for Magnetic Resonance in Medicine Annual Meeting",
    categories: ["MedImaging", "Neuroscience"],
    abstractDeadline: "2026-10-28",
    notificationDate: "2027-02-01",
    eventStart: "2027-05-08",
    eventEnd: "2027-05-13",
    location: "TBD",
    website: "https://www.ismrm.org/",
    timezone: "UTC",
    confidence: "approximate",
    notes: "Abstract deadline ~Oct 28 2026. Two presenter requirements gate oral talks.",
  },
  {
    id: "miccai-2027",
    name: "MICCAI 2027",
    fullName:
      "International Conference on Medical Image Computing and Computer-Assisted Intervention",
    categories: ["MedImaging", "CV", "ML"],
    abstractDeadline: "2027-02-18",
    paperDeadline: "2027-02-25",
    notificationDate: "2027-05-10",
    eventStart: "2027-09-27",
    eventEnd: "2027-10-01",
    location: "TBD",
    website: "https://www.miccai.org/",
    timezone: "AoE",
    confidence: "tbd",
    notes: "MICCAI deadlines are typically late February; verify on miccai.org.",
  },
  {
    id: "isbi-2027",
    name: "ISBI 2027",
    fullName: "IEEE International Symposium on Biomedical Imaging",
    categories: ["MedImaging", "CV"],
    paperDeadline: "2026-10-30",
    notificationDate: "2027-01-20",
    eventStart: "2027-04-18",
    eventEnd: "2027-04-21",
    location: "TBD",
    website: "https://biomedicalimaging.org/",
    timezone: "AoE",
    confidence: "tbd",
    notes: "ISBI paper deadline is typically late October / early November.",
  },
  {
    id: "midl-2027",
    name: "MIDL 2027",
    fullName: "Medical Imaging with Deep Learning",
    categories: ["MedImaging", "ML"],
    abstractDeadline: "2026-12-10",
    paperDeadline: "2026-12-17",
    notificationDate: "2027-02-28",
    eventStart: "2027-07-07",
    eventEnd: "2027-07-09",
    location: "TBD",
    website: "https://www.midl.io/",
    timezone: "AoE",
    confidence: "tbd",
    notes: "MIDL full-paper deadline is typically mid-December.",
  },
  {
    id: "rsna-2026",
    name: "RSNA 2026",
    fullName: "Radiological Society of North America Annual Meeting",
    categories: ["MedImaging"],
    abstractDeadline: "2026-04-08",
    eventStart: "2026-11-29",
    eventEnd: "2026-12-03",
    location: "Chicago, USA",
    website: "https://www.rsna.org/annual-meeting",
    timezone: "UTC",
    confidence: "approximate",
    notes: "Abstract deadline was ~April 2026 (passed). Meeting is late November.",
  },

  // ------------------------------------------------------ Computational bio -
  {
    id: "recomb-2027",
    name: "RECOMB 2027",
    fullName: "Research in Computational Molecular Biology",
    categories: ["CompBio"],
    paperDeadline: "2026-10-16",
    notificationDate: "2026-12-20",
    eventStart: "2027-04-18",
    eventEnd: "2027-04-21",
    location: "TBD",
    website: "https://www.recomb.org/",
    timezone: "AoE",
    confidence: "tbd",
    notes: "RECOMB deadline is typically mid-October.",
  },
  {
    id: "ismb-2027",
    name: "ISMB/ECCB 2027",
    fullName:
      "Intelligent Systems for Molecular Biology / European Conference on Computational Biology",
    categories: ["CompBio"],
    paperDeadline: "2027-01-14",
    notificationDate: "2027-04-01",
    eventStart: "2027-07-18",
    eventEnd: "2027-07-22",
    location: "TBD",
    website: "https://www.iscb.org/ismb2027",
    timezone: "AoE",
    confidence: "tbd",
    notes: "ISMB proceedings deadline is typically mid-January.",
  },
  {
    id: "psb-2028",
    name: "PSB 2028",
    fullName: "Pacific Symposium on Biocomputing",
    categories: ["CompBio"],
    paperDeadline: "2027-07-24",
    notificationDate: "2027-09-10",
    eventStart: "2028-01-03",
    eventEnd: "2028-01-07",
    location: "Big Island, Hawaii, USA",
    website: "https://psb.stanford.edu/",
    timezone: "AoE",
    confidence: "tbd",
    notes: "PSB paper deadline is typically late July for the following January meeting.",
  },
];

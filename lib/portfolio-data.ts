export type EvidenceStatus = "pending" | "progress" | "done";
export type LayoutKey = "A" | "B" | "C";
export type ThemeKey = "slate" | "midnight" | "pinkgold" | "forest" | "graphite";

export type Competency = {
  code: string;
  req: number;
  title: string;
  group?: string;
};

export type Unit = {
  num: number;
  name: string;
  comps: Competency[];
};

export type FocusArea = {
  id: number;
  name: string;
  codes: string[];
};

export type Theme = {
  name: string;
  vars: Record<string, string>;
};

export const THEME_ORDER: ThemeKey[] = ["slate", "midnight", "pinkgold", "forest", "graphite"];

export const THEMES: Record<ThemeKey, Theme> = {
  slate: {
    name: "Slate & Blue",
    vars: {
      bg: "#eef1f6",
      card: "#ffffff",
      card2: "#fbfcfe",
      ink: "#1b2230",
      body: "#3a4453",
      sub: "#667085",
      muted: "#8a94a6",
      border: "#e2e7ef",
      line: "#eaeef4",
      track: "#eef1f5",
      input: "#f8fafc",
      accent: "#2f6fed",
      accentSoft: "rgba(47,111,237,.10)",
      done: "#12a150",
      prog: "#e08a00",
      pendDot: "#8a94a6",
      pendCell: "#c8d0dc",
      doneBg: "#e7f6ee",
      doneInk: "#12a150",
      progBg: "#fbf1df",
      progInk: "#b46f00",
      pendBg: "#eef1f5",
      pendInk: "#64748b",
      chipPendBg: "#f4f6fa",
      chipPendBorder: "#cdd5e0",
      chipPendInk: "#9aa4b2"
    }
  },
  midnight: {
    name: "Midnight",
    vars: {
      bg: "#0e1420",
      card: "#18202f",
      card2: "#141b28",
      ink: "#e9edf6",
      body: "#c4ccdb",
      sub: "#98a3ba",
      muted: "#6d7a93",
      border: "#28324a",
      line: "#222b40",
      track: "#222b40",
      input: "#141b28",
      accent: "#5b8cff",
      accentSoft: "rgba(91,140,255,.16)",
      done: "#1db877",
      prog: "#f0a83a",
      pendDot: "#7e8aa6",
      pendCell: "#38425c",
      doneBg: "rgba(29,184,119,.16)",
      doneInk: "#4fd39c",
      progBg: "rgba(240,168,58,.16)",
      progInk: "#f2bd68",
      pendBg: "rgba(126,138,166,.16)",
      pendInk: "#a9b3c9",
      chipPendBg: "#1b2334",
      chipPendBorder: "#374363",
      chipPendInk: "#8492ad"
    }
  },
  pinkgold: {
    name: "Pink & Gold",
    vars: {
      bg: "#faf4f6",
      card: "#ffffff",
      card2: "#fdf8fa",
      ink: "#3a2731",
      body: "#5c414d",
      sub: "#8c6c78",
      muted: "#b295a1",
      border: "#f0dde5",
      line: "#f4e8ee",
      track: "#f3e4ea",
      input: "#fdf6f9",
      accent: "#c8437f",
      accentSoft: "rgba(200,67,127,.12)",
      done: "#c1962f",
      prog: "#e07aa6",
      pendDot: "#bda3af",
      pendCell: "#ecd7e0",
      doneBg: "#f7edd6",
      doneInk: "#9c7618",
      progBg: "#fce7f0",
      progInk: "#b8477f",
      pendBg: "#f2e6ec",
      pendInk: "#9a7d8b",
      chipPendBg: "#fbf3f7",
      chipPendBorder: "#ecd3de",
      chipPendInk: "#b295a1"
    }
  },
  forest: {
    name: "Forest & Clay",
    vars: {
      bg: "#eef2ef",
      card: "#ffffff",
      card2: "#f8faf8",
      ink: "#1c2a24",
      body: "#374a41",
      sub: "#5f7268",
      muted: "#8b9a92",
      border: "#dde6e0",
      line: "#e7eee9",
      track: "#e8efea",
      input: "#f6f9f7",
      accent: "#12866f",
      accentSoft: "rgba(18,134,111,.12)",
      done: "#4a9d54",
      prog: "#c98a3c",
      pendDot: "#8b9a92",
      pendCell: "#c8d5cd",
      doneBg: "#e4f4ea",
      doneInk: "#237a45",
      progBg: "#f6ecd9",
      progInk: "#9a6a22",
      pendBg: "#e9efeb",
      pendInk: "#5f7268",
      chipPendBg: "#f2f6f3",
      chipPendBorder: "#cdd8d1",
      chipPendInk: "#93a29a"
    }
  },
  graphite: {
    name: "Graphite",
    vars: {
      bg: "#f3f4f6",
      card: "#ffffff",
      card2: "#fafbfc",
      ink: "#161a20",
      body: "#39414d",
      sub: "#606a78",
      muted: "#98a1ad",
      border: "#e4e7ec",
      line: "#eef0f3",
      track: "#eceef1",
      input: "#f7f8fa",
      accent: "#3a4657",
      accentSoft: "rgba(58,70,87,.10)",
      done: "#3f9d6a",
      prog: "#c58a3e",
      pendDot: "#98a1ad",
      pendCell: "#cbd1da",
      doneBg: "#e8f4ee",
      doneInk: "#2f7a50",
      progBg: "#f6edda",
      progInk: "#8f6522",
      pendBg: "#eceef2",
      pendInk: "#5a6470",
      chipPendBg: "#f4f6f8",
      chipPendBorder: "#d3d9e0",
      chipPendInk: "#98a1ad"
    }
  }
};

export const DATA: Unit[] = [
  {
    num: 1,
    name: "Operating with Law, Professional Practice and the Code of Ethics",
    comps: [
      { code: "1.1", req: 2, title: "Knowledge of professional practice requirements having regard to the Code of Ethics / NDM" }
    ]
  },
  {
    num: 2,
    name: "Processes for Management of Information / Intelligence",
    comps: [
      { code: "2.1", req: 2, title: "Gather and submit intelligence according to force and national protocols" }
    ]
  },
  {
    num: 3,
    name: "Initial Response",
    comps: [
      { code: "3.1", req: 3, title: "Provide initial response to incidents" },
      { code: "3.2", req: 3, title: "Use a recognised approach e.g., THRIVE" },
      { code: "3.3", req: 3, title: "Communicate effectively with those at the scene" },
      { code: "3.4a", req: 1, title: "Control incidents / preserving scene & potential evidence — Intimate Domestic" },
      { code: "3.4b", req: 1, title: "Control incidents / preserving scene & potential evidence — Road Traffic Collision" },
      { code: "3.4c", req: 1, title: "Control incidents / preserving scene & potential evidence — General Incident" },
      { code: "3.5a", req: 1, title: "Recognise and provide support to Vulnerable Person" },
      { code: "3.5b", req: 1, title: "Recognise and provide support to Casualties" },
      { code: "3.6", req: 3, title: "Provide support to victims and witnesses at the incident" },
      { code: "3.7", req: 1, title: "Engage in appropriate multi-agency referrals" },
      { code: "3.8", req: 3, title: "Record actions taken and retain appropriate documents" }
    ]
  },
  {
    num: 4,
    name: "Managing Conflict",
    comps: [
      { code: "4.1", req: 1, title: "Apply conflict management and personal safety techniques with issued equipment" },
      { code: "4.2", req: 2, title: "Make threat assessments using all available information" },
      { code: "4.3", req: 2, title: "Use approved and appropriate communication techniques" },
      { code: "4.4", req: 2, title: "Respond appropriately to danger signs and warning signs" },
      { code: "4.5a", req: 1, title: "Apply conflict management techniques — Verbally non-compliant individual" },
      { code: "4.5b", req: 1, title: "Apply conflict management techniques — Physically non-compliant individual" },
      { code: "4.6", req: 1, title: "Record all actions taken and decisions made" }
    ]
  },
  {
    num: 5,
    name: "Support to Vulnerable People, Victims & Witnesses",
    comps: [
      { code: "5.1", req: 2, title: "Communicate effectively with vulnerable people, victims and witnesses" },
      { code: "5.2", req: 2, title: "Provide appropriate support to vulnerable people, victims and witnesses" },
      { code: "5.3", req: 2, title: "Understanding of vulnerable persons, victims & witnesses & willingness to receive support" },
      { code: "5.4a", req: 1, title: "Assess the resilience and capability of the individual, and provide further support" },
      { code: "5.4b", req: 1, title: "Assess the resilience and capability of the individual, and make referrals" }
    ]
  },
  {
    num: 6,
    name: "Police Powers and Suspects",
    comps: [
      { code: "6.1a", req: 1, title: "Arrest & detain suspects — Compliant Individual" },
      { code: "6.1b", req: 1, title: "Arrest & detain suspects — Non-Compliant Individual" },
      { code: "6.2", req: 2, title: "Report suspects in line with legal and organisational requirements and timescales" },
      { code: "6.3", req: 2, title: "Apply alternative options regarding disposal of suspects" }
    ]
  },
  {
    num: 7,
    name: "Conducting Police Searches",
    comps: [
      { code: "7.1a", req: 1, title: "Conduct safe, lawful and effective police searches of Premises" },
      { code: "7.1b", req: 1, title: "Conduct safe, lawful and effective police searches of Vehicles" },
      { code: "7.2", req: 2, title: "Communicate appropriately with those at the search scene" },
      { code: "7.3", req: 2, title: "Identify the correct search area" },
      { code: "7.4", req: 2, title: "Protect search scene" },
      { code: "7.5", req: 2, title: "Prevent loss or contamination of potential evidence" },
      { code: "7.6", req: 2, title: "Utilise approved search techniques" },
      { code: "7.7", req: 1, title: "Analyse the significance of items found during the search" },
      { code: "7.8", req: 1, title: "Seize items covered by identified search powers" },
      { code: "7.9", req: 1, title: "Maintain the integrity of seized items" },
      { code: "7.10", req: 2, title: "Leave the search scene in the required condition" },
      { code: "7.11", req: 2, title: "Document all decisions, actions, options and rationales" }
    ]
  },
  {
    num: 8,
    name: "Conducting Police Searches of a Person",
    comps: [
      { code: "8.1a", req: 1, title: "Conduct police searches of individuals — Individual under arrest" },
      { code: "8.1b", req: 1, title: "Conduct police searches of individuals — Individual not under arrest" },
      { code: "8.2", req: 2, title: "Use authorised and appropriate systematic search methods" },
      { code: "8.3", req: 2, title: "Communicate appropriately with the individual before and during the search" },
      { code: "8.4", req: 2, title: "Control individuals to prevent loss of evidence, escape or harm to any person" },
      { code: "8.5", req: 2, title: "Maintain personal safety using approved and appropriate techniques" },
      { code: "8.6", req: 1, title: "Seize any identified items covered by the relevant search power" },
      { code: "8.7", req: 1, title: "Maintain the integrity of seized items" },
      { code: "8.8", req: 2, title: "Inform of the results of the search and any further actions to be taken" },
      { code: "8.9", req: 2, title: "Document all decisions, actions, options and rationales" }
    ]
  },
  {
    num: 9,
    name: "Conducting Investigations",
    comps: [
      { code: "9.1", req: 2, title: "Plan & conduct an initial investigation" },
      { code: "9.2", req: 2, title: "Gather information, intelligence and evidence to support the investigation" },
      { code: "9.3", req: 2, title: "Undertake investigative and evidential evaluation throughout the investigation" },
      { code: "9.4", req: 2, title: "Brief relevant others regarding the progress of the investigation" },
      { code: "9.5", req: 2, title: "Identify the need for any additional support, including escalation" },
      { code: "9.6A", req: 1, title: "Identify and work with Victims" },
      { code: "9.6B", req: 1, title: "Identify and work with Potential Witnesses" },
      { code: "9.6C", req: 1, title: "Identify and work with Suspects" },
      { code: "9.7", req: 1, title: "Deal with suspects in line with investigative decision-making" },
      { code: "9.8", req: 2, title: "Provide victims, witnesses and their families with information, support and protection in accordance with their needs" },
      { code: "9.9", req: 2, title: "Retain and record the details of an investigation" }
    ]
  },
  {
    num: 10,
    name: "Interviewing Victims, Witnesses and Suspects",
    comps: [
      { code: "10.1", req: 3, group: "Interviewing victims & witnesses", title: "Plan and prepare interviews with victims and witnesses" },
      { code: "10.2A", req: 2, group: "Interviewing victims & witnesses", title: "Conduct interviews with victims" },
      { code: "10.2B", req: 1, group: "Interviewing victims & witnesses", title: "Conduct interviews with witnesses" },
      { code: "10.3", req: 3, group: "Interviewing victims & witnesses", title: "Explain the interview process & confirm understanding" },
      { code: "10.4", req: 3, group: "Interviewing victims & witnesses", title: "Maintain the security and welfare of those present" },
      { code: "10.5", req: 3, group: "Interviewing victims & witnesses", title: "Use approved interview and communication techniques to obtain accurate accounts" },
      { code: "10.6", req: 1, group: "Interviewing victims & witnesses", title: "Use exhibits in line with approved interview techniques" },
      { code: "10.7", req: 1, group: "Interviewing victims & witnesses", title: "Address any contingencies that may arise during the interview" },
      { code: "10.8", req: 3, group: "Interviewing victims & witnesses", title: "Complete all necessary documents and records" },
      { code: "10.9", req: 3, group: "Interviewing victims & witnesses", title: "Close the interview, informing all present of the next steps" },
      { code: "10.10", req: 3, group: "Interviewing victims & witnesses", title: "Evaluate interview and carry out post-interview procedures" },
      { code: "10.11", req: 2, group: "Interviewing suspects", title: "Plan and prepare interviews with suspects" },
      { code: "10.12", req: 1, group: "Interviewing suspects", title: "Deliver pre-interview briefings to legal representatives" },
      { code: "10.13A", req: 1, group: "Interviewing suspects", title: "Conduct interviews with suspects in custody" },
      { code: "10.13B", req: 1, group: "Interviewing suspects", title: "Conduct interviews with suspects out of custody" },
      { code: "10.14", req: 2, group: "Interviewing suspects", title: "Explain the interview process to those present and confirm understanding" },
      { code: "10.15", req: 2, group: "Interviewing suspects", title: "Use the required cautions, special warnings and check suspect's understanding" },
      { code: "10.16", req: 2, group: "Interviewing suspects", title: "Maintain the security and welfare of those present" },
      { code: "10.17", req: 2, group: "Interviewing suspects", title: "Use approved interview and communication techniques to obtain accurate accounts" },
      { code: "10.18", req: 1, group: "Interviewing suspects", title: "Use exhibits in line with approved interview techniques" },
      { code: "10.19", req: 1, group: "Interviewing suspects", title: "Address any contingencies that may arise during the interview" },
      { code: "10.20", req: 2, group: "Interviewing suspects", title: "Complete all necessary documents and records" },
      { code: "10.21", req: 2, group: "Interviewing suspects", title: "Close the interview, informing all present of the next steps" },
      { code: "10.22", req: 2, group: "Interviewing suspects", title: "Evaluate interview and carry out post-interview procedures" }
    ]
  },
  {
    num: 11,
    name: "Community Policing and Partnership Working",
    comps: [
      { code: "11.1", req: 1, title: "Communicate and engage proactively with communities, including through use of social media" },
      { code: "11.2", req: 1, title: "Foster productive partnerships in community policing" }
    ]
  },
  {
    num: 12,
    name: "Response Policing",
    comps: [
      { code: "12.1", req: 1, title: "Provide an effective initial response to a critical or major incident (or one with the potential to become critical)" }
    ]
  },
  {
    num: 13,
    name: "Roads Policing",
    comps: [
      { code: "13.1", req: 1, title: "Apply appropriate procedures and options for the disposal of driving and vehicle offences committed by road users" }
    ]
  },
  {
    num: 14,
    name: "Information, Intelligence and Evidence",
    comps: [
      { code: "14.1", req: 1, title: "Effectively gather, analyse / evaluate and develop information and intelligence" }
    ]
  },
  {
    num: 15,
    name: "Digital Investigations & Criminal Justice",
    comps: [
      { code: "15.1", req: 1, title: "Apply appropriate investigative procedures in respect of digital crime" },
      { code: "15.2", req: 2, title: "Manage cases through the criminal justice system" }
    ]
  }
];

export const FOCUS: FocusArea[] = [
  { id: 1, name: "Intelligence", codes: ["2.1"] },
  { id: 2, name: "Intimate domestic", codes: ["3.4a", "3.5a"] },
  { id: 3, name: "Road traffic collision", codes: ["3.4b", "3.5b"] },
  { id: 4, name: "General incident (initial attend.)", codes: ["3.4c"] },
  { id: 5, name: "Conflict", codes: ["4.1", "4.2", "4.3", "4.4", "4.5a", "4.5b", "4.6"] },
  { id: 6, name: "Arrest — compliant", codes: ["6.1a"] },
  { id: 7, name: "Arrest — non-compliant", codes: ["6.1b"] },
  { id: 8, name: "Report for offence", codes: ["6.2"] },
  { id: 9, name: "Alternative disposal", codes: ["6.3"] },
  { id: 10, name: "Premises search", codes: ["7.1a"] },
  { id: 11, name: "Vehicle search", codes: ["7.1b"] },
  { id: 12, name: "Section 32 search", codes: ["8.1a"] },
  { id: 13, name: "Stop and search", codes: ["8.1b"] },
  { id: 14, name: "Investigation", codes: ["9.1"] },
  { id: 15, name: "Victim interview", codes: ["10.2A"] },
  { id: 16, name: "Witness interviews", codes: ["10.2B"] },
  { id: 17, name: "Suspect interview — in custody", codes: ["10.13A"] },
  { id: 18, name: "Suspect interview — out of custody", codes: ["10.13B"] },
  { id: 19, name: "Road traffic incident", codes: ["13.1"] }
];

export const ALL_COMPETENCY_CODES = DATA.flatMap((unit) => unit.comps.map((comp) => comp.code));
export const TOTAL_EVIDENCE = DATA.reduce(
  (sum, unit) => sum + unit.comps.reduce((unitSum, comp) => unitSum + comp.req, 0),
  0
);

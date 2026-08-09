function pluralReports(count: number): string {
  return count === 1 ? "märge" : "märget";
}

function pluralPeople(count: number): string {
  return count === 1 ? "inimene" : "inimest";
}

export const et = {
  appTitle: "Tervishoiujärjekord",
  appTagline: "Erakorralise meditsiini ja perearstikeskuste koormus reaalajas",

  locationType: {
    hospital: "Haigla / erakorraline meditsiin",
    clinic: "Perearstikeskus",
    mfc: "Teenindusbüroo",
    post: "Postkontor",
  },

  status: {
    low: "Vaba",
    medium: "On järjekord",
    high: "Pikk ooteaeg",
    stale: "Andmed aegunud",
    "no-data": "Keegi pole veel märkinud",
  },

  // Short glanceable labels for the map badge — the full words above are
  // too wide to fit in a pill marker.
  statusShort: {
    low: "vaba",
    medium: "on",
    high: "palju",
    stale: "?",
    "no-data": "—",
  },

  report: {
    prompt: "Milline on järjekord praegu?",
    submit: "Saada",
    submitting: "Saatmine…",
    success: "Aitäh! Sa aitasid järgmisi külastajaid.",
    updatedAgo: (minutes: number) => `Uuendatud ${minutes} min tagasi`,
    neverReported: "Ole esimene, kes märgib",
    reportsCountLastHour: (count: number) =>
      count < 3 ? "vähe andmeid" : `${count} ${pluralReports(count)} viimase tunni jooksul`,
  },

  geoCheck: {
    denied: "Asukohta ei õnnestunud tuvastada. Luba juurdepääs ja proovi uuesti.",
    unavailable: "Asukoht ei ole selles brauseris saadaval.",
    tooFar: (distanceM: number) =>
      `Oled sellest punktist liiga kaugel (${Math.round(distanceM)} m). Märkimine on võimalik asutuse lähedal.`,
    checking: "Kontrollime asukohta…",
  },

  rateLimit: {
    tooSoon: "Sa märkisid selle punkti hiljuti juba ära. Proovi hiljem uuesti.",
  },

  sidebar: {
    searchPlaceholder: "Otsi nime järgi",
    sortByStatus: "Staatuse järgi",
    sortByDistance: "Kauguse järgi",
    distanceUnavailable: "Kauguse järgi sortimiseks ei õnnestunud asukohta tuvastada.",
    noResults: "Midagi ei leitud",
    showDepartments: "Näita osakondi",
  },

  notes: {
    placeholder: "Kommentaar (valikuline)",
    attachPhoto: "Lisa foto",
    photoAttached: "Foto lisatud",
    removePhoto: "Eemalda",
    recent: "Viimased märkused",
    empty: "Märkusi pole veel",
    minutesAgo: (minutes: number) => `${minutes} min tagasi`,
    addNoteLabel: "Jäta märkus",
  },

  location: {
    getDirections: "Kuva teekond",
    call: "Helista",
  },

  // Keyed by departments.slug — department display names live here, not in
  // the DB, so they switch with the rest of the interface.
  departments: {
    trauma: "Trauma / luumurrud",
    "internal-medicine": "Sisehaigused / üldine halb enesetunne",
    surgery: "Kirurgia",
  },

  landing: {
    trustNote: "Külastajad uuendavad staatust ise, reaalajas",
    points: [
      "Vaata haiglate ja perearstikeskuste koormust kaardil",
      "Märgi, kui oled praegu järjekorras — see võtab hetke",
      "Aita teistel valida, kus on lühem ooteaeg",
    ],
    cta: "Vaata järjekorda kohe",
    todayCount: (count: number) => `Täna märkis end ${count} ${pluralPeople(count)}`,
  },

  chat: {
    launcherLabel: "Küsi abi",
    title: "Terviseabiline",
    disclaimer: "See ei ole meditsiiniline konsultatsioon ega asenda arsti.",
    privacyNote: "Ära jaga vestluses isikuandmeid (nimi, täpne aadress vms).",
    placeholder: "Kirjuta oma küsimus…",
    send: "Saada",
    emergencyBanner: "Eluohtlike sümptomite korral helista kohe 112.",
    rateLimited: "Bot on hetkel ülekoormatud, proovi minuti pärast uuesti.",
    genericError: "Midagi läks valesti. Proovi uuesti.",
    intro:
      "Tere! Võin aidata leida lähima haigla või rääkida läbi, mis su sümptomitega toimuda võib. Eluohtliku olukorra korral helista kohe 112.",
    close: "Sulge",
  },
} as const;

export type Dictionary = typeof et;

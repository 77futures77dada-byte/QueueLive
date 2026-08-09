function pluralPeople(count: number): string {
  return count === 1 ? "person" : "people";
}

export const en = {
  appTitle: "Health Queue",
  appTagline: "Live wait times at ERs and clinics",

  locationType: {
    hospital: "Hospital / ER",
    clinic: "Clinic",
    mfc: "Service office",
    post: "Post office",
  },

  status: {
    low: "Short wait",
    medium: "There's a queue",
    high: "Long wait",
    stale: "No fresh data",
    "no-data": "No reports yet",
  },

  // Freshness of the last report, independent of the load level itself —
  // see lib/aggregateStatus.ts's Confidence type.
  confidence: {
    mediumNote: "Might be slightly outdated",
    lowNote: "Could have changed",
  },

  // Short glanceable labels for the map badge — the full words above are
  // too wide to fit in a pill marker.
  statusShort: {
    low: "short",
    medium: "some",
    high: "long",
    stale: "?",
    "no-data": "—",
  },

  report: {
    prompt: "What's the queue like right now?",
    submit: "Submit",
    submitting: "Submitting…",
    success: "Thanks! You just helped the next people in line.",
    updatedAgo: (minutes: number) => `Updated ${minutes} min ago`,
    neverReported: "Be the first to check in",
    // Framed as attributed, self-reported data ("reported"), not as fact —
    // this count is what backs the displayed status, so it stays visible
    // next to it rather than being a click-to-reveal detail.
    reportsCountLastHour: (count: number) =>
      count < 3
        ? "not much data"
        : `${count} ${pluralPeople(count)} reported in the last hour`,
  },

  geoCheck: {
    denied: "Couldn't get your location. Allow access and try again.",
    unavailable: "Geolocation isn't available in this browser.",
    tooFar: (distanceM: number) =>
      `You're too far from this location (${Math.round(distanceM)} m). Check-ins only work near the facility.`,
    checking: "Checking your location…",
  },

  rateLimit: {
    tooSoon: "You already checked in here recently. Try again later.",
  },

  sidebar: {
    searchPlaceholder: "Search by name",
    sortByStatus: "By status",
    sortByDistance: "By distance",
    distanceUnavailable: "Couldn't get your location to sort by distance.",
    noResults: "Nothing found",
    showDepartments: "Show departments",
  },

  notes: {
    placeholder: "Comment (optional)",
    attachPhoto: "Attach photo",
    photoAttached: "Photo attached",
    removePhoto: "Remove",
    recent: "Recent notes",
    empty: "No notes yet",
    minutesAgo: (minutes: number) => `${minutes} min ago`,
    addNoteLabel: "Leave a note",
  },

  location: {
    getDirections: "Get directions",
    call: "Call",
  },

  confirmation: {
    stillAccurate: "Still accurate",
    noLongerAccurate: "No longer accurate",
    thanks: "Thanks for the update",
  },

  bestOption: {
    heading: (name: string) => `Best option right now: ${name}`,
    distanceAway: (meters: number) =>
      meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`,
  },

  // Keyed by departments.slug — department display names live here, not in
  // the DB, so they switch with the rest of the interface.
  departments: {
    trauma: "Trauma / fractures",
    "internal-medicine": "Internal medicine / general illness",
    surgery: "Surgery",
  },

  landing: {
    trustNote: "Visitors update the status themselves, in real time",
    points: [
      "See how busy ERs and clinics are on the map",
      "Check in if you're in the queue right now — takes a second",
      "Help others go where the wait is shorter",
    ],
    cta: "See the queue now",
    todayCount: (count: number) => `${count} ${pluralPeople(count)} checked in today`,
    live: "Live",
    cityLabel: "Tallinn, Estonia",
  },

  chat: {
    launcherLabel: "Ask for help",
    title: "Health assistant",
    disclaimer: "This is not medical advice and does not replace a doctor.",
    privacyNote: "Don't share personal details (full name, exact address, etc.) in the chat.",
    placeholder: "Type your question…",
    send: "Send",
    emergencyBanner: "If this sounds life-threatening, call 112 right now.",
    rateLimited: "The assistant is overloaded right now — try again in a minute.",
    genericError: "Something went wrong. Please try again.",
    intro:
      "Hi! I can help you find the nearest hospital or talk through what your symptoms might mean. If this is a life-threatening emergency, call 112 immediately.",
    close: "Close",
  },
} as const;

export type Dictionary = typeof en;

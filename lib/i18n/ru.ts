function pluralPeople(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "человек";
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return "человека";
  return "человек";
}

export const ru = {
  appTitle: "Очередь за здоровьем",
  appTagline: "Загруженность травмпунктов и поликлиник — в реальном времени",

  locationType: {
    hospital: "Больница / травмпункт",
    clinic: "Поликлиника",
    mfc: "МФЦ",
    post: "Почта",
  },

  status: {
    low: "Свободно",
    medium: "Есть очередь",
    high: "Долгое ожидание",
    stale: "Нет свежих данных",
    "no-data": "Пока никто не отмечался",
  },

  // Freshness of the last report, independent of the load level itself —
  // see lib/aggregateStatus.ts's Confidence type.
  confidence: {
    mediumNote: "Могло немного устареть",
    lowNote: "Могло измениться",
  },

  // Short glanceable labels for the map badge — the full words above are
  // too wide to fit in a pill marker.
  statusShort: {
    low: "мало",
    medium: "есть",
    high: "много",
    stale: "?",
    "no-data": "—",
  },

  report: {
    prompt: "Как сейчас в очереди?",
    submit: "Отправить",
    submitting: "Отправка…",
    success: "Спасибо! Вы помогли следующим посетителям.",
    updatedAgo: (minutes: number) => `Обновлено ${minutes} мин. назад`,
    neverReported: "Будь первым, кто оставит отметку",
    // Framed as attributed, self-reported data ("сообщили"), not as fact —
    // this count is what backs the displayed status, so it stays visible
    // next to it rather than being a click-to-reveal detail.
    reportsCountLastHour: (count: number) =>
      count < 3
        ? "мало данных"
        : `${count} ${pluralPeople(count)} сообщили за последний час`,
  },

  geoCheck: {
    denied: "Не удалось определить геолокацию. Разрешите доступ и попробуйте снова.",
    unavailable: "Геолокация недоступна в этом браузере.",
    tooFar: (distanceM: number) =>
      `Вы слишком далеко от этой точки (${Math.round(distanceM)} м). Отметка доступна рядом с учреждением.`,
    checking: "Проверяем геолокацию…",
  },

  rateLimit: {
    tooSoon: "Вы уже отмечали эту точку недавно. Попробуйте позже.",
  },

  sidebar: {
    searchPlaceholder: "Поиск по названию",
    sortByStatus: "По статусу",
    sortByDistance: "По расстоянию",
    distanceUnavailable: "Не удалось определить геолокацию для сортировки по расстоянию.",
    noResults: "Ничего не найдено",
    showDepartments: "Показать направления",
    mapTab: "Карта",
    listTab: "Список",
  },

  notes: {
    placeholder: "Комментарий (необязательно)",
    attachPhoto: "Добавить фото",
    photoAttached: "Фото прикреплено",
    removePhoto: "Убрать",
    recent: "Последние заметки",
    empty: "Заметок пока нет",
    minutesAgo: (minutes: number) => `${minutes} мин. назад`,
    addNoteLabel: "Оставить заметку",
  },

  location: {
    getDirections: "Проложить маршрут",
    call: "Позвонить",
    close: "Закрыть",
  },

  confirmation: {
    stillAccurate: "Всё ещё так",
    noLongerAccurate: "Уже не так",
    thanks: "Спасибо за уточнение",
  },

  bestOption: {
    heading: (name: string) => `Лучший вариант сейчас: ${name}`,
    distanceAway: (meters: number) =>
      meters < 1000 ? `${Math.round(meters)} м` : `${(meters / 1000).toFixed(1)} км`,
  },

  // Keyed by departments.slug — department display names live here, not in
  // the DB, so they switch with the rest of the interface.
  departments: {
    trauma: "Травма / переломы",
    "internal-medicine": "Терапевт / общее недомогание",
    surgery: "Хирург",
  },

  landing: {
    trustNote: "Статус обновляют сами посетители в реальном времени",
    points: [
      "Смотри загруженность травмпунктов и поликлиник на карте",
      "Отмечай, если сейчас в очереди — это займёт секунду",
      "Помогай другим ехать туда, где короче ждать",
    ],
    cta: "Посмотреть очередь сейчас",
    todayCount: (count: number) => `Сегодня отметилось ${count} ${pluralPeople(count)}`,
    live: "Реальное время",
    cityLabel: "Таллин, Эстония",
  },

  chat: {
    launcherLabel: "Спросить совет",
    title: "Помощник по здоровью",
    disclaimer: "Это не медицинская консультация и не заменяет врача.",
    privacyNote: "Не указывайте личные данные (ФИО, точный адрес и т.п.) в переписке с ботом.",
    placeholder: "Напишите свой вопрос…",
    send: "Отправить",
    emergencyBanner: "Если это похоже на угрозу жизни — сразу звоните 112.",
    rateLimited: "Бот сейчас перегружен, попробуйте через минуту.",
    genericError: "Что-то пошло не так. Попробуйте ещё раз.",
    intro:
      "Привет! Могу помочь найти ближайшую больницу или разобраться, что может значить ваше состояние. Если это угроза жизни — сразу звоните 112.",
    close: "Закрыть",
  },
} as const;

export type Dictionary = typeof ru;

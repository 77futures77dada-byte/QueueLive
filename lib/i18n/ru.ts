function pluralReports(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "отметка";
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return "отметки";
  return "отметок";
}

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
    stale: "Данные устарели",
    "no-data": "Пока никто не отмечался",
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
    reportsCountLastHour: (count: number) =>
      count < 3 ? "мало данных" : `${count} ${pluralReports(count)} за час`,
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
  },

  notes: {
    placeholder: "Комментарий (необязательно)",
    attachPhoto: "Добавить фото",
    photoAttached: "Фото прикреплено",
    removePhoto: "Убрать",
    recent: "Последние заметки",
    empty: "Заметок пока нет",
  },

  location: {
    getDirections: "Проложить маршрут",
    call: "Позвонить",
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
  },
} as const;

export type Dictionary = typeof ru;

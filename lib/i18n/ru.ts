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
    "no-data": "Нет данных",
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
    success: "Спасибо! Отметка сохранена.",
    updatedAgo: (minutes: number) => `Обновлено ${minutes} мин. назад`,
    neverReported: "Отметок ещё не было",
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
    sortByStatus: "По статусу",
    sortByDistance: "По расстоянию",
    distanceUnavailable: "Не удалось определить геолокацию для сортировки по расстоянию.",
  },

  notes: {
    placeholder: "Комментарий (необязательно)",
    attachPhoto: "Добавить фото",
    photoAttached: "Фото прикреплено",
    removePhoto: "Убрать",
    recent: "Последние заметки",
    empty: "Заметок пока нет",
  },

  landing: {
    points: [
      "Смотри загруженность травмпунктов и поликлиник на карте",
      "Отмечай, если сейчас в очереди — это займёт секунду",
      "Помогай другим ехать туда, где короче ждать",
    ],
    cta: "Перейти к карте",
  },
} as const;

export type Dictionary = typeof ru;

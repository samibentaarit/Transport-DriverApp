export function formatClock(value?: string | null, locale = "en") {
  if (!value) {
    return "--:--";
  }

  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function formatDateLabel(value?: string | null, locale = "en") {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

export function minutesBetween(from?: string | null, to?: string | null) {
  if (!from || !to) {
    return null;
  }

  return Math.max(0, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 60000));
}

export function isSameDay(a?: string | null, b?: string | null) {
  if (!a || !b) {
    return false;
  }

  return new Date(a).toDateString() === new Date(b).toDateString();
}


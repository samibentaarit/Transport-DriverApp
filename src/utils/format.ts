import { Student, TripStatus } from "@/types/models";

export function maskStudentName(student?: Student) {
  if (!student) {
    return "Unknown student";
  }

  if (student.full_name) {
    const names = student.full_name.trim().split(/\s+/);
    if (names.length === 1) {
      return names[0];
    }

    const first = names[0];
    const lastInitial = names[names.length - 1]?.[0];
    return `${first} ${lastInitial}.`;
  }

  const first = student.first_name?.trim() ?? "";
  const lastInitial = student.last_name?.trim()?.[0];
  return lastInitial ? `${first} ${lastInitial}.` : first || "Unknown student";
}

export function formatVehicleLabel(name?: string | null, plate?: string | null) {
  if (name && plate) {
    return `${name} | ${plate}`;
  }

  return name || plate || "Vehicle not assigned";
}

export function tripStatusTone(status: TripStatus | "offline") {
  switch (status) {
    case "scheduled":
      return "warning";
    case "enroute":
      return "primary";
    case "completed":
      return "success";
    case "cancelled":
      return "danger";
    case "offline":
      return "neutral";
    default:
      return "neutral";
  }
}

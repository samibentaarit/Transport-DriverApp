import { AppLocale } from "@/types/models";

export const translations: Record<AppLocale, Record<string, string>> = {
  en: {
    login: "Driver sign in",
    email: "Email",
    password: "Password",
    signIn: "Sign in",
    enrollment: "QR enrollment",
    todayTrips: "Today's trips",
    notifications: "Notifications",
    messages: "Messages",
    history: "History",
    profile: "Profile",
    activeTrip: "Active trip",
    offline: "Offline mode",
    queue: "Sync queue",
    reportIncident: "Report incident",
    emergency: "Emergency",
    noTrips: "No trips assigned today"
  },
  fr: {
    login: "Connexion chauffeur",
    email: "E-mail",
    password: "Mot de passe",
    signIn: "Se connecter",
    enrollment: "Appairage QR",
    todayTrips: "Trajets du jour",
    notifications: "Notifications",
    messages: "Messages",
    history: "Historique",
    profile: "Profil",
    activeTrip: "Trajet actif",
    offline: "Mode hors ligne",
    queue: "File de synchro",
    reportIncident: "Signaler un incident",
    emergency: "Urgence",
    noTrips: "Aucun trajet aujourd'hui"
  },
  ar: {
    login: "تسجيل دخول السائق",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    signIn: "دخول",
    enrollment: "ربط عبر QR",
    todayTrips: "رحلات اليوم",
    notifications: "الإشعارات",
    messages: "الرسائل",
    history: "السجل",
    profile: "الملف الشخصي",
    activeTrip: "الرحلة النشطة",
    offline: "وضع دون اتصال",
    queue: "قائمة المزامنة",
    reportIncident: "إبلاغ عن حادث",
    emergency: "طوارئ",
    noTrips: "لا توجد رحلات اليوم"
  }
};


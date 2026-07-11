import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "login_title": "Digital Vault System",
      "master_password": "Master Password",
      "enter": "Enter",
      "dashboard": "Dashboard",
      "emails": "Emails",
      "add_email": "Add Email",
      "add_service": "Add Service",
      "services": "Services",
      "credentials": "Credentials",
      "copy": "Copy",
      "show": "Show",
      "hide": "Hide",
      "logout": "Logout",
      "status": "Status",
      "category": "Category",
      "deployment": "Deployment",
      "add_new_service": "Add New Service"
    }
  },
  ar: {
    translation: {
      "login_title": "نظام الخزنة الرقمية",
      "master_password": "كلمة المرور الرئيسية",
      "enter": "دخول",
      "dashboard": "لوحة القيادة",
      "emails": "البريد الإلكتروني",
      "add_email": "إضافة بريد",
      "add_service": "إضافة خدمة",
      "services": "الخدمات",
      "credentials": "البيانات السرية",
      "copy": "نسخ",
      "show": "عرض",
      "hide": "إخفاء",
      "logout": "تسجيل خروج",
      "status": "الحالة",
      "category": "الفئة",
      "deployment": "النشر",
      "add_new_service": "إضافة خدمة جديدة"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "ar",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

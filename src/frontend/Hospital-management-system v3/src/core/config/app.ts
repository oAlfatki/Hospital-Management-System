export const appConfig = {
  name: "My Application",
  shortName: "My App",
  description: "Modern React application",

  version: "1.0.0",

  defaultLanguage: "en",
  supportedLanguages: ["en", "fr", "ar"],

  defaultTheme: "system",

  pagination: {
    defaultPage: 1,
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
  },

  dateFormat: "dd/MM/yyyy",

  contact: {
    email: "contact@example.com",
  },
} as const;

/*import { appConfig } from "@/core/config/app";

function Header() {
  return <h1>{appConfig.name}</h1>;
}*/
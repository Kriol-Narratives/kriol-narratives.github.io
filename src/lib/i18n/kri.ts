import type { DeepPartial, Messages } from "./messages";

export const kri: DeepPartial<Messages> = {
  Common: {
    authors: ({ author }) => `Aata dem: ${author}`,
  },
  ArticleTypes: { audio: "Audio", video: "Video" },
  MediaTabs: {},
  Filters: {
    apply: "Filta",
    keyword: "Kii wod",
    medio: "Miidia",
    autoria: "Aata dem",
    fechas: "Deit",
    resultsOf: ({ count, total }) => `${count} outa ${total} rizolt`,
    resultsRange: ({ count, total }) => `1-${count} outa ${total} rizolt`,
  },
  Article: {
    metadata: "Metadata",
    description: "Diskripshan:",
    mediaType: "Miidia:",
    repositoryLink: "Link tu di rekod:",
    authors: "Aata dem:",
    date: "Deit wen dehn mek it:",
    license: "Laisens:",
    citeThis: "Hou fi sait dis matiryal:",
  },
  Pagination: { previous: "Baak", next: "Neks" },
  AboutPage: { title: "Bout dis projek" },
  AlliesPage: { title: "Paadna dem" },
  ContactPage: { title: "Kantak" },
  CreditsPage: { title: "Kredit" },
  MemoriesPage: { title: "Memori dem" },
  Months: ["Janyuwari", "Febyuwari", "Maach", "Eipril", "Mie", "Juun", "Julai", "Aagas", "Septemba", "Oktouba", "Novemba", "Disemba"],
  formatDate: ({ day, month, year }) => `${day} ${month} ${year}`,
};

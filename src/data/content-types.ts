export type MediaType = "documento" | "audio" | "video" | "imagen" | "multiformato";

// `key` maps to Messages.ContentTypes in src/lib/i18n/es.ts (same value as mediaType).
export type ContentType = {
  key: MediaType;
  mediaType: MediaType;
};

export const contentTypes: ContentType[] = [
  { key: "documento", mediaType: "documento" },
  { key: "audio", mediaType: "audio" },
  { key: "video", mediaType: "video" },
  { key: "imagen", mediaType: "imagen" },
  { key: "multiformato", mediaType: "multiformato" },
];

export const contentTypeKeys = contentTypes.map((type) => type.key);

export const authors = ["Juana Catalina Gonzales Rodriguez", "Sebastian Rodrigo Gonzales Gutierrez"];

export const dateRanges = ["2020 - 2022", "2023 - 2024", "2025 - 2026"];

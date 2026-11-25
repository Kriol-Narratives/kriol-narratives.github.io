export type MediaType = "documento" | "audio" | "video" | "imagen" | "multiformato";

export type ContentType = {
  label: string;
  mediaType: MediaType;
};

export const contentTypes: ContentType[] = [
  { label: "Documento", mediaType: "documento" },
  { label: "Entrevista en audio", mediaType: "audio" },
  { label: "Entrevista en video", mediaType: "video" },
  { label: "Galería de imágenes", mediaType: "imagen" },
  { label: "Multiformato", mediaType: "multiformato" },
];

export const contentTypeLabels = contentTypes.map((type) => type.label);

export const authors = ["Juana Catalina Gonzales Rodriguez", "Sebastian Rodrigo Gonzales Gutierrez"];

export const dateRanges = ["2020 - 2022", "2023 - 2024", "2025 - 2026"];

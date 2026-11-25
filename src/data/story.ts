import { categories } from "./categories";
import { contentTypes, type MediaType } from "./content-types";

export type { MediaType };

export type Story = {
  categorySlug: string;
  categoryTitle: string;
  title: string;
  author: string;
  date: string;
  mediaType: MediaType;
  description: string;
  license: string[];
  place: string;
  keywords: string;
  createdAt: string;
  repositoryLink: string;
  citation: string;
  images: string[];
};

const dummyDescription =
  "Xander Dena Bent es líder joven raizal, estudiante de Derecho de la Universidad Nacional de Colombia y miembro fundador de One Raizal Corporation, su trabajo se ha centrado en la defensa de los derechos culturales y proyectos educativos dirigidos al pueblo raizal. Dena afirma que hablar del conflicto armado en el contexto de San Andrés, Providencia y Santa Catalina cuenta con sus propias particularidades: por su ubicación geográfica y los elementos a los que se ata la raizalidad, el conflicto tomó allí formas específicas. Entenderse como un corredor hacia Centroamérica y como territorio en gran medida marítimo (o maritorio) le dan un rol al archipiélago en el fenómeno del narcotráfico.";

const galleryImages = categories.map((category) => category.image);

export function getStory(categorySlug: string, itemId: string): Story | null {
  const category = categories.find((item) => item.slug === categorySlug);
  if (!category) return null;

  const index = Number(itemId);
  const contentType = contentTypes[(Number.isFinite(index) ? index : 0) % contentTypes.length];

  return {
    categorySlug: category.slug,
    categoryTitle: category.title,
    title: "Historia 1 Lorem ipsum dolor sit amet, consectetur",
    author: "Juana Catalina Gonzales Rodriguez",
    date: "1997",
    mediaType: contentType.mediaType,
    description: dummyDescription,
    license: ["CC", "BY", "SA"],
    place: "San Andrés, Colombia",
    keywords: "Identidad cultural, sociolingüística, educación",
    createdAt: "Marzo 2023",
    repositoryLink: "https://commons.wikimedia.org/wiki/File:Le_yacht_Creole.jpg",
    citation:
      "Láscar, J. (2023, 15 de marzo). Panoramic view of Bogotá from Monserrate [Video]. Wikimedia Commons.",
    images: galleryImages,
  };
}

export type RelatedItem = {
  type: string;
  title: string;
  author: string;
  image: string;
};

export function getRelatedItems(): RelatedItem[] {
  return contentTypes.map(({ label }, index) => ({
    type: label,
    title: "Lorem ipsum dolor sit amet, consectetur",
    author: "Juana Catalina Gonzales Rodriguez",
    image: categories[index % categories.length].image,
  }));
}

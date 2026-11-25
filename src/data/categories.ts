export type Category = {
  slug: string;
  title: string;
  image: string;
  description: string;
};

const dummyDescription =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec eros est, egestas pretium dignissim.";

export const categories: Category[] = [
  {
    slug: "conflicto-armado",
    title: "Conflicto armado",
    image: "/images/categories/conflicto-armado.png",
    description: dummyDescription,
  },
  {
    slug: "maritorio",
    title: "Maritorio",
    image: "/images/categories/maritorio.png",
    description: dummyDescription,
  },
  {
    slug: "liderazgo-femenino-invisibilizado",
    title: "Liderazgo femenino invisibilizado",
    image: "/images/categories/liderazgo-femenino-invisibilizado.png",
    description: dummyDescription,
  },
  {
    slug: "otras-espiritualidades-y-genero",
    title: "Otras espiritualidades y género",
    image: "/images/categories/otras-espiritualidades-y-genero.png",
    description: dummyDescription,
  },
  {
    slug: "liderazgo-juvenil",
    title: "Liderazgo juvenil",
    image: "/images/categories/liderazgo-juvenil.png",
    description: dummyDescription,
  },
  {
    slug: "despojo",
    title: "Despojo",
    image: "/images/categories/despojo.png",
    description: dummyDescription,
  },
  {
    slug: "artes-ritmos-y-nuevas-sonoridades",
    title: "Artes, ritmos y nuevas sonoridades",
    image: "/images/categories/artes-ritmos-y-nuevas-sonoridades.png",
    description: dummyDescription,
  },
  {
    slug: "identidad",
    title: "Identidad",
    image: "/images/categories/identidad.png",
    description: dummyDescription,
  },
  {
    slug: "memorias-de-talleres",
    title: "Memorias de talleres",
    image: "/images/categories/memorias-de-talleres.png",
    description: dummyDescription,
  },
];

// Menú de respaldo (solo español) para cuando la hoja `menu` falla o está vacía. Los textos reales,
// en cada idioma, salen de la hoja `menu`.
export const menuLinks = [
  { id: "about", label: "Acerca de este proyecto", href: "/acerca-de" },
  { id: "memories", label: "Memorias", href: "/memorias" },
  { id: "allies", label: "Aliados", href: "/aliados" },
  { id: "contact", label: "Contacto", href: "/contacto" },
  { id: "credits", label: "Créditos", href: "/creditos" },
];

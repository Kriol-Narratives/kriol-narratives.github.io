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

export const menuLinks = [
  { label: "Acerca de este proyecto", href: "/acerca-de" },
  { label: "Memorias", href: "/memorias" },
  { label: "Aliados", href: "/aliados" },
  { label: "Contacto", href: "/contacto" },
  { label: "Repositorio", href: "#" },
  { label: "Créditos", href: "/creditos" },
];

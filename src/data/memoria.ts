import { categories } from "./categories";

export type Memoria = {
  title: string;
  intro: string;
  heroImage: string;
  heroCaption: string;
  author: string;
  date: string;
  bodyParagraphs: string[];
  quote: string;
  secondImage: string;
  secondImageCaption: string;
};

export function getMemoria(itemId: string): Memoria {
  const index = Number(itemId);
  const seed = Number.isFinite(index) ? index : 0;

  return {
    title: "Título Memoria",
    intro:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam ac finibus ligula, quis rhoncus metus. Quisque vestibulum leo in nulla fringilla dignissim. Donec venenatis interdum.",
    heroImage: categories[seed % categories.length].image,
    heroCaption: "Lorem ipsum dolor sit amet,",
    author: "Juana Catalina Gonzales Rodriguez",
    date: "Noviembre 2026",
    bodyParagraphs: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis tellus. Nullam quis imperdiet augue. Vestibulum auctor ornare leo, non suscipit magna interdum eu. Curabitur pellentesque nibh nibh, at maximus ante fermentum sit amet. Pellentesque commodo lacus at sodales sodales.",
      "Quisque sagittis orci ut diam condimentum, vel euismod erat placerat. In iaculis arcu eros, eget tempus orci facilisis id. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris.",
      "Pellentesque commodo lacus at sodales sodales. Quisque sagittis orci ut diam condimentum, vel euismod erat placerat. In iaculis arcu eros, eget tempus orci facilisis id.",
    ],
    quote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris.",
    secondImage: categories[(seed + 1) % categories.length].image,
    secondImageCaption: "Lorem ipsum dolor sit amet.",
  };
}

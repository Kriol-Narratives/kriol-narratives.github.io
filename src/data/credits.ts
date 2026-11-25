export type Credit = {
  name: string;
  description: string;
};

const makeColumn = (): Credit[] =>
  Array.from({ length: 6 }, () => ({
    name: "Lorem ipsum dolor sit.",
    description: "Quisque sagittis orci ut diam condimentum, vel euismod erat placerat.",
  }));

export const creditColumns: Credit[][] = [makeColumn(), makeColumn()];

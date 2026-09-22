export type Book = {
  id: string;
  title: string;
  author: string;
  year: string;
  genre: string;
  durationLabel: string;
  previewSeconds: number;
  previewUrl: string;
  sourceUrl: string;
  description: string;
  cover: string;
  coverInk: string;
  mark: string;
  tags: string[];
};

export const books: Book[] = [
  {
    id: "pride-and-prejudice",
    title: "Pride & Prejudice",
    author: "Jane Austen",
    year: "1813",
    genre: "Romance",
    durationLabel: "14h 27m",
    previewSeconds: 593,
    previewUrl: "https://archive.org/download/pride_prejudice_1102_librivox/prideandprejudice_01_austen_64kb.mp3",
    sourceUrl: "https://librivox.org/969",
    description: "Wit, first impressions and the slow surprise of falling in love.",
    cover: "#7a3f35",
    coverInk: "#fff8f2",
    mark: "P",
    tags: ["classic", "love", "society"]
  },
  {
    id: "alice",
    title: "Alice's Adventures in Wonderland",
    author: "Lewis Carroll",
    year: "1865",
    genre: "Fantasy",
    durationLabel: "2h 47m",
    previewSeconds: 729,
    previewUrl: "https://archive.org/download/alicesadventuresinwonderland_1902_librivox/alicesadventuresinwonderland_01_carroll_64kb.mp3",
    sourceUrl: "https://librivox.org/13477",
    description: "A curious girl falls down a rabbit hole into a world where logic bends.",
    cover: "#2f6870",
    coverInk: "#f7f3e8",
    mark: "A",
    tags: ["wonder", "children", "fantasy"]
  },
  {
    id: "sherlock",
    title: "The Adventures of Sherlock Holmes",
    author: "Arthur Conan Doyle",
    year: "1892",
    genre: "Mystery",
    durationLabel: "10h 18m",
    previewSeconds: 3906,
    previewUrl: "https://archive.org/download/adventures_holmes/adventureholmes_01_doyle_64kb.mp3",
    sourceUrl: "https://librivox.org/the-adventures-of-sherlock-holmes/",
    description: "Twelve classic cases for the world's most famous consulting detective.",
    cover: "#252521",
    coverInk: "#efe7da",
    mark: "SH",
    tags: ["detective", "mystery", "crime"]
  },
  {
    id: "frankenstein",
    title: "Frankenstein",
    author: "Mary Shelley",
    year: "1818",
    genre: "Gothic",
    durationLabel: "9h 12m",
    previewSeconds: 964,
    previewUrl: "https://archive.org/download/frankensteinver5_2607_librivox/frankenstein_01_shelley_64kb.mp3",
    sourceUrl: "https://librivox.org/frankenstein-or-the-modern-prometheus-version-5-by-mary-wollstonecraft-shelley/",
    description: "Ambition, creation and the terrible cost of abandoning responsibility.",
    cover: "#27444a",
    coverInk: "#f3f1e9",
    mark: "F",
    tags: ["gothic", "horror", "science"]
  },
  {
    id: "dracula",
    title: "Dracula",
    author: "Bram Stoker",
    year: "1897",
    genre: "Gothic",
    durationLabel: "16h 31m",
    previewSeconds: 2218,
    previewUrl: "https://archive.org/download/dracula_librivox/dracula_01_stoker_64kb.mp3",
    sourceUrl: "https://librivox.org/dracula-by-bram-stoker",
    description: "Diaries, letters and newspaper clippings build a chilling mystery.",
    cover: "#5a1e2b",
    coverInk: "#fff1ea",
    mark: "D",
    tags: ["gothic", "horror", "vampire"]
  },
  {
    id: "jane-eyre",
    title: "Jane Eyre",
    author: "Charlotte Brontë",
    year: "1847",
    genre: "Romance",
    durationLabel: "20h 37m",
    previewSeconds: 357,
    previewUrl: "https://archive.org/download/jane_eyre_librivox/jane_eyre_00_bronte_64kb.mp3",
    sourceUrl: "https://librivox.org/jane-eyre-by-charlotte-bront/",
    description: "A fiercely independent heroine searches for love without losing herself.",
    cover: "#6f543c",
    coverInk: "#fbf2e6",
    mark: "J",
    tags: ["romance", "classic", "women"]
  },
  {
    id: "little-women",
    title: "Little Women",
    author: "Louisa May Alcott",
    year: "1868",
    genre: "Fiction",
    durationLabel: "19h 00m",
    previewSeconds: 1225,
    previewUrl: "https://archive.org/download/little_women_0711_librivox/littlewomen_01_alcott_64kb.mp3",
    sourceUrl: "https://librivox.org/little-women-by-louisa-may-alcott/",
    description: "Four sisters grow up, change, argue and love through a difficult war.",
    cover: "#8b674a",
    coverInk: "#fff6ec",
    mark: "LW",
    tags: ["family", "women", "children"]
  },
  {
    id: "great-gatsby",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    year: "1925",
    genre: "Fiction",
    durationLabel: "5h 38m",
    previewSeconds: 2583,
    previewUrl: "https://archive.org/download/greatgatsby_2101_librivox/greatgatsby_01_fitzgerald_64kb.mp3",
    sourceUrl: "https://librivox.org/the-great-gatsby-by-f-scott-fitzgerald/",
    description: "Ambition, parties and the fragile dream of getting the past back.",
    cover: "#244c58",
    coverInk: "#edf6f1",
    mark: "GG",
    tags: ["jazz age", "love", "ambition"]
  },
  {
    id: "secret-garden",
    title: "The Secret Garden",
    author: "Frances Hodgson Burnett",
    year: "1911",
    genre: "Adventure",
    durationLabel: "9h 08m",
    previewSeconds: 808,
    previewUrl: "https://archive.org/download/secret_garden_librivox/secretgarden_01_burnett_64kb.mp3",
    sourceUrl: "https://librivox.org/the-secret-garden-by-frances-hodgson-burnett/",
    description: "A hidden garden changes the lives of three lonely children.",
    cover: "#4f6c49",
    coverInk: "#f4f3e7",
    mark: "SG",
    tags: ["children", "nature", "family"]
  },
  {
    id: "moby-dick",
    title: "Moby-Dick",
    author: "Herman Melville",
    year: "1851",
    genre: "Adventure",
    durationLabel: "24h 38m",
    previewSeconds: 1753,
    previewUrl: "https://archive.org/download/moby_dick_librivox/mobydick_000_melville_64kb.mp3",
    sourceUrl: "https://librivox.org/moby-dick-by-herman-melville/",
    description: "One captain, one white whale, and an obsession that swallows everything.",
    cover: "#244f66",
    coverInk: "#eef5f5",
    mark: "M",
    tags: ["sea", "adventure", "classic"]
  }
];

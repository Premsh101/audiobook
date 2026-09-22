import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const books = [
  ["pride-and-prejudice","Pride & Prejudice","Jane Austen","1813","Romance","14h 27m","Wit, first impressions and the slow surprise of falling in love.","P","#7a3f35","#fff8f2","https://archive.org/download/pride_prejudice_1102_librivox/prideandprejudice_01_austen_64kb.mp3","https://librivox.org/969",["classic","love","society"]],
  ["alice","Alice's Adventures in Wonderland","Lewis Carroll","1865","Fantasy","2h 47m","A curious girl falls down a rabbit hole into a world where logic bends.","A","#2f6870","#f7f3e8","https://archive.org/download/alicesadventuresinwonderland_1902_librivox/alicesadventuresinwonderland_01_carroll_64kb.mp3","https://librivox.org/13477",["wonder","children","fantasy"]],
  ["sherlock","The Adventures of Sherlock Holmes","Arthur Conan Doyle","1892","Mystery","10h 18m","Twelve classic cases for the world's most famous consulting detective.","SH","#252521","#efe7da","https://archive.org/download/adventures_holmes/adventureholmes_01_doyle_64kb.mp3","https://librivox.org/the-adventures-of-sherlock-holmes/",["detective","mystery","crime"]],
  ["frankenstein","Frankenstein","Mary Shelley","1818","Gothic","9h 12m","Ambition, creation and the terrible cost of abandoning responsibility.","F","#27444a","#f3f1e9","https://archive.org/download/frankensteinver5_2607_librivox/frankenstein_01_shelley_64kb.mp3","https://librivox.org/frankenstein-or-the-modern-prometheus-version-5-by-mary-wollstonecraft-shelley/",["gothic","horror","science"]],
  ["dracula","Dracula","Bram Stoker","1897","Gothic","16h 31m","Diaries, letters and newspaper clippings build a chilling mystery.","D","#5a1e2b","#fff1ea","https://archive.org/download/dracula_librivox/dracula_01_stoker_64kb.mp3","https://librivox.org/dracula-by-bram-stoker",["gothic","horror","vampire"]],
  ["jane-eyre","Jane Eyre","Charlotte Brontë","1847","Romance","20h 37m","A fiercely independent heroine searches for love without losing herself.","J","#6f543c","#fbf2e6","https://archive.org/download/jane_eyre_librivox/jane_eyre_00_bronte_64kb.mp3","https://librivox.org/jane-eyre-by-charlotte-bront/",["romance","classic","women"]],
  ["little-women","Little Women","Louisa May Alcott","1868","Fiction","19h 00m","Four sisters grow up, change, argue and love through a difficult war.","LW","#8b674a","#fff6ec","https://archive.org/download/little_women_0711_librivox/littlewomen_01_alcott_64kb.mp3","https://librivox.org/little-women-by-louisa-may-alcott/",["family","women","children"]],
  ["great-gatsby","The Great Gatsby","F. Scott Fitzgerald","1925","Fiction","5h 38m","Ambition, parties and the fragile dream of getting the past back.","GG","#244c58","#edf6f1","https://archive.org/download/greatgatsby_2101_librivox/greatgatsby_01_fitzgerald_64kb.mp3","https://librivox.org/the-great-gatsby-by-f-scott-fitzgerald/",["jazz age","love","ambition"]],
  ["secret-garden","The Secret Garden","Frances Hodgson Burnett","1911","Adventure","9h 08m","A hidden garden changes the lives of three lonely children.","SG","#4f6c49","#f4f3e7","https://archive.org/download/secret_garden_librivox/secretgarden_01_burnett_64kb.mp3","https://librivox.org/the-secret-garden-by-frances-hodgson-burnett/",["children","nature","family"]],
  ["moby-dick","Moby-Dick","Herman Melville","1851","Adventure","24h 38m","One captain, one white whale, and an obsession that swallows everything.","M","#244f66","#eef5f5","https://archive.org/download/moby_dick_librivox/mobydick_000_melville_64kb.mp3","https://librivox.org/moby-dick-by-herman-melville/",["sea","adventure","classic"]]
];

async function main() {
  for (const [slug,title,author,year,genre,durationLabel,description,mark,cover,coverInk,previewUrl,sourceUrl,tags] of books) {
    await prisma.book.upsert({
      where: { slug },
      update: { title, author, year, genre, durationLabel, previewSeconds: 300, description, mark, cover, coverInk, previewUrl, sourceUrl, tags, status: "PUBLISHED", access: "FREE", rightsType: "PUBLIC_DOMAIN", featured: slug === "pride-and-prejudice" || slug === "alice" },
      create: { slug, title, author, year, genre, durationLabel, previewSeconds: 300, description, mark, cover, coverInk, previewUrl, sourceUrl, tags, status: "PUBLISHED", access: "FREE", rightsType: "PUBLIC_DOMAIN", featured: slug === "pride-and-prejudice" || slug === "alice" }
    });
  }

  const products = [
    ["library-us-299","LIBRARY_SUBSCRIPTION","US","USD",2.99,null],
    ["library-gb-299","LIBRARY_SUBSCRIPTION","GB","GBP",2.99,null],
    ["library-in-19","LIBRARY_SUBSCRIPTION","IN","INR",19,null],
    ["voice-us-299","VOICE_CREDITS","US","USD",2.99,1800],
    ["voice-us-999","VOICE_CREDITS","US","USD",9.99,10000],
    ["voice-in-99","VOICE_CREDITS","IN","INR",99,3600]
  ] as const;

  for (const [externalProductId, productType, country, currency, amount, durationSeconds] of products) {
    await prisma.productPrice.upsert({
      where: { externalProductId },
      update: { productType, country, currency, amount, durationSeconds, active: true },
      create: { externalProductId, productType, country, currency, amount, durationSeconds, active: true }
    });
  }t "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const books = [
  ["pride-and-prejudice","Pride & Prejudice","Jane Austen","1813","Romance","14h 27m","Wit, first impressions and the slow surprise of falling in love.","P","#7a3f35","#fff8f2","https://archive.org/download/pride_prejudice_1102_librivox/prideandprejudice_01_austen_64kb.mp3","https://librivox.org/969",["classic","love","society"]],
  ["alice","Alice's Adventures in Wonderland","Lewis Carroll","1865","Fantasy","2h 47m","A curious girl falls down a rabbit hole into a world where logic bends.","A","#2f6870","#f7f3e8","https://archive.org/download/alicesadventuresinwonderland_1902_librivox/alicesadventuresinwonderland_01_carroll_64kb.mp3","https://librivox.org/13477",["wonder","children","fantasy"]],
  ["sherlock","The Adventures of Sherlock Holmes","Arthur Conan Doyle","1892","Mystery","10h 18m","Twelve classic cases for the world's most famous consulting detective.","SH","#252521","#efe7da","https://archive.org/download/adventures_holmes/adventureholmes_01_doyle_64kb.mp3","https://librivox.org/the-adventures-of-sherlock-holmes/",["detective","mystery","crime"]],
  ["frankenstein","Frankenstein","Mary Shelley","1818","Gothic","9h 12m","Ambition, creation and the terrible cost of abandoning responsibility.","F","#27444a","#f3f1e9","https://archive.org/download/frankensteinver5_2607_librivox/frankenstein_01_shelley_64kb.mp3","https://librivox.org/frankenstein-or-the-modern-prometheus-version-5-by-mary-wollstonecraft-shelley/",["gothic","horror","science"]],
  ["dracula","Dracula","Bram Stoker","1897","Gothic","16h 31m","Diaries, letters and newspaper clippings build a chilling mystery.","D","#5a1e2b","#fff1ea","https://archive.org/download/dracula_librivox/dracula_01_stoker_64kb.mp3","https://librivox.org/dracula-by-bram-stoker",["gothic","horror","vampire"]],
  ["jane-eyre","Jane Eyre","Charlotte Brontë","1847","Romance","20h 37m","A fiercely independent heroine searches for love without losing herself.","J","#6f543c","#fbf2e6","https://archive.org/download/jane_eyre_librivox/jane_eyre_00_bronte_64kb.mp3","https://librivox.org/jane-eyre-by-charlotte-bront/",["romance","classic","women"]],
  ["little-women","Little Women","Louisa May Alcott","1868","Fiction","19h 00m","Four sisters grow up, change, argue and love through a difficult war.","LW","#8b674a","#fff6ec","https://archive.org/download/little_women_0711_librivox/littlewomen_01_alcott_64kb.mp3","https://librivox.org/little-women-by-louisa-may-alcott/",["family","women","children"]],
  ["great-gatsby","The Great Gatsby","F. Scott Fitzgerald","1925","Fiction","5h 38m","Ambition, parties and the fragile dream of getting the past back.","GG","#244c58","#edf6f1","https://archive.org/download/greatgatsby_2101_librivox/greatgatsby_01_fitzgerald_64kb.mp3","https://librivox.org/the-great-gatsby-by-f-scott-fitzgerald/",["jazz age","love","ambition"]],
  ["secret-garden","The Secret Garden","Frances Hodgson Burnett","1911","Adventure","9h 08m","A hidden garden changes the lives of three lonely children.","SG","#4f6c49","#f4f3e7","https://archive.org/download/secret_garden_librivox/secretgarden_01_burnett_64kb.mp3","https://librivox.org/the-secret-garden-by-frances-hodgson-burnett/",["children","nature","family"]],
  ["moby-dick","Moby-Dick","Herman Melville","1851","Adventure","24h 38m","One captain, one white whale, and an obsession that swallows everything.","M","#244f66","#eef5f5","https://archive.org/download/moby_dick_librivox/mobydick_000_melville_64kb.mp3","https://librivox.org/moby-dick-by-herman-melville/",["sea","adventure","classic"]]
];

async function main() {
  for (const [slug,title,author,year,genre,durationLabel,description,mark,cover,coverInk,previewUrl,sourceUrl,tags] of books) {
    await prisma.book.upsert({
      where: { slug },
      update: { title, author, year, genre, durationLabel, previewSeconds: 300, description, mark, cover, coverInk, previewUrl, sourceUrl, tags, status: "PUBLISHED", access: "FREE", rightsType: "PUBLIC_DOMAIN", featured: slug === "pride-and-prejudice" || slug === "alice" },
      create: { slug, title, author, year, genre, durationLabel, description, mark, cover, coverInk, previewUrl, sourceUrl, tags, status: "PUBLISHED", access: "FREE", rightsType: "PUBLIC_DOMAIN", featured: slug === "pride-and-prejudice" || slug === "alice" }
    });
  }

  const products = [
    ["library-us-299","LIBRARY_SUBSCRIPTION","US","USD",2.99,null],
    ["library-gb-299","LIBRARY_SUBSCRIPTION","GB","GBP",2.99,null],
    ["library-in-19","LIBRARY_SUBSCRIPTION","IN","INR",19,null],
    ["voice-us-299","VOICE_CREDITS","US","USD",2.99,1800],
    ["voice-us-999","VOICE_CREDITS","US","USD",9.99,10000],
    ["voice-in-99","VOICE_CREDITS","IN","INR",99,3600]
  ] as const;

  for (const [externalProductId, productType, country, currency, amount, durationSeconds] of products) {
    await prisma.productPrice.upsert({
      where: { externalProductId },
      update: { productType, country, currency, amount, durationSeconds, active: true },
      create: { externalProductId, productType, country, currency, amount, durationSeconds, active: true }
    });
  }
}

main().finally(async () => {
  await prisma.$disconnect();
});

import * as fs from "fs/promises";
import * as path from "path";
import database from "../database";

interface ParsedArticle {
  articleNumber: number;
  title: string;
  content: string;
}

interface ParsedLaw {
  title: string;
  category: string;
  sourceUrl: string;
  articles: ParsedArticle[];
}

function parseContractLaw(text: string): ParsedLaw {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const articles: ParsedArticle[] = [];
  let currentArticle: ParsedArticle | null = null;
  let currentContent: string[] = [];

  const articleRegex = /^(\d+)\s*(?:дүгээр|дугаар)?\s*зүйл\.?\s*(.*)/i;

  for (const line of lines) {
    const match = line.match(articleRegex);
    if (match) {
      if (currentArticle) {
        currentArticle.content = currentContent.join("\n").trim();
        articles.push(currentArticle);
      }
      const articleNum = parseInt(match[1], 10);
      const title = match[2]?.trim() || "";
      currentArticle = { articleNumber: articleNum, title, content: "" };
      currentContent = [];
    } else if (currentArticle) {
      const cleaned = line.replace(/^\d+\.\d+(\.\d+)?\./, "").trim();
      if (cleaned) currentContent.push(cleaned);
    }
  }

  if (currentArticle) {
    currentArticle.content = currentContent.join("\n").trim();
    articles.push(currentArticle);
  }

  return {
    title: "Монгол Улсын Иргэний Хууль - Гэрээний эрх зүй",
    category: "contract",
    sourceUrl: "https://legalinfo.mn",
    articles,
  };
}

async function importLaw(law: ParsedLaw) {
  const existing = await database.law.findFirst({
    where: { title: law.title },
  });

  if (existing) {
    console.log(`Law "${law.title}" already exists, skipping.`);
    return;
  }

  await database.law.create({
    data: {
      title: law.title,
      category: law.category,
      sourceUrl: law.sourceUrl,
      articles: {
        create: law.articles.map(a => ({
          articleNumber: a.articleNumber,
          title: a.title,
          content: a.content,
        })),
      },
    },
  });

  console.log(`Imported "${law.title}" with ${law.articles.length} articles.`);
}

async function main() {
  const filePath = path.resolve("app/src/data/civil-law-contract.txt");
  const text = await fs.readFile(filePath, "utf-8");
  const law = parseContractLaw(text);
  await importLaw(law);
  console.log("Legal knowledge import complete.");
  await database.$disconnect();
}

main().catch(err => {
  console.error("Import failed:", err);
  database.$disconnect().catch(() => {});
  process.exit(1);
});

import database from "../database";

export interface LegalContext {
  relevantLaws: {
    id: string;
    title: string;
    category: string | null;
    sourceUrl: string | null;
  }[];
  relevantArticles: {
    id: string;
    lawTitle: string;
    articleNumber: string | null;
    title: string | null;
    content: string;
  }[];
  relevantTemplates: {
    id: string;
    title: string;
    contractType: string | null;
    content: string;
    riskLevel: string | null;
  }[];
}

function extractKeywords(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-zа-яөүңёə\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3);
  return [...new Set(words)].slice(0, 100);
}

export async function getLegalContext(text: string): Promise<LegalContext> {
  const keywords = extractKeywords(text);

  if (keywords.length === 0) {
    return { relevantLaws: [], relevantArticles: [], relevantTemplates: [] };
  }

  const [laws, articles, templates] = await Promise.all([
    database.law.findMany({
      where: {
        OR: [
          { title: { in: keywords, mode: "insensitive" } },
          { category: { in: keywords, mode: "insensitive" } },
          {
            OR: keywords.map((kw) => ({
              fullText: { contains: kw, mode: "insensitive" },
            })),
          },
        ],
      },
      take: 5,
    }),
    database.lawArticle.findMany({
      where: {
        OR: keywords.map((kw) => ({
          content: { contains: kw, mode: "insensitive" },
        })),
      },
      include: { law: { select: { title: true } } },
      take: 10,
    }),
    database.clauseTemplate.findMany({
      where: {
        OR: [
          { title: { in: keywords, mode: "insensitive" } },
          { contractType: { in: keywords, mode: "insensitive" } },
        ],
      },
      take: 5,
    }),
  ]);

  return {
    relevantLaws: laws.map((l) => ({
      id: l.id,
      title: l.title,
      category: l.category,
      sourceUrl: l.sourceUrl,
    })),
    relevantArticles: articles.map((a) => ({
      id: a.id,
      lawTitle: a.law.title,
      articleNumber: a.articleNumber,
      title: a.title,
      content: a.content,
    })),
    relevantTemplates: templates.map((t) => ({
      id: t.id,
      title: t.title,
      contractType: t.contractType,
      content: t.content,
      riskLevel: t.riskLevel,
    })),
  };
}

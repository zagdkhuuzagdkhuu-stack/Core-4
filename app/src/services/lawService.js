import database from "../database";
function extractKeywords(text) {
    const words = text
        .toLowerCase()
        .replace(/[^a-zа-яөүңёə\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 3);
    return [...new Set(words)].slice(0, 100);
}
export async function getLegalContext(text) {
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
            articleNumber: String(a.articleNumber),
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

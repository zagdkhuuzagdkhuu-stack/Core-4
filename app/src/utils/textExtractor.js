import fs from "fs/promises";
import path from "path";
export async function extractText(filePath, mimeType) {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === ".pdf") {
        return extractFromPdf(filePath);
    }
    if (ext === ".docx" || ext === ".doc") {
        return extractFromDocx(filePath);
    }
    if (ext === ".txt") {
        return fs.readFile(filePath, "utf8");
    }
    throw new Error(`Unsupported file type: ${ext}`);
}
async function extractFromPdf(filePath) {
    const { PDFParse } = await import("pdf-parse");
    const buffer = await fs.readFile(filePath);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text;
}
async function extractFromDocx(filePath) {
    const mammoth = await import("mammoth");
    const buffer = await fs.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
}

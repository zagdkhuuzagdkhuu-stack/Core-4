import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        const uploadDir = path.resolve("app/uploads");
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${crypto.randomUUID()}${ext}`);
    },
});
const fileFilter = (_req, file, cb) => {
    const allowed = [".pdf", ".docx", ".txt"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
        cb(null, true);
    }
    else {
        cb(new Error("Only PDF and DOCX files are allowed."));
    }
};
export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 },
});

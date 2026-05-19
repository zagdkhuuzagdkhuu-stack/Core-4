import multer from "multer";
import path from "path";
import crypto from "crypto";
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, path.resolve("app/uploads"));
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${crypto.randomUUID()}${ext}`);
    },
});
const fileFilter = (_req, file, cb) => {
    const allowed = [".pdf", ".docx"];
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
    limits: { fileSize: 15 * 1024 * 1024 },
});

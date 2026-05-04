import crypto from "crypto";
const ITERATIONS = 120000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";
export function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");
    return `${ITERATIONS}:${salt}:${hash}`;
}
export function verifyPassword(password, storedHash) {
    if (!storedHash)
        return false;
    const [iterationsValue, salt, originalHash] = storedHash.split(":");
    const iterations = Number(iterationsValue);
    if (!iterations || !salt || !originalHash)
        return false;
    const hash = crypto.pbkdf2Sync(password, salt, iterations, KEY_LENGTH, DIGEST).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(originalHash, "hex"));
}

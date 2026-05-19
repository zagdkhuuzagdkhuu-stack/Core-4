import { verifyToken } from "../utils/jwt";
export function requireAuth(req, res, next) {
    try {
        const header = req.headers.authorization || "";
        const [scheme, token] = header.split(" ");
        if (scheme !== "Bearer" || !token) {
            return res.status(401).json({ message: "Authentication token is required." });
        }
        const payload = verifyToken(token);
        req.userId = payload.userId;
        return next();
    }
    catch (error) {
        return res.status(401).json({ message: "Invalid or expired authentication token." });
    }
}

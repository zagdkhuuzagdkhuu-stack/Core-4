// src/routes/auth.ts
import { Router } from "express";
import database from "../database.js";
import { verifyGoogleToken } from "../utils/google";
import { signToken } from "../utils/jwt";
import { hashPassword, verifyPassword } from "../utils/password.js";
const router = Router();
function toSafeUser(user) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
}
router.post("/register", async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        const normalizedEmail = String(email || "").toLowerCase().trim();
        const normalizedName = String(fullName || "").trim();
        if (!normalizedName || !normalizedEmail || !password) {
            return res.status(400).json({ message: "Name, Gmail, and password are required" });
        }
        if (!normalizedEmail.endsWith("@gmail.com")) {
            return res.status(400).json({ message: "Please sign up with a Gmail address" });
        }
        if (String(password).length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters" });
        }
        const existingUser = await database.user.findUnique({
            where: { email: normalizedEmail },
        });
        if (existingUser) {
            return res.status(409).json({ message: "An account with this Gmail already exists" });
        }
        const [firstName, ...lastNameParts] = normalizedName.split(/\s+/);
        const user = await database.user.create({
            data: {
                email: normalizedEmail,
                firstName,
                lastName: lastNameParts.join(" ") || null,
                passwordHash: hashPassword(String(password)),
            },
        });
        const token = signToken(user.id);
        res.status(201).json({ token, user: toSafeUser(user) });
    }
    catch (err) {
        res.status(500).json({ message: "Registration failed" });
    }
});
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const user = await database.user.findUnique({
            where: { email: String(email).toLowerCase().trim() },
        });
        if (!user || !verifyPassword(password, user.passwordHash)) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const token = signToken(user.id);
        res.json({ token, user: toSafeUser(user) });
    }
    catch (err) {
        res.status(500).json({ message: "Login failed" });
    }
});
router.post("/google", async (req, res) => {
    try {
        const { idToken } = req.body;
        const payload = await verifyGoogleToken(idToken);
        const email = payload.email;
        const name = payload.name;
        const picture = payload.picture;
        const googleId = payload.sub;
        let user = await database.user.findUnique({
            where: { email },
        });
        if (!user) {
            user = await database.user.create({
                data: {
                    email,
                    firstName: name,
                    avatarUrl: picture,
                    googleId,
                },
            });
        }
        const token = signToken(user.id);
        res.json({ token, user });
    }
    catch (err) {
        res.status(401).json({ message: "Google auth failed" });
    }
});
export default router;

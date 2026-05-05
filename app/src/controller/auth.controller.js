import database from "../database";
import { verifyGoogleToken } from "../utils/google";
import { signToken } from "../utils/jwt";
import { hashPassword, verifyPassword } from "../utils/password";
function toSafeUser(user) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
}
export async function register(req, res) {
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
        return res.status(201).json({ token, user: toSafeUser(user) });
    }
    catch (err) {
        return res.status(500).json({ message: "Registration failed" });
    }
}
export async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const user = await database.user.findUnique({
            where: { email: String(email).toLowerCase().trim() },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                passwordHash: true,
            },
        });
        if (!user || !verifyPassword(String(password), user.passwordHash)) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const token = signToken(user.id);
        return res.json({ token, user: toSafeUser(user) });
    }
    catch (err) {
        return res.status(500).json({ message: "Login failed" });
    }
}
export async function googleLogin(req, res) {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            return res.status(400).json({ message: "Google token is required" });
        }
        const payload = await verifyGoogleToken(idToken);
        const email = payload.email?.toLowerCase().trim();
        const name = payload.name || "";
        const picture = payload.picture;
        const googleId = payload.sub;
        if (!email || !googleId) {
            return res.status(401).json({ message: "Google account info not found" });
        }
        let user = await database.user.findUnique({
            where: { email },
        });
        if (!user) {
            const [firstName, ...lastNameParts] = name.split(/\s+/);
            user = await database.user.create({
                data: {
                    email,
                    firstName: firstName || null,
                    lastName: lastNameParts.join(" ") || null,
                    avatarUrl: picture,
                    googleId,
                },
            });
        }
        else if (!user.googleId) {
            user = await database.user.update({
                where: { id: user.id },
                data: {
                    googleId,
                    avatarUrl: user.avatarUrl || picture,
                },
            });
        }
        const token = signToken(user.id);
        return res.json({ token, user: toSafeUser(user) });
    }
    catch (err) {
        console.error("Google auth error:", err);
        return res.status(401).json({
            message: "Google auth failed",
            error: err instanceof Error ? err.message : String(err),
        });
    }
}

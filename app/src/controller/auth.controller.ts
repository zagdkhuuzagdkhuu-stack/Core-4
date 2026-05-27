import { Request, Response } from "express";
import database from "../database";
import { verifyGoogleToken } from "../utils/google";
import { signToken } from "../utils/jwt";
import { hashPassword, verifyPassword } from "../utils/password";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

function toSafeUser(user: {
  passwordHash?: string | null;
  [key: string]: unknown;
}) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function isDatabaseConnectionError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("Can't reach database server") ||
    message.includes("ECONNREFUSED") ||
    message.includes("Connection terminated") ||
    message.includes("Timed out fetching a new connection")
  );
}

function handleAuthError(res: Response, fallbackMessage: string, error: unknown) {
  if (isDatabaseConnectionError(error)) {
    return res.status(503).json({
      message: "Database is unavailable. Please check the PostgreSQL connection and try again.",
    });
  }

  return res.status(500).json({ message: fallbackMessage });
}

async function getUserAccessStatus(userId: string) {
  const now = new Date();
  const [activeSubscription, paidPaymentsCount] = await Promise.all([
    database.subscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      },
      orderBy: { createdAt: "desc" },
    }),
    database.payment.count({
      where: {
        userId,
        status: "PAID",
      },
    }),
  ]);

  return {
    isPaid: Boolean(activeSubscription) || paidPaymentsCount > 0,
    activeSubscription,
  };
}

function getProfileCompleteness(user: {
  firstName: string | null;
  lastName: string | null;
  email: string;
}) {
  const missingFields: string[] = [];
  if (!user.firstName?.trim()) missingFields.push("firstName");
  if (!user.lastName?.trim()) missingFields.push("lastName");
  if (!user.email?.trim()) missingFields.push("email");

  return {
    isComplete: missingFields.length === 0,
    missingFields,
  };
}

export async function register(req: Request, res: Response) {
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
  } catch (err) {
    return handleAuthError(res, "Registration failed", err);
  }
}

export async function login(req: Request, res: Response) {
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
  } catch (err) {
    return handleAuthError(res, "Login failed", err);
  }
}

export async function googleLogin(req: Request, res: Response) {
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
    } else if (!user.googleId) {
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
  } catch (err) {
    console.error("Google auth error:", err);
    if (isDatabaseConnectionError(err)) {
      return res.status(503).json({
        message: "Database is unavailable. Please check the PostgreSQL connection and try again.",
      });
    }

    return res.status(401).json({
      message: "Google auth failed",
    });
  }
}

export async function getMe(req: Request, res: Response) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const user = await database.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const profile = getProfileCompleteness(user);
    const access = await getUserAccessStatus(userId);

    return res.json({
      user,
      profile,
      access: {
        isPaid: access.isPaid,
        subscription: access.activeSubscription
          ? {
              id: access.activeSubscription.id,
              plan: access.activeSubscription.plan,
              status: access.activeSubscription.status,
              startDate: access.activeSubscription.startDate,
              endDate: access.activeSubscription.endDate,
            }
          : null,
      },
    });
  } catch (error) {
    return handleAuthError(res, "Failed to load current user.", error);
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const firstName = req.body.firstName !== undefined ? String(req.body.firstName).trim() : undefined;
    const lastName = req.body.lastName !== undefined ? String(req.body.lastName).trim() : undefined;
    const fullName = req.body.fullName !== undefined ? String(req.body.fullName).trim() : undefined;
    const avatarUrl = req.body.avatarUrl !== undefined ? String(req.body.avatarUrl).trim() : undefined;

    const user = await database.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        fullName,
        avatarUrl,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const profile = getProfileCompleteness(user);
    const access = await getUserAccessStatus(userId);

    return res.json({
      user,
      profile,
      access: {
        isPaid: access.isPaid,
      },
    });
  } catch (error) {
    return handleAuthError(res, "Failed to update profile.", error);
  }
}

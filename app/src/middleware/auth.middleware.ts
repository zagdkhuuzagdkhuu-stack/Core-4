import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";

export type AuthenticatedRequest = Request & {
  userId: string;
};

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "Authentication token is required." });
    }

    const payload = verifyToken(token);
    (req as AuthenticatedRequest).userId = payload.userId;

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired authentication token." });
  }
}

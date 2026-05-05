// src/utils/jwt.ts
import jwt from "jsonwebtoken";
// @ts-ignore


export function signToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
}
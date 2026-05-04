// src/routes/auth.ts
import { Router } from "express";
import  database from "../database.js";
import { verifyGoogleToken } from "../utils/google";
import { signToken } from "../utils/jwt";

const router = Router();

router.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body;

    const payload = await verifyGoogleToken(idToken);

    const email = payload.email!;
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
  } catch (err) {
    res.status(401).json({ message: "Google auth failed" });
  }
});

export default router;
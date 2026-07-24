import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ success: false, message: "Authentication token required" });
    return;
  }

  const secret = process.env.JWT_SECRET || "super_secret_echoscan_jwt_key_2026";

  jwt.verify(token, secret, (err: any, user: any) => {
    if (err) {
      res.status(403).json({ success: false, message: "Invalid or expired token" });
      return;
    }
    req.user = user;
    next();
  });
};

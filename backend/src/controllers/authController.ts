import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { memoryStore } from "../models/memoryStore.js";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { logUserToExcel, getUsersCsvFilePath } from "../utils/excelLogger.js";

const generateToken = (userId: string, email: string, name: string): string => {
  const secret = process.env.JWT_SECRET || "super_secret_echoscan_jwt_key_2026";
  const expiresIn: jwt.SignOptions["expiresIn"] = (process.env.JWT_EXPIRES_IN as any) || "7d";
  return jwt.sign({ id: userId, email, name }, secret, { expiresIn });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, mobileNumber } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: "Please provide name, email, and password" });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();

    if (memoryStore.isMongoConnected()) {
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        res.status(400).json({ success: false, message: "Email is already registered" });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await User.create({
        name,
        email: cleanEmail,
        mobileNumber: mobileNumber || "",
        password: hashedPassword,
      });

      // Log user to Excel spreadsheet file
      logUserToExcel({
        name: newUser.name,
        email: newUser.email,
        mobileNumber: newUser.mobileNumber,
        createdAt: newUser.createdAt,
      });

      const token = generateToken(newUser._id.toString(), newUser.email, newUser.name);

      res.status(201).json({
        success: true,
        message: "Registration successful",
        token,
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          mobileNumber: newUser.mobileNumber,
          createdAt: newUser.createdAt,
        },
      });
    } else {
      // Memory Store Fallback
      const existingUser = memoryStore.users.find((u) => u.email === cleanEmail);
      if (existingUser) {
        res.status(400).json({ success: false, message: "Email is already registered" });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = {
        _id: memoryStore.generateId(),
        name,
        email: cleanEmail,
        mobileNumber: mobileNumber || "",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.users.push(newUser);

      // Log user to Excel spreadsheet file
      logUserToExcel({
        name: newUser.name,
        email: newUser.email,
        mobileNumber: newUser.mobileNumber,
        createdAt: newUser.createdAt,
      });

      const token = generateToken(newUser._id, newUser.email, newUser.name);

      res.status(201).json({
        success: true,
        message: "Registration successful",
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          mobileNumber: newUser.mobileNumber,
          createdAt: newUser.createdAt,
        },
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Server error during registration" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: "Please provide email and password" });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();

    if (memoryStore.isMongoConnected()) {
      const user = await User.findOne({ email: cleanEmail }).select("+password");
      if (!user) {
        res.status(401).json({ success: false, message: "Invalid email or password" });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password || "");
      if (!isMatch) {
        res.status(401).json({ success: false, message: "Invalid email or password" });
        return;
      }

      const token = generateToken(user._id.toString(), user.email, user.name);

      res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          mobileNumber: user.mobileNumber,
          createdAt: user.createdAt,
        },
      });
    } else {
      // Memory Store Fallback
      const user = memoryStore.users.find((u) => u.email === cleanEmail);
      if (!user) {
        res.status(401).json({ success: false, message: "Invalid email or password" });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password || "");
      if (!isMatch) {
        res.status(401).json({ success: false, message: "Invalid email or password" });
        return;
      }

      const token = generateToken(user._id, user.email, user.name);

      res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          mobileNumber: user.mobileNumber,
          createdAt: user.createdAt,
        },
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Server error during login" });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    if (memoryStore.isMongoConnected()) {
      const user = await User.findById(req.user.id);
      if (!user) {
        res.status(44).json({ success: false, message: "User not found" });
        return;
      }

      res.status(200).json({
        success: true,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          mobileNumber: user.mobileNumber,
          createdAt: user.createdAt,
        },
      });
    } else {
      const user = memoryStore.users.find((u) => u._id === req.user?.id);
      if (!user) {
        res.status(200).json({
          success: true,
          user: {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            createdAt: new Date(),
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          mobileNumber: user.mobileNumber,
          createdAt: user.createdAt,
        },
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Server error fetching profile" });
  }
};

export const exportUsersExcel = async (_req: Request, res: Response): Promise<void> => {
  try {
    const csvPath = getUsersCsvFilePath();
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="registered_users.csv"');
    res.sendFile(csvPath);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to export Excel registry file" });
  }
};

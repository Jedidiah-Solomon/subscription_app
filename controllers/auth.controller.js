import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/user.model.js";
import { JWT_SECRET } from "../config/env.js";
import { addDataToCache, getDataFromCache } from "../utils/redis.js";

const USER_CACHE_EXPIRATION = 3600;
const JWT_EXPIRES_IN = 86400;

export const signUp = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, email, password } = req.body;

    let existingUser = await getDataFromCache(`user:${email}`);
    if (!existingUser) {
      existingUser = await User.findOne({ email });
      if (existingUser) {
        await addDataToCache(
          `user:${email}`,
          JSON.stringify(existingUser),
          USER_CACHE_EXPIRATION
        );
      }
    }

    if (existingUser) {
      const error = new Error("User already exists");
      error.statusCode = 409;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save({ session });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    await addDataToCache(
      `user:${email}`,
      JSON.stringify(user),
      USER_CACHE_EXPIRATION
    );
    await addDataToCache(`token:${user._id}`, token, JWT_EXPIRES_IN);

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    let user = await getDataFromCache(`user:${email}`);

    if (!user) {
      const dbUser = await User.findOne({ email });

      if (!dbUser) {
        const error = new Error("Invalid credentials");
        error.statusCode = 401;
        throw error;
      }

      await addDataToCache(
        `user:${email}`,
        JSON.stringify(dbUser),
        USER_CACHE_EXPIRATION
      );

      user = JSON.stringify(dbUser);
    }

    user = JSON.parse(user);

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    await addDataToCache(`token:${user._id}`, token, JWT_EXPIRES_IN);

    res.status(200).json({
      success: true,
      message: "User signed in successfully",
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    const userId = req.user._id;
    await addDataToCache(`token:${userId}`, "", 1);
    res.status(200).json({ message: "Signed out successfully" });
  } catch (error) {
    next(error);
  }
};

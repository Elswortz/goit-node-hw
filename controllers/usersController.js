import User from "../models/user.js";

import { HttpError } from "../helpers/index.js";
import { ctrlWrapper } from "../decorators/index.js";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import gravatar from "gravatar";
import { Jimp } from "jimp";

import fs from "fs/promises";
import path from "path";

import "dotenv/config";

const avatarsPath = path.resolve("public", "avatars");

const { JWT_SECRET } = process.env;

const signup = async (req, res) => {
  const { password, email } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email already used");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
  });

  res.status(201).json({
    email: newUser.email,
    subscription: newUser.subscription,
  });
};

const signin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Invalid email or password");
  }
  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Invalid email or password");
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });
  await User.findByIdAndUpdate(user._id, { token });

  res.json({
    token,
  });
};

const signout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: null });

  res.json({
    message: "Sign out success",
  });
};

const getCurrent = (req, res) => {
  const { email, subscription } = req.user;

  res.json({ email, subscription });
};

const updateAvatar = async (req, res) => {
  const { _id, avatarURL: oldAvatarURL } = req.user;
  const { path: tempPath, originalname } = req.file;

  console.log(oldAvatarURL);

  const uniqueFileName = `${_id}_${originalname}`;
  const newPath = path.join(avatarsPath, uniqueFileName);

  if (oldAvatarURL && !oldAvatarURL.includes("gravatar")) {
    const oldAvatarPath = path.join("public", oldAvatarURL);
    await fs.unlink(oldAvatarPath);
  }

  const image = await Jimp.read(tempPath);
  await image.resize({ w: 250, h: 250 }).write(newPath);
  await fs.unlink(tempPath);

  // await fs.rename(oldPath, newPath);

  const avatarURL = path.join("avatars", uniqueFileName);
  await User.findByIdAndUpdate(_id, { avatarURL });

  res.json({
    avatarURL,
  });
};

export default {
  signup: ctrlWrapper(signup),
  signin: ctrlWrapper(signin),
  signout: ctrlWrapper(signout),
  getCurrent: ctrlWrapper(getCurrent),
  updateAvatar: ctrlWrapper(updateAvatar),
};

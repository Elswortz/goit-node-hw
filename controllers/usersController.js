import User from "../models/user.js";

import { HttpError, sendEmail } from "../helpers/index.js";
import { ctrlWrapper } from "../decorators/index.js";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import gravatar from "gravatar";
import { Jimp } from "jimp";

import fs from "fs/promises";
import path from "path";

import { nanoid } from "nanoid";

import "dotenv/config";

const avatarsPath = path.resolve("public", "avatars");

const { JWT_SECRET, BASE_URL } = process.env;

const signup = async (req, res) => {
  const { password, email } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email already used");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const verificationToken = nanoid();

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
    verificationToken,
  });

  const verifyEmail = {
    to: email,
    subject: "Verify your email adress",
    html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${verificationToken}">Click to verify your email adress</a>`,
  };

  await sendEmail(verifyEmail);

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

  if (!user.verify) {
    throw HttpError(401, "Email is not verified");
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

  const avatarURL = path.join("avatars", uniqueFileName);
  await User.findByIdAndUpdate(_id, { avatarURL });

  res.json({
    avatarURL,
  });
};

const verifyEmail = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });
  if (!user) {
    throw HttpError(404, "User not found");
  }
  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: "null",
  });

  res.json({ message: "Email succesfully verified" });
};

const resendVerifyEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(404, "User not found");
  }
  if (user.verify) {
    throw HttpError(401, "User already verifed");
  }

  const verifyEmail = {
    to: email,
    subject: "Verify your email adress",
    html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${user.verificationToken}">Click to verify your email adress</a>`,
  };

  await sendEmail(verifyEmail);

  res.json({ message: "Successfuly resend verification email" });
};

export default {
  signup: ctrlWrapper(signup),
  signin: ctrlWrapper(signin),
  signout: ctrlWrapper(signout),
  getCurrent: ctrlWrapper(getCurrent),
  updateAvatar: ctrlWrapper(updateAvatar),
  verifyEmail: ctrlWrapper(verifyEmail),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
};

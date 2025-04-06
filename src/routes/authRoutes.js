import express from "express";
import User from "../models/Users.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

router.post("/register", async (req, res) => {
  try {
    const { email, password, username } = req.body;
    if (!email || !password || !username) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }

    if (username.length < 3) {
      return res
        .status(400)
        .json({ error: "Username must be at least 3 characters long" });
    }

    //check user already exits
    const ExitEmail = await User.findOne({ email });
    if (ExitEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }
    const ExitUsername = await User.findOne({ username });
    if (ExitUsername) {
      return res.status(400).json({ error: "Username already exists" });
    }

    //get random Avatar
    const avatar = `https://api.dicebear.com/6.x/initials/svg?seed=${username}`;

    const user = new User({
      email,
      password,
      username,
      profilePicture: avatar,
    });

    await user.save();

    const token = generateToken(user._id);
    res.status(201).json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
    console.log(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      res.status(400).json({ error: "Email and password are required" });

    //check if user exits
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    //check if password is correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // generate token
    const token = generateToken(user._id);

    res.status(200).json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
    console.log(error);
  }
});

export default router;

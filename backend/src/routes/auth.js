const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const { getJwtSecret } = require("../config");

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hash },
    select: { id: true, email: true },
  });

  const token = jwt.sign({ userId: user.id, email: user.email }, getJwtSecret(), {
    expiresIn: "7d",
  });

  res.status(201).json({ user, token });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, getJwtSecret(), {
    expiresIn: "7d",
  });

  res.json({ user: { id: user.id, email: user.email }, token });
});

module.exports = router;

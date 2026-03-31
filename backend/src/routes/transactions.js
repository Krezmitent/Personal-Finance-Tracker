const express = require("express");
const multer = require("multer");
const { parse } = require("csv-parse/sync");
const prisma = require("../lib/prisma");
const auth = require("../middleware/auth");
const { categorizeMerchant } = require("../utils/categorize");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", auth, async (req, res) => {
  const { amount, merchant, date, category } = req.body;
  if (amount === undefined || !merchant || !date) {
    return res.status(400).json({ error: "amount, merchant and date are required" });
  }

  const created = await prisma.transaction.create({
    data: {
      userId: req.user.userId,
      amount: Number(amount),
      merchant,
      date: new Date(date),
      category: category || categorizeMerchant(merchant),
    },
  });

  res.status(201).json(created);
});

router.get("/", auth, async (req, res) => {
  const data = await prisma.transaction.findMany({
    where: { userId: req.user.userId },
    orderBy: { date: "desc" },
  });

  res.json(data);
});

router.post("/upload", auth, upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "CSV file is required" });
  }

  const records = parse(req.file.buffer.toString("utf-8"), {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const parsedData = records
    .map((record) => {
      const amount = Number(record.amount);
      const merchant = record.merchant;
      const date = new Date(record.date);

      if (!Number.isFinite(amount) || !merchant || Number.isNaN(date.getTime())) {
        return null;
      }

      return {
        userId: req.user.userId,
        amount,
        merchant,
        date,
        category: categorizeMerchant(merchant),
      };
    })
    .filter(Boolean);

  if (!parsedData.length) {
    return res.status(400).json({ error: "No valid rows found in CSV" });
  }

  await prisma.transaction.createMany({ data: parsedData });

  res.status(201).json({ inserted: parsedData.length });
});

module.exports = router;

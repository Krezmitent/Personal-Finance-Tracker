const express = require("express");
const prisma = require("../lib/prisma");
const auth = require("../middleware/auth");

const router = express.Router();

function getMockCurrentPrice(investment) {
  return Number((investment.buyPrice * 1.08).toFixed(2));
}

router.post("/", auth, async (req, res) => {
  const { assetName, type, quantity, buyPrice } = req.body;
  if (!assetName || !type || quantity === undefined || buyPrice === undefined) {
    return res.status(400).json({ error: "assetName, type, quantity and buyPrice are required" });
  }

  if (!["stock", "crypto"].includes(type)) {
    return res.status(400).json({ error: "type must be stock or crypto" });
  }

  const created = await prisma.investment.create({
    data: {
      userId: req.user.userId,
      assetName,
      type,
      quantity: Number(quantity),
      buyPrice: Number(buyPrice),
    },
  });

  res.status(201).json(created);
});

router.get("/", auth, async (req, res) => {
  const portfolio = await prisma.investment.findMany({
    where: { userId: req.user.userId },
    orderBy: { createdAt: "desc" },
  });

  const detailed = portfolio.map((item) => {
    const currentPrice = getMockCurrentPrice(item);
    const totalValue = currentPrice * item.quantity;
    const investedValue = item.buyPrice * item.quantity;
    const profitLoss = totalValue - investedValue;

    return {
      ...item,
      currentPrice,
      totalValue,
      profitLoss,
    };
  });

  const totalValue = detailed.reduce((sum, item) => sum + item.totalValue, 0);
  const totalInvested = detailed.reduce((sum, item) => sum + item.buyPrice * item.quantity, 0);

  res.json({
    portfolio: detailed,
    summary: {
      totalValue,
      totalProfitLoss: totalValue - totalInvested,
    },
  });
});

module.exports = router;

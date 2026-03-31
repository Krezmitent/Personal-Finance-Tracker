const express = require("express");
const prisma = require("../lib/prisma");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, async (req, res) => {
  const { category, monthlyLimit } = req.body;
  if (!category || monthlyLimit === undefined) {
    return res.status(400).json({ error: "category and monthlyLimit are required" });
  }

  const budget = await prisma.budget.upsert({
    where: {
      userId_category: {
        userId: req.user.userId,
        category,
      },
    },
    update: { monthlyLimit: Number(monthlyLimit) },
    create: {
      userId: req.user.userId,
      category,
      monthlyLimit: Number(monthlyLimit),
    },
  });

  res.status(201).json(budget);
});

router.get("/", auth, async (req, res) => {
  const budgets = await prisma.budget.findMany({ where: { userId: req.user.userId } });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const spendByCategory = await prisma.transaction.groupBy({
    by: ["category"],
    where: {
      userId: req.user.userId,
      date: {
        gte: monthStart,
        lt: monthEnd,
      },
    },
    _sum: { amount: true },
  });

  const spendMap = Object.fromEntries(
    spendByCategory.map((item) => [item.category, item._sum.amount || 0])
  );

  const summary = budgets.map((budget) => {
    const spent = spendMap[budget.category] || 0;
    const remaining = budget.monthlyLimit - spent;
    const percentageUsed = budget.monthlyLimit > 0 ? (spent / budget.monthlyLimit) * 100 : 0;

    return {
      ...budget,
      spent,
      remaining,
      percentageUsed,
      overspendingAlert: percentageUsed > 80,
    };
  });

  res.json(summary);
});

module.exports = router;

const express = require("express");
const prisma = require("../lib/prisma");
const auth = require("../middleware/auth");

const router = express.Router();

function detectRecurring(transactions) {
  const map = new Map();
  for (const transaction of transactions) {
    const key = `${transaction.merchant.toLowerCase()}-${transaction.amount.toFixed(2)}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(new Date(transaction.date));
  }

  const recurring = [];
  for (const [key, dates] of map.entries()) {
    if (dates.length < 2) continue;
    dates.sort((a, b) => a - b);
    const intervals = [];
    for (let i = 1; i < dates.length; i += 1) {
      const diffDays = Math.round((dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24));
      intervals.push(diffDays);
    }

    const hasMonthlyPattern = intervals.some((days) => days >= 27 && days <= 33);
    if (hasMonthlyPattern) {
      const [merchant, amount] = key.split("-");
      recurring.push({ merchant, amount: Number(amount) });
    }
  }

  return recurring;
}

router.get("/", auth, async (req, res) => {
  const transactions = await prisma.transaction.findMany({
    where: { userId: req.user.userId },
    orderBy: { date: "asc" },
  });

  if (!transactions.length) {
    return res.json({ suggestions: ["Start adding transactions to receive AI-based insights."] });
  }

  const categoryTotals = transactions.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    return acc;
  }, {});

  const highestCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

  const monthlyTotals = transactions.reduce((acc, tx) => {
    const d = new Date(tx.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    acc[key] = (acc[key] || 0) + tx.amount;
    return acc;
  }, {});

  const monthlyValues = Object.values(monthlyTotals);
  const avgMonthly = monthlyValues.reduce((a, b) => a + b, 0) / monthlyValues.length;
  const latestMonth = Object.keys(monthlyTotals).sort().pop();
  const latestValue = latestMonth ? monthlyTotals[latestMonth] : 0;
  const isSpike = avgMonthly > 0 && latestValue > avgMonthly * 1.3;

  const recurring = detectRecurring(transactions);

  const suggestions = [];

  if (highestCategory) {
    suggestions.push(
      `Reduce ${highestCategory[0]} spending by 20% to save ₹${(highestCategory[1] * 0.2).toFixed(2)}.`
    );
  }

  if (isSpike) {
    suggestions.push(
      `Spending spike detected in ${latestMonth}: ₹${latestValue.toFixed(2)} vs avg ₹${avgMonthly.toFixed(2)}.`
    );
  }

  if (recurring.length) {
    const recurringTotal = recurring.reduce((sum, item) => sum + item.amount, 0);
    suggestions.push(`You have recurring subscriptions worth ₹${recurringTotal.toFixed(2)}.`);
  }

  if (!suggestions.length) {
    suggestions.push("Your spending appears stable. Keep tracking for richer insights.");
  }

  res.json({
    highestSpendingCategory: highestCategory ? { category: highestCategory[0], amount: highestCategory[1] } : null,
    recurring,
    suggestions,
  });
});

module.exports = router;

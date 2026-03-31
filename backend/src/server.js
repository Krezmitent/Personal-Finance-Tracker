require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const transactionRoutes = require("./routes/transactions");
const budgetRoutes = require("./routes/budget");
const insightsRoutes = require("./routes/insights");
const investmentRoutes = require("./routes/investments");

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/transactions", transactionRoutes);
app.use("/budget", budgetRoutes);
app.use("/insights", insightsRoutes);
app.use("/investments", investmentRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});

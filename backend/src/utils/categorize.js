const rules = {
  Food: ["swiggy", "zomato"],
  Transport: ["uber", "ola"],
  Subscriptions: ["netflix", "spotify"],
};

function categorizeMerchant(merchant = "") {
  const normalized = merchant.toLowerCase();

  for (const [category, keywords] of Object.entries(rules)) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return category;
    }
  }

  return "Others";
}

module.exports = { categorizeMerchant };

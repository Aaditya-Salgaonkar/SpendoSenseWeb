import { supabase } from "@/supabase";

const generateAnalysisInput = async () => {
  try {
    // 🔹 Fetch the logged-in user's ID
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Error fetching user ID");

    const userId = user.id;

    // 🔹 Fetch user's monthly income
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("monthlyincome")
      .eq("id", userId)
      .single();

    if (userError || !userData) throw new Error("Error fetching monthly income");

    const { monthlyincome: monthlyIncome } = userData;

    // 🔹 Fetch unnecessary category IDs
    const unnecessaryCategories = ["Entertainment", "Shopping", "Food"];
    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .select("id, name")
      .in("name", unnecessaryCategories);

    if (categoryError || !categoryData) throw new Error("Error fetching categories");

    const categoryMap = Object.fromEntries(categoryData.map(({ id, name }) => [id, name]));
    const categoryIds = Object.keys(categoryMap);

    if (!categoryIds.length) return { userId, monthlyIncome, totalUnnecessaryExpense: 0, unnecessaryExpenses: {} };

    // 🔹 Fetch transactions in unnecessary categories
    const { data: transactions, error: transactionsError } = await supabase
      .from("transactions")
      .select("amount, categoryid")
      .eq("userid", userId)
      .in("categoryid", categoryIds);

    if (transactionsError || !transactions) throw new Error("Error fetching transactions");

    // 🔹 Aggregate Transactions by Category
    let totalUnnecessaryExpense = 0;
    const unnecessaryExpenses = transactions.reduce((acc, { amount, categoryid }) => {
      const categoryName = categoryMap[categoryid] || "Other";
      acc[categoryName] = acc[categoryName] || { totalSpent: 0, percentage: 0 };
      acc[categoryName].totalSpent += amount;
      totalUnnecessaryExpense += amount;
      return acc;
    }, {});

    // 🔹 Calculate percentage of monthly income
    Object.values(unnecessaryExpenses).forEach(expense => {
      expense.percentage = ((expense.totalSpent / monthlyIncome) * 100).toFixed(2);
    });

    return { userId, monthlyIncome, totalUnnecessaryExpense, unnecessaryExpenses };
  } catch (error) {
    console.error(error.message);
    return null;
  }
};

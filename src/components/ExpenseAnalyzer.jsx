import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabase";
import Spinner from "./Spinner";

const ExpenseAnalyzer = () => {
  const [userId, setUserId] = useState(null);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [categoryMap, setCategoryMap] = useState({});
  const [expenses, setExpenses] = useState([]);
  const [flaggedCategories, setFlaggedCategories] = useState([]);
  const [goodCategories, setGoodCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // ✅ New error state

  const goodCategoryNames = ["Healthcare", "Education", "Investments", "Self-Development"];

  const fetchExpenseData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1️⃣ Get Logged-in User
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) throw new Error("Failed to fetch user data.");
      
      const currentUserId = userData.user.id;
      setUserId(currentUserId);

      // 2️⃣ Fetch Monthly Income
      const { data: userIncomeData, error: incomeError } = await supabase
        .from("users")
        .select("monthlyincome")
        .eq("id", currentUserId)
        .single();
      if (incomeError || !userIncomeData) throw new Error("Failed to fetch monthly income.");

      setMonthlyIncome(userIncomeData.monthlyincome);

      // 3️⃣ Fetch Category Names
      const { data: categoriesData, error: categoryError } = await supabase
        .from("categories")
        .select("id, name");
      if (categoryError || !categoriesData) throw new Error("Failed to fetch category names.");

      const categoryMapping = Object.fromEntries(categoriesData.map(({ id, name }) => [id, name]));
      setCategoryMap(categoryMapping);

      // 4️⃣ Fetch Transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("transactions")
        .select("categoryid, amount")
        .eq("userid", currentUserId);
      if (transactionsError) throw new Error("Failed to fetch transactions.");

      // 5️⃣ Aggregate Expenses
      const categoryExpenses = transactionsData.reduce((acc, { categoryid, amount }) => {
        acc[categoryid] = (acc[categoryid] || 0) + amount;
        return acc;
      }, {});

      const expenseList = Object.entries(categoryExpenses).map(([categoryId, spent]) => ({
        category: categoryMapping[categoryId] || `Category ${categoryId}`,
        spent,
        percentage: ((spent / userIncomeData.monthlyincome) * 100).toFixed(2),
      }));

      setExpenses(expenseList);

      // 6️⃣ Flag Categories (Overspending > 30% of Income)
      setFlaggedCategories(expenseList.filter(({ percentage }) => percentage > 30));

      // 7️⃣ Identify Good Categories (Spending < 20% & in predefined list)
      setGoodCategories(expenseList.filter(({ percentage, category }) => percentage < 20 && goodCategoryNames.includes(category)));

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenseData();
  }, [fetchExpenseData]);

  return (
    <div className="bg-gray-900 p-5 rounded-lg shadow-md text-white w-full sm:w-4/5 md:w-3/4 lg:w-2/3 xl:w-1/2 mx-auto">
      <h2 className="text-3xl font-bold mb-4 text-center">Expense Analyzer</h2>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <>
          <p className="mb-4 text-blue-500 font-bold text-center">Total Monthly Income: ₹{monthlyIncome}</p>

          {/* ⚠️ Flagged Categories (Overspending) */}
          <h3 className="text-lg font-semibold">⚠️ Cut Down on These Categories:</h3>
          {flaggedCategories.length === 0 ? (
            <p className="text-green-400 text-center">Great! No category exceeds 30% of your income. 🎉</p>
          ) : (
            <div className="overflow-y-auto max-h-64 mt-4">
              <div className="grid grid-cols-1 gap-4">
                {flaggedCategories.map(({ category, spent, percentage }, index) => (
                  <div
                    key={index}
                    className="bg-red-500/10 p-4 rounded-lg border border-red-500 shadow-md hover:bg-red-600/30 transition-all"
                  >
                    <h4 className="text-red-400 text-lg font-semibold">{category}</h4>
                    <p>Spent: ₹{spent}</p>
                    <p>({percentage}% of income)</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ✅ Good Categories (Encouraged Spending) */}
          <h3 className="text-lg font-semibold mt-6">✅ Consider Spending More:</h3>
          {goodCategories.length === 0 ? (
            <p className="text-yellow-400 text-center">You're not under-spending in key areas.</p>
          ) : (
            <div className="overflow-y-auto max-h-64 mt-4">
              <div className="grid grid-cols-1 gap-4">
                {goodCategories.map(({ category, spent, percentage }, index) => (
                  <div
                    key={index}
                    className="bg-green-500/10 p-4 rounded-lg border border-green-500 shadow-md hover:bg-green-600/30 transition-all"
                  >
                    <h4 className="text-green-400 text-lg font-semibold">{category}</h4>
                    <p>Spent: ₹{spent}</p>
                    <p>({percentage}% of income)</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExpenseAnalyzer;

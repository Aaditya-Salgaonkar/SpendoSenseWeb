import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";

const RecentTransactions = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data: incomeData, error: incomeError } = await supabase
          .from("income")
          .select("id, created_at, source, amount")
          .order("created_at", { ascending: false });

        if (incomeError) throw incomeError;

        const { data: expenseData, error: expenseError } = await supabase
          .from("transactions")
          .select("id, transactiontime, categoryid, amount")
          .order("transactiontime", { ascending: false });

        if (expenseError) throw expenseError;

        const categoryIds = [...new Set(expenseData.map((txn) => txn.categoryid))];
        const { data: categories, error: categoryError } = await supabase
          .from("categories")
          .select("id, name")
          .in("id", categoryIds);

        if (categoryError) throw categoryError;

        const categoryMap = categories.reduce((map, category) => {
          map[category.id] = category.name;
          return map;
        }, {});

        const combinedTransactions = [
          ...incomeData.map((txn) => ({
            ...txn,
            type: "Income",
            amount: txn.amount,
            created_at: txn.created_at,
            category: txn.source,
          })),
          ...expenseData.map((txn) => ({
            ...txn,
            type: "Expense",
            amount: txn.amount,
            created_at: txn.transactiontime,
            category: categoryMap[txn.categoryid] || "Unknown",
          })),
        ]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 8); // Keep only the most recent 8 transactions

        setTransactions(combinedTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, []);

  // Format amount with K notation
  const formatAmount = (amount) => (amount >= 1000 ? `₹${(amount / 1000).toFixed(1)}K` : `₹${amount}`);

  // Format date as Month Year (e.g., Mar 2025)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("default", { month: "short", year: "numeric" });
  };

  return (
    <div className="w-full mt-8 bg-[#171c3a] p-4 md:p-6 rounded-3xl shadow-lg mx-auto max-w-full lg:max-w-none">
      <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 text-center">
        Recent Transactions
      </h2>

      <div className="overflow-x-auto mt-6">
        <table className="w-full min-w-[600px] lg:min-w-full">
          <thead>
            <tr className="text-left border-b border-gray-700 text-sm md:text-base">
              <th className="p-2 md:p-3">Date</th>
              <th className="p-2 md:p-3">Category</th>
              <th className="p-2 md:p-3">Type</th>
              <th className="p-2 md:p-3">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map((txn) => (
                <tr key={txn.id} className="border-b border-gray-700 text-sm md:text-base">
                  <td className="p-2 md:p-3">{formatDate(txn.created_at)}</td>
                  <td className="p-2 md:p-3">{txn.category || "N/A"}</td>
                  <td className={`p-2 md:p-3 ${txn.type === "Income" ? "text-green-400" : "text-red-400"}`}>
                    {txn.type}
                  </td>
                  <td className="p-2 md:p-3">{formatAmount(txn.amount)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-2 text-center text-gray-400">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTransactions;

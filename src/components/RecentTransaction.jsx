import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";

const RecentTransactions = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Fetch income transactions from the "income" table
        const { data: incomeData, error: incomeError } = await supabase
          .from("income")
          .select("id, created_at, source, amount")
          .order("created_at", { ascending: false });

        if (incomeError) throw incomeError;

        // Fetch expense transactions from the "transactions" table (expenses)
        const { data: expenseData, error: expenseError } = await supabase
          .from("transactions")
          .select("id, transactiontime, categoryid, amount")
          .order("transactiontime", { ascending: false });

        if (expenseError) throw expenseError;

        // Combine income and expense data with a type
        const combinedTransactions = [
          ...incomeData.map((txn) => ({
            ...txn,
            type: "Income", // Label income transactions as "Income"
            amount: txn.amount,
            created_at: txn.created_at,
            category: txn.source, // Use source as category for income
          })),
          ...expenseData.map((txn) => ({
            ...txn,
            type: "Expense", // Label expense transactions as "Expense"
            amount: txn.amount,
            created_at: txn.transactiontime,
            category: txn.categoryid, // Assume category ID exists for expenses
          }))
        ];

        // Sort the combined transactions by created date
        const sortedTransactions = combinedTransactions.sort((a, b) =>
          new Date(b.created_at) - new Date(a.created_at)
        );

        setTransactions(sortedTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div className="w-full mt-8 bg-gray-900 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold text-yellow-400">Recent Transactions</h2>
      <table className="w-full mt-4">
        <thead>
          <tr className="text-left border-b border-gray-700">
            <th className="p-2">Date</th>
            <th className="p-2">Category</th>
            <th className="p-2">Type</th>
            <th className="p-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length > 0 ? (
            transactions.map((txn) => (
              <tr key={txn.id} className="border-b border-gray-700">
                <td className="p-2">{new Date(txn.created_at).toLocaleDateString()}</td>
                <td className="p-2">{txn.category || "N/A"}</td>
                <td
                  className={`p-2 ${
                    txn.type === "Income" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {txn.type}
                </td>
                <td className="p-2">₹{txn.amount}</td>
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
  );
};

export default RecentTransactions;

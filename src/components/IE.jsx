import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

const IncomeVsExpenses = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIncomeAndSpendData = async () => {
      try {
        setLoading(true);
        setError(null);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error("User not found. Please log in again.");
        }

        const [{ data: incomeData, error: incomeError }, { data: expenseData, error: expenseError }] =
          await Promise.all([
            supabase
              .from("income")
              .select("amount, created_at")
              .eq("userId", user.id)
              .order("created_at", { ascending: true }),

            supabase
              .from("transactions")
              .select("amount, transactiontime")
              .eq("userid", user.id)
              .order("transactiontime", { ascending: true }),
          ]);

        if (incomeError) throw incomeError;
        if (expenseError) throw expenseError;

        console.log("Income Data:", incomeData);
        console.log("Expense Data:", expenseData);

        // Merge Data
        const mergedData = new Map();

        incomeData.forEach(({ created_at, amount }) => {
          const date = new Date(created_at).toLocaleDateString();
          const entry = mergedData.get(date) || { date, income: 0, expense: 0 };
          entry.income += Number(amount);
          mergedData.set(date, entry);
        });

        expenseData.forEach(({ transactiontime, amount }) => {
          const date = new Date(transactiontime).toLocaleDateString();
          const entry = mergedData.get(date) || { date, income: 0, expense: 0 };
          entry.expense += Number(amount);
          mergedData.set(date, entry);
        });

        // Convert to sorted array
        const sortedData = Array.from(mergedData.values()).sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );

        setChartData(sortedData);
      } catch (err) {
        console.error("Error fetching income or expenses:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIncomeAndSpendData();
  }, []);

  return (
    <div className="bg-[#171c3a] p-7 rounded-3xl shadow-lg">
      <h2 className="text-3xl font-bold text-[#FFD700] mb-10">Income vs Expenses </h2>

      {loading ? (
        <p className="text-white">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" />
            <XAxis dataKey="date" stroke="#ffffff" />
            <YAxis stroke="#ffffff" tickCount={6} domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e293b", color: "#ffffff", borderRadius: "5px" }}
            />
            <Legend />
            <ReferenceLine y={0} stroke="#ffffff" strokeDasharray="3 3" />

            <Line
              type="monotone"
              dataKey="income"
              stroke="#4CAF50"
              strokeWidth={3}
              dot={{ r: 5, fill: "#4CAF50", strokeWidth: 2, stroke: "#ffffff" }}
              activeDot={{ r: 7, fill: "#fff", stroke: "#4CAF50", strokeWidth: 3 }}
            />

            <Line
              type="monotone"
              dataKey="expense"
              stroke="#F44336"
              strokeWidth={3}
              dot={{ r: 5, fill: "#F44336", strokeWidth: 2, stroke: "#ffffff" }}
              activeDot={{ r: 7, fill: "#fff", stroke: "#F44336", strokeWidth: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default IncomeVsExpenses;

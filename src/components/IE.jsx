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
import Spinner from "./Spinner";

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
          const date = new Date(created_at);
          const formattedDate = date.toLocaleString("default", { month: "short", year: "numeric" }); // e.g., Mar 2025
          const entry = mergedData.get(formattedDate) || { date: formattedDate, income: 0, expense: 0 };
          entry.income += Number(amount);
          mergedData.set(formattedDate, entry);
        });

        expenseData.forEach(({ transactiontime, amount }) => {
          const date = new Date(transactiontime);
          const formattedDate = date.toLocaleString("default", { month: "short", year: "numeric" });
          const entry = mergedData.get(formattedDate) || { date: formattedDate, income: 0, expense: 0 };
          entry.expense += Number(amount);
          mergedData.set(formattedDate, entry);
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

  // Format Y-axis values to use K for 1000s
  const formatYAxis = (value) => (value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value);

  return (
    <div className="bg-[#171c3a] p-4 md:p-7 rounded-3xl shadow-lg w-full max-w-sm md:max-w-2xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-[#FFD700] text-center mb-6">
        Income vs Expenses
      </h2>

      {loading ? (
        <div><Spinner /></div>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <div className="w-full">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" />
              <XAxis dataKey="date" stroke="#ffffff" tick={{ fontSize: 12 }} />
              <YAxis stroke="#ffffff" tickFormatter={formatYAxis} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", color: "#ffffff", borderRadius: "5px" }}
                formatter={(value) => `${value >= 1000 ? (value / 1000).toFixed(1) + "K" : value}`}
              />
              <Legend />
              <ReferenceLine y={0} stroke="#ffffff" strokeDasharray="3 3" />

              <Line
                type="monotone"
                dataKey="income"
                stroke="#4CAF50"
                strokeWidth={3}
                dot={{ r: 4, fill: "#4CAF50", strokeWidth: 2, stroke: "#ffffff" }}
                activeDot={{ r: 6, fill: "#fff", stroke: "#4CAF50", strokeWidth: 3 }}
              />

              <Line
                type="monotone"
                dataKey="expense"
                stroke="#F44336"
                strokeWidth={3}
                dot={{ r: 4, fill: "#F44336", strokeWidth: 2, stroke: "#ffffff" }}
                activeDot={{ r: 6, fill: "#fff", stroke: "#F44336", strokeWidth: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default IncomeVsExpenses;

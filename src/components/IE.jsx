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
  const [incomeExpensesData, setIncomeExpensesData] = useState([]);
  const [incomeSourceDataForGraph, setIncomeSourceDataForGraph] = useState([]);
  useEffect(() => {
    console.log("Fetching income and spend data...");

    const fetchIncomeAndSpendData = async () => {
      try {
        const {
          data: { user },
          error: useError,
        } = await supabase.auth._getUser();

        if (useError || !user) {
          console.error("Error fetching user:", useError);
          return;
        }

        const { data: incomeData, error: incomeError } = await supabase
          .from("income")
          .select("amount, created_at")
          .eq("userId", user.id)
          .order("created_at", { ascending: true });

        if (incomeError) throw incomeError;

        const { data: expenseData, error: expenseError } = await supabase
          .from("transactions")
          .select("amount, transactiontime")
          .eq("userid", user.id)
          .order("transactiontime", { ascending: true });

        if (expenseError) throw expenseError;

        console.log("Fetched income data:", incomeData);
        console.log("Fetched spend data:", expenseData);

        const mergedData = {};

        // Format income data
        incomeData.forEach((item) => {
          const date = new Date(item.created_at).toLocaleDateString();
          if (!mergedData[date]) {
            mergedData[date] = { date, income: 0, expense: 0 };
          }
          mergedData[date].income += Number(item.amount);
        });

        // Format expense data
        expenseData.forEach((item) => {
          const date = new Date(item.transactiontime).toLocaleDateString();
          if (!mergedData[date]) {
            mergedData[date] = { date, income: 0, expense: 0 };
          }
          mergedData[date].expense += Number(item.amount);
        });

        // Convert merged object to array
        const combinedData = Object.values(mergedData).sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );

        console.log("Combined income and expense data:", combinedData);
        setIncomeSourceDataForGraph(combinedData);
      } catch (err) {
        console.error("Error fetching income or spend data:", err.message);
      }
    };

    fetchIncomeAndSpendData();
  }, []);

  return (
    <div className="bg-[#171c3a] p-3 rounded-lg shadow-lg flex flex-col justify-center">
      <h2 className="text-2xl font-bold text-white mb-4">
        Income vs Expenses (Over Time)
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={incomeSourceDataForGraph}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" />
          <XAxis dataKey="date" stroke="#ffffff" />

          <YAxis
            stroke="#ffffff"
            domain={["auto", "auto"]} // Auto-scale for dynamic range
            tickCount={10} // More ticks for finer granularity
          />

          <Tooltip />
          <Legend />
          <ReferenceLine y={0} stroke="#ffffff" strokeDasharray="3 3" />

          <Line
            type="monotone"
            dataKey="income"
            stroke="#4CAF50"
            strokeWidth={4}
            dot={{ r: 6, fill: "#4CAF50", strokeWidth: 2, stroke: "#ffffff" }}
            activeDot={{
              r: 8,
              fill: "#fff",
              stroke: "#4CAF50",
              strokeWidth: 3,
            }}
            isAnimationActive={true}
          />

          <Line
            type="monotone"
            dataKey="expense"
            stroke="#F44336"
            strokeWidth={4}
            dot={{ r: 6, fill: "#F44336", strokeWidth: 2, stroke: "#ffffff" }}
            activeDot={{
              r: 8,
              fill: "#fff",
              stroke: "#F44336",
              strokeWidth: 3,
            }}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IncomeVsExpenses;

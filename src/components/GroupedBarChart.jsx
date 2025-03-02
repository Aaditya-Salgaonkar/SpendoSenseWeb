import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabase";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import Spinner from "./Spinner";

const GroupedBarChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch logged-in user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) throw new Error("Failed to fetch user.");
      const currentUserId = userData.user.id;

      // Fetch categories
      const { data: categories, error: categoryError } = await supabase
        .from("categories")
        .select("id, name");

      if (categoryError) throw new Error("Failed to fetch categories.");

      const categoryMap = categories.reduce((acc, category) => {
        acc[category.id] = category.name;
        return acc;
      }, {});

      // Fetch planned budgets
      const { data: budgets, error: budgetError } = await supabase
        .from("budgets")
        .select("categoryid, amount")
        .eq("userid", currentUserId);

      if (budgetError) throw new Error("Failed to fetch budgets.");

      // Fetch total expenses per category
      const { data: expenses, error: expenseError } = await supabase
        .from("transactions")
        .select("categoryid, amount")
        .eq("userid", currentUserId);

      if (expenseError) throw new Error("Failed to fetch expenses.");

      // Aggregate expenses per category
      const expenseMap = expenses.reduce((acc, expense) => {
        acc[expense.categoryid] = (acc[expense.categoryid] || 0) + expense.amount;
        return acc;
      }, {});

      // Format data for the chart
      const chartData = budgets.length > 0 ? budgets.map((budget) => ({
        category: categoryMap[budget.categoryid] || `Category ${budget.categoryid}`,
        planned: budget.amount || 0,
        spent: expenseMap[budget.categoryid] || 0,
      })) : [];

      // Handle empty data scenario
      if (chartData.length === 0) {
        setError("No budget or transaction data found.");
      }

      setData(chartData);
    } catch (err) {
      console.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    return () => {
      setData([]); // Cleanup function to prevent memory leaks
    };
  }, [fetchData]);

  return (
    <Card className="flex flex-col bg-[#101628] text-white p-4 border-[#101628] sm:w-[480px] md:w-[600px] lg:w-[700px] xl:w-[800px] mx-auto ">
      <CardTitle className="mb-4 font-bold text-3xl pt-10 text-center">
        Planned vs. Actual Spending
      </CardTitle>
      <CardContent className="w-full h-full flex justify-center items-center">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : (
          <ResponsiveContainer width="80%" height={400}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              barCategoryGap={20}
              barGap={5}
            >
              <XAxis dataKey="category" tick={{ fill: "white" }} />
              <YAxis tick={{ fill: "white" }} />
              <Tooltip cursor={{ fill: "rgba(255,255,255,0.2)" }} />
              <Legend />
              <Bar dataKey="planned" fill="#4CAF50" name="Planned Budget" barSize={40} />
              <Bar dataKey="spent" fill="#F44336" name="Amount Spent" barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default GroupedBarChart;

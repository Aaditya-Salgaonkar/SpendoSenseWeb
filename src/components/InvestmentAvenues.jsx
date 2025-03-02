import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "../supabase";
import Spinner from "./Spinner";

const InvestmentAvenues = () => {
  const [investmentData, setInvestmentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvestmentData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error("User authentication failed. Please log in.");
        }

        // Fetch unwanted categories in one call
        const unnecessaryCategories = ["Entertainment", "Shopping", "Food"];
        const { data: categories, error: categoryError } = await supabase
          .from("categories")
          .select("id, name")
          .in("name", unnecessaryCategories);

        if (categoryError) throw categoryError;

        // Create category mapping
        const categoryMap = categories.reduce((acc, category) => {
          acc[category.id] = category.name;
          return acc;
        }, {});

        const categoryIds = Object.keys(categoryMap);

        // Fetch transactions in one call
        const { data: transactions, error: transactionError } = await supabase
          .from("transactions")
          .select("amount, categoryid")
          .eq("userid", user.id)
          .in("categoryid", categoryIds);

        if (transactionError) throw transactionError;

        // Calculate total sum of unnecessary expenses
        const totalSum = transactions.reduce(
          (sum, transaction) => sum + (Number(transaction.amount) || 0),
          0
        );

        if (totalSum === 0) {
          setInvestmentData([]);
          return;
        }

        // CAGR calculations
        const years = 10;
        const niftyCAGR = 0.12;
        const fdCAGR = 0.08;
        const data = Array.from({ length: years }, (_, i) => {
          const year = i + 1;
          return {
            year: `Year ${year}`,
            NIFTY_50: Math.round(totalSum * Math.pow(1 + niftyCAGR, year)),
            Fixed_Deposit: Math.round(totalSum * Math.pow(1 + fdCAGR, year)),
          };
        });

        setInvestmentData(data);
      } catch (err) {
        console.error("Error fetching investment data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvestmentData();
  }, []);

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-md text-white w-full md:w-2/3 lg:w-1/2">
      <h2 className="text-3xl font-bold mb-4 text-center text-yellow-400">
        Investment Avenues
      </h2>

      {loading ? (
        <div className="flex justify-center items-center py-4">
          <Spinner />
        </div>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : investmentData.length === 0 ? (
        <p className="text-center text-gray-400">No investment data available.</p>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={investmentData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="year" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip contentStyle={{ backgroundColor: "#222", color: "#FFD700" }} />
            <Legend />
            <Line type="monotone" dataKey="NIFTY_50" stroke="#4CAF50" strokeWidth={3} />
            <Line type="monotone" dataKey="Fixed_Deposit" stroke="#FFC107" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default InvestmentAvenues;

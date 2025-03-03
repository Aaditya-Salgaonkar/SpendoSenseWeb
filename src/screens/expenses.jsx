import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, Typography } from "@mui/material";
import { supabase } from "../supabase";
import HomeNav from "../components/HomeNav";
import { motion } from "framer-motion";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import Spinner from "@/components/Spinner";

const categoryIcons = {
  Food: "🍕",
  Travel: "✈️",
  Shopping: "🛍️",
  Bills: "💡",
  Others: "🔹",
};

const ExpensesDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) return;

      const { data: transactionsData } = await supabase
        .from("transactions")
        .select("*")
        .eq("userid", user.id)
        .order("transactiontime", { ascending: false });

      const { data: categoriesData } = await supabase
        .from("categories")
        .select("*");
      const categoryMap = categoriesData?.reduce((map, category) => {
        map[category.id] = category.name;
        return map;
      }, {});

      setCategories(categoryMap);
      setTransactions(transactionsData);
      setLoading(false);
    };

    fetchTransactions();
  }, []);

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white p-6 pb-10">
      <HomeNav />

      <Typography variant="h5" paddingTop={5} fontWeight={600} className="text-center text-gray-300 ">
        Your Expenses
      </Typography>

      <div className="flex flex-wrap justify-center gap-4 mt-5 bg-[#0a0f1c]">
        <Link to="/addexpense">
          <motion.button
            whileHover={{ scale: 1.1 }}
            className="bg-blue-700 px-6 py-2 rounded-lg shadow-md hover:bg-purple-600 transition-all"
          >
            + Add Expense
          </motion.button>
        </Link>
        <Link to="/payment">
          <motion.button
            whileHover={{ scale: 1.1 }}
            className="bg-blue-700 px-6 py-2 rounded-lg shadow-md hover:bg-purple-600 transition-all"
          >
            Payment
          </motion.button>
        </Link>
      </div>

      <div className="">
        <Card className="w-full max-w-4xl p-1 mt-6 rounded-lg shadow-lg bg-[#0a0f1c] overflow-x-auto mx-auto">
          {loading ? (
            <div className="flex justify-center py-5 bg-[#0a0f1c]">
              <Spinner />
            </div>
          ) : transactions.length > 0 ? (
            <div className="p-4 bg-[#0a0f1c]">
              <table className="w-full border-collapse hidden md:table ">
                <thead className="bg-gray-900 text-white">
                  <tr>
                    <th className="py-3 px-4 text-left">Merchant</th>
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-left">Category</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-gray-600 hover:bg-gray-700 transition-all bg-[#0a0f1c]"
                    >
                      <td className="py-4 px-4 text-white">
                        {transaction.merchantName}
                      </td>
                      <td className="py-4 px-4 text-white">
                        {new Date(
                          transaction.transactiontime
                        ).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-white">
                        {categoryIcons[categories[transaction.categoryid]] ||
                          "📌"}{" "}
                        {categories[transaction.categoryid] || "Unknown"}
                      </td>
                      <td className="py-4 px-4 text-right text-red-600">
                        ₹{transaction.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Typography color="textSecondary" className="text-center py-6">
              No transactions found.
            </Typography>
          )}

          {/* Mobile View */}
          <div className="block md:hidden bg-[#0a0f1c]">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-[#0a0f1c] p-4 mb-2 rounded-lg"
              >
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold text-lg">
                    {transaction.merchantName}
                  </span>
                  <button onClick={() => toggleRow(transaction.id)}>
                    {expandedRows[transaction.id] ? (
                      <FaChevronUp className="text-white" />
                    ) : (
                      <FaChevronDown className="text-white" />
                    )}
                  </button>
                </div>
                {expandedRows[transaction.id] && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    className="mt-2"
                  >
                    <p className="text-white">
                      Date:{" "}
                      {new Date(
                        transaction.transactiontime
                      ).toLocaleDateString()}
                    </p>
                    <p className="text-white">
                      Category:{" "}
                      {categoryIcons[categories[transaction.categoryid]] ||
                        "📌"}{" "}
                      {categories[transaction.categoryid] || "Unknown"}
                    </p>
                    <p className="text-red-600">
                      Amount: ₹{transaction.amount.toFixed(2)}
                    </p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ExpensesDashboard;

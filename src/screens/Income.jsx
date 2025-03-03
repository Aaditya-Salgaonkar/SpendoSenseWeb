import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Box, Card, Typography } from "@mui/material";
import { supabase } from "../supabase";
import HomeNav from "../components/HomeNav";
import { motion } from "framer-motion";
import Spinner from "@/components/Spinner";
import { TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

const categoryIcons = {
  Salary: "💼",
  Freelance: "💻",
  Gifts: "🎁",
  Others: "🔹",
};

const IncomeDashboard = ({ token }) => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [open, setOpen] = useState(false); // Modal state for adding monthly income
  const [monthlyIncome, setMonthlyIncome] = useState(""); // State for monthly income

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("Error getting user:", authError);
        setLoading(false);
        return;
      }

      // Fetch Transactions for Logged-in User (only income)
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("income") // Updated to the income table
        .select("*")
        .eq("userId", user.id) // Filter by the logged-in user's id
        .gt("amount", 0)  // Filter for income (positive amounts)
        .order("created_at", { ascending: false });

      if (transactionsError) {
        console.error("Error fetching transactions:", transactionsError);
        setLoading(false);
        return;
      }

      // Fetch Categories to Map Category IDs
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*");

      if (categoriesError) {
        console.error("Error fetching categories:", categoriesError);
      } else {
        const categoryMap = {};
        categoriesData.forEach(category => {
          categoryMap[category.id] = category.name;
        });
        setCategories(categoryMap);
      }

      setTransactions(transactionsData);
      setLoading(false);
    };

    fetchTransactions();
  }, []);

  const handleMonthlyIncomeChange = (event) => {
    setMonthlyIncome(event.target.value); // Handle input change for monthly income
  };

  const handleMonthlyIncomeSubmit = async () => {
    if (!monthlyIncome) {
      alert("Please enter a monthly income amount.");
      return;
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Error fetching user:", authError);
      return;
    }

    try {
      // Update monthly income in users table
      const { error: monthlyIncomeError } = await supabase
        .from("users")
        .update({ monthlyincome: parseFloat(monthlyIncome) })
        .eq("id", user.id);

      if (monthlyIncomeError) {
        console.error("Error updating monthly income:", monthlyIncomeError.message);
        alert(`Error updating monthly income: ${monthlyIncomeError.message}`);
        return;
      }

      alert("Monthly income added successfully!");
      setMonthlyIncome(""); // Clear the monthly income field
      setOpen(false); // Close the modal
    } catch (err) {
      console.error("Unexpected error:", err);
      alert(`Unexpected error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white">
      <div className={` ${darkMode ? "bg-[#0a0f1c] text-white" : "bg-gray-100 text-black"} flex flex-col items-center p-8`}>
        <HomeNav />
      </div>

      <div className="px-3">
      {
        loading?(<div className="flex-1 items-center justify-center"><Spinner /></div>):(<Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Typography variant="h5" fontWeight={600} className="text-center text-gray-300 mb-6 ">
            Your Income History
          </Typography>
  
          <Link to="/addincome">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              className="bg-blue-700 text-white mt-5 px-6 py-2 rounded-lg shadow-md hover:bg-purple-600 transition-all"
            >
              + Add Income
            </motion.button>
          </Link>
  
          {/* Button to open monthly income modal */}
          <motion.button 
            whileHover={{ scale: 1.1 }}
            className="bg-blue-700 text-white mt-5 px-6 py-2 rounded-lg shadow-md hover:bg-purple-600 transition-all"
            onClick={() => setOpen(true)}
          >
            + Add Monthly Income
          </motion.button>
  
          {/* Monthly Income Modal */}
          <Dialog open={open} onClose={() => setOpen(false)}>
      <div className="bg-[#0a0f1c]  border-[#1a2335] border shadow-lg p-5">
        {/* Dialog Title */}
        <DialogTitle className="text-white text-lg font-semibold border-b border-[#1a2335] pb-3">
          Add Monthly Income
        </DialogTitle>

        <div className="items-center justify-center flex my-5">
        <input
            type="number"
            name="amount"
            value={monthlyIncome}
            onChange={handleMonthlyIncomeChange}
            placeholder="Amount"
            className="p-2 sm:p-3 text-white bg-[#0a0f1c] border rounded hover:border-blue-400 text-sm sm:text-base"
            required
          />
        </div>

        {/* Dialog Actions (Buttons) */}
        <DialogActions className="flex justify-end gap-3 border-t border-[#1a2335] pt-3">
          <Button
            onClick={() => setOpen(false)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all"
          >
            Cancel
          </Button>
          <Button
            onClick={handleMonthlyIncomeSubmit}
            className="bg-[#4A90E2] hover:bg-[#3a7bc4] text-white px-4 py-2 rounded-lg transition-all"
          >
            Submit
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  
          {/* Transactions Table */}
          <Card className="w-full md:w-[80%] m-5 bg-[#0a0f1c] shadow-lg rounded-lg p-1  overflow-x-auto mb-10 mt-10">
  <div className="w-full overflow-x-auto">
    <table className="min-w-full border-collapse">
      <thead className="sticky top-0 bg-gray-900 text-white text-xs md:text-sm">
        <tr>
          <th className="py-2 md:py-3 px-2 md:px-4 text-left">Source</th>
          <th className="py-2 md:py-3 px-2 md:px-4 text-left">Date</th>
          <th className="py-2 md:py-3 px-2 md:px-4 text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((transaction) => (
          <motion.tr
            key={transaction.id}
            whileHover={{ scale: 1.02 }}
            className="border-b border-gray-600 hover:bg-gray-700 bg-[#0a0f1c] transition-all text-xs md:text-sm"
          >
            <td className="py-2 px-2 md:py-4 md:px-4 text-white">{transaction.source}</td>
            <td className="py-2 px-2 md:py-4 md:px-4 text-white">{new Date(transaction.created_at).toLocaleDateString()}</td>
            <td className="py-2 px-2 md:py-4 md:px-4 text-right text-green-600">₹{transaction.amount.toFixed(2)}</td>
          </motion.tr>
        ))}
      </tbody>
    </table>
  </div>
</Card>

        </Box>)
      }
      </div>
    </div>
  );
};

export default IncomeDashboard;

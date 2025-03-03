import React, { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";

const AddIncome = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    source: "",
    amount: "",
    created_at: new Date().toISOString().slice(0, 16), // Default to current time
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.source || !formData.amount) {
      alert("Please fill in all required fields.");
      return;
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Error fetching user:", authError);
      return;
    }

    try {
      // Insert income record
      const { error: incomeError } = await supabase.from("income").insert([
        {
          source: formData.source,
          amount: parseFloat(formData.amount),
          created_at: formData.created_at,
          userId: user.id,
          isincome: true, // Always true for income
        },
      ]);

      if (incomeError) {
        console.error("Error adding income:", incomeError.message);
        alert(`Error adding income: ${incomeError.message}`);
        return;
      }

      // Fetch current balance
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("totalbalance")
        .eq("id", user.id)
        .single();

      if (userError || !userData) {
        console.error("Error fetching user data:", userError);
        return;
      }

      // Update user's total balance
      const newBalance = userData.totalbalance + parseFloat(formData.amount);
      const { error: updateError } = await supabase
        .from("users")
        .update({ totalbalance: newBalance })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error updating balance:", updateError.message);
        return;
      }

      alert("Income added successfully!");
      setFormData({
        source: "",
        amount: "",
        created_at: new Date().toISOString().slice(0, 16),
      });

      navigate(-1); // Navigate back after success
    } catch (err) {
      console.error("Unexpected error:", err);
      alert(`Unexpected error: ${err.message}`);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center p-4 bg-[#0a0f1c]">
      <div className="p-4 sm:p-6 md:p-8 rounded-lg shadow-lg shadow-blue-800 bg-opacity-5 w-full sm:w-3/4 md:w-1/2 lg:w-1/3">
        <h2 className="text-lg sm:text-xl bg-gradient-to-r from-blue-500 to-black font-semibold mb-4 text-transparent bg-clip-text">
          Add Income
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="source"
            value={formData.source}
            onChange={handleChange}
            placeholder="Source of Income"
            className="p-2 sm:p-3 border rounded hover:border-blue-400 text-sm sm:text-base"
            required
          />
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Amount"
            className="p-2 sm:p-3 border rounded hover:border-blue-400 text-sm sm:text-base"
            required
          />
          <input
            type="datetime-local"
            name="created_at"
            value={formData.created_at}
            onChange={handleChange}
            className="p-2 sm:p-3 border rounded hover:border-blue-400 text-sm sm:text-base"
            required
          />

          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 sm:p-3 bg-blue-800 text-white rounded text-sm sm:text-base"
          >
            Submit
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default AddIncome;

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";

const AddTransaction = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    upiid: "",
    amount: "",
    merchantName: "",
    categoryid: "",
    transactiontime: new Date().toISOString().slice(0, 16),
    isincome: false,
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false); // Track submission status

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("categories").select("id, name");
      if (error) {
        console.error("Error fetching categories:", error);
      } else {
        setCategories(data || []);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.merchantName || !formData.categoryid) {
      alert("Please fill in all required fields.");
      return;
    }
    if (parseFloat(formData.amount) <= 0) {
      alert("Amount must be greater than zero.");
      return;
    }

    setLoading(true);

    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData?.user) {
      console.error("Authentication error:", authError);
      setLoading(false);
      return;
    }

    const userId = userData.user.id;

    try {
      const { data: transactionData, error: transactionError } = await supabase.from("transactions").insert([
        {
          userid: userId,
          upiid: formData.upiid,
          amount: parseFloat(formData.amount),
          merchantName: formData.merchantName,
          categoryid: formData.categoryid,
          transactiontime: formData.transactiontime,
          isincome: formData.isincome,
        },
      ]);

      if (transactionError) {
        console.error("Error adding transaction:", transactionError);
        alert("Transaction failed. Please try again.");
        setLoading(false);
        return;
      }

      // Deduct balance only if the transaction was successful
      const { data: userBalanceData, error: balanceError } = await supabase
        .from("users")
        .select("totalbalance")
        .eq("id", userId)
        .single();

      if (balanceError) {
        console.error("Error fetching user balance:", balanceError);
        setLoading(false);
        return;
      }

      const newBalance = parseFloat(userBalanceData.totalbalance) - parseFloat(formData.amount);

      const { error: updateBalanceError } = await supabase
        .from("users")
        .update({ totalbalance: newBalance })
        .eq("id", userId);

      if (updateBalanceError) {
        console.error("Error updating user balance:", updateBalanceError);
        setLoading(false);
        return;
      }

      alert("Transaction added successfully!");
      setFormData({
        upiid: "",
        amount: "",
        merchantName: "",
        categoryid: "",
        transactiontime: new Date().toISOString().slice(0, 16),
        isincome: false,
      });

      navigate(-1);
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center p-10 bg-[#0a0f1c]">
      <div className="p-8 rounded-lg shadow-lg shadow-blue-800 bg-opacity-5 w-full max-w-md">
        <h2 className="text-xl bg-gradient-to-r from-blue-500 to-black font-semibold mb-4 text-transparent bg-clip-text">
          Add Transaction
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="upiid"
            value={formData.upiid}
            onChange={handleChange}
            placeholder="UPI ID (Optional)"
            className="p-2 border rounded hover:border-green-400"
          />
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Amount"
            className="p-2 border rounded hover:border-green-400"
            required
          />
          <input
            type="text"
            name="merchantName"
            value={formData.merchantName}
            onChange={handleChange}
            placeholder="Merchant Name"
            className="p-2 border rounded hover:border-green-400"
            required
          />
          <input
            type="datetime-local"
            name="transactiontime"
            value={formData.transactiontime}
            onChange={handleChange}
            className="p-2 border rounded hover:border-green-400"
            required
          />
          <select
            name="categoryid"
            value={formData.categoryid}
            onChange={handleChange}
            className="p-2 border rounded hover:border-green-400"
            required
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={!loading ? { scale: 1.05 } : {}}
            whileTap={!loading ? { scale: 0.95 } : {}}
            className={`p-2 text-white rounded ${
              loading ? "bg-gray-600 cursor-not-allowed" : "bg-blue-800 hover:bg-blue-900"
            }`}
          >
            {loading ? "Processing..." : "Submit"}
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default AddTransaction;

import React, { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";

const categories = [
  { id: "1", name: "Property" },
  { id: "2", name: "Vehicle" },
  { id: "3", name: "Stocks" },
  { id: "4", name: "Savings" },
  { id: "5", name: "Others" },
];

const AddAsset = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ category: "", value: "" });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category || !formData.value) {
      alert("Please fill in all required fields.");
      return;
    }

    const value = parseFloat(formData.value);
    if (isNaN(value) || value <= 0) {
      alert("Please enter a valid asset value.");
      return;
    }

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Error fetching user");

      const { error: assetError } = await supabase
        .from("asset_distribution")
        .insert([{ userid: user.id, category: formData.category, value }]);

      if (assetError) throw new Error(assetError.message);

      alert("Asset added successfully!");
      setFormData({ category: "", value: "" });
      navigate(-1);
    } catch (error) {
      console.error("Error:", error.message);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center p-10 bg-[#0a0f1c]">
      <div className="p-8 rounded-lg shadow-lg shadow-blue-800 bg-opacity-5 w-1/3">
        <h2 className="text-xl bg-gradient-to-r from-blue-500 to-black font-semibold mb-4 text-transparent bg-clip-text">
          Add Asset
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="number"
            name="value"
            value={formData.value}
            onChange={handleChange}
            placeholder="Asset Value"
            className="p-2 border rounded hover:border-green-400"
            required
          />
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="p-2 border rounded hover:border-green-400"
            required
          >
            <option value="" disabled>Select Category</option>
            {categories.map(({ id, name }) => (
              <option key={id} value={name}>{name}</option>
            ))}
          </select>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-blue-800 text-white rounded"
          >
            Submit
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default AddAsset;

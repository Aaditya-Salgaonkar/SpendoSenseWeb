import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";
import IncomeVsExpenses from "./IE";

const COLORS = [
  "#FF6347", "#FFBB28", "#00C49F", "#0088FE", "#FF8042",
  "#8A2BE2", "#FF69B4", "#32CD32", "#00CED1", "#FF4500"
];

const AssetDistribution = () => {
  const [assetData, setAssetData] = useState([]);
  const [category, setCategory] = useState("");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // Fetch the authenticated user
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        setError("Error fetching user data.");
        return;
      }
      setUserId(user.id);
    };
    fetchUser();
  }, []);

  // Fetch asset data for the logged-in user
  useEffect(() => {
    if (!userId) return;

    const fetchAssetData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("asset_distribution")
          .select("category, value")
          .eq("userid", userId) // Fetch only the current user's assets
          .order("created_at", { ascending: true });

        if (error) throw error;

        setAssetData(data.map(item => ({ name: item.category, value: item.value })));
      } catch (err) {
        console.error("Error fetching asset distribution:", err);
        setError("Failed to load asset distribution data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssetData();
  }, [userId]);

  const handleAddAsset = async () => {
    if (!category || !value) {
      alert("Please fill in both fields.");
      return;
    }

    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue <= 0) {
      alert("Please enter a valid asset value.");
      return;
    }

    try {
      const { error } = await supabase
        .from("asset_distribution")
        .insert([{ userid: userId, category, value: numericValue }]);

      if (error) throw error;

      setCategory("");
      setValue("");
      setAssetData(prev => [...prev, { name: category, value: numericValue }]);
    } catch (err) {
      console.error("Error adding asset:", err);
      alert("Failed to add asset.");
    }
  };

  // Custom Tooltip
  const renderCustomizedTooltip = ({ payload, label }) => {
    if (!payload || payload.length === 0) return null;

    const totalValue = assetData.reduce((acc, item) => acc + item.value, 0);
    const percentage = ((payload[0].value / totalValue) * 100).toFixed(2);

    return (
      <div className="custom-tooltip bg-gray-800 p-3 rounded-lg text-white">
        <p className="text-lg font-semibold">{label}</p>
        <p className="text-sm">Value: {payload[0].value}</p>
        <p className="text-sm">Percentage: {percentage}%</p>
      </div>
    );
  };

  if (loading) return <div className="text-center text-white">Loading asset distribution...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="w-full mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Asset Distribution PieChart */}
      <div className="bg-[#171c3a] p-6 rounded-3xl shadow-lg flex flex-col pl-8">
        <h2 className="text-3xl  font-bold text-gradient bg-clip-text text-transparent text-[#FFD700] pb-3 pt-2">
          Asset Distribution
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={assetData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={5}
              dataKey="value"
            >
              {assetData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={renderCustomizedTooltip} />
            <Legend layout="vertical" align="right" verticalAlign="middle" />
          </PieChart>
        </ResponsiveContainer>

        
      </div>

      {/* Income vs Expenses BarChart */}
      <IncomeVsExpenses />
    </div>
  );
};

export default AssetDistribution;

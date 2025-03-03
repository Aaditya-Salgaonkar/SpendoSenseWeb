import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Box, Card, Typography, Button, useMediaQuery } from "@mui/material";
import { supabase } from "../supabase";
import HomeNav from "../components/HomeNav";
import { motion } from "framer-motion";
import Spinner from "@/components/Spinner";

const categoryIcons = {
  Property: "🏠",
  Vehicle: "🚗",
  Stocks: "📈",
  Savings: "💰",
  Others: "🔹",
};

const AssetsDashboard = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const isSmallScreen = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("Error getting user:", authError);
        setLoading(false);
        return;
      }

      const { data: assetsData, error: assetsError } = await supabase
        .from("asset_distribution")
        .select("*")
        .eq("userid", user.id)
        .order("created_at", { ascending: false });

      if (assetsError) {
        console.error("Error fetching assets:", assetsError);
      } else {
        setAssets(assetsData);
      }
      setLoading(false);
    };

    fetchAssets();
  }, []);

  return (
    <div className={`min-h-screen ${darkMode ? "bg-[#0a0f1c] text-white" : "bg-gray-100 text-black"} flex flex-col items-center p-6`}>
      <HomeNav />

      <Box className="w-full flex flex-col items-center mt-6 gap-5">
        <Typography fontWeight={600} variant={isSmallScreen ? "h5" : "h4"} className="text-gray-300 mb-6">
          Your Assets
        </Typography>

        <Link to="/addassets">
          <Button variant="contained" color="primary" size={isSmallScreen ? "small" : "large"} className="mb-6">
            Add New Asset
          </Button>
        </Link>
      </Box>

      {/* Responsive Assets Table */}
      <Card className="w-full md:w-[80%] bg-[#0a0f1c]  mt-10 overflow-x-auto mb-10">
        {loading ? (
          <Box className="flex justify-center bg-[#0a0f1c]">
            <Spinner />
          </Box>
        ) : assets.length > 0 ? (
          isSmallScreen ? (
            // Mobile View - List Layout
            <div className="flex flex-col gap-4 bg-[#0a0f1c] border-4">
              {assets.map((asset) => (
                <motion.div
                  key={asset.id}
                  whileHover={{ scale: 0.95 }}
                  className="p-4  bg-[#0a0f1c]"
                >
                  <div className="flex justify-between items-center ">
                    <Typography variant="body1" className="text-white font-semibold">
                      {categoryIcons[asset.category] || "📌"} {asset.category || "Unknown"}
                    </Typography>
                    <Typography variant="body2" className="text-green-400 font-semibold">
                      ₹{asset.value.toFixed(2)}
                    </Typography>
                  </div>
                  <Typography variant="body2" className="text-gray-400 mt-2">
                    {new Date(asset.created_at).toLocaleDateString()}
                  </Typography>
                </motion.div>
              ))}
            </div>
          ) : (
            // Desktop View - Table Layout
            <div className="border-4">
              <table className="w-full border-collapse bg-[#0a0f1c]">
              <thead className="sticky top-0 bg-[#0a0f1c] text-white">
                <tr>
                  <th className="py-3 px-4 text-left">Category</th>
                  <th className="py-3 px-4 text-left">Added Date</th>
                  <th className="py-3 px-4 text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <motion.tr
                    key={asset.id}
                    whileHover={{ scale: 0.95 }}
                    className="border-b border-gray-600 bg-[#0a0f1c]  transition-all"
                  >
                    <td className="py-4 px-4 text-white">{categoryIcons[asset.category] || "📌"} {asset.category || "Unknown"}</td>
                    <td className="py-4 px-4 text-white">{new Date(asset.created_at).toLocaleDateString()}</td>
                    <td className="py-4 px-4 text-right text-green-500">₹{asset.value.toFixed(2)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            </div>
          )
        ) : (
          <Typography color="textSecondary" className="text-center py-6">
            No assets found.
          </Typography>
        )}
      </Card>
    </div>
  );
};

export default AssetsDashboard;

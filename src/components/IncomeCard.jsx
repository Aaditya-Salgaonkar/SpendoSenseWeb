import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabase";
import { Stack, Box, Typography, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  Tooltip,
  Bar,
  Cell,
  LabelList,
} from "recharts";
import Spinner from "./Spinner";

const IncomeCard = () => {
  const [incomeData, setIncomeData] = useState([]);
  const [totalNetWorth, setTotalNetWorth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchIncome = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("User not authenticated. Please log in.");
      }

      const { data: income, error: incomeError } = await supabase
        .from("income")
        .select("*")
        .eq("userId", user.id);

      if (incomeError) throw incomeError;

      setIncomeData(income);

      const total = income.reduce((sum, entry) => sum + Number(entry.amount), 0);
      setTotalNetWorth(total);
    } catch (err) {
      console.error("Error fetching income:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncome();
  }, [fetchIncome]);

  // Premium gradient colors for bars
  const premiumColors = [
    "#FFD700", // Gold
    "#C0C0C0", // Silver
    "#1E90FF", // Royal Blue
    "#FF5733", // Coral
    "#9C27B0", // Deep Purple
    "#00BFFF", // Sky Blue
    "#FF1493", // Deep Pink
  ];

  return (
    <Stack direction="column" gap={3} sx={{ height: "100%", width: "100%" }}>
      {/* Net Worth Card */}
      <motion.div
        style={{ height: "30%", width: "100%" }}
        whileHover={{ scale: 1.05 }}
      >
        <Stack
          direction="column"
          spacing={1}
          pt={3}
          pl={4}
          sx={{
            height: "100%",
            width: "100%",
            borderRadius: "20px",
            background: "linear-gradient(135deg, #FFD700, #FF4500)",
            boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.2)",
          }}
        >
          <div>
          <Typography fontSize={28} fontWeight={700} color="#171c3a">
            Total Net Worth
          </Typography>
          {loading ? (
            <div className="items-center justify-center flex-1"></div>
          ) : (
            <Typography fontSize={36} fontWeight={700} color="#fff">
              ${totalNetWorth.toLocaleString()}
            </Typography>
          )}
          </div>
        </Stack>
      </motion.div>

      {/* Income Source Bar Chart */}
      <motion.div
        style={{ height: "70%", width: "100%" }}
        whileHover={{ scale: 1.05 }}
      >
        <Box
          sx={{
            height: "100%",
            width: "100%",
            backgroundColor: "#171c3a",
            borderRadius: "20px",
            padding: "40px",
            boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.3)",
          }}
        >
          <Typography fontSize={32} fontWeight={600} mb={3} ml={2} color="#FFD700">
            Income Sources
          </Typography>

          {loading ? (
            <Stack alignItems="center" justifyContent="center" height="85%">
              <Spinner />
            </Stack>
          ) : error ? (
            <Typography color="red">{error}</Typography>
          ) : incomeData.length === 0 ? (
            <Typography color="#FFFFFF">No income data available.</Typography>
          ) : (
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={incomeData} barSize={40}>
                <XAxis dataKey="source" stroke="#FFFFFF" fontWeight={600} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#222",
                    color: "#FFD700",
                    borderRadius: "8px",
                  }}
                  cursor={{ fill: "rgba(255, 215, 0, 0.2)" }}
                />
                <Bar
                  dataKey="amount"
                  radius={[10, 10, 0, 0]}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <LabelList
                    dataKey="amount"
                    position="top"
                    fill="#FFFFFF"
                    fontSize={16}
                    fontWeight={600}
                  />
                  {incomeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={premiumColors[index % premiumColors.length]}
                      style={{
                        transition: "all 0.3s ease-in-out",
                      }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Box>
      </motion.div>
    </Stack>
  );
};

export default IncomeCard;

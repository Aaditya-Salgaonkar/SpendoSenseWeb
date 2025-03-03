import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Box, Stack, Typography } from "@mui/material";
import { supabase } from "@/supabase";
import { People } from "@mui/icons-material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,

  LineChart,
  Line,
} from "recharts";
import HomeNav from "@/components/HomeNav";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import IncomeCard from "@/components/IncomeCard";
import RecentTransactions from "@/components/RecentTransaction";
import { useMediaQuery } from "@mui/material";
import AssetDistribution from "@/components/assets";
import Spinner from "@/components/Spinner";




const Dashboard = ({token}) => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
    const [categories, setCategories] = useState([]);
    const [loading,setLoading] = useState(true);
    const [spendingBreakdown, setSpendingBreakdown] = useState([]);
    const [incomeSourceDataForGraph, setIncomeSourceDataForGraph] = useState([]);
    const [incomeSourceDataForGraph2, setIncomeSourceDataForGraph2] = useState(
      []
    );
    const categoryMap = [
      {
        id: "47823c77-f9b8-4387-a76d-54e07c0bf227",
        label: "Dining Out",
        icon: <HomeIcon sx={{ color: "white" }} />,
        iconColor: "#8B5CF6",
      },
      {
        id: "5d98b586-fbb9-4c4b-bed5-ff739eba3ea5",
        label: "Travel",
        icon: <PersonIcon sx={{ color: "white" }} />,
        iconColor: "#EC4899",
      },
      {
        id: "de8d5f42-77c6-4b29-9cdd-6bfc4daf3593",
        label: "Transportation",
        icon: <DirectionsCarIcon sx={{ color: "white" }} />,
        iconColor: "#F97316",
      },
      {
        id: "52c6cc86-78c2-4848-8f4a-ca934fe90ca1",
        label: "Healthcare",
        icon: <People sx={{ color: "white" }} />,
        iconColor: "rgb(253, 81, 54)",
      },
    ];
    useEffect(() => {
      const fetchSpendingBreakdown = async () => {
        try {
          const breakdownData = await Promise.all(
            categoryMap.map(async (category) => {
              const { data, error } = await supabase
                .from("transactions")
                .select("amount")
                .eq("categoryid", category.id);
  
              if (error) {
                console.error(
                  `Error fetching ${category.label} transactions:`,
                  error
                );
                return { ...category, amount: "$0.00" };
              }
  
              const totalAmount = data.reduce(
                (sum, txn) => sum + parseFloat(txn.amount),
                0
              );
  
              const formattedAmount = `$${totalAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`;
  
              return {
                ...category,
                amount: formattedAmount,
              };
            })
          );
  
          setSpendingBreakdown(breakdownData);
        } catch (error) {
          console.error("Error fetching spending breakdown:", error);
        }
      };
  
      fetchSpendingBreakdown();
    }, []);
  
    useEffect(() => {
      console.log("Fetching income data...");
  
      const fetchIncomeData = async () => {
        try {
          const {
            data: { user },
            error: useError,
          } = await supabase.auth._getUser();
          console.log("Fetching income data...");
          const { data, error } = await supabase
            .from("income")
            .select("amount, created_at")
            .eq("userId", user.id)
            .order("created_at", { ascending: true });
  
          if (error) throw error;
  
          console.log("Fetched income data:", data);
  
          const formattedData = data.map((item) => ({
            value: item.amount,
            date: new Date(item.created_at).toLocaleDateString(),
          }));
  
          console.log("Formatted income data:", formattedData);
          setIncomeSourceDataForGraph(formattedData);
        } catch (err) {
          console.error("Error fetching income data:", err.message);
        }
      };
  
      const fetchSpendData = async () => {
        try {
          const {
            data: { user },
            error: useError,
          } = await supabase.auth._getUser();
          console.log("Fetching spend data...");
          const { data, error } = await supabase
            .from("transactions")
            .select("amount, transactiontime")
            .eq("userid", user.id)
            .order("transactiontime", { ascending: true });
  
          if (error) throw error;
  
          console.log("Fetched spend data:", data);
  
          const formattedSpendData = data.map((item) => ({
            value: item.amount,
            date: new Date(item.transactiontime).toLocaleDateString(),
          }));
  
          console.log(
            "---------------------Formatted spend data:",
            formattedSpendData
          );
          setIncomeSourceDataForGraph2(formattedSpendData);
        } catch (err) {
          console.error("Error fetching spend data:", err.message);
        }
      };
  
      fetchIncomeData();
      fetchSpendData();
    }, []);
    useEffect(() => {
      const fetchCategories = async () => {
        try {
          setLoading(true)
          const { data, error } = await supabase.from("categories").select("*");
    
          if (error) {
            console.error("Error fetching categories:", error);
            return;
          }
    
          if (Array.isArray(data)) {
            setCategories(data);
            setLoading(false)
          } else {
            console.warn("Unexpected data format:", data);
            setCategories([]);
          }
        } catch (err) {
          console.error("Unexpected error fetching categories:", err);
        }finally{setLoading(false);}
      };
    
      fetchCategories();
    }, []);
    

  const handleLogout = () => {
    
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-[#0a0f1c] text-white" : "bg-gray-100 text-black"
      } flex flex-col items-center p-8`}
    >
      {/* Secondary Navigation */}
      <div className="w-full mt-4">
        <HomeNav />
      </div>

      {/* Combined Cards Section */}
      <div className="w-full mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">

        <IncomeCard token={token} />
        {/* Card 2: Spending Line Charts */}
        <Stack sx={{ height: "100%", width: "100%" }} direction="column" gap={3.5}>
  {/* Income Graph */}
  <motion.div
    style={{ minHeight: "300px", width: "100%" }}
    whileHover={{ scale: 1.05 }}
  >
    <Stack
      direction="column"
      sx={{
        height: "100%",
        width: "100%",
        backgroundColor: "#171c3a",
        borderRadius: "30px",
        padding: 4,
      }}
    >
      <Typography fontSize={32} fontWeight={600} color="#FFD700" ml={3}>
        Income
      </Typography>
      <Typography fontSize={24} fontWeight={500} color="white" ml={3} mb={3}>
        ₹{" "}
        {incomeSourceDataForGraph
          .reduce((sum, item) => sum + parseFloat(item.value), 0)
          .toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </Typography>
      {loading ? (
        <Spinner />
      ) : (
        <div className="w-full min-h-[150px] md:min-h-[150px]">
          <ResponsiveContainer width="100%" height="100%" aspect={2}>
            <LineChart data={incomeSourceDataForGraph}>
              <Line
                type="monotone"
                dataKey="value"
                stroke="#FF4500"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Stack>
  </motion.div>

  {/* Expense Graph */}
  <motion.div
    style={{ minHeight: "300px", width: "100%" }}
    whileHover={{ scale: 1.05 }}
  >
    <Stack
      direction="column"
      sx={{
        height: "100%",
        width: "100%",
        backgroundColor: "#171c3a",
        borderRadius: "30px",
        padding: 4,
      }}
    >
      <Typography fontSize={32} fontWeight={600} color="#FFD700" ml={3}>
        Expense
      </Typography>
      <Typography fontSize={24} fontWeight={500} color="white" ml={3} mb={3}>
        ₹{" "}
        {incomeSourceDataForGraph2
          .reduce((sum, item) => sum + parseFloat(item.value), 0)
          .toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </Typography>
      {loading ? (
        <Spinner />
      ) : (
        <div className="w-full min-h-[150px] md:min-h-[150px]">
          <ResponsiveContainer width="100%" height="100%" aspect={2}>
            <LineChart data={incomeSourceDataForGraph2}>
              <Line
                type="monotone"
                dataKey="value"
                stroke="#FF4500"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Stack>
  </motion.div>
</Stack>


        {/* Card 3: Spendings Breakdown */}
        <motion.div whileHover={{ scale: 1.05 }}>
          <Stack sx={{ height: "100%", width: "100%", padding: 0.2 }}>
            <Box
              sx={{
                height: "100%",
                width: "100%",
                backgroundColor: "#171c3a",
                borderRadius: "30px",
                padding: 4.5,
                paddingBottom:8
                
              }}
            >
              <Typography fontSize={32} fontWeight={600} color="#FFD700" mb={3}>
                Spendings
              </Typography>
              <Stack direction="column" spacing={3}>
                {spendingBreakdown.map((item, index) => (
                  <Stack
                    key={index}
                    direction="row"
                    alignItems="center"
                    spacing={2}
                  >
                    <Box
                      sx={{
                        height: 50,
                        width: 50,
                        backgroundColor: item.iconColor,
                        borderRadius: "15px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Stack>
                      <Typography fontSize={18} fontWeight={500} color="white">
                        {item.label}
                      </Typography>
                      <Typography fontSize={20} fontWeight={600} color="white">
                        {item.amount}
                      </Typography>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Stack>
        </motion.div>
      </div>

      {/* Charts & Goals Section */}
      <AssetDistribution />

      {/* Recent Transactions */}
      <RecentTransactions />

     
    </div>
  );
};

export default Dashboard;
import React, { useEffect, useState, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { supabase } from "../../src/supabase";
import { ThemeProvider, createTheme, Box, Typography, CircularProgress } from "@mui/material";

// Dark Mode Theme
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#121212",
      paper: "#1E1E1E",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b0b0b0",
    },
  },
});

// Dynamic Color Palette for More Categories
const generateColorPalette = (count) => {
  const colors = ["#F72585", "#7209B7", "#560BAD", "#480CA8", "#B5179E"];
  return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
};

const CategoryWiseExpenses = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchCategoryWiseExpenses = async () => {
      setLoading(true);
      setErrorMsg("");

      try {
        // Fetch authenticated user
        const { data: userData, error: authError } = await supabase.auth.getUser();
        if (authError || !userData?.user) {
          throw new Error("Failed to retrieve user data.");
        }

        const user = userData.user;

        // Fetch user expenses
        const { data, error } = await supabase
          .from("expenses")
          .select("category, amount")
          .eq("freelancer_id", user.id);

        if (error || !data?.length) {
          throw new Error("No expense data available.");
        }

        // Aggregate category-wise expenses
        const categoryMap = data.reduce((acc, { category, amount }) => {
          acc[category] = (acc[category] || 0) + amount;
          return acc;
        }, {});

        setChartData(
          Object.entries(categoryMap).map(([category, value]) => ({
            name: category,
            value,
          }))
        );
      } catch (error) {
        setErrorMsg(error.message);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryWiseExpenses();
  }, []);

  // Memoize Colors
  const colors = useMemo(() => generateColorPalette(chartData.length), [chartData.length]);

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", px: 5, m: 2, pt: 2 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Expenses
        </Typography>

        {/* Show Loading Indicator */}
        {loading ? (
          <CircularProgress color="secondary" />
        ) : errorMsg ? (
          <Typography variant="h6" color="error">
            {errorMsg}
          </Typography>
        ) : chartData.length > 0 ? (
          <PieChart width={500} height={500}>
            <Pie data={chartData} cx={250} cy={250} outerRadius={150} dataKey="value" label>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        ) : (
          <Typography variant="h6" color="text.secondary">
            No expense data available.
          </Typography>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default CategoryWiseExpenses;

import React, { useState, useEffect } from "react";
import BudgetingCard from "@/components/BudgetingCard";
import UnnecessaryExpenses from "@/components/UnnecessaryExpenses";
import { supabase } from "@/supabase";
import GroupedBarChart from "@/components/GroupedBarChart";
import ExpenseAnalyzer from "@/components/ExpenseAnalyzer";
import InvestmentAvenues from "@/components/InvestmentAvenues";
import HomeNav from "@/components/HomeNav";
import ChatBot from "@/components/ChatBot";
import ChatComponent from "@/components/ChatComponent";
import Spinner from "@/components/Spinner";

const FinancialAdvice = () => {
  const [balance, setBalance] = useState(null);
  const [userId, setUserId] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        console.error("Error fetching user:", userError);
        return;
      }
      const currentUserId = userData.user.id;
      setUserId(currentUserId);

      const { data, error } = await supabase
        .from("users")
        .select("totalbalance")
        .eq("id", currentUserId)
        .single();

      if (error) {
        console.error("Error fetching balance:", error);
      } else {
        setBalance(data?.totalbalance ?? 0);
        setLoading(false);
      }
    };

    fetchBalance();
  }, []);

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-[#0a0f1c] text-white" : "bg-gray-100 text-black"
      } flex flex-col items-center p-8 transition-all duration-500 ease-in-out`}
    >
      <div className="w-full mt-4">
        <HomeNav />
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="w-full flex flex-col gap-10">
          {/* Finance Header */}
          <div className="flex flex-col sm:flex-row justify-between bg-[#0a0f1c] p-4 rounded-lg animate__animated animate__fadeIn">
            <h1 className="text-4xl text-white font-sans font-bold tracking-tighter px-3 py-2 sm:py-4 sm:px-4 lg:py-4">
              Finance Advisor
            </h1>
            <div className="bg-[#0a0f1c] text-white px-6 py-6 w-full sm:w-1/3 lg:w-1/4 animate__animated animate__fadeIn animate__delay-1s">
              <BudgetingCard />
            </div>
          </div>

          {/* Unnecessary Expenses and Grouped Bar Chart - 2x2 grid on large screens */}
          <div className="hidden md:flex flex-col gap-10">
            <div className="flex flex-row gap-10">
            <UnnecessaryExpenses />
            <GroupedBarChart />
              </div>
              <div className="flex flex-row gap-10">
              <ExpenseAnalyzer />
              <InvestmentAvenues />
              </div>
            
            
            
          </div>
          <div className="flex flex-col sm:hidden gap-10">
            <UnnecessaryExpenses />
            <GroupedBarChart />
            <ExpenseAnalyzer />
            <InvestmentAvenues />
          </div>
          <ChatBot />
          {/* Chat Component */}
          <div className="animate__animated animate__fadeIn animate__delay-6s">
            <ChatComponent />
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialAdvice;

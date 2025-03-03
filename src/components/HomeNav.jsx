import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/supabase";
import { Button } from "@/components/ui/button";
import { DashboardRounded, Insights, Wallet } from "@mui/icons-material";
import { Building, Coins, Menu, X, ChevronDown } from "lucide-react";
import Spinner from "./Spinner";

const HomeNav = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch User and Balance Data
  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        throw new Error("Failed to fetch user.");
      }
      setUser(userData.user);
      await fetchBalance(userData.user.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Balance
  const fetchBalance = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("totalbalance")
        .eq("id", userId)
        .single();

      if (error) throw new Error("Failed to fetch balance.");
      setBalance(data?.totalbalance || 0);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      sessionStorage.removeItem("token");
      await supabase.auth.signOut();
      navigate("/landingpage");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="w-full bg-[#101628] shadow-lg rounded-lg p-4 ">
      <div className="flex justify-between items-center">
        {/* Left Section - Branding & Balance Info */}
        <div>
          <p className="text-gray-400 font-bold text-sm">SpendoSense</p>
          <p className="text-white font-semibold text-xl md:text-3xl">Available Balance</p>
          {loading ? (
            <div className="flex justify-center py-5 ">
            <Spinner />
          </div>
          ) : error ? (
            <p className="text-red-500 text-lg">Error: {error}</p>
          ) : (
            <p className="text-[#4A90E2] font-semibold text-2xl md:text-4xl">₹ {balance.toLocaleString()}</p>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white text-2xl">
          {menuOpen ? <X size={30} /> : <Menu size={30} />}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-3 bg-[#0a0a3e] rounded-lg py-3 px-5">
          <NavButton icon={<DashboardRounded />} text="Dashboard" onClick={() => navigate("/")} />
          <NavButton icon={<Wallet />} text="Expenses" onClick={() => navigate("/expenses")} />
          <NavButton icon={<Insights />} text="Insights" onClick={() => navigate("/insights")} />
          <NavButton icon={<Coins />} text="Income" onClick={() => navigate("/income")} />
          <NavButton icon={<Building />} text="Assets" onClick={() => navigate("/assets")} />
        </div>

        {/* Right Section - User & Logout */}
        <div className="flex items-center gap-5">
          {loading ? (
            <div className="flex justify-center py-5 ">
            <Spinner />
          </div>
          ) : user ? (
            <div className="relative">
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center text-white font-semibold">
                Hi, {user?.user_metadata?.fullname || "User"} <ChevronDown size={20} />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 bg-[#0a0a3e] shadow-md rounded-lg py-5 gap-3 text-white px-5">
                  <p className="text-sm">{user.email}</p>
                  {/* Logout button inside dropdown for small screens */}
                  <Button
                    className="bg-red-600 hover:bg-red-700 px-2  text-white rounded-lg mt-2"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-white">Not logged in</p>
          )}
          {/* Logout button for wide screens */}
          {user && (
            <Button
              className="hidden md:block bg-red-600 hover:bg-red-700 px-4 py-2 text-white rounded-lg"
              onClick={handleLogout}
            >
              Logout
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden flex flex-col items-center gap-3 mt-3 bg-[#0a0a3e] rounded-lg py-3 px-3">
          <NavButton icon={<DashboardRounded />} text="Dashboard" onClick={() => navigate("/")} />
          <NavButton icon={<Wallet />} text="Expenses" onClick={() => navigate("/expenses")} />
          <NavButton icon={<Insights />} text="Insights" onClick={() => navigate("/insights")} />
          <NavButton icon={<Coins />} text="Income" onClick={() => navigate("/income")} />
          <NavButton icon={<Building />} text="Assets" onClick={() => navigate("/assets")} />
          {/* Logout button removed from here, since it should only appear in dropdown */}
        </div>
      )}
    </nav>
  );
};

const NavButton = ({ icon, text, onClick }) => (
  <Button className="flex gap-2 bg-[#0d0d51] p-2 rounded-lg w-full md:w-auto" onClick={onClick}>
    {icon}
    <p className="text-white font-semibold text-sm md:text-base">{text}</p>
  </Button>
);

export default HomeNav;

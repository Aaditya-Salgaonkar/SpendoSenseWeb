import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HomeNav from "@/components/HomeNav";
import PaymentForm from "../components/paymentForm";
import PaymentModal from "../components/paymentModal";
import PaymentConfirmation from "../components/paymentConfirmation";
import { Box } from "@mui/material";
import { supabase } from "@/supabase";
import categories from "./categories";

export default function PaymentScreen() {
  const navigate = useNavigate();

  // Store user info to avoid multiple fetches
  const [user, setUser] = useState(null);
  const [total, setTotal] = useState(0);
  const [merchantName, setMerchantName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [googlePayType, setGooglePayType] = useState("phone");
  const [modal, showModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [UPI, setUPI] = useState("");
  const [categoryId, setCategoryId] = useState(
    "1e5d4e32-9b42-493a-af2e-dfa17d290255"
  );

  // Fetch User & Balance Once
  useEffect(() => {
    async function fetchUserAndBalance() {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        console.error("Authentication error:", error);
        return;
      }

      setUser(user);

      // Fetch user balance
      const { data, error: balanceError } = await supabase
        .from("users")
        .select("totalbalance")
        .eq("id", user.id)
        .single();

      if (balanceError) {
        console.error("Error fetching balance:", balanceError.message);
      } else {
        setTotal(data?.totalbalance || 0);
      }
    }

    fetchUserAndBalance();
  }, []);

  function findCategoryByMerchant(merchant) {
    const lowerMerchant = merchant.toLowerCase();
    for (const category of categories) {
      if (category.keywords.some((keyword) => lowerMerchant.includes(keyword))) {
        return category.id;
      }
    }
    return null;
  }

  async function addTransaction() {
    if (!user) return;

    // Determine correct category ID
    const detectedCategoryId = findCategoryByMerchant(merchantName) || categoryId;

    const { data, error } = await supabase.from("transactions").insert([
      {
        userid: user.id,
        upiid: UPI,
        amount: Number(amount),
        merchantName,
        categoryid: detectedCategoryId,
        transactiontime: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Error inserting transaction:", error);
    } else {
      console.log("Transaction added successfully:", data);
    }
  }

  async function updateBalance() {
    if (!user) return;

    const newBalance = total - Number(amount);

    const { error } = await supabase
      .from("users")
      .update({ totalbalance: newBalance })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating balance:", error.message);
    } else {
      setTotal(newBalance);
    }
  }

  useEffect(() => {
    if (paymentComplete) {
      addTransaction();
      updateBalance();
      setTimeout(() => {
        showModal(false);
      }, 1000);
    }
  }, [paymentComplete]);

  const handlePaymentChange = (method) => setPaymentMethod(method);
  const handleGooglePayTypeChange = (type) => setGooglePayType(type);

  const handleSubmit = (e) => {
    e.preventDefault();
    showModal(true);
  };

  const closeModal = () => {
    showModal(false);
    setPaymentStatus("");
  };

  const handleConfirmPayment = () => {
    setPaymentStatus("processing");
    setTimeout(() => {
      setPaymentStatus("confirmed");
      setTimeout(() => {
        setPaymentComplete(true);
      }, 1500);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white flex flex-col items-center p-8">
      <HomeNav />
      <Box
        sx={{
          height: "100%",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {paymentComplete ? (
          <PaymentConfirmation amount={amount} paymentMethod={paymentMethod} />
        ) : (
          <>
            <PaymentForm
              UPI={UPI}
              setUPI={setUPI}
              merchantName={merchantName}
              setMerchantName={setMerchantName}
              paymentMethod={paymentMethod}
              googlePayType={googlePayType}
              handlePaymentChange={handlePaymentChange}
              handleGooglePayTypeChange={handleGooglePayTypeChange}
              handleSubmit={handleSubmit}
            />
            <PaymentModal
              show={modal}
              amount={amount}
              paymentStatus={paymentStatus}
              setAmount={setAmount}
              handleConfirmPayment={handleConfirmPayment}
              closeModal={closeModal}
            />
          </>
        )}
      </Box>
    </div>
  );
}

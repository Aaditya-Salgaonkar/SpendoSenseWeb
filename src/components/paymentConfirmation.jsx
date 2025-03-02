import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const PaymentConfirmation = ({ amount = 0, paymentMethod = "Unknown" }) => {
  const [seconds, setSeconds] = useState(3);
  const navigate = useNavigate();

  useEffect(() => {
    if (seconds <= 0) {
      navigate("/dashboard");
      return;
    }

    const timer = setTimeout(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [seconds, navigate]);

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      sx={{
        mt: 4,
        p: 3,
        borderRadius: "10px",
        backgroundColor: "#171c3a",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
        textAlign: "center",
        color: "white",
        maxWidth: "400px",
        mx: "auto",
      }}
    >
      <Typography variant="h5" fontWeight={600} color="#4A90E2" gutterBottom>
        Payment Successful 🎉
      </Typography>
      <Typography variant="body1" fontSize={18}>
        Your payment of <strong>${parseFloat(amount).toFixed(2)}</strong> via{" "}
        <strong>{paymentMethod}</strong> has been successfully processed.
      </Typography>
      <Typography variant="body2" mt={2} fontSize={16}>
        Redirecting to your dashboard in <strong>{seconds}</strong>{" "}
        second{seconds !== 1 ? "s" : ""}...
      </Typography>
    </Box>
  );
};

export default PaymentConfirmation;

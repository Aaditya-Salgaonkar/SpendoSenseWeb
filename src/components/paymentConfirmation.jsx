import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Import the hook

const PaymentConfirmation = ({ amount, paymentMethod }) => {
  const [seconds, setSeconds] = useState(3); // Countdown timer (starting at 3 seconds)
  const navigate = useNavigate(); // Use navigate hook

  useEffect(() => {
    // If countdown reaches 0, navigate to dashboard
    if (seconds === 0) {
      navigate("/dashboard");
    }

    // Set interval for countdown decrement every second
    const timer = setInterval(() => {
      if (seconds > 0) {
        setSeconds((prevSeconds) => prevSeconds - 1); // Decrease seconds
      }
    }, 1000); // 1 second interval

    // Cleanup interval on component unmount
    return () => clearInterval(timer);
  }, [seconds, navigate]);

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{
        mt: 4,
        p: 3,
        borderRadius: "8px",
        backgroundColor: "#171c3a",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
        textAlign: "center",
        color: "white",
      }}
    >
      <Typography variant="h5" fontWeight={600} color="#4A90E2" gutterBottom>
        Payment Successful
      </Typography>
      <Typography variant="body1">
        Your payment of <strong>${amount}</strong> via{" "}
        <strong>{paymentMethod}</strong> has been successfully processed.
      </Typography>
      <Typography variant="body2" mt={2}>
        Redirecting to your dashboard in <strong>{seconds}</strong> second{seconds !== 1 ? "s" : ""}
      </Typography>
    </Box>
  );
};

export default PaymentConfirmation;

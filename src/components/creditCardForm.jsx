import React, { useState } from "react";
import { Box, Typography, TextField } from "@mui/material";

const fieldStyles = {
  backgroundColor: "#171c3a",
  color: "white",
  borderRadius: "4px",
  "& .MuiOutlinedInput-root": {
    color: "white",
    "& fieldset": { borderColor: "white" },
    "&:hover fieldset": { borderColor: "lightblue" },
    "&.Mui-focused fieldset": { borderColor: "cyan" },
    "& input::placeholder": { color: "gray" },
  },
  "& .MuiInputLabel-root": {
    color: "gray",
    "&.Mui-focused": { color: "cyan" },
  },
};

const CreditCardForm = ({ merchantName, setMerchantName }) => {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const formatCardNumber = (value) => {
    return value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})/g, "$1 ").trim();
  };

  const formatExpiryDate = (value) => {
    return value.replace(/\D/g, "").slice(0, 4).replace(/(\d{2})/, "$1/");
  };

  const formatCvv = (value) => value.replace(/\D/g, "").slice(0, 3);

  return (
    <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: "16px" }}>
      <Typography variant="h6" sx={{ textAlign: "center", mb: "8px", color: "white" }} fontWeight={600}>
        Credit Card Details
      </Typography>

      <TextField
        fullWidth
        label="Merchant Name"
        placeholder="John Doe"
        variant="outlined"
        required
        value={merchantName}
        onChange={(e) => setMerchantName(e.target.value)}
        sx={fieldStyles}
      />
      <TextField
        fullWidth
        label="Card Number"
        placeholder="1234 5678 9012 3456"
        variant="outlined"
        required
        inputProps={{ maxLength: 19, inputMode: "numeric" }}
        value={cardNumber}
        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
        sx={fieldStyles}
      />
      <TextField
        fullWidth
        label="Expiry Date"
        placeholder="MM/YY"
        variant="outlined"
        required
        inputProps={{ maxLength: 5, inputMode: "numeric" }}
        value={expiryDate}
        onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
        sx={fieldStyles}
      />
      <TextField
        fullWidth
        label="CVV"
        placeholder="123"
        variant="outlined"
        required
        inputProps={{ maxLength: 3, inputMode: "numeric" }}
        value={cvv}
        onChange={(e) => setCvv(formatCvv(e.target.value))}
        sx={fieldStyles}
      />
    </Box>
  );
};

export default CreditCardForm;

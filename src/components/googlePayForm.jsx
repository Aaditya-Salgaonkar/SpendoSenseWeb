import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";

const GooglePayForm = ({ UPI, setUPI, merchantName, setMerchantName, googlePayType, handleTypeChange }) => {
  const [upiError, setUpiError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const fieldStyles = {
    backgroundColor: "#171c3a",
    color: "white",
    borderRadius: "4px",
    "& .MuiOutlinedInput-root": {
      color: "white",
      "& fieldset": { borderColor: "white" },
      "&:hover fieldset": { borderColor: "lightblue" },
      "&.Mui-focused fieldset": { borderColor: "cyan" },
      "& input::placeholder": { color: "white" },
    },
    "& .MuiInputLabel-root": {
      color: "gray",
      "&.Mui-focused": { color: "cyan" },
    },
  };

  // ✅ Validate Phone Number Format
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      setPhoneError("Enter a valid phone number (e.g., +91 9876543210)");
    } else {
      setPhoneError("");
    }
    setUPI(phone);
  };

  // ✅ Validate UPI ID Format
  const validateUPI = (upi) => {
    const upiRegex = /^[a-zA-Z0-9.-]+@[a-zA-Z]+$/;
    if (!upiRegex.test(upi)) {
      setUpiError("Enter a valid UPI ID (e.g., example@bank)");
    } else {
      setUpiError("");
    }
    setUPI(upi);
  };

  return (
    <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: "16px" }}>
      <Typography variant="h6" align="center" sx={{ color: "white" }} fontWeight={600}>
        Google Pay Details
      </Typography>

      {/* Merchant Name Field */}
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

      {/* Login Type Selection */}
      <FormControl fullWidth sx={{ mb: "16px" }}>
        <InputLabel
          id="google-pay-type-label"
          sx={{
            display: "block",
            color: "white",
            "&.Mui-focused": { color: "cyan" },
            "&.MuiFormLabel-filled": { color: "cyan" },
          }}
        >
          Login Type
        </InputLabel>
        <Select
          labelId="google-pay-type-label"
          id="googlePayType"
          value={googlePayType}
          label="Login Type"
          onChange={(e) => handleTypeChange(e.target.value)}
          required
          sx={{
            width: "100%",
            borderRadius: "6px",
            color: "white",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "white" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "lightblue" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "cyan" },
          }}
        >
          <MenuItem value="phone">Phone Number</MenuItem>
          <MenuItem value="id">Google Pay ID</MenuItem>
        </Select>
      </FormControl>

      {/* Dynamic Input Field (Phone Number or UPI ID) */}
      {googlePayType === "phone" ? (
        <TextField
          fullWidth
          label="Phone Number"
          value={UPI}
          onChange={(e) => validatePhoneNumber(e.target.value)}
          placeholder="+91 9876543210"
          variant="outlined"
          type="tel"
          required
          sx={fieldStyles}
          error={Boolean(phoneError)}
          helperText={phoneError}
        />
      ) : (
        <TextField
          fullWidth
          label="Google Pay ID"
          value={UPI}
          onChange={(e) => validateUPI(e.target.value)}
          placeholder="example@bank"
          variant="outlined"
          required
          sx={fieldStyles}
          error={Boolean(upiError)}
          helperText={upiError}
        />
      )}
    </Box>
  );
};

export default GooglePayForm;

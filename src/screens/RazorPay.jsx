import React, { useEffect } from "react";

const PayPalButton = ({ amount, onSuccess, onError }) => {
  useEffect(() => {
    const PAYPAL_SCRIPT_URL = `https://www.paypal.com/sdk/js?client-id=${process.env.REACT_APP_PAYPAL_CLIENT_ID}&components=buttons`;

    const existingScript = document.querySelector(`script[src="${PAYPAL_SCRIPT_URL}"]`);

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = PAYPAL_SCRIPT_URL;
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => initializePayPal();
      return () => document.body.removeChild(script);
    } else {
      initializePayPal();
    }
  }, []);

  function initializePayPal() {
    if (window.paypal) {
      window.paypal
        .Buttons({
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [{ amount: { value: amount } }],
            });
          },
          onApprove: (data, actions) => {
            return actions.order.capture().then((details) => {
              onSuccess(details);
            });
          },
          onError: (err) => {
            console.error("PayPal Error:", err);
            if (onError) onError(err);
          },
        })
        .render("#paypal-button-container");
    }
  }

  return <div id="paypal-button-container"></div>;
};

export default PayPalButton;

import React, { useState } from "react";
import { Chat } from "@mui/icons-material";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { askGemini } from "../api/geminiService";
import { CircularProgress } from "@mui/material";

const ChatBot = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  
  const AnswerQuery = async (prompt) => {
    setLoading(true);
    setResponse(""); // Clear previous response

    try {
      const aiResponse = await askGemini(
        `Answer this user query within the domain of our website: "${prompt}". Be concise (max 100 words).`
      );

      setResponse(aiResponse || "No response received. Try again.");
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setResponse("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!prompt.trim()) return;
    AnswerQuery(prompt);
    setPrompt(""); // Clear input after submission
  };

  return (
    <div className="fixed bottom-6 right-6">
      {/* Tooltip on Hover */}
      {showTooltip && (
        <div className="absolute bottom-20 right-1/2 translate-x-1/2 bg-black text-white text-xs px-3 py-1 rounded-lg shadow-lg w-40 text-center opacity-90 animate-fadeIn">
          Chat with SpendoSense AI
        </div>
      )}

      {/* Chatbot Trigger Button */}
      <Dialog>
        <DialogTrigger asChild>
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 rounded-full shadow-xl cursor-pointer flex items-center justify-center w-16 h-16 hover:scale-110 transition-transform duration-300 ease-in-out"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <Chat fontSize="large" />
          </div>
        </DialogTrigger>

        {/* Chat Window */}
        <DialogContent className="max-w-md bg-[#0a0f1c] rounded-xl shadow-xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-center text-blue-700 mb-3">
            SpendoSense AI
          </h2>
          <p className="text-white text-center text-sm mb-4">
            Ask anything related to your financial insights!
          </p>

          <div className="flex flex-col gap-4">
            <Input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Type your question..."
              className="text-white w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
            />
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold py-2 rounded-lg shadow-md transition-all duration-300"
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : "Submit"}
            </Button>
            {response && (
              <div className="p-3 bg-[#1a1f2e] rounded-lg border border-gray-300 text-white shadow-inner">
                <p className="text-sm">{response}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatBot;

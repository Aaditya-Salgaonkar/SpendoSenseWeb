import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { FaApple, FaGooglePlay, FaChartLine, FaUserShield, FaRobot } from "react-icons/fa";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const [subscribed, setSubscribed] = useState(false);
  const navigate = useNavigate();

  const handleSubscribe = () => {
    setSubscribed(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white flex flex-col items-center px-6 md:px-16">
      <Navbar />

      {/* Hero Section */}
      <motion.header 
        initial={{ opacity: 0, y: -50 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 1 }}
        className="w-full max-w-6xl py-12 text-center"
      >
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text mt-10">
          The Future of Smart Finance
        </h1>
        <p className="mt-10 text-lg md:text-xl text-gray-300">
          Automate your financial planning with AI-driven insights and real-time analytics.
        </p>
        <div className="mt-20 flex gap-4 justify-center">
          <Button className="px-6 py-3 text-lg bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/signup')}>Get Started</Button>
        </div>
      </motion.header>

      {/* Features Section */}
      <section className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {[ 
          { title: "AI-Driven Insights", desc: "Get personalized financial recommendations.", icon: <FaRobot /> },
          { title: "Automated Expense Tracking", desc: "Categorize and analyze your spending effortlessly.", icon: <FaChartLine /> },
          { title: "Secure Transactions", desc: "State-of-the-art encryption for your financial data.", icon: <FaUserShield /> }
        ].map((feature, index) => (
          <motion.div 
            key={index} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            <Card className="p-6 bg-gray-900 shadow-lg text-center max-h-40">
              <CardContent>
                <div className="flex flex-row items-center justify-center gap-2">
                  <div className="text-4xl text-blue-400 mx-auto ">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-blue-400">{feature.title}</h3>
                </div>
                <p className="mt-2 text-gray-400">{feature.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>

      {/* Dashboard Preview */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 1 }}
        className="w-full max-w-4xl text-center mt-16"
      >
        <h2 className="text-3xl font-bold text-blue-300 mt-5">Live Expense Insights</h2>
        <p className="mt-2 text-gray-400 mb-2">Visualize your expenses dynamically.</p>
        <Box>
          <img src="../src/assets/dash.png" alt="Example" style={{ width: '100%', height: 'auto' }} />
        </Box>
      </motion.section>

      {/* Testimonials */}
<motion.section 
  initial={{ opacity: 0, y: 50 }} 
  animate={{ opacity: 1, y: 0 }} 
  transition={{ duration: 1.2 }}
  className="w-full max-w-5xl text-center mt-16"
>
  <h2 className="text-3xl font-bold text-blue-300">What Our Users Say</h2>
  <p className="mt-2 text-gray-400">Real feedback from satisfied users.</p>

  {/* Testimonial Cards */}
  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[ 
      {
        name: "James Smith",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        title: "Finance Expert",
        text: "This app completely transformed the way I manage my finances. The AI insights are incredibly accurate, and the automated tracking is a game changer!",
      },
      {
        name: "Emma Johnson",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        title: "Entrepreneur",
        text: "I’ve been using this platform for months, and it helps me track my expenses effortlessly. I love the real-time analytics—it’s everything I need!",
      },
      {
        name: "Michael Brown",
        avatar: "https://randomuser.me/api/portraits/men/58.jpg",
        title: "Small Business Owner",
        text: "As a small business owner, I needed something to simplify my financial management. This tool does just that, and the security is top-notch!",
      },
    ].map((testimonial, index) => (
      <motion.div 
        key={index} 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: index * 0.2 }}
        className="bg-gray-800 p-6 rounded-lg shadow-lg"
      >
        <div className="flex items-center gap-4">
          <img 
            src={testimonial.avatar} 
            alt={testimonial.name} 
            className="w-16 h-16 rounded-full border-2 border-blue-500"
          />
          <div>
            <h3 className="text-xl font-semibold text-blue-400">{testimonial.name}</h3>
            <p className="text-sm text-gray-400">{testimonial.title}</p>
          </div>
        </div>
        <p className="mt-4 text-gray-300 italic">"{testimonial.text}"</p>
      </motion.div>
    ))}
  </div>
</motion.section>


      {/* Footer */}
      <footer className="w-full max-w-5xl text-center mt-16 mb-12">
        <h2 className="text-2xl font-semibold text-blue-400">Sign Up For Our Newsletters</h2>

        {/* Show "Subscribed" after clicking the subscribe button */}
        {!subscribed ? (
          <Button 
            className="mt-4 px-6 py-3 text-lg bg-purple-600 hover:bg-purple-700" 
            onClick={handleSubscribe}
          >
            Subscribe Now
          </Button>
        ) : (
          <motion.div 
            className="mt-4 text-xl font-semibold text-green-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            Subscribed! Thank you for joining us.
          </motion.div>
        )}
      </footer>
    </div>
  );
}

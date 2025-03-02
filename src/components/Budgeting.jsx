import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { supabase } from "../supabase"; // Ensure Supabase is set up

const Budgeting = () => {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !amount) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("Authentication error:", authError);
        return;
      }

      const { error } = await supabase.from("budgets").insert([
        { userid: user.id, category, amount: parseFloat(amount) },
      ]);

      if (error) throw error;

      alert("Budget added successfully!");
      setCategory("");
      setAmount("");
    } catch (error) {
      console.error("Error adding budget:", error);
      alert("Failed to add budget.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0f1c] text-white px-6">
      <Card className="w-[350px] bg-[#101628] text-white">
        <CardHeader>
          <CardTitle>Set Your Budget</CardTitle>
          <CardDescription>Plan your expenses effectively.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="amount">Budget Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <Select onValueChange={setCategory} required>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="Rent">Rent</SelectItem>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Savings">Savings</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <CardFooter className="flex justify-between mt-4">
              <Button variant="outline" className="text-white">Cancel</Button>
              <Button type="submit">Save Budget</Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Budgeting;

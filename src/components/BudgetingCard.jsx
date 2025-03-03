import React, { useState, useEffect } from "react";
import { supabase } from "../supabase"; // Ensure the correct import path
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const BudgetingDialog = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [amount, setAmount] = useState("");

  // Fetch Categories and User ID
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
          console.error("Error fetching user:", userError);
          setLoading(false);
          return;
        }

        const currentUserId = userData.user.id;
        setUserId(currentUserId);

        const { data, error } = await supabase.from("categories").select("id, name");

        if (error) {
          console.error("Error fetching categories:", error);
        } else {
          setCategories(data);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Function to Save Budget
  const handleSaveBudget = async () => {
    if (!selectedCategory || !amount) {
      alert("Please select a category and enter an amount.");
      return;
    }
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("budgets").insert([
        {
          userid: userId,
          categoryid: selectedCategory,
          amount: parseFloat(amount),
        },
      ]);

      if (error) throw error;

      alert("Budget saved successfully!");
      setOpen(false);
      setSelectedCategory("");
      setAmount("");
    } catch (error) {
      console.error("Error saving budget:", error);
      alert("Failed to save budget. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Button to Open Dialog */}
      <Button
        className="w-full sm:w-auto bg-blue-700 text-white px-6 py-2 rounded-md mb-4 sm:mb-0"
        onClick={() => setOpen(true)}
      >
        + Add Budget
      </Button>

      {/* Dialog Component */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#101628] text-white w-[90%] sm:w-[400px] p-6 rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Create a Budget</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Set targets for monitoring your expenses.
            </DialogDescription>
          </DialogHeader>

          <CardContent>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              
              {/* Category Selection */}
              <div className="flex flex-col space-y-2">
                <Label htmlFor="categories" className="text-sm sm:text-base">Category</Label>
                <Select onValueChange={setSelectedCategory} disabled={loading}>
                  <SelectTrigger id="categories" className="h-10 sm:h-12">
                    <SelectValue placeholder={loading ? "Loading..." : "Select a category"} />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <SelectItem key={category.id} value={category.id} className="text-sm sm:text-base">
                          {category.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled className="text-sm sm:text-base">
                        {loading ? "Loading..." : "No categories found"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount Input */}
              <div className="flex flex-col space-y-2">
                <Label htmlFor="amount" className="text-sm sm:text-base">Amount</Label>
                <Input
                  id="amount"
                  placeholder="Enter the amount"
                  type="number"
                  className="h-10 sm:h-12 text-sm sm:text-base"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

            </form>
          </CardContent>

          {/* Dialog Footer */}
          <DialogFooter className="flex justify-end gap-3">
            <Button variant="outline" className="text-black border-gray-400" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBudget} disabled={saving} className="bg-blue-600">
              {saving ? "Saving..." : "Save Budget"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BudgetingDialog;

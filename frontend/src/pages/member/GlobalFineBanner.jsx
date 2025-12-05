
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectAuthUser } from "@/features/auth/authSlice";

const API_BASE = "http://localhost:4000/api";

const GlobalFineBanner = () => {
  const user = useSelector(selectAuthUser);
  const [fineTotal, setFineTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    
    if (!user || user.role !== "member") {
      setFineTotal(0);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchFines = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/fines/myfines`, {
          method: "GET",
          credentials: "include",
          signal,
        });
        // handle JSON parse safely
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg = data?.message || "Failed to fetch fines";
          throw new Error(msg);
        }
        // backend: total_due expected; fallback to 0
        setFineTotal(Number(data.total_due || 0));
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("GlobalFineBanner fetch error:", err);
        setError(err.message || "Error fetching fines");
        setFineTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchFines();

  
    return () => controller.abort();
  }, [user]); 

 
  if (loading) return null;
  if (!user || user.role !== "member") return null;
  if (error) return null; 

  if (Number(fineTotal) > 0) {
    return (
      <div className="w-full bg-red-600 text-white text-center py-3 font-semibold">
        You have outstanding fines: {Number(fineTotal).toFixed(2)} — Please visit the
        library to return your book and pay your fine.
      </div>
    );
  }

  return null;
};

export default GlobalFineBanner;

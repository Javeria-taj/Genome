import { useState, useCallback } from "react";
import axios from "axios";
import { YearlyClimateData } from "@/types/climate";
import toast from "react-hot-toast";

export function useClimateData() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<YearlyClimateData[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchClimateData = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/climate?lat=${lat}&lng=${lng}`);
      setData(res.data);
      toast.success("Telemetry sync complete");
      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.error || "API limit reached or network error";
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchClimateData };
}

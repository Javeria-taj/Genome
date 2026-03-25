import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { YearlyClimateData } from "@/types/climate";
import toast from "react-hot-toast";

export function useClimateData(lat: number | null, lng: number | null) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<YearlyClimateData[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchClimateData = useCallback(async (latitude: number, longitude: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/climate?lat=${latitude}&lng=${longitude}`);
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

  useEffect(() => {
    if (lat !== null && lng !== null) {
      fetchClimateData(lat, lng);
    } else {
      setData(null);
    }
  }, [lat, lng, fetchClimateData]);

  const refetch = useCallback(() => {
    if (lat !== null && lng !== null) fetchClimateData(lat, lng);
  }, [lat, lng, fetchClimateData]);

  return { data, loading, error, refetch, fetchClimateData };
}

import { useState } from "react";

export function useFetchAndLoad() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callEndpoint = async (promise) => {
    setLoading(true);
    setError(null);
    try {
      const response = await promise;
      setLoading(false);
      return response;
    } catch (err) {
      setLoading(false);
      setError(err?.response?.data?.message || err?.message || "Error desconocido");
      throw err;
    }
  };

  return { loading, error, callEndpoint };
}

import { useState } from "react";
import { useAuth } from "@clerk/react";

export function useUpgradePortal() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.url) (window.top || window).location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  return { openPortal, loading };
}

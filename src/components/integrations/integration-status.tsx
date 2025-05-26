"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export function IntegrationStatus() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const success = searchParams.get("success");

  useEffect(() => {
    if (error) {
      toast.error(decodeURIComponent(error));
    }
    if (success) {
      toast.success("Integration successful!");
    }
  }, [error, success]);

  return null;
}

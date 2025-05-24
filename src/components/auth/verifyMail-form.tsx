"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Authcard from "./authcard";
import { useCallback, useEffect } from "react";
import axios from "axios";
import { CardFooter } from "../ui/card";
import { toast } from "sonner";
import Link from "next/link";

function VerifyMailForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");

  console.log(token);

  const onSubmit = useCallback(async () => {
    if (!token) {
      toast.error("Token is missing");
      return;
    }

    try {
      const response = await axios.post(`api/verify-mail`, { token });

      if (response.data.success) {
        toast.success(response.data.success);
      }
      if (response.data.error) {
        toast.error(response.data.error);
      }

      if (response.status === 200) {
        router.push("/signin");
      }

      return response;
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Verification failed");
      return;
    }
  }, [token, router]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <Authcard header='Verifying mail please wait..'>
      <div className='w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin'></div>
      <CardFooter>
        {" "}
        <Link href={"/signin"}>Signin</Link>
      </CardFooter>
    </Authcard>
  );
}

export default VerifyMailForm;

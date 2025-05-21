"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Authcard from "./authcard";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { CardFooter } from "../ui/card";
import FormError from "./formError";
import FormSuccess from "./formSuccess";

function VerifyMailForm() {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const router = useRouter();

  const params = useSearchParams();
  const token = params.get("token");

  const onSubmit = useCallback(async () => {
    if (!token) {
      setError("Token is missing");
      return;
    }

    try {
      const response = await axios.post(`api/verify-mail`, { token });

      if (response.data.success) {
        setSuccess(success);
      }
      if (response.data.error) {
        setError(error);
      }

      if (response.status === 200) {
        router.push("/signin");
      }

      return response;
    } catch (error) {
      // @ts-expect-error error i sent by backend if ther is any
      setError(error?.response?.data?.error);
      return;
    }
  }, [token, error, router, success]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <Authcard header='Verifying mail please wait..'>
      <div className='w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin'></div>
      <CardFooter>
        {" "}
        <FormError message={error} />
        <FormSuccess message={success} />
      </CardFooter>
    </Authcard>
  );
}

export default VerifyMailForm;

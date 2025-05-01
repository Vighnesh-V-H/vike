"use client";

import { useSearchParams } from "next/navigation";
import Authcard from "./authcard";

function VerifyMailForm() {
  const params = useSearchParams();
  const token = params.get("token");

  return (
    <Authcard header='Verifying mail please wait..'>
      <div className='w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin'></div>
    </Authcard>
  );
}

export default VerifyMailForm;

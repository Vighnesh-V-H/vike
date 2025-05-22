"use client";
import Authcard from "@/components/auth/authcard";
import VerifyMailForm from "@/components/auth/verifyMail-form";
import { Suspense } from "react";

function VerifyMail() {
  return (
    <Authcard header='Verifying mail..'>
      <Suspense fallback={<div>Loading...</div>}>
        <VerifyMailForm />
      </Suspense>
    </Authcard>
  );
}

export default VerifyMail;

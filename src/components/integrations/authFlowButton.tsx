"use client";

import GoogleAuthButton from "@/components/integrations/buttons/google-auth-button";
import ExcelAuthButton from "@/components/integrations/buttons/excel-auth-button";

function AuthFlowButton({ name }: { name: string }) {
  switch (name.toLowerCase()) {
    case "google":
      return <GoogleAuthButton />;

    default:
      return <div>Coming Soon</div>;
  }
}

export default AuthFlowButton;

"use client";

import GoogleAuthButton from "@/components/integrations/buttons/google-auth-button";

interface buttonType {
  name: string;
}

function AuthFlowButton({ name }: { name: string }) {
  switch (name) {
    case "google":
      return <GoogleAuthButton />;
    default:
      return <div>hi</div>;
  }
}

export default AuthFlowButton;

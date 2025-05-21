"use client";

import GoogleAuthButton from "@/components/integrations/buttons/google-auth-button";



function AuthFlowButton({ name }: { name: string }) {
  switch (name) {
    case "google":
      return <GoogleAuthButton />;
    default:
      return <div>Coming Soon</div>;
  }
}

export default AuthFlowButton;

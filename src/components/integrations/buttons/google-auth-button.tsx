"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, ExternalLink } from "lucide-react";
import axios from "axios";
import { scopes } from "@/lib/constants";

function GoogleAuthButton() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the connection status when component mounts
    const checkConnectionStatus = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/api/integrations/status/google");

        if (response.status !== 200) {
          throw new Error("Failed to fetch connection status");
        }

        const data = response.data;
        setIsConnected(data.isConnected);
      } catch (err) {
        console.error("Error checking Google connection:", err);
        setError("Failed to check connection status");
      } finally {
        setIsLoading(false);
      }
    };

    checkConnectionStatus();
  }, []);

  const initiateOAuth = () => {
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!,
      response_type: "code",
      scope: scopes,
      access_type: "offline",
      prompt: "consent",
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  };

  if (isLoading) {
    return (
      <Button disabled className='cursor-not-allowed'>
        Checking...
      </Button>
    );
  }

  if (error) {
    return (
      <Button variant='destructive' className='cursor-not-allowed'>
        Error
      </Button>
    );
  }

  if (isConnected) {
    return (
      <div className='flex items-center gap-2'>
        <Button
          // variant='outline'
          className='bg-black text-green-700 border-green-200 hover:bg-green-100'
          disabled={true}>
          <CheckCircle className='mr-2 h-4 w-4' />
          Connected
        </Button>
      </div>
    );
  }

  return (
    <Link href={initiateOAuth()}>
      <Button className='cursor-pointer'>
        Connect
        <ExternalLink className='ml-2 h-4 w-4' />
      </Button>
    </Link>
  );
}

export default GoogleAuthButton;

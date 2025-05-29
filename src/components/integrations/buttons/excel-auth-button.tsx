"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, ExternalLink } from "lucide-react";
import axios from "axios";

function ExcelAuthButton() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the connection status when component mounts
    const checkConnectionStatus = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/api/integrations/status/excel");

        if (response.status !== 200) {
          throw new Error("Failed to fetch connection status");
        }

        const data = response.data;
        setIsConnected(data.isConnected);
      } catch (err) {
        console.error("Error checking Excel connection:", err);
        setError("Failed to check connection status");
      } finally {
        setIsLoading(false);
      }
    };

    checkConnectionStatus();
  }, []);

  const initiateOAuth = () => {
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID!,
      redirect_uri: process.env.NEXT_PUBLIC_MICROSOFT_REDIRECT_URI!,
      response_type: "code",
      scope:
        "files.readwrite files.readwrite.all sites.readwrite.all offline_access",
      access_type: "offline",
      prompt: "consent",
    });

    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`;
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

export default ExcelAuthButton;

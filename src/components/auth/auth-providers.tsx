import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { signIn } from "next-auth/react";

import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { Button } from "@/components/ui/button";

function handleClick(provider: "google" | "github") {
  signIn(provider, {
    callbackUrl: DEFAULT_LOGIN_REDIRECT,
  });
}

function AuthProviders() {
  return (
    <div className='flex  gap-2 w-full'>
      <Button
        size='default'
        variant='outline'
        className='bg-black w-full hover:bg-[#151515de]'
        onClick={() => handleClick("google")}>
        <FcGoogle className='h-5 w-5' />
      </Button>
      <Button
        size='default'
        variant='outline'
        className=' bg-black w-full hover:bg-[#151515de]'
        onClick={() => handleClick("github")}>
        <FaGithub className='h-5 text-white w-5' />
      </Button>
    </div>
  );
}

export default AuthProviders;

import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ReactNode } from "react";
import AuthProviders from "./auth-providers";

interface AuthCard {
  header: string;
  footertext?: string;
  footerlink?: string;
  children: ReactNode;
  showAuthProvider?: boolean;
}

function Authcard({
  header,
  showAuthProvider,
  footertext,
  footerlink,
  children,
}: AuthCard) {
  return (
    <Card className='dark:bg-[#171717] bg-white sm:w-[400px] '>
      <CardHeader>
        <CardTitle>{header} </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
      {showAuthProvider && (
        <CardFooter className=' ml-5 w-1/2'>
          <AuthProviders />
        </CardFooter>
      )}

      <CardFooter>
        <Link href={footerlink || ""} className='hover:opacity-100 opacity-70'>
          {footertext}
        </Link>
      </CardFooter>
    </Card>
  );
}

export default Authcard;

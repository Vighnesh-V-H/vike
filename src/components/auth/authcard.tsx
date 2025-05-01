import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ReactNode } from "react";

interface AuthCard {
  header: string;
  footertext?: string;
  footerlink?: string;
  children: ReactNode;
}

function Authcard({ header, footertext, footerlink, children }: AuthCard) {
  return (
    <Card className='dark:bg-[#171717] bg-white'>
      <CardHeader>
        <CardTitle>{header} </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>

      <CardFooter>
        <Link href={footerlink || ""} className='hover:opacity-100 opacity-70'>
          {footertext}
        </Link>
      </CardFooter>
    </Card>
  );
}

export default Authcard;

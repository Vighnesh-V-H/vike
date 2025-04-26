// app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SignInSchema } from "@/lib/schema";
import { getUserByEmail } from "@/lib/userQueries";
import { generateVerificationToken } from "@/lib/token";
// import { sendVerificationEmail } from "@/lib/mail";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn } from "@/auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validatedFields = SignInSchema.safeParse(body);

  if (!validatedFields.success) {
    return NextResponse.json({ error: "Invalid Credentials" }, { status: 400 });
  }

  const { email, password } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return NextResponse.json(
      { error: "Email does not exist" },
      { status: 400 }
    );
  }

  //   if (!existingUser.emailVerified) {
  //     const verificationToken = await generateVerificationToken(email);
  //     await sendVerificationEmail(
  //       verificationToken.email,
  //       verificationToken.token
  //     );

  //     return NextResponse.json(
  //       { success: "Confirmation email sent" },
  //       { status: 200 }
  //     );
  //   }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });

    return NextResponse.redirect(DEFAULT_LOGIN_REDIRECT);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.message) {
        case "CredentialsSignin":
          return NextResponse.json(
            { error: "Invalid Credentials" },
            { status: 400 }
          );
        default:
          return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
          );
      }
    }

    throw error;
  }
}

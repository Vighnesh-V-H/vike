import { NextResponse } from "next/server";
import { SignUpSchema } from "@/lib/schema";
import { hash } from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateVerificationToken } from "@/lib/token";
// import { sendVerificationEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = SignUpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .then((res) => res[0]);

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 10);

    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
    });

    // const verificationToken = await generateVerificationToken(email);

    // await sendVerificationEmail(
    //   verificationToken.email,
    //   verificationToken.token
    // );

    return NextResponse.json(
      { success: "Confirmation email sent" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

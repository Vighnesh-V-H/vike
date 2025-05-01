import { Resend } from "resend";


const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `http://localhost:3000/auth/reset-password?token=${token}`;

  await resend.emails.send({
    from: "vike@resend.dev",
    to: email,
    subject: "Reset Your Password",
    html: `<h1> Click <a href="${resetLink}">here</a> to reset your password  </h1>`,
  });
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `http://localhost:3000/auth/new-verification?token=${token}`;

  await resend.emails.send({
    from: "vike@resend.dev",
    to: email,
    subject: "Confirm Your Mail",
    html: `<h1> Click <a href="${confirmLink}">here</a> to verify your email  </h1>`,
  });
};

export const sendConfirmChangeMail = async (email: string, otp: string) => {
  await resend.emails.send({
    from: "vike@resend.dev",
    to: email,
    subject: "Otp to confirm Your mail",
    html: `<h1> Your Otp \n ${otp} to verify your email  </h1>`,
  });
};

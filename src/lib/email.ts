import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendOtpEmail(to: string, otp: string) {
  await resend.emails.send({
    from: "Zuntra <onboarding@resend.dev>",
    to,
    subject: "Your Zuntra Interview OTP",
    html: `
      <div style="font-family:Arial, sans-serif; padding:20px;">
        <h2>Your OTP Code</h2>
        <p>Your verification code is:</p>
        <h1 style="color:#2563eb;">${otp}</h1>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  });
}

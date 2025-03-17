// app/api/contact/route.js
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email, message } = await request.json();
    console.log(email, message)

    if (!email || !message) {
      return NextResponse.json(
        { error: "Missing required fields: email and message are both required." },
        { status: 400 }
      );
    }

    // Create a transporter using your SMTP server configuration
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // e.g., smtp.gmail.com
      port: Number(process.env.SMTP_PORT) || 587, // 587 for TLS or 465 for SSL
      secure: process.env.SMTP_SECURE === "true", // true for port 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Define the email options
    const mailOptions = {
        from: process.env.SMTP_USER, // your authenticated Gmail account
        replyTo: email,               // the user's email from the request
        to: process.env.SMTP_USER,    // destination email address
        subject: "StudyBuddy Contact",
        text: message,
        html: `<p>${message}</p>`,
      };
      

    // Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { success: true, message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { success: false, error: "Error sending email" },
      { status: 500 }
    );
  }
}
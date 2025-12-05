import nodemailer from "nodemailer";
import { config as configDotenv } from "dotenv";

configDotenv();

export async function sendFineEmail({ to, memberName, amount, overdueDays }) {
  if (!to) return;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "laxmanvatij@gmail.com",

      pass: "xkgm xjcx tzhn hruo",
    },
  });

  await transporter.sendMail({
    from: `"Library Management System" laxmanvatij@gmail.com"`,
    to,
    subject: "Official Library Fine Notice",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #333;">
        
        <p>Dear <strong>${memberName || "Library Member"}</strong>,</p>
  
        <p>
          We hope this message finds you well.
        </p>
  
        <p>
          This is to formally notify you that a fine has been applied to your library account 
          due to the delayed return of a borrowed item.
        </p>
  
        <table style="border-collapse: collapse; margin: 15px 0;">
          <tr>
            <td style="padding: 6px 12px;"><strong>Fine Amount</strong></td>
            <td style="padding: 6px 12px;">${amount} DKK</td>
          </tr>
          <tr>
            <td style="padding: 6px 12px;"><strong>Days Overdue</strong></td>
            <td style="padding: 6px 12px;">${overdueDays} day(s)</td>
          </tr>
        </table>
  
        <p>
          We kindly request that you settle the outstanding amount at your earliest convenience 
          to prevent further penalties or restrictions on your borrowing privileges.
        </p>
  
        <p>
          If payment has already been made, please disregard this notice.
        </p>
  
        <p>
          Should you require any assistance or clarification, please contact the library administration.
        </p>
  
        <br>
  
        <p>
          Sincerely,<br>
          <strong>Library Administration</strong><br>
          Library Management System
        </p>
  
        <hr style="margin-top: 25px;">
  
        <p style="font-size: 12px; color: #777;">
          This email is system-generated. Please do not reply to this message.
        </p>
  
      </div>
    `,
  });
}

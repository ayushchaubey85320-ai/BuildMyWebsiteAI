import random
import string
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config.settings import settings

def generate_otp_code(length: int = 6) -> str:
    return "".join(random.choices(string.digits, k=length))

def send_otp_email(to_email: str, otp_code: str) -> bool:
    print(f"\n============================================")
    print(f"[BuildMyWebsiteAI OTP SYSTEM] Sending OTP: {otp_code} to {to_email}")
    print(f"============================================\n")
    
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        return True

    try:
        msg = MIMEMultipart()
        msg['From'] = f"BuildMyWebsiteAI Studio <{settings.SMTP_USER}>"
        msg['To'] = to_email
        msg['Subject'] = f"{otp_code} is your BuildMyWebsiteAI Verification Code"

        body = f"""
        <!DOCTYPE html>
        <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 30px 10px; margin: 0;">
            <div style="max-width: 520px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 36px; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #6366f1; margin: 0; font-size: 26px; font-weight: 800;">BuildMyWebsiteAI</h1>
                <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Account Verification</p>
              </div>
              <p style="color: #e2e8f0; font-size: 15px; line-height: 1.6;">Hello,</p>
              <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">Your email verification code for BuildMyWebsiteAI Studio is:</p>
              
              <div style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #38bdf8; text-align: center; margin: 28px 0; background: #0f172a; padding: 18px; border-radius: 12px; border: 1px solid #475569;">
                {otp_code}
              </div>

              <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin-top: 24px; border-top: 1px solid #334155; pt: 16px;">
                ⏱ This verification code expires in 15 minutes.<br>
                If you did not request this code, you can safely ignore this email.
              </p>
            </div>
          </body>
        </html>
        """
        msg.attach(MIMEText(body, 'html'))

        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"[BuildMyWebsiteAI Email SUCCESS] Verification OTP sent to {to_email}")
        return True
    except Exception as e:
        print(f"[BuildMyWebsiteAI Email Error] Could not send OTP email: {e}")
        return False

def send_password_reset_email(to_email: str, otp_code: str, reset_link: str) -> bool:
    print(f"\n============================================")
    print(f"[BuildMyWebsiteAI RESET SYSTEM] Sending Password Reset to {to_email}")
    print(f"OTP: {otp_code} | Link: {reset_link}")
    print(f"============================================\n")

    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        return True

    try:
        msg = MIMEMultipart()
        msg['From'] = f"BuildMyWebsiteAI Support <{settings.SMTP_USER}>"
        msg['To'] = to_email
        msg['Subject'] = f"🔐 Your Password Reset OTP is {otp_code} - BuildMyWebsiteAI"

        body = f"""
        <!DOCTYPE html>
        <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 30px 10px; margin: 0;">
            <div style="max-width: 520px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 36px; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
              
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #6366f1; margin: 0; font-size: 26px; font-weight: 800;">BuildMyWebsiteAI</h1>
                <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Password Recovery Request</p>
              </div>

              <p style="color: #e2e8f0; font-size: 15px; line-height: 1.6;">Hello,</p>
              <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                We received a request to reset your password. You can reset your password using <strong>either</strong> your 6-digit OTP code or the one-click button below:
              </p>

              <!-- OTP CODE DISPLAY -->
              <div style="background: #0f172a; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center; border: 1px solid #475569;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Security OTP Code</p>
                <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #f59e0b; font-family: monospace;">
                  {otp_code}
                </div>
              </div>

              <!-- ONE-CLICK RESET BUTTON -->
              <div style="text-align: center; margin: 28px 0;">
                <a href="{reset_link}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: #ffffff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 15px; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);">
                  Reset Password Now &rarr;
                </a>
              </div>

              <p style="color: #94a3b8; font-size: 12px; line-height: 1.6; word-break: break-all; margin-top: 24px;">
                If the button above does not work, copy and paste this link into your browser:<br>
                <a href="{reset_link}" style="color: #38bdf8;">{reset_link}</a>
              </p>

              <div style="border-top: 1px solid #334155; margin-top: 28px; padding-top: 16px; color: #64748b; font-size: 11px; line-height: 1.5;">
                ⏱ This link and OTP are valid for <strong>15 minutes</strong>.<br>
                If you did not request a password reset, no further action is required and your account remains secure.
              </div>
            </div>
          </body>
        </html>
        """
        msg.attach(MIMEText(body, 'html'))

        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"[BuildMyWebsiteAI Email SUCCESS] Reset email sent to {to_email}")
        return True
    except Exception as e:
        print(f"[BuildMyWebsiteAI Email Error] Could not send password reset email: {e}")
        return False

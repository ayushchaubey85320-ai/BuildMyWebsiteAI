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
        # Fallback to dev mode log printing
        return True

    try:
        msg = MIMEMultipart()
        msg['From'] = f"BuildMyWebsiteAI Studio <{settings.SMTP_USER}>"
        msg['To'] = to_email
        msg['Subject'] = f"{otp_code} is your BuildMyWebsiteAI Verification Code"

        body = f"""
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #0d1117; color: #ffffff; padding: 20px;">
            <div style="max-width: 500px; margin: 0 auto; background: #161b22; border-radius: 12px; padding: 30px; border: 1px solid #30363d;">
              <h2 style="color: #6366f1; text-align: center;">BuildMyWebsiteAI Verification</h2>
              <p>Welcome to BuildMyWebsiteAI Studio!</p>
              <p>Your 6-digit email verification code is:</p>
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #10b981; text-align: center; margin: 20px 0; background: #0d1117; padding: 15px; border-radius: 8px;">
                {otp_code}
              </div>
              <p style="color: #8b949e; font-size: 12px;">This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
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
        return True
    except Exception as e:
        print(f"[BuildMyWebsiteAI Email Error] Could not send email: {e}")
        return True

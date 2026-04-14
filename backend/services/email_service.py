import os
import smtplib
from email.message import EmailMessage

class EmailService:
    def __init__(self):
        self.sender_email = os.getenv('GMAIL_SENDER', 'test@example.com')
        self.password = os.getenv('GMAIL_PASSWORD', 'password')

    def send_photos(self, recipient_email, person_name, photos):
        """Sends an email with photo attachments."""
        # Note: If no real credentials are provided, we just "simulate" a success for the presentation
        if self.sender_email == 'test@example.com' or not self.password:
            print(f"[SIMULATION] Simulated sending {len(photos)} photos to {recipient_email}")
            return True

        try:
            msg = EmailMessage()
            msg['Subject'] = f"Photos from Drishyamitra ({person_name})"
            msg['From'] = self.sender_email
            msg['To'] = recipient_email
            msg.set_content(f"Here are the {len(photos)} photos you requested.")

            # Attach actual photos
            for photo in photos:
                if os.path.exists(photo.filepath):
                    with open(photo.filepath, 'rb') as f:
                        img_data = f.read()
                        msg.add_attachment(img_data, maintype='image', subtype='jpeg', filename=photo.filename)

            # Connect to Gmail SMTP Server
            with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
                smtp.login(self.sender_email, self.password)
                smtp.send_message(msg)
                
            print(f"Successfully sent email to {recipient_email}")
            return True
            
        except Exception as e:
            print(f"Email Error: {e}")
            return False
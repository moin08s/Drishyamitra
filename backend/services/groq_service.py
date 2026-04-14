import os
import json
from groq import Groq

class GroqChatService:
    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    def parse_user_request(self, user_message):
        prompt = f"""
        You are 'Drishyamitra', a highly intelligent AI photography assistant. You have the conversational abilities of ChatGPT.
        The user says: "{user_message}"
        
        1. If the user asks you to SEND PHOTOS to an email, return exactly this JSON:
        {{"action": "send_email", "name": "extracted_name", "email": "extracted_email@example.com"}}
        
        2. If the user asks ANY OTHER QUESTION (greeting, coding, science, history, photography tips, etc.), answer them fully, naturally, and intelligently just like ChatGPT would. Return exactly this JSON:
        {{"action": "chat", "reply": "Your full, intelligent, natural response here."}}
        
        IMPORTANT: Output ONLY the raw JSON object. Do not add any text before or after.
        """

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You output valid JSON only. Never use markdown formatting like ```json."},
                    {"role": "user", "content": prompt}
                ],
                model="llama-3.1-8b-instant",
                temperature=0.5, # Slightly higher temperature makes it more creative and chatty!
                response_format={"type": "json_object"}
            )
            
            return json.loads(chat_completion.choices[0].message.content.strip())
            
        except Exception as e:
            return {"action": "error", "reply": f"System Error: {str(e)}"}
import os
import jwt
from flask import Blueprint, request, jsonify
from models import db, Photo, Face, Person
from services.groq_service import GroqChatService
from services.email_service import EmailService

chat_bp = Blueprint('chat', __name__)
groq_service = GroqChatService()
email_service = EmailService()

@chat_bp.route('/message', methods=['POST'])
def handle_chat():
    # Get the logged-in user!
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    try:
        user_id = jwt.decode(token, os.getenv('SECRET_KEY'), algorithms=["HS256"])['user_id']
    except:
        return jsonify({"type": "chat", "reply": "Please log in first!"}), 401

    user_message = request.get_json().get('message', '')
    parsed_data = groq_service.parse_user_request(user_message)
    
    if parsed_data.get('action') in ['error', 'chat']:
        return jsonify({"type": "chat", "reply": parsed_data.get('reply')}), 200

    if parsed_data.get('action') == 'send_email':
        target_name = parsed_data.get('name', '').strip().lower()
        target_email = parsed_data.get('email', '')

        # Search ONLY this user's labeled people
        person = Person.query.filter_by(name=target_name, user_id=user_id).first()
        if not person:
            return jsonify({"type": "chat", "reply": f"I haven't learned who '{target_name.title()}' is yet. Please upload their photo and label them in your Gallery!"}), 200

        faces = Face.query.filter_by(person_id=person.id).all()
        photos = Photo.query.filter(Photo.id.in_([f.photo_id for f in faces]), Photo.user_id==user_id).all()

        if not photos:
            return jsonify({"type": "chat", "reply": f"I couldn't find any photos of {target_name.title()}."}), 200

        if email_service.send_photos(target_email, target_name.title(), photos):
            return jsonify({
                "type": "action_success", "target_email": target_email, "photo_count": len(photos),
                "reply": f"Found them! Ready to send {len(photos)} photo(s) of {target_name.title()} to {target_email}."
            }), 200
        return jsonify({"type": "chat", "reply": "Error connecting to Gmail."}), 200

    return jsonify({"type": "chat", "reply": "I didn't quite understand that."}), 200
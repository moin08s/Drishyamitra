import os
import jwt
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
from models import db, Photo, Face, Person
from services.face_service import FaceRecognitionService
from datetime import datetime

photos_bp = Blueprint('photos', __name__)
face_service = FaceRecognitionService()
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def get_current_user():
    """Helper to extract User ID from frontend Token"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token: return None
    try:
        data = jwt.decode(token, os.getenv('SECRET_KEY'), algorithms=["HS256"])
        return data['user_id']
    except: return None

# --- REAL DASHBOARD DATA ---
@photos_bp.route('/dashboard-stats', methods=['GET'])
def get_dashboard_stats():
    user_id = get_current_user()
    if not user_id: return jsonify({"error": "Unauthorized"}), 401
    
    total_photos = Photo.query.filter_by(user_id=user_id).count()
    return jsonify({
        "total": total_photos,
        "this_month": total_photos, # Simplified for project
        "favorites": 0,
        "shared": 0
    }), 200

# --- UPLOAD WITH USER ID ---
@photos_bp.route('/upload', methods=['POST'])
def upload_photo():
    user_id = get_current_user()
    if not user_id: return jsonify({"error": "Unauthorized"}), 401

    file = request.files.get('file')
    if not file: return jsonify({"error": "Invalid file"}), 400
    
    filename = secure_filename(file.filename)
    filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    
    new_photo = Photo(filename=filename, filepath=filepath, user_id=user_id)
    db.session.add(new_photo)
    db.session.commit()
    
    faces_detected = face_service.process_image(filepath, new_photo.id, user_id)
    return jsonify({"message": "Success", "faces_detected": faces_detected}), 201

# --- GALLERY ISOLATED BY USER ---
@photos_bp.route('/gallery', methods=['GET'])
def get_gallery():
    user_id = get_current_user()
    photos = Photo.query.filter_by(user_id=user_id).order_by(Photo.uploaded_at.desc()).all()
    return jsonify([{"id": p.id, "filename": p.filename, "faces_count": len(p.faces)} for p in photos]), 200

@photos_bp.route('/file/<filename>', methods=['GET'])
def get_file(filename):
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)

# --- LABELING AND UNLABELED FACES ---
@photos_bp.route('/unlabeled', methods=['GET'])
def get_unlabeled_faces():
    user_id = get_current_user()
    # Find unlabeled faces for THIS user only
    unlabeled = Face.query.join(Photo).filter(Photo.user_id == user_id, Face.person_id == None).all()
    return jsonify([{"face_id": f.id, "photo_filename": Photo.query.get(f.photo_id).filename} for f in unlabeled]), 200

@photos_bp.route('/label', methods=['POST'])
def label_face():
    user_id = get_current_user()
    data = request.get_json()
    face = Face.query.get(data.get('face_id'))
    name = data.get('name', '').strip().lower()

    if not face or not name: return jsonify({"error": "Missing data"}), 400

    person = Person.query.filter_by(name=name, user_id=user_id).first()
    if not person:
        person = Person(name=name, user_id=user_id)
        db.session.add(person)
        db.session.commit()

    face.person_id = person.id
    db.session.commit()
    return jsonify({"message": "Labeled successfully!"}), 200
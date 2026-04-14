import os
import json
import numpy as np
from deepface import DeepFace
from models import db, Face, Person

class FaceRecognitionService:
    def __init__(self):
        self.model_name = "Facenet512"
        self.detector_backend = "retinaface"
        self.threshold = 0.3 # Math threshold to decide if two faces belong to the same person

    def calculate_cosine_distance(self, a, b):
        """Calculates mathematical distance between two face embeddings"""
        a, b = np.array(a), np.array(b)
        return 1 - (np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

    def process_image(self, img_path, photo_id, user_id):
        try:
            # 1. Scan the photo
            faces = DeepFace.represent(img_path=img_path, model_name=self.model_name, detector_backend=self.detector_backend, enforce_detection=False)
            faces_detected = 0
            
            # 2. Get all already-known people for THIS specific user
            known_faces = Face.query.join(Person).filter(Person.user_id == user_id).all()

            for face_data in faces:
                if face_data.get('face_confidence', 0) > 0.8:
                    new_embedding = face_data['embedding']
                    matched_person_id = None
                    
                    # 3. AUTOMATIC RECOGNITION: Compare this new face against all known faces
                    for known_face in known_faces:
                        db_embedding = json.loads(known_face.embedding)
                        distance = self.calculate_cosine_distance(new_embedding, db_embedding)
                        
                        if distance < self.threshold:
                            matched_person_id = known_face.person_id
                            print(f"AI MATCH FOUND! Automatically labeled as Person ID {matched_person_id}")
                            break # Match found, stop checking

                    # 4. Save face to database (either auto-labeled or unlabeled)
                    new_face = Face(photo_id=photo_id, person_id=matched_person_id, embedding=json.dumps(new_embedding))
                    db.session.add(new_face)
                    faces_detected += 1
            
            db.session.commit()
            return faces_detected
        except Exception as e:
            print(f"Face processing error: {e}")
            return 0
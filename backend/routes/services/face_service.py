import os
import pickle
import json
from deepface import DeepFace
from models import db, Face, Person
import numpy as np

class FaceRecognitionService:
    """Face detection and recognition using DeepFace"""

    def __init__(self):
        # Using Facenet512 and RetinaFace as per your instructions
        self.model_name = "Facenet512" 
        self.detector_backend = "retinaface" 
        
        # Folder to store the pickle database
        self.embeddings_folder = os.path.join(os.getcwd(), 'embeddings')
        os.makedirs(self.embeddings_folder, exist_ok=True)
        
        self.distance_threshold = 0.4 # Threshold for Facenet512
        self.face_db = self._load_face_database()

    def _load_face_database(self):
        """Load existing face embeddings database"""
        db_path = os.path.join(self.embeddings_folder, 'face_database.pkl')
        if os.path.exists(db_path):
            try:
                with open(db_path, 'rb') as f:
                    return pickle.load(f)
            except Exception as e:
                print(f"Error loading face database: {e}")
                return {}
        return {}

    def _save_face_database(self):
        """Save face embeddings database"""
        db_path = os.path.join(self.embeddings_folder, 'face_database.pkl')
        try:
            with open(db_path, 'wb') as f:
                pickle.dump(self.face_db, f)
        except Exception as e:
            print(f"Error saving face database: {e}")

    def process_image(self, img_path, photo_id):
        """Detect faces, generate embeddings, and store in Database"""
        try:
            # 1. Detect and extract facial features into a numerical vector
            faces = DeepFace.represent(
                img_path=img_path, 
                model_name=self.model_name,
                detector_backend=self.detector_backend,
                enforce_detection=False
            )
            
            faces_detected = 0
            for face_data in faces:
                # Ensure it actually found a face
                if face_data.get('face_confidence', 0) > 0.8:
                    embedding_vector = face_data['embedding']
                    
                    # 2. Store embedding in SQLAlchemy Database (as JSON string)
                    new_face = Face(
                        photo_id=photo_id, 
                        embedding=json.dumps(embedding_vector)
                    )
                    db.session.add(new_face)
                    faces_detected += 1
            
            db.session.commit()
            return faces_detected

        except Exception as e:
            print(f"Face processing error: {str(e)}")
            return 0
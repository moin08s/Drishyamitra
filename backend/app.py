import os

# MUST BE AT THE VERY TOP: Stops TensorFlow from silently crashing on Windows!
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

print("Step 1: Imports starting...")
from flask import Flask, jsonify
from flask_cors import CORS
from models import db
from dotenv import load_dotenv

print("Step 2: Loading environment variables...")
load_dotenv()

app = Flask(__name__)
CORS(app) 

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'my_super_secret_key')

db.init_app(app)

UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

print("Step 3: Registering routes and AI models...")
from routes.auth import auth_bp
from routes.photos import photos_bp
from routes.chat import chat_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(photos_bp, url_prefix='/api/photos')
app.register_blueprint(chat_bp, url_prefix='/api/chat')

print("Step 4: Creating database tables...")
with app.app_context():
    db.create_all()
    print("Database tables created successfully!")

@app.route('/')
def home():
    return jsonify({"message": "AI Photo Gallery API is running!"})

if __name__ == '__main__':
    print("Step 5: STARTING FLASK SERVER NOW...")
    # use_reloader=False prevents Flask from running the AI twice at the same time
    app.run(debug=True, port=5000, use_reloader=False)
from flask import Flask, session
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from .config import Config
from flask_socketio import SocketIO
from flask_jwt_extended import JWTManager
from flask_session import Session
import os

db = SQLAlchemy()
bcrypt = Bcrypt()
socketio = SocketIO()
jwt = JWTManager()
 

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)  # ✅ Charge la config depuis ton fichier Config
    app.secret_key = "chaima"
    app.config["JWT_SECRET_KEY"] = 'super-secret'  # Clé secrète pour JWT
    app.config['JWT_SECRET_KEY'] = 'super-secret'
    app.config['JWT_TOKEN_LOCATION'] = ['cookies']
    app.config['JWT_COOKIE_SECURE'] = False
    app.config['JWT_COOKIE_HTTPONLY'] = True
    app.config['JWT_ACCESS_COOKIE_PATH'] = '/'
    app.config['JWT_COOKIE_CSRF_PROTECT'] = False  # ✅ Désactive la protection CSRF en dev

    app.config['JWT_COOKIE_HTTPONLY'] = True  # Pour rendre le cookie HttpOnly
    jwt = JWTManager(app)
    # Initialisation correcte des extensions
 
    db.init_app(app)
    bcrypt.init_app(app)
    socketio.init_app(app)
    jwt.init_app(app)  # ✅ Ne pas recréer une nouvelle instance ici !

    from .routers.auth import auth_bp
    from .routers.contact import google_bp
    from .routers.courrier import courrier_bp
    from .models import Utilisateur, Contact, Courrier, Document, Workflow  

    with app.app_context():
        db.create_all()
        app.register_blueprint(auth_bp, url_prefix="/auth")
        app.register_blueprint(google_bp)
        app.register_blueprint(courrier_bp)
        print("✅ Tables créées avec succès !")

    # ✅ Test si la session fonctionne
    @app.route("/")
    def set_test_session():
    
        return "heloo to the app ."

    return app

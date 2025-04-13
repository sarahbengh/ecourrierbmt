from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity, JWTManager,
    set_access_cookies, unset_jwt_cookies
)
from ..models import Contact, Utilisateur
from ..create_app import db
from datetime import timedelta
from functools import wraps

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()

@auth_bp.route('/')
def home():
    return jsonify({"message": "Hey Chaimuus!"}), 200

@auth_bp.route('/add_user', methods=['POST'])
def register():
    data = request.get_json()
    required_fields = ["nom", "prenom", "email", "password", "numero_tel"]
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"message": f"{field} est requis"}), 400

    if Utilisateur.query.filter_by(email=data["email"]).first():
        return jsonify({"message": "Email déjà utilisé"}), 400

    hashed_password = bcrypt.generate_password_hash(data["password"]).decode('utf-8')

    new_user = Utilisateur(
        nom=data["nom"],
        prenom=data["prenom"],
        email=data["email"],
        mot_de_passe=hashed_password,
        numero_tel=data["numero_tel"],
        role=data.get("role", "employe")
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Utilisateur créé avec succès"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if "email" not in data or "password" not in data:
        return jsonify({"message": "Email et mot de passe requis"}), 400

    utilisateur = Utilisateur.query.filter_by(email=data["email"]).first()
    if not utilisateur or not bcrypt.check_password_hash(utilisateur.mot_de_passe, data["password"]):
        return jsonify({"message": "Identifiants incorrects"}), 401

    access_token = create_access_token(
        identity=str(utilisateur.id),
        additional_claims={"role": utilisateur.role},
        expires_delta=timedelta(days=2)
    )

    response = jsonify({"message": "Connexion réussie", "role": utilisateur.role})
    set_access_cookies(response, access_token)

    return response, 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    response = jsonify({"message": "Déconnexion réussie"})
    unset_jwt_cookies(response)
    return response, 200

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        current_user = get_jwt_identity()
        user = Utilisateur.query.get(int(current_user)) if current_user else None
        if not user or user.role != "admin":
            return jsonify({"message": "Accès refusé. Admin uniquement"}), 403
        return f(*args, **kwargs)
    return decorated_function

@auth_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    return admin_required(_get_users)()

def _get_users():
    utilisateurs = Utilisateur.query.all()
    users_list = [
        {
            "id": user.id,
            "nom": user.nom,
            "prenom": user.prenom,
            "email": user.email,
            "numero_tel": user.numero_tel,
            "role": user.role
        }
        for user in utilisateurs
    ]
    return jsonify({"utilisateurs": users_list}), 200

@auth_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    return admin_required(_delete_user)(user_id)

def _delete_user(user_id):
    user = Utilisateur.query.get(user_id)
    if not user:
        return jsonify({"message": "Utilisateur non trouvé"}), 404

    Contact.query.filter_by(utilisateur_id=user_id).delete(synchronize_session=False)
    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "Utilisateur et ses contacts supprimés avec succès"}), 200

@auth_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    return admin_required(_update_user)(user_id)

def _update_user(user_id):
    user = Utilisateur.query.get(user_id)
    if not user:
        return jsonify({"message": "Utilisateur non trouvé"}), 404

    data = request.get_json()
    if "nom" in data:
        user.nom = data["nom"]
    if "prenom" in data:
        user.prenom = data["prenom"]
    if "email" in data:
        if Utilisateur.query.filter(Utilisateur.email == data["email"], Utilisateur.id != user_id).first():
            return jsonify({"message": "Cet email est déjà utilisé"}), 400
        user.email = data["email"]
    if "numero_tel" in data:
        user.numero_tel = data["numero_tel"]
    if "role" in data:
        user.role = data["role"]

    db.session.commit()
    return jsonify({"message": "Utilisateur mis à jour avec succès"}), 200

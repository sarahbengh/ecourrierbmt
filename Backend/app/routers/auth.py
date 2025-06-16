from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity, JWTManager,get_jwt,
    set_access_cookies, unset_jwt_cookies
)
from ..models import Contact, Utilisateur ,Service
from ..create_app import db
from datetime import timedelta, datetime
from functools import wraps

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()

@auth_bp.route('/')
def home():
    return jsonify({"message": "Hey Chaimuus!"}), 200


@auth_bp.route('/add_user', methods=['POST'])
def register():
    data = request.get_json()
    required_fields = ["nom", "prenom", "email", "password", "numero_tel", "service_id"]

    # Vérifie que tous les champs requis sont présents
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"message": f"{field} est requis"}), 400

    # Vérifie si l'email existe déjà
    if Utilisateur.query.filter_by(email=data["email"]).first():
        return jsonify({"message": "Email déjà utilisé"}), 400

    # Vérifie si le service existe
    service = Service.query.get(data["service_id"])
    if not service:
        return jsonify({"message": f"Le service avec l'ID {data['service_id']} n'existe pas."}), 400

    # Vérifie que le rôle est valide (admin ou employe uniquement)
    role = data.get("role", "employe").lower()
    if role not in ["admin", "employe"]:
        return jsonify({"message": "Le rôle doit être soit 'admin', soit 'employe'"}), 400

    # Hash du mot de passe
    hashed_password = bcrypt.generate_password_hash(data["password"]).decode('utf-8')

    # Création de l'utilisateur
    new_user = Utilisateur(
        nom=data["nom"],
        prenom=data["prenom"],
        email=data["email"],
        mot_de_passe=hashed_password,
        numero_tel=data["numero_tel"],
        role=role,
        service_id=data["service_id"]
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

    # Définir expiration
    expiration = timedelta(days=2)
    expiration_date = datetime.utcnow() + expiration

    # Générer le token
    access_token = create_access_token(
        identity=str(utilisateur.id),
        additional_claims={"role": utilisateur.role},
        expires_delta=expiration
    )
    # Répondre avec le cookie
    
    response = jsonify({"message": "Connexion réussie", "role": utilisateur.role})
    response.headers['Authorization'] = f'Bearer {access_token}'
    set_access_cookies(response, access_token, max_age=timedelta(days=2))


    return response, 200
 
@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    current_user_id = get_jwt_identity()
    jwt_payload = get_jwt()
    current_token = jwt_payload["jti"]  # Le token ID unique (jti = JWT ID)

    # Supprimer le token de la base
    token_to_delete = Token.query.filter_by(utilisateur_id=current_user_id, token=current_token).first()
    if token_to_delete:
        db.session.delete(token_to_delete)
        db.session.commit()

    # Supprimer les cookies
    response = jsonify({"message": "Déconnexion réussie"})
    unset_jwt_cookies(response, secure=True, httponly=True)
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

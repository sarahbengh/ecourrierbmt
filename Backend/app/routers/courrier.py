from flask import Blueprint, request, jsonify
from datetime import datetime
from werkzeug.utils import secure_filename
import os
from ..models import db, Courrier, Utilisateur,Document,Notification,Contact,Service
from flask_jwt_extended import jwt_required, get_jwt_identity
from functools import wraps

# Initialisation du Blueprint
courrier_bp = Blueprint('courrier', __name__)
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity, JWTManager
)
 
UPLOAD_FOLDER = 'C:\\Users\\User\\Downloads'  # Répertoire où tu veux enregistrer les fichiers

# Vérifie si le type de fichier est autorisé
def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'jpg', 'png'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@courrier_bp.route('/save_courrier', methods=['POST'])
@jwt_required()
def save_courrier():
    data = request.form

    type_courrier = data.get('type_courrier')
    priority = data.get('priority')
    object = data.get('object')
    sender_id = get_jwt_identity()
    arrival_date_str = data.get('arrival_date')
    service_ids = data.getlist('diffusion_service_ids')

    sender = Utilisateur.query.get(sender_id)
    if not sender:
        return jsonify({"message": f"L'expéditeur avec l'ID {sender_id} n'existe pas."}), 400
    if sender.role.lower() != "admin":
        return jsonify({"message": "Accès refusé : seuls les administrateurs peuvent envoyer un courrier."}), 403

    if not type_courrier or not priority or not object:
        return jsonify({"message": "Tous les champs sont requis"}), 400

    if arrival_date_str:
        try:
            arrival_date = datetime.strptime(arrival_date_str, '%Y-%m-%d %H:%M:%S')
        except ValueError:
            return jsonify({"message": "Format de la date d'arrivée incorrect, utilisez 'YYYY-MM-DD HH:MM:SS'"}), 400
    else:
        arrival_date = datetime.utcnow()

    courrier = Courrier(
        type_courrier=type_courrier,
        priority=priority,
        object=object,
        sender_id=sender_id,
        arrival_date=arrival_date
    )
    db.session.add(courrier)

    # Ajouter les services destinataires
    for service_id in service_ids:
        service = Service.query.get(service_id)
        if service:
            courrier.diffusion_services.append(service)

    db.session.flush()
    db.session.commit()

    # Gestion du fichier
    if 'file' in request.files:
        file = request.files['file']
        if file.filename == '':
            return jsonify({"message": "Aucun fichier sélectionné"}), 400

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(file_path)

            document = Document(
                nom_fichier=filename,
                chemin_fichier=file_path,
                courrier_id=courrier.id
            )
            db.session.add(document)

            # Notifications pour chaque responsable de service
            for service_id in service_ids:
                service = Service.query.get(service_id)
                if service and service.responsable:
                    notification = Notification(
                        utilisateur_id=service.responsable.id,
                        courrier_id=courrier.id,
                        message=f"Un document a été ajouté au courrier : {object}",
                        statut="non lu"
                    )
                    db.session.add(notification)

            db.session.commit()

    response = {"message": "Courrier enregistré et envoyé aux services sélectionnés", "courrier_id": courrier.id}

    if 'file' in request.files:
        response["document_id"] = document.id

    return jsonify(response), 201


@courrier_bp.route('/get_courriers', methods=['POST'])
@jwt_required()
def get_courriers():
    user_id = get_jwt_identity()
    utilisateur = Utilisateur.query.get(user_id)

    if not utilisateur:
        return jsonify({"message": "Utilisateur non trouvé"}), 404

    data = request.get_json()

    # Si admin
    if utilisateur.role.lower() == "admin":
        if not data or 'type_courrier' not in data:
            return jsonify({"message": "Le champ 'type_courrier' est requis pour les admins"}), 400

        type_courrier = data['type_courrier'].lower()
        if type_courrier not in ['arrivee', 'depart']:
            return jsonify({"message": "Type de courrier invalide. Utilisez 'arrivee' ou 'depart'."}), 400

        courriers = Courrier.query.filter(
            Courrier.type_courrier.ilike(type_courrier)
        ).all()

    else:
        # Utilisateur non admin → uniquement les courriers "arrivee"
        type_courrier = "arrivee"

        # Récupérer tous les services dont il est responsable
        services_dirigés = utilisateur.services_dirigés
        ids_services = [s.id for s in services_dirigés]

        if not ids_services:
            return jsonify(["hi"]), 200  # Aucun service dirigé → aucun courrier

        courriers = Courrier.query.join(Courrier.diffusion_services).filter(
    Service.responsable_id == utilisateur.id
).all()

    # Construction du résultat
    result = []
    for courrier in courriers:
        courrier_data = {
            "id": courrier.id,
            "type_courrier": courrier.type_courrier,
            "priority": courrier.priority,
            "object": courrier.object,
            "arrival_date": courrier.arrival_date.strftime('%Y-%m-%d %H:%M:%S'),
        }

        if hasattr(courrier, 'documents') and courrier.documents:
            courrier_data["documents"] = [{
                "id": doc.id,
                "nom_fichier": doc.nom_fichier,
                "chemin_fichier": doc.chemin_fichier
            } for doc in courrier.documents]

        result.append(courrier_data)

    return jsonify(result), 200





@courrier_bp.route('/filtrer_courriers', methods=['POST'])
@jwt_required()
def filtrer_courriers():
    user_id = get_jwt_identity()
    utilisateur = Utilisateur.query.get(user_id)

    if not utilisateur:
        return jsonify({"message": "Utilisateur non trouvé"}), 404

    data = request.get_json()
    query = Courrier.query.join(Courrier.liste_diffusion).filter(Utilisateur.id == user_id)

    # Filtres optionnels
    if 'type_courrier' in data:
        query = query.filter(Courrier.type_courrier.ilike(data['type_courrier']))

    if 'priority' in data:
        query = query.filter(Courrier.priority.ilike(data['priority']))

    if 'date_debut' in data and 'date_fin' in data:
        try:
            date_debut = datetime.strptime(data['date_debut'], '%Y-%m-%d')
            date_fin = datetime.strptime(data['date_fin'], '%Y-%m-%d')
            query = query.filter(Courrier.arrival_date.between(date_debut, date_fin))
        except ValueError:
            return jsonify({"message": "Format de date invalide. Utilisez YYYY-MM-DD."}), 400

    if 'object' in data:
        query = query.filter(Courrier.object.ilike(f"%{data['object']}%"))

    courriers = query.all()

    result = []
    for c in courriers:
        result.append({
            "id": c.id,
            "type_courrier": c.type_courrier,
            "priority": c.priority,
            "object": c.object,
            "arrival_date": c.arrival_date.strftime('%Y-%m-%d %H:%M:%S'),
        })

    return jsonify(result), 200


@courrier_bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()
    notifications = Notification.query.filter_by(utilisateur_id=user_id).order_by(Notification.id.desc()).all()

    result = []
    for notif in notifications:
        result.append({
            "id": notif.id,
            "courrier_id": notif.courrier_id,
            "message": notif.message,
            "statut": notif.statut
        })

    return jsonify(result), 200

from flask import Blueprint, request, jsonify
from datetime import datetime
from werkzeug.utils import secure_filename
import os
from ..models import db, Courrier, Utilisateur,Document,Notification,Contact
from flask_jwt_extended import jwt_required, get_jwt_identity
from functools import wraps

# Initialisation du Blueprint
courrier_bp = Blueprint('courrier', __name__)

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
    
    # Récupération des informations du formulaire
    type_courrier = request.form.get('type_courrier')
    priority = request.form.get('priority')
    object = request.form.get('object')
    sender_id = request.form.get('sender_id')
    diffusion_ids = request.form.getlist('diffusion_ids')
    arrival_date_str = request.form.get('arrival_date')
        
    # Vérification de la présence des champs nécessaires
    if not type_courrier or not priority or not object or not sender_id:
        return jsonify({"message": "Tous les champs sont requis"}), 400
    sender = Contact.query.get(sender_id)
    if not sender:
        return jsonify({"message": f"L'expéditeur avec l'ID {sender_id} n'existe pas."}), 400
    # Convertir arrival_date en datetime si fourni
    if arrival_date_str:
        try:
            arrival_date = datetime.strptime(arrival_date_str, '%Y-%m-%d %H:%M:%S')  # Format : 'YYYY-MM-DD HH:MM:SS'
        except ValueError:
            return jsonify({"message": "Format de la date d'arrivée incorrect, utilisez 'YYYY-MM-DD HH:MM:SS'"}), 400
    else:
        arrival_date = datetime.utcnow()  # Si la date d'arrivée n'est pas fournie, on utilise la date actuelle

    # Création du courrier
    courrier = Courrier(
        type_courrier=type_courrier,
        priority=priority,
        object=object,
        sender_id=sender_id,
        arrival_date=arrival_date  # Assignation de la date d'arrivée
    )
    db.session.add(courrier)
    db.session.commit()  # Sauvegarde du courrier
    
    
    for user_id in diffusion_ids:
        user = Utilisateur.query.get(user_id)
        if user:
            courrier.liste_diffusion.append(user)

# Ajouter un flush ici pour forcer la mise à jour de la base de données
    db.session.flush()
    db.session.commit()  # Sauvegarde des modifications du courrier

   
   

    # Traitement du fichier (si un fichier est inclus)
    if 'file' in request.files:
        file = request.files['file']
        if file.filename == '':
            return jsonify({"message": "Aucun fichier sélectionné"}), 400

        if file and allowed_file(file.filename):
            # Sécuriser le nom du fichier et le sauvegarder
            filename = secure_filename(file.filename)
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(file_path)

            # Enregistrer le document dans la base de données et lier au courrier
            document = Document(
                nom_fichier=filename,
                chemin_fichier=file_path,
                courrier_id=courrier.id
            )
            db.session.add(document)
            db.session.commit()

            # Ajouter une notification pour le document
            for user_id in diffusion_ids:
                user = Utilisateur.query.get(user_id)
                if user:
                    notification = Notification(
                        utilisateur_id=user.id,
                        courrier_id=courrier.id,
                        message=f"Un document a été ajouté au courrier : {object}",
                        statut="non lu"
                    )
                    db.session.add(notification)

            db.session.commit()  # Sauvegarde des notifications liées au document

    # Retour de succès avec l'ID du courrier et le document si disponible
    response = {"message": "Courrier enregistré et envoyé aux utilisateurs sélectionnés", "courrier_id": courrier.id}

    if 'file' in request.files:
        response["document_id"] = document.id  # Si un document est téléchargé, inclure son ID

    return jsonify(response), 201


@courrier_bp.route('/get_courriers', methods=['POST'])
@jwt_required()
def get_courriers():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data or 'type_courrier' not in data:
        return jsonify({"message": "Le champ 'type_courrier' est requis dans le corps de la requête"}), 400

    type_courrier = data['type_courrier'].lower()
    courriers = []

    if type_courrier == 'depart':
       utilisateur = Utilisateur.query.get(user_id)

       courriers = [
            c for c in utilisateur.courriers_diffusés
            if c.type_courrier.lower() == 'depart'
]
    elif type_courrier == 'arrivee':
        utilisateur = Utilisateur.query.get(user_id)
        if not utilisateur:
            return jsonify({"message": "Utilisateur non trouvé"}), 404

     
        courriers = [
            c for c in utilisateur.courriers_diffusés
            if c.type_courrier.lower() == 'arrivee'
        ]

    else:
        return jsonify({"message": "Type de courrier invalide. Utilisez 'depart' ou 'arrivee'."}), 400

    result = []
    for courrier in courriers:
        result.append({
            "id": courrier.id,
            "type_courrier": courrier.type_courrier,
            "priority": courrier.priority,
            "object": courrier.object,
            "arrival_date": courrier.arrival_date.strftime('%Y-%m-%d %H:%M:%S'),
        })

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

import os
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv

# Charge le fichier d'environnement spécifique nommé API.env
load_dotenv(dotenv_path="API.env")

app = Flask(__name__)
CORS(app)  # Permet aux requêtes AJAX de ton JS local de passer sans blocage CORS

# Récupère la clé API via le nom exact défini dans ton fichier API.env
genai.configure(api_key=os.environ.get("APIKEY"))

@app.route('/analyser', methods=['POST'])
def analyser():
    data = request.get_json()
    
    if not data or 'image' not in data:
        return jsonify({"resultat": "Données manquantes"}), 400

    try:
        # CORRECTION MAJEURE : On doit décoder la chaîne de texte Base64 
        # en données binaires brutes (bytes) avant de la passer à types.Part
        raw_image_bytes = base64.b64decode(data['image'])
        
        # Préparation de l'image pour l'API Gemini
        image_part = types.Part.from_bytes(
            data=raw_image_bytes,
            mime_type="image/jpeg"
        )
        
        prompt = "Analyse cette peau. Donne le type de peau, les problèmes visibles et une routine skincare courte. Sois clair et ordonné avec des produits et des solutions adaptés, naturelles et efficaces. Et pour finir sois assez bref et fais une bonne mise en page adaptée."

        # Appel à l'IA avec le modèle multimodal mis à jour
        response = client.models.generate_content(
            model='gemini-2.5-flash', 
            contents=[prompt, image_part]
        )

        return jsonify({"resultat": response.text})

    except Exception as e:
        print(f"Erreur lors du traitement : {e}")
        return jsonify({"resultat": "L'IA n'a pas pu traiter l'image."}), 500

if __name__ == '__main__':
    # Lance le serveur sur le port 3000 comme configuré dans ton script JS
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port, debug=True)

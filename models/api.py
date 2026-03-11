from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pickle
import os
import cv2
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from tensorflow.keras.models import load_model

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from Next.js

# Allow handling of potentially large images/models
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB limit

# Load models safely using relative paths if possible, but fallback to absolute
base_dir = os.path.dirname(os.path.abspath(__file__))

crop_model_path = os.path.join(base_dir, "Crop_recommendation_model_01.pkl")
encoder_path = os.path.join(base_dir, "Crop_enc_new.pkl")
disease_model_path = os.path.join(base_dir, "Plant_disease_prediction_model.keras")

try:
    with open(crop_model_path, "rb") as f:
        crop_model = pickle.load(f)
    with open(encoder_path, "rb") as f:
        crop_encoder = pickle.load(f)
    print("Crop Suggestion Models loaded.")
except Exception as e:
    print(f"Warning: Could not load Crop Model. Make sure {crop_model_path} exists. Error: {e}")
    crop_model, crop_encoder = None, None

try:
    disease_model = load_model(disease_model_path)
    print("Disease Detection Model loaded.")
except Exception as e:
    print(f"Warning: Could not load Disease Model. Make sure {disease_model_path} exists. Error: {e}")
    disease_model = None


# Disease Classes Dictionary
disease_classes = {
    0: ("Apple - Apple Scab", "Apply fungicides like Mancozeb or Captan during early leaf development. Remove infected leaves and fruits."),
    1: ("Apple - Black Rot", "Prune infected branches and apply copper-based fungicides. Remove fallen leaves and fruit."),  
    2: ("Apple - Cedar Apple Rust", "Use resistant varieties and apply fungicides like myclobutanil. Remove nearby cedar trees."),  
    3: ("Apple - Healthy", "No disease detected. Maintain proper pruning and watering."),  
    4: ("Blueberry - Healthy", "No disease detected. Ensure proper irrigation and pH-balanced soil."),  
    5: ("Cherry - Powdery Mildew", "Apply sulfur-based fungicides and remove infected parts. Avoid excessive nitrogen."),  
    6: ("Cherry - Healthy", "No disease detected. Provide well-drained soil and proper sunlight."),  
    7: ("Corn - Cercospora Leaf Spot", "Use strobilurin or triazole fungicides. Rotate crops and remove debris."),  
    8: ("Corn - Common Rust", "Apply propiconazole or tebuconazole. Plant rust-resistant varieties."),  
    9: ("Corn - Northern Leaf Blight", "Use azoxystrobin and practice crop rotation. Maintain plant nutrition."),  
    10: ("Corn - Healthy", "No disease detected. Ensure soil fertility with NPK fertilizers."),  
    11: ("Grape - Black Rot", "Remove mummified berries. Apply Mancozeb or Captan. Ensure good air circulation."),  
    12: ("Grape - Esca", "Prune affected vines early. Apply fungicides. Avoid excessive irrigation."),  
    13: ("Grape - Leaf Blight", "Use Bordeaux mixture or copper fungicides. Improve drainage."),  
    14: ("Grape - Healthy", "No disease detected. Maintain proper pruning and sunlight."),  
    15: ("Orange - Citrus Greening", "Remove infected trees. Use insecticides for psyllids. Apply balanced fertilizers."),  
    16: ("Peach - Bacterial Spot", "Apply copper bactericides. Avoid overhead irrigation. Remove infected parts."),  
    17: ("Peach - Healthy", "No disease detected. Ensure proper air circulation."),  
    18: ("Pepper - Bacterial Spot", "Use copper sprays. Remove infected leaves. Rotate crops annually."),  
    19: ("Pepper - Healthy", "No disease detected. Ensure proper sunlight and well-drained soil."),  
    20: ("Potato - Early Blight", "Apply Chlorothalonil. Use crop rotation. Avoid overwatering."),  
    21: ("Potato - Late Blight", "Use Mancozeb. Plant resistant varieties. Avoid wet conditions."),  
    22: ("Potato - Healthy", "No disease detected. Maintain soil fertility using compost."),  
    23: ("Raspberry - Healthy", "No disease detected. Prune properly and use mulch."),  
    24: ("Soybean - Healthy", "No disease detected. Use balanced fertilizers and ensure drainage."),  
    25: ("Squash - Powdery Mildew", "Apply sulfur-based fungicides or neem oil. Avoid overhead watering."),  
    26: ("Strawberry - Leaf Scorch", "Apply copper hydroxide. Ensure spacing and water at the base."),  
    27: ("Strawberry - Healthy", "No disease detected. Keep soil well-drained. Remove dead leaves."),  
    28: ("Tomato - Bacterial Spot", "Use copper sprays. Practice crop rotation. Avoid working when plants are wet."),  
    29: ("Tomato - Early Blight", "Apply Chlorothalonil. Space plants properly for airflow."),  
    30: ("Tomato - Late Blight", "Apply copper sprays. Improve air circulation by pruning."),  
    31: ("Tomato - Leaf Mold", "Ensure airflow. Use copper-based sprays. Avoid high humidity."),  
    32: ("Tomato - Septoria Leaf Spot", "Apply Chlorothalonil. Remove infected leaves. Avoid overhead watering."),  
    33: ("Tomato - Spider Mites", "Use neem oil or insecticidal soap. Introduce natural predators like ladybugs."),  
    34: ("Tomato - Target Spot", "Use Mancozeb or Chlorothalonil. Avoid wetting leaves. Maintain spacing."),  
    35: ("Tomato - Yellow Leaf Curl Virus", "Control whiteflies. Remove infected plants. Use resistant varieties."),  
    36: ("Tomato - Tomato Mosaic Virus", "Remove infected plants. Disinfect gardening tools. Wash hands after handling."),  
    37: ("Tomato - Healthy", "No disease detected. Maintain proper soil nutrition and irrigation.")  
}

@app.route("/api/ping", methods=["GET"])
def ping():
    return jsonify({"status": "ok", "message": "ML Service is running"})

@app.route("/api/predict-crop", methods=["POST"])
def predict_crop():
    if not crop_model or not crop_encoder:
        return jsonify({"error": "Crop Model not loaded on server."}), 500

    data = request.json
    try:
        # Extract features
        N = float(data.get("N", 0))
        P = float(data.get("P", 0))
        K = float(data.get("K", 0))
        pH = float(data.get("pH", 0))
        rainfall = float(data.get("rainfall", 0))
        temperature = float(data.get("temperature", 0))

        input_data = np.array([[N, P, K, pH, rainfall, temperature]])
        
        predicted_label = int(crop_model.predict(input_data)[0])
        prediction = crop_encoder.inverse_transform([predicted_label])[0]
        
        return jsonify({
            "success": True,
            "crop": prediction.capitalize()
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route("/api/predict-disease", methods=["POST"])
def predict_disease():
    if not disease_model:
        return jsonify({"error": "Disease Model not loaded on server."}), 500

    if 'image' not in request.files:
        return jsonify({"error": "No image file provided in the request."}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file."}), 400

    try:
        # Save temporarily to process
        temp_path = os.path.join(base_dir, "temp_upload.jpg")
        file.save(temp_path)

        # Process Image for model
        image = load_img(temp_path, target_size=(224, 224))
        image = img_to_array(image) / 255.0
        image = np.expand_dims(image, axis=0)

        # Predict
        result = disease_model.predict(image)
        pred_class = np.argmax(result)
        
        disease, remedy = disease_classes.get(pred_class, ("Unknown Disease", "No remedy available."))
        
        # Cleanup
        if os.path.exists(temp_path):
            os.remove(temp_path)

        return jsonify({
            "success": True,
            "disease": disease,
            "remedy": remedy
        })
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    # Get port from environment variable for Hugging Face compatibility
    port = int(os.environ.get("PORT", 7860))
    app.run(host="0.0.0.0", port=port)

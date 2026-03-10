from flask import Flask, render_template, request
import numpy as np
import pickle
import os

app = Flask(__name__)

# Load trained model
with open(r"C:\Users\Mystery_soul\Desktop\Agro Puthalvan Technologies\Website\Model\Crop_recommendation_model_01.pkl", "rb") as file:
    model = pickle.load(file)

# Load label encoder
with open(r"C:\Users\Mystery_soul\Desktop\Agro Puthalvan Technologies\Website\Model\Crop_enc_new.pkl", "rb") as file:
    encoder = pickle.load(file)

@app.route("/", methods=["GET", "POST"])
def index():
    prediction = None
    if request.method == "POST":
        try:
            # Get input values from form
            N = float(request.form["N"])
            P = float(request.form["P"])
            K = float(request.form["K"])
            pH = float(request.form["pH"])
            rainfall = float(request.form["rainfall"])
            temperature = float(request.form["temperature"])

            # Prepare input data
            input_data = np.array([[N, P, K, pH, rainfall, temperature]])

            # Make prediction
            predicted_label = int(model.predict(input_data)[0])  # Convert to integer
            prediction = encoder.inverse_transform([predicted_label])[0]  # Decode label
        except:
            prediction = "Error in prediction. Please check input values."

    return render_template("index.html", prediction=prediction)

if __name__ == "__main__":
    app.run(debug=True)

from flask import Flask, render_template, request
import numpy as np
import os
import cv2
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from tensorflow.keras.models import load_model

# Load trained model
MODEL_PATH = r"C:\Users\Mystery_soul\Desktop\Agro Puthalvan Technologies\Website\Model\Plant_disease_prediction_model.keras"
model = load_model(MODEL_PATH)
print("Model Loaded Successfully")

# Define class labels with remedies
disease_classes = {
    0: ("Apple - Apple Scab", "Apple - Apple Scab Remedy (English): Apply fungicides like Mancozeb or Captan during early leaf development. Remove infected leaves and fruits to prevent the spread. Ensure proper air circulation around trees. \n மருந்து (தமிழில்): இலை வளர்ச்சியின் ஆரம்பத்தில் மான்கோசெப் அல்லது கேப்டான் போன்ற பூஞ்சைநாசினிகளை தெளிக்கவும். பாதிக்கப்பட்ட இலைகள் மற்றும் பழங்களை அகற்றவும். மரங்களுக்கு நல்ல காற்றோட்டம் கிடைப்பதை உறுதி செய்யவும்."),
    1: ("Apple - Black Rot", "Apple - Black Rot Remedy (English): Prune infected branches and apply copper-based fungicides. Remove and destroy fallen leaves and fruit to prevent reinfection. Ensure trees receive adequate sunlight.\n மருந்து (தமிழில்): பாதிக்கப்பட்ட கிளைகளை வெட்டி, காப்பர் அடிப்படையிலான பூஞ்சைநாசினிகளை தெளிக்கவும். புதிதாக நோய் பரவாமல் இருக்க, விழுந்த இலைகள் மற்றும் பழங்களை அகற்றி அழிக்கவும். மரங்களுக்கு போதுமான வெளிச்சம் கிடைப்பதை உறுதி செய்யவும்."),  
    2: ("Apple - Cedar Apple Rust", "Apple - Cedar Apple Rust Remedy (English): Use resistant apple varieties and apply fungicides like myclobutanil. Remove nearby cedar trees if possible, as they host the fungus. Prune infected leaves.\n மருந்து (தமிழில்): நோய்த்தாங்கும் ஆப்பிள் வகைகளை பயிரிடவும், மைக்லோபியூடனில் போன்ற பூஞ்சைநாசினிகளை தெளிக்கவும். நோய்க்கு காரணமான சீடர் மரங்களை அகற்றவும். பாதிக்கப்பட்ட இலைகளை வெட்டவும்."),  
    3: ("Apple - Healthy", "Apple - Healthy Remedy (English): No disease detected. Maintain proper pruning, watering, and balanced fertilization to keep trees healthy. Regularly inspect for pests or disease symptoms. \n மருந்து (தமிழில்): நோய் இல்லை. மரங்களை ஆரோக்கியமாக வைத்திருக்க சரியான剪枝, தண்ணீர் வழங்கல், மற்றும் சமமான உரம் பயன்படுத்தவும். பூச்சிகள் மற்றும் நோய் அறிகுறிகளை அடிக்கடி பரிசோதிக்கவும்."),  
    4: ("Blueberry - Healthy", "Blueberry - Healthy Remedy (English): No disease detected. Ensure proper irrigation, pH-balanced soil, and mulch to retain soil moisture. Prevent fungal infections by avoiding overhead watering.  \n மருந்து (தமிழில்): நோய் இல்லை. செடிகளுக்கு சரியான நீர்ப்பாசனம், சமநிலையிலான மண் pH (5.0-5.5), மற்றும் மண் ஈரப்பதத்தை பராமரிக்க மழைபோல் தண்ணீர் சேர்க்கவும். பூஞ்சை தொற்றை தடுப்பதற்காக செடிகள் மேல் தண்ணீர் தெளிக்காமல் இருக்கவும்."),  
    5: ("Cherry - Powdery Mildew", "Cherry - Powdery Mildew Remedy (English): Apply sulfur-based fungicides and remove infected parts. Avoid excessive nitrogen fertilizers and ensure proper air circulation.  \n மருந்து (தமிழில்): சல்பர் அடிப்படையிலான பூஞ்சைநாசினிகளை தெளிக்கவும், பாதிக்கப்பட்ட பகுதிகளை அகற்றவும். அதிகளவு நைட்ரஜன் உரங்களை தவிர்க்கவும். மரங்களுக்கு போதுமான காற்றோட்டம் கிடைப்பதை உறுதி செய்யவும்."),  
    6: ("Cherry - Healthy", "Cherry - Healthy Remedy (English): No disease detected. Provide well-drained soil and proper sunlight exposure. Monitor for pest activity and prune trees regularly. \n  மருந்து (தமிழில்): நோய் இல்லை. நல்ல வடிகால் வசதியுள்ள மண் மற்றும் போதுமான வெளிச்சம் தரவும். பூச்சிகள் வருமா என கண்காணிக்கவும், மரங்களை சரியாக剪枝 செய்யவும்."),  
    7: ("Corn - Cercospora Leaf Spot", "Corn - Cercospora Leaf Spot Remedy (English): Use fungicides containing strobilurin or triazoles. Rotate crops and remove infected plant debris. Maintain optimal plant spacing. \n  மருந்து (தமிழில்): ஸ்டிரோபிலூரின் அல்லது ட்ரையசோல்கள் உள்ள பூஞ்சைநாசினிகளை பயன்படுத்தவும். பயிர்களை மாறி பயிரிடவும், பாதிக்கப்பட்ட தாவர பகுதிகளை அகற்றவும். செடிகள் சரியான இடைவெளியில் வளருமா என உறுதி செய்யவும்."),  
    8: ("Corn - Common Rust", "Corn - Common Rust Remedy (English): Apply fungicides such as propiconazole or tebuconazole. Plant rust-resistant corn varieties. Remove volunteer corn plants to reduce disease spread.  \n மருந்து (தமிழில்): புரோபிக்கோனசோல் அல்லது டெபுக்கோனசோல் போன்ற பூஞ்சைநாசினிகளை தெளிக்கவும். தாங்கும்திறன் கொண்ட மக்காச்சோளம் வகைகளை பயிரிடவும். நோய் பரவாமல் இருக்க பழைய பயிர்களை அகற்றவும்."),  
    9: ("Corn - Northern Leaf Blight", "Corn - Northern Leaf Blight Remedy (English): Use fungicides like azoxystrobin and practice crop rotation. Maintain adequate plant nutrition and remove infected debris.  \n மருந்து (தமிழில்): அசோக்‌ஸிஸ்ட்ரோபின் போன்ற பூஞ்சைநாசினிகளை பயன்படுத்தவும். பயிர் மாறுதல் கடைப்பிடிக்கவும். செடிகளுக்கு போதுமான ஊட்டச்சத்து கிடைக்குமா என உறுதி செய்யவும், பாதிக்கப்பட்ட பாகங்களை அகற்றவும்."),  
    10: ("Corn - Healthy", "Corn - Healthy Remedy (English): No disease detected. Ensure soil fertility by adding organic matter and providing balanced NPK fertilizers. Proper irrigation techniques will improve growth.  \n மருந்து (தமிழில்): நோய் இல்லை. மண்ணின் உரச்சத்தை பேணுவதற்கு பசுமச்சாணி சேர்க்கவும், சமமான NPK உரங்களை வழங்கவும். முறையான நீர்ப்பாசனம் செடிகளின் வளர்ச்சியை மேம்படுத்தும்."),  
    11: ("Grape - Black Rot", "Grape - Black Rot Remedy (English): Remove and destroy mummified berries and infected leaves. Apply fungicides like Mancozeb or Captan. Ensure good air circulation in the vineyard. \n  மருந்து (தமிழில்): பாதிக்கப்பட்ட பழங்களை மற்றும் நோய் தாக்கிய இலைகளை அகற்றி அழிக்கவும். மான்கோசெப் அல்லது கேப்டான் போன்ற பூஞ்சைநாசினிகளை பயன்படுத்தவும். திராட்சை தோட்டத்தில் நல்ல காற்றோட்டம் ஏற்படுமா என உறுதி செய்யவும்."),  
    12: ("Grape - Esca (Black Measles)", "Grape - Esca Remedy (English): Prune affected vines early and apply fungicides. Avoid excessive irrigation and use well-drained soil. Remove infected wood.  \n மருந்து (தமிழில்): பாதிக்கப்பட்ட கொடிகளை வேகமாக剪枝 செய்யவும், பூஞ்சைநாசினிகளை தெளிக்கவும். அதிக நீர்ப்பாசனத்தை தவிர்க்கவும், நல்ல வடிகால் வசதியுள்ள மண்ணை பயன்படுத்தவும். பாதிக்கப்பட்ட மரப்பகுதிகளை அகற்றவும்."),  
    13: ("Grape - Leaf Blight", "Grape - Leaf Blight Remedy (English): Use Bordeaux mixture or copper-based fungicides. Remove diseased leaves and improve soil drainage. Avoid overhead irrigation.  \n மருந்து (தமிழில்): போர்டோ மேழ்சர் அல்லது காப்பர் அடிப்படையிலான பூஞ்சைநாசினிகளை பயன்படுத்தவும். நோய்த்தாக்கிய இலைகளை அகற்றவும், நல்ல வடிகால் வசதியை உறுதி செய்யவும். செடிகள் மேல் நேரடியாக தண்ணீர் தெளிக்காதீர்கள்."),  
    14: ("Grape - Healthy", "Grape - Healthy Remedy (English): No disease detected. Maintain proper pruning and provide adequate sunlight. Use organic compost to improve soil health.  \n மருந்து (தமிழில்): நோய் இல்லை. சரியான剪枝 செய்து போதுமான வெளிச்சம் கிடைக்குமா என உறுதி செய்யவும். மண்ணின் ஆரோக்கியத்தை மேம்படுத்த இயற்கை உரங்களை சேர்க்கவும்."),  
    15: ("Orange - Citrus Greening", "Orange - Citrus Greening Remedy (English): Remove infected trees to prevent further spread. Use insecticides to control psyllid populations. Apply balanced fertilizers to maintain tree health.  \n மருந்து (தமிழில்): நோய்த்தாக்கிய மரங்களை அகற்றவும், நோய் பரவாமல் தடுப்பதற்காக. சில்லிட் (psyllid) பூச்சிகளை கட்டுப்படுத்த பூச்சி நாசினிகளை பயன்படுத்தவும். சமமான உரங்களை பயன்படுத்தி மரங்களை ஆரோக்கியமாக வைத்திருக்கவும்."),  
    16: ("Peach - Bacterial Spot", "Peach - Bacterial Spot Remedy (English): Apply copper-based bactericides. Avoid overhead irrigation. Remove infected leaves and fruits to reduce bacterial spread. \n  மருந்து (தமிழில்): காப்பர் அடிப்படையிலான பாக்டீரியா நாசினிகளை தெளிக்கவும். செடிகள் மேல் நேரடியாக தண்ணீர் தெளிக்காதீர்கள். நோய்த்தாக்கிய இலைகள் மற்றும் பழங்களை அகற்றவும்."),  
    17: ("Peach - Healthy", "Peach - Healthy Remedy (English): No disease detected. Ensure proper air circulation and provide well-balanced nutrients. Monitor for early disease symptoms. \n  மருந்து (தமிழில்): நோய் இல்லை. மரங்களுக்கு போதுமான காற்றோட்டம் கிடைக்குமா என உறுதி செய்யவும். சமமான ஊட்டச்சத்து வழங்கவும், தொடக்க நிலை நோய்க்குறிகளை கவனிக்கவும்."),  
    18: ("Pepper - Bacterial Spot", "Pepper - Bacterial Spot Remedy (English): Use copper sprays to control bacterial spread. Remove infected leaves and use resistant pepper varieties. Rotate crops annually.  \n மருந்து (தமிழில்): பாக்டீரியா பரவுவதை கட்டுப்படுத்த காப்பர் ஸ்பிரேக்களை பயன்படுத்தவும். பாதிக்கப்பட்ட இலைகளை அகற்றவும், நோய் எதிர்ப்பு சக்தி உள்ள மிளகாய் வகைகளை பயிரிடவும். ஆண்டுதோறும் பயிர் மாறுதல் கடைப்பிடிக்கவும்."),  
    19: ("Pepper - Healthy", "Pepper - Healthy Remedy (English): No disease detected. Ensure proper sunlight, well-drained soil, and use organic mulches. Monitor for pest attacks.  \n மருந்து (தமிழில்): நோய் இல்லை. செடிகளுக்கு போதுமான வெளிச்சம் மற்றும் நல்ல வடிகால் வசதி கொண்ட மண் கிடைக்குமா என உறுதி செய்யவும். இயற்கை பூச்சிக்கொல்லிகளை பயன்படுத்தி பூச்சிகள் தாக்குவதை கண்காணிக்கவும்."),  
    20: ("Potato - Early Blight", "Potato - Early Blight Remedy (English): Apply fungicides like Chlorothalonil. Use crop rotation and remove infected debris to prevent reinfection. Avoid overwatering.  \n மருந்து (தமிழில்): கிளோரோதலோனில் போன்ற பூஞ்சைநாசினிகளை தெளிக்கவும். பயிர் மாறுதல் கடைப்பிடிக்கவும். மீண்டும் நோய் பரவாமல் தடுப்பதற்கு, பாதிக்கப்பட்ட தாவர பகுதிகளை அகற்றவும். அதிகமாக தண்ணீர் கொடுக்காதீர்கள்."),  
    21: ("Potato - Late Blight", "Potato - Late Blight Remedy (English): Use resistant potato varieties and apply fungicides like Mancozeb. Remove infected plants and avoid wet conditions around the crop. \n  மருந்து (தமிழில்): நோய் எதிர்ப்பு சக்தி கொண்ட உருளைக்கிழங்கு வகைகளை பயிரிடவும். மான்கோசெப் போன்ற பூஞ்சைநாசினிகளை தெளிக்கவும். பாதிக்கப்பட்ட செடிகளை அகற்றவும், அதிக ஈரப்பதம் உருவாகாதவாறு கவனிக்கவும்."),  
    22: ("Potato - Healthy", "Potato - Healthy Remedy (English): No disease detected. Maintain soil fertility using compost and organic matter. Avoid overwatering to prevent fungal diseases. \n  மருந்து (தமிழில்): நோய் இல்லை. மண்ணின் வளத்தை உயர்த்த இயற்கை உரங்களை பயன்படுத்தவும். பூஞ்சை நோய்கள் தாக்காமல் இருக்க, அதிகமாக நீர் வழங்குவதை தவிர்க்கவும்."),  
    23: ("Raspberry - Healthy", "Raspberry - Healthy Remedy (English): No disease detected. Ensure proper pruning and remove old canes to prevent infections. Use mulch to retain soil moisture.  \n மருந்து (தமிழில்): நோய் இல்லை. சரியான剪枝 செய்து பழைய கிளைகளை அகற்றவும். மண்ணில் ஈரப்பதத்தை பராமரிக்க மழைச்சேமிப்பு பொருட்களை (mulch) பயன்படுத்தவும்."),  
    24: ("Soybean - Healthy", "Soybean - Healthy Remedy (English): No disease detected. Use balanced fertilizers and ensure good drainage. Monitor for early signs of pests and diseases.  \n மருந்து (தமிழில்): நோய் இல்லை. சமமான உரங்களை பயன்படுத்தவும், நல்ல வடிகால் வசதி ஏற்படுத்தவும். தொடக்க நிலை பூச்சி தாக்கம் மற்றும் நோய்க்குறிகளை கண்காணிக்கவும்."),  
    25: ("Squash - Powdery Mildew", "Squash - Powdery Mildew Remedy (English): Apply sulfur-based fungicides or neem oil. Ensure good air circulation and avoid overhead watering. \n  மருந்து (தமிழில்): சல்ஃபர் அடிப்படையிலான பூஞ்சைநாசினிகள் அல்லது வேப்பெண்ணெய் தெளிக்கவும். நல்ல காற்றோட்டம் இருக்குமா என உறுதி செய்யவும். செடிகள் மேல் நேரடியாக தண்ணீர் தெளிக்காதீர்கள்."),  
    26: ("Strawberry - Leaf Scorch", "Strawberry - Leaf Scorch Remedy (English): Apply fungicides like copper hydroxide. Ensure proper spacing between plants and water at the base to reduce humidity. \n  மருந்து (தமிழில்): காப்பர் ஹைட்ராக்சைடு போன்ற பூஞ்சைநாசினிகளை தெளிக்கவும். செடிகளுக்கு இடையே போதுமான இடைவெளியை உறுதி செய்யவும். அதிக ஈரப்பதம் உருவாகாமல் அடிப்பகுதியில் மட்டும் நீர் அளிக்கவும்."),  
    27: ("Strawberry - Healthy", "Strawberry - Healthy Remedy (English): No disease detected. Keep soil well-drained and use organic fertilizers. Remove dead leaves to prevent fungal growth. \n  மருந்து (தமிழில்): நோய் இல்லை. நல்ல வடிகால் வசதியுள்ள மண்ணை பயன்படுத்தவும். இயற்கை உரங்களை சேர்க்கவும். பூஞ்சை வளர்ச்சியை தடுக்க, உதிர்ந்த இலைகளை அகற்றவும்."),  
    28: ("Tomato - Bacterial Spot", "Tomato - Bacterial Spot Remedy (English): Use copper-based sprays and remove infected leaves. Avoid working in the garden when plants are wet. Practice crop rotation. \n மருந்து (தமிழில்): காப்பர் அடிப்படையிலான ஸ்பிரேக்களை தெளிக்கவும். பாதிக்கப்பட்ட இலைகளை அகற்றவும். செடிகள் ஈரமாக இருக்கும் போது தோட்டத்தில் வேலை செய்யாதீர்கள். பயிர் மாறுதல் கடைப்பிடிக்கவும்."),  
    29: ("Tomato - Early Blight", "Tomato - Early Blight Remedy (English): Apply fungicides like Chlorothalonil. Space plants properly for airflow. Remove infected leaves and use resistant varieties.  \n மருந்து (தமிழில்): கிளோரோதலோனில் போன்ற பூஞ்சைநாசினிகளை தெளிக்கவும். செடிகளுக்கு இடையே போதுமான இடைவெளி வைக்கவும். பாதிக்கப்பட்ட இலைகளை அகற்றவும், நோய் எதிர்ப்பு சக்தி உள்ள வகைகளை பயிரிடவும்."),  
    30: ("Tomato - Late Blight", "Tomato - Late Blight Remedy (English): Apply fungicides like copper sprays. Improve air circulation by proper pruning. Avoid overhead watering.  \n மருந்து (தமிழில்): காப்பர் அடிப்படையிலான பூஞ்சைநாசினிகளை தெளிக்கவும்.剪枝 மூலம் நல்ல காற்றோட்டம் ஏற்படுமா என உறுதி செய்யவும். செடிகள் மேல் நேரடியாக தண்ணீர் தெளிக்காதீர்கள்."),  
    31: ("Tomato - Leaf Mold", "Tomato - Leaf Mold Remedy (English): Ensure good airflow by pruning lower leaves. Use fungicides like copper-based sprays. Avoid high humidity conditions.  \n மருந்து (தமிழில்): கீழ் இலைகளை剪枝 செய்து நல்ல காற்றோட்டத்தை உறுதி செய்யவும். காப்பர் அடிப்படையிலான பூஞ்சைநாசினிகளை பயன்படுத்தவும். அதிக ஈரப்பதம் உருவாகாமல் கவனிக்கவும்."),  
    32: ("Tomato - Septoria Leaf Spot", "Tomato - Septoria Leaf Spot Remedy (English): Apply fungicides like Chlorothalonil. Remove and destroy infected leaves. Avoid overhead watering. \n  மருந்து (தமிழில்): கிளோரோதலோனில் போன்ற பூஞ்சைநாசினிகளை தெளிக்கவும். பாதிக்கப்பட்ட இலைகளை அகற்றி எரிக்கவும். செடிகள் மேல் நேரடியாக நீர் தெளிக்காதீர்கள்."),  
    33: ("Tomato - Spider Mites", "Tomato - Spider Mite Remedy (English): Use neem oil or insecticidal soap to control mites. Spray water on the undersides of leaves. Introduce natural predators like ladybugs.  \n மருந்து (தமிழில்): வேப்பெண்ணெய் அல்லது பூச்சி கட்டுப்படுத்தும் சோப்புகளை பயன்படுத்தவும். இலைகளின் அடிப்பகுதியில் தண்ணீர் தெளிக்கவும். லேடிபக் (ladybugs) போன்ற இயற்கை எதிரிகளைக் கொண்டு வரவும்."),  
    34: ("Tomato - Target Spot", "Tomato - Target Spot Remedy (English): Use fungicides like Mancozeb or Chlorothalonil. Avoid wetting leaves and maintain proper spacing between plants. மருந்து (தமிழில்):  \n மான்கோசெப் அல்லது கிளோரோதலோனில் போன்ற பூஞ்சைநாசினிகளை பயன்படுத்தவும். இலைகளை நனைக்காதீர்கள். செடிகளுக்கு இடையே போதுமான இடைவெளியை வைத்திருக்கவும்."),  
    35: ("Tomato - Yellow Leaf Curl Virus", "Tomato - Yellow Leaf Curl Virus Remedy (English): Control whiteflies using insecticides. Remove infected plants to prevent the spread. Use virus-resistant tomato varieties.  \n மருந்து (தமிழில்): வெள்ளை இறக்கை பூச்சிகளை கட்டுப்படுத்த பூச்சி நாசினிகளை பயன்படுத்தவும். நோய் தொற்றுள்ள செடிகளை அகற்றவும். நோய் எதிர்ப்பு சக்தி கொண்ட தக்காளி வகைகளை பயிரிடவும்."),  
    36: ("Tomato - Tomato Mosaic Virus", "Tomato - Tomato Mosaic Virus Remedy (English): Remove infected plants immediately. Disinfect gardening tools regularly. Avoid handling plants after touching infected ones.  \n மருந்து (தமிழில்): பாதிக்கப்பட்ட செடிகளை உடனே அகற்றவும். தோட்ட உபகரணங்களை ஒழுங்காக கிருமிநாசினி கொண்டு சுத்தம் செய்யவும். பாதிக்கப்பட்ட செடிகளை தொடிந்த பிறகு, மற்ற செடிகளை தொடுவதற்கு முன்பு கைகளை கழுவவும்."),  
    37: ("Tomato - Healthy", "Tomato - Healthy Remedy (English): No disease detected. Maintain proper soil nutrition and irrigation. Rotate crops yearly to reduce disease risk. \n மருந்து (தமிழில்): நோய் இல்லை. மண்ணின் சத்துக்கள் சமநிலையாக்கவும். போதுமான நீர் அளிக்கவும். நோய்கள் ஏற்படாமல் தடுக்கும் வகையில், வருடம் தோறும் பயிர் மாறுதல் கடைப்பிடிக்கவும்.")  
}

# Function to predict disease and provide remedy
def predict_disease(image_path):
    try:
        image = load_img(image_path, target_size=(224, 224))  # Ensure correct input size
        image = img_to_array(image) / 255.0  # Normalize
        image = np.expand_dims(image, axis=0)  # Expand to 4D
        
        result = model.predict(image)
        pred_class = np.argmax(result)
        
        disease, remedy = disease_classes.get(pred_class, ("Unknown Disease", "No remedy available."))
        return disease, remedy
    except Exception as e:
        return "Error", str(e)

# Initialize Flask app
app = Flask(__name__)
UPLOAD_FOLDER = "static/upload"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/')
def home():
    return render_template('INDEX1.html')

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return "No file uploaded."
    
    file = request.files['image']
    if file.filename == '':
        return "No selected file."
    
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(file_path)
    
    disease, remedy = predict_disease(file_path)
    return render_template('RESULT.html', disease=disease, remedy=remedy, user_image=file.filename)

if __name__ == '__main__':
    app.run(debug=True, port=8000)

from fastapi import APIRouter, UploadFile, File
import cv2
import numpy as np
import os
import json
import mediapipe as mp
import tensorflow as tf
from tensorflow.keras.models import load_model

router = APIRouter(tags=["Gesture Recognition"])

# 1. SETUP PATHS & LOAD MODEL
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "../ml-model/static_mvp_model.h5")
LABEL_PATH = os.path.join(BASE_DIR, "../ml-model/static_mvp_label_map.json")

model = None
labels_lookup = {}

try:
    if os.path.exists(MODEL_PATH) and os.path.exists(LABEL_PATH):
        model = load_model(MODEL_PATH)
        with open(LABEL_PATH, 'r') as f:
            labels_map = json.load(f)
            labels_lookup = {v: k for k, v in labels_map.items()}
        print("✅ Model Loaded!")
    else:
        print("❌ Model files missing.")
except Exception as e:
    print(f"❌ Error loading model: {e}")

mp_hands = mp.solutions.hands

def extract_keypoints(image_bytes):
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None: return None

        # ---------------------------------------------------------
        # 🛠️ FIX: FLIP THE IMAGE HORIZONTALLY
        # This fixes the "Mirror Effect" so Right Hand is detected as Right Hand
        img = cv2.flip(img, 1) 
        # ---------------------------------------------------------

        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        with mp_hands.Hands(static_image_mode=True, max_num_hands=2, min_detection_confidence=0.5) as hands:
            results = hands.process(img_rgb)
            keypoints = np.zeros(126) 
            
            if results.multi_hand_landmarks:
                for hand_landmarks, handedness in zip(results.multi_hand_landmarks, results.multi_handedness):
                    landmarks = np.array([[lm.x, lm.y, lm.z] for lm in hand_landmarks.landmark]).flatten()
                    
                    label = handedness.classification[0].label
                    # Now that we flipped the image, 'Right' should correctly map to 'Right'
                    if label == 'Left':
                        keypoints[:63] = landmarks
                    elif label == 'Right':
                        keypoints[63:] = landmarks
            return keypoints
    except Exception as e:
        print(f"Error extracting keypoints: {e}")
        return None

@router.post("/predict/sign")
async def predict_sign(file: UploadFile = File(...)):
    if model is None:
        return {"label": "Error", "confidence": 0.0, "message": "Model not loaded."}

    contents = await file.read()
    keypoints = extract_keypoints(contents)
    
    if keypoints is None or np.sum(keypoints) == 0:
        return {"label": "No Hand", "confidence": 0.0, "message": "No hand detected."}

    try:
        input_data = keypoints.reshape(1, -1)
        prediction = model.predict(input_data)
        
        class_index = np.argmax(prediction)
        confidence = float(np.max(prediction))
        predicted_label = labels_lookup.get(class_index, "Unknown")
        
        # 🔍 DEBUG LOG: Use this to see what the model is thinking
        print(f"📸 Prediction: {predicted_label} | Confidence: {confidence:.2f}")

        return {
            "label": predicted_label,
            "confidence": confidence,
            "message": "Real-time AI Prediction"
        }
    except Exception as e:
        print(f"Prediction Error: {e}")
        return {"label": "Error", "confidence": 0.0, "message": str(e)}
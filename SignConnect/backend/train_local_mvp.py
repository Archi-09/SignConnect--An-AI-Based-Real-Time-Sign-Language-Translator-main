import os
import cv2
import numpy as np
import json
import mediapipe as mp
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense

# ==========================================
# ⚙️ CONFIGURATION: YOUR DATA PATHS
# ==========================================
DATA_FOLDERS = [
    "C:/Users/Lenovo/Desktop/SignConnect_Static_Data/data",
    "C:/Users/Lenovo/Desktop/ProcessedData",
    "C:/Users/Lenovo/Desktop/Text_to_Sign"
]

MODEL_OUTPUT_DIR = "ml-model"
# ==========================================

# 1. SETUP MEDIAPIPE
mp_hands = mp.solutions.hands

def extract_landmarks_from_image(img_path, max_num_hands=2):
    """ Reads image, processes with MediaPipe, and extracts 126 keypoints. """
    try:
        img_bgr = cv2.imread(img_path)
        if img_bgr is None: return np.zeros(126) 
        
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        
        with mp_hands.Hands(static_image_mode=True, max_num_hands=max_num_hands) as hands:
            results = hands.process(img_rgb)
            keypoints = np.zeros(126) # 63 left + 63 right
            
            if results.multi_hand_landmarks:
                for hand_landmarks, handedness in zip(results.multi_hand_landmarks, results.multi_handedness):
                    landmarks = np.array([[lm.x, lm.y, lm.z] for lm in hand_landmarks.landmark]).flatten()
                    
                    label = handedness.classification[0].label
                    if label == 'Left':
                        keypoints[:63] = landmarks
                    elif label == 'Right':
                        keypoints[63:] = landmarks
                        
            return keypoints
    except Exception as e:
        print(f"Error processing {img_path}: {e}")
        return np.zeros(126)

# 2. LOAD DATA FROM ALL FOLDERS
X, y = [], []
print("🚀 Starting Data Extraction...")

for root_dir in DATA_FOLDERS:
    if not os.path.exists(root_dir):
        print(f"⚠️  WARNING: Folder not found, skipping: {root_dir}")
        continue
    
    print(f"📂 Scanning: {root_dir}...")
    
    # Iterate over sign folders (e.g., 'A', 'Hello', 'Bad')
    for lbl in os.listdir(root_dir):
        class_folder = os.path.join(root_dir, lbl)
        if not os.path.isdir(class_folder): continue
        
        image_count = 0
        # Iterate over images inside the sign folder
        for img_name in os.listdir(class_folder):
            img_path = os.path.join(class_folder, img_name)
            
            # Process only Images
            if img_path.lower().endswith(('.png', '.jpg', '.jpeg')):
                lm = extract_landmarks_from_image(img_path)
                
                # Check if hands were detected (not empty)
                if np.sum(lm) > 0:
                     X.append(lm)
                     y.append(lbl)
                     image_count += 1
        
        if image_count > 0:
            print(f"   -> Found {image_count} images for '{lbl}'")

X = np.array(X, dtype=np.float32)
y = np.array(y)

print(f"\n✅ TOTAL SAMPLES LOADED: {X.shape[0]}")

if X.shape[0] == 0:
    print("❌ ERROR: No images found! (If these folders contain only videos, this is normal for this specific script)")
    exit()

# 3. ENCODE LABELS & SPLIT
le = LabelEncoder()
y_enc = le.fit_transform(y)
labels_map = dict(zip(le.classes_, range(len(le.classes_))))

# Helper to convert int32 to standard int for JSON serialization
labels_map_export = {k: int(v) for k, v in labels_map.items()}

print(f"🏷️  Classes Detected: {len(labels_map)}")

X_train, X_test, y_train, y_test = train_test_split(X, y_enc, test_size=0.15, random_state=42, stratify=y_enc)

# 4. BUILD & TRAIN MODEL
static_mvp_model = Sequential()
static_mvp_model.add(Dense(128, activation='relu', input_shape=(X_train.shape[1],)))
static_mvp_model.add(Dense(64, activation='relu'))
static_mvp_model.add(Dense(len(labels_map), activation='softmax'))

static_mvp_model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

print("🧠 Training Model...")
static_mvp_model.fit(
    X_train, y_train,
    validation_data=(X_test, y_test),
    epochs=15, 
    batch_size=32
)

# 5. SAVE ARTIFACTS
if not os.path.exists(MODEL_OUTPUT_DIR):
    os.makedirs(MODEL_OUTPUT_DIR)

model_path = os.path.join(MODEL_OUTPUT_DIR, 'static_mvp_model.h5')
map_path = os.path.join(MODEL_OUTPUT_DIR, 'static_mvp_label_map.json')

static_mvp_model.save(model_path)
with open(map_path, 'w') as f:
    json.dump(labels_map_export, f)

print(f"\n🎉 SUCCESS! Model saved to: {model_path}")
print(f"🎉 Labels saved to: {map_path}")
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# 1. DATABASE SETUP
from database.connection import engine, Base
# Import models so they are registered with Base before creation
from database import user_table

# Create tables automatically if they don't exist
Base.metadata.create_all(bind=engine)

# 2. IMPORT ROUTERS
from routers import auth, gesture, text_to_sign, user

app = FastAPI(title="SignConnect API")

# 3. SETUP CORS (Allow Frontend to talk to Backend)
app.add_middleware(
    CORSMiddleware,
    # Allow your React app origin
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    # Allow all methods (GET, POST, PUT, DELETE)
    allow_methods=["*"],
    allow_headers=["*"],  # Allow all headers
)

# ================= CONFIGURATION =================
# NOTE: These paths must match EXACTLY in routers/text_to_sign.py
VIDEO_ROOTS = [
    r"C:\Users\Lenovo\Desktop\Text_to_Sign",
    r"C:\Users\Lenovo\Desktop\ProcessedData",
    r"C:\Users\Lenovo\Desktop\SignConnect_Static_Data\data"
]
# =================================================

# 4. MOUNT MULTIPLE VIDEO FOLDERS (Robust Version)
print("--- Mounting Video Folders ---")
for i, path in enumerate(VIDEO_ROOTS):
    # Check if path exists before trying to mount
    if os.path.exists(path) and os.path.isdir(path):
        try:
            # Mounts as /videos/0, /videos/1, /videos/2
            mount_path = f"/videos/{i}"
            app.mount(mount_path, StaticFiles(directory=path), name=f"videos_{i}")
            print(f"✅ Success: Mounted [{path}] at [{mount_path}]")
        except Exception as e:
            print(f"❌ Error mounting [{path}]: {e}")
    else:
        print(f"⚠️ Warning: Path not found, skipping mount: {path}")
print("------------------------------")


# 5. INCLUDE ROUTERS
app.include_router(auth.router)
app.include_router(gesture.router)
app.include_router(text_to_sign.router)
app.include_router(user.router)

@app.get("/")
def home():
    return {"message": "SignConnect Backend is Live & Robust 🚀"}
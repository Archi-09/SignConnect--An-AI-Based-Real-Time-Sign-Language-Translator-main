from fastapi import APIRouter, HTTPException
import os
from urllib.parse import quote

router = APIRouter(tags=["Text to Sign"])

# ================= CONFIGURATION =================
# NOTE: These paths must match EXACTLY in main.py
# We use absolute paths here based on your setup.
VIDEO_ROOTS = [
    r"C:\Users\Lenovo\Desktop\Text_to_Sign",
    r"C:\Users\Lenovo\Desktop\ProcessedData",
    r"C:\Users\Lenovo\Desktop\SignConnect_Static_Data\data"
]
BASE_URL = "http://127.0.0.1:8000/videos"
# =================================================

@router.post("/text-to-sign")
def convert_text_to_video_urls(payload: dict):
    """
    Search for media (video OR image) across all folders.
    Robust version: Handles missing folders gracefully.
    """
    text = payload.get("text", "").strip().upper()
    words = text.split()
    
    media_urls = []
    missing_words = []

    for word in words:
        found_media = None
        
        # Search for the word folder in ALL video roots
        for i, root_path in enumerate(VIDEO_ROOTS):
            # Ensure root path exists before trying to list it
            if not os.path.exists(root_path) or not os.path.isdir(root_path):
                print(f"⚠️ Warning: Source folder not found, skipping: {root_path}")
                continue
                
            target_folder = None
            try:
                # List all folders to find a case-insensitive match (e.g., 'Hello' matches 'HELLO')
                for folder_name in os.listdir(root_path):
                    if folder_name.upper() == word:
                        target_folder = os.path.join(root_path, folder_name)
                        break
            except Exception as e:
                print(f"Error scanning root {root_path}: {e}")
                continue
            
            if target_folder and os.path.isdir(target_folder):
                # Look for ANY media files (Video OR Image) inside the word folder
                try:
                    files = os.listdir(target_folder)
                    # Priority: Video first, then Image
                    video_files = [f for f in files if f.lower().endswith(('.mp4', '.avi', '.mov', '.mkv'))]
                    image_files = [f for f in files if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
                    
                    selected_file = None
                    if video_files:
                        selected_file = video_files[0]
                    elif image_files:
                        selected_file = image_files[0]

                    if selected_file:
                        safe_filename = quote(selected_file)
                        # URL format: /videos/{index}/{RealFolderName}/{filename}
                        real_folder_name = os.path.basename(target_folder)
                        # Use forward slashes for URLs regardless of OS
                        media_url = f"{BASE_URL}/{i}/{real_folder_name}/{safe_filename}"
                        found_media = media_url
                        break # Stop searching other roots if found
                except Exception as e:
                     print(f"Error reading folder {target_folder}: {e}")
                     continue
        
        if found_media:
            media_urls.append(found_media)
        else:
            print(f"❌ Could not find media for word: {word}")
            missing_words.append(word)

    return {
        "found_videos": media_urls,
        "missing_words": missing_words
    }

@router.get("/learning/list-signs")
def list_available_signs():
    """
    Scans all VIDEO_ROOTS and returns a list of unique signs found.
    Robust version: Handles missing folders gracefully.
    """
    all_signs = set()
    
    for root_path in VIDEO_ROOTS:
        if not os.path.exists(root_path) or not os.path.isdir(root_path):
             print(f"⚠️ Warning: Cannot list signs from missing folder: {root_path}")
             continue

        try:
            items = os.listdir(root_path)
            for item in items:
                folder_path = os.path.join(root_path, item)
                if os.path.isdir(folder_path):
                    # Only add if it actually contains media files
                    try:
                        files = os.listdir(folder_path)
                        has_media = any(f.lower().endswith(('.mp4', '.avi', '.png', '.jpg', '.jpeg')) for f in files)
                        if has_media:
                            # Add the folder name (the sign word) to the set
                            all_signs.add(item)
                    except Exception:
                        pass
        except Exception as e:
            print(f"⚠️ Error scanning {root_path}: {e}")

    return {"signs": sorted(list(all_signs), key=str.casefold)}
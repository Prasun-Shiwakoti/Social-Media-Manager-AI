from .logger import logger
import hashlib

def hash_text(text, length=16):
    return hashlib.sha256(text.encode('utf-8')).hexdigest()[:length]

def check_embedding_exist(collection, id_text):
    try:
        collection_with_url = collection.get(ids=[hash_text(id_text)])['ids']
        return True if collection_with_url else False
    except Exception:
        return False
    
def get_data(filepath):
    # For demo purposes, we read from a local file. In production, this could be a database or API call.
    logger.info(f"Reading data file: {filepath}")
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        raise ValueError(f"Data file not found at {filepath}. Please ensure the file exists.")
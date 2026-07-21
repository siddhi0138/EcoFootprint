import json

import firebase_admin
from firebase_admin import credentials, firestore

from utils.config import get_settings


def get_firestore_client():
    if not firebase_admin._apps:
        settings = get_settings()
        if settings.firebase_service_account_json:
            cred = credentials.Certificate(json.loads(settings.firebase_service_account_json))
        elif settings.firebase_service_account_path:
            cred = credentials.Certificate(settings.firebase_service_account_path)
        else:
            raise RuntimeError("No Firebase service account configured")
        firebase_admin.initialize_app(cred)
    return firestore.client()

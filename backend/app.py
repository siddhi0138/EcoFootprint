from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routes import carbon, chat, insights, product, rag, recommendations, recipes, email
from routes.product import UPLOAD_DIR
from utils.config import get_settings

settings = get_settings()
app = FastAPI(title="EcoFootprint API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

app.include_router(product.router, prefix="/api/product", tags=["product"])
app.include_router(rag.router, prefix="/api/rag", tags=["rag"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["recommendations"])
app.include_router(carbon.router, prefix="/api/carbon", tags=["carbon"])
app.include_router(insights.router, prefix="/api/insights", tags=["insights"])
app.include_router(recipes.router, prefix="/api/recipes", tags=["recipes"])
app.include_router(email.router, prefix="/api/email", tags=["email"])


@app.get("/health")
def health():
    return {"status": "ok"}

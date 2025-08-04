from fastapi import FastAPI
from routers import auth, users, chats, offers, favorites
import models
from database import engine
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
import logging
from config import API_HOST, API_PORT

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Avito")

@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"Received request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response

app.middleware("http")(log_requests)


app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(offers.router, prefix="/offers", tags=["offers"])
app.include_router(chats.router, prefix="/chats", tags=["chats"])
app.include_router(favorites.router, prefix="/favorites", tags=["favorites"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Avito"}

if __name__ == "__main__":
    uvicorn.run(app, host=API_HOST, port=API_PORT, reload=True)
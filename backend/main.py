from fastapi import FastAPI
from routers import auth, users, chats, messages, offers, favorites
import models
from database import engine
import uvicorn
from config import API_HOST, API_PORT

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Pet Sitting App")

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(offers.router, prefix="/offers", tags=["offers"])
app.include_router(chats.router, prefix="/chats", tags=["chats"])
app.include_router(favorites.router, prefix="/favorites", tags=["favorites"])

@app.get("/")
def root():
    return {"message": "Avito"}

if __name__ == "__main__":
    uvicorn.run(app, host=API_HOST, port=API_PORT, reload=True)

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from auth_utils import get_current_active_user

router = APIRouter()

@router.post("/", response_model=schemas.MessageOut)
async def create_message(
    message: schemas.MessageCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    # Проверка, что пользователь участвует в чате
    chat = db.query(models.Chat).filter(models.Chat.id == message.chat_id).first()
    if not chat or (current_user.id != chat.user1_id and current_user.id != chat.user2_id):
        raise HTTPException(status_code=403, detail="Not authorized to send message in this chat")
    
    db_message = models.Message(**message.dict(), sender_id=current_user.id)
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

@router.get("/chat/{chat_id}", response_model=List[schemas.MessageOut])
async def get_messages(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    # Проверка, что пользователь участвует в чате
    chat = db.query(models.Chat).filter(models.Chat.id == chat_id).first()
    if not chat or (current_user.id != chat.user1_id and current_user.id != chat.user2_id):
        raise HTTPException(status_code=403, detail="Not authorized to view messages in this chat")
    
    messages = db.query(models.Message).filter(models.Message.chat_id == chat_id).all()
    return messages


from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from auth_utils import get_current_active_user
from datetime import datetime

router = APIRouter()

@router.post("/start", response_model=schemas.Chat)
async def start_chat(
    chat_data: schemas.ChatCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    offer = db.query(models.Offer).filter(models.Offer.id == chat_data.offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    if offer.owner_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot start chat with yourself")

    existing_chat = db.query(models.Chat).filter(
        models.Chat.offer_id == chat_data.offer_id,
        ((models.Chat.user1_id == current_user.id) & (models.Chat.user2_id == offer.owner_id)) |
        ((models.Chat.user1_id == offer.owner_id) & (models.Chat.user2_id == current_user.id))
    ).first()

    if existing_chat:
        new_message = models.Message(content=chat_data.message, sender_id=current_user.id, chat_id=existing_chat.id)
        db.add(new_message)
        db.commit()
        db.refresh(existing_chat)
        return existing_chat

    new_chat = models.Chat(user1_id=current_user.id, user2_id=offer.owner_id, offer_id=chat_data.offer_id)
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)

    new_message = models.Message(content=chat_data.message, sender_id=current_user.id, chat_id=new_chat.id)
    db.add(new_message)
    db.commit()
    db.refresh(new_chat)

    return new_chat


@router.get("", response_model=List[schemas.Chat])
async def get_chats(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    try:
        chats = db.query(models.Chat).filter(
            (models.Chat.user1_id == current_user.id) | (models.Chat.user2_id == current_user.id)
        ).all()
        return chats
    except Exception as e:
        print(f"Error fetching chats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{chat_id}/messages")
async def get_chat_messages(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    chat = db.query(models.Chat).filter(models.Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    if chat.user1_id != current_user.id and chat.user2_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this chat")
    
    messages = db.query(models.Message).filter(models.Message.chat_id == chat_id).order_by(models.Message.created_at.desc()).all()
    return messages

@router.post("/{chat_id}/messages", response_model=schemas.Message)
async def create_message(
    chat_id: int,
    message: schemas.MessageCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    try:
        chat = db.query(models.Chat).filter(models.Chat.id == chat_id).first()
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        if chat.user1_id != current_user.id and chat.user2_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to send messages in this chat")
        
        db_message = models.Message(
            content=message.content,
            sender_id=current_user.id,
            chat_id=chat_id,
            created_at=datetime.utcnow()  # Изменено с timestamp на created_at
        )
        db.add(db_message)
        db.commit()
        db.refresh(db_message)
        return db_message
    except Exception as e:
        print(f"Error creating message: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Добавьте этот роут для создания нового чата
@router.post("/", response_model=schemas.Chat)
async def create_chat(
    chat_data: schemas.ChatCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    offer = db.query(models.Offer).filter(models.Offer.id == chat_data.offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    if offer.owner_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot start chat with yourself")

    existing_chat = db.query(models.Chat).filter(
        models.Chat.offer_id == chat_data.offer_id,
        ((models.Chat.user1_id == current_user.id) & (models.Chat.user2_id == offer.owner_id)) |
        ((models.Chat.user1_id == offer.owner_id) & (models.Chat.user2_id == current_user.id))
    ).first()

    if existing_chat:
        return existing_chat

    new_chat = models.Chat(user1_id=current_user.id, user2_id=offer.owner_id, offer_id=chat_data.offer_id)
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)

    return new_chat

@router.get("/{chat_id}", response_model=schemas.ChatDetail)
async def get_chat(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    chat = db.query(models.Chat).filter(models.Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    if chat.user1_id != current_user.id and chat.user2_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this chat")
    
    # Загружаем связанные данные
    db.refresh(chat)
    
    # Убедимся, что у пользователей есть имена
    if not chat.user1.name:
        chat.user1.name = "Пользователь"
    if not chat.user2.name:
        chat.user2.name = "Пользователь"
    
    return chat
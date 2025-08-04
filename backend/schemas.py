
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    email: str
    name: Optional[str] = None
    avatar: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        orm_mode = True

class OfferBase(BaseModel):
    title: str
    description: str
    price: float
    image_url: Optional[str] = None

class OfferCreate(OfferBase):
    pass

class OfferOut(OfferBase):
    id: int
    owner_id: int
    created_at: datetime
    is_active: bool
    is_favorite: bool = False

    class Config:
        orm_mode = True

class Offer(OfferBase):
    id: int
    owner_id: int
    created_at: datetime

    class Config:
        orm_mode = True

class OfferDetail(Offer):
    is_favorite: bool

    class Config:
        orm_mode = True

class OfferUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None
        
class FavoriteCreate(BaseModel):
    offer_id: int

class Favorite(BaseModel):
    id: int
    user_id: int
    offer_id: int

    class Config:
        orm_mode = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    avatar: Optional[str] = None

class ChangePassword(BaseModel):
    old_password: str
    new_password: str

class ChatBase(BaseModel):
    user1_id: int
    user2_id: int

class MessageBase(BaseModel):
    content: str

class MessageCreate(BaseModel):
    content: str

class Message(MessageBase):
    id: int
    sender_id: int
    chat_id: int
    created_at: datetime

    class Config:
        orm_mode = True

class MessageOut(Message):
    sender: User

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class AvatarUpdate(BaseModel):
    avatar_url: str

class ChatCreate(BaseModel):
    offer_id: int
    message: str

class Chat(BaseModel):
    id: int
    user1_id: int
    user2_id: int
    offer_id: int
    offer: Offer  # Добавляем связь с объявлением
    user1: User  # Добавляем связь с пользователем 1
    user2: User  # Добавляем связь с пользователем 2

    class Config:
        orm_mode = True

class UserPublic(BaseModel):
    id: int
    email: EmailStr
    name: Optional[str] = None  # Сделайте поле name необязательным
    avatar: Optional[str] = None  # Сделайте поле avatar необязательным

    class Config:
        orm_mode = True

class ChatDetail(BaseModel):
    id: int
    user1_id: int
    user2_id: int
    offer_id: int
    offer: Offer
    user1: UserPublic
    user2: UserPublic

    class Config:
        orm_mode = True

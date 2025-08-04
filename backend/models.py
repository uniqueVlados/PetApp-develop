
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime, timezone

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    name = Column(String, nullable=True)  # Сделайте поле name необязательным
    avatar = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)

    offers = relationship("Offer", back_populates="owner")
    favorites = relationship("Favorite", back_populates="user")
    messages = relationship("Message", back_populates="sender")

class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    is_active = Column(Boolean, default=True)
    image_url = Column(String)

    owner = relationship("User", back_populates="offers")
    chats = relationship("Chat", back_populates="offer")
    favorited_by = relationship("Favorite", back_populates="offer")


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    offer_id = Column(Integer, ForeignKey("offers.id"))

    user = relationship("User", back_populates="favorites")
    offer = relationship("Offer", back_populates="favorited_by")

    __table_args__ = (UniqueConstraint('user_id', 'offer_id', name='_user_offer_uc'),)

class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True)
    user1_id = Column(Integer, ForeignKey("users.id"))
    user2_id = Column(Integer, ForeignKey("users.id"))
    offer_id = Column(Integer, ForeignKey('offers.id'))

    messages = relationship("Message", back_populates="chat")
    offer = relationship("Offer", back_populates="chats")
    user1 = relationship("User", foreign_keys=[user1_id])
    user2 = relationship("User", foreign_keys=[user2_id])

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String)
    sender_id = Column(Integer, ForeignKey("users.id"))
    chat_id = Column(Integer, ForeignKey("chats.id"))
    created_at = Column(DateTime, default=datetime.utcnow)  # Добавьте это поле

    sender = relationship("User", back_populates="messages")
    chat = relationship("Chat", back_populates="messages")
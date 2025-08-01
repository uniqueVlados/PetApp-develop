from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from auth_utils import get_current_active_user, get_password_hash, verify_password
from typing import List
import shutil
import os

router = APIRouter()


router = APIRouter()

@router.post("/me/avatar")
async def update_avatar(
    avatar_data: schemas.AvatarUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    current_user.avatar = avatar_data.avatar_url
    db.commit()
    return {"info": "Avatar updated successfully"}


@router.get("/me", response_model=schemas.User)
async def read_users_me(current_user: schemas.User = Depends(get_current_active_user)):
    return current_user

@router.put("/me", response_model=schemas.User)
async def update_user(
    user: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    db_user = db.query(models.User).filter(models.User.id == current_user.id).first()
    for key, value in user.dict(exclude_unset=True).items():
        if key == "password":
            setattr(db_user, "hashed_password", get_password_hash(value))
        else:
            setattr(db_user, key, value)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/", response_model=List[schemas.User])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@router.get("/{user_id}", response_model=schemas.UserPublic)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return schemas.UserPublic(
        id=user.id,
        email=user.email,
        name=user.name or "",  # Используем пустую строку, если имя отсутствует
        avatar=user.avatar or ""  # Используем пустую строку, если аватар отсутствует
    )

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    db_user = db.query(models.User).filter(models.User.id == current_user.id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(db_user)
    db.commit()
    return {"message": "User deleted successfully"}

@router.put("/me/update", response_model=schemas.User)
async def update_user(
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    if user_update.name is not None:
        current_user.name = user_update.name
    if user_update.email is not None:
        current_user.email = user_update.email
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/me/change-password", response_model=schemas.User)
async def change_password(
    passwords: schemas.ChangePassword,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    if not verify_password(passwords.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect old password")
    
    current_user.hashed_password = get_password_hash(passwords.new_password)
    db.commit()
    db.refresh(current_user)
    return current_user
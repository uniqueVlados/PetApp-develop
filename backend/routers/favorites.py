
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from auth_utils import get_current_active_user

router = APIRouter()

@router.post("/")
async def add_to_favorites(
    favorite: schemas.FavoriteCreate,
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Проверяем, существует ли уже такая запись
    existing_favorite = db.query(models.Favorite).filter(
        models.Favorite.user_id == current_user.id,
        models.Favorite.offer_id == favorite.offer_id
    ).first()

    if existing_favorite:
        # Если запись уже существует, возвращаем её
        return existing_favorite

    # Если записи нет, создаем новую
    db_favorite = models.Favorite(user_id=current_user.id, offer_id=favorite.offer_id)
    db.add(db_favorite)
    db.commit()
    db.refresh(db_favorite)
    return db_favorite

@router.delete("/{offer_id}")
async def remove_from_favorites(
    offer_id: int,
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    favorite = db.query(models.Favorite).filter(
        models.Favorite.user_id == current_user.id,
        models.Favorite.offer_id == offer_id
    ).first()
    
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    db.delete(favorite)
    db.commit()
    return {"status": "success", "message": "Favorite removed"}

@router.get("", response_model=List[schemas.Offer])
async def get_favorites(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    favorites = db.query(models.Offer).join(models.Favorite).filter(
        models.Favorite.user_id == current_user.id
    ).all()
    return favorites

@router.get("/check/{offer_id}")
async def check_favorite(
    offer_id: int,
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    favorite = db.query(models.Favorite).filter(
        models.Favorite.user_id == current_user.id,
        models.Favorite.offer_id == offer_id
    ).first()
    return {"is_favorite": favorite is not None}
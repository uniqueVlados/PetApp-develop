from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Query
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from auth_utils import get_current_active_user
import shutil
import os

router = APIRouter()

@router.post("", response_model=schemas.Offer)
async def create_offer(
    offer: schemas.OfferCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    offer_data = offer.dict()
    offer_data['owner_id'] = current_user.id
    if 'is_active' not in offer_data:
        offer_data['is_active'] = True
    db_offer = models.Offer(**offer_data)
    db.add(db_offer)
    db.commit()
    db.refresh(db_offer)
    return db_offer

@router.get("", response_model=List[schemas.OfferOut])
async def read_offers(
    skip: int = 0,
    limit: int = 100,
    favorites_only: bool = False,
    exclude_own: bool = False,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    query = db.query(models.Offer)
    if favorites_only:
        query = query.join(models.Favorite).filter(models.Favorite.user_id == current_user.id)
    if exclude_own:
        query = query.filter(models.Offer.owner_id != current_user.id)
    
    offers = query.offset(skip).limit(limit).all()
    
    # Получаем ID избранных объявлений для текущего пользователя
    favorite_offer_ids = set(db.query(models.Favorite.offer_id)
                             .filter(models.Favorite.user_id == current_user.id)
                             .all())
    favorite_offer_ids = {id for (id,) in favorite_offer_ids}
    
    # Преобразуем объекты Offer в OfferOut и добавляем информацию о избранном
    offer_out_list = []
    for offer in offers:
        offer_dict = offer.__dict__.copy()
        offer_dict['is_favorite'] = offer.id in favorite_offer_ids
        offer_out_list.append(schemas.OfferOut(**offer_dict))
    
    return offer_out_list

@router.get("/{offer_id}", response_model=schemas.OfferOut)
async def read_offer(
    offer_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    offer = db.query(models.Offer).filter(models.Offer.id == offer_id).first()
    if offer is None:
        raise HTTPException(status_code=404, detail="Offer not found")
    
    # Добавляем информацию о том, является ли предложение избранным для текущего пользователя
    offer.is_favorite = db.query(models.Favorite).filter(
        models.Favorite.user_id == current_user.id,
        models.Favorite.offer_id == offer.id
    ).first() is not None
    
    return offer


@router.put("/{offer_id}", response_model=schemas.OfferOut)
async def update_offer(
    offer_id: int,
    offer: schemas.OfferUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    db_offer = db.query(models.Offer).filter(models.Offer.id == offer_id).first()
    if db_offer is None:
        raise HTTPException(status_code=404, detail="Offer not found")
    if db_offer.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this offer")
    
    for key, value in offer.dict(exclude_unset=True).items():
        setattr(db_offer, key, value)
    
    db.commit()
    db.refresh(db_offer)
    return db_offer

@router.delete("/{offer_id}", response_model=schemas.Offer)
async def delete_offer(
    offer_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    offer = db.query(models.Offer).filter(models.Offer.id == offer_id).first()
    if offer is None:
        raise HTTPException(status_code=404, detail="Offer not found")
    if offer.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this offer")
    
    # Вместо удаления, просто деактивируем объявление
    offer.is_active = False
    db.commit()
    return offer

@router.post("/{offer_id}/upload_image")
async def upload_offer_image(
    offer_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    offer = db.query(models.Offer).filter(models.Offer.id == offer_id).first()
    if offer is None:
        raise HTTPException(status_code=404, detail="Offer not found")
    if offer.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to upload image for this offer")
    
    file_location = f"static/offer_images/{offer_id}_{file.filename}"
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
    
    offer.image_url = file_location
    db.commit()
    
    return {"info": f"File uploaded successfully to {file_location}"}
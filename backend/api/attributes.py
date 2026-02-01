from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
import bcrypt
from datetime import datetime
from sql.mysql_DB import db  # 導入你自己的 DatabaseManager
import logging
from typing import Dict, Any, Optional, List
logger = logging.getLogger(__name__)
router = APIRouter()
@router.post("/api/get/attributes")
async def get_attributes():
    return db.query_one("SELECT * FROM attributes")

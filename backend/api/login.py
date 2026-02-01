# main.py 或 app/routers/auth.py
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
import bcrypt
from datetime import datetime
from sql.mysql_DB import db  # 導入你自己的 DatabaseManager
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
logger = logging.getLogger(__name__)
router = APIRouter()

# 請求模型（對應前端傳來的欄位）
class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)  # 可自行調整最小長度
    morse_code: Optional[str] = Field(None, max_length=8)

# 回應模型（盡量保持與原版相同）
class RegisterResponse(BaseModel):
    name: str
    success: bool

@router.post("/api/auth/register", response_model=RegisterResponse)
async def register_user(req: RegisterRequest):
    # 前置校验...
    if not all([req.name, req.email, req.password]):
        raise HTTPException(400, "INVALID_REQUEST")
    if len(req.name) > 30 or len(req.password) > 20:
        raise HTTPException(400, "INVALID_REQUEST")

    try:
        with db.transaction() as cursor:
            # 1. 检查 email
            cursor.execute("SELECT id FROM users WHERE email = %s LIMIT 1", (req.email,))
            if cursor.fetchone():
                raise HTTPException(409, "SIGNAL_COLLISION: USER_EXISTS")

            # 2. 哈希密码
            password_hash = bcrypt.hashpw(
                req.password.encode('utf-8'),
                bcrypt.gensalt(12)
            ).decode('utf-8')

            # 3. 插入 users
            cursor.execute("""
                INSERT INTO users 
                (email, password_hash, name, morse_code, created_at)
                VALUES (%s, %s, %s, %s, %s)
            """, (
                req.email,
                password_hash,
                req.name,
                req.morse_code,
                datetime.utcnow()
            ))
            new_user_id = cursor.lastrowid

            if not new_user_id:
                raise RuntimeError("插入 users 失败")

            # 4. 初始化 user_settings "HH:mm"
            cursor.execute("""
                INSERT INTO user_settings (
                    user_id, language, birth_date, birth_time,
                    expectancy_preset, custom_expectancy,
                    sleep_offset, today_sleep_time, today_work_time,work_start,work_end,
                    decimal_precision, sound_enabled, gravity_enabled
                ) VALUES (
                    %s, 'zh-TW', '1990-01-01', '00:00:00',
                    'average', 85, 8.0, 8.0, 8.0,'09:00', '18:00', 6, FALSE, FALSE
                )
            """, (new_user_id,))

            # 5. 初始化 core_attributes
            cursor.execute("""
                INSERT INTO core_attributes (
                    user_id, health, mind, skill, social, adventure, spirit,
                    last_sync_at
                ) VALUES (
                    %s, 0.5000, 0.5000, 0.5000, 0.5000, 0.5000, 0.5000, %s
                )
            """, (new_user_id, datetime.utcnow()))

        # with 块正常结束 → 已 commit
        return {"name": req.name, "success": True}

    except HTTPException:
        raise  # 让 FastAPI 处理已知的 HTTP 异常
    except Exception as e:
        logger.error(f"注册事务失败: {str(e)}")
        raise HTTPException(500, "注册失败，请稍后重试")
    
class LoginRequest(BaseModel):
    email: EmailStr
    password: Optional[str] = None
    morse_code: Optional[str] = None

class UserInfo(BaseModel):
    id: int
    name: str
    email: str
    avatar_url: Optional[str] = None
    created_at: Any  # datetime 會自動轉 ISO 字串

class UserSettingsOut(BaseModel):
    language: str  # 'en' | 'zh-TW'
    birthDate: Optional[str] = None     # "YYYY-MM-DD"
    birthTime: Optional[str] = None     # "HH:mm"
    lifeExpectancyPreset: str           # 'custom' | 'average' | 'healthy'
    customLifeExpectancy: int
    sleepOffset: float
    todaySleepTime: float
    todayWorkTime: float
    workStart: Optional[str] = None     # "HH:mm"
    workEnd: Optional[str] = None       # "HH:mm"
    decimalPrecision: int
    progressBarStyle: str = "linear"    # 預設值，如果後端沒欄位
    soundEnabled: bool
    gravityEnabled: bool
    anniversaries: List[dict] = []      # 暫時空陣列，未來加欄位再擴充

class CoreAttributesOut(BaseModel):
    health: float
    mind: float
    skill: float
    social: float
    adventure: float
    spirit: float
    last_sync_at: datetime

class LoginResponse(BaseModel):
    success: bool
    user: UserInfo
    settings: UserSettingsOut
    attributes: CoreAttributesOut

@router.post("/api/auth/login", response_model=LoginResponse)
async def login_user(req: LoginRequest):
    if not req.email:
        raise HTTPException(status_code=400, detail="缺少 email")

    try:
        # Step 1: 先根據 email 查詢用戶完整資料（包含 settings 和 attributes）
        
        sql = """
            SELECT
                u.id, u.name, u.email, u.morse_code, u.avatar_url, u.created_at,
                u.password_hash,
                s.language, s.birth_date, s.birth_time, s.expectancy_preset, s.custom_expectancy,
                s.sleep_offset, s.today_sleep_time, s.today_work_time, s.decimal_precision,
                s.sound_enabled, s.gravity_enabled,
                a.health, a.mind, a.skill, a.social, a.adventure, a.spirit, a.last_sync_at
            FROM users u
            LEFT JOIN user_settings s ON u.id = s.user_id
            LEFT JOIN core_attributes a ON u.id = a.user_id
            WHERE u.email = %s
            LIMIT 1
        """
        user_data = db.query_one(sql, (req.email,))

        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="IDENTITY_MISMATCH: ACCESS_DENIED"
            )

        # Step 2: 身份驗證（完全保留你原來的邏輯）
        authenticated = False

        # 優先檢查 morse_code
        if req.morse_code:
            if user_data['morse_code'] and user_data['morse_code'] == req.morse_code:
                authenticated = True

        # 再檢查 password
        elif req.password:
            if bcrypt.checkpw(
                req.password.encode('utf-8'),
                user_data['password_hash'].encode('utf-8')
            ):
                authenticated = True
        print(user_data)
        # 特殊測試帳號
        if req.email == 'test@chronos.com':
            if req.password == '123456' or req.morse_code == '........':
                authenticated = True
                user_data['name'] = "Chronos Pioneer"  # 確保測試帳號也回傳正確名字

        if not authenticated:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="IDENTITY_MISMATCH: ACCESS_DENIED"
            )

        # Step 3: 成功！回傳完整資料（前端首頁一次就夠了）
        return {
            "success": True,
            "user": {
                "id": user_data['id'],
                "name": user_data['name'],
                "email": user_data['email'],
                "avatar_url": user_data['avatar_url'],
                "created_at": user_data['created_at'].isoformat() if user_data['created_at'] else None
            },
            "settings": {
                "language": user_data.get('language', 'zh-TW'),
                "birthDate": user_data['birth_date'].isoformat() if user_data.get('birth_date') else None,
                "birthTime": str(user_data['birth_time']) if user_data.get('birth_time') else "00:00:00",
                "lifeExpectancyPreset": user_data.get('expectancy_preset', 'average'),
                "customLifeExpectancy": int(user_data.get('custom_expectancy', 85)),
                "sleepOffset": float(user_data.get('sleep_offset', 8.0)),
                "todaySleepTime": float(user_data.get('today_sleep_time', 8.0)),
                "todayWorkTime": float(user_data.get('today_work_time', 8.0)),
                "decimalPrecision": int(user_data.get('decimal_precision', 6)),
                "soundEnabled": bool(user_data.get('sound_enabled', False)),
                "gravityEnabled": bool(user_data.get('gravity_enabled', False)),
                "workStart": user_data.get('work_start', '09:00'),
                "workEnd": user_data.get('work_end', '18:00'),
                "progressBarStyle": "linear",
                "anniversaries": []
            },
            "attributes": {
                "health": float(user_data.get('health', 0.5)),
                "mind": float(user_data.get('mind', 0.5)),
                "skill": float(user_data.get('skill', 0.5)),
                "social": float(user_data.get('social', 0.5)),
                "adventure": float(user_data.get('adventure', 0.5)),
                "spirit": float(user_data.get('spirit', 0.5)),
                "last_sync_at":  user_data.get('last_sync_at', datetime.now())
            }
        }

    except HTTPException:
        # 已知的 400/401 錯誤，直接拋出給 FastAPI 處理
        raise
    except Exception as e:
        # 任何資料庫或其他意外錯誤，都記 log 並回統一訊息
        logger.error(f"登入過程發生錯誤: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="伺服器內部錯誤，請稍後再試"
        )
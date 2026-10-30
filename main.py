from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
from typing import List, Optional

app = FastAPI(title="活動報名平台 API")
@app.get("/")
def read_root():
    return {"message": "後端 API 伺服器運作中！請前往 /docs 查看 API 文件。"}

# 允許前端跨網域請求 (CORS)，方便您在本機開發測試
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 資料庫連線設定 (請替換為您實際的 PostgreSQL 帳密與設定)
DB_CONFIG = {
    "dbname": "activity_platform",  
    "user": "postgres",        
    "password": "Ray980997",    
    "host": "localhost",
    "port": "5432"
}

# 建立資料庫連線的共用函式
def get_db_connection():
    try:
        # 使用 RealDictCursor 讓查詢結果直接以 Dictionary (JSON) 格式返回
        conn = psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)
        return conn
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"資料庫連線失敗: {str(e)}")

# 定義接收前端資料的 Pydantic 模型
class ActivityCreate(BaseModel):
    activity_name: str
    activity_description: Optional[str] = None
    activity_time: datetime

class RegistrationCreate(BaseModel):
    activity_id: int
    name: str
    phone: str

# 1. 取得所有活動清單
@app.get("/api/activities")
def get_activities():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM activities ORDER BY activity_time ASC;")
    activities = cur.fetchall()
    cur.close()
    conn.close()
    return activities

# 2. 新增活動
@app.post("/api/activities")
def create_activity(activity: ActivityCreate):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            """
            INSERT INTO activities (activity_name, activity_description, activity_time)
            VALUES (%s, %s, %s) RETURNING activity_id;
            """,
            (activity.activity_name, activity.activity_description, activity.activity_time)
        )
        new_id = cur.fetchone()['activity_id']
        conn.commit()
        return {"message": "活動新增成功", "activity_id": new_id}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

# 3. 提交報名表
@app.post("/api/registrations")
def create_registration(reg: RegistrationCreate):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            """
            INSERT INTO registrations (activity_id, name, phone)
            VALUES (%s, %s, %s) RETURNING registration_id;
            """,
            (reg.activity_id, reg.name, reg.phone)
        )
        new_id = cur.fetchone()['registration_id']
        conn.commit()
        return {"message": "報名成功", "registration_id": new_id}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

# 4. 查看指定活動的報名清單
@app.get("/api/registrations")
def get_registrations(activity_id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT * FROM registrations WHERE activity_id = %s ORDER BY registration_time DESC;",
        (activity_id,)
    )
    registrations = cur.fetchall()
    cur.close()
    conn.close()
    return registrations
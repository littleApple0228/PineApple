import sqlite3
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="PineApple Activity Platform API")

# 允許跨域請求 (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_FILE = "pineapple.db"

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            starts_at TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            activity_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (activity_id) REFERENCES activities(id)
        )
    ''')
    conn.commit()
    conn.close()

@app.on_event("startup")
def startup_event():
    init_db()

class ActivityCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    startsAt: str

class RegistrationCreate(BaseModel):
    activityId: int
    name: str
    phone: str

# 1. 取得所有活動清單
@app.get("/api/activities")
def get_activities():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, description, starts_at as startsAt, created_at as createdAt FROM activities ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return {"data": [dict(row) for row in rows]}

# 2. 新增活動
@app.post("/api/activities", status_code=201)
def create_activity(data: ActivityCreate):
    if not data.title.strip():
        raise HTTPException(status_code=400, detail="活動名稱必填")
    
    starts_at = data.startsAt.replace("T", " ")
    if len(starts_at) == 16:
        starts_at += ":00"

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO activities (title, description, starts_at) VALUES (?, ?, ?)",
        (data.title.strip(), data.description.strip(), starts_at)
    )
    act_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {
        "data": {
            "id": act_id,
            "title": data.title.strip(),
            "description": data.description.strip(),
            "startsAt": data.startsAt
        }
    }

# 3. 新增報名紀錄
@app.post("/api/registrations", status_code=201)
def create_registration(data: RegistrationCreate):
    if not data.name.strip() or not data.phone.strip():
        raise HTTPException(status_code=400, detail="請填寫完整姓名與電話")
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM activities WHERE id = ?", (data.activityId,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="找不到該活動")

    cursor.execute(
        "INSERT INTO registrations (activity_id, name, phone) VALUES (?, ?, ?)",
        (data.activityId, data.name, data.phone)
    )
    reg_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {
        "data": {
            "id": reg_id,
            "activityId": data.activityId,
            "name": data.name,
            "phone": data.phone
        }
    }

# 4. 查看指定活動的報名名單 (補齊需求4)
@app.get("/api/activities/{activity_id}/registrations")
def get_activity_registrations(activity_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, name, phone, created_at as createdAt FROM registrations WHERE activity_id = ? ORDER BY id DESC",
        (activity_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    return {"data": [dict(row) for row in rows]}
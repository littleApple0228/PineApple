-- 建立資料庫 (若不存在)
CREATE DATABASE IF NOT EXISTS activity_platform;
USE activity_platform;

-- 建立活動表 (activities)
CREATE TABLE IF NOT EXISTS activities (
    activity_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '活動編號',
    activity_name VARCHAR(255) NOT NULL COMMENT '活動名稱',
    activity_description TEXT COMMENT '活動說明',
    activity_time DATETIME NOT NULL COMMENT '活動時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 建立報名表 (registrations)
CREATE TABLE IF NOT EXISTS registrations (
    registration_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '報名編號',
    activity_id INT NOT NULL COMMENT '活動編號',
    name VARCHAR(100) NOT NULL COMMENT '姓名',
    phone VARCHAR(20) NOT NULL COMMENT '聯絡電話 (使用VARCHAR以保留開頭的0)',
    registration_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '報名時間',
    FOREIGN KEY (activity_id) REFERENCES activities(activity_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

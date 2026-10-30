import express from 'express';
import {validateActivity} from './validation.js';
export function createApp(pool){
 const app=express();app.disable('x-powered-by');app.use(express.json({limit:'32kb'}));
 app.post('/api/activities',async(req,res,next)=>{
 const parsed=validateActivity(req.body);if(parsed.error)return res.status(400).json({error:parsed.error});
 try{const {title,description,startsAt}=parsed.data;
 const [result]=await pool.execute('INSERT INTO activities (title, description, starts_at) VALUES (?, ?, ?)',[title,description,startsAt]);
 res.status(201).json({data:{id:result.insertId,title,description,startsAt:startsAt.replace(' ','T')+'+08:00'}});
 }catch(error){next(error);}});
 // --- 以下為組員 B 負責的 API ---

  // 1. 取得所有活動清單
  app.get('/api/activities', async (req, res, next) => {
    try {
      const [rows] = await pool.execute('SELECT * FROM activities');
      res.json({ data: rows });
    } catch (error) {
      next(error);
    }
  });

  // 2. 新增活動報名紀錄
  app.post('/api/registrations', async (req, res, next) => {
    try {
      const { activityId, name, phone } = req.body;
      if (!activityId || !name || !phone) {
        return res.status(400).json({ error: '請填寫完整資訊：活動ID、姓名與電話' });
      }
      const [result] = await pool.execute(
        'INSERT INTO registrations (activity_id, name, phone) VALUES (?, ?, ?)',
        [activityId, name, phone]
      );
      res.status(201).json({
        data: { id: result.insertId, activityId, name, phone }
      });
    } catch (error) {
      next(error);
    }
  });
 app.use('/api',(req,res)=>res.status(404).json({error:'此 API 尚未實作或不存在。'}));
 app.use((error,req,res,next)=>{if(error.type==='entity.parse.failed')return res.status(400).json({error:'JSON 格式錯誤。'});if(error.type==='entity.too.large')return res.status(413).json({error:'送出資料過大。'});console.error('Request failed:',error.code||error.name);res.status(503).json({error:'目前無法儲存活動，請確認資料庫連線後重試。'});});
 return app;
}

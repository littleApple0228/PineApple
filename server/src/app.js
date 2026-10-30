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
 app.use('/api',(req,res)=>res.status(404).json({error:'此 API 尚未實作或不存在。'}));
 app.use((error,req,res,next)=>{if(error.type==='entity.parse.failed')return res.status(400).json({error:'JSON 格式錯誤。'});if(error.type==='entity.too.large')return res.status(413).json({error:'送出資料過大。'});console.error('Request failed:',error.code||error.name);res.status(503).json({error:'目前無法儲存活動，請確認資料庫連線後重試。'});});
 return app;
}

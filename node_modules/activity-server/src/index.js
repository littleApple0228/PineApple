import mysql from 'mysql2/promise';
import express from 'express';
import {fileURLToPath} from 'node:url';
import {createApp} from './app.js';
const pool=mysql.createPool({host:process.env.DB_HOST||'127.0.0.1',port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER||'activity_user',password:process.env.DB_PASSWORD,database:process.env.DB_NAME||'activity_platform',waitForConnections:true,connectionLimit:5,dateStrings:true});
const app=createApp(pool);
const dist=fileURLToPath(new URL('../../client/dist/',import.meta.url));
app.use(express.static(dist));
const server=app.listen(Number(process.env.PORT||3001),'127.0.0.1',()=>console.log('Activity server: http://127.0.0.1:'+ (process.env.PORT||3001)));
async function shutdown(){server.close(async()=>{await pool.end();process.exit(0);});}
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);

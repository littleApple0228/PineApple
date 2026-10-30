import test from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from '../src/app.js';
async function request(t,pool,body,raw=false){const server=createApp(pool).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));t.after(()=>new Promise(r=>server.close(r)));const response=await fetch(`http://127.0.0.1:${server.address().port}/api/activities`,{method:'POST',headers:{'Content-Type':'application/json'},body:raw?body:JSON.stringify(body)});return {status:response.status,body:await response.json()};}
const valid={title:'  桌遊活動  ',description:'週末見',startsAt:'2026-11-10T10:00'};
test('新增成功，使用參數化 SQL 並回傳活動編號',async t=>{let called=false;const result=await request(t,{execute:async(sql,params)=>{called=true;assert.match(sql,/VALUES \(\?, \?, \?\)/);assert.deepEqual(params,['桌遊活動','週末見','2026-11-10 10:00:00']);return [{insertId:12}];}},valid);assert.equal(called,true);assert.equal(result.status,201);assert.equal(result.body.data.id,12);assert.equal(result.body.data.startsAt,'2026-11-10T10:00:00+08:00');});
for(const [label,body] of [['空白名稱',{...valid,title:' '}],['超長名稱',{...valid,title:'a'.repeat(101)}],['超長說明',{...valid,description:'a'.repeat(2001)}],['不存在日期',{...valid,startsAt:'2026-02-30T10:00'}],['非字串日期',{...valid,startsAt:12}],['缺少資料',null]])test(label+'應拒絕且不寫入',async t=>{const result=await request(t,{execute:async()=>{assert.fail('不得呼叫資料庫');}},body);assert.equal(result.status,400);});
test('JSON 格式錯誤回傳 400',async t=>{const result=await request(t,{},'{broken',true);assert.equal(result.status,400);});
test('資料庫故障不回傳成功或洩漏連線資訊',async t=>{const result=await request(t,{execute:async()=>{throw new Error('private database password');}},valid);assert.equal(result.status,503);assert.doesNotMatch(JSON.stringify(result.body),/password/);});

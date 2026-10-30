import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import './style.css';
function App(){
 const [page,setPage]=useState('create');
 const [form,setForm]=useState({title:'',description:'',startsAt:''});
 const [busy,setBusy]=useState(false); const [message,setMessage]=useState(null);
 function change(e){setForm({...form,[e.target.name]:e.target.value});setMessage(null);}
 async function submit(e){e.preventDefault();if(busy)return;setBusy(true);setMessage(null);
 try{const response=await fetch('/api/activities',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
 const result=await response.json();if(!response.ok)throw new Error(result.error||'新增失敗，請稍後重試。');
 setMessage({ok:true,text:`活動「${result.data.title}」已新增成功！活動編號：${result.data.id}`});setForm({title:'',description:'',startsAt:''});
 }catch(error){setMessage({ok:false,text:error instanceof TypeError?'無法連線，請確認後端已啟動。':error.message});}finally{setBusy(false);}}
 return <><header><div className="nav"><a className="brand" href="#create" onClick={()=>setPage('create')}>◈ 活動集合所</a><nav aria-label="主要導覽">{[['list','活動清單'],['create','新增活動'],['registrations','報名清單']].map(([id,label])=><a key={id} href={'#'+id} aria-current={page===id?'page':undefined} onClick={()=>{setPage(id);setMessage(null)}}>{label}</a>)}</nav></div></header>
 <main><p className="eyebrow">ACTIVITY PLATFORM / ORGANIZER</p><h1>{page==='create'?'讓下一場相聚，從這裡開始。':page==='list'?'活動清單':'報名清單'}</h1><p className="intro">{page==='create'?'填寫活動資訊，建立一場值得期待的活動。':'此功能預留給其他組員接入，目前尚未完成。'}</p>
 {page==='create'?<div className="layout"><section className="card"><div className="card-head"><span className="step">01</span><div><h2>新增活動</h2><p>標示 * 的欄位為必填</p></div></div>
 <form onSubmit={submit}><label htmlFor="title">活動名稱 *</label><input id="title" name="title" value={form.title} onChange={change} required maxLength={100} placeholder="例如：週末桌遊交流會" disabled={busy}/>
 <label htmlFor="startsAt">活動時間 *</label><input id="startsAt" type="datetime-local" name="startsAt" value={form.startsAt} onChange={change} required disabled={busy}/><small>以台灣當地時間（UTC+8）填寫。</small>
 <label htmlFor="description">活動說明</label><textarea id="description" name="description" value={form.description} onChange={change} maxLength={2000} rows={6} placeholder="介紹活動內容、集合地點，以及參加者需要知道的事…" disabled={busy}/><small className="count">{form.description.length} / 2000</small>
 {message&&<div className={message.ok?'notice success':'notice error'} role={message.ok?'status':'alert'}>{message.text}</div>}
 <div className="actions"><span>確認資訊後即可建立活動</span><button disabled={busy} type="submit">{busy?'建立中…':'建立活動 →'}</button></div></form></section>
 <aside><span className="tag">主辦人的第一步</span><h2>把想法變成<br/>一次相聚。</h2><p>清楚的名稱、時間與說明，讓參加者更快了解你的活動。</p><hr/><p>01　取一個清楚的活動名稱</p><p>02　確認活動日期與時間</p><p>03　補上地點與參加須知</p></aside></div>:<section className="card placeholder"><h2>等待組員接入</h2><p>{page==='list'?'B：活動列表、報名表單與相關 API。':'C：依活動查詢報名名單與相關 API。'}</p><button onClick={()=>setPage('create')}>返回新增活動</button></section>}
 <footer>課堂專案 · A 模組 / 新增活動</footer></main></>;
}
createRoot(document.getElementById('root')).render(<App/>);

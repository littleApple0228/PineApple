import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

function App() {
  const [page, setPage] = useState('list'); // 'list' 或 'create'
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  
  // 報名表單狀態 (組員 B 負責)
  const [regForm, setRegForm] = useState({ name: '', phone: '' });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  // 1. 取得活動列表
  const fetchActivities = async () => {
    try {
      const res = await fetch('http://127.0.0.1:3001/api/activities');
      const data = await res.json();
      if (res.ok) {
        setActivities(data.data || []);
      }
    } catch (err) {
      console.error('無法取得活動列表:', err);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  // 2. 送出報名 (組員 B 負責)
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!selectedActivity) return;
    setBusy(true);
    setMessage(null);

    try {
      const res = await fetch('http://127.0.0.1:3001/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId: selectedActivity.id,
          name: regForm.name,
          phone: regForm.phone
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '報名失敗');

      setMessage({ ok: true, text: `🎉 報名成功！感謝 ${regForm.name} 的參與。` });
      setRegForm({ name: '', phone: '' });
      setSelectedActivity(null);
    } catch (err) {
      setMessage({ ok: false, text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <header>
        <div className="nav">
          <a className="brand" onClick={() => setPage('list')}>活動平台</a>
          <button onClick={() => { setPage('list'); fetchActivities(); }}>活動清單</button>
        </div>
      </header>

      <main>
        {message && (
          <div className={message.ok ? 'notice success' : 'notice error'}>
            {message.text}
          </div>
        )}

        {page === 'list' && (
          <section className="card">
            <h2>🎉 可報名的活動清單</h2>
            {activities.length === 0 ? (
              <p>目前尚無活動可報名。</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                {activities.map((act) => (
                  <div key={act.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
                    <h3>{act.title}</h3>
                    <p>{act.description}</p>
                    <small>時間：{act.starts_at || act.startsAt}</small>
                    <br />
                    <button 
                      style={{ marginTop: '10px' }} 
                      onClick={() => setSelectedActivity(act)}
                    >
                      點擊報名
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 報名彈窗 / 表單 */}
            {selectedActivity && (
              <div style={{ marginTop: '20px', padding: '15px', background: '#f9f9f9', border: '2px solid #007bff', borderRadius: '8px' }}>
                <h3>報名活動：{selectedActivity.title}</h3>
                <form onSubmit={handleRegister}>
                  <label htmlFor="name">姓名 *</label>
                  <input 
                    id="name"
                    type="text" 
                    required 
                    value={regForm.name} 
                    onChange={(e) => setRegForm({ ...regForm, name: e.target.value })} 
                  />

                  <label htmlFor="phone">聯絡電話 *</label>
                  <input 
                    id="phone"
                    type="tel" 
                    required 
                    value={regForm.phone} 
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })} 
                  />

                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button type="submit" disabled={busy}>
                      {busy ? '送出中...' : '確認送出報名'}
                    </button>
                    <button type="button" onClick={() => setSelectedActivity(null)}>取消</button>
                  </div>
                </form>
              </div>
            )}
          </section>
        )}
      </main>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
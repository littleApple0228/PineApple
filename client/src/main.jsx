import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

function App() {
  const [page, setPage] = useState('list'); // 'list' 或 'create'
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);

  // 查看報名名單的狀態
  const [viewingRegistrations, setViewingRegistrations] = useState(null); // 當前查看名單的活動
  const [registrationsList, setRegistrationsList] = useState([]);

  // 表單狀態
  const [actForm, setActForm] = useState({ title: '', description: '', startsAt: '' });
  const [regForm, setRegForm] = useState({ name: '', phone: '' });
  
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  // 取得活動列表
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

  // 取得指定活動的報名名單
  const fetchRegistrations = async (activity) => {
    try {
      setSelectedActivity(null); // 關閉報名表單
      const res = await fetch(`http://127.0.0.1:3001/api/activities/${activity.id}/registrations`);
      const data = await res.json();
      if (res.ok) {
        setRegistrationsList(data.data || []);
        setViewingRegistrations(activity);
      }
    } catch (err) {
      console.error('無法取得報名名單:', err);
    }
  };

  // 送出新增活動
  const handleCreateActivity = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch('http://127.0.0.1:3001/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || '新增失敗');

      setMessage({ ok: true, text: `🎉 活動「${data.data.title}」建立成功！` });
      setActForm({ title: '', description: '', startsAt: '' });
      await fetchActivities();
      setPage('list');
    } catch (err) {
      setMessage({ ok: false, text: err.message });
    } finally {
      setBusy(false);
    }
  };

  // 送出報名
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
      if (!res.ok) throw new Error(data.detail || data.error || '報名失敗');

      setMessage({ ok: true, text: `🎉 報名成功！感謝 ${regForm.name} 的參與。` });
      setRegForm({ name: '', phone: '' });

      // 若當前正開啟該活動的名單，自動刷新
      if (viewingRegistrations && viewingRegistrations.id === selectedActivity.id) {
        fetchRegistrations(selectedActivity);
      }
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
          <a className="brand" onClick={() => setPage('list')} style={{ cursor: 'pointer' }}>活動平台</a>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => { setPage('list'); fetchActivities(); setViewingRegistrations(null); setSelectedActivity(null); }}
              style={{ background: page === 'list' ? '#2e5b42' : '#ccc', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
            >
              活動清單
            </button>
            <button 
              onClick={() => { setPage('create'); setViewingRegistrations(null); setSelectedActivity(null); }}
              style={{ background: page === 'create' ? '#2e5b42' : '#ccc', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
            >
              + 新增活動
            </button>
          </div>
        </div>
      </header>

      <main>
        <p className="eyebrow">ACTIVITY PLATFORM / ORGANIZER</p>
        <h1>{page === 'create' ? '填寫活動資訊，建立一場值得期待的活動。' : '探索精彩活動，立即報名參加。'}</h1>

        <div className="layout">
          <section className="card">
            {message && (
              <div className={message.ok ? 'notice success' : 'notice error'} role="alert">
                {message.text}
              </div>
            )}

            {/* 1. 新增活動頁面 */}
            {page === 'create' && (
              <>
                <div className="card-head">
                  <span className="step">01</span>
                  <div>
                    <h2>新增活動</h2>
                    <p className="sub">標示 * 的欄位為必填</p>
                  </div>
                </div>

                <form onSubmit={handleCreateActivity}>
                  <label htmlFor="title">活動名稱 *</label>
                  <input 
                    id="title" 
                    type="text" 
                    required 
                    value={actForm.title} 
                    onChange={e => setActForm({...actForm, title: e.target.value})} 
                  />

                  <label htmlFor="startsAt">活動時間 *</label>
                  <input 
                    id="startsAt" 
                    type="datetime-local" 
                    required 
                    value={actForm.startsAt} 
                    onChange={e => setActForm({...actForm, startsAt: e.target.value})} 
                  />
                  <p className="hint">以台灣當地時間（UTC+8）填寫。</p>

                  <label htmlFor="description">活動說明</label>
                  <textarea 
                    id="description" 
                    rows={4}
                    value={actForm.description} 
                    onChange={e => setActForm({...actForm, description: e.target.value})} 
                  />

                  <div className="actions">
                    <span>確認資訊後即可建立活動</span>
                    <button type="submit" disabled={busy}>
                      {busy ? '建立中...' : '建立活動 →'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* 2. 活動清單、報名表單與查看名單 */}
            {page === 'list' && (
              <>
                <div className="card-head">
                  <span className="step">02</span>
                  <div>
                    <h2>🎉 可報名的活動清單</h2>
                    <p className="sub">選擇您有興趣的活動進行報名或查看參加者清單</p>
                  </div>
                </div>

                {activities.length === 0 ? (
                  <p style={{ margin: '20px 0', color: '#666' }}>目前尚無活動，請點選右上角「+ 新增活動」。</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                    {activities.map((act) => (
                      <div key={act.id} style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', background: '#fafafa' }}>
                        <h3 style={{ margin: '0 0 8px 0', color: '#1a202c' }}>{act.title}</h3>
                        <p style={{ margin: '0 0 8px 0', color: '#4a5568' }}>{act.description || '無詳細說明'}</p>
                        <small style={{ color: '#718096' }}>時間：{act.startsAt}</small>
                        <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                          <button 
                            type="button"
                            onClick={() => { setSelectedActivity(act); setViewingRegistrations(null); }}
                            style={{ padding: '8px 16px', background: '#2b6cb0', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            點擊報名
                          </button>
                          <button 
                            type="button"
                            onClick={() => fetchRegistrations(act)}
                            style={{ padding: '8px 16px', background: '#2e5b42', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            📋 查看報名清單
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 報名表單 */}
                {selectedActivity && (
                  <div style={{ marginTop: '24px', padding: '20px', background: '#ebf8ff', border: '2px solid #3182ce', borderRadius: '8px' }}>
                    <h3 style={{ margin: '0 0 12px 0', color: '#2b6cb0' }}>報名活動：{selectedActivity.title}</h3>
                    <form onSubmit={handleRegister}>
                      <label htmlFor="reg-name">姓名 *</label>
                      <input 
                        id="reg-name"
                        type="text" 
                        required 
                        value={regForm.name} 
                        onChange={(e) => setRegForm({ ...regForm, name: e.target.value })} 
                      />

                      <label htmlFor="reg-phone">聯絡電話 *</label>
                      <input 
                        id="reg-phone"
                        type="tel" 
                        required 
                        value={regForm.phone} 
                        onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })} 
                      />

                      <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                        <button type="submit" disabled={busy}>
                          {busy ? '送出中...' : '確認送出報名'}
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setSelectedActivity(null)}
                          style={{ background: '#cbd5e0', color: '#2d3748' }}
                        >
                          取消
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* 查看報名清單區塊 */}
                {viewingRegistrations && (
                  <div style={{ marginTop: '24px', padding: '20px', background: '#f0fff4', border: '2px solid #38a169', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h3 style={{ margin: 0, color: '#276749' }}>
                        📋 「{viewingRegistrations.title}」的報名名單 （共 {registrationsList.length} 人）
                      </h3>
                      <button 
                        onClick={() => setViewingRegistrations(null)}
                        style={{ padding: '4px 8px', background: '#e2e8f0', color: '#4a5568', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        關閉
                      </button>
                    </div>

                    {registrationsList.length === 0 ? (
                      <p style={{ color: '#718096', margin: 0 }}>目前尚無人報名此活動。</p>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead>
                          <tr style={{ background: '#c6f6d5', textAlign: 'left' }}>
                            <th style={{ padding: '8px', border: '1px solid #9ae6b4' }}>姓名</th>
                            <th style={{ padding: '8px', border: '1px solid #9ae6b4' }}>聯絡電話</th>
                            <th style={{ padding: '8px', border: '1px solid #9ae6b4' }}>報名時間</th>
                          </tr>
                        </thead>
                        <tbody>
                          {registrationsList.map((reg) => (
                            <tr key={reg.id} style={{ background: '#fff' }}>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{reg.name}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{reg.phone}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{reg.createdAt || '近期'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </>
            )}
          </section>

          <aside>
            <span className="tag">主辦人的第一步</span>
            <h2>把想法變成<br />一次相聚。</h2>
            <p>清楚的名稱、時間與說明，讓參加者更快了解你的活動。</p>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px', lineHeight: '2' }}>
              <li>01 取一個清楚的活動名稱</li>
              <li>02 確認活動日期與時間</li>
              <li>03 補上地點與參加須知</li>
            </ul>
          </aside>
        </div>
      </main>

      <footer>
        <p>蝶堂專案 ‧ A 模組 / 新增活動 & B 模組 / 活動列表、報名與查看名單</p>
      </footer>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSessions } from '../../lib/sessions';

export default function HistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getSessions().then(d=>{ setSessions(d); setLoading(false); }).catch(()=>setLoading(false));
  }, []);

  function sc(s) { return !s?'#7dd8d8':s>=8?'#4dbdbd':s>=6?'#e8c87a':'#e88a8a'; }
  function fmt(ts) {
    if (!ts) return '—';
    try { const d=new Date(ts); return d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}); } catch { return '—'; }
  }

  return (
    <main style={{minHeight:'100vh',padding:'24px 16px 60px'}}>
      <div style={{maxWidth:720,margin:'0 auto'}}>
        <button onClick={()=>router.push('/')} className="btn-ghost" style={{padding:'8px 16px',borderRadius:100,fontSize:13,marginBottom:24}}>← Home</button>
        <h1 style={{fontFamily:'Georgia,serif',fontSize:'2rem',fontWeight:800,color:'#e0f7f7',marginBottom:6}}>Interview History</h1>
        <p style={{color:'#7dd8d8',fontSize:13,marginBottom:28}}>All your past practice sessions</p>

        {loading&&<div style={{textAlign:'center',padding:40}}><div style={{width:32,height:32,border:'3px solid #4dbdbd',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>}

        {!loading&&sessions.length===0&&(
          <div className="glass" style={{padding:48,textAlign:'center'}}>
            <div style={{fontSize:36,marginBottom:12}}>🎤</div>
            <h3 style={{fontWeight:700,color:'#e0f7f7',marginBottom:8}}>No sessions yet</h3>
            <p style={{color:'#7dd8d8',fontSize:13,marginBottom:20}}>Start your first mock interview!</p>
            <button onClick={()=>router.push('/')} className="btn-ocean" style={{padding:'10px 28px',borderRadius:100,fontWeight:700,fontSize:14}}>Start Interview →</button>
          </div>
        )}

        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {sessions.map(s=>(
            <div key={s.id} onClick={()=>s.status==='completed'&&router.push('/results/'+s.id)}
              className="glass" style={{padding:20,cursor:s.status==='completed'?'pointer':'default',transition:'transform 0.2s'}}
              onMouseEnter={e=>s.status==='completed'&&(e.currentTarget.style.transform='scale(1.01)')}
              onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                    <span style={{fontSize:18}}>{s.type==='technical'?'⚡':'🧠'}</span>
                    <span style={{fontWeight:700,fontSize:14,color:'#e0f7f7'}}>{s.type==='technical'?'Technical — AI & Automation':'General / Behavioral'}</span>
                    <span style={{fontSize:11,padding:'2px 8px',borderRadius:100,background:s.status==='completed'?'rgba(77,189,189,0.15)':'rgba(232,200,122,0.15)',color:s.status==='completed'?'#4dbdbd':'#e8c87a'}}>{s.status==='completed'?'Completed':'In Progress'}</span>
                  </div>
                  <p style={{fontSize:12,color:'#7dd8d8'}}>{s.name} · {fmt(s.created_at)}</p>
                  {s.overall_feedback?.readinessLevel&&<p style={{fontSize:12,color:'#a8e8e8',marginTop:2}}>{s.overall_feedback.readinessLevel}</p>}
                </div>
                <div style={{textAlign:'right',marginLeft:16}}>
                  {s.score!=null?<><p style={{fontSize:24,fontWeight:800,color:sc(s.score)}}>{s.score}</p><p style={{fontSize:11,color:'#7dd8d8'}}>/10</p></>:<p style={{color:'#7dd8d8',fontSize:12}}>—</p>}
                </div>
              </div>
              {s.status==='completed'&&<p style={{fontSize:12,color:'#4dbdbd',marginTop:10}}>View full results →</p>}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

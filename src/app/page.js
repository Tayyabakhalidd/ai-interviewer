'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSession } from '../lib/sessions';

const TYPES = [
  { id: 'behavioral', label: 'General / Behavioral', icon: '🧠', desc: 'Strengths, weaknesses, teamwork, problem-solving', time: '10-15 min' },
  { id: 'technical',  label: 'Technical — AI & Automation', icon: '⚡', desc: 'n8n, AI agents, LLMs, prompt engineering, APIs', time: '15-20 min' },
];

export default function Home() {
  const router = useRouter();
  const [name, setName]       = useState('');
  const [type, setType]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  async function start() {
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!type)        { setError('Please select an interview type.'); return; }
    setError(''); setLoading(true);
    try {
      const id = await createSession({ type, name: name.trim() });
      router.push('/interview/' + id);
    } catch (e) {
      setError('Could not start. Check your connection: ' + e.message);
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight:'100vh', position:'relative', overflow:'hidden' }}>
      {/* blobs */}
      <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'rgba(77,189,189,0.08)', filter:'blur(60px)', top:-80, right:-80, pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:300, height:300, borderRadius:'50%', background:'rgba(26,153,153,0.06)', filter:'blur(60px)', bottom:40, left:-60, pointerEvents:'none' }} />

      <div style={{ maxWidth:820, margin:'0 auto', padding:'60px 24px' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px', borderRadius:100, background:'rgba(77,189,189,0.1)', border:'1px solid rgba(77,189,189,0.25)', fontSize:13, color:'#a8e8e8', marginBottom:20 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:'#4dbdbd', display:'inline-block' }} />
            AI-Powered Mock Interviews
          </div>
          <h1 style={{ fontSize:'clamp(2rem,5vw,3.2rem)', fontWeight:800, color:'#e0f7f7', marginBottom:12, fontFamily:'Georgia,serif', lineHeight:1.1 }}>
            Practice. Improve. <span style={{ color:'#7dd8d8' }}>Succeed.</span>
          </h1>
          <p style={{ color:'#a8e8e8', fontSize:16, maxWidth:500, margin:'0 auto', lineHeight:1.7 }}>
            Adaptive AI questions, real-time answer analysis, and detailed feedback to help you land your next opportunity.
          </p>
        </div>

        {/* Name */}
        <div className="glass" style={{ padding:28, marginBottom:20 }}>
          <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#7dd8d8', marginBottom:8 }}>Your Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your name..."
            style={{ width:'100%', padding:'12px 16px', borderRadius:12, background:'rgba(5,61,61,0.6)', border:'1px solid rgba(77,189,189,0.3)', color:'#e0f7f7', fontSize:15, outline:'none' }}
          />
        </div>

        {/* Type */}
        <div style={{ marginBottom:28 }}>
          <p style={{ fontSize:14, fontWeight:600, color:'#7dd8d8', marginBottom:14 }}>Choose Interview Type</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            {TYPES.map(t => (
              <button key={t.id} onClick={() => { setType(t.id); setError(''); }}
                style={{
                  textAlign:'left', padding:24, borderRadius:20, cursor:'pointer',
                  background: type===t.id ? 'rgba(77,189,189,0.18)' : 'rgba(15,122,122,0.12)',
                  border: type===t.id ? '2px solid #4dbdbd' : '1px solid rgba(77,189,189,0.18)',
                  transform: type===t.id ? 'scale(1.01)' : 'scale(1)',
                  transition:'all 0.2s',
                }}>
                <div style={{ fontSize:28, marginBottom:10 }}>{t.icon}</div>
                <div style={{ fontWeight:700, color:'#e0f7f7', marginBottom:6, fontSize:15 }}>
                  {t.label}
                  {type===t.id && <span style={{ marginLeft:8, fontSize:11, padding:'2px 8px', borderRadius:100, background:'#1a9999', color:'white' }}>Selected</span>}
                </div>
                <div style={{ fontSize:13, color:'#7dd8d8', marginBottom:10, lineHeight:1.5 }}>{t.desc}</div>
                <div style={{ fontSize:12, color:'#4dbdbd' }}>📝 5 questions · ⏱ {t.time}</div>
              </button>
            ))}
          </div>
        </div>

        {error && <p style={{ color:'#e88a8a', fontSize:13, textAlign:'center', marginBottom:12 }}>{error}</p>}

        <div style={{ textAlign:'center', marginBottom:32 }}>
          <button onClick={start} disabled={loading} className="btn-ocean"
            style={{ padding:'14px 48px', borderRadius:100, fontSize:16, fontWeight:700 }}>
            {loading ? (
              <span style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ width:18, height:18, border:'2px solid white', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite', display:'inline-block' }} />
                Starting...
              </span>
            ) : 'Start Interview →'}
          </button>
        </div>

        <div style={{ textAlign:'center', marginBottom:48 }}>
          <a href="/history" style={{ color:'#4dbdbd', fontSize:13 }}>📋 View Past Interview Sessions</a>
        </div>

        {/* Features */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
          {[
            { icon:'🎯', t:'Adaptive Questions', d:'Questions adjust based on your answers' },
            { icon:'🔍', t:'Real-time Analysis', d:'AI scores clarity, depth, and relevance' },
            { icon:'📈', t:'Detailed Feedback', d:'Scores, model answers, and tips' },
          ].map(f => (
            <div key={f.t} className="glass" style={{ padding:20, textAlign:'center' }}>
              <div style={{ fontSize:24, marginBottom:8 }}>{f.icon}</div>
              <div style={{ fontWeight:600, fontSize:13, color:'#e0f7f7', marginBottom:4 }}>{f.t}</div>
              <div style={{ fontSize:12, color:'#7dd8d8', lineHeight:1.5 }}>{f.d}</div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}

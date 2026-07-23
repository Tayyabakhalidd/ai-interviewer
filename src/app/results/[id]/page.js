'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSession } from '../../../lib/sessions';

export default function ResultsPage() {
  const { id } = useParams();
  const router  = useRouter();
  const [s, setS]         = useState(null);
  const [loading, setL]   = useState(true);
  const [showRing, setR]  = useState(false);

  useEffect(() => {
    if (!id) return;
    getSession(id).then(d=>{ setS(d); setL(false); setTimeout(()=>setR(true),400); }).catch(()=>setL(false));
  }, [id]);

  if (loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:36,height:36,border:'3px solid #4dbdbd',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if (!s) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:'#e88a8a'}}>Session not found. <a href="/" style={{color:'#4dbdbd',marginLeft:8}}>Home</a></div>;

  const score     = s.score || 0;
  const overall   = s.overall_feedback || {};
  const questions = s.questions || [];
  const answers   = s.answers || [];
  const feedbacks = s.feedbacks || [];
  const circ      = 251;
  const offset    = circ - (circ * score / 10);

  function sc(n) { return n>=8?'#4dbdbd':n>=6?'#e8c87a':'#e88a8a'; }

  const badge = { 'Interview Ready':['#4dbdbd','🏆'], 'Almost Ready':['#7acc7a','✨'], 'Getting There':['#e8c87a','📈'], 'Not Ready':['#e88a8a','💪'] };
  const [bc, bi] = badge[overall.readinessLevel] || ['#7dd8d8','🎯'];

  return (
    <main style={{minHeight:'100vh',padding:'24px 16px 60px'}}>
      <div style={{maxWidth:720,margin:'0 auto'}}>
        <button onClick={()=>router.push('/history')} className="btn-ghost" style={{padding:'8px 16px',borderRadius:100,fontSize:13,marginBottom:24}}>← All Sessions</button>

        {/* Score */}
        <div className="glass" style={{padding:36,textAlign:'center',marginBottom:20}}>
          <p style={{fontSize:13,color:'#7dd8d8',marginBottom:16}}>{s.type==='technical'?'⚡ Technical':'🧠 Behavioral'} · {s.name}</p>
          <svg width="130" height="130" viewBox="0 0 90 90" style={{marginBottom:12}}>
            <circle cx="45" cy="45" r="40" fill="none" stroke="rgba(77,189,189,0.12)" strokeWidth="8"/>
            <circle cx="45" cy="45" r="40" fill="none" stroke={sc(score)} strokeWidth="8" strokeLinecap="round"
              style={{strokeDasharray:circ,strokeDashoffset:showRing?offset:circ,transition:'stroke-dashoffset 1.5s ease',transform:'rotate(-90deg)',transformOrigin:'45px 45px'}}/>
            <text x="45" y="50" textAnchor="middle" fontSize="20" fontWeight="bold" fill={sc(score)}>{score}</text>
            <text x="45" y="62" textAnchor="middle" fontSize="8" fill="#7dd8d8">/ 10</text>
          </svg>
          <h1 style={{fontSize:'1.8rem',fontWeight:800,color:'#e0f7f7',fontFamily:'Georgia,serif',marginBottom:10}}>Interview Complete!</h1>
          {overall.readinessLevel&&<div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'6px 16px',borderRadius:100,background:`${bc}20`,color:bc,border:`1px solid ${bc}40`,fontSize:13,fontWeight:600,marginBottom:12}}>{bi} {overall.readinessLevel}</div>}
          {overall.summary&&<p style={{color:'#a8e8e8',fontSize:14,lineHeight:1.7,maxWidth:500,margin:'0 auto'}}>{overall.summary}</p>}
        </div>

        {/* Strengths & Improvements */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
          {overall.topStrengths?.length>0&&(
            <div className="glass" style={{padding:20}}>
              <p style={{fontWeight:700,fontSize:13,color:'#4dbdbd',marginBottom:10}}>✓ Top Strengths</p>
              {overall.topStrengths.map((x,i)=><p key={i} style={{color:'#e0f7f7',fontSize:13,marginBottom:6}}>• {x}</p>)}
            </div>
          )}
          {overall.keyImprovements?.length>0&&(
            <div className="glass" style={{padding:20}}>
              <p style={{fontWeight:700,fontSize:13,color:'#e8c87a',marginBottom:10}}>↑ Key Improvements</p>
              {overall.keyImprovements.map((x,i)=><p key={i} style={{color:'#e0f7f7',fontSize:13,marginBottom:6}}>• {x}</p>)}
            </div>
          )}
        </div>

        {overall.nextSteps&&(
          <div className="glass" style={{padding:18,marginBottom:20}}>
            <p style={{fontWeight:700,fontSize:13,color:'#7dd8d8',marginBottom:6}}>💡 Next Steps</p>
            <p style={{color:'#a8e8e8',fontSize:13,lineHeight:1.6}}>{overall.nextSteps}</p>
          </div>
        )}

        {/* Per question */}
        <h2 style={{fontFamily:'Georgia,serif',fontSize:'1.4rem',fontWeight:800,color:'#e0f7f7',marginBottom:16}}>Question Breakdown</h2>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {questions.map((q,i)=>{
            const fb = feedbacks[i]||{};
            return (
              <div key={i} className="glass" style={{padding:20}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                  <p style={{fontWeight:600,fontSize:14,color:'#e0f7f7',flex:1}}><span style={{color:'#4dbdbd',marginRight:8}}>Q{i+1}.</span>{q}</p>
                  {fb.score&&<span style={{fontWeight:700,color:sc(fb.score),marginLeft:12,flexShrink:0}}>{fb.score}/10</span>}
                </div>
                <div style={{background:'rgba(5,61,61,0.4)',borderRadius:10,padding:12,marginBottom:10}}>
                  <p style={{fontSize:11,color:'#4dbdbd',marginBottom:4}}>Your Answer</p>
                  <p style={{fontSize:13,color:'#c0e8e8'}}>{answers[i]||'—'}</p>
                </div>
                {fb.modelAnswer&&(
                  <div style={{background:'rgba(5,61,61,0.3)',borderRadius:10,padding:12,marginBottom:8,border:'1px solid rgba(77,189,189,0.12)'}}>
                    <p style={{fontSize:11,color:'#7dd8d8',marginBottom:4}}>✨ Model Answer</p>
                    <p style={{fontSize:13,color:'#a8e8e8'}}>{fb.modelAnswer}</p>
                  </div>
                )}
                {fb.tip&&<p style={{fontSize:12,color:'#7dd8d8'}}>💡 {fb.tip}</p>}
              </div>
            );
          })}
        </div>

        <div style={{display:'flex',gap:12,marginTop:24}}>
          <button onClick={()=>router.push('/')} className="btn-ocean" style={{flex:1,padding:'12px',borderRadius:100,fontWeight:700,fontSize:14}}>🎤 New Interview</button>
          <button onClick={()=>router.push('/history')} className="btn-ghost" style={{flex:1,padding:'12px',borderRadius:100,fontWeight:700,fontSize:14}}>📋 History</button>
        </div>
      </div>
    </main>
  );
}

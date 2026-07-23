'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getSession, updateSession, completeSession } from '../../../lib/sessions';

const TOTAL = 5;
const C = { teal:'#4dbdbd', pale:'#a8e8e8', text:'#e0f7f7', soft:'#7dd8d8', muted:'#7dd8d8', dark:'rgba(5,61,61,0.6)', mid:'rgba(13,107,107,0.5)' };

export default function InterviewPage() {
  const { id }  = useParams();
  const router  = useRouter();
  const bottom  = useRef(null);

  const [session, setSession]     = useState(null);
  const [qa, setQa]               = useState([]);
  const [currentQ, setCurrentQ]   = useState('');
  const [answer, setAnswer]       = useState('');
  const [qIndex, setQIndex]       = useState(0);
  const [phase, setPhase]         = useState('init'); // init|answering|evaluating|feedback|done
  const [typing, setTyping]       = useState(false);
  const [timer, setTimer]         = useState(0);
  const [timerOn, setTimerOn]     = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    getSession(id).then(s => {
      if (!s) { router.push('/'); return; }
      setSession(s);
      fetchQ('first_question', s.type, []);
    }).catch(() => router.push('/'));
  }, [id]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior:'smooth' });
  }, [qa, currentQ, typing]);

  useEffect(() => {
    if (timerOn) timerRef.current = setInterval(() => setTimer(t => t+1), 1000);
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [timerOn]);

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  async function fetchQ(action, type, prevQA) {
    setTyping(true); setCurrentQ('');
    try {
      const r = await fetch('/api/interview', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ action, type: type||session?.type, questionNumber: prevQA.length+1, previousQA: prevQA }),
      });
      const d = await r.json();
      setCurrentQ(d.question || 'Tell me about your experience.');
      setPhase('answering'); setTimerOn(true); setTimer(0);
    } catch { setCurrentQ('Tell me about your experience.'); setPhase('answering'); }
    finally { setTyping(false); }
  }

  async function submit() {
    if (!answer.trim()) return;
    setTimerOn(false); setPhase('evaluating'); setTyping(true);
    const ans = answer.trim(); setAnswer('');
    try {
      const r = await fetch('/api/interview', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ action:'evaluate', type: session?.type, question: currentQ, answer: ans }),
      });
      const d = await r.json();
      const entry = { question: currentQ, answer: ans, feedback: d.feedback||{} };
      const newQa = [...qa, entry];
      setQa(newQa);
      await updateSession(id, { questions: newQa.map(e=>e.question), answers: newQa.map(e=>e.answer), feedbacks: newQa.map(e=>e.feedback) });
      const next = qIndex + 1;
      setQIndex(next);
      if (next >= TOTAL) {
        // get overall
        const or = await fetch('/api/interview', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ action:'overall', type: session?.type, previousQA: newQa, allFeedbacks: newQa.map(e=>e.feedback) }),
        });
        const od = await or.json();
        const avg = Math.round(newQa.reduce((s,e)=>s+(e.feedback?.score||0),0)/newQa.length);
        await completeSession(id, { score:avg, overallFeedback: od.overall||{} });
        router.push('/results/'+id);
      } else {
        setPhase('feedback');
      }
    } catch(e) { console.error(e); setPhase('answering'); }
    finally { setTyping(false); }
  }

  function scoreColor(s) { return s>=8?'#4dbdbd':s>=6?'#e8c87a':'#e88a8a'; }

  if (!session) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:40,height:40,border:'3px solid #4dbdbd',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 16px'}}/>
        <p style={{color:'#a8e8e8'}}>Loading...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <main style={{minHeight:'100vh',padding:'0 16px 24px'}}>
      <div style={{maxWidth:720,margin:'0 auto',paddingTop:24}}>

        {/* Header */}
        <div className="glass" style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 20px',marginBottom:20}}>
          <div>
            <p style={{fontSize:12,color:C.teal}}>{session.type==='technical'?'⚡ Technical':'🧠 Behavioral'}</p>
            <p style={{fontSize:14,fontWeight:600,color:C.text}}>{session.name}</p>
          </div>
          <div style={{display:'flex',gap:6}}>
            {Array.from({length:TOTAL}).map((_,i)=>(
              <div key={i} style={{width:24,height:4,borderRadius:4,background:i<qIndex?C.teal:i===qIndex?'rgba(77,189,189,0.5)':'rgba(77,189,189,0.15)',transition:'all 0.4s'}}/>
            ))}
          </div>
          <div style={{fontFamily:'monospace',fontSize:12,padding:'6px 12px',borderRadius:8,background:C.dark,color:timer>120?'#e88a8a':C.teal}}>⏱ {fmt(timer)}</div>
        </div>

        {/* Chat */}
        <div className="glass-dark" style={{padding:24,minHeight:380,maxHeight:'58vh',overflowY:'auto',marginBottom:16}}>
          {qa.length===0&&!currentQ&&!typing&&(
            <div style={{textAlign:'center',padding:40,color:C.muted}}>
              <div style={{fontSize:36,marginBottom:8}}>🎤</div>
              <p style={{fontSize:14}}>Your AI interviewer is ready. Good luck!</p>
            </div>
          )}

          {qa.map((e,i)=>(
            <div key={i} style={{marginBottom:24}} className="fade-up">
              {/* Q */}
              <div style={{display:'flex',gap:10,marginBottom:10}}>
                <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#1a9999,#0d6b6b)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,flexShrink:0}}>AI</div>
                <div className="q-bubble">{e.question}</div>
              </div>
              {/* A */}
              <div style={{display:'flex',gap:10,flexDirection:'row-reverse',marginBottom:10}}>
                <div style={{width:32,height:32,borderRadius:'50%',background:C.dark,border:'1px solid rgba(77,189,189,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,flexShrink:0}}>{session.name?.[0]?.toUpperCase()||'U'}</div>
                <div className="a-bubble">{e.answer}</div>
              </div>
              {/* Feedback */}
              {e.feedback?.score&&(
                <div style={{marginLeft:42,padding:14,borderRadius:12,background:'rgba(5,61,61,0.4)',border:'1px solid rgba(77,189,189,0.15)',fontSize:13}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                    <span style={{fontWeight:700,color:C.text}}>Feedback Q{i+1}</span>
                    <span style={{fontWeight:700,color:scoreColor(e.feedback.score)}}>{e.feedback.score}/10 · {e.feedback.rating}</span>
                  </div>
                  {e.feedback.strengths?.map((s,j)=><p key={j} style={{color:'#a8e8e8',marginBottom:2}}>✓ {s}</p>)}
                  {e.feedback.improvements?.map((s,j)=><p key={j} style={{color:'#e8c87a',marginBottom:2}}>↑ {s}</p>)}
                  {e.feedback.tip&&<p style={{color:C.soft,marginTop:6}}>💡 {e.feedback.tip}</p>}
                </div>
              )}
            </div>
          ))}

          {currentQ&&phase!=='init'&&(
            <div style={{display:'flex',gap:10,marginBottom:10}} className="fade-up">
              <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#1a9999,#0d6b6b)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,flexShrink:0}}>AI</div>
              <div className="q-bubble">{currentQ}</div>
            </div>
          )}

          {typing&&(
            <div style={{display:'flex',gap:10}} className="fade-up">
              <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#1a9999,#0d6b6b)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,flexShrink:0}}>AI</div>
              <div className="q-bubble" style={{display:'flex',gap:6,alignItems:'center'}}>
                <span className="typing-dot"/><span className="typing-dot"/><span className="typing-dot"/>
              </div>
            </div>
          )}
          <div ref={bottom}/>
        </div>

        {/* Input */}
        {phase==='answering'&&(
          <div className="glass" style={{padding:16}} >
            <textarea value={answer} onChange={e=>setAnswer(e.target.value)}
              onKeyDown={e=>{if(e.key==='Enter'&&e.ctrlKey)submit();}}
              placeholder="Type your answer... (Ctrl+Enter to submit)"
              rows={4} style={{width:'100%',resize:'none',padding:'12px 14px',borderRadius:12,background:C.dark,border:'1px solid rgba(77,189,189,0.3)',color:C.text,fontSize:14,outline:'none',marginBottom:12}}/>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:12,color:C.teal}}>{answer.length} chars</span>
              <button onClick={submit} disabled={!answer.trim()} className="btn-ocean" style={{padding:'10px 28px',borderRadius:100,fontSize:14,fontWeight:700}}>Submit →</button>
            </div>
          </div>
        )}

        {phase==='evaluating'&&(
          <div className="glass" style={{padding:20,textAlign:'center'}}>
            <div style={{width:28,height:28,border:'2px solid #4dbdbd',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 10px'}}/>
            <p style={{color:C.soft,fontSize:14}}>Evaluating your answer...</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {phase==='feedback'&&(
          <div className="glass" style={{padding:16,textAlign:'center'}}>
            <p style={{color:C.soft,fontSize:14,marginBottom:12}}>Question {qIndex} of {TOTAL} done</p>
            <button onClick={()=>fetchQ('next_question',session.type,qa)} className="btn-ocean" style={{padding:'10px 32px',borderRadius:100,fontSize:14,fontWeight:700}}>Next Question →</button>
          </div>
        )}
      </div>
    </main>
  );
}

// src/app/api/interview/route.js
import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM = {
  behavioral: `You are a professional HR interviewer. Ask behavioral questions using STAR method. When generating a question, return ONLY the question text. When evaluating, return ONLY valid JSON.`,
  technical: `You are a senior AI & Automation technical interviewer. Ask about n8n, AI agents, LLMs, prompt engineering, API integration. When generating a question, return ONLY the question text. When evaluating, return ONLY valid JSON.`,
};

const OPENERS = {
  behavioral: "Tell me about yourself and what motivated you to pursue a career in AI and automation.",
  technical: "Can you give me an overview of your experience with AI automation tools, particularly n8n?",
};

export async function POST(req) {
  try {
    const body = await req.json();
    const { action, type, question, answer, questionNumber, previousQA } = body;
    const sys = SYSTEM[type] || SYSTEM.behavioral;

    if (action === 'first_question') {
      return NextResponse.json({ question: OPENERS[type] || OPENERS.behavioral });
    }

    if (action === 'next_question') {
      const ctx = (previousQA || []).map((qa, i) => `Q${i+1}: ${qa.question}\nA${i+1}: ${qa.answer}`).join('\n\n');
      const r = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: `Previous:\n${ctx}\n\nGenerate question ${questionNumber} of 5. Adapt based on answers. Return ONLY the question.` },
        ],
        temperature: 0.7, max_tokens: 200,
      });
      return NextResponse.json({ question: r.choices[0].message.content.trim() });
    }

    if (action === 'evaluate') {
      const r = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content:
            `Evaluate this answer. Return ONLY valid JSON, no markdown.\n\nQuestion: ${question}\nAnswer: ${answer}\n\n` +
            `{"score":<1-10>,"rating":"<Excellent|Good|Average|Needs Improvement>","strengths":["..."],"improvements":["..."],"modelAnswer":"<2-3 sentences>","tip":"<one actionable tip>"}`
          },
        ],
        temperature: 0.4, max_tokens: 500,
      });
      let raw = r.choices[0].message.content.trim().replace(/```json|```/g, '').trim();
      return NextResponse.json({ feedback: JSON.parse(raw) });
    }

    if (action === 'overall') {
      const { allFeedbacks } = body;
      const avg = allFeedbacks ? Math.round(allFeedbacks.reduce((s,f) => s+(f.score||0),0)/allFeedbacks.length) : 0;
      const summary = (previousQA||[]).map((qa,i) => `Q${i+1}: ${qa.question}\nA: ${qa.answer}\nScore: ${allFeedbacks?.[i]?.score}/10`).join('\n\n');
      const r = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content:
            `Overall feedback for this interview. Return ONLY valid JSON.\n\n${summary}\n\n` +
            `{"overallScore":${avg},"summary":"<2-3 sentences>","topStrengths":["...","...","..."],"keyImprovements":["...","...","..."],"readinessLevel":"<Not Ready|Getting There|Almost Ready|Interview Ready>","nextSteps":"<specific advice>"}`
          },
        ],
        temperature: 0.4, max_tokens: 500,
      });
      let raw = r.choices[0].message.content.trim().replace(/```json|```/g, '').trim();
      return NextResponse.json({ overall: JSON.parse(raw) });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e) {
    console.error('API error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

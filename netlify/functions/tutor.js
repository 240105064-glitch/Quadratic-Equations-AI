const { GoogleGenerativeAI } = require('@google/generative-ai');
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return {statusCode:405,body:JSON.stringify({error:'Method not allowed'})};
  if (!process.env.GEMINI_API_KEY) return {statusCode:503,body:JSON.stringify({error:'Set GEMINI_API_KEY in Netlify environment variables'})};
  try {
    if ((event.body||'').length > 2000) throw Error('Request too large');
    const {kind,level,a,b,c,roots}=JSON.parse(event.body||'{}');
    if (!['hint','solution'].includes(kind)||!['foundation','standard','advanced'].includes(level)||![a,b,c].every(x=>Number.isInteger(x)&&Math.abs(x)<=500)||!Array.isArray(roots)||roots.length!==2||roots.some(x=>!Number.isFinite(x))) throw Error('Invalid input');
    const discriminant=b*b-4*a*c;
    const correctRoots=[(-b+Math.sqrt(discriminant))/(2*a),(-b-Math.sqrt(discriminant))/(2*a)];
    if(discriminant<0||roots.some(r=>!correctRoots.some(t=>Math.abs(t-r)<0.00001))) throw Error('Inconsistent equation');
    const instructions={foundation:'Explain slowly using simple vocabulary, clear direct hints, and small steps. Prefer factoring.',standard:'Use curriculum-level reasoning and factoring or the quadratic formula. Explain why each step works.',advanced:'Use a multi-step challenge, discriminant and exact radical forms, and connect to mathematical reasoning.'};
    const prompt=`You are a patient educational math tutor. The learner level is ${level}. ${instructions[level]} The verified equation is ${a}x^2 + (${b})x + (${c}) = 0. Verified roots: ${correctRoots.join(', ')}. ${kind==='hint'?'Give ONE useful level-appropriate hint, without revealing the final roots. Keep it under 85 words.':'Provide a mathematically correct step-by-step explanation, check both roots, and show exact forms where possible. Keep it under 220 words.'} Do not change the equation. Use plain text, no markdown tables.`;
    const ai=new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model=ai.getGenerativeModel({model:'gemini-2.5-flash'});
    const result=await model.generateContent(prompt);
    return {statusCode:200,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify({text:result.response.text()})};
  }catch(e){console.error("Gemini API error:", e);const bad=/Invalid|Inconsistent|too large/.test(e.message);return {statusCode:bad?400:502,body:JSON.stringify({error:bad?e.message:'AI request failed. Check your API key, model name, and quota.'})};}
};

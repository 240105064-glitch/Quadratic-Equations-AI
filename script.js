const $ = id => document.getElementById(id);
let level = 'foundation';
let current;
const rand = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
const fmt = (a,b,c) => `${a===1?'':a===-1?'−':a}x² ${b<0?'−':'+'} ${Math.abs(b)}x ${c<0?'−':'+'} ${Math.abs(c)} = 0`.replace(/ \+ 0x/g,' + 0x');
function newProblem(){
 let a,b,c,r1,r2,description;
 if(level==='foundation'){
  r1=rand(1,5);r2=rand(1,5);while(r1===r2)r2=rand(1,5);
  a=1;b=-(r1+r2);c=r1*r2;description='Find both integer roots. Try factoring into two brackets.';
 }else if(level==='standard'){
  r1=rand(-6,6);r2=rand(-6,6);while(r1===r2||r1===0||r2===0){r2=rand(-6,6);r1=rand(-6,6)}
  a=rand(2,4);b=-a*(r1+r2);c=a*r1*r2;description='This equation has a leading coefficient greater than 1. Use factoring or the quadratic formula.';
 }else{
  a=rand(2,5);const p=rand(-6,6);const q=rand(1,5);b=2*a*p;c=a*(p*p-q);r1=-p+Math.sqrt(q);r2=-p-Math.sqrt(q);description='The roots are irrational. Give decimal answers rounded to 2 decimal places, or exact radical expressions.';
 }
 current={a,b,c,roots:[r1,r2],level};$('equation').textContent=fmt(a,b,c);$('context').textContent=description;$('answer').value='';$('feedback').hidden=true;$('assistant').hidden=true;
}
function check(){const raw=$('answer').value.trim().replace(/\s+/g,'');const values=raw.split(/[,;]/).map(Number);const feedback=$('feedback');feedback.hidden=false;feedback.classList.remove('error');if(values.length!==2||values.some(x=>!Number.isFinite(x))||raw===''){feedback.textContent='Please enter two numeric roots separated by a comma, such as 2, 3.';feedback.classList.add('error');return;}const expected=[...current.roots].sort((a,b)=>a-b);values.sort((a,b)=>a-b);const tolerance=current.level==='advanced'?.011:0.001;if(values.every((x,i)=>Math.abs(x-expected[i])<=tolerance)){feedback.textContent='✓ Correct! Both roots satisfy the equation. Great work!';}else{feedback.textContent='Not quite. Try substituting your answers into the equation, or request a hint.';feedback.classList.add('error');}}
async function tutor(kind){const output=$('assistant');output.hidden=false;output.textContent='Thinking through your equation…';try{const res=await fetch('/.netlify/functions/tutor',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind,...current})});const data=await res.json();if(!res.ok)throw Error(data.error||'AI is unavailable');output.textContent=data.text;}catch(err){output.textContent=`AI tutoring is not configured or is temporarily unavailable: ${err.message}. The equation generator and answer checker still work.`;}}
document.querySelectorAll('.level').forEach(button=>button.addEventListener('click',()=>{level=button.dataset.level;document.querySelectorAll('.level').forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));});newProblem();}));$('generate').addEventListener('click',newProblem);$('check').addEventListener('click',check);$('answer').addEventListener('keydown',e=>{if(e.key==='Enter')check()});$('hint').addEventListener('click',()=>tutor('hint'));$('solution').addEventListener('click',()=>tutor('solution'));newProblem();

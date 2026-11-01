import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({limit:'1mb'}));

const systemPrompt = `You are the narrative engine for SHE HATES ME, a grounded, emotionally intense interactive college romance visual novel. ALL romantic characters are adults aged 18 or older. The player character is Hira; the central character is Isha Oberoi.

CANON CHARACTER UNIVERSE:
HIRA (20): The player's character, only son and future heir of Hira Enterprises. Extremely wealthy family; his mother is deceased. Handsome, tall, athletic, intelligent, confident, witty and unpredictable. At first he wears glasses and dresses simply; removing them reveals a striking model-like appearance. He is not a nerd or socially awkward stereotype. He does not reveal his family background unless the player chooses. NEVER write Hira's dialogue, thoughts, decisions or actions for the player.
ISHA OBEROI (20): Wealthy, influential, beautiful, stylish and popular; long dark hair and expressive eyes. Confident, stubborn, bold, short-tempered, sharp-tongued and distrustful of boys. She teases her friends but becomes defensive when teased about Hira. She genuinely dislikes Hira at the beginning; attraction must develop slowly and believably.
VIVAAN: Charming, funny, very confident college flirt; jokes and teases everyone, becomes curious about Hira's mysterious personality and sometimes gets into trouble.
KABIR: Calm, intelligent, observant, sarcastic and loyal; loves cricket and competitive challenges, often notices secrets.
RIYA: Isha's close friend; talkative, fashionable, dramatic, loves gossip and matchmaking, teases Isha about Hira.
SANA: Sweet and mischievous; creates funny situations and knows more about the college social circle than she admits.
ARJUN: Athletic, competitive and slightly arrogant; initially sees Hira as an outsider, may become rival or friend.
DEV: Funny, energetic, carefree, plans parties and college adventures, makes friends easily.
MEERA: Intelligent, confident and independent; challenges Vivaan and Kabir and has ambitions and secrets.
MRS. CHOLY VARE: The college's only female principal; strict, sophisticated, authoritative, maintains discipline, tolerates no arrogance or misconduct and may become curious about Hira's background.
PROFESSOR MAYA: Adult English professor; stylish, confident, witty and friendly, always maintains professional boundaries with students.
PROFESSOR ADITI: Adult Business Studies professor; intelligent, elegant, disciplined, strict about assignments and attendance, appreciates confidence and independent thinking.

OPENING CANON: Monday, 9:00 AM at St. Xavier's College. Vivaan says the semester will be legendary; Kabir reminds him he nearly got suspended last semester; Riya tells them to stop arguing; Isha calls them impossible. Hira arrives in a simple outfit, glasses and backpack. Nobody knows his family identity. He accidentally bumps into Isha near the staircase and her notebook falls. Isha says, “Seriously?! Can't you watch where you're walking?” Vivaan jokes, Kabir asks them to give Hira a chance, and Isha snaps, “I'm talking to him, not you two!” She looks directly at Hira and waits. STOP HERE for the player's decision.

CHARACTER INTEGRITY: Isha is an independent person, not a wish-fulfilment assistant. She has pride, a sharp tongue, boundaries, personal goals, friends, a temper, insecurities and her own interpretation of events. She does NOT automatically agree, flirt, forgive, obey, become submissive, or reward the player. She may reject an approach, end a conversation, walk away, hold a grudge, misunderstand, or choose not to respond. Make reactions specific to what Hira actually did. Never force attraction because the player asks for it. Avoid repetitive generic lines and do not narrate the player's thoughts, dialogue, or actions for them.

TONE: cinematic, slow-burn, high emotional realism; natural Indian college setting; dialogue may mix English and Hindi/Hinglish. Use meaningful pauses, body language, atmosphere, and subtext. Characters have continuity and remember important choices. Conflict should have consequences and not be instantly resolved. No abusive coercion framed as romance. Consent and boundaries matter.

ROUTES: infer a dynamic gradually from actions, not a one-time label. Possible relationship dynamics include guarded equals, assertive/dominant Isha, or player-led/submissive Isha only when mutually established and wanted by both. A route is not permission to erase Isha's agency. Intimate progression requires trust, mutual interest and explicit consent. Mature scenes may be sensual and fade-to-black, but do not describe explicit sexual acts or graphic nudity. No sexual content involving minors; all characters are adults.

GAME STATE: Love, Hate, Trust and Tension are 0-100. Change them conservatively based on actual events. A cruel act may raise Hate and lower Trust; a respectful boundary may raise Trust without raising Love; a thoughtful action may slowly build Love. A flirtatious line can backfire. Never make all stats rise together. Stats are not a morality score. Keep current stats in mind and don't reset them. Route can be 'Unresolved', 'Guarded equals', 'Isha-led', or 'Hira-led'.

Return ONLY valid JSON with keys: reply (2-5 paragraphs max, cinematic but concise), speaker (usually Isha, or Narrator), stats (object with integer love, hate, trust, tension each 0-100), route (string), sceneImage (integer 1-10), choices (array of exactly 3 short player reply suggestions). Do not include markdown fences.`;

function clamp(n){return Math.max(0,Math.min(100,Math.round(Number(n)||0)));}
function fallback(message, stats){
  const s={love:clamp(stats?.love),hate:clamp(stats?.hate??100),trust:clamp(stats?.trust),tension:clamp(stats?.tension??35)};
  const lower=message.toLowerCase();
  let reply='Isha looks at you for a long moment, as if deciding whether you are worth the effort. “You really think you can say whatever you want and I’ll just play along?” She gathers the last of her books. “You don’t know me, Hira. Don’t act like you do.”';
  if(/sorry|apolog/.test(lower)){s.trust=clamp(s.trust+2);s.hate=clamp(s.hate-1);reply='Isha’s expression shifts, but only slightly. “At least you know how to say it.” She checks the scattered papers before meeting your eyes again. “That doesn’t mean we’re suddenly friends. I’ll decide that for myself.”';}
  else if(/beautiful|pretty|cute|love you|like you/.test(lower)){s.tension=clamp(s.tension+5);s.hate=clamp(s.hate+2);reply='For half a second, Isha looks caught off guard. Then her eyes narrow. “Is that your usual strategy? Compliment a girl and hope she forgets what you did?” She steps aside, leaving the question hanging.';}
  else if(/whatever|don't care|dont care|big deal|attitude/.test(lower)){s.hate=clamp(s.hate+7);s.trust=clamp(s.trust-3);s.tension=clamp(s.tension+8);reply='Isha gives a short, disbelieving laugh. “Good. Then we understand each other.” Her voice drops. “Stay out of my way, and I’ll stay out of yours.” She turns first—but her shoulders remain tense.';}
  else if(/help|papers|book/.test(lower)){s.trust=clamp(s.trust+3);s.hate=clamp(s.hate-2);reply='Isha hesitates before accepting the book. “I can manage.” Still, she takes it. Her fingers brush yours for an instant; she pulls away immediately. “Don’t make a habit of this.”';}
  return {speaker:'Isha',reply,stats:s,route:s.trust>35?'Guarded equals':'Unresolved',sceneImage:Math.min(10,Math.max(1,Math.ceil((s.tension+s.trust+s.love)/35))),choices:['Let her walk away.','Ask what you did to upset her.','Give her a sharp reply.']};
}

app.get('/api/health',(req,res)=>res.json({ok:true,configured:Boolean(process.env.AI_API_KEY),model:process.env.AI_MODEL||'gpt-4o-mini'}));

app.post('/api/roleplay', async (req,res)=>{
  const {message,history=[],stats={}}=req.body||{};
  if(typeof message!=='string'||!message.trim()) return res.status(400).json({error:'A message is required.'});
  if(message.length>3000) return res.status(413).json({error:'Message is too long (maximum 3000 characters).'});
  const safeHistory=Array.isArray(history)?history.slice(-14).map(x=>({speaker:String(x?.speaker||'Narrator').slice(0,40),text:String(x?.text||'').slice(0,2000)})):[];
  const key=process.env.AI_API_KEY;
  if(!key) return res.json({...fallback(message,stats),mode:'offline'});
  const endpoint=process.env.AI_BASE_URL||'https://api.openai.com/v1/chat/completions';
  const model=process.env.AI_MODEL||'gpt-4o-mini';
  try{
    const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`},body:JSON.stringify({model,temperature:0.9,response_format:{type:'json_object'},messages:[{role:'system',content:systemPrompt},{role:'user',content:JSON.stringify({currentStats:stats,recentHistory:safeHistory,playerMessage:message})}]})});
    if(!r.ok) throw new Error(`AI provider returned ${r.status}`);
    const data=await r.json();
    const raw=data.choices?.[0]?.message?.content;
    if(typeof raw!=='string') throw new Error('AI provider returned an empty response');
    const parsed=JSON.parse(raw.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,''));
    const clean={speaker:String(parsed.speaker||'Isha'),reply:String(parsed.reply||''),stats:{love:clamp(parsed.stats?.love),hate:clamp(parsed.stats?.hate),trust:clamp(parsed.stats?.trust),tension:clamp(parsed.stats?.tension)},route:String(parsed.route||'Unresolved'),sceneImage:Math.max(1,Math.min(10,Number(parsed.sceneImage)||1)),choices:Array.isArray(parsed.choices)?parsed.choices.slice(0,3).map(String):['Stay quiet.','Ask her why.','Walk away.'],mode:'ai'};
    while(clean.choices.length<3) clean.choices.push('Say nothing.');
    res.json(clean);
  }catch(err){console.error(err);res.status(502).json({error:'The story service could not respond. Check your AI settings.'});}
});

if(process.env.NODE_ENV!=='production'){
  const vite=await createViteServer({server:{middlewareMode:true},appType:'spa'});
  app.use(vite.middlewares);
}else{
  app.use(express.static(path.join(__dirname,'dist')));
  app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'dist','index.html')));
}
const port=process.env.PORT||5173;
app.listen(port,()=>console.log(`She Hates Me running at http://localhost:${port}`));

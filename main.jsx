import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const opening = [
  { speaker: "Narrator", text: "MONDAY • 9:00 AM — ST. XAVIER'S COLLEGE. The enormous campus is already crowded. Students cross the courtyard in noisy groups while the first bell approaches." },
  { speaker: "Vivaan", text: "Bro, I swear this semester is going to be legendary." },
  { speaker: "Kabir", text: "You said the same thing last semester. You nearly got suspended." },
  { speaker: "Riya", text: "Can you two stop arguing for five minutes?" },
  { speaker: "Isha", text: "Both of you are impossible." },
  { speaker: "Narrator", text: "Hira enters the corridor in a simple outfit, glasses on, backpack over one shoulder. He keeps to himself. Nobody here knows the name behind Hira Enterprises—or that he is its future heir." },
  { speaker: "Narrator", text: "Near the staircase, Isha turns at the same moment Hira passes. His shoulder clips hers. Her notebook slips from her hand and lands open on the floor." },
  { speaker: "Isha", text: "Seriously?! Can't you watch where you're walking?" },
  { speaker: "Vivaan", text: "Oho! First-day entertainment!" },
  { speaker: "Kabir", text: "Give the guy a chance. He hasn't even entered the classroom." },
  { speaker: "Isha", text: "I'm talking to him, not you two!" },
  { speaker: "Narrator", text: "Isha looks directly at Hira, clearly irritated. She waits for his response. The moment is yours." }
];

const chars = [
  ["Hira", "20 • Player character. Only son and future heir of Hira Enterprises. Wealthy, intelligent, athletic and confident; his family identity stays secret unless the player reveals it.", "HIRA"],
  ["Isha Oberoi", "20 • Wealthy, influential and popular. Stylish, stubborn, bold and short-tempered. She distrusts easily and genuinely dislikes Hira at first.", "ISHA"],
  ["Vivaan", "Charming, funny and confident. The college's biggest flirt; loves teasing everyone and gets curious about Hira.", "VIVAAN"],
  ["Kabir", "Calm, intelligent and observant, with a sarcastic streak. Loyal to his friends, loves cricket and notices secrets.", "KABIR"],
  ["Riya", "Isha's talkative, fashionable and dramatic close friend. Loves gossip and matchmaking.", "RIYA"],
  ["Sana", "Sweet but mischievous. Creates funny situations and quietly knows more about the college social circle than she lets on.", "SANA"],
  ["Arjun", "Athletic, competitive and slightly arrogant. Sees Hira as an outsider; could become a rival or friend.", "ARJUN"],
  ["Dev", "Funny, energetic and carefree. Plans parties and college adventures; makes friends easily.", "DEV"],
  ["Meera", "Intelligent, confident and independent. Challenges Vivaan and Kabir and has ambitions and secrets of her own.", "MEERA"],
  ["Mrs. Choly Vare", "The college's strict, sophisticated and authoritative principal. Maintains discipline and eventually becomes curious about Hira's background.", "CHOLY"],
  ["Professor Maya", "Adult English professor: stylish, witty and friendly while maintaining professional boundaries.", "MAYA"],
  ["Professor Aditi", "Adult Business Studies professor: elegant, disciplined and strict about assignments and attendance.", "ADITI"]
];

function fallback(input) {
  const lower = input.toLowerCase();
  if (lower.includes("sorry")) {
    return "Isha folds her arms. “Sorry bolne se papers khud arrange ho jayenge? Impressive.” Her expression stays cold, but she watches you for a second longer than necessary.";
  }
  if (lower.includes("hira") || lower.includes("naam")) {
    return "Isha's eyebrow rises. “Hira.” She says the name as if testing it. “Fine. Welcome to St. Xavier's. Try not to crash into anyone else before lunch.” Kabir smirks beside her.";
  }
  return "Isha studies you with an unreadable expression. “That's your answer?” Vivaan lets out a quiet laugh, while Meher looks between the two of you. The crowded corridor keeps moving around you.";
}

function App() {
  const [page, setPage] = useState("home");
  const [sceneOpen, setSceneOpen] = useState(null);
  const [aiMode, setAiMode] = useState("checking");
  const [messages, setMessages] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("shm_msgs")) || opening;
    } catch {
      return opening;
    }
  });
  const [stats, setStats] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("shm_stats")) || { love: 0, hate: 100, trust: 0, tension: 35 };
    } catch {
      return { love: 0, hate: 100, trust: 0, tension: 35 };
    }
  });
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [choices, setChoices] = useState(["Say nothing. Hold her gaze.", "Pick up the notebook and offer it back.", "Give her a sharp reply."]);
  const [route, setRoute] = useState(() => localStorage.getItem("shm_route") || "Unresolved");
  const [settings, setSettings] = useState(false);
  const [api, setApi] = useState(() => localStorage.getItem("shm_api") || "/api/roleplay");

  useEffect(() => localStorage.setItem("shm_msgs", JSON.stringify(messages)), [messages]);
  useEffect(() => localStorage.setItem("shm_stats", JSON.stringify(stats)), [stats]);
  useEffect(() => localStorage.setItem("shm_route", route), [route]);
  useEffect(() => { fetch("/api/health").then(r => r.json()).then(d => setAiMode(d.configured ? "AI connected" : "Offline mode")).catch(() => setAiMode("Backend unavailable")); }, []);

  async function send(text = input) {
    text = text.trim();
    if (!text || typing) return;

    setMessages(m => [...m, {
      speaker: "Hira",
      text,
      me: true,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }]);
    setInput("");
    setTyping(true);

    try {
      if (!api.trim()) throw new Error("No backend configured");
      const res = await fetch(api.trim(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: messages.slice(-14), stats })
      });
      if (!res.ok) throw new Error("Backend request failed");
      const data = await res.json();
      setMessages(m => [...m, { speaker: data.speaker || "Isha", text: data.reply || "Isha looks at you silently." }]);
      if (data.stats) setStats(data.stats);
      if (data.choices) setChoices(data.choices);
      if (data.route) setRoute(data.route);
      setAiMode(data.mode === "ai" ? "AI connected" : "Offline mode");
    } catch {
      setAiMode("Offline fallback");
      window.setTimeout(() => {
        setMessages(m => [...m, { speaker: "Isha", text: fallback(text) }]);
      }, 500);
    } finally {
      setTyping(false);
    }
  }

  function reset() {
    if (window.confirm("Restart the entire story?")) {
      setMessages(opening);
      setStats({ love: 0, hate: 100, trust: 0, tension: 35 });
      setRoute("Unresolved");
      setChoices(["Say nothing. Hold her gaze.", "Pick up the notebook and offer it back.", "Give her a sharp reply."]);
    }
  }

  if (page === "home") {
    return <>
      <header><b>SHM</b><span>Stories</span><button onClick={() => setSettings(true)}>⚙</button></header>
      <main className="home">
        <div className="hero" style={{backgroundImage:"linear-gradient(0deg,#09090bea,transparent 78%),url(/images/isha-01.jpg)"}}>
          <div className="eyebrow">ROLEPLAY • ROMANCE</div>
          <h1>SHE<br /><i>HATES ME</i></h1>
          <p>An elite college. One new heir. One girl who refuses to be impressed.</p>
          <button className="primary" onClick={() => setPage("story")}>Enter Story →</button>
        </div>
        <section>
          <h2>Characters</h2>
          <div className="cards">
            {chars.map(c => <article className="card" key={c[0]}>
              <div className="avatar">{c[2][0]}</div><b>{c[0]}</b><p>{c[1]}</p>
            </article>)}
          </div>
        </section>
      </main>
      {settings && <Settings api={api} setApi={setApi} setSettings={setSettings} reset={reset} aiMode={aiMode} />}
    </>;
  }

  if (page === "story") {
    return <>
      <header><button onClick={() => setPage("home")}>←</button><span>Story</span><button onClick={() => setSettings(true)}>⚙</button></header>
      <main className="details">
        <div className="cover" style={{backgroundImage:"linear-gradient(0deg,#09090bea,transparent 78%),url(/images/isha-01.jpg)"}}><div><div className="eyebrow">COLLEGE ROMANCE • SLOW BURN</div><h1>SHE HATES ME</h1></div></div>
        <h2>About this story</h2>
        <p>Monday, 9:00 AM. Hira arrives at St. Xavier's determined to keep his family's empire a secret. One accidental collision with Isha Oberoi puts him in the path of the college's most influential circle. Every character has their own loyalties, ambitions, boundaries and secrets.</p>
        <div className="cast">
          {chars.map(c => <div key={c[0]}><div className="mini">{c[2][0]}</div><span><b>{c[0]}</b><small>{c[1]}</small></span></div>)}
        </div>
        <button className="primary" onClick={() => setPage("chat")}>Start roleplay</button>
      </main>
      {settings && <Settings api={api} setApi={setApi} setSettings={setSettings} reset={reset} aiMode={aiMode} />}
    </>;
  }

  if (page === "scenes") return <Scenes stats={stats} setPage={setPage} sceneOpen={sceneOpen} setSceneOpen={setSceneOpen} />;

  return <div className="app">
    <header>
      <button onClick={() => setPage("story")}>←</button>
      <div className="title"><b>Isha Oberoi</b><small>Roleplay • {aiMode}</small></div>
      <button onClick={() => setSettings(true)}>⋮</button>
    </header>
    <div className="meters">
      <Meter icon="❤️" label="Love" value={stats.love} />
      <Meter icon="💔" label="Hate" value={stats.hate} />
      <Meter icon="🤍" label="Trust" value={stats.trust} />
      <Meter icon="⚡" label="Tension" value={stats.tension || 35} />
    </div>
    <div className="route-label">ROUTE • {route}<button className="scene-link" onClick={() => setPage("scenes")}>MOMENTS</button></div>
    <main className="chat">
      {messages.map((m, i) => <div className={"msg " + (m.me ? "me" : "")} key={i}>
        <label>{m.speaker.toUpperCase()}</label><p>{m.text}</p><small>{m.time || "09:00"}</small>
      </div>)}
      {typing && <div className="typing">Isha is typing<span>•••</span></div>}
    </main>
    <div className="suggest">
      {choices.map((choice, index) => <button key={index} onClick={() => send(choice)}>{choice}</button>)}
    </div>
    <form className="composer" onSubmit={e => { e.preventDefault(); send(); }}>
      <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type your reply..." autoComplete="off" />
      <button className="send" type="submit">➤</button>
    </form>
    {settings && <Settings api={api} setApi={setApi} setSettings={setSettings} reset={reset} aiMode={aiMode} />}
  </div>;
}

function Meter({ icon, label, value }) {
  return <div className="meter"><span>{icon}</span><small>{label}</small><b>{value}/100</b></div>;
}

function Settings({ api, setApi, setSettings, reset, aiMode }) {
  return <div className="modal">
    <div className="sheet">
      <button className="close" onClick={() => setSettings(false)}>×</button>
      <h2>Story controls</h2>
      <p className="status-line">Service status: <b>{aiMode}</b></p>
      <p className="muted">For real AI roleplay, connect your backend. Keep your provider secret on the server, never in browser code.</p>
      <label>Backend/API URL (optional)</label>
      <input value={api} onChange={e => {
        setApi(e.target.value);
        localStorage.setItem("shm_api", e.target.value);
      }} placeholder="https://your-domain.com/api/roleplay" />
      <button className="danger" onClick={reset}>Restart story</button>
      <h3>Memory</h3>
      <p className="muted">The conversation and relationship state are saved on this device.</p>
    </div>
  </div>;
}

const moments = [
  { title:"The first apology", subtitle:"A fragile truce", need:"trust", min:8, image:"/images/isha-02.jpg", text:"The corridor has finally emptied. Isha pauses beside the noticeboard, her anger quieter but not gone. “I still think you're reckless,” she says. “But... I heard your apology. Don't make me regret believing it.”" },
  { title:"After the rain", subtitle:"An almost-confession", need:"trust", min:25, image:"/images/isha-04.jpg", text:"Rain drums against the empty library windows. Isha stands close enough for the silence to feel different. Her usual comeback never arrives. “Don't misunderstand this,” she murmurs. “I just don't want tonight to end with another argument.”" },
  { title:"One honest choice", subtitle:"Mutual trust", need:"love", min:35, image:"/images/isha-06.jpg", text:"Isha takes your hand, then waits until your eyes meet hers. “No games tonight. If we do this, we do it because we both want to.” The moment settles into a private, tender kiss; the scene fades out with the door closing softly behind you." },
  { title:"Morning light", subtitle:"Intimacy • fade to black", need:"trust", min:60, image:"/images/isha-08.jpg", text:"Morning light spills across the quiet room. Isha is still beside you, hair tousled, her guarded expression softened by a rare smile. Nothing needs explaining. She brushes your hand with hers. “Don't get used to me being this nice,” she whispers, though she doesn't let go." }
];

function Scenes({ stats, setPage, sceneOpen, setSceneOpen }) {
  const unlocked = scene => stats[scene.need] >= scene.min;
  return <div className="scene-page">
    <header><button onClick={() => setPage("chat")}>←</button><div className="title"><b>Relationship moments</b><small>Earned through choices, never bought</small></div><span>✦</span></header>
    <div className="scene-intro"><div className="eyebrow">STORY MILESTONES</div><h1>Closer.<br/><i>Not easier.</i></h1><p>These scenes unlock as trust and affection develop. Every intimate moment is mutual, adult and consent-led.</p></div>
    <div className="scene-grid">{moments.map((scene,i)=>{
      const open=unlocked(scene);
      return <button className={"scene-card "+(!open?"locked":"")} key={scene.title} onClick={()=>open&&setSceneOpen(scene)}>
        <img src={scene.image} alt="Story moment"/><span className="scene-number">0{i+1}</span><div className="scene-card-copy"><b>{scene.title}</b><small>{open?scene.subtitle:`Unlock at ${scene.need} ${scene.min}`}</small></div><span className="lock-mark">{open?"↗":"🔒"}</span>
      </button>;
    })}</div>
    {sceneOpen && <div className="modal" onClick={()=>setSceneOpen(null)}><div className="sheet scene-sheet" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setSceneOpen(null)}>×</button><img src={sceneOpen.image} alt="Scene artwork"/><div className="eyebrow">UNLOCKED MOMENT</div><h2>{sceneOpen.title}</h2><p>{sceneOpen.text}</p><button className="primary" onClick={()=>setSceneOpen(null)}>Close moment</button></div></div>}
  </div>;
}

createRoot(document.getElementById("root")).render(<App />);

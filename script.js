/* ── MOCK USER STORE (localStorage-backed) ── */
function getUsers(){try{return JSON.parse(localStorage.getItem("wf_users")||"[]");}catch{return[];}}
function saveUsers(u){localStorage.setItem("wf_users",JSON.stringify(u));}
function getSession(){try{return JSON.parse(localStorage.getItem("wf_session")||"null");}catch{return null;}}
function saveSession(u){localStorage.setItem("wf_session",JSON.stringify(u));}
function clearSession(){localStorage.removeItem("wf_session");}

/* ── AUTH LOGIC ── */
let activeTab = "login";

function switchTab(tab, el){
  activeTab=tab;
  document.querySelectorAll(".auth-tab").forEach(t=>t.classList.remove("active"));
  el.classList.add("active");
  document.getElementById("login-fields").style.display  = tab==="login"  ? "" : "none";
  document.getElementById("signup-fields").style.display = tab==="signup" ? "" : "none";
  setError("");
}

function setError(msg){document.getElementById("auth-error").textContent=msg;}

function doLogin(){
  const email = document.getElementById("login-email").value.trim();
  const pass  = document.getElementById("login-pass").value;
  if(!email||!pass){setError("Please fill in all fields.");return;}
  const users=getUsers();
  const user=users.find(u=>u.email===email&&u.password===pass);
  if(!user){setError("Incorrect email or password.");return;}
  saveSession(user);
  enterApp(user);
}

function doSignup(){
  const name  = document.getElementById("su-name").value.trim();
  const email = document.getElementById("su-email").value.trim();
  const pass  = document.getElementById("su-pass").value;
  if(!name||!email||!pass){setError("Please fill in all fields.");return;}
  if(pass.length<6){setError("Password must be at least 6 characters.");return;}
  const users=getUsers();
  if(users.find(u=>u.email===email)){setError("An account with this email already exists.");return;}
  const user={name,email,password:pass};
  users.push(user);
  saveUsers(users);
  saveSession(user);
  enterApp(user);
}

function enterAsGuest(){
  enterApp({name:"Guest",email:""});
}

function enterApp(user){
  setError("");
  const initials = user.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
  document.getElementById("user-avatar").textContent = initials||"?";
  document.getElementById("user-name").textContent   = user.name;

  document.getElementById("auth-screen").classList.add("hidden");
  const app=document.getElementById("app-screen");
  app.style.display="grid";
  requestAnimationFrame(()=>requestAnimationFrame(()=>app.classList.add("visible")));
  renderAll();
}

function doLogout(){
  clearSession();
  stopScheduler(); stopProgressTimer();
  S.playing=false; S.progress=0; S.elapsed=0;
  setPlayIcon(false);
  document.getElementById("app-screen").classList.remove("visible");
  setTimeout(()=>{
    document.getElementById("app-screen").style.display="none";
    document.getElementById("auth-screen").classList.remove("hidden");
    setError("");
  },300);
}

// enter key shortcuts
document.addEventListener("keydown",e=>{
  if(e.key==="Enter"){
    if(activeTab==="login") doLogin();
    else doSignup();
  }
});

// Auto-login if session exists
window.addEventListener("DOMContentLoaded",()=>{
  document.getElementById("app-screen").style.display="none";
  const sess=getSession();
  if(sess) enterApp(sess);
});

/* ══════════════════════════════════════
   MUSIC ENGINE
══════════════════════════════════════ */
const N={
  C3:130.81,D3:146.83,E3:164.81,F3:174.61,Fs3:185.00,G3:196.00,A3:220.00,Bb3:233.08,B3:246.94,
  C4:261.63,Db4:277.18,D4:293.66,Eb4:311.13,E4:329.63,F4:349.23,Fs4:369.99,
  G4:392.00,Ab4:415.30,A4:440.00,Bb4:466.16,B4:493.88,
  C5:523.25,Db5:554.37,D5:587.33,Eb5:622.25,E5:659.25,F5:698.46,
  Fs5:739.99,G5:783.99,Ab5:830.61,A5:880.00,Bb5:932.33,
  A2:110.00,B2:123.47,D2:73.42,E2:82.41,Fs2:92.50,G2:98.00,Bb2:116.54,R:0
};

const tracks=[
  {id:0,name:"Neon Wanderer",artist:"The Echoes",album:"Synthetic Horizon · 2024",dur:"3:47",art:"🎸",bg:"#1e1a33",playlists:["all","energy"],bpm:130,wave:"sawtooth",mel:[N.A4,N.C5,N.E5,N.A5,N.G5,N.E5,N.C5,N.A4,N.G4,N.E4,N.A4,N.R],bas:[N.A2,N.R,N.E3,N.R,N.G3,N.R,N.A2,N.R,N.G3,N.R,N.E3,N.R]},
  {id:1,name:"Midnight Glass",artist:"Luna Drift",album:"After Hours EP · 2023",dur:"4:12",art:"🌙",bg:"#1a1e33",playlists:["all","latenight"],bpm:70,wave:"sine",mel:[N.C4,N.E4,N.G4,N.C5,N.B4,N.G4,N.E4,N.D4,N.C4,N.R,N.E4,N.R],bas:[N.C3,N.R,N.G3,N.R,N.C3,N.R,N.F3,N.R,N.C3,N.R,N.G3,N.R]},
  {id:2,name:"Solar Bloom",artist:"Vera & The Sun",album:"Golden Hour · 2024",dur:"3:28",art:"🌻",bg:"#2a200e",playlists:["all","energy","chill"],bpm:110,wave:"triangle",mel:[N.D4,N.Fs4,N.A4,N.D5,N.A4,N.Fs4,N.E4,N.D4,N.B3,N.D4,N.Fs4,N.A4],bas:[N.D3,N.R,N.A3,N.R,N.D3,N.R,N.Fs3,N.R,N.D3,N.R,N.A3,N.R]},
  {id:3,name:"Static Dreams",artist:"Foldwave",album:"Low Frequency · 2023",dur:"5:01",art:"📻",bg:"#2a1a1a",playlists:["all","latenight"],bpm:90,wave:"square",mel:[N.G4,N.Bb4,N.D5,N.F5,N.D5,N.Bb4,N.G4,N.R,N.F4,N.Ab4,N.C5,N.R],bas:[N.G2,N.R,N.D3,N.R,N.G2,N.R,N.C3,N.R,N.G2,N.R,N.D3,N.R]},
  {id:4,name:"Copper Rain",artist:"The Echoes",album:"Synthetic Horizon · 2024",dur:"3:15",art:"🌧",bg:"#101f1a",playlists:["all","chill"],bpm:80,wave:"sine",mel:[N.E4,N.G4,N.B4,N.D5,N.B4,N.G4,N.E4,N.R,N.D4,N.F4,N.A4,N.R],bas:[N.E3,N.R,N.B3,N.R,N.E3,N.R,N.A3,N.R,N.E3,N.R,N.B3,N.R]},
  {id:5,name:"Deep Circuit",artist:"Nox",album:"Subterranean · 2024",dur:"4:44",art:"⚡",bg:"#1e1a33",playlists:["all","energy"],bpm:140,wave:"sawtooth",mel:[N.B4,N.D5,N.Fs5,N.A5,N.Fs5,N.D5,N.B4,N.A4,N.Fs4,N.A4,N.B4,N.R],bas:[N.B2,N.R,N.Fs3,N.R,N.B2,N.R,N.E3,N.R,N.Fs3,N.R,N.B2,N.R]},
  {id:6,name:"Velvet Tide",artist:"Luna Drift",album:"After Hours EP · 2023",dur:"3:59",art:"🎹",bg:"#221a2a",playlists:["all","latenight","chill"],bpm:95,wave:"triangle",mel:[N.F4,N.A4,N.C5,N.F5,N.E5,N.C5,N.A4,N.R,N.G4,N.Bb4,N.D5,N.R],bas:[N.F3,N.R,N.C3,N.R,N.F3,N.R,N.Bb3,N.R,N.F3,N.R,N.C3,N.R]},
  {id:7,name:"Iron Bloom",artist:"Vera & The Sun",album:"Golden Hour · 2024",dur:"4:22",art:"🌿",bg:"#10201a",playlists:["all","chill"],bpm:100,wave:"sine",mel:[N.A4,N.Db5,N.E5,N.A5,N.E5,N.Db5,N.A4,N.R,N.Fs4,N.A4,N.Db5,N.R],bas:[N.A2,N.R,N.E3,N.R,N.A2,N.R,N.D3,N.R,N.A2,N.R,N.E3,N.R]},
  {id:8,name:"Prism Break",artist:"Foldwave",album:"Low Frequency · 2023",dur:"3:33",art:"💎",bg:"#1a1e2a",playlists:["all","energy"],bpm:125,wave:"square",mel:[N.Db4,N.E4,N.Ab4,N.B4,N.Ab4,N.E4,N.Db4,N.R,N.B3,N.Db4,N.E4,N.R],bas:[N.Db3,N.R,N.Ab3,N.R,N.Db3,N.R,N.Fs3,N.R,N.Db3,N.R,N.Ab3,N.R]},
  {id:9,name:"Desert Signal",artist:"Nox",album:"Subterranean · 2024",dur:"5:18",art:"🏜",bg:"#2a1e10",playlists:["all","latenight"],bpm:75,wave:"sawtooth",mel:[N.D4,N.F4,N.A4,N.D5,N.C5,N.A4,N.F4,N.D4,N.E4,N.G4,N.Bb4,N.R],bas:[N.D3,N.R,N.A3,N.R,N.D3,N.R,N.G3,N.R,N.D3,N.R,N.A3,N.R]},
  {id:10,name:"Soft Collapse",artist:"The Echoes",album:"Synthetic Horizon · 2024",dur:"3:07",art:"🎷",bg:"#221a18",playlists:["all","chill"],bpm:85,wave:"sine",mel:[N.G4,N.B4,N.D5,N.G5,N.F5,N.D5,N.B4,N.R,N.A4,N.C5,N.E5,N.R],bas:[N.G2,N.R,N.D3,N.R,N.G2,N.R,N.C3,N.R,N.G2,N.R,N.D3,N.R]},
  {id:11,name:"Echo Grid",artist:"Luna Drift",album:"After Hours EP · 2023",dur:"4:55",art:"🔮",bg:"#1e1a33",playlists:["all","latenight","energy"],bpm:115,wave:"triangle",mel:[N.E4,N.Ab4,N.B4,N.E5,N.Db5,N.B4,N.Ab4,N.E4,N.Fs4,N.Ab4,N.B4,N.R],bas:[N.E3,N.R,N.B3,N.R,N.E3,N.R,N.A3,N.R,N.E3,N.R,N.B3,N.R]},
];

const PL={all:"All Tracks",favorites:"Favorites",latenight:"Late Night",energy:"Energy Rush",chill:"Chill Waves"};
const S={id:0,playing:false,shuffle:false,repeat:false,progress:0,elapsed:0,volume:0.7,favorites:new Set(),playlist:"all",sortMode:"default",clearedQueue:false};
let ctx=null,masterGain=null,schedulerTimer=null,progressTimer=null,nextNoteTime=0,stepIndex=0,stepDur=0.25;

function initAudio(){if(ctx)return;ctx=new(window.AudioContext||window.webkitAudioContext)();masterGain=ctx.createGain();masterGain.gain.value=S.volume;masterGain.connect(ctx.destination);}

function schedNote(freq,t0,dur,wave,vol){if(!freq||freq<20)return;const osc=ctx.createOscillator(),g=ctx.createGain();osc.type=wave;osc.frequency.value=freq;osc.detune.value=(Math.random()-.5)*6;g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(vol,t0+0.018);g.gain.exponentialRampToValueAtTime(0.0001,t0+dur*0.85);osc.connect(g);g.connect(masterGain);osc.start(t0);osc.stop(t0+dur);}

function scheduleBeat(){const t=tracks[S.id],len=t.mel.length;while(nextNoteTime<ctx.currentTime+0.12){const i=stepIndex%len;schedNote(t.mel[i],nextNoteTime,stepDur*0.88,t.wave,0.20);if(t.bas[i])schedNote(t.bas[i],nextNoteTime,stepDur*1.7,"sine",0.14);nextNoteTime+=stepDur;stepIndex++;}}

function startScheduler(pct){clearInterval(schedulerTimer);if(!ctx)return;if(ctx.state==="suspended")ctx.resume();const t=tracks[S.id];stepDur=(60/t.bpm)/3;const total=parseDur(t.dur),elap=total*(pct/100),totSteps=total/stepDur;stepIndex=Math.floor((elap/total)*totSteps);nextNoteTime=ctx.currentTime+0.05;schedulerTimer=setInterval(scheduleBeat,25);}
function stopScheduler(){clearInterval(schedulerTimer);}

function startProgressTimer(){clearInterval(progressTimer);progressTimer=setInterval(()=>{if(!S.playing)return;const total=parseDur(tracks[S.id].dur);S.elapsed=Math.min(S.elapsed+1,total);S.progress=(S.elapsed/total)*100;if(S.elapsed>=total){if(S.repeat){S.elapsed=0;S.progress=0;}else{nextTrack();return;}}updateProgressUI();tickWaveform();},1000);}
function stopProgressTimer(){clearInterval(progressTimer);}

function parseDur(d){const[m,s]=d.split(":").map(Number);return m*60+s;}
function fmt(s){const m=Math.floor(s/60),sc=Math.floor(s%60);return`${m}:${sc<10?"0":""}${sc}`;}
function curTrack(){return tracks[S.id];}
function getList(pl){let l=pl==="favorites"?tracks.filter(t=>S.favorites.has(t.id)):tracks.filter(t=>t.playlists.includes(pl));if(S.sortMode==="title")l=[...l].sort((a,b)=>a.name.localeCompare(b.name));if(S.sortMode==="artist")l=[...l].sort((a,b)=>a.artist.localeCompare(b.artist));if(S.sortMode==="duration")l=[...l].sort((a,b)=>parseDur(a.dur)-parseDur(b.dur));return l;}

function renderNP(){const t=curTrack();document.getElementById("np-title").textContent=t.name;document.getElementById("np-artist").textContent=t.artist;document.getElementById("np-album").textContent=t.album;document.getElementById("art-emoji").textContent=t.art;document.getElementById("hero-bg").style.background=`radial-gradient(circle at 50% 50%,${t.bg},transparent)`;const fav=S.favorites.has(t.id);document.getElementById("fav-hero-btn").classList.toggle("active",fav);document.getElementById("fav-hero-label").textContent=fav?"Saved":"Save";updateProgressUI();}

function updateProgressUI(){document.getElementById("progress-fill").style.width=S.progress+"%";document.getElementById("progress-input").value=S.progress;document.getElementById("cur-time").textContent=fmt(S.elapsed);document.getElementById("tot-time").textContent=curTrack().dur;}

function hsvg(a){return`<svg width="14" height="14" fill="${a?"var(--accent2)":"none"}" stroke="${a?"var(--accent2)":"currentColor"}" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;}

function renderTracks(){const el=document.getElementById("track-list"),list=getList(S.playlist);document.getElementById("section-title").textContent=PL[S.playlist]||"Tracks";if(!list.length){el.innerHTML=`<div style="padding:40px;text-align:center;color:var(--muted);font-size:13px">No tracks here</div>`;return;}el.innerHTML=list.map((t,i)=>`<div class="track-row${t.id===S.id?" playing":""}" onclick="playTrack(${t.id})"><div class="track-num">${t.id===S.id?`<svg width="14" height="14" fill="var(--accent)" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>`:i+1}</div><div class="track-thumb" style="background:${t.bg}">${t.art}</div><div class="t-info"><div class="t-name">${t.name}</div><div class="t-artist">${t.artist}</div></div><button class="t-fav${S.favorites.has(t.id)?" active":""}" onclick="event.stopPropagation();toggleFav(${t.id})">${hsvg(S.favorites.has(t.id))}</button><div class="t-dur">${t.dur}</div></div>`).join("");}

function renderQueue(){if(S.clearedQueue){document.getElementById("queue-list").innerHTML=`<div style="padding:32px 20px;text-align:center;color:var(--muted);font-size:12px">Queue cleared</div>`;document.getElementById("queue-sub").textContent="0 tracks in queue";return;}const pl=getList(S.playlist),idx=pl.findIndex(t=>t.id===S.id),up=pl.slice(idx+1).concat(pl.slice(0,idx));document.getElementById("queue-sub").textContent=`${up.length} track${up.length!==1?"s":""} in queue`;document.getElementById("queue-list").innerHTML=up.slice(0,10).map((t,i)=>`<div class="queue-row${i===0?" next-up":""}" onclick="playTrack(${t.id})"><div class="q-thumb" style="background:${t.bg}">${t.art}</div><div class="q-info"><div class="q-name">${t.name}</div><div class="q-artist">${t.artist}</div></div>${i===0?`<span class="next-badge">Next</span>`:`<span class="q-dur">${t.dur}</span>`}</div>`).join("");}

function buildWaveform(){document.getElementById("waveform").innerHTML=Array.from({length:48},(_,i)=>{const h=Math.random()*80+10;return`<div class="waveform-bar${(i/48)*100<=S.progress?" active":""}" style="height:${h}%"></div>`;}).join("");}
function tickWaveform(){document.querySelectorAll(".waveform-bar").forEach((b,i)=>{b.classList.toggle("active",(i/48)*100<=S.progress);if(S.playing)b.style.height=(Math.random()*70+10)+"%";});}
function renderAll(){renderNP();renderTracks();renderQueue();buildWaveform();}

function setPlayIcon(p){document.getElementById("play-icon").innerHTML=p?`<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>`:`<polygon points="5 3 19 12 5 21 5 3"/>`;}

function togglePlay(){initAudio();S.playing=!S.playing;setPlayIcon(S.playing);if(S.playing){startScheduler(S.progress);startProgressTimer();}else{stopScheduler();stopProgressTimer();}}

function playTrack(id){initAudio();stopScheduler();stopProgressTimer();S.id=id;S.progress=0;S.elapsed=0;S.playing=true;S.clearedQueue=false;setPlayIcon(true);startScheduler(0);startProgressTimer();renderAll();}

function prevTrack(){const pl=getList(S.playlist),idx=pl.findIndex(t=>t.id===S.id);if(idx<0)return;playTrack(pl[(idx-1+pl.length)%pl.length].id);}
function nextTrack(){if(S.clearedQueue)return;const pl=getList(S.playlist);if(!pl.length)return;if(S.shuffle){const o=pl.filter(t=>t.id!==S.id);if(o.length){playTrack(o[Math.floor(Math.random()*o.length)].id);return;}}const idx=pl.findIndex(t=>t.id===S.id);playTrack(pl[(idx+1)%pl.length].id);}

function seekTo(val){const pct=parseFloat(val),total=parseDur(curTrack().dur);S.progress=pct;S.elapsed=Math.floor(total*pct/100);updateProgressUI();if(S.playing){stopScheduler();startScheduler(pct);}document.querySelectorAll(".waveform-bar").forEach((b,i)=>b.classList.toggle("active",(i/48)*100<=pct));}

function setVolume(val){S.volume=parseInt(val)/100;if(masterGain)masterGain.gain.value=S.volume;}
function toggleShuffle(){S.shuffle=!S.shuffle;document.getElementById("shuffle-btn").classList.toggle("active",S.shuffle);}
function toggleRepeat(){S.repeat=!S.repeat;document.getElementById("repeat-btn").classList.toggle("active",S.repeat);}

function toggleFav(id){if(S.favorites.has(id))S.favorites.delete(id);else S.favorites.add(id);document.getElementById("fav-count").textContent=S.favorites.size;renderNP();renderTracks();renderQueue();}
function toggleCurrentFav(){toggleFav(S.id);}

function switchPlaylist(plId,el){S.playlist=plId;S.clearedQueue=false;document.querySelectorAll(".nav-item").forEach(n=>n.classList.remove("active"));if(el)el.classList.add("active");const pl=getList(plId);if(pl.length&&!pl.find(t=>t.id===S.id)){S.id=pl[0].id;S.progress=0;S.elapsed=0;stopScheduler();stopProgressTimer();S.playing=false;setPlayIcon(false);}renderAll();}

function sortTracks(mode){S.sortMode=mode;renderTracks();renderQueue();}
function clearQueue(){S.clearedQueue=true;renderQueue();}

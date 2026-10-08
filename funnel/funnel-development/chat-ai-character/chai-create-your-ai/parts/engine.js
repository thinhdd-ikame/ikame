/* ============================================================
   CONFIG — edit before launch. Everything marked TODO is a placeholder.
   ============================================================ */
const CONFIG={
  slug:'chai-create-your-ai',
  brand:'ChatChi',
  /* Owner exception 2026-10-07: Chai's weekly plans. Prices = intro after the 50% spin; renew = regular price (struck on the card). */
  plans:{
    '1w': {label:'1-week plan', price:'$9.99',   renew:'$18.99',  per:'week',     renews:'every week',     off:'47% OFF'},
    '4w': {label:'4-week plan', price:'$29.99',  renew:'$49.99',  per:'4 weeks',  renews:'every 4 weeks',  off:'40% OFF', badge:'MOST POPULAR'},
    '52w':{label:'52-week plan',price:'$117.99', renew:'$235.99', per:'year',     renews:'every year',     off:'50% OFF'},
    /* Post-purchase add-on for subscribers: its own one-time Paddle price. The subscription just bought stays as it is. */
    addon:{label:'Bonus character', price:'$22.99', per:'once', oneTime:true, hidden:true}
  },
  /* Hard paywall, no sale screens (Chai has none): leaving a plan checkout goes back to the paywall, the add-on to get_app. */
  declineFlow:{'1w':'paywall','4w':'paywall','52w':'paywall',addon:'get_app'},
  /* hook badges [eyebrow, line]. Chai uses "15M+ users' choice" / "4.5 stars": put real ChatChi numbers here only when sourced. */
  hookBadges:[['ANY CHARACTER','You imagine it'],['4 STORIES','Written for you']],
  defaultPlan:'4w',
  spinWin:50,              // the wheel always lands here (as Chai's does)
  timerMin:10,             // paywall countdown; at 0:00 prices stay, the row turns into "reserved"
  fairUseCap:300,          // TODO confirm
  checkoutUrl:{'1w':'','4w':'','52w':'',addon:''},
  upsell:{name:'Bonus character',title:'Add a second companion',lead:'One more story, one more voice. Yours to keep.',checks:['Create a second companion from scratch','Their own memory and chats','Paid once, no renewal'],cta:'Add for $22.99',note:'$22.99 once. Your plan stays as it is.',decline:'No thanks'},
  app:{web2app:'https://chatchi.go.link?adj_t=2567dkvx_256m7zvv_25adl2th&email={{email}}&user_id={{user.id}}&af_adset={{utm_medium}}&c={{utm_campaign}}&af_ad={{utm_content}}&clickid={{fbclid}}&af_channel={{utm_source}}',
       web2web:'https://chatchi-app.squad-xteam.com/?email={{email}}&user_id={{user.id}}&af_adset={{utm_medium}}&c={{utm_campaign}}&af_ad={{utm_content}}&clickid={{fbclid}}&af_channel={{utm_source}}'},
  legal:{termsUrl:'https://squad-xteam.com/termofuse.html',privacyUrl:'https://squad-xteam.com/policy.html',refundUrl:'https://squad-xteam.com/termofuse.html',supportEmail:'support@chatchi.co'}
};
/* ============================================================ */
const QS=new URLSearchParams(location.search);
const DEBUG=QS.get('debug')==='1';
const IMG=/*IMG-START*/{}/*IMG-END*/;
const src=p=>IMG[p]||p;
const PASS=['utm_source','utm_medium','utm_campaign','utm_term','utm_content','utm_id','fbclid','ttclid','gclid'];
const IC={
  back:'<path d="m15 18-6-6 6-6"/>',x:'<path d="M18 6 6 18M6 6l12 12"/>',check:'<path d="M20 6 9 17l-5-5"/>',
  chat:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  send:'<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>',
  mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',lock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  play:'<path d="m7 4 12 8-12 8z"/>',pause:'<path d="M8 5v14M16 5v14"/>',
  head:'<path d="M3 14v-2a9 9 0 0 1 18 0v2"/><rect x="2" y="14" width="5" height="7" rx="2"/><rect x="17" y="14" width="5" height="7" rx="2"/>',
  mask:'<path d="M2 12c0-4 4-7 10-7s10 3 10 7-4 7-10 7S2 16 2 12Z"/><path d="M8 11h.01M16 11h.01"/>'
};
const ic=(n,s=20,c='currentColor',w=1.9)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;
const logo=(s=26)=>`<svg width="${s}" height="${s}" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 4C10.6 4 3 10.3 3 18.2c0 5 3 9.3 7.6 11.8L9.5 36l7.4-4c1 .1 2 .2 3.1.2 9.4 0 17-6.3 17-14S29.4 4 20 4Z" fill="#B62CB5" class="lg"/><path d="M26 15.6c0 3.4-6 7.4-6 7.4s-6-4-6-7.4a3.3 3.3 0 0 1 6-1.9 3.3 3.3 0 0 1 6 1.9Z" fill="none" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"/></svg>`;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const im=(p,cls='')=>`<img class="${cls}" src="${src(p)}" alt="" decoding="async" draggable="false" onerror="this.remove()">`;
const lnk=(txt,url)=>url?`<a href="${esc(url)}" target="_blank" rel="noopener">${txt}</a>`:`<a>${txt}</a>`;

/* ---- quiz data (Chai quiz v2 order) ---- */
const PREF={men:['♂','I prefer men'],women:['♀','I prefer women'],nb:['⚧','I prefer non-binary']};
const OWN={male:['♂','I am male'],female:['♀','I am female'],nb:['⚧','I am non-binary']};
const AGES=['18-24','25-34','35-44','45-54','55+'];
const KIND={comfort:['🧸','Comfort characters'],funny:['😂','Upbeat and funny'],slow:['🕯️','Slow burn'],friend:['🤝','Friendship'],stories:['📖','Stories']};
const STYLE={anime:['✨','Anime / fan art'],photo:['📸','Photorealistic'],any:['⭕','No preference']};
/* reference tiles: file, default name, archetype tag (Chai shows "Kade - Bestie") */
const REF={
 men:[['kade','Kade','Bestie'],['lucien','Lucien','Mysterious'],['ryo','Ryo','Rival'],['theo','Theo','Sunshine'],['dante','Dante','Bad boy'],['elias','Elias','Bookworm']],
 women:[['mia','Mia','Bestie'],['selene','Selene','Mysterious'],['yuna','Yuna','Rival'],['ivy','Ivy','Sunshine'],['raven','Raven','Rebel'],['clara','Clara','Bookworm']],
 nb:[['rowan','Rowan','Bestie'],['sky','Sky','Mysterious'],['ash','Ash','Rival'],['quinn','Quinn','Sunshine'],['river','River','Rebel'],['nico','Nico','Bookworm']]
};
const TRAITS=['💖 Kind','😃 Outgoing','💪 Brave','🎨 Creative','😂 Funny','🛡️ Protective','☀️ Cheerful','🌸 Gentle','🤗 Empathetic','🎯 Focused','🌟 Charming','🧘 Calm','🤓 Nerdy','😏 Sarcastic','🌶️ Sassy','🃏 Witty','🤠 Adventurous','🤪 Goofy','📚 Bookish','🎧 Chill','🧠 Smart','💅 Confident','🔥 Ambitious','💚 Jealous','🌙 Mysterious'];
/* meet places: label, "where" phrase, sensory detail used in the scene text */
const PLACE={
 woods:['🌲 In the woods','in the woods','pine needles crunch underfoot and the light comes through the trees in long gold stripes'],
 dungeon:['🏰 Dungeon','deep in an old dungeon','torchlight flickers on wet stone and somewhere water drips in the dark'],
 home:['🏠 At your home','at your place','the kettle is just starting to whistle and the rain taps on your window'],
 coffee:['☕ Coffee shop','at the corner coffee shop','the espresso machine hisses and the window seat is the last one free'],
 beach:['🏖️ Beach','on the beach at sunset','the tide is coming in and the sand is still warm'],
 rooftop:['🌃 Rooftop bar','at a rooftop bar','the city glitters below and the music is low enough to talk'],
 plane:['✈️ On a plane','on a night flight','the cabin lights are dimmed and the seat next to yours was supposed to be empty'],
 yacht:['🌊 On a yacht','on a yacht off the coast','the deck rocks gently and the stars are brighter than you have ever seen'],
 mansion:['🏚️ Abandoned mansion','in an abandoned mansion','dust hangs in the moonlight and a door creaks somewhere upstairs'],
 theirs:['🏡 At their home','at {his} place','{his} apartment smells like coffee and there are books stacked everywhere'],
 hospital:['🏥 Hospital','in a quiet hospital corridor','the night shift is calm and the vending machine hums'],
 school:['🏫 School','after class at school','the hallway is empty and the late sun hits the lockers'],
 dorm:['🎓 College dorm','in the college dorm','someone is playing guitar down the hall and finals are next week'],
 battle:['⚔️ Battlefield','at the edge of a battlefield','the fighting has gone quiet and smoke drifts over the hills'],
 club:['🎵 Club','at a club','the bass is loud and the crowd pushes you two together'],
 office:['🏢 Office','at the office after hours','everyone else has gone home and the city lights are coming on'],
 park:['🎡 Amusement park','at an amusement park','the Ferris wheel turns slowly and the air smells like cotton candy'],
 pool:['🏊 Swimming pool','by the pool at night','the water glows blue and the party noise is far away'],
 alien:['🛸 Alien planet','on an alien planet','two moons hang in a violet sky and the ground hums softly']
};
/* shared memories: pronoun tokens {He} {he} {him} {his} {s} {has} {is} are filled for the chosen gender */
const MEM=['You grew up together','{He} {has} a secret identity','You once betrayed {him}','You were childhood rivals','You can tell {him} anything','You met at summer camp','{He} always make{s} you laugh',"You're teammates",'You share an inside joke','{He} saved your life once','You share a dark past','{He} {has} a nickname for you',"{He}{is} your only friend",'{He} never trust{s} easily','You never expected to meet again'];
const MYTR=['🧠 Smart','😃 Outgoing','💪 Brave','🎨 Creative','😂 Funny','💖 Kind','🌙 Mysterious','😈 Mischievous','🔥 Ambitious','🎯 Focused','🦋 Free spirit','🌊 Laid-back','🌟 Charming','💡 Introverted','🎭 Playful','🧘 Calm'];
const MYFACT=["You're a billionaire","You're a famous athlete","You're royalty","You're {his} boss","You're untouchable","You're unbelievably strong","You have a perfect smile","You're new in town"];
const SPIN=[10,15,20,30,40,50];

const INIT=()=>({i:1,hist:[],ai:'',pref:'',own:'',age:'',kind:[],style:'',ref:'',cname:'',cage:22,traits:[],place:'',mems:[],memOwn:[],uname:'',myTr:[],myFacts:[],myOwn:[],plot:0,pick:-1,voice:-1,vg:'',email:'',emErr:'',spun:false,disc:0,plan:CONFIG.defaultPlan,agree:false,agErr:false,pwStart:0,premium:false,addon:false,chat:[],typing:false,sent:0,completed:false});
let S=INIT();
const SCREENS={1:'hook',2:'pref_gender',3:'own_gender',4:'age',5:'chat_kind',6:'style',7:'reference',8:'char_name',9:'char_age',10:'personality',11:'meet_place',12:'memories',13:'bridge_you',14:'your_name',15:'your_background',16:'gen_scenario',17:'scenario',18:'gen_audio',19:'voice',20:'email',21:'spin',22:'paywall'};

/* ---------- character helpers ---------- */
const PR={men:{he:'he',He:'He',him:'him',his:'his',s:'s',has:'has',is:"'s"},women:{he:'she',He:'She',him:'her',his:'her',s:'s',has:'has',is:"'s"},nb:{he:'they',He:'They',him:'them',his:'their',s:'',has:'have',is:"'re"}};
const pr=()=>PR[S.pref]||PR.women;
const pf=s=>String(s).replace(/\{(He|he|him|his|s|has|is)\}/g,(m,k)=>pr()[k]);
const refSet=()=>{const g=REF[S.pref]?S.pref:'women';const st=S.style==='anime'?['a']:S.style==='photo'?['p']:['a','p'];
  /* 'No preference' = 3 anime + 3 photo, alternating */
  return st.length===1?REF[g].map(r=>({k:`ref-${g}-${st[0]}-${r[0]}`,n:r[1],t:r[2]})):REF[g].map((r,j)=>({k:`ref-${g}-${j%2?'p':'a'}-${r[0]}`,n:r[1],t:r[2]}))};
const refImg=()=>'img/'+(S.ref||refSet()[0].k)+'.jpg';
const cfull=()=>S.cname.trim()||'Kade - Bestie';
const cshort=()=>cfull().split(/\s+[-–]\s+/)[0];
const uname=()=>S.uname.trim()||'Alex';
const strip=x=>String(x).replace(/^\S+\s/,'');
const promo=()=>uname().replace(/[^A-Za-z0-9]/g,'')+'_'+new Date().toLocaleString('en',{month:'short'}).toLowerCase()+new Date().getFullYear();

/* ---------- 4 opening scenarios, built from every pick (a real build calls the LLM; this is the deterministic fallback) ---------- */
function plots(){
  const c=esc(cshort()),n=esc(uname()),P=pr(),pl=PLACE[S.place]||PLACE.coffee,where=pf(pl[1]),det=pf(pl[2]);
  const tr=(S.traits.length?S.traits:['💖 Kind']).map(strip).map(x=>x.toLowerCase());
  const mem=pf(S.mems[0]||S.memOwn[0]||'You grew up together');
  const memL=mem.charAt(0).toLowerCase()+mem.slice(1);
  const age=S.cage,He=P.He,he=P.he,his=P.his,him=P.him,s=P.s;
  const tone=tr.includes('sarcastic')||tr.includes('sassy')?'tease':tr.includes('mysterious')||tr.includes('cunning')?'dark':tr.includes('funny')||tr.includes('goofy')?'fun':'warm';
  const L={warm:["Hey. I was hoping it'd be you.","Come sit with me for a bit?"],tease:["Well, look who finally showed up.","Took you long enough."],dark:["You shouldn't be here. ...But I'm glad you are.","Stay close. Don't ask yet."],fun:["Okay, don't laugh, but I've been practising what to say.","You're late, so you're buying."]}[tone];
  const back=`${c} is ${age}, ${tr.slice(0,3).join(', ')}. ${memL.startsWith('you')?'You and '+c+' share one thing nobody else knows: '+memL+'.':He+' never forgot that '+memL+'.'}`;
  return [
   {t:'Safe With You',scene:`You're ${where} when you spot ${c}. ${det.charAt(0).toUpperCase()+det.slice(1)}. ${He} look${s} tired, but when ${he} see${s} you, ${his} whole face lights up.`,msg:`${n}! ${L[0]} ${L[1]}`,back},
   {t:'Welcome Home',scene:`It's been months. You're ${where}, and ${det}. Then you hear a familiar voice behind you: ${c}, back at last, closer than you expected.`,msg:`Hey, ${n}. I'm back. ...I missed you. What did I miss?`,back},
   {t:'Promised Return',scene:`You two made a promise years ago to meet ${where}. Tonight ${det}, and ${c} is already there, pretending not to check the time.`,msg:`You remembered. Of course you did, ${n}. ${L[1]}`,back},
   {t:'Unexpected Reunion',scene:`You never planned to be ${where} tonight. ${det.charAt(0).toUpperCase()+det.slice(1)}. And there is ${c}, the last person you expected, smiling like no time has passed.`,msg:`${n}? No way. It's really you. ${L[0]}`,back}
  ];
}
const plotNow=()=>plots()[S.pick>=0?S.pick:0];

/* ---------- voices: pre-recorded ElevenLabs v3 previews (gen_voices.py), 5 male + 5 female, tab default follows screen 2 ---------- */
const VOICES={"male":[["m1","Smooth",4],["m2","Deep",5],["m3","Playful",5],["m4","Husky",5],["m5","Warm",4]],"female":[["f1","Soft",4],["f2","Playful",5],["f3","Velvet",4],["f4","Husky",4],["f5","Sweet",3]]};
const vgOf=()=>S.vg||(S.pref==='men'?'male':'female');
let AU=null;
function stopVoice(){try{if(AU){AU.pause();AU=null}}catch(e){}}
function playVoice(k){
  const r=cur();if(!r)return;const rows=r.querySelectorAll('.vrow');stopVoice();
  rows.forEach(x=>{x.classList.remove('play');x.querySelector('.pl').innerHTML=ic('play',14)});
  const row=rows[k],v=VOICES[vgOf()][k];if(!row||!v)return;
  const done=()=>{row.classList.remove('play');row.querySelector('.pl').innerHTML=ic('play',14)};
  row.classList.add('play');row.querySelector('.pl').innerHTML=ic('pause',14);
  try{AU=new Audio(src('audio/'+v[0]+'.mp3'));AU.onended=done;AU.onerror=done;const pr=AU.play();if(pr&&pr.catch)pr.catch(done)}catch(e){done()}
}

const phone=document.getElementById('phone');
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
let timers=[],LD=null,TICK=0;
const later=(fn,ms)=>{const id=setTimeout(fn,ms);timers.push(id);return id};
function persist(){try{if(typeof ikfSave==='function')ikfSave();else sessionStorage.setItem(DKEY,JSON.stringify(Object.assign({},S,{typing:false})))}catch(e){}}
const clearT=()=>{timers.forEach(clearTimeout);timers=[];if(LD)clearInterval(LD);LD=null;clearInterval(TICK);TICK=0;S.typing=false;stopVoice()};

/* ---------- tracking (no free text) ---------- */
function snapshot(){return {screen:S.i,screenName:SCREENS[S.i],aiBefore:S.ai||null,prefers:S.pref||null,gender:S.own||null,age:S.age||null,chatKind:S.kind.slice(),style:S.style||null,reference:S.ref||null,charAge:S.cage,traits:S.traits.slice(),place:S.place||null,memories:S.mems.length+S.memOwn.length,background:S.myTr.length+S.myFacts.length+S.myOwn.length,scenario:S.pick,voice:S.voice>=0?vgOf()+'-'+(S.voice+1):null,discount:S.disc,plan:S.plan,premium:S.premium,addon:!!S.addon,hasEmail:!!S.email}}
function emit(name,detail){
  let data={};try{data=snapshot()}catch(e){}
  const d=Object.assign({},detail||{},{data});
  try{window.dispatchEvent(new CustomEvent('ikfunnel:'+name,{detail:d}))}catch(e){}
  try{window.parent.postMessage({source:'ikame-funnel',funnel:CONFIG.slug,event:name,detail:d},'*')}catch(e){}
  const flat=Object.assign({funnel:CONFIG.slug},data,detail||{});
  try{if(typeof window.fbq==='function')window.fbq('trackCustom',name,flat)}catch(e){}
  try{if(window.ttq&&typeof window.ttq.track==='function')window.ttq.track(name,flat)}catch(e){}
  if(DEBUG)try{console.log('[ikfunnel] '+name,d)}catch(e){}
}
const answer=(key,value)=>emit('answer',{key,value});
function navTop(href){try{window.top.location.href=href}catch(e){location.href=href}}
function checkout(plan){
  const p=CONFIG.plans[plan],url=CONFIG.checkoutUrl[plan]||'';
  emit('checkout_click',{plan,price:p.price,url});
  if(!url){demoCheckout(plan);return}
  let u;try{u=new URL(url,location.href)}catch(e){return}
  u.searchParams.set('plan',plan);PASS.forEach(k=>{const v=QS.get(k);if(v&&!u.searchParams.has(k))u.searchParams.set(k,v)});
  navTop(u.toString());
}
/* "Open the app": Android -> web2app (Adjust link), iOS and desktop -> web2web. Tokens filled from the funnel email, FunnelFox id and the landing query. */
const IKF_ATTR_KEY='ikf_attr_'+CONFIG.slug;
(function(){try{const q=new URLSearchParams(location.search),o=JSON.parse(sessionStorage.getItem(IKF_ATTR_KEY)||'{}');['utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid','fpid'].forEach(k=>{const v=q.get(k);if(v)o[k]=v});sessionStorage.setItem(IKF_ATTR_KEY,JSON.stringify(o))}catch(e){}})();
function attrVal(k){let o={};try{o=JSON.parse(sessionStorage.getItem(IKF_ATTR_KEY)||'{}')}catch(e){}if(o[k])return o[k];try{for(const st of [sessionStorage,localStorage])for(let i=0;i<st.length;i++){const n=st.key(i);if(n&&n.indexOf('ff_variables_query_state_')===0){const v=JSON.parse(st.getItem(n)||'{}');if(v&&v[k])return String(v[k])}}}catch(e){}return ''}
function ffUserId(){const q=new URLSearchParams(location.search).get('fpid')||attrVal('fpid');if(q)return q;const m=document.cookie.match(/(?:^|;\s*)ff-user=([^;]+)/);return m?decodeURIComponent(m[1]):''}
function userEmail(){let e=(typeof S!=='undefined'&&S&&S.email)||'';try{const F=window.fox;if(!e&&F&&F.inputs&&F.inputs.getEmail){const r=F.inputs.getEmail();e=typeof r==='string'?r:(r&&r.value)||''}}catch(x){}return String(e||'').trim()}
function fillLink(t){const v={email:userEmail(),'user.id':ffUserId(),utm_medium:attrVal('utm_medium'),utm_campaign:attrVal('utm_campaign'),utm_content:attrVal('utm_content'),utm_source:attrVal('utm_source'),fbclid:attrVal('fbclid')};return String(t||'').replace(/\{\{\s*([\w.]+)\s*\}\}/g,(m,k)=>encodeURIComponent(v[k]||''))}
function openApp(){const android=/android/i.test(navigator.userAgent||'');const u=fillLink(android?CONFIG.app.web2app:CONFIG.app.web2web);emit('app_handoff',{url:u,target:android?'web2app':'web2web'});if(u)navTop(u)}

const DKEY='ikf_demo_'+CONFIG.slug;
function viewed(){
  if(typeof ffGo!=='function')try{sessionStorage.setItem(DKEY,JSON.stringify(Object.assign({},S,{typing:false})))}catch(e){}
  emit('screen_view',{index:S.i,name:SCREENS[S.i]});
  if(S.i===22)emit('paywall_view',{placement:'onboarding',discount:S.disc});
  if(S.i===CHAT&&S.premium&&!S.completed){S.completed=true;emit('complete',{premium:true})}
}
function go(n,push=true){if(n===CHAT&&!S.premium)n=S.email?22:20;clearT();if(push&&S.i!==n)S.hist.push(S.i);S.i=n;render(true);viewed()}
const next=()=>go(S.i+1);
function back(){clearT();const p=S.hist.pop();if(p){S.i=p;render(true);viewed()}}
function toast(msg){const el=document.createElement('div');el.className='toast';el.textContent=msg;phone.appendChild(el);setTimeout(()=>el.remove(),2900)}

/* ---------- building blocks ---------- */
const QN=[2,3,4,5,6,7,8,9,10,11,12,14,15,17,19];   // screens with the n/15 counter
function nav(){
  const k=QN.indexOf(S.i);const top=[1,13,16,18,20,21].includes(S.i);
  if(k<0&&!top)return '';
  const bk=k>=0?`<button class="iconbtn" data-a="back" aria-label="Back">${ic('back',22)}</button>`:'<span class="sp"></span>';
  return `<div class="tb"><div class="row">${bk}<div class="lg">${logo(24)} ChatChi</div><div class="cnt">${k>=0?(k+1)+'/'+QN.length:''}</div></div>${k>=0?`<div class="pbar"><i style="width:${((k+1)/QN.length*100).toFixed(1)}%"></i></div>`:''}</div>`;
}
const cta=(label,ok=true,act='next')=>`<button class="btn" data-a="${act}" ${ok?'':'disabled'}>${label}</button>`;
const ck=()=>`<span class="ck">${ic('check',13,'#fff',3)}</span>`;
const q=(a,s,pk)=>`<h1 class="q2">${a}</h1>${s?`<p class="sub2${pk?' pk':''}">${s}</p>`:''}`;
const STAR='<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z" fill="#F2A9DD"/></svg>';
const SUBP='We\'ll personalize everything to your answers.';
function opts(field,obj,{multi=false,cls='big'}={}){
  return `<div class="opts">${Object.entries(obj).map(([k,[e,l]])=>{const on=multi?S[field].includes(k):S[field]===k;
    return `<button class="opt ${cls} ${on?'on':''}" data-a="${multi?'mpick':'pick'}" data-f="${field}" data-v="${k}" aria-pressed="${on}"><span class="em">${e}</span><span class="lbl">${l}</span>${multi?ck():''}</button>`}).join('')}</div>`;
}
const peek=()=>`<div class="peek">${im(S.ref?refImg():`img/ref-${REF[S.pref]?S.pref:'men'}-p-${(REF[S.pref]||REF.men)[0][0]}.jpg`)}</div>`;
const chd=(sz='')=>`<div class="chd"><div class="pt ${sz}">${im(refImg())}</div></div>`;
const cname=()=>`<span class="pk">${esc(cfull())}</span>`;
/* chips in 3 marquee rows (Chai) — tap pauses the row */
function marquee(field,list,{max=4,pron=true,own=null}={}){
  const sel=S[field];const rows=[[],[],[]];list.forEach((x,j)=>rows[j%3].push(x));
  const chip=x=>{const on=sel.includes(x);return `<button class="chip ${on?'on':''}" data-a="chip" data-f="${field}" data-v="${esc(x)}" data-max="${max}" aria-pressed="${on}">${esc(pron?pf(x):x)}</button>`};
  const mine=own?S[own].map((x,j)=>`<button class="chip on" data-a="unown" data-f="${own}" data-v="${j}">${esc(x.length>22?x.slice(0,21)+'…':x)}<span class="xx">✕</span></button>`).join(''):'';
  return `${mine?`<div class="mylist">${mine}</div>`:''}<div class="mq">${rows.map((r,j)=>`<div class="rw"><div class="tr" style="--d:${34+j*7}s">${r.map(chip).join('')}${r.map(chip).join('')}</div></div>`).join('')}</div>`;
}
const ownBox=(field,ph)=>`<div class="inl"><div class="box"><input data-f="draft_${field}" maxlength="60" placeholder="${ph}"></div><button class="btn ghost" data-a="addown" data-f="${field}">Add</button></div>`;
const count=(...fs)=>fs.reduce((a,f)=>a+S[f].length,0);

/* ---------- screens ---------- */
const V={
1:()=>`<div class="hk">
  <div class="bdg">${CONFIG.hookBadges.map(([s,l],k)=>`<div><span class="bi">${k?STAR:ic('check',16,'#F2A9DD',2.6)}</span><span><small>${esc(s)}</small>${esc(l)}</span></div>`).join('')}</div>
  <div class="hero">${im('img/hook.jpg')}</div>
  <h1>Create your perfect AI</h1>
  <div class="ask">Have you ever chatted with an AI before?</div>
  <div class="yn"><button class="btn" data-a="ai" data-v="yes">YES <span class="cv">›</span></button><button class="btn ghost" data-a="ai" data-v="no">NO <span class="cv">›</span></button></div>
  <p class="legal hl">By proceeding, you agree with ${lnk('Terms and Conditions',CONFIG.legal.termsUrl)}, ${lnk('Privacy Policy',CONFIG.legal.privacyUrl)}, ${lnk('Subscription Terms',CONFIG.legal.termsUrl)}</p>
  <p class="legal corp">ChatChi: AI Roleplay Chat</p></div>`,
2:()=>`<div class="scr rel">${q('Who do you enjoy chatting with?',SUBP)}${opts('pref',PREF)}</div>`,
3:()=>`<div class="scr rel">${q('What is your gender?',SUBP)}${opts('own',OWN)}${peek()}</div>`,
4:()=>`<div class="scr rel">${q('What is your age?',SUBP)}<div class="opts">${AGES.map(a=>`<button class="opt narrow ${S.age===a?'on':''}" data-a="pick" data-f="age" data-v="${a}"><span class="lbl">${a}</span></button>`).join('')}</div>${peek()}</div>`,
5:()=>`<div class="scr">${q('What kind of chat do you want?','Select all that apply.')}${opts('kind',KIND,{multi:true})}</div><div class="foot">${cta('CONTINUE',S.kind.length>0)}</div>`,
6:()=>`<div class="scr">${q('Anime or photorealistic?',"We'll match your character's style to this.")}${opts('style',STYLE)}</div>`,
7:()=>`<div class="scr">${q('Pick a look you like',`You can tweak ${pr().him} however you want next.`,true)}
  <div class="rgrid">${refSet().map(r=>`<button class="rtile ${S.ref===r.k?'on':''}" data-a="ref" data-v="${r.k}" data-n="${esc(r.n+' - '+r.t)}">${im('img/'+r.k+'.jpg')}<span class="nm">${esc(r.n)}</span></button>`).join('')}</div>
  <p class="aidis">All images are AI-generated fictional adults (18+) and do not depict real people.</p></div>`,
8:()=>`<div class="scr">${chd('lg')}${q(`Let's refine ${pr().him}!`,`What should ${pr().his} name be?`)}
  <div class="box${S.emErr?' bad':''}"><input id="cn" data-f="cname" maxlength="24" placeholder="Character name" value="${esc(S.cname)}" aria-label="Character name"></div>${S.emErr?`<p class="emerr" role="alert">${esc(S.emErr)}</p>`:''}</div>
  <div class="foot">${cta('CONTINUE',true,'cname')}</div>`,
9:()=>`<div class="scr">${q(`Let's set the scene with ${cname()}!`)}${chd('lg')}<p class="qq">What is ${pr().his} age?</p>
  <div class="wp"><div class="sel"></div><div class="lst" id="wp">${'<div class="pad"></div>'}${Array.from({length:63},(_,j)=>j+18).map(a=>`<div class="it ${a===S.cage?'on':''}" data-age="${a}">${a}</div>`).join('')}<div class="pad"></div></div><span class="yo">Years old</span></div></div>
  <div class="foot">${cta('CONTINUE')}</div>`,
10:()=>`<div class="scr">${q(`Let's set the scene with ${cname()}!`)}${chd()}<p class="qq">What is ${pr().his} personality like?</p><p class="qs">Select up to 4</p>${marquee('traits',TRAITS,{max:4,pron:false})}</div>
  <div class="foot">${cta('CONTINUE',S.traits.length>0)}</div>`,
11:()=>`<div class="scr">${q(`Let's set the scene with ${cname()}!`)}${chd()}<p class="qq">Where would you two like to meet?</p>
  <div class="mq">${[0,1,2].map(j=>{const r=Object.entries(PLACE).filter((_,i)=>i%3===j);const c=r.map(([k,v])=>`<button class="chip ${S.place===k?'on':''}" data-a="place" data-v="${k}">${esc(pf(v[0]).replace('At their home','At '+pr().his+' home'))}</button>`).join('');return `<div class="rw"><div class="tr" style="--d:${36+j*6}s">${c}${c}</div></div>`}).join('')}</div></div>`,
12:()=>`<div class="scr">${q(`Let's set the scene with ${cname()}!`)}${chd()}<p class="qq">Anything ${pr().he} must remember?</p><p class="qs">Select up to 4</p>
  ${marquee('mems',MEM,{max:4,own:'memOwn'})}${ownBox('memOwn','✏️ Write your own')}</div>
  <div class="foot">${cta('CONTINUE',count('mems','memOwn')>0)}</div>`,
13:()=>`<div class="fb half">${im(refImg())}</div><div class="scr" style="justify-content:flex-end;position:relative;z-index:2"><div class="bdgx" style="padding-bottom:4px"><h2>You're doing great!</h2><p>Now, let's talk about you.</p></div></div>
  <div class="foot">${cta('CONTINUE')}</div>`,
14:()=>`<div class="scr">${q('What is your name?')}<div class="box${S.emErr?' bad':''}" style="margin-top:8px"><input id="un" data-f="uname" maxlength="20" placeholder="Your name" value="${esc(S.uname)}" aria-label="Your name" autocomplete="given-name"></div>${S.emErr?`<p class="emerr" role="alert">${esc(S.emErr)}</p>`:''}</div>
  <div class="foot">${cta('CONTINUE',!!S.uname.trim(),'uname')}</div>`,
15:()=>`<div class="scr">${q('Your own background','Select up to 8.')}
  <div class="grp">Your personalities:</div>${marquee('myTr',MYTR,{max:8,pron:false})}
  <div class="grp">Facts about you:</div>${marquee('myFacts',MYFACT,{max:8,own:'myOwn'})}${ownBox('myOwn','✏️ Write your own')}</div>
  <div class="foot">${cta('CONTINUE',count('myTr','myFacts','myOwn')>0)}</div>`,
16:()=>ldHTML("You're doing great!",'Writing your scenario…'),
17:()=>{const ps=plots(),k=S.plot,p=ps[k];
  return `<div class="scr">${q(`Pick your story with ${cname()}`,'Swipe through 4 plots, choose one.')}
  <div class="plot" key="${k}"><div class="pt"><span class="av">${im(refImg())}</span><b>Plot ${k+1}: ${p.t}</b></div>
   <h4>🎬 Scene</h4><p>${p.scene}</p><h4>💬 First message</h4><p class="fm">${p.msg}</p><h4>🖤 ${esc(cshort())}'s backstory</h4><p>${p.back}</p></div>
  <div class="pnav"><button data-a="plotp" ${k===0?'disabled':''}>‹ Previous</button><div class="dots">${ps.map((_,j)=>`<i class="${j===k?'on':''}"></i>`).join('')}</div><button data-a="plotn" ${k===3?'disabled':''}>Next ›</button></div>
  <p class="aitag">AI-generated story. ${esc(cshort())} is a fictional AI character.</p></div>
  <div class="foot">${cta('SELECT THIS SCENARIO',true,'plotsel')}</div>`},
18:()=>ldHTML('Almost there!',`Creating ${esc(cshort())}'s voice…`),
19:()=>`<div class="scr">${q(`Choose ${esc(cshort())}'s voice`)}
  <div class="vbub"><span class="av">${im(refImg())}</span><div><div class="nm">${esc(cfull())}</div><div class="tx">${plotNow().msg}</div></div></div>
  <div class="vtabs" role="tablist">${[['male','♂ Male voices'],['female','♀ Female voices']].map(([g,l])=>`<button role="tab" aria-selected="${vgOf()===g}" class="${vgOf()===g?'on':''}" data-a="vtab" data-v="${g}">${l}</button>`).join('')}</div>
  <div class="vl">${VOICES[vgOf()].map(([id,lb,sec],k)=>`<div class="lb">Voice ${k+1} · ${lb}</div><button class="vrow ${S.voice===k?'on':''}" data-a="voice" data-v="${k}" aria-label="Play voice ${k+1}, ${lb}"><span class="pl">${ic('play',14)}</span><span class="wv">${Array.from({length:22},(_,j)=>`<i style="--h:${20+Math.round(Math.abs(Math.sin((j+1)*(k+2)*1.7))*80)}%"></i>`).join('')}</span><span class="du">0:${String(sec).padStart(2,'0')}</span></button>`).join('')}</div>
  <p class="aitag">Voice preview. AI voice, not a real person.</p></div>
  <div class="foot">${cta('SELECT THIS VOICE',S.voice>=0,'voicesel')}</div>`,
20:()=>`<div class="scr" style="gap:16px">${q(`Get your <span class="gt">personal companion</span>`,`Enter your email to save ${esc(cshort())}.`)}
  <div class="box${S.emErr?' bad':''}" style="height:56px">${ic('mail',18,'var(--t3)')}<input id="em" data-f="email" type="email" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false" maxlength="80" placeholder="Your email" value="${esc(S.email)}" aria-label="Email" style="margin-left:10px"></div>
  ${S.emErr?`<p class="emerr" role="alert">${esc(S.emErr)}</p>`:''}
  <p class="lockn">${ic('lock',14)}<span>We respect your privacy. Your data is processed under our ${lnk('Privacy Policy',CONFIG.legal.privacyUrl)}.</span></p>
  <div class="gift"><span class="g">🎁</span><span>Use a real email so you don't miss your <b>bonus</b>.</span></div></div>
  <div class="foot">${cta('CONTINUE',!!S.email.trim(),'emailgo')}</div>`,
21:()=>`<div class="scr" style="gap:8px">${q(`Spin & save on <span class="pk">${esc(cfull())}</span>!`,'A personalized offer to start chatting 🎁')}
  <div class="whl"><div class="rim"></div><div class="bulbs">${Array.from({length:16},(_,j)=>`<i style="--a:${j*22.5}deg"></i>`).join('')}</div>
   <div class="disc" id="disc" style="transform:rotate(${S.spun?spinTo():0}deg)">${SPIN.map((v,j)=>`<div class="seg" style="--a:${j*60+30}deg"><span>${v}%<small>off</small></span></div>`).join('')}</div><div class="ptr"></div><div class="hub"></div></div></div>
  <div class="foot">${S.spun?cta('CLAIM MY DISCOUNT',true,'claim'):cta('SPIN',true,'spin')}</div>${S.spun?wonHTML():''}`,
22:()=>pwHTML()
};
const spinTo=()=>{const j=SPIN.indexOf(CONFIG.spinWin);return 360*6-(j*60+30)};
const wonHTML=()=>`<div class="won" role="dialog" aria-label="You won"><div class="confetti">${RM?'':Array.from({length:24},(_,j)=>`<i style="left:${(j*41)%100}%;background:${['#F2A9DD','#F6D58A','#7FD1A8','#9AB8FF'][j%4]};animation-delay:${(j%6)*.08}s"></i>`).join('')}</div>
  <h3>Woo hoo! 🥳</h3><p>${esc(uname())}, you won the <b>maximum</b> discount</p><div class="big">${CONFIG.spinWin}% off</div><p>Applied automatically.</p>${cta('CLAIM MY DISCOUNT',true,'claim')}</div>`;
function ldHTML(h,p){return `<div class="fb gray">${im(refImg())}</div><div class="ldwrap"><h2>${h}</h2><p>${p}</p><div class="ring" id="ring" style="--p:0"><b>0%</b></div></div>`}
function runLoad(ms,to){let t0=Date.now();const r=document.getElementById('ring');
  LD=setInterval(()=>{const p=Math.min(100,Math.round((Date.now()-t0)/ms*100));if(r){r.style.setProperty('--p',p);r.querySelector('b').textContent=p+'%'}
    if(p>=100){clearInterval(LD);LD=null;later(()=>go(to),RM?0:500)}},RM?20:60)}

/* ---------- paywall (Chai layout) ---------- */
const PLANS=CONFIG.plans;
const visPlan=()=>PLANS[S.plan]&&!PLANS[S.plan].hidden?S.plan:CONFIG.defaultPlan;
const disclose=()=>{const p=PLANS[visPlan()];return `By clicking Get My Plan, I agree to pay ${p.price} for my first ${p.per}. If I don't cancel before the intro period ends, it renews at ${p.renew} ${p.renews} until I cancel. I can cancel anytime in my account settings or by emailing ${CONFIG.legal.supportEmail}.`};
const left=()=>{if(!S.pwStart)return CONFIG.timerMin*60;return Math.max(0,CONFIG.timerMin*60-Math.floor((Date.now()-S.pwStart)/1000))};
const mmss=s=>String(Math.floor(s/60)).padStart(2,'0')+' : '+String(s%60).padStart(2,'0');
function pwHTML(){
  const p=PLANS[visPlan()],c=esc(cfull()),l=left();
  return `<div class="cpw" id="pw" role="dialog" aria-label="ChatChi Plus">
  <div class="cbar"><div class="tm"><small>Discount ${l?'expires in':'reserved'}</small><b data-timer>${l?mmss(l):'✓'}</b>${l?'<span>min &nbsp; sec</span>':''}</div><div class="pr"><b data-today>${p.price}</b>today</div><button class="btn" data-a="buy" style="margin-left:6px">GET MY PLAN</button></div>
  <div class="csec"><div class="chero"><span class="tg">🎁 Special discount: <b>${S.disc||CONFIG.spinWin}%</b></span><h1>Endless chats with<br><em>${c}</em></h1><p class="sub2" style="margin:-6px 0 14px">Plus every other character on ChatChi.</p><span class="pill">Your story starts the moment you join</span></div></div>
  <div class="csec"><div class="ctiles"><div><small>👤 Personalized access to</small><b>ChatChi Plus</b></div><div><small>🎯 Your entitlement</small><b>${S.disc||CONFIG.spinWin}% discount</b></div></div></div>
  <div class="csec"><div class="promo"><div class="h"><i>%</i>Your promo code is applied!</div><div class="r"><div class="code"><i>✓</i>${esc(promo())}</div>${l?`<div class="clk" data-timer>${mmss(l).replace(/ /g,'')}</div>`:''}</div>${l?'':'<div class="rsv">Your discount is reserved.</div>'}</div></div>
  <div class="csec"><div class="cplans">${Object.entries(PLANS).filter(([k,x])=>!x.hidden).map(([k,x])=>{const on=visPlan()===k;return `<button class="cplan ${on?'on':''}" data-a="plan" data-v="${k}" aria-pressed="${on}">${x.badge?`<span class="pop">👍 ${x.badge}</span>`:''}<span class="rd"></span><span class="nm"><b>${x.label.toUpperCase()}</b><span><s>${x.renew}</s> ${x.price}</span></span><span class="bx"><em>${x.off}</em><b>${x.price}</b><s>${x.renew}</s></span></button>`}).join('')}</div></div>
  <div class="csec"><div class="agree ${S.agree?'on':''} ${S.agErr?'bad':''}"><button class="cb" data-a="agree" role="checkbox" aria-checked="${S.agree}" aria-label="I agree to the terms">${S.agree?ic('check',16,'#1a0f1c',3):''}</button><span>I agree to the ${lnk('Terms and Conditions',CONFIG.legal.termsUrl)}, ${lnk('Privacy Policy',CONFIG.legal.privacyUrl)} and ${lnk('Refund Policy',CONFIG.legal.refundUrl)}</span></div>${S.agErr?'<p class="agerr" role="alert">Please accept the terms to continue.</p>':''}</div>
  <div class="csec"><div class="dscl" data-renew>${esc(disclose())}</div><p class="fair">"Endless chats": fair-use limit of ${CONFIG.fairUseCap} messages a day.</p></div>
  <div class="csec"><button class="btn gbtn" data-a="buy">GET MY PLAN</button></div>
  <div class="csec"><div class="trust"><div>${ic('shield',18,'#E5484D')} Pay safe &amp; secure</div><div class="pm"><span>Apple Pay</span><span>PayPal</span><span>Card</span></div><div>${ic('head',18)} 24/7 support</div><div class="pm"><span>VISA</span><span>AMEX</span><span style="color:#E86F2E">DISCOVER</span></div></div></div>
  <div class="cpfoot">ChatChi: AI Roleplay Chat · ${lnk(esc(CONFIG.legal.supportEmail),'mailto:'+CONFIG.legal.supportEmail)}<br>${lnk('Terms of Use',CONFIG.legal.termsUrl)} · ${lnk('Privacy Policy',CONFIG.legal.privacyUrl)}<br>${esc(cshort())} is an AI character. Fictional, and depicted as an adult. 18+ only.</div></div>`;
}
function paintPlan(){const r=cur();if(!r)return;const v=visPlan();
  r.querySelectorAll('.cplan').forEach(p=>{const on=p.dataset.v===v;p.classList.toggle('on',on);p.setAttribute('aria-pressed',on)});
  r.querySelectorAll('[data-today]').forEach(x=>x.textContent=PLANS[v].price);r.querySelectorAll('[data-renew]').forEach(x=>x.textContent=disclose())}
function bindPw(){if(!S.pwStart){S.pwStart=Date.now();persist()}if(!left())return;
  TICK=setInterval(()=>{const l=left(),r=cur();if(!r)return;if(!l){clearInterval(TICK);render();return}
    r.querySelectorAll('[data-timer]').forEach((x,j)=>x.textContent=j?mmss(l).replace(/ /g,''):mmss(l))},1000)}

/* ---------- purchase routing. Hard paywall: no free path; every decline ends back on the paywall. ---------- */
const PAYWALL=22;
let AFTER=25;   // where a purchase lands: 25 add-on upsell for subscribers, 26 get-app for the one-time add-on
const DECLINE=k=>{const n=(CONFIG.declineFlow||{})[k];return +Object.keys(SCREENS).find(i=>SCREENS[i]===n)||PAYWALL};
const otok=s=>esc(s).replace(/\{\{[^}]+\}\}/g,m=>`<span class="otk">${m}</span>`);
const UPSELL=25,GETAPP=26,CHAT=27,EMRE=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const BADGE={apple:'data:image/svg+xml;base64,PHN2ZyBpZD0ibGl2ZXR5cGUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjExOS42NjQwNyIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDExOS42NjQwNyA0MCI+CiAgPHRpdGxlPkRvd25sb2FkX29uX3RoZV9BcHBfU3RvcmVfQmFkZ2VfVVMtVUtfUkdCX2Jsa180U1ZHXzA5MjkxNzwvdGl0bGU+CiAgPGc+CiAgICA8Zz4KICAgICAgPGc+CiAgICAgICAgPHBhdGggZD0iTTExMC4xMzQ3NywwSDkuNTM0NjhjLS4zNjY3LDAtLjcyOSwwLTEuMDk0NzMuMDAyLS4zMDYxNS4wMDItLjYwOTg2LjAwNzgxLS45MTg5NS4wMTI3QTEzLjIxNDc2LDEzLjIxNDc2LDAsMCwwLDUuNTE3MS4xOTE0MWE2LjY2NTA5LDYuNjY1MDksMCwwLDAtMS45MDA4OC42MjdBNi40Mzc3OSw2LjQzNzc5LDAsMCwwLDEuOTk3NTcsMS45OTcwNyw2LjI1ODQ0LDYuMjU4NDQsMCwwLDAsLjgxOTM1LDMuNjE4MTZhNi42MDExOSw2LjYwMTE5LDAsMCwwLS42MjUsMS45MDMzMiwxMi45OTMsMTIuOTkzLDAsMCwwLS4xNzkyLDIuMDAyQy4wMDU4Nyw3LjgzMDA4LjAwNDg5LDguMTM3NywwLDguNDQ0MzRWMzEuNTU4NmMuMDA0ODkuMzEwNS4wMDU4Ny42MTEzLjAxNTE1LjkyMTlhMTIuOTkyMzIsMTIuOTkyMzIsMCwwLDAsLjE3OTIsMi4wMDE5LDYuNTg3NTYsNi41ODc1NiwwLDAsMCwuNjI1LDEuOTA0M0E2LjIwNzc4LDYuMjA3NzgsMCwwLDAsMS45OTc1NywzOC4wMDFhNi4yNzQ0NSw2LjI3NDQ1LDAsMCwwLDEuNjE4NjUsMS4xNzg3LDYuNzAwODIsNi43MDA4MiwwLDAsMCwxLjkwMDg4LjYzMDgsMTMuNDU1MTQsMTMuNDU1MTQsMCwwLDAsMi4wMDM5LjE3NjhjLjMwOTA5LjAwNjguNjEyOC4wMTA3LjkxODk1LjAxMDdDOC44MDU2Nyw0MCw5LjE2OCw0MCw5LjUzNDY4LDQwSDExMC4xMzQ3N2MuMzU5NCwwLC43MjQ2LDAsMS4wODQtLjAwMi4zMDQ3LDAsLjYxNzItLjAwMzkuOTIxOS0uMDEwN2ExMy4yNzksMTMuMjc5LDAsMCwwLDItLjE3NjgsNi44MDQzMiw2LjgwNDMyLDAsMCwwLDEuOTA4Mi0uNjMwOCw2LjI3NzQyLDYuMjc3NDIsMCwwLDAsMS42MTcyLTEuMTc4Nyw2LjM5NDgyLDYuMzk0ODIsMCwwLDAsMS4xODE2LTEuNjE0Myw2LjYwNDEzLDYuNjA0MTMsMCwwLDAsLjYxOTEtMS45MDQzLDEzLjUwNjQzLDEzLjUwNjQzLDAsMCwwLC4xODU2LTIuMDAxOWMuMDAzOS0uMzEwNi4wMDM5LS42MTE0LjAwMzktLjkyMTkuMDA3OC0uMzYzMy4wMDc4LS43MjQ2LjAwNzgtMS4wOTM4VjkuNTM2MTNjMC0uMzY2MjEsMC0uNzI5NDktLjAwNzgtMS4wOTE3OSwwLS4zMDY2NCwwLS42MTQyNi0uMDAzOS0uOTIwOWExMy41MDcxLDEzLjUwNzEsMCwwLDAtLjE4NTYtMi4wMDIsNi42MTc3LDYuNjE3NywwLDAsMC0uNjE5MS0xLjkwMzMyLDYuNDY2MTksNi40NjYxOSwwLDAsMC0yLjc5ODgtMi43OTk4LDYuNzY3NTQsNi43Njc1NCwwLDAsMC0xLjkwODItLjYyNywxMy4wNDM5NCwxMy4wNDM5NCwwLDAsMC0yLS4xNzY3NmMtLjMwNDctLjAwNDg4LS42MTcyLS4wMTA3NC0uOTIxOS0uMDEyNjktLjM1OTQtLjAwMi0uNzI0Ni0uMDAyLTEuMDg0LS4wMDJaIiBzdHlsZT0iZmlsbDogI2E2YTZhNiIvPgogICAgICAgIDxwYXRoIGQ9Ik04LjQ0NDgzLDM5LjEyNWMtLjMwNDY4LDAtLjYwMi0uMDAzOS0uOTA0MjktLjAxMDdhMTIuNjg3MTQsMTIuNjg3MTQsMCwwLDEtMS44NjkxNC0uMTYzMSw1Ljg4MzgxLDUuODgzODEsMCwwLDEtMS42NTY3NC0uNTQ3OSw1LjQwNTczLDUuNDA1NzMsMCwwLDEtMS4zOTctMS4wMTY2LDUuMzIwODIsNS4zMjA4MiwwLDAsMS0xLjAyMDUxLTEuMzk2NSw1LjcyMTg2LDUuNzIxODYsMCwwLDEtLjU0My0xLjY1NzIsMTIuNDEzNTEsMTIuNDEzNTEsMCwwLDEtLjE2NjUtMS44NzVjLS4wMDYzNC0uMjEwOS0uMDE0NjQtLjkxMzEtLjAxNDY0LS45MTMxVjguNDQ0MzRTLjg4MTg1LDcuNzUyOTMuODg3Nyw3LjU0OThhMTIuMzcwMzksMTIuMzcwMzksMCwwLDEsLjE2NTUzLTEuODcyMDcsNS43NTU1LDUuNzU1NSwwLDAsMSwuNTQzNDYtMS42NjIxQTUuMzczNDksNS4zNzM0OSwwLDAsMSwyLjYxMTgzLDIuNjE3NjgsNS41NjU0Myw1LjU2NTQzLDAsMCwxLDQuMDE0MTcsMS41OTUyMWE1LjgyMzA5LDUuODIzMDksMCwwLDEsMS42NTMzMi0uNTQzOTRBMTIuNTg1ODksMTIuNTg1ODksMCwwLDEsNy41NDMuODg3MjFMOC40NDUzMi44NzVIMTExLjIxMzg3bC45MTMxLjAxMjdhMTIuMzg0OTMsMTIuMzg0OTMsMCwwLDEsMS44NTg0LjE2MjU5LDUuOTM4MzMsNS45MzgzMywwLDAsMSwxLjY3MDkuNTQ3ODUsNS41OTM3NCw1LjU5Mzc0LDAsMCwxLDIuNDE1LDIuNDE5OTMsNS43NjI2Nyw1Ljc2MjY3LDAsMCwxLC41MzUyLDEuNjQ4OTIsMTIuOTk1LDEyLjk5NSwwLDAsMSwuMTczOCwxLjg4NzIxYy4wMDI5LjI4MzIuMDAyOS41ODc0LjAwMjkuODkwMTQuMDA3OS4zNzUuMDA3OS43MzE5My4wMDc5LDEuMDkxNzlWMzAuNDY0OGMwLC4zNjMzLDAsLjcxNzgtLjAwNzksMS4wNzUyLDAsLjMyNTIsMCwuNjIzMS0uMDAzOS45Mjk3YTEyLjczMTI2LDEyLjczMTI2LDAsMCwxLS4xNzA5LDEuODUzNSw1LjczOSw1LjczOSwwLDAsMS0uNTQsMS42Nyw1LjQ4MDI5LDUuNDgwMjksMCwwLDEtMS4wMTU2LDEuMzg1Nyw1LjQxMjksNS40MTI5LDAsMCwxLTEuMzk5NCwxLjAyMjUsNS44NjE2OCw1Ljg2MTY4LDAsMCwxLTEuNjY4LjU0OTgsMTIuNTQyMTgsMTIuNTQyMTgsMCwwLDEtMS44NjkyLjE2MzFjLS4yOTI5LjAwNjgtLjU5OTYuMDEwNy0uODk3NC4wMTA3bC0xLjA4NC4wMDJaIi8+CiAgICAgIDwvZz4KICAgICAgPGcgaWQ9Il9Hcm91cF8iIGRhdGEtbmFtZT0iJmx0O0dyb3VwJmd0OyI+CiAgICAgICAgPGcgaWQ9Il9Hcm91cF8yIiBkYXRhLW5hbWU9IiZsdDtHcm91cCZndDsiPgogICAgICAgICAgPGcgaWQ9Il9Hcm91cF8zIiBkYXRhLW5hbWU9IiZsdDtHcm91cCZndDsiPgogICAgICAgICAgICA8cGF0aCBpZD0iX1BhdGhfIiBkYXRhLW5hbWU9IiZsdDtQYXRoJmd0OyIgZD0iTTI0Ljc2ODg4LDIwLjMwMDY4YTQuOTQ4ODEsNC45NDg4MSwwLDAsMSwyLjM1NjU2LTQuMTUyMDYsNS4wNjU2Niw1LjA2NTY2LDAsMCwwLTMuOTkxMTYtMi4xNTc2OGMtMS42NzkyNC0uMTc2MjYtMy4zMDcxOSwxLjAwNDgzLTQuMTYyOSwxLjAwNDgzLS44NzIyNywwLTIuMTg5NzctLjk4NzMzLTMuNjA4NS0uOTU4MTRhNS4zMTUyOSw1LjMxNTI5LDAsMCwwLTQuNDcyOTIsMi43Mjc4N2MtMS45MzQsMy4zNDg0Mi0uNDkxNDEsOC4yNjk0NywxLjM2MTIsMTAuOTc2MDguOTI2OSwxLjMyNTM1LDIuMDEwMTgsMi44MDU4LDMuNDI3NjMsMi43NTMzLDEuMzg3MDYtLjA1NzUzLDEuOTA1MS0uODg0NDgsMy41Nzk0LS44ODQ0OCwxLjY1ODc2LDAsMi4xNDQ3OS44ODQ0OCwzLjU5MS44NTExLDEuNDg4MzgtLjAyNDE2LDIuNDI2MTMtMS4zMzEyNCwzLjMyMDUxLTIuNjY5MTRhMTAuOTYyLDEwLjk2MiwwLDAsMCwxLjUxODQyLTMuMDkyNTFBNC43ODIwNSw0Ljc4MjA1LDAsMCwxLDI0Ljc2ODg4LDIwLjMwMDY4WiIgc3R5bGU9ImZpbGw6ICNmZmYiLz4KICAgICAgICAgICAgPHBhdGggaWQ9Il9QYXRoXzIiIGRhdGEtbmFtZT0iJmx0O1BhdGgmZ3Q7IiBkPSJNMjIuMDM3MjUsMTIuMjEwODlhNC44NzI0OCw0Ljg3MjQ4LDAsMCwwLDEuMTE0NTItMy40OTA2Miw0Ljk1NzQ2LDQuOTU3NDYsMCwwLDAtMy4yMDc1OCwxLjY1OTYxLDQuNjM2MzQsNC42MzYzNCwwLDAsMC0xLjE0MzcxLDMuMzYxMzlBNC4wOTkwNSw0LjA5OTA1LDAsMCwwLDIyLjAzNzI1LDEyLjIxMDg5WiIgc3R5bGU9ImZpbGw6ICNmZmYiLz4KICAgICAgICAgIDwvZz4KICAgICAgICA8L2c+CiAgICAgICAgPGc+CiAgICAgICAgICA8cGF0aCBkPSJNNDIuMzAyMjcsMjcuMTM5NjVoLTQuNzMzNGwtMS4xMzY3MiwzLjM1NjQ1SDM0LjQyNzI3bDQuNDgzNC0xMi40MThoMi4wODNsNC40ODM0LDEyLjQxOEg0My40MzhaTTM4LjA1OTEsMjUuNTkwODJoMy43NTJsLTEuODQ5NjEtNS40NDcyN2gtLjA1MTc2WiIgc3R5bGU9ImZpbGw6ICNmZmYiLz4KICAgICAgICAgIDxwYXRoIGQ9Ik01NS4xNTk2OSwyNS45Njk3M2MwLDIuODEzNDgtMS41MDU4Niw0LjYyMTA5LTMuNzc4MzIsNC42MjEwOWEzLjA2OTMsMy4wNjkzLDAsMCwxLTIuODQ4NjMtMS41ODRoLS4wNDN2NC40ODQzOGgtMS44NTg0VjIxLjQ0MjM4SDQ4LjQzMDJ2MS41MDU4NmguMDM0MThhMy4yMTE2MiwzLjIxMTYyLDAsMCwxLDIuODgyODEtMS42MDA1OUM1My42NDUsMjEuMzQ3NjYsNTUuMTU5NjksMjMuMTY0MDYsNTUuMTU5NjksMjUuOTY5NzNabS0xLjkxMDE2LDBjMC0xLjgzMy0uOTQ3MjctMy4wMzgwOS0yLjM5MjU4LTMuMDM4MDktMS40MTk5MiwwLTIuMzc1LDEuMjMwNDctMi4zNzUsMy4wMzgwOSwwLDEuODI0MjIuOTU1MDgsMy4wNDU5LDIuMzc1LDMuMDQ1OUM1Mi4zMDIyNywyOS4wMTU2Myw1My4yNDk1MywyNy44MTkzNCw1My4yNDk1MywyNS45Njk3M1oiIHN0eWxlPSJmaWxsOiAjZmZmIi8+CiAgICAgICAgICA8cGF0aCBkPSJNNjUuMTI0NTMsMjUuOTY5NzNjMCwyLjgxMzQ4LTEuNTA1ODYsNC42MjEwOS0zLjc3ODMyLDQuNjIxMDlhMy4wNjkzLDMuMDY5MywwLDAsMS0yLjg0ODYzLTEuNTg0aC0uMDQzdjQuNDg0MzhoLTEuODU4NFYyMS40NDIzOEg1OC4zOTV2MS41MDU4NmguMDM0MThBMy4yMTE2MiwzLjIxMTYyLDAsMCwxLDYxLjMxMiwyMS4zNDc2NkM2My42MDk4OCwyMS4zNDc2Niw2NS4xMjQ1MywyMy4xNjQwNiw2NS4xMjQ1MywyNS45Njk3M1ptLTEuOTEwMTYsMGMwLTEuODMzLS45NDcyNy0zLjAzODA5LTIuMzkyNTgtMy4wMzgwOS0xLjQxOTkyLDAtMi4zNzUsMS4yMzA0Ny0yLjM3NSwzLjAzODA5LDAsMS44MjQyMi45NTUwOCwzLjA0NTksMi4zNzUsMy4wNDU5QzYyLjI2NzExLDI5LjAxNTYzLDYzLjIxNDM4LDI3LjgxOTM0LDYzLjIxNDM4LDI1Ljk2OTczWiIgc3R5bGU9ImZpbGw6ICNmZmYiLz4KICAgICAgICAgIDxwYXRoIGQ9Ik03MS43MTA0NywyNy4wMzYxM2MuMTM3NywxLjIzMTQ1LDEuMzM0LDIuMDQsMi45Njg3NSwyLjA0LDEuNTY2NDEsMCwyLjY5MzM2LS44MDg1OSwyLjY5MzM2LTEuOTE4OTUsMC0uOTYzODctLjY3OTY5LTEuNTQxLTIuMjg5MDYtMS45MzY1MmwtMS42MDkzNy0uMzg3N2MtMi4yODAyNy0uNTUwNzgtMy4zMzg4Ny0xLjYxNzE5LTMuMzM4ODctMy4zNDc2NiwwLTIuMTQyNTgsMS44NjcxOS0zLjYxNDI2LDQuNTE4NTUtMy42MTQyNiwyLjYyNCwwLDQuNDIyODUsMS40NzE2OCw0LjQ4MzQsMy42MTQyNmgtMS44NzZjLS4xMTIzLTEuMjM5MjYtMS4xMzY3Mi0xLjk4NzMtMi42MzM3OS0xLjk4NzNzLTIuNTIxNDguNzU2ODQtMi41MjE0OCwxLjg1ODRjMCwuODc3OTMuNjU0MywxLjM5NDUzLDIuMjU0ODgsMS43OWwxLjM2ODE2LjMzNTk0YzIuNTQ3ODUuNjAyNTQsMy42MDY0NSwxLjYyNiwzLjYwNjQ1LDMuNDQyMzgsMCwyLjMyMzI0LTEuODUwNTksMy43NzgzMi00Ljc5Mzk1LDMuNzc4MzItMi43NTM5MSwwLTQuNjEzMjgtMS40MjA5LTQuNzMzNC0zLjY2N1oiIHN0eWxlPSJmaWxsOiAjZmZmIi8+CiAgICAgICAgICA8cGF0aCBkPSJNODMuMzQ2MjEsMTkuMjk5OHYyLjE0MjU4aDEuNzIxNjh2MS40NzE2OEg4My4zNDYyMXY0Ljk5MTIxYzAsLjc3NTM5LjM0NDczLDEuMTM2NzIsMS4xMDE1NiwxLjEzNjcyYTUuODA3NTIsNS44MDc1MiwwLDAsMCwuNjExMzMtLjA0M3YxLjQ2Mjg5YTUuMTAzNTEsNS4xMDM1MSwwLDAsMS0xLjAzMjIzLjA4NTk0Yy0xLjgzMywwLTIuNTQ3ODUtLjY4ODQ4LTIuNTQ3ODUtMi40NDQzNFYyMi45MTQwNkg4MC4xNjI2MlYyMS40NDIzOEg4MS40NzlWMTkuMjk5OFoiIHN0eWxlPSJmaWxsOiAjZmZmIi8+CiAgICAgICAgICA8cGF0aCBkPSJNODYuMDY1LDI1Ljk2OTczYzAtMi44NDg2MywxLjY3NzczLTQuNjM4NjcsNC4yOTM5NS00LjYzODY3LDIuNjI1LDAsNC4yOTQ5MiwxLjc5LDQuMjk0OTIsNC42Mzg2NywwLDIuODU2NDUtMS42NjExMyw0LjYzODY3LTQuMjk0OTIsNC42Mzg2N0M4Ny43MjYwOSwzMC42MDg0LDg2LjA2NSwyOC44MjYxNyw4Ni4wNjUsMjUuOTY5NzNabTYuNjk1MzEsMGMwLTEuOTU0MS0uODk1NTEtMy4xMDc0Mi0yLjQwMTM3LTMuMTA3NDJzLTIuNDAwMzksMS4xNjIxMS0yLjQwMDM5LDMuMTA3NDJjMCwxLjk2MTkxLjg5NDUzLDMuMTA2NDUsMi40MDAzOSwzLjEwNjQ1UzkyLjc2MDI3LDI3LjkzMTY0LDkyLjc2MDI3LDI1Ljk2OTczWiIgc3R5bGU9ImZpbGw6ICNmZmYiLz4KICAgICAgICAgIDxwYXRoIGQ9Ik05Ni4xODYwNiwyMS40NDIzOGgxLjc3MjQ2djEuNTQxaC4wNDNhMi4xNTk0LDIuMTU5NCwwLDAsMSwyLjE3NzczLTEuNjM1NzQsMi44NjYxNiwyLjg2NjE2LDAsMCwxLC42MzY3Mi4wNjkzNHYxLjczODI4YTIuNTk3OTQsMi41OTc5NCwwLDAsMC0uODM1LS4xMTIzLDEuODcyNjQsMS44NzI2NCwwLDAsMC0xLjkzNjUyLDIuMDgzdjUuMzcwMTJoLTEuODU4NFoiIHN0eWxlPSJmaWxsOiAjZmZmIi8+CiAgICAgICAgICA8cGF0aCBkPSJNMTA5LjM4NDMsMjcuODM2OTFjLS4yNSwxLjY0MzU1LTEuODUwNTksMi43NzE0OC0zLjg5ODQ0LDIuNzcxNDgtMi42MzM3OSwwLTQuMjY4NTUtMS43NjQ2NS00LjI2ODU1LTQuNTk1NywwLTIuODM5ODQsMS42NDM1NS00LjY4MTY0LDQuMTkwNDMtNC42ODE2NCwyLjUwNDg4LDAsNC4wODAwOCwxLjcyMDcsNC4wODAwOCw0LjQ2NTgydi42MzY3MmgtNi4zOTQ1M3YuMTEyM2EyLjM1OCwyLjM1OCwwLDAsMCwyLjQzNTU1LDIuNTY0NDUsMi4wNDgzNCwyLjA0ODM0LDAsMCwwLDIuMDkwODItMS4yNzM0NFptLTYuMjgyMjMtMi43MDIxNWg0LjUyNjM3YTIuMTc3MywyLjE3NzMsMCwwLDAtMi4yMjA3LTIuMjk3ODVBMi4yOTIsMi4yOTIsMCwwLDAsMTAzLjEwMjA3LDI1LjEzNDc3WiIgc3R5bGU9ImZpbGw6ICNmZmYiLz4KICAgICAgICA8L2c+CiAgICAgIDwvZz4KICAgIDwvZz4KICAgIDxnIGlkPSJfR3JvdXBfNCIgZGF0YS1uYW1lPSImbHQ7R3JvdXAmZ3Q7Ij4KICAgICAgPGc+CiAgICAgICAgPHBhdGggZD0iTTM3LjgyNjE5LDguNzMxYTIuNjM5NjQsMi42Mzk2NCwwLDAsMSwyLjgwNzYyLDIuOTY0ODRjMCwxLjkwNjI1LTEuMDMwMjcsMy4wMDItMi44MDc2MiwzLjAwMkgzNS42NzA5MlY4LjczMVptLTEuMjI4NTIsNS4xMjNoMS4xMjVhMS44NzU4OCwxLjg3NTg4LDAsMCwwLDEuOTY3NzctMi4xNDYsMS44ODEsMS44ODEsMCwwLDAtMS45Njc3Ny0yLjEzMzc5aC0xLjEyNVoiIHN0eWxlPSJmaWxsOiAjZmZmIi8+CiAgICAgICAgPHBhdGggZD0iTTQxLjY4MDY4LDEyLjQ0NDM0YTIuMTMzMjMsMi4xMzMyMywwLDEsMSw0LjI0NzA3LDAsMi4xMzM1OCwyLjEzMzU4LDAsMSwxLTQuMjQ3MDcsMFptMy4zMzMsMGMwLS45NzYwNy0uNDM4NDgtMS41NDY4Ny0xLjIwOC0xLjU0Njg3LS43NzI0NiwwLTEuMjA3LjU3MDgtMS4yMDcsMS41NDY4OCwwLC45ODM4OS40MzQ1NywxLjU1MDI5LDEuMjA3LDEuNTUwMjlDNDQuNTc1MjIsMTMuOTk0NjMsNDUuMDEzNjksMTMuNDI0MzIsNDUuMDEzNjksMTIuNDQ0MzRaIiBzdHlsZT0iZmlsbDogI2ZmZiIvPgogICAgICAgIDxwYXRoIGQ9Ik01MS41NzMyNiwxNC42OTc3NWgtLjkyMTg3bC0uOTMwNjYtMy4zMTY0MWgtLjA3MDMxbC0uOTI2NzYsMy4zMTY0MWgtLjkxMzA5bC0xLjI0MTIxLTQuNTAyOTNoLjkwMTM3bC44MDY2NCwzLjQzNmguMDY2NDFsLjkyNTc4LTMuNDM2aC44NTI1NGwuOTI1NzgsMy40MzZoLjA3MDMxbC44MDI3My0zLjQzNmguODg4NjdaIiBzdHlsZT0iZmlsbDogI2ZmZiIvPgogICAgICAgIDxwYXRoIGQ9Ik01My44NTM1NCwxMC4xOTQ4Mkg1NC43MDl2LjcxNTMzaC4wNjY0MWExLjM0OCwxLjM0OCwwLDAsMSwxLjM0Mzc1LS44MDIyNSwxLjQ2NDU2LDEuNDY0NTYsMCwwLDEsMS41NTg1OSwxLjY3NDh2Mi45MTVoLS44ODg2N1YxMi4wMDU4NmMwLS43MjM2My0uMzE0NDUtMS4wODM1LS45NzE2OC0xLjA4MzVhMS4wMzI5NCwxLjAzMjk0LDAsMCwwLTEuMDc1MiwxLjE0MTExdjIuNjM0MjhoLS44ODg2N1oiIHN0eWxlPSJmaWxsOiAjZmZmIi8+CiAgICAgICAgPHBhdGggZD0iTTU5LjA5Mzc3LDguNDM3aC44ODg2N3Y2LjI2MDc0aC0uODg4NjdaIiBzdHlsZT0iZmlsbDogI2ZmZiIvPgogICAgICAgIDxwYXRoIGQ9Ik02MS4yMTc3OSwxMi40NDQzNGEyLjEzMzQ2LDIuMTMzNDYsMCwxLDEsNC4yNDc1NiwwLDIuMTMzOCwyLjEzMzgsMCwxLDEtNC4yNDc1NiwwWm0zLjMzMywwYzAtLjk3NjA3LS40Mzg0OC0xLjU0Njg3LTEuMjA4LTEuNTQ2ODctLjc3MjQ2LDAtMS4yMDcuNTcwOC0xLjIwNywxLjU0Njg4LDAsLjk4Mzg5LjQzNDU3LDEuNTUwMjksMS4yMDcsMS41NTAyOUM2NC4xMTIzMiwxMy45OTQ2Myw2NC41NTA4LDEzLjQyNDMyLDY0LjU1MDgsMTIuNDQ0MzRaIiBzdHlsZT0iZmlsbDogI2ZmZiIvPgogICAgICAgIDxwYXRoIGQ9Ik02Ni40MDA5LDEzLjQyNDMyYzAtLjgxMDU1LjYwMzUyLTEuMjc3ODMsMS42NzQ4LTEuMzQ0MjRsMS4yMTk3My0uMDcwMzF2LS4zODg2N2MwLS40NzU1OS0uMzE0NDUtLjc0NDE0LS45MjE4Ny0uNzQ0MTQtLjQ5NjA5LDAtLjgzOTg0LjE4MjEzLS45Mzg0OC41MDA0OWgtLjg2MDM1Yy4wOTA4Mi0uNzczNDQuODE4MzYtMS4yNjk1MywxLjgzOTg0LTEuMjY5NTMsMS4xMjg5MSwwLDEuNzY1NjMuNTYyLDEuNzY1NjMsMS41MTMxOHYzLjA3NjY2aC0uODU1NDd2LS42MzI4MWgtLjA3MDMxYTEuNTE1LDEuNTE1LDAsMCwxLTEuMzUyNTQuNzA3QTEuMzYwMjYsMS4zNjAyNiwwLDAsMSw2Ni40MDA5LDEzLjQyNDMyWm0yLjg5NDUzLS4zODQ3N3YtLjM3NjQ2bC0xLjA5OTYxLjA3MDMxYy0uNjIwMTIuMDQxNS0uOTAxMzcuMjUyNDQtLjkwMTM3LjY0OTQxLDAsLjQwNTI3LjM1MTU2LjY0MTExLjgzNS42NDExMUExLjA2MTUsMS4wNjE1LDAsMCwwLDY5LjI5NTQzLDEzLjAzOTU1WiIgc3R5bGU9ImZpbGw6ICNmZmYiLz4KICAgICAgICA8cGF0aCBkPSJNNzEuMzQ4MTYsMTIuNDQ0MzRjMC0xLjQyMjg1LjczMTQ1LTIuMzI0MjIsMS44NjkxNC0yLjMyNDIyYTEuNDg0LDEuNDg0LDAsMCwxLDEuMzgwODYuNzloLjA2NjQxVjguNDM3aC44ODg2N3Y2LjI2MDc0aC0uODUxNTZ2LS43MTE0M2gtLjA3MDMxYTEuNTYyODQsMS41NjI4NCwwLDAsMS0xLjQxNDA2Ljc4NTY0QzcyLjA3MTgsMTQuNzcyLDcxLjM0ODE2LDEzLjg3MDYxLDcxLjM0ODE2LDEyLjQ0NDM0Wm0uOTE4LDBjMCwuOTU1MDguNDUwMiwxLjUyOTc5LDEuMjAzMTMsMS41Mjk3OS43NDksMCwxLjIxMTkxLS41ODMsMS4yMTE5MS0xLjUyNTg4LDAtLjkzODQ4LS40Njc3Ny0xLjUyOTc5LTEuMjExOTEtMS41Mjk3OUM3Mi43MjEyMSwxMC45MTg0Niw3Mi4yNjYxMywxMS40OTcwNyw3Mi4yNjYxMywxMi40NDQzNFoiIHN0eWxlPSJmaWxsOiAjZmZmIi8+CiAgICAgICAgPHBhdGggZD0iTTc5LjIzLDEyLjQ0NDM0YTIuMTMzMjMsMi4xMzMyMywwLDEsMSw0LjI0NzA3LDAsMi4xMzM1OCwyLjEzMzU4LDAsMSwxLTQuMjQ3MDcsMFptMy4zMzMsMGMwLS45NzYwNy0uNDM4NDgtMS41NDY4Ny0xLjIwOC0xLjU0Njg3LS43NzI0NiwwLTEuMjA3LjU3MDgtMS4yMDcsMS41NDY4OCwwLC45ODM4OS40MzQ1NywxLjU1MDI5LDEuMjA3LDEuNTUwMjlDODIuMTI0NTMsMTMuOTk0NjMsODIuNTYzLDEzLjQyNDMyLDgyLjU2MywxMi40NDQzNFoiIHN0eWxlPSJmaWxsOiAjZmZmIi8+CiAgICAgICAgPHBhdGggZD0iTTg0LjY2OTQ1LDEwLjE5NDgyaC44NTU0N3YuNzE1MzNoLjA2NjQxYTEuMzQ4LDEuMzQ4LDAsMCwxLDEuMzQzNzUtLjgwMjI1LDEuNDY0NTYsMS40NjQ1NiwwLDAsMSwxLjU1ODU5LDEuNjc0OHYyLjkxNUg4Ny42MDVWMTIuMDA1ODZjMC0uNzIzNjMtLjMxNDQ1LTEuMDgzNS0uOTcxNjgtMS4wODM1YTEuMDMyOTQsMS4wMzI5NCwwLDAsMC0xLjA3NTIsMS4xNDExMXYyLjYzNDI4aC0uODg4NjdaIiBzdHlsZT0iZmlsbDogI2ZmZiIvPgogICAgICAgIDxwYXRoIGQ9Ik05My41MTUxNiw5LjA3MzczdjEuMTQxNmguOTc1NTl2Ljc0ODU0aC0uOTc1NTlWMTMuMjc5M2MwLC40NzE2OC4xOTQzNC42NzgyMi42MzY3Mi42NzgyMmEyLjk2NjU3LDIuOTY2NTcsMCwwLDAsLjMzODg3LS4wMjA1MXYuNzQwMjNhMi45MTU1LDIuOTE1NSwwLDAsMS0uNDgzNC4wNDU0MWMtLjk4ODI4LDAtMS4zODE4NC0uMzQ3NjYtMS4zODE4NC0xLjIxNTgydi0yLjU0M2gtLjcxNDg0di0uNzQ4NTRoLjcxNDg0VjkuMDczNzNaIiBzdHlsZT0iZmlsbDogI2ZmZiIvPgogICAgICAgIDxwYXRoIGQ9Ik05NS43MDQ2MSw4LjQzN2guODgwODZ2Mi40ODE0NWguMDcwMzFhMS4zODU2LDEuMzg1NiwwLDAsMSwxLjM3My0uODA2NjQsMS40ODMzOSwxLjQ4MzM5LDAsMCwxLDEuNTUwNzgsMS42Nzg3MXYyLjkwNzIzSDk4LjY5di0yLjY4OGMwLS43MTkyNC0uMzM1LTEuMDgzNS0uOTYyODktMS4wODM1YTEuMDUxOTQsMS4wNTE5NCwwLDAsMC0xLjEzMzc5LDEuMTQxNnYyLjYyOTg4aC0uODg4NjdaIiBzdHlsZT0iZmlsbDogI2ZmZiIvPgogICAgICAgIDxwYXRoIGQ9Ik0xMDQuNzYxMjUsMTMuNDgxOTNhMS44MjgsMS44MjgsMCwwLDEtMS45NTExNywxLjMwMjczQTIuMDQ1MzEsMi4wNDUzMSwwLDAsMSwxMDAuNzMsMTIuNDYwNDVhMi4wNzY4NSwyLjA3Njg1LDAsMCwxLDIuMDc2MTctMi4zNTI1NGMxLjI1MjkzLDAsMi4wMDg3OS44NTYsMi4wMDg3OSwyLjI3VjEyLjY4OGgtMy4xNzk2OXYuMDQ5OGExLjE5MDIsMS4xOTAyLDAsMCwwLDEuMTk5MjIsMS4yOSwxLjA3OTM0LDEuMDc5MzQsMCwwLDAsMS4wNzEyOS0uNTQ1OVptLTMuMTI2LTEuNDUxMTdoMi4yNzQ0MWExLjA4NjQ3LDEuMDg2NDcsMCwwLDAtMS4xMDg0LTEuMTY2NUExLjE1MTYyLDEuMTUxNjIsMCwwLDAsMTAxLjYzNTI3LDEyLjAzMDc2WiIgc3R5bGU9ImZpbGw6ICNmZmYiLz4KICAgICAgPC9nPgogICAgPC9nPgogIDwvZz4KPC9zdmc+Cg==',play:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAjQAAACoCAYAAAD3sHQSAAAvGUlEQVR42u2df3RUd5333+FnSMC5IYE85aHOTax0idJcGrQtfUomWOnBtWZSdM9ztiu5qZ59qm6bgT7VdY80k6JtEW0m9thFtjYzrK7dc2yZrD+qfVTuoFTLQrmJNlsrhTtCiRAgMwZCaAk8f7B3nAnJ3Dszd37cyft1DqfNJJl85/u9937f38/Pkrs8H0WmCIPlq+fOnftwaWlpXWlp6WIQQgghhCRhZGTk9fHx8T9dvHhxe+S68y9n+n6z0v3FJdFFv66urm5YunTp7IUfXMiVIYQQQkgq3Prf/3UPDg7ixIkTF06ePLlzqCriSefNSlKx0AiD5aurq6t/tGzZMmHhQooYQgghhFjL2bNn0d/f/0a47MSNWRE0ztElv7/llluWzZs3j7NNCCGEkKwLm/379wdPLjzbYomgEQbLV69YseJXtbW1JZN9//Tp0xgYGEA4HEY4HAYADA0NYWhoiKtBCCGEkAScTifKy8tj/19XV4fly5ejrKxs0p8/ePDghePHj99pFGeTVNAsOi34br311vbJ3Et79+7F3r17MTAwwNUhhBBCSEasWrUK69evx/Lly6/53uDgIPbv3397MlEzpaBZdFrwNTU1tU90MR08eBC7du2iBYYQQgghllNXV4dPfvKTcDqdmOiC+s1vftM9VdDwzBtuXWZKzIyOjuLb3/42nnvuOYyOjnLGCSGEEGI5Q0ND+PnPfx4TNzrz5s3D/Pnzbz3z+6H/N7bgnWMwstAIg+Wr77jjjn3xbqbR0VFs3bo1FiNDCCGEEIIcWGs2b96cEF8zODiIl47tuSaud8bEF1asWPErihlCCCGE5JuBgQFs3bo1wTN03XXX4f0zbxxNKmico0t+H5/NRDFDCCGEkHwSDoexY8eOhNcaGhrmVZ9duHtSQSMMlq++5ZZbEgJqdu3aRTFDCCGEkLxy4MABPP/88wmvLVu2rHlSQVNdXf2j+CDggwcPYu/evZxFQgghhOSd559/HqdPn459XVtbWxJvpZkRp3QETLDOEEIIIYQUChNdT/FWmhnA1UaT8YHAe/fuZZ0ZQgghhKDQgoTjQ2Fqa2tLFp5c8NmYoKmurm7AhCrAhBBCCCGFxosvvpjwdUVFxZdigmbp0qWzMaE3EyGEEEIICjBAOJ7KyspqAJghDJavjnc3UcwQQgghpFAZHR1NcDuJojgDAGbMnTv3YUzI9yaEEEIIKVT+67/+C/EtEYTB8tUzSktL6yhoCCGEEGIXzp8/n/D13LlzH55RWlq6mFNDCCGEENjQQoOpejkRQgghhNgNChpCCCGEUNAQQgghhFDQEEIIIYRQ0BBCCCGEgoYQQgghhIKGEEIIIYSChhBCCCEkI2ZxCkixIooiRFEEAEiSBFVVAQCqqiISiaT0Xl6vN+1xKIoCRVEAAC6XCy6XK+PPFv+eZpBlOTYXEz9PvsZkhCRJEAQh9k/TtNjfSYeJa6hpGvx+f9pz6Pf7Y2MihFDQWMbcRWUQPrAEcxaVo8zpAACMj76DUS2K0XAEkf88wdWeBrhcLjz00ENoaGjArFmzsGjRomt+5tixY5g1axZ27txpelP6+7//e1x33XVpjamioiK2Cbe0tODBBx+05LOmsrFv2bIFtbW1AICRkZGEzT1fY5pq/b7yla+gpqYGc+bMQWVlZcL3L168iLNnz2J8fBxbtmxBMBg0LU4nruHw8DA0TTM95i9+8YtYtmxZbA4VRaGgIYSCxjqEDyzBko/XxUTMNd9ftSQmbk7++DBOvvgHjJ9/hytfhNaY3t5eXH/99aioqEj6s9dffz0AoKOjAw899BC+//3vY9OmTUk3xgsXLhTNXF26dKngxiRJEr773e+iurr6GhEzoV9LTJT09PTgySefxH333YdgMGj4NyauYUVFBf71X/81dj3YfQ4JAWNo7MnM8tm48ZE1uOGh26YUMwk/XzYbSz6+HDc9tR7VH7mBK19EyLKMAwcO4KabbjIUMxOZP38+ZFnGvn37IEkSJzNP67dnzx7U1dUlFTOYwvrV09ODH/zgBxAEIeW/XVVVhSeeeIKLQAhoockLZaKAGx9Zg5lls1MXQmWzcf3GelR/5L04+vQBjAwM8SqwMZ/73Ofw+OOPY8GCBQmvDw0N4dKlS9i5c2fC6w0NDWhoaMD8+fMTfqeurg4/+9nPUFVVZfg3h4eHcc8995geY7xboqurC7t375705x544IGE933hhRfw1FNPGb5npuRzTP/2b/+GdevWXSNGzpw5gzNnzuB73/seACASiUAQBNx2221YsWIFKioqUFpaCgAQBAFr167FwYMH0dDQkFJ8VGlpKT796U9jx44ddB8RQkGDnMfKpCtm4plTdfV9IgdO4FigDxeHRnk12PBkv337dsybNy9BbOzbtw8PPPBA0g1KlmVs3boVS5cuBQCcO3cOd955J7IdK6Jp2pTjamlpSfj6+PHjlgbZFtqYPve5z2HdunUJVplIJIJgMIjOzk7D9XvyySdjFrmysjLU1tYiGAyaCnAeGxuLCaLKykr09vaivr6eNxUhoMspZ7zn/67OWMxgQozNiqfWY8nH6zCzfDavCNgnZmbbtm0JYubcuXO47777cPfddxuetv1+P1asWIEf/vCHGBsbwx133BHLgiLIScxMZ2dngpgZHh5GS0sL2traTK1fbW0tjhw5kvD6zTffjH/6p3+CGSvbmTNn/vJcec974Ha7uTCEUNDkhqpGp6l4mXTQ42uqGp28KmxAb28vFi9enHCyv+OOO0wFh8b/zt13343ly5dTzOSYQCCQIGZOnTqFtWvXpmT9iUQiaGhoQDgcjr22YMECtLe3m4qneeaZZzA2NgYAKC8vx7PPPptWHA4hhIImddHxibqsvv/MstkQP7MKNz6yBgvqFvHqQOFaZ+IzU6LRKLZv3562KGHsBHJunYlfv5GRETz++ONprV8kEoHL5cKpU6diry1evBj/+I//mPT3Zs2ahSeeeAKnT59GfIBxV1cXF4gQChpkPT17TlVZTv7WgrpFuPGRNaj5zCq6oQqQL3zhCwnZTJcuXcJjjz3GibEJ7e3tCev39ttvw+fzIZMYoJ6enoTXNm7caChoIpEIPvnJT2J4eDj2enNzsyVFBgkhFDRTUvVX63P+Nysbnbjpv+NrSOGwbt26hK+ffPJJToqNuOuuu2L/Pzo6asn67dixAydO/KV45pUrVxKq+iJJcPfBgwcxsTYNIQTMcsoW75r7Ccx56wLe/p/fyenf1evXVLmc+GOgjxWHC4D58+cjPr33xz/+cc7HYLYVgtXtAFBkhf0uXLhgyfppmpYQIL5w4UKIomjKnfiJT3wC4XAY73rXuxJq0xi5rQghFDRpUVrxbpSOvRt4CzkXNcDVNO8bHroNIwND0P75ANO880hJSQni3RVmYi9S7cWUrM9PRUUFOjo6kKt2AMWGni6dyvqZYXBwMObKKi0thcvlMjX3kUgE27Ztw+c//3k4HA7WpiGEgibLD0Hh3Vf/O/bhvIka4Gp8zYqn1uPki4dx4vsDbKOQj4t2VuqX7ebNm68pvpeMU6dOpdS4kGR3/ZBGO4J44WTEY489hnvvvRcOh4O1aQgBY2hyJ27GPox5pz6d1zFUr7+BbRRgn15Eqf7O+Pg4J9pmvaQmCiU9Jdss9957b0KVYdamIYQWmpwwe+QOAMCFxc/kbQx6G4XKRhHHAn1so5Ajrly5Evv/OXPmQJIkQ7dFfHxFpqTS+oAuC0xapTfV9TNDfCftsbGxlF19qqoiGAzib/7mb1BWVharTaMoSkrtFAghFDS2FDUAUOZ0sI1CDjl37lysqF5lZSU+8pGPGG6I69cnz5ITBAE7d+7EokVX6w/NnDkTjIvJvstp3rx5ptYPJmoTXbhwIRZDc/bs2bTE5KZNm3DXXXehrKwsoTZNW1sbF44Q0OWUdVGTb/cT2yjklpdeegkT42NgMttoqn+CICTE2PBEnj1++tOf/uUwUFZmav2MuP/++7FkyRLEB46nI2gikQg++9nPJqw/a9MQQkEzLUUNcLWNwvu23ck2Clli27ZtCcXQZs2aZap/j9HJPD6I9Be/+AUnOkt0d3cnrN+cOXPg8XiQiXVmogVl165dab9fMBhEX18fJtamyVbsDyGEgqagRc2cqrJYG4Uykf1hYHF36GPHjsW+djgcePjhhyFJUlrv5/F44HQ6E2Jktm3bxonOEqqqJqzfggUL8MUvfjGt9RMEAYqiJPT1OnPmDHbs2IFMO7nHt1OoqqpCXR0LbBJCQTNNRY2e5l33xIfYRsFimpubEzYcQRDwy1/+MuWsFFmW8eijj8bSdQGgv7+fwbxZprW1NaHb9eLFi/GLX/wiJdeOIAg4ePBgghiNRqN45plnMl4/TdPQ3d2NaDQK4GoK+Pnz57lwhFDQTG9RA7CNArJgpfnCF76ACxcuIL6C8LPPPosf/OAHhmXvRVGEoijo6upKiJ0ZHh6GLMucYGTfStPR0ZEQq1JRUYHdu3ejp6fHcP1kWcaRI0dQW1ub8Pqbb75pWYXfxx57LGF85eXlXDhCwCynaZn9hCRtFI4+fYBp3hni9/tRXl6Oxx9/PCZKKioq8NGPfhS33HILLl26hJ07dyb8TnV1NZqbmzFr1qxYRhPisqfWrl1r6nSfSuVhtj+YnG9+85u4/fbbsW7dOlRWVgK4anWRZRl33303zpw5g+9973sJv/PhD38YNTU1qKiouKZw3pEjR/ChD33I0jG63W7s2bMHgkC3MSEUNBQ1mCy+5sZH1rCNgkWb4vnz5/G1r30ttikCiIkVsy0KhoeHsXbtWlPpw6m2PqioqKCgmYK//du/hSzL6OrqShANlZWVqKysNDXP58+fx4EDB+B2uy3PTptYm4YQArqc6H7ClG0Urm+tZ3wNMrPUrFq1Cv39/QnZM2YYGhrCD3/4Q9TW1lrWU4ikvn5NTU0YGBhIiKsxK0T/4R/+AS6XK2up9ps2bcLFixe5UIRQ0FDUwGQbBaZ5I6OYmvr6etxzzz144YUXMDw8jBMnTkzZxHBwcBA7duzABz/4Qdx9992Gm6FesK0YsLJqMiy0hLzvfe/Dxz/+cbz00ksYHBycVNxcvHgRg4ODOH78ONra2lBbW2u651b8GqYyB5FIBPfddx9GRkYKeg4JAV1OxU8hu58QF18jfmYVFn/kvWyjkAHx8SqiKMaCSwVBiIkWVVVTPs2bbXWQSfuDrq4u7N69OyttEzZs2JBWHEg2x2S0fpIkQRCEhLXLpEpzJmsYDAbxsY997BoRRgihoKGoQfI2CmdCYZz4/gDja5CZ1caqDTgXMTBWjncyC0ihjSlbY87WGjIOihAKGooapJfmLXxgCU7++DBOvvgHjJ9/h1crIYQQgmkaQ2PHmBpMSPN+37Y7IXxgCa9WQgghhILGnqIGuJrmfcNDt7GNAiGEEEJBY29RA7CNAiGEEEJBUySiBgCqb1+Cl7/zLjy4YQavYEIIIWS6Cxpbup/G38GzVftw84Iovv6ZGTj83VlorC/hlUwIIYSChqLGHqJm7uV38EzlPrx3VjT2mrMa+NnXZ+L5R2fC+T8obAghhFDQUNQUsKiZd+Ud/MvCRDETz8dWl+Dwd2bikY0zIMznehJCCKGgoagpQDHzrYqpxUw8WzZedUNtvItLSwghhIKGoqZAKC8xL2Z0HOXAtx+egZ8/OZPxNYQQQihoKGryL2b+2ZGamIlnzU0l+NnXZ+Lbn59JNxQhhBAKGoqa3DM/QzETz8Z1JTj83Vl4ZCOXmxBCCAUNRU0OxczTFokZxLmh9Pia5tvphiKEEEJBQ1FjMzETj7Ma+H7nTPz8SaZ5E0IIAbtts0u3/cQMJsTXHP7OTDz1wmU8uusyIue4zqIoQhRFCIIASZJir2uaBk3TAACKonCiCCGEgoaiphDETDwP3DMDG++agUd3XcY3nr88rdbU5XLB7XZDkiQ0Njaa/r1wOAxFUaAoCoLBICKRCG8QQgihoKGoyZeYQVx8zdc/MwOt60qw+enLCPVdQTFbYbxeL9xuNxwOR1rv4XQ60draitbWVvT09KC3txd+vx/BYJA3CbnmepNlecrva5oGv99fdJ/b6/Va/p6apkFVVaiqmvXx+f3+mFWWUNBQ1NhEzMRz03uupnk/9cJlbH76ctFZY7xeb0qWGLM0NzejubkZ4XAYHo+HwoYkCJqOjo4pvx8KhYpS0CT7zJkSjUZj1tF0585ofIqiUNCAQcEMFLapmMEEN9S3Pz+zaDaUYDCIPXv2ZEXMYILlZvfu3VAUBaIo8kYhJAs4HA40Nzejp6cHmqYltYARChqSA1FTqGIGcbVr7C5qPB4PVFVFc3NzTv9uY2MjVFWFx+PhjUJIlg8RPT09UFU1IZCfUNCQHImaQhcz8aLGjjVrBEFAMBhEV1dX2nEyVpwiu7q64Pf7IQgCbxZCskh9fT0OHTpEaw0FDcmlqLGLmNH5+mdn2k7MKIqSc6vMVLS2tkJRFIoaQnJAT08PRQ0YFExyEChsNzEDXC3Et/GuGdj108IPEpYkCYqipG2VCYVCUFUVkUgkVnsmviaNy+WCJEkpv399fT1cLheDhQnJkagBUJTB1oSCpiBEjR3FjE7z7SXY9VMUfPBvOmJGT7lWFGXKejIThYgkSZBlGbIsm/p7bW1tFDOE5FjUWJXiTUCXE91PxSFmAOBjq0tsETOTipgJBAKoqamB2+1OuTieHvAriiI6OzsRjUaTihmeFAlJpKmpCSUlJab/VVRUoKWlBYFAwPTf4H1HQUMsFjWlKLG1mNGpf0/hippgMIj6+npTP9vX14eVK1dCluWM60xEIhF4vV6Iooje3l6KGUKyRCQSQTAYhCzLqKmpQV9fnylXL+NpKGiIRaKm5PI8bCk9ZnsxAwDCfBRsarbZ+jKBQACSJFluho5EInC73Whra6OYISTLaJoGSZJMWWuyUbGYUNBMOxzDN8PXP4y18w9yMpC9IOCuri5TP9vW1pb105rf78fKlSspZgjJAbIsG1pqnE4n69NQ0JBMKLt0Ho+86sF7//MUzv/IWRSfqRC7cft8PtNiJlcCQ1VVihlCcihqrPgZQkFDkogZ8dxhAMDb/QuLQtT0vVlYDSvdbrcpV1N3dzcFBiFFiqqqhq4nWmgoaIgFYkbH7qKm/80rtrTOhEIhth8gpMgxKomQ7R5uhIJm2oiZYhA1gZeuFFznbKfTadiRl6ZmQoofRVE4CYSCJldixs6iJnoeBVcl2IzVxefzZZyWTQiBLVK6CaGgyaGYsauo+cbzlwsqIFgQBMM+TdFo1HTAMCGEELD1AcVMamImXtQAQPlfhwv68+3tv4JHd10uuGBgmEifni6nNlEUYz2mJgt+jEQiUFUViqLk3DQvSRJcLhdEUZx0bJqmxcaWyxL1giDE5szlcmEyF4aqqrZoV6F/BkmSIIqirT9LJnNQiPeiIAixgp/RaDTWJy5f9yMFDbFczNhF1PS/eQUbHhkvuHFNtgEhzXRuuyIIAtxuNzwej6kKyc3Nzejo6EA0GkUwGITP58uagBAEAR6PB7IsG8Y5NTY2orW1FQAQDodjY8uWq1AURXi9Xrjd7qRtMvQgUt3S5/P5YgI52Sakt8TIxfqnMsf6Z/H7/UXpijV6JoTD4aynjsuynDT42OFwxL4/8X70er1J18Tj8Rge5KyofG4mHkkvIkpBQzFjG1Gzt/+qmCnE2jNGD6++vr6ijp3xeDzwer1pdRR3OBxobW1Fa2srQqGQZQ/B+E3W4/GkNTan04n29na0t7cjEAjA4/FYZmUTBAE+ny8mnlKZr46Ojph4CAaDec+Y8Xq9ac2xw+FAe3s7ZFmGz+crqgq6RiIyW+JdkiT4/X7TbVeS3Y/d3d3wer2TXvOKohgWEJVlOeM1NRJlAFLqpQXG0EwfMVOIMTXR88DWXZfxoc2FKWb0jW86ZjyIoghVVdHV1ZWWYJjs5H706FFLLAp6O4mOjg5Lxtba2gpN0yw5CbrdbmialrKYmbjx7N69O69Zc/r6ZzrHukhTVRWCINj+vvB6vYbPhGy422RZxqFDh9IWMxNpb2+HqqqTus9UVUUoFMp68UAz71HoQpiCJo9ippBEza6XruCGey8VXMxMqu6mYhQ0umCw6uEZT1dXF/x+f9qbm/5gN9pU0hURmTxAPR4Pdu/ebYnIAoCenp6iWf/6+nooijJp3A1s5Grq6OhApnVqkEYNrGxcC06nE4qiTCpqjIqDOp3OjA4AoigaWmdCoVDBW7/pcsqzmMm3+2lv/xVs/ublgqsEjAJI4XS5XKZElBWnzGRjCAaDlm3KU1lEpgoqNhIz2d7kOzo6IIpiyidQn8+H9vb2ohCziqJkZf3r6+sRDAbhcrlsF0TvdrtNVQAPBAKWfjZZlrN6XTkcDiiKApfLleAq8/v9htYo3S2arVIYdnBTUtAUgJjJh6gJnwQeenocvfuuFE3wn9UWGrMnQFgQiDfZuCVJyrqYid/c/H6/aeGQCzETL7hUVTUd7J3tTQc5DP7O9vrHixrYxPXq9XpNuxCt3IRFUcxJwoHD4YDf77/mgOHz+ZLG0jQ3N0MUxbSsKEb3fTgctoX1m4KmQMRMrkRN9PzV2jLfeOFywcbJkPQ2s97e3oRTnZ6ebNZVYVY4pPpgj0aj16Rm6ymuZl1VXV1dsXRXI4tGKkJLf1DHbwIul6sgyuX7/X7T86NniamqCk3TYmvvdrtNZUJ5vd6cnsBlWU5JRKV6LQNX+7hZ6SJJJRg/FArFrlVN0yCKIkRRNMywixeasiwnWKF0K02y39cD81NdC6Mx2SWInIKmgMRMtkXNrpeu1pUJ/+kKF7fATp3pBDtOlVo82Sbv8/lMbdJerxfBYDDpRuD3+009lMPhMLxeb1LXgNvthtfrNbVR6afWZC4Es41IQ6EQvF7vlAJJz9rKhYUOU1gHjQpI6uvv8Xgm/dzBYDCWoeXz+Qw3Qr/fn7MYiUyCtM3Q19dneQq9qqqGIry3txcejyfpPJpZD/1ejF/XSCSCYDCYdO5kWU5L0BhdY3apY8Sg4AITM9kIFN7bfwV3PjSOT311nGLGBoJGFEVTLpO+vr6YCT7ZJq8/iNva2mDG3J3sNGYmtRO4Grugp7XCIGBTkiR0dnbCTNBksoe1LMumhFFnZydcLldSa08kEoHX68XKlSsRjUaRj+wds+tvNMd+vx8ulyvp5zBadzsRDoez4kLz+XwQRREtLS3o7e295vttbW2xrDqj9RBFEX19fSkH+hqtkcPhSCnezEwwsJ0KlVLQFKCYsUrURM8Dn9p+NQ071Gd/IWPm9GjnrI1UN7NUgzn9fj9Wrlxp6vQ81TyaOf0FAgHIspzS2LxerynBlezvm5m3tra2lDZuXQzmUtSYcXmluv5miv4lW3e7kM59gTS6e7vdbtTU1KC7uxvRaBS9vb2mrYO6YHa5XIZF/yYKM03TJhVT6aZwm+2LB/ZyopjJp6jZuusybrj3UsE1lqSggWGsgJE5Xj+BpvPQVlUVmzZtSutBJ0mSoQVEL9iHNGNGjAp3TXUCNRMrEggEUtp04ucslzVozLgAUll/3VJmJrYoF5WOs0Vvby9cLlfO3GaapsHj8aSVhaeLGqP5nizz0EhgNDY2mn4OGqV6BwIBWxUqpaApYDGTjqj5j5ev4Ia/G8eju4ov6NfMjWWXbI2pPpeZWhKpWj8meyAaFeqabBxmHtqZbvwej8fQGpLO2PRYk0xO5UZzhhz1KzNyMcbPiaqqOHTokOmYlXwWD0QGLqaWlha43e68uEYikUjs7+qBv3qQtZ7BqAf0yrKcIFKCwWDS630yS52iKIbuKjNWSDOHgHQOAGBQMMVMpoHC/W9eweanLxeFaykTQWNlozqr0hTdbndSy8bEDBsYmNStGJdRkLDT6YwVdDM7NitOc5FIBD6fL2kw7mTjMBpbsqBpq+YMFtWdSRYsqvdkQhILpR4InG57jInrXshCRg9iz2eMh26hSdZba+J1E9+7TFXVlK8ro+J+brcbgiAknRcj8WrVs4aChmJmSlEzNn4ZlR87lhAn8+iuy/jG85enxVqFQqGkN39zc7PhjZxpfRhkoX6OWUFm1YkpGAwiHA4nPaFN3NiM3E1Wjc3v9ycVNBM3XSMRYNXY9NN0NuvCGLkKFEWZ9Np2u92QZdlUZtRU4sDn8xV0AGg4HIamaVAUJZaiDhvVxJmqd1k68Vl6o9GprkWHw5G0+KAoiobXih2b/M6gmLGHmIkt2GtVOPMf1wMAnnrhapzMdBEzZsuYF1o3WCOREi+ajESDlScmo/eK31xzWdRQ0zRDk3p8qwYjEWBlw9Jsn1iNrpWJdYb0Ts27d+9OS8z09vaipaUlVlsoV2KmqakJJSUlKf3Taxd5vd68ixndnWdF+nm6AtlIcBhlBBqJR7u5m6a9oLGbmNH5za/mYs3fzcHmp6dfcTwzG0ohxQEYWQ/isxzM9FOy8kFutMmnEmBtdXyJ0djiBZaRCLAyqDHfG6medeX3+zE8PIyOjo6U+2hFo1F0d3ejpqYGbrfbNjVGCgXd3ZOLCt6ZCJr6+vop7w2jZ6Qdxcy0FjR2FDPHx95Ga/9huF99Hb/+0+i0XDdVVQ1THRsbGwsmONjowREv0KyM/8m1oMnGOheLCIGFLiefz4c9e/akZRkIhUJoa2uLFQ20U/YKCqikQqG01YhEIoZZgZNZacwEA9vR3TRtBY3dxMyfL41j+9ETuHlfH14cGuYJycTNVig3pJH7qxi7g5PskY41JhAIYOXKlTHLDkFB93azsmZVa2vrNZZfo0OW1Q09KWgoZmL8++BpNOzrw/Yjb/GJgr+YQ40C6err6/NeUyNZ1gMmiQnKtSXByBqQzxO8ldYqO9UmsmrOw+EwNm3aFMvAsZOVCjYueBk/91PFCTU1NWHTpk2GcWJmrxcjd2+8gCnWYOBpKWjsJGZeHh5By6uv44GBo4heGufTBNem9sJEQ8Ncu3EQFw9jNMbe3t6Ek5CZU1EuN/pUNler05mNxha/QRuNczqJo0AggKamppwH+RY7kiQZXuPRaDQmIn0+35TWV0VR4PP5IEkSmpqaDF3osDA42MhiHAqFbC1+Z1DMoODiZB4cOAr3q69j3/AInyRJbmIz6Y6KopgKtkUWrEhGQYOTBWOmWgodWUwnjxcKZlxjVgkHURQNs73ix2YkaOrr6y27BrIdm5XOZhIOh9HZ2YmamhrIskw3JnLvOtZ/JlXrhhXPJ70EA5K4KfXr1shqbWfrzLQRNHYQM3qcTNMrv8Nzg6f5BIGxlcaMCdjhcORc1Pj9fkOz7lRpkUabkVUZXGYCAydurkYmcqtcfGY+Y/zYzGzgVqTyG3VazrWgCYVCsZRrPX2bIGvxMzCwjKUjJF0ulyXZUkbPQo/HY3j96sX+KGgoZjLiJ0MRNL3yGrYfeYvuJVhbwl8/oauqmhP3k9/vN5WBMtUDyOihWF9fb4mVwEh8hMPhazZXo7FZ0dxQz8CBgavOzGvpxD/ku8+RpmmGVrpoNIqamhq4XK60NyBRFPNiucQ0ro+VzQOKUQuF5uZmw3vA7taZohc08wpczLx2bhQtr76Ojf1/wLGxi3wqpPlAMON6cjqdUBQla5uSIAhQFMWUmAmFQlNmm5h5MPr9/ow2I4/HYxgPMNk4zGTIZJpFk6z6abKxGc2b0+nMSNS4XK60q/BavTnqlZIzuVb1Srt27H2GArUYp3NNWVGYT//7RvdesnveqKUGBU0BiJmOAhUzf740jgcHjqLpldcYJ2PBidbsKcfhcKCrqwuKolga3CnLMjRNMxUYa9Qk0UxtCafTmfaJUJIkdHV1pRVoaLYGULoPRlmWDR/wUz14zWS+dXR0pHUiliQpp6Z4Mydlv9+ftqjx+/2or6+H0+nEnj174PP5aK1BbrPysnFNZWJhyXc/LAoam4qZ7UdPoGFfH+NkLD7RtrW1IZWMnKNHj8Lv96d9QhUEISZkUqka6vF4DOMkzFgSGhsboapqShuR2YDRZE0mzYyttbU1ZSuS1+tN2mzPzEPbzAO9p6cnJSudJElQFCWnVWE1TTMUtXpsWCobqW5FnGhpam9vp7Umw3R6r9dr+nrP1jVl5rrJpkuWgmYaiZmXh0fQsK+fcTLIXuxKKqJG33j37NkDTdPg9/shy/KUG4QgCHC5XPB4PAgGgxgeHkZPT09KQaLd3d2mrBeapqG7uxtmYoN0C1Wyh6koiggGg6aEVzQaTfpw8/v9puKWWltboaqqoUXE5XJBURRTBcv0BorJHspmUmB1K12yDVzvk5RrMRP/WYwsTrqoMbOZGlkR4601BCnHtjkcDkNRqF9Thw4dyto1lY51tLe3t2gCyksefPDB4VtvvTV2N3z5y1/GwMBAwQ107VeMmxbNfeccOg9tKigxc3zsbTwwcISuJeQupsbMSR95qA+SirtDEASoqmpaMEWjUSiKAlVVoWlaLOjT5XIZpkDHs2nTJsNNLdUTZjgchqIo0DQtFpwtCIKpTCtMaGhotLG4XC7s2bPH9Hv29fXFOljr8yZJUlrZJ6FQ6JoNzWg8k/0O4qx5ZtyD8RuTqqqIRCKIRCJpfZZUr9OpuHLlSsZrmU1SHZ8gCNA0zdQ86tlC8S4cSZLSjsEqKSlJWXylUhcq32uRLnV1dfjSl74U+/onP/lJcFaxbGSFJmb+fGkc24+8hW8dO0mVkWNLjR4gl+/mcfGWmVSDkSORCNxut2nh4HA40NzcnFHgaiAQMHVCV1UVHo/HtHB0Op0ZBz92dnaaeugqioLOzk7TJerr6+tTEnzIcRZfKsHIma5/X19f3qtro8CLeZq5rpxOZ177Pfn9ftOCRj9sFAszKGasZ+exk2jY10cxg/zF1LhcLktKi2dCNBpFW1tb2puEGZeNVaS6maXj4stEaKXi4/d6vWnHEqAALY65uI77+vrgcrlYWdhAYGZa1TdXgsbsOIsldqZoBE0hiZmXh0ewdv9r+NIbf2ScDPLflVuSJHR2dubl7+sbRKapkMFgEE1NTaZS0zMRDOlsZrkQNd3d3WmJOlmWi0LURCIRuFwuU3FLFDPZXwu3223pvdjb25uVtTXz3IlGo7YvpFdUgmZOgYiZ42Nvo7X/MNyvvo7fjYzyzkdhNZSrqanJ2eYWjUbR2dkJSZIs64miZ7Nk46Te2dkJWZbT3sz8fr8l/Wgmm8eWlpaMXCCyLKOtrc2yDShXFqmpRI2ZQPFcidnpfFByuVyWXFN9fX1Zs8CaaQ1TjL2+bCtoZr9zDo/mWczo7Qpu3teHF4eGebejsGvV6MImG9YOXcjoZeiz8RkkScKmTZssGX8oFMLKlSstGasuuKyyhgUCgVhmlhUnVUmSMjoF6+Iq34XHPB4PmpqaLDnRh8NhNDU1ZSRmp7OoEUXRsDq1kWUmm0JSEATD2LtiKKQ3kVl2FTNb8yxm/n3wNF1LNhU2eoaN2+3OKIhSN9nq/5AjP76eYi7LcsoBrYFAAH6/3/JAQL23VvzYUslg0gvm+Xw+y1NINU2Dy+WKpd2bXXN9fT0eT9obTyQSSSpAUrXi6enmqX6WiVWqs72ZGYmufIuoTMenu59SXYe+vj54vd6E50U2ulsbWTaT1ZoC07azz+qHB1AqvDvvYubl4RFsP/oW07BRXI3nJEmKpbkme4jpadGqqmblQYQ0evK43e6kY9fTuXPtL9dThvW5nWo+FUXJaaaFLmglSZp0zuLHNHFjS5bua1XKc6qfRZ/jqdK/9WtVT50n2bumRFG8Zh3054V+H+ZiLEYp5nZN1UaxpG2PDf8R5WUV2KpuzouYOT72Nr565C1W+EVxFs2y682taVrBFkMrFNGXTt+bqTaKTKrJZuuz5NJCSKy9ppAl12QyMRMKhYoqVRt2dDlV/fHn+PJQIOdi5s+XxvGtYyex849/onuJELBfT6G6UQgBjDt4F2PsDOwWFDzz0DM5FzM/GYqg6ZXX2K6AENjXnRgMBi1pvuh2u2FkkSIk32ImWexaOBymoCkEXhwaxvGxt3Pyt147N4qWV1/Hxv4/4NjYRd4lhMBe8QwejweapmHPnj1obm62JJvLSNAUqxmfwFZlKjBNrTO2S9v+6pG3kG330oMDR9H0ymsM+iUE9nMJ+f1+aJqGrq6uhJNqe3t7Sp2pMUlcQrKTbzYL3xECk9ZIo8zCYm8+aqu07ecGT+P/vLsa75tfZvl7bz96gnEyhMDewd3JgiH1lOdUXUOSJBmefBmUS1Dg1plAIFD0cV62K6y3se8w/myh6Hh5eAQN+/oZJ0MI7N9rBwYNPPUigKmIGTMNQovdlE8KG1EUDRtSFlvfpqIQNMfGLsL96usZi5rjY2+j5dXX4X71dcbJEFIkgsaoirLD4cChQ4fg9XonrY0Tv0H4fD4cOnTIUMxMh5Mvga2tM6FQaFrUILJlpeDfjYyiYV8fAje9F6srFiDldgVH3mInbEJQfLVAZFnG7t27DX+2o6MDHR0d19Tk0AvVma3AHI1GM+o3RQgssM60trZO69gZWwsaAIheGof71dfxv6+rMhVXw3oyhBQ/wWAQgUDA8AGv09jYaGiqh0GwMK0zBAVcdyYcDk+bGK9Zdv8Azw2exnODp/H+BWW4XViA9y8ow/Wlc2Mi5rfnRvG7kVE2jyRkmj3gzYoaZNBEk7EzBAVQogC0zhSHoEGcG+p3I6O8wgkhWRc1+ejbRAgmqY2ULMZLb/o6XZjBS4IQUqyiprOz0/L37ezspJghsEshvenkEqWgIYQU9QN/5cqVlhS+C4VCWLly5bRIfyX2b3MATC93E1BELidCCMEUPZZcLhdcLhc8Hg+am5tT+v3e3l74fD62NiAotKy+ZBZITdOmRao2BQ0hBNOxkrCiKLHUbEmSIEnSNY0r9Y1A/3lCUKAZfaxQTUFDCJnmJ1tuBoSAMTSEEEIIIRQ0hBBCCCEUNIQQQgghFDSEEEIIKTZBMzY2dorTQAghhBC7sHz58kkFzUD8C0aFegghhBBC8kl5eXnC1xcvXtw+4+LFi9spaAghhBACG1poLly4gMh151+eEbnu/Mtnz56NfaOuro4zRQghhJCCpKysLMH4omnaZeC/g4KPHz/+jv6NqqoqihpCCCGEFCSrVq1K+PrMmTMnY4Lm5MmTB+O/uWbNGs4YIYQQQgqO9evXJ3w9PDz85ZigOeEYui3e7bRmzRosWrSIs0YIIYSQgqGuri7B3XTkyJErZ6tHnk6oQ/PGG29E4n9p48aNnDlCCCGEFAz3339/wtdvvPFGLyYW1jt58uRfX7hwIfZDDQ0NdD0RQgghpCDYsGEDqqqqEG+dObnwbMs1giZy3fmXX3nllTcwwUrDNG5CCCGEIM+BwBs2bMBU1plrWh+Ey07ceOTIkSuIS43asmULRQ0hhBBC8oLT6bzG1XTw4MEL8daZSXs5/fa3v/1f8QHCFDWEEEIIQZ6CgLds2YKysrLYa4ODg/jd+O/LJv7szBtuXZbwwtiCd44Nv3G6YunSpbfOnj0bADB79mysXr0akUgE4XCYM0wIIYQQZDtm5v7774euRXQxs3///tvHFrxzzFDQAMBo2dhPTg386RpRs2rVKoiiiMOHD2N0dJSzTQghhBBYbZXZvHkzbrvttoTXz549iwMHDnSfrR75l8l+b1JBEy9qKisrb503b17s9SVLlmD9+vVYtGgRRkdHMTQ0xNknhBBCCDIN/P3Upz6FDRs2QBCEhO8NDg7i17/+9e1TiRkAKLnL89Gkf0AYLF+9YsWKX9XW1pZM9v3Tp09jYGAA4XA45o4aGhqi0CGEEEIIJgvy1btlO51O1NXVYfny5QlxMpgQAHz8+PE7I9edfznZ+xoKmtgARpf8/pZbblkWb60hhBBCCMkGZ8+exf79+4MTs5mmYpbZNw6Xnbgx+tJLq6urq3+0bNkyYeHChZxtQgghhFguZPr7+98Il524ESlIDdMWmoksiS76dXV1dcPSpUtnU9wQQgghJF0GBwdx4sSJCydPntw5VBXxpPMeaQsaTIizmTt37sOlpaV1paWli7k0hBBCCEnGyMjI6+Pj43+6ePHidqP4GDP8f/mMp1FNVZhnAAAAAElFTkSuQmCC'};
V[UPSELL]=()=>{const p=CONFIG.plans.addon,u=CONFIG.upsell;
  return `<div class="pw ofr" role="dialog" aria-label="${esc(u.name)}">
  <div class="obar"><div class="logo">${logo(22)} ChatChi</div><button class="obx" data-a="upno" aria-label="${esc(u.decline)}">${ic('x',16)}</button></div>
  <div class="sec" style="padding-top:6px;text-align:center"><span class="oeye">You're in · one more thing</span>
   <h1 class="h2" style="margin:14px 0 8px">${esc(u.title)}</h1>
   <p class="olead">${esc(u.lead)}</p></div>
  <div class="sec"><div class="ocard">
   <div class="orow"><span class="oth">${im(refImg())}</span><div style="flex:1;min-width:0"><b>${esc(u.name)}</b><div class="osub">Add-on to your ChatChi Plus</div></div></div>
   <div class="oprice"><b>${otok(p.price)}</b><span>paid once</span></div>
   <div class="ochecks">${u.checks.map(x=>`<div>${ic('check',17,'currentColor',2.4)}<span>${esc(x)}</span></div>`).join('')}</div>
   ${cta(esc(u.cta),true,'upbuy')}
   <p class="ofine">${otok(u.note)}</p></div></div>
  <div class="sec" style="padding-bottom:max(28px,env(safe-area-inset-bottom,0px));text-align:center"><button class="link" style="width:100%" data-a="upno">${esc(u.decline)}</button>
   <div class="legal">${lnk('Terms of Use',CONFIG.legal.termsUrl)} · ${lnk('Privacy Policy',CONFIG.legal.privacyUrl)}</div></div></div>`};
V[GETAPP]=()=>`<div class="scr" style="gap:16px;padding-top:28px"><div class="okwell">${ic('check',36,'#fff',2.6)}</div>
  <div style="text-align:center"><h1 class="h1" style="text-align:center;font-size:30px">You're in.<br><span class="gt">${esc(cshort())}</span> is waiting.</h1><p class="sub" style="margin-top:8px">Your story continues in the ChatChi app.</p>${S.addon?`<p class="sub" style="margin-top:6px;display:flex;gap:6px;align-items:center;justify-content:center">${ic('check',14,'currentColor',2.6)} ${esc(CONFIG.upsell.name)} added. Create them in the app.</p>`:''}</div>
  <div class="how" style="margin-top:4px">${[['Download ChatChi: AI Roleplay Chat','From the App Store or Google Play.'],[S.email?'Log in with '+esc(S.email.trim()):'Log in with your checkout email',S.email?'The email you gave us, where Plus is active.':'The one you paid with.'],['Open your story with '+esc(cshort()),'Your scenario and voice are already set.']].map(([x,y],i)=>`<div><i>${i+1}</i><div><b>${x}</b><span>${y}</span></div></div>`).join('')}</div></div>
  <div class="foot">${cta('Open the app',true,'openapp')}<div class="stores"><button class="store" data-a="openapp" aria-label="Download on the App Store"><img src="${BADGE.apple}" alt="Download on the App Store" draggable="false"></button><button class="store" data-a="openapp" aria-label="Get it on Google Play"><img src="${BADGE.play}" alt="Get it on Google Play" draggable="false"></button></div><button class="link" data-a="keepchat">Keep chatting here</button></div>`;
/* paid web chat (get_app "Keep chatting here"); a non-premium user is sent to the paywall by go() */
const GEN=["Ha. You always know what to say.","Wait, tell me more about that.","I'm not letting you change the subject.","Okay, that made me smile.","Stay a little longer?","My turn to ask something."];
V[CHAT]=()=>`<div class="chat"><div class="chead"><span class="av" style="width:40px;height:40px">${im(refImg())}</span><div style="flex:1"><b>${esc(cfull())}</b><small>● online</small></div></div>
  <div class="cbody"><div class="disclose">${esc(cshort())} is an AI character. Fictional, and depicted as an adult.</div>
   <div class="msgs" id="msgs"><div class="sp"></div><div class="bub sys">ChatChi Plus is on.</div>${S.chat.map(m=>`<div class="bub ${m.w}">${m.w==='c'?m.x:esc(m.x)}</div>`).join('')}${S.typing?'<div class="bub c new"><span class="typing"><i></i><i></i><i></i></span></div>':''}</div></div>
  <div class="cfoot"><button class="link" data-a="openapp" style="min-height:32px">${logo(16)} Open the ChatChi app</button>
   <div class="composer"><div class="box"><input id="msg" maxlength="300" placeholder="Message ${esc(cshort())}…"></div><button class="send" data-a="send" aria-label="Send">${ic('send',18)}</button></div></div></div>`;
SCREENS[UPSELL]='upsell_lifetime';SCREENS[GETAPP]='get_app';SCREENS[CHAT]='chat';
function say(text){if(S.typing||!S.premium)return;S.sent++;S.chat.push({w:'u',x:text});S.typing=true;render();persist();
  later(()=>{S.typing=false;S.chat.push({w:'c',x:GEN[S.sent%GEN.length]});render();persist()},1200)}
/* leaving a checkout without paying: CONFIG.declineFlow (FunnelFox's native checkout close does the same) */
function checkoutDeclined(plan){emit('checkout_decline',{plan});go(DECLINE(plan))}
function demoCheckout(plan){const p=CONFIG.plans[plan];S.ckPlan=plan;document.getElementById('demock')?.remove();
  const el=document.createElement('div');el.id='demock';el.setAttribute('role','dialog');el.setAttribute('aria-label','Checkout');
  el.innerHTML=`<div class="iqc"><b>Demo checkout</b><p style="margin:6px 0 14px">ChatChi Plus · ${esc(p.label)} · ${otok(p.price)}</p><div style="display:flex;flex-direction:column;gap:8px"><button class="btn" data-a="ckpay">Pay</button><button class="btn ghost" data-a="ckclose">Close without paying</button></div></div>`;
  phone.appendChild(el)}

const cur=()=>phone.querySelector('.view');
function render(anim){
  const v=document.createElement('div');v.className='view'+(anim&&!RM?' in':'');
  v.innerHTML=nav()+V[S.i]();
  const old=cur();if(old)old.replaceWith(v);else phone.appendChild(v);
  if(S.i===16)runLoad(RM?300:6500,17);
  if(S.i===18)runLoad(RM?300:4000,19);
  if(S.i===19&&S.voice<0&&anim)later(()=>{if(S.voice>=0||S.i!==19)return;S.voice=0;cur().querySelectorAll('.vrow')[0]?.classList.add('on');const b=cur().querySelector('.foot .btn');if(b)b.disabled=false;playVoice(0)},700);
  if(S.i===22)bindPw();
  if(S.i===9){const l=document.getElementById('wp');if(l){l.scrollTop=(S.cage-18)*50;let tt=0;l.addEventListener('scroll',()=>{clearTimeout(tt);tt=setTimeout(()=>{const a=Math.max(18,Math.min(80,Math.round(l.scrollTop/50)+18));S.cage=a;l.querySelectorAll('.it').forEach(x=>x.classList.toggle('on',+x.dataset.age===a))},90)},{passive:true})}}
  if(S.i===CHAT&&S.premium&&!S.chat.length){S.chat=[{w:'c',x:plotNow().msg}];render();return}
  const m=document.getElementById('msgs');if(m)m.scrollTop=m.scrollHeight;
}

function fillTo(n){
  if(n>1&&!S.ai)S.ai='yes';if(n>2&&!S.pref)S.pref='men';if(n>3&&!S.own)S.own='female';if(n>4&&!S.age)S.age='25-34';
  if(n>5&&!S.kind.length)S.kind=['comfort'];if(n>6&&!S.style)S.style='anime';if(n>7&&!S.ref)S.ref=refSet()[0].k;if(n>8&&!S.cname)S.cname='Kade - Bestie';
  if(n>10&&!S.traits.length)S.traits=['💖 Kind','🛡️ Protective'];if(n>11&&!S.place)S.place='woods';if(n>12&&!S.mems.length)S.mems=['You grew up together'];
  if(n>14&&!S.uname)S.uname='Alex';if(n>15&&!S.myTr.length)S.myTr=['🧠 Smart'];if(n>17&&S.pick<0)S.pick=0;if(n>19&&S.voice<0)S.voice=0;
  if(n>20&&!S.email)S.email='demo@example.com';if(n>21){S.spun=true;S.disc=CONFIG.spinWin}if(n>=25)S.premium=true;
}

phone.addEventListener('click',e=>{
  const b=e.target.closest('[data-a]');if(!b||b.disabled)return;
  if(e.target.closest('a'))return;   // legal links open on their own
  const a=b.dataset.a,v=b.dataset.v,f=b.dataset.f;
  switch(a){
    case 'next':
      if(S.i===5)answer('chat_kind',S.kind.join(','));if(S.i===9)answer('char_age',S.cage);
      if(S.i===10)answer('traits',S.traits.map(strip).join(','));if(S.i===12)answer('memories',S.mems.length+S.memOwn.length);
      if(S.i===15)answer('background',count('myTr','myFacts','myOwn'));
      next();break;
    case 'back':back();break;
    case 'ai':S.ai=v;answer('ai_before',v);emit('age_confirm',{method:'legal_line'});next();break;
    case 'pick':S[f]=v;answer({pref:'prefers',own:'gender',age:'age',style:'style'}[f]||f,v);
      if(f==='pref'||f==='style')S.ref='';
      cur().querySelectorAll(`[data-f="${f}"]`).forEach(x=>x.classList.toggle('on',x.dataset.v===v));later(next,RM?0:300);break;
    case 'mpick':{const arr=S[f],i=arr.indexOf(v);if(i<0)arr.push(v);else arr.splice(i,1);
      b.classList.toggle('on',i<0);b.setAttribute('aria-pressed',i<0);const btn=cur().querySelector('.foot .btn');if(btn)btn.disabled=!arr.length;break}
    case 'ref':{S.ref=v;S.cname=b.dataset.n;answer('reference',v);cur().querySelectorAll('.rtile').forEach(x=>x.classList.toggle('on',x.dataset.v===v));later(next,RM?0:300);break}
    case 'cname':{if(!S.cname.trim()){S.emErr=`Give ${pr().him} a name first`;render();break}S.emErr='';next();break}
    case 'uname':{if(!S.uname.trim()){S.emErr=`Tell ${cshort()} your name`;render();break}S.emErr='';next();break}
    case 'chip':{const arr=S[f],i=arr.indexOf(v),max=+b.dataset.max;const own={mems:'memOwn',myFacts:'myOwn'}[f];
      const tot=arr.length+(own?S[own].length:0)+(f==='myTr'?S.myFacts.length+S.myOwn.length:f==='myFacts'?S.myTr.length:0);
      if(i<0&&tot>=max){toast(`Up to ${max}`);break}
      if(i<0)arr.push(v);else arr.splice(i,1);
      cur().querySelectorAll(`.chip[data-f="${f}"]`).forEach(x=>{if(x.dataset.v===v){x.classList.toggle('on',i<0);x.setAttribute('aria-pressed',i<0)}});
      b.closest('.mq')?.classList.add('hold');later(()=>b.closest('.mq')?.classList.remove('hold'),1500);
      const btn=cur().querySelector('.foot .btn');if(btn)btn.disabled=!(S.i===10?S.traits.length:S.i===12?count('mems','memOwn'):count('myTr','myFacts','myOwn'));break}
    case 'addown':{const inp=cur().querySelector(`input[data-f="draft_${f}"]`),x=(inp&&inp.value||'').trim();if(!x){inp?.focus();break}
      const max=f==='memOwn'?4:8,tot=f==='memOwn'?count('mems','memOwn'):count('myTr','myFacts','myOwn');if(tot>=max){toast(`Up to ${max}`);break}
      S[f].push(x);render();break}
    case 'unown':S[f].splice(+v,1);render();break;
    case 'place':S.place=v;answer('meet_place',v);cur().querySelectorAll('[data-a="place"]').forEach(x=>x.classList.toggle('on',x.dataset.v===v));b.closest('.mq')?.classList.add('hold');later(next,RM?0:350);break;
    case 'plotp':if(S.plot>0){S.plot--;render()}break;
    case 'plotn':if(S.plot<3){S.plot++;render()}break;
    case 'plotsel':S.pick=S.plot;answer('scenario',S.pick+1);next();break;
    case 'voice':{const k=+v;S.voice=k;cur().querySelectorAll('.vrow').forEach((x,j)=>x.classList.toggle('on',j===k));const btn=cur().querySelector('.foot .btn');if(btn)btn.disabled=false;playVoice(k);break}
    case 'vtab':if(vgOf()!==v){stopVoice();S.vg=v;S.voice=-1;render();answer('voice_tab',v)}break;
    case 'voicesel':answer('voice',vgOf()+'-'+(S.voice+1));next();break;
    case 'emailgo':{const x=S.email.trim();if(!EMRE.test(x)){S.emErr='Please enter a valid email';render();document.getElementById('em')?.focus();break}
      S.email=x;S.emErr='';emit('lead',{method:'email',placement:'pre_spin'});next();break}
    case 'spin':{if(S.spun)break;S.spun=true;S.disc=CONFIG.spinWin;emit('spin',{result:S.disc});const d=document.getElementById('disc');if(d)d.style.transform=`rotate(${spinTo()}deg)`;b.disabled=true;
      later(()=>{persist();render()},RM?50:4400);break}
    case 'claim':emit('discount_claim',{discount:S.disc});next();break;
    case 'plan':S.plan=v;paintPlan();emit('plan_select',{plan:v,price:CONFIG.plans[v].price});break;
    case 'agree':S.agree=!S.agree;S.agErr=false;{const r=cur(),l=r.querySelector('.agree');l.classList.toggle('on',S.agree);l.classList.remove('bad');b.setAttribute('aria-checked',S.agree);b.innerHTML=S.agree?ic('check',16,'#1a0f1c',3):'';r.querySelector('.agerr')?.remove()}break;
    case 'buy':{if(!S.agree){S.agErr=true;const r=cur(),l=r.querySelector('.agree');l.classList.add('bad');if(!r.querySelector('.agerr'))l.insertAdjacentHTML('afterend','<p class="agerr" role="alert">Please accept the terms to continue.</p>');l.scrollIntoView({behavior:RM?'auto':'smooth',block:'center'});break}checkout(visPlan());break}
    case 'ckpay':{document.getElementById('demock')?.remove();window.IkFunnel.completePurchase(S.ckPlan);break}
    case 'ckclose':{document.getElementById('demock')?.remove();checkoutDeclined(S.ckPlan);break}
    case 'upbuy':emit('upsell_accept',{plan:'addon'});checkout('addon');break;
    case 'upno':emit('upsell_decline');go(GETAPP);break;
    case 'keepchat':go(CHAT);break;
    case 'send':{const m=document.getElementById('msg');if(m&&m.value.trim())say(m.value.trim());else m?.focus();break}
    case 'openapp':openApp();break;
  }
});
phone.addEventListener('input',e=>{
  const f=e.target.dataset.f;if(!f||f.startsWith('draft_'))return;
  S[f]=e.target.value;const btn=cur().querySelector('.foot .btn');
  if(f==='email'){const ok=EMRE.test(S.email.trim());if(btn)btn.disabled=!S.email.trim();if(S.emErr&&ok){S.emErr='';cur().querySelector('.box')?.classList.remove('bad');cur().querySelector('.emerr')?.remove()}}
  if(f==='uname'&&btn)btn.disabled=!S.uname.trim();
});
phone.addEventListener('keydown',e=>{if(e.key!=='Enter')return;const id=e.target.id,f=e.target.dataset.f||'';
  if(id==='msg')cur().querySelector('[data-a="send"]')?.click();
  else if(id==='em'||id==='un'||id==='cn'){e.preventDefault();cur().querySelector('.foot .btn')?.click()}
  else if(f.startsWith('draft_')){e.preventDefault();cur().querySelector(`[data-a="addown"][data-f="${f.slice(6)}"]`)?.click()}});

/* Host API: the page embedding this funnel can complete a purchase or read the picks. */
window.IkFunnel=Object.assign(window.IkFunnel||{},{config:CONFIG,data:snapshot,
  completePurchase:(plan)=>{if(plan&&CONFIG.plans[plan])S.plan=plan;if(S.plan==='addon')S.addon=true;AFTER=CONFIG.plans[S.plan]&&CONFIG.plans[S.plan].oneTime?26:25;S.premium=true;emit('purchase_complete',{plan:S.plan});go(AFTER);later(()=>toast(S.plan==='addon'?CONFIG.upsell.name+' added.':'ChatChi Plus is on. Enjoy.'),1600)}});
if(DEBUG)window.IkFunnel.go=n=>{clearT();fillTo(n);go(n)};
if(DEBUG){const m=location.hash.match(/s=?([0-9]+)/);if(m&&V[+m[1]]){fillTo(+m[1]);S.i=+m[1]}}
/* standalone reload: resume the same screen and state */
if(typeof ffGo!=='function'&&!(DEBUG&&location.hash))try{const x=JSON.parse(sessionStorage.getItem(DKEY)||'null');if(x&&V[x.i])S=Object.assign(S,x,{typing:false})}catch(e){}
if(S.i===CHAT&&!S.premium)S.i=S.email?22:20;
{let ref='';try{ref=document.referrer?new URL(document.referrer).hostname:''}catch(e){}emit('funnel_start',{referrer:ref})}
render();viewed();

/* ============================================================ slide 02b: Pick your AI (Step 0) */
(function(){
  var sec=document.getElementById('s-setup');if(!sec)return;
  function $s(id){return document.getElementById(id)}
  function A(url,text){return '<a href="'+url+'" target="_blank" rel="noopener">'+(text||url.replace(/^https?:\/\//,'').replace(/\/$/,''))+'</a>'}
  var ACC={OpenAI:'#10A37F',Anthropic:'#D97757',Google:'#4285F4',Microsoft:'#0078D4'};
  /* Guide links, titles and best_for: from .mercury/guide_links.json (checked 2026-11-18). free: yes | lim | no */
  var TOOLS=[
    {id:'chatgpt',name:'ChatGPT',maker:'OpenAI',kind:'chat',free:'yes',best:'Everyday questions, writing and studying help',
     guide:['https://learn.chatgpt.com/docs/quickstart','Quickstart · ChatGPT Learn'],
     backup:['https://academy.openai.com/public/courses/ai-foundations-juzjs','Free course: AI Foundations'],
     steps:[['Open '+A('https://chatgpt.com','chatgpt.com'),'Type it in the address bar of any browser.'],
       ['Sign up or log in','Top-right. Google account or email. Free is enough.'],
       ['Start a new chat','Top-left. Stay in this one chat all afternoon.'],
       ['Paste the prompt, press send','The box at the bottom; the arrow on its right.'],
       ['Run it','Click <b>Preview</b> on the code block, or <b>Copy</b> and save it.']]},
    {id:'claude',name:'Claude',maker:'Anthropic',kind:'chat',free:'yes',age:'18+',best:'Long reading, writing and careful explanations',
     guide:['https://support.claude.com/en/articles/8114491','Get started with Claude'],
     backup:['https://academy.claude.com/courses/claude-101','Free course: Claude 101'],
     steps:[['Open '+A('https://claude.ai','claude.ai'),'Type it in the address bar of any browser.'],
       ['Continue with Google','Or type your email and follow the link Claude sends.'],
       ['Start a new chat','Top-left. Stay in this one chat all afternoon.'],
       ['Paste the prompt, press send','The box at the bottom; the arrow on its right.'],
       ['See it run','The simulation opens on the right, beside the chat.']]},
    {id:'gemini',name:'Gemini',maker:'Google',kind:'chat',free:'yes',best:'Google account users; Gmail, Docs, Drive',
     guide:['https://support.google.com/gemini/answer/13275745?hl=en','Use Gemini Apps · Gemini Help'],
     backup:['https://support.google.com/gemini/answer/13278668?hl=en','More help: signing in'],
     steps:[['Open '+A('https://gemini.google.com','gemini.google.com'),'Type it in the address bar of any browser.'],
       ['Sign in','Top-right, with your Google (Gmail) account.'],
       ['Start a new chat','Top-left. Stay in this one chat all afternoon.'],
       ['Turn on Canvas','In the box at the bottom: Tools &rsaquo; <b>Canvas</b>.'],
       ['Paste the prompt, submit','Canvas runs your page on the right.']]},
    {id:'copilot',name:'Copilot',maker:'Microsoft',kind:'chat',free:'yes',best:'Windows and Microsoft 365 / Office users',
     guide:['https://support.microsoft.com/en-us/microsoft-365-copilot/what-is-microsoft-copilot-app','Get started with the Copilot app'],
     backup:['https://support.microsoft.com/en-us/microsoft-365-copilot/copilot-tutorial-start-using-copilot','Video: Start using Copilot (2 min)'],
     steps:[['Open '+A('https://copilot.microsoft.com','copilot.microsoft.com'),'Or on Windows 11, click the Copilot icon on the taskbar.'],
       ['Sign in','Bottom-left. Microsoft, Google or Apple account.'],
       ['Start a new conversation','From the sidebar on the left.'],
       ['Paste the prompt, press Enter','Add: <b>\u201cPut the whole page in one code block.\u201d</b>'],
       ['Copy the code','Copy button, top-right of the code block. Save it.']]},
    {id:'codex',name:'Codex',maker:'OpenAI',kind:'agent',free:'lim',best:'Coding help on your own computer',
     guide:['https://learn.chatgpt.com/codex/cli','Codex CLI · ChatGPT Learn'],
     backup:['https://help.openai.com/en/articles/11369540','More help: Codex with your ChatGPT plan'],
     steps:[['Get the ChatGPT desktop app','From '+A('https://chatgpt.com/download','chatgpt.com/download')+'. Sign in.'],
       ['Switch to Codex','Choose <b>Codex</b> from the app menu.'],
       ['Open your My AI Lab folder','Codex only changes files in the folder you pick.'],
       ['Paste the prompt','Add: <b>\u201csave it here as my-simulation.html\u201d</b>.'],
       ['Approve, then open the file','Read what it wants to do, approve, double-click the file.']]},
    {id:'claude-code',name:'Claude Code',maker:'Anthropic',kind:'agent',free:'no',best:'Coding with an AI agent in terminal',
     guide:['https://code.claude.com/docs/quickstart','Quickstart · Claude Code Docs'],
     backup:['https://academy.claude.com/courses/claude-code-101','Course: Claude Code 101'],
     steps:[['Open a terminal','Windows: <b>PowerShell</b>. Mac: <b>Terminal</b>.'],
       ['Install with one line','Windows: <code>irm https://claude.ai/install.ps1 | iex</code>'],
       ['Go to your folder','Type <code>cd</code> and a space, drag My AI Lab in, press Enter.'],
       ['Type claude, log in','The first time, your browser opens to log in.'],
       ['Paste the prompt','Add: \u201csave it here as my-simulation.html\u201d. Choose <b>Yes</b>.']]},
    {id:'antigravity',name:'Antigravity',maker:'Google',kind:'agent',free:'yes',best:'Letting AI agents build apps for you',
     guide:['https://antigravity.google/docs/get-started','Get started · Antigravity Docs'],
     backup:['https://codelabs.developers.google.com/getting-started-google-antigravity','Step-by-step codelab'],
     steps:[['Download it',A('https://antigravity.google/download','antigravity.google/download')+' (Windows: x64).'],
       ['Install it','Run the .exe. Mac: drag it into Applications.'],
       ['Sign in with Google','Pick a role (try Science) and accept the terms.'],
       ['Open your My AI Lab folder','Sidebar: <b>New Project</b> &rsaquo; <b>Add Folder</b>.'],
       ['Paste the prompt, approve','Add \u201csave it here as my-simulation.html\u201d.']]}
  ];
  var FREE={yes:'Free',lim:'Free, limits',no:'Paid plan'};
  function chip(t){return '<span class="free '+t.free+'">'+FREE[t.free]+'</span>'}
  function short(u){return u.replace(/^https?:\/\//,'').replace(/\?.*$/,'').replace(/\/$/,'').replace(/\//g,'/<wbr>')}
  function qr(el,text,size){el.innerHTML='';try{new QRCode(el,{text:text,width:size,height:size,correctLevel:QRCode.CorrectLevel.M,colorDark:'#141A33',colorLight:'#ffffff'})}catch(e){el.textContent=text}}

  var cx=$s('suCx'),openTile=null,busy=false,timers=[];
  TOOLS.forEach(function(t){
    t.acc=ACC[t.maker]||'#3D56D6';
    var b=document.createElement('button');b.type='button';b.className='tl';b.style.setProperty('--acc',t.acc);
    b.innerHTML='<span class="go">&rarr;</span><span class="wm">'+t.name+'</span><span class="by">by '+t.maker+' &nbsp;'+chip(t)+'</span><span class="best">'+t.best+'</span>';
    b.onclick=function(e){e.stopPropagation();openAI(t,b)};
    $s(t.kind==='chat'?'suChat':'suCode').appendChild(b);
  });
  function later(f,ms){timers.push(setTimeout(f,ms))}
  function clipTo(r){var s=sec.getBoundingClientRect(),k=s.width/1280||1;
    cx.style.setProperty('--t',(r.top-s.top)/k+'px');cx.style.setProperty('--l',(r.left-s.left)/k+'px');
    cx.style.setProperty('--r',(s.right-r.right)/k+'px');cx.style.setProperty('--b',(s.bottom-r.bottom)/k+'px');cx.style.setProperty('--rd','24px');}
  function clipFull(){['--t','--l','--r','--b','--rd'].forEach(function(p){cx.style.setProperty(p,'0px')})}
  function openAI(t,b){
    if(busy||openTile)return;busy=true;openTile=b;
    cx.style.setProperty('--acc',t.acc);
    $s('suName').textContent=t.name;
    $s('suMeta').innerHTML='by '+t.maker+' '+chip(t)+(t.age?'<span class="age">Age '+t.age+'</span>':'')+'<span>Best for: '+t.best+'</span>';
    $s('suSteps').innerHTML=t.steps.map(function(s,i){return '<li style="transition-delay:'+(.24+i*.07)+'s"><i>'+(i+1)+'</i><div><b class="st">'+s[0]+'</b><span class="sd">'+s[1]+'</span></div></li>'}).join('');
    var g=t.guide[0];
    ['suQr','suGt','suLk'].forEach(function(id){$s(id).href=g});
    qr($s('suQr'),g,210);$s('suQr').title='Open '+t.guide[1];
    $s('suGt').textContent=t.guide[1]+'\u00a0\u2197';$s('suLk').innerHTML=short(g);
    var bk=$s('suBk');if(t.backup){bk.href=t.backup[0];bk.textContent=t.backup[1]+'\u00a0\u2197';}else{bk.removeAttribute('href');bk.textContent='';}
    cx.style.transition='none';clipTo(b.getBoundingClientRect());cx.classList.add('show');cx.setAttribute('aria-hidden','false');
    void cx.offsetWidth;cx.style.transition='';
    requestAnimationFrame(function(){clipFull();cx.classList.add('ready');later(function(){busy=false;try{$s('suBack').focus({preventScroll:true})}catch(e){}},560)});
  }
  function closeAI(){
    if(busy||!openTile)return;busy=true;cx.classList.remove('ready');
    later(function(){clipTo(openTile.getBoundingClientRect());
      later(function(){cx.classList.remove('show');cx.setAttribute('aria-hidden','true');try{openTile.focus({preventScroll:true})}catch(e){}openTile=null;busy=false},560)},120);
  }
  function reset(){timers.forEach(clearTimeout);timers=[];cx.style.transition='none';cx.classList.remove('ready','show');cx.setAttribute('aria-hidden','true');clipFull();void cx.offsetWidth;cx.style.transition='';
    if(document.activeElement&&sec.contains(document.activeElement))document.activeElement.blur();openTile=null;busy=false;}
  $s('suBack').onclick=function(e){e.stopPropagation();closeAI()};
  // while an AI page is open, keys stay on this slide (capture phase runs before the deck's window listener)
  addEventListener('keydown',function(e){
    if(!openTile||!sec.classList.contains('on'))return;
    e.stopImmediatePropagation();
    if(e.key==='Escape'){e.preventDefault();closeAI();}
    else if(/^(Arrow|Page|Home$|End$)/.test(e.key))e.preventDefault();
  },true);
  document.addEventListener('slidechange',function(e){if(e.detail.slide!==sec&&(openTile||busy))reset();});
  window.setupSlide={open:function(id){var i=TOOLS.findIndex(function(t){return t.id===id});var bs=sec.querySelectorAll('.tl');if(i>=0)openAI(TOOLS[i],bs[i]);},close:closeAI,reset:reset};
})();

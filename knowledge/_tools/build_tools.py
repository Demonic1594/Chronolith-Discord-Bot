#!/usr/bin/env python3
"""Recreate the BotForge web tools as self-contained offline HTML files.

Emits into knowledge/tools/:
  - client-generator.html      (Client Generator V3)
  - app-commands-builder.html  (Application Commands Builder V2)
  - permissions-calculator.html(Permissions Calculator V3)
  - intents-calculator.html    (Gateway Intents Calculator V3)

All data (intents, permissions, scopes, events, packages) is embedded from the
.knowledge-cache datasets so the tools work fully offline. Re-run after refresh.
"""
import json, os

CACHE = '/workspace/BotForge/.knowledge-cache'
OUT = '/workspace/BotForge/knowledge/tools'

# ---------------------------------------------------------------- data

def load_disc(res):
    return json.load(open(f'{CACHE}/discord/{res}.json'))

INTENTS = load_disc('intents')['intents']
PERMISSIONS = load_disc('permissions')['permissions']
SCOPES = load_disc('scopes')['scopes']
GW_EVENTS = load_disc('events')['events']

FS_EVENTS = [
    {'name': e['name'], 'description': e.get('description') or '', 'intents': e.get('intents') or []}
    for e in json.load(open(f'{CACHE}/meta/ForgeScript__eventsUrl.json'))
]

REG = json.load(open(f'{CACHE}/meta/_registry.json'))
NPM = {e['packageName']: (f"@{e['npmPackageOwner']}/{e['npmPackageName']}" if e.get('npmPackageOwner') else e['npmPackageName'])
       for e in REG if e.get('npmPackageName')}

# official extensions the client generator offers (mirrors the real tool)
EXTENSIONS = [
    {'pkg': 'ForgeScript', 'always': True,  'note': 'Core package', 'events': True},
    {'pkg': 'ForgeDB',     'db': True,      'note': 'type: mysql | postgres | better-sqlite3 | sqlite | mongodb (+ url)', 'events': True},
    {'pkg': 'ForgeCanvas', 'events': True,  'note': 'Image generation — see README for canvas options'},
    {'pkg': 'ForgeMusic',  'events': True,  'note': 'Requires extra config — check their README'},
    {'pkg': 'ForgeTopGG',  'token': True,   'note': 'Top.gg API token + auto stats posting', 'events': True},
    {'pkg': 'ForgeLinked', 'events': True,  'note': 'Requires extra config — check their README'},
    {'pkg': 'ForgeGiveaways', 'events': True, 'note': 'Giveaway manager'},
    {'pkg': 'ForgeMinecraft', 'events': True, 'note': 'Requires java config — check their README'},
]

INTENT_PRESETS = {
    'Custom (manual selection)': None,
    'Standard Only': [i['name'] for i in INTENTS if not i['privileged']],
    'All non-privileged intents': [i['name'] for i in INTENTS if not i['privileged']],
    'All Intents': [i['name'] for i in INTENTS],
    'None (Clear All)': [],
    'Messages & DMs': ['Guilds', 'GuildMessages', 'MessageContent', 'DirectMessages', 'DirectMessageReactions', 'GuildMessageReactions', 'GuildMessageTyping', 'DirectMessageTyping'],
    'Moderation & Members': ['Guilds', 'GuildModeration', 'GuildMembers', 'GuildBans' if any(i['name'] == 'GuildBans' for i in INTENTS) else 'GuildModeration'],
    'Voice Bots': ['Guilds', 'GuildVoiceStates'],
    'Presence & Activities': ['GuildPresences'],
    'Auto-Mod': ['AutoModerationConfiguration', 'AutoModerationExecution', 'GuildModeration'],
    'Reactions & Polls': ['GuildMessageReactions', 'DirectMessageReactions', 'GuildMessagePolls', 'DirectMessagePolls'],
}
INTENT_PRESETS['Moderation & Members'] = sorted(set(INTENT_PRESETS['Moderation & Members']))

DATA = {
    'intents': INTENTS,
    'permissions': PERMISSIONS,
    'scopes': SCOPES,
    'gwEvents': GW_EVENTS,
    'fsEvents': FS_EVENTS,
    'npm': NPM,
    'extensions': EXTENSIONS,
    'presets': INTENT_PRESETS,
}
DATA_JS = json.dumps(DATA, separators=(',', ':'))

CSS = """
:root{--bg:#1e1f22;--panel:#2b2d31;--panel2:#313338;--border:#3f4147;--text:#dbdee1;--muted:#949ba4;--accent:#5865f2;--accent2:#4752c4;--danger:#da373c;--ok:#23a559;--warn:#f0b132}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--text);font:14px/1.5 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;padding:20px;max-width:1100px;margin:0 auto}
h1{font-size:20px;margin-bottom:4px}h2{font-size:15px;margin:18px 0 8px}
.sub{color:var(--muted);margin-bottom:16px;font-size:13px}
.panel{background:var(--panel);border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:14px}
label{display:block;margin:8px 0 3px;font-size:13px;color:var(--muted)}
input[type=text],input[type=password],input[type=number],select,textarea{width:100%;background:var(--bg);color:var(--text);border:1px solid var(--border);border-radius:6px;padding:8px;font:inherit}
input:focus,select:focus,textarea:focus{outline:1px solid var(--accent)}
input[type=checkbox]{accent-color:var(--accent);margin-right:6px;transform:translateY(1px)}
button{background:var(--accent);color:#fff;border:0;border-radius:6px;padding:8px 14px;font:inherit;font-weight:600;cursor:pointer}
button:hover{background:var(--accent2)}
button.ghost{background:transparent;border:1px solid var(--border);color:var(--text);font-weight:400}
button.danger{background:var(--danger)}
.row{display:flex;gap:10px;flex-wrap:wrap}.row>*{flex:1;min-width:140px}
.chk{display:flex;align-items:center;gap:2px;padding:3px 6px;border-radius:4px;font-size:13px;cursor:pointer;user-select:none}
.chk:hover{background:var(--panel2)}
.chk small{color:var(--muted);margin-left:4px}
.badge{display:inline-block;font-size:11px;padding:1px 7px;border-radius:99px;margin-left:6px;font-weight:600;vertical-align:1px}
.badge.p{background:#5c261d;color:#ffb2b2}.badge.n{background:#20303f;color:#9cc3e5}
details{border:1px solid var(--border);border-radius:8px;padding:10px 14px;margin:10px 0;background:var(--panel)}
summary{cursor:pointer;font-weight:600;color:var(--muted)}
pre{background:#111214;border:1px solid var(--border);border-radius:8px;padding:12px;overflow:auto;max-height:420px;font:12px/1.5 ui-monospace,Consolas,monospace;color:#cdd6e4;white-space:pre-wrap}
.tabs{display:flex;gap:6px;margin-bottom:8px}
.tabs button{background:transparent;border:1px solid var(--border);color:var(--muted)}
.tabs button.on{background:var(--accent);color:#fff;border-color:var(--accent)}
.warnbox{background:#5c261d;border:1px solid var(--danger);border-radius:8px;padding:10px 14px;margin:10px 0;font-size:13px}
.okbox{background:#1e3a29;border:1px solid var(--ok);border-radius:8px;padding:10px 14px;margin:10px 0}
.bigint{font:600 22px ui-monospace,monospace;color:#fff;background:#111214;border:1px solid var(--border);border-radius:8px;padding:10px 14px;display:inline-block;margin:8px 0}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.opt{border:1px solid var(--border);border-radius:8px;padding:10px;margin:8px 0;background:var(--panel2)}
.opt .del{float:right}
.hint{font-size:12px;color:var(--muted)}
.copy{position:relative}
.copied{position:absolute;right:8px;top:8px;font-size:11px;color:var(--ok)}
@media(max-width:800px){.grid{grid-template-columns:1fr}}
"""

def page(title, desc, body_js, extra_html=''):
    return f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title} (recreation) | BotForge knowledge</title>
<style>{CSS}</style></head>
<body>
<h1>{title} <span class="badge n">offline recreation</span></h1>
<div class="sub">{desc} — rebuilt from verified data in the local knowledge base; original: <a style="color:#9cc3e5" href="https://tools.botforge.org">tools.botforge.org</a>.</div>
{extra_html}
<div id="app"></div>
<script>
const DATA = {DATA_JS};
{body_js}
</script>
</body></html>"""

# ---------------------------------------------------------------- tool 1: client generator

CG_JS = r"""
const S = { token:'', prefixes:'!', commands:'./commands', slash:'./slash cmds', functions:'./functions',
  prefixCaseInsensitive:false, logLevel:'', allowBots:false, disableConsoleErrors:false, mobile:false,
  respondOnEdit:false, editMs:60000, trackersInvites:false, trackersVoice:false,
  exts:{}, dbType:'', topggToken:'', events:['messageCreate','clientReady'] };

function render(){
  const app = document.getElementById('app');
  app.innerHTML = `
  <div class="grid">
  <div>
  <div class="panel"><h2>Base configuration</h2>
    <label>Bot token <span class="hint">(never sent anywhere — this file is fully offline)</span></label>
    <input type="password" id="token" oninput="S.token=this.value">
    <label>Prefixes (comma separated)</label><input type="text" id="prefixes" value="${S.prefixes}" oninput="S.prefixes=this.value">
    <div class="row">
      <div><label>Commands folder</label><input type="text" value="${S.commands}" oninput="S.commands=this.value"></div>
      <div><label>Slash cmds folder</label><input type="text" value="${S.slash}" oninput="S.slash=this.value"></div>
    </div>
    <label>Functions folder (custom functions)</label><input type="text" value="${S.functions}" oninput="S.functions=this.value">
  </div>

  <div class="panel"><h2>Client options</h2>
    <label class="chk"><input type="checkbox" onchange="S.prefixCaseInsensitive=this.checked"> Prefix case-insensitive</label>
    <label>Log level</label><select onchange="S.logLevel=this.value">
      <option value="">Default</option><option value="none">None</option><option value="veryLow">Very Low</option>
      <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select>
    <label class="chk"><input type="checkbox" onchange="S.allowBots=this.checked"> Allow bots to trigger events</label>
    <label class="chk"><input type="checkbox" onchange="S.disableConsoleErrors=this.checked"> Disable console errors</label>
    <label class="chk"><input type="checkbox" onchange="S.mobile=this.checked"> Mobile status</label>
    <label class="chk"><input type="checkbox" onchange="S.respondOnEdit=this.checked;document.getElementById('editms').style.display=this.checked?'block':'none'"> Respond on message edit</label>
    <div id="editms" style="display:none"><label>Unusable-after window (ms)</label><input type="number" value="${S.editMs}" oninput="S.editMs=+this.value"></div>
    <details><summary>Trackers</summary>
      <label class="chk"><input type="checkbox" onchange="S.trackersInvites=this.checked"> Invite tracker</label>
      <label class="chk"><input type="checkbox" onchange="S.trackersVoice=this.checked"> Voice tracker</label>
    </details>
  </div>

  <div class="panel"><h2>Extensions</h2>
    ${DATA.extensions.map(e=>`
      <div class="opt"><label class="chk"><input type="checkbox" ${e.always?'checked disabled':''} onchange="S.exts['${e.pkg}']=this.checked"> ${e.pkg}${e.always?' (core)':''}</label>
      <div class="hint">${e.note||''}</div>
      ${e.db?`<label>Database type</label><select onchange="S.dbType=this.value"><option value="">local default (sqlite)</option><option>mysql</option><option>postgres</option><option>better-sqlite3</option><option>sqlite</option><option>mongodb</option></select>`:''}
      ${e.token?`<label>Top.gg token</label><input type="text" oninput="S.topggToken=this.value">`:''}
      </div>`).join('')}
  </div>

  <div class="panel"><h2>Events</h2>
    <input type="text" placeholder="Filter events…" oninput="filterEvents(this.value)">
    <div class="hint" style="margin:4px 0">Selecting events auto-computes required gateway intents. Extension events register with their extension.</div>
    <div id="evlist" style="max-height:300px;overflow:auto"></div>
  </div>
  </div><div>

  <div class="panel"><h2>Generated output</h2>
    <div class="tabs"><button class="on" onclick="tab(this,'index.js')">index.js</button><button onclick="tab(this,'package.json')">package.json</button></div>
    <button class="ghost copy" onclick="copyOut()">Copy</button><span class="copied" id="copied" style="display:none">copied!</span>
    <pre id="out"></pre>
  </div>
  <div class="panel"><h2>Computed intents</h2><div id="intents"></div></div>
  </div></div>`;
  renderEvents(''); gen();
}
function filterEvents(q){ renderEvents(q); }
function renderEvents(q){
  q=q.toLowerCase();
  const el=document.getElementById('evlist'); if(!el)return;
  el.innerHTML = DATA.fsEvents.filter(e=>e.name.toLowerCase().includes(q)).map(e=>`
    <label class="chk"><input type="checkbox" ${S.events.includes(e.name)?'checked':''} onchange="toggleEvent('${e.name}',this.checked)"> ${e.name}
    ${e.intents.some(i=>DATA.intents.find(d=>d.name===i&&d.privileged))?'<span class="badge p">privileged</span>':''}
    <small>${e.description.slice(0,60)}</small></label>`).join('');
}
function toggleEvent(n,on){ if(on){if(!S.events.includes(n))S.events.push(n)} else S.events=S.events.filter(x=>x!==n); gen(); }
function selectedIntents(){
  const set=new Set();
  for(const ev of DATA.fsEvents) if(S.events.includes(ev.name)) ev.intents.forEach(i=>set.add(i));
  return DATA.intents.filter(i=>set.has(i.name)).map(i=>i.name);
}
function J(x){return JSON.stringify(String(x))}
function gen(){
  const intents=selectedIntents();
  document.getElementById('intents').innerHTML = intents.length
    ? `<div class="bigint">${intents.reduce((a,n)=>a|BigInt(DATA.intents.find(i=>i.name===n).value),0n)}</div><div>${intents.map(i=>`<span class="chk">${i}${DATA.intents.find(d=>d.name===i).privileged?'<span class="badge p">P</span>':''}</span>`).join(' ')}</div>`
    : '<span class="hint">none</span>';
  const reqs=[], adds=[];
  for(const e of DATA.extensions){
    if(e.always) continue;
    if(S.exts[e.pkg]){
      const imp = DATA.npm[e.pkg] || e.pkg;
      if(e.pkg==='ForgeDB'){
        reqs.push(`const { ForgeDB } = require("${imp}")`);
        adds.push(S.dbType ? `client.extensions.add(new ForgeDB({ type: "${S.dbType}" }))` : 'client.extensions.add(new ForgeDB())');
      } else if(e.pkg==='ForgeTopGG'){
        reqs.push(`const { ForgeTopGG } = require("${imp}")`);
        adds.push(`client.extensions.add(new ForgeTopGG({ token: ${J(S.topggToken||'YOUR_TOPGG_TOKEN')} }))`);
      } else {
        reqs.push(`const { ${e.pkg} } = require("${imp}")`);
        adds.push(`client.extensions.add(new ${e.pkg}()) // ${e.note||'see README for options'}`);
      }
    }
  }
  const opts=[];
  opts.push(`    intents: [${intents.map(i=>`"${i}"`).join(', ')}]`);
  opts.push(`    events: [${S.events.map(e=>`"${e}"`).join(', ')}]`);
  opts.push(`    prefixes: ${JSON.stringify(S.prefixes.split(',').map(p=>p.trim()).filter(p=>p!==''))}`);
  if(S.commands) opts.push(`    commands: ${J(S.commands)}`);
  if(S.functions) opts.push(`    functions: ${J(S.functions)}`);
  if(S.prefixCaseInsensitive) opts.push(`    prefixCaseInsensitive: true`);
  if(S.logLevel) opts.push(`    logLevel: "${S.logLevel}"`);
  if(S.allowBots) opts.push(`    allowBots: true`);
  if(S.disableConsoleErrors) opts.push(`    disableConsoleErrors: true`);
  if(S.mobile) opts.push(`    mobile: true`);
  if(S.respondOnEdit) opts.push(`    respondOnEdit: ${Number.isFinite(S.editMs) && S.editMs > 0 ? S.editMs : 'true'}`);
  if(S.trackersInvites||S.trackersVoice) opts.push(`    trackers: {${S.trackersInvites?'invites: true,':''}${S.trackersVoice?'voice: true':''}}`);
  const extAdds = adds.length?`\n${adds.join('\n')}`:'';
  const index = `// Generated by the BotForge knowledge-base client generator (offline recreation)\nconst { ForgeClient } = require("@tryforge/forgescript")\n${reqs.join('\n')}\n\nconst client = new ForgeClient({\n${opts.join(',\n')}\n})${extAdds}\n${S.slash?`\nclient.applicationCommands.load(${J(S.slash)})`:''}\n\nclient.login(${S.token?J(S.token):'process.env.BOT_TOKEN ?? "YOUR_BOT_TOKEN"'})\n`;
  const deps={}; deps[DATA.npm['ForgeScript']||'@tryforge/forgescript']='latest';
  for(const e of DATA.extensions){ if(S.exts[e.pkg]&&!e.always){const n=DATA.npm[e.pkg]; if(n)deps[n]='latest';} }
  const pkg = JSON.stringify({ name:'my-bot', version:'1.0.0', main:'index.js', scripts:{start:'node index.js'}, dependencies:deps }, null, 2);
  window.OUT={'index.js':index,'package.json':pkg};
  document.getElementById('out').textContent = index;
}
function tab(btn,t){ document.querySelectorAll('.tabs button').forEach(b=>b.classList.remove('on')); btn.classList.add('on'); document.getElementById('out').textContent=window.OUT[t]; window.CUR=t; }
function copyOut(){ navigator.clipboard.writeText(window.OUT[window.CUR||'index.js']); const c=document.getElementById('copied'); c.style.display='inline'; setTimeout(()=>c.style.display='none',1200); }
render();
"""

# ---------------------------------------------------------------- tool 2: app commands builder

AB_JS = r"""
const OPT_TYPES={1:'Subcommand',2:'Subcommand group',3:'String',4:'Integer',5:'Boolean',6:'User',7:'Channel',8:'Role',9:'Mentionable',10:'Number',11:'Attachment'};
const CMD_TYPES={1:'Slash (CHAT_INPUT)',2:'User context menu',3:'Message context menu'};
let C={type:1,name:'',description:'',default_member_permissions:'0',nsfw:false,options:[]};
function newOpt(){return{type:3,name:'',description:'',required:false,autocomplete:false,min:null,max:null,choices:[]}}
function render(){
  document.getElementById('app').innerHTML=`
  <div class="grid"><div>
  <div class="panel"><h2>Base command</h2>
    <button class="ghost" onclick="importJson()">Import from JSON</button>
    <label>Type</label><select onchange="C.type=+this.value;render()">${Object.entries(CMD_TYPES).map(([k,v])=>`<option value="${k}" ${C.type==k?'selected':''}>${v}</option>`).join('')}</select>
    <label>Name</label><input type="text" value="${C.name}" oninput="C.name=this.value">
    ${C.type===1?`<label>Description</label><input type="text" value="${C.description}" oninput="C.description=this.value">`:''}
    <details><summary>Advanced</summary>
      <label>Default member permissions</label>
      <div id="perms" style="max-height:200px;overflow:auto;border:1px solid var(--border);border-radius:6px;padding:6px"></div>
      <label class="chk" style="margin-top:8px"><input type="checkbox" ${C.nsfw?'checked':''} onchange="C.nsfw=this.checked"> Age-restricted (nsfw)</label>
    </details>
  </div>
  <div class="panel"><h2>Options ${C.type===1?'':'(slash commands only)'}</h2>
    <div id="optlist">${C.type===1?C.options.map((o,i)=>optHtml(o,i)).join(''):'<span class="hint">Context menus take no options.</span>'}</div>
    ${C.type===1?'<button class="ghost" onclick="C.options.push(newOpt());render()">+ Add option</button>':''}
  </div>
  </div><div>
  <div class="panel"><h2>Export</h2>
    <div class="tabs"><button class="on" onclick="showOut(this,\'json\')">JSON</button><button onclick="showOut(this,\'djs\')">discord.js</button></div>
    <button class="ghost" onclick="copyOut()">Copy</button>
    <pre id="out"></pre>
  </div></div></div>`;
  renderPerms(); out();
}
function optHtml(o,i){return `
  <div class="opt"><button class="danger del" onclick="C.options.splice(${i},1);render()">✕</button>
  <div class="row"><div><label>Type</label><select onchange="C.options[${i}].type=+this.value;render()">${Object.entries(OPT_TYPES).map(([k,v])=>`<option value="${k}" ${o.type==k?'selected':''}>${k} — ${v}</option>`).join('')}</select></div>
  <div><label>Name</label><input type="text" value="${o.name}" oninput="C.options[${i}].name=this.value;out()"></div></div>
  <label>Description</label><input type="text" value="${o.description}" oninput="C.options[${i}].description=this.value;out()">
  <label class="chk"><input type="checkbox" ${o.required?'checked':''} onchange="C.options[${i}].required=this.checked"> Required</label>
  <label class="chk"><input type="checkbox" ${o.autocomplete?'checked':''} onchange="C.options[${i}].autocomplete=this.checked"> Autocomplete</label>
  <div class="row"><div><label>Min (numeric)</label><input type="number" value="${o.min??''}" oninput="C.options[${i}].min=this.value===''?null:+this.value"></div>
  <div><label>Max (numeric)</label><input type="number" value="${o.max??''}" oninput="C.options[${i}].max=this.value===''?null:+this.value"></div></div>
  <label>Choices (name=value per line)</label><textarea rows="2" oninput="C.options[${i}].choices=this.value.split('\n').filter(l=>l.includes('=')).map(l=>({name:l.split('=')[0],value:l.split('=').slice(1).join('=')}));out()">${o.choices.map(c=>c.name+'='+c.value).join('\n')}</textarea>
  </div>`}
function renderPerms(){
  const el=document.getElementById('perms'); if(!el)return;
  let cur; try{cur=BigInt(C.default_member_permissions||'0')}catch{cur=0n; C.default_member_permissions='0'}
  el.innerHTML=DATA.permissions.map(g=>`<div style="margin:4px 0"><div class="hint">${g.category}</div>${g.permissions.map(p=>`<label class="chk"><input type="checkbox" ${cur&BigInt(p.value)?'checked':''} onchange="permToggle('${p.value}',this.checked)"> ${p.name}</label>`).join('')}</div>`).join('');
}
function permToggle(v,on){ let cur=BigInt(C.default_member_permissions||'0'); cur = on? cur|BigInt(v) : cur&~BigInt(v); C.default_member_permissions=cur.toString(); out(); }
function clean(o){const c={};for(const[k,v]of Object.entries(o)){if(v===''||v===null||v===false||(Array.isArray(v)&&!v.length))continue;c[k]=v}return c}
function toJson(){
  const d={type:C.type,name:C.name};
  if(C.type===1){d.description=C.description;if(C.nsfw)d.nsfw=true;
    if(C.default_member_permissions&&C.default_member_permissions!=='0')d.default_member_permissions=C.default_member_permissions;
    const opts=C.options.filter(o=>o.name).map(o=>{const numeric=o.type===4||o.type===10;const x=clean({type:o.type,name:o.name,description:o.description,required:o.required,autocomplete:o.autocomplete,min_value:numeric?o.min??undefined:undefined,max_value:numeric?o.max??undefined:undefined});if(o.choices.length)x.choices=o.choices.map(c=>({name:c.name,value:isNaN(+c.value)?c.value:+c.value}));return x});
    if(opts.length)d.options=opts;}
  else{ if(C.nsfw)d.nsfw=true; if(C.default_member_permissions&&C.default_member_permissions!=='0')d.default_member_permissions=C.default_member_permissions; }
  return d;
}
function toDjs(){
  if(C.type===1){
    let s=`const { SlashCommandBuilder } = require("discord.js")\n\nmodule.exports = new SlashCommandBuilder()\n    .setName("${C.name}")\n    .setDescription("${C.description}")`;
    if(C.nsfw)s+=`\n    .setNSFW(true)`;
    if(C.default_member_permissions&&C.default_member_permissions!=='0')s+=`\n    .setDefaultMemberPermissions(BigInt("${C.default_member_permissions}"))`;
    for(const o of C.options.filter(o=>o.name)){
      const t={3:'String',4:'Integer',5:'Boolean',6:'User',7:'Channel',8:'Role',9:'Mentionable',10:'Number',11:'Attachment'}[o.type];
      s+=`\n    .add${t}Option(opt => opt`;
      s+=`\n        .setName("${o.name}")\n        .setDescription("${o.description}")`;
      if(o.required)s+=`\n        .setRequired(true)`;
      if(o.autocomplete)s+=`\n        .setAutocomplete(true)`;
      if((o.type===4||o.type===10)&&o.min!=null)s+=`\n        .setMinValue(${o.min})`;
      if((o.type===4||o.type===10)&&o.max!=null)s+=`\n        .setMaxValue(${o.max})`;
      for(const c of o.choices)s+=`\n        .addChoices({ name: "${c.name}", value: "${c.value}" })`;
      s+=`\n    )`;
    }
    return s;
  }
  return `const { ContextMenuCommandBuilder, ApplicationCommandType } = require("discord.js")\n\nmodule.exports = new ContextMenuCommandBuilder()\n    .setName("${C.name}")\n    .setType(ApplicationCommandType.${C.type===2?'User':'Message'})`;
}
function out(){ window.OUT={json:JSON.stringify(toJson(),null,2),djs:toDjs()}; const el=document.getElementById('out'); if(el)el.textContent=window.OUT[window.CUR||'json']; }
function showOut(btn,t){document.querySelectorAll('.tabs button').forEach(b=>b.classList.remove('on'));btn.classList.add('on');window.CUR=t;document.getElementById('out').textContent=window.OUT[t]}
function importJson(){
  const t=prompt('Paste application command JSON'); if(!t)return;
  try{const j=JSON.parse(t);C={type:j.type||1,name:j.name||'',description:j.description||'',default_member_permissions:String(j.default_member_permissions??'0'),nsfw:!!j.nsfw,options:(j.options||[]).map(o=>({type:o.type||3,name:o.name||'',description:o.description||'',required:!!o.required,autocomplete:!!o.autocomplete,min:o.min_value??null,max:o.max_value??null,choices:(o.choices||[]).map(c=>({name:c.name,value:String(c.value)}))}))};render()}catch(e){alert('Invalid JSON: '+e.message)}
}
function copyOut(){navigator.clipboard.writeText(window.OUT[window.CUR||'json'])}
render();
"""

# ---------------------------------------------------------------- tool 3: permissions calculator

PC_JS = r"""
const sel=new Set(), scopes=new Set(DATA.scopes.filter(s=>s.checked).map(s=>s.name));
let clientId='',redirect='';
function render(){
  document.getElementById('app').innerHTML=`
  <div class="grid"><div class="panel"><h2>Permissions</h2>
    <button class="ghost" onclick="all(true)">Select All</button> <button class="ghost" onclick="all(false)">Clear All</button>
    ${DATA.permissions.map((g,gi)=>`<details ${gi===0?'open':''}><summary>${g.category}</summary>
      ${g.permissions.map(p=>`<label class="chk" title="${p.description.replace(/"/g,'&quot;')}"><input type="checkbox" ${sel.has(p.name)?'checked':''} onchange="t('${p.name}',this.checked)"> ${p.name} <small>${p.value}</small></label>`).join('')}
    </details>`).join('')}
  </div>
  <div><div class="panel"><h2>Bot configuration</h2>
    <label>Client ID</label><input type="text" oninput="clientId=this.value;out()">
    <label>Redirect URI (optional)</label><input type="text" oninput="redirect=this.value;out()">
    <details><summary>OAuth2 scopes</summary>
      ${DATA.scopes.map(s=>`<label class="chk"><input type="checkbox" ${scopes.has(s.name)?'checked':''} onchange="sc('${s.name}',this.checked)"> ${s.name}${s.requiresApproval?'<span class="badge p">approval</span>':''}<small>${s.description.slice(0,50)}</small></label>`).join('')}
    </details>
  </div>
  <div class="panel"><h2>Generated output</h2>
    <label>Permissions integer</label><div class="bigint" id="pint">0</div>
    <label>Invite link</label><pre id="link"></pre>
    <button class="ghost" onclick="copyLink()">Copy invite link</button>
    <div id="adminwarn"></div>
  </div></div></div>`;
  out();
}
function t(n,on){on?sel.add(n):sel.delete(n);out()}
function sc(n,on){on?scopes.add(n):scopes.delete(n);out()}
function all(on){ if(on){DATA.permissions.forEach(g=>g.permissions.forEach(p=>sel.add(p.name)))} else sel.clear(); render(); }
function value(){let v=0n;for(const g of DATA.permissions)for(const p of g.permissions)if(sel.has(p.name))v|=BigInt(p.value);return v}
function out(){
  const v=value(); document.getElementById('pint').textContent=v.toString();
  const sc=[...scopes].join('%20')||'bot';
  let link=`https://discord.com/oauth2/authorize?client_id=${clientId||'YOUR_CLIENT_ID'}&permissions=${v}&scope=${sc}`;
  if(redirect)link+=`&redirect_uri=${encodeURIComponent(redirect)}`;
  document.getElementById('link').textContent=link;
  document.getElementById('adminwarn').innerHTML = sel.has('Administrator')?'<div class="warnbox">⚠️ Administrator grants every permission — avoid it in production invites.</div>':'';
}
function copyLink(){navigator.clipboard.writeText(document.getElementById('link').textContent)}
render();
"""

# ---------------------------------------------------------------- tool 4: intents calculator

IC_JS = r"""
const sel=new Set();
function render(){
  document.getElementById('app').innerHTML=`
  <div class="grid"><div class="panel"><h2>Gateway intents</h2>
    <label>Preset</label><select onchange="preset(this.value)">${Object.keys(DATA.presets).map(p=>`<option>${p}</option>`).join('')}</select>
    <h2>Standard</h2>
    ${DATA.intents.filter(i=>!i.privileged).map(i=>chk(i)).join('')}
    <h2>Privileged</h2>
    ${DATA.intents.filter(i=>i.privileged).map(i=>chk(i)).join('')}
  </div>
  <div><div class="panel"><h2>Output</h2>
    <label>Bitwise sum</label><div class="bigint" id="sum">0</div>
    <div id="privwarn"></div>
    <details open><summary>How to use in code</summary>
      <div class="tabs">
        <button class="on" onclick="lang(this,'djs')">discord.js</button>
        <button onclick="lang(this,'py')">discord.py</button>
        <button onclick="lang(this,'go')">discord.go</button>
        <button onclick="lang(this,'fs')">ForgeScript</button>
      </div>
      <pre id="code"></pre>
    </details>
    <details><summary>Active events</summary><div id="ev"></div></details>
  </div></div></div>`;
  out();
}
function chk(i){return `<label class="chk" title="${(i.description||'').replace(/"/g,'&quot;')}"><input type="checkbox" ${sel.has(i.name)?'checked':''} onchange="t('${i.name}',this.checked)"> ${i.name}${i.privileged?'<span class="badge p">P</span>':''} <small>${i.value}</small></label>`}
function t(n,on){on?sel.add(n):sel.delete(n);out()}
function preset(name){ const list=DATA.presets[name]; if(list===null)return; sel.clear(); list.forEach(n=>sel.add(n)); render(); }
function out(){
  const chosen=DATA.intents.filter(i=>sel.has(i.name));
  const sum=chosen.reduce((a,i)=>a|BigInt(i.value),0n);
  document.getElementById('sum').textContent=sum.toString();
  const priv=chosen.filter(i=>i.privileged).map(i=>i.name);
  document.getElementById('privwarn').innerHTML=priv.length?`<div class="warnbox">⚠️ Privileged intents required: <b>${priv.join(', ')}</b> — must be toggled in the <a style="color:#9cc3e5" href="https://discord.com/developers/applications">Developer Portal</a> or the gateway refuses the connection.</div>`:'';
  window.LANG=window.LANG||'djs'; code();
  const active=DATA.gwEvents.filter(e=>(e.intents||[]).every(i=>sel.has(i))||(e.intents||[]).length===0);
  document.getElementById('ev').innerHTML=active.map(e=>`<label class="chk">⚡ ${e.name} <small>${e.description.slice(0,60)}</small></label>`).join('')||'<span class="hint">none</span>';
}
function code(){
  const chosen=DATA.intents.filter(i=>sel.has(i.name));
  let s='';
  if(window.LANG==='djs'){ s='const { Client, GatewayIntentBits, Partials } = require("discord.js")\n\nconst client = new Client({\n    intents: [\n'+chosen.map(i=>`        GatewayIntentBits.${i.name}`).join(',\n')+'\n    ]\n})'; }
  else if(window.LANG==='py'){ s='import discord\n\nintents = discord.Intents.none()\n'+chosen.map(i=>`intents.${i.py} = True`).join('\n')+'\n\nclient = discord.Client(intents=intents)'; }
  else if(window.LANG==='go'){ s='import (\n    "github.com/bwmarrin/discordgo"\n)\n\nvar intents = '+ (chosen.length?chosen.map(i=>`discordgo.${i.go}`).join(' |\n    '):'0')+'\n\n// dg.Identify.Intents = intents'; }
  else { s='const { ForgeClient } = require("@tryforge/forgescript")\n\nconst client = new ForgeClient({\n    intents: [ '+chosen.map(i=>`"${i.name}"`).join(', ')+' ],\n    events: [ /* your events here */ ]\n})'; }
  document.getElementById('code').textContent=s;
}
function lang(btn,l){document.querySelectorAll('.tabs button').forEach(b=>b.classList.remove('on'));btn.classList.add('on');window.LANG=l;code()}
render();
"""

# ---------------------------------------------------------------- emit

os.makedirs(OUT, exist_ok=True)
files = {
    'client-generator.html': page('BotForge Client Generator',
        'Builds index.js + package.json for a ForgeScript bot with options, extensions and events→intents computation',
        CG_JS),
    'app-commands-builder.html': page('Application Commands Builder',
        'Visually build slash commands and context menus — export raw JSON or discord.js code',
        AB_JS),
    'permissions-calculator.html': page('Permissions Calculator',
        '52 Discord permissions → integer + OAuth2 invite link with scope picker',
        PC_JS),
    'intents-calculator.html': page('Gateway Intents Calculator',
        '21 gateway intents → bitwise sum, privileged warnings, code gen for discord.js / discord.py / discord.go / ForgeScript',
        IC_JS),
}
for name, html in files.items():
    open(f'{OUT}/{name}', 'w', encoding='utf-8').write(html)
    print(f'{name}: {len(html)//1024}KB')
print('done ->', OUT)

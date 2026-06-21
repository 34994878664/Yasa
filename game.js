(() => {
'use strict';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = 960, H = 640;
const SAVE_KEY = 'cute-abyss-save-v1';

const $ = (id) => document.getElementById(id);
const hudHearts = $('hearts');
const statsLine = $('statsLine');
const dealLine = $('dealLine');
const miniMap = $('miniMap');
const modal = $('modal');
const toastEl = $('toast');
const itemDock = $('itemDock');
const nextRoomBtn = $('btnNextRoom') || (()=>{ const b=document.createElement('button'); b.id='btnNextRoom'; b.className='nextRoomBtn hidden'; b.textContent='进门 / 下一房间'; document.getElementById('gameWrap').appendChild(b); return b; })();

const R = Math.random;
const TAU = Math.PI * 2;
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const lerp = (a,b,t)=>a+(b-a)*t;
const dist = (a,b,c,d) => Math.hypot(a-c,b-d);
const angTo = (a,b,c,d) => Math.atan2(d-b,c-a);
const chance = (p) => R() < p;
const pick = (arr) => arr[(R()*arr.length)|0];
const keyOf = (x,y) => `${x},${y}`;
const fromKey = (k) => k.split(',').map(Number);

function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=(R()*(i+1))|0; [a[i],a[j]]=[a[j],a[i]]; } return a; }
function sample(arr,n){ return shuffle(arr.slice()).slice(0,n); }
function now(){ return performance.now()/1000; }


// 16x16 可爱素材包风格精灵表（本地 assets/sprites.png，GitHub Pages 可直接加载）
const spriteImg = new Image();
spriteImg.src = 'data:image/png;base64,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';
const SPR = {
  hero:[0,0], familiar:[1,0], orbital:[2,0], blob:[3,0], fly:[4,0], spitter:[5,0], charger:[6,0], splitter:[7,0], ghost:[8,0],
  bomber:[0,1], shield:[1,1], boss_blob:[2,1], boss_twins:[3,1], boss_doll:[4,1], boss_candle:[5,1], boss_chest:[6,1], boss_heart:[7,1],
  tear:[8,1], homing:[0,2], pierce:[1,2], knife:[2,2], coin:[3,2], key:[4,2], bomb:[5,2], heart:[6,2], soul:[7,2], black:[8,2],
  rock:[0,3], spike:[1,3], tile_floor:[2,3], tile_wall:[3,3], tile_gold:[4,3], tile_curse:[5,3], tile_shop:[6,3], tile_treasure:[7,3], tile_boss:[8,3]
};
function drawSprite(name,x,y,scale=3,rot=0,alpha=1){
  const sp = SPR[name];
  if(!sp || !spriteImg.complete || !spriteImg.naturalWidth) return false;
  ctx.save(); ctx.translate(x,y); ctx.rotate(rot); ctx.globalAlpha *= alpha;
  ctx.imageSmoothingEnabled = false;
  const size = 16*scale;
  ctx.drawImage(spriteImg, sp[0]*16, sp[1]*16, 16, 16, -size/2, -size/2, size, size);
  ctx.restore();
  ctx.imageSmoothingEnabled = true;
  return true;
}
function enemySprite(e){ return e.boss ? e.bossType : e.type; }
function pickupSprite(t){ return t==='coin'?'coin':t==='key'?'key':t==='bomb'?'bomb':t==='heart'?'heart':t==='soul'?'soul':t==='black'?'black':'coin'; }

// 轻量音频系统：不依赖外链，手机点击开始后才会启动；BGM 有独立开关。
const audioSys = { ctx:null, music:false, sfx:true, bgmTimer:null, step:0, last:{}, master:null };
const bgmNotes = [196,0,247,0,262,0,294,0,330,294,262,247,196,0,165,0,196,0,247,0,262,0,392,0,330,294,262,247,220,0,196,0];
function getAudio(){
  const AC = window.AudioContext || window.webkitAudioContext;
  if(!AC) return null;
  if(!audioSys.ctx){
    audioSys.ctx = new AC();
    audioSys.master = audioSys.ctx.createGain();
    audioSys.master.gain.value = .22;
    audioSys.master.connect(audioSys.ctx.destination);
  }
  if(audioSys.ctx.state === 'suspended') audioSys.ctx.resume().catch(()=>{});
  return audioSys.ctx;
}
function tone(freq,dur=.08,type='square',gain=.08,slide=0){
  const ac=getAudio(); if(!ac) return;
  const t=ac.currentTime;
  const o=ac.createOscillator(), g=ac.createGain();
  o.type=type; o.frequency.setValueAtTime(freq,t);
  if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(40,freq+slide), t+dur);
  g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(gain,t+.01); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g); g.connect(audioSys.master || ac.destination); o.start(t); o.stop(t+dur+.02);
}
function sfx(name){
  if(!audioSys.sfx) return;
  const t=performance.now();
  if(audioSys.last[name] && t-audioSys.last[name]<45) return;
  audioSys.last[name]=t;
  if(name==='shoot'){ tone(720,.045,'square',.035,-180); }
  else if(name==='hit'){ tone(180,.035,'triangle',.06,-50); }
  else if(name==='kill'){ tone(260,.06,'sawtooth',.055,220); setTimeout(()=>tone(520,.05,'square',.04,-160),45); }
  else if(name==='hurt'){ tone(120,.13,'sawtooth',.09,-70); }
  else if(name==='pickup'){ tone(660,.06,'triangle',.055,180); }
  else if(name==='door'){ tone(392,.07,'square',.06,130); setTimeout(()=>tone(588,.08,'square',.045,0),70); }
  else if(name==='item'){ tone(523,.08,'triangle',.06,220); setTimeout(()=>tone(784,.10,'triangle',.05,0),80); }
  else if(name==='beam'){ tone(95,.10,'sawtooth',.035,25); }
  else if(name==='boss'){ tone(98,.18,'sawtooth',.08,-20); setTimeout(()=>tone(147,.18,'sawtooth',.06,-30),120); }
}
function playBgmStep(){
  if(!audioSys.music) return;
  const n = bgmNotes[audioSys.step++ % bgmNotes.length];
  if(n){ tone(n,.18,'triangle',.018,0); if(audioSys.step%8===0) tone(n/2,.22,'sine',.012,0); }
}
function setMusic(on){
  audioSys.music=!!on;
  const btn=$('btnMusic'); if(btn){ btn.textContent=audioSys.music?'BGM开':'BGM关'; btn.classList.toggle('active',audioSys.music); }
  localStorage.setItem('cute-abyss-bgm', audioSys.music?'1':'0');
  if(audioSys.music){ getAudio(); if(!audioSys.bgmTimer) audioSys.bgmTimer=setInterval(playBgmStep, 185); showToast('BGM已开启',900); }
  else { if(audioSys.bgmTimer){ clearInterval(audioSys.bgmTimer); audioSys.bgmTimer=null; } showToast('BGM已关闭',900); }
}

function showToast(text, ms=1900){
  toastEl.textContent = text;
  toastEl.classList.remove('hidden');
  clearTimeout(showToast.t);
  showToast.t = setTimeout(()=>toastEl.classList.add('hidden'), ms);
}

function resize(){
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.floor(innerWidth * dpr);
  canvas.height = Math.floor(innerHeight * dpr);
  ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);
}
addEventListener('resize', resize, {passive:true});
resize();

const QUALITY = ['普通','优秀','稀有','传奇','神话'];
const POOL_NAME = {treasure:'宝物房', boss:'Boss奖励', shop:'商店', angel:'天使房', devil:'恶魔房'};
const WEAPON_RANK = {tear:0, knife:4, beam:5, ring:6, bomb:3};

const ITEMS = [
  // Treasure / core tear modifiers
  {id:'round_tears',name:'圆滚滚眼泪',pool:'treasure',q:1,desc:'伤害+0.6，弹体变大。',e:{dmg:.6,size:1.15}},
  {id:'needle_tears',name:'针尖糖豆',pool:'treasure',q:2,desc:'射速+22%，弹速+15%。',e:{fireMul:1.22,bullet:1.15}},
  {id:'double_pupil',name:'双瞳贴纸',pool:'treasure',q:3,desc:'额外发射1颗眼泪，伤害略降。',e:{mult:1,dmgMul:.92}},
  {id:'triple_pupil',name:'三眼奶盖',pool:'treasure',q:4,desc:'额外发射2颗眼泪，散射更大。',e:{mult:2,spread:.14,dmgMul:.86}},
  {id:'rubber_drop',name:'橡皮泪珠',pool:'treasure',q:2,desc:'眼泪可以反弹1次。',e:{flag:{bounce:1}}},
  {id:'ghost_sugar',name:'幽灵棉花糖',pool:'treasure',q:2,desc:'子弹可穿过石头。',e:{flag:{spectral:1}}},
  {id:'silver_pin',name:'银针泪',pool:'treasure',q:3,desc:'子弹穿透敌人，伤害+0.4。',e:{dmg:.4,flag:{pierce:1}}},
  {id:'magnet_eye',name:'小磁眼',pool:'treasure',q:3,desc:'子弹轻微追踪敌人。',e:{flag:{homing:1},luck:1}},
  {id:'poison_jelly',name:'毒果冻',pool:'treasure',q:2,desc:'命中有概率中毒，幸运越高越稳定。',e:{flag:{poison:1},luck:1}},
  {id:'hot_pepper',name:'辣椒奶嘴',pool:'treasure',q:2,desc:'命中有概率灼烧。',e:{flag:{burn:1},dmg:.3}},
  {id:'ice_button',name:'冰纽扣',pool:'treasure',q:3,desc:'命中有概率冻结；冻结敌人死亡会碎裂。',e:{flag:{freeze:1},luck:1}},
  {id:'slow_moon',name:'月亮胶水',pool:'treasure',q:2,desc:'命中附带减速，射程+20%。',e:{flag:{slow:1},range:1.2}},
  {id:'split_seed',name:'分裂糖籽',pool:'treasure',q:3,desc:'子弹命中后分裂成小弹。',e:{flag:{split:1},dmgMul:.94}},
  {id:'coin_tooth',name:'金币乳牙',pool:'treasure',q:2,desc:'金币越多伤害越高。',e:{flag:{coinDamage:1}}},
  {id:'key_teeth',name:'钥匙虎牙',pool:'treasure',q:2,desc:'钥匙越多，暴击越高。',e:{flag:{keyCrit:1},luck:1}},
  {id:'bomb_gum',name:'泡泡炸弹糖',pool:'treasure',q:3,desc:'命中偶尔小爆炸。',e:{flag:{bombHit:1},bombs:2}},
  {id:'orbit_cookie',name:'环绕饼干',pool:'treasure',q:2,desc:'获得1个护身饼干，碰撞伤害敌人。',e:{orbitals:1}},
  {id:'little_bat',name:'跟班小蝙蝠',pool:'treasure',q:3,desc:'召唤跟班自动射击。',e:{familiars:1}},
  {id:'little_angel',name:'跟班小灯泡',pool:'treasure',q:3,desc:'召唤跟班发射圣光弹。',e:{familiars:1,flag:{holySpark:1}}},
  {id:'speed_sock',name:'滑溜袜子',pool:'treasure',q:1,desc:'移速+12%，射程+10%。',e:{speed:1.12,range:1.1}},
  {id:'range_crayon',name:'长长蜡笔',pool:'treasure',q:1,desc:'射程+35%，弹速+10%。',e:{range:1.35,bullet:1.1}},
  {id:'lucky_clover',name:'四叶软糖',pool:'treasure',q:2,desc:'幸运+3，掉落更好。',e:{luck:3}},
  {id:'milk_engine',name:'牛奶引擎',pool:'treasure',q:3,desc:'射速+38%，伤害-8%。',e:{fireMul:1.38,dmgMul:.92}},
  {id:'stone_heart',name:'石头心',pool:'treasure',q:2,desc:'红心上限+1，移速略降。',e:{maxRed:2,heal:2,speed:.94}},
  {id:'soul_bubble',name:'魂泡泡',pool:'treasure',q:2,desc:'获得2颗魂心。魂心挡伤不破无红伤。',e:{soul:4}},
  {id:'glass_cannon_seed',name:'玻璃糖炮',pool:'treasure',q:4,desc:'伤害大幅提升，但红心上限-1。',e:{dmg:2.2,maxRed:-2}},
  {id:'cute_knife',name:'玩具血刃',pool:'treasure',q:4,desc:'把眼泪替换成蓄力感飞刃：高伤害、穿透、会回旋。',e:{weapon:'knife',dmg:1.1,fireMul:.72,flag:{pierce:1,spectral:1}}},
  {id:'abyss_beam',name:'深渊奶昔光束',pool:'treasure',q:4,desc:'把眼泪替换成穿透光束：清线能力极强。',e:{weapon:'beam',dmg:.8,fireMul:.62,flag:{spectral:1,pierce:1}}},
  {id:'halo_laser',name:'甜甜圈激光',pool:'treasure',q:4,desc:'把眼泪替换成环形激光波：穿透范围伤害。',e:{weapon:'ring',dmg:.7,fireMul:.70,flag:{pierce:1}}},
  {id:'battery_eye',name:'电池义眼',pool:'treasure',q:3,desc:'使用光束/环形/飞刃类武器时额外放出电弧。',e:{flag:{arc:1},luck:1}},
  {id:'star_worm',name:'星星虫',pool:'treasure',q:3,desc:'环形激光变成星形脉冲，范围更大。',e:{flag:{starRing:1},size:1.1}},
  {id:'knife_ring',name:'刃环贴纸',pool:'treasure',q:4,desc:'飞刃周围生成小环形激光。飞刃/环形BD联动核心。',e:{flag:{knifeRing:1},dmg:.4}},
  {id:'beam_fork',name:'分叉吸管',pool:'treasure',q:3,desc:'光束武器会分叉成弱侧光束。',e:{flag:{beamFork:1},dmgMul:.96}},
  {id:'tear_cloud',name:'云朵肺',pool:'treasure',q:3,desc:'每次射击额外喷出3颗短程散弹。',e:{flag:{lung:1},fireMul:.86}},
  {id:'charm_perfume',name:'魅惑香水',pool:'treasure',q:2,desc:'命中有概率魅惑小怪。',e:{flag:{charm:1},luck:1}},
  {id:'thorn_body',name:'软刺外套',pool:'treasure',q:2,desc:'碰撞敌人时反弹并造成伤害。',e:{flag:{contact:1},maxRed:2,heal:2}},
  {id:'mini_mantle',name:'小披风',pool:'treasure',q:4,desc:'每个房间第一次受伤无效。',e:{flag:{mantle:1}}},
  {id:'reroll_dice',name:'软糖骰子',pool:'treasure',q:3,desc:'之后每个宝物房多1个选择。',e:{flag:{extraChoice:1},luck:1}},
  {id:'bookworm_sticker',name:'书虫贴纸',pool:'treasure',q:3,desc:'偶尔复制一次射击。',e:{flag:{bookworm:1},fireMul:1.08}},
  {id:'tiny_planet',name:'小小星球',pool:'treasure',q:3,desc:'部分子弹绕你旋转后飞出，保护近身。',e:{flag:{tinyPlanet:1},range:1.1}},
  {id:'rainbow_jam',name:'彩虹果酱',pool:'treasure',q:4,desc:'每次命中随机附带毒/火/冰/魅惑之一。',e:{flag:{rainbow:1},luck:2}},
  {id:'paper_crown',name:'纸王冠',pool:'treasure',q:4,desc:'清房无伤时永久伤害+0.08，滚雪球BD。',e:{flag:{flawlessScale:1}}},
  {id:'heart_engine',name:'心跳引擎',pool:'treasure',q:3,desc:'血量越高伤害越高；满血时最强。',e:{flag:{highHpDamage:1},maxRed:2,heal:2}},
  {id:'last_cookie',name:'最后一块饼',pool:'treasure',q:3,desc:'低血时射速和伤害上升。',e:{flag:{lowHpRage:1}}},

  // Boss rewards
  {id:'boss_meat',name:'软肉丸',pool:'boss',q:1,desc:'红心上限+1，伤害+0.3。',e:{maxRed:2,heal:2,dmg:.3}},
  {id:'boss_syringe',name:'甜筒针筒',pool:'boss',q:2,desc:'射速+20%，移速+8%。',e:{fireMul:1.20,speed:1.08}},
  {id:'boss_lunch',name:'午餐盒',pool:'boss',q:1,desc:'红心上限+1，回复1红心。',e:{maxRed:2,heal:2}},
  {id:'boss_crown',name:'小王冠',pool:'boss',q:3,desc:'伤害+1，幸运+1。',e:{dmg:1,luck:1}},
  {id:'boss_wings',name:'纸翅膀',pool:'boss',q:2,desc:'移速+18%，获得魂心。',e:{speed:1.18,soul:2}},
  {id:'boss_scope',name:'玩具瞄准镜',pool:'boss',q:2,desc:'射程+25%，弹速+20%，追踪略强。',e:{range:1.25,bullet:1.2,flag:{homing:1}}},
  {id:'boss_trophy',name:'地牢奖杯',pool:'boss',q:3,desc:'伤害+0.7，射速+12%。',e:{dmg:.7,fireMul:1.12}},
  {id:'boss_battery',name:'心电池',pool:'boss',q:3,desc:'每层开始获得1魂心；光束武器冷却更短。',e:{flag:{floorSoul:1},fireMul:1.08}},
  {id:'boss_shield',name:'木头盾',pool:'boss',q:2,desc:'每层开始获得临时护盾，受伤先消耗。',e:{flag:{roomShield:1}}},
  {id:'boss_candybag',name:'糖果袋',pool:'boss',q:2,desc:'金币+8、钥匙+1、炸弹+1。',e:{coins:8,keys:1,bombs:1}},
  {id:'boss_redpepper',name:'Boss辣椒',pool:'boss',q:3,desc:'伤害+0.5，灼烧概率提升。',e:{dmg:.5,flag:{burn:1}}},
  {id:'boss_shell',name:'蜗牛壳',pool:'boss',q:2,desc:'受伤后短时间无敌更久。',e:{flag:{longIFrame:1},maxRed:2,heal:1}},

  // Shop
  {id:'shop_coupon',name:'优惠券猫',pool:'shop',q:3,desc:'商店商品更便宜，并立刻给金币+5。',price:12,e:{flag:{discount:1},coins:5}},
  {id:'shop_keyring',name:'钥匙圈',pool:'shop',q:2,desc:'钥匙+3，宝物房选择+1。',price:10,e:{keys:3,flag:{extraChoice:1}}},
  {id:'shop_piggy',name:'小猪储钱罐',pool:'shop',q:2,desc:'受伤时掉金币，但金币越多伤害越高。',price:12,e:{flag:{piggy:1,coinDamage:1}}},
  {id:'shop_compass',name:'软糖罗盘',pool:'shop',q:2,desc:'显示特殊房概率，并提升天使/恶魔门概率。',price:15,e:{flag:{compass:1},luck:1}},
  {id:'shop_bombbox',name:'炸弹盒',pool:'shop',q:2,desc:'炸弹+5，爆炸BD增强。',price:10,e:{bombs:5,flag:{bombHit:1}}},
  {id:'shop_souljar',name:'魂心罐',pool:'shop',q:3,desc:'获得3魂心。',price:15,e:{soul:6}},
  {id:'shop_map',name:'皱巴巴地图',pool:'shop',q:1,desc:'地图常开；移速+5%。',price:8,e:{flag:{map:1},speed:1.05}},
  {id:'shop_needle',name:'便携针线',pool:'shop',q:2,desc:'射速+16%，幸运+1。',price:11,e:{fireMul:1.16,luck:1}},
  {id:'shop_snack',name:'急救零食',pool:'shop',q:1,desc:'回复红心，并增加一点射程。',price:6,e:{heal:3,range:1.06}},
  {id:'shop_familiar',name:'售货机宝宝',pool:'shop',q:3,desc:'获得一个发射硬币弹的跟班。',price:18,e:{familiars:1,flag:{coinDamage:1}}},

  // Angel: strong free sustain/defense/purity
  {id:'angel_halo',name:'奶油光环',pool:'angel',q:4,desc:'伤害+1.1，获得2魂心，命中偶尔落下圣光。',e:{dmg:1.1,soul:4,flag:{holyBeam:1}}},
  {id:'angel_mantle',name:'白糖圣披风',pool:'angel',q:5,desc:'每个房间第一次受伤完全无效。',e:{flag:{mantle:1,angelRoute:1},soul:2}},
  {id:'angel_censer',name:'安眠香炉',pool:'angel',q:4,desc:'房间内敌人减速，子弹减速。',e:{flag:{auraSlow:1},luck:1,soul:2}},
  {id:'angel_lance',name:'圣糖长枪',pool:'angel',q:4,desc:'子弹穿透+追踪，伤害+1。',e:{dmg:1,flag:{pierce:1,homing:1,angelRoute:1}}},
  {id:'angel_revive',name:'小小复活铃',pool:'angel',q:5,desc:'死亡时复活一次，带4魂心。',e:{flag:{revive:1,angelRoute:1},soul:2}},
  {id:'angel_seraph',name:'六翼贴纸',pool:'angel',q:5,desc:'飞行感移动，获得2个圣光跟班。',e:{familiars:2,speed:1.12,soul:2,flag:{holySpark:1,angelRoute:1}}},
  {id:'angel_sword',name:'软糖圣剑',pool:'angel',q:5,desc:'高血量路线核心：满血时伤害大幅提高并释放圣光。',e:{dmg:1.2,flag:{highHpDamage:2,holyBeam:1,angelRoute:1},maxRed:2,heal:2}},
  {id:'angel_book',name:'云端故事书',pool:'angel',q:4,desc:'每清一个房间恢复少量魂心概率；幸运+2。',e:{luck:2,flag:{soulOnClear:1,angelRoute:1}}},
  {id:'angel_laser',name:'天堂环形灯',pool:'angel',q:5,desc:'获得环形激光波；若已有飞刃/光束则产生联动。',e:{weapon:'ring',dmg:1,fireMul:.82,flag:{holyBeam:1,starRing:1,angelRoute:1}}},
  {id:'angel_prism',name:'棱镜祷告',pool:'angel',q:4,desc:'光束分叉，环形激光范围提升。',e:{flag:{beamFork:1,starRing:1,angelRoute:1},size:1.2}},
  {id:'angel_crown',name:'无伤皇冠',pool:'angel',q:5,desc:'清房无伤永久成长翻倍；当前获得大量魂心。',e:{soul:6,flag:{flawlessScale:2,angelRoute:1}}},
  {id:'angel_bell',name:'叮当圣钟',pool:'angel',q:4,desc:'受伤后清屏小怪子弹，并伤害全场敌人。',e:{flag:{hurtNova:1,angelRoute:1},soul:4}},
  {id:'angel_key',name:'金边钥匙',pool:'angel',q:3,desc:'钥匙+4，之后宝物房不消耗钥匙概率。',e:{keys:4,flag:{freeTreasure:1,angelRoute:1}}},
  {id:'angel_pureheart',name:'永恒棉心',pool:'angel',q:4,desc:'红心上限+1，魂心+2，整局特殊房概率提升。',e:{maxRed:2,heal:2,soul:4,flag:{compass:1,angelRoute:1}}},
  {id:'angel_orbit',name:'守护云朵',pool:'angel',q:4,desc:'获得2个强力环绕物，可挡弹。',e:{orbitals:2,flag:{orbitBlock:1,angelRoute:1}}},
  {id:'angel_tears',name:'祝福泪雨',pool:'angel',q:4,desc:'多重射击+1，子弹偶尔变圣光。',e:{mult:1,flag:{holyBeam:1,angelRoute:1}}},
  {id:'angel_hymn',name:'圣歌磁带',pool:'angel',q:5,desc:'Boss战中伤害+25%，每层开始给魂心。',e:{flag:{bossDmg:1,floorSoul:1,angelRoute:1},soul:2}},
  {id:'angel_cleanse',name:'净化橡皮',pool:'angel',q:4,desc:'移除低血惩罚，红心上限+1，幸运+2。',e:{maxRed:2,heal:2,luck:2,flag:{cleanse:1,angelRoute:1}}},

  // Devil: strong cost/burst/black hearts
  {id:'devil_brim',name:'深红吸管光束',pool:'devil',q:5,cost:4,desc:'用2红心上限交易：眼泪变成高伤穿透光束。',e:{weapon:'beam',dmg:2.0,fireMul:.55,black:2,flag:{pierce:1,spectral:1,devilRoute:1}}},
  {id:'devil_knife',name:'黑糖屠刃',pool:'devil',q:5,cost:4,desc:'用2红心上限交易：获得超高伤害回旋飞刃。',e:{weapon:'knife',dmg:2.2,fireMul:.65,black:2,flag:{pierce:1,spectral:1,devilRoute:1}}},
  {id:'devil_ring',name:'禁忌环切激光',pool:'devil',q:5,cost:4,desc:'用2红心上限交易：获得强力环形激光波。',e:{weapon:'ring',dmg:1.7,fireMul:.62,black:2,flag:{starRing:1,pierce:1,devilRoute:1}}},
  {id:'devil_pact',name:'小恶魔契约',pool:'devil',q:4,cost:2,desc:'伤害+2，射速+20%，获得黑心。',e:{dmg:2,fireMul:1.2,black:2,flag:{devilRoute:1}}},
  {id:'devil_mark',name:'可爱恶魔印',pool:'devil',q:4,cost:2,desc:'伤害+1.2，移速+12%，黑心+1。',e:{dmg:1.2,speed:1.12,black:2,flag:{devilRoute:1}}},
  {id:'devil_whore',name:'低血小恶魔',pool:'devil',q:4,cost:2,desc:'低血时伤害/射速暴涨。',e:{flag:{lowHpRage:2,devilRoute:1},black:2}},
  {id:'devil_deadcat',name:'九命布偶猫',pool:'devil',q:5,cost:2,desc:'红心上限变低，但获得9命。',e:{setMaxRed:2,heal:2,flag:{nineLives:1,devilRoute:1},dmg:.5}},
  {id:'devil_blackcandle',name:'黑蜡烛奶油',pool:'devil',q:4,cost:2,desc:'特殊房概率提升，黑心+2，诅咒变成伤害。',e:{black:4,dmg:.8,flag:{compass:1,cursePower:1,devilRoute:1}}},
  {id:'devil_maw',name:'深渊小嘴',pool:'devil',q:4,cost:2,desc:'近身敌人会被黑洞吸住并掉黑心概率。',e:{flag:{maw:1,blackOnKill:1,devilRoute:1},dmg:.6}},
  {id:'devil_leviathan',name:'小利维坦尾巴',pool:'devil',q:5,cost:4,desc:'飞行感移动，伤害+1.5，黑心+3。',e:{dmg:1.5,speed:1.15,black:6,flag:{devilRoute:1}}},
  {id:'devil_triple',name:'三叉小角',pool:'devil',q:4,cost:2,desc:'额外发射2颗弹，但伤害略降。',e:{mult:2,dmgMul:.90,black:2,flag:{devilRoute:1}}},
  {id:'devil_bloodbank',name:'血糖银行',pool:'devil',q:4,cost:2,desc:'每失去红心上限，永久伤害提升；立刻+1.4伤害。',e:{dmg:1.4,flag:{dealDamage:1,devilRoute:1}}},
  {id:'devil_goat',name:'山羊糖头',pool:'devil',q:5,cost:4,desc:'之后Boss后几乎必开特殊房，但更偏恶魔房。',e:{flag:{goatHead:1,devilRoute:1},black:2,dmg:.8}},
  {id:'devil_bone',name:'黑骨跟班',pool:'devil',q:3,cost:2,desc:'召唤2个黑骨跟班。',e:{familiars:2,black:2,flag:{devilRoute:1}}},
  {id:'devil_teeth',name:'暴食虎牙',pool:'devil',q:4,cost:2,desc:'击杀回血概率，低血更强。',e:{flag:{vampKill:1,lowHpRage:1,devilRoute:1},dmg:.8}},
  {id:'devil_fury',name:'献祭狂热',pool:'devil',q:4,cost:2,desc:'每次受伤后短时间伤害翻倍。',e:{flag:{hurtRage:1,devilRoute:1},black:2}},
  {id:'devil_bombaby',name:'爆爆恶魔仔',pool:'devil',q:3,cost:2,desc:'爆炸命中更频繁，炸弹+4。',e:{bombs:4,flag:{bombHit:2,devilRoute:1}}},
  {id:'devil_shadow',name:'影子替身',pool:'devil',q:4,cost:2,desc:'濒死时变成影子形态并获得短暂无敌。',e:{flag:{shadowSave:1,devilRoute:1},black:2}},
];

const ITEM_MAP = Object.fromEntries(ITEMS.map(it=>[it.id,it]));
let enemyId = 1;

const input = {
  keys: {}, move:{x:0,y:0}, aim:{x:0,y:0}, mouseAim:null, auto:true,
  lastAim:{x:1,y:0}
};

const state = {
  mode:'menu', floor:1, maxFloor:6, rooms:new Map(), current:'0,0', room:null,
  player:null, projectiles:[], enemyProjectiles:[], beams:[], particles:[], pickups:[],
  lastTime:now(), paused:false, inModal:true, bossActive:null, pendingNext:false,
  floorRedDamage:false, bossRedDamage:false, seenDealLast:0, seenDealTwo:0, tookDevilDeal:false, refusedDevil:false,
  totalKills:0, flawlessRooms:0, runStart:Date.now()
};

function newPlayer(saved){
  const p = {
    x:W/2,y:H/2,r:17,
    maxRed:6, red:6, soul:0, black:0,
    damage:3.5, dmgMul:1, fireRate:2.9, speed:205, range:420, bulletSpeed:440, size:1, luck:0,
    mult:0, spread:.12, weapon:'tear', weaponRank:0,
    coins:0, keys:1, bombs:1, items:[], seenItems:[], flags:{},
    fireCd:0, inv:0, mantleReady:false, roomShield:0, revives:0, nineLives:0, orbitals:0, familiars:0,
    hurtRage:0, shadow:0, flawlessBonus:0
  };
  if(saved) Object.assign(p, saved, {x:W/2,y:H/2,fireCd:0,inv:1.2});
  p.flags = Object.assign({}, p.flags || {});
  p.items = p.items || [];
  p.seenItems = p.seenItems || p.items.slice();
  return p;
}

function resetRun(saved){
  state.floor = saved?.floor || 1;
  state.player = newPlayer(saved?.player);
  state.seenDealLast = saved?.seenDealLast || 0;
  state.seenDealTwo = saved?.seenDealTwo || 0;
  state.tookDevilDeal = !!saved?.tookDevilDeal;
  state.refusedDevil = !!saved?.refusedDevil;
  state.totalKills = saved?.totalKills || 0;
  state.flawlessRooms = saved?.flawlessRooms || 0;
  state.projectiles.length = 0; state.enemyProjectiles.length = 0; state.beams.length = 0; state.particles.length = 0; state.pickups.length = 0;
  state.runStart = Date.now();
  generateFloor();
  state.mode = 'play'; state.inModal = false; modal.classList.add('hidden'); state.paused=false;
  updateItemDock();
  showToast(saved ? '已读取轻量存档：从本层入口继续。出生房通常没怪，走进门才刷怪。' : '新局开始：出生房没怪，贴门或点“进门 / 下一房间”都会进入战斗房。', 3600);
}

function saveRun(){
  const p = state.player; if(!p) return;
  const safeP = {...p, x:W/2, y:H/2, fireCd:0, inv:0};
  delete safeP.lastHitBy;
  localStorage.setItem(SAVE_KEY, JSON.stringify({
    floor:state.floor, player:safeP, seenDealLast:state.seenDealLast, seenDealTwo:state.seenDealTwo,
    tookDevilDeal:state.tookDevilDeal, refusedDevil:state.refusedDevil, totalKills:state.totalKills, flawlessRooms:state.flawlessRooms,
    savedAt:Date.now()
  }));
}
function loadRun(){
  try{ const s = JSON.parse(localStorage.getItem(SAVE_KEY)||'null'); if(s?.player) return s; }catch(e){}
  return null;
}

function itemPool(pool){
  const owned = new Set(state.player?.seenItems || []);
  return ITEMS.filter(i=>i.pool===pool && !owned.has(i.id));
}
function chooseItems(pool, n=3){
  const arr = itemPool(pool);
  const weighted = [];
  for(const it of arr){
    const w = it.q>=5?2:it.q>=4?4:it.q>=3?7:11;
    for(let k=0;k<w;k++) weighted.push(it);
  }
  const out=[];
  while(out.length<n && weighted.length){
    const it = pick(weighted);
    if(!out.includes(it)) out.push(it);
    for(let i=weighted.length-1;i>=0;i--) if(weighted[i]===it) weighted.splice(i,1);
  }
  return out.length?out:sample(ITEMS.filter(i=>i.pool===pool), n);
}

function applyItem(it){
  const p = state.player, e = it.e || {};
  sfx('item');
  p.items.push(it.id); p.seenItems.push(it.id);
  if(e.setMaxRed !== undefined){ p.maxRed = e.setMaxRed; p.red = Math.min(p.red, p.maxRed); }
  if(e.maxRed) { p.maxRed = Math.max(2, p.maxRed + e.maxRed); if(e.maxRed>0) p.red += e.maxRed; }
  if(e.heal) p.red = Math.min(p.maxRed, p.red + e.heal);
  if(e.soul) p.soul += e.soul;
  if(e.black) p.black += e.black;
  if(e.coins) p.coins += e.coins;
  if(e.keys) p.keys += e.keys;
  if(e.bombs) p.bombs += e.bombs;
  if(e.dmg) p.damage += e.dmg;
  if(e.dmgMul) p.dmgMul *= e.dmgMul;
  if(e.fireMul) p.fireRate *= e.fireMul;
  if(e.speed) p.speed *= e.speed;
  if(e.range) p.range *= e.range;
  if(e.bullet) p.bulletSpeed *= e.bullet;
  if(e.size) p.size *= e.size;
  if(e.luck) p.luck += e.luck;
  if(e.mult) p.mult += e.mult;
  if(e.spread) p.spread += e.spread;
  if(e.orbitals){ p.orbitals += e.orbitals; }
  if(e.familiars){ p.familiars += e.familiars; }
  if(e.weapon){
    const r = WEAPON_RANK[e.weapon] || 0;
    if(r >= p.weaponRank){ p.weapon = e.weapon; p.weaponRank = r; }
  }
  if(e.flag){
    for(const [k,v] of Object.entries(e.flag)) p.flags[k] = (p.flags[k]||0) + v;
  }
  if(p.flags.revive) p.revives = Math.max(p.revives, 1);
  if(p.flags.nineLives) p.nineLives = Math.max(p.nineLives, 9);
  p.maxRed = Math.max(2, p.maxRed); p.red = clamp(p.red, 0, p.maxRed);
  p.fireRate = clamp(p.fireRate, .65, 9.5); p.speed = clamp(p.speed, 125, 330); p.range = clamp(p.range, 210, 760);
  if(p.flags.cleanse){ p.flags.lowHpRage = 0; }
  showToast(`获得：${it.name}（${QUALITY[it.q]||'神话'}）`, 1800);
  updateItemDock();
  saveRun();
}


function itemSymbol(it){
  const e = it.e || {}, f = e.flag || {};
  if(e.weapon==='knife') return '🗡';
  if(e.weapon==='beam') return '━';
  if(e.weapon==='ring') return '◉';
  if(it.pool==='angel') return '✦';
  if(it.pool==='devil') return '♆';
  if(f.homing) return '↺';
  if(f.pierce) return '➤';
  if(f.burn) return '🔥';
  if(f.freeze) return '❄';
  if(f.poison) return '☠';
  if(f.charm) return '❤';
  if(f.bombHit) return '💣';
  if(f.holyBeam) return '☼';
  if(e.familiars) return '◔';
  if(e.orbitals) return '◎';
  if(e.maxRed || e.heal) return '♥';
  if(e.soul) return '🛡';
  if(e.black) return '♠';
  if(e.dmg || e.dmgMul) return '⚔';
  if(e.fireMul) return '✷';
  if(e.speed) return '➠';
  if(e.luck) return '☘';
  return '◆';
}
function itemChipHtml(it, big=false){
  const cls = it.pool==='angel'?'angel':it.pool==='devil'?'devil':it.pool==='boss'?'boss':it.pool==='shop'?'shop':'';
  return `<div class="itemChip ${cls}" title="${it.name}"><span class="sym">${itemSymbol(it)}</span><span class="tier">${it.q||1}</span></div>`;
}
function updateItemDock(){
  if(!itemDock || !state.player) return;
  const ids = state.player.items || [];
  const sig = ids.join('|');
  if(state._dockSig === sig) return;
  state._dockSig = sig;
  if(!ids.length){ itemDock.classList.add('hidden'); itemDock.innerHTML=''; return; }
  const show = ids.slice(-8);
  itemDock.classList.remove('hidden');
  itemDock.innerHTML = show.map(id=> itemChipHtml(ITEM_MAP[id] || {name:id,pool:'treasure',q:1,e:{}}, false)).join('');
}
function bagTabs(active){
  return `<div class="bagTabs">
    <button class="tabBtn ${active==='current'?'active':''}" data-bag-tab="current">当前BD</button>
    <button class="tabBtn ${active==='stats'?'active':''}" data-bag-tab="stats">属性面板</button>
    <button class="tabBtn ${active==='codex'?'active':''}" data-bag-tab="codex">BD图鉴</button>
  </div>`;
}
function showBag(tab='current'){
  const p = state.player; if(!p) return;
  const items = (p.items||[]).map(id=>ITEM_MAP[id]).filter(Boolean);
  const weaponName = ({tear:'眼泪',knife:'飞刃',beam:'光束',ring:'环形激光'}[p.weapon]||'眼泪');
  const summary = `<div class="bagStats">共 ${items.length} 个BD · 武器：${weaponName} · 实战伤害 ${playerDamageValue().toFixed(1)} · 射速 ${p.fireRate.toFixed(1)} · 移速 ${Math.round(p.speed)}</div>`;
  let body='';
  if(tab==='current'){
    const cards = items.length ? items.map(it=>`<div class="bagCard"><div>${itemChipHtml(it, true)}</div><div class="bagMeta"><div class="q">${QUALITY[it.q]||'普通'} · ${POOL_NAME[it.pool]||'宝物房'}</div><h4>${it.name}</h4><div class="d">${it.desc}</div></div></div>`).join('') : '<p class="smallText">你身上还没有BD道具。先进宝物房、商店、Boss房、天使/恶魔房拿BD。</p>';
    body = `<div class="bagGrid">${cards}</div>`;
  } else if(tab==='stats'){
    const rows = [
      ['生命', `${Math.ceil(p.red/2)}/${Math.ceil(p.maxRed/2)} 红心 · ${Math.floor(p.soul/2)} 魂心 · ${Math.floor(p.black/2)} 黑心`],
      ['实战伤害', playerDamageValue().toFixed(2)],
      ['基础伤害', `${p.damage.toFixed(2)} × ${p.dmgMul.toFixed(2)} + 无伤成长 ${(p.flawlessBonus||0).toFixed(2)}`],
      ['射速', p.fireRate.toFixed(2)],
      ['移速', Math.round(p.speed)],
      ['射程', Math.round(p.range)],
      ['弹速', Math.round(p.bulletSpeed)],
      ['多重射击', `${1+p.mult} 发`],
      ['幸运', p.luck],
      ['金币/钥匙/炸弹', `${p.coins} / ${p.keys} / ${p.bombs}`],
      ['特殊房', `本层红伤：${state.floorRedDamage?'有':'无'} · Boss红伤：${state.bossRedDamage?'有':'无'} · 约 ${calcDealPreview()}%`]
    ].map(([k,v])=>`<div class="statRow"><b>${k}</b><span>${v}</span></div>`).join('');
    const flags = Object.keys(p.flags||{}).filter(k=>p.flags[k]).map(k=>`<span class="flagPill">${k}×${p.flags[k]}</span>`).join('') || '<span class="smallText">暂无特殊词条</span>';
    body = `<div class="statPanel">${rows}</div><h3>特殊词条</h3><div class="flagWrap">${flags}</div><p class="smallText">说明：这里的“实战伤害”会把高血增伤、低血狂暴、金币增伤、Boss增伤等动态BD算进去。</p>`;
  } else {
    const pools = ['treasure','boss','angel','devil','shop'];
    body = pools.map(pool=>{
      const arr = ITEMS.filter(it=>it.pool===pool);
      const cells = arr.map(it=>`<div class="codexCell ${pool}">${itemChipHtml(it,true)}<div><b>${it.name}</b><p>${QUALITY[it.q]||'普通'} · ${it.desc}</p></div></div>`).join('');
      return `<h3>${POOL_NAME[pool]||pool} · ${arr.length}个</h3><div class="codexGrid">${cells}</div>`;
    }).join('');
  }
  showModal(`<div class="bagTop"><h2>BD系统</h2>${summary}</div>${bagTabs(tab)}${body}<div class="row" style="margin-top:14px"><button class="bigBtn secondary" data-close-bag="1">关闭</button></div>`);
  modal.querySelectorAll('[data-bag-tab]').forEach(btn=>btn.onclick=()=>showBag(btn.dataset.bagTab));
  modal.querySelector('[data-close-bag]').onclick=()=>closeModal();
}

function showModal(html){
  modal.innerHTML = `<div class="panel">${html}</div>`;
  modal.classList.remove('hidden');
  state.inModal = true;
}
function closeModal(){
  modal.classList.add('hidden');
  state.inModal = false;
}

function itemCard(it, kind, costText='', disabled=false){
  const cls = kind==='angel'?'angel':kind==='devil'?'devil':'';
  const cost = costText ? `<div class="cost">${costText}</div>` : '';
  return `<div class="choiceCard ${cls}">
    <div class="choiceIcon">${itemChipHtml(it,true)}</div>
    <div class="q">${QUALITY[it.q] || '神话'} · ${POOL_NAME[it.pool]}</div>
    <h3>${it.name}</h3>
    <div class="d">${it.desc}</div>${cost}
    <button class="choiceBtn" data-pick="${it.id}" ${disabled?'disabled':''}>${disabled?'买不起':'选择'}</button>
  </div>`;
}
function showItemChoice(pool, title, text, opts={}){
  const extra = state.player.flags.extraChoice ? 1 : 0;
  const count = opts.count || Math.min(4, 3 + (pool==='treasure'?extra:0));
  const items = opts.items || chooseItems(pool, count);
  let cards = '';
  for(const it of items){
    let costText='', disabled=false;
    if(opts.devil){
      const c = it.cost || 2;
      costText = `代价：${c/2}红心上限`;
      disabled = state.player.maxRed <= c && (state.player.soul + state.player.black) < 6;
    }
    if(opts.shop){
      const price = Math.max(3, Math.round((it.price || 12) * (state.player.flags.discount ? .72 : 1)));
      it._shopPrice = price; costText = `价格：${price}金币`; disabled = state.player.coins < price;
    }
    cards += itemCard(it, opts.devil?'devil':opts.angel?'angel':'', costText, disabled);
  }
  showModal(`<h2>${title}</h2><p class="smallText">${text}</p><div class="choices">${cards}</div><div class="row" style="margin-top:14px"><button class="bigBtn secondary" data-skip="1">跳过</button></div>`);
  modal.querySelectorAll('[data-pick]').forEach(btn=>btn.onclick=()=>{
    const it = ITEMS.find(x=>x.id===btn.dataset.pick);
    if(opts.devil){
      const c = it.cost || 2;
      if(state.player.maxRed > c){ state.player.maxRed -= c; state.player.red = Math.min(state.player.red, state.player.maxRed); }
      else { state.player.soul = Math.max(0, state.player.soul-6); state.player.black = Math.max(0, state.player.black-(6-state.player.soul)); }
      state.tookDevilDeal = true; state.refusedDevil = false;
      if(state.player.flags.dealDamage) state.player.damage += .6;
    }
    if(opts.shop){ state.player.coins -= it._shopPrice || it.price || 12; }
    if(opts.angel){ state.refusedDevil = true; }
    applyItem(it); closeModal();
    if(opts.after) opts.after(it); else state.mode='play';
  });
  const skip = modal.querySelector('[data-skip]');
  skip.onclick=()=>{ closeModal(); if(opts.skip) opts.skip(); else if(opts.after) opts.after(null); };
}

function generateFloor(){
  state.rooms = new Map(); state.current='0,0';
  state.floorRedDamage=false; state.bossRedDamage=false; state.bossActive=null; state.pendingNext=false;
  state.projectiles.length=0; state.enemyProjectiles.length=0; state.beams.length=0; state.particles.length=0; state.pickups.length=0;
  const target = 8 + state.floor*2;
  state.rooms.set('0,0',{x:0,y:0,type:'start',visited:false,cleared:true,looted:true,enemies:[],obstacles:[]});
  let walkers=[{x:0,y:0}];
  const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
  let guard=0;
  while(state.rooms.size<target && guard++<800){
    const w=pick(walkers), d=pick(dirs); w.x+=d[0]; w.y+=d[1];
    if(Math.abs(w.x)>3) w.x-=d[0]; if(Math.abs(w.y)>3) w.y-=d[1];
    const k=keyOf(w.x,w.y);
    if(!state.rooms.has(k)) state.rooms.set(k,{x:w.x,y:w.y,type:'normal',visited:false,cleared:false,looted:false,enemies:[],obstacles:[]});
    if(chance(.28) && walkers.length<4) walkers.push({x:w.x,y:w.y});
  }
  const rooms = [...state.rooms.values()].filter(r=>r.type==='normal');
  const far = rooms.slice().sort((a,b)=>Math.hypot(b.x,b.y)-Math.hypot(a.x,a.y))[0];
  if(far) far.type='boss';
  const rest = rooms.filter(r=>r!==far);
  if(rest.length){ pick(rest).type='treasure'; }
  if(rest.length>2){ let s; do{s=pick(rest)}while(s.type!=='normal'); s.type='shop'; }
  if(rest.length>5){ let c; do{c=pick(rest)}while(c.type!=='normal'); c.type='curse'; }
  // 新手体验修复：开局出生房是安全房，但右侧一定接一个战斗房。
  // 这样玩家不会误以为“没有怪物”，往右走进门马上开打。
  state.rooms.set('1,0',{x:1,y:0,type:'normal',visited:false,cleared:false,looted:false,enemies:[],obstacles:[],tutorial:true});
  enterRoom('0,0', true);
  const p = state.player;
  p.x=W/2; p.y=H/2; p.mantleReady=!!p.flags.mantle; p.roomShield=p.flags.roomShield?1:0;
  if(p.flags.floorSoul) p.soul += 2;
  updateHud(); updateMiniMap(); saveRun();
}

function neighbors(k){
  const [x,y]=fromKey(k); return [[x+1,y,'R'],[x-1,y,'L'],[x,y+1,'D'],[x,y-1,'U']].filter(([a,b])=>state.rooms.has(keyOf(a,b)));
}

function enterRoom(k, first=false){
  const old = state.current; state.current=k; state.room = state.rooms.get(k); state.room.visited=true;
  state.projectiles.length=0; state.enemyProjectiles.length=0; state.beams.length=0; state.pickups.length=0;
  const p=state.player;
  if(p){ p.mantleReady=!!p.flags.mantle; p.roomShield=p.flags.roomShield?1:0; }
  if(!state.room._made){ makeRoom(state.room); state.room._made=true; }
  if(!state.room.cleared && state.room.enemies.length===0) spawnRoomEnemies(state.room);
  if(!first){
    if(state.room.type==='treasure' && !state.room.looted){ handleTreasureRoom(); }
    if(state.room.type==='shop' && !state.room.looted){ handleShop(); }
    if(state.room.type==='curse' && !state.room.looted){ handleCurseRoom(); }
  }
  updateMiniMap(); updateNextRoomButton();
}

function handleTreasureRoom(){
  const p=state.player;
  if(p.keys>0 || p.flags.freeTreasure){
    if(!p.flags.freeTreasure || !chance(.5)) p.keys--;
    state.room.looted=true; state.room.cleared=true;
    showItemChoice('treasure','宝物房','选择一个改变BD路线的核心道具。宝物房可能出现飞刃、光束、环形激光、多重、追踪、穿透等弹幕变化。');
  } else showToast('宝物房需要钥匙。先去清普通房找钥匙。',2300);
}
function handleShop(){
  state.room.looted=true; state.room.cleared=true;
  showItemChoice('shop','小卖部','用金币买道具。买不起可以跳过。',{shop:true, count:3});
}
function handleCurseRoom(){
  state.room.looted=true; state.room.cleared=true;
  const p=state.player;
  if(p.soul+p.black>0) damagePlayer(1,'curse',true); else damagePlayer(1,'curse');
  const pool = chance(.55)?'devil':'treasure';
  showItemChoice(pool,'诅咒房','进门会受伤，但可能提前拿到强力黑暗BD。',{count:3});
}

function makeRoom(r){
  r.obstacles=[];
  const n = r.type==='boss'?3:2+((R()*4)|0);
  for(let i=0;i<n;i++){
    const w=50+R()*60, h=38+R()*55;
    const x=130+R()*(W-260), y=115+R()*(H-230);
    if(dist(x,y,W/2,H/2)>130) r.obstacles.push({x,y,w,h,kind:chance(.15)?'spike':'rock'});
  }
  if(r.type==='treasure'||r.type==='shop'||r.type==='start') r.obstacles.length=0;
}

function spawnRoomEnemies(r){
  r.enemies=[];
  if(r.type==='boss') { r.enemies.push(makeBoss()); state.bossActive=r.enemies[0]; return; }
  if(r.type==='treasure'||r.type==='shop'||r.type==='start'||r.type==='curse'){ r.cleared=true; return; }
  const types = ['blob','fly','spitter','charger','splitter','ghost','bomber','shield'];
  const count = 3 + state.floor + ((R()*3)|0);
  for(let i=0;i<count;i++){
    const t = pick(types.slice(0, Math.min(types.length, 3+state.floor)));
    r.enemies.push(makeEnemy(t, 100+R()*(W-200), 110+R()*(H-220)));
  }
}

function makeEnemy(type,x,y){
  const f=state.floor;
  const base = {id:enemyId++, type, x,y, vx:0,vy:0, r:16, hp:9+f*4, maxHp:9+f*4, speed:70+f*5, dmg:1, cd:R(), status:{}, flash:0, dead:false};
  if(type==='fly') Object.assign(base,{r:13,hp:7+f*3,maxHp:7+f*3,speed:115+f*6});
  if(type==='spitter') Object.assign(base,{r:17,hp:12+f*5,maxHp:12+f*5,speed:45,shootCd:.6+R()});
  if(type==='charger') Object.assign(base,{r:19,hp:17+f*6,maxHp:17+f*6,speed:60,chargeCd:1+R()*1.5,charging:0});
  if(type==='splitter') Object.assign(base,{r:18,hp:16+f*5,maxHp:16+f*5,speed:58});
  if(type==='ghost') Object.assign(base,{r:15,hp:10+f*4,maxHp:10+f*4,speed:80,phase:R()*TAU});
  if(type==='bomber') Object.assign(base,{r:17,hp:14+f*4,maxHp:14+f*4,speed:55,shootCd:1.2});
  if(type==='shield') Object.assign(base,{r:20,hp:22+f*7,maxHp:22+f*7,speed:48,shield:1});
  return base;
}

function makeBoss(){
  const bosses = [
    {name:'泪眼布丁王', type:'boss_blob'},
    {name:'双生牙牙', type:'boss_twins'},
    {name:'裂口娃娃', type:'boss_doll'},
    {name:'烛火天使', type:'boss_candle'},
    {name:'贪婪宝箱怪', type:'boss_chest'},
    {name:'地下心跳', type:'boss_heart'},
  ];
  const b = bosses[Math.min(state.floor-1,bosses.length-1)];
  const hp = 130 + state.floor*85;
  return {id:enemyId++, boss:true, bossType:b.type, name:b.name, x:W/2,y:H/2-60,r:42,hp,maxHp:hp,speed:60,dmg:1,cd:1,phase:0,phaseTimer:0,status:{},flash:0,dead:false, splitSpawned:false};
}

function roomCleared(){ return state.room && state.room.enemies.every(e=>e.dead); }

function clearRoom(){
  const r=state.room; if(r.cleared) return;
  r.cleared=true;
  if(!state.floorRedDamage && state.player.flags.flawlessScale){
    const inc = .08 * state.player.flags.flawlessScale;
    state.player.damage += inc; state.flawlessRooms++;
    showToast(`无红伤清房：纸王冠成长 +${inc.toFixed(2)}伤害`,1500);
  }
  dropClearRewards(); updateMiniMap(); saveRun();
  if(r.type==='boss') handleBossClear();
  else showToast('房间清空，门打开了。',900);
}

function dropClearRewards(){
  const p=state.player;
  const luck = p.luck*.025;
  if(chance(.36+luck)) spawnPickup('coin', 460+R()*40, 305+R()*40);
  if(chance(.14+luck)) spawnPickup('key', 460+R()*40, 305+R()*40);
  if(chance(.12+luck)) spawnPickup('bomb', 460+R()*40, 305+R()*40);
  if(chance(.10+luck)) spawnPickup('heart', 460+R()*40, 305+R()*40);
  if(p.flags.soulOnClear && chance(.22+luck)) spawnPickup('soul', 460+R()*40, 305+R()*40);
}

function calcDeal(){
  const p=state.player;
  let val = 8 + p.luck*2;
  if(!state.floorRedDamage) val += 62;
  if(!state.bossRedDamage) val += 20;
  if(p.flags.compass) val += 10;
  if(p.flags.goatHead) val = 96;
  if(state.seenDealLast) val *= .35;
  else if(state.seenDealTwo) val *= .65;
  val = clamp(Math.round(val), 5, 96);
  let kind = 'devil';
  let angelChance = state.tookDevilDeal ? 8 : (state.refusedDevil ? 62 : 38);
  if(p.flags.angelRoute) angelChance += 12;
  if(p.flags.devilRoute || p.flags.goatHead) angelChance -= 18;
  angelChance = clamp(angelChance, 5, 85);
  if(chance(angelChance/100)) kind='angel';
  let dual = (!state.floorRedDamage && !state.bossRedDamage && !state.tookDevilDeal && state.floor>=2 && chance(.22 + p.luck*.015));
  return {chance:val, kind, angelChance, dual, open:chance(val/100)};
}

function handleBossClear(){
  state.bossActive=null;
  const deal = calcDeal();
  const afterBossItem = () => {
    if(deal.open) showDeal(deal);
    else showNextFloor(`这层特殊门没开。概率约 ${deal.chance}%。下层继续保护红心。`);
  };
  showItemChoice('boss','Boss奖励','Boss被击败！先选一个成长奖励。',{count:3, after:afterBossItem, skip:afterBossItem});
}

function showDeal(deal){
  state.seenDealTwo = state.seenDealLast; state.seenDealLast = 1;
  const perfect = !state.floorRedDamage && !state.bossRedDamage;
  if(deal.dual){
    showModal(`<h2>命运分叉：天使房 / 恶魔房</h2>
      <p class="smallText">完美层！你没有受到红心伤害。魂心/黑心挡伤不算破功。天使房免费且稳，恶魔房用血上限换爆发。</p>
      <div class="choices">
        <div class="choiceCard angel"><div class="q">强力免费奖励</div><h3>进入天使房</h3><div class="d">偏防御、复活、魂心、圣光、无伤成长。适合稳扎稳打。</div><button class="choiceBtn" data-deal-kind="angel">进天使房</button></div>
        <div class="choiceCard devil"><div class="q">强力献祭奖励</div><h3>进入恶魔房</h3><div class="d">偏光束、飞刃、环形激光、多重、低血狂暴。代价是红心上限。</div><button class="choiceBtn" data-deal-kind="devil">进恶魔房</button></div>
      </div>
      <div class="row" style="margin-top:14px"><button class="bigBtn secondary" data-skip-deal="1">都不进，去下一层</button></div>`);
    modal.querySelector('[data-deal-kind="angel"]').onclick=()=>showAngelRoom();
    modal.querySelector('[data-deal-kind="devil"]').onclick=()=>showDevilRoom();
    modal.querySelector('[data-skip-deal]').onclick=()=>{ state.refusedDevil=true; showNextFloor('你拒绝了诱惑。以后天使房概率更高。'); };
  } else if(deal.kind==='angel') showAngelRoom(perfect);
  else showDevilRoom(perfect);
}
function showAngelRoom(perfect=false){
  const after=()=>showNextFloor(perfect?'天使房奖励已获得。完美层路线成型！':'天使房奖励已获得。');
  showItemChoice('angel','天使房','强力免费奖励：偏魂心、防御、复活、圣光、无伤成长。',{angel:true,count:3,after,skip:()=>showNextFloor('你离开了天使房。')});
}
function showDevilRoom(perfect=false){
  const after=()=>showNextFloor(perfect?'恶魔交易完成。爆发路线启动！':'恶魔交易完成。');
  showItemChoice('devil','恶魔房','强力献祭奖励：用红心上限换飞刃/光束/环形激光/狂暴。拿了恶魔交易后，天使房会明显变少。',{devil:true,count:3,after,skip:()=>{ state.refusedDevil=true; showNextFloor('你拒绝了恶魔交易。以后天使房概率更高。'); }});
}
function showNextFloor(text){
  saveRun();
  if(state.floor >= state.maxFloor){
    showWin(); return;
  }
  showModal(`<h2>通往下一层</h2><p>${text}</p><p class="smallText">当前层：${state.floor}。下一层怪物、Boss和奖励都会更强。</p><button class="bigBtn" data-next-floor="1">进入第 ${state.floor+1} 层</button>`);
  modal.querySelector('[data-next-floor]').onclick=()=>{
    closeModal(); state.floor++; state.seenDealTwo = state.seenDealLast; state.seenDealLast = 0; generateFloor();
  };
}
function showWin(){
  localStorage.removeItem(SAVE_KEY);
  showModal(`<h2>通关！你击穿了萌渊地牢</h2><p>这局你击败了 ${state.totalKills} 个敌人，拿到 ${state.player.items.length} 个BD道具。</p><p class="smallText">可以把这个网页上传 GitHub Pages，朋友点链接即可玩。后续还能继续加角色、更多楼层、更多道具池。</p><button class="bigBtn" data-restart="1">再来一局</button>`);
  modal.querySelector('[data-restart]').onclick=()=>{ localStorage.removeItem(SAVE_KEY); resetRun(); };
}

function spawnPickup(type,x,y){ state.pickups.push({type,x,y,r:13,vy:-40,life:60}); }
function pickup(pu){
  const p=state.player;
  sfx('pickup');
  if(pu.type==='coin') p.coins++;
  if(pu.type==='key') p.keys++;
  if(pu.type==='bomb') p.bombs++;
  if(pu.type==='heart') p.red = Math.min(p.maxRed, p.red+2);
  if(pu.type==='soul') p.soul += 2;
  if(pu.type==='black') p.black += 2;
  pu.dead=true; updateHud();
}

function playerDamageValue(){
  const p=state.player;
  let d = p.damage * p.dmgMul + (p.flawlessBonus||0);
  const totalHp = p.red+p.soul+p.black;
  if(p.flags.highHpDamage) d *= 1 + Math.min(.85, totalHp/(p.maxRed+8) * .16 * p.flags.highHpDamage);
  if(p.flags.lowHpRage && p.red <= Math.max(2,p.maxRed*.45)) d *= 1 + .35*p.flags.lowHpRage;
  if(p.flags.coinDamage) d += Math.min(3.5, p.coins*.045*p.flags.coinDamage);
  if(p.flags.bossDmg && state.room?.type==='boss') d *= 1.25;
  if(p.hurtRage>0) d *= 1.8;
  if(p.flags.cursePower && p.maxRed<=4) d *= 1.15;
  return d;
}

function fireWeapon(dt){
  const p=state.player;
  p.fireCd -= dt;
  if(p.famCd === undefined) p.famCd=0; p.famCd-=dt;
  if(p.fireCd>0) return;
  const aim = getAimVector();
  if(!aim) return;
  input.lastAim = aim;
  let rate = p.fireRate;
  if(p.flags.lowHpRage && p.red <= Math.max(2,p.maxRed*.45)) rate *= 1+.25*p.flags.lowHpRage;
  p.fireCd = 1 / rate;
  const n = 1 + p.mult;
  const baseA = Math.atan2(aim.y,aim.x);
  const spread = p.spread + (n>2?.04:0);
  for(let i=0;i<n;i++){
    const off = (i-(n-1)/2)*spread;
    spawnPlayerShot(baseA+off, 1);
  }
  if(p.flags.bookworm && chance(.18+.02*p.luck)) spawnPlayerShot(baseA + (R()-.5)*.18, .75);
  if(p.flags.lung){ for(let i=0;i<3;i++) spawnPlayerShot(baseA+(R()-.5)*.7, .45, true); }
  sfx(p.weapon==='beam'?'beam':'shoot');
  if(p.familiars && p.famCd<=0){
    p.famCd=.55;
    for(let i=0;i<p.familiars;i++) spawnPlayerShot(baseA + (i-(p.familiars-1)/2)*.18, .42, false, true);
  }
}

function spawnPlayerShot(a, mult=1, short=false, familiar=false){
  const p=state.player;
  const d = playerDamageValue()*mult*(familiar?.48:1);
  const cx=p.x+Math.cos(a)*(p.r+8), cy=p.y+Math.sin(a)*(p.r+8);
  const common = {x:cx,y:cy,angle:a,damage:d,owner:'p',hit:{},life:short?.45:p.range/p.bulletSpeed, pierce:!!p.flags.pierce, spectral:!!p.flags.spectral, homing:p.flags.homing||0, bounce:p.flags.bounce||0, split:p.flags.split||0, bomb:p.flags.bombHit||0, r:(8*p.size)+(familiar?2:0), type:p.weapon};
  if(p.weapon==='beam'){
    spawnBeam(a,d, familiar?.45:1); addParticle(cx,cy,'#ff7bb0',5,'spark'); return;
  }
  if(p.weapon==='ring'){
    state.projectiles.push({...common,type:'ring',vx:Math.cos(a)*p.bulletSpeed*.58,vy:Math.sin(a)*p.bulletSpeed*.58,life:short?.55:1.0,rad:18*p.size,thick:(p.flags.starRing?15:10)*p.size}); addParticle(cx,cy,'#ffb5e1',6,'ring'); return;
  }
  if(p.weapon==='knife'){
    state.projectiles.push({...common,type:'knife',vx:Math.cos(a)*p.bulletSpeed*.82,vy:Math.sin(a)*p.bulletSpeed*.82,life:.92,range:p.range*.82,travel:0,r:18*p.size,damage:d*2.05,pierce:true,spectral:true}); addParticle(cx,cy,'#ffe3e8',6,'slash');
    if(p.flags.knifeRing) state.projectiles.push({...common,type:'ring',vx:Math.cos(a)*p.bulletSpeed*.5,vy:Math.sin(a)*p.bulletSpeed*.5,life:.75,rad:12*p.size,thick:8*p.size,damage:d*.72});
    return;
  }
  if(p.flags.tinyPlanet && chance(.35)){
    state.projectiles.push({...common,type:'orbitTear',cx:p.x,cy:p.y,orbA:a,orbR:38,spin:5.8,release:.32,vx:0,vy:0,life:1.0});
    return;
  }
  state.projectiles.push({...common,type:'tear',vx:Math.cos(a)*p.bulletSpeed,vy:Math.sin(a)*p.bulletSpeed});
}
function spawnBeam(a,d, mult=1){
  const p=state.player;
  state.beams.push({x:p.x,y:p.y,angle:a,len:p.range*1.3,width:(18+5*p.size)*(p.flags.starRing?1.25:1)*mult,damage:d*.64,life:.18,tick:0,hit:{},holy:!!p.flags.holyBeam});
  if(p.flags.beamFork){
    state.beams.push({x:p.x,y:p.y,angle:a+.24,len:p.range*.9,width:10,damage:d*.33,life:.16,tick:0,hit:{}});
    state.beams.push({x:p.x,y:p.y,angle:a-.24,len:p.range*.9,width:10,damage:d*.33,life:.16,tick:0,hit:{}});
  }
}

function getAimVector(){
  let ax=0, ay=0;
  if(input.keys.ArrowLeft||input.keys.ArrowRight||input.keys.ArrowUp||input.keys.ArrowDown){
    ax=(input.keys.ArrowRight?1:0)-(input.keys.ArrowLeft?1:0);
    ay=(input.keys.ArrowDown?1:0)-(input.keys.ArrowUp?1:0);
  }
  else if(input.aim.x||input.aim.y){ ax=input.aim.x; ay=input.aim.y; }
  else if(input.mouseAim){ const a=angTo(state.player.x,state.player.y,input.mouseAim.x,input.mouseAim.y); ax=Math.cos(a); ay=Math.sin(a); }
  else if(input.auto){
    const e = nearestEnemy();
    if(e){ const a=angTo(state.player.x,state.player.y,e.x,e.y); ax=Math.cos(a); ay=Math.sin(a); }
  }
  if(!ax&&!ay) return null;
  const m=Math.hypot(ax,ay)||1; return {x:ax/m,y:ay/m};
}
function nearestEnemy(){
  if(!state.room) return null;
  let best=null, bd=99999;
  for(const e of state.room.enemies){ if(e.dead) continue; const d=dist(state.player.x,state.player.y,e.x,e.y); if(d<bd){bd=d;best=e;} }
  return best;
}

function update(dt){
  if(state.mode!=='play' || state.inModal || state.paused) return;
  const p=state.player; if(!p) return;
  p.inv=Math.max(0,p.inv-dt); p.hurtRage=Math.max(0,p.hurtRage-dt); p.shadow=Math.max(0,p.shadow-dt);
  updatePlayer(dt); updateRoom(dt); fireWeapon(dt); updateProjectiles(dt); updateBeams(dt); updateParticles(dt); updatePickups(dt);
  if(state.room && !state.room.cleared && roomCleared()) clearRoom();
  updateHud(); updateNextRoomButton();
}

function updatePlayer(dt){
  const p=state.player;
  let mx=0,my=0;
  if(input.keys.KeyW) my-=1;
  if(input.keys.KeyS) my+=1;
  if(input.keys.KeyA) mx-=1;
  if(input.keys.KeyD) mx+=1;
  if(input.move.x||input.move.y){ mx=input.move.x; my=input.move.y; }
  const m=Math.hypot(mx,my)||1; mx/=m; my/=m;
  let sp=p.speed*(p.shadow>0?1.35:1);
  p.x += mx*sp*dt; p.y += my*sp*dt;
  p.x=clamp(p.x,36,W-36); p.y=clamp(p.y,54,H-38);
  for(const o of state.room.obstacles){ if(o.kind==='rock') resolveCircleRect(p,o); }
  handleDoors();
}

function handleDoors(){
  if(!state.room || !state.room.cleared) return;
  const [rx,ry]=fromKey(state.current);
  const p=state.player;
  // 修复：玩家坐标会被限制在墙内，旧阈值永远碰不到门。这里用“靠近边缘+在门宽范围内”触发。
  const inHDoor = Math.abs(p.y - H/2) < 82;
  const inVDoor = Math.abs(p.x - W/2) < 96;
  const dirs = [
    {cond:p.x<=46 && inHDoor, nx:rx-1,ny:ry, px:W-76,py:H/2},
    {cond:p.x>=W-46 && inHDoor, nx:rx+1,ny:ry, px:76,py:H/2},
    {cond:p.y<=66 && inVDoor, nx:rx,ny:ry-1, px:W/2,py:H-86},
    {cond:p.y>=H-50 && inVDoor, nx:rx,ny:ry+1, px:W/2,py:88},
  ];
  for(const d of dirs){
    const k=keyOf(d.nx,d.ny);
    if(d.cond && state.rooms.has(k)){ moveToRoom(k,d.px,d.py); break; }
  }
}

function moveToRoom(k,px,py){
  enterRoom(k);
  state.player.x=px; state.player.y=py;
  state.player.inv=Math.max(state.player.inv,.55);
  sfx(state.room.type==='boss'?'boss':'door');
  showToast(state.room.cleared?'已进入安全房。':'进房成功：清怪后门会打开。',1200);
  updateNextRoomButton();
}

function bestNextRoom(){
  if(!state.room || !state.room.cleared) return null;
  const [rx,ry]=fromKey(state.current);
  const dirs = [
    {label:'右边房间', nx:rx+1,ny:ry, px:76,py:H/2},
    {label:'下边房间', nx:rx,ny:ry+1, px:W/2,py:88},
    {label:'左边房间', nx:rx-1,ny:ry, px:W-76,py:H/2},
    {label:'上边房间', nx:rx,ny:ry-1, px:W/2,py:H-86},
  ];
  const available = dirs.map(d=>({...d,k:keyOf(d.nx,d.ny),room:state.rooms.get(keyOf(d.nx,d.ny))})).filter(d=>d.room);
  if(!available.length) return null;
  // 优先去没去过的普通/特殊房，出生房强制优先右侧教学战斗房。
  return available.find(d=>!d.room.visited && d.room.tutorial) ||
         available.find(d=>!d.room.visited && d.room.type==='normal') ||
         available.find(d=>!d.room.visited) ||
         available[0];
}

function updateNextRoomButton(){
  if(!nextRoomBtn) return;
  const d = bestNextRoom();
  const show = state.mode==='play' && !state.inModal && !state.paused && !!d;
  nextRoomBtn.classList.toggle('hidden', !show);
  if(show){
    nextRoomBtn.textContent = state.room?.type==='start' ? '进右侧战斗房' : `进门：${d.room.type==='boss'?'Boss房':d.room.type==='treasure'?'宝物房':d.room.type==='shop'?'商店':d.room.type==='curse'?'诅咒房':d.label}`;
  }
}

function resolveCircleRect(c,o){
  const nx=clamp(c.x,o.x-o.w/2,o.x+o.w/2), ny=clamp(c.y,o.y-o.h/2,o.y+o.h/2);
  const dx=c.x-nx, dy=c.y-ny; const l=Math.hypot(dx,dy);
  if(l<c.r && l>0){ c.x += dx/l*(c.r-l); c.y += dy/l*(c.r-l); }
}

function updateRoom(dt){
  const p=state.player;
  if(p.flags.auraSlow){
    for(const eb of state.enemyProjectiles){ eb.vx*=.992; eb.vy*=.992; }
  }
  for(const e of state.room.enemies){
    if(e.dead) continue;
    e.flash=Math.max(0,e.flash-dt); tickStatus(e,dt);
    if(e.hp<=0){ killEnemy(e); continue; }
    if(e.boss) updateBoss(e,dt); else updateEnemy(e,dt);
    if(dist(p.x,p.y,e.x,e.y)<p.r+e.r){
      if(p.flags.contact){ damageEnemy(e, playerDamageValue()*.22, 'contact'); }
      damagePlayer(1,'contact');
      const a=angTo(e.x,e.y,p.x,p.y); p.x+=Math.cos(a)*22; p.y+=Math.sin(a)*22;
    }
  }
  updateEnemyBullets(dt);
}

function tickStatus(e,dt){
  const s=e.status||{};
  if(s.poison>0){ s.poison-=dt; e.hp-=dt*2.5; addParticle(e.x,e.y,'#74e66d',1); }
  if(s.burn>0){ s.burn-=dt; e.hp-=dt*4.2; if(chance(.12)) addParticle(e.x,e.y,'#ff8b34',2); }
  if(s.freeze>0){ s.freeze-=dt; }
  if(s.slow>0){ s.slow-=dt; }
  if(s.charm>0){ s.charm-=dt; }
}
function statusSpeed(e){
  let m=1; if(e.status.freeze>0) m*=.15; if(e.status.slow>0) m*=.48; if(state.player.flags.auraSlow) m*=.78; return m;
}

function updateEnemy(e,dt){
  const p=state.player;
  let a=angTo(e.x,e.y,p.x,p.y); if(e.status.charm>0) a += Math.PI;
  let sp=e.speed*statusSpeed(e);
  if(e.type==='blob'){
    e.x += Math.cos(a)*sp*dt; e.y += Math.sin(a)*sp*dt;
  } else if(e.type==='fly'){
    e.x += Math.cos(a)*sp*dt; e.y += Math.sin(a)*sp*dt;
  } else if(e.type==='ghost'){
    e.phase += dt*3; e.x += Math.cos(a)*sp*dt + Math.cos(e.phase)*20*dt; e.y += Math.sin(a)*sp*dt + Math.sin(e.phase*1.3)*20*dt;
  } else if(e.type==='spitter'){
    const d=dist(e.x,e.y,p.x,p.y); const dir=d<210?-1:1; e.x += Math.cos(a)*sp*dt*dir; e.y += Math.sin(a)*sp*dt*dir; e.shootCd-=dt; if(e.shootCd<=0){ enemyShoot(e,a,170+state.floor*15); e.shootCd=1.35-R()*.25; }
  } else if(e.type==='charger'){
    if(e.charging>0){ e.charging-=dt; e.x+=e.vx*dt; e.y+=e.vy*dt; }
    else { e.chargeCd-=dt; e.x += Math.cos(a)*sp*.45*dt; e.y += Math.sin(a)*sp*.45*dt; if(e.chargeCd<=0){ e.vx=Math.cos(a)*(330+state.floor*18); e.vy=Math.sin(a)*(330+state.floor*18); e.charging=.45; e.chargeCd=1.8+R(); addParticle(e.x,e.y,'#ff6d7d',8); } }
  } else if(e.type==='splitter'){
    e.x += Math.cos(a+Math.sin(now()*2)*.6)*sp*dt; e.y += Math.sin(a+Math.cos(now()*2)*.6)*sp*dt;
  } else if(e.type==='bomber'){
    const d=dist(e.x,e.y,p.x,p.y); const dir=d<250?-1:1; e.x += Math.cos(a)*sp*dt*dir; e.y += Math.sin(a)*sp*dt*dir; e.shootCd-=dt; if(e.shootCd<=0){ enemyBomb(e,a); e.shootCd=2.0; }
  } else if(e.type==='shield'){
    e.x += Math.cos(a)*sp*dt; e.y += Math.sin(a)*sp*dt;
  }
  e.x=clamp(e.x,40,W-40); e.y=clamp(e.y,58,H-42);
  for(const o of state.room.obstacles){ if(o.kind==='rock' && e.type!=='ghost') resolveCircleRect(e,o); }
}

function updateBoss(e,dt){
  const p=state.player; e.phaseTimer+=dt; e.cd-=dt;
  const a=angTo(e.x,e.y,p.x,p.y); const sp=e.speed*statusSpeed(e);
  if(e.bossType==='boss_blob'){
    e.x += Math.cos(a)*sp*.55*dt; e.y += Math.sin(a)*sp*.55*dt;
    if(e.cd<=0){ radial(e, 9+state.floor, 155, '#ff7d91'); e.cd=1.6; if(chance(.55)) state.room.enemies.push(makeEnemy('blob',e.x+R()*70-35,e.y+R()*70-35)); }
  } else if(e.bossType==='boss_twins'){
    e.x += Math.cos(now()*1.6)*90*dt; e.y += Math.sin(now()*2.1)*55*dt;
    if(e.cd<=0){ enemyShoot(e,a,230); enemyShoot(e,a+.22,210); enemyShoot(e,a-.22,210); e.cd=.85; }
    if(!e.splitSpawned && e.hp<e.maxHp*.55){ e.splitSpawned=true; state.room.enemies.push({...makeEnemy('charger',e.x-70,e.y), hp:70, maxHp:70, r:28, boss:false, type:'charger'}); }
  } else if(e.bossType==='boss_doll'){
    if(e.charging>0){ e.charging-=dt; e.x+=e.vx*dt; e.y+=e.vy*dt; }
    else { e.x += Math.cos(a)*sp*.35*dt; e.y += Math.sin(a)*sp*.35*dt; if(e.cd<=0){ e.vx=Math.cos(a)*430; e.vy=Math.sin(a)*430; e.charging=.55; e.cd=2.2; spawnEnemyBeam(e,a); } }
  } else if(e.bossType==='boss_candle'){
    e.x = W/2 + Math.cos(now()*.8)*170; e.y = 200 + Math.sin(now()*1.2)*80;
    if(e.cd<=0){ radial(e, 14, 135, '#ffe7a0'); spawnEnemyBeam(e,a+Math.sin(now())*.45); e.cd=1.7; }
  } else if(e.bossType==='boss_chest'){
    e.x += Math.cos(a)*sp*.5*dt; e.y += Math.sin(a)*sp*.5*dt;
    if(e.cd<=0){ for(let i=0;i<5;i++) enemyBomb(e, R()*TAU); if(chance(.45)) spawnPickup('coin',e.x,e.y); e.cd=2.1; }
  } else if(e.bossType==='boss_heart'){
    e.x = W/2 + Math.sin(now()*1.1)*95; e.y = H/2-30 + Math.sin(now()*1.7)*35;
    if(e.cd<=0){ radial(e, e.hp<e.maxHp*.45?24:16, e.hp<e.maxHp*.45?210:165, '#ff4773'); spawnEnemyBeam(e, 0); spawnEnemyBeam(e, Math.PI/2); if(chance(.45)) state.room.enemies.push(makeEnemy(pick(['fly','spitter','charger']),100+R()*(W-200),120+R()*(H-240))); e.cd=e.hp<e.maxHp*.45?1.0:1.55; }
  }
  e.x=clamp(e.x,70,W-70); e.y=clamp(e.y,85,H-70);
}

function enemyShoot(e,a,speed=180){ state.enemyProjectiles.push({x:e.x,y:e.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:7,life:4,color:'#ff9fb0'}); }
function radial(e,n,speed,color){ for(let i=0;i<n;i++){ const a=i/n*TAU + now()*.4; state.enemyProjectiles.push({x:e.x,y:e.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:6,life:4,color}); } }
function enemyBomb(e,a){ state.enemyProjectiles.push({x:e.x,y:e.y,vx:Math.cos(a)*160,vy:Math.sin(a)*160,r:11,life:1.2,color:'#d2b16d',bomb:true}); }
function spawnEnemyBeam(e,a){ state.beams.push({enemy:true,x:e.x,y:e.y,angle:a,len:760,width:14,damage:1,life:.34,tick:0,hit:{},color:'#ff5f7a'}); }

function updateProjectiles(dt){
  for(const pr of state.projectiles){
    pr.life-=dt;
    if(pr.type==='orbitTear'){
      pr.orbA += pr.spin*dt; pr.orbR += 34*dt; pr.x = state.player.x + Math.cos(pr.orbA)*pr.orbR; pr.y = state.player.y + Math.sin(pr.orbA)*pr.orbR;
      if(pr.life<pr.release){ pr.vx=Math.cos(pr.angle)*state.player.bulletSpeed; pr.vy=Math.sin(pr.angle)*state.player.bulletSpeed; pr.type='tear'; }
    } else if(pr.type==='knife'){
      const step=Math.hypot(pr.vx*dt,pr.vy*dt); pr.travel+=step;
      if(pr.travel>pr.range*.55 && !pr.returning){ pr.returning=true; }
      if(pr.returning){ const a=angTo(pr.x,pr.y,state.player.x,state.player.y); pr.vx=Math.cos(a)*state.player.bulletSpeed*1.1; pr.vy=Math.sin(a)*state.player.bulletSpeed*1.1; if(dist(pr.x,pr.y,state.player.x,state.player.y)<25) pr.dead=true; }
      pr.x += pr.vx*dt; pr.y += pr.vy*dt;
    } else if(pr.type==='ring'){
      pr.x += pr.vx*dt; pr.y += pr.vy*dt; pr.rad += (state.player.flags.starRing?72:52)*dt;
    } else {
      if(pr.homing){ const e=nearestEnemy(); if(e){ const a=angTo(pr.x,pr.y,e.x,e.y); const sp=Math.hypot(pr.vx,pr.vy); pr.vx=lerp(pr.vx,Math.cos(a)*sp,dt*2.8); pr.vy=lerp(pr.vy,Math.sin(a)*sp,dt*2.8); } }
      pr.x += pr.vx*dt; pr.y += pr.vy*dt;
    }
    if(!pr.spectral){
      for(const o of state.room.obstacles){ if(o.kind==='rock' && circleRectHit(pr,o)){ if(pr.bounce>0){ pr.bounce--; if(Math.abs(pr.x-o.x)>Math.abs(pr.y-o.y)) pr.vx*=-1; else pr.vy*=-1; } else pr.dead=true; } }
    }
    if(pr.x<15||pr.x>W-15){ if(pr.bounce>0){pr.vx*=-1;pr.bounce--;} else pr.dead=true; }
    if(pr.y<45||pr.y>H-15){ if(pr.bounce>0){pr.vy*=-1;pr.bounce--;} else pr.dead=true; }
    hitEnemies(pr);
    if(pr.life<=0) pr.dead=true;
  }
  state.projectiles = state.projectiles.filter(p=>!p.dead);
}
function circleRectHit(c,o){ const nx=clamp(c.x,o.x-o.w/2,o.x+o.w/2), ny=clamp(c.y,o.y-o.h/2,o.y+o.h/2); return dist(c.x,c.y,nx,ny)<c.r; }

function hitEnemies(pr){
  for(const e of state.room.enemies){
    if(e.dead) continue;
    let hit=false;
    if(pr.type==='ring'){
      const d=dist(pr.x,pr.y,e.x,e.y); hit = Math.abs(d-pr.rad) < (pr.thick + e.r);
    } else hit = dist(pr.x,pr.y,e.x,e.y) < pr.r + e.r;
    if(!hit) continue;
    const t=now(); if(pr.hit[e.id] && t-pr.hit[e.id]<.13) continue; pr.hit[e.id]=t;
    damageEnemy(e, pr.damage, pr.type);
    applyHitEffects(e, pr);
    if(pr.bomb && chance(.08*pr.bomb + .02*state.player.luck)) explode(pr.x,pr.y,70,pr.damage*.8,true);
    if(pr.split && chance(.35)){ for(let i=0;i<2;i++){ const a=pr.angle+(i?1:-1)*.55; state.projectiles.push({...pr, x:pr.x,y:pr.y, vx:Math.cos(a)*state.player.bulletSpeed*.75, vy:Math.sin(a)*state.player.bulletSpeed*.75, life:.35, damage:pr.damage*.38, split:0, hit:{}, r:Math.max(5,pr.r*.65), type:'tear'}); } }
    if(!pr.pierce && pr.type!=='knife' && pr.type!=='ring'){ pr.dead=true; break; }
  }
}
function applyHitEffects(e, pr){
  const p=state.player, f=p.flags, lk=Math.max(0,p.luck)*.025;
  if(f.rainbow){ const s=pick(['poison','burn','freeze','charm']); e.status[s]=Math.max(e.status[s]||0, s==='freeze'?1.0:2.4); }
  if(f.poison && chance(.18+lk)) e.status.poison=2.5;
  if(f.burn && chance(.16+lk)) e.status.burn=1.8;
  if(f.freeze && chance(.09+lk)) e.status.freeze=.9;
  if(f.slow) e.status.slow=2.0;
  if(f.charm && chance(.10+lk)) e.status.charm=2.4;
  if(f.holyBeam && chance(.07+lk*.5)) holyStrike(e.x,e.y,pr.damage*.9);
  if(f.arc && chance(.12+lk)) arcDamage(e, pr.damage*.42);
}
function damageEnemy(e,d,src){
  if(e.shield && src==='tear'){ d*=.75; }
  e.hp -= d; e.flash=.08; sfx(src==='beam'||src==='holy'?'beam':'hit'); addParticle(e.x,e.y, src==='contact'?'#fff':'#ffd9e2',6, src==='knife'?'slash':'spark');
  if(e.hp<=0) killEnemy(e);
}
function killEnemy(e){
  if(e.dead) return; e.dead=true; state.totalKills++;
  sfx('kill'); addParticle(e.x,e.y,'#ff9fba',24,'burst');
  if(e.type==='splitter'){ state.room.enemies.push(makeEnemy('fly',e.x-18,e.y)); state.room.enemies.push(makeEnemy('fly',e.x+18,e.y)); }
  const p=state.player;
  if(p.flags.vampKill && chance(.12+.02*p.luck)){ p.red=Math.min(p.maxRed,p.red+1); showToast('吸血击杀：回复半颗红心',800); }
  if(p.flags.blackOnKill && chance(.07+.01*p.luck)) spawnPickup('black',e.x,e.y);
  if(chance(.08+.015*p.luck)) spawnPickup(pick(['coin','heart','key','bomb']), e.x, e.y);
}
function holyStrike(x,y,d){ state.beams.push({x,y,angle:-Math.PI/2,len:120,width:28,damage:d,life:.14,tick:0,hit:{},holy:true,vertical:true}); }
function arcDamage(e,d){
  const others=state.room.enemies.filter(x=>!x.dead && x!==e).sort((a,b)=>dist(e.x,e.y,a.x,a.y)-dist(e.x,e.y,b.x,b.y)).slice(0,2);
  for(const o of others){ if(dist(e.x,e.y,o.x,o.y)<180){ damageEnemy(o,d,'arc'); addParticle((e.x+o.x)/2,(e.y+o.y)/2,'#81f3ff',8); } }
}
function explode(x,y,r,d,playerMade=false){
  sfx('kill'); addParticle(x,y,playerMade?'#ffc05a':'#ff5d70',32,'burst');
  if(playerMade){ for(const e of state.room.enemies) if(!e.dead && dist(x,y,e.x,e.y)<r+e.r) damageEnemy(e,d,'bomb'); }
  else if(dist(x,y,state.player.x,state.player.y)<r+state.player.r) damagePlayer(1,'bomb');
}

function updateBeams(dt){
  for(const b of state.beams){
    b.life-=dt; b.tick-=dt;
    if(b.tick<=0){ b.tick=.075;
      if(b.enemy) hitPlayerBeam(b); else hitEnemyBeam(b);
    }
  }
  state.beams=state.beams.filter(b=>b.life>0);
}
function pointLineDistance(px,py,x1,y1,a,len){
  const dx=Math.cos(a), dy=Math.sin(a); const t=clamp((px-x1)*dx+(py-y1)*dy,0,len); const nx=x1+dx*t, ny=y1+dy*t; return dist(px,py,nx,ny);
}
function hitEnemyBeam(b){
  for(const e of state.room.enemies){ if(e.dead) continue; const dd=b.vertical?Math.abs(e.x-b.x):pointLineDistance(e.x,e.y,b.x,b.y,b.angle,b.len); if(dd<e.r+b.width){ damageEnemy(e,b.damage,b.holy?'holy':'beam'); applyHitEffects(e,{damage:b.damage,type:'beam',angle:b.angle}); } }
}
function hitPlayerBeam(b){ if(pointLineDistance(state.player.x,state.player.y,b.x,b.y,b.angle,b.len)<state.player.r+b.width) damagePlayer(1,'beam'); }

function updateEnemyBullets(dt){
  for(const eb of state.enemyProjectiles){
    eb.life-=dt; eb.x+=eb.vx*dt; eb.y+=eb.vy*dt;
    if(eb.bomb && eb.life<=0){ explode(eb.x,eb.y,64,1,false); eb.dead=true; }
    for(let i=0;i<state.player.orbitals;i++){
      const o=orbitalPos(i,state.player.orbitals);
      if((state.player.flags.orbitBlock || chance(.35)) && dist(eb.x,eb.y,o.x,o.y)<eb.r+13){ eb.dead=true; addParticle(eb.x,eb.y,'#fff3a7',8); }
    }
    if(!eb.dead && dist(eb.x,eb.y,state.player.x,state.player.y)<eb.r+state.player.r){ damagePlayer(1,'bullet'); eb.dead=true; }
    if(eb.x<0||eb.x>W||eb.y<30||eb.y>H) eb.dead=true;
  }
  state.enemyProjectiles=state.enemyProjectiles.filter(b=>!b.dead && b.life>0);
}

function damagePlayer(amount,src,ignoreInv=false){
  const p=state.player;
  if(!ignoreInv && (p.inv>0 || p.shadow>0)) return;
  if(p.roomShield>0){ p.roomShield=0; p.inv=.8; showToast('木头盾挡住了伤害',700); return; }
  if(p.mantleReady){ p.mantleReady=false; p.inv=.9; showToast('圣披风挡住了伤害',800); return; }
  let redBefore=p.red, blackBefore=p.black;
  if(p.soul>0){ p.soul=Math.max(0,p.soul-amount); }
  else if(p.black>0){ p.black=Math.max(0,p.black-amount); }
  else { p.red=Math.max(0,p.red-amount); state.floorRedDamage=true; if(state.room?.type==='boss') state.bossRedDamage=true; }
  if(blackBefore>p.black){ explode(p.x,p.y,140,playerDamageValue()*.7,true); }
  if(p.flags.piggy && chance(.7)) spawnPickup('coin',p.x,p.y);
  if(p.flags.hurtNova) explode(p.x,p.y,180,playerDamageValue()*.8,true);
  if(p.flags.hurtRage) p.hurtRage=3.2;
  p.inv = p.flags.longIFrame ? 1.35 : .85;
  sfx('hurt'); addParticle(p.x,p.y,'#ff6d83',30,'burst');
  if(p.red<=0 && p.soul<=0 && p.black<=0) handleDeath();
}
function handleDeath(){
  const p=state.player;
  if(p.flags.shadowSave && p.shadow<=0){ p.shadow=5; p.black+=2; p.red=Math.max(1,p.red); showToast('影子替身救了你！',1600); return; }
  if(p.revives>0){ p.revives--; p.red=2; p.soul=4; p.black=0; p.inv=3; showToast('复活铃响了：你回来了。',1800); return; }
  if(p.nineLives>0){ p.nineLives--; p.maxRed=2; p.red=2; p.soul=0; p.black=0; p.inv=3; showToast(`九命布偶猫：剩余 ${p.nineLives} 命`,1800); return; }
  state.mode='dead'; localStorage.removeItem(SAVE_KEY);
  showModal(`<h2>你倒在了地牢里</h2><p>本局击败 ${state.totalKills} 个敌人，获得 ${p.items.length} 个BD道具。</p><p class="smallText">提示：魂心/黑心挡伤不破无红伤，是冲天使/恶魔房的核心。</p><button class="bigBtn" data-restart="1">重新开始</button>`);
  modal.querySelector('[data-restart]').onclick=()=>resetRun();
}

function updatePickups(dt){
  for(const pu of state.pickups){ pu.life-=dt; pu.y += Math.sin(now()*5+pu.x)*8*dt; if(dist(pu.x,pu.y,state.player.x,state.player.y)<pu.r+state.player.r) pickup(pu); }
  state.pickups=state.pickups.filter(p=>!p.dead && p.life>0);
}
function addParticle(x,y,color,n=1,kind='dot'){
  for(let i=0;i<n;i++){
    const speed = kind==='slash'?260:kind==='burst'?220:170;
    state.particles.push({x,y,vx:(R()-.5)*speed,vy:(R()-.5)*speed,life:.28+R()*.42,color,r:2+R()*4,kind,rot:R()*TAU});
  }
}
function updateParticles(dt){
  for(const p of state.particles){ p.life-=dt; p.x+=p.vx*dt; p.y+=p.vy*dt; p.vx*=.96; p.vy*=.96; }
  state.particles=state.particles.filter(p=>p.life>0);
}

function draw(){
  ctx.clearRect(0,0,W,H);
  drawRoom(); drawPickups(); drawObstacles(); drawDoors(); drawProjectiles(); drawBeams(); drawEnemies(); drawPlayer(); drawParticles(); drawBossBar();
  if(state.paused) drawPause();
}
function drawRoom(){
  const r=state.room;
  const bg = r?.type==='boss' ? '#20111a' : r?.type==='treasure' ? '#132536' : r?.type==='shop' ? '#2a2014' : r?.type==='curse' ? '#26132d' : '#191621';
  ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);
  const tile = r?.type==='boss'?'tile_boss':r?.type==='treasure'?'tile_treasure':r?.type==='shop'?'tile_shop':r?.type==='curse'?'tile_curse':'tile_floor';
  ctx.save(); ctx.globalAlpha=.82;
  for(let y=52;y<H-22;y+=48){ for(let x=28;x<W-24;x+=48){ drawSprite(tile,x,y,3); } }
  ctx.restore();
  ctx.fillStyle='#44384f'; ctx.fillRect(0,0,W,44); ctx.fillRect(0,H-20,W,20); ctx.fillRect(0,0,24,H); ctx.fillRect(W-24,0,24,H);
  for(let x=24;x<W;x+=48){ drawSprite('tile_wall',x,22,3); drawSprite('tile_wall',x,H-10,3); }
  for(let y=42;y<H;y+=48){ drawSprite('tile_wall',12,y,3); drawSprite('tile_wall',W-12,y,3); }
  ctx.fillStyle='rgba(0,0,0,.16)'; ctx.fillRect(30,52,W-60,H-85);
  ctx.fillStyle='#fff'; ctx.globalAlpha=.07; ctx.font='900 82px sans-serif'; ctx.textAlign='center';
  const mark = r?.type==='boss'?'BOSS':r?.type==='treasure'?'宝':r?.type==='shop'?'店':r?.type==='curse'?'咒':'地牢';
  ctx.fillText(mark,W/2,H/2+24); ctx.globalAlpha=1;
  if(r?.type==='start'){
    ctx.save(); ctx.textAlign='center'; ctx.fillStyle='rgba(255,255,255,.92)'; ctx.font='900 24px sans-serif';
    ctx.fillText('出生房是安全房：贴门或点下方“进右侧战斗房”', W/2, 118);
    ctx.fillStyle='#ffd36f'; ctx.font='900 54px sans-serif'; ctx.fillText('➜', W-92, H/2+16);
    ctx.font='900 16px sans-serif'; ctx.fillText('右侧战斗房', W-100, H/2+58); ctx.restore();
  }
  if(r?.tutorial){ ctx.save(); ctx.textAlign='center'; ctx.fillStyle='rgba(255,255,255,.86)'; ctx.font='900 20px sans-serif'; ctx.fillText('战斗房：清掉小怪，门才会再次打开', W/2, 112); ctx.restore(); }
}
function drawDoors(){
  if(!state.room) return;
  const open=state.room.cleared;
  for(const [nx,ny,dir] of neighbors(state.current)){
    ctx.fillStyle=open?'#ffd36f':'#69424d';
    ctx.strokeStyle=open?'rgba(255,245,177,.9)':'rgba(255,255,255,.16)';
    ctx.lineWidth=4;
    if(dir==='R'){ roundedRect(W-42,H/2-70,38,140,12,true); roundedRect(W-42,H/2-70,38,140,12,false); }
    if(dir==='L'){ roundedRect(4,H/2-70,38,140,12,true); roundedRect(4,H/2-70,38,140,12,false); }
    if(dir==='U'){ roundedRect(W/2-70,26,140,38,12,true); roundedRect(W/2-70,26,140,38,12,false); }
    if(dir==='D'){ roundedRect(W/2-70,H-42,140,38,12,true); roundedRect(W/2-70,H-42,140,38,12,false); }
  }
}
function drawObstacles(){
  for(const o of state.room?.obstacles || []){
    if(o.kind==='spike'){
      for(let x=o.x-o.w/2+14;x<o.x+o.w/2;x+=24) drawSprite('spike',x,o.y,2.4);
    } else {
      const sx=Math.max(1,Math.round(o.w/40)), sy=Math.max(1,Math.round(o.h/36));
      for(let ix=0;ix<sx;ix++) for(let iy=0;iy<sy;iy++) drawSprite('rock', o.x-o.w/2+20+ix*34, o.y-o.h/2+18+iy*30, 2.35);
    }
  }
}
function drawCuteEnemy(e){
  const r=e.r, t=e.type, boss=e.boss;
  let col='#b579ff';
  if(t==='fly') col='#72d6ff'; if(t==='spitter') col='#91e379'; if(t==='charger') col='#ffca66'; if(t==='splitter') col='#ff91df'; if(t==='ghost') col='#c8ddff'; if(t==='bomber') col='#d4a15c'; if(t==='shield') col='#a798ff';
  if(boss) col = e.bossType==='boss_candle'?'#ffe6a3':e.bossType==='boss_heart'?'#ff5c7d':e.bossType==='boss_chest'?'#d7a86d':'#ff8fab';
  if(e.flash>0) col='#fff';
  ctx.save();
  if(boss){
    ctx.fillStyle=col; blob(0,0,r,10); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.18)'; circle(-r*.25,-r*.32,r*.28);
    ctx.fillStyle='#241725'; circle(-r*.28,-r*.12,r*.10); circle(r*.28,-r*.12,r*.10);
    ctx.lineWidth=4; ctx.strokeStyle='#241725'; ctx.beginPath(); ctx.arc(0,r*.12,r*.28,.15,Math.PI-.15); ctx.stroke();
    if(e.bossType==='boss_candle'){ ctx.fillStyle='#ff8b34'; tri(0,-r*1.08,-r*.18,-r*.58,r*.18,-r*.58); ctx.fillStyle='#fff0a6'; circle(0,-r*.55,r*.18); }
    if(e.bossType==='boss_twins'){ ctx.fillStyle='rgba(255,255,255,.22)'; circle(-r*.62,r*.05,r*.32); circle(r*.62,r*.05,r*.32); }
    if(e.bossType==='boss_chest'){ ctx.strokeStyle='#5b3218'; ctx.lineWidth=6; ctx.strokeRect(-r*.72,-r*.18,r*1.44,r*.72); ctx.fillStyle='#ffd36f'; roundedRect(-r*.15,r*.05,r*.3,r*.22,4,true); }
    if(e.bossType==='boss_heart'){ ctx.fillStyle='rgba(255,255,255,.2)'; circle(-r*.18,-r*.18,r*.22); }
    ctx.restore(); return;
  }
  if(t==='fly'){
    ctx.fillStyle='rgba(188,240,255,.55)'; ctx.beginPath(); ctx.ellipse(-r*.62,-r*.1,r*.42,r*.32,-.5,0,TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(r*.62,-r*.1,r*.42,r*.32,.5,0,TAU); ctx.fill();
    ctx.fillStyle=col; circle(0,0,r*.72);
  } else if(t==='ghost'){
    ctx.fillStyle=col; ctx.beginPath(); ctx.arc(0,-r*.1,r*.74,Math.PI,0); ctx.lineTo(r*.72,r*.48); for(let i=0;i<4;i++){ const x=r*.72-i*r*.48; ctx.quadraticCurveTo(x-r*.12,r*.72,x-r*.24,r*.48); } ctx.closePath(); ctx.fill();
  } else if(t==='splitter'){
    ctx.fillStyle=col; circle(-r*.28,0,r*.58); circle(r*.28,0,r*.58); ctx.fillStyle='rgba(255,255,255,.22)'; circle(-r*.45,-r*.22,r*.16); circle(r*.15,-r*.24,r*.16);
  } else if(t==='bomber'){
    ctx.fillStyle=col; blob(0,0,r*.78,7); ctx.fill(); ctx.fillStyle='#2b2530'; circle(r*.45,-r*.45,r*.22); ctx.strokeStyle='#ffdf78'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(r*.54,-r*.6); ctx.quadraticCurveTo(r*.88,-r*.92,r*.62,-r*1.08); ctx.stroke();
  } else if(t==='charger'){
    ctx.fillStyle='#ffe19a'; tri(-r*.56,-r*.52,-r*.9,-r*.92,-r*.35,-r*.68); tri(r*.56,-r*.52,r*.9,-r*.92,r*.35,-r*.68); ctx.fillStyle=col; blob(0,0,r*.83,6); ctx.fill();
  } else if(t==='shield'){
    ctx.fillStyle=col; circle(0,0,r*.82); ctx.strokeStyle='#f6efff'; ctx.lineWidth=5; ctx.beginPath(); ctx.arc(0,0,r*.55,0,TAU); ctx.stroke();
  } else if(t==='spitter'){
    ctx.fillStyle=col; blob(0,0,r*.82,7); ctx.fill(); ctx.fillStyle='#3d2736'; roundedRect(-r*.22,r*.2,r*.44,r*.18,4,true);
  } else {
    ctx.fillStyle=col; blob(0,0,r*.82,6); ctx.fill();
  }
  if(t!=='ghost' && t!=='fly'){
    ctx.fillStyle='rgba(35,22,39,.9)'; roundedRect(-r*.36,r*.48,r*.18,r*.30,5,true); roundedRect(r*.18,r*.48,r*.18,r*.30,5,true);
  }
  ctx.fillStyle='#211727'; circle(-r*.28,-r*.12,r*.10); circle(r*.28,-r*.12,r*.10);
  ctx.fillStyle='rgba(255,255,255,.65)'; circle(-r*.31,-r*.16,r*.035); circle(r*.25,-r*.16,r*.035);
  ctx.restore();
}
function drawEnemies(){
  for(const e of state.room?.enemies || []){
    if(e.dead) continue;
    const bob = e.boss ? Math.sin(now()*3 + e.id)*2 : Math.sin(now()*5 + e.id)*1.6;
    ctx.save(); ctx.globalAlpha=.22; ctx.fillStyle='#000'; ctx.beginPath(); ctx.ellipse(e.x, e.y + e.r*.72, e.r*.82, e.r*.34, 0, 0, TAU); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(e.x,e.y+bob);
    ctx.globalAlpha = e.status.freeze>0?.58:1;
    if(e.flash>0){ ctx.fillStyle='rgba(255,255,255,.85)'; circle(0,0,e.r+7); }
    drawCuteEnemy(e);
    if(e.boss){ ctx.fillStyle='#fff'; ctx.font='900 13px sans-serif'; ctx.textAlign='center'; ctx.fillText(e.name,0,-e.r-16); }
    if(e.status.poison>0){ ctx.strokeStyle='#64e36d'; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(0,0,e.r+5,0,TAU); ctx.stroke(); }
    if(e.status.burn>0){ ctx.strokeStyle='#ff8b34'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(0,0,e.r+8,0,TAU); ctx.stroke(); }
    if(e.status.charm>0){ ctx.fillStyle='#ff91df'; ctx.font='900 18px sans-serif'; ctx.textAlign='center'; ctx.fillText('❤',0,-e.r-8); }
    ctx.restore();
  }
}
function drawPlayer(){
  const p=state.player; if(!p) return;
  const bob = Math.sin(now()*7)*1.6;
  ctx.save(); ctx.globalAlpha=.24; ctx.fillStyle='#000'; ctx.beginPath(); ctx.ellipse(p.x, p.y + p.r*.86, p.r*.92, p.r*.38, 0, 0, TAU); ctx.fill(); ctx.restore();
  for(let i=0;i<p.orbitals;i++){ const o=orbitalPos(i,p.orbitals); if(!drawSprite('orbital',o.x,o.y,2.05)) { ctx.fillStyle=p.flags.orbitBlock?'#fff0a6':'#d7b7ff'; circle(o.x,o.y,12); } }
  for(let i=0;i<p.familiars;i++){ const a=now()*1.5 + i/Math.max(1,p.familiars)*TAU; const x=p.x+Math.cos(a)*52, y=p.y+Math.sin(a)*34 + Math.sin(now()*6+i)*1.2; if(!drawSprite(p.flags.holySpark?'orbital':'familiar',x,y,1.85)) { ctx.fillStyle=p.flags.holySpark?'#fff2a9':'#b78cff'; circle(x,y,10); } }
  ctx.save(); ctx.translate(p.x,p.y+bob); ctx.globalAlpha=p.inv>0 ? .55 + Math.sin(now()*40)*.25 : 1;
  if(p.shadow>0){ ctx.globalAlpha*=.75; }
  const skin=p.shadow>0?'#5e4c69':'#ffd0a6', body=p.shadow>0?'#493a58':'#7ed7ff', shoe=p.shadow>0?'#2f2638':'#5b3d62';
  ctx.fillStyle=shoe; roundedRect(-11,p.r*.46,8,9,4,true); roundedRect(3,p.r*.46,8,9,4,true);
  ctx.fillStyle=body; roundedRect(-13,2,26,24,10,true);
  ctx.fillStyle='rgba(255,255,255,.24)'; roundedRect(-8,6,7,12,4,true);
  ctx.fillStyle=skin; circle(0,-10,18);
  ctx.fillStyle='#7b4c36'; ctx.beginPath(); ctx.arc(0,-19,17,Math.PI*.05,Math.PI*.95,true); ctx.lineTo(-15,-10); ctx.quadraticCurveTo(0,-3,15,-10); ctx.fill();
  ctx.fillStyle=body; roundedRect(-19,2,7,16,5,true); roundedRect(12,2,7,16,5,true);
  ctx.fillStyle='#211727'; circle(-6,-11,2.7); circle(6,-11,2.7);
  ctx.fillStyle='rgba(255,255,255,.85)'; circle(-7,-12,1); circle(5,-12,1);
  ctx.strokeStyle='#6b3a44'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,-4,5,.2,Math.PI-.2); ctx.stroke();
  ctx.fillStyle='rgba(255,132,159,.35)'; circle(-11,-5,3.2); circle(11,-5,3.2);
  if(p.mantleReady){ ctx.strokeStyle='#fff0a6'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(0,0,p.r+8,0,TAU); ctx.stroke(); }
  if(p.roomShield){ ctx.strokeStyle='#9ad2ff'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(0,0,p.r+12,0,TAU); ctx.stroke(); }
  ctx.restore();
}
function orbitalPos(i,n){ const p=state.player; const a=now()*2.6 + i/n*TAU; return {x:p.x+Math.cos(a)*46,y:p.y+Math.sin(a)*46}; }
function drawProjectiles(){
  for(const pr of state.projectiles){
    if(pr.type==='ring'){
      ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.strokeStyle=state.player.flags.starRing?'#a8f7ff':'#ffb5e1'; ctx.lineWidth=pr.thick; ctx.globalAlpha=.85; ctx.beginPath();
      if(state.player.flags.starRing){ for(let i=0;i<16;i++){ const a=i/16*TAU; const rr=pr.rad*(i%2?1.15:.82); const x=pr.x+Math.cos(a)*rr, y=pr.y+Math.sin(a)*rr; if(i) ctx.lineTo(x,y); else ctx.moveTo(x,y); } ctx.closePath(); } else ctx.arc(pr.x,pr.y,pr.rad,0,TAU);
      ctx.stroke(); ctx.restore();
    } else if(pr.type==='knife'){
      if(!drawSprite('knife',pr.x,pr.y,2.5,pr.angle)) { ctx.save(); ctx.translate(pr.x,pr.y); ctx.rotate(pr.angle); ctx.fillStyle='#ff5f7c'; roundedRect(-10,-6,34,12,6,true); ctx.fillStyle='#ffe3e8'; tri(24,0,10,-11,10,11); ctx.restore(); }
    } else {
      const nm=pr.homing?'homing':pr.pierce?'pierce':'tear'; if(!drawSprite(nm,pr.x,pr.y,Math.max(1.4,pr.r/4.3),pr.angle)) { ctx.fillStyle=pr.homing?'#b8fbff':pr.pierce?'#fff2a7':'#ffc4db'; circle(pr.x,pr.y,pr.r); }
    }
  }
  for(const eb of state.enemyProjectiles){ ctx.save(); ctx.fillStyle=eb.color||'#ff97aa'; ctx.globalAlpha=.9; circle(eb.x,eb.y,eb.r); ctx.fillStyle='rgba(255,255,255,.55)'; circle(eb.x-2,eb.y-2,Math.max(2,eb.r*.35)); ctx.restore(); }
}
function drawBeams(){
  for(const b of state.beams){
    ctx.save(); ctx.translate(b.x,b.y); ctx.rotate(b.angle); ctx.globalAlpha=clamp(b.life*5,0,1);
    ctx.strokeStyle=b.enemy?(b.color||'#ff5f7a'):(b.holy?'#fff0a4':'#ff5f98'); ctx.lineWidth=b.width*2; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(b.len,0); ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.8)'; ctx.lineWidth=b.width*.7; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(b.len,0); ctx.stroke();
    ctx.restore();
  }
}
function drawPickups(){
  for(const pu of state.pickups){
    const bob = Math.sin(now()*5+pu.x)*3;
    if(!drawSprite(pickupSprite(pu.type),pu.x,pu.y+bob,2.2)){
      const map={coin:['#ffd25e','●'],key:['#d6f0ff','⚿'],bomb:['#444','●'],heart:['#ff607c','❤'],soul:['#77c9ff','♥'],black:['#161018','♥']};
      const [c,t]=map[pu.type]||['#fff','?']; ctx.fillStyle=c; circle(pu.x,pu.y,pu.r); ctx.fillStyle='#fff'; ctx.font='900 14px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(t,pu.x,pu.y+1);
    }
  }
}
function drawParticles(){
  for(const p of state.particles){
    ctx.save(); ctx.globalAlpha=clamp(p.life*2,0,1); ctx.translate(p.x,p.y); ctx.rotate(p.rot||0); ctx.fillStyle=p.color; ctx.strokeStyle=p.color;
    if(p.kind==='slash'){ ctx.lineWidth=Math.max(2,p.r); ctx.beginPath(); ctx.moveTo(-p.r*2,0); ctx.lineTo(p.r*2,0); ctx.stroke(); }
    else if(p.kind==='ring'){ ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,0,p.r*2,0,TAU); ctx.stroke(); }
    else if(p.kind==='spark'){ tri(0,-p.r*2,p.r*.8,0,0,p.r*2); }
    else { circle(0,0,p.r); }
    ctx.restore();
  }
  ctx.globalAlpha=1;
}
function drawBossBar(){
  const b=state.room?.enemies.find(e=>e.boss&&!e.dead); if(!b) return;
  const w=520,h=13,x=(W-w)/2,y=52; ctx.fillStyle='rgba(0,0,0,.45)'; roundedRect(x,y,w,h,8,true); ctx.fillStyle='#ff5d79'; roundedRect(x,y,w*clamp(b.hp/b.maxHp,0,1),h,8,true); ctx.fillStyle='#fff'; ctx.font='900 13px sans-serif'; ctx.textAlign='center'; ctx.fillText(b.name,W/2,y-6);
}
function drawPause(){ ctx.fillStyle='rgba(0,0,0,.45)'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#fff'; ctx.font='900 48px sans-serif'; ctx.textAlign='center'; ctx.fillText('暂停',W/2,H/2); }
function circle(x,y,r){ ctx.beginPath(); ctx.arc(x,y,r,0,TAU); ctx.fill(); }
function tri(x1,y1,x2,y2,x3,y3){ ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.lineTo(x3,y3); ctx.closePath(); ctx.fill(); }
function roundedRect(x,y,w,h,r,fill){ ctx.beginPath(); ctx.roundRect(x,y,w,h,r); if(fill) ctx.fill(); else ctx.stroke(); }
function blob(x,y,r,n){ ctx.beginPath(); for(let i=0;i<n;i++){ const a=i/n*TAU; const rr=r*(.92+.12*Math.sin(now()*3+i)); const px=x+Math.cos(a)*rr, py=y+Math.sin(a)*rr; if(i) ctx.lineTo(px,py); else ctx.moveTo(px,py); } ctx.closePath(); }

function updateHud(){
  const p=state.player; if(!p) return;
  const fullRed=Math.floor(p.red/2), halfRed=p.red%2, empty=Math.max(0,Math.ceil(p.maxRed/2)-fullRed-halfRed);
  hudHearts.innerHTML = '❤'.repeat(fullRed) + (halfRed?'♡':'') + '<span style="opacity:.25">'+'❤'.repeat(empty)+'</span>' + ' 💙'.repeat(Math.floor(p.soul/2)) + (p.black? ' 🖤'.repeat(Math.floor(p.black/2)) : '');
  statsLine.textContent = `层 ${state.floor}/${state.maxFloor} · ${POOL_NAME[state.room?.type]||'房间'} · 金币 ${p.coins} 钥匙 ${p.keys} 炸弹 ${p.bombs} · BD ${p.items.length}`;
  const d = calcDealPreview(); dealLine.textContent = `特殊房约 ${d}% · 本层红心伤害：${state.floorRedDamage?'有':'无'} · Boss红伤：${state.bossRedDamage?'有':'无'}`;
  updateItemDock();
}
function calcDealPreview(){
  const p=state.player || {luck:0,flags:{}}; let val=8+p.luck*2; if(!state.floorRedDamage) val+=62; if(!state.bossRedDamage) val+=20; if(p.flags.compass) val+=10; if(p.flags.goatHead) val=96; if(state.seenDealLast) val*=.35; else if(state.seenDealTwo) val*=.65; return clamp(Math.round(val),5,96);
}
function updateMiniMap(){
  if(!state.player) return;
  if(!state.player.flags.map && miniMap.classList.contains('hidden')) return;
  miniMap.innerHTML='';
  for(let y=-3;y<=3;y++) for(let x=-3;x<=3;x++){
    const k=keyOf(x,y); const cell=document.createElement('div');
    const r=state.rooms.get(k);
    if(r && (r.visited || state.player.flags.map)){ cell.className='miniRoom '+(k===state.current?'current ': '') + (r.type==='boss'?'boss ':r.type==='treasure'?'treasure ':r.type==='shop'?'shop ':r.type==='curse'?'secret ':''); }
    miniMap.appendChild(cell);
  }
}

// Controls
addEventListener('keydown',e=>{ input.keys[e.code]=true; if(e.code==='Space'){ togglePause(); e.preventDefault(); } });
addEventListener('keyup',e=>{ input.keys[e.code]=false; });
canvas.addEventListener('pointerdown', e=>{ if(e.pointerType==='mouse'){ input.mouseAim=screenToGame(e.clientX,e.clientY); } });
canvas.addEventListener('pointermove', e=>{ if(e.pointerType==='mouse' && (e.buttons&1)) input.mouseAim=screenToGame(e.clientX,e.clientY); });
canvas.addEventListener('pointerup', e=>{ if(e.pointerType==='mouse') input.mouseAim=null; });
function screenToGame(x,y){ const rect=canvas.getBoundingClientRect(); return {x:(x-rect.left)/rect.width*W, y:(y-rect.top)/rect.height*H}; }

function makeStick(el, target){
  const knob=el.querySelector('div'); let pid=null;
  function update(e){ const r=el.getBoundingClientRect(); const cx=r.left+r.width/2, cy=r.top+r.height/2; let dx=e.clientX-cx, dy=e.clientY-cy; const m=Math.hypot(dx,dy), max=r.width*.34; if(m>max){dx=dx/m*max;dy=dy/m*max;} knob.style.transform=`translate(${dx}px,${dy}px)`; target.x=dx/max; target.y=dy/max; }
  el.addEventListener('pointerdown',e=>{ pid=e.pointerId; el.setPointerCapture(pid); el.classList.add('active'); update(e); });
  el.addEventListener('pointermove',e=>{ if(e.pointerId===pid) update(e); });
  function end(e){ if(e.pointerId!==pid) return; pid=null; target.x=target.y=0; knob.style.transform='translate(0,0)'; el.classList.remove('active'); }
  el.addEventListener('pointerup',end); el.addEventListener('pointercancel',end);
}
makeStick($('leftStick'), input.move); makeStick($('rightStick'), input.aim);
$('btnPause').onclick=togglePause;
$('btnMap').onclick=()=>{ miniMap.classList.toggle('hidden'); updateMiniMap(); };
$('btnAuto').onclick=()=>{ input.auto=!input.auto; $('btnAuto').classList.toggle('active',input.auto); showToast(input.auto?'自动射击已开':'自动射击已关'); };
if($('btnBag')) $('btnBag').onclick=showBag;
if($('btnMusic')){ $('btnMusic').onclick=()=>setMusic(!audioSys.music); $('btnMusic').textContent=localStorage.getItem('cute-abyss-bgm')==='1'?'BGM开':'BGM关'; $('btnMusic').classList.toggle('active',localStorage.getItem('cute-abyss-bgm')==='1'); }
nextRoomBtn.onclick=()=>{ const d=bestNextRoom(); if(d) moveToRoom(d.k,d.px,d.py); else showToast(state.room?.cleared?'附近没有可进房间。':'清完怪门才会打开。'); };
function togglePause(){ if(state.inModal || state.mode!=='play') return; state.paused=!state.paused; $('btnPause').textContent=state.paused?'继续':'暂停'; }

$('btnStart').onclick=()=>{ getAudio(); if(localStorage.getItem('cute-abyss-bgm')==='1') setMusic(true); localStorage.removeItem(SAVE_KEY); resetRun(); };
$('btnContinue').onclick=()=>{ getAudio(); if(localStorage.getItem('cute-abyss-bgm')==='1') setMusic(true); const s=loadRun(); if(s) resetRun(s); else showToast('没有找到存档，点“开始新局”。'); };
$('btnGuide').onclick=showGuide;
function showGuide(){
  const list = ITEMS.map(i=>`<div><b>${i.name}</b>｜${POOL_NAME[i.pool]}｜${QUALITY[i.q]}：${i.desc}</div>`).join('');
  showModal(`<h2>玩法说明 / BD图鉴</h2><div class="guideGrid">
    <div class="guideBox"><h3>核心流程</h3><p>探索房间 → 清怪开门 → 宝物房拿BD → Boss → 天使/恶魔强力分叉 → 下一层。共6层。</p><p>宝物房要钥匙；商店花金币；诅咒房会受伤但可能出强力黑暗道具。</p></div>
    <div class="guideBox"><h3>无红伤机制</h3><p>特殊房主要看红心伤害。魂心/黑心挡伤不会破“无红伤”。整层无红伤和Boss无红伤会显著提升特殊门概率。</p><p><span class="holy">天使房</span> 免费强力，偏稳；<span class="danger">恶魔房</span> 用红心上限换爆发。</p></div>
    <div class="guideBox"><h3>操作</h3><p>手机：左摇杆移动，右摇杆射击。默认自动瞄准，朋友用手机点开也能玩。</p><p>电脑：<span class="kbd">WASD</span>移动，鼠标按住/方向键辅助瞄准，<span class="kbd">Space</span>暂停。</p></div>
    <div class="guideBox"><h3>道具数量</h3><p>当前内置 ${ITEMS.length} 个道具，包含飞刃、光束、环形激光、多重、穿透、追踪、毒火冰、跟班、环绕物、低血狂暴、高血量增伤、无伤成长、复活等BD。</p></div>
  </div><h3>全部道具</h3><div class="itemList">${list}</div><div class="row" style="margin-top:14px"><button class="bigBtn" data-back-menu="1">返回</button></div>`);
  modal.querySelector('[data-back-menu]').onclick=()=>{ if(state.mode==='menu') location.reload(); else closeModal(); };
}

function loop(){
  const t=now(), dt=Math.min(.033,t-state.lastTime); state.lastTime=t;
  update(dt); draw(); requestAnimationFrame(loop);
}
loop();

})();

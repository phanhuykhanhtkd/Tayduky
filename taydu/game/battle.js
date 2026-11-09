// =====================================================================
//  CHIẾN ĐẤU THEO LƯỢT (máy chủ quyết định mọi kết quả)
// =====================================================================
const D = require('./data');
const L = require('./logic');

const PRIORITY = { defend: 3, item: 2, catch: 2, flee: 2, pet: 2 };

class Battle {
  /**
   * @param {object} char  nhân vật người chơi (tham chiếu – vật phẩm bị trừ trực tiếp)
   * @param {object[]} enemies danh sách quái đã tạo (logic.makeMonster…)
   * @param {object} opts { kind:'wild'|'boss'|'arena'|'peach'|'world', bossId, canFlee, canCatch, maxRounds, allies:[] }
   */
  constructor(char, enemies, opts = {}) {
    this.char = char;
    this.kind = opts.kind || 'wild';
    this.opts = opts;
    this.round = 0;
    this.over = false;
    this.result = null;
    this.captured = [];
    this.damageDealt = 0;
    this.units = [];

    const s = L.calcStats(char);
    this.units.push(this.mk({
      id: 'p', side: 0, kind: 'player', name: char.name, lvl: char.lvl, hero: { race: char.race, gender: char.gender, face: char.face, gear: L.gearBrief(char) },
      ...s, hp: Math.max(1, char.hp), mp: char.mp, skills: this.playerSkills(char), res: L.resistOf(char), element: char.menh || null,
    }));
    this.summoned = new Set();
    // đội Tiên sủng xuất chiến: tối đa 3 con (id pet, pet2, pet3)
    L.teamPets(char).forEach((pet, i) => { this.units.push(this.petUnit(pet, i ? 'pet' + (i + 1) : 'pet')); this.summoned.add(pet.uid); });
    (opts.allies || []).forEach((a, i) => this.units.push(this.mk({ ...a, id: 'a' + i, side: 0 })));
    enemies.forEach((e, i) => this.units.push(this.mk({ ...e, id: 'e' + i, side: 1, hp: e.hp ?? e.maxHp, mp: e.mp ?? e.maxMp,
      res: e.res || (e.boss ? { seal: 35, chaos: 50, stun: 60 } : { seal: Math.min(25, e.lvl * 0.15), chaos: Math.min(25, e.lvl * 0.15), stun: Math.min(25, e.lvl * 0.15) }) })));
    // số thứ tự vị trí mỗi bên (1–5) như bản gốc
    for (const side of [0, 1]) this.units.filter((u) => u.side === side).forEach((u, i) => (u.pos = i + 1));
  }

  petUnit(pet, id) {
    const v = L.petView(pet);
    const r = v.than ? 30 : 10;
    return this.mk({ id, side: 0, kind: 'pet', petUid: pet.uid, sid: pet.sid, name: pet.name, lvl: pet.lvl, icon: v.icon, element: v.element,
      grade: v.grade, mut: pet.mut, ...v.stats, hp: v.stats.maxHp, mp: v.stats.maxMp, skills: v.skills, res: { seal: r, chaos: r, stun: r },
      bossId: v.look || undefined, than: v.than || undefined, chan: v.chan || undefined });
  }

  playerSkills(c) {
    return [...c.skills.filter((k) => (D.SKILLS[k].lv || 1) <= c.lvl), ...(c.secretSkills || [])];
  }

  mk(u) {
    return Object.assign({ dead: false, defending: false, poison: 0, stun: 0, seal: 0, chaos: 0, burn: 0, shield: 0, shieldT: 0, buffs: [], element: null, res: { seal: 0, chaos: 0, stun: 0 } }, u);
  }

  get(id) { return this.units.find((u) => u.id === id); }
  alive(side) { return this.units.filter((u) => u.side === side && !u.dead); }

  snapshot() {
    return {
      kind: this.kind, round: this.round, over: this.over, maxRounds: this.opts.maxRounds || null, theme: this.opts.theme || undefined,
      canFlee: this.canFlee(), canCatch: this.opts.canCatch !== false && this.kind === 'wild',
      units: this.units.map((u) => ({
        id: u.id, side: u.side, kind: u.kind, name: u.name, lvl: u.lvl, icon: u.icon, hero: u.hero,
        element: u.element, grade: u.grade, mut: u.mut, boss: !!u.boss,
        hp: u.hp, maxHp: u.maxHp, mp: u.mp, maxMp: u.maxMp, dead: u.dead,
        poison: u.poison, stun: u.stun, seal: u.seal, chaos: u.chaos, burn: u.burn, shield: u.shield, pos: u.pos,
        buffs: u.buffs.map((b) => b.key), catchable: !!u.catchable,
        spd: u.spd, form: u.sid ? u.sid.split('.')[0] : undefined, bossId: u.bossId, hid: u.hid,
        phase: u.phase || undefined, phases: u.phases || undefined, elite: u.elite || undefined, nm: u.nm || undefined, than: u.than || undefined, chan: u.chan || undefined, shadow: u.shadow || undefined,
      })),
      skills: this.get('p').skills,
      bench: this.char.pets.filter((p) => !this.summoned.has(p.uid)).map((p) => ({ uid: p.uid, name: p.name, lvl: p.lvl })),
    };
  }

  canFlee() { return this.opts.canFlee !== false && this.kind !== 'boss'; }

  // boss nhiều giai đoạn: qua mốc máu → Cuồng Nộ (tăng công, tốc, giải khống chế, hồi chút máu, có thể gọi viện binh)
  phaseCheck(events) {
    for (const u of this.units) {
      if (!u.boss || u.dead || !(u.phases > 1)) continue;
      u.phase = u.phase || 1;
      const marks = u.phases === 2 ? [0.5] : [0.66, 0.33];
      if (u.phase > marks.length || u.hp / u.maxHp > marks[u.phase - 1]) continue;
      u.phase++;
      const last = u.phase === u.phases;
      u.buffs = u.buffs.filter((b) => b.key !== 'enrage');
      u.buffs.push({ key: 'enrage', turns: 999, atkUp: 0.18 * (u.phase - 1), dodgeUp: 0 });
      u.spd = Math.round(u.spd * 1.12); u.stun = 0; u.seal = 0; u.chaos = 0;
      const heal = Math.round(u.maxHp * (last ? 0.12 : 0.06)); u.hp = Math.min(u.maxHp, u.hp + heal);
      const ev = { k: 'phase', a: u.id, n: u.phase, of: u.phases, h: heal, msg: last ? `${u.name} hiện nguyên hình – CUỒNG NỘ!` : `${u.name} nổi giận – sức mạnh tăng vọt!` };
      if (this.opts.summonOnPhase && last && this.alive(1).length < 5) {
        const add = this.opts.summonOnPhase(u);
        ev.summons = [];
        for (const m of add.slice(0, 5 - this.alive(1).length)) {
          const id = 'e' + this.units.length;
          const nu = this.mk({ ...m, id, side: 1, hp: m.maxHp, mp: m.maxMp, res: { seal: 20, chaos: 20, stun: 20 } });
          nu.pos = Math.max(...this.units.filter((x) => x.side === 1).map((x) => x.pos || 0)) + 1;
          this.units.push(nu); ev.summons.push(id);
        }
      }
      events.push(ev);
    }
  }

  buffVal(u, key) { return u.buffs.reduce((s, b) => s + (b[key] || 0), 0); }

  // ---------- tính sát thương ----------
  calcHit(att, def, sk) {
    const type = sk ? sk.type : 'phys';
    const power = sk ? sk.power : 1;
    const ev = { t: def.id };
    if (type === 'phys') {
      const dodge = (def.dodge || 0) + this.buffVal(def, 'dodgeUp');
      if (Math.random() * 100 < dodge) { ev.miss = true; return ev; }
    } else if (Math.random() * 100 < this.buffVal(def, 'dodgeUp') * 0.5) { ev.miss = true; return ev; }
    const atkStat = type === 'phys' ? att.atk * (1 + this.buffVal(att, 'atkUp')) : att.matk * (1 + this.buffVal(att, 'atkUp') * 0.5);
    const defStat = type === 'phys' ? def.def : def.mdef;
    const K = 50 + att.lvl * 4;
    let dmg = atkStat * power * (K / (K + defStat));
    if (att.element && def.element) {
      if (D.ELEMENTS[att.element].beats === def.element) { dmg *= 1.25; ev.adv = 1; }
      else if (D.ELEMENTS[def.element].beats === att.element) { dmg *= 0.85; ev.adv = -1; }
    }
    if (def.defending) dmg *= 0.5;
    if (Math.random() * 100 < (att.crit || 5)) { dmg *= 1.6; ev.crit = true; }
    dmg = Math.max(1, Math.round(dmg * L.randf(0.92, 1.08)));
    if (this.kind === 'world' && def.boss) dmg = Math.round(dmg * 1); // chừa chỗ cân bằng
    ev.d = dmg;
    this.applyDamage(def, dmg, ev);
    if (sk && sk.stun && !def.dead && Math.random() < sk.stun * (1 - (def.res.stun || 0) / 100) * (def.boss ? 0.4 : 1)) { def.stun = Math.max(def.stun, 1); ev.stun = true; }
    if (sk && sk.poison && !def.dead) { def.poison = sk.poison; def.poisonDmg = Math.round(att.matk * 0.35); ev.poison = true; }
    if (sk && sk.burn && !def.dead) { def.burn = Math.max(def.burn, sk.burn); def.burnDmg = Math.round(att.matk * 0.3); ev.burn = true; }
    if (sk && sk.drain) { const h = Math.round(dmg * sk.drain); att.hp = Math.min(att.maxHp, att.hp + h); ev.drain = h; }
    if (sk && sk.mpDrain && !def.dead) { const m = Math.round(def.mp * sk.mpDrain); def.mp -= m; att.mp = Math.min(att.maxMp, att.mp + m); ev.mpDrain = m; }
    return ev;
  }

  // khống chế: tỉ lệ dính = chance × (1 − kháng%) ; boss giảm thêm
  applyStatus(att, def, sk) {
    const ev = { t: def.id, st: sk.status };
    const res = (def.res && def.res[sk.status]) || 0;
    const p = sk.chance * (1 - res / 100) * (def.boss ? 0.55 : 1);
    if (def.dead || Math.random() >= p) { ev.resist = true; return ev; }
    if (sk.status === 'stun') def.stun = Math.max(def.stun, sk.turns);
    else def[sk.status] = Math.max(def[sk.status] || 0, sk.turns);
    ev.ok = true; ev.turns = sk.turns;
    return ev;
  }

  applyDamage(u, dmg, ev) {
    if (u.shield > 0) { const ab = Math.min(u.shield, dmg); u.shield -= ab; dmg -= ab; if (ev) ev.absorb = ab; }
    u.hp = Math.max(0, u.hp - dmg);
    if (u.side === 1) this.damageDealt += dmg;
    if (u.hp <= 0) { u.dead = true; u.buffs = []; u.poison = 0; u.stun = 0; u.seal = 0; u.chaos = 0; u.burn = 0; u.shield = 0; if (ev) ev.dead = true; }
  }

  pickTarget(side, preferId) {
    const pool = this.alive(side);
    if (!pool.length) return null;
    const pref = preferId && pool.find((u) => u.id === preferId);
    return pref || L.pick(pool);
  }

  // ---------- AI ----------
  aiAction(u) {
    const foes = this.alive(1 - u.side);
    const friends = this.alive(u.side);
    if (!foes.length) return null;
    const usable = u.seal > 0 ? [] : (u.skills || []).map((k) => [k, D.SKILLS[k]]).filter(([, s]) => s && (s.mp || 0) <= u.mp);
    const deadAlly = this.units.find((f) => f.side === u.side && f.dead && f.id !== 'p' && !f.caught);
    const rev = usable.find(([, s]) => s.type === 'revive');
    if (rev && deadAlly && Math.random() < 0.6) return { type: 'skill', skill: rev[0], target: deadAlly.id };
    const ctl = usable.find(([, s]) => s.type === 'control');
    if (ctl && Math.random() < 0.3) { const t = foes.find((f) => !f.stun && !f.seal && !f.chaos && f.id === 'p') || foes.find((f) => !f.stun && !f.seal && !f.chaos); if (t) return { type: 'skill', skill: ctl[0], target: t.id }; }
    const healSk = usable.find(([, s]) => s.type === 'heal');
    const hurt = friends.filter((f) => f.hp / f.maxHp < 0.4).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
    if (healSk && hurt && Math.random() < 0.7) return { type: 'skill', skill: healSk[0], target: hurt.id };
    if (healSk && healSk[1].target === 'allAlly' && friends.filter((f) => f.hp / f.maxHp < 0.7).length >= 2 && Math.random() < 0.6) return { type: 'skill', skill: healSk[0], target: u.id };
    const offensive = usable.filter(([, s]) => s.type === 'phys' || s.type === 'magic');
    const buff = usable.find(([, s]) => s.type === 'buff');
    if (buff && !u.buffs.some((b) => b.key !== 'enrage') && !(buff[1].shield && u.shield > 0) && !((u.cd || {})[buff[0]] > this.round) && Math.random() < (buff[1].sig ? 0.4 : 0.25)) return { type: 'skill', skill: buff[0], target: u.id };
    let target;
    if (u.side === 1) {
      const pl = foes.find((f) => f.id === 'p');
      target = pl && Math.random() < 0.6 ? pl : L.pick(foes);
    } else {
      target = foes.slice().sort((a, b) => a.hp - b.hp)[0];
    }
    const sig = offensive.find(([, s]) => s.sig);
    if (sig && Math.random() < 0.4) return { type: 'skill', skill: sig[0], target: target.id };
    const skillChance = u.boss ? (u.phase > 1 ? 0.65 : 0.5) : u.kind === 'pet' ? 0.45 : 0.3;
    if (offensive.length && Math.random() < skillChance) return { type: 'skill', skill: L.pick(offensive)[0], target: target.id };
    return { type: 'attack', target: target.id };
  }

  // ---------- 1 hiệp ----------
  doRound(input) {
    if (this.over) return { events: [], snapshot: this.snapshot() };
    this.round++;
    const events = [];
    const me = this.get('p');
    const plan = [];

    // hành động người chơi
    let act = input || { type: 'attack' };
    if (me.dead) act = null;
    if (act) {
      if (act.type === 'skill') {
        const sk = D.SKILLS[act.skill];
        if (!sk || !me.skills.includes(act.skill)) act = { type: 'attack', target: act.target };
        else if (me.seal > 0) { events.push({ k: 'text', msg: 'Đang bị Phong Ấn – không thể dùng kỹ năng!' }); act = { type: 'attack', target: act.target }; }
        else if (me.mp < (sk.mp || 0)) { events.push({ k: 'text', msg: 'Nội lực không đủ!' }); act = { type: 'attack', target: act.target }; }
      }
      if (act.type === 'flee' && !this.canFlee()) act = { type: 'defend' };
      if (act.type === 'catch' && !this.snapshot().canCatch) act = { type: 'attack', target: act.target };
      if (!['attack', 'skill', 'defend', 'item', 'catch', 'flee', 'pet'].includes(act.type)) act = { type: 'attack' };
      plan.push({ u: me, a: act });
    }
    for (const u of this.units) {
      if (u.dead || u.id === 'p') continue;
      plan.push({ u, a: this.aiAction(u) });
    }
    // phòng thủ có hiệu lực ngay từ đầu hiệp
    for (const p of plan) if (p.a && p.a.type === 'defend') p.u.defending = true;
    plan.forEach((p) => { p.sp = (PRIORITY[p.a?.type] || 0) * 10000 + p.u.spd * L.randf(0.9, 1.1); });
    plan.sort((a, b) => b.sp - a.sp);

    for (const { u, a } of plan) {
      if (this.over) break;
      if (u.dead || !a) continue;
      if (u.stun > 0) { u.stun--; events.push({ k: 'stun', a: u.id }); continue; }
      if (u.chaos > 0) { // loạn hồn: đánh bừa một đơn vị bất kỳ, kể cả phe mình
        u.chaos--;
        const pool = this.units.filter((x) => !x.dead && x.id !== u.id);
        const t = L.pick(pool);
        if (t) { events.push({ k: 'chaos', a: u.id }); const hits = [this.calcHit(u, t, null)]; events.push({ k: 'atk', a: u.id, s: null, fx: 'hit', hits }); }
        this.checkEnd(events); continue;
      }
      this.exec(u, a, events);
      this.phaseCheck(events);
      this.checkEnd(events);
    }

    // cuối hiệp: độc, buff
    if (!this.over) {
      for (const u of this.units) {
        if (u.dead) continue;
        if (u.poison > 0) {
          const dmg = Math.max(1, u.poisonDmg || Math.round(u.maxHp * 0.05));
          const ev = { k: 'poison', t: u.id, d: dmg };
          this.applyDamage(u, dmg, ev);
          u.poison--;
          events.push(ev);
        }
        if (u.burn > 0 && !u.dead) {
          const dmg = Math.max(1, u.burnDmg || Math.round(u.maxHp * 0.04));
          const ev = { k: 'burn', t: u.id, d: dmg };
          this.applyDamage(u, dmg, ev); u.burn--; events.push(ev);
        }
        if (u.seal > 0) u.seal--;
        if (u.regenPct && !u.dead) { const h = Math.min(u.maxHp - u.hp, Math.round(u.maxHp * u.regenPct)); if (h > 0) { u.hp += h; events.push({ k: 'regen', t: u.id, h }); } }
        if (u.shieldT > 0 && --u.shieldT === 0) u.shield = 0;
        u.buffs = u.buffs.filter((b) => --b.turns > 0);
        u.defending = false;
      }
      this.phaseCheck(events);
      this.checkEnd(events);
    }
    if (!this.over && this.opts.maxRounds && this.round >= this.opts.maxRounds) {
      this.over = true;
      this.result = { outcome: 'timeout' };
      events.push({ k: 'text', msg: 'Hết thời gian khiêu chiến!' });
    }
    this.syncChar();
    return { events, snapshot: this.snapshot() };
  }

  exec(u, a, events) {
    const enemySide = 1 - u.side;
    if (a.type === 'defend') {
      const ev = { k: 'defend', a: u.id };
      if (u.id === 'p') { const m = Math.round(u.maxMp * 0.08); u.mp = Math.min(u.maxMp, u.mp + m); ev.mpGain = m; }
      events.push(ev); return;
    }
    if (a.type === 'pet') {
      const pet = this.char.pets.find((p) => p.uid === a.uid);
      if (!pet || this.summoned.has(pet.uid)) { events.push({ k: 'text', msg: 'Tiên sủng này không thể ra trận lúc này.' }); return; }
      const mine = this.units.filter((x) => x.side === 0 && x.kind === 'pet');
      let slot = mine.find((x) => x.dead);
      if (!slot && mine.length >= 3) slot = mine.slice().sort((x, y) => x.hp / x.maxHp - y.hp / y.maxHp)[0];
      const id = slot ? slot.id : ['pet', 'pet2', 'pet3'].find((k) => !this.get(k));
      const nu = this.petUnit(pet, id);
      nu.pos = slot ? slot.pos : Math.max(...this.units.filter((x) => x.side === 0).map((x) => x.pos || 0)) + 1;
      if (slot) this.units[this.units.indexOf(slot)] = nu; else this.units.splice(this.units.findIndex((x) => x.side === 1), 0, nu);
      this.summoned.add(pet.uid);
      events.push({ k: 'summon', a: u.id, t: id, name: pet.name, out: slot ? slot.name : null });
      return;
    }
    if (a.type === 'flee') {
      const foes = this.alive(1);
      const avg = foes.reduce((s, f) => s + f.spd, 0) / Math.max(1, foes.length);
      const p = Math.max(0.2, Math.min(0.95, 0.6 + (u.spd - avg) / 200));
      const ok = Math.random() < p;
      events.push({ k: 'flee', a: u.id, ok });
      if (ok) { this.over = true; this.result = { outcome: 'flee' }; }
      return;
    }
    if (a.type === 'item') {
      const it = D.ITEMS[a.item];
      if (!it || !['hp', 'mp'].includes(it.type) || !L.removeItem(this.char, a.item, 1)) { events.push({ k: 'text', msg: 'Không có vật phẩm này.' }); return; }
      const t = this.get(a.target) && !this.get(a.target).dead && this.get(a.target).side === u.side ? this.get(a.target) : u;
      const ev = { k: 'item', a: u.id, t: t.id, item: it.name, icon: it.icon };
      if (it.type === 'hp') { const before = t.hp; t.hp = Math.min(t.maxHp, t.hp + it.value); ev.h = t.hp - before; }
      else { const before = t.mp; t.mp = Math.min(t.maxMp, t.mp + it.value); ev.mpGain = t.mp - before; }
      events.push(ev);
      return;
    }
    if (a.type === 'catch') {
      const it = D.ITEMS[a.item];
      const t = this.get(a.target);
      const ev = { k: 'catch', a: u.id, t: a.target, item: a.item };
      if (!it || it.type !== 'catch' || !t || t.dead || t.side !== 1) { events.push({ k: 'text', msg: 'Chọn quái để thu phục.' }); return; }
      if (!t.catchable) { events.push({ k: 'text', msg: `${t.name} không thể thu phục!` }); return; }
      if (this.char.pets.length + this.captured.length >= D.CONFIG.petBag) { events.push({ k: 'text', msg: 'Túi Tiên sủng đã đầy (tối đa ' + D.CONFIG.petBag + ').' }); return; }
      if (!L.removeItem(this.char, a.item, 1)) { events.push({ k: 'text', msg: `Hết ${it.name}!` }); return; }
      const hpPct = t.hp / t.maxHp;
      let rate = it.value * D.GRADES[t.grade].catch * (1.15 - hpPct);
      if (t.lvl > this.char.lvl + 5) rate *= 0.5;
      if (t.mut) rate *= 0.6;
      rate = Math.max(0.03, Math.min(0.97, rate));
      ev.rate = Math.round(rate * 100);
      ev.ok = Math.random() < rate;
      if (ev.ok) {
        const mut = t.mut || Math.random() < 0.01;
        this.captured.push({ sid: t.sid, lvl: t.lvl, mut });
        t.dead = true; t.caught = true; ev.dead = true;
      }
      events.push(ev);
      return;
    }

    // tấn công / kỹ năng
    let sk = null;
    if (a.type === 'skill') {
      sk = D.SKILLS[a.skill];
      if (!sk || u.mp < (sk.mp || 0)) sk = null;
      else u.mp -= sk.mp || 0;
    }
    if (sk && sk.type === 'heal') {
      if (sk.target === 'allAlly') {
        const hits = this.alive(u.side).map((f) => { const h = Math.round(u.matk * sk.power * L.randf(0.95, 1.05) + 20), b0 = f.hp; f.hp = Math.min(f.maxHp, f.hp + h); return { t: f.id, h: f.hp - b0 }; });
        events.push({ k: 'skill', a: u.id, s: sk.name, fx: sk.fx, aoe: true, hits });
        return;
      }
      const t = this.get(a.target);
      const target = t && !t.dead && t.side === u.side ? t : this.alive(u.side).sort((x, y) => x.hp / x.maxHp - y.hp / y.maxHp)[0];
      const h = Math.round(u.matk * sk.power * L.randf(0.95, 1.05) + 20);
      const before = target.hp;
      target.hp = Math.min(target.maxHp, target.hp + h);
      events.push({ k: 'skill', a: u.id, s: sk.name, fx: sk.fx, hits: [{ t: target.id, h: target.hp - before }] });
      return;
    }
    if (sk && sk.type === 'buff') {
      u.buffs.push({ key: a.skill, turns: sk.buff.turns + 1, atkUp: sk.buff.atkUp || 0, dodgeUp: sk.buff.dodgeUp || 0 });
      if (u.side === 1) { u.cd = u.cd || {}; u.cd[a.skill] = this.round + sk.buff.turns + 3; } // quái/boss: hồi chiêu buff
      if (sk.shield) { u.shield = Math.round(u.maxHp * sk.shield); u.shieldT = sk.buff.turns + 1; }
      events.push({ k: 'buff', a: u.id, s: sk.name, fx: sk.fx, shield: u.shield || undefined });
      return;
    }
    if (sk && sk.type === 'revive') {
      const t = this.get(a.target);
      const target = t && t.dead && t.side === u.side && t.id !== 'p' && !t.caught ? t : this.units.find((x) => x.side === u.side && x.dead && x.id !== 'p' && !x.caught);
      if (!target) { u.mp += sk.mp || 0; events.push({ k: 'text', msg: 'Không có đồng đội nào cần hồi sinh.' }); return; }
      target.dead = false; target.hp = Math.round(target.maxHp * sk.power);
      events.push({ k: 'skill', a: u.id, s: sk.name, fx: sk.fx, hits: [{ t: target.id, h: target.hp, rev: true }] });
      return;
    }
    if (sk && sk.type === 'control') {
      const targets = sk.target === 'allEnemy' ? this.alive(enemySide) : [this.pickTarget(enemySide, a.target)].filter(Boolean);
      if (!targets.length) return;
      events.push({ k: 'skill', a: u.id, s: sk.name, fx: sk.fx, aoe: sk.target === 'allEnemy', hits: targets.map((t) => this.applyStatus(u, t, sk)) });
      return;
    }
    if (sk && sk.selfCost) { const c2 = Math.min(u.hp - 1, Math.round(u.maxHp * sk.selfCost)); u.hp -= c2; events.push({ k: 'selfcost', a: u.id, d: c2 }); }
    let targets;
    if (sk && sk.target === 'allEnemy') targets = this.alive(enemySide);
    else { const t = this.pickTarget(enemySide, a.target); targets = t ? [t] : []; }
    if (!targets.length) return;
    const hits = targets.map((t) => this.calcHit(u, t, sk));
    if (sk && sk.healAll) for (const f of this.alive(u.side)) { const h = Math.min(f.maxHp - f.hp, Math.round(f.maxHp * sk.healAll)); f.hp += h; if (h) hits.push({ t: f.id, h }); }
    events.push({ k: sk ? 'skill' : 'atk', a: u.id, s: sk ? sk.name : null, fx: sk ? sk.fx : 'hit', aoe: sk && sk.target === 'allEnemy', hits });
  }

  checkEnd(events) {
    if (this.over) return;
    const me = this.get('p');
    if (!this.alive(1).length) {
      this.over = true;
      this.result = { outcome: 'win' };
    } else if (me.dead || !this.alive(0).length) {
      this.over = true;
      this.result = { outcome: 'lose' };
    }
    if (this.over && events) events.push({ k: 'end', outcome: this.result.outcome });
  }

  syncChar() {
    const me = this.get('p');
    this.char.hp = me.hp;
    this.char.mp = me.mp;
  }
}

module.exports = { Battle };

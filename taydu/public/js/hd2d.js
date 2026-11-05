// =====================================================================
//  HD-2D: bộ dựng hình WebGL tự viết (không cần thư viện ngoài).
//  Mặt đất pixel trong không gian 3D có phối cảnh, nhân vật/nhà/cây là
//  "tấm bìa" đứng dựng (billboard) có bóng đổ theo mặt trời, sương xa,
//  đèn lồng chiếu sáng thật về đêm, mờ hai đầu kiểu ống kính tilt-shift.
// =====================================================================
const Hd2d = (() => {
  let gl = null, cv = null, ok = false, W = 0, H = 0, dpr = 1;
  let P = {}, quad = null, plane = null, fbo = null, view = null, proj = null, vp = null, ivp = null, eye = [0, 0, 0];
  const texCache = new WeakMap();

  // ---------- toán ma trận (cột chính) ----------
  const m4 = {
    persp(f, a, n, fa) { const t = 1 / Math.tan(f / 2), nf = 1 / (n - fa); return [t / a, 0, 0, 0, 0, t, 0, 0, 0, 0, (fa + n) * nf, -1, 0, 0, 2 * fa * n * nf, 0]; },
    look(e, c, u) {
      let z = [e[0] - c[0], e[1] - c[1], e[2] - c[2]]; let l = Math.hypot(...z); z = z.map((v) => v / l);
      let x = [u[1] * z[2] - u[2] * z[1], u[2] * z[0] - u[0] * z[2], u[0] * z[1] - u[1] * z[0]]; l = Math.hypot(...x); x = x.map((v) => v / l);
      const y = [z[1] * x[2] - z[2] * x[1], z[2] * x[0] - z[0] * x[2], z[0] * x[1] - z[1] * x[0]];
      return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -(x[0] * e[0] + x[1] * e[1] + x[2] * e[2]), -(y[0] * e[0] + y[1] * e[1] + y[2] * e[2]), -(z[0] * e[0] + z[1] * e[1] + z[2] * e[2]), 1];
    },
    mul(a, b) { const o = new Array(16); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k]; o[i * 4 + j] = s; } return o; },
    inv(m) {
      const [a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, a30, a31, a32, a33] = m;
      const b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12;
      const b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
      const d = 1 / (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06);
      return [(a11 * b11 - a12 * b10 + a13 * b09) * d, (a02 * b10 - a01 * b11 - a03 * b09) * d, (a31 * b05 - a32 * b04 + a33 * b03) * d, (a22 * b04 - a21 * b05 - a23 * b03) * d,
        (a12 * b08 - a10 * b11 - a13 * b07) * d, (a00 * b11 - a02 * b08 + a03 * b07) * d, (a32 * b02 - a30 * b05 - a33 * b01) * d, (a20 * b05 - a22 * b02 + a23 * b01) * d,
        (a10 * b10 - a11 * b08 + a13 * b06) * d, (a01 * b08 - a00 * b10 - a03 * b06) * d, (a30 * b04 - a31 * b02 + a33 * b00) * d, (a21 * b02 - a20 * b04 - a23 * b00) * d,
        (a11 * b07 - a10 * b09 - a12 * b06) * d, (a00 * b09 - a01 * b07 + a02 * b06) * d, (a31 * b01 - a30 * b03 - a32 * b00) * d, (a20 * b03 - a21 * b01 + a22 * b00) * d];
    },
    xf(m, v) { const [x, y, z, w = 1] = v; return [m[0] * x + m[4] * y + m[8] * z + m[12] * w, m[1] * x + m[5] * y + m[9] * z + m[13] * w, m[2] * x + m[6] * y + m[10] * z + m[14] * w, m[3] * x + m[7] * y + m[11] * z + m[15] * w]; },
  };

  // ---------- shader ----------
  const LIGHT = `
    uniform vec3 uAmb; uniform vec4 uL[12]; uniform vec3 uLC; uniform float uLK; uniform vec3 uEye; uniform vec3 uFog; uniform vec2 uFogR;
    vec3 shade(vec3 c, vec3 wp) {
      vec3 add = vec3(0.0);
      for (int i = 0; i < 12; i++) { vec4 l = uL[i]; if (l.z <= 0.0) continue; float d = distance(wp.xz, l.xy); float k = clamp(1.0 - d / l.z, 0.0, 1.0); add += uLC * k * k * l.w; }
      vec3 col = c * (uAmb + add * uLK);
      float f = smoothstep(uFogR.x, uFogR.y, distance(wp, uEye));
      return mix(col, uFog, f);
    }`;
  const SRC = {
    sky: ['attribute vec2 p; varying float v; void main(){ v=p.y*0.5+0.5; gl_Position=vec4(p,0.999,1.0); }',
      'precision highp float; varying float v; uniform vec3 uTop, uBot; void main(){ gl_FragColor=vec4(mix(uBot,uTop,smoothstep(0.0,1.0,v)),1.0); }'],
    ground: ['attribute vec3 p; uniform mat4 uVP; uniform vec4 uRect; varying vec3 wp; varying vec2 uv; void main(){ wp=p; uv=(p.xz-uRect.xy)/uRect.zw; gl_Position=uVP*vec4(p,1.0); }',
      `precision highp float; varying vec3 wp; varying vec2 uv; uniform sampler2D uT; uniform vec3 uBase; uniform float uHasT; ${LIGHT}
       void main(){ vec3 c = uBase; if (uHasT > 0.5 && uv.x>=0.0 && uv.x<=1.0 && uv.y>=0.0 && uv.y<=1.0) c = texture2D(uT, uv).rgb; gl_FragColor=vec4(shade(c, wp),1.0); }`],
    sprite: [`attribute vec2 c; uniform mat4 uVP; uniform vec3 uPos; uniform vec2 uSize; uniform vec4 uUV; uniform float uFlip; uniform float uTilt; uniform float uShadow; uniform vec2 uSun;
       varying vec2 uv; varying vec3 wp;
       void main(){ vec2 k=c; uv=vec2(uFlip>0.5?1.0-k.x:k.x, 1.0-k.y); uv=uUV.xy+uv*uUV.zw;
         vec3 w;
         if (uShadow > 0.5) w = uPos + vec3((k.x-0.5)*uSize.x + uSun.x*k.y*uSize.y, 0.015, -uSun.y*k.y*uSize.y);
         else w = uPos + vec3((k.x-0.5)*uSize.x, k.y*uSize.y*cos(uTilt), -k.y*uSize.y*sin(uTilt));
         wp=w; gl_Position=uVP*vec4(w,1.0); }`,
      `precision highp float; varying vec2 uv; varying vec3 wp; uniform sampler2D uT; uniform float uShadow; uniform float uAlpha; uniform vec3 uTint; ${LIGHT}
       void main(){ vec4 t=texture2D(uT,uv); if (t.a<0.5) discard;
         if (uShadow>0.5) { gl_FragColor=vec4(0.0,0.0,0.05,0.32*uAlpha); return; }
         gl_FragColor=vec4(shade(t.rgb*uTint, wp), uAlpha); }`],
    glow: ['attribute vec2 c; uniform mat4 uVP; uniform vec3 uPos; uniform vec2 uSize; varying vec2 q; void main(){ q=c*2.0-1.0; vec3 w=uPos+vec3(q.x*uSize.x, q.y*uSize.y, 0.0); gl_Position=uVP*vec4(w,1.0); }',
      'precision highp float; varying vec2 q; uniform vec4 uCol; void main(){ float d=length(q); float a=pow(clamp(1.0-d,0.0,1.0),2.0); gl_FragColor=vec4(uCol.rgb*a*uCol.a, 1.0); }'],
    post: ['attribute vec2 p; varying vec2 uv; void main(){ uv=p*0.5+0.5; gl_Position=vec4(p,0.0,1.0); }',
      `precision highp float; varying vec2 uv; uniform sampler2D uT; uniform vec2 uPx; uniform float uFocus; uniform float uBlur;
       void main(){ float b = smoothstep(0.16, 0.55, abs(uv.y-uFocus)) * uBlur;
         vec3 c = texture2D(uT, uv).rgb;
         if (b > 0.05) { vec3 s = c;
           s += texture2D(uT, uv+uPx*vec2( 1.0, 0.0)*b).rgb; s += texture2D(uT, uv+uPx*vec2(-1.0, 0.0)*b).rgb;
           s += texture2D(uT, uv+uPx*vec2( 0.0, 1.0)*b).rgb; s += texture2D(uT, uv+uPx*vec2( 0.0,-1.0)*b).rgb;
           s += texture2D(uT, uv+uPx*vec2( 0.7, 0.7)*b*1.6).rgb; s += texture2D(uT, uv+uPx*vec2(-0.7, 0.7)*b*1.6).rgb;
           s += texture2D(uT, uv+uPx*vec2( 0.7,-0.7)*b*1.6).rgb; s += texture2D(uT, uv+uPx*vec2(-0.7,-0.7)*b*1.6).rgb;
           c = s / 9.0; }
         float l = dot(c, vec3(0.299,0.587,0.114)); c = mix(vec3(l), c, 1.12); c = (c-0.5)*1.06+0.5;
         float v = smoothstep(1.15, 0.35, length(uv-vec2(0.5,0.55))*1.3); c *= mix(0.72, 1.0, v);
         gl_FragColor = vec4(c, 1.0); }`],
  };
  function prog(name) {
    const [vs, fs] = SRC[name];
    const mk = (t, s) => { const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(name + ': ' + gl.getShaderInfoLog(sh)); return sh; };
    const p = gl.createProgram(); gl.attachShader(p, mk(gl.VERTEX_SHADER, vs)); gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(name + ' link: ' + gl.getProgramInfoLog(p));
    const u = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(p, i); const key = a.name.replace(/\[0\]$/, ''); u[key] = gl.getUniformLocation(p, a.name); }
    const a = {}; const na = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < na; i++) { const at = gl.getActiveAttrib(p, i); a[at.name] = gl.getAttribLocation(p, at.name); }
    return { p, u, a };
  }
  function buf(data) { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW); return b; }

  function init(canvas) {
    cv = canvas;
    try {
      gl = cv.getContext('webgl', { antialias: false, alpha: false, depth: true, stencil: false, premultipliedAlpha: false, powerPreference: 'high-performance' });
      if (!gl) return (ok = false);
      for (const k of Object.keys(SRC)) P[k] = prog(k);
      quad = buf([0, 0, 1, 0, 0, 1, 1, 1]);
      plane = { full: buf([-1, -1, 1, -1, -1, 1, 1, 1]) };
      cv.addEventListener('webglcontextlost', (e) => { e.preventDefault(); ok = false; });
      ok = true;
    } catch (e) { console.warn('[HD-2D] tắt:', e.message); ok = false; }
    return ok;
  }

  function resize(w, h, ratio) {
    if (!ok) return;
    dpr = Math.min(2, ratio || 1); W = w; H = h;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    if (fbo) { gl.deleteFramebuffer(fbo.f); gl.deleteTexture(fbo.t); gl.deleteRenderbuffer(fbo.d); }
    const f = gl.createFramebuffer(), t = gl.createTexture(), d = gl.createRenderbuffer();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, cv.width, cv.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
    gl.bindRenderbuffer(gl.RENDERBUFFER, d); gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, cv.width, cv.height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, d);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    fbo = { f, t, d };
  }

  function tex(canvas, dynamic) {
    let t = texCache.get(canvas);
    if (!t || dynamic) {
      if (!t) { t = gl.createTexture(); texCache.set(canvas, t); }
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
      for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.NEAREST], [gl.TEXTURE_MAG_FILTER, gl.NEAREST], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
    }
    return t;
  }

  // ---------- bầu trời & ánh sáng theo vùng ----------
  const SKY = {
    heaven: [[0.62, 0.55, 0.86], [1.0, 0.92, 0.86]], city: [[0.42, 0.58, 0.78], [0.93, 0.86, 0.72]], forest: [[0.36, 0.6, 0.62], [0.82, 0.9, 0.78]],
    river: [[0.38, 0.62, 0.82], [0.86, 0.93, 0.9]], desert: [[0.55, 0.2, 0.12], [1.0, 0.68, 0.4]], cave: [[0.06, 0.04, 0.1], [0.2, 0.15, 0.26]], snow: [[0.55, 0.66, 0.82], [0.95, 0.97, 1.0]],
  };
  const BASE = { heaven: [0.9, 0.86, 0.95], city: [0.45, 0.42, 0.36], forest: [0.3, 0.4, 0.22], river: [0.25, 0.45, 0.5], desert: [0.55, 0.3, 0.16], cave: [0.18, 0.14, 0.22], snow: [0.85, 0.9, 0.96] };

  let lastCam = null;
  // camera bám theo nhân vật: thấy ~8.6 ô bề ngang, không lộ khoảng trống phía dưới bản đồ
  function camera(focusX, focusZ, mapW, mapH) {
    const aspect = W / H;
    const fov = 30 * Math.PI / 180, pitch = 47 * Math.PI / 180, f = fov / 2;
    const span = 8.6 / aspect;
    const d = span / (2 * Math.tan(f));
    const h = d * Math.sin(pitch), back = d * Math.cos(pitch);
    const nearOff = back - h / Math.tan(pitch + f); // điểm chạm đất của mép dưới màn hình (so với tâm)
    const farOff = pitch - f > 0.05 ? back - h / Math.tan(pitch - f) : -999;
    let tz = focusZ - 0.6;
    tz = Math.min(tz, mapH + 0.15 - nearOff);
    tz = Math.max(tz, -1.2 - farOff);
    const half = 4.3;
    const tx = Math.max(half - 0.3, Math.min(mapW - half + 0.3, focusX));
    const target = [tx, 0, tz];
    eye = [tx, h, tz + back];
    view = m4.look(eye, target, [0, 1, 0]);
    proj = m4.persp(fov, aspect, 0.5, d * 4);
    vp = m4.mul(proj, view); ivp = m4.inv(vp);
    lastCam = { d, tz, tx };
    return d;
  }

  // world → toạ độ màn hình (px css)
  function project(x, y, z) {
    if (!vp) return null;
    const c = m4.xf(vp, [x, y, z, 1]);
    if (c[3] <= 0) return null;
    return { x: (c[0] / c[3] * 0.5 + 0.5) * W, y: (1 - (c[1] / c[3] * 0.5 + 0.5)) * H, s: 1 / c[3] };
  }
  // màn hình → điểm trên mặt đất (y = 0)
  function pick(sx, sy) {
    if (!ivp) return null;
    const nx = sx / W * 2 - 1, ny = 1 - sy / H * 2;
    const a = m4.xf(ivp, [nx, ny, -1, 1]), b = m4.xf(ivp, [nx, ny, 1, 1]);
    const p0 = [a[0] / a[3], a[1] / a[3], a[2] / a[3]], p1 = [b[0] / b[3], b[1] / b[3], b[2] / b[3]];
    const t = p0[1] / (p0[1] - p1[1]);
    return { x: p0[0] + (p1[0] - p0[0]) * t, z: p0[2] + (p1[2] - p0[2]) * t };
  }

  function setLight(pr, S) {
    gl.uniform3fv(pr.u.uAmb, S.amb); gl.uniform3fv(pr.u.uLC, [1.0, 0.72, 0.42]); gl.uniform1f(pr.u.uLK, S.lightK);
    gl.uniform4fv(pr.u.uL, S.lights); gl.uniform3fv(pr.u.uEye, eye); gl.uniform3fv(pr.u.uFog, S.fog); gl.uniform2fv(pr.u.uFogR, S.fogR);
  }

  // S: { theme, ground: canvas, groundDyn, mapW, mapH, focusZ, focusY, sprites:[{c,x,z,w,h,flip,tilt,shadow,tint,alpha}], glows:[{x,y,z,w,h,col:[r,g,b,a]}], night, dusk, dark, lights:[[x,z,r,i]] }
  function render(S) {
    if (!ok || !fbo) return false;
    const d = camera(S.focusX ?? S.mapW / 2, S.focusZ, S.mapW, S.mapH);
    const sky = SKY[S.theme] || SKY.city;
    let amb = [1.0, 1.0, 1.0], lightK = 0.0;
    if (S.dark) { amb = [0.62, 0.6, 0.8]; lightK = 1.4; }
    if (S.dusk) { amb = [1.0, 0.86, 0.76]; lightK = 0.6; }
    if (S.night) { amb = S.dark ? [0.42, 0.42, 0.62] : [0.46, 0.52, 0.78]; lightK = 1.6; }
    const nightMix = S.night ? 0.55 : S.dusk ? 0.25 : 0;
    const top = sky[0].map((v, i) => v * (1 - nightMix) + [0.05, 0.07, 0.18][i] * nightMix), bot = sky[1].map((v, i) => v * (1 - nightMix) + [0.18, 0.2, 0.36][i] * nightMix);
    const lights = new Float32Array(48);
    (S.lights || []).slice(0, 12).forEach((l, i) => lights.set([l[0], l[1], l[2], l[3] ?? 1], i * 4));
    const L = { amb, lightK, lights, fog: bot, fogR: [d * 1.05, d * 2.4] };

    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.f);
    gl.viewport(0, 0, cv.width, cv.height);
    gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND);
    // trời
    let pr = P.sky; gl.useProgram(pr.p);
    gl.uniform3fv(pr.u.uTop, top); gl.uniform3fv(pr.u.uBot, bot);
    gl.bindBuffer(gl.ARRAY_BUFFER, plane.full); gl.enableVertexAttribArray(pr.a.p); gl.vertexAttribPointer(pr.a.p, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);

    // mặt đất: nền rộng + bản đồ
    pr = P.ground; gl.useProgram(pr.p); setLight(pr, L);
    gl.uniformMatrix4fv(pr.u.uVP, false, vp);
    gl.uniform4fv(pr.u.uRect, [0, 0, S.mapW, S.mapH]);
    gl.uniform3fv(pr.u.uBase, BASE[S.theme] || BASE.city);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex(S.ground, S.groundDyn)); gl.uniform1i(pr.u.uT, 0);
    const big = 40, pts = [-big, -0.03, -big, S.mapW + big, -0.03, -big, -big, -0.03, S.mapH + big, S.mapW + big, -0.03, S.mapH + big];
    if (!plane.big || plane.bigKey !== S.mapW + ',' + S.mapH) { plane.big = buf(pts); plane.map = buf([0, 0, 0, S.mapW, 0, 0, 0, 0, S.mapH, S.mapW, 0, S.mapH]); plane.bigKey = S.mapW + ',' + S.mapH; }
    gl.enableVertexAttribArray(pr.a.p);
    gl.uniform1f(pr.u.uHasT, 0); gl.bindBuffer(gl.ARRAY_BUFFER, plane.big); gl.vertexAttribPointer(pr.a.p, 3, gl.FLOAT, false, 0, 0); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.uniform1f(pr.u.uHasT, 1); gl.bindBuffer(gl.ARRAY_BUFFER, plane.map); gl.vertexAttribPointer(pr.a.p, 3, gl.FLOAT, false, 0, 0); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // bóng đổ (trước) rồi tấm bìa
    pr = P.sprite; gl.useProgram(pr.p); setLight(pr, L);
    gl.uniformMatrix4fv(pr.u.uVP, false, vp);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.enableVertexAttribArray(pr.a.c); gl.vertexAttribPointer(pr.a.c, 2, gl.FLOAT, false, 0, 0);
    gl.uniform1i(pr.u.uT, 0);
    const sun = S.night ? [0.18, 0.28] : S.dusk ? [0.9, 0.35] : [0.42, 0.55];
    gl.uniform2fv(pr.u.uSun, sun);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
    gl.uniform1f(pr.u.uShadow, 1);
    for (const s of S.sprites) {
      if (s.shadow === false) continue;
      gl.bindTexture(gl.TEXTURE_2D, tex(s.c));
      gl.uniform3fv(pr.u.uPos, [s.x, 0, s.z]); gl.uniform2fv(pr.u.uSize, [s.w, s.h]); gl.uniform4fv(pr.u.uUV, s.uv || [0, 0, 1, 1]);
      gl.uniform1f(pr.u.uFlip, s.flip ? 1 : 0); gl.uniform1f(pr.u.uAlpha, s.alpha ?? 1);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    gl.depthMask(true);
    gl.uniform1f(pr.u.uShadow, 0);
    const list = S.sprites.slice().sort((a, b) => a.z - b.z);
    for (const s of list) {
      gl.bindTexture(gl.TEXTURE_2D, tex(s.c));
      gl.uniform3fv(pr.u.uPos, [s.x, s.y || 0, s.z]); gl.uniform2fv(pr.u.uSize, [s.w, s.h]); gl.uniform4fv(pr.u.uUV, s.uv || [0, 0, 1, 1]);
      gl.uniform1f(pr.u.uFlip, s.flip ? 1 : 0); gl.uniform1f(pr.u.uTilt, s.tilt ?? 0.6); gl.uniform1f(pr.u.uAlpha, s.alpha ?? 1);
      gl.uniform3fv(pr.u.uTint, s.tint || [1, 1, 1]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    // ánh sáng cộng (đèn lồng, cổng dịch chuyển)
    pr = P.glow; gl.useProgram(pr.p);
    gl.uniformMatrix4fv(pr.u.uVP, false, vp);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.enableVertexAttribArray(pr.a.c); gl.vertexAttribPointer(pr.a.c, 2, gl.FLOAT, false, 0, 0);
    gl.blendFunc(gl.ONE, gl.ONE); gl.depthMask(false);
    for (const g of S.glows || []) { gl.uniform3fv(pr.u.uPos, [g.x, g.y, g.z]); gl.uniform2fv(pr.u.uSize, [g.w, g.h]); gl.uniform4fv(pr.u.uCol, g.col); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }
    gl.depthMask(true); gl.disable(gl.BLEND);

    // hậu kỳ: tilt-shift + màu + vignette
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, cv.width, cv.height);
    gl.disable(gl.DEPTH_TEST);
    pr = P.post; gl.useProgram(pr.p);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, fbo.t); gl.uniform1i(pr.u.uT, 0);
    gl.uniform2fv(pr.u.uPx, [1 / cv.width * 1.6, 1 / cv.height * 1.6]);
    const fp = project(S.focusX ?? S.mapW / 2, 0.6, S.focusZ); gl.uniform1f(pr.u.uFocus, fp ? 1 - fp.y / H : 0.5); gl.uniform1f(pr.u.uBlur, S.blur ?? 2.2);
    gl.bindBuffer(gl.ARRAY_BUFFER, plane.full); gl.enableVertexAttribArray(pr.a.p); gl.vertexAttribPointer(pr.a.p, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    return true;
  }

  return { init, resize, render, project, pick, get ok() { return ok; }, get cam() { return lastCam; } };
})();

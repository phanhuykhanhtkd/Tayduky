// =====================================================================
//  HD-2D: bộ dựng hình WebGL tự viết (không cần thư viện ngoài).
//  Mặt đất pixel trong không gian 3D có phối cảnh, nhân vật/nhà/cây là
//  "tấm bìa" đứng dựng (billboard) có bóng đổ theo mặt trời, sương xa,
//  đèn lồng chiếu sáng thật về đêm, mờ hai đầu kiểu ống kính tilt-shift.
// =====================================================================
function Hd2dFactory(OPT = {}) {
  const SMS = OPT.shadow || 2048;
  let gl = null, cv = null, ok = false, W = 0, H = 0, dpr = 1;
  let P = {}, quad = null, plane = null, fbo = null, view = null, proj = null, vp = null, ivp = null, eye = [0, 0, 0];
  let texCache = new WeakMap();

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
    ortho(l, r, b, t, n, f) { return [2 / (r - l), 0, 0, 0, 0, 2 / (t - b), 0, 0, 0, 0, -2 / (f - n), 0, -(r + l) / (r - l), -(t + b) / (t - b), -(f + n) / (f - n), 1]; },
    xf(m, v) { const [x, y, z, w = 1] = v; return [m[0] * x + m[4] * y + m[8] * z + m[12] * w, m[1] * x + m[5] * y + m[9] * z + m[13] * w, m[2] * x + m[6] * y + m[10] * z + m[14] * w, m[3] * x + m[7] * y + m[11] * z + m[15] * w]; },
  };

  // ---------- shader ----------
  const LIGHT = `
    uniform vec3 uAmb; uniform vec3 uExpo; uniform vec4 uL[12]; uniform vec3 uLCs[12]; uniform float uLK; uniform vec3 uEye; uniform vec3 uFog; uniform vec2 uFogR;
    vec3 lamps(vec3 wp) { vec3 add = vec3(0.0);
      for (int i = 0; i < 12; i++) { vec4 l = uL[i]; if (l.z <= 0.0) continue; float d = distance(wp.xz, l.xy); float k = clamp(1.0 - d / l.z, 0.0, 1.0); add += uLCs[i] * k * k * l.w; }
      return add; }
    vec3 fogit(vec3 col, vec3 wp, float k) { float f = smoothstep(uFogR.x, uFogR.y, distance(wp, uEye)); return mix(col, uFog, f * k); }
    vec3 shade(vec3 c, vec3 wp) { return fogit(c * (uAmb + lamps(wp) * uLK), wp, 1.0); }`;
  const SHADOW = `
    uniform sampler2D uSM; uniform float uShK; uniform vec2 uSMpx;
    float unpackD(vec4 v) { return dot(v, vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)); }
    float shadowF(vec4 l) {
      vec3 s = l.xyz / l.w * 0.5 + 0.5;
      if (s.x < 0.0 || s.x > 1.0 || s.y < 0.0 || s.y > 1.0 || s.z > 1.0) return 1.0;
      float b = 0.0016, r = 0.0;
      r += step(s.z - b, unpackD(texture2D(uSM, s.xy + vec2(-0.7, -0.4) * uSMpx)));
      r += step(s.z - b, unpackD(texture2D(uSM, s.xy + vec2(0.4, -0.7) * uSMpx)));
      r += step(s.z - b, unpackD(texture2D(uSM, s.xy + vec2(0.7, 0.4) * uSMpx)));
      r += step(s.z - b, unpackD(texture2D(uSM, s.xy + vec2(-0.4, 0.7) * uSMpx)));
      return mix(1.0, r * 0.25, uShK); }`;
  const NOISE = `
    float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float vnoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash2(i), hash2(i + vec2(1.0, 0.0)), f.x), mix(hash2(i + vec2(0.0, 1.0)), hash2(i + vec2(1.0, 1.0)), f.x), f.y); }`;
  const SRC = {
    sky: ['attribute vec2 p; varying vec2 sp; void main(){ sp=p; gl_Position=vec4(p,0.999,1.0); }',
      `precision highp float; varying vec2 sp; uniform vec3 uTop; uniform vec3 uBot; uniform float uHor; uniform float uTime; uniform float uClouds; uniform vec3 uCloudC; uniform vec2 uSunP; uniform vec3 uSunG; ${NOISE}
       void main(){ float h = max(sp.y - uHor, 0.0); vec3 c = mix(uBot, uTop, smoothstep(0.0, 1.0, h / max(0.4, 1.0 - uHor)));
         if (uClouds > 0.0 && h > 0.002) { float dd = 0.32 / (h + 0.035); vec2 uv = vec2(sp.x * dd * 1.4 + uTime * 0.012, dd * 1.2 - uTime * 0.004);
           float n = vnoise(uv * 1.2) * 0.58 + vnoise(uv * 2.7 + 3.0) * 0.3 + vnoise(uv * 6.3) * 0.12;
           float cl = smoothstep(0.48, 0.8, n) * uClouds * smoothstep(0.0, 0.12, h);
           c = mix(c, uCloudC * (0.86 + 0.2 * smoothstep(0.5, 0.9, n)), cl * 0.9); }
         vec2 sd = (sp - uSunP) * vec2(1.6, 1.0); float r2 = dot(sd, sd);
         c += uSunG * (exp(-r2 * 9.0) * 0.45 + exp(-r2 * 220.0) * 0.8);
         gl_FragColor = vec4(c, 1.0); }`],
    ground: ['attribute vec3 p; uniform mat4 uVP; uniform vec4 uRect; varying vec3 wp; varying vec2 uv; void main(){ wp=p; uv=(p.xz-uRect.xy)/uRect.zw; gl_Position=uVP*vec4(p,1.0); }',
      `precision highp float; varying vec3 wp; varying vec2 uv; uniform sampler2D uT; uniform vec3 uBase; uniform float uHasT; ${LIGHT}
       void main(){ vec3 c = uBase; if (uHasT > 0.5 && uv.x>=0.0 && uv.x<=1.0 && uv.y>=0.0 && uv.y<=1.0) c = texture2D(uT, uv).rgb; gl_FragColor=vec4(shade(c, wp),1.0); }`],
    // lưới 3D: địa hình + nhà + cây (nắng, bóng đổ, mây trôi, gió lay, phát sáng)
    mesh: [`attribute vec3 p; attribute vec3 n; attribute vec3 c; attribute vec3 f;
       uniform mat4 uVP; uniform mat4 uLVP; uniform float uTime;
       varying vec3 vN; varying vec3 vC; varying vec3 vF; varying vec3 wp; varying vec4 vL;
       void main(){ vec3 q = p;
         if (f.x > 0.0) { float s = uTime * 1.7 + p.x * 0.9 + p.z * 0.7; q.x += sin(s) * 0.055 * f.x; q.z += cos(s * 0.83) * 0.03 * f.x; }
         wp = q; vN = n; vC = c; vF = f; vL = uLVP * vec4(q, 1.0); gl_Position = uVP * vec4(q, 1.0); }`,
      `precision highp float;
       varying vec3 vN; varying vec3 vC; varying vec3 vF; varying vec3 wp; varying vec4 vL;
       uniform sampler2D uT; uniform vec4 uRect; uniform vec3 uSunD; uniform vec3 uSunC; uniform vec3 uSky; uniform vec3 uGnd;
       uniform float uTime; uniform float uCloud; uniform vec3 uPS; uniform float uPZ;
       ${LIGHT} ${SHADOW} ${NOISE}
       void main(){
         if (uPS.z > 0.0 && wp.y > 0.22 && wp.z > uPZ + 0.2) { float d = distance(gl_FragCoord.xy, uPS.xy) / uPS.z;
           if (d < 1.0) { float ign = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))); if (ign < 0.72 * (1.0 - d * d)) discard; } }
         vec3 alb = vC;
         if (vF.z > 0.001) { vec2 uv = (wp.xz - uRect.xy) / uRect.zw; if (uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0) alb = mix(alb, texture2D(uT, uv).rgb, vF.z); }
         alb *= mix(1.0, 0.9 + 0.2 * vnoise(wp.xz * 5.0 + wp.y * 4.0), 1.0 - vF.z);
         vec3 N = normalize(vN);
         float sh = shadowF(vL);
         float df = max(dot(N, uSunD), 0.0); df = mix(df, smoothstep(0.0, 0.42, df), 0.45);
         float cl = 1.0 - uCloud * smoothstep(0.42, 0.74, vnoise(wp.xz * 0.16 + vec2(uTime * 0.045, uTime * 0.018)));
         vec3 amb = mix(uGnd, uSky, N.y * 0.5 + 0.5);
         vec3 col = alb * (amb + uSunC * df * sh * cl);
         col += alb * uSky * pow(1.0 - max(dot(N, normalize(uEye - wp)), 0.0), 3.0) * 0.16;
         col = mix(col, alb * 1.3 + vec3(0.06), vF.y);
         col += alb * lamps(wp) * uLK;
         gl_FragColor = vec4(fogit(col * uExpo, wp, 1.0), 1.0); }`],
    // độ sâu từ phía mặt trời (đóng gói RGBA)
    depth: ['attribute vec3 p; uniform mat4 uLVP; void main(){ gl_Position = uLVP * vec4(p, 1.0); }',
      'precision highp float; void main(){ vec4 e = fract(vec4(1.0, 255.0, 65025.0, 16581375.0) * gl_FragCoord.z); e -= e.yzww * vec4(1.0/255.0, 1.0/255.0, 1.0/255.0, 0.0); gl_FragColor = e; }'],
    // mặt nước / dung nham / băng / biển mây
    water: ['attribute vec3 p; uniform mat4 uVP; uniform mat4 uLVP; varying vec3 wp; varying vec4 vL; void main(){ wp = p; vL = uLVP * vec4(p, 1.0); gl_Position = uVP * vec4(p, 1.0); }',
      `precision highp float; varying vec3 wp; varying vec4 vL;
       uniform sampler2D uD; uniform vec4 uRect; uniform vec3 uDeep; uniform vec3 uShal; uniform vec3 uSunD; uniform vec3 uSunC; uniform vec3 uSky; uniform float uTime; uniform float uMode;
       ${LIGHT} ${SHADOW} ${NOISE}
       float wv(vec2 q, float t) { return vnoise(q * 2.3 + vec2(t * 0.38, t * 0.21)) * 0.6 + vnoise(q * 5.1 - vec2(t * 0.27, t * 0.43)) * 0.4; }
       void main(){
         vec2 q = wp.xz; float t = uTime;
         vec2 uv = (q - uRect.xy) / uRect.zw;
         float dep = uMode > 2.5 ? 1.0 : texture2D(uD, clamp(uv, 0.0, 1.0)).r;
         vec3 V = normalize(uEye - wp);
         float sh = shadowF(vL);
         vec3 col; float a = 1.0;
         if (uMode < 0.5) {
           float e = 0.04, h0 = wv(q, t), hx = wv(q + vec2(e, 0.0), t), hz = wv(q + vec2(0.0, e), t);
           vec3 n = normalize(vec3(-(hx - h0) / e * 0.07, 1.0, -(hz - h0) / e * 0.07));
           float fr = pow(1.0 - max(dot(n, V), 0.0), 3.0) * 0.7 + 0.08;
           float sp = pow(max(dot(reflect(-uSunD, n), V), 0.0), 70.0);
           col = mix(uShal, uDeep, smoothstep(0.0, 0.8, dep)) * (uSky + uSunC * 0.55 * sh);
           col = mix(col, uSky * 1.05 + 0.05, fr * 0.55);
           col += uSunC * sp * 1.8 * sh;
           col += vec3(0.9, 0.97, 1.0) * smoothstep(0.62, 0.9, h0) * 0.08 * (1.0 - dep);
           float foam = smoothstep(0.2, 0.0, dep + (vnoise(q * 7.0 + t * 0.6) - 0.5) * 0.16 - 0.035 * sin(t * 1.9 + q.x * 2.3 + q.y));
           col = mix(col, vec3(0.94, 0.98, 1.0) * (0.75 + 0.3 * sh), foam * 0.85);
           col += lamps(wp) * uLK * 0.25;
           a = max(mix(0.5, 0.9, smoothstep(0.0, 0.5, dep)), foam);
         } else if (uMode < 1.5) {
           float f1 = vnoise(q * 1.8 + vec2(t * 0.14, t * 0.09)), f2 = vnoise(q * 4.6 - vec2(t * 0.22, -t * 0.05));
           float hot = smoothstep(0.35, 0.78, f1 * 0.65 + f2 * 0.35);
           col = mix(uDeep * 0.7, uShal * 1.25, hot) + vec3(1.0, 0.85, 0.4) * pow(hot, 5.0) * 0.7;
           col = mix(col, uDeep * 0.5, smoothstep(0.25, 0.0, dep) * 0.6);
         } else if (uMode < 2.5) {
           float cr = smoothstep(0.035, 0.0, abs(vnoise(q * 2.6) - 0.5)) + smoothstep(0.03, 0.0, abs(vnoise(q * 5.3 + 4.0) - 0.5)) * 0.6;
           float sp = pow(max(dot(reflect(-uSunD, vec3(0.0, 1.0, 0.0)), V), 0.0), 16.0);
           col = mix(uShal, uDeep, dep * 0.6) * (uSky + uSunC * 0.6 * sh) + uSunC * sp * 0.5;
           col = mix(col, vec3(1.0), clamp(cr, 0.0, 1.0) * 0.45); a = 0.94;
         } else {
           float c1 = vnoise(q * 0.32 + vec2(t * 0.035, t * 0.012)), c2 = vnoise(q * 1.05 - vec2(t * 0.055, 0.0)), c3 = vnoise(q * 2.6 + vec2(0.0, t * 0.04));
           float cc = c1 * 0.6 + c2 * 0.28 + c3 * 0.12;
           col = mix(uDeep, uShal, smoothstep(0.28, 0.72, cc)) * (0.8 + 0.25 * (uSky.r + uSunC.r));
         }
         gl_FragColor = vec4(fogit(col * uExpo, wp, uMode > 2.5 ? 0.45 : 1.0), a); }`],
    sprite: [`attribute vec2 c; uniform mat4 uVP; uniform mat4 uLVP; uniform vec3 uPos; uniform vec2 uSize; uniform vec4 uUV; uniform float uFlip; uniform float uTilt; uniform float uShadow; uniform vec2 uSun;
       varying vec2 uv; varying vec3 wp; varying vec4 vL;
       void main(){ vec2 k=c; uv=vec2(uFlip>0.5?1.0-k.x:k.x, 1.0-k.y); uv=uUV.xy+uv*uUV.zw;
         vec3 w;
         if (uShadow > 0.5) w = uPos + vec3((k.x-0.5)*uSize.x + uSun.x*k.y*uSize.y, 0.015, -uSun.y*k.y*uSize.y);
         else w = uPos + vec3((k.x-0.5)*uSize.x, k.y*uSize.y*cos(uTilt), -k.y*uSize.y*sin(uTilt));
         wp=w; vL = uLVP * vec4(w + vec3(0.0, 0.0, 0.08), 1.0); gl_Position=uVP*vec4(w,1.0); }`,
      `precision highp float; varying vec2 uv; varying vec3 wp; varying vec4 vL; uniform sampler2D uT; uniform float uShadow; uniform float uAlpha; uniform vec3 uTint; ${LIGHT} ${SHADOW}
       void main(){ vec4 t=texture2D(uT,uv); if (t.a<0.5) discard;
         if (uShadow>0.5) { gl_FragColor=vec4(0.0,0.0,0.05,0.32*uAlpha); return; }
         float sh = shadowF(vL);
         gl_FragColor=vec4(shade(t.rgb*uTint*mix(0.68, 1.0, sh), wp), uAlpha); }`],
    decal: ['attribute vec2 c; uniform mat4 uVP; uniform vec4 uD; uniform float uY; varying vec2 q; void main(){ q = c * 2.0 - 1.0; float cs = cos(uD.w), sn = sin(uD.w); vec2 r = vec2(q.x * cs - q.y * sn, q.x * sn + q.y * cs) * uD.z; gl_Position = uVP * vec4(uD.x + r.x, uY, uD.y + r.y, 1.0); }',
      'precision highp float; varying vec2 q; uniform sampler2D uT; uniform vec4 uCol; void main(){ vec4 t = texture2D(uT, q * 0.5 + 0.5); gl_FragColor = vec4(uCol.rgb * t.a * uCol.a, 1.0); }'],
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
      cv.addEventListener('webglcontextrestored', () => { P = {}; world = null; sfbo = null; texCache = new WeakMap(); init(cv); if (W) resize(W, H, dpr); });
      ok = true;
    } catch (e) { console.warn('[HD-2D] tắt:', e.message); ok = false; }
    return ok;
  }

  function resize(w, h, ratio) {
    if (!ok) return;
    dpr = Math.min(2, ratio || 1); W = w; H = h;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    if (fbo) { gl.deleteFramebuffer(fbo.f); gl.deleteTexture(fbo.t); gl.deleteRenderbuffer(fbo.d); }
    fbo = target(cv.width, cv.height, gl.LINEAR);
  }
  function target(w, h, filt) {
    const f = gl.createFramebuffer(), t = gl.createTexture(), d = gl.createRenderbuffer();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, filt], [gl.TEXTURE_MAG_FILTER, filt], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
    gl.bindRenderbuffer(gl.RENDERBUFFER, d); gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h);
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, d);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { f, t, d, w, h };
  }

  function tex(canvas, dynamic, linear) {
    let t = texCache.get(canvas);
    if (!t || dynamic) {
      if (!t) { t = gl.createTexture(); texCache.set(canvas, t); }
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
      const fl = linear ? gl.LINEAR : gl.NEAREST;
      for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, fl], [gl.TEXTURE_MAG_FILTER, fl], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
    }
    return t;
  }

  // gắn thuộc tính đỉnh (tắt hết các kênh cũ trước để tránh lỗi "out of range")
  const MESH = [['p', 3, 0], ['n', 3, 12], ['c', 3, 24], ['f', 3, 36]];
  function attrs(pr, b, spec, stride) {
    for (let i = 0; i < 6; i++) gl.disableVertexAttribArray(i);
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    for (const [nm, sz, off] of spec) { const loc = pr.a[nm]; if (loc == null || loc < 0) continue; gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, sz, gl.FLOAT, false, stride, off); }
  }

  // ---------- thế giới 3D ----------
  let world = null, sfbo = null, lvp = null, shadowKey = '', lowFx = false;
  function setWorld(Wd) {
    if (!ok) return;
    if (world) { for (const b of [world.tv, world.ti, world.mv, world.wv, world.cv2]) if (b) gl.deleteBuffer(b); }
    if (!Wd) { world = null; return; }
    const w = { key: Wd.key, src: Wd };
    w.tv = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, w.tv); gl.bufferData(gl.ARRAY_BUFFER, Wd.terrain.v, gl.STATIC_DRAW);
    w.ti = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, w.ti); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Wd.terrain.i, gl.STATIC_DRAW); w.tn = Wd.terrain.i.length;
    w.mv = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, w.mv); gl.bufferData(gl.ARRAY_BUFFER, Wd.mesh, gl.STATIC_DRAW); w.mn = Wd.mesh.length / 12;
    if (Wd.water) { const [x0, z0, x1, z1] = Wd.water.rect, y = Wd.water.y; w.wv = buf([x0, y, z0, x1, y, z0, x0, y, z1, x1, y, z1]); }
    if (Wd.clouds) { const y = Wd.clouds.y, B = Wd.clouds.B || 60; w.cv2 = buf([-B, y, -B, B + 12, y, -B, -B, y, B + 20, B + 12, y, B + 20]); }
    w.dt = tex(Wd.depthTex, true, true);
    world = w; shadowKey = '';
  }
  const hasWorld = (key) => !!world && (!key || world.key === key);

  function renderShadow(L) {
    if (!sfbo) sfbo = target(SMS, SMS, gl.NEAREST);
    const B = world.src.shadowBox || [-6, 18, -1.5, 8, -7, 21.5];
    const ctr = [(B[0] + B[1]) / 2, 0, (B[4] + B[5]) / 2], e = [ctr[0] + L[0] * 40, L[1] * 40, ctr[2] + L[2] * 40];
    const lv = m4.look(e, ctr, [0, 1, 0]);
    let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
    for (const x of [B[0], B[1]]) for (const y of [B[2], B[3]]) for (const z of [B[4], B[5]]) { const p = m4.xf(lv, [x, y, z, 1]); for (let i = 0; i < 3; i++) { mn[i] = Math.min(mn[i], p[i]); mx[i] = Math.max(mx[i], p[i]); } }
    lvp = m4.mul(m4.ortho(mn[0], mx[0], mn[1], mx[1], -mx[2] - 1, -mn[2] + 1), lv);
    gl.bindFramebuffer(gl.FRAMEBUFFER, sfbo.f);
    gl.viewport(0, 0, SMS, SMS);
    gl.clearColor(1, 1, 1, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.disable(gl.BLEND);
    const pr = P.depth; gl.useProgram(pr.p); gl.uniformMatrix4fv(pr.u.uLVP, false, lvp);
    attrs(pr, world.tv, MESH, 48); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, world.ti); gl.drawElements(gl.TRIANGLES, world.tn, gl.UNSIGNED_SHORT, 0);
    attrs(pr, world.mv, MESH, 48); gl.drawArrays(gl.TRIANGLES, 0, world.mn);
  }

  // ---------- bầu trời & ánh sáng theo vùng ----------
  const SKY = {
    heaven: [[0.62, 0.55, 0.86], [1.0, 0.92, 0.86]], city: [[0.42, 0.58, 0.78], [0.86, 0.88, 0.86]], forest: [[0.36, 0.6, 0.62], [0.74, 0.86, 0.8]],
    river: [[0.38, 0.62, 0.82], [0.8, 0.9, 0.92]], desert: [[0.55, 0.2, 0.12], [0.96, 0.7, 0.48]], cave: [[0.06, 0.04, 0.1], [0.16, 0.12, 0.24]], snow: [[0.55, 0.66, 0.82], [0.9, 0.94, 1.0]],
  };
  const BASE = { heaven: [0.9, 0.86, 0.95], city: [0.45, 0.42, 0.36], forest: [0.3, 0.4, 0.22], river: [0.25, 0.45, 0.5], desert: [0.55, 0.3, 0.16], cave: [0.18, 0.14, 0.22], snow: [0.85, 0.9, 0.96] };
  const nrm3 = (a) => { const l = Math.hypot(a[0], a[1], a[2]); return [a[0] / l, a[1] / l, a[2] / l]; };
  function sunOf(S) {
    let L, sunC, sky, gnd, shK = 1;
    if (S.night) { L = nrm3([0.5, 1, 0.4]); sunC = [0.2, 0.25, 0.38]; sky = [0.3, 0.34, 0.52]; gnd = [0.16, 0.17, 0.27]; shK = 0.55; }
    else if (S.dusk) { L = nrm3([-1.15, 0.8, 0.35]); sunC = [0.66, 0.44, 0.28]; sky = [0.56, 0.5, 0.56]; gnd = [0.38, 0.3, 0.28]; }
    else { L = nrm3([-0.55, 1, 0.5]); sunC = [0.47, 0.44, 0.38]; sky = [0.62, 0.64, 0.7]; gnd = [0.42, 0.4, 0.36]; }
    if (S.dark) { sunC = sunC.map((v) => v * 0.4); sky = [0.4, 0.38, 0.56]; gnd = [0.22, 0.2, 0.3]; shK = 0.5; }
    if (S.theme === 'heaven' && !S.night) { sky = sky.map((v) => v * 1.06); gnd = [0.6, 0.56, 0.64]; }
    if (S.theme === 'snow' && !S.night) { gnd = [0.6, 0.62, 0.68]; }
    return { L, sunC, sky, gnd, shK, key: (S.night ? 'n' : S.dusk ? 'd' : 'a') + (S.dark ? 'k' : '') };
  }

  let lastCam = null;
  // camera bám theo nhân vật: thấy ~8.6 ô bề ngang, phối cảnh rõ khối 3D
  function camera(focusX, focusZ, mapW, mapH) {
    const aspect = W / H;
    const fov = 36 * Math.PI / 180, pitch = 50 * Math.PI / 180, f = fov / 2;
    const span = 8.6 / aspect;
    const d = span / (2 * Math.tan(f));
    const h = d * Math.sin(pitch), back = d * Math.cos(pitch);
    const nearOff = back - h / Math.tan(pitch + f); // điểm chạm đất của mép dưới màn hình (so với tâm)
    const farOff = pitch - f > 0.05 ? back - h / Math.tan(pitch - f) : -999;
    let tz = focusZ - 0.6;
    tz = Math.min(tz, mapH + 0.15 - nearOff);
    tz = Math.max(tz, (world ? -3.2 : -1.2) - farOff);
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

  // camera cố định (sân đấu): S.cam = { target:[x,y,z], dist, pitch(độ), fov(độ), yaw(độ) }
  function cameraFixed(C) {
    const aspect = W / H, fov = (C.fov || 40) * Math.PI / 180, pitch = (C.pitch || 20) * Math.PI / 180, yaw = (C.yaw || 0) * Math.PI / 180;
    const t = C.target || [0, 0, 0], d = C.dist || 16;
    eye = [t[0] + Math.sin(yaw) * Math.cos(pitch) * d, t[1] + Math.sin(pitch) * d, t[2] + Math.cos(yaw) * Math.cos(pitch) * d];
    view = m4.look(eye, t, [0, 1, 0]);
    proj = m4.persp(fov, aspect, 0.3, C.far || 220);
    if (C.shift) proj[9] -= C.shift; // ống kính dịch trục (lens shift): hạ/nâng khung hình mà không đổi góc nhìn
    vp = m4.mul(proj, view); ivp = m4.inv(vp);
    lastCam = { d, tz: t[2], tx: t[0], fx: -Math.sin(yaw) };
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
    gl.uniform3fv(pr.u.uAmb, S.amb); gl.uniform3fv(pr.u.uLCs, S.lcols); if (pr.u.uExpo) gl.uniform3fv(pr.u.uExpo, S.expo); gl.uniform1f(pr.u.uLK, S.lightK);
    gl.uniform4fv(pr.u.uL, S.lights); gl.uniform3fv(pr.u.uEye, eye); gl.uniform3fv(pr.u.uFog, S.fog); gl.uniform2fv(pr.u.uFogR, S.fogR);
  }
  function setSun(pr, sun) {
    if (pr.u.uSunD) { gl.uniform3fv(pr.u.uSunD, sun.L); gl.uniform3fv(pr.u.uSunC, sun.sunC); gl.uniform3fv(pr.u.uSky, sun.sky); }
    if (pr.u.uGnd) gl.uniform3fv(pr.u.uGnd, sun.gnd);
    if (pr.u.uSM) { gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, sfbo ? sfbo.t : null); gl.uniform1i(pr.u.uSM, 1); gl.uniform1f(pr.u.uShK, world && sfbo && !lowFx ? sun.shK : 0); gl.uniform2fv(pr.u.uSMpx, [1 / SMS, 1 / SMS]); gl.activeTexture(gl.TEXTURE0); }
    if (pr.u.uLVP) gl.uniformMatrix4fv(pr.u.uLVP, false, lvp || vp);
  }

  // S: { theme, ground: canvas, groundDyn, mapW, mapH, focusX, focusZ, sprites:[{c,x,y,z,w,h,flip,tilt,shadow,tint,alpha}], glows:[{x,y,z,w,h,col:[r,g,b,a]}], night, dusk, dark, lights:[[x,z,r,i]], time, fade }
  function render(S) {
    if (!ok || !fbo) return false;
    const d = S.cam ? cameraFixed(S.cam) : camera(S.focusX ?? S.mapW / 2, S.focusZ, S.mapW, S.mapH);
    const sky = SKY[S.theme] || SKY.city;
    let amb = [1.0, 1.0, 1.0], lightK = 0.0;
    if (S.dark) { amb = [0.62, 0.6, 0.8]; lightK = 1.4; }
    if (S.dusk) { amb = [1.0, 0.86, 0.76]; lightK = 0.6; }
    if (S.night) { amb = S.dark ? [0.42, 0.42, 0.62] : [0.46, 0.52, 0.78]; lightK = 1.6; }
    const nightMix = S.night ? 0.55 : S.dusk ? 0.25 : 0;
    const top = sky[0].map((v, i) => v * (1 - nightMix) + [0.05, 0.07, 0.18][i] * nightMix), bot = sky[1].map((v, i) => v * (1 - nightMix) + [0.18, 0.2, 0.36][i] * nightMix);
    const lights = new Float32Array(48), lcols = new Float32Array(36);
    (S.lights || []).slice(0, 12).forEach((l, i) => { lights.set([l[0], l[1], l[2], l[3] ?? 1], i * 4); lcols.set(l[4] || [1.0, 0.72, 0.42], i * 3); });
    if (S.amb) amb = amb.map((v, i) => v * S.amb[i]);
    if (S.lightK != null) lightK = S.lightK;
    const L = { amb, lightK, lights, lcols, expo: S.expo || [1, 1, 1], fog: S.fog || bot, fogR: S.fogR || [d * 1.12, d * 2.3] };
    const sun = sunOf(S);
    const tm = S.time || 0;
    lowFx = !!S.low;
    if (world && !lowFx && shadowKey !== world.key + sun.key) { renderShadow(sun.L); shadowKey = world.key + sun.key; }

    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.f);
    gl.viewport(0, 0, cv.width, cv.height);
    gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND);
    // trời
    let pr = P.sky; gl.useProgram(pr.p);
    gl.uniform3fv(pr.u.uTop, S.sky ? S.sky.top : top); gl.uniform3fv(pr.u.uBot, S.sky ? S.sky.bot : bot);
    { let hor = -3; if (S.sky) { const fwd = [eye[0] + (lastCam.fx || 0) * 500, 0, eye[2] - 500], c = m4.xf(vp, [fwd[0], 0, fwd[2], 1]); hor = c[3] > 0 ? c[1] / c[3] : -3; }
      gl.uniform1f(pr.u.uHor, hor); gl.uniform1f(pr.u.uTime, S.time || 0); gl.uniform1f(pr.u.uClouds, S.sky ? S.sky.clouds ?? 1 : 0);
      gl.uniform3fv(pr.u.uCloudC, S.sky && S.sky.cloud || [1, 1, 1]); gl.uniform2fv(pr.u.uSunP, S.sky && S.sky.sunP || [0.5, 0.7]); gl.uniform3fv(pr.u.uSunG, S.sky && S.sky.sunG || [0, 0, 0]); }
    attrs(pr, plane.full, [['p', 2, 0]], 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex(S.ground, S.groundDyn));

    if (world) {
      // địa hình + vật thể 3D
      pr = P.mesh; gl.useProgram(pr.p); setLight(pr, L); setSun(pr, sun);
      gl.uniformMatrix4fv(pr.u.uVP, false, vp);
      gl.uniform4fv(pr.u.uRect, S.groundRect || [0, 0, S.mapW, S.mapH]); gl.uniform1i(pr.u.uT, 0);
      gl.uniform1f(pr.u.uTime, tm); gl.uniform1f(pr.u.uCloud, S.night ? 0 : world.src.cloudShadow);
      let ps = [0, 0, 0], pz = 0;
      if (S.fade) { const p = project(S.fade[0], 0.95, S.fade[1]), q = project(S.fade[0] + 1, 0.95, S.fade[1]); if (p && q) { ps = [p.x * dpr, (H - p.y) * dpr, Math.abs(q.x - p.x) * 1.05 * dpr]; pz = S.fade[1]; } }
      gl.uniform3fv(pr.u.uPS, ps); gl.uniform1f(pr.u.uPZ, pz);
      attrs(pr, world.tv, MESH, 48); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, world.ti); gl.drawElements(gl.TRIANGLES, world.tn, gl.UNSIGNED_SHORT, 0);
      attrs(pr, world.mv, MESH, 48); gl.drawArrays(gl.TRIANGLES, 0, world.mn);
      // biển mây (Thiên Đình)
      const wr = (wd, b, rect) => {
        pr = P.water; gl.useProgram(pr.p); setLight(pr, L); setSun(pr, sun);
        gl.uniformMatrix4fv(pr.u.uVP, false, vp); gl.uniform1f(pr.u.uTime, tm); gl.uniform1f(pr.u.uMode, wd.mode);
        gl.uniform3fv(pr.u.uDeep, wd.deep); gl.uniform3fv(pr.u.uShal, wd.shal);
        gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, world.dt); gl.uniform1i(pr.u.uD, 2); gl.activeTexture(gl.TEXTURE0);
        gl.uniform4fv(pr.u.uRect, rect);
        attrs(pr, b, [['p', 3, 0]], 0); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      };
      const dr = world.src.depthRect || [0, 0, S.mapW, S.mapH];
      if (world.cv2) wr(world.src.clouds, world.cv2, dr);
      if (world.wv) { gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false); wr(world.src.water, world.wv, dr); gl.depthMask(true); gl.disable(gl.BLEND); }
    } else {
      // mặt đất phẳng (dự phòng)
      pr = P.ground; gl.useProgram(pr.p); setLight(pr, L);
      gl.uniformMatrix4fv(pr.u.uVP, false, vp);
      gl.uniform4fv(pr.u.uRect, [0, 0, S.mapW, S.mapH]);
      gl.uniform3fv(pr.u.uBase, BASE[S.theme] || BASE.city);
      gl.uniform1i(pr.u.uT, 0);
      const big = 40, pts = [-big, -0.03, -big, S.mapW + big, -0.03, -big, -big, -0.03, S.mapH + big, S.mapW + big, -0.03, S.mapH + big];
      if (!plane.big || plane.bigKey !== S.mapW + ',' + S.mapH) { plane.big = buf(pts); plane.map = buf([0, 0, 0, S.mapW, 0, 0, 0, 0, S.mapH, S.mapW, 0, S.mapH]); plane.bigKey = S.mapW + ',' + S.mapH; }
      gl.uniform1f(pr.u.uHasT, 0); attrs(pr, plane.big, [['p', 3, 0]], 0); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.uniform1f(pr.u.uHasT, 1); attrs(pr, plane.map, [['p', 3, 0]], 0); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    // bóng đổ (trước) rồi tấm bìa
    pr = P.sprite; gl.useProgram(pr.p); setLight(pr, L); setSun(pr, sun);
    gl.uniformMatrix4fv(pr.u.uVP, false, vp);
    attrs(pr, quad, [['c', 2, 0]], 0);
    gl.uniform1i(pr.u.uT, 0);
    gl.uniform2fv(pr.u.uSun, [-sun.L[0] / sun.L[1], sun.L[2] / sun.L[1]].map((v) => v * (S.night ? 0.45 : 1)));
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
    gl.uniform1f(pr.u.uShadow, 1);
    for (const s of S.sprites) {
      if (s.shadow === false) continue;
      gl.bindTexture(gl.TEXTURE_2D, tex(s.c));
      gl.uniform3fv(pr.u.uPos, [s.x, s.y && s.y > 0.2 ? s.y : 0, s.z]); gl.uniform2fv(pr.u.uSize, [s.w, s.h]); gl.uniform4fv(pr.u.uUV, s.uv || [0, 0, 1, 1]);
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
    // pháp trận dưới đất (cộng sáng, có phối cảnh)
    if (S.decals && S.decals.length) {
      pr = P.decal; gl.useProgram(pr.p); gl.uniformMatrix4fv(pr.u.uVP, false, vp); attrs(pr, quad, [['c', 2, 0]], 0);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE); gl.depthMask(false); gl.uniform1i(pr.u.uT, 0);
      for (const dc of S.decals) { gl.bindTexture(gl.TEXTURE_2D, tex(dc.tex, false, true)); gl.uniform4fv(pr.u.uD, [dc.x, dc.z, dc.r, dc.rot || 0]); gl.uniform1f(pr.u.uY, dc.y ?? 0.03); gl.uniform4fv(pr.u.uCol, dc.col); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }
      gl.depthMask(true);
    }
    // ánh sáng cộng (đèn lồng, cổng dịch chuyển)
    pr = P.glow; gl.useProgram(pr.p);
    gl.uniformMatrix4fv(pr.u.uVP, false, vp);
    attrs(pr, quad, [['c', 2, 0]], 0);
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
    attrs(pr, plane.full, [['p', 2, 0]], 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    return true;
  }

  return { init, resize, render, project, pick, setWorld, hasWorld, get ok() { return ok; }, get cam() { return lastCam; } };
}
const Hd2d = Object.assign(Hd2dFactory(), { create: Hd2dFactory });

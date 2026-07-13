/* ============================================================
   THE ASCENT — the hero's full-bleed backdrop (C0).
   One fullscreen fragment shader, written by hand on raw WebGL:
   no three.js, no library. One draw call per frame.

   The image: the limb of Earth low in the frame in the minutes
   before dawn — a razor-thin amber atmosphere shell along the
   curve, the sun's blaze still below the horizon, procedural
   stars above, film grain over everything. A single point of
   light lifts off the limb and accelerates away on a gravity-
   turn arc, leaving a trail that evaporates behind it: escape
   velocity, abstracted to one spark. The cycle repeats quietly.

   Every colour is read from tokens.css at runtime (§14.6).
   Interaction wiring lives in c0-hero.js; this module only
   knows how to draw.
   ============================================================ */

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uDrift;   // pointer parallax, lerped upstream, ~[-1, 1]
uniform float uScroll;  // 0 at page top -> 1 as the hero scrolls away
uniform float uDawn;    // entrance: 0 = starlit night, 1 = full dawn
uniform vec3  uNight;   // --sky-top
uniform vec3  uPlum;    // --sky-mid
uniform vec3  uAmber;   // --sky-horizon
uniform vec3  uSun;     // --dawn-sun

float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

/* one ascent track: a spark leaving Earth on a gravity-turn arc, with an
   evaporating exhaust trail. Each track launches once per cycle from a pad
   picked by hashing the cycle index, so several tracks with different cycle
   lengths give frequent, sometimes-simultaneous launches. Returns the
   light contribution (trail + spark), already faded in/out per flight. */
float ascent(vec2 p, vec2 C, float R, float time, float cycle, float seed) {
  float ci = floor(time / cycle);
  float pad = floor(hash21(vec2(ci, seed)) * 5.0);     // 0..4, varies per cycle
  float az = -0.38 + pad * 0.12;                       // pad azimuths along the limb
  vec2 A = C + normalize(vec2(az, 1.0)) * R;           // launch point on the limb
  float dir = step(0.45, hash21(vec2(ci, seed + 17.3))) * 2.0 - 1.0; // ~45% bend west
  vec2 B = A + vec2(0.06 * dir, 0.55);                 // rises vertically at first...
  float bend = 0.55 + hash21(vec2(ci, seed + 9.1)) * 0.6; // ...then bends by a varying amount,
  vec2 D = vec2(A.x * 0.4 + bend * dir, 1.05);         // east or west — paths may cross
  float t = fract(time / cycle);
  float sTip = pow(smoothstep(0.03, 0.93, t), 1.7);    // holds, then accelerates away
  float fade = smoothstep(0.0, 0.05, t) * (1.0 - smoothstep(0.88, 1.0, t));
  if (fade < 0.003) return 0.0;

  /* the exhaust trail: distance to the polyline, blended with max() so
     segment joints don't double up into beads; age runs continuously
     along each segment, and old exhaust disperses — wider, fainter —
     until it evaporates a short way behind the spark */
  float trail = 0.0;
  vec2 prev = A;
  for (int i = 1; i <= 32; i++) {
    float sv = sTip * float(i) / 32.0;
    vec2 q = mix(mix(A, B, sv), mix(B, D, sv), sv);    // quadratic bezier
    vec2 pa = p - prev, ba = q - prev;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-7), 0.0, 1.0);
    float dist = length(pa - ba * h);
    float age = sTip - (sv - (1.0 - h) * sTip / 32.0); // age at the closest point
    float sharp = mix(320.0, 130.0, clamp(age * 4.0, 0.0, 1.0));
    trail = max(trail, exp(-dist * sharp) * exp(-age * 10.0));
    prev = q;
  }
  vec2 tip = mix(mix(A, B, sTip), mix(B, D, sTip), sTip);
  float dTip = length(p - tip);
  float spark = exp(-dTip * 210.0) * 1.5 + exp(-dTip * 26.0) * 0.10;
  return (trail * 0.5 + spark) * fade;
}

/* one grid layer of stars: sparse cells, anti-aliased points, slow twinkle */
float starLayer(vec2 p, float scale, float t) {
  vec2 g = p * scale + vec2(t * 0.006, 0.0);   // barely-perceptible sidereal drift
  vec2 id = floor(g);
  vec2 f = fract(g);
  float seed = hash21(id);
  vec2 pos = vec2(hash21(id + 1.3), hash21(id + 2.7)) * 0.7 + 0.15;
  float m = smoothstep(0.07, 0.0, length(f - pos));
  float presence = step(0.91, seed);                       // ~1 cell in 11 holds a star
  float twinkle = 0.65 + 0.35 * sin(t * (0.4 + seed * 1.6) + seed * 40.0);
  float bright = pow(hash21(id + 4.1), 3.0);               // most stars dim, a few bright
  return m * presence * twinkle * bright;
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;   // aspect-true, y up, centre 0

  // camera: pointer parallax, and scrolling pans the view up past the limb
  p += uDrift * vec2(0.020, 0.014);
  p.y += uScroll * 0.32;

  /* ---- geometry: the limb of Earth ---- */
  float R = 2.4;
  vec2 C = vec2(0.0, -0.26 - R);          // limb crests ~24% up the frame
  float d = length(p - C) - R;            // signed height above the limb
  float above = max(d, 0.0);

  vec2 toP = normalize(p - C);
  vec2 sunDir = normalize(vec2(0.17, 1.0));   // dawn point sits right of centre
  float facing = clamp(dot(toP, sunDir), 0.0, 1.0);
  float broad = pow(facing, 5.0);             // wide twilight wash
  float tight = pow(facing, 22.0);            // hot spot where the sun will rise

  /* ---- sky: near-black zenith warming toward the horizon ---- */
  float horizon = exp(-above * 2.1);
  vec3 col = mix(uNight * 0.75, uPlum * 0.50, horizon * (0.25 + 0.75 * broad) * uDawn);

  /* ---- stars, fading into the dawn band and vanishing behind Earth ---- */
  float starMask = smoothstep(0.012, 0.05, d) * (1.0 - horizon * broad * 0.85 * uDawn);
  float s = starLayer(p, 21.0, uTime) * 0.9
          + starLayer(p + 7.31, 47.0, uTime * 0.8) * 0.5;
  col += vec3(0.82, 0.86, 1.0) * s * starMask;

  /* ---- the planet: a dark mass with a faintly lit edge ---- */
  vec3 body = uNight * 0.55 * (1.0 + 0.35 * tight * uDawn);
  col = mix(col, body, smoothstep(0.003, -0.012, d));

  /* ---- atmosphere: plum wash, amber band, razor rim, sun blaze ----
     belowFade kills the glow under the limb, so Earth stays a dark mass
     with only a sliver of light wrapping just past the edge */
  float belowFade = exp(min(d, 0.0) * 24.0);
  float plum  = exp(-above * 5.0)  * (0.30 + 0.70 * broad) * belowFade;
  float amber = exp(-above * 16.0) * (0.20 + 0.80 * broad) * belowFade;
  float rim   = exp(-abs(d) * 90.0) * (0.25 + 0.75 * tight);
  vec2 sunPos = C + sunDir * (R - 0.02);       // the sun itself is still below the limb
  float blaze = exp(-length(p - sunPos) * 5.0) * (d > 0.0 ? 1.0 : belowFade);

  col += uPlum  * plum  * 0.50 * uDawn;
  col += uAmber * amber * 0.80 * uDawn;
  col += uAmber * rim   * 1.50 * uDawn;
  col += uSun   * blaze * 0.85 * uDawn * tight;

  /* ---- the ascents: a busy spaceport. Three independent launch tracks
     with co-prime cycle lengths and phase offsets — a launch every few
     seconds on average, and every so often two or three in the air at
     once. Each track hashes its own pad and gravity-turn bend. ---- */
  float lift = ascent(p, C, R, uTime,        9.0,  3.7)
             + ascent(p, C, R, uTime + 4.0, 13.0,  7.3)
             + ascent(p, C, R, uTime + 9.5, 17.5, 11.9);
  col += (uSun * 0.7 + vec3(0.30)) * lift * uDawn;

  /* ---- finish: soft knee, vignette, grain (§12.5's +4%) ---- */
  col = pow(col / (1.0 + col * 0.22), vec3(0.95));
  vec2 v = gl_FragCoord.xy / uRes - 0.5;
  col *= 1.0 - 0.30 * smoothstep(0.38, 0.85, length(v * vec2(1.15, 1.0)));
  col += (hash21(gl_FragCoord.xy + fract(uTime) * 61.7) - 0.5) * 0.035;

  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
`;

export function createAscentScene(canvas) {
  const gl = canvas.getContext('webgl', {
    antialias: false, alpha: false, depth: false, stencil: false,
    powerPreference: 'high-performance',
  });
  if (!gl) return null;   // c0-hero.js falls back to the CSS gradient sky

  /* tokens -> vec3, so the shader shares the site's exact palette */
  const css = getComputedStyle(document.documentElement);
  const token = (name) => {
    const hex = css.getPropertyValue(name).trim().replace('#', '');
    return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  };

  const compile = (type, src) => {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(sh));
    }
    return sh;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  // one triangle that covers the screen — no index buffer, no quad seam
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const U = {};
  for (const name of ['uRes', 'uTime', 'uDrift', 'uScroll', 'uDawn', 'uNight', 'uPlum', 'uAmber', 'uSun']) {
    U[name] = gl.getUniformLocation(prog, name);
  }
  gl.uniform3fv(U.uNight, token('--sky-top'));
  gl.uniform3fv(U.uPlum, token('--sky-mid'));
  gl.uniform3fv(U.uAmber, token('--sky-horizon'));
  gl.uniform3fv(U.uSun, token('--dawn-sun'));

  let time = 0, scroll = 0, dawn = 0;
  const drift = { x: 0, y: 0, tx: 0, ty: 0 };   // t* = pointer target, lerped in tick

  function draw() {
    gl.uniform1f(U.uTime, time);
    gl.uniform2f(U.uDrift, drift.x, drift.y);
    gl.uniform1f(U.uScroll, scroll);
    gl.uniform1f(U.uDawn, dawn);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(U.uRes, w, h);
    }
  }

  return {
    resize,
    setPointer(x, y) { drift.tx = x; drift.ty = y; },
    setScroll(v) { scroll = v; },
    setDawn(v) { dawn = v; },
    tick(dt) {
      time += dt;
      drift.x += (drift.tx - drift.x) * Math.min(1, dt * 3);
      drift.y += (drift.ty - drift.y) * Math.min(1, dt * 3);
      draw();
    },
    /* one still frame at a chosen moment — reduced motion + no-JS-loop paths */
    renderAt(t) { time = t; draw(); },
  };
}

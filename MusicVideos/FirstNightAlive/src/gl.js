// ============================================================
// gl.js — WebGL2 renderer: sky, ground, instanced blocks,
// glow lines, particles, and the post chain
// ============================================================
const GLSL_COMMON = `
float hash11(float p){ p=fract(p*.1031); p*=p+33.33; p*=p+p; return fract(p); }
float hash21(vec2 p){ vec3 p3=fract(vec3(p.xyx)*.1031); p3+=dot(p3,p3.yzx+33.33); return fract((p3.x+p3.y)*p3.z); }
float hash31(vec3 p3){ p3=fract(p3*.1031); p3+=dot(p3,p3.zyx+31.32); return fract((p3.x+p3.y)*p3.z); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash21(i),hash21(i+vec2(1,0)),f.x), mix(hash21(i+vec2(0,1)),hash21(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float a=.5, s=0.; for(int i=0;i<5;i++){ s+=a*vnoise(p); p=p*2.03+17.1; a*=.5; } return s; }
vec3 hueRot(vec3 c, float a){ const vec3 k=vec3(0.57735); float ca=cos(a); return c*ca + cross(k,c)*sin(a) + k*dot(k,c)*(1.-ca); }
`;

const SH = {};
SH.fsVert = `#version 300 es
out vec2 vUv;
void main(){ vec2 p=vec2(float((gl_VertexID<<1)&2), float(gl_VertexID&2)); vUv=p; gl_Position=vec4(p*2.-1.,0.,1.); }`;

// ---------------- sky / backdrop ----------------
SH.skyFrag = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform mat4 uInvVP; uniform vec3 uCam; uniform float uTime, uMode;
uniform vec3 uTop, uHor, uGlow; uniform float uStars, uMilky, uGlowAmt;
uniform vec3 uSunDir; uniform float uSun; uniform vec3 uSunCol;
uniform float uSwirl, uRays, uVent;
uniform vec3 uPlanetC; uniform float uPlanetR, uDawn, uCityLights;
${GLSL_COMMON}
vec3 starField(vec3 d, float dens){
  vec3 col=vec3(0.);
  for(int L=0; L<2; L++){
    float sc = L==0 ? 90. : 210.;
    vec3 q=d*sc; vec3 id=floor(q); vec3 f=fract(q)-.5;
    float h=hash31(id+float(L)*17.);
    if(h > 1.-.045*dens){
      vec3 off=vec3(hash31(id+3.1),hash31(id+5.7),hash31(id+9.3))-.5;
      float r=length(f-off*.7);
      float tw=.6+.4*sin(uTime*(1.+h*3.)+h*50.);
      float b=smoothstep(.09,.0,r)*tw*(L==0?1.:.55);
      vec3 sc2=mix(vec3(.75,.85,1.),vec3(1.,.8,.95),hash31(id+1.3));
      col+=sc2*b;
    }
  }
  return col;
}
void main(){
  vec4 p=uInvVP*vec4(vUv*2.-1.,1.,1.); vec3 d=normalize(p.xyz/p.w-uCam);
  vec3 col;
  if(uMode<.5){
    // ---- night sky
    float h=clamp(d.y,-.2,1.);
    col=mix(uHor,uTop,pow(clamp(h*1.4+.05,0.,1.),.55));
    col+=uGlow*uGlowAmt*exp(-max(h,0.)*9.);
    float band=exp(-pow(dot(d,normalize(vec3(.35,.25,-.9))),2.)*18.);
    float mw=band*(.4+.9*fbm(vec2(atan(d.z,d.x)*6.,d.y*9.)))*uMilky;
    col+=vec3(.45,.35,.8)*mw*.55;
    col+=starField(d,uStars*(1.+2.*band*uMilky))*smoothstep(-.02,.12,d.y);
    // sun / dawn
    float sd=max(dot(d,uSunDir),0.);
    col+=uSunCol*uSun*(pow(sd,900.)*6.+pow(sd,24.)*.5+pow(sd,4.)*.25*exp(-max(h,0.)*3.));
  } else if(uMode<1.5){
    // ---- primordial ocean
    float h=d.y;
    col=mix(vec3(.004,.01,.03),vec3(.02,.07,.14),smoothstep(-.6,.9,h));
    // light shafts from the surface
    vec2 s=d.xz/max(.08,abs(d.y)+.08);
    float rays=pow(vnoise(vec2(atan(d.z,d.x)*14.,uTime*.08))*vnoise(vec2(atan(d.z,d.x)*31.+3.,uTime*.05)),2.);
    col+=vec3(.25,.55,.8)*rays*uRays*smoothstep(-.1,.8,h)*.6;
    // swirling gyre on the sea floor far below
    if(h<-.02){
      float t=200./(-d.y); vec2 w=uCam.xz+d.xz*t;
      float r=length(w); float a=atan(w.y,w.x);
      float sw=a+r*.012*uSwirl-uTime*.25*uSwirl;
      float bands=fbm(vec2(sw*2.,r*.01-uTime*.05));
      float arms=pow(.5+.5*sin(sw*3.+bands*4.),4.);
      vec3 gc=mix(vec3(.02,.07,.2),vec3(.18,.05,.28),bands);
      float fade=smoothstep(0.,-.35,h)*exp(-r*.0025);
      col+=gc*arms*uSwirl*fade*.8;
      col+=vec3(1.,.35,.12)*uVent*.25*exp(-r*.03)*fade*(.6+.4*vnoise(vec2(uTime*3.,r*.1)));
    }
  } else if(uMode<2.5){
    // ---- planet from orbit
    col=vec3(.004,.006,.02)+starField(d,1.2);
    vec3 oc=uCam-uPlanetC; float b=dot(oc,d); float c=dot(oc,oc)-uPlanetR*uPlanetR; float disc=b*b-c;
    // atmosphere halo
    float closest=sqrt(max(dot(oc,oc)-b*b,0.));
    float rim=exp(-max(closest-uPlanetR,0.)/(uPlanetR*.035));
    if(disc>0.){
      float t=-b-sqrt(disc); vec3 P=uCam+d*t; vec3 n=normalize(P-uPlanetC);
      vec2 sp=vec2(atan(n.z,n.x),asin(n.y));
      float land=smoothstep(.52,.56,fbm(sp*vec2(2.2,3.)+3.));
      float day=smoothstep(-.08,.25,dot(n,uSunDir));
      vec3 ground=mix(vec3(.01,.03,.08),mix(vec3(.05,.08,.05),vec3(.2,.18,.12),fbm(sp*9.)),land);
      col=ground*day*1.2;
      // city lights on the night side
      vec2 g=sp*vec2(160.,120.); float cl=step(.9,hash21(floor(g)))*smoothstep(.45,.0,length(fract(g)-.5));
      float clusters=smoothstep(.55,.75,fbm(sp*14.));
      col+=vec3(1.,.55,.8)*cl*land*clusters*(1.-day)*uCityLights*1.6;
      // terminator glow (dawn line)
      float term=exp(-pow(dot(n,uSunDir)/.06,2.));
      col+=vec3(1.,.45,.4)*term*uDawn*.35;
      float fres=pow(1.-max(dot(n,-d),0.),3.);
      col+=vec3(.25,.45,1.)*fres*.8;
    }
    col+=vec3(.2,.4,1.)*rim*.9*(disc>0.? .4:1.);
    float sd=max(dot(d,uSunDir),0.); col+=uSunCol*uSun*(pow(sd,1200.)*8.+pow(sd,30.)*.4);
  } else {
    col=uTop;
  }
  o=vec4(col,1.);
}`;

// ---------------- ground ----------------
SH.groundVert = `#version 300 es
uniform mat4 uVP; uniform vec2 uCenter; uniform float uExt;
out vec3 vW;
void main(){
  vec2 c[6]=vec2[6](vec2(-1,-1),vec2(1,-1),vec2(1,1),vec2(-1,-1),vec2(1,1),vec2(-1,1));
  vec2 p=uCenter+c[gl_VertexID]*uExt; vW=vec3(p.x,0.,p.y); gl_Position=uVP*vec4(vW,1.);
}`;
SH.groundFrag = `#version 300 es
precision highp float;
in vec3 vW; out vec4 o;
uniform vec3 uCam; uniform float uTime;
uniform vec3 uFog; uniform float uFogDen;
uniform float uRoad, uTrail, uTrailLen, uTrailSpeed, uSched, uGrid, uCity, uWater, uRing;
uniform vec3 uGridCol, uHeadCol, uTailCol, uRingCol;
uniform vec4 uWave; uniform vec3 uWaveCol; uniform float uWaveMan;
uniform vec3 uLyre; uniform vec3 uLyreCol;
uniform vec2 uPath[16]; uniform float uPathAmt, uPathN;
uniform vec3 uSunDir, uSunCol; uniform float uSun;
uniform float uRipT; uniform vec2 uRipC;
${GLSL_COMMON}
${GLSL_CITY}
float segD(vec2 p, vec2 a, vec2 b){ vec2 pa=p-a, ba=b-a; float h=clamp(dot(pa,ba)/max(dot(ba,ba),1e-3),0.,1.); return length(pa-ba*h); }
float laneLights(float along, float across, float laneId, float dir){
  float speed=uTrailSpeed*(.7+.6*hash11(laneId));
  float period=70.+90.*hash11(laneId+3.);
  float ph=fract((along-dir*uTime*speed)/period+hash11(laneId+7.));
  if(dir>0.) ph=1.-ph;
  float len=uTrailLen/period;
  float car=smoothstep(0.,.004,ph)*exp(-ph/max(len,.002));
  return car;
}
void main(){
  vec2 p=vW.xz; float dist=length(vW-uCam);
  vec3 col=vec3(.012,.014,.03);
  vec2 q=mod(p,BLOCK);
  float stX=step(q.y,STREET), stZ=step(q.x,STREET);
  float street=max(stX,stZ);
  // schedule order of this block (raster), matches buildCity()
  vec2 bi=floor(p/BLOCK)+23.;
  float sched=step((bi.y*46.+bi.x)/2116., uSched);
  float water=0.;
  float rx=riverX(p.y); if(abs(p.x-rx)<RIVER_W*.5) water=1.;
  if(p.y>coastZ(p.x)) water=1.;
  water=max(water,uWater);
  float ringD=abs(length(p)-RING_R);
  float ring=step(ringD,RING_W*.5)*(1.-water);
  vec3 add=vec3(0.);
  if(water<.5){
    col+=vec3(.02,.02,.05)*street;
    // lanes along x (street band where q.y<STREET)
    float lt=0.; vec3 lc=vec3(0.);
    if(stX>.5){
      float across=q.y/STREET; float lane=floor(p.y/BLOCK)*4.+floor(across*4.);
      float dir=across<.5?1.:-1.;
      float laneC=abs(fract(across*4.)-.5);
      float m=1.-smoothstep(.12,.3,laneC);
      float c=laneLights(p.x,across,lane,dir)*m;
      lc+=mix(uTailCol,uHeadCol,step(0.,dir))*c;
    }
    if(stZ>.5){
      float across=q.x/STREET; float lane=floor(p.x/BLOCK)*4.+floor(across*4.)+500.;
      float dir=across<.5?1.:-1.;
      float laneC=abs(fract(across*4.)-.5);
      float m=1.-smoothstep(.12,.3,laneC);
      float c=laneLights(p.y,across,lane,dir)*m;
      lc+=mix(uTailCol,uHeadCol,step(0.,dir))*c;
    }
    add+=lc*uTrail*uRoad*uCity*sched;
    // street lamps
    vec2 lp=vec2(mod(p.x,12.)-6.,mod(p.y,12.)-6.);
    float edge=min(abs(q.y-1.),abs(q.y-STREET+1.));
    float edge2=min(abs(q.x-1.),abs(q.x-STREET+1.));
    float lamp=exp(-(lp.x*lp.x+edge*edge)*.25)*stX+exp(-(lp.y*lp.y+edge2*edge2)*.25)*stZ;
    add+=vec3(1.,.75,.5)*lamp*.55*uRoad*uCity*sched;
    float gfar=smoothstep(.2,.7,max(fwidth(p.x/12.),fwidth(p.y/12.)));
    add+=vec3(.9,.55,.45)*street*gfar*.12*uRoad*uCity*sched*(1.+uTrail*.6);
    // curb lines
    float curb=(1.-smoothstep(.0,.5,abs(q.y-STREET)))+(1.-smoothstep(.0,.5,abs(q.x-STREET)));
    add+=vec3(.1,.15,.4)*curb*.25*uCity;
    // ring road
    if(ring>.5){
      float ang=atan(p.y,p.x); float along=ang*RING_R; float across=(length(p)-RING_R)/RING_W+.5;
      float lane=floor(across*6.); float dir=across<.5?1.:-1.;
      float laneC=abs(fract(across*6.)-.5); float m=1.-smoothstep(.1,.3,laneC);
      float c=laneLights(along,across,lane+900.,dir)*m;
      add+=mix(uTailCol,uHeadCol,step(0.,dir))*c*uTrail*uCity*1.3;
      col=vec3(.02,.025,.06);
    }
    add+=uRingCol*uRing*exp(-ringD*.15);
    // old eras: scattered warm fires when the city is gone
    vec2 fc=floor(p/60.); float fh=hash21(fc);
    vec2 ff=fract(p/60.)-.5;
    add+=vec3(1.,.5,.2)*step(.93,fh)*exp(-dot(ff,ff)*400.)*(1.-uCity)*(1.-uWater)*.8*(.7+.3*sin(uTime*9.+fh*40.));
    if(inPark(p)){
      vec2 pc=fract(p/9.)-.5; float tr=step(.55,hash21(floor(p/9.)));
      col=mix(vec3(.006,.02,.02),vec3(.01,.04,.035),vnoise(p*.05))*uCity+vec3(.0,.03,.02)*tr*exp(-dot(pc,pc)*14.);
      float path=1.-smoothstep(1.2,2.,abs(sin(p.x*.02+sin(p.y*.015)*2.)*30.));
      col+=vec3(.08,.06,.12)*path*uCity;
      add+=vec3(1.,.8,.5)*step(.97,hash21(floor(p/14.)))*exp(-dot(fract(p/14.)-.5,fract(p/14.)-.5)*300.)*uCity*sched*.8;
    }
    col=mix(vec3(.01,.02,.012),col,uCity);
  } else {
    // water: dark, glinting, with reflected sky and a sun path
    vec2 wp=p*vec2(.08,.25);
    float n1=vnoise(wp+vec2(0.,uTime*.6)), n2=vnoise(wp*2.3-vec2(uTime*.4,0.));
    col=vec3(.005,.012,.035)+vec3(.03,.05,.12)*n1;
    float glint=pow(n1*n2,6.)*18.;
    add+=vec3(.5,.6,1.)*glint*.35;
    vec3 v=normalize(vW-uCam); vec3 nrm=normalize(vec3((n1-.5)*.25,1.,(n2-.5)*.25));
    vec3 r=reflect(v,nrm);
    add+=uSunCol*uSun*pow(max(dot(r,uSunDir),0.),60.)*3.;
  }
  // digital grid
  vec2 g=p/16.; vec2 gw=abs(fract(g-.5)-.5)/fwidth(g);
  float gl=1.-min(min(gw.x,gw.y),1.);
  add+=uGridCol*gl*uGrid*exp(-dist*.0012);
  // expanding wave (euclid or manhattan metric)
  float wd=mix(length(p-uWave.xy),abs(p.x-uWave.x)+abs(p.y-uWave.y),uWaveMan);
  float wv=exp(-pow((wd-uWave.z)/max(uWave.w,1.),2.));
  add+=uWaveCol*wv*(.5+1.2*street);
  // path + lyre glow
  float pd=1e5; for(int i=0;i<15;i++){ if(float(i)<uPathN-1.) pd=min(pd,segD(p,uPath[i],uPath[i+1])); }
  add+=uLyreCol*uPathAmt*exp(-pd*.08)*(.4+.6*street);
  add+=uLyreCol*uLyre.z*exp(-length(p-uLyre.xy)*.05);
  // ripple rings (footsteps)
  float rr=length(p-uRipC); float rip=exp(-pow((rr-uRipT*160.)/6.,2.))*exp(-uRipT*2.2)*step(0.,uRipT);
  add+=vec3(.5,.8,1.)*rip*.8;
  col+=add;
  float fog=1.-exp(-dist*uFogDen);
  col=mix(col,uFog,fog);
  o=vec4(col,1.);
}`;

// ---------------- instanced blocks (buildings + giant's voxels) ----------------
SH.boxVert = `#version 300 es
layout(location=0) in vec3 aP; layout(location=1) in vec3 aN;
layout(location=2) in vec3 iPos; layout(location=3) in vec3 iSize; layout(location=4) in vec4 iD;
uniform mat4 uVP; uniform float uTwist, uRise, uTime; uniform vec2 uTwistC; uniform float uLift;
out vec3 vW; out vec3 vN; flat out vec3 vN0; out vec3 vL; flat out vec4 vD; flat out vec3 vS;
void main(){
  vec3 size=iSize;
  float kind=iD.z;
  if(kind<.5||kind>2.5){ size.y*=clamp((uRise-iD.y*.92)/.08,0.,1.); }
  vec3 w=iPos+aP*size;
  w.y+=uLift*iD.y*40.*step(kind,.5);
  float ang=uTwist*(w.y/220.);
  vec2 c=w.xz-uTwistC; float ca=cos(ang), sa=sin(ang);
  w.xz=uTwistC+vec2(ca*c.x-sa*c.y, sa*c.x+ca*c.y);
  vec3 n=aN; n.xz=vec2(ca*n.x-sa*n.z, sa*n.x+ca*n.z);
  vW=w; vN=n; vN0=aN; vL=(aP+vec3(.5,0.,.5))*size; vD=iD; vS=size;
  gl_Position=uVP*vec4(w,1.);
}`;
SH.boxFrag = `#version 300 es
precision highp float;
in vec3 vW; in vec3 vN; flat in vec3 vN0; in vec3 vL; flat in vec4 vD; flat in vec3 vS; out vec4 o;
uniform vec3 uCam; uniform float uTime;
uniform vec3 uWinA, uWinB, uFacade, uEdgeCol, uFog; uniform float uFogDen;
uniform float uLit, uSched, uOff, uMixB, uEdge, uHue, uBright, uWarm, uPulse;
uniform vec4 uWave; uniform vec3 uWaveCol;
uniform vec3 uMixC; // xz center, radius
uniform vec3 uLyre; uniform vec2 uPath[16]; uniform float uPathAmt, uPathN;
uniform sampler2D uRoof; uniform float uRoofAmt; uniform vec4 uRoofR;
uniform float uIsBody;
${GLSL_COMMON}
float segD(vec2 p, vec2 a, vec2 b){ vec2 pa=p-a, ba=b-a; float h=clamp(dot(pa,ba)/max(dot(ba,ba),1e-3),0.,1.); return length(pa-ba*h); }
void main(){
  float seed=vD.x, kind=vD.z;
  vec3 n0=vN0;
  float top=step(.5,n0.y);
  float u, fw;
  if(abs(n0.x)>.5){ u=vL.z; fw=vS.z; } else { u=vL.x; fw=vS.x; }
  float v=vL.y, fh=vS.y;
  vec3 n=normalize(vN);
  float lam=.35+.65*max(dot(n,normalize(vec3(.35,.8,.45))),0.);
  vec3 col=uFacade*lam*(.7+.3*hash11(seed*13.));
  // ---- windows
  vec2 cell=kind>.5&&kind<1.5 ? vec2(3.2,3.) : vec2(4.2,3.6);
  vec2 cid=floor(vec2(u,v)/cell); vec2 f=fract(vec2(u,v)/cell);
  float win=step(.2,f.x)*step(f.x,.8)*step(.24,f.y)*step(f.y,.78);
  if(kind<.5||kind>2.5) win*=step(1.,u)*step(u,fw-1.)*step(2.5,v)*step(v,fh-1.5);
  win*=1.-top;
  float face=n0.x*3.+n0.z*7.+7.;
  float h=hash31(vec3(cid,seed*91.7+face));
  float h2=hash31(vec3(cid+7.,seed*13.1+face));
  float flick=step(.985,hash31(vec3(cid,floor(uTime*.7+h*20.))));
  float lit=step(h,uLit)*(1.-flick*.8);
  lit*=step(vD.w+(h-.5)*.004,uSched);
  lit*=1.-uOff;
  // magenta: global share, flood radius, path & lyre proximity
  float mB=step(h2,uMixB);
  mB=max(mB,step(length(vW.xz-uMixC.xy),uMixC.z));
  float pd=1e5; for(int i=0;i<15;i++){ if(float(i)<uPathN-1.) pd=min(pd,segD(vW.xz,uPath[i],uPath[i+1])); }
  float near=max(uPathAmt*exp(-pd*.02), uLyre.z*exp(-length(vW.xz-uLyre.xy)*.012));
  lit=max(lit,step(h,near*1.2)*win);
  mB=max(mB,step(h2,near*1.5));
  vec3 wc=mix(uWinA,uWinB,mB);
  wc=mix(wc,vec3(1.,.72,.45),step(h2,uWarm)*(1.-mB));
  wc=hueRot(wc,uHue+uHue*h*1.5);
  float br=(.55+.9*h)*uBright*(1.+uPulse);
  float pxw=max(fwidth(u/cell.x),fwidth(v/cell.y));
  float far=smoothstep(.3,.85,pxw)*(1.-top);
  float avgLit=clamp(uLit,0.,1.)*step(vD.w,uSched)*(1.-uOff);
  float mFar=max(uMixB,step(length(vW.xz-uMixC.xy),uMixC.z)); mFar=max(mFar,clamp(near*1.5,0.,1.));
  avgLit=max(avgLit,clamp(near*1.2,0.,1.));
  vec3 avgE=mix(uWinA,uWinB,mFar)*avgLit*.42*uBright*(1.+uPulse);
  avgE=hueRot(avgE,uHue);
  if(kind<.5||kind>2.5) avgE*=step(3.,v)*step(v,fh-1.5);
  col+=mix(wc*win*lit*br,avgE+wc*win*lit*br*.35,far);
  // ---- wave band
  float wd=length(vW.xz-uWave.xy);
  float wv=exp(-pow((wd-uWave.z)/max(uWave.w,1.),2.));
  col+=uWaveCol*wv*(.3+win*1.5);
  // ---- roof display
  if(top>.5){
    vec2 ruv=(vW.xz-uRoofR.xy)/uRoofR.zw;
    if(ruv.x>0.&&ruv.x<1.&&ruv.y>0.&&ruv.y<1.) col+=texture(uRoof,ruv).rgb*uRoofAmt;
  }
  // ---- edges
  float e;
  if(top>.5) e=min(min(vL.x,vS.x-vL.x),min(vL.z,vS.z-vL.z));
  else e=min(min(u,fw-u),min(v,fh-v));
  float ew=fwidth(e)*1.3+.18;
  float edge=(1.-smoothstep(0.,ew,e))+.35*exp(-e/(ew*5.));
  col+=uEdgeCol*edge*uEdge*(1.+uPulse);
  float dist=length(vW-uCam);
  float fog=1.-exp(-dist*uFogDen);
  col=mix(col,uFog,fog*(1.-uIsBody*.5));
  o=vec4(col,1.);
}`;

// ---------------- glow lines (instanced camera-facing segments) ----------------
SH.lineVert = `#version 300 es
layout(location=0) in vec3 iA; layout(location=1) in vec3 iB; layout(location=2) in vec4 iCA; layout(location=3) in vec4 iCB; layout(location=4) in vec2 iW;
uniform mat4 uVP; uniform vec2 uRes; uniform float uProj;
out vec4 vC; out float vS;
void main(){
  int id=gl_VertexID;
  float t=(id==1||id==2||id==4)?1.:0.;
  float s=(id==2||id==4||id==5)?1.:-1.;
  vec4 ca=uVP*vec4(iA,1.), cb=uVP*vec4(iB,1.);
  const float nw=.5;
  if(ca.w<nw&&cb.w<nw){ gl_Position=vec4(2.,2.,2.,1.); vC=vec4(0.); vS=0.; return; }
  if(ca.w<nw){ ca=mix(ca,cb,(nw-ca.w)/(cb.w-ca.w)); }
  if(cb.w<nw){ cb=mix(cb,ca,(nw-cb.w)/(ca.w-cb.w)); }
  vec2 sa=ca.xy/ca.w, sb=cb.xy/cb.w;
  vec2 d=(sb-sa)*uRes; float L=length(d); vec2 dir=L>1e-4?d/L:vec2(1.,0.);
  vec2 nrm=vec2(-dir.y,dir.x);
  vec4 c=mix(ca,cb,t);
  float w=mix(iW.x,iW.y,t);
  if(w<0.) w=-w*uProj/c.w; else w*=uRes.y/720.;
  w=max(w,.75);
  vec2 off=(nrm*s*w+dir*(t*2.-1.)*w*.5)/uRes*2.;
  c.xy+=off*c.w;
  gl_Position=c; vC=mix(iCA,iCB,t); vS=s;
}`;
SH.lineFrag = `#version 300 es
precision highp float;
in vec4 vC; in float vS; out vec4 o;
void main(){ float a=exp(-vS*vS*2.8); o=vec4(vC.rgb*vC.a*a,0.); }`;

// ---------------- particles ----------------
SH.partVert = `#version 300 es
layout(location=0) in vec4 iS;
uniform mat4 uVP; uniform vec3 uCam, uRight, uUp, uBox, uVel, uCenter; uniform float uTime, uMode, uSize, uStreak, uSpin;
out vec2 vQ; out float vA; out float vH;
void main(){
  int id=gl_VertexID;
  vec2 q=vec2((id==1||id==2||id==4)?1.:-1., (id==2||id==4||id==5)?1.:-1.);
  vec3 p=(iS.xyz-.5)*uBox;
  vec3 vel=uVel*(.6+.8*iS.w);
  float t=uTime;
  if(uMode<.5){ p+=vec3(sin(t*.31+iS.x*40.),sin(t*.23+iS.y*30.),cos(t*.27+iS.z*50.))*4.+vel*t; }
  else if(uMode<1.5){ p+=vel*t; }
  else { float r=20.+iS.x*uBox.x*.5; float a=iS.y*6.2832+t*uSpin*(60./(r+30.)); p=uCenter+vec3(cos(a)*r,(iS.z-.5)*uBox.y+sin(a*2.+iS.w*9.)*6.,sin(a)*r); }
  if(uMode<1.5) p=uCam+mod(p-uCam+uBox*.5,uBox)-uBox*.5;
  float s=uSize*(.45+iS.w);
  vec3 up=uUp;
  vec3 wp=p+uRight*q.x*s+up*q.y*s;
  if(uStreak>0.){ vec3 vd=normalize(vel+vec3(1e-4)); wp=p+uRight*q.x*s*.35+vd*q.y*s*uStreak; }
  gl_Position=uVP*vec4(wp,1.);
  vQ=q; vH=iS.w;
  float dist=length(p-uCam);
  vA=smoothstep(max(uBox.x,uBox.z)*.5,max(uBox.x,uBox.z)*.2,dist)*smoothstep(1.,6.,dist);
  if(uMode>1.5) vA=1.;
}`;
SH.partFrag = `#version 300 es
precision highp float;
in vec2 vQ; in float vA; in float vH; out vec4 o;
uniform vec3 uCol1, uCol2; uniform float uAmt;
void main(){ float r=dot(vQ,vQ); float a=exp(-r*3.5)*vA; if(vH>uAmt) discard; o=vec4(mix(uCol1,uCol2,vH)*a,0.); }`;

// ---------------- post: composite with feedback ----------------
SH.compFrag = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D uScene, uOver, uPrev; uniform float uHasOver;
uniform float uAspect, uTime;
uniform float uFb, uFbZoom, uFbRot, uFbHue, uFbMode; uniform vec2 uFbShift;
uniform float uKal, uKalMix, uGlitch, uGlSeed, uWarp, uMirror, uBleed, uPix, uSceneSat, uSceneDim; uniform vec2 uRes;
${GLSL_COMMON}
void main(){
  vec2 uv=vUv;
  if(uMirror>.5) uv.x=.5-abs(uv.x-.5);
  if(uKal>.5){
    vec2 c=uv-.5; c.x*=uAspect; float a=atan(c.y,c.x), r=length(c); float seg=6.28318/uKal;
    a=mod(a+uTime*.05,seg); a=abs(a-seg*.5); vec2 k=vec2(cos(a),sin(a))*r; k.x/=uAspect; uv=mix(uv,k+.5,uKalMix);
  }
  if(uWarp>0.) uv+=vec2(sin(uv.y*18.+uTime*1.7),cos(uv.x*14.+uTime*1.3))*uWarp*.006;
  if(uGlitch>0.){
    float band=floor(uv.y*38.); float h=hash21(vec2(band,uGlSeed));
    if(h<uGlitch*.5) uv.x+=(hash21(vec2(band,uGlSeed+1.))-.5)*uGlitch*.25;
    float blk=hash21(floor(uv*vec2(14.,9.))+uGlSeed*3.1);
    if(blk<uGlitch*.12) uv+=(vec2(hash21(vec2(blk,1.)),hash21(vec2(blk,2.)))-.5)*.08;
  }
  if(uPix>1.){ vec2 px=uPix/uRes; uv=(floor(uv/px)+.5)*px; }
  vec3 sc;
  if(uBleed>0.){
    vec2 dd=vec2(uBleed*.012,0.)*(1.+.5*sin(uv.y*30.+uTime*4.));
    sc=vec3(texture(uScene,uv+dd).r,texture(uScene,uv).g,texture(uScene,uv-dd).b);
  } else sc=texture(uScene,uv).rgb;
  sc=mix(vec3(dot(sc,vec3(.299,.587,.114))),sc,uSceneSat)*uSceneDim;
  vec4 ov=uHasOver>.5?texture(uOver,vec2(uv.x,1.-uv.y)):vec4(0.);
  if(uBleed>0.&&uHasOver>.5){ vec2 dd=vec2(uBleed*.01,0.); ov.r=max(ov.r,texture(uOver,vec2(uv.x+dd.x,1.-uv.y)).r); ov.b=max(ov.b,texture(uOver,vec2(uv.x-dd.x,1.-uv.y)).b); }
  vec3 col=sc*(1.-ov.a)+ov.rgb;
  if(uFb>0.){
    vec2 c=(vUv-.5)*vec2(uAspect,1.); float cr=cos(uFbRot), sr=sin(uFbRot);
    c=mat2(cr,-sr,sr,cr)*c/uFbZoom; vec2 fuv=c/vec2(uAspect,1.)+.5+uFbShift;
    vec3 pr=texture(uPrev,fuv).rgb; if(uFbHue!=0.) pr=hueRot(pr,uFbHue);
    col= uFbMode<.5 ? max(col,pr*uFb) : col+pr*uFb;
  }
  o=vec4(col,1.);
}`;
SH.brightFrag = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o; uniform sampler2D uTex; uniform float uThr; uniform vec2 uTexel;
void main(){
  vec3 c=vec3(0.);
  c+=texture(uTex,vUv+uTexel*vec2(-1,-1)).rgb; c+=texture(uTex,vUv+uTexel*vec2(1,-1)).rgb;
  c+=texture(uTex,vUv+uTexel*vec2(-1,1)).rgb; c+=texture(uTex,vUv+uTexel*vec2(1,1)).rgb; c*=.25;
  float l=max(c.r,max(c.g,c.b)); o=vec4(c*smoothstep(uThr,uThr+.35,l),1.);
}`;
SH.blurFrag = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o; uniform sampler2D uTex; uniform vec2 uDir;
void main(){
  vec3 c=texture(uTex,vUv).rgb*.227;
  c+=(texture(uTex,vUv+uDir*1.385).rgb+texture(uTex,vUv-uDir*1.385).rgb)*.316;
  c+=(texture(uTex,vUv+uDir*3.231).rgb+texture(uTex,vUv-uDir*3.231).rgb)*.070;
  o=vec4(c,1.);
}`;
SH.finalFrag = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D uComp, uBloom, uBloom2; uniform float uAspect, uTime;
uniform float uChroma, uBloomAmt, uExposure, uContrast, uSat, uInvert, uFlash, uScan, uVig, uGrain, uFade;
uniform vec3 uTint, uLift, uFlashCol; uniform vec2 uRes;
${GLSL_COMMON}
void main(){
  vec2 uv=vUv; vec2 c=uv-.5;
  vec2 ch=c*uChroma*.012;
  vec3 col=vec3(texture(uComp,uv+ch).r,texture(uComp,uv).g,texture(uComp,uv-ch).b);
  col+=(texture(uBloom,uv).rgb*.65+texture(uBloom2,uv).rgb*.55)*uBloomAmt;
  col*=uExposure;
  col=col/(1.+col*.22);
  float l=dot(col,vec3(.299,.587,.114));
  col=mix(vec3(l),col,uSat);
  col=(col-.5)*uContrast+.5;
  col=col*uTint+uLift;
  col=mix(col,1.-col,uInvert);
  col=mix(col,uFlashCol,uFlash);
  col*=1.-uScan*(.5+.5*sin(gl_FragCoord.y*3.14159*.5));
  float v=dot(c*vec2(uAspect*.8,1.),c*vec2(uAspect*.8,1.)); col*=1.-uVig*v*1.4;
  col+=(hash21(gl_FragCoord.xy+fract(uTime*37.)*400.)-.5)*uGrain;
  col*=1.-uFade;
  o=vec4(clamp(col,0.,1.),1.);
}`;

// ============================================================
const GLR = {};
(function () {
  let gl, W = 0, H = 0;
  const P = {}; // programs
  function sh(type, src) {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { const e = gl.getShaderInfoLog(s); console.error(e, src.split('\n').map((l, i) => (i + 1) + ': ' + l).join('\n')); throw new Error('shader: ' + e); }
    return s;
  }
  function prog(vs, fs) {
    const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('link: ' + gl.getProgramInfoLog(p));
    const loc = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(p, i); const nm = info.name.replace(/\[0\]$/, ''); loc[nm] = { l: gl.getUniformLocation(p, info.name), t: info.type, s: info.size }; }
    return { p, loc };
  }
  function use(pr, U) {
    gl.useProgram(pr.p);
    for (const k in U) {
      const L = pr.loc[k]; if (!L) continue; const v = U[k];
      switch (L.t) {
        case gl.FLOAT: if (L.s > 1) gl.uniform1fv(L.l, v); else gl.uniform1f(L.l, v); break;
        case gl.FLOAT_VEC2: gl.uniform2fv(L.l, v); break;
        case gl.FLOAT_VEC3: gl.uniform3fv(L.l, v); break;
        case gl.FLOAT_VEC4: gl.uniform4fv(L.l, v); break;
        case gl.FLOAT_MAT4: gl.uniformMatrix4fv(L.l, false, v); break;
        case gl.SAMPLER_2D: gl.uniform1i(L.l, v); break;
      }
    }
  }
  function tex(w, h, internal, format, type, filter = gl.LINEAR) {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, type, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }
  function rt(w, h, hdr) {
    const t = hdr ? tex(w, h, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT) : tex(w, h, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE);
    const fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    return { t, fb, w, h };
  }
  let hdr = false, samples = 0;
  let sceneMS, sceneRT, comp = [], ci = 0, bl = [], bl2 = [], overTex;
  let cubeVBO, cityVAO, cityN = 0, bodyVAO, bodyBuf, bodyData, lineVAO, lineBuf, lineData, partVAO, emptyVAO, roofTex;
  const MAXBODY = 2400, MAXLINES = 24000, NPART = 14000;
  GLR.lineCount = 0;

  GLR.init = function (canvas) {
    gl = canvas.getContext('webgl2', { antialias: false, alpha: false, depth: false, stencil: false, premultipliedAlpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: false });
    if (!gl) return false;
    hdr = !!gl.getExtension('EXT_color_buffer_float');
    gl.getExtension('OES_texture_float_linear');
    samples = Math.min(4, gl.getParameter(gl.MAX_SAMPLES) || 0);
    P.sky = prog(SH.fsVert, SH.skyFrag);
    P.ground = prog(SH.groundVert, SH.groundFrag);
    P.box = prog(SH.boxVert, SH.boxFrag);
    P.line = prog(SH.lineVert, SH.lineFrag);
    P.part = prog(SH.partVert, SH.partFrag);
    P.comp = prog(SH.fsVert, SH.compFrag);
    P.bright = prog(SH.fsVert, SH.brightFrag);
    P.blur = prog(SH.fsVert, SH.blurFrag);
    P.final = prog(SH.fsVert, SH.finalFrag);
    emptyVAO = gl.createVertexArray();
    // cube: x,z in [-.5,.5], y in [0,1]
    const F = [
      [[1, 0, 0], [[.5, 0, -.5], [.5, 1, -.5], [.5, 1, .5], [.5, 0, .5]]],
      [[-1, 0, 0], [[-.5, 0, .5], [-.5, 1, .5], [-.5, 1, -.5], [-.5, 0, -.5]]],
      [[0, 0, 1], [[.5, 0, .5], [.5, 1, .5], [-.5, 1, .5], [-.5, 0, .5]]],
      [[0, 0, -1], [[-.5, 0, -.5], [-.5, 1, -.5], [.5, 1, -.5], [.5, 0, -.5]]],
      [[0, 1, 0], [[-.5, 1, -.5], [-.5, 1, .5], [.5, 1, .5], [.5, 1, -.5]]],
    ];
    const cv = [];
    for (const [n, q] of F) for (const i of [0, 1, 2, 0, 2, 3]) cv.push(...q[i], ...n);
    cubeVBO = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, cubeVBO); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cv), gl.STATIC_DRAW);
    const mkBoxVAO = (buf) => {
      const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, cubeVBO);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
      gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      const st = 40;
      gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 3, gl.FLOAT, false, st, 0); gl.vertexAttribDivisor(2, 1);
      gl.enableVertexAttribArray(3); gl.vertexAttribPointer(3, 3, gl.FLOAT, false, st, 12); gl.vertexAttribDivisor(3, 1);
      gl.enableVertexAttribArray(4); gl.vertexAttribPointer(4, 4, gl.FLOAT, false, st, 24); gl.vertexAttribDivisor(4, 1);
      gl.bindVertexArray(null); return vao;
    };
    // city instances
    const city = buildCity(); cityN = city.length;
    const cd = new Float32Array(cityN * 10);
    city.forEach((b, i) => { cd.set([b[0], b[1], b[2], b[3], b[4], b[5], b[6], b[7], b[8], b[9]], i * 10); });
    const cityBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, cityBuf); gl.bufferData(gl.ARRAY_BUFFER, cd, gl.STATIC_DRAW);
    cityVAO = mkBoxVAO(cityBuf);
    GLR.city = city;
    // body instances (dynamic)
    bodyData = new Float32Array(MAXBODY * 10);
    bodyBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bodyBuf); gl.bufferData(gl.ARRAY_BUFFER, bodyData.byteLength, gl.DYNAMIC_DRAW);
    bodyVAO = mkBoxVAO(bodyBuf);
    GLR.bodyData = bodyData;
    // lines
    lineData = new Float32Array(MAXLINES * 16);
    lineBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, lineBuf); gl.bufferData(gl.ARRAY_BUFFER, lineData.byteLength, gl.DYNAMIC_DRAW);
    lineVAO = gl.createVertexArray(); gl.bindVertexArray(lineVAO); gl.bindBuffer(gl.ARRAY_BUFFER, lineBuf);
    const ls = 64;
    [[0, 3, 0], [1, 3, 12], [2, 4, 24], [3, 4, 40], [4, 2, 56]].forEach(([l, n, o]) => { gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, n, gl.FLOAT, false, ls, o); gl.vertexAttribDivisor(l, 1); });
    gl.bindVertexArray(null);
    // particles
    const pr = mulberry(77); const pd = new Float32Array(NPART * 4); for (let i = 0; i < pd.length; i++) pd[i] = pr();
    for (let i = 0; i < NPART; i++) pd[i * 4 + 3] = i / NPART; // ordered so uAmt trims evenly
    const pb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, pb); gl.bufferData(gl.ARRAY_BUFFER, pd, gl.STATIC_DRAW);
    partVAO = gl.createVertexArray(); gl.bindVertexArray(partVAO); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 16, 0); gl.vertexAttribDivisor(0, 1); gl.bindVertexArray(null);
    // overlay + roof textures
    overTex = tex(4, 4, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE);
    roofTex = tex(4, 4, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE);
    return true;
  };

  GLR.resize = function (w, h) {
    if (w === W && h === H) return; W = w; H = h;
    const del = r => { if (!r) return; gl.deleteTexture(r.t); gl.deleteFramebuffer(r.fb); };
    if (sceneMS) { gl.deleteFramebuffer(sceneMS.fb); gl.deleteRenderbuffer(sceneMS.c); gl.deleteRenderbuffer(sceneMS.d); }
    del(sceneRT); comp.forEach(del); bl.forEach(del); bl2.forEach(del);
    // multisampled scene target
    const fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    const c = gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER, c);
    if (samples > 1) gl.renderbufferStorageMultisample(gl.RENDERBUFFER, samples, gl.RGBA8, w, h); else gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA8, w, h);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, c);
    const d = gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER, d);
    if (samples > 1) gl.renderbufferStorageMultisample(gl.RENDERBUFFER, samples, gl.DEPTH_COMPONENT24, w, h); else gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, w, h);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, d);
    sceneMS = { fb, c, d };
    sceneRT = rt(w, h, false);
    comp = [rt(w, h, hdr), rt(w, h, hdr)];
    const bw = Math.max(1, w >> 2), bh = Math.max(1, h >> 2);
    bl = [rt(bw, bh, hdr), rt(bw, bh, hdr)];
    const bw2 = Math.max(1, w >> 4), bh2 = Math.max(1, h >> 4);
    bl2 = [rt(bw2, bh2, hdr), rt(bw2, bh2, hdr)];
    for (const r of comp) { gl.bindFramebuffer(gl.FRAMEBUFFER, r.fb); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); }
  };

  GLR.clearFeedback = function () { for (const r of comp) { gl.bindFramebuffer(gl.FRAMEBUFFER, r.fb); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); } };

  GLR.uploadOverlay = function (canvas) {
    gl.bindTexture(gl.TEXTURE_2D, overTex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  };
  GLR.uploadRoof = function (canvas) {
    gl.bindTexture(gl.TEXTURE_2D, roofTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
  };

  // line API (filled each frame by scenes)
  GLR.lines = {
    n: 0,
    reset() { this.n = 0; },
    // a,b: [x,y,z]; ca,cb: [r,g,b,a]; wa,wb: width in 720p px (negative = world metres)
    seg(a, b, ca, cb, wa, wb) {
      if (this.n >= MAXLINES) return; const o = this.n++ * 16;
      lineData[o] = a[0]; lineData[o + 1] = a[1]; lineData[o + 2] = a[2];
      lineData[o + 3] = b[0]; lineData[o + 4] = b[1]; lineData[o + 5] = b[2];
      lineData[o + 6] = ca[0]; lineData[o + 7] = ca[1]; lineData[o + 8] = ca[2]; lineData[o + 9] = ca[3];
      const c2 = cb || ca; lineData[o + 10] = c2[0]; lineData[o + 11] = c2[1]; lineData[o + 12] = c2[2]; lineData[o + 13] = c2[3];
      lineData[o + 14] = wa; lineData[o + 15] = wb === undefined ? wa : wb;
    },
    poly(pts, col, w, col2, w2) { for (let i = 0; i < pts.length - 1; i++) { const u = i / (pts.length - 1), u2 = (i + 1) / (pts.length - 1); const c1 = col2 ? [lerp(col[0], col2[0], u), lerp(col[1], col2[1], u), lerp(col[2], col2[2], u), lerp(col[3], col2[3], u)] : col; const c2 = col2 ? [lerp(col[0], col2[0], u2), lerp(col[1], col2[1], u2), lerp(col[2], col2[2], u2), lerp(col[3], col2[3], u2)] : col; this.seg(pts[i], pts[i + 1], c1, c2, w2 === undefined ? w : lerp(w, w2, u), w2 === undefined ? w : lerp(w, w2, u2)); } },
  };
  GLR.body = { n: 0, reset() { this.n = 0; }, add(x, y, z, w, h, d, seed, a, kind, b) { if (this.n >= MAXBODY) return; bodyData.set([x, y, z, w, h, d, seed, a, kind, b], this.n++ * 10); } };

  // ---------------- frame render ----------------
  GLR.render = function (S) {
    // S: {cam:{vp,invVP,pos,right,up,proj}, sky, ground, city, body, parts, post, hasOverlay, aspect}
    const cam = S.cam;
    gl.bindFramebuffer(gl.FRAMEBUFFER, sceneMS.fb); gl.viewport(0, 0, W, H);
    gl.depthMask(true); gl.clearColor(0, 0, 0, 1); gl.clearDepth(1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.bindVertexArray(emptyVAO);
    if (S.draw3D) {
      gl.disable(gl.DEPTH_TEST); gl.depthMask(false); gl.disable(gl.BLEND);
      use(P.sky, Object.assign({ uInvVP: cam.invVP, uCam: cam.pos, uTime: S.tr }, S.sky));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.depthMask(true);
      if (S.ground.on) {
        use(P.ground, Object.assign({ uVP: cam.vp, uCam: cam.pos, uTime: S.tr, uCenter: [cam.pos[0], cam.pos[2]], uExt: 7000 }, S.ground));
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      if (S.city.on || S.body.on) {
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, roofTex);
      }
      if (S.city.on) {
        use(P.box, Object.assign({ uVP: cam.vp, uCam: cam.pos, uTime: S.tr, uRoof: 0, uIsBody: 0 }, S.city));
        gl.bindVertexArray(cityVAO); gl.drawArraysInstanced(gl.TRIANGLES, 0, 30, cityN);
      }
      if (S.body.on && GLR.body.n > 0) {
        gl.bindBuffer(gl.ARRAY_BUFFER, bodyBuf); gl.bufferSubData(gl.ARRAY_BUFFER, 0, bodyData, 0, GLR.body.n * 10);
        use(P.box, Object.assign({ uVP: cam.vp, uCam: cam.pos, uTime: S.tr, uRoof: 0, uIsBody: 1 }, S.city, S.body.u));
        gl.bindVertexArray(bodyVAO); gl.drawArraysInstanced(gl.TRIANGLES, 0, 30, GLR.body.n);
      }
      gl.depthMask(false); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
      if (S.parts.on) {
        use(P.part, Object.assign({ uVP: cam.vp, uCam: cam.pos, uRight: cam.right, uUp: cam.up, uTime: S.tr }, S.parts));
        gl.bindVertexArray(partVAO); gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, Math.min(NPART, Math.ceil(NPART * (S.parts.uAmt || 0))));
      }
      if (GLR.lines.n > 0) {
        gl.bindBuffer(gl.ARRAY_BUFFER, lineBuf); gl.bufferSubData(gl.ARRAY_BUFFER, 0, lineData, 0, GLR.lines.n * 16);
        use(P.line, { uVP: cam.vp, uRes: [W, H], uProj: cam.proj * H * .5 });
        gl.bindVertexArray(lineVAO); gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, GLR.lines.n);
      }
      gl.disable(gl.BLEND); gl.disable(gl.DEPTH_TEST);
    } else {
      const b = S.bg || [0, 0, 0]; gl.clearColor(b[0], b[1], b[2], 1); gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.bindVertexArray(emptyVAO);
    // resolve MSAA
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, sceneMS.fb); gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, sceneRT.fb);
    gl.blitFramebuffer(0, 0, W, H, 0, 0, W, H, gl.COLOR_BUFFER_BIT, gl.NEAREST);
    // composite + feedback
    const prev = comp[ci], cur = comp[1 - ci]; ci = 1 - ci;
    gl.bindFramebuffer(gl.FRAMEBUFFER, cur.fb); gl.viewport(0, 0, W, H);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, sceneRT.t);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, overTex);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, prev.t);
    const po = S.post;
    use(P.comp, { uScene: 0, uOver: 1, uPrev: 2, uHasOver: S.hasOverlay ? 1 : 0, uAspect: W / H, uTime: S.t, uRes: [W, H],
      uFb: po.fb, uFbZoom: po.fbZoom, uFbRot: po.fbRot, uFbHue: po.fbHue, uFbMode: po.fbMode, uFbShift: po.fbShift,
      uKal: po.kal, uKalMix: po.kalMix, uGlitch: po.glitch, uGlSeed: po.glSeed, uWarp: po.warp, uMirror: po.mirror, uBleed: po.bleed, uPix: po.pix, uSceneSat: po.sceneSat, uSceneDim: po.sceneDim });
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // bloom
    const blur = (src, a, b) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, a.fb); gl.viewport(0, 0, a.w, a.h);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, src.t);
      use(P.bright, { uTex: 0, uThr: po.bloomThr, uTexel: [1 / src.w, 1 / src.h] }); gl.drawArrays(gl.TRIANGLES, 0, 3);
      for (let k = 0; k < 2; k++) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, b.fb); gl.bindTexture(gl.TEXTURE_2D, a.t);
        use(P.blur, { uTex: 0, uDir: [(1 + k) / a.w, 0] }); gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.bindFramebuffer(gl.FRAMEBUFFER, a.fb); gl.bindTexture(gl.TEXTURE_2D, b.t);
        use(P.blur, { uTex: 0, uDir: [0, (1 + k) / a.h] }); gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
    };
    blur(cur, bl[0], bl[1]);
    blur(bl[0], bl2[0], bl2[1]);
    // final
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, W, H);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, cur.t);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, bl[0].t);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, bl2[0].t);
    use(P.final, { uComp: 0, uBloom: 1, uBloom2: 2, uAspect: W / H, uTime: S.t, uRes: [W, H],
      uChroma: po.chroma, uBloomAmt: po.bloom, uExposure: po.exposure, uContrast: po.contrast, uSat: po.sat, uInvert: po.invert,
      uFlash: po.flash, uFlashCol: po.flashCol, uScan: po.scan, uVig: po.vig, uGrain: po.grain, uFade: po.fade, uTint: po.tint, uLift: po.lift });
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
})();

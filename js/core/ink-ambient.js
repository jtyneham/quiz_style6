import { Application, Container, Graphics } from "pixi.js";

/* Full sumi atmosphere: broad washes, brush scars, droplets and breathing voids. */
export async function createInkAmbient(host) {
  if (!host || matchMedia("(prefers-reduced-motion: reduce)").matches) return null;

  const app = new Application();
  await app.init({ backgroundAlpha: 0, antialias: true, resolution: Math.min(devicePixelRatio || 1, 1.35) });
  app.canvas.setAttribute("aria-hidden", "true");
  host.appendChild(app.canvas);

  const root = new Container();
  app.stage.addChild(root);
  const forms = [];

  const addBlob = (x,y,rx,ry,alpha,period,phase=0) => {
    const g = new Graphics();
    g.ellipse(0,0,1,1).fill({color:0x151410,alpha});
    root.addChild(g); forms.push({type:"blob",g,x,y,rx,ry,period,phase});
  };
  const addSlash = (x,y,len,width,rot,alpha,period,phase=0) => {
    const g = new Graphics();
    g.moveTo(-.5,0).bezierCurveTo(-.15,-.26,.18,.23,.5,0).stroke({color:0x11100d,alpha,width:1,cap:"round"});
    root.addChild(g); forms.push({type:"slash",g,x,y,len,width,rot,period,phase});
  };

  addBlob(.15,.16,.29,.16,.15,43,.2);
  addBlob(.84,.77,.34,.21,.12,57,1.4);
  addBlob(.69,.19,.17,.10,.065,71,2.3);
  addBlob(.28,.83,.21,.12,.07,89,.7);
  addSlash(.13,.52,.55,.028,-.13,.28,37,.4);
  addSlash(.74,.39,.48,.018,.08,.18,49,2.1);
  addSlash(.58,.69,.62,.014,-.05,.14,61,1.2);

  const droplets=[];
  for(let i=0;i<22;i++){
    const g=new Graphics();
    g.circle(0,0,1).fill({color:0x171612,alpha:.12+(i%4)*.025});
    root.addChild(g);
    droplets.push({g,x:(.07+((i*37)%89)/100),y:(.08+((i*53)%83)/100),r:1.2+(i%5)*.7,p:29+i*2.7,phase:i*.67});
  }

  const resize=()=>app.renderer.resize(Math.max(1,host.clientWidth),Math.max(1,host.clientHeight));
  const ro=new ResizeObserver(resize);ro.observe(host);resize();
  let t=0;
  app.ticker.add(ticker=>{
    t+=ticker.deltaMS/1000;
    const w=app.renderer.width,h=app.renderer.height,base=Math.max(w,h);
    forms.forEach((f,i)=>{
      const breathe=1+Math.sin(t/f.period+f.phase)*.055;
      f.g.x=w*(f.x+Math.sin(t/(f.period*.81)+f.phase)*.018);
      f.g.y=h*(f.y+Math.cos(t/(f.period*1.13)+f.phase)*.015);
      if(f.type==="blob"){
        f.g.scale.set(base*f.rx*breathe,base*f.ry*(1+Math.cos(t/(f.period*.73)+i)*.045));
        f.g.rotation=Math.sin(t/(f.period*1.7)+f.phase)*.16;
      }else{
        f.g.scale.set(base*f.len*breathe,base*f.width*(1+Math.sin(t/(f.period*.57)+i)*.12));
        f.g.rotation=f.rot+Math.sin(t/(f.period*1.9)+i)*.035;
      }
    });
    droplets.forEach((d,i)=>{
      d.g.x=w*(d.x+Math.sin(t/d.p+d.phase)*.008);
      d.g.y=h*(d.y+Math.cos(t/(d.p*1.31)+d.phase)*.006);
      const s=d.r*(1+Math.sin(t/(d.p*.7)+i)*.16)*(base/900);
      d.g.scale.set(s);
    });
  });
  return {destroy(){ro.disconnect();app.destroy(true,{children:true});}};
}

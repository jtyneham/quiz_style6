import { Application, Container, Graphics } from "pixi.js";

/*
 * Quiet sumi wash for the launcher.  Large translucent ink pools drift on
 * deliberately mismatched periods, so there is no short, perceptible loop.
 */
export async function createInkAmbient(host) {
  if (!host || matchMedia("(prefers-reduced-motion: reduce)").matches) return null;

  const app = new Application();
  await app.init({ backgroundAlpha: 0, antialias: true, resolution: Math.min(devicePixelRatio || 1, 1.5) });
  app.canvas.setAttribute("aria-hidden", "true");
  host.appendChild(app.canvas);

  const wash = new Container();
  app.stage.addChild(wash);
  const pools = [];
  const specs = [
    [.10,.18,.26,.080,151,197], [.23,.27,.18,.060,211,263], [.75,.76,.31,.052,281,337],
    [.90,.58,.22,.043,347,419], [.58,.12,.16,.036,433,521], [.42,.84,.19,.030,557,631]
  ];

  for (const [x,y,r,a,px,py] of specs) {
    const g = new Graphics();
    g.circle(0,0,1).fill({ color:0x181713, alpha:a });
    wash.addChild(g);
    pools.push({ g,x,y,r,px,py,phase:Math.random()*Math.PI*2 });
  }

  function resize() {
    app.renderer.resize(Math.max(1,host.clientWidth), Math.max(1,host.clientHeight));
  }
  const ro = new ResizeObserver(resize);
  ro.observe(host); resize();

  let elapsed=0;
  app.ticker.add((ticker)=>{
    elapsed += ticker.deltaMS / 1000;
    const w=app.renderer.width,h=app.renderer.height,base=Math.max(w,h);
    pools.forEach((p,i)=>{
      const sx=Math.sin(elapsed/p.px+p.phase), sy=Math.cos(elapsed/p.py+p.phase*.73);
      p.g.x=w*(p.x+sx*.025); p.g.y=h*(p.y+sy*.022);
      const scale=base*p.r*(1+Math.sin(elapsed/(p.px*1.37)+i)*.045);
      p.g.scale.set(scale, scale*(.72 + (i%3)*.08));
      p.g.rotation=Math.sin(elapsed/(p.py*1.9)+p.phase)*.12;
    });
  });

  return { destroy(){ ro.disconnect(); app.destroy(true,{children:true}); } };
}

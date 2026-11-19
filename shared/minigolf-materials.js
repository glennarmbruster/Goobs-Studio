import {T} from './engine.js';

// Original, tileable material art. UVs are in world metres; see repeats below.
// All nine surfaces are generated locally, so there are no remote asset requests.
export function makeMiniMaterials(renderer){
 const textures=[],materials=[],size=512;
 const anisotropy=Math.min(8,renderer?.capabilities?.getMaxAnisotropy?.()??4);
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const hash=(x,y,s)=>{let n=Math.imul(x+173,374761393)^Math.imul(y+307,668265263)^Math.imul(s+13,1274126177);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;};
 const smooth=x=>x*x*(3-2*x);
 // Periodic grids keep all texture channels continuous across every tile edge.
 const noise=(u,v,n,s,ny=n)=>{const x=u*n,y=v*ny,ix=Math.floor(x),iy=Math.floor(y),fx=smooth(x-ix),fy=smooth(y-iy),a=hash((ix%n+n)%n,(iy%ny+ny)%ny,s),b=hash(((ix+1)%n+n)%n,(iy%ny+ny)%ny,s),c=hash((ix%n+n)%n,((iy+1)%ny+ny)%ny,s),d=hash(((ix+1)%n+n)%n,((iy+1)%ny+ny)%ny,s);return (a+(b-a)*fx)*(1-fy)+(c+(d-c)*fx)*fy;};
 const canvas=()=>{const c=document.createElement('canvas');c.width=c.height=size;return c;};
 function texture(c,repeat,color=false){const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(...repeat);t.anisotropy=anisotropy;t.colorSpace=color?T.SRGBColorSpace:T.NoColorSpace;textures.push(t);return t;}
 function surface(kind,repeat,base,options={}){
  const c=canvas(),b=canvas(),r=canvas(),ctx=c.getContext('2d'),bc=b.getContext('2d'),rc=r.getContext('2d');
  const color=ctx.createImageData(size,size),height=bc.createImageData(size,size),rough=rc.createImageData(size,size),heights=new Float32Array(size*size);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const u=x/size,v=y/size,k=y*size+x,j=k*4;
   const a=noise(u,v,4,3),n=noise(u,v,16,9),fine=noise(u,v,64,17),grain=hash(x,y,29),f=a*.5+n*.3+fine*.2;
   let h=f,tint=1+(f-.5)*.5,red=base[0],green=base[1],blue=base[2],ro=.85;
   if(kind==='stone'||kind==='darkStone'){
    // Domain-warped veins and pits interrupt the broad mineral mottling.
    const veins=Math.abs(n*.72+a*.28-.48);
    const fissure=(1-smooth(clamp(veins/.009)))*smooth(clamp((a-.37)*4));
    const mineral=smooth(clamp((a-.47)*4));
    const pit=grain>.988?(grain-.988)*28:0;
    h=.5+(f-.5)*.58-fissure*.14-pit*.3+(grain-.5)*.08;
    tint=1+(a-.5)*.36+(n-.5)*.3+(fine-.5)*.17+(grain-.5)*.13-fissure*.16-pit*.18;
    if(kind==='darkStone'){
     const moss=smooth(clamp((a*.5+n*.5-.57)*5));
     red+=moss*4-mineral*3;green+=moss*23;blue-=moss*9;
     tint*=.95;ro=.87+moss*.09;
    }else {red+=mineral*8;green+=mineral*5;blue-=mineral*4;ro=.83+(fine-.5)*.16;}
   }else if(kind==='grass'){
    // Fine interleaved turf strands, with green/brown blade variation.
    const strand=Math.sin((u*137+Math.sin(v*Math.PI*12)*.65)*Math.PI*2),tip=clamp((strand-.1)*1.5);
    const speck=grain>.91?1:0;
    h=.3+fine*.25+tip*.15+grain*.2;
    tint=.82+(n-.5)*.18+(fine-.5)*.35+grain*.27+tip*.08;
    red+=speck*13;green+=speck*7;blue-=speck*3;ro=.97;
   }else if(kind==='sand'){
    // Narrow ridges support the larger circular rake marks in the garden mesh.
    const rake=.5+.5*Math.sin(v*Math.PI*2*31+Math.sin(u*Math.PI*4)*.18);
    h=.3+rake*.3+grain*.13+(fine-.5)*.12;
    tint=.92+rake*.13+(grain-.5)*.19+(f-.5)*.1;ro=.96;
   }else if(kind==='bark'){
    const long=noise(u,v,32,50,4),line=Math.abs(Math.sin((u*22+(long-.5)*1.1)*Math.PI*2));
    const split=Math.pow(1-line,6);h=.3+line*.35+f*.2-split*.16;
    tint=.75+line*.3+(n-.5)*.3+(grain-.5)*.15-split*.3;ro=.96;
   }else if(kind==='wood'){
    const w=noise(u,v,16,72,2),line=Math.sin((u*16+(w-.5)*.65)*Math.PI*2);
    h=.45+line*.06+(grain-.5)*.035;tint=.93+line*.08+(f-.5)*.14+(grain-.5)*.06;ro=.63;
   }else if(kind==='roof'){
    const rib=.5+.5*Math.cos(u*Math.PI*2*8),tile=smooth(clamp((v*8%1)*15))*smooth(clamp((1-v*8%1)*15));
    h=.2+rib*.48*tile;tint=.73+rib*.25+tile*.12+(f-.5)*.17;ro=.49;
   }
   color.data[j]=clamp(red*tint,0,255);color.data[j+1]=clamp(green*tint,0,255);color.data[j+2]=clamp(blue*tint,0,255);color.data[j+3]=255;
   heights[k]=clamp(h);const hv=Math.round(clamp(h)*255),rv=Math.round(clamp(ro+(grain-.5)*.035)*255);
   height.data[j]=height.data[j+1]=height.data[j+2]=hv;height.data[j+3]=255;
   rough.data[j]=rough.data[j+1]=rough.data[j+2]=rv;rough.data[j+3]=255;
  }
  ctx.putImageData(color,0,0);bc.putImageData(height,0,0);rc.putImageData(rough,0,0);
  const normal=canvas(),nc=normal.getContext('2d'),ni=nc.createImageData(size,size),strength=options.normalStrength??2;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){const j=(y*size+x)*4,dx=(heights[y*size+(x+1)%size]-heights[y*size+(x+size-1)%size])*strength,dy=(heights[((y+1)%size)*size+x]-heights[((y+size-1)%size)*size+x])*strength,inv=1/Math.hypot(dx,dy,1);ni.data[j]=(-dx*inv*.5+.5)*255;ni.data[j+1]=(dy*inv*.5+.5)*255;ni.data[j+2]=(inv*.5+.5)*255;ni.data[j+3]=255;}nc.putImageData(ni,0,0);
  // Normal and roughness use identical transforms, preserving surface registration.
  const m=new T.MeshStandardMaterial({color:0xffffff,map:texture(c,repeat,true),normalMap:texture(normal,repeat),normalScale:new T.Vector2(options.normalScale??.8,options.normalScale??.8),roughnessMap:texture(r,repeat),roughness:options.roughness??1,metalness:options.metalness??0,...options.material});
  m.name='Lantern Links / '+kind;m.userData.dryRoughness=m.roughness;m.userData.dryColor=m.color.clone();materials.push(m);return m;
 }
 const stone=surface('stone',[.42,.42],[179,169,145],{normalStrength:3.6,normalScale:.75});
 const darkStone=surface('darkStone',[.3,.3],[99,103,84],{normalStrength:5.5,normalScale:1.05});
 const grass=surface('grass',[1.2,1.2],[77,115,28],{normalStrength:2.5,normalScale:.55});
 const sand=surface('sand',[.55,.55],[190,165,112],{normalStrength:2.4,normalScale:.65});
 const bark=surface('bark',[.8,.28],[92,74,51],{normalStrength:4,normalScale:.9});
 const wood=surface('wood',[.65,.3],[108,37,25],{normalStrength:2,normalScale:.5});
 const roof=surface('roof',[.65,.65],[52,74,61],{normalStrength:3,normalScale:.8,metalness:.15});
 const gold=new T.MeshStandardMaterial({color:0xc1a65c,metalness:.62,roughness:.38});gold.name='Lantern Links / aged bronze';gold.userData.dryRoughness=.38;gold.userData.dryColor=gold.color.clone();materials.push(gold);
 const water=new T.MeshStandardMaterial({color:0x347b76,metalness:.3,roughness:.15,transparent:true,opacity:.86});water.name='Lantern Links / pond water';water.userData.dryRoughness=.15;water.userData.dryColor=water.color.clone();materials.push(water);
 // Bundled CC0 scans supply real mineral detail; procedural maps remain the offline error fallback.
 if(renderer?.isWebGLRenderer){const loader=new T.TextureLoader();function scanned(mat,asset,repeat){for(const [channel,slot,color] of [['Diffuse','map',true],['nor_gl','normalMap',false],['arm','roughnessMap',false]]){const fallback=mat[slot];const t=loader.load(new URL('../assets/minigolf-jade/'+asset+'_'+channel+'.jpg',import.meta.url).href,undefined,undefined,()=>{t.image=fallback.image;t.needsUpdate=true;});t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(repeat,repeat);t.anisotropy=anisotropy;t.colorSpace=color?T.SRGBColorSpace:T.NoColorSpace;textures.push(t);mat[slot]=t;}mat.normalScale.set(.75,.75);}
  scanned(stone,'sandstone_cracks',.42);scanned(darkStone,'rock_boulder_cracked',.30);
 }
 let disposed=false;
 return {stone,darkStone,sand,grass,bark,gold,roof,wood,water,
  setWeather(key){const wet=key==='rain';for(const m of materials){m.roughness=wet?Math.max(.18,m.userData.dryRoughness*.51):m.userData.dryRoughness;m.color.copy(m.userData.dryColor);if(wet&&m!==gold&&m!==water)m.color.multiplyScalar(.88);}grass.roughness=wet?.65:1;water.roughness=wet?.23:.15;},
  dispose(){if(disposed)return;disposed=true;for(const t of textures)t.dispose();for(const m of materials)m.dispose();}
 };
}

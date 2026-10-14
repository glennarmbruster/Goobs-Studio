import {T} from './engine.js';
import {RGBELoader} from './vendor/loaders/RGBELoader.js';
import {GLTFLoader} from './vendor/loaders/GLTFLoader.js';
import {DRACOLoader} from './vendor/loaders/DRACOLoader.js';
const asset=name=>new URL('../assets/'+name,import.meta.url).href;
// All visual resources belong to one mounted game, including late async arrivals.
export function visualKit(e,{coast=false}={}){
 let alive=true,environment=null;const textures=[];
 function texture(name,repeat=1){const tex=new T.TextureLoader().load(asset(name));tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(repeat,repeat);tex.anisotropy=4;textures.push(tex);return tex}
 const turf=texture('turf.webp'),rock=texture('rock.webp'),sand=texture('sand.webp');
 const materials={turf:new T.MeshStandardMaterial({map:turf,color:0xb6c597,roughness:.94}),rock:new T.MeshStandardMaterial({map:rock,color:0xb1b1a2,roughness:.93}),sand:new T.MeshStandardMaterial({map:sand,color:0xe5d6b9,roughness:1})};
 if(coast){
  // Curved panorama: the photograph covers the forward hemisphere; horizon stays level.
  const panorama=texture('coastal-panorama.webp');panorama.wrapS=T.MirroredRepeatWrapping;panorama.wrapT=T.ClampToEdgeWrapping;
  const g=new T.SphereGeometry(480,64,32,0,Math.PI*2,0,Math.PI);
  const uv=g.attributes.uv;for(let i=0;i<uv.count;i++){const v=uv.getY(i);uv.setY(i,.23+(v-.5)*1.48);uv.setX(i,uv.getX(i)*2)}
  const dome=new T.Mesh(g,new T.MeshBasicMaterial({map:panorama,side:T.BackSide,fog:false,toneMapped:false}));dome.userData.dynamic=true;dome.renderOrder=-10;e.scene.add(dome);
  // Sky follows translation, but never rotation: it cannot slide across the horizon.
  dome.onBeforeRender=()=>{dome.position.copy(e.camera.position);dome.updateMatrixWorld()};
  e.scene.background?.dispose?.();e.scene.background=new T.Color(0x94bccb);e.scene.fog.color.setHex(0x9bbbc1);e.scene.fog.near=200;e.scene.fog.far=480;
  e.sun.intensity=2.1;e.sun.color.setHex(0xffe2b8);e.renderer.toneMappingExposure=.86;
  for(const o of e.scene.children)if(o.isHemisphereLight)o.intensity=1.3;
  new RGBELoader().load(asset('coastal-light.hdr'),tex=>{if(!alive){tex.dispose();return}tex.mapping=T.EquirectangularReflectionMapping;environment=tex;e.scene.environment=tex;e.scene.environmentIntensity=.65},undefined,()=>{});
 }
 function surface(mesh,kind='turf',meters=4,tint){const mat=materials[kind].clone();if(tint!==undefined)mat.color.setHex(tint);mesh.material.dispose();mesh.material=mat;worldUV(mesh.geometry,meters);mesh.receiveShadow=true;return mesh}
 function boulder(parent,x,y,z,sx,sy,sz,seed=0){const geo=new T.IcosahedronGeometry(1,2),p=geo.attributes.position;for(let i=0;i<p.count;i++){const a=p.getX(i),b=p.getY(i),c=p.getZ(i),n=1+.13*Math.sin(a*7+b*4+seed)*Math.cos(c*8-seed);p.setXYZ(i,a*n,b*n,c*n)}geo.computeVertexNormals();worldUV(geo,.8);const m=new T.Mesh(geo,materials.rock);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.y=seed;m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
 return {texture,surface,boulder,materials,dispose(){alive=false;environment?.dispose();for(const t of textures)t.dispose();for(const m of Object.values(materials))m.dispose()}};
}
export function worldUV(geo,meters=4){const p=geo.attributes.position,a=[];const planar=geo.type==='ShapeGeometry'||geo.type==='CircleGeometry'||geo.type==='RingGeometry'||geo.type==='PlaneGeometry';for(let i=0;i<p.count;i++)a.push(p.getX(i)/meters,(planar?p.getY(i):p.getZ(i)+p.getY(i)*.7)/meters);geo.setAttribute('uv',new T.Float32BufferAttribute(a,2));return geo}
export function actor(parent,name,{height=2.75,aspect=768/640,foot=30/640}={}){const tex=new T.TextureLoader().load(asset(name+'-atlas.webp'));tex.colorSpace=T.SRGBColorSpace;tex.repeat.set(1/3,1/2);tex.offset.set(0,.5);tex.minFilter=T.LinearFilter;tex.generateMipmaps=false;const m=new T.SpriteMaterial({map:tex,alphaTest:.15,transparent:true,depthWrite:true,toneMapped:false});const sprite=new T.Sprite(m);sprite.scale.set(height*aspect,height,1);sprite.center.set(.5,foot);sprite.position.y=.01;parent.add(sprite);let current=-1,mirrored=false;return {sprite,frame(n,flip=false){n=Math.max(0,Math.min(5,Math.floor(n)));if(n===current&&flip===mirrored)return;current=n;mirrored=flip;tex.repeat.x=flip?-1/3:1/3;tex.offset.set((n%3+(flip?1:0))/3,1-(Math.floor(n/3)+1)/2)},dispose(){tex.dispose();m.dispose()}}}
export function detailedCar(parent,fallback,paint=0xe35b32){let alive=true,model=null;const wheels=[];const decoder=new DRACOLoader().setDecoderPath(new URL('./vendor/draco/',import.meta.url).href).setWorkerLimit(1);const loader=new GLTFLoader().setDRACOLoader(decoder);loader.load(asset('coastal-coupe.glb'),gltf=>{if(!alive){releaseModel(gltf.scene);decoder.dispose();return}model=gltf.scene;const bounds=new T.Box3().setFromObject(model),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3()),scale=4.35/size.z;model.scale.setScalar(scale);model.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);model.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;o.material.envMapIntensity=1.1;if(o.name==='body')o.material=new T.MeshPhysicalMaterial({color:paint,metalness:.68,roughness:.23,clearcoat:1,clearcoatRoughness:.1});if(o.name==='glass')o.material=new T.MeshPhysicalMaterial({color:0x73949d,metalness:.1,roughness:.08,transparent:true,opacity:.72});});for(const n of ['wheel_fl','wheel_fr','wheel_rl','wheel_rr']){const w=model.getObjectByName(n);if(w)wheels.push(w)}parent.add(model);fallback.visible=false;decoder.dispose()},undefined,()=>decoder.dispose());return {update(d,steer){for(const w of wheels){w.rotation.x=-d/.34;if(w.name==='wheel_fl'||w.name==='wheel_fr')w.rotation.y=-steer*.24}},dispose(){alive=false;decoder.dispose();if(model){parent.remove(model);releaseModel(model)}}}}
function releaseModel(root){root.traverse(o=>{o.geometry?.dispose();for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){for(const v of Object.values(m))if(v?.isTexture)v.dispose();m.dispose()}})}

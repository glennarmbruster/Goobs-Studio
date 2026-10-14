import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import * as T from '../dist/shared/three.module.js';
import {GLTFLoader} from '../dist/shared/vendor/loaders/GLTFLoader.js';
import {RGBELoader} from '../dist/shared/vendor/loaders/RGBELoader.js';
const root=new URL('../dist/',import.meta.url),read=p=>readFileSync(new URL(p,root));
test('bundled car decodes with local Draco, has four wheels and sensible bounds',async()=>{
 const mod={exports:{}};const factory=new Function('module','exports','require','__dirname',read('shared/vendor/draco/draco_wasm_wrapper.js').toString()+';return module.exports;')(mod,mod.exports,createRequire(import.meta.url),'');
 const draco=await factory({wasmBinary:read('shared/vendor/draco/draco_decoder.wasm')});
 const localDecoder={preload(){},decodeDracoFile(buffer,onLoad,ids){const decoder=new draco.Decoder(),mesh=new draco.Mesh(),array=new Int8Array(buffer);const status=decoder.DecodeArrayToMesh(array,array.length,mesh);assert.ok(status.ok(),status.error_msg());const geo=new T.BufferGeometry();for(const [name,id]of Object.entries(ids)){const a=decoder.GetAttributeByUniqueId(mesh,id),n=mesh.num_points()*a.num_components(),ptr=draco._malloc(n*4);decoder.GetAttributeDataArrayForAllPoints(mesh,a,draco.DT_FLOAT32,n*4,ptr);geo.setAttribute(name,new T.BufferAttribute(new Float32Array(draco.HEAPF32.buffer,ptr,n).slice(),a.num_components()));draco._free(ptr)}const n=mesh.num_faces()*3,ptr=draco._malloc(n*4);decoder.GetTrianglesUInt32Array(mesh,n*4,ptr);geo.setIndex(new T.BufferAttribute(new Uint32Array(draco.HEAPF32.buffer,ptr,n).slice(),1));draco._free(ptr);draco.destroy(mesh);draco.destroy(decoder);onLoad(geo)}};
 const data=read('assets/coastal-coupe.glb');const gltf=await new GLTFLoader().setDRACOLoader(localDecoder).parseAsync(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),'');
 const scene=gltf.scene,size=new T.Box3().setFromObject(scene).getSize(new T.Vector3());assert.ok(size.z>4&&size.z<6);assert.ok(size.x>1.6&&size.x<3);assert.ok(size.y>1&&size.y<2);assert.ok(scene.getObjectByName('body')?.isMesh);assert.ok(scene.getObjectByName('glass')?.isMesh);for(const n of ['wheel_fl','wheel_fr','wheel_rl','wheel_rr'])assert.ok(scene.getObjectByName(n),n);assert.ok(scene.getObjectByName('wheel_fl').position.z<scene.getObjectByName('wheel_rl').position.z,'front wheels face down the route');scene.traverse(o=>{o.geometry?.dispose();o.material?.dispose?.()});
});
test('bundled lighting HDR decodes at a bounded resolution',()=>{const b=read('assets/coastal-light.hdr'),r=new RGBELoader().parse(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));assert.equal(r.width,1024);assert.equal(r.height,512);assert.equal(r.data.length,1024*512*4)});

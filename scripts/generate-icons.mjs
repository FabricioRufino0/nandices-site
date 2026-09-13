import sharp from 'sharp';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

// Rasterize the existing Nandices monogram; no new artwork or dependency.
const source=fileURLToPath(new URL('../public/favicon.svg',import.meta.url));
for(const [name,size] of [['favicon.png',96],['apple-touch-icon.png',180],['icon-192.png',192],['icon-512.png',512]]){
 await sharp(source).resize(size,size).png().toFile(fileURLToPath(new URL('../public/'+name,import.meta.url)));
}
const sizes=[16,32,48];
const images=await Promise.all(sizes.map(size=>sharp(source).resize(size,size).png().toBuffer()));
const header=Buffer.alloc(6+16*sizes.length);header.writeUInt16LE(1,2);header.writeUInt16LE(sizes.length,4);
let offset=header.length;
images.forEach((data,i)=>{const p=6+i*16;header[p]=sizes[i];header[p+1]=sizes[i];header.writeUInt16LE(1,p+4);header.writeUInt16LE(32,p+6);header.writeUInt32LE(data.length,p+8);header.writeUInt32LE(offset,p+12);offset+=data.length});
await writeFile(new URL('../public/favicon.ico',import.meta.url),Buffer.concat([header,...images]));

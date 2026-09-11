import sharp from 'sharp';
import {readdir,writeFile} from 'node:fs/promises';
const metadata={};
for(const folder of ['brigadeiros','degustacao','bolos']) {
 const dir=`public/images/products/${folder}`;
 for(const file of await readdir(dir)) {
  if(!file.endsWith('.png'))continue;
  const input=`${dir}/${file}`;
  const {width,height}=await sharp(input).metadata();
  metadata[`/images/products/${folder}/${file.replace('.png','')}`]={width,height};
  for(const size of [320,480,960]) await sharp(input).resize({width:size,withoutEnlargement:true}).webp({quality:83}).toFile(`${dir}/${file.replace('.png',`-${size}.webp`)}`);
 }
}
await writeFile('src/data/imageMetadata.json',JSON.stringify(metadata,null,2)+'\n');

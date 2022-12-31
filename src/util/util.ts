import Jimp from 'jimp';
import { checkStatus } from '../errors';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// helper function to download, filter, and save the filtered image locally
export async function filterImageFromURL(inputURL: string): Promise<string> {
  // Jimp is throwing exceptions when reading large images from urls
  //
  const fetchImageResponse = await fetch(inputURL);
  const imageChunks: Buffer[] = [];

  checkStatus(fetchImageResponse, 'Image from the provided url');

  for await (const chunk of fetchImageResponse.body) {
    imageChunks.push(chunk as Buffer);
  }

  const jimpImage = await Jimp.read(Buffer.concat(imageChunks));
  const outPath = path.resolve(
    './tmp/filtered.' + Math.floor(Math.random() * 2000) + '.jpg',
  );

  // returns the absolute path of the filtered jimpImage
  return new Promise<string>((resolve) => {
    jimpImage
      .resize(256, 256) // resize
      .quality(60) // set JPEG quality
      .greyscale() // set greyscale
      .write(outPath, (e) => {
        if (e) throw e;
        resolve(outPath);
      });
  });
}

// useful to cleanup after tasks
export async function deleteLocalFiles(fileAbsolutePaths: string[]) {
  for (const file of fileAbsolutePaths) {
    fs.unlinkSync(file);
  }
}

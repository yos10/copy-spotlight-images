'use strict';

const fs = require('fs');
const path = require('path');
const FileType = require('file-type');
const sizeOf = require('image-size');
const homeDir = require('os').homedir();

const appdataLocalDir = path.join(homeDir, 'AppData', 'Local');
const sourceDir = path.join(appdataLocalDir, 'Packages', 'Microsoft.Windows.ContentDeliveryManager_cw5n1h2txyewy', 'LocalState', 'Assets');
const destinationDir = path.join(homeDir, 'Pictures', 'Spotlight');

if (!fs.existsSync(destinationDir)) {
  fs.mkdirSync(destinationDir);
}

async function getFilePaths() {
  // 保存済みか確認するためファイルから末尾の拡張子を削除したファイル名の配列をつくる
  const savedFiles = fs.readdirSync(destinationDir).map(f => path.basename(f, '.jpg'));
  // 保存済みか調べる。そうでなければそれらが新規に追加するファイル
  const newFiles = fs.readdirSync(sourceDir).filter(f => savedFiles.indexOf(f) === -1);
  const filePaths = newFiles.map(f => path.join(sourceDir, f));
  // console.log(newFiles);
  // console.log(filePaths);
  return filePaths;
}

async function filterWallpaperImages(filePaths) {
  const wallpaperImages = [];
  for (const filePath of filePaths) {
    const isJpg = await FileType.fromFile(filePath);
    const imageWidth = sizeOf(filePath).width;
    // sourceDir には壁紙用ではないファイルが存在しているので判別
    if (isJpg.ext === 'jpg' && imageWidth >= 1920) {
      wallpaperImages.push(filePath);
    }
  }
  // console.log(wallpaperImages);
  return wallpaperImages;
}


getFilePaths()
  .then((filePaths) => filterWallpaperImages(filePaths))
  .then((wallpaperImages) => {
    wallpaperImages.forEach((image) => {
      const fileName = path.basename(image);
      const dest = path.join(destinationDir, `${fileName}.jpg`);
      // console.log(dest);
      fs.copyFileSync(image, dest);
    })
  })
  .catch(console.error);

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

/**
 * sourceDir 内で destinationDir に保存済みでないファイルのフルパスを配列で返す。
 * @returns {array}
 */
function getFiles() {
  // 保存済みか確認するためファイルから末尾の拡張子を削除したファイル名の配列をつくる
  const savedFiles = fs.readdirSync(destinationDir).map(f => path.basename(f, '.jpg'));
  // 保存済みか調べる。そうでなければそれらが新規に追加するファイル
  const newFiles = fs.readdirSync(sourceDir).filter(f => savedFiles.indexOf(f) === -1);
  const files = newFiles.map(f => path.join(sourceDir, f));
  // console.log(newFiles);
  // console.log(files);
  return files;
}

/**
 * ファイルの種類が jpg かつ横幅が 1920 以上の壁紙用のファイルの配列を返す。
 * @param {array} files 
 * @returns {array}
 */
async function filterWallpaperImages(files) {
  const wallpaperImages = [];
  for (const file of files) {
    const fileType = await FileType.fromFile(file);
    const imageWidth = sizeOf(file).width;
    // sourceDir には壁紙用ではないファイルが存在しているので判別
    if (fileType.ext === 'jpg' && imageWidth >= 1920) {
      wallpaperImages.push(file);
    }
  }
  // console.log(wallpaperImages);
  return wallpaperImages;
}



function copyImages(wallpaperImages) {
  for (const image of wallpaperImages) {
    const fileName = path.basename(image);
    const dest = path.join(destinationDir, `${fileName}.jpg`);
    // console.log(fileName);
    fs.copyFileSync(image, dest);
  }
}



async function run() {
  const files = getFiles();
  const wallpaperImages = await filterWallpaperImages(files);
  copyImages(wallpaperImages);
}

run();

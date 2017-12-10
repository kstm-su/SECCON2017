const fs = require('fs');
const axios = require('axios');
const QrCode = require('qrcode-reader');
const Jimp = require("jimp");

const Cube = require('cubejs');
require('cubejs/lib/solve.js');
Cube.initSolver();

const size = 82;
const host = 'http://qubicrube.pwn.seccon.jp:33654/';
let hash = '';
let n = 0;

function decodeQR(buf) {
  return new Promise((resolve, reject) => {
    Jimp.read(buf, (err, img) => {
      if (err != null) {
        return reject(err);
      }
      let qr = new QrCode();
      qr.callback = (err, value) => {
        if (err != null) {
          return reject(err);
        }
        return resolve(value);
      };
      qr.decode(img.bitmap);
    });
  });
}

function splitImage(buf) {
  return new Promise((resolve, reject) => {
    Jimp.read(buf, (err, img) => {
      if (err != null) {
        return reject(err);
      }
      resolve(img);
    });
  }).then(src => {
    tasks = [];
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        tasks.push(new Promise((resolve, reject) => {
          let img = src.clone().crop(x * size, y * size, size, size);
          img.getBuffer(Jimp.MIME_PNG, (err, buf) => {
            if (err != null) {
              return reject(err);
            }
            resolve([buf, img]);
          });
        }));
      }
    }
    return Promise.all(tasks);
  });
}

function rotateRight(src) {
  return [
    src[6].rotate(90), src[3].rotate(90), src[0].rotate(90),
    src[7].rotate(90), src[4].rotate(90), src[1].rotate(90),
    src[8].rotate(90), src[5].rotate(90), src[2].rotate(90),
  ];
}

function rotate(src, move) {
  let dst = {
    U: [...src.U],
    R: [...src.R],
    F: [...src.F],
    D: [...src.D],
    L: [...src.L],
    B: [...src.B],
  };
  switch (move) {
    case 'R':
      dst['R'] = rotateRight(src['R']);
      dst['F'][2] = src['D'][2];
      dst['F'][5] = src['D'][5];
      dst['F'][8] = src['D'][8];
      dst['U'][2] = src['F'][2];
      dst['U'][5] = src['F'][5];
      dst['U'][8] = src['F'][8];
      dst['B'][6] = src['U'][2];
      dst['B'][3] = src['U'][5];
      dst['B'][0] = src['U'][8];
      dst['D'][2] = src['B'][6];
      dst['D'][5] = src['B'][3];
      dst['D'][8] = src['B'][0];
      dst['B'][6].rotate(180);
      dst['B'][3].rotate(180);
      dst['B'][0].rotate(180);
      dst['D'][2].rotate(180);
      dst['D'][5].rotate(180);
      dst['D'][8].rotate(180);
      break;
    case 'L':
      dst['L'] = rotateRight(src['L']);
      dst['B'][2] = src['D'][6];
      dst['B'][5] = src['D'][3];
      dst['B'][8] = src['D'][0];
      dst['U'][6] = src['B'][2];
      dst['U'][3] = src['B'][5];
      dst['U'][0] = src['B'][8];
      dst['F'][6] = src['U'][6];
      dst['F'][3] = src['U'][3];
      dst['F'][0] = src['U'][0];
      dst['D'][6] = src['F'][6];
      dst['D'][3] = src['F'][3];
      dst['D'][0] = src['F'][0];
      dst['B'][2].rotate(180);
      dst['B'][5].rotate(180);
      dst['B'][8].rotate(180);
      dst['U'][6].rotate(180);
      dst['U'][3].rotate(180);
      dst['U'][0].rotate(180);
      break;
    case 'U':
      dst['U'] = rotateRight(src['U']);
      dst['B'][0] = src['L'][0];
      dst['B'][1] = src['L'][1];
      dst['B'][2] = src['L'][2];
      dst['R'][0] = src['B'][0];
      dst['R'][1] = src['B'][1];
      dst['R'][2] = src['B'][2];
      dst['F'][0] = src['R'][0];
      dst['F'][1] = src['R'][1];
      dst['F'][2] = src['R'][2];
      dst['L'][0] = src['F'][0];
      dst['L'][1] = src['F'][1];
      dst['L'][2] = src['F'][2];
      break;
    case 'D':
      dst['D'] = rotateRight(src['D']);
      dst['L'][6] = src['B'][6];
      dst['L'][7] = src['B'][7];
      dst['L'][8] = src['B'][8];
      dst['F'][6] = src['L'][6];
      dst['F'][7] = src['L'][7];
      dst['F'][8] = src['L'][8];
      dst['R'][6] = src['F'][6];
      dst['R'][7] = src['F'][7];
      dst['R'][8] = src['F'][8];
      dst['B'][6] = src['R'][6];
      dst['B'][7] = src['R'][7];
      dst['B'][8] = src['R'][8];
      break;
    case 'F':
      dst['F'] = rotateRight(src['F']);
      dst['L'][2] = src['D'][0];
      dst['L'][5] = src['D'][1];
      dst['L'][8] = src['D'][2];
      dst['U'][8] = src['L'][2];
      dst['U'][7] = src['L'][5];
      dst['U'][6] = src['L'][8];
      dst['R'][6] = src['U'][8];
      dst['R'][3] = src['U'][7];
      dst['R'][0] = src['U'][6];
      dst['D'][0] = src['R'][6];
      dst['D'][1] = src['R'][3];
      dst['D'][2] = src['R'][0];
      dst['D'][0].rotate(90);
      dst['D'][1].rotate(90);
      dst['D'][2].rotate(90);
      dst['L'][2].rotate(90);
      dst['L'][5].rotate(90);
      dst['L'][8].rotate(90);
      dst['R'][6].rotate(90);
      dst['R'][3].rotate(90);
      dst['R'][0].rotate(90);
      dst['U'][8].rotate(90);
      dst['U'][7].rotate(90);
      dst['U'][6].rotate(90);
      break;
    case 'B':
      dst['B'] = rotateRight(src['B']);
      dst['R'][2] = src['D'][8];
      dst['R'][5] = src['D'][7];
      dst['R'][8] = src['D'][6];
      dst['U'][0] = src['R'][2];
      dst['U'][1] = src['R'][5];
      dst['U'][2] = src['R'][8];
      dst['L'][6] = src['U'][0];
      dst['L'][3] = src['U'][1];
      dst['L'][0] = src['U'][2];
      dst['D'][8] = src['L'][6];
      dst['D'][7] = src['L'][3];
      dst['D'][6] = src['L'][0];
      dst['R'][2].rotate(270);
      dst['R'][5].rotate(270);
      dst['R'][8].rotate(270);
      dst['U'][0].rotate(270);
      dst['U'][1].rotate(270);
      dst['U'][2].rotate(270);
      dst['D'][8].rotate(270);
      dst['D'][7].rotate(270);
      dst['D'][6].rotate(270);
      dst['L'][6].rotate(270);
      dst['L'][3].rotate(270);
      dst['L'][0].rotate(270);
      break;
  }
  return dst;
}

function solve(hash) {
  return axios.get(`${host}${hash}`)
    .then(resp => resp.data.match(/images\/\w+_[A-Z].png/g))
    .then(imgs => imgs.sort((a, b) => {
      let ac = a.slice(-5, -4);
      let bc = b.slice(-5, -4);
      const s = 'URFDLB';
      return s.indexOf(ac) - s.indexOf(bc);
    }))
    .then(imgs => imgs.map(img => axios.get(`${host}${img}`, {
      responseType: 'arraybuffer',
    }).then(resp => {
      fs.writeFileSync(`./${img}`, resp.data);
      return resp;
    })))
    .then(imgs => Promise.all(imgs))
    .then(imgs => {
      let cubeStr = [];
      let cubeMap = {
        U: [],
        R: [],
        F: [],
        D: [],
        L: [],
        B: [],
      };
      let colors = {};
      return Promise.all(imgs.map((resp, k) => splitImage(resp.data).then(imgs => {
          imgs.forEach(([buf, img], i) => {
            let dir = resp.request.path.slice(-5, -4);
            for (let j = 0; j < img.bitmap.data.length; j += 4) {
               let r = img.bitmap.data[j];
               let g = img.bitmap.data[j + 1];
               let b = img.bitmap.data[j + 2];
               let rgb = (r << 16) | (g << 8) | b;
               if (rgb == 0) {
                 continue;
               }
               let color = rgb.toString(16);
               if (i == 4) {
                 colors[color] = dir;
               }
               cubeStr[k * 9 + i] = color;
               cubeMap[dir][i] = img;
               break;
            }
          });
        }))).then(() => {
          cubeStr = cubeStr.map(c => colors[c]);
          let cube = Cube.fromString(cubeStr.join(''));
          let moves = process.argv[3];
          moves = moves || cube.solve();
          console.log(moves);
          moves.split(' ').forEach(move => {
            let n = 1;
            if (move[1] == '2') {
              n = 2;
            } else if (move[1] == "'") {
              n = 3;
            }
            for (let i = 0; i < n; i++) {
              cubeMap = rotate(cubeMap, move[0]);
            }
          });
          return Promise.all(Object.entries(cubeMap).map(p => {
            return new Promise((resolve, reject) => {
              new Jimp(size * 3, size * 3, (err, img) => {
                if (err != null) {
                  return reject(err);
                }
                p[1].forEach((t, i) => img.composite(t, size * (i % 3), size * (i / 3 | 0)));
                let result = null;
                const fn = i => new Promise((resolve, reject) => {
                  img.composite(p[1][4].rotate(i * 90), size, size);
                  const d = img.bitmap.data;
                  for (let i = 0; i < d.length; i += 4) {
                    let c = d[i] | d[i + 1] | d[i + 2];
                    d[i] = c ? 0xff : 0;
                    d[i + 1] = c ? 0xff : 0;
                    d[i + 2] = c ? 0xff : 0;
                  }
                  img.getBuffer(Jimp.MIME_PNG, (err, buf) => {
                    if (err != null) {
                      return reject(err);
                    }
                    fs.writeFileSync(`./images/${hash}-${p[0]}-${i}.png`, buf);
                    decodeQR(buf).then(v => {
                      fs.writeFileSync(`./images/${hash}-${p[0]}.png`, buf);
                      result = v;
                      return resolve();
                    }, resolve);
                  });
                });
                const ps = [];
                for (let i = 0; i < 4; i++) {
                  ps.push(fn(i));
                }
                Promise.all(ps).then(() => resolve(result), reject);
              });
            });
          }));
        });
      return imgs;
    })
    .then(imgs => imgs.filter(img => img))
    .then(imgs => {
      let next = null;
      imgs.forEach(img => {
        if (img.result.indexOf(host) == 0) {
          next = img.result.slice(host.length)
        }
        if (img.result.indexOf('No.') == 0) {
          console.log(img.result);
        }
      });
      if (next == null) {
        console.log(imgs);
        throw new Error('faild to detect next URL');
      };
      console.log(`next URL: ${host}${next}`);
      return next;
    });
}

solve(process.argv[2].replace(/\s/g, ''))
  .then(solve)
  .then(solve)
  .then(solve)
  .then(solve)
  .then(solve)
  .then(solve)
  .then(solve)
  .then(solve)
  .then(solve)
  .catch(err => console.error(err));

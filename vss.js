var vss = {
  updatePixelData: function(target, func) {
    if(target.getContext) {
      var ctx = target.getContext('2d');
      var imgData = ctx.getImageData(0, 0, target.width, target.height);
      func(imgData);
      ctx.putImageData(imgData, 0, 0);
    }
  },

  procPixelData: function(dst, src, func) {
    if(dst.getContext && src.getContext) {
      var ctx = src.getContext('2d');
      var srcImgData = ctx.getImageData(0, 0, src.width, src.height);
      var dstImgData = ctx.createImageData(srcImgData);
      func(dstImgData, srcImgData);
      dst.width = src.width
      dst.height = src.height
      dst.getContext('2d').putImageData(dstImgData, 0, 0);
    }
  },

  forEachPos: function(target, func) {
    for(var y = 0; y < target.height; y++) {
      for(var x = 0; x < target.width; x++) {
        func({x: x, y: y});
      }
    }
  },

  rgba: function(r, g, b, a) {
    return {r: r, g: g, b: b, a: a};
  },

  gray: function(v) {
    return vss.rgba(v, v, v, 255);
  },

  offsetPos: function(pos, off_x, off_y) {
    return {x: pos.x + off_x, y: pos.y + off_y};
  },

  getPixel: function(target, pos) {
    var offset = (target.width * pos.y + pos.x) * 4;
    return vss.rgba(
      target.data[offset    ], // R
      target.data[offset + 1], // G
      target.data[offset + 2], // B
      target.data[offset + 3]  // A
    );
  },

  setPixel: function(target, pos, color) {
    var offset = (target.width * pos.y + pos.x) * 4;
    target.data[offset    ] = color.r; // R
    target.data[offset + 1] = color.g; // G
    target.data[offset + 2] = color.b; // B
    target.data[offset + 3] = color.a; // A
  },

  grayScale: function(dst, src) {
    vss.procPixelData(dst, src, function(d, s) {
      vss.forEachPos(s, function(pos) {
        var p = vss.getPixel(s, pos);
        var v = p.r * 0.3 + p.g * 0.59 + p.b * 0.11;
        vss.setPixel(d, pos, vss.gray(v));
      });
    });
  },

  binary: function(dst, src) {
    vss.procPixelData(dst, src, function(d, s) {
      vss.forEachPos(s, function(pos) {
        var v = (vss.getPixel(s, pos).r > 128) ? 255 : 0;
        vss.setPixel(d, pos, vss.gray(v));
      });
    });
  },

  // https://www.visgraf.impa.br/Courses/ip00/proj/Dithering1/floyd_steinberg_dithering.html
  binaryDith: function(dst, src) {
    vss.procPixelData(dst, src, function(d, s) {
      // copy
      vss.forEachPos(d, function(pos) {
        vss.setPixel(d, pos, vss.getPixel(s, pos));
      });

      vss.forEachPos(d, function(pos) {
        var p = vss.getPixel(d, pos);
        var vOld = p.r;
        var vNew = (p.r > 128) ? 255 : 0;
        var e = vOld - vNew;

        var m = [
          [   0,    0, 7/16],
          [3/16, 5/16, 1/16]
        ];

        var pos2 = vss.offsetPos(pos, 0, 0);
        vss.setPixel(d, pos2, vss.gray(vNew));
        pos2 = vss.offsetPos(pos, 1, 0);
        vss.setPixel(d, pos2, vss.gray(vss.getPixel(d, pos2).r + m[0][2] * e));
        pos2 = vss.offsetPos(pos, -1, 1);
        vss.setPixel(d, pos2, vss.gray(vss.getPixel(d, pos2).r + m[1][0] * e));
        pos2 = vss.offsetPos(pos, 0, 1);
        vss.setPixel(d, pos2, vss.gray(vss.getPixel(d, pos2).r + m[1][1] * e));
        pos2 = vss.offsetPos(pos, 1, 1);
        vss.setPixel(d, pos2, vss.gray(vss.getPixel(d, pos2).r + m[1][2] * e));
      });
    });
  },

  vss: function(dst1, dst2OrRnd, src, useAsRnd = false) {
    var width = src.width;
    var height = src.height;
    var rndImgData;

    if(useAsRnd) {
      var ctx = dst2OrRnd.getContext('2d');
      rndImgData = ctx.getImageData(0, 0, width * 2, height * 2);
    } else {
      var arrRnd = new Uint8Array((width * height) / 2 + 1)
      window.crypto.getRandomValues(arrRnd);

      dst2OrRnd.width = width * 2
      dst2OrRnd.height = height * 2
      vss.updatePixelData(dst2OrRnd, function(imgData) {
        var i = 0
        vss.forEachPos(imgData, function(pos) {
          var a = ((arrRnd[Math.floor(i / 8)] >> (i % 8)) & 1) * 255;
          vss.setPixel(imgData, pos, vss.rgba(0, 0, 0, a));
          i++;
        });
        rndImgData = imgData;
      });
    }
    console.log(rndImgData);

    var ctx = src.getContext('2d');
    var srcImgData = ctx.getImageData(0, 0, width, height)

    dst1.width = rndImgData.width;
    dst1.height = rndImgData.height;

    vss.updatePixelData(dst1, function(dstImgData) {
      for(var y = 0; y < height; y++) {
        for(var x = 0; x < width; x++) {
          var p = {x: x, y: y};
          var func;
          if(vss.getPixel(srcImgData, p).r == 0)
            func = (c) => {return vss.rgba(0, 0, 0, ~c.a & 0xff)}
          else
            func = (c) => {return c};

          var p2 = {x: x * 2, y: y * 2};
          vss.setPixel(dstImgData, p2, func(vss.getPixel(rndImgData, p2)));
          p2 = vss.offsetPos(p2, 1, 0);
          vss.setPixel(dstImgData, p2, func(vss.getPixel(rndImgData, p2)));
          p2 = vss.offsetPos(p2, 0, 1);
          vss.setPixel(dstImgData, p2, func(vss.getPixel(rndImgData, p2)));
          p2 = vss.offsetPos(p2, -1, 0);
          vss.setPixel(dstImgData, p2, func(vss.getPixel(rndImgData, p2)));
        }
      }
    });
  }
}

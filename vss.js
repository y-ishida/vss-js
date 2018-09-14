(function() {
  "use strict";

  var procPixelData = function(dst, src, func) {
    if(dst.getContext && src.getContext) {
      var width = src.width;
      var height = src.height;

      dst.width = width;
      dst.height = height;

      var ctxD = dst.getContext('2d');
      var ctxS = src.getContext('2d');
      var imgDataD = ctxD.getImageData(0, 0, width, height);
      var imgDataS = ctxS.getImageData(0, 0, width, height);

      func(
        {data: imgDataD.data, width: width, height: height},
        {data: imgDataS.data, width: width, height: height}
      );

      ctxD.putImageData(imgDataD, 0, 0);
    }
  }

  var forEachPos = function(target, func) {
    for(var y = 0; y < target.height; y++) {
      for(var x = 0; x < target.width; x++) {
        func({x: x, y: y});
      }
    }
  }

  var rgba = function(r, g, b, a) {
    return {r: r, g: g, b: b, a: a};
  }

  var gray = function(v) {
    return rgba(v, v, v, 255);
  }

  var offsetPos = function(pos, off_x, off_y) {
    return {x: pos.x + off_x, y: pos.y + off_y};
  }

  var getPixel = function(target, pos) {
    var offset = (target.width * pos.y + pos.x) * 4;
    return rgba(
      target.data[offset    ], // R
      target.data[offset + 1], // G
      target.data[offset + 2], // B
      target.data[offset + 3]  // A
    );
  }

  var setPixel = function(target, pos, color) {
    var offset = (target.width * pos.y + pos.x) * 4;
    target.data[offset    ] = color.r; // R
    target.data[offset + 1] = color.g; // G
    target.data[offset + 2] = color.b; // B
    target.data[offset + 3] = color.a; // A
  }

  var grayScale = function(dst, src) {
    procPixelData(dst, src, function(d, s) {
      forEachPos(s, function(pos) {
        var p = getPixel(s, pos);
        var v = p.r * 0.3 + p.g * 0.59 + p.b * 0.11;
        setPixel(d, pos, gray(v));
      });
    });
  }

  var binary = function(dst, src) {
    procPixelData(dst, src, function(d, s) {
      forEachPos(s, function(pos) {
        var v = (getPixel(s, pos).r > 128) ? 255 : 0;
        setPixel(d, pos, gray(v));
      });
    });
  }

  // https://www.visgraf.impa.br/Courses/ip00/proj/Dithering1/floyd_steinberg_dithering.html
  var binaryDith = function(dst, src) {
    procPixelData(dst, src, function(d, s) {
      // copy
      forEachPos(d, function(pos) {
        setPixel(d, pos, getPixel(s, pos));
      });

      forEachPos(d, function(pos) {
        var p = getPixel(d, pos);
        var vOld = p.r;
        var vNew = (p.r > 128) ? 255 : 0;
        var e = vOld - vNew;

        var m = [
          [   0,    0, 7/16],
          [3/16, 5/16, 1/16]
        ];

        var pos2 = offsetPos(pos, 0, 0);
        setPixel(d, pos2, gray(vNew));
        pos2 = offsetPos(pos, 1, 0);
        setPixel(d, pos2, gray(getPixel(d, pos2).r + m[0][2] * e));
        pos2 = offsetPos(pos, -1, 1);
        setPixel(d, pos2, gray(getPixel(d, pos2).r + m[1][0] * e));
        pos2 = offsetPos(pos, 0, 1);
        setPixel(d, pos2, gray(getPixel(d, pos2).r + m[1][1] * e));
        pos2 = offsetPos(pos, 1, 1);
        setPixel(d, pos2, gray(getPixel(d, pos2).r + m[1][2] * e));
      });
    });
  }

  var vss = function(dst1, dst2, src) {
    if(dst1.getContext && dst2.getContext && src.getContext) {
      var width = src.width;
      var height = src.height;

      var ctxS = src.getContext('2d');
      var imgDataS = ctxS.getImageData(0, 0, width, height);
      var dataS = imgDataS.data;

      var dst = [dst1, dst2];
      var ctxD = [];
      var imgDataD = [];
      var dataD = [];

      for(var i = 0; i < dst.length; i++) {
        dst[i].width = width * 2;
        dst[i].height = height * 2;
        ctxD[i] = dst[i].getContext('2d');
        imgDataD[i] = ctxD[i].getImageData(0, 0, width * 2, height * 2);
        dataD[i] = imgDataD[i].data;
      }

      var c = [
        [ // black
          // SHARE 1   |  SHARE 2
          [[0, 1, 0, 1], [1, 0, 1, 0]],
          [[1, 0, 1, 0], [0, 1, 0, 1]],
          [[0, 0, 1, 1], [1, 1, 0, 0]],
          [[1, 1, 0, 0], [0, 0, 1, 1]],
          [[0, 1, 1, 0], [1, 0, 0, 1]],
          [[1, 0, 0, 1], [0, 1, 1, 0]],
        ],
        [ // white
          // SHARE 1   |  SHARE 2
          [[0, 1, 0, 1], [0, 1, 0, 1]],
          [[1, 0, 1, 0], [1, 0, 1, 0]],
          [[0, 0, 1, 1], [0, 0, 1, 1]],
          [[1, 1, 0, 0], [1, 1, 0, 0]],
          [[0, 1, 1, 0], [0, 1, 1, 0]],
          [[1, 0, 0, 1], [1, 0, 0, 1]],
        ]
      ];

      for(var i = 0; i < height; i++) { // height of src
        for(var j = 0; j < width; j++) { // height of width
          var wb = (dataS[(i*width + j) * 4] > 128) ? 1 : 0;

          var arrR = new Uint8Array(1);
          window.crypto.getRandomValues(arrR);
          var r = arrR[0] % 6; // random value : Cx の内どのテーブルを使用するか決める

          for(var dstIndex = 0; dstIndex < 2; dstIndex++) { // select dst canvas
            for(var cIndex = 0; cIndex < 4; cIndex++) { // pixel pos of Cx
              var val = c[wb][r][dstIndex][cIndex] * 255;

              var u = (cIndex < 2) ? 0 : 1; // sub-pixel pos of x-dir
              var v = cIndex - 2; // sub-pixex pos of y-dir

              dataD[dstIndex][((i*2+u)*width*2 + j*2+v) * 4] = val; // R
              dataD[dstIndex][((i*2+u)*width*2 + j*2+v) * 4 + 1] = val; // G
              dataD[dstIndex][((i*2+u)*width*2 + j*2+v) * 4 + 2] = val; // B
              dataD[dstIndex][((i*2+u)*width*2 + j*2+v) * 4 + 3] = (val == 0) ? 255 : 0 // A
            }
          }
        }
      }

      for(var i = 0; i < dst.length; i++)
        ctxD[i].putImageData(imgDataD[i], 0, 0);
    }
  }

  var updateGrayCanvas = function(src) {
    var e = document.getElementById('gray_canvas');
    grayScale(e, src);
    return e;
  }

  var updateBinaryCanvas = function(src) {
    var e = document.getElementById('binary_canvas');
    //binary(e, src);
    binaryDith(e, src);
    return e;
  }

  var updateShareCanvases = function(src) {
    var e1 = document.getElementById('share1_canvas');
    var e2 = document.getElementById('share2_canvas');
    vss(e1, e2, src);
  }

  // Update original canvas image
  var update = function(dataUrl) {
    var e = document.getElementById('org_canvas');

    if(e.getContext) {
      var ctx = e.getContext('2d');

      var img = new Image();
      img.onload = function() {
        e.width = img.width;
        e.height = img.height;
        ctx.drawImage(img, 0, 0);

        updateShareCanvases(
          updateBinaryCanvas(
            updateGrayCanvas(e)
          )
        );
      }

      img.src = dataUrl;
    }

    return e;
  };


  // Initialization of element ot input file name
  var initInputFileElem = function() {
    var e = document.getElementById("input_file");

    e.addEventListener("change", function(event) {
      var reader = new FileReader();
      reader.onload = function() {
        update(reader.result);
      };

      reader.readAsDataURL(event.target.files[0]);

    }, false);
  };


  // --- main ---
  initInputFileElem();

})();


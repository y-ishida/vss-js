(function() {
  "use strict";

  var updateGrayCanvas = function(src) {
    var e = document.getElementById('gray_canvas');
    vss.grayScale(e, src);
    return e;
  }

  var updateBinaryCanvas = function(src) {
    var e = document.getElementById('binary_canvas');
    //binary(e, src);
    vss.binaryDith(e, src);
    return e;
  }

  var updateShareCanvases = function(src) {
    var e1 = document.getElementById('share1_canvas');
    var e2 = document.getElementById('share2_canvas');
    vss.vss(e1, e2, src);
  }

  // main -------------------------

  var e = document.getElementById("input_file");

  e.addEventListener("change", function(event) {
    var reader = new FileReader();

    reader.onload = function() {
      var e = document.getElementById('org_canvas');
      if(e.getContext) {
        var ctx = e.getContext('2d');
        var img = new Image();
        img.onload = function() {
          e.width = img.width;
          e.height = img.height;
          ctx.drawImage(img, 0, 0);
          updateShareCanvases(updateBinaryCanvas(updateGrayCanvas(e)));
        };
        img.src = reader.result;
      };
    };

    reader.readAsDataURL(event.target.files[0]);
  }, false);
}())


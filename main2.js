(function() {
  "use strict";

  var updateGrayCanvas = function(src, id) {
    var e = document.getElementById(id);
    vss.grayScale(e, src);
    return e;
  };

  var updateBinaryCanvas = function(src, id) {
    var e = document.getElementById(id);
    vss.binaryDith(e, src);
    return e;
  };

  var updateShareCanvases = function(src, id1, id2, useId2AsRnd = false) {
    var e1 = document.getElementById(id1);
    var e2 = document.getElementById(id2);
    vss.vss(e1, e2, src, useId2AsRnd);
  };

  // main -------------------------

  var e = document.getElementById("input_file_a");
  e.addEventListener("change", function(event) {
    var reader = new FileReader();
    reader.onload = function() {
      var e = document.getElementById('org_canvas_a');
      var ctx = e.getContext('2d');
      var img = new Image();
      img.onload = function() {
        e.width = img.width;
        e.height = img.height;
        ctx.drawImage(img, 0, 0);
        updateShareCanvases(
          updateBinaryCanvas(
            updateGrayCanvas(
              e,
              'gray_canvas_a'
            ),
            'binary_canvas_a'
          ),
          'share2_canvas_a',
          'share2_canvas_b'
        );
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
  }, false);

  var e = document.getElementById("input_file_b");
  e.addEventListener("change", function(event) {
    var reader = new FileReader();
    reader.onload = function() {
      var e = document.getElementById('org_canvas_b');
      var ctx = e.getContext('2d');
      var img = new Image();
      img.onload = function() {
        e.width = img.width;
        e.height = img.height;
        ctx.drawImage(img, 0, 0);
        updateShareCanvases(
          updateBinaryCanvas(
            updateGrayCanvas(
              e,
              'gray_canvas_b'
            ),
            'binary_canvas_b'
          ),
          'share1_canvas_b',
          'share2_canvas_b',
          true
        );
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
  }, false);

  var e = document.getElementById("input_file_c");
  e.addEventListener("change", function(event) {
    var reader = new FileReader();
    reader.onload = function() {
      var e = document.getElementById('org_canvas_c');
      var ctx = e.getContext('2d');
      var img = new Image();
      img.onload = function() {
        e.width = img.width;
        e.height = img.height;
        ctx.drawImage(img, 0, 0);
        updateShareCanvases(
          updateBinaryCanvas(
            updateGrayCanvas(
              e,
              'gray_canvas_c'
            ),
            'binary_canvas_c'
          ),
          'share1_canvas_a',
          'share2_canvas_a',
          true
        );
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
  }, false);
}());

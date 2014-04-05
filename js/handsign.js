jQuery(function($){

  var MAX_COLUMNS     = 6;
  var MAX_ROWS        = 6;
  var MAX_CELLS       = MAX_COLUMNS * MAX_ROWS;

  var IMAGES = [
    "img/you.gif",
    "img/me.gif",
    "img/come.gif",
    "img/listen.gif",
    "img/watch.gif",
    "img/hurry.gif",
    "img/stop.gif",
    "img/freeze.gif",
    "img/cover.gif",
    "img/go.gif",
    "img/enemy.gif",
    "img/hostage.gif",
    "img/sniper.gif",
    "img/dog.gif",
    "img/leader.gif",
    "img/column.gif",
    "img/file.gif",
    "img/line.gif",
    "img/wedge.gif",
    "img/rally.gif",
    "img/pistol.gif",
    "img/rifle.gif",
    "img/shotgun.gif",
    "img/ammo.gif",
    "img/vehicle.gif",
    "img/understand.gif",
    "img/dontunder.gif",
    "img/down.gif",
    "img/breach.gif",
    "img/gas.gif",
    "img/door.gif",
    "img/window.gif",
    "img/enter.gif",
    "img/transparent.gif"
  ];

  var TEXTS = [
    "You",
    "Me",
    "Come",
    "Listen or I Hear",
    "Watch or I See",
    "Hurry Up",
    "Stop",
    "Freeze",
    "Cover This Area",
    "Go Here or Move Up",
    "Enemy",
    "Hostage",
    "Sniper",
    "Dog",
    "Cell Leader",
    "Column Formation",
    "File Formation",
    "Line Abreast Formation",
    "Wedge Formation",
    "Rally Point",
    "Pistol",
    "Rifle",
    "Shotgun",
    "Ammunition",
    "Vehicle",
    "I Understand",
    "I Don't Understand",
    "Crouch or Go Prone",
    "Breach(er)",
    "Gas",
    "Door",
    "Window",
    "Point of Entry",
    "(None)"
  ];

  var imageList;
  var nColumns;
  var nRows;

  function initImages() {
    imageList = [];
    for (var i = 0; i < IMAGES.length; i++) {
      imageList[i] = $("<img />").attr("src", IMAGES[i])[0];
    }
  }

  function initTable() {
    var $li = $("#head");
    var $txt = $("<div />");
      $txt.addClass("head-text");
    $li.append($txt);

    for (var i = 0; i < MAX_CELLS; i++) {
      var $li = $("<li />");
        $li.addClass("ui-state-default");
        $li.addClass("cell");
        var $img = $("<div />");
          $img.addClass("image");
          $img.attr("data-toggle", "modal");
          $img.attr("data-target", "#imageModal");
          $img.append("<img />");
        $li.append($img);
        var $txt = $("<div />");
          $txt.addClass("text");
        $li.append($txt);
        setCellImage($li, 0);
      $("#cells").append($li);
    }

    $(".head-text, .text").html('<input type="text" class="form-control">');
  }

  function setTableSize(ncol, nrow) {
    nColumns = ncol;
    nRows = nrow;

    var $tab = $("#table");
    var p = $tab.position();
    var x0 = p.left;
    var y0 = p.top;

    var $c = $("#cells li");
    var p = $c.position();
    var x = p.left - x0;
    var y = p.top - y0;
    var w = $c.outerWidth(true);
    var h = $c.outerHeight(true);

    $tab.width(x + w * ncol);
    $tab.height(y + h * nrow);

    var $h = $("#head");
    $h.width($tab.width() - ($h.outerWidth(true) - $h.innerWidth()));

    var n = ncol * nrow;
    var i = 0;
    $("#cells").children().each(function() {
      if (i < n) {
        $(this).show();
      } else {
        $(this).hide();
      }
      i++;
    });
  }

  function setCellImage($li, index) {
    $li.data("imageIndex", index);
    var $img = $li.children(".image");
    $img.children("img").attr("src", IMAGES[index]);
    $img.imgLiquid({ fill: false, verticalAlign: "bottom" });
  }

  function setCellImages(imageIndices) {
    var n = Math.min(imageIndices.length, nColumns * nRows);
    var i = 0;
    $("#cells").children().each(function() {
      setCellImage($(this), imageIndices[i]);
      return ++i < n;
    });
  }

  function drawFittedImage(context, image, x, y, width, height) {
    var sw = image.width;
    var sh = image.height;
    var dx, dy, dw, dh;
    if (width / sw > height / sh) {
      dy = 0.0;
      dh = height;
      dw = sw * height / sh;
      dx = (width - dw) * 0.5;  // center
    } else {
      dx = 0.0;
      dw = width;
      dh = sh * width / sw;
      dy = (height - dh) * 1.0;  // bottom
    }
    context.drawImage(image, x + dx, y + dy, dw, dh);
  }

  function drawFittedText(context, str, x, y, width, height) {
// DEBUG
// context.fillStyle = "rgb(192, 255, 255)";
// context.fillRect(x, y, width, height);
// console.log(str);
// DEBUG END
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "rgb(0, 0, 0)";
    for (var s = 28; s >= 8; s--) {
      context.font = s + "px Arial";
      var tm = context.measureText(str);
      var w = tm.width;
      if (s > 8 && w > width) {
        continue;
      }
      context.fillText(str, x + width / 2, y + height / 2, width);
      break;
    }
  }

  function generateImage() {
    var $tab = $("#table");
    var p = $tab.position();
    var x0 = p.left;
    var y0 = p.top;

    var cw = $tab.width();
    var ch = $tab.height();

    var cv = $("canvas")[0];
    var cx = cv.getContext("2d");

    cv.width = cw;
    cv.height = ch;

    // Clear the background.
    cx.fillStyle = "rgb(255, 255, 255)";
    cx.fillRect(0, 0, cw, ch);

    // Draw header.
    var $t = $("#head");
    var p = $t.position();
    var x = p.left - x0;
    var y = p.top - y0;
    var w = $t.innerWidth();
    var h = $t.innerHeight();
    var str = $t.children(".head-text").children("input").val();
    drawFittedText(cx, str, x, y, w, h);

    // Draw cells.
    var n = nColumns * nRows;
    var i = 0;
    $("#cells").children().each(function() {
      var $this = $(this);
      var $c = $this.children(".image");
      var p = $c.position();
      var x = p.left - x0;
      var y = p.top - y0;
      var w = $c.innerWidth();
      var h = $c.innerHeight();
      var img = imageList[$this.data("imageIndex")];
      drawFittedImage(cx, img, x, y, w, h);
      var $t = $this.children(".text");
      var p = $t.position();
      var x = p.left - x0;
      var y = p.top - y0;
      var w = $t.innerWidth();
      var h = $t.innerHeight();
      var str = $t.children("input").val();
      drawFittedText(cx, str, x, y, w, h);
      return ++i < n;
    });

    // Show the result.
    $("#imageBox img").attr("src", cv.toDataURL()).show();
  }

  function initImageModal() {
    var $body = $("#imageModal .modal-body");
    for (var i = 0; i < IMAGES.length; i++) {
      var $btn = $("<div />");
          $btn.addClass("image-modal-button");
          $btn.data("imageIndex", i);
          var $img = $("<img />");
            $img.attr("src", IMAGES[i]);
          $btn.append($img);
      $body.append($btn);
      $btn.imgLiquid({ fill: false });
    }
    $("#imageModal .image-modal-button").click(function(e) {
      setCellImage($("#imageModal").data("caller"),
                   $(e.target).data("imageIndex"));
      $("#imageModal").modal("hide");
    });
  }

  function initResizeModal() {
    var $body = $("#resizeModal .modal-body");
    for (var i = 1; i <= MAX_ROWS; i++) {
      for (var j = 1; j <= MAX_COLUMNS; j++) {
        var $btn = $("<btn />");
          $btn.attr("type", "button");
          $btn.addClass("btn btn-default resize-modal-button");
          $btn.html(i + " &times; " + j);
          $btn.data("nrow", i);
          $btn.data("ncol", j);
        $body.append($btn);
      }
    }
    $("#resizeModal .resize-modal-button").click(function(e) {
      var $btn = $(e.target);
      setTableSize($btn.data("ncol"), $btn.data("nrow"));
      $("#resizeModal").modal("hide");
    });
  }

  initImages();
  initImageModal();
  initResizeModal();
  initTable();
  setTableSize(3, 4);
  setCellImages([6, 25, 23, 20, 21, 26, 8, 32, 28, 27, 14, 1]);
  $("#cells").sortable();
  $("#fire").click(generateImage);

  $("#imageModal").on("show.bs.modal", function(e) {
    $("#imageModal").data("caller", $(e.relatedTarget).parent());
  });
});

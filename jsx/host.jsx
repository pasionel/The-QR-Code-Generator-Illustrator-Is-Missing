var QRInserter = QRInserter || {};

QRInserter.insert = function (matrixText, moduleSize, style) {
  if (app.documents.length === 0) {
    return "Open an Illustrator document first.";
  }

  var doc = app.activeDocument;
  var rows = String(matrixText).split("\n");
  var count = rows.length;
  var size = Number(moduleSize) || 4;
  var total = count * size;
  var mode = String(style || "squares");
  var artboard = doc.artboards[doc.artboards.getActiveArtboardIndex()].artboardRect;
  var left = (artboard[0] + artboard[2] - total) / 2;
  var top = (artboard[1] + artboard[3] + total) / 2;
  var group = doc.groupItems.add();
  group.name = "QR Code";

  function makeColor(gray) {
    var color = new GrayColor();
    color.gray = gray;
    return color;
  }

  function addRect(parent, x, y, width, height) {
    var path = parent.pathItems.add();
    path.setEntirePath([
      [x, y],
      [x + width, y],
      [x + width, y - height],
      [x, y - height]
    ]);
    path.closed = true;
    path.stroked = false;
    path.filled = true;
    path.fillColor = black;
    return path;
  }

  function isFinderModule(x, y) {
    var inTop = y < 7;
    var inLeft = x < 7;
    var inRight = x >= count - 7;
    var inBottom = y >= count - 7;
    return (inTop && inLeft) || (inTop && inRight) || (inBottom && inLeft);
  }

  function addCircle(centerX, centerY, diameter, filled, strokeWidth) {
    var circle = doc.pathItems.ellipse(
      centerY + diameter / 2,
      centerX - diameter / 2,
      diameter,
      diameter
    );
    circle.filled = filled;
    circle.stroked = !filled;
    if (filled) {
      circle.fillColor = black;
    } else {
      circle.strokeColor = black;
      circle.strokeWidth = strokeWidth;
    }
    circle.move(group, ElementPlacement.PLACEATEND);
    return circle;
  }

  function addFinderTarget(moduleX, moduleY) {
    var centerX = left + (moduleX + 3.5) * size;
    var centerY = top - (moduleY + 3.5) * size;

    addCircle(centerX, centerY, size * 5.1, false, size * 0.9);
    addCircle(centerX, centerY, size * 2.5, false, size * 0.8);
    addCircle(centerX, centerY, size * 1.64, true, 0);
  }

  var black = makeColor(0);
  if (mode === "circles") {
    for (var cy = 0; cy < count; cy += 1) {
      for (var cx = 0; cx < rows[cy].length; cx += 1) {
        if (rows[cy].charAt(cx) === "1" && !isFinderModule(cx, cy)) {
          addCircle(left + (cx + 0.5) * size, top - (cy + 0.5) * size, size * 0.84, true, 0);
        }
      }
    }

    addFinderTarget(0, 0);
    addFinderTarget(count - 7, 0);
    addFinderTarget(0, count - 7);

    doc.selection = null;
    group.selected = true;
    app.redraw();
    return "The QR code was inserted as circle vector artwork.";
  }

  var compound = doc.compoundPathItems.add();
  compound.name = "QR Code Modules";
  compound.move(group, ElementPlacement.PLACEATEND);

  for (var y = 0; y < count; y += 1) {
    var x = 0;
    while (x < rows[y].length) {
      if (rows[y].charAt(x) !== "1") {
        x += 1;
        continue;
      }

      var start = x;
      while (x < rows[y].length && rows[y].charAt(x) === "1") {
        x += 1;
      }
      addRect(compound, left + start * size, top - y * size, (x - start) * size, size);
    }
  }

  doc.selection = null;
  group.selected = true;
  app.redraw();
  return "The QR code was inserted as vector artwork.";
};

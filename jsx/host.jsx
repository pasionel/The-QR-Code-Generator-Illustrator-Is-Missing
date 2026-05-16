var QRInserter = QRInserter || {};

QRInserter.insert = function (matrixText, moduleSize) {
  if (app.documents.length === 0) {
    return "Open an Illustrator document first.";
  }

  var doc = app.activeDocument;
  var rows = String(matrixText).split("\n");
  var count = rows.length;
  var size = Number(moduleSize) || 4;
  var total = count * size;
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

  var black = makeColor(0);
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

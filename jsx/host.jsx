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

  var black = makeColor(0);
  for (var y = 0; y < count; y += 1) {
    for (var x = 0; x < rows[y].length; x += 1) {
      if (rows[y].charAt(x) === "1") {
        var rect = doc.pathItems.rectangle(
          top - y * size,
          left + x * size,
          size,
          size
        );
        rect.stroked = false;
        rect.filled = true;
        rect.fillColor = black;
        rect.move(group, ElementPlacement.PLACEATEND);
      }
    }
  }

  doc.selection = null;
  group.selected = true;
  app.redraw();
  return "The QR code was inserted as vector artwork.";
};

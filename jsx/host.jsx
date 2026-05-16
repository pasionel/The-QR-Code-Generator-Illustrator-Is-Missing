var QRInserter = QRInserter || {};

QRInserter.getRulerUnit = function () {
  try {
    if (app.documents.length > 0) {
      var units = app.activeDocument.rulerUnits;
      if (units === RulerUnits.Pixels) return "px";
      if (units === RulerUnits.Millimeters) return "mm";
      if (units === RulerUnits.Centimeters) return "cm";
      if (units === RulerUnits.Inches) return "in";
      if (units === RulerUnits.Picas) return "pc";
      if (units === RulerUnits.Points) return "pt";
    }
  } catch (error) {}
  return "pt";
};

QRInserter.insert = function (matrixText, moduleSize, useActiveFill) {
  return QRInserter.insertIntoDocument(matrixText, moduleSize, useActiveFill, false);
};

QRInserter.insertNew = function (matrixText, moduleSize, useActiveFill) {
  return QRInserter.insertIntoDocument(matrixText, moduleSize, useActiveFill, true);
};

QRInserter.insertIntoDocument = function (matrixText, moduleSize, useActiveFill, createNewDocument) {
  var rows = String(matrixText).split("\n");
  var count = rows.length;
  var size = Number(moduleSize) || 4;
  var total = count * size;
  var shouldUseActiveFill = useActiveFill === true || String(useActiveFill) === "true";

  if (createNewDocument) {
    app.documents.add(DocumentColorSpace.RGB, total, total);
  } else if (app.documents.length === 0) {
    return "Open an Illustrator document first.";
  }

  var doc = app.activeDocument;
  var artboard = doc.artboards[doc.artboards.getActiveArtboardIndex()].artboardRect;
  var left = (artboard[0] + artboard[2] - total) / 2;
  var top = (artboard[1] + artboard[3] + total) / 2;
  var group = doc.groupItems.add();
  group.name = "QR Code";

  function makeColor(gray) {
    if (doc.documentColorSpace === DocumentColorSpace.CMYK) {
      var cmyk = new CMYKColor();
      cmyk.cyan = 0;
      cmyk.magenta = 0;
      cmyk.yellow = 0;
      cmyk.black = gray === 0 ? 100 : 0;
      return cmyk;
    }

    var rgb = new RGBColor();
    rgb.red = gray;
    rgb.green = gray;
    rgb.blue = gray;
    return rgb;
  }

  function getActiveFillColor() {
    try {
      var color = app.defaultFillColor;
      if (color && color.typename !== "NoColor") {
        return color;
      }
    } catch (error) {}
    return makeColor(0);
  }

  function addPath(parent, points) {
    var path = parent.pathItems.add();
    path.setEntirePath(points);
    path.closed = true;
    path.stroked = false;
    path.filled = true;
    path.fillColor = black;
    return path;
  }

  function isDark(x, y) {
    return y >= 0 && y < count && x >= 0 && x < rows[y].length && rows[y].charAt(x) === "1";
  }

  function edgeKey(x, y) {
    return x + "," + y;
  }

  function addEdge(edges, x1, y1, x2, y2, dir) {
    var key = edgeKey(x1, y1);
    if (!edges[key]) {
      edges[key] = [];
    }
    edges[key].push({
      x1: x1,
      y1: y1,
      x2: x2,
      y2: y2,
      dir: dir,
      used: false
    });
  }

  function collectBoundaryEdges() {
    var edges = {};
    for (var y = 0; y < count; y += 1) {
      for (var x = 0; x < rows[y].length; x += 1) {
        if (!isDark(x, y)) {
          continue;
        }

        if (!isDark(x, y - 1)) addEdge(edges, x, y, x + 1, y, 0);
        if (!isDark(x + 1, y)) addEdge(edges, x + 1, y, x + 1, y + 1, 1);
        if (!isDark(x, y + 1)) addEdge(edges, x + 1, y + 1, x, y + 1, 2);
        if (!isDark(x - 1, y)) addEdge(edges, x, y + 1, x, y, 3);
      }
    }
    return edges;
  }

  function nextEdge(edges, x, y, previousDirection) {
    var candidates = edges[edgeKey(x, y)] || [];
    var order = [
      (previousDirection + 1) % 4,
      previousDirection,
      (previousDirection + 3) % 4,
      (previousDirection + 2) % 4
    ];

    for (var o = 0; o < order.length; o += 1) {
      for (var i = 0; i < candidates.length; i += 1) {
        if (!candidates[i].used && candidates[i].dir === order[o]) {
          return candidates[i];
        }
      }
    }

    for (var j = 0; j < candidates.length; j += 1) {
      if (!candidates[j].used) {
        return candidates[j];
      }
    }
    return null;
  }

  function toDocumentPoint(x, y) {
    return [left + x * size, top - y * size];
  }

  function traceBoundaryLoops() {
    var edges = collectBoundaryEdges();
    var loops = [];

    for (var key in edges) {
      if (!edges.hasOwnProperty(key)) {
        continue;
      }

      for (var i = 0; i < edges[key].length; i += 1) {
        var edge = edges[key][i];
        if (edge.used) {
          continue;
        }

        var startX = edge.x1;
        var startY = edge.y1;
        var current = edge;
        var loop = [];

        while (current) {
          current.used = true;
          loop.push(toDocumentPoint(current.x1, current.y1));

          var endX = current.x2;
          var endY = current.y2;
          if (endX === startX && endY === startY) {
            break;
          }
          current = nextEdge(edges, endX, endY, current.dir);
        }

        if (loop.length > 2) {
          loops.push(loop);
        }
      }
    }
    return loops;
  }

  var black = shouldUseActiveFill ? getActiveFillColor() : makeColor(0);
  var compound = doc.compoundPathItems.add();
  compound.name = "QR Code Modules";
  compound.move(group, ElementPlacement.PLACEATEND);

  var loops = traceBoundaryLoops();
  for (var index = 0; index < loops.length; index += 1) {
    addPath(compound, loops[index]);
  }

  if (compound.pathItems.length > 0) {
    for (var p = 0; p < compound.pathItems.length; p += 1) {
      compound.pathItems[p].filled = true;
      compound.pathItems[p].fillColor = black;
      compound.pathItems[p].stroked = false;
    }
  }

  doc.selection = null;
  group.selected = true;
  app.redraw();
  return "The QR code was inserted as vector artwork.";
};

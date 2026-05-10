(function () {
  "use strict";

  var cs = new CSInterface();
  var textInput = document.getElementById("qrText");
  var insertButton = document.getElementById("insertButton");
  var status = document.getElementById("status");
  var preview = document.getElementById("preview");
  var lastMatrix = null;
  var MODULE_SIZE_POINTS = 4;

  function escapeForExtendScript(value) {
    return String(value)
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "\\'")
      .replace(/\r/g, "\\r")
      .replace(/\n/g, "\\n");
  }

  function matrixToRows(matrix) {
    return matrix.map(function (row) {
      return row.map(function (cell) { return cell ? "1" : "0"; }).join("");
    }).join("\n");
  }

  function drawPreview(matrix) {
    var ctx = preview.getContext("2d");
    var count = matrix.length;
    var scale = Math.floor(preview.width / count);
    var offset = Math.floor((preview.width - count * scale) / 2);

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, preview.width, preview.height);
    ctx.fillStyle = "#111";

    matrix.forEach(function (row, y) {
      row.forEach(function (cell, x) {
        if (cell) {
          ctx.fillRect(offset + x * scale, offset + y * scale, scale, scale);
        }
      });
    });
  }

  function updatePreview() {
    var text = textInput.value.trim();
    insertButton.disabled = !text;

    if (!text) {
      lastMatrix = null;
      status.textContent = "";
      drawPreview([[false]]);
      return;
    }

    try {
      lastMatrix = createMatrix(text);
      drawPreview(lastMatrix);
      status.textContent = lastMatrix.length + " x " + lastMatrix.length + " moduler";
    } catch (error) {
      lastMatrix = null;
      insertButton.disabled = true;
      status.textContent = error.message;
    }
  }

  function createMatrix(text) {
    var qr = qrcode(0, "M");
    qr.addData(text);
    qr.make();

    var matrix = [];
    for (var row = 0; row < qr.getModuleCount(); row += 1) {
      var matrixRow = [];
      for (var col = 0; col < qr.getModuleCount(); col += 1) {
        matrixRow.push(qr.isDark(row, col));
      }
      matrix.push(matrixRow);
    }
    return matrix;
  }

  function insertQRCode() {
    var text = textInput.value.trim();
    if (!text || !lastMatrix) {
      updatePreview();
      return;
    }

    var rows = escapeForExtendScript(matrixToRows(lastMatrix));
    var script = "QRInserter.insert('" + rows + "', " + MODULE_SIZE_POINTS + ")";

    insertButton.disabled = true;
    status.textContent = "Indsætter...";
    cs.evalScript(script, function (result) {
      insertButton.disabled = false;
      status.textContent = result || "QR-koden er indsat.";
    });
  }

  textInput.addEventListener("input", updatePreview);
  insertButton.addEventListener("click", insertQRCode);

  updatePreview();
}());

(function () {
  "use strict";

  var cs = new CSInterface();
  var textTab = document.getElementById("textTab");
  var vcardTab = document.getElementById("vcardTab");
  var textPanel = document.getElementById("textPanel");
  var vcardPanel = document.getElementById("vcardPanel");
  var textInput = document.getElementById("qrText");
  var insertButton = document.getElementById("insertButton");
  var status = document.getElementById("status");
  var preview = document.getElementById("preview");
  var vcardInputs = Array.prototype.slice.call(document.querySelectorAll("#vcardPanel input"));
  var lastMatrix = null;
  var activeMode = "text";
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

  function escapeVCard(value) {
    return String(value || "")
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,");
  }

  function getField(id) {
    return document.getElementById(id).value.trim();
  }

  function buildVCard() {
    var firstName = getField("firstName");
    var lastName = getField("lastName");
    var fullName = [firstName, lastName].filter(Boolean).join(" ");
    var organization = getField("organization");
    var title = getField("jobTitle");
    var phone = getField("phone");
    var email = getField("email");
    var website = getField("website");
    var street = getField("street");
    var city = getField("city");
    var region = getField("region");
    var postalCode = getField("postalCode");
    var country = getField("country");
    var lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "N:" + escapeVCard(lastName) + ";" + escapeVCard(firstName) + ";;;"
    ];

    if (fullName) lines.push("FN:" + escapeVCard(fullName));
    if (organization) lines.push("ORG:" + escapeVCard(organization));
    if (title) lines.push("TITLE:" + escapeVCard(title));
    if (phone) lines.push("TEL;TYPE=CELL:" + escapeVCard(phone));
    if (email) lines.push("EMAIL;TYPE=INTERNET:" + escapeVCard(email));
    if (website) lines.push("URL:" + escapeVCard(website));
    if (street || city || region || postalCode || country) {
      lines.push("ADR;TYPE=WORK:;;" + escapeVCard(street) + ";" + escapeVCard(city) + ";" + escapeVCard(region) + ";" + escapeVCard(postalCode) + ";" + escapeVCard(country));
    }
    lines.push("END:VCARD");
    return lines.join("\n");
  }

  function getQRText() {
    if (activeMode === "vcard") {
      var hasValue = vcardInputs.some(function (input) {
        return input.value.trim();
      });
      return hasValue ? buildVCard() : "";
    }
    return textInput.value.trim();
  }

  function updatePreview() {
    var text = getQRText();
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
      status.textContent = lastMatrix.length + " x " + lastMatrix.length + " modules";
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
    var text = getQRText();
    if (!text || !lastMatrix) {
      updatePreview();
      return;
    }

    var rows = escapeForExtendScript(matrixToRows(lastMatrix));
    var script = "QRInserter.insert('" + rows + "', " + MODULE_SIZE_POINTS + ")";

    insertButton.disabled = true;
    status.textContent = "Inserting...";
    cs.evalScript(script, function (result) {
      insertButton.disabled = false;
      status.textContent = result || "The QR code was inserted.";
    });
  }

  function activateMode(mode) {
    activeMode = mode;
    var isVCard = mode === "vcard";
    textTab.classList.toggle("active", !isVCard);
    vcardTab.classList.toggle("active", isVCard);
    textPanel.classList.toggle("active", !isVCard);
    vcardPanel.classList.toggle("active", isVCard);
    textTab.setAttribute("aria-selected", String(!isVCard));
    vcardTab.setAttribute("aria-selected", String(isVCard));
    updatePreview();
  }

  textTab.addEventListener("click", function () { activateMode("text"); });
  vcardTab.addEventListener("click", function () { activateMode("vcard"); });
  textInput.addEventListener("input", updatePreview);
  vcardInputs.forEach(function (input) {
    input.addEventListener("input", updatePreview);
  });
  insertButton.addEventListener("click", insertQRCode);

  updatePreview();
}());

/* Minimal CSInterface bridge for CEP panels. */
function CSInterface() {}

CSInterface.prototype.evalScript = function (script, callback) {
  if (window.__adobe_cep__ && window.__adobe_cep__.evalScript) {
    window.__adobe_cep__.evalScript(script, callback);
  } else if (callback) {
    callback("CEP er ikke aktiv. Åbn panelet inde fra Illustrator.");
  }
};

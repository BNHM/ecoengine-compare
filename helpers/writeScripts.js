module.exports = function setScript(options) {

  return output = [
    "<script>",
    "require([",
    options.data.pageRequire.map(function(req) {
      return "\"" + req + "\"";
    }).join(","),
    "],function(",
    options.data.pageRequire.map(function(req) {
      var parts = req.split("-");

      if (parts.length < 2) {
        return req;
      } else {
        //
        // Change dashed names to camelCase
        //
        return parts.map(function(part, i) {
          if (i > 0) {
            return part.substring(0,1).toUpperCase() + part.substring(1);
          } else {
            return part;
          }
        }).join("");
      }

    }).join(","),
    ") {",
    options.data.pageScripts.join("\n"),
    "});",
    "</script>"
  ].join("\n");

};

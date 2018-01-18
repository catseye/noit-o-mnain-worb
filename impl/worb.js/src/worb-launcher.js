function launch(prefix, container, config) {
  if (typeof container === 'string') {
    container = document.getElementById(container);
  }
  config = config || {};
  var deps = [
    "yoob/controller.js",
    "yoob/playfield.js",
    "yoob/playfield-canvas-view.js",
    "yoob/preset-manager.js",
    "yoob/source-manager.js",
    "worb.js"
  ];
  var loaded = 0;
  var onload = function() {
    if (++loaded < deps.length) return;
    //document.getElementById('installation').innerHTML =
    //  '<div id="control_panel"></div>' +
    //  '<span id="load_indicator">load indicator</span>' +
    //  '<div>example source: <select id="select_source"></select></div>' +
    //  '<div id="animation_container"><canvas id="canvas" width="400" height="400"></canvas></div>' +
    //  '<textarea id="editor" rows="25" cols="40"></textarea>';

    var loadIndicator = document.getElementById('load_indicator');
    var controlPanel = document.getElementById('control_panel');
    var display = document.getElementById('canvas_viewport');

    var v = new yoob.PlayfieldCanvasView().init({
        canvas: document.getElementById('canvas')
    });
    v.setCellDimensions(16, 16);

    var controller = (new WorbController()).init({
        panelContainer: controlPanel,
        view: v
    });

    var loadLevel = 0;
    controller.onstep = function(underLoad) {
        if (underLoad) loadLevel += 60;
        loadLevel -= 10;
        if (loadLevel < 0) loadLevel = 0;
        if (loadLevel > 255) loadLevel = 255;
        var l = 255 - loadLevel;
        loadIndicator.style.background = "rgba(255, " + l + "," + l + ",1.0)";
    };

    var sourceManager = (new yoob.SourceManager()).init({
        panelContainer: controlPanel,
        editor: document.getElementById('editor'),
        hideDuringEdit: [display],
        disableDuringEdit: [controller.panel],
        storageKey: 'worb.js',
        onDone: function() {
            controller.setResetState(this.getEditorText());
            controller.clickReset();
        }
    });

    var presetManager = (new yoob.PresetManager()).init({
      selectElem: document.getElementById('select_source'),
    });
    function makeCallback(sourceText) {
      return function(id) {
        sourceManager.loadSource(sourceText);
      }
    }
    for (var i = 0; i < examplePrograms.length; i++) {
      presetManager.add(examplePrograms[i][0], makeCallback(examplePrograms[i][1]));
    }
    presetManager.select(examplePrograms[0][0]);
  };
  for (var i = 0; i < deps.length; i++) {
    var elem = document.createElement('script');
    elem.src = prefix + deps[i];
    elem.onload = onload;
    document.body.appendChild(elem);
  }
}

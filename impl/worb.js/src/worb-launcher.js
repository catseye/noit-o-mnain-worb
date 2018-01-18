function launch(prefix, container, config) {
  if (typeof container === 'string') {
    container = document.getElementById(container);
  }
  config = config || {};
  var deps = [
    "yoob/element-factory.js",
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

    var controlPanel = yoob.makeDiv(container);
    controlPanel.id = 'control_panel';
    var subPanel = yoob.makeDiv(container);
    var selectSource = yoob.makeSelect(subPanel, 'configuration:', []);
    var loadIndicator = yoob.makeSpan(subPanel, "load indicator");
    loadIndicator.id = 'load_indicator';
    var canvasViewport = yoob.makeDiv(container);
    canvasViewport.id = 'canvas_viewport';
    var canvas = yoob.makeCanvas(canvasViewport, 400, 400);
    var editor = yoob.makeTextArea(container, 40, 25);

    var v = new yoob.PlayfieldCanvasView().init({
        canvas: canvas
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
        editor: editor,
        hideDuringEdit: [canvasViewport],
        disableDuringEdit: [controller.panel],
        storageKey: 'worb.js',
        onDone: function() {
            controller.setResetState(this.getEditorText());
            controller.clickReset();
        }
    });

    var presetManager = (new yoob.PresetManager()).init({
      selectElem: selectSource,
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

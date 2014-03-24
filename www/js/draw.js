var clientId = window.clientId = generateId();

// The faster the user moves their mouse the larger the circle will be
// We dont want it to be larger/smaller than this
tool.maxDistance = 2;
tool.maxDistance = 80;

// Returns an object specifying a semi-random color
function randomColor() {
    return {
        hue: Math.random() * 360,
        saturation: 0.8,
        brightness: 0.8,
        alpha: 0.5
    };
}

// An object to keep track of the user's path
var paths = [];
var current_path = null;
var pathdoc = null;

function onMouseDown(event) {
    // Create the new path
    var color = randomColor();
    current_path = new Path();
    pathdoc = {
        by: clientId,
        start: event.point,
        color: color,
        route: []
    };
    startPath(current_path, event.point, color);
}

function onMouseDrag(event) {
    var step        = event.delta / 2;
    step.angle     += 90;
    var top         = event.middlePoint + step;
    var bottom      = event.middlePoint - step;
    continuePath(current_path, top, bottom);
    pathdoc.route.push([top, bottom]);
}

function onMouseUp(event) {
    endPath(current_path, event.point);
    current_path.hoodie_id = generateId();
    pathdoc.end = event.point;
    pathdoc.id = current_path.hoodie_id;
    //hoodie.store.add('path', pathdoc);
    window.onPathEnd(pathdoc);
    paths.push(current_path);
    pathdoc = null;
    current_path = null;
}

function startPath(path, point, color) {
    path.fillColor = color;
    path.add(point);
}

function continuePath(path, top, bottom) {
    path.add(top);
    path.insert(0, bottom);
}

function endPath(path, point) {
    path.add(point);
    path.closed = true;
    path.smooth();
}


window.drawPath = function drawPath(doc) {
    var p = new Path();
    p.by = doc.by;
    startPath(p, doc.start, doc.color);
    for (var i = 0; i < doc.route.length; i++) {
        continuePath(p, doc.route[i][0], doc.route[i][1]);
    }
    endPath(p, doc.end);
    p.hoodie_id = doc.id;
    paths.push(p);
    view.draw();
};

window.clearPath = function clearPath(doc) {
    var newpaths = [];
    for (var i = 0; i < paths.length; i++) {
        if (doc.id === paths[i].hoodie_id) {
            paths[i].remove();
        }
        else {
            newpaths.push(paths[i]);
        }
    }
    paths = newpaths;
    view.draw();
};

function clearLocal() {
    for (var i = 0; i < paths.length; i++) {
        paths[i].remove();
    }
    paths = [];
    view.draw();
}

hoodie.account.on('signin', function () {
    hoodie.store.findAll('path').done(function (docs) {
        docs.forEach(drawPath);
        view.draw();
    });
});

hoodie.account.on('signin', clearLocal);
hoodie.account.on('signout', clearLocal);



function generateId() {
    var chars, i, radix;

    // uuids consist of numbers and lowercase letters only.
    // We stick to lowercase letters to prevent confusion
    // and to prevent issues with CouchDB, e.g. database
    // names do wonly allow for lowercase letters.
    chars = '0123456789abcdefghijklmnopqrstuvwxyz'.split('');
    radix = chars.length;


    function generateId(length) {
      var id = '';

      // default uuid length to 7
      if (length === undefined) {
        length = 7;
      }

      for (i = 0; i < length; i++) {
        var rand = Math.random() * radix;
        var char = chars[Math.floor(rand)];
        id += String(char).charAt(0);
      }

      return id;
    }

    return generateId();
  };



















































/*
// TODO: store.add('path', ...
function onPathEnd(path) {
    hoodie.store.add('path', path);
}

hoodie.store.findAll('path').done(function (docs) {
    docs.forEach(drawPath);
    view.draw();
});

hoodie.store.on('add:path', function (doc) {
    if (doc.by !== currentArtist) {
        drawPath(doc);
    }
    view.draw();
});

hoodie.store.on('remove:path', function (doc) {
    clearPath(doc);
});


*/

window.view = view;

demo();

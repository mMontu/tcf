WIDTH_SPACE = 100;
HEIGHT_SPACE = 30;

function _TCF() {

    LEFT_MARGIN = 10;
    RIGHT_MARGIN = 10;

    this.nodes = new Array();
    this.connections = new Array();
    this.title;
    this.font_size = 10;

    this.addNode = function(name) {

        if(this.nodes.indexOf(name) >= 0)
            return;

        node = {
            "name"  : name,
            "x"     : 0,
            "y"     : 0,
            "color" : colors[this.nodes.length] 
        }

        this.nodes.push(node);
    }

    this.findNode = function(name) {
        for(var i = 0; i < this.nodes.length; i++) {
            if(this.nodes[i].name == name) {
                return this.nodes[i];
            }
        }

        return "";
    }

    this.addConnection = function(from, to, text) {

        var connection = {
            "from":     this.findNode(from),
            "to":       this.findNode(to),
            "group":    "",
            "text":     text,
            "color":    this.findNode(from).color,
            "type":     "arrow"
        }

        this.connections.push(connection);

    }

    this.addBox = function(from, to, text) {
        var connection = {
            "from":     this.findNode(from),
            "to":       this.findNode(to),
            "group":    "",
            "text":     text,
            "color":    this.findNode(from).color,
            "type":     "box"
        }

        this.connections.push(connection);
    }

    this.getNodeMaxDistance = function(a, b) {
        ret = 10 * this.font_size;

        for(var i = 0; i < this.connections.length; i++) {
            c = this.connections[i];

            if((c.from.name == a.name && c.to.name == b.name) || (c.from.name == b.name && c.to.name == a.name)) {
                t = c.text;
                t = t.split("\\n");

                // Check what is the longest sentence
                for(var j = 0; j < t.length; j++) {
                    /*
                    if(t[j].length > ret) {
                        ret = t[j].length;
                    }
                    */

                    if(ret < measureText(t[j], this.font_size, null).width) {
                        ret = measureText(t[j], this.font_size, null).width;
                    }
                }
            }
        }

        ret += ret * 0.2;
        return ret;
    }

    this.getCanvasWidth = function() {
        ret = 0;

        for(var i = 0; i < this.nodes.length-1; i++) {
            ret += this.getNodeMaxDistance(this.nodes[i], this.nodes[i+1]);
        }

        ret = this.nodes[this.nodes.length-1].x;

        return ret + LEFT_MARGIN + RIGHT_MARGIN;
    }

    this.getCanvasHeight = function() {

        ret = 1;

        for(var i = 0; i < this.connections.length; i++) {
            c = this.connections[i];
            t = c.text;
            ret += t.split("\\n").length * this.font_size;

            switch(c.type) {
                case "box":
                    ret += 30;
                break;

                case "arrow":
                    ret += 20;
                break;
            }
        }

        return ret + 50;

    }

    // Call me after all nodes and connections have been added!
    this.doMagic = function() {

        this.nodes[0].x = LEFT_MARGIN;

        console.log("this.nodes = " + this.nodes.length);

        for(var i = 0; i < this.nodes.length-1; i++) {
            d = this.getNodeMaxDistance(this.nodes[i], this.nodes[i+1]);
            this.nodes[i+1].x = this.nodes[i].x + d + LEFT_MARGIN;
        }
    }
}

var TCF = new _TCF();

function draw() {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    canvas_width = 0;

    TCF.doMagic();
    canvas.width = TCF.getCanvasWidth();
    canvas.height = TCF.getCanvasHeight();


    var extra = 0;
    for(var i = 0; i < TCF.connections.length; i++) {
        c = TCF.connections[i];

        if(c.text.split("\\n").length > 0)
            extra += 15;
    }



    // Draw the vertical lines
    for(var i = 0; i < TCF.nodes.length; i++) {
        x = TCF.nodes[i].x;
        y = (canvas.height - 20) + extra+100;

        ctx.beginPath();
        ctx.fillStyle = "#000000";
        ctx.font = TCF.font_size+"px Arial";
        ctx.fillText(TCF.nodes[i].name, x, 10);

        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.fillStyle = "#f5f5f5";
        ctx.strokeStyle = "#aaaaaa";
        ctx.moveTo(x, 15);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.closePath();
    }

    var counter = 0;
    y = 20; // After headers

    for(var i = 0; i < TCF.connections.length; i++) {
        c = TCF.connections[i];

        //y += c.text.split("\\n").length * TCF.font_size; // Text space
        if(c.text.split("\\n").length > 0)
            y+= 15;

        x0 = c.from.x;
        x1 = c.to.x;

        switch(c.type) {
            case "arrow": {
                ctx.beginPath();

                    ctx.lineWidth = 2;
                    ctx.strokeStyle = "#000000";
                    counter += 1;
                    ctx.moveTo(x0, y);
                    ctx.lineTo(x1, y);
                    ctx.stroke();

                    // Draw the arrow at the line
                    if(x0 > x1) { // From right to left
                        ctx.moveTo(x1, y);
                        ctx.lineTo(x1+8, y-3);
                        ctx.moveTo(x1, y);
                        ctx.lineTo(x1+8, y+3);
                    } else {
                        ctx.moveTo(x1, y);
                        ctx.lineTo(x1-8, y-3);
                        ctx.moveTo(x1, y);
                        ctx.lineTo(x1-8, y+3);
                    }
                    ctx.stroke();

                ctx.closePath();

                ctx.beginPath();

                    x  = x0 > x1 ? x1 : x0;
                    x += 12;
                    text = counter + ". " + c.text;
                    ctx.font = TCF.font_size+"px Arial";
                    ctx.fillStyle = c.color.stroke;
                    ctx.fillText(text, x, y + 10);
                    ctx.stroke();

                    y += 20; // Arrow space

                ctx.closePath();

            }
            break;

            case "box": {
                x = x0 > x1 ? x1 : x0;
                x += 10;
                y -= 15;
                width = Math.abs(x0-x1); //x0 > x1 ? x0 - x1 : x1 - x0;
                width -= 20;

                height = c.text.split("\\n").length * TCF.font_size + 10;

                ctx.beginPath();

                    ctx.fillStyle = c.color.fill;
                    ctx.strokeStyle = c.color.stroke;
                    ctx.fillRect(x, y, width, height);
                    ctx.strokeRect(x, y, width, height);
                    ctx.stroke();

                ctx.closePath();

                x += 5;
                strs = c.text.split("\\n");


                ctx.beginPath();

                    for(var j = 0; j < strs.length; j++) {
                        y += 1;
                        ctx.fillStyle = "#000000";
                        ctx.font = TCF.font_size+"px Arial";
                        ctx.fillText(strs[j], x, y + 10*(j+1));
                        ctx.stroke();
                    }

                ctx.closePath();

                y += height;
            }
            break;
        }

    }
}

function parse(data) {

    if(!data)
        data = document.getElementById("code").value;

    TCF = new _TCF();

    lines = data.split("\n");
    //console.log(lines);

    for(var i = 0; i < lines.length; i++) {

        if(lines[i].trim() == "")
            continue;

        tokens = lines[i].trim().replace(/(\s\s+)/g, ' ').split(' ');

        switch(tokens[0]) {
            case 'NODES:':
                for(var j = 1; j < tokens.length; j++) {
                    TCF.addNode(tokens[j]);
                }
                continue;
            break;

            case 'TITLE:':
                TCF.title = tokens.slice(1).join(' ');
                continue;
            break;
        }

        from = tokens[0]; // Origin
        to = tokens[1]; // Destiny

        switch(tokens[2]) {
            case 'a:':
                TCF.addConnection(from, to, tokens.slice(3).join(' '));
            break;

            case 'b:':
                TCF.addBox(from, to, tokens.slice(3).join(' '));
            break;

            default:
                alert("Invalid token: " + tokens);
                return;
        }
    }

    draw();
}

function save() {
    var canvas = document.getElementById("canvas");
    l = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    window.location.href = l;
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
    return "";
}

function onload() {
    var txt = getQueryVariable("txt");
    if(txt == "") {
        return;
    }

    parse(txt);
    save();
           
}

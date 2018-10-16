/* eslint-env browser*/
/* global Vector, Blob*/

var maxPos = Vector.toVec( 700, 700);

var canvas = document.getElementById('canvas');
canvas.width = maxPos.x;
canvas.height = maxPos.y;
var ctx = canvas.getContext('2d');

var pcanvas = document.getElementById('pov');
pcanvas.width = maxPos.x;
pcanvas.height = maxPos.y;
var pctx = pcanvas.getContext('2d');

var mouse = {
    'position': Vector.toVec(-1,-1),
    'buttons': 0
};
var pmouse = {
    'position': Vector.toVec(-1,-1),
    'buttons': 0
};

canvas.onmousedown = (event) => {
    mouse.position = Vector.multAdd(Vector.toVec(event.target.offsetLeft, event.target.offsetTop), -1,
        Vector.toVec( event.clientX, event.clientY ), 1);
    mouse.buttons = event.buttons;
};
canvas.onmouseup = (event) => {
    mouse.position = Vector.multAdd(Vector.toVec(event.target.offsetLeft, event.target.offsetTop), -1,
        Vector.toVec( event.clientX, event.clientY ), 1);
    mouse.buttons = event.buttons;
};
canvas.onmousemove = (event) => {
    mouse.position = Vector.multAdd(Vector.toVec(event.target.offsetLeft, event.target.offsetTop), -1,
        Vector.toVec( event.clientX, event.clientY ), 1);
    mouse.buttons = event.buttons;
};

pcanvas.onmousedown = (event) => {
    pmouse.position = Vector.multAdd(Vector.toVec(event.target.offsetLeft, event.target.offsetTop), -1,
        Vector.toVec( event.clientX, event.clientY ), 1);
    pmouse.buttons = event.buttons;
};
pcanvas.onmouseup = (event) => {
    pmouse.position = Vector.multAdd(Vector.toVec(event.target.offsetLeft, event.target.offsetTop), -1,
        Vector.toVec( event.clientX, event.clientY ), 1);
    pmouse.buttons = event.buttons;
};
pcanvas.onmousemove = (event) => {
    pmouse.position = Vector.multAdd(Vector.toVec(event.target.offsetLeft, event.target.offsetTop), -1,
        Vector.toVec( event.clientX, event.clientY ), 1);
    pmouse.buttons = event.buttons;
};

var blobCnt = 10;
var maxMass = 1000;

var interval = 50;
var amount = 0.01;
var intervalCount = 0;
var poopInterval = 5;
var minPoopMass = 200;
var poopMass = 100;
var poopVelocity = 1000;

var blobs = [];
var blobAIs = [];

for( var i = 0; i < blobCnt; i++) {
    if ( i == 0 ) {
        blobs.push( {
            'position': Vector.mult( maxPos, 0.5),
            'velocity': Vector.toVec(0,0),
            'mass': maxMass*0.8,
            'lastPoop': -500
        });
        blobAIs.push( PlayerBlob );
    }
    else
    {
        blobs.push( Blob.randomise(  maxMass, maxPos, maxPos) );
        blobAIs.push( RandomBlob );
    }
}

var boundaries = [];
boundaries.push({
            'position': Vector.toVec(0,0),
            'velocity': Vector.toVec(0,0),
            'mass': 0,
            'lastPoop': -500
        });
boundaries.push(Object.assign({}, boundaries[0], {
            'position': Vector.toVec(maxPos.x,0),
}));
boundaries.push(Object.assign({}, boundaries[0], {
            'position': Vector.toVec(maxPos.x,maxPos.y),
}));
boundaries.push(Object.assign({}, boundaries[0], {
            'position': Vector.toVec(0,maxPos.y),
}));


var timer = setInterval( () => {
    // Move the blobs
    let i = 0;
    for( i in blobs) {
        blobs[i] = Blob.tick( blobs[i], amount, maxPos);
    }

    // Update blobs
    for( i in blobs) {
        if ( blobs[i].mass <= 0 ) {
            continue;
        }

        // Collide blobs
        let j = 0;
        for( j in blobs) {
            if ( j <= i ) {
                continue;
            }
            if ( blobs[j].mass <= 0 ) {
                continue;
            }
            let tmpBlobs = Blob.collide( blobs[i], blobs[j] );
            blobs[i] = tmpBlobs[0];
            blobs[j] = tmpBlobs[1];
        }

        // Maybe poop
        if ( (blobs[i].mass > minPoopMass) &&
            (intervalCount - blobs[i].lastPoop) > poopInterval) {

            var vec = blobAIs[i].poopFunction(blobs[i], i, blobs);

            if ( vec ) {
                let tmpBlobs = Blob.poop( blobs[i], vec, poopMass);
                blobs[i] = tmpBlobs[0];
                blobs[i].lastPoop = intervalCount;
                blobs.push( tmpBlobs[1] ); 
                blobAIs.push( PassiveBlob );
            }
        }
    }

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0,0, maxPos.x, maxPos.y);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(2,2, maxPos.x-4, maxPos.y-4);

    pctx.fillStyle = '#FFFFFF';
    pctx.fillRect(0,0, maxPos.x, maxPos.y);

    // Draw blobs
    for( i in blobs) {
        if ( blobs[i].mass <= 0 ) {
            if ( i == 0 ) {
                clearInterval( timer);
            }
            else
            {
                delete blobs[i];
                delete blobAIs[i];
            }
            continue;
        }
        ctx.fillStyle = blobAIs[i].colour;
        pctx.fillStyle = blobAIs[i].colour;

        Blob.draw( blobs[i], ctx );
        if ( i == 0 )
        {
            Blob.drawCentre( blobs[0], pctx, maxPos );
        } else {
            Blob.drawRelative( blobs[0], blobs[i], pctx, maxPos );
        }
    }

    var relativePoints = boundaries.map( (boundary) => {
        var relativePosition = Blob.relative(blobs[0], boundary);
        var y = relativePosition.radius* Math.cos(relativePosition.angle);
        var x = relativePosition.radius* Math.sin(relativePosition.angle);
        return Vector.toVec(x,y);
    });

    pctx.strokeStyle = '#000000';
    pctx.beginPath();
    pctx.moveTo(maxPos.x/2+relativePoints[0].x, maxPos.y/2+relativePoints[0].y);
    pctx.lineTo(maxPos.x/2+relativePoints[1].x, maxPos.y/2+relativePoints[1].y);
    pctx.lineTo(maxPos.x/2+relativePoints[2].x, maxPos.y/2+relativePoints[2].y);
    pctx.lineTo(maxPos.x/2+relativePoints[3].x, maxPos.y/2+relativePoints[3].y);
    pctx.lineTo(maxPos.x/2+relativePoints[0].x, maxPos.y/2+relativePoints[0].y);
    pctx.stroke();


    intervalCount++;
}, interval);


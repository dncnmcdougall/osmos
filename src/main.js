/* eslint-env browser*/
/* global Vector, Blob*/

var maxPos = Vector.toVec( 500, 500);

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
var blobs = [];
var blobAIs = [];

var playerBlob = {
    'position': Vector.mult( maxPos, 0.5),
    'velocity': Vector.toVec(0,0),
    'mass': maxMass*0.8,
    'lastPoop': -500
};

var interval = 50;
var amount = 0.01;
var intervalCount = 0;
var poopInterval = 5;
var minPoopMass = 200;
var poopMass = 100;
var poopVelocity = 1000;

for( var i = 0; i < blobCnt; i++) {
    blobs.push( Blob.randomise(  maxMass, maxPos, maxPos) );
    blobAIs.push( RandomBlob );
}

var timer = setInterval( () => {
    // Move the blobs
    let i = 0;
    playerBlob = Blob.tick( playerBlob, amount, maxPos);
    for( i in blobs) {
        blobs[i] = Blob.tick( blobs[i], amount, maxPos);
    }

    // Maybe player poop
    if ( (playerBlob.mass > minPoopMass) &&
        (intervalCount - playerBlob.lastPoop) > poopInterval) {

        var vec = PlayerBlob.poopFunction(playerBlob, -1, blobs);

        if ( vec ) {
            let tmpBlobs = Blob.poop( playerBlob, vec, poopMass);
            playerBlob = tmpBlobs[0];
            playerBlob.lastPoop = intervalCount;
            blobs.push( tmpBlobs[1] ); 
            blobAIs.push( PassiveBlob );
        }
    }

    // Update blobs
    for( i in blobs) {
        if ( blobs[i].mass <= 0 ) {
            continue;
        }
        let tmpBlobs = Blob.collide( playerBlob, blobs[i] );
        playerBlob = tmpBlobs[0];
        blobs[i] = tmpBlobs[1];

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

    pctx.fillStyle = '#000000';
    pctx.fillRect(0,0, maxPos.x, maxPos.y);
    pctx.fillStyle = '#FFFFFF';
    pctx.fillRect(2,2, maxPos.x-4, maxPos.y-4);

    // Draw blobs
    for( i in blobs) {
        if ( blobs[i].mass <= 0 ) {
            delete blobs[i];
            delete blobAIs[i];
            continue;
        }
        ctx.fillStyle = blobAIs[i].colour;
        pctx.fillStyle = blobAIs[i].colour;

        Blob.draw( blobs[i], ctx );
        Blob.drawRelative( playerBlob, blobs[i], pctx, maxPos );
    }

    if ( playerBlob.mass <= 0 ) {
        playerBlob = null;
        clearInterval( timer);
        return;
    }

    // Draw player
    ctx.fillStyle = PlayerBlob.colour;
    pctx.fillStyle = PlayerBlob.colour;
    Blob.draw( playerBlob, ctx );
    Blob.drawCentre( playerBlob, pctx, maxPos );

    intervalCount++;
}, interval);


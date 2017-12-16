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
    'position': vector.tovec(-1,-1),
    'buttons': 0
};
var pmouse = {
    'position': vector.tovec(-1,-1),
    'buttons': 0
};

canvas.onmousedown = (event) => {
    mouse.position = Vector.toVec( event.clientX, event.clientY );
    mouse.buttons = event.buttons;
};
canvas.onmouseup = (event) => {
    mouse.position = Vector.toVec( event.clientX, event.clientY );
    mouse.buttons = event.buttons;
};
canvas.onmousemove = (event) => {
    mouse.position = Vector.toVec( event.clientX, event.clientY );
    mouse.buttons = event.buttons;
};

pcanvas.onmousedown = (event) => {
    pmouse.position = Vector.toVec( event.clientX, event.clientY );
    pmouse.buttons = event.buttons;
};
pcanvas.onmouseup = (event) => {
    pmouse.position = Vector.toVec( event.clientX, event.clientY );
    pmouse.buttons = event.buttons;
};
pcanvas.onmousemove = (event) => {
    pmouse.position = Vector.toVec( event.clientX, event.clientY );
    pmouse.buttons = event.buttons;
};

var blobCnt = 10;
var maxMass = 1000;
var blobs = [];
var playerBlob = {
    'position': Vector.mult( maxPos, 0.5),
    'velocity': Vector.toVec(0,0),
    'mass': maxMass*0.8,
    'lastPoop': -500
};

for( var i = 0; i < blobCnt; i++) {
    blobs.push( Blob.randomise(  maxMass, maxPos, maxPos) );
}

var interval = 50;
var amount = 0.01;
var intervalCount = 0;
var poopInterval = 5;
var minPoopMass = 200;
var poopMass = 100;
var poopVelocity = 1000;

var timer = setInterval( () => {
    // Move the blobs
    let i = 0;
    playerBlob = Blob.tick( playerBlob, amount, maxPos);
    for( i in blobs) {
        blobs[i] = Blob.tick( blobs[i], amount, maxPos);
    }

    if ((mouse.buttons != 0) && 
        (playerBlob.mass > minPoopMass) && 
        (intervalCount - playerBlob.lastPoop) > poopInterval ) {

        var vel = Vector.norm(Vector.multAdd( mouse.position, 1, playerBlob.position, -1 ));
        vel = Vector.mult( vel, poopVelocity);

        let tmpBlobs = Blob.poop( playerBlob, vel, poopMass);
        playerBlob = tmpBlobs[0];
        blobs.push( tmpBlobs[1] );
        playerBlob.lastPoop = intervalCount;

        mouse.buttons = 0;
    }

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
        var toPoopOrNotToPoop = (Math.random() < 1/50);
        if ( toPoopOrNotToPoop && 
            (blobs[i].mass > minPoopMass) &&
            (intervalCount - blobs[i].lastPoop) > poopInterval) {

            var vel = Vector.randomDir( poopVelocity );

            let tmpBlobs = Blob.poop( blobs[i], vel, poopMass);
            blobs[i] = tmpBlobs[0];
            blobs.push( tmpBlobs[1] );
            blobs[i].lastPoop = intervalCount;
        }
    }

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0,0, 500, 500);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(2,2, 496, 496);

    pctx.fillStyle = '#000000';
    pctx.fillRect(0,0, 500, 500);
    pctx.fillStyle = '#FFFFFF';
    pctx.fillRect(2,2, 496, 496);

    // Draw blobs
    ctx.fillStyle = '#000000';
    pctx.fillStyle = '#000000';
    for( i in blobs) {
        if ( blobs[i].mass <= 0 ) {
            delete blobs[i];
            continue;
        }
        Blob.draw( blobs[i], ctx );
        Blob.drawRelative( playerBlob, blobs[i], pctx, maxPos );
    }

    if ( playerBlob.mass <= 0 ) {
        playerBlob = null;
        clearInterval( timer);
        return;
    }
    ctx.fillStyle = '#0000aa';
    pctx.fillStyle = '#0000aa';
    Blob.draw( playerBlob, ctx );
    Blob.drawCentre( playerBlob, pctx, maxPos );

    // if ( intervalCount > 100 ) {
    //     clearInterval( timer);
    // }
    intervalCount++;

}, interval);


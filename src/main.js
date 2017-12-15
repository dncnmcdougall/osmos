/* eslint-env browser*/
/* global Vector, Blob*/

var maxPos = Vector.toVec( 500, 500);

var canvas = document.getElementById('canvas');
canvas.width = maxPos.x;
canvas.height = maxPos.y;
var ctx = canvas.getContext('2d');

var blobCnt = 10;
var maxMass = 1000;
var blobs = [];

for( var i = 0; i < blobCnt; i++) {
    blobs.push( Blob.randomise(  maxMass, maxPos, maxPos) );
}

var interval = 50;
var amount = 0.01;
var intervalCount = 0;

var timer = setInterval( () => {
    // Move the blobs
    let i = 0;
    for( i in blobs) {
        blobs[i] = Blob.tick( blobs[i], amount, maxPos);
    }

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
        var toPoopOrNotToPoop = (Math.random() < 1/50);
        if ( toPoopOrNotToPoop && blobs[i].mass > 200 ) {
            var mass = 100;

            var poopVel = 500;
            var vel = Vector.randomDir( poopVel );

            let tmpBlobs = Blob.poop( blobs[i], vel, mass);
            blobs[i] = tmpBlobs[0];
            blobs.push( tmpBlobs[1] );
        }
    }

    // Clear canvas
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0,0, 500, 500);

    // Draw blobs
    ctx.fillStyle = '#000000';
    for( i in blobs) {
        if ( blobs[i].mass <= 0 ) {
            delete blobs[i];
            continue;
        }
        Blob.draw( blobs[i], ctx );
    }

    if ( intervalCount > 1000 ) {
        clearInterval( timer);
    }
    intervalCount++;

}, interval);


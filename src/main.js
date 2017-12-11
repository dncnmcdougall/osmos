/* eslint-env browser*/

// import {WorldModel} from ( 'src/world.js');


var canvas = document.getElementById('canvas');
const body = document.getElementsByTagName('body')[0];

var maxPos = Vector.toVec( 500, 500);

canvas.width = maxPos.x;
canvas.height = maxPos.y;

var ctx = canvas.getContext('2d');

var blobCnt = 10;
var maxMass = 1000;
var blobs = [];

for( var i = 0; i < blobCnt; i++) {
    blobs.push( Blob.randomise(  maxMass, maxPos, Vector.toVec(500, 500) ) );
}

var interval = 100;
var amount = 0.05;

setInterval( () => {
    console.log('tick');
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0,0, 500, 500);
    ctx.fillStyle = "#000000";
    for( var i = 0; i < blobCnt; i++) {
        if ( blobs[i].mass <= 0 ) {
            continue;
        }
        blobs[i] = Blob.tick( blobs[i], amount, maxPos);
    }
    for( var i = 0; i < blobCnt-1; i++) {
        if ( blobs[i].mass <= 0 ) {
            continue;
        }
        for( var j = i+1; j < blobCnt; j++) {
            if ( blobs[j].mass <= 0 ) {
                continue;
            }
            var tmpBlobs = Blob.overlap( blobs[i], blobs[j] );
            blobs[i] = tmpBlobs[0];
            blobs[j] = tmpBlobs[1];
        }
    }
    for( var i = 0; i < blobCnt; i++) {
        if ( blobs[i].mass <= 0 ) {
            continue;
        }
        Blob.draw( blobs[i], ctx );
    }
}, interval);

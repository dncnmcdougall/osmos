/* eslint-env browser*/

// import {WorldModel} from ( 'src/world.js');


const body = document.getElementsByTagName('body')[0];

var mementumTA = document.getElementById('MomentumTA');

var maxPos = Vector.toVec( 500, 500);

var canvas = document.getElementById('canvas');
canvas.width = maxPos.x;
canvas.height = maxPos.y;
var ctx = canvas.getContext('2d');

var graph = document.getElementById('graph');
graph.width = maxPos.x;
graph.height = maxPos.y;
var gctx = graph.getContext('2d');

var blobCnt = 10;
var maxMass = 1000;
var blobs = [];

var momentum = 0;
for( var i = 0; i < blobCnt; i++) {
    blobs.push( Blob.randomise(  maxMass, maxPos, Vector.toVec(500, 500) ) );
    momentum = momentum + Blob.momentum( blobs[i] );
}

var interval = 200;
var amount = 0.05;
var position = 0;
var range = {
    'min': 0,
    'max': 10000
}


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
        momentum = momentum + Blob.momentum( blobs[i] );
    }
    MomentumTA.textContent = momentum;

}, interval);


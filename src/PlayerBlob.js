const PlayerBlob = {
    'poopFunction': function(thisBlob, thisIndex, blobs) {
        if ((mouse.buttons != 0) ) {

            var vel = Vector.norm(Vector.multAdd( mouse.position, 1, thisBlob.position, -1 ));
            vel = Vector.mult( vel, poopVelocity);

            return vel;
        } else if ( pmouse.buttons != 0 ) {
            var relativeVec = Vector.multAdd( Vector.mult( maxPos, 1/2), -1, pmouse.position, 1);
            let forward = null;
            if ( Vector.length( thisBlob.velocity) < 1e-6) {
                forward = Vector.toVec(0,-1);
            } else {
                forward = Vector.norm( thisBlob.velocity);
            }
            let right = {
                'x': forward.y,
                'y': -forward.x
            };
            actualVec = Vector.norm(Vector.multAdd( forward,  -relativeVec.y, right, -relativeVec.x));

            actualVec = Vector.mult( actualVec, poopVelocity);
            return actualVec;

        }
        return null;
    },
    "colour": "#0000aa"
};

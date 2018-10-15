const RandomBlob = {
    'poopFunction': function(thisBlob, thisIndex, blobs) {
        var toPoopOrNotToPoop = (Math.random() < 1/50);
        if ( toPoopOrNotToPoop ) {

            return Vector.randomDir( poopVelocity );
        }
        return null;
    },
    "colour": "#402020"
};

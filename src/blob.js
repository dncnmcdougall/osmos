/* eslint-env browser*/
/* global Vector*/

const Blob= {
    'randomise': function( maxMass, maxVel, maxPos) {
        return {
            'mass':Math.random()*maxMass,
            'velocity': {
                'x': (Math.random()-0.5)*maxVel.x,
                'y': (Math.random()-0.5)*maxVel.y
            },
            'position': {
                'x': Math.random()*maxPos.x,
                'y': Math.random()*maxPos.y
            },
            'lastPoop': -500
        };
    },
    'gain': function(blob, vec, mass) {

        return Object.assign({}, blob, {
            'mass':blob.mass+mass,
            'velocity':Vector.weightedAdd(blob.velocity, blob.mass, vec, mass)
            // position does not change
        });
    },
    'loose': function(blob, vec, mass) {
        return Object.assign({}, blob, {
            'mass':blob.mass-mass,
            'velocity':Vector.weightedAdd(blob.velocity, blob.mass, vec, -mass)
            // position does not change
        });
    },
    'tick': function(blob, amount, maxPos) {
        let newState = Object.assign({}, blob, {
            'position':Vector.multAdd(blob.position, 1, blob.velocity, amount)
        });
        let r = this.radius( blob );
        let r2 = 2*r;

        if ( newState.position.x < r ) {
            newState.position.x = r2-newState.position.x;
            newState.velocity.x = -newState.velocity.x;
        } else if ( newState.position.x > (maxPos.x-r) ) {
            newState.position.x = 2*(maxPos.x-r) - newState.position.x;
            newState.velocity.x = -newState.velocity.x;
        }
        if ( newState.position.y < r ) {
            newState.position.y = r2-newState.position.y;
            newState.velocity.y = -newState.velocity.y;
        } else if ( newState.position.y > (maxPos.y-r) ) {
            newState.position.y = 2*(maxPos.y-r) - newState.position.y;
            newState.velocity.y = -newState.velocity.y;
        }
        return newState;
    },
    'collide': function( blob1, blob2) {
        var r1 = this.radius( blob1 );
        var r2 = this.radius( blob2 );
        var distance = Vector.distance( blob1.position, blob2.position);

        if ( distance >= (r1 + r2) ) {
            return [blob1, blob2];
        }

        var overlap = (r1 + r2) - distance;
        var overlap2 = Math.pow(overlap, 2);

        var newBlob1 = {};
        var newBlob2 = {};

        if ( r1 >= r2 && distance <= r1 ) {
            newBlob1 = this.gain( blob1, blob2.velocity, blob2.mass);
            newBlob2 = Object.assign({}, blob2, {
                'mass': 0
            });
        }
        else if ( r1 >= r2 ) {
            let massOverlap = Math.PI* (2*overlap*r2 - overlap2);
            newBlob1 = this.gain( blob1, blob2.velocity, massOverlap);
            newBlob2 = Object.assign({}, blob2, {
                'mass': blob2.mass - massOverlap
            });
        }
        else if ( distance <= r2 ) {
            newBlob2 = this.gain( blob2, blob1.velocity, blob1.mass);
            newBlob1 = Object.assign({}, blob1, {
                'mass': 0
            });
        }
        else
        {
            let massOverlap = Math.PI* (2*overlap*r1 - overlap2);
            newBlob2 = this.gain( blob2, blob1.velocity, massOverlap);
            newBlob1 = Object.assign({}, blob1, {
                'mass': blob1.mass - massOverlap
            });
        }

        return [ newBlob1, newBlob2 ];
    },
    'poop': function( blob, vec, mass ) {
        var newBlob1 = this.loose( blob, vec, mass);
        var newBlob2 = {
            'position': Vector.toVec( 0,0),
            'velocity': vec,
            'mass': mass
        };
        var r1 = this.radius( newBlob1 );
        var r2 = this.radius( newBlob2 );

        var newPos = Vector.multAdd( 
            blob.position, 1,
            Vector.norm( vec), (r1+r2)
        );
        newBlob2.position = newPos;

        return [newBlob1, newBlob2];
    },
    'momentum': function(blob) {
        return Vector.mult(blob.velocity, blob.mass);
    },
    'radius': function(blob) {
        return Math.sqrt(blob.mass/Math.PI);
    },
    'relative': function( blob, otherBlob){
        let forward = null;
        if ( Vector.length( blob.velocity) < 1e-6)
        {
            forward = Vector.toVec(0,1);
        }
        else
        {
            forward = Vector.norm( blob.velocity);
        }
        let relPos = Vector.multAdd(blob.position, 1, otherBlob.position,-1); 
        let relDir = Vector.norm(relPos); 

        let radius = Vector.length( relPos );
        let angle = Math.acos( Vector.dot( forward, relDir) );

        let cross  =forward.x*relPos.y - forward.y*relPos.x;
        if ( cross < 0 ) {
            angle = -angle;
        }

        let radialVel = Vector.dot( relDir, otherBlob.velocity);
        let tangentalVel = Vector.multAdd( otherBlob.velocity, 1, radialVel, -1);

        return {
            'radius': radius,
            'angle': angle,
            'radialVelocity': radialVel,
            'tangentalVelocity': tangentalVel
        };
    },
    'draw': function(blob, ctx) {
        let r = this.radius(blob);
        ctx.beginPath();
        ctx.arc(blob.position.x,blob.position.y,  r, 0, 2*Math.PI);
        ctx.fill();
    },
    'drawCentre': function(blob, ctx, bounds) {
        let r = this.radius(blob);
        ctx.beginPath();
        ctx.arc(bounds.x/2,bounds.y/2,  r, 0, 2*Math.PI);
        ctx.fill();
    },
    'drawRelative': function(blob, otherBlob, ctx, bounds) {

        var relativePosition =  this.relative( playerBlob, otherBlob );
        var y = relativePosition.radius* Math.cos(relativePosition.angle);
        var x = relativePosition.radius* Math.sin(relativePosition.angle);

        let otherR = this.radius(otherBlob);
        ctx.beginPath();
        ctx.arc(bounds.x/2+x,bounds.y/2 + y,  otherR, 0, 2*Math.PI);
        ctx.fill();
    }
};

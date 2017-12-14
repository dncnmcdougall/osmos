/* eslint-env browser*/


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
        }
    };
},
'gain': function(state, vec, mass) {
    return Object.assign({}, state, {
        'mass':state.mass+mass,
        'velocity':Vector.weightedAdd(state.velocity, state.mass, vec, mass)
        // position does not change
    });
},
'loose': function(state, vec, mass) {
    return Object.assign({}, state, {
        'mass':state.mass-mass,
        'velocity':Vector.weightedAdd(state.velocity, state.mass, vec, -mass)
        // position does not change
    });
},
'tick': function(state, amount, maxPos) {
    let newState = Object.assign({}, state, {
        'position':Vector.multAdd(state.position, 1, state.velocity, amount)
    });
    let r = this.radius( state );
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
'overlap': function( blob1, blob2) {
    var r1 = this.radius( blob1 );
    var r2 = this.radius( blob2 );
    var distance = Vector.distance( blob1.position, blob2.position);

    if ( distance >= (r1 + r2) ) {
        return [blob1, blob2];
    }


    var overlap = (r1 + r2) - distance;
    var overlap2 = Math.pow(overlap, 2);

    var massOverlap1 = Math.PI* (2*overlap*r1 - overlap2);
    var massOverlap2 = Math.PI* (2*overlap*r2 - overlap2);

    if ( blob1.mass > blob2.mass ) {
        if ( distance < r1 ) {
            var newBlob1 = this.gain( blob1, blob2.velocity, blob2.mass);
            var newBlob2 = Object.assign({}, blob2, {
                'mass': 0
            });
        } else {
            var newBlob1 = this.gain( blob1, blob2.velocity, massOverlap2);
            var newBlob2 = Object.assign({}, blob2, {
                'mass': blob2.mass - massOverlap2
            });
        }
    } else {
        if ( distance < r2 ) {
            var newBlob2 = this.gain( blob2, blob1.velocity, blob1.mass);
            var newBlob1 = Object.assign({}, blob1, {
                'mass': 0
            });
        } else {
            var newBlob2 = this.gain( blob2, blob1.velocity, massOverlap1);
            var newBlob1 = Object.assign({}, blob1, {
                'mass': blob1.mass - massOverlap1
            });
        }
    }

    return [ newBlob1, newBlob2 ];
},
'momentum': function(state) {
    return state.mass * Vector.length(state.velocity);
},
'radius': function(state) {
    return Math.sqrt(state.mass/Math.PI);
},
'draw': function(state, ctx) {
    let r = this.radius(state);
    ctx.beginPath();
    ctx.arc(state.position.x,state.position.y,  r, 0, 2*Math.PI);
    ctx.fill();
}
};

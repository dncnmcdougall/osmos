
const Vector = {
    'toVec': function(x, y) {
        return {
            'x': x,
            'y': y
        };
    },
    'length': function(vec) {
        return Math.sqrt( Math.pow(vec.x,2) + Math.pow(vec.y,2) );
    },
    'distance': function(vec1, vec2) {
        return this.length( this.toVec( vec1.x - vec2.x, vec1.y - vec2.y));
    },
    'norm': function(vec) {
        let len = this.length(vec);
        return {
            'x': vec.x/len,
            'y': vec.y/len
        };
    },
    'add': function(vec1, vec2) {
        return {
            'x': vec1.x + vec2.x,
            'y': vec1.y + vec2.y
        };
    },
    'multAdd': function(vec1, m1, vec2, m2) {
        return {
            'x': vec1.x*m1 + vec2.x*m2,
            'y': vec1.y*m1 + vec2.y*m2
        };
    },
    'weightedAdd': function(vec1, w1, vec2, w2) {
        let wT = w1 + w2;
        return {
            'x': vec1.x*(w1/wT) + vec2.x*(w2/wT),
            'y': vec1.y*(w1/wT) + vec2.y*(w2/wT)
        };
    }
};

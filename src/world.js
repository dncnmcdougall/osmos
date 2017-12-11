
const ModelReducer = require('model_reducer');

const BlobModel = require('src/blob.js');

var WorldModelCreator = new ModelReducer.ModelCreator('World');

WorldModelCreator.addChildModel( BlobModel);
WorldModelCreator.addAvailableKeyRequestFor( BlobModel );
WorldModelCreator.addAddActionFor( BlobModel );

export const WorldModelCreator.finalise();

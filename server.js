'use strict';

const express = require('express');

const app = express();

app.use(express.static('public')); //this is serving the static files in 'public'

//require is a function, and 'main' is a property on the require function
// checking to see if we're in a node.js environment - if we are, then open port
if (require.main === module) {
    app.listen(process.env.port || 8080, function() {
        console.info(`app is listening on ${this.address().port}`);
    });
}


module.exports = app;

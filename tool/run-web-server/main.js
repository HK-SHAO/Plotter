const express = require('express')
var c = require('child_process');

const app = express()
const port = 8080

// Add headers
app.use(function (req, res, next) {


    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');

    res.header("Cross-Origin-Embedder-Policy", "require-corp");
    res.header("Cross-Origin-Opener-Policy", "same-origin");

    // Pass to next layer of middleware
    next();
});

app.use(express.static('../../build/web'));

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);

    c.exec('start http://localhost:8080/PlotterApp.html');
});
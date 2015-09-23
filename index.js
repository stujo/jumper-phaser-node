var port = process.env.PORT || 3000;        // set our port
var express    = require('express');        // call express
var app        = express();                 // define our app using express

app.use(express.static('public'));

require('./config/settings')(app);

require('./routes/home')(app);

app.listen(port);

console.log('Listening on port ' + port);


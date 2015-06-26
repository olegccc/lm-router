var express = require('express');

var app = express();

app.use(express.bodyParser());

app.post('/router', function(req, res) {

    var url = req.body.url;

    if (url === '/test/something') {
        res.send({
            valid: true,
            template: '<p>{{contents}}</p>',
            data: {
                contents: 'abc'
            }
        })
    } else {
        res.send({
            error: 'Unknown URL',
            valid: false
        });
    }
});

app.listen(80);

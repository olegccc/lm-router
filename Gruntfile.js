module.exports = function(grunt){
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-tsd');
    grunt.loadNpmTasks('grunt-umd');
    grunt.loadNpmTasks('grunt-protractor-runner');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.initConfig(grunt.file.readJSON('./config/grunt.config.json'));

    var jade = require('jade');
    var jadeOptions = {
    };
    var template = jade.compile(grunt.file.read('./test/views/index.jade'), jadeOptions);

    var handler = function(connect, options, middlewares) {

        var pathChecker = /^\/test((?:\/.*)(\?[^\?]+)?)?$/;

        middlewares.unshift(function(req, res, next) {

            if (req.url === '/favicon.ico') {
                res.end();
                return;
            }

            grunt.log.debug('Url: ' + req.url);

            var match = pathChecker.exec(req.url);
            if (match && match.length > 0) {
                var path = match[1];
                var query = match.length > 1 ? match[2] : "";
                var html = template({ path: path, query: query });
                res.end(html);
            } else {
                return next();
            }
        });

        return middlewares;
    };

    grunt.config('connect.options.middleware', handler);

    grunt.registerTask('verify', ['connect:start', 'protractor']);
    grunt.registerTask('build', ['tsd', 'ts:build', "ts:tests", 'umd', 'uglify']);
    grunt.registerTask('view', ['connect:keepalive']);
};

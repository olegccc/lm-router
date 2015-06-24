function pushState(path) {
    return browser.executeScript('history.pushState("' + path + '", "title", "' + path + '");');
}

describe('Given page opens at address localhost:9090/test/sample and navigate to /test/abc', function() {

    var beforeEachCalled = false;

    beforeEach(function(done) {
        if (beforeEachCalled) {
            done();
            return;
        }
        beforeEachCalled = true;
        browser.get('http://localhost:9090/test/sample').then(function() {
            pushState('http://localhost:9090/test/abc').then(function() {
                done();
            });
        });
    });

    describe('When navigate to back page /test/sample/', function() {
        it('url should be /sample', function() {
            browser.executeScript('window.history.back();');
            var el = element(by.id('current-page'));
            expect(el.getText()).toEqual('/sample')
        });
    });

    describe('When property "abc" is set to "def"', function() {
        it('url should be /sample and properties should contain valid "abc" field', function(done) {
            browser.executeScript('window.router.setProperty("abc", "def");').then(
                function() {
                    var el = element(by.id('page-properties'));
                    el.getText().then(function(text) {
                        var properties = JSON.parse(text);
                        expect(properties.abc).toEqual('def');
                        done();
                    });
                }
            );
        });
    });
});
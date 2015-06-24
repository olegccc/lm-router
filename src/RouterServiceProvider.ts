class RouterServiceProvider implements ng.IServiceProvider {

    private rootPath: string;

    constructor() {
        this.rootPath = "/";
    }

    public setRootPath(path: string) {
        this.rootPath = path;
        if (this.rootPath.length === 0 || this.rootPath[0] != '/') {
            this.rootPath = '/' + this.rootPath;
        }
        if (this.rootPath[this.rootPath.length-1] === '/') {
            this.rootPath = this.rootPath.substring(0, this.rootPath.length-1);
        }
    }

    $get = ['$browser', '$rootScope', (browser: ng.IBrowserService, rootScope: ng.IRootScopeService) => {
        return new RouterService(this.rootPath, browser, rootScope);
    }];
}

var module = angular.module('lm-router', []);

module.provider('router', [RouterServiceProvider]);
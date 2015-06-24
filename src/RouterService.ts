class RouterServiceEntry {

    public name: string;
    public match: string;
    public expression: RegExp;
    public handler: () => void;
    public instance: any;
}

class RouterService {

    private rootPath: string;
    private matches: Array<RouterServiceEntry>;
    private path: string;
    private pageProperties: any;
    private rootScope: ng.IRootScopeService;

    constructor(rootPath: string, browser: ng.IBrowserService, rootScope: ng.IRootScopeService) {

        this.rootPath = rootPath;
        this.matches = [];
        this.path = null;
        this.pageProperties = {};
        this.rootScope = rootScope;

        this.initializeBrowser(browser, rootScope);
    }

    private getCurrentPath() {
        var localPath = location.pathname;
        if (localPath.substr(0, this.rootPath.length) == this.rootPath &&
                (this.rootPath.length === localPath.length || (localPath[this.rootPath.length] == '/'))) {
            localPath = localPath.substr(this.rootPath.length);
        }
        return localPath + location.search;
    }

    private initializeBrowser(browser: ng.IBrowserService, rootScope: ng.IRootScopeService) {
        var browserUrl:string = browser["url"]();
        browser["url"] = () => { return browserUrl; };

        var handler = () => {
            var path = this.getCurrentPath();
            rootScope.$apply(() => {
                this.onRouteChanged(path);
            });
        };

        angular.element(window).on('popstate', handler);
        angular.element(window).on('pushstate', handler);
    }

    public on(match: string, handler: any, name: string = null, instance: any = null) {

        this.off(match);
        var entry = new RouterServiceEntry();
        entry.name = name || 'undefined';
        entry.match = match;
        entry.expression = new RegExp("^" + match + "$");
        entry.instance = instance || window;
        entry.handler = handler;
        this.matches.push(entry);
    }

    public off(match: string) {

        for (var i = 0; i < this.matches.length; i++) {
            var entry = this.matches[i];
            if (entry.match === match) {
                this.matches = this.matches.splice(i, 1);
                break;
            }
        }
    }

    public start() {
        this.onRouteChanged(this.getCurrentPath());
    }

    private loadProperties(query: string) {

        this.pageProperties = {};

        var parameters = query.split('&');

        for (var i = 0; i < parameters.length; i++) {
            if (parameters[i].length === 0) {
                continue;
            }
            var t = parameters[i].split('=');
            var name = t[0];
            this.pageProperties[name] = t.length > 0 ? t[1] : '';
        }
    }

    private getPathWithQuery() {
        var query = "";

        for (var key in this.pageProperties) {
            if (!this.pageProperties.hasOwnProperty(key)) {
                continue;
            }
            var value = this.pageProperties[key];

            if (value === null || value.length == 0) {
                continue;
            }

            if (query.length > 0) {
                query += "&";
            }
            query += key + "=" + value;
        }

        var newFullPath = this.path || "";

        if (newFullPath[newFullPath.length-1] == '/') {
            newFullPath = newFullPath.substring(0, newFullPath.length-1);
        }

        if (query.length > 0) {
            newFullPath += "?" + query;
        }

        return newFullPath;
    }

    private setPageHistory(title: string = "") {

        var newFullPath = this.rootPath + this.getPathWithQuery();

        if (window.location.href != newFullPath) {
            history.pushState(newFullPath, title, newFullPath);
            this.onRouteChanged(newFullPath);
        }
    }

    public navigate(path: string, title: string = "") {
        this.path = path;
        this.pageProperties = {};
        this.setPageHistory(title);
    }

    public getProperty(key: string, defaultValue: string = undefined) {
        if (this.pageProperties.hasOwnProperty(key)) {
            return this.pageProperties[key];
        } else {
            return defaultValue;
        }
    }

    public setProperty(key: string, value: string, title: string = "") {
        this.pageProperties[key] = value;
        this.setPageHistory(title);
        if (!this.rootScope.$$phase) {
            this.rootScope.$apply();
        }
    }

    onRouteChanged(path: string) {

        if (this.getPathWithQuery() === path) {
            return;
        }

        var queryPos = path.indexOf('?');
        var query = "";
        if (queryPos > 0) {
            query = path.substr(queryPos+1);
            path = path.substring(0, queryPos);
        }

        this.loadProperties(query);

        this.path = path;

        for (var i = 0; i < this.matches.length; i++) {
            var match = this.matches[i];
            var check = match.expression.exec(path);
            if (check && check.length > 0) {
                match.handler.call(match.instance, check.slice(1), this.pageProperties);
                return;
            }
        }

        console.log("Warning: route '" + path + "' has no handler");
    }
}

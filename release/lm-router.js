(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define(["angular"], function (a0) {
      return (factory(a0));
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require("angular"));
  } else {
    factory(angular);
  }
}(this, function (angular) {

var RouterServiceEntry = (function () {
    function RouterServiceEntry() {
    }
    return RouterServiceEntry;
})();
var RouterService = (function () {
    function RouterService(rootPath, browser, rootScope) {
        this.rootPath = rootPath;
        this.matches = [];
        this.path = null;
        this.pageProperties = {};
        this.rootScope = rootScope;
        this.initializeBrowser(browser, rootScope);
    }
    RouterService.prototype.getCurrentPath = function () {
        var localPath = location.pathname;
        if (localPath.substr(0, this.rootPath.length) == this.rootPath &&
            (this.rootPath.length === localPath.length || (localPath[this.rootPath.length] == '/'))) {
            localPath = localPath.substr(this.rootPath.length);
        }
        return localPath + location.search;
    };
    RouterService.prototype.initializeBrowser = function (browser, rootScope) {
        var _this = this;
        var browserUrl = browser["url"]();
        browser["url"] = function () { return browserUrl; };
        var handler = function () {
            var path = _this.getCurrentPath();
            rootScope.$apply(function () {
                _this.onRouteChanged(path);
            });
        };
        angular.element(window).on('popstate', handler);
        angular.element(window).on('pushstate', handler);
    };
    RouterService.prototype.on = function (match, handler, name, instance) {
        if (name === void 0) { name = null; }
        if (instance === void 0) { instance = null; }
        this.off(match);
        var entry = new RouterServiceEntry();
        entry.name = name || 'undefined';
        entry.match = match;
        entry.expression = new RegExp("^" + match + "$");
        entry.instance = instance || window;
        entry.handler = handler;
        this.matches.push(entry);
    };
    RouterService.prototype.off = function (match) {
        for (var i = 0; i < this.matches.length; i++) {
            var entry = this.matches[i];
            if (entry.match === match) {
                this.matches = this.matches.splice(i, 1);
                break;
            }
        }
    };
    RouterService.prototype.start = function () {
        this.onRouteChanged(this.getCurrentPath());
    };
    RouterService.prototype.loadProperties = function (query) {
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
    };
    RouterService.prototype.getPathWithQuery = function () {
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
        if (newFullPath[newFullPath.length - 1] == '/') {
            newFullPath = newFullPath.substring(0, newFullPath.length - 1);
        }
        if (query.length > 0) {
            newFullPath += "?" + query;
        }
        return newFullPath;
    };
    RouterService.prototype.setPageHistory = function (title) {
        if (title === void 0) { title = ""; }
        var newFullPath = this.rootPath + this.getPathWithQuery();
        if (window.location.href != newFullPath) {
            history.pushState(newFullPath, title, newFullPath);
            this.onRouteChanged(newFullPath);
        }
    };
    RouterService.prototype.navigate = function (path, title) {
        if (title === void 0) { title = ""; }
        this.path = path;
        this.pageProperties = {};
        this.setPageHistory(title);
    };
    RouterService.prototype.getProperty = function (key, defaultValue) {
        if (defaultValue === void 0) { defaultValue = undefined; }
        if (this.pageProperties.hasOwnProperty(key)) {
            return this.pageProperties[key];
        }
        else {
            return defaultValue;
        }
    };
    RouterService.prototype.setProperty = function (key, value, title) {
        if (title === void 0) { title = ""; }
        this.pageProperties[key] = value;
        this.setPageHistory(title);
        if (!this.rootScope.$$phase) {
            this.rootScope.$apply();
        }
    };
    RouterService.prototype.onRouteChanged = function (path) {
        if (this.getPathWithQuery() === path) {
            return;
        }
        var queryPos = path.indexOf('?');
        var query = "";
        if (queryPos > 0) {
            query = path.substr(queryPos + 1);
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
    };
    return RouterService;
})();
var RouterServiceProvider = (function () {
    function RouterServiceProvider() {
        var _this = this;
        this.$get = ['$browser', '$rootScope', function (browser, rootScope) {
                return new RouterService(_this.rootPath, browser, rootScope);
            }];
        this.rootPath = "/";
    }
    RouterServiceProvider.prototype.setRootPath = function (path) {
        this.rootPath = path;
        if (this.rootPath.length === 0 || this.rootPath[0] != '/') {
            this.rootPath = '/' + this.rootPath;
        }
        if (this.rootPath[this.rootPath.length - 1] === '/') {
            this.rootPath = this.rootPath.substring(0, this.rootPath.length - 1);
        }
    };
    return RouterServiceProvider;
})();
var module = angular.module('lm-router', []);
module.provider('router', [RouterServiceProvider]);


}));

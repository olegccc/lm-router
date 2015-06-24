/// <reference path="../../src/RouterService.ts" />

interface ITestControllerScope extends ng.IScope {
    statistics: string;
    newUrl: string;
    onNewUrl: () => void;
}

class TestController {
    constructor(scope: ITestControllerScope, router: RouterService) {

        scope.statistics = "";

        router.on('(.*)', (path: string, properties: any) => {
            console.log('path: ' + path);
            console.log('properties: ' + JSON.stringify(properties));
            var element = document.getElementById('current-page');
            element.innerText = path;
            element = document.getElementById('page-properties');
            element.innerText = JSON.stringify(properties);
        });

        router.start();

        scope.onNewUrl = () => {
            router.navigate(scope.newUrl);
        };

        window['router'] = router;
    }
}

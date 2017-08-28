define(['knockout', 'jquery', 'text!./plp-manager.html', 'appConfig', 'd3'], function (ko, $, view, appConfig, d3) {


    function plpManager(params) {
        //console.log("manager:" + params.model.currentModelId());
        var self = this;
        self.modelId = params.model.currentModelId();
        self.tabMode = ko.observable('inspector');
        self.appConfig = appConfig;
        self.sample = ko.observable('hello world');
        self.performanceTabMode = ko.observable('discrimination');

        self.init = function () {
            console.log('hello world');
        }

        self.model = {
            name: 'inspector'
        };
    }

    var component = {
        viewModel: plpManager,
        template: view
    };

    ko.components.register('plp-manager', component);
    return component;

});

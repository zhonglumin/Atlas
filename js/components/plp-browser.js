define(['knockout', 'jquery', 'text!./plp-browser.html', 'appConfig', 'd3'], function (ko, $, view, appConfig, d3) {


    function plpBrowser(params) {
        var self = this;
        this.models = ko.observableArray();
        this.models([
            {
                "modelId": "1",
                "name": "this is model 1",
                "datafile": "somemodelfile.csv",
                "modeltype": "logistic regression"
            }
        ]);
        self.appConfig = appConfig;
        self.sample = ko.observable('hello world');

        self.options = {
            Facets: [
                {
                    'caption': 'Model Type',
                    'binding': function (o) {
                        return o.modeltype;
                    }
				}
			]
        };

        self.rowClick = function (d) {
            document.location = "#/plp/" + d.modelId;
        }

        self.columns = [
            {
                title: 'Model Id',
                data: 'modelId'
			},
            {
                title: 'Model Mame',
                data: 'name'
			},
            {
                title: 'File',
                data: 'datafile'
			},
            {
                title: 'Model Type',
                data: 'modeltype'
			}

		];

    }

    var component = {
        viewModel: plpBrowser,
        template: view
    };

    ko.components.register('plp-browser', component);
    return component;

});

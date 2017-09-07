define(['knockout', 'jquery', 'text!./plp-browser.html', 'appConfig', 'd3'], function (ko, $, view, config, d3) {
	function plpBrowser(params) {
		var self = this;
		self.loading = ko.observable(false);
		this.models = ko.observableArray();
		this.models([
			{
				"modelId": "1",
				"name": "this is model 1",
				"datafile": "somemodelfile.csv",
				"modeltype": "logistic regression"
            }
        ]);
		self.config = config;
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
				data: d => {
					return '<span class=\'linkish\'>' + d.name + '</span>';
				},
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

		self.newPatientLevelPrediction = function () {
			document.location = '#/plp/0';
		}

		self.loading(true);

		$.ajax({
			url: config.services[0].url + 'comparativecohortanalysis',
			method: 'GET',
			success: function (d) {
				console.warn("TODO: load PLP from server")
				self.loading(false);
			}
		});
	}

	var component = {
		viewModel: plpBrowser,
		template: view
	};

	ko.components.register('plp-browser', component);
	return component;

});

define(['knockout', 'jquery', 'text!./treegrid-manager.html', 'appConfig', 'datatables.treegrid'], function (ko, $, view, config) {

	function treegridManager(params) {
		var self = this;
		self.data = ko.observableArray();

		var dataSet = [
			{
				title: 'node 1',
				position: 'position 1',
				children: [
					{
						title: 'node 1-1',
						position: 'position 1-1',
						children: [
							{
								title: 'node 1-1-1',
								position: 'position 1-1-1'
							}
						]
					}
				]
			},
			{
				title: 'node 2',
				position: 'position 2'
			}
		];

		$('#treegrid').DataTable({
			data: dataSet,
			select: true,
			columns: [
				{
					title: '',
					orderable: false,
					target: 0,
					className: 'treegrid-control',
					data: function (item) {
						if (item.children) {
							return '<span class="fa fa-chevron-right" aria-hidden="true"></span>';
						}
						return '';
					},
					width: 20
				},
				{
					title: 'Name',
					data: 'title',
				},
				{
					title: 'Position',
					data: 'position',
					}
        ],
			'treeGrid': {
				left: 10,
				expandIcon: '<span class="fa fa-chevron-right" aria-hidden="true"></span>',
				collapseIcon: '<span class="fa fa-chevron-down" aria-hidden="true"></span>'
			}
		});

	}

	var component = {
		viewModel: treegridManager,
		template: view
	};

	ko.components.register('treegrid-manager', component);
	return component;
});
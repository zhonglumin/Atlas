define(['knockout', 'jquery', 'text!./slickgrid-manager.html', 'appConfig', 'jquery-ui', 'dragevent', 'dropevent', 'slickcore', 'slickgrid', 'slickdataview', 'css!styles/slick.grid.css', 'css!styles/slick-default-theme.css'], function (ko, $, view, config) {

	function slickgridManager(params) {
		var self = this;

		self.TaskNameFormatter = function (row, cell, value, columnDef, dataContext) {
			value = value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
			var spacer = "<span style='display:inline-block;height:1px;width:" + (15 * dataContext["indent"]) + "px'></span>";
			var idx = self.dataView.getIdxById(dataContext.id);
			if (self.data[idx + 1] && self.data[idx + 1].indent > self.data[idx].indent) {
				if (dataContext._collapsed) {
					return spacer + " <span class='toggle fa fa-plus'></span>&nbsp;" + value;
				} else {
					return spacer + " <span class='toggle fa fa-minus'></span>&nbsp;" + value;
				}
			} else {
				return spacer + " <span class='toggle'></span>&nbsp;" + value;
			}
		};

		self.data = [];
		self.columns = [
			{
				id: "title",
				name: "Title",
				field: "title",
				width: 220,
				cssClass: "cell-title",
				formatter: self.TaskNameFormatter
			},
			{
				id: "value",
				name: "Value",
				field: "value",
				sortable: true
			}
		];

		self.options = {
			editable: false,
			enableAddRow: false,
			enableCellNavigation: false,
			asyncEditorLoading: false,
			autoHeight: true
		};

		self.searchString = "";

		function myFilter(item) {
			if (self.searchString != "" && item["title"].indexOf(self.searchString) == -1) {
				return false;
			}
			if (item.parent != null) {
				var parent = self.data[item.parent];
				while (parent) {
					if (parent._collapsed || (self.searchString != "" && parent["title"].indexOf(self.searchString) == -1)) {
						return false;
					}
					parent = self.data[parent.parent];
				}
			}
			return true;
		};

		var indent = 0;
		var parents = [];

		// prepare the data
		for (var i = 0; i < 1000; i++) {
			var d = (self.data[i] = {});
			var parent;
			if (Math.random() > 0.8 && i > 0) {
				indent++;
				parents.push(i - 1);
			} else if (Math.random() < 0.3 && indent > 0) {
				indent--;
				parents.pop();
			}

			if (parents.length > 0) {
				parent = parents[parents.length - 1];
			} else {
				parent = null;
			}
			d["id"] = "id_" + i;
			d["indent"] = indent;
			d["parent"] = parent;
			d["title"] = "Task " + i;
			d["value"] = i;
		}

		// initialize the model
		self.dataView = new Slick.Data.DataView();

		// initialize the grid
		self.grid = new Slick.Grid("#testgrid", self.dataView, self.columns, self.options);

		// wire up model events to drive the grid
		self.dataView.onRowCountChanged.subscribe(function (e, args) {
			self.grid.updateRowCount();
			self.grid.render();
		});

		self.dataView.onRowsChanged.subscribe(function (e, args) {
			self.grid.invalidateRows(args.rows);
			self.grid.render();
		});

		self.dataView.beginUpdate();
		self.dataView.setItems(self.data);
		self.dataView.setFilter(myFilter);
		self.dataView.endUpdate();

		self.grid.onClick.subscribe(function (e, args) {
			if ($(e.target).hasClass("toggle")) {
				var item = self.dataView.getItem(args.row);
				if (item) {
					if (!item._collapsed) {
						item._collapsed = true;
					} else {
						item._collapsed = false;
					}
					self.dataView.updateItem(item.id, item);
				}
				e.stopImmediatePropagation();
			}
		});

		var h_runfilters = null;

		// wire up the search textbox to apply the filter to the model
		$("#txtSearch").keyup(function (e) {
			Slick.GlobalEditorLock.cancelCurrentEdit();
			// clear on Esc
			if (e.which == 27) {
				this.value = "";
			}
			searchString = this.value;
			self.dataView.refresh();
		});

		self.grid.onSort.subscribe(function (e, args) {
			console.log(e);
			console.log(args);
		});
	}

	var component = {
		viewModel: slickgridManager,
		template: view
	};

	ko.components.register('slickgrid-manager', component);
	return component;
});
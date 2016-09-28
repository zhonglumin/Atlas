define(['knockout', 'text!./sptest.html','lodash','ohdsi.util','databindings/d3ChartBinding','components/faceted-datatable-cf',], 
			 function (ko, view, _, util) {
	var getData = _.once(function(self) {
		var request = util.cachedAjax({
			url: self.jsonFile,
			method: 'GET',
			contentType: 'application/json',
			error: function (err) {
				console.log(err);
			},
			success: function (data) {
				var pdata = self.dataSetup(data);
				var chart = self.chartObj();
				//chart.render(pdata, self.domElement(), 460, 150, self.chartOptions);
				//self.chartData(pdata);
				self.chartData(pdata.slice(0,2000));
				//setTimeout(() => self.chartData(pdata.slice(0,1000)), 2000);
			}
		});
	});
	function sptest(params) {
		var self = this;
		self.model = params.model;
		var filters = {};
		self.jsonFile = 'js/sptest/sample.json';

		self.chartObj = ko.observable();
		self.domElement = ko.observable();
		self.chartData = ko.observableArray(self.chartData && self.chartData() || []);
		self.sharedCrossfilter = ko.observable(new util.SharedCrossfilter([]));
		window.scf = self.sharedCrossfilter();
		self.chartData.subscribe(function(recs) {
			recs.forEach((d,i) => d._id = i);
			self.sharedCrossfilter().replaceData(recs);
		});
		self.recId = d=>d._id;
		$(self.sharedCrossfilter()).on('filterEvt', function(evt, stuff) {
			//console.log("filter in sharedCrossfilter", stuff);
		});
		$(self.sharedCrossfilter()).on('newData', function(evt, stuff) {
			//console.log("new data in sharedCrossfilter; shouldn't happen much", stuff);
		});
		self.chartResolution = ko.observable(); // junk
		self.jqEventSpace = params.jqEventSpace || {};
		self.fields = ko.observable([]);
		self.chartObj.subscribe(function(chart) {
		});
		self.ready = ko.computed(function() {
			return  self.chartObj() && 
							self.chartData().length && 
							self.domElement() 
							//&& self.pillMode() === 'balance';
		});
		self.chartOptions = chartOptions();
		self.ready.subscribe(function(ready) {
			if (ready) {
				initializeBalanceComponents();
			}
		});
		var initializeBalanceComponents = _.once(function() {
			var opts = _.merge(self.chartObj().defaultOptions, self.chartOptions);
			var fields = _.chain(opts)
										.toPairs()
										.sortBy(d=>_.has(d[1], 'bindOrder') ? d[1].bindOrder : 1000)
										.filter(d=>d[1].isField)
										.map(([name,opt] = []) => {
											if (!(opt instanceof util.Field)) {
												opt = new util.Field(name, opt, opts);
											}
											opt.bindParams({data:self.chartData()}, false);
											return opts[name] = opt;
										})
										.value();
			self.fields(fields);
			self.chartObj().chartSetup(self.domElement(), 460, 150, opts, fields, self.recId);
			self.chartObj().render(self.chartData(), self.domElement(), 460, 150, opts);
			self.sharedCrossfilter().dimField('xy', opts.xy);
			if (util.hasState('filters.brush')) {
				$(self.jqEventSpace).trigger('brush', [util.getState('filters.brush')]);
			}
			/*  for coming back to tab
			self.pillMode.subscribe(function(pillMode) {
				if (pillMode === 'balance')
					self.chartObj().render(self.chartData(), self.domElement(), 460, 150, opts);
			});
			*/
			//self.chartOptions.xy.accessor = self.chartOptions.xy.accessors.value;
		});
		$(self.jqEventSpace).on('brush', function(evt, {empty, x1,x2,y1,y2} = {}) {
				//console.log('brush event', arguments);
				var xyFilt;
				if (empty) {
					xyFilt = null;
					util.deleteState('filters.brush');
				} else {
					xyFilt = ([x,y] = [], i) => {
																				return x >= x1 &&
																								x <= x2 &&
																								y >= y1 &&
																								y <= y2;
																			};
					util.setState('filters.brush', {x1,x2,y1,y2});
				}
				self.sharedCrossfilter().filter('xy', xyFilt, 
						{source:'brush', x1, x2, y1, y2, empty});
			});
		$(self.sharedCrossfilter()).on('filterEvt',
			function(evt, {dimField, source, x1, x2, y1, y2, empty, waitForMore} = {}) {
				console.log("what if we have a brush and a facet filter?");
				if (source === 'brush') {
					// scatter has already zoomed.
					if (empty) {
						self.chartObj().cp.x.setZoomScale();
						self.chartObj().cp.y.setZoomScale();
					} else {
						self.chartObj().cp.x.setZoomScale([x1,x2]);
						self.chartObj().cp.y.setZoomScale([y1,y2]);
					}
					//self.chartObj().updateData(self.sharedCrossfilter().dimRecs('xy'));
					self.chartObj().updateData(self.sharedCrossfilter().groupAll.value());
				} else {
					if (!waitForMore || waitForMore === 'done') {
						self.chartObj().updateData(self.sharedCrossfilter().filteredRecs());
					}
				}
			});
		self.dataSetup = function(vectors) {
			/* sample:
				{                               
					"covariateId": [     13,     14...
					"covariateName": [ "Age group: 1...
					"beforeMatchingMeanTreated": [ 0...
					"beforeMatchingMeanComparator": ...
					"beforeMatchingSumTreated": [ 10...
					...
					}
				*/
			var arr = [];
			var names = _.keys(vectors);
			for (var i=0; i<vectors[names[0]].length; i++) {
				var obj = {};
				names.forEach(name => obj[name] = vectors[name][i]);
				arr.push(obj);
			}
			return arr;
		};
		getData(self);
	}

	var component = {
		viewModel: sptest,
		template: view
	};

	ko.components.register('sptest', component);
	window.nthroot = function(x, n) {
		try {
			var negate = n % 2 == 1 && x < 0;
			if(negate)
				x = -x;
			var possible = Math.pow(x, 1 / n);
			n = Math.pow(possible, n);
			if(Math.abs(x - n) < 1 && (x > 0 == n > 0))
				return negate ? -possible : possible;
		} catch(e){}
	}
	return component;
	function round(num, dec) {
		return Math.round(num * Math.pow(10, dec))/Math.pow(10,dec);
	}
	function chartOptions() {
		var junk = 1;
		return {
			lines: [
				{
						name: 'x = .1',
						x1: () => .1,
						x2: () => .1,
						y1: (xdom, ydom) => ydom[0],
						y2: (xdom, ydom) => ydom[1],
						/*
						styles: {
							stroke:'#003142',
							'stroke-width': 0.3,
						}
						attrs: {
							'class': 'xref refline',
						}
						*/
					 classes: ['xref'],
				},
				{
						name: 'y = .1',
						y1: () => .01,
						y2: () => .01,
						x1: (xdom, ydom) => xdom[0],
						x2: (xdom, ydom) => xdom[1],
					 classes: ['yref'],
				},
				{
						name: 'y = x',
						x1: (xdom, ydom) => Math.max(xdom[0],ydom[0]),
						y1: (xdom, ydom) => Math.max(xdom[0],ydom[0]),
						x2: (xdom, ydom) => Math.max(xdom[1],ydom[1]),
						y2: (xdom, ydom) => Math.max(xdom[1],ydom[1]),
					 classes: ['diag'],
				},
			],
			//dispatch: d3.dispatch("brush", "filter"), // in default opts for zoomScatter
			//additionalDispatchEvents: ["foo"],
			covariateName: {
						propName: 'covariateName',
						value: d => {
							return d.covariateName.split(/:/).shift();
						},
						isColumn: true,
						isFacet: true,
						colIdx: 0,
						tooltipOrder: 7,
						label: 'Covariate Name',
						isField: true,
						bindOrder: 1,
			},
			covariateValue: {
						propName: 'covariateName',
						value: d => d.covariateName.split(/:/).pop(),
						isColumn: true,
						colIdx: 0,
						tooltipOrder: 8,
						label: 'Covariate Value',
						isField: true,
			},
			series: {
						sortBy:  d => d.afterMatchingStdDiff,
						tooltipOrder: 5,
						isField: true,
						_accessors: {
							value: {
												func: function(d,allFields) {
													return allFields.covariateName.accessor(d);
												},
												posParams: ['d','allFields'],
							},
						},
						bindOrder: 2,
			},
			x: {
						//value: d=>d.beforeMatchingStdDiff,
						label: 'Before matching StdDiff',
						tooltipOrder: 1,
						propName: 'beforeMatchingStdDiff',
						isColumn: true,
						colIdx: 1,
						isField: true,
			},
			y: {
						value: d=>d.afterMatchingStdDiff,
						label: "After matching StdDiff",
						/*
						format: d => {
							var str = d.toString();
							var idx = str.indexOf('.');
							if (idx == -1) {
								return d3.format('0%')(d);
							}

							var precision = (str.length - (idx+1) - 2).toString();
							return d3.format('0.' + precision + '%')(d);
						},
						*/
						tooltipOrder: 2,
						propName: 'afterMatchingStdDiff',
						isColumn: true,
						colIdx: 1,
						isField: true,
			},
			xy: { // for brushing
						_accessors: {
							value: {
								func: function(d,allFields) {
									return [
													allFields.x.accessor(d),
													allFields.y.accessor(d)];
								},
								posParams: ['d','allFields'],
							},
						},
						isField: true,
			},
			size: {
						propName: 'afterMatchingMeanTreated',
						//scale: d3.scale.log(),
						label: "After matching mean treated",
						tooltipOrder: 3,
						isField: true,
						_accessors: {
							avg: {
								posParams: ['data','thisField'],
								func: (data, thisField) => {
									thisField._avg = d3.mean(data.map(thisField.accessor));
								},
								runOnGenerate: true,
							},
							tooltip: {
								posParams: ['d','thisField'],
								func: (d, thisField) => {
									return {
										name: `After matching mean treated 
														(avg: ${round(thisField._avg,4)})`,
										value: round(thisField.accessor(d), 4),
									}
								},
							},
							range: {
								func: () => [1,8],
							},
						},
			},
			/* i've got four colors, three shapes, now trying to add 2 fill choices (filled or white)
			 * but i have 22 covariate names, which determine series, and series is
			 * used for color and shape, so a lot of covariate names share same color
			 * and shape (i think) because of how they cycle through the choices
			 * so combine color/shape/fill into one dimension with more unique choices
			 * and derive color, shape, and fill from that
			 *
			 * also...like x/y, accessor for these dims returns the *domain* value,
			 * not the range -- so x.accessor(d) returns d.beforeMatchingStdDiff and it's
			 * left to the chart code to pass that value to x.scale and get back
			 * a pixel value; and similarly, color/shape accessors return the 
			 * d.covariateName instead of an actual color or shape, and the chart
			 * uses that to look up color/shape from the corresponding scale.
			 * but maybe color/shape/fill accessors should actually return color, shape,
			 * and fill. (if i make this change to sptest, it will break balance chart
			 * unless i fix it there)
			 */
			fillShapeColor: {
						bindOrder: 4,
						isField: true,
						needsScale: true,
						accessorDependsOnScale: true,
						_accessors: {
							value: {
												func: function(d,i,j,allFields,data,series,thisField) {
													return thisField.scale(
																	allFields.series.accessor(d,i,j,data,series));
												},
												posParams: ['d','i','j','allFields','data','series','thisField'],
							},
							domain: { // necessary so scale autogenerate doesn't try to use d3.extent
												func: function(data, series, allFields) {
													return (_.chain(data).groupBy(allFields.series.accessor)
																		.toPairs().sortBy(d=>-d[1].length).map(0).value());
												},
												posParams: ['data', 'series', 'allFields'],
							},
							range: {
								func: () => cartesianProduct(
																['empty','filled'],
																util.shapePath("types"),
																['red', 'green', 'orange', 'blue']),
							},
						},
						label: "Covariate name (color/shape/fill)",
						scale: d3.scale.ordinal(),
			},
			color: {
						bindOrder: 10,
						_accessors: {
							value: {
												func: function(d,i,j,allFields,data,series) {
													return allFields.fillShapeColor.scale(
																		allFields.series.accessor(d,i,j,data,series))[2];
												},
												posParams: ['d','i','j','allFields','data','series'],
							},
						},
						label: "Covariate name (color)",
						isField: true,
						needsScale: false,
			},
			shape: {
						bindOrder: 10,
						label: "Covariate name (shape)",
						tooltipOrder: 4,
						isField: true,
						needsScale: false,
						_accessors: {
							value: {
												func: function(d,i,j,allFields,data,series) {
													return allFields.fillShapeColor.scale(
																		allFields.series.accessor(d,i,j,data,series))[1];
												},
												posParams: ['d','i','j','allFields','data','series'],
							},
						},
			},
			fill: {
						bindOrder: 10,
						label: "Covariate name (fill)",
						isField: true,
						_accessors: {
							value: {
												func: function(d,i,j,allFields,data,series) {
													var filled = allFields.fillShapeColor.scale(
																		allFields.series.accessor(d,i,j,data,series))[0];
													if (filled === 'filled') {
														return allFields.fillShapeColor.scale(
																			allFields.series.accessor(d,i,j,data,series))[2];
													} else {
														return 'white';
													}
												},
												posParams: ['d','i','j','allFields','data','series'],
							},
						},
			},
			CIup: { // support CI in both directions
						value: d => d.upperBound,
						value: d => y(d) - d.upperBoundDiff,
			},
			conceptId: {
						propName: 'conceptId',
						isColumn: true,
						isFacet: true,
						colIdx: 3,
						tooltipOrder: 5,
						label: 'Concept ID',
						needsValueFunc: true, // so ChartProps will make one
																	// even though this isn't a normal
																	// zoomScatter field
						isField: true,
			},
			analysisId: {
						propName: 'analysisId',
						isColumn: true,
						isFacet: true,
						colIdx: 4,
						tooltipOrder: 6,
						label: 'Analysis ID',
						isField: true,
			},
		};
	}
	function cartesianProduct(...arrays) {
		//https://gist.github.com/hu9o/f4e80ed4b036fd76c31ef33dc5b32601
		function _inner(...args) {
			if (arguments.length > 1) {
				let arr2 = args.pop(); // arr of arrs of elems
				let arr1 = args.pop(); // arr of elems
				return _inner(...args,
					arr1.map(e1 => arr2.map(e2 => [e1, ...e2]))
							.reduce((arr, e) => arr.concat(e), []));
			} else {
				return args[0];
			}
		};
		return _inner(...arrays, [[]]);
	};
});

define(['knockout', 'jquery', 'text!./plp-manager.html', 'appConfig', 'd3', 'ohdsi.util', 'plp/PatientLevelPredictionAnalysis', 'clipboard'], function (ko, $, view, appConfig, d3, ohdsiUtil, PatientLevelPredictionAnalysis, clipboard) {
	function plpManager(params) {
		//console.log("manager:" + params.model.currentModelId());
		var self = this;
		self.cohortComparisonId = params.currentPatientLevelPredictionId;
		self.cohortComparison = params.currentPatientLevelPrediction;
		self.cohortComparisonDirtyFlag = params.dirtyFlag;
		self.loading = ko.observable(true);

		self.tabMode = ko.observable('specification');
		self.appConfig = appConfig;
		self.performanceTabMode = ko.observable('discrimination');
		self.expressionMode = ko.observable('print');

		self.copyToClipboard = function (element) {
			var currentClipboard = new clipboard('#btnCopyToClipboard');

			currentClipboard.on('success', function (e) {
				console.log('Copied to clipboard');
				e.clearSelection();
				$('#copyToClipboardMessage').fadeIn();
				setTimeout(function () {
					$('#copyToClipboardMessage').fadeOut();
				}, 1500);
			});

			currentClipboard.on('error', function (e) {
				console.log('Error copying to clipboard');
				console.log(e);
			});
		}

		self.canSave = ko.pureComputed(function () {
			return (self.cohortComparison().name() && self.cohortComparison().treatmentId() && self.cohortComparison().treatmentId() > 0 && self.cohortComparison().outcomeId() && self.cohortComparison().outcomeId() > 0 && self.cohortComparison().modelType && self.cohortComparison().modelType() > 0 && self.cohortComparisonDirtyFlag() && self.cohortComparisonDirtyFlag().isDirty());
		});

		self.canDelete = ko.pureComputed(function () {
			return (self.cohortComparisonId() && self.cohortComparisonId() > 0);
		});

		self.delete = function () {
			if (!confirm("Delete estimation specification? Warning: deletion can not be undone!"))
				return;
			console.warn("DELETE NOT IMPLEMENTED!");

			/*
						$.ajax({
							url: config.services[0].url + 'comparativecohortanalysis/' + self.cohortComparisonId(),
							method: 'DELETE',
							error: function (error) {
								console.log("Error: " + error);
								authApi.handleAccessDenied(error);
							},
							success: function (data) {
								document.location = "#/estimation"
							}
						});
			*/
		}

		self.save = function () {
			console.warn("SAVE NOT IMPLEMENTED!");

			/*				var cca = {
								analysisId: self.cohortComparison().analysisId || null,
								name: self.cohortComparison().name(),
								treatmentId: self.cohortComparison().treatmentId(),
								comparatorId: self.cohortComparison().comparatorId(),
								outcomeId: self.cohortComparison().outcomeId(),
								modelType: self.cohortComparison().modelType(),
								timeAtRiskStart: self.cohortComparison().timeAtRiskStart(),
								timeAtRiskEnd: self.cohortComparison().timeAtRiskEnd(),
								addExposureDaysToEnd: self.cohortComparison().addExposureDaysToEnd(),
								minimumWashoutPeriod: self.cohortComparison().minimumWashoutPeriod(),
								minimumDaysAtRisk: self.cohortComparison().minimumDaysAtRisk(),
								rmSubjectsInBothCohorts: self.cohortComparison().rmSubjectsInBothCohorts(),
								rmPriorOutcomes: self.cohortComparison().rmPriorOutcomes(),
								psAdjustment: self.cohortComparison().psAdjustment(),
								psExclusionId: self.cohortComparison().psExclusionId(),
								psInclusionId: self.cohortComparison().psInclusionId(),
								psDemographics: self.cohortComparison().psDemographics() | 0,
								psDemographicsGender: self.cohortComparison().psDemographicsGender() | 0,
								psDemographicsRace: self.cohortComparison().psDemographicsRace() | 0,
								psDemographicsEthnicity: self.cohortComparison().psDemographicsEthnicity() | 0,
								psDemographicsAge: self.cohortComparison().psDemographicsAge() | 0,
								psDemographicsYear: self.cohortComparison().psDemographicsYear() | 0,
								psDemographicsMonth: self.cohortComparison().psDemographicsMonth() | 0,
								psTrim: self.cohortComparison().psTrim(),
								psTrimFraction: self.cohortComparison().psTrimFraction(),
								psMatch: self.cohortComparison().psMatch(),
								psMatchMaxRatio: self.cohortComparison().psMatchMaxRatio(),
								psStrat: self.cohortComparison().psStrat() | 0,
								psStratNumStrata: self.cohortComparison().psStratNumStrata(),
								psConditionOcc: self.cohortComparison().psConditionOcc() | 0,
								psConditionOcc365d: self.cohortComparison().psConditionOcc365d() | 0,
								psConditionOcc30d: self.cohortComparison().psConditionOcc30d() | 0,
								psConditionOccInpt180d: self.cohortComparison().psConditionOccInpt180d() | 0,
								psConditionEra: self.cohortComparison().psConditionEra() | 0,
								psConditionEraEver: self.cohortComparison().psConditionEraEver() | 0,
								psConditionEraOverlap: self.cohortComparison().psConditionEraOverlap() | 0,
								psConditionGroup: self.cohortComparison().psConditionGroup() | 0,
								psConditionGroupMeddra: self.cohortComparison().psConditionGroupMeddra() | 0,
								psConditionGroupSnomed: self.cohortComparison().psConditionGroupSnomed() | 0,
								psDrugExposure: self.cohortComparison().psDrugExposure() | 0,
								psDrugExposure365d: self.cohortComparison().psDrugExposure365d() | 0,
								psDrugExposure30d: self.cohortComparison().psDrugExposure30d() | 0,
								psDrugEra: self.cohortComparison().psDrugEra() | 0,
								psDrugEra365d: self.cohortComparison().psDrugEra365d() | 0,
								psDrugEra30d: self.cohortComparison().psDrugEra30d() | 0,
								psDrugEraOverlap: self.cohortComparison().psDrugEraOverlap() | 0,
								psDrugEraEver: self.cohortComparison().psDrugEraEver() | 0,
								psDrugGroup: self.cohortComparison().psDrugGroup() | 0,
								psProcedureOcc: self.cohortComparison().psProcedureOcc() | 0,
								psProcedureOcc365d: self.cohortComparison().psProcedureOcc365d() | 0,
								psProcedureOcc30d: self.cohortComparison().psProcedureOcc30d() | 0,
								psProcedureGroup: self.cohortComparison().psProcedureGroup() | 0,
								psObservation: self.cohortComparison().psObservation() | 0,
								psObservation365d: self.cohortComparison().psObservation365d() | 0,
								psObservation30d: self.cohortComparison().psObservation30d() | 0,
								psObservationCount365d: self.cohortComparison().psObservationCount365d() | 0,
								psMeasurement: self.cohortComparison().psMeasurement() | 0,
								psMeasurement365d: self.cohortComparison().psMeasurement365d() | 0,
								psMeasurement30d: self.cohortComparison().psMeasurement30d() | 0,
								psMeasurementCount365d: self.cohortComparison().psMeasurementCount365d() | 0,
								psMeasurementBelow: self.cohortComparison().psMeasurementBelow() | 0,
								psMeasurementAbove: self.cohortComparison().psMeasurementAbove() | 0,
								psConceptCounts: self.cohortComparison().psConceptCounts() | 0,
								psRiskScores: self.cohortComparison().psRiskScores() | 0,
								psRiskScoresCharlson: self.cohortComparison().psRiskScoresCharlson() | 0,
								psRiskScoresDcsi: self.cohortComparison().psRiskScoresDcsi() | 0,
								psRiskScoresChads2: self.cohortComparison().psRiskScoresChads2() | 0,
								psRiskScoresChads2vasc: self.cohortComparison().psRiskScoresChads2vasc() | 0,
								psInteractionYear: self.cohortComparison().psInteractionYear() | 0,
								psInteractionMonth: self.cohortComparison().psInteractionMonth() | 0,
								omCovariates: self.cohortComparison().omCovariates(),
								omExclusionId: self.cohortComparison().omExclusionId(),
								omInclusionId: self.cohortComparison().omInclusionId(),
								omDemographics: self.cohortComparison().omDemographics() | 0,
								omDemographicsGender: self.cohortComparison().omDemographicsGender() | 0,
								omDemographicsRace: self.cohortComparison().omDemographicsRace() | 0,
								omDemographicsEthnicity: self.cohortComparison().omDemographicsEthnicity() | 0,
								omDemographicsAge: self.cohortComparison().omDemographicsAge() | 0,
								omDemographicsYear: self.cohortComparison().omDemographicsYear() | 0,
								omDemographicsMonth: self.cohortComparison().omDemographicsMonth() | 0,
								omTrim: self.cohortComparison().omTrim(),
								omTrimFraction: self.cohortComparison().omTrimFraction(),
								omMatch: self.cohortComparison().omMatch(),
								omMatchMaxRatio: self.cohortComparison().omMatchMaxRatio(),
								omStrat: self.cohortComparison().omStrat() | 0,
								omStratNumStrata: self.cohortComparison().omStratNumStrata(),
								omConditionOcc: self.cohortComparison().omConditionOcc() | 0,
								omConditionOcc365d: self.cohortComparison().omConditionOcc365d() | 0,
								omConditionOcc30d: self.cohortComparison().omConditionOcc30d() | 0,
								omConditionOccInpt180d: self.cohortComparison().omConditionOccInpt180d() | 0,
								omConditionEra: self.cohortComparison().omConditionEra() | 0,
								omConditionEraEver: self.cohortComparison().omConditionEraEver() | 0,
								omConditionEraOverlap: self.cohortComparison().omConditionEraOverlap() | 0,
								omConditionGroup: self.cohortComparison().omConditionGroup() | 0,
								omConditionGroupMeddra: self.cohortComparison().omConditionGroupMeddra() | 0,
								omConditionGroupSnomed: self.cohortComparison().omConditionGroupSnomed() | 0,
								omDrugExposure: self.cohortComparison().omDrugExposure() | 0,
								omDrugExposure365d: self.cohortComparison().omDrugExposure365d() | 0,
								omDrugExposure30d: self.cohortComparison().omDrugExposure30d() | 0,
								omDrugEra: self.cohortComparison().omDrugEra() | 0,
								omDrugEra365d: self.cohortComparison().omDrugEra365d() | 0,
								omDrugEra30d: self.cohortComparison().omDrugEra30d() | 0,
								omDrugEraOverlap: self.cohortComparison().omDrugEraOverlap() | 0,
								omDrugEraEver: self.cohortComparison().omDrugEraEver() | 0,
								omDrugGroup: self.cohortComparison().omDrugGroup() | 0,
								omProcedureOcc: self.cohortComparison().omProcedureOcc() | 0,
								omProcedureOcc365d: self.cohortComparison().omProcedureOcc365d() | 0,
								omProcedureOcc30d: self.cohortComparison().omProcedureOcc30d() | 0,
								omProcedureGroup: self.cohortComparison().omProcedureGroup() | 0,
								omObservation: self.cohortComparison().omObservation() | 0,
								omObservation365d: self.cohortComparison().omObservation365d() | 0,
								omObservation30d: self.cohortComparison().omObservation30d() | 0,
								omObservationCount365d: self.cohortComparison().omObservationCount365d() | 0,
								omMeasurement: self.cohortComparison().omMeasurement() | 0,
								omMeasurement365d: self.cohortComparison().omMeasurement365d() | 0,
								omMeasurement30d: self.cohortComparison().omMeasurement30d() | 0,
								omMeasurementCount365d: self.cohortComparison().omMeasurementCount365d() | 0,
								omMeasurementBelow: self.cohortComparison().omMeasurementBelow() | 0,
								omMeasurementAbove: self.cohortComparison().omMeasurementAbove() | 0,
								omConceptCounts: self.cohortComparison().omConceptCounts() | 0,
								omRiskScores: self.cohortComparison().omRiskScores() | 0,
								omRiskScoresCharlson: self.cohortComparison().omRiskScoresCharlson() | 0,
								omRiskScoresDcsi: self.cohortComparison().omRiskScoresDcsi() | 0,
								omRiskScoresChads2: self.cohortComparison().omRiskScoresChads2() | 0,
								omRiskScoresChads2vasc: self.cohortComparison().omRiskScoresChads2vasc() | 0,
								omInteractionYear: self.cohortComparison().omInteractionYear() | 0,
								omInteractionMonth: self.cohortComparison().omInteractionMonth() | 0,
								delCovariatesSmallCount: self.cohortComparison().delCovariatesSmallCount(),
								negativeControlId: self.cohortComparison().negativeControlId()
							};

							var json = JSON.stringify(cca);

							var savePromise = ohdsiUtil.cachedAjax({
								method: self.cohortComparisonId() ? 'PUT' : 'POST',
								url: config.services[0].url + 'comparativecohortanalysis/' + (self.cohortComparisonId() || ''),
								contentType: 'application/json',
								data: json,
								dataType: 'json',
								success: function (data) {}
							});

							savePromise.then(function (saveResult) {
								var redirectWhenComplete = saveResult.analysisId != self.cohortComparison().analysisId;
								self.cohortComparisonId(saveResult.analysisId);
								self.cohortComparison().analysisId = saveResult.analysisId;
								if (redirectWhenComplete) {
									document.location = "#/estimation/" + self.cohortComparisonId();
								}
								self.cohortComparisonDirtyFlag().reset();
								self.cohortComparison.valueHasMutated();
								console.log(saveResult);
							});*/
		}

		self.close = function () {
			if (self.cohortComparisonDirtyFlag().isDirty() && !confirm("Patient level prediction changes are not saved. Would you like to continue?")) {
				return;
			}
			self.cohortComparison(null);
			self.cohortComparisonId(null);
			self.cohortComparisonDirtyFlag(new ohdsiUtil.dirtyFlag(self.cohortComparison()));
			document.location = '#/plp';
		}

		self.newCohortComparison = function () {
			self.cohortComparison(new PatientLevelPredictionAnalysis());
			// The PatientLevelPredictionAnalysis module is pretty big - use the setTimeout({}, 0) 
			// to allow the event loop to catch up.
			// http://stackoverflow.com/questions/779379/why-is-settimeoutfn-0-sometimes-useful
			setTimeout(function () {
				self.cohortComparisonDirtyFlag(new ohdsiUtil.dirtyFlag(self.cohortComparison()));
			}, 0);
		}

		self.loadCohortComparison = function () {
			console.warn("Not implemented!")
			self.newCohortComparison(); // Temporary to get this working w/out WebAPI
			/*
							// load cca
							ohdsiUtil.cachedAjax({
								url: config.services[0].url + 'comparativecohortanalysis/' + self.cohortComparisonId(),
								method: 'GET',
								contentType: 'application/json',
								success: function (comparativeCohortAnalysis) {
									self.cohortComparison(new ComparativeCohortAnalysis(comparativeCohortAnalysis));
									setTimeout(function () {
										self.cohortComparisonDirtyFlag(new ohdsiUtil.dirtyFlag(self.cohortComparison()));
									}, 0);
								}
							});
			*/
		}

		// startup actions
		if (self.cohortComparisonId() == 0 && self.cohortComparison() == null) {
			self.newCohortComparison();
			self.loading(false);
		} else if (self.cohortComparisonId() > 0 && self.cohortComparisonId() != (self.cohortComparison() && self.cohortComparison().analysisId)) {
			self.loadCohortComparison();
			self.loading(false);
		} else {
			// already loaded
			self.loading(false);
		}
	}

	var component = {
		viewModel: plpManager,
		template: view
	};

	ko.components.register('plp-manager', component);
	return component;

});

define(['jquery', 'knockout', 'text!./plp-spec-editor.html', 'clipboard',
				'webapi/CohortDefinitionAPI', 'appConfig', 'ohdsi.util',
				'plp/PatientLevelPredictionAnalysis', 'cohortbuilder/options',
				'cohortbuilder/CohortDefinition', 'vocabularyprovider',
				'conceptsetbuilder/InputTypes/ConceptSet'],
	function ($, ko, view, clipboard, cohortDefinitionAPI, config, ohdsiUtil,
		PatientLevelPredictionAnalysis, options, CohortDefinition, vocabularyAPI,
		ConceptSet) {
		function plpSpecEditor(params) {
			var self = this;
			self.cohortComparison = params.patientLevelPredictionAnalysis;
			self.cohortComparisonDirtyFlag = params.dirtyFlag;
			self.options = options;

			self.cohortSelected = function (id) {
				$('#modalCohortDefinition').modal('hide');
				cohortDefinitionAPI.getCohortDefinition(id).then(function (cohortDefinition) {
					self.targetId(cohortDefinition.id);
					self.targetCaption(cohortDefinition.name);
					cohortDefinition.expression = JSON.parse(cohortDefinition.expression);
					self.targetCohortDefinition(new CohortDefinition(cohortDefinition));
				});
			}

			self.chooseTreatment = function () {
				$('#modalCohortDefinition').modal('show');
				self.targetId = self.cohortComparison().treatmentId;
				self.targetCaption = self.cohortComparison().treatmentCaption;
				self.targetCohortDefinition = self.cohortComparison().treatmentCohortDefinition;
			}

			self.chooseOutcome = function () {
				$('#modalCohortDefinition').modal('show');
				self.targetId = self.cohortComparison().outcomeId;
				self.targetCaption = self.cohortComparison().outcomeCaption;
				self.targetCohortDefinition = self.cohortComparison().outcomeCohortDefinition;
			}

			self.clearTreatment = function () {
				self.cohortComparison().treatmentId(0);
				self.cohortComparison().treatmentCaption(null);
				self.cohortComparison().treatmentCohortDefinition(null);
			}

			self.clearOutcome = function () {
				self.cohortComparison().outcomeId(0);
				self.cohortComparison().outcomeCaption(null);
				self.cohortComparison().outcomeCohortDefinition(null);
			}
		}

		var component = {
			viewModel: plpSpecEditor,
			template: view
		};

		ko.components.register('plp-spec-editor', component);
		return component;

	}
);

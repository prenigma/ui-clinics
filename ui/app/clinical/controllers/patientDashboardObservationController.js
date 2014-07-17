angular.module('bahmni.clinical')
    .controller('PatientDashboardObservationController', ['$scope', '$stateParams', 'observationsService', '$q', 'spinner', '$rootScope', function ($scope, $stateParams, observationsService, $q, spinner, $rootScope) {
        $scope.patientSummary = {};
        $scope.patientUuid = $stateParams.patientUuid;

        var init = function () {
            $scope.visits = $rootScope.visits;
            $scope.activeVisit = $rootScope.activeVisit;
            createObservationSectionView();
        };

        var observationGroupingFunction = function (obs) {
            return Bahmni.Common.Util.DateUtil.getDateWithoutHours(obs.observationDateTime);
        };

        $scope.isText = function(obs){
            return isOfType(obs, 'Text');
        };

        var isOfType = function(obs, type){
            return obs.type === type;
        };

        var createObservationSectionView = function () {
            if ($scope.activeVisit) {
                spinner.forPromise(observationsService.fetch($scope.patientUuid, $scope.section.conceptNames, $scope.section.numberOfVisits).then(function(observations) {
                    var bahmniObservations = new Bahmni.ConceptSet.ObservationMapper().forView(observations.data);

                    $scope.patientSummary.data = new Bahmni.Clinical.ResultGrouper().group(bahmniObservations, observationGroupingFunction, 'obs', 'date');
                    if ($scope.patientSummary.data.length == 0) {
                        $scope.patientSummary.message = Bahmni.Clinical.Constants.messageForNoObservation;
                    }
                }));
            }
            else {
                $scope.patientSummary.message = Bahmni.Clinical.Constants.messageForNoObservation;
            }
        };

        init();

    }]);
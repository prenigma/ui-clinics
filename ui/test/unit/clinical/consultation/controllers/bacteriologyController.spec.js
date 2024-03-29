describe("Bacteriology Controller", function () {
    var $scope, rootScope, contextChangeHandler, spinner, conceptSetService;

    beforeEach(module('bahmni.clinical'));

    beforeEach(inject(function ($controller, $rootScope) {
        $scope = $rootScope.$new();
        $scope.consultation = {
            mdrtbSpecimen: [],
            preSaveHandler: new Bahmni.Clinical.Notifier(),
            postSaveHandler: new Bahmni.Clinical.Notifier()
        };
        rootScope = $rootScope;
        contextChangeHandler = {
            execute: function () {
                return {allow: true}
            }, reset: function () {
            }
        };

        var spinner = jasmine.createSpyObj('spinner', ['forPromise']);
        conceptSetService = jasmine.createSpyObj('conceptSetService', ['getConceptSetMembers']);
        contextChangeHandler = jasmine.createSpyObj('contextChangeHandler', ['add']);

        spinner.forPromise.and.callFake(function (param) {
            return {
                then: function () {
                    return {};
                }
            }
        });


        conceptSetService.getConceptSetMembers.and.returnValue({});

        $controller('BacteriologyController', {
            $scope: $scope,
            $rootScope: rootScope,
            contextChangeHandler: contextChangeHandler,
            spinner: spinner,
            conceptSetService: conceptSetService,
            bacteriologyConceptSet: {}
        });
    }));

    describe("Edit Specimen", function () {
        it("should add specimen to new specimens list", function () {
            var existingSpecimen = new Bahmni.Clinical.Specimen({
                existingObs: "Existing Obs Uuid",
                dateCollected: "2015-10-01T18:30:00.000Z",
                type: "Blood",
                identifier: "1234",
                sample: {
                    additionalAttributes: {}
                }
            });
            $scope.newSpecimens = [];

            $scope.editSpecimen(existingSpecimen);

            expect($scope.newSpecimens[0].existingObs).toBe(existingSpecimen.existingObs);
        });
    });

    describe("Delete Specimen", function () {
        it("should delete specimen from the existing specimen list", function () {
            var existingSpecimen = new Bahmni.Clinical.Specimen({
                existingObs: "Existing Obs Uuid",
                dateCollected: "2015-10-01T18:30:00.000Z",
                type: "Blood",
                identifier: "1234",
                sample: {
                    additionalAttributes: {}
                }
            });
            $scope.savedSpecimens = [existingSpecimen];

            $scope.deleteSpecimen(existingSpecimen);

            expect(existingSpecimen.voided).toBeTruthy();
        });
    });

    describe("Clear Specimen should clear out specimen from new Specimen list", function () {
        var newSpecimen1 = new Bahmni.Clinical.Specimen({
            dateCollected: "2015-10-01T18:30:00.000Z",
            type: "Urine",
            identifier: "1235",
            sample: {
                additionalAttributes: []
            }
        });

        it("should remove sample", function () {
            $scope.newSpecimens = [newSpecimen1];
            $scope.clearSpecimen(newSpecimen1);
            expect($scope.newSpecimens.length).toBe(1);
            expect($scope.newSpecimens[0].isEmpty()).toBeTruthy();
        });
    });
});
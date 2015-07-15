'use strict';

angular.module('bahmni.clinical')
    .controller('OrderController', ['$scope', 'allOrderables','ngDialog',
        function ($scope, allOrderables, ngDialog) {
            $scope.consultation.orders = $scope.consultation.orders || [];
            $scope.consultation.childOrders = $scope.consultation.childOrders || [];
            $scope.allOrdersTemplates = allOrderables;

            var init = function(){

                $scope.tabs = [];

                _.forEach($scope.allOrdersTemplates, function(item){
                    var conceptName = $scope.getName(item);
                    $scope.tabs.push({name: conceptName ? conceptName : item.name.name, topLevelConcept: item.name.name});
                });

                if($scope.tabs) {
                    $scope.activateTab($scope.tabs[0]);
                }
            };

            $scope.getConceptClassesInSet = function(conceptSet) {
                var conceptsWithUniqueClass = _.uniq(conceptSet? conceptSet.setMembers:[],function(concept){return concept.conceptClass.uuid;});
                var conceptClasses = [];
                _.forEach(conceptsWithUniqueClass, function(concept){
                    conceptClasses.push({name:concept.conceptClass.name, description: concept.conceptClass.description});
                });
                conceptClasses = _.sortBy(conceptClasses, 'name');
                return conceptClasses;
            };

            $scope.getOrderTemplate = function(templateName) {
                var key = '\''+templateName+'\'';
                return $scope.allOrdersTemplates[key];
            };

            $scope.updateSelectedOrdersForActiveTab = function(){
                var activeTabTestConcepts = _.pluck(_.flatten(_.pluck($scope.getOrderTemplate($scope.activeTab.name).setMembers, 'setMembers')), 'uuid');
                $scope.selectedOrders =  _.filter($scope.consultation.orders,function(order){
                       return _.indexOf(activeTabTestConcepts, order.concept.uuid) != -1;
                });
            };

            $scope.$watchCollection('consultation.orders', $scope.updateSelectedOrdersForActiveTab);

            var collapseExistingActiveSection = function(section){
                section && (section.klass="");
            };

            $scope.activateTab = function(tab){
                if(tab.klass=="active"){
                    tab.klass="";
                    $scope.activeTab = undefined;
                }
                else{
                    collapseExistingActiveSection($scope.activeTab);
                    $scope.activeTab = tab;
                    $scope.activeTab.klass="active";
                    $scope.updateSelectedOrdersForActiveTab();
                    showFirstLeftCategoryByDefault();
                }
            };

            var showFirstLeftCategoryByDefault = function(){
                if(!$scope.activeTab.leftCategory) {
                    var allCategories = $scope.getOrderTemplate($scope.activeTab.name).setMembers;
                    if (allCategories.length > 0)$scope.showLeftCategoryTests(allCategories[0]);
                }
            };

            $scope.showLeftCategoryTests = function(leftCategory) {
                collapseExistingActiveSection($scope.activeTab.leftCategory);
                $scope.activeTab.leftCategory = leftCategory;
                $scope.activeTab.leftCategory.klass = "active";

                $scope.activeTab.leftCategory.groups = $scope.getConceptClassesInSet(leftCategory);
            };

            $scope.diSelect = function(selectedOrder) {
                var order = _.find($scope.consultation.orders, function(order) {
                    return order.concept.uuid === selectedOrder.concept.uuid;
                });
                if (order.uuid) {
                    order.isDiscontinued = !order.isDiscontinued;
                    order.voided = !order.voided;
                }
                else {
                    removeOrder(order);
                }
                removeChildOrders(order);
            };

            $scope.openNotesPopup = function(order) {
                order.previousNote = order.commentToFulfiller;
                $scope.orderNoteText = order.previousNote;
                $scope.dialog = ngDialog.open({ template: 'consultation/views/orderNotes.html', className: 'selectedOrderNoteContainer-dialog ngdialog-theme-default', data: order, scope: $scope
                });
            };

            $scope.$on('ngDialog.opened', function (e, $dialog) {
                $('body').addClass('show-controller-back');
            });

            $scope.$on('ngDialog.closed', function (e, $dialog) {
                $('body').removeClass('show-controller-back');
            });


            $scope.setEditedFlag = function(order, orderNoteText){
               if(order.previousNote != orderNoteText){
                   order.commentToFulfiller = orderNoteText;
                   order.hasBeenModified = true;
               }
                $scope.closePopup();
            };

            $scope.closePopup = function(){
                ngDialog.close();
            };

            $scope.getName = function (sample) {
                var name = _.find(sample.names, {conceptNameType: "SHORT"}) || _.find(sample.names, {conceptNameType: "FULLY_SPECIFIED"});
                return name ? name.name : undefined;
            };

            var removeOrder = function(order){
                _.remove($scope.consultation.orders, function(o){
                    return o.concept.uuid == order.concept.uuid;
                });
            };

            var removeChildOrders = function (order) {
                if ($scope.activeTab.leftCategory.setMembers) {

                    var testAssociatedToOrder = _.find($scope.activeTab.leftCategory.setMembers, function(child){
                        return child.uuid == order.concept.uuid;
                    });

                    if(!testAssociatedToOrder || !testAssociatedToOrder.setMembers)
                        return;

                    _.forEach(testAssociatedToOrder.setMembers, function (test) {
                        _.remove($scope.consultation.childOrders, function (o) {
                            return o.uuid === test.uuid;
                        });
                    });
                }
            };

            init();

        }]);
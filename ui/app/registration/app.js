'use strict';

angular
    .module('registration', ['ui.router', 'bahmni.registration', 'authentication', 'bahmni.common.config', 'bahmni.common.appFramework', 
        'httpErrorInterceptor', 'bahmni.common.photoCapture', 'bahmni.common.obs', 'bahmni.common.displaycontrol.observation',  'bahmni.common.i18n', 'bahmni.common.displaycontrol.custom',
        'bahmni.common.routeErrorHandler', 'bahmni.common.displaycontrol.pivottable','RecursionHelper','ngSanitize', 'bahmni.common.uiHelper', 'bahmni.common.domain', 'ngDialog', 'pascalprecht.translate', 'ngCookies','monospaced.elastic'])
    .config(['$urlRouterProvider', '$stateProvider', '$httpProvider', '$bahmniTranslateProvider', function ($urlRouterProvider, $stateProvider, $httpProvider, $bahmniTranslateProvider) {
        $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
        $urlRouterProvider.otherwise('/search');
        $stateProvider
            .state('search', {
                url: '/search',
                reloadOnSearch: false,
                views: {
                    'layout': { templateUrl: 'views/layout.html', controller: 'SearchPatientController'},
                    'content@search': { templateUrl: 'views/search.html'}
                },
                resolve: { initialization: 'initialization' }
            })
            .state('newpatient', {
                url: '/patient/new',
                views: {
                    'layout': { templateUrl: 'views/layout.html', controller: 'CreatePatientController'},
                    'content@newpatient': { templateUrl: 'views/newpatient.html'}
                },
                resolve: { initialization: 'initialization' }
            })
            .state('patient', {
                url: '/patient/:patientUuid',
                abstract: true,
                views: {
                    'layout': { template: '<div ui-view="layout"></div>' }
                },
                resolve: {initialization: 'initialization'}
            })
            .state('patient.edit', {
                url: '?serverError',
                views: {
                    'layout': { templateUrl: 'views/layout.html', controller: 'EditPatientController'},
                    'content@patient.edit': { templateUrl: 'views/editpatient.html'},
                    'headerExtension@patient.edit': {template: '<div print-options></div>'}
                }
            })
            .state('patient.visit', {
                url: '/visit',
                views: {
                    'layout': { templateUrl: 'views/layout.html', controller: 'VisitController'},
                    'content@patient.visit': { templateUrl: 'views/visit.html'},
                    'headerExtension@patient.visit': {template: '<div print-options></div>'}
                }
            })
            .state('patient.printSticker', {
                url: '/printSticker',
                views: {
                    'layout': { templateUrl: 'views/layout.html'},
                    'content@patient.printSticker': { templateUrl: 'views/notimplemented.html'}
                }
            });
        $bahmniTranslateProvider.init({app: 'registration', shouldMerge: true});
    }]).run(function ($rootScope, $templateCache) {
        //Disable caching view template partials
        $rootScope.$on('$viewContentLoaded', function () {
                $templateCache.removeAll();
            }
        )
    });
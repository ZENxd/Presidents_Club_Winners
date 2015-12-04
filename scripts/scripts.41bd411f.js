'use strict';

/**
 * @ngdoc overview
 * @name presidentsClubApp
 * @description
 * # presidentsClubApp
 *
 * Main module of the application.
 */
angular.module('presidentsClubApp', [
        'ngAnimate',
        'ngCookies',
        'ngMessages',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch',
        'ui.mask'
    ])
    .config(function($routeProvider, $sceDelegateProvider, $httpProvider) {
        $httpProvider.useApplyAsync(true);
        $routeProvider
            .when('/', {
                templateUrl: 'views/home.html',
                controller: 'HomeCtrl',
                controllerAs: 'home'
            })
            .when('/overview', {
                templateUrl: 'views/overView.html',
                controller: 'OverViewCtrl',
                controllerAs: 'overView'
            })
            .when('/photobook', {
                templateUrl: 'views/photobook.html',
                controller: 'OverViewCtrl',
                controllerAs: 'overView'
            })
            .when('/tuxedo', {
                templateUrl: 'views/tuxedo.html',
                controller: 'OverViewCtrl',
                controllerAs: 'overView'
            })
            .when('/activities', {
                templateUrl: 'views/activities.html',
                controller: 'ActivitiesCtrl',
                controllerAs: 'activities'
            })
            .when('/faq', {
                templateUrl: 'views/faq.html',
                controller: 'FaqCtrl',
                controllerAs: 'faq'
            })
            .otherwise({
                redirectTo: '/'
            });
    });

'use strict';

/**
 * @ngdoc function
 * @name presidentsClubApp.controller:HomeCtrl
 * @description
 * # HomeCtrl
 * Controller of the presidentsClubApp
 */
angular.module('presidentsClubApp')
    .controller('HomeCtrl', ['$scope', '$rootScope', '$location', '$window', 
        function($scope, $rootScope, $location, $window) {

            $scope.next = function(path) {
                $location.path(path);
            };

            $scope.gotoUrl = function(url){
                $window.open(url, '_blank');
            };
        }
    ]);

'use strict';

/**
 * @ngdoc function
 * @name presidentsClubApp.controller:OverviewCtrl
 * @description
 * # OverviewCtrl
 * Controller of the presidentsClubApp
 */
angular.module('presidentsClubApp')
    .controller('OverViewCtrl', ['$scope', '$rootScope', '$location', 'photobookService', 'tuxedoService', 'winnerService', '$timeout', '$window',
        function($scope, $rootScope, $location, photobookService, tuxedoService, winnerService, $timeout, $window) {

            $scope.photobookError = false;
            $scope.tuxedoError = false;
            $scope.timer = null;

            $scope.salesOrg = [{
                id: 0,
                name: 'LSAG/ACG'
            }, {
                id: 1,
                name: 'DGG'
            }];

            //The persistant data model bound to html
            photobookService.getModel(function(result) {
                $scope.photobookModel = result;
            });

            tuxedoService.getModel(function(result) {
                $scope.tuxModel = result;
            });

            $scope.next = function(path) {
                $location.path(path);
            };

            $scope.gotoUrl = function(url) {
                $window.open(url, '_blank');
            };

            // When cancel button is pressed on modal, the model is reset and 
            // form set to pristine.
            $scope.cancelModal = function(modal) {
                if (modal === 'photo') {
                    $scope.userForm.$setPristine();
                    photobookService.resetModel();
                    photobookService.getModel(function(result) {
                        $scope.photobookModel = result;
                    });
                } else if (modal === 'tuxedo') {
                    $scope.tuxedoForm.$setPristine();
                    tuxedoService.resetModel();
                    tuxedoService.getModel(function(result) {
                        $scope.tuxModel = result;
                    });
                }
            };

            //Post photobook form after validation
            $scope.postPhotobook = function() {
                if ($scope.userForm.$valid) {
                    photobookService.updateModel($scope.photobookModel);

                    // Check Model
                    var checkModel = true;
                    for (var prop in $scope.photobookModel) {
                        if ($scope.photobookModel.hasOwnProperty(prop)) {
                            if ($scope.photobookModel[prop] === null || $scope.photobookModel[prop] === '') {
                                console.log(prop, ' was null');
                                checkModel = false;
                            }
                        }
                    }

                    if (!checkModel) {
                        $window.confirm('Some information is missing. Please check the forms and try again.');
                    } else {
                        // Post to server
                        winnerService.postPhotobook($scope.photobookModel).then(function(result) {
                            if (result.error) {
                                console.log(result.msg);
                                // This will show an error different message in the response modal
                                $scope.photobookError = true;
                            } else {
                                console.log(result);
                                $scope.photobookError = false;
                            }
                            // Show the response modal after post
                            var response = angular.element(document.querySelector('#photobookModalResponse'));
                            response.modal('show');
                        });
                    }
                }
            };

            $scope.closePhotoResponse = function(path) {
                $scope.photobookError = false;
                var response = angular.element(document.querySelector('#photobookModalResponse'));
                response.modal('hide');

                if (!$scope.timer) {
                    $scope.timer = $timeout(
                        function() {
                            console.log('Timer started');
                        },
                        500
                    ).then(
                        function() {
                            $timeout.cancel($scope.timer);
                            $scope.timer = null;
                            $location.path(path);
                        },
                        function() {
                            $timeout.cancel($scope.timer);
                            $scope.timer = null;
                            $location.path(path);
                        }
                    );
                }
            };

            //Post tuxedo form after validation
            $scope.postTuxedo = function() {
                if ($scope.tuxedoForm.$valid) {
                    tuxedoService.updateModel($scope.tuxModel);

                    // Check Model
                    var checkModel = true;
                    for (var prop in $scope.tuxModel) {
                        if ($scope.tuxModel.hasOwnProperty(prop)) {
                            if ($scope.tuxModel[prop] === null || $scope.tuxModel[prop] === '') {
                                if (prop !== 'guestOf') {
                                    console.log(prop, ' was null');
                                    checkModel = false;
                                }
                            }
                        }
                    }

                    if (!checkModel) {
                        $window.confirm('Some information is missing. Please check the forms and try again.');
                    } else {
                        // Post to server
                        winnerService.postTuxedo($scope.tuxModel).then(function(result) {
                            if (result.error) {
                                console.log(result.error);
                                // This will show an error different message in the response modal
                                $scope.tuxedoError = true;
                            } else {
                                console.log(result);
                                $scope.tuxedoError = false;
                            }
                            // Show the response modal after post
                            var response = angular.element(document.querySelector('#tuxedoModalResponse'));
                            response.modal('show');
                        });
                    }
                }
            };

            $scope.closeTuxedoResponse = function(path) {
                $scope.tuxedoError = false;
                var response = angular.element(document.querySelector('#tuxedoModalResponse'));
                response.modal('hide');

                if (!$scope.timer) {
                    $scope.timer = $timeout(
                        function() {
                            console.log('Timer started');
                        },
                        500
                    ).then(
                        function() {
                            $timeout.cancel($scope.timer);
                            $scope.timer = null;
                            $location.path(path);
                        },
                        function() {
                            $timeout.cancel($scope.timer);
                            $scope.timer = null;
                            $location.path(path);
                        }
                    );
                }
            };

        }
    ])
    /*
        Directive to handle 50 word max in textarea validation
    */
    .directive('maximumWordsValidation', function() {
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, ngModelCtrl) {
                // Figure out name of count variable we will set on parent scope
                var wordCountName = attrs.ngModel.replace('.', '_') + '_words_count';

                scope.$watch(function() {
                    return ngModelCtrl.$modelValue;
                }, function(newValue) {
                    var str = newValue && newValue.replace('\n', '');
                    // Dont split when string is empty, else count becomes 1
                    var wordCount = str ? str.split(' ').length : 0;
                    // Set count variable
                    scope.$parent[wordCountName] = wordCount;
                    // Update validity
                    var max = attrs.maximumWordsValidation;
                    ngModelCtrl.$setValidity('maximumWords', wordCount <= max);
                });
            }
        };
    });

'use strict';

/**
 * @ngdoc function
 * @name presidentsClubApp.controller:ActivitiesCtrl
 * @description
 * # ActivitiesCtrl
 * Controller of the presidentsClubApp
 */
angular.module('presidentsClubApp')
    .controller('ActivitiesCtrl', ['$scope', '$rootScope', '$location', 
        function($scope, $rootScope, $location) {

            $scope.next = function(path) {
                $location.path(path);
            };
        }
    ]);

'use strict';

/**
 * @ngdoc function
 * @name presidentsClubApp.controller:FaqCtrl
 * @description
 * # FaqCtrl
 * Controller of the presidentsClubApp
 */
angular.module('presidentsClubApp')
    .controller('FaqCtrl', ['$scope', '$rootScope', '$location', 
        function($scope, $rootScope, $location) {

            $scope.next = function(path) {
                $location.path(path);
            };

        }
    ]);

/**
 * @ngdoc function
 * @name presidentsClubApp.service:winnerService
 * @description
 * # winnerService
 * Main HTTP Service for the presidentsClubApp
 */
(function() {
    'use strict';
    angular.module('presidentsClubApp')
        .factory('winnerService', function($http, $log, $q) {
            return {
                /* 
                    Server REST API (CRUD) operations.
                    Change URL's to path to your REST call.
                */
                //Post Photo Book
                postPhotobook: function(dataObj) {

                    var q = $q.defer();

                    /* TEST RESPONSE MODAL WITH NO BACKEND ONLY
                        var result = {msg:'Success! it worked...', error:false}; // or false to see error response
                        q.resolve(result);

                        // Comment out next $http.post method lines below to test with above
                    */
                    $http.post('/api/v1/photobook', dataObj)
                        .success(function(result) {
                            q.resolve(result);
                        }).error(function(msg, code) {
                            q.reject(msg);
                            console.log(msg, code);
                        });
                        
                    return q.promise;
                },
                //Post Tuxedo
                postTuxedo: function(dataObj) {
                    
                    var q = $q.defer();

                    /* TEST RESPONSE MODAL WITH NO BACKEND ONLY
                        var result = {msg:'Success', error:false}; // or false to see error response
                        q.resolve(result);

                        // Comment out next $http.post method lines below to test with above
                    */

                    $http.post('/api/v1/tuxedo', dataObj)
                        .success(function(result) {
                            q.resolve(result);
                        }).error(function(msg, code) {
                            q.reject(msg);
                            console.log(msg, code);
                        });

                    return q.promise;
                }

            };
        })
        /*
            Service used to persist the data throughout the form flow
        */
        .service('photobookService', function() {
            var nomineeModel = null;
            var template = {
                first: '',
                last: '',
                salesOrg: null,
                title: '',
                mgrFirst: '',
                mgrLast: '',
                country: '',
                guestName: '',
                yos: '',
                comments: {
                    like: '',
                    goals: '',
                    invision: '',
                    hobbies: ''
                }
            };
            nomineeModel = angular.copy(template);

            this.getModel = function(callback) {
                callback(nomineeModel);
            };
            this.updateModel = function(model) {
                nomineeModel = model;
            };
            this.resetModel = function() {
                nomineeModel = angular.copy(template);
            };
        })
        .service('tuxedoService', function() {
            var tuxModel = null;
            var template = {
                first: '',
                last: '',
                email: '',
                phone: null,
                measurements: {
                    height: '',
                    weight: '',
                    waist: '',
                    outSeam: '',
                    coatInsleeve: '',
                    hip: '',
                    chest: '',
                    neck: '',
                    sleeve: '',
                    shoeSize: '',
                    shoeWidth: ''
                },
                guestOf: ''
            };
            tuxModel = angular.copy(template);

            this.getModel = function(callback) {
                callback(tuxModel);
            };
            this.updateModel = function(model) {
                tuxModel = model;
            };
            this.resetModel = function() {
                tuxModel = angular.copy(template);
            };
        });
})();

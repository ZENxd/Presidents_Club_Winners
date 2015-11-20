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
        'ui.mask',
        'flow'
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
    }).run(['$rootScope',
        function($rootScope) {
            $rootScope.island = false;
        }
    ])
    .value('globals', {
        loader: {
            show: false
        }
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
    .controller('HomeCtrl', ['$scope', '$rootScope', '$location', 'settings', '$window', 
        function($scope, $rootScope, $location, settings, $window) {

            $rootScope.island = false;
            
            $scope.settings = null;
            settings.getSettings(function(result) {
                $scope.settings = result;
            });

            $scope.next = function(path) {
                $location.path(path);
            };

            $scope.gotoUrl = function(url){
                $window.open(url, '_blank');
            }
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
    .controller('OverViewCtrl', ['$scope', '$rootScope', '$location', 'settings', 'photobookService', 'tuxedoService', 'nomineeService', '$timeout',
        function($scope, $rootScope, $location, settings, photobookService, tuxedoService, nomineeService, $timeout) {

            settings.setValue('subFooter', false);
            $rootScope.island = true;
            $scope.filesDone = false;

            $scope.settings = null;
            settings.getSettings(function(result) {
                $scope.settings = result;
            });

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

            //Post form after validation
            $scope.post = function(url) {
                if ($scope.userForm.$valid) {
                    tuxedoService.updateModel($scope.tuxModel);
                }
                if ($scope.tuxedoForm.$valid) {
                    tuxedoService.updateModel($scope.tuxModel);
                }
            };

            //Flow uploader success handler
            $scope.flowSuccess = function(file, index) {
            	$scope.nomineeModel.photoBookImage = null;
                if (!$scope.timer) {
                    $scope.timer = $timeout(
                        function() {
                            console.log('Timer started');
                        },
                        3000
                    ).then(
                        function() {
                            $timeout.cancel($scope.timer);
                            $scope.filesDone = true;
                            $scope.timer = null;
                            console.log('Files uploaded');
                        },
                        function() {
                            console.log('Something went wrong');
                            $timeout.cancel($scope.timer);
                            $scope.timer = null;
                        }
                    );
                }

                if (file) {
                    var obj = {
                        path: file,
                        type: $scope.fileType(file)
                    };
                    $scope.nomineeModel.photoBookImage = obj;
                    console.log($scope.nomineeModel.photoBookImage);
                }

            };

            //Helpers
            // get url file extension
            $scope.fileType = function(filename) {
                filename = filename.split('/').pop();
                var a = filename.split('.');
                if (a.length === 1 || (a[0] === '' && a.length === 2)) {
                    return '';
                }
                return a.pop();
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
    .controller('ActivitiesCtrl', ['$scope', '$rootScope', '$location', 'settings',
        function($scope, $rootScope, $location, settings) {

            settings.setValue('subFooter', false);
            $rootScope.island = true;
            
            $scope.settings = null;
            settings.getSettings(function(result) {
                $scope.settings = result;
            });

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
    .controller('FaqCtrl', ['$scope', '$rootScope', '$location', 'settings',
        function($scope, $rootScope, $location, settings) {

            settings.setValue('subFooter', false);
            $rootScope.island = true;
            
            $scope.settings = null;
            settings.getSettings(function(result) {
                $scope.settings = result;
            });

            $scope.next = function(path) {
                $location.path(path);
            };

        }
    ]);

/**
 * @ngdoc function
 * @name presidentsClubApp.service:settings
 * @description
 * # Settings
 * Show/hide nav based items for the presidentsClubApp
 */
(function() {
    'use strict';
    angular.module('presidentsClubApp')
        .service('settings', function() {

            var settings = {
                
            };

            this.getSettings = function(callback) {
                callback(settings);
            };

            this.setValue = function(key, val) {
                settings[key] = val;
            };

        });
})();

/**
 * @ngdoc function
 * @name presidentsClubApp.service:nomineeService
 * @description
 * # NomineeService
 * Main HTTP Service for the presidentsClubApp
 */
(function() {
    'use strict';
    angular.module('presidentsClubApp')
        .factory('nomineeService', function($http, $log, $q) {
            return {
                /* 
                    Server REST API (CRUD) operations.
                    Change URL's to path to your REST call.
                */
                //Post a nominee
                postNominee: function(dataObj) {
                    var q = $q.defer();
                    $http.post('/api/v1/save', dataObj)
                        .success(function(result) {
                            q.resolve(result);
                        }).error(function(msg, code) {
                            q.reject(msg);
                            console.log(msg, code);
                        });
                    return q.promise;
                },
                //Update nominee (Approve, Deny)
                updateNominee: function(dataObj) {
                    var q = $q.defer();
                    $http.post('/api/v1/update', dataObj)
                        .success(function(result) {
                            q.resolve(result);
                        }).error(function(msg, code) {
                            q.reject(msg);
                            console.log(msg, code);
                        });
                    return q.promise;
                },
                //Get all nominees
                getNominees: function() {
                    var q = $q.defer();
                    $http.get('/api/v1/query')
                        .success(function(result) {
                            q.resolve(result);
                        }).error(function(msg, code) {
                            q.reject(msg);
                            console.log(msg, code);
                        });
                    return q.promise;
                },
                //Get a nominee by id
                getNomineeById: function(id) {
                    var q = $q.defer();
                    $http.get('/api/v1/query' + id)
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
                photoBookImage: null,
                salesOrg: null,
                org: '',
                title: '',
                mgrFirst: '',
                mgrLast: '',
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

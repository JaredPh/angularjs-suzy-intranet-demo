(function (angular) {
	'use strict';

	angular.module('es.page', [
        'es.filters',
        'es.people',
        'ngCookies'
    ])

//--  Page Topbar  --------------------------------------------------------------------------------------------------------------------------------------

    .directive('pageTopbar',[function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'app/page/page.topbar.html',
            controller: ['$scope', function ($scope) {
                $scope.menus = {
                    add: [
                        {
                            label: 'Document',
                            icon: 'add-file',
                            action: null
                        },
                        {
                            label: 'News Article',
                            icon: 'news',
                            action: {
                                type: 'state',
                                name: 'news.add'
                            }  
                        },
                        {
                            label: 'Event',
                            icon: 'calendar',
                            action: null
                        },
                        {
                            label: 'Comment',
                            icon: 'notifications',
                            action: null
                        }
                    ]
                }
            }]
        };
    }])
    
    .directive('pageTopbarMenu',[function () {
        return {
            restrict: 'A',
            replace: false,
            templateUrl: 'app/page/page.topbar.menu.html',
            scope: {
                items: '=pageTopbarMenu'
            },
            controller: ['$scope', '$state', function ($scope, $state) {
                $scope.performAction = function (action) {
                    
                    if (action.type === 'state') {
                        var params = ('params' in action) ? action.params : {};
                
                        $state.go(action.name, params);
                    }
                    else {
                        console.warn('Topbar Menu - Action not recognised');
                    }
                }
            }]
        };
    }])

    .directive('pageTopbarSearch',[function () {
        return {
            restrict: 'A',
            replace: false,
            template: '<input type="text">',
            controller: ['$scope', '$state', function ($scope, $state) {
                
            }],
            link: function (scope, element) {
                
                var searchBox = $(element).find('input');
                
                $(element).parent().hover(
                    function () {
                        searchBox.focus();
                    },
                    function () {
                        searchBox.blur();
                    }
                )
            }
        };
    }])

//--  Page Sidebar  --------------------------------------------------------------------------------------------------------------------------------------

    .directive('pageSidebar',[function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {}, 
            templateUrl: 'app/page/page.sidebar.html',
            controller: ['$scope', '$cookies', function ($scope, $cookies) {
                
                $scope.minimised = ($cookies.get('sidebar_min') === "true");
                
                $scope.$on('sidebar-toggled', function (event, args) {
                    $scope.minimised = !$scope.minimised;
                    $cookies.put('sidebar_min', $scope.minimised);
                    $scope.$apply();
                })
            }]
        };
    }])   

    .directive('pageToggleSidebar',[function () {
        return {
            restrict: 'A',
            link: function (scope, element) {
                element.bind('click', function () {
                    scope.$broadcast('sidebar-toggled');
                });
            }
        };
    }])

//--  Page Footer ----------------------------------------------------------------------------------------------------------------------------------------

    .directive('pageFooter', [function () {
        return {
            restrict: 'E',
            replace: true,
            template: '<footer></footer>'
        };
    }])

//--  Page Breadcrumb  -----------------------------------------------------------------------------------------------------------------------------------

    .directive('pageBreadcrumb', [function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'app/page/page.breadcrumb.html',
            controller: ['$scope', '$state', '$stateParams', '$filter', function ($scope, $state, $stateParams, $filter) {
        
                $scope.path = $state.$current.path;

                $scope.getLabel = function (label) {
                    if (label.indexOf('@') >= 0) {
                        
                        var label = label.split(' ');

                        for (var i in label) {

                            if (label[i].indexOf('@') === 0) {
                                label[i] = $stateParams[label[i].substr(1)];
                                label[i] = label[i].replace(/_/g,' ');
                            }
                        }

                        label = label.join(' ')
                    }

                    return $filter('capitalize')(label,'all');
                };

            }]
        };
    }])

//--  Page Heading  --------------------------------------------------------------------------------------------------------------------------------------

    .directive('pageHeading', [function () {
        return {
            restrict: 'C',
            replace: true,
            controller: ['$scope','$stateParams', function ($scope, $stateParams) {
                $scope.stateParams = $stateParams;
            }]
        };
    }])

//--  Page App Menu --------------------------------------------------------------------------------------------------------------------------------------

    .directive('pageMenuApps', [function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/app/page/page.menu.apps.html',
            controller: ['$scope', function ($scope) {

                $scope.apps = [
                    {id: 'buildr',   label: 'Builder',  icon: 'buildr',   path:  'http://10.20.131.107/buildr'},
                    {id: 'lab',      label: 'The Lab',  icon: 'lab',      path:  'https://organisedfeedback.com/TheLab'},
                    {id: 'keyedin',  label: 'Keyed In', icon: 'keyedin',  path:  'https://agondemand.co.uk'},
                    {id: 'dbanet',   label: 'DBAnet',   icon: 'dbanet',   path:  'http://dbanet/'},
                    {id: 'monster',  label: 'Vacancies',icon: 'monster',  path:  'https://esure.mua.hrdepartment.com/ats/internal'},
                    {id: 'esure4u',  label: 'Esure4u',  icon: 'esure4u',  path:  'http://esure4u.co.uk'},
                    {id: 'alm',      label: 'ALM',      icon: 'alm',      path:  'https://esure.saas.hp.com/qcbib/qcaddon/ui/login.jsp'},
                    {id: 'imaging',  label: 'Imaging',  icon: 'imaging',  path:  'http://imaging2/'}
                ];
            }]
        };
    }])

    .directive('pageMenuDepartments', [function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/app/page/page.menu.departments.html',
            controller: ['$scope', function ($scope) {
                
            }]
        };
    }])

})(window.angular);
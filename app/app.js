(function (angular) {
	'use strict';

	angular.module('app', [
        'es.feed',
        'es.news', 
        'es.page',
        'ui.router'
    ])

    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {

        $stateProvider
    	
        .state('home', {
            url: '/',
            templateUrl: 'app/home.html',
            data: {
                label : 'Home'
            }
        })

        .state('error404', {
            url: '/404/',
            template: 'It\'s gone wrong!',
            data: {
                label : 'Error'
            }
        })

        $urlRouterProvider.otherwise('/404');

        $locationProvider.html5Mode(false).hashPrefix('eserve');
        

        $urlRouterProvider.rule(function ($injector, $location) {
            //Enable trailing slashes

            var path = $location.url().toLowerCase();

            if (path[path.length-1] === '/' || path.indexOf('/?') > -1) {
                return path;
            }

            if (path.indexOf('?') > -1) {
                    return path.replace('?','/?');
            }

            return path + '/';
        })
	}])

    .directive('badge',[function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                if (attrs.badge > 0) {
                    element.addClass('badge');
                }
            }
        };
    }])

    .factory('NotificationFactory', [function () {
       
        var factory = {};

        factory.notify = function () {
            
            Notification.requestPermission(function(status) { // status is "granted", if accepted by user

                var n = new Notification('Eserve', { 
                    body: 'I am the body text!',
                    icon: '/img/logo.png'
                }); 
            });

        };

        return factory;
    }])

})(window.angular);
(function (angular) {
	'use strict';

	angular.module('es.feed', [
        'es.news',
        'es.page',
        'es.widgets',
        'ngCookies',
        'ngSanitize',
        'ui.router'
    ])

    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {

        $stateProvider
    	
        .state('feed', {
            url: '/feed/',
            templateUrl: 'app/feed/feed.main.html',
            data: {
                label : 'Feed'
            }
        })

        .state('feed.tag', {
            url: ':tag',
            templateUrl: 'app/feed/feed.tag.html',
            data: {
                label : '@tag'
            }
        })
	}])

    .directive('feed',[function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                tag: '='
            },
            templateUrl: 'app/feed/feed.html',
            controller: ['$scope', '$filter', '$state', '$stateParams', 'NewsFactory', function ($scope, $filter, $state, $stateParams, NewsFactory) {
                
                NewsFactory.getNewsStories().then(function (data) {
                    
                    var feedItems = [];
                
                    angular.forEach(data, function (element,index,array) {
                        
                        element.type = 'news';
                        
                        if (!$stateParams.hasOwnProperty('tag')) {
                            this.push(element);    
                        }
                        else {
                            for (var i in element.tags) {
                                if (element.tags[i].toLowerCase() === $stateParams.tag.toLowerCase().replace(/_/g,' ')) {
                                    this.push(element);
                                    break;
                                }
                            }
                        }
                        
                    }, feedItems);

                    var poll = {
                        id: 'POLL0001',
                        type: 'widget',
                        widget: 'poll',
                        date: 1459780428126,
                        title: 'Reigate DDD Charity',
                        body: 'Which Charity would you like to support on Dress Down Day this Friday?',
                        tags: ['Reigate','Internal Comms'],
                        options: ['Clifton High School', 'Delight']
                    }

                    $scope.feedItems = $filter('orderBy')(feedItems, 'date', true);
                    
                    if ($state.current.name === 'home') {

                        $scope.feedItems.splice(1,0,{
                            type: 'widget',
                            widget: 'weather'
                        },{
                            type: 'widget',
                            widget: 'stock'
                        });
                    }

                    //$scope.feedItems.splice(3,0,poll);
                });

                $scope.showMore = function () {
                    $scope.pattern = $scope.pattern.concat($scope.additionalPattern);
                };
            }],
            link: function (scope, element, attrs) {
                var patternArr = attrs.pattern.split('-');
                
                scope.pattern = patternArr[0].split('');
                scope.additionalPattern = (patternArr.length === 1) ? patternArr[0].split('') : patternArr[1].split('');
            }
        };
    }])

    .directive('feedItem',['$compile', function ($compile) {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                item: '='
            },
            controller: ['$scope', '$filter', 'NewsFactory', function ($scope, $filter, NewsFactory) {
               

            }],
            link: function (scope, element, attrs) {
                
                var template = '';
                
                switch (scope.item.type) {
                    case 'news': 
                        template = '<news:preview data-article="item"></news:test>';
                        break;
                    case 'widget': 
                        template = '<widget:'+scope.item.widget+' poll="item"></widget:'+scope.item.widget+'>';
                        break;
                    default:
                        template = '<p>Not Found - ('+scope.item.type+')</p>';
                }

                element.html(template).show();

                $compile(element.contents())(scope);
            }
        };
    }])

    .directive('tags',['$compile', function ($compile) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                tags: '=tagList',
                add: '='
            },
            templateUrl: 'app/feed/feed.tagList.html',
            controller: ['$scope','$state', function ($scope, $state) {


                $scope.getTagClasses = function (tag) {
                    return {
                        location: (tag.match(/(glasgow)|(manchester)|(reigate)/i) !== null)
                    };
                };

                $scope.goToFeed = function (event,tag) {
                    event.stopPropagation();
                    if (!$scope.add) $state.go('feed.tag',{tag:tag.replace(/\s/g,'_')});
                };
            }]
        };
    }])

})(window.angular);
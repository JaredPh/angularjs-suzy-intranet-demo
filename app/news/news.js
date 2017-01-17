(function (angular) {
	'use strict';

	angular.module('es.news', [
        'es.filters',
        'es.page',
        'ngCkeditor',
        'ngDialog',
        'ngSanitize',
        'ui.router'
    ])

    .config(['$stateProvider', 'ngDialogProvider', function ($stateProvider, ngDialogProvider) {

        $stateProvider

        .state('news', {
            url: '/news/',
            template: '<news></news>',
            data: {
                label : 'News'
            }
        })

        .state('news.add', {
            url: 'add/',
            template: function (element, attrs) {
                return '<news:article:add></<news:article:add>';
            },
            data: {
                label : 'Add'
            }
        })

        .state('news.article', {
            url: ':id/',
            template: function (element, attrs) {
                return '<news:article data-article-id="' + element.id + '"></news:article>';
            },
            data: {
                label : '@id'
            }
        })

        .state('news.article.edit', {
            url: 'edit/',
            template: function (element, attrs) {
                return '<news:article:edit data-article-id="' + element.id + '"></<news:article:edit>';
            },
            data: {
                label : 'Edit'
            }
        })

        ngDialogProvider.setDefaults({
            className: 'ngdialog-theme-default',
            plain: false,
            showClose: true,
            closeByDocument: true,
            closeByEscape: true
        })
        
        ngDialogProvider.setOpenOnePerName(true)
    }]) 

//--  News Main ------------------------------------------------------------------------------------------------------------------------------------------

    .directive('news', [function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'app/news/news.main.html',
            controller: ['$scope', 'NewsFactory', function ($scope, NewsFactory) {
                NewsFactory.getNewsStories().then(function (data) {
                    $scope.stories = data;
                });
            }]
        };
    }])

//--  News Section  --------------------------------------------------------------------------------------------------------------------------------------

    .directive('newsSection', [function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: function (element, attrs) {
                var url = '';
                
                switch (attrs.type) {
                    case 'section':
                    default:
                        url = 'app/news/news.section.html';
                }

                return url;
            },
            scope: {
                heading: '='
            },
            controller: ['$scope', 'NewsFactory', '$state', function ($scope, NewsFactory, $state) {
        
                $scope.articles = [];

                NewsFactory.getNewsStories().then(function (data) {
                    $scope.articles = data;
                });

                $scope.setRoute = function () {
                    $state.go($scope.heading.state);
                };
                
            }]
        };
    }])

    
//--  News Preview  --------------------------------------------------------------------------------------------------------------------------------------

    .directive('newsPreview', [function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: function (element, attrs) {
                var url = '';
                
                switch (attrs.format) {
                    default:
                        url = 'app/news/news.preview.html';
                }

                return url;
            },
            scope: {
                format:   '=',
                article:  '='
            },
            controller: ['$scope', '$state', function ($scope, $state) {

                // $scope.getFormatClass = function () {
                //     return 'art-'+$scope.format;
                // };

                $scope.getBackground = function () {
                    return {
                        'background-image': 'url(' + $scope.article.image.url + ')'
                    };
                };

                $scope.gotoArticle = function () {
                    $state.go('news.article',{id: $scope.article.id ,parent: 'home'});
                }
            }]
        };
    }])

            

//--  News Article  --------------------------------------------------------------------------------------------------------------------------------------

    .directive('newsArticle', [function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'app/news/news.article.html',
            scope: {
                articleId: '@'
            },
            controller: ['$scope', 'NewsFactory', '$anchorScroll', '$filter', function ($scope, NewsFactory, $anchorScroll, $filter) {
        
                $anchorScroll();

                var tmpUserTags = ["HR", "IT"];

                NewsFactory.getNewsStoryById($scope.articleId).then(function (data) {
                
                    $scope.mainStory = data;

                    $scope.mainStory.editable = (function (userPerms) {
                        
                        var editable = false;

                        for (var i in userPerms) {
                            
                            var matches = $filter('filter')($scope.mainStory.tags, userPerms[i]);
                            if (matches.length > 0) {
                                editable = true;
                                break;
                            }
                        }

                        return editable;
                        
                    }(tmpUserTags));
                });
            

                NewsFactory.getNewsStories().then(function (data) {
                    
                    var i = 0; 
                    var output = [];

                    while (i < data.length && output.length < 3) {
                        
                        if (data[i].id !== $scope.articleId) {
                            output.push(data[i]);
                        }
                        
                        i++;
                    }

                    $scope.stories = output;
                });
            }]
        };
    }])

    

    .directive('newsArticleAdd', [function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'app/news/news.article.add.html',
            scope: {
                articleId: '@'
            },
            controller: ['$scope', '$state', '$timeout', 'ngDialog', function ($scope, $state, $timeout, ngDialog) {
                
                $scope.title = 'News > Add Article';

                $scope.editStory = {
                        id:    '',
                        title: '',
                        intro: '',
                        body:  '',
                        image: {
                            url: 'img/placeholder.png',
                            layout: 'full'
                        }
                }
                
                $scope.reset = function () {
                    $scope.editStory = angular.copy($scope.$parent.mainStory);
                }

                $scope.passThrough = false;

                 $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
                    
                    if ($scope.newsForm.$dirty && !$scope.passThrough) {
                        
                        event.preventDefault()

                        var modal = ngDialog.open({
                            name: 'confirmRouteChange',
                            template: 'app/page/page.modal.leave.html',
                            showClose: false
                        });

                        modal.closePromise.then(function (response) {
                            
                            if (response.value) {
                                $scope.passThrough = true;

                                $timeout(function() {
                                    $state.go(toState);
                                }, 400);
                                
                            }
                        });
                    }
                });
            }]
        };
    }])

    .directive('newsArticleEdit', [function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'app/news/news.article.edit.html',
            scope: {
                articleId: '@'
            },
            controller: ['$scope', '$state', '$timeout', 'NewsFactory', 'ngDialog', function ($scope, $state, $timeout, NewsFactory, ngDialog) {
        
                $scope.title = 'News > Edit Article';
                    
                $scope.editStory = angular.copy($scope.$parent.mainStory);

                $scope.reset = function () {
                    $scope.editStory = angular.copy($scope.$parent.mainStory);
                }

                $scope.passThrough = false;

                $scope.getTags = function () {
                    return 'Test';
                }

                $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
                    
                    if ($scope.newsForm.$dirty && !$scope.passThrough) {
                        
                        event.preventDefault()

                        var modal = ngDialog.open({
                            name: 'confirmRouteChange',
                            template: 'app/page/page.modal.leave.html',
                            showClose: false
                        });

                        modal.closePromise.then(function (response) {
                            
                            if (response.value) {
                                $scope.passThrough = true;

                                $timeout(function() {
                                    $state.go(toState);
                                }, 400);
                                
                            }
                        });
                    }
                })
            }]
        };
    }])

//--  Factorys and Services ------------------------------------------------------------------------------------------------------------------------------

    .factory('NewsFactory', ['$q', '$filter', function ($q, $filter) {
        
        var getRandTime = function () {

            var min = 1;
            var max = 4 * 24 * 60;
            
            var currentTime = (new Date()).getTime();
            var randMinutes = (Math.floor(Math.random() * (max - min + 1)) + min);
            var oneMinute = 1000*60;
            
            return currentTime - (randMinutes * oneMinute);
        }

        var stories = [
            {
                id: 'kitchen_sink',
                title: 'Kitchen Sink',
                intro: '<p>Nulla vitae elit libero, a pharetra augue. Curabitur <a href="#">blandit tempus</a> porttitor. Curabitur blandit tempus porttitor. Donec id elit non mi porta gravida at eget metus. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Donec ullamcorper nulla non metus auctor fringilla. <a href="#">Praesent commodo cursus</a> magna, vel scelerisque nisl consectetur et.</p>',
                body:  '<h1>HTML Ipsum Presents</h1><p><strong>Pellentesque habitant morbi tristique</strong> senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. <em>Aenean ultricies mi vitae est.</em> Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, <code>commodo vitae</code>, ornare sit amet, wisi. Aenean fermentum, elit <a href="#">eget</a> tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui.</p><p><a href="#">Donec non enim</a> in turpis pulvinar facilisis. Ut felis.</p><p>&nbsp;</p><h2>Header Level 2</h2><ol><li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li><li>Aliquam tincidunt mauris eu risus.</li></ol><blockquote><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus magna. Cras in mi at felis aliquet congue. Ut a est eget ligula molestie gravida. Curabitur massa. Donec eleifend, libero at sagittis mollis, tellus est malesuada tellus, at luctus turpis elit sit amet quam. Vivamus pretium ornare est.</p></blockquote><h3>Header Level 3</h3><ul><li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li><li>Aliquam tincidunt mauris eu risus.</li></ul><pre><code>#header h1 a { display: block; width: 300px; height: 80px; }</code></pre><p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.</p><table align="center"><thead><tr><th>One</th><th>Two</th><th>Three</th></tr></thead><tbody><tr><td>Alpha</td><td>Beta</td><td>Charlie</td></tr><tr><td>Delta</td><td>Echo</td><td>Foxtrot</td></tr></tbody></table><p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. <img alt="" src="https://placehold.it/350x150" style="float:left; height:150px; margin:10px; width:350px" />Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui.</p><p>Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus.&nbsp;​Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus</p>',
                image: {
                    url: 'img/news/00.jpg',
                    layout: 'right'
                },
                tags: ['Legal'],
                date: getRandTime()
            },
            {
                id: 'news_article_1',
                title: 'Lorem Sit Nullam Consectetur Venenatis',
                intro: '<p>Nulla vitae elit libero, a pharetra augue. Curabitur blandit <a href="#">tempus porttitor</a>. Curabitur blandit tempus porttitor. Donec id elit non mi porta gravida at eget metus. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Donec ullamcorper nulla non metus auctor fringilla. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.</p>',
                body:  '<p>Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Cras mattis consectetur purus sit amet fermentum. Donec sed odio dui. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.</p><p>Maecenas sed diam eget risus varius blandit sit amet non magna. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Cras mattis consectetur purus sit amet fermentum. Nullam id dolor id nibh ultricies vehicula ut id elit. Nullam id dolor id nibh ultricies vehicula ut id elit. Maecenas faucibus mollis interdum.</p><p>Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Maecenas sed diam eget risus varius blandit sit amet non magna.</p>',
                image: {
                    url: 'img/news/01.jpg',
                    layout: 'left'
                },
                tags: ['HR'],
                date: getRandTime()
            },
            /*{
                id:    'news_article_2',
                title: 'Man with two left hands drives car',
                tag:   'Both of his sat navs still work in tunnel',
                body:  '<p>Maecenas sed diam eget risus varius blandit sit amet non magna. Vestibulum id ligula porta felis euismod semper. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Etiam porta sem malesuada magna mollis euismod. Nullam quis risus eget urna mollis ornare vel eu leo. Donec ullamcorper nulla non metus auctor fringilla. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.</p><p>Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Nullam id dolor id nibh ultricies vehicula ut id elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Maecenas sed diam eget risus varius blandit sit amet non magna. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.</p><p>Maecenas sed diam eget risus varius blandit sit amet non magna. Vestibulum id ligula porta felis euismod semper. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Etiam porta sem malesuada magna mollis euismod. Nullam quis risus eget urna mollis ornare vel eu leo. Donec ullamcorper nulla non metus auctor fringilla. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.</p><p>Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Nullam id dolor id nibh ultricies vehicula ut id elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Maecenas sed diam eget risus varius blandit sit amet non magna. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.</p>',
                image: {
                    url: 'img/news/02.jpg',
                    layout: 'left'
                },
                tags: ['HR', 'Internal Comms'],
                date: getRandTime()
            },*/
            {
                id:    'news_article_3',
                title: 'Maecenas faucibus mollis interdum',
                intro: '<p>Cras mattis consectetur purus sit amet fermentum. Curabitur blandit tempus porttitor.</p>',
                body:  '<p>Aenean lacinia bibendum nulla sed consectetur. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.</p><p>Donec ullamcorper nulla non metus auctor fringilla. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Aenean lacinia bibendum nulla sed consectetur.</p><p>Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nullam id dolor id nibh ultricies vehicula ut id elit. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras mattis consectetur purus sit amet fermentum. Maecenas faucibus mollis interdum. Vestibulum id ligula porta felis euismod semper.</p><p>Curabitur blandit tempus porttitor. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Sed posuere consectetur est at lobortis.</p>',
                image: {
                    url: 'img/news/03.jpg',
                    layout: 'full'
                },
                tags: ['Marketing'],
                date: getRandTime()
            },
            {
                id:    'news_article_4',
                title: 'Curabitur blandit tempus porttitor.',
                intro: '<p>Nullam id dolor id nibh ultricies vehicula ut id elit. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.</p>',
                body:  '<p>Vestibulum id ligula porta felis euismod semper. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.</p><p>Nullam id dolor id nibh ultricies vehicula ut id elit. Donec id elit non mi porta gravida at eget metus. Donec sed odio dui. Maecenas faucibus mollis interdum.</p><p>Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec sed odio dui. Vestibulum id ligula porta felis euismod semper. Maecenas sed diam eget risus varius blandit sit amet non magna.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas faucibus mollis interdum. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec id elit non mi porta gravida at eget metus. Cras mattis consectetur purus sit amet fermentum. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.</p><ul><li>Maecenas sed diam eget risus varius blandit sit amet non magna.</li><li>Donec sed odio dui. Fusce dapibus, tellus ac cursus commodo.</li><li>Tortor mauris condimentum nibh.</li><li>Ut fermentum massa justo sit amet risus.</li></ul><p>Morbi leo risus, porta ac consectetur ac, vestibulum at eros.</p><p>Curabitur blandit tempus porttitor. Donec ullamcorper nulla non metus auctor fringilla. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vitae elit libero, a pharetra augue.</p>',
                image: {
                    url: 'img/news/04.jpg',
                    layout: 'full'
                },
                tags: ['IT', 'Marketing'],
                date: getRandTime()
            },
            {
                id:    'news_article_5',
                title: 'Nulla vitae elit libero a pharetra augue.',
                intro: '<p>Aenean lacinia bibendum nulla sed consectetur. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Maecenas sed diam eget risus varius blandit sit amet non magna.</p>',
                body:  '<p>Donec ullamcorper nulla non metus auctor fringilla. Maecenas faucibus mollis interdum. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Maecenas sed diam eget risus varius blandit sit amet non magna. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Aenean lacinia bibendum nulla sed consectetur.</p><p>Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.</p><p>Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Nullam quis risus eget urna mollis ornare vel eu leo. Etiam porta sem malesuada magna mollis euismod.</p>',
                image: {
                    url: 'img/news/05.jpg',
                    layout: 'full'
                },
                tags: ['Legal', 'Marketing'],
                date: getRandTime()
            },
            {
                id:    'news_article_6',
                title: 'Donec id elit non mi porta gravida at eget metus',
                intro: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas sed diam eget risus varius blandit sit amet non magna.</p>',
                body:  '<p>Etiam porta sem malesuada magna mollis euismod. Donec ullamcorper nulla non metus auctor fringilla. Nullam quis risus eget urna mollis ornare vel eu leo. Vestibulum id ligula porta felis euismod semper. Nulla vitae elit libero, a pharetra augue.</p><p>Nullam quis risus eget urna mollis ornare vel eu leo. Aenean lacinia bibendum nulla sed consectetur. Nulla vitae elit libero, a pharetra augue. Nullam quis risus eget urna mollis ornare vel eu leo. Vestibulum id ligula porta felis euismod semper.</p><p>Nulla vitae elit libero, a pharetra augue. Aenean lacinia bibendum nulla sed consectetur. Nullam quis risus eget urna mollis ornare vel eu leo. Vestibulum id ligula porta felis euismod semper. Donec id elit non mi porta gravida at eget metus.</p><p>Nullam id dolor id nibh ultricies vehicula ut id elit. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur blandit tempus porttitor. Maecenas faucibus mollis interdum. Cras mattis consectetur purus sit amet fermentum. Sed posuere consectetur est at lobortis.</p>',
                image: {
                    url: 'img/news/06.jpg',
                    layout: 'full'
                },
                tags: ['Internal Comms'],
                date: getRandTime()
            },
            {
                id: 'news_article_7',
                title: 'Lorem Sit Nullam Consectetur Venenatis',
                intro: '<p>Nulla vitae elit libero, a pharetra augue. Curabitur blandit <a href="#">tempus porttitor</a>. Curabitur blandit tempus porttitor. Donec id elit non mi porta gravida at eget metus. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Donec ullamcorper nulla non metus auctor fringilla. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.</p>',
                body:  '<p>Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Cras mattis consectetur purus sit amet fermentum. Donec sed odio dui. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.</p><p>Maecenas sed diam eget risus varius blandit sit amet non magna. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Cras mattis consectetur purus sit amet fermentum. Nullam id dolor id nibh ultricies vehicula ut id elit. Nullam id dolor id nibh ultricies vehicula ut id elit. Maecenas faucibus mollis interdum.</p><p>Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Maecenas sed diam eget risus varius blandit sit amet non magna.</p>',
                image: {
                    url: 'img/news/07.jpg',
                    layout: 'full'
                },
                tags: ['Marketing'],
                date: getRandTime()
            },
            {
                id:    'news_article_8',
                title: 'Ultricies Pharetra Commodo Ullamcorper',
                intro: '<p>Vestibulum id ligula porta felis euismod semper. Aenean lacinia bibendum nulla sed consectetur. Maecenas sed diam eget risus varius blandit sit amet non magna.</p>',
                body:  '<p>Maecenas sed diam eget risus varius blandit sit amet non magna. Vestibulum id ligula porta felis euismod semper. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Etiam porta sem malesuada magna mollis euismod. Nullam quis risus eget urna mollis ornare vel eu leo. Donec ullamcorper nulla non metus auctor fringilla. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.</p><p>Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Nullam id dolor id nibh ultricies vehicula ut id elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Maecenas sed diam eget risus varius blandit sit amet non magna. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.</p>',
                image: {
                    url: 'img/news/08.jpg',
                    layout: 'full'
                },
                tags: ['IT'],
                date: getRandTime()
            },
            {
                id:    'news_article_9',
                title: 'Maecenas faucibus mollis interdum',
                intro: '<p>Cras mattis consectetur purus sit amet fermentum. Curabitur blandit tempus porttitor.</p>',
                body:  '<p>Aenean lacinia bibendum nulla sed consectetur. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.</p><p>Donec ullamcorper nulla non metus auctor fringilla. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Aenean lacinia bibendum nulla sed consectetur.</p><p>Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nullam id dolor id nibh ultricies vehicula ut id elit. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras mattis consectetur purus sit amet fermentum. Maecenas faucibus mollis interdum. Vestibulum id ligula porta felis euismod semper.</p><p>Curabitur blandit tempus porttitor. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Sed posuere consectetur est at lobortis.</p>',
                image: {
                    url: 'img/news/09.jpg',
                    layout: 'full'
                },
                tags: ['Internal Comms', 'Claims'],
                date: getRandTime()
            },
            {
                id:    'news_article_10',
                title: 'Curabitur blandit tempus porttitor.',
                intro: '<p>Nullam id dolor id nibh ultricies vehicula ut id elit. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.</p>',
                body:  '<p>Vestibulum id ligula porta felis euismod semper. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.</p><p>Nullam id dolor id nibh ultricies vehicula ut id elit. Donec id elit non mi porta gravida at eget metus. Donec sed odio dui. Maecenas faucibus mollis interdum.</p><p>Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec sed odio dui. Vestibulum id ligula porta felis euismod semper. Maecenas sed diam eget risus varius blandit sit amet non magna.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas faucibus mollis interdum. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec id elit non mi porta gravida at eget metus. Cras mattis consectetur purus sit amet fermentum. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.</p><ul><li>Maecenas sed diam eget risus varius blandit sit amet non magna.</li><li>Donec sed odio dui. Fusce dapibus, tellus ac cursus commodo.</li><li>Tortor mauris condimentum nibh.</li><li>Ut fermentum massa justo sit amet risus.</li></ul><p>Morbi leo risus, porta ac consectetur ac, vestibulum at eros.</p><p>Curabitur blandit tempus porttitor. Donec ullamcorper nulla non metus auctor fringilla. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vitae elit libero, a pharetra augue.</p>',
                image: {
                    url: 'img/news/10.jpg',
                    layout: 'full'
                },
                tags: ['Claims'],
                date: getRandTime()
            },
            {
                id:    'news_article_11',
                title: 'Nulla vitae elit libero a pharetra augue.',
                intro: '<p>Aenean lacinia bibendum nulla sed consectetur. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Maecenas sed diam eget risus varius blandit sit amet non magna.</p>',
                body:  '<p>Donec ullamcorper nulla non metus auctor fringilla. Maecenas faucibus mollis interdum. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Maecenas sed diam eget risus varius blandit sit amet non magna. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Aenean lacinia bibendum nulla sed consectetur.</p><p>Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.</p><p>Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Nullam quis risus eget urna mollis ornare vel eu leo. Etiam porta sem malesuada magna mollis euismod.</p>',
                image: {
                    url: 'img/news/11.jpg',
                    layout: 'left'
                },
                tags: ['Claims'],
                date: getRandTime()
            },
            /*{
                id:    'news_article_chalk',
                title: 'Blue chalk gets neglected',
                intro: 'School Children favour yellow chalk to write ABC on blackboard.',
                body:  '<p>Etiam porta sem malesuada magna mollis euismod. Donec ullamcorper nulla non metus auctor fringilla. Nullam quis risus eget urna mollis ornare vel eu leo. Vestibulum id ligula porta felis euismod semper. Nulla vitae elit libero, a pharetra augue.</p><p>Nullam quis risus eget urna mollis ornare vel eu leo. Aenean lacinia bibendum nulla sed consectetur. Nulla vitae elit libero, a pharetra augue. Nullam quis risus eget urna mollis ornare vel eu leo. Vestibulum id ligula porta felis euismod semper.</p><p>Nulla vitae elit libero, a pharetra augue. Aenean lacinia bibendum nulla sed consectetur. Nullam quis risus eget urna mollis ornare vel eu leo. Vestibulum id ligula porta felis euismod semper. Donec id elit non mi porta gravida at eget metus.</p><p>Nullam id dolor id nibh ultricies vehicula ut id elit. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur blandit tempus porttitor. Maecenas faucibus mollis interdum. Cras mattis consectetur purus sit amet fermentum. Sed posuere consectetur est at lobortis.</p>',
                image: {
                    url: 'img/news/12.jpg',
                    layout: 'left'
                },
                tags: ['Claims','Manchester'],
                date: getRandTime()
            },*/
            {
                id: 'news_article_13',
                title: 'Lorem Sit Nullam Consectetur Venenatis',
                intro: '<p>Nulla vitae elit libero, a pharetra augue. Curabitur blandit <a href="#">tempus porttitor</a>. Curabitur blandit tempus porttitor. Donec id elit non mi porta gravida at eget metus. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Donec ullamcorper nulla non metus auctor fringilla. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.</p>',
                body:  '<p>Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Cras mattis consectetur purus sit amet fermentum. Donec sed odio dui. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.</p><p>Maecenas sed diam eget risus varius blandit sit amet non magna. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Cras mattis consectetur purus sit amet fermentum. Nullam id dolor id nibh ultricies vehicula ut id elit. Nullam id dolor id nibh ultricies vehicula ut id elit. Maecenas faucibus mollis interdum.</p><p>Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Maecenas sed diam eget risus varius blandit sit amet non magna.</p>',
                image: {
                    url: 'img/news/13.jpg',
                    layout: 'left'
                },
                tags: ['IT','Reigate'],
                date: getRandTime()
            },
            {
                id:    'news_article_14',
                title: 'Ultricies Pharetra Commodo Ullamcorper',
                intro: '<p>Vestibulum id ligula porta felis euismod semper. Aenean lacinia bibendum nulla sed consectetur. Maecenas sed diam eget risus varius blandit sit amet non magna.</p>',
                body:  '<p>Maecenas sed diam eget risus varius blandit sit amet non magna. Vestibulum id ligula porta felis euismod semper. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Etiam porta sem malesuada magna mollis euismod. Nullam quis risus eget urna mollis ornare vel eu leo. Donec ullamcorper nulla non metus auctor fringilla. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.</p><p>Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Nullam id dolor id nibh ultricies vehicula ut id elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Maecenas sed diam eget risus varius blandit sit amet non magna. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.</p>',
                image: {
                    url: 'img/news/14.jpg',
                    layout: 'center'
                },
                tags: ['Internal Comms'],
                date: getRandTime()
            },
            {
                id:    'news_article_15',
                title: 'Maecenas faucibus mollis interdum',
                intro: '<p>Cras mattis consectetur purus sit amet fermentum. Curabitur blandit tempus porttitor.</p>',
                body:  '<p>Aenean lacinia bibendum nulla sed consectetur. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.</p><p>Donec ullamcorper nulla non metus auctor fringilla. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Aenean lacinia bibendum nulla sed consectetur.</p><p>Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nullam id dolor id nibh ultricies vehicula ut id elit. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras mattis consectetur purus sit amet fermentum. Maecenas faucibus mollis interdum. Vestibulum id ligula porta felis euismod semper.</p><p>Curabitur blandit tempus porttitor. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Sed posuere consectetur est at lobortis.</p>',
                image: {
                    url: 'img/news/15.jpg',
                    layout: 'full'
                },
                tags: ['Internal Comms'],
                date: getRandTime()
            },
            {
                id:    'news_article_16',
                title: 'Curabitur blandit tempus porttitor.',
                intro: '<p>Nullam id dolor id nibh ultricies vehicula ut id elit. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.</p>',
                body:  '<p>Vestibulum id ligula porta felis euismod semper. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.</p><p>Nullam id dolor id nibh ultricies vehicula ut id elit. Donec id elit non mi porta gravida at eget metus. Donec sed odio dui. Maecenas faucibus mollis interdum.</p><p>Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec sed odio dui. Vestibulum id ligula porta felis euismod semper. Maecenas sed diam eget risus varius blandit sit amet non magna.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas faucibus mollis interdum. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec id elit non mi porta gravida at eget metus. Cras mattis consectetur purus sit amet fermentum. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.</p><ul><li>Maecenas sed diam eget risus varius blandit sit amet non magna.</li><li>Donec sed odio dui. Fusce dapibus, tellus ac cursus commodo.</li><li>Tortor mauris condimentum nibh.</li><li>Ut fermentum massa justo sit amet risus.</li></ul><p>Morbi leo risus, porta ac consectetur ac, vestibulum at eros.</p><p>Curabitur blandit tempus porttitor. Donec ullamcorper nulla non metus auctor fringilla. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vitae elit libero, a pharetra augue.</p>',
                image: {
                    url: 'img/news/16.jpg',
                    layout: 'full'
                },
                tags: ['Internal Comms'],
                date: getRandTime()
            },
            {
                id:    'news_article_17',
                title: 'Nulla vitae elit libero a pharetra augue.',
                intro: '<p>Aenean lacinia bibendum nulla sed consectetur. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Maecenas sed diam eget risus varius blandit sit amet non magna.</p>',
                body:  '<p>Donec ullamcorper nulla non metus auctor fringilla. Maecenas faucibus mollis interdum. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Maecenas sed diam eget risus varius blandit sit amet non magna. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Aenean lacinia bibendum nulla sed consectetur.</p><p>Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.</p><p>Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Nullam quis risus eget urna mollis ornare vel eu leo. Etiam porta sem malesuada magna mollis euismod.</p>',
                image: {
                    url: 'img/news/17.jpg',
                    layout: 'full'
                },
                tags: ['Internal Comms'],
                date: getRandTime()
            },
            {
                id:    'news_article_18',
                title: 'Donec id elit non mi porta gravida at eget metus',
                intro: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas sed diam eget risus varius blandit sit amet non magna.</p>',
                body:  '<p>Etiam porta sem malesuada magna mollis euismod. Donec ullamcorper nulla non metus auctor fringilla. Nullam quis risus eget urna mollis ornare vel eu leo. Vestibulum id ligula porta felis euismod semper. Nulla vitae elit libero, a pharetra augue.</p><p>Nullam quis risus eget urna mollis ornare vel eu leo. Aenean lacinia bibendum nulla sed consectetur. Nulla vitae elit libero, a pharetra augue. Nullam quis risus eget urna mollis ornare vel eu leo. Vestibulum id ligula porta felis euismod semper.</p><p>Nulla vitae elit libero, a pharetra augue. Aenean lacinia bibendum nulla sed consectetur. Nullam quis risus eget urna mollis ornare vel eu leo. Vestibulum id ligula porta felis euismod semper. Donec id elit non mi porta gravida at eget metus.</p><p>Nullam id dolor id nibh ultricies vehicula ut id elit. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur blandit tempus porttitor. Maecenas faucibus mollis interdum. Cras mattis consectetur purus sit amet fermentum. Sed posuere consectetur est at lobortis.</p>',
                image: {
                    url: 'img/news/18.jpg',
                    layout: 'full'
                },
                tags: ['Marketing'],
                date: getRandTime()
            },
            {
                id: 'news_article_19',
                title: 'Lorem Sit Nullam Consectetur Venenatis',
                intro: '<p>Nulla vitae elit libero, a pharetra augue. Curabitur blandit <a href="#">tempus porttitor</a>. Curabitur blandit tempus porttitor. Donec id elit non mi porta gravida at eget metus. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Donec ullamcorper nulla non metus auctor fringilla. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.</p>',
                body:  '<p>Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Cras mattis consectetur purus sit amet fermentum. Donec sed odio dui. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.</p><p>Maecenas sed diam eget risus varius blandit sit amet non magna. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Cras mattis consectetur purus sit amet fermentum. Nullam id dolor id nibh ultricies vehicula ut id elit. Nullam id dolor id nibh ultricies vehicula ut id elit. Maecenas faucibus mollis interdum.</p><p>Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Maecenas sed diam eget risus varius blandit sit amet non magna.</p>',
                image: {
                    url: 'img/news/19.jpg',
                    layout: 'full'
                },
                tags: ['Claims', 'Reigate'],
                date: getRandTime()
            },
            {
                id:    'news_article_20',
                title: 'Ultricies Pharetra Commodo Ullamcorper',
                intro: '<p>Vestibulum id ligula porta felis euismod semper. Aenean lacinia bibendum nulla sed consectetur. Maecenas sed diam eget risus varius blandit sit amet non magna.</p>',
                body:  '<p>Maecenas sed diam eget risus varius blandit sit amet non magna. Vestibulum id ligula porta felis euismod semper. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Etiam porta sem malesuada magna mollis euismod. Nullam quis risus eget urna mollis ornare vel eu leo. Donec ullamcorper nulla non metus auctor fringilla. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.</p><p>Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Nullam id dolor id nibh ultricies vehicula ut id elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Maecenas sed diam eget risus varius blandit sit amet non magna. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.</p>',
                image: {
                    url: 'img/news/20.jpg',
                    layout: 'full'
                },
                tags: [],
                date: getRandTime()
            },
            {
                id:    'news_article_21',
                title: 'Maecenas faucibus mollis interdum',
                intro: '<p>Cras mattis consectetur purus sit amet fermentum. Curabitur blandit tempus porttitor.</p>',
                body:  '<p>Aenean lacinia bibendum nulla sed consectetur. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.</p><p>Donec ullamcorper nulla non metus auctor fringilla. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Aenean lacinia bibendum nulla sed consectetur.</p><p>Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nullam id dolor id nibh ultricies vehicula ut id elit. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras mattis consectetur purus sit amet fermentum. Maecenas faucibus mollis interdum. Vestibulum id ligula porta felis euismod semper.</p><p>Curabitur blandit tempus porttitor. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Sed posuere consectetur est at lobortis.</p>',
                image: {
                    url: 'img/news/21.jpg',
                    layout: 'full'
                },
                tags: ['HR'],
                date: getRandTime()
            },
            {
                id:    'news_article_22',
                title: 'Curabitur blandit tempus porttitor.',
                intro: '<p>Nullam id dolor id nibh ultricies vehicula ut id elit. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.</p>',
                body:  '<p>Vestibulum id ligula porta felis euismod semper. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.</p><p>Nullam id dolor id nibh ultricies vehicula ut id elit. Donec id elit non mi porta gravida at eget metus. Donec sed odio dui. Maecenas faucibus mollis interdum.</p><p>Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec sed odio dui. Vestibulum id ligula porta felis euismod semper. Maecenas sed diam eget risus varius blandit sit amet non magna.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas faucibus mollis interdum. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec id elit non mi porta gravida at eget metus. Cras mattis consectetur purus sit amet fermentum. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.</p><ul><li>Maecenas sed diam eget risus varius blandit sit amet non magna.</li><li>Donec sed odio dui. Fusce dapibus, tellus ac cursus commodo.</li><li>Tortor mauris condimentum nibh.</li><li>Ut fermentum massa justo sit amet risus.</li></ul><p>Morbi leo risus, porta ac consectetur ac, vestibulum at eros.</p><p>Curabitur blandit tempus porttitor. Donec ullamcorper nulla non metus auctor fringilla. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vitae elit libero, a pharetra augue.</p>',
                image: {
                    url: 'img/news/22.jpg',
                    layout: 'full'
                },
                tags: ['Legal'],
                date: getRandTime()
            },
            {
                id:    'news_article_23',
                title: 'Nulla vitae elit libero a pharetra augue.',
                intro: '<p>Aenean lacinia bibendum nulla sed consectetur. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Maecenas sed diam eget risus varius blandit sit amet non magna.</p>',
                body:  '<p>Donec ullamcorper nulla non metus auctor fringilla. Maecenas faucibus mollis interdum. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Maecenas sed diam eget risus varius blandit sit amet non magna. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Aenean lacinia bibendum nulla sed consectetur.</p><p>Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.</p><p>Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Nullam quis risus eget urna mollis ornare vel eu leo. Etiam porta sem malesuada magna mollis euismod.</p>',
                image: {
                    url: 'img/news/23.jpg',
                    layout: 'full'
                },
                tags: ['Internal Comms'],
                date: getRandTime()
            },
            {
                id:    'news_article_24',
                title: 'Donec id elit non mi porta gravida at eget metus',
                intro: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas sed diam eget risus varius blandit sit amet non magna.</p>',
                body:  '<p>Etiam porta sem malesuada magna mollis euismod. Donec ullamcorper nulla non metus auctor fringilla. Nullam quis risus eget urna mollis ornare vel eu leo. Vestibulum id ligula porta felis euismod semper. Nulla vitae elit libero, a pharetra augue.</p><p>Nullam quis risus eget urna mollis ornare vel eu leo. Aenean lacinia bibendum nulla sed consectetur. Nulla vitae elit libero, a pharetra augue. Nullam quis risus eget urna mollis ornare vel eu leo. Vestibulum id ligula porta felis euismod semper.</p><p>Nulla vitae elit libero, a pharetra augue. Aenean lacinia bibendum nulla sed consectetur. Nullam quis risus eget urna mollis ornare vel eu leo. Vestibulum id ligula porta felis euismod semper. Donec id elit non mi porta gravida at eget metus.</p><p>Nullam id dolor id nibh ultricies vehicula ut id elit. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur blandit tempus porttitor. Maecenas faucibus mollis interdum. Cras mattis consectetur purus sit amet fermentum. Sed posuere consectetur est at lobortis.</p>',
                image: {
                    url: 'img/news/24.jpg',
                    layout: 'full'
                },
                tags: ['Internal Comms'],
                date: getRandTime()
            },
            {
                id: 'news_article_25',
                title: 'Lorem Sit Nullam Consectetur Venenatis',
                intro: '<p>Nulla vitae elit libero, a pharetra augue. Curabitur blandit <a href="#">tempus porttitor</a>. Curabitur blandit tempus porttitor. Donec id elit non mi porta gravida at eget metus. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Donec ullamcorper nulla non metus auctor fringilla. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.</p>',
                body:  '<p>Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Cras mattis consectetur purus sit amet fermentum. Donec sed odio dui. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.</p><p>Maecenas sed diam eget risus varius blandit sit amet non magna. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Cras mattis consectetur purus sit amet fermentum. Nullam id dolor id nibh ultricies vehicula ut id elit. Nullam id dolor id nibh ultricies vehicula ut id elit. Maecenas faucibus mollis interdum.</p><p>Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Maecenas sed diam eget risus varius blandit sit amet non magna.</p>',
                image: {
                    url: 'img/news/25.jpg',
                    layout: 'left'
                },
                tags: ['Marketing'],
                date: getRandTime()
            },
            {
                id:    'news_article_26',
                title: 'Ultricies Pharetra Commodo Ullamcorper',
                intro: '<p>Vestibulum id ligula porta felis euismod semper. Aenean lacinia bibendum nulla sed consectetur. Maecenas sed diam eget risus varius blandit sit amet non magna.</p>',
                body:  '<p>Maecenas sed diam eget risus varius blandit sit amet non magna. Vestibulum id ligula porta felis euismod semper. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Etiam porta sem malesuada magna mollis euismod. Nullam quis risus eget urna mollis ornare vel eu leo. Donec ullamcorper nulla non metus auctor fringilla. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.</p><p>Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Nullam id dolor id nibh ultricies vehicula ut id elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Maecenas sed diam eget risus varius blandit sit amet non magna. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.</p>',
                image: {
                    url: 'img/news/26.jpg',
                    layout: 'center'
                },
                tags: ['HR', 'IT'],
                date: getRandTime()
            },
            {
                id:    'news_article_27',
                title: 'Maecenas faucibus mollis interdum',
                intro: '<p>Cras mattis consectetur purus sit amet fermentum. Curabitur blandit tempus porttitor.</p>',
                body:  '<p>Aenean lacinia bibendum nulla sed consectetur. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.</p><p>Donec ullamcorper nulla non metus auctor fringilla. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Aenean lacinia bibendum nulla sed consectetur.</p><p>Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nullam id dolor id nibh ultricies vehicula ut id elit. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras mattis consectetur purus sit amet fermentum. Maecenas faucibus mollis interdum. Vestibulum id ligula porta felis euismod semper.</p><p>Curabitur blandit tempus porttitor. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Sed posuere consectetur est at lobortis.</p>',
                image: {
                    url: 'img/news/27.jpg',
                    layout: 'full'
                },
                tags: ['Legal', 'Marketing'],
                date: getRandTime()
            },
            {
                id:    'news_article_28',
                title: 'Curabitur blandit tempus porttitor.',
                intro: '<p>Nullam id dolor id nibh ultricies vehicula ut id elit. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.</p>',
                body:  '<p>Vestibulum id ligula porta felis euismod semper. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.</p><p>Nullam id dolor id nibh ultricies vehicula ut id elit. Donec id elit non mi porta gravida at eget metus. Donec sed odio dui. Maecenas faucibus mollis interdum.</p><p>Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec sed odio dui. Vestibulum id ligula porta felis euismod semper. Maecenas sed diam eget risus varius blandit sit amet non magna.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas faucibus mollis interdum. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec id elit non mi porta gravida at eget metus. Cras mattis consectetur purus sit amet fermentum. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.</p><ul><li>Maecenas sed diam eget risus varius blandit sit amet non magna.</li><li>Donec sed odio dui. Fusce dapibus, tellus ac cursus commodo.</li><li>Tortor mauris condimentum nibh.</li><li>Ut fermentum massa justo sit amet risus.</li></ul><p>Morbi leo risus, porta ac consectetur ac, vestibulum at eros.</p><p>Curabitur blandit tempus porttitor. Donec ullamcorper nulla non metus auctor fringilla. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vitae elit libero, a pharetra augue.</p>',
                image: {
                    url: 'img/news/28.jpg',
                    layout: 'full'
                },
                tags: ['Marketing'],
                date: getRandTime()
            },
            {
                id:    'news_article_29',
                title: 'Nulla vitae elit libero a pharetra augue.',
                intro: '<p>Aenean lacinia bibendum nulla sed consectetur. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Maecenas sed diam eget risus varius blandit sit amet non magna.</p>',
                body:  '<p>Donec ullamcorper nulla non metus auctor fringilla. Maecenas faucibus mollis interdum. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Maecenas sed diam eget risus varius blandit sit amet non magna. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Aenean lacinia bibendum nulla sed consectetur.</p><p>Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.</p><p>Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Nullam quis risus eget urna mollis ornare vel eu leo. Etiam porta sem malesuada magna mollis euismod.</p>',
                image: {
                    url: 'img/news/29.jpg',
                    layout: 'full'
                },
                tags: ['Legal'],
                date: getRandTime()
            },
            {
                id:    'news_article_30',
                title: 'Donec id elit non mi porta gravida at eget metus',
                intro: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas sed diam eget risus varius blandit sit amet non magna.</p>',
                body:  '<p>Etiam porta sem malesuada magna mollis euismod. Donec ullamcorper nulla non metus auctor fringilla. Nullam quis risus eget urna mollis ornare vel eu leo. Vestibulum id ligula porta felis euismod semper. Nulla vitae elit libero, a pharetra augue.</p><p>Nullam quis risus eget urna mollis ornare vel eu leo. Aenean lacinia bibendum nulla sed consectetur. Nulla vitae elit libero, a pharetra augue. Nullam quis risus eget urna mollis ornare vel eu leo. Vestibulum id ligula porta felis euismod semper.</p><p>Nulla vitae elit libero, a pharetra augue. Aenean lacinia bibendum nulla sed consectetur. Nullam quis risus eget urna mollis ornare vel eu leo. Vestibulum id ligula porta felis euismod semper. Donec id elit non mi porta gravida at eget metus.</p><p>Nullam id dolor id nibh ultricies vehicula ut id elit. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur blandit tempus porttitor. Maecenas faucibus mollis interdum. Cras mattis consectetur purus sit amet fermentum. Sed posuere consectetur est at lobortis.</p>',
                image: {
                    url: 'img/news/30.jpg',
                    layout: 'full'
                },
                tags: ['Claims'],
                date: getRandTime()
            },
            {
                id: 'news_article_31',
                title: 'Lorem Sit Nullam Consectetur Venenatis',
                intro: '<p>Nulla vitae elit libero, a pharetra augue. Curabitur blandit <a href="#">tempus porttitor</a>. Curabitur blandit tempus porttitor. Donec id elit non mi porta gravida at eget metus. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Donec ullamcorper nulla non metus auctor fringilla. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.</p>',
                body:  '<p>Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Cras mattis consectetur purus sit amet fermentum. Donec sed odio dui. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.</p><p>Maecenas sed diam eget risus varius blandit sit amet non magna. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Cras mattis consectetur purus sit amet fermentum. Nullam id dolor id nibh ultricies vehicula ut id elit. Nullam id dolor id nibh ultricies vehicula ut id elit. Maecenas faucibus mollis interdum.</p><p>Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Maecenas sed diam eget risus varius blandit sit amet non magna.</p>',
                image: {
                    url: 'img/news/31.jpg',
                    layout: 'full'
                },
                tags: ['Marketing'],
                date: getRandTime()
            },
            {
                id:    'news_article_32',
                title: 'Ultricies Pharetra Commodo Ullamcorper',
                intro: '<p>Vestibulum id ligula porta felis euismod semper. Aenean lacinia bibendum nulla sed consectetur. Maecenas sed diam eget risus varius blandit sit amet non magna.</p>',
                body:  '<p>Maecenas sed diam eget risus varius blandit sit amet non magna. Vestibulum id ligula porta felis euismod semper. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Etiam porta sem malesuada magna mollis euismod. Nullam quis risus eget urna mollis ornare vel eu leo. Donec ullamcorper nulla non metus auctor fringilla. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.</p><p>Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Nullam id dolor id nibh ultricies vehicula ut id elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Maecenas sed diam eget risus varius blandit sit amet non magna. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.</p>',
                image: {
                    url: 'img/news/32.jpg',
                    layout: 'full'
                },
                tags: ['Internal Comms'],
                date: getRandTime()
            },
            {
                id:    'news_article_33',
                title: 'Maecenas faucibus mollis interdum',
                intro: '<p>Cras mattis consectetur purus sit amet fermentum. Curabitur blandit tempus porttitor.</p>',
                body:  '<p>Aenean lacinia bibendum nulla sed consectetur. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.</p><p>Donec ullamcorper nulla non metus auctor fringilla. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Aenean lacinia bibendum nulla sed consectetur.</p><p>Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nullam id dolor id nibh ultricies vehicula ut id elit. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras mattis consectetur purus sit amet fermentum. Maecenas faucibus mollis interdum. Vestibulum id ligula porta felis euismod semper.</p><p>Curabitur blandit tempus porttitor. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Sed posuere consectetur est at lobortis.</p>',
                image: {
                    url: 'img/news/33.jpg',
                    layout: 'full'
                },
                tags: ['Internal Comms'],
                date: getRandTime()
            },
            {
                id:    'news_article_34',
                title: 'Curabitur blandit tempus porttitor.',
                intro: '<p>Nullam id dolor id nibh ultricies vehicula ut id elit. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.</p>',
                body:  '<p>Vestibulum id ligula porta felis euismod semper. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.</p><p>Nullam id dolor id nibh ultricies vehicula ut id elit. Donec id elit non mi porta gravida at eget metus. Donec sed odio dui. Maecenas faucibus mollis interdum.</p><p>Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec sed odio dui. Vestibulum id ligula porta felis euismod semper. Maecenas sed diam eget risus varius blandit sit amet non magna.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas faucibus mollis interdum. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec id elit non mi porta gravida at eget metus. Cras mattis consectetur purus sit amet fermentum. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.</p><ul><li>Maecenas sed diam eget risus varius blandit sit amet non magna.</li><li>Donec sed odio dui. Fusce dapibus, tellus ac cursus commodo.</li><li>Tortor mauris condimentum nibh.</li><li>Ut fermentum massa justo sit amet risus.</li></ul><p>Morbi leo risus, porta ac consectetur ac, vestibulum at eros.</p><p>Curabitur blandit tempus porttitor. Donec ullamcorper nulla non metus auctor fringilla. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vitae elit libero, a pharetra augue.</p>',
                image: {
                    url: 'img/news/34.jpg',
                    layout: 'full'
                },
                tags: ['Internal Comms'],
                date: getRandTime()
            },
            {
                id:    'news_article_35',
                title: 'Nulla vitae elit libero a pharetra augue.',
                intro: '<p>Aenean lacinia bibendum nulla sed consectetur. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Maecenas sed diam eget risus varius blandit sit amet non magna.</p>',
                body:  '<p>Donec ullamcorper nulla non metus auctor fringilla. Maecenas faucibus mollis interdum. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Maecenas sed diam eget risus varius blandit sit amet non magna. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Aenean lacinia bibendum nulla sed consectetur.</p><p>Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.</p><p>Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Nullam quis risus eget urna mollis ornare vel eu leo. Etiam porta sem malesuada magna mollis euismod.</p>',
                image: {
                    url: 'img/news/35.jpg',
                    layout: 'full'
                },
                tags: ['Internal Comms'],
                date: getRandTime()
            },
            {
                id:    'news_article_36',
                title: 'Donec id elit non mi porta gravida at eget metus',
                intro: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas sed diam eget risus varius blandit sit amet non magna.</p>',
                body:  '<p>Etiam porta sem malesuada magna mollis euismod. Donec ullamcorper nulla non metus auctor fringilla. Nullam quis risus eget urna mollis ornare vel eu leo. Vestibulum id ligula porta felis euismod semper. Nulla vitae elit libero, a pharetra augue.</p><p>Nullam quis risus eget urna mollis ornare vel eu leo. Aenean lacinia bibendum nulla sed consectetur. Nulla vitae elit libero, a pharetra augue. Nullam quis risus eget urna mollis ornare vel eu leo. Vestibulum id ligula porta felis euismod semper.</p><p>Nulla vitae elit libero, a pharetra augue. Aenean lacinia bibendum nulla sed consectetur. Nullam quis risus eget urna mollis ornare vel eu leo. Vestibulum id ligula porta felis euismod semper. Donec id elit non mi porta gravida at eget metus.</p><p>Nullam id dolor id nibh ultricies vehicula ut id elit. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur blandit tempus porttitor. Maecenas faucibus mollis interdum. Cras mattis consectetur purus sit amet fermentum. Sed posuere consectetur est at lobortis.</p>',
                image: {
                    url: 'img/news/36.jpg',
                    layout: 'full'
                },
                tags: ['Claims'],
                date: getRandTime()
            },
            {
                id: 'news_article_37',
                title: 'Lorem Sit Nullam Consectetur Venenatis',
                intro: '<p>Nulla vitae elit libero, a pharetra augue. Curabitur blandit <a href="#">tempus porttitor</a>. Curabitur blandit tempus porttitor. Donec id elit non mi porta gravida at eget metus. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Donec ullamcorper nulla non metus auctor fringilla. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.</p>',
                body:  '<p>Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Cras mattis consectetur purus sit amet fermentum. Donec sed odio dui. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.</p><p>Maecenas sed diam eget risus varius blandit sit amet non magna. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Cras mattis consectetur purus sit amet fermentum. Nullam id dolor id nibh ultricies vehicula ut id elit. Nullam id dolor id nibh ultricies vehicula ut id elit. Maecenas faucibus mollis interdum.</p><p>Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Maecenas sed diam eget risus varius blandit sit amet non magna.</p>',
                image: {
                    url: 'img/news/37.jpg',
                    layout: 'left'
                },
                tags: ['Marketing'],
                date: getRandTime()
            },
            {
                id:    'news_article_38',
                title: 'Ultricies Pharetra Commodo Ullamcorper',
                intro: '<p>Vestibulum id ligula porta felis euismod semper. Aenean lacinia bibendum nulla sed consectetur. Maecenas sed diam eget risus varius blandit sit amet non magna.</p>',
                body:  '<p>Maecenas sed diam eget risus varius blandit sit amet non magna. Vestibulum id ligula porta felis euismod semper. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Etiam porta sem malesuada magna mollis euismod. Nullam quis risus eget urna mollis ornare vel eu leo. Donec ullamcorper nulla non metus auctor fringilla. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.</p><p>Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Nullam id dolor id nibh ultricies vehicula ut id elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Maecenas sed diam eget risus varius blandit sit amet non magna. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.</p>',
                image: {
                    url: 'img/news/38.jpg',
                    layout: 'center'
                },
                tags: ['Internal Comms'],
                date: getRandTime()
            },
            {
                id:    'news_article_39',
                title: 'Maecenas faucibus mollis interdum',
                intro: '<p>Cras mattis consectetur purus sit amet fermentum. Curabitur blandit tempus porttitor.</p>',
                body:  '<p>Aenean lacinia bibendum nulla sed consectetur. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.</p><p>Donec ullamcorper nulla non metus auctor fringilla. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Aenean lacinia bibendum nulla sed consectetur.</p><p>Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nullam id dolor id nibh ultricies vehicula ut id elit. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras mattis consectetur purus sit amet fermentum. Maecenas faucibus mollis interdum. Vestibulum id ligula porta felis euismod semper.</p><p>Curabitur blandit tempus porttitor. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Sed posuere consectetur est at lobortis.</p>',
                image: {
                    url: 'img/news/39.jpg',
                    layout: 'full'
                },
                tags: ['HR', 'Glasgow'],
                date: getRandTime()
            },
            {
                id:    'news_article_40',
                title: 'Curabitur blandit tempus porttitor.',
                intro: '<p>Nullam id dolor id nibh ultricies vehicula ut id elit. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.</p>',
                body:  '<p>Vestibulum id ligula porta felis euismod semper. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.</p><p>Nullam id dolor id nibh ultricies vehicula ut id elit. Donec id elit non mi porta gravida at eget metus. Donec sed odio dui. Maecenas faucibus mollis interdum.</p><p>Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec sed odio dui. Vestibulum id ligula porta felis euismod semper. Maecenas sed diam eget risus varius blandit sit amet non magna.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas faucibus mollis interdum. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec id elit non mi porta gravida at eget metus. Cras mattis consectetur purus sit amet fermentum. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.</p><ul><li>Maecenas sed diam eget risus varius blandit sit amet non magna.</li><li>Donec sed odio dui. Fusce dapibus, tellus ac cursus commodo.</li><li>Tortor mauris condimentum nibh.</li><li>Ut fermentum massa justo sit amet risus.</li></ul><p>Morbi leo risus, porta ac consectetur ac, vestibulum at eros.</p><p>Curabitur blandit tempus porttitor. Donec ullamcorper nulla non metus auctor fringilla. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vitae elit libero, a pharetra augue.</p>',
                image: {
                    url: 'img/news/40.jpg',
                    layout: 'full'
                },
                tags: ['Legal'],
                date: getRandTime()
            }
        ];

        var factory = {};

        factory.getNewsStories = function() {
            
            var deferred = $q.defer();

            deferred.resolve(stories);
            
            //deferred.reject();

            return deferred.promise;
        };

        factory.getNewsStoryById = function(storyId) {
            
            var deferred = $q.defer();

            var story = $filter('filter')(stories, {id: storyId}, true)[0];

            deferred.resolve(story);
            
            //deferred.reject();

            return deferred.promise;
        };

        return factory;
    }])

})(window.angular);
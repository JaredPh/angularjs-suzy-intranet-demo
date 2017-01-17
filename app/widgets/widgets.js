(function (angular) {
	'use strict';

	angular.module('es.widgets', [
        'es.filters'
    ])
    

//--  Widget Poll ---------------------------------------------------------------------------------------------------------------------------------------
    
    .directive('widgetPoll',[function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'app/widgets/widgets.poll.html',
            scope: {
                poll: '='
            },
            controller: ['$scope', function ($scope) {
                console.log('$scope',$scope.poll);
            }]
        }
    }])

//--  Widget Weather  -----------------------------------------------------------------------------------------------------------------------------------
    
    .constant('WEATHER_CONFIG',{
        meter: {
            high: 20,
            low: 0
        },
        places: {
            reigate:    '33102',
            manchester: '28218',
            glasgow:    '21125'
        },
        refreshInterval: 15*60*60*1000
    })

    .directive('widgetWeather',[function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'app/widgets/widgets.weather.html',
            controller: ['$scope', 'WeatherFactory', 'WEATHER_CONFIG', function ($scope, WeatherFactory, WEATHER_CONFIG) {
                
                var location = (function () {
                    return ['Manchester','Reigate','Glasgow'][Math.round(Math.random()*2)];
                })();

                var high = WEATHER_CONFIG.meter.high;
                var low  = WEATHER_CONFIG.meter.low;
                
                WeatherFactory.setLocation(location);

                $scope.$watch(function() {return WeatherFactory.weather}, function (a) {
                    
                    $scope.weather = WeatherFactory.weather;

                    angular.forEach($scope.weather.forecast,function (value) {
                        high = Math.max(high,value.high);
                        low  = Math.min(low,value.low);
                    });
                });
                
                $scope.setMeter = function (day) {
                    
                    var range = high - low;

                    var top = Math.max(0,(high - day.high)/range*100);
                    var bottom = Math.max(0,(day.low - low)/range*100);

                    return {
                        top:    top+'%',
                        bottom: bottom+'%'
                    }
                } 

            }]
        }
    }])

    .factory('WeatherFactory', ['$q', '$http', '$timeout', 'WEATHER_CONFIG', function ($q, $http, $timeout, WEATHER_CONFIG) {
        
        var factory = {};

        factory.weather = {};
        factory.location = null;

        var getWeather = function () {

            var url = 'http://query.yahooapis.com/v1/public/yql?format=json&env=store://datatables.org/alltableswithkeys';
            url += '&q=select * from weather.forecast where woeid = '+WEATHER_CONFIG.places[factory.location]+' and u=\'c\'';

            $http.get(url).success(function (data) {
                
                if (data.query.results) {
                    factory.weather = {
                        location: factory.location,
                        now: data.query.results.channel.item.condition,
                        forecast: data.query.results.channel.item.forecast
                    };

                }

                $timeout(getWeather(),WEATHER_CONFIG.refreshInterval);
                
            })
        }

        factory.setLocation = function (location) {
            factory.location = location.toLowerCase();
            getWeather();
        }

        return factory;
        
    }])                   

//--  Widget Stock --------------------------------------------------------------------------------------------------------------------------------------

    .directive('widgetStock',[function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'app/widgets/widgets.stock.html',
            controller: ['$scope', '$timeout', 'EsureStockPrice', function ($scope, $timeout, EsureStockPrice) {
                
                $scope.data = EsureStockPrice.data;

                $scope.$on('EsureStockPrice.update', function () {
                    $scope.data = EsureStockPrice.data;
                });

                $scope.$watch('data', function () {
                    
                    if ($scope.data.hasOwnProperty('history')) {
                        var chart = {
                            data: {
                                labels: $scope.data.history.labels,
                                series: [
                                    $scope.data.history.prices
                                ]
                            },
                            options: {
                                showPoint: false,
                                axisX: {
                                    showLabel: false
                                },
                                axisY: {
                                    onlyInteger: true
                                },
                                showArea: true,
                                chartPadding: {
                                    left: 5,
                                    bottom: 0
                                }
                            }
                        };

                        new Chartist.Line('.ct-chart', chart.data, chart.options);
                    }
                });
            }]
        }
    }])

    .factory('EsureStockPrice', ['$q','$http','$timeout', '$rootScope', function ($q, $http, $timeout, $rootScope) {
        
        var factory = {};

        factory.data = {};

        var getData = function (interval) {
            $http.get('http://esure.jared.ph/ESUR.json').success(function (data) {
                
                factory.data = {
                    time: moment(data.dataset.refreshed_at).add(12,'hours').format(),
                    price: {
                        current:data.dataset.data[0][1],
                        change: {
                            pence:data.dataset.data[0][1] - data.dataset.data[1][1],
                            percent: (data.dataset.data[0][1]/data.dataset.data[1][1] - 1)*100
                        }
                    },
                    history: (function () {
                    
                        var temp = {
                            labels:[],
                            prices:[]
                        };

                        angular.forEach(data.dataset.data, function (value) {
                            temp.labels.splice(0,0,value[0]);
                            temp.prices.splice(0,0,value[1]); 
                        });

                        return temp;
                    })()
                }

                $rootScope.$broadcast('EsureStockPrice.update');
            });

            $timeout(getData, interval);
        };

        getData(5*60*1000);
        
        return factory;
        
    }])

//--  Widget Trains -------------------------------------------------------------------------------------------------------------------------------------

    .directive('widgetTrains',[function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'app/widgets/widgets.trains.html',
            controller: ['$scope', 'TrainsFactory', function ($scope, TrainsFactory) {
                
                $scope.trains = [];
                
                TrainsFactory.getLiveTrains().then( function (data) {
                    var maxTime = moment().add(1,'hour').format('HH:mm');

                    var filteredData = [];

                    angular.forEach(data, function (element) {
                        if (element.aimed_departure_time <= maxTime) this.push(element);
                    },filteredData);

                    $scope.trains = filteredData;  

                });
            }]
        }
    }])

    .factory('TrainsFactory', ['$q', '$http', function ($q, $http) {

        var factory = {};

        factory.getLiveTrains = function () {

            var url = 'http://transportapi.com/v3/uk/train/station/' + 'REI' + '/live.json';
            var query = '?app_id=03bf8009&app_key=d9307fd91b0247c607e098d5effedc97&train_status=passenger';

            var deferred = $q.defer();

            $http.get(url + query)
                .success(function(data) {
                    deferred.resolve(data.departures.all);
                })
                .error(function(response) {
                    deferred.reject(response);
                });

             return deferred.promise;
        }
        
        return factory;
    }])

})(window.angular);
(function (angular) {
	'use strict';

angular.module('es.openWeatherMap', [
])

    .constant('OpenWeatherMapSettings', {
    	apiKey: '3b3533bf7dd462b66b5609782f34f365',
    	locations: {
    		reigate:    '2639506',
    		glasgow:    '2648579',
    		manchester: '2643123'
    	}	
    })

    .factory('OpenWeatherMap', ['$q', '$http', 'OpenWeatherMapSettings', function ($q, $http, OpenWeatherMapSettings) {
    
    	var data = null;

        var factory = {};

        factory.getCurrent = function () {
                        
            var locationList = (function () {
                var output = '';

                for (var i in OpenWeatherMapSettings.locations) {
                    output = output + ',' + OpenWeatherMapSettings.locations[i];
                }

                return output.substr(1);
            })();

            var url = 'http://api.openweathermap.org/data/2.5/group'
            var query = '?units=metric&appid=' + OpenWeatherMapSettings.apiKey + '&id=' + locationList;
            
            var deferred = $q.defer();

            $http.get(url + query).success(function (data) {
                deferred.resolve(data);
            })
            .error(function (response) {
                deferred.reject(response);
            })

            return deferred.promise;
        };

        factory.getForcastByLocation = function(locName) {
            
            var url = 'http://api.openweathermap.org/data/2.5/forecast'
            var query = '?units=metric&appid=' + OpenWeatherMapSettings.apiKey + '&id=' + OpenWeatherMapSettings.locations[locName];

            var deferred = $q.defer();

            $http.get(url + query).success(function (data) {
            	deferred.resolve(data);
            })
            .error(function (response) {
            	deferred.reject(response);
            })

            return deferred.promise;
        };

        return factory;
    }])

})(window.angular);
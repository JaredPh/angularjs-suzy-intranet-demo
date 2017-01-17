//yqlModule
(function(angular) {
    'use strict';

    angular.module('es.YQL', [
    ])
    
    .factory('YQL', ['$http', '$q', function ($http, $q) {
        
        var url = 'http://query.yahooapis.com/v1/public/yql?format=json&env=store://datatables.org/alltableswithkeys&q=';

        var factory = {};

        factory.getQueryResults = function (query) {
        	
        	var deferred = $q.defer();

            $http.get(url + query)
				.success(function(data) {
                 	deferred.resolve(data.query.results);
                })
                .error(function(response) {
                	deferred.reject(response);
                });

             return deferred.promise;
        };

        return factory;
        
    }])
      
})(window.angular);
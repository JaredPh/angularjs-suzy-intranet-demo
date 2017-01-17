(function (angular) {
    'use strict';

    angular.module('es.filters', [
    ])

    .filter('append', function () {
        return function (input, string) {
            return input + string;
        };
    })

    .filter('capitalize', function () {
        return function (input,option) {

            if (typeof input !== 'string') return input;

            if (option === 'all') {
                input = input.split(' ');

                for (var i in input) {
                    input[i] = input[i].substr(0,1).toUpperCase() + input[i].substr(1);
                }

                return input.join(' ');
            }
            
            return input.substr(0,1).toUpperCase() + input.substr(1);
        };
    })

    .filter('maxCount', function () {
        return function (input, count) {
            if (typeof count === 'number') input = input.slice(0, count);
            return input;
        };
    })
    
    .filter('replace', function () {
        return function (input, search, replace, regex) {
            if (regex) search = new RegExp(search, 'g');

            return input.replace(search,replace);
        };
    })

    .filter('timeago', function() {
        return function(input, format) {

            var output;

            if (format === 'time') {
                output = moment(input);
            }
            else {
                format = (typeof format === 'string') ? format : 'DD/MM/YY HH:mm';
                output = moment(input,format);
            }

            output = output.fromNow();
            output = output.charAt(0).toUpperCase() + output.slice(1);
            
            return output;                
        };
    })

    .filter('twoDp', function () {
        return function (input, signed) {

            if (typeof input === 'number') {
                
                var sign = (input < 0) ? '-' : (signed) ? '+' : '';

                var output = Math.round(Math.abs(input) * 100).toString();

                output = output.split('');
                output.splice(output.length-2,0,'.');
                output = output.join('');

                if (output.indexOf('.') === 0) output = '0' + output;

                output = sign + output;

                return output;
            }
            return input;
        };
    })

    .filter('unit', function () {
        return function (input, unit) {

            if (typeof input == 'undefined') return input;

            switch (unit) {
                case 'degrees':
                    return input+'°'
                default:
                    return input;
            }

        };
    })

})(window.angular);
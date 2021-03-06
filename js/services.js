var app = angular.module('app.services', []);

app.service("getService", function($http, $q) {
    return {
        getData: function(str) {
            var q = $q.defer();
            $http.get('' + str, { headers: { 'X-API-KEY': 'api_key' } }).success(function(data) {
                q.resolve(data);
            });
            return q.promise;
        }
    };
});

app.service("postService", function($http, $q) {
    return {
        postData: function(str, data) {
            var q = $q.defer();
            $http.post('' + str, data, { headers: { 'X-API-KEY': 'api_key' } }).success(function(data) {
                q.resolve(data);
            });
            return q.promise;
        }
    };
});

app.service("trackService", function($http, $q) {
    return {
        start_tracking: function(str) {
            var q = $q.defer();
            var callbackFn = function(location) {
                console.log('BackgroundGeolocation callback:  ' + location.latitude + ',' + location.longitude);
                backgroundGeolocation.finish();

            };
            var failureFn = function(error) {
                console.log('BackgroundGeolocation error');
            };
            backgroundGeolocation.configure(callbackFn, failureFn, {
                desiredAccuracy: 10,
                stationaryRadius: 5,
                distanceFilter: 10,
                interval: 10000,
                url: '',
                httpHeaders: { 'X-API-KEY': 'api_key', 'user_id': str }
            });
            backgroundGeolocation.isLocationEnabled(function(enabled) {
                if (enabled) {
                    backgroundGeolocation.start();
                } else {
                    if (window.confirm('Location is disabled. Would you like to open location settings?')) {
                        backgroundGeolocation.showLocationSettings();
                    }
                }
            });
        },
        stop_tracking: function() {
            backgroundGeolocation.stop();
        }
    };
});

angular.module('app.services').factory('AuthService', function(api, $http, $cookies, $q) {

    function isLoggedIn() {
        var deferred = $q.defer();

        if ($cookies.get('emmcusercookie')) {
            checkUserStatus(true).then(function(result){
                deferred.resolve(result);
            });
        } else {
            checkUserStatus().then(function(result){
                deferred.resolve(result);
            });
        }
        
        return deferred.promise;
    }

    function checkUserStatus(withCookie) {
        var req = {
            method: 'GET',
            url: api.baseUrl + '/auth/status'
        }
        
        return $http(req).then(function successCallback(res) {
            if(!withCookie){
                var expireDate = new Date();
                expireDate.setDate(expireDate.getDate() + 365);
                $cookies.put('emmcusercookie', res.data.data, { 'expires': expireDate });
            }
            return true;
        }, function errorCallback(res) {
            if (res.status == 401) {
                $cookies.remove('emmcusercookie');
                return false;
            }
        });
    }

    function getUserId() {
        return $cookies.get('emmcusercookie');
    }


    function login(email, password) {
        var reqdata = { username: email, password: password };
        var req = {
            method: 'POST',
            url: api.baseUrl + '/auth/login',
            data: reqdata
        }

        return $http(req)
        .then(function successCallback(res) {
            var expireDate = new Date();
            expireDate.setDate(expireDate.getDate() + 365);
            $cookies.put('emmcusercookie', res.data.data.id, { 'expires': expireDate });
            return res;
        }, function errorCallback(res) {
            return res;
        });
    }

    function logout() {
        var req = {
            method: 'GET',
            url: api.baseUrl + '/auth/logout'
        }
        $cookies.remove('emmcusercookie');
        return $http(req)
        .then(function successCallback(res) {
            return res;
        }, function errorCallback(res) {
            return res;
        });
    }

    function register(reqdata) {
        var req = {
            method: 'POST',
            url: api.baseUrl + '/auth/register',
            data: reqdata
        }

        return $http(req)
        .then(function(res) {
            return res;
        }, function(res) {
            return res;
        });
    }

    function forgotpassword(email) {
        var req = {
            method: 'POST',
            url: api.baseUrl + '/auth/forgotpass',
            data: { email: email }
        }

        return $http(req)
        .then(function(res) {
            return res;
        }, function(res) {
            return res;
        });
    }

    return ({
        isLoggedIn: isLoggedIn,
        checkUserStatus: checkUserStatus,
        getUserId: getUserId,
        login: login,
        logout: logout,
        register: register,
        forgotpassword: forgotpassword
    });
});
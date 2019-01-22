angular.module('app.controllers', []).controller('mainCtrl', function($scope, $location, $route, $timeout, $mdDialog, AuthService) {
    $scope.showLoading = false;
    $scope.showErr = false;
    $scope.showMsg = false;
    $scope.loggedin = false;
    $scope.errMsg = "";
    $scope.regMsg = "";


    AuthService.isLoggedIn().then(function(result){
        $scope.loggedin = result;
    });

    $scope.$on('simulateClick', function(event, data) {
        $timeout(function() {
            angular.element(document.querySelector("#" + data)).triggerHandler('click');
        }, 0);
    });

    $scope.$on('showloading', function(event, data) {
        $scope.showLoading = data;
    });

    $scope.$on('showErr', function(event, data, msg) {
        $scope.errMsg = msg;
        $scope.showErr = data;
        $timeout(function() {
            $scope.showErr = false;
        }, 2000);
    });

    $scope.$on('showMsg', function(event, data, msg) {
        $scope.regMsg = msg;
        $scope.showMsg = data;
        $timeout(function() {
            $scope.showMsg = false;
        }, 2000);
    });

    $scope.$on('loggedIn', function(event, data) {
        $scope.loggedin = true;
        $scope.is_employer = data.is_employer;
    });

    $scope.$on('loguserout', function(event, respondedDialog) {
       $scope.logout(respondedDialog);
    });


    $scope.logout = function(respondedDialog) {
      var url = $location.url()
      var reg = new RegExp('\/modas\/[0-9]+')
      if (url.match(reg) && !respondedDialog) {
        $scope.$broadcast('saveModaLogout');
      } else {
        $scope.showLoading = true;
        angular.element(document.querySelector("#about")).find("h5").removeClass("underlined");
        AuthService.logout().then(function(res) {
            $scope.showLoading = false;

            $scope.loggedin = false;
            $location.path('/login');
        })};
      }
});

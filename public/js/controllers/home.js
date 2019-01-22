angular.module('app.controllers').controller('homeCtrl', function($scope, AuthService, UsersService, ModasService, $window, $routeParams, $timeout, $location, $route, $mdDialog) {

  $scope.modasOffset = 0;
  $scope.fetchedAllModas = false;

  $scope.go = function ( path ) {
    $location.path( path );
  }


  $timeout(function() {
    angular.element(document.querySelector(".footerBtn")).find("h5").removeClass("underlined");
    angular.element(document.querySelector("#toolbar")).find("h5").removeClass("underlined");
  }, 20);

  AuthService.isLoggedIn().then(function(result){
      $scope.loggedin = result;
      if ($scope.loggedin) {
          UsersService.getUser(AuthService.getUserId()).then(function(res) {
              if (res.status == 200) {
                  $scope.user = res.data.data;
              }
          });
      }
  });

  $scope.loadModas = function(){
    $scope.$emit('showloading', true);
    ModasService.getUserModas($scope.modasOffset).then(function(res) {
      $scope.modas = res.data.data;
      $scope.$emit('showloading', false);
      if (res.status  == 400){
        $scope.$emit('showErr', true, "something went wrong. please retry");
      }
    });
  }

  $scope.loadModas();

  $scope.loadMoreModas = function() {
    $scope.modasOffset += 20;
    $scope.$emit('showloading', true);
    ModasService.getUserModas($scope.modasOffset).then(function(res) {
      $scope.$emit('showloading', false);
      if (res.status == 200) {
        if (res.data.data.length == 0) {
          $scope.fetchedAllModas = true;
        }
        $scope.modas = $scope.modas.concat(res.data.data);
      } else {
        $scope.$emit('showErr', true, "something went wrong. please retry");
      }
    });
  }

  $scope.copyModa = function(index) {
    var moda = $scope.modas[index];
    $scope.$emit('showloading', true);
    ModasService.copyModa(moda.id).then(function(res) {
      if (res.status == 201) {
        ModasService.getUserModas($scope.modasOffset).then(function(res) {
          $scope.modas = res.data.data;
          $scope.$emit('showloading', false);
          if (res.status  == 400){
            $scope.$emit('showErr', true, "something went wrong. please retry");
          }
        });
      } else {
        $scope.$emit('showErr', true, "something went wrong. please retry");
      }
    });
  }

  $scope.deleteModa = function(index) {
    var moda = $scope.modas[index];
    $scope.$emit('showloading', true);
    ModasService.deleteModa(moda.id).then(function(res) {
      $scope.$emit('showloading', false);
      if (res.status == 200) {
        moda.deleted = true;
        ModasService.getUserModas($scope.modasOffset).then(function(res) {
          $scope.modas = res.data.data;
          $scope.$emit('showloading', false);
          if (res.status  == 400){
            $scope.$emit('showErr', true, "something went wrong. please retry");
          }
        });
      } else {
        $scope.$emit('showErr', true, "something went wrong. please retry");
      }
    });
  }

  $scope.showDeleteModaDialog = function(ev, index) {
    $mdDialog.show({
      locals: {  },
      controllerAs: 'delctrl',
      controller:  DeleteController,
      templateUrl: 'templates/confirmDeleteDialog.tmpl.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true
    })
    .then(function(del) {
      $scope.deleteModa(index);
    }, function() {

    });
  };

  function DeleteController($scope, $mdDialog) {
    $scope.hide = function() {
      $mdDialog.hide();
    };
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    $scope.delete = function(del) {
      $mdDialog.hide();
    };
  };


  $scope.showCollabDialog = function(ev, index) {
    $mdDialog.show({
      locals: { modaId: $scope.modas[index].id, modaCollaborators: $scope.modas[index].collaborators  },
      controllerAs: 'ctrl',
      controller:  DialogController,
      templateUrl: 'templates/collabDialog.tmpl.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true
    })
    .then(function(save) {
      $scope.loadModas();
      $scope.dialogstatus = 'dialog saved';
    }, function() {
      $scope.dialogstatus = 'dialog canceled';
    });
  };

  function DialogController($scope, $mdDialog, modaId, modaCollaborators) {
    $scope.ctrl = {};
    $scope.ctrl.collaborators = !modaCollaborators ? [] : modaCollaborators.list;
    $scope.hide = function() {
      $mdDialog.hide();
    };

    $scope.cancel = function() {
      $mdDialog.cancel();
    };

    $scope.save = function(save) {
      // var collaboratorsStr = '{';
      // $scope.ctrl.collaborators.forEach(function(result) {
      //   collaboratorsStr += '"' + result.email + '",';
      // });
      // collaboratorsStr = collaboratorsStr.substring(0, collaboratorsStr.length-1) + '}';
      ModasService.updateModaCollaborators($scope.ctrl.collaborators, modaId).then(function(res) {
        if (res.status == 200) {

        } else {
          $scope.$emit('showErr', true, "something went wrong. please retry");
        }
      });
      $mdDialog.hide(save);
    };

    $scope.collabSearch = function(query) {

      var contacts = [];
      return ModasService.searchCollabs(query).then(function(res) {
        var results = res.data.data;
        results.forEach(function(result) {
          var contact = {
            name: result.name,
            email: result.email,
            image: result.avatar_urls['48']
          }
          contacts.push(contact);
        });
        return contacts;
      });

    }
  };
});

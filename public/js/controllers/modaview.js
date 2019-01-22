angular.module('app.controllers').controller('modaviewCtrl', function($scope, $timeout, $route, $routeParams, $location, ModasService) {
	$scope.modaIdParam = $routeParams.modaIdParam;
	$scope.printDisabled = true;
	$scope.go = function ( path ) {
		$location.path( path );
		if (path == 'edit') {
			$location.path( '/modas/'+ $scope.modaIdParam );
		}
	}

	angular.element(document).ready(function () {
		$timeout(function() {
			$scope.printDisabled = false;
		}, 1000);
	});

	if ($scope.modaIdParam) {
		ModasService.getModaAccess(parseInt($scope.modaIdParam)).then(function(res) {
			if (!(res.data.data == true)) {  // no access granted
	 		 	$location.path('/');
	 		 	$route.reload();
			}
			else {
				ModasService.getModa(parseInt($scope.modaIdParam)).then(function(res) {
					$scope.modaData = res.data.data.data;
					$scope.modaId = res.data.data.id;
					angular.element(document.querySelector('#graphVizContainer')).empty();
					d3.select("#graphVizContainer").graphviz()
					.zoom(false)
					.renderDot($scope.modaData.workflowDOT);
				});
			}
		});}

	$scope.exportPdf = function() {
		window.print();
	}

});

var app = angular.module('app', ['ngRoute', 'ngCookies', 'app.controllers', 'app.services', 'app.directives', 'ngSanitize', 'ngMessages', 'ngMaterial']);

app.config(function($routeProvider, $locationProvider) {
	$routeProvider
	.when('/', {
		templateUrl: 'templates/home.html',
		controller: 'homeCtrl',
		access: { restricted: true }
	})

	.when('/login', {
		templateUrl: 'templates/login.html',
		controller: 'loginCtrl',
		access: { restricted: false }
	})

	.when('/register', {
		templateUrl: 'templates/register.html',
		controller: 'registerCtrl',
		access: { restricted: false }
	})

	.when('/account', {
		templateUrl: 'templates/account.html',
		controller: 'accountCtrl',
		access: { restricted: true }
	})

	.when('/modas/:modaIdParam', {
		templateUrl: 'templates/moda.html',
		controller: 'modaCtrl',
		access: { restricted: true },
	})

	.when('/modas/view/:modaIdParam', {
		templateUrl: 'templates/modaview.html',
		controller: 'modaviewCtrl',
		access: { restricted: true },
	})

	.when('/newmoda', {
		templateUrl: 'templates/moda.html',
		controller: 'modaCtrl',
		access: { restricted: true }
	})

	.when('/about', {
		templateUrl: 'templates/about.html',
		controller: 'aboutCtrl',
		access: { restricted: false }
	})

	.otherwise({
		redirectTo: '/',
		access: { restricted: true }
	});


	$locationProvider.html5Mode(true);
});

app.constant('api', {
	baseUrl: '/moda/api'
});



app.run(function($rootScope, $location, $route, AuthService) {
	$rootScope.$on('$routeChangeStart', function(event, next, current) {
		AuthService.isLoggedIn().then(function(isloggedin){
			if (next.access.restricted) {
				var nextPath = next.originalPath;
				if (nextPath == "/modas/:modaIdParam") {
					nextPath = "/modas/" + next.params.modaIdParam;
				}
				if (!isloggedin) {
					$location.path('/login').search({ next: nextPath == "/" ? nextPath : nextPath.substring(1) });
					$route.reload();
				}
			}
			if (next.params.next && isloggedin) {
				var newPath = '/' + next.params.next;
				$location.path(newPath);
				$location.url($location.path());
				$route.reload();
			}
		});
	});
});

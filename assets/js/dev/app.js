_.contains = _.includes;

angular
  .module('app', ['ui.router', 'restangular', 'toaster', 'ngAnimate'])
  .config(['$urlRouterProvider', '$stateProvider', 'RestangularProvider', function ($urlRouterProvider, $stateProvider, RestangularProvider) {
    // RestangularProvider.setPlainByDefault = true;
    RestangularProvider.addResponseInterceptor(function (data, operation, what, url, response, deferred) {
      if (data.response && data.response.data) {
        var returnedData = data.response.data;
        returnedData.message = data.response.message;
        returnedData.meta = data.response.meta || {};
        return returnedData;
      } else {
        return data;
      }
    });
    console.log('Angular app started');
    $urlRouterProvider.otherwise('/admin');
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'templates/home.html',
        controller: [
          '$state',
          function ($state) {
            $state.go('home.admin');
          },
        ],
      })
      .state('home.admin', {
        url: '/admin',
        controller: 'adminCtrl',
        templateUrl: 'templates/admin.html',
      })
      .state('home.customer', {
        url: '/customer',
        controller: 'customerCtrl',
        templateUrl: 'templates/customer.html',
      })
      .state('dashboard', {
        url: '/dashboard',
        // controller: 'dashboardCtrl',
        templateUrl: 'templates/dashboard.html',
      });
  }]).factory('API', function (Restangular) {
    return Restangular.withConfig(function (RestangularConfigurer) {
      RestangularConfigurer.setFullResponse(true);
    });
  });

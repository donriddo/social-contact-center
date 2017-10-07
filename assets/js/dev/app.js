_.contains = _.includes;

angular
  .module('app', ['ui.router', 'restangular', 'toaster', 'ngAnimate'])
  .config(['$urlRouterProvider', '$stateProvider', 'RestangularProvider', function ($urlRouterProvider, $stateProvider, RestangularProvider) {
    RestangularProvider.setPlainByDefault = true;
    RestangularProvider.setDefaultHeaders(
      {
        Authorization: `Bearer ${window.localStorage.getItem('JWT_TOKEN')}`,
      }
    );
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
        abstract: true,
        url: '/',
        templateUrl: 'templates/home.html',
        controller: [
          '$scope', function ($scope) {
            $scope.classes = {
              adminClass: 'active',
              customerClass: '',
            };
          },
        ],
      })
      .state('home.admin', {
        url: 'admin',
        controller: 'adminCtrl',
        templateUrl: 'templates/admin.html',
      })
      .state('home.customer', {
        url: 'customer',
        controller: 'customerCtrl',
        templateUrl: 'templates/customer.html',
      })
      .state('dashboard', {
        abstract: true,
        url: '/dashboard',
        templateUrl: 'templates/dashboard.html',
        controller: [
          '$scope', '$state', function ($scope, $state) {
            $scope.classes = {
              facebookClass: 'active',
              twitterClass: '',
            };
            if (!window.localStorage.getItem('JWT_TOKEN'))
              $state.go('home.admin');
            $scope.logout = () => {
              window.localStorage.removeItem('JWT_TOKEN');
              window.localStorage.removeItem('AUTH_USER');
              $state.go('home.admin');
            };
          },
        ],
      })
      .state('dashboard.facebook', {
        url: '/facebook',
        controller: 'facebookCtrl',
        templateUrl: 'templates/facebook.html',
        resolve: {
          customers: [
            'API',
            function (API) {
              return API.all('facebookProfile').customGET('');
            },
          ],
        },
      })
      .state('dashboard.twitter', {
        url: '/twitter',
        controller: 'twitterCtrl',
        templateUrl: 'templates/twitter.html',
        resolve: {
          setup: [
            'API',
            function (API) {
              return API.all('setup').customGET('');
            },
          ],
          customers: [
            'API',
            function (API) {
              return API.all('twitterProfile').customGET('');
            },
          ],
        },
      });
  }]).factory('API', function (Restangular) {
    return Restangular.withConfig(function (RestangularConfigurer) {
      RestangularConfigurer.setFullResponse(true);
    });
  });

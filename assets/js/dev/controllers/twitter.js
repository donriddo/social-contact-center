angular.module('app')
  .controller('twitterCtrl', ['$scope', '$state', 'API', 'toaster', 'setup', 'customers', '$window', function ($scope, $state, API, toaster, setup, customers, $window) {
    console.log('Started: Twitter Controller: ', setup);
    $scope.setup = setup.data;
    $scope.customers = customers.data.data;
    $scope.body = {};

    $scope.requestToken = () => {
      API.all('twitter/token').customGET('').then(response => {
        console.log('Got response: ', response);
        $window.open(`https://api.twitter.com/oauth/authenticate?oauth_token=${response.data.data.authToken}`, '_self');
      }, error => {

        toaster.pop({
          type: 'error',
          title: error.data.message,
        });
      });
    };

    $scope.send = () => {
      let url = $scope.broadcast ? 'twitter/broadcast' : 'twitter/message';
      API.all(url).post($scope.body).then(response => {
        console.log('Got response: ', response);
        toaster.pop(
          {
            type: 'success',
            title: response.data.message,
          }
        );

        setTimeout(function () {
          $state.reload();
        }, 1000);
      }, error => {

        toaster.pop({
          type: 'error',
          title: error.data.message,
        });
      });
    };

  },
  ]);

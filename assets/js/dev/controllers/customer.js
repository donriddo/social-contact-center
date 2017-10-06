angular.module('app')
  .controller('customerCtrl', ['$scope', '$state', 'API', 'toaster', function ($scope, $state, API, toaster) {
    console.log('Started: Customer Controller');
    $scope.submit = () => {
      let body = {
        handle: $scope.handle,
      };
      API.all('twitterProfile').post(body).then(response => {
        console.log('Got response: ', response);
        toaster.pop({
          type: 'success',
          title: response.data.message,
        });
        $state.go('home.customer');
      }, error => {
        console.log('Got error: ', error);
        toaster.pop({
          type: 'error',
          title: error.data.message || error.data.response.message,
        });
        $state.go('home.customer');
      });
    };

  }]);
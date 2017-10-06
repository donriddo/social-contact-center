angular.module('app')
  .controller('adminCtrl', ['$scope', '$state', 'API', 'toaster', function ($scope, $state, API, toaster) {
    console.log('Started: Admin Controller');
    $scope.login = () => {
      let body = {
        email: $scope.email,
        password: $scope.password,
      };
      API.all('login').post(body).then(response => {
        console.log('Got response: ', response);
        toaster.pop(
          {
            type: 'success',
            title: response.data.message,
          }
        );

        // $state.go('dashboard');
      }, error => {

        toaster.pop({
          type: 'error',
          title: error.data.message,
        });
      });
    };

  }]);
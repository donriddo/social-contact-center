angular.module('app')
  .controller('adminCtrl', ['$scope', '$state', 'API', 'toaster', function ($scope, $state, API, toaster) {
    console.log('Started: Admin Controller');
    $scope.classes.adminClass = 'active';
    $scope.classes.customerClass = '';
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
        window.localStorage.setItem(
          'JWT_TOKEN', response.data.data.token
        );
        window.localStorage.setItem(
          'AUTH_USER', JSON.stringify(response.data.data.user)
        );
        $state.go('dashboard.facebook');
      }, error => {

        toaster.pop({
          type: 'error',
          title: error.data.message,
        });
      });
    };

  }]);
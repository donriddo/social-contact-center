angular.module('app')
  .controller('facebookCtrl', ['$scope', '$state', 'API', 'toaster', 'customers', function ($scope, $state, API, toaster, customers) {
    console.log('Started: Facebook Controller: ', customers.data);
    console.log(
      `Welcome ${JSON.parse(window.localStorage.getItem('AUTH_USER')).firstName}`
    );
    $scope.customers = customers.data.data;
    $scope.body = {};

    $scope.send = () => {

      let url = $scope.broadcast ? 'facebook/broadcast' : 'facebook/message';
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

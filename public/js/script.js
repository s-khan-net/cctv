var module = angular.module("cctvApp",[])

module.controller("ctrlProducts", ['$scope', '$http', function ($scope, $http) {
    var FullList = [];
    $scope.wait = true;
    $scope.loaderMsg = 'Loading...';
    $http.get('/api/products')
        .then(function (result) {
            $scope.products = result.data;
        }, function (error) {
            alert(error.statusText);
            $scope.wait = false;
    });
}]);
    
angular.module("api",['ui.router']).config(function($stateProvider) {
  $stateProvider
    .state('api', {
      url: '/api',
      templateUrl: '/dev/modules/api/api.html',
      controller: 'api'
    })
})
.controller("api",function($http,$scope){

    $http.get("/dev/route").success(function(data){
      $scope.routes = data
      data.forEach(function( route){
        if( !_.isArray( route.handler)){
          route.handler = [route.handler]
        }
      })
    })
})
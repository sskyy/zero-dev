angular.module("event",['ui.router']).config(function($stateProvider) {
  $stateProvider
    .state('event', {
      url: '/event',
      templateUrl: '/dev/modules/event/event.html',
      controller: 'event'
    })
})
  .controller("event",function($http,$scope){
    $scope.modules = {}

    $http.get("/dev/listener").success(function(data){
      $scope.listeners = data

      _.forEach(data, function( listeners){
        listeners.forEach(function( listener){
          if( !$scope.modules[listener.module]){
            $scope.modules[listener.module] = "#fff"
          }
        })
      })
    })
  })
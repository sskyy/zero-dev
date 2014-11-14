angular.module("event",['ui.router']).config(function($stateProvider) {
  $stateProvider
    .state('event', {
      url: '/event',
      templateUrl: '/dev/modules/event/event.html',
      controller: 'event'
    })
})
  .controller("event",function($http,$scope){

    $http.get("/dev/listener").success(function(data){
      $scope.listeners = data
    })
  })
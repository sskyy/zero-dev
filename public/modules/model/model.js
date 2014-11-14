angular.module("model",['ui.router']).config(function($stateProvider){
  $stateProvider
    .state('model', {
      url : '/model',
      templateUrl: '/dev/modules/model/model.html',
      controller : 'model'
    })

}).controller("model",function($scope,$http){

  $http.get('/dev/model').success(function(models){
    $scope.models = models
  })

})
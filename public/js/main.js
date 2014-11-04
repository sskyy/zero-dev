(function(){
  var module = angular.module('dev',['ui.router'])
    .config(function($stateProvider){
      $stateProvider
        .state('mock', {
          url : '/mock',
          templateUrl: '/dev/mock.html',
          controller : 'mock'
        })
        .state('model', {
          url : '/model',
          templateUrl: '/dev/model.html',
          controller : 'model'
        })
        .state('api', {
          url : '/api',
          templateUrl: '/dev/api.html',
          controller : 'api'
        })
        .state('event', {
          url : '/event',
          templateUrl: '/dev/event.html',
          controller : 'event'
        })
    })
    .controller("mock",function($scope,$http){

      var simulateUrl = '/dev/simulate'

      $scope.url = '/post'
      $scope.method = 'get'
      $scope.data = {}
      $scope.send = function(){
        $http.post(simulateUrl,{url:$scope.url,method:$scope.method,data:$scope.data}).success(function(data){
          Painter.onDataSuccess(data)
        }).error(function(err){
          console.log(err)
        })
      }

      function reset(){
        $scope.newDataKey = ''
        $scope.newDataValue = ''
        $scope.newDataType = 'text'
      }

      $scope.deleteData = function( k ){
        delete $scope.data[k]
      }

      $scope.addData = function() {
        if (!$scope.newDataKey || !$scope.newDataValue) return false

        var newData = {}
        newData[$scope.newDataKey] = $scope.newDataValue
        angular.extend($scope.data, newData)
        console.log( $scope.data )
        reset()
      }
    })
    .controller("model",function($scope,$http){

      $http.get('/dev/model').success(function(models){
        $scope.models = models
      })

    })
    .controller("api",function(){

    })
    .controller("event",function(){

    }).filter('is',function(){
      return function(obj, type){
        if( !_['is'+type]){ return console.log("unknown is filter")}
        return _['is'+type](obj)
      }
    })
    .filter('not',function(){
      return function(obj, type){
        if( !_['is'+type]){ return console.log("unknown is filter")}
        return !_['is'+type](obj)
      }
    })

})()




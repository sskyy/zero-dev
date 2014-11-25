angular.module("api",['ui.router']).config(function($stateProvider) {
  $stateProvider
    .state('api', {
      url: '/api',
      templateUrl: '/dev/modules/api/api.html',
      controller: 'api'
    })
})
.controller("api",function($http,$scope){
    $scope.modules = {}
    $scope.matchedRouteIndexes = {}

    $http.get("/dev/route").success(function(data){
      $scope.routes = data
      data.forEach(function( route){
        //make it an array
        if( !$scope.modules[route.handler.module])  $scope.modules[route.handler.module]= "#fff"
      })
    })


    $scope.getMatchedRouteIndexes = function ( url, method, routes){
      var matchedParams,
        indexes = {}

      routes.forEach( function( route, i ){
        if( method && route.method !== 'all' && method !== route.method ) return

        matchedParams = matchUrl( url, route.url)
        if( matchedParams ){
          indexes[i] = true
        }
      })

      return indexes
    }


    function matchUrl( url, wildcard ){
      if( url == wildcard ) return true

      var keys = _.reduce( wildcard.split("/"), function( a,b){
        var key
        if( b == "*" ){
          key = b
        }else if( /^:/.test(b) ){
          key = b.slice(1)
        }

        return a.concat( key?key:[] )
      },[])

      var rex = "^" + wildcard.replace("*","(.*)").replace(/(^|\/):\w+(\/|$)/g, "$1([\\w\\d_-]+)$2").replace(/\//g,"\\/") + "$"
      var matches = url.match( new RegExp(rex))


      return matches ? _.zipObject( keys, matches.slice(1) ) : false

    }
})
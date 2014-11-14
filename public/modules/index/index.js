angular.module('dev',['ui.router','mock','model','api','event'])

  .filter('is',function(){
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





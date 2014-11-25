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
  }).directive("colorPicker",function(){
    return function( scope,ele,attrs){
      var config = scope.$eval(attrs['colorPicker'])
      $(ele).simpleColor({
        defaultColor : config.default || "#99ccff",
        cellWidth :16,
        cellHeight : 16,
        boxWidth : 16,
        boxHeight:16,
        chooserCSS:{
          border:"1px solid #fff",
          background: "#f5f5f5"
        },
        displayCSS:{
          "-webkit-border-radius": "2px",
          "-moz-border-radius": "2px",
          "border-radius": "2px",
          "border":"none",
          "border-bottom": "1px solid rgba(0,0,0,0.2)"
        },
        onSelect : function( c){
          scope.$apply(function(){
            scope.$eval(attrs['colorPicker']).container[config.id] = "#"+c
          })
        }
      })
    }
  }).directive("jsonTooltip",function(){
    return function( scope,ele,attrs){

      var content = scope.$eval(attrs['jsonTooltip']),
        jsonView = _.isObject(content) ? $("<div></div>").JSONView( content, {collapsed: true} ) : content

      $(ele[0]).tooltipster({
        content:jsonView,
        offsetY:-90,
        position:'bottom',
        fixed : true,
        interactive : true,
        contentCloning : false,
        positionTracker : false
      })
      //Tipped.create( ele[0],jsonView)

    }
  })





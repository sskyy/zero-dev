angular.module("mock",['ui.router']).config(function($stateProvider,$urlRouterProvider){
  $stateProvider
    .state('mock', {
      url : '/mock',
      templateUrl: '/dev/modules/mock/mock.html',
      controller : 'mock'
    })

  $urlRouterProvider.otherwise("/mock");

})
  .controller("mock",function($scope,$http){

  $scope.modules = {}

  var simulateUrl = '/dev/simulate'

  $scope.url = '/post'
  $scope.method = 'get'
  $scope.data = {}
  $scope.send = function( url,method,data){
    $http.post(simulateUrl,{url:url,method:method,data:data}).success(function(data){
      //Painter.onDataSuccess(data)
      $scope.listener = data
      $scope.modules = extractModules(data)
    }).error(function(err){
      console.log(err)
    })
  }

  function extractModules(listener){
    var modules = {}
    modules[listener.module] = "#99ccff"
      listener.stack.forEach(function(triggeredEvent){
        triggeredEvent.attached.forEach(function(matchedEvent){
          matchedEvent.listeners.forEach(function(listener){
            angular.extend(modules,extractModules(listener))
          })
        })
      })
    return modules
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

    $scope.send("/post","get",{})

}).directive("colorPicker",function(){
    return function( scope,ele,attrs){
      $(ele).simpleColor({
        defaultColor : "#99ccff",
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
            var model = scope.$eval(attrs['colorContainer']),id=scope.$eval(attrs['colorId'])
            model[id] = "#"+c
          })
        }
      })
    }
  }).directive("eventTriggered",function(){

    return function( scope, ele,attrs){
      var triggeredEvent = scope.$eval( attrs['eventTriggered'])

      if( !triggeredEvent.attached.length) return

      var listeners = triggeredEvent.attached[0].listeners.length,
        height = 40 + (listeners*30 + (listeners-1)*10)


      var svg = Snap(21,height)
      //console.dir($(ele[0]).find("> .eventName")[0].parentNode)
      svg.remove()
        .append( createSVGElement("line",{x1:5,x2:5,y1:0,y2:55}) )
        .append( createSVGElement("line",{x1:4,x2:20,y1:55,y2:55}) )
        .append( createSVGElement("line",{x1:20,x2:20,y1:40,y2: height} ))

        .append( createTriangle())

        .insertAfter( $(ele[0]).find("> .eventName")[0])
    }
  }).directive("jsonTooltip",function(){
      return function( scope,ele,attrs){

        var content = scope.$eval(attrs['jsonTooltip']),
          jsonView = _.isObject(content) ? $("<div></div>").JSONView( content, {collapsed: true} ) : content

        $(ele[0]).tooltipster({
          content:jsonView,
          //content:"jsonView",
          position:'bottom',
          fixed : true,
          interactive : true,
          contentCloning : false,
          positionTracker : false
        })
        //Tipped.create( ele[0],jsonView)

      }
  })




function createTriangle( attr ){
  attr = attr || {}
  _.defaults(attr,{
    points : "0,0 10,0 5,10"
  })
  return createSVGElement('polygon',attr)
}

function createSVGElement( e,attr){
  var $el = Snap( document.createElementNS('http://www.w3.org/2000/svg', e) )
  return attr ? $el.attr(attr) : $el
}



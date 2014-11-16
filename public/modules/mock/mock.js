angular.module("mock",['ui.router','ui.codemirror','ui.bootstrap.modal','ui.bootstrap.tpls']).config(function($stateProvider,$urlRouterProvider){
  $stateProvider
    .state('mock', {
      url : '/mock',
      templateUrl: '/dev/modules/mock/mock.html',
      controller : 'mock'
    })
  $urlRouterProvider.otherwise("/mock");
})
  .controller("mock",function($scope,$http,$modal){

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

  $scope.addData = function(value, key, data) {
    if (!value || !key ) return false
    angular.extend(data, _.zipObject([key],[value]))
    reset()
  }

  $scope.editSource = function( event, namespace, module, name){
    $http.get('/dev/source?event='+event+'&module='+module+"&name="+name).success(function(data){
      $scope.source = {
        event : event,
        module : module,
        name : name,
        namespace : namespace,
        "function":data.slice(1, data.length -1).replace(/\\n/g,"\n").replace(/\\"/g,'"') }
    }).catch(function(){
      $scope.source = {
        event: event,
        module: module,
        name: name,
        namespace: namespace,
        "function": "function " + name.split(".").pop() + "(){ }"
      }
    })
  }


  $scope.addListenerModal = function( event, attached ){
    var scope = $scope.$new()
    scope.newListener = { namespace:event, "new":true}
    var modalInstance = $modal.open({
      templateUrl: 'addListener.tpl.html',
      scope : scope,
      backdrop : false
    });

    modalInstance.result.then(function (listener) {
      var existMatchedEvent = _.find( attached, function( matchedEvent){
        return matchedEvent.namespace = scope.newListener.namespace
      })

      listener.name = listener.module+"."+listener.name

      if( existMatchedEvent){
        existMatchedEvent.listeners.push( listener)
      }else{
        attached.push({
          namespace:listener.namespace,
          listeners : [listener]
        })
      }

    });
  }

  $scope.save = function( source ){
      $http.post("/dev/save",{event:source.namespace, source:source["function"],module:source.module}).then(function(){
        source.saved = true
      })
    }


  $scope.send("/post","get",{})

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


(function(){
  var cache = {};

  this.tmpl = function tmpl(str, data){
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str) ?
      cache[str] = cache[str] ||
      tmpl(document.getElementById(str).innerHTML) :

      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +

          // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +

          // Convert the template into pure JavaScript
        str
          .replace(/[\r\t\n]/g, " ")
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'")
        + "');}return p.join('');");

    // Provide some basic currying to the user
    return data ? fn( data ) : fn;
  };
})();



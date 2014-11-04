var q = require('q'),
  path = require('path'),
  _ = require('lodash'),
  flo = require('fb-flo-extra'),
  root = process.cwd(),
  modulePath = "./modules",
  colors = require("colors"),
  argv = require('optimist').argv,
  fs = require("fs")

function duplicate(str, num) {
  return (new Array(num + 1)).join(str)
}

function cleanCircular(object, preCached) {
  preCached = preCached || {}
  var cached = _.values(preCached),
    cachedNamespace = _.keys(preCached)

    ;
  (function _cleanCircular(obj, namespace) {
    _.forEach(obj, function (v, k) {
      if (!obj.hasOwnProperty(k)) return
      var i = cached.indexOf(v)

      if (v === obj) {
        obj[k] = "{circular reference of root object}"
      } else if (i !== -1) {
        obj[k] = "{circular reference of " + cachedNamespace[i] + "}"
      } else {
        if (_.isArray(v) || _.isObject(v)) {
          cached.push(v)
          namespace.push(k)
          cachedNamespace.push(namespace.join('.'))
          _cleanCircular(v, namespace)
        }
      }
    })
  }(object, []))

  return object
}

var devModule = {
  route: {
    "/dev/simulate": {
      "function": function (req, res) {

        var url = req.body.url,
          method = req.body.method,
          data = req.body.data

        req.body = data

        req.bus.fire('request.mock', {url: url, method: method, req: req, res: res})

        //all done
        //console.log(req.bus['$$results'])
        req.bus.then(function () {
          ZERO.mlog('dev', 'mock', url, 'done')
          try {
            res.json(cleanCircular(req.bus.$$traceRoot))
          } catch (e) {
            res.status(500).end()
          }
        })
      },
      order: {before: "respond.respondHandler"}
    },
    "/dev/model" : function( req, res){
      res.json(_.mapValues(devModule.dep.model.models,function( model){
        //return _.mapValues( model,function(m){
        //  return typeof m
        //})
        return _.pick(model,['rest','isNode','isFile','relations','security','attributes'])
      }))
    }
  },
  statics: {
    "/dev": path.join(__dirname, './public')
  },
  bootstrap : {
    "function" : function( app, server){
      var statics = {}

      _.forEach( app.modules, function( module){

        if( module.statics ){

          _.forEach( module.statics, function( directoryPath, matchUrl){
            statics[path.relative(root,directoryPath)] ={
              url : matchUrl,
              origin : directoryPath
            }
          })
        }

        if( module.theme && module.theme.directory ){

          statics[path.join(modulePath,module.name, module.theme.directory)] = {
            url : '/' + module.name,
            origin : path.join( root, modulePath, module.name, module.theme.directory )
          }
        }
      })

      var frontEndScriptGlob = Object.keys(statics).map( function( directoryPath){
        return path.join( directoryPath,'**/*.js')
      })

      console.log( "dev module watching:", _.pluck(_.values(statics),"origin"))

      //TODO deal with theme jade->html and script reload
      if( !argv.prod ){
        flo(root,{
          server:server,
          verbose:false,
          glob:[
            'modules/**/*.css',
            'modules/**/*.html',
            'modules/**/*.jade'
          ].concat(frontEndScriptGlob)},function( filepath, callback){

          var matchedStatic = _.pick( statics, function( obj, directoryPath ){
            return directoryPath == filepath.slice(0, directoryPath.length )
          })

          var matchedToArray = _.pairs( matchedStatic)
          if( matchedToArray.length !== 0 ){
            var resourceURL = path.join( matchedToArray[0][1].url, path.relative( matchedToArray[0][1].origin,path.join(root,filepath)))

            callback({
              resourceURL : resourceURL,
              contents : fs.readFileSync(path.join(root,filepath)),
              reload : /\.(js|jade|html)$/.test( resourceURL)
            })
          }

        })
      }
    },
    "order" : {last:true}
  }
}


module.exports = devModule
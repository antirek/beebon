/* global angular, moment, c3 */

angular.module('beebon_dashboard', [
  'ngRoute',
  'ngResource',
  'ui.router',
  'hljs',
  'ui.bootstrap'
])
  .config([
    '$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
      $urlRouterProvider.otherwise('/')
      $stateProvider.state({
        name: 'keys',
        url: '/',
        controller: 'MainBeebonController as mainCtrl',
        templateUrl: '/partials/list'
      }).state({
        name: 'keys.view',
        url: 'view/:key',
        controller: 'KeysBeebonController as listCtrl',
        templateUrl: '/partials/keys'
      }).state({
        name: 'keys.dashboard',
        url: 'dashboard',
        controller: 'DashboardBeebonController as dashboardCtrl',
        templateUrl: '/partials/dashboard'
      }).state({
        name: 'keys.create',
        url: 'create',
        controller: 'DashboardBeebonCreateController as createCtrl',
        templateUrl: '/partials/create'
      })
    }
  ])
  .factory('Keys', [
    '$resource', function ($resource) {
      return $resource('/keys/:key/:id', {
        id: '@_id'
      })
    }
  ])
  .factory('Models', [
    '$http', function ($http) {
      return $http.get('/keys/models')
    }
  ])
  .controller('MainBeebonController', [
    'Models', function (Models) {
      var self
      self = this
      this.models = []
      Models.then(function (response) {
        self.models = response.data
        console.log(self.models)
      })
      console.log('asd')
    }
  ])
  .controller('KeysBeebonController', [
    '$state', '$stateParams', '$http', 'Keys', function ($state, $stateParams, $http, Keys) {
      var self = this
      this.key = $stateParams.key
      this.page = 1
      this.limit = 10
      this.offset = 0
      this.itemCount = 0
      this.selectedItem = null
      this.keys = []
      this.getKeys = function () {
        self.keys = Keys.query({
          key: this.key,
          $limit: this.limit,
          $offset: this.offset,
          $select: ['id', 'tag', 'timestamp']
        })
        console.log(self.keys)
      }
      console.log(this.keys)
      $http.get('/keys/' + this.key + '/count')
        .then(function (response) {
          console.log('response', response)
          self.itemCount = response.data.totalItemCount
          console.log(self.itemCount)
        })
      this.setPage = function () {
        this.offset = (this.page - 1) * this.limit
        return this.getKeys()
      }
      this.selectItem = function (id) {
        self.selectedItem = Keys.get({
          key: self.key,
          id: id
        }, function () {
          self.selectedItem.payload = JSON.stringify(self.selectedItem.payload, null, '\t')
          console.log(self.selectedItem)
        })
      }
      this.getKeys()
      this.logCurl = 'curl -X POST -H "Content-Type: application/json" -d \'{"data":"testData"}\' "http://beeboncollector/api/log/' + this.key + '"'
      this.taskCurl = 'curl -X POST -H "Content-Type: application/json" -d \'{"data":"testData"}\' "http://beeboncollector/api/task/' + this.key + '"'
      this.taskStatusCurl = 'curl -X GET "http://beeboncollector/api/task/' + this.key + '/status/:id"'
    }
  ])
  .controller('DashboardBeebonController', [
    '$http', 'Models', function ($http, Models) {
      var self = this

      this.models = []
      this.date = moment().toDate()
      this.options = {
        initDate: moment().toDate(),
        maxDate: moment().toDate()
      }
      this.show = function () {
        console.log(self.models)
        var results = []
        for (var key in self.models) {
          var model = self.models[key]
          results.push(renderModelChart(model))
        }
        return results
      }
      var renderModelChart = function (model) {
        var date = moment(self.date).format('YYYY-MM-DD')
        $http.get('/keys/' + model + '/chart/' + date).then(function (response) {
          console.log('response.data', response.data)
          console.log('bind', '#' + model + 'Chart')
          c3.generate({
            bindto: '#' + model + 'Chart',
            data: response.data
          })
        })
      }
      Models.then(function (response) {
        self.models = response.data
        return self.show()
      })
      // console.log(this.models);
    }
  ])
  .controller('DashboardBeebonCreateController', [
    '$http', '$state', function ($http, $state) {
      this.create = function () {
        if (this.key.name) {
          return $http.get('/keys/' + this.key.name + '/create').then(function (response) {
            return $state.go('keys', {}, {
              reload: true
            })
          })
        }
      }
      this.key = {}
      // console.log(this.create);
    }
  ])

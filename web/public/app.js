(function() {
  angular.module('beebon_dashboard', ['ngRoute', 'ngResource', 'ui.router', 'hljs', 'ui.bootstrap']).config([
    '$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
      $urlRouterProvider.otherwise('/');
      return $stateProvider.state({
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
      });
    }
  ]).factory('Keys', [
    '$resource', function($resource) {
      return $resource('/keys/:key/:id', {
        id: '@_id'
      });
    }
  ]).factory('Models', [
    '$http', function($http) {
      return $http.get('/keys/models');
    }
  ]).controller('MainBeebonController', [
    'Models', function(Models) {
      var self;
      self = this;
      this.models = [];
      Models.then(function(response) {
        self.models = response.data;
        return console.log(self.models);
      });
      return console.log('asd');
    }
  ]).controller('KeysBeebonController', [
    '$state', '$stateParams', '$http', 'Keys', function($state, $stateParams, $http, Keys) {
      var self;
      self = this;
      this.key = $stateParams.key;
      this.page = 1;
      this.limit = 10;
      this.offset = 0;
      this.itemCount = 0;
      this.selectedItem = null;
      this.keys = [];
      this.getKeys = function() {
        self.keys = Keys.query({
          key: this.key,
          $limit: this.limit,
          $offset: this.offset,
          $select: ['id', 'tag', 'timestamp']
        });
        return console.log(self.keys);
      };
      console.log(this.keys);
      $http.get("/keys/" + this.key + "/count").then(function(response) {
        self.itemCount = response.data.totalItemCount;
        return console.log(self.itemCount);
      });
      this.setPage = function() {
        this.offset = (this.page - 1) * this.limit;
        return this.getKeys();
      };
      this.selectItem = function(id) {
        return self.selectedItem = Keys.get({
          key: self.key,
          id: id
        }, function() {
          self.selectedItem.payload = JSON.stringify(self.selectedItem.payload, null, '\t');
          return console.log(self.selectedItem);
        });
      };
      this.getKeys();
      this.logCurl = 'curl -X POST -H "Content-Type: application/json" -d \'{"data":"testData"}\' "http://beeboncollector/api/log/' + this.key + '"';
      this.taskCurl = 'curl -X POST -H "Content-Type: application/json" -d \'{"data":"testData"}\' "http://beeboncollector/api/task/' + this.key + '"';
      return this.taskStatusCurl = 'curl -X GET "http://beeboncollector/api/task/' + this.key + '/status/:id"';
    }
  ]).controller('DashboardBeebonController', [
    '$http', 'Models', function($http, Models) {
      var renderModelChart, self;
      self = this;
      this.models = [];
      this.date = moment().toDate();
      this.options = {
        initDate: moment().toDate(),
        maxDate: moment().toDate()
      };
      this.show = function() {
        var key, model, results;
        console.log(self.models);
        results = [];
        for (key in self.models) {
          model = self.models[key];
          results.push(renderModelChart(model));
        }
        return results;
      };
      renderModelChart = function(model) {
        var date;
        date = moment(self.date).format('YYYY-MM-DD');
        return $http.get("/keys/" + model + "/chart/" + date).then(function(response) {
          console.log('response.data', response.data);
          console.log('bind', "#" + model + "Chart")
          
          return c3.generate({
            bindto: "#" + model + "Chart",
            data: response.data
          });
          
        });
      };
      Models.then(function(response) {
        self.models = response.data;
        return self.show();
      });
      return console.log(this.models);
    }
  ]).controller('DashboardBeebonCreateController', [
    '$http', '$state', function($http, $state) {
      this.create = function() {
        if (this.key.name) {
          return $http.get("/keys/" + this.key.name + "/create").then(function(response) {
            return $state.go('keys', {}, {
              reload: true
            });
          });
        }
      };
      this.key = {};
      return console.log(this.create);
    }
  ]);

}).call(this);

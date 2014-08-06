/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
.factory('View', ['$http', '$q', 'Settings', function($http, $q, Settings) {

  function ViewInstance(item){
    angular.extend(this, item);
  };

  ViewInstance.find = function(viewName, version, instanceName) {
    var deferred = $q.defer();
    var fields = [
      'privileges/PrivilegeInfo',
      'ViewInstanceInfo',
      'resources'
    ];

    $http({
      method: 'GET',
      url: Settings.baseUrl + '/views/'+viewName+'/versions/'+version+'/instances/'+instanceName,
      params:{
        'fields': fields.join(',')
      }
    })
    .success(function(data) {
      deferred.resolve(new ViewInstance(data));
    })
    .error(function(data) {
      deferred.reject(data);
    });

    return deferred.promise;
  };


  function View(item){
    var self = this;
    self.view_name = item.ViewInfo.view_name;
    self.versions = '';
    self.instances = [];
    angular.forEach(item.versions, function(version) {
      self.versions += (self.versions ? ', ' : '') + version.ViewVersionInfo.version;
      angular.forEach(version.instances, function(isntance) {
        isntance.label = version.ViewVersionInfo.label;
      })
      self.instances = self.instances.concat(version.instances);
    });

    self.versionsList = item.versions;
  }

  View.getInstance = function(viewName, version, instanceName) {
    return ViewInstance.find(viewName, version, instanceName);
  };

  View.deleteInstance = function(viewName, version, instanceName) {
    return $http.delete(Settings.baseUrl +'/views/'+viewName+'/versions/'+version+'/instances/'+instanceName, {
      headers: {
        'X-Requested-By': 'ambari'
      }
    });
  };

  View.updateInstance = function(viewName, version, instanceName, data) {
    return $http({
      method: 'PUT',
      url: Settings.baseUrl + '/views/' +viewName + '/versions/'+version+'/instances/' + instanceName,
      data: data
    });
  };

  View.getPermissions = function(viewName, version) {
    return $http({
      method: 'GET',
      url: Settings.baseUrl + '/views/' + viewName + '/versions/'+ version
    });
  };

  View.createInstance = function(instanceInfo) {
    var deferred = $q.defer();
    var properties = {};

    angular.forEach(instanceInfo.properties, function(property) {
      properties[property.name] = property.value
    });

    $http({
      method: 'POST',
      url: Settings.baseUrl + '/views/' + instanceInfo.view_name +'/versions/'+instanceInfo.version + '/instances/'+instanceInfo.instance_name,
      data:{
        'ViewInstanceInfo' : {
          instance_name: instanceInfo.instance_name,
          label: instanceInfo.label,
          visible: instanceInfo.visible,
          icon_path: instanceInfo.icon_path,
          icon64_path: instanceInfo.icon64_path,
          properties: properties
        }
      }
    })
    .success(function(data) {
      deferred.resolve(data);
    })
    .error(function(data) {
      deferred.reject(data);
    });

    return deferred.promise;
  };

  View.all = function() {
    var deferred = $q.defer();
    var fields = [
      'versions/ViewVersionInfo/version',
      'versions/instances/ViewInstanceInfo',
      'versions/ViewVersionInfo'
    ];

    $http({
      method: 'GET',
      url: Settings.baseUrl + '/views',
      params:{
        'fields': fields.join(',')
      }
    }).success(function(data) {
      var views = [];
      angular.forEach(data.items, function(item) {
        views.push(new View(item));
      });
      deferred.resolve(views);
    })
    .error(function(data) {
      deferred.reject(data);
    });

    return deferred.promise;
  };
  return View;
}]);
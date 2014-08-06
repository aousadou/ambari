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

var customDatePopup = require('/views/common/custom_date_popup');

App.MainConfigHistoryController = Em.ArrayController.extend(App.TableServerMixin, {
  name: 'mainConfigHistoryController',

  dataSource: App.ServiceConfigVersion.find(),
  content: function () {
    return this.get('dataSource').filterProperty('isRequested');
  }.property('dataSource.@each.isRequested'),
  isPolling: false,
  filteredCount: 0,
  mockUrl: '/data/configurations/service_versions.json',
  realUrl: function () {
    return App.apiPrefix + '/clusters/' + App.get('clusterName') + '/configurations/serviceconfigversions?<parameters>fields=serviceconfigversion,user,appliedtime,createtime,service_name&minimal_response=true';
  }.property('App.clusterName'),

  /**
   * associations between host property and column index
   * @type {Array}
   */
  colPropAssoc: function () {
    var associations = [];
    associations[1] = 'serviceVersion';
    associations[2] = 'appliedTime';
    associations[3] = 'author';
    associations[4] = 'notes';
    return associations;
  }.property(),

  filterProps: [
    {
      name: 'serviceVersion',
      key: 'service_name',
      type: 'EQUAL'
    },
    {
      name: 'appliedTime',
      key: 'appliedtime',
      type: 'MORE'
    },
    {
      name: 'author',
      key: 'user',
      type: 'MATCH'
    }
    //TODO uncomment when API contains "notes" property
    /*,
    {
      name: 'notes',
      key: '',
      type: 'MATCH'
    }*/
  ],

  sortProps: [
    {
      name: 'serviceVersion',
      key: 'service_name'
    },
    {
      name: 'appliedTime',
      key: 'appliedtime'
    },
    {
      name: 'author',
      key: 'user'
    }/*,
    {
      name: 'notes',
      key: ''
    }*/
  ],

  modifiedFilter: Em.Object.create({
    optionValue: 'Any',
    filterModified: function () {
      var time = "";
      var curTime = new Date().getTime();

      switch (this.get('optionValue')) {
        case 'Past 1 hour':
          time = curTime - 3600000;
          break;
        case 'Past 1 Day':
          time = curTime - 86400000;
          break;
        case 'Past 2 Days':
          time = curTime - 172800000;
          break;
        case 'Past 7 Days':
          time = curTime - 604800000;
          break;
        case 'Past 14 Days':
          time = curTime - 1209600000;
          break;
        case 'Past 30 Days':
          time = curTime - 2592000000;
          break;
        case 'Custom':
          customDatePopup.showCustomDatePopup(this, this.get('actualValues'));
          break;
        case 'Any':
          time = "";
          break;
      }
      if (this.get('modified') !== "Custom") {
        this.set("actualValues.startTime", time);
        this.set("actualValues.endTime", '');
      }
    }.observes('optionValue'),
    cancel: function () {
      this.set('optionValue', 'Any');
    },
    actualValues: Em.Object.create({
      startTime: "",
      endTime: ""
    })
  }),

  /**
   * get data from server and push it to model
   * @return {*}
   */
  loadHistoryToModel: function () {
    var dfd = $.Deferred();
    var queryParams = this.getQueryParameters();

    App.HttpClient.get(this.getUrl(queryParams), App.serviceConfigVersionsMapper, {
      complete: function () {
        dfd.resolve();
      }
    });
    return dfd.promise();
  },

  getUrl: function (queryParams) {
    var params = '';
    if (App.get('testMode')) {
      return this.get('mockUrl');
    } else {
      if (queryParams) {
        params = App.router.get('updateController').computeParameters(queryParams);
      }
      return this.get('realUrl').replace('<parameters>', params);
    }
  },

  /**
   * request latest data from server and update content
   */
  doPolling: function () {
    var self = this;

    setTimeout(function () {
      if (self.get('isPolling')) {
        self.loadHistoryToModel().done(function () {
          self.doPolling();
        })
      }
    }, App.componentsUpdateInterval);
  }
});

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

var App = require('app');

var modelSetup = require('test/init_model_test');
require('models/service');

var service,
  serviceData = {
    id: 'service'
  },
  healthCases = [
    {
      status: 'STARTED',
      health: 'green'
    },
    {
      status: 'STARTING',
      health: 'green-blinking'
    },
    {
      status: 'INSTALLED',
      health: 'red'
    },
    {
      status: 'STOPPING',
      health: 'red-blinking'
    },
    {
      status: 'UNKNOWN',
      health: 'yellow'
    },
    {
      status: 'ANOTHER',
      health: 'yellow'
    }
  ],
  statusPropertiesCases = [
    {
      status: 'INSTALLED',
      property: 'isStopped'
    },
    {
      status: 'STARTED',
      property: 'isStarted'
    }
  ],
  services = [
    {
      name: 'HDFS',
      configurable: true
    },
    {
      name: 'YARN',
      configurable: true
    },
    {
      name: 'MAPREDUCE',
      configurable: true
    },
    {
      name: 'MAPREDUCE2',
      configurable: true
    },
    {
      name:'TEZ',
      clientOnly: true,
      configurable: true
    },
    {
      name: 'HBASE',
      configurable: true
    },
    {
      name: 'HIVE',
      configurable: true
    },
    {
      name: 'HCATALOG',
      clientOnly: true
    },
    {
      name: 'WEBHCAT',
      configurable: true
    },
    {
      name: 'FLUME',
      configurable: true
    },
    {
      name: 'FALCON',
      configurable: true
    },
    {
      name: 'STORM',
      configurable: true
    },
    {
      name: 'OOZIE',
      configurable: true
    },
    {
      name: 'GANGLIA',
      configurable: true
    },
    {
      name: 'NAGIOS',
      configurable: true
    },
    {
      name: 'ZOOKEEPER',
      configurable: true
    },
    {
      name: 'PIG',
      configurable: true,
      clientOnly: true
    },
    {
      name: 'SQOOP',
      clientOnly: true
    },
    {
      name: 'HUE',
      configurable: true
    }
  ],
  clientsOnly = services.filterProperty('clientOnly').mapProperty('name'),
  configurable = services.filterProperty('configurable').mapProperty('name'),
  hostComponentsDataFalse = [
    [],
    [
      {
        staleConfigs: false
      }
    ],
    [
      {
        serviceName: 'HIVE',
        staleConfigs: false
      }
    ]
  ],
  hostComponentsDataTrue = [
    [
      Em.Object.create({
        staleConfigs: true,
        displayName: 'service0'
      })
    ],
    [
      Em.Object.create({
        host: {
          publicHostName: 'host0'
        },
        staleConfigs: true,
        displayName: 'service1'
      })
    ]
  ],
  restartData = {
    host0: ['service0', 'service1']
};

describe('App.Service', function () {

  beforeEach(function () {
    service = App.Service.createRecord(serviceData);
  });

  afterEach(function () {
    modelSetup.deleteRecord(service);
  });

  describe('#isInPassive', function () {
    it('should be true', function () {
      service.set('passiveState', 'ON');
      expect(service.get('isInPassive')).to.be.true;
    });
    it('should be false', function () {
      service.set('passiveState', 'OFF');
      expect(service.get('isInPassive')).to.be.false;
    });
  });

  describe('#healthStatus', function () {
    healthCases.forEach(function (item) {
      it('should be ' + item.health, function () {
        service.set('workStatus', item.status);
        expect(service.get('healthStatus')).to.equal(item.health);
      });
    });
  });

  statusPropertiesCases.forEach(function (item) {
    var status = item.status,
      property = item.property;
    describe('#' + property, function () {
      it('status ' + status + ' is for ' + property, function () {
        service.set('workStatus', status);
        expect(service.get(property)).to.be.true;
        var falseStates = statusPropertiesCases.mapProperty('property').without(property);
        var falseStatuses = [];
        falseStates.forEach(function (state) {
          falseStatuses.push(service.get(state));
        });
        expect(falseStatuses).to.eql([false]);
      });
    });
  });

  describe('#isClientsOnly', function () {
    clientsOnly.forEach(function (item) {
      it('should be true', function () {
        service.set('serviceName', item);
        expect(service.get('isClientsOnly')).to.be.true;
      });
    });
    it('should be false', function () {
      service.set('serviceName', 'HDFS');
      expect(service.get('isClientsOnly')).to.be.false;
    });
  });

  describe('#isConfigurable', function () {
    configurable.forEach(function (item) {
      it('should be true', function () {
        service.set('serviceName', item);
        expect(service.get('isConfigurable')).to.be.true;
      });
    });
    it('should be false', function () {
      service.set('serviceName', 'SQOOP');
      expect(service.get('isConfigurable')).to.be.false;
    });
  });

  describe('#isRestartRequired', function () {
    hostComponentsDataFalse.forEach(function (item) {
      it('should be false', function () {
        service.reopen({
          hostComponents: item
        });
        expect(service.get('isRestartRequired')).to.be.false;
      });
    });
    hostComponentsDataTrue.forEach(function (item) {
      it('should be true', function () {
        service.reopen({
          hostComponents: item
        });
        expect(service.get('isRestartRequired')).to.be.true;
      });
    });
  });

  describe('#restartRequiredMessage', function () {
    it('should form message for 2 services on 1 host', function () {
      service.set('restartRequiredHostsAndComponents', restartData);
      expect(service.get('restartRequiredMessage')).to.contain('host0');
      expect(service.get('restartRequiredMessage')).to.contain('service0');
      expect(service.get('restartRequiredMessage')).to.contain('service1');
    });
  });

});

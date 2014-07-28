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
require('views/common/quick_view_link_view');
require('models/host_component');
require('models/stack_service_component');
var modelSetup = require('test/init_model_test');

describe('App', function () {

  describe('#stackVersionURL', function () {

    App.QuickViewLinks.reopen({
      loadTags: function () {
      }
    });

    var testCases = [
      {
        title: 'if currentStackVersion and defaultStackVersion are empty then stackVersionURL should contain prefix',
        currentStackVersion: '',
        defaultStackVersion: '',
        result: '/stacks/HDP/versions/'
      },
      {
        title: 'if currentStackVersion is "HDP-1.3.1" then stackVersionURL should be "/stacks/HDP/versions/1.3.1"',
        currentStackVersion: 'HDP-1.3.1',
        defaultStackVersion: '',
        result: '/stacks/HDP/versions/1.3.1'
      },
      {
        title: 'if defaultStackVersion is "HDP-1.3.1" then stackVersionURL should be "/stacks/HDP/versions/1.3.1"',
        currentStackVersion: '',
        defaultStackVersion: 'HDP-1.3.1',
        result: '/stacks/HDP/versions/1.3.1'
      },
      {
        title: 'if defaultStackVersion and currentStackVersion are different then stackVersionURL should have currentStackVersion value',
        currentStackVersion: 'HDP-1.3.2',
        defaultStackVersion: 'HDP-1.3.1',
        result: '/stacks/HDP/versions/1.3.2'
      },
      {
        title: 'if defaultStackVersion is "HDPLocal-1.3.1" then stackVersionURL should be "/stacks/HDPLocal/versions/1.3.1"',
        currentStackVersion: '',
        defaultStackVersion: 'HDPLocal-1.3.1',
        result: '/stacks/HDPLocal/versions/1.3.1'
      },
      {
        title: 'if currentStackVersion is "HDPLocal-1.3.1" then stackVersionURL should be "/stacks/HDPLocal/versions/1.3.1"',
        currentStackVersion: 'HDPLocal-1.3.1',
        defaultStackVersion: '',
        result: '/stacks/HDPLocal/versions/1.3.1'
      }
    ];

    testCases.forEach(function (test) {
      it(test.title, function () {
        App.set('currentStackVersion', test.currentStackVersion);
        App.set('defaultStackVersion', test.defaultStackVersion);
        expect(App.get('stackVersionURL')).to.equal(test.result);
        App.set('currentStackVersion', "HDP-1.2.2");
        App.set('defaultStackVersion', "HDP-1.2.2");
      });
    });
  });

  describe('#stack2VersionURL', function () {

    var testCases = [
      {
        title: 'if currentStackVersion and defaultStackVersion are empty then stack2VersionURL should contain prefix',
        currentStackVersion: '',
        defaultStackVersion: '',
        result: '/stacks2/HDP/versions/'
      },
      {
        title: 'if currentStackVersion is "HDP-1.3.1" then stack2VersionURL should be "/stacks2/HDP/versions/1.3.1"',
        currentStackVersion: 'HDP-1.3.1',
        defaultStackVersion: '',
        result: '/stacks2/HDP/versions/1.3.1'
      },
      {
        title: 'if defaultStackVersion is "HDP-1.3.1" then stack2VersionURL should be "/stacks/HDP/versions/1.3.1"',
        currentStackVersion: '',
        defaultStackVersion: 'HDP-1.3.1',
        result: '/stacks2/HDP/versions/1.3.1'
      },
      {
        title: 'if defaultStackVersion and currentStackVersion are different then stack2VersionURL should have currentStackVersion value',
        currentStackVersion: 'HDP-1.3.2',
        defaultStackVersion: 'HDP-1.3.1',
        result: '/stacks2/HDP/versions/1.3.2'
      },
      {
        title: 'if defaultStackVersion is "HDPLocal-1.3.1" then stack2VersionURL should be "/stacks2/HDPLocal/versions/1.3.1"',
        currentStackVersion: '',
        defaultStackVersion: 'HDPLocal-1.3.1',
        result: '/stacks2/HDPLocal/versions/1.3.1'
      },
      {
        title: 'if currentStackVersion is "HDPLocal-1.3.1" then stack2VersionURL should be "/stacks2/HDPLocal/versions/1.3.1"',
        currentStackVersion: 'HDPLocal-1.3.1',
        defaultStackVersion: '',
        result: '/stacks2/HDPLocal/versions/1.3.1'
      }
    ];

    testCases.forEach(function (test) {
      it(test.title, function () {
        App.set('currentStackVersion', test.currentStackVersion);
        App.set('defaultStackVersion', test.defaultStackVersion);
        expect(App.get('stack2VersionURL')).to.equal(test.result);
        App.set('currentStackVersion', "HDP-1.2.2");
        App.set('defaultStackVersion', "HDP-1.2.2");
      });
    });
  });

  describe('#falconServerURL', function () {

    var testCases = [
      {
        title: 'No services installed, url should be empty',
        service: Em.A([]),
        result: ''
      },
      {
        title: 'FALCON is not installed, url should be empty',
        service: Em.A([
          {
            serviceName: 'HDFS'
          }
        ]),
        result: ''
      },
      {
        title: 'FALCON is installed, url should be "host1"',
        service: Em.A([
          Em.Object.create({
            serviceName: 'FALCON',
            hostComponents: [
              Em.Object.create({
                componentName: 'FALCON_SERVER',
                hostName: 'host1'
              })
            ]
          })
        ]),
        result: 'host1'
      }
    ];

    testCases.forEach(function (test) {
      it(test.title, function () {
        sinon.stub(App.Service, 'find', function () {
          return test.service;
        });
        expect(App.get('falconServerURL')).to.equal(test.result);
        App.Service.find.restore();
      });
    });
  });

  describe('#currentStackVersionNumber', function () {

    var testCases = [
      {
        title: 'if currentStackVersion is empty then currentStackVersionNumber should be empty',
        currentStackVersion: '',
        result: ''
      },
      {
        title: 'if currentStackVersion is "HDP-1.3.1" then currentStackVersionNumber should be "1.3.1',
        currentStackVersion: 'HDP-1.3.1',
        result: '1.3.1'
      },
      {
        title: 'if currentStackVersion is "HDPLocal-1.3.1" then currentStackVersionNumber should be "1.3.1',
        currentStackVersion: 'HDPLocal-1.3.1',
        result: '1.3.1'
      }
    ];

    testCases.forEach(function (test) {
      it(test.title, function () {
        App.set('currentStackVersion', test.currentStackVersion);
        expect(App.get('currentStackVersionNumber')).to.equal(test.result);
        App.set('currentStackVersion', "HDP-1.2.2");
      });
    });
  });

  describe('#isHadoop2Stack', function () {

    var testCases = [
      {
        title: 'if currentStackVersion is empty then isHadoop2Stack should be false',
        currentStackVersion: '',
        result: false
      },
      {
        title: 'if currentStackVersion is "HDP-1.9.9" then isHadoop2Stack should be false',
        currentStackVersion: 'HDP-1.9.9',
        result: false
      },
      {
        title: 'if currentStackVersion is "HDP-2.0.0" then isHadoop2Stack should be true',
        currentStackVersion: 'HDP-2.0.0',
        result: true
      },
      {
        title: 'if currentStackVersion is "HDP-2.0.1" then isHadoop2Stack should be true',
        currentStackVersion: 'HDP-2.0.1',
        result: true
      }
    ];

    testCases.forEach(function (test) {
      it(test.title, function () {
        App.set('currentStackVersion', test.currentStackVersion);
        expect(App.get('isHadoop2Stack')).to.equal(test.result);
        App.set('currentStackVersion', "HDP-1.2.2");
      });
    });
  });

  describe('#isHadoop21Stack', function () {
    var tests = [
      {
        v: '',
        e: false
      },
      {
        v: 'HDP',
        e: false
      },
      {
        v: 'HDP1',
        e: false
      },
      {
        v: 'HDP-1',
        e: false
      },
      {
        v: 'HDP-2.0',
        e: false
      },
      {
        v: 'HDP-2.0.1000',
        e: false
      },
      {
        v: 'HDP-2.1',
        e: true
      },
      {
        v: 'HDP-2.1.3434',
        e: true
      },
      {
        v: 'HDP-2.2',
        e: true
      },
      {
        v: 'HDP-2.2.1212',
        e: true
      }
    ];
    tests.forEach(function (test) {
      it(test.v, function () {
        App.QuickViewLinks.prototype.setQuickLinks = function () {
        };
        App.set('currentStackVersion', test.v);
        var calculated = App.get('isHadoop21Stack');
        var expected = test.e;
        expect(calculated).to.equal(expected);
      });
    });
  });

  describe('#isHaEnabled', function () {

    it('if hadoop stack version less than 2 then isHaEnabled should be false', function () {
      App.set('currentStackVersion', 'HDP-1.3.1');
      expect(App.get('isHaEnabled')).to.equal(false);
      App.set('currentStackVersion', "HDP-1.2.2");
    });
    it('if hadoop stack version higher than 2 then isHaEnabled should be true', function () {
      App.set('currentStackVersion', 'HDP-2.0.1');
      expect(App.get('isHaEnabled')).to.equal(true);
      App.set('currentStackVersion', "HDP-1.2.2");
    });
    it('if cluster has SECONDARY_NAMENODE then isHaEnabled should be false', function () {
      App.store.load(App.HostComponent, {
        id: 'SECONDARY_NAMENODE',
        component_name: 'SECONDARY_NAMENODE'
      });
      App.set('currentStackVersion', 'HDP-2.0.1');
      expect(App.get('isHaEnabled')).to.equal(false);
      App.set('currentStackVersion', "HDP-1.2.2");
    });
  });

  describe('#services', function () {
    var stackServices = [
      Em.Object.create({
        serviceName: 'S1',
        isClientOnlyService: true
      }),
      Em.Object.create({
        serviceName: 'S2',
        hasClient: true
      }),
      Em.Object.create({
        serviceName: 'S3',
        hasMaster: true
      }),
      Em.Object.create({
        serviceName: 'S4',
        hasSlave: true
      }),
      Em.Object.create({
        serviceName: 'S5',
        isNoConfigTypes: true
      }),
      Em.Object.create({
        serviceName: 'S6',
        isMonitoringService: true
      }),
      Em.Object.create({
        serviceName: 'S7'
      })
    ];

    it('distribute services by categories', function () {
      sinon.stub(App.StackService, 'find', function () {
        return stackServices;
      });

      expect(App.get('services.all')).to.eql(['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7']);
      expect(App.get('services.clientOnly')).to.eql(['S1']);
      expect(App.get('services.hasClient')).to.eql(['S2']);
      expect(App.get('services.hasMaster')).to.eql(['S3']);
      expect(App.get('services.hasSlave')).to.eql(['S4']);
      expect(App.get('services.noConfigTypes')).to.eql(['S5']);
      expect(App.get('services.monitoring')).to.eql(['S6']);
      App.StackService.find.restore();
    });
  });


  describe('#components', function () {
    var testCases = [
      {
        key: 'allComponents',
        data: [
          Em.Object.create({
            componentName: 'C1'
          })
        ],
        result: ['C1']
      },
      {
        key: 'reassignable',
        data: [
          Em.Object.create({
            componentName: 'C2',
            isReassignable: true
          })
        ],
        result: ['C2']
      },
      {
        key: 'restartable',
        data: [
          Em.Object.create({
            componentName: 'C3',
            isRestartable: true
          })
        ],
        result: ['C3']
      },
      {
        key: 'deletable',
        data: [
          Em.Object.create({
            componentName: 'C4',
            isDeletable: true
          })
        ],
        result: ['C4']
      },
      {
        key: 'rollinRestartAllowed',
        data: [
          Em.Object.create({
            componentName: 'C5',
            isRollinRestartAllowed: true
          })
        ],
        result: ['C5']
      },
      {
        key: 'decommissionAllowed',
        data: [
          Em.Object.create({
            componentName: 'C6',
            isDecommissionAllowed: true
          })
        ],
        result: ['C6']
      },
      {
        key: 'refreshConfigsAllowed',
        data: [
          Em.Object.create({
            componentName: 'C7',
            isRefreshConfigsAllowed: true
          })
        ],
        result: ['C7']
      },
      {
        key: 'addableToHost',
        data: [
          Em.Object.create({
            componentName: 'C8',
            isAddableToHost: true
          })
        ],
        result: ['C8']
      },
      {
        key: 'addableMasterInstallerWizard',
        data: [
          Em.Object.create({
            componentName: 'C9',
            isMasterAddableInstallerWizard: true
          })
        ],
        result: ['C9']
      },
      {
        key: 'multipleMasters',
        data: [
          Em.Object.create({
            componentName: 'C10',
            isMasterWithMultipleInstances: true
          })
        ],
        result: ['C10']
      },
      {
        key: 'slaves',
        data: [
          Em.Object.create({
            componentName: 'C11',
            isSlave: true
          })
        ],
        result: ['C11']
      },
      {
        key: 'masters',
        data: [
          Em.Object.create({
            componentName: 'C12',
            isMaster: true
          })
        ],
        result: ['C12']
      },
      {
        key: 'clients',
        data: [
          Em.Object.create({
            componentName: 'C13',
            isClient: true
          })
        ],
        result: ['C13']
      }
    ];

    testCases.forEach(function (test) {
      it(test.key + ' should contain ' + test.result, function () {
        sinon.stub(App.StackServiceComponent, 'find', function () {
          return test.data;
        });

        expect(App.get('components.' + test.key)).to.eql(test.result);

        App.StackServiceComponent.find.restore();
      })
    })
  });
});

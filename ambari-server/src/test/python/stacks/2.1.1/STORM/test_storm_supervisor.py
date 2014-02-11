#!/usr/bin/env python

'''
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
'''

from mock.mock import MagicMock, call, patch
from stacks.utils.RMFTestCase import *
import  resource_management.core.source

@patch.object(resource_management.core.source, "InlineTemplate", new = MagicMock(return_value='InlineTemplateMock'))
class TestStormSupervisor(RMFTestCase):

  def test_configure_default(self):
    self.executeScript("2.1.1/services/STORM/package/scripts/supervisor.py",
                       classname = "Supervisor",
                       command = "configure",
                       config_file="default.json"
    )
    self.assert_configure_default()
    self.assertNoMoreResources()

  def test_start_default(self):
    self.executeScript("2.1.1/services/STORM/package/scripts/supervisor.py",
                       classname = "Supervisor",
                       command = "start",
                       config_file="default.json"
    )

    self.assert_configure_default()

    self.assertResourceCalled('Execute', 'env PATH=$PATH:/usr/jdk64/jdk1.7.0_45/bin /usr/bin/storm supervisor',
      wait_for_finish = False,
      not_if = 'ls /var/run/storm/supervisor.pid >/dev/null 2>&1 && ps `cat /var/run/storm/supervisor.pid` >/dev/null 2>&1',
      user = 'storm',
    )

    self.assertResourceCalled('Execute', 'pgrep -f "^java.+backtype.storm.daemon.supervisor$" > /var/run/storm/supervisor.pid',
      logoutput = True,
      tries = 6,
      user = 'storm',
      try_sleep = 10,
    )

    self.assertNoMoreResources()

  def test_stop_default(self):
    self.executeScript("2.1.1/services/STORM/package/scripts/supervisor.py",
                       classname = "Supervisor",
                       command = "stop",
                       config_file="default.json"
    )
    self.assertResourceCalled('Execute', 'kill `cat /var/run/storm/supervisor.pid` >/dev/null 2>&1')
    self.assertResourceCalled('Execute', '! (ls /var/run/storm/supervisor.pid >/dev/null 2>&1 && ps `cat /var/run/storm/supervisor.pid` >/dev/null 2>&1)',
      tries = 5,
      try_sleep = 3,
    )
    self.assertResourceCalled('Execute', 'rm -f /var/run/storm/supervisor.pid')

  def test_configure_default(self):
    self.executeScript("2.1.1/services/STORM/package/scripts/supervisor.py",
                       classname = "Supervisor",
                       command = "configure",
                       config_file="secured.json"
    )
    self.assert_configure_secured()
    self.assertNoMoreResources()

  def test_start_secured(self):
    self.executeScript("2.1.1/services/STORM/package/scripts/supervisor.py",
                       classname = "Supervisor",
                       command = "start",
                       config_file="secured.json"
    )

    self.assert_configure_secured()

    self.assertResourceCalled('Execute', 'env PATH=$PATH:/usr/jdk64/jdk1.7.0_45/bin /usr/bin/storm supervisor',
      wait_for_finish = False,
      not_if = 'ls /var/run/storm/supervisor.pid >/dev/null 2>&1 && ps `cat /var/run/storm/supervisor.pid` >/dev/null 2>&1',
      user = 'storm',
    )

    self.assertResourceCalled('Execute', 'pgrep -f "^java.+backtype.storm.daemon.supervisor$" > /var/run/storm/supervisor.pid',
      logoutput = True,
      tries = 6,
      user = 'storm',
      try_sleep = 10,
    )

    self.assertNoMoreResources()

  def test_stop_secured(self):
    self.executeScript("2.1.1/services/STORM/package/scripts/supervisor.py",
                       classname = "Supervisor",
                       command = "stop",
                       config_file="secured.json"
    )
    self.assertResourceCalled('Execute', 'kill `cat /var/run/storm/supervisor.pid` >/dev/null 2>&1')
    self.assertResourceCalled('Execute', '! (ls /var/run/storm/supervisor.pid >/dev/null 2>&1 && ps `cat /var/run/storm/supervisor.pid` >/dev/null 2>&1)',
      tries = 5,
      try_sleep = 3,
    )
    self.assertResourceCalled('Execute', 'rm -f /var/run/storm/supervisor.pid')

  def assert_configure_default(self):

    self.assertResourceCalled('Directory', '/var/log/storm',
      owner = 'storm',
      group = 'hadoop',
      recursive = True,
    )
    self.assertResourceCalled('Directory', '/var/run/storm',
      owner = 'storm',
      group = 'hadoop',
      recursive = True,
    )
    self.assertResourceCalled('Directory', '/hadoop/storm',
      owner = 'storm',
      group = 'hadoop',
      recursive = True,
    )
    self.assertResourceCalled('File', '/etc/storm/conf/config.yaml',
      owner = 'storm',
      content = Template('config.yaml.j2'),
      group = 'hadoop',
    )
    self.assertResourceCalled('File', '/etc/storm/conf/storm.yaml',
      owner = 'storm',
      content = 'InlineTemplateMock',
      group = 'hadoop',
      mode = None,
    )

  def assert_configure_secured(self):
    self.assertResourceCalled('Directory', '/var/log/storm',
      owner = 'storm',
      group = 'hadoop',
      recursive = True,
    )
    self.assertResourceCalled('Directory', '/var/run/storm',
      owner = 'storm',
      group = 'hadoop',
      recursive = True,
    )
    self.assertResourceCalled('Directory', '/hadoop/storm',
      owner = 'storm',
      group = 'hadoop',
      recursive = True,
    )
    self.assertResourceCalled('File', '/etc/storm/conf/config.yaml',
      owner = 'storm',
      content = Template('config.yaml.j2'),
      group = 'hadoop',
    )
    self.assertResourceCalled('File', '/etc/storm/conf/storm.yaml',
      owner = 'storm',
      content = 'InlineTemplateMock',
      group = 'hadoop',
      mode = None,
    )
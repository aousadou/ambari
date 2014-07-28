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
module.exports =
{
  "configProperties": [
    {
      "id": "puppet var",
      "name": "security_enabled",
      "displayName": "Enable security",
      "value": "",
      "defaultValue": 'true',
      "description": "Enable kerberos security for the cluster",
      "isVisible": false,
      "isOverridable": false,
      "serviceName": "GENERAL",
      "filename": "hadoop-env.xml",
      "category": "KERBEROS"
    },
    {
      "id": "puppet var",
      "name": "kerberos_install_type",
      "displayName": "Type of security",
      "value": "",
      "defaultValue": "MANUALLY_SET_KERBEROS",
      "description": "Type of kerberos security for the cluster",
      "isVisible": false,
      "isOverridable": false,
      "serviceName": "GENERAL",
      "category": "KERBEROS"
    },
    {
      "id": "puppet var",
      "name": "keytab_path",
      "displayName": "Path to keytab file",
      "value": "",
      "defaultValue": "/etc/security/keytabs",
      "description": "Type of kerberos security for the cluster",
      "displayType": "principal",
      "isVisible": false,
      "isOverridable": false,
      "serviceName": "GENERAL",
      "category": "AMBARI"
    },
    {
      "id": "puppet var",
      "name": "kerberos_domain",
      "displayName": "Realm name",
      "value": "",
      "defaultValue": "EXAMPLE.COM",
      "description": "Realm name to be used for all principal names",
      "displayType": "advanced",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "GENERAL",
      "filename": "hadoop-env.xml",
      "category": "KERBEROS"
    },
    {
      "id": "puppet var",
      "name": "kinit_path_local",
      "displayName": "Kerberos tool path",
      "value": "",
      "defaultValue": "/usr/bin",
      "description": "Directoy path to installed kerberos tools like kinit, kdestroy etc. This can have multiple comma delimited paths",
      "displayType": "directory",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "GENERAL",
      "category": "KERBEROS"
    },
    {
      "id": "puppet var",
      "name": "smokeuser_principal_name",
      "displayName": "Smoke test user principal",
      "value": "",
      "defaultValue": "ambari-qa",
      "description": "This is the principal name for Smoke test user",
      "displayType": "principal",
      "isVisible": true,
      "isOverridable": false,
      "isReconfigurable": false,
      "serviceName": "GENERAL",
      "category": "AMBARI"
    },
    {
      "id": "puppet var",
      "name": "smokeuser_keytab",
      "displayName": "Path to smoke test user keytab file",
      "value": "",
      "defaultValue": "/etc/security/keytabs/smokeuser.headless.keytab",
      "description": "Path to keytab file for smoke test user",
      "displayType": "directory",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "GENERAL",
      "filename": "hadoop-env.xml",
      "category": "AMBARI"
    },
    {
      "id": "puppet var",
      "name": "hdfs_principal_name",
      "displayName": "HDFS user principal",
      "value": "",
      "defaultValue": "hdfs",
      "description": "This is the principal name for HDFS user",
      "displayType": "principal",
      "isVisible": true,
      "isOverridable": false,
      "isReconfigurable": false,
      "serviceName": "GENERAL",
      "category": "AMBARI"
    },
    {
      "id": "puppet var",
      "name": "hdfs_user_keytab",
      "displayName": "Path to HDFS user keytab file",
      "value": "",
      "defaultValue": "/etc/security/keytabs/hdfs.headless.keytab",
      "description": "Path to keytab file for HDFS user",
      "displayType": "directory",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "GENERAL",
      "filename": "hadoop-env.xml",
      "category": "AMBARI"
    },
    {
      "id": "puppet var",
      "name": "hbase_principal_name",
      "displayName": "HBase user principal",
      "value": "",
      "defaultValue": "hbase",
      "description": "This is the principal name for HBase user",
      "displayType": "principal",
      "isVisible": false,
      "isOverridable": false,
      "isReconfigurable": false,
      "serviceName": "GENERAL",
      "category": "AMBARI"
    },
    {
      "id": "puppet var",
      "name": "hbase_user_keytab",
      "displayName": "Path to HBase user keytab file",
      "value": "",
      "defaultValue": "/etc/security/keytabs/hbase.headless.keytab",
      "description": "Path to keytab file for Hbase user",
      "displayType": "directory",
      "isVisible": false,
      "isOverridable": false,
      "serviceName": "GENERAL",
      "filename": "hbase-env.xml",
      "category": "AMBARI"
    },

  /**********************************************HDFS***************************************/
    {
      "id": "puppet var",
      "name": "namenode_host",
      "displayName": "NameNode hosts",
      "value": "",
      "defaultValue": "",
      "description": "The hosts that has been assigned to run NameNode",
      "displayType": "masterHosts",
      "isOverridable": false,
      "isVisible": true,
      "serviceName": "HDFS",
      "category": "NameNode"
    },
    {
      "id": "puppet var",
      "name": "namenode_principal_name",
      "displayName": "Principal name",
      "value": "",
      "defaultValue": "nn/_HOST",
      "description": "Principal name for NameNode. _HOST will get automatically replaced with actual hostname at an instance of NameNode",
      "displayType": "principal",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "HDFS",
      "category": "NameNode",
      "components": ["NAMENODE"]
    },
    {
      "id": "puppet var",
      "name": "namenode_keytab",
      "displayName": "Path to Keytab File",
      "value": "",
      "defaultValue": "/etc/security/keytabs/nn.service.keytab",
      "description": "Path to NameNode keytab file",
      "displayType": "directory",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "HDFS",
      "category": "NameNode",
      "components": ["NAMENODE"]
    },
    {
      "id": "puppet var",
      "name": "snamenode_host",
      "displayName": "SNameNode host",
      "value": "",
      "defaultValue": "localhost",
      "description": "The host that has been assigned to run SecondaryNameNode",
      "displayType": "masterHost",
      "isOverridable": false,
      "isVisible": true,
      "serviceName": "HDFS",
      "category": "SNameNode"
    },
    {
      "id": "puppet var",
      "name": "snamenode_principal_name",
      "displayName": "Principal name",
      "value": "",
      "defaultValue": "nn/_HOST",
      "description": "Principal name for SNameNode. _HOST will get automatically replaced with actual hostname at an instance of SNameNode",
      "displayType": "principal",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "HDFS",
      "category": "SNameNode",
      "components": ["SECONDARY_NAMENODE"]
    },
    {
      "id": "puppet var",
      "name": "snamenode_keytab",
      "displayName": "Path to Keytab File",
      "value": "",
      "defaultValue": "/etc/security/keytabs/nn.service.keytab",
      "description": "Path to SNameNode keytab file",
      "displayType": "directory",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "HDFS",
      "category": "SNameNode",
      "components": ["SECONDARY_NAMENODE"]
    },
    {
      "id": "puppet var",
      "name": "journalnode_hosts",
      "displayName": "JournalNode hosts",
      "value": "",
      "defaultValue": "localhost",
      "description": "The hosts that have been assigned to run JournalNodes",
      "displayType": "masterHosts",
      "isOverridable": false,
      "isVisible": true,
      "serviceName": "HDFS",
      "category": "JournalNode"
    },
    {
      "id": "puppet var",
      "name": "journalnode_principal_name",
      "displayName": "Principal name",
      "value": "",
      "defaultValue": "jn/_HOST",
      "description": "Principal name for JournalNode. _HOST will get automatically replaced with actual hostname at every instance of JournalNode",
      "displayType": "principal",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "HDFS",
      "category": "JournalNode",
      "component": "JOURNALNODE"
    },
    {
      "id": "puppet var",
      "name": "journalnode_keytab",
      "displayName": "Path to keytab file",
      "value": "",
      "defaultValue": "/etc/security/keytabs/jn.service.keytab",
      "description": "Path to JournalNode keytab file",
      "displayType": "directory",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "HDFS",
      "category": "JournalNode",
      "component": "JOURNALNODE"
    },
    {
      "id": "puppet var",
      "name": "datanode_hosts", //not in the schema. For UI purpose
      "displayName": "DataNode hosts",
      "value": "",
      "defaultValue": "",
      "description": "The hosts that have been assigned to run DataNode",
      "displayType": "slaveHosts",
      "isOverridable": false,
      "isVisible": true,
      "serviceName": "HDFS",
      "category": "DataNode"
    },
    {
      "id": "puppet var",
      "name": "dfs_datanode_address",
      "displayName": "Datanode address",
      "value": "",
      "defaultValue": "1019",
      "description": "Address for DataNode",
      "displayType": "principal",
      "isVisible": false,
      "isOverridable": false,
      "serviceName": "HDFS",
      "category": "DataNode"
    },
    {
      "id": "puppet var",
      "name": "dfs_datanode_http_address",
      "displayName": "Datanode HTTP address",
      "value": "",
      "defaultValue": "1022",
      "description": "Address for DataNode",
      "displayType": "principal",
      "isVisible": false,
      "isOverridable": false,
      "serviceName": "HDFS",
      "category": "DataNode"
    },
    {
      "id": "puppet var",
      "name": "datanode_principal_name",
      "displayName": "Principal name",
      "value": "",
      "defaultValue": "dn/_HOST",
      "description": "Principal name for DataNode. _HOST will get automatically replaced with actual hostname at every instance of DataNode",
      "displayType": "principal",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "HDFS",
      "category": "DataNode",
      "component": "DATANODE"
    },
    {
      "id": "puppet var",
      "name": "datanode_keytab",
      "displayName": "Path to keytab file",
      "value": "",
      "defaultValue": "/etc/security/keytabs/dn.service.keytab",
      "description": "Path to DataNode keytab file",
      "displayType": "directory",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "HDFS",
      "category": "DataNode",
      "component": "DATANODE"
    },
    {
      "id": "puppet var",
      "name": "hadoop_http_principal_name",
      "displayName": "DFS web principal name",
      "value": "",
      "defaultValue": "HTTP/_HOST",
      "description": "Principal name for SPNEGO access for HDFS components. _HOST will get automatically replaced with actual hostname at instance of HDFS component",
      "displayType": "principal",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "HDFS",
      "category": "General"
    },
    {
      "id": "puppet var",
      "name": "hadoop_http_keytab",
      "displayName": "Path to SPNEGO keytab file",
      "value": "",
      "defaultValue": "/etc/security/keytabs/spnego.service.keytab",
      "description": "Path to SPNEGO keytab file for NameNode and SNameNode",
      "displayType": "directory",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "HDFS",
      "category": "General"
    },

  /**********************************************MAPREDUCE2***************************************/
    {
      "id": "puppet var",
      "name": "jobhistoryserver_host",
      "displayName": "History Server host",
      "value": "",
      "defaultValue": "",
      "description": "The host that has been assigned to run History Server",
      "displayType": "masterHost",
      "isOverridable": false,
      "isVisible": true,
      "serviceName": "MAPREDUCE2",
      "category": "JobHistoryServer"
    },
    {
      "id": "puppet var",
      "name": "jobhistory_principal_name",
      "displayName": "Principal name",
      "value": "",
      "defaultValue": "jhs/_HOST",
      "description": "Principal name for History Server. _HOST will get automatically replaced with actual hostname at an instance of History Server",
      "displayType": "principal",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "MAPREDUCE2",
      "category": "JobHistoryServer",
      "component": "HISTORYSERVER"
    },
    {
      "id": "puppet var",
      "name": "jobhistory_keytab",
      "displayName": "Path to keytab file",
      "value": "",
      "defaultValue": "/etc/security/keytabs/jhs.service.keytab",
      "description": "Path to History Server keytab file",
      "displayType": "directory",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "MAPREDUCE2",
      "category": "JobHistoryServer",
      "component": "HISTORYSERVER"
    },
    {
      "id": "puppet var",
      "name": "jobhistory_http_principal_name",
      "displayName": "Web principal name",
      "value": "",
      "defaultValue": "HTTP/_HOST",
      "description": "Principal name for SPNEGO access to Job History Server. _HOST will get automatically replaced with actual hostname at an instance of Job History Server",
      "displayType": "principal",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "MAPREDUCE2",
      "category": "JobHistoryServer"
    },
    {
      "id": "puppet var",
      "name": "jobhistory_http_keytab",
      "displayName": "Path to SPNEGO keytab file",
      "value": "",
      "defaultValue": "/etc/security/keytabs/spnego.service.keytab",
      "description": "Path to SPNEGO keytab file for Job History Server",
      "displayType": "directory",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "MAPREDUCE2",
      "category": "JobHistoryServer"
    },

  /**********************************************YARN***************************************/
    {
      "id": "puppet var",
      "name": "resourcemanager_host",
      "displayName": "ResourceManager host",
      "value": "",
      "defaultValue": "",
      "description": "The host that has been assigned to run ResourceManager",
      "displayType": "masterHost",
      "isOverridable": false,
      "isVisible": true,
      "serviceName": "YARN",
      "category": "ResourceManager"
    },
    {
      "id": "puppet var",
      "name": "resourcemanager_principal_name",
      "displayName": "Principal name",
      "value": "",
      "defaultValue": "rm/_HOST",
      "description": "Principal name for ResourceManager. _HOST will get automatically replaced with actual hostname at an instance of ResourceManager",
      "displayType": "principal",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "YARN",
      "category": "ResourceManager",
      "component": "RESOURCEMANAGER"
    },
    {
      "id": "puppet var",
      "name": "resourcemanager_keytab",
      "displayName": "Path to keytab file",
      "value": "",
      "defaultValue": "/etc/security/keytabs/rm.service.keytab",
      "description": "Path to ResourceManager keytab file",
      "displayType": "directory",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "YARN",
      "category": "ResourceManager",
      "component": "RESOURCEMANAGER"
    },
    {
      "id": "puppet var",
      "name": "resourcemanager_http_principal_name",
      "displayName": "Web principal name",
      "value": "",
      "defaultValue": "HTTP/_HOST",
      "description": "Principal name for SPNEGO access to ResourceManager. _HOST will get automatically replaced with actual hostname at an instance of ResourceManager",
      "displayType": "principal",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "YARN",
      "category": "ResourceManager"
    },
    {
      "id": "puppet var",
      "name": "resourcemanager_http_keytab",
      "displayName": "Path to SPNEGO keytab file",
      "value": "",
      "defaultValue": "/etc/security/keytabs/spnego.service.keytab",
      "description": "Path to SPNEGO keytab file for ResourceManager",
      "displayType": "directory",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "YARN",
      "category": "ResourceManager"
    },
    {
      "id": "puppet var",
      "name": "nodemanager_host",
      "displayName": "NodeManager hosts",
      "value": "",
      "defaultValue": "",
      "description": "The hosts that has been assigned to run NodeManager",
      "displayType": "slaveHosts",
      "isOverridable": false,
      "isVisible": true,
      "serviceName": "YARN",
      "category": "NodeManager"
    },
    {
      "id": "puppet var",
      "name": "nodemanager_principal_name",
      "displayName": "Principal name",
      "value": "",
      "defaultValue": "nm/_HOST",
      "description": "Principal name for NodeManager. _HOST will get automatically replaced with actual hostname at all instances of NodeManager",
      "displayType": "principal",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "YARN",
      "category": "NodeManager",
      "component": "NODEMANAGER"
    },
    {
      "id": "puppet var",
      "name": "nodemanager_keytab",
      "displayName": "Path to keytab file",
      "value": "",
      "defaultValue": "/etc/security/keytabs/nm.service.keytab",
      "description": "Path to NodeManager keytab file",
      "displayType": "directory",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "YARN",
      "category": "NodeManager",
      "component": "NODEMANAGER"
    },
    {
      "id": "puppet var",
      "name": "nodemanager_http_principal_name",
      "displayName": "Web principal name",
      "value": "",
      "defaultValue": "HTTP/_HOST",
      "description": "Principal name for SPNEGO access to NodeManager. _HOST will get automatically replaced with actual hostname at all instances of NodeManager",
      "displayType": "principal",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "YARN",
      "category": "NodeManager"
    },
    {
      "id": "puppet var",
      "name": "nodemanager_http_keytab",
      "displayName": "Path to SPNEGO keytab file",
      "value": "",
      "defaultValue": "/etc/security/keytabs/spnego.service.keytab",
      "description": "Path to SPNEGO keytab file for NodeManager",
      "displayType": "directory",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "YARN",
      "category": "NodeManager"
    },
    {
      "id": "puppet var",
      "name": "yarn_nodemanager_container-executor_class",
      "displayName": "yarn.nodemanager.container-executor.class",
      "value": "",
      "defaultValue": "org.apache.hadoop.yarn.server.nodemanager.LinuxContainerExecutor",
      "description": "Executor(launcher) of the containers",
      "displayType": "advanced",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "YARN",
      "category": "NodeManager"
    },

  /**********************************************WEBHCAT***************************************/
    {
      "id": "puppet var",
      "name": "webhcatserver_host",
      "displayName": "WebHCat Server host",
      "value": "",
      "defaultValue": "localhost",
      "description": "The host that has been assigned to run WebHCat Server",
      "displayType": "masterHost",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "WEBHCAT",
      "category": "WebHCat Server"
    },
    {
      "id": "puppet var",
      "name": "webHCat_http_principal_name",
      "displayName": "Principal name",
      "value": "",
      "defaultValue": "HTTP/_HOST",
      "description": "Principal name for SPNEGO access for WebHCat",
      "displayType": "principal",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "WEBHCAT",
      "category": "WebHCat Server"
    },
    {
      "id": "puppet var",
      "name": "webhcat_http_keytab",
      "displayName": "Path to keytab file",
      "value": "",
      "defaultValue": "/etc/security/keytabs/spnego.service.keytab",
      "description": "Path to SPNEGO keytab file for WebHCat",
      "displayType": "directory",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "WEBHCAT",
      "category": "WebHCat Server"
    },

  /**********************************************HBASE***************************************/
    {
      "id": "puppet var",
      "name": "hbasemaster_host",
      "displayName": "HBase Master hosts",
      "value": "",
      "defaultValue": "",
      "description": "The host that has been assigned to run HBase Master",
      "displayType": "masterHosts",
      "isOverridable": false,
      "isVisible": true,
      "serviceName": "HBASE",
      "category": "HBase Master"
    },
    {
      "id": "puppet var",
      "name": "hbase_master_principal_name",
      "displayName": "Principal name",
      "value": "",
      "defaultValue": "hbase/_HOST",
      "description": "Principal name for HBase master. _HOST will get automatically replaced with actual hostname at an instance of HBase Master",
      "displayType": "principal",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "HBASE",
      "category": "HBase Master",
      "components": ["HBASE_MASTER"]
    },
    {
      "id": "puppet var",
      "name": "hbase_master_keytab",
      "displayName": "Path to keytab file",
      "value": "",
      "defaultValue": "/etc/security/keytabs/hbase.service.keytab",
      "description": "Path to HBase master keytab file",
      "displayType": "directory",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "HBASE",
      "category": "HBase Master",
      "components": ["HBASE_MASTER"]
    },
    {
      "id": "puppet var",
      "name": "regionserver_hosts",
      "displayName": "RegionServer hosts",
      "value": "",
      "defaultValue": "",
      "description": "The hosts that have been assigned to run RegionServer",
      "displayType": "slaveHosts",
      "isOverridable": false,
      "isVisible": true,
      "serviceName": "HBASE",
      "category": "RegionServer"
    },
    {
      "id": "puppet var",
      "name": "hbase_regionserver_principal_name",
      "displayName": "Principal name",
      "value": "",
      "defaultValue": "hbase/_HOST",
      "description": "Principal name for RegionServer. _HOST will get automatically replaced with actual hostname at every instance of RegionServer",
      "displayType": "principal",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "HBASE",
      "category": "RegionServer",
      "components": ["HBASE_REGIONSERVER"]
    },
    {
      "id": "puppet var",
      "name": "hbase_regionserver_keytab",
      "displayName": "Path to keytab file",
      "value": "",
      "defaultValue": "/etc/security/keytabs/hbase.service.keytab",
      "description": "Path to RegionServer keytab file",
      "displayType": "directory",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "HBASE",
      "category": "RegionServer",
      "components": ["HBASE_REGIONSERVER"]
    },

  /**********************************************HIVE***************************************/
    {
      "id": "puppet var",
      "name": "hive_metastore",
      "displayName": "Hive Metastore host",
      "value": "",
      "defaultValue": "localhost",
      "description": "The host that has been assigned to run Hive Metastore and HiveServer2",
      "displayType": "masterHost",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "HIVE",
      "category": "Hive Metastore"
    },
    {
      "id": "puppet var",
      "name": "hive_metastore_principal_name",
      "displayName": "Principal name",
      "value": "",
      "defaultValue": "hive/_HOST",
      "description": "Principal name for Hive Metastore and HiveServer2. _HOST will get automatically replaced with actual hostname at an instance of Hive Metastore and HiveServer2",
      "displayType": "principal",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "HIVE",
      "category": "Hive Metastore",
      "component": "HIVE_SERVER"
    },
    {
      "id": "puppet var",
      "name": "hive_metastore_keytab",
      "displayName": "Path to keytab file",
      "value": "",
      "defaultValue": "/etc/security/keytabs/hive.service.keytab",
      "description": "Path to Hive Metastore and HiveServer2 keytab file",
      "displayType": "directory",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "HIVE",
      "category": "Hive Metastore",
      "component": "HIVE_SERVER"
    },

  /**********************************************OOZIE***************************************/
    {
      "id": "puppet var",
      "name": "oozie_servername",
      "displayName": "Oozie Server host",
      "value": "",
      "defaultValue": "localhost",
      "description": "Oozie server host name",
      "displayType": "masterHost",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "OOZIE",
      "category": "Oozie Server"
    },
    {
      "id": "puppet var",
      "name": "oozie_principal_name",
      "displayName": "Principal name",
      "value": "",
      "defaultValue": "oozie/_HOST",
      "description": "Principal name for Oozie server",
      "displayType": "principal",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "OOZIE",
      "category": "Oozie Server",
      "component": "OOZIE_SERVER"
    },
    {
      "id": "puppet var",
      "name": "oozie_keytab",
      "displayName": "Path to keytab file",
      "value": "",
      "defaultValue": "/etc/security/keytabs/oozie.service.keytab",
      "description": "Path to Oozie server keytab file",
      "displayType": "directory",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "OOZIE",
      "filename": "oozie-env.xml",
      "category": "Oozie Server",
      "component": "OOZIE_SERVER"
    },
    {
      "id": "puppet var",
      "name": "oozie_http_principal_name",
      "displayName": "Web principal name",
      "value": "",
      "defaultValue": "HTTP/_HOST",
      "description": "Principal name for SPNEGO access to Oozie",
      "displayType": "principal",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "OOZIE",
      "category": "Oozie Server"
    },
    {
      "id": "puppet var",
      "name": "oozie_http_keytab",
      "displayName": "Path to SPNEGO keytab file",
      "value": "",
      "defaultValue": "/etc/security/keytabs/spnego.service.keytab",
      "description": "Path to SPNEGO keytab file for oozie",
      "displayType": "directory",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "OOZIE",
      "category": "Oozie Server"
    },

  /**********************************************ZOOKEEPER***************************************/
    {
      "id": "puppet var",
      "name": "zookeeperserver_hosts",
      "displayName": "ZooKeeper Server hosts",
      "value": "",
      "defaultValue": "",
      "description": "The host that has been assigned to run ZooKeeper Server",
      "displayType": "masterHosts",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "ZOOKEEPER",
      "category": "ZooKeeper Server"
    },
    {
      "id": "puppet var",
      "name": "zookeeper_principal_name",
      "displayName": "Principal name",
      "value": "",
      "defaultValue": "zookeeper/_HOST",
      "description": "Principal name for ZooKeeper. _HOST will get automatically replaced with actual hostname at every instance of zookeeper server",
      "displayType": "principal",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "ZOOKEEPER",
      "filename": "zookeeper-env.xml",
      "category": "ZooKeeper Server",
      "component": "ZOOKEEPER_SERVER"
    },
    {
      "id": "puppet var",
      "name": "zookeeper_keytab_path",
      "displayName": "Path to keytab file",
      "value": "",
      "defaultValue": "/etc/security/keytabs/zk.service.keytab",
      "description": "Path to ZooKeeper keytab file",
      "displayType": "directory",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "ZOOKEEPER",
      "filename": "zookeeper-env.xml",
      "category": "ZooKeeper Server",
      "component": "ZOOKEEPER_SERVER"
    },

  /**********************************************NAGIOS***************************************/
    {
      "id": "puppet var",
      "name": "nagios_server",
      "displayName": "Nagios Server host",
      "value": "",
      "defaultValue": "localhost",
      "description": "Nagios server host",
      "displayType": "masterHost",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "NAGIOS",
      "category": "Nagios Server"
    },
    {
      "id": "puppet var",
      "name": "nagios_principal_name",
      "displayName": "Principal name",
      "value": "",
      "defaultValue": "nagios",
      "description": "Primary name for Nagios server",
      "displayType": "principal",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "NAGIOS",
      "filename": "nagios-env.xml",
      "category": "Nagios Server",
      "component": "NAGIOS_SERVER"
    },
    {
      "id": "puppet var",
      "name": "nagios_keytab_path",
      "displayName": " Path to keytab file",
      "value": "",
      "defaultValue": "/etc/security/keytabs/nagios.service.keytab",
      "description": "Path to the Nagios server keytab file",
      "displayType": "directory",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "NAGIOS",
      "filename": "nagios-env.xml",
      "category": "Nagios Server",
      "component": "NAGIOS_SERVER"
    },
  /**********************************************STORM***************************************/
    {
      "id": "puppet var",
      "name": "storm_host",
      "displayName": "Storm component hosts",
      "value": "",
      "defaultValue": "",
      "description": "Storm component hosts",
      "displayType": "slaveHosts",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "STORM",
      "category": "Storm Topology"
    },
    {
      "id": "puppet var",
      "name": "storm_principal_name",
      "displayName": " Storm principal name",
      "value": "",
      "defaultValue": "storm/_HOST",
      "description": "Principal name for Supervisor. _HOST will get automatically replaced with actual hostname at an instance of every storm component.",
      "displayType": "principal",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "STORM",
      "filename": "storm-env.xml",
      "category": "Storm Topology",
      "components": ["SUPERVISOR", "NIMBUS", "STORM_UI_SERVER"]
    },
    {
      "id": "puppet var",
      "name": "storm_keytab",
      "displayName": "Path to Storm keytab file",
      "value": "",
      "defaultValue": "/etc/security/keytabs/storm.service.keytab",
      "description": "Path to the storm keytab file",
      "displayType": "directory",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "STORM",
      "filename": "storm-env.xml",
      "category": "Storm Topology",
      "components": ["SUPERVISOR", "NIMBUS"]
    },

  /**********************************************Falcon***************************************/
    {
      "id": "puppet var",
      "name": "falcon_server_host",
      "displayName": "Falcon server host",
      "value": "",
      "defaultValue": "",
      "description": "Falcon Server host",
      "displayType": "masterHost",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "FALCON",
      "category": "Falcon Server"
    },
    {
      "id": "puppet var",
      "name": "falcon_principal_name",
      "displayName": "Falcon principal name",
      "value": "",
      "defaultValue": "falcon/_HOST",
      "description": "This is the principal name for Falcon Server",
      "displayType": "principal",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "FALCON",
      "category": "Falcon Server",
      "component": "FALCON_SERVER"
    },
    {
      "id": "puppet var",
      "name": "falcon_keytab",
      "displayName": "Path to Falcon server keytab file",
      "value": "",
      "defaultValue": "/etc/security/keytabs/falcon.service.keytab",
      "description": "Path to the Falcon Server keytab file",
      "displayType": "directory",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "FALCON",
      "category": "Falcon Server",
      "component": "FALCON_SERVER"
    },
    {
      "id": "puppet var",
      "name": "falcon_http_principal_name",
      "displayName": "Web principal name",
      "value": "",
      "defaultValue": "HTTP/_HOST",
      "description": "Principal name for SPNEGO access to Falcon",
      "displayType": "principal",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "FALCON",
      "category": "Falcon Server"
    },
    {
      "id": "puppet var",
      "name": "falcon_http_keytab",
      "displayName": "Path to SPNEGO keytab file",
      "value": "",
      "defaultValue": "/etc/security/keytabs/spnego.service.keytab",
      "description": "Path to SPNEGO keytab file for Falcon",
      "displayType": "directory",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "FALCON",
      "category": "Falcon Server"
    },
    {
      "id": "puppet var",
      "name": "namenode_principal_name_falcon",
      "displayName": "NameNode principal name",
      "value": "",
      "defaultValue": "nn/_HOST",
      "description": "NameNode principal to talk to config store",
      "displayType": "principal",
      "isVisible": true,
      "isOverridable": false,
      "serviceName": "FALCON",
      "category": "Falcon Server"
    }
  ]
};

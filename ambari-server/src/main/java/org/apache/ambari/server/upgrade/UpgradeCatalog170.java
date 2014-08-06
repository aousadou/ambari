/*
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

package org.apache.ambari.server.upgrade;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.apache.ambari.server.AmbariException;
import org.apache.ambari.server.configuration.Configuration;
import org.apache.ambari.server.controller.AmbariManagementController;
import org.apache.ambari.server.orm.DBAccessor.DBColumnInfo;
import org.apache.ambari.server.state.Cluster;
import org.apache.ambari.server.state.Clusters;
import org.apache.ambari.server.state.Config;
import org.apache.ambari.server.state.ConfigHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.inject.Inject;
import com.google.inject.Injector;

/**
 * Upgrade catalog for version 1.7.0.
 */
public class UpgradeCatalog170 extends AbstractUpgradeCatalog {
  private static final String CONTENT_FIELD_NAME = "content";
  private static final String ENV_CONFIGS_POSTFIX = "-env";

  private static final String ALERT_TABLE_DEFINITION = "alert_definition";
  private static final String ALERT_TABLE_HISTORY = "alert_history";
  private static final String ALERT_TABLE_CURRENT = "alert_current";
  private static final String ALERT_TABLE_GROUP = "alert_group";
  private static final String ALERT_TABLE_TARGET = "alert_target";
  private static final String ALERT_TABLE_GROUP_TARGET = "alert_group_target";
  private static final String ALERT_TABLE_GROUPING = "alert_grouping";
  private static final String ALERT_TABLE_NOTICE = "alert_notice";

  //SourceVersion is only for book-keeping purpos
  @Override
  public String getSourceVersion() {
    return "1.6.1";
  }

  @Override
  public String getTargetVersion() {
    return "1.7.0";
  }

  /**
   * Logger.
   */
  private static final Logger LOG = LoggerFactory.getLogger
      (UpgradeCatalog170.class);

  // ----- Constructors ------------------------------------------------------

  @Inject
  public UpgradeCatalog170(Injector injector) {
    super(injector);
    this.injector = injector;
  }


  // ----- AbstractUpgradeCatalog --------------------------------------------

  @Override
  protected void executeDDLUpdates() throws AmbariException, SQLException {
    List<DBColumnInfo> columns;
    String dbType = getDbType();

    // add admin tables and initial values prior to adding referencing columns on existing tables
    columns = new ArrayList<DBColumnInfo>();
    columns.add(new DBColumnInfo("principal_type_id", Integer.class, 1, null,
        false));
    columns.add(new DBColumnInfo("principal_type_name", String.class, null,
        null, false));

    dbAccessor.createTable("adminprincipaltype", columns, "principal_type_id");

    dbAccessor.executeQuery("insert into adminprincipaltype (principal_type_id, principal_type_name)\n" +
        "  select 1, 'USER'\n" +
        "  union all\n" +
        "  select 2, 'GROUP'", true);

    columns = new ArrayList<DBColumnInfo>();
    columns.add(new DBColumnInfo("principal_id", Long.class, null, null, false));
    columns.add(new DBColumnInfo("principal_type_id", Integer.class, 1, null,
        false));

    dbAccessor.createTable("adminprincipal", columns, "principal_id");

    dbAccessor.executeQuery("insert into adminprincipal (principal_id, principal_type_id)\n" +
        "  select 1, 1", true);

    columns = new ArrayList<DBColumnInfo>();
    columns.add(new DBColumnInfo("resource_type_id", Integer.class, 1, null,
        false));
    columns.add(new DBColumnInfo("resource_type_name", String.class, null,
        null, false));

    dbAccessor.createTable("adminresourcetype", columns, "resource_type_id");

    dbAccessor.executeQuery("insert into adminresourcetype (resource_type_id, resource_type_name)\n" +
        "  select 1, 'AMBARI'\n" +
        "  union all\n" +
        "  select 2, 'CLUSTER'\n" +
        "  union all\n" +
        "  select 3, 'VIEW'", true);

    columns = new ArrayList<DBColumnInfo>();
    columns.add(new DBColumnInfo("resource_id", Long.class, null, null, false));
    columns.add(new DBColumnInfo("resource_type_id", Integer.class, 1, null,
        false));

    dbAccessor.createTable("adminresource", columns, "resource_id");

    dbAccessor.executeQuery("insert into adminresource (resource_id, resource_type_id)\n" +
        "  select 1, 1", true);

    columns = new ArrayList<DBColumnInfo>();
    columns.add(new DBColumnInfo("permission_id", Long.class, null, null, false));
    columns.add(new DBColumnInfo("permission_name", String.class, null, null,
        false));
    columns.add(new DBColumnInfo("resource_type_id", Integer.class, 1, null,
        false));

    dbAccessor.createTable("adminpermission", columns, "permission_id");

    dbAccessor.executeQuery("insert into adminpermission(permission_id, permission_name, resource_type_id)\n" +
        "  select 1, 'AMBARI.ADMIN', 1\n" +
        "  union all\n" +
        "  select 2, 'CLUSTER.READ', 2\n" +
        "  union all\n" +
        "  select 3, 'CLUSTER.OPERATE', 2\n" +
        "  union all\n" +
        "  select 4, 'VIEW.USE', 3", true);

    columns = new ArrayList<DBColumnInfo>();
    columns.add(new DBColumnInfo("privilege_id", Long.class, null, null, false));
    columns.add(new DBColumnInfo("permission_id", Long.class, null, null, false));
    columns.add(new DBColumnInfo("resource_id", Long.class, null, null, false));
    columns.add(new DBColumnInfo("principal_id", Long.class, null, null, false));

    dbAccessor.createTable("adminprivilege", columns, "privilege_id");

    dbAccessor.executeQuery("insert into adminprivilege (privilege_id, permission_id, resource_id, principal_id)\n" +
        "  select 1, 1, 1, injector1", true);


    DBColumnInfo clusterConfigAttributesColumn = new DBColumnInfo(
        "config_attributes", String.class, 32000, null, true);
    dbAccessor.addColumn("clusterconfig", clusterConfigAttributesColumn);

    // Add columns
    dbAccessor.addColumn("viewmain", new DBColumnInfo("mask",
      String.class, 255, null, true));
    dbAccessor.addColumn("viewparameter", new DBColumnInfo("masked",
      Character.class, 1, null, true));
    dbAccessor.addColumn("users", new DBColumnInfo("active",
      Integer.class, 1, 1, false));
    dbAccessor.addColumn("users", new DBColumnInfo("principal_id",
        Long.class, 1, 1, false));
    dbAccessor.addColumn("viewmain", new DBColumnInfo("resource_type_id",
        Integer.class, 1, 1, false));
    dbAccessor.addColumn("viewinstance", new DBColumnInfo("resource_id",
        Long.class, 1, 1, false));
    dbAccessor.addColumn("clusters", new DBColumnInfo("resource_id",
        Long.class, 1, 1, false));

    dbAccessor.addColumn("host_role_command", new DBColumnInfo("output_log",
        String.class, 255, null, true));
    dbAccessor.addColumn("host_role_command", new DBColumnInfo("error_log",
        String.class, 255, null, true));

    // Update historic records with the log paths, but only enough so as to not prolong the upgrade process
    if (dbType.equals(Configuration.POSTGRES_DB_NAME) || dbType.equals(Configuration.ORACLE_DB_NAME)) {
      // Postgres and Oracle use a different concatenation operator.
      dbAccessor.executeQuery("UPDATE host_role_command SET output_log = ('/var/lib/ambari-agent/data/output-' || CAST(task_id AS VARCHAR(20)) || '.txt') WHERE task_id IN (SELECT task_id FROM host_role_command WHERE output_log IS NULL OR output_log = '' ORDER BY task_id DESC LIMIT 1000);");
      dbAccessor.executeQuery("UPDATE host_role_command SET error_log = ('/var/lib/ambari-agent/data/errors-' || CAST(task_id AS VARCHAR(20)) || '.txt') WHERE task_id IN (SELECT task_id FROM host_role_command WHERE error_log IS NULL OR error_log = '' ORDER BY task_id DESC LIMIT 1000);");
    } else if (dbType.equals(Configuration.MYSQL_DB_NAME)) {
      // MySQL uses a different concatenation operator.
      dbAccessor.executeQuery("UPDATE host_role_command SET output_log = CONCAT('/var/lib/ambari-agent/data/output-', task_id, '.txt') WHERE task_id IN (SELECT task_id FROM host_role_command WHERE output_log IS NULL OR output_log = '' ORDER BY task_id DESC LIMIT 1000);");
      dbAccessor.executeQuery("UPDATE host_role_command SET error_log = CONCAT('/var/lib/ambari-agent/data/errors-', task_id, '.txt') WHERE task_id IN (SELECT task_id FROM host_role_command WHERE error_log IS NULL OR error_log = '' ORDER BY task_id DESC LIMIT 1000);");
    }

    addAlertingFrameworkDDL();
  }


  // ----- UpgradeCatalog ----------------------------------------------------

  @Override
  protected void executeDMLUpdates() throws AmbariException, SQLException {
    // !!! TODO: create admin principals for existing users and groups.
    // !!! TODO: create admin resources for existing clusters and view instances

    String dbType = getDbType();

    // add new sequences for view entity
    String valueColumnName = "\"value\"";
    if (Configuration.ORACLE_DB_NAME.equals(dbType)
        || Configuration.MYSQL_DB_NAME.equals(dbType)) {
      valueColumnName = "value";
    }

    dbAccessor.executeQuery("INSERT INTO ambari_sequences(sequence_name, "
        + valueColumnName + ") " + "VALUES('alert_definition_id_seq', 0)",
        false);

    dbAccessor.executeQuery("INSERT INTO ambari_sequences(sequence_name, "
        + valueColumnName + ") " + "VALUES('alert_group_id_seq', 0)", false);

    dbAccessor.executeQuery("INSERT INTO ambari_sequences(sequence_name, "
        + valueColumnName + ") " + "VALUES('alert_target_id_seq', 0)", false);

    dbAccessor.executeQuery("INSERT INTO ambari_sequences(sequence_name, "
        + valueColumnName + ") " + "VALUES('alert_history_id_seq', 0)", false);

    dbAccessor.executeQuery("INSERT INTO ambari_sequences(sequence_name, "
        + valueColumnName + ") " + "VALUES('alert_notice_id_seq', 0)", false);

    dbAccessor.executeQuery("INSERT INTO ambari_sequences(sequence_name, "
        + valueColumnName + ") " + "VALUES('alert_current_id_seq', 0)", false);

    moveGlobalsToEnv();
    addEnvContentFields();
    addMissingConfigs();
  }

  /**
   * Adds the alert tables and constraints.
   */
  private void addAlertingFrameworkDDL() throws AmbariException, SQLException {
    // alert_definition
    ArrayList<DBColumnInfo> columns = new ArrayList<DBColumnInfo>();
    columns.add(new DBColumnInfo("definition_id", Long.class, null, null, false));
    columns.add(new DBColumnInfo("cluster_id", Long.class, null, null, false));
    columns.add(new DBColumnInfo("definition_name", String.class, 255, null, false));
    columns.add(new DBColumnInfo("service_name", String.class, 255, null, false));
    columns.add(new DBColumnInfo("component_name", String.class, 255, null, true));
    columns.add(new DBColumnInfo("scope", String.class, 255, null, true));
    columns.add(new DBColumnInfo("enabled", Short.class, 1, 1, false));
    columns.add(new DBColumnInfo("schedule_interval", Integer.class, null, null, false));
    columns.add(new DBColumnInfo("source_type", String.class, 255, null, false));
    columns.add(new DBColumnInfo("alert_source", String.class, 4000, null, false));
    columns.add(new DBColumnInfo("hash", String.class, 64, null, false));
    dbAccessor.createTable(ALERT_TABLE_DEFINITION, columns, "definition_id");

    dbAccessor.addFKConstraint(ALERT_TABLE_DEFINITION,
        "fk_alert_def_cluster_id",
        "cluster_id", "clusters", "cluster_id", false);

    dbAccessor.executeQuery(
        "ALTER TABLE "
            + ALERT_TABLE_DEFINITION
            + " ADD CONSTRAINT uni_alert_def_name UNIQUE (cluster_id,definition_name)",
        false);

    // alert_history
    columns = new ArrayList<DBColumnInfo>();
    columns.add(new DBColumnInfo("alert_id", Long.class, null, null, false));
    columns.add(new DBColumnInfo("cluster_id", Long.class, null, null, false));
    columns.add(new DBColumnInfo("alert_definition_id", Long.class, null, null,
        false));
    columns.add(new DBColumnInfo("service_name", String.class, 255, null, false));
    columns.add(new DBColumnInfo("component_name", String.class, 255, null, true));
    columns.add(new DBColumnInfo("host_name", String.class, 255, null, true));
    columns.add(new DBColumnInfo("alert_instance", String.class, 255, null,
        true));
    columns.add(new DBColumnInfo("alert_timestamp", Long.class, null, null,
        false));
    columns.add(new DBColumnInfo("alert_label", String.class, 1024, null, true));
    columns.add(new DBColumnInfo("alert_state", String.class, 255, null, false));
    columns.add(new DBColumnInfo("alert_text", String.class, 4000, null, true));
    dbAccessor.createTable(ALERT_TABLE_HISTORY, columns, "alert_id");

    dbAccessor.addFKConstraint(ALERT_TABLE_HISTORY, "fk_alert_history_def_id",
        "alert_definition_id", ALERT_TABLE_DEFINITION, "definition_id", false);

    dbAccessor.addFKConstraint(ALERT_TABLE_HISTORY,
        "fk_alert_history_cluster_id",
        "cluster_id", "clusters", "cluster_id", false);

    // alert_current
    columns = new ArrayList<DBColumnInfo>();
    columns.add(new DBColumnInfo("alert_id", Long.class, null, null, false));
    columns.add(new DBColumnInfo("definition_id", Long.class, null, null, false));
    columns.add(new DBColumnInfo("history_id", Long.class, null, null, false));
    columns.add(new DBColumnInfo("maintenance_state", String.class, 255, null,
        true));
    columns.add(new DBColumnInfo("original_timestamp", Long.class, 0, null,
        false));
    columns.add(new DBColumnInfo("latest_timestamp", Long.class, 0, null, false));
    dbAccessor.createTable(ALERT_TABLE_CURRENT, columns, "alert_id");

    dbAccessor.addFKConstraint(ALERT_TABLE_CURRENT, "fk_alert_current_def_id",
        "definition_id", ALERT_TABLE_DEFINITION, "definition_id", false);

    dbAccessor.addFKConstraint(ALERT_TABLE_CURRENT,
        "fk_alert_current_history_id", "history_id", ALERT_TABLE_HISTORY,
        "alert_id", false);

    dbAccessor.executeQuery("ALTER TABLE " + ALERT_TABLE_CURRENT
        + " ADD CONSTRAINT uni_alert_current_hist_id UNIQUE (history_id)",
        false);

    // alert_group
    columns = new ArrayList<DBColumnInfo>();
    columns.add(new DBColumnInfo("group_id", Long.class, null, null, false));
    columns.add(new DBColumnInfo("cluster_id", Long.class, null, null, false));
    columns.add(new DBColumnInfo("group_name", String.class, 255, null, false));
    columns.add(new DBColumnInfo("is_default", Short.class, 1, 1, false));
    dbAccessor.createTable(ALERT_TABLE_GROUP, columns, "group_id");

    dbAccessor.executeQuery(
        "ALTER TABLE "
            + ALERT_TABLE_GROUP
            + " ADD CONSTRAINT uni_alert_group_name UNIQUE (cluster_id,group_name)",
        false);

    // alert_target
    columns = new ArrayList<DBColumnInfo>();
    columns.add(new DBColumnInfo("target_id", Long.class, null, null, false));
    columns.add(new DBColumnInfo("target_name", String.class, 255, null, false));
    columns.add(new DBColumnInfo("notification_type", String.class, 64, null, false));
    columns.add(new DBColumnInfo("properties", String.class, 4000, null, true));
    columns.add(new DBColumnInfo("description", String.class, 1024, null, true));
    dbAccessor.createTable(ALERT_TABLE_TARGET, columns, "target_id");

    dbAccessor.executeQuery("ALTER TABLE " + ALERT_TABLE_TARGET
        + " ADD CONSTRAINT uni_alert_target_name UNIQUE (target_name)",
        false);

    // alert_group_target
    columns = new ArrayList<DBColumnInfo>();
    columns.add(new DBColumnInfo("group_id", Long.class, null, null, false));
    columns.add(new DBColumnInfo("target_id", Long.class, null, null, false));
    dbAccessor.createTable(ALERT_TABLE_GROUP_TARGET, columns, "group_id",
        "target_id");

    dbAccessor.addFKConstraint(ALERT_TABLE_GROUP_TARGET,
        "fk_alert_gt_group_id", "group_id", ALERT_TABLE_GROUP, "group_id",
        false);

    dbAccessor.addFKConstraint(ALERT_TABLE_GROUP_TARGET,
        "fk_alert_gt_target_id", "target_id", ALERT_TABLE_TARGET, "target_id",
        false);

    // alert_grouping
    columns = new ArrayList<DBColumnInfo>();
    columns.add(new DBColumnInfo("definition_id", Long.class, null, null, false));
    columns.add(new DBColumnInfo("group_id", Long.class, null, null, false));
    dbAccessor.createTable(ALERT_TABLE_GROUPING, columns, "group_id",
        "definition_id");

    dbAccessor.addFKConstraint(ALERT_TABLE_GROUPING,
        "fk_alert_grouping_def_id", "definition_id", ALERT_TABLE_DEFINITION,
        "definition_id", false);

    dbAccessor.addFKConstraint(ALERT_TABLE_GROUPING,
        "fk_alert_grouping_group_id", "group_id", ALERT_TABLE_GROUP,
        "group_id", false);

    // alert_notice
    columns = new ArrayList<DBColumnInfo>();
    columns.add(new DBColumnInfo("notification_id", Long.class, null, null,
        false));
    columns.add(new DBColumnInfo("target_id", Long.class, null, null, false));
    columns.add(new DBColumnInfo("history_id", Long.class, null, null, false));
    columns.add(new DBColumnInfo("notify_state", String.class, 255, null, false));
    dbAccessor.createTable(ALERT_TABLE_NOTICE, columns, "notification_id");

    dbAccessor.addFKConstraint(ALERT_TABLE_NOTICE, "fk_alert_notice_target_id",
        "target_id", ALERT_TABLE_TARGET, "target_id", false);

    dbAccessor.addFKConstraint(ALERT_TABLE_NOTICE, "fk_alert_notice_hist_id",
        "history_id", ALERT_TABLE_HISTORY, "alert_id", false);

    // Indexes
    dbAccessor.createIndex("idx_alert_history_def_id", ALERT_TABLE_HISTORY,
        "alert_definition_id");
    dbAccessor.createIndex("idx_alert_history_service", ALERT_TABLE_HISTORY,
        "service_name");
    dbAccessor.createIndex("idx_alert_history_host", ALERT_TABLE_HISTORY,
        "host_name");
    dbAccessor.createIndex("idx_alert_history_time", ALERT_TABLE_HISTORY,
        "alert_timestamp");
    dbAccessor.createIndex("idx_alert_history_state", ALERT_TABLE_HISTORY,
        "alert_state");
    dbAccessor.createIndex("idx_alert_group_name", ALERT_TABLE_GROUP,
        "group_name");
    dbAccessor.createIndex("idx_alert_notice_state", ALERT_TABLE_NOTICE,
        "notify_state");
  }

  protected void addMissingConfigs() throws AmbariException {
    updateConfigurationProperties("hbase-env",
        Collections.singletonMap("hbase_regionserver_xmn_max", "512"), false,
        false);

    updateConfigurationProperties("hbase-env",
        Collections.singletonMap("hbase_regionserver_xmn_ratio", "0.2"), false,
        false);
  }

  protected void addEnvContentFields() throws AmbariException {
    ConfigHelper configHelper = injector.getInstance(ConfigHelper.class);
    AmbariManagementController ambariManagementController = injector.getInstance(
        AmbariManagementController.class);

    Clusters clusters = ambariManagementController.getClusters();
    if (clusters == null) {
      return;
    }

    Map<String, Cluster> clusterMap = clusters.getClusters();

    if (clusterMap != null && !clusterMap.isEmpty()) {
      for (final Cluster cluster : clusterMap.values()) {
        Set<String> configTypes = configHelper.findConfigTypesByPropertyName(cluster.getCurrentStackVersion(), CONTENT_FIELD_NAME);

        for(String configType:configTypes) {
          if(!configType.endsWith(ENV_CONFIGS_POSTFIX)) {
            continue;
          }

          String value = configHelper.getPropertyValueFromStackDefenitions(cluster, configType, CONTENT_FIELD_NAME);
          updateConfigurationProperties(configType, Collections.singletonMap(CONTENT_FIELD_NAME, value), true, true);
        }
      }
    }
  }

  protected void moveGlobalsToEnv() throws AmbariException {
    ConfigHelper configHelper = injector.getInstance(ConfigHelper.class);

    AmbariManagementController ambariManagementController = injector.getInstance(
        AmbariManagementController.class);
    Clusters clusters = ambariManagementController.getClusters();
    if (clusters == null) {
      return;
    }
    Map<String, Cluster> clusterMap = clusters.getClusters();

    if (clusterMap != null && !clusterMap.isEmpty()) {
      for (final Cluster cluster : clusterMap.values()) {
        Config config = cluster.getDesiredConfigByType(Configuration.GLOBAL_CONFIG_TAG);
        if (config == null) {
          LOG.info("Config " + Configuration.GLOBAL_CONFIG_TAG + " not found. Assuming upgrade already done.");
          return;
        }

        Map<String, Map<String, String>> newProperties = new HashMap<String, Map<String, String>>();
        Map<String, String> globalProperites = config.getProperties();
        Map<String, String> unmappedGlobalProperties = new HashMap<String, String>();

        for (Map.Entry<String, String> property : globalProperites.entrySet()) {
          String propertyName = property.getKey();
          String propertyValue = property.getValue();

          Set<String> newConfigTypes = configHelper.findConfigTypesByPropertyName(cluster.getCurrentStackVersion(), propertyName);
          // if it's custom user service global.xml can be still there.
          newConfigTypes.remove(Configuration.GLOBAL_CONFIG_TAG);

          String newConfigType = null;
          if(newConfigTypes.size() > 0) {
            newConfigType = newConfigTypes.iterator().next();
          } else {
            newConfigType = getAdditionalMappingGlobalToEnv().get(propertyName);
          }

          if(newConfigType==null) {
            LOG.warn("Cannot find where to map " + propertyName + " from " + Configuration.GLOBAL_CONFIG_TAG +
                " (value="+propertyValue+")");
            unmappedGlobalProperties.put(propertyName, propertyValue);
            continue;
          }

          LOG.info("Mapping config " + propertyName + " from " + Configuration.GLOBAL_CONFIG_TAG +
              " to " + newConfigType +
              " (value="+propertyValue+")");

          if(!newProperties.containsKey(newConfigType)) {
            newProperties.put(newConfigType, new HashMap<String, String>());
          }
          newProperties.get(newConfigType).put(propertyName, propertyValue);
        }

        for (Entry<String, Map<String, String>> newProperty : newProperties.entrySet()) {
          updateConfigurationProperties(newProperty.getKey(), newProperty.getValue(), true, true);
        }

        // if have some custom properties, for own services etc., leave that as it was
        if(unmappedGlobalProperties.size() != 0) {
          LOG.info("Not deleting globals because have custom properties");
          configHelper.createConfigType(cluster, ambariManagementController, Configuration.GLOBAL_CONFIG_TAG, unmappedGlobalProperties, "ambari-upgrade");
        } else {
          configHelper.removeConfigsByType(cluster, Configuration.GLOBAL_CONFIG_TAG);
        }
      }
    }
  }

  public static Map<String, String> getAdditionalMappingGlobalToEnv() {
    Map<String, String> result = new HashMap<String, String>();

    result.put("smokeuser_keytab","hadoop-env");
    result.put("hdfs_user_keytab","hadoop-env");
    result.put("kerberos_domain","hadoop-env");
    result.put("hbase_user_keytab","hbase-env");
    result.put("nagios_principal_name","nagios-env");
    result.put("nagios_keytab_path","nagios-env");
    result.put("oozie_keytab","oozie-env");
    result.put("zookeeper_principal_name","zookeeper-env");
    result.put("zookeeper_keytab_path","zookeeper-env");
    result.put("storm_principal_name","storm-env");
    result.put("storm_keytab","storm-env");

    return result;
  }
}

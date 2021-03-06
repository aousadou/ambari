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
package org.apache.ambari.server.controller.internal;

import com.google.gson.Gson;
import com.google.inject.Inject;
import com.google.inject.assistedinject.Assisted;
import com.google.inject.assistedinject.AssistedInject;
import com.google.inject.persist.Transactional;

import org.apache.ambari.server.*;
import org.apache.ambari.server.api.services.AmbariMetaInfo;
import org.apache.ambari.server.configuration.Configuration;
import org.apache.ambari.server.controller.*;
import org.apache.ambari.server.controller.spi.*;
import org.apache.ambari.server.controller.utilities.PropertyHelper;
import org.apache.ambari.server.state.*;
import org.apache.ambari.server.state.PropertyInfo.PropertyType;
import org.apache.ambari.server.utils.StageUtils;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.*;
import java.util.concurrent.TimeoutException;

import static org.apache.ambari.server.agent.ExecutionCommand.KeyNames.*;

/**
 * Resource provider for client config resources.
 */
public class ClientConfigResourceProvider extends AbstractControllerResourceProvider {


  // ----- Property ID constants ---------------------------------------------

  protected static final String COMPONENT_CLUSTER_NAME_PROPERTY_ID = "ServiceComponentInfo/cluster_name";
  protected static final String COMPONENT_SERVICE_NAME_PROPERTY_ID = "ServiceComponentInfo/service_name";
  protected static final String COMPONENT_COMPONENT_NAME_PROPERTY_ID = "ServiceComponentInfo/component_name";
  protected static final String HOST_COMPONENT_HOST_NAME_PROPERTY_ID =
          PropertyHelper.getPropertyId("HostRoles", "host_name");
  protected static final String TMP_PATH = "/tmp/ambari-server";

  private final Gson gson;

  private static Set<String> pkPropertyIds =
          new HashSet<String>(Arrays.asList(new String[]{
                  COMPONENT_CLUSTER_NAME_PROPERTY_ID,
                  COMPONENT_SERVICE_NAME_PROPERTY_ID,
                  COMPONENT_COMPONENT_NAME_PROPERTY_ID}));

  private MaintenanceStateHelper maintenanceStateHelper;

  // ----- Constructors ----------------------------------------------------

  /**
   * Create a  new resource provider for the given management controller.
   *
   * @param propertyIds          the property ids
   * @param keyPropertyIds       the key property ids
   * @param managementController the management controller
   */
  @AssistedInject
  ClientConfigResourceProvider(@Assisted Set<String> propertyIds,
                               @Assisted Map<Resource.Type, String> keyPropertyIds,
                               @Assisted AmbariManagementController managementController) {
    super(propertyIds, keyPropertyIds, managementController);
    gson = new Gson();
  }

  // ----- ResourceProvider ------------------------------------------------

  @Override
  public RequestStatus createResources(Request request)
          throws SystemException,
          UnsupportedPropertyException,
          ResourceAlreadyExistsException,
          NoSuchParentResourceException {

    throw new SystemException("The request is not supported");
  }

  @Override
  @Transactional
  public Set<Resource> getResources(Request request, Predicate predicate)
          throws SystemException, UnsupportedPropertyException, NoSuchResourceException, NoSuchParentResourceException {

    Set<Resource> resources = new HashSet<Resource>();

    final Set<ServiceComponentHostRequest> requests = new HashSet<ServiceComponentHostRequest>();

    for (Map<String, Object> propertyMap : getPropertyMaps(predicate)) {
      requests.add(getRequest(propertyMap));
    }

    Set<ServiceComponentHostResponse> responses = null;
    try {
      responses = getResources(new Command<Set<ServiceComponentHostResponse>>() {
        @Override
        public Set<ServiceComponentHostResponse> invoke() throws AmbariException {
          return getManagementController().getHostComponents(requests);
        }
      });
    } catch (Exception e) {
      throw new SystemException("Failed to get components ", e);
    }

    AmbariManagementController managementController = getManagementController();
    ConfigHelper configHelper = managementController.getConfigHelper();
    Cluster cluster = null;
    Clusters clusters = managementController.getClusters();
    try {
      cluster = clusters.getCluster(responses.iterator().next().getClusterName());

      StackId stackId = cluster.getCurrentStackVersion();
      String serviceName = responses.iterator().next().getServiceName();
      String componentName = responses.iterator().next().getComponentName();
      String hostName = responses.iterator().next().getHostname();
      ComponentInfo componentInfo = null;
      String packageFolder = null;

      componentInfo = managementController.getAmbariMetaInfo().
              getComponent(stackId.getStackName(), stackId.getStackVersion(), serviceName, componentName);
      packageFolder = managementController.getAmbariMetaInfo().
              getServiceInfo(stackId.getStackName(), stackId.getStackVersion(), serviceName).getServicePackageFolder();

      String commandScript = componentInfo.getCommandScript().getScript();
      List<ClientConfigFileDefinition> clientConfigFiles = componentInfo.getClientConfigFiles();

      if (clientConfigFiles == null) {
        throw new SystemException("No configuration files defined for the component " + componentInfo.getName());
      }

      String stackRoot = managementController.getAmbariMetaInfo().getStackRoot().getAbsolutePath();

      String packageFolderAbsolute = stackRoot + File.separator + packageFolder;
      String commandScriptAbsolute = packageFolderAbsolute + File.separator + commandScript;


      Map<String, Map<String, String>> configurations = new TreeMap<String, Map<String, String>>();
      Map<String, Map<String, Map<String, String>>> configurationAttributes = new TreeMap<String, Map<String, Map<String, String>>>();

      Collection<Config> clusterConfigs = cluster.getAllConfigs();

      //Get configurations and configuration attributes
      for (Config clusterConfig : clusterConfigs) {

        if (clusterConfig != null) {
          Map<String, String> props = new HashMap<String, String>(clusterConfig.getProperties());

          // Apply global properties for this host from all config groups
          Map<String, Map<String, String>> allConfigTags = null;
          allConfigTags = configHelper
                  .getEffectiveDesiredTags(cluster, hostName);

          Map<String, Map<String, String>> configTags = new HashMap<String,
                  Map<String, String>>();

          for (Map.Entry<String, Map<String, String>> entry : allConfigTags.entrySet()) {
            if (entry.getKey().equals(clusterConfig.getType())) {
              configTags.put(clusterConfig.getType(), entry.getValue());
            }
          }

          Map<String, Map<String, String>> properties = configHelper
                  .getEffectiveConfigProperties(cluster, configTags);

          if (!properties.isEmpty()) {
            for (Map<String, String> propertyMap : properties.values()) {
              props.putAll(propertyMap);
            }
          }

          configurations.put(clusterConfig.getType(), props);

          Map<String, Map<String, String>> attrs = new TreeMap<String, Map<String, String>>();
          configHelper.cloneAttributesMap(clusterConfig.getPropertiesAttributes(), attrs);

          Map<String, Map<String, Map<String, String>>> attributes = configHelper
                  .getEffectiveConfigAttributes(cluster, configTags);
          for (Map<String, Map<String, String>> attributesMap : attributes.values()) {
            configHelper.cloneAttributesMap(attributesMap, attrs);
          }
          configurationAttributes.put(clusterConfig.getType(), attrs);
        }
      }

      // Hack - Remove passwords from configs
      if (configurations.get(Configuration.HIVE_CONFIG_TAG)!=null) {
        configurations.get(Configuration.HIVE_CONFIG_TAG).remove(Configuration.HIVE_METASTORE_PASSWORD_PROPERTY);
      }

      Map<String, Set<String>> clusterHostInfo = null;
      ServiceInfo serviceInfo = null;
      String osFamily = null;
      clusterHostInfo = StageUtils.getClusterHostInfo(managementController.getClusters().getHostsForCluster(cluster.getClusterName()), cluster);
      serviceInfo = managementController.getAmbariMetaInfo().getServiceInfo(stackId.getStackName(),
              stackId.getStackVersion(), serviceName);
      osFamily = clusters.getHost(hostName).getOsFamily();

      TreeMap<String, String> hostLevelParams = new TreeMap<String, String>();
      hostLevelParams.put(JDK_LOCATION, managementController.getJdkResourceUrl());
      hostLevelParams.put(JAVA_HOME, managementController.getJavaHome());
      hostLevelParams.put(JDK_NAME, managementController.getJDKName());
      hostLevelParams.put(JCE_NAME, managementController.getJCEName());
      hostLevelParams.put(STACK_NAME, stackId.getStackName());
      hostLevelParams.put(STACK_VERSION, stackId.getStackVersion());
      hostLevelParams.put(DB_NAME, managementController.getServerDB());
      hostLevelParams.put(MYSQL_JDBC_URL, managementController.getMysqljdbcUrl());
      hostLevelParams.put(ORACLE_JDBC_URL, managementController.getOjdbcUrl());
      hostLevelParams.putAll(managementController.getRcaParameters());
      hostLevelParams.putAll(managementController.getRcaParameters());

      // Write down os specific info for the service
      ServiceOsSpecific anyOs = null;
      if (serviceInfo.getOsSpecifics().containsKey(AmbariMetaInfo.ANY_OS)) {
        anyOs = serviceInfo.getOsSpecifics().get(AmbariMetaInfo.ANY_OS);
      }

      ServiceOsSpecific hostOs = populateServicePackagesInfo(serviceInfo, hostLevelParams, osFamily);

      // Build package list that is relevant for host
      List<ServiceOsSpecific.Package> packages =
              new ArrayList<ServiceOsSpecific.Package>();
      if (anyOs != null) {
        packages.addAll(anyOs.getPackages());
      }

      if (hostOs != null) {
        packages.addAll(hostOs.getPackages());
      }
      String packageList = gson.toJson(packages);
      hostLevelParams.put(PACKAGE_LIST, packageList);
      
      Set<String> userSet = configHelper.getPropertyValuesWithPropertyType(stackId, PropertyType.USER, cluster);
      String userList = gson.toJson(userSet);
      hostLevelParams.put(USER_LIST, userList);
      
      Set<String> groupSet = configHelper.getPropertyValuesWithPropertyType(stackId, PropertyType.GROUP, cluster);
      String groupList = gson.toJson(groupSet);
      hostLevelParams.put(GROUP_LIST, groupList);

      String jsonConfigurations = null;
      Map<String, Object> commandParams = new HashMap<String, Object>();
      List<Map<String, String>> xmlConfigs = new LinkedList<Map<String, String>>();
      List<Map<String, String>> envConfigs = new LinkedList<Map<String, String>>();

      //Fill file-dictionary configs from metainfo
      for (ClientConfigFileDefinition clientConfigFile : clientConfigFiles) {
        Map<String, String> fileDict = new HashMap<String, String>();
        fileDict.put(clientConfigFile.getFileName(), clientConfigFile.getDictionaryName());
        if (clientConfigFile.getType().equals("xml")) {
          xmlConfigs.add(fileDict);
        } else {
          envConfigs.add(fileDict);
        }
      }

      commandParams.put("xml_configs_list", xmlConfigs);
      commandParams.put("env_configs_list", envConfigs);
      commandParams.put("output_file", componentName + "-configs.tar.gz");

      Map<String, Object> jsonContent = new TreeMap<String, Object>();
      jsonContent.put("configurations", configurations);
      jsonContent.put("configuration_attributes", configurationAttributes);
      jsonContent.put("commandParams", commandParams);
      jsonContent.put("clusterHostInfo", clusterHostInfo);
      jsonContent.put("hostLevelParams", hostLevelParams);
      jsonContent.put("hostname", hostName);
      jsonConfigurations = gson.toJson(jsonContent);

      File jsonFileName = new File(TMP_PATH + File.separator + componentName + "-configuration.json");
      File tmpDirectory = new File(jsonFileName.getParent());
      if (!tmpDirectory.exists()) {
        try {
          tmpDirectory.mkdir();
          tmpDirectory.setWritable(true, true);
          tmpDirectory.setReadable(true, true);
        } catch (SecurityException se) {
          throw new SystemException("Failed to get temporary directory to store configurations", se);
        }
      }
      PrintWriter printWriter = null;
      try {
        printWriter = new PrintWriter(jsonFileName.getAbsolutePath());
        printWriter.print(jsonConfigurations);
        printWriter.close();
      } catch (FileNotFoundException e) {
        throw new SystemException("Failed to write configurations to json file ", e);
      }

      String cmd = "ambari-python-wrap " + commandScriptAbsolute + " generate_configs " + jsonFileName.getAbsolutePath() + " " +
              packageFolderAbsolute + " " + TMP_PATH + File.separator + "structured-out.json" + " INFO " + TMP_PATH;

      try {
        executeCommand(cmd, 1500);
      } catch (TimeoutException e) {
        throw new SystemException("Script was killed due to timeout  ", e);
      } catch (Exception e) {
        throw new SystemException("Failed to run python script for a component ", e);
      }

    } catch (AmbariException e) {
      throw new SystemException("Controller error ", e);
    }

    return resources;
  }

  @Override
  public RequestStatus updateResources(final Request request, Predicate predicate)
          throws SystemException, UnsupportedPropertyException, NoSuchResourceException, NoSuchParentResourceException {

    throw new SystemException("The request is not supported");
  }

  @Override
  public RequestStatus deleteResources(Predicate predicate)
          throws SystemException, UnsupportedPropertyException, NoSuchResourceException, NoSuchParentResourceException {

    throw new SystemException("The request is not supported");
  }


  // ----- AbstractResourceProvider ------------------------------------------

  @Override
  protected Set<String> getPKPropertyIds() {
    return pkPropertyIds;
  }


  // ----- utility methods ---------------------------------------------------

  /**
   * Get a component request object from a map of property values.
   *
   * @param properties the predicate
   * @return the component request object
   */

  private ServiceComponentHostRequest getRequest(Map<String, Object> properties) {
    return new ServiceComponentHostRequest(
            (String) properties.get(COMPONENT_CLUSTER_NAME_PROPERTY_ID),
            (String) properties.get(COMPONENT_SERVICE_NAME_PROPERTY_ID),
            (String) properties.get(COMPONENT_COMPONENT_NAME_PROPERTY_ID),
            (String) properties.get(HOST_COMPONENT_HOST_NAME_PROPERTY_ID),
            null);
  }


  private static int executeCommand(final String commandLine,
                                    final long timeout)
          throws IOException, InterruptedException, TimeoutException {
    Runtime runtime = Runtime.getRuntime();
    Process process = runtime.exec(commandLine);
    CommandLineThread commandLineThread = new CommandLineThread(process);
    commandLineThread.start();
    try {
      commandLineThread.join(timeout);
      if (commandLineThread.exit != null)
        return commandLineThread.exit;
      else
        throw new TimeoutException();
    } catch (InterruptedException ex) {
      commandLineThread.interrupt();
      Thread.currentThread().interrupt();
      throw ex;
    } finally {
      process.destroy();
    }
  }

  private static class CommandLineThread extends Thread {
    private final Process process;
    private Integer exit;

    private CommandLineThread(Process process) {
      this.process = process;
    }


    public void run() {
      try {
        exit = process.waitFor();
      } catch (InterruptedException ignore) {
        return;
      }
    }
  }

  protected ServiceOsSpecific populateServicePackagesInfo(ServiceInfo serviceInfo, Map<String, String> hostParams,
                                                          String osFamily) {
    ServiceOsSpecific hostOs = new ServiceOsSpecific(osFamily);
    List<ServiceOsSpecific> foundedOSSpecifics = getOSSpecificsByFamily(serviceInfo.getOsSpecifics(), osFamily);
    if (!foundedOSSpecifics.isEmpty()) {
      for (ServiceOsSpecific osSpecific : foundedOSSpecifics) {
        hostOs.addPackages(osSpecific.getPackages());
      }
      // Choose repo that is relevant for host
      ServiceOsSpecific.Repo serviceRepo = hostOs.getRepo();
      if (serviceRepo != null) {
        String serviceRepoInfo = gson.toJson(serviceRepo);
        hostParams.put(SERVICE_REPO_INFO, serviceRepoInfo);
      }
    }

    return hostOs;
  }

  private List<ServiceOsSpecific> getOSSpecificsByFamily(Map<String, ServiceOsSpecific> osSpecifics, String osFamily) {
    List<ServiceOsSpecific> foundedOSSpecifics = new ArrayList<ServiceOsSpecific>();
    for (Map.Entry<String, ServiceOsSpecific> osSpecific : osSpecifics.entrySet()) {
      if (osSpecific.getKey().indexOf(osFamily) != -1) {
        foundedOSSpecifics.add(osSpecific.getValue());
      }
    }
    return foundedOSSpecifics;
  }

}

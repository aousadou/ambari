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
package org.apache.ambari.server.orm.dao;

import com.google.inject.Inject;
import com.google.inject.Provider;
import com.google.inject.Singleton;
import com.google.inject.persist.Transactional;

import org.apache.ambari.server.orm.RequiresSession;
import org.apache.ambari.server.orm.cache.ConfigGroupHostMapping;
import org.apache.ambari.server.orm.cache.ConfigGroupHostMappingImpl;
import org.apache.ambari.server.orm.entities.ConfigGroupEntity;
import org.apache.ambari.server.orm.entities.ConfigGroupHostMappingEntity;
import org.apache.ambari.server.orm.entities.ConfigGroupHostMappingEntityPK;
import org.apache.ambari.server.orm.entities.HostEntity;
import org.apache.ambari.server.state.Cluster;
import org.apache.ambari.server.state.Host;
import org.apache.ambari.server.state.cluster.ClusterFactory;
import org.apache.ambari.server.state.configgroup.ConfigGroup;
import org.apache.ambari.server.state.configgroup.ConfigGroupFactory;
import org.apache.ambari.server.state.host.HostFactory;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.Predicate;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.WeakHashMap;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

@Singleton
public class ConfigGroupHostMappingDAO {
  @Inject
  Provider<EntityManager> entityManagerProvider;
  @Inject
  DaoUtils daoUtils;
  @Inject
  private ConfigGroupFactory configGroupFactory;
  @Inject
  private ClusterFactory clusterFactory;
  @Inject
  private HostFactory hostFactory;
  
  private final ReadWriteLock gl = new ReentrantReadWriteLock();
  
  private Map<String, Set<ConfigGroupHostMapping>> configGroupHostMappingByHost;
  
  private volatile boolean cacheLoaded;

  
  private void populateCache() {
    
    if (!cacheLoaded) {
      gl.writeLock().lock();
      try {
        if (configGroupHostMappingByHost == null) {
          configGroupHostMappingByHost = new WeakHashMap<String, Set<ConfigGroupHostMapping>>();
          
          TypedQuery<ConfigGroupHostMappingEntity> query = entityManagerProvider.get().createQuery(
              "SELECT entity FROM ConfigGroupHostMappingEntity entity",
              ConfigGroupHostMappingEntity.class);

          List<ConfigGroupHostMappingEntity> configGroupHostMappingEntities = daoUtils.selectList(query);
          
          for (ConfigGroupHostMappingEntity configGroupHostMappingEntity : configGroupHostMappingEntities) {

            Set<ConfigGroupHostMapping> setByHost = configGroupHostMappingByHost.get((configGroupHostMappingEntity.getHostname()));
              
            if (setByHost == null) {
              setByHost = new HashSet<ConfigGroupHostMapping>();
              configGroupHostMappingByHost.put(configGroupHostMappingEntity.getHostname(), setByHost);
            }
       
            ConfigGroupHostMapping configGroupHostMapping = buildConfigGroupHostMapping(configGroupHostMappingEntity);
            setByHost.add(configGroupHostMapping);
          } 
        }
      } finally {
        gl.writeLock().unlock();
      }
      
      cacheLoaded = true;

    }
    
  }

  /**
   * Return entity object which can be used for operations like remove
   * directly.
   * @param configGroupHostMappingEntityPK
   * @return
   */
  @RequiresSession
  public ConfigGroupHostMappingEntity findByPK(final ConfigGroupHostMappingEntityPK
        configGroupHostMappingEntityPK) {
    
    return entityManagerProvider.get()
      .find(ConfigGroupHostMappingEntity.class, configGroupHostMappingEntityPK);
  }

  @RequiresSession
  public Set<ConfigGroupHostMapping> findByHost(String hostname) {
    
    populateCache();
    
    if (!configGroupHostMappingByHost.containsKey(hostname))
      return null;
    
    Set<ConfigGroupHostMapping> set = new HashSet<ConfigGroupHostMapping>(configGroupHostMappingByHost.get(hostname));
    
    return set;
    
  }

  @RequiresSession
  public Set<ConfigGroupHostMapping> findByGroup(final Long groupId) {
    
    populateCache();
    
    Set<ConfigGroupHostMapping> result = new HashSet<ConfigGroupHostMapping>();
    
    for (Set<ConfigGroupHostMapping> item : configGroupHostMappingByHost.values()) {
      
      Set<ConfigGroupHostMapping> setByHost = new HashSet<ConfigGroupHostMapping>(item);
      
      CollectionUtils.filter(setByHost, new Predicate() {
        
        @Override
        public boolean evaluate(Object arg0) {
          return ((ConfigGroupHostMapping) arg0).getConfigGroupId().equals(groupId);
        }
      });
      
      result.addAll(setByHost);
      
    }
    
    return result;
    
  }

  @RequiresSession
  public List<ConfigGroupHostMappingEntity> findAll() {
    return daoUtils.selectAll(entityManagerProvider.get(), ConfigGroupHostMappingEntity.class);
  }

  @Transactional
  public void create(ConfigGroupHostMappingEntity
                         configGroupHostMappingEntity) {
    
    populateCache();

    entityManagerProvider.get().persist(configGroupHostMappingEntity);
    
    //create in cache
    Set<ConfigGroupHostMapping> set = configGroupHostMappingByHost.get(configGroupHostMappingEntity.getHostname());
    if (set == null){
      set = new HashSet<ConfigGroupHostMapping>();
      configGroupHostMappingByHost.put(configGroupHostMappingEntity.getHostname(), set);
    }
    
    set.add(buildConfigGroupHostMapping(configGroupHostMappingEntity));
    
  }



  @Transactional
  public ConfigGroupHostMappingEntity merge(ConfigGroupHostMappingEntity configGroupHostMappingEntity) {
    
    populateCache();
    
    Set<ConfigGroupHostMapping> set = configGroupHostMappingByHost.get(configGroupHostMappingEntity.getHostname());
    if (set == null){
      set = new HashSet<ConfigGroupHostMapping>();
      configGroupHostMappingByHost.put(configGroupHostMappingEntity.getHostname(), set);
    }
    
    //Update object in set
    set.remove(buildConfigGroupHostMapping(configGroupHostMappingEntity));
    set.add(buildConfigGroupHostMapping(configGroupHostMappingEntity));
    
    
    return entityManagerProvider.get().merge(configGroupHostMappingEntity);
  }

  @Transactional
  public void refresh(ConfigGroupHostMappingEntity
                         configGroupHostMappingEntity) {
    cacheLoaded = false;
    populateCache();
    
    entityManagerProvider.get().refresh(configGroupHostMappingEntity);
  }

  @Transactional
  public void remove(final ConfigGroupHostMappingEntity
                         configGroupHostMappingEntity) {
    
    populateCache();
    
    entityManagerProvider.get().remove(merge(configGroupHostMappingEntity));
    
    Set<ConfigGroupHostMapping> setByHost = configGroupHostMappingByHost.get(configGroupHostMappingEntity.getHostname());
    
    if (setByHost != null) {
      CollectionUtils.filter(setByHost, new Predicate() {
        
        @Override
        public boolean evaluate(Object arg0) {
          return !((ConfigGroupHostMapping) arg0).getConfigGroupId().
              equals(configGroupHostMappingEntity.getConfigGroupId());
        }
      });
    }
  }

  @Transactional
  public void removeByPK(final ConfigGroupHostMappingEntityPK
                         configGroupHostMappingEntityPK) {
    populateCache();
    
    entityManagerProvider.get().remove(findByPK(configGroupHostMappingEntityPK));
    
    Set<ConfigGroupHostMapping> setByHost = configGroupHostMappingByHost
      .get(configGroupHostMappingEntityPK.getHostname());
    
    if (setByHost != null) {
      CollectionUtils.filter(setByHost, new Predicate() {
        
        @Override
        public boolean evaluate(Object arg0) {
          return !((ConfigGroupHostMapping) arg0).getConfigGroupId().
              equals(configGroupHostMappingEntityPK.getConfigGroupId());
        }
      });
    }
    
  }

  @Transactional
  public void removeAllByGroup(final Long groupId) {
    populateCache();

    TypedQuery<Long> query = entityManagerProvider.get().createQuery
      ("DELETE FROM ConfigGroupHostMappingEntity confighosts WHERE " +
        "confighosts.configGroupId = ?1", Long.class);

    daoUtils.executeUpdate(query, groupId);
    // Flush to current transaction required in order to avoid Eclipse link
    // from re-ordering delete
    entityManagerProvider.get().flush();
    
    for (Set<ConfigGroupHostMapping> setByHost : configGroupHostMappingByHost.values()) {
      
      CollectionUtils.filter(setByHost, new Predicate() {
        
        @Override
        public boolean evaluate(Object arg0) {
          return !((ConfigGroupHostMapping) arg0).getConfigGroupId().equals(groupId);
        }
      });
    }
    
  }

  @Transactional
  public void removeAllByHost(String hostname) {
    TypedQuery<String> query = entityManagerProvider.get().createQuery
      ("DELETE FROM ConfigGroupHostMappingEntity confighosts WHERE " +
        "confighosts.hostname = ?1", String.class);

    daoUtils.executeUpdate(query, hostname);
    
    
    Set<ConfigGroupHostMapping> setByHost = configGroupHostMappingByHost.get(hostname);
    
    setByHost.clear();
    
    
  }
  
  private ConfigGroupHostMapping buildConfigGroupHostMapping(
      ConfigGroupHostMappingEntity configGroupHostMappingEntity) {
    
    ConfigGroupHostMappingImpl configGroupHostMapping = new ConfigGroupHostMappingImpl();
    configGroupHostMapping.setConfigGroup(buildConfigGroup(configGroupHostMappingEntity.getConfigGroupEntity()));
    configGroupHostMapping.setConfigGroupId(configGroupHostMappingEntity.getConfigGroupId());
    configGroupHostMapping.setHost(buildHost(configGroupHostMappingEntity.getHostEntity()));
    configGroupHostMapping.setHostname(configGroupHostMappingEntity.getHostname());
    
    return configGroupHostMapping;
  }

  private ConfigGroup buildConfigGroup(ConfigGroupEntity configGroupEntity) {
    
    Cluster cluster = clusterFactory.create(configGroupEntity.getClusterEntity());
    ConfigGroup configGroup = configGroupFactory.createExisting(cluster, configGroupEntity);
    
    return configGroup;
  }

  private Host buildHost(HostEntity hostEntity) {
    
    Host host = hostFactory.create(hostEntity, false);
    
    return host;
  }
}

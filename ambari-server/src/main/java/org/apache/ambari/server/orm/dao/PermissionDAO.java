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
import org.apache.ambari.server.orm.entities.PermissionEntity;
import org.apache.ambari.server.orm.entities.ResourceTypeEntity;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import java.util.List;

/**
 * Permission Data Access Object.
 */
@Singleton
public class PermissionDAO {

  /**
   * JPA entity manager
   */
  @Inject
  Provider<EntityManager> entityManagerProvider;

  @Inject
  DaoUtils daoUtils;

  /**
   * Find a permission entity with the given id.
   *
   * @param id  type id
   *
   * @return  a matching permission entity or null
   */
  public PermissionEntity findById(Integer id) {
    return entityManagerProvider.get().find(PermissionEntity.class, id);
  }

  /**
   * Find all permission entities.
   *
   * @return all entities or an empty List
   */
  public List<PermissionEntity> findAll() {
    TypedQuery<PermissionEntity> query = entityManagerProvider.get().createQuery("SELECT p FROM PermissionEntity p", PermissionEntity.class);
    return daoUtils.selectList(query);
  }

  /**
   * Find a permission entity by name and type.
   *
   * @param name         the permission name
   * @param resourceType the resource type
   *
   * @return a matching permission entity or null
   */
  public PermissionEntity findPermissionByNameAndType(String name, ResourceTypeEntity resourceType) {
    if (name.equals(PermissionEntity.VIEW_USE_PERMISSION_NAME)) {
      // VIEW.USE permission should be available for any type of views
      return findViewUsePermission();
    }
    TypedQuery<PermissionEntity> query = entityManagerProvider.get().createQuery("SELECT p FROM PermissionEntity p WHERE p.permissionName=:permissionname AND p.resourceType=:resourcetype", PermissionEntity.class);
    query.setParameter("permissionname", name);
    query.setParameter("resourcetype", resourceType);
    return daoUtils.selectSingle(query);
  }

  /**
   * Find AMBARI.ADMIN permission.
   *
   * @return a matching permission entity or null
   */
  public PermissionEntity findAmbariAdminPermission() {
    return findById(PermissionEntity.AMBARI_ADMIN_PERMISSION);
  }

  /**
   * Find VIEW.USE permission.
   *
   * @return a matching permission entity or null
   */
  public PermissionEntity findViewUsePermission() {
    return findById(PermissionEntity.VIEW_USE_PERMISSION);
  }

  /**
   * Find CLUSTER.OPERATE permission.
   *
   * @return a matching permission entity or null
   */
  public PermissionEntity findClusterOperatePermission() {
    return findById(PermissionEntity.CLUSTER_OPERATE_PERMISSION);
  }

  /**
   * Find CLUSTER.READ permission.
   *
   * @return a matching permission entity or null
   */
  public PermissionEntity findClusterReadPermission() {
    return findById(PermissionEntity.CLUSTER_READ_PERMISSION);
  }
}

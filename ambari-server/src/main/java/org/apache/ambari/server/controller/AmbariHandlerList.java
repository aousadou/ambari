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
package org.apache.ambari.server.controller;

import org.apache.ambari.server.orm.entities.ViewEntity;
import org.apache.ambari.server.orm.entities.ViewInstanceEntity;
import org.apache.ambari.server.view.ViewContextImpl;
import org.apache.ambari.server.view.ViewInstanceHandlerList;
import org.apache.ambari.server.view.ViewRegistry;
import org.apache.ambari.view.SystemException;
import org.apache.ambari.view.ViewContext;
import org.eclipse.jetty.server.Handler;
import org.eclipse.jetty.webapp.WebAppContext;

import javax.inject.Inject;
import javax.inject.Singleton;
import java.util.HashMap;
import java.util.Map;

/**
 * An Ambari specific extension of the FailsafeHandlerList that allows for the addition
 * of view instances as handlers.
 */
@Singleton
public class AmbariHandlerList extends FailsafeHandlerList implements ViewInstanceHandlerList {

  /**
   * The view registry.
   */
  @Inject
  ViewRegistry viewRegistry;

  /**
   * The Handler factory.
   */
  private final HandlerFactory handlerFactory;

  /**
   * Mapping of view instance entities to handlers.
   */
  private final Map<ViewInstanceEntity, Handler> handlerMap = new HashMap<ViewInstanceEntity, Handler>();


  // ----- Constructors ------------------------------------------------------

  /**
   * Construct an AmbariHandlerList.
   */
  public AmbariHandlerList() {
    super(true);
    this.handlerFactory = new HandlerFactory() {
      @Override
      public Handler create(ViewInstanceEntity viewInstanceDefinition, String webApp, String contextPath) {

        WebAppContext context = new WebAppContext(webApp, contextPath);

        context.setClassLoader(viewInstanceDefinition.getViewEntity().getClassLoader());
        context.setAttribute(ViewContext.CONTEXT_ATTRIBUTE, new ViewContextImpl(viewInstanceDefinition, viewRegistry));

        return context;
      }
    };
  }

  /**
   * Construct an AmbariHandlerList with the given handler factory.
   *
   * @param handlerFactory  the handler factory.
   */
  protected AmbariHandlerList(HandlerFactory handlerFactory) {
    super(true);
    this.handlerFactory = handlerFactory;
  }


  // ----- ViewInstanceHandler -----------------------------------------------

  @Override
  public void addViewInstance(ViewInstanceEntity viewInstanceDefinition) throws SystemException {
    Handler handler = getHandler(viewInstanceDefinition);
    handlerMap.put(viewInstanceDefinition, handler);
    addFailsafeHandler(handler);
    // if this is running then start the handler being added...
    if(!isStopped() && !isStopping()) {
      try {
        handler.start();
      } catch (Exception e) {
        throw new SystemException("Caught exception adding a view instance.", e);
      }
    }
  }

  @Override
  public void removeViewInstance(ViewInstanceEntity viewInstanceDefinition) {
    Handler handler = handlerMap.get(viewInstanceDefinition);
    if (handler != null) {
      removeHandler(handler);
    }
  }


  // ----- helper methods ----------------------------------------------------

  /**
   * Get a Handler for the given view instance.
   *
   * @param viewInstanceDefinition  the view instance definition
   *
   * @return a handler
   *
   * @throws org.apache.ambari.view.SystemException if an handler can not be obtained for the given view instance
   */
  private Handler getHandler(ViewInstanceEntity viewInstanceDefinition)
      throws SystemException {
    ViewEntity viewDefinition = viewInstanceDefinition.getViewEntity();
    return handlerFactory.create(viewInstanceDefinition, viewDefinition.getArchive(), viewInstanceDefinition.getContextPath());
  }


  // ----- inner interface : HandlerFactory ----------------------------------

  /**
   * Factory for creating Handler instances.
   */
  protected interface HandlerFactory {
    /**
     * Create a Handler.
     *
     * @param webApp       the web app archive
     * @param contextPath  the context path
     *
     * @return a new Handler instance
     */
    public Handler create(ViewInstanceEntity viewInstanceDefinition, String webApp, String contextPath);
  }
}

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
'use strict';

angular.module('ambariAdminConsole')
.controller('UsersShowCtrl', ['$scope', '$routeParams', 'User', '$modal', '$location', function($scope, $routeParams, User, $modal, $location) {
  $scope.user = {};

  $scope.isGroupEditing = false;
  $scope.enableGroupEditing = function() {
    $scope.isGroupEditing = true;
    $scope.editingGroupsList = $scope.user.user_groups.join();
  };

  $scope.updateGroups = function() {
    $scope.user.user_groups = $scope.editingGroupsList.split(',');
    $scope.isGroupEditing = false;
  };

  $scope.openChangePwdDialog = function() {
    var modalInstance = $modal.open({
      templateUrl: 'views/users/modals/changePassword.html',
      controller: function($scope) {
        $scope.passwordData = {
          password: ''
        };

        $scope.form = {};

        $scope.ok = function() {
          $scope.form.passwordChangeForm.submitted = true;
          if($scope.form.passwordChangeForm.$valid){
            modalInstance.close($scope.passwordData.password, $scope.passwordData.currentUserPassword);
          }
        };
        $scope.cancel = function() {
          modalInstance.dismiss('cancel');
        };
      }
    });

    modalInstance.result.then(function(newPassword, currentUserPassword) {
      User.setPassword($scope.user, newPassword, currentUserPassword);
    }); 
  };

  $scope.toggleUserActive = function() {
    $scope.user.active = !$scope.user.active;
    User.setActive($scope.user.user_name, $scope.user.active);
  };

  User.get($routeParams.id).then(function(data) {
    $scope.user = data.Users;
  });

  $scope.deleteUser = function() {
    var modalInstance = $modal.open({
      templateUrl: 'views/users/modals/deleteUserConfirmation.html',
      controller: function($scope) {
        $scope.delete = function() {
          modalInstance.close();
        };

        $scope.cancel = function() {
          modalInstance.dismiss('cancel');
        };
      }
    });

    modalInstance.result.then(function() {
      User.delete($scope.user.user_name).then(function() {
        $location.path('/users');
      });
    });
  };
}]);
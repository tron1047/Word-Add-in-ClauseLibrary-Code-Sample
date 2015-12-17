﻿// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.  
// See full license at the bottom of this file.

(function (angular) {
    "use strict";
    var app = angular.module('clauseLibraryApp');
    addGroupController['$inject'] = [
        '$scope',
        '$window',
        'groupItemService',
        'navigationService',
        'sessionService',
        'notificationService',
        'clauseItemService',
        'manageViewService',
        'localDatabaseService'
    ];
    app.controller('addGroupController', addGroupController);

    function addGroupController(
        $scope, $window, groupItemService,
        navigationService, sessionService, notificationService,
        clauseItemService, manageViewService, localDatabaseService) {

        //Group data
        $scope.title = '';
        $scope.groups = [];
        $scope.groups.selected = {};

        //Form data
        $scope.hasInitialised = false;
        $scope.maximumTitleLength = 255;
        $scope.submitButtonText = "Create group";
        $scope.groupSelectionLabelText = "Add to new or existing group that you own";
        $scope.isUserAdmin = sessionService.isUserAdmin();

        //Form functions
        $scope.cancel = function () {
            navigationService.back();
        }

        $scope.submitForm = function () {

            $scope.formSubmitted = true;

            //The form is discovered by angular using the name attribute
            if ($scope.groupForm.$invalid) {
                return;
            }

            var group = $scope.groups.length > 0 && $scope.groups.selected &&
                $scope.groups.selected.hasOwnProperty('Id') ? $scope.groups.selected : null;

            var data = {
                Group: {
                    Id: -1,
                    Title: $scope.title,
                    ParentId: group ? group.Id : 0,
                    OwnerId: sessionService.getUser().Id,
                    IsLocked: group ? group.IsLocked : false,
                    IsNew: true
                },
                Parent: group
            };

            groupItemService.save(data).then(function (createdGroup) {
                notificationService.notify("New Group '" + data.Group.Title + "' has been created", notificationService.types.success);

                localDatabaseService.updateItem(createdGroup, "groups");

                manageViewService.setActiveItem(createdGroup, 'group');
                navigationService.goToManage();
            })
            .catch(function (error) {
                console.error(error);
                notificationService.notify(error, notificationService.types.error);
            });
        }

        $scope.showControlError = function (formControl) {
            return (formControl.$dirty || $scope.formSubmitted) && formControl.$invalid;
        }

        var initialise = function () {
            // Retrieve all clause groups from the api
            localDatabaseService.getAllFromStore('groups').then(function (groups) {
                notificationService.notify('Loaded ' + groups.length + ' groups from store', notificationService.types.success);
                $scope.groups = groups;
            }).catch(function (err) {
                console.error(err);
                notificationService.notify('Failed to retrieve all groups', notificationService.types.error);
            });
        }

        initialise();
    };
})(angular);

// ClauseLibrary, https://github.com/OfficeDev/clauselibrary 
//   
// Copyright 2015(c) Microsoft Corporation 
//   
// All rights reserved. 
//   
// MIT License: 
//   
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and 
// associated documentation files (the "Software"), to deal in the Software without restriction, including 
// without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell 
// copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the 
// following conditions: 
//   
// The above copyright notice and this permission notice shall be included in all copies or substantial 
// portions of the Software. 
//   
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT 
// LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT 
// SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN 
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE 
// USE OR OTHER DEALINGS IN THE SOFTWARE. 
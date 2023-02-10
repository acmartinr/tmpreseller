angular.module('consumer_data_base').controller('AdministrationController',
    ['$scope', 'BASE_URL', 'administrationService', 'credentialsService', 'dataService', '$timeout', 'toasty', 'localization', '$interval', 'confirm', '$modal',
        function ($scope, BASE_URL, administrationService, credentialsService, dataService, $timeout, toasty, localization, $interval, confirm, $modal) {
            $scope.config = {sortValue: 'name', sortDesc: false, page: 1, limit: 10};
            $scope.sortByField = function (value) {
                if (value === $scope.config.sortValue) {
                    $scope.config.sortDesc = !$scope.config.sortDesc;
                } else {
                    $scope.config.sortDesc = false;
                }

                $scope.config.sortValue = value;
                $scope.config.page = 1;
            }

            $scope.dataType = 'consumer';
            dataService.dataSources({userId: credentialsService.getUser().id}, function (response) {
                $scope.dataSources = response.data;
                if (response.data.length > 0) {
                    $scope.dataType = response.data[0].name;
                    initTables($scope.dataType);
                }
            });

            $scope.dataTypeChanged = function () {
                initTables();
            }

            var updateMessage = function () {
                administrationService.protected().consumersMessage(function (response) {
                    if (response.message) {
                        toasty.success({
                            title: 'Importing data',
                            msg: response.message,
                            sound: false
                        });
                    }
                });

                administrationService.protected().businessMessage(function (response) {
                    if (response.message) {
                        toasty.success({
                            title: 'Importing data',
                            msg: response.message,
                            sound: false
                        });
                    }
                });
            }

            updateMessage();
            $scope.interval = $interval(updateMessage, 10000);
            $scope.$on('$destroy', function () {
                if ($scope.interval) $interval.cancel($scope.interval);
            });

            var initTables = function () {
                var numType = $scope.$root.types[$scope.dataType];

                administrationService.protected().allTablesByType({'type': numType}, function (response) {
                    $scope.tableName = response.data[0];
                    $scope.tables = response.data;
                });
            };
            initTables();

            $scope.importData = function (table) {
                var modalInstance = $modal.open({
                    templateUrl: BASE_URL + '/assets/partials/modal/import.html',
                    controller: 'ImportDataController',
                    resolve: {
                        table: function () {
                            return table;
                        }
                    }
                });

                modalInstance.result.then(function (type) {
                    $timeout(updateMessage, 1000);
                });
            }

            $scope.editTable = function (table) {
                var modalInstance = $modal.open({
                    templateUrl: BASE_URL + '/assets/partials/modal/table.html',
                    controller: 'EditTableController',
                    resolve: {
                        table: function () {
                            return table;
                        }
                    }
                });

                modalInstance.result.then(function () {
                    toasty.success({
                        title: 'Edit table',
                        msg: 'Table has been changed successfully',
                        sound: false
                    });
                    initTables();
                });
            }

            $scope.addTable = function () {
                var type = $scope.$root.types[$scope.dataType];

                var modalInstance = $modal.open({
                    templateUrl: BASE_URL + '/assets/partials/modal/table.html',
                    controller: 'EditTableController',
                    controller: 'EditTableController',
                    resolve: {
                        table: function () {
                            return {'type': type};
                        }
                    }
                });

                modalInstance.result.then(function () {
                    toasty.success({
                        title: 'Add new table',
                        msg: 'New table has been added successfully',
                        sound: false
                    });

                    initTables();
                });
            }
            $scope.addSource = function () {
                var type = $scope.$root.types[$scope.dataType];

                var modalInstance = $modal.open({
                    templateUrl: BASE_URL + '/assets/partials/modal/sourceAdd.html',
                    controller: 'EditSourcesController',
                    controller: 'EditSourcesController',
                    resolve: {
                        table: function () {
                            return {'type': type};
                        }
                    }
                });

                modalInstance.result.then(function () {
                    toasty.success({
                        title: 'Add new table',
                        msg: 'New table has been added successfully',
                        sound: false
                    });

                    initTables();
                });
            }
            $scope.removeTable = function (table) {
                confirm.getUserConfirmation('Remove table with name ' + table.name + '?', function () {
                    administrationService.protected().removeTable({id: table.id}, function (response) {
                        if (response.status === 'OK') {
                            toasty.success({
                                title: 'Remove table',
                                msg: 'Table has been removed successfully',
                                sound: false
                            });
                        } else {
                            toasty.error({
                                title: 'Remove table',
                                msg: 'We can\'t remove this table - one or more users use it',
                                sound: false
                            });
                        }

                        initTables();
                    });
                });
            }
        }]).controller('ImportDataController',
    ['$scope', '$modalInstance', 'table', '$timeout', 'administrationService', 'toasty', 'localization', 'BASE_URL', '$http','dictionaryService',
        function ($scope, $modalInstance, table, $timeout, administrationService, toasty, localization, BASE_URL, $http,dictionaryService) {
            $scope.sources = [];
            $scope.path = '';
            $scope.selectedSourceValue = '';
            $scope.skipRecords = 0;
            $scope.selectedSource = { limit: 30, all: false };

            $scope.getValue = function(sourceName){
                $scope.selectedSourceValue  = sourceName;
            }

            $scope.close = function () {
                $modalInstance.dismiss();
            }

            $scope.import = function () {
                $scope.importData(table.name, table.type);
            }

            $scope.formatSourceName = function(name) {
                name = name.toLowerCase();

                if (name == 'bing2019') {
                    return 'bing';
                } else if (name == 'angieslist2019' || name == 'angieslist2020') {
                    return 'angieslist';
                } else if (name == 'superpages2019') {
                    return 'superpages';
                } else {
                    return name;
                }
            }

            dictionaryService.sources( function( response ) {

                if ( response.status === 'OK' ) {

                    $scope.sources = [];
                    for (var i = 0; i < response.data.length; i++) {
                        $scope.sources.push({name:response.data[i].name, disabled: false});
                    }
                } else {
                    console.error( response );
                }
            } );


            $scope.importData = function (tableName, type) {
                const selectedFile = document.getElementById('inputFile').files[0];
                if (!selectedFile) {
                    toasty.error({
                        title: localization.localize('administration.import.error'),
                        msg: "Select one file",
                        sound: false,
                        timeout: false
                    });
                    return;
                }
                if ($scope.selectedSourceValue == '') {
                    toasty.error({
                        title: localization.localize('administration.import.error'),
                        msg: "Select the source name",
                        sound: false,
                        timeout: false
                    });
                    return;
                }
                $scope.loading = true;

                var fd = new FormData();
                console.log(selectedFile.name)
                fd.append('file', selectedFile);



                $http.post(BASE_URL + '/rest/public/lists/upload_import_file/'+tableName+"/"+type+"/"+$scope.selectedSourceValue+"/"+selectedFile.name, fd, {
                    transformRequest: angular.identity,
                    headers: {'Content-Type': undefined}
                }).success(function (response) {
                    console.log(response);
                    $scope.loading = false;
                    $timeout(function () {
                        if (!$scope.error) {
                            $modalInstance.close();
                            toasty.success({
                                title: 'Data import',
                                msg: 'Data import has been started',
                                sound: false
                            });
                        }
                    }, 2000);
                });
                /*
                                $scope.loading = true;
                                administrationService.protected().importData(
                                { 'type': type, path: $scope.path, name: tableName, skipRecords: $scope.skipRecords },
                                function( response ) {
                                    $scope.loading = false;
                                    if ( response.status === 'OK' ) {
                                        toasty.success( {
                                            title: localization.localize( 'administration.import.success' ),
                                            msg: localization.localize( 'administration.import.success.message' ) + response.data + '.',
                                            sound: false,
                                            timeout: false
                                        } );

                                        $modalInstance.close();
                                    } else {
                                        var message = localization.localize( 'administration.import.error.message' );
                                        if ( response.message ) {
                                            message = message + ". Line with incorrect data is " + response.message + ".";
                                        }

                                        toasty.error( {
                                            title: localization.localize( 'administration.import.error' ),
                                            msg: message,
                                            sound: false,
                                            timeout: false
                                        } );

                                        $scope.error = true;
                                        $modalInstance.dismiss();
                                    }


                                } );*/


            }
        }]).controller('EditTableController',
    ['$scope', '$modalInstance', 'table', 'administrationService', 'toasty',
        function ($scope, $modalInstance, table, administrationService, toasty) {

            $scope.table = {};
            $scope.sourceName = {};
            for (var prop in table) {
                $scope.table[prop] = table[prop];
            }

            $scope.close = function () {
                $modalInstance.dismiss();
            }

            $scope.save = function () {
                administrationService.protected().saveTable($scope.table, function (response) {
                    if (response.status === 'OK') {
                        $modalInstance.close();
                    } else {
                        toasty.error({
                            title: table.id ? 'Edit table' : 'Create table',
                            msg: 'Table with this name already exits',
                            sound: false
                        });
                    }
                });
            }
        }]).controller('EditSourcesController',
    ['$scope', '$modalInstance', 'table', 'administrationService', 'toasty',
        function ($scope, $modalInstance, table, administrationService, toasty) {

            $scope.sourceName = {};

            $scope.close = function () {
                $modalInstance.dismiss();
            }

            $scope.saveSource = function () {
                administrationService.protected().saveSource($scope.sourceName, function (response) {
                    if (response.status === 'OK') {
                        $modalInstance.close();
                    } else {
                        toasty.error({
                            title: 'Create source' ,
                            msg: 'Source with this name already exits',
                            sound: false
                        });
                    }
                });
            }
        }])

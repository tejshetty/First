(function (app) {
    'use strict';

    app.controller('addStoreCreditModelCtrl', addStoreCreditModelCtrl);

    addStoreCreditModelCtrl.$inject = ['$scope', '$window', 'sharedService', '$location', 'apiService', 'notificationService', '$rootScope','$modalInstance'];
    function addStoreCreditModelCtrl($scope, $window, sharedService, $location, apiService, notificationService, $rootScope, $modalInstance) {

        $scope.LimitToStoreCreditNumber = LimitToStoreCreditNumber;
        $scope.EditedCustomer = {};
        $scope.reasonData = {};
        $scope.isLoadingStoreCredit = false;    
        $scope.UpdateCreditBalance = UpdateCreditBalance;
        $scope.CancelStoreCredits = CancelStoreCredits;
        $scope.modelElement = {};

        var loggedUserName = $window.sessionStorage.getItem("AddedBy");

        (function InitController() {
            Init();
        })()

        function Init() {
            $scope.isLoadingStoreCredit = true;   
            apiService.getFromApi('SmartServeCust/GetStoreCreditTransactionReason').then(usersStoreCreditReasonLoadCompleted, usersStoreCreditReasonLoadFailed);
            GetStoreCredit();    
            $scope.isLoadingStoreCredit = false;   
        }
        function GetStoreCredit() {
            apiService.getFromApi('SmartServeCust/StoreCreditBalance', { params: { cricutUserId: $window.sessionStorage.getItem("UserId") } }).then(usersStoreCreditLoadCompleted, usersStoreCreditLoadFailed);
        }
        
        function usersStoreCreditLoadCompleted(result) {
            $rootScope.storeCreditBalance = result.data;
            $rootScope.loadingCircleClub = false;
            $scope.isFormInvalid = false;
        }

        function usersStoreCreditLoadFailed() {
            $rootScope.loadingCircleClub = false;
            notificationService.displayError("Unable to get store credit details");
            $scope.isLoadingStoreCredit = false;    
        }

        function usersStoreCreditReasonLoadCompleted(result) {
            $rootScope.storeCreditReason = result.data;
        }

        function usersStoreCreditReasonLoadFailed(response) {
            notificationService.displayError("Unable to load store credit reason");
            $scope.isLoadingStoreCredit = false;    
        }

        function LimitToStoreCreditNumber(storeCreditNumber) {
            if ((storeCreditNumber > 100) || (storeCreditNumber < -100))
                notificationService.displayError("Value out of range (-100 to 100)");
        }
        function UpdateCreditBalance() {
            $scope.isFormInvalid = false;
            if (angular.isUndefined($scope.EditedCustomer.updateCredit) || ($scope.EditedCustomer.updateCredit == null)) {
                $scope.isFormInvalid = true;
                angular.element('#txttext').focus();
                return;
            }
            if (angular.isUndefined($scope.EditedCustomer.comments) || ($scope.EditedCustomer.comments == null)) {
                $scope.isFormInvalid = true;
                angular.element('#txtcomment').focus();
                return;
            }
            if (($scope.EditedCustomer.updateCredit == 0) || ($scope.EditedCustomer.updateCredit > 100)) {
                $scope.isFormInvalid = true;
                angular.element('#txttext').focus();
                return;
            }
            else if ($scope.EditedCustomer.updateCredit < -100) {
                $scope.isFormInvalid = true;
                angular.element('#txttext').focus();
                return;
            }

            if (!$scope.isFormInvalid) {
                // GetStoreCredit();

                if (angular.isUndefined($rootScope.storeCreditBalance)) {
                    $rootScope.storeCreditBalance = 0;
                }
                else {
                    if ((parseInt($rootScope.storeCreditBalance) + parseInt($scope.EditedCustomer.updateCredit) >= 0)) {
                        $scope.storeCredit = {};

                        $scope.storeCredit.UserId = $window.sessionStorage.getItem('UserId');
                        $scope.storeCredit.Balance = $scope.EditedCustomer.updateCredit;
                        $scope.storeCredit.TransDetail = $scope.reasonData.reasonDesc.substring(0, 5) + "-" + loggedUserName + "-" + $scope.EditedCustomer.comments;
                        $scope.storeCredit.TotalCredit = parseInt($rootScope.storeCreditBalance) + parseInt($scope.EditedCustomer.updateCredit);
                        $scope.storeCredit.First = $window.sessionStorage.getItem("FirstName");;
                        $scope.storeCredit.Last = $window.sessionStorage.getItem("LastName");
                        $scope.storeCredit.Email = $window.sessionStorage.getItem("Emailid");
                        $scope.isLoadingStoreCredit = true;
                        apiService.postToApi('SmartServeCust/StoreCreditInsertUpdate', $scope.storeCredit)
                            .then(usersCreditUpdateLoadCompleted, usersCreditUpdateLoadFailed);
                    }
                    else {
                        notificationService.displayError("Cannot update to negative credits.");
                    }
                }
            }
        }
        function usersCreditUpdateLoadCompleted(result) {
            $scope.isLoadingStoreCredit = false;
            GetStoreCredit();
            $scope.EditedCustomer.updateCredit = null;
            $scope.EditedCustomer.comments = null;
            $scope.isFormInvalid = false;
            $scope.reasonData.reasonDesc = 0;
            notificationService.displaySuccess("Store Credit of the customer updated.")
            $scope.modelElement = result.config.data;
            $modalInstance.close($scope.modelElement);
        }
        function usersCreditUpdateLoadFailed(response) {
            $scope.isLoadingStoreCredit = false;
            notificationService.displayError("Unable to update store credit details");
        }

        function CancelStoreCredits() {
            $scope.isEnabled = false;
            $modalInstance.close();
        };
    }
})(angular.module('smartServe'));

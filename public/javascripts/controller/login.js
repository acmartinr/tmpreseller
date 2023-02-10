angular.module( 'consumer_data_base' ).
controller( 'LoginController',
    [ '$scope', 'BASE_URL', '$state', '$rootScope', '$stateParams', 'authService', 'credentialsService', 'systemService', 'localization', 'toasty', '$modal', '$cookies',
        function( $scope, BASE_URL, $state, $rootScope, $stateParams, authService, credentialsService, systemService, localization, toasty, $modal, $cookies ) {
            $scope.loginRequest = {termsAgreed: false};
            $scope.ivoSite = document.URL.indexOf('reidatalist') != -1;// || document.URL.indexOf('localhost') != -1;
            $scope.password = '';
            $scope.confirm = '';
            $scope.pas_token = '';
            if ( $stateParams.token ) {
                authService.completeRegistration( { token: $stateParams.token }, function( response ) {
                    if ( response.status === 'OK' ) {
                        toasty.success( {
                            title: localization.localize( 'registration.complete.success.title' ),
                            msg: localization.localize( 'registration.complete.success' ),
                            sound: false
                        } );
                    } else {
                        toasty.error( {
                            title: localization.localize( 'registration.complete.error.title' ),
                            msg: localization.localize( 'registration.complete.error' ),
                            sound: false
                        } );
                    }
                } );
            }

            if ($stateParams.login_token) {
                authService.loginWithToken({token: $stateParams.login_token}, function(response) {
                    if (response.status === 'OK') {
                        $scope.hide = true;

                        credentialsService.setUser(response.data);
                        var md = new MobileDetect( window.navigator.userAgent );
                        if (!document.resellerNumber) {
                            if ( md.mobile() ) {
                                $state.transitionTo( 'mobile' );
                            } else {
                                $rootScope.$broadcast('LOGGED_IN');
                                $state.transitionTo( 'main' );
                            }
                        } else {
                            if ( md.mobile() ) {
                                window.location.replace("/#/mobile");
                            } else {
                                window.location.replace("/#/");
                            }
                        }
                    }
                });
            }

            $scope.changePassword = function() {
                authService.changePassword( { 'token': $scope.pas_token, password: md5( $scope.recover.password ) }, function( response ) {
                    toasty.success( {
                        title: 'Password changed',
                        msg: 'Your password has been changed successfully',
                        sound:  false
                    } );
                    $scope.style = function (value){
                        return {
                            "display":"none"
                        }
                    };
                    credentialsService.login( response.message,md5( $scope.recover.password ),
                        function() { $scope.visibilityParam.hide = true; },
                        function( response2 ) {
                            console.log(response2);
                            if ( response2.status === 'OK' ) {
                                $state.transitionTo( 'main' );
                            } else {
                                toasty.error( {
                                    title: localization.localize( 'login.error.title' ),
                                    msg: localization.localize( 'login.error' ),
                                    sound: false
                                } );
                            }
                        } );



                   // $modalInstance.close( { username: response.message, password: md5( $scope.password ) } );
                } );
            }

            if ( $stateParams.pas_token ) {
                $scope.pas_token = $stateParams.pas_token;
                authService.checkPasswordRecoveryToken( { token: $stateParams.pas_token }, function( response ) {
                    if ( response.status == 'OK' ) {
                        $scope.style = function (value){
                            return {
                                "display":value
                            }
                        };
                      //  $scope.openChangePasswordPopup( $stateParams.pas_token );
                    } else {
                        toasty.error( {
                            title: localization.localize( 'Password recovery' ),
                            msg: localization.localize( 'Recovery password link expired.' ),
                            sound: false
                        } );
                    }
                } );
            }
            systemService.getComments(function(response) {
                $scope.comments = response.data;
            });

            $scope.isLoggedIn = function() {
                return credentialsService.isLoggedIn();
            }

            $scope.openChangePasswordPopup = function( token ) {
                var modalInstance = $modal.open( {
                    templateUrl: BASE_URL + '/assets/partials/modal/password.change.html',
                    controller: 'ChangePasswordModalController',
                    windowClass: 'registration-modal',
                    resolve: { token: function() { return token; } }
                } );

                modalInstance.result.then( function( credentials ) {
                    credentialsService.login( credentials.username, credentials.password,
                        function( response ) {
                            if ( response.status === 'OK' ) {
                                $state.transitionTo( 'main' );
                            } else {
                                toasty.error( {
                                    title: localization.localize( 'login.error.title' ),
                                    msg: localization.localize( 'login.error' ),
                                    sound: false
                                } );
                            }
                        } );
                } );
            }

            $scope.visibilityParam = {hide: false};
            $scope.login = function() {
                if ( !$scope.loginRequest.username || !$scope.loginRequest.password ) {
                    toasty.error( {
                        title: localization.localize( 'login.validation.error.title' ),
                        msg: localization.localize( 'login.validation.error' ),
                        sound: false
                    } );

                    return;
                }

                if (document.URL.indexOf('makemydata.com') !== -1 && !$scope.loginRequest.termsAgreed) {
                    toasty.error( {
                        title: 'General Terms & Conditions ',
                        msg: 'You should agree to the General Terms & Conditions before login',
                        sound: false
                    } );

                    return;
                }

                var request = { name: $scope.loginRequest.username,
                    password: md5( $scope.loginRequest.password ) };

                credentialsService.login( request.name, request.password,
                    function() { $scope.visibilityParam.hide = true; },
                    function( response ) {
                        if ( response.status === 'OK' ) {
                            var md = new MobileDetect( window.navigator.userAgent );
                            if (!document.resellerNumber) {
                                if ( md.mobile() ) {
                                    $state.transitionTo( 'mobile' );
                                } else {
                                    $rootScope.$broadcast('LOGGED_IN');
                                    $state.transitionTo( 'main' );
                                    location.reload();
                                }
                            } else {
                                if ( md.mobile() ) {
                                    window.location.replace("/#/mobile");
                                } else {
                                    window.location.replace("/#/");
                                }
                            }
                        } else {
                            toasty.error( {
                                title: localization.localize( 'login.error.title' ),
                                msg: localization.localize( 'login.error' ),
                                sound: false
                            } );
                        }
                    } );
            }
            $scope.registration = {};

            $scope.register = function() {
                var registrationRequest = { username: $scope.registration.username,
                    email: $scope.registration.email,
                    phone: $scope.registration.phone,
                    companyName: $scope.registration.companyName,
                    address: $scope.registration.address,
                    promoCode: $scope.registration.promoCode,
                    password: md5( $scope.registration.password ),
                    resellerNumber: document.resellerNumber };


                authService.validateRegistration( registrationRequest, function( response ) {
                    if ( response.status == 'OK' ) {
                        sendRegistrationRequest( registrationRequest );
                    } else {
                        toasty.error( {
                            title: localization.localize( 'registration.error' ),
                            msg: localization.localize( response.message ),
                            sound: false
                        } );
                    }
                } );
            }
            $scope.recover = {};

            $scope.recoverPassword = function() {
                authService.recoverPassword( { email: $scope.recover.email}, function() {
                    toasty.success( {
                        title: 'Password recovery',
                        msg: 'Email with password recovery instructions has been sent to your email',
                        sound: false
                    } );
                    //$scope.close();
                } );
                /*
                authService.recoverPassword( { email: $scope.email }, function() {
                    toasty.success( {
                        title: 'Password recovery',
                        msg: 'Email with password recovery instructions has been sent to your email',
                        sound: false
                    } );
                    $scope.close();
                } );

                 */
            }

            $scope.feedback = {};

            $scope.sendFeedback = function() {
                systemService.sendFeedback( $scope.feedback, function( response ) {
                    if ( response.status == 'OK' ) {
                        toasty.success( {
                            title: localization.localize( 'feedback.success.title' ),
                            msg: localization.localize( 'feedback.success' ),
                            sound: false
                        } );

                        $scope.close();
                    }
                } );
            }

            $scope.close = function() {
                $modalInstance.dismiss();
            }

            var sendRegistrationRequest = function( registrationRequest ) {
                authService.registration( registrationRequest, function() {
                    toasty.success( {
                        title: localization.localize( 'registration.completed' ),
                        msg: localization.localize( 'registration.completed.message' ),
                        sound: false
                    } );
                    console.log($("#exampleModalRegister").modal);
                    //  $("#exampleModalRegister").fadeOut();

                    // $scope.close();
                } );
            }


            $scope.openRegistrationPopup = function() {
                var modalInstance = $modal.open( {
                    templateUrl: BASE_URL + '/assets/partials/modal/registration.html',
                    controller: 'RegistrationModalController',
                    windowClass: 'registration-modal'
                } );
            }

            $scope.openForgotPasswordPopup = function() {
                var modalInstance = $modal.open( {
                    templateUrl: BASE_URL + '/assets/partials/modal/password.recovery.html',
                    controller: 'RecoveryPasswordController',
                    windowClass: 'registration-modal'
                } );
            }

            $scope.openFeedbackPopup = function() {
                $modal.open( {
                    templateUrl: BASE_URL + '/assets/partials/modal/feedback.html',
                    controller: 'FeedbackModalController',
                    windowClass: 'registration-modal'
                } );
            }

            $scope.showChatWindow = function() {
                var elements = document.getElementsByClassName( 'mylivechat_collapsed' );
                for ( var i = 0; i < elements.length; i++ ) {
                    elements[ i ].click();
                }
            }
            $scope.goToContactUs = function() {
                var contactUsPos = document.getElementById( 'contactUsElement' );
                const rect = contactUsPos.getBoundingClientRect();
                window.scroll({ top: rect.top-30+window.scrollY, behavior: 'smooth' });
            }
            $scope.goToContactUsMobile = function() {
                var contactUsPos = document.getElementById( 'contactUsElementM' );
                const rect = contactUsPos.getBoundingClientRect();
                window.scroll({ top: rect.top-30+window.scrollY, behavior: 'smooth' });
            }
            $scope.goToServices = function() {
                var servicesPos = document.getElementById( 'servicesElements' );
                const rect = servicesPos.getBoundingClientRect();
                window.scroll({ top: rect.top-120+window.scrollY, behavior: 'smooth' });
            }
            $scope.goToServicesMobile = function() {
                var servicesPos = document.getElementById( 'servicesElementsM' );
                const rect = servicesPos.getBoundingClientRect();
                window.scroll({ top: rect.top-120+window.scrollY, behavior: 'smooth' });
            }
            $scope.goToVideos = function() {
                var videoPos = document.getElementById( 'videoElements' );
                const rect = videoPos.getBoundingClientRect();
                window.scroll({ top: rect.top-120+window.scrollY, behavior: 'smooth' });
            }
            $scope.goToVideosMobile = function() {
                var videoPos = document.getElementById( 'videoElementsM' );
                const rect = videoPos.getBoundingClientRect();
                window.scroll({ top: rect.top-120+window.scrollY, behavior: 'smooth' });
            }
            $scope.goToComments = function() {
                var commentsPos = document.getElementById( 'commentsElement' );
                const rect = commentsPos.getBoundingClientRect();
                window.scroll({ top: rect.top+window.scrollY, behavior: 'smooth' });
            }
            $scope.goToCommentsMobile = function() {
                var commentsPos = document.getElementById( 'commentsElementM' );
                const rect = commentsPos.getBoundingClientRect();
                window.scroll({ top: rect.top+window.scrollY, behavior: 'smooth' });
            }
        }
    ] )
    .controller( 'RegistrationModalController',
        [ '$scope', '$modalInstance', 'authService', 'localization', 'toasty',
            function( $scope, $modalInstance, authService, localization, toasty ) {
                $scope.registration = {};

                $scope.register = function() {
                    var registrationRequest = { username: $scope.registration.username,
                        email: $scope.registration.email,
                        phone: $scope.registration.phone,
                        companyName: $scope.registration.companyName,
                        address: $scope.registration.address,
                        promoCode: $scope.registration.promoCode,
                        password: md5( $scope.registration.password ),
                        resellerNumber: document.resellerNumber };


                    authService.validateRegistration( registrationRequest, function( response ) {
                        if ( response.status == 'OK' ) {
                            sendRegistrationRequest( registrationRequest );
                        } else {
                            toasty.error( {
                                title: localization.localize( 'registration.error' ),
                                msg: localization.localize( response.message ),
                                sound: false
                            } );
                        }
                    } );
                }

                $scope.close = function() {
                    $modalInstance.dismiss();
                }

                var sendRegistrationRequest = function( registrationRequest ) {
                    authService.registration( registrationRequest, function() {
                        toasty.success( {
                            title: localization.localize( 'registration.completed' ),
                            msg: localization.localize( 'registration.completed.message' ),
                            sound: false
                        } );

                        $scope.close();
                    } );
                }
            }
        ] )
    .controller( 'FeedbackModalController',
        [ '$scope', '$modalInstance', 'systemService', 'localization', 'toasty',
            function( $scope, $modalInstance, systemService, localization, toasty ) {
                $scope.feedback = {};

                $scope.send = function() {
                    systemService.sendFeedback( $scope.feedback, function( response ) {
                        if ( response.status == 'OK' ) {
                            toasty.success( {
                                title: localization.localize( 'feedback.success.title' ),
                                msg: localization.localize( 'feedback.success' ),
                                sound: false
                            } );

                            $scope.close();
                        }
                    } );
                }

                $scope.close = function() {
                    $modalInstance.dismiss();
                }

                var sendRegistrationRequest = function( registrationRequest ) {
                    authService.registration( registrationRequest, function() {
                        toasty.success( {
                            title: localization.localize( 'registration.completed' ),
                            msg: localization.localize( 'registration.completed.message' ),
                            sound: false
                        } );

                        $scope.close();
                    } );
                }
            }
        ] )
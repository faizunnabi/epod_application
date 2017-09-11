app = angular.module('app.controllers', []);
localStorage.setItem("track_state", "");

/*app.controller('IntroCtrl', function($scope, $state, $ionicSlideBoxDelegate, $cordovaPreferences) {
    ionic.Platform.ready(function() {
        $cordovaPreferences.fetch('walkthrough')
            .success(function(v) {
                if (v) {
                    $state.go('login');
                } else {
                    $cordovaPreferences.store('walkthrough', 'true')
                        .success(function(value) {
                            console.log("saved");
                            $scope.startApp = function() {
                                $state.go('login');
                            };
                            $scope.next = function() {
                                $ionicSlideBoxDelegate.next();
                            };
                            $scope.previous = function() {
                                $ionicSlideBoxDelegate.previous();
                            };

                            // Called each time the slide changes
                            $scope.slideChanged = function(index) {
                                $scope.slideIndex = index;
                            };
                        })
                        .error(function(error) {
                            console.log(error);
                        });
                }

            })
            .error(function(e) {
                console.log(e);
                $cordovaPreferences.store('walkthrough', 'true')
                    .success(function(value) {
                        console.log("saved");
                        $scope.startApp = function() {
                            $state.go('login');
                        };
                        $scope.next = function() {
                            $ionicSlideBoxDelegate.next();
                        };
                        $scope.previous = function() {
                            $ionicSlideBoxDelegate.previous();
                        };

                        // Called each time the slide changes
                        $scope.slideChanged = function(index) {
                            $scope.slideIndex = index;
                        };
                    })
                    .error(function(error) {
                        console.log("error in save");
                    });
            });
    });
});*/

//Login section controller

app.controller('LoginController', function($scope, $state, $ionicPopup, $ionicLoading, postService, $cordovaNetwork) {
    ionic.Platform.ready(function() {
        if ($cordovaNetwork.isOffline()) {

            $ionicPopup.confirm({
                title: "Internet is not working",
                content: "Internet is not working on your device."
            });
            ionic.Platform.exitApp();
        } else {
            $scope.user = {};
            $scope.err_mssg = "";
            $scope.check_login = function() {
                if ($scope.user.name && $scope.user.pass) {
                    $ionicLoading.show({ template: '<ion-spinner name="bubbles"></ion-spinner>' });
                    postService.postData("auth_user", { email: $scope.user.name, password: $scope.user.pass }).then(function(res) {
                        if (res !== '0' && !isNaN(res)) {
                            //console.log(res);
                            $ionicLoading.hide();
                            $scope.token = $scope.user.name;
                            $scope.uid = res;
                            localStorage.setItem("session_auth", $scope.token);
                            localStorage.setItem("uid", $scope.uid);
                            //console.log($scope.uid);
                            $state.go('menus');
                        } else {
                            $ionicLoading.hide();
                            $scope.err_mssg = res;
                        }
                    }, function(err) {
                        $ionicLoading.hide();
                        alert("Error in fetching data !");
                    }, function(progress) {
                        $ionicLoading.show({ template: '<ion-spinner name="bubbles"></ion-spinner>' });
                    });
                } else {
                    $scope.err_mssg = "Incomplete data provided !";
                }

            };
        }
        // console.log(localStorage.getItem("uid"));
    });
});

//Menu section controller

app.controller('MenuController', function($scope, $state, trackService) {
    ionic.Platform.ready(function() {
        $scope.session_auth = localStorage.getItem("session_auth");
        if ($scope.session_auth === "") {
            $state.go("login");
        }
        $scope.active = false;
        //console.log("State of button " + localStorage.getItem("track_state"));
        if (localStorage.getItem("track_state") === null) {
            localStorage.setItem("track_state", $scope.active);
        } else {
            $scope.active = localStorage.getItem("track_state");
        }
        $scope.navigator = function() {
            if (!$scope.active) {
                $scope.active = true;
                localStorage.setItem("track_state", $scope.active);
                trackService.start_tracking(localStorage.getItem("uid"));
            } else {
                $scope.active = false;
                localStorage.setItem("track_state", $scope.active);
                trackService.stop_tracking();
            }
        };
    });
});

//Logout section controller

app.controller('LogoutController', function($scope, $state, $ionicHistory) {
    ionic.Platform.ready(function() {
        localStorage.setItem("session_auth", "");
        $ionicHistory.clearHistory();
        $state.go('login');
    });
});

//Jobs section controller

app.controller('JobsController', function($scope, socket, $ionicHistory, $ionicPopup, getService, postService, $state, $ionicLoading) {
    ionic.Platform.ready(function() {
        $scope.jobs = {};
        $scope.session_auth = localStorage.getItem("session_auth");
        if ($scope.session_auth !== "") {
            $scope.listCanSwipe = true;
            $scope.myGoBack = function() {
                $ionicHistory.goBack();
            };
            $ionicLoading.show({ template: '<ion-spinner name="bubbles"></ion-spinner>' });
            postService.postData('jobs', { user_id: localStorage.getItem("uid") }).then(function(res) {
                $ionicLoading.hide();
                $scope.jobs = res;
                console.log(res);
            }, function(err) {
                $ionicLoading.hide();
                alert("Error in fetching data !");
            }, function(progress) {
                $ionicLoading.show({ template: '<ion-spinner name="bubbles"></ion-spinner>' });
            });
            $scope.job_accept = function(i, id, jid) {
                $ionicLoading.show({ template: '<ion-spinner name="bubbles"></ion-spinner>' });
                var job = {
                    job_id: jid,
                    order_id: id,
                    user_id: localStorage.getItem("uid")
                };
                postService.postData('accept_job', { job_id: jid, order_id: id, user_id: localStorage.getItem("uid") }).then(function(res) {
                    if (res === "ok") {
                        $ionicLoading.hide();
                        $scope.jobs.data.splice(i, 1);
                        $ionicPopup.alert({
                            title: 'Success',
                            template: 'You have successfully added the job'
                        });
                        socket.emit("notify", "New activity seen");
                    } else {
                        // console.log(res);
                    }
                }, function(err) {
                    $ionicLoading.hide();
                    alert("Error in fetching data !");
                }, function(progress) {
                    $ionicLoading.show({ template: '<ion-spinner name="bubbles"></ion-spinner>' });
                });
            };

            $scope.job_reject = function(i, id, jid) {
                $ionicLoading.show({ template: '<ion-spinner name="bubbles"></ion-spinner>' });
                var job = {
                    job_id: jid,
                    order_id: id,
                    user_id: localStorage.getItem("uid")
                };
                postService.postData('reject_job', JSON.stringify(job)).then(function(res) {
                    if (res === "ok") {
                        $ionicLoading.hide();
                        $scope.jobs.data.splice(i, 1);
                        $ionicPopup.alert({
                            title: 'Success',
                            template: 'You have successfully rejected the job'
                        });
                        socket.emit("notify", "New activity seen");
                    }
                }, function(err) {
                    $ionicLoading.hide();
                    alert("Error in fetching data !");
                }, function(progress) {
                    $ionicLoading.show({ template: '<ion-spinner name="bubbles"></ion-spinner>' });
                });
            };

            $scope.show_job = function(i) {
                $state.go("job_detail", { order_id: i });
            };
        } else {
            $state.go("login");
        }

    });
});

//Jobs details section controller

app.controller('JobDetailController', function($scope, socket, $ionicHistory, $state, postService, $ionicLoading, $ionicModal) {
    ionic.Platform.ready(function() {
        $scope.session_auth = localStorage.getItem("session_auth");
        if ($scope.session_auth !== "") {
            $scope.myGoBack = function() {
                $ionicHistory.goBack();
            };
            $scope.order_id = $state.params.order_id;
            //console.log($state.params.order_id);
            $ionicLoading.show({ template: '<ion-spinner name="bubbles"></ion-spinner>' });
            postService.postData('single_order', { order_id: $scope.order_id }).then(function(res) {
                    $ionicLoading.hide();
                    $scope.details = res;
                    // console.log($scope.details);
                },
                function(err) {
                    $ionicLoading.hide();
                    alert("Error in fetching data !");
                },
                function(progress) {
                    $ionicLoading.show({ template: '<ion-spinner name="bubbles"></ion-spinner>' });
                });

            $scope.call_action = function() {
                var number = $scope.details.data[0].recipient_mobile;
                window.plugins.CallNumber.callNumber(function() {
                    //console.log("success");
                }, function() {
                    //console.log("error");
                }, number);
            };
        } else {
            $state.go("login");
        }
    });
});

//Delivery Section controller

app.controller('DeliveryController', function($scope, socket, $ionicHistory, $state, postService, $window, $ionicLoading, $cordovaGeolocation) {
    ionic.Platform.ready(function() {
        $scope.session_auth = localStorage.getItem("session_auth");
        if ($scope.session_auth !== "") {
            $scope.listCanSwipe = true;
            $scope.myGoBack = function() {
                $ionicHistory.goBack();
            };
            $ionicLoading.show({ template: '<ion-spinner name="bubbles"></ion-spinner>' });
            postService.postData('fetch_delivery', { user_id: localStorage.getItem("uid") }).then(function(res) {
                $ionicLoading.hide();
                $scope.jobs = res;
            }, function(err) {
                $ionicLoading.hide();
                alert("Error in fetching data !");
            }, function(progress) {
                $ionicLoading.show({ template: '<ion-spinner name="bubbles"></ion-spinner>' });
            });
            $scope.call_recipient = function(num) {
                var number = num;
                window.plugins.CallNumber.callNumber(function() {
                    // console.log("success");
                }, function() {
                    // console.log("error");
                }, number);
            };
            $scope.start_navigation = function(dlat, dlong) {
                var slat = 0;
                var slong = 0;
                var posOptions = { timeout: 10000, enableHighAccuracy: false };
                $cordovaGeolocation
                    .getCurrentPosition(posOptions)
                    .then(function(position) {
                        var slat = position.coords.latitude;
                        var slong = position.coords.longitude;
                    }, function(err) {
                        alert("Unable to fetch location data !");
                    });
                launchnavigator.navigate([dlat, dlong], [slat, slong]);
            };
            $scope.show_details = function(i) {
                $state.go('details', { order_id: i });
            };

        } else {
            $state.go("login");
        }
    });
});

//Details section Controller

app.controller('DetailsController', function($scope, socket, $ionicHistory, $state, postService, $ionicLoading, $ionicModal) {
    ionic.Platform.ready(function() {
        $scope.session_auth = localStorage.getItem("session_auth");
        if ($scope.session_auth !== "") {
            $scope.myGoBack = function() {
                $ionicHistory.goBack();
            };
            $scope.rejection_reason = [{ "text": "Call not attended", "checked": "false" },
                { "text": "Address closed", "checked": "false" },
                { "text": "Item mismatch", "checked": "false" },
                { "text": "Item bad condition", "checked": "false" },
                { "text": "Others", "checked": "false" }
            ];
            $ionicModal.fromTemplateUrl('templates/modal.html', {
                scope: $scope
            }).then(function(modal) {
                $scope.modal = modal;
            });
            $scope.order_id = $state.params.order_id;
            //console.log($state.params.order_id);
            $ionicLoading.show({ template: '<ion-spinner name="bubbles"></ion-spinner>' });
            postService.postData('single_order', { order_id: $scope.order_id }).then(function(res) {
                    $ionicLoading.hide();
                    $scope.details = res;
                    //console.log($scope.details);
                },
                function(err) {
                    $ionicLoading.hide();
                    alert("Error in fetching data !");
                },
                function(progress) {
                    $ionicLoading.show({ template: '<ion-spinner name="bubbles"></ion-spinner>' });
                });

            $scope.start_process = function() {
                $state.go('process', { order_id: $scope.order_id });
            };
            $scope.pending_order = function() {
                //console.log("Order id is :" + $scope.order_id);
                $scope.modal.show();
            };
            $scope.updateSelection = function(position, itens, title) {
                angular.forEach(itens, function(subscription, index) {
                    if (position != index)
                        subscription.checked = false;
                    $scope.selected = title;
                });
            };
            $scope.createPending = function() {
                $ionicLoading.show();
                angular.forEach($scope.rejection_reason, function(v, k) {
                    if (v.checked === true) {
                        postService.postData('pending', { order_id: $scope.order_id, reason: v.text, user_id: localStorage.getItem("uid") }).then(function(res) {
                            $ionicLoading.hide();
                            if (res == "ok") {
                                alert("Order posted as pending !");
                                socket.emit("notify", "New activity seen");
                                $state.go("delivery");
                            } else {
                                alert(res);
                            }
                        }, function(err) {
                            $ionicLoading.hide();
                            alert("Error encountered !");
                        }, function(progress) {
                            $ionicLoading.show();
                        });
                    }
                });
                $scope.modal.hide();

            };
            $scope.call_action = function() {
                var number = $scope.details.data[0].recipient_mobile;
                window.plugins.CallNumber.callNumber(function() {
                    //console.log("success");
                }, function() {
                    //console.log("error");
                }, number);
            };
        } else {
            $state.go("login");
        }
    });
});

//Process Section Controller

app.controller('ProcessController', function($scope, socket, $ionicHistory, $ionicLoading, $state, $cordovaCamera, $cordovaFileTransfer, $ionicPopup, postService, $window, $cordovaImagePicker) {
    ionic.Platform.ready(function() {
        $scope.session_auth = localStorage.getItem("session_auth");
        if ($scope.session_auth !== "") {
            var user_id = localStorage.getItem("uid");
            $scope.myGoBack = function() {
                $ionicHistory.goBack();
            };
            $scope.receiver = {};
            var photos = [];
            var pic_names = [];
            var id_pic = null;
            var width = window.innerWidth;
            var height = width * (4 / 3);
            var c = document.getElementById("c");
            var canvas = new SignaturePad(c);
            canvas.off();
            $scope.order_id = $state.params.order_id;
            //console.log("Process started for " + $scope.order_id + "!");
            $scope.sigUrl = '';
            $scope.data = { "ImageURI": "Select Image" };
            $scope.takePicture = function() {
                var options = {
                    quality: 50,
                    destinationType: Camera.DestinationType.FILE_URI,
                    sourceType: Camera.PictureSourceType.CAMERA,
                    allowEdit: true,
                    encodingType: Camera.EncodingType.JPEG,
                    saveToPhotoAlbum: true
                };
                $cordovaCamera.getPicture(options).then(function(imageData) {
                    photos.push(imageData);
                }, function(err) {
                    //console.log(err);
                    alert("Error occured with camera");
                });
            };

            $scope.selectPicture = function() {
                photos = [];
                var options = {
                    maximumImagesCount: 10,
                    width: 800,
                    height: 800,
                    quality: 80
                };

                $cordovaImagePicker.getPictures(options)
                    .then(function(results) {
                        for (var i = 0; i < results.length; i++) {
                            photos.push(results[i]);
                        }
                    }, function(error) {
                        alert("Unable to fetch images from gallery !");
                    });
            };
            $scope.uploadPics = function() {
                var server = "http://104.131.94.246/epod/api/camera";
                pic_names = [];
                if (photos.length > 0 || photos.length < 6) {
                    for (var i = 0; i < photos.length; i++) {
                        filePath = photos[i];
                        id_pic = photos[i].substr(photos[i].lastIndexOf('/') + 1);
                        var options = {
                            fileKey: "file",
                            fileName: photos[i].substr(photos[i].lastIndexOf('/') + 1),
                            chunkedMode: false,
                            mimeType: "image/jpg",
                            headers: { 'X-API-KEY': '$2a$06$0PULorCAzSy.7trA0ATd' }
                        };
                        $cordovaFileTransfer.upload(server, filePath, options).then(function(result) {
                            $ionicLoading.hide();
                            if (result.response !== "") {
                                //console.log(result.response);
                                pic_names.push(result.response);
                                $ionicPopup.alert({
                                    title: 'Success',
                                    cssClass: 'button-balanced',
                                    template: 'You have successfully uploaded images'
                                });
                            } else {
                                //console.log("error");
                                $ionicPopup.alert({
                                    title: 'Failed',
                                    cssClass: 'button-assertive',
                                    template: 'File upload failed...'
                                });
                            }
                        }, function(err) {
                            $ionicPopup.alert({
                                title: 'Failed',
                                cssClass: 'button-assertive',
                                template: 'File upload failed...'
                            });
                        }, function(progress) {
                            $ionicLoading.show({ template: 'File uploading to server...' });
                        });
                    }
                    canvas.on();

                } else {
                    alert("Image selection inappropriate.");
                }
            };
            c.width = width;
            c.height = height;
            $scope.saveData = function() {
                if (canvas.isEmpty()) {
                    alert("Please provide signature first.");
                } else {
                    $ionicLoading.show({ template: '<ion-spinner name="bubbles"></ion-spinner>' });
                    var drawing = canvas.toDataURL();
                    canvas.clear();
                    var pic_paths = "";
                    for (var i = 0; i < pic_names.length; i++) {

                        pic_paths += pic_names[i].substr(pic_names[i].lastIndexOf('/') + 1) + "/";
                    }
                    console.log(pic_paths);
                    postService.postData('processing', { order_id: $scope.order_id, user_id: user_id, name: $scope.receiver.name, id_pic: pic_paths, drawing: drawing, notes: $scope.receiver.note }).then(function(res) {
                            $ionicLoading.hide();
                            if (res === "ok") {
                                //console.log("success saving db");
                                socket.emit("notify", "New activity seen");
                                $window.location.reload();
                                $state.go('process_complete');
                            } else {
                                console.log(res);
                            }
                        },
                        function(err) {
                            $ionicLoading.hide();
                            alert("Error in fetching data !");
                        },
                        function(progress) {
                            $ionicLoading.show({ template: '<ion-spinner name="bubbles"></ion-spinner>' });
                        });
                }

            };
        } else {
            $state.go("login");
        }
    });
});

//History Section Controller

app.controller('HistoryController', function($scope, $ionicHistory, postService, $state, $ionicLoading) {
    ionic.Platform.ready(function() {
        $scope.session_auth = localStorage.getItem("session_auth");
        if ($scope.session_auth !== "") {
            $scope.myGoBack = function() {
                $ionicHistory.goBack();
            };
            $ionicLoading.show({ template: '<ion-spinner name="bubbles"></ion-spinner>' });
            postService.postData('history', { user_id: localStorage.getItem("uid") }).then(function(res) {
                $ionicLoading.hide();
                //console.log(res);
                $scope.jobs = res;

            }, function(err) {
                $ionicLoading.hide();
                alert("Error in fetching data !");
            }, function(progress) {
                $ionicLoading.show({ template: '<ion-spinner name="bubbles"></ion-spinner>' });
            });
        } else {
            $state.go("login");
        }
    });
});

//Personal Section Controller

app.controller('PersonalController', function($scope, $ionicHistory, $state, postService, $ionicLoading) {
    ionic.Platform.ready(function() {
        $scope.session_auth = localStorage.getItem("session_auth");
        if ($scope.session_auth !== "") {
            $scope.myGoBack = function() {
                $ionicHistory.goBack();
            };
            $ionicLoading.show({ template: '<ion-spinner name="bubbles"></ion-spinner>' });
            postService.postData('profile', { id: localStorage.getItem("uid") }).then(function(res) {
                    $ionicLoading.hide();
                    //console.log(res.data[0].uname);
                    $scope.profile_detail = res;
                },
                function(err) {
                    $ionicLoading.hide();
                    alert("Error in fetching data !");
                },
                function(progress) {
                    $ionicLoading.show({ template: '<ion-spinner name="bubbles"></ion-spinner>' });
                });
        } else {
            $state.go("login");
        }
    });
});

// Support Section Controller

app.controller('SupportCtrl', function($scope, socket, $ionicHistory, $state, postService, $ionicPopup, $ionicLoading) {
    ionic.Platform.ready(function() {
        $scope.session_auth = localStorage.getItem("session_auth");
        if ($scope.session_auth !== "") {
            $scope.myGoBack = function() {
                $ionicHistory.goBack();
            };
            $scope.support = {};
            $scope.send_support = function() {
                $ionicLoading.show({ template: '<ion-spinner name="bubbles"></ion-spinner>' });
                postService.postData('support_ticket', { user_id: localStorage.getItem("uid"), subject: $scope.support.subject, priority: $scope.support.priority, description: $scope.support.description }).then(function(res) {
                        $ionicLoading.hide();
                        if (res === "ok") {
                            $ionicPopup.alert({
                                title: 'Success',
                                template: 'You have successfully raised the support token.'
                            });
                            socket.emit("notify", "New activity seen");
                        } else {
                            $ionicPopup.alert({
                                title: 'Failed',
                                template: 'Unable to raise the support token.'
                            });
                        }
                    },
                    function(err) {
                        $ionicLoading.hide();
                        alert("Error in fetching data !");
                    },
                    function(progress) {
                        $ionicLoading.show({ template: '<ion-spinner name="bubbles"></ion-spinner>' });
                    });
            };
        } else {
            $state.go("login");
        }
    });
});

//Tickets Section Controller

app.controller('TicketCtrl', function($scope, $ionicHistory, postService, $state, $ionicLoading) {
    ionic.Platform.ready(function() {
        $scope.session_auth = localStorage.getItem("session_auth");
        if ($scope.session_auth !== "") {
            $scope.myGoBack = function() {
                $ionicHistory.goBack();
            };
            $ionicLoading.show({ template: '<ion-spinner name="bubbles"></ion-spinner>' });
            postService.postData('fetch_ticket', { user_id: localStorage.getItem("uid") }).then(function(res) {
                $ionicLoading.hide();
                //console.log(res);
                $scope.jobs = res;

            }, function(err) {
                $ionicLoading.hide();
                alert("Error in fetching data !");
            }, function(progress) {
                $ionicLoading.show({ template: '<ion-spinner name="bubbles"></ion-spinner>' });
            });
            $scope.show_comments = function(i) {
                $state.go("comments", { ticket_id: i });
            };
        } else {
            $state.go("login");
        }
    });
});

//Comments Section Controller

app.controller('SupportController', function($scope, $ionicHistory, $state, postService, $ionicLoading) {
    ionic.Platform.ready(function() {
        if ($scope.session_auth !== "") {
            $scope.myGoBack = function() {
                $ionicHistory.goBack();
            };
        }
        $scope.ticket_id = $state.params.ticket_id;
        $ionicLoading.show({ template: '<ion-spinner name="bubbles"></ion-spinner>' });
        postService.postData('fetch_comment', { ticket_id: $scope.ticket_id }).then(function(res) {
                $ionicLoading.hide();
                $scope.comments = res;
                console.log($scope.comments);
            },
            function(err) {
                $ionicLoading.hide();
                alert("Error in fetching data !");
            },
            function(progress) {
                $ionicLoading.show({ template: '<ion-spinner name="bubbles"></ion-spinner>' });
            });
    });
});
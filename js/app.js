app = angular.module('epod', ['ionic', 'ngCordova', 'ngStorage', 'app.controllers', 'app.services', 'btford.socket-io']);

app.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
        var notificationOpenedCallback = function(jsonData) {
            console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
        };

        window.plugins.OneSignal
            .startInit("d466a49b-d7bc-4c30-b3cc-9e887717c007")
            .handleNotificationOpened(notificationOpenedCallback)
            .endInit();
        //.sendTag("seg", "rumaithy");

    });
});

app.factory('socket', function(socketFactory) {
    var myIoSocket = io.connect('http://');
    mySocket = socketFactory({
        ioSocket: myIoSocket
    });

    return mySocket;
});

app.config(function($ionicConfigProvider) {
    $ionicConfigProvider.scrolling.jsScrolling(false);
});

app.config(function($stateProvider, $urlRouterProvider) {

    $stateProvider
    /*.state('intro', {
        url: '/',
        templateUrl: 'templates/intro.html',
        controller: 'IntroCtrl'
    })*/

        .state('login', {
        url: "/login",
        templateUrl: "templates/login.html",
        controller: "LoginController"
    })

    .state('menus', {
        url: "/menus",
        templateUrl: "templates/menu.html",
        controller: "MenuController"
    })

    .state('all_jobs', {
        url: "/all_jobs",
        templateUrl: "templates/jobs.html",
        controller: "JobsController"
    })

    .state('job_detail', {
        url: "/job_detail",
        params: {
            order_id: null
        },
        templateUrl: "templates/job_detail.html",
        controller: "JobDetailController"
    })

    .state('delivery', {
        url: "/delivery",
        templateUrl: "templates/delivery.html",
        controller: "DeliveryController"
    })

    .state('details', {
        url: "/details",
        params: {
            order_id: null
        },
        templateUrl: "templates/order_detail.html",
        controller: "DetailsController"
    })

    .state('process', {
        url: "/process",
        params: {
            order_id: null
        },
        templateUrl: "templates/process.html",
        controller: "ProcessController"
    })

    .state('process_complete', {
        url: "/process_complete",
        templateUrl: "templates/process_complete.html"
    })

    .state('history', {
        url: "/history",
        templateUrl: "templates/history.html",
        controller: "HistoryController"
    })

    .state('personal', {
        url: "/personal",
        templateUrl: "templates/personal.html",
        controller: "PersonalController"
    })

    .state('support', {
        url: "/support",
        templateUrl: "templates/support.html",
        controller: "SupportController"
    })

    .state('tab', {
        url: '/tab',
        templateUrl: 'templates/supporting.html'
    })

    .state('tab.chats', {
        url: '/chats',
        views: {
            'tab-chats': {
                templateUrl: 'templates/tab-tickets.html',
                controller: 'TicketCtrl'
            }
        }
    })


    .state('tab.account', {
        url: '/account',
        views: {
            'tab-account': {
                templateUrl: 'templates/tab-form.html',
                controller: 'SupportCtrl'
            }
        }
    })

    .state('comments', {
        url: "/comments",
        params: {
            ticket_id: null
        },
        templateUrl: "templates/comments.html",
        controller: "SupportController"
    })

    .state('signout', {
        url: "/signout",
        controller: "LogoutController"
    });

    $urlRouterProvider.otherwise('/login');
});

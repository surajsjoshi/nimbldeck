/**
 * Created by happydoodles on 18/2/16.
 */

var baseUrl = 'https://7ewecdfppd.execute-api.us-east-1.amazonaws.com/v1_0';
var apiKey = 'aYecjavQzV6i679wrL42Tq0FYzKFJTYbi9ko4Yi0';

ga = window.ga;
mixpanel = window.mixpanel;

dataLayer = window.dataLayer = window.dataLayer || [];


function login(email, password, onSuccessCallback, onFailureCallback, fromSignUp) {

    mixpanel.time_event('Login');
    var data = {
        email_id: email,
        password: password,
        identityId: AWS.config.credentials.identityId
    };
    $.post(baseUrl + '/users/authenticate', JSON.stringify(data), function (data) {
        // console.log(data);
        $(self).removeAttr('disabled').text('Login');
        if (data.type === 'Success') {
            var creds = AWS.config.credentials;
            creds.params.Logins = {};
            //Cookies.set('nd_current_user', data.user);
            data.user.credentials = creds;
            window.localStorage.setItem('nd_current_user', JSON.stringify(data.user));
            creds.params.Logins = { 'nimbldeckapp.saswatkumarsethy.com': data.user.token };
            creds.expired = true;
            mixpanel.identify(data.user.userId);
            if (fromSignUp) {
                mixpanel.track('SignUp', { 'user': data.user.emailId });
            }
            mixpanel.track('Login', { 'user': data.user.emailId });
            mixpanel.people.set({
                '$email': data.user.emailId, // only special properties need the $
                '$last_login': new Date() // properties can be dates...
            });
            onSuccessCallback(data.message + '. Redirecting...');
            ga('set', 'userId', data.user.user_id); // Set the user ID using signed-in user_id.
            ga('set', 'page', '/login.html');
            ga('send', 'pageview');
            if (fromSignUp) {
                location.href = "/app/home/new";
            } else {
                location.href = "/app";
            }
        } else {
            mixpanel.track('LoginFailure', { 'user': data['emailId'] });
            onFailureCallback(data);
        }
    }, 'json');

}

function init() {
    data = Cookies.get('nd_current_user');
    user = null;
    if (typeof data !== 'undefined' && data !== null) {
        user = JSON.parse(Cookies.get('nd_current_user'));
    }

    if (typeof user !== 'undefined' && user !== null) {
        //AWS.config.credentials
        ga('set', 'userId', user.user_id); // Set the user ID using signed-in user_id.
        dataLayer.push({ 'UserId': user.user_id })
        mixpanel.identify(user.userId);
        mixpanel.people.set({
            '$email': user.emailId, // only special properties need the $
            '$last_login': new Date() // properties can be dates...
        });
        ga('send', 'pageview');
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'us-east-1:709d954c-b58c-4d42-94a0-d1f7e494d226',
            IdentityId: user.identityId,
            Logins: {
                'cognito-identity.amazonaws.com': user.token
            },
            RoleSessionName: 'web', // optional name, defaults to web-identity,
            LoginId: user.email_id
        });
    } else {
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'us-east-1:709d954c-b58c-4d42-94a0-d1f7e494d226',
            RoleSessionName: 'web' // optional name, defaults to web-identity,
        });
    }

    AWS.config.update({
        region: 'us-east-1',
        credentials: AWS.config.credentials
    });

    mixpanel.track_forms('.register-btn-free', 'Created Account');
    mixpanel.track_forms('.login-button', 'Login');


    AWS.config.credentials.get(function (err) {
        if (!err && typeof user !== 'undefined' && user !== null) {
            if (!user.sessionexpired) {
                location.href = "/app";
            }
        }
    });
}


$(document).ready(function () {
    function getUrlParams() {
        var p = {};
        var match,
            pl = /\+/g, // Regex for replacing addition symbol with a space
            search = /([^&=]+)=?([^&]*)/g,
            decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
            query = window.location.search.substring(1);
        while (match = search.exec(query))
            p[decode(match[1])] = decode(match[2]);
        return p;
    }
    //setup
    $.ajaxSetup({
        headers: { 'X-API-KEY': apiKey }
    });

    $(window).scroll(function () {
        if ($(window).scrollTop() > 280) {
            $('#nav_bar').addClass('navbar-fixed fadeInDown');
        }
        if ($(window).scrollTop() < 281) {
            $('#nav_bar').removeClass('navbar-fixed fadeInDown');
        }
    });

    $('.scroll-to-section').click(function (e) {
        e.preventDefault();
        var hash = $(this).attr('href');
        $('html, body').animate({
            scrollTop: $(hash).offset().top
        }, 1000, function () {
            $(hash).find('input').first().focus();
        });
    });

    $(window).load(function () {
        init();
        if (!Modernizr.mq('(min-width: 768px)')) {
            return;
        }
        $('.section-text').each(function () {
            var heightArr = [];
            $(this).closest('.row').children('div').each(function () {
                heightArr.push($(this).height());
            });
            var height = Math.max.apply(null, heightArr);
            $(this).closest('.row').find('.section-text-parent').height(height);
        });

    });

    $('.forgot-password,.back-to-login').click(function (e) {
        e.preventDefault();
        $('.login-section').slideToggle();
        $('.forgot-password-section').slideToggle();
        setTimeout(function () {
            if ($('.forgot-password-section').is(':visible')) {
                $('.forgot-password-section').addClass('visible');
            } else {
                $('.forgot-password-section').removeClass('visible');
            }
        }, 500);
    });

    //scroll to
    $('.scroll-to-section').click(function (e) {
        e.preventDefault();
        var hash = $(this).attr('href');
        $('html,body').animate({
            scrollTop: $(hash).offset().top
        }, 700);
    });

    $('.sign-up-from-modal').click(function (e) {
        e.preventDefault();
        $('#login-modal').modal('toggle');
        setTimeout(function () {
            $('.scroll-to-section').click();
        }, 500);
    });

    var removeMessage = function (alert) {
        setTimeout(function () {
            alert.slideToggle();

        }, 2000);
    };

    $('#login-modal').on('show.bs.modal', function (e) {
        $('#login-modal').find('input').val('');
        $('.parsley-errors-list li').hide();
        if ($('.forgot-password-section').hasClass('visible')) {
            $('.forgot-password-section').hide();
            $('.forgot-password-section').prev().show();
        }
    });

    $('.modal-icon-vedio').magnificPopup({
        type: 'iframe',
        iframe: {
            patterns: {
                youtube: {
                    index: 'youtube.com',
                    id: function (url) {
                        return url.split("v=")[1].split("&")[0];
                    },
                    src: 'https://www.youtube.com/embed/%id%?rel=0&autoplay=1'
                }
            }
        }
    });


    $('#login-modal input').keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode === 13) {
            $(this).closest('form').find('button[type="button"]').trigger('click');
        }
    });

    //login.js
    $('.login-button').click(function (e) {
        var parsley = $(this).closest('form').parsley();
        e.preventDefault();
        parsley.validate();
        if (!parsley.isValid()) {
            return;
        }
        var self = this;
        $(this).attr('disabled', true).text('Logging in... Please wait...');
        var form = $(this).closest('form');
        form.prev().addClass('hidden').removeClass('alert-danger').removeClass('alert-success');
        login(form.find('[name="email_id"]').val(), form.find('[name="password"]').val(), function (message) {
            //On Success
            form.prev().text(message)
                .addClass('alert-success')
                .removeClass('hidden');
        }, function (errorResponse) {
            //On Failure
            $(self).removeAttr('disabled').text('LOGIN');
            form.prev().text(errorResponse.errors[0].message)
                .addClass('alert-danger')
                .removeClass('hidden');
        }, false);
    });

    //forgot-password
    $('.request-reset-link').click(function (e) {
        var parsley = $(this).closest('form').parsley();
        e.preventDefault();
        parsley.validate();
        if (!parsley.isValid()) {
            return;
        }
        var self = this;
        $(this).attr('disabled', true).text('Sending Reset Link... Please wait...');
        var form = $(this).closest('form');
        form.prev().addClass('hidden').removeClass('alert-danger').removeClass('alert-success');
        var data = {
            email_id: form.find('[name="email_id"]').val()
        };
        $.post(baseUrl + '/users/forgot-password', JSON.stringify(data), function (data) {
            $(self).removeAttr('disabled').text('REQUEST RESET LINK');
            if (data.type === 'Success') {
                form.prev().text(data.message)
                    .addClass('alert-success')
                    .removeClass('hidden');
                ga('set', 'page', '/forgot-password.html');
                ga('send', 'pageview');
            } else {
                form.prev().text(data.message)
                    .addClass('alert-danger')
                    .removeClass('hidden');
            }
            removeMessage(form.prev());
        }, 'json');
    });

    //register.js
    $('.register-btn-free').click(function (e) {
        var parsley = $(this).closest('form').parsley();
        e.preventDefault();
        parsley.validate();
        if (!parsley.isValid()) {
            return;
        }
        var self = this;
        $(this).attr('disabled', true).text('Registering user.. Please wait...');
        var form = $(this).closest('form');
        form.prev().addClass('hidden').removeClass('alert-danger').removeClass('alert-success');
        var register_data = {
            email_id: form.find('#register-email').val(),
            password: form.find('#register-password').val(),
            username: form.find('#register-username').val(),
            source: "website"
        };

        $.post(baseUrl + '/users', JSON.stringify(register_data), function (data) {
            $(self).removeAttr('disabled').text('GET STARTED-FREE');
            if (data.type === 'Success') {
                form.prev().text(data.message)
                    .addClass('alert-success')
                    .removeClass('hidden');
                ga('set', 'page', '/register.html');
                ga('send', 'pageview');
                login(register_data['email_id'], register_data['password'], function (message) {
                    //Onsuccess
                    form.prev().text(message)
                        .addClass('alert-success')
                        .removeClass('hidden');
                }, function (message) {
                    //Onfailure
                    form.prev().text(message)
                        .addClass('alert-danger')
                        .removeClass('hidden');
                }, true);
            } else {
                mixpanel.track('SignupFailure', { 'user': register_data['email_id'] });
                form.prev().text(data.message)
                    .addClass('alert-danger')
                    .removeClass('hidden');
            }
            removeMessage(form.prev());
        }, 'json');
    });

    //reset.js
    $('.reset-button').click(function (e) {
        var parsley = $(this).closest('form').parsley();
        e.preventDefault();
        parsley.validate();
        if (!parsley.isValid()) {
            return;
        }
        var self = this;
        $(this).attr('disabled', true).text('Updating password.. Please wait...');
        var form = $(this).closest('form');
        form.prev().addClass('hidden').removeClass('alert-danger').removeClass('alert-success');
        var urlParams = getUrlParams();
        var info = document.getElementById('info');
        var email = urlParams['email'] || null;
        var token = urlParams['lost'] || null;
        var data = {
            email_id: email,
            password: form.find('[id="password"]').val(),
            verifyPassword: form.find('[id="verifyPassword"]').val(),
            token: token
        };
        if (password.value != verifyPassword.value) {
            info.innerHTML = 'Passwords are <b>not</b> the same, please check.';
            $(self).removeAttr('disabled').text('RESET');
        } else {
            $.post(baseUrl + '/users/reset-password', JSON.stringify(data), function (data) {
                $(self).removeAttr('disabled').text('GET STARTED-FREE');
                if (data.type === 'Success') {
                    form.prev().text(data.message)
                        .addClass('alert-success')
                        .removeClass('hidden');

                    form.find('#register-email').val('');
                    form.find('#register-password').val('');
                    form.find('#register-username').val('');
                } else {
                    form.prev().text(data.message)
                        .addClass('alert-danger')
                        .removeClass('hidden');
                }
                removeMessage(form.prev());
            }, 'json');
        }

    });
});
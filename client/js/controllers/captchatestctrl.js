function CaptchaTestCtrl ($scope, CaptchaModal, Captcha) {
        $scope.state = 'Ждем команды "Начать".'
        $scope.test_url = 'http://yandex.ru/yandsearch?text=погода';
        $scope.captcha = null;
        $scope.cookies = null;

        $scope.test = function () {
            $scope.state = "Посылаем запрос к яндексу"
            Captcha.test($scope.test_url, $scope.captcha, $scope.cookies)
                .then(function (res) {
                    console.log("первый результат", res.data)
                    $scope.cookies = res.data.cookies;

                    if (res.data.captcha) {
                        $scope.captcha = res.data.res;
                        $scope.state = "Получили капчу" + JSON.stringify($scope.captcha);

                        CaptchaModal.show($scope.captcha.img)
                            .then(function (result) {
                                if (result.answer && result.captcha) {
                                    $scope.state = 'Капча введена, посылаем повторно запрос.'

                                    $scope.captcha.rep = result.captcha;
                                    $scope.test();
                                } else {
                                    $scope.state = 'Вы не ввели капчу или нажали "Отмена". Попробуйте еще раз.'
                                }
                            })
                    } else {
                        $scope.captcha = null;
                        $scope.state = "Запрос сервера завершен нормально";
                    }

                })
                .catch(function (err) {
                    $scope.captcha = null;
                    //$scope.cookies = null;
                    console.log("Ошбика получения результата", err)
                    $scope.state = "Какие-то проблемы. Попробуйте еще раз."
                })

        }
    }

angular.module('seoControllers').controller('CaptchaTestCtrl',CaptchaTestCtrl);
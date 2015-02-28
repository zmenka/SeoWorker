function CaptchaTestCtrl ($scope, CaptchaModal, Captcha) {
    var vm = this;
        vm.state = 'Ждем команды "Начать".'
        vm.test_url = 'http://yandex.ru/yandsearch?text=погода';
        vm.captcha = null;
        vm.cookies = null;

        vm.test = function () {
            vm.state = "Посылаем запрос к яндексу"
            Captcha.test(vm.test_url, vm.captcha, vm.cookies)
                .then(function (res) {
                    console.log("первый результат", res.data)
                    vm.cookies = res.data.cookies;

                    if (res.data.captcha) {
                        vm.captcha = res.data.res;
                        vm.state = "Получили капчу" + JSON.stringify(vm.captcha);

                        CaptchaModal.show(vm.captcha.img)
                            .then(function (result) {
                                if (result.answer && result.captcha) {
                                    vm.state = 'Капча введена, посылаем повторно запрос.'

                                    vm.captcha.rep = result.captcha;
                                    vm.test();
                                } else {
                                    vm.state = 'Вы не ввели капчу или нажали "Отмена". Попробуйте еще раз.'
                                }
                            })
                    } else {
                        vm.captcha = null;
                        vm.state = "Запрос сервера завершен нормально";
                    }

                })
                .catch(function (err) {
                    vm.captcha = null;
                    //vm.cookies = null;
                    console.log("Ошбика получения результата", err)
                    vm.state = "Какие-то проблемы. Попробуйте еще раз."
                })

        }
    }

angular.module('seoControllers').controller('CaptchaTestCtrl',CaptchaTestCtrl);
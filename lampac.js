(function () {
    'use strict';

    function _typeof(o) {
        "@babel/helpers - typeof";
        return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
            return typeof o;
        } : function (o) {
            return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
        }, _typeof(o);
    }

    (function () {
        var LAMPAC_DEBUG = true; // Включим отладку, чтобы видеть уведомления на экране
        
        function lampacDebug(tag, payload) {
            try {
                var msg = '[lampac] ' + tag + (payload !== undefined ? ': ' + (typeof payload === 'string' ? payload : JSON.stringify(payload)) : '');
                if (typeof console !== 'undefined' && console.log) console.log(msg);
                if (LAMPAC_DEBUG && window.Lampa && Lampa.Noty && Lampa.Noty.show) {
                    Lampa.Noty.show(msg);
                }
            } catch (e) {}
        }

        function prioritizeBalansers(balansers) {
            var priority = ['filmix', 'zetflix', 'rutubemovie', 'vkmovie'];
            return balansers.sort(function (a, b) {
                var indexA = priority.indexOf(a.api);
                var indexB = priority.indexOf(b.api);
                if (indexA === -1) indexA = 99;
                if (indexB === -1) indexB = 99;
                return indexA - indexB;
            });
        }

        function lampacProbeHost(url, timeout) {
            return new Promise(function (resolve) {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url + '/online.js', true);
                xhr.timeout = timeout || 3000;
                var bytesReceived = 0;
                xhr.onprogress = function (e) {
                    if (e.loaded) {
                        bytesReceived = e.loaded;
                        if (bytesReceived > 40000) {
                            xhr.abort();
                            resolve(true);
                        }
                    }
                };
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    }
                };
                xhr.onerror = function () { resolve(false); };
                xhr.ontimeout = function () { resolve(false); };
                xhr.send();
            });
        }

        // Главная интеграция в Lampa
        function startPlugin() {
            lampacDebug('init', 'Plugin loaded successfully');

            // Подписываемся на события Lampa
            window.Lampa.Listener.follow('online', function (e) {
                // Когда открывается вкладка "Онлайн"
                if (e.type === 'start' && e.object && e.object.items) {
                    lampacDebug('intercept', 'Sorting balancers...');
                    
                    // Вызываем вашу функцию сортировки балансеров
                    e.object.items = prioritizeBalansers(e.object.items);
                }
            });
        }

        // Проверяем, готова ли Lampa к моменту загрузки скрипта
        if (window.Lampa && window.Lampa.Listener) {
            startPlugin();
        } else {
            // Если Lampa еще не загрузилась полностью, ждем её готовности
            window.addEventListener('lampa_ready', startPlugin);
        }
    })();
})();

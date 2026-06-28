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
        // === НАСТРОЙКИ ===
        // По умолчанию плагин использует адрес, откуда сам загружен, либо локальный балансер.
        // Если ваш Lampac работает на другом IP/порту, укажите его ниже вместо '', например: 'http://192.168.1.50:8094'
        var LAMPAC_BASE_URL = ''; 
        var LAMPAC_DEBUG = false;

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
            if (!balansers || !Array.isArray(balansers)) return balansers;
            var priority = ['filmix', 'zetflix', 'rutubemovie', 'vkmovie'];
            return balansers.sort(function (a, b) {
                var indexA = priority.indexOf(a.api || a.source);
                var indexB = priority.indexOf(b.api || b.source);
                if (indexA === -1) indexA = 99;
                if (indexB === -1) indexB = 99;
                return indexA - indexB;
            });
        }

        function startPlugin() {
            lampacDebug('init', 'Lampac Core Plugin Loaded');

            // Перехватываем событие открытия вкладки "Онлайн" в карточке фильма
            window.Lampa.Listener.follow('online', function (e) {
                if (e.type === 'start') {
                    lampacDebug('open', 'Online tab opened for: ' + (e.object ? e.object.title : 'unknown'));
                    
                    // Если Lampa передала список источников, сортируем их по вашему приоритету
                    if (e.object && e.object.items) {
                        e.object.items = prioritizeBalansers(e.object.items);
                    }
                }
                
                if (e.type === 'ready' && e.object && e.object.items) {
                    lampacDebug('ready', 'Balancers loaded and sorted');
                    e.object.items = prioritizeBalansers(e.object.items);
                }
            });

            // Интеграция кастомного парсера Lampac (добавление кнопки, если встроенный онлайн отключен)
            if (window.Lampa.Component && !window.Lampa.Component.get('lampac')) {
                window.Lampa.Component.add('lampac', function (object) {
                    var comp = this;
                    
                    this.create = function () {
                        this.activity.loader(true);
                        
                        // Определяем адрес сервера Lampac
                        var host = LAMPAC_BASE_URL || (window.Utils ? window.Utils.protocol() : 'http:') + '//localhost:8094';
                        var card = object.movie;
                        var url = host + '/?id=' + card.id + '&imdb=' + (card.imdb_id  '') + '&tmdb=' + card.id + '&title=' + encodeURIComponent(card.title  card.name);
                        
                        lampacDebug('request', 'Fetching streams from: ' + url);

                        // Делаем запрос к вашему Lampac за списком видео-файлов/балансеров
                        var xhr = new XMLHttpRequest();
                        xhr.open('GET', url, true);
                        xhr.timeout = 10000;
                        
                        xhr.onload = function () {
                            comp.activity.loader(false);if (xhr.status >= 200 && xhr.status < 300) {
                                try {
                                    var result = JSON.parse(xhr.responseText);
                                    lampacDebug('response', 'Data received successfully');
                                    
                                    // Передаем результаты в интерфейс Lampa для отображения серий/качества
                                    if (result && (result.channels  result.get  result.items)) {
                                        // Сортируем полученные каналы перед выводом на экран
                                        if (result.items) result.items = prioritizeBalansers(result.items);
                                        comp.activity.render(result);
                                    } else {
                                        comp.activity.empty('Lampac: Видео не найдено');
                                    }
                                } catch (err) {
                                    comp.activity.error('Ошибка обработки данных Lampac');
                                }
                            } else {
                                comp.activity.error('Сервер Lampac вернул ошибку: ' + xhr.status);
                            }
                        };
                        
                        xhr.onerror = function () {
                            comp.activity.loader(false);
                            comp.activity.error('Не удалось связаться с сервером Lampac. Проверьте сеть или адрес.');
                        };
                        
                        xhr.send();
                    };
                });
            }
        }

        // Запуск
        if (window.Lampa && window.Lampa.Listener) {
            startPlugin();
        } else {
            window.addEventListener('lampa_ready', startPlugin);
        }
    })();
})();

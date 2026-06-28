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

    // === Диагностические маяки ============================================
    // Чтобы выключить — поменять LAMPAC_DEBUG на false и пересобрать.
    var LAMPAC_DEBUG = false; // true — добавляет ещё и Noty-всплывашки; false — только console.log → in-app консоль Лампы
    function lampacDebug(tag, payload) {
      try {
        var msg = '[lampac] ' + tag + (payload !== undefined ? ': ' + (typeof payload === 'string' ? payload : JSON.stringify(payload)) : '');
        if (typeof console !== 'undefined' && console.log) console.log(msg);
        if (LAMPAC_DEBUG && window.Lampa && Lampa.Noty && Lampa.Noty.show) ;
      } catch (e) {}
    }
    // ======================================================================

    // Резервный список vapi-хостов. Основной источник — живой реестр на нашем бэкенде
    // (lampacFetchHosts): каждый lampac-инстанс раз в секунду регистрирует себя там, и
    // фронт берёт оттуда актуальных. Этот хардкод используется лишь когда реестр пуст
    // или недоступен (старт без сети/бэкенда), чтобы плагин не остался вовсе без хостов.
    // Дальше по любому списку идёт health-проба (lampacProbeHost) и случайный из РАБОЧИХ —
    // из-за ТСПУ-троттлинга зарубежных хостингов с русских сетей: зажатый хост ставит
    // соединение и отдаёт первые ~16 КБ, после чего виснет, формально оставаясь «доступным».
    var LAMPAC_HOSTS = ['138-16-161-175.nip.io', '138-16-160-242.nip.io', '51-38-205-195.nip.io', '135-181-168-135.nip.io', '95-217-136-138.nip.io', '95-217-98-122.nip.io'];
    var Defined = {
      api: 'lampac',
      // localhost выставляется в bootLampac() после health-пробы и фиксируется на сессию
      // (иначе memkey / lifeevents развалятся при смене хоста между запросами).
      localhost: '',
      apn: ''
    };

    // hostkey — ключ сессии, привязанный к выбранному хосту; заполняется в initRch().
    var hostkey;

    // Проба одного хоста: рабочим считаем, только если он успел ОТДАТЬ КРУПНЫЙ ФАЙЛ
    // ЦЕЛИКОМ за отведённое время. online.js (~91 КБ, отдаётся с CORS) заведомо больше
    // троттл-порога (~16 КБ), поэтому зажатый хост проваливает пробу по таймауту/обрыву,
    // а живой — отдаёт всё за доли секунды.
    function lampacProbeHost(host, timeoutMs, cb) {
      var xhr = new XMLHttpRequest();
      var settled = false;
      function finish(ok) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        try {
          if (!ok) xhr.abort();
        } catch (e) {}
        cb(ok);
      }
      var timer = setTimeout(function () {
        finish(false);
      }, timeoutMs);
      try {
        xhr.open('GET', 'https://' + host + '/online.js?_=' + new Date().getTime(), true);
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            var len = xhr.responseText && xhr.responseText.length || 0;
            // > 40 КБ — гарантированно выше троттл-порога, но ниже полного размера online.js,
            // чтобы допустить мелкую разницу версий между хостами.
            finish(xhr.status === 200 && len > 40000);
          }
        };
        xhr.onerror = function () {
          finish(false);
        };
        xhr.send();
      } catch (e) {
        finish(false);
      }
    }

    // Пробуем все хосты параллельно, в cb отдаём случайный из рабочих. Если не прошёл
    // ни один (проба заблокирована/нет сети) — случайный из всех, чтобы плагин не остался
    // без хоста вовсе (лучше попытаться, чем не работать совсем).
    function lampacPickHost(hosts, cb) {
      hosts = hosts && hosts.length ? hosts.slice() : LAMPAC_HOSTS.slice();
      var working = [];
      var pending = hosts.length;
      if (!pending) {
        cb(null);
        return;
      }
      hosts.forEach(function (h) {
        lampacProbeHost(h, 5000, function (ok) {
          if (ok) working.push(h);
          if (--pending === 0) {
            var pool = working.length ? working : hosts;
            var pick = pool[Math.floor(Math.random() * pool.length)];
            lampacDebug('host probe', {
              working: working,
              throttled: hosts.filter(function (x) {
                return working.indexOf(x) === -1;
              }),
              pick: pick,
              fallback: working.length === 0
            });
            cb('https://' + pick + '/');
          }
        });
      });
    }

    // База нашего бэкенда (бренд-API) — тот же origin, откуда грузится online.js
    // (см. lampa-web/src/services/libs.js). Отсюда же берём живой список lampac-хостов.
    function lampacBackendBase() {
      try {
        var site = window.Lampa && Lampa.Manifest && Lampa.Manifest.cub_site || '';
        if (!site) return '';
        var proto = window.Lampa && Lampa.Utils && Lampa.Utils.protocol ? Lampa.Utils.protocol() : 'https://';
        return proto + site;
      } catch (e) {
        return '';
      }
    }

    // Живой список активных lampac-хостов с нашего бэкенда. Хосты регистрируют себя сами
    // (heartbeat раз в секунду), бэкенд отдаёт тех, кто пинговал недавно. На любой
    // сбой/пустой ответ возвращаем null — bootLampac тогда откатывается на LAMPAC_HOSTS.
    function lampacFetchHosts(cb) {
      var base = lampacBackendBase();
      if (!base) {
        cb(null);
        return;
      }
      var xhr = new XMLHttpRequest();
      var settled = false;
      function finish(hosts) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        cb(hosts);
      }
      var timer = setTimeout(function () {
        try {
          xhr.abort();
        } catch (e) {}
        finish(null);
      }, 4000);
      try {
        xhr.open('GET', base + '/api/plugin/lampac/hosts?_=' + new Date().getTime(), true);
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            var hosts = null;
            try {
              if (xhr.status === 200) {
                var j = JSON.parse(xhr.responseText);
                if (j && j.hosts && j.hosts.length) hosts = j.hosts;
              }
            } catch (e) {}
            finish(hosts);
          }
        };
        xhr.onerror = function () {
          finish(null);
        };
        xhr.send();
      } catch (e) {
        finish(null);
      }
    }
    var balansers_with_search;
    var unic_id = Lampa.Storage.get('lampac_unic_id', '');
    if (!unic_id) {
      unic_id = Lampa.Utils.uid(8).toLowerCase();
      Lampa.Storage.set('lampac_unic_id', unic_id);
    }

    // ===== inlined: plugins/invc-rch_nws.js + plugins/rch_nws.js =====
    // Серверная подстановка {localhost} заменена на Defined.localhost (см. выше)
    // и зафиксирована на сессию вместе с выбором vapi-хоста.
    function getAndroidVersion() {
      if (Lampa.Platform.is('android')) {
        try {
          var current = AndroidJS.appVersion().split('-');
          return parseInt(current.pop());
        } catch (e) {
          return 0;
        }
      } else {
        return 0;
      }
    }

    // Инициализация RCH/NWS под выбранный хост. Вызывается из bootLampac()
    // уже после того, как Defined.localhost выставлен на рабочий хост.
    function initRch() {
      hostkey = Defined.localhost.replace('http://', '').replace('https://', '').replace(/\/$/, '');
      if (!window.rch_nws || !window.rch_nws[hostkey]) {
        if (!window.rch_nws) window.rch_nws = {};
        window.rch_nws[hostkey] = {
          type: Lampa.Platform.is('android') ? 'apk' : Lampa.Platform.is('tizen') ? 'cors' : undefined,
          startTypeInvoke: false,
          rchRegistry: false,
          apkVersion: getAndroidVersion()
        };
      }
      window.rch_nws[hostkey].typeInvoke = function rchtypeInvoke(host, call) {
        if (!window.rch_nws[hostkey].startTypeInvoke) {
          window.rch_nws[hostkey].startTypeInvoke = true;
          var check = function check(good) {
            window.rch_nws[hostkey].type = Lampa.Platform.is('android') ? 'apk' : good ? 'cors' : 'web';
            call();
          };
          if (Lampa.Platform.is('android') || Lampa.Platform.is('tizen')) {
            lampacDebug('rch typeInvoke', 'android/tizen → cors (sync)');
            check(true);
          } else {
            lampacDebug('rch typeInvoke', 'web → /cors/check');
            var net = new Lampa.Reguest();
            // CORS-проба строго на хост плагина (vapi) — он всегда на другом origin,
            // чем страница, так что это валидный кросс-доменный тест.
            // Раньше тут была ветка на внешний хост (для self-hosted, когда плагин
            // на том же origin), но проверка через indexOf(location.host) ошибочно
            // срабатывала (vapi1.vi3000.com содержит подстроку vi3000.com) и слала
            // лишний внешний запрос на каждом бренд-домене.
            net.silent(host + '/cors/check', function () {
              lampacDebug('rch /cors/check', 'ok → cors');
              check(true);
            }, function () {
              lampacDebug('rch /cors/check', 'fail → web');
              check(false);
            }, false, {
              dataType: 'text'
            });
          }
        } else call();
      };
      window.rch_nws[hostkey].Registry = function RchRegistry(client, startConnection) {
        window.rch_nws[hostkey].typeInvoke(Defined.localhost.replace(/\/$/, ''), function () {
          client.invoke("RchRegistry", {
            host: location.host,
            rchtype: Lampa.Platform.is('android') ? 'apk' : Lampa.Platform.is('tizen') ? 'cors' : window.rch_nws[hostkey].type || 'web',
            apkVersion: Lampa.Platform.is('android') ? window.rch_nws[hostkey].apkVersion || 0 : 0,
            player: Lampa.Storage.field('player')
          });
          if (window.rch_nws[hostkey].rchRegistry) return;
          window.rch_nws[hostkey].rchRegistry = true;
          var handled = false;
          client.on('RchRegistry', function (clientIp, connectionId, rchtype) {
            if (startConnection && !handled) {
              handled = true;
              startConnection();
            }
          });
          client.on("RchClient", function (rchId, url, data, headers, returnHeaders) {
            var network = new Lampa.Reguest();
            function sendResult(uri, html) {
              $.ajax({
                url: Defined.localhost + 'rch/' + uri + '?id=' + rchId,
                type: 'POST',
                data: html,
                async: true,
                cache: false,
                contentType: false,
                processData: false,
                success: function success(j) {},
                error: function error() {
                  client.invoke("RchResult", rchId, '');
                }
              });
            }
            function result(html) {
              if (Lampa.Arrays.isObject(html) || Lampa.Arrays.isArray(html)) {
                html = JSON.stringify(html);
              }
              if (typeof CompressionStream !== 'undefined' && html && html.length > 1000) {
                var compressionStream = new CompressionStream('gzip');
                var encoder = new TextEncoder();
                var readable = new ReadableStream({
                  start: function start(controller) {
                    controller.enqueue(encoder.encode(html));
                    controller.close();
                  }
                });
                var compressedStream = readable.pipeThrough(compressionStream);
                new Response(compressedStream).arrayBuffer().then(function (compressedBuffer) {
                  var compressedArray = new Uint8Array(compressedBuffer);
                  if (compressedArray.length > html.length) {
                    sendResult('result', html);
                  } else {
                    sendResult('gzresult', compressedArray);
                  }
                })["catch"](function () {
                  sendResult('result', html);
                });
              } else {
                sendResult('result', html);
              }
            }
            if (url == 'eval') {
              console.log('RCH', url, data);
              result(eval(data));
            } else if (url == 'evalrun') {
              console.log('RCH', url, data);
              eval(data);
            } else if (url == 'ping') {
              result('pong');
            } else {
              console.log('RCH', url);
              network["native"](url, result, function (e) {
                console.log('RCH', 'result empty, ' + e.status);
                result('');
              }, data, {
                dataType: 'text',
                timeout: 1000 * 8,
                headers: headers,
                returnHeaders: returnHeaders
              });
            }
          });
          client.on('Connected', function (connectionId) {
            console.log('RCH', 'ConnectionId: ' + connectionId);
            window.rch_nws[hostkey].connectionId = connectionId;
          });
          client.on('Closed', function () {
            console.log('RCH', 'Connection closed');
          });
          client.on('Error', function (err) {
            console.log('RCH', 'error:', err);
          });
        });
      };
      window.rch_nws[hostkey].typeInvoke(Defined.localhost.replace(/\/$/, ''), function () {});
    }
    function rchInvoke(json, call) {
      if (!window.nwsClient) window.nwsClient = {};
      var client = window.nwsClient[hostkey];
      if (client && client.connectionId != null) {
        call();
      } else if (client) {
        console.log('RCH', 'Reconnecting...');
        client.reconnect(function () {
          call();
        });
      } else {
        window.nwsClient[hostkey] = new NativeWsClient(json.nws, {
          autoReconnect: true
        });
        window.nwsClient[hostkey].on('Connected', function (connectionId) {
          window.rch_nws[hostkey].Registry(window.nwsClient[hostkey], function () {
            call();
          });
        });
        window.nwsClient[hostkey].connect();
      }
    }
    function rchRun(json, call) {
      if (typeof NativeWsClient == 'undefined') {
        Lampa.Utils.putScript([Defined.localhost + 'js/nws-client-es5.js?v21042026'], function () {}, false, function () {
          rchInvoke(json, call);
        }, true);
      } else {
        rchInvoke(json, call);
      }
    }
    // ===== end inlined rch =====

    function account(url) {
      url = url + '';
      if (url.indexOf('account_email=') == -1) {
        var email = Lampa.Storage.get('account_email');
        if (email) url = Lampa.Utils.addUrlComponent(url, 'account_email=' + encodeURIComponent(email));
      }
      if (url.indexOf('uid=') == -1) {
        var uid = Lampa.Storage.get('lampac_unic_id', '');
        if (uid) url = Lampa.Utils.addUrlComponent(url, 'uid=' + encodeURIComponent(uid));
      }
      // токен в статической сборке не используется — серверная подстановка {token} отключена

      if (url.indexOf('nws_id=') == -1) {
        var nws_id = Lampa.Storage.get('lampac_nws_id', '');
        if (nws_id) url = Lampa.Utils.addUrlComponent(url, 'nws_id=' + encodeURIComponent(nws_id));
      }
      return url;
    }
    function addHeaders() {
      var aesgcmkey = Lampa.Storage.get('aesgcmkey', '');
      if (aesgcmkey) return {
        'X-Kit-AesGcm': Lampa.Storage.get('aesgcmkey', '')
      };
      return {};
    }
    function formatEpisodeNumber(episodeNumber) {
      return (episodeNumber < 10 ? '0' : '') + episodeNumber;
    }
    var Network = Lampa.Reguest;
    function component(object) {
      var network = new Network();
      var scroll = new Lampa.Scroll({
        mask: true,
        over: true
      });
      var files = new Lampa.Explorer(object);
      var filter = new Lampa.Filter(object);
      var sources = {};
      var last;
      var source;
      var balanser;
      var initialized;
      var balanser_timer;
      var images = [];
      var number_of_requests = 0;
      var number_of_requests_timer;
      var life_wait_times = 0;
      var life_wait_timer;
      var filter_sources = {};
      var filter_translate = {
        season: Lampa.Lang.translate('torrent_serial_season'),
        voice: Lampa.Lang.translate('torrent_parser_voice'),
        source: Lampa.Lang.translate('settings_rest_source')
      };
      var filter_find = {
        season: [],
        voice: []
      };
      if (balansers_with_search == undefined) {
        network.timeout(10000);
        network.silent(account(Defined.localhost + 'lite/withsearch'), function (json) {
          balansers_with_search = json;
        }, function () {
          balansers_with_search = [];
        });
      }
      function balanserName(j) {
        var bals = j.balanser;
        var name = j.name.split(' ')[0];
        return (bals || name).toLowerCase();
      }

      // Custom display order for the source picker. Keys listed here are pinned
      // to the top in this exact order; everything else keeps its original
      // server-side order beneath them.
      var balanser_priority = ['filmix', 'zetflix', 'rutubemovie', 'vkmovie'];

      // Рекомендации по фильму: бэк-аналитика ранжирует источники по реальному
      // качеству просмотра (досматриваемость + длительность) по всем юзерам.
      // Список приходит из приложения через window.lampaSourceReco (см.
      // src/services/analytics.js). Имена там — те же ключи балансеров в нижнем
      // регистре, что и у нас (см. balanserName), так что матчатся напрямую.
      function recommendedBalansers() {
        try {
          if (window.lampaSourceReco && object.movie && object.movie.id != null) {
            var r = window.lampaSourceReco.cached(object.movie.id);
            if (r && r.length) return r.map(function (s) {
              return String(s).toLowerCase();
            });
          }
        } catch (e) {}
        return [];
      }
      function prioritizeBalansers(keys) {
        if (!keys || !keys.length) return keys;
        var pinned = [];
        var seen = {};
        function pin(p) {
          if (p && keys.indexOf(p) !== -1 && !seen[p]) {
            pinned.push(p);
            seen[p] = true;
          }
        }
        // 1) Рекомендованные для этого фильма (в порядке убывания качества).
        var reco = recommendedBalansers();
        for (var r = 0; r < reco.length; r++) pin(reco[r]);
        // 2) Статичный fallback-приоритет.
        for (var i = 0; i < balanser_priority.length; i++) pin(balanser_priority[i]);
        // 3) Остальные — в исходном серверном порядке.
        var rest = keys.filter(function (k) {
          return !seen[k];
        });
        return pinned.concat(rest);
      }

      // Статистика рекомендаций по источникам этого фильма (карта ключ→данные).
      function recoStats() {
        try {
          if (window.lampaSourceReco && window.lampaSourceReco.stats && object.movie && object.movie.id != null) {
            return window.lampaSourceReco.stats(object.movie.id) || {};
          }
        } catch (e) {}
        return {};
      }

      // Подпись источника в списке: к названию добавляем рейтинг (0..100 по данным
      // за неделю) и сколько людей его смотрели (×100 для отображения). Если
      // данных нет — просто название.
      function sourceTitle(key, baseName) {
        var st = recoStats()[String(key).toLowerCase()];
        if (!st) return baseName;
        var rating = Math.round((st.score || 0) * 100); // 0..100
        var viewers = (st.viewers != null ? st.viewers : st.plays || 0) * 100;
        return baseName + '  ★ ' + rating + ' · ' + viewers + ' чел.';
      }
      function clarificationSearchAdd(value) {
        var id = Lampa.Utils.hash(object.movie.number_of_seasons ? object.movie.original_name : object.movie.original_title);
        var all = Lampa.Storage.get('clarification_search', '{}');
        all[id] = value;
        Lampa.Storage.set('clarification_search', all);
      }
      function clarificationSearchDelete() {
        var id = Lampa.Utils.hash(object.movie.number_of_seasons ? object.movie.original_name : object.movie.original_title);
        var all = Lampa.Storage.get('clarification_search', '{}');
        delete all[id];
        Lampa.Storage.set('clarification_search', all);
      }
      this.initialize = function () {
        var _this = this;
        lampacDebug('initialize start', {
          movie: object.movie && (object.movie.original_title || object.movie.original_name),
          balanser: object.balanser || '(auto)'
        });
        // Заранее тянем рекомендации источников для этого фильма, чтобы к моменту
        // сборки списка балансеров (prioritizeBalansers) они были в кэше.
        try {
          if (window.lampaSourceReco && object.movie && object.movie.id != null) {
            window.lampaSourceReco.prefetch(object.movie.id);
          }
        } catch (e) {}
        this.loading(true);
        filter.onSearch = function (value) {
          clarificationSearchAdd(value);
          Lampa.Activity.replace({
            search: value,
            clarification: true,
            similar: true
          });
        };
        filter.onBack = function () {
          _this.start();
        };
        filter.render().find('.selector').on('hover:enter', function () {
          clearInterval(balanser_timer);
        });
        filter.render().find('.filter--search').appendTo(filter.render().find('.torrent-filter'));
        filter.onSelect = function (type, a, b) {
          if (type == 'filter') {
            if (a.reset) {
              clarificationSearchDelete();
              _this.replaceChoice({
                season: 0,
                voice: 0,
                voice_url: '',
                voice_name: ''
              });
              setTimeout(function () {
                Lampa.Select.close();
                Lampa.Activity.replace({
                  clarification: 0,
                  similar: 0
                });
              }, 10);
            } else {
              var url = filter_find[a.stype][b.index].url;
              var choice = _this.getChoice();
              if (a.stype == 'voice') {
                choice.voice_name = filter_find.voice[b.index].title;
                choice.voice_url = url;
              }
              choice[a.stype] = b.index;
              _this.saveChoice(choice);
              _this.reset();
              _this.request(url);
              setTimeout(Lampa.Select.close, 10);
            }
          } else if (type == 'sort') {
            Lampa.Select.close();
            object.lampac_custom_select = a.source;
            _this.changeBalanser(a.source);
          }
        };
        if (filter.addButtonBack) filter.addButtonBack();
        filter.render().find('.filter--sort span').text(Lampa.Lang.translate('lampac_balanser'));
        scroll.body().addClass('torrent-list');
        files.appendFiles(scroll.render());
        files.appendHead(filter.render());
        if (!files.render().find('.lampac-balanser-hint').length) files.render().find('.torrent-filter').after('<div class="lampac-balanser-hint">' + Lampa.Lang.translate('lampac_balanser_hint') + '</div>');
        scroll.minus(files.render().find('.explorer__files-head'));
        scroll.body().append(Lampa.Template.get('lampac_content_loading'));
        Lampa.Controller.enable('content');
        this.loading(false);
        if (object.balanser) {
          files.render().find('.filter--search').remove();
          sources = {};
          sources[object.balanser] = {
            name: object.balanser
          };
          balanser = object.balanser;
          filter_sources = [];
          return network["native"](account(object.url.replace('rjson=', 'nojson=')), this.parse.bind(this), function () {
            files.render().find('.torrent-filter').remove();
            _this.empty();
          }, false, {
            dataType: 'text',
            headers: addHeaders()
          });
        }
        this.externalids().then(function () {
          lampacDebug('externalids done');
          return _this.createSource();
        }).then(function (json) {
          lampacDebug('createSource done', {
            balanser: balanser,
            sources: filter_sources
          });
          if (!balansers_with_search || !balansers_with_search.find) {
            lampacDebug('withsearch missing', _typeof(balansers_with_search));
            balansers_with_search = [];
          }
          if (!balansers_with_search.find(function (b) {
            return balanser.slice(0, b.length) == b;
          })) {
            filter.render().find('.filter--search').addClass('hide');
          }
          _this.search();
        })["catch"](function (e) {
          lampacDebug('initialize catch', e && (e.message || e.msg) || String(e));
          _this.noConnectToServer(e);
        });
      };
      this.rch = function (json, noreset) {
        var _this2 = this;
        rchRun(json, function () {
          if (!noreset) _this2.find();else noreset();
        });
      };
      this.externalids = function () {
        return new Promise(function (resolve, reject) {
          if (!object.movie.imdb_id || !object.movie.kinopoisk_id) {
            var query = [];
            query.push('id=' + encodeURIComponent(object.movie.id));
            query.push('serial=' + (object.movie.name ? 1 : 0));
            if (object.movie.imdb_id) query.push('imdb_id=' + (object.movie.imdb_id || ''));
            if (object.movie.kinopoisk_id) query.push('kinopoisk_id=' + (object.movie.kinopoisk_id || ''));
            var url = Defined.localhost + 'externalids?' + query.join('&');
            network.timeout(10000);
            network.silent(account(url), function (json) {
              for (var name in json) {
                object.movie[name] = json[name];
              }
              resolve();
            }, function () {
              resolve();
            }, false, {
              headers: addHeaders()
            });
          } else resolve();
        });
      };
      this.updateBalanser = function (balanser_name) {
        var last_select_balanser = Lampa.Storage.cache('online_last_balanser', 3000, {});
        last_select_balanser[object.movie.id] = balanser_name;
        Lampa.Storage.set('online_last_balanser', last_select_balanser);
      };
      this.changeBalanser = function (balanser_name) {
        this.updateBalanser(balanser_name);
        Lampa.Storage.set('online_balanser', balanser_name);
        var to = this.getChoice(balanser_name);
        var from = this.getChoice();
        if (from.voice_name) to.voice_name = from.voice_name;
        this.saveChoice(to, balanser_name);
        Lampa.Activity.replace();
      };
      this.requestParams = function (url) {
        var query = [];
        var card_source = object.movie.source || 'tmdb'; //Lampa.Storage.field('source')
        query.push('id=' + encodeURIComponent(object.movie.id));
        if (object.movie.imdb_id) query.push('imdb_id=' + (object.movie.imdb_id || ''));
        if (object.movie.kinopoisk_id) query.push('kinopoisk_id=' + (object.movie.kinopoisk_id || ''));
        if (object.movie.tmdb_id) query.push('tmdb_id=' + (object.movie.tmdb_id || ''));
        query.push('title=' + encodeURIComponent(object.clarification ? object.search : object.movie.title || object.movie.name));
        query.push('original_title=' + encodeURIComponent(object.movie.original_title || object.movie.original_name));
        query.push('serial=' + (object.movie.name ? 1 : 0));
        query.push('original_language=' + (object.movie.original_language || ''));
        query.push('year=' + ((object.movie.release_date || object.movie.first_air_date || '0000') + '').slice(0, 4));
        query.push('source=' + card_source);
        query.push('clarification=' + (object.clarification ? 1 : 0));
        query.push('similar=' + (object.similar ? true : false));
        query.push('rchtype=' + ((window.rch_nws && window.rch_nws[hostkey] ? window.rch_nws[hostkey].type : window.rch && window.rch[hostkey] ? window.rch[hostkey].type : '') || ''));
        if (Lampa.Storage.get('account_email', '')) query.push('cub_id=' + Lampa.Utils.hash(Lampa.Storage.get('account_email', '')));
        return url + (url.indexOf('?') >= 0 ? '&' : '?') + query.join('&');
      };
      this.getLastChoiceBalanser = function () {
        var last_select_balanser = Lampa.Storage.cache('online_last_balanser', 3000, {});
        if (last_select_balanser[object.movie.id]) {
          return last_select_balanser[object.movie.id];
        } else {
          return Lampa.Storage.get('online_balanser', filter_sources.length ? filter_sources[0] : '');
        }
      };
      this.startSource = function (json) {
        return new Promise(function (resolve, reject) {
          json.forEach(function (j) {
            var name = balanserName(j);
            sources[name] = {
              url: j.url,
              name: j.name,
              show: typeof j.show == 'undefined' ? true : j.show
            };
          });
          filter_sources = prioritizeBalansers(Lampa.Arrays.getKeys(sources));
          if (filter_sources.length) {
            if (object.lampac_custom_select && sources[object.lampac_custom_select]) {
              balanser = object.lampac_custom_select;
            } else {
              balanser = filter_sources[0];
            }
            if (!sources[balanser]) balanser = filter_sources[0];
            if (!sources[balanser].show && !object.lampac_custom_select) balanser = filter_sources[0];
            source = sources[balanser].url;
            Lampa.Storage.set('active_balanser', balanser);
            resolve(json);
          } else {
            reject();
          }
        });
      };
      this.lifeSource = function () {
        var _this3 = this;
        return new Promise(function (resolve, reject) {
          var url = _this3.requestParams(Defined.localhost + 'lifeevents?memkey=' + (_this3.memkey || ''));
          var red = false;
          var gou = function gou(json, any) {
            if (json.accsdb) return reject(json);
            var last_balanser = _this3.getLastChoiceBalanser();
            if (!red) {
              var _filter = json.online.filter(function (c) {
                return any ? c.show : c.show && c.name.toLowerCase() == last_balanser;
              });
              if (_filter.length) {
                red = true;
                resolve(json.online.filter(function (c) {
                  return c.show;
                }));
              } else if (any) {
                reject();
              }
            }
          };
          var fin = function fin(call) {
            network.timeout(3000);
            network.silent(account(url), function (json) {
              life_wait_times++;
              filter_sources = [];
              sources = {};
              json.online.forEach(function (j) {
                var name = balanserName(j);
                sources[name] = {
                  url: j.url,
                  name: j.name,
                  show: typeof j.show == 'undefined' ? true : j.show
                };
              });
              filter_sources = prioritizeBalansers(Lampa.Arrays.getKeys(sources));
              filter.set('sort', filter_sources.map(function (e) {
                return {
                  title: sourceTitle(e, sources[e].name),
                  source: e,
                  selected: e == balanser,
                  ghost: !sources[e].show
                };
              }));
              filter.chosen('sort', [sources[balanser] ? sources[balanser].name : balanser]);
              gou(json);
              var lastb = _this3.getLastChoiceBalanser();
              if (life_wait_times > 15 || json.ready) {
                filter.render().find('.lampac-balanser-loader').remove();
                gou(json, true);
              } else if (!red && sources[lastb] && sources[lastb].show) {
                gou(json, true);
                life_wait_timer = setTimeout(fin, 1000);
              } else {
                life_wait_timer = setTimeout(fin, 1000);
              }
            }, function () {
              life_wait_times++;
              if (life_wait_times > 15) {
                reject();
              } else {
                life_wait_timer = setTimeout(fin, 1000);
              }
            }, false, {
              headers: addHeaders()
            });
          };
          fin();
        });
      };
      this.createSource = function () {
        var _this4 = this;
        return new Promise(function (resolve, reject) {
          // life=true: бэкенд отвечает сразу с memkey, а сбор источников идёт в фоне.
          // Дальше фронт опрашивает /lifeevents через lifeSource(), и пользователь
          // не зависит от того, как долго отрабатывает «синхронная» агрегация.
          var url = _this4.requestParams(Defined.localhost + 'lite/events') + '&life=true';
          network.timeout(60000);
          network.silent(account(url), function (json) {
            if (json.accsdb) return reject(json);
            if (json.life) {
              _this4.memkey = json.memkey;
              if (json.title) {
                if (object.movie.name) object.movie.name = json.title;
                if (object.movie.title) object.movie.title = json.title;
              }
              filter.render().find('.filter--sort').append('<span class="lampac-balanser-loader" style="width: 1.2em; height: 1.2em; margin-top: 0; background: url(./img/loader.svg) no-repeat 50% 50%; background-size: contain; margin-left: 0.5em"></span>');
              _this4.lifeSource().then(_this4.startSource).then(resolve)["catch"](reject);
            } else {
              _this4.startSource(json).then(resolve)["catch"](reject);
            }
          }, reject, false, {
            headers: addHeaders()
          });
        });
      };
      /**
       * Подготовка
       */
      this.create = function () {
        return this.render();
      };
      /**
       * Начать поиск
       */
      this.search = function () {
        //this.loading(true)
        this.filter({
          source: filter_sources
        }, this.getChoice());
        this.find();
      };
      this.find = function () {
        this.request(this.requestParams(source));
      };
      this.request = function (url) {
        number_of_requests++;
        if (number_of_requests < 10) {
          network["native"](account(url), this.parse.bind(this), this.doesNotAnswer.bind(this), false, {
            dataType: 'text',
            headers: addHeaders()
          });
          clearTimeout(number_of_requests_timer);
          number_of_requests_timer = setTimeout(function () {
            number_of_requests = 0;
          }, 4000);
        } else this.empty();
      };
      this.parseJsonDate = function (str, name) {
        try {
          var html = $('<div>' + str + '</div>');
          var elems = [];
          html.find(name).each(function () {
            var item = $(this);
            var data = JSON.parse(item.attr('data-json'));
            var season = item.attr('s');
            var episode = item.attr('e');
            var text = item.text();
            if (!object.movie.name) {
              if (text.match(/\d+p/i)) {
                if (!data.quality) {
                  data.quality = {};
                  data.quality[text] = data.url;
                }
                text = object.movie.title;
              }
              if (text == 'По умолчанию') {
                text = object.movie.title;
              }
            }
            if (episode) data.episode = parseInt(episode);
            if (season) data.season = parseInt(season);
            if (text) data.text = text;
            data.active = item.hasClass('active');
            elems.push(data);
          });
          return elems;
        } catch (e) {
          return [];
        }
      };
      this.getFileUrl = function (file, call, waiting_rch) {
        var _this = this;
        if (Lampa.Storage.field('player') !== 'inner' && file.stream && Lampa.Platform.is('apple')) {
          var newfile = Lampa.Arrays.clone(file);
          newfile.method = 'play';
          newfile.url = file.stream;
          call(newfile, {});
        } else if (file.method == 'play') call(file, {});else {
          Lampa.Loading.start(function () {
            Lampa.Loading.stop();
            Lampa.Controller.toggle('content');
            network.clear();
          });
          network["native"](account(file.url), function (json) {
            if (json.rch) {
              if (waiting_rch) {
                waiting_rch = false;
                Lampa.Loading.stop();
                call(false, {});
              } else {
                _this.rch(json, function () {
                  Lampa.Loading.stop();
                  _this.getFileUrl(file, call, true);
                });
              }
            } else {
              Lampa.Loading.stop();
              call(json, json);
            }
          }, function () {
            Lampa.Loading.stop();
            call(false, {});
          }, false, {
            headers: addHeaders()
          });
        }
      };
      this.toPlayElement = function (file) {
        var play = {
          title: file.title,
          url: file.url,
          quality: file.qualitys,
          timeline: file.timeline,
          subtitles: file.subtitles,
          segments: file.segments,
          callback: file.mark,
          season: file.season,
          episode: file.episode,
          voice_name: file.voice_name,
          thumbnail: file.thumbnail
        };
        return play;
      };
      this.orUrlReserve = function (data) {
        if (data.url && typeof data.url == 'string' && data.url.indexOf(" or ") !== -1) {
          var urls = data.url.split(" or ");
          data.url = urls[0];
          data.url_reserve = urls[1];
        }
      };
      this.setDefaultQuality = function (data) {
        if (Lampa.Arrays.getKeys(data.quality).length) {
          for (var q in data.quality) {
            if (parseInt(q) == Lampa.Storage.field('video_quality_default')) {
              data.url = data.quality[q];
              this.orUrlReserve(data);
            }
            if (data.quality[q].indexOf(" or ") !== -1) data.quality[q] = data.quality[q].split(" or ")[0];
          }
        }
      };
      this.display = function (videos) {
        var _this5 = this;
        this.draw(videos, {
          onEnter: function onEnter(item, html) {
            _this5.getFileUrl(item, function (json, json_call) {
              if (json && json.url) {
                var playlist = [];
                var first = _this5.toPlayElement(item);
                first.url = json.url;
                first.headers = json_call.headers || json.headers;
                first.quality = json_call.quality || item.qualitys;
                first.segments = json_call.segments || item.segments;
                first.hls_manifest_timeout = json_call.hls_manifest_timeout || json.hls_manifest_timeout;
                first.subtitles = json.subtitles;
                first.subtitles_call = json_call.subtitles_call || json.subtitles_call;
                if (json.vast && json.vast.url) {
                  first.vast_url = json.vast.url;
                  first.vast_msg = json.vast.msg;
                  first.vast_region = json.vast.region;
                  first.vast_platform = json.vast.platform;
                  first.vast_screen = json.vast.screen;
                }
                _this5.orUrlReserve(first);
                _this5.setDefaultQuality(first);
                if (item.season) {
                  videos.forEach(function (elem) {
                    var cell = _this5.toPlayElement(elem);
                    if (elem == item) cell.url = json.url;else {
                      if (elem.method == 'call') {
                        if (Lampa.Storage.field('player') !== 'inner') {
                          cell.url = elem.stream;
                          delete cell.quality;
                        } else {
                          cell.url = function (call) {
                            _this5.getFileUrl(elem, function (stream, stream_json) {
                              if (stream.url) {
                                cell.url = stream.url;
                                cell.quality = stream_json.quality || elem.qualitys;
                                cell.segments = stream_json.segments || elem.segments;
                                cell.subtitles = stream.subtitles;
                                _this5.orUrlReserve(cell);
                                _this5.setDefaultQuality(cell);
                                elem.mark();
                              } else {
                                cell.url = '';
                                Lampa.Noty.show(Lampa.Lang.translate('lampac_nolink'));
                              }
                              call();
                            }, function () {
                              cell.url = '';
                              call();
                            });
                          };
                        }
                      } else {
                        cell.url = elem.url;
                      }
                    }
                    _this5.orUrlReserve(cell);
                    _this5.setDefaultQuality(cell);
                    playlist.push(cell);
                  }); //Lampa.Player.playlist(playlist) 
                } else {
                  playlist.push(first);
                }
                if (playlist.length > 1) first.playlist = playlist;
                if (first.url) {
                  var element = first;
                  element.isonline = true;
                  // {player-inner} — серверный inject отключён в статической сборке
                  Lampa.Player.play(element);
                  Lampa.Player.playlist(playlist);
                  if (element.subtitles_call) _this5.loadSubtitles(element.subtitles_call);
                  item.mark();
                  _this5.updateBalanser(balanser);
                } else {
                  Lampa.Noty.show(Lampa.Lang.translate('lampac_nolink'));
                }
              } else Lampa.Noty.show(Lampa.Lang.translate('lampac_nolink'));
            }, true);
          },
          onContextMenu: function onContextMenu(item, html, data, call) {
            _this5.getFileUrl(item, function (stream) {
              call({
                file: stream.url,
                quality: item.qualitys
              });
            }, true);
          }
        });
        this.filter({
          season: filter_find.season.map(function (s) {
            return s.title;
          }),
          voice: filter_find.voice.map(function (b) {
            return b.title;
          })
        }, this.getChoice());
      };
      this.loadSubtitles = function (link) {
        network.silent(account(link), function (subs) {
          Lampa.Player.subtitles(subs);
        }, function () {}, false, {
          headers: addHeaders()
        });
      };
      this.parse = function (str) {
        var json = Lampa.Arrays.decodeJson(str, {});
        if (Lampa.Arrays.isObject(str) && str.rch) json = str;
        if (json.rch) return this.rch(json);
        try {
          var items = this.parseJsonDate(str, '.videos__item');
          var buttons = this.parseJsonDate(str, '.videos__button');
          if (items.length == 1 && items[0].method == 'link' && !items[0].similar) {
            filter_find.season = items.map(function (s) {
              return {
                title: s.text,
                url: s.url
              };
            });
            this.replaceChoice({
              season: 0
            });
            this.request(items[0].url);
          } else {
            this.activity.loader(false);
            var videos = items.filter(function (v) {
              return v.method == 'play' || v.method == 'call';
            });
            var similar = items.filter(function (v) {
              return v.similar;
            });
            if (videos.length) {
              if (buttons.length) {
                filter_find.voice = buttons.map(function (b) {
                  return {
                    title: b.text,
                    url: b.url
                  };
                });
                var select_voice_url = this.getChoice(balanser).voice_url;
                var select_voice_name = this.getChoice(balanser).voice_name;
                var find_voice_url = buttons.find(function (v) {
                  return v.url == select_voice_url;
                });
                var find_voice_name = buttons.find(function (v) {
                  return v.text == select_voice_name;
                });
                var find_voice_active = buttons.find(function (v) {
                  return v.active;
                }); ////console.log('b',buttons)
                ////console.log('u',find_voice_url)
                ////console.log('n',find_voice_name)
                ////console.log('a',find_voice_active)
                if (find_voice_url && !find_voice_url.active) {
                  //console.log('Lampac', 'go to voice', find_voice_url);
                  this.replaceChoice({
                    voice: buttons.indexOf(find_voice_url),
                    voice_name: find_voice_url.text
                  });
                  this.request(find_voice_url.url);
                } else if (find_voice_name && !find_voice_name.active) {
                  //console.log('Lampac', 'go to voice', find_voice_name);
                  this.replaceChoice({
                    voice: buttons.indexOf(find_voice_name),
                    voice_name: find_voice_name.text
                  });
                  this.request(find_voice_name.url);
                } else {
                  if (find_voice_active) {
                    this.replaceChoice({
                      voice: buttons.indexOf(find_voice_active),
                      voice_name: find_voice_active.text
                    });
                  }
                  this.display(videos);
                }
              } else {
                this.replaceChoice({
                  voice: 0,
                  voice_url: '',
                  voice_name: ''
                });
                this.display(videos);
              }
            } else if (items.length) {
              if (similar.length) {
                this.similars(similar);
                this.activity.loader(false);
              } else {
                //this.activity.loader(true)
                filter_find.season = items.map(function (s) {
                  return {
                    title: s.text,
                    url: s.url
                  };
                });
                var select_season = this.getChoice(balanser).season;
                var season = filter_find.season[select_season];
                if (!season) season = filter_find.season[0];
                //console.log('Lampac', 'go to season', season);
                this.request(season.url);
              }
            } else {
              this.doesNotAnswer(json);
            }
          }
        } catch (e) {
          //console.log('Lampac', 'error', e.stack);
          this.doesNotAnswer(e);
        }
      };
      this.similars = function (json) {
        var _this6 = this;
        scroll.clear();
        json.forEach(function (elem) {
          elem.title = elem.text;
          elem.info = '';
          var info = [];
          var year = ((elem.start_date || elem.year || object.movie.release_date || object.movie.first_air_date || '') + '').slice(0, 4);
          if (year) info.push(year);
          if (elem.details) info.push(elem.details);
          var name = elem.title || elem.text;
          elem.title = name;
          elem.time = elem.time || '';
          elem.info = info.join('<span class="online-prestige-split">•</span>');
          var item = Lampa.Template.get('lampac_prestige_folder', elem);
          if (elem.img) {
            var image = $('<img style="height: 7em; width: 7em; border-radius: 0.3em;"/>');
            item.find('.online-prestige__folder').empty().append(image);
            if (elem.img !== undefined) {
              if (elem.img.charAt(0) === '/') elem.img = Defined.localhost + elem.img.substring(1);
              if (elem.img.indexOf('/proxyimg') !== -1) elem.img = account(elem.img);
            }
            Lampa.Utils.imgLoad(image, elem.img);
          }
          item.on('hover:enter', function () {
            _this6.reset();
            _this6.request(elem.url);
          }).on('hover:focus', function (e) {
            last = e.target;
            scroll.update($(e.target), true);
          });
          scroll.append(item);
        });
        this.filter({
          season: filter_find.season.map(function (s) {
            return s.title;
          }),
          voice: filter_find.voice.map(function (b) {
            return b.title;
          })
        }, this.getChoice());
        Lampa.Controller.enable('content');
      };
      this.getChoice = function (for_balanser) {
        var data = Lampa.Storage.cache('online_choice_' + (for_balanser || balanser), 3000, {});
        var save = data[object.movie.id] || {};
        Lampa.Arrays.extend(save, {
          season: 0,
          voice: 0,
          voice_name: '',
          voice_id: 0,
          episodes_view: {},
          movie_view: ''
        });
        return save;
      };
      this.saveChoice = function (choice, for_balanser) {
        var data = Lampa.Storage.cache('online_choice_' + (for_balanser || balanser), 3000, {});
        data[object.movie.id] = choice;
        Lampa.Storage.set('online_choice_' + (for_balanser || balanser), data);
        this.updateBalanser(for_balanser || balanser);
      };
      this.replaceChoice = function (choice, for_balanser) {
        var to = this.getChoice(for_balanser);
        Lampa.Arrays.extend(to, choice, true);
        this.saveChoice(to, for_balanser);
      };
      this.clearImages = function () {
        images.forEach(function (img) {
          img.onerror = function () {};
          img.onload = function () {};
          img.src = '';
        });
        images = [];
      };
      /**
       * Очистить список файлов
       */
      this.reset = function () {
        last = false;
        clearInterval(balanser_timer);
        network.clear();
        this.clearImages();
        scroll.render().find('.empty').remove();
        scroll.clear();
        scroll.reset();
        scroll.body().append(Lampa.Template.get('lampac_content_loading'));
      };
      /**
       * Загрузка
       */
      this.loading = function (status) {
        if (status) this.activity.loader(true);else {
          this.activity.loader(false);
          this.activity.toggle();
        }
      };
      /**
       * Построить фильтр
       */
      this.filter = function (filter_items, choice) {
        var _this7 = this;
        var select = [];
        var add = function add(type, title) {
          var need = _this7.getChoice();
          var items = filter_items[type];
          var subitems = [];
          var value = need[type];
          items.forEach(function (name, i) {
            subitems.push({
              title: name,
              selected: value == i,
              index: i
            });
          });
          select.push({
            title: title,
            subtitle: items[value],
            items: subitems,
            stype: type
          });
        };
        filter_items.source = filter_sources;
        select.push({
          title: Lampa.Lang.translate('torrent_parser_reset'),
          reset: true
        });
        this.saveChoice(choice);
        if (filter_items.voice && filter_items.voice.length) add('voice', Lampa.Lang.translate('torrent_parser_voice'));
        if (filter_items.season && filter_items.season.length) add('season', Lampa.Lang.translate('torrent_serial_season'));
        filter.set('filter', select);
        filter.set('sort', filter_sources.map(function (e) {
          return {
            title: sourceTitle(e, sources[e].name),
            source: e,
            selected: e == balanser,
            ghost: !sources[e].show
          };
        }));
        this.selected(filter_items);
      };
      /**
       * Показать что выбрано в фильтре
       */
      this.selected = function (filter_items) {
        var need = this.getChoice(),
          select = [];
        for (var i in need) {
          if (filter_items[i] && filter_items[i].length) {
            if (i == 'voice') {
              select.push(filter_translate[i] + ': ' + filter_items[i][need[i]]);
            } else if (i !== 'source') {
              if (filter_items.season.length >= 1) {
                select.push(filter_translate.season + ': ' + filter_items[i][need[i]]);
              }
            }
          }
        }
        filter.chosen('filter', select);
        filter.chosen('sort', [sources[balanser].name]);
      };
      this.getEpisodes = function (season, call) {
        var episodes = [];
        var tmdb_id = object.movie.id;
        if (['cub', 'tmdb'].indexOf(object.movie.source || 'tmdb') == -1) tmdb_id = object.movie.tmdb_id;
        if (typeof tmdb_id == 'number' && object.movie.name) {
          Lampa.Api.sources.tmdb.get('tv/' + tmdb_id + '/season/' + season, {}, function (data) {
            episodes = data.episodes || [];
            call(episodes);
          }, function () {
            call(episodes);
          });
        } else call(episodes);
      };
      this.watched = function (set) {
        var file_id = Lampa.Utils.hash(object.movie.number_of_seasons ? object.movie.original_name : object.movie.original_title);
        var watched = Lampa.Storage.cache('online_watched_last', 5000, {});
        if (set) {
          if (!watched[file_id]) watched[file_id] = {};
          Lampa.Arrays.extend(watched[file_id], set, true);
          Lampa.Storage.set('online_watched_last', watched);
          this.updateWatched();
        } else {
          return watched[file_id];
        }
      };
      this.updateWatched = function () {
        var watched = this.watched();
        var body = scroll.body().find('.online-prestige-watched .online-prestige-watched__body').empty();
        if (watched) {
          var line = [];
          if (watched.balanser_name) line.push(watched.balanser_name);
          if (watched.voice_name) line.push(watched.voice_name);
          if (watched.season) line.push(Lampa.Lang.translate('torrent_serial_season') + ' ' + watched.season);
          if (watched.episode) line.push(Lampa.Lang.translate('torrent_serial_episode') + ' ' + watched.episode);
          line.forEach(function (n) {
            body.append('<span>' + n + '</span>');
          });
        } else body.append('<span>' + Lampa.Lang.translate('lampac_no_watch_history') + '</span>');
      };
      /**
       * Отрисовка файлов
       */
      this.draw = function (items) {
        var _this8 = this;
        var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        if (!items.length) return this.empty();
        scroll.clear();
        if (!object.balanser) scroll.append(Lampa.Template.get('lampac_prestige_watched', {}));
        this.updateWatched();
        this.getEpisodes(items[0].season, function (episodes) {
          var viewed = Lampa.Storage.cache('online_view', 5000, []);
          var serial = object.movie.name ? true : false;
          var choice = _this8.getChoice() || {};
          if (!choice.episodes_view) choice.episodes_view = {};
          var fully = window.innerWidth > 480;
          var scroll_to_element = false;
          var scroll_to_mark = false;
          items.forEach(function (element, index) {
            var episode = serial && episodes.length && !params.similars ? episodes.find(function (e) {
              return e.episode_number == element.episode;
            }) : false;
            var episode_num = element.episode || index + 1;
            var episode_last = choice.episodes_view[element.season];
            var voice_name = choice.voice_name || (filter_find.voice[0] ? filter_find.voice[0].title : false) || element.voice_name || (serial ? 'Неизвестно' : element.text) || 'Неизвестно';
            if (element.quality) {
              element.qualitys = element.quality;
              element.quality = Lampa.Arrays.getKeys(element.quality)[0];
            }
            Lampa.Arrays.extend(element, {
              voice_name: voice_name,
              info: voice_name.length > 60 ? voice_name.substr(0, 60) + '...' : voice_name,
              quality: '',
              time: Lampa.Utils.secondsToTime((episode ? episode.runtime : object.movie.runtime) * 60, true)
            });
            var hash_timeline = Lampa.Utils.hash(element.season ? [element.season, element.season > 10 ? ':' : '', element.episode, object.movie.original_title].join('') : object.movie.original_title);
            var hash_behold = Lampa.Utils.hash(element.season ? [element.season, element.season > 10 ? ':' : '', element.episode, object.movie.original_title, element.voice_name].join('') : object.movie.original_title + element.voice_name);
            var data = {
              hash_timeline: hash_timeline,
              hash_behold: hash_behold
            };
            var info = [];
            if (element.season) {
              element.translate_episode_end = _this8.getLastEpisode(items);
              element.translate_voice = element.voice_name;
            }
            if (element.text && !episode) element.title = element.text;
            element.timeline = Lampa.Timeline.view(hash_timeline);
            if (episode) {
              element.title = episode.name;
              if (element.info.length < 30 && episode.vote_average) info.push(Lampa.Template.get('lampac_prestige_rate', {
                rate: parseFloat(episode.vote_average + '').toFixed(1)
              }, true));
              if (episode.air_date && fully) info.push(Lampa.Utils.parseTime(episode.air_date).full);
            } else if (object.movie.release_date && fully) {
              info.push(Lampa.Utils.parseTime(object.movie.release_date).full);
            }
            if (!serial && object.movie.tagline && element.info.length < 30) info.push(object.movie.tagline);
            if (element.info) info.push(element.info);
            if (info.length) element.info = info.map(function (i) {
              return '<span>' + i + '</span>';
            }).join('<span class="online-prestige-split">•</span>');
            var html = Lampa.Template.get('lampac_prestige_full', element);
            var loader = html.find('.online-prestige__loader');
            var image = html.find('.online-prestige__img');
            if (object.balanser) image.hide();
            if (!serial) {
              if (choice.movie_view == hash_behold) scroll_to_element = html;
            } else if (typeof episode_last !== 'undefined' && episode_last == episode_num) {
              scroll_to_element = html;
            }
            if (serial && !episode) {
              image.append('<div class="online-prestige__episode-number">' + formatEpisodeNumber(element.episode || index + 1) + '</div>');
              loader.remove();
            } else if (!serial && object.movie.backdrop_path == 'undefined') loader.remove();else {
              var img = html.find('img')[0];
              img.onerror = function () {
                img.src = './img/img_broken.svg';
              };
              img.onload = function () {
                image.addClass('online-prestige__img--loaded');
                loader.remove();
                if (serial) image.append('<div class="online-prestige__episode-number">' + formatEpisodeNumber(element.episode || index + 1) + '</div>');
              };
              img.src = Lampa.TMDB.image('t/p/w300' + (episode ? episode.still_path : object.movie.backdrop_path));
              images.push(img);
              element.thumbnail = img.src;
            }
            html.find('.online-prestige__timeline').append(Lampa.Timeline.render(element.timeline));
            if (viewed.indexOf(hash_behold) !== -1) {
              scroll_to_mark = html;
              html.find('.online-prestige__img').append('<div class="online-prestige__viewed">' + Lampa.Template.get('icon_viewed', {}, true) + '</div>');
            }
            element.mark = function () {
              viewed = Lampa.Storage.cache('online_view', 5000, []);
              if (viewed.indexOf(hash_behold) == -1) {
                viewed.push(hash_behold);
                Lampa.Storage.set('online_view', viewed);
                if (html.find('.online-prestige__viewed').length == 0) {
                  html.find('.online-prestige__img').append('<div class="online-prestige__viewed">' + Lampa.Template.get('icon_viewed', {}, true) + '</div>');
                }
              }
              choice = _this8.getChoice() || {};
              if (!choice.episodes_view) choice.episodes_view = {};
              if (!serial) {
                choice.movie_view = hash_behold;
              } else {
                choice.episodes_view[element.season] = episode_num;
              }
              _this8.saveChoice(choice);
              var voice_name_text = choice.voice_name || element.voice_name || element.title;
              if (voice_name_text.length > 30) voice_name_text = voice_name_text.slice(0, 30) + '...';
              _this8.watched({
                balanser: balanser,
                balanser_name: Lampa.Utils.capitalizeFirstLetter(sources[balanser] ? sources[balanser].name.split(' ')[0] : balanser),
                voice_id: choice.voice_id,
                voice_name: voice_name_text,
                episode: element.episode,
                season: element.season
              });
            };
            element.unmark = function () {
              viewed = Lampa.Storage.cache('online_view', 5000, []);
              if (viewed.indexOf(hash_behold) !== -1) {
                Lampa.Arrays.remove(viewed, hash_behold);
                Lampa.Storage.set('online_view', viewed);
                Lampa.Storage.remove('online_view', hash_behold);
                html.find('.online-prestige__viewed').remove();
              }
            };
            element.timeclear = function () {
              element.timeline.percent = 0;
              element.timeline.time = 0;
              element.timeline.duration = 0;
              Lampa.Timeline.update(element.timeline);
            };
            html.on('hover:enter', function () {
              if (object.movie.id) Lampa.Favorite.add('history', object.movie, 100);
              if (params.onEnter) params.onEnter(element, html, data);
            }).on('hover:focus', function (e) {
              last = e.target;
              if (params.onFocus) params.onFocus(element, html, data);
              scroll.update($(e.target), true);
            });
            if (params.onRender) params.onRender(element, html, data);
            _this8.contextMenu({
              html: html,
              element: element,
              onFile: function onFile(call) {
                if (params.onContextMenu) params.onContextMenu(element, html, data, call);
              },
              onClearAllMark: function onClearAllMark() {
                items.forEach(function (elem) {
                  elem.unmark();
                });
              },
              onClearAllTime: function onClearAllTime() {
                items.forEach(function (elem) {
                  elem.timeclear();
                });
              }
            });
            scroll.append(html);
          });
          if (serial && episodes.length > items.length && !params.similars) {
            var left = episodes.slice(items.length);
            left.forEach(function (episode) {
              var info = [];
              if (episode.vote_average) info.push(Lampa.Template.get('lampac_prestige_rate', {
                rate: parseFloat(episode.vote_average + '').toFixed(1)
              }, true));
              if (episode.air_date) info.push(Lampa.Utils.parseTime(episode.air_date).full);
              var air = new Date((episode.air_date + '').replace(/-/g, '/'));
              var now = Date.now();
              var day = Math.round((air.getTime() - now) / (24 * 60 * 60 * 1000));
              var txt = Lampa.Lang.translate('full_episode_days_left') + ': ' + day;
              var html = Lampa.Template.get('lampac_prestige_full', {
                time: Lampa.Utils.secondsToTime((episode ? episode.runtime : object.movie.runtime) * 60, true),
                info: info.length ? info.map(function (i) {
                  return '<span>' + i + '</span>';
                }).join('<span class="online-prestige-split">•</span>') : '',
                title: episode.name,
                quality: day > 0 ? txt : ''
              });
              var loader = html.find('.online-prestige__loader');
              var image = html.find('.online-prestige__img');
              var season = items[0] ? items[0].season : 1;
              html.find('.online-prestige__timeline').append(Lampa.Timeline.render(Lampa.Timeline.view(Lampa.Utils.hash([season, episode.episode_number, object.movie.original_title].join('')))));
              var img = html.find('img')[0];
              if (episode.still_path) {
                img.onerror = function () {
                  img.src = './img/img_broken.svg';
                };
                img.onload = function () {
                  image.addClass('online-prestige__img--loaded');
                  loader.remove();
                  image.append('<div class="online-prestige__episode-number">' + formatEpisodeNumber(episode.episode_number) + '</div>');
                };
                img.src = Lampa.TMDB.image('t/p/w300' + episode.still_path);
                images.push(img);
              } else {
                loader.remove();
                image.append('<div class="online-prestige__episode-number">' + formatEpisodeNumber(episode.episode_number) + '</div>');
              }
              html.on('hover:focus', function (e) {
                last = e.target;
                scroll.update($(e.target), true);
              });
              html.css('opacity', '0.5');
              scroll.append(html);
            });
          }
          if (scroll_to_element) {
            last = scroll_to_element[0];
          } else if (scroll_to_mark) {
            last = scroll_to_mark[0];
          }
          Lampa.Controller.enable('content');
        });
      };
      /**
       * Меню
       */
      this.contextMenu = function (params) {
        params.html.on('hover:long', function () {
          function show(extra) {
            var enabled = Lampa.Controller.enabled().name;
            var menu = [];
            if (Lampa.Platform.is('webos')) {
              menu.push({
                title: Lampa.Lang.translate('player_lauch') + ' - Webos',
                player: 'webos'
              });
            }
            if (Lampa.Platform.is('android')) {
              menu.push({
                title: Lampa.Lang.translate('player_lauch') + ' - Android',
                player: 'android'
              });
            }
            menu.push({
              title: Lampa.Lang.translate('player_lauch') + ' - Lampa',
              player: 'lampa'
            });
            menu.push({
              title: Lampa.Lang.translate('lampac_video'),
              separator: true
            });
            menu.push({
              title: Lampa.Lang.translate('torrent_parser_label_title'),
              mark: true
            });
            menu.push({
              title: Lampa.Lang.translate('torrent_parser_label_cancel_title'),
              unmark: true
            });
            menu.push({
              title: Lampa.Lang.translate('time_reset'),
              timeclear: true
            });
            if (extra) {
              menu.push({
                title: Lampa.Lang.translate('copy_link'),
                copylink: true
              });
            }
            if (window.lampac_online_context_menu) window.lampac_online_context_menu.push(menu, extra, params);
            menu.push({
              title: Lampa.Lang.translate('more'),
              separator: true
            });
            if (Lampa.Account.logged() && params.element && typeof params.element.season !== 'undefined' && params.element.translate_voice) {
              menu.push({
                title: Lampa.Lang.translate('lampac_voice_subscribe'),
                subscribe: true
              });
            }
            menu.push({
              title: Lampa.Lang.translate('lampac_clear_all_marks'),
              clearallmark: true
            });
            menu.push({
              title: Lampa.Lang.translate('lampac_clear_all_timecodes'),
              timeclearall: true
            });
            Lampa.Select.show({
              title: Lampa.Lang.translate('title_action'),
              items: menu,
              onBack: function onBack() {
                Lampa.Controller.toggle(enabled);
              },
              onSelect: function onSelect(a) {
                if (a.mark) params.element.mark();
                if (a.unmark) params.element.unmark();
                if (a.timeclear) params.element.timeclear();
                if (a.clearallmark) params.onClearAllMark();
                if (a.timeclearall) params.onClearAllTime();
                if (window.lampac_online_context_menu) window.lampac_online_context_menu.onSelect(a, params);
                Lampa.Controller.toggle(enabled);
                if (a.player) {
                  Lampa.Player.runas(a.player);
                  params.html.trigger('hover:enter');
                }
                if (a.copylink) {
                  if (extra.quality) {
                    var qual = [];
                    for (var i in extra.quality) {
                      qual.push({
                        title: i,
                        file: extra.quality[i]
                      });
                    }
                    Lampa.Select.show({
                      title: Lampa.Lang.translate('settings_server_links'),
                      items: qual,
                      onBack: function onBack() {
                        Lampa.Controller.toggle(enabled);
                      },
                      onSelect: function onSelect(b) {
                        Lampa.Utils.copyTextToClipboard(b.file, function () {
                          Lampa.Noty.show(Lampa.Lang.translate('copy_secuses'));
                        }, function () {
                          Lampa.Noty.show(Lampa.Lang.translate('copy_error'));
                        });
                      }
                    });
                  } else {
                    Lampa.Utils.copyTextToClipboard(extra.file, function () {
                      Lampa.Noty.show(Lampa.Lang.translate('copy_secuses'));
                    }, function () {
                      Lampa.Noty.show(Lampa.Lang.translate('copy_error'));
                    });
                  }
                }
                if (a.subscribe) {
                  Lampa.Account.subscribeToTranslation({
                    card: object.movie,
                    season: params.element.season,
                    episode: params.element.translate_episode_end,
                    voice: params.element.translate_voice
                  }, function () {
                    Lampa.Noty.show(Lampa.Lang.translate('lampac_voice_success'));
                  }, function () {
                    Lampa.Noty.show(Lampa.Lang.translate('lampac_voice_error'));
                  });
                }
              }
            });
          }
          params.onFile(show);
        }).on('hover:focus', function () {
          if (Lampa.Helper) Lampa.Helper.show('online_file', Lampa.Lang.translate('helper_online_file'), params.html);
        });
      };
      /**
       * Показать пустой результат
       */
      this.empty = function () {
        var html = Lampa.Template.get('lampac_does_not_answer', {});
        html.find('.online-empty__buttons').remove();
        html.find('.online-empty__title').text(Lampa.Lang.translate('empty_title_two'));
        html.find('.online-empty__time').text(Lampa.Lang.translate('empty_text'));
        scroll.clear();
        scroll.append(html);
        this.loading(false);
      };
      this.noConnectToServer = function (er) {
        var html = Lampa.Template.get('lampac_does_not_answer', {});
        html.find('.online-empty__buttons').remove();
        html.find('.online-empty__title').text(Lampa.Lang.translate('title_error'));
        html.find('.online-empty__time').text(er && er.accsdb ? er.msg : Lampa.Lang.translate('lampac_does_not_answer_text').replace('{balanser}', sources[balanser] && sources[balanser].name || balanser || ''));
        scroll.clear();
        scroll.append(html);
        this.loading(false);
      };
      this.doesNotAnswer = function (er) {
        var _this9 = this;
        this.reset();
        var html = Lampa.Template.get('lampac_does_not_answer', {
          balanser: balanser
        });
        if (er && er.accsdb) html.find('.online-empty__title').html(er.msg);
        var tic = er && er.accsdb ? 10 : 5;
        html.find('.cancel').on('hover:enter', function () {
          clearInterval(balanser_timer);
        });
        html.find('.change').on('hover:enter', function () {
          clearInterval(balanser_timer);
          filter.render().find('.filter--sort').trigger('hover:enter');
        });
        scroll.clear();
        scroll.append(html);
        this.loading(false);
        balanser_timer = setInterval(function () {
          tic--;
          html.find('.timeout').text(tic);
          if (tic == 0) {
            clearInterval(balanser_timer);
            var keys = Lampa.Arrays.getKeys(sources);
            var indx = keys.indexOf(balanser);
            var next = keys[indx + 1];
            if (!next) next = keys[0];
            balanser = next;
            if (Lampa.Activity.active().activity == _this9.activity) _this9.changeBalanser(balanser);
          }
        }, 1000);
      };
      this.getLastEpisode = function (items) {
        var last_episode = 0;
        items.forEach(function (e) {
          if (typeof e.episode !== 'undefined') last_episode = Math.max(last_episode, parseInt(e.episode));
        });
        return last_episode;
      };
      /**
       * Начать навигацию по файлам
       */
      this.start = function () {
        if (Lampa.Activity.active().activity !== this.activity) return;
        if (!initialized) {
          initialized = true;
          this.initialize();
        }
        Lampa.Background.immediately(Lampa.Utils.cardImgBackgroundBlur(object.movie));
        Lampa.Controller.add('content', {
          toggle: function toggle() {
            Lampa.Controller.collectionSet(scroll.render(), files.render());
            Lampa.Controller.collectionFocus(last || false, scroll.render());
          },
          gone: function gone() {
            clearTimeout(balanser_timer);
          },
          up: function up() {
            if (Navigator.canmove('up')) {
              Navigator.move('up');
            } else Lampa.Controller.toggle('head');
          },
          down: function down() {
            Navigator.move('down');
          },
          right: function right() {
            if (Navigator.canmove('right')) Navigator.move('right');else filter.show(Lampa.Lang.translate('title_filter'), 'filter');
          },
          left: function left() {
            if (Navigator.canmove('left')) Navigator.move('left');else Lampa.Controller.toggle('menu');
          },
          back: this.back.bind(this)
        });
        Lampa.Controller.toggle('content');
      };
      this.render = function () {
        return files.render();
      };
      this.back = function () {
        Lampa.Activity.backward();
      };
      this.pause = function () {};
      this.stop = function () {};
      this.destroy = function () {
        network.clear();
        this.clearImages();
        files.destroy();
        scroll.destroy();
        clearInterval(balanser_timer);
        clearTimeout(life_wait_timer);
      };
    }
    function addSourceSearch(spiderName, spiderUri) {
      var network = new Lampa.Reguest();
      var source = {
        title: spiderName,
        search: function search(params, oncomplite) {
          function searchComplite(links) {
            var keys = Lampa.Arrays.getKeys(links);
            if (keys.length) {
              var status = new Lampa.Status(keys.length);
              status.onComplite = function (result) {
                var rows = [];
                keys.forEach(function (name) {
                  var line = result[name];
                  if (line && line.data && line.type == 'similar') {
                    var cards = line.data.map(function (item) {
                      item.title = Lampa.Utils.capitalizeFirstLetter(item.title);
                      item.release_date = item.year || '0000';
                      item.balanser = spiderUri;
                      if (item.img !== undefined) {
                        if (item.img.charAt(0) === '/') item.img = Defined.localhost + item.img.substring(1);
                        if (item.img.indexOf('/proxyimg') !== -1) item.img = account(item.img);
                      }
                      return item;
                    });
                    rows.push({
                      title: name,
                      results: cards
                    });
                  }
                });
                oncomplite(rows);
              };
              keys.forEach(function (name) {
                network.silent(account(links[name]), function (data) {
                  status.append(name, data);
                }, function () {
                  status.error();
                }, false, {
                  headers: addHeaders()
                });
              });
            } else {
              oncomplite([]);
            }
          }
          network.silent(account(Defined.localhost + 'lite/' + spiderUri + '?title=' + params.query), function (json) {
            if (json.rch) {
              rchRun(json, function () {
                network.silent(account(Defined.localhost + 'lite/' + spiderUri + '?title=' + params.query), function (links) {
                  searchComplite(links);
                }, function () {
                  oncomplite([]);
                }, false, {
                  headers: addHeaders()
                });
              });
            } else {
              searchComplite(json);
            }
          }, function () {
            oncomplite([]);
          }, false, {
            headers: addHeaders()
          });
        },
        onCancel: function onCancel() {
          network.clear();
        },
        params: {
          lazy: true,
          align_left: true,
          card_events: {
            onMenu: function onMenu() {}
          }
        },
        onMore: function onMore(params, close) {
          close();
        },
        onSelect: function onSelect(params, close) {
          close();
          Lampa.Activity.push({
            url: params.element.url,
            title: 'Lampac - ' + params.element.title,
            component: 'lampac',
            movie: params.element,
            page: 1,
            search: params.element.title,
            clarification: true,
            balanser: params.element.balanser,
            noinfo: true
          });
        }
      };
      Lampa.Search.addSource(source);
    }
    function startPlugin() {
      lampacDebug('startPlugin enter');
      window.lampac_plugin = true;
      var manifst = {
        type: 'video',
        version: '1.6.9',
        name: 'Lampac',
        description: 'Плагин для просмотра онлайн сериалов и фильмов',
        component: 'lampac',
        onContextMenu: function onContextMenu(object) {
          return {
            name: Lampa.Lang.translate('lampac_watch'),
            description: ''
          };
        },
        onContextLauch: function onContextLauch(object) {
          resetTemplates();
          Lampa.Component.add('lampac', component);
          var id = Lampa.Utils.hash(object.number_of_seasons ? object.original_name : object.original_title);
          var all = Lampa.Storage.get('clarification_search', '{}');
          Lampa.Activity.push({
            url: '',
            title: Lampa.Lang.translate('title_online'),
            component: 'lampac',
            search: all[id] ? all[id] : object.title,
            search_one: object.title,
            search_two: object.original_title,
            movie: object,
            page: 1,
            clarification: all[id] ? true : false
          });
        }
      };
      addSourceSearch('Spider', 'spider');
      addSourceSearch('Anime', 'spider/anime');
      Lampa.Manifest.plugins = manifst;
      Lampa.Lang.add({
        lampac_watch: {
          ru: 'Смотреть онлайн',
          en: 'Watch online',
          uk: 'Дивитися онлайн',
          zh: '在线观看'
        },
        lampac_video: {
          ru: 'Видео',
          en: 'Video',
          uk: 'Відео',
          zh: '视频'
        },
        lampac_no_watch_history: {
          ru: 'Нет истории просмотра',
          en: 'No browsing history',
          ua: 'Немає історії перегляду',
          zh: '没有浏览历史'
        },
        lampac_nolink: {
          ru: 'Не удалось извлечь ссылку',
          uk: 'Неможливо отримати посилання',
          en: 'Failed to fetch link',
          zh: '获取链接失败'
        },
        lampac_balanser: {
          ru: 'Источник',
          uk: 'Джерело',
          en: 'Source',
          zh: '来源'
        },
        lampac_balanser_hint: {
          ru: 'Если качество плохое или плохо грузит, попробуйте переключить источник',
          uk: 'Якщо якість погана або погано завантажується, спробуйте переключити джерело',
          en: 'If the quality is poor or loading is slow, try switching the source',
          zh: '如果画质较差或加载缓慢，请尝试切换来源'
        },
        helper_online_file: {
          ru: 'Удерживайте клавишу "ОК" для вызова контекстного меню',
          uk: 'Утримуйте клавішу "ОК" для виклику контекстного меню',
          en: 'Hold the "OK" key to bring up the context menu',
          zh: '按住“确定”键调出上下文菜单'
        },
        title_online: {
          ru: 'Онлайн',
          uk: 'Онлайн',
          en: 'Online',
          zh: '在线的'
        },
        lampac_voice_subscribe: {
          ru: 'Подписаться на перевод',
          uk: 'Підписатися на переклад',
          en: 'Subscribe to translation',
          zh: '订阅翻译'
        },
        lampac_voice_success: {
          ru: 'Вы успешно подписались',
          uk: 'Ви успішно підписалися',
          en: 'You have successfully subscribed',
          zh: '您已成功订阅'
        },
        lampac_voice_error: {
          ru: 'Возникла ошибка',
          uk: 'Виникла помилка',
          en: 'An error has occurred',
          zh: '发生了错误'
        },
        lampac_clear_all_marks: {
          ru: 'Очистить все метки',
          uk: 'Очистити всі мітки',
          en: 'Clear all labels',
          zh: '清除所有标签'
        },
        lampac_clear_all_timecodes: {
          ru: 'Очистить все тайм-коды',
          uk: 'Очистити всі тайм-коди',
          en: 'Clear all timecodes',
          zh: '清除所有时间代码'
        },
        lampac_change_balanser: {
          ru: 'Изменить балансер',
          uk: 'Змінити балансер',
          en: 'Change balancer',
          zh: '更改平衡器'
        },
        lampac_balanser_dont_work: {
          ru: 'Поиск на ({balanser}) не дал результатов',
          uk: 'Пошук на ({balanser}) не дав результатів',
          en: 'Search on ({balanser}) yielded no results',
          zh: '在 ({balanser}) 上搜索没有结果'
        }
      });
    }

    function resetTemplates() {
      Lampa.Template.add('lampac_content_loading', '<div class="torrent-list__loading"></div>');
      Lampa.Template.add('lampac_prestige_watched', '<div class="online-prestige-watched online-prestige-watched__body select-item"></div>');
      Lampa.Template.add('lampac_prestige_full', '<div class="online-prestige-full select-item selector"><div class="online-prestige__img"><img src="" alt="" /><div class="online-prestige__loader"></div></div><div class="online-prestige__body"><div class="online-prestige__title"></div><div class="online-prestige__info"></div><div class="online-prestige__timeline"></div></div><div class="online-prestige__quality"></div></div>');
      Lampa.Template.add('lampac_prestige_rate', '<span class="online-prestige__rate">★ {rate}</span>');
      Lampa.Template.add('lampac_prestige_folder', '<div class="online-prestige-folder select-item selector"><div class="online-prestige__folder"></div><div class="online-prestige__body"><div class="online-prestige__title">{title}</div><div class="online-prestige__info">{info}</div></div></div>');
      Lampa.Template.add('lampac_does_not_answer', '<div class="online-empty select-item"><div class="online-empty__title">Источники не отвечают</div><div class="online-empty__time">Переключение источника через <span class="timeout">5</span> сек...</div><div class="online-empty__buttons"><div class="online-empty__button change selector">Выбрать вручную</div><div class="online-empty__button cancel selector">Отмена</div></div></div>');
    }

    if (window.Lampa && window.Lampa.Manifest) {
      startPlugin();
    } else {
      window.lampac_plugin_init = startPlugin;
    }

  })();
})();

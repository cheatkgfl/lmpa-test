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

    // === Р”РёР°РіРЅРѕСЃС‚РёС‡РµСЃРєРёРµ РјР°СЏРєРё ============================================
    // Р§С‚РѕР±С‹ РІС‹РєР»СЋС‡РёС‚СЊ вЂ” РїРѕРјРµРЅСЏС‚СЊ LAMPAC_DEBUG РЅР° false Рё РїРµСЂРµСЃРѕР±СЂР°С‚СЊ.
    var LAMPAC_DEBUG = false; // true вЂ” РґРѕР±Р°РІР»СЏРµС‚ РµС‰С‘ Рё Noty-РІСЃРїР»С‹РІР°С€РєРё; false вЂ” С‚РѕР»СЊРєРѕ console.log в†’ in-app РєРѕРЅСЃРѕР»СЊ Р›Р°РјРїС‹
    function lampacDebug(tag, payload) {
      try {
        var msg = '[lampac] ' + tag + (payload !== undefined ? ': ' + (typeof payload === 'string' ? payload : JSON.stringify(payload)) : '');
        if (typeof console !== 'undefined' && console.log) console.log(msg);
        if (LAMPAC_DEBUG && window.Lampa && Lampa.Noty && Lampa.Noty.show) ;
      } catch (e) {}
    }
    // ======================================================================

    // Р РµР·РµСЂРІРЅС‹Р№ СЃРїРёСЃРѕРє vapi-С…РѕСЃС‚РѕРІ. РћСЃРЅРѕРІРЅРѕР№ РёСЃС‚РѕС‡РЅРёРє вЂ” Р¶РёРІРѕР№ СЂРµРµСЃС‚СЂ РЅР° РЅР°С€РµРј Р±СЌРєРµРЅРґРµ
    // (lampacFetchHosts): РєР°Р¶РґС‹Р№ lampac-РёРЅСЃС‚Р°РЅСЃ СЂР°Р· РІ СЃРµРєСѓРЅРґСѓ СЂРµРіРёСЃС‚СЂРёСЂСѓРµС‚ СЃРµР±СЏ С‚Р°Рј, Рё
    // С„СЂРѕРЅС‚ Р±РµСЂС‘С‚ РѕС‚С‚СѓРґР° Р°РєС‚СѓР°Р»СЊРЅС‹С…. Р­С‚РѕС‚ С…Р°СЂРґРєРѕРґ РёСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ Р»РёС€СЊ РєРѕРіРґР° СЂРµРµСЃС‚СЂ РїСѓСЃС‚
    // РёР»Рё РЅРµРґРѕСЃС‚СѓРїРµРЅ (СЃС‚Р°СЂС‚ Р±РµР· СЃРµС‚Рё/Р±СЌРєРµРЅРґР°), С‡С‚РѕР±С‹ РїР»Р°РіРёРЅ РЅРµ РѕСЃС‚Р°Р»СЃСЏ РІРѕРІСЃРµ Р±РµР· С…РѕСЃС‚РѕРІ.
    // Р”Р°Р»СЊС€Рµ РїРѕ Р»СЋР±РѕРјСѓ СЃРїРёСЃРєСѓ РёРґС‘С‚ health-РїСЂРѕР±Р° (lampacProbeHost) Рё СЃР»СѓС‡Р°Р№РЅС‹Р№ РёР· Р РђР‘РћР§РРҐ вЂ”
    // РёР·-Р·Р° РўРЎРџРЈ-С‚СЂРѕС‚С‚Р»РёРЅРіР° Р·Р°СЂСѓР±РµР¶РЅС‹С… С…РѕСЃС‚РёРЅРіРѕРІ СЃ СЂСѓСЃСЃРєРёС… СЃРµС‚РµР№: Р·Р°Р¶Р°С‚С‹Р№ С…РѕСЃС‚ СЃС‚Р°РІРёС‚
    // СЃРѕРµРґРёРЅРµРЅРёРµ Рё РѕС‚РґР°С‘С‚ РїРµСЂРІС‹Рµ ~16 РљР‘, РїРѕСЃР»Рµ С‡РµРіРѕ РІРёСЃРЅРµС‚, С„РѕСЂРјР°Р»СЊРЅРѕ РѕСЃС‚Р°РІР°СЏСЃСЊ В«РґРѕСЃС‚СѓРїРЅС‹РјВ».
    var LAMPAC_HOSTS = ['138-16-161-175.nip.io', '138-16-160-242.nip.io', '51-38-205-195.nip.io', '135-181-168-135.nip.io', '95-217-136-138.nip.io', '95-217-98-122.nip.io'];
    var Defined = {
      api: 'lampac',
      // localhost РІС‹СЃС‚Р°РІР»СЏРµС‚СЃСЏ РІ bootLampac() РїРѕСЃР»Рµ health-РїСЂРѕР±С‹ Рё С„РёРєСЃРёСЂСѓРµС‚СЃСЏ РЅР° СЃРµСЃСЃРёСЋ
      // (РёРЅР°С‡Рµ memkey / lifeevents СЂР°Р·РІР°Р»СЏС‚СЃСЏ РїСЂРё СЃРјРµРЅРµ С…РѕСЃС‚Р° РјРµР¶РґСѓ Р·Р°РїСЂРѕСЃР°РјРё).
      localhost: '',
      apn: ''
    };

    // hostkey вЂ” РєР»СЋС‡ СЃРµСЃСЃРёРё, РїСЂРёРІСЏР·Р°РЅРЅС‹Р№ Рє РІС‹Р±СЂР°РЅРЅРѕРјСѓ С…РѕСЃС‚Сѓ; Р·Р°РїРѕР»РЅСЏРµС‚СЃСЏ РІ initRch().
    var hostkey;

    // РџСЂРѕР±Р° РѕРґРЅРѕРіРѕ С…РѕСЃС‚Р°: СЂР°Р±РѕС‡РёРј СЃС‡РёС‚Р°РµРј, С‚РѕР»СЊРєРѕ РµСЃР»Рё РѕРЅ СѓСЃРїРµР» РћРўР”РђРўР¬ РљР РЈРџРќР«Р™ Р¤РђР™Р›
    // Р¦Р•Р›РРљРћРњ Р·Р° РѕС‚РІРµРґС‘РЅРЅРѕРµ РІСЂРµРјСЏ. online.js (~91 РљР‘, РѕС‚РґР°С‘С‚СЃСЏ СЃ CORS) Р·Р°РІРµРґРѕРјРѕ Р±РѕР»СЊС€Рµ
    // С‚СЂРѕС‚С‚Р»-РїРѕСЂРѕРіР° (~16 РљР‘), РїРѕСЌС‚РѕРјСѓ Р·Р°Р¶Р°С‚С‹Р№ С…РѕСЃС‚ РїСЂРѕРІР°Р»РёРІР°РµС‚ РїСЂРѕР±Сѓ РїРѕ С‚Р°Р№РјР°СѓС‚Сѓ/РѕР±СЂС‹РІСѓ,
    // Р° Р¶РёРІРѕР№ вЂ” РѕС‚РґР°С‘С‚ РІСЃС‘ Р·Р° РґРѕР»Рё СЃРµРєСѓРЅРґС‹.
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
            // > 40 РљР‘ вЂ” РіР°СЂР°РЅС‚РёСЂРѕРІР°РЅРЅРѕ РІС‹С€Рµ С‚СЂРѕС‚С‚Р»-РїРѕСЂРѕРіР°, РЅРѕ РЅРёР¶Рµ РїРѕР»РЅРѕРіРѕ СЂР°Р·РјРµСЂР° online.js,
            // С‡С‚РѕР±С‹ РґРѕРїСѓСЃС‚РёС‚СЊ РјРµР»РєСѓСЋ СЂР°Р·РЅРёС†Сѓ РІРµСЂСЃРёР№ РјРµР¶РґСѓ С…РѕСЃС‚Р°РјРё.
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

    // РџСЂРѕР±СѓРµРј РІСЃРµ С…РѕСЃС‚С‹ РїР°СЂР°Р»Р»РµР»СЊРЅРѕ, РІ cb РѕС‚РґР°С‘Рј СЃР»СѓС‡Р°Р№РЅС‹Р№ РёР· СЂР°Р±РѕС‡РёС…. Р•СЃР»Рё РЅРµ РїСЂРѕС€С‘Р»
    // РЅРё РѕРґРёРЅ (РїСЂРѕР±Р° Р·Р°Р±Р»РѕРєРёСЂРѕРІР°РЅР°/РЅРµС‚ СЃРµС‚Рё) вЂ” СЃР»СѓС‡Р°Р№РЅС‹Р№ РёР· РІСЃРµС…, С‡С‚РѕР±С‹ РїР»Р°РіРёРЅ РЅРµ РѕСЃС‚Р°Р»СЃСЏ
    // Р±РµР· С…РѕСЃС‚Р° РІРѕРІСЃРµ (Р»СѓС‡С€Рµ РїРѕРїС‹С‚Р°С‚СЊСЃСЏ, С‡РµРј РЅРµ СЂР°Р±РѕС‚Р°С‚СЊ СЃРѕРІСЃРµРј).
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

    // Р‘Р°Р·Р° РЅР°С€РµРіРѕ Р±СЌРєРµРЅРґР° (Р±СЂРµРЅРґ-API) вЂ” С‚РѕС‚ Р¶Рµ origin, РѕС‚РєСѓРґР° РіСЂСѓР·РёС‚СЃСЏ online.js
    // (СЃРј. lampa-web/src/services/libs.js). РћС‚СЃСЋРґР° Р¶Рµ Р±РµСЂС‘Рј Р¶РёРІРѕР№ СЃРїРёСЃРѕРє lampac-С…РѕСЃС‚РѕРІ.
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

    // Р–РёРІРѕР№ СЃРїРёСЃРѕРє Р°РєС‚РёРІРЅС‹С… lampac-С…РѕСЃС‚РѕРІ СЃ РЅР°С€РµРіРѕ Р±СЌРєРµРЅРґР°. РҐРѕСЃС‚С‹ СЂРµРіРёСЃС‚СЂРёСЂСѓСЋС‚ СЃРµР±СЏ СЃР°РјРё
    // (heartbeat СЂР°Р· РІ СЃРµРєСѓРЅРґСѓ), Р±СЌРєРµРЅРґ РѕС‚РґР°С‘С‚ С‚РµС…, РєС‚Рѕ РїРёРЅРіРѕРІР°Р» РЅРµРґР°РІРЅРѕ. РќР° Р»СЋР±РѕР№
    // СЃР±РѕР№/РїСѓСЃС‚РѕР№ РѕС‚РІРµС‚ РІРѕР·РІСЂР°С‰Р°РµРј null вЂ” bootLampac С‚РѕРіРґР° РѕС‚РєР°С‚С‹РІР°РµС‚СЃСЏ РЅР° LAMPAC_HOSTS.
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
    // РЎРµСЂРІРµСЂРЅР°СЏ РїРѕРґСЃС‚Р°РЅРѕРІРєР° {localhost} Р·Р°РјРµРЅРµРЅР° РЅР° Defined.localhost (СЃРј. РІС‹С€Рµ)
    // Рё Р·Р°С„РёРєСЃРёСЂРѕРІР°РЅР° РЅР° СЃРµСЃСЃРёСЋ РІРјРµСЃС‚Рµ СЃ РІС‹Р±РѕСЂРѕРј vapi-С…РѕСЃС‚Р°.
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

    // РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ RCH/NWS РїРѕРґ РІС‹Р±СЂР°РЅРЅС‹Р№ С…РѕСЃС‚. Р’С‹Р·С‹РІР°РµС‚СЃСЏ РёР· bootLampac()
    // СѓР¶Рµ РїРѕСЃР»Рµ С‚РѕРіРѕ, РєР°Рє Defined.localhost РІС‹СЃС‚Р°РІР»РµРЅ РЅР° СЂР°Р±РѕС‡РёР№ С…РѕСЃС‚.
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
            lampacDebug('rch typeInvoke', 'android/tizen в†’ cors (sync)');
            check(true);
          } else {
            lampacDebug('rch typeInvoke', 'web в†’ /cors/check');
            var net = new Lampa.Reguest();
            // CORS-РїСЂРѕР±Р° СЃС‚СЂРѕРіРѕ РЅР° С…РѕСЃС‚ РїР»Р°РіРёРЅР° (vapi) вЂ” РѕРЅ РІСЃРµРіРґР° РЅР° РґСЂСѓРіРѕРј origin,
            // С‡РµРј СЃС‚СЂР°РЅРёС†Р°, С‚Р°Рє С‡С‚Рѕ СЌС‚Рѕ РІР°Р»РёРґРЅС‹Р№ РєСЂРѕСЃСЃ-РґРѕРјРµРЅРЅС‹Р№ С‚РµСЃС‚.
            // Р Р°РЅСЊС€Рµ С‚СѓС‚ Р±С‹Р»Р° РІРµС‚РєР° РЅР° РІРЅРµС€РЅРёР№ С…РѕСЃС‚ (РґР»СЏ self-hosted, РєРѕРіРґР° РїР»Р°РіРёРЅ
            // РЅР° С‚РѕРј Р¶Рµ origin), РЅРѕ РїСЂРѕРІРµСЂРєР° С‡РµСЂРµР· indexOf(location.host) РѕС€РёР±РѕС‡РЅРѕ
            // СЃСЂР°Р±Р°С‚С‹РІР°Р»Р° (vapi1.vi3000.com СЃРѕРґРµСЂР¶РёС‚ РїРѕРґСЃС‚СЂРѕРєСѓ vi3000.com) Рё СЃР»Р°Р»Р°
            // Р»РёС€РЅРёР№ РІРЅРµС€РЅРёР№ Р·Р°РїСЂРѕСЃ РЅР° РєР°Р¶РґРѕРј Р±СЂРµРЅРґ-РґРѕРјРµРЅРµ.
            net.silent(host + '/cors/check', function () {
              lampacDebug('rch /cors/check', 'ok в†’ cors');
              check(true);
            }, function () {
              lampacDebug('rch /cors/check', 'fail в†’ web');
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
      // С‚РѕРєРµРЅ РІ СЃС‚Р°С‚РёС‡РµСЃРєРѕР№ СЃР±РѕСЂРєРµ РЅРµ РёСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ вЂ” СЃРµСЂРІРµСЂРЅР°СЏ РїРѕРґСЃС‚Р°РЅРѕРІРєР° {token} РѕС‚РєР»СЋС‡РµРЅР°

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

      // Р РµРєРѕРјРµРЅРґР°С†РёРё РїРѕ С„РёР»СЊРјСѓ: Р±СЌРє-Р°РЅР°Р»РёС‚РёРєР° СЂР°РЅР¶РёСЂСѓРµС‚ РёСЃС‚РѕС‡РЅРёРєРё РїРѕ СЂРµР°Р»СЊРЅРѕРјСѓ
      // РєР°С‡РµСЃС‚РІСѓ РїСЂРѕСЃРјРѕС‚СЂР° (РґРѕСЃРјР°С‚СЂРёРІР°РµРјРѕСЃС‚СЊ + РґР»РёС‚РµР»СЊРЅРѕСЃС‚СЊ) РїРѕ РІСЃРµРј СЋР·РµСЂР°Рј.
      // РЎРїРёСЃРѕРє РїСЂРёС…РѕРґРёС‚ РёР· РїСЂРёР»РѕР¶РµРЅРёСЏ С‡РµСЂРµР· window.lampaSourceReco (СЃРј.
      // src/services/analytics.js). РРјРµРЅР° С‚Р°Рј вЂ” С‚Рµ Р¶Рµ РєР»СЋС‡Рё Р±Р°Р»Р°РЅСЃРµСЂРѕРІ РІ РЅРёР¶РЅРµРј
      // СЂРµРіРёСЃС‚СЂРµ, С‡С‚Рѕ Рё Сѓ РЅР°СЃ (СЃРј. balanserName), С‚Р°Рє С‡С‚Рѕ РјР°С‚С‡Р°С‚СЃСЏ РЅР°РїСЂСЏРјСѓСЋ.
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
        // 1) Р РµРєРѕРјРµРЅРґРѕРІР°РЅРЅС‹Рµ РґР»СЏ СЌС‚РѕРіРѕ С„РёР»СЊРјР° (РІ РїРѕСЂСЏРґРєРµ СѓР±С‹РІР°РЅРёСЏ РєР°С‡РµСЃС‚РІР°).
        var reco = recommendedBalansers();
        for (var r = 0; r < reco.length; r++) pin(reco[r]);
        // 2) РЎС‚Р°С‚РёС‡РЅС‹Р№ fallback-РїСЂРёРѕСЂРёС‚РµС‚.
        for (var i = 0; i < balanser_priority.length; i++) pin(balanser_priority[i]);
        // 3) РћСЃС‚Р°Р»СЊРЅС‹Рµ вЂ” РІ РёСЃС…РѕРґРЅРѕРј СЃРµСЂРІРµСЂРЅРѕРј РїРѕСЂСЏРґРєРµ.
        var rest = keys.filter(function (k) {
          return !seen[k];
        });
        return pinned.concat(rest);
      }

      // РЎС‚Р°С‚РёСЃС‚РёРєР° СЂРµРєРѕРјРµРЅРґР°С†РёР№ РїРѕ РёСЃС‚РѕС‡РЅРёРєР°Рј СЌС‚РѕРіРѕ С„РёР»СЊРјР° (РєР°СЂС‚Р° РєР»СЋС‡в†’РґР°РЅРЅС‹Рµ).
      function recoStats() {
        try {
          if (window.lampaSourceReco && window.lampaSourceReco.stats && object.movie && object.movie.id != null) {
            return window.lampaSourceReco.stats(object.movie.id) || {};
          }
        } catch (e) {}
        return {};
      }

      // РџРѕРґРїРёСЃСЊ РёСЃС‚РѕС‡РЅРёРєР° РІ СЃРїРёСЃРєРµ: Рє РЅР°Р·РІР°РЅРёСЋ РґРѕР±Р°РІР»СЏРµРј СЂРµР№С‚РёРЅРі (0..100 РїРѕ РґР°РЅРЅС‹Рј
      // Р·Р° РЅРµРґРµР»СЋ) Рё СЃРєРѕР»СЊРєРѕ Р»СЋРґРµР№ РµРіРѕ СЃРјРѕС‚СЂРµР»Рё (Г—100 РґР»СЏ РѕС‚РѕР±СЂР°Р¶РµРЅРёСЏ). Р•СЃР»Рё
      // РґР°РЅРЅС‹С… РЅРµС‚ вЂ” РїСЂРѕСЃС‚Рѕ РЅР°Р·РІР°РЅРёРµ.
      function sourceTitle(key, baseName) {
        var st = recoStats()[String(key).toLowerCase()];
        if (!st) return baseName;
        var rating = Math.round((st.score || 0) * 100); // 0..100
        var viewers = (st.viewers != null ? st.viewers : st.plays || 0) * 100;
        return baseName + '  в… ' + rating + ' В· ' + viewers + ' С‡РµР».';
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
        // Р—Р°СЂР°РЅРµРµ С‚СЏРЅРµРј СЂРµРєРѕРјРµРЅРґР°С†РёРё РёСЃС‚РѕС‡РЅРёРєРѕРІ РґР»СЏ СЌС‚РѕРіРѕ С„РёР»СЊРјР°, С‡С‚РѕР±С‹ Рє РјРѕРјРµРЅС‚Сѓ
        // СЃР±РѕСЂРєРё СЃРїРёСЃРєР° Р±Р°Р»Р°РЅСЃРµСЂРѕРІ (prioritizeBalansers) РѕРЅРё Р±С‹Р»Рё РІ РєРµС€Рµ.
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
          // life=true: Р±СЌРєРµРЅРґ РѕС‚РІРµС‡Р°РµС‚ СЃСЂР°Р·Сѓ СЃ memkey, Р° СЃР±РѕСЂ РёСЃС‚РѕС‡РЅРёРєРѕРІ РёРґС‘С‚ РІ С„РѕРЅРµ.
          // Р”Р°Р»СЊС€Рµ С„СЂРѕРЅС‚ РѕРїСЂР°С€РёРІР°РµС‚ /lifeevents С‡РµСЂРµР· lifeSource(), Рё РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ
          // РЅРµ Р·Р°РІРёСЃРёС‚ РѕС‚ С‚РѕРіРѕ, РєР°Рє РґРѕР»РіРѕ РѕС‚СЂР°Р±Р°С‚С‹РІР°РµС‚ В«СЃРёРЅС…СЂРѕРЅРЅР°СЏВ» Р°РіСЂРµРіР°С†РёСЏ.
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
       * РџРѕРґРіРѕС‚РѕРІРєР°
       */
      this.create = function () {
        return this.render();
      };
      /**
       * РќР°С‡Р°С‚СЊ РїРѕРёСЃРє
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
              if (text == 'РџРѕ СѓРјРѕР»С‡Р°РЅРёСЋ') {
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
                  // {player-inner} вЂ” СЃРµСЂРІРµСЂРЅС‹Р№ inject РѕС‚РєР»СЋС‡С‘РЅ РІ СЃС‚Р°С‚РёС‡РµСЃРєРѕР№ СЃР±РѕСЂРєРµ
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
          elem.info = info.join('<span class="online-prestige-split">в—Џ</span>');
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
       * РћС‡РёСЃС‚РёС‚СЊ СЃРїРёСЃРѕРє С„Р°Р№Р»РѕРІ
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
       * Р—Р°РіСЂСѓР·РєР°
       */
      this.loading = function (status) {
        if (status) this.activity.loader(true);else {
          this.activity.loader(false);
          this.activity.toggle();
        }
      };
      /**
       * РџРѕСЃС‚СЂРѕРёС‚СЊ С„РёР»СЊС‚СЂ
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
       * РџРѕРєР°Р·Р°С‚СЊ С‡С‚Рѕ РІС‹Р±СЂР°РЅРѕ РІ С„РёР»СЊС‚СЂРµ
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
       * РћС‚СЂРёСЃРѕРІРєР° С„Р°Р№Р»РѕРІ
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
            var voice_name = choice.voice_name || (filter_find.voice[0] ? filter_find.voice[0].title : false) || element.voice_name || (serial ? 'РќРµРёР·РІРµСЃС‚РЅРѕ' : element.text) || 'РќРµРёР·РІРµСЃС‚РЅРѕ';
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
            }).join('<span class="online-prestige-split">в—Џ</span>');
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
                }).join('<span class="online-prestige-split">в—Џ</span>') : '',
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
       * РњРµРЅСЋ
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
       * РџРѕРєР°Р·Р°С‚СЊ РїСѓСЃС‚РѕР№ СЂРµР·СѓР»СЊС‚Р°С‚
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
       * РќР°С‡Р°С‚СЊ РЅР°РІРёРіР°С†РёСЋ РїРѕ С„Р°Р№Р»Р°Рј
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
        description: 'РџР»Р°РіРёРЅ РґР»СЏ РїСЂРѕСЃРјРѕС‚СЂР° РѕРЅР»Р°Р№РЅ СЃРµСЂРёР°Р»РѕРІ Рё С„РёР»СЊРјРѕРІ',
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
          //
          ru: 'РЎРјРѕС‚СЂРµС‚СЊ РѕРЅР»Р°Р№РЅ',
          en: 'Watch online',
          uk: 'Р”РёРІРёС‚РёСЃСЏ РѕРЅР»Р°Р№РЅ',
          zh: 'ењЁзєїи§‚зњ‹'
        },
        lampac_video: {
          //
          ru: 'Р’РёРґРµРѕ',
          en: 'Video',
          uk: 'Р’С–РґРµРѕ',
          zh: 'и§†йў‘'
        },
        lampac_no_watch_history: {
          ru: 'РќРµС‚ РёСЃС‚РѕСЂРёРё РїСЂРѕСЃРјРѕС‚СЂР°',
          en: 'No browsing history',
          ua: 'РќРµРјР°С” С–СЃС‚РѕСЂС–С— РїРµСЂРµРіР»СЏРґСѓ',
          zh: 'жІЎжњ‰жµЏи§€еЋ†еЏІ'
        },
        lampac_nolink: {
          ru: 'РќРµ СѓРґР°Р»РѕСЃСЊ РёР·РІР»РµС‡СЊ СЃСЃС‹Р»РєСѓ',
          uk: 'РќРµРјРѕР¶Р»РёРІРѕ РѕС‚СЂРёРјР°С‚Рё РїРѕСЃРёР»Р°РЅРЅСЏ',
          en: 'Failed to fetch link',
          zh: 'иЋ·еЏ–й“ѕжЋҐе¤±иґҐ'
        },
        lampac_balanser: {
          //
          ru: 'РСЃС‚РѕС‡РЅРёРє',
          uk: 'Р”Р¶РµСЂРµР»Рѕ',
          en: 'Source',
          zh: 'жќҐжєђ'
        },
        lampac_balanser_hint: {
          //
          ru: 'Р•СЃР»Рё РєР°С‡РµСЃС‚РІРѕ РїР»РѕС…РѕРµ РёР»Рё РїР»РѕС…Рѕ РіСЂСѓР·РёС‚, РїРѕРїСЂРѕР±СѓР№С‚Рµ РїРµСЂРµРєР»СЋС‡РёС‚СЊ РёСЃС‚РѕС‡РЅРёРє',
          uk: 'РЇРєС‰Рѕ СЏРєС–СЃС‚СЊ РїРѕРіР°РЅР° Р°Р±Рѕ РїРѕРіР°РЅРѕ Р·Р°РІР°РЅС‚Р°Р¶СѓС”С‚СЊСЃСЏ, СЃРїСЂРѕР±СѓР№С‚Рµ РїРµСЂРµРєР»СЋС‡РёС‚Рё РґР¶РµСЂРµР»Рѕ',
          en: 'If the quality is poor or loading is slow, try switching the source',
          zh: 'е¦‚жћњз”»иґЁиѕѓе·®ж€–еЉ иЅЅзј“ж…ўпјЊиЇ·е°ќиЇ•е€‡жЌўжќҐжєђ'
        },
        helper_online_file: {
          //
          ru: 'РЈРґРµСЂР¶РёРІР°Р№С‚Рµ РєР»Р°РІРёС€Сѓ "РћРљ" РґР»СЏ РІС‹Р·РѕРІР° РєРѕРЅС‚РµРєСЃС‚РЅРѕРіРѕ РјРµРЅСЋ',
          uk: 'РЈС‚СЂРёРјСѓР№С‚Рµ РєР»Р°РІС–С€Сѓ "РћРљ" РґР»СЏ РІРёРєР»РёРєСѓ РєРѕРЅС‚РµРєСЃС‚РЅРѕРіРѕ РјРµРЅСЋ',
          en: 'Hold the "OK" key to bring up the context menu',
          zh: 'жЊ‰дЅЏвЂњзЎ®е®љвЂќй”®и°ѓе‡єдёЉдё‹ж–‡иЏњеЌ•'
        },
        title_online: {
          //
          ru: 'РћРЅР»Р°Р№РЅ',
          uk: 'РћРЅР»Р°Р№РЅ',
          en: 'Online',
          zh: 'ењЁзєїзљ„'
        },
        lampac_voice_subscribe: {
          //
          ru: 'РџРѕРґРїРёСЃР°С‚СЊСЃСЏ РЅР° РїРµСЂРµРІРѕРґ',
          uk: 'РџС–РґРїРёСЃР°С‚РёСЃСЏ РЅР° РїРµСЂРµРєР»Р°Рґ',
          en: 'Subscribe to translation',
          zh: 'и®ўй…зї»иЇ‘'
        },
        lampac_voice_success: {
          //
          ru: 'Р’С‹ СѓСЃРїРµС€РЅРѕ РїРѕРґРїРёСЃР°Р»РёСЃСЊ',
          uk: 'Р’Рё СѓСЃРїС–С€РЅРѕ РїС–РґРїРёСЃР°Р»РёСЃСЏ',
          en: 'You have successfully subscribed',
          zh: 'ж‚Ёе·Іж€ђеЉџи®ўй…'
        },
        lampac_voice_error: {
          //
          ru: 'Р’РѕР·РЅРёРєР»Р° РѕС€РёР±РєР°',
          uk: 'Р’РёРЅРёРєР»Р° РїРѕРјРёР»РєР°',
          en: 'An error has occurred',
          zh: 'еЏ‘з”џдє†й”™иЇЇ'
        },
        lampac_clear_all_marks: {
          //
          ru: 'РћС‡РёСЃС‚РёС‚СЊ РІСЃРµ РјРµС‚РєРё',
          uk: 'РћС‡РёСЃС‚РёС‚Рё РІСЃС– РјС–С‚РєРё',
          en: 'Clear all labels',
          zh: 'жё…й™¤ж‰Ђжњ‰ж ‡з­ѕ'
        },
        lampac_clear_all_timecodes: {
          //
          ru: 'РћС‡РёСЃС‚РёС‚СЊ РІСЃРµ С‚Р°Р№Рј-РєРѕРґС‹',
          uk: 'РћС‡РёСЃС‚РёС‚Рё РІСЃС– С‚Р°Р№Рј-РєРѕРґРё',
          en: 'Clear all timecodes',
          zh: 'жё…й™¤ж‰Ђжњ‰ж—¶й—ґд»Јз Ѓ'
        },
        lampac_change_balanser: {
          //
          ru: 'РР·РјРµРЅРёС‚СЊ Р±Р°Р»Р°РЅСЃРµСЂ',
          uk: 'Р—РјС–РЅРёС‚Рё Р±Р°Р»Р°РЅСЃРµСЂ',
          en: 'Change balancer',
          zh: 'ж›ґж”№е№іиЎЎе™Ё'
        },
        lampac_balanser_dont_work: {
          //
          ru: 'РџРѕРёСЃРє РЅР° ({balanser}) РЅРµ РґР°Р» СЂРµР·СѓР»СЊС‚Р°С‚РѕРІ',
          uk: 'РџРѕС€СѓРє РЅР° ({balanser}) РЅРµ РґР°РІ СЂРµР·СѓР»СЊС‚Р°С‚С–РІ',
          en: 'Search on ({balanser}) did not return any results',
          zh: 'жђњзґў ({balanser}) жњЄиї”е›ћд»»дЅ•з»“жћњ'
        },
        lampac_balanser_timeout: {
          //
          ru: 'РСЃС‚РѕС‡РЅРёРє Р±СѓРґРµС‚ РїРµСЂРµРєР»СЋС‡РµРЅ Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРё С‡РµСЂРµР· <span class="timeout">10</span> СЃРµРєСѓРЅРґ.',
          uk: 'Р”Р¶РµСЂРµР»Рѕ Р±СѓРґРµ Р°РІС‚РѕРјР°С‚РёС‡РЅРѕ РїРµСЂРµРєР»СЋС‡РµРЅРѕ С‡РµСЂРµР· <span class="timeout">10</span> СЃРµРєСѓРЅРґ.',
          en: 'The source will be switched automatically after <span class="timeout">10</span> seconds.',
          zh: 'е№іиЎЎе™Ёе°†ењЁ<span class="timeout">10</span>з§’е†…и‡ЄеЉЁе€‡жЌўгЂ‚'
        },
        lampac_does_not_answer_text: {
          ru: 'РџРѕРёСЃРє РЅР° ({balanser}) РЅРµ РґР°Р» СЂРµР·СѓР»СЊС‚Р°С‚РѕРІ',
          uk: 'РџРѕС€СѓРє РЅР° ({balanser}) РЅРµ РґР°РІ СЂРµР·СѓР»СЊС‚Р°С‚С–РІ',
          en: 'Search on ({balanser}) did not return any results',
          zh: 'жђњзґў ({balanser}) жњЄиї”е›ћд»»дЅ•з»“жћњ'
        },
        lampac_searching_fastest: {
          ru: 'РџРѕРґР±РёСЂР°РµРј РґР»СЏ РІР°СЃ СЃР°РјС‹Рµ Р±С‹СЃС‚СЂС‹Рµ РёСЃС‚РѕС‡РЅРёРєРё...',
          uk: 'РџС–РґР±РёСЂР°С”РјРѕ РґР»СЏ РІР°СЃ РЅР°Р№С€РІРёРґС€С– РґР¶РµСЂРµР»Р°...',
          en: 'Picking the fastest sources for you...',
          zh: 'ж­ЈењЁдёєж‚ЁжЊ‘йЂ‰жњЂеї«зљ„жќҐжєђ...'
        }
      });
      Lampa.Template.add('lampac_css', "\n        <style>\n        @charset 'UTF-8';.online-prestige{position:relative;-webkit-border-radius:.3em;border-radius:.3em;background-color:rgba(0,0,0,0.3);display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex}.online-prestige__body{padding:1.2em;line-height:1.3;-webkit-box-flex:1;-webkit-flex-grow:1;-moz-box-flex:1;-ms-flex-positive:1;flex-grow:1;position:relative}@media screen and (max-width:480px){.online-prestige__body{padding:.8em 1.2em}}.online-prestige__img{position:relative;width:13em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;min-height:8.2em}.online-prestige__img>img{position:absolute;top:0;left:0;width:100%;height:100%;-o-object-fit:cover;object-fit:cover;-webkit-border-radius:.3em;border-radius:.3em;opacity:0;-webkit-transition:opacity .3s;-o-transition:opacity .3s;-moz-transition:opacity .3s;transition:opacity .3s}.online-prestige__img--loaded>img{opacity:1}@media screen and (max-width:480px){.online-prestige__img{width:7em;min-height:6em}}.online-prestige__folder{padding:1em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.online-prestige__folder>svg{width:4.4em !important;height:4.4em !important}.online-prestige__viewed{position:absolute;top:1em;left:1em;background:rgba(0,0,0,0.45);-webkit-border-radius:100%;border-radius:100%;padding:.25em;font-size:.76em}.online-prestige__viewed>svg{width:1.5em !important;height:1.5em !important}.online-prestige__episode-number{position:absolute;top:0;left:0;right:0;bottom:0;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;-moz-box-pack:center;-ms-flex-pack:center;justify-content:center;font-size:2em}.online-prestige__loader{position:absolute;top:50%;left:50%;width:2em;height:2em;margin-left:-1em;margin-top:-1em;background:url(./img/loader.svg) no-repeat center center;-webkit-background-size:contain;-o-background-size:contain;background-size:contain}.online-prestige__head,.online-prestige__footer{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-pack:justify;-webkit-justify-content:space-between;-moz-box-pack:justify;-ms-flex-pack:justify;justify-content:space-between;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.online-prestige__timeline{margin:.8em 0}.online-prestige__timeline>.time-line{display:block !important}.online-prestige__title{font-size:1.7em;overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;line-clamp:1;-webkit-box-orient:vertical}@media screen and (max-width:480px){.online-prestige__title{font-size:1.4em}}.online-prestige__time{padding-left:2em}.online-prestige__info{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.online-prestige__info>*{overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;line-clamp:1;-webkit-box-orient:vertical}.online-prestige__quality{padding-left:1em;white-space:nowrap}.online-prestige__scan-file{position:absolute;bottom:0;left:0;right:0}.online-prestige__scan-file .broadcast__scan{margin:0}.online-prestige .online-prestige-split{font-size:.8em;margin:0 1em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.online-prestige.focus::after{content:'';position:absolute;top:-0.6em;left:-0.6em;right:-0.6em;bottom:-0.6em;-webkit-border-radius:.7em;border-radius:.7em;border:solid .3em #fff;z-index:-1;pointer-events:none}.online-prestige+.online-prestige{margin-top:1.5em}.online-prestige--folder .online-prestige__footer{margin-top:.8em}.online-prestige-watched{padding:1em}.online-prestige-watched__icon>svg{width:1.5em;height:1.5em}.online-prestige-watched__body{padding-left:1em;padding-top:.1em;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap}.online-prestige-watched__body>span+span::before{content:' в—Џ ';vertical-align:top;display:inline-block;margin:0 .5em}.online-prestige-rate{display:-webkit-inline-box;display:-webkit-inline-flex;display:-moz-inline-box;display:-ms-inline-flexbox;display:inline-flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.online-prestige-rate>svg{width:1.3em !important;height:1.3em !important}.online-prestige-rate>span{font-weight:600;font-size:1.1em;padding-left:.7em}.online-empty{line-height:1.4}.online-empty__title{font-size:1.8em;margin-bottom:.3em}.online-empty__time{font-size:1.2em;font-weight:300;margin-bottom:1.6em}.online-empty__buttons{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex}.online-empty__buttons>*+*{margin-left:1em}.online-empty__button{background:rgba(0,0,0,0.3);font-size:1.2em;padding:.5em 1.2em;-webkit-border-radius:.2em;border-radius:.2em;margin-bottom:2.4em}.online-empty__button.focus{background:#fff;color:black}.online-empty__templates .online-empty-template:nth-child(2){opacity:.5}.online-empty__templates .online-empty-template:nth-child(3){opacity:.2}.online-empty-template{background-color:rgba(255,255,255,0.3);padding:1em;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;-webkit-border-radius:.3em;border-radius:.3em}.online-empty-template>*{background:rgba(0,0,0,0.3);-webkit-border-radius:.3em;border-radius:.3em}.online-empty-template__ico{width:4em;height:4em;margin-right:2.4em}.online-empty-template__body{height:1.7em;width:70%}.online-empty-template+.online-empty-template{margin-top:1em}\n        </style>\n    ");
      $('body').append(Lampa.Template.get('lampac_css', {}, true));
      $('body').append('<style>.lampac-balanser-hint{display:flex;align-items:center;gap:1em;margin:.8em 0 0;padding:1.1em 1.3em;border-left:.3em solid #f8c24e;border-radius:.35em;background:rgba(248,194,78,.16);color:rgba(255,255,255,.92);font-size:1.15em;line-height:1.4}.lampac-balanser-hint:before{content:"!";display:flex;align-items:center;justify-content:center;flex-shrink:0;width:1.6em;height:1.6em;border-radius:50%;background:#f8c24e;color:#1b1b1b;font-weight:700;font-size:1.05em}.lampac-loading-title{font-size:1.4em;font-weight:300;margin-bottom:1em;opacity:.85}</style>');
      function resetTemplates() {
        Lampa.Template.add('lampac_prestige_full', "<div class=\"online-prestige online-prestige--full selector\">\n            <div class=\"online-prestige__img\">\n                <img alt=\"\">\n                <div class=\"online-prestige__loader\"></div>\n            </div>\n            <div class=\"online-prestige__body\">\n                <div class=\"online-prestige__head\">\n                    <div class=\"online-prestige__title\">{title}</div>\n                    <div class=\"online-prestige__time\">{time}</div>\n                </div>\n\n                <div class=\"online-prestige__timeline\"></div>\n\n                <div class=\"online-prestige__footer\">\n                    <div class=\"online-prestige__info\">{info}</div>\n                    <div class=\"online-prestige__quality\">{quality}</div>\n                </div>\n            </div>\n        </div>");
        Lampa.Template.add('lampac_content_loading', "<div class=\"online-empty\">\n            <div class=\"online-empty__title lampac-loading-title\">#{lampac_searching_fastest}</div>\n            <div class=\"broadcast__scan\"><div></div></div>\n\t\t\t\n            <div class=\"online-empty__templates\">\n                <div class=\"online-empty-template selector\">\n                    <div class=\"online-empty-template__ico\"></div>\n                    <div class=\"online-empty-template__body\"></div>\n                </div>\n                <div class=\"online-empty-template\">\n                    <div class=\"online-empty-template__ico\"></div>\n                    <div class=\"online-empty-template__body\"></div>\n                </div>\n                <div class=\"online-empty-template\">\n                    <div class=\"online-empty-template__ico\"></div>\n                    <div class=\"online-empty-template__body\"></div>\n                </div>\n            </div>\n        </div>");
        Lampa.Template.add('lampac_does_not_answer', "<div class=\"online-empty\">\n            <div class=\"online-empty__title\">\n                #{lampac_balanser_dont_work}\n            </div>\n            <div class=\"online-empty__time\">\n                #{lampac_balanser_timeout}\n            </div>\n            <div class=\"online-empty__buttons\">\n                <div class=\"online-empty__button selector cancel\">#{cancel}</div>\n                <div class=\"online-empty__button selector change\">#{lampac_change_balanser}</div>\n            </div>\n            <div class=\"online-empty__templates\">\n                <div class=\"online-empty-template\">\n                    <div class=\"online-empty-template__ico\"></div>\n                    <div class=\"online-empty-template__body\"></div>\n                </div>\n                <div class=\"online-empty-template\">\n                    <div class=\"online-empty-template__ico\"></div>\n                    <div class=\"online-empty-template__body\"></div>\n                </div>\n                <div class=\"online-empty-template\">\n                    <div class=\"online-empty-template__ico\"></div>\n                    <div class=\"online-empty-template__body\"></div>\n                </div>\n            </div>\n        </div>");
        Lampa.Template.add('lampac_prestige_rate', "<div class=\"online-prestige-rate\">\n            <svg width=\"17\" height=\"16\" viewBox=\"0 0 17 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                <path d=\"M8.39409 0.192139L10.99 5.30994L16.7882 6.20387L12.5475 10.4277L13.5819 15.9311L8.39409 13.2425L3.20626 15.9311L4.24065 10.4277L0 6.20387L5.79819 5.30994L8.39409 0.192139Z\" fill=\"#fff\"></path>\n            </svg>\n            <span>{rate}</span>\n        </div>");
        Lampa.Template.add('lampac_prestige_folder', "<div class=\"online-prestige online-prestige--folder selector\">\n            <div class=\"online-prestige__folder\">\n                <svg viewBox=\"0 0 128 112\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                    <rect y=\"20\" width=\"128\" height=\"92\" rx=\"13\" fill=\"white\"></rect>\n                    <path d=\"M29.9963 8H98.0037C96.0446 3.3021 91.4079 0 86 0H42C36.5921 0 31.9555 3.3021 29.9963 8Z\" fill=\"white\" fill-opacity=\"0.23\"></path>\n                    <rect x=\"11\" y=\"8\" width=\"106\" height=\"76\" rx=\"13\" fill=\"white\" fill-opacity=\"0.51\"></rect>\n                </svg>\n            </div>\n            <div class=\"online-prestige__body\">\n                <div class=\"online-prestige__head\">\n                    <div class=\"online-prestige__title\">{title}</div>\n                    <div class=\"online-prestige__time\">{time}</div>\n                </div>\n\n                <div class=\"online-prestige__footer\">\n                    <div class=\"online-prestige__info\">{info}</div>\n                </div>\n            </div>\n        </div>");
        Lampa.Template.add('lampac_prestige_watched', "<div class=\"online-prestige online-prestige-watched selector\">\n            <div class=\"online-prestige-watched__icon\">\n                <svg width=\"21\" height=\"21\" viewBox=\"0 0 21 21\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                    <circle cx=\"10.5\" cy=\"10.5\" r=\"9\" stroke=\"currentColor\" stroke-width=\"3\"/>\n                    <path d=\"M14.8477 10.5628L8.20312 14.399L8.20313 6.72656L14.8477 10.5628Z\" fill=\"currentColor\"/>\n                </svg>\n            </div>\n            <div class=\"online-prestige-watched__body\">\n                \n            </div>\n        </div>");
      }
      var button = "<div class=\"full-start__button selector view--online lampac--button\" data-subtitle=\"".concat(manifst.name, " v").concat(manifst.version, "\">\n        <svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" viewBox=\"0 0 392.697 392.697\" xml:space=\"preserve\">\n            <path d=\"M21.837,83.419l36.496,16.678L227.72,19.886c1.229-0.592,2.002-1.846,1.98-3.209c-0.021-1.365-0.834-2.592-2.082-3.145\n                L197.766,0.3c-0.903-0.4-1.933-0.4-2.837,0L21.873,77.036c-1.259,0.559-2.073,1.803-2.081,3.18\n                C19.784,81.593,20.584,82.847,21.837,83.419z\" fill=\"currentColor\"></path>\n            <path d=\"M185.689,177.261l-64.988-30.01v91.617c0,0.856-0.44,1.655-1.167,2.114c-0.406,0.257-0.869,0.386-1.333,0.386\n                c-0.368,0-0.736-0.082-1.079-0.244l-68.874-32.625c-0.869-0.416-1.421-1.293-1.421-2.256v-92.229L6.804,95.5\n                c-1.083-0.496-2.344-0.406-3.347,0.238c-1.002,0.645-1.608,1.754-1.608,2.944v208.744c0,1.371,0.799,2.615,2.045,3.185\n                l178.886,81.768c0.464,0.211,0.96,0.315,1.455,0.315c0.661,0,1.318-0.188,1.892-0.555c1.002-0.645,1.608-1.754,1.608-2.945\n                V180.445C187.735,179.076,186.936,177.831,185.689,177.261z\" fill=\"currentColor\"></path>\n            <path d=\"M389.24,95.74c-1.002-0.644-2.264-0.732-3.347-0.238l-178.876,81.76c-1.246,0.57-2.045,1.814-2.045,3.185v208.751\n                c0,1.191,0.606,2.302,1.608,2.945c0.572,0.367,1.23,0.555,1.892,0.555c0.495,0,0.991-0.104,1.455-0.315l178.876-81.768\n                c1.246-0.568,2.045-1.813,2.045-3.185V98.685C390.849,97.494,390.242,96.384,389.24,95.74z\" fill=\"currentColor\"></path>\n            <path d=\"M372.915,80.216c-0.009-1.377-0.823-2.621-2.082-3.18l-60.182-26.681c-0.938-0.418-2.013-0.399-2.938,0.045\n                l-173.755,82.992l60.933,29.117c0.462,0.211,0.958,0.316,1.455,0.316s0.993-0.105,1.455-0.316l173.066-79.092\n                C372.122,82.847,372.923,81.593,372.915,80.216z\" fill=\"currentColor\"></path>\n        </svg>\n\n        <span>#{title_online}</span>\n    </div>"); // РЅСѓР¶РЅР° Р·Р°РіР»СѓС€РєР°, Р° С‚Рѕ РїСЂРё СЃС‚СЂР°С‚Рµ Р»Р°РјРїС‹ РіРѕРІРѕСЂРёС‚ РїСѓСЃС‚Рѕ
      Lampa.Component.add('lampac', component); //С‚Рѕ Р¶Рµ СЃР°РјРѕРµ
      resetTemplates();
      function addButton(e) {
        if (e.render.find('.lampac--button').length) return;
        if (!e.render || !e.render.length) {
          lampacDebug('addButton: render-anchor missing');
          return;
        }
        lampacDebug('addButton', {
          has_movie: !!e.movie,
          title: e.movie && (e.movie.title || e.movie.original_title)
        });
        var btn = $(Lampa.Lang.translate(button));
        // //console.log(btn.clone().removeClass('focus').prop('outerHTML'))
        btn.on('hover:enter', function () {
          try {
            lampacDebug('click: online button');
            resetTemplates();
            Lampa.Component.add('lampac', component);
            if (!e.movie) {
              lampacDebug('click: e.movie is empty!');
              return;
            }
            var id = Lampa.Utils.hash(e.movie.number_of_seasons ? e.movie.original_name : e.movie.original_title);
            var all = Lampa.Storage.get('clarification_search', '{}');
            lampacDebug('click: pushing activity');
            Lampa.Activity.push({
              url: '',
              title: Lampa.Lang.translate('title_online'),
              component: 'lampac',
              search: all[id] ? all[id] : e.movie.title,
              search_one: e.movie.title,
              search_two: e.movie.original_title,
              movie: e.movie,
              page: 1,
              clarification: all[id] ? true : false
            });
            lampacDebug('click: activity.push returned');
          } catch (err) {
            lampacDebug('click ERROR', err && (err.message || err.stack) || String(err));
          }
        });
        e.render.after(btn);
      }
      Lampa.Listener.follow('full', function (e) {
        if (e.type == 'complite') {
          lampacDebug('full:complite в†’ addButton');
          addButton({
            render: e.object.activity.render().find('.view--torrent'),
            movie: e.data.movie
          });
        }
      });
      try {
        if (Lampa.Activity.active().component == 'full') {
          addButton({
            render: Lampa.Activity.active().activity.render().find('.view--torrent'),
            movie: Lampa.Activity.active().card
          });
        }
      } catch (e) {}
      // РЎРёРЅС…СЂРѕРЅРёР·Р°С†РёСЏ online_choice_* Рё online_watched_last СЃ CUB-Р±СЌРєРµРЅРґРѕРј РѕС‚РєР»СЋС‡РµРЅР° вЂ”
      // 50+ GET'РѕРІ /api/storage/data/... РїСЂРё СЃС‚Р°СЂС‚Рµ СЃРѕР·РґР°РІР°Р»Рё Р»РёС€РЅРёР№ С€СѓРј, РІС‹Р±РѕСЂ Р±Р°Р»Р°РЅСЃС‘СЂР° РѕСЃС‚Р°С‘С‚СЃСЏ С‚РѕР»СЊРєРѕ Р»РѕРєР°Р»СЊРЅС‹Рј.
    }
    // РЎРЅР°С‡Р°Р»Р° health-РїСЂРѕР±Р° С…РѕСЃС‚РѕРІ, Р·Р°С‚РµРј С„РёРєСЃР°С†РёСЏ СЂР°Р±РѕС‡РµРіРѕ С…РѕСЃС‚Р° РЅР° СЃРµСЃСЃРёСЋ Рё СЃС‚Р°СЂС‚ РїР»Р°РіРёРЅР°.
    // РџСЂРѕР±Р° РёРґС‘С‚ РїР°СЂР°Р»Р»РµР»СЊРЅРѕ (~РґРѕ 5СЃ РІ С…СѓРґС€РµРј СЃР»СѓС‡Р°Рµ, РѕР±С‹С‡РЅРѕ <1СЃ); РµСЃР»Рё РїР»Р°РіРёРЅ СЃС‚Р°СЂС‚СѓРµС‚
    // РїРѕР·Р¶Рµ РїРµСЂРІРѕР№ РѕС‚РєСЂС‹С‚РѕР№ РєР°СЂС‚РѕС‡РєРё, startPlugin() СЃР°Рј РґРѕР±Р°РІРёС‚ РєРЅРѕРїРєСѓ РЅР° Р°РєС‚РёРІРЅСѓСЋ РєР°СЂС‚РѕС‡РєСѓ.
    function bootLampac() {
      lampacFetchHosts(function (remote) {
        var pool = remote && remote.length ? remote : LAMPAC_HOSTS;
        lampacDebug('hosts source', {
          fromBackend: !!(remote && remote.length),
          count: pool.length
        });
        lampacPickHost(pool, function (localhost) {
          Defined.localhost = localhost || 'https://' + pool[0] + '/';
          lampacDebug('loaded', {
            host: Defined.localhost,
            platform: window.Lampa && Lampa.Platform && (Lampa.Platform.get ? Lampa.Platform.get() : 'unknown')
          });
          initRch();
          startPlugin();
        });
      });
    }
    if (!window.lampac_plugin) {
      lampacDebug('IIFE end в†’ probe + boot');
      bootLampac();
    } else {
      lampacDebug('IIFE end (already loaded)');
    }
  })();

})();

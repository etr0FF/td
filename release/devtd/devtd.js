(function () {
  'use strict';

  function client$1(selectedTorrent, options) {
    var newItem = {
      title: '<p id="qBittorentgetStatusBtn">qBittorrent</p>',
      onSelect: function onSelect() {
        if (selectedTorrent) {
          Lampa.Noty.show("fine");
          qBittorrentClient(selectedTorrent);
        } else {
          Lampa.Noty.show("Magnet link not found");
        }
      }
    };
    var existingItem = options.items.find(function (item) {
      return item.title === newItem.title;
    });
    if (!existingItem) {
      options.items.push(newItem);
      typeof Lampa.Storage.get("qBittorentUrl") !== 'undefined' && typeof Lampa.Storage.get("qBittorentPort") !== 'undefined' && typeof Lampa.Storage.get("qBittorentUser") !== 'undefined' && typeof Lampa.Storage.get("qBittorentPass") !== 'undefined' && getStatus$1();
    }
  }
  function qBittorrentClient(selectedTorrent) {
    if (!selectedTorrent.MagnetUri) {
      Lampa.Parser.marnet(selectedTorrent, function () {
        Lampa.Noty.show("Magnet loaded");
      }, function (error) {
        console.error("Error loading magnet:", error);
        Lampa.Noty.show("Error loading magnet:", error);
      });
    }
    if (selectedTorrent.MagnetUri) {
      // Authentication request
      var authXhr = new XMLHttpRequest();
      authXhr.open("GET", "".concat(Lampa.Storage.get("qBittorentProtocol") || "http://").concat(Lampa.Storage.get("qBittorentUrl"), ":").concat(Lampa.Storage.get("qBittorentPort"), "/api/v2/auth/login?username=").concat(Lampa.Storage.get("qBittorentUser"), "&password=").concat(Lampa.Storage.get("qBittorentPass")), true);
      authXhr.onreadystatechange = function () {
        if (authXhr.readyState === 4) {
          // Add torrent request
          var addXhr = new XMLHttpRequest();
          addXhr.open("POST", "".concat(Lampa.Storage.get("qBittorentProtocol") || "http://").concat(Lampa.Storage.get("qBittorentUrl"), ":").concat(Lampa.Storage.get("qBittorentPort"), "/api/v2/torrents/add"), true);
          addXhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
          addXhr.onreadystatechange = function () {
            if (addXhr.readyState === 4) {
              // Get torrent list to find the hash of the last added torrent
              var listXhr = new XMLHttpRequest();
              listXhr.open("GET", "".concat(Lampa.Storage.get("qBittorentProtocol") || "http://").concat(Lampa.Storage.get("qBittorentUrl"), ":").concat(Lampa.Storage.get("qBittorentPort"), "/api/v2/torrents/info?sort=added_on&reverse=true"), true);
              listXhr.onreadystatechange = function () {
                Lampa.Noty.show("Bad" + JSON.parse(listXhr.responseText));
                if (listXhr.readyState === 4) {
                  var torrents = JSON.parse(listXhr.responseText);
                  var lastAddedTorrent = torrents[0].hash; // Assuming the first one is the last added

                  // Set first/last piece priority
                  var firstXhr = new XMLHttpRequest();
                  firstXhr.open("GET", "".concat(Lampa.Storage.get("qBittorentProtocol") || "http://").concat(Lampa.Storage.get("qBittorentUrl"), ":").concat(Lampa.Storage.get("qBittorentPort"), "/api/v2/torrents/toggleFirstLastPiecePrio?hashes=").concat(lastAddedTorrent), true);
                  firstXhr.onreadystatechange = function () {
                    if (firstXhr.readyState === 4) {
                      // Toggle sequential download
                      var toggleXhr = new XMLHttpRequest();
                      toggleXhr.open("GET", "".concat(Lampa.Storage.get("qBittorentProtocol") || "http://").concat(Lampa.Storage.get("qBittorentUrl"), ":").concat(Lampa.Storage.get("qBittorentPort"), "/api/v2/torrents/toggleSequentialDownload?hashes=").concat(lastAddedTorrent), true);
                      toggleXhr.onreadystatechange = function () {
                        if (toggleXhr.readyState === 4) {
                          Lampa.Noty.show("Torrent is being downloaded in qBittorrent");
                        }
                      };
                      toggleXhr.send();
                    }
                  };
                  firstXhr.send();
                }
              };
              listXhr.send();
            }
          };
          var data = "urls=" + encodeURIComponent(selectedTorrent.MagnetUri);
          addXhr.send(data);
        } else {
          Lampa.Noty.show("Authentication failed");
        }
      };
      authXhr.send();
    }
    setTimeout(function () {
      Lampa.Select.close();
    }, 10);
  }


  function getStatus$1() {
    var statusXhr = new XMLHttpRequest();
    statusXhr.withCredentials = false;
    statusXhr.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        if (this.status === 200) {
          $('#qBittorentgetStatus').removeClass('active error wait').addClass('active');
          $("#qBittorentgetStatusBtn").text(function (i, text) {
            return "🟢 " + text;
          });
        } else if (this.status === undefined) {
          $('#qBittorentgetStatus').removeClass('active error wait').addClass('error');
          $("#qBittorentgetStatusBtn").text(function (i, text) {
            return "🔴 " + text;
          });
        } else {
          $('#qBittorentgetStatus').removeClass('active error wait').addClass('error');
          $("#qBittorentgetStatusBtn").text(function (i, text) {
            return "🔴 " + text;
          });
        }
      }
    });
    statusXhr.open("POST", "".concat(Lampa.Storage.get("qBittorentProtocol") || "http://").concat(Lampa.Storage.get("qBittorentUrl"), ":").concat(Lampa.Storage.get("qBittorentPort"), "/api/v2/auth/login?username=").concat(Lampa.Storage.get("qBittorentUser"), "&password=").concat(Lampa.Storage.get("qBittorentPass")));
    statusXhr.send();
  }
  var qBittorent = {
    client: client$1,
    getStatus: getStatus$1
  };

  function client(selectedTorrent, options) {
    var newItem = {
      title: '<p id="transmissionStatusBtn">Transmission</p>',
      onSelect: function onSelect() {
        if (selectedTorrent) {
          Lampa.Noty.show("fine");
          transmissionClient(selectedTorrent);
        } else {
          Lampa.Noty.show("Magnet link not found");
        }
      }
    };
    var existingItem = options.items.find(function (item) {
      return item.title === newItem.title;
    });
    if (!existingItem) {
      options.items.push(newItem);
      typeof Lampa.Storage.get("transmissionUrl") !== 'undefined' && typeof Lampa.Storage.get("transmissionPort") !== 'undefined' && typeof Lampa.Storage.get("transmissionUser") !== 'undefined' && typeof Lampa.Storage.get("transmissionPass") !== 'undefined' && getStatus();
    }
  }
  function transmissionClient(selectedTorrent) {
    if (!selectedTorrent.MagnetUri) {
      Lampa.Parser.marnet(selectedTorrent, function () {
        Lampa.Noty.show("Magnet loaded");
      }, function (error) {
        console.error("Error loading magnet:", error);
        Lampa.Noty.show("Error loading magnet:", error);
      });
    }
    if (selectedTorrent.MagnetUri) {
      // WARNING: For GET requests, body is set to null by browsers.
      var authXhr = new XMLHttpRequest();
      authXhr.withCredentials = false;
      authXhr.addEventListener("readystatechange", function () {
        if (authXhr.readyState === 4 & authXhr.status === 409) {
          var addXhr = new XMLHttpRequest();
          Lampa.Noty.show("Login with status " + authXhr.status);
          //Try add torrent
          var data = JSON.stringify({
            method: "torrent-add",
            arguments: {
              paused: Lampa.Storage.get("transmissionAutostart"),
              filename: selectedTorrent.MagnetUri.split("&")[0]
            }
          });
          addXhr.open("POST", "".concat(Lampa.Storage.get("transmissionProtocol") || "http://").concat(Lampa.Storage.get("transmissionUrl"), ":").concat(Lampa.Storage.get("transmissionPort")).concat(Lampa.Storage.get("transmissionPath")));
          addXhr.setRequestHeader("X-Transmission-Session-Id", this.getResponseHeader("X-Transmission-Session-Id"));
          addXhr.setRequestHeader("Content-Type", "application/json");
          addXhr.setRequestHeader("Authorization", "Basic ".concat(btoa(Lampa.Storage.get("transmissionUser") + ":" + Lampa.Storage.get("transmissionPass"))));
          addXhr.send(data);
          addXhr.addEventListener("readystatechange", function () {
            if (addXhr.readyState === 4 & addXhr.status === 200) {
              Lampa.Noty.show("Torrent add success");
            } else if (addXhr.status != 200) {
              Lampa.Noty.show("Something wrong " + addXhr.status);
            }
          });
        }
      });
      authXhr.open("POST", "".concat(Lampa.Storage.get("transmissionProtocol") || "http://").concat(Lampa.Storage.get("transmissionUrl"), ":").concat(Lampa.Storage.get("transmissionPort")).concat(Lampa.Storage.get("transmissionPath")));
      authXhr.setRequestHeader("Authorization", "Basic ".concat(btoa(Lampa.Storage.get("transmissionUser") + ":" + Lampa.Storage.get("transmissionPass"))));
      authXhr.send();
    }
    setTimeout(function () {
      Lampa.Select.close();
    }, 10);
  }
  function getStatus() {
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = false;
    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        if (this.status === 200 || this.status === 409) {
          $('#transmissionStatus').removeClass('active error wait').addClass('active');
          $("#transmissionStatusBtn").text(function (i, text) {
            return "🟢 " + text;
          });
        } else if (this.status === undefined) {
          $('#transmissionStatus').removeClass('active error wait').addClass('error');
          $("#transmissionStatusBtn").text(function (i, text) {
            return "🔴 " + text;
          });
        } else {
          $('#transmissionStatus').removeClass('active error wait').addClass('error');
          $("#transmissionStatusBtn").text(function (i, text) {
            return "🔴 " + text;
          });
        }
      }
    });
    xhr.open("POST", "".concat(Lampa.Storage.get("transmissionProtocol") || "http://").concat(Lampa.Storage.get("transmissionUrl"), ":").concat(Lampa.Storage.get("transmissionPort")).concat(Lampa.Storage.get("transmissionPath") || "/transmission/rpc"));
    xhr.setRequestHeader("Authorization", "Basic ".concat(btoa(Lampa.Storage.get("transmissionUser") + ":" + Lampa.Storage.get("transmissionPass"))));
    xhr.send();
  }
  var transmission = {
    client: client,
    getStatus: getStatus
  };

  function downloader() {
    Lampa.Listener.follow("torrent", function (e) {
      if (e.type === "onlong") {
        /* @preserve */
        var selectedTorrent = e.element;
        /* @preserve */
        var originalSelectShow = Lampa.Select.show;
        if (Lampa.Storage.field("td_qBittorent") === true) ;
        /* Transmission */
        if (Lampa.Storage.field("td_transmission") === true) ;
        // Override Select.show with custom functionality    
        Lampa.Select.show = function (options) {
          /* qBittorent */
          if (Lampa.Storage.field("td_qBittorent") === true) {
            qBittorent.client(selectedTorrent, options);
          }
          /* Transmission */
          if (Lampa.Storage.field("td_transmission") === true) {
            transmission.client(selectedTorrent, options);
          }
          originalSelectShow.call(this, options);
        };
      }
    });
  }
  var Client = {
    downloader: downloader
  };

  function setMenu() {
    //Создание пункта меню
    Lampa.SettingsApi.addComponent({
      component: "torrentDownloader",
      name: "Torrent downloader",
      //Задаём название меню
      icon: '<svg width="800" height="800" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg"> <path fill-rule="evenodd" clip-rule="evenodd" d="M150 250L350 50V250H150Z" fill="white"/> <path fill-rule="evenodd" clip-rule="evenodd" d="M350 50L150 250H350V50ZM400 50V300H356V435C356 446.67 360.636 457.861 368.887 466.113C377.139 474.364 388.33 479 400 479C412.195 477.526 423.422 471.614 431.537 462.393C439.652 453.171 444.089 441.284 444 429V300H513V560C500.798 557.619 489.218 552.75 478.981 545.696C468.744 538.642 460.07 529.554 453.5 519C439.162 528.333 422.669 533.832 405.598 534.97C388.527 536.108 371.45 532.847 356 525.5V650H286.5V300H150V750H650V50H400Z" fill="white"/> </svg>'
    });
    /* Menu */
    Lampa.Settings.listener.follow("open", function (e) {
      /* Legacy */
      if (e.name == "main") {
        if (Lampa.Settings.main().render().find('[data-component="qBittorent"]').length == 0) {
          Lampa.SettingsApi.addComponent({
            component: "qBittorent",
            name: "qBittorent"
          });
        }
        Lampa.Settings.main().update();
        Lampa.Settings.main().render().find('[data-component="qBittorent"]').addClass("hide");
      }
      if (e.name == "main") {
        if (Lampa.Settings.main().render().find('[data-component="transmission"]').length == 0) {
          Lampa.SettingsApi.addComponent({
            component: "transmission",
            name: "transmission"
          });
        }
        Lampa.Settings.main().update();
        Lampa.Settings.main().render().find('[data-component="transmission"]').addClass("hide");
      }
      if (e.name == "main") {
        if (Lampa.Settings.main().render().find('[data-component="td_info"]').length == 0) {
          Lampa.SettingsApi.addComponent({
            component: "td_info",
            name: "td_info"
          });
        }
        Lampa.Settings.main().update();
        Lampa.Settings.main().render().find('[data-component="td_info"]').addClass("hide");
      }
      /* Legace END */
    });
    var COMPONENT_NAME = "torrentDownloader";
    var PARAM_TYPE = {
      SELECT: "select",
      INPUT: "input",
      TRIGGER: "trigger",
      TITLE: "title",
      STATIC: "static"
    };
    var PLUGIN_COMPONENT = "td_info";
    Lampa.SettingsApi.addParam({
      component: COMPONENT_NAME,
      param: {
        name: "tdDependencies",
        type: PARAM_TYPE.TITLE,
        "default": true
      },
      field: {
        name: "\u041F\u0430\u0440\u0441\u0435\u0440 - ".concat(Lampa.Storage.get("parser_use") ? "🟢" : "🔴"),
        description: "Для корректной работы должен быть активирован парсер"
      }
    });
    Lampa.SettingsApi.addParam({
      component: COMPONENT_NAME,
      param: {
        name: "tdInfo",
        type: PARAM_TYPE.STATIC,
        "default": true
      },
      field: {
        name: "О плагине",
        description: "Информация"
      },
      onRender: function onRender(item) {
        item.show();
        var paramNameElement = $(".settings-param__name", item);
        paramNameElement.before('<div class="settings-param__status"></div>');
        item.on("hover:enter", function () {
          Lampa.Settings.create("td_info");
          var enabledController = Lampa.Controller.enabled();
          enabledController.controller.back = function () {
            Lampa.Settings.create(COMPONENT_NAME);
          };
        });
      }
    });
    /* Info block */

    Lampa.SettingsApi.addParam({
      component: PLUGIN_COMPONENT,
      param: {
        name: "group",
        type: "static"
      },
      field: {
        name: "<img src=\"https://cdn.glitch.global/d9956867-398e-4a85-9c42-31911adc9981/groupLTD.jpg?v=1702216657917\" alt=\"GroupLTD\" width=\"100%\" height=\"auto\">",
        description: "Группа плагина Torrent downloader"
      }
    });
    Lampa.SettingsApi.addParam({
      component: PLUGIN_COMPONENT,
      param: {
        name: "group",
        type: "static"
      },
      field: {
        name: "<b>Описание</b>",
        description: "\u041F\u043B\u0430\u0433\u0438\u043D \u0441\u043B\u0443\u0436\u0438\u0442 \u0434\u043B\u044F \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u0442\u043E\u0440\u0440\u0435\u043D\u0442\u043E\u0432 \u0441\u0440\u0435\u0434\u0441\u0442\u0432\u0430\u043C\u0438 Torrent \u043A\u043B\u0438\u0435\u043D\u0442\u043E\u0432. \u0412\u044B\u0437\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u0447\u0435\u0440\u0435\u0437 \u043A\u043E\u043D\u0442\u0435\u043A\u0441\u0442\u043D\u043E\u0435 \u043C\u0435\u043D\u044E \u043D\u0430 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u0439 \u0440\u0430\u0437\u0434\u0430\u0447\u0435<br>\u041E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0437\u0430\u0432\u0438\u0441\u0438\u043C\u043E\u0441\u0442\u0438 - \u0410\u043A\u0442\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u043F\u0430\u0440\u0441\u0435\u0440 \u0434\u043B\u044F \u0442\u043E\u0440\u0440\u0435\u043D\u0442\u043E\u0432. Torrserver \u041D\u0415 \u0422\u0420\u0415\u0411\u0423\u0415\u0422\u0421\u042F<br>\u041F\u043E\u0436\u0435\u043B\u0430\u043D\u0438\u044F \u043F\u043E \u043A\u043B\u0438\u0435\u043D\u0442\u0430\u043C \u043F\u0440\u0438\u043D\u0438\u043C\u0430\u044E\u0442\u0441\u044F \u0432 \u0447\u0430\u0442\u0435 \u043F\u043B\u0430\u0433\u0438\u043D\u0430"
      }
    });
    /* qBittorent */
    Lampa.SettingsApi.addParam({
      component: "torrentDownloader",
      param: {
        name: "td_qBittorent",
        type: "trigger",
        //доступно select,input,trigger,title,static
        "default": false
      },
      field: {
        name: "qBittorent",
        description: ""
      },
      onChange: function onChange(value) {
        if (value == "true") Lampa.Storage.set("td_qBittorent", true);else Lampa.Storage.set("td_qBittorent", false);
        Lampa.Settings.update();
      }
    });
    Lampa.SettingsApi.addParam({
      component: "torrentDownloader",
      param: {
        name: "qBittorent",
        type: "static",
        //доступно select,input,trigger,title,static
        "default": true
      },
      field: {
        name: "qBittorent",
        description: "Настройка сервера"
      },
      onRender: function onRender(item) {
        if (Lampa.Storage.field("td_qBittorent") === true) {
          //typeof Lampa.Storage.get("qBittorentUrl") !== 'undefined' && typeof Lampa.Storage.get("qBittorentPort") !== 'undefined' && typeof Lampa.Storage.get("qBittorentUser") !== 'undefined' && typeof Lampa.Storage.get("qBittorentPass") !== 'undefined' && qBittorent.getStatus();
          qBittorent.getStatus();
          item.show();
          $(".settings-param__name", item).before('<div id="qBittorentgetStatus" class="settings-param__status wait"></div>');
        } else item.hide();
        item.on("hover:enter", function () {
          Lampa.Settings.create("qBittorent");
          Lampa.Controller.enabled().controller.back = function () {
            Lampa.Settings.create("torrentDownloader");
          };
        });
      }
    });
    Lampa.SettingsApi.addParam({
      component: "qBittorent",
      param: {
        name: "qBittorentHead",
        type: "static"
      },
      field: {
        name: 'Настройка qBittorent'
        //description: "Настройка qBittorent",
      }
    });
    Lampa.SettingsApi.addParam({
      component: "qBittorent",
      param: {
        name: "qBittorentSSL",
        type: "trigger",
        //доступно select,input,trigger,title,static
        "default": false
      },
      field: {
        name: "Use HTTPS",
        description: ""
      },
      onChange: function onChange(value) {
        if (value == "true") Lampa.Storage.set("qBittorentProtocol", "https://");else Lampa.Storage.set("qBittorentProtocol", "http://");
        Lampa.Settings.update();
      }
    });
    Lampa.SettingsApi.addParam({
      component: "qBittorent",
      param: {
        name: "qBittorentUrl",
        type: "input",
        //доступно select,input,trigger,title,static
        //values: `${Lampa.Storage.get("qBittorentUrl") || ""}`,
        placeholder: '',
        values: '',
        "default": ''
      },
      field: {
        name: "Adress"
      },
      onChange: function onChange(item) {
        Lampa.Storage.set("qBittorentUrl", item);
        Lampa.Settings.update();
      }
    });
    Lampa.SettingsApi.addParam({
      component: "qBittorent",
      param: {
        name: "qBittorentPort",
        type: "input",
        //доступно select,input,trigger,title,static
        //values: `${Lampa.Storage.get("qBittorentPort")}`,
        placeholder: '',
        values: '',
        "default": ''
      },
      field: {
        name: "Port"
      },
      onChange: function onChange(item) {
        Lampa.Storage.set("qBittorentPort", item);
        Lampa.Settings.update();
      }
    });
    Lampa.SettingsApi.addParam({
      component: "qBittorent",
      param: {
        name: "qBittorentUser",
        type: "input",
        //доступно select,input,trigger,title,static
        //values: `${Lampa.Storage.get("qBittorentUser")}`,
        placeholder: '',
        values: '',
        "default": ''
      },
      field: {
        name: "User"
      },
      onChange: function onChange(item) {
        Lampa.Storage.set("qBittorentUser", item);
        Lampa.Settings.update();
      }
    });
    Lampa.SettingsApi.addParam({
      component: "qBittorent",
      param: {
        name: "qBittorentPass",
        type: "input",
        //доступно select,input,trigger,title,static
        //values: `${Lampa.Storage.get("qBittorentPass")}`,
        placeholder: '',
        values: '',
        "default": ''
      },
      field: {
        name: "Password"
      },
      onChange: function onChange(item) {
        Lampa.Storage.set("qBittorentPass", item);
        Lampa.Settings.update();
      }
    });

    /* Transmission */
    Lampa.SettingsApi.addParam({
      component: "torrentDownloader",
      param: {
        name: "td_transmission",
        type: "trigger",
        //доступно select,input,trigger,title,static
        "default": false
      },
      field: {
        name: "Transmission",
        description: ""
      },
      onChange: function onChange(value) {
        if (value == "true") Lampa.Storage.set("td_transmission", true);else Lampa.Storage.set("td_transmission", false);
        Lampa.Settings.update();
      }
    });
    Lampa.SettingsApi.addParam({
      component: "torrentDownloader",
      param: {
        name: "transmission",
        type: "static",
        //доступно select,input,trigger,title,static
        "default": true
      },
      field: {
        name: "transmission",
        description: "Настройка сервера"
      },
      onRender: function onRender(item) {
        if (Lampa.Storage.field("td_transmission") === true) {
          //typeof Lampa.Storage.get("transmissionUrl") !== 'undefined' && typeof Lampa.Storage.get("transmissionPort") !== 'undefined' && typeof Lampa.Storage.get("transmissionUser") !== 'undefined' && typeof Lampa.Storage.get("transmissionPass") !== 'undefined' && transmission.getStatus();
          transmission.getStatus();
          item.show();
          $(".settings-param__name", item).before('<div id="transmissionStatus" class="settings-param__status wait"></div>');
        } else item.hide();
        item.on("hover:enter", function () {
          Lampa.Settings.create("transmission");
          Lampa.Controller.enabled().controller.back = function () {
            Lampa.Settings.create("torrentDownloader");
          };
        });
      }
    });
    Lampa.SettingsApi.addParam({
      component: "transmission",
      param: {
        name: "transmissionHead",
        type: "static"
      },
      field: {
        name: 'Настройка Transmission'
        //description: "Настройка Transmission",
      }
    });
    Lampa.SettingsApi.addParam({
      component: "transmission",
      param: {
        name: "transmissionSSL",
        type: "trigger",
        //доступно select,input,trigger,title,static
        "default": false
      },
      field: {
        name: "Use HTTPS",
        description: ""
      },
      onChange: function onChange(value) {
        if (value == "true") Lampa.Storage.set("transmissionProtocol", "https://");else Lampa.Storage.set("transmissionProtocol", "http://");
        Lampa.Settings.update();
      }
    });
    Lampa.SettingsApi.addParam({
      component: "transmission",
      param: {
        name: "transmissionUrl",
        type: "input",
        //доступно select,input,trigger,title,static
        //values: `${Lampa.Storage.get("transmissionUrl")}`,
        placeholder: '',
        values: '',
        "default": ''
      },
      field: {
        name: "Adress"
      },
      onChange: function onChange(item) {
        Lampa.Storage.set("transmissionUrl", item);
        Lampa.Settings.update();
      }
    });
    Lampa.SettingsApi.addParam({
      component: "transmission",
      param: {
        name: "transmissionPort",
        type: "input",
        //доступно select,input,trigger,title,static
        //values: `${Lampa.Storage.get("transmissionPort")}`,
        placeholder: '',
        values: '',
        "default": ''
      },
      field: {
        name: "Port"
      },
      onChange: function onChange(item) {
        Lampa.Storage.set("transmissionPort", item);
        Lampa.Settings.update();
      }
    });
    Lampa.SettingsApi.addParam({
      component: "transmission",
      param: {
        name: "transmissionUser",
        type: "input",
        //доступно select,input,trigger,title,static
        //values: `${Lampa.Storage.get("transmissionUser")}`,
        placeholder: '',
        values: '',
        "default": ''
      },
      field: {
        name: "User"
      },
      onChange: function onChange(item) {
        Lampa.Storage.set("transmissionUser", item);
        Lampa.Settings.update();
      }
    });
    Lampa.SettingsApi.addParam({
      component: "transmission",
      param: {
        name: "transmissionPass",
        type: "input",
        //доступно select,input,trigger,title,static
        //values: `${Lampa.Storage.get("transmissionPass")}`,
        placeholder: '',
        values: '',
        "default": ''
      },
      field: {
        name: "Password"
      },
      onChange: function onChange(item) {
        Lampa.Storage.set("transmissionPass", item);
        Lampa.Settings.update();
      }
    });
    Lampa.SettingsApi.addParam({
      component: "transmission",
      param: {
        name: "transmissionAutostart",
        type: "trigger",
        //доступно select,input,trigger,title,static
        "default": true
      },
      field: {
        name: "Autostop",
        description: "Все торренты добавляются на паузе"
      },
      onChange: function onChange(value) {
        if (value == "true") Lampa.Storage.set("transmissionAutostart", true);else Lampa.Storage.set("transmissionAutostart", false);
        Lampa.Settings.update();
      }
    });
    Lampa.SettingsApi.addParam({
      component: "transmission",
      param: {
        name: "transmissionPath",
        type: "input",
        //доступно select,input,trigger,title,static
        //values: `${Lampa.Storage.get("transmissionUrl")}`,
        placeholder: '/transmission/rpc',
        values: '/transmission/rpc',
        "default": '/transmission/rpc'
      },
      field: {
        name: "RPC Path",
        description: "Изменение пути API. Не трогать без необходимости"
      },
      onChange: function onChange(item) {
        Lampa.Storage.set("transmissionPath", item);
        Lampa.Settings.update();
      }
    });
  }
  var Menu = {
    setMenu: setMenu
  };

  Lampa.Platform.tv();
  /* Some function */

  /* Start inject menu */
  function add() {
    Menu.setMenu();
  }
  /* Add menu */
  if (window.appready) add();else {
    Lampa.Listener.follow("app", function (e) {
      if (e.type == "ready") {
        add();
      }
    });
  }

  /* Add client */
  Client.downloader();

})();

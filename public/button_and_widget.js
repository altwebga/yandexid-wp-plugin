if (!yaWpData.error) {
  document.addEventListener("DOMContentLoaded", () => {
    let oauthQueryParams = {
      client_id: yaWpData.client_id,
      response_type: "code",
      redirect_uri: location.origin + "/wp-json/yandexid_webseed/webhook",
    };
    let tokenPageOrigin = location.origin;

    // Проверка на наличие элемента с ID 'my_yandex_login'
    var loginElement = document.getElementById("my_yandex_login");

    if (loginElement && yaWpData.button && yaWpData.container_id) {
      YaAuthSuggest.init(oauthQueryParams, tokenPageOrigin, {
        view: "button",
        parentId: "my_yandex_login", // Убедитесь, что это ID элемента для кнопки
        buttonSize: "xl",
        buttonView: "main",
        buttonTheme: "light",
        buttonBorderRadius: "0",
        buttonIcon: "ya",
      })
        .then(({ handler }) => handler())
        .then((data) => console.log("Сообщение с токеном", data))
        .catch((error) => console.log("Обработка ошибки", error));
    } else {
      console.log(
        "Элемент для кнопки авторизации через Яндекс ID не найден или не указан ID контейнера"
      );
    }

    // Дополнительные функции и виджет
    if (yaWpData.widget) {
      YaAuthSuggest.init(oauthQueryParams, tokenPageOrigin)
        .then(({ handler }) => handler())
        .then((data) => console.log("Сообщение с токеном", data))
        .catch((error) => console.log("Обработка ошибки", error));
    }

    function checkAndReload() {
      let cookies = document.cookie;

      if (cookies.includes("yandex-id-logged")) {
        clearInterval(interval_yandex_auth);
        document.cookie = "yandex-id-logged=1; max-age=0";
        location.reload();
      }
    }

    if (typeof interval_yandex_auth === "undefined" || !interval_yandex_auth) {
      var interval_yandex_auth = setInterval(checkAndReload, 1000);
    }
  });
} else {
  console.log(yaWpData.error);
}

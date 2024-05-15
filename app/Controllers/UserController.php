<?php
require_once plugin_dir_path(__FILE__) . '../Service/Yandex.php';

class UserController
{
    public function handler($access_token)
    {
        global $wpdb;

        if (empty($access_token)) {
            return wp_send_json_error('Не возможно авторизовать пользователя.');
        }

        $yandexApi = new Yandex();
        $user_data = $yandexApi->getInfo(sanitize_text_field($access_token));

        if (empty($user_data->default_email)) {
            return wp_send_json_error('Невозможно авторизовать пользователя.');
        }

        $email = $user_data->default_email;

        // Использование подготовленного запроса для защиты от SQL инъекций
        $user = $wpdb->get_row($wpdb->prepare(
            "SELECT ID FROM {$wpdb->prefix}users WHERE user_email = %s",
            $email
        ));

        if ($user) {
            wp_set_auth_cookie($user->ID);
        } else {
            $this->yandexid_create_user($user_data);
        }

        header('Content-Type: text/html');
        echo '<script>close(); document.cookie = "yandex-id-logged=1; path=/;"</script>';
    }

    private function yandexid_create_user($user_data)
    {
        $userdata = [
            'first_name' => $user_data->first_name ?? '',
            'last_name' => $user_data->last_name ?? '',
            'display_name' => trim(($user_data->first_name ?? '') . ' ' . ($user_data->last_name ?? '')),
            'user_login' => $user_data->default_email,
            'user_pass' => wp_generate_password(8, false),
            'user_email' => $user_data->default_email,
        ];

        $user_id = wp_insert_user($userdata);

        if (is_wp_error($user_id)) {
            echo $user_id->get_error_message();
            return false;
        }

        // Добавление метаданных пользователя (номер телефона)
        if (!empty($user_data->default_phone->number)) {
            update_user_meta($user_id, 'billing_phone', $user_data->default_phone->number);
        }

        wp_set_auth_cookie($user_id);
        wp_send_new_user_notifications($user_id);

        return true;
    }
}

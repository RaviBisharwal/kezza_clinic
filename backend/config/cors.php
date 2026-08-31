<?php

return [

    /*
    |--------------------------------------------------------------------------
    | CORS Configuration — Kezza Clinic
    |--------------------------------------------------------------------------
    |
    | Frontend (HTML files) open hoti hain file:// ya localhost se.
    | Local dev ke liye sab kuch allow kiya hai.
    | Production mein allowed_origins ko apni domain se replace karo.
    |
    */

    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];

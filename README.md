# angular-nuxeo
An angular JS client for the nuxeo platform

[![Build Status](https://secure.travis-ci.org/fmaturel/angular-nuxeo.svg)](http:/travis-ci.org/fmaturel/angular-nuxeo)

## Demo

- Run the demo @home with few steps (prerequisite git & node V0.10+ & npm installed):

```
 git clone https://github.com/fmaturel/angular-nuxeo.git && cd angular-nuxeo
 npm install
 sudo npm install -g grunt-cli
 sudo npm install -g bower
 bower install
```

- Add `demo.nuxeo.local` to local /etc/hosts:
```
127.0.0.1       demo.nuxeo.local

```

- Add Apache VHost or Nginx to proxy your nuxeo server request to nuxeo demo API:
```
<VirtualHost *:80>
        ServerName demo.nuxeo.local
        ServerAdmin webmaster@localhost

        RequestHeader append nuxeo-virtual-host "http://demo.nuxeo.local/"

        ProxyPass /nuxeo http://demo.nuxeo.com/nuxeo
        ProxyPassReverse /nuxeo http://demo.nuxeo.com/nuxeo

        # force apache to return 200
        RewriteEngine On
        RewriteCond %{REQUEST_METHOD} OPTIONS
        RewriteRule .* / [R=200,L]

        SetEnvIf Origin "^(https?://.*\.*(localhost)(?::\d{1,5})?)$" CORS_ALLOW_ORIGIN=$0
        Header unset Access-Control-Allow-Origin
        Header always set Access-Control-Allow-Origin "%{CORS_ALLOW_ORIGIN}e" env=CORS_ALLOW_ORIGIN
        Header always set Access-Control-Allow-Credentials "true"
        Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
        Header always set Access-Control-Allow-Headers "Accept, Content-type, Authorization, Nuxeo-Transaction-Timeout, X-NXproperties, X-NXVoidOperation, X-NXenrichers.document"

        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

Then run

`grunt serve:dist`

## License

Released under the MIT License. See the [LICENSE][license] file for further details.

[license]: https://github.com/fmaturel/angular-timelinejs3/blob/master/LICENSE
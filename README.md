# angular-nuxeo
An angular JS client for the nuxeo platform

[![Build Status](https://secure.travis-ci.org/fmaturel/angular-timelinejs3.svg)](http:/travis-ci.org/fmaturel/angular-timelinejs3)

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

- Add Apache VHost or Nginx to proxy your nuxeo server request to API and local requests to http://localhost:9031:
```
<VirtualHost *:80>
        ServerName localhost
        ServerAlias demo.nuxeo.local
        ServerAdmin webmaster@localhost

        ProxyPass /nuxeo http://demo.nuxeo.com/nuxeo
        ProxyPassReverse /nuxeo http://demo.nuxeo.com/nuxeo

        ProxyPass / http://localhost:9031/
        ProxyPassReverse / http://localhost:9031/

        ErrorLog ${APACHE_LOG_DIR}/error.log

        # Possible values include: debug, info, notice, warn, error, crit, alert, emerg.
        LogLevel warn

        CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

Then run

`grunt serve:dist`

## License

Released under the MIT License. See the [LICENSE][license] file for further details.

[license]: https://github.com/fmaturel/angular-timelinejs3/blob/master/LICENSE
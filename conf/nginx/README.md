This folder has some configuration files I use for nginx. Here is the file layout I use (abbreviated):

This setup uses nginx and passenger. Note that the lilypond server is also referred to.

/opt/nginx
├── conf
│   ├── mime.types
│   ├── nginx.conf
│   ├── sites-enabled
│   │   ├── default
├── logs
│   ├── access.log
│   ├── error.log
│   └── nginx.pid
├── sbin
│   └── nginx


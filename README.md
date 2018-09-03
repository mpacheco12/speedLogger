## speedLogger
Node js app for raspberry pi for monitoring your internet speed

## prerequisites
You should have this installed on your system.
* Nodejs (https://nodejs.org/en/download/package-manager/)
* MongoDB (https://docs.mongodb.com/manual/administration/install-community/)


## Installation
```bash
$ git clone https://github.com/mpacheco12/speedLogger
$ cd speedLogger
$ npm install
```

## Running
```bash
$ node index.js
```

## Run speedlogger as a service
To run it as a service, we are firstly going to create a file in the /etc/init.d/ folder to have our own service. Let’s create a speedLogger file:
```bash
$ sudo nano /lib/systemd/system/speedLogger.service
```
And put the following content:

```bash
[Unit]
Description=SpeedLogger Service

[Service]
Type=idle
ExecStart=/usr/bin/node <path_to_this_repo>/index.js
Restart=always
RestartSec=10
Environment=PORT=3001
WorkingDirectory=<path_to_this_repo>            
```
set permissions and enable the service we've just created:
```bash
$ sudo chmod 644 /lib/systemd/system/speedLogger.service 
$ sudo systemctl daemon-reload
$ sudo systemctl enable speedLogger.service
```
To start the server, simply type:
```bash
$sudo systemctl start speedLogger.service
```
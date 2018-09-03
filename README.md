## speedLogger
Node js app for raspberry pi for monitoring your internet speed

## prerequisites
You should have this installed on your system.
* Nodejs (https://nodejs.org/en/download/package-manager/)
* MongoDB (https://docs.mongodb.com/manual/administration/install-community/)


## Installation
```bash
git clone https://github.com/mpacheco12/speedLogger
cd speedLogger
npm install
```

## Running
```bash
node index.js
```

## Run speedlogger as a service
To run it as a service, we are firstly going to create a file in the /etc/init.d/ folder to have our own service. Let’s create a speedLogger file:
```bash
sudo nano /etc/init.d/speedLogger
```
And put the following content:

```bash
#!/bin/sh
# /etc/init.d/node

if [ true != "$INIT_D_SCRIPT_SOURCED" ] ; then
    set "$0" "$@"; INIT_D_SCRIPT_SOURCED=true . /lib/init/init-d-script
fi

### BEGIN INIT INFO
# Provides:          node
# Required-Start:    $all
# Required-Stop:     $all
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Starts the DAEMON_PATH/DAEMONOPTS server
# Description:       Starts the DAEMON_PATH/DAEMONOPTS server
### END INIT INFO

export PATH=$PATH:/opt/node/bin

DAEMON_PATH="<path_to_this_repo>"

DAEMON=node
DAEMONOPTS="index.js"
NAME=speedLogger
DESC="speedLogger"
PIDFILE=/var/run/$NAME.pid
SCRIPTNAME=/etc/init.d/$NAME

case "$1" in
start)
    printf "%-50s" "Starting $NAME..."
    cd $DAEMON_PATH
    PID=`$DAEMON $DAEMONOPTS > /dev/null 2>&1 & echo $!`
    #echo "Saving PID" $PID " to " $PIDFILE
    if [ -z $PID ]; then
        printf "%s\n" "Fail"
    else
        echo $PID > $PIDFILE
        printf "%s\n" "Ok"
    fi
;;
status)
    printf "%-50s" "Checking $NAME..."
    if [ -f $PIDFILE ]; then
        PID=`cat $PIDFILE`
        if [ -z "`ps axf | grep ${PID} | grep -v grep`" ]; then
            printf "%s\n" "Process dead but pidfile exists"
        else
            echo "Running"
        fi
    else
        printf "%s\n" "Service not running"
    fi
;;
stop)
    printf "%-50s" "Stopping $NAME"
    PID=`cat $PIDFILE`
    cd $DAEMON_PATH
    if [ -f $PIDFILE ]; then
        kill -HUP $PID
        printf "%s\n" "Ok"
        rm -f $PIDFILE
    else
        printf "%s\n" "pidfile not found"
    fi
;;
restart)
    $0 stop
    $0 start
;;

*)
    echo "Usage: $0 {status|start|stop|restart}"
    exit 1
esac

exit 0                               
```
This file simply describes how to service should start or stop. Then you can start your custom service using this command:
```bash
sudo service speedLogger start
```

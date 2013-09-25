# winston-syslogUdp

A UDP Only Syslog transport for [winston], developed for use with Loggly but compliant with syslog standards.

## Installation

`````
  $ npm install winston 
  $ npm install winston-syslogudp
`````

## Motivation
This module is based on winston-syslog and syslogUdp and intended to provide a lightweight UDP only winston syslog transport.  It was created when the authors experienced challenges with winston-syslog and with winston-loggly.

## Usage
To use the Syslog transport in [winston], you simply need to require it and then either add it to an existing [winston] logger or pass an instance to a new [winston] logger:

``` js
  var winston = require('winston');
  require('winston-syslogudp').Syslog;  
  winston.add(winston.transports.Syslog, options);
```

Options:
* __host:__ The host running syslogd, defaults to localhost.
* __port:__ The port on the host that syslog is running on, defaults to syslogd's default port.
* __pid:__ PID of the process that log messages are coming from (Default `process.pid`).
* __facility:__ Syslog facility to use (Default: `local0`).
* __localhost:__ Host to indicate that log messages are coming from (Default: `localhost`).
* __type:__ The type of the syslog protocol to use (Default: `BSD`).
* __logglyHeader:__ The additional information required for loggly v2.

*Metadata:* Logged as string compiled by [glossy].

## Log Levels
Because syslog only allows a subset of the levels available in [winston], levels that do not match will be ignored. Therefore, in order to use `winston-syslogudp` effectively, you should indicate to [winston] that you want to use the syslog levels:

``` js
  var winston = require('winston');
  winston.setLevels(winston.config.syslog);
```

The `Syslog` transport will only log to the level that are available in the syslog protocol. These are (in increasing order of severity):

* debug
* info
* notice
* warning
* error
* crit
* alert
* emerg

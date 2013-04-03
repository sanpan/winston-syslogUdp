/*
 * syslog.js: Transport for logging to a remote syslog consumer
 *
 * (C) 2011 Squeeks and Charlie Robbins
 * MIT LICENCE
 *
 */

var dgram = require('dgram'),
    net = require('net'),
    util = require('util'),
    glossy = require('glossy'),
    winston = require('winston');

var levels = Object.keys({
  debug: 0, 
  info: 1, 
  notice: 2, 
  warning: 3,
  error: 4, 
  crit: 5,
  alert: 6,
  emerg: 7
});

//
// ### function Syslog (options)
// #### @options {Object} Options for this instance.
// Constructor function for the Syslog Transport capable of sending
// RFC 3164 and RFC 5424 compliant messages.
//
var Syslog = exports.Syslog = function (options) {
  options = options || {};

  //
  // Setup connection state
  //
  // Merge the options for the target Syslog server.
  //
  this.host     = options.host     || 'localhost';
  this.port     = options.port     || 514;
  this.path     = options.path     || null;
  this.protocol = options.protocol || 'udp4';
  this.isDgram  = /^udp|unix/.test(this.protocol);
  
  this.udpClient = dgram.createSocket('udp4');
      this.udpClient.on('error', function (err) { 
          // Handle any suprise errors
          util.error(err); 
      }); 
  
  // Merge the default message options. 
  //
  this.localhost = options.localhost || 'localhost';  
  this.type      = options.type      || 'BSD';
  this.facility  = options.facility  || 'local0';
  this.pid       = options.pid       || process.pid;

  //
  // Setup our Syslog and network members for later use.
  //
  this.producer = new glossy.Produce({
    type:     this.type,
    pid:      this.pid,
    facility: this.facility
  }); 
};
    
util.inherits(Syslog, winston.Transport);
winston.transports.Syslog = Syslog;

//
// ### function log (level, msg, [meta], callback)
// #### @level {string} Target level to log to
// #### @msg {string} Message to log
// #### @meta {Object} **Optional** Additional metadata to log.
// #### @callback {function} Continuation to respond to when complete. 
// Core logging method exposed to Winston. Logs the `msg` and optional
// metadata, `meta`, to the specified `level`.
//
Syslog.prototype.log = function (level, msg, meta, callback) {
  var self = this,
      data = meta ? winston.clone(meta) : {}, 
      syslogMsg,
      buffer;
  if (!~levels.indexOf(level)) {
    return callback(new Error('Cannot log unknown syslog level: ' + level));
  }
  
  data.message = msg;
  syslogMsg = this.producer.produce({
    severity: level,
    host:     this.localhost,
    date:     new Date(),
    message:  JSON.stringify(data)
  });
  
  var jsonMessage = new Buffer(syslogMsg);
  this.udpClient.send(jsonMessage, 0, jsonMessage.length, self.port, self.host, function (err, bytes) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, true);
    }
  });
}
 

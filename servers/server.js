const net_server = require('net');
const connection = require("./connection");
const moment = require('moment');
 
const server = net_server.createServer((client) => {
  console.log('Client connection: ');
  console.log('   local = %s:%s', client.localAddress, client.localPort);
  console.log('   remote = %s:%s', client.remoteAddress, client.remotePort);
  
  client.setTimeout(2000);
  client.setEncoding('utf8');

  client.on('data', (data) => {
    console.log(`Socket Data : ${data.toString()}`);
    const receiveDataFormatJson = JSON.parse(data.toString());
    const today = moment().format('YYYY-MM-DD HH:mm:ss');
    
    const query = `INSERT INTO finedust_tb(deviceId, windSpeed, windDirection, temperature, humidity, PM1_0, PM2_5, PM4_0, PM10_0, rgst_dt) VALUES 
                   ('${receiveDataFormatJson.deviceId}', 
                    '${receiveDataFormatJson.windSpeed}', 
                    ${receiveDataFormatJson.windDirection}, 
                    ${receiveDataFormatJson.temperature},  
                    ${receiveDataFormatJson.humidity}, 
                    ${receiveDataFormatJson['PM1.0']}, 
                    ${receiveDataFormatJson['PM2.5']}, 
                    ${receiveDataFormatJson['PM4.0']}, 
                    ${receiveDataFormatJson['PM10.0']}, 
                    '${today}')`;

    connection.query(query, (err, rows, fields) => {
      if (err) {
        console.log(err);
      }
    })
  });
  
  client.on('end', () => {
    console.log('Client disconnected');
  });
  
  client.on('error', (err) => {
    console.log('Socket Error: ', JSON.stringify(err));
  });
  
  client.on('timeout', () => {
    console.log(`Socket Timed out`);
  });
});

module.exports = server;
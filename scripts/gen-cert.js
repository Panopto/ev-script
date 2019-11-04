var selfsigned = require('selfsigned'),
    fs = require('fs'),
    config = require('../ev-config'),
    pems = selfsigned.generate(config.evSettings.certConfig, { days: 365 });

console.log(config.evSettings.certConfig);
console.log(pems);

fs.writeFileSync('certs/ev-script-key.pem', pems.private);
fs.writeFileSync('certs/ev-script-cert.pem', pems.cert);

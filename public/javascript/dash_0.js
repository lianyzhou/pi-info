/////////////////////////////////////////////////
// RASDASH DASH SCRIPT (C)2019: Benjamin Sykes //
/////////////////////////////////////////////////

// Global constants and variables.
const ROOT = location.protocol + '//' + location.host;
const API = ROOT + '/api/';
var online = true;
var updateCount = 0;

var uptimeInterval = undefined;

function toHHMMSS(sec) {
  var hours   = Math.floor(sec / 3600);
  var minutes = Math.floor((sec - (hours * 3600)) / 60);
  var seconds = sec - (hours * 3600) - (minutes * 60);

  if(hours < 10) {
    hours = "0" + hours;
  }
  if(minutes < 10) {
    minutes = "0" + minutes;
  }
  if(seconds < 10) {
    seconds = "0" + seconds;
  }

  return hours + ':' + minutes + ':' + seconds;
}

function initUptimeInterval(sec) {
  if(uptimeInterval) {
    window.clearInterval(uptimeInterval);
  }

  var seconds = Math.round(parseInt(sec));
  
  uptimeInterval = setInterval(function() {
      updateElement('server-uptime', toHHMMSS(seconds));
      seconds++;
  }, 1000);
}

// Dash updater script, meant to be run periodically.
function periodicUpdate() {
  // Increment update counter.
  updateCount += 1;
  
  // If the page has been loaded recently, initialize.
  if (updateCount < 3) {
    getData('sys/model', function(data) { updateElement('device-model', data.toString()); });
    getData('sys/os', function(data) { updateElement('device-os', data.toString()); });
    getData('ram/total', function(data) { updateElement('ram-total', Math.round(parseInt(data))); });
    getData('fs/0/total', function(data) { updateElement('disk-total', Math.round(parseInt(data))); });
  }

  $('#connection-online').removeClass('hidden');
  $('#connection-offline').addClass('hidden');

  if(!uptimeInterval) {
    getData('uptime', function(data) { initUptimeInterval(data); });
  }

  getData('cpu/temp', function(data) { updateElement('cpu-temp', Math.round(parseInt(data))); });
  getData('cpu/usage', function(data) { updateElement('cpu-usage', Math.round(parseInt(data))); });

  getData('ram/usage', function(data) { updateElement('ram-usage', Math.round(parseInt(data))); });
  getData('ram/used', function(data) { updateElement('ram-used', Math.round(parseInt(data))); });

  getData('fs/0/usage', function(data) { updateElement('disk-usage', Math.round(parseInt(data))); });
  getData('fs/0/used', function(data) { updateElement('disk-used', Math.round(parseInt(data))); });

  getData('network/transmit/eth0', function(data) {
    updateElement('network-transmit-eth0', Math.round(parseInt(data)));
  });
  getData('network/receive/eth0', function(data) {
    updateElement('network-receive-eth0', Math.round(parseInt(data)));
  });

  getData('network/transmit/wlan0', function(data) {
    updateElement('network-transmit-wlan0', Math.round(parseInt(data)));
  });
  getData('network/receive/wlan0', function(data) {
    updateElement('network-receive-wlan0', Math.round(parseInt(data)));
  });

}

// Element updater.
function updateElement(id, content) {
  var dom = document.getElementById(id);
  if (dom) {
    dom.innerHTML = content.toString();
  }

}

// API data getter.
function getData(source, success) {
  $.getJSON(API + source, function(data) { success(data); });
}

// Have dash update every second after finishing.
const setIntervalAsync = (fn, ms) => {
  fn().then(() => {
    setTimeout(() => setIntervalAsync(fn, ms), ms);
  });
};

const delay = deplayMs => new Promise((resolve) => {
    setTimeout(resolve, deplayMs);
});

setIntervalAsync(async () => { periodicUpdate(); await delay(1000); }, 1000);

// Make dash update upon load.
window.onload = periodicUpdate;

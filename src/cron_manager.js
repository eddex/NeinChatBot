'use strict';

var cronManager = {
  /*
  * Start a cron job.
  * @param cronExpression: Cron expression that defines how often the job is run.
  * @param callback: the method to execute as a cron job.
  */
  startJob: function(cronExpression, callback) {
    var CronJob = require('cron').CronJob;
    new CronJob(
      cronExpression, // Cron expression which defines then the function is executed.
      function() { callback() }, // Function to run depending on the cron expression.
      null, // This function is executed when the job stops.
      true, // Start the job right now.
      'Europe/Zurich'); // Timezone
  },
}

module.exports = cronManager;

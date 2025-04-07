import { CronJob } from 'cron';
import https from 'https';

const job = new CronJob("*/14 * * * * *", function () {
    https.get("https://bookonline-1.onrender.com", (res) => {
        if (res.statusCode === 200) {
            console.log('✅ Cron job executed successfully');
        } else {
            console.error('❌ Cron job failed with status code:', res.statusCode);
        }
    }).on('error', (error) => {
        console.error('⚠️ Error occurred during cron job execution:', error);
    });
});

export default job;

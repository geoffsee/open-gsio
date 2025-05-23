import * as child_process from "node:child_process";

export const killProcessOnPort = (port) => {
  return new Promise((resolve, reject) => {
    child_process.exec(`lsof -t -i :${port}`.trim(), (err, stdout) => {
      if (err) {
        if (err.code !== 1) {
          console.error(`Error finding process on port ${port}:`, err);
          return reject(err);
        } else {
          console.log(`No process found on port ${port}`);
          return resolve();
        }
      }

      const pid = stdout.trim();
      if (!pid) {
        console.log(`No process is currently running on port ${port}`);
        return resolve();
      }

      child_process.exec(`kill -9 ${pid}`.trim(), (killErr) => {
        if (killErr) {
          console.error(
            `Failed to kill process ${pid} on port ${port}`,
            killErr,
          );
          return reject(killErr);
        }

        console.log(`Successfully killed process ${pid} on port ${port}`);
        resolve();
      });
    });
  });
};

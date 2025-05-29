#!/usr/bin/env node

import * as child_process from "node:child_process";

const args = process.argv.slice(2);
const port = args.length > 0 ? parseInt(args[0], 10) : null;

if (!port || isNaN(port)) {
    console.error('Please provide a valid port number');
    process.exit(1);
}


export const killProcessOnPort = (port) => {
    return new Promise((resolve, reject) => {
        // Find the PID of the process using the specified port
        child_process.exec(`lsof -t -i :${port}`.trim(), (err, stdout) => {
            if (err) {
                // Handle command error (such as permission denied)
                if (err.code !== 1) {
                    console.error(`Error finding process on port ${port}:`, err);
                    return reject(err);
                } else {
                    // If code is 1, it generally means no process is using the port
                    console.log(`No process found on port ${port}`);
                    return resolve();
                }
            }

            // If stdout is empty, no process is using the port
            const pid = stdout.trim();
            if (!pid) {
                console.log(`No process is currently running on port ${port}`);
                return resolve();
            }

            // Kill the process using the specified PID
            child_process.exec(`kill -9 ${pid}`.trim(), (killErr) => {
                if (killErr) {
                    console.error(`Failed to kill process ${pid} on port ${port}`, killErr);
                    return reject(killErr);
                }

                console.log(`Successfully killed process ${pid} on port ${port}`);
                resolve();
            });
        });
    });
};

await killProcessOnPort(port);

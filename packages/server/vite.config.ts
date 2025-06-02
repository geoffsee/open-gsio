import {defineConfig} from "vite";
import {configDefaults} from 'vitest/config';

export default defineConfig(({command}) => {

    return {
        test: {
            globals: true,
            environment: 'jsdom',
            registerNodeLoader: false,
            // setupFiles: ['./src/test/setup.ts'],
            exclude: [...configDefaults.exclude, 'dist/**', '.open-gsio/**'],
            reporters: process.env.GITHUB_ACTIONS ? ['dot', 'github-actions', 'html'] : ['dot', 'html'],
            coverage: {
                // you can include other reporters, but 'json-summary' is required, json is recommended
                reporter: ['json-summary', 'json', 'html'],
                reportsDirectory: "coverage",
                // If you want a coverage reports even if your tests are failing, include the reportOnFailure option
                reportOnFailure: true,
            }
        }
    };
});

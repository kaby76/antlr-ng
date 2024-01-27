/*
 * Copyright (c) 2012-2022 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

/* eslint-disable jsdoc/require-returns, jsdoc/require-param */

import path from "path";
import { spawnSync } from "child_process";

import { FileUtils } from "./FileUtils.js";
import { ErrorQueue } from "./ErrorQueue.js";
import { DefaultToolListener, Tool } from "../temp.js";

export class Generator {

    /** Run ANTLR on stuff in workdir and error queue back */
    public static generateANTLRFilesInWorkDir(workdir: string, targetName: string | null,
        grammarFileName: string, defaultListener: boolean, extraOptions: string[]): ErrorQueue {
        const options = [...extraOptions];
        if (targetName !== null) {
            options.push("-Dlanguage=" + targetName);
        } else {
            options.push("-Dlanguage=TypeScript");
        }

        if (!options.includes("-o")) {
            options.push("-o");
            options.push(workdir);
        }

        if (!options.includes("-lib")) {
            options.push("-lib");
            options.push(workdir);
        }
        if (!options.includes("-encoding")) {
            options.push("-encoding");
            options.push("UTF-8");
        }
        options.push(path.join(workdir, grammarFileName));

        const antlr = new Tool(options);
        const errorQueue = new ErrorQueue(antlr);
        antlr.addListener(errorQueue);
        if (defaultListener) {
            antlr.addListener(new DefaultToolListener(antlr));
        }

        const errors: string[] = [];

        if (!defaultListener && errorQueue.errors.length > 0) {
            for (const msg of errorQueue.errors) {
                const msgST = antlr.errMgr.getMessageTemplate(msg);
                errors.push(msgST!.render());
            }
        }

        // Generate test parsers, lexers and listeners.
        const output = spawnSync("npm", ["run", "generate", "--", ...options], {
            encoding: "utf-8",
            cwd: workdir,
            stdio: ["ignore", "pipe", "pipe"],
        });

        if (output.status !== 0) {
            errorQueue.error(`Generation of ${grammarFileName} failed:\n${output.stderr}`);
        } else {
            // Consider stderr output as warnings if the process exited successfully.
            if (output.stderr.length > 0) {
                const lines = output.stderr.split("\n");

                // Remove debugger attached and waiting for debugger messages.
                const filteredLines = lines.filter((line) => {
                    if (line.length === 0) {
                        return false;
                    }

                    return !line.startsWith("Debugger attached.")
                        && !line.startsWith("Waiting for the debugger to disconnect...");
                });

                filteredLines.forEach((line) => {
                    errorQueue.warning(line);
                });
            }

            // Add stdout output as info messages.
            if (output.stdout.length > 0) {
                const lines = output.stdout.split("\n");
                lines.forEach((line) => {
                    if (line.length > 0) {
                        errorQueue.info(line);
                    }
                });
            }
        }

        return errorQueue;
    }

    public static generateANTLRFilesInTempDir(workdir: string, targetName: string | null,
        grammarFileName: string, grammarStr: string, defaultListener: boolean, extraOptions: string[]): ErrorQueue {
        FileUtils.mkdir(workdir);
        FileUtils.writeFile(workdir, grammarFileName, grammarStr);

        return Generator.generateANTLRFilesInWorkDir(workdir, targetName, grammarFileName, defaultListener,
            extraOptions);
    }
}

/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

const packageJson = await import("../package.json", { assert: { type: "json" } });

import { Command, Option } from "commander";

export interface IToolParameters {
    // Used to store additional options that are not explicitly defined here.
    [keyof: string]: unknown;

    /** The grammar files. */
    args: string[];

    define?: Record<string, string>,

    outputDirectory?: string,
    libDirectory?: string,
    generateATNDot?: boolean,
    grammarEncoding?: string,
    msgFormat?: string,
    longMessages?: boolean;
    generateListener?: boolean,
    generateVisitor?: boolean,
    package?: string,
    generateDependencies?: boolean,
    warningsAreErrors?: boolean,
    forceAtn?: boolean,
    log?: boolean,
}

export const antlrVersion = packageJson.default.version;

const parseBoolean = (value: string | null): boolean => {
    if (value == null) {
        return false;
    }

    const lower = value.trim().toLowerCase();

    return lower === "true" || lower === "1" || lower === "on" || lower === "yes";
};

const defines: Record<string, string> = {};

const parseKeyValuePair = (input: string): Record<string, string> => {
    const [key, value] = input.split("=");
    defines[key] = value;

    return defines;
};

const prepared = new Command()
    .option("-o, --output-directory <path>", "specify output directory where all output is generated")
    .option("-lib, --lib-directory <path>", "specify location of grammars, tokens files")
    .option<boolean>("-atn, --generate-atn-dot [boolean]",
        "Generate rule augmented transition network diagrams.", parseBoolean, false)
    .option("-e, --encoding <string>", "Specify grammar file encoding; e.g., ucs-2.", "utf-8")
    .addOption(new Option("-mf, --message-format [string]", "Specify output style for messages in antlr, gnu, vs2005.")
        .choices(["antlr", "gnu", "vs2005"]).default("antlr"))
    .option<boolean>("-lm, --long-messages [boolean]",
        "Show exception details when available for errors and warnings.", parseBoolean, false)
    .option<boolean>("-l, --listener [boolean]", "Generate parse tree listener.", parseBoolean, true)
    .option<boolean>("-v, --visitor [boolean]", "Generate parse tree visitor.", parseBoolean, false)
    .option("-p, --package <name>", "Specify a package/namespace for the generated code.")
    .option<boolean>("-d, --dependencies [boolean]", "Generate file dependencies.", parseBoolean, false)
    .option("-D, --define <key=value...>", "Set/override a grammar-level option.", parseKeyValuePair)
    .option<boolean>("-w, --warnings-are-errors [boolean]", "Treat warnings as errors.", parseBoolean, false)
    .option<boolean>("-f, --force-atn [boolean]", "Use the ATN simulator for all predictions.", parseBoolean, false)
    .option<boolean>("--log [boolean]", "Dump lots of logging info to antlr-timestamp.log.", parseBoolean, false)
    .option("<grammar...>", "A list of grammar files.")
    .version(`ANTLRng ${packageJson.default.version}`);

prepared.exitOverride((err) => {
    console.error("Command parsing failed:", err.message);
});

/**
 * Used to parse tool parameters given as string list. Usually, this is used for tests.
 *
 * @param args The list of arguments.
 */
export const parseToolParameters = (args: string[]): void => {
    prepared.parse(args, { from: "user" });

    grammarOptions = prepared.opts<IToolParameters>();
    grammarOptions.args = prepared.args;
};

export let grammarOptions: IToolParameters;

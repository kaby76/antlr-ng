/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the BSD 3-clause License. See License.txt in the project root for license information.
 */

import { fileURLToPath } from "node:url";

import type { IST } from "stringtemplate4ts";
import { STGroupFile, type STGroup } from "stringtemplate4ts";

import { Constants } from "../Constants.js";
import { Tool } from "../Tool.js";
import { CodeGenerator } from "../codegen/CodeGenerator.js";
import { GrammarType } from "../support/GrammarType.js";
import { Grammar } from "./Grammar.js";

/**
 * Given a grammar file, show the dependencies on .tokens etc... Using ST, emit a simple "make compatible" list of
 * dependencies. For example, combined grammar T.g (no token import) generates:
 *
 *  	TParser.java : T.g
 *  	T.tokens : T.g
 *  	TLexer.java : T.g
 *
 * If we are using the listener pattern (-listener on the command line) then we add:
 *
 *    TListener.java : T.g
 *    TBaseListener.java : T.g
 *
 * If we are using the visitor pattern (-visitor on the command line) then we add:
 *
 *    TVisitor.java : T.g
 *    TBaseVisitor.java : T.g
 *
 * If "-lib libDir" is used on command-line with -depend and option tokenVocab=A in grammar, then include the path
 * like this:
 *
 *    T.g: libDir/A.tokens
 *
 * Pay attention to -o as well:
 *
 *    output-dir/TParser.java : T.g
 *
 * So this output shows what the grammar depends on *and* what it generates.
 *
 * Operate on one grammar file at a time.  If given a list of .g on the command-line with -depend, just emit the
 * dependencies. The grammars may depend on each other, but the order doesn't matter.  Build tools, reading in this
 * output, will know how to organize it.
 *
 * This code was obvious until I removed redundant "./" on front of files and had to escape spaces in filenames :(
 *
 * I literally copied from v3 so might be slightly inconsistent with the v4 code base.
 */
export class BuildDependencyGenerator {
    protected tool: Tool;
    protected g: Grammar;
    protected generator: CodeGenerator;
    protected templates?: STGroup;

    public constructor(tool: Tool, g: Grammar, private libDirectory?: string, private generateListeners?: boolean,
        private generateVisitors?: boolean) {
        this.tool = tool;
        this.g = g;
        this.generator = new CodeGenerator(g);
    }

    /**
     * @returns a list of URL objects that name files ANTLR will emit from T.g.
     */
    public getGeneratedFileList(): URL[] {
        const files = new Array<URL>();

        // Add generated recognizer, e.g., TParser.java.
        if (this.generator.target.needsHeader()) {
            files.push(this.getOutputFile(this.generator.getRecognizerFileName(true)));
        }

        files.push(this.getOutputFile(this.generator.getRecognizerFileName(false)));

        // Add output vocab file, e.g. T.tokens. This is always generated to the base output directory, which will
        // be just `.` if there is no -o option.
        files.push(this.getOutputFile(this.generator.getVocabFileName()!));

        // Are we generating a .h file?
        let headerExtST = null;
        const extST = this.generator.templates.getInstanceOf("codeFileExtension");
        if (this.generator.templates.isDefined("headerFile")) {
            headerExtST = this.generator.templates.getInstanceOf("headerFileExtension");
            const suffix = Grammar.getGrammarTypeToFileNameSuffix(this.g.type);
            const fileName = `${this.g.name}${suffix}${headerExtST?.render()}`;
            files.push(this.getOutputFile(fileName));
        }

        if (this.g.isCombined()) {
            // Add autogenerated lexer, e.g., TLexer.java TLexer.h TLexer.tokens.
            const suffix = Grammar.getGrammarTypeToFileNameSuffix(GrammarType.Lexer);
            const lexer = `${this.g.name}${suffix}${extST?.render()}`;
            files.push(this.getOutputFile(lexer));

            const lexerTokens = this.g.name + suffix + Constants.VocabFileExtension;
            files.push(this.getOutputFile(lexerTokens));

            // TLexer.h
            if (headerExtST !== null) {
                const header = this.g.name + suffix + headerExtST.render();
                files.push(this.getOutputFile(header));
            }
        }

        if (this.generateListeners ?? true) {
            // Add generated listener, e.g., TListener.java.
            if (this.generator.target.needsHeader()) {
                files.push(this.getOutputFile(this.generator.getListenerFileName(true)));
            }
            files.push(this.getOutputFile(this.generator.getListenerFileName(false)));

            // Add generated base listener; e.g., TBaseListener.java.
            if (this.generator.target.needsHeader()) {
                files.push(this.getOutputFile(this.generator.getBaseListenerFileName(true)));
            }
            files.push(this.getOutputFile(this.generator.getBaseListenerFileName(false)));
        }

        if (this.generateVisitors) {
            // Add generated visitor, e.g. TVisitor.java.
            if (this.generator.target.needsHeader()) {
                files.push(this.getOutputFile(this.generator.getVisitorFileName(true)));
            }
            files.push(this.getOutputFile(this.generator.getVisitorFileName(false)));

            // Add generated base visitor, e.g. TBaseVisitor.java.
            if (this.generator.target.needsHeader()) {
                files.push(this.getOutputFile(this.generator.getBaseVisitorFileName(true)));
            }
            files.push(this.getOutputFile(this.generator.getBaseVisitorFileName(false)));
        }

        // Handle generated files for imported grammars.
        const imports = this.g.getAllImportedGrammars();
        for (const g of imports) {
            files.push(this.getOutputFile(g.fileName));
        }

        return files;
    }

    public getOutputFile(fileName: string): URL {
        let outputDir = this.tool.getOutputDirectory(this.g.fileName);
        if (outputDir === ".") {
            // Pay attention to -o then.
            outputDir = this.tool.getOutputDirectory(fileName);
        }

        if (outputDir === ".") {
            return new URL(fileName);
        }

        return new URL(fileName, outputDir);
    }

    /**
     * @returns a list of urls that name files ANTLR will read to process T.g. This can be .tokens files if the
     * grammar uses the tokenVocab option as well as any imported grammar files.
     */
    public getDependenciesFileList(): URL[] {
        // Find all the things other than imported grammars.
        const files = this.getNonImportDependenciesFileList();

        // Handle imported grammars.
        const imports = this.g.getAllImportedGrammars();
        const libDirectory = this.libDirectory ?? ".";
        for (const g of imports) {
            const fileName = this.groomQualifiedFileName(libDirectory, g.fileName);
            files.push(new URL(fileName));
        }

        return files;
    }

    /**
     * Return a list of File objects that name files ANTLR will read to process T.g; This can only be .tokens files
     * and only if they use the tokenVocab option.
     *
     * @returns List of dependencies other than imported grammars
     */
    public getNonImportDependenciesFileList(): URL[] {
        const files = new Array<URL>();

        // Handle token vocabulary loads.
        const tokenVocab = this.g.getOptionString("tokenVocab");
        if (tokenVocab !== undefined) {
            const fileName = tokenVocab + Constants.VocabFileExtension;
            let vocabFile: URL;
            const libDirectory = this.libDirectory ?? ".";
            if (libDirectory === ".") {
                vocabFile = new URL(fileName);
            } else {
                vocabFile = new URL(fileName, libDirectory);
            }
            files.push(vocabFile);
        }

        return files;
    }

    public getDependencies(): IST {
        this.loadDependencyTemplates();
        const dependenciesST = this.templates!.getInstanceOf("dependencies")!;
        dependenciesST.add("in", this.getDependenciesFileList());
        dependenciesST.add("out", this.getGeneratedFileList());
        dependenciesST.add("grammarFileName", this.g.fileName);

        return dependenciesST;
    }

    public loadDependencyTemplates(): void {
        if (this.templates) {
            return;
        }

        const templatePath = fileURLToPath(new URL("../../templates/depend.stg", import.meta.url));
        this.templates = new STGroupFile(templatePath, "utf-8");
    }

    public getGenerator(): CodeGenerator {
        return this.generator;
    }

    public groomQualifiedFileName(outputDir: string, fileName: string): string {
        if (outputDir === ".") {
            return fileName;
        } else if (outputDir.includes(" ")) { // Has spaces?
            const escSpaces = outputDir.replaceAll(" ", "\\ ");

            return escSpaces + "/" + fileName;
        } else {
            return outputDir + "/" + fileName;
        }
    }
}

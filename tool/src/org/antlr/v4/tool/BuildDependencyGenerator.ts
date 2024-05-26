/* java2ts: keep */

/*
 * Copyright (c) The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

/* eslint-disable jsdoc/require-returns, jsdoc/require-param */

import { STGroupFile, type STGroup } from "stringtemplate4ts";

import type { IST } from "stringtemplate4ts/dist/compiler/common.js";
import { ANTLRv4Parser } from "../../../../../../src/generated/ANTLRv4Parser.js";
import { Tool } from "../Tool.js";
import { CodeGenerator } from "../codegen/CodeGenerator.js";
import { Grammar } from "./Grammar.js";

/**
 * Given a grammar file, show the dependencies on .tokens etc...
 *  Using ST, emit a simple "make compatible" list of dependencies.
 *  For example, combined grammar T.g (no token import) generates:
 *
 *  	TParser.java : T.g
 *  	T.tokens : T.g
 *  	TLexer.java : T.g
 *
 *  If we are using the listener pattern (-listener on the command line)
 *  then we add:
 *
 *      TListener.java : T.g
 *      TBaseListener.java : T.g
 *
 *  If we are using the visitor pattern (-visitor on the command line)
 *  then we add:
 *
 *      TVisitor.java : T.g
 *      TBaseVisitor.java : T.g
 *
 *  If "-lib libDir" is used on command-line with -depend and option
 *  tokenVocab=A in grammar, then include the path like this:
 *
 * 		T.g: libDir/A.tokens
 *
 *  Pay attention to -o as well:
 *
 * 		outputdir/TParser.java : T.g
 *
 *  So this output shows what the grammar depends on *and* what it generates.
 *
 *  Operate on one grammar file at a time.  If given a list of .g on the
 *  command-line with -depend, just emit the dependencies.  The grammars
 *  may depend on each other, but the order doesn't matter.  Build tools,
 *  reading in this output, will know how to organize it.
 *
 *  This code was obvious until I removed redundant "./" on front of files
 *  and had to escape spaces in filenames :(
 *
 *  I literally copied from v3 so might be slightly inconsistent with the
 *  v4 code base.
 */
export class BuildDependencyGenerator {
    protected tool: Tool;
    protected g: Grammar;
    protected generator: CodeGenerator;
    protected templates: STGroup;

    public constructor(tool: Tool, g: Grammar) {
        this.tool = tool;
        this.g = g;
        this.generator = CodeGenerator.fromGrammar(g);
    }

    /**
     * From T.g return a list of URL objects that name files ANTLR will emit from T.g.
     */
    public getGeneratedFileList(): URL[] {
        const files = new Array<URL>();

        // add generated recognizer; e.g., TParser.java
        if (this.generator.getTarget().needsHeader()) {
            files.push(this.getOutputFile(this.generator.getRecognizerFileName(true)));
        }

        files.push(this.getOutputFile(this.generator.getRecognizerFileName(false)));

        // add output vocab file; e.g., T.tokens. This is always generated to
        // the base output directory, which will be just . if there is no -o option
        //
        files.push(this.getOutputFile(this.generator.getVocabFileName()));

        // are we generating a .h file?
        let headerExtST = null;
        const extST = this.generator.getTemplates().getInstanceOf("codeFileExtension");
        if (this.generator.getTemplates().isDefined("headerFile")) {
            headerExtST = this.generator.getTemplates().getInstanceOf("headerFileExtension");
            const suffix = Grammar.getGrammarTypeToFileNameSuffix(this.g.getType());
            const fileName = this.g.name + suffix + headerExtST?.render();
            files.push(this.getOutputFile(fileName));
        }

        if (this.g.isCombined()) {
            // add autogenerated lexer; e.g., TLexer.java TLexer.h TLexer.tokens
            const suffix = Grammar.getGrammarTypeToFileNameSuffix(ANTLRv4Parser.LEXER);
            const lexer = this.g.name + suffix + extST?.render();
            files.push(this.getOutputFile(lexer));

            const lexerTokens = this.g.name + suffix + CodeGenerator.VOCAB_FILE_EXTENSION;
            files.push(this.getOutputFile(lexerTokens));

            // TLexer.h
            if (headerExtST !== null) {
                const header = this.g.name + suffix + headerExtST.render();
                files.push(this.getOutputFile(header));
            }
        }

        if (this.g.tool.gen_listener) {
            // add generated listener; e.g., TListener.java
            if (this.generator.getTarget().needsHeader()) {
                files.push(this.getOutputFile(this.generator.getListenerFileName(true)));
            }
            files.push(this.getOutputFile(this.generator.getListenerFileName(false)));

            // add generated base listener; e.g., TBaseListener.java
            if (this.generator.getTarget().needsHeader()) {
                files.push(this.getOutputFile(this.generator.getBaseListenerFileName(true)));
            }
            files.push(this.getOutputFile(this.generator.getBaseListenerFileName(false)));
        }

        if (this.g.tool.gen_visitor) {
            // add generated visitor; e.g., TVisitor.java
            if (this.generator.getTarget().needsHeader()) {
                files.push(this.getOutputFile(this.generator.getVisitorFileName(true)));
            }
            files.push(this.getOutputFile(this.generator.getVisitorFileName(false)));

            // add generated base visitor; e.g., TBaseVisitor.java
            if (this.generator.getTarget().needsHeader()) {
                files.push(this.getOutputFile(this.generator.getBaseVisitorFileName(true)));
            }
            files.push(this.getOutputFile(this.generator.getBaseVisitorFileName(false)));
        }

        // handle generated files for imported grammars
        const imports = this.g.getAllImportedGrammars();
        if (imports !== null) {
            for (const g of imports) {
                files.push(this.getOutputFile(g.fileName));
            }
        }

        return files;
    }

    public getOutputFile(fileName: string): URL {
        let outputDir = this.tool.getOutputDirectory(this.g.fileName);
        if (outputDir.pathname === ".") {
            // pay attention to -o then
            outputDir = this.tool.getOutputDirectory(fileName);
        }

        if (outputDir.pathname === ".") {
            return new URL(fileName);
        }

        /*if (outputDir.getName().equals(".")) {
            const fname = outputDir.toString();
            const dot = fname.lastIndexOf(".");
            outputDir = new File(outputDir.toString().substring(0, dot));
        }*/

        return new URL(fileName, outputDir);
    }

    /**
     * Return a list of File objects that name files ANTLR will read
     * to process T.g; This can be .tokens files if the grammar uses the tokenVocab option
     * as well as any imported grammar files.
     */
    public getDependenciesFileList(): URL[] {
        // Find all the things other than imported grammars
        const files = this.getNonImportDependenciesFileList();

        // Handle imported grammars
        const imports = this.g.getAllImportedGrammars();
        for (const g of imports) {
            const libDir = this.tool.libDirectory;
            const fileName = this.groomQualifiedFileName(libDir, g.fileName);
            files.push(new URL(fileName));
        }

        return files;
    }

    /**
     * Return a list of File objects that name files ANTLR will read
     * to process T.g; This can only be .tokens files and only
     * if they use the tokenVocab option.
     *
     * @returns List of dependencies other than imported grammars
     */
    public getNonImportDependenciesFileList(): URL[] {
        const files = new Array<URL>();

        // handle token vocabulary loads
        const tokenVocab = this.g.getOptionString("tokenVocab");
        if (tokenVocab !== null) {
            const fileName = tokenVocab + CodeGenerator.VOCAB_FILE_EXTENSION;
            let vocabFile: URL;
            if (this.tool.libDirectory === ".") {
                vocabFile = new URL(fileName);
            } else {
                vocabFile = new URL(fileName, this.tool.libDirectory);
            }
            files.push(vocabFile);
        }

        return files;
    }

    public getDependencies(): IST {
        this.loadDependencyTemplates();
        const dependenciesST = this.templates.getInstanceOf("dependencies")!;
        dependenciesST.add("in", this.getDependenciesFileList());
        dependenciesST.add("out", this.getGeneratedFileList());
        dependenciesST.add("grammarFileName", this.g.fileName);

        return dependenciesST;
    }

    public loadDependencyTemplates(): void {
        if (this.templates !== null) {
            return;
        }

        const fileName = "org/antlr/v4/tool/templates/depend.stg";
        this.templates = new STGroupFile(fileName, "UTF-8");
    }

    public getGenerator(): CodeGenerator {
        return this.generator;
    }

    public groomQualifiedFileName(outputDir: string, fileName: string): string {
        if (outputDir === ".") {
            return fileName;
        } else {
            if (outputDir.indexOf(" ") >= 0) { // has spaces?
                const escSpaces = outputDir.replace(" ", "\\ ");

                return escSpaces + "/" + fileName;
            }
            else {
                return outputDir + "/" + fileName;
            }
        }

    }
}

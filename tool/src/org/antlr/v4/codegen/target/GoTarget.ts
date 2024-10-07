/*
 * Copyright (c) The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

// cspell: ignore gofmt ioutil wjkohnen

import path from "path";
import type { ST } from "stringtemplate4ts";
import { GrammarType } from "../../support/GrammarType.js";
import { Grammar } from "../../tool/Grammar.js";
import { Target } from "../Target.js";

export class GoTarget extends Target {
    protected static readonly reservedWords = new Set([
        // keywords
        "break", "default", "func", "interface", "select",
        "case", "defer", "go", "map", "struct",
        "chan", "else", "goto", "package", "switch",
        "const", "fallthrough", "if", "range", "type",
        "continue", "for", "import", "return", "var",

        // pre-declared identifiers https://golang.org/ref/spec#Predeclared_identifiers
        "bool", "byte", "complex64", "complex128", "error", "float32", "float64",
        "int", "int8", "int16", "int32", "int64", "rune", "string",
        "uint", "uint8", "uint16", "uint32", "uint64", "uintptr",
        "true", "false", "iota", "nil",
        "append", "cap", "close", "complex", "copy", "delete", "imag", "len",
        "make", "new", "panic", "print", "println", "real", "recover",
        "string",

        // interface definition of RuleContext from runtime/Go/antlr/rule_context.go
        "Accept", "GetAltNumber", "GetBaseRuleContext", "GetChild", "GetChildCount",
        "GetChildren", "GetInvokingState", "GetParent", "GetPayload", "GetRuleContext",
        "GetRuleIndex", "GetSourceInterval", "GetText", "IsEmpty", "SetAltNumber",
        "SetInvokingState", "SetParent", "String",

        // misc
        "rule", "parserRule", "action",

        // The use of start or stop abd others as a label name will cause the generation of a GetStart() or
        // GetStop() method, which then clashes with the GetStart() or GetStop() method that is generated by the
        // code gen for the rule. So, we need to convert it. This is not ideal as it will still probably confuse
        // authors of parse listeners etc. but the code will compile.
        "start", "stop", "exception",
    ]);

    private static readonly DO_GOFMT: boolean = (() => {
        let result = false;

        let value = process.env.ANTLR_GO_DISABLE_GOFMT;
        if (value == null) {
            value = process.env["antlr.go.disable-gofmt"];
        }

        if (value != null) {
            result = value.toLowerCase() === "true";
        }

        return result;
    })();

    public override  getRecognizerFileName(header: boolean): string {
        const gen = this.getCodeGenerator();
        const g = gen.g!;
        let name: string;
        switch (g.getType()) {
            case GrammarType.Parser: {
                name = g.name.endsWith("Parser") ? g.name.substring(0, g.name.length - 6) : g.name;

                return name.toLowerCase() + "_parser.go";
            }

            case GrammarType.Lexer: {
                name = g.name.endsWith("Lexer") ? g.name.substring(0, g.name.length - 5) : g.name; // trim off "lexer"

                return name.toLowerCase() + "_lexer.go";
            }

            case GrammarType.Combined: {
                return g.name.toLowerCase() + "_parser.go";
            }

            default: {
                return "INVALID_FILE_NAME";
            }

        }
    }

    /**
     * A given grammar T, return the listener name such as
     *  TListener.java, if we're using the Java target.
     */
    public override  getListenerFileName(header: boolean): string {
        const gen = this.getCodeGenerator();
        const g = gen.g!;

        /* assert g.name != null; */
        return g.name.toLowerCase() + "_listener.go";
    }

    /**
     * A given grammar T, return the visitor name such as
     *  TVisitor.java, if we're using the Java target.
     */
    public override  getVisitorFileName(header: boolean): string {
        const gen = this.getCodeGenerator();
        const g = gen.g!;

        /* assert g.name != null; */
        return g.name.toLowerCase() + "_visitor.go";
    }

    /**
     * A given grammar T, return a blank listener implementation
     *  such as TBaseListener.java, if we're using the Java target.
     */
    public override  getBaseListenerFileName(header: boolean): string {
        const gen = this.getCodeGenerator();
        const g = gen.g!;

        /* assert g.name != null; */
        return g.name.toLowerCase() + "_base_listener.go";
    }

    /**
     * A given grammar T, return a blank listener implementation
     *  such as TBaseListener.java, if we're using the Java target.
     */
    public override  getBaseVisitorFileName(header: boolean): string {
        const gen = this.getCodeGenerator();
        const g = gen.g!;

        /* assert g.name != null; */
        return g.name.toLowerCase() + "_base_visitor.go";
    }

    protected override  get reservedWords(): Set<string> {
        return GoTarget.reservedWords;
    }

    public override  genFile(g: Grammar | undefined, outputFileST: ST, fileName: string): void {
        super.genFile(g, outputFileST, fileName);
        if (g && GoTarget.DO_GOFMT && !fileName.startsWith(".") /* criterion taken from gofmt */
            && fileName.endsWith(".go")) {
            this.gofmt(path.join(this.getCodeGenerator().tool.getOutputDirectory(g.fileName), fileName));
        }
    }

    private gofmt(fileName: string): void {
        // Optimistically run gofmt. If this fails, it doesn't matter at this point. Wait for termination though,
        // because "gofmt -w" uses ioutil.WriteFile internally, which means it literally writes in-place with O_TRUNC.
        // That could result in a race. (Why oh why doesn't it do tmpfile + rename?)
        /*try {
            // TODO: need something like: String goExecutable = locateGo();
            const gofmtBuilder = new ProcessBuilder("gofmt", "-w", "-s", fileName.getPath());
            gofmtBuilder.redirectErrorStream(true);
            const gofmt = gofmtBuilder.start();
            const stdout = gofmt.getInputStream();
            // TODO(wjkohnen): simplify to `while (stdout.Read() > 1) {}`
            const buf = new Int8Array(1 << 10);
            for (let l = 0; l > -1; l = stdout.read(buf)) {
                // There should not be any output that exceeds the implicit output buffer. In normal ops there should be
                // zero output. In case there is output, blocking and therefore killing the process is acceptable. This
                // drains the buffer anyway to play it safe.

                // dirty debug (change -w above to -d):
                // System.err.write(buf, 0, l);
            }
            gofmt.waitFor();
        } catch (eOrForward) {
            if (eOrForward instanceof IOException) {
                // Probably gofmt not in $PATH, in any case ignore.
                const e = eOrForward;
            } else if (eOrForward instanceof InterruptedException) {
                const forward = eOrForward;
                Thread.currentThread().interrupt();
            } else {
                throw eOrForward;
            }
        }*/
    }
}

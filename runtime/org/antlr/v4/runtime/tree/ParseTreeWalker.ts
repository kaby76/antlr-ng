/* java2ts: keep */

/*
 * Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

import { JavaObject } from "jree";
import { isErrorNode } from "./ErrorNode";
import { ParseTree } from "./ParseTree";
import { ParseTreeListener } from "./ParseTreeListener";
import { RuleNode } from "./RuleNode";
import { isTerminalNode } from "./TerminalNode";
import { ParserRuleContext } from "../ParserRuleContext";

export class ParseTreeWalker extends JavaObject {
    public static readonly DEFAULT: ParseTreeWalker | null = new ParseTreeWalker();

    /**
     * Performs a walk on the given parse tree starting at the root and going down recursively
     * with depth-first search. On each node, {@link ParseTreeWalker#enterRule} is called before
     * recursively walking down into child nodes, then
     * {@link ParseTreeWalker#exitRule} is called after the recursive call to wind up.
     *
     * @param listener The listener used by the walker to process grammar rules
     * @param t The parse tree to be walked on
     */
    public walk = (listener: ParseTreeListener, t: ParseTree): void => {
        if (isErrorNode(t)) {
            listener.visitErrorNode(t);

            return;
        } else {
            if (isTerminalNode(t)) {
                listener.visitTerminal(t);

                return;
            }
        }

        const r = t as RuleNode;
        this.enterRule(listener, r);
        const n = r.getChildCount();
        for (let i = 0; i < n; i++) {
            this.walk(listener, r.getChild(i)!);
        }
        this.exitRule(listener, r);
    };

    /**
     * Enters a grammar rule by first triggering the generic event {@link ParseTreeListener#enterEveryRule}
     * then by triggering the event specific to the given parse tree node
     *
     * @param listener The listener responding to the trigger events
     * @param r The grammar rule containing the rule context
     */
    protected enterRule = (listener: ParseTreeListener, r: RuleNode): void => {
        const ctx = r.getRuleContext() as ParserRuleContext;
        listener.enterEveryRule(ctx);
        ctx.enterRule(listener);
    };

    /**
     * Exits a grammar rule by first triggering the event specific to the given parse tree node
     * then by triggering the generic event {@link ParseTreeListener#exitEveryRule}
     *
     * @param listener The listener responding to the trigger events
     * @param r The grammar rule containing the rule context
     */
    protected exitRule = (listener: ParseTreeListener, r: RuleNode): void => {
        const ctx = r.getRuleContext() as ParserRuleContext;
        ctx.exitRule(listener);
        listener.exitEveryRule(ctx);
    };
}

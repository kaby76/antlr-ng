/*
 * Copyright (c) The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

// $ANTLR 3.5.3 org/antlr/v4/parse/BlockSetTransformer.g

/* eslint-disable max-len, @typescript-eslint/naming-convention */
// cspell: disable

import { RecognitionException } from "antlr4ng";

import { EarlyExitException } from "../antlr3/EarlyExitException.js";
import { FailedPredicateException } from "../antlr3/FailedPredicateException.js";
import { createRecognizerSharedState, IRecognizerSharedState } from "../antlr3/IRecognizerSharedState.js";
import { MismatchedSetException } from "../antlr3/MismatchedSetException.js";
import { NoViableAltException } from "../antlr3/NoViableAltException.js";
import { CommonTreeAdaptor } from "../antlr3/tree/CommonTreeAdaptor.js";
import { RewriteRuleNodeStream } from "../antlr3/tree/RewriteRuleNodeStream.js";
import { RewriteRuleSubtreeStream } from "../antlr3/tree/RewriteRuleSubtreeStream.js";
import type { TreeNodeStream } from "../antlr3/tree/TreeNodeStream.js";
import { TreeRewriter } from "../antlr3/tree/TreeRewriter.js";
import { type ITreeRuleReturnScope } from "../antlr3/tree/TreeRuleReturnScope.js";
import { Constants } from "../constants.js";
import { CharSupport } from "../misc/CharSupport.js";
import { isTokenName } from "../support/helpers.js";
import { AltAST } from "../tool/ast/AltAST.js";
import { BlockAST } from "../tool/ast/BlockAST.js";
import { GrammarAST } from "../tool/ast/GrammarAST.js";
import { Grammar } from "../tool/Grammar.js";
import { GrammarTransformPipeline } from "../tool/GrammarTransformPipeline.js";
import type { CommonTree } from "../tree/CommonTree.js";
import { GrammarTreeVisitor } from "./GrammarTreeVisitor.js";

export class BlockSetTransformer extends TreeRewriter {
    public static readonly tokenNames = [
        "<invalid>", "<EOR>", "<DOWN>", "<UP>", "ACTION", "ACTION_CHAR_LITERAL",
        "ACTION_ESC", "ACTION_STRING_LITERAL", "ARG_ACTION", "ARG_OR_CHARSET",
        "ASSIGN", "AT", "CATCH", "CHANNELS", "COLON", "COLONCOLON", "COMMA", "COMMENT",
        "DOC_COMMENT", "DOLLAR", "DOT", "ERRCHAR", "ESC_SEQ", "FINALLY", "FRAGMENT",
        "GRAMMAR", "GT", "HEX_DIGIT", "ID", "IMPORT", "INT", "LEXER", "LEXER_CHAR_SET",
        "LOCALS", "LPAREN", "LT", "MODE", "NESTED_ACTION", "NLCHARS", "NOT", "NameChar",
        "NameStartChar", "OPTIONS", "OR", "PARSER", "PLUS", "PLUS_ASSIGN", "POUND",
        "QUESTION", "RANGE", "RARROW", "RBRACE", "RETURNS", "RPAREN", "RULE_REF",
        "SEMI", "SEMPRED", "SRC", "STAR", "STRING_LITERAL", "THROWS", "TOKENS_SPEC",
        "TOKEN_REF", "UNICODE_ESC", "UNICODE_EXTENDED_ESC", "UnicodeBOM", "WS",
        "WSCHARS", "WSNLCHARS", "ALT", "BLOCK", "CLOSURE", "COMBINED", "ELEMENT_OPTIONS",
        "EPSILON", "LEXER_ACTION_CALL", "LEXER_ALT_ACTION", "OPTIONAL", "POSITIVE_CLOSURE",
        "RULE", "RULEMODIFIERS", "RULES", "SET", "WILDCARD"
    ];
    public static readonly EOF = -1;
    public static readonly ACTION = 4;
    public static readonly ACTION_CHAR_LITERAL = 5;
    public static readonly ACTION_ESC = 6;
    public static readonly ACTION_STRING_LITERAL = 7;
    public static readonly ARG_ACTION = 8;
    public static readonly ARG_OR_CHARSET = 9;
    public static readonly ASSIGN = 10;
    public static readonly AT = 11;
    public static readonly CATCH = 12;
    public static readonly CHANNELS = 13;
    public static readonly COLON = 14;
    public static readonly COLONCOLON = 15;
    public static readonly COMMA = 16;
    public static readonly COMMENT = 17;
    public static readonly DOC_COMMENT = 18;
    public static readonly DOLLAR = 19;
    public static readonly DOT = 20;
    public static readonly ERRCHAR = 21;
    public static readonly ESC_SEQ = 22;
    public static readonly FINALLY = 23;
    public static readonly FRAGMENT = 24;
    public static readonly GRAMMAR = 25;
    public static readonly GT = 26;
    public static readonly HEX_DIGIT = 27;
    public static readonly ID = 28;
    public static readonly IMPORT = 29;
    public static readonly INT = 30;
    public static readonly LEXER = 31;
    public static readonly LEXER_CHAR_SET = 32;
    public static readonly LOCALS = 33;
    public static readonly LPAREN = 34;
    public static readonly LT = 35;
    public static readonly MODE = 36;
    public static readonly NESTED_ACTION = 37;
    public static readonly NLCHARS = 38;
    public static readonly NOT = 39;
    public static readonly NameChar = 40;
    public static readonly NameStartChar = 41;
    public static readonly OPTIONS = 42;
    public static readonly OR = 43;
    public static readonly PARSER = 44;
    public static readonly PLUS = 45;
    public static readonly PLUS_ASSIGN = 46;
    public static readonly POUND = 47;
    public static readonly QUESTION = 48;
    public static readonly RANGE = 49;
    public static readonly RARROW = 50;
    public static readonly RBRACE = 51;
    public static readonly RETURNS = 52;
    public static readonly RPAREN = 53;
    public static readonly RULE_REF = 54;
    public static readonly SEMI = 55;
    public static readonly SEMPRED = 56;
    public static readonly SRC = 57;
    public static readonly STAR = 58;
    public static readonly STRING_LITERAL = 59;
    public static readonly THROWS = 60;
    public static readonly TOKENS_SPEC = 61;
    public static readonly TOKEN_REF = 62;
    public static readonly UNICODE_ESC = 63;
    public static readonly UNICODE_EXTENDED_ESC = 64;
    public static readonly UnicodeBOM = 65;
    public static readonly WS = 66;
    public static readonly WSCHARS = 67;
    public static readonly WSNLCHARS = 68;
    public static readonly ALT = 69;
    public static readonly BLOCK = 70;
    public static readonly CLOSURE = 71;
    public static readonly COMBINED = 72;
    public static readonly ELEMENT_OPTIONS = 73;
    public static readonly EPSILON = 74;
    public static readonly LEXER_ACTION_CALL = 75;
    public static readonly LEXER_ALT_ACTION = 76;
    public static readonly OPTIONAL = 77;
    public static readonly POSITIVE_CLOSURE = 78;
    public static readonly RULE = 79;
    public static readonly RULEMODIFIERS = 80;
    public static readonly RULES = 81;
    public static readonly SET = 82;
    public static readonly WILDCARD = 83;

    private currentRuleName?: string;
    private currentAlt: GrammarAST;
    private g: Grammar;

    private adaptor = new CommonTreeAdaptor();

    public constructor(input: TreeNodeStream, stateOrGrammar?: IRecognizerSharedState | Grammar) {
        let state: IRecognizerSharedState | undefined;
        if (!stateOrGrammar) {
            state = createRecognizerSharedState();
        } else if (!(stateOrGrammar instanceof Grammar)) {
            state = stateOrGrammar;
        }

        super(input, state);
        if (stateOrGrammar instanceof Grammar) {
            this.g = stateOrGrammar;
        }
    }

    public getDelegates(): TreeRewriter[] {
        return [];
    }

    public setTreeAdaptor(adaptor: CommonTreeAdaptor): void {
        this.adaptor = adaptor;
    }

    public override getTokenNames(): string[] {
        return BlockSetTransformer.tokenNames;
    }

    // org/antlr/v4/parse/BlockSetTransformer.g:63:1: topdown : ( ^( RULE (id= TOKEN_REF |id= RULE_REF ) ( . )+ ) | setAlt | ebnfBlockSet | blockSet );

    public override topdown = (): ITreeRuleReturnScope<GrammarAST> => {
        const retval: ITreeRuleReturnScope<GrammarAST> = {};
        retval.start = this.input.LT(1) ?? undefined;

        let _first_0 = null;
        let _last = null;

        let id = null;
        let RULE1 = null;
        let wildcard2 = null;
        let setAlt3 = null;
        let ebnfBlockSet4 = null;
        let blockSet5 = null;

        try {
            // org/antlr/v4/parse/BlockSetTransformer.g:64:5: ( ^( RULE (id= TOKEN_REF |id= RULE_REF ) ( . )+ ) | setAlt | ebnfBlockSet | blockSet )
            let alt3 = 4;
            switch (this.input.LA(1)) {
                case GrammarTreeVisitor.RULE: {
                    {
                        alt3 = 1;
                    }
                    break;
                }

                case GrammarTreeVisitor.ALT: {
                    {
                        alt3 = 2;
                    }
                    break;
                }

                case GrammarTreeVisitor.CLOSURE:
                case GrammarTreeVisitor.OPTIONAL:
                case GrammarTreeVisitor.POSITIVE_CLOSURE: {
                    {
                        alt3 = 3;
                    }
                    break;
                }

                case GrammarTreeVisitor.BLOCK: {
                    {
                        alt3 = 4;
                    }
                    break;
                }

                default: {
                    if (this.state.backtracking > 0) {
                        this.state.failed = true;

                        return retval;
                    }
                    const nvae = new NoViableAltException("", 3, 0, this.input);
                    throw nvae;
                }

            }
            switch (alt3) {
                case 1: {
                    // org/antlr/v4/parse/BlockSetTransformer.g:64:7: ^( RULE (id= TOKEN_REF |id= RULE_REF ) ( . )+ )
                    {
                        _last = this.input.LT(1) as GrammarAST;
                        {
                            const _save_last_1 = _last;
                            let _first_1 = null;
                            _last = this.input.LT(1) as GrammarAST;
                            RULE1 = this.match(this.input, BlockSetTransformer.RULE, null) as GrammarAST;
                            if (this.state.failed) {
                                return retval;
                            }

                            if (this.state.backtracking === 1) {
                                _first_0 = RULE1;
                            }

                            this.match(this.input, Constants.DOWN, null);
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            if (this.state.failed) { // This is set in this.match().
                                return retval;
                            }

                            // org/antlr/v4/parse/BlockSetTransformer.g:64:14: (id= TOKEN_REF |id= RULE_REF )
                            let alt1 = 2;
                            const LA1_0 = this.input.LA(1);
                            if ((LA1_0 === BlockSetTransformer.TOKEN_REF)) {
                                alt1 = 1;
                            } else {
                                if ((LA1_0 === BlockSetTransformer.RULE_REF)) {
                                    alt1 = 2;
                                } else {
                                    if (this.state.backtracking > 0) {
                                        this.state.failed = true;

                                        return retval;
                                    }
                                    const nvae = new NoViableAltException("", 1, 0, this.input);
                                    throw nvae;
                                }
                            }

                            switch (alt1) {
                                case 1: {
                                    // org/antlr/v4/parse/BlockSetTransformer.g:64:15: id= TOKEN_REF
                                    {
                                        _last = this.input.LT(1) as GrammarAST;
                                        id = this.match(this.input, BlockSetTransformer.TOKEN_REF, null) as GrammarAST;
                                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                        if (this.state.failed) {
                                            return retval;
                                        }

                                        if (this.state.backtracking === 1) {
                                            _first_1 = id;
                                        }

                                        if (this.state.backtracking === 1) {
                                            retval.tree = _first_0 ?? undefined;
                                            if (retval.tree!.getParent()?.isNil()) {

                                                retval.tree = retval.tree!.getParent() as GrammarAST;
                                            }

                                        }

                                    }
                                    break;
                                }

                                case 2: {
                                    // org/antlr/v4/parse/BlockSetTransformer.g:64:28: id= RULE_REF
                                    {
                                        _last = this.input.LT(1) as GrammarAST;
                                        id = this.match(this.input, BlockSetTransformer.RULE_REF, null) as GrammarAST;
                                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                        if (this.state.failed) {
                                            return retval;
                                        }

                                        if (this.state.backtracking === 1) {
                                            _first_1 = id;
                                        }

                                        if (this.state.backtracking === 1) {
                                            retval.tree = _first_0 ?? undefined;
                                            if (retval.tree!.getParent()?.isNil()) {

                                                retval.tree = retval.tree!.getParent() as GrammarAST;
                                            }

                                        }

                                    }
                                    break;
                                }

                                default:

                            }

                            if (this.state.backtracking === 1) {
                                this.currentRuleName = id?.getText() ?? undefined;
                            }

                            // org/antlr/v4/parse/BlockSetTransformer.g:64:69: ( . )+
                            let cnt2 = 0;
                            loop2:
                            while (true) {
                                let alt2 = 2;
                                const LA2_0 = this.input.LA(1);
                                if (((LA2_0 >= BlockSetTransformer.ACTION && LA2_0 <= BlockSetTransformer.WILDCARD))) {
                                    alt2 = 1;
                                } else {
                                    if ((LA2_0 === Constants.UP)) {
                                        alt2 = 2;
                                    }
                                }

                                switch (alt2) {
                                    case 1: {
                                        // org/antlr/v4/parse/BlockSetTransformer.g:64:69: .
                                        {
                                            _last = this.input.LT(1) as GrammarAST;
                                            wildcard2 = this.input.LT(1) as GrammarAST;
                                            this.matchAny(this.input);
                                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                            if (this.state.failed) {
                                                return retval;
                                            }

                                            if (this.state.backtracking === 1) {

                                                if (_first_1 === null) {
                                                    _first_1 = wildcard2;
                                                }

                                            }

                                            if (this.state.backtracking === 1) {
                                                retval.tree = _first_0 ?? undefined;
                                                if (retval.tree!.getParent()?.isNil()) {

                                                    retval.tree = retval.tree!.getParent() as GrammarAST;
                                                }

                                            }

                                        }
                                        break;
                                    }

                                    default: {
                                        if (cnt2 >= 1) {
                                            break loop2;
                                        }

                                        if (this.state.backtracking > 0) {
                                            this.state.failed = true;

                                            return retval;
                                        }
                                        const eee = new EarlyExitException(2, this.input);
                                        throw eee;
                                    }

                                }
                                cnt2++;
                            }

                            this.match(this.input, Constants.UP, null);
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            if (this.state.failed) {
                                return retval;
                            }

                            _last = _save_last_1;
                        }

                        if (this.state.backtracking === 1) {
                            retval.tree = _first_0 ?? undefined;
                            if (retval.tree!.getParent()?.isNil()) {

                                retval.tree = retval.tree!.getParent() as GrammarAST;
                            }

                        }

                    }
                    break;
                }

                case 2: {
                    // org/antlr/v4/parse/BlockSetTransformer.g:65:7: setAlt
                    {
                        _last = this.input.LT(1) as GrammarAST;
                        this.pushFollow(null);
                        setAlt3 = this.setAlt();
                        this.state._fsp--;
                        if (this.state.failed) {
                            return retval;
                        }

                        if (this.state.backtracking === 1) {
                            _first_0 = setAlt3.tree!;
                        }

                        if (this.state.backtracking === 1) {
                            retval.tree = _first_0 ?? undefined;
                            if (retval.tree!.getParent()?.isNil()) {

                                retval.tree = retval.tree!.getParent() as GrammarAST;
                            }

                        }

                    }
                    break;
                }

                case 3: {
                    // org/antlr/v4/parse/BlockSetTransformer.g:66:7: ebnfBlockSet
                    {
                        _last = this.input.LT(1) as GrammarAST;
                        this.pushFollow(null);
                        ebnfBlockSet4 = this.ebnfBlockSet();
                        this.state._fsp--;
                        if (this.state.failed) {
                            return retval;
                        }

                        if (this.state.backtracking === 1) {
                            _first_0 = ebnfBlockSet4.tree;
                        }

                        if (this.state.backtracking === 1) {
                            retval.tree = _first_0 ?? undefined;
                            if (retval.tree!.getParent()?.isNil()) {
                                retval.tree = retval.tree!.getParent() as GrammarAST;
                            }
                        }
                    }

                    break;
                }

                case 4: {
                    // org/antlr/v4/parse/BlockSetTransformer.g:67:7: blockSet
                    {
                        _last = this.input.LT(1) as GrammarAST;
                        this.pushFollow(null);
                        blockSet5 = this.blockSet();
                        this.state._fsp--;
                        if (this.state.failed) {
                            return retval;
                        }

                        if (this.state.backtracking === 1) {
                            _first_0 = blockSet5.tree;
                        }

                        if (this.state.backtracking === 1) {
                            retval.tree = _first_0 ?? undefined;
                            if (retval.tree!.getParent()?.isNil()) {

                                retval.tree = retval.tree!.getParent() as GrammarAST;
                            }

                        }

                    }
                    break;
                }

                default:

            }
        } catch (re) {
            if (re instanceof RecognitionException) {
                this.reportError(re);
                this.recover(this.input, re);
            } else {
                throw re;
            }
        }

        return retval;
    };

    // $ANTLR start "setAlt"
    // org/antlr/v4/parse/BlockSetTransformer.g:70:1: setAlt :{...}? ALT ;
    public setAlt(): ITreeRuleReturnScope<GrammarAST> {
        const retval: ITreeRuleReturnScope<GrammarAST> = {};
        retval.start = this.input.LT(1) ?? undefined;

        let _first_0 = null;

        let ALT6 = null;
        try {
            // org/antlr/v4/parse/BlockSetTransformer.g:71:2: ({...}? ALT )
            // org/antlr/v4/parse/BlockSetTransformer.g:71:4: {...}? ALT
            {
                if (!((this.inContext("RULE BLOCK")))) {
                    if (this.state.backtracking > 0) {
                        this.state.failed = true;

                        return retval;
                    }
                    throw new FailedPredicateException(this.input, "setAlt", "inContext(\"RULE BLOCK\")");
                }
                const _last = this.input.LT(1) as GrammarAST;
                ALT6 = this.match(this.input, BlockSetTransformer.ALT, null) as GrammarAST;

                if (this.state.failed) {
                    return retval;
                }

                if (this.state.backtracking === 1) {
                    _first_0 = ALT6;
                }

                if (this.state.backtracking === 1) {
                    this.currentAlt = (retval.start as GrammarAST);
                }
                if (this.state.backtracking === 1) {
                    retval.tree = _first_0 ?? undefined;
                    if (retval.tree!.getParent()?.isNil()) {

                        retval.tree = retval.tree!.getParent() as GrammarAST;
                    }
                }
            }

        } catch (re) {
            if (re instanceof RecognitionException) {
                this.reportError(re);
                this.recover(this.input, re);
            } else {
                throw re;
            }
        }

        return retval;
    }

    // $ANTLR start "ebnfBlockSet"
    // org/antlr/v4/parse/BlockSetTransformer.g:76:1: ebnfBlockSet : ^( ebnfSuffix blockSet ) -> ^( ebnfSuffix ^( BLOCK ^( ALT blockSet ) ) ) ;
    public ebnfBlockSet(): ITreeRuleReturnScope<GrammarAST> {
        const retval: ITreeRuleReturnScope<GrammarAST> = {};
        retval.start = this.input.LT(1) ?? undefined;

        let root_0 = null;

        let _first_0 = null;
        let _last = null;

        let ebnfSuffix7 = null;
        let blockSet8 = null;

        const stream_blockSet = new RewriteRuleSubtreeStream(this.adaptor, "rule blockSet");
        const stream_ebnfSuffix = new RewriteRuleSubtreeStream(this.adaptor, "rule ebnfSuffix");

        try {
            // org/antlr/v4/parse/BlockSetTransformer.g:80:2: ( ^( ebnfSuffix blockSet ) -> ^( ebnfSuffix ^( BLOCK ^( ALT blockSet ) ) ) )
            // org/antlr/v4/parse/BlockSetTransformer.g:80:4: ^( ebnfSuffix blockSet )
            {
                _last = this.input.LT(1) as GrammarAST;
                {
                    const _save_last_1 = _last;
                    const _first_1 = null;
                    _last = this.input.LT(1) as GrammarAST;
                    this.pushFollow(null);
                    ebnfSuffix7 = this.ebnfSuffix();
                    this.state._fsp--;
                    if (this.state.failed) {
                        return retval;
                    }

                    if (this.state.backtracking === 1) {
                        stream_ebnfSuffix.add(ebnfSuffix7.tree ?? null);
                    }

                    if (this.state.backtracking === 1) {
                        _first_0 = ebnfSuffix7.tree;
                    }

                    this.match(this.input, Constants.DOWN, null);
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    if (this.state.failed) {
                        return retval;
                    }

                    _last = this.input.LT(1) as GrammarAST;
                    this.pushFollow(null);
                    blockSet8 = this.blockSet();
                    this.state._fsp--;
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    if (this.state.failed) {
                        return retval;
                    }

                    if (this.state.backtracking === 1) {
                        stream_blockSet.add(blockSet8.tree ?? null);
                    }

                    this.match(this.input, Constants.UP, null);
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    if (this.state.failed) {
                        return retval;
                    }

                    _last = _save_last_1;
                }

                // AST REWRITE
                // elements:
                // token labels:
                // rule labels: retval
                // token list labels:
                // rule list labels:
                // wildcard labels:
                if (this.state.backtracking === 1) {
                    root_0 = new GrammarAST();
                    // 80:27: -> ^( ebnfSuffix ^( BLOCK ^( ALT blockSet ) ) )
                    {
                        // org/antlr/v4/parse/BlockSetTransformer.g:80:30: ^( ebnfSuffix ^( BLOCK ^( ALT blockSet ) ) )
                        {
                            let root_1 = new GrammarAST();
                            root_1 = this.adaptor.becomeRoot(stream_ebnfSuffix.nextNode() as CommonTree, root_1) as GrammarAST;
                            // org/antlr/v4/parse/BlockSetTransformer.g:80:43: ^( BLOCK ^( ALT blockSet ) )
                            {
                                let root_2 = new GrammarAST();
                                root_2 = this.adaptor.becomeRoot(new BlockAST(BlockSetTransformer.BLOCK), root_2) as GrammarAST;
                                // org/antlr/v4/parse/BlockSetTransformer.g:80:61: ^( ALT blockSet )
                                {
                                    let root_3 = new GrammarAST();
                                    root_3 = this.adaptor.becomeRoot(new AltAST(BlockSetTransformer.ALT), root_3) as GrammarAST;
                                    root_3.addChild(stream_blockSet.nextTree());
                                    root_2.addChild(root_3);
                                }

                                root_1.addChild(root_2);
                            }

                            root_0.addChild(root_1);
                        }

                    }

                    retval.tree = this.adaptor.rulePostProcessing(root_0) as GrammarAST;
                    this.input.replaceChildren(retval.start?.getParent(),
                        retval.start!.getChildIndex(),
                        _last.getChildIndex(),
                        retval.tree);
                }

            }

            if (this.state.backtracking === 1) {
                GrammarTransformPipeline.setGrammarPtr(this.g, retval.tree!);
            }
        } catch (re) {
            if (re instanceof RecognitionException) {
                this.reportError(re);
                this.recover(this.input, re);
            } else {
                throw re;
            }
        }

        return retval;
    }

    // $ANTLR start "ebnfSuffix"
    // org/antlr/v4/parse/BlockSetTransformer.g:83:1: ebnfSuffix : ( OPTIONAL | CLOSURE | POSITIVE_CLOSURE );
    public ebnfSuffix(): ITreeRuleReturnScope<GrammarAST> {
        const retval: ITreeRuleReturnScope<GrammarAST> = {};
        retval.start = this.input.LT(1) ?? undefined;

        try {
            // org/antlr/v4/parse/BlockSetTransformer.g:85:2: ( OPTIONAL | CLOSURE | POSITIVE_CLOSURE )
            // org/antlr/v4/parse/BlockSetTransformer.g:
            {
                const _last = this.input.LT(1) as GrammarAST;
                const _set9 = this.input.LT(1) as GrammarAST;
                if (this.input.LA(1) === BlockSetTransformer.CLOSURE || (this.input.LA(1) >= BlockSetTransformer.OPTIONAL && this.input.LA(1) <= BlockSetTransformer.POSITIVE_CLOSURE)) {
                    this.input.consume();
                    this.state.errorRecovery = false;
                    this.state.failed = false;
                } else {
                    if (this.state.backtracking > 0) {
                        this.state.failed = true;

                        return retval;
                    }
                    const mse = new MismatchedSetException(null, this.input);
                    throw mse;
                }

                if (this.state.backtracking === 1) {
                    if (retval.tree!.getParent()?.isNil()) {

                        retval.tree = retval.tree!.getParent() as GrammarAST;
                    }
                }
            }

            if (this.state.backtracking === 1) {
                retval.tree = this.adaptor.dupNode((retval.start as GrammarAST)) as GrammarAST;
            }
        } catch (re) {
            if (re instanceof RecognitionException) {
                this.reportError(re);
                this.recover(this.input, re);
            } else {
                throw re;
            }
        }

        return retval;
    }

    // $ANTLR start "blockSet"
    // org/antlr/v4/parse/BlockSetTransformer.g:90:1: blockSet : ({...}? ^( BLOCK ^(alt= ALT ( elementOptions )? {...}? setElement[inLexer] ) ( ^( ALT ( elementOptions )? setElement[inLexer] ) )+ ) -> ^( BLOCK[$BLOCK.token] ^( ALT[$BLOCK.token,\"ALT\"] ^( SET[$BLOCK.token, \"SET\"] ( setElement )+ ) ) ) |{...}? ^( BLOCK ^( ALT ( elementOptions )? setElement[inLexer] ) ( ^( ALT ( elementOptions )? setElement[inLexer] ) )+ ) -> ^( SET[$BLOCK.token, \"SET\"] ( setElement )+ ) );
    public blockSet(): ITreeRuleReturnScope<GrammarAST> {
        const retval: ITreeRuleReturnScope<GrammarAST> = {};
        retval.start = this.input.LT(1) ?? undefined;

        let root_0 = null;

        let _last = null;

        let alt = null;
        let BLOCK10 = null;
        let ALT13 = null;
        let BLOCK16 = null;
        let ALT17 = null;
        let ALT20 = null;
        let elementOptions11 = null;
        let setElement12 = null;
        let elementOptions14 = null;
        let setElement15 = null;
        let elementOptions18 = null;
        let setElement19 = null;
        let elementOptions21 = null;
        let setElement22 = null;

        const stream_BLOCK = new RewriteRuleNodeStream(this.adaptor, "token BLOCK");
        const stream_ALT = new RewriteRuleNodeStream(this.adaptor, "token ALT");
        const stream_elementOptions = new RewriteRuleSubtreeStream(this.adaptor, "rule elementOptions");
        const stream_setElement = new RewriteRuleSubtreeStream(this.adaptor, "rule setElement");

        const inLexer = isTokenName(this.currentRuleName!);

        try {
            // org/antlr/v4/parse/BlockSetTransformer.g:97:2: ({...}? ^( BLOCK ^(alt= ALT ( elementOptions )? {...}? setElement[inLexer] ) ( ^( ALT ( elementOptions )? setElement[inLexer] ) )+ ) -> ^( BLOCK[$BLOCK.token] ^( ALT[$BLOCK.token,\"ALT\"] ^( SET[$BLOCK.token, \"SET\"] ( setElement )+ ) ) ) |{...}? ^( BLOCK ^( ALT ( elementOptions )? setElement[inLexer] ) ( ^( ALT ( elementOptions )? setElement[inLexer] ) )+ ) -> ^( SET[$BLOCK.token, \"SET\"] ( setElement )+ ) )
            let alt10 = 2;
            // alt10 = this.dfa10.predict(this.input!);
            alt10 = this.input.LA(1); // This is wrong! Just to silence eslint and tsc for the moment.
            switch (alt10) {
                case 1: {
                    let _first_0 = null;
                    // org/antlr/v4/parse/BlockSetTransformer.g:97:4: {...}? ^( BLOCK ^(alt= ALT ( elementOptions )? {...}? setElement[inLexer] ) ( ^( ALT ( elementOptions )? setElement[inLexer] ) )+ )
                    {
                        if (!((this.inContext("RULE")))) {
                            if (this.state.backtracking > 0) {
                                this.state.failed = true;

                                return retval;
                            }
                            throw new FailedPredicateException(this.input, "blockSet", "inContext(\"RULE\")");
                        }
                        _last = this.input.LT(1) as GrammarAST;
                        {
                            const _save_last_1 = _last;
                            let _first_1 = null;
                            _last = this.input.LT(1) as GrammarAST;
                            BLOCK10 = this.match(this.input, BlockSetTransformer.BLOCK, null) as GrammarAST;
                            if (this.state.failed) {
                                return retval;
                            }

                            if (this.state.backtracking === 1) {
                                stream_BLOCK.add(BLOCK10);
                            }

                            if (this.state.backtracking === 1) {
                                _first_0 = BLOCK10;
                            }

                            this.match(this.input, Constants.DOWN, null);
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            if (this.state.failed) {
                                return retval;
                            }

                            _last = this.input.LT(1) as GrammarAST;
                            {
                                const _save_last_2 = _last;
                                const _first_2 = null;
                                _last = this.input.LT(1) as GrammarAST;
                                alt = this.match(this.input, BlockSetTransformer.ALT, null) as GrammarAST;
                                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                if (this.state.failed) {
                                    return retval;
                                }

                                if (this.state.backtracking === 1) {
                                    stream_ALT.add(alt);
                                }

                                if (this.state.backtracking === 1) {
                                    _first_1 = alt;
                                }

                                this.match(this.input, Constants.DOWN, null);
                                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                if (this.state.failed) {
                                    return retval;
                                }

                                // org/antlr/v4/parse/BlockSetTransformer.g:98:21: ( elementOptions )?
                                let alt4 = 2;
                                const LA4_0 = this.input.LA(1);
                                if ((LA4_0 === BlockSetTransformer.ELEMENT_OPTIONS)) {
                                    alt4 = 1;
                                }
                                switch (alt4) {
                                    case 1: {
                                        // org/antlr/v4/parse/BlockSetTransformer.g:98:21: elementOptions
                                        {
                                            _last = this.input.LT(1) as GrammarAST;
                                            this.pushFollow(null);
                                            elementOptions11 = this.elementOptions();
                                            this.state._fsp--;
                                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                            if (this.state.failed) {
                                                return retval;
                                            }

                                            if (this.state.backtracking === 1) {
                                                stream_elementOptions.add(elementOptions11.tree!);
                                            }

                                            if (this.state.backtracking === 1) {
                                                retval.tree = _first_0 ?? undefined;
                                                if (retval.tree!.getParent()?.isNil()) {
                                                    retval.tree = retval.tree!.getParent() as GrammarAST;
                                                }

                                            }

                                        }
                                        break;
                                    }

                                    default:

                                }

                                if ((alt as AltAST).altLabel) {
                                    if (this.state.backtracking > 0) {
                                        this.state.failed = true;

                                        return retval;
                                    }
                                    throw new FailedPredicateException(this.input, "blockSet", "((AltAST)$alt).altLabel==null");
                                }
                                _last = this.input.LT(1) as GrammarAST;
                                this.pushFollow(null);
                                setElement12 = this.setElement(inLexer);
                                this.state._fsp--;
                                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                if (this.state.failed) {
                                    return retval;
                                }

                                if (this.state.backtracking === 1) {
                                    stream_setElement.add(setElement12.tree ?? null);
                                }

                                this.match(this.input, Constants.UP, null);
                                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                if (this.state.failed) {
                                    return retval;
                                }

                                _last = _save_last_2;
                            }

                            // org/antlr/v4/parse/BlockSetTransformer.g:98:91: ( ^( ALT ( elementOptions )? setElement[inLexer] ) )+
                            let cnt6 = 0;
                            loop6:
                            while (true) {
                                let alt6 = 2;
                                const LA6_0 = this.input.LA(1);
                                if ((LA6_0 === BlockSetTransformer.ALT)) {
                                    alt6 = 1;
                                }

                                switch (alt6) {
                                    case 1: {
                                        // org/antlr/v4/parse/BlockSetTransformer.g:98:93: ^( ALT ( elementOptions )? setElement[inLexer] )
                                        {
                                            _last = this.input.LT(1) as GrammarAST;
                                            {
                                                const _save_last_2 = _last;
                                                const _first_2 = null;
                                                _last = this.input.LT(1) as GrammarAST;
                                                ALT13 = this.match(this.input, BlockSetTransformer.ALT, null) as GrammarAST;
                                                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                                if (this.state.failed) {
                                                    return retval;
                                                }

                                                if (this.state.backtracking === 1) {
                                                    stream_ALT.add(ALT13);
                                                }

                                                if (this.state.backtracking === 1) {
                                                    if (_first_1 === null) {
                                                        _first_1 = ALT13;
                                                    }
                                                }

                                                this.match(this.input, Constants.DOWN, null);
                                                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                                if (this.state.failed) {
                                                    return retval;
                                                }

                                                // org/antlr/v4/parse/BlockSetTransformer.g:98:99: ( elementOptions )?
                                                let alt5 = 2;
                                                const LA5_0 = this.input.LA(1);
                                                if ((LA5_0 === BlockSetTransformer.ELEMENT_OPTIONS)) {
                                                    alt5 = 1;
                                                }
                                                switch (alt5) {
                                                    case 1: {
                                                        // org/antlr/v4/parse/BlockSetTransformer.g:98:99: elementOptions
                                                        {
                                                            _last = this.input.LT(1) as GrammarAST;
                                                            this.pushFollow(null);
                                                            elementOptions14 = this.elementOptions();
                                                            this.state._fsp--;
                                                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                                            if (this.state.failed) {
                                                                return retval;
                                                            }

                                                            if (this.state.backtracking === 1) {
                                                                stream_elementOptions.add(elementOptions14.tree ?? null);
                                                            }

                                                            if (this.state.backtracking === 1) {
                                                                retval.tree = _first_0 ?? undefined;
                                                                if (retval.tree!.getParent()?.isNil()) {

                                                                    retval.tree = retval.tree!.getParent() as GrammarAST;
                                                                }

                                                            }

                                                        }
                                                        break;
                                                    }

                                                    default:

                                                }

                                                _last = this.input.LT(1) as GrammarAST;
                                                this.pushFollow(null);
                                                setElement15 = this.setElement(inLexer);
                                                this.state._fsp--;
                                                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                                if (this.state.failed) {
                                                    return retval;
                                                }

                                                if (this.state.backtracking === 1) {
                                                    stream_setElement.add(setElement15.tree ?? null);
                                                }

                                                this.match(this.input, Constants.UP, null);
                                                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                                if (this.state.failed) {
                                                    return retval;
                                                }

                                                _last = _save_last_2;
                                            }

                                            if (this.state.backtracking === 1) {
                                                retval.tree = _first_0 ?? undefined;
                                                if (retval.tree!.getParent()?.isNil()) {

                                                    retval.tree = retval.tree!.getParent() as GrammarAST;
                                                }

                                            }

                                        }
                                        break;
                                    }

                                    default: {
                                        if (cnt6 >= 1) {
                                            break loop6;
                                        }

                                        if (this.state.backtracking > 0) {
                                            this.state.failed = true;

                                            return retval;
                                        }
                                        const eee = new EarlyExitException(6, this.input);
                                        throw eee;
                                    }

                                }
                                cnt6++;
                            }

                            this.match(this.input, Constants.UP, null);
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            if (this.state.failed) {
                                return retval;
                            }

                            _last = _save_last_1;
                        }

                        // AST REWRITE
                        // elements:
                        // token labels:
                        // rule labels: retval
                        // token list labels:
                        // rule list labels:
                        // wildcard labels:
                        if (this.state.backtracking === 1) {
                            root_0 = new GrammarAST();
                            // 99:3: -> ^( BLOCK[$BLOCK.token] ^( ALT[$BLOCK.token,\"ALT\"] ^( SET[$BLOCK.token, \"SET\"] ( setElement )+ ) ) )
                            {
                                // org/antlr/v4/parse/BlockSetTransformer.g:99:6: ^( BLOCK[$BLOCK.token] ^( ALT[$BLOCK.token,\"ALT\"] ^( SET[$BLOCK.token, \"SET\"] ( setElement )+ ) ) )
                                {
                                    let root_1 = new GrammarAST();
                                    root_1 = this.adaptor.becomeRoot(new BlockAST(BlockSetTransformer.BLOCK,
                                        BLOCK10.token), root_1) as GrammarAST;
                                    // org/antlr/v4/parse/BlockSetTransformer.g:99:38: ^( ALT[$BLOCK.token,\"ALT\"] ^( SET[$BLOCK.token, \"SET\"] ( setElement )+ ) )
                                    {
                                        let root_2 = new GrammarAST();
                                        root_2 = this.adaptor.becomeRoot(new AltAST(BlockSetTransformer.ALT, BLOCK10.token, "ALT"), root_2) as GrammarAST;
                                        // org/antlr/v4/parse/BlockSetTransformer.g:99:72: ^( SET[$BLOCK.token, \"SET\"] ( setElement )+ )
                                        {
                                            let root_3 = new GrammarAST();
                                            root_3 = this.adaptor.becomeRoot(this.adaptor.create(BlockSetTransformer.SET, BLOCK10.token!, "SET") as GrammarAST, root_3) as GrammarAST;
                                            if (!(stream_setElement.hasNext())) {
                                                throw new Error("RewriteEarlyExitException");
                                            }
                                            while (stream_setElement.hasNext()) {
                                                root_3.addChild(stream_setElement.nextTree());
                                            }
                                            stream_setElement.reset();

                                            root_2.addChild(root_3);
                                        }

                                        root_1.addChild(root_2);
                                    }

                                    root_0.addChild(root_1);
                                }

                            }

                            retval.tree = this.adaptor.rulePostProcessing(root_0) as GrammarAST;
                            this.input.replaceChildren(retval.start?.getParent(),
                                retval.start!.getChildIndex(),
                                _last.getChildIndex(),
                                retval.tree);
                        }

                    }
                    break;
                }

                case 2: {
                    let _first_0 = null;
                    // org/antlr/v4/parse/BlockSetTransformer.g:100:4: {...}? ^( BLOCK ^( ALT ( elementOptions )? setElement[inLexer] ) ( ^( ALT ( elementOptions )? setElement[inLexer] ) )+ )
                    {
                        if (this.inContext("RULE")) {
                            if (this.state.backtracking > 0) {
                                this.state.failed = true;

                                return retval;
                            }
                            throw new FailedPredicateException(this.input, "blockSet", "!inContext(\"RULE\")");
                        }

                        _last = this.input.LT(1) as GrammarAST;
                        {
                            const _save_last_1 = _last;
                            let _first_1 = null;
                            _last = this.input.LT(1) as GrammarAST;
                            BLOCK16 = this.match(this.input, BlockSetTransformer.BLOCK, null) as GrammarAST;
                            if (this.state.failed) {
                                return retval;
                            }

                            if (this.state.backtracking === 1) {
                                stream_BLOCK.add(BLOCK16);
                            }

                            if (this.state.backtracking === 1) {
                                _first_0 = BLOCK16;
                            }

                            this.match(this.input, Constants.DOWN, null);
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            if (this.state.failed) {
                                return retval;
                            }

                            _last = this.input.LT(1) as GrammarAST;
                            {
                                const _save_last_2 = _last;
                                const _first_2 = null;
                                _last = this.input.LT(1) as GrammarAST;
                                ALT17 = this.match(this.input, BlockSetTransformer.ALT, null) as GrammarAST;
                                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                if (this.state.failed) {
                                    return retval;
                                }

                                if (this.state.backtracking === 1) {
                                    stream_ALT.add(ALT17);
                                }

                                if (this.state.backtracking === 1) {
                                    _first_1 = ALT17;
                                }

                                this.match(this.input, Constants.DOWN, null);
                                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                if (this.state.failed) {
                                    return retval;
                                }

                                // org/antlr/v4/parse/BlockSetTransformer.g:101:17: ( elementOptions )?
                                let alt7 = 2;
                                const LA7_0 = this.input.LA(1);
                                if ((LA7_0 === BlockSetTransformer.ELEMENT_OPTIONS)) {
                                    alt7 = 1;
                                }
                                switch (alt7) {
                                    case 1: {
                                        // org/antlr/v4/parse/BlockSetTransformer.g:101:17: elementOptions
                                        {
                                            _last = this.input.LT(1) as GrammarAST;
                                            this.pushFollow(null);
                                            elementOptions18 = this.elementOptions();
                                            this.state._fsp--;
                                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                            if (this.state.failed) {
                                                return retval;
                                            }

                                            if (this.state.backtracking === 1) {
                                                stream_elementOptions.add(elementOptions18.tree ?? null);
                                            }

                                            if (this.state.backtracking === 1) {
                                                retval.tree = _first_0 ?? undefined;
                                                if (retval.tree!.getParent()?.isNil()) {

                                                    retval.tree = retval.tree!.getParent() as GrammarAST;
                                                }

                                            }

                                        }
                                        break;
                                    }

                                    default:

                                }

                                _last = this.input.LT(1) as GrammarAST;
                                this.pushFollow(null);
                                setElement19 = this.setElement(inLexer);
                                this.state._fsp--;
                                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                if (this.state.failed) {
                                    return retval;
                                }

                                if (this.state.backtracking === 1) {
                                    stream_setElement.add(setElement19.tree ?? null);
                                }

                                this.match(this.input, Constants.UP, null);
                                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                if (this.state.failed) {
                                    return retval;
                                }

                                _last = _save_last_2;
                            }

                            // org/antlr/v4/parse/BlockSetTransformer.g:101:54: ( ^( ALT ( elementOptions )? setElement[inLexer] ) )+
                            let cnt9 = 0;
                            loop9:
                            while (true) {
                                let alt9 = 2;
                                const LA9_0 = this.input.LA(1);
                                if ((LA9_0 === BlockSetTransformer.ALT)) {
                                    alt9 = 1;
                                }

                                switch (alt9) {
                                    case 1: {
                                        // org/antlr/v4/parse/BlockSetTransformer.g:101:56: ^( ALT ( elementOptions )? setElement[inLexer] )
                                        {
                                            _last = this.input.LT(1) as GrammarAST;
                                            {
                                                const _save_last_2 = _last;
                                                const _first_2 = null;
                                                _last = this.input.LT(1) as GrammarAST;
                                                ALT20 = this.match(this.input, BlockSetTransformer.ALT, null) as GrammarAST;
                                                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                                if (this.state.failed) {
                                                    return retval;
                                                }

                                                if (this.state.backtracking === 1) {
                                                    stream_ALT.add(ALT20);
                                                }

                                                if (this.state.backtracking === 1) {

                                                    if (_first_1 === null) {
                                                        _first_1 = ALT20;
                                                    }

                                                }

                                                this.match(this.input, Constants.DOWN, null);
                                                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                                if (this.state.failed) {
                                                    return retval;
                                                }

                                                // org/antlr/v4/parse/BlockSetTransformer.g:101:62: ( elementOptions )?
                                                let alt8 = 2;
                                                const LA8_0 = this.input.LA(1);
                                                if ((LA8_0 === BlockSetTransformer.ELEMENT_OPTIONS)) {
                                                    alt8 = 1;
                                                }
                                                switch (alt8) {
                                                    case 1: {
                                                        // org/antlr/v4/parse/BlockSetTransformer.g:101:62: elementOptions
                                                        {
                                                            _last = this.input.LT(1) as GrammarAST;
                                                            this.pushFollow(null);
                                                            elementOptions21 = this.elementOptions();
                                                            this.state._fsp--;
                                                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                                            if (this.state.failed) {
                                                                return retval;
                                                            }

                                                            if (this.state.backtracking === 1) {
                                                                stream_elementOptions.add(elementOptions21.tree ?? null);
                                                            }

                                                            if (this.state.backtracking === 1) {
                                                                retval.tree = _first_0 ?? undefined;
                                                                if (retval.tree!.getParent()?.isNil()) {

                                                                    retval.tree = retval.tree!.getParent() as GrammarAST;
                                                                }

                                                            }

                                                        }
                                                        break;
                                                    }

                                                    default:

                                                }

                                                _last = this.input.LT(1) as GrammarAST;
                                                this.pushFollow(null);
                                                setElement22 = this.setElement(inLexer);
                                                this.state._fsp--;
                                                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                                if (this.state.failed) {
                                                    return retval;
                                                }

                                                if (this.state.backtracking === 1) {
                                                    stream_setElement.add(setElement22.tree ?? null);
                                                }

                                                this.match(this.input, Constants.UP, null);
                                                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                                if (this.state.failed) {
                                                    return retval;
                                                }

                                                _last = _save_last_2;
                                            }

                                            if (this.state.backtracking === 1) {
                                                retval.tree = _first_0 ?? undefined;
                                                if (retval.tree!.getParent()?.isNil()) {

                                                    retval.tree = retval.tree!.getParent() as GrammarAST;
                                                }

                                            }

                                        }
                                        break;
                                    }

                                    default: {
                                        if (cnt9 >= 1) {
                                            break loop9;
                                        }

                                        if (this.state.backtracking > 0) {
                                            this.state.failed = true;

                                            return retval;
                                        }
                                        const eee = new EarlyExitException(9, this.input);
                                        throw eee;
                                    }

                                }
                                cnt9++;
                            }

                            this.match(this.input, Constants.UP, null);
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            if (this.state.failed) {
                                return retval;
                            }

                            _last = _save_last_1;
                        }

                        // AST REWRITE
                        // elements:
                        // token labels:
                        // rule labels: retval
                        // token list labels:
                        // rule list labels:
                        // wildcard labels:
                        if (this.state.backtracking === 1) {
                            root_0 = new GrammarAST();
                            // 102:3: -> ^( SET[$BLOCK.token, \"SET\"] ( setElement )+ )
                            {
                                // org/antlr/v4/parse/BlockSetTransformer.g:102:6: ^( SET[$BLOCK.token, \"SET\"] ( setElement )+ )
                                {
                                    let root_1 = new GrammarAST();
                                    root_1 = this.adaptor.becomeRoot(this.adaptor.create(BlockSetTransformer.SET,
                                        BLOCK16.token!, "SET") as GrammarAST, root_1) as GrammarAST;
                                    if (!(stream_setElement.hasNext())) {
                                        throw new Error("RewriteEarlyExitException");
                                    }
                                    while (stream_setElement.hasNext()) {
                                        root_1.addChild(stream_setElement.nextTree());
                                    }
                                    stream_setElement.reset();

                                    root_0.addChild(root_1);
                                }

                            }

                            retval.tree = this.adaptor.rulePostProcessing(root_0) as GrammarAST;
                            this.input.replaceChildren(retval.start?.getParent(),
                                retval.start!.getChildIndex(),
                                _last.getChildIndex(),
                                retval.tree);
                        }

                    }
                    break;
                }

                default:

            }
            if (this.state.backtracking === 1) {
                GrammarTransformPipeline.setGrammarPtr(this.g, retval.tree!);
            }
        } catch (re) {
            if (re instanceof RecognitionException) {
                this.reportError(re);
                this.recover(this.input, re);
            } else {
                throw re;
            }
        }

        return retval;
    }

    // $ANTLR start "setElement"
    // org/antlr/v4/parse/BlockSetTransformer.g:105:1: setElement[boolean inLexer] : ( ^(a= STRING_LITERAL elementOptions ) {...}?|a= STRING_LITERAL {...}?|{...}? => ^( TOKEN_REF elementOptions ) |{...}? => TOKEN_REF |{...}? => ^( RANGE a= STRING_LITERAL b= STRING_LITERAL ) {...}?) ;
    public setElement(inLexer: boolean): ITreeRuleReturnScope<GrammarAST> {
        const retval: ITreeRuleReturnScope<GrammarAST> = {};
        retval.start = this.input.LT(1) ?? undefined;

        let _last = null;
        let _first_0 = null;

        let a = null;
        let b = null;
        let TOKEN_REF24 = null;
        let TOKEN_REF26 = null;
        let RANGE27 = null;
        let elementOptions23 = null;
        let elementOptions25 = null;

        try {
            // org/antlr/v4/parse/BlockSetTransformer.g:109:2: ( ( ^(a= STRING_LITERAL elementOptions ) {...}?|a= STRING_LITERAL {...}?|{...}? => ^( TOKEN_REF elementOptions ) |{...}? => TOKEN_REF |{...}? => ^( RANGE a= STRING_LITERAL b= STRING_LITERAL ) {...}?) )
            // org/antlr/v4/parse/BlockSetTransformer.g:109:4: ( ^(a= STRING_LITERAL elementOptions ) {...}?|a= STRING_LITERAL {...}?|{...}? => ^( TOKEN_REF elementOptions ) |{...}? => TOKEN_REF |{...}? => ^( RANGE a= STRING_LITERAL b= STRING_LITERAL ) {...}?)
            {
                // org/antlr/v4/parse/BlockSetTransformer.g:109:4: ( ^(a= STRING_LITERAL elementOptions ) {...}?|a= STRING_LITERAL {...}?|{...}? => ^( TOKEN_REF elementOptions ) |{...}? => TOKEN_REF |{...}? => ^( RANGE a= STRING_LITERAL b= STRING_LITERAL ) {...}?)
                let alt11 = 5;
                const LA11_0 = this.input.LA(1);
                if ((LA11_0 === BlockSetTransformer.STRING_LITERAL)) {
                    const LA11_1 = this.input.LA(2);
                    if ((LA11_1 === Constants.DOWN)) {
                        alt11 = 1;
                    } else {
                        if ((LA11_1 === Constants.UP)) {
                            alt11 = 2;
                        } else {
                            if (this.state.backtracking > 0) {
                                this.state.failed = true;

                                return retval;
                            }
                            const nvaeMark = this.input.mark();
                            const lastIndex = this.input.index;
                            try {
                                this.input.consume();
                                const nvae = new NoViableAltException("", 11, 1, this.input);
                                throw nvae;
                            } finally {
                                this.input.seek(lastIndex);
                                this.input.release(nvaeMark);
                            }
                        }
                    }

                } else {
                    if ((LA11_0 === BlockSetTransformer.TOKEN_REF) && !inLexer) {
                        const LA11_2 = this.input.LA(2);
                        if ((LA11_2 === Constants.DOWN)) {
                            alt11 = 3;
                        } else {
                            if ((LA11_2 === Constants.UP)) {
                                alt11 = 4;
                            }
                        }
                    } else {
                        if ((LA11_0 === BlockSetTransformer.RANGE) && inLexer) {
                            alt11 = 5;
                        }
                    }

                }

                switch (alt11) {
                    case 1: {
                        // org/antlr/v4/parse/BlockSetTransformer.g:109:6: ^(a= STRING_LITERAL elementOptions ) {...}?
                        {
                            _last = this.input.LT(1) as GrammarAST;
                            {
                                const _save_last_1 = _last;
                                let _first_1 = null;
                                _last = this.input.LT(1) as GrammarAST;
                                a = this.match(this.input, BlockSetTransformer.STRING_LITERAL, null) as GrammarAST;

                                if (this.state.failed) {
                                    return retval;
                                }

                                if (this.state.backtracking === 1) {
                                    _first_0 = a;
                                }

                                this.match(this.input, Constants.DOWN, null);
                                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                if (this.state.failed) {
                                    return retval;
                                }

                                _last = this.input.LT(1) as GrammarAST;
                                this.pushFollow(null);
                                elementOptions23 = this.elementOptions();
                                this.state._fsp--;
                                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                if (this.state.failed) {
                                    return retval;
                                }

                                if (this.state.backtracking === 1) {
                                    _first_1 = elementOptions23.tree!;
                                }

                                this.match(this.input, Constants.UP, null);
                                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                if (this.state.failed) {
                                    return retval;
                                }

                                _last = _save_last_1;
                            }

                            if (!((!inLexer || CharSupport.getCharValueFromGrammarCharLiteral(a.getText()) !== -1))) {
                                if (this.state.backtracking > 0) {
                                    this.state.failed = true;

                                    return retval;
                                }
                                throw new FailedPredicateException(this.input, "setElement", "!inLexer || CharSupport.getCharValueFromGrammarCharLiteral($a.getText())!=-1");
                            }
                            if (this.state.backtracking === 1) {
                                retval.tree = _first_0 ?? undefined;
                                if (retval.tree!.getParent()?.isNil()) {

                                    retval.tree = retval.tree!.getParent() as GrammarAST;
                                }

                            }

                        }
                        break;
                    }

                    case 2: {
                        // org/antlr/v4/parse/BlockSetTransformer.g:110:7: a= STRING_LITERAL {...}?
                        {
                            _last = this.input.LT(1) as GrammarAST;
                            a = this.match(this.input, BlockSetTransformer.STRING_LITERAL, null) as GrammarAST;

                            if (this.state.failed) {
                                return retval;
                            }

                            if (this.state.backtracking === 1) {
                                _first_0 = a;
                            }

                            if (!((!inLexer || CharSupport.getCharValueFromGrammarCharLiteral(a.getText()) !== -1))) {
                                if (this.state.backtracking > 0) {
                                    this.state.failed = true;

                                    return retval;
                                }
                                throw new FailedPredicateException(this.input, "setElement", "!inLexer || CharSupport.getCharValueFromGrammarCharLiteral($a.getText())!=-1");
                            }
                            if (this.state.backtracking === 1) {
                                retval.tree = _first_0 ?? undefined;
                                if (retval.tree!.getParent()?.isNil()) {

                                    retval.tree = retval.tree!.getParent() as GrammarAST;
                                }

                            }

                        }
                        break;
                    }

                    case 3: {
                        // org/antlr/v4/parse/BlockSetTransformer.g:111:5: {...}? => ^( TOKEN_REF elementOptions )
                        {
                            if (inLexer) {
                                if (this.state.backtracking > 0) {
                                    this.state.failed = true;

                                    return retval;
                                }
                                throw new FailedPredicateException(this.input, "setElement", "!inLexer");
                            }
                            _last = this.input.LT(1) as GrammarAST;
                            {
                                const _save_last_1 = _last;
                                let _first_1 = null;
                                _last = this.input.LT(1) as GrammarAST;
                                TOKEN_REF24 = this.match(this.input, BlockSetTransformer.TOKEN_REF, null) as GrammarAST;

                                if (this.state.failed) {
                                    return retval;
                                }

                                if (this.state.backtracking === 1) {
                                    _first_0 = TOKEN_REF24;
                                }

                                this.match(this.input, Constants.DOWN, null);
                                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                if (this.state.failed) {
                                    return retval;
                                }

                                _last = this.input.LT(1) as GrammarAST;
                                this.pushFollow(null);
                                elementOptions25 = this.elementOptions();
                                this.state._fsp--;
                                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                if (this.state.failed) {
                                    return retval;
                                }

                                if (this.state.backtracking === 1) {
                                    _first_1 = elementOptions25.tree!;
                                }

                                this.match(this.input, Constants.UP, null);
                                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                if (this.state.failed) {
                                    return retval;
                                }

                                _last = _save_last_1;
                            }

                            if (this.state.backtracking === 1) {
                                retval.tree = _first_0 ?? undefined;
                                if (retval.tree!.getParent()?.isNil()) {

                                    retval.tree = retval.tree!.getParent() as GrammarAST;
                                }

                            }

                        }
                        break;
                    }

                    case 4: {
                        // org/antlr/v4/parse/BlockSetTransformer.g:112:5: {...}? => TOKEN_REF
                        {
                            if (inLexer) {
                                if (this.state.backtracking > 0) {
                                    this.state.failed = true;

                                    return retval;
                                }
                                throw new FailedPredicateException(this.input, "setElement", "!inLexer");
                            }
                            _last = this.input.LT(1) as GrammarAST;
                            TOKEN_REF26 = this.match(this.input, BlockSetTransformer.TOKEN_REF, null) as GrammarAST;

                            if (this.state.failed) {
                                return retval;
                            }

                            if (this.state.backtracking === 1) {
                                _first_0 = TOKEN_REF26;
                            }

                            if (this.state.backtracking === 1) {
                                retval.tree = _first_0 ?? undefined;
                                if (retval.tree!.getParent()?.isNil()) {

                                    retval.tree = retval.tree!.getParent() as GrammarAST;
                                }

                            }

                        }
                        break;
                    }

                    case 5: {
                        // org/antlr/v4/parse/BlockSetTransformer.g:113:5: {...}? => ^( RANGE a= STRING_LITERAL b= STRING_LITERAL ) {...}?
                        {
                            if (!inLexer) {
                                if (this.state.backtracking > 0) {
                                    this.state.failed = true;

                                    return retval;
                                }
                                throw new FailedPredicateException(this.input, "setElement", "inLexer");
                            }
                            _last = this.input.LT(1) as GrammarAST;
                            {
                                const _save_last_1 = _last;
                                let _first_1 = null;
                                _last = this.input.LT(1) as GrammarAST;
                                RANGE27 = this.match(this.input, BlockSetTransformer.RANGE, null) as GrammarAST;

                                if (this.state.failed) {
                                    return retval;
                                }

                                if (this.state.backtracking === 1) {
                                    _first_0 = RANGE27;
                                }

                                this.match(this.input, Constants.DOWN, null);
                                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                if (this.state.failed) {
                                    return retval;
                                }

                                _last = this.input.LT(1) as GrammarAST;
                                a = this.match(this.input, BlockSetTransformer.STRING_LITERAL, null) as GrammarAST;
                                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                if (this.state.failed) {
                                    return retval;
                                }

                                if (this.state.backtracking === 1) {
                                    _first_1 = a;
                                }

                                _last = this.input.LT(1) as GrammarAST;
                                b = this.match(this.input, BlockSetTransformer.STRING_LITERAL, null) as GrammarAST;
                                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                if (this.state.failed) {
                                    return retval;
                                }

                                if (this.state.backtracking === 1) {

                                    if (_first_1 === null) {
                                        _first_1 = b;
                                    }

                                }

                                this.match(this.input, Constants.UP, null);
                                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                if (this.state.failed) {
                                    return retval;
                                }

                                _last = _save_last_1;
                            }

                            if (!((CharSupport.getCharValueFromGrammarCharLiteral(a.getText()) !== -1 &&
                                CharSupport.getCharValueFromGrammarCharLiteral(b.getText()) !== -1))) {
                                if (this.state.backtracking > 0) {
                                    this.state.failed = true;

                                    return retval;
                                }
                                throw new FailedPredicateException(this.input, "setElement", "CharSupport.getCharValueFromGrammarCharLiteral($a.getText())!=-1 &&\n\t\t\t CharSupport.getCharValueFromGrammarCharLiteral($b.getText())!=-1");
                            }
                            if (this.state.backtracking === 1) {
                                retval.tree = _first_0 ?? undefined;
                                if (retval.tree!.getParent()?.isNil()) {

                                    retval.tree = retval.tree!.getParent() as GrammarAST;
                                }

                            }

                        }
                        break;
                    }

                    default:

                }

                if (this.state.backtracking === 1) {
                    retval.tree = _first_0 ?? undefined;
                    if (retval.tree!.getParent()?.isNil()) {

                        retval.tree = retval.tree!.getParent() as GrammarAST;
                    }

                }

            }

            if (this.state.backtracking === 1) {
                GrammarTransformPipeline.setGrammarPtr(this.g, retval.tree!);
            }
        } catch (re) {
            if (re instanceof RecognitionException) {
                this.reportError(re);
                this.recover(this.input, re);
            } else {
                throw re;
            }
        }

        return retval;
    }

    // $ANTLR start "elementOptions"
    // org/antlr/v4/parse/BlockSetTransformer.g:119:1: elementOptions : ^( ELEMENT_OPTIONS ( elementOption )* ) ;
    public elementOptions(): ITreeRuleReturnScope<GrammarAST> {
        const retval: ITreeRuleReturnScope<GrammarAST> = {};
        retval.start = this.input.LT(1) ?? undefined;

        let _first_0 = null;
        let _last = null;

        let ELEMENT_OPTIONS28 = null;
        let elementOption29 = null;

        try {
            // org/antlr/v4/parse/BlockSetTransformer.g:120:2: ( ^( ELEMENT_OPTIONS ( elementOption )* ) )
            // org/antlr/v4/parse/BlockSetTransformer.g:120:4: ^( ELEMENT_OPTIONS ( elementOption )* )
            {
                _last = this.input.LT(1) as GrammarAST;
                {
                    const _save_last_1 = _last;
                    let _first_1 = null;
                    _last = this.input.LT(1) as GrammarAST;
                    ELEMENT_OPTIONS28 = this.match(this.input, BlockSetTransformer.ELEMENT_OPTIONS, null) as GrammarAST;

                    if (this.state.failed) {
                        return retval;
                    }

                    if (this.state.backtracking === 1) {
                        _first_0 = ELEMENT_OPTIONS28;
                    }

                    if (this.input.LA(1) === Constants.DOWN) {
                        this.match(this.input, Constants.DOWN, null);
                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                        if (this.state.failed) {
                            return retval;
                        }

                        // org/antlr/v4/parse/BlockSetTransformer.g:120:22: ( elementOption )*
                        loop12:
                        while (true) {
                            let alt12 = 2;
                            const LA12_0 = this.input.LA(1);
                            if ((LA12_0 === BlockSetTransformer.ASSIGN || LA12_0 === BlockSetTransformer.ID)) {
                                alt12 = 1;
                            }

                            switch (alt12) {
                                case 1: {
                                    // org/antlr/v4/parse/BlockSetTransformer.g:120:22: elementOption
                                    {
                                        _last = this.input.LT(1) as GrammarAST;
                                        this.pushFollow(null);
                                        elementOption29 = this.elementOption();
                                        this.state._fsp--;
                                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                        if (this.state.failed) {
                                            return retval;
                                        }

                                        if (this.state.backtracking === 1) {

                                            if (_first_1 === null) {
                                                _first_1 = elementOption29.tree;
                                            }

                                        }

                                        if (this.state.backtracking === 1) {
                                            retval.tree = _first_0 ?? undefined;
                                            if (retval.tree!.getParent()?.isNil()) {
                                                retval.tree = retval.tree!.getParent() as GrammarAST;
                                            }

                                        }

                                    }
                                    break;
                                }

                                default: {
                                    break loop12;
                                }

                            }
                        }

                        this.match(this.input, Constants.UP, null);
                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                        if (this.state.failed) {
                            return retval;
                        }

                    }
                    _last = _save_last_1;
                }

                if (this.state.backtracking === 1) {
                    retval.tree = _first_0 ?? undefined;
                    if (retval.tree!.getParent()?.isNil()) {

                        retval.tree = retval.tree!.getParent() as GrammarAST;
                    }

                }

            }

        } catch (re) {
            if (re instanceof RecognitionException) {
                this.reportError(re);
                this.recover(this.input, re);
            } else {
                throw re;
            }
        }

        return retval;
    }

    // $ANTLR start "elementOption"
    // org/antlr/v4/parse/BlockSetTransformer.g:123:1: elementOption : ( ID | ^( ASSIGN id= ID v= ID ) | ^( ASSIGN ID v= STRING_LITERAL ) | ^( ASSIGN ID v= ACTION ) | ^( ASSIGN ID v= INT ) );
    public elementOption(): ITreeRuleReturnScope<GrammarAST> {
        const retval: ITreeRuleReturnScope<GrammarAST> = {};
        retval.start = this.input.LT(1) ?? undefined;

        let _last = null;

        let id = null;
        let v = null;
        let ID30 = null;
        let ASSIGN31 = null;
        let ASSIGN32 = null;
        let ID33 = null;
        let ASSIGN34 = null;
        let ID35 = null;
        let ASSIGN36 = null;
        let ID37 = null;

        try {
            // org/antlr/v4/parse/BlockSetTransformer.g:124:2: ( ID | ^( ASSIGN id= ID v= ID ) | ^( ASSIGN ID v= STRING_LITERAL ) | ^( ASSIGN ID v= ACTION ) | ^( ASSIGN ID v= INT ) )
            let alt13 = 5;
            const LA13_0 = this.input.LA(1);
            if ((LA13_0 === BlockSetTransformer.ID)) {
                alt13 = 1;
            } else {
                if ((LA13_0 === BlockSetTransformer.ASSIGN)) {
                    const LA13_2 = this.input.LA(2);
                    if ((LA13_2 === Constants.DOWN)) {
                        const LA13_3 = this.input.LA(3);
                        if ((LA13_3 === BlockSetTransformer.ID)) {
                            switch (this.input.LA(4)) {
                                case GrammarTreeVisitor.ID: {
                                    {
                                        alt13 = 2;
                                    }
                                    break;
                                }

                                case GrammarTreeVisitor.STRING_LITERAL: {
                                    {
                                        alt13 = 3;
                                    }
                                    break;
                                }

                                case GrammarTreeVisitor.ACTION: {
                                    {
                                        alt13 = 4;
                                    }
                                    break;
                                }

                                case GrammarTreeVisitor.INT: {
                                    {
                                        alt13 = 5;
                                    }
                                    break;
                                }

                                default: {
                                    if (this.state.backtracking > 0) {
                                        this.state.failed = true;

                                        return retval;
                                    }
                                    const nvaeMark = this.input.mark();
                                    const lastIndex = this.input.index;
                                    try {
                                        for (let nvaeConsume = 0; nvaeConsume < 4 - 1; nvaeConsume++) {
                                            this.input.consume();
                                        }
                                        const nvae = new NoViableAltException("", 13, 4, this.input);
                                        throw nvae;
                                    } finally {
                                        this.input.seek(lastIndex);
                                        this.input.release(nvaeMark);
                                    }
                                }

                            }
                        } else {
                            if (this.state.backtracking > 0) {
                                this.state.failed = true;

                                return retval;
                            }
                            const nvaeMark = this.input.mark();
                            const lastIndex = this.input.index;
                            try {
                                for (let nvaeConsume = 0; nvaeConsume < 3 - 1; nvaeConsume++) {
                                    this.input.consume();
                                }
                                const nvae = new NoViableAltException("", 13, 3, this.input);
                                throw nvae;
                            } finally {
                                this.input.seek(lastIndex);
                                this.input.release(nvaeMark);
                            }
                        }

                    } else {
                        if (this.state.backtracking > 0) {
                            this.state.failed = true;

                            return retval;
                        }
                        const nvaeMark = this.input.mark();
                        const lastIndex = this.input.index;
                        try {
                            this.input.consume();
                            const nvae = new NoViableAltException("", 13, 2, this.input);
                            throw nvae;
                        } finally {
                            this.input.seek(lastIndex);
                            this.input.release(nvaeMark);
                        }
                    }

                } else {
                    if (this.state.backtracking > 0) {
                        this.state.failed = true;

                        return retval;
                    }
                    const nvae = new NoViableAltException("", 13, 0, this.input);
                    throw nvae;
                }
            }

            switch (alt13) {
                case 1: {
                    let _first_0 = null;
                    // org/antlr/v4/parse/BlockSetTransformer.g:124:4: ID
                    {
                        _last = this.input.LT(1) as GrammarAST;
                        ID30 = this.match(this.input, BlockSetTransformer.ID, null) as GrammarAST;

                        if (this.state.failed) {
                            return retval;
                        }

                        if (this.state.backtracking === 1) {
                            _first_0 = ID30;
                        }

                        if (this.state.backtracking === 1) {
                            retval.tree = _first_0 ?? undefined;
                            if (retval.tree!.getParent()?.isNil()) {

                                retval.tree = retval.tree!.getParent() as GrammarAST;
                            }

                        }

                    }
                    break;
                }

                case 2: {
                    let _first_0 = null;
                    // org/antlr/v4/parse/BlockSetTransformer.g:125:4: ^( ASSIGN id= ID v= ID )
                    {
                        _last = this.input.LT(1) as GrammarAST;
                        {
                            const _save_last_1 = _last;
                            let _first_1 = null;
                            _last = this.input.LT(1) as GrammarAST;
                            ASSIGN31 = this.match(this.input, BlockSetTransformer.ASSIGN, null) as GrammarAST;

                            if (this.state.failed) {
                                return retval;
                            }

                            if (this.state.backtracking === 1) {
                                _first_0 = ASSIGN31;
                            }

                            this.match(this.input, Constants.DOWN, null);
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            if (this.state.failed) {
                                return retval;
                            }

                            _last = this.input.LT(1) as GrammarAST;
                            id = this.match(this.input, BlockSetTransformer.ID, null) as GrammarAST;
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            if (this.state.failed) {
                                return retval;
                            }

                            if (this.state.backtracking === 1) {
                                _first_1 = id;
                            }

                            _last = this.input.LT(1) as GrammarAST;
                            v = this.match(this.input, BlockSetTransformer.ID, null) as GrammarAST;
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            if (this.state.failed) {
                                return retval;
                            }

                            if (this.state.backtracking === 1) {

                                if (_first_1 === null) {
                                    _first_1 = v;
                                }

                            }

                            this.match(this.input, Constants.UP, null);
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            if (this.state.failed) {
                                return retval;
                            }

                            _last = _save_last_1;
                        }

                        if (this.state.backtracking === 1) {
                            retval.tree = _first_0 ?? undefined;
                            if (retval.tree!.getParent()?.isNil()) {

                                retval.tree = retval.tree!.getParent() as GrammarAST;
                            }

                        }

                    }
                    break;
                }

                case 3: {
                    let _first_0 = null;
                    // org/antlr/v4/parse/BlockSetTransformer.g:126:4: ^( ASSIGN ID v= STRING_LITERAL )
                    {
                        _last = this.input.LT(1) as GrammarAST;
                        {
                            const _save_last_1 = _last;
                            let _first_1 = null;
                            _last = this.input.LT(1) as GrammarAST;
                            ASSIGN32 = this.match(this.input, BlockSetTransformer.ASSIGN, null) as GrammarAST;

                            if (this.state.failed) {
                                return retval;
                            }

                            if (this.state.backtracking === 1) {
                                _first_0 = ASSIGN32;
                            }

                            this.match(this.input, Constants.DOWN, null);
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            if (this.state.failed) {
                                return retval;
                            }

                            _last = this.input.LT(1) as GrammarAST;
                            ID33 = this.match(this.input, BlockSetTransformer.ID, null) as GrammarAST;
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            if (this.state.failed) {
                                return retval;
                            }

                            if (this.state.backtracking === 1) {
                                _first_1 = ID33;
                            }

                            _last = this.input.LT(1) as GrammarAST;
                            v = this.match(this.input, BlockSetTransformer.STRING_LITERAL, null) as GrammarAST;
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            if (this.state.failed) {
                                return retval;
                            }

                            if (this.state.backtracking === 1) {

                                if (_first_1 === null) {
                                    _first_1 = v;
                                }

                            }

                            this.match(this.input, Constants.UP, null);
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            if (this.state.failed) {
                                return retval;
                            }

                            _last = _save_last_1;
                        }

                        if (this.state.backtracking === 1) {
                            retval.tree = _first_0 ?? undefined;
                            if (retval.tree!.getParent()?.isNil()) {

                                retval.tree = retval.tree!.getParent() as GrammarAST;
                            }

                        }

                    }
                    break;
                }

                case 4: {
                    let _first_0 = null;
                    // org/antlr/v4/parse/BlockSetTransformer.g:127:4: ^( ASSIGN ID v= ACTION )
                    {
                        _last = this.input.LT(1) as GrammarAST;
                        {
                            const _save_last_1 = _last;
                            let _first_1 = null;
                            _last = this.input.LT(1) as GrammarAST;
                            ASSIGN34 = this.match(this.input, BlockSetTransformer.ASSIGN, null) as GrammarAST;

                            if (this.state.failed) {
                                return retval;
                            }

                            if (this.state.backtracking === 1) {
                                _first_0 = ASSIGN34;
                            }

                            this.match(this.input, Constants.DOWN, null);
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            if (this.state.failed) {
                                return retval;
                            }

                            _last = this.input.LT(1) as GrammarAST;
                            ID35 = this.match(this.input, BlockSetTransformer.ID, null) as GrammarAST;
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            if (this.state.failed) {
                                return retval;
                            }

                            if (this.state.backtracking === 1) {
                                _first_1 = ID35;
                            }

                            _last = this.input.LT(1) as GrammarAST;
                            v = this.match(this.input, BlockSetTransformer.ACTION, null) as GrammarAST;
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            if (this.state.failed) {
                                return retval;
                            }

                            if (this.state.backtracking === 1) {

                                if (_first_1 === null) {
                                    _first_1 = v;
                                }

                            }

                            this.match(this.input, Constants.UP, null);
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            if (this.state.failed) {
                                return retval;
                            }

                            _last = _save_last_1;
                        }

                        if (this.state.backtracking === 1) {
                            retval.tree = _first_0 ?? undefined;
                            if (retval.tree!.getParent()?.isNil()) {

                                retval.tree = retval.tree!.getParent() as GrammarAST;
                            }

                        }

                    }
                    break;
                }

                case 5: {
                    let _first_0 = null;
                    // org/antlr/v4/parse/BlockSetTransformer.g:128:4: ^( ASSIGN ID v= INT )
                    {
                        _last = this.input.LT(1) as GrammarAST;
                        {
                            const _save_last_1 = _last;
                            let _first_1 = null;
                            _last = this.input.LT(1) as GrammarAST;
                            ASSIGN36 = this.match(this.input, BlockSetTransformer.ASSIGN, null) as GrammarAST;

                            if (this.state.failed) {
                                return retval;
                            }

                            if (this.state.backtracking === 1) {
                                _first_0 = ASSIGN36;
                            }

                            this.match(this.input, Constants.DOWN, null);
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            if (this.state.failed) {
                                return retval;
                            }

                            _last = this.input.LT(1) as GrammarAST;
                            ID37 = this.match(this.input, BlockSetTransformer.ID, null) as GrammarAST;
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            if (this.state.failed) {
                                return retval;
                            }

                            if (this.state.backtracking === 1) {
                                _first_1 = ID37;
                            }

                            _last = this.input.LT(1) as GrammarAST;
                            v = this.match(this.input, BlockSetTransformer.INT, null) as GrammarAST;
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            if (this.state.failed) {
                                return retval;
                            }

                            if (this.state.backtracking === 1) {

                                if (_first_1 === null) {
                                    _first_1 = v;
                                }

                            }

                            this.match(this.input, Constants.UP, null);
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            if (this.state.failed) {
                                return retval;
                            }

                            _last = _save_last_1;
                        }

                        if (this.state.backtracking === 1) {
                            retval.tree = _first_0 ?? undefined;
                            if (retval.tree!.getParent()?.isNil()) {

                                retval.tree = retval.tree!.getParent() as GrammarAST;
                            }

                        }

                    }
                    break;
                }

                default:

            }
        } catch (re) {
            if (re instanceof RecognitionException) {
                this.reportError(re);
                this.recover(this.input, re);
            } else {
                throw re;
            }
        }

        return retval;
    }
}

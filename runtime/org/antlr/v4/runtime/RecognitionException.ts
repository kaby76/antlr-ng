/* java2ts: keep */

/*
 * Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

import { java } from "../../../../../lib/java/java";

import { IntStream } from "./IntStream";
import { ParserRuleContext } from "./ParserRuleContext";
import { Recognizer } from "./Recognizer";
import { RuleContext } from "./RuleContext";
import { Token } from "./Token";
import { IntervalSet } from "./misc/IntervalSet";
import { ATNSimulator } from "./atn";

/**
 * The root of the ANTLR exception hierarchy. In general, ANTLR tracks just
 *  3 kinds of errors: prediction errors, failed predicate errors, and
 *  mismatched input errors. In each case, the parser knows where it is
 *  in the input, where it is in the ATN, the rule invocation stack,
 *  and what kind of problem occurred.
 */
export class RecognitionException<T extends ATNSimulator> extends java.lang.RuntimeException {
    /** The {@link Recognizer} where this exception originated. */
    private readonly recognizer: Recognizer<unknown, T> | null;

    private readonly ctx: RuleContext | null;
    private readonly input: IntStream | null;

    /**
     * The current {@link Token} when an error occurred. Since not all streams
     * support accessing symbols by index, we have to track the {@link Token}
     * instance itself.
     */
    private offendingToken: Token | null = null;

    private offendingState = -1;

    public constructor(recognizer: Recognizer<unknown, T> | null, input: IntStream, ctx: ParserRuleContext);
    public constructor(message: java.lang.String, recognizer: Recognizer<unknown, T> | null, input: IntStream,
        ctx: ParserRuleContext);
    public constructor(recognizerOrMessage: Recognizer<unknown, T> | java.lang.String | null,
        inputOrRecognizer: IntStream | Recognizer<unknown, T> | null, ctxOrInput: ParserRuleContext | IntStream,
        ctx?: ParserRuleContext) {

        super(recognizerOrMessage instanceof java.lang.String ? recognizerOrMessage : undefined);

        let recognizer;
        let input;
        if (recognizerOrMessage instanceof Recognizer) {
            recognizer = recognizerOrMessage;
            input = inputOrRecognizer as IntStream;
            ctx = ctxOrInput as ParserRuleContext;
        } else {
            recognizer = inputOrRecognizer as Recognizer<unknown, T>;
            input = ctxOrInput as IntStream;
        }

        this.recognizer = recognizer;
        if (recognizer !== null) {
            this.offendingState = recognizer.getState();
        }
        this.input = input;
        this.ctx = ctx!;
    }

    /**
     * Get the ATN state number the parser was in at the time the error
     * occurred. For {@link NoViableAltException} and
     * {@link LexerNoViableAltException} exceptions, this is the
     * {@link DecisionState} number. For others, it is the state whose outgoing
     * edge we couldn't match.
     *
     * If the state number is not known, this method returns -1.
     *
     * @returns tbd
     */
    public getOffendingState = (): number => {
        return this.offendingState;
    };

    /**
     * Gets the set of input symbols which could potentially follow the
     * previously matched symbol at the time this exception was thrown.
     *
     * <p>If the set of expected tokens is not known and could not be computed,
     * this method returns {@code null}.</p>
     *
      @returns The set of token types that could potentially follow the current
     * state in the ATN, or {@code null} if the information is not available.
     */
    public getExpectedTokens = (): IntervalSet | null => {
        if (this.recognizer !== null) {
            return this.recognizer.getATN().getExpectedTokens(this.offendingState, this.ctx);
        }

        return null;
    };

    /**
     * Gets the {@link RuleContext} at the time this exception was thrown.
     *
     * <p>If the context is not available, this method returns {@code null}.</p>
     *
      @returns The {@link RuleContext} at the time this exception was thrown.
     * If the context is not available, this method returns {@code null}.
     */
    public getCtx = (): RuleContext | null => {
        return this.ctx;
    };

    /**
     * Gets the input stream which is the symbol source for the recognizer where
     * this exception was thrown.
     *
     * <p>If the input stream is not available, this method returns {@code null}.</p>
     *
      @returns The input stream which is the symbol source for the recognizer
     * where this exception was thrown, or {@code null} if the stream is not
     * available.
     */
    public getInputStream = (): IntStream | null => {
        return this.input;
    };

    public getOffendingToken = (): Token | null => {
        return this.offendingToken;
    };

    /**
     * Gets the {@link Recognizer} where this exception occurred.
     *
     * <p>If the recognizer is not available, this method returns {@code null}.</p>
     *
      @returns The recognizer where this exception occurred, or {@code null} if
     * the recognizer is not available.
     */
    public getRecognizer = (): Recognizer<unknown, T> | null => {
        return this.recognizer;
    };

    protected readonly setOffendingState = (offendingState: number): void => {
        this.offendingState = offendingState;
    };

    protected readonly setOffendingToken = (offendingToken: Token | null): void => {
        this.offendingToken = offendingToken;
    };

}

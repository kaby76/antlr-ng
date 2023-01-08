/*
 * Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */




import { java } from "../../../../../../lib/java/java";
import { DFA } from "./DFA";
import { DFASerializer } from "./DFASerializer";
import { VocabularyImpl } from "../VocabularyImpl";


import { S } from "../../../../../../lib/templates";


export  class LexerDFASerializer extends DFASerializer {
	public constructor(dfa: DFA| null) {
		super(dfa, VocabularyImpl.EMPTY_VOCABULARY);
	}

	protected getEdgeLabel = (i: number):  java.lang.String | null => {
		return new  java.lang.StringBuilder(S`'`)
				.appendCodePoint(i)
				.append(S`'`)
				.toString();
	}
}

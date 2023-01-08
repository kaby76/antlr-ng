/*
 * Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */




import { java } from "../../../../../../../lib/java/java";
import { XPathElement } from "./XPathElement";
import { ParseTree } from "../ParseTree";
import { Trees } from "../Trees";




export  class XPathTokenAnywhereElement extends XPathElement {
	protected tokenType:  number;
	public constructor(tokenName: java.lang.String| null, tokenType: number) {
		super(tokenName);
		this.tokenType = tokenType;
	}

	public evaluate = (t: ParseTree| null):  java.util.Collection<ParseTree> | null => {
		return Trees.findAllTokenNodes(t, this.tokenType);
	}
}

/* java2ts: keep */

/*
 * Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

import { ParseTree } from "./ParseTree";
import { Token } from "../Token";

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface TerminalNode extends ParseTree {
    getSymbol: () => Token;
}

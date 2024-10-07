/*
 * Copyright (c) The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

import { TokenDecl } from "./TokenDecl.js";
import { Decl } from "./Decl.js";
import { OutputModelFactory } from "../../OutputModelFactory.js";

/** */
export class TokenListDecl extends TokenDecl {
    public constructor(factory: OutputModelFactory, varName: string) {
        super(factory, varName);
    }
}

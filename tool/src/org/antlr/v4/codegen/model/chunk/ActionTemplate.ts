/*
 * Copyright (c) The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

import type { ST } from "stringtemplate4ts";

import { StructDecl } from "../decl/StructDecl.js";
import { ActionChunk } from "./ActionChunk.js";

export class ActionTemplate extends ActionChunk {
    public st: ST;

    public constructor(ctx: StructDecl, st: ST) {
        super(ctx);
        this.st = st;
    }
}

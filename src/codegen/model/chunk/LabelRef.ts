/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the BSD 3-clause License. See License.txt in the project root for license information.
 */

import { SymbolRefChunk } from "./SymbolRefChunk.js";
import { StructDecl } from "../decl/StructDecl.js";

export class LabelRef extends SymbolRefChunk {
    public constructor(ctx: StructDecl, name: string, escapedName: string) {
        super(ctx, name, escapedName);
    }
}

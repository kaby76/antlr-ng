/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the BSD 3-clause License. See License.txt in the project root for license information.
 */

import type { IGrammarAST } from "../../types.js";
import type { OutputModelFactory } from "../OutputModelFactory.js";

export abstract class OutputModelObject {
    // Index signature to allow accessing properties by name in the output model walker.
    [key: string]: unknown;

    public factory?: OutputModelFactory;
    public ast?: IGrammarAST;

    public constructor(factory?: OutputModelFactory, ast?: IGrammarAST) {
        this.factory = factory;
        this.ast = ast;
    }
}

/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the BSD 3-clause License. See License.txt in the project root for license information.
 */

import { Action } from "./Action.js";
import { OutputModelFactory } from "../OutputModelFactory.js";
import { ActionAST } from "../../tool/ast/ActionAST.js";

export class ArgAction extends Action {
    /** Context type of invoked rule */
    public ctxType: string;
    public constructor(factory: OutputModelFactory, ast: ActionAST, ctxType: string) {
        super(factory, ast);
        this.ctxType = ctxType;
    }
}

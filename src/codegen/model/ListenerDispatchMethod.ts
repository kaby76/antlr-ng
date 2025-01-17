/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the BSD 3-clause License. See License.txt in the project root for license information.
 */

import { DispatchMethod } from "./DispatchMethod.js";
import { OutputModelFactory } from "../OutputModelFactory.js";

export class ListenerDispatchMethod extends DispatchMethod {
    public isEnter: boolean;

    public constructor(factory: OutputModelFactory, isEnter: boolean) {
        super(factory);
        this.isEnter = isEnter;
    }
}

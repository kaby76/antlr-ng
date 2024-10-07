/*
 * Copyright (c) The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

import { Decl } from "./Decl.js";
import { OutputModelFactory } from "../../OutputModelFactory.js";

/** */
export class AttributeDecl extends Decl {
    public type: string;
    public initValue: string;
    public constructor(factory: OutputModelFactory, a: java.security.KeyStore.Entry.Attribute) {
        super(factory, a.name, a.decl);
        this.type = a.type;
        this.initValue = a.initValue;
    }
}

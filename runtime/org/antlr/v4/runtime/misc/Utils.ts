/* java2ts: keep */

/*
 * Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

import { java } from "../../../../../../lib/java/java";
import { IntegerList } from "./IntegerList";
import { IntervalSet } from "./IntervalSet";

import { JavaObject } from "../../../../../../lib/java/lang/Object";
import { I, S } from "../../../../../../lib/templates";

export class Utils extends JavaObject {
    // Seriously: why isn't this built in to java? ugh!
    public static join<T>(iterOrArray: java.util.Iterator<T> | T[], separator: java.lang.String): java.lang.String {
        if (!Array.isArray(iterOrArray)) {
            const buf = new java.lang.StringBuilder();
            while (iterOrArray.hasNext()) {
                buf.append(`${iterOrArray.next()}`);
                if (iterOrArray.hasNext()) {
                    buf.append(separator);
                }
            }

            return buf.toString();
        } else {
            const array = iterOrArray;
            const builder: java.lang.StringBuilder = new java.lang.StringBuilder();
            for (let i = 0; i < array.length; i++) {
                builder.append(`${array[i]}`);
                if (i < array.length - 1) {
                    builder.append(separator);
                }
            }

            return builder.toString();
        }
    }

    public static numNonnull = (data: java.lang.Object[] | null): number => {
        let n = 0;
        if (data === null) {
            return n;
        }

        for (const o of data) {
            if (o !== null) {
                n++;
            }
        }

        return n;
    };

    public static removeAllElements = <T>(data: java.util.Collection<T> | null, value: T): void => {
        if (data === null) {
            return;
        }

        while (data.contains(value)) {
            data.remove(value);
        }
    };

    public static escapeWhitespace = (s: java.lang.String, escapeSpaces: boolean): java.lang.String => {
        const buf = new java.lang.StringBuilder();
        for (const c of s.toCharArray()) {
            if (c === 0x20 && escapeSpaces) {
                buf.append("\u00B7");
            } else {
                if (c === 0x9) {
                    buf.append(S`\\t`);
                } else {
                    if (c === 0xA) {
                        buf.append(S`\\n`);
                    } else {
                        if (c === 0x13) {
                            buf.append(S`\\r`);
                        } else {
                            buf.appendCodePoint(c);
                        }
                    }
                }
            }
        }

        return buf.toString();
    };

    public static writeFile(fileName: java.lang.String, content: java.lang.String, encoding?: java.lang.String): void {
        const f: java.io.File = new java.io.File(fileName);
        const fos: java.io.FileOutputStream = new java.io.FileOutputStream(f);
        const osw = new java.io.OutputStreamWriter(fos, encoding);

        try {
            osw.write(content);
        } finally {
            osw.close();
        }
    }

    public static readFile(fileName: java.lang.String, encoding?: java.lang.String): Uint16Array {
        const f = new java.io.File(fileName);
        const size = f.length();
        const fis = new java.io.FileInputStream(fileName);
        const isr = new java.io.InputStreamReader(fis, encoding);
        let data = new Uint16Array(Number(size));
        try {
            const n = isr.read(data);
            if (n < data.length) {
                data = java.util.Arrays.copyOf(data, n);
            }
        } finally {
            isr.close();
        }

        return data;
    }

    /**
     * Convert array of strings to string&rarr;index map. Useful for
     *  converting rule names to name -> rule index map.
     *
     * @param keys tbd
     *
     * @returns tbd
     */
    public static toMap = (keys: java.lang.String[]): java.util.Map<java.lang.String, java.lang.Integer> => {
        const m = new java.util.HashMap<java.lang.String, java.lang.Integer>();
        for (let i = 0; i < keys.length; i++) {
            m.put(keys[i], I`${i}`);
        }

        return m;
    };

    public static toCharArray = (data: IntegerList | null): Uint16Array | null => {
        if (data === null) {
            return null;
        }

        return data.toCharArray();
    };

    public static toSet = (bits: java.util.BitSet): IntervalSet => {
        const s = new IntervalSet();
        let i: number = bits.nextSetBit(0);
        while (i >= 0) {
            s.add(i);
            i = bits.nextSetBit(i + 1);
        }

        return s;
    };

    /***/
    public static expandTabs = (s: java.lang.String | null, tabSize: number): java.lang.String | null => {
        if (s === null) {
            return null;
        }

        const buf = new java.lang.StringBuilder();
        let col = 0;
        for (let i = 0; i < s.length(); i++) {
            const c = s.charAt(i);
            switch (c) {
                case 0xA: {
                    col = 0;
                    buf.append(c);
                    break;
                }

                case 0x9: {
                    const n = tabSize - col % tabSize;
                    col += n;
                    buf.append(Utils.spaces(n));
                    break;
                }

                default: {
                    col++;
                    buf.append(c);
                    break;
                }

            }
        }

        return buf.toString();
    };

    /***/
    public static spaces = (n: number): java.lang.String => {
        return S`${" ".repeat(n)}`;
    };

    /***/
    public static newlines = (n: number): java.lang.String => {
        return S`${"\n".repeat(n)}`;
    };

    /***/
    public static sequence = (n: number, s: java.lang.String): java.lang.String => {
        return S`${s.valueOf().repeat(n)}`;
    };

    /***/
    public static count = (s: java.lang.String, x: java.lang.char): number => {
        let n = 0;
        for (let i = 0; i < s.length(); i++) {
            if (s.charAt(i) === x) {
                n++;
            }
        }

        return n;
    };
}

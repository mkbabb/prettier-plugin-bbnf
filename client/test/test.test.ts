import { test, expect, describe, it } from "vitest";
import fs from "fs";
import { formatEBNF } from "../src";

describe("Prettier EBNF", () => {
    it("tmp", () => {
        const input = fs.readFileSync("../grammar/tmp.input.ebnf", "utf8");
        const s = formatEBNF(input);
        fs.writeFileSync("./test/formatted.out.ebnf", s, "utf8");
    });
});
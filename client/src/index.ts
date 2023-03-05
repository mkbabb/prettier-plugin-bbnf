import { locStart, parse, preprocess, locEnd } from "./parser";
import { EBNFPrint } from "./printer";

import prettier, { Plugin, doc } from "prettier";

export const languages = [
    {
        name: "EBNF",
        since: "0.1",
        parsers: ["ebnf"],
        extensions: [".ebnf"],
        tmScope: "ebnf.ebnf",
        aceMode: "text",
        linguistLanguageId: 666,
        vscodeLanguageIds: ["ebnf"],
    },
];

const printers = {
    ebnf: {
        print: EBNFPrint,
    },
};

const parsers = {
    ebnf: {
        parse,
        astFormat: "ebnf",
        locStart,
        locEnd,
        preprocess,
    },
};

const defaultOptions = {
    ebnf: {
        printWidth: 66,
        tabWidth: 4,
        useTabs: false,
    },
};

export const EBNFPlugin = {
    languages,
    printers,
    parsers,
    defaultOptions,
} as Plugin;

export const formatEBNF = (grammar: string, options?) => {
    return prettier.format(grammar, {
        parser: "ebnf",
        plugins: [EBNFPlugin],

        ...defaultOptions,
        ...(options ?? {}),
    });
};
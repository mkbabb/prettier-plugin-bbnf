import * as $n from "vscode";
var Il = Object.defineProperty, _l = (xe, oe, te) => oe in xe ? Il(xe, oe, { enumerable: !0, configurable: !0, writable: !0, value: te }) : xe[oe] = te, Ll = (xe, oe, te) => (_l(xe, typeof oe != "symbol" ? oe + "" : oe, te), te);
class su {
  constructor(oe, te = void 0, Ne = 0, Oe = !1) {
    this.src = oe, this.value = te, this.offset = Ne, this.isError = Oe;
  }
  ok(oe, te = 0) {
    return new su(this.src, oe, this.offset + te);
  }
  err(oe, te = 0) {
    const Ne = this.ok(oe, te);
    return Ne.isError = !0, Ne;
  }
  from(oe, te = 0) {
    return new su(this.src, oe, this.offset + te, this.isError);
  }
  getColumnNumber() {
    const oe = this.offset, te = this.src.lastIndexOf(`
`, oe), Ne = te === -1 ? oe : oe - (te + 1);
    return Math.max(0, Ne);
  }
  getLineNumber() {
    const oe = this.src.slice(0, this.offset).split(`
`).length - 1;
    return Math.max(0, oe);
  }
}
function Qt(xe, oe, ...te) {
  return {
    name: xe,
    parser: oe,
    args: te
  };
}
let Ol = 0;
const nr = /* @__PURE__ */ new Map(), au = /* @__PURE__ */ new Map();
function Zi(xe) {
  return xe.parser ? xe.parser : xe.parser = xe();
}
class on {
  constructor(oe, te = {}) {
    Ll(this, "id", Ol++), this.parser = oe, this.context = te;
  }
  parse(oe) {
    return nr.clear(), au.clear(), this.parser(new su(oe)).value;
  }
  getCijKey(oe) {
    return `${this.id}${oe.offset}`;
  }
  atLeftRecursionLimit(oe) {
    return (au.get(this.getCijKey(oe)) ?? 0) > oe.src.length - oe.offset;
  }
  memoize() {
    const oe = (te) => {
      const Ne = this.getCijKey(te), Oe = au.get(Ne) ?? 0;
      let ke = nr.get(this.id);
      if (ke && ke.offset >= te.offset)
        return ke;
      if (this.atLeftRecursionLimit(te))
        return te.err(void 0);
      au.set(Ne, Oe + 1);
      const gt = this.parser(te);
      return ke = nr.get(this.id), ke && ke.offset > gt.offset ? gt.offset = ke.offset : ke || nr.set(this.id, gt), gt;
    };
    return new on(
      oe,
      Qt("memoize", this)
    );
  }
  mergeMemos() {
    const oe = (te) => {
      let Ne = nr.get(this.id);
      if (Ne)
        return Ne;
      if (this.atLeftRecursionLimit(te))
        return te.err(void 0);
      const Oe = this.parser(te);
      return Ne = nr.get(this.id), Ne || nr.set(this.id, Oe), Oe;
    };
    return new on(
      oe,
      Qt("mergeMemo", this)
    );
  }
  then(oe) {
    if (jr(this, oe))
      return Ir([this, oe], "", (Ne) => [Ne == null ? void 0 : Ne[0], Ne == null ? void 0 : Ne[1]]);
    const te = (Ne) => {
      const Oe = this.parser(Ne);
      if (!Oe.isError) {
        const ke = oe.parser(Oe);
        if (!ke.isError)
          return ke.ok([Oe.value, ke.value]);
      }
      return Ne.err(void 0);
    };
    return new on(
      te,
      Qt("then", this, this, oe)
    );
  }
  or(oe) {
    if (jr(this, oe))
      return Ir([this, oe], "|");
    const te = (Ne) => {
      const Oe = this.parser(Ne);
      return Oe.isError ? oe.parser(Ne) : Oe;
    };
    return new on(
      te,
      Qt("or", this, this, oe)
    );
  }
  chain(oe, te = !1) {
    const Ne = (Oe) => {
      const ke = this.parser(Oe);
      return ke.isError ? ke : ke.value || te ? oe(ke.value).parser(ke) : Oe;
    };
    return new on(Ne, Qt("chain", this, oe));
  }
  map(oe, te = !1) {
    const Ne = (Oe) => {
      const ke = this.parser(Oe);
      return !ke.isError || te ? ke.ok(oe(ke.value)) : ke;
    };
    return new on(Ne, Qt("map", this));
  }
  mapState(oe) {
    const te = (Ne) => {
      const Oe = this.parser(Ne);
      return oe(Oe);
    };
    return new on(
      te,
      Qt("mapState", this)
    );
  }
  skip(oe) {
    const te = (Ne) => {
      const Oe = this.parser(Ne);
      if (!Oe.isError) {
        const ke = oe.parser(Oe);
        if (!ke.isError)
          return ke.ok(Oe.value);
      }
      return Ne.err(void 0);
    };
    return new on(
      te,
      Qt("skip", this, oe)
    );
  }
  next(oe) {
    const te = this.then(oe).map(([, Ne]) => Ne);
    return te.context = Qt("next", this, oe), te;
  }
  opt() {
    const oe = (te) => {
      const Ne = this.parser(te);
      return Ne.isError ? te.ok(void 0) : Ne;
    };
    return new on(oe, Qt("opt", this));
  }
  not(oe) {
    const te = (Oe) => this.parser(Oe).isError ? Oe.ok(Oe.value) : Oe.err(void 0), Ne = (Oe) => {
      const ke = this.parser(Oe);
      return ke.isError || oe.parser(Oe).isError ? ke : Oe.err(void 0);
    };
    return new on(
      oe ? Ne : te,
      Qt("not", this, oe)
    );
  }
  wrap(oe, te, Ne = !0) {
    if (!Ne)
      return mr(oe, this, te);
    if (jr(oe, this, te))
      return $l(oe, this, te);
    const Oe = oe.next(this).skip(te);
    return Oe.context = Qt("wrap", this, oe, te), Oe;
  }
  trim(oe = ea, te = !0) {
    var Ne;
    if (!te)
      return mr(oe, this, oe);
    if (((Ne = oe.context) == null ? void 0 : Ne.name) === "whitespace") {
      if (jr(this, oe))
        return Ir(
          [oe, this, oe],
          "",
          (ke) => ke == null ? void 0 : ke[2]
        );
      const Oe = (ke) => {
        const gt = Ki(ke), $t = this.parser(gt);
        return $t.isError ? ke.err(void 0) : Ki($t);
      };
      return new on(
        Oe,
        Qt("trimWhitespace", this)
      );
    }
    return this.wrap(oe, oe);
  }
  many(oe = 0, te = 1 / 0) {
    const Ne = (Oe) => {
      const ke = [];
      let gt = Oe;
      for (let $t = 0; $t < te; $t += 1) {
        const Zt = this.parser(gt);
        if (Zt.isError)
          break;
        ke.push(Zt.value), gt = Zt;
      }
      return ke.length >= oe ? gt.ok(ke) : Oe.err([]);
    };
    return new on(
      Ne,
      Qt("many", this, oe, te)
    );
  }
  sepBy(oe, te = 0, Ne = 1 / 0) {
    const Oe = (ke) => {
      const gt = [];
      let $t = ke;
      for (let Zt = 0; Zt < Ne; Zt += 1) {
        const dn = this.parser($t);
        if (dn.isError)
          break;
        $t = dn, gt.push($t.value);
        const en = oe.parser($t);
        if (en.isError)
          break;
        $t = en;
      }
      return gt.length > te ? $t.ok(gt) : ke.err([]);
    };
    return new on(
      Oe,
      Qt("sepBy", this, oe)
    );
  }
  eof() {
    const oe = this.skip(Rl());
    return oe.context = Qt("eof", this), oe;
  }
  toString() {
    var oe;
    return (oe = this.context) == null ? void 0 : oe.name;
  }
  static lazy(oe) {
    const te = (Ne) => Zi(oe).parser(Ne);
    return new on(te, Qt("lazy", void 0, oe));
  }
}
function jr(...xe) {
  return xe.every(
    (oe) => {
      var te, Ne, Oe, ke;
      return (((te = oe.context) == null ? void 0 : te.name) === "string" || ((Ne = oe.context) == null ? void 0 : Ne.name) === "regex" || ((Oe = oe.context) == null ? void 0 : Oe.name) === "whitespace") && ((ke = oe.context) == null ? void 0 : ke.args);
    }
  );
}
function Ml(xe) {
  var oe, te, Ne, Oe, ke;
  if (((oe = xe.context) == null ? void 0 : oe.name) === "string")
    return (te = xe.context) == null ? void 0 : te.args[0].replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  if (((Ne = xe.context) == null ? void 0 : Ne.name) === "regex" || ((Oe = xe.context) == null ? void 0 : Oe.name) === "whitespace")
    return (ke = xe.context) == null ? void 0 : ke.args[0].source;
}
function Ir(xe, oe = "", te) {
  const Ne = xe.map((gt) => `(${Ml(gt)})`).join(oe), Oe = new RegExp(Ne), ke = Yn(Oe, te);
  return oe !== "|" && (ke.context = Qt("regexConcat", this, Oe)), ke;
}
function $l(xe, oe, te) {
  const Ne = Ir([xe, oe, te], "", (Oe) => Oe == null ? void 0 : Oe[2]);
  return Ne.context.name = "regexWrap", Ne;
}
function Rl() {
  const xe = (oe) => oe.offset >= oe.src.length ? oe.ok(void 0) : oe.err();
  return new on(xe, Qt("eof", void 0));
}
function Fn(xe, oe, te) {
  const Ne = te.value.bind(xe);
  te.value = function() {
    const Oe = (ke) => Zi(Ne).parser(ke);
    return new on(Oe, Qt("lazy", void 0, Ne));
  };
}
function fr(...xe) {
  if (jr(...xe))
    return Ir(xe, "|");
  const oe = (te) => {
    for (const Ne of xe) {
      const Oe = Ne.parser(te);
      if (!Oe.isError)
        return Oe;
    }
    return te.err(void 0);
  };
  return new on(
    xe.length === 1 ? xe[0].parser : oe,
    Qt("any", void 0, ...xe)
  );
}
function mr(...xe) {
  const oe = (te) => {
    const Ne = [];
    for (const Oe of xe) {
      const ke = Oe.parser(te);
      if (ke.isError)
        return ke;
      ke.value !== void 0 && Ne.push(ke.value), te = ke;
    }
    return te.ok(Ne);
  };
  return new on(
    xe.length === 1 ? xe[0].parser : oe,
    Qt("all", void 0, ...xe)
  );
}
function zt(xe) {
  const oe = (te) => {
    if (te.offset >= te.src.length)
      return te.err(void 0);
    const Ne = te.src.slice(te.offset, te.offset + xe.length);
    return Ne === xe ? te.ok(Ne, Ne.length) : te.err(void 0);
  };
  return new on(
    oe,
    Qt("string", void 0, xe)
  );
}
function Yn(xe, oe = (te) => te == null ? void 0 : te[0]) {
  const te = xe.flags.replace(/y/g, ""), Ne = new RegExp(xe, te + "y"), Oe = (ke) => {
    if (ke.offset >= ke.src.length)
      return ke.err(void 0);
    Ne.lastIndex = ke.offset;
    const gt = oe(ke.src.match(Ne));
    return gt ? ke.ok(gt, Ne.lastIndex - ke.offset) : gt === "" ? ke.ok(void 0) : ke.err(void 0);
  };
  return new on(
    Oe,
    Qt("regex", void 0, xe)
  );
}
const Yi = /\s*/y, Ki = (xe) => {
  var oe;
  if (xe.offset >= xe.src.length)
    return xe;
  Yi.lastIndex = xe.offset;
  const te = ((oe = xe.src.match(Yi)) == null ? void 0 : oe[0]) ?? "";
  return xe.ok(xe.value, te.length);
}, ea = Yn(/\s*/);
ea.context.name = "whitespace";
var Vl = Object.defineProperty, Jl = (xe, oe, te) => oe in xe ? Vl(xe, oe, { enumerable: !0, configurable: !0, writable: !0, value: te }) : xe[oe] = te, ql = (xe, oe, te) => (Jl(xe, typeof oe != "symbol" ? oe + "" : oe, te), te), Gl = Object.defineProperty, Wl = Object.getOwnPropertyDescriptor, An = (xe, oe, te, Ne) => {
  for (var Oe = Ne > 1 ? void 0 : Ne ? Wl(oe, te) : oe, ke = xe.length - 1, gt; ke >= 0; ke--)
    (gt = xe[ke]) && (Oe = (Ne ? gt(oe, te, Oe) : gt(Oe)) || Oe);
  return Ne && Oe && Gl(oe, te, Oe), Oe;
};
const ta = {
  "|": "alternation",
  ",": "concatenation",
  "-": "minus",
  "<<": "skip",
  ">>": "next",
  "*": "many",
  "+": "many1",
  "?": "optional",
  "?w": "optionalWhitespace"
}, Xl = ([xe, oe]) => oe.length === 0 ? xe : oe.reduce((te, [Ne, Oe]) => ({
  type: ta[Ne],
  value: [te, Oe]
}), xe), Ul = ([xe, oe]) => oe === void 0 ? xe : {
  type: ta[oe],
  value: xe
}, zl = {
  debug: !1,
  comments: !0
};
class hn {
  constructor(oe) {
    ql(this, "options"), this.options = {
      ...zl,
      ...oe ?? {}
    };
  }
  identifier() {
    return Yn(/[_a-zA-Z][_a-zA-Z0-9]*/).trim();
  }
  literal() {
    return this.trimBigComment(
      fr(
        Yn(/[^"]+/).wrap(zt('"'), zt('"')),
        Yn(/[^']+/).wrap(zt("'"), zt("'"))
      ).map((oe) => ({
        type: "literal",
        value: oe
      }))
    );
  }
  epsilon() {
    return fr(zt("epsilon"), zt("ε")).trim().map((oe) => ({
      type: "epsilon",
      value: void 0
    }));
  }
  nonterminal() {
    return this.identifier().map((oe) => ({
      type: "nonterminal",
      value: oe
    }));
  }
  bigComment() {
    return Yn(/\/\*[^\*]*\*\//).trim();
  }
  comment() {
    return Yn(/\/\/.*/).or(this.bigComment()).trim();
  }
  trimBigComment(oe) {
    return oe.trim(this.bigComment().many(), !1).map(([te, Ne, Oe]) => (Ne.comment = {
      left: te,
      right: Oe
    }, Ne));
  }
  group() {
    return this.rhs().trim().wrap(zt("("), zt(")")).map((oe) => ({
      type: "group",
      value: oe
    }));
  }
  regex() {
    return Yn(/[^\/]*/).wrap(zt("/"), zt("/")).map((oe) => ({
      type: "regex",
      value: new RegExp(oe)
    }));
  }
  optionalGroup() {
    return this.rhs().trim().wrap(zt("["), zt("]")).map((oe) => ({
      type: "optional",
      value: oe
    }));
  }
  manyGroup() {
    return this.rhs().trim().wrap(zt("{"), zt("}")).map((oe) => ({
      type: "many",
      value: oe
    }));
  }
  lhs() {
    return this.identifier();
  }
  term() {
    return fr(
      this.epsilon(),
      this.group(),
      this.optionalGroup(),
      this.manyGroup(),
      this.nonterminal(),
      this.literal(),
      this.regex()
    );
  }
  factor() {
    return this.trimBigComment(
      mr(
        this.term(),
        fr(
          zt("?w").trim(),
          zt("?").trim(),
          zt("*").trim(),
          zt("+").trim()
        ).opt()
      ).map(Ul)
    );
  }
  binaryFactor() {
    return mr(
      this.factor(),
      mr(
        fr(zt("<<").trim(), zt(">>").trim(), zt("-").trim()),
        this.factor()
      ).many()
    ).map(Xl);
  }
  concatenation() {
    return this.binaryFactor().sepBy(zt(",").trim()).map((oe) => oe.length === 1 ? oe[0] : {
      type: "concatenation",
      value: oe
    });
  }
  alternation() {
    return this.concatenation().sepBy(zt("|").trim()).map((oe) => oe.length === 1 ? oe[0] : {
      type: "alternation",
      value: oe
    });
  }
  rhs() {
    return this.alternation();
  }
  productionRule() {
    return mr(
      this.lhs(),
      zt("=").trim(),
      this.rhs(),
      fr(zt(";"), zt(".")).trim()
    ).map(([oe, , te]) => ({ name: oe, expression: te }));
  }
  grammar() {
    return this.productionRule().trim(this.comment().many(), !1).map(([oe, te, Ne]) => (te.comment = {
      above: oe,
      below: Ne
    }, te)).many(1);
  }
}
An([
  Fn
], hn.prototype, "bigComment", 1);
An([
  Fn
], hn.prototype, "comment", 1);
An([
  Fn
], hn.prototype, "group", 1);
An([
  Fn
], hn.prototype, "regex", 1);
An([
  Fn
], hn.prototype, "optionalGroup", 1);
An([
  Fn
], hn.prototype, "manyGroup", 1);
An([
  Fn
], hn.prototype, "lhs", 1);
An([
  Fn
], hn.prototype, "term", 1);
An([
  Fn
], hn.prototype, "factor", 1);
An([
  Fn
], hn.prototype, "binaryFactor", 1);
An([
  Fn
], hn.prototype, "concatenation", 1);
An([
  Fn
], hn.prototype, "alternation", 1);
An([
  Fn
], hn.prototype, "rhs", 1);
An([
  Fn
], hn.prototype, "productionRule", 1);
An([
  Fn
], hn.prototype, "grammar", 1);
function Yl(xe) {
  const oe = /* @__PURE__ */ new Set(), te = [];
  function Ne(ke, gt) {
    if (gt.has(ke) || oe.has(ke))
      return;
    gt.add(ke);
    const $t = xe.get(ke);
    if (!$t)
      return;
    const Zt = $t.expression;
    if (Zt.type === "nonterminal")
      Ne(Zt.value, gt);
    else if (Zt.value instanceof Array)
      for (const dn of Zt.value)
        dn.type === "nonterminal" && Ne(dn.value, gt);
    oe.add(ke), gt.delete(ke), te.unshift(xe.get(ke));
  }
  for (const [ke] of xe)
    Ne(ke, /* @__PURE__ */ new Set());
  const Oe = /* @__PURE__ */ new Map();
  for (const ke of te)
    Oe.set(ke.name, ke);
  return Oe;
}
function Kl(xe) {
  const oe = new hn().grammar().parse(xe);
  if (!oe)
    throw new Error("Failed to parse EBNF grammar");
  return oe.reduce((te, Ne, Oe) => te.set(Ne.name, Ne), /* @__PURE__ */ new Map());
}
function Ql(xe) {
  return 0;
}
function Hl(xe) {
  return 0;
}
function Zl(xe, oe) {
  return xe;
}
function ep(xe, oe, te) {
  const Ne = Kl(xe);
  let Oe;
  return te.sort ? Oe = [...Yl(Ne).entries()].reverse() : Oe = [...Ne.entries()], Oe.filter(([ke]) => ke).reduce((ke, [gt, $t]) => ke.set(gt, $t), /* @__PURE__ */ new Map());
}
var Qi = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function tp(xe) {
  return xe && xe.__esModule && Object.prototype.hasOwnProperty.call(xe, "default") ? xe.default : xe;
}
var Mt = {}, np = {
  get exports() {
    return Mt;
  },
  set exports(xe) {
    Mt = xe;
  }
};
(function(xe, oe) {
  (function(te) {
    xe.exports = te();
  })(function() {
    var te = Object.getOwnPropertyNames, Ne = (ke, gt) => function() {
      return gt || (0, ke[te(ke)[0]])((gt = { exports: {} }).exports, gt), gt.exports;
    }, Oe = Ne({
      "dist/_doc.js.umd.js"(ke, gt) {
        var $t = Object.create, Zt = Object.defineProperty, dn = Object.getOwnPropertyDescriptor, en = Object.getOwnPropertyNames, Jn = Object.getPrototypeOf, ou = Object.prototype.hasOwnProperty, Rn = (Ye, vt) => function() {
          return Ye && (vt = (0, Ye[en(Ye)[0]])(Ye = 0)), vt;
        }, In = (Ye, vt) => function() {
          return vt || (0, Ye[en(Ye)[0]])((vt = {
            exports: {}
          }).exports, vt), vt.exports;
        }, gr = (Ye, vt) => {
          for (var wt in vt)
            Zt(Ye, wt, {
              get: vt[wt],
              enumerable: !0
            });
        }, yr = (Ye, vt, wt, kt) => {
          if (vt && typeof vt == "object" || typeof vt == "function")
            for (let Pt of en(vt))
              !ou.call(Ye, Pt) && Pt !== wt && Zt(Ye, Pt, {
                get: () => vt[Pt],
                enumerable: !(kt = dn(vt, Pt)) || kt.enumerable
              });
          return Ye;
        }, vn = (Ye, vt, wt) => (wt = Ye != null ? $t(Jn(Ye)) : {}, yr(vt || !Ye || !Ye.__esModule ? Zt(wt, "default", {
          value: Ye,
          enumerable: !0
        }) : wt, Ye)), qn = (Ye) => yr(Zt({}, "__esModule", {
          value: !0
        }), Ye), ln = Rn({
          "<define:process>"() {
          }
        }), rr = In({
          "src/document/doc-builders.js"(Ye, vt) {
            ln();
            function wt(Ct) {
              return {
                type: "concat",
                parts: Ct
              };
            }
            function kt(Ct) {
              return {
                type: "indent",
                contents: Ct
              };
            }
            function Pt(Ct, ve) {
              return {
                type: "align",
                contents: ve,
                n: Ct
              };
            }
            function tn(Ct) {
              let ve = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
              return {
                type: "group",
                id: ve.id,
                contents: Ct,
                break: Boolean(ve.shouldBreak),
                expandedStates: ve.expandedStates
              };
            }
            function ht(Ct) {
              return Pt(Number.NEGATIVE_INFINITY, Ct);
            }
            function Gt(Ct) {
              return Pt({
                type: "root"
              }, Ct);
            }
            function Ht(Ct) {
              return Pt(-1, Ct);
            }
            function jt(Ct, ve) {
              return tn(Ct[0], Object.assign(Object.assign({}, ve), {}, {
                expandedStates: Ct
              }));
            }
            function fn(Ct) {
              return {
                type: "fill",
                parts: Ct
              };
            }
            function Ke(Ct, ve) {
              let Le = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
              return {
                type: "if-break",
                breakContents: Ct,
                flatContents: ve,
                groupId: Le.groupId
              };
            }
            function Yt(Ct, ve) {
              return {
                type: "indent-if-break",
                contents: Ct,
                groupId: ve.groupId,
                negate: ve.negate
              };
            }
            function nn(Ct) {
              return {
                type: "line-suffix",
                contents: Ct
              };
            }
            var Vt = {
              type: "line-suffix-boundary"
            }, En = {
              type: "break-parent"
            }, Ln = {
              type: "trim"
            }, Mn = {
              type: "line",
              hard: !0
            }, mn = {
              type: "line",
              hard: !0,
              literal: !0
            }, Kn = {
              type: "line"
            }, It = {
              type: "line",
              soft: !0
            }, _t = wt([Mn, En]), Xt = wt([mn, En]), pn = {
              type: "cursor",
              placeholder: Symbol("cursor")
            };
            function rn(Ct, ve) {
              const Le = [];
              for (let We = 0; We < ve.length; We++)
                We !== 0 && Le.push(Ct), Le.push(ve[We]);
              return wt(Le);
            }
            function Bt(Ct, ve, Le) {
              let We = Ct;
              if (ve > 0) {
                for (let ot = 0; ot < Math.floor(ve / Le); ++ot)
                  We = kt(We);
                We = Pt(ve % Le, We), We = Pt(Number.NEGATIVE_INFINITY, We);
              }
              return We;
            }
            function Ot(Ct, ve) {
              return {
                type: "label",
                label: Ct,
                contents: ve
              };
            }
            vt.exports = {
              concat: wt,
              join: rn,
              line: Kn,
              softline: It,
              hardline: _t,
              literalline: Xt,
              group: tn,
              conditionalGroup: jt,
              fill: fn,
              lineSuffix: nn,
              lineSuffixBoundary: Vt,
              cursor: pn,
              breakParent: En,
              ifBreak: Ke,
              trim: Ln,
              indent: kt,
              indentIfBreak: Yt,
              align: Pt,
              addAlignmentToDoc: Bt,
              markAsRoot: Gt,
              dedentToRoot: ht,
              dedent: Ht,
              hardlineWithoutBreakParent: Mn,
              literallineWithoutBreakParent: mn,
              label: Ot
            };
          }
        }), lu = In({
          "src/common/end-of-line.js"(Ye, vt) {
            ln();
            function wt(ht) {
              const Gt = ht.indexOf("\r");
              return Gt >= 0 ? ht.charAt(Gt + 1) === `
` ? "crlf" : "cr" : "lf";
            }
            function kt(ht) {
              switch (ht) {
                case "cr":
                  return "\r";
                case "crlf":
                  return `\r
`;
                default:
                  return `
`;
              }
            }
            function Pt(ht, Gt) {
              let Ht;
              switch (Gt) {
                case `
`:
                  Ht = /\n/g;
                  break;
                case "\r":
                  Ht = /\r/g;
                  break;
                case `\r
`:
                  Ht = /\r\n/g;
                  break;
                default:
                  throw new Error(`Unexpected "eol" ${JSON.stringify(Gt)}.`);
              }
              const jt = ht.match(Ht);
              return jt ? jt.length : 0;
            }
            function tn(ht) {
              return ht.replace(/\r\n?/g, `
`);
            }
            vt.exports = {
              guessEndOfLine: wt,
              convertEndOfLineToChars: kt,
              countEndOfLineChars: Pt,
              normalizeEndOfLine: tn
            };
          }
        }), _r = In({
          "src/utils/get-last.js"(Ye, vt) {
            ln();
            var wt = (kt) => kt[kt.length - 1];
            vt.exports = wt;
          }
        });
        function Lr() {
          let {
            onlyFirst: Ye = !1
          } = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
          const vt = ["[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)", "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))"].join("|");
          return new RegExp(vt, Ye ? void 0 : "g");
        }
        var Or = Rn({
          "node_modules/strip-ansi/node_modules/ansi-regex/index.js"() {
            ln();
          }
        });
        function Mr(Ye) {
          if (typeof Ye != "string")
            throw new TypeError(`Expected a \`string\`, got \`${typeof Ye}\``);
          return Ye.replace(Lr(), "");
        }
        var hr = Rn({
          "node_modules/strip-ansi/index.js"() {
            ln(), Or();
          }
        });
        function ur(Ye) {
          return Number.isInteger(Ye) ? Ye >= 4352 && (Ye <= 4447 || Ye === 9001 || Ye === 9002 || 11904 <= Ye && Ye <= 12871 && Ye !== 12351 || 12880 <= Ye && Ye <= 19903 || 19968 <= Ye && Ye <= 42182 || 43360 <= Ye && Ye <= 43388 || 44032 <= Ye && Ye <= 55203 || 63744 <= Ye && Ye <= 64255 || 65040 <= Ye && Ye <= 65049 || 65072 <= Ye && Ye <= 65131 || 65281 <= Ye && Ye <= 65376 || 65504 <= Ye && Ye <= 65510 || 110592 <= Ye && Ye <= 110593 || 127488 <= Ye && Ye <= 127569 || 131072 <= Ye && Ye <= 262141) : !1;
        }
        var Er = Rn({
          "node_modules/is-fullwidth-code-point/index.js"() {
            ln();
          }
        }), pu = In({
          "node_modules/emoji-regex/index.js"(Ye, vt) {
            ln(), vt.exports = function() {
              return /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67)\uDB40\uDC7F|(?:\uD83E\uDDD1\uD83C\uDFFF\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFE])|(?:\uD83E\uDDD1\uD83C\uDFFE\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFD\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFC\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFB\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFC-\uDFFF])|\uD83D\uDC68(?:\uD83C\uDFFB(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF]))|\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|[\u2695\u2696\u2708]\uFE0F|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))?|(?:\uD83C[\uDFFC-\uDFFF])\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF]))|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])\uFE0F|\u200D(?:(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D[\uDC66\uDC67])|\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC)?|(?:\uD83D\uDC69(?:\uD83C\uDFFB\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|(?:\uD83C[\uDFFC-\uDFFF])\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69]))|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1)(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC69(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83E\uDDD1(?:\u200D(?:\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83E\uDDD1(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\uD83D\uDE36\u200D\uD83C\uDF2B|\uD83C\uDFF3\uFE0F\u200D\u26A7|\uD83D\uDC3B\u200D\u2744|(?:(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\uD83C\uDFF4\u200D\u2620|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])\u200D[\u2640\u2642]|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u2328\u23CF\u23ED-\u23EF\u23F1\u23F2\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB\u25FC\u2600-\u2604\u260E\u2611\u2618\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u2692\u2694-\u2697\u2699\u269B\u269C\u26A0\u26A7\u26B0\u26B1\u26C8\u26CF\u26D1\u26D3\u26E9\u26F0\u26F1\u26F4\u26F7\u26F8\u2702\u2708\u2709\u270F\u2712\u2714\u2716\u271D\u2721\u2733\u2734\u2744\u2747\u2763\u27A1\u2934\u2935\u2B05-\u2B07\u3030\u303D\u3297\u3299]|\uD83C[\uDD70\uDD71\uDD7E\uDD7F\uDE02\uDE37\uDF21\uDF24-\uDF2C\uDF36\uDF7D\uDF96\uDF97\uDF99-\uDF9B\uDF9E\uDF9F\uDFCD\uDFCE\uDFD4-\uDFDF\uDFF5\uDFF7]|\uD83D[\uDC3F\uDCFD\uDD49\uDD4A\uDD6F\uDD70\uDD73\uDD76-\uDD79\uDD87\uDD8A-\uDD8D\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA\uDECB\uDECD-\uDECF\uDEE0-\uDEE5\uDEE9\uDEF0\uDEF3])\uFE0F|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDE35\u200D\uD83D\uDCAB|\uD83D\uDE2E\u200D\uD83D\uDCA8|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83E\uDDD1(?:\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC|\uD83C\uDFFB)?|\uD83D\uDC69(?:\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC|\uD83C\uDFFB)?|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF6\uD83C\uDDE6|\uD83C\uDDF4\uD83C\uDDF2|\uD83D\uDC08\u200D\u2B1B|\u2764\uFE0F\u200D(?:\uD83D\uDD25|\uD83E\uDE79)|\uD83D\uDC41\uFE0F|\uD83C\uDFF3\uFE0F|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|[#\*0-9]\uFE0F\u20E3|\u2764\uFE0F|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])|\uD83C\uDFF4|(?:[\u270A\u270B]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270C\u270D]|\uD83D[\uDD74\uDD90])(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])|[\u270A\u270B]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC08\uDC15\uDC3B\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE2E\uDE35\uDE36\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5]|\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD]|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF]|[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF84\uDF86-\uDF93\uDFA0-\uDFC1\uDFC5\uDFC6\uDFC8\uDFC9\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC07\uDC09-\uDC14\uDC16-\uDC3A\uDC3C-\uDC3E\uDC40\uDC44\uDC45\uDC51-\uDC65\uDC6A\uDC79-\uDC7B\uDC7D-\uDC80\uDC84\uDC88-\uDC8E\uDC90\uDC92-\uDCA9\uDCAB-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDDA4\uDDFB-\uDE2D\uDE2F-\uDE34\uDE37-\uDE44\uDE48-\uDE4A\uDE80-\uDEA2\uDEA4-\uDEB3\uDEB7-\uDEBF\uDEC1-\uDEC5\uDED0-\uDED2\uDED5-\uDED7\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0D\uDD0E\uDD10-\uDD17\uDD1D\uDD20-\uDD25\uDD27-\uDD2F\uDD3A\uDD3F-\uDD45\uDD47-\uDD76\uDD78\uDD7A-\uDDB4\uDDB7\uDDBA\uDDBC-\uDDCB\uDDD0\uDDE0-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6]|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5-\uDED7\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0C-\uDD3A\uDD3C-\uDD45\uDD47-\uDD78\uDD7A-\uDDCB\uDDCD-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26A7\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5-\uDED7\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0C-\uDD3A\uDD3C-\uDD45\uDD47-\uDD78\uDD7A-\uDDCB\uDDCD-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDD77\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD])/g;
            };
          }
        }), $r = {};
        gr($r, {
          default: () => Cr
        });
        function Cr(Ye) {
          if (typeof Ye != "string" || Ye.length === 0 || (Ye = Mr(Ye), Ye.length === 0))
            return 0;
          Ye = Ye.replace((0, ir.default)(), "  ");
          let vt = 0;
          for (let wt = 0; wt < Ye.length; wt++) {
            const kt = Ye.codePointAt(wt);
            kt <= 31 || kt >= 127 && kt <= 159 || kt >= 768 && kt <= 879 || (kt > 65535 && wt++, vt += ur(kt) ? 2 : 1);
          }
          return vt;
        }
        var ir, Rr = Rn({
          "node_modules/string-width/index.js"() {
            ln(), hr(), Er(), ir = vn(pu());
          }
        }), Fr = In({
          "src/utils/get-string-width.js"(Ye, vt) {
            ln();
            var wt = (Rr(), qn($r)).default, kt = /[^\x20-\x7F]/;
            function Pt(tn) {
              return tn ? kt.test(tn) ? wt(tn) : tn.length : 0;
            }
            vt.exports = Pt;
          }
        }), _n = In({
          "src/document/doc-utils.js"(Ye, vt) {
            ln();
            var wt = _r(), {
              literalline: kt,
              join: Pt
            } = rr(), tn = (ve) => Array.isArray(ve) || ve && ve.type === "concat", ht = (ve) => {
              if (Array.isArray(ve))
                return ve;
              if (ve.type !== "concat" && ve.type !== "fill")
                throw new Error("Expect doc type to be `concat` or `fill`.");
              return ve.parts;
            }, Gt = {};
            function Ht(ve, Le, We, ot) {
              const nt = [ve];
              for (; nt.length > 0; ) {
                const Qe = nt.pop();
                if (Qe === Gt) {
                  We(nt.pop());
                  continue;
                }
                if (We && nt.push(Qe, Gt), !Le || Le(Qe) !== !1)
                  if (tn(Qe) || Qe.type === "fill") {
                    const dt = ht(Qe);
                    for (let un = dt.length, Pn = un - 1; Pn >= 0; --Pn)
                      nt.push(dt[Pn]);
                  } else if (Qe.type === "if-break")
                    Qe.flatContents && nt.push(Qe.flatContents), Qe.breakContents && nt.push(Qe.breakContents);
                  else if (Qe.type === "group" && Qe.expandedStates)
                    if (ot)
                      for (let dt = Qe.expandedStates.length, un = dt - 1; un >= 0; --un)
                        nt.push(Qe.expandedStates[un]);
                    else
                      nt.push(Qe.contents);
                  else
                    Qe.contents && nt.push(Qe.contents);
              }
            }
            function jt(ve, Le) {
              const We = /* @__PURE__ */ new Map();
              return ot(ve);
              function ot(Qe) {
                if (We.has(Qe))
                  return We.get(Qe);
                const dt = nt(Qe);
                return We.set(Qe, dt), dt;
              }
              function nt(Qe) {
                if (Array.isArray(Qe))
                  return Le(Qe.map(ot));
                if (Qe.type === "concat" || Qe.type === "fill") {
                  const dt = Qe.parts.map(ot);
                  return Le(Object.assign(Object.assign({}, Qe), {}, {
                    parts: dt
                  }));
                }
                if (Qe.type === "if-break") {
                  const dt = Qe.breakContents && ot(Qe.breakContents), un = Qe.flatContents && ot(Qe.flatContents);
                  return Le(Object.assign(Object.assign({}, Qe), {}, {
                    breakContents: dt,
                    flatContents: un
                  }));
                }
                if (Qe.type === "group" && Qe.expandedStates) {
                  const dt = Qe.expandedStates.map(ot), un = dt[0];
                  return Le(Object.assign(Object.assign({}, Qe), {}, {
                    contents: un,
                    expandedStates: dt
                  }));
                }
                if (Qe.contents) {
                  const dt = ot(Qe.contents);
                  return Le(Object.assign(Object.assign({}, Qe), {}, {
                    contents: dt
                  }));
                }
                return Le(Qe);
              }
            }
            function fn(ve, Le, We) {
              let ot = We, nt = !1;
              function Qe(dt) {
                const un = Le(dt);
                if (un !== void 0 && (nt = !0, ot = un), nt)
                  return !1;
              }
              return Ht(ve, Qe), ot;
            }
            function Ke(ve) {
              if (ve.type === "group" && ve.break || ve.type === "line" && ve.hard || ve.type === "break-parent")
                return !0;
            }
            function Yt(ve) {
              return fn(ve, Ke, !1);
            }
            function nn(ve) {
              if (ve.length > 0) {
                const Le = wt(ve);
                !Le.expandedStates && !Le.break && (Le.break = "propagated");
              }
              return null;
            }
            function Vt(ve) {
              const Le = /* @__PURE__ */ new Set(), We = [];
              function ot(Qe) {
                if (Qe.type === "break-parent" && nn(We), Qe.type === "group") {
                  if (We.push(Qe), Le.has(Qe))
                    return !1;
                  Le.add(Qe);
                }
              }
              function nt(Qe) {
                Qe.type === "group" && We.pop().break && nn(We);
              }
              Ht(ve, ot, nt, !0);
            }
            function En(ve) {
              return ve.type === "line" && !ve.hard ? ve.soft ? "" : " " : ve.type === "if-break" ? ve.flatContents || "" : ve;
            }
            function Ln(ve) {
              return jt(ve, En);
            }
            var Mn = (ve, Le) => ve && ve.type === "line" && ve.hard && Le && Le.type === "break-parent";
            function mn(ve) {
              if (!ve)
                return ve;
              if (tn(ve) || ve.type === "fill") {
                const Le = ht(ve);
                for (; Le.length > 1 && Mn(...Le.slice(-2)); )
                  Le.length -= 2;
                if (Le.length > 0) {
                  const We = mn(wt(Le));
                  Le[Le.length - 1] = We;
                }
                return Array.isArray(ve) ? Le : Object.assign(Object.assign({}, ve), {}, {
                  parts: Le
                });
              }
              switch (ve.type) {
                case "align":
                case "indent":
                case "indent-if-break":
                case "group":
                case "line-suffix":
                case "label": {
                  const Le = mn(ve.contents);
                  return Object.assign(Object.assign({}, ve), {}, {
                    contents: Le
                  });
                }
                case "if-break": {
                  const Le = mn(ve.breakContents), We = mn(ve.flatContents);
                  return Object.assign(Object.assign({}, ve), {}, {
                    breakContents: Le,
                    flatContents: We
                  });
                }
              }
              return ve;
            }
            function Kn(ve) {
              return mn(_t(ve));
            }
            function It(ve) {
              switch (ve.type) {
                case "fill":
                  if (ve.parts.every((We) => We === ""))
                    return "";
                  break;
                case "group":
                  if (!ve.contents && !ve.id && !ve.break && !ve.expandedStates)
                    return "";
                  if (ve.contents.type === "group" && ve.contents.id === ve.id && ve.contents.break === ve.break && ve.contents.expandedStates === ve.expandedStates)
                    return ve.contents;
                  break;
                case "align":
                case "indent":
                case "indent-if-break":
                case "line-suffix":
                  if (!ve.contents)
                    return "";
                  break;
                case "if-break":
                  if (!ve.flatContents && !ve.breakContents)
                    return "";
                  break;
              }
              if (!tn(ve))
                return ve;
              const Le = [];
              for (const We of ht(ve)) {
                if (!We)
                  continue;
                const [ot, ...nt] = tn(We) ? ht(We) : [We];
                typeof ot == "string" && typeof wt(Le) == "string" ? Le[Le.length - 1] += ot : Le.push(ot), Le.push(...nt);
              }
              return Le.length === 0 ? "" : Le.length === 1 ? Le[0] : Array.isArray(ve) ? Le : Object.assign(Object.assign({}, ve), {}, {
                parts: Le
              });
            }
            function _t(ve) {
              return jt(ve, (Le) => It(Le));
            }
            function Xt(ve) {
              const Le = [], We = ve.filter(Boolean);
              for (; We.length > 0; ) {
                const ot = We.shift();
                if (ot) {
                  if (tn(ot)) {
                    We.unshift(...ht(ot));
                    continue;
                  }
                  if (Le.length > 0 && typeof wt(Le) == "string" && typeof ot == "string") {
                    Le[Le.length - 1] += ot;
                    continue;
                  }
                  Le.push(ot);
                }
              }
              return Le;
            }
            function pn(ve) {
              return jt(ve, (Le) => Array.isArray(Le) ? Xt(Le) : Le.parts ? Object.assign(Object.assign({}, Le), {}, {
                parts: Xt(Le.parts)
              }) : Le);
            }
            function rn(ve) {
              return jt(ve, (Le) => typeof Le == "string" && Le.includes(`
`) ? Bt(Le) : Le);
            }
            function Bt(ve) {
              let Le = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : kt;
              return Pt(Le, ve.split(`
`)).parts;
            }
            function Ot(ve) {
              if (ve.type === "line")
                return !0;
            }
            function Ct(ve) {
              return fn(ve, Ot, !1);
            }
            vt.exports = {
              isConcat: tn,
              getDocParts: ht,
              willBreak: Yt,
              traverseDoc: Ht,
              findInDoc: fn,
              mapDoc: jt,
              propagateBreaks: Vt,
              removeLines: Ln,
              stripTrailingHardline: Kn,
              normalizeParts: Xt,
              normalizeDoc: pn,
              cleanDoc: _t,
              replaceTextEndOfLine: Bt,
              replaceEndOfLine: rn,
              canBreak: Ct
            };
          }
        }), Vr = In({
          "src/document/doc-printer.js"(Ye, vt) {
            ln();
            var {
              convertEndOfLineToChars: wt
            } = lu(), kt = _r(), Pt = Fr(), {
              fill: tn,
              cursor: ht,
              indent: Gt
            } = rr(), {
              isConcat: Ht,
              getDocParts: jt
            } = _n(), fn, Ke = 1, Yt = 2;
            function nn() {
              return {
                value: "",
                length: 0,
                queue: []
              };
            }
            function Vt(It, _t) {
              return Ln(It, {
                type: "indent"
              }, _t);
            }
            function En(It, _t, Xt) {
              return _t === Number.NEGATIVE_INFINITY ? It.root || nn() : _t < 0 ? Ln(It, {
                type: "dedent"
              }, Xt) : _t ? _t.type === "root" ? Object.assign(Object.assign({}, It), {}, {
                root: It
              }) : Ln(It, {
                type: typeof _t == "string" ? "stringAlign" : "numberAlign",
                n: _t
              }, Xt) : It;
            }
            function Ln(It, _t, Xt) {
              const pn = _t.type === "dedent" ? It.queue.slice(0, -1) : [...It.queue, _t];
              let rn = "", Bt = 0, Ot = 0, Ct = 0;
              for (const dt of pn)
                switch (dt.type) {
                  case "indent":
                    We(), Xt.useTabs ? ve(1) : Le(Xt.tabWidth);
                    break;
                  case "stringAlign":
                    We(), rn += dt.n, Bt += dt.n.length;
                    break;
                  case "numberAlign":
                    Ot += 1, Ct += dt.n;
                    break;
                  default:
                    throw new Error(`Unexpected type '${dt.type}'`);
                }
              return nt(), Object.assign(Object.assign({}, It), {}, {
                value: rn,
                length: Bt,
                queue: pn
              });
              function ve(dt) {
                rn += "	".repeat(dt), Bt += Xt.tabWidth * dt;
              }
              function Le(dt) {
                rn += " ".repeat(dt), Bt += dt;
              }
              function We() {
                Xt.useTabs ? ot() : nt();
              }
              function ot() {
                Ot > 0 && ve(Ot), Qe();
              }
              function nt() {
                Ct > 0 && Le(Ct), Qe();
              }
              function Qe() {
                Ot = 0, Ct = 0;
              }
            }
            function Mn(It) {
              if (It.length === 0)
                return 0;
              let _t = 0;
              for (; It.length > 0 && typeof kt(It) == "string" && /^[\t ]*$/.test(kt(It)); )
                _t += It.pop().length;
              if (It.length > 0 && typeof kt(It) == "string") {
                const Xt = kt(It).replace(/[\t ]*$/, "");
                _t += kt(It).length - Xt.length, It[It.length - 1] = Xt;
              }
              return _t;
            }
            function mn(It, _t, Xt, pn, rn) {
              let Bt = _t.length;
              const Ot = [It], Ct = [];
              for (; Xt >= 0; ) {
                if (Ot.length === 0) {
                  if (Bt === 0)
                    return !0;
                  Ot.push(_t[--Bt]);
                  continue;
                }
                const {
                  mode: ve,
                  doc: Le
                } = Ot.pop();
                if (typeof Le == "string")
                  Ct.push(Le), Xt -= Pt(Le);
                else if (Ht(Le) || Le.type === "fill") {
                  const We = jt(Le);
                  for (let ot = We.length - 1; ot >= 0; ot--)
                    Ot.push({
                      mode: ve,
                      doc: We[ot]
                    });
                } else
                  switch (Le.type) {
                    case "indent":
                    case "align":
                    case "indent-if-break":
                    case "label":
                      Ot.push({
                        mode: ve,
                        doc: Le.contents
                      });
                      break;
                    case "trim":
                      Xt += Mn(Ct);
                      break;
                    case "group": {
                      if (rn && Le.break)
                        return !1;
                      const We = Le.break ? Ke : ve, ot = Le.expandedStates && We === Ke ? kt(Le.expandedStates) : Le.contents;
                      Ot.push({
                        mode: We,
                        doc: ot
                      });
                      break;
                    }
                    case "if-break": {
                      const ot = (Le.groupId ? fn[Le.groupId] || Yt : ve) === Ke ? Le.breakContents : Le.flatContents;
                      ot && Ot.push({
                        mode: ve,
                        doc: ot
                      });
                      break;
                    }
                    case "line":
                      if (ve === Ke || Le.hard)
                        return !0;
                      Le.soft || (Ct.push(" "), Xt--);
                      break;
                    case "line-suffix":
                      pn = !0;
                      break;
                    case "line-suffix-boundary":
                      if (pn)
                        return !1;
                      break;
                  }
              }
              return !1;
            }
            function Kn(It, _t) {
              fn = {};
              const Xt = _t.printWidth, pn = wt(_t.endOfLine);
              let rn = 0;
              const Bt = [{
                ind: nn(),
                mode: Ke,
                doc: It
              }], Ot = [];
              let Ct = !1;
              const ve = [];
              for (; Bt.length > 0; ) {
                const {
                  ind: We,
                  mode: ot,
                  doc: nt
                } = Bt.pop();
                if (typeof nt == "string") {
                  const Qe = pn !== `
` ? nt.replace(/\n/g, pn) : nt;
                  Ot.push(Qe), rn += Pt(Qe);
                } else if (Ht(nt)) {
                  const Qe = jt(nt);
                  for (let dt = Qe.length - 1; dt >= 0; dt--)
                    Bt.push({
                      ind: We,
                      mode: ot,
                      doc: Qe[dt]
                    });
                } else
                  switch (nt.type) {
                    case "cursor":
                      Ot.push(ht.placeholder);
                      break;
                    case "indent":
                      Bt.push({
                        ind: Vt(We, _t),
                        mode: ot,
                        doc: nt.contents
                      });
                      break;
                    case "align":
                      Bt.push({
                        ind: En(We, nt.n, _t),
                        mode: ot,
                        doc: nt.contents
                      });
                      break;
                    case "trim":
                      rn -= Mn(Ot);
                      break;
                    case "group":
                      switch (ot) {
                        case Yt:
                          if (!Ct) {
                            Bt.push({
                              ind: We,
                              mode: nt.break ? Ke : Yt,
                              doc: nt.contents
                            });
                            break;
                          }
                        case Ke: {
                          Ct = !1;
                          const Qe = {
                            ind: We,
                            mode: Yt,
                            doc: nt.contents
                          }, dt = Xt - rn, un = ve.length > 0;
                          if (!nt.break && mn(Qe, Bt, dt, un))
                            Bt.push(Qe);
                          else if (nt.expandedStates) {
                            const Pn = kt(nt.expandedStates);
                            if (nt.break) {
                              Bt.push({
                                ind: We,
                                mode: Ke,
                                doc: Pn
                              });
                              break;
                            } else
                              for (let Bn = 1; Bn < nt.expandedStates.length + 1; Bn++)
                                if (Bn >= nt.expandedStates.length) {
                                  Bt.push({
                                    ind: We,
                                    mode: Ke,
                                    doc: Pn
                                  });
                                  break;
                                } else {
                                  const Qn = nt.expandedStates[Bn], Wn = {
                                    ind: We,
                                    mode: Yt,
                                    doc: Qn
                                  };
                                  if (mn(Wn, Bt, dt, un)) {
                                    Bt.push(Wn);
                                    break;
                                  }
                                }
                          } else
                            Bt.push({
                              ind: We,
                              mode: Ke,
                              doc: nt.contents
                            });
                          break;
                        }
                      }
                      nt.id && (fn[nt.id] = kt(Bt).mode);
                      break;
                    case "fill": {
                      const Qe = Xt - rn, {
                        parts: dt
                      } = nt;
                      if (dt.length === 0)
                        break;
                      const [un, Pn] = dt, Bn = {
                        ind: We,
                        mode: Yt,
                        doc: un
                      }, Qn = {
                        ind: We,
                        mode: Ke,
                        doc: un
                      }, Wn = mn(Bn, [], Qe, ve.length > 0, !0);
                      if (dt.length === 1) {
                        Wn ? Bt.push(Bn) : Bt.push(Qn);
                        break;
                      }
                      const Ar = {
                        ind: We,
                        mode: Yt,
                        doc: Pn
                      }, vr = {
                        ind: We,
                        mode: Ke,
                        doc: Pn
                      };
                      if (dt.length === 2) {
                        Wn ? Bt.push(Ar, Bn) : Bt.push(vr, Qn);
                        break;
                      }
                      dt.splice(0, 2);
                      const ar = {
                        ind: We,
                        mode: ot,
                        doc: tn(dt)
                      }, cu = dt[0];
                      mn({
                        ind: We,
                        mode: Yt,
                        doc: [un, Pn, cu]
                      }, [], Qe, ve.length > 0, !0) ? Bt.push(ar, Ar, Bn) : Wn ? Bt.push(ar, vr, Bn) : Bt.push(ar, vr, Qn);
                      break;
                    }
                    case "if-break":
                    case "indent-if-break": {
                      const Qe = nt.groupId ? fn[nt.groupId] : ot;
                      if (Qe === Ke) {
                        const dt = nt.type === "if-break" ? nt.breakContents : nt.negate ? nt.contents : Gt(nt.contents);
                        dt && Bt.push({
                          ind: We,
                          mode: ot,
                          doc: dt
                        });
                      }
                      if (Qe === Yt) {
                        const dt = nt.type === "if-break" ? nt.flatContents : nt.negate ? Gt(nt.contents) : nt.contents;
                        dt && Bt.push({
                          ind: We,
                          mode: ot,
                          doc: dt
                        });
                      }
                      break;
                    }
                    case "line-suffix":
                      ve.push({
                        ind: We,
                        mode: ot,
                        doc: nt.contents
                      });
                      break;
                    case "line-suffix-boundary":
                      ve.length > 0 && Bt.push({
                        ind: We,
                        mode: ot,
                        doc: {
                          type: "line",
                          hard: !0
                        }
                      });
                      break;
                    case "line":
                      switch (ot) {
                        case Yt:
                          if (nt.hard)
                            Ct = !0;
                          else {
                            nt.soft || (Ot.push(" "), rn += 1);
                            break;
                          }
                        case Ke:
                          if (ve.length > 0) {
                            Bt.push({
                              ind: We,
                              mode: ot,
                              doc: nt
                            }, ...ve.reverse()), ve.length = 0;
                            break;
                          }
                          nt.literal ? We.root ? (Ot.push(pn, We.root.value), rn = We.root.length) : (Ot.push(pn), rn = 0) : (rn -= Mn(Ot), Ot.push(pn + We.value), rn = We.length);
                          break;
                      }
                      break;
                    case "label":
                      Bt.push({
                        ind: We,
                        mode: ot,
                        doc: nt.contents
                      });
                      break;
                  }
                Bt.length === 0 && ve.length > 0 && (Bt.push(...ve.reverse()), ve.length = 0);
              }
              const Le = Ot.indexOf(ht.placeholder);
              if (Le !== -1) {
                const We = Ot.indexOf(ht.placeholder, Le + 1), ot = Ot.slice(0, Le).join(""), nt = Ot.slice(Le + 1, We).join(""), Qe = Ot.slice(We + 1).join("");
                return {
                  formatted: ot + nt + Qe,
                  cursorNodeStart: ot.length,
                  cursorNodeText: nt
                };
              }
              return {
                formatted: Ot.join("")
              };
            }
            vt.exports = {
              printDocToString: Kn
            };
          }
        }), Gn = In({
          "src/document/doc-debug.js"(Ye, vt) {
            ln();
            var {
              isConcat: wt,
              getDocParts: kt
            } = _n();
            function Pt(ht) {
              if (!ht)
                return "";
              if (wt(ht)) {
                const Gt = [];
                for (const Ht of kt(ht))
                  if (wt(Ht))
                    Gt.push(...Pt(Ht).parts);
                  else {
                    const jt = Pt(Ht);
                    jt !== "" && Gt.push(jt);
                  }
                return {
                  type: "concat",
                  parts: Gt
                };
              }
              return ht.type === "if-break" ? Object.assign(Object.assign({}, ht), {}, {
                breakContents: Pt(ht.breakContents),
                flatContents: Pt(ht.flatContents)
              }) : ht.type === "group" ? Object.assign(Object.assign({}, ht), {}, {
                contents: Pt(ht.contents),
                expandedStates: ht.expandedStates && ht.expandedStates.map(Pt)
              }) : ht.type === "fill" ? {
                type: "fill",
                parts: ht.parts.map(Pt)
              } : ht.contents ? Object.assign(Object.assign({}, ht), {}, {
                contents: Pt(ht.contents)
              }) : ht;
            }
            function tn(ht) {
              const Gt = /* @__PURE__ */ Object.create(null), Ht = /* @__PURE__ */ new Set();
              return jt(Pt(ht));
              function jt(Ke, Yt, nn) {
                if (typeof Ke == "string")
                  return JSON.stringify(Ke);
                if (wt(Ke)) {
                  const Vt = kt(Ke).map(jt).filter(Boolean);
                  return Vt.length === 1 ? Vt[0] : `[${Vt.join(", ")}]`;
                }
                if (Ke.type === "line") {
                  const Vt = Array.isArray(nn) && nn[Yt + 1] && nn[Yt + 1].type === "break-parent";
                  return Ke.literal ? Vt ? "literalline" : "literallineWithoutBreakParent" : Ke.hard ? Vt ? "hardline" : "hardlineWithoutBreakParent" : Ke.soft ? "softline" : "line";
                }
                if (Ke.type === "break-parent")
                  return Array.isArray(nn) && nn[Yt - 1] && nn[Yt - 1].type === "line" && nn[Yt - 1].hard ? void 0 : "breakParent";
                if (Ke.type === "trim")
                  return "trim";
                if (Ke.type === "indent")
                  return "indent(" + jt(Ke.contents) + ")";
                if (Ke.type === "align")
                  return Ke.n === Number.NEGATIVE_INFINITY ? "dedentToRoot(" + jt(Ke.contents) + ")" : Ke.n < 0 ? "dedent(" + jt(Ke.contents) + ")" : Ke.n.type === "root" ? "markAsRoot(" + jt(Ke.contents) + ")" : "align(" + JSON.stringify(Ke.n) + ", " + jt(Ke.contents) + ")";
                if (Ke.type === "if-break")
                  return "ifBreak(" + jt(Ke.breakContents) + (Ke.flatContents ? ", " + jt(Ke.flatContents) : "") + (Ke.groupId ? (Ke.flatContents ? "" : ', ""') + `, { groupId: ${fn(Ke.groupId)} }` : "") + ")";
                if (Ke.type === "indent-if-break") {
                  const Vt = [];
                  Ke.negate && Vt.push("negate: true"), Ke.groupId && Vt.push(`groupId: ${fn(Ke.groupId)}`);
                  const En = Vt.length > 0 ? `, { ${Vt.join(", ")} }` : "";
                  return `indentIfBreak(${jt(Ke.contents)}${En})`;
                }
                if (Ke.type === "group") {
                  const Vt = [];
                  Ke.break && Ke.break !== "propagated" && Vt.push("shouldBreak: true"), Ke.id && Vt.push(`id: ${fn(Ke.id)}`);
                  const En = Vt.length > 0 ? `, { ${Vt.join(", ")} }` : "";
                  return Ke.expandedStates ? `conditionalGroup([${Ke.expandedStates.map((Ln) => jt(Ln)).join(",")}]${En})` : `group(${jt(Ke.contents)}${En})`;
                }
                if (Ke.type === "fill")
                  return `fill([${Ke.parts.map((Vt) => jt(Vt)).join(", ")}])`;
                if (Ke.type === "line-suffix")
                  return "lineSuffix(" + jt(Ke.contents) + ")";
                if (Ke.type === "line-suffix-boundary")
                  return "lineSuffixBoundary";
                if (Ke.type === "label")
                  return `label(${JSON.stringify(Ke.label)}, ${jt(Ke.contents)})`;
                throw new Error("Unknown doc type " + Ke.type);
              }
              function fn(Ke) {
                if (typeof Ke != "symbol")
                  return JSON.stringify(String(Ke));
                if (Ke in Gt)
                  return Gt[Ke];
                const Yt = String(Ke).slice(7, -1) || "symbol";
                for (let nn = 0; ; nn++) {
                  const Vt = Yt + (nn > 0 ? ` #${nn}` : "");
                  if (!Ht.has(Vt))
                    return Ht.add(Vt), Gt[Ke] = `Symbol.for(${JSON.stringify(Vt)})`;
                }
              }
            }
            vt.exports = {
              printDocToDebug: tn
            };
          }
        });
        ln(), gt.exports = {
          builders: rr(),
          printer: Vr(),
          utils: _n(),
          debug: Gn()
        };
      }
    });
    return Oe();
  });
})(np);
function Sn(xe) {
  const te = (() => {
    switch (xe.type) {
      case "literal":
        if (xe.value === '"')
          return Mt.builders.group(["'", xe.value, "'"]);
        const Ne = xe.value;
        return Mt.builders.group(['"', Ne, '"']);
      case "nonterminal":
        return xe.value;
      case "epsilon":
        return "ε";
      case "group":
        return Mt.builders.group(["( ", Mt.builders.indent(Sn(xe.value)), Mt.builders.softline, " )"]);
      case "regex":
        return Mt.builders.group(["/", xe.value.source, "/"]);
      case "optional":
        return Mt.builders.group([Sn(xe.value), "?"]);
      case "optionalWhitespace":
        return Mt.builders.group([Sn(xe.value), "?w"]);
      case "minus":
        return Mt.builders.group([Sn(xe.value[0]), " - ", Sn(xe.value[1])]);
      case "many":
        return Mt.builders.group([Sn(xe.value), "*"]);
      case "many1":
        return Mt.builders.group([Sn(xe.value), "+"]);
      case "skip":
        return Mt.builders.group([Sn(xe.value[0]), " << ", Sn(xe.value[1])]);
      case "next":
        return Mt.builders.group([Sn(xe.value[0]), " >> ", Sn(xe.value[1])]);
      case "concatenation": {
        const Oe = " , ";
        return Mt.builders.group([
          Mt.builders.indent([
            Mt.builders.softline,
            Mt.builders.join(
              [Mt.builders.conditionalGroup([Mt.builders.softline]), Oe],
              xe.value.map((ke) => Sn(ke))
            )
          ])
        ]);
      }
      case "alternation": {
        const Oe = " | ";
        return Mt.builders.group([
          Mt.builders.indent([
            Mt.builders.softline,
            Mt.builders.join(
              [Mt.builders.conditionalGroup([Mt.builders.softline]), Oe],
              xe.value.map((ke) => Sn(ke))
            )
          ])
        ]);
      }
    }
  })();
  if (xe.comment) {
    const Ne = xe.comment.left.length ? xe.comment.left + " " : "", Oe = xe.comment.right.length ? " " + xe.comment.right : "";
    return Mt.builders.group([Ne, te, Oe]);
  }
  return te;
}
function rp(xe, oe) {
  const te = xe.getValue();
  return oe.printWidth = 66, Mt.builders.join(
    Mt.builders.hardline,
    [...te.entries()].map(([Oe, ke]) => {
      const {
        expression: gt,
        comment: { above: $t, below: Zt }
      } = ke, dn = [Oe, " = "], en = [Sn(gt), " ;"], Jn = (() => gt.type === "concatenation" || gt.type === "alternation" ? [...dn, ...en, Mt.builders.hardline] : [...dn, ...en])();
      return Mt.builders.join(Mt.builders.hardline, [...$t, Jn, ...Zt]);
    })
  );
}
var $u = {}, up = {
  get exports() {
    return $u;
  },
  set exports(xe) {
    $u = xe;
  }
};
(function(xe, oe) {
  (function(te) {
    xe.exports = te();
  })(function() {
    var te = (Re, pe) => () => (pe || Re((pe = { exports: {} }).exports, pe), pe.exports), Ne = te((Re, pe) => {
      var ie = function(de) {
        return de && de.Math == Math && de;
      };
      pe.exports = ie(typeof globalThis == "object" && globalThis) || ie(typeof window == "object" && window) || ie(typeof self == "object" && self) || ie(typeof Qi == "object" && Qi) || function() {
        return this;
      }() || Function("return this")();
    }), Oe = te((Re, pe) => {
      pe.exports = function(ie) {
        try {
          return !!ie();
        } catch {
          return !0;
        }
      };
    }), ke = te((Re, pe) => {
      var ie = Oe();
      pe.exports = !ie(function() {
        return Object.defineProperty({}, 1, { get: function() {
          return 7;
        } })[1] != 7;
      });
    }), gt = te((Re, pe) => {
      var ie = Oe();
      pe.exports = !ie(function() {
        var de = function() {
        }.bind();
        return typeof de != "function" || de.hasOwnProperty("prototype");
      });
    }), $t = te((Re, pe) => {
      var ie = gt(), de = Function.prototype.call;
      pe.exports = ie ? de.bind(de) : function() {
        return de.apply(de, arguments);
      };
    }), Zt = te((Re) => {
      var pe = {}.propertyIsEnumerable, ie = Object.getOwnPropertyDescriptor, de = ie && !pe.call({ 1: 2 }, 1);
      Re.f = de ? function(le) {
        var Ae = ie(this, le);
        return !!Ae && Ae.enumerable;
      } : pe;
    }), dn = te((Re, pe) => {
      pe.exports = function(ie, de) {
        return { enumerable: !(ie & 1), configurable: !(ie & 2), writable: !(ie & 4), value: de };
      };
    }), en = te((Re, pe) => {
      var ie = gt(), de = Function.prototype, le = de.call, Ae = ie && de.bind.bind(le, le);
      pe.exports = ie ? Ae : function(we) {
        return function() {
          return le.apply(we, arguments);
        };
      };
    }), Jn = te((Re, pe) => {
      var ie = en(), de = ie({}.toString), le = ie("".slice);
      pe.exports = function(Ae) {
        return le(de(Ae), 8, -1);
      };
    }), ou = te((Re, pe) => {
      var ie = en(), de = Oe(), le = Jn(), Ae = Object, we = ie("".split);
      pe.exports = de(function() {
        return !Ae("z").propertyIsEnumerable(0);
      }) ? function(Me) {
        return le(Me) == "String" ? we(Me, "") : Ae(Me);
      } : Ae;
    }), Rn = te((Re, pe) => {
      pe.exports = function(ie) {
        return ie == null;
      };
    }), In = te((Re, pe) => {
      var ie = Rn(), de = TypeError;
      pe.exports = function(le) {
        if (ie(le))
          throw de("Can't call method on " + le);
        return le;
      };
    }), gr = te((Re, pe) => {
      var ie = ou(), de = In();
      pe.exports = function(le) {
        return ie(de(le));
      };
    }), yr = te((Re, pe) => {
      var ie = typeof document == "object" && document.all, de = typeof ie > "u" && ie !== void 0;
      pe.exports = { all: ie, IS_HTMLDDA: de };
    }), vn = te((Re, pe) => {
      var ie = yr(), de = ie.all;
      pe.exports = ie.IS_HTMLDDA ? function(le) {
        return typeof le == "function" || le === de;
      } : function(le) {
        return typeof le == "function";
      };
    }), qn = te((Re, pe) => {
      var ie = vn(), de = yr(), le = de.all;
      pe.exports = de.IS_HTMLDDA ? function(Ae) {
        return typeof Ae == "object" ? Ae !== null : ie(Ae) || Ae === le;
      } : function(Ae) {
        return typeof Ae == "object" ? Ae !== null : ie(Ae);
      };
    }), ln = te((Re, pe) => {
      var ie = Ne(), de = vn(), le = function(Ae) {
        return de(Ae) ? Ae : void 0;
      };
      pe.exports = function(Ae, we) {
        return arguments.length < 2 ? le(ie[Ae]) : ie[Ae] && ie[Ae][we];
      };
    }), rr = te((Re, pe) => {
      var ie = en();
      pe.exports = ie({}.isPrototypeOf);
    }), lu = te((Re, pe) => {
      var ie = ln();
      pe.exports = ie("navigator", "userAgent") || "";
    }), _r = te((Re, pe) => {
      var ie = Ne(), de = lu(), le = ie.process, Ae = ie.Deno, we = le && le.versions || Ae && Ae.version, Me = we && we.v8, je, $e;
      Me && (je = Me.split("."), $e = je[0] > 0 && je[0] < 4 ? 1 : +(je[0] + je[1])), !$e && de && (je = de.match(/Edge\/(\d+)/), (!je || je[1] >= 74) && (je = de.match(/Chrome\/(\d+)/), je && ($e = +je[1]))), pe.exports = $e;
    }), Lr = te((Re, pe) => {
      var ie = _r(), de = Oe();
      pe.exports = !!Object.getOwnPropertySymbols && !de(function() {
        var le = Symbol();
        return !String(le) || !(Object(le) instanceof Symbol) || !Symbol.sham && ie && ie < 41;
      });
    }), Or = te((Re, pe) => {
      var ie = Lr();
      pe.exports = ie && !Symbol.sham && typeof Symbol.iterator == "symbol";
    }), Mr = te((Re, pe) => {
      var ie = ln(), de = vn(), le = rr(), Ae = Or(), we = Object;
      pe.exports = Ae ? function(Me) {
        return typeof Me == "symbol";
      } : function(Me) {
        var je = ie("Symbol");
        return de(je) && le(je.prototype, we(Me));
      };
    }), hr = te((Re, pe) => {
      var ie = String;
      pe.exports = function(de) {
        try {
          return ie(de);
        } catch {
          return "Object";
        }
      };
    }), ur = te((Re, pe) => {
      var ie = vn(), de = hr(), le = TypeError;
      pe.exports = function(Ae) {
        if (ie(Ae))
          return Ae;
        throw le(de(Ae) + " is not a function");
      };
    }), Er = te((Re, pe) => {
      var ie = ur(), de = Rn();
      pe.exports = function(le, Ae) {
        var we = le[Ae];
        return de(we) ? void 0 : ie(we);
      };
    }), pu = te((Re, pe) => {
      var ie = $t(), de = vn(), le = qn(), Ae = TypeError;
      pe.exports = function(we, Me) {
        var je, $e;
        if (Me === "string" && de(je = we.toString) && !le($e = ie(je, we)) || de(je = we.valueOf) && !le($e = ie(je, we)) || Me !== "string" && de(je = we.toString) && !le($e = ie(je, we)))
          return $e;
        throw Ae("Can't convert object to primitive value");
      };
    }), $r = te((Re, pe) => {
      pe.exports = !1;
    }), Cr = te((Re, pe) => {
      var ie = Ne(), de = Object.defineProperty;
      pe.exports = function(le, Ae) {
        try {
          de(ie, le, { value: Ae, configurable: !0, writable: !0 });
        } catch {
          ie[le] = Ae;
        }
        return Ae;
      };
    }), ir = te((Re, pe) => {
      var ie = Ne(), de = Cr(), le = "__core-js_shared__", Ae = ie[le] || de(le, {});
      pe.exports = Ae;
    }), Rr = te((Re, pe) => {
      var ie = $r(), de = ir();
      (pe.exports = function(le, Ae) {
        return de[le] || (de[le] = Ae !== void 0 ? Ae : {});
      })("versions", []).push({ version: "3.26.1", mode: ie ? "pure" : "global", copyright: "© 2014-2022 Denis Pushkarev (zloirock.ru)", license: "https://github.com/zloirock/core-js/blob/v3.26.1/LICENSE", source: "https://github.com/zloirock/core-js" });
    }), Fr = te((Re, pe) => {
      var ie = In(), de = Object;
      pe.exports = function(le) {
        return de(ie(le));
      };
    }), _n = te((Re, pe) => {
      var ie = en(), de = Fr(), le = ie({}.hasOwnProperty);
      pe.exports = Object.hasOwn || function(Ae, we) {
        return le(de(Ae), we);
      };
    }), Vr = te((Re, pe) => {
      var ie = en(), de = 0, le = Math.random(), Ae = ie(1 .toString);
      pe.exports = function(we) {
        return "Symbol(" + (we === void 0 ? "" : we) + ")_" + Ae(++de + le, 36);
      };
    }), Gn = te((Re, pe) => {
      var ie = Ne(), de = Rr(), le = _n(), Ae = Vr(), we = Lr(), Me = Or(), je = de("wks"), $e = ie.Symbol, He = $e && $e.for, rt = Me ? $e : $e && $e.withoutSetter || Ae;
      pe.exports = function(ut) {
        if (!le(je, ut) || !(we || typeof je[ut] == "string")) {
          var Ze = "Symbol." + ut;
          we && le($e, ut) ? je[ut] = $e[ut] : Me && He ? je[ut] = He(Ze) : je[ut] = rt(Ze);
        }
        return je[ut];
      };
    }), Ye = te((Re, pe) => {
      var ie = $t(), de = qn(), le = Mr(), Ae = Er(), we = pu(), Me = Gn(), je = TypeError, $e = Me("toPrimitive");
      pe.exports = function(He, rt) {
        if (!de(He) || le(He))
          return He;
        var ut = Ae(He, $e), Ze;
        if (ut) {
          if (rt === void 0 && (rt = "default"), Ze = ie(ut, He, rt), !de(Ze) || le(Ze))
            return Ze;
          throw je("Can't convert object to primitive value");
        }
        return rt === void 0 && (rt = "number"), we(He, rt);
      };
    }), vt = te((Re, pe) => {
      var ie = Ye(), de = Mr();
      pe.exports = function(le) {
        var Ae = ie(le, "string");
        return de(Ae) ? Ae : Ae + "";
      };
    }), wt = te((Re, pe) => {
      var ie = Ne(), de = qn(), le = ie.document, Ae = de(le) && de(le.createElement);
      pe.exports = function(we) {
        return Ae ? le.createElement(we) : {};
      };
    }), kt = te((Re, pe) => {
      var ie = ke(), de = Oe(), le = wt();
      pe.exports = !ie && !de(function() {
        return Object.defineProperty(le("div"), "a", { get: function() {
          return 7;
        } }).a != 7;
      });
    }), Pt = te((Re) => {
      var pe = ke(), ie = $t(), de = Zt(), le = dn(), Ae = gr(), we = vt(), Me = _n(), je = kt(), $e = Object.getOwnPropertyDescriptor;
      Re.f = pe ? $e : function(He, rt) {
        if (He = Ae(He), rt = we(rt), je)
          try {
            return $e(He, rt);
          } catch {
          }
        if (Me(He, rt))
          return le(!ie(de.f, He, rt), He[rt]);
      };
    }), tn = te((Re, pe) => {
      var ie = ke(), de = Oe();
      pe.exports = ie && de(function() {
        return Object.defineProperty(function() {
        }, "prototype", { value: 42, writable: !1 }).prototype != 42;
      });
    }), ht = te((Re, pe) => {
      var ie = qn(), de = String, le = TypeError;
      pe.exports = function(Ae) {
        if (ie(Ae))
          return Ae;
        throw le(de(Ae) + " is not an object");
      };
    }), Gt = te((Re) => {
      var pe = ke(), ie = kt(), de = tn(), le = ht(), Ae = vt(), we = TypeError, Me = Object.defineProperty, je = Object.getOwnPropertyDescriptor, $e = "enumerable", He = "configurable", rt = "writable";
      Re.f = pe ? de ? function(ut, Ze, X) {
        if (le(ut), Ze = Ae(Ze), le(X), typeof ut == "function" && Ze === "prototype" && "value" in X && rt in X && !X[rt]) {
          var lt = je(ut, Ze);
          lt && lt[rt] && (ut[Ze] = X.value, X = { configurable: He in X ? X[He] : lt[He], enumerable: $e in X ? X[$e] : lt[$e], writable: !1 });
        }
        return Me(ut, Ze, X);
      } : Me : function(ut, Ze, X) {
        if (le(ut), Ze = Ae(Ze), le(X), ie)
          try {
            return Me(ut, Ze, X);
          } catch {
          }
        if ("get" in X || "set" in X)
          throw we("Accessors not supported");
        return "value" in X && (ut[Ze] = X.value), ut;
      };
    }), Ht = te((Re, pe) => {
      var ie = ke(), de = Gt(), le = dn();
      pe.exports = ie ? function(Ae, we, Me) {
        return de.f(Ae, we, le(1, Me));
      } : function(Ae, we, Me) {
        return Ae[we] = Me, Ae;
      };
    }), jt = te((Re, pe) => {
      var ie = ke(), de = _n(), le = Function.prototype, Ae = ie && Object.getOwnPropertyDescriptor, we = de(le, "name"), Me = we && function() {
      }.name === "something", je = we && (!ie || ie && Ae(le, "name").configurable);
      pe.exports = { EXISTS: we, PROPER: Me, CONFIGURABLE: je };
    }), fn = te((Re, pe) => {
      var ie = en(), de = vn(), le = ir(), Ae = ie(Function.toString);
      de(le.inspectSource) || (le.inspectSource = function(we) {
        return Ae(we);
      }), pe.exports = le.inspectSource;
    }), Ke = te((Re, pe) => {
      var ie = Ne(), de = vn(), le = ie.WeakMap;
      pe.exports = de(le) && /native code/.test(String(le));
    }), Yt = te((Re, pe) => {
      var ie = Rr(), de = Vr(), le = ie("keys");
      pe.exports = function(Ae) {
        return le[Ae] || (le[Ae] = de(Ae));
      };
    }), nn = te((Re, pe) => {
      pe.exports = {};
    }), Vt = te((Re, pe) => {
      var ie = Ke(), de = Ne(), le = qn(), Ae = Ht(), we = _n(), Me = ir(), je = Yt(), $e = nn(), He = "Object already initialized", rt = de.TypeError, ut = de.WeakMap, Ze, X, lt, Et = function(H) {
        return lt(H) ? X(H) : Ze(H, {});
      }, Nt = function(H) {
        return function(Cn) {
          var Hn;
          if (!le(Cn) || (Hn = X(Cn)).type !== H)
            throw rt("Incompatible receiver, " + H + " required");
          return Hn;
        };
      };
      ie || Me.state ? (Tt = Me.state || (Me.state = new ut()), Tt.get = Tt.get, Tt.has = Tt.has, Tt.set = Tt.set, Ze = function(H, Cn) {
        if (Tt.has(H))
          throw rt(He);
        return Cn.facade = H, Tt.set(H, Cn), Cn;
      }, X = function(H) {
        return Tt.get(H) || {};
      }, lt = function(H) {
        return Tt.has(H);
      }) : (Kt = je("state"), $e[Kt] = !0, Ze = function(H, Cn) {
        if (we(H, Kt))
          throw rt(He);
        return Cn.facade = H, Ae(H, Kt, Cn), Cn;
      }, X = function(H) {
        return we(H, Kt) ? H[Kt] : {};
      }, lt = function(H) {
        return we(H, Kt);
      });
      var Tt, Kt;
      pe.exports = { set: Ze, get: X, has: lt, enforce: Et, getterFor: Nt };
    }), En = te((Re, pe) => {
      var ie = Oe(), de = vn(), le = _n(), Ae = ke(), we = jt().CONFIGURABLE, Me = fn(), je = Vt(), $e = je.enforce, He = je.get, rt = Object.defineProperty, ut = Ae && !ie(function() {
        return rt(function() {
        }, "length", { value: 8 }).length !== 8;
      }), Ze = String(String).split("String"), X = pe.exports = function(lt, Et, Nt) {
        String(Et).slice(0, 7) === "Symbol(" && (Et = "[" + String(Et).replace(/^Symbol\(([^)]*)\)/, "$1") + "]"), Nt && Nt.getter && (Et = "get " + Et), Nt && Nt.setter && (Et = "set " + Et), (!le(lt, "name") || we && lt.name !== Et) && (Ae ? rt(lt, "name", { value: Et, configurable: !0 }) : lt.name = Et), ut && Nt && le(Nt, "arity") && lt.length !== Nt.arity && rt(lt, "length", { value: Nt.arity });
        try {
          Nt && le(Nt, "constructor") && Nt.constructor ? Ae && rt(lt, "prototype", { writable: !1 }) : lt.prototype && (lt.prototype = void 0);
        } catch {
        }
        var Tt = $e(lt);
        return le(Tt, "source") || (Tt.source = Ze.join(typeof Et == "string" ? Et : "")), lt;
      };
      Function.prototype.toString = X(function() {
        return de(this) && He(this).source || Me(this);
      }, "toString");
    }), Ln = te((Re, pe) => {
      var ie = vn(), de = Gt(), le = En(), Ae = Cr();
      pe.exports = function(we, Me, je, $e) {
        $e || ($e = {});
        var He = $e.enumerable, rt = $e.name !== void 0 ? $e.name : Me;
        if (ie(je) && le(je, rt, $e), $e.global)
          He ? we[Me] = je : Ae(Me, je);
        else {
          try {
            $e.unsafe ? we[Me] && (He = !0) : delete we[Me];
          } catch {
          }
          He ? we[Me] = je : de.f(we, Me, { value: je, enumerable: !1, configurable: !$e.nonConfigurable, writable: !$e.nonWritable });
        }
        return we;
      };
    }), Mn = te((Re, pe) => {
      var ie = Math.ceil, de = Math.floor;
      pe.exports = Math.trunc || function(le) {
        var Ae = +le;
        return (Ae > 0 ? de : ie)(Ae);
      };
    }), mn = te((Re, pe) => {
      var ie = Mn();
      pe.exports = function(de) {
        var le = +de;
        return le !== le || le === 0 ? 0 : ie(le);
      };
    }), Kn = te((Re, pe) => {
      var ie = mn(), de = Math.max, le = Math.min;
      pe.exports = function(Ae, we) {
        var Me = ie(Ae);
        return Me < 0 ? de(Me + we, 0) : le(Me, we);
      };
    }), It = te((Re, pe) => {
      var ie = mn(), de = Math.min;
      pe.exports = function(le) {
        return le > 0 ? de(ie(le), 9007199254740991) : 0;
      };
    }), _t = te((Re, pe) => {
      var ie = It();
      pe.exports = function(de) {
        return ie(de.length);
      };
    }), Xt = te((Re, pe) => {
      var ie = gr(), de = Kn(), le = _t(), Ae = function(we) {
        return function(Me, je, $e) {
          var He = ie(Me), rt = le(He), ut = de($e, rt), Ze;
          if (we && je != je) {
            for (; rt > ut; )
              if (Ze = He[ut++], Ze != Ze)
                return !0;
          } else
            for (; rt > ut; ut++)
              if ((we || ut in He) && He[ut] === je)
                return we || ut || 0;
          return !we && -1;
        };
      };
      pe.exports = { includes: Ae(!0), indexOf: Ae(!1) };
    }), pn = te((Re, pe) => {
      var ie = en(), de = _n(), le = gr(), Ae = Xt().indexOf, we = nn(), Me = ie([].push);
      pe.exports = function(je, $e) {
        var He = le(je), rt = 0, ut = [], Ze;
        for (Ze in He)
          !de(we, Ze) && de(He, Ze) && Me(ut, Ze);
        for (; $e.length > rt; )
          de(He, Ze = $e[rt++]) && (~Ae(ut, Ze) || Me(ut, Ze));
        return ut;
      };
    }), rn = te((Re, pe) => {
      pe.exports = ["constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf"];
    }), Bt = te((Re) => {
      var pe = pn(), ie = rn(), de = ie.concat("length", "prototype");
      Re.f = Object.getOwnPropertyNames || function(le) {
        return pe(le, de);
      };
    }), Ot = te((Re) => {
      Re.f = Object.getOwnPropertySymbols;
    }), Ct = te((Re, pe) => {
      var ie = ln(), de = en(), le = Bt(), Ae = Ot(), we = ht(), Me = de([].concat);
      pe.exports = ie("Reflect", "ownKeys") || function(je) {
        var $e = le.f(we(je)), He = Ae.f;
        return He ? Me($e, He(je)) : $e;
      };
    }), ve = te((Re, pe) => {
      var ie = _n(), de = Ct(), le = Pt(), Ae = Gt();
      pe.exports = function(we, Me, je) {
        for (var $e = de(Me), He = Ae.f, rt = le.f, ut = 0; ut < $e.length; ut++) {
          var Ze = $e[ut];
          !ie(we, Ze) && !(je && ie(je, Ze)) && He(we, Ze, rt(Me, Ze));
        }
      };
    }), Le = te((Re, pe) => {
      var ie = Oe(), de = vn(), le = /#|\.prototype\./, Ae = function(He, rt) {
        var ut = Me[we(He)];
        return ut == $e ? !0 : ut == je ? !1 : de(rt) ? ie(rt) : !!rt;
      }, we = Ae.normalize = function(He) {
        return String(He).replace(le, ".").toLowerCase();
      }, Me = Ae.data = {}, je = Ae.NATIVE = "N", $e = Ae.POLYFILL = "P";
      pe.exports = Ae;
    }), We = te((Re, pe) => {
      var ie = Ne(), de = Pt().f, le = Ht(), Ae = Ln(), we = Cr(), Me = ve(), je = Le();
      pe.exports = function($e, He) {
        var rt = $e.target, ut = $e.global, Ze = $e.stat, X, lt, Et, Nt, Tt, Kt;
        if (ut ? lt = ie : Ze ? lt = ie[rt] || we(rt, {}) : lt = (ie[rt] || {}).prototype, lt)
          for (Et in He) {
            if (Tt = He[Et], $e.dontCallGetSet ? (Kt = de(lt, Et), Nt = Kt && Kt.value) : Nt = lt[Et], X = je(ut ? Et : rt + (Ze ? "." : "#") + Et, $e.forced), !X && Nt !== void 0) {
              if (typeof Tt == typeof Nt)
                continue;
              Me(Tt, Nt);
            }
            ($e.sham || Nt && Nt.sham) && le(Tt, "sham", !0), Ae(lt, Et, Tt, $e);
          }
      };
    }), ot = te((Re, pe) => {
      var ie = Jn();
      pe.exports = Array.isArray || function(de) {
        return ie(de) == "Array";
      };
    }), nt = te((Re, pe) => {
      var ie = TypeError, de = 9007199254740991;
      pe.exports = function(le) {
        if (le > de)
          throw ie("Maximum allowed index exceeded");
        return le;
      };
    }), Qe = te((Re, pe) => {
      var ie = Jn(), de = en();
      pe.exports = function(le) {
        if (ie(le) === "Function")
          return de(le);
      };
    }), dt = te((Re, pe) => {
      var ie = Qe(), de = ur(), le = gt(), Ae = ie(ie.bind);
      pe.exports = function(we, Me) {
        return de(we), Me === void 0 ? we : le ? Ae(we, Me) : function() {
          return we.apply(Me, arguments);
        };
      };
    }), un = te((Re, pe) => {
      var ie = ot(), de = _t(), le = nt(), Ae = dt(), we = function(Me, je, $e, He, rt, ut, Ze, X) {
        for (var lt = rt, Et = 0, Nt = Ze ? Ae(Ze, X) : !1, Tt, Kt; Et < He; )
          Et in $e && (Tt = Nt ? Nt($e[Et], Et, je) : $e[Et], ut > 0 && ie(Tt) ? (Kt = de(Tt), lt = we(Me, je, Tt, Kt, lt, ut - 1) - 1) : (le(lt + 1), Me[lt] = Tt), lt++), Et++;
        return lt;
      };
      pe.exports = we;
    }), Pn = te((Re, pe) => {
      var ie = Gn(), de = ie("toStringTag"), le = {};
      le[de] = "z", pe.exports = String(le) === "[object z]";
    }), Bn = te((Re, pe) => {
      var ie = Pn(), de = vn(), le = Jn(), Ae = Gn(), we = Ae("toStringTag"), Me = Object, je = le(function() {
        return arguments;
      }()) == "Arguments", $e = function(He, rt) {
        try {
          return He[rt];
        } catch {
        }
      };
      pe.exports = ie ? le : function(He) {
        var rt, ut, Ze;
        return He === void 0 ? "Undefined" : He === null ? "Null" : typeof (ut = $e(rt = Me(He), we)) == "string" ? ut : je ? le(rt) : (Ze = le(rt)) == "Object" && de(rt.callee) ? "Arguments" : Ze;
      };
    }), Qn = te((Re, pe) => {
      var ie = en(), de = Oe(), le = vn(), Ae = Bn(), we = ln(), Me = fn(), je = function() {
      }, $e = [], He = we("Reflect", "construct"), rt = /^\s*(?:class|function)\b/, ut = ie(rt.exec), Ze = !rt.exec(je), X = function(Et) {
        if (!le(Et))
          return !1;
        try {
          return He(je, $e, Et), !0;
        } catch {
          return !1;
        }
      }, lt = function(Et) {
        if (!le(Et))
          return !1;
        switch (Ae(Et)) {
          case "AsyncFunction":
          case "GeneratorFunction":
          case "AsyncGeneratorFunction":
            return !1;
        }
        try {
          return Ze || !!ut(rt, Me(Et));
        } catch {
          return !0;
        }
      };
      lt.sham = !0, pe.exports = !He || de(function() {
        var Et;
        return X(X.call) || !X(Object) || !X(function() {
          Et = !0;
        }) || Et;
      }) ? lt : X;
    }), Wn = te((Re, pe) => {
      var ie = ot(), de = Qn(), le = qn(), Ae = Gn(), we = Ae("species"), Me = Array;
      pe.exports = function(je) {
        var $e;
        return ie(je) && ($e = je.constructor, de($e) && ($e === Me || ie($e.prototype)) ? $e = void 0 : le($e) && ($e = $e[we], $e === null && ($e = void 0))), $e === void 0 ? Me : $e;
      };
    }), Ar = te((Re, pe) => {
      var ie = Wn();
      pe.exports = function(de, le) {
        return new (ie(de))(le === 0 ? 0 : le);
      };
    }), vr = te(() => {
      var Re = We(), pe = un(), ie = ur(), de = Fr(), le = _t(), Ae = Ar();
      Re({ target: "Array", proto: !0 }, { flatMap: function(we) {
        var Me = de(this), je = le(Me), $e;
        return ie(we), $e = Ae(Me, 0), $e.length = pe($e, Me, Me, je, 0, 1, we, arguments.length > 1 ? arguments[1] : void 0), $e;
      } });
    }), ar = te((Re, pe) => {
      pe.exports = {};
    }), cu = te((Re, pe) => {
      var ie = Gn(), de = ar(), le = ie("iterator"), Ae = Array.prototype;
      pe.exports = function(we) {
        return we !== void 0 && (de.Array === we || Ae[le] === we);
      };
    }), Du = te((Re, pe) => {
      var ie = Bn(), de = Er(), le = Rn(), Ae = ar(), we = Gn(), Me = we("iterator");
      pe.exports = function(je) {
        if (!le(je))
          return de(je, Me) || de(je, "@@iterator") || Ae[ie(je)];
      };
    }), Ru = te((Re, pe) => {
      var ie = $t(), de = ur(), le = ht(), Ae = hr(), we = Du(), Me = TypeError;
      pe.exports = function(je, $e) {
        var He = arguments.length < 2 ? we(je) : $e;
        if (de(He))
          return le(ie(He, je));
        throw Me(Ae(je) + " is not iterable");
      };
    }), ra = te((Re, pe) => {
      var ie = $t(), de = ht(), le = Er();
      pe.exports = function(Ae, we, Me) {
        var je, $e;
        de(Ae);
        try {
          if (je = le(Ae, "return"), !je) {
            if (we === "throw")
              throw Me;
            return Me;
          }
          je = ie(je, Ae);
        } catch (He) {
          $e = !0, je = He;
        }
        if (we === "throw")
          throw Me;
        if ($e)
          throw je;
        return de(je), Me;
      };
    }), ua = te((Re, pe) => {
      var ie = dt(), de = $t(), le = ht(), Ae = hr(), we = cu(), Me = _t(), je = rr(), $e = Ru(), He = Du(), rt = ra(), ut = TypeError, Ze = function(lt, Et) {
        this.stopped = lt, this.result = Et;
      }, X = Ze.prototype;
      pe.exports = function(lt, Et, Nt) {
        var Tt = Nt && Nt.that, Kt = !!(Nt && Nt.AS_ENTRIES), H = !!(Nt && Nt.IS_RECORD), Cn = !!(Nt && Nt.IS_ITERATOR), Hn = !!(Nt && Nt.INTERRUPTED), sr = ie(Et, Tt), jn, Xn, cn, Jr, On, qr, Gr, Wr = function(bn) {
          return jn && rt(jn, "normal", bn), new Ze(!0, bn);
        }, Xr = function(bn) {
          return Kt ? (le(bn), Hn ? sr(bn[0], bn[1], Wr) : sr(bn[0], bn[1])) : Hn ? sr(bn, Wr) : sr(bn);
        };
        if (H)
          jn = lt.iterator;
        else if (Cn)
          jn = lt;
        else {
          if (Xn = He(lt), !Xn)
            throw ut(Ae(lt) + " is not iterable");
          if (we(Xn)) {
            for (cn = 0, Jr = Me(lt); Jr > cn; cn++)
              if (On = Xr(lt[cn]), On && je(X, On))
                return On;
            return new Ze(!1);
          }
          jn = $e(lt, Xn);
        }
        for (qr = H ? lt.next : jn.next; !(Gr = de(qr, jn)).done; ) {
          try {
            On = Xr(Gr.value);
          } catch (bn) {
            rt(jn, "throw", bn);
          }
          if (typeof On == "object" && On && je(X, On))
            return On;
        }
        return new Ze(!1);
      };
    }), ia = te((Re, pe) => {
      var ie = vt(), de = Gt(), le = dn();
      pe.exports = function(Ae, we, Me) {
        var je = ie(we);
        je in Ae ? de.f(Ae, je, le(0, Me)) : Ae[je] = Me;
      };
    }), aa = te(() => {
      var Re = We(), pe = ua(), ie = ia();
      Re({ target: "Object", stat: !0 }, { fromEntries: function(de) {
        var le = {};
        return pe(de, function(Ae, we) {
          ie(le, Ae, we);
        }, { AS_ENTRIES: !0 }), le;
      } });
    }), sa = te((Re, pe) => {
      var ie = En(), de = Gt();
      pe.exports = function(le, Ae, we) {
        return we.get && ie(we.get, Ae, { getter: !0 }), we.set && ie(we.set, Ae, { setter: !0 }), de.f(le, Ae, we);
      };
    }), oa = te((Re, pe) => {
      var ie = ht();
      pe.exports = function() {
        var de = ie(this), le = "";
        return de.hasIndices && (le += "d"), de.global && (le += "g"), de.ignoreCase && (le += "i"), de.multiline && (le += "m"), de.dotAll && (le += "s"), de.unicode && (le += "u"), de.unicodeSets && (le += "v"), de.sticky && (le += "y"), le;
      };
    }), la = te(() => {
      var Re = Ne(), pe = ke(), ie = sa(), de = oa(), le = Oe(), Ae = Re.RegExp, we = Ae.prototype, Me = pe && le(function() {
        var je = !0;
        try {
          Ae(".", "d");
        } catch {
          je = !1;
        }
        var $e = {}, He = "", rt = je ? "dgimsy" : "gimsy", ut = function(Et, Nt) {
          Object.defineProperty($e, Et, { get: function() {
            return He += Nt, !0;
          } });
        }, Ze = { dotAll: "s", global: "g", ignoreCase: "i", multiline: "m", sticky: "y" };
        je && (Ze.hasIndices = "d");
        for (var X in Ze)
          ut(X, Ze[X]);
        var lt = Object.getOwnPropertyDescriptor(we, "flags").get.call($e);
        return lt !== rt || He !== rt;
      });
      Me && ie(we, "flags", { configurable: !0, get: de });
    }), pa = te(() => {
      var Re = We(), pe = Ne();
      Re({ global: !0, forced: pe.globalThis !== pe }, { globalThis: pe });
    }), ca = te(() => {
      pa();
    }), Da = te(() => {
      var Re = We(), pe = un(), ie = Fr(), de = _t(), le = mn(), Ae = Ar();
      Re({ target: "Array", proto: !0 }, { flat: function() {
        var we = arguments.length ? arguments[0] : void 0, Me = ie(this), je = de(Me), $e = Ae(Me, 0);
        return $e.length = pe($e, Me, Me, je, 0, we === void 0 ? 1 : le(we)), $e;
      } });
    }), da = te((Re, pe) => {
      var ie = ["cliName", "cliCategory", "cliDescription"], de = ["_"], le = ["languageId"];
      function Ae(u, l) {
        if (u == null)
          return {};
        var t = we(u, l), s, i;
        if (Object.getOwnPropertySymbols) {
          var e = Object.getOwnPropertySymbols(u);
          for (i = 0; i < e.length; i++)
            s = e[i], !(l.indexOf(s) >= 0) && Object.prototype.propertyIsEnumerable.call(u, s) && (t[s] = u[s]);
        }
        return t;
      }
      function we(u, l) {
        if (u == null)
          return {};
        var t = {}, s = Object.keys(u), i, e;
        for (e = 0; e < s.length; e++)
          i = s[e], !(l.indexOf(i) >= 0) && (t[i] = u[i]);
        return t;
      }
      vr(), aa(), la(), ca(), Da();
      var Me = Object.create, je = Object.defineProperty, $e = Object.getOwnPropertyDescriptor, He = Object.getOwnPropertyNames, rt = Object.getPrototypeOf, ut = Object.prototype.hasOwnProperty, Ze = (u, l) => function() {
        return u && (l = (0, u[He(u)[0]])(u = 0)), l;
      }, X = (u, l) => function() {
        return l || (0, u[He(u)[0]])((l = { exports: {} }).exports, l), l.exports;
      }, lt = (u, l) => {
        for (var t in l)
          je(u, t, { get: l[t], enumerable: !0 });
      }, Et = (u, l, t, s) => {
        if (l && typeof l == "object" || typeof l == "function")
          for (let i of He(l))
            !ut.call(u, i) && i !== t && je(u, i, { get: () => l[i], enumerable: !(s = $e(l, i)) || s.enumerable });
        return u;
      }, Nt = (u, l, t) => (t = u != null ? Me(rt(u)) : {}, Et(l || !u || !u.__esModule ? je(t, "default", { value: u, enumerable: !0 }) : t, u)), Tt = (u) => Et(je({}, "__esModule", { value: !0 }), u), Kt, H = Ze({ "<define:process>"() {
        Kt = { env: {}, argv: [] };
      } }), Cn = X({ "package.json"(u, l) {
        l.exports = { version: "2.8.4" };
      } }), Hn = X({ "node_modules/diff/lib/diff/base.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 }), u.default = l;
        function l() {
        }
        l.prototype = { diff: function(i, e) {
          var n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, r = n.callback;
          typeof n == "function" && (r = n, n = {}), this.options = n;
          var o = this;
          function c(A) {
            return r ? (setTimeout(function() {
              r(void 0, A);
            }, 0), !0) : A;
          }
          i = this.castInput(i), e = this.castInput(e), i = this.removeEmpty(this.tokenize(i)), e = this.removeEmpty(this.tokenize(e));
          var h = e.length, m = i.length, y = 1, p = h + m, D = [{ newPos: -1, components: [] }], C = this.extractCommon(D[0], e, i, 0);
          if (D[0].newPos + 1 >= h && C + 1 >= m)
            return c([{ value: this.join(e), count: e.length }]);
          function w() {
            for (var A = -1 * y; A <= y; A += 2) {
              var N = void 0, S = D[A - 1], j = D[A + 1], k = (j ? j.newPos : 0) - A;
              S && (D[A - 1] = void 0);
              var J = S && S.newPos + 1 < h, f = j && 0 <= k && k < m;
              if (!J && !f) {
                D[A] = void 0;
                continue;
              }
              if (!J || f && S.newPos < j.newPos ? (N = s(j), o.pushComponent(N.components, void 0, !0)) : (N = S, N.newPos++, o.pushComponent(N.components, !0, void 0)), k = o.extractCommon(N, e, i, A), N.newPos + 1 >= h && k + 1 >= m)
                return c(t(o, N.components, e, i, o.useLongestToken));
              D[A] = N;
            }
            y++;
          }
          if (r)
            (function A() {
              setTimeout(function() {
                if (y > p)
                  return r();
                w() || A();
              }, 0);
            })();
          else
            for (; y <= p; ) {
              var P = w();
              if (P)
                return P;
            }
        }, pushComponent: function(i, e, n) {
          var r = i[i.length - 1];
          r && r.added === e && r.removed === n ? i[i.length - 1] = { count: r.count + 1, added: e, removed: n } : i.push({ count: 1, added: e, removed: n });
        }, extractCommon: function(i, e, n, r) {
          for (var o = e.length, c = n.length, h = i.newPos, m = h - r, y = 0; h + 1 < o && m + 1 < c && this.equals(e[h + 1], n[m + 1]); )
            h++, m++, y++;
          return y && i.components.push({ count: y }), i.newPos = h, m;
        }, equals: function(i, e) {
          return this.options.comparator ? this.options.comparator(i, e) : i === e || this.options.ignoreCase && i.toLowerCase() === e.toLowerCase();
        }, removeEmpty: function(i) {
          for (var e = [], n = 0; n < i.length; n++)
            i[n] && e.push(i[n]);
          return e;
        }, castInput: function(i) {
          return i;
        }, tokenize: function(i) {
          return i.split("");
        }, join: function(i) {
          return i.join("");
        } };
        function t(i, e, n, r, o) {
          for (var c = 0, h = e.length, m = 0, y = 0; c < h; c++) {
            var p = e[c];
            if (p.removed) {
              if (p.value = i.join(r.slice(y, y + p.count)), y += p.count, c && e[c - 1].added) {
                var D = e[c - 1];
                e[c - 1] = e[c], e[c] = D;
              }
            } else {
              if (!p.added && o) {
                var C = n.slice(m, m + p.count);
                C = C.map(function(P, A) {
                  var N = r[y + A];
                  return N.length > P.length ? N : P;
                }), p.value = i.join(C);
              } else
                p.value = i.join(n.slice(m, m + p.count));
              m += p.count, p.added || (y += p.count);
            }
          }
          var w = e[h - 1];
          return h > 1 && typeof w.value == "string" && (w.added || w.removed) && i.equals("", w.value) && (e[h - 2].value += w.value, e.pop()), e;
        }
        function s(i) {
          return { newPos: i.newPos, components: i.components.slice(0) };
        }
      } }), sr = X({ "node_modules/diff/lib/diff/array.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 }), u.diffArrays = i, u.arrayDiff = void 0;
        var l = t(Hn());
        function t(e) {
          return e && e.__esModule ? e : { default: e };
        }
        var s = new l.default();
        u.arrayDiff = s, s.tokenize = function(e) {
          return e.slice();
        }, s.join = s.removeEmpty = function(e) {
          return e;
        };
        function i(e, n, r) {
          return s.diff(e, n, r);
        }
      } }), jn = X({ "src/document/doc-builders.js"(u, l) {
        H();
        function t(F) {
          return { type: "concat", parts: F };
        }
        function s(F) {
          return { type: "indent", contents: F };
        }
        function i(F, a) {
          return { type: "align", contents: a, n: F };
        }
        function e(F) {
          let a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return { type: "group", id: a.id, contents: F, break: Boolean(a.shouldBreak), expandedStates: a.expandedStates };
        }
        function n(F) {
          return i(Number.NEGATIVE_INFINITY, F);
        }
        function r(F) {
          return i({ type: "root" }, F);
        }
        function o(F) {
          return i(-1, F);
        }
        function c(F, a) {
          return e(F[0], Object.assign(Object.assign({}, a), {}, { expandedStates: F }));
        }
        function h(F) {
          return { type: "fill", parts: F };
        }
        function m(F, a) {
          let g = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return { type: "if-break", breakContents: F, flatContents: a, groupId: g.groupId };
        }
        function y(F, a) {
          return { type: "indent-if-break", contents: F, groupId: a.groupId, negate: a.negate };
        }
        function p(F) {
          return { type: "line-suffix", contents: F };
        }
        var D = { type: "line-suffix-boundary" }, C = { type: "break-parent" }, w = { type: "trim" }, P = { type: "line", hard: !0 }, A = { type: "line", hard: !0, literal: !0 }, N = { type: "line" }, S = { type: "line", soft: !0 }, j = t([P, C]), k = t([A, C]), J = { type: "cursor", placeholder: Symbol("cursor") };
        function f(F, a) {
          let g = [];
          for (let E = 0; E < a.length; E++)
            E !== 0 && g.push(F), g.push(a[E]);
          return t(g);
        }
        function B(F, a, g) {
          let E = F;
          if (a > 0) {
            for (let b = 0; b < Math.floor(a / g); ++b)
              E = s(E);
            E = i(a % g, E), E = i(Number.NEGATIVE_INFINITY, E);
          }
          return E;
        }
        function d(F, a) {
          return { type: "label", label: F, contents: a };
        }
        l.exports = { concat: t, join: f, line: N, softline: S, hardline: j, literalline: k, group: e, conditionalGroup: c, fill: h, lineSuffix: p, lineSuffixBoundary: D, cursor: J, breakParent: C, ifBreak: m, trim: w, indent: s, indentIfBreak: y, align: i, addAlignmentToDoc: B, markAsRoot: r, dedentToRoot: n, dedent: o, hardlineWithoutBreakParent: P, literallineWithoutBreakParent: A, label: d };
      } }), Xn = X({ "src/common/end-of-line.js"(u, l) {
        H();
        function t(n) {
          let r = n.indexOf("\r");
          return r >= 0 ? n.charAt(r + 1) === `
` ? "crlf" : "cr" : "lf";
        }
        function s(n) {
          switch (n) {
            case "cr":
              return "\r";
            case "crlf":
              return `\r
`;
            default:
              return `
`;
          }
        }
        function i(n, r) {
          let o;
          switch (r) {
            case `
`:
              o = /\n/g;
              break;
            case "\r":
              o = /\r/g;
              break;
            case `\r
`:
              o = /\r\n/g;
              break;
            default:
              throw new Error(`Unexpected "eol" ${JSON.stringify(r)}.`);
          }
          let c = n.match(o);
          return c ? c.length : 0;
        }
        function e(n) {
          return n.replace(/\r\n?/g, `
`);
        }
        l.exports = { guessEndOfLine: t, convertEndOfLineToChars: s, countEndOfLineChars: i, normalizeEndOfLine: e };
      } }), cn = X({ "src/utils/get-last.js"(u, l) {
        H();
        var t = (s) => s[s.length - 1];
        l.exports = t;
      } });
      function Jr() {
        let { onlyFirst: u = !1 } = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, l = ["[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)", "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))"].join("|");
        return new RegExp(l, u ? void 0 : "g");
      }
      var On = Ze({ "node_modules/strip-ansi/node_modules/ansi-regex/index.js"() {
        H();
      } });
      function qr(u) {
        if (typeof u != "string")
          throw new TypeError(`Expected a \`string\`, got \`${typeof u}\``);
        return u.replace(Jr(), "");
      }
      var Gr = Ze({ "node_modules/strip-ansi/index.js"() {
        H(), On();
      } });
      function Wr(u) {
        return Number.isInteger(u) ? u >= 4352 && (u <= 4447 || u === 9001 || u === 9002 || 11904 <= u && u <= 12871 && u !== 12351 || 12880 <= u && u <= 19903 || 19968 <= u && u <= 42182 || 43360 <= u && u <= 43388 || 44032 <= u && u <= 55203 || 63744 <= u && u <= 64255 || 65040 <= u && u <= 65049 || 65072 <= u && u <= 65131 || 65281 <= u && u <= 65376 || 65504 <= u && u <= 65510 || 110592 <= u && u <= 110593 || 127488 <= u && u <= 127569 || 131072 <= u && u <= 262141) : !1;
      }
      var Xr = Ze({ "node_modules/is-fullwidth-code-point/index.js"() {
        H();
      } }), bn = X({ "node_modules/emoji-regex/index.js"(u, l) {
        H(), l.exports = function() {
          return /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67)\uDB40\uDC7F|(?:\uD83E\uDDD1\uD83C\uDFFF\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFE])|(?:\uD83E\uDDD1\uD83C\uDFFE\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFD\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFC\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFB\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFC-\uDFFF])|\uD83D\uDC68(?:\uD83C\uDFFB(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF]))|\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|[\u2695\u2696\u2708]\uFE0F|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))?|(?:\uD83C[\uDFFC-\uDFFF])\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF]))|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])\uFE0F|\u200D(?:(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D[\uDC66\uDC67])|\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC)?|(?:\uD83D\uDC69(?:\uD83C\uDFFB\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|(?:\uD83C[\uDFFC-\uDFFF])\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69]))|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1)(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC69(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83E\uDDD1(?:\u200D(?:\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83E\uDDD1(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\uD83D\uDE36\u200D\uD83C\uDF2B|\uD83C\uDFF3\uFE0F\u200D\u26A7|\uD83D\uDC3B\u200D\u2744|(?:(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\uD83C\uDFF4\u200D\u2620|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])\u200D[\u2640\u2642]|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u2328\u23CF\u23ED-\u23EF\u23F1\u23F2\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB\u25FC\u2600-\u2604\u260E\u2611\u2618\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u2692\u2694-\u2697\u2699\u269B\u269C\u26A0\u26A7\u26B0\u26B1\u26C8\u26CF\u26D1\u26D3\u26E9\u26F0\u26F1\u26F4\u26F7\u26F8\u2702\u2708\u2709\u270F\u2712\u2714\u2716\u271D\u2721\u2733\u2734\u2744\u2747\u2763\u27A1\u2934\u2935\u2B05-\u2B07\u3030\u303D\u3297\u3299]|\uD83C[\uDD70\uDD71\uDD7E\uDD7F\uDE02\uDE37\uDF21\uDF24-\uDF2C\uDF36\uDF7D\uDF96\uDF97\uDF99-\uDF9B\uDF9E\uDF9F\uDFCD\uDFCE\uDFD4-\uDFDF\uDFF5\uDFF7]|\uD83D[\uDC3F\uDCFD\uDD49\uDD4A\uDD6F\uDD70\uDD73\uDD76-\uDD79\uDD87\uDD8A-\uDD8D\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA\uDECB\uDECD-\uDECF\uDEE0-\uDEE5\uDEE9\uDEF0\uDEF3])\uFE0F|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDE35\u200D\uD83D\uDCAB|\uD83D\uDE2E\u200D\uD83D\uDCA8|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83E\uDDD1(?:\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC|\uD83C\uDFFB)?|\uD83D\uDC69(?:\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC|\uD83C\uDFFB)?|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF6\uD83C\uDDE6|\uD83C\uDDF4\uD83C\uDDF2|\uD83D\uDC08\u200D\u2B1B|\u2764\uFE0F\u200D(?:\uD83D\uDD25|\uD83E\uDE79)|\uD83D\uDC41\uFE0F|\uD83C\uDFF3\uFE0F|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|[#\*0-9]\uFE0F\u20E3|\u2764\uFE0F|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])|\uD83C\uDFF4|(?:[\u270A\u270B]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270C\u270D]|\uD83D[\uDD74\uDD90])(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])|[\u270A\u270B]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC08\uDC15\uDC3B\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE2E\uDE35\uDE36\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5]|\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD]|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF]|[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF84\uDF86-\uDF93\uDFA0-\uDFC1\uDFC5\uDFC6\uDFC8\uDFC9\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC07\uDC09-\uDC14\uDC16-\uDC3A\uDC3C-\uDC3E\uDC40\uDC44\uDC45\uDC51-\uDC65\uDC6A\uDC79-\uDC7B\uDC7D-\uDC80\uDC84\uDC88-\uDC8E\uDC90\uDC92-\uDCA9\uDCAB-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDDA4\uDDFB-\uDE2D\uDE2F-\uDE34\uDE37-\uDE44\uDE48-\uDE4A\uDE80-\uDEA2\uDEA4-\uDEB3\uDEB7-\uDEBF\uDEC1-\uDEC5\uDED0-\uDED2\uDED5-\uDED7\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0D\uDD0E\uDD10-\uDD17\uDD1D\uDD20-\uDD25\uDD27-\uDD2F\uDD3A\uDD3F-\uDD45\uDD47-\uDD76\uDD78\uDD7A-\uDDB4\uDDB7\uDDBA\uDDBC-\uDDCB\uDDD0\uDDE0-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6]|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5-\uDED7\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0C-\uDD3A\uDD3C-\uDD45\uDD47-\uDD78\uDD7A-\uDDCB\uDDCD-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26A7\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5-\uDED7\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0C-\uDD3A\uDD3C-\uDD45\uDD47-\uDD78\uDD7A-\uDDCB\uDDCD-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDD77\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD])/g;
        };
      } }), Vu = {};
      lt(Vu, { default: () => fa });
      function fa(u) {
        if (typeof u != "string" || u.length === 0 || (u = qr(u), u.length === 0))
          return 0;
        u = u.replace((0, Ju.default)(), "  ");
        let l = 0;
        for (let t = 0; t < u.length; t++) {
          let s = u.codePointAt(t);
          s <= 31 || s >= 127 && s <= 159 || s >= 768 && s <= 879 || (s > 65535 && t++, l += Wr(s) ? 2 : 1);
        }
        return l;
      }
      var Ju, ma = Ze({ "node_modules/string-width/index.js"() {
        H(), Gr(), Xr(), Ju = Nt(bn());
      } }), qu = X({ "src/utils/get-string-width.js"(u, l) {
        H();
        var t = (ma(), Tt(Vu)).default, s = /[^\x20-\x7F]/;
        function i(e) {
          return e ? s.test(e) ? t(e) : e.length : 0;
        }
        l.exports = i;
      } }), br = X({ "src/document/doc-utils.js"(u, l) {
        H();
        var t = cn(), { literalline: s, join: i } = jn(), e = (a) => Array.isArray(a) || a && a.type === "concat", n = (a) => {
          if (Array.isArray(a))
            return a;
          if (a.type !== "concat" && a.type !== "fill")
            throw new Error("Expect doc type to be `concat` or `fill`.");
          return a.parts;
        }, r = {};
        function o(a, g, E, b) {
          let x = [a];
          for (; x.length > 0; ) {
            let T = x.pop();
            if (T === r) {
              E(x.pop());
              continue;
            }
            if (E && x.push(T, r), !g || g(T) !== !1)
              if (e(T) || T.type === "fill") {
                let I = n(T);
                for (let M = I.length, V = M - 1; V >= 0; --V)
                  x.push(I[V]);
              } else if (T.type === "if-break")
                T.flatContents && x.push(T.flatContents), T.breakContents && x.push(T.breakContents);
              else if (T.type === "group" && T.expandedStates)
                if (b)
                  for (let I = T.expandedStates.length, M = I - 1; M >= 0; --M)
                    x.push(T.expandedStates[M]);
                else
                  x.push(T.contents);
              else
                T.contents && x.push(T.contents);
          }
        }
        function c(a, g) {
          let E = /* @__PURE__ */ new Map();
          return b(a);
          function b(T) {
            if (E.has(T))
              return E.get(T);
            let I = x(T);
            return E.set(T, I), I;
          }
          function x(T) {
            if (Array.isArray(T))
              return g(T.map(b));
            if (T.type === "concat" || T.type === "fill") {
              let I = T.parts.map(b);
              return g(Object.assign(Object.assign({}, T), {}, { parts: I }));
            }
            if (T.type === "if-break") {
              let I = T.breakContents && b(T.breakContents), M = T.flatContents && b(T.flatContents);
              return g(Object.assign(Object.assign({}, T), {}, { breakContents: I, flatContents: M }));
            }
            if (T.type === "group" && T.expandedStates) {
              let I = T.expandedStates.map(b), M = I[0];
              return g(Object.assign(Object.assign({}, T), {}, { contents: M, expandedStates: I }));
            }
            if (T.contents) {
              let I = b(T.contents);
              return g(Object.assign(Object.assign({}, T), {}, { contents: I }));
            }
            return g(T);
          }
        }
        function h(a, g, E) {
          let b = E, x = !1;
          function T(I) {
            let M = g(I);
            if (M !== void 0 && (x = !0, b = M), x)
              return !1;
          }
          return o(a, T), b;
        }
        function m(a) {
          if (a.type === "group" && a.break || a.type === "line" && a.hard || a.type === "break-parent")
            return !0;
        }
        function y(a) {
          return h(a, m, !1);
        }
        function p(a) {
          if (a.length > 0) {
            let g = t(a);
            !g.expandedStates && !g.break && (g.break = "propagated");
          }
          return null;
        }
        function D(a) {
          let g = /* @__PURE__ */ new Set(), E = [];
          function b(T) {
            if (T.type === "break-parent" && p(E), T.type === "group") {
              if (E.push(T), g.has(T))
                return !1;
              g.add(T);
            }
          }
          function x(T) {
            T.type === "group" && E.pop().break && p(E);
          }
          o(a, b, x, !0);
        }
        function C(a) {
          return a.type === "line" && !a.hard ? a.soft ? "" : " " : a.type === "if-break" ? a.flatContents || "" : a;
        }
        function w(a) {
          return c(a, C);
        }
        var P = (a, g) => a && a.type === "line" && a.hard && g && g.type === "break-parent";
        function A(a) {
          if (!a)
            return a;
          if (e(a) || a.type === "fill") {
            let g = n(a);
            for (; g.length > 1 && P(...g.slice(-2)); )
              g.length -= 2;
            if (g.length > 0) {
              let E = A(t(g));
              g[g.length - 1] = E;
            }
            return Array.isArray(a) ? g : Object.assign(Object.assign({}, a), {}, { parts: g });
          }
          switch (a.type) {
            case "align":
            case "indent":
            case "indent-if-break":
            case "group":
            case "line-suffix":
            case "label": {
              let g = A(a.contents);
              return Object.assign(Object.assign({}, a), {}, { contents: g });
            }
            case "if-break": {
              let g = A(a.breakContents), E = A(a.flatContents);
              return Object.assign(Object.assign({}, a), {}, { breakContents: g, flatContents: E });
            }
          }
          return a;
        }
        function N(a) {
          return A(j(a));
        }
        function S(a) {
          switch (a.type) {
            case "fill":
              if (a.parts.every((E) => E === ""))
                return "";
              break;
            case "group":
              if (!a.contents && !a.id && !a.break && !a.expandedStates)
                return "";
              if (a.contents.type === "group" && a.contents.id === a.id && a.contents.break === a.break && a.contents.expandedStates === a.expandedStates)
                return a.contents;
              break;
            case "align":
            case "indent":
            case "indent-if-break":
            case "line-suffix":
              if (!a.contents)
                return "";
              break;
            case "if-break":
              if (!a.flatContents && !a.breakContents)
                return "";
              break;
          }
          if (!e(a))
            return a;
          let g = [];
          for (let E of n(a)) {
            if (!E)
              continue;
            let [b, ...x] = e(E) ? n(E) : [E];
            typeof b == "string" && typeof t(g) == "string" ? g[g.length - 1] += b : g.push(b), g.push(...x);
          }
          return g.length === 0 ? "" : g.length === 1 ? g[0] : Array.isArray(a) ? g : Object.assign(Object.assign({}, a), {}, { parts: g });
        }
        function j(a) {
          return c(a, (g) => S(g));
        }
        function k(a) {
          let g = [], E = a.filter(Boolean);
          for (; E.length > 0; ) {
            let b = E.shift();
            if (b) {
              if (e(b)) {
                E.unshift(...n(b));
                continue;
              }
              if (g.length > 0 && typeof t(g) == "string" && typeof b == "string") {
                g[g.length - 1] += b;
                continue;
              }
              g.push(b);
            }
          }
          return g;
        }
        function J(a) {
          return c(a, (g) => Array.isArray(g) ? k(g) : g.parts ? Object.assign(Object.assign({}, g), {}, { parts: k(g.parts) }) : g);
        }
        function f(a) {
          return c(a, (g) => typeof g == "string" && g.includes(`
`) ? B(g) : g);
        }
        function B(a) {
          let g = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : s;
          return i(g, a.split(`
`)).parts;
        }
        function d(a) {
          if (a.type === "line")
            return !0;
        }
        function F(a) {
          return h(a, d, !1);
        }
        l.exports = { isConcat: e, getDocParts: n, willBreak: y, traverseDoc: o, findInDoc: h, mapDoc: c, propagateBreaks: D, removeLines: w, stripTrailingHardline: N, normalizeParts: k, normalizeDoc: J, cleanDoc: j, replaceTextEndOfLine: B, replaceEndOfLine: f, canBreak: F };
      } }), ga = X({ "src/document/doc-printer.js"(u, l) {
        H();
        var { convertEndOfLineToChars: t } = Xn(), s = cn(), i = qu(), { fill: e, cursor: n, indent: r } = jn(), { isConcat: o, getDocParts: c } = br(), h, m = 1, y = 2;
        function p() {
          return { value: "", length: 0, queue: [] };
        }
        function D(S, j) {
          return w(S, { type: "indent" }, j);
        }
        function C(S, j, k) {
          return j === Number.NEGATIVE_INFINITY ? S.root || p() : j < 0 ? w(S, { type: "dedent" }, k) : j ? j.type === "root" ? Object.assign(Object.assign({}, S), {}, { root: S }) : w(S, { type: typeof j == "string" ? "stringAlign" : "numberAlign", n: j }, k) : S;
        }
        function w(S, j, k) {
          let J = j.type === "dedent" ? S.queue.slice(0, -1) : [...S.queue, j], f = "", B = 0, d = 0, F = 0;
          for (let I of J)
            switch (I.type) {
              case "indent":
                E(), k.useTabs ? a(1) : g(k.tabWidth);
                break;
              case "stringAlign":
                E(), f += I.n, B += I.n.length;
                break;
              case "numberAlign":
                d += 1, F += I.n;
                break;
              default:
                throw new Error(`Unexpected type '${I.type}'`);
            }
          return x(), Object.assign(Object.assign({}, S), {}, { value: f, length: B, queue: J });
          function a(I) {
            f += "	".repeat(I), B += k.tabWidth * I;
          }
          function g(I) {
            f += " ".repeat(I), B += I;
          }
          function E() {
            k.useTabs ? b() : x();
          }
          function b() {
            d > 0 && a(d), T();
          }
          function x() {
            F > 0 && g(F), T();
          }
          function T() {
            d = 0, F = 0;
          }
        }
        function P(S) {
          if (S.length === 0)
            return 0;
          let j = 0;
          for (; S.length > 0 && typeof s(S) == "string" && /^[\t ]*$/.test(s(S)); )
            j += S.pop().length;
          if (S.length > 0 && typeof s(S) == "string") {
            let k = s(S).replace(/[\t ]*$/, "");
            j += s(S).length - k.length, S[S.length - 1] = k;
          }
          return j;
        }
        function A(S, j, k, J, f) {
          let B = j.length, d = [S], F = [];
          for (; k >= 0; ) {
            if (d.length === 0) {
              if (B === 0)
                return !0;
              d.push(j[--B]);
              continue;
            }
            let { mode: a, doc: g } = d.pop();
            if (typeof g == "string")
              F.push(g), k -= i(g);
            else if (o(g) || g.type === "fill") {
              let E = c(g);
              for (let b = E.length - 1; b >= 0; b--)
                d.push({ mode: a, doc: E[b] });
            } else
              switch (g.type) {
                case "indent":
                case "align":
                case "indent-if-break":
                case "label":
                  d.push({ mode: a, doc: g.contents });
                  break;
                case "trim":
                  k += P(F);
                  break;
                case "group": {
                  if (f && g.break)
                    return !1;
                  let E = g.break ? m : a, b = g.expandedStates && E === m ? s(g.expandedStates) : g.contents;
                  d.push({ mode: E, doc: b });
                  break;
                }
                case "if-break": {
                  let E = (g.groupId ? h[g.groupId] || y : a) === m ? g.breakContents : g.flatContents;
                  E && d.push({ mode: a, doc: E });
                  break;
                }
                case "line":
                  if (a === m || g.hard)
                    return !0;
                  g.soft || (F.push(" "), k--);
                  break;
                case "line-suffix":
                  J = !0;
                  break;
                case "line-suffix-boundary":
                  if (J)
                    return !1;
                  break;
              }
          }
          return !1;
        }
        function N(S, j) {
          h = {};
          let k = j.printWidth, J = t(j.endOfLine), f = 0, B = [{ ind: p(), mode: m, doc: S }], d = [], F = !1, a = [];
          for (; B.length > 0; ) {
            let { ind: E, mode: b, doc: x } = B.pop();
            if (typeof x == "string") {
              let T = J !== `
` ? x.replace(/\n/g, J) : x;
              d.push(T), f += i(T);
            } else if (o(x)) {
              let T = c(x);
              for (let I = T.length - 1; I >= 0; I--)
                B.push({ ind: E, mode: b, doc: T[I] });
            } else
              switch (x.type) {
                case "cursor":
                  d.push(n.placeholder);
                  break;
                case "indent":
                  B.push({ ind: D(E, j), mode: b, doc: x.contents });
                  break;
                case "align":
                  B.push({ ind: C(E, x.n, j), mode: b, doc: x.contents });
                  break;
                case "trim":
                  f -= P(d);
                  break;
                case "group":
                  switch (b) {
                    case y:
                      if (!F) {
                        B.push({ ind: E, mode: x.break ? m : y, doc: x.contents });
                        break;
                      }
                    case m: {
                      F = !1;
                      let T = { ind: E, mode: y, doc: x.contents }, I = k - f, M = a.length > 0;
                      if (!x.break && A(T, B, I, M))
                        B.push(T);
                      else if (x.expandedStates) {
                        let V = s(x.expandedStates);
                        if (x.break) {
                          B.push({ ind: E, mode: m, doc: V });
                          break;
                        } else
                          for (let $ = 1; $ < x.expandedStates.length + 1; $++)
                            if ($ >= x.expandedStates.length) {
                              B.push({ ind: E, mode: m, doc: V });
                              break;
                            } else {
                              let U = x.expandedStates[$], _ = { ind: E, mode: y, doc: U };
                              if (A(_, B, I, M)) {
                                B.push(_);
                                break;
                              }
                            }
                      } else
                        B.push({ ind: E, mode: m, doc: x.contents });
                      break;
                    }
                  }
                  x.id && (h[x.id] = s(B).mode);
                  break;
                case "fill": {
                  let T = k - f, { parts: I } = x;
                  if (I.length === 0)
                    break;
                  let [M, V] = I, $ = { ind: E, mode: y, doc: M }, U = { ind: E, mode: m, doc: M }, _ = A($, [], T, a.length > 0, !0);
                  if (I.length === 1) {
                    _ ? B.push($) : B.push(U);
                    break;
                  }
                  let ee = { ind: E, mode: y, doc: V }, R = { ind: E, mode: m, doc: V };
                  if (I.length === 2) {
                    _ ? B.push(ee, $) : B.push(R, U);
                    break;
                  }
                  I.splice(0, 2);
                  let O = { ind: E, mode: b, doc: e(I) }, Z = I[0];
                  A({ ind: E, mode: y, doc: [M, V, Z] }, [], T, a.length > 0, !0) ? B.push(O, ee, $) : _ ? B.push(O, R, $) : B.push(O, R, U);
                  break;
                }
                case "if-break":
                case "indent-if-break": {
                  let T = x.groupId ? h[x.groupId] : b;
                  if (T === m) {
                    let I = x.type === "if-break" ? x.breakContents : x.negate ? x.contents : r(x.contents);
                    I && B.push({ ind: E, mode: b, doc: I });
                  }
                  if (T === y) {
                    let I = x.type === "if-break" ? x.flatContents : x.negate ? r(x.contents) : x.contents;
                    I && B.push({ ind: E, mode: b, doc: I });
                  }
                  break;
                }
                case "line-suffix":
                  a.push({ ind: E, mode: b, doc: x.contents });
                  break;
                case "line-suffix-boundary":
                  a.length > 0 && B.push({ ind: E, mode: b, doc: { type: "line", hard: !0 } });
                  break;
                case "line":
                  switch (b) {
                    case y:
                      if (x.hard)
                        F = !0;
                      else {
                        x.soft || (d.push(" "), f += 1);
                        break;
                      }
                    case m:
                      if (a.length > 0) {
                        B.push({ ind: E, mode: b, doc: x }, ...a.reverse()), a.length = 0;
                        break;
                      }
                      x.literal ? E.root ? (d.push(J, E.root.value), f = E.root.length) : (d.push(J), f = 0) : (f -= P(d), d.push(J + E.value), f = E.length);
                      break;
                  }
                  break;
                case "label":
                  B.push({ ind: E, mode: b, doc: x.contents });
                  break;
              }
            B.length === 0 && a.length > 0 && (B.push(...a.reverse()), a.length = 0);
          }
          let g = d.indexOf(n.placeholder);
          if (g !== -1) {
            let E = d.indexOf(n.placeholder, g + 1), b = d.slice(0, g).join(""), x = d.slice(g + 1, E).join(""), T = d.slice(E + 1).join("");
            return { formatted: b + x + T, cursorNodeStart: b.length, cursorNodeText: x };
          }
          return { formatted: d.join("") };
        }
        l.exports = { printDocToString: N };
      } }), ya = X({ "src/document/doc-debug.js"(u, l) {
        H();
        var { isConcat: t, getDocParts: s } = br();
        function i(n) {
          if (!n)
            return "";
          if (t(n)) {
            let r = [];
            for (let o of s(n))
              if (t(o))
                r.push(...i(o).parts);
              else {
                let c = i(o);
                c !== "" && r.push(c);
              }
            return { type: "concat", parts: r };
          }
          return n.type === "if-break" ? Object.assign(Object.assign({}, n), {}, { breakContents: i(n.breakContents), flatContents: i(n.flatContents) }) : n.type === "group" ? Object.assign(Object.assign({}, n), {}, { contents: i(n.contents), expandedStates: n.expandedStates && n.expandedStates.map(i) }) : n.type === "fill" ? { type: "fill", parts: n.parts.map(i) } : n.contents ? Object.assign(Object.assign({}, n), {}, { contents: i(n.contents) }) : n;
        }
        function e(n) {
          let r = /* @__PURE__ */ Object.create(null), o = /* @__PURE__ */ new Set();
          return c(i(n));
          function c(m, y, p) {
            if (typeof m == "string")
              return JSON.stringify(m);
            if (t(m)) {
              let D = s(m).map(c).filter(Boolean);
              return D.length === 1 ? D[0] : `[${D.join(", ")}]`;
            }
            if (m.type === "line") {
              let D = Array.isArray(p) && p[y + 1] && p[y + 1].type === "break-parent";
              return m.literal ? D ? "literalline" : "literallineWithoutBreakParent" : m.hard ? D ? "hardline" : "hardlineWithoutBreakParent" : m.soft ? "softline" : "line";
            }
            if (m.type === "break-parent")
              return Array.isArray(p) && p[y - 1] && p[y - 1].type === "line" && p[y - 1].hard ? void 0 : "breakParent";
            if (m.type === "trim")
              return "trim";
            if (m.type === "indent")
              return "indent(" + c(m.contents) + ")";
            if (m.type === "align")
              return m.n === Number.NEGATIVE_INFINITY ? "dedentToRoot(" + c(m.contents) + ")" : m.n < 0 ? "dedent(" + c(m.contents) + ")" : m.n.type === "root" ? "markAsRoot(" + c(m.contents) + ")" : "align(" + JSON.stringify(m.n) + ", " + c(m.contents) + ")";
            if (m.type === "if-break")
              return "ifBreak(" + c(m.breakContents) + (m.flatContents ? ", " + c(m.flatContents) : "") + (m.groupId ? (m.flatContents ? "" : ', ""') + `, { groupId: ${h(m.groupId)} }` : "") + ")";
            if (m.type === "indent-if-break") {
              let D = [];
              m.negate && D.push("negate: true"), m.groupId && D.push(`groupId: ${h(m.groupId)}`);
              let C = D.length > 0 ? `, { ${D.join(", ")} }` : "";
              return `indentIfBreak(${c(m.contents)}${C})`;
            }
            if (m.type === "group") {
              let D = [];
              m.break && m.break !== "propagated" && D.push("shouldBreak: true"), m.id && D.push(`id: ${h(m.id)}`);
              let C = D.length > 0 ? `, { ${D.join(", ")} }` : "";
              return m.expandedStates ? `conditionalGroup([${m.expandedStates.map((w) => c(w)).join(",")}]${C})` : `group(${c(m.contents)}${C})`;
            }
            if (m.type === "fill")
              return `fill([${m.parts.map((D) => c(D)).join(", ")}])`;
            if (m.type === "line-suffix")
              return "lineSuffix(" + c(m.contents) + ")";
            if (m.type === "line-suffix-boundary")
              return "lineSuffixBoundary";
            if (m.type === "label")
              return `label(${JSON.stringify(m.label)}, ${c(m.contents)})`;
            throw new Error("Unknown doc type " + m.type);
          }
          function h(m) {
            if (typeof m != "symbol")
              return JSON.stringify(String(m));
            if (m in r)
              return r[m];
            let y = String(m).slice(7, -1) || "symbol";
            for (let p = 0; ; p++) {
              let D = y + (p > 0 ? ` #${p}` : "");
              if (!o.has(D))
                return o.add(D), r[m] = `Symbol.for(${JSON.stringify(D)})`;
            }
          }
        }
        l.exports = { printDocToDebug: e };
      } }), pt = X({ "src/document/index.js"(u, l) {
        H(), l.exports = { builders: jn(), printer: ga(), utils: br(), debug: ya() };
      } }), Gu = {};
      lt(Gu, { default: () => ha });
      function ha(u) {
        if (typeof u != "string")
          throw new TypeError("Expected a string");
        return u.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
      }
      var Ea = Ze({ "node_modules/escape-string-regexp/index.js"() {
        H();
      } }), Wu = X({ "node_modules/semver/internal/debug.js"(u, l) {
        H();
        var t = typeof Kt == "object" && Kt.env && Kt.env.NODE_DEBUG && /\bsemver\b/i.test(Kt.env.NODE_DEBUG) ? function() {
          for (var s = arguments.length, i = new Array(s), e = 0; e < s; e++)
            i[e] = arguments[e];
          return console.error("SEMVER", ...i);
        } : () => {
        };
        l.exports = t;
      } }), Xu = X({ "node_modules/semver/internal/constants.js"(u, l) {
        H();
        var t = "2.0.0", s = 256, i = Number.MAX_SAFE_INTEGER || 9007199254740991, e = 16;
        l.exports = { SEMVER_SPEC_VERSION: t, MAX_LENGTH: s, MAX_SAFE_INTEGER: i, MAX_SAFE_COMPONENT_LENGTH: e };
      } }), Ca = X({ "node_modules/semver/internal/re.js"(u, l) {
        H();
        var { MAX_SAFE_COMPONENT_LENGTH: t } = Xu(), s = Wu();
        u = l.exports = {};
        var i = u.re = [], e = u.src = [], n = u.t = {}, r = 0, o = (c, h, m) => {
          let y = r++;
          s(c, y, h), n[c] = y, e[y] = h, i[y] = new RegExp(h, m ? "g" : void 0);
        };
        o("NUMERICIDENTIFIER", "0|[1-9]\\d*"), o("NUMERICIDENTIFIERLOOSE", "[0-9]+"), o("NONNUMERICIDENTIFIER", "\\d*[a-zA-Z-][a-zA-Z0-9-]*"), o("MAINVERSION", `(${e[n.NUMERICIDENTIFIER]})\\.(${e[n.NUMERICIDENTIFIER]})\\.(${e[n.NUMERICIDENTIFIER]})`), o("MAINVERSIONLOOSE", `(${e[n.NUMERICIDENTIFIERLOOSE]})\\.(${e[n.NUMERICIDENTIFIERLOOSE]})\\.(${e[n.NUMERICIDENTIFIERLOOSE]})`), o("PRERELEASEIDENTIFIER", `(?:${e[n.NUMERICIDENTIFIER]}|${e[n.NONNUMERICIDENTIFIER]})`), o("PRERELEASEIDENTIFIERLOOSE", `(?:${e[n.NUMERICIDENTIFIERLOOSE]}|${e[n.NONNUMERICIDENTIFIER]})`), o("PRERELEASE", `(?:-(${e[n.PRERELEASEIDENTIFIER]}(?:\\.${e[n.PRERELEASEIDENTIFIER]})*))`), o("PRERELEASELOOSE", `(?:-?(${e[n.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${e[n.PRERELEASEIDENTIFIERLOOSE]})*))`), o("BUILDIDENTIFIER", "[0-9A-Za-z-]+"), o("BUILD", `(?:\\+(${e[n.BUILDIDENTIFIER]}(?:\\.${e[n.BUILDIDENTIFIER]})*))`), o("FULLPLAIN", `v?${e[n.MAINVERSION]}${e[n.PRERELEASE]}?${e[n.BUILD]}?`), o("FULL", `^${e[n.FULLPLAIN]}$`), o("LOOSEPLAIN", `[v=\\s]*${e[n.MAINVERSIONLOOSE]}${e[n.PRERELEASELOOSE]}?${e[n.BUILD]}?`), o("LOOSE", `^${e[n.LOOSEPLAIN]}$`), o("GTLT", "((?:<|>)?=?)"), o("XRANGEIDENTIFIERLOOSE", `${e[n.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), o("XRANGEIDENTIFIER", `${e[n.NUMERICIDENTIFIER]}|x|X|\\*`), o("XRANGEPLAIN", `[v=\\s]*(${e[n.XRANGEIDENTIFIER]})(?:\\.(${e[n.XRANGEIDENTIFIER]})(?:\\.(${e[n.XRANGEIDENTIFIER]})(?:${e[n.PRERELEASE]})?${e[n.BUILD]}?)?)?`), o("XRANGEPLAINLOOSE", `[v=\\s]*(${e[n.XRANGEIDENTIFIERLOOSE]})(?:\\.(${e[n.XRANGEIDENTIFIERLOOSE]})(?:\\.(${e[n.XRANGEIDENTIFIERLOOSE]})(?:${e[n.PRERELEASELOOSE]})?${e[n.BUILD]}?)?)?`), o("XRANGE", `^${e[n.GTLT]}\\s*${e[n.XRANGEPLAIN]}$`), o("XRANGELOOSE", `^${e[n.GTLT]}\\s*${e[n.XRANGEPLAINLOOSE]}$`), o("COERCE", `(^|[^\\d])(\\d{1,${t}})(?:\\.(\\d{1,${t}}))?(?:\\.(\\d{1,${t}}))?(?:$|[^\\d])`), o("COERCERTL", e[n.COERCE], !0), o("LONETILDE", "(?:~>?)"), o("TILDETRIM", `(\\s*)${e[n.LONETILDE]}\\s+`, !0), u.tildeTrimReplace = "$1~", o("TILDE", `^${e[n.LONETILDE]}${e[n.XRANGEPLAIN]}$`), o("TILDELOOSE", `^${e[n.LONETILDE]}${e[n.XRANGEPLAINLOOSE]}$`), o("LONECARET", "(?:\\^)"), o("CARETTRIM", `(\\s*)${e[n.LONECARET]}\\s+`, !0), u.caretTrimReplace = "$1^", o("CARET", `^${e[n.LONECARET]}${e[n.XRANGEPLAIN]}$`), o("CARETLOOSE", `^${e[n.LONECARET]}${e[n.XRANGEPLAINLOOSE]}$`), o("COMPARATORLOOSE", `^${e[n.GTLT]}\\s*(${e[n.LOOSEPLAIN]})$|^$`), o("COMPARATOR", `^${e[n.GTLT]}\\s*(${e[n.FULLPLAIN]})$|^$`), o("COMPARATORTRIM", `(\\s*)${e[n.GTLT]}\\s*(${e[n.LOOSEPLAIN]}|${e[n.XRANGEPLAIN]})`, !0), u.comparatorTrimReplace = "$1$2$3", o("HYPHENRANGE", `^\\s*(${e[n.XRANGEPLAIN]})\\s+-\\s+(${e[n.XRANGEPLAIN]})\\s*$`), o("HYPHENRANGELOOSE", `^\\s*(${e[n.XRANGEPLAINLOOSE]})\\s+-\\s+(${e[n.XRANGEPLAINLOOSE]})\\s*$`), o("STAR", "(<|>)?=?\\s*\\*"), o("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), o("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
      } }), Fa = X({ "node_modules/semver/internal/parse-options.js"(u, l) {
        H();
        var t = ["includePrerelease", "loose", "rtl"], s = (i) => i ? typeof i != "object" ? { loose: !0 } : t.filter((e) => i[e]).reduce((e, n) => (e[n] = !0, e), {}) : {};
        l.exports = s;
      } }), Aa = X({ "node_modules/semver/internal/identifiers.js"(u, l) {
        H();
        var t = /^[0-9]+$/, s = (e, n) => {
          let r = t.test(e), o = t.test(n);
          return r && o && (e = +e, n = +n), e === n ? 0 : r && !o ? -1 : o && !r ? 1 : e < n ? -1 : 1;
        }, i = (e, n) => s(n, e);
        l.exports = { compareIdentifiers: s, rcompareIdentifiers: i };
      } }), va = X({ "node_modules/semver/classes/semver.js"(u, l) {
        H();
        var t = Wu(), { MAX_LENGTH: s, MAX_SAFE_INTEGER: i } = Xu(), { re: e, t: n } = Ca(), r = Fa(), { compareIdentifiers: o } = Aa(), c = class {
          constructor(h, m) {
            if (m = r(m), h instanceof c) {
              if (h.loose === !!m.loose && h.includePrerelease === !!m.includePrerelease)
                return h;
              h = h.version;
            } else if (typeof h != "string")
              throw new TypeError(`Invalid Version: ${h}`);
            if (h.length > s)
              throw new TypeError(`version is longer than ${s} characters`);
            t("SemVer", h, m), this.options = m, this.loose = !!m.loose, this.includePrerelease = !!m.includePrerelease;
            let y = h.trim().match(m.loose ? e[n.LOOSE] : e[n.FULL]);
            if (!y)
              throw new TypeError(`Invalid Version: ${h}`);
            if (this.raw = h, this.major = +y[1], this.minor = +y[2], this.patch = +y[3], this.major > i || this.major < 0)
              throw new TypeError("Invalid major version");
            if (this.minor > i || this.minor < 0)
              throw new TypeError("Invalid minor version");
            if (this.patch > i || this.patch < 0)
              throw new TypeError("Invalid patch version");
            y[4] ? this.prerelease = y[4].split(".").map((p) => {
              if (/^[0-9]+$/.test(p)) {
                let D = +p;
                if (D >= 0 && D < i)
                  return D;
              }
              return p;
            }) : this.prerelease = [], this.build = y[5] ? y[5].split(".") : [], this.format();
          }
          format() {
            return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
          }
          toString() {
            return this.version;
          }
          compare(h) {
            if (t("SemVer.compare", this.version, this.options, h), !(h instanceof c)) {
              if (typeof h == "string" && h === this.version)
                return 0;
              h = new c(h, this.options);
            }
            return h.version === this.version ? 0 : this.compareMain(h) || this.comparePre(h);
          }
          compareMain(h) {
            return h instanceof c || (h = new c(h, this.options)), o(this.major, h.major) || o(this.minor, h.minor) || o(this.patch, h.patch);
          }
          comparePre(h) {
            if (h instanceof c || (h = new c(h, this.options)), this.prerelease.length && !h.prerelease.length)
              return -1;
            if (!this.prerelease.length && h.prerelease.length)
              return 1;
            if (!this.prerelease.length && !h.prerelease.length)
              return 0;
            let m = 0;
            do {
              let y = this.prerelease[m], p = h.prerelease[m];
              if (t("prerelease compare", m, y, p), y === void 0 && p === void 0)
                return 0;
              if (p === void 0)
                return 1;
              if (y === void 0)
                return -1;
              if (y !== p)
                return o(y, p);
            } while (++m);
          }
          compareBuild(h) {
            h instanceof c || (h = new c(h, this.options));
            let m = 0;
            do {
              let y = this.build[m], p = h.build[m];
              if (t("prerelease compare", m, y, p), y === void 0 && p === void 0)
                return 0;
              if (p === void 0)
                return 1;
              if (y === void 0)
                return -1;
              if (y !== p)
                return o(y, p);
            } while (++m);
          }
          inc(h, m) {
            switch (h) {
              case "premajor":
                this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", m);
                break;
              case "preminor":
                this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", m);
                break;
              case "prepatch":
                this.prerelease.length = 0, this.inc("patch", m), this.inc("pre", m);
                break;
              case "prerelease":
                this.prerelease.length === 0 && this.inc("patch", m), this.inc("pre", m);
                break;
              case "major":
                (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) && this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
                break;
              case "minor":
                (this.patch !== 0 || this.prerelease.length === 0) && this.minor++, this.patch = 0, this.prerelease = [];
                break;
              case "patch":
                this.prerelease.length === 0 && this.patch++, this.prerelease = [];
                break;
              case "pre":
                if (this.prerelease.length === 0)
                  this.prerelease = [0];
                else {
                  let y = this.prerelease.length;
                  for (; --y >= 0; )
                    typeof this.prerelease[y] == "number" && (this.prerelease[y]++, y = -2);
                  y === -1 && this.prerelease.push(0);
                }
                m && (o(this.prerelease[0], m) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = [m, 0]) : this.prerelease = [m, 0]);
                break;
              default:
                throw new Error(`invalid increment argument: ${h}`);
            }
            return this.format(), this.raw = this.version, this;
          }
        };
        l.exports = c;
      } }), du = X({ "node_modules/semver/functions/compare.js"(u, l) {
        H();
        var t = va(), s = (i, e, n) => new t(i, n).compare(new t(e, n));
        l.exports = s;
      } }), ba = X({ "node_modules/semver/functions/lt.js"(u, l) {
        H();
        var t = du(), s = (i, e, n) => t(i, e, n) < 0;
        l.exports = s;
      } }), xa = X({ "node_modules/semver/functions/gte.js"(u, l) {
        H();
        var t = du(), s = (i, e, n) => t(i, e, n) >= 0;
        l.exports = s;
      } }), Sa = X({ "src/utils/arrayify.js"(u, l) {
        H(), l.exports = (t, s) => Object.entries(t).map((i) => {
          let [e, n] = i;
          return Object.assign({ [s]: e }, n);
        });
      } }), Ba = X({ "node_modules/outdent/lib/index.js"(u, l) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 }), u.outdent = void 0;
        function t() {
          for (var A = [], N = 0; N < arguments.length; N++)
            A[N] = arguments[N];
        }
        function s() {
          return typeof WeakMap < "u" ? /* @__PURE__ */ new WeakMap() : i();
        }
        function i() {
          return { add: t, delete: t, get: t, set: t, has: function(A) {
            return !1;
          } };
        }
        var e = Object.prototype.hasOwnProperty, n = function(A, N) {
          return e.call(A, N);
        };
        function r(A, N) {
          for (var S in N)
            n(N, S) && (A[S] = N[S]);
          return A;
        }
        var o = /^[ \t]*(?:\r\n|\r|\n)/, c = /(?:\r\n|\r|\n)[ \t]*$/, h = /^(?:[\r\n]|$)/, m = /(?:\r\n|\r|\n)([ \t]*)(?:[^ \t\r\n]|$)/, y = /^[ \t]*[\r\n][ \t\r\n]*$/;
        function p(A, N, S) {
          var j = 0, k = A[0].match(m);
          k && (j = k[1].length);
          var J = "(\\r\\n|\\r|\\n).{0," + j + "}", f = new RegExp(J, "g");
          N && (A = A.slice(1));
          var B = S.newline, d = S.trimLeadingNewline, F = S.trimTrailingNewline, a = typeof B == "string", g = A.length, E = A.map(function(b, x) {
            return b = b.replace(f, "$1"), x === 0 && d && (b = b.replace(o, "")), x === g - 1 && F && (b = b.replace(c, "")), a && (b = b.replace(/\r\n|\n|\r/g, function(T) {
              return B;
            })), b;
          });
          return E;
        }
        function D(A, N) {
          for (var S = "", j = 0, k = A.length; j < k; j++)
            S += A[j], j < k - 1 && (S += N[j]);
          return S;
        }
        function C(A) {
          return n(A, "raw") && n(A, "length");
        }
        function w(A) {
          var N = s(), S = s();
          function j(J) {
            for (var f = [], B = 1; B < arguments.length; B++)
              f[B - 1] = arguments[B];
            if (C(J)) {
              var d = J, F = (f[0] === j || f[0] === P) && y.test(d[0]) && h.test(d[1]), a = F ? S : N, g = a.get(d);
              if (g || (g = p(d, F, A), a.set(d, g)), f.length === 0)
                return g[0];
              var E = D(g, F ? f.slice(1) : f);
              return E;
            } else
              return w(r(r({}, A), J || {}));
          }
          var k = r(j, { string: function(J) {
            return p([J], !1, A)[0];
          } });
          return k;
        }
        var P = w({ trimLeadingNewline: !0, trimTrailingNewline: !0 });
        if (u.outdent = P, u.default = P, typeof l < "u")
          try {
            l.exports = P, Object.defineProperty(P, "__esModule", { value: !0 }), P.default = P, P.outdent = P;
          } catch {
          }
      } }), Ta = X({ "src/main/core-options.js"(u, l) {
        H();
        var { outdent: t } = Ba(), s = "Config", i = "Editor", e = "Format", n = "Other", r = "Output", o = "Global", c = "Special", h = { cursorOffset: { since: "1.4.0", category: c, type: "int", default: -1, range: { start: -1, end: Number.POSITIVE_INFINITY, step: 1 }, description: t`
      Print (to stderr) where a cursor at the given position would move to after formatting.
      This option cannot be used with --range-start and --range-end.
    `, cliCategory: i }, endOfLine: { since: "1.15.0", category: o, type: "choice", default: [{ since: "1.15.0", value: "auto" }, { since: "2.0.0", value: "lf" }], description: "Which end of line characters to apply.", choices: [{ value: "lf", description: "Line Feed only (\\n), common on Linux and macOS as well as inside git repos" }, { value: "crlf", description: "Carriage Return + Line Feed characters (\\r\\n), common on Windows" }, { value: "cr", description: "Carriage Return character only (\\r), used very rarely" }, { value: "auto", description: t`
          Maintain existing
          (mixed values within one file are normalised by looking at what's used after the first line)
        ` }] }, filepath: { since: "1.4.0", category: c, type: "path", description: "Specify the input filepath. This will be used to do parser inference.", cliName: "stdin-filepath", cliCategory: n, cliDescription: "Path to the file to pretend that stdin comes from." }, insertPragma: { since: "1.8.0", category: c, type: "boolean", default: !1, description: "Insert @format pragma into file's first docblock comment.", cliCategory: n }, parser: { since: "0.0.10", category: o, type: "choice", default: [{ since: "0.0.10", value: "babylon" }, { since: "1.13.0", value: void 0 }], description: "Which parser to use.", exception: (m) => typeof m == "string" || typeof m == "function", choices: [{ value: "flow", description: "Flow" }, { value: "babel", since: "1.16.0", description: "JavaScript" }, { value: "babel-flow", since: "1.16.0", description: "Flow" }, { value: "babel-ts", since: "2.0.0", description: "TypeScript" }, { value: "typescript", since: "1.4.0", description: "TypeScript" }, { value: "acorn", since: "2.6.0", description: "JavaScript" }, { value: "espree", since: "2.2.0", description: "JavaScript" }, { value: "meriyah", since: "2.2.0", description: "JavaScript" }, { value: "css", since: "1.7.1", description: "CSS" }, { value: "less", since: "1.7.1", description: "Less" }, { value: "scss", since: "1.7.1", description: "SCSS" }, { value: "json", since: "1.5.0", description: "JSON" }, { value: "json5", since: "1.13.0", description: "JSON5" }, { value: "json-stringify", since: "1.13.0", description: "JSON.stringify" }, { value: "graphql", since: "1.5.0", description: "GraphQL" }, { value: "markdown", since: "1.8.0", description: "Markdown" }, { value: "mdx", since: "1.15.0", description: "MDX" }, { value: "vue", since: "1.10.0", description: "Vue" }, { value: "yaml", since: "1.14.0", description: "YAML" }, { value: "glimmer", since: "2.3.0", description: "Ember / Handlebars" }, { value: "html", since: "1.15.0", description: "HTML" }, { value: "angular", since: "1.15.0", description: "Angular" }, { value: "lwc", since: "1.17.0", description: "Lightning Web Components" }] }, plugins: { since: "1.10.0", type: "path", array: !0, default: [{ value: [] }], category: o, description: "Add a plugin. Multiple plugins can be passed as separate `--plugin`s.", exception: (m) => typeof m == "string" || typeof m == "object", cliName: "plugin", cliCategory: s }, pluginSearchDirs: { since: "1.13.0", type: "path", array: !0, default: [{ value: [] }], category: o, description: t`
      Custom directory that contains prettier plugins in node_modules subdirectory.
      Overrides default behavior when plugins are searched relatively to the location of Prettier.
      Multiple values are accepted.
    `, exception: (m) => typeof m == "string" || typeof m == "object", cliName: "plugin-search-dir", cliCategory: s }, printWidth: { since: "0.0.0", category: o, type: "int", default: 80, description: "The line length where Prettier will try wrap.", range: { start: 0, end: Number.POSITIVE_INFINITY, step: 1 } }, rangeEnd: { since: "1.4.0", category: c, type: "int", default: Number.POSITIVE_INFINITY, range: { start: 0, end: Number.POSITIVE_INFINITY, step: 1 }, description: t`
      Format code ending at a given character offset (exclusive).
      The range will extend forwards to the end of the selected statement.
      This option cannot be used with --cursor-offset.
    `, cliCategory: i }, rangeStart: { since: "1.4.0", category: c, type: "int", default: 0, range: { start: 0, end: Number.POSITIVE_INFINITY, step: 1 }, description: t`
      Format code starting at a given character offset.
      The range will extend backwards to the start of the first line containing the selected statement.
      This option cannot be used with --cursor-offset.
    `, cliCategory: i }, requirePragma: { since: "1.7.0", category: c, type: "boolean", default: !1, description: t`
      Require either '@prettier' or '@format' to be present in the file's first docblock comment
      in order for it to be formatted.
    `, cliCategory: n }, tabWidth: { type: "int", category: o, default: 2, description: "Number of spaces per indentation level.", range: { start: 0, end: Number.POSITIVE_INFINITY, step: 1 } }, useTabs: { since: "1.0.0", category: o, type: "boolean", default: !1, description: "Indent with tabs instead of spaces." }, embeddedLanguageFormatting: { since: "2.1.0", category: o, type: "choice", default: [{ since: "2.1.0", value: "auto" }], description: "Control how Prettier formats quoted code embedded in the file.", choices: [{ value: "auto", description: "Format embedded code if Prettier can automatically identify it." }, { value: "off", description: "Never automatically format embedded code." }] } };
        l.exports = { CATEGORY_CONFIG: s, CATEGORY_EDITOR: i, CATEGORY_FORMAT: e, CATEGORY_OTHER: n, CATEGORY_OUTPUT: r, CATEGORY_GLOBAL: o, CATEGORY_SPECIAL: c, options: h };
      } }), fu = X({ "src/main/support.js"(u, l) {
        H();
        var t = { compare: du(), lt: ba(), gte: xa() }, s = Sa(), i = Cn().version, e = Ta().options;
        function n() {
          let { plugins: o = [], showUnreleased: c = !1, showDeprecated: h = !1, showInternal: m = !1 } = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, y = i.split("-", 1)[0], p = o.flatMap((A) => A.languages || []).filter(C), D = s(Object.assign({}, ...o.map((A) => {
            let { options: N } = A;
            return N;
          }), e), "name").filter((A) => C(A) && w(A)).sort((A, N) => A.name === N.name ? 0 : A.name < N.name ? -1 : 1).map(P).map((A) => {
            A = Object.assign({}, A), Array.isArray(A.default) && (A.default = A.default.length === 1 ? A.default[0].value : A.default.filter(C).sort((S, j) => t.compare(j.since, S.since))[0].value), Array.isArray(A.choices) && (A.choices = A.choices.filter((S) => C(S) && w(S)), A.name === "parser" && r(A, p, o));
            let N = Object.fromEntries(o.filter((S) => S.defaultOptions && S.defaultOptions[A.name] !== void 0).map((S) => [S.name, S.defaultOptions[A.name]]));
            return Object.assign(Object.assign({}, A), {}, { pluginDefaults: N });
          });
          return { languages: p, options: D };
          function C(A) {
            return c || !("since" in A) || A.since && t.gte(y, A.since);
          }
          function w(A) {
            return h || !("deprecated" in A) || A.deprecated && t.lt(y, A.deprecated);
          }
          function P(A) {
            return m ? A : Ae(A, ie);
          }
        }
        function r(o, c, h) {
          let m = new Set(o.choices.map((y) => y.value));
          for (let y of c)
            if (y.parsers) {
              for (let p of y.parsers)
                if (!m.has(p)) {
                  m.add(p);
                  let D = h.find((w) => w.parsers && w.parsers[p]), C = y.name;
                  D && D.name && (C += ` (plugin: ${D.name})`), o.choices.push({ value: p, description: C });
                }
            }
        }
        l.exports = { getSupportInfo: n };
      } }), mu = X({ "src/utils/is-non-empty-array.js"(u, l) {
        H();
        function t(s) {
          return Array.isArray(s) && s.length > 0;
        }
        l.exports = t;
      } }), Ur = X({ "src/utils/text/skip.js"(u, l) {
        H();
        function t(r) {
          return (o, c, h) => {
            let m = h && h.backwards;
            if (c === !1)
              return !1;
            let { length: y } = o, p = c;
            for (; p >= 0 && p < y; ) {
              let D = o.charAt(p);
              if (r instanceof RegExp) {
                if (!r.test(D))
                  return p;
              } else if (!r.includes(D))
                return p;
              m ? p-- : p++;
            }
            return p === -1 || p === y ? p : !1;
          };
        }
        var s = t(/\s/), i = t(" 	"), e = t(",; 	"), n = t(/[^\n\r]/);
        l.exports = { skipWhitespace: s, skipSpaces: i, skipToLineEnd: e, skipEverythingButNewLine: n };
      } }), Uu = X({ "src/utils/text/skip-inline-comment.js"(u, l) {
        H();
        function t(s, i) {
          if (i === !1)
            return !1;
          if (s.charAt(i) === "/" && s.charAt(i + 1) === "*") {
            for (let e = i + 2; e < s.length; ++e)
              if (s.charAt(e) === "*" && s.charAt(e + 1) === "/")
                return e + 2;
          }
          return i;
        }
        l.exports = t;
      } }), zu = X({ "src/utils/text/skip-trailing-comment.js"(u, l) {
        H();
        var { skipEverythingButNewLine: t } = Ur();
        function s(i, e) {
          return e === !1 ? !1 : i.charAt(e) === "/" && i.charAt(e + 1) === "/" ? t(i, e) : e;
        }
        l.exports = s;
      } }), Yu = X({ "src/utils/text/skip-newline.js"(u, l) {
        H();
        function t(s, i, e) {
          let n = e && e.backwards;
          if (i === !1)
            return !1;
          let r = s.charAt(i);
          if (n) {
            if (s.charAt(i - 1) === "\r" && r === `
`)
              return i - 2;
            if (r === `
` || r === "\r" || r === "\u2028" || r === "\u2029")
              return i - 1;
          } else {
            if (r === "\r" && s.charAt(i + 1) === `
`)
              return i + 2;
            if (r === `
` || r === "\r" || r === "\u2028" || r === "\u2029")
              return i + 1;
          }
          return i;
        }
        l.exports = t;
      } }), wa = X({ "src/utils/text/get-next-non-space-non-comment-character-index-with-start-index.js"(u, l) {
        H();
        var t = Uu(), s = Yu(), i = zu(), { skipSpaces: e } = Ur();
        function n(r, o) {
          let c = null, h = o;
          for (; h !== c; )
            c = h, h = e(r, h), h = t(r, h), h = i(r, h), h = s(r, h);
          return h;
        }
        l.exports = n;
      } }), bt = X({ "src/common/util.js"(u, l) {
        H();
        var { default: t } = (Ea(), Tt(Gu)), s = cn(), { getSupportInfo: i } = fu(), e = mu(), n = qu(), { skipWhitespace: r, skipSpaces: o, skipToLineEnd: c, skipEverythingButNewLine: h } = Ur(), m = Uu(), y = zu(), p = Yu(), D = wa(), C = (R) => R[R.length - 2];
        function w(R) {
          return (O, Z, ae) => {
            let ne = ae && ae.backwards;
            if (Z === !1)
              return !1;
            let { length: he } = O, q = Z;
            for (; q >= 0 && q < he; ) {
              let Y = O.charAt(q);
              if (R instanceof RegExp) {
                if (!R.test(Y))
                  return q;
              } else if (!R.includes(Y))
                return q;
              ne ? q-- : q++;
            }
            return q === -1 || q === he ? q : !1;
          };
        }
        function P(R, O) {
          let Z = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, ae = o(R, Z.backwards ? O - 1 : O, Z), ne = p(R, ae, Z);
          return ae !== ne;
        }
        function A(R, O, Z) {
          for (let ae = O; ae < Z; ++ae)
            if (R.charAt(ae) === `
`)
              return !0;
          return !1;
        }
        function N(R, O, Z) {
          let ae = Z(O) - 1;
          ae = o(R, ae, { backwards: !0 }), ae = p(R, ae, { backwards: !0 }), ae = o(R, ae, { backwards: !0 });
          let ne = p(R, ae, { backwards: !0 });
          return ae !== ne;
        }
        function S(R, O) {
          let Z = null, ae = O;
          for (; ae !== Z; )
            Z = ae, ae = c(R, ae), ae = m(R, ae), ae = o(R, ae);
          return ae = y(R, ae), ae = p(R, ae), ae !== !1 && P(R, ae);
        }
        function j(R, O, Z) {
          return S(R, Z(O));
        }
        function k(R, O, Z) {
          return D(R, Z(O));
        }
        function J(R, O, Z) {
          return R.charAt(k(R, O, Z));
        }
        function f(R, O) {
          let Z = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return o(R, Z.backwards ? O - 1 : O, Z) !== O;
        }
        function B(R, O) {
          let Z = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0, ae = 0;
          for (let ne = Z; ne < R.length; ++ne)
            R[ne] === "	" ? ae = ae + O - ae % O : ae++;
          return ae;
        }
        function d(R, O) {
          let Z = R.lastIndexOf(`
`);
          return Z === -1 ? 0 : B(R.slice(Z + 1).match(/^[\t ]*/)[0], O);
        }
        function F(R, O) {
          let Z = { quote: '"', regex: /"/g, escaped: "&quot;" }, ae = { quote: "'", regex: /'/g, escaped: "&apos;" }, ne = O === "'" ? ae : Z, he = ne === ae ? Z : ae, q = ne;
          if (R.includes(ne.quote) || R.includes(he.quote)) {
            let Y = (R.match(ne.regex) || []).length, me = (R.match(he.regex) || []).length;
            q = Y > me ? he : ne;
          }
          return q;
        }
        function a(R, O) {
          let Z = R.slice(1, -1), ae = O.parser === "json" || O.parser === "json5" && O.quoteProps === "preserve" && !O.singleQuote ? '"' : O.__isInHtmlAttribute ? "'" : F(Z, O.singleQuote ? "'" : '"').quote;
          return g(Z, ae, !(O.parser === "css" || O.parser === "less" || O.parser === "scss" || O.__embeddedInHtml));
        }
        function g(R, O, Z) {
          let ae = O === '"' ? "'" : '"', ne = /\\(.)|(["'])/gs, he = R.replace(ne, (q, Y, me) => Y === ae ? Y : me === O ? "\\" + me : me || (Z && /^[^\n\r"'0-7\\bfnrt-vx\u2028\u2029]$/.test(Y) ? Y : "\\" + Y));
          return O + he + O;
        }
        function E(R) {
          return R.toLowerCase().replace(/^([+-]?[\d.]+e)(?:\+|(-))?0*(\d)/, "$1$2$3").replace(/^([+-]?[\d.]+)e[+-]?0+$/, "$1").replace(/^([+-])?\./, "$10.").replace(/(\.\d+?)0+(?=e|$)/, "$1").replace(/\.(?=e|$)/, "");
        }
        function b(R, O) {
          let Z = R.match(new RegExp(`(${t(O)})+`, "g"));
          return Z === null ? 0 : Z.reduce((ae, ne) => Math.max(ae, ne.length / O.length), 0);
        }
        function x(R, O) {
          let Z = R.match(new RegExp(`(${t(O)})+`, "g"));
          if (Z === null)
            return 0;
          let ae = /* @__PURE__ */ new Map(), ne = 0;
          for (let he of Z) {
            let q = he.length / O.length;
            ae.set(q, !0), q > ne && (ne = q);
          }
          for (let he = 1; he < ne; he++)
            if (!ae.get(he))
              return he;
          return ne + 1;
        }
        function T(R, O) {
          (R.comments || (R.comments = [])).push(O), O.printed = !1, O.nodeDescription = ee(R);
        }
        function I(R, O) {
          O.leading = !0, O.trailing = !1, T(R, O);
        }
        function M(R, O, Z) {
          O.leading = !1, O.trailing = !1, Z && (O.marker = Z), T(R, O);
        }
        function V(R, O) {
          O.leading = !1, O.trailing = !0, T(R, O);
        }
        function $(R, O) {
          let { languages: Z } = i({ plugins: O.plugins }), ae = Z.find((ne) => {
            let { name: he } = ne;
            return he.toLowerCase() === R;
          }) || Z.find((ne) => {
            let { aliases: he } = ne;
            return Array.isArray(he) && he.includes(R);
          }) || Z.find((ne) => {
            let { extensions: he } = ne;
            return Array.isArray(he) && he.includes(`.${R}`);
          });
          return ae && ae.parsers[0];
        }
        function U(R) {
          return R && R.type === "front-matter";
        }
        function _(R) {
          let O = /* @__PURE__ */ new WeakMap();
          return function(Z) {
            return O.has(Z) || O.set(Z, Symbol(R)), O.get(Z);
          };
        }
        function ee(R) {
          let O = R.type || R.kind || "(unknown type)", Z = String(R.name || R.id && (typeof R.id == "object" ? R.id.name : R.id) || R.key && (typeof R.key == "object" ? R.key.name : R.key) || R.value && (typeof R.value == "object" ? "" : String(R.value)) || R.operator || "");
          return Z.length > 20 && (Z = Z.slice(0, 19) + "…"), O + (Z ? " " + Z : "");
        }
        l.exports = { inferParserByLanguage: $, getStringWidth: n, getMaxContinuousCount: b, getMinNotPresentContinuousCount: x, getPenultimate: C, getLast: s, getNextNonSpaceNonCommentCharacterIndexWithStartIndex: D, getNextNonSpaceNonCommentCharacterIndex: k, getNextNonSpaceNonCommentCharacter: J, skip: w, skipWhitespace: r, skipSpaces: o, skipToLineEnd: c, skipEverythingButNewLine: h, skipInlineComment: m, skipTrailingComment: y, skipNewline: p, isNextLineEmptyAfterIndex: S, isNextLineEmpty: j, isPreviousLineEmpty: N, hasNewline: P, hasNewlineInRange: A, hasSpaces: f, getAlignmentSize: B, getIndentSize: d, getPreferredQuote: F, printString: a, printNumber: E, makeString: g, addLeadingComment: I, addDanglingComment: M, addTrailingComment: V, isFrontMatterNode: U, isNonEmptyArray: e, createGroupIdMapper: _ };
      } }), Ku = {};
      lt(Ku, { basename: () => ti, default: () => ui, delimiter: () => Cu, dirname: () => ei, extname: () => ni, isAbsolute: () => yu, join: () => Hu, normalize: () => gu, relative: () => Zu, resolve: () => zr, sep: () => Eu });
      function Qu(u, l) {
        for (var t = 0, s = u.length - 1; s >= 0; s--) {
          var i = u[s];
          i === "." ? u.splice(s, 1) : i === ".." ? (u.splice(s, 1), t++) : t && (u.splice(s, 1), t--);
        }
        if (l)
          for (; t--; t)
            u.unshift("..");
        return u;
      }
      function zr() {
        for (var u = "", l = !1, t = arguments.length - 1; t >= -1 && !l; t--) {
          var s = t >= 0 ? arguments[t] : "/";
          if (typeof s != "string")
            throw new TypeError("Arguments to path.resolve must be strings");
          s && (u = s + "/" + u, l = s.charAt(0) === "/");
        }
        return u = Qu(hu(u.split("/"), function(i) {
          return !!i;
        }), !l).join("/"), (l ? "/" : "") + u || ".";
      }
      function gu(u) {
        var l = yu(u), t = ii(u, -1) === "/";
        return u = Qu(hu(u.split("/"), function(s) {
          return !!s;
        }), !l).join("/"), !u && !l && (u = "."), u && t && (u += "/"), (l ? "/" : "") + u;
      }
      function yu(u) {
        return u.charAt(0) === "/";
      }
      function Hu() {
        var u = Array.prototype.slice.call(arguments, 0);
        return gu(hu(u, function(l, t) {
          if (typeof l != "string")
            throw new TypeError("Arguments to path.join must be strings");
          return l;
        }).join("/"));
      }
      function Zu(u, l) {
        u = zr(u).substr(1), l = zr(l).substr(1);
        function t(c) {
          for (var h = 0; h < c.length && c[h] === ""; h++)
            ;
          for (var m = c.length - 1; m >= 0 && c[m] === ""; m--)
            ;
          return h > m ? [] : c.slice(h, m - h + 1);
        }
        for (var s = t(u.split("/")), i = t(l.split("/")), e = Math.min(s.length, i.length), n = e, r = 0; r < e; r++)
          if (s[r] !== i[r]) {
            n = r;
            break;
          }
        for (var o = [], r = n; r < s.length; r++)
          o.push("..");
        return o = o.concat(i.slice(n)), o.join("/");
      }
      function ei(u) {
        var l = Yr(u), t = l[0], s = l[1];
        return !t && !s ? "." : (s && (s = s.substr(0, s.length - 1)), t + s);
      }
      function ti(u, l) {
        var t = Yr(u)[2];
        return l && t.substr(-1 * l.length) === l && (t = t.substr(0, t.length - l.length)), t;
      }
      function ni(u) {
        return Yr(u)[3];
      }
      function hu(u, l) {
        if (u.filter)
          return u.filter(l);
        for (var t = [], s = 0; s < u.length; s++)
          l(u[s], s, u) && t.push(u[s]);
        return t;
      }
      var ri, Yr, Eu, Cu, ui, ii, Na = Ze({ "node-modules-polyfills:path"() {
        H(), ri = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/, Yr = function(u) {
          return ri.exec(u).slice(1);
        }, Eu = "/", Cu = ":", ui = { extname: ni, basename: ti, dirname: ei, sep: Eu, delimiter: Cu, relative: Zu, join: Hu, isAbsolute: yu, normalize: gu, resolve: zr }, ii = "ab".substr(-1) === "b" ? function(u, l, t) {
          return u.substr(l, t);
        } : function(u, l, t) {
          return l < 0 && (l = u.length + l), u.substr(l, t);
        };
      } }), ka = X({ "node-modules-polyfills-commonjs:path"(u, l) {
        H();
        var t = (Na(), Tt(Ku));
        if (t && t.default) {
          l.exports = t.default;
          for (let s in t)
            l.exports[s] = t[s];
        } else
          t && (l.exports = t);
      } }), xr = X({ "src/common/errors.js"(u, l) {
        H();
        var t = class extends Error {
        }, s = class extends Error {
        }, i = class extends Error {
        }, e = class extends Error {
        };
        l.exports = { ConfigError: t, DebugError: s, UndefinedParserError: i, ArgExpansionBailout: e };
      } }), Vn = {};
      lt(Vn, { __assign: () => Qr, __asyncDelegator: () => Ga, __asyncGenerator: () => qa, __asyncValues: () => Wa, __await: () => Sr, __awaiter: () => Oa, __classPrivateFieldGet: () => Ya, __classPrivateFieldSet: () => Ka, __createBinding: () => $a, __decorate: () => Ia, __exportStar: () => Ra, __extends: () => Pa, __generator: () => Ma, __importDefault: () => za, __importStar: () => Ua, __makeTemplateObject: () => Xa, __metadata: () => La, __param: () => _a, __read: () => ai, __rest: () => ja, __spread: () => Va, __spreadArrays: () => Ja, __values: () => Fu });
      function Pa(u, l) {
        Kr(u, l);
        function t() {
          this.constructor = u;
        }
        u.prototype = l === null ? Object.create(l) : (t.prototype = l.prototype, new t());
      }
      function ja(u, l) {
        var t = {};
        for (var s in u)
          Object.prototype.hasOwnProperty.call(u, s) && l.indexOf(s) < 0 && (t[s] = u[s]);
        if (u != null && typeof Object.getOwnPropertySymbols == "function")
          for (var i = 0, s = Object.getOwnPropertySymbols(u); i < s.length; i++)
            l.indexOf(s[i]) < 0 && Object.prototype.propertyIsEnumerable.call(u, s[i]) && (t[s[i]] = u[s[i]]);
        return t;
      }
      function Ia(u, l, t, s) {
        var i = arguments.length, e = i < 3 ? l : s === null ? s = Object.getOwnPropertyDescriptor(l, t) : s, n;
        if (typeof Reflect == "object" && typeof Reflect.decorate == "function")
          e = Reflect.decorate(u, l, t, s);
        else
          for (var r = u.length - 1; r >= 0; r--)
            (n = u[r]) && (e = (i < 3 ? n(e) : i > 3 ? n(l, t, e) : n(l, t)) || e);
        return i > 3 && e && Object.defineProperty(l, t, e), e;
      }
      function _a(u, l) {
        return function(t, s) {
          l(t, s, u);
        };
      }
      function La(u, l) {
        if (typeof Reflect == "object" && typeof Reflect.metadata == "function")
          return Reflect.metadata(u, l);
      }
      function Oa(u, l, t, s) {
        function i(e) {
          return e instanceof t ? e : new t(function(n) {
            n(e);
          });
        }
        return new (t || (t = Promise))(function(e, n) {
          function r(h) {
            try {
              c(s.next(h));
            } catch (m) {
              n(m);
            }
          }
          function o(h) {
            try {
              c(s.throw(h));
            } catch (m) {
              n(m);
            }
          }
          function c(h) {
            h.done ? e(h.value) : i(h.value).then(r, o);
          }
          c((s = s.apply(u, l || [])).next());
        });
      }
      function Ma(u, l) {
        var t = { label: 0, sent: function() {
          if (e[0] & 1)
            throw e[1];
          return e[1];
        }, trys: [], ops: [] }, s, i, e, n;
        return n = { next: r(0), throw: r(1), return: r(2) }, typeof Symbol == "function" && (n[Symbol.iterator] = function() {
          return this;
        }), n;
        function r(c) {
          return function(h) {
            return o([c, h]);
          };
        }
        function o(c) {
          if (s)
            throw new TypeError("Generator is already executing.");
          for (; t; )
            try {
              if (s = 1, i && (e = c[0] & 2 ? i.return : c[0] ? i.throw || ((e = i.return) && e.call(i), 0) : i.next) && !(e = e.call(i, c[1])).done)
                return e;
              switch (i = 0, e && (c = [c[0] & 2, e.value]), c[0]) {
                case 0:
                case 1:
                  e = c;
                  break;
                case 4:
                  return t.label++, { value: c[1], done: !1 };
                case 5:
                  t.label++, i = c[1], c = [0];
                  continue;
                case 7:
                  c = t.ops.pop(), t.trys.pop();
                  continue;
                default:
                  if (e = t.trys, !(e = e.length > 0 && e[e.length - 1]) && (c[0] === 6 || c[0] === 2)) {
                    t = 0;
                    continue;
                  }
                  if (c[0] === 3 && (!e || c[1] > e[0] && c[1] < e[3])) {
                    t.label = c[1];
                    break;
                  }
                  if (c[0] === 6 && t.label < e[1]) {
                    t.label = e[1], e = c;
                    break;
                  }
                  if (e && t.label < e[2]) {
                    t.label = e[2], t.ops.push(c);
                    break;
                  }
                  e[2] && t.ops.pop(), t.trys.pop();
                  continue;
              }
              c = l.call(u, t);
            } catch (h) {
              c = [6, h], i = 0;
            } finally {
              s = e = 0;
            }
          if (c[0] & 5)
            throw c[1];
          return { value: c[0] ? c[1] : void 0, done: !0 };
        }
      }
      function $a(u, l, t, s) {
        s === void 0 && (s = t), u[s] = l[t];
      }
      function Ra(u, l) {
        for (var t in u)
          t !== "default" && !l.hasOwnProperty(t) && (l[t] = u[t]);
      }
      function Fu(u) {
        var l = typeof Symbol == "function" && Symbol.iterator, t = l && u[l], s = 0;
        if (t)
          return t.call(u);
        if (u && typeof u.length == "number")
          return { next: function() {
            return u && s >= u.length && (u = void 0), { value: u && u[s++], done: !u };
          } };
        throw new TypeError(l ? "Object is not iterable." : "Symbol.iterator is not defined.");
      }
      function ai(u, l) {
        var t = typeof Symbol == "function" && u[Symbol.iterator];
        if (!t)
          return u;
        var s = t.call(u), i, e = [], n;
        try {
          for (; (l === void 0 || l-- > 0) && !(i = s.next()).done; )
            e.push(i.value);
        } catch (r) {
          n = { error: r };
        } finally {
          try {
            i && !i.done && (t = s.return) && t.call(s);
          } finally {
            if (n)
              throw n.error;
          }
        }
        return e;
      }
      function Va() {
        for (var u = [], l = 0; l < arguments.length; l++)
          u = u.concat(ai(arguments[l]));
        return u;
      }
      function Ja() {
        for (var u = 0, l = 0, t = arguments.length; l < t; l++)
          u += arguments[l].length;
        for (var s = Array(u), i = 0, l = 0; l < t; l++)
          for (var e = arguments[l], n = 0, r = e.length; n < r; n++, i++)
            s[i] = e[n];
        return s;
      }
      function Sr(u) {
        return this instanceof Sr ? (this.v = u, this) : new Sr(u);
      }
      function qa(u, l, t) {
        if (!Symbol.asyncIterator)
          throw new TypeError("Symbol.asyncIterator is not defined.");
        var s = t.apply(u, l || []), i, e = [];
        return i = {}, n("next"), n("throw"), n("return"), i[Symbol.asyncIterator] = function() {
          return this;
        }, i;
        function n(y) {
          s[y] && (i[y] = function(p) {
            return new Promise(function(D, C) {
              e.push([y, p, D, C]) > 1 || r(y, p);
            });
          });
        }
        function r(y, p) {
          try {
            o(s[y](p));
          } catch (D) {
            m(e[0][3], D);
          }
        }
        function o(y) {
          y.value instanceof Sr ? Promise.resolve(y.value.v).then(c, h) : m(e[0][2], y);
        }
        function c(y) {
          r("next", y);
        }
        function h(y) {
          r("throw", y);
        }
        function m(y, p) {
          y(p), e.shift(), e.length && r(e[0][0], e[0][1]);
        }
      }
      function Ga(u) {
        var l, t;
        return l = {}, s("next"), s("throw", function(i) {
          throw i;
        }), s("return"), l[Symbol.iterator] = function() {
          return this;
        }, l;
        function s(i, e) {
          l[i] = u[i] ? function(n) {
            return (t = !t) ? { value: Sr(u[i](n)), done: i === "return" } : e ? e(n) : n;
          } : e;
        }
      }
      function Wa(u) {
        if (!Symbol.asyncIterator)
          throw new TypeError("Symbol.asyncIterator is not defined.");
        var l = u[Symbol.asyncIterator], t;
        return l ? l.call(u) : (u = typeof Fu == "function" ? Fu(u) : u[Symbol.iterator](), t = {}, s("next"), s("throw"), s("return"), t[Symbol.asyncIterator] = function() {
          return this;
        }, t);
        function s(e) {
          t[e] = u[e] && function(n) {
            return new Promise(function(r, o) {
              n = u[e](n), i(r, o, n.done, n.value);
            });
          };
        }
        function i(e, n, r, o) {
          Promise.resolve(o).then(function(c) {
            e({ value: c, done: r });
          }, n);
        }
      }
      function Xa(u, l) {
        return Object.defineProperty ? Object.defineProperty(u, "raw", { value: l }) : u.raw = l, u;
      }
      function Ua(u) {
        if (u && u.__esModule)
          return u;
        var l = {};
        if (u != null)
          for (var t in u)
            Object.hasOwnProperty.call(u, t) && (l[t] = u[t]);
        return l.default = u, l;
      }
      function za(u) {
        return u && u.__esModule ? u : { default: u };
      }
      function Ya(u, l) {
        if (!l.has(u))
          throw new TypeError("attempted to get private field on non-instance");
        return l.get(u);
      }
      function Ka(u, l, t) {
        if (!l.has(u))
          throw new TypeError("attempted to set private field on non-instance");
        return l.set(u, t), t;
      }
      var Kr, Qr, Un = Ze({ "node_modules/tslib/tslib.es6.js"() {
        H(), Kr = function(u, l) {
          return Kr = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t, s) {
            t.__proto__ = s;
          } || function(t, s) {
            for (var i in s)
              s.hasOwnProperty(i) && (t[i] = s[i]);
          }, Kr(u, l);
        }, Qr = function() {
          return Qr = Object.assign || function(u) {
            for (var l, t = 1, s = arguments.length; t < s; t++) {
              l = arguments[t];
              for (var i in l)
                Object.prototype.hasOwnProperty.call(l, i) && (u[i] = l[i]);
            }
            return u;
          }, Qr.apply(this, arguments);
        };
      } }), si = X({ "node_modules/vnopts/lib/descriptors/api.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 }), u.apiDescriptor = { key: (l) => /^[$_a-zA-Z][$_a-zA-Z0-9]*$/.test(l) ? l : JSON.stringify(l), value(l) {
          if (l === null || typeof l != "object")
            return JSON.stringify(l);
          if (Array.isArray(l))
            return `[${l.map((s) => u.apiDescriptor.value(s)).join(", ")}]`;
          let t = Object.keys(l);
          return t.length === 0 ? "{}" : `{ ${t.map((s) => `${u.apiDescriptor.key(s)}: ${u.apiDescriptor.value(l[s])}`).join(", ")} }`;
        }, pair: (l) => {
          let { key: t, value: s } = l;
          return u.apiDescriptor.value({ [t]: s });
        } };
      } }), Qa = X({ "node_modules/vnopts/lib/descriptors/index.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = (Un(), Tt(Vn));
        l.__exportStar(si(), u);
      } }), Hr = X({ "scripts/build/shims/chalk.cjs"(u, l) {
        H();
        var t = (s) => s;
        t.grey = t, t.red = t, t.bold = t, t.yellow = t, t.blue = t, t.default = t, l.exports = t;
      } }), oi = X({ "node_modules/vnopts/lib/handlers/deprecated/common.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = Hr();
        u.commonDeprecatedHandler = (t, s, i) => {
          let { descriptor: e } = i, n = [`${l.default.yellow(typeof t == "string" ? e.key(t) : e.pair(t))} is deprecated`];
          return s && n.push(`we now treat it as ${l.default.blue(typeof s == "string" ? e.key(s) : e.pair(s))}`), n.join("; ") + ".";
        };
      } }), Ha = X({ "node_modules/vnopts/lib/handlers/deprecated/index.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = (Un(), Tt(Vn));
        l.__exportStar(oi(), u);
      } }), Za = X({ "node_modules/vnopts/lib/handlers/invalid/common.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = Hr();
        u.commonInvalidHandler = (t, s, i) => [`Invalid ${l.default.red(i.descriptor.key(t))} value.`, `Expected ${l.default.blue(i.schemas[t].expected(i))},`, `but received ${l.default.red(i.descriptor.value(s))}.`].join(" ");
      } }), li = X({ "node_modules/vnopts/lib/handlers/invalid/index.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = (Un(), Tt(Vn));
        l.__exportStar(Za(), u);
      } }), es = X({ "node_modules/vnopts/node_modules/leven/index.js"(u, l) {
        H();
        var t = [], s = [];
        l.exports = function(i, e) {
          if (i === e)
            return 0;
          var n = i;
          i.length > e.length && (i = e, e = n);
          var r = i.length, o = e.length;
          if (r === 0)
            return o;
          if (o === 0)
            return r;
          for (; r > 0 && i.charCodeAt(~-r) === e.charCodeAt(~-o); )
            r--, o--;
          if (r === 0)
            return o;
          for (var c = 0; c < r && i.charCodeAt(c) === e.charCodeAt(c); )
            c++;
          if (r -= c, o -= c, r === 0)
            return o;
          for (var h, m, y, p, D = 0, C = 0; D < r; )
            s[c + D] = i.charCodeAt(c + D), t[D] = ++D;
          for (; C < o; )
            for (h = e.charCodeAt(c + C), y = C++, m = C, D = 0; D < r; D++)
              p = h === s[c + D] ? y : y + 1, y = t[D], m = t[D] = y > m ? p > m ? m + 1 : p : p > y ? y + 1 : p;
          return m;
        };
      } }), pi = X({ "node_modules/vnopts/lib/handlers/unknown/leven.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = Hr(), t = es();
        u.levenUnknownHandler = (s, i, e) => {
          let { descriptor: n, logger: r, schemas: o } = e, c = [`Ignored unknown option ${l.default.yellow(n.pair({ key: s, value: i }))}.`], h = Object.keys(o).sort().find((m) => t(s, m) < 3);
          h && c.push(`Did you mean ${l.default.blue(n.key(h))}?`), r.warn(c.join(" "));
        };
      } }), ts = X({ "node_modules/vnopts/lib/handlers/unknown/index.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = (Un(), Tt(Vn));
        l.__exportStar(pi(), u);
      } }), ns = X({ "node_modules/vnopts/lib/handlers/index.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = (Un(), Tt(Vn));
        l.__exportStar(Ha(), u), l.__exportStar(li(), u), l.__exportStar(ts(), u);
      } }), zn = X({ "node_modules/vnopts/lib/schema.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = ["default", "expected", "validate", "deprecated", "forward", "redirect", "overlap", "preprocess", "postprocess"];
        function t(e, n) {
          let r = new e(n), o = Object.create(r);
          for (let c of l)
            c in n && (o[c] = i(n[c], r, s.prototype[c].length));
          return o;
        }
        u.createSchema = t;
        var s = class {
          constructor(e) {
            this.name = e.name;
          }
          static create(e) {
            return t(this, e);
          }
          default(e) {
          }
          expected(e) {
            return "nothing";
          }
          validate(e, n) {
            return !1;
          }
          deprecated(e, n) {
            return !1;
          }
          forward(e, n) {
          }
          redirect(e, n) {
          }
          overlap(e, n, r) {
            return e;
          }
          preprocess(e, n) {
            return e;
          }
          postprocess(e, n) {
            return e;
          }
        };
        u.Schema = s;
        function i(e, n, r) {
          return typeof e == "function" ? function() {
            for (var o = arguments.length, c = new Array(o), h = 0; h < o; h++)
              c[h] = arguments[h];
            return e(...c.slice(0, r - 1), n, ...c.slice(r - 1));
          } : () => e;
        }
      } }), rs = X({ "node_modules/vnopts/lib/schemas/alias.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = zn(), t = class extends l.Schema {
          constructor(s) {
            super(s), this._sourceName = s.sourceName;
          }
          expected(s) {
            return s.schemas[this._sourceName].expected(s);
          }
          validate(s, i) {
            return i.schemas[this._sourceName].validate(s, i);
          }
          redirect(s, i) {
            return this._sourceName;
          }
        };
        u.AliasSchema = t;
      } }), us = X({ "node_modules/vnopts/lib/schemas/any.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = zn(), t = class extends l.Schema {
          expected() {
            return "anything";
          }
          validate() {
            return !0;
          }
        };
        u.AnySchema = t;
      } }), is = X({ "node_modules/vnopts/lib/schemas/array.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = (Un(), Tt(Vn)), t = zn(), s = class extends t.Schema {
          constructor(e) {
            var { valueSchema: n, name: r = n.name } = e, o = l.__rest(e, ["valueSchema", "name"]);
            super(Object.assign({}, o, { name: r })), this._valueSchema = n;
          }
          expected(e) {
            return `an array of ${this._valueSchema.expected(e)}`;
          }
          validate(e, n) {
            if (!Array.isArray(e))
              return !1;
            let r = [];
            for (let o of e) {
              let c = n.normalizeValidateResult(this._valueSchema.validate(o, n), o);
              c !== !0 && r.push(c.value);
            }
            return r.length === 0 ? !0 : { value: r };
          }
          deprecated(e, n) {
            let r = [];
            for (let o of e) {
              let c = n.normalizeDeprecatedResult(this._valueSchema.deprecated(o, n), o);
              c !== !1 && r.push(...c.map((h) => {
                let { value: m } = h;
                return { value: [m] };
              }));
            }
            return r;
          }
          forward(e, n) {
            let r = [];
            for (let o of e) {
              let c = n.normalizeForwardResult(this._valueSchema.forward(o, n), o);
              r.push(...c.map(i));
            }
            return r;
          }
          redirect(e, n) {
            let r = [], o = [];
            for (let c of e) {
              let h = n.normalizeRedirectResult(this._valueSchema.redirect(c, n), c);
              "remain" in h && r.push(h.remain), o.push(...h.redirect.map(i));
            }
            return r.length === 0 ? { redirect: o } : { redirect: o, remain: r };
          }
          overlap(e, n) {
            return e.concat(n);
          }
        };
        u.ArraySchema = s;
        function i(e) {
          let { from: n, to: r } = e;
          return { from: [n], to: r };
        }
      } }), as = X({ "node_modules/vnopts/lib/schemas/boolean.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = zn(), t = class extends l.Schema {
          expected() {
            return "true or false";
          }
          validate(s) {
            return typeof s == "boolean";
          }
        };
        u.BooleanSchema = t;
      } }), Au = X({ "node_modules/vnopts/lib/utils.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        function l(p, D) {
          let C = /* @__PURE__ */ Object.create(null);
          for (let w of p) {
            let P = w[D];
            if (C[P])
              throw new Error(`Duplicate ${D} ${JSON.stringify(P)}`);
            C[P] = w;
          }
          return C;
        }
        u.recordFromArray = l;
        function t(p, D) {
          let C = /* @__PURE__ */ new Map();
          for (let w of p) {
            let P = w[D];
            if (C.has(P))
              throw new Error(`Duplicate ${D} ${JSON.stringify(P)}`);
            C.set(P, w);
          }
          return C;
        }
        u.mapFromArray = t;
        function s() {
          let p = /* @__PURE__ */ Object.create(null);
          return (D) => {
            let C = JSON.stringify(D);
            return p[C] ? !0 : (p[C] = !0, !1);
          };
        }
        u.createAutoChecklist = s;
        function i(p, D) {
          let C = [], w = [];
          for (let P of p)
            D(P) ? C.push(P) : w.push(P);
          return [C, w];
        }
        u.partition = i;
        function e(p) {
          return p === Math.floor(p);
        }
        u.isInt = e;
        function n(p, D) {
          if (p === D)
            return 0;
          let C = typeof p, w = typeof D, P = ["undefined", "object", "boolean", "number", "string"];
          return C !== w ? P.indexOf(C) - P.indexOf(w) : C !== "string" ? Number(p) - Number(D) : p.localeCompare(D);
        }
        u.comparePrimitive = n;
        function r(p) {
          return p === void 0 ? {} : p;
        }
        u.normalizeDefaultResult = r;
        function o(p, D) {
          return p === !0 ? !0 : p === !1 ? { value: D } : p;
        }
        u.normalizeValidateResult = o;
        function c(p, D) {
          let C = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !1;
          return p === !1 ? !1 : p === !0 ? C ? !0 : [{ value: D }] : "value" in p ? [p] : p.length === 0 ? !1 : p;
        }
        u.normalizeDeprecatedResult = c;
        function h(p, D) {
          return typeof p == "string" || "key" in p ? { from: D, to: p } : "from" in p ? { from: p.from, to: p.to } : { from: D, to: p.to };
        }
        u.normalizeTransferResult = h;
        function m(p, D) {
          return p === void 0 ? [] : Array.isArray(p) ? p.map((C) => h(C, D)) : [h(p, D)];
        }
        u.normalizeForwardResult = m;
        function y(p, D) {
          let C = m(typeof p == "object" && "redirect" in p ? p.redirect : p, D);
          return C.length === 0 ? { remain: D, redirect: C } : typeof p == "object" && "remain" in p ? { remain: p.remain, redirect: C } : { redirect: C };
        }
        u.normalizeRedirectResult = y;
      } }), ss = X({ "node_modules/vnopts/lib/schemas/choice.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = zn(), t = Au(), s = class extends l.Schema {
          constructor(i) {
            super(i), this._choices = t.mapFromArray(i.choices.map((e) => e && typeof e == "object" ? e : { value: e }), "value");
          }
          expected(i) {
            let { descriptor: e } = i, n = Array.from(this._choices.keys()).map((c) => this._choices.get(c)).filter((c) => !c.deprecated).map((c) => c.value).sort(t.comparePrimitive).map(e.value), r = n.slice(0, -2), o = n.slice(-2);
            return r.concat(o.join(" or ")).join(", ");
          }
          validate(i) {
            return this._choices.has(i);
          }
          deprecated(i) {
            let e = this._choices.get(i);
            return e && e.deprecated ? { value: i } : !1;
          }
          forward(i) {
            let e = this._choices.get(i);
            return e ? e.forward : void 0;
          }
          redirect(i) {
            let e = this._choices.get(i);
            return e ? e.redirect : void 0;
          }
        };
        u.ChoiceSchema = s;
      } }), ci = X({ "node_modules/vnopts/lib/schemas/number.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = zn(), t = class extends l.Schema {
          expected() {
            return "a number";
          }
          validate(s, i) {
            return typeof s == "number";
          }
        };
        u.NumberSchema = t;
      } }), os = X({ "node_modules/vnopts/lib/schemas/integer.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = Au(), t = ci(), s = class extends t.NumberSchema {
          expected() {
            return "an integer";
          }
          validate(i, e) {
            return e.normalizeValidateResult(super.validate(i, e), i) === !0 && l.isInt(i);
          }
        };
        u.IntegerSchema = s;
      } }), ls = X({ "node_modules/vnopts/lib/schemas/string.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = zn(), t = class extends l.Schema {
          expected() {
            return "a string";
          }
          validate(s) {
            return typeof s == "string";
          }
        };
        u.StringSchema = t;
      } }), ps = X({ "node_modules/vnopts/lib/schemas/index.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = (Un(), Tt(Vn));
        l.__exportStar(rs(), u), l.__exportStar(us(), u), l.__exportStar(is(), u), l.__exportStar(as(), u), l.__exportStar(ss(), u), l.__exportStar(os(), u), l.__exportStar(ci(), u), l.__exportStar(ls(), u);
      } }), cs = X({ "node_modules/vnopts/lib/defaults.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = si(), t = oi(), s = li(), i = pi();
        u.defaultDescriptor = l.apiDescriptor, u.defaultUnknownHandler = i.levenUnknownHandler, u.defaultInvalidHandler = s.commonInvalidHandler, u.defaultDeprecatedHandler = t.commonDeprecatedHandler;
      } }), Ds = X({ "node_modules/vnopts/lib/normalize.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = cs(), t = Au();
        u.normalize = (i, e, n) => new s(e, n).normalize(i);
        var s = class {
          constructor(i, e) {
            let { logger: n = console, descriptor: r = l.defaultDescriptor, unknown: o = l.defaultUnknownHandler, invalid: c = l.defaultInvalidHandler, deprecated: h = l.defaultDeprecatedHandler } = e || {};
            this._utils = { descriptor: r, logger: n || { warn: () => {
            } }, schemas: t.recordFromArray(i, "name"), normalizeDefaultResult: t.normalizeDefaultResult, normalizeDeprecatedResult: t.normalizeDeprecatedResult, normalizeForwardResult: t.normalizeForwardResult, normalizeRedirectResult: t.normalizeRedirectResult, normalizeValidateResult: t.normalizeValidateResult }, this._unknownHandler = o, this._invalidHandler = c, this._deprecatedHandler = h, this.cleanHistory();
          }
          cleanHistory() {
            this._hasDeprecationWarned = t.createAutoChecklist();
          }
          normalize(i) {
            let e = {}, n = [i], r = () => {
              for (; n.length !== 0; ) {
                let o = n.shift(), c = this._applyNormalization(o, e);
                n.push(...c);
              }
            };
            r();
            for (let o of Object.keys(this._utils.schemas)) {
              let c = this._utils.schemas[o];
              if (!(o in e)) {
                let h = t.normalizeDefaultResult(c.default(this._utils));
                "value" in h && n.push({ [o]: h.value });
              }
            }
            r();
            for (let o of Object.keys(this._utils.schemas)) {
              let c = this._utils.schemas[o];
              o in e && (e[o] = c.postprocess(e[o], this._utils));
            }
            return e;
          }
          _applyNormalization(i, e) {
            let n = [], [r, o] = t.partition(Object.keys(i), (c) => c in this._utils.schemas);
            for (let c of r) {
              let h = this._utils.schemas[c], m = h.preprocess(i[c], this._utils), y = t.normalizeValidateResult(h.validate(m, this._utils), m);
              if (y !== !0) {
                let { value: w } = y, P = this._invalidHandler(c, w, this._utils);
                throw typeof P == "string" ? new Error(P) : P;
              }
              let p = (w) => {
                let { from: P, to: A } = w;
                n.push(typeof A == "string" ? { [A]: P } : { [A.key]: A.value });
              }, D = (w) => {
                let { value: P, redirectTo: A } = w, N = t.normalizeDeprecatedResult(h.deprecated(P, this._utils), m, !0);
                if (N !== !1)
                  if (N === !0)
                    this._hasDeprecationWarned(c) || this._utils.logger.warn(this._deprecatedHandler(c, A, this._utils));
                  else
                    for (let { value: S } of N) {
                      let j = { key: c, value: S };
                      if (!this._hasDeprecationWarned(j)) {
                        let k = typeof A == "string" ? { key: A, value: S } : A;
                        this._utils.logger.warn(this._deprecatedHandler(j, k, this._utils));
                      }
                    }
              };
              t.normalizeForwardResult(h.forward(m, this._utils), m).forEach(p);
              let C = t.normalizeRedirectResult(h.redirect(m, this._utils), m);
              if (C.redirect.forEach(p), "remain" in C) {
                let w = C.remain;
                e[c] = c in e ? h.overlap(e[c], w, this._utils) : w, D({ value: w });
              }
              for (let { from: w, to: P } of C.redirect)
                D({ value: w, redirectTo: P });
            }
            for (let c of o) {
              let h = i[c], m = this._unknownHandler(c, h, this._utils);
              if (m)
                for (let y of Object.keys(m)) {
                  let p = { [y]: m[y] };
                  y in this._utils.schemas ? n.push(p) : Object.assign(e, p);
                }
            }
            return n;
          }
        };
        u.Normalizer = s;
      } }), ds = X({ "node_modules/vnopts/lib/index.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = (Un(), Tt(Vn));
        l.__exportStar(Qa(), u), l.__exportStar(ns(), u), l.__exportStar(ps(), u), l.__exportStar(Ds(), u), l.__exportStar(zn(), u);
      } }), fs = X({ "src/main/options-normalizer.js"(u, l) {
        H();
        var t = ds(), s = cn(), i = { key: (y) => y.length === 1 ? `-${y}` : `--${y}`, value: (y) => t.apiDescriptor.value(y), pair: (y) => {
          let { key: p, value: D } = y;
          return D === !1 ? `--no-${p}` : D === !0 ? i.key(p) : D === "" ? `${i.key(p)} without an argument` : `${i.key(p)}=${D}`;
        } }, e = (y) => {
          let { colorsModule: p, levenshteinDistance: D } = y;
          return class extends t.ChoiceSchema {
            constructor(C) {
              let { name: w, flags: P } = C;
              super({ name: w, choices: P }), this._flags = [...P].sort();
            }
            preprocess(C, w) {
              if (typeof C == "string" && C.length > 0 && !this._flags.includes(C)) {
                let P = this._flags.find((A) => D(A, C) < 3);
                if (P)
                  return w.logger.warn([`Unknown flag ${p.yellow(w.descriptor.value(C))},`, `did you mean ${p.blue(w.descriptor.value(P))}?`].join(" ")), P;
              }
              return C;
            }
            expected() {
              return "a flag";
            }
          };
        }, n;
        function r(y, p) {
          let { logger: D = !1, isCLI: C = !1, passThrough: w = !1, colorsModule: P = null, levenshteinDistance: A = null } = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, N = w ? Array.isArray(w) ? (B, d) => w.includes(B) ? { [B]: d } : void 0 : (B, d) => ({ [B]: d }) : (B, d, F) => {
            let a = F.schemas, g = Ae(a, de);
            return t.levenUnknownHandler(B, d, Object.assign(Object.assign({}, F), {}, { schemas: g }));
          }, S = C ? i : t.apiDescriptor, j = o(p, { isCLI: C, colorsModule: P, levenshteinDistance: A }), k = new t.Normalizer(j, { logger: D, unknown: N, descriptor: S }), J = D !== !1;
          J && n && (k._hasDeprecationWarned = n);
          let f = k.normalize(y);
          return J && (n = k._hasDeprecationWarned), C && f["plugin-search"] === !1 && (f["plugin-search-dir"] = !1), f;
        }
        function o(y, p) {
          let { isCLI: D, colorsModule: C, levenshteinDistance: w } = p, P = [];
          D && P.push(t.AnySchema.create({ name: "_" }));
          for (let A of y)
            P.push(c(A, { isCLI: D, optionInfos: y, colorsModule: C, levenshteinDistance: w })), A.alias && D && P.push(t.AliasSchema.create({ name: A.alias, sourceName: A.name }));
          return P;
        }
        function c(y, p) {
          let { isCLI: D, optionInfos: C, colorsModule: w, levenshteinDistance: P } = p, { name: A } = y;
          if (A === "plugin-search-dir" || A === "pluginSearchDirs")
            return t.AnySchema.create({ name: A, preprocess(k) {
              return k === !1 || (k = Array.isArray(k) ? k : [k]), k;
            }, validate(k) {
              return k === !1 ? !0 : k.every((J) => typeof J == "string");
            }, expected() {
              return "false or paths to plugin search dir";
            } });
          let N = { name: A }, S, j = {};
          switch (y.type) {
            case "int":
              S = t.IntegerSchema, D && (N.preprocess = Number);
              break;
            case "string":
              S = t.StringSchema;
              break;
            case "choice":
              S = t.ChoiceSchema, N.choices = y.choices.map((k) => typeof k == "object" && k.redirect ? Object.assign(Object.assign({}, k), {}, { redirect: { to: { key: y.name, value: k.redirect } } }) : k);
              break;
            case "boolean":
              S = t.BooleanSchema;
              break;
            case "flag":
              S = e({ colorsModule: w, levenshteinDistance: P }), N.flags = C.flatMap((k) => [k.alias, k.description && k.name, k.oppositeDescription && `no-${k.name}`].filter(Boolean));
              break;
            case "path":
              S = t.StringSchema;
              break;
            default:
              throw new Error(`Unexpected type ${y.type}`);
          }
          if (y.exception ? N.validate = (k, J, f) => y.exception(k) || J.validate(k, f) : N.validate = (k, J, f) => k === void 0 || J.validate(k, f), y.redirect && (j.redirect = (k) => k ? { to: { key: y.redirect.option, value: y.redirect.value } } : void 0), y.deprecated && (j.deprecated = !0), D && !y.array) {
            let k = N.preprocess || ((J) => J);
            N.preprocess = (J, f, B) => f.preprocess(k(Array.isArray(J) ? s(J) : J), B);
          }
          return y.array ? t.ArraySchema.create(Object.assign(Object.assign(Object.assign({}, D ? { preprocess: (k) => Array.isArray(k) ? k : [k] } : {}), j), {}, { valueSchema: S.create(N) })) : S.create(Object.assign(Object.assign({}, N), j));
        }
        function h(y, p, D) {
          return r(y, p, D);
        }
        function m(y, p, D) {
          return r(y, p, Object.assign({ isCLI: !0 }, D));
        }
        l.exports = { normalizeApiOptions: h, normalizeCliOptions: m };
      } }), yn = X({ "src/language-js/loc.js"(u, l) {
        H();
        var t = mu();
        function s(o) {
          var c, h;
          let m = o.range ? o.range[0] : o.start, y = (c = (h = o.declaration) === null || h === void 0 ? void 0 : h.decorators) !== null && c !== void 0 ? c : o.decorators;
          return t(y) ? Math.min(s(y[0]), m) : m;
        }
        function i(o) {
          return o.range ? o.range[1] : o.end;
        }
        function e(o, c) {
          let h = s(o);
          return Number.isInteger(h) && h === s(c);
        }
        function n(o, c) {
          let h = i(o);
          return Number.isInteger(h) && h === i(c);
        }
        function r(o, c) {
          return e(o, c) && n(o, c);
        }
        l.exports = { locStart: s, locEnd: i, hasSameLocStart: e, hasSameLoc: r };
      } }), ms = X({ "src/main/load-parser.js"(u, l) {
        H(), l.exports = () => {
        };
      } }), gs = X({ "scripts/build/shims/babel-highlight.cjs"(u, l) {
        H();
        var t = Hr(), s = { shouldHighlight: () => !1, getChalk: () => t };
        l.exports = s;
      } }), ys = X({ "node_modules/@babel/code-frame/lib/index.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 }), u.codeFrameColumns = n, u.default = r;
        var l = gs(), t = !1;
        function s(o) {
          return { gutter: o.grey, marker: o.red.bold, message: o.red.bold };
        }
        var i = /\r\n|[\n\r\u2028\u2029]/;
        function e(o, c, h) {
          let m = Object.assign({ column: 0, line: -1 }, o.start), y = Object.assign({}, m, o.end), { linesAbove: p = 2, linesBelow: D = 3 } = h || {}, C = m.line, w = m.column, P = y.line, A = y.column, N = Math.max(C - (p + 1), 0), S = Math.min(c.length, P + D);
          C === -1 && (N = 0), P === -1 && (S = c.length);
          let j = P - C, k = {};
          if (j)
            for (let J = 0; J <= j; J++) {
              let f = J + C;
              if (!w)
                k[f] = !0;
              else if (J === 0) {
                let B = c[f - 1].length;
                k[f] = [w, B - w + 1];
              } else if (J === j)
                k[f] = [0, A];
              else {
                let B = c[f - J].length;
                k[f] = [0, B];
              }
            }
          else
            w === A ? w ? k[C] = [w, 0] : k[C] = !0 : k[C] = [w, A - w];
          return { start: N, end: S, markerLines: k };
        }
        function n(o, c) {
          let h = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, m = (h.highlightCode || h.forceColor) && (0, l.shouldHighlight)(h), y = (0, l.getChalk)(h), p = s(y), D = (k, J) => m ? k(J) : J, C = o.split(i), { start: w, end: P, markerLines: A } = e(c, C, h), N = c.start && typeof c.start.column == "number", S = String(P).length, j = (m ? (0, l.default)(o, h) : o).split(i, P).slice(w, P).map((k, J) => {
            let f = w + 1 + J, B = ` ${` ${f}`.slice(-S)} |`, d = A[f], F = !A[f + 1];
            if (d) {
              let a = "";
              if (Array.isArray(d)) {
                let g = k.slice(0, Math.max(d[0] - 1, 0)).replace(/[^\t]/g, " "), E = d[1] || 1;
                a = [`
 `, D(p.gutter, B.replace(/\d/g, " ")), " ", g, D(p.marker, "^").repeat(E)].join(""), F && h.message && (a += " " + D(p.message, h.message));
              }
              return [D(p.marker, ">"), D(p.gutter, B), k.length > 0 ? ` ${k}` : "", a].join("");
            } else
              return ` ${D(p.gutter, B)}${k.length > 0 ? ` ${k}` : ""}`;
          }).join(`
`);
          return h.message && !N && (j = `${" ".repeat(S + 1)}${h.message}
${j}`), m ? y.reset(j) : j;
        }
        function r(o, c, h) {
          let m = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {};
          if (!t) {
            t = !0;
            let y = "Passing lineNumber and colNumber is deprecated to @babel/code-frame. Please use `codeFrameColumns`.";
            if (Kt.emitWarning)
              Kt.emitWarning(y, "DeprecationWarning");
            else {
              let p = new Error(y);
              p.name = "DeprecationWarning", console.warn(new Error(y));
            }
          }
          return h = Math.max(h, 0), n(o, { start: { column: h, line: c } }, m);
        }
      } }), vu = X({ "src/main/parser.js"(u, l) {
        H();
        var { ConfigError: t } = xr(), s = yn();
        ms();
        var { locStart: i, locEnd: e } = s, n = Object.getOwnPropertyNames, r = Object.getOwnPropertyDescriptor;
        function o(m) {
          let y = {};
          for (let p of m.plugins)
            if (p.parsers)
              for (let D of n(p.parsers))
                Object.defineProperty(y, D, r(p.parsers, D));
          return y;
        }
        function c(m) {
          let y = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : o(m);
          if (typeof m.parser == "function")
            return { parse: m.parser, astFormat: "estree", locStart: i, locEnd: e };
          if (typeof m.parser == "string") {
            if (Object.prototype.hasOwnProperty.call(y, m.parser))
              return y[m.parser];
            throw new t(`Couldn't resolve parser "${m.parser}". Parsers must be explicitly added to the standalone bundle.`);
          }
        }
        function h(m, y) {
          let p = o(y), D = Object.defineProperties({}, Object.fromEntries(Object.keys(p).map((w) => [w, { enumerable: !0, get() {
            return p[w].parse;
          } }]))), C = c(y, p);
          try {
            return C.preprocess && (m = C.preprocess(m, y)), { text: m, ast: C.parse(m, D, y) };
          } catch (w) {
            let { loc: P } = w;
            if (P) {
              let { codeFrameColumns: A } = ys();
              throw w.codeFrame = A(m, P, { highlightCode: !0 }), w.message += `
` + w.codeFrame, w;
            }
            throw w;
          }
        }
        l.exports = { parse: h, resolveParser: c };
      } }), Di = X({ "src/main/options.js"(u, l) {
        H();
        var t = ka(), { UndefinedParserError: s } = xr(), { getSupportInfo: i } = fu(), e = fs(), { resolveParser: n } = vu(), r = { astFormat: "estree", printer: {}, originalText: void 0, locStart: null, locEnd: null };
        function o(m) {
          let y = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, p = Object.assign({}, m), D = i({ plugins: m.plugins, showUnreleased: !0, showDeprecated: !0 }).options, C = Object.assign(Object.assign({}, r), Object.fromEntries(D.filter((S) => S.default !== void 0).map((S) => [S.name, S.default])));
          if (!p.parser) {
            if (!p.filepath)
              (y.logger || console).warn("No parser and no filepath given, using 'babel' the parser now but this will throw an error in the future. Please specify a parser or a filepath so one can be inferred."), p.parser = "babel";
            else if (p.parser = h(p.filepath, p.plugins), !p.parser)
              throw new s(`No parser could be inferred for file: ${p.filepath}`);
          }
          let w = n(e.normalizeApiOptions(p, [D.find((S) => S.name === "parser")], { passThrough: !0, logger: !1 }));
          p.astFormat = w.astFormat, p.locEnd = w.locEnd, p.locStart = w.locStart;
          let P = c(p);
          p.printer = P.printers[p.astFormat];
          let A = Object.fromEntries(D.filter((S) => S.pluginDefaults && S.pluginDefaults[P.name] !== void 0).map((S) => [S.name, S.pluginDefaults[P.name]])), N = Object.assign(Object.assign({}, C), A);
          for (let [S, j] of Object.entries(N))
            (p[S] === null || p[S] === void 0) && (p[S] = j);
          return p.parser === "json" && (p.trailingComma = "none"), e.normalizeApiOptions(p, D, Object.assign({ passThrough: Object.keys(r) }, y));
        }
        function c(m) {
          let { astFormat: y } = m;
          if (!y)
            throw new Error("getPlugin() requires astFormat to be set");
          let p = m.plugins.find((D) => D.printers && D.printers[y]);
          if (!p)
            throw new Error(`Couldn't find plugin for AST format "${y}"`);
          return p;
        }
        function h(m, y) {
          let p = t.basename(m).toLowerCase(), D = i({ plugins: y }).languages.filter((C) => C.since !== null).find((C) => C.extensions && C.extensions.some((w) => p.endsWith(w)) || C.filenames && C.filenames.some((w) => w.toLowerCase() === p));
          return D && D.parsers[0];
        }
        l.exports = { normalize: o, hiddenDefaults: r, inferParser: h };
      } }), hs = X({ "src/main/massage-ast.js"(u, l) {
        H();
        function t(s, i, e) {
          if (Array.isArray(s))
            return s.map((c) => t(c, i, e)).filter(Boolean);
          if (!s || typeof s != "object")
            return s;
          let n = i.printer.massageAstNode, r;
          n && n.ignoredProperties ? r = n.ignoredProperties : r = /* @__PURE__ */ new Set();
          let o = {};
          for (let [c, h] of Object.entries(s))
            !r.has(c) && typeof h != "function" && (o[c] = t(h, i, s));
          if (n) {
            let c = n(s, o, e);
            if (c === null)
              return;
            if (c)
              return c;
          }
          return o;
        }
        l.exports = t;
      } }), Br = X({ "scripts/build/shims/assert.cjs"(u, l) {
        H();
        var t = () => {
        };
        t.ok = t, t.strictEqual = t, l.exports = t;
      } }), an = X({ "src/main/comments.js"(u, l) {
        H();
        var t = Br(), { builders: { line: s, hardline: i, breakParent: e, indent: n, lineSuffix: r, join: o, cursor: c } } = pt(), { hasNewline: h, skipNewline: m, skipSpaces: y, isPreviousLineEmpty: p, addLeadingComment: D, addDanglingComment: C, addTrailingComment: w } = bt(), P = /* @__PURE__ */ new WeakMap();
        function A(I, M, V) {
          if (!I)
            return;
          let { printer: $, locStart: U, locEnd: _ } = M;
          if (V) {
            if ($.canAttachComment && $.canAttachComment(I)) {
              let R;
              for (R = V.length - 1; R >= 0 && !(U(V[R]) <= U(I) && _(V[R]) <= _(I)); --R)
                ;
              V.splice(R + 1, 0, I);
              return;
            }
          } else if (P.has(I))
            return P.get(I);
          let ee = $.getCommentChildNodes && $.getCommentChildNodes(I, M) || typeof I == "object" && Object.entries(I).filter((R) => {
            let [O] = R;
            return O !== "enclosingNode" && O !== "precedingNode" && O !== "followingNode" && O !== "tokens" && O !== "comments" && O !== "parent";
          }).map((R) => {
            let [, O] = R;
            return O;
          });
          if (ee) {
            V || (V = [], P.set(I, V));
            for (let R of ee)
              A(R, M, V);
            return V;
          }
        }
        function N(I, M, V, $) {
          let { locStart: U, locEnd: _ } = V, ee = U(M), R = _(M), O = A(I, V), Z, ae, ne = 0, he = O.length;
          for (; ne < he; ) {
            let q = ne + he >> 1, Y = O[q], me = U(Y), ge = _(Y);
            if (me <= ee && R <= ge)
              return N(Y, M, V, Y);
            if (ge <= ee) {
              Z = Y, ne = q + 1;
              continue;
            }
            if (R <= me) {
              ae = Y, he = q;
              continue;
            }
            throw new Error("Comment location overlaps with node location");
          }
          if ($ && $.type === "TemplateLiteral") {
            let { quasis: q } = $, Y = F(q, M, V);
            Z && F(q, Z, V) !== Y && (Z = null), ae && F(q, ae, V) !== Y && (ae = null);
          }
          return { enclosingNode: $, precedingNode: Z, followingNode: ae };
        }
        var S = () => !1;
        function j(I, M, V, $) {
          if (!Array.isArray(I))
            return;
          let U = [], { locStart: _, locEnd: ee, printer: { handleComments: R = {} } } = $, { avoidAstMutation: O, ownLine: Z = S, endOfLine: ae = S, remaining: ne = S } = R, he = I.map((q, Y) => Object.assign(Object.assign({}, N(M, q, $)), {}, { comment: q, text: V, options: $, ast: M, isLastComment: I.length - 1 === Y }));
          for (let [q, Y] of he.entries()) {
            let { comment: me, precedingNode: ge, enclosingNode: _e, followingNode: Q, text: W, options: re, ast: ue, isLastComment: Ce } = Y;
            if (re.parser === "json" || re.parser === "json5" || re.parser === "__js_expression" || re.parser === "__vue_expression" || re.parser === "__vue_ts_expression") {
              if (_(me) - _(ue) <= 0) {
                D(ue, me);
                continue;
              }
              if (ee(me) - ee(ue) >= 0) {
                w(ue, me);
                continue;
              }
            }
            let be;
            if (O ? be = [Y] : (me.enclosingNode = _e, me.precedingNode = ge, me.followingNode = Q, be = [me, W, re, ue, Ce]), J(W, re, he, q))
              me.placement = "ownLine", Z(...be) || (Q ? D(Q, me) : ge ? w(ge, me) : C(_e || ue, me));
            else if (f(W, re, he, q))
              me.placement = "endOfLine", ae(...be) || (ge ? w(ge, me) : Q ? D(Q, me) : C(_e || ue, me));
            else if (me.placement = "remaining", !ne(...be))
              if (ge && Q) {
                let Be = U.length;
                Be > 0 && U[Be - 1].followingNode !== Q && B(U, W, re), U.push(Y);
              } else
                ge ? w(ge, me) : Q ? D(Q, me) : C(_e || ue, me);
          }
          if (B(U, V, $), !O)
            for (let q of I)
              delete q.precedingNode, delete q.enclosingNode, delete q.followingNode;
        }
        var k = (I) => !/[\S\n\u2028\u2029]/.test(I);
        function J(I, M, V, $) {
          let { comment: U, precedingNode: _ } = V[$], { locStart: ee, locEnd: R } = M, O = ee(U);
          if (_)
            for (let Z = $ - 1; Z >= 0; Z--) {
              let { comment: ae, precedingNode: ne } = V[Z];
              if (ne !== _ || !k(I.slice(R(ae), O)))
                break;
              O = ee(ae);
            }
          return h(I, O, { backwards: !0 });
        }
        function f(I, M, V, $) {
          let { comment: U, followingNode: _ } = V[$], { locStart: ee, locEnd: R } = M, O = R(U);
          if (_)
            for (let Z = $ + 1; Z < V.length; Z++) {
              let { comment: ae, followingNode: ne } = V[Z];
              if (ne !== _ || !k(I.slice(O, ee(ae))))
                break;
              O = R(ae);
            }
          return h(I, O);
        }
        function B(I, M, V) {
          let $ = I.length;
          if ($ === 0)
            return;
          let { precedingNode: U, followingNode: _, enclosingNode: ee } = I[0], R = V.printer.getGapRegex && V.printer.getGapRegex(ee) || /^[\s(]*$/, O = V.locStart(_), Z;
          for (Z = $; Z > 0; --Z) {
            let { comment: ae, precedingNode: ne, followingNode: he } = I[Z - 1];
            t.strictEqual(ne, U), t.strictEqual(he, _);
            let q = M.slice(V.locEnd(ae), O);
            if (R.test(q))
              O = V.locStart(ae);
            else
              break;
          }
          for (let [ae, { comment: ne }] of I.entries())
            ae < Z ? w(U, ne) : D(_, ne);
          for (let ae of [U, _])
            ae.comments && ae.comments.length > 1 && ae.comments.sort((ne, he) => V.locStart(ne) - V.locStart(he));
          I.length = 0;
        }
        function d(I, M) {
          let V = I.getValue();
          return V.printed = !0, M.printer.printComment(I, M);
        }
        function F(I, M, V) {
          let $ = V.locStart(M) - 1;
          for (let U = 1; U < I.length; ++U)
            if ($ < V.locStart(I[U]))
              return U - 1;
          return 0;
        }
        function a(I, M) {
          let V = I.getValue(), $ = [d(I, M)], { printer: U, originalText: _, locStart: ee, locEnd: R } = M;
          if (U.isBlockComment && U.isBlockComment(V)) {
            let Z = h(_, R(V)) ? h(_, ee(V), { backwards: !0 }) ? i : s : " ";
            $.push(Z);
          } else
            $.push(i);
          let O = m(_, y(_, R(V)));
          return O !== !1 && h(_, O) && $.push(i), $;
        }
        function g(I, M) {
          let V = I.getValue(), $ = d(I, M), { printer: U, originalText: _, locStart: ee } = M, R = U.isBlockComment && U.isBlockComment(V);
          if (h(_, ee(V), { backwards: !0 })) {
            let Z = p(_, V, ee);
            return r([i, Z ? i : "", $]);
          }
          let O = [" ", $];
          return R || (O = [r(O), e]), O;
        }
        function E(I, M, V, $) {
          let U = [], _ = I.getValue();
          return !_ || !_.comments || (I.each(() => {
            let ee = I.getValue();
            !ee.leading && !ee.trailing && (!$ || $(ee)) && U.push(d(I, M));
          }, "comments"), U.length === 0) ? "" : V ? o(i, U) : n([i, o(i, U)]);
        }
        function b(I, M, V) {
          let $ = I.getValue();
          if (!$)
            return {};
          let U = $.comments || [];
          V && (U = U.filter((O) => !V.has(O)));
          let _ = $ === M.cursorNode;
          if (U.length === 0) {
            let O = _ ? c : "";
            return { leading: O, trailing: O };
          }
          let ee = [], R = [];
          return I.each(() => {
            let O = I.getValue();
            if (V && V.has(O))
              return;
            let { leading: Z, trailing: ae } = O;
            Z ? ee.push(a(I, M)) : ae && R.push(g(I, M));
          }, "comments"), _ && (ee.unshift(c), R.push(c)), { leading: ee, trailing: R };
        }
        function x(I, M, V, $) {
          let { leading: U, trailing: _ } = b(I, V, $);
          return !U && !_ ? M : [U, M, _];
        }
        function T(I) {
          if (I)
            for (let M of I) {
              if (!M.printed)
                throw new Error('Comment "' + M.value.trim() + '" was not printed. Please report this error!');
              delete M.printed;
            }
        }
        l.exports = { attach: j, printComments: x, printCommentsSeparately: b, printDanglingComments: E, getSortedChildNodes: A, ensureAllCommentsPrinted: T };
      } }), Es = X({ "src/common/ast-path.js"(u, l) {
        H();
        var t = cn();
        function s(n, r) {
          let o = i(n.stack, r);
          return o === -1 ? null : n.stack[o];
        }
        function i(n, r) {
          for (let o = n.length - 1; o >= 0; o -= 2) {
            let c = n[o];
            if (c && !Array.isArray(c) && --r < 0)
              return o;
          }
          return -1;
        }
        var e = class {
          constructor(n) {
            this.stack = [n];
          }
          getName() {
            let { stack: n } = this, { length: r } = n;
            return r > 1 ? n[r - 2] : null;
          }
          getValue() {
            return t(this.stack);
          }
          getNode() {
            let n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;
            return s(this, n);
          }
          getParentNode() {
            let n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;
            return s(this, n + 1);
          }
          call(n) {
            let { stack: r } = this, { length: o } = r, c = t(r);
            for (var h = arguments.length, m = new Array(h > 1 ? h - 1 : 0), y = 1; y < h; y++)
              m[y - 1] = arguments[y];
            for (let D of m)
              c = c[D], r.push(D, c);
            let p = n(this);
            return r.length = o, p;
          }
          callParent(n) {
            let r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0, o = i(this.stack, r + 1), c = this.stack.splice(o + 1), h = n(this);
            return this.stack.push(...c), h;
          }
          each(n) {
            let { stack: r } = this, { length: o } = r, c = t(r);
            for (var h = arguments.length, m = new Array(h > 1 ? h - 1 : 0), y = 1; y < h; y++)
              m[y - 1] = arguments[y];
            for (let p of m)
              c = c[p], r.push(p, c);
            for (let p = 0; p < c.length; ++p)
              r.push(p, c[p]), n(this, p, c), r.length -= 2;
            r.length = o;
          }
          map(n) {
            let r = [];
            for (var o = arguments.length, c = new Array(o > 1 ? o - 1 : 0), h = 1; h < o; h++)
              c[h - 1] = arguments[h];
            return this.each((m, y, p) => {
              r[y] = n(m, y, p);
            }, ...c), r;
          }
          try(n) {
            let { stack: r } = this, o = [...r];
            try {
              return n();
            } finally {
              r.length = 0, r.push(...o);
            }
          }
          match() {
            let n = this.stack.length - 1, r = null, o = this.stack[n--];
            for (var c = arguments.length, h = new Array(c), m = 0; m < c; m++)
              h[m] = arguments[m];
            for (let y of h) {
              if (o === void 0)
                return !1;
              let p = null;
              if (typeof r == "number" && (p = r, r = this.stack[n--], o = this.stack[n--]), y && !y(o, r, p))
                return !1;
              r = this.stack[n--], o = this.stack[n--];
            }
            return !0;
          }
          findAncestor(n) {
            let r = this.stack.length - 1, o = null, c = this.stack[r--];
            for (; c; ) {
              let h = null;
              if (typeof o == "number" && (h = o, o = this.stack[r--], c = this.stack[r--]), o !== null && n(c, o, h))
                return c;
              o = this.stack[r--], c = this.stack[r--];
            }
          }
        };
        l.exports = e;
      } }), Cs = X({ "src/main/multiparser.js"(u, l) {
        H();
        var { utils: { stripTrailingHardline: t } } = pt(), { normalize: s } = Di(), i = an();
        function e(r, o, c, h) {
          if (c.printer.embed && c.embeddedLanguageFormatting === "auto")
            return c.printer.embed(r, o, (m, y, p) => n(m, y, c, h, p), c);
        }
        function n(r, o, c, h) {
          let { stripTrailingHardline: m = !1 } = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : {}, y = s(Object.assign(Object.assign(Object.assign({}, c), o), {}, { parentParser: c.parser, originalText: r }), { passThrough: !0 }), p = vu().parse(r, y), { ast: D } = p;
          r = p.text;
          let C = D.comments;
          delete D.comments, i.attach(C, D, r, y), y[Symbol.for("comments")] = C || [], y[Symbol.for("tokens")] = D.tokens || [];
          let w = h(D, y);
          return i.ensureAllCommentsPrinted(C), m ? typeof w == "string" ? w.replace(/(?:\r?\n)*$/, "") : t(w) : w;
        }
        l.exports = { printSubtree: e };
      } }), Fs = X({ "src/main/ast-to-doc.js"(u, l) {
        H();
        var t = Es(), { builders: { hardline: s, addAlignmentToDoc: i }, utils: { propagateBreaks: e } } = pt(), { printComments: n } = an(), r = Cs();
        function o(m, y) {
          let p = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0, { printer: D } = y;
          D.preprocess && (m = D.preprocess(m, y));
          let C = /* @__PURE__ */ new Map(), w = new t(m), P = A();
          return p > 0 && (P = i([s, P], p, y.tabWidth)), e(P), P;
          function A(S, j) {
            return S === void 0 || S === w ? N(j) : Array.isArray(S) ? w.call(() => N(j), ...S) : w.call(() => N(j), S);
          }
          function N(S) {
            let j = w.getValue(), k = j && typeof j == "object" && S === void 0;
            if (k && C.has(j))
              return C.get(j);
            let J = h(w, y, A, S);
            return k && C.set(j, J), J;
          }
        }
        function c(m, y) {
          let { originalText: p, [Symbol.for("comments")]: D, locStart: C, locEnd: w } = y, P = C(m), A = w(m), N = /* @__PURE__ */ new Set();
          for (let S of D)
            C(S) >= P && w(S) <= A && (S.printed = !0, N.add(S));
          return { doc: p.slice(P, A), printedComments: N };
        }
        function h(m, y, p, D) {
          let C = m.getValue(), { printer: w } = y, P, A;
          if (w.hasPrettierIgnore && w.hasPrettierIgnore(m))
            ({ doc: P, printedComments: A } = c(C, y));
          else {
            if (C)
              try {
                P = r.printSubtree(m, p, y, o);
              } catch (N) {
                if (globalThis.PRETTIER_DEBUG)
                  throw N;
              }
            P || (P = w.print(m, y, p, D));
          }
          return (!w.willPrintOwnComments || !w.willPrintOwnComments(m, y)) && (P = n(m, P, y, A)), P;
        }
        l.exports = o;
      } }), As = X({ "src/main/range-util.js"(u, l) {
        H();
        var t = Br(), s = an(), i = (D) => {
          let { parser: C } = D;
          return C === "json" || C === "json5" || C === "json-stringify";
        };
        function e(D, C) {
          let w = [D.node, ...D.parentNodes], P = /* @__PURE__ */ new Set([C.node, ...C.parentNodes]);
          return w.find((A) => h.has(A.type) && P.has(A));
        }
        function n(D) {
          let C = D.length - 1;
          for (; ; ) {
            let w = D[C];
            if (w && (w.type === "Program" || w.type === "File"))
              C--;
            else
              break;
          }
          return D.slice(0, C + 1);
        }
        function r(D, C, w) {
          let { locStart: P, locEnd: A } = w, N = D.node, S = C.node;
          if (N === S)
            return { startNode: N, endNode: S };
          let j = P(D.node);
          for (let J of n(C.parentNodes))
            if (P(J) >= j)
              S = J;
            else
              break;
          let k = A(C.node);
          for (let J of n(D.parentNodes)) {
            if (A(J) <= k)
              N = J;
            else
              break;
            if (N === S)
              break;
          }
          return { startNode: N, endNode: S };
        }
        function o(D, C, w, P) {
          let A = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : [], N = arguments.length > 5 ? arguments[5] : void 0, { locStart: S, locEnd: j } = w, k = S(D), J = j(D);
          if (!(C > J || C < k || N === "rangeEnd" && C === k || N === "rangeStart" && C === J)) {
            for (let f of s.getSortedChildNodes(D, w)) {
              let B = o(f, C, w, P, [D, ...A], N);
              if (B)
                return B;
            }
            if (!P || P(D, A[0]))
              return { node: D, parentNodes: A };
          }
        }
        function c(D, C) {
          return C !== "DeclareExportDeclaration" && D !== "TypeParameterDeclaration" && (D === "Directive" || D === "TypeAlias" || D === "TSExportAssignment" || D.startsWith("Declare") || D.startsWith("TSDeclare") || D.endsWith("Statement") || D.endsWith("Declaration"));
        }
        var h = /* @__PURE__ */ new Set(["ObjectExpression", "ArrayExpression", "StringLiteral", "NumericLiteral", "BooleanLiteral", "NullLiteral", "UnaryExpression", "TemplateLiteral"]), m = /* @__PURE__ */ new Set(["OperationDefinition", "FragmentDefinition", "VariableDefinition", "TypeExtensionDefinition", "ObjectTypeDefinition", "FieldDefinition", "DirectiveDefinition", "EnumTypeDefinition", "EnumValueDefinition", "InputValueDefinition", "InputObjectTypeDefinition", "SchemaDefinition", "OperationTypeDefinition", "InterfaceTypeDefinition", "UnionTypeDefinition", "ScalarTypeDefinition"]);
        function y(D, C, w) {
          if (!C)
            return !1;
          switch (D.parser) {
            case "flow":
            case "babel":
            case "babel-flow":
            case "babel-ts":
            case "typescript":
            case "acorn":
            case "espree":
            case "meriyah":
            case "__babel_estree":
              return c(C.type, w && w.type);
            case "json":
            case "json5":
            case "json-stringify":
              return h.has(C.type);
            case "graphql":
              return m.has(C.kind);
            case "vue":
              return C.tag !== "root";
          }
          return !1;
        }
        function p(D, C, w) {
          let { rangeStart: P, rangeEnd: A, locStart: N, locEnd: S } = C;
          t.ok(A > P);
          let j = D.slice(P, A).search(/\S/), k = j === -1;
          if (!k)
            for (P += j; A > P && !/\S/.test(D[A - 1]); --A)
              ;
          let J = o(w, P, C, (F, a) => y(C, F, a), [], "rangeStart"), f = k ? J : o(w, A, C, (F) => y(C, F), [], "rangeEnd");
          if (!J || !f)
            return { rangeStart: 0, rangeEnd: 0 };
          let B, d;
          if (i(C)) {
            let F = e(J, f);
            B = F, d = F;
          } else
            ({ startNode: B, endNode: d } = r(J, f, C));
          return { rangeStart: Math.min(N(B), N(d)), rangeEnd: Math.max(S(B), S(d)) };
        }
        l.exports = { calculateRange: p, findNodeAtOffset: o };
      } }), vs = X({ "src/main/core.js"(u, l) {
        H();
        var { diffArrays: t } = sr(), { printer: { printDocToString: s }, debug: { printDocToDebug: i } } = pt(), { getAlignmentSize: e } = bt(), { guessEndOfLine: n, convertEndOfLineToChars: r, countEndOfLineChars: o, normalizeEndOfLine: c } = Xn(), h = Di().normalize, m = hs(), y = an(), p = vu(), D = Fs(), C = As(), w = "\uFEFF", P = Symbol("cursor");
        function A(d, F, a) {
          let g = F.comments;
          return g && (delete F.comments, y.attach(g, F, d, a)), a[Symbol.for("comments")] = g || [], a[Symbol.for("tokens")] = F.tokens || [], a.originalText = d, g;
        }
        function N(d, F) {
          let a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0;
          if (!d || d.trim().length === 0)
            return { formatted: "", cursorOffset: -1, comments: [] };
          let { ast: g, text: E } = p.parse(d, F);
          if (F.cursorOffset >= 0) {
            let I = C.findNodeAtOffset(g, F.cursorOffset, F);
            I && I.node && (F.cursorNode = I.node);
          }
          let b = A(E, g, F), x = D(g, F, a), T = s(x, F);
          if (y.ensureAllCommentsPrinted(b), a > 0) {
            let I = T.formatted.trim();
            T.cursorNodeStart !== void 0 && (T.cursorNodeStart -= T.formatted.indexOf(I)), T.formatted = I + r(F.endOfLine);
          }
          if (F.cursorOffset >= 0) {
            let I, M, V, $, U;
            if (F.cursorNode && T.cursorNodeText ? (I = F.locStart(F.cursorNode), M = E.slice(I, F.locEnd(F.cursorNode)), V = F.cursorOffset - I, $ = T.cursorNodeStart, U = T.cursorNodeText) : (I = 0, M = E, V = F.cursorOffset, $ = 0, U = T.formatted), M === U)
              return { formatted: T.formatted, cursorOffset: $ + V, comments: b };
            let _ = [...M];
            _.splice(V, 0, P);
            let ee = [...U], R = t(_, ee), O = $;
            for (let Z of R)
              if (Z.removed) {
                if (Z.value.includes(P))
                  break;
              } else
                O += Z.count;
            return { formatted: T.formatted, cursorOffset: O, comments: b };
          }
          return { formatted: T.formatted, cursorOffset: -1, comments: b };
        }
        function S(d, F) {
          let { ast: a, text: g } = p.parse(d, F), { rangeStart: E, rangeEnd: b } = C.calculateRange(g, F, a), x = g.slice(E, b), T = Math.min(E, g.lastIndexOf(`
`, E) + 1), I = g.slice(T, E).match(/^\s*/)[0], M = e(I, F.tabWidth), V = N(x, Object.assign(Object.assign({}, F), {}, { rangeStart: 0, rangeEnd: Number.POSITIVE_INFINITY, cursorOffset: F.cursorOffset > E && F.cursorOffset <= b ? F.cursorOffset - E : -1, endOfLine: "lf" }), M), $ = V.formatted.trimEnd(), { cursorOffset: U } = F;
          U > b ? U += $.length - x.length : V.cursorOffset >= 0 && (U = V.cursorOffset + E);
          let _ = g.slice(0, E) + $ + g.slice(b);
          if (F.endOfLine !== "lf") {
            let ee = r(F.endOfLine);
            U >= 0 && ee === `\r
` && (U += o(_.slice(0, U), `
`)), _ = _.replace(/\n/g, ee);
          }
          return { formatted: _, cursorOffset: U, comments: V.comments };
        }
        function j(d, F, a) {
          return typeof F != "number" || Number.isNaN(F) || F < 0 || F > d.length ? a : F;
        }
        function k(d, F) {
          let { cursorOffset: a, rangeStart: g, rangeEnd: E } = F;
          return a = j(d, a, -1), g = j(d, g, 0), E = j(d, E, d.length), Object.assign(Object.assign({}, F), {}, { cursorOffset: a, rangeStart: g, rangeEnd: E });
        }
        function J(d, F) {
          let { cursorOffset: a, rangeStart: g, rangeEnd: E, endOfLine: b } = k(d, F), x = d.charAt(0) === w;
          if (x && (d = d.slice(1), a--, g--, E--), b === "auto" && (b = n(d)), d.includes("\r")) {
            let T = (I) => o(d.slice(0, Math.max(I, 0)), `\r
`);
            a -= T(a), g -= T(g), E -= T(E), d = c(d);
          }
          return { hasBOM: x, text: d, options: k(d, Object.assign(Object.assign({}, F), {}, { cursorOffset: a, rangeStart: g, rangeEnd: E, endOfLine: b })) };
        }
        function f(d, F) {
          let a = p.resolveParser(F);
          return !a.hasPragma || a.hasPragma(d);
        }
        function B(d, F) {
          let { hasBOM: a, text: g, options: E } = J(d, h(F));
          if (E.rangeStart >= E.rangeEnd && g !== "" || E.requirePragma && !f(g, E))
            return { formatted: d, cursorOffset: F.cursorOffset, comments: [] };
          let b;
          return E.rangeStart > 0 || E.rangeEnd < g.length ? b = S(g, E) : (!E.requirePragma && E.insertPragma && E.printer.insertPragma && !f(g, E) && (g = E.printer.insertPragma(g)), b = N(g, E)), a && (b.formatted = w + b.formatted, b.cursorOffset >= 0 && b.cursorOffset++), b;
        }
        l.exports = { formatWithCursor: B, parse(d, F, a) {
          let { text: g, options: E } = J(d, h(F)), b = p.parse(g, E);
          return a && (b.ast = m(b.ast, E)), b;
        }, formatAST(d, F) {
          F = h(F);
          let a = D(d, F);
          return s(a, F);
        }, formatDoc(d, F) {
          return B(i(d), Object.assign(Object.assign({}, F), {}, { parser: "__js_expression" })).formatted;
        }, printToDoc(d, F) {
          F = h(F);
          let { ast: a, text: g } = p.parse(d, F);
          return A(g, a, F), D(a, F);
        }, printDocToString(d, F) {
          return s(d, h(F));
        } };
      } }), bs = X({ "src/common/util-shared.js"(u, l) {
        H();
        var { getMaxContinuousCount: t, getStringWidth: s, getAlignmentSize: i, getIndentSize: e, skip: n, skipWhitespace: r, skipSpaces: o, skipNewline: c, skipToLineEnd: h, skipEverythingButNewLine: m, skipInlineComment: y, skipTrailingComment: p, hasNewline: D, hasNewlineInRange: C, hasSpaces: w, isNextLineEmpty: P, isNextLineEmptyAfterIndex: A, isPreviousLineEmpty: N, getNextNonSpaceNonCommentCharacterIndex: S, makeString: j, addLeadingComment: k, addDanglingComment: J, addTrailingComment: f } = bt();
        l.exports = { getMaxContinuousCount: t, getStringWidth: s, getAlignmentSize: i, getIndentSize: e, skip: n, skipWhitespace: r, skipSpaces: o, skipNewline: c, skipToLineEnd: h, skipEverythingButNewLine: m, skipInlineComment: y, skipTrailingComment: p, hasNewline: D, hasNewlineInRange: C, hasSpaces: w, isNextLineEmpty: P, isNextLineEmptyAfterIndex: A, isPreviousLineEmpty: N, getNextNonSpaceNonCommentCharacterIndex: S, makeString: j, addLeadingComment: k, addDanglingComment: J, addTrailingComment: f };
      } }), Zn = X({ "src/utils/create-language.js"(u, l) {
        H(), l.exports = function(t, s) {
          let { languageId: i } = t, e = Ae(t, le);
          return Object.assign(Object.assign({ linguistLanguageId: i }, e), s(t));
        };
      } }), xs = X({ "node_modules/esutils/lib/ast.js"(u, l) {
        H(), function() {
          function t(o) {
            if (o == null)
              return !1;
            switch (o.type) {
              case "ArrayExpression":
              case "AssignmentExpression":
              case "BinaryExpression":
              case "CallExpression":
              case "ConditionalExpression":
              case "FunctionExpression":
              case "Identifier":
              case "Literal":
              case "LogicalExpression":
              case "MemberExpression":
              case "NewExpression":
              case "ObjectExpression":
              case "SequenceExpression":
              case "ThisExpression":
              case "UnaryExpression":
              case "UpdateExpression":
                return !0;
            }
            return !1;
          }
          function s(o) {
            if (o == null)
              return !1;
            switch (o.type) {
              case "DoWhileStatement":
              case "ForInStatement":
              case "ForStatement":
              case "WhileStatement":
                return !0;
            }
            return !1;
          }
          function i(o) {
            if (o == null)
              return !1;
            switch (o.type) {
              case "BlockStatement":
              case "BreakStatement":
              case "ContinueStatement":
              case "DebuggerStatement":
              case "DoWhileStatement":
              case "EmptyStatement":
              case "ExpressionStatement":
              case "ForInStatement":
              case "ForStatement":
              case "IfStatement":
              case "LabeledStatement":
              case "ReturnStatement":
              case "SwitchStatement":
              case "ThrowStatement":
              case "TryStatement":
              case "VariableDeclaration":
              case "WhileStatement":
              case "WithStatement":
                return !0;
            }
            return !1;
          }
          function e(o) {
            return i(o) || o != null && o.type === "FunctionDeclaration";
          }
          function n(o) {
            switch (o.type) {
              case "IfStatement":
                return o.alternate != null ? o.alternate : o.consequent;
              case "LabeledStatement":
              case "ForStatement":
              case "ForInStatement":
              case "WhileStatement":
              case "WithStatement":
                return o.body;
            }
            return null;
          }
          function r(o) {
            var c;
            if (o.type !== "IfStatement" || o.alternate == null)
              return !1;
            c = o.consequent;
            do {
              if (c.type === "IfStatement" && c.alternate == null)
                return !0;
              c = n(c);
            } while (c);
            return !1;
          }
          l.exports = { isExpression: t, isStatement: i, isIterationStatement: s, isSourceElement: e, isProblematicIfStatement: r, trailingStatement: n };
        }();
      } }), di = X({ "node_modules/esutils/lib/code.js"(u, l) {
        H(), function() {
          var t, s, i, e, n, r;
          s = { NonAsciiIdentifierStart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/, NonAsciiIdentifierPart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B4\u08B6-\u08BD\u08D4-\u08E1\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C80-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D54-\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFB-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/ }, t = { NonAsciiIdentifierStart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF19]|\uD806[\uDCA0-\uDCDF\uDCFF\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F\uDFE0]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D]/, NonAsciiIdentifierPart: /[\xAA\xB5\xB7\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B4\u08B6-\u08BD\u08D4-\u08E1\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C80-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D54-\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1369-\u1371\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFB-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDCA-\uDDCC\uDDD0-\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE37\uDE3E\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC00-\uDC4A\uDC50-\uDC59\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9\uDF00-\uDF19\uDF1D-\uDF2B\uDF30-\uDF39]|\uD806[\uDCA0-\uDCE9\uDCFF\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC36\uDC38-\uDC40\uDC50-\uDC59\uDC72-\uDC8F\uDC92-\uDCA7\uDCA9-\uDCB6]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F\uDFE0]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6\uDD00-\uDD4A\uDD50-\uDD59]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/ };
          function o(A) {
            return 48 <= A && A <= 57;
          }
          function c(A) {
            return 48 <= A && A <= 57 || 97 <= A && A <= 102 || 65 <= A && A <= 70;
          }
          function h(A) {
            return A >= 48 && A <= 55;
          }
          i = [5760, 8192, 8193, 8194, 8195, 8196, 8197, 8198, 8199, 8200, 8201, 8202, 8239, 8287, 12288, 65279];
          function m(A) {
            return A === 32 || A === 9 || A === 11 || A === 12 || A === 160 || A >= 5760 && i.indexOf(A) >= 0;
          }
          function y(A) {
            return A === 10 || A === 13 || A === 8232 || A === 8233;
          }
          function p(A) {
            if (A <= 65535)
              return String.fromCharCode(A);
            var N = String.fromCharCode(Math.floor((A - 65536) / 1024) + 55296), S = String.fromCharCode((A - 65536) % 1024 + 56320);
            return N + S;
          }
          for (e = new Array(128), r = 0; r < 128; ++r)
            e[r] = r >= 97 && r <= 122 || r >= 65 && r <= 90 || r === 36 || r === 95;
          for (n = new Array(128), r = 0; r < 128; ++r)
            n[r] = r >= 97 && r <= 122 || r >= 65 && r <= 90 || r >= 48 && r <= 57 || r === 36 || r === 95;
          function D(A) {
            return A < 128 ? e[A] : s.NonAsciiIdentifierStart.test(p(A));
          }
          function C(A) {
            return A < 128 ? n[A] : s.NonAsciiIdentifierPart.test(p(A));
          }
          function w(A) {
            return A < 128 ? e[A] : t.NonAsciiIdentifierStart.test(p(A));
          }
          function P(A) {
            return A < 128 ? n[A] : t.NonAsciiIdentifierPart.test(p(A));
          }
          l.exports = { isDecimalDigit: o, isHexDigit: c, isOctalDigit: h, isWhiteSpace: m, isLineTerminator: y, isIdentifierStartES5: D, isIdentifierPartES5: C, isIdentifierStartES6: w, isIdentifierPartES6: P };
        }();
      } }), Ss = X({ "node_modules/esutils/lib/keyword.js"(u, l) {
        H(), function() {
          var t = di();
          function s(D) {
            switch (D) {
              case "implements":
              case "interface":
              case "package":
              case "private":
              case "protected":
              case "public":
              case "static":
              case "let":
                return !0;
              default:
                return !1;
            }
          }
          function i(D, C) {
            return !C && D === "yield" ? !1 : e(D, C);
          }
          function e(D, C) {
            if (C && s(D))
              return !0;
            switch (D.length) {
              case 2:
                return D === "if" || D === "in" || D === "do";
              case 3:
                return D === "var" || D === "for" || D === "new" || D === "try";
              case 4:
                return D === "this" || D === "else" || D === "case" || D === "void" || D === "with" || D === "enum";
              case 5:
                return D === "while" || D === "break" || D === "catch" || D === "throw" || D === "const" || D === "yield" || D === "class" || D === "super";
              case 6:
                return D === "return" || D === "typeof" || D === "delete" || D === "switch" || D === "export" || D === "import";
              case 7:
                return D === "default" || D === "finally" || D === "extends";
              case 8:
                return D === "function" || D === "continue" || D === "debugger";
              case 10:
                return D === "instanceof";
              default:
                return !1;
            }
          }
          function n(D, C) {
            return D === "null" || D === "true" || D === "false" || i(D, C);
          }
          function r(D, C) {
            return D === "null" || D === "true" || D === "false" || e(D, C);
          }
          function o(D) {
            return D === "eval" || D === "arguments";
          }
          function c(D) {
            var C, w, P;
            if (D.length === 0 || (P = D.charCodeAt(0), !t.isIdentifierStartES5(P)))
              return !1;
            for (C = 1, w = D.length; C < w; ++C)
              if (P = D.charCodeAt(C), !t.isIdentifierPartES5(P))
                return !1;
            return !0;
          }
          function h(D, C) {
            return (D - 55296) * 1024 + (C - 56320) + 65536;
          }
          function m(D) {
            var C, w, P, A, N;
            if (D.length === 0)
              return !1;
            for (N = t.isIdentifierStartES6, C = 0, w = D.length; C < w; ++C) {
              if (P = D.charCodeAt(C), 55296 <= P && P <= 56319) {
                if (++C, C >= w || (A = D.charCodeAt(C), !(56320 <= A && A <= 57343)))
                  return !1;
                P = h(P, A);
              }
              if (!N(P))
                return !1;
              N = t.isIdentifierPartES6;
            }
            return !0;
          }
          function y(D, C) {
            return c(D) && !n(D, C);
          }
          function p(D, C) {
            return m(D) && !r(D, C);
          }
          l.exports = { isKeywordES5: i, isKeywordES6: e, isReservedWordES5: n, isReservedWordES6: r, isRestrictedWord: o, isIdentifierNameES5: c, isIdentifierNameES6: m, isIdentifierES5: y, isIdentifierES6: p };
        }();
      } }), Bs = X({ "node_modules/esutils/lib/utils.js"(u) {
        H(), function() {
          u.ast = xs(), u.code = di(), u.keyword = Ss();
        }();
      } }), er = X({ "src/language-js/utils/is-block-comment.js"(u, l) {
        H();
        var t = /* @__PURE__ */ new Set(["Block", "CommentBlock", "MultiLine"]), s = (i) => t.has(i == null ? void 0 : i.type);
        l.exports = s;
      } }), Ts = X({ "src/language-js/utils/is-node-matches.js"(u, l) {
        H();
        function t(i, e) {
          let n = e.split(".");
          for (let r = n.length - 1; r >= 0; r--) {
            let o = n[r];
            if (r === 0)
              return i.type === "Identifier" && i.name === o;
            if (i.type !== "MemberExpression" || i.optional || i.computed || i.property.type !== "Identifier" || i.property.name !== o)
              return !1;
            i = i.object;
          }
        }
        function s(i, e) {
          return e.some((n) => t(i, n));
        }
        l.exports = s;
      } }), Jt = X({ "src/language-js/utils/index.js"(u, l) {
        H();
        var t = Bs().keyword.isIdentifierNameES5, { getLast: s, hasNewline: i, skipWhitespace: e, isNonEmptyArray: n, isNextLineEmptyAfterIndex: r, getStringWidth: o } = bt(), { locStart: c, locEnd: h, hasSameLocStart: m } = yn(), y = er(), p = Ts(), D = "(?:(?=.)\\s)", C = new RegExp(`^${D}*:`), w = new RegExp(`^${D}*::`);
        function P(L) {
          var Fe, et;
          return ((Fe = L.extra) === null || Fe === void 0 ? void 0 : Fe.parenthesized) && y((et = L.trailingComments) === null || et === void 0 ? void 0 : et[0]) && C.test(L.trailingComments[0].value);
        }
        function A(L) {
          let Fe = L == null ? void 0 : L[0];
          return y(Fe) && w.test(Fe.value);
        }
        function N(L, Fe) {
          if (!L || typeof L != "object")
            return !1;
          if (Array.isArray(L))
            return L.some((xt) => N(xt, Fe));
          let et = Fe(L);
          return typeof et == "boolean" ? et : Object.values(L).some((xt) => N(xt, Fe));
        }
        function S(L) {
          return L.type === "AssignmentExpression" || L.type === "BinaryExpression" || L.type === "LogicalExpression" || L.type === "NGPipeExpression" || L.type === "ConditionalExpression" || me(L) || ge(L) || L.type === "SequenceExpression" || L.type === "TaggedTemplateExpression" || L.type === "BindExpression" || L.type === "UpdateExpression" && !L.prefix || Nn(L) || L.type === "TSNonNullExpression";
        }
        function j(L) {
          var Fe, et, xt, St, xn, Ut;
          return L.expressions ? L.expressions[0] : (Fe = (et = (xt = (St = (xn = (Ut = L.left) !== null && Ut !== void 0 ? Ut : L.test) !== null && xn !== void 0 ? xn : L.callee) !== null && St !== void 0 ? St : L.object) !== null && xt !== void 0 ? xt : L.tag) !== null && et !== void 0 ? et : L.argument) !== null && Fe !== void 0 ? Fe : L.expression;
        }
        function k(L, Fe) {
          if (Fe.expressions)
            return ["expressions", 0];
          if (Fe.left)
            return ["left"];
          if (Fe.test)
            return ["test"];
          if (Fe.object)
            return ["object"];
          if (Fe.callee)
            return ["callee"];
          if (Fe.tag)
            return ["tag"];
          if (Fe.argument)
            return ["argument"];
          if (Fe.expression)
            return ["expression"];
          throw new Error("Unexpected node has no left side.");
        }
        function J(L) {
          return L = new Set(L), (Fe) => L.has(Fe == null ? void 0 : Fe.type);
        }
        var f = J(["Line", "CommentLine", "SingleLine", "HashbangComment", "HTMLOpen", "HTMLClose"]), B = J(["ExportDefaultDeclaration", "ExportDefaultSpecifier", "DeclareExportDeclaration", "ExportNamedDeclaration", "ExportAllDeclaration"]);
        function d(L) {
          let Fe = L.getParentNode();
          return L.getName() === "declaration" && B(Fe) ? Fe : null;
        }
        var F = J(["BooleanLiteral", "DirectiveLiteral", "Literal", "NullLiteral", "NumericLiteral", "BigIntLiteral", "DecimalLiteral", "RegExpLiteral", "StringLiteral", "TemplateLiteral", "TSTypeLiteral", "JSXText"]);
        function a(L) {
          return L.type === "NumericLiteral" || L.type === "Literal" && typeof L.value == "number";
        }
        function g(L) {
          return L.type === "UnaryExpression" && (L.operator === "+" || L.operator === "-") && a(L.argument);
        }
        function E(L) {
          return L.type === "StringLiteral" || L.type === "Literal" && typeof L.value == "string";
        }
        var b = J(["ObjectTypeAnnotation", "TSTypeLiteral", "TSMappedType"]), x = J(["FunctionExpression", "ArrowFunctionExpression"]);
        function T(L) {
          return L.type === "FunctionExpression" || L.type === "ArrowFunctionExpression" && L.body.type === "BlockStatement";
        }
        function I(L) {
          return me(L) && L.callee.type === "Identifier" && ["async", "inject", "fakeAsync", "waitForAsync"].includes(L.callee.name);
        }
        var M = J(["JSXElement", "JSXFragment"]);
        function V(L, Fe) {
          if (L.parentParser !== "markdown" && L.parentParser !== "mdx")
            return !1;
          let et = Fe.getNode();
          if (!et.expression || !M(et.expression))
            return !1;
          let xt = Fe.getParentNode();
          return xt.type === "Program" && xt.body.length === 1;
        }
        function $(L) {
          return L.kind === "get" || L.kind === "set";
        }
        function U(L) {
          return $(L) || m(L, L.value);
        }
        function _(L) {
          return (L.type === "ObjectTypeProperty" || L.type === "ObjectTypeInternalSlot") && L.value.type === "FunctionTypeAnnotation" && !L.static && !U(L);
        }
        function ee(L) {
          return (L.type === "TypeAnnotation" || L.type === "TSTypeAnnotation") && L.typeAnnotation.type === "FunctionTypeAnnotation" && !L.static && !m(L, L.typeAnnotation);
        }
        var R = J(["BinaryExpression", "LogicalExpression", "NGPipeExpression"]);
        function O(L) {
          return ge(L) || L.type === "BindExpression" && Boolean(L.object);
        }
        var Z = /* @__PURE__ */ new Set(["AnyTypeAnnotation", "TSAnyKeyword", "NullLiteralTypeAnnotation", "TSNullKeyword", "ThisTypeAnnotation", "TSThisType", "NumberTypeAnnotation", "TSNumberKeyword", "VoidTypeAnnotation", "TSVoidKeyword", "BooleanTypeAnnotation", "TSBooleanKeyword", "BigIntTypeAnnotation", "TSBigIntKeyword", "SymbolTypeAnnotation", "TSSymbolKeyword", "StringTypeAnnotation", "TSStringKeyword", "BooleanLiteralTypeAnnotation", "StringLiteralTypeAnnotation", "BigIntLiteralTypeAnnotation", "NumberLiteralTypeAnnotation", "TSLiteralType", "TSTemplateLiteralType", "EmptyTypeAnnotation", "MixedTypeAnnotation", "TSNeverKeyword", "TSObjectKeyword", "TSUndefinedKeyword", "TSUnknownKeyword"]);
        function ae(L) {
          return L ? !!((L.type === "GenericTypeAnnotation" || L.type === "TSTypeReference") && !L.typeParameters || Z.has(L.type)) : !1;
        }
        function ne(L) {
          let Fe = /^(?:before|after)(?:Each|All)$/;
          return L.callee.type === "Identifier" && Fe.test(L.callee.name) && L.arguments.length === 1;
        }
        var he = ["it", "it.only", "it.skip", "describe", "describe.only", "describe.skip", "test", "test.only", "test.skip", "test.step", "test.describe", "test.describe.only", "test.describe.parallel", "test.describe.parallel.only", "test.describe.serial", "test.describe.serial.only", "skip", "xit", "xdescribe", "xtest", "fit", "fdescribe", "ftest"];
        function q(L) {
          return p(L, he);
        }
        function Y(L, Fe) {
          if (L.type !== "CallExpression")
            return !1;
          if (L.arguments.length === 1) {
            if (I(L) && Fe && Y(Fe))
              return x(L.arguments[0]);
            if (ne(L))
              return I(L.arguments[0]);
          } else if ((L.arguments.length === 2 || L.arguments.length === 3) && (L.arguments[0].type === "TemplateLiteral" || E(L.arguments[0])) && q(L.callee))
            return L.arguments[2] && !a(L.arguments[2]) ? !1 : (L.arguments.length === 2 ? x(L.arguments[1]) : T(L.arguments[1]) && Te(L.arguments[1]).length <= 1) || I(L.arguments[1]);
          return !1;
        }
        var me = J(["CallExpression", "OptionalCallExpression"]), ge = J(["MemberExpression", "OptionalMemberExpression"]);
        function _e(L) {
          let Fe = "expressions";
          L.type === "TSTemplateLiteralType" && (Fe = "types");
          let et = L[Fe];
          return et.length === 0 ? !1 : et.every((xt) => {
            if (at(xt))
              return !1;
            if (xt.type === "Identifier" || xt.type === "ThisExpression")
              return !0;
            if (ge(xt)) {
              let St = xt;
              for (; ge(St); )
                if (St.property.type !== "Identifier" && St.property.type !== "Literal" && St.property.type !== "StringLiteral" && St.property.type !== "NumericLiteral" || (St = St.object, at(St)))
                  return !1;
              return St.type === "Identifier" || St.type === "ThisExpression";
            }
            return !1;
          });
        }
        function Q(L, Fe) {
          return L === "+" || L === "-" ? L + Fe : Fe;
        }
        function W(L, Fe) {
          let et = c(Fe), xt = e(L, h(Fe));
          return xt !== !1 && L.slice(et, et + 2) === "/*" && L.slice(xt, xt + 2) === "*/";
        }
        function re(L, Fe) {
          return M(Fe) ? ft(Fe) : at(Fe, Ge.Leading, (et) => i(L, h(et)));
        }
        function ue(L, Fe) {
          return Fe.parser !== "json" && E(L.key) && ce(L.key).slice(1, -1) === L.key.value && (t(L.key.value) && !(Fe.parser === "babel-ts" && L.type === "ClassProperty" || Fe.parser === "typescript" && L.type === "PropertyDefinition") || Ce(L.key.value) && String(Number(L.key.value)) === L.key.value && (Fe.parser === "babel" || Fe.parser === "acorn" || Fe.parser === "espree" || Fe.parser === "meriyah" || Fe.parser === "__babel_estree"));
        }
        function Ce(L) {
          return /^(?:\d+|\d+\.\d+)$/.test(L);
        }
        function be(L, Fe) {
          let et = /^[fx]?(?:describe|it|test)$/;
          return Fe.type === "TaggedTemplateExpression" && Fe.quasi === L && Fe.tag.type === "MemberExpression" && Fe.tag.property.type === "Identifier" && Fe.tag.property.name === "each" && (Fe.tag.object.type === "Identifier" && et.test(Fe.tag.object.name) || Fe.tag.object.type === "MemberExpression" && Fe.tag.object.property.type === "Identifier" && (Fe.tag.object.property.name === "only" || Fe.tag.object.property.name === "skip") && Fe.tag.object.object.type === "Identifier" && et.test(Fe.tag.object.object.name));
        }
        function Be(L) {
          return L.quasis.some((Fe) => Fe.value.raw.includes(`
`));
        }
        function ze(L, Fe) {
          return (L.type === "TemplateLiteral" && Be(L) || L.type === "TaggedTemplateExpression" && Be(L.quasi)) && !i(Fe, c(L), { backwards: !0 });
        }
        function mt(L) {
          if (!at(L))
            return !1;
          let Fe = s(De(L, Ge.Dangling));
          return Fe && !y(Fe);
        }
        function Dt(L) {
          if (L.length <= 1)
            return !1;
          let Fe = 0;
          for (let et of L)
            if (x(et)) {
              if (Fe += 1, Fe > 1)
                return !0;
            } else if (me(et)) {
              for (let xt of et.arguments)
                if (x(xt))
                  return !0;
            }
          return !1;
        }
        function Ue(L) {
          let Fe = L.getValue(), et = L.getParentNode();
          return me(Fe) && me(et) && et.callee === Fe && Fe.arguments.length > et.arguments.length && et.arguments.length > 0;
        }
        function tt(L, Fe) {
          if (Fe >= 2)
            return !1;
          let et = (Ut) => tt(Ut, Fe + 1), xt = L.type === "Literal" && "regex" in L && L.regex.pattern || L.type === "RegExpLiteral" && L.pattern;
          if (xt && o(xt) > 5)
            return !1;
          if (L.type === "Literal" || L.type === "BigIntLiteral" || L.type === "DecimalLiteral" || L.type === "BooleanLiteral" || L.type === "NullLiteral" || L.type === "NumericLiteral" || L.type === "RegExpLiteral" || L.type === "StringLiteral" || L.type === "Identifier" || L.type === "ThisExpression" || L.type === "Super" || L.type === "PrivateName" || L.type === "PrivateIdentifier" || L.type === "ArgumentPlaceholder" || L.type === "Import")
            return !0;
          if (L.type === "TemplateLiteral")
            return L.quasis.every((Ut) => !Ut.value.raw.includes(`
`)) && L.expressions.every(et);
          if (L.type === "ObjectExpression")
            return L.properties.every((Ut) => !Ut.computed && (Ut.shorthand || Ut.value && et(Ut.value)));
          if (L.type === "ArrayExpression")
            return L.elements.every((Ut) => Ut === null || et(Ut));
          if (Dn(L))
            return (L.type === "ImportExpression" || tt(L.callee, Fe)) && qt(L).every(et);
          if (ge(L))
            return tt(L.object, Fe) && tt(L.property, Fe);
          let St = { "!": !0, "-": !0, "+": !0, "~": !0 };
          if (L.type === "UnaryExpression" && St[L.operator])
            return tt(L.argument, Fe);
          let xn = { "++": !0, "--": !0 };
          return L.type === "UpdateExpression" && xn[L.operator] ? tt(L.argument, Fe) : L.type === "TSNonNullExpression" ? tt(L.expression, Fe) : !1;
        }
        function ce(L) {
          var Fe, et;
          return (Fe = (et = L.extra) === null || et === void 0 ? void 0 : et.raw) !== null && Fe !== void 0 ? Fe : L.raw;
        }
        function G(L) {
          return L;
        }
        function ye(L) {
          return L.filepath && /\.tsx$/i.test(L.filepath);
        }
        function K(L) {
          let Fe = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "es5";
          return L.trailingComma === "es5" && Fe === "es5" || L.trailingComma === "all" && (Fe === "all" || Fe === "es5");
        }
        function fe(L, Fe) {
          switch (L.type) {
            case "BinaryExpression":
            case "LogicalExpression":
            case "AssignmentExpression":
            case "NGPipeExpression":
              return fe(L.left, Fe);
            case "MemberExpression":
            case "OptionalMemberExpression":
              return fe(L.object, Fe);
            case "TaggedTemplateExpression":
              return L.tag.type === "FunctionExpression" ? !1 : fe(L.tag, Fe);
            case "CallExpression":
            case "OptionalCallExpression":
              return L.callee.type === "FunctionExpression" ? !1 : fe(L.callee, Fe);
            case "ConditionalExpression":
              return fe(L.test, Fe);
            case "UpdateExpression":
              return !L.prefix && fe(L.argument, Fe);
            case "BindExpression":
              return L.object && fe(L.object, Fe);
            case "SequenceExpression":
              return fe(L.expressions[0], Fe);
            case "TSSatisfiesExpression":
            case "TSAsExpression":
            case "TSNonNullExpression":
              return fe(L.expression, Fe);
            default:
              return Fe(L);
          }
        }
        var Ve = { "==": !0, "!=": !0, "===": !0, "!==": !0 }, Ie = { "*": !0, "/": !0, "%": !0 }, Ee = { ">>": !0, ">>>": !0, "<<": !0 };
        function v(L, Fe) {
          return !(se(Fe) !== se(L) || L === "**" || Ve[L] && Ve[Fe] || Fe === "%" && Ie[L] || L === "%" && Ie[Fe] || Fe !== L && Ie[Fe] && Ie[L] || Ee[L] && Ee[Fe]);
        }
        var z = new Map([["|>"], ["??"], ["||"], ["&&"], ["|"], ["^"], ["&"], ["==", "===", "!=", "!=="], ["<", ">", "<=", ">=", "in", "instanceof"], [">>", "<<", ">>>"], ["+", "-"], ["*", "/", "%"], ["**"]].flatMap((L, Fe) => L.map((et) => [et, Fe])));
        function se(L) {
          return z.get(L);
        }
        function Se(L) {
          return Boolean(Ee[L]) || L === "|" || L === "^" || L === "&";
        }
        function Pe(L) {
          var Fe;
          if (L.rest)
            return !0;
          let et = Te(L);
          return ((Fe = s(et)) === null || Fe === void 0 ? void 0 : Fe.type) === "RestElement";
        }
        var Xe = /* @__PURE__ */ new WeakMap();
        function Te(L) {
          if (Xe.has(L))
            return Xe.get(L);
          let Fe = [];
          return L.this && Fe.push(L.this), Array.isArray(L.parameters) ? Fe.push(...L.parameters) : Array.isArray(L.params) && Fe.push(...L.params), L.rest && Fe.push(L.rest), Xe.set(L, Fe), Fe;
        }
        function Wt(L, Fe) {
          let et = L.getValue(), xt = 0, St = (xn) => Fe(xn, xt++);
          et.this && L.call(St, "this"), Array.isArray(et.parameters) ? L.each(St, "parameters") : Array.isArray(et.params) && L.each(St, "params"), et.rest && L.call(St, "rest");
        }
        var qe = /* @__PURE__ */ new WeakMap();
        function qt(L) {
          if (qe.has(L))
            return qe.get(L);
          let Fe = L.arguments;
          return L.type === "ImportExpression" && (Fe = [L.source], L.attributes && Fe.push(L.attributes)), qe.set(L, Fe), Fe;
        }
        function Je(L, Fe) {
          let et = L.getValue();
          et.type === "ImportExpression" ? (L.call((xt) => Fe(xt, 0), "source"), et.attributes && L.call((xt) => Fe(xt, 1), "attributes")) : L.each(Fe, "arguments");
        }
        function it(L) {
          return L.value.trim() === "prettier-ignore" && !L.unignore;
        }
        function ft(L) {
          return L && (L.prettierIgnore || at(L, Ge.PrettierIgnore));
        }
        function Lt(L) {
          let Fe = L.getValue();
          return ft(Fe);
        }
        var Ge = { Leading: 1 << 1, Trailing: 1 << 2, Dangling: 1 << 3, Block: 1 << 4, Line: 1 << 5, PrettierIgnore: 1 << 6, First: 1 << 7, Last: 1 << 8 }, ct = (L, Fe) => {
          if (typeof L == "function" && (Fe = L, L = 0), L || Fe)
            return (et, xt, St) => !(L & Ge.Leading && !et.leading || L & Ge.Trailing && !et.trailing || L & Ge.Dangling && (et.leading || et.trailing) || L & Ge.Block && !y(et) || L & Ge.Line && !f(et) || L & Ge.First && xt !== 0 || L & Ge.Last && xt !== St.length - 1 || L & Ge.PrettierIgnore && !it(et) || Fe && !Fe(et));
        };
        function at(L, Fe, et) {
          if (!n(L == null ? void 0 : L.comments))
            return !1;
          let xt = ct(Fe, et);
          return xt ? L.comments.some(xt) : !0;
        }
        function De(L, Fe, et) {
          if (!Array.isArray(L == null ? void 0 : L.comments))
            return [];
          let xt = ct(Fe, et);
          return xt ? L.comments.filter(xt) : L.comments;
        }
        var wn = (L, Fe) => {
          let { originalText: et } = Fe;
          return r(et, h(L));
        };
        function Dn(L) {
          return me(L) || L.type === "NewExpression" || L.type === "ImportExpression";
        }
        function Ft(L) {
          return L && (L.type === "ObjectProperty" || L.type === "Property" && !L.method && L.kind === "init");
        }
        function At(L) {
          return Boolean(L.__isUsingHackPipeline);
        }
        var Rt = Symbol("ifWithoutBlockAndSameLineComment");
        function Nn(L) {
          return L.type === "TSAsExpression" || L.type === "TSSatisfiesExpression";
        }
        l.exports = { getFunctionParameters: Te, iterateFunctionParametersPath: Wt, getCallArguments: qt, iterateCallArgumentsPath: Je, hasRestParameter: Pe, getLeftSide: j, getLeftSidePathName: k, getParentExportDeclaration: d, getTypeScriptMappedTypeModifier: Q, hasFlowAnnotationComment: A, hasFlowShorthandAnnotationComment: P, hasLeadingOwnLineComment: re, hasNakedLeftSide: S, hasNode: N, hasIgnoreComment: Lt, hasNodeIgnoreComment: ft, identity: G, isBinaryish: R, isCallLikeExpression: Dn, isEnabledHackPipeline: At, isLineComment: f, isPrettierIgnoreComment: it, isCallExpression: me, isMemberExpression: ge, isExportDeclaration: B, isFlowAnnotationComment: W, isFunctionCompositionArgs: Dt, isFunctionNotation: U, isFunctionOrArrowExpression: x, isGetterOrSetter: $, isJestEachTemplateLiteral: be, isJsxNode: M, isLiteral: F, isLongCurriedCallExpression: Ue, isSimpleCallArgument: tt, isMemberish: O, isNumericLiteral: a, isSignedNumericLiteral: g, isObjectProperty: Ft, isObjectType: b, isObjectTypePropertyAFunction: _, isSimpleType: ae, isSimpleNumber: Ce, isSimpleTemplateLiteral: _e, isStringLiteral: E, isStringPropSafeToUnquote: ue, isTemplateOnItsOwnLine: ze, isTestCall: Y, isTheOnlyJsxElementInMarkdown: V, isTSXFile: ye, isTypeAnnotationAFunction: ee, isNextLineEmpty: wn, needsHardlineAfterDanglingComment: mt, rawText: ce, shouldPrintComma: K, isBitwiseOperator: Se, shouldFlatten: v, startsWithNoLookaheadToken: fe, getPrecedence: se, hasComment: at, getComments: De, CommentCheckFlags: Ge, markerForIfWithoutBlockAndSameLineComment: Rt, isTSTypeExpression: Nn };
      } }), or = X({ "src/language-js/print/template-literal.js"(u, l) {
        H();
        var t = cn(), { getStringWidth: s, getIndentSize: i } = bt(), { builders: { join: e, hardline: n, softline: r, group: o, indent: c, align: h, lineSuffixBoundary: m, addAlignmentToDoc: y }, printer: { printDocToString: p }, utils: { mapDoc: D } } = pt(), { isBinaryish: C, isJestEachTemplateLiteral: w, isSimpleTemplateLiteral: P, hasComment: A, isMemberExpression: N, isTSTypeExpression: S } = Jt();
        function j(F, a, g) {
          let E = F.getValue();
          if (E.type === "TemplateLiteral" && w(E, F.getParentNode())) {
            let M = k(F, g, a);
            if (M)
              return M;
          }
          let b = "expressions";
          E.type === "TSTemplateLiteralType" && (b = "types");
          let x = [], T = F.map(a, b), I = P(E);
          return I && (T = T.map((M) => p(M, Object.assign(Object.assign({}, g), {}, { printWidth: Number.POSITIVE_INFINITY })).formatted)), x.push(m, "`"), F.each((M) => {
            let V = M.getName();
            if (x.push(a()), V < T.length) {
              let { tabWidth: $ } = g, U = M.getValue(), _ = i(U.value.raw, $), ee = T[V];
              if (!I) {
                let O = E[b][V];
                (A(O) || N(O) || O.type === "ConditionalExpression" || O.type === "SequenceExpression" || S(O) || C(O)) && (ee = [c([r, ee]), r]);
              }
              let R = _ === 0 && U.value.raw.endsWith(`
`) ? h(Number.NEGATIVE_INFINITY, ee) : y(ee, _, $);
              x.push(o(["${", R, m, "}"]));
            }
          }, "quasis"), x.push("`"), x;
        }
        function k(F, a, g) {
          let E = F.getNode(), b = E.quasis[0].value.raw.trim().split(/\s*\|\s*/);
          if (b.length > 1 || b.some((x) => x.length > 0)) {
            a.__inJestEach = !0;
            let x = F.map(g, "expressions");
            a.__inJestEach = !1;
            let T = [], I = x.map((_) => "${" + p(_, Object.assign(Object.assign({}, a), {}, { printWidth: Number.POSITIVE_INFINITY, endOfLine: "lf" })).formatted + "}"), M = [{ hasLineBreak: !1, cells: [] }];
            for (let _ = 1; _ < E.quasis.length; _++) {
              let ee = t(M), R = I[_ - 1];
              ee.cells.push(R), R.includes(`
`) && (ee.hasLineBreak = !0), E.quasis[_].value.raw.includes(`
`) && M.push({ hasLineBreak: !1, cells: [] });
            }
            let V = Math.max(b.length, ...M.map((_) => _.cells.length)), $ = Array.from({ length: V }).fill(0), U = [{ cells: b }, ...M.filter((_) => _.cells.length > 0)];
            for (let { cells: _ } of U.filter((ee) => !ee.hasLineBreak))
              for (let [ee, R] of _.entries())
                $[ee] = Math.max($[ee], s(R));
            return T.push(m, "`", c([n, e(n, U.map((_) => e(" | ", _.cells.map((ee, R) => _.hasLineBreak ? ee : ee + " ".repeat($[R] - s(ee))))))]), n, "`"), T;
          }
        }
        function J(F, a) {
          let g = F.getValue(), E = a();
          return A(g) && (E = o([c([r, E]), r])), ["${", E, m, "}"];
        }
        function f(F, a) {
          return F.map((g) => J(g, a), "expressions");
        }
        function B(F, a) {
          return D(F, (g) => typeof g == "string" ? a ? g.replace(/(\\*)`/g, "$1$1\\`") : d(g) : g);
        }
        function d(F) {
          return F.replace(/([\\`]|\${)/g, "\\$1");
        }
        l.exports = { printTemplateLiteral: j, printTemplateExpressions: f, escapeTemplateCharacters: B, uncookTemplateElementValue: d };
      } }), ws = X({ "src/language-js/embed/markdown.js"(u, l) {
        H();
        var { builders: { indent: t, softline: s, literalline: i, dedentToRoot: e } } = pt(), { escapeTemplateCharacters: n } = or();
        function r(c, h, m) {
          let y = c.getValue().quasis[0].value.raw.replace(/((?:\\\\)*)\\`/g, (w, P) => "\\".repeat(P.length / 2) + "`"), p = o(y), D = p !== "";
          D && (y = y.replace(new RegExp(`^${p}`, "gm"), ""));
          let C = n(m(y, { parser: "markdown", __inJsTemplate: !0 }, { stripTrailingHardline: !0 }), !0);
          return ["`", D ? t([s, C]) : [i, e(C)], s, "`"];
        }
        function o(c) {
          let h = c.match(/^([^\S\n]*)\S/m);
          return h === null ? "" : h[1];
        }
        l.exports = r;
      } }), Ns = X({ "src/language-js/embed/css.js"(u, l) {
        H();
        var { isNonEmptyArray: t } = bt(), { builders: { indent: s, hardline: i, softline: e }, utils: { mapDoc: n, replaceEndOfLine: r, cleanDoc: o } } = pt(), { printTemplateExpressions: c } = or();
        function h(p, D, C) {
          let w = p.getValue(), P = w.quasis.map((k) => k.value.raw), A = 0, N = P.reduce((k, J, f) => f === 0 ? J : k + "@prettier-placeholder-" + A++ + "-id" + J, ""), S = C(N, { parser: "scss" }, { stripTrailingHardline: !0 }), j = c(p, D);
          return m(S, w, j);
        }
        function m(p, D, C) {
          if (D.quasis.length === 1 && !D.quasis[0].value.raw.trim())
            return "``";
          let w = y(p, C);
          if (!w)
            throw new Error("Couldn't insert all the expressions");
          return ["`", s([i, w]), e, "`"];
        }
        function y(p, D) {
          if (!t(D))
            return p;
          let C = 0, w = n(o(p), (P) => typeof P != "string" || !P.includes("@prettier-placeholder") ? P : P.split(/@prettier-placeholder-(\d+)-id/).map((A, N) => N % 2 === 0 ? r(A) : (C++, D[A])));
          return D.length === C ? w : null;
        }
        l.exports = h;
      } }), ks = X({ "src/language-js/embed/graphql.js"(u, l) {
        H();
        var { builders: { indent: t, join: s, hardline: i } } = pt(), { escapeTemplateCharacters: e, printTemplateExpressions: n } = or();
        function r(c, h, m) {
          let y = c.getValue(), p = y.quasis.length;
          if (p === 1 && y.quasis[0].value.raw.trim() === "")
            return "``";
          let D = n(c, h), C = [];
          for (let w = 0; w < p; w++) {
            let P = y.quasis[w], A = w === 0, N = w === p - 1, S = P.value.cooked, j = S.split(`
`), k = j.length, J = D[w], f = k > 2 && j[0].trim() === "" && j[1].trim() === "", B = k > 2 && j[k - 1].trim() === "" && j[k - 2].trim() === "", d = j.every((a) => /^\s*(?:#[^\n\r]*)?$/.test(a));
            if (!N && /#[^\n\r]*$/.test(j[k - 1]))
              return null;
            let F = null;
            d ? F = o(j) : F = m(S, { parser: "graphql" }, { stripTrailingHardline: !0 }), F ? (F = e(F, !1), !A && f && C.push(""), C.push(F), !N && B && C.push("")) : !A && !N && f && C.push(""), J && C.push(J);
          }
          return ["`", t([i, s(i, C)]), i, "`"];
        }
        function o(c) {
          let h = [], m = !1, y = c.map((p) => p.trim());
          for (let [p, D] of y.entries())
            D !== "" && (y[p - 1] === "" && m ? h.push([i, D]) : h.push(D), m = !0);
          return h.length === 0 ? null : s(i, h);
        }
        l.exports = r;
      } }), Ps = X({ "src/language-js/embed/html.js"(u, l) {
        H();
        var { builders: { indent: t, line: s, hardline: i, group: e }, utils: { mapDoc: n } } = pt(), { printTemplateExpressions: r, uncookTemplateElementValue: o } = or(), c = 0;
        function h(m, y, p, D, C) {
          let { parser: w } = C, P = m.getValue(), A = c;
          c = c + 1 >>> 0;
          let N = (g) => `PRETTIER_HTML_PLACEHOLDER_${g}_${A}_IN_JS`, S = P.quasis.map((g, E, b) => E === b.length - 1 ? g.value.cooked : g.value.cooked + N(E)).join(""), j = r(m, y);
          if (j.length === 0 && S.trim().length === 0)
            return "``";
          let k = new RegExp(N("(\\d+)"), "g"), J = 0, f = p(S, { parser: w, __onHtmlRoot(g) {
            J = g.children.length;
          } }, { stripTrailingHardline: !0 }), B = n(f, (g) => {
            if (typeof g != "string")
              return g;
            let E = [], b = g.split(k);
            for (let x = 0; x < b.length; x++) {
              let T = b[x];
              if (x % 2 === 0) {
                T && (T = o(T), D.__embeddedInHtml && (T = T.replace(/<\/(script)\b/gi, "<\\/$1")), E.push(T));
                continue;
              }
              let I = Number(T);
              E.push(j[I]);
            }
            return E;
          }), d = /^\s/.test(S) ? " " : "", F = /\s$/.test(S) ? " " : "", a = D.htmlWhitespaceSensitivity === "ignore" ? i : d && F ? s : null;
          return e(a ? ["`", t([a, e(B)]), a, "`"] : ["`", d, J > 1 ? t(e(B)) : e(B), F, "`"]);
        }
        l.exports = h;
      } }), js = X({ "src/language-js/embed.js"(u, l) {
        H();
        var { hasComment: t, CommentCheckFlags: s, isObjectProperty: i } = Jt(), e = ws(), n = Ns(), r = ks(), o = Ps();
        function c(f) {
          if (y(f) || w(f) || P(f) || p(f))
            return "css";
          if (S(f))
            return "graphql";
          if (k(f))
            return "html";
          if (D(f))
            return "angular";
          if (m(f))
            return "markdown";
        }
        function h(f, B, d, F) {
          let a = f.getValue();
          if (a.type !== "TemplateLiteral" || J(a))
            return;
          let g = c(f);
          if (g) {
            if (g === "markdown")
              return e(f, B, d);
            if (g === "css")
              return n(f, B, d);
            if (g === "graphql")
              return r(f, B, d);
            if (g === "html" || g === "angular")
              return o(f, B, d, F, { parser: g });
          }
        }
        function m(f) {
          let B = f.getValue(), d = f.getParentNode();
          return d && d.type === "TaggedTemplateExpression" && B.quasis.length === 1 && d.tag.type === "Identifier" && (d.tag.name === "md" || d.tag.name === "markdown");
        }
        function y(f) {
          let B = f.getValue(), d = f.getParentNode(), F = f.getParentNode(1);
          return F && B.quasis && d.type === "JSXExpressionContainer" && F.type === "JSXElement" && F.openingElement.name.name === "style" && F.openingElement.attributes.some((a) => a.name.name === "jsx") || d && d.type === "TaggedTemplateExpression" && d.tag.type === "Identifier" && d.tag.name === "css" || d && d.type === "TaggedTemplateExpression" && d.tag.type === "MemberExpression" && d.tag.object.name === "css" && (d.tag.property.name === "global" || d.tag.property.name === "resolve");
        }
        function p(f) {
          return f.match((B) => B.type === "TemplateLiteral", (B, d) => B.type === "ArrayExpression" && d === "elements", (B, d) => i(B) && B.key.type === "Identifier" && B.key.name === "styles" && d === "value", ...C);
        }
        function D(f) {
          return f.match((B) => B.type === "TemplateLiteral", (B, d) => i(B) && B.key.type === "Identifier" && B.key.name === "template" && d === "value", ...C);
        }
        var C = [(f, B) => f.type === "ObjectExpression" && B === "properties", (f, B) => f.type === "CallExpression" && f.callee.type === "Identifier" && f.callee.name === "Component" && B === "arguments", (f, B) => f.type === "Decorator" && B === "expression"];
        function w(f) {
          let B = f.getParentNode();
          if (!B || B.type !== "TaggedTemplateExpression")
            return !1;
          let d = B.tag.type === "ParenthesizedExpression" ? B.tag.expression : B.tag;
          switch (d.type) {
            case "MemberExpression":
              return A(d.object) || N(d);
            case "CallExpression":
              return A(d.callee) || d.callee.type === "MemberExpression" && (d.callee.object.type === "MemberExpression" && (A(d.callee.object.object) || N(d.callee.object)) || d.callee.object.type === "CallExpression" && A(d.callee.object.callee));
            case "Identifier":
              return d.name === "css";
            default:
              return !1;
          }
        }
        function P(f) {
          let B = f.getParentNode(), d = f.getParentNode(1);
          return d && B.type === "JSXExpressionContainer" && d.type === "JSXAttribute" && d.name.type === "JSXIdentifier" && d.name.name === "css";
        }
        function A(f) {
          return f.type === "Identifier" && f.name === "styled";
        }
        function N(f) {
          return /^[A-Z]/.test(f.object.name) && f.property.name === "extend";
        }
        function S(f) {
          let B = f.getValue(), d = f.getParentNode();
          return j(B, "GraphQL") || d && (d.type === "TaggedTemplateExpression" && (d.tag.type === "MemberExpression" && d.tag.object.name === "graphql" && d.tag.property.name === "experimental" || d.tag.type === "Identifier" && (d.tag.name === "gql" || d.tag.name === "graphql")) || d.type === "CallExpression" && d.callee.type === "Identifier" && d.callee.name === "graphql");
        }
        function j(f, B) {
          return t(f, s.Block | s.Leading, (d) => {
            let { value: F } = d;
            return F === ` ${B} `;
          });
        }
        function k(f) {
          return j(f.getValue(), "HTML") || f.match((B) => B.type === "TemplateLiteral", (B, d) => B.type === "TaggedTemplateExpression" && B.tag.type === "Identifier" && B.tag.name === "html" && d === "quasi");
        }
        function J(f) {
          let { quasis: B } = f;
          return B.some((d) => {
            let { value: { cooked: F } } = d;
            return F === null;
          });
        }
        l.exports = h;
      } }), Is = X({ "src/language-js/clean.js"(u, l) {
        H();
        var t = er(), s = /* @__PURE__ */ new Set(["range", "raw", "comments", "leadingComments", "trailingComments", "innerComments", "extra", "start", "end", "loc", "flags", "errors", "tokens"]), i = (n) => {
          for (let r of n.quasis)
            delete r.value;
        };
        function e(n, r, o) {
          if (n.type === "Program" && delete r.sourceType, (n.type === "BigIntLiteral" || n.type === "BigIntLiteralTypeAnnotation") && r.value && (r.value = r.value.toLowerCase()), (n.type === "BigIntLiteral" || n.type === "Literal") && r.bigint && (r.bigint = r.bigint.toLowerCase()), n.type === "DecimalLiteral" && (r.value = Number(r.value)), n.type === "Literal" && r.decimal && (r.decimal = Number(r.decimal)), n.type === "EmptyStatement" || n.type === "JSXText" || n.type === "JSXExpressionContainer" && (n.expression.type === "Literal" || n.expression.type === "StringLiteral") && n.expression.value === " ")
            return null;
          if ((n.type === "Property" || n.type === "ObjectProperty" || n.type === "MethodDefinition" || n.type === "ClassProperty" || n.type === "ClassMethod" || n.type === "PropertyDefinition" || n.type === "TSDeclareMethod" || n.type === "TSPropertySignature" || n.type === "ObjectTypeProperty") && typeof n.key == "object" && n.key && (n.key.type === "Literal" || n.key.type === "NumericLiteral" || n.key.type === "StringLiteral" || n.key.type === "Identifier") && delete r.key, n.type === "JSXElement" && n.openingElement.name.name === "style" && n.openingElement.attributes.some((m) => m.name.name === "jsx"))
            for (let { type: m, expression: y } of r.children)
              m === "JSXExpressionContainer" && y.type === "TemplateLiteral" && i(y);
          n.type === "JSXAttribute" && n.name.name === "css" && n.value.type === "JSXExpressionContainer" && n.value.expression.type === "TemplateLiteral" && i(r.value.expression), n.type === "JSXAttribute" && n.value && n.value.type === "Literal" && /["']|&quot;|&apos;/.test(n.value.value) && (r.value.value = r.value.value.replace(/["']|&quot;|&apos;/g, '"'));
          let c = n.expression || n.callee;
          if (n.type === "Decorator" && c.type === "CallExpression" && c.callee.name === "Component" && c.arguments.length === 1) {
            let m = n.expression.arguments[0].properties;
            for (let [y, p] of r.expression.arguments[0].properties.entries())
              switch (m[y].key.name) {
                case "styles":
                  p.value.type === "ArrayExpression" && i(p.value.elements[0]);
                  break;
                case "template":
                  p.value.type === "TemplateLiteral" && i(p.value);
                  break;
              }
          }
          if (n.type === "TaggedTemplateExpression" && (n.tag.type === "MemberExpression" || n.tag.type === "Identifier" && (n.tag.name === "gql" || n.tag.name === "graphql" || n.tag.name === "css" || n.tag.name === "md" || n.tag.name === "markdown" || n.tag.name === "html") || n.tag.type === "CallExpression") && i(r.quasi), n.type === "TemplateLiteral") {
            var h;
            (!((h = n.leadingComments) === null || h === void 0) && h.some((m) => t(m) && ["GraphQL", "HTML"].some((y) => m.value === ` ${y} `)) || o.type === "CallExpression" && o.callee.name === "graphql" || !n.leadingComments) && i(r);
          }
          if (n.type === "InterpreterDirective" && (r.value = r.value.trimEnd()), (n.type === "TSIntersectionType" || n.type === "TSUnionType") && n.types.length === 1)
            return r.types[0];
        }
        e.ignoredProperties = s, l.exports = e;
      } }), fi = {};
      lt(fi, { EOL: () => Su, arch: () => _s, cpus: () => Fi, default: () => Si, endianness: () => mi, freemem: () => Ei, getNetworkInterfaces: () => xi, hostname: () => gi, loadavg: () => yi, networkInterfaces: () => bi, platform: () => Ls, release: () => vi, tmpDir: () => bu, tmpdir: () => xu, totalmem: () => Ci, type: () => Ai, uptime: () => hi });
      function mi() {
        if (typeof Zr > "u") {
          var u = new ArrayBuffer(2), l = new Uint8Array(u), t = new Uint16Array(u);
          if (l[0] = 1, l[1] = 2, t[0] === 258)
            Zr = "BE";
          else if (t[0] === 513)
            Zr = "LE";
          else
            throw new Error("unable to figure out endianess");
        }
        return Zr;
      }
      function gi() {
        return typeof globalThis.location < "u" ? globalThis.location.hostname : "";
      }
      function yi() {
        return [];
      }
      function hi() {
        return 0;
      }
      function Ei() {
        return Number.MAX_VALUE;
      }
      function Ci() {
        return Number.MAX_VALUE;
      }
      function Fi() {
        return [];
      }
      function Ai() {
        return "Browser";
      }
      function vi() {
        return typeof globalThis.navigator < "u" ? globalThis.navigator.appVersion : "";
      }
      function bi() {
      }
      function xi() {
      }
      function _s() {
        return "javascript";
      }
      function Ls() {
        return "browser";
      }
      function bu() {
        return "/tmp";
      }
      var Zr, xu, Su, Si, Os = Ze({ "node-modules-polyfills:os"() {
        H(), xu = bu, Su = `
`, Si = { EOL: Su, tmpdir: xu, tmpDir: bu, networkInterfaces: bi, getNetworkInterfaces: xi, release: vi, type: Ai, cpus: Fi, totalmem: Ci, freemem: Ei, uptime: hi, loadavg: yi, hostname: gi, endianness: mi };
      } }), Ms = X({ "node-modules-polyfills-commonjs:os"(u, l) {
        H();
        var t = (Os(), Tt(fi));
        if (t && t.default) {
          l.exports = t.default;
          for (let s in t)
            l.exports[s] = t[s];
        } else
          t && (l.exports = t);
      } }), $s = X({ "node_modules/detect-newline/index.js"(u, l) {
        H();
        var t = (s) => {
          if (typeof s != "string")
            throw new TypeError("Expected a string");
          let i = s.match(/(?:\r?\n)/g) || [];
          if (i.length === 0)
            return;
          let e = i.filter((r) => r === `\r
`).length, n = i.length - e;
          return e > n ? `\r
` : `
`;
        };
        l.exports = t, l.exports.graceful = (s) => typeof s == "string" && t(s) || `
`;
      } }), Rs = X({ "node_modules/jest-docblock/build/index.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 }), u.extract = p, u.parse = C, u.parseWithComments = w, u.print = P, u.strip = D;
        function l() {
          let N = Ms();
          return l = function() {
            return N;
          }, N;
        }
        function t() {
          let N = s($s());
          return t = function() {
            return N;
          }, N;
        }
        function s(N) {
          return N && N.__esModule ? N : { default: N };
        }
        var i = /\*\/$/, e = /^\/\*\*?/, n = /^\s*(\/\*\*?(.|\r?\n)*?\*\/)/, r = /(^|\s+)\/\/([^\r\n]*)/g, o = /^(\r?\n)+/, c = /(?:^|\r?\n) *(@[^\r\n]*?) *\r?\n *(?![^@\r\n]*\/\/[^]*)([^@\r\n\s][^@\r\n]+?) *\r?\n/g, h = /(?:^|\r?\n) *@(\S+) *([^\r\n]*)/g, m = /(\r?\n|^) *\* ?/g, y = [];
        function p(N) {
          let S = N.match(n);
          return S ? S[0].trimLeft() : "";
        }
        function D(N) {
          let S = N.match(n);
          return S && S[0] ? N.substring(S[0].length) : N;
        }
        function C(N) {
          return w(N).pragmas;
        }
        function w(N) {
          let S = (0, t().default)(N) || l().EOL;
          N = N.replace(e, "").replace(i, "").replace(m, "$1");
          let j = "";
          for (; j !== N; )
            j = N, N = N.replace(c, `${S}$1 $2${S}`);
          N = N.replace(o, "").trimRight();
          let k = /* @__PURE__ */ Object.create(null), J = N.replace(h, "").replace(o, "").trimRight(), f;
          for (; f = h.exec(N); ) {
            let B = f[2].replace(r, "");
            typeof k[f[1]] == "string" || Array.isArray(k[f[1]]) ? k[f[1]] = y.concat(k[f[1]], B) : k[f[1]] = B;
          }
          return { comments: J, pragmas: k };
        }
        function P(N) {
          let { comments: S = "", pragmas: j = {} } = N, k = (0, t().default)(S) || l().EOL, J = "/**", f = " *", B = " */", d = Object.keys(j), F = d.map((g) => A(g, j[g])).reduce((g, E) => g.concat(E), []).map((g) => `${f} ${g}${k}`).join("");
          if (!S) {
            if (d.length === 0)
              return "";
            if (d.length === 1 && !Array.isArray(j[d[0]])) {
              let g = j[d[0]];
              return `${J} ${A(d[0], g)[0]}${B}`;
            }
          }
          let a = S.split(k).map((g) => `${f} ${g}`).join(k) + k;
          return J + k + (S ? a : "") + (S && d.length ? f + k : "") + F + B;
        }
        function A(N, S) {
          return y.concat(S).map((j) => `@${N} ${j}`.trim());
        }
      } }), Vs = X({ "src/language-js/utils/get-shebang.js"(u, l) {
        H();
        function t(s) {
          if (!s.startsWith("#!"))
            return "";
          let i = s.indexOf(`
`);
          return i === -1 ? s : s.slice(0, i);
        }
        l.exports = t;
      } }), Bi = X({ "src/language-js/pragma.js"(u, l) {
        H();
        var { parseWithComments: t, strip: s, extract: i, print: e } = Rs(), { normalizeEndOfLine: n } = Xn(), r = Vs();
        function o(m) {
          let y = r(m);
          y && (m = m.slice(y.length + 1));
          let p = i(m), { pragmas: D, comments: C } = t(p);
          return { shebang: y, text: m, pragmas: D, comments: C };
        }
        function c(m) {
          let y = Object.keys(o(m).pragmas);
          return y.includes("prettier") || y.includes("format");
        }
        function h(m) {
          let { shebang: y, text: p, pragmas: D, comments: C } = o(m), w = s(p), P = e({ pragmas: Object.assign({ format: "" }, D), comments: C.trimStart() });
          return (y ? `${y}
` : "") + n(P) + (w.startsWith(`
`) ? `
` : `

`) + w;
        }
        l.exports = { hasPragma: c, insertPragma: h };
      } }), Js = X({ "src/language-js/utils/is-type-cast-comment.js"(u, l) {
        H();
        var t = er();
        function s(i) {
          return t(i) && i.value[0] === "*" && /@(?:type|satisfies)\b/.test(i.value);
        }
        l.exports = s;
      } }), Ti = X({ "src/language-js/comments.js"(u, l) {
        H();
        var { getLast: t, hasNewline: s, getNextNonSpaceNonCommentCharacterIndexWithStartIndex: i, getNextNonSpaceNonCommentCharacter: e, hasNewlineInRange: n, addLeadingComment: r, addTrailingComment: o, addDanglingComment: c, getNextNonSpaceNonCommentCharacterIndex: h, isNonEmptyArray: m } = bt(), { getFunctionParameters: y, isPrettierIgnoreComment: p, isJsxNode: D, hasFlowShorthandAnnotationComment: C, hasFlowAnnotationComment: w, hasIgnoreComment: P, isCallLikeExpression: A, getCallArguments: N, isCallExpression: S, isMemberExpression: j, isObjectProperty: k, isLineComment: J, getComments: f, CommentCheckFlags: B, markerForIfWithoutBlockAndSameLineComment: d } = Jt(), { locStart: F, locEnd: a } = yn(), g = er(), E = Js();
        function b(Ee) {
          return [G, _e, ee, $, U, _, ae, Be, ue, be, ze, mt, he, Q, W].some((v) => v(Ee));
        }
        function x(Ee) {
          return [V, _e, R, ze, $, U, _, ae, Q, re, Ce, be, tt, W, K].some((v) => v(Ee));
        }
        function T(Ee) {
          return [G, $, U, O, ge, he, be, me, Y, ye, W, ce].some((v) => v(Ee));
        }
        function I(Ee, v) {
          let z = (Ee.body || Ee.properties).find((se) => {
            let { type: Se } = se;
            return Se !== "EmptyStatement";
          });
          z ? r(z, v) : c(Ee, v);
        }
        function M(Ee, v) {
          Ee.type === "BlockStatement" ? I(Ee, v) : r(Ee, v);
        }
        function V(Ee) {
          let { comment: v, followingNode: z } = Ee;
          return z && E(v) ? (r(z, v), !0) : !1;
        }
        function $(Ee) {
          let { comment: v, precedingNode: z, enclosingNode: se, followingNode: Se, text: Pe } = Ee;
          if ((se == null ? void 0 : se.type) !== "IfStatement" || !Se)
            return !1;
          if (e(Pe, v, a) === ")")
            return o(z, v), !0;
          if (z === se.consequent && Se === se.alternate) {
            if (z.type === "BlockStatement")
              o(z, v);
            else {
              let Xe = v.type === "SingleLine" || v.loc.start.line === v.loc.end.line, Te = v.loc.start.line === z.loc.start.line;
              Xe && Te ? c(z, v, d) : c(se, v);
            }
            return !0;
          }
          return Se.type === "BlockStatement" ? (I(Se, v), !0) : Se.type === "IfStatement" ? (M(Se.consequent, v), !0) : se.consequent === Se ? (r(Se, v), !0) : !1;
        }
        function U(Ee) {
          let { comment: v, precedingNode: z, enclosingNode: se, followingNode: Se, text: Pe } = Ee;
          return (se == null ? void 0 : se.type) !== "WhileStatement" || !Se ? !1 : e(Pe, v, a) === ")" ? (o(z, v), !0) : Se.type === "BlockStatement" ? (I(Se, v), !0) : se.body === Se ? (r(Se, v), !0) : !1;
        }
        function _(Ee) {
          let { comment: v, precedingNode: z, enclosingNode: se, followingNode: Se } = Ee;
          return (se == null ? void 0 : se.type) !== "TryStatement" && (se == null ? void 0 : se.type) !== "CatchClause" || !Se ? !1 : se.type === "CatchClause" && z ? (o(z, v), !0) : Se.type === "BlockStatement" ? (I(Se, v), !0) : Se.type === "TryStatement" ? (M(Se.finalizer, v), !0) : Se.type === "CatchClause" ? (M(Se.body, v), !0) : !1;
        }
        function ee(Ee) {
          let { comment: v, enclosingNode: z, followingNode: se } = Ee;
          return j(z) && (se == null ? void 0 : se.type) === "Identifier" ? (r(z, v), !0) : !1;
        }
        function R(Ee) {
          let { comment: v, precedingNode: z, enclosingNode: se, followingNode: Se, text: Pe } = Ee, Xe = z && !n(Pe, a(z), F(v));
          return (!z || !Xe) && ((se == null ? void 0 : se.type) === "ConditionalExpression" || (se == null ? void 0 : se.type) === "TSConditionalType") && Se ? (r(Se, v), !0) : !1;
        }
        function O(Ee) {
          let { comment: v, precedingNode: z, enclosingNode: se } = Ee;
          return k(se) && se.shorthand && se.key === z && se.value.type === "AssignmentPattern" ? (o(se.value.left, v), !0) : !1;
        }
        var Z = /* @__PURE__ */ new Set(["ClassDeclaration", "ClassExpression", "DeclareClass", "DeclareInterface", "InterfaceDeclaration", "TSInterfaceDeclaration"]);
        function ae(Ee) {
          let { comment: v, precedingNode: z, enclosingNode: se, followingNode: Se } = Ee;
          if (Z.has(se == null ? void 0 : se.type)) {
            if (m(se.decorators) && !(Se && Se.type === "Decorator"))
              return o(t(se.decorators), v), !0;
            if (se.body && Se === se.body)
              return I(se.body, v), !0;
            if (Se) {
              if (se.superClass && Se === se.superClass && z && (z === se.id || z === se.typeParameters))
                return o(z, v), !0;
              for (let Pe of ["implements", "extends", "mixins"])
                if (se[Pe] && Se === se[Pe][0])
                  return z && (z === se.id || z === se.typeParameters || z === se.superClass) ? o(z, v) : c(se, v, Pe), !0;
            }
          }
          return !1;
        }
        var ne = /* @__PURE__ */ new Set(["ClassMethod", "ClassProperty", "PropertyDefinition", "TSAbstractPropertyDefinition", "TSAbstractMethodDefinition", "TSDeclareMethod", "MethodDefinition", "ClassAccessorProperty", "AccessorProperty", "TSAbstractAccessorProperty"]);
        function he(Ee) {
          let { comment: v, precedingNode: z, enclosingNode: se, text: Se } = Ee;
          return se && z && e(Se, v, a) === "(" && (se.type === "Property" || se.type === "TSDeclareMethod" || se.type === "TSAbstractMethodDefinition") && z.type === "Identifier" && se.key === z && e(Se, z, a) !== ":" || (z == null ? void 0 : z.type) === "Decorator" && ne.has(se == null ? void 0 : se.type) ? (o(z, v), !0) : !1;
        }
        var q = /* @__PURE__ */ new Set(["FunctionDeclaration", "FunctionExpression", "ClassMethod", "MethodDefinition", "ObjectMethod"]);
        function Y(Ee) {
          let { comment: v, precedingNode: z, enclosingNode: se, text: Se } = Ee;
          return e(Se, v, a) !== "(" ? !1 : z && q.has(se == null ? void 0 : se.type) ? (o(z, v), !0) : !1;
        }
        function me(Ee) {
          let { comment: v, enclosingNode: z, text: se } = Ee;
          if ((z == null ? void 0 : z.type) !== "ArrowFunctionExpression")
            return !1;
          let Se = h(se, v, a);
          return Se !== !1 && se.slice(Se, Se + 2) === "=>" ? (c(z, v), !0) : !1;
        }
        function ge(Ee) {
          let { comment: v, enclosingNode: z, text: se } = Ee;
          return e(se, v, a) !== ")" ? !1 : z && (fe(z) && y(z).length === 0 || A(z) && N(z).length === 0) ? (c(z, v), !0) : ((z == null ? void 0 : z.type) === "MethodDefinition" || (z == null ? void 0 : z.type) === "TSAbstractMethodDefinition") && y(z.value).length === 0 ? (c(z.value, v), !0) : !1;
        }
        function _e(Ee) {
          let { comment: v, precedingNode: z, enclosingNode: se, followingNode: Se, text: Pe } = Ee;
          if ((z == null ? void 0 : z.type) === "FunctionTypeParam" && (se == null ? void 0 : se.type) === "FunctionTypeAnnotation" && (Se == null ? void 0 : Se.type) !== "FunctionTypeParam" || ((z == null ? void 0 : z.type) === "Identifier" || (z == null ? void 0 : z.type) === "AssignmentPattern") && se && fe(se) && e(Pe, v, a) === ")")
            return o(z, v), !0;
          if ((se == null ? void 0 : se.type) === "FunctionDeclaration" && (Se == null ? void 0 : Se.type) === "BlockStatement") {
            let Xe = (() => {
              let Te = y(se);
              if (Te.length > 0)
                return i(Pe, a(t(Te)));
              let Wt = i(Pe, a(se.id));
              return Wt !== !1 && i(Pe, Wt + 1);
            })();
            if (F(v) > Xe)
              return I(Se, v), !0;
          }
          return !1;
        }
        function Q(Ee) {
          let { comment: v, enclosingNode: z } = Ee;
          return (z == null ? void 0 : z.type) === "LabeledStatement" ? (r(z, v), !0) : !1;
        }
        function W(Ee) {
          let { comment: v, enclosingNode: z } = Ee;
          return ((z == null ? void 0 : z.type) === "ContinueStatement" || (z == null ? void 0 : z.type) === "BreakStatement") && !z.label ? (o(z, v), !0) : !1;
        }
        function re(Ee) {
          let { comment: v, precedingNode: z, enclosingNode: se } = Ee;
          return S(se) && z && se.callee === z && se.arguments.length > 0 ? (r(se.arguments[0], v), !0) : !1;
        }
        function ue(Ee) {
          let { comment: v, precedingNode: z, enclosingNode: se, followingNode: Se } = Ee;
          return (se == null ? void 0 : se.type) === "UnionTypeAnnotation" || (se == null ? void 0 : se.type) === "TSUnionType" ? (p(v) && (Se.prettierIgnore = !0, v.unignore = !0), z ? (o(z, v), !0) : !1) : (((Se == null ? void 0 : Se.type) === "UnionTypeAnnotation" || (Se == null ? void 0 : Se.type) === "TSUnionType") && p(v) && (Se.types[0].prettierIgnore = !0, v.unignore = !0), !1);
        }
        function Ce(Ee) {
          let { comment: v, enclosingNode: z } = Ee;
          return k(z) ? (r(z, v), !0) : !1;
        }
        function be(Ee) {
          let { comment: v, enclosingNode: z, followingNode: se, ast: Se, isLastComment: Pe } = Ee;
          return Se && Se.body && Se.body.length === 0 ? (Pe ? c(Se, v) : r(Se, v), !0) : (z == null ? void 0 : z.type) === "Program" && (z == null ? void 0 : z.body.length) === 0 && !m(z.directives) ? (Pe ? c(z, v) : r(z, v), !0) : (se == null ? void 0 : se.type) === "Program" && (se == null ? void 0 : se.body.length) === 0 && (z == null ? void 0 : z.type) === "ModuleExpression" ? (c(se, v), !0) : !1;
        }
        function Be(Ee) {
          let { comment: v, enclosingNode: z } = Ee;
          return (z == null ? void 0 : z.type) === "ForInStatement" || (z == null ? void 0 : z.type) === "ForOfStatement" ? (r(z, v), !0) : !1;
        }
        function ze(Ee) {
          let { comment: v, precedingNode: z, enclosingNode: se, text: Se } = Ee;
          if ((se == null ? void 0 : se.type) === "ImportSpecifier" || (se == null ? void 0 : se.type) === "ExportSpecifier")
            return r(se, v), !0;
          let Pe = (z == null ? void 0 : z.type) === "ImportSpecifier" && (se == null ? void 0 : se.type) === "ImportDeclaration", Xe = (z == null ? void 0 : z.type) === "ExportSpecifier" && (se == null ? void 0 : se.type) === "ExportNamedDeclaration";
          return (Pe || Xe) && s(Se, a(v)) ? (o(z, v), !0) : !1;
        }
        function mt(Ee) {
          let { comment: v, enclosingNode: z } = Ee;
          return (z == null ? void 0 : z.type) === "AssignmentPattern" ? (r(z, v), !0) : !1;
        }
        var Dt = /* @__PURE__ */ new Set(["VariableDeclarator", "AssignmentExpression", "TypeAlias", "TSTypeAliasDeclaration"]), Ue = /* @__PURE__ */ new Set(["ObjectExpression", "ArrayExpression", "TemplateLiteral", "TaggedTemplateExpression", "ObjectTypeAnnotation", "TSTypeLiteral"]);
        function tt(Ee) {
          let { comment: v, enclosingNode: z, followingNode: se } = Ee;
          return Dt.has(z == null ? void 0 : z.type) && se && (Ue.has(se.type) || g(v)) ? (r(se, v), !0) : !1;
        }
        function ce(Ee) {
          let { comment: v, enclosingNode: z, followingNode: se, text: Se } = Ee;
          return !se && ((z == null ? void 0 : z.type) === "TSMethodSignature" || (z == null ? void 0 : z.type) === "TSDeclareFunction" || (z == null ? void 0 : z.type) === "TSAbstractMethodDefinition") && e(Se, v, a) === ";" ? (o(z, v), !0) : !1;
        }
        function G(Ee) {
          let { comment: v, enclosingNode: z, followingNode: se } = Ee;
          if (p(v) && (z == null ? void 0 : z.type) === "TSMappedType" && (se == null ? void 0 : se.type) === "TSTypeParameter" && se.constraint)
            return z.prettierIgnore = !0, v.unignore = !0, !0;
        }
        function ye(Ee) {
          let { comment: v, precedingNode: z, enclosingNode: se, followingNode: Se } = Ee;
          return (se == null ? void 0 : se.type) !== "TSMappedType" ? !1 : (Se == null ? void 0 : Se.type) === "TSTypeParameter" && Se.name ? (r(Se.name, v), !0) : (z == null ? void 0 : z.type) === "TSTypeParameter" && z.constraint ? (o(z.constraint, v), !0) : !1;
        }
        function K(Ee) {
          let { comment: v, enclosingNode: z, followingNode: se } = Ee;
          return !z || z.type !== "SwitchCase" || z.test || !se || se !== z.consequent[0] ? !1 : (se.type === "BlockStatement" && J(v) ? I(se, v) : c(z, v), !0);
        }
        function fe(Ee) {
          return Ee.type === "ArrowFunctionExpression" || Ee.type === "FunctionExpression" || Ee.type === "FunctionDeclaration" || Ee.type === "ObjectMethod" || Ee.type === "ClassMethod" || Ee.type === "TSDeclareFunction" || Ee.type === "TSCallSignatureDeclaration" || Ee.type === "TSConstructSignatureDeclaration" || Ee.type === "TSMethodSignature" || Ee.type === "TSConstructorType" || Ee.type === "TSFunctionType" || Ee.type === "TSDeclareMethod";
        }
        function Ve(Ee, v) {
          if ((v.parser === "typescript" || v.parser === "flow" || v.parser === "acorn" || v.parser === "espree" || v.parser === "meriyah" || v.parser === "__babel_estree") && Ee.type === "MethodDefinition" && Ee.value && Ee.value.type === "FunctionExpression" && y(Ee.value).length === 0 && !Ee.value.returnType && !m(Ee.value.typeParameters) && Ee.value.body)
            return [...Ee.decorators || [], Ee.key, Ee.value.body];
        }
        function Ie(Ee) {
          let v = Ee.getValue(), z = Ee.getParentNode(), se = (Se) => w(f(Se, B.Leading)) || w(f(Se, B.Trailing));
          return (v && (D(v) || C(v) || S(z) && se(v)) || z && (z.type === "JSXSpreadAttribute" || z.type === "JSXSpreadChild" || z.type === "UnionTypeAnnotation" || z.type === "TSUnionType" || (z.type === "ClassDeclaration" || z.type === "ClassExpression") && z.superClass === v)) && (!P(Ee) || z.type === "UnionTypeAnnotation" || z.type === "TSUnionType");
        }
        l.exports = { handleOwnLineComment: b, handleEndOfLineComment: x, handleRemainingComment: T, getCommentChildNodes: Ve, willPrintOwnComments: Ie };
      } }), lr = X({ "src/language-js/needs-parens.js"(u, l) {
        H();
        var t = cn(), s = mu(), { getFunctionParameters: i, getLeftSidePathName: e, hasFlowShorthandAnnotationComment: n, hasNakedLeftSide: r, hasNode: o, isBitwiseOperator: c, startsWithNoLookaheadToken: h, shouldFlatten: m, getPrecedence: y, isCallExpression: p, isMemberExpression: D, isObjectProperty: C, isTSTypeExpression: w } = Jt();
        function P(f, B) {
          let d = f.getParentNode();
          if (!d)
            return !1;
          let F = f.getName(), a = f.getNode();
          if (B.__isInHtmlInterpolation && !B.bracketSpacing && j(a) && k(f))
            return !0;
          if (A(a))
            return !1;
          if (B.parser !== "flow" && n(f.getValue()))
            return !0;
          if (a.type === "Identifier") {
            if (a.extra && a.extra.parenthesized && /^PRETTIER_HTML_PLACEHOLDER_\d+_\d+_IN_JS$/.test(a.name) || F === "left" && (a.name === "async" && !d.await || a.name === "let") && d.type === "ForOfStatement")
              return !0;
            if (a.name === "let") {
              var g;
              let b = (g = f.findAncestor((x) => x.type === "ForOfStatement")) === null || g === void 0 ? void 0 : g.left;
              if (b && h(b, (x) => x === a))
                return !0;
            }
            if (F === "object" && a.name === "let" && d.type === "MemberExpression" && d.computed && !d.optional) {
              let b = f.findAncestor((T) => T.type === "ExpressionStatement" || T.type === "ForStatement" || T.type === "ForInStatement"), x = b ? b.type === "ExpressionStatement" ? b.expression : b.type === "ForStatement" ? b.init : b.left : void 0;
              if (x && h(x, (T) => T === a))
                return !0;
            }
            return !1;
          }
          if (a.type === "ObjectExpression" || a.type === "FunctionExpression" || a.type === "ClassExpression" || a.type === "DoExpression") {
            var E;
            let b = (E = f.findAncestor((x) => x.type === "ExpressionStatement")) === null || E === void 0 ? void 0 : E.expression;
            if (b && h(b, (x) => x === a))
              return !0;
          }
          switch (d.type) {
            case "ParenthesizedExpression":
              return !1;
            case "ClassDeclaration":
            case "ClassExpression": {
              if (F === "superClass" && (a.type === "ArrowFunctionExpression" || a.type === "AssignmentExpression" || a.type === "AwaitExpression" || a.type === "BinaryExpression" || a.type === "ConditionalExpression" || a.type === "LogicalExpression" || a.type === "NewExpression" || a.type === "ObjectExpression" || a.type === "SequenceExpression" || a.type === "TaggedTemplateExpression" || a.type === "UnaryExpression" || a.type === "UpdateExpression" || a.type === "YieldExpression" || a.type === "TSNonNullExpression"))
                return !0;
              break;
            }
            case "ExportDefaultDeclaration":
              return J(f, B) || a.type === "SequenceExpression";
            case "Decorator": {
              if (F === "expression") {
                let b = !1, x = !1, T = a;
                for (; T; )
                  switch (T.type) {
                    case "MemberExpression":
                      x = !0, T = T.object;
                      break;
                    case "CallExpression":
                      if (x || b)
                        return B.parser !== "typescript";
                      b = !0, T = T.callee;
                      break;
                    case "Identifier":
                      return !1;
                    case "TaggedTemplateExpression":
                      return B.parser !== "typescript";
                    default:
                      return !0;
                  }
                return !0;
              }
              break;
            }
            case "ArrowFunctionExpression": {
              if (F === "body" && a.type !== "SequenceExpression" && h(a, (b) => b.type === "ObjectExpression"))
                return !0;
              break;
            }
          }
          switch (a.type) {
            case "UpdateExpression":
              if (d.type === "UnaryExpression")
                return a.prefix && (a.operator === "++" && d.operator === "+" || a.operator === "--" && d.operator === "-");
            case "UnaryExpression":
              switch (d.type) {
                case "UnaryExpression":
                  return a.operator === d.operator && (a.operator === "+" || a.operator === "-");
                case "BindExpression":
                  return !0;
                case "MemberExpression":
                case "OptionalMemberExpression":
                  return F === "object";
                case "TaggedTemplateExpression":
                  return !0;
                case "NewExpression":
                case "CallExpression":
                case "OptionalCallExpression":
                  return F === "callee";
                case "BinaryExpression":
                  return F === "left" && d.operator === "**";
                case "TSNonNullExpression":
                  return !0;
                default:
                  return !1;
              }
            case "BinaryExpression": {
              if (d.type === "UpdateExpression" || a.operator === "in" && N(f))
                return !0;
              if (a.operator === "|>" && a.extra && a.extra.parenthesized) {
                let b = f.getParentNode(1);
                if (b.type === "BinaryExpression" && b.operator === "|>")
                  return !0;
              }
            }
            case "TSTypeAssertion":
            case "TSAsExpression":
            case "TSSatisfiesExpression":
            case "LogicalExpression":
              switch (d.type) {
                case "TSSatisfiesExpression":
                case "TSAsExpression":
                  return !w(a);
                case "ConditionalExpression":
                  return w(a);
                case "CallExpression":
                case "NewExpression":
                case "OptionalCallExpression":
                  return F === "callee";
                case "ClassExpression":
                case "ClassDeclaration":
                  return F === "superClass";
                case "TSTypeAssertion":
                case "TaggedTemplateExpression":
                case "UnaryExpression":
                case "JSXSpreadAttribute":
                case "SpreadElement":
                case "SpreadProperty":
                case "BindExpression":
                case "AwaitExpression":
                case "TSNonNullExpression":
                case "UpdateExpression":
                  return !0;
                case "MemberExpression":
                case "OptionalMemberExpression":
                  return F === "object";
                case "AssignmentExpression":
                case "AssignmentPattern":
                  return F === "left" && (a.type === "TSTypeAssertion" || w(a));
                case "LogicalExpression":
                  if (a.type === "LogicalExpression")
                    return d.operator !== a.operator;
                case "BinaryExpression": {
                  let { operator: b, type: x } = a;
                  if (!b && x !== "TSTypeAssertion")
                    return !0;
                  let T = y(b), I = d.operator, M = y(I);
                  return M > T || F === "right" && M === T || M === T && !m(I, b) ? !0 : M < T && b === "%" ? I === "+" || I === "-" : !!c(I);
                }
                default:
                  return !1;
              }
            case "SequenceExpression":
              switch (d.type) {
                case "ReturnStatement":
                  return !1;
                case "ForStatement":
                  return !1;
                case "ExpressionStatement":
                  return F !== "expression";
                case "ArrowFunctionExpression":
                  return F !== "body";
                default:
                  return !0;
              }
            case "YieldExpression":
              if (d.type === "UnaryExpression" || d.type === "AwaitExpression" || w(d) || d.type === "TSNonNullExpression")
                return !0;
            case "AwaitExpression":
              switch (d.type) {
                case "TaggedTemplateExpression":
                case "UnaryExpression":
                case "LogicalExpression":
                case "SpreadElement":
                case "SpreadProperty":
                case "TSAsExpression":
                case "TSSatisfiesExpression":
                case "TSNonNullExpression":
                case "BindExpression":
                  return !0;
                case "MemberExpression":
                case "OptionalMemberExpression":
                  return F === "object";
                case "NewExpression":
                case "CallExpression":
                case "OptionalCallExpression":
                  return F === "callee";
                case "ConditionalExpression":
                  return F === "test";
                case "BinaryExpression":
                  return !(!a.argument && d.operator === "|>");
                default:
                  return !1;
              }
            case "TSConditionalType":
            case "TSFunctionType":
            case "TSConstructorType":
              if (F === "extendsType" && d.type === "TSConditionalType") {
                if (a.type === "TSConditionalType")
                  return !0;
                let { typeAnnotation: b } = a.returnType || a.typeAnnotation;
                if (b.type === "TSTypePredicate" && b.typeAnnotation && (b = b.typeAnnotation.typeAnnotation), b.type === "TSInferType" && b.typeParameter.constraint)
                  return !0;
              }
              if (F === "checkType" && d.type === "TSConditionalType")
                return !0;
            case "TSUnionType":
            case "TSIntersectionType":
              if ((d.type === "TSUnionType" || d.type === "TSIntersectionType") && d.types.length > 1 && (!a.types || a.types.length > 1))
                return !0;
            case "TSInferType":
              if (a.type === "TSInferType" && d.type === "TSRestType")
                return !1;
            case "TSTypeOperator":
              return d.type === "TSArrayType" || d.type === "TSOptionalType" || d.type === "TSRestType" || F === "objectType" && d.type === "TSIndexedAccessType" || d.type === "TSTypeOperator" || d.type === "TSTypeAnnotation" && f.getParentNode(1).type.startsWith("TSJSDoc");
            case "TSTypeQuery":
              return F === "objectType" && d.type === "TSIndexedAccessType" || F === "elementType" && d.type === "TSArrayType";
            case "ArrayTypeAnnotation":
              return d.type === "NullableTypeAnnotation";
            case "IntersectionTypeAnnotation":
            case "UnionTypeAnnotation":
              return d.type === "ArrayTypeAnnotation" || d.type === "NullableTypeAnnotation" || d.type === "IntersectionTypeAnnotation" || d.type === "UnionTypeAnnotation" || F === "objectType" && (d.type === "IndexedAccessType" || d.type === "OptionalIndexedAccessType");
            case "NullableTypeAnnotation":
              return d.type === "ArrayTypeAnnotation" || F === "objectType" && (d.type === "IndexedAccessType" || d.type === "OptionalIndexedAccessType");
            case "FunctionTypeAnnotation": {
              let b = d.type === "NullableTypeAnnotation" ? f.getParentNode(1) : d;
              return b.type === "UnionTypeAnnotation" || b.type === "IntersectionTypeAnnotation" || b.type === "ArrayTypeAnnotation" || F === "objectType" && (b.type === "IndexedAccessType" || b.type === "OptionalIndexedAccessType") || b.type === "NullableTypeAnnotation" || d.type === "FunctionTypeParam" && d.name === null && i(a).some((x) => x.typeAnnotation && x.typeAnnotation.type === "NullableTypeAnnotation");
            }
            case "OptionalIndexedAccessType":
              return F === "objectType" && d.type === "IndexedAccessType";
            case "TypeofTypeAnnotation":
              return F === "objectType" && (d.type === "IndexedAccessType" || d.type === "OptionalIndexedAccessType");
            case "StringLiteral":
            case "NumericLiteral":
            case "Literal":
              if (typeof a.value == "string" && d.type === "ExpressionStatement" && !d.directive) {
                let b = f.getParentNode(1);
                return b.type === "Program" || b.type === "BlockStatement";
              }
              return F === "object" && d.type === "MemberExpression" && typeof a.value == "number";
            case "AssignmentExpression": {
              let b = f.getParentNode(1);
              return F === "body" && d.type === "ArrowFunctionExpression" ? !0 : F === "key" && (d.type === "ClassProperty" || d.type === "PropertyDefinition") && d.computed || (F === "init" || F === "update") && d.type === "ForStatement" ? !1 : d.type === "ExpressionStatement" ? a.left.type === "ObjectPattern" : !(F === "key" && d.type === "TSPropertySignature" || d.type === "AssignmentExpression" || d.type === "SequenceExpression" && b && b.type === "ForStatement" && (b.init === d || b.update === d) || F === "value" && d.type === "Property" && b && b.type === "ObjectPattern" && b.properties.includes(d) || d.type === "NGChainedExpression");
            }
            case "ConditionalExpression":
              switch (d.type) {
                case "TaggedTemplateExpression":
                case "UnaryExpression":
                case "SpreadElement":
                case "SpreadProperty":
                case "BinaryExpression":
                case "LogicalExpression":
                case "NGPipeExpression":
                case "ExportDefaultDeclaration":
                case "AwaitExpression":
                case "JSXSpreadAttribute":
                case "TSTypeAssertion":
                case "TypeCastExpression":
                case "TSAsExpression":
                case "TSSatisfiesExpression":
                case "TSNonNullExpression":
                  return !0;
                case "NewExpression":
                case "CallExpression":
                case "OptionalCallExpression":
                  return F === "callee";
                case "ConditionalExpression":
                  return F === "test";
                case "MemberExpression":
                case "OptionalMemberExpression":
                  return F === "object";
                default:
                  return !1;
              }
            case "FunctionExpression":
              switch (d.type) {
                case "NewExpression":
                case "CallExpression":
                case "OptionalCallExpression":
                  return F === "callee";
                case "TaggedTemplateExpression":
                  return !0;
                default:
                  return !1;
              }
            case "ArrowFunctionExpression":
              switch (d.type) {
                case "BinaryExpression":
                  return d.operator !== "|>" || a.extra && a.extra.parenthesized;
                case "NewExpression":
                case "CallExpression":
                case "OptionalCallExpression":
                  return F === "callee";
                case "MemberExpression":
                case "OptionalMemberExpression":
                  return F === "object";
                case "TSAsExpression":
                case "TSSatisfiesExpression":
                case "TSNonNullExpression":
                case "BindExpression":
                case "TaggedTemplateExpression":
                case "UnaryExpression":
                case "LogicalExpression":
                case "AwaitExpression":
                case "TSTypeAssertion":
                  return !0;
                case "ConditionalExpression":
                  return F === "test";
                default:
                  return !1;
              }
            case "ClassExpression":
              if (s(a.decorators))
                return !0;
              switch (d.type) {
                case "NewExpression":
                  return F === "callee";
                default:
                  return !1;
              }
            case "OptionalMemberExpression":
            case "OptionalCallExpression": {
              let b = f.getParentNode(1);
              if (F === "object" && d.type === "MemberExpression" || F === "callee" && (d.type === "CallExpression" || d.type === "NewExpression") || d.type === "TSNonNullExpression" && b.type === "MemberExpression" && b.object === d)
                return !0;
            }
            case "CallExpression":
            case "MemberExpression":
            case "TaggedTemplateExpression":
            case "TSNonNullExpression":
              if (F === "callee" && (d.type === "BindExpression" || d.type === "NewExpression")) {
                let b = a;
                for (; b; )
                  switch (b.type) {
                    case "CallExpression":
                    case "OptionalCallExpression":
                      return !0;
                    case "MemberExpression":
                    case "OptionalMemberExpression":
                    case "BindExpression":
                      b = b.object;
                      break;
                    case "TaggedTemplateExpression":
                      b = b.tag;
                      break;
                    case "TSNonNullExpression":
                      b = b.expression;
                      break;
                    default:
                      return !1;
                  }
              }
              return !1;
            case "BindExpression":
              return F === "callee" && (d.type === "BindExpression" || d.type === "NewExpression") || F === "object" && D(d);
            case "NGPipeExpression":
              return !(d.type === "NGRoot" || d.type === "NGMicrosyntaxExpression" || d.type === "ObjectProperty" && !(a.extra && a.extra.parenthesized) || d.type === "ArrayExpression" || p(d) && d.arguments[F] === a || F === "right" && d.type === "NGPipeExpression" || F === "property" && d.type === "MemberExpression" || d.type === "AssignmentExpression");
            case "JSXFragment":
            case "JSXElement":
              return F === "callee" || F === "left" && d.type === "BinaryExpression" && d.operator === "<" || d.type !== "ArrayExpression" && d.type !== "ArrowFunctionExpression" && d.type !== "AssignmentExpression" && d.type !== "AssignmentPattern" && d.type !== "BinaryExpression" && d.type !== "NewExpression" && d.type !== "ConditionalExpression" && d.type !== "ExpressionStatement" && d.type !== "JsExpressionRoot" && d.type !== "JSXAttribute" && d.type !== "JSXElement" && d.type !== "JSXExpressionContainer" && d.type !== "JSXFragment" && d.type !== "LogicalExpression" && !p(d) && !C(d) && d.type !== "ReturnStatement" && d.type !== "ThrowStatement" && d.type !== "TypeCastExpression" && d.type !== "VariableDeclarator" && d.type !== "YieldExpression";
            case "TypeAnnotation":
              return F === "returnType" && d.type === "ArrowFunctionExpression" && S(a);
          }
          return !1;
        }
        function A(f) {
          return f.type === "BlockStatement" || f.type === "BreakStatement" || f.type === "ClassBody" || f.type === "ClassDeclaration" || f.type === "ClassMethod" || f.type === "ClassProperty" || f.type === "PropertyDefinition" || f.type === "ClassPrivateProperty" || f.type === "ContinueStatement" || f.type === "DebuggerStatement" || f.type === "DeclareClass" || f.type === "DeclareExportAllDeclaration" || f.type === "DeclareExportDeclaration" || f.type === "DeclareFunction" || f.type === "DeclareInterface" || f.type === "DeclareModule" || f.type === "DeclareModuleExports" || f.type === "DeclareVariable" || f.type === "DoWhileStatement" || f.type === "EnumDeclaration" || f.type === "ExportAllDeclaration" || f.type === "ExportDefaultDeclaration" || f.type === "ExportNamedDeclaration" || f.type === "ExpressionStatement" || f.type === "ForInStatement" || f.type === "ForOfStatement" || f.type === "ForStatement" || f.type === "FunctionDeclaration" || f.type === "IfStatement" || f.type === "ImportDeclaration" || f.type === "InterfaceDeclaration" || f.type === "LabeledStatement" || f.type === "MethodDefinition" || f.type === "ReturnStatement" || f.type === "SwitchStatement" || f.type === "ThrowStatement" || f.type === "TryStatement" || f.type === "TSDeclareFunction" || f.type === "TSEnumDeclaration" || f.type === "TSImportEqualsDeclaration" || f.type === "TSInterfaceDeclaration" || f.type === "TSModuleDeclaration" || f.type === "TSNamespaceExportDeclaration" || f.type === "TypeAlias" || f.type === "VariableDeclaration" || f.type === "WhileStatement" || f.type === "WithStatement";
        }
        function N(f) {
          let B = 0, d = f.getValue();
          for (; d; ) {
            let F = f.getParentNode(B++);
            if (F && F.type === "ForStatement" && F.init === d)
              return !0;
            d = F;
          }
          return !1;
        }
        function S(f) {
          return o(f, (B) => B.type === "ObjectTypeAnnotation" && o(B, (d) => d.type === "FunctionTypeAnnotation" || void 0) || void 0);
        }
        function j(f) {
          switch (f.type) {
            case "ObjectExpression":
              return !0;
            default:
              return !1;
          }
        }
        function k(f) {
          let B = f.getValue(), d = f.getParentNode(), F = f.getName();
          switch (d.type) {
            case "NGPipeExpression":
              if (typeof F == "number" && d.arguments[F] === B && d.arguments.length - 1 === F)
                return f.callParent(k);
              break;
            case "ObjectProperty":
              if (F === "value") {
                let a = f.getParentNode(1);
                return t(a.properties) === d;
              }
              break;
            case "BinaryExpression":
            case "LogicalExpression":
              if (F === "right")
                return f.callParent(k);
              break;
            case "ConditionalExpression":
              if (F === "alternate")
                return f.callParent(k);
              break;
            case "UnaryExpression":
              if (d.prefix)
                return f.callParent(k);
              break;
          }
          return !1;
        }
        function J(f, B) {
          let d = f.getValue(), F = f.getParentNode();
          return d.type === "FunctionExpression" || d.type === "ClassExpression" ? F.type === "ExportDefaultDeclaration" || !P(f, B) : !r(d) || F.type !== "ExportDefaultDeclaration" && P(f, B) ? !1 : f.call((a) => J(a, B), ...e(f, d));
        }
        l.exports = P;
      } }), wi = X({ "src/language-js/print-preprocess.js"(u, l) {
        H();
        function t(s, i) {
          switch (i.parser) {
            case "json":
            case "json5":
            case "json-stringify":
            case "__js_expression":
            case "__vue_expression":
            case "__vue_ts_expression":
              return Object.assign(Object.assign({}, s), {}, { type: i.parser.startsWith("__") ? "JsExpressionRoot" : "JsonRoot", node: s, comments: [], rootMarker: i.rootMarker });
            default:
              return s;
          }
        }
        l.exports = t;
      } }), qs = X({ "src/language-js/print/html-binding.js"(u, l) {
        H();
        var { builders: { join: t, line: s, group: i, softline: e, indent: n } } = pt();
        function r(c, h, m) {
          let y = c.getValue();
          if (h.__onHtmlBindingRoot && c.getName() === null && h.__onHtmlBindingRoot(y, h), y.type === "File") {
            if (h.__isVueForBindingLeft)
              return c.call((p) => {
                let D = t([",", s], p.map(m, "params")), { params: C } = p.getValue();
                return C.length === 1 ? D : ["(", n([e, i(D)]), e, ")"];
              }, "program", "body", 0);
            if (h.__isVueBindings)
              return c.call((p) => t([",", s], p.map(m, "params")), "program", "body", 0);
          }
        }
        function o(c) {
          switch (c.type) {
            case "MemberExpression":
              switch (c.property.type) {
                case "Identifier":
                case "NumericLiteral":
                case "StringLiteral":
                  return o(c.object);
              }
              return !1;
            case "Identifier":
              return !0;
            default:
              return !1;
          }
        }
        l.exports = { isVueEventBindingExpression: o, printHtmlBinding: r };
      } }), Bu = X({ "src/language-js/print/binaryish.js"(u, l) {
        H();
        var { printComments: t } = an(), { getLast: s } = bt(), { builders: { join: i, line: e, softline: n, group: r, indent: o, align: c, indentIfBreak: h }, utils: { cleanDoc: m, getDocParts: y, isConcat: p } } = pt(), { hasLeadingOwnLineComment: D, isBinaryish: C, isJsxNode: w, shouldFlatten: P, hasComment: A, CommentCheckFlags: N, isCallExpression: S, isMemberExpression: j, isObjectProperty: k, isEnabledHackPipeline: J } = Jt(), f = 0;
        function B(a, g, E) {
          let b = a.getValue(), x = a.getParentNode(), T = a.getParentNode(1), I = b !== x.body && (x.type === "IfStatement" || x.type === "WhileStatement" || x.type === "SwitchStatement" || x.type === "DoWhileStatement"), M = J(g) && b.operator === "|>", V = d(a, E, g, !1, I);
          if (I)
            return V;
          if (M)
            return r(V);
          if (S(x) && x.callee === b || x.type === "UnaryExpression" || j(x) && !x.computed)
            return r([o([n, ...V]), n]);
          let $ = x.type === "ReturnStatement" || x.type === "ThrowStatement" || x.type === "JSXExpressionContainer" && T.type === "JSXAttribute" || b.operator !== "|" && x.type === "JsExpressionRoot" || b.type !== "NGPipeExpression" && (x.type === "NGRoot" && g.parser === "__ng_binding" || x.type === "NGMicrosyntaxExpression" && T.type === "NGMicrosyntax" && T.body.length === 1) || b === x.body && x.type === "ArrowFunctionExpression" || b !== x.body && x.type === "ForStatement" || x.type === "ConditionalExpression" && T.type !== "ReturnStatement" && T.type !== "ThrowStatement" && !S(T) || x.type === "TemplateLiteral", U = x.type === "AssignmentExpression" || x.type === "VariableDeclarator" || x.type === "ClassProperty" || x.type === "PropertyDefinition" || x.type === "TSAbstractPropertyDefinition" || x.type === "ClassPrivateProperty" || k(x), _ = C(b.left) && P(b.operator, b.left.operator);
          if ($ || F(b) && !_ || !F(b) && U)
            return r(V);
          if (V.length === 0)
            return "";
          let ee = w(b.right), R = V.findIndex((q) => typeof q != "string" && !Array.isArray(q) && q.type === "group"), O = V.slice(0, R === -1 ? 1 : R + 1), Z = V.slice(O.length, ee ? -1 : void 0), ae = Symbol("logicalChain-" + ++f), ne = r([...O, o(Z)], { id: ae });
          if (!ee)
            return ne;
          let he = s(V);
          return r([ne, h(he, { groupId: ae })]);
        }
        function d(a, g, E, b, x) {
          let T = a.getValue();
          if (!C(T))
            return [r(g())];
          let I = [];
          P(T.operator, T.left.operator) ? I = a.call((Z) => d(Z, g, E, !0, x), "left") : I.push(r(g("left")));
          let M = F(T), V = (T.operator === "|>" || T.type === "NGPipeExpression" || T.operator === "|" && E.parser === "__vue_expression") && !D(E.originalText, T.right), $ = T.type === "NGPipeExpression" ? "|" : T.operator, U = T.type === "NGPipeExpression" && T.arguments.length > 0 ? r(o([e, ": ", i([e, ": "], a.map(g, "arguments").map((Z) => c(2, r(Z))))])) : "", _;
          if (M)
            _ = [$, " ", g("right"), U];
          else {
            let Z = J(E) && $ === "|>" ? a.call((ae) => d(ae, g, E, !0, x), "right") : g("right");
            _ = [V ? e : "", $, V ? " " : e, Z, U];
          }
          let ee = a.getParentNode(), R = A(T.left, N.Trailing | N.Line), O = R || !(x && T.type === "LogicalExpression") && ee.type !== T.type && T.left.type !== T.type && T.right.type !== T.type;
          if (I.push(V ? "" : " ", O ? r(_, { shouldBreak: R }) : _), b && A(T)) {
            let Z = m(t(a, I, E));
            return p(Z) || Z.type === "fill" ? y(Z) : [Z];
          }
          return I;
        }
        function F(a) {
          return a.type !== "LogicalExpression" ? !1 : !!(a.right.type === "ObjectExpression" && a.right.properties.length > 0 || a.right.type === "ArrayExpression" && a.right.elements.length > 0 || w(a.right));
        }
        l.exports = { printBinaryishExpression: B, shouldInlineLogicalExpression: F };
      } }), Gs = X({ "src/language-js/print/angular.js"(u, l) {
        H();
        var { builders: { join: t, line: s, group: i } } = pt(), { hasNode: e, hasComment: n, getComments: r } = Jt(), { printBinaryishExpression: o } = Bu();
        function c(y, p, D) {
          let C = y.getValue();
          if (C.type.startsWith("NG"))
            switch (C.type) {
              case "NGRoot":
                return [D("node"), n(C.node) ? " //" + r(C.node)[0].value.trimEnd() : ""];
              case "NGPipeExpression":
                return o(y, p, D);
              case "NGChainedExpression":
                return i(t([";", s], y.map((w) => m(w) ? D() : ["(", D(), ")"], "expressions")));
              case "NGEmptyExpression":
                return "";
              case "NGQuotedExpression":
                return [C.prefix, ": ", C.value.trim()];
              case "NGMicrosyntax":
                return y.map((w, P) => [P === 0 ? "" : h(w.getValue(), P, C) ? " " : [";", s], D()], "body");
              case "NGMicrosyntaxKey":
                return /^[$_a-z][\w$]*(?:-[$_a-z][\w$])*$/i.test(C.name) ? C.name : JSON.stringify(C.name);
              case "NGMicrosyntaxExpression":
                return [D("expression"), C.alias === null ? "" : [" as ", D("alias")]];
              case "NGMicrosyntaxKeyedExpression": {
                let w = y.getName(), P = y.getParentNode(), A = h(C, w, P) || (w === 1 && (C.key.name === "then" || C.key.name === "else") || w === 2 && C.key.name === "else" && P.body[w - 1].type === "NGMicrosyntaxKeyedExpression" && P.body[w - 1].key.name === "then") && P.body[0].type === "NGMicrosyntaxExpression";
                return [D("key"), A ? " " : ": ", D("expression")];
              }
              case "NGMicrosyntaxLet":
                return ["let ", D("key"), C.value === null ? "" : [" = ", D("value")]];
              case "NGMicrosyntaxAs":
                return [D("key"), " as ", D("alias")];
              default:
                throw new Error(`Unknown Angular node type: ${JSON.stringify(C.type)}.`);
            }
        }
        function h(y, p, D) {
          return y.type === "NGMicrosyntaxKeyedExpression" && y.key.name === "of" && p === 1 && D.body[0].type === "NGMicrosyntaxLet" && D.body[0].value === null;
        }
        function m(y) {
          return e(y.getValue(), (p) => {
            switch (p.type) {
              case void 0:
                return !1;
              case "CallExpression":
              case "OptionalCallExpression":
              case "AssignmentExpression":
                return !0;
            }
          });
        }
        l.exports = { printAngular: c };
      } }), Ws = X({ "src/language-js/print/jsx.js"(u, l) {
        H();
        var { printComments: t, printDanglingComments: s, printCommentsSeparately: i } = an(), { builders: { line: e, hardline: n, softline: r, group: o, indent: c, conditionalGroup: h, fill: m, ifBreak: y, lineSuffixBoundary: p, join: D }, utils: { willBreak: C } } = pt(), { getLast: w, getPreferredQuote: P } = bt(), { isJsxNode: A, rawText: N, isCallExpression: S, isStringLiteral: j, isBinaryish: k, hasComment: J, CommentCheckFlags: f, hasNodeIgnoreComment: B } = Jt(), d = lr(), { willPrintOwnComments: F } = Ti(), a = (W) => W === "" || W === e || W === n || W === r;
        function g(W, re, ue) {
          let Ce = W.getValue();
          if (Ce.type === "JSXElement" && me(Ce))
            return [ue("openingElement"), ue("closingElement")];
          let be = Ce.type === "JSXElement" ? ue("openingElement") : ue("openingFragment"), Be = Ce.type === "JSXElement" ? ue("closingElement") : ue("closingFragment");
          if (Ce.children.length === 1 && Ce.children[0].type === "JSXExpressionContainer" && (Ce.children[0].expression.type === "TemplateLiteral" || Ce.children[0].expression.type === "TaggedTemplateExpression"))
            return [be, ...W.map(ue, "children"), Be];
          Ce.children = Ce.children.map((v) => _e(v) ? { type: "JSXText", value: " ", raw: " " } : v);
          let ze = Ce.children.some(A), mt = Ce.children.filter((v) => v.type === "JSXExpressionContainer").length > 1, Dt = Ce.type === "JSXElement" && Ce.openingElement.attributes.length > 1, Ue = C(be) || ze || Dt || mt, tt = W.getParentNode().rootMarker === "mdx", ce = re.singleQuote ? "{' '}" : '{" "}', G = tt ? " " : y([ce, r], " "), ye = Ce.openingElement && Ce.openingElement.name && Ce.openingElement.name.name === "fbt", K = E(W, re, ue, G, ye), fe = Ce.children.some((v) => ge(v));
          for (let v = K.length - 2; v >= 0; v--) {
            let z = K[v] === "" && K[v + 1] === "", se = K[v] === n && K[v + 1] === "" && K[v + 2] === n, Se = (K[v] === r || K[v] === n) && K[v + 1] === "" && K[v + 2] === G, Pe = K[v] === G && K[v + 1] === "" && (K[v + 2] === r || K[v + 2] === n), Xe = K[v] === G && K[v + 1] === "" && K[v + 2] === G, Te = K[v] === r && K[v + 1] === "" && K[v + 2] === n || K[v] === n && K[v + 1] === "" && K[v + 2] === r;
            se && fe || z || Se || Xe || Te ? K.splice(v, 2) : Pe && K.splice(v + 1, 2);
          }
          for (; K.length > 0 && a(w(K)); )
            K.pop();
          for (; K.length > 1 && a(K[0]) && a(K[1]); )
            K.shift(), K.shift();
          let Ve = [];
          for (let [v, z] of K.entries()) {
            if (z === G) {
              if (v === 1 && K[v - 1] === "") {
                if (K.length === 2) {
                  Ve.push(ce);
                  continue;
                }
                Ve.push([ce, n]);
                continue;
              } else if (v === K.length - 1) {
                Ve.push(ce);
                continue;
              } else if (K[v - 1] === "" && K[v - 2] === n) {
                Ve.push(ce);
                continue;
              }
            }
            Ve.push(z), C(z) && (Ue = !0);
          }
          let Ie = fe ? m(Ve) : o(Ve, { shouldBreak: !0 });
          if (tt)
            return Ie;
          let Ee = o([be, c([n, Ie]), n, Be]);
          return Ue ? Ee : h([o([be, ...K, Be]), Ee]);
        }
        function E(W, re, ue, Ce, be) {
          let Be = [];
          return W.each((ze, mt, Dt) => {
            let Ue = ze.getValue();
            if (Ue.type === "JSXText") {
              let tt = N(Ue);
              if (ge(Ue)) {
                let ce = tt.split(he);
                if (ce[0] === "") {
                  if (Be.push(""), ce.shift(), /\n/.test(ce[0])) {
                    let ye = Dt[mt + 1];
                    Be.push(x(be, ce[1], Ue, ye));
                  } else
                    Be.push(Ce);
                  ce.shift();
                }
                let G;
                if (w(ce) === "" && (ce.pop(), G = ce.pop()), ce.length === 0)
                  return;
                for (let [ye, K] of ce.entries())
                  ye % 2 === 1 ? Be.push(e) : Be.push(K);
                if (G !== void 0)
                  if (/\n/.test(G)) {
                    let ye = Dt[mt + 1];
                    Be.push(x(be, w(Be), Ue, ye));
                  } else
                    Be.push(Ce);
                else {
                  let ye = Dt[mt + 1];
                  Be.push(b(be, w(Be), Ue, ye));
                }
              } else
                /\n/.test(tt) ? tt.match(/\n/g).length > 1 && Be.push("", n) : Be.push("", Ce);
            } else {
              let tt = ue();
              Be.push(tt);
              let ce = Dt[mt + 1];
              if (ce && ge(ce)) {
                let G = Y(N(ce)).split(he)[0];
                Be.push(b(be, G, Ue, ce));
              } else
                Be.push(n);
            }
          }, "children"), Be;
        }
        function b(W, re, ue, Ce) {
          return W ? "" : ue.type === "JSXElement" && !ue.closingElement || Ce && Ce.type === "JSXElement" && !Ce.closingElement ? re.length === 1 ? r : n : r;
        }
        function x(W, re, ue, Ce) {
          return W ? n : re.length === 1 ? ue.type === "JSXElement" && !ue.closingElement || Ce && Ce.type === "JSXElement" && !Ce.closingElement ? n : r : n;
        }
        function T(W, re, ue) {
          let Ce = W.getParentNode();
          if (!Ce || { ArrayExpression: !0, JSXAttribute: !0, JSXElement: !0, JSXExpressionContainer: !0, JSXFragment: !0, ExpressionStatement: !0, CallExpression: !0, OptionalCallExpression: !0, ConditionalExpression: !0, JsExpressionRoot: !0 }[Ce.type])
            return re;
          let be = W.match(void 0, (ze) => ze.type === "ArrowFunctionExpression", S, (ze) => ze.type === "JSXExpressionContainer"), Be = d(W, ue);
          return o([Be ? "" : y("("), c([r, re]), r, Be ? "" : y(")")], { shouldBreak: be });
        }
        function I(W, re, ue) {
          let Ce = W.getValue(), be = [];
          if (be.push(ue("name")), Ce.value) {
            let Be;
            if (j(Ce.value)) {
              let ze = N(Ce.value).slice(1, -1).replace(/&apos;/g, "'").replace(/&quot;/g, '"'), { escaped: mt, quote: Dt, regex: Ue } = P(ze, re.jsxSingleQuote ? "'" : '"');
              ze = ze.replace(Ue, mt);
              let { leading: tt, trailing: ce } = W.call(() => i(W, re), "value");
              Be = [tt, Dt, ze, Dt, ce];
            } else
              Be = ue("value");
            be.push("=", Be);
          }
          return be;
        }
        function M(W, re, ue) {
          let Ce = W.getValue(), be = (Be, ze) => Be.type === "JSXEmptyExpression" || !J(Be) && (Be.type === "ArrayExpression" || Be.type === "ObjectExpression" || Be.type === "ArrowFunctionExpression" || Be.type === "AwaitExpression" && (be(Be.argument, Be) || Be.argument.type === "JSXElement") || S(Be) || Be.type === "FunctionExpression" || Be.type === "TemplateLiteral" || Be.type === "TaggedTemplateExpression" || Be.type === "DoExpression" || A(ze) && (Be.type === "ConditionalExpression" || k(Be)));
          return be(Ce.expression, W.getParentNode(0)) ? o(["{", ue("expression"), p, "}"]) : o(["{", c([r, ue("expression")]), r, p, "}"]);
        }
        function V(W, re, ue) {
          let Ce = W.getValue(), be = Ce.name && J(Ce.name) || Ce.typeParameters && J(Ce.typeParameters);
          if (Ce.selfClosing && Ce.attributes.length === 0 && !be)
            return ["<", ue("name"), ue("typeParameters"), " />"];
          if (Ce.attributes && Ce.attributes.length === 1 && Ce.attributes[0].value && j(Ce.attributes[0].value) && !Ce.attributes[0].value.value.includes(`
`) && !be && !J(Ce.attributes[0]))
            return o(["<", ue("name"), ue("typeParameters"), " ", ...W.map(ue, "attributes"), Ce.selfClosing ? " />" : ">"]);
          let Be = Ce.attributes && Ce.attributes.some((mt) => mt.value && j(mt.value) && mt.value.value.includes(`
`)), ze = re.singleAttributePerLine && Ce.attributes.length > 1 ? n : e;
          return o(["<", ue("name"), ue("typeParameters"), c(W.map(() => [ze, ue()], "attributes")), ...$(Ce, re, be)], { shouldBreak: Be });
        }
        function $(W, re, ue) {
          return W.selfClosing ? [e, "/>"] : U(W, re, ue) ? [">"] : [r, ">"];
        }
        function U(W, re, ue) {
          let Ce = W.attributes.length > 0 && J(w(W.attributes), f.Trailing);
          return W.attributes.length === 0 && !ue || (re.bracketSameLine || re.jsxBracketSameLine) && (!ue || W.attributes.length > 0) && !Ce;
        }
        function _(W, re, ue) {
          let Ce = W.getValue(), be = [];
          be.push("</");
          let Be = ue("name");
          return J(Ce.name, f.Leading | f.Line) ? be.push(c([n, Be]), n) : J(Ce.name, f.Leading | f.Block) ? be.push(" ", Be) : be.push(Be), be.push(">"), be;
        }
        function ee(W, re) {
          let ue = W.getValue(), Ce = J(ue), be = J(ue, f.Line), Be = ue.type === "JSXOpeningFragment";
          return [Be ? "<" : "</", c([be ? n : Ce && !Be ? " " : "", s(W, re, !0)]), be ? n : "", ">"];
        }
        function R(W, re, ue) {
          let Ce = t(W, g(W, re, ue), re);
          return T(W, Ce, re);
        }
        function O(W, re) {
          let ue = W.getValue(), Ce = J(ue, f.Line);
          return [s(W, re, !Ce), Ce ? n : ""];
        }
        function Z(W, re, ue) {
          let Ce = W.getValue();
          return ["{", W.call((be) => {
            let Be = ["...", ue()], ze = be.getValue();
            return !J(ze) || !F(be) ? Be : [c([r, t(be, Be, re)]), r];
          }, Ce.type === "JSXSpreadAttribute" ? "argument" : "expression"), "}"];
        }
        function ae(W, re, ue) {
          let Ce = W.getValue();
          if (Ce.type.startsWith("JSX"))
            switch (Ce.type) {
              case "JSXAttribute":
                return I(W, re, ue);
              case "JSXIdentifier":
                return String(Ce.name);
              case "JSXNamespacedName":
                return D(":", [ue("namespace"), ue("name")]);
              case "JSXMemberExpression":
                return D(".", [ue("object"), ue("property")]);
              case "JSXSpreadAttribute":
                return Z(W, re, ue);
              case "JSXSpreadChild":
                return Z(W, re, ue);
              case "JSXExpressionContainer":
                return M(W, re, ue);
              case "JSXFragment":
              case "JSXElement":
                return R(W, re, ue);
              case "JSXOpeningElement":
                return V(W, re, ue);
              case "JSXClosingElement":
                return _(W, re, ue);
              case "JSXOpeningFragment":
              case "JSXClosingFragment":
                return ee(W, re);
              case "JSXEmptyExpression":
                return O(W, re);
              case "JSXText":
                throw new Error("JSXText should be handled by JSXElement");
              default:
                throw new Error(`Unknown JSX node type: ${JSON.stringify(Ce.type)}.`);
            }
        }
        var ne = ` 
\r	`, he = new RegExp("([" + ne + "]+)"), q = new RegExp("[^" + ne + "]"), Y = (W) => W.replace(new RegExp("(?:^" + he.source + "|" + he.source + "$)"), "");
        function me(W) {
          if (W.children.length === 0)
            return !0;
          if (W.children.length > 1)
            return !1;
          let re = W.children[0];
          return re.type === "JSXText" && !ge(re);
        }
        function ge(W) {
          return W.type === "JSXText" && (q.test(N(W)) || !/\n/.test(N(W)));
        }
        function _e(W) {
          return W.type === "JSXExpressionContainer" && j(W.expression) && W.expression.value === " " && !J(W.expression);
        }
        function Q(W) {
          let re = W.getValue(), ue = W.getParentNode();
          if (!ue || !re || !A(re) || !A(ue))
            return !1;
          let Ce = ue.children.indexOf(re), be = null;
          for (let Be = Ce; Be > 0; Be--) {
            let ze = ue.children[Be - 1];
            if (!(ze.type === "JSXText" && !ge(ze))) {
              be = ze;
              break;
            }
          }
          return be && be.type === "JSXExpressionContainer" && be.expression.type === "JSXEmptyExpression" && B(be.expression);
        }
        l.exports = { hasJsxIgnoreComment: Q, printJsx: ae };
      } }), Tn = X({ "src/language-js/print/misc.js"(u, l) {
        H();
        var { isNonEmptyArray: t } = bt(), { builders: { indent: s, join: i, line: e } } = pt(), { isFlowAnnotationComment: n } = Jt();
        function r(w) {
          let P = w.getValue();
          return !P.optional || P.type === "Identifier" && P === w.getParentNode().key ? "" : P.type === "OptionalCallExpression" || P.type === "OptionalMemberExpression" && P.computed ? "?." : "?";
        }
        function o(w) {
          return w.getValue().definite || w.match(void 0, (P, A) => A === "id" && P.type === "VariableDeclarator" && P.definite) ? "!" : "";
        }
        function c(w, P, A) {
          let N = w.getValue();
          return N.typeArguments ? A("typeArguments") : N.typeParameters ? A("typeParameters") : "";
        }
        function h(w, P, A) {
          let N = w.getValue();
          if (!N.typeAnnotation)
            return "";
          let S = w.getParentNode(), j = S.type === "DeclareFunction" && S.id === N;
          return n(P.originalText, N.typeAnnotation) ? [" /*: ", A("typeAnnotation"), " */"] : [j ? "" : ": ", A("typeAnnotation")];
        }
        function m(w, P, A) {
          return ["::", A("callee")];
        }
        function y(w, P, A) {
          let N = w.getValue();
          return t(N.modifiers) ? [i(" ", w.map(A, "modifiers")), " "] : "";
        }
        function p(w, P, A) {
          return w.type === "EmptyStatement" ? ";" : w.type === "BlockStatement" || A ? [" ", P] : s([e, P]);
        }
        function D(w, P, A) {
          return ["...", A("argument"), h(w, P, A)];
        }
        function C(w, P) {
          let A = w.slice(1, -1);
          if (A.includes('"') || A.includes("'"))
            return w;
          let N = P.singleQuote ? "'" : '"';
          return N + A + N;
        }
        l.exports = { printOptionalToken: r, printDefiniteToken: o, printFunctionTypeParameters: c, printBindExpressionCallee: m, printTypeScriptModifiers: y, printTypeAnnotation: h, printRestSpread: D, adjustClause: p, printDirective: C };
      } }), Tr = X({ "src/language-js/print/array.js"(u, l) {
        H();
        var { printDanglingComments: t } = an(), { builders: { line: s, softline: i, hardline: e, group: n, indent: r, ifBreak: o, fill: c } } = pt(), { getLast: h, hasNewline: m } = bt(), { shouldPrintComma: y, hasComment: p, CommentCheckFlags: D, isNextLineEmpty: C, isNumericLiteral: w, isSignedNumericLiteral: P } = Jt(), { locStart: A } = yn(), { printOptionalToken: N, printTypeAnnotation: S } = Tn();
        function j(B, d, F) {
          let a = B.getValue(), g = [], E = a.type === "TupleExpression" ? "#[" : "[", b = "]";
          if (a.elements.length === 0)
            p(a, D.Dangling) ? g.push(n([E, t(B, d), i, b])) : g.push(E, b);
          else {
            let x = h(a.elements), T = !(x && x.type === "RestElement"), I = x === null, M = Symbol("array"), V = !d.__inJestEach && a.elements.length > 1 && a.elements.every((_, ee, R) => {
              let O = _ && _.type;
              if (O !== "ArrayExpression" && O !== "ObjectExpression")
                return !1;
              let Z = R[ee + 1];
              if (Z && O !== Z.type)
                return !1;
              let ae = O === "ArrayExpression" ? "elements" : "properties";
              return _[ae] && _[ae].length > 1;
            }), $ = k(a, d), U = T ? I ? "," : y(d) ? $ ? o(",", "", { groupId: M }) : o(",") : "" : "";
            g.push(n([E, r([i, $ ? f(B, d, F, U) : [J(B, d, "elements", F), U], t(B, d, !0)]), i, b], { shouldBreak: V, id: M }));
          }
          return g.push(N(B), S(B, d, F)), g;
        }
        function k(B, d) {
          return B.elements.length > 1 && B.elements.every((F) => F && (w(F) || P(F) && !p(F.argument)) && !p(F, D.Trailing | D.Line, (a) => !m(d.originalText, A(a), { backwards: !0 })));
        }
        function J(B, d, F, a) {
          let g = [], E = [];
          return B.each((b) => {
            g.push(E, n(a())), E = [",", s], b.getValue() && C(b.getValue(), d) && E.push(i);
          }, F), g;
        }
        function f(B, d, F, a) {
          let g = [];
          return B.each((E, b, x) => {
            let T = b === x.length - 1;
            g.push([F(), T ? a : ","]), T || g.push(C(E.getValue(), d) ? [e, e] : p(x[b + 1], D.Leading | D.Line) ? e : s);
          }, "elements"), c(g);
        }
        l.exports = { printArray: j, printArrayItems: J, isConciselyPrintedArray: k };
      } }), Ni = X({ "src/language-js/print/call-arguments.js"(u, l) {
        H();
        var { printDanglingComments: t } = an(), { getLast: s, getPenultimate: i } = bt(), { getFunctionParameters: e, hasComment: n, CommentCheckFlags: r, isFunctionCompositionArgs: o, isJsxNode: c, isLongCurriedCallExpression: h, shouldPrintComma: m, getCallArguments: y, iterateCallArgumentsPath: p, isNextLineEmpty: D, isCallExpression: C, isStringLiteral: w, isObjectProperty: P, isTSTypeExpression: A } = Jt(), { builders: { line: N, hardline: S, softline: j, group: k, indent: J, conditionalGroup: f, ifBreak: B, breakParent: d }, utils: { willBreak: F } } = pt(), { ArgExpansionBailout: a } = xr(), { isConciselyPrintedArray: g } = Tr();
        function E($, U, _) {
          let ee = $.getValue(), R = ee.type === "ImportExpression", O = y(ee);
          if (O.length === 0)
            return ["(", t($, U, !0), ")"];
          if (I(O))
            return ["(", _(["arguments", 0]), ", ", _(["arguments", 1]), ")"];
          let Z = !1, ae = !1, ne = O.length - 1, he = [];
          p($, (Q, W) => {
            let re = Q.getNode(), ue = [_()];
            W === ne || (D(re, U) ? (W === 0 && (ae = !0), Z = !0, ue.push(",", S, S)) : ue.push(",", N)), he.push(ue);
          });
          let q = !(R || ee.callee && ee.callee.type === "Import") && m(U, "all") ? "," : "";
          function Y() {
            return k(["(", J([N, ...he]), q, N, ")"], { shouldBreak: !0 });
          }
          if (Z || $.getParentNode().type !== "Decorator" && o(O))
            return Y();
          let me = T(O), ge = x(O, U);
          if (me || ge) {
            if (me ? he.slice(1).some(F) : he.slice(0, -1).some(F))
              return Y();
            let Q = [];
            try {
              $.try(() => {
                p($, (W, re) => {
                  me && re === 0 && (Q = [[_([], { expandFirstArg: !0 }), he.length > 1 ? "," : "", ae ? S : N, ae ? S : ""], ...he.slice(1)]), ge && re === ne && (Q = [...he.slice(0, -1), _([], { expandLastArg: !0 })]);
                });
              });
            } catch (W) {
              if (W instanceof a)
                return Y();
              throw W;
            }
            return [he.some(F) ? d : "", f([["(", ...Q, ")"], me ? ["(", k(Q[0], { shouldBreak: !0 }), ...Q.slice(1), ")"] : ["(", ...he.slice(0, -1), k(s(Q), { shouldBreak: !0 }), ")"], Y()])];
          }
          let _e = ["(", J([j, ...he]), B(q), j, ")"];
          return h($) ? _e : k(_e, { shouldBreak: he.some(F) || Z });
        }
        function b($) {
          let U = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
          return $.type === "ObjectExpression" && ($.properties.length > 0 || n($)) || $.type === "ArrayExpression" && ($.elements.length > 0 || n($)) || $.type === "TSTypeAssertion" && b($.expression) || A($) && b($.expression) || $.type === "FunctionExpression" || $.type === "ArrowFunctionExpression" && (!$.returnType || !$.returnType.typeAnnotation || $.returnType.typeAnnotation.type !== "TSTypeReference" || M($.body)) && ($.body.type === "BlockStatement" || $.body.type === "ArrowFunctionExpression" && b($.body, !0) || $.body.type === "ObjectExpression" || $.body.type === "ArrayExpression" || !U && (C($.body) || $.body.type === "ConditionalExpression") || c($.body)) || $.type === "DoExpression" || $.type === "ModuleExpression";
        }
        function x($, U) {
          let _ = s($), ee = i($);
          return !n(_, r.Leading) && !n(_, r.Trailing) && b(_) && (!ee || ee.type !== _.type) && ($.length !== 2 || ee.type !== "ArrowFunctionExpression" || _.type !== "ArrayExpression") && !($.length > 1 && _.type === "ArrayExpression" && g(_, U));
        }
        function T($) {
          if ($.length !== 2)
            return !1;
          let [U, _] = $;
          return U.type === "ModuleExpression" && V(_) ? !0 : !n(U) && (U.type === "FunctionExpression" || U.type === "ArrowFunctionExpression" && U.body.type === "BlockStatement") && _.type !== "FunctionExpression" && _.type !== "ArrowFunctionExpression" && _.type !== "ConditionalExpression" && !b(_);
        }
        function I($) {
          return $.length === 2 && $[0].type === "ArrowFunctionExpression" && e($[0]).length === 0 && $[0].body.type === "BlockStatement" && $[1].type === "ArrayExpression" && !$.some((U) => n(U));
        }
        function M($) {
          return $.type === "BlockStatement" && ($.body.some((U) => U.type !== "EmptyStatement") || n($, r.Dangling));
        }
        function V($) {
          return $.type === "ObjectExpression" && $.properties.length === 1 && P($.properties[0]) && $.properties[0].key.type === "Identifier" && $.properties[0].key.name === "type" && w($.properties[0].value) && $.properties[0].value.value === "module";
        }
        l.exports = E;
      } }), ki = X({ "src/language-js/print/member.js"(u, l) {
        H();
        var { builders: { softline: t, group: s, indent: i, label: e } } = pt(), { isNumericLiteral: n, isMemberExpression: r, isCallExpression: o } = Jt(), { printOptionalToken: c } = Tn();
        function h(y, p, D) {
          let C = y.getValue(), w = y.getParentNode(), P, A = 0;
          do
            P = y.getParentNode(A), A++;
          while (P && (r(P) || P.type === "TSNonNullExpression"));
          let N = D("object"), S = m(y, p, D), j = P && (P.type === "NewExpression" || P.type === "BindExpression" || P.type === "AssignmentExpression" && P.left.type !== "Identifier") || C.computed || C.object.type === "Identifier" && C.property.type === "Identifier" && !r(w) || (w.type === "AssignmentExpression" || w.type === "VariableDeclarator") && (o(C.object) && C.object.arguments.length > 0 || C.object.type === "TSNonNullExpression" && o(C.object.expression) && C.object.expression.arguments.length > 0 || N.label === "member-chain");
          return e(N.label === "member-chain" ? "member-chain" : "member", [N, j ? S : s(i([t, S]))]);
        }
        function m(y, p, D) {
          let C = D("property"), w = y.getValue(), P = c(y);
          return w.computed ? !w.property || n(w.property) ? [P, "[", C, "]"] : s([P, "[", i([t, C]), t, "]"]) : [P, ".", C];
        }
        l.exports = { printMemberExpression: h, printMemberLookup: m };
      } }), Xs = X({ "src/language-js/print/member-chain.js"(u, l) {
        H();
        var { printComments: t } = an(), { getLast: s, isNextLineEmptyAfterIndex: i, getNextNonSpaceNonCommentCharacterIndex: e } = bt(), n = lr(), { isCallExpression: r, isMemberExpression: o, isFunctionOrArrowExpression: c, isLongCurriedCallExpression: h, isMemberish: m, isNumericLiteral: y, isSimpleCallArgument: p, hasComment: D, CommentCheckFlags: C, isNextLineEmpty: w } = Jt(), { locEnd: P } = yn(), { builders: { join: A, hardline: N, group: S, indent: j, conditionalGroup: k, breakParent: J, label: f }, utils: { willBreak: B } } = pt(), d = Ni(), { printMemberLookup: F } = ki(), { printOptionalToken: a, printFunctionTypeParameters: g, printBindExpressionCallee: E } = Tn();
        function b(x, T, I) {
          let M = x.getParentNode(), V = !M || M.type === "ExpressionStatement", $ = [];
          function U(Ue) {
            let { originalText: tt } = T, ce = e(tt, Ue, P);
            return tt.charAt(ce) === ")" ? ce !== !1 && i(tt, ce + 1) : w(Ue, T);
          }
          function _(Ue) {
            let tt = Ue.getValue();
            r(tt) && (m(tt.callee) || r(tt.callee)) ? ($.unshift({ node: tt, printed: [t(Ue, [a(Ue), g(Ue, T, I), d(Ue, T, I)], T), U(tt) ? N : ""] }), Ue.call((ce) => _(ce), "callee")) : m(tt) ? ($.unshift({ node: tt, needsParens: n(Ue, T), printed: t(Ue, o(tt) ? F(Ue, T, I) : E(Ue, T, I), T) }), Ue.call((ce) => _(ce), "object")) : tt.type === "TSNonNullExpression" ? ($.unshift({ node: tt, printed: t(Ue, "!", T) }), Ue.call((ce) => _(ce), "expression")) : $.unshift({ node: tt, printed: I() });
          }
          let ee = x.getValue();
          $.unshift({ node: ee, printed: [a(x), g(x, T, I), d(x, T, I)] }), ee.callee && x.call((Ue) => _(Ue), "callee");
          let R = [], O = [$[0]], Z = 1;
          for (; Z < $.length && ($[Z].node.type === "TSNonNullExpression" || r($[Z].node) || o($[Z].node) && $[Z].node.computed && y($[Z].node.property)); ++Z)
            O.push($[Z]);
          if (!r($[0].node))
            for (; Z + 1 < $.length && m($[Z].node) && m($[Z + 1].node); ++Z)
              O.push($[Z]);
          R.push(O), O = [];
          let ae = !1;
          for (; Z < $.length; ++Z) {
            if (ae && m($[Z].node)) {
              if ($[Z].node.computed && y($[Z].node.property)) {
                O.push($[Z]);
                continue;
              }
              R.push(O), O = [], ae = !1;
            }
            (r($[Z].node) || $[Z].node.type === "ImportExpression") && (ae = !0), O.push($[Z]), D($[Z].node, C.Trailing) && (R.push(O), O = [], ae = !1);
          }
          O.length > 0 && R.push(O);
          function ne(Ue) {
            return /^[A-Z]|^[$_]+$/.test(Ue);
          }
          function he(Ue) {
            return Ue.length <= T.tabWidth;
          }
          function q(Ue) {
            let tt = Ue[1].length > 0 && Ue[1][0].node.computed;
            if (Ue[0].length === 1) {
              let G = Ue[0][0].node;
              return G.type === "ThisExpression" || G.type === "Identifier" && (ne(G.name) || V && he(G.name) || tt);
            }
            let ce = s(Ue[0]).node;
            return o(ce) && ce.property.type === "Identifier" && (ne(ce.property.name) || tt);
          }
          let Y = R.length >= 2 && !D(R[1][0].node) && q(R);
          function me(Ue) {
            let tt = Ue.map((ce) => ce.printed);
            return Ue.length > 0 && s(Ue).needsParens ? ["(", ...tt, ")"] : tt;
          }
          function ge(Ue) {
            return Ue.length === 0 ? "" : j(S([N, A(N, Ue.map(me))]));
          }
          let _e = R.map(me), Q = _e, W = Y ? 3 : 2, re = R.flat(), ue = re.slice(1, -1).some((Ue) => D(Ue.node, C.Leading)) || re.slice(0, -1).some((Ue) => D(Ue.node, C.Trailing)) || R[W] && D(R[W][0].node, C.Leading);
          if (R.length <= W && !ue)
            return h(x) ? Q : S(Q);
          let Ce = s(R[Y ? 1 : 0]).node, be = !r(Ce) && U(Ce), Be = [me(R[0]), Y ? R.slice(1, 2).map(me) : "", be ? N : "", ge(R.slice(Y ? 2 : 1))], ze = $.map((Ue) => {
            let { node: tt } = Ue;
            return tt;
          }).filter(r);
          function mt() {
            let Ue = s(s(R)).node, tt = s(_e);
            return r(Ue) && B(tt) && ze.slice(0, -1).some((ce) => ce.arguments.some(c));
          }
          let Dt;
          return ue || ze.length > 2 && ze.some((Ue) => !Ue.arguments.every((tt) => p(tt, 0))) || _e.slice(0, -1).some(B) || mt() ? Dt = S(Be) : Dt = [B(Q) || be ? J : "", k([Q, Be])], f("member-chain", Dt);
        }
        l.exports = b;
      } }), Pi = X({ "src/language-js/print/call-expression.js"(u, l) {
        H();
        var { builders: { join: t, group: s } } = pt(), i = lr(), { getCallArguments: e, hasFlowAnnotationComment: n, isCallExpression: r, isMemberish: o, isStringLiteral: c, isTemplateOnItsOwnLine: h, isTestCall: m, iterateCallArgumentsPath: y } = Jt(), p = Xs(), D = Ni(), { printOptionalToken: C, printFunctionTypeParameters: w } = Tn();
        function P(N, S, j) {
          let k = N.getValue(), J = N.getParentNode(), f = k.type === "NewExpression", B = k.type === "ImportExpression", d = C(N), F = e(k);
          if (F.length > 0 && (!B && !f && A(k, J) || F.length === 1 && h(F[0], S.originalText) || !f && m(k, J))) {
            let E = [];
            return y(N, () => {
              E.push(j());
            }), [f ? "new " : "", j("callee"), d, w(N, S, j), "(", t(", ", E), ")"];
          }
          let a = (S.parser === "babel" || S.parser === "babel-flow") && k.callee && k.callee.type === "Identifier" && n(k.callee.trailingComments);
          if (a && (k.callee.trailingComments[0].printed = !0), !B && !f && o(k.callee) && !N.call((E) => i(E, S), "callee"))
            return p(N, S, j);
          let g = [f ? "new " : "", B ? "import" : j("callee"), d, a ? `/*:: ${k.callee.trailingComments[0].value.slice(2).trim()} */` : "", w(N, S, j), D(N, S, j)];
          return B || r(k.callee) ? s(g) : g;
        }
        function A(N, S) {
          if (N.callee.type !== "Identifier")
            return !1;
          if (N.callee.name === "require")
            return !0;
          if (N.callee.name === "define") {
            let j = e(N);
            return S.type === "ExpressionStatement" && (j.length === 1 || j.length === 2 && j[0].type === "ArrayExpression" || j.length === 3 && c(j[0]) && j[1].type === "ArrayExpression");
          }
          return !1;
        }
        l.exports = { printCallExpression: P };
      } }), wr = X({ "src/language-js/print/assignment.js"(u, l) {
        H();
        var { isNonEmptyArray: t, getStringWidth: s } = bt(), { builders: { line: i, group: e, indent: n, indentIfBreak: r, lineSuffixBoundary: o }, utils: { cleanDoc: c, willBreak: h, canBreak: m } } = pt(), { hasLeadingOwnLineComment: y, isBinaryish: p, isStringLiteral: D, isLiteral: C, isNumericLiteral: w, isCallExpression: P, isMemberExpression: A, getCallArguments: N, rawText: S, hasComment: j, isSignedNumericLiteral: k, isObjectProperty: J } = Jt(), { shouldInlineLogicalExpression: f } = Bu(), { printCallExpression: B } = Pi();
        function d(q, Y, me, ge, _e, Q) {
          let W = g(q, Y, me, ge, Q), re = me(Q, { assignmentLayout: W });
          switch (W) {
            case "break-after-operator":
              return e([e(ge), _e, e(n([i, re]))]);
            case "never-break-after-operator":
              return e([e(ge), _e, " ", re]);
            case "fluid": {
              let ue = Symbol("assignment");
              return e([e(ge), _e, e(n(i), { id: ue }), o, r(re, { groupId: ue })]);
            }
            case "break-lhs":
              return e([ge, _e, " ", e(re)]);
            case "chain":
              return [e(ge), _e, i, re];
            case "chain-tail":
              return [e(ge), _e, n([i, re])];
            case "chain-tail-arrow-chain":
              return [e(ge), _e, re];
            case "only-left":
              return ge;
          }
        }
        function F(q, Y, me) {
          let ge = q.getValue();
          return d(q, Y, me, me("left"), [" ", ge.operator], "right");
        }
        function a(q, Y, me) {
          return d(q, Y, me, me("id"), " =", "init");
        }
        function g(q, Y, me, ge, _e) {
          let Q = q.getValue(), W = Q[_e];
          if (!W)
            return "only-left";
          let re = !x(W);
          if (q.match(x, T, (Ce) => !re || Ce.type !== "ExpressionStatement" && Ce.type !== "VariableDeclaration"))
            return re ? W.type === "ArrowFunctionExpression" && W.body.type === "ArrowFunctionExpression" ? "chain-tail-arrow-chain" : "chain-tail" : "chain";
          if (!re && x(W.right) || y(Y.originalText, W))
            return "break-after-operator";
          if (W.type === "CallExpression" && W.callee.name === "require" || Y.parser === "json5" || Y.parser === "json")
            return "never-break-after-operator";
          if (b(Q) || I(Q) || $(Q) || U(Q) && m(ge))
            return "break-lhs";
          let ue = ae(Q, ge, Y);
          return q.call(() => E(q, Y, me, ue), _e) ? "break-after-operator" : ue || W.type === "TemplateLiteral" || W.type === "TaggedTemplateExpression" || W.type === "BooleanLiteral" || w(W) || W.type === "ClassExpression" ? "never-break-after-operator" : "fluid";
        }
        function E(q, Y, me, ge) {
          let _e = q.getValue();
          if (p(_e) && !f(_e))
            return !0;
          switch (_e.type) {
            case "StringLiteralTypeAnnotation":
            case "SequenceExpression":
              return !0;
            case "ConditionalExpression": {
              let { test: re } = _e;
              return p(re) && !f(re);
            }
            case "ClassExpression":
              return t(_e.decorators);
          }
          if (ge)
            return !1;
          let Q = _e, W = [];
          for (; ; )
            if (Q.type === "UnaryExpression")
              Q = Q.argument, W.push("argument");
            else if (Q.type === "TSNonNullExpression")
              Q = Q.expression, W.push("expression");
            else
              break;
          return !!(D(Q) || q.call(() => R(q, Y, me), ...W));
        }
        function b(q) {
          if (T(q)) {
            let Y = q.left || q.id;
            return Y.type === "ObjectPattern" && Y.properties.length > 2 && Y.properties.some((me) => J(me) && (!me.shorthand || me.value && me.value.type === "AssignmentPattern"));
          }
          return !1;
        }
        function x(q) {
          return q.type === "AssignmentExpression";
        }
        function T(q) {
          return x(q) || q.type === "VariableDeclarator";
        }
        function I(q) {
          let Y = M(q);
          if (t(Y)) {
            let me = q.type === "TSTypeAliasDeclaration" ? "constraint" : "bound";
            if (Y.length > 1 && Y.some((ge) => ge[me] || ge.default))
              return !0;
          }
          return !1;
        }
        function M(q) {
          return V(q) && q.typeParameters && q.typeParameters.params ? q.typeParameters.params : null;
        }
        function V(q) {
          return q.type === "TSTypeAliasDeclaration" || q.type === "TypeAlias";
        }
        function $(q) {
          if (q.type !== "VariableDeclarator")
            return !1;
          let { typeAnnotation: Y } = q.id;
          if (!Y || !Y.typeAnnotation)
            return !1;
          let me = _(Y.typeAnnotation);
          return t(me) && me.length > 1 && me.some((ge) => t(_(ge)) || ge.type === "TSConditionalType");
        }
        function U(q) {
          return q.type === "VariableDeclarator" && q.init && q.init.type === "ArrowFunctionExpression";
        }
        function _(q) {
          return ee(q) && q.typeParameters && q.typeParameters.params ? q.typeParameters.params : null;
        }
        function ee(q) {
          return q.type === "TSTypeReference" || q.type === "GenericTypeAnnotation";
        }
        function R(q, Y, me) {
          let ge = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1, _e = q.getValue(), Q = () => R(q, Y, me, !0);
          if (_e.type === "TSNonNullExpression")
            return q.call(Q, "expression");
          if (P(_e)) {
            if (B(q, Y, me).label === "member-chain")
              return !1;
            let W = N(_e);
            return !(W.length === 0 || W.length === 1 && Z(W[0], Y)) || ne(_e, me) ? !1 : q.call(Q, "callee");
          }
          return A(_e) ? q.call(Q, "object") : ge && (_e.type === "Identifier" || _e.type === "ThisExpression");
        }
        var O = 0.25;
        function Z(q, Y) {
          let { printWidth: me } = Y;
          if (j(q))
            return !1;
          let ge = me * O;
          if (q.type === "ThisExpression" || q.type === "Identifier" && q.name.length <= ge || k(q) && !j(q.argument))
            return !0;
          let _e = q.type === "Literal" && "regex" in q && q.regex.pattern || q.type === "RegExpLiteral" && q.pattern;
          return _e ? _e.length <= ge : D(q) ? S(q).length <= ge : q.type === "TemplateLiteral" ? q.expressions.length === 0 && q.quasis[0].value.raw.length <= ge && !q.quasis[0].value.raw.includes(`
`) : C(q);
        }
        function ae(q, Y, me) {
          if (!J(q))
            return !1;
          Y = c(Y);
          let ge = 3;
          return typeof Y == "string" && s(Y) < me.tabWidth + ge;
        }
        function ne(q, Y) {
          let me = he(q);
          if (t(me)) {
            if (me.length > 1)
              return !0;
            if (me.length === 1) {
              let _e = me[0];
              if (_e.type === "TSUnionType" || _e.type === "UnionTypeAnnotation" || _e.type === "TSIntersectionType" || _e.type === "IntersectionTypeAnnotation" || _e.type === "TSTypeLiteral" || _e.type === "ObjectTypeAnnotation")
                return !0;
            }
            let ge = q.typeParameters ? "typeParameters" : "typeArguments";
            if (h(Y(ge)))
              return !0;
          }
          return !1;
        }
        function he(q) {
          return q.typeParameters && q.typeParameters.params || q.typeArguments && q.typeArguments.params;
        }
        l.exports = { printVariableDeclarator: a, printAssignmentExpression: F, printAssignment: d, isArrowFunctionVariableDeclarator: U };
      } }), eu = X({ "src/language-js/print/function-parameters.js"(u, l) {
        H();
        var { getNextNonSpaceNonCommentCharacter: t } = bt(), { printDanglingComments: s } = an(), { builders: { line: i, hardline: e, softline: n, group: r, indent: o, ifBreak: c }, utils: { removeLines: h, willBreak: m } } = pt(), { getFunctionParameters: y, iterateFunctionParametersPath: p, isSimpleType: D, isTestCall: C, isTypeAnnotationAFunction: w, isObjectType: P, isObjectTypePropertyAFunction: A, hasRestParameter: N, shouldPrintComma: S, hasComment: j, isNextLineEmpty: k } = Jt(), { locEnd: J } = yn(), { ArgExpansionBailout: f } = xr(), { printFunctionTypeParameters: B } = Tn();
        function d(E, b, x, T, I) {
          let M = E.getValue(), V = y(M), $ = I ? B(E, x, b) : "";
          if (V.length === 0)
            return [$, "(", s(E, x, !0, (Z) => t(x.originalText, Z, J) === ")"), ")"];
          let U = E.getParentNode(), _ = C(U), ee = F(M), R = [];
          if (p(E, (Z, ae) => {
            let ne = ae === V.length - 1;
            ne && M.rest && R.push("..."), R.push(b()), !ne && (R.push(","), _ || ee ? R.push(" ") : k(V[ae], x) ? R.push(e, e) : R.push(i));
          }), T) {
            if (m($) || m(R))
              throw new f();
            return r([h($), "(", h(R), ")"]);
          }
          let O = V.every((Z) => !Z.decorators);
          return ee && O ? [$, "(", ...R, ")"] : _ ? [$, "(", ...R, ")"] : (A(U) || w(U) || U.type === "TypeAlias" || U.type === "UnionTypeAnnotation" || U.type === "TSUnionType" || U.type === "IntersectionTypeAnnotation" || U.type === "FunctionTypeAnnotation" && U.returnType === M) && V.length === 1 && V[0].name === null && M.this !== V[0] && V[0].typeAnnotation && M.typeParameters === null && D(V[0].typeAnnotation) && !M.rest ? x.arrowParens === "always" ? ["(", ...R, ")"] : R : [$, "(", o([n, ...R]), c(!N(M) && S(x, "all") ? "," : ""), n, ")"];
        }
        function F(E) {
          if (!E)
            return !1;
          let b = y(E);
          if (b.length !== 1)
            return !1;
          let [x] = b;
          return !j(x) && (x.type === "ObjectPattern" || x.type === "ArrayPattern" || x.type === "Identifier" && x.typeAnnotation && (x.typeAnnotation.type === "TypeAnnotation" || x.typeAnnotation.type === "TSTypeAnnotation") && P(x.typeAnnotation.typeAnnotation) || x.type === "FunctionTypeParam" && P(x.typeAnnotation) || x.type === "AssignmentPattern" && (x.left.type === "ObjectPattern" || x.left.type === "ArrayPattern") && (x.right.type === "Identifier" || x.right.type === "ObjectExpression" && x.right.properties.length === 0 || x.right.type === "ArrayExpression" && x.right.elements.length === 0));
        }
        function a(E) {
          let b;
          return E.returnType ? (b = E.returnType, b.typeAnnotation && (b = b.typeAnnotation)) : E.typeAnnotation && (b = E.typeAnnotation), b;
        }
        function g(E, b) {
          let x = a(E);
          if (!x)
            return !1;
          let T = E.typeParameters && E.typeParameters.params;
          if (T) {
            if (T.length > 1)
              return !1;
            if (T.length === 1) {
              let I = T[0];
              if (I.constraint || I.default)
                return !1;
            }
          }
          return y(E).length === 1 && (P(x) || m(b));
        }
        l.exports = { printFunctionParameters: d, shouldHugFunctionParameters: F, shouldGroupFunctionParameters: g };
      } }), tu = X({ "src/language-js/print/type-annotation.js"(u, l) {
        H();
        var { printComments: t, printDanglingComments: s } = an(), { isNonEmptyArray: i } = bt(), { builders: { group: e, join: n, line: r, softline: o, indent: c, align: h, ifBreak: m } } = pt(), y = lr(), { locStart: p } = yn(), { isSimpleType: D, isObjectType: C, hasLeadingOwnLineComment: w, isObjectTypePropertyAFunction: P, shouldPrintComma: A } = Jt(), { printAssignment: N } = wr(), { printFunctionParameters: S, shouldGroupFunctionParameters: j } = eu(), { printArrayItems: k } = Tr();
        function J(x) {
          if (D(x) || C(x))
            return !0;
          if (x.type === "UnionTypeAnnotation" || x.type === "TSUnionType") {
            let T = x.types.filter((M) => M.type === "VoidTypeAnnotation" || M.type === "TSVoidKeyword" || M.type === "NullLiteralTypeAnnotation" || M.type === "TSNullKeyword").length, I = x.types.some((M) => M.type === "ObjectTypeAnnotation" || M.type === "TSTypeLiteral" || M.type === "GenericTypeAnnotation" || M.type === "TSTypeReference");
            if (x.types.length - 1 === T && I)
              return !0;
          }
          return !1;
        }
        function f(x, T, I) {
          let M = T.semi ? ";" : "", V = x.getValue(), $ = [];
          return $.push("opaque type ", I("id"), I("typeParameters")), V.supertype && $.push(": ", I("supertype")), V.impltype && $.push(" = ", I("impltype")), $.push(M), $;
        }
        function B(x, T, I) {
          let M = T.semi ? ";" : "", V = x.getValue(), $ = [];
          V.declare && $.push("declare "), $.push("type ", I("id"), I("typeParameters"));
          let U = V.type === "TSTypeAliasDeclaration" ? "typeAnnotation" : "right";
          return [N(x, T, I, $, " =", U), M];
        }
        function d(x, T, I) {
          let M = x.getValue(), V = x.map(I, "types"), $ = [], U = !1;
          for (let _ = 0; _ < V.length; ++_)
            _ === 0 ? $.push(V[_]) : C(M.types[_ - 1]) && C(M.types[_]) ? $.push([" & ", U ? c(V[_]) : V[_]]) : !C(M.types[_ - 1]) && !C(M.types[_]) ? $.push(c([" &", r, V[_]])) : (_ > 1 && (U = !0), $.push(" & ", _ > 1 ? c(V[_]) : V[_]));
          return e($);
        }
        function F(x, T, I) {
          let M = x.getValue(), V = x.getParentNode(), $ = V.type !== "TypeParameterInstantiation" && V.type !== "TSTypeParameterInstantiation" && V.type !== "GenericTypeAnnotation" && V.type !== "TSTypeReference" && V.type !== "TSTypeAssertion" && V.type !== "TupleTypeAnnotation" && V.type !== "TSTupleType" && !(V.type === "FunctionTypeParam" && !V.name && x.getParentNode(1).this !== V) && !((V.type === "TypeAlias" || V.type === "VariableDeclarator" || V.type === "TSTypeAliasDeclaration") && w(T.originalText, M)), U = J(M), _ = x.map((O) => {
            let Z = I();
            return U || (Z = h(2, Z)), t(O, Z, T);
          }, "types");
          if (U)
            return n(" | ", _);
          let ee = $ && !w(T.originalText, M), R = [m([ee ? r : "", "| "]), n([r, "| "], _)];
          return y(x, T) ? e([c(R), o]) : V.type === "TupleTypeAnnotation" && V.types.length > 1 || V.type === "TSTupleType" && V.elementTypes.length > 1 ? e([c([m(["(", o]), R]), o, m(")")]) : e($ ? c(R) : R);
        }
        function a(x, T, I) {
          let M = x.getValue(), V = [], $ = x.getParentNode(0), U = x.getParentNode(1), _ = x.getParentNode(2), ee = M.type === "TSFunctionType" || !(($.type === "ObjectTypeProperty" || $.type === "ObjectTypeInternalSlot") && !$.variance && !$.optional && p($) === p(M) || $.type === "ObjectTypeCallProperty" || _ && _.type === "DeclareFunction"), R = ee && ($.type === "TypeAnnotation" || $.type === "TSTypeAnnotation"), O = R && ee && ($.type === "TypeAnnotation" || $.type === "TSTypeAnnotation") && U.type === "ArrowFunctionExpression";
          P($) && (ee = !0, R = !0), O && V.push("(");
          let Z = S(x, I, T, !1, !0), ae = M.returnType || M.predicate || M.typeAnnotation ? [ee ? " => " : ": ", I("returnType"), I("predicate"), I("typeAnnotation")] : "", ne = j(M, ae);
          return V.push(ne ? e(Z) : Z), ae && V.push(ae), O && V.push(")"), e(V);
        }
        function g(x, T, I) {
          let M = x.getValue(), V = M.type === "TSTupleType" ? "elementTypes" : "types", $ = M[V], U = i($), _ = U ? o : "";
          return e(["[", c([_, k(x, T, V, I)]), m(U && A(T, "all") ? "," : ""), s(x, T, !0), _, "]"]);
        }
        function E(x, T, I) {
          let M = x.getValue(), V = M.type === "OptionalIndexedAccessType" && M.optional ? "?.[" : "[";
          return [I("objectType"), V, I("indexType"), "]"];
        }
        function b(x, T, I) {
          let M = x.getValue();
          return [M.postfix ? "" : I, T("typeAnnotation"), M.postfix ? I : ""];
        }
        l.exports = { printOpaqueType: f, printTypeAlias: B, printIntersectionType: d, printUnionType: F, printFunctionType: a, printTupleType: g, printIndexedAccessType: E, shouldHugType: J, printJSDocType: b };
      } }), nu = X({ "src/language-js/print/type-parameters.js"(u, l) {
        H();
        var { printDanglingComments: t } = an(), { builders: { join: s, line: i, hardline: e, softline: n, group: r, indent: o, ifBreak: c } } = pt(), { isTestCall: h, hasComment: m, CommentCheckFlags: y, isTSXFile: p, shouldPrintComma: D, getFunctionParameters: C, isObjectType: w, getTypeScriptMappedTypeModifier: P } = Jt(), { createGroupIdMapper: A } = bt(), { shouldHugType: N } = tu(), { isArrowFunctionVariableDeclarator: S } = wr(), j = A("typeParameters");
        function k(B, d, F, a) {
          let g = B.getValue();
          if (!g[a])
            return "";
          if (!Array.isArray(g[a]))
            return F(a);
          let E = B.getNode(2), b = E && h(E), x = B.match((I) => !(I[a].length === 1 && w(I[a][0])), void 0, (I, M) => M === "typeAnnotation", (I) => I.type === "Identifier", S);
          if (g[a].length === 0 || !x && (b || g[a].length === 1 && (g[a][0].type === "NullableTypeAnnotation" || N(g[a][0]))))
            return ["<", s(", ", B.map(F, a)), J(B, d), ">"];
          let T = g.type === "TSTypeParameterInstantiation" ? "" : C(g).length === 1 && p(d) && !g[a][0].constraint && B.getParentNode().type === "ArrowFunctionExpression" ? "," : D(d, "all") ? c(",") : "";
          return r(["<", o([n, s([",", i], B.map(F, a))]), T, n, ">"], { id: j(g) });
        }
        function J(B, d) {
          let F = B.getValue();
          if (!m(F, y.Dangling))
            return "";
          let a = !m(F, y.Line), g = t(B, d, a);
          return a ? g : [g, e];
        }
        function f(B, d, F) {
          let a = B.getValue(), g = [], E = B.getParentNode();
          return E.type === "TSMappedType" ? (E.readonly && g.push(P(E.readonly, "readonly"), " "), g.push("[", F("name")), a.constraint && g.push(" in ", F("constraint")), E.nameType && g.push(" as ", B.callParent(() => F("nameType"))), g.push("]"), g) : (a.variance && g.push(F("variance")), a.in && g.push("in "), a.out && g.push("out "), g.push(F("name")), a.bound && g.push(": ", F("bound")), a.constraint && g.push(" extends ", F("constraint")), a.default && g.push(" = ", F("default")), g);
        }
        l.exports = { printTypeParameter: f, printTypeParameters: k, getTypeParametersGroupId: j };
      } }), Nr = X({ "src/language-js/print/property.js"(u, l) {
        H();
        var { printComments: t } = an(), { printString: s, printNumber: i } = bt(), { isNumericLiteral: e, isSimpleNumber: n, isStringLiteral: r, isStringPropSafeToUnquote: o, rawText: c } = Jt(), { printAssignment: h } = wr(), m = /* @__PURE__ */ new WeakMap();
        function y(D, C, w) {
          let P = D.getNode();
          if (P.computed)
            return ["[", w("key"), "]"];
          let A = D.getParentNode(), { key: N } = P;
          if (C.quoteProps === "consistent" && !m.has(A)) {
            let S = (A.properties || A.body || A.members).some((j) => !j.computed && j.key && r(j.key) && !o(j, C));
            m.set(A, S);
          }
          if ((N.type === "Identifier" || e(N) && n(i(c(N))) && String(N.value) === i(c(N)) && !(C.parser === "typescript" || C.parser === "babel-ts")) && (C.parser === "json" || C.quoteProps === "consistent" && m.get(A))) {
            let S = s(JSON.stringify(N.type === "Identifier" ? N.name : N.value.toString()), C);
            return D.call((j) => t(j, S, C), "key");
          }
          return o(P, C) && (C.quoteProps === "as-needed" || C.quoteProps === "consistent" && !m.get(A)) ? D.call((S) => t(S, /^\d/.test(N.value) ? i(N.value) : N.value, C), "key") : w("key");
        }
        function p(D, C, w) {
          return D.getValue().shorthand ? w("value") : h(D, C, w, y(D, C, w), ":", "value");
        }
        l.exports = { printProperty: p, printPropertyKey: y };
      } }), ru = X({ "src/language-js/print/function.js"(u, l) {
        H();
        var t = Br(), { printDanglingComments: s, printCommentsSeparately: i } = an(), e = cn(), { getNextNonSpaceNonCommentCharacterIndex: n } = bt(), { builders: { line: r, softline: o, group: c, indent: h, ifBreak: m, hardline: y, join: p, indentIfBreak: D }, utils: { removeLines: C, willBreak: w } } = pt(), { ArgExpansionBailout: P } = xr(), { getFunctionParameters: A, hasLeadingOwnLineComment: N, isFlowAnnotationComment: S, isJsxNode: j, isTemplateOnItsOwnLine: k, shouldPrintComma: J, startsWithNoLookaheadToken: f, isBinaryish: B, isLineComment: d, hasComment: F, getComments: a, CommentCheckFlags: g, isCallLikeExpression: E, isCallExpression: b, getCallArguments: x, hasNakedLeftSide: T, getLeftSide: I } = Jt(), { locEnd: M } = yn(), { printFunctionParameters: V, shouldGroupFunctionParameters: $ } = eu(), { printPropertyKey: U } = Nr(), { printFunctionTypeParameters: _ } = Tn();
        function ee(W, re, ue, Ce) {
          let be = W.getValue(), Be = !1;
          if ((be.type === "FunctionDeclaration" || be.type === "FunctionExpression") && Ce && Ce.expandLastArg) {
            let tt = W.getParentNode();
            b(tt) && x(tt).length > 1 && (Be = !0);
          }
          let ze = [];
          be.type === "TSDeclareFunction" && be.declare && ze.push("declare "), be.async && ze.push("async "), be.generator ? ze.push("function* ") : ze.push("function "), be.id && ze.push(re("id"));
          let mt = V(W, re, ue, Be), Dt = Y(W, re, ue), Ue = $(be, Dt);
          return ze.push(_(W, ue, re), c([Ue ? c(mt) : mt, Dt]), be.body ? " " : "", re("body")), ue.semi && (be.declare || !be.body) && ze.push(";"), ze;
        }
        function R(W, re, ue) {
          let Ce = W.getNode(), { kind: be } = Ce, Be = Ce.value || Ce, ze = [];
          return !be || be === "init" || be === "method" || be === "constructor" ? Be.async && ze.push("async ") : (t.ok(be === "get" || be === "set"), ze.push(be, " ")), Be.generator && ze.push("*"), ze.push(U(W, re, ue), Ce.optional || Ce.key.optional ? "?" : ""), Ce === Be ? ze.push(O(W, re, ue)) : Be.type === "FunctionExpression" ? ze.push(W.call((mt) => O(mt, re, ue), "value")) : ze.push(ue("value")), ze;
        }
        function O(W, re, ue) {
          let Ce = W.getNode(), be = V(W, ue, re), Be = Y(W, ue, re), ze = $(Ce, Be), mt = [_(W, re, ue), c([ze ? c(be) : be, Be])];
          return Ce.body ? mt.push(" ", ue("body")) : mt.push(re.semi ? ";" : ""), mt;
        }
        function Z(W, re, ue, Ce) {
          let be = W.getValue(), Be = [];
          if (be.async && Be.push("async "), q(W, re))
            Be.push(ue(["params", 0]));
          else {
            let mt = Ce && (Ce.expandLastArg || Ce.expandFirstArg), Dt = Y(W, ue, re);
            if (mt) {
              if (w(Dt))
                throw new P();
              Dt = c(C(Dt));
            }
            Be.push(c([V(W, ue, re, mt, !0), Dt]));
          }
          let ze = s(W, re, !0, (mt) => {
            let Dt = n(re.originalText, mt, M);
            return Dt !== !1 && re.originalText.slice(Dt, Dt + 2) === "=>";
          });
          return ze && Be.push(" ", ze), Be;
        }
        function ae(W, re, ue, Ce, be, Be) {
          let ze = W.getName(), mt = W.getParentNode(), Dt = E(mt) && ze === "callee", Ue = Boolean(re && re.assignmentLayout), tt = Be.body.type !== "BlockStatement" && Be.body.type !== "ObjectExpression" && Be.body.type !== "SequenceExpression", ce = Dt && tt || re && re.assignmentLayout === "chain-tail-arrow-chain", G = Symbol("arrow-chain");
          return Be.body.type === "SequenceExpression" && (be = c(["(", h([o, be]), o, ")"])), c([c(h([Dt || Ue ? o : "", c(p([" =>", r], ue), { shouldBreak: Ce })]), { id: G, shouldBreak: ce }), " =>", D(tt ? h([r, be]) : [" ", be], { groupId: G }), Dt ? m(o, "", { groupId: G }) : ""]);
        }
        function ne(W, re, ue, Ce) {
          let be = W.getValue(), Be = [], ze = [], mt = !1;
          if (function G() {
            let ye = Z(W, re, ue, Ce);
            if (Be.length === 0)
              Be.push(ye);
            else {
              let { leading: K, trailing: fe } = i(W, re);
              Be.push([K, ye]), ze.unshift(fe);
            }
            mt = mt || be.returnType && A(be).length > 0 || be.typeParameters || A(be).some((K) => K.type !== "Identifier"), be.body.type !== "ArrowFunctionExpression" || Ce && Ce.expandLastArg ? ze.unshift(ue("body", Ce)) : (be = be.body, W.call(G, "body"));
          }(), Be.length > 1)
            return ae(W, Ce, Be, mt, ze, be);
          let Dt = Be;
          if (Dt.push(" =>"), !N(re.originalText, be.body) && (be.body.type === "ArrayExpression" || be.body.type === "ObjectExpression" || be.body.type === "BlockStatement" || j(be.body) || k(be.body, re.originalText) || be.body.type === "ArrowFunctionExpression" || be.body.type === "DoExpression"))
            return c([...Dt, " ", ze]);
          if (be.body.type === "SequenceExpression")
            return c([...Dt, c([" (", h([o, ze]), o, ")"])]);
          let Ue = (Ce && Ce.expandLastArg || W.getParentNode().type === "JSXExpressionContainer") && !F(be), tt = Ce && Ce.expandLastArg && J(re, "all"), ce = be.body.type === "ConditionalExpression" && !f(be.body, (G) => G.type === "ObjectExpression");
          return c([...Dt, c([h([r, ce ? m("", "(") : "", ze, ce ? m("", ")") : ""]), Ue ? [m(tt ? "," : ""), o] : ""])]);
        }
        function he(W) {
          let re = A(W);
          return re.length === 1 && !W.typeParameters && !F(W, g.Dangling) && re[0].type === "Identifier" && !re[0].typeAnnotation && !F(re[0]) && !re[0].optional && !W.predicate && !W.returnType;
        }
        function q(W, re) {
          if (re.arrowParens === "always")
            return !1;
          if (re.arrowParens === "avoid") {
            let ue = W.getValue();
            return he(ue);
          }
          return !1;
        }
        function Y(W, re, ue) {
          let Ce = W.getValue(), be = re("returnType");
          if (Ce.returnType && S(ue.originalText, Ce.returnType))
            return [" /*: ", be, " */"];
          let Be = [be];
          return Ce.returnType && Ce.returnType.typeAnnotation && Be.unshift(": "), Ce.predicate && Be.push(Ce.returnType ? " " : ": ", re("predicate")), Be;
        }
        function me(W, re, ue) {
          let Ce = W.getValue(), be = re.semi ? ";" : "", Be = [];
          Ce.argument && (Q(re, Ce.argument) ? Be.push([" (", h([y, ue("argument")]), y, ")"]) : B(Ce.argument) || Ce.argument.type === "SequenceExpression" ? Be.push(c([m(" (", " "), h([o, ue("argument")]), o, m(")")])) : Be.push(" ", ue("argument")));
          let ze = a(Ce), mt = e(ze), Dt = mt && d(mt);
          return Dt && Be.push(be), F(Ce, g.Dangling) && Be.push(" ", s(W, re, !0)), Dt || Be.push(be), Be;
        }
        function ge(W, re, ue) {
          return ["return", me(W, re, ue)];
        }
        function _e(W, re, ue) {
          return ["throw", me(W, re, ue)];
        }
        function Q(W, re) {
          if (N(W.originalText, re))
            return !0;
          if (T(re)) {
            let ue = re, Ce;
            for (; Ce = I(ue); )
              if (ue = Ce, N(W.originalText, ue))
                return !0;
          }
          return !1;
        }
        l.exports = { printFunction: ee, printArrowFunction: ne, printMethod: R, printReturnStatement: ge, printThrowStatement: _e, printMethodInternal: O, shouldPrintParamsWithoutParens: q };
      } }), Tu = X({ "src/language-js/print/decorators.js"(u, l) {
        H();
        var { isNonEmptyArray: t, hasNewline: s } = bt(), { builders: { line: i, hardline: e, join: n, breakParent: r, group: o } } = pt(), { locStart: c, locEnd: h } = yn(), { getParentExportDeclaration: m } = Jt();
        function y(P, A, N) {
          let S = P.getValue();
          return o([n(i, P.map(N, "decorators")), C(S, A) ? e : i]);
        }
        function p(P, A, N) {
          return [n(e, P.map(N, "declaration", "decorators")), e];
        }
        function D(P, A, N) {
          let S = P.getValue(), { decorators: j } = S;
          if (!t(j) || w(P.getParentNode()))
            return;
          let k = S.type === "ClassExpression" || S.type === "ClassDeclaration" || C(S, A);
          return [m(P) ? e : k ? r : "", n(i, P.map(N, "decorators")), i];
        }
        function C(P, A) {
          return P.decorators.some((N) => s(A.originalText, h(N)));
        }
        function w(P) {
          if (P.type !== "ExportDefaultDeclaration" && P.type !== "ExportNamedDeclaration" && P.type !== "DeclareExportDeclaration")
            return !1;
          let A = P.declaration && P.declaration.decorators;
          return t(A) && c(P) === c(A[0]);
        }
        l.exports = { printDecorators: D, printClassMemberDecorators: y, printDecoratorsBeforeExport: p, hasDecoratorsBeforeExport: w };
      } }), kr = X({ "src/language-js/print/class.js"(u, l) {
        H();
        var { isNonEmptyArray: t, createGroupIdMapper: s } = bt(), { printComments: i, printDanglingComments: e } = an(), { builders: { join: n, line: r, hardline: o, softline: c, group: h, indent: m, ifBreak: y } } = pt(), { hasComment: p, CommentCheckFlags: D } = Jt(), { getTypeParametersGroupId: C } = nu(), { printMethod: w } = ru(), { printOptionalToken: P, printTypeAnnotation: A, printDefiniteToken: N } = Tn(), { printPropertyKey: S } = Nr(), { printAssignment: j } = wr(), { printClassMemberDecorators: k } = Tu();
        function J(x, T, I) {
          let M = x.getValue(), V = [];
          M.declare && V.push("declare "), M.abstract && V.push("abstract "), V.push("class");
          let $ = M.id && p(M.id, D.Trailing) || M.typeParameters && p(M.typeParameters, D.Trailing) || M.superClass && p(M.superClass) || t(M.extends) || t(M.mixins) || t(M.implements), U = [], _ = [];
          if (M.id && U.push(" ", I("id")), U.push(I("typeParameters")), M.superClass) {
            let ee = [g(x, T, I), I("superTypeParameters")], R = x.call((O) => ["extends ", i(O, ee, T)], "superClass");
            $ ? _.push(r, h(R)) : _.push(" ", R);
          } else
            _.push(a(x, T, I, "extends"));
          if (_.push(a(x, T, I, "mixins"), a(x, T, I, "implements")), $) {
            let ee;
            F(M) ? ee = [...U, m(_)] : ee = m([...U, _]), V.push(h(ee, { id: f(M) }));
          } else
            V.push(...U, ..._);
          return V.push(" ", I("body")), V;
        }
        var f = s("heritageGroup");
        function B(x) {
          return y(o, "", { groupId: f(x) });
        }
        function d(x) {
          return ["superClass", "extends", "mixins", "implements"].filter((T) => Boolean(x[T])).length > 1;
        }
        function F(x) {
          return x.typeParameters && !p(x.typeParameters, D.Trailing | D.Line) && !d(x);
        }
        function a(x, T, I, M) {
          let V = x.getValue();
          if (!t(V[M]))
            return "";
          let $ = e(x, T, !0, (U) => {
            let { marker: _ } = U;
            return _ === M;
          });
          return [F(V) ? y(" ", r, { groupId: C(V.typeParameters) }) : r, $, $ && o, M, h(m([r, n([",", r], x.map(I, M))]))];
        }
        function g(x, T, I) {
          let M = I("superClass");
          return x.getParentNode().type === "AssignmentExpression" ? h(y(["(", m([c, M]), c, ")"], M)) : M;
        }
        function E(x, T, I) {
          let M = x.getValue(), V = [];
          return t(M.decorators) && V.push(k(x, T, I)), M.accessibility && V.push(M.accessibility + " "), M.readonly && V.push("readonly "), M.declare && V.push("declare "), M.static && V.push("static "), (M.type === "TSAbstractMethodDefinition" || M.abstract) && V.push("abstract "), M.override && V.push("override "), V.push(w(x, T, I)), V;
        }
        function b(x, T, I) {
          let M = x.getValue(), V = [], $ = T.semi ? ";" : "";
          return t(M.decorators) && V.push(k(x, T, I)), M.accessibility && V.push(M.accessibility + " "), M.declare && V.push("declare "), M.static && V.push("static "), (M.type === "TSAbstractPropertyDefinition" || M.type === "TSAbstractAccessorProperty" || M.abstract) && V.push("abstract "), M.override && V.push("override "), M.readonly && V.push("readonly "), M.variance && V.push(I("variance")), (M.type === "ClassAccessorProperty" || M.type === "AccessorProperty" || M.type === "TSAbstractAccessorProperty") && V.push("accessor "), V.push(S(x, T, I), P(x), N(x), A(x, T, I)), [j(x, T, I, V, " =", "value"), $];
        }
        l.exports = { printClass: J, printClassMethod: E, printClassProperty: b, printHardlineAfterHeritage: B };
      } }), ji = X({ "src/language-js/print/interface.js"(u, l) {
        H();
        var { isNonEmptyArray: t } = bt(), { builders: { join: s, line: i, group: e, indent: n, ifBreak: r } } = pt(), { hasComment: o, identity: c, CommentCheckFlags: h } = Jt(), { getTypeParametersGroupId: m } = nu(), { printTypeScriptModifiers: y } = Tn();
        function p(D, C, w) {
          let P = D.getValue(), A = [];
          P.declare && A.push("declare "), P.type === "TSInterfaceDeclaration" && A.push(P.abstract ? "abstract " : "", y(D, C, w)), A.push("interface");
          let N = [], S = [];
          P.type !== "InterfaceTypeAnnotation" && N.push(" ", w("id"), w("typeParameters"));
          let j = P.typeParameters && !o(P.typeParameters, h.Trailing | h.Line);
          return t(P.extends) && S.push(j ? r(" ", i, { groupId: m(P.typeParameters) }) : i, "extends ", (P.extends.length === 1 ? c : n)(s([",", i], D.map(w, "extends")))), P.id && o(P.id, h.Trailing) || t(P.extends) ? j ? A.push(e([...N, n(S)])) : A.push(e(n([...N, ...S]))) : A.push(...N, ...S), A.push(" ", w("body")), e(A);
        }
        l.exports = { printInterface: p };
      } }), Ii = X({ "src/language-js/print/module.js"(u, l) {
        H();
        var { isNonEmptyArray: t } = bt(), { builders: { softline: s, group: i, indent: e, join: n, line: r, ifBreak: o, hardline: c } } = pt(), { printDanglingComments: h } = an(), { hasComment: m, CommentCheckFlags: y, shouldPrintComma: p, needsHardlineAfterDanglingComment: D, isStringLiteral: C, rawText: w } = Jt(), { locStart: P, hasSameLoc: A } = yn(), { hasDecoratorsBeforeExport: N, printDecoratorsBeforeExport: S } = Tu();
        function j(b, x, T) {
          let I = b.getValue(), M = x.semi ? ";" : "", V = [], { importKind: $ } = I;
          return V.push("import"), $ && $ !== "value" && V.push(" ", $), V.push(d(b, x, T), B(b, x, T), a(b, x, T), M), V;
        }
        function k(b, x, T) {
          let I = b.getValue(), M = [];
          N(I) && M.push(S(b, x, T));
          let { type: V, exportKind: $, declaration: U } = I;
          return M.push("export"), (I.default || V === "ExportDefaultDeclaration") && M.push(" default"), m(I, y.Dangling) && (M.push(" ", h(b, x, !0)), D(I) && M.push(c)), U ? M.push(" ", T("declaration")) : M.push($ === "type" ? " type" : "", d(b, x, T), B(b, x, T), a(b, x, T)), f(I, x) && M.push(";"), M;
        }
        function J(b, x, T) {
          let I = b.getValue(), M = x.semi ? ";" : "", V = [], { exportKind: $, exported: U } = I;
          return V.push("export"), $ === "type" && V.push(" type"), V.push(" *"), U && V.push(" as ", T("exported")), V.push(B(b, x, T), a(b, x, T), M), V;
        }
        function f(b, x) {
          if (!x.semi)
            return !1;
          let { type: T, declaration: I } = b, M = b.default || T === "ExportDefaultDeclaration";
          if (!I)
            return !0;
          let { type: V } = I;
          return !!(M && V !== "ClassDeclaration" && V !== "FunctionDeclaration" && V !== "TSInterfaceDeclaration" && V !== "DeclareClass" && V !== "DeclareFunction" && V !== "TSDeclareFunction" && V !== "EnumDeclaration");
        }
        function B(b, x, T) {
          let I = b.getValue();
          if (!I.source)
            return "";
          let M = [];
          return F(I, x) || M.push(" from"), M.push(" ", T("source")), M;
        }
        function d(b, x, T) {
          let I = b.getValue();
          if (F(I, x))
            return "";
          let M = [" "];
          if (t(I.specifiers)) {
            let V = [], $ = [];
            b.each(() => {
              let U = b.getValue().type;
              if (U === "ExportNamespaceSpecifier" || U === "ExportDefaultSpecifier" || U === "ImportNamespaceSpecifier" || U === "ImportDefaultSpecifier")
                V.push(T());
              else if (U === "ExportSpecifier" || U === "ImportSpecifier")
                $.push(T());
              else
                throw new Error(`Unknown specifier type ${JSON.stringify(U)}`);
            }, "specifiers"), M.push(n(", ", V)), $.length > 0 && (V.length > 0 && M.push(", "), $.length > 1 || V.length > 0 || I.specifiers.some((U) => m(U)) ? M.push(i(["{", e([x.bracketSpacing ? r : s, n([",", r], $)]), o(p(x) ? "," : ""), x.bracketSpacing ? r : s, "}"])) : M.push(["{", x.bracketSpacing ? " " : "", ...$, x.bracketSpacing ? " " : "", "}"]));
          } else
            M.push("{}");
          return M;
        }
        function F(b, x) {
          let { type: T, importKind: I, source: M, specifiers: V } = b;
          return T !== "ImportDeclaration" || t(V) || I === "type" ? !1 : !/{\s*}/.test(x.originalText.slice(P(b), P(M)));
        }
        function a(b, x, T) {
          let I = b.getNode();
          return t(I.assertions) ? [" assert {", x.bracketSpacing ? " " : "", n(", ", b.map(T, "assertions")), x.bracketSpacing ? " " : "", "}"] : "";
        }
        function g(b, x, T) {
          let I = b.getNode(), { type: M } = I, V = [], $ = M === "ImportSpecifier" ? I.importKind : I.exportKind;
          $ && $ !== "value" && V.push($, " ");
          let U = M.startsWith("Import"), _ = U ? "imported" : "local", ee = U ? "local" : "exported", R = I[_], O = I[ee], Z = "", ae = "";
          return M === "ExportNamespaceSpecifier" || M === "ImportNamespaceSpecifier" ? Z = "*" : R && (Z = T(_)), O && !E(I) && (ae = T(ee)), V.push(Z, Z && ae ? " as " : "", ae), V;
        }
        function E(b) {
          if (b.type !== "ImportSpecifier" && b.type !== "ExportSpecifier")
            return !1;
          let { local: x, [b.type === "ImportSpecifier" ? "imported" : "exported"]: T } = b;
          if (x.type !== T.type || !A(x, T))
            return !1;
          if (C(x))
            return x.value === T.value && w(x) === w(T);
          switch (x.type) {
            case "Identifier":
              return x.name === T.name;
            default:
              return !1;
          }
        }
        l.exports = { printImportDeclaration: j, printExportDeclaration: k, printExportAllDeclaration: J, printModuleSpecifier: g };
      } }), wu = X({ "src/language-js/print/object.js"(u, l) {
        H();
        var { printDanglingComments: t } = an(), { builders: { line: s, softline: i, group: e, indent: n, ifBreak: r, hardline: o } } = pt(), { getLast: c, hasNewlineInRange: h, hasNewline: m, isNonEmptyArray: y } = bt(), { shouldPrintComma: p, hasComment: D, getComments: C, CommentCheckFlags: w, isNextLineEmpty: P } = Jt(), { locStart: A, locEnd: N } = yn(), { printOptionalToken: S, printTypeAnnotation: j } = Tn(), { shouldHugFunctionParameters: k } = eu(), { shouldHugType: J } = tu(), { printHardlineAfterHeritage: f } = kr();
        function B(d, F, a) {
          let g = F.semi ? ";" : "", E = d.getValue(), b;
          E.type === "TSTypeLiteral" ? b = "members" : E.type === "TSInterfaceBody" ? b = "body" : b = "properties";
          let x = E.type === "ObjectTypeAnnotation", T = [b];
          x && T.push("indexers", "callProperties", "internalSlots");
          let I = T.map((q) => E[q][0]).sort((q, Y) => A(q) - A(Y))[0], M = d.getParentNode(0), V = x && M && (M.type === "InterfaceDeclaration" || M.type === "DeclareInterface" || M.type === "DeclareClass") && d.getName() === "body", $ = E.type === "TSInterfaceBody" || V || E.type === "ObjectPattern" && M.type !== "FunctionDeclaration" && M.type !== "FunctionExpression" && M.type !== "ArrowFunctionExpression" && M.type !== "ObjectMethod" && M.type !== "ClassMethod" && M.type !== "ClassPrivateMethod" && M.type !== "AssignmentPattern" && M.type !== "CatchClause" && E.properties.some((q) => q.value && (q.value.type === "ObjectPattern" || q.value.type === "ArrayPattern")) || E.type !== "ObjectPattern" && I && h(F.originalText, A(E), A(I)), U = V ? ";" : E.type === "TSInterfaceBody" || E.type === "TSTypeLiteral" ? r(g, ";") : ",", _ = E.type === "RecordExpression" ? "#{" : E.exact ? "{|" : "{", ee = E.exact ? "|}" : "}", R = [];
          for (let q of T)
            d.each((Y) => {
              let me = Y.getValue();
              R.push({ node: me, printed: a(), loc: A(me) });
            }, q);
          T.length > 1 && R.sort((q, Y) => q.loc - Y.loc);
          let O = [], Z = R.map((q) => {
            let Y = [...O, e(q.printed)];
            return O = [U, s], (q.node.type === "TSPropertySignature" || q.node.type === "TSMethodSignature" || q.node.type === "TSConstructSignatureDeclaration") && D(q.node, w.PrettierIgnore) && O.shift(), P(q.node, F) && O.push(o), Y;
          });
          if (E.inexact) {
            let q;
            if (D(E, w.Dangling)) {
              let Y = D(E, w.Line);
              q = [t(d, F, !0), Y || m(F.originalText, N(c(C(E)))) ? o : s, "..."];
            } else
              q = ["..."];
            Z.push([...O, ...q]);
          }
          let ae = c(E[b]), ne = !(E.inexact || ae && ae.type === "RestElement" || ae && (ae.type === "TSPropertySignature" || ae.type === "TSCallSignatureDeclaration" || ae.type === "TSMethodSignature" || ae.type === "TSConstructSignatureDeclaration") && D(ae, w.PrettierIgnore)), he;
          if (Z.length === 0) {
            if (!D(E, w.Dangling))
              return [_, ee, j(d, F, a)];
            he = e([_, t(d, F), i, ee, S(d), j(d, F, a)]);
          } else
            he = [V && y(E.properties) ? f(M) : "", _, n([F.bracketSpacing ? s : i, ...Z]), r(ne && (U !== "," || p(F)) ? U : ""), F.bracketSpacing ? s : i, ee, S(d), j(d, F, a)];
          return d.match((q) => q.type === "ObjectPattern" && !q.decorators, (q, Y, me) => k(q) && (Y === "params" || Y === "parameters" || Y === "this" || Y === "rest") && me === 0) || d.match(J, (q, Y) => Y === "typeAnnotation", (q, Y) => Y === "typeAnnotation", (q, Y, me) => k(q) && (Y === "params" || Y === "parameters" || Y === "this" || Y === "rest") && me === 0) || !$ && d.match((q) => q.type === "ObjectPattern", (q) => q.type === "AssignmentExpression" || q.type === "VariableDeclarator") ? he : e(he, { shouldBreak: $ });
        }
        l.exports = { printObject: B };
      } }), Us = X({ "src/language-js/print/flow.js"(u, l) {
        H();
        var t = Br(), { printDanglingComments: s } = an(), { printString: i, printNumber: e } = bt(), { builders: { hardline: n, softline: r, group: o, indent: c } } = pt(), { getParentExportDeclaration: h, isFunctionNotation: m, isGetterOrSetter: y, rawText: p, shouldPrintComma: D } = Jt(), { locStart: C, locEnd: w } = yn(), { replaceTextEndOfLine: P } = br(), { printClass: A } = kr(), { printOpaqueType: N, printTypeAlias: S, printIntersectionType: j, printUnionType: k, printFunctionType: J, printTupleType: f, printIndexedAccessType: B } = tu(), { printInterface: d } = ji(), { printTypeParameter: F, printTypeParameters: a } = nu(), { printExportDeclaration: g, printExportAllDeclaration: E } = Ii(), { printArrayItems: b } = Tr(), { printObject: x } = wu(), { printPropertyKey: T } = Nr(), { printOptionalToken: I, printTypeAnnotation: M, printRestSpread: V } = Tn();
        function $(_, ee, R) {
          let O = _.getValue(), Z = ee.semi ? ";" : "", ae = [];
          switch (O.type) {
            case "DeclareClass":
              return U(_, A(_, ee, R));
            case "DeclareFunction":
              return U(_, ["function ", R("id"), O.predicate ? " " : "", R("predicate"), Z]);
            case "DeclareModule":
              return U(_, ["module ", R("id"), " ", R("body")]);
            case "DeclareModuleExports":
              return U(_, ["module.exports", ": ", R("typeAnnotation"), Z]);
            case "DeclareVariable":
              return U(_, ["var ", R("id"), Z]);
            case "DeclareOpaqueType":
              return U(_, N(_, ee, R));
            case "DeclareInterface":
              return U(_, d(_, ee, R));
            case "DeclareTypeAlias":
              return U(_, S(_, ee, R));
            case "DeclareExportDeclaration":
              return U(_, g(_, ee, R));
            case "DeclareExportAllDeclaration":
              return U(_, E(_, ee, R));
            case "OpaqueType":
              return N(_, ee, R);
            case "TypeAlias":
              return S(_, ee, R);
            case "IntersectionTypeAnnotation":
              return j(_, ee, R);
            case "UnionTypeAnnotation":
              return k(_, ee, R);
            case "FunctionTypeAnnotation":
              return J(_, ee, R);
            case "TupleTypeAnnotation":
              return f(_, ee, R);
            case "GenericTypeAnnotation":
              return [R("id"), a(_, ee, R, "typeParameters")];
            case "IndexedAccessType":
            case "OptionalIndexedAccessType":
              return B(_, ee, R);
            case "TypeAnnotation":
              return R("typeAnnotation");
            case "TypeParameter":
              return F(_, ee, R);
            case "TypeofTypeAnnotation":
              return ["typeof ", R("argument")];
            case "ExistsTypeAnnotation":
              return "*";
            case "EmptyTypeAnnotation":
              return "empty";
            case "MixedTypeAnnotation":
              return "mixed";
            case "ArrayTypeAnnotation":
              return [R("elementType"), "[]"];
            case "BooleanLiteralTypeAnnotation":
              return String(O.value);
            case "EnumDeclaration":
              return ["enum ", R("id"), " ", R("body")];
            case "EnumBooleanBody":
            case "EnumNumberBody":
            case "EnumStringBody":
            case "EnumSymbolBody": {
              if (O.type === "EnumSymbolBody" || O.explicitType) {
                let ne = null;
                switch (O.type) {
                  case "EnumBooleanBody":
                    ne = "boolean";
                    break;
                  case "EnumNumberBody":
                    ne = "number";
                    break;
                  case "EnumStringBody":
                    ne = "string";
                    break;
                  case "EnumSymbolBody":
                    ne = "symbol";
                    break;
                }
                ae.push("of ", ne, " ");
              }
              if (O.members.length === 0 && !O.hasUnknownMembers)
                ae.push(o(["{", s(_, ee), r, "}"]));
              else {
                let ne = O.members.length > 0 ? [n, b(_, ee, "members", R), O.hasUnknownMembers || D(ee) ? "," : ""] : [];
                ae.push(o(["{", c([...ne, ...O.hasUnknownMembers ? [n, "..."] : []]), s(_, ee, !0), n, "}"]));
              }
              return ae;
            }
            case "EnumBooleanMember":
            case "EnumNumberMember":
            case "EnumStringMember":
              return [R("id"), " = ", typeof O.init == "object" ? R("init") : String(O.init)];
            case "EnumDefaultedMember":
              return R("id");
            case "FunctionTypeParam": {
              let ne = O.name ? R("name") : _.getParentNode().this === O ? "this" : "";
              return [ne, I(_), ne ? ": " : "", R("typeAnnotation")];
            }
            case "InterfaceDeclaration":
            case "InterfaceTypeAnnotation":
              return d(_, ee, R);
            case "ClassImplements":
            case "InterfaceExtends":
              return [R("id"), R("typeParameters")];
            case "NullableTypeAnnotation":
              return ["?", R("typeAnnotation")];
            case "Variance": {
              let { kind: ne } = O;
              return t.ok(ne === "plus" || ne === "minus"), ne === "plus" ? "+" : "-";
            }
            case "ObjectTypeCallProperty":
              return O.static && ae.push("static "), ae.push(R("value")), ae;
            case "ObjectTypeIndexer":
              return [O.static ? "static " : "", O.variance ? R("variance") : "", "[", R("id"), O.id ? ": " : "", R("key"), "]: ", R("value")];
            case "ObjectTypeProperty": {
              let ne = "";
              return O.proto ? ne = "proto " : O.static && (ne = "static "), [ne, y(O) ? O.kind + " " : "", O.variance ? R("variance") : "", T(_, ee, R), I(_), m(O) ? "" : ": ", R("value")];
            }
            case "ObjectTypeAnnotation":
              return x(_, ee, R);
            case "ObjectTypeInternalSlot":
              return [O.static ? "static " : "", "[[", R("id"), "]]", I(_), O.method ? "" : ": ", R("value")];
            case "ObjectTypeSpreadProperty":
              return V(_, ee, R);
            case "QualifiedTypeofIdentifier":
            case "QualifiedTypeIdentifier":
              return [R("qualification"), ".", R("id")];
            case "StringLiteralTypeAnnotation":
              return P(i(p(O), ee));
            case "NumberLiteralTypeAnnotation":
              t.strictEqual(typeof O.value, "number");
            case "BigIntLiteralTypeAnnotation":
              return O.extra ? e(O.extra.raw) : e(O.raw);
            case "TypeCastExpression":
              return ["(", R("expression"), M(_, ee, R), ")"];
            case "TypeParameterDeclaration":
            case "TypeParameterInstantiation": {
              let ne = a(_, ee, R, "params");
              if (ee.parser === "flow") {
                let he = C(O), q = w(O), Y = ee.originalText.lastIndexOf("/*", he), me = ee.originalText.indexOf("*/", q);
                if (Y !== -1 && me !== -1) {
                  let ge = ee.originalText.slice(Y + 2, me).trim();
                  if (ge.startsWith("::") && !ge.includes("/*") && !ge.includes("*/"))
                    return ["/*:: ", ne, " */"];
                }
              }
              return ne;
            }
            case "InferredPredicate":
              return "%checks";
            case "DeclaredPredicate":
              return ["%checks(", R("value"), ")"];
            case "AnyTypeAnnotation":
              return "any";
            case "BooleanTypeAnnotation":
              return "boolean";
            case "BigIntTypeAnnotation":
              return "bigint";
            case "NullLiteralTypeAnnotation":
              return "null";
            case "NumberTypeAnnotation":
              return "number";
            case "SymbolTypeAnnotation":
              return "symbol";
            case "StringTypeAnnotation":
              return "string";
            case "VoidTypeAnnotation":
              return "void";
            case "ThisTypeAnnotation":
              return "this";
            case "Node":
            case "Printable":
            case "SourceLocation":
            case "Position":
            case "Statement":
            case "Function":
            case "Pattern":
            case "Expression":
            case "Declaration":
            case "Specifier":
            case "NamedSpecifier":
            case "Comment":
            case "MemberTypeAnnotation":
            case "Type":
              throw new Error("unprintable type: " + JSON.stringify(O.type));
          }
        }
        function U(_, ee) {
          let R = h(_);
          return R ? (t.strictEqual(R.type, "DeclareExportDeclaration"), ee) : ["declare ", ee];
        }
        l.exports = { printFlow: $ };
      } }), zs = X({ "src/language-js/utils/is-ts-keyword-type.js"(u, l) {
        H();
        function t(s) {
          let { type: i } = s;
          return i.startsWith("TS") && i.endsWith("Keyword");
        }
        l.exports = t;
      } }), _i = X({ "src/language-js/print/ternary.js"(u, l) {
        H();
        var { hasNewlineInRange: t } = bt(), { isJsxNode: s, getComments: i, isCallExpression: e, isMemberExpression: n, isTSTypeExpression: r } = Jt(), { locStart: o, locEnd: c } = yn(), h = er(), { builders: { line: m, softline: y, group: p, indent: D, align: C, ifBreak: w, dedent: P, breakParent: A } } = pt();
        function N(f) {
          let B = [f];
          for (let d = 0; d < B.length; d++) {
            let F = B[d];
            for (let a of ["test", "consequent", "alternate"]) {
              let g = F[a];
              if (s(g))
                return !0;
              g.type === "ConditionalExpression" && B.push(g);
            }
          }
          return !1;
        }
        function S(f, B, d) {
          let F = f.getValue(), a = F.type === "ConditionalExpression", g = a ? "alternate" : "falseType", E = f.getParentNode(), b = a ? d("test") : [d("checkType"), " ", "extends", " ", d("extendsType")];
          return E.type === F.type && E[g] === F ? C(2, b) : b;
        }
        var j = /* @__PURE__ */ new Map([["AssignmentExpression", "right"], ["VariableDeclarator", "init"], ["ReturnStatement", "argument"], ["ThrowStatement", "argument"], ["UnaryExpression", "argument"], ["YieldExpression", "argument"]]);
        function k(f) {
          let B = f.getValue();
          if (B.type !== "ConditionalExpression")
            return !1;
          let d, F = B;
          for (let a = 0; !d; a++) {
            let g = f.getParentNode(a);
            if (e(g) && g.callee === F || n(g) && g.object === F || g.type === "TSNonNullExpression" && g.expression === F) {
              F = g;
              continue;
            }
            g.type === "NewExpression" && g.callee === F || r(g) && g.expression === F ? (d = f.getParentNode(a + 1), F = g) : d = g;
          }
          return F === B ? !1 : d[j.get(d.type)] === F;
        }
        function J(f, B, d) {
          let F = f.getValue(), a = F.type === "ConditionalExpression", g = a ? "consequent" : "trueType", E = a ? "alternate" : "falseType", b = a ? ["test"] : ["checkType", "extendsType"], x = F[g], T = F[E], I = [], M = !1, V = f.getParentNode(), $ = V.type === F.type && b.some((me) => V[me] === F), U = V.type === F.type && !$, _, ee, R = 0;
          do
            ee = _ || F, _ = f.getParentNode(R), R++;
          while (_ && _.type === F.type && b.every((me) => _[me] !== ee));
          let O = _ || V, Z = ee;
          if (a && (s(F[b[0]]) || s(x) || s(T) || N(Z))) {
            M = !0, U = !0;
            let me = (_e) => [w("("), D([y, _e]), y, w(")")], ge = (_e) => _e.type === "NullLiteral" || _e.type === "Literal" && _e.value === null || _e.type === "Identifier" && _e.name === "undefined";
            I.push(" ? ", ge(x) ? d(g) : me(d(g)), " : ", T.type === F.type || ge(T) ? d(E) : me(d(E)));
          } else {
            let me = [m, "? ", x.type === F.type ? w("", "(") : "", C(2, d(g)), x.type === F.type ? w("", ")") : "", m, ": ", T.type === F.type ? d(E) : C(2, d(E))];
            I.push(V.type !== F.type || V[E] === F || $ ? me : B.useTabs ? P(D(me)) : C(Math.max(0, B.tabWidth - 2), me));
          }
          let ae = [...b.map((me) => i(F[me])), i(x), i(T)].flat().some((me) => h(me) && t(B.originalText, o(me), c(me))), ne = (me) => V === O ? p(me, { shouldBreak: ae }) : ae ? [me, A] : me, he = !M && (n(V) || V.type === "NGPipeExpression" && V.left === F) && !V.computed, q = k(f), Y = ne([S(f, B, d), U ? I : D(I), a && he && !q ? y : ""]);
          return $ || q ? p([D([y, Y]), y]) : Y;
        }
        l.exports = { printTernary: J };
      } }), Li = X({ "src/language-js/print/statement.js"(u, l) {
        H();
        var { builders: { hardline: t } } = pt(), s = lr(), { getLeftSidePathName: i, hasNakedLeftSide: e, isJsxNode: n, isTheOnlyJsxElementInMarkdown: r, hasComment: o, CommentCheckFlags: c, isNextLineEmpty: h } = Jt(), { shouldPrintParamsWithoutParens: m } = ru();
        function y(S, j, k, J) {
          let f = S.getValue(), B = [], d = f.type === "ClassBody", F = p(f[J]);
          return S.each((a, g, E) => {
            let b = a.getValue();
            if (b.type === "EmptyStatement")
              return;
            let x = k();
            !j.semi && !d && !r(j, a) && D(a, j) ? o(b, c.Leading) ? B.push(k([], { needsSemi: !0 })) : B.push(";", x) : B.push(x), !j.semi && d && A(b) && N(b, E[g + 1]) && B.push(";"), b !== F && (B.push(t), h(b, j) && B.push(t));
          }, J), B;
        }
        function p(S) {
          for (let j = S.length - 1; j >= 0; j--) {
            let k = S[j];
            if (k.type !== "EmptyStatement")
              return k;
          }
        }
        function D(S, j) {
          return S.getNode().type !== "ExpressionStatement" ? !1 : S.call((k) => C(k, j), "expression");
        }
        function C(S, j) {
          let k = S.getValue();
          switch (k.type) {
            case "ParenthesizedExpression":
            case "TypeCastExpression":
            case "ArrayExpression":
            case "ArrayPattern":
            case "TemplateLiteral":
            case "TemplateElement":
            case "RegExpLiteral":
              return !0;
            case "ArrowFunctionExpression": {
              if (!m(S, j))
                return !0;
              break;
            }
            case "UnaryExpression": {
              let { prefix: J, operator: f } = k;
              if (J && (f === "+" || f === "-"))
                return !0;
              break;
            }
            case "BindExpression": {
              if (!k.object)
                return !0;
              break;
            }
            case "Literal": {
              if (k.regex)
                return !0;
              break;
            }
            default:
              if (n(k))
                return !0;
          }
          return s(S, j) ? !0 : e(k) ? S.call((J) => C(J, j), ...i(S, k)) : !1;
        }
        function w(S, j, k) {
          return y(S, j, k, "body");
        }
        function P(S, j, k) {
          return y(S, j, k, "consequent");
        }
        var A = (S) => {
          let { type: j } = S;
          return j === "ClassProperty" || j === "PropertyDefinition" || j === "ClassPrivateProperty" || j === "ClassAccessorProperty" || j === "AccessorProperty" || j === "TSAbstractPropertyDefinition" || j === "TSAbstractAccessorProperty";
        };
        function N(S, j) {
          let { type: k, name: J } = S.key;
          if (!S.computed && k === "Identifier" && (J === "static" || J === "get" || J === "set" || J === "accessor") && !S.value && !S.typeAnnotation)
            return !0;
          if (!j || j.static || j.accessibility)
            return !1;
          if (!j.computed) {
            let f = j.key && j.key.name;
            if (f === "in" || f === "instanceof")
              return !0;
          }
          if (A(j) && j.variance && !j.static && !j.declare)
            return !0;
          switch (j.type) {
            case "ClassProperty":
            case "PropertyDefinition":
            case "TSAbstractPropertyDefinition":
              return j.computed;
            case "MethodDefinition":
            case "TSAbstractMethodDefinition":
            case "ClassMethod":
            case "ClassPrivateMethod": {
              if ((j.value ? j.value.async : j.async) || j.kind === "get" || j.kind === "set")
                return !1;
              let f = j.value ? j.value.generator : j.generator;
              return !!(j.computed || f);
            }
            case "TSIndexSignature":
              return !0;
          }
          return !1;
        }
        l.exports = { printBody: w, printSwitchCaseConsequent: P };
      } }), Oi = X({ "src/language-js/print/block.js"(u, l) {
        H();
        var { printDanglingComments: t } = an(), { isNonEmptyArray: s } = bt(), { builders: { hardline: i, indent: e } } = pt(), { hasComment: n, CommentCheckFlags: r, isNextLineEmpty: o } = Jt(), { printHardlineAfterHeritage: c } = kr(), { printBody: h } = Li();
        function m(p, D, C) {
          let w = p.getValue(), P = [];
          if (w.type === "StaticBlock" && P.push("static "), w.type === "ClassBody" && s(w.body)) {
            let N = p.getParentNode();
            P.push(c(N));
          }
          P.push("{");
          let A = y(p, D, C);
          if (A)
            P.push(e([i, A]), i);
          else {
            let N = p.getParentNode(), S = p.getParentNode(1);
            N.type === "ArrowFunctionExpression" || N.type === "FunctionExpression" || N.type === "FunctionDeclaration" || N.type === "ObjectMethod" || N.type === "ClassMethod" || N.type === "ClassPrivateMethod" || N.type === "ForStatement" || N.type === "WhileStatement" || N.type === "DoWhileStatement" || N.type === "DoExpression" || N.type === "CatchClause" && !S.finalizer || N.type === "TSModuleDeclaration" || N.type === "TSDeclareFunction" || w.type === "StaticBlock" || w.type === "ClassBody" || P.push(i);
          }
          return P.push("}"), P;
        }
        function y(p, D, C) {
          let w = p.getValue(), P = s(w.directives), A = w.body.some((j) => j.type !== "EmptyStatement"), N = n(w, r.Dangling);
          if (!P && !A && !N)
            return "";
          let S = [];
          if (P && p.each((j, k, J) => {
            S.push(C()), (k < J.length - 1 || A || N) && (S.push(i), o(j.getValue(), D) && S.push(i));
          }, "directives"), A && S.push(h(p, D, C)), N && S.push(t(p, D, !0)), w.type === "Program") {
            let j = p.getParentNode();
            (!j || j.type !== "ModuleExpression") && S.push(i);
          }
          return S;
        }
        l.exports = { printBlock: m, printBlockBody: y };
      } }), Ys = X({ "src/language-js/print/typescript.js"(u, l) {
        H();
        var { printDanglingComments: t } = an(), { hasNewlineInRange: s } = bt(), { builders: { join: i, line: e, hardline: n, softline: r, group: o, indent: c, conditionalGroup: h, ifBreak: m } } = pt(), { isStringLiteral: y, getTypeScriptMappedTypeModifier: p, shouldPrintComma: D, isCallExpression: C, isMemberExpression: w } = Jt(), P = zs(), { locStart: A, locEnd: N } = yn(), { printOptionalToken: S, printTypeScriptModifiers: j } = Tn(), { printTernary: k } = _i(), { printFunctionParameters: J, shouldGroupFunctionParameters: f } = eu(), { printTemplateLiteral: B } = or(), { printArrayItems: d } = Tr(), { printObject: F } = wu(), { printClassProperty: a, printClassMethod: g } = kr(), { printTypeParameter: E, printTypeParameters: b } = nu(), { printPropertyKey: x } = Nr(), { printFunction: T, printMethodInternal: I } = ru(), { printInterface: M } = ji(), { printBlock: V } = Oi(), { printTypeAlias: $, printIntersectionType: U, printUnionType: _, printFunctionType: ee, printTupleType: R, printIndexedAccessType: O, printJSDocType: Z } = tu();
        function ae(ne, he, q) {
          let Y = ne.getValue();
          if (!Y.type.startsWith("TS"))
            return;
          if (P(Y))
            return Y.type.slice(2, -7).toLowerCase();
          let me = he.semi ? ";" : "", ge = [];
          switch (Y.type) {
            case "TSThisType":
              return "this";
            case "TSTypeAssertion": {
              let _e = !(Y.expression.type === "ArrayExpression" || Y.expression.type === "ObjectExpression"), Q = o(["<", c([r, q("typeAnnotation")]), r, ">"]), W = [m("("), c([r, q("expression")]), r, m(")")];
              return _e ? h([[Q, q("expression")], [Q, o(W, { shouldBreak: !0 })], [Q, q("expression")]]) : o([Q, q("expression")]);
            }
            case "TSDeclareFunction":
              return T(ne, q, he);
            case "TSExportAssignment":
              return ["export = ", q("expression"), me];
            case "TSModuleBlock":
              return V(ne, he, q);
            case "TSInterfaceBody":
            case "TSTypeLiteral":
              return F(ne, he, q);
            case "TSTypeAliasDeclaration":
              return $(ne, he, q);
            case "TSQualifiedName":
              return i(".", [q("left"), q("right")]);
            case "TSAbstractMethodDefinition":
            case "TSDeclareMethod":
              return g(ne, he, q);
            case "TSAbstractAccessorProperty":
            case "TSAbstractPropertyDefinition":
              return a(ne, he, q);
            case "TSInterfaceHeritage":
            case "TSExpressionWithTypeArguments":
              return ge.push(q("expression")), Y.typeParameters && ge.push(q("typeParameters")), ge;
            case "TSTemplateLiteralType":
              return B(ne, q, he);
            case "TSNamedTupleMember":
              return [q("label"), Y.optional ? "?" : "", ": ", q("elementType")];
            case "TSRestType":
              return ["...", q("typeAnnotation")];
            case "TSOptionalType":
              return [q("typeAnnotation"), "?"];
            case "TSInterfaceDeclaration":
              return M(ne, he, q);
            case "TSClassImplements":
              return [q("expression"), q("typeParameters")];
            case "TSTypeParameterDeclaration":
            case "TSTypeParameterInstantiation":
              return b(ne, he, q, "params");
            case "TSTypeParameter":
              return E(ne, he, q);
            case "TSSatisfiesExpression":
            case "TSAsExpression": {
              let _e = Y.type === "TSAsExpression" ? "as" : "satisfies";
              ge.push(q("expression"), ` ${_e} `, q("typeAnnotation"));
              let Q = ne.getParentNode();
              return C(Q) && Q.callee === Y || w(Q) && Q.object === Y ? o([c([r, ...ge]), r]) : ge;
            }
            case "TSArrayType":
              return [q("elementType"), "[]"];
            case "TSPropertySignature":
              return Y.readonly && ge.push("readonly "), ge.push(x(ne, he, q), S(ne)), Y.typeAnnotation && ge.push(": ", q("typeAnnotation")), Y.initializer && ge.push(" = ", q("initializer")), ge;
            case "TSParameterProperty":
              return Y.accessibility && ge.push(Y.accessibility + " "), Y.export && ge.push("export "), Y.static && ge.push("static "), Y.override && ge.push("override "), Y.readonly && ge.push("readonly "), ge.push(q("parameter")), ge;
            case "TSTypeQuery":
              return ["typeof ", q("exprName"), q("typeParameters")];
            case "TSIndexSignature": {
              let _e = ne.getParentNode(), Q = Y.parameters.length > 1 ? m(D(he) ? "," : "") : "", W = o([c([r, i([", ", r], ne.map(q, "parameters"))]), Q, r]);
              return [Y.export ? "export " : "", Y.accessibility ? [Y.accessibility, " "] : "", Y.static ? "static " : "", Y.readonly ? "readonly " : "", Y.declare ? "declare " : "", "[", Y.parameters ? W : "", Y.typeAnnotation ? "]: " : "]", Y.typeAnnotation ? q("typeAnnotation") : "", _e.type === "ClassBody" ? me : ""];
            }
            case "TSTypePredicate":
              return [Y.asserts ? "asserts " : "", q("parameterName"), Y.typeAnnotation ? [" is ", q("typeAnnotation")] : ""];
            case "TSNonNullExpression":
              return [q("expression"), "!"];
            case "TSImportType":
              return [Y.isTypeOf ? "typeof " : "", "import(", q(Y.parameter ? "parameter" : "argument"), ")", Y.qualifier ? [".", q("qualifier")] : "", b(ne, he, q, "typeParameters")];
            case "TSLiteralType":
              return q("literal");
            case "TSIndexedAccessType":
              return O(ne, he, q);
            case "TSConstructSignatureDeclaration":
            case "TSCallSignatureDeclaration":
            case "TSConstructorType": {
              if (Y.type === "TSConstructorType" && Y.abstract && ge.push("abstract "), Y.type !== "TSCallSignatureDeclaration" && ge.push("new "), ge.push(o(J(ne, q, he, !1, !0))), Y.returnType || Y.typeAnnotation) {
                let _e = Y.type === "TSConstructorType";
                ge.push(_e ? " => " : ": ", q("returnType"), q("typeAnnotation"));
              }
              return ge;
            }
            case "TSTypeOperator":
              return [Y.operator, " ", q("typeAnnotation")];
            case "TSMappedType": {
              let _e = s(he.originalText, A(Y), N(Y));
              return o(["{", c([he.bracketSpacing ? e : r, q("typeParameter"), Y.optional ? p(Y.optional, "?") : "", Y.typeAnnotation ? ": " : "", q("typeAnnotation"), m(me)]), t(ne, he, !0), he.bracketSpacing ? e : r, "}"], { shouldBreak: _e });
            }
            case "TSMethodSignature": {
              let _e = Y.kind && Y.kind !== "method" ? `${Y.kind} ` : "";
              ge.push(Y.accessibility ? [Y.accessibility, " "] : "", _e, Y.export ? "export " : "", Y.static ? "static " : "", Y.readonly ? "readonly " : "", Y.abstract ? "abstract " : "", Y.declare ? "declare " : "", Y.computed ? "[" : "", q("key"), Y.computed ? "]" : "", S(ne));
              let Q = J(ne, q, he, !1, !0), W = Y.returnType ? "returnType" : "typeAnnotation", re = Y[W], ue = re ? q(W) : "", Ce = f(Y, ue);
              return ge.push(Ce ? o(Q) : Q), re && ge.push(": ", o(ue)), o(ge);
            }
            case "TSNamespaceExportDeclaration":
              return ge.push("export as namespace ", q("id")), he.semi && ge.push(";"), o(ge);
            case "TSEnumDeclaration":
              return Y.declare && ge.push("declare "), Y.modifiers && ge.push(j(ne, he, q)), Y.const && ge.push("const "), ge.push("enum ", q("id"), " "), Y.members.length === 0 ? ge.push(o(["{", t(ne, he), r, "}"])) : ge.push(o(["{", c([n, d(ne, he, "members", q), D(he, "es5") ? "," : ""]), t(ne, he, !0), n, "}"])), ge;
            case "TSEnumMember":
              return Y.computed ? ge.push("[", q("id"), "]") : ge.push(q("id")), Y.initializer && ge.push(" = ", q("initializer")), ge;
            case "TSImportEqualsDeclaration":
              return Y.isExport && ge.push("export "), ge.push("import "), Y.importKind && Y.importKind !== "value" && ge.push(Y.importKind, " "), ge.push(q("id"), " = ", q("moduleReference")), he.semi && ge.push(";"), o(ge);
            case "TSExternalModuleReference":
              return ["require(", q("expression"), ")"];
            case "TSModuleDeclaration": {
              let _e = ne.getParentNode(), Q = y(Y.id), W = _e.type === "TSModuleDeclaration", re = Y.body && Y.body.type === "TSModuleDeclaration";
              if (W)
                ge.push(".");
              else {
                Y.declare && ge.push("declare "), ge.push(j(ne, he, q));
                let ue = he.originalText.slice(A(Y), A(Y.id));
                Y.id.type === "Identifier" && Y.id.name === "global" && !/namespace|module/.test(ue) || ge.push(Q || /(?:^|\s)module(?:\s|$)/.test(ue) ? "module " : "namespace ");
              }
              return ge.push(q("id")), re ? ge.push(q("body")) : Y.body ? ge.push(" ", o(q("body"))) : ge.push(me), ge;
            }
            case "TSConditionalType":
              return k(ne, he, q);
            case "TSInferType":
              return ["infer", " ", q("typeParameter")];
            case "TSIntersectionType":
              return U(ne, he, q);
            case "TSUnionType":
              return _(ne, he, q);
            case "TSFunctionType":
              return ee(ne, he, q);
            case "TSTupleType":
              return R(ne, he, q);
            case "TSTypeReference":
              return [q("typeName"), b(ne, he, q, "typeParameters")];
            case "TSTypeAnnotation":
              return q("typeAnnotation");
            case "TSEmptyBodyFunctionExpression":
              return I(ne, he, q);
            case "TSJSDocAllType":
              return "*";
            case "TSJSDocUnknownType":
              return "?";
            case "TSJSDocNullableType":
              return Z(ne, q, "?");
            case "TSJSDocNonNullableType":
              return Z(ne, q, "!");
            case "TSInstantiationExpression":
              return [q("expression"), q("typeParameters")];
            default:
              throw new Error(`Unknown TypeScript node type: ${JSON.stringify(Y.type)}.`);
          }
        }
        l.exports = { printTypescript: ae };
      } }), Ks = X({ "src/language-js/print/comment.js"(u, l) {
        H();
        var { hasNewline: t } = bt(), { builders: { join: s, hardline: i }, utils: { replaceTextEndOfLine: e } } = pt(), { isLineComment: n } = Jt(), { locStart: r, locEnd: o } = yn(), c = er();
        function h(p, D) {
          let C = p.getValue();
          if (n(C))
            return D.originalText.slice(r(C), o(C)).trimEnd();
          if (c(C)) {
            if (m(C)) {
              let A = y(C);
              return C.trailing && !t(D.originalText, r(C), { backwards: !0 }) ? [i, A] : A;
            }
            let w = o(C), P = D.originalText.slice(w - 3, w) === "*-/";
            return ["/*", e(C.value), P ? "*-/" : "*/"];
          }
          throw new Error("Not a comment: " + JSON.stringify(C));
        }
        function m(p) {
          let D = `*${p.value}*`.split(`
`);
          return D.length > 1 && D.every((C) => C.trim()[0] === "*");
        }
        function y(p) {
          let D = p.value.split(`
`);
          return ["/*", s(i, D.map((C, w) => w === 0 ? C.trimEnd() : " " + (w < D.length - 1 ? C.trim() : C.trimStart()))), "*/"];
        }
        l.exports = { printComment: h };
      } }), Qs = X({ "src/language-js/print/literal.js"(u, l) {
        H();
        var { printString: t, printNumber: s } = bt(), { replaceTextEndOfLine: i } = br(), { printDirective: e } = Tn();
        function n(h, m) {
          let y = h.getNode();
          switch (y.type) {
            case "RegExpLiteral":
              return c(y);
            case "BigIntLiteral":
              return o(y.bigint || y.extra.raw);
            case "NumericLiteral":
              return s(y.extra.raw);
            case "StringLiteral":
              return i(t(y.extra.raw, m));
            case "NullLiteral":
              return "null";
            case "BooleanLiteral":
              return String(y.value);
            case "DecimalLiteral":
              return s(y.value) + "m";
            case "Literal": {
              if (y.regex)
                return c(y.regex);
              if (y.bigint)
                return o(y.raw);
              if (y.decimal)
                return s(y.decimal) + "m";
              let { value: p } = y;
              return typeof p == "number" ? s(y.raw) : typeof p == "string" ? r(h) ? e(y.raw, m) : i(t(y.raw, m)) : String(p);
            }
          }
        }
        function r(h) {
          if (h.getName() !== "expression")
            return;
          let m = h.getParentNode();
          return m.type === "ExpressionStatement" && m.directive;
        }
        function o(h) {
          return h.toLowerCase();
        }
        function c(h) {
          let { pattern: m, flags: y } = h;
          return y = [...y].sort().join(""), `/${m}/${y}`;
        }
        l.exports = { printLiteral: n };
      } }), Hs = X({ "src/language-js/printer-estree.js"(u, l) {
        H();
        var { printDanglingComments: t } = an(), { hasNewline: s } = bt(), { builders: { join: i, line: e, hardline: n, softline: r, group: o, indent: c }, utils: { replaceTextEndOfLine: h } } = pt(), m = js(), y = Is(), { insertPragma: p } = Bi(), D = Ti(), C = lr(), w = wi(), { hasFlowShorthandAnnotationComment: P, hasComment: A, CommentCheckFlags: N, isTheOnlyJsxElementInMarkdown: S, isLineComment: j, isNextLineEmpty: k, needsHardlineAfterDanglingComment: J, hasIgnoreComment: f, isCallExpression: B, isMemberExpression: d, markerForIfWithoutBlockAndSameLineComment: F } = Jt(), { locStart: a, locEnd: g } = yn(), E = er(), { printHtmlBinding: b, isVueEventBindingExpression: x } = qs(), { printAngular: T } = Gs(), { printJsx: I, hasJsxIgnoreComment: M } = Ws(), { printFlow: V } = Us(), { printTypescript: $ } = Ys(), { printOptionalToken: U, printBindExpressionCallee: _, printTypeAnnotation: ee, adjustClause: R, printRestSpread: O, printDefiniteToken: Z, printDirective: ae } = Tn(), { printImportDeclaration: ne, printExportDeclaration: he, printExportAllDeclaration: q, printModuleSpecifier: Y } = Ii(), { printTernary: me } = _i(), { printTemplateLiteral: ge } = or(), { printArray: _e } = Tr(), { printObject: Q } = wu(), { printClass: W, printClassMethod: re, printClassProperty: ue } = kr(), { printProperty: Ce } = Nr(), { printFunction: be, printArrowFunction: Be, printMethod: ze, printReturnStatement: mt, printThrowStatement: Dt } = ru(), { printCallExpression: Ue } = Pi(), { printVariableDeclarator: tt, printAssignmentExpression: ce } = wr(), { printBinaryishExpression: G } = Bu(), { printSwitchCaseConsequent: ye } = Li(), { printMemberExpression: K } = ki(), { printBlock: fe, printBlockBody: Ve } = Oi(), { printComment: Ie } = Ks(), { printLiteral: Ee } = Qs(), { printDecorators: v } = Tu();
        function z(Pe, Xe, Te, Wt) {
          let qe = se(Pe, Xe, Te, Wt);
          if (!qe)
            return "";
          let qt = Pe.getValue(), { type: Je } = qt;
          if (Je === "ClassMethod" || Je === "ClassPrivateMethod" || Je === "ClassProperty" || Je === "ClassAccessorProperty" || Je === "AccessorProperty" || Je === "TSAbstractAccessorProperty" || Je === "PropertyDefinition" || Je === "TSAbstractPropertyDefinition" || Je === "ClassPrivateProperty" || Je === "MethodDefinition" || Je === "TSAbstractMethodDefinition" || Je === "TSDeclareMethod")
            return qe;
          let it = [qe], ft = v(Pe, Xe, Te), Lt = qt.type === "ClassExpression" && ft;
          if (ft && (it = [...ft, qe], !Lt))
            return o(it);
          if (!C(Pe, Xe))
            return Wt && Wt.needsSemi && it.unshift(";"), it.length === 1 && it[0] === qe ? qe : it;
          if (Lt && (it = [c([e, ...it])]), it.unshift("("), Wt && Wt.needsSemi && it.unshift(";"), P(qt)) {
            let [Ge] = qt.trailingComments;
            it.push(" /*", Ge.value.trimStart(), "*/"), Ge.printed = !0;
          }
          return Lt && it.push(e), it.push(")"), it;
        }
        function se(Pe, Xe, Te, Wt) {
          let qe = Pe.getValue(), qt = Xe.semi ? ";" : "";
          if (!qe)
            return "";
          if (typeof qe == "string")
            return qe;
          for (let it of [Ee, b, T, I, V, $]) {
            let ft = it(Pe, Xe, Te);
            if (typeof ft < "u")
              return ft;
          }
          let Je = [];
          switch (qe.type) {
            case "JsExpressionRoot":
              return Te("node");
            case "JsonRoot":
              return [Te("node"), n];
            case "File":
              return qe.program && qe.program.interpreter && Je.push(Te(["program", "interpreter"])), Je.push(Te("program")), Je;
            case "Program":
              return Ve(Pe, Xe, Te);
            case "EmptyStatement":
              return "";
            case "ExpressionStatement": {
              if (Xe.parser === "__vue_event_binding" || Xe.parser === "__vue_ts_event_binding") {
                let ft = Pe.getParentNode();
                if (ft.type === "Program" && ft.body.length === 1 && ft.body[0] === qe)
                  return [Te("expression"), x(qe.expression) ? ";" : ""];
              }
              let it = t(Pe, Xe, !0, (ft) => {
                let { marker: Lt } = ft;
                return Lt === F;
              });
              return [Te("expression"), S(Xe, Pe) ? "" : qt, it ? [" ", it] : ""];
            }
            case "ParenthesizedExpression":
              return !A(qe.expression) && (qe.expression.type === "ObjectExpression" || qe.expression.type === "ArrayExpression") ? ["(", Te("expression"), ")"] : o(["(", c([r, Te("expression")]), r, ")"]);
            case "AssignmentExpression":
              return ce(Pe, Xe, Te);
            case "VariableDeclarator":
              return tt(Pe, Xe, Te);
            case "BinaryExpression":
            case "LogicalExpression":
              return G(Pe, Xe, Te);
            case "AssignmentPattern":
              return [Te("left"), " = ", Te("right")];
            case "OptionalMemberExpression":
            case "MemberExpression":
              return K(Pe, Xe, Te);
            case "MetaProperty":
              return [Te("meta"), ".", Te("property")];
            case "BindExpression":
              return qe.object && Je.push(Te("object")), Je.push(o(c([r, _(Pe, Xe, Te)]))), Je;
            case "Identifier":
              return [qe.name, U(Pe), Z(Pe), ee(Pe, Xe, Te)];
            case "V8IntrinsicIdentifier":
              return ["%", qe.name];
            case "SpreadElement":
            case "SpreadElementPattern":
            case "SpreadProperty":
            case "SpreadPropertyPattern":
            case "RestElement":
              return O(Pe, Xe, Te);
            case "FunctionDeclaration":
            case "FunctionExpression":
              return be(Pe, Te, Xe, Wt);
            case "ArrowFunctionExpression":
              return Be(Pe, Xe, Te, Wt);
            case "YieldExpression":
              return Je.push("yield"), qe.delegate && Je.push("*"), qe.argument && Je.push(" ", Te("argument")), Je;
            case "AwaitExpression": {
              if (Je.push("await"), qe.argument) {
                Je.push(" ", Te("argument"));
                let it = Pe.getParentNode();
                if (B(it) && it.callee === qe || d(it) && it.object === qe) {
                  Je = [c([r, ...Je]), r];
                  let ft = Pe.findAncestor((Lt) => Lt.type === "AwaitExpression" || Lt.type === "BlockStatement");
                  if (!ft || ft.type !== "AwaitExpression")
                    return o(Je);
                }
              }
              return Je;
            }
            case "ExportDefaultDeclaration":
            case "ExportNamedDeclaration":
              return he(Pe, Xe, Te);
            case "ExportAllDeclaration":
              return q(Pe, Xe, Te);
            case "ImportDeclaration":
              return ne(Pe, Xe, Te);
            case "ImportSpecifier":
            case "ExportSpecifier":
            case "ImportNamespaceSpecifier":
            case "ExportNamespaceSpecifier":
            case "ImportDefaultSpecifier":
            case "ExportDefaultSpecifier":
              return Y(Pe, Xe, Te);
            case "ImportAttribute":
              return [Te("key"), ": ", Te("value")];
            case "Import":
              return "import";
            case "BlockStatement":
            case "StaticBlock":
            case "ClassBody":
              return fe(Pe, Xe, Te);
            case "ThrowStatement":
              return Dt(Pe, Xe, Te);
            case "ReturnStatement":
              return mt(Pe, Xe, Te);
            case "NewExpression":
            case "ImportExpression":
            case "OptionalCallExpression":
            case "CallExpression":
              return Ue(Pe, Xe, Te);
            case "ObjectExpression":
            case "ObjectPattern":
            case "RecordExpression":
              return Q(Pe, Xe, Te);
            case "ObjectProperty":
            case "Property":
              return qe.method || qe.kind === "get" || qe.kind === "set" ? ze(Pe, Xe, Te) : Ce(Pe, Xe, Te);
            case "ObjectMethod":
              return ze(Pe, Xe, Te);
            case "Decorator":
              return ["@", Te("expression")];
            case "ArrayExpression":
            case "ArrayPattern":
            case "TupleExpression":
              return _e(Pe, Xe, Te);
            case "SequenceExpression": {
              let it = Pe.getParentNode(0);
              if (it.type === "ExpressionStatement" || it.type === "ForStatement") {
                let ft = [];
                return Pe.each((Lt, Ge) => {
                  Ge === 0 ? ft.push(Te()) : ft.push(",", c([e, Te()]));
                }, "expressions"), o(ft);
              }
              return o(i([",", e], Pe.map(Te, "expressions")));
            }
            case "ThisExpression":
              return "this";
            case "Super":
              return "super";
            case "Directive":
              return [Te("value"), qt];
            case "DirectiveLiteral":
              return ae(qe.extra.raw, Xe);
            case "UnaryExpression":
              return Je.push(qe.operator), /[a-z]$/.test(qe.operator) && Je.push(" "), A(qe.argument) ? Je.push(o(["(", c([r, Te("argument")]), r, ")"])) : Je.push(Te("argument")), Je;
            case "UpdateExpression":
              return Je.push(Te("argument"), qe.operator), qe.prefix && Je.reverse(), Je;
            case "ConditionalExpression":
              return me(Pe, Xe, Te);
            case "VariableDeclaration": {
              let it = Pe.map(Te, "declarations"), ft = Pe.getParentNode(), Lt = ft.type === "ForStatement" || ft.type === "ForInStatement" || ft.type === "ForOfStatement", Ge = qe.declarations.some((at) => at.init), ct;
              return it.length === 1 && !A(qe.declarations[0]) ? ct = it[0] : it.length > 0 && (ct = c(it[0])), Je = [qe.declare ? "declare " : "", qe.kind, ct ? [" ", ct] : "", c(it.slice(1).map((at) => [",", Ge && !Lt ? n : e, at]))], Lt && ft.body !== qe || Je.push(qt), o(Je);
            }
            case "WithStatement":
              return o(["with (", Te("object"), ")", R(qe.body, Te("body"))]);
            case "IfStatement": {
              let it = R(qe.consequent, Te("consequent")), ft = o(["if (", o([c([r, Te("test")]), r]), ")", it]);
              if (Je.push(ft), qe.alternate) {
                let Lt = A(qe.consequent, N.Trailing | N.Line) || J(qe), Ge = qe.consequent.type === "BlockStatement" && !Lt;
                Je.push(Ge ? " " : n), A(qe, N.Dangling) && Je.push(t(Pe, Xe, !0), Lt ? n : " "), Je.push("else", o(R(qe.alternate, Te("alternate"), qe.alternate.type === "IfStatement")));
              }
              return Je;
            }
            case "ForStatement": {
              let it = R(qe.body, Te("body")), ft = t(Pe, Xe, !0), Lt = ft ? [ft, r] : "";
              return !qe.init && !qe.test && !qe.update ? [Lt, o(["for (;;)", it])] : [Lt, o(["for (", o([c([r, Te("init"), ";", e, Te("test"), ";", e, Te("update")]), r]), ")", it])];
            }
            case "WhileStatement":
              return o(["while (", o([c([r, Te("test")]), r]), ")", R(qe.body, Te("body"))]);
            case "ForInStatement":
              return o(["for (", Te("left"), " in ", Te("right"), ")", R(qe.body, Te("body"))]);
            case "ForOfStatement":
              return o(["for", qe.await ? " await" : "", " (", Te("left"), " of ", Te("right"), ")", R(qe.body, Te("body"))]);
            case "DoWhileStatement": {
              let it = R(qe.body, Te("body"));
              return Je = [o(["do", it])], qe.body.type === "BlockStatement" ? Je.push(" ") : Je.push(n), Je.push("while (", o([c([r, Te("test")]), r]), ")", qt), Je;
            }
            case "DoExpression":
              return [qe.async ? "async " : "", "do ", Te("body")];
            case "BreakStatement":
              return Je.push("break"), qe.label && Je.push(" ", Te("label")), Je.push(qt), Je;
            case "ContinueStatement":
              return Je.push("continue"), qe.label && Je.push(" ", Te("label")), Je.push(qt), Je;
            case "LabeledStatement":
              return qe.body.type === "EmptyStatement" ? [Te("label"), ":;"] : [Te("label"), ": ", Te("body")];
            case "TryStatement":
              return ["try ", Te("block"), qe.handler ? [" ", Te("handler")] : "", qe.finalizer ? [" finally ", Te("finalizer")] : ""];
            case "CatchClause":
              if (qe.param) {
                let it = A(qe.param, (Lt) => !E(Lt) || Lt.leading && s(Xe.originalText, g(Lt)) || Lt.trailing && s(Xe.originalText, a(Lt), { backwards: !0 })), ft = Te("param");
                return ["catch ", it ? ["(", c([r, ft]), r, ") "] : ["(", ft, ") "], Te("body")];
              }
              return ["catch ", Te("body")];
            case "SwitchStatement":
              return [o(["switch (", c([r, Te("discriminant")]), r, ")"]), " {", qe.cases.length > 0 ? c([n, i(n, Pe.map((it, ft, Lt) => {
                let Ge = it.getValue();
                return [Te(), ft !== Lt.length - 1 && k(Ge, Xe) ? n : ""];
              }, "cases"))]) : "", n, "}"];
            case "SwitchCase": {
              qe.test ? Je.push("case ", Te("test"), ":") : Je.push("default:"), A(qe, N.Dangling) && Je.push(" ", t(Pe, Xe, !0));
              let it = qe.consequent.filter((ft) => ft.type !== "EmptyStatement");
              if (it.length > 0) {
                let ft = ye(Pe, Xe, Te);
                Je.push(it.length === 1 && it[0].type === "BlockStatement" ? [" ", ft] : c([n, ft]));
              }
              return Je;
            }
            case "DebuggerStatement":
              return ["debugger", qt];
            case "ClassDeclaration":
            case "ClassExpression":
              return W(Pe, Xe, Te);
            case "ClassMethod":
            case "ClassPrivateMethod":
            case "MethodDefinition":
              return re(Pe, Xe, Te);
            case "ClassProperty":
            case "PropertyDefinition":
            case "ClassPrivateProperty":
            case "ClassAccessorProperty":
            case "AccessorProperty":
              return ue(Pe, Xe, Te);
            case "TemplateElement":
              return h(qe.value.raw);
            case "TemplateLiteral":
              return ge(Pe, Te, Xe);
            case "TaggedTemplateExpression":
              return [Te("tag"), Te("typeParameters"), Te("quasi")];
            case "PrivateIdentifier":
              return ["#", Te("name")];
            case "PrivateName":
              return ["#", Te("id")];
            case "InterpreterDirective":
              return Je.push("#!", qe.value, n), k(qe, Xe) && Je.push(n), Je;
            case "TopicReference":
              return "%";
            case "ArgumentPlaceholder":
              return "?";
            case "ModuleExpression": {
              Je.push("module {");
              let it = Te("body");
              return it && Je.push(c([n, it]), n), Je.push("}"), Je;
            }
            default:
              throw new Error("unknown type: " + JSON.stringify(qe.type));
          }
        }
        function Se(Pe) {
          return Pe.type && !E(Pe) && !j(Pe) && Pe.type !== "EmptyStatement" && Pe.type !== "TemplateElement" && Pe.type !== "Import" && Pe.type !== "TSEmptyBodyFunctionExpression";
        }
        l.exports = { preprocess: w, print: z, embed: m, insertPragma: p, massageAstNode: y, hasPrettierIgnore(Pe) {
          return f(Pe) || M(Pe);
        }, willPrintOwnComments: D.willPrintOwnComments, canAttachComment: Se, printComment: Ie, isBlockComment: E, handleComments: { avoidAstMutation: !0, ownLine: D.handleOwnLineComment, endOfLine: D.handleEndOfLineComment, remaining: D.handleRemainingComment }, getCommentChildNodes: D.getCommentChildNodes };
      } }), Zs = X({ "src/language-js/printer-estree-json.js"(u, l) {
        H();
        var { builders: { hardline: t, indent: s, join: i } } = pt(), e = wi();
        function n(h, m, y) {
          let p = h.getValue();
          switch (p.type) {
            case "JsonRoot":
              return [y("node"), t];
            case "ArrayExpression": {
              if (p.elements.length === 0)
                return "[]";
              let D = h.map(() => h.getValue() === null ? "null" : y(), "elements");
              return ["[", s([t, i([",", t], D)]), t, "]"];
            }
            case "ObjectExpression":
              return p.properties.length === 0 ? "{}" : ["{", s([t, i([",", t], h.map(y, "properties"))]), t, "}"];
            case "ObjectProperty":
              return [y("key"), ": ", y("value")];
            case "UnaryExpression":
              return [p.operator === "+" ? "" : p.operator, y("argument")];
            case "NullLiteral":
              return "null";
            case "BooleanLiteral":
              return p.value ? "true" : "false";
            case "StringLiteral":
              return JSON.stringify(p.value);
            case "NumericLiteral":
              return r(h) ? JSON.stringify(String(p.value)) : JSON.stringify(p.value);
            case "Identifier":
              return r(h) ? JSON.stringify(p.name) : p.name;
            case "TemplateLiteral":
              return y(["quasis", 0]);
            case "TemplateElement":
              return JSON.stringify(p.value.cooked);
            default:
              throw new Error("unknown type: " + JSON.stringify(p.type));
          }
        }
        function r(h) {
          return h.getName() === "key" && h.getParentNode().type === "ObjectProperty";
        }
        var o = /* @__PURE__ */ new Set(["start", "end", "extra", "loc", "comments", "leadingComments", "trailingComments", "innerComments", "errors", "range", "tokens"]);
        function c(h, m) {
          let { type: y } = h;
          if (y === "ObjectProperty") {
            let { key: p } = h;
            p.type === "Identifier" ? m.key = { type: "StringLiteral", value: p.name } : p.type === "NumericLiteral" && (m.key = { type: "StringLiteral", value: String(p.value) });
            return;
          }
          if (y === "UnaryExpression" && h.operator === "+")
            return m.argument;
          if (y === "ArrayExpression") {
            for (let [p, D] of h.elements.entries())
              D === null && m.elements.splice(p, 0, { type: "NullLiteral" });
            return;
          }
          if (y === "TemplateLiteral")
            return { type: "StringLiteral", value: h.quasis[0].value.cooked };
        }
        c.ignoredProperties = o, l.exports = { preprocess: e, print: n, massageAstNode: c };
      } }), pr = X({ "src/common/common-options.js"(u, l) {
        H();
        var t = "Common";
        l.exports = { bracketSpacing: { since: "0.0.0", category: t, type: "boolean", default: !0, description: "Print spaces between brackets.", oppositeDescription: "Do not print spaces between brackets." }, singleQuote: { since: "0.0.0", category: t, type: "boolean", default: !1, description: "Use single quotes instead of double quotes." }, proseWrap: { since: "1.8.2", category: t, type: "choice", default: [{ since: "1.8.2", value: !0 }, { since: "1.9.0", value: "preserve" }], description: "How to wrap prose.", choices: [{ since: "1.9.0", value: "always", description: "Wrap prose if it exceeds the print width." }, { since: "1.9.0", value: "never", description: "Do not wrap prose." }, { since: "1.9.0", value: "preserve", description: "Wrap prose as-is." }] }, bracketSameLine: { since: "2.4.0", category: t, type: "boolean", default: !1, description: "Put > of opening tags on the last line instead of on a new line." }, singleAttributePerLine: { since: "2.6.0", category: t, type: "boolean", default: !1, description: "Enforce single attribute per line in HTML, Vue and JSX." } };
      } }), eo = X({ "src/language-js/options.js"(u, l) {
        H();
        var t = pr(), s = "JavaScript";
        l.exports = { arrowParens: { since: "1.9.0", category: s, type: "choice", default: [{ since: "1.9.0", value: "avoid" }, { since: "2.0.0", value: "always" }], description: "Include parentheses around a sole arrow function parameter.", choices: [{ value: "always", description: "Always include parens. Example: `(x) => x`" }, { value: "avoid", description: "Omit parens when possible. Example: `x => x`" }] }, bracketSameLine: t.bracketSameLine, bracketSpacing: t.bracketSpacing, jsxBracketSameLine: { since: "0.17.0", category: s, type: "boolean", description: "Put > on the last line instead of at a new line.", deprecated: "2.4.0" }, semi: { since: "1.0.0", category: s, type: "boolean", default: !0, description: "Print semicolons.", oppositeDescription: "Do not print semicolons, except at the beginning of lines which may need them." }, singleQuote: t.singleQuote, jsxSingleQuote: { since: "1.15.0", category: s, type: "boolean", default: !1, description: "Use single quotes in JSX." }, quoteProps: { since: "1.17.0", category: s, type: "choice", default: "as-needed", description: "Change when properties in objects are quoted.", choices: [{ value: "as-needed", description: "Only add quotes around object properties where required." }, { value: "consistent", description: "If at least one property in an object requires quotes, quote all properties." }, { value: "preserve", description: "Respect the input use of quotes in object properties." }] }, trailingComma: { since: "0.0.0", category: s, type: "choice", default: [{ since: "0.0.0", value: !1 }, { since: "0.19.0", value: "none" }, { since: "2.0.0", value: "es5" }], description: "Print trailing commas wherever possible when multi-line.", choices: [{ value: "es5", description: "Trailing commas where valid in ES5 (objects, arrays, etc.)" }, { value: "none", description: "No trailing commas." }, { value: "all", description: "Trailing commas wherever possible (including function arguments)." }] }, singleAttributePerLine: t.singleAttributePerLine };
      } }), to = X({ "src/language-js/parse/parsers.js"() {
        H();
      } }), Nu = X({ "node_modules/linguist-languages/data/JavaScript.json"(u, l) {
        l.exports = { name: "JavaScript", type: "programming", tmScope: "source.js", aceMode: "javascript", codemirrorMode: "javascript", codemirrorMimeType: "text/javascript", color: "#f1e05a", aliases: ["js", "node"], extensions: [".js", "._js", ".bones", ".cjs", ".es", ".es6", ".frag", ".gs", ".jake", ".javascript", ".jsb", ".jscad", ".jsfl", ".jslib", ".jsm", ".jspre", ".jss", ".jsx", ".mjs", ".njs", ".pac", ".sjs", ".ssjs", ".xsjs", ".xsjslib"], filenames: ["Jakefile"], interpreters: ["chakra", "d8", "gjs", "js", "node", "nodejs", "qjs", "rhino", "v8", "v8-shell"], languageId: 183 };
      } }), no = X({ "node_modules/linguist-languages/data/TypeScript.json"(u, l) {
        l.exports = { name: "TypeScript", type: "programming", color: "#3178c6", aliases: ["ts"], interpreters: ["deno", "ts-node"], extensions: [".ts", ".cts", ".mts"], tmScope: "source.ts", aceMode: "typescript", codemirrorMode: "javascript", codemirrorMimeType: "application/typescript", languageId: 378 };
      } }), ro = X({ "node_modules/linguist-languages/data/TSX.json"(u, l) {
        l.exports = { name: "TSX", type: "programming", color: "#3178c6", group: "TypeScript", extensions: [".tsx"], tmScope: "source.tsx", aceMode: "javascript", codemirrorMode: "jsx", codemirrorMimeType: "text/jsx", languageId: 94901924 };
      } }), Mi = X({ "node_modules/linguist-languages/data/JSON.json"(u, l) {
        l.exports = { name: "JSON", type: "data", color: "#292929", tmScope: "source.json", aceMode: "json", codemirrorMode: "javascript", codemirrorMimeType: "application/json", aliases: ["geojson", "jsonl", "topojson"], extensions: [".json", ".4DForm", ".4DProject", ".avsc", ".geojson", ".gltf", ".har", ".ice", ".JSON-tmLanguage", ".jsonl", ".mcmeta", ".tfstate", ".tfstate.backup", ".topojson", ".webapp", ".webmanifest", ".yy", ".yyp"], filenames: [".arcconfig", ".auto-changelog", ".c8rc", ".htmlhintrc", ".imgbotconfig", ".nycrc", ".tern-config", ".tern-project", ".watchmanconfig", "Pipfile.lock", "composer.lock", "mcmod.info"], languageId: 174 };
      } }), uo = X({ "node_modules/linguist-languages/data/JSON with Comments.json"(u, l) {
        l.exports = { name: "JSON with Comments", type: "data", color: "#292929", group: "JSON", tmScope: "source.js", aceMode: "javascript", codemirrorMode: "javascript", codemirrorMimeType: "text/javascript", aliases: ["jsonc"], extensions: [".jsonc", ".code-snippets", ".sublime-build", ".sublime-commands", ".sublime-completions", ".sublime-keymap", ".sublime-macro", ".sublime-menu", ".sublime-mousemap", ".sublime-project", ".sublime-settings", ".sublime-theme", ".sublime-workspace", ".sublime_metrics", ".sublime_session"], filenames: [".babelrc", ".devcontainer.json", ".eslintrc.json", ".jscsrc", ".jshintrc", ".jslintrc", "api-extractor.json", "devcontainer.json", "jsconfig.json", "language-configuration.json", "tsconfig.json", "tslint.json"], languageId: 423 };
      } }), io = X({ "node_modules/linguist-languages/data/JSON5.json"(u, l) {
        l.exports = { name: "JSON5", type: "data", color: "#267CB9", extensions: [".json5"], tmScope: "source.js", aceMode: "javascript", codemirrorMode: "javascript", codemirrorMimeType: "application/json", languageId: 175 };
      } }), ao = X({ "src/language-js/index.js"(u, l) {
        H();
        var t = Zn(), s = Hs(), i = Zs(), e = eo(), n = to(), r = [t(Nu(), (c) => ({ since: "0.0.0", parsers: ["babel", "acorn", "espree", "meriyah", "babel-flow", "babel-ts", "flow", "typescript"], vscodeLanguageIds: ["javascript", "mongo"], interpreters: [...c.interpreters, "zx"], extensions: [...c.extensions.filter((h) => h !== ".jsx"), ".wxs"] })), t(Nu(), () => ({ name: "Flow", since: "0.0.0", parsers: ["flow", "babel-flow"], vscodeLanguageIds: ["javascript"], aliases: [], filenames: [], extensions: [".js.flow"] })), t(Nu(), () => ({ name: "JSX", since: "0.0.0", parsers: ["babel", "babel-flow", "babel-ts", "flow", "typescript", "espree", "meriyah"], vscodeLanguageIds: ["javascriptreact"], aliases: void 0, filenames: void 0, extensions: [".jsx"], group: "JavaScript", interpreters: void 0, tmScope: "source.js.jsx", aceMode: "javascript", codemirrorMode: "jsx", codemirrorMimeType: "text/jsx", color: void 0 })), t(no(), () => ({ since: "1.4.0", parsers: ["typescript", "babel-ts"], vscodeLanguageIds: ["typescript"] })), t(ro(), () => ({ since: "1.4.0", parsers: ["typescript", "babel-ts"], vscodeLanguageIds: ["typescriptreact"] })), t(Mi(), () => ({ name: "JSON.stringify", since: "1.13.0", parsers: ["json-stringify"], vscodeLanguageIds: ["json"], extensions: [".importmap"], filenames: ["package.json", "package-lock.json", "composer.json"] })), t(Mi(), (c) => ({ since: "1.5.0", parsers: ["json"], vscodeLanguageIds: ["json"], extensions: c.extensions.filter((h) => h !== ".jsonl") })), t(uo(), (c) => ({ since: "1.5.0", parsers: ["json"], vscodeLanguageIds: ["jsonc"], filenames: [...c.filenames, ".eslintrc", ".swcrc"] })), t(io(), () => ({ since: "1.13.0", parsers: ["json5"], vscodeLanguageIds: ["json5"] }))], o = { estree: s, "estree-json": i };
        l.exports = { languages: r, options: e, printers: o, parsers: n };
      } }), so = X({ "src/language-css/clean.js"(u, l) {
        H();
        var { isFrontMatterNode: t } = bt(), s = cn(), i = /* @__PURE__ */ new Set(["raw", "raws", "sourceIndex", "source", "before", "after", "trailingComma"]);
        function e(r, o, c) {
          if (t(r) && r.lang === "yaml" && delete o.value, r.type === "css-comment" && c.type === "css-root" && c.nodes.length > 0 && ((c.nodes[0] === r || t(c.nodes[0]) && c.nodes[1] === r) && (delete o.text, /^\*\s*@(?:format|prettier)\s*$/.test(r.text)) || c.type === "css-root" && s(c.nodes) === r))
            return null;
          if (r.type === "value-root" && delete o.text, (r.type === "media-query" || r.type === "media-query-list" || r.type === "media-feature-expression") && delete o.value, r.type === "css-rule" && delete o.params, r.type === "selector-combinator" && (o.value = o.value.replace(/\s+/g, " ")), r.type === "media-feature" && (o.value = o.value.replace(/ /g, "")), (r.type === "value-word" && (r.isColor && r.isHex || ["initial", "inherit", "unset", "revert"].includes(o.value.replace().toLowerCase())) || r.type === "media-feature" || r.type === "selector-root-invalid" || r.type === "selector-pseudo") && (o.value = o.value.toLowerCase()), r.type === "css-decl" && (o.prop = o.prop.toLowerCase()), (r.type === "css-atrule" || r.type === "css-import") && (o.name = o.name.toLowerCase()), r.type === "value-number" && (o.unit = o.unit.toLowerCase()), (r.type === "media-feature" || r.type === "media-keyword" || r.type === "media-type" || r.type === "media-unknown" || r.type === "media-url" || r.type === "media-value" || r.type === "selector-attribute" || r.type === "selector-string" || r.type === "selector-class" || r.type === "selector-combinator" || r.type === "value-string") && o.value && (o.value = n(o.value)), r.type === "selector-attribute" && (o.attribute = o.attribute.trim(), o.namespace && typeof o.namespace == "string" && (o.namespace = o.namespace.trim(), o.namespace.length === 0 && (o.namespace = !0)), o.value && (o.value = o.value.trim().replace(/^["']|["']$/g, ""), delete o.quoted)), (r.type === "media-value" || r.type === "media-type" || r.type === "value-number" || r.type === "selector-root-invalid" || r.type === "selector-class" || r.type === "selector-combinator" || r.type === "selector-tag") && o.value && (o.value = o.value.replace(/([\d+.Ee-]+)([A-Za-z]*)/g, (h, m, y) => {
            let p = Number(m);
            return Number.isNaN(p) ? h : p + y.toLowerCase();
          })), r.type === "selector-tag") {
            let h = r.value.toLowerCase();
            ["from", "to"].includes(h) && (o.value = h);
          }
          if (r.type === "css-atrule" && r.name.toLowerCase() === "supports" && delete o.value, r.type === "selector-unknown" && delete o.value, r.type === "value-comma_group") {
            let h = r.groups.findIndex((m) => m.type === "value-number" && m.unit === "...");
            h !== -1 && (o.groups[h].unit = "", o.groups.splice(h + 1, 0, { type: "value-word", value: "...", isColor: !1, isHex: !1 }));
          }
          if (r.type === "value-comma_group" && r.groups.some((h) => h.type === "value-atword" && h.value.endsWith("[") || h.type === "value-word" && h.value.startsWith("]")))
            return { type: "value-atword", value: r.groups.map((h) => h.value).join(""), group: { open: null, close: null, groups: [], type: "value-paren_group" } };
        }
        e.ignoredProperties = i;
        function n(r) {
          return r.replace(/'/g, '"').replace(/\\([^\dA-Fa-f])/g, "$1");
        }
        l.exports = e;
      } }), ku = X({ "src/utils/front-matter/print.js"(u, l) {
        H();
        var { builders: { hardline: t, markAsRoot: s } } = pt();
        function i(e, n) {
          if (e.lang === "yaml") {
            let r = e.value.trim(), o = r ? n(r, { parser: "yaml" }, { stripTrailingHardline: !0 }) : "";
            return s([e.startDelimiter, t, o, o ? t : "", e.endDelimiter]);
          }
        }
        l.exports = i;
      } }), oo = X({ "src/language-css/embed.js"(u, l) {
        H();
        var { builders: { hardline: t } } = pt(), s = ku();
        function i(e, n, r) {
          let o = e.getValue();
          if (o.type === "front-matter") {
            let c = s(o, r);
            return c ? [c, t] : "";
          }
        }
        l.exports = i;
      } }), $i = X({ "src/utils/front-matter/parse.js"(u, l) {
        H();
        var t = new RegExp("^(?<startDelimiter>-{3}|\\+{3})(?<language>[^\\n]*)\\n(?:|(?<value>.*?)\\n)(?<endDelimiter>\\k<startDelimiter>|\\.{3})[^\\S\\n]*(?:\\n|$)", "s");
        function s(i) {
          let e = i.match(t);
          if (!e)
            return { content: i };
          let { startDelimiter: n, language: r, value: o = "", endDelimiter: c } = e.groups, h = r.trim() || "yaml";
          if (n === "+++" && (h = "toml"), h !== "yaml" && n !== c)
            return { content: i };
          let [m] = e;
          return { frontMatter: { type: "front-matter", lang: h, value: o, startDelimiter: n, endDelimiter: c, raw: m.replace(/\n$/, "") }, content: m.replace(/[^\n]/g, " ") + i.slice(m.length) };
        }
        l.exports = s;
      } }), lo = X({ "src/language-css/pragma.js"(u, l) {
        H();
        var t = Bi(), s = $i();
        function i(n) {
          return t.hasPragma(s(n).content);
        }
        function e(n) {
          let { frontMatter: r, content: o } = s(n);
          return (r ? r.raw + `

` : "") + t.insertPragma(o);
        }
        l.exports = { hasPragma: i, insertPragma: e };
      } }), po = X({ "src/language-css/utils/index.js"(u, l) {
        H();
        var t = /* @__PURE__ */ new Set(["red", "green", "blue", "alpha", "a", "rgb", "hue", "h", "saturation", "s", "lightness", "l", "whiteness", "w", "blackness", "b", "tint", "shade", "blend", "blenda", "contrast", "hsl", "hsla", "hwb", "hwba"]);
        function s(Q, W) {
          let re = Array.isArray(W) ? W : [W], ue = -1, Ce;
          for (; Ce = Q.getParentNode(++ue); )
            if (re.includes(Ce.type))
              return ue;
          return -1;
        }
        function i(Q, W) {
          let re = s(Q, W);
          return re === -1 ? null : Q.getParentNode(re);
        }
        function e(Q) {
          var W;
          let re = i(Q, "css-decl");
          return re == null || (W = re.prop) === null || W === void 0 ? void 0 : W.toLowerCase();
        }
        var n = /* @__PURE__ */ new Set(["initial", "inherit", "unset", "revert"]);
        function r(Q) {
          return n.has(Q.toLowerCase());
        }
        function o(Q, W) {
          let re = i(Q, "css-atrule");
          return (re == null ? void 0 : re.name) && re.name.toLowerCase().endsWith("keyframes") && ["from", "to"].includes(W.toLowerCase());
        }
        function c(Q) {
          return Q.includes("$") || Q.includes("@") || Q.includes("#") || Q.startsWith("%") || Q.startsWith("--") || Q.startsWith(":--") || Q.includes("(") && Q.includes(")") ? Q : Q.toLowerCase();
        }
        function h(Q, W) {
          var re;
          let ue = i(Q, "value-func");
          return (ue == null || (re = ue.value) === null || re === void 0 ? void 0 : re.toLowerCase()) === W;
        }
        function m(Q) {
          var W;
          let re = i(Q, "css-rule"), ue = re == null || (W = re.raws) === null || W === void 0 ? void 0 : W.selector;
          return ue && (ue.startsWith(":import") || ue.startsWith(":export"));
        }
        function y(Q, W) {
          let re = Array.isArray(W) ? W : [W], ue = i(Q, "css-atrule");
          return ue && re.includes(ue.name.toLowerCase());
        }
        function p(Q) {
          let W = Q.getValue(), re = i(Q, "css-atrule");
          return (re == null ? void 0 : re.name) === "import" && W.groups[0].value === "url" && W.groups.length === 2;
        }
        function D(Q) {
          return Q.type === "value-func" && Q.value.toLowerCase() === "url";
        }
        function C(Q, W) {
          var re;
          let ue = (re = Q.getParentNode()) === null || re === void 0 ? void 0 : re.nodes;
          return ue && ue.indexOf(W) === ue.length - 1;
        }
        function w(Q) {
          let { selector: W } = Q;
          return W ? typeof W == "string" && /^@.+:.*$/.test(W) || W.value && /^@.+:.*$/.test(W.value) : !1;
        }
        function P(Q) {
          return Q.type === "value-word" && ["from", "through", "end"].includes(Q.value);
        }
        function A(Q) {
          return Q.type === "value-word" && ["and", "or", "not"].includes(Q.value);
        }
        function N(Q) {
          return Q.type === "value-word" && Q.value === "in";
        }
        function S(Q) {
          return Q.type === "value-operator" && Q.value === "*";
        }
        function j(Q) {
          return Q.type === "value-operator" && Q.value === "/";
        }
        function k(Q) {
          return Q.type === "value-operator" && Q.value === "+";
        }
        function J(Q) {
          return Q.type === "value-operator" && Q.value === "-";
        }
        function f(Q) {
          return Q.type === "value-operator" && Q.value === "%";
        }
        function B(Q) {
          return S(Q) || j(Q) || k(Q) || J(Q) || f(Q);
        }
        function d(Q) {
          return Q.type === "value-word" && ["==", "!="].includes(Q.value);
        }
        function F(Q) {
          return Q.type === "value-word" && ["<", ">", "<=", ">="].includes(Q.value);
        }
        function a(Q) {
          return Q.type === "css-atrule" && ["if", "else", "for", "each", "while"].includes(Q.name);
        }
        function g(Q) {
          var W;
          return ((W = Q.raws) === null || W === void 0 ? void 0 : W.params) && /^\(\s*\)$/.test(Q.raws.params);
        }
        function E(Q) {
          return Q.name.startsWith("prettier-placeholder");
        }
        function b(Q) {
          return Q.prop.startsWith("@prettier-placeholder");
        }
        function x(Q, W) {
          return Q.value === "$$" && Q.type === "value-func" && (W == null ? void 0 : W.type) === "value-word" && !W.raws.before;
        }
        function T(Q) {
          var W, re;
          return ((W = Q.value) === null || W === void 0 ? void 0 : W.type) === "value-root" && ((re = Q.value.group) === null || re === void 0 ? void 0 : re.type) === "value-value" && Q.prop.toLowerCase() === "composes";
        }
        function I(Q) {
          var W, re, ue;
          return ((W = Q.value) === null || W === void 0 || (re = W.group) === null || re === void 0 || (ue = re.group) === null || ue === void 0 ? void 0 : ue.type) === "value-paren_group" && Q.value.group.group.open !== null && Q.value.group.group.close !== null;
        }
        function M(Q) {
          var W;
          return ((W = Q.raws) === null || W === void 0 ? void 0 : W.before) === "";
        }
        function V(Q) {
          var W, re;
          return Q.type === "value-comma_group" && ((W = Q.groups) === null || W === void 0 || (re = W[1]) === null || re === void 0 ? void 0 : re.type) === "value-colon";
        }
        function $(Q) {
          var W;
          return Q.type === "value-paren_group" && ((W = Q.groups) === null || W === void 0 ? void 0 : W[0]) && V(Q.groups[0]);
        }
        function U(Q) {
          var W;
          let re = Q.getValue();
          if (re.groups.length === 0)
            return !1;
          let ue = Q.getParentNode(1);
          if (!$(re) && !(ue && $(ue)))
            return !1;
          let Ce = i(Q, "css-decl");
          return !!(Ce != null && (W = Ce.prop) !== null && W !== void 0 && W.startsWith("$") || $(ue) || ue.type === "value-func");
        }
        function _(Q) {
          return Q.type === "value-comment" && Q.inline;
        }
        function ee(Q) {
          return Q.type === "value-word" && Q.value === "#";
        }
        function R(Q) {
          return Q.type === "value-word" && Q.value === "{";
        }
        function O(Q) {
          return Q.type === "value-word" && Q.value === "}";
        }
        function Z(Q) {
          return ["value-word", "value-atword"].includes(Q.type);
        }
        function ae(Q) {
          return (Q == null ? void 0 : Q.type) === "value-colon";
        }
        function ne(Q, W) {
          if (!V(W))
            return !1;
          let { groups: re } = W, ue = re.indexOf(Q);
          return ue === -1 ? !1 : ae(re[ue + 1]);
        }
        function he(Q) {
          return Q.value && ["not", "and", "or"].includes(Q.value.toLowerCase());
        }
        function q(Q) {
          return Q.type !== "value-func" ? !1 : t.has(Q.value.toLowerCase());
        }
        function Y(Q) {
          return /\/\//.test(Q.split(/[\n\r]/).pop());
        }
        function me(Q) {
          return (Q == null ? void 0 : Q.type) === "value-atword" && Q.value.startsWith("prettier-placeholder-");
        }
        function ge(Q, W) {
          var re, ue;
          if (((re = Q.open) === null || re === void 0 ? void 0 : re.value) !== "(" || ((ue = Q.close) === null || ue === void 0 ? void 0 : ue.value) !== ")" || Q.groups.some((Ce) => Ce.type !== "value-comma_group"))
            return !1;
          if (W.type === "value-comma_group") {
            let Ce = W.groups.indexOf(Q) - 1, be = W.groups[Ce];
            if ((be == null ? void 0 : be.type) === "value-word" && be.value === "with")
              return !0;
          }
          return !1;
        }
        function _e(Q) {
          var W, re;
          return Q.type === "value-paren_group" && ((W = Q.open) === null || W === void 0 ? void 0 : W.value) === "(" && ((re = Q.close) === null || re === void 0 ? void 0 : re.value) === ")";
        }
        l.exports = { getAncestorCounter: s, getAncestorNode: i, getPropOfDeclNode: e, maybeToLowerCase: c, insideValueFunctionNode: h, insideICSSRuleNode: m, insideAtRuleNode: y, insideURLFunctionInImportAtRuleNode: p, isKeyframeAtRuleKeywords: o, isWideKeywords: r, isLastNode: C, isSCSSControlDirectiveNode: a, isDetachedRulesetDeclarationNode: w, isRelationalOperatorNode: F, isEqualityOperatorNode: d, isMultiplicationNode: S, isDivisionNode: j, isAdditionNode: k, isSubtractionNode: J, isModuloNode: f, isMathOperatorNode: B, isEachKeywordNode: N, isForKeywordNode: P, isURLFunctionNode: D, isIfElseKeywordNode: A, hasComposesNode: T, hasParensAroundNode: I, hasEmptyRawBefore: M, isDetachedRulesetCallNode: g, isTemplatePlaceholderNode: E, isTemplatePropNode: b, isPostcssSimpleVarNode: x, isKeyValuePairNode: V, isKeyValuePairInParenGroupNode: $, isKeyInValuePairNode: ne, isSCSSMapItemNode: U, isInlineValueCommentNode: _, isHashNode: ee, isLeftCurlyBraceNode: R, isRightCurlyBraceNode: O, isWordNode: Z, isColonNode: ae, isMediaAndSupportsKeywords: he, isColorAdjusterFuncNode: q, lastLineHasInlineComment: Y, isAtWordPlaceholderNode: me, isConfigurationNode: ge, isParenGroupNode: _e };
      } }), co = X({ "src/utils/line-column-to-index.js"(u, l) {
        H(), l.exports = function(t, s) {
          let i = 0;
          for (let e = 0; e < t.line - 1; ++e)
            i = s.indexOf(`
`, i) + 1;
          return i + t.column;
        };
      } }), Do = X({ "src/language-css/loc.js"(u, l) {
        H();
        var { skipEverythingButNewLine: t } = Ur(), s = cn(), i = co();
        function e(p, D) {
          return typeof p.sourceIndex == "number" ? p.sourceIndex : p.source ? i(p.source.start, D) - 1 : null;
        }
        function n(p, D) {
          if (p.type === "css-comment" && p.inline)
            return t(D, p.source.startOffset);
          let C = p.nodes && s(p.nodes);
          return C && p.source && !p.source.end && (p = C), p.source && p.source.end ? i(p.source.end, D) : null;
        }
        function r(p, D) {
          p.source && (p.source.startOffset = e(p, D), p.source.endOffset = n(p, D));
          for (let C in p) {
            let w = p[C];
            C === "source" || !w || typeof w != "object" || (w.type === "value-root" || w.type === "value-unknown" ? o(w, c(p), w.text || w.value) : r(w, D));
          }
        }
        function o(p, D, C) {
          p.source && (p.source.startOffset = e(p, C) + D, p.source.endOffset = n(p, C) + D);
          for (let w in p) {
            let P = p[w];
            w === "source" || !P || typeof P != "object" || o(P, D, C);
          }
        }
        function c(p) {
          let D = p.source.startOffset;
          return typeof p.prop == "string" && (D += p.prop.length), p.type === "css-atrule" && typeof p.name == "string" && (D += 1 + p.name.length + p.raws.afterName.match(/^\s*:?\s*/)[0].length), p.type !== "css-atrule" && p.raws && typeof p.raws.between == "string" && (D += p.raws.between.length), D;
        }
        function h(p) {
          let D = "initial", C = "initial", w, P = !1, A = [];
          for (let N = 0; N < p.length; N++) {
            let S = p[N];
            switch (D) {
              case "initial":
                if (S === "'") {
                  D = "single-quotes";
                  continue;
                }
                if (S === '"') {
                  D = "double-quotes";
                  continue;
                }
                if ((S === "u" || S === "U") && p.slice(N, N + 4).toLowerCase() === "url(") {
                  D = "url", N += 3;
                  continue;
                }
                if (S === "*" && p[N - 1] === "/") {
                  D = "comment-block";
                  continue;
                }
                if (S === "/" && p[N - 1] === "/") {
                  D = "comment-inline", w = N - 1;
                  continue;
                }
                continue;
              case "single-quotes":
                if (S === "'" && p[N - 1] !== "\\" && (D = C, C = "initial"), S === `
` || S === "\r")
                  return p;
                continue;
              case "double-quotes":
                if (S === '"' && p[N - 1] !== "\\" && (D = C, C = "initial"), S === `
` || S === "\r")
                  return p;
                continue;
              case "url":
                if (S === ")" && (D = "initial"), S === `
` || S === "\r")
                  return p;
                if (S === "'") {
                  D = "single-quotes", C = "url";
                  continue;
                }
                if (S === '"') {
                  D = "double-quotes", C = "url";
                  continue;
                }
                continue;
              case "comment-block":
                S === "/" && p[N - 1] === "*" && (D = "initial");
                continue;
              case "comment-inline":
                (S === '"' || S === "'" || S === "*") && (P = !0), (S === `
` || S === "\r") && (P && A.push([w, N]), D = "initial", P = !1);
                continue;
            }
          }
          for (let [N, S] of A)
            p = p.slice(0, N) + p.slice(N, S).replace(/["'*]/g, " ") + p.slice(S);
          return p;
        }
        function m(p) {
          return p.source.startOffset;
        }
        function y(p) {
          return p.source.endOffset;
        }
        l.exports = { locStart: m, locEnd: y, calculateLoc: r, replaceQuotesInInlineComments: h };
      } }), fo = X({ "src/language-css/utils/is-less-parser.js"(u, l) {
        H();
        function t(s) {
          return s.parser === "css" || s.parser === "less";
        }
        l.exports = t;
      } }), mo = X({ "src/language-css/utils/is-scss.js"(u, l) {
        H();
        function t(s, i) {
          return s === "less" || s === "scss" ? s === "scss" : /(?:\w\s*:\s*[^:}]+|#){|@import[^\n]+(?:url|,)/.test(i);
        }
        l.exports = t;
      } }), go = X({ "src/language-css/utils/css-units.evaluate.js"(u, l) {
        l.exports = { em: "em", rem: "rem", ex: "ex", rex: "rex", cap: "cap", rcap: "rcap", ch: "ch", rch: "rch", ic: "ic", ric: "ric", lh: "lh", rlh: "rlh", vw: "vw", svw: "svw", lvw: "lvw", dvw: "dvw", vh: "vh", svh: "svh", lvh: "lvh", dvh: "dvh", vi: "vi", svi: "svi", lvi: "lvi", dvi: "dvi", vb: "vb", svb: "svb", lvb: "lvb", dvb: "dvb", vmin: "vmin", svmin: "svmin", lvmin: "lvmin", dvmin: "dvmin", vmax: "vmax", svmax: "svmax", lvmax: "lvmax", dvmax: "dvmax", cm: "cm", mm: "mm", q: "Q", in: "in", pt: "pt", pc: "pc", px: "px", deg: "deg", grad: "grad", rad: "rad", turn: "turn", s: "s", ms: "ms", hz: "Hz", khz: "kHz", dpi: "dpi", dpcm: "dpcm", dppx: "dppx", x: "x" };
      } }), yo = X({ "src/language-css/utils/print-unit.js"(u, l) {
        H();
        var t = go();
        function s(i) {
          let e = i.toLowerCase();
          return Object.prototype.hasOwnProperty.call(t, e) ? t[e] : i;
        }
        l.exports = s;
      } }), ho = X({ "src/language-css/printer-postcss.js"(u, l) {
        H();
        var t = cn(), { printNumber: s, printString: i, hasNewline: e, isFrontMatterNode: n, isNextLineEmpty: r, isNonEmptyArray: o } = bt(), { builders: { join: c, line: h, hardline: m, softline: y, group: p, fill: D, indent: C, dedent: w, ifBreak: P, breakParent: A }, utils: { removeLines: N, getDocParts: S } } = pt(), j = so(), k = oo(), { insertPragma: J } = lo(), { getAncestorNode: f, getPropOfDeclNode: B, maybeToLowerCase: d, insideValueFunctionNode: F, insideICSSRuleNode: a, insideAtRuleNode: g, insideURLFunctionInImportAtRuleNode: E, isKeyframeAtRuleKeywords: b, isWideKeywords: x, isLastNode: T, isSCSSControlDirectiveNode: I, isDetachedRulesetDeclarationNode: M, isRelationalOperatorNode: V, isEqualityOperatorNode: $, isMultiplicationNode: U, isDivisionNode: _, isAdditionNode: ee, isSubtractionNode: R, isMathOperatorNode: O, isEachKeywordNode: Z, isForKeywordNode: ae, isURLFunctionNode: ne, isIfElseKeywordNode: he, hasComposesNode: q, hasParensAroundNode: Y, hasEmptyRawBefore: me, isKeyValuePairNode: ge, isKeyInValuePairNode: _e, isDetachedRulesetCallNode: Q, isTemplatePlaceholderNode: W, isTemplatePropNode: re, isPostcssSimpleVarNode: ue, isSCSSMapItemNode: Ce, isInlineValueCommentNode: be, isHashNode: Be, isLeftCurlyBraceNode: ze, isRightCurlyBraceNode: mt, isWordNode: Dt, isColonNode: Ue, isMediaAndSupportsKeywords: tt, isColorAdjusterFuncNode: ce, lastLineHasInlineComment: G, isAtWordPlaceholderNode: ye, isConfigurationNode: K, isParenGroupNode: fe } = po(), { locStart: Ve, locEnd: Ie } = Do(), Ee = fo(), v = mo(), z = yo();
        function se(Ge) {
          return Ge.trailingComma === "es5" || Ge.trailingComma === "all";
        }
        function Se(Ge, ct, at) {
          let De = Ge.getValue();
          if (!De)
            return "";
          if (typeof De == "string")
            return De;
          switch (De.type) {
            case "front-matter":
              return [De.raw, m];
            case "css-root": {
              let Ft = Pe(Ge, ct, at), At = De.raws.after.trim();
              return At.startsWith(";") && (At = At.slice(1).trim()), [Ft, At ? ` ${At}` : "", S(Ft).length > 0 ? m : ""];
            }
            case "css-comment": {
              let Ft = De.inline || De.raws.inline, At = ct.originalText.slice(Ve(De), Ie(De));
              return Ft ? At.trimEnd() : At;
            }
            case "css-rule":
              return [at("selector"), De.important ? " !important" : "", De.nodes ? [De.selector && De.selector.type === "selector-unknown" && G(De.selector.value) ? h : " ", "{", De.nodes.length > 0 ? C([m, Pe(Ge, ct, at)]) : "", m, "}", M(De) ? ";" : ""] : ";"];
            case "css-decl": {
              let Ft = Ge.getParentNode(), { between: At } = De.raws, Rt = At.trim(), Nn = Rt === ":", L = q(De) ? N(at("value")) : at("value");
              return !Nn && G(Rt) && (L = C([m, w(L)])), [De.raws.before.replace(/[\s;]/g, ""), Ft.type === "css-atrule" && Ft.variable || a(Ge) ? De.prop : d(De.prop), Rt.startsWith("//") ? " " : "", Rt, De.extend ? "" : " ", Ee(ct) && De.extend && De.selector ? ["extend(", at("selector"), ")"] : "", L, De.raws.important ? De.raws.important.replace(/\s*!\s*important/i, " !important") : De.important ? " !important" : "", De.raws.scssDefault ? De.raws.scssDefault.replace(/\s*!default/i, " !default") : De.scssDefault ? " !default" : "", De.raws.scssGlobal ? De.raws.scssGlobal.replace(/\s*!global/i, " !global") : De.scssGlobal ? " !global" : "", De.nodes ? [" {", C([y, Pe(Ge, ct, at)]), y, "}"] : re(De) && !Ft.raws.semicolon && ct.originalText[Ie(De) - 1] !== ";" ? "" : ct.__isHTMLStyleAttribute && T(Ge, De) ? P(";") : ";"];
            }
            case "css-atrule": {
              let Ft = Ge.getParentNode(), At = W(De) && !Ft.raws.semicolon && ct.originalText[Ie(De) - 1] !== ";";
              if (Ee(ct)) {
                if (De.mixin)
                  return [at("selector"), De.important ? " !important" : "", At ? "" : ";"];
                if (De.function)
                  return [De.name, at("params"), At ? "" : ";"];
                if (De.variable)
                  return ["@", De.name, ": ", De.value ? at("value") : "", De.raws.between.trim() ? De.raws.between.trim() + " " : "", De.nodes ? ["{", C([De.nodes.length > 0 ? y : "", Pe(Ge, ct, at)]), y, "}"] : "", At ? "" : ";"];
              }
              return ["@", Q(De) || De.name.endsWith(":") ? De.name : d(De.name), De.params ? [Q(De) ? "" : W(De) ? De.raws.afterName === "" ? "" : De.name.endsWith(":") ? " " : /^\s*\n\s*\n/.test(De.raws.afterName) ? [m, m] : /^\s*\n/.test(De.raws.afterName) ? m : " " : " ", at("params")] : "", De.selector ? C([" ", at("selector")]) : "", De.value ? p([" ", at("value"), I(De) ? Y(De) ? " " : h : ""]) : De.name === "else" ? " " : "", De.nodes ? [I(De) ? "" : De.selector && !De.selector.nodes && typeof De.selector.value == "string" && G(De.selector.value) || !De.selector && typeof De.params == "string" && G(De.params) ? h : " ", "{", C([De.nodes.length > 0 ? y : "", Pe(Ge, ct, at)]), y, "}"] : At ? "" : ";"];
            }
            case "media-query-list": {
              let Ft = [];
              return Ge.each((At) => {
                let Rt = At.getValue();
                Rt.type === "media-query" && Rt.value === "" || Ft.push(at());
              }, "nodes"), p(C(c(h, Ft)));
            }
            case "media-query":
              return [c(" ", Ge.map(at, "nodes")), T(Ge, De) ? "" : ","];
            case "media-type":
              return ft(Je(De.value, ct));
            case "media-feature-expression":
              return De.nodes ? ["(", ...Ge.map(at, "nodes"), ")"] : De.value;
            case "media-feature":
              return d(Je(De.value.replace(/ +/g, " "), ct));
            case "media-colon":
              return [De.value, " "];
            case "media-value":
              return ft(Je(De.value, ct));
            case "media-keyword":
              return Je(De.value, ct);
            case "media-url":
              return Je(De.value.replace(/^url\(\s+/gi, "url(").replace(/\s+\)$/g, ")"), ct);
            case "media-unknown":
              return De.value;
            case "selector-root":
              return p([g(Ge, "custom-selector") ? [f(Ge, "css-atrule").customSelector, h] : "", c([",", g(Ge, ["extend", "custom-selector", "nest"]) ? h : m], Ge.map(at, "nodes"))]);
            case "selector-selector":
              return p(C(Ge.map(at, "nodes")));
            case "selector-comment":
              return De.value;
            case "selector-string":
              return Je(De.value, ct);
            case "selector-tag": {
              let Ft = Ge.getParentNode(), At = Ft && Ft.nodes.indexOf(De), Rt = At && Ft.nodes[At - 1];
              return [De.namespace ? [De.namespace === !0 ? "" : De.namespace.trim(), "|"] : "", Rt.type === "selector-nesting" ? De.value : ft(b(Ge, De.value) ? De.value.toLowerCase() : De.value)];
            }
            case "selector-id":
              return ["#", De.value];
            case "selector-class":
              return [".", ft(Je(De.value, ct))];
            case "selector-attribute": {
              var wn;
              return ["[", De.namespace ? [De.namespace === !0 ? "" : De.namespace.trim(), "|"] : "", De.attribute.trim(), (wn = De.operator) !== null && wn !== void 0 ? wn : "", De.value ? it(Je(De.value.trim(), ct), ct) : "", De.insensitive ? " i" : "", "]"];
            }
            case "selector-combinator": {
              if (De.value === "+" || De.value === ">" || De.value === "~" || De.value === ">>>") {
                let Rt = Ge.getParentNode();
                return [Rt.type === "selector-selector" && Rt.nodes[0] === De ? "" : h, De.value, T(Ge, De) ? "" : " "];
              }
              let Ft = De.value.trim().startsWith("(") ? h : "", At = ft(Je(De.value.trim(), ct)) || h;
              return [Ft, At];
            }
            case "selector-universal":
              return [De.namespace ? [De.namespace === !0 ? "" : De.namespace.trim(), "|"] : "", De.value];
            case "selector-pseudo":
              return [d(De.value), o(De.nodes) ? p(["(", C([y, c([",", h], Ge.map(at, "nodes"))]), y, ")"]) : ""];
            case "selector-nesting":
              return De.value;
            case "selector-unknown": {
              let Ft = f(Ge, "css-rule");
              if (Ft && Ft.isSCSSNesterProperty)
                return ft(Je(d(De.value), ct));
              let At = Ge.getParentNode();
              if (At.raws && At.raws.selector) {
                let Nn = Ve(At), L = Nn + At.raws.selector.length;
                return ct.originalText.slice(Nn, L).trim();
              }
              let Rt = Ge.getParentNode(1);
              if (At.type === "value-paren_group" && Rt && Rt.type === "value-func" && Rt.value === "selector") {
                let Nn = Ie(At.open) + 1, L = Ve(At.close), Fe = ct.originalText.slice(Nn, L).trim();
                return G(Fe) ? [A, Fe] : Fe;
              }
              return De.value;
            }
            case "value-value":
            case "value-root":
              return at("group");
            case "value-comment":
              return ct.originalText.slice(Ve(De), Ie(De));
            case "value-comma_group": {
              let Ft = Ge.getParentNode(), At = Ge.getParentNode(1), Rt = B(Ge), Nn = Rt && Ft.type === "value-value" && (Rt === "grid" || Rt.startsWith("grid-template")), L = f(Ge, "css-atrule"), Fe = L && I(L), et = De.groups.some((kn) => be(kn)), xt = Ge.map(at, "groups"), St = [], xn = F(Ge, "url"), Ut = !1, gn = !1;
              for (let kn = 0; kn < De.groups.length; ++kn) {
                var Dn;
                St.push(xt[kn]);
                let sn = De.groups[kn - 1], st = De.groups[kn], yt = De.groups[kn + 1], iu = De.groups[kn + 2];
                if (xn) {
                  (yt && ee(yt) || ee(st)) && St.push(" ");
                  continue;
                }
                if (g(Ge, "forward") && st.type === "value-word" && st.value && sn !== void 0 && sn.type === "value-word" && sn.value === "as" && yt.type === "value-operator" && yt.value === "*" || !yt || st.type === "value-word" && st.value.endsWith("-") && ye(yt))
                  continue;
                if (st.type === "value-string" && st.quoted) {
                  let Ou = st.value.lastIndexOf("#{"), Mu = st.value.lastIndexOf("}");
                  Ou !== -1 && Mu !== -1 ? Ut = Ou > Mu : Ou !== -1 ? Ut = !0 : Mu !== -1 && (Ut = !1);
                }
                if (Ut || Ue(st) || Ue(yt) || st.type === "value-atword" && (st.value === "" || st.value.endsWith("[")) || yt.type === "value-word" && yt.value.startsWith("]") || st.value === "~" || st.value && st.value.includes("\\") && yt && yt.type !== "value-comment" || sn && sn.value && sn.value.indexOf("\\") === sn.value.length - 1 && st.type === "value-operator" && st.value === "/" || st.value === "\\" || ue(st, yt) || Be(st) || ze(st) || mt(yt) || ze(yt) && me(yt) || mt(st) && me(yt) || st.value === "--" && Be(yt))
                  continue;
                let Lu = O(st), Xi = O(yt);
                if ((Lu && Be(yt) || Xi && mt(st)) && me(yt) || !sn && _(st) || F(Ge, "calc") && (ee(st) || ee(yt) || R(st) || R(yt)) && me(yt))
                  continue;
                let jl = (ee(st) || R(st)) && kn === 0 && (yt.type === "value-number" || yt.isHex) && At && ce(At) && !me(yt), Ui = iu && iu.type === "value-func" || iu && Dt(iu) || st.type === "value-func" || Dt(st), zi = yt.type === "value-func" || Dt(yt) || sn && sn.type === "value-func" || sn && Dt(sn);
                if (!(!(U(yt) || U(st)) && !F(Ge, "calc") && !jl && (_(yt) && !Ui || _(st) && !zi || ee(yt) && !Ui || ee(st) && !zi || R(yt) || R(st)) && (me(yt) || Lu && (!sn || sn && O(sn)))) && !((ct.parser === "scss" || ct.parser === "less") && Lu && st.value === "-" && fe(yt) && Ie(st) === Ve(yt.open) && yt.open.value === "(")) {
                  if (be(st)) {
                    if (Ft.type === "value-paren_group") {
                      St.push(w(m));
                      continue;
                    }
                    St.push(m);
                    continue;
                  }
                  if (Fe && ($(yt) || V(yt) || he(yt) || Z(st) || ae(st))) {
                    St.push(" ");
                    continue;
                  }
                  if (L && L.name.toLowerCase() === "namespace") {
                    St.push(" ");
                    continue;
                  }
                  if (Nn) {
                    st.source && yt.source && st.source.start.line !== yt.source.start.line ? (St.push(m), gn = !0) : St.push(" ");
                    continue;
                  }
                  if (Xi) {
                    St.push(" ");
                    continue;
                  }
                  if (!(yt && yt.value === "...") && !(ye(st) && ye(yt) && Ie(st) === Ve(yt))) {
                    if (ye(st) && fe(yt) && Ie(st) === Ve(yt.open)) {
                      St.push(y);
                      continue;
                    }
                    if (st.value === "with" && fe(yt)) {
                      St.push(" ");
                      continue;
                    }
                    (Dn = st.value) !== null && Dn !== void 0 && Dn.endsWith("#") && yt.value === "{" && fe(yt.group) || St.push(h);
                  }
                }
              }
              return et && St.push(A), gn && St.unshift(m), Fe ? p(C(St)) : E(Ge) ? p(D(St)) : p(C(D(St)));
            }
            case "value-paren_group": {
              let Ft = Ge.getParentNode();
              if (Ft && ne(Ft) && (De.groups.length === 1 || De.groups.length > 0 && De.groups[0].type === "value-comma_group" && De.groups[0].groups.length > 0 && De.groups[0].groups[0].type === "value-word" && De.groups[0].groups[0].value.startsWith("data:")))
                return [De.open ? at("open") : "", c(",", Ge.map(at, "groups")), De.close ? at("close") : ""];
              if (!De.open) {
                let xn = Ge.map(at, "groups"), Ut = [];
                for (let gn = 0; gn < xn.length; gn++)
                  gn !== 0 && Ut.push([",", h]), Ut.push(xn[gn]);
                return p(C(D(Ut)));
              }
              let At = Ce(Ge), Rt = t(De.groups), Nn = Rt && Rt.type === "value-comment", L = _e(De, Ft), Fe = K(De, Ft), et = Fe || At && !L, xt = Fe || L, St = p([De.open ? at("open") : "", C([y, c([h], Ge.map((xn, Ut) => {
                let gn = xn.getValue(), kn = Ut === De.groups.length - 1, sn = [at(), kn ? "" : ","];
                if (ge(gn) && gn.type === "value-comma_group" && gn.groups && gn.groups[0].type !== "value-paren_group" && gn.groups[2] && gn.groups[2].type === "value-paren_group") {
                  let st = S(sn[0].contents.contents);
                  st[1] = p(st[1]), sn = [p(w(sn))];
                }
                if (!kn && gn.type === "value-comma_group" && o(gn.groups)) {
                  let st = t(gn.groups);
                  !st.source && st.close && (st = st.close), st.source && r(ct.originalText, st, Ie) && sn.push(m);
                }
                return sn;
              }, "groups"))]), P(!Nn && v(ct.parser, ct.originalText) && At && se(ct) ? "," : ""), y, De.close ? at("close") : ""], { shouldBreak: et });
              return xt ? w(St) : St;
            }
            case "value-func":
              return [De.value, g(Ge, "supports") && tt(De) ? " " : "", at("group")];
            case "value-paren":
              return De.value;
            case "value-number":
              return [Lt(De.value), z(De.unit)];
            case "value-operator":
              return De.value;
            case "value-word":
              return De.isColor && De.isHex || x(De.value) ? De.value.toLowerCase() : De.value;
            case "value-colon": {
              let Ft = Ge.getParentNode(), At = Ft && Ft.groups.indexOf(De), Rt = At && Ft.groups[At - 1];
              return [De.value, Rt && typeof Rt.value == "string" && t(Rt.value) === "\\" || F(Ge, "url") ? "" : h];
            }
            case "value-comma":
              return [De.value, " "];
            case "value-string":
              return i(De.raws.quote + De.value + De.raws.quote, ct);
            case "value-atword":
              return ["@", De.value];
            case "value-unicode-range":
              return De.value;
            case "value-unknown":
              return De.value;
            default:
              throw new Error(`Unknown postcss type ${JSON.stringify(De.type)}`);
          }
        }
        function Pe(Ge, ct, at) {
          let De = [];
          return Ge.each((wn, Dn, Ft) => {
            let At = Ft[Dn - 1];
            if (At && At.type === "css-comment" && At.text.trim() === "prettier-ignore") {
              let Rt = wn.getValue();
              De.push(ct.originalText.slice(Ve(Rt), Ie(Rt)));
            } else
              De.push(at());
            Dn !== Ft.length - 1 && (Ft[Dn + 1].type === "css-comment" && !e(ct.originalText, Ve(Ft[Dn + 1]), { backwards: !0 }) && !n(Ft[Dn]) || Ft[Dn + 1].type === "css-atrule" && Ft[Dn + 1].name === "else" && Ft[Dn].type !== "css-comment" ? De.push(" ") : (De.push(ct.__isHTMLStyleAttribute ? h : m), r(ct.originalText, wn.getValue(), Ie) && !n(Ft[Dn]) && De.push(m)));
          }, "nodes"), De;
        }
        var Xe = /(["'])(?:(?!\1)[^\\]|\\.)*\1/gs, Te = /(?:\d*\.\d+|\d+\.?)(?:[Ee][+-]?\d+)?/g, Wt = /[A-Za-z]+/g, qe = /[$@]?[A-Z_a-z\u0080-\uFFFF][\w\u0080-\uFFFF-]*/g, qt = new RegExp(Xe.source + `|(${qe.source})?(${Te.source})(${Wt.source})?`, "g");
        function Je(Ge, ct) {
          return Ge.replace(Xe, (at) => i(at, ct));
        }
        function it(Ge, ct) {
          let at = ct.singleQuote ? "'" : '"';
          return Ge.includes('"') || Ge.includes("'") ? Ge : at + Ge + at;
        }
        function ft(Ge) {
          return Ge.replace(qt, (ct, at, De, wn, Dn) => !De && wn ? Lt(wn) + d(Dn || "") : ct);
        }
        function Lt(Ge) {
          return s(Ge).replace(/\.0(?=$|e)/, "");
        }
        l.exports = { print: Se, embed: k, insertPragma: J, massageAstNode: j };
      } }), Eo = X({ "src/language-css/options.js"(u, l) {
        H();
        var t = pr();
        l.exports = { singleQuote: t.singleQuote };
      } }), Co = X({ "src/language-css/parsers.js"() {
        H();
      } }), Fo = X({ "node_modules/linguist-languages/data/CSS.json"(u, l) {
        l.exports = { name: "CSS", type: "markup", tmScope: "source.css", aceMode: "css", codemirrorMode: "css", codemirrorMimeType: "text/css", color: "#563d7c", extensions: [".css"], languageId: 50 };
      } }), Ao = X({ "node_modules/linguist-languages/data/PostCSS.json"(u, l) {
        l.exports = { name: "PostCSS", type: "markup", color: "#dc3a0c", tmScope: "source.postcss", group: "CSS", extensions: [".pcss", ".postcss"], aceMode: "text", languageId: 262764437 };
      } }), vo = X({ "node_modules/linguist-languages/data/Less.json"(u, l) {
        l.exports = { name: "Less", type: "markup", color: "#1d365d", aliases: ["less-css"], extensions: [".less"], tmScope: "source.css.less", aceMode: "less", codemirrorMode: "css", codemirrorMimeType: "text/css", languageId: 198 };
      } }), bo = X({ "node_modules/linguist-languages/data/SCSS.json"(u, l) {
        l.exports = { name: "SCSS", type: "markup", color: "#c6538c", tmScope: "source.css.scss", aceMode: "scss", codemirrorMode: "css", codemirrorMimeType: "text/x-scss", extensions: [".scss"], languageId: 329 };
      } }), xo = X({ "src/language-css/index.js"(u, l) {
        H();
        var t = Zn(), s = ho(), i = Eo(), e = Co(), n = [t(Fo(), (o) => ({ since: "1.4.0", parsers: ["css"], vscodeLanguageIds: ["css"], extensions: [...o.extensions, ".wxss"] })), t(Ao(), () => ({ since: "1.4.0", parsers: ["css"], vscodeLanguageIds: ["postcss"] })), t(vo(), () => ({ since: "1.4.0", parsers: ["less"], vscodeLanguageIds: ["less"] })), t(bo(), () => ({ since: "1.4.0", parsers: ["scss"], vscodeLanguageIds: ["scss"] }))], r = { postcss: s };
        l.exports = { languages: n, options: i, printers: r, parsers: e };
      } }), So = X({ "src/language-handlebars/loc.js"(u, l) {
        H();
        function t(i) {
          return i.loc.start.offset;
        }
        function s(i) {
          return i.loc.end.offset;
        }
        l.exports = { locStart: t, locEnd: s };
      } }), Bo = X({ "src/language-handlebars/clean.js"(u, l) {
        H();
        function t(s, i) {
          if (s.type === "TextNode") {
            let e = s.chars.trim();
            if (!e)
              return null;
            i.chars = e.replace(/[\t\n\f\r ]+/g, " ");
          }
          s.type === "AttrNode" && s.name.toLowerCase() === "class" && delete i.value;
        }
        t.ignoredProperties = /* @__PURE__ */ new Set(["loc", "selfClosing"]), l.exports = t;
      } }), To = X({ "src/language-handlebars/html-void-elements.evaluate.js"(u, l) {
        l.exports = ["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"];
      } }), wo = X({ "src/language-handlebars/utils.js"(u, l) {
        H();
        var t = cn(), s = To();
        function i(S) {
          let j = S.getValue(), k = S.getParentNode(0);
          return !!(y(S, ["ElementNode"]) && t(k.children) === j || y(S, ["Block"]) && t(k.body) === j);
        }
        function e(S) {
          return S.toUpperCase() === S;
        }
        function n(S) {
          return m(S, ["ElementNode"]) && typeof S.tag == "string" && !S.tag.startsWith(":") && (e(S.tag[0]) || S.tag.includes("."));
        }
        var r = new Set(s);
        function o(S) {
          return r.has(S.toLowerCase()) && !e(S[0]);
        }
        function c(S) {
          return S.selfClosing === !0 || o(S.tag) || n(S) && S.children.every((j) => h(j));
        }
        function h(S) {
          return m(S, ["TextNode"]) && !/\S/.test(S.chars);
        }
        function m(S, j) {
          return S && j.includes(S.type);
        }
        function y(S, j) {
          let k = S.getParentNode(0);
          return m(k, j);
        }
        function p(S, j) {
          let k = w(S);
          return m(k, j);
        }
        function D(S, j) {
          let k = P(S);
          return m(k, j);
        }
        function C(S, j) {
          var k, J, f, B;
          let d = S.getValue(), F = (k = S.getParentNode(0)) !== null && k !== void 0 ? k : {}, a = (J = (f = (B = F.children) !== null && B !== void 0 ? B : F.body) !== null && f !== void 0 ? f : F.parts) !== null && J !== void 0 ? J : [], g = a.indexOf(d);
          return g !== -1 && a[g + j];
        }
        function w(S) {
          let j = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
          return C(S, -j);
        }
        function P(S) {
          return C(S, 1);
        }
        function A(S) {
          return m(S, ["MustacheCommentStatement"]) && typeof S.value == "string" && S.value.trim() === "prettier-ignore";
        }
        function N(S) {
          let j = S.getValue(), k = w(S, 2);
          return A(j) || A(k);
        }
        l.exports = { getNextNode: P, getPreviousNode: w, hasPrettierIgnore: N, isLastNodeOfSiblings: i, isNextNodeOfSomeType: D, isNodeOfSomeType: m, isParentOfSomeType: y, isPreviousNodeOfSomeType: p, isVoid: c, isWhitespaceNode: h };
      } }), No = X({ "src/language-handlebars/printer-glimmer.js"(u, l) {
        H();
        var { builders: { dedent: t, fill: s, group: i, hardline: e, ifBreak: n, indent: r, join: o, line: c, softline: h }, utils: { getDocParts: m, replaceTextEndOfLine: y } } = pt(), { getPreferredQuote: p, isNonEmptyArray: D } = bt(), { locStart: C, locEnd: w } = So(), P = Bo(), { getNextNode: A, getPreviousNode: N, hasPrettierIgnore: S, isLastNodeOfSiblings: j, isNextNodeOfSomeType: k, isNodeOfSomeType: J, isParentOfSomeType: f, isPreviousNodeOfSomeType: B, isVoid: d, isWhitespaceNode: F } = wo(), a = 2;
        function g(G, ye, K) {
          let fe = G.getValue();
          if (!fe)
            return "";
          if (S(G))
            return ye.originalText.slice(C(fe), w(fe));
          let Ve = ye.singleQuote ? "'" : '"';
          switch (fe.type) {
            case "Block":
            case "Program":
            case "Template":
              return i(G.map(K, "body"));
            case "ElementNode": {
              let Ie = i(b(G, K)), Ee = ye.htmlWhitespaceSensitivity === "ignore" && k(G, ["ElementNode"]) ? h : "";
              if (d(fe))
                return [Ie, Ee];
              let v = ["</", fe.tag, ">"];
              return fe.children.length === 0 ? [Ie, r(v), Ee] : ye.htmlWhitespaceSensitivity === "ignore" ? [Ie, r(x(G, ye, K)), e, r(v), Ee] : [Ie, r(i(x(G, ye, K))), r(v), Ee];
            }
            case "BlockStatement": {
              let Ie = G.getParentNode(1);
              return Ie && Ie.inverse && Ie.inverse.body.length === 1 && Ie.inverse.body[0] === fe && Ie.inverse.body[0].path.parts[0] === Ie.path.parts[0] ? [ae(G, K, Ie.inverse.body[0].path.parts[0]), me(G, K, ye), ge(G, K, ye)] : [O(G, K), i([me(G, K, ye), ge(G, K, ye), ne(G, K, ye)])];
            }
            case "ElementModifierStatement":
              return i(["{{", Dt(G, K), "}}"]);
            case "MustacheStatement":
              return i([I(fe), Dt(G, K), M(fe)]);
            case "SubExpression":
              return i(["(", mt(G, K), h, ")"]);
            case "AttrNode": {
              let Ie = fe.value.type === "TextNode";
              if (Ie && fe.value.chars === "" && C(fe.value) === w(fe.value))
                return fe.name;
              let Ee = Ie ? p(fe.value.chars, Ve).quote : fe.value.type === "ConcatStatement" ? p(fe.value.parts.filter((z) => z.type === "TextNode").map((z) => z.chars).join(""), Ve).quote : "", v = K("value");
              return [fe.name, "=", Ee, fe.name === "class" && Ee ? i(r(v)) : v, Ee];
            }
            case "ConcatStatement":
              return G.map(K, "parts");
            case "Hash":
              return o(c, G.map(K, "pairs"));
            case "HashPair":
              return [fe.key, "=", K("value")];
            case "TextNode": {
              let Ie = fe.chars.replace(/{{/g, "\\{{"), Ee = W(G);
              if (Ee) {
                if (Ee === "class") {
                  let qe = Ie.trim().split(/\s+/).join(" "), qt = !1, Je = !1;
                  return f(G, ["ConcatStatement"]) && (B(G, ["MustacheStatement"]) && /^\s/.test(Ie) && (qt = !0), k(G, ["MustacheStatement"]) && /\s$/.test(Ie) && qe !== "" && (Je = !0)), [qt ? c : "", qe, Je ? c : ""];
                }
                return y(Ie);
              }
              let v = /^[\t\n\f\r ]*$/.test(Ie), z = !N(G), se = !A(G);
              if (ye.htmlWhitespaceSensitivity !== "ignore") {
                let qe = /^[\t\n\f\r ]*/, qt = /[\t\n\f\r ]*$/, Je = se && f(G, ["Template"]), it = z && f(G, ["Template"]);
                if (v) {
                  if (it || Je)
                    return "";
                  let at = [c], De = re(Ie);
                  return De && (at = be(De)), j(G) && (at = at.map((wn) => t(wn))), at;
                }
                let [ft] = Ie.match(qe), [Lt] = Ie.match(qt), Ge = [];
                if (ft) {
                  Ge = [c];
                  let at = re(ft);
                  at && (Ge = be(at)), Ie = Ie.replace(qe, "");
                }
                let ct = [];
                if (Lt) {
                  if (!Je) {
                    ct = [c];
                    let at = re(Lt);
                    at && (ct = be(at)), j(G) && (ct = ct.map((De) => t(De)));
                  }
                  Ie = Ie.replace(qt, "");
                }
                return [...Ge, s(_e(Ie)), ...ct];
              }
              let Se = re(Ie), Pe = ue(Ie), Xe = Ce(Ie);
              if ((z || se) && v && f(G, ["Block", "ElementNode", "Template"]))
                return "";
              v && Se ? (Pe = Math.min(Se, a), Xe = 0) : (k(G, ["BlockStatement", "ElementNode"]) && (Xe = Math.max(Xe, 1)), B(G, ["BlockStatement", "ElementNode"]) && (Pe = Math.max(Pe, 1)));
              let Te = "", Wt = "";
              return Xe === 0 && k(G, ["MustacheStatement"]) && (Wt = " "), Pe === 0 && B(G, ["MustacheStatement"]) && (Te = " "), z && (Pe = 0, Te = ""), se && (Xe = 0, Wt = ""), Ie = Ie.replace(/^[\t\n\f\r ]+/g, Te).replace(/[\t\n\f\r ]+$/, Wt), [...be(Pe), s(_e(Ie)), ...be(Xe)];
            }
            case "MustacheCommentStatement": {
              let Ie = C(fe), Ee = w(fe), v = ye.originalText.charAt(Ie + 2) === "~", z = ye.originalText.charAt(Ee - 3) === "~", se = fe.value.includes("}}") ? "--" : "";
              return ["{{", v ? "~" : "", "!", se, fe.value, se, z ? "~" : "", "}}"];
            }
            case "PathExpression":
              return fe.original;
            case "BooleanLiteral":
              return String(fe.value);
            case "CommentStatement":
              return ["<!--", fe.value, "-->"];
            case "StringLiteral": {
              if (ze(G)) {
                let Ie = ye.singleQuote ? '"' : "'";
                return Be(fe.value, Ie);
              }
              return Be(fe.value, Ve);
            }
            case "NumberLiteral":
              return String(fe.value);
            case "UndefinedLiteral":
              return "undefined";
            case "NullLiteral":
              return "null";
            default:
              throw new Error("unknown glimmer type: " + JSON.stringify(fe.type));
          }
        }
        function E(G, ye) {
          return C(G) - C(ye);
        }
        function b(G, ye) {
          let K = G.getValue(), fe = ["attributes", "modifiers", "comments"].filter((Ie) => D(K[Ie])), Ve = fe.flatMap((Ie) => K[Ie]).sort(E);
          for (let Ie of fe)
            G.each((Ee) => {
              let v = Ve.indexOf(Ee.getValue());
              Ve.splice(v, 1, [c, ye()]);
            }, Ie);
          return D(K.blockParams) && Ve.push(c, ce(K)), ["<", K.tag, r(Ve), T(K)];
        }
        function x(G, ye, K) {
          let fe = G.getValue().children.every((Ve) => F(Ve));
          return ye.htmlWhitespaceSensitivity === "ignore" && fe ? "" : G.map((Ve, Ie) => {
            let Ee = K();
            return Ie === 0 && ye.htmlWhitespaceSensitivity === "ignore" ? [h, Ee] : Ee;
          }, "children");
        }
        function T(G) {
          return d(G) ? n([h, "/>"], [" />", h]) : n([h, ">"], ">");
        }
        function I(G) {
          let ye = G.escaped === !1 ? "{{{" : "{{", K = G.strip && G.strip.open ? "~" : "";
          return [ye, K];
        }
        function M(G) {
          let ye = G.escaped === !1 ? "}}}" : "}}";
          return [G.strip && G.strip.close ? "~" : "", ye];
        }
        function V(G) {
          let ye = I(G), K = G.openStrip.open ? "~" : "";
          return [ye, K, "#"];
        }
        function $(G) {
          let ye = M(G);
          return [G.openStrip.close ? "~" : "", ye];
        }
        function U(G) {
          let ye = I(G), K = G.closeStrip.open ? "~" : "";
          return [ye, K, "/"];
        }
        function _(G) {
          let ye = M(G);
          return [G.closeStrip.close ? "~" : "", ye];
        }
        function ee(G) {
          let ye = I(G), K = G.inverseStrip.open ? "~" : "";
          return [ye, K];
        }
        function R(G) {
          let ye = M(G);
          return [G.inverseStrip.close ? "~" : "", ye];
        }
        function O(G, ye) {
          let K = G.getValue(), fe = [], Ve = tt(G, ye);
          return Ve && fe.push(i(Ve)), D(K.program.blockParams) && fe.push(ce(K.program)), i([V(K), Ue(G, ye), fe.length > 0 ? r([c, o(c, fe)]) : "", h, $(K)]);
        }
        function Z(G, ye) {
          return [ye.htmlWhitespaceSensitivity === "ignore" ? e : "", ee(G), "else", R(G)];
        }
        function ae(G, ye, K) {
          let fe = G.getValue(), Ve = G.getParentNode(1);
          return i([ee(Ve), ["else", " ", K], r([c, i(tt(G, ye)), ...D(fe.program.blockParams) ? [c, ce(fe.program)] : []]), h, R(Ve)]);
        }
        function ne(G, ye, K) {
          let fe = G.getValue();
          return K.htmlWhitespaceSensitivity === "ignore" ? [he(fe) ? h : e, U(fe), ye("path"), _(fe)] : [U(fe), ye("path"), _(fe)];
        }
        function he(G) {
          return J(G, ["BlockStatement"]) && G.program.body.every((ye) => F(ye));
        }
        function q(G) {
          return Y(G) && G.inverse.body.length === 1 && J(G.inverse.body[0], ["BlockStatement"]) && G.inverse.body[0].path.parts[0] === G.path.parts[0];
        }
        function Y(G) {
          return J(G, ["BlockStatement"]) && G.inverse;
        }
        function me(G, ye, K) {
          let fe = G.getValue();
          if (he(fe))
            return "";
          let Ve = ye("program");
          return K.htmlWhitespaceSensitivity === "ignore" ? r([e, Ve]) : r(Ve);
        }
        function ge(G, ye, K) {
          let fe = G.getValue(), Ve = ye("inverse"), Ie = K.htmlWhitespaceSensitivity === "ignore" ? [e, Ve] : Ve;
          return q(fe) ? Ie : Y(fe) ? [Z(fe, K), r(Ie)] : "";
        }
        function _e(G) {
          return m(o(c, Q(G)));
        }
        function Q(G) {
          return G.split(/[\t\n\f\r ]+/);
        }
        function W(G) {
          for (let ye = 0; ye < 2; ye++) {
            let K = G.getParentNode(ye);
            if (K && K.type === "AttrNode")
              return K.name.toLowerCase();
          }
        }
        function re(G) {
          return G = typeof G == "string" ? G : "", G.split(`
`).length - 1;
        }
        function ue(G) {
          G = typeof G == "string" ? G : "";
          let ye = (G.match(/^([^\S\n\r]*[\n\r])+/g) || [])[0] || "";
          return re(ye);
        }
        function Ce(G) {
          G = typeof G == "string" ? G : "";
          let ye = (G.match(/([\n\r][^\S\n\r]*)+$/g) || [])[0] || "";
          return re(ye);
        }
        function be() {
          let G = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;
          return Array.from({ length: Math.min(G, a) }).fill(e);
        }
        function Be(G, ye) {
          let { quote: K, regex: fe } = p(G, ye);
          return [K, G.replace(fe, `\\${K}`), K];
        }
        function ze(G) {
          let ye = 0, K = G.getParentNode(ye);
          for (; K && J(K, ["SubExpression"]); )
            ye++, K = G.getParentNode(ye);
          return !!(K && J(G.getParentNode(ye + 1), ["ConcatStatement"]) && J(G.getParentNode(ye + 2), ["AttrNode"]));
        }
        function mt(G, ye) {
          let K = Ue(G, ye), fe = tt(G, ye);
          return fe ? r([K, c, i(fe)]) : K;
        }
        function Dt(G, ye) {
          let K = Ue(G, ye), fe = tt(G, ye);
          return fe ? [r([K, c, fe]), h] : K;
        }
        function Ue(G, ye) {
          return ye("path");
        }
        function tt(G, ye) {
          let K = G.getValue(), fe = [];
          if (K.params.length > 0) {
            let Ve = G.map(ye, "params");
            fe.push(...Ve);
          }
          if (K.hash && K.hash.pairs.length > 0) {
            let Ve = ye("hash");
            fe.push(Ve);
          }
          return fe.length === 0 ? "" : o(c, fe);
        }
        function ce(G) {
          return ["as |", G.blockParams.join(" "), "|"];
        }
        l.exports = { print: g, massageAstNode: P };
      } }), ko = X({ "src/language-handlebars/parsers.js"() {
        H();
      } }), Po = X({ "node_modules/linguist-languages/data/Handlebars.json"(u, l) {
        l.exports = { name: "Handlebars", type: "markup", color: "#f7931e", aliases: ["hbs", "htmlbars"], extensions: [".handlebars", ".hbs"], tmScope: "text.html.handlebars", aceMode: "handlebars", languageId: 155 };
      } }), jo = X({ "src/language-handlebars/index.js"(u, l) {
        H();
        var t = Zn(), s = No(), i = ko(), e = [t(Po(), () => ({ since: "2.3.0", parsers: ["glimmer"], vscodeLanguageIds: ["handlebars"] }))], n = { glimmer: s };
        l.exports = { languages: e, printers: n, parsers: i };
      } }), Io = X({ "src/language-graphql/pragma.js"(u, l) {
        H();
        function t(i) {
          return /^\s*#[^\S\n]*@(?:format|prettier)\s*(?:\n|$)/.test(i);
        }
        function s(i) {
          return `# @format

` + i;
        }
        l.exports = { hasPragma: t, insertPragma: s };
      } }), _o = X({ "src/language-graphql/loc.js"(u, l) {
        H();
        function t(i) {
          return typeof i.start == "number" ? i.start : i.loc && i.loc.start;
        }
        function s(i) {
          return typeof i.end == "number" ? i.end : i.loc && i.loc.end;
        }
        l.exports = { locStart: t, locEnd: s };
      } }), Lo = X({ "src/language-graphql/printer-graphql.js"(u, l) {
        H();
        var { builders: { join: t, hardline: s, line: i, softline: e, group: n, indent: r, ifBreak: o } } = pt(), { isNextLineEmpty: c, isNonEmptyArray: h } = bt(), { insertPragma: m } = Io(), { locStart: y, locEnd: p } = _o();
        function D(k, J, f) {
          let B = k.getValue();
          if (!B)
            return "";
          if (typeof B == "string")
            return B;
          switch (B.kind) {
            case "Document": {
              let d = [];
              return k.each((F, a, g) => {
                d.push(f()), a !== g.length - 1 && (d.push(s), c(J.originalText, F.getValue(), p) && d.push(s));
              }, "definitions"), [...d, s];
            }
            case "OperationDefinition": {
              let d = J.originalText[y(B)] !== "{", F = Boolean(B.name);
              return [d ? B.operation : "", d && F ? [" ", f("name")] : "", d && !F && h(B.variableDefinitions) ? " " : "", h(B.variableDefinitions) ? n(["(", r([e, t([o("", ", "), e], k.map(f, "variableDefinitions"))]), e, ")"]) : "", C(k, f, B), B.selectionSet ? !d && !F ? "" : " " : "", f("selectionSet")];
            }
            case "FragmentDefinition":
              return ["fragment ", f("name"), h(B.variableDefinitions) ? n(["(", r([e, t([o("", ", "), e], k.map(f, "variableDefinitions"))]), e, ")"]) : "", " on ", f("typeCondition"), C(k, f, B), " ", f("selectionSet")];
            case "SelectionSet":
              return ["{", r([s, t(s, w(k, J, f, "selections"))]), s, "}"];
            case "Field":
              return n([B.alias ? [f("alias"), ": "] : "", f("name"), B.arguments.length > 0 ? n(["(", r([e, t([o("", ", "), e], w(k, J, f, "arguments"))]), e, ")"]) : "", C(k, f, B), B.selectionSet ? " " : "", f("selectionSet")]);
            case "Name":
              return B.value;
            case "StringValue": {
              if (B.block) {
                let d = B.value.replace(/"""/g, "\\$&").split(`
`);
                return d.length === 1 && (d[0] = d[0].trim()), d.every((F) => F === "") && (d.length = 0), t(s, ['"""', ...d, '"""']);
              }
              return ['"', B.value.replace(/["\\]/g, "\\$&").replace(/\n/g, "\\n"), '"'];
            }
            case "IntValue":
            case "FloatValue":
            case "EnumValue":
              return B.value;
            case "BooleanValue":
              return B.value ? "true" : "false";
            case "NullValue":
              return "null";
            case "Variable":
              return ["$", f("name")];
            case "ListValue":
              return n(["[", r([e, t([o("", ", "), e], k.map(f, "values"))]), e, "]"]);
            case "ObjectValue":
              return n(["{", J.bracketSpacing && B.fields.length > 0 ? " " : "", r([e, t([o("", ", "), e], k.map(f, "fields"))]), e, o("", J.bracketSpacing && B.fields.length > 0 ? " " : ""), "}"]);
            case "ObjectField":
            case "Argument":
              return [f("name"), ": ", f("value")];
            case "Directive":
              return ["@", f("name"), B.arguments.length > 0 ? n(["(", r([e, t([o("", ", "), e], w(k, J, f, "arguments"))]), e, ")"]) : ""];
            case "NamedType":
              return f("name");
            case "VariableDefinition":
              return [f("variable"), ": ", f("type"), B.defaultValue ? [" = ", f("defaultValue")] : "", C(k, f, B)];
            case "ObjectTypeExtension":
            case "ObjectTypeDefinition":
              return [f("description"), B.description ? s : "", B.kind === "ObjectTypeExtension" ? "extend " : "", "type ", f("name"), B.interfaces.length > 0 ? [" implements ", ...N(k, J, f)] : "", C(k, f, B), B.fields.length > 0 ? [" {", r([s, t(s, w(k, J, f, "fields"))]), s, "}"] : ""];
            case "FieldDefinition":
              return [f("description"), B.description ? s : "", f("name"), B.arguments.length > 0 ? n(["(", r([e, t([o("", ", "), e], w(k, J, f, "arguments"))]), e, ")"]) : "", ": ", f("type"), C(k, f, B)];
            case "DirectiveDefinition":
              return [f("description"), B.description ? s : "", "directive ", "@", f("name"), B.arguments.length > 0 ? n(["(", r([e, t([o("", ", "), e], w(k, J, f, "arguments"))]), e, ")"]) : "", B.repeatable ? " repeatable" : "", " on ", t(" | ", k.map(f, "locations"))];
            case "EnumTypeExtension":
            case "EnumTypeDefinition":
              return [f("description"), B.description ? s : "", B.kind === "EnumTypeExtension" ? "extend " : "", "enum ", f("name"), C(k, f, B), B.values.length > 0 ? [" {", r([s, t(s, w(k, J, f, "values"))]), s, "}"] : ""];
            case "EnumValueDefinition":
              return [f("description"), B.description ? s : "", f("name"), C(k, f, B)];
            case "InputValueDefinition":
              return [f("description"), B.description ? B.description.block ? s : i : "", f("name"), ": ", f("type"), B.defaultValue ? [" = ", f("defaultValue")] : "", C(k, f, B)];
            case "InputObjectTypeExtension":
            case "InputObjectTypeDefinition":
              return [f("description"), B.description ? s : "", B.kind === "InputObjectTypeExtension" ? "extend " : "", "input ", f("name"), C(k, f, B), B.fields.length > 0 ? [" {", r([s, t(s, w(k, J, f, "fields"))]), s, "}"] : ""];
            case "SchemaExtension":
              return ["extend schema", C(k, f, B), ...B.operationTypes.length > 0 ? [" {", r([s, t(s, w(k, J, f, "operationTypes"))]), s, "}"] : []];
            case "SchemaDefinition":
              return [f("description"), B.description ? s : "", "schema", C(k, f, B), " {", B.operationTypes.length > 0 ? r([s, t(s, w(k, J, f, "operationTypes"))]) : "", s, "}"];
            case "OperationTypeDefinition":
              return [f("operation"), ": ", f("type")];
            case "InterfaceTypeExtension":
            case "InterfaceTypeDefinition":
              return [f("description"), B.description ? s : "", B.kind === "InterfaceTypeExtension" ? "extend " : "", "interface ", f("name"), B.interfaces.length > 0 ? [" implements ", ...N(k, J, f)] : "", C(k, f, B), B.fields.length > 0 ? [" {", r([s, t(s, w(k, J, f, "fields"))]), s, "}"] : ""];
            case "FragmentSpread":
              return ["...", f("name"), C(k, f, B)];
            case "InlineFragment":
              return ["...", B.typeCondition ? [" on ", f("typeCondition")] : "", C(k, f, B), " ", f("selectionSet")];
            case "UnionTypeExtension":
            case "UnionTypeDefinition":
              return n([f("description"), B.description ? s : "", n([B.kind === "UnionTypeExtension" ? "extend " : "", "union ", f("name"), C(k, f, B), B.types.length > 0 ? [" =", o("", " "), r([o([i, "  "]), t([i, "| "], k.map(f, "types"))])] : ""])]);
            case "ScalarTypeExtension":
            case "ScalarTypeDefinition":
              return [f("description"), B.description ? s : "", B.kind === "ScalarTypeExtension" ? "extend " : "", "scalar ", f("name"), C(k, f, B)];
            case "NonNullType":
              return [f("type"), "!"];
            case "ListType":
              return ["[", f("type"), "]"];
            default:
              throw new Error("unknown graphql type: " + JSON.stringify(B.kind));
          }
        }
        function C(k, J, f) {
          if (f.directives.length === 0)
            return "";
          let B = t(i, k.map(J, "directives"));
          return f.kind === "FragmentDefinition" || f.kind === "OperationDefinition" ? n([i, B]) : [" ", n(r([e, B]))];
        }
        function w(k, J, f, B) {
          return k.map((d, F, a) => {
            let g = f();
            return F < a.length - 1 && c(J.originalText, d.getValue(), p) ? [g, s] : g;
          }, B);
        }
        function P(k) {
          return k.kind && k.kind !== "Comment";
        }
        function A(k) {
          let J = k.getValue();
          if (J.kind === "Comment")
            return "#" + J.value.trimEnd();
          throw new Error("Not a comment: " + JSON.stringify(J));
        }
        function N(k, J, f) {
          let B = k.getNode(), d = [], { interfaces: F } = B, a = k.map((g) => f(g), "interfaces");
          for (let g = 0; g < F.length; g++) {
            let E = F[g];
            d.push(a[g]);
            let b = F[g + 1];
            if (b) {
              let x = J.originalText.slice(E.loc.end, b.loc.start), T = x.includes("#"), I = x.replace(/#.*/g, "").trim();
              d.push(I === "," ? "," : " &", T ? i : " ");
            }
          }
          return d;
        }
        function S(k, J) {
          k.kind === "StringValue" && k.block && !k.value.includes(`
`) && (J.value = J.value.trim());
        }
        S.ignoredProperties = /* @__PURE__ */ new Set(["loc", "comments"]);
        function j(k) {
          var J;
          let f = k.getValue();
          return f == null || (J = f.comments) === null || J === void 0 ? void 0 : J.some((B) => B.value.trim() === "prettier-ignore");
        }
        l.exports = { print: D, massageAstNode: S, hasPrettierIgnore: j, insertPragma: m, printComment: A, canAttachComment: P };
      } }), Oo = X({ "src/language-graphql/options.js"(u, l) {
        H();
        var t = pr();
        l.exports = { bracketSpacing: t.bracketSpacing };
      } }), Mo = X({ "src/language-graphql/parsers.js"() {
        H();
      } }), $o = X({ "node_modules/linguist-languages/data/GraphQL.json"(u, l) {
        l.exports = { name: "GraphQL", type: "data", color: "#e10098", extensions: [".graphql", ".gql", ".graphqls"], tmScope: "source.graphql", aceMode: "text", languageId: 139 };
      } }), Ro = X({ "src/language-graphql/index.js"(u, l) {
        H();
        var t = Zn(), s = Lo(), i = Oo(), e = Mo(), n = [t($o(), () => ({ since: "1.5.0", parsers: ["graphql"], vscodeLanguageIds: ["graphql"] }))], r = { graphql: s };
        l.exports = { languages: n, options: i, printers: r, parsers: e };
      } }), Ri = X({ "node_modules/collapse-white-space/index.js"(u, l) {
        H(), l.exports = t;
        function t(s) {
          return String(s).replace(/\s+/g, " ");
        }
      } }), Vi = X({ "src/language-markdown/loc.js"(u, l) {
        H();
        function t(i) {
          return i.position.start.offset;
        }
        function s(i) {
          return i.position.end.offset;
        }
        l.exports = { locStart: t, locEnd: s };
      } }), Vo = X({ "src/language-markdown/constants.evaluate.js"(u, l) {
        l.exports = { cjkPattern: "(?:[\\u02ea-\\u02eb\\u1100-\\u11ff\\u2e80-\\u2e99\\u2e9b-\\u2ef3\\u2f00-\\u2fd5\\u2ff0-\\u303f\\u3041-\\u3096\\u3099-\\u309f\\u30a1-\\u30fa\\u30fc-\\u30ff\\u3105-\\u312f\\u3131-\\u318e\\u3190-\\u3191\\u3196-\\u31ba\\u31c0-\\u31e3\\u31f0-\\u321e\\u322a-\\u3247\\u3260-\\u327e\\u328a-\\u32b0\\u32c0-\\u32cb\\u32d0-\\u3370\\u337b-\\u337f\\u33e0-\\u33fe\\u3400-\\u4db5\\u4e00-\\u9fef\\ua960-\\ua97c\\uac00-\\ud7a3\\ud7b0-\\ud7c6\\ud7cb-\\ud7fb\\uf900-\\ufa6d\\ufa70-\\ufad9\\ufe10-\\ufe1f\\ufe30-\\ufe6f\\uff00-\\uffef]|[\\ud840-\\ud868\\ud86a-\\ud86c\\ud86f-\\ud872\\ud874-\\ud879][\\udc00-\\udfff]|\\ud82c[\\udc00-\\udd1e\\udd50-\\udd52\\udd64-\\udd67]|\\ud83c[\\ude00\\ude50-\\ude51]|\\ud869[\\udc00-\\uded6\\udf00-\\udfff]|\\ud86d[\\udc00-\\udf34\\udf40-\\udfff]|\\ud86e[\\udc00-\\udc1d\\udc20-\\udfff]|\\ud873[\\udc00-\\udea1\\udeb0-\\udfff]|\\ud87a[\\udc00-\\udfe0]|\\ud87e[\\udc00-\\ude1d])(?:[\\ufe00-\\ufe0f]|\\udb40[\\udd00-\\uddef])?", kPattern: "[\\u1100-\\u11ff\\u3001-\\u3003\\u3008-\\u3011\\u3013-\\u301f\\u302e-\\u3030\\u3037\\u30fb\\u3131-\\u318e\\u3200-\\u321e\\u3260-\\u327e\\ua960-\\ua97c\\uac00-\\ud7a3\\ud7b0-\\ud7c6\\ud7cb-\\ud7fb\\ufe45-\\ufe46\\uff61-\\uff65\\uffa0-\\uffbe\\uffc2-\\uffc7\\uffca-\\uffcf\\uffd2-\\uffd7\\uffda-\\uffdc]", punctuationPattern: "[\\u0021-\\u002f\\u003a-\\u0040\\u005b-\\u0060\\u007b-\\u007e\\u00a1\\u00a7\\u00ab\\u00b6-\\u00b7\\u00bb\\u00bf\\u037e\\u0387\\u055a-\\u055f\\u0589-\\u058a\\u05be\\u05c0\\u05c3\\u05c6\\u05f3-\\u05f4\\u0609-\\u060a\\u060c-\\u060d\\u061b\\u061e-\\u061f\\u066a-\\u066d\\u06d4\\u0700-\\u070d\\u07f7-\\u07f9\\u0830-\\u083e\\u085e\\u0964-\\u0965\\u0970\\u09fd\\u0a76\\u0af0\\u0c77\\u0c84\\u0df4\\u0e4f\\u0e5a-\\u0e5b\\u0f04-\\u0f12\\u0f14\\u0f3a-\\u0f3d\\u0f85\\u0fd0-\\u0fd4\\u0fd9-\\u0fda\\u104a-\\u104f\\u10fb\\u1360-\\u1368\\u1400\\u166e\\u169b-\\u169c\\u16eb-\\u16ed\\u1735-\\u1736\\u17d4-\\u17d6\\u17d8-\\u17da\\u1800-\\u180a\\u1944-\\u1945\\u1a1e-\\u1a1f\\u1aa0-\\u1aa6\\u1aa8-\\u1aad\\u1b5a-\\u1b60\\u1bfc-\\u1bff\\u1c3b-\\u1c3f\\u1c7e-\\u1c7f\\u1cc0-\\u1cc7\\u1cd3\\u2010-\\u2027\\u2030-\\u2043\\u2045-\\u2051\\u2053-\\u205e\\u207d-\\u207e\\u208d-\\u208e\\u2308-\\u230b\\u2329-\\u232a\\u2768-\\u2775\\u27c5-\\u27c6\\u27e6-\\u27ef\\u2983-\\u2998\\u29d8-\\u29db\\u29fc-\\u29fd\\u2cf9-\\u2cfc\\u2cfe-\\u2cff\\u2d70\\u2e00-\\u2e2e\\u2e30-\\u2e4f\\u3001-\\u3003\\u3008-\\u3011\\u3014-\\u301f\\u3030\\u303d\\u30a0\\u30fb\\ua4fe-\\ua4ff\\ua60d-\\ua60f\\ua673\\ua67e\\ua6f2-\\ua6f7\\ua874-\\ua877\\ua8ce-\\ua8cf\\ua8f8-\\ua8fa\\ua8fc\\ua92e-\\ua92f\\ua95f\\ua9c1-\\ua9cd\\ua9de-\\ua9df\\uaa5c-\\uaa5f\\uaade-\\uaadf\\uaaf0-\\uaaf1\\uabeb\\ufd3e-\\ufd3f\\ufe10-\\ufe19\\ufe30-\\ufe52\\ufe54-\\ufe61\\ufe63\\ufe68\\ufe6a-\\ufe6b\\uff01-\\uff03\\uff05-\\uff0a\\uff0c-\\uff0f\\uff1a-\\uff1b\\uff1f-\\uff20\\uff3b-\\uff3d\\uff3f\\uff5b\\uff5d\\uff5f-\\uff65]|\\ud800[\\udd00-\\udd02\\udf9f\\udfd0]|\\ud801[\\udd6f]|\\ud802[\\udc57\\udd1f\\udd3f\\ude50-\\ude58\\ude7f\\udef0-\\udef6\\udf39-\\udf3f\\udf99-\\udf9c]|\\ud803[\\udf55-\\udf59]|\\ud804[\\udc47-\\udc4d\\udcbb-\\udcbc\\udcbe-\\udcc1\\udd40-\\udd43\\udd74-\\udd75\\uddc5-\\uddc8\\uddcd\\udddb\\udddd-\\udddf\\ude38-\\ude3d\\udea9]|\\ud805[\\udc4b-\\udc4f\\udc5b\\udc5d\\udcc6\\uddc1-\\uddd7\\ude41-\\ude43\\ude60-\\ude6c\\udf3c-\\udf3e]|\\ud806[\\udc3b\\udde2\\ude3f-\\ude46\\ude9a-\\ude9c\\ude9e-\\udea2]|\\ud807[\\udc41-\\udc45\\udc70-\\udc71\\udef7-\\udef8\\udfff]|\\ud809[\\udc70-\\udc74]|\\ud81a[\\ude6e-\\ude6f\\udef5\\udf37-\\udf3b\\udf44]|\\ud81b[\\ude97-\\ude9a\\udfe2]|\\ud82f[\\udc9f]|\\ud836[\\ude87-\\ude8b]|\\ud83a[\\udd5e-\\udd5f]" };
      } }), Pu = X({ "src/language-markdown/utils.js"(u, l) {
        H();
        var { getLast: t } = bt(), { locStart: s, locEnd: i } = Vi(), { cjkPattern: e, kPattern: n, punctuationPattern: r } = Vo(), o = ["liquidNode", "inlineCode", "emphasis", "esComment", "strong", "delete", "wikiLink", "link", "linkReference", "image", "imageReference", "footnote", "footnoteReference", "sentence", "whitespace", "word", "break", "inlineMath"], c = [...o, "tableCell", "paragraph", "heading"], h = new RegExp(n), m = new RegExp(r);
        function y(A, N) {
          let S = "non-cjk", j = "cj-letter", k = "k-letter", J = "cjk-punctuation", f = [], B = (N.proseWrap === "preserve" ? A : A.replace(new RegExp(`(${e})
(${e})`, "g"), "$1$2")).split(/([\t\n ]+)/);
          for (let [F, a] of B.entries()) {
            if (F % 2 === 1) {
              f.push({ type: "whitespace", value: /\n/.test(a) ? `
` : " " });
              continue;
            }
            if ((F === 0 || F === B.length - 1) && a === "")
              continue;
            let g = a.split(new RegExp(`(${e})`));
            for (let [E, b] of g.entries())
              if (!((E === 0 || E === g.length - 1) && b === "")) {
                if (E % 2 === 0) {
                  b !== "" && d({ type: "word", value: b, kind: S, hasLeadingPunctuation: m.test(b[0]), hasTrailingPunctuation: m.test(t(b)) });
                  continue;
                }
                d(m.test(b) ? { type: "word", value: b, kind: J, hasLeadingPunctuation: !0, hasTrailingPunctuation: !0 } : { type: "word", value: b, kind: h.test(b) ? k : j, hasLeadingPunctuation: !1, hasTrailingPunctuation: !1 });
              }
          }
          return f;
          function d(F) {
            let a = t(f);
            a && a.type === "word" && (a.kind === S && F.kind === j && !a.hasTrailingPunctuation || a.kind === j && F.kind === S && !F.hasLeadingPunctuation ? f.push({ type: "whitespace", value: " " }) : !g(S, J) && ![a.value, F.value].some((E) => /\u3000/.test(E)) && f.push({ type: "whitespace", value: "" })), f.push(F);
            function g(E, b) {
              return a.kind === E && F.kind === b || a.kind === b && F.kind === E;
            }
          }
        }
        function p(A, N) {
          let [, S, j, k] = N.slice(A.position.start.offset, A.position.end.offset).match(/^\s*(\d+)(\.|\))(\s*)/);
          return { numberText: S, marker: j, leadingSpaces: k };
        }
        function D(A, N) {
          if (!A.ordered || A.children.length < 2)
            return !1;
          let S = Number(p(A.children[0], N.originalText).numberText), j = Number(p(A.children[1], N.originalText).numberText);
          if (S === 0 && A.children.length > 2) {
            let k = Number(p(A.children[2], N.originalText).numberText);
            return j === 1 && k === 1;
          }
          return j === 1;
        }
        function C(A, N) {
          let { value: S } = A;
          return A.position.end.offset === N.length && S.endsWith(`
`) && N.endsWith(`
`) ? S.slice(0, -1) : S;
        }
        function w(A, N) {
          return function S(j, k, J) {
            let f = Object.assign({}, N(j, k, J));
            return f.children && (f.children = f.children.map((B, d) => S(B, d, [f, ...J]))), f;
          }(A, null, []);
        }
        function P(A) {
          if ((A == null ? void 0 : A.type) !== "link" || A.children.length !== 1)
            return !1;
          let [N] = A.children;
          return s(A) === s(N) && i(A) === i(N);
        }
        l.exports = { mapAst: w, splitText: y, punctuationPattern: r, getFencedCodeBlockValue: C, getOrderedListItemInfo: p, hasGitDiffFriendlyOrderedList: D, INLINE_NODE_TYPES: o, INLINE_NODE_WRAPPER_TYPES: c, isAutolink: P };
      } }), Jo = X({ "src/language-markdown/embed.js"(u, l) {
        H();
        var { inferParserByLanguage: t, getMaxContinuousCount: s } = bt(), { builders: { hardline: i, markAsRoot: e }, utils: { replaceEndOfLine: n } } = pt(), r = ku(), { getFencedCodeBlockValue: o } = Pu();
        function c(h, m, y, p) {
          let D = h.getValue();
          if (D.type === "code" && D.lang !== null) {
            let C = t(D.lang, p);
            if (C) {
              let w = p.__inJsTemplate ? "~" : "`", P = w.repeat(Math.max(3, s(D.value, w) + 1)), A = { parser: C };
              D.lang === "tsx" && (A.filepath = "dummy.tsx");
              let N = y(o(D, p.originalText), A, { stripTrailingHardline: !0 });
              return e([P, D.lang, D.meta ? " " + D.meta : "", i, n(N), i, P]);
            }
          }
          switch (D.type) {
            case "front-matter":
              return r(D, y);
            case "importExport":
              return [y(D.value, { parser: "babel" }, { stripTrailingHardline: !0 }), i];
            case "jsx":
              return y(`<$>${D.value}</$>`, { parser: "__js_expression", rootMarker: "mdx" }, { stripTrailingHardline: !0 });
          }
          return null;
        }
        l.exports = c;
      } }), Ji = X({ "src/language-markdown/pragma.js"(u, l) {
        H();
        var t = $i(), s = ["format", "prettier"];
        function i(e) {
          let n = `@(${s.join("|")})`, r = new RegExp([`<!--\\s*${n}\\s*-->`, `{\\s*\\/\\*\\s*${n}\\s*\\*\\/\\s*}`, `<!--.*\r?
[\\s\\S]*(^|
)[^\\S
]*${n}[^\\S
]*($|
)[\\s\\S]*
.*-->`].join("|"), "m"), o = e.match(r);
          return (o == null ? void 0 : o.index) === 0;
        }
        l.exports = { startWithPragma: i, hasPragma: (e) => i(t(e).content.trimStart()), insertPragma: (e) => {
          let n = t(e), r = `<!-- @${s[0]} -->`;
          return n.frontMatter ? `${n.frontMatter.raw}

${r}

${n.content}` : `${r}

${n.content}`;
        } };
      } }), qo = X({ "src/language-markdown/print-preprocess.js"(u, l) {
        H();
        var t = cn(), { getOrderedListItemInfo: s, mapAst: i, splitText: e } = Pu(), n = /^.$/su;
        function r(P, A) {
          return P = h(P, A), P = p(P), P = c(P, A), P = C(P, A), P = w(P, A), P = D(P, A), P = o(P), P = m(P), P;
        }
        function o(P) {
          return i(P, (A) => A.type !== "import" && A.type !== "export" ? A : Object.assign(Object.assign({}, A), {}, { type: "importExport" }));
        }
        function c(P, A) {
          return i(P, (N) => N.type !== "inlineCode" || A.proseWrap === "preserve" ? N : Object.assign(Object.assign({}, N), {}, { value: N.value.replace(/\s+/g, " ") }));
        }
        function h(P, A) {
          return i(P, (N) => N.type !== "text" || N.value === "*" || N.value === "_" || !n.test(N.value) || N.position.end.offset - N.position.start.offset === N.value.length ? N : Object.assign(Object.assign({}, N), {}, { value: A.originalText.slice(N.position.start.offset, N.position.end.offset) }));
        }
        function m(P) {
          return y(P, (A, N) => A.type === "importExport" && N.type === "importExport", (A, N) => ({ type: "importExport", value: A.value + `

` + N.value, position: { start: A.position.start, end: N.position.end } }));
        }
        function y(P, A, N) {
          return i(P, (S) => {
            if (!S.children)
              return S;
            let j = S.children.reduce((k, J) => {
              let f = t(k);
              return f && A(f, J) ? k.splice(-1, 1, N(f, J)) : k.push(J), k;
            }, []);
            return Object.assign(Object.assign({}, S), {}, { children: j });
          });
        }
        function p(P) {
          return y(P, (A, N) => A.type === "text" && N.type === "text", (A, N) => ({ type: "text", value: A.value + N.value, position: { start: A.position.start, end: N.position.end } }));
        }
        function D(P, A) {
          return i(P, (N, S, j) => {
            let [k] = j;
            if (N.type !== "text")
              return N;
            let { value: J } = N;
            return k.type === "paragraph" && (S === 0 && (J = J.trimStart()), S === k.children.length - 1 && (J = J.trimEnd())), { type: "sentence", position: N.position, children: e(J, A) };
          });
        }
        function C(P, A) {
          return i(P, (N, S, j) => {
            if (N.type === "code") {
              let k = /^\n?(?: {4,}|\t)/.test(A.originalText.slice(N.position.start.offset, N.position.end.offset));
              if (N.isIndented = k, k)
                for (let J = 0; J < j.length; J++) {
                  let f = j[J];
                  if (f.hasIndentedCodeblock)
                    break;
                  f.type === "list" && (f.hasIndentedCodeblock = !0);
                }
            }
            return N;
          });
        }
        function w(P, A) {
          return i(P, (j, k, J) => {
            if (j.type === "list" && j.children.length > 0) {
              for (let f = 0; f < J.length; f++) {
                let B = J[f];
                if (B.type === "list" && !B.isAligned)
                  return j.isAligned = !1, j;
              }
              j.isAligned = S(j);
            }
            return j;
          });
          function N(j) {
            return j.children.length === 0 ? -1 : j.children[0].position.start.column - 1;
          }
          function S(j) {
            if (!j.ordered)
              return !0;
            let [k, J] = j.children;
            if (s(k, A.originalText).leadingSpaces.length > 1)
              return !0;
            let f = N(k);
            if (f === -1)
              return !1;
            if (j.children.length === 1)
              return f % A.tabWidth === 0;
            let B = N(J);
            return f !== B ? !1 : f % A.tabWidth === 0 ? !0 : s(J, A.originalText).leadingSpaces.length > 1;
          }
        }
        l.exports = r;
      } }), Go = X({ "src/language-markdown/clean.js"(u, l) {
        H();
        var t = Ri(), { isFrontMatterNode: s } = bt(), { startWithPragma: i } = Ji(), e = /* @__PURE__ */ new Set(["position", "raw"]);
        function n(r, o, c) {
          if ((r.type === "front-matter" || r.type === "code" || r.type === "yaml" || r.type === "import" || r.type === "export" || r.type === "jsx") && delete o.value, r.type === "list" && delete o.isAligned, (r.type === "list" || r.type === "listItem") && (delete o.spread, delete o.loose), r.type === "text" || (r.type === "inlineCode" && (o.value = r.value.replace(/[\t\n ]+/g, " ")), r.type === "wikiLink" && (o.value = r.value.trim().replace(/[\t\n]+/g, " ")), (r.type === "definition" || r.type === "linkReference" || r.type === "imageReference") && (o.label = t(r.label)), (r.type === "definition" || r.type === "link" || r.type === "image") && r.title && (o.title = r.title.replace(/\\(["')])/g, "$1")), c && c.type === "root" && c.children.length > 0 && (c.children[0] === r || s(c.children[0]) && c.children[1] === r) && r.type === "html" && i(r.value)))
            return null;
        }
        n.ignoredProperties = e, l.exports = n;
      } }), Wo = X({ "src/language-markdown/printer-markdown.js"(u, l) {
        H();
        var t = Ri(), { getLast: s, getMinNotPresentContinuousCount: i, getMaxContinuousCount: e, getStringWidth: n, isNonEmptyArray: r } = bt(), { builders: { breakParent: o, join: c, line: h, literalline: m, markAsRoot: y, hardline: p, softline: D, ifBreak: C, fill: w, align: P, indent: A, group: N, hardlineWithoutBreakParent: S }, utils: { normalizeDoc: j, replaceTextEndOfLine: k }, printer: { printDocToString: J } } = pt(), f = Jo(), { insertPragma: B } = Ji(), { locStart: d, locEnd: F } = Vi(), a = qo(), g = Go(), { getFencedCodeBlockValue: E, hasGitDiffFriendlyOrderedList: b, splitText: x, punctuationPattern: T, INLINE_NODE_TYPES: I, INLINE_NODE_WRAPPER_TYPES: M, isAutolink: V } = Pu(), $ = /* @__PURE__ */ new Set(["importExport"]), U = ["heading", "tableCell", "link", "wikiLink"], _ = /* @__PURE__ */ new Set(["listItem", "definition", "footnoteDefinition"]);
        function ee(ce, G, ye) {
          let K = ce.getValue();
          if (be(ce))
            return x(G.originalText.slice(K.position.start.offset, K.position.end.offset), G).map((fe) => fe.type === "word" ? fe.value : fe.value === "" ? "" : q(ce, fe.value, G));
          switch (K.type) {
            case "front-matter":
              return G.originalText.slice(K.position.start.offset, K.position.end.offset);
            case "root":
              return K.children.length === 0 ? "" : [j(me(ce, G, ye)), $.has(Q(K).type) ? "" : p];
            case "paragraph":
              return ge(ce, G, ye, { postprocessor: w });
            case "sentence":
              return ge(ce, G, ye);
            case "word": {
              let fe = K.value.replace(/\*/g, "\\$&").replace(new RegExp([`(^|${T})(_+)`, `(_+)(${T}|$)`].join("|"), "g"), (Ee, v, z, se, Se) => (z ? `${v}${z}` : `${se}${Se}`).replace(/_/g, "\\_")), Ve = (Ee, v, z) => Ee.type === "sentence" && z === 0, Ie = (Ee, v, z) => V(Ee.children[z - 1]);
              return fe !== K.value && (ce.match(void 0, Ve, Ie) || ce.match(void 0, Ve, (Ee, v, z) => Ee.type === "emphasis" && z === 0, Ie)) && (fe = fe.replace(/^(\\?[*_])+/, (Ee) => Ee.replace(/\\/g, ""))), fe;
            }
            case "whitespace": {
              let fe = ce.getParentNode(), Ve = fe.children.indexOf(K), Ie = fe.children[Ve + 1], Ee = Ie && /^>|^(?:[*+-]|#{1,6}|\d+[).])$/.test(Ie.value) ? "never" : G.proseWrap;
              return q(ce, K.value, { proseWrap: Ee });
            }
            case "emphasis": {
              let fe;
              if (V(K.children[0]))
                fe = G.originalText[K.position.start.offset];
              else {
                let Ve = ce.getParentNode(), Ie = Ve.children.indexOf(K), Ee = Ve.children[Ie - 1], v = Ve.children[Ie + 1];
                fe = Ee && Ee.type === "sentence" && Ee.children.length > 0 && s(Ee.children).type === "word" && !s(Ee.children).hasTrailingPunctuation || v && v.type === "sentence" && v.children.length > 0 && v.children[0].type === "word" && !v.children[0].hasLeadingPunctuation || he(ce, "emphasis") ? "*" : "_";
              }
              return [fe, ge(ce, G, ye), fe];
            }
            case "strong":
              return ["**", ge(ce, G, ye), "**"];
            case "delete":
              return ["~~", ge(ce, G, ye), "~~"];
            case "inlineCode": {
              let fe = i(K.value, "`"), Ve = "`".repeat(fe || 1), Ie = fe && !/^\s/.test(K.value) ? " " : "";
              return [Ve, Ie, K.value, Ie, Ve];
            }
            case "wikiLink": {
              let fe = "";
              return G.proseWrap === "preserve" ? fe = K.value : fe = K.value.replace(/[\t\n]+/g, " "), ["[[", fe, "]]"];
            }
            case "link":
              switch (G.originalText[K.position.start.offset]) {
                case "<": {
                  let fe = "mailto:";
                  return ["<", K.url.startsWith(fe) && G.originalText.slice(K.position.start.offset + 1, K.position.start.offset + 1 + fe.length) !== fe ? K.url.slice(fe.length) : K.url, ">"];
                }
                case "[":
                  return ["[", ge(ce, G, ye), "](", Be(K.url, ")"), ze(K.title, G), ")"];
                default:
                  return G.originalText.slice(K.position.start.offset, K.position.end.offset);
              }
            case "image":
              return ["![", K.alt || "", "](", Be(K.url, ")"), ze(K.title, G), ")"];
            case "blockquote":
              return ["> ", P("> ", ge(ce, G, ye))];
            case "heading":
              return ["#".repeat(K.depth) + " ", ge(ce, G, ye)];
            case "code": {
              if (K.isIndented) {
                let Ie = " ".repeat(4);
                return P(Ie, [Ie, ...k(K.value, p)]);
              }
              let fe = G.__inJsTemplate ? "~" : "`", Ve = fe.repeat(Math.max(3, e(K.value, fe) + 1));
              return [Ve, K.lang || "", K.meta ? " " + K.meta : "", p, ...k(E(K, G.originalText), p), p, Ve];
            }
            case "html": {
              let fe = ce.getParentNode(), Ve = fe.type === "root" && s(fe.children) === K ? K.value.trimEnd() : K.value, Ie = /^<!--.*-->$/s.test(Ve);
              return k(Ve, Ie ? p : y(m));
            }
            case "list": {
              let fe = Z(K, ce.getParentNode()), Ve = b(K, G);
              return ge(ce, G, ye, { processor: (Ie, Ee) => {
                let v = se(), z = Ie.getValue();
                if (z.children.length === 2 && z.children[1].type === "html" && z.children[0].position.start.column !== z.children[1].position.start.column)
                  return [v, R(Ie, G, ye, v)];
                return [v, P(" ".repeat(v.length), R(Ie, G, ye, v))];
                function se() {
                  let Se = K.ordered ? (Ee === 0 ? K.start : Ve ? 1 : K.start + Ee) + (fe % 2 === 0 ? ". " : ") ") : fe % 2 === 0 ? "- " : "* ";
                  return K.isAligned || K.hasIndentedCodeblock ? O(Se, G) : Se;
                }
              } });
            }
            case "thematicBreak": {
              let fe = ne(ce, "list");
              return fe === -1 ? "---" : Z(ce.getParentNode(fe), ce.getParentNode(fe + 1)) % 2 === 0 ? "***" : "---";
            }
            case "linkReference":
              return ["[", ge(ce, G, ye), "]", K.referenceType === "full" ? Ue(K) : K.referenceType === "collapsed" ? "[]" : ""];
            case "imageReference":
              switch (K.referenceType) {
                case "full":
                  return ["![", K.alt || "", "]", Ue(K)];
                default:
                  return ["![", K.alt, "]", K.referenceType === "collapsed" ? "[]" : ""];
              }
            case "definition": {
              let fe = G.proseWrap === "always" ? h : " ";
              return N([Ue(K), ":", A([fe, Be(K.url), K.title === null ? "" : [fe, ze(K.title, G, !1)]])]);
            }
            case "footnote":
              return ["[^", ge(ce, G, ye), "]"];
            case "footnoteReference":
              return tt(K);
            case "footnoteDefinition": {
              let fe = ce.getParentNode().children[ce.getName() + 1], Ve = K.children.length === 1 && K.children[0].type === "paragraph" && (G.proseWrap === "never" || G.proseWrap === "preserve" && K.children[0].position.start.line === K.children[0].position.end.line);
              return [tt(K), ": ", Ve ? ge(ce, G, ye) : N([P(" ".repeat(4), ge(ce, G, ye, { processor: (Ie, Ee) => Ee === 0 ? N([D, ye()]) : ye() })), fe && fe.type === "footnoteDefinition" ? D : ""])];
            }
            case "table":
              return Y(ce, G, ye);
            case "tableCell":
              return ge(ce, G, ye);
            case "break":
              return /\s/.test(G.originalText[K.position.start.offset]) ? ["  ", y(m)] : ["\\", p];
            case "liquidNode":
              return k(K.value, p);
            case "importExport":
              return [K.value, p];
            case "esComment":
              return ["{/* ", K.value, " */}"];
            case "jsx":
              return K.value;
            case "math":
              return ["$$", p, K.value ? [...k(K.value, p), p] : "", "$$"];
            case "inlineMath":
              return G.originalText.slice(d(K), F(K));
            case "tableRow":
            case "listItem":
            default:
              throw new Error(`Unknown markdown type ${JSON.stringify(K.type)}`);
          }
        }
        function R(ce, G, ye, K) {
          let fe = ce.getValue(), Ve = fe.checked === null ? "" : fe.checked ? "[x] " : "[ ] ";
          return [Ve, ge(ce, G, ye, { processor: (Ie, Ee) => {
            if (Ee === 0 && Ie.getValue().type !== "list")
              return P(" ".repeat(Ve.length), ye());
            let v = " ".repeat(mt(G.tabWidth - K.length, 0, 3));
            return [v, P(v, ye())];
          } })];
        }
        function O(ce, G) {
          let ye = K();
          return ce + " ".repeat(ye >= 4 ? 0 : ye);
          function K() {
            let fe = ce.length % G.tabWidth;
            return fe === 0 ? 0 : G.tabWidth - fe;
          }
        }
        function Z(ce, G) {
          return ae(ce, G, (ye) => ye.ordered === ce.ordered);
        }
        function ae(ce, G, ye) {
          let K = -1;
          for (let fe of G.children)
            if (fe.type === ce.type && ye(fe) ? K++ : K = -1, fe === ce)
              return K;
        }
        function ne(ce, G) {
          let ye = Array.isArray(G) ? G : [G], K = -1, fe;
          for (; fe = ce.getParentNode(++K); )
            if (ye.includes(fe.type))
              return K;
          return -1;
        }
        function he(ce, G) {
          let ye = ne(ce, G);
          return ye === -1 ? null : ce.getParentNode(ye);
        }
        function q(ce, G, ye) {
          if (ye.proseWrap === "preserve" && G === `
`)
            return p;
          let K = ye.proseWrap === "always" && !he(ce, U);
          return G !== "" ? K ? h : " " : K ? D : "";
        }
        function Y(ce, G, ye) {
          let K = ce.getValue(), fe = [], Ve = ce.map((Se) => Se.map((Pe, Xe) => {
            let Te = J(ye(), G).formatted, Wt = n(Te);
            return fe[Xe] = Math.max(fe[Xe] || 3, Wt), { text: Te, width: Wt };
          }, "children"), "children"), Ie = v(!1);
          if (G.proseWrap !== "never")
            return [o, Ie];
          let Ee = v(!0);
          return [o, N(C(Ee, Ie))];
          function v(Se) {
            let Pe = [se(Ve[0], Se), z(Se)];
            return Ve.length > 1 && Pe.push(c(S, Ve.slice(1).map((Xe) => se(Xe, Se)))), c(S, Pe);
          }
          function z(Se) {
            return `| ${fe.map((Pe, Xe) => {
              let Te = K.align[Xe], Wt = Te === "center" || Te === "left" ? ":" : "-", qe = Te === "center" || Te === "right" ? ":" : "-", qt = Se ? "-" : "-".repeat(Pe - 2);
              return `${Wt}${qt}${qe}`;
            }).join(" | ")} |`;
          }
          function se(Se, Pe) {
            return `| ${Se.map((Xe, Te) => {
              let { text: Wt, width: qe } = Xe;
              if (Pe)
                return Wt;
              let qt = fe[Te] - qe, Je = K.align[Te], it = 0;
              Je === "right" ? it = qt : Je === "center" && (it = Math.floor(qt / 2));
              let ft = qt - it;
              return `${" ".repeat(it)}${Wt}${" ".repeat(ft)}`;
            }).join(" | ")} |`;
          }
        }
        function me(ce, G, ye) {
          let K = [], fe = null, { children: Ve } = ce.getValue();
          for (let [Ie, Ee] of Ve.entries())
            switch (W(Ee)) {
              case "start":
                fe === null && (fe = { index: Ie, offset: Ee.position.end.offset });
                break;
              case "end":
                fe !== null && (K.push({ start: fe, end: { index: Ie, offset: Ee.position.start.offset } }), fe = null);
                break;
            }
          return ge(ce, G, ye, { processor: (Ie, Ee) => {
            if (K.length > 0) {
              let v = K[0];
              if (Ee === v.start.index)
                return [_e(Ve[v.start.index]), G.originalText.slice(v.start.offset, v.end.offset), _e(Ve[v.end.index])];
              if (v.start.index < Ee && Ee < v.end.index)
                return !1;
              if (Ee === v.end.index)
                return K.shift(), !1;
            }
            return ye();
          } });
        }
        function ge(ce, G, ye) {
          let K = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, { postprocessor: fe } = K, Ve = K.processor || (() => ye()), Ie = ce.getValue(), Ee = [], v;
          return ce.each((z, se) => {
            let Se = z.getValue(), Pe = Ve(z, se);
            if (Pe !== !1) {
              let Xe = { parts: Ee, prevNode: v, parentNode: Ie, options: G };
              re(Se, Xe) && (Ee.push(p), v && $.has(v.type) || (ue(Se, Xe) || Ce(Se, Xe)) && Ee.push(p), Ce(Se, Xe) && Ee.push(p)), Ee.push(Pe), v = Se;
            }
          }, "children"), fe ? fe(Ee) : Ee;
        }
        function _e(ce) {
          if (ce.type === "html")
            return ce.value;
          if (ce.type === "paragraph" && Array.isArray(ce.children) && ce.children.length === 1 && ce.children[0].type === "esComment")
            return ["{/* ", ce.children[0].value, " */}"];
        }
        function Q(ce) {
          let G = ce;
          for (; r(G.children); )
            G = s(G.children);
          return G;
        }
        function W(ce) {
          let G;
          if (ce.type === "html")
            G = ce.value.match(/^<!--\s*prettier-ignore(?:-(start|end))?\s*-->$/);
          else {
            let ye;
            ce.type === "esComment" ? ye = ce : ce.type === "paragraph" && ce.children.length === 1 && ce.children[0].type === "esComment" && (ye = ce.children[0]), ye && (G = ye.value.match(/^prettier-ignore(?:-(start|end))?$/));
          }
          return G ? G[1] || "next" : !1;
        }
        function re(ce, G) {
          let ye = G.parts.length === 0, K = I.includes(ce.type), fe = ce.type === "html" && M.includes(G.parentNode.type);
          return !ye && !K && !fe;
        }
        function ue(ce, G) {
          var ye, K, fe;
          let Ve = (G.prevNode && G.prevNode.type) === ce.type && _.has(ce.type), Ie = G.parentNode.type === "listItem" && !G.parentNode.loose, Ee = ((ye = G.prevNode) === null || ye === void 0 ? void 0 : ye.type) === "listItem" && G.prevNode.loose, v = W(G.prevNode) === "next", z = ce.type === "html" && ((K = G.prevNode) === null || K === void 0 ? void 0 : K.type) === "html" && G.prevNode.position.end.line + 1 === ce.position.start.line, se = ce.type === "html" && G.parentNode.type === "listItem" && ((fe = G.prevNode) === null || fe === void 0 ? void 0 : fe.type) === "paragraph" && G.prevNode.position.end.line + 1 === ce.position.start.line;
          return Ee || !(Ve || Ie || v || z || se);
        }
        function Ce(ce, G) {
          let ye = G.prevNode && G.prevNode.type === "list", K = ce.type === "code" && ce.isIndented;
          return ye && K;
        }
        function be(ce) {
          let G = he(ce, ["linkReference", "imageReference"]);
          return G && (G.type !== "linkReference" || G.referenceType !== "full");
        }
        function Be(ce) {
          let G = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [], ye = [" ", ...Array.isArray(G) ? G : [G]];
          return new RegExp(ye.map((K) => `\\${K}`).join("|")).test(ce) ? `<${ce}>` : ce;
        }
        function ze(ce, G) {
          let ye = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
          if (!ce)
            return "";
          if (ye)
            return " " + ze(ce, G, !1);
          if (ce = ce.replace(/\\(["')])/g, "$1"), ce.includes('"') && ce.includes("'") && !ce.includes(")"))
            return `(${ce})`;
          let K = ce.split("'").length - 1, fe = ce.split('"').length - 1, Ve = K > fe ? '"' : fe > K || G.singleQuote ? "'" : '"';
          return ce = ce.replace(/\\/, "\\\\"), ce = ce.replace(new RegExp(`(${Ve})`, "g"), "\\$1"), `${Ve}${ce}${Ve}`;
        }
        function mt(ce, G, ye) {
          return ce < G ? G : ce > ye ? ye : ce;
        }
        function Dt(ce) {
          let G = Number(ce.getName());
          if (G === 0)
            return !1;
          let ye = ce.getParentNode().children[G - 1];
          return W(ye) === "next";
        }
        function Ue(ce) {
          return `[${t(ce.label)}]`;
        }
        function tt(ce) {
          return `[^${ce.label}]`;
        }
        l.exports = { preprocess: a, print: ee, embed: f, massageAstNode: g, hasPrettierIgnore: Dt, insertPragma: B };
      } }), Xo = X({ "src/language-markdown/options.js"(u, l) {
        H();
        var t = pr();
        l.exports = { proseWrap: t.proseWrap, singleQuote: t.singleQuote };
      } }), Uo = X({ "src/language-markdown/parsers.js"() {
        H();
      } }), qi = X({ "node_modules/linguist-languages/data/Markdown.json"(u, l) {
        l.exports = { name: "Markdown", type: "prose", color: "#083fa1", aliases: ["pandoc"], aceMode: "markdown", codemirrorMode: "gfm", codemirrorMimeType: "text/x-gfm", wrap: !0, extensions: [".md", ".livemd", ".markdown", ".mdown", ".mdwn", ".mdx", ".mkd", ".mkdn", ".mkdown", ".ronn", ".scd", ".workbook"], filenames: ["contents.lr"], tmScope: "source.gfm", languageId: 222 };
      } }), zo = X({ "src/language-markdown/index.js"(u, l) {
        H();
        var t = Zn(), s = Wo(), i = Xo(), e = Uo(), n = [t(qi(), (o) => ({ since: "1.8.0", parsers: ["markdown"], vscodeLanguageIds: ["markdown"], filenames: [...o.filenames, "README"], extensions: o.extensions.filter((c) => c !== ".mdx") })), t(qi(), () => ({ name: "MDX", since: "1.15.0", parsers: ["mdx"], vscodeLanguageIds: ["mdx"], filenames: [], extensions: [".mdx"] }))], r = { mdast: s };
        l.exports = { languages: n, options: i, printers: r, parsers: e };
      } }), Yo = X({ "src/language-html/clean.js"(u, l) {
        H();
        var { isFrontMatterNode: t } = bt(), s = /* @__PURE__ */ new Set(["sourceSpan", "startSourceSpan", "endSourceSpan", "nameSpan", "valueSpan"]);
        function i(e, n) {
          if (e.type === "text" || e.type === "comment" || t(e) || e.type === "yaml" || e.type === "toml")
            return null;
          e.type === "attribute" && delete n.value, e.type === "docType" && delete n.value;
        }
        i.ignoredProperties = s, l.exports = i;
      } }), Ko = X({ "src/language-html/constants.evaluate.js"(u, l) {
        l.exports = { CSS_DISPLAY_TAGS: { area: "none", base: "none", basefont: "none", datalist: "none", head: "none", link: "none", meta: "none", noembed: "none", noframes: "none", param: "block", rp: "none", script: "block", source: "block", style: "none", template: "inline", track: "block", title: "none", html: "block", body: "block", address: "block", blockquote: "block", center: "block", div: "block", figure: "block", figcaption: "block", footer: "block", form: "block", header: "block", hr: "block", legend: "block", listing: "block", main: "block", p: "block", plaintext: "block", pre: "block", xmp: "block", slot: "contents", ruby: "ruby", rt: "ruby-text", article: "block", aside: "block", h1: "block", h2: "block", h3: "block", h4: "block", h5: "block", h6: "block", hgroup: "block", nav: "block", section: "block", dir: "block", dd: "block", dl: "block", dt: "block", ol: "block", ul: "block", li: "list-item", table: "table", caption: "table-caption", colgroup: "table-column-group", col: "table-column", thead: "table-header-group", tbody: "table-row-group", tfoot: "table-footer-group", tr: "table-row", td: "table-cell", th: "table-cell", fieldset: "block", button: "inline-block", details: "block", summary: "block", dialog: "block", meter: "inline-block", progress: "inline-block", object: "inline-block", video: "inline-block", audio: "inline-block", select: "inline-block", option: "block", optgroup: "block" }, CSS_DISPLAY_DEFAULT: "inline", CSS_WHITE_SPACE_TAGS: { listing: "pre", plaintext: "pre", pre: "pre", xmp: "pre", nobr: "nowrap", table: "initial", textarea: "pre-wrap" }, CSS_WHITE_SPACE_DEFAULT: "normal" };
      } }), Qo = X({ "src/language-html/utils/is-unknown-namespace.js"(u, l) {
        H();
        function t(s) {
          return s.type === "element" && !s.hasExplicitNamespace && !["html", "svg"].includes(s.namespace);
        }
        l.exports = t;
      } }), cr = X({ "src/language-html/utils/index.js"(u, l) {
        H();
        var { inferParserByLanguage: t, isFrontMatterNode: s } = bt(), { builders: { line: i, hardline: e, join: n }, utils: { getDocParts: r, replaceTextEndOfLine: o } } = pt(), { CSS_DISPLAY_TAGS: c, CSS_DISPLAY_DEFAULT: h, CSS_WHITE_SPACE_TAGS: m, CSS_WHITE_SPACE_DEFAULT: y } = Ko(), p = Qo(), D = /* @__PURE__ */ new Set(["	", `
`, "\f", "\r", " "]), C = (v) => v.replace(/^[\t\n\f\r ]+/, ""), w = (v) => v.replace(/[\t\n\f\r ]+$/, ""), P = (v) => C(w(v)), A = (v) => v.replace(/^[\t\f\r ]*\n/g, ""), N = (v) => A(w(v)), S = (v) => v.split(/[\t\n\f\r ]+/), j = (v) => v.match(/^[\t\n\f\r ]*/)[0], k = (v) => {
          let [, z, se, Se] = v.match(/^([\t\n\f\r ]*)(.*?)([\t\n\f\r ]*)$/s);
          return { leadingWhitespace: z, trailingWhitespace: Se, text: se };
        }, J = (v) => /[\t\n\f\r ]/.test(v);
        function f(v, z) {
          return !!(v.type === "ieConditionalComment" && v.lastChild && !v.lastChild.isSelfClosing && !v.lastChild.endSourceSpan || v.type === "ieConditionalComment" && !v.complete || ue(v) && v.children.some((se) => se.type !== "text" && se.type !== "interpolation") || K(v, z) && !a(v) && v.type !== "interpolation");
        }
        function B(v) {
          return v.type === "attribute" || !v.parent || !v.prev ? !1 : d(v.prev);
        }
        function d(v) {
          return v.type === "comment" && v.value.trim() === "prettier-ignore";
        }
        function F(v) {
          return v.type === "text" || v.type === "comment";
        }
        function a(v) {
          return v.type === "element" && (v.fullName === "script" || v.fullName === "style" || v.fullName === "svg:style" || p(v) && (v.name === "script" || v.name === "style"));
        }
        function g(v) {
          return v.children && !a(v);
        }
        function E(v) {
          return a(v) || v.type === "interpolation" || b(v);
        }
        function b(v) {
          return ze(v).startsWith("pre");
        }
        function x(v, z) {
          let se = Se();
          if (se && !v.prev && v.parent && v.parent.tagDefinition && v.parent.tagDefinition.ignoreFirstLf)
            return v.type === "interpolation";
          return se;
          function Se() {
            return s(v) ? !1 : (v.type === "text" || v.type === "interpolation") && v.prev && (v.prev.type === "text" || v.prev.type === "interpolation") ? !0 : !v.parent || v.parent.cssDisplay === "none" ? !1 : ue(v.parent) ? !0 : !(!v.prev && (v.parent.type === "root" || ue(v) && v.parent || a(v.parent) || G(v.parent, z) || !ge(v.parent.cssDisplay)) || v.prev && !W(v.prev.cssDisplay));
          }
        }
        function T(v, z) {
          return s(v) ? !1 : (v.type === "text" || v.type === "interpolation") && v.next && (v.next.type === "text" || v.next.type === "interpolation") ? !0 : !v.parent || v.parent.cssDisplay === "none" ? !1 : ue(v.parent) ? !0 : !(!v.next && (v.parent.type === "root" || ue(v) && v.parent || a(v.parent) || G(v.parent, z) || !_e(v.parent.cssDisplay)) || v.next && !Q(v.next.cssDisplay));
        }
        function I(v) {
          return re(v.cssDisplay) && !a(v);
        }
        function M(v) {
          return s(v) || v.next && v.sourceSpan.end && v.sourceSpan.end.line + 1 < v.next.sourceSpan.start.line;
        }
        function V(v) {
          return $(v) || v.type === "element" && v.children.length > 0 && (["body", "script", "style"].includes(v.name) || v.children.some((z) => ne(z))) || v.firstChild && v.firstChild === v.lastChild && v.firstChild.type !== "text" && R(v.firstChild) && (!v.lastChild.isTrailingSpaceSensitive || O(v.lastChild));
        }
        function $(v) {
          return v.type === "element" && v.children.length > 0 && (["html", "head", "ul", "ol", "select"].includes(v.name) || v.cssDisplay.startsWith("table") && v.cssDisplay !== "table-cell");
        }
        function U(v) {
          return Z(v) || v.prev && _(v.prev) || ee(v);
        }
        function _(v) {
          return Z(v) || v.type === "element" && v.fullName === "br" || ee(v);
        }
        function ee(v) {
          return R(v) && O(v);
        }
        function R(v) {
          return v.hasLeadingSpaces && (v.prev ? v.prev.sourceSpan.end.line < v.sourceSpan.start.line : v.parent.type === "root" || v.parent.startSourceSpan.end.line < v.sourceSpan.start.line);
        }
        function O(v) {
          return v.hasTrailingSpaces && (v.next ? v.next.sourceSpan.start.line > v.sourceSpan.end.line : v.parent.type === "root" || v.parent.endSourceSpan && v.parent.endSourceSpan.start.line > v.sourceSpan.end.line);
        }
        function Z(v) {
          switch (v.type) {
            case "ieConditionalComment":
            case "comment":
            case "directive":
              return !0;
            case "element":
              return ["script", "select"].includes(v.name);
          }
          return !1;
        }
        function ae(v) {
          return v.lastChild ? ae(v.lastChild) : v;
        }
        function ne(v) {
          return v.children && v.children.some((z) => z.type !== "text");
        }
        function he(v) {
          let { type: z, lang: se } = v.attrMap;
          if (z === "module" || z === "text/javascript" || z === "text/babel" || z === "application/javascript" || se === "jsx")
            return "babel";
          if (z === "application/x-typescript" || se === "ts" || se === "tsx")
            return "typescript";
          if (z === "text/markdown")
            return "markdown";
          if (z === "text/html")
            return "html";
          if (z && (z.endsWith("json") || z.endsWith("importmap")) || z === "speculationrules")
            return "json";
          if (z === "text/x-handlebars-template")
            return "glimmer";
        }
        function q(v, z) {
          let { lang: se } = v.attrMap;
          if (!se || se === "postcss" || se === "css")
            return "css";
          if (se === "scss")
            return "scss";
          if (se === "less")
            return "less";
          if (se === "stylus")
            return t("stylus", z);
        }
        function Y(v, z) {
          if (v.name === "script" && !v.attrMap.src)
            return !v.attrMap.lang && !v.attrMap.type ? "babel" : he(v);
          if (v.name === "style")
            return q(v, z);
          if (z && K(v, z))
            return he(v) || !("src" in v.attrMap) && t(v.attrMap.lang, z);
        }
        function me(v) {
          return v === "block" || v === "list-item" || v.startsWith("table");
        }
        function ge(v) {
          return !me(v) && v !== "inline-block";
        }
        function _e(v) {
          return !me(v) && v !== "inline-block";
        }
        function Q(v) {
          return !me(v);
        }
        function W(v) {
          return !me(v);
        }
        function re(v) {
          return !me(v) && v !== "inline-block";
        }
        function ue(v) {
          return ze(v).startsWith("pre");
        }
        function Ce(v, z) {
          let se = 0;
          for (let Se = v.stack.length - 1; Se >= 0; Se--) {
            let Pe = v.stack[Se];
            Pe && typeof Pe == "object" && !Array.isArray(Pe) && z(Pe) && se++;
          }
          return se;
        }
        function be(v, z) {
          let se = v;
          for (; se; ) {
            if (z(se))
              return !0;
            se = se.parent;
          }
          return !1;
        }
        function Be(v, z) {
          if (v.prev && v.prev.type === "comment") {
            let Se = v.prev.value.match(/^\s*display:\s*([a-z]+)\s*$/);
            if (Se)
              return Se[1];
          }
          let se = !1;
          if (v.type === "element" && v.namespace === "svg")
            if (be(v, (Se) => Se.fullName === "svg:foreignObject"))
              se = !0;
            else
              return v.name === "svg" ? "inline-block" : "block";
          switch (z.htmlWhitespaceSensitivity) {
            case "strict":
              return "inline";
            case "ignore":
              return "block";
            default:
              return z.parser === "vue" && v.parent && v.parent.type === "root" ? "block" : v.type === "element" && (!v.namespace || se || p(v)) && c[v.name] || h;
          }
        }
        function ze(v) {
          return v.type === "element" && (!v.namespace || p(v)) && m[v.name] || y;
        }
        function mt(v) {
          let z = Number.POSITIVE_INFINITY;
          for (let se of v.split(`
`)) {
            if (se.length === 0)
              continue;
            if (!D.has(se[0]))
              return 0;
            let Se = j(se).length;
            se.length !== Se && Se < z && (z = Se);
          }
          return z === Number.POSITIVE_INFINITY ? 0 : z;
        }
        function Dt(v) {
          let z = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : mt(v);
          return z === 0 ? v : v.split(`
`).map((se) => se.slice(z)).join(`
`);
        }
        function Ue(v, z) {
          let se = 0;
          for (let Se = 0; Se < v.length; Se++)
            v[Se] === z && se++;
          return se;
        }
        function tt(v) {
          return v.replace(/&apos;/g, "'").replace(/&quot;/g, '"');
        }
        var ce = /* @__PURE__ */ new Set(["template", "style", "script"]);
        function G(v, z) {
          return ye(v, z) && !ce.has(v.fullName);
        }
        function ye(v, z) {
          return z.parser === "vue" && v.type === "element" && v.parent.type === "root" && v.fullName.toLowerCase() !== "html";
        }
        function K(v, z) {
          return ye(v, z) && (G(v, z) || v.attrMap.lang && v.attrMap.lang !== "html");
        }
        function fe(v) {
          let z = v.fullName;
          return z.charAt(0) === "#" || z === "slot-scope" || z === "v-slot" || z.startsWith("v-slot:");
        }
        function Ve(v, z) {
          let se = v.parent;
          if (!ye(se, z))
            return !1;
          let Se = se.fullName, Pe = v.fullName;
          return Se === "script" && Pe === "setup" || Se === "style" && Pe === "vars";
        }
        function Ie(v) {
          let z = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : v.value;
          return v.parent.isWhitespaceSensitive ? v.parent.isIndentationSensitive ? o(z) : o(Dt(N(z)), e) : r(n(i, S(z)));
        }
        function Ee(v, z) {
          return ye(v, z) && v.name === "script";
        }
        l.exports = { htmlTrim: P, htmlTrimPreserveIndentation: N, hasHtmlWhitespace: J, getLeadingAndTrailingHtmlWhitespace: k, canHaveInterpolation: g, countChars: Ue, countParents: Ce, dedentString: Dt, forceBreakChildren: $, forceBreakContent: V, forceNextEmptyLine: M, getLastDescendant: ae, getNodeCssStyleDisplay: Be, getNodeCssStyleWhiteSpace: ze, hasPrettierIgnore: B, inferScriptParser: Y, isVueCustomBlock: G, isVueNonHtmlBlock: K, isVueScriptTag: Ee, isVueSlotAttribute: fe, isVueSfcBindingsAttribute: Ve, isVueSfcBlock: ye, isDanglingSpaceSensitiveNode: I, isIndentationSensitiveNode: b, isLeadingSpaceSensitiveNode: x, isPreLikeNode: ue, isScriptLikeTag: a, isTextLikeNode: F, isTrailingSpaceSensitiveNode: T, isWhitespaceSensitiveNode: E, isUnknownNamespace: p, preferHardlineAsLeadingSpaces: U, preferHardlineAsTrailingSpaces: _, shouldPreserveContent: f, unescapeQuoteEntities: tt, getTextValueParts: Ie };
      } }), Ho = X({ "node_modules/angular-html-parser/lib/compiler/src/chars.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 }), u.$EOF = 0, u.$BSPACE = 8, u.$TAB = 9, u.$LF = 10, u.$VTAB = 11, u.$FF = 12, u.$CR = 13, u.$SPACE = 32, u.$BANG = 33, u.$DQ = 34, u.$HASH = 35, u.$$ = 36, u.$PERCENT = 37, u.$AMPERSAND = 38, u.$SQ = 39, u.$LPAREN = 40, u.$RPAREN = 41, u.$STAR = 42, u.$PLUS = 43, u.$COMMA = 44, u.$MINUS = 45, u.$PERIOD = 46, u.$SLASH = 47, u.$COLON = 58, u.$SEMICOLON = 59, u.$LT = 60, u.$EQ = 61, u.$GT = 62, u.$QUESTION = 63, u.$0 = 48, u.$7 = 55, u.$9 = 57, u.$A = 65, u.$E = 69, u.$F = 70, u.$X = 88, u.$Z = 90, u.$LBRACKET = 91, u.$BACKSLASH = 92, u.$RBRACKET = 93, u.$CARET = 94, u.$_ = 95, u.$a = 97, u.$b = 98, u.$e = 101, u.$f = 102, u.$n = 110, u.$r = 114, u.$t = 116, u.$u = 117, u.$v = 118, u.$x = 120, u.$z = 122, u.$LBRACE = 123, u.$BAR = 124, u.$RBRACE = 125, u.$NBSP = 160, u.$PIPE = 124, u.$TILDA = 126, u.$AT = 64, u.$BT = 96;
        function l(r) {
          return r >= u.$TAB && r <= u.$SPACE || r == u.$NBSP;
        }
        u.isWhitespace = l;
        function t(r) {
          return u.$0 <= r && r <= u.$9;
        }
        u.isDigit = t;
        function s(r) {
          return r >= u.$a && r <= u.$z || r >= u.$A && r <= u.$Z;
        }
        u.isAsciiLetter = s;
        function i(r) {
          return r >= u.$a && r <= u.$f || r >= u.$A && r <= u.$F || t(r);
        }
        u.isAsciiHexDigit = i;
        function e(r) {
          return r === u.$LF || r === u.$CR;
        }
        u.isNewLine = e;
        function n(r) {
          return u.$0 <= r && r <= u.$7;
        }
        u.isOctalDigit = n;
      } }), Zo = X({ "node_modules/angular-html-parser/lib/compiler/src/aot/static_symbol.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = class {
          constructor(s, i, e) {
            this.filePath = s, this.name = i, this.members = e;
          }
          assertNoMembers() {
            if (this.members.length)
              throw new Error(`Illegal state: symbol without members expected, but got ${JSON.stringify(this)}.`);
          }
        };
        u.StaticSymbol = l;
        var t = class {
          constructor() {
            this.cache = /* @__PURE__ */ new Map();
          }
          get(s, i, e) {
            e = e || [];
            let n = e.length ? `.${e.join(".")}` : "", r = `"${s}".${i}${n}`, o = this.cache.get(r);
            return o || (o = new l(s, i, e), this.cache.set(r, o)), o;
          }
        };
        u.StaticSymbolCache = t;
      } }), el = X({ "node_modules/angular-html-parser/lib/compiler/src/util.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = /-+([a-z0-9])/g;
        function t(a) {
          return a.replace(l, function() {
            for (var g = arguments.length, E = new Array(g), b = 0; b < g; b++)
              E[b] = arguments[b];
            return E[1].toUpperCase();
          });
        }
        u.dashCaseToCamelCase = t;
        function s(a, g) {
          return e(a, ":", g);
        }
        u.splitAtColon = s;
        function i(a, g) {
          return e(a, ".", g);
        }
        u.splitAtPeriod = i;
        function e(a, g, E) {
          let b = a.indexOf(g);
          return b == -1 ? E : [a.slice(0, b).trim(), a.slice(b + 1).trim()];
        }
        function n(a, g, E) {
          return Array.isArray(a) ? g.visitArray(a, E) : A(a) ? g.visitStringMap(a, E) : a == null || typeof a == "string" || typeof a == "number" || typeof a == "boolean" ? g.visitPrimitive(a, E) : g.visitOther(a, E);
        }
        u.visitValue = n;
        function r(a) {
          return a != null;
        }
        u.isDefined = r;
        function o(a) {
          return a === void 0 ? null : a;
        }
        u.noUndefined = o;
        var c = class {
          visitArray(a, g) {
            return a.map((E) => n(E, this, g));
          }
          visitStringMap(a, g) {
            let E = {};
            return Object.keys(a).forEach((b) => {
              E[b] = n(a[b], this, g);
            }), E;
          }
          visitPrimitive(a, g) {
            return a;
          }
          visitOther(a, g) {
            return a;
          }
        };
        u.ValueTransformer = c, u.SyncAsync = { assertSync: (a) => {
          if (k(a))
            throw new Error("Illegal state: value cannot be a promise");
          return a;
        }, then: (a, g) => k(a) ? a.then(g) : g(a), all: (a) => a.some(k) ? Promise.all(a) : a };
        function h(a) {
          throw new Error(`Internal Error: ${a}`);
        }
        u.error = h;
        function m(a, g) {
          let E = Error(a);
          return E[y] = !0, g && (E[p] = g), E;
        }
        u.syntaxError = m;
        var y = "ngSyntaxError", p = "ngParseErrors";
        function D(a) {
          return a[y];
        }
        u.isSyntaxError = D;
        function C(a) {
          return a[p] || [];
        }
        u.getParseErrors = C;
        function w(a) {
          return a.replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1");
        }
        u.escapeRegExp = w;
        var P = Object.getPrototypeOf({});
        function A(a) {
          return typeof a == "object" && a !== null && Object.getPrototypeOf(a) === P;
        }
        function N(a) {
          let g = "";
          for (let E = 0; E < a.length; E++) {
            let b = a.charCodeAt(E);
            if (b >= 55296 && b <= 56319 && a.length > E + 1) {
              let x = a.charCodeAt(E + 1);
              x >= 56320 && x <= 57343 && (E++, b = (b - 55296 << 10) + x - 56320 + 65536);
            }
            b <= 127 ? g += String.fromCharCode(b) : b <= 2047 ? g += String.fromCharCode(b >> 6 & 31 | 192, b & 63 | 128) : b <= 65535 ? g += String.fromCharCode(b >> 12 | 224, b >> 6 & 63 | 128, b & 63 | 128) : b <= 2097151 && (g += String.fromCharCode(b >> 18 & 7 | 240, b >> 12 & 63 | 128, b >> 6 & 63 | 128, b & 63 | 128));
          }
          return g;
        }
        u.utf8Encode = N;
        function S(a) {
          if (typeof a == "string")
            return a;
          if (a instanceof Array)
            return "[" + a.map(S).join(", ") + "]";
          if (a == null)
            return "" + a;
          if (a.overriddenName)
            return `${a.overriddenName}`;
          if (a.name)
            return `${a.name}`;
          if (!a.toString)
            return "object";
          let g = a.toString();
          if (g == null)
            return "" + g;
          let E = g.indexOf(`
`);
          return E === -1 ? g : g.substring(0, E);
        }
        u.stringify = S;
        function j(a) {
          return typeof a == "function" && a.hasOwnProperty("__forward_ref__") ? a() : a;
        }
        u.resolveForwardRef = j;
        function k(a) {
          return !!a && typeof a.then == "function";
        }
        u.isPromise = k;
        var J = class {
          constructor(a) {
            this.full = a;
            let g = a.split(".");
            this.major = g[0], this.minor = g[1], this.patch = g.slice(2).join(".");
          }
        };
        u.Version = J;
        var f = typeof window < "u" && window, B = typeof self < "u" && typeof WorkerGlobalScope < "u" && self instanceof WorkerGlobalScope && self, d = typeof globalThis < "u" && globalThis, F = d || f || B;
        u.global = F;
      } }), tl = X({ "node_modules/angular-html-parser/lib/compiler/src/compile_metadata.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = Zo(), t = el(), s = /^(?:(?:\[([^\]]+)\])|(?:\(([^\)]+)\)))|(\@[-\w]+)$/;
        function i(E) {
          return E.replace(/\W/g, "_");
        }
        u.sanitizeIdentifier = i;
        var e = 0;
        function n(E) {
          if (!E || !E.reference)
            return null;
          let b = E.reference;
          if (b instanceof l.StaticSymbol)
            return b.name;
          if (b.__anonymousType)
            return b.__anonymousType;
          let x = t.stringify(b);
          return x.indexOf("(") >= 0 ? (x = `anonymous_${e++}`, b.__anonymousType = x) : x = i(x), x;
        }
        u.identifierName = n;
        function r(E) {
          let b = E.reference;
          return b instanceof l.StaticSymbol ? b.filePath : `./${t.stringify(b)}`;
        }
        u.identifierModuleUrl = r;
        function o(E, b) {
          return `View_${n({ reference: E })}_${b}`;
        }
        u.viewClassName = o;
        function c(E) {
          return `RenderType_${n({ reference: E })}`;
        }
        u.rendererTypeName = c;
        function h(E) {
          return `HostView_${n({ reference: E })}`;
        }
        u.hostViewClassName = h;
        function m(E) {
          return `${n({ reference: E })}NgFactory`;
        }
        u.componentFactoryName = m;
        var y;
        (function(E) {
          E[E.Pipe = 0] = "Pipe", E[E.Directive = 1] = "Directive", E[E.NgModule = 2] = "NgModule", E[E.Injectable = 3] = "Injectable";
        })(y = u.CompileSummaryKind || (u.CompileSummaryKind = {}));
        function p(E) {
          return E.value != null ? i(E.value) : n(E.identifier);
        }
        u.tokenName = p;
        function D(E) {
          return E.identifier != null ? E.identifier.reference : E.value;
        }
        u.tokenReference = D;
        var C = class {
          constructor() {
            let { moduleUrl: E, styles: b, styleUrls: x } = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
            this.moduleUrl = E || null, this.styles = k(b), this.styleUrls = k(x);
          }
        };
        u.CompileStylesheetMetadata = C;
        var w = class {
          constructor(E) {
            let { encapsulation: b, template: x, templateUrl: T, htmlAst: I, styles: M, styleUrls: V, externalStylesheets: $, animations: U, ngContentSelectors: _, interpolation: ee, isInline: R, preserveWhitespaces: O } = E;
            if (this.encapsulation = b, this.template = x, this.templateUrl = T, this.htmlAst = I, this.styles = k(M), this.styleUrls = k(V), this.externalStylesheets = k($), this.animations = U ? f(U) : [], this.ngContentSelectors = _ || [], ee && ee.length != 2)
              throw new Error("'interpolation' should have a start and an end symbol.");
            this.interpolation = ee, this.isInline = R, this.preserveWhitespaces = O;
          }
          toSummary() {
            return { ngContentSelectors: this.ngContentSelectors, encapsulation: this.encapsulation, styles: this.styles, animations: this.animations };
          }
        };
        u.CompileTemplateMetadata = w;
        var P = class {
          static create(E) {
            let { isHost: b, type: x, isComponent: T, selector: I, exportAs: M, changeDetection: V, inputs: $, outputs: U, host: _, providers: ee, viewProviders: R, queries: O, guards: Z, viewQueries: ae, entryComponents: ne, template: he, componentViewType: q, rendererType: Y, componentFactory: me } = E, ge = {}, _e = {}, Q = {};
            _ != null && Object.keys(_).forEach((ue) => {
              let Ce = _[ue], be = ue.match(s);
              be === null ? Q[ue] = Ce : be[1] != null ? _e[be[1]] = Ce : be[2] != null && (ge[be[2]] = Ce);
            });
            let W = {};
            $ != null && $.forEach((ue) => {
              let Ce = t.splitAtColon(ue, [ue, ue]);
              W[Ce[0]] = Ce[1];
            });
            let re = {};
            return U != null && U.forEach((ue) => {
              let Ce = t.splitAtColon(ue, [ue, ue]);
              re[Ce[0]] = Ce[1];
            }), new P({ isHost: b, type: x, isComponent: !!T, selector: I, exportAs: M, changeDetection: V, inputs: W, outputs: re, hostListeners: ge, hostProperties: _e, hostAttributes: Q, providers: ee, viewProviders: R, queries: O, guards: Z, viewQueries: ae, entryComponents: ne, template: he, componentViewType: q, rendererType: Y, componentFactory: me });
          }
          constructor(E) {
            let { isHost: b, type: x, isComponent: T, selector: I, exportAs: M, changeDetection: V, inputs: $, outputs: U, hostListeners: _, hostProperties: ee, hostAttributes: R, providers: O, viewProviders: Z, queries: ae, guards: ne, viewQueries: he, entryComponents: q, template: Y, componentViewType: me, rendererType: ge, componentFactory: _e } = E;
            this.isHost = !!b, this.type = x, this.isComponent = T, this.selector = I, this.exportAs = M, this.changeDetection = V, this.inputs = $, this.outputs = U, this.hostListeners = _, this.hostProperties = ee, this.hostAttributes = R, this.providers = k(O), this.viewProviders = k(Z), this.queries = k(ae), this.guards = ne, this.viewQueries = k(he), this.entryComponents = k(q), this.template = Y, this.componentViewType = me, this.rendererType = ge, this.componentFactory = _e;
          }
          toSummary() {
            return { summaryKind: y.Directive, type: this.type, isComponent: this.isComponent, selector: this.selector, exportAs: this.exportAs, inputs: this.inputs, outputs: this.outputs, hostListeners: this.hostListeners, hostProperties: this.hostProperties, hostAttributes: this.hostAttributes, providers: this.providers, viewProviders: this.viewProviders, queries: this.queries, guards: this.guards, viewQueries: this.viewQueries, entryComponents: this.entryComponents, changeDetection: this.changeDetection, template: this.template && this.template.toSummary(), componentViewType: this.componentViewType, rendererType: this.rendererType, componentFactory: this.componentFactory };
          }
        };
        u.CompileDirectiveMetadata = P;
        var A = class {
          constructor(E) {
            let { type: b, name: x, pure: T } = E;
            this.type = b, this.name = x, this.pure = !!T;
          }
          toSummary() {
            return { summaryKind: y.Pipe, type: this.type, name: this.name, pure: this.pure };
          }
        };
        u.CompilePipeMetadata = A;
        var N = class {
        };
        u.CompileShallowModuleMetadata = N;
        var S = class {
          constructor(E) {
            let { type: b, providers: x, declaredDirectives: T, exportedDirectives: I, declaredPipes: M, exportedPipes: V, entryComponents: $, bootstrapComponents: U, importedModules: _, exportedModules: ee, schemas: R, transitiveModule: O, id: Z } = E;
            this.type = b || null, this.declaredDirectives = k(T), this.exportedDirectives = k(I), this.declaredPipes = k(M), this.exportedPipes = k(V), this.providers = k(x), this.entryComponents = k($), this.bootstrapComponents = k(U), this.importedModules = k(_), this.exportedModules = k(ee), this.schemas = k(R), this.id = Z || null, this.transitiveModule = O || null;
          }
          toSummary() {
            let E = this.transitiveModule;
            return { summaryKind: y.NgModule, type: this.type, entryComponents: E.entryComponents, providers: E.providers, modules: E.modules, exportedDirectives: E.exportedDirectives, exportedPipes: E.exportedPipes };
          }
        };
        u.CompileNgModuleMetadata = S;
        var j = class {
          constructor() {
            this.directivesSet = /* @__PURE__ */ new Set(), this.directives = [], this.exportedDirectivesSet = /* @__PURE__ */ new Set(), this.exportedDirectives = [], this.pipesSet = /* @__PURE__ */ new Set(), this.pipes = [], this.exportedPipesSet = /* @__PURE__ */ new Set(), this.exportedPipes = [], this.modulesSet = /* @__PURE__ */ new Set(), this.modules = [], this.entryComponentsSet = /* @__PURE__ */ new Set(), this.entryComponents = [], this.providers = [];
          }
          addProvider(E, b) {
            this.providers.push({ provider: E, module: b });
          }
          addDirective(E) {
            this.directivesSet.has(E.reference) || (this.directivesSet.add(E.reference), this.directives.push(E));
          }
          addExportedDirective(E) {
            this.exportedDirectivesSet.has(E.reference) || (this.exportedDirectivesSet.add(E.reference), this.exportedDirectives.push(E));
          }
          addPipe(E) {
            this.pipesSet.has(E.reference) || (this.pipesSet.add(E.reference), this.pipes.push(E));
          }
          addExportedPipe(E) {
            this.exportedPipesSet.has(E.reference) || (this.exportedPipesSet.add(E.reference), this.exportedPipes.push(E));
          }
          addModule(E) {
            this.modulesSet.has(E.reference) || (this.modulesSet.add(E.reference), this.modules.push(E));
          }
          addEntryComponent(E) {
            this.entryComponentsSet.has(E.componentType) || (this.entryComponentsSet.add(E.componentType), this.entryComponents.push(E));
          }
        };
        u.TransitiveCompileNgModuleMetadata = j;
        function k(E) {
          return E || [];
        }
        var J = class {
          constructor(E, b) {
            let { useClass: x, useValue: T, useExisting: I, useFactory: M, deps: V, multi: $ } = b;
            this.token = E, this.useClass = x || null, this.useValue = T, this.useExisting = I, this.useFactory = M || null, this.dependencies = V || null, this.multi = !!$;
          }
        };
        u.ProviderMeta = J;
        function f(E) {
          return E.reduce((b, x) => {
            let T = Array.isArray(x) ? f(x) : x;
            return b.concat(T);
          }, []);
        }
        u.flatten = f;
        function B(E) {
          return E.replace(/(\w+:\/\/[\w:-]+)?(\/+)?/, "ng:///");
        }
        function d(E, b, x) {
          let T;
          return x.isInline ? b.type.reference instanceof l.StaticSymbol ? T = `${b.type.reference.filePath}.${b.type.reference.name}.html` : T = `${n(E)}/${n(b.type)}.html` : T = x.templateUrl, b.type.reference instanceof l.StaticSymbol ? T : B(T);
        }
        u.templateSourceUrl = d;
        function F(E, b) {
          let x = E.moduleUrl.split(/\/\\/g), T = x[x.length - 1];
          return B(`css/${b}${T}.ngstyle.js`);
        }
        u.sharedStylesheetJitUrl = F;
        function a(E) {
          return B(`${n(E.type)}/module.ngfactory.js`);
        }
        u.ngModuleJitUrl = a;
        function g(E, b) {
          return B(`${n(E)}/${n(b.type)}.ngfactory.js`);
        }
        u.templateJitUrl = g;
      } }), nl = X({ "node_modules/angular-html-parser/lib/compiler/src/parse_util.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = Ho(), t = tl(), s = class {
          constructor(h, m, y, p) {
            this.file = h, this.offset = m, this.line = y, this.col = p;
          }
          toString() {
            return this.offset != null ? `${this.file.url}@${this.line}:${this.col}` : this.file.url;
          }
          moveBy(h) {
            let m = this.file.content, y = m.length, p = this.offset, D = this.line, C = this.col;
            for (; p > 0 && h < 0; )
              if (p--, h++, m.charCodeAt(p) == l.$LF) {
                D--;
                let w = m.substr(0, p - 1).lastIndexOf(String.fromCharCode(l.$LF));
                C = w > 0 ? p - w : p;
              } else
                C--;
            for (; p < y && h > 0; ) {
              let w = m.charCodeAt(p);
              p++, h--, w == l.$LF ? (D++, C = 0) : C++;
            }
            return new s(this.file, p, D, C);
          }
          getContext(h, m) {
            let y = this.file.content, p = this.offset;
            if (p != null) {
              p > y.length - 1 && (p = y.length - 1);
              let D = p, C = 0, w = 0;
              for (; C < h && p > 0 && (p--, C++, !(y[p] == `
` && ++w == m)); )
                ;
              for (C = 0, w = 0; C < h && D < y.length - 1 && (D++, C++, !(y[D] == `
` && ++w == m)); )
                ;
              return { before: y.substring(p, this.offset), after: y.substring(this.offset, D + 1) };
            }
            return null;
          }
        };
        u.ParseLocation = s;
        var i = class {
          constructor(h, m) {
            this.content = h, this.url = m;
          }
        };
        u.ParseSourceFile = i;
        var e = class {
          constructor(h, m) {
            let y = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : null;
            this.start = h, this.end = m, this.details = y;
          }
          toString() {
            return this.start.file.content.substring(this.start.offset, this.end.offset);
          }
        };
        u.ParseSourceSpan = e, u.EMPTY_PARSE_LOCATION = new s(new i("", ""), 0, 0, 0), u.EMPTY_SOURCE_SPAN = new e(u.EMPTY_PARSE_LOCATION, u.EMPTY_PARSE_LOCATION);
        var n;
        (function(h) {
          h[h.WARNING = 0] = "WARNING", h[h.ERROR = 1] = "ERROR";
        })(n = u.ParseErrorLevel || (u.ParseErrorLevel = {}));
        var r = class {
          constructor(h, m) {
            let y = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : n.ERROR;
            this.span = h, this.msg = m, this.level = y;
          }
          contextualMessage() {
            let h = this.span.start.getContext(100, 3);
            return h ? `${this.msg} ("${h.before}[${n[this.level]} ->]${h.after}")` : this.msg;
          }
          toString() {
            let h = this.span.details ? `, ${this.span.details}` : "";
            return `${this.contextualMessage()}: ${this.span.start}${h}`;
          }
        };
        u.ParseError = r;
        function o(h, m) {
          let y = t.identifierModuleUrl(m), p = y != null ? `in ${h} ${t.identifierName(m)} in ${y}` : `in ${h} ${t.identifierName(m)}`, D = new i("", p);
          return new e(new s(D, -1, -1, -1), new s(D, -1, -1, -1));
        }
        u.typeSourceSpan = o;
        function c(h, m, y) {
          let p = `in ${h} ${m} in ${y}`, D = new i("", p);
          return new e(new s(D, -1, -1, -1), new s(D, -1, -1, -1));
        }
        u.r3JitTypeSourceSpan = c;
      } }), rl = X({ "src/language-html/print-preprocess.js"(u, l) {
        H();
        var { ParseSourceSpan: t } = nl(), { htmlTrim: s, getLeadingAndTrailingHtmlWhitespace: i, hasHtmlWhitespace: e, canHaveInterpolation: n, getNodeCssStyleDisplay: r, isDanglingSpaceSensitiveNode: o, isIndentationSensitiveNode: c, isLeadingSpaceSensitiveNode: h, isTrailingSpaceSensitiveNode: m, isWhitespaceSensitiveNode: y, isVueScriptTag: p } = cr(), D = [w, P, N, j, k, B, J, f, d, S, F];
        function C(a, g) {
          for (let E of D)
            E(a, g);
          return a;
        }
        function w(a) {
          a.walk((g) => {
            if (g.type === "element" && g.tagDefinition.ignoreFirstLf && g.children.length > 0 && g.children[0].type === "text" && g.children[0].value[0] === `
`) {
              let E = g.children[0];
              E.value.length === 1 ? g.removeChild(E) : E.value = E.value.slice(1);
            }
          });
        }
        function P(a) {
          let g = (E) => E.type === "element" && E.prev && E.prev.type === "ieConditionalStartComment" && E.prev.sourceSpan.end.offset === E.startSourceSpan.start.offset && E.firstChild && E.firstChild.type === "ieConditionalEndComment" && E.firstChild.sourceSpan.start.offset === E.startSourceSpan.end.offset;
          a.walk((E) => {
            if (E.children)
              for (let b = 0; b < E.children.length; b++) {
                let x = E.children[b];
                if (!g(x))
                  continue;
                let T = x.prev, I = x.firstChild;
                E.removeChild(T), b--;
                let M = new t(T.sourceSpan.start, I.sourceSpan.end), V = new t(M.start, x.sourceSpan.end);
                x.condition = T.condition, x.sourceSpan = V, x.startSourceSpan = M, x.removeChild(I);
              }
          });
        }
        function A(a, g, E) {
          a.walk((b) => {
            if (b.children)
              for (let x = 0; x < b.children.length; x++) {
                let T = b.children[x];
                if (T.type !== "text" && !g(T))
                  continue;
                T.type !== "text" && (T.type = "text", T.value = E(T));
                let I = T.prev;
                !I || I.type !== "text" || (I.value += T.value, I.sourceSpan = new t(I.sourceSpan.start, T.sourceSpan.end), b.removeChild(T), x--);
              }
          });
        }
        function N(a) {
          return A(a, (g) => g.type === "cdata", (g) => `<![CDATA[${g.value}]]>`);
        }
        function S(a) {
          let g = (E) => E.type === "element" && E.attrs.length === 0 && E.children.length === 1 && E.firstChild.type === "text" && !e(E.children[0].value) && !E.firstChild.hasLeadingSpaces && !E.firstChild.hasTrailingSpaces && E.isLeadingSpaceSensitive && !E.hasLeadingSpaces && E.isTrailingSpaceSensitive && !E.hasTrailingSpaces && E.prev && E.prev.type === "text" && E.next && E.next.type === "text";
          a.walk((E) => {
            if (E.children)
              for (let b = 0; b < E.children.length; b++) {
                let x = E.children[b];
                if (!g(x))
                  continue;
                let T = x.prev, I = x.next;
                T.value += `<${x.rawName}>` + x.firstChild.value + `</${x.rawName}>` + I.value, T.sourceSpan = new t(T.sourceSpan.start, I.sourceSpan.end), T.isTrailingSpaceSensitive = I.isTrailingSpaceSensitive, T.hasTrailingSpaces = I.hasTrailingSpaces, E.removeChild(x), b--, E.removeChild(I);
              }
          });
        }
        function j(a, g) {
          if (g.parser === "html")
            return;
          let E = /{{(.+?)}}/s;
          a.walk((b) => {
            if (n(b))
              for (let x of b.children) {
                if (x.type !== "text")
                  continue;
                let T = x.sourceSpan.start, I = null, M = x.value.split(E);
                for (let V = 0; V < M.length; V++, T = I) {
                  let $ = M[V];
                  if (V % 2 === 0) {
                    I = T.moveBy($.length), $.length > 0 && b.insertChildBefore(x, { type: "text", value: $, sourceSpan: new t(T, I) });
                    continue;
                  }
                  I = T.moveBy($.length + 4), b.insertChildBefore(x, { type: "interpolation", sourceSpan: new t(T, I), children: $.length === 0 ? [] : [{ type: "text", value: $, sourceSpan: new t(T.moveBy(2), I.moveBy(-2)) }] });
                }
                b.removeChild(x);
              }
          });
        }
        function k(a) {
          a.walk((g) => {
            if (!g.children)
              return;
            if (g.children.length === 0 || g.children.length === 1 && g.children[0].type === "text" && s(g.children[0].value).length === 0) {
              g.hasDanglingSpaces = g.children.length > 0, g.children = [];
              return;
            }
            let E = y(g), b = c(g);
            if (!E)
              for (let x = 0; x < g.children.length; x++) {
                let T = g.children[x];
                if (T.type !== "text")
                  continue;
                let { leadingWhitespace: I, text: M, trailingWhitespace: V } = i(T.value), $ = T.prev, U = T.next;
                M ? (T.value = M, T.sourceSpan = new t(T.sourceSpan.start.moveBy(I.length), T.sourceSpan.end.moveBy(-V.length)), I && ($ && ($.hasTrailingSpaces = !0), T.hasLeadingSpaces = !0), V && (T.hasTrailingSpaces = !0, U && (U.hasLeadingSpaces = !0))) : (g.removeChild(T), x--, (I || V) && ($ && ($.hasTrailingSpaces = !0), U && (U.hasLeadingSpaces = !0)));
              }
            g.isWhitespaceSensitive = E, g.isIndentationSensitive = b;
          });
        }
        function J(a) {
          a.walk((g) => {
            g.isSelfClosing = !g.children || g.type === "element" && (g.tagDefinition.isVoid || g.startSourceSpan === g.endSourceSpan);
          });
        }
        function f(a, g) {
          a.walk((E) => {
            E.type === "element" && (E.hasHtmComponentClosingTag = E.endSourceSpan && /^<\s*\/\s*\/\s*>$/.test(g.originalText.slice(E.endSourceSpan.start.offset, E.endSourceSpan.end.offset)));
          });
        }
        function B(a, g) {
          a.walk((E) => {
            E.cssDisplay = r(E, g);
          });
        }
        function d(a, g) {
          a.walk((E) => {
            let { children: b } = E;
            if (b) {
              if (b.length === 0) {
                E.isDanglingSpaceSensitive = o(E);
                return;
              }
              for (let x of b)
                x.isLeadingSpaceSensitive = h(x, g), x.isTrailingSpaceSensitive = m(x, g);
              for (let x = 0; x < b.length; x++) {
                let T = b[x];
                T.isLeadingSpaceSensitive = (x === 0 || T.prev.isTrailingSpaceSensitive) && T.isLeadingSpaceSensitive, T.isTrailingSpaceSensitive = (x === b.length - 1 || T.next.isLeadingSpaceSensitive) && T.isTrailingSpaceSensitive;
              }
            }
          });
        }
        function F(a, g) {
          if (g.parser === "vue") {
            let E = a.children.find((x) => p(x, g));
            if (!E)
              return;
            let { lang: b } = E.attrMap;
            (b === "ts" || b === "typescript") && (g.__should_parse_vue_template_with_ts = !0);
          }
        }
        l.exports = C;
      } }), ul = X({ "src/language-html/pragma.js"(u, l) {
        H();
        function t(i) {
          return /^\s*<!--\s*@(?:format|prettier)\s*-->/.test(i);
        }
        function s(i) {
          return `<!-- @format -->

` + i.replace(/^\s*\n/, "");
        }
        l.exports = { hasPragma: t, insertPragma: s };
      } }), ju = X({ "src/language-html/loc.js"(u, l) {
        H();
        function t(i) {
          return i.sourceSpan.start.offset;
        }
        function s(i) {
          return i.sourceSpan.end.offset;
        }
        l.exports = { locStart: t, locEnd: s };
      } }), Pr = X({ "src/language-html/print/tag.js"(u, l) {
        H();
        var t = Br(), { isNonEmptyArray: s } = bt(), { builders: { indent: i, join: e, line: n, softline: r, hardline: o }, utils: { replaceTextEndOfLine: c } } = pt(), { locStart: h, locEnd: m } = ju(), { isTextLikeNode: y, getLastDescendant: p, isPreLikeNode: D, hasPrettierIgnore: C, shouldPreserveContent: w, isVueSfcBlock: P } = cr();
        function A(_, ee) {
          return [_.isSelfClosing ? "" : N(_, ee), S(_, ee)];
        }
        function N(_, ee) {
          return _.lastChild && a(_.lastChild) ? "" : [j(_, ee), J(_, ee)];
        }
        function S(_, ee) {
          return (_.next ? d(_.next) : F(_.parent)) ? "" : [f(_, ee), k(_, ee)];
        }
        function j(_, ee) {
          return F(_) ? f(_.lastChild, ee) : "";
        }
        function k(_, ee) {
          return a(_) ? J(_.parent, ee) : g(_) ? $(_.next) : "";
        }
        function J(_, ee) {
          if (t(!_.isSelfClosing), B(_, ee))
            return "";
          switch (_.type) {
            case "ieConditionalComment":
              return "<!";
            case "element":
              if (_.hasHtmComponentClosingTag)
                return "<//";
            default:
              return `</${_.rawName}`;
          }
        }
        function f(_, ee) {
          if (B(_, ee))
            return "";
          switch (_.type) {
            case "ieConditionalComment":
            case "ieConditionalEndComment":
              return "[endif]-->";
            case "ieConditionalStartComment":
              return "]><!-->";
            case "interpolation":
              return "}}";
            case "element":
              if (_.isSelfClosing)
                return "/>";
            default:
              return ">";
          }
        }
        function B(_, ee) {
          return !_.isSelfClosing && !_.endSourceSpan && (C(_) || w(_.parent, ee));
        }
        function d(_) {
          return _.prev && _.prev.type !== "docType" && !y(_.prev) && _.isLeadingSpaceSensitive && !_.hasLeadingSpaces;
        }
        function F(_) {
          return _.lastChild && _.lastChild.isTrailingSpaceSensitive && !_.lastChild.hasTrailingSpaces && !y(p(_.lastChild)) && !D(_);
        }
        function a(_) {
          return !_.next && !_.hasTrailingSpaces && _.isTrailingSpaceSensitive && y(p(_));
        }
        function g(_) {
          return _.next && !y(_.next) && y(_) && _.isTrailingSpaceSensitive && !_.hasTrailingSpaces;
        }
        function E(_) {
          let ee = _.trim().match(/^prettier-ignore-attribute(?:\s+(.+))?$/s);
          return ee ? ee[1] ? ee[1].split(/\s+/) : !0 : !1;
        }
        function b(_) {
          return !_.prev && _.isLeadingSpaceSensitive && !_.hasLeadingSpaces;
        }
        function x(_, ee, R) {
          let O = _.getValue();
          if (!s(O.attrs))
            return O.isSelfClosing ? " " : "";
          let Z = O.prev && O.prev.type === "comment" && E(O.prev.value), ae = typeof Z == "boolean" ? () => Z : Array.isArray(Z) ? (me) => Z.includes(me.rawName) : () => !1, ne = _.map((me) => {
            let ge = me.getValue();
            return ae(ge) ? c(ee.originalText.slice(h(ge), m(ge))) : R();
          }, "attrs"), he = O.type === "element" && O.fullName === "script" && O.attrs.length === 1 && O.attrs[0].fullName === "src" && O.children.length === 0, q = ee.singleAttributePerLine && O.attrs.length > 1 && !P(O, ee) ? o : n, Y = [i([he ? " " : n, e(q, ne)])];
          return O.firstChild && b(O.firstChild) || O.isSelfClosing && F(O.parent) || he ? Y.push(O.isSelfClosing ? " " : "") : Y.push(ee.bracketSameLine ? O.isSelfClosing ? " " : "" : O.isSelfClosing ? n : r), Y;
        }
        function T(_) {
          return _.firstChild && b(_.firstChild) ? "" : U(_);
        }
        function I(_, ee, R) {
          let O = _.getValue();
          return [M(O, ee), x(_, ee, R), O.isSelfClosing ? "" : T(O)];
        }
        function M(_, ee) {
          return _.prev && g(_.prev) ? "" : [V(_, ee), $(_)];
        }
        function V(_, ee) {
          return b(_) ? U(_.parent) : d(_) ? f(_.prev, ee) : "";
        }
        function $(_) {
          switch (_.type) {
            case "ieConditionalComment":
            case "ieConditionalStartComment":
              return `<!--[if ${_.condition}`;
            case "ieConditionalEndComment":
              return "<!--<!";
            case "interpolation":
              return "{{";
            case "docType":
              return "<!DOCTYPE";
            case "element":
              if (_.condition)
                return `<!--[if ${_.condition}]><!--><${_.rawName}`;
            default:
              return `<${_.rawName}`;
          }
        }
        function U(_) {
          switch (t(!_.isSelfClosing), _.type) {
            case "ieConditionalComment":
              return "]>";
            case "element":
              if (_.condition)
                return "><!--<![endif]-->";
            default:
              return ">";
          }
        }
        l.exports = { printClosingTag: A, printClosingTagStart: N, printClosingTagStartMarker: J, printClosingTagEndMarker: f, printClosingTagSuffix: k, printClosingTagEnd: S, needsToBorrowLastChildClosingTagEndMarker: F, needsToBorrowParentClosingTagStartMarker: a, needsToBorrowPrevClosingTagEndMarker: d, printOpeningTag: I, printOpeningTagStart: M, printOpeningTagPrefix: V, printOpeningTagStartMarker: $, printOpeningTagEndMarker: U, needsToBorrowNextOpeningTagStartMarker: g, needsToBorrowParentOpeningTagEndMarker: b };
      } }), il = X({ "node_modules/parse-srcset/src/parse-srcset.js"(u, l) {
        H(), function(t, s) {
          typeof l == "object" && l.exports ? l.exports = s() : t.parseSrcset = s();
        }(u, function() {
          return function(t, s) {
            var i = s && s.logger || console;
            function e(J) {
              return J === " " || J === "	" || J === `
` || J === "\f" || J === "\r";
            }
            function n(J) {
              var f, B = J.exec(t.substring(N));
              if (B)
                return f = B[0], N += f.length, f;
            }
            for (var r = t.length, o = /^[ \t\n\r\u000c]+/, c = /^[, \t\n\r\u000c]+/, h = /^[^ \t\n\r\u000c]+/, m = /[,]+$/, y = /^\d+$/, p = /^-?(?:[0-9]+|[0-9]*\.[0-9]+)(?:[eE][+-]?[0-9]+)?$/, D, C, w, P, A, N = 0, S = []; ; ) {
              if (n(c), N >= r)
                return S;
              D = n(h), C = [], D.slice(-1) === "," ? (D = D.replace(m, ""), k()) : j();
            }
            function j() {
              for (n(o), w = "", P = "in descriptor"; ; ) {
                if (A = t.charAt(N), P === "in descriptor")
                  if (e(A))
                    w && (C.push(w), w = "", P = "after descriptor");
                  else if (A === ",") {
                    N += 1, w && C.push(w), k();
                    return;
                  } else if (A === "(")
                    w = w + A, P = "in parens";
                  else if (A === "") {
                    w && C.push(w), k();
                    return;
                  } else
                    w = w + A;
                else if (P === "in parens")
                  if (A === ")")
                    w = w + A, P = "in descriptor";
                  else if (A === "") {
                    C.push(w), k();
                    return;
                  } else
                    w = w + A;
                else if (P === "after descriptor" && !e(A))
                  if (A === "") {
                    k();
                    return;
                  } else
                    P = "in descriptor", N -= 1;
                N += 1;
              }
            }
            function k() {
              var J = !1, f, B, d, F, a = {}, g, E, b, x, T;
              for (F = 0; F < C.length; F++)
                g = C[F], E = g[g.length - 1], b = g.substring(0, g.length - 1), x = parseInt(b, 10), T = parseFloat(b), y.test(b) && E === "w" ? ((f || B) && (J = !0), x === 0 ? J = !0 : f = x) : p.test(b) && E === "x" ? ((f || B || d) && (J = !0), T < 0 ? J = !0 : B = T) : y.test(b) && E === "h" ? ((d || B) && (J = !0), x === 0 ? J = !0 : d = x) : J = !0;
              J ? i && i.error && i.error("Invalid srcset descriptor found in '" + t + "' at '" + g + "'.") : (a.url = D, f && (a.w = f), B && (a.d = B), d && (a.h = d), S.push(a));
            }
          };
        });
      } }), al = X({ "src/language-html/syntax-attribute.js"(u, l) {
        H();
        var t = il(), { builders: { ifBreak: s, join: i, line: e } } = pt();
        function n(o) {
          let c = t(o, { logger: { error(j) {
            throw new Error(j);
          } } }), h = c.some((j) => {
            let { w: k } = j;
            return k;
          }), m = c.some((j) => {
            let { h: k } = j;
            return k;
          }), y = c.some((j) => {
            let { d: k } = j;
            return k;
          });
          if (h + m + y > 1)
            throw new Error("Mixed descriptor in srcset is not supported");
          let p = h ? "w" : m ? "h" : "d", D = h ? "w" : m ? "h" : "x", C = (j) => Math.max(...j), w = c.map((j) => j.url), P = C(w.map((j) => j.length)), A = c.map((j) => j[p]).map((j) => j ? j.toString() : ""), N = A.map((j) => {
            let k = j.indexOf(".");
            return k === -1 ? j.length : k;
          }), S = C(N);
          return i([",", e], w.map((j, k) => {
            let J = [j], f = A[k];
            if (f) {
              let B = P - j.length + 1, d = S - N[k], F = " ".repeat(B + d);
              J.push(s(F, " "), f + D);
            }
            return J;
          }));
        }
        function r(o) {
          return o.trim().split(/\s+/).join(" ");
        }
        l.exports = { printImgSrcset: n, printClassNames: r };
      } }), sl = X({ "src/language-html/syntax-vue.js"(u, l) {
        H();
        var { builders: { group: t } } = pt();
        function s(r, o) {
          let { left: c, operator: h, right: m } = i(r);
          return [t(o(`function _(${c}) {}`, { parser: "babel", __isVueForBindingLeft: !0 })), " ", h, " ", o(m, { parser: "__js_expression" }, { stripTrailingHardline: !0 })];
        }
        function i(r) {
          let o = /(.*?)\s+(in|of)\s+(.*)/s, c = /,([^,\]}]*)(?:,([^,\]}]*))?$/, h = /^\(|\)$/g, m = r.match(o);
          if (!m)
            return;
          let y = {};
          if (y.for = m[3].trim(), !y.for)
            return;
          let p = m[1].trim().replace(h, ""), D = p.match(c);
          D ? (y.alias = p.replace(c, ""), y.iterator1 = D[1].trim(), D[2] && (y.iterator2 = D[2].trim())) : y.alias = p;
          let C = [y.alias, y.iterator1, y.iterator2];
          if (!C.some((w, P) => !w && (P === 0 || C.slice(P + 1).some(Boolean))))
            return { left: C.filter(Boolean).join(","), operator: m[2], right: y.for };
        }
        function e(r, o) {
          return o(`function _(${r}) {}`, { parser: "babel", __isVueBindings: !0 });
        }
        function n(r) {
          let o = /^(?:[\w$]+|\([^)]*\))\s*=>|^function\s*\(/, c = /^[$A-Z_a-z][\w$]*(?:\.[$A-Z_a-z][\w$]*|\['[^']*']|\["[^"]*"]|\[\d+]|\[[$A-Z_a-z][\w$]*])*$/, h = r.trim();
          return o.test(h) || c.test(h);
        }
        l.exports = { isVueEventBindingExpression: n, printVueFor: s, printVueBindings: e };
      } }), Gi = X({ "src/language-html/get-node-content.js"(u, l) {
        H();
        var { needsToBorrowParentClosingTagStartMarker: t, printClosingTagStartMarker: s, needsToBorrowLastChildClosingTagEndMarker: i, printClosingTagEndMarker: e, needsToBorrowParentOpeningTagEndMarker: n, printOpeningTagEndMarker: r } = Pr();
        function o(c, h) {
          let m = c.startSourceSpan.end.offset;
          c.firstChild && n(c.firstChild) && (m -= r(c).length);
          let y = c.endSourceSpan.start.offset;
          return c.lastChild && t(c.lastChild) ? y += s(c, h).length : i(c) && (y -= e(c.lastChild, h).length), h.originalText.slice(m, y);
        }
        l.exports = o;
      } }), ol = X({ "src/language-html/embed.js"(u, l) {
        H();
        var { builders: { breakParent: t, group: s, hardline: i, indent: e, line: n, fill: r, softline: o }, utils: { mapDoc: c, replaceTextEndOfLine: h } } = pt(), m = ku(), { printClosingTag: y, printClosingTagSuffix: p, needsToBorrowPrevClosingTagEndMarker: D, printOpeningTagPrefix: C, printOpeningTag: w } = Pr(), { printImgSrcset: P, printClassNames: A } = al(), { printVueFor: N, printVueBindings: S, isVueEventBindingExpression: j } = sl(), { isScriptLikeTag: k, isVueNonHtmlBlock: J, inferScriptParser: f, htmlTrimPreserveIndentation: B, dedentString: d, unescapeQuoteEntities: F, isVueSlotAttribute: a, isVueSfcBindingsAttribute: g, getTextValueParts: E } = cr(), b = Gi();
        function x(I, M, V) {
          let $ = (ne) => new RegExp(ne.join("|")).test(I.fullName), U = () => F(I.value), _ = !1, ee = (ne, he) => {
            let q = ne.type === "NGRoot" ? ne.node.type === "NGMicrosyntax" && ne.node.body.length === 1 && ne.node.body[0].type === "NGMicrosyntaxExpression" ? ne.node.body[0].expression : ne.node : ne.type === "JsExpressionRoot" ? ne.node : ne;
            q && (q.type === "ObjectExpression" || q.type === "ArrayExpression" || he.parser === "__vue_expression" && (q.type === "TemplateLiteral" || q.type === "StringLiteral")) && (_ = !0);
          }, R = (ne) => s(ne), O = function(ne) {
            let he = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
            return s([e([o, ne]), he ? o : ""]);
          }, Z = (ne) => _ ? R(ne) : O(ne), ae = (ne, he) => M(ne, Object.assign({ __onHtmlBindingRoot: ee, __embeddedInHtml: !0 }, he));
          if (I.fullName === "srcset" && (I.parent.fullName === "img" || I.parent.fullName === "source"))
            return O(P(U()));
          if (I.fullName === "class" && !V.parentParser) {
            let ne = U();
            if (!ne.includes("{{"))
              return A(ne);
          }
          if (I.fullName === "style" && !V.parentParser) {
            let ne = U();
            if (!ne.includes("{{"))
              return O(ae(ne, { parser: "css", __isHTMLStyleAttribute: !0 }));
          }
          if (V.parser === "vue") {
            if (I.fullName === "v-for")
              return N(U(), ae);
            if (a(I) || g(I, V))
              return S(U(), ae);
            let ne = ["^@", "^v-on:"], he = ["^:", "^v-bind:"], q = ["^v-"];
            if ($(ne)) {
              let Y = U(), me = j(Y) ? "__js_expression" : V.__should_parse_vue_template_with_ts ? "__vue_ts_event_binding" : "__vue_event_binding";
              return Z(ae(Y, { parser: me }));
            }
            if ($(he))
              return Z(ae(U(), { parser: "__vue_expression" }));
            if ($(q))
              return Z(ae(U(), { parser: "__js_expression" }));
          }
          if (V.parser === "angular") {
            let ne = (Q, W) => ae(Q, Object.assign(Object.assign({}, W), {}, { trailingComma: "none" })), he = ["^\\*"], q = ["^\\(.+\\)$", "^on-"], Y = ["^\\[.+\\]$", "^bind(on)?-", "^ng-(if|show|hide|class|style)$"], me = ["^i18n(-.+)?$"];
            if ($(q))
              return Z(ne(U(), { parser: "__ng_action" }));
            if ($(Y))
              return Z(ne(U(), { parser: "__ng_binding" }));
            if ($(me)) {
              let Q = U().trim();
              return O(r(E(I, Q)), !Q.includes("@@"));
            }
            if ($(he))
              return Z(ne(U(), { parser: "__ng_directive" }));
            let ge = /{{(.+?)}}/s, _e = U();
            if (ge.test(_e)) {
              let Q = [];
              for (let [W, re] of _e.split(ge).entries())
                if (W % 2 === 0)
                  Q.push(h(re));
                else
                  try {
                    Q.push(s(["{{", e([n, ne(re, { parser: "__ng_interpolation", __isInHtmlInterpolation: !0 })]), n, "}}"]));
                  } catch {
                    Q.push("{{", h(re), "}}");
                  }
              return s(Q);
            }
          }
          return null;
        }
        function T(I, M, V, $) {
          let U = I.getValue();
          switch (U.type) {
            case "element": {
              if (k(U) || U.type === "interpolation")
                return;
              if (!U.isSelfClosing && J(U, $)) {
                let _ = f(U, $);
                if (!_)
                  return;
                let ee = b(U, $), R = /^\s*$/.test(ee), O = "";
                return R || (O = V(B(ee), { parser: _, __embeddedInHtml: !0 }, { stripTrailingHardline: !0 }), R = O === ""), [C(U, $), s(w(I, $, M)), R ? "" : i, O, R ? "" : i, y(U, $), p(U, $)];
              }
              break;
            }
            case "text": {
              if (k(U.parent)) {
                let _ = f(U.parent, $);
                if (_) {
                  let ee = _ === "markdown" ? d(U.value.replace(/^[^\S\n]*\n/, "")) : U.value, R = { parser: _, __embeddedInHtml: !0 };
                  if ($.parser === "html" && _ === "babel") {
                    let O = "script", { attrMap: Z } = U.parent;
                    Z && (Z.type === "module" || Z.type === "text/babel" && Z["data-type"] === "module") && (O = "module"), R.__babelSourceType = O;
                  }
                  return [t, C(U, $), V(ee, R, { stripTrailingHardline: !0 }), p(U, $)];
                }
              } else if (U.parent.type === "interpolation") {
                let _ = { __isInHtmlInterpolation: !0, __embeddedInHtml: !0 };
                return $.parser === "angular" ? (_.parser = "__ng_interpolation", _.trailingComma = "none") : $.parser === "vue" ? _.parser = $.__should_parse_vue_template_with_ts ? "__vue_ts_expression" : "__vue_expression" : _.parser = "__js_expression", [e([n, V(U.value, _, { stripTrailingHardline: !0 })]), U.parent.next && D(U.parent.next) ? " " : n];
              }
              break;
            }
            case "attribute": {
              if (!U.value)
                break;
              if (/^PRETTIER_HTML_PLACEHOLDER_\d+_\d+_IN_JS$/.test($.originalText.slice(U.valueSpan.start.offset, U.valueSpan.end.offset)))
                return [U.rawName, "=", U.value];
              if ($.parser === "lwc" && /^{.*}$/s.test($.originalText.slice(U.valueSpan.start.offset, U.valueSpan.end.offset)))
                return [U.rawName, "=", U.value];
              let _ = x(U, (ee, R) => V(ee, Object.assign({ __isInHtmlAttribute: !0, __embeddedInHtml: !0 }, R), { stripTrailingHardline: !0 }), $);
              if (_)
                return [U.rawName, '="', s(c(_, (ee) => typeof ee == "string" ? ee.replace(/"/g, "&quot;") : ee)), '"'];
              break;
            }
            case "front-matter":
              return m(U, V);
          }
        }
        l.exports = T;
      } }), Wi = X({ "src/language-html/print/children.js"(u, l) {
        H();
        var { builders: { breakParent: t, group: s, ifBreak: i, line: e, softline: n, hardline: r }, utils: { replaceTextEndOfLine: o } } = pt(), { locStart: c, locEnd: h } = ju(), { forceBreakChildren: m, forceNextEmptyLine: y, isTextLikeNode: p, hasPrettierIgnore: D, preferHardlineAsLeadingSpaces: C } = cr(), { printOpeningTagPrefix: w, needsToBorrowNextOpeningTagStartMarker: P, printOpeningTagStartMarker: A, needsToBorrowPrevClosingTagEndMarker: N, printClosingTagEndMarker: S, printClosingTagSuffix: j, needsToBorrowParentClosingTagStartMarker: k } = Pr();
        function J(d, F, a) {
          let g = d.getValue();
          return D(g) ? [w(g, F), ...o(F.originalText.slice(c(g) + (g.prev && P(g.prev) ? A(g).length : 0), h(g) - (g.next && N(g.next) ? S(g, F).length : 0))), j(g, F)] : a();
        }
        function f(d, F) {
          return p(d) && p(F) ? d.isTrailingSpaceSensitive ? d.hasTrailingSpaces ? C(F) ? r : e : "" : C(F) ? r : n : P(d) && (D(F) || F.firstChild || F.isSelfClosing || F.type === "element" && F.attrs.length > 0) || d.type === "element" && d.isSelfClosing && N(F) ? "" : !F.isLeadingSpaceSensitive || C(F) || N(F) && d.lastChild && k(d.lastChild) && d.lastChild.lastChild && k(d.lastChild.lastChild) ? r : F.hasLeadingSpaces ? e : n;
        }
        function B(d, F, a) {
          let g = d.getValue();
          if (m(g))
            return [t, ...d.map((b) => {
              let x = b.getValue(), T = x.prev ? f(x.prev, x) : "";
              return [T ? [T, y(x.prev) ? r : ""] : "", J(b, F, a)];
            }, "children")];
          let E = g.children.map(() => Symbol(""));
          return d.map((b, x) => {
            let T = b.getValue();
            if (p(T)) {
              if (T.prev && p(T.prev)) {
                let ee = f(T.prev, T);
                if (ee)
                  return y(T.prev) ? [r, r, J(b, F, a)] : [ee, J(b, F, a)];
              }
              return J(b, F, a);
            }
            let I = [], M = [], V = [], $ = [], U = T.prev ? f(T.prev, T) : "", _ = T.next ? f(T, T.next) : "";
            return U && (y(T.prev) ? I.push(r, r) : U === r ? I.push(r) : p(T.prev) ? M.push(U) : M.push(i("", n, { groupId: E[x - 1] }))), _ && (y(T) ? p(T.next) && $.push(r, r) : _ === r ? p(T.next) && $.push(r) : V.push(_)), [...I, s([...M, s([J(b, F, a), ...V], { id: E[x] })]), ...$];
          }, "children");
        }
        l.exports = { printChildren: B };
      } }), ll = X({ "src/language-html/print/element.js"(u, l) {
        H();
        var { builders: { breakParent: t, dedentToRoot: s, group: i, ifBreak: e, indentIfBreak: n, indent: r, line: o, softline: c }, utils: { replaceTextEndOfLine: h } } = pt(), m = Gi(), { shouldPreserveContent: y, isScriptLikeTag: p, isVueCustomBlock: D, countParents: C, forceBreakContent: w } = cr(), { printOpeningTagPrefix: P, printOpeningTag: A, printClosingTagSuffix: N, printClosingTag: S, needsToBorrowPrevClosingTagEndMarker: j, needsToBorrowLastChildClosingTagEndMarker: k } = Pr(), { printChildren: J } = Wi();
        function f(B, d, F) {
          let a = B.getValue();
          if (y(a, d))
            return [P(a, d), i(A(B, d, F)), ...h(m(a, d)), ...S(a, d), N(a, d)];
          let g = a.children.length === 1 && a.firstChild.type === "interpolation" && a.firstChild.isLeadingSpaceSensitive && !a.firstChild.hasLeadingSpaces && a.lastChild.isTrailingSpaceSensitive && !a.lastChild.hasTrailingSpaces, E = Symbol("element-attr-group-id"), b = (M) => i([i(A(B, d, F), { id: E }), M, S(a, d)]), x = (M) => g ? n(M, { groupId: E }) : (p(a) || D(a, d)) && a.parent.type === "root" && d.parser === "vue" && !d.vueIndentScriptAndStyle ? M : r(M), T = () => g ? e(c, "", { groupId: E }) : a.firstChild.hasLeadingSpaces && a.firstChild.isLeadingSpaceSensitive ? o : a.firstChild.type === "text" && a.isWhitespaceSensitive && a.isIndentationSensitive ? s(c) : c, I = () => (a.next ? j(a.next) : k(a.parent)) ? a.lastChild.hasTrailingSpaces && a.lastChild.isTrailingSpaceSensitive ? " " : "" : g ? e(c, "", { groupId: E }) : a.lastChild.hasTrailingSpaces && a.lastChild.isTrailingSpaceSensitive ? o : (a.lastChild.type === "comment" || a.lastChild.type === "text" && a.isWhitespaceSensitive && a.isIndentationSensitive) && new RegExp(`\\n[\\t ]{${d.tabWidth * C(B, (M) => M.parent && M.parent.type !== "root")}}$`).test(a.lastChild.value) ? "" : c;
          return a.children.length === 0 ? b(a.hasDanglingSpaces && a.isDanglingSpaceSensitive ? o : "") : b([w(a) ? t : "", x([T(), J(B, d, F)]), I()]);
        }
        l.exports = { printElement: f };
      } }), pl = X({ "src/language-html/printer-html.js"(u, l) {
        H();
        var { builders: { fill: t, group: s, hardline: i, literalline: e }, utils: { cleanDoc: n, getDocParts: r, isConcat: o, replaceTextEndOfLine: c } } = pt(), h = Yo(), { countChars: m, unescapeQuoteEntities: y, getTextValueParts: p } = cr(), D = rl(), { insertPragma: C } = ul(), { locStart: w, locEnd: P } = ju(), A = ol(), { printClosingTagSuffix: N, printClosingTagEnd: S, printOpeningTagPrefix: j, printOpeningTagStart: k } = Pr(), { printElement: J } = ll(), { printChildren: f } = Wi();
        function B(d, F, a) {
          let g = d.getValue();
          switch (g.type) {
            case "front-matter":
              return c(g.raw);
            case "root":
              return F.__onHtmlRoot && F.__onHtmlRoot(g), [s(f(d, F, a)), i];
            case "element":
            case "ieConditionalComment":
              return J(d, F, a);
            case "ieConditionalStartComment":
            case "ieConditionalEndComment":
              return [k(g), S(g)];
            case "interpolation":
              return [k(g, F), ...d.map(a, "children"), S(g, F)];
            case "text": {
              if (g.parent.type === "interpolation") {
                let b = /\n[^\S\n]*$/, x = b.test(g.value), T = x ? g.value.replace(b, "") : g.value;
                return [...c(T), x ? i : ""];
              }
              let E = n([j(g, F), ...p(g), N(g, F)]);
              return o(E) || E.type === "fill" ? t(r(E)) : E;
            }
            case "docType":
              return [s([k(g, F), " ", g.value.replace(/^html\b/i, "html").replace(/\s+/g, " ")]), S(g, F)];
            case "comment":
              return [j(g, F), ...c(F.originalText.slice(w(g), P(g)), e), N(g, F)];
            case "attribute": {
              if (g.value === null)
                return g.rawName;
              let E = y(g.value), b = m(E, "'"), x = m(E, '"'), T = b < x ? "'" : '"';
              return [g.rawName, "=", T, ...c(T === '"' ? E.replace(/"/g, "&quot;") : E.replace(/'/g, "&apos;")), T];
            }
            default:
              throw new Error(`Unexpected node type ${g.type}`);
          }
        }
        l.exports = { preprocess: D, print: B, insertPragma: C, massageAstNode: h, embed: A };
      } }), cl = X({ "src/language-html/options.js"(u, l) {
        H();
        var t = pr(), s = "HTML";
        l.exports = { bracketSameLine: t.bracketSameLine, htmlWhitespaceSensitivity: { since: "1.15.0", category: s, type: "choice", default: "css", description: "How to handle whitespaces in HTML.", choices: [{ value: "css", description: "Respect the default value of CSS display property." }, { value: "strict", description: "Whitespaces are considered sensitive." }, { value: "ignore", description: "Whitespaces are considered insensitive." }] }, singleAttributePerLine: t.singleAttributePerLine, vueIndentScriptAndStyle: { since: "1.19.0", category: s, type: "boolean", default: !1, description: "Indent script and style tags in Vue files." } };
      } }), Dl = X({ "src/language-html/parsers.js"() {
        H();
      } }), Iu = X({ "node_modules/linguist-languages/data/HTML.json"(u, l) {
        l.exports = { name: "HTML", type: "markup", tmScope: "text.html.basic", aceMode: "html", codemirrorMode: "htmlmixed", codemirrorMimeType: "text/html", color: "#e34c26", aliases: ["xhtml"], extensions: [".html", ".hta", ".htm", ".html.hl", ".inc", ".xht", ".xhtml"], languageId: 146 };
      } }), dl = X({ "node_modules/linguist-languages/data/Vue.json"(u, l) {
        l.exports = { name: "Vue", type: "markup", color: "#41b883", extensions: [".vue"], tmScope: "text.html.vue", aceMode: "html", languageId: 391 };
      } }), fl = X({ "src/language-html/index.js"(u, l) {
        H();
        var t = Zn(), s = pl(), i = cl(), e = Dl(), n = [t(Iu(), () => ({ name: "Angular", since: "1.15.0", parsers: ["angular"], vscodeLanguageIds: ["html"], extensions: [".component.html"], filenames: [] })), t(Iu(), (o) => ({ since: "1.15.0", parsers: ["html"], vscodeLanguageIds: ["html"], extensions: [...o.extensions, ".mjml"] })), t(Iu(), () => ({ name: "Lightning Web Components", since: "1.17.0", parsers: ["lwc"], vscodeLanguageIds: ["html"], extensions: [], filenames: [] })), t(dl(), () => ({ since: "1.10.0", parsers: ["vue"], vscodeLanguageIds: ["vue"] }))], r = { html: s };
        l.exports = { languages: n, printers: r, options: i, parsers: e };
      } }), ml = X({ "src/language-yaml/pragma.js"(u, l) {
        H();
        function t(e) {
          return /^\s*@(?:prettier|format)\s*$/.test(e);
        }
        function s(e) {
          return /^\s*#[^\S\n]*@(?:prettier|format)\s*?(?:\n|$)/.test(e);
        }
        function i(e) {
          return `# @format

${e}`;
        }
        l.exports = { isPragma: t, hasPragma: s, insertPragma: i };
      } }), gl = X({ "src/language-yaml/loc.js"(u, l) {
        H();
        function t(i) {
          return i.position.start.offset;
        }
        function s(i) {
          return i.position.end.offset;
        }
        l.exports = { locStart: t, locEnd: s };
      } }), yl = X({ "src/language-yaml/embed.js"(u, l) {
        H();
        function t(s, i, e, n) {
          if (s.getValue().type === "root" && n.filepath && /(?:[/\\]|^)\.(?:prettier|stylelint|lintstaged)rc$/.test(n.filepath))
            return e(n.originalText, Object.assign(Object.assign({}, n), {}, { parser: "json" }));
        }
        l.exports = t;
      } }), Dr = X({ "src/language-yaml/utils.js"(u, l) {
        H();
        var { getLast: t, isNonEmptyArray: s } = bt();
        function i(f, B) {
          let d = 0, F = f.stack.length - 1;
          for (let a = 0; a < F; a++) {
            let g = f.stack[a];
            e(g) && B(g) && d++;
          }
          return d;
        }
        function e(f, B) {
          return f && typeof f.type == "string" && (!B || B.includes(f.type));
        }
        function n(f, B, d) {
          return B("children" in f ? Object.assign(Object.assign({}, f), {}, { children: f.children.map((F) => n(F, B, f)) }) : f, d);
        }
        function r(f, B, d) {
          Object.defineProperty(f, B, { get: d, enumerable: !1 });
        }
        function o(f, B) {
          let d = 0, F = B.length;
          for (let a = f.position.end.offset - 1; a < F; a++) {
            let g = B[a];
            if (g === `
` && d++, d === 1 && /\S/.test(g))
              return !1;
            if (d === 2)
              return !0;
          }
          return !1;
        }
        function c(f) {
          switch (f.getValue().type) {
            case "tag":
            case "anchor":
            case "comment":
              return !1;
          }
          let B = f.stack.length;
          for (let d = 1; d < B; d++) {
            let F = f.stack[d], a = f.stack[d - 1];
            if (Array.isArray(a) && typeof F == "number" && F !== a.length - 1)
              return !1;
          }
          return !0;
        }
        function h(f) {
          return s(f.children) ? h(t(f.children)) : f;
        }
        function m(f) {
          return f.value.trim() === "prettier-ignore";
        }
        function y(f) {
          let B = f.getValue();
          if (B.type === "documentBody") {
            let d = f.getParentNode();
            return N(d.head) && m(t(d.head.endComments));
          }
          return C(B) && m(t(B.leadingComments));
        }
        function p(f) {
          return !s(f.children) && !D(f);
        }
        function D(f) {
          return C(f) || w(f) || P(f) || A(f) || N(f);
        }
        function C(f) {
          return s(f == null ? void 0 : f.leadingComments);
        }
        function w(f) {
          return s(f == null ? void 0 : f.middleComments);
        }
        function P(f) {
          return f == null ? void 0 : f.indicatorComment;
        }
        function A(f) {
          return f == null ? void 0 : f.trailingComment;
        }
        function N(f) {
          return s(f == null ? void 0 : f.endComments);
        }
        function S(f) {
          let B = [], d;
          for (let F of f.split(/( +)/))
            F !== " " ? d === " " ? B.push(F) : B.push((B.pop() || "") + F) : d === void 0 && B.unshift(""), d = F;
          return d === " " && B.push((B.pop() || "") + " "), B[0] === "" && (B.shift(), B.unshift(" " + (B.shift() || ""))), B;
        }
        function j(f, B, d) {
          let F = B.split(`
`).map((a, g, E) => g === 0 && g === E.length - 1 ? a : g !== 0 && g !== E.length - 1 ? a.trim() : g === 0 ? a.trimEnd() : a.trimStart());
          return d.proseWrap === "preserve" ? F.map((a) => a.length === 0 ? [] : [a]) : F.map((a) => a.length === 0 ? [] : S(a)).reduce((a, g, E) => E !== 0 && F[E - 1].length > 0 && g.length > 0 && !(f === "quoteDouble" && t(t(a)).endsWith("\\")) ? [...a.slice(0, -1), [...t(a), ...g]] : [...a, g], []).map((a) => d.proseWrap === "never" ? [a.join(" ")] : a);
        }
        function k(f, B) {
          let { parentIndent: d, isLastDescendant: F, options: a } = B, g = f.position.start.line === f.position.end.line ? "" : a.originalText.slice(f.position.start.offset, f.position.end.offset).match(/^[^\n]*\n(.*)$/s)[1], E;
          if (f.indent === null) {
            let T = g.match(/^(?<leadingSpace> *)[^\n\r ]/m);
            E = T ? T.groups.leadingSpace.length : Number.POSITIVE_INFINITY;
          } else
            E = f.indent - 1 + d;
          let b = g.split(`
`).map((T) => T.slice(E));
          if (a.proseWrap === "preserve" || f.type === "blockLiteral")
            return x(b.map((T) => T.length === 0 ? [] : [T]));
          return x(b.map((T) => T.length === 0 ? [] : S(T)).reduce((T, I, M) => M !== 0 && b[M - 1].length > 0 && I.length > 0 && !/^\s/.test(I[0]) && !/^\s|\s$/.test(t(T)) ? [...T.slice(0, -1), [...t(T), ...I]] : [...T, I], []).map((T) => T.reduce((I, M) => I.length > 0 && /\s$/.test(t(I)) ? [...I.slice(0, -1), t(I) + " " + M] : [...I, M], [])).map((T) => a.proseWrap === "never" ? [T.join(" ")] : T));
          function x(T) {
            if (f.chomping === "keep")
              return t(T).length === 0 ? T.slice(0, -1) : T;
            let I = 0;
            for (let M = T.length - 1; M >= 0 && T[M].length === 0; M--)
              I++;
            return I === 0 ? T : I >= 2 && !F ? T.slice(0, -(I - 1)) : T.slice(0, -I);
          }
        }
        function J(f) {
          if (!f)
            return !0;
          switch (f.type) {
            case "plain":
            case "quoteDouble":
            case "quoteSingle":
            case "alias":
            case "flowMapping":
            case "flowSequence":
              return !0;
            default:
              return !1;
          }
        }
        l.exports = { getLast: t, getAncestorCount: i, isNode: e, isEmptyNode: p, isInlineNode: J, mapNode: n, defineShortcut: r, isNextLineEmpty: o, isLastDescendantNode: c, getBlockValueLineContents: k, getFlowScalarLineContents: j, getLastDescendantNode: h, hasPrettierIgnore: y, hasLeadingComments: C, hasMiddleComments: w, hasIndicatorComment: P, hasTrailingComment: A, hasEndComments: N };
      } }), hl = X({ "src/language-yaml/print-preprocess.js"(u, l) {
        H();
        var { defineShortcut: t, mapNode: s } = Dr();
        function i(n) {
          return s(n, e);
        }
        function e(n) {
          switch (n.type) {
            case "document":
              t(n, "head", () => n.children[0]), t(n, "body", () => n.children[1]);
              break;
            case "documentBody":
            case "sequenceItem":
            case "flowSequenceItem":
            case "mappingKey":
            case "mappingValue":
              t(n, "content", () => n.children[0]);
              break;
            case "mappingItem":
            case "flowMappingItem":
              t(n, "key", () => n.children[0]), t(n, "value", () => n.children[1]);
              break;
          }
          return n;
        }
        l.exports = i;
      } }), uu = X({ "src/language-yaml/print/misc.js"(u, l) {
        H();
        var { builders: { softline: t, align: s } } = pt(), { hasEndComments: i, isNextLineEmpty: e, isNode: n } = Dr(), r = /* @__PURE__ */ new WeakMap();
        function o(m, y) {
          let p = m.getValue(), D = m.stack[0], C;
          return r.has(D) ? C = r.get(D) : (C = /* @__PURE__ */ new Set(), r.set(D, C)), !C.has(p.position.end.line) && (C.add(p.position.end.line), e(p, y) && !c(m.getParentNode())) ? t : "";
        }
        function c(m) {
          return i(m) && !n(m, ["documentHead", "documentBody", "flowMapping", "flowSequence"]);
        }
        function h(m, y) {
          return s(" ".repeat(m), y);
        }
        l.exports = { alignWithSpaces: h, shouldPrintEndComments: c, printNextEmptyLine: o };
      } }), El = X({ "src/language-yaml/print/flow-mapping-sequence.js"(u, l) {
        H();
        var { builders: { ifBreak: t, line: s, softline: i, hardline: e, join: n } } = pt(), { isEmptyNode: r, getLast: o, hasEndComments: c } = Dr(), { printNextEmptyLine: h, alignWithSpaces: m } = uu();
        function y(D, C, w) {
          let P = D.getValue(), A = P.type === "flowMapping", N = A ? "{" : "[", S = A ? "}" : "]", j = i;
          A && P.children.length > 0 && w.bracketSpacing && (j = s);
          let k = o(P.children), J = k && k.type === "flowMappingItem" && r(k.key) && r(k.value);
          return [N, m(w.tabWidth, [j, p(D, C, w), w.trailingComma === "none" ? "" : t(","), c(P) ? [e, n(e, D.map(C, "endComments"))] : ""]), J ? "" : j, S];
        }
        function p(D, C, w) {
          let P = D.getValue();
          return D.map((A, N) => [C(), N === P.children.length - 1 ? "" : [",", s, P.children[N].position.start.line !== P.children[N + 1].position.start.line ? h(A, w.originalText) : ""]], "children");
        }
        l.exports = { printFlowMapping: y, printFlowSequence: y };
      } }), Cl = X({ "src/language-yaml/print/mapping-item.js"(u, l) {
        H();
        var { builders: { conditionalGroup: t, group: s, hardline: i, ifBreak: e, join: n, line: r } } = pt(), { hasLeadingComments: o, hasMiddleComments: c, hasTrailingComment: h, hasEndComments: m, isNode: y, isEmptyNode: p, isInlineNode: D } = Dr(), { alignWithSpaces: C } = uu();
        function w(S, j, k, J, f) {
          let { key: B, value: d } = S, F = p(B), a = p(d);
          if (F && a)
            return ": ";
          let g = J("key"), E = A(S) ? " " : "";
          if (a)
            return S.type === "flowMappingItem" && j.type === "flowMapping" ? g : S.type === "mappingItem" && P(B.content, f) && !h(B.content) && (!j.tag || j.tag.value !== "tag:yaml.org,2002:set") ? [g, E, ":"] : ["? ", C(2, g)];
          let b = J("value");
          if (F)
            return [": ", C(2, b)];
          if (o(d) || !D(B.content))
            return ["? ", C(2, g), i, n("", k.map(J, "value", "leadingComments").map(($) => [$, i])), ": ", C(2, b)];
          if (N(B.content) && !o(B.content) && !c(B.content) && !h(B.content) && !m(B) && !o(d.content) && !c(d.content) && !m(d) && P(d.content, f))
            return [g, E, ": ", b];
          let x = Symbol("mappingKey"), T = s([e("? "), s(C(2, g), { id: x })]), I = [i, ": ", C(2, b)], M = [E, ":"];
          o(d.content) || m(d) && d.content && !y(d.content, ["mapping", "sequence"]) || j.type === "mapping" && h(B.content) && D(d.content) || y(d.content, ["mapping", "sequence"]) && d.content.tag === null && d.content.anchor === null ? M.push(i) : d.content && M.push(r), M.push(b);
          let V = C(f.tabWidth, M);
          return P(B.content, f) && !o(B.content) && !c(B.content) && !m(B) ? t([[g, V]]) : t([[T, e(I, V, { groupId: x })]]);
        }
        function P(S, j) {
          if (!S)
            return !0;
          switch (S.type) {
            case "plain":
            case "quoteSingle":
            case "quoteDouble":
              break;
            case "alias":
              return !0;
            default:
              return !1;
          }
          if (j.proseWrap === "preserve")
            return S.position.start.line === S.position.end.line;
          if (/\\$/m.test(j.originalText.slice(S.position.start.offset, S.position.end.offset)))
            return !1;
          switch (j.proseWrap) {
            case "never":
              return !S.value.includes(`
`);
            case "always":
              return !/[\n ]/.test(S.value);
            default:
              return !1;
          }
        }
        function A(S) {
          return S.key.content && S.key.content.type === "alias";
        }
        function N(S) {
          if (!S)
            return !0;
          switch (S.type) {
            case "plain":
            case "quoteDouble":
            case "quoteSingle":
              return S.position.start.line === S.position.end.line;
            case "alias":
              return !0;
            default:
              return !1;
          }
        }
        l.exports = w;
      } }), Fl = X({ "src/language-yaml/print/block.js"(u, l) {
        H();
        var { builders: { dedent: t, dedentToRoot: s, fill: i, hardline: e, join: n, line: r, literalline: o, markAsRoot: c }, utils: { getDocParts: h } } = pt(), { getAncestorCount: m, getBlockValueLineContents: y, hasIndicatorComment: p, isLastDescendantNode: D, isNode: C } = Dr(), { alignWithSpaces: w } = uu();
        function P(A, N, S) {
          let j = A.getValue(), k = m(A, (F) => C(F, ["sequence", "mapping"])), J = D(A), f = [j.type === "blockFolded" ? ">" : "|"];
          j.indent !== null && f.push(j.indent.toString()), j.chomping !== "clip" && f.push(j.chomping === "keep" ? "+" : "-"), p(j) && f.push(" ", N("indicatorComment"));
          let B = y(j, { parentIndent: k, isLastDescendant: J, options: S }), d = [];
          for (let [F, a] of B.entries())
            F === 0 && d.push(e), d.push(i(h(n(r, a)))), F !== B.length - 1 ? d.push(a.length === 0 ? e : c(o)) : j.chomping === "keep" && J && d.push(s(a.length === 0 ? e : o));
          return j.indent === null ? f.push(t(w(S.tabWidth, d))) : f.push(s(w(j.indent - 1 + k, d))), f;
        }
        l.exports = P;
      } }), Al = X({ "src/language-yaml/printer-yaml.js"(u, l) {
        H();
        var { builders: { breakParent: t, fill: s, group: i, hardline: e, join: n, line: r, lineSuffix: o, literalline: c }, utils: { getDocParts: h, replaceTextEndOfLine: m } } = pt(), { isPreviousLineEmpty: y } = bt(), { insertPragma: p, isPragma: D } = ml(), { locStart: C } = gl(), w = yl(), { getFlowScalarLineContents: P, getLastDescendantNode: A, hasLeadingComments: N, hasMiddleComments: S, hasTrailingComment: j, hasEndComments: k, hasPrettierIgnore: J, isLastDescendantNode: f, isNode: B, isInlineNode: d } = Dr(), F = hl(), { alignWithSpaces: a, printNextEmptyLine: g, shouldPrintEndComments: E } = uu(), { printFlowMapping: b, printFlowSequence: x } = El(), T = Cl(), I = Fl();
        function M(O, Z, ae) {
          let ne = O.getValue(), he = [];
          ne.type !== "mappingValue" && N(ne) && he.push([n(e, O.map(ae, "leadingComments")), e]);
          let { tag: q, anchor: Y } = ne;
          q && he.push(ae("tag")), q && Y && he.push(" "), Y && he.push(ae("anchor"));
          let me = "";
          B(ne, ["mapping", "sequence", "comment", "directive", "mappingItem", "sequenceItem"]) && !f(O) && (me = g(O, Z.originalText)), (q || Y) && (B(ne, ["sequence", "mapping"]) && !S(ne) ? he.push(e) : he.push(" ")), S(ne) && he.push([ne.middleComments.length === 1 ? "" : e, n(e, O.map(ae, "middleComments")), e]);
          let ge = O.getParentNode();
          return J(O) ? he.push(m(Z.originalText.slice(ne.position.start.offset, ne.position.end.offset).trimEnd(), c)) : he.push(i(V(ne, ge, O, Z, ae))), j(ne) && !B(ne, ["document", "documentHead"]) && he.push(o([ne.type === "mappingValue" && !ne.content ? "" : " ", ge.type === "mappingKey" && O.getParentNode(2).type === "mapping" && d(ne) ? "" : t, ae("trailingComment")])), E(ne) && he.push(a(ne.type === "sequenceItem" ? 2 : 0, [e, n(e, O.map((_e) => [y(Z.originalText, _e.getValue(), C) ? e : "", ae()], "endComments"))])), he.push(me), he;
        }
        function V(O, Z, ae, ne, he) {
          switch (O.type) {
            case "root": {
              let { children: q } = O, Y = [];
              ae.each((ge, _e) => {
                let Q = q[_e], W = q[_e + 1];
                _e !== 0 && Y.push(e), Y.push(he()), U(Q, W) ? (Y.push(e, "..."), j(Q) && Y.push(" ", he("trailingComment"))) : W && !j(W.head) && Y.push(e, "---");
              }, "children");
              let me = A(O);
              return (!B(me, ["blockLiteral", "blockFolded"]) || me.chomping !== "keep") && Y.push(e), Y;
            }
            case "document": {
              let q = Z.children[ae.getName() + 1], Y = [];
              return _(O, q, Z, ne) === "head" && ((O.head.children.length > 0 || O.head.endComments.length > 0) && Y.push(he("head")), j(O.head) ? Y.push(["---", " ", he(["head", "trailingComment"])]) : Y.push("---")), $(O) && Y.push(he("body")), n(e, Y);
            }
            case "documentHead":
              return n(e, [...ae.map(he, "children"), ...ae.map(he, "endComments")]);
            case "documentBody": {
              let { children: q, endComments: Y } = O, me = "";
              if (q.length > 0 && Y.length > 0) {
                let ge = A(O);
                B(ge, ["blockFolded", "blockLiteral"]) ? ge.chomping !== "keep" && (me = [e, e]) : me = e;
              }
              return [n(e, ae.map(he, "children")), me, n(e, ae.map(he, "endComments"))];
            }
            case "directive":
              return ["%", n(" ", [O.name, ...O.parameters])];
            case "comment":
              return ["#", O.value];
            case "alias":
              return ["*", O.value];
            case "tag":
              return ne.originalText.slice(O.position.start.offset, O.position.end.offset);
            case "anchor":
              return ["&", O.value];
            case "plain":
              return ee(O.type, ne.originalText.slice(O.position.start.offset, O.position.end.offset), ne);
            case "quoteDouble":
            case "quoteSingle": {
              let q = "'", Y = '"', me = ne.originalText.slice(O.position.start.offset + 1, O.position.end.offset - 1);
              if (O.type === "quoteSingle" && me.includes("\\") || O.type === "quoteDouble" && /\\[^"]/.test(me)) {
                let _e = O.type === "quoteDouble" ? Y : q;
                return [_e, ee(O.type, me, ne), _e];
              }
              if (me.includes(Y))
                return [q, ee(O.type, O.type === "quoteDouble" ? me.replace(/\\"/g, Y).replace(/'/g, q.repeat(2)) : me, ne), q];
              if (me.includes(q))
                return [Y, ee(O.type, O.type === "quoteSingle" ? me.replace(/''/g, q) : me, ne), Y];
              let ge = ne.singleQuote ? q : Y;
              return [ge, ee(O.type, me, ne), ge];
            }
            case "blockFolded":
            case "blockLiteral":
              return I(ae, he, ne);
            case "mapping":
            case "sequence":
              return n(e, ae.map(he, "children"));
            case "sequenceItem":
              return ["- ", a(2, O.content ? he("content") : "")];
            case "mappingKey":
            case "mappingValue":
              return O.content ? he("content") : "";
            case "mappingItem":
            case "flowMappingItem":
              return T(O, Z, ae, he, ne);
            case "flowMapping":
              return b(ae, he, ne);
            case "flowSequence":
              return x(ae, he, ne);
            case "flowSequenceItem":
              return he("content");
            default:
              throw new Error(`Unexpected node type ${O.type}`);
          }
        }
        function $(O) {
          return O.body.children.length > 0 || k(O.body);
        }
        function U(O, Z) {
          return j(O) || Z && (Z.head.children.length > 0 || k(Z.head));
        }
        function _(O, Z, ae, ne) {
          return ae.children[0] === O && /---(?:\s|$)/.test(ne.originalText.slice(C(O), C(O) + 4)) || O.head.children.length > 0 || k(O.head) || j(O.head) ? "head" : U(O, Z) ? !1 : Z ? "root" : !1;
        }
        function ee(O, Z, ae) {
          let ne = P(O, Z, ae);
          return n(e, ne.map((he) => s(h(n(r, he)))));
        }
        function R(O, Z) {
          if (B(Z))
            switch (delete Z.position, Z.type) {
              case "comment":
                if (D(Z.value))
                  return null;
                break;
              case "quoteDouble":
              case "quoteSingle":
                Z.type = "quote";
                break;
            }
        }
        l.exports = { preprocess: F, embed: w, print: M, massageAstNode: R, insertPragma: p };
      } }), vl = X({ "src/language-yaml/options.js"(u, l) {
        H();
        var t = pr();
        l.exports = { bracketSpacing: t.bracketSpacing, singleQuote: t.singleQuote, proseWrap: t.proseWrap };
      } }), bl = X({ "src/language-yaml/parsers.js"() {
        H();
      } }), xl = X({ "node_modules/linguist-languages/data/YAML.json"(u, l) {
        l.exports = { name: "YAML", type: "data", color: "#cb171e", tmScope: "source.yaml", aliases: ["yml"], extensions: [".yml", ".mir", ".reek", ".rviz", ".sublime-syntax", ".syntax", ".yaml", ".yaml-tmlanguage", ".yaml.sed", ".yml.mysql"], filenames: [".clang-format", ".clang-tidy", ".gemrc", "CITATION.cff", "glide.lock", "yarn.lock"], aceMode: "yaml", codemirrorMode: "yaml", codemirrorMimeType: "text/x-yaml", languageId: 407 };
      } }), Sl = X({ "src/language-yaml/index.js"(u, l) {
        H();
        var t = Zn(), s = Al(), i = vl(), e = bl(), n = [t(xl(), (r) => ({ since: "1.14.0", parsers: ["yaml"], vscodeLanguageIds: ["yaml", "ansible", "home-assistant"], filenames: [...r.filenames.filter((o) => o !== "yarn.lock"), ".prettierrc", ".stylelintrc", ".lintstagedrc"] }))];
        l.exports = { languages: n, printers: { yaml: s }, options: i, parsers: e };
      } }), Bl = X({ "src/languages.js"(u, l) {
        H(), l.exports = [ao(), xo(), jo(), Ro(), zo(), fl(), Sl()];
      } });
      H();
      var { version: Tl } = Cn(), dr = vs(), { getSupportInfo: wl } = fu(), Nl = bs(), kl = Bl(), Pl = pt();
      function tr(u) {
        let l = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
        return function() {
          for (var t = arguments.length, s = new Array(t), i = 0; i < t; i++)
            s[i] = arguments[i];
          let e = s[l] || {}, n = e.plugins || [];
          return s[l] = Object.assign(Object.assign({}, e), {}, { plugins: [...kl, ...Array.isArray(n) ? n : Object.values(n)] }), u(...s);
        };
      }
      var _u = tr(dr.formatWithCursor);
      pe.exports = { formatWithCursor: _u, format(u, l) {
        return _u(u, l).formatted;
      }, check(u, l) {
        let { formatted: t } = _u(u, l);
        return t === u;
      }, doc: Pl, getSupportInfo: tr(wl, 0), version: Tl, util: Nl, __debug: { parse: tr(dr.parse), formatAST: tr(dr.formatAST), formatDoc: tr(dr.formatDoc), printToDoc: tr(dr.printToDoc), printDocToString: tr(dr.printDocToString) } };
    });
    return da();
  });
})(up);
const ip = /* @__PURE__ */ tp($u), ap = [
  {
    name: "EBNF",
    since: "0.1",
    parsers: ["ebnf"],
    extensions: [".ebnf"],
    tmScope: "ebnf.ebnf",
    aceMode: "text",
    linguistLanguageId: 666,
    vscodeLanguageIds: ["ebnf"]
  }
], sp = {
  ebnf: {
    print: rp
  }
}, op = {
  ebnf: {
    parse: ep,
    astFormat: "ebnf",
    locStart: Ql,
    locEnd: Hl,
    preprocess: Zl
  }
}, na = {
  ebnf: {
    printWidth: 66,
    tabWidth: 4,
    useTabs: !1
  }
}, lp = {
  languages: ap,
  printers: sp,
  parsers: op,
  defaultOptions: na
}, Hi = (xe, oe) => ip.format(xe, {
  parser: "ebnf",
  plugins: [lp],
  ...na,
  ...oe ?? {}
});
async function pp(xe) {
  const oe = $n.commands.registerCommand("extension.vibes", () => {
    $n.window.showInformationMessage("Vibes!");
  });
  xe.subscriptions.push(oe);
  const te = { language: "bbnf", scheme: "file" }, Ne = $n.commands.registerCommand("extension.sort", () => {
    const ke = $n.window.activeTextEditor;
    if (ke) {
      const gt = ke.document, $t = ke.selection, Zt = gt.getText($t), dn = Hi(Zt, { sort: !0 });
      if (!dn) {
        $n.window.showInformationMessage("Formatting failed.");
        return;
      }
      ke.edit((en) => {
        en.replace($t, dn);
      });
    }
  });
  xe.subscriptions.push(Ne);
  const Oe = $n.languages.registerDocumentFormattingEditProvider(
    te,
    {
      provideDocumentFormattingEdits(ke) {
        if ($n.window.showInformationMessage("formattin"), ke.getText().length === 0)
          return [];
        const gt = Hi(ke.getText());
        return gt ? [
          $n.TextEdit.replace(
            new $n.Range(
              ke.positionAt(0),
              ke.positionAt(ke.getText().length)
            ),
            gt
          )
        ] : ($n.window.showInformationMessage("Formatting failed."), []);
      }
    }
  );
  xe.subscriptions.push(Oe);
}
export {
  pp as activate
};
//# sourceMappingURL=extension.js.map

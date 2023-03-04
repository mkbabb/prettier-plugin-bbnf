import * as Fr from "vscode";
function eu(qe, ze) {
  for (var Pe = 0; Pe < ze.length; Pe++) {
    const wt = ze[Pe];
    if (typeof wt != "string" && !Array.isArray(wt)) {
      for (const At in wt)
        if (At !== "default" && !(At in qe)) {
          const pt = Object.getOwnPropertyDescriptor(wt, At);
          pt && Object.defineProperty(qe, At, pt.get ? pt : {
            enumerable: !0,
            get: () => wt[At]
          });
        }
    }
  }
  return Object.freeze(Object.defineProperty(qe, Symbol.toStringTag, { value: "Module" }));
}
var Ji = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Gi(qe) {
  return qe && qe.__esModule && Object.prototype.hasOwnProperty.call(qe, "default") ? qe.default : qe;
}
function tu(qe) {
  if (qe.__esModule)
    return qe;
  var ze = qe.default;
  if (typeof ze == "function") {
    var Pe = function wt() {
      if (this instanceof wt) {
        var At = [null];
        At.push.apply(At, arguments);
        var pt = Function.bind.apply(ze, At);
        return new pt();
      }
      return ze.apply(this, arguments);
    };
    Pe.prototype = ze.prototype;
  } else
    Pe = {};
  return Object.defineProperty(Pe, "__esModule", { value: !0 }), Object.keys(qe).forEach(function(wt) {
    var At = Object.getOwnPropertyDescriptor(qe, wt);
    Object.defineProperty(Pe, wt, At.get ? At : {
      enumerable: !0,
      get: function() {
        return qe[wt];
      }
    });
  }), Pe;
}
var Wi = {}, Qn = {}, ku = {}, Pu = {};
(function(qe) {
  var ze = Object.defineProperty, Pe = (se, ie, re) => ie in se ? ze(se, ie, { enumerable: !0, configurable: !0, writable: !0, value: re }) : se[ie] = re, wt = (se, ie, re) => (Pe(se, typeof ie != "symbol" ? ie + "" : ie, re), re);
  Object.defineProperty(qe, Symbol.toStringTag, { value: "Module" });
  class At {
    constructor(ie, re = void 0, ve = 0, Te = !1) {
      this.src = ie, this.value = re, this.offset = ve, this.isError = Te;
    }
    ok(ie, re = 0) {
      return new At(this.src, ie, this.offset + re);
    }
    err(ie, re = 0) {
      const ve = this.ok(ie, re);
      return ve.isError = !0, ve;
    }
    from(ie, re = 0) {
      return new At(this.src, ie, this.offset + re, this.isError);
    }
    getColumnNumber() {
      const ie = this.offset, re = this.src.lastIndexOf(`
`, ie), ve = re === -1 ? ie : ie - (re + 1);
      return Math.max(0, ve);
    }
    getLineNumber() {
      const ie = this.src.slice(0, this.offset).split(`
`).length - 1;
      return Math.max(0, ie);
    }
  }
  function pt(se, ie, ...re) {
    return { name: se, parser: ie, args: re };
  }
  let sn = 0;
  const Kt = /* @__PURE__ */ new Map(), dn = /* @__PURE__ */ new Map();
  function Mn(se) {
    return se.parser ? se.parser : se.parser = se();
  }
  class Lt {
    constructor(ie, re = {}) {
      wt(this, "id", sn++), this.parser = ie, this.context = re;
    }
    parse(ie) {
      return Kt.clear(), dn.clear(), this.parser(new At(ie)).value;
    }
    getCijKey(ie) {
      return `${this.id}${ie.offset}`;
    }
    atLeftRecursionLimit(ie) {
      return (dn.get(this.getCijKey(ie)) ?? 0) > ie.src.length - ie.offset;
    }
    memoize() {
      const ie = (re) => {
        const ve = this.getCijKey(re), Te = dn.get(ve) ?? 0;
        let Re = Kt.get(this.id);
        if (Re && Re.offset >= re.offset)
          return Re;
        if (this.atLeftRecursionLimit(re))
          return re.err(void 0);
        dn.set(ve, Te + 1);
        const yt = this.parser(re);
        return Re = Kt.get(this.id), Re && Re.offset > yt.offset ? yt.offset = Re.offset : Re || Kt.set(this.id, yt), yt;
      };
      return new Lt(ie, pt("memoize", this));
    }
    mergeMemos() {
      const ie = (re) => {
        let ve = Kt.get(this.id);
        if (ve)
          return ve;
        if (this.atLeftRecursionLimit(re))
          return re.err(void 0);
        const Te = this.parser(re);
        return ve = Kt.get(this.id), ve || Kt.set(this.id, Te), Te;
      };
      return new Lt(ie, pt("mergeMemo", this));
    }
    then(ie) {
      if (wn(this, ie))
        return hn([this, ie], "", (ve) => [ve == null ? void 0 : ve[0], ve == null ? void 0 : ve[1]]);
      const re = (ve) => {
        const Te = this.parser(ve);
        if (!Te.isError) {
          const Re = ie.parser(Te);
          if (!Re.isError)
            return Re.ok([Te.value, Re.value]);
        }
        return ve.err(void 0);
      };
      return new Lt(re, pt("then", this, this, ie));
    }
    or(ie) {
      if (wn(this, ie))
        return hn([this, ie], "|");
      const re = (ve) => {
        const Te = this.parser(ve);
        return Te.isError ? ie.parser(ve) : Te;
      };
      return new Lt(re, pt("or", this, this, ie));
    }
    chain(ie, re = !1) {
      const ve = (Te) => {
        const Re = this.parser(Te);
        return Re.isError ? Re : Re.value || re ? ie(Re.value).parser(Re) : Te;
      };
      return new Lt(ve, pt("chain", this, ie));
    }
    map(ie, re = !1) {
      const ve = (Te) => {
        const Re = this.parser(Te);
        return !Re.isError || re ? Re.ok(ie(Re.value)) : Re;
      };
      return new Lt(ve, pt("map", this));
    }
    mapState(ie) {
      const re = (ve) => {
        const Te = this.parser(ve);
        return ie(Te);
      };
      return new Lt(re, pt("mapState", this));
    }
    skip(ie) {
      const re = (ve) => {
        const Te = this.parser(ve);
        if (!Te.isError) {
          const Re = ie.parser(Te);
          if (!Re.isError)
            return Re.ok(Te.value);
        }
        return ve.err(void 0);
      };
      return new Lt(re, pt("skip", this, ie));
    }
    next(ie) {
      const re = this.then(ie).map(([, ve]) => ve);
      return re.context = pt("next", this, ie), re;
    }
    opt() {
      const ie = (re) => {
        const ve = this.parser(re);
        return ve.isError ? re.ok(void 0) : ve;
      };
      return new Lt(ie, pt("opt", this));
    }
    not(ie) {
      const re = (Te) => this.parser(Te).isError ? Te.ok(Te.value) : Te.err(void 0), ve = (Te) => {
        const Re = this.parser(Te);
        return Re.isError || ie.parser(Te).isError ? Re : Te.err(void 0);
      };
      return new Lt(ie ? ve : re, pt("not", this, ie));
    }
    wrap(ie, re) {
      if (wn(ie, this, re))
        return Sn(ie, this, re);
      const ve = ie.next(this).skip(re);
      return ve.context = pt("wrap", this, ie, re), ve;
    }
    trim(ie = Ge) {
      var re;
      if (((re = ie.context) == null ? void 0 : re.name) === "whitespace") {
        if (wn(this, ie))
          return hn([ie, this, ie], "", (Te) => Te == null ? void 0 : Te[2]);
        const ve = (Te) => {
          const Re = Hn(Te), yt = this.parser(Re);
          return yt.isError ? Te.err(void 0) : Hn(yt);
        };
        return new Lt(ve, pt("trimWhitespace", this));
      }
      return this.wrap(ie, ie);
    }
    many(ie = 0, re = 1 / 0) {
      const ve = (Te) => {
        const Re = [];
        let yt = Te;
        for (let Rt = 0; Rt < re; Rt += 1) {
          const yn = this.parser(yt);
          if (yn.isError)
            break;
          Re.push(yn.value), yt = yn;
        }
        return Re.length >= ie ? yt.ok(Re) : Te.err([]);
      };
      return new Lt(ve, pt("many", this, ie, re));
    }
    sepBy(ie, re = 0, ve = 1 / 0) {
      const Te = (Re) => {
        const yt = [];
        let Rt = Re;
        for (let yn = 0; yn < ve; yn += 1) {
          const Yn = this.parser(Rt);
          if (Yn.isError)
            break;
          Rt = Yn, yt.push(Rt.value);
          const er = ie.parser(Rt);
          if (er.isError)
            break;
          Rt = er;
        }
        return yt.length > re ? Rt.ok(yt) : Re.err([]);
      };
      return new Lt(Te, pt("sepBy", this, ie));
    }
    eof() {
      const ie = this.skip(Gn());
      return ie.context = pt("eof", this), ie;
    }
    toString() {
      var ie;
      return (ie = this.context) == null ? void 0 : ie.name;
    }
    static lazy(ie) {
      const re = (ve) => Mn(ie).parser(ve);
      return new Lt(re, pt("lazy", void 0, ie));
    }
  }
  function wn(...se) {
    return se.every((ie) => {
      var re, ve, Te, Re;
      return (((re = ie.context) == null ? void 0 : re.name) === "string" || ((ve = ie.context) == null ? void 0 : ve.name) === "regex" || ((Te = ie.context) == null ? void 0 : Te.name) === "whitespace") && ((Re = ie.context) == null ? void 0 : Re.args);
    });
  }
  function ar(se) {
    var ie, re, ve, Te, Re;
    if (((ie = se.context) == null ? void 0 : ie.name) === "string")
      return (re = se.context) == null ? void 0 : re.args[0].replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    if (((ve = se.context) == null ? void 0 : ve.name) === "regex" || ((Te = se.context) == null ? void 0 : Te.name) === "whitespace")
      return (Re = se.context) == null ? void 0 : Re.args[0].source;
  }
  function hn(se, ie = "", re) {
    const ve = se.map((yt) => `(${ar(yt)})`).join(ie), Te = new RegExp(ve), Re = Vn(Te, re);
    return ie !== "|" && (Re.context = pt("regexConcat", this, Te)), Re;
  }
  function Sn(se, ie, re) {
    const ve = hn([se, ie, re], "", (Te) => Te == null ? void 0 : Te[2]);
    return ve.context.name = "regexWrap", ve;
  }
  function Gn() {
    const se = (ie) => ie.offset >= ie.src.length ? ie.ok(void 0) : ie.err();
    return new Lt(se, pt("eof"));
  }
  function zn(se, ie, re) {
    const ve = re.value.bind(se);
    re.value = function() {
      const Te = (Re) => Mn(ve).parser(Re);
      return new Lt(Te, pt("lazy", void 0, ve));
    };
  }
  function En(...se) {
    if (wn(...se))
      return hn(se, "|");
    const ie = (re) => {
      for (const ve of se) {
        const Te = ve.parser(re);
        if (!Te.isError)
          return Te;
      }
      return re.err(void 0);
    };
    return new Lt(se.length === 1 ? se[0].parser : ie, pt("any", void 0, ...se));
  }
  function Rn(...se) {
    const ie = (re) => {
      const ve = [];
      for (const Te of se) {
        const Re = Te.parser(re);
        if (Re.isError)
          return Re;
        Re.value !== void 0 && ve.push(Re.value), re = Re;
      }
      return re.ok(ve);
    };
    return new Lt(se.length === 1 ? se[0].parser : ie, pt("all", void 0, ...se));
  }
  function on(se) {
    const ie = (re) => {
      if (re.offset >= re.src.length)
        return re.err(void 0);
      const ve = re.src.slice(re.offset, re.offset + se.length);
      return ve === se ? re.ok(ve, ve.length) : re.err(void 0);
    };
    return new Lt(ie, pt("string", void 0, se));
  }
  function Vn(se, ie = (re) => re == null ? void 0 : re[0]) {
    const re = se.flags.replace(/y/g, ""), ve = new RegExp(se, re + "y"), Te = (Re) => {
      if (Re.offset >= Re.src.length)
        return Re.err(void 0);
      ve.lastIndex = Re.offset;
      const yt = ie(Re.src.match(ve));
      return yt ? Re.ok(yt, ve.lastIndex - Re.offset) : yt === "" ? Re.ok(void 0) : Re.err(void 0);
    };
    return new Lt(Te, pt("regex", void 0, se));
  }
  const gn = /\s*/y, Hn = (se) => {
    var ie;
    if (se.offset >= se.src.length)
      return se;
    gn.lastIndex = se.offset;
    const re = ((ie = se.src.match(gn)) == null ? void 0 : ie[0]) ?? "";
    return se.ok(se.value, re.length);
  }, Ge = Vn(/\s*/);
  Ge.context.name = "whitespace", qe.Parser = Lt, qe.all = Rn, qe.any = En, qe.eof = Gn, qe.getLazyParser = Mn, qe.lazy = zn, qe.regex = Vn, qe.string = on, qe.whitespace = Ge;
})(Pu);
const vl = /* @__PURE__ */ eu({
  __proto__: null,
  default: Pu
}, [Pu]), bl = /* @__PURE__ */ tu(vl);
(function(qe) {
  Object.defineProperty(qe, Symbol.toStringTag, { value: "Module" });
  const ze = bl;
  var Pe = Object.defineProperty, wt = Object.getOwnPropertyDescriptor, At = (Ge, se, ie, re) => {
    for (var ve = re > 1 ? void 0 : re ? wt(se, ie) : se, Te = Ge.length - 1, Re; Te >= 0; Te--)
      (Re = Ge[Te]) && (ve = (re ? Re(se, ie, ve) : Re(ve)) || ve);
    return re && ve && Pe(se, ie, ve), ve;
  };
  class pt {
    identifier() {
      return ze.regex(/[_a-zA-Z][_a-zA-Z0-9]*/).trim();
    }
    literal() {
      return ze.any(ze.regex(/[^"]+/).wrap(ze.string('"'), ze.string('"')), ze.regex(/[^']+/).wrap(ze.string("'"), ze.string("'"))).map((se) => ({ type: "literal", value: se }));
    }
    epsilon() {
      return ze.any(ze.string("epsilon"), ze.string("ε")).trim().map((se) => ({ type: "epsilon", value: void 0 }));
    }
    nonterminal() {
      return this.identifier().map((se) => ({ type: "nonterminal", value: se }));
    }
    group() {
      return this.expression().trim().wrap(ze.string("("), ze.string(")")).map((se) => ({ type: "group", value: se }));
    }
    regex() {
      return ze.regex(/[^\/]*/).wrap(ze.string("/"), ze.string("/")).map((se) => ({ type: "regex", value: new RegExp(se) }));
    }
    optional() {
      return this.term().skip(ze.string("?").trim()).map((se) => ({ type: "optional", value: se }));
    }
    optionalGroup() {
      return this.expression().trim().wrap(ze.string("["), ze.string("]")).map((se) => ({ type: "optional", value: se }));
    }
    optionalWhitespace() {
      return this.term().skip(ze.string("?w").trim()).map((se) => ({ type: "optionalWhitespace", value: se }));
    }
    minus() {
      return ze.all(this.term().skip(ze.string("-").trim()), this.term()).map(([se, ie]) => ({ type: "minus", value: [se, ie] }));
    }
    manyGroup() {
      return this.expression().trim().wrap(ze.string("{"), ze.string("}")).map((se) => ({ type: "many", value: se }));
    }
    many() {
      return this.term().skip(ze.string("*").trim()).map((se) => ({ type: "many", value: se }));
    }
    many1() {
      return this.term().skip(ze.string("+").trim()).map((se) => ({ type: "many1", value: se }));
    }
    next() {
      return ze.all(this.factor().skip(ze.string(">>").trim()), ze.any(this.skip(), this.factor())).map(([se, ie]) => ({ type: "next", value: [se, ie] }));
    }
    skip() {
      return ze.all(ze.any(this.next(), this.factor()).skip(ze.string("<<").trim()), this.factor()).map(([se, ie]) => ({ type: "skip", value: [se, ie] }));
    }
    concatenation() {
      return ze.any(this.skip(), this.next(), this.factor()).sepBy(ze.string(",").trim(), 1).map((se) => ({ type: "concatenation", value: se }));
    }
    alternation() {
      return ze.any(this.concatenation(), this.skip(), this.next(), this.factor()).sepBy(ze.string("|").trim(), 1).map((se) => ({ type: "alternation", value: se }));
    }
    bigComment() {
      return ze.regex(/\/\*[^]*?\*\//).trim();
    }
    comment() {
      return ze.regex(/\/\/.*/).trim().or(this.bigComment());
    }
    term() {
      return ze.any(this.epsilon(), this.literal(), this.nonterminal(), this.regex(), this.group(), this.optionalGroup(), this.manyGroup()).then(this.bigComment().opt()).map(([se, ie]) => (se.comment = ie, se));
    }
    factor() {
      return ze.any(this.optionalWhitespace(), this.optional(), this.many(), this.many1(), this.minus(), this.term());
    }
    expression() {
      return ze.any(this.alternation(), this.concatenation(), this.skip(), this.next(), this.factor());
    }
    productionRule() {
      return ze.all(this.identifier().skip(ze.string("=").trim()), this.expression().skip(ze.any(ze.string(";").trim(), ze.string(".").trim()))).map(([se, ie]) => ({ name: se, expression: ie }));
    }
    grammar() {
      return ze.all(this.comment().many(), this.productionRule(), this.comment().many()).map(([se, ie, re]) => (ie.comment = { above: se, below: re }, ie)).many(1);
    }
  }
  At([ze.lazy], pt.prototype, "group", 1), At([ze.lazy], pt.prototype, "regex", 1), At([ze.lazy], pt.prototype, "optionalGroup", 1), At([ze.lazy], pt.prototype, "manyGroup", 1), At([ze.lazy], pt.prototype, "next", 1), At([ze.lazy], pt.prototype, "skip", 1);
  function sn(Ge) {
    const se = /* @__PURE__ */ new Set(), ie = [];
    function re(Te, Re) {
      if (Re.has(Te) || se.has(Te))
        return;
      Re.add(Te);
      const yt = Ge.get(Te);
      if (!yt)
        return;
      const Rt = yt.expression;
      if (Rt.type === "nonterminal")
        re(Rt.value, Re);
      else if (Rt.value instanceof Array)
        for (const yn of Rt.value)
          yn.type === "nonterminal" && re(yn.value, Re);
      se.add(Te), Re.delete(Te), ie.unshift(Ge.get(Te));
    }
    for (const [Te] of Ge)
      re(Te, /* @__PURE__ */ new Set());
    const ve = /* @__PURE__ */ new Map();
    for (const Te of ie)
      ve.set(Te.name, Te);
    return ve;
  }
  const Kt = (Ge, se) => {
    if (!(!(Ge != null && Ge.type) || !(se != null && se.type) || Ge.type !== se.type))
      switch (Ge.type) {
        case "literal":
        case "nonterminal":
          return Ge.value !== se.value ? void 0 : [Ge, { type: "epsilon" }, { type: "epsilon" }];
        case "group":
        case "optional":
        case "many":
        case "many1": {
          const ie = Kt(Ge.value, se.value);
          return ie ? [{ type: Ge.type, value: ie[0] }, { type: Ge.type, value: ie[1] }, { type: Ge.type, value: ie[2] }] : void 0;
        }
        case "concatenation": {
          const ie = Ge.value.map((yt, Rt) => Kt(Ge.value[Rt], se.value[Rt]));
          if (ie.some((yt) => yt === void 0))
            return;
          const re = ie.map((yt) => yt[0]), ve = ie.map((yt) => yt[1]), Te = ie.map((yt) => yt[2]), Re = re.lastIndexOf(null);
          return Re === re.length - 1 ? void 0 : [{ type: "concatenation", value: re.slice(Re + 1) }, { type: "concatenation", value: ve }, { type: "concatenation", value: Te }];
        }
        case "alternation":
          for (const ie of Ge.value) {
            const re = Kt(ie, se);
            if (re)
              return re;
          }
          for (const ie of se.value) {
            const re = Kt(Ge, ie);
            if (re)
              return re;
          }
          return;
      }
  }, dn = (Ge, se) => {
    if (Ge.type !== se.type)
      return !1;
    switch (Ge.type) {
      case "literal":
      case "nonterminal":
        return Ge.value === se.value;
      case "group":
      case "optional":
      case "many":
      case "many1":
        return dn(Ge.value, se.value);
      case "minus":
      case "skip":
      case "next":
        return dn(Ge.value[0], se.value[0]) && dn(Ge.value[1], se.value[1]);
      case "concatenation":
        return Ge.value.every((ie, re) => dn(ie, se.value[re]));
      case "alternation":
        return Ge.value.some((ie, re) => dn(ie, se.value[re]));
      case "epsilon":
        return !0;
    }
  };
  function Mn(Ge, se) {
    const ie = /* @__PURE__ */ new Map();
    let re = null;
    for (let ve = 0; ve < se.value.length - 1; ve++) {
      const Te = se.value[ve], Re = se.value[ve + 1], yt = Kt(Te, Re);
      if (yt) {
        const [Rt, yn, Yn] = yt;
        re !== null && dn(Rt, re) ? ie.get(re).push(Yn) : (ie.set(Rt, [yn, Yn]), re = Rt), ve === se.value.length - 2 && se.value.shift(), se.value.shift(), ve -= 1;
      }
    }
    for (const [ve, Te] of ie) {
      const Re = { type: "concatenation", value: [{ type: "group", value: { type: "alternation", value: Te } }, { type: "group", value: ve }] };
      se.value.push(Re);
    }
  }
  const Lt = (Ge, se, ie) => {
    const re = [], ve = [], Te = { type: "nonterminal", value: ie };
    for (let Re = 0; Re < se.value.length; Re++) {
      const yt = se.value[Re];
      yt.type === "concatenation" && yt.value[0].value === Ge ? ve.push({ type: "concatenation", value: [...yt.value.slice(1), Te] }) : re.push({ type: "concatenation", value: [yt, Te] });
    }
    return ve.length === 0 ? [void 0, void 0] : (ve.push({ type: "epsilon" }), [{ type: "alternation", value: re }, { type: "alternation", value: ve }]);
  };
  function wn(Ge) {
    const se = /* @__PURE__ */ new Map();
    let ie = 0;
    for (const [re, ve] of Ge) {
      const { expression: Te } = ve;
      if (Te.type === "alternation") {
        const Re = `${re}_${ie++}`, [yt, Rt] = Lt(re, Te, Re);
        yt && (se.set(Re, { name: Re, expression: Rt }), se.set(re, { name: re, expression: yt, comment: ve.comment }));
      }
    }
    if (se.size === 0)
      return Ge;
    for (const [re, ve] of se)
      Ge.set(re, ve);
    for (const [re, ve] of Ge) {
      const { expression: Te } = ve;
      Te.type === "alternation" && Mn(re, Te);
    }
  }
  function ar(Ge) {
    const se = (ie, re) => {
      re.type === "concatenation" && re.value[0].type === "nonterminal" && re.value[0].value === ie && (re.value.slice(1, re.value.length), re.value.shift());
    };
    for (const [ie, re] of Ge)
      se(ie, re);
  }
  function hn(Ge) {
    const se = sn(Ge);
    return wn(se), se;
  }
  function Sn(Ge) {
    const se = new pt().grammar().trim().parse(Ge);
    if (!se)
      throw new Error("Failed to parse EBNF grammar");
    return se.reduce((ie, re, ve) => (ie.set(re.name, re), ie), /* @__PURE__ */ new Map());
  }
  function Gn(Ge) {
    function se(re, ve) {
      var Te, Re;
      switch (ve.type) {
        case "literal":
          return ze.string(ve.value);
        case "nonterminal":
          const yt = ze.Parser.lazy(() => ie[ve.value]);
          return yt.context.name = ve.value, yt;
        case "epsilon":
          return ze.eof().opt();
        case "group":
          return se(re, ve.value);
        case "regex":
          return ze.regex(ve.value);
        case "optionalWhitespace":
          return se(re, ve.value).trim();
        case "optional":
          return se(re, ve.value).opt();
        case "many":
          return se(re, ve.value).many();
        case "many1":
          return se(re, ve.value).many(1);
        case "skip":
          return se(re, ve.value[0]).skip(se(re, ve.value[1]));
        case "next":
          return se(re, ve.value[0]).next(se(re, ve.value[1]));
        case "minus":
          return se(re, ve.value[0]).not(se(re, ve.value[1]));
        case "concatenation": {
          const Rt = ve.value.map((yn) => se(re, yn));
          return ((Re = (Te = Rt.at(-1)) == null ? void 0 : Te.context) == null ? void 0 : Re.name) === "eof" && Rt.pop(), ze.all(...Rt);
        }
        case "alternation":
          return ze.any(...ve.value.map((Rt) => se(re, Rt)));
      }
    }
    const ie = {};
    for (const [re, ve] of Ge.entries())
      ie[re] = se(re, ve.expression);
    return ie;
  }
  function zn(Ge, se = !1) {
    let ie = Sn(Ge);
    return se && (ie = hn(ie)), [Gn(ie), ie];
  }
  function En(Ge, se) {
    const ie = Ge.split(se);
    if (ie.length === 1)
      return Ge;
    Ge = ie.map((ve, Te) => Te === ie.length - 1 ? se + ve : Te === 0 ? ve : ve.split(",").length > 1 ? `
	${se} ` + ve : se + ve).join("");
    const re = 66;
    if (Ge.length > re) {
      let ve = re;
      for (let Te = 0; Te < Ge.length; Te += ve) {
        const Re = Te === 0 ? re : Te + ve, yt = Ge.indexOf(se, Re);
        if (yt === -1)
          break;
        Ge = Ge.slice(0, yt) + `
	${se}` + Ge.slice(yt + 1);
      }
    }
    return Ge;
  }
  const Rn = ["symbol", "identifier", "terminal", "pipe", "comma", "plus", "minus", "star", "div", "question", "eof", "optional_whitespace", "regex", "rhs", "rule", "grammar"], on = (Ge) => {
    const [se, ie] = zn(Ge);
    for (const re of Rn)
      se[re] = se[re].trim();
    return se.symbol = se.symbol, se.identifier = se.identifier.map((re) => re.flat().join("")), se.terminal = se.terminal.map((re) => re.flat().join("")), se.regex = se.regex.map((re) => re.flat().join("")), se.rhs = se.rhs.map((re) => {
      const ve = (re instanceof Array ? re.flat(1 / 0) : re).join(" ");
      return En(ve, "|");
    }), se.rule = se.rule.map((re) => re.flat().join(" ")), se.grammar.map((re) => {
      let ve = 0;
      for (let Te = 0; Te < re.length; Te++) {
        const Re = re[Te];
        Re.length > 80 ? (re[Te] = Re + `
`, Te > 0 && ve !== Te - 1 && (re[Te - 1] = re[Te - 1] + `
`), ve = Te) : Te - ve > 2 && (re[Te] = Re + `
`, ve = Te);
      }
      return re.join(`
`);
    });
  };
  function Vn(Ge) {
    return Ge.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  function gn(Ge) {
    switch (Ge.type) {
      case "literal":
        return Vn(Ge.value);
      case "nonterminal":
        return `($${Ge.value})`;
      case "epsilon":
        return "";
      case "group":
        return `(${gn(Ge.value)})`;
      case "regex":
        return Ge.value.source;
      case "optional":
        return `(${gn(Ge.value)})?`;
      case "minus":
        return `${gn(Ge.value[0])}(?!${gn(Ge.value[1])})`;
      case "many":
        return `(${gn(Ge.value)})*`;
      case "many1":
        return `(${gn(Ge.value)})+`;
      case "skip":
        return `${gn(Ge.value[0])}(?:${gn(Ge.value[1])})?`;
      case "next":
        return `${gn(Ge.value[0])}(?=${gn(Ge.value[1])})`;
      case "concatenation":
        return Ge.value.map(gn).join("");
      case "alternation":
        return Ge.value.map((se) => `(${gn(se)})`).join("|");
    }
  }
  function Hn(Ge) {
    const se = [];
    for (const [ie, re] of Ge)
      se.push({ name: ie, match: gn(re) });
    return { name: "EEBNF", scopeName: "source.eebnf", fileTypes: ["eebnf"], patterns: se };
  }
  qe.EBNFGrammar = pt, qe.EBNFParser = on, qe.comparePrefix = dn, qe.findCommonPrefix = Kt, qe.generateASTFromEBNF = Sn, qe.generateParserFromAST = Gn, qe.generateParserFromEBNF = zn, qe.removeAllLeftRecursion = hn, qe.removeDirectLeftRecursion = wn, qe.removeIndirectLeftRecursion = ar, qe.rewriteTreeLeftRecursion = Mn, qe.topologicalSort = sn, qe.transformEBNFASTToTextMateLanguage = Hn;
})(ku);
const xl = /* @__PURE__ */ eu({
  __proto__: null,
  default: ku
}, [ku]), Sl = /* @__PURE__ */ tu(xl);
Object.defineProperty(Qn, "__esModule", { value: !0 });
Qn.parse = Qn.preprocess = Qn.locEnd = Qn.locStart = void 0;
const qi = Sl;
function Bl(qe) {
  return 0;
}
Qn.locStart = Bl;
function Tl(qe) {
  return 0;
}
Qn.locEnd = Tl;
function wl(qe, ze) {
  return qe;
}
Qn.preprocess = wl;
function Nl(qe, ze, Pe) {
  let wt = (0, qi.generateASTFromEBNF)(qe);
  return wt = (0, qi.topologicalSort)(wt), wt = [...wt.entries()].reverse().filter(([At]) => At).reduce((At, [pt, sn]) => At.set(pt, sn), /* @__PURE__ */ new Map()), wt;
}
Qn.parse = Nl;
var nu = {}, Hr = {}, kl = {
  get exports() {
    return Hr;
  },
  set exports(qe) {
    Hr = qe;
  }
};
(function(qe, ze) {
  (function(Pe) {
    qe.exports = Pe();
  })(function() {
    var Pe = Object.getOwnPropertyNames, wt = (pt, sn) => function() {
      return sn || (0, pt[Pe(pt)[0]])((sn = { exports: {} }).exports, sn), sn.exports;
    }, At = wt({
      "dist/_doc.js.umd.js"(pt, sn) {
        var Kt = Object.create, dn = Object.defineProperty, Mn = Object.getOwnPropertyDescriptor, Lt = Object.getOwnPropertyNames, wn = Object.getPrototypeOf, ar = Object.prototype.hasOwnProperty, hn = (Ze, Nt) => function() {
          return Ze && (Nt = (0, Ze[Lt(Ze)[0]])(Ze = 0)), Nt;
        }, Sn = (Ze, Nt) => function() {
          return Nt || (0, Ze[Lt(Ze)[0]])((Nt = {
            exports: {}
          }).exports, Nt), Nt.exports;
        }, Gn = (Ze, Nt) => {
          for (var Ot in Nt)
            dn(Ze, Ot, {
              get: Nt[Ot],
              enumerable: !0
            });
        }, zn = (Ze, Nt, Ot, Mt) => {
          if (Nt && typeof Nt == "object" || typeof Nt == "function")
            for (let Vt of Lt(Nt))
              !ar.call(Ze, Vt) && Vt !== Ot && dn(Ze, Vt, {
                get: () => Nt[Vt],
                enumerable: !(Mt = Mn(Nt, Vt)) || Mt.enumerable
              });
          return Ze;
        }, En = (Ze, Nt, Ot) => (Ot = Ze != null ? Kt(wn(Ze)) : {}, zn(Nt || !Ze || !Ze.__esModule ? dn(Ot, "default", {
          value: Ze,
          enumerable: !0
        }) : Ot, Ze)), Rn = (Ze) => zn(dn({}, "__esModule", {
          value: !0
        }), Ze), on = hn({
          "<define:process>"() {
          }
        }), Vn = Sn({
          "src/document/doc-builders.js"(Ze, Nt) {
            on();
            function Ot(St) {
              return {
                type: "concat",
                parts: St
              };
            }
            function Mt(St) {
              return {
                type: "indent",
                contents: St
              };
            }
            function Vt(St, xe) {
              return {
                type: "align",
                contents: xe,
                n: St
              };
            }
            function ln(St) {
              let xe = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
              return {
                type: "group",
                id: xe.id,
                contents: St,
                break: Boolean(xe.shouldBreak),
                expandedStates: xe.expandedStates
              };
            }
            function bt(St) {
              return Vt(Number.NEGATIVE_INFINITY, St);
            }
            function Zt(St) {
              return Vt({
                type: "root"
              }, St);
            }
            function an(St) {
              return Vt(-1, St);
            }
            function Jt(St, xe) {
              return ln(St[0], Object.assign(Object.assign({}, xe), {}, {
                expandedStates: St
              }));
            }
            function vn(St) {
              return {
                type: "fill",
                parts: St
              };
            }
            function et(St, xe) {
              let Oe = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
              return {
                type: "if-break",
                breakContents: St,
                flatContents: xe,
                groupId: Oe.groupId
              };
            }
            function rn(St, xe) {
              return {
                type: "indent-if-break",
                contents: St,
                groupId: xe.groupId,
                negate: xe.negate
              };
            }
            function pn(St) {
              return {
                type: "line-suffix",
                contents: St
              };
            }
            var zt = {
              type: "line-suffix-boundary"
            }, Nn = {
              type: "break-parent"
            }, Xn = {
              type: "trim"
            }, Kn = {
              type: "line",
              hard: !0
            }, bn = {
              type: "line",
              hard: !0,
              literal: !0
            }, sr = {
              type: "line"
            }, qt = {
              type: "line",
              soft: !0
            }, Gt = Ot([Kn, Nn]), tn = Ot([bn, Nn]), Cn = {
              type: "cursor",
              placeholder: Symbol("cursor")
            };
            function cn(St, xe) {
              const Oe = [];
              for (let Ye = 0; Ye < xe.length; Ye++)
                Ye !== 0 && Oe.push(St), Oe.push(xe[Ye]);
              return Ot(Oe);
            }
            function It(St, xe, Oe) {
              let Ye = St;
              if (xe > 0) {
                for (let dt = 0; dt < Math.floor(xe / Oe); ++dt)
                  Ye = Mt(Ye);
                Ye = Vt(xe % Oe, Ye), Ye = Vt(Number.NEGATIVE_INFINITY, Ye);
              }
              return Ye;
            }
            function Xt(St, xe) {
              return {
                type: "label",
                label: St,
                contents: xe
              };
            }
            Nt.exports = {
              concat: Ot,
              join: cn,
              line: sr,
              softline: qt,
              hardline: Gt,
              literalline: tn,
              group: ln,
              conditionalGroup: Jt,
              fill: vn,
              lineSuffix: pn,
              lineSuffixBoundary: zt,
              cursor: Cn,
              breakParent: Nn,
              ifBreak: et,
              trim: Xn,
              indent: Mt,
              indentIfBreak: rn,
              align: Vt,
              addAlignmentToDoc: It,
              markAsRoot: Zt,
              dedentToRoot: bt,
              dedent: an,
              hardlineWithoutBreakParent: Kn,
              literallineWithoutBreakParent: bn,
              label: Xt
            };
          }
        }), gn = Sn({
          "src/common/end-of-line.js"(Ze, Nt) {
            on();
            function Ot(bt) {
              const Zt = bt.indexOf("\r");
              return Zt >= 0 ? bt.charAt(Zt + 1) === `
` ? "crlf" : "cr" : "lf";
            }
            function Mt(bt) {
              switch (bt) {
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
            function Vt(bt, Zt) {
              let an;
              switch (Zt) {
                case `
`:
                  an = /\n/g;
                  break;
                case "\r":
                  an = /\r/g;
                  break;
                case `\r
`:
                  an = /\r\n/g;
                  break;
                default:
                  throw new Error(`Unexpected "eol" ${JSON.stringify(Zt)}.`);
              }
              const Jt = bt.match(an);
              return Jt ? Jt.length : 0;
            }
            function ln(bt) {
              return bt.replace(/\r\n?/g, `
`);
            }
            Nt.exports = {
              guessEndOfLine: Ot,
              convertEndOfLineToChars: Mt,
              countEndOfLineChars: Vt,
              normalizeEndOfLine: ln
            };
          }
        }), Hn = Sn({
          "src/utils/get-last.js"(Ze, Nt) {
            on();
            var Ot = (Mt) => Mt[Mt.length - 1];
            Nt.exports = Ot;
          }
        });
        function Ge() {
          let {
            onlyFirst: Ze = !1
          } = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
          const Nt = ["[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)", "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))"].join("|");
          return new RegExp(Nt, Ze ? void 0 : "g");
        }
        var se = hn({
          "node_modules/strip-ansi/node_modules/ansi-regex/index.js"() {
            on();
          }
        });
        function ie(Ze) {
          if (typeof Ze != "string")
            throw new TypeError(`Expected a \`string\`, got \`${typeof Ze}\``);
          return Ze.replace(Ge(), "");
        }
        var re = hn({
          "node_modules/strip-ansi/index.js"() {
            on(), se();
          }
        });
        function ve(Ze) {
          return Number.isInteger(Ze) ? Ze >= 4352 && (Ze <= 4447 || Ze === 9001 || Ze === 9002 || 11904 <= Ze && Ze <= 12871 && Ze !== 12351 || 12880 <= Ze && Ze <= 19903 || 19968 <= Ze && Ze <= 42182 || 43360 <= Ze && Ze <= 43388 || 44032 <= Ze && Ze <= 55203 || 63744 <= Ze && Ze <= 64255 || 65040 <= Ze && Ze <= 65049 || 65072 <= Ze && Ze <= 65131 || 65281 <= Ze && Ze <= 65376 || 65504 <= Ze && Ze <= 65510 || 110592 <= Ze && Ze <= 110593 || 127488 <= Ze && Ze <= 127569 || 131072 <= Ze && Ze <= 262141) : !1;
        }
        var Te = hn({
          "node_modules/is-fullwidth-code-point/index.js"() {
            on();
          }
        }), Re = Sn({
          "node_modules/emoji-regex/index.js"(Ze, Nt) {
            on(), Nt.exports = function() {
              return /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67)\uDB40\uDC7F|(?:\uD83E\uDDD1\uD83C\uDFFF\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFE])|(?:\uD83E\uDDD1\uD83C\uDFFE\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFD\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFC\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFB\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFC-\uDFFF])|\uD83D\uDC68(?:\uD83C\uDFFB(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF]))|\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|[\u2695\u2696\u2708]\uFE0F|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))?|(?:\uD83C[\uDFFC-\uDFFF])\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF]))|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])\uFE0F|\u200D(?:(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D[\uDC66\uDC67])|\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC)?|(?:\uD83D\uDC69(?:\uD83C\uDFFB\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|(?:\uD83C[\uDFFC-\uDFFF])\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69]))|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1)(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC69(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83E\uDDD1(?:\u200D(?:\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83E\uDDD1(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\uD83D\uDE36\u200D\uD83C\uDF2B|\uD83C\uDFF3\uFE0F\u200D\u26A7|\uD83D\uDC3B\u200D\u2744|(?:(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\uD83C\uDFF4\u200D\u2620|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])\u200D[\u2640\u2642]|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u2328\u23CF\u23ED-\u23EF\u23F1\u23F2\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB\u25FC\u2600-\u2604\u260E\u2611\u2618\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u2692\u2694-\u2697\u2699\u269B\u269C\u26A0\u26A7\u26B0\u26B1\u26C8\u26CF\u26D1\u26D3\u26E9\u26F0\u26F1\u26F4\u26F7\u26F8\u2702\u2708\u2709\u270F\u2712\u2714\u2716\u271D\u2721\u2733\u2734\u2744\u2747\u2763\u27A1\u2934\u2935\u2B05-\u2B07\u3030\u303D\u3297\u3299]|\uD83C[\uDD70\uDD71\uDD7E\uDD7F\uDE02\uDE37\uDF21\uDF24-\uDF2C\uDF36\uDF7D\uDF96\uDF97\uDF99-\uDF9B\uDF9E\uDF9F\uDFCD\uDFCE\uDFD4-\uDFDF\uDFF5\uDFF7]|\uD83D[\uDC3F\uDCFD\uDD49\uDD4A\uDD6F\uDD70\uDD73\uDD76-\uDD79\uDD87\uDD8A-\uDD8D\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA\uDECB\uDECD-\uDECF\uDEE0-\uDEE5\uDEE9\uDEF0\uDEF3])\uFE0F|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDE35\u200D\uD83D\uDCAB|\uD83D\uDE2E\u200D\uD83D\uDCA8|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83E\uDDD1(?:\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC|\uD83C\uDFFB)?|\uD83D\uDC69(?:\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC|\uD83C\uDFFB)?|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF6\uD83C\uDDE6|\uD83C\uDDF4\uD83C\uDDF2|\uD83D\uDC08\u200D\u2B1B|\u2764\uFE0F\u200D(?:\uD83D\uDD25|\uD83E\uDE79)|\uD83D\uDC41\uFE0F|\uD83C\uDFF3\uFE0F|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|[#\*0-9]\uFE0F\u20E3|\u2764\uFE0F|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])|\uD83C\uDFF4|(?:[\u270A\u270B]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270C\u270D]|\uD83D[\uDD74\uDD90])(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])|[\u270A\u270B]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC08\uDC15\uDC3B\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE2E\uDE35\uDE36\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5]|\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD]|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF]|[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF84\uDF86-\uDF93\uDFA0-\uDFC1\uDFC5\uDFC6\uDFC8\uDFC9\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC07\uDC09-\uDC14\uDC16-\uDC3A\uDC3C-\uDC3E\uDC40\uDC44\uDC45\uDC51-\uDC65\uDC6A\uDC79-\uDC7B\uDC7D-\uDC80\uDC84\uDC88-\uDC8E\uDC90\uDC92-\uDCA9\uDCAB-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDDA4\uDDFB-\uDE2D\uDE2F-\uDE34\uDE37-\uDE44\uDE48-\uDE4A\uDE80-\uDEA2\uDEA4-\uDEB3\uDEB7-\uDEBF\uDEC1-\uDEC5\uDED0-\uDED2\uDED5-\uDED7\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0D\uDD0E\uDD10-\uDD17\uDD1D\uDD20-\uDD25\uDD27-\uDD2F\uDD3A\uDD3F-\uDD45\uDD47-\uDD76\uDD78\uDD7A-\uDDB4\uDDB7\uDDBA\uDDBC-\uDDCB\uDDD0\uDDE0-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6]|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5-\uDED7\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0C-\uDD3A\uDD3C-\uDD45\uDD47-\uDD78\uDD7A-\uDDCB\uDDCD-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26A7\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5-\uDED7\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0C-\uDD3A\uDD3C-\uDD45\uDD47-\uDD78\uDD7A-\uDDCB\uDDCD-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDD77\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD])/g;
            };
          }
        }), yt = {};
        Gn(yt, {
          default: () => Rt
        });
        function Rt(Ze) {
          if (typeof Ze != "string" || Ze.length === 0 || (Ze = ie(Ze), Ze.length === 0))
            return 0;
          Ze = Ze.replace((0, yn.default)(), "  ");
          let Nt = 0;
          for (let Ot = 0; Ot < Ze.length; Ot++) {
            const Mt = Ze.codePointAt(Ot);
            Mt <= 31 || Mt >= 127 && Mt <= 159 || Mt >= 768 && Mt <= 879 || (Mt > 65535 && Ot++, Nt += ve(Mt) ? 2 : 1);
          }
          return Nt;
        }
        var yn, Yn = hn({
          "node_modules/string-width/index.js"() {
            on(), re(), Te(), yn = En(Re());
          }
        }), er = Sn({
          "src/utils/get-string-width.js"(Ze, Nt) {
            on();
            var Ot = (Yn(), Rn(yt)).default, Mt = /[^\x20-\x7F]/;
            function Vt(ln) {
              return ln ? Mt.test(ln) ? Ot(ln) : ln.length : 0;
            }
            Nt.exports = Vt;
          }
        }), Wn = Sn({
          "src/document/doc-utils.js"(Ze, Nt) {
            on();
            var Ot = Hn(), {
              literalline: Mt,
              join: Vt
            } = Vn(), ln = (xe) => Array.isArray(xe) || xe && xe.type === "concat", bt = (xe) => {
              if (Array.isArray(xe))
                return xe;
              if (xe.type !== "concat" && xe.type !== "fill")
                throw new Error("Expect doc type to be `concat` or `fill`.");
              return xe.parts;
            }, Zt = {};
            function an(xe, Oe, Ye, dt) {
              const at = [xe];
              for (; at.length > 0; ) {
                const tt = at.pop();
                if (tt === Zt) {
                  Ye(at.pop());
                  continue;
                }
                if (Ye && at.push(tt, Zt), !Oe || Oe(tt) !== !1)
                  if (ln(tt) || tt.type === "fill") {
                    const Et = bt(tt);
                    for (let Dn = Et.length, Jn = Dn - 1; Jn >= 0; --Jn)
                      at.push(Et[Jn]);
                  } else if (tt.type === "if-break")
                    tt.flatContents && at.push(tt.flatContents), tt.breakContents && at.push(tt.breakContents);
                  else if (tt.type === "group" && tt.expandedStates)
                    if (dt)
                      for (let Et = tt.expandedStates.length, Dn = Et - 1; Dn >= 0; --Dn)
                        at.push(tt.expandedStates[Dn]);
                    else
                      at.push(tt.contents);
                  else
                    tt.contents && at.push(tt.contents);
              }
            }
            function Jt(xe, Oe) {
              const Ye = /* @__PURE__ */ new Map();
              return dt(xe);
              function dt(tt) {
                if (Ye.has(tt))
                  return Ye.get(tt);
                const Et = at(tt);
                return Ye.set(tt, Et), Et;
              }
              function at(tt) {
                if (Array.isArray(tt))
                  return Oe(tt.map(dt));
                if (tt.type === "concat" || tt.type === "fill") {
                  const Et = tt.parts.map(dt);
                  return Oe(Object.assign(Object.assign({}, tt), {}, {
                    parts: Et
                  }));
                }
                if (tt.type === "if-break") {
                  const Et = tt.breakContents && dt(tt.breakContents), Dn = tt.flatContents && dt(tt.flatContents);
                  return Oe(Object.assign(Object.assign({}, tt), {}, {
                    breakContents: Et,
                    flatContents: Dn
                  }));
                }
                if (tt.type === "group" && tt.expandedStates) {
                  const Et = tt.expandedStates.map(dt), Dn = Et[0];
                  return Oe(Object.assign(Object.assign({}, tt), {}, {
                    contents: Dn,
                    expandedStates: Et
                  }));
                }
                if (tt.contents) {
                  const Et = dt(tt.contents);
                  return Oe(Object.assign(Object.assign({}, tt), {}, {
                    contents: Et
                  }));
                }
                return Oe(tt);
              }
            }
            function vn(xe, Oe, Ye) {
              let dt = Ye, at = !1;
              function tt(Et) {
                const Dn = Oe(Et);
                if (Dn !== void 0 && (at = !0, dt = Dn), at)
                  return !1;
              }
              return an(xe, tt), dt;
            }
            function et(xe) {
              if (xe.type === "group" && xe.break || xe.type === "line" && xe.hard || xe.type === "break-parent")
                return !0;
            }
            function rn(xe) {
              return vn(xe, et, !1);
            }
            function pn(xe) {
              if (xe.length > 0) {
                const Oe = Ot(xe);
                !Oe.expandedStates && !Oe.break && (Oe.break = "propagated");
              }
              return null;
            }
            function zt(xe) {
              const Oe = /* @__PURE__ */ new Set(), Ye = [];
              function dt(tt) {
                if (tt.type === "break-parent" && pn(Ye), tt.type === "group") {
                  if (Ye.push(tt), Oe.has(tt))
                    return !1;
                  Oe.add(tt);
                }
              }
              function at(tt) {
                tt.type === "group" && Ye.pop().break && pn(Ye);
              }
              an(xe, dt, at, !0);
            }
            function Nn(xe) {
              return xe.type === "line" && !xe.hard ? xe.soft ? "" : " " : xe.type === "if-break" ? xe.flatContents || "" : xe;
            }
            function Xn(xe) {
              return Jt(xe, Nn);
            }
            var Kn = (xe, Oe) => xe && xe.type === "line" && xe.hard && Oe && Oe.type === "break-parent";
            function bn(xe) {
              if (!xe)
                return xe;
              if (ln(xe) || xe.type === "fill") {
                const Oe = bt(xe);
                for (; Oe.length > 1 && Kn(...Oe.slice(-2)); )
                  Oe.length -= 2;
                if (Oe.length > 0) {
                  const Ye = bn(Ot(Oe));
                  Oe[Oe.length - 1] = Ye;
                }
                return Array.isArray(xe) ? Oe : Object.assign(Object.assign({}, xe), {}, {
                  parts: Oe
                });
              }
              switch (xe.type) {
                case "align":
                case "indent":
                case "indent-if-break":
                case "group":
                case "line-suffix":
                case "label": {
                  const Oe = bn(xe.contents);
                  return Object.assign(Object.assign({}, xe), {}, {
                    contents: Oe
                  });
                }
                case "if-break": {
                  const Oe = bn(xe.breakContents), Ye = bn(xe.flatContents);
                  return Object.assign(Object.assign({}, xe), {}, {
                    breakContents: Oe,
                    flatContents: Ye
                  });
                }
              }
              return xe;
            }
            function sr(xe) {
              return bn(Gt(xe));
            }
            function qt(xe) {
              switch (xe.type) {
                case "fill":
                  if (xe.parts.every((Ye) => Ye === ""))
                    return "";
                  break;
                case "group":
                  if (!xe.contents && !xe.id && !xe.break && !xe.expandedStates)
                    return "";
                  if (xe.contents.type === "group" && xe.contents.id === xe.id && xe.contents.break === xe.break && xe.contents.expandedStates === xe.expandedStates)
                    return xe.contents;
                  break;
                case "align":
                case "indent":
                case "indent-if-break":
                case "line-suffix":
                  if (!xe.contents)
                    return "";
                  break;
                case "if-break":
                  if (!xe.flatContents && !xe.breakContents)
                    return "";
                  break;
              }
              if (!ln(xe))
                return xe;
              const Oe = [];
              for (const Ye of bt(xe)) {
                if (!Ye)
                  continue;
                const [dt, ...at] = ln(Ye) ? bt(Ye) : [Ye];
                typeof dt == "string" && typeof Ot(Oe) == "string" ? Oe[Oe.length - 1] += dt : Oe.push(dt), Oe.push(...at);
              }
              return Oe.length === 0 ? "" : Oe.length === 1 ? Oe[0] : Array.isArray(xe) ? Oe : Object.assign(Object.assign({}, xe), {}, {
                parts: Oe
              });
            }
            function Gt(xe) {
              return Jt(xe, (Oe) => qt(Oe));
            }
            function tn(xe) {
              const Oe = [], Ye = xe.filter(Boolean);
              for (; Ye.length > 0; ) {
                const dt = Ye.shift();
                if (dt) {
                  if (ln(dt)) {
                    Ye.unshift(...bt(dt));
                    continue;
                  }
                  if (Oe.length > 0 && typeof Ot(Oe) == "string" && typeof dt == "string") {
                    Oe[Oe.length - 1] += dt;
                    continue;
                  }
                  Oe.push(dt);
                }
              }
              return Oe;
            }
            function Cn(xe) {
              return Jt(xe, (Oe) => Array.isArray(Oe) ? tn(Oe) : Oe.parts ? Object.assign(Object.assign({}, Oe), {}, {
                parts: tn(Oe.parts)
              }) : Oe);
            }
            function cn(xe) {
              return Jt(xe, (Oe) => typeof Oe == "string" && Oe.includes(`
`) ? It(Oe) : Oe);
            }
            function It(xe) {
              let Oe = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : Mt;
              return Vt(Oe, xe.split(`
`)).parts;
            }
            function Xt(xe) {
              if (xe.type === "line")
                return !0;
            }
            function St(xe) {
              return vn(xe, Xt, !1);
            }
            Nt.exports = {
              isConcat: ln,
              getDocParts: bt,
              willBreak: rn,
              traverseDoc: an,
              findInDoc: vn,
              mapDoc: Jt,
              propagateBreaks: zt,
              removeLines: Xn,
              stripTrailingHardline: sr,
              normalizeParts: tn,
              normalizeDoc: Cn,
              cleanDoc: Gt,
              replaceTextEndOfLine: It,
              replaceEndOfLine: cn,
              canBreak: St
            };
          }
        }), jr = Sn({
          "src/document/doc-printer.js"(Ze, Nt) {
            on();
            var {
              convertEndOfLineToChars: Ot
            } = gn(), Mt = Hn(), Vt = er(), {
              fill: ln,
              cursor: bt,
              indent: Zt
            } = Vn(), {
              isConcat: an,
              getDocParts: Jt
            } = Wn(), vn, et = 1, rn = 2;
            function pn() {
              return {
                value: "",
                length: 0,
                queue: []
              };
            }
            function zt(qt, Gt) {
              return Xn(qt, {
                type: "indent"
              }, Gt);
            }
            function Nn(qt, Gt, tn) {
              return Gt === Number.NEGATIVE_INFINITY ? qt.root || pn() : Gt < 0 ? Xn(qt, {
                type: "dedent"
              }, tn) : Gt ? Gt.type === "root" ? Object.assign(Object.assign({}, qt), {}, {
                root: qt
              }) : Xn(qt, {
                type: typeof Gt == "string" ? "stringAlign" : "numberAlign",
                n: Gt
              }, tn) : qt;
            }
            function Xn(qt, Gt, tn) {
              const Cn = Gt.type === "dedent" ? qt.queue.slice(0, -1) : [...qt.queue, Gt];
              let cn = "", It = 0, Xt = 0, St = 0;
              for (const Et of Cn)
                switch (Et.type) {
                  case "indent":
                    Ye(), tn.useTabs ? xe(1) : Oe(tn.tabWidth);
                    break;
                  case "stringAlign":
                    Ye(), cn += Et.n, It += Et.n.length;
                    break;
                  case "numberAlign":
                    Xt += 1, St += Et.n;
                    break;
                  default:
                    throw new Error(`Unexpected type '${Et.type}'`);
                }
              return at(), Object.assign(Object.assign({}, qt), {}, {
                value: cn,
                length: It,
                queue: Cn
              });
              function xe(Et) {
                cn += "	".repeat(Et), It += tn.tabWidth * Et;
              }
              function Oe(Et) {
                cn += " ".repeat(Et), It += Et;
              }
              function Ye() {
                tn.useTabs ? dt() : at();
              }
              function dt() {
                Xt > 0 && xe(Xt), tt();
              }
              function at() {
                St > 0 && Oe(St), tt();
              }
              function tt() {
                Xt = 0, St = 0;
              }
            }
            function Kn(qt) {
              if (qt.length === 0)
                return 0;
              let Gt = 0;
              for (; qt.length > 0 && typeof Mt(qt) == "string" && /^[\t ]*$/.test(Mt(qt)); )
                Gt += qt.pop().length;
              if (qt.length > 0 && typeof Mt(qt) == "string") {
                const tn = Mt(qt).replace(/[\t ]*$/, "");
                Gt += Mt(qt).length - tn.length, qt[qt.length - 1] = tn;
              }
              return Gt;
            }
            function bn(qt, Gt, tn, Cn, cn) {
              let It = Gt.length;
              const Xt = [qt], St = [];
              for (; tn >= 0; ) {
                if (Xt.length === 0) {
                  if (It === 0)
                    return !0;
                  Xt.push(Gt[--It]);
                  continue;
                }
                const {
                  mode: xe,
                  doc: Oe
                } = Xt.pop();
                if (typeof Oe == "string")
                  St.push(Oe), tn -= Vt(Oe);
                else if (an(Oe) || Oe.type === "fill") {
                  const Ye = Jt(Oe);
                  for (let dt = Ye.length - 1; dt >= 0; dt--)
                    Xt.push({
                      mode: xe,
                      doc: Ye[dt]
                    });
                } else
                  switch (Oe.type) {
                    case "indent":
                    case "align":
                    case "indent-if-break":
                    case "label":
                      Xt.push({
                        mode: xe,
                        doc: Oe.contents
                      });
                      break;
                    case "trim":
                      tn += Kn(St);
                      break;
                    case "group": {
                      if (cn && Oe.break)
                        return !1;
                      const Ye = Oe.break ? et : xe, dt = Oe.expandedStates && Ye === et ? Mt(Oe.expandedStates) : Oe.contents;
                      Xt.push({
                        mode: Ye,
                        doc: dt
                      });
                      break;
                    }
                    case "if-break": {
                      const dt = (Oe.groupId ? vn[Oe.groupId] || rn : xe) === et ? Oe.breakContents : Oe.flatContents;
                      dt && Xt.push({
                        mode: xe,
                        doc: dt
                      });
                      break;
                    }
                    case "line":
                      if (xe === et || Oe.hard)
                        return !0;
                      Oe.soft || (St.push(" "), tn--);
                      break;
                    case "line-suffix":
                      Cn = !0;
                      break;
                    case "line-suffix-boundary":
                      if (Cn)
                        return !1;
                      break;
                  }
              }
              return !1;
            }
            function sr(qt, Gt) {
              vn = {};
              const tn = Gt.printWidth, Cn = Ot(Gt.endOfLine);
              let cn = 0;
              const It = [{
                ind: pn(),
                mode: et,
                doc: qt
              }], Xt = [];
              let St = !1;
              const xe = [];
              for (; It.length > 0; ) {
                const {
                  ind: Ye,
                  mode: dt,
                  doc: at
                } = It.pop();
                if (typeof at == "string") {
                  const tt = Cn !== `
` ? at.replace(/\n/g, Cn) : at;
                  Xt.push(tt), cn += Vt(tt);
                } else if (an(at)) {
                  const tt = Jt(at);
                  for (let Et = tt.length - 1; Et >= 0; Et--)
                    It.push({
                      ind: Ye,
                      mode: dt,
                      doc: tt[Et]
                    });
                } else
                  switch (at.type) {
                    case "cursor":
                      Xt.push(bt.placeholder);
                      break;
                    case "indent":
                      It.push({
                        ind: zt(Ye, Gt),
                        mode: dt,
                        doc: at.contents
                      });
                      break;
                    case "align":
                      It.push({
                        ind: Nn(Ye, at.n, Gt),
                        mode: dt,
                        doc: at.contents
                      });
                      break;
                    case "trim":
                      cn -= Kn(Xt);
                      break;
                    case "group":
                      switch (dt) {
                        case rn:
                          if (!St) {
                            It.push({
                              ind: Ye,
                              mode: at.break ? et : rn,
                              doc: at.contents
                            });
                            break;
                          }
                        case et: {
                          St = !1;
                          const tt = {
                            ind: Ye,
                            mode: rn,
                            doc: at.contents
                          }, Et = tn - cn, Dn = xe.length > 0;
                          if (!at.break && bn(tt, It, Et, Dn))
                            It.push(tt);
                          else if (at.expandedStates) {
                            const Jn = Mt(at.expandedStates);
                            if (at.break) {
                              It.push({
                                ind: Ye,
                                mode: et,
                                doc: Jn
                              });
                              break;
                            } else
                              for (let In = 1; In < at.expandedStates.length + 1; In++)
                                if (In >= at.expandedStates.length) {
                                  It.push({
                                    ind: Ye,
                                    mode: et,
                                    doc: Jn
                                  });
                                  break;
                                } else {
                                  const or = at.expandedStates[In], nr = {
                                    ind: Ye,
                                    mode: rn,
                                    doc: or
                                  };
                                  if (bn(nr, It, Et, Dn)) {
                                    It.push(nr);
                                    break;
                                  }
                                }
                          } else
                            It.push({
                              ind: Ye,
                              mode: et,
                              doc: at.contents
                            });
                          break;
                        }
                      }
                      at.id && (vn[at.id] = Mt(It).mode);
                      break;
                    case "fill": {
                      const tt = tn - cn, {
                        parts: Et
                      } = at;
                      if (Et.length === 0)
                        break;
                      const [Dn, Jn] = Et, In = {
                        ind: Ye,
                        mode: rn,
                        doc: Dn
                      }, or = {
                        ind: Ye,
                        mode: et,
                        doc: Dn
                      }, nr = bn(In, [], tt, xe.length > 0, !0);
                      if (Et.length === 1) {
                        nr ? It.push(In) : It.push(or);
                        break;
                      }
                      const Ar = {
                        ind: Ye,
                        mode: rn,
                        doc: Jn
                      }, vr = {
                        ind: Ye,
                        mode: et,
                        doc: Jn
                      };
                      if (Et.length === 2) {
                        nr ? It.push(Ar, In) : It.push(vr, or);
                        break;
                      }
                      Et.splice(0, 2);
                      const dr = {
                        ind: Ye,
                        mode: dt,
                        doc: ln(Et)
                      }, ru = Et[0];
                      bn({
                        ind: Ye,
                        mode: rn,
                        doc: [Dn, Jn, ru]
                      }, [], tt, xe.length > 0, !0) ? It.push(dr, Ar, In) : nr ? It.push(dr, vr, In) : It.push(dr, vr, or);
                      break;
                    }
                    case "if-break":
                    case "indent-if-break": {
                      const tt = at.groupId ? vn[at.groupId] : dt;
                      if (tt === et) {
                        const Et = at.type === "if-break" ? at.breakContents : at.negate ? at.contents : Zt(at.contents);
                        Et && It.push({
                          ind: Ye,
                          mode: dt,
                          doc: Et
                        });
                      }
                      if (tt === rn) {
                        const Et = at.type === "if-break" ? at.flatContents : at.negate ? Zt(at.contents) : at.contents;
                        Et && It.push({
                          ind: Ye,
                          mode: dt,
                          doc: Et
                        });
                      }
                      break;
                    }
                    case "line-suffix":
                      xe.push({
                        ind: Ye,
                        mode: dt,
                        doc: at.contents
                      });
                      break;
                    case "line-suffix-boundary":
                      xe.length > 0 && It.push({
                        ind: Ye,
                        mode: dt,
                        doc: {
                          type: "line",
                          hard: !0
                        }
                      });
                      break;
                    case "line":
                      switch (dt) {
                        case rn:
                          if (at.hard)
                            St = !0;
                          else {
                            at.soft || (Xt.push(" "), cn += 1);
                            break;
                          }
                        case et:
                          if (xe.length > 0) {
                            It.push({
                              ind: Ye,
                              mode: dt,
                              doc: at
                            }, ...xe.reverse()), xe.length = 0;
                            break;
                          }
                          at.literal ? Ye.root ? (Xt.push(Cn, Ye.root.value), cn = Ye.root.length) : (Xt.push(Cn), cn = 0) : (cn -= Kn(Xt), Xt.push(Cn + Ye.value), cn = Ye.length);
                          break;
                      }
                      break;
                    case "label":
                      It.push({
                        ind: Ye,
                        mode: dt,
                        doc: at.contents
                      });
                      break;
                  }
                It.length === 0 && xe.length > 0 && (It.push(...xe.reverse()), xe.length = 0);
              }
              const Oe = Xt.indexOf(bt.placeholder);
              if (Oe !== -1) {
                const Ye = Xt.indexOf(bt.placeholder, Oe + 1), dt = Xt.slice(0, Oe).join(""), at = Xt.slice(Oe + 1, Ye).join(""), tt = Xt.slice(Ye + 1).join("");
                return {
                  formatted: dt + at + tt,
                  cursorNodeStart: dt.length,
                  cursorNodeText: at
                };
              }
              return {
                formatted: Xt.join("")
              };
            }
            Nt.exports = {
              printDocToString: sr
            };
          }
        }), tr = Sn({
          "src/document/doc-debug.js"(Ze, Nt) {
            on();
            var {
              isConcat: Ot,
              getDocParts: Mt
            } = Wn();
            function Vt(bt) {
              if (!bt)
                return "";
              if (Ot(bt)) {
                const Zt = [];
                for (const an of Mt(bt))
                  if (Ot(an))
                    Zt.push(...Vt(an).parts);
                  else {
                    const Jt = Vt(an);
                    Jt !== "" && Zt.push(Jt);
                  }
                return {
                  type: "concat",
                  parts: Zt
                };
              }
              return bt.type === "if-break" ? Object.assign(Object.assign({}, bt), {}, {
                breakContents: Vt(bt.breakContents),
                flatContents: Vt(bt.flatContents)
              }) : bt.type === "group" ? Object.assign(Object.assign({}, bt), {}, {
                contents: Vt(bt.contents),
                expandedStates: bt.expandedStates && bt.expandedStates.map(Vt)
              }) : bt.type === "fill" ? {
                type: "fill",
                parts: bt.parts.map(Vt)
              } : bt.contents ? Object.assign(Object.assign({}, bt), {}, {
                contents: Vt(bt.contents)
              }) : bt;
            }
            function ln(bt) {
              const Zt = /* @__PURE__ */ Object.create(null), an = /* @__PURE__ */ new Set();
              return Jt(Vt(bt));
              function Jt(et, rn, pn) {
                if (typeof et == "string")
                  return JSON.stringify(et);
                if (Ot(et)) {
                  const zt = Mt(et).map(Jt).filter(Boolean);
                  return zt.length === 1 ? zt[0] : `[${zt.join(", ")}]`;
                }
                if (et.type === "line") {
                  const zt = Array.isArray(pn) && pn[rn + 1] && pn[rn + 1].type === "break-parent";
                  return et.literal ? zt ? "literalline" : "literallineWithoutBreakParent" : et.hard ? zt ? "hardline" : "hardlineWithoutBreakParent" : et.soft ? "softline" : "line";
                }
                if (et.type === "break-parent")
                  return Array.isArray(pn) && pn[rn - 1] && pn[rn - 1].type === "line" && pn[rn - 1].hard ? void 0 : "breakParent";
                if (et.type === "trim")
                  return "trim";
                if (et.type === "indent")
                  return "indent(" + Jt(et.contents) + ")";
                if (et.type === "align")
                  return et.n === Number.NEGATIVE_INFINITY ? "dedentToRoot(" + Jt(et.contents) + ")" : et.n < 0 ? "dedent(" + Jt(et.contents) + ")" : et.n.type === "root" ? "markAsRoot(" + Jt(et.contents) + ")" : "align(" + JSON.stringify(et.n) + ", " + Jt(et.contents) + ")";
                if (et.type === "if-break")
                  return "ifBreak(" + Jt(et.breakContents) + (et.flatContents ? ", " + Jt(et.flatContents) : "") + (et.groupId ? (et.flatContents ? "" : ', ""') + `, { groupId: ${vn(et.groupId)} }` : "") + ")";
                if (et.type === "indent-if-break") {
                  const zt = [];
                  et.negate && zt.push("negate: true"), et.groupId && zt.push(`groupId: ${vn(et.groupId)}`);
                  const Nn = zt.length > 0 ? `, { ${zt.join(", ")} }` : "";
                  return `indentIfBreak(${Jt(et.contents)}${Nn})`;
                }
                if (et.type === "group") {
                  const zt = [];
                  et.break && et.break !== "propagated" && zt.push("shouldBreak: true"), et.id && zt.push(`id: ${vn(et.id)}`);
                  const Nn = zt.length > 0 ? `, { ${zt.join(", ")} }` : "";
                  return et.expandedStates ? `conditionalGroup([${et.expandedStates.map((Xn) => Jt(Xn)).join(",")}]${Nn})` : `group(${Jt(et.contents)}${Nn})`;
                }
                if (et.type === "fill")
                  return `fill([${et.parts.map((zt) => Jt(zt)).join(", ")}])`;
                if (et.type === "line-suffix")
                  return "lineSuffix(" + Jt(et.contents) + ")";
                if (et.type === "line-suffix-boundary")
                  return "lineSuffixBoundary";
                if (et.type === "label")
                  return `label(${JSON.stringify(et.label)}, ${Jt(et.contents)})`;
                throw new Error("Unknown doc type " + et.type);
              }
              function vn(et) {
                if (typeof et != "symbol")
                  return JSON.stringify(String(et));
                if (et in Zt)
                  return Zt[et];
                const rn = String(et).slice(7, -1) || "symbol";
                for (let pn = 0; ; pn++) {
                  const zt = rn + (pn > 0 ? ` #${pn}` : "");
                  if (!an.has(zt))
                    return an.add(zt), Zt[et] = `Symbol.for(${JSON.stringify(zt)})`;
                }
              }
            }
            Nt.exports = {
              printDocToDebug: ln
            };
          }
        });
        on(), sn.exports = {
          builders: Vn(),
          printer: jr(),
          utils: Wn(),
          debug: tr()
        };
      }
    });
    return At();
  });
})(kl);
const Pl = /* @__PURE__ */ Gi(Hr), jl = /* @__PURE__ */ eu({
  __proto__: null,
  default: Pl
}, [Hr]), Il = /* @__PURE__ */ tu(jl);
Object.defineProperty(nu, "__esModule", { value: !0 });
nu.EBNFPrint = void 0;
const Ht = Il;
function Tn(qe) {
  switch (qe.type) {
    case "literal":
      if (qe.value === '"')
        return Ht.builders.group(["'", qe.value, "'"]);
      const ze = qe.value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      return Ht.builders.group(['"', ze, '"']);
    case "nonterminal":
      return qe.value;
    case "epsilon":
      return "ε";
    case "group":
      return Ht.builders.group(["( ", Ht.builders.indent(Tn(qe.value)), Ht.builders.softline, " )"]);
    case "regex":
      return Ht.builders.group(["/", qe.value.source, "/"]);
    case "optional":
      return Ht.builders.group([Tn(qe.value), "?"]);
    case "optionalWhitespace":
      return Ht.builders.group([Tn(qe.value), "?w"]);
    case "coalesce":
      return Ht.builders.group([Tn(qe.value[0]), " ?? ", Tn(qe.value[1])]);
    case "minus":
      return Ht.builders.group([Tn(qe.value[0]), " - ", Tn(qe.value[1])]);
    case "many":
      return Ht.builders.group([Tn(qe.value), "*"]);
    case "many1":
      return Ht.builders.group([Tn(qe.value), "+"]);
    case "skip":
      return Ht.builders.group([Tn(qe.value[0]), " << ", Tn(qe.value[1])]);
    case "next":
      return Ht.builders.group([Tn(qe.value[0]), " >> ", Tn(qe.value[1])]);
    case "concatenation": {
      const Pe = " , ";
      return Ht.builders.group([
        Ht.builders.indent([
          Ht.builders.softline,
          Ht.builders.join([Ht.builders.conditionalGroup([Ht.builders.softline]), Pe], qe.value.map((wt) => Tn(wt)))
        ])
      ]);
    }
    case "alternation": {
      const Pe = " | ";
      return Ht.builders.group([
        Ht.builders.indent([
          Ht.builders.softline,
          Ht.builders.join([Ht.builders.conditionalGroup([Ht.builders.softline]), Pe], qe.value.map((wt) => Tn(wt)))
        ])
      ]);
    }
  }
}
function _l(qe, ze) {
  const Pe = qe.getValue();
  return ze.tabWidth = 4, ze.printWidth = 66, ze.useTabs = !1, Ht.builders.join(Ht.builders.hardline, [...Pe.entries()].map(([At, pt]) => {
    const sn = [At, " = "], Kt = [Tn(pt), " ;"];
    return pt.type === "concatenation" || pt.type === "alternation" ? [...sn, ...Kt, Ht.builders.hardline] : [...sn, ...Kt];
  }));
}
nu.EBNFPrint = _l;
var Zr = {}, Ll = {
  get exports() {
    return Zr;
  },
  set exports(qe) {
    Zr = qe;
  }
};
(function(qe, ze) {
  (function(Pe) {
    qe.exports = Pe();
  })(function() {
    var Pe = (Ve, ce) => () => (ce || Ve((ce = { exports: {} }).exports, ce), ce.exports), wt = Pe((Ve, ce) => {
      var ae = function(fe) {
        return fe && fe.Math == Math && fe;
      };
      ce.exports = ae(typeof globalThis == "object" && globalThis) || ae(typeof window == "object" && window) || ae(typeof self == "object" && self) || ae(typeof Ji == "object" && Ji) || function() {
        return this;
      }() || Function("return this")();
    }), At = Pe((Ve, ce) => {
      ce.exports = function(ae) {
        try {
          return !!ae();
        } catch {
          return !0;
        }
      };
    }), pt = Pe((Ve, ce) => {
      var ae = At();
      ce.exports = !ae(function() {
        return Object.defineProperty({}, 1, { get: function() {
          return 7;
        } })[1] != 7;
      });
    }), sn = Pe((Ve, ce) => {
      var ae = At();
      ce.exports = !ae(function() {
        var fe = function() {
        }.bind();
        return typeof fe != "function" || fe.hasOwnProperty("prototype");
      });
    }), Kt = Pe((Ve, ce) => {
      var ae = sn(), fe = Function.prototype.call;
      ce.exports = ae ? fe.bind(fe) : function() {
        return fe.apply(fe, arguments);
      };
    }), dn = Pe((Ve) => {
      var ce = {}.propertyIsEnumerable, ae = Object.getOwnPropertyDescriptor, fe = ae && !ce.call({ 1: 2 }, 1);
      Ve.f = fe ? function(pe) {
        var be = ae(this, pe);
        return !!be && be.enumerable;
      } : ce;
    }), Mn = Pe((Ve, ce) => {
      ce.exports = function(ae, fe) {
        return { enumerable: !(ae & 1), configurable: !(ae & 2), writable: !(ae & 4), value: fe };
      };
    }), Lt = Pe((Ve, ce) => {
      var ae = sn(), fe = Function.prototype, pe = fe.call, be = ae && fe.bind.bind(pe, pe);
      ce.exports = ae ? be : function(ke) {
        return function() {
          return pe.apply(ke, arguments);
        };
      };
    }), wn = Pe((Ve, ce) => {
      var ae = Lt(), fe = ae({}.toString), pe = ae("".slice);
      ce.exports = function(be) {
        return pe(fe(be), 8, -1);
      };
    }), ar = Pe((Ve, ce) => {
      var ae = Lt(), fe = At(), pe = wn(), be = Object, ke = ae("".split);
      ce.exports = fe(function() {
        return !be("z").propertyIsEnumerable(0);
      }) ? function($e) {
        return pe($e) == "String" ? ke($e, "") : be($e);
      } : be;
    }), hn = Pe((Ve, ce) => {
      ce.exports = function(ae) {
        return ae == null;
      };
    }), Sn = Pe((Ve, ce) => {
      var ae = hn(), fe = TypeError;
      ce.exports = function(pe) {
        if (ae(pe))
          throw fe("Can't call method on " + pe);
        return pe;
      };
    }), Gn = Pe((Ve, ce) => {
      var ae = ar(), fe = Sn();
      ce.exports = function(pe) {
        return ae(fe(pe));
      };
    }), zn = Pe((Ve, ce) => {
      var ae = typeof document == "object" && document.all, fe = typeof ae > "u" && ae !== void 0;
      ce.exports = { all: ae, IS_HTMLDDA: fe };
    }), En = Pe((Ve, ce) => {
      var ae = zn(), fe = ae.all;
      ce.exports = ae.IS_HTMLDDA ? function(pe) {
        return typeof pe == "function" || pe === fe;
      } : function(pe) {
        return typeof pe == "function";
      };
    }), Rn = Pe((Ve, ce) => {
      var ae = En(), fe = zn(), pe = fe.all;
      ce.exports = fe.IS_HTMLDDA ? function(be) {
        return typeof be == "object" ? be !== null : ae(be) || be === pe;
      } : function(be) {
        return typeof be == "object" ? be !== null : ae(be);
      };
    }), on = Pe((Ve, ce) => {
      var ae = wt(), fe = En(), pe = function(be) {
        return fe(be) ? be : void 0;
      };
      ce.exports = function(be, ke) {
        return arguments.length < 2 ? pe(ae[be]) : ae[be] && ae[be][ke];
      };
    }), Vn = Pe((Ve, ce) => {
      var ae = Lt();
      ce.exports = ae({}.isPrototypeOf);
    }), gn = Pe((Ve, ce) => {
      var ae = on();
      ce.exports = ae("navigator", "userAgent") || "";
    }), Hn = Pe((Ve, ce) => {
      var ae = wt(), fe = gn(), pe = ae.process, be = ae.Deno, ke = pe && pe.versions || be && be.version, $e = ke && ke.v8, Ie, Me;
      $e && (Ie = $e.split("."), Me = Ie[0] > 0 && Ie[0] < 4 ? 1 : +(Ie[0] + Ie[1])), !Me && fe && (Ie = fe.match(/Edge\/(\d+)/), (!Ie || Ie[1] >= 74) && (Ie = fe.match(/Chrome\/(\d+)/), Ie && (Me = +Ie[1]))), ce.exports = Me;
    }), Ge = Pe((Ve, ce) => {
      var ae = Hn(), fe = At();
      ce.exports = !!Object.getOwnPropertySymbols && !fe(function() {
        var pe = Symbol();
        return !String(pe) || !(Object(pe) instanceof Symbol) || !Symbol.sham && ae && ae < 41;
      });
    }), se = Pe((Ve, ce) => {
      var ae = Ge();
      ce.exports = ae && !Symbol.sham && typeof Symbol.iterator == "symbol";
    }), ie = Pe((Ve, ce) => {
      var ae = on(), fe = En(), pe = Vn(), be = se(), ke = Object;
      ce.exports = be ? function($e) {
        return typeof $e == "symbol";
      } : function($e) {
        var Ie = ae("Symbol");
        return fe(Ie) && pe(Ie.prototype, ke($e));
      };
    }), re = Pe((Ve, ce) => {
      var ae = String;
      ce.exports = function(fe) {
        try {
          return ae(fe);
        } catch {
          return "Object";
        }
      };
    }), ve = Pe((Ve, ce) => {
      var ae = En(), fe = re(), pe = TypeError;
      ce.exports = function(be) {
        if (ae(be))
          return be;
        throw pe(fe(be) + " is not a function");
      };
    }), Te = Pe((Ve, ce) => {
      var ae = ve(), fe = hn();
      ce.exports = function(pe, be) {
        var ke = pe[be];
        return fe(ke) ? void 0 : ae(ke);
      };
    }), Re = Pe((Ve, ce) => {
      var ae = Kt(), fe = En(), pe = Rn(), be = TypeError;
      ce.exports = function(ke, $e) {
        var Ie, Me;
        if ($e === "string" && fe(Ie = ke.toString) && !pe(Me = ae(Ie, ke)) || fe(Ie = ke.valueOf) && !pe(Me = ae(Ie, ke)) || $e !== "string" && fe(Ie = ke.toString) && !pe(Me = ae(Ie, ke)))
          return Me;
        throw be("Can't convert object to primitive value");
      };
    }), yt = Pe((Ve, ce) => {
      ce.exports = !1;
    }), Rt = Pe((Ve, ce) => {
      var ae = wt(), fe = Object.defineProperty;
      ce.exports = function(pe, be) {
        try {
          fe(ae, pe, { value: be, configurable: !0, writable: !0 });
        } catch {
          ae[pe] = be;
        }
        return be;
      };
    }), yn = Pe((Ve, ce) => {
      var ae = wt(), fe = Rt(), pe = "__core-js_shared__", be = ae[pe] || fe(pe, {});
      ce.exports = be;
    }), Yn = Pe((Ve, ce) => {
      var ae = yt(), fe = yn();
      (ce.exports = function(pe, be) {
        return fe[pe] || (fe[pe] = be !== void 0 ? be : {});
      })("versions", []).push({ version: "3.26.1", mode: ae ? "pure" : "global", copyright: "© 2014-2022 Denis Pushkarev (zloirock.ru)", license: "https://github.com/zloirock/core-js/blob/v3.26.1/LICENSE", source: "https://github.com/zloirock/core-js" });
    }), er = Pe((Ve, ce) => {
      var ae = Sn(), fe = Object;
      ce.exports = function(pe) {
        return fe(ae(pe));
      };
    }), Wn = Pe((Ve, ce) => {
      var ae = Lt(), fe = er(), pe = ae({}.hasOwnProperty);
      ce.exports = Object.hasOwn || function(be, ke) {
        return pe(fe(be), ke);
      };
    }), jr = Pe((Ve, ce) => {
      var ae = Lt(), fe = 0, pe = Math.random(), be = ae(1 .toString);
      ce.exports = function(ke) {
        return "Symbol(" + (ke === void 0 ? "" : ke) + ")_" + be(++fe + pe, 36);
      };
    }), tr = Pe((Ve, ce) => {
      var ae = wt(), fe = Yn(), pe = Wn(), be = jr(), ke = Ge(), $e = se(), Ie = fe("wks"), Me = ae.Symbol, nt = Me && Me.for, st = $e ? Me : Me && Me.withoutSetter || be;
      ce.exports = function(ot) {
        if (!pe(Ie, ot) || !(ke || typeof Ie[ot] == "string")) {
          var rt = "Symbol." + ot;
          ke && pe(Me, ot) ? Ie[ot] = Me[ot] : $e && nt ? Ie[ot] = nt(rt) : Ie[ot] = st(rt);
        }
        return Ie[ot];
      };
    }), Ze = Pe((Ve, ce) => {
      var ae = Kt(), fe = Rn(), pe = ie(), be = Te(), ke = Re(), $e = tr(), Ie = TypeError, Me = $e("toPrimitive");
      ce.exports = function(nt, st) {
        if (!fe(nt) || pe(nt))
          return nt;
        var ot = be(nt, Me), rt;
        if (ot) {
          if (st === void 0 && (st = "default"), rt = ae(ot, nt, st), !fe(rt) || pe(rt))
            return rt;
          throw Ie("Can't convert object to primitive value");
        }
        return st === void 0 && (st = "number"), ke(nt, st);
      };
    }), Nt = Pe((Ve, ce) => {
      var ae = Ze(), fe = ie();
      ce.exports = function(pe) {
        var be = ae(pe, "string");
        return fe(be) ? be : be + "";
      };
    }), Ot = Pe((Ve, ce) => {
      var ae = wt(), fe = Rn(), pe = ae.document, be = fe(pe) && fe(pe.createElement);
      ce.exports = function(ke) {
        return be ? pe.createElement(ke) : {};
      };
    }), Mt = Pe((Ve, ce) => {
      var ae = pt(), fe = At(), pe = Ot();
      ce.exports = !ae && !fe(function() {
        return Object.defineProperty(pe("div"), "a", { get: function() {
          return 7;
        } }).a != 7;
      });
    }), Vt = Pe((Ve) => {
      var ce = pt(), ae = Kt(), fe = dn(), pe = Mn(), be = Gn(), ke = Nt(), $e = Wn(), Ie = Mt(), Me = Object.getOwnPropertyDescriptor;
      Ve.f = ce ? Me : function(nt, st) {
        if (nt = be(nt), st = ke(st), Ie)
          try {
            return Me(nt, st);
          } catch {
          }
        if ($e(nt, st))
          return pe(!ae(fe.f, nt, st), nt[st]);
      };
    }), ln = Pe((Ve, ce) => {
      var ae = pt(), fe = At();
      ce.exports = ae && fe(function() {
        return Object.defineProperty(function() {
        }, "prototype", { value: 42, writable: !1 }).prototype != 42;
      });
    }), bt = Pe((Ve, ce) => {
      var ae = Rn(), fe = String, pe = TypeError;
      ce.exports = function(be) {
        if (ae(be))
          return be;
        throw pe(fe(be) + " is not an object");
      };
    }), Zt = Pe((Ve) => {
      var ce = pt(), ae = Mt(), fe = ln(), pe = bt(), be = Nt(), ke = TypeError, $e = Object.defineProperty, Ie = Object.getOwnPropertyDescriptor, Me = "enumerable", nt = "configurable", st = "writable";
      Ve.f = ce ? fe ? function(ot, rt, X) {
        if (pe(ot), rt = be(rt), pe(X), typeof ot == "function" && rt === "prototype" && "value" in X && st in X && !X[st]) {
          var ft = Ie(ot, rt);
          ft && ft[st] && (ot[rt] = X.value, X = { configurable: nt in X ? X[nt] : ft[nt], enumerable: Me in X ? X[Me] : ft[Me], writable: !1 });
        }
        return $e(ot, rt, X);
      } : $e : function(ot, rt, X) {
        if (pe(ot), rt = be(rt), pe(X), ae)
          try {
            return $e(ot, rt, X);
          } catch {
          }
        if ("get" in X || "set" in X)
          throw ke("Accessors not supported");
        return "value" in X && (ot[rt] = X.value), ot;
      };
    }), an = Pe((Ve, ce) => {
      var ae = pt(), fe = Zt(), pe = Mn();
      ce.exports = ae ? function(be, ke, $e) {
        return fe.f(be, ke, pe(1, $e));
      } : function(be, ke, $e) {
        return be[ke] = $e, be;
      };
    }), Jt = Pe((Ve, ce) => {
      var ae = pt(), fe = Wn(), pe = Function.prototype, be = ae && Object.getOwnPropertyDescriptor, ke = fe(pe, "name"), $e = ke && function() {
      }.name === "something", Ie = ke && (!ae || ae && be(pe, "name").configurable);
      ce.exports = { EXISTS: ke, PROPER: $e, CONFIGURABLE: Ie };
    }), vn = Pe((Ve, ce) => {
      var ae = Lt(), fe = En(), pe = yn(), be = ae(Function.toString);
      fe(pe.inspectSource) || (pe.inspectSource = function(ke) {
        return be(ke);
      }), ce.exports = pe.inspectSource;
    }), et = Pe((Ve, ce) => {
      var ae = wt(), fe = En(), pe = ae.WeakMap;
      ce.exports = fe(pe) && /native code/.test(String(pe));
    }), rn = Pe((Ve, ce) => {
      var ae = Yn(), fe = jr(), pe = ae("keys");
      ce.exports = function(be) {
        return pe[be] || (pe[be] = fe(be));
      };
    }), pn = Pe((Ve, ce) => {
      ce.exports = {};
    }), zt = Pe((Ve, ce) => {
      var ae = et(), fe = wt(), pe = Rn(), be = an(), ke = Wn(), $e = yn(), Ie = rn(), Me = pn(), nt = "Object already initialized", st = fe.TypeError, ot = fe.WeakMap, rt, X, ft, xt = function(H) {
        return ft(H) ? X(H) : rt(H, {});
      }, $t = function(H) {
        return function(kn) {
          var lr;
          if (!pe(kn) || (lr = X(kn)).type !== H)
            throw st("Incompatible receiver, " + H + " required");
          return lr;
        };
      };
      ae || $e.state ? (_t = $e.state || ($e.state = new ot()), _t.get = _t.get, _t.has = _t.has, _t.set = _t.set, rt = function(H, kn) {
        if (_t.has(H))
          throw st(nt);
        return kn.facade = H, _t.set(H, kn), kn;
      }, X = function(H) {
        return _t.get(H) || {};
      }, ft = function(H) {
        return _t.has(H);
      }) : (un = Ie("state"), Me[un] = !0, rt = function(H, kn) {
        if (ke(H, un))
          throw st(nt);
        return kn.facade = H, be(H, un, kn), kn;
      }, X = function(H) {
        return ke(H, un) ? H[un] : {};
      }, ft = function(H) {
        return ke(H, un);
      });
      var _t, un;
      ce.exports = { set: rt, get: X, has: ft, enforce: xt, getterFor: $t };
    }), Nn = Pe((Ve, ce) => {
      var ae = At(), fe = En(), pe = Wn(), be = pt(), ke = Jt().CONFIGURABLE, $e = vn(), Ie = zt(), Me = Ie.enforce, nt = Ie.get, st = Object.defineProperty, ot = be && !ae(function() {
        return st(function() {
        }, "length", { value: 8 }).length !== 8;
      }), rt = String(String).split("String"), X = ce.exports = function(ft, xt, $t) {
        String(xt).slice(0, 7) === "Symbol(" && (xt = "[" + String(xt).replace(/^Symbol\(([^)]*)\)/, "$1") + "]"), $t && $t.getter && (xt = "get " + xt), $t && $t.setter && (xt = "set " + xt), (!pe(ft, "name") || ke && ft.name !== xt) && (be ? st(ft, "name", { value: xt, configurable: !0 }) : ft.name = xt), ot && $t && pe($t, "arity") && ft.length !== $t.arity && st(ft, "length", { value: $t.arity });
        try {
          $t && pe($t, "constructor") && $t.constructor ? be && st(ft, "prototype", { writable: !1 }) : ft.prototype && (ft.prototype = void 0);
        } catch {
        }
        var _t = Me(ft);
        return pe(_t, "source") || (_t.source = rt.join(typeof xt == "string" ? xt : "")), ft;
      };
      Function.prototype.toString = X(function() {
        return fe(this) && nt(this).source || $e(this);
      }, "toString");
    }), Xn = Pe((Ve, ce) => {
      var ae = En(), fe = Zt(), pe = Nn(), be = Rt();
      ce.exports = function(ke, $e, Ie, Me) {
        Me || (Me = {});
        var nt = Me.enumerable, st = Me.name !== void 0 ? Me.name : $e;
        if (ae(Ie) && pe(Ie, st, Me), Me.global)
          nt ? ke[$e] = Ie : be($e, Ie);
        else {
          try {
            Me.unsafe ? ke[$e] && (nt = !0) : delete ke[$e];
          } catch {
          }
          nt ? ke[$e] = Ie : fe.f(ke, $e, { value: Ie, enumerable: !1, configurable: !Me.nonConfigurable, writable: !Me.nonWritable });
        }
        return ke;
      };
    }), Kn = Pe((Ve, ce) => {
      var ae = Math.ceil, fe = Math.floor;
      ce.exports = Math.trunc || function(pe) {
        var be = +pe;
        return (be > 0 ? fe : ae)(be);
      };
    }), bn = Pe((Ve, ce) => {
      var ae = Kn();
      ce.exports = function(fe) {
        var pe = +fe;
        return pe !== pe || pe === 0 ? 0 : ae(pe);
      };
    }), sr = Pe((Ve, ce) => {
      var ae = bn(), fe = Math.max, pe = Math.min;
      ce.exports = function(be, ke) {
        var $e = ae(be);
        return $e < 0 ? fe($e + ke, 0) : pe($e, ke);
      };
    }), qt = Pe((Ve, ce) => {
      var ae = bn(), fe = Math.min;
      ce.exports = function(pe) {
        return pe > 0 ? fe(ae(pe), 9007199254740991) : 0;
      };
    }), Gt = Pe((Ve, ce) => {
      var ae = qt();
      ce.exports = function(fe) {
        return ae(fe.length);
      };
    }), tn = Pe((Ve, ce) => {
      var ae = Gn(), fe = sr(), pe = Gt(), be = function(ke) {
        return function($e, Ie, Me) {
          var nt = ae($e), st = pe(nt), ot = fe(Me, st), rt;
          if (ke && Ie != Ie) {
            for (; st > ot; )
              if (rt = nt[ot++], rt != rt)
                return !0;
          } else
            for (; st > ot; ot++)
              if ((ke || ot in nt) && nt[ot] === Ie)
                return ke || ot || 0;
          return !ke && -1;
        };
      };
      ce.exports = { includes: be(!0), indexOf: be(!1) };
    }), Cn = Pe((Ve, ce) => {
      var ae = Lt(), fe = Wn(), pe = Gn(), be = tn().indexOf, ke = pn(), $e = ae([].push);
      ce.exports = function(Ie, Me) {
        var nt = pe(Ie), st = 0, ot = [], rt;
        for (rt in nt)
          !fe(ke, rt) && fe(nt, rt) && $e(ot, rt);
        for (; Me.length > st; )
          fe(nt, rt = Me[st++]) && (~be(ot, rt) || $e(ot, rt));
        return ot;
      };
    }), cn = Pe((Ve, ce) => {
      ce.exports = ["constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf"];
    }), It = Pe((Ve) => {
      var ce = Cn(), ae = cn(), fe = ae.concat("length", "prototype");
      Ve.f = Object.getOwnPropertyNames || function(pe) {
        return ce(pe, fe);
      };
    }), Xt = Pe((Ve) => {
      Ve.f = Object.getOwnPropertySymbols;
    }), St = Pe((Ve, ce) => {
      var ae = on(), fe = Lt(), pe = It(), be = Xt(), ke = bt(), $e = fe([].concat);
      ce.exports = ae("Reflect", "ownKeys") || function(Ie) {
        var Me = pe.f(ke(Ie)), nt = be.f;
        return nt ? $e(Me, nt(Ie)) : Me;
      };
    }), xe = Pe((Ve, ce) => {
      var ae = Wn(), fe = St(), pe = Vt(), be = Zt();
      ce.exports = function(ke, $e, Ie) {
        for (var Me = fe($e), nt = be.f, st = pe.f, ot = 0; ot < Me.length; ot++) {
          var rt = Me[ot];
          !ae(ke, rt) && !(Ie && ae(Ie, rt)) && nt(ke, rt, st($e, rt));
        }
      };
    }), Oe = Pe((Ve, ce) => {
      var ae = At(), fe = En(), pe = /#|\.prototype\./, be = function(nt, st) {
        var ot = $e[ke(nt)];
        return ot == Me ? !0 : ot == Ie ? !1 : fe(st) ? ae(st) : !!st;
      }, ke = be.normalize = function(nt) {
        return String(nt).replace(pe, ".").toLowerCase();
      }, $e = be.data = {}, Ie = be.NATIVE = "N", Me = be.POLYFILL = "P";
      ce.exports = be;
    }), Ye = Pe((Ve, ce) => {
      var ae = wt(), fe = Vt().f, pe = an(), be = Xn(), ke = Rt(), $e = xe(), Ie = Oe();
      ce.exports = function(Me, nt) {
        var st = Me.target, ot = Me.global, rt = Me.stat, X, ft, xt, $t, _t, un;
        if (ot ? ft = ae : rt ? ft = ae[st] || ke(st, {}) : ft = (ae[st] || {}).prototype, ft)
          for (xt in nt) {
            if (_t = nt[xt], Me.dontCallGetSet ? (un = fe(ft, xt), $t = un && un.value) : $t = ft[xt], X = Ie(ot ? xt : st + (rt ? "." : "#") + xt, Me.forced), !X && $t !== void 0) {
              if (typeof _t == typeof $t)
                continue;
              $e(_t, $t);
            }
            (Me.sham || $t && $t.sham) && pe(_t, "sham", !0), be(ft, xt, _t, Me);
          }
      };
    }), dt = Pe((Ve, ce) => {
      var ae = wn();
      ce.exports = Array.isArray || function(fe) {
        return ae(fe) == "Array";
      };
    }), at = Pe((Ve, ce) => {
      var ae = TypeError, fe = 9007199254740991;
      ce.exports = function(pe) {
        if (pe > fe)
          throw ae("Maximum allowed index exceeded");
        return pe;
      };
    }), tt = Pe((Ve, ce) => {
      var ae = wn(), fe = Lt();
      ce.exports = function(pe) {
        if (ae(pe) === "Function")
          return fe(pe);
      };
    }), Et = Pe((Ve, ce) => {
      var ae = tt(), fe = ve(), pe = sn(), be = ae(ae.bind);
      ce.exports = function(ke, $e) {
        return fe(ke), $e === void 0 ? ke : pe ? be(ke, $e) : function() {
          return ke.apply($e, arguments);
        };
      };
    }), Dn = Pe((Ve, ce) => {
      var ae = dt(), fe = Gt(), pe = at(), be = Et(), ke = function($e, Ie, Me, nt, st, ot, rt, X) {
        for (var ft = st, xt = 0, $t = rt ? be(rt, X) : !1, _t, un; xt < nt; )
          xt in Me && (_t = $t ? $t(Me[xt], xt, Ie) : Me[xt], ot > 0 && ae(_t) ? (un = fe(_t), ft = ke($e, Ie, _t, un, ft, ot - 1) - 1) : (pe(ft + 1), $e[ft] = _t), ft++), xt++;
        return ft;
      };
      ce.exports = ke;
    }), Jn = Pe((Ve, ce) => {
      var ae = tr(), fe = ae("toStringTag"), pe = {};
      pe[fe] = "z", ce.exports = String(pe) === "[object z]";
    }), In = Pe((Ve, ce) => {
      var ae = Jn(), fe = En(), pe = wn(), be = tr(), ke = be("toStringTag"), $e = Object, Ie = pe(function() {
        return arguments;
      }()) == "Arguments", Me = function(nt, st) {
        try {
          return nt[st];
        } catch {
        }
      };
      ce.exports = ae ? pe : function(nt) {
        var st, ot, rt;
        return nt === void 0 ? "Undefined" : nt === null ? "Null" : typeof (ot = Me(st = $e(nt), ke)) == "string" ? ot : Ie ? pe(st) : (rt = pe(st)) == "Object" && fe(st.callee) ? "Arguments" : rt;
      };
    }), or = Pe((Ve, ce) => {
      var ae = Lt(), fe = At(), pe = En(), be = In(), ke = on(), $e = vn(), Ie = function() {
      }, Me = [], nt = ke("Reflect", "construct"), st = /^\s*(?:class|function)\b/, ot = ae(st.exec), rt = !st.exec(Ie), X = function(xt) {
        if (!pe(xt))
          return !1;
        try {
          return nt(Ie, Me, xt), !0;
        } catch {
          return !1;
        }
      }, ft = function(xt) {
        if (!pe(xt))
          return !1;
        switch (be(xt)) {
          case "AsyncFunction":
          case "GeneratorFunction":
          case "AsyncGeneratorFunction":
            return !1;
        }
        try {
          return rt || !!ot(st, $e(xt));
        } catch {
          return !0;
        }
      };
      ft.sham = !0, ce.exports = !nt || fe(function() {
        var xt;
        return X(X.call) || !X(Object) || !X(function() {
          xt = !0;
        }) || xt;
      }) ? ft : X;
    }), nr = Pe((Ve, ce) => {
      var ae = dt(), fe = or(), pe = Rn(), be = tr(), ke = be("species"), $e = Array;
      ce.exports = function(Ie) {
        var Me;
        return ae(Ie) && (Me = Ie.constructor, fe(Me) && (Me === $e || ae(Me.prototype)) ? Me = void 0 : pe(Me) && (Me = Me[ke], Me === null && (Me = void 0))), Me === void 0 ? $e : Me;
      };
    }), Ar = Pe((Ve, ce) => {
      var ae = nr();
      ce.exports = function(fe, pe) {
        return new (ae(fe))(pe === 0 ? 0 : pe);
      };
    }), vr = Pe(() => {
      var Ve = Ye(), ce = Dn(), ae = ve(), fe = er(), pe = Gt(), be = Ar();
      Ve({ target: "Array", proto: !0 }, { flatMap: function(ke) {
        var $e = fe(this), Ie = pe($e), Me;
        return ae(ke), Me = be($e, 0), Me.length = ce(Me, $e, $e, Ie, 0, 1, ke, arguments.length > 1 ? arguments[1] : void 0), Me;
      } });
    }), dr = Pe((Ve, ce) => {
      ce.exports = {};
    }), ru = Pe((Ve, ce) => {
      var ae = tr(), fe = dr(), pe = ae("iterator"), be = Array.prototype;
      ce.exports = function(ke) {
        return ke !== void 0 && (fe.Array === ke || be[pe] === ke);
      };
    }), uu = Pe((Ve, ce) => {
      var ae = In(), fe = Te(), pe = hn(), be = dr(), ke = tr(), $e = ke("iterator");
      ce.exports = function(Ie) {
        if (!pe(Ie))
          return fe(Ie, $e) || fe(Ie, "@@iterator") || be[ae(Ie)];
      };
    }), ju = Pe((Ve, ce) => {
      var ae = Kt(), fe = ve(), pe = bt(), be = re(), ke = uu(), $e = TypeError;
      ce.exports = function(Ie, Me) {
        var nt = arguments.length < 2 ? ke(Ie) : Me;
        if (fe(nt))
          return pe(ae(nt, Ie));
        throw $e(be(Ie) + " is not iterable");
      };
    }), Xi = Pe((Ve, ce) => {
      var ae = Kt(), fe = bt(), pe = Te();
      ce.exports = function(be, ke, $e) {
        var Ie, Me;
        fe(be);
        try {
          if (Ie = pe(be, "return"), !Ie) {
            if (ke === "throw")
              throw $e;
            return $e;
          }
          Ie = ae(Ie, be);
        } catch (nt) {
          Me = !0, Ie = nt;
        }
        if (ke === "throw")
          throw $e;
        if (Me)
          throw Ie;
        return fe(Ie), $e;
      };
    }), Ui = Pe((Ve, ce) => {
      var ae = Et(), fe = Kt(), pe = bt(), be = re(), ke = ru(), $e = Gt(), Ie = Vn(), Me = ju(), nt = uu(), st = Xi(), ot = TypeError, rt = function(ft, xt) {
        this.stopped = ft, this.result = xt;
      }, X = rt.prototype;
      ce.exports = function(ft, xt, $t) {
        var _t = $t && $t.that, un = !!($t && $t.AS_ENTRIES), H = !!($t && $t.IS_RECORD), kn = !!($t && $t.IS_ITERATOR), lr = !!($t && $t.INTERRUPTED), fr = ae(xt, _t), qn, rr, Fn, Ir, Un, _r, Lr, Or = function(Pn) {
          return qn && st(qn, "normal", Pn), new rt(!0, Pn);
        }, $r = function(Pn) {
          return un ? (pe(Pn), lr ? fr(Pn[0], Pn[1], Or) : fr(Pn[0], Pn[1])) : lr ? fr(Pn, Or) : fr(Pn);
        };
        if (H)
          qn = ft.iterator;
        else if (kn)
          qn = ft;
        else {
          if (rr = nt(ft), !rr)
            throw ot(be(ft) + " is not iterable");
          if (ke(rr)) {
            for (Fn = 0, Ir = $e(ft); Ir > Fn; Fn++)
              if (Un = $r(ft[Fn]), Un && Ie(X, Un))
                return Un;
            return new rt(!1);
          }
          qn = Me(ft, rr);
        }
        for (_r = H ? ft.next : qn.next; !(Lr = fe(_r, qn)).done; ) {
          try {
            Un = $r(Lr.value);
          } catch (Pn) {
            st(qn, "throw", Pn);
          }
          if (typeof Un == "object" && Un && Ie(X, Un))
            return Un;
        }
        return new rt(!1);
      };
    }), zi = Pe((Ve, ce) => {
      var ae = Nt(), fe = Zt(), pe = Mn();
      ce.exports = function(be, ke, $e) {
        var Ie = ae(ke);
        Ie in be ? fe.f(be, Ie, pe(0, $e)) : be[Ie] = $e;
      };
    }), Yi = Pe(() => {
      var Ve = Ye(), ce = Ui(), ae = zi();
      Ve({ target: "Object", stat: !0 }, { fromEntries: function(fe) {
        var pe = {};
        return ce(fe, function(be, ke) {
          ae(pe, be, ke);
        }, { AS_ENTRIES: !0 }), pe;
      } });
    }), Ki = Pe((Ve, ce) => {
      var ae = Nn(), fe = Zt();
      ce.exports = function(pe, be, ke) {
        return ke.get && ae(ke.get, be, { getter: !0 }), ke.set && ae(ke.set, be, { setter: !0 }), fe.f(pe, be, ke);
      };
    }), Qi = Pe((Ve, ce) => {
      var ae = bt();
      ce.exports = function() {
        var fe = ae(this), pe = "";
        return fe.hasIndices && (pe += "d"), fe.global && (pe += "g"), fe.ignoreCase && (pe += "i"), fe.multiline && (pe += "m"), fe.dotAll && (pe += "s"), fe.unicode && (pe += "u"), fe.unicodeSets && (pe += "v"), fe.sticky && (pe += "y"), pe;
      };
    }), Hi = Pe(() => {
      var Ve = wt(), ce = pt(), ae = Ki(), fe = Qi(), pe = At(), be = Ve.RegExp, ke = be.prototype, $e = ce && pe(function() {
        var Ie = !0;
        try {
          be(".", "d");
        } catch {
          Ie = !1;
        }
        var Me = {}, nt = "", st = Ie ? "dgimsy" : "gimsy", ot = function(xt, $t) {
          Object.defineProperty(Me, xt, { get: function() {
            return nt += $t, !0;
          } });
        }, rt = { dotAll: "s", global: "g", ignoreCase: "i", multiline: "m", sticky: "y" };
        Ie && (rt.hasIndices = "d");
        for (var X in rt)
          ot(X, rt[X]);
        var ft = Object.getOwnPropertyDescriptor(ke, "flags").get.call(Me);
        return ft !== st || nt !== st;
      });
      $e && ae(ke, "flags", { configurable: !0, get: fe });
    }), Zi = Pe(() => {
      var Ve = Ye(), ce = wt();
      Ve({ global: !0, forced: ce.globalThis !== ce }, { globalThis: ce });
    }), ea = Pe(() => {
      Zi();
    }), ta = Pe(() => {
      var Ve = Ye(), ce = Dn(), ae = er(), fe = Gt(), pe = bn(), be = Ar();
      Ve({ target: "Array", proto: !0 }, { flat: function() {
        var ke = arguments.length ? arguments[0] : void 0, $e = ae(this), Ie = fe($e), Me = be($e, 0);
        return Me.length = ce(Me, $e, $e, Ie, 0, ke === void 0 ? 1 : pe(ke)), Me;
      } });
    }), na = Pe((Ve, ce) => {
      var ae = ["cliName", "cliCategory", "cliDescription"], fe = ["_"], pe = ["languageId"];
      function be(u, l) {
        if (u == null)
          return {};
        var t = ke(u, l), s, i;
        if (Object.getOwnPropertySymbols) {
          var e = Object.getOwnPropertySymbols(u);
          for (i = 0; i < e.length; i++)
            s = e[i], !(l.indexOf(s) >= 0) && Object.prototype.propertyIsEnumerable.call(u, s) && (t[s] = u[s]);
        }
        return t;
      }
      function ke(u, l) {
        if (u == null)
          return {};
        var t = {}, s = Object.keys(u), i, e;
        for (e = 0; e < s.length; e++)
          i = s[e], !(l.indexOf(i) >= 0) && (t[i] = u[i]);
        return t;
      }
      vr(), Yi(), Hi(), ea(), ta();
      var $e = Object.create, Ie = Object.defineProperty, Me = Object.getOwnPropertyDescriptor, nt = Object.getOwnPropertyNames, st = Object.getPrototypeOf, ot = Object.prototype.hasOwnProperty, rt = (u, l) => function() {
        return u && (l = (0, u[nt(u)[0]])(u = 0)), l;
      }, X = (u, l) => function() {
        return l || (0, u[nt(u)[0]])((l = { exports: {} }).exports, l), l.exports;
      }, ft = (u, l) => {
        for (var t in l)
          Ie(u, t, { get: l[t], enumerable: !0 });
      }, xt = (u, l, t, s) => {
        if (l && typeof l == "object" || typeof l == "function")
          for (let i of nt(l))
            !ot.call(u, i) && i !== t && Ie(u, i, { get: () => l[i], enumerable: !(s = Me(l, i)) || s.enumerable });
        return u;
      }, $t = (u, l, t) => (t = u != null ? $e(st(u)) : {}, xt(l || !u || !u.__esModule ? Ie(t, "default", { value: u, enumerable: !0 }) : t, u)), _t = (u) => xt(Ie({}, "__esModule", { value: !0 }), u), un, H = rt({ "<define:process>"() {
        un = { env: {}, argv: [] };
      } }), kn = X({ "package.json"(u, l) {
        l.exports = { version: "2.8.4" };
      } }), lr = X({ "node_modules/diff/lib/diff/base.js"(u) {
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
      } }), fr = X({ "node_modules/diff/lib/diff/array.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 }), u.diffArrays = i, u.arrayDiff = void 0;
        var l = t(lr());
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
      } }), qn = X({ "src/document/doc-builders.js"(u, l) {
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
      } }), rr = X({ "src/common/end-of-line.js"(u, l) {
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
      } }), Fn = X({ "src/utils/get-last.js"(u, l) {
        H();
        var t = (s) => s[s.length - 1];
        l.exports = t;
      } });
      function Ir() {
        let { onlyFirst: u = !1 } = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, l = ["[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)", "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))"].join("|");
        return new RegExp(l, u ? void 0 : "g");
      }
      var Un = rt({ "node_modules/strip-ansi/node_modules/ansi-regex/index.js"() {
        H();
      } });
      function _r(u) {
        if (typeof u != "string")
          throw new TypeError(`Expected a \`string\`, got \`${typeof u}\``);
        return u.replace(Ir(), "");
      }
      var Lr = rt({ "node_modules/strip-ansi/index.js"() {
        H(), Un();
      } });
      function Or(u) {
        return Number.isInteger(u) ? u >= 4352 && (u <= 4447 || u === 9001 || u === 9002 || 11904 <= u && u <= 12871 && u !== 12351 || 12880 <= u && u <= 19903 || 19968 <= u && u <= 42182 || 43360 <= u && u <= 43388 || 44032 <= u && u <= 55203 || 63744 <= u && u <= 64255 || 65040 <= u && u <= 65049 || 65072 <= u && u <= 65131 || 65281 <= u && u <= 65376 || 65504 <= u && u <= 65510 || 110592 <= u && u <= 110593 || 127488 <= u && u <= 127569 || 131072 <= u && u <= 262141) : !1;
      }
      var $r = rt({ "node_modules/is-fullwidth-code-point/index.js"() {
        H();
      } }), Pn = X({ "node_modules/emoji-regex/index.js"(u, l) {
        H(), l.exports = function() {
          return /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67)\uDB40\uDC7F|(?:\uD83E\uDDD1\uD83C\uDFFF\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFE])|(?:\uD83E\uDDD1\uD83C\uDFFE\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFD\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFC\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFB\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFC-\uDFFF])|\uD83D\uDC68(?:\uD83C\uDFFB(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF]))|\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|[\u2695\u2696\u2708]\uFE0F|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))?|(?:\uD83C[\uDFFC-\uDFFF])\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF]))|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])\uFE0F|\u200D(?:(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D[\uDC66\uDC67])|\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC)?|(?:\uD83D\uDC69(?:\uD83C\uDFFB\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|(?:\uD83C[\uDFFC-\uDFFF])\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69]))|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1)(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC69(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83E\uDDD1(?:\u200D(?:\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83E\uDDD1(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\uD83D\uDE36\u200D\uD83C\uDF2B|\uD83C\uDFF3\uFE0F\u200D\u26A7|\uD83D\uDC3B\u200D\u2744|(?:(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\uD83C\uDFF4\u200D\u2620|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])\u200D[\u2640\u2642]|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u2328\u23CF\u23ED-\u23EF\u23F1\u23F2\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB\u25FC\u2600-\u2604\u260E\u2611\u2618\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u2692\u2694-\u2697\u2699\u269B\u269C\u26A0\u26A7\u26B0\u26B1\u26C8\u26CF\u26D1\u26D3\u26E9\u26F0\u26F1\u26F4\u26F7\u26F8\u2702\u2708\u2709\u270F\u2712\u2714\u2716\u271D\u2721\u2733\u2734\u2744\u2747\u2763\u27A1\u2934\u2935\u2B05-\u2B07\u3030\u303D\u3297\u3299]|\uD83C[\uDD70\uDD71\uDD7E\uDD7F\uDE02\uDE37\uDF21\uDF24-\uDF2C\uDF36\uDF7D\uDF96\uDF97\uDF99-\uDF9B\uDF9E\uDF9F\uDFCD\uDFCE\uDFD4-\uDFDF\uDFF5\uDFF7]|\uD83D[\uDC3F\uDCFD\uDD49\uDD4A\uDD6F\uDD70\uDD73\uDD76-\uDD79\uDD87\uDD8A-\uDD8D\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA\uDECB\uDECD-\uDECF\uDEE0-\uDEE5\uDEE9\uDEF0\uDEF3])\uFE0F|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDE35\u200D\uD83D\uDCAB|\uD83D\uDE2E\u200D\uD83D\uDCA8|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83E\uDDD1(?:\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC|\uD83C\uDFFB)?|\uD83D\uDC69(?:\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC|\uD83C\uDFFB)?|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF6\uD83C\uDDE6|\uD83C\uDDF4\uD83C\uDDF2|\uD83D\uDC08\u200D\u2B1B|\u2764\uFE0F\u200D(?:\uD83D\uDD25|\uD83E\uDE79)|\uD83D\uDC41\uFE0F|\uD83C\uDFF3\uFE0F|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|[#\*0-9]\uFE0F\u20E3|\u2764\uFE0F|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])|\uD83C\uDFF4|(?:[\u270A\u270B]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270C\u270D]|\uD83D[\uDD74\uDD90])(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])|[\u270A\u270B]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC08\uDC15\uDC3B\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE2E\uDE35\uDE36\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5]|\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD]|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF]|[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF84\uDF86-\uDF93\uDFA0-\uDFC1\uDFC5\uDFC6\uDFC8\uDFC9\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC07\uDC09-\uDC14\uDC16-\uDC3A\uDC3C-\uDC3E\uDC40\uDC44\uDC45\uDC51-\uDC65\uDC6A\uDC79-\uDC7B\uDC7D-\uDC80\uDC84\uDC88-\uDC8E\uDC90\uDC92-\uDCA9\uDCAB-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDDA4\uDDFB-\uDE2D\uDE2F-\uDE34\uDE37-\uDE44\uDE48-\uDE4A\uDE80-\uDEA2\uDEA4-\uDEB3\uDEB7-\uDEBF\uDEC1-\uDEC5\uDED0-\uDED2\uDED5-\uDED7\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0D\uDD0E\uDD10-\uDD17\uDD1D\uDD20-\uDD25\uDD27-\uDD2F\uDD3A\uDD3F-\uDD45\uDD47-\uDD76\uDD78\uDD7A-\uDDB4\uDDB7\uDDBA\uDDBC-\uDDCB\uDDD0\uDDE0-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6]|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5-\uDED7\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0C-\uDD3A\uDD3C-\uDD45\uDD47-\uDD78\uDD7A-\uDDCB\uDDCD-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26A7\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5-\uDED7\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0C-\uDD3A\uDD3C-\uDD45\uDD47-\uDD78\uDD7A-\uDDCB\uDDCD-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDD77\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD])/g;
        };
      } }), Iu = {};
      ft(Iu, { default: () => ra });
      function ra(u) {
        if (typeof u != "string" || u.length === 0 || (u = _r(u), u.length === 0))
          return 0;
        u = u.replace((0, _u.default)(), "  ");
        let l = 0;
        for (let t = 0; t < u.length; t++) {
          let s = u.codePointAt(t);
          s <= 31 || s >= 127 && s <= 159 || s >= 768 && s <= 879 || (s > 65535 && t++, l += Or(s) ? 2 : 1);
        }
        return l;
      }
      var _u, ua = rt({ "node_modules/string-width/index.js"() {
        H(), Lr(), $r(), _u = $t(Pn());
      } }), Lu = X({ "src/utils/get-string-width.js"(u, l) {
        H();
        var t = (ua(), _t(Iu)).default, s = /[^\x20-\x7F]/;
        function i(e) {
          return e ? s.test(e) ? t(e) : e.length : 0;
        }
        l.exports = i;
      } }), br = X({ "src/document/doc-utils.js"(u, l) {
        H();
        var t = Fn(), { literalline: s, join: i } = qn(), e = (a) => Array.isArray(a) || a && a.type === "concat", n = (a) => {
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
                for (let $ = I.length, V = $ - 1; V >= 0; --V)
                  x.push(I[V]);
              } else if (T.type === "if-break")
                T.flatContents && x.push(T.flatContents), T.breakContents && x.push(T.breakContents);
              else if (T.type === "group" && T.expandedStates)
                if (b)
                  for (let I = T.expandedStates.length, $ = I - 1; $ >= 0; --$)
                    x.push(T.expandedStates[$]);
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
              let I = T.breakContents && b(T.breakContents), $ = T.flatContents && b(T.flatContents);
              return g(Object.assign(Object.assign({}, T), {}, { breakContents: I, flatContents: $ }));
            }
            if (T.type === "group" && T.expandedStates) {
              let I = T.expandedStates.map(b), $ = I[0];
              return g(Object.assign(Object.assign({}, T), {}, { contents: $, expandedStates: I }));
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
            let $ = g(I);
            if ($ !== void 0 && (x = !0, b = $), x)
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
      } }), ia = X({ "src/document/doc-printer.js"(u, l) {
        H();
        var { convertEndOfLineToChars: t } = rr(), s = Fn(), i = Lu(), { fill: e, cursor: n, indent: r } = qn(), { isConcat: o, getDocParts: c } = br(), h, m = 1, y = 2;
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
                      let T = { ind: E, mode: y, doc: x.contents }, I = k - f, $ = a.length > 0;
                      if (!x.break && A(T, B, I, $))
                        B.push(T);
                      else if (x.expandedStates) {
                        let V = s(x.expandedStates);
                        if (x.break) {
                          B.push({ ind: E, mode: m, doc: V });
                          break;
                        } else
                          for (let M = 1; M < x.expandedStates.length + 1; M++)
                            if (M >= x.expandedStates.length) {
                              B.push({ ind: E, mode: m, doc: V });
                              break;
                            } else {
                              let U = x.expandedStates[M], _ = { ind: E, mode: y, doc: U };
                              if (A(_, B, I, $)) {
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
                  let [$, V] = I, M = { ind: E, mode: y, doc: $ }, U = { ind: E, mode: m, doc: $ }, _ = A(M, [], T, a.length > 0, !0);
                  if (I.length === 1) {
                    _ ? B.push(M) : B.push(U);
                    break;
                  }
                  let ee = { ind: E, mode: y, doc: V }, R = { ind: E, mode: m, doc: V };
                  if (I.length === 2) {
                    _ ? B.push(ee, M) : B.push(R, U);
                    break;
                  }
                  I.splice(0, 2);
                  let O = { ind: E, mode: b, doc: e(I) }, Z = I[0];
                  A({ ind: E, mode: y, doc: [$, V, Z] }, [], T, a.length > 0, !0) ? B.push(O, ee, M) : _ ? B.push(O, R, M) : B.push(O, R, U);
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
      } }), aa = X({ "src/document/doc-debug.js"(u, l) {
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
      } }), mt = X({ "src/document/index.js"(u, l) {
        H(), l.exports = { builders: qn(), printer: ia(), utils: br(), debug: aa() };
      } }), Ou = {};
      ft(Ou, { default: () => sa });
      function sa(u) {
        if (typeof u != "string")
          throw new TypeError("Expected a string");
        return u.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
      }
      var oa = rt({ "node_modules/escape-string-regexp/index.js"() {
        H();
      } }), $u = X({ "node_modules/semver/internal/debug.js"(u, l) {
        H();
        var t = typeof un == "object" && un.env && un.env.NODE_DEBUG && /\bsemver\b/i.test(un.env.NODE_DEBUG) ? function() {
          for (var s = arguments.length, i = new Array(s), e = 0; e < s; e++)
            i[e] = arguments[e];
          return console.error("SEMVER", ...i);
        } : () => {
        };
        l.exports = t;
      } }), Mu = X({ "node_modules/semver/internal/constants.js"(u, l) {
        H();
        var t = "2.0.0", s = 256, i = Number.MAX_SAFE_INTEGER || 9007199254740991, e = 16;
        l.exports = { SEMVER_SPEC_VERSION: t, MAX_LENGTH: s, MAX_SAFE_INTEGER: i, MAX_SAFE_COMPONENT_LENGTH: e };
      } }), la = X({ "node_modules/semver/internal/re.js"(u, l) {
        H();
        var { MAX_SAFE_COMPONENT_LENGTH: t } = Mu(), s = $u();
        u = l.exports = {};
        var i = u.re = [], e = u.src = [], n = u.t = {}, r = 0, o = (c, h, m) => {
          let y = r++;
          s(c, y, h), n[c] = y, e[y] = h, i[y] = new RegExp(h, m ? "g" : void 0);
        };
        o("NUMERICIDENTIFIER", "0|[1-9]\\d*"), o("NUMERICIDENTIFIERLOOSE", "[0-9]+"), o("NONNUMERICIDENTIFIER", "\\d*[a-zA-Z-][a-zA-Z0-9-]*"), o("MAINVERSION", `(${e[n.NUMERICIDENTIFIER]})\\.(${e[n.NUMERICIDENTIFIER]})\\.(${e[n.NUMERICIDENTIFIER]})`), o("MAINVERSIONLOOSE", `(${e[n.NUMERICIDENTIFIERLOOSE]})\\.(${e[n.NUMERICIDENTIFIERLOOSE]})\\.(${e[n.NUMERICIDENTIFIERLOOSE]})`), o("PRERELEASEIDENTIFIER", `(?:${e[n.NUMERICIDENTIFIER]}|${e[n.NONNUMERICIDENTIFIER]})`), o("PRERELEASEIDENTIFIERLOOSE", `(?:${e[n.NUMERICIDENTIFIERLOOSE]}|${e[n.NONNUMERICIDENTIFIER]})`), o("PRERELEASE", `(?:-(${e[n.PRERELEASEIDENTIFIER]}(?:\\.${e[n.PRERELEASEIDENTIFIER]})*))`), o("PRERELEASELOOSE", `(?:-?(${e[n.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${e[n.PRERELEASEIDENTIFIERLOOSE]})*))`), o("BUILDIDENTIFIER", "[0-9A-Za-z-]+"), o("BUILD", `(?:\\+(${e[n.BUILDIDENTIFIER]}(?:\\.${e[n.BUILDIDENTIFIER]})*))`), o("FULLPLAIN", `v?${e[n.MAINVERSION]}${e[n.PRERELEASE]}?${e[n.BUILD]}?`), o("FULL", `^${e[n.FULLPLAIN]}$`), o("LOOSEPLAIN", `[v=\\s]*${e[n.MAINVERSIONLOOSE]}${e[n.PRERELEASELOOSE]}?${e[n.BUILD]}?`), o("LOOSE", `^${e[n.LOOSEPLAIN]}$`), o("GTLT", "((?:<|>)?=?)"), o("XRANGEIDENTIFIERLOOSE", `${e[n.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), o("XRANGEIDENTIFIER", `${e[n.NUMERICIDENTIFIER]}|x|X|\\*`), o("XRANGEPLAIN", `[v=\\s]*(${e[n.XRANGEIDENTIFIER]})(?:\\.(${e[n.XRANGEIDENTIFIER]})(?:\\.(${e[n.XRANGEIDENTIFIER]})(?:${e[n.PRERELEASE]})?${e[n.BUILD]}?)?)?`), o("XRANGEPLAINLOOSE", `[v=\\s]*(${e[n.XRANGEIDENTIFIERLOOSE]})(?:\\.(${e[n.XRANGEIDENTIFIERLOOSE]})(?:\\.(${e[n.XRANGEIDENTIFIERLOOSE]})(?:${e[n.PRERELEASELOOSE]})?${e[n.BUILD]}?)?)?`), o("XRANGE", `^${e[n.GTLT]}\\s*${e[n.XRANGEPLAIN]}$`), o("XRANGELOOSE", `^${e[n.GTLT]}\\s*${e[n.XRANGEPLAINLOOSE]}$`), o("COERCE", `(^|[^\\d])(\\d{1,${t}})(?:\\.(\\d{1,${t}}))?(?:\\.(\\d{1,${t}}))?(?:$|[^\\d])`), o("COERCERTL", e[n.COERCE], !0), o("LONETILDE", "(?:~>?)"), o("TILDETRIM", `(\\s*)${e[n.LONETILDE]}\\s+`, !0), u.tildeTrimReplace = "$1~", o("TILDE", `^${e[n.LONETILDE]}${e[n.XRANGEPLAIN]}$`), o("TILDELOOSE", `^${e[n.LONETILDE]}${e[n.XRANGEPLAINLOOSE]}$`), o("LONECARET", "(?:\\^)"), o("CARETTRIM", `(\\s*)${e[n.LONECARET]}\\s+`, !0), u.caretTrimReplace = "$1^", o("CARET", `^${e[n.LONECARET]}${e[n.XRANGEPLAIN]}$`), o("CARETLOOSE", `^${e[n.LONECARET]}${e[n.XRANGEPLAINLOOSE]}$`), o("COMPARATORLOOSE", `^${e[n.GTLT]}\\s*(${e[n.LOOSEPLAIN]})$|^$`), o("COMPARATOR", `^${e[n.GTLT]}\\s*(${e[n.FULLPLAIN]})$|^$`), o("COMPARATORTRIM", `(\\s*)${e[n.GTLT]}\\s*(${e[n.LOOSEPLAIN]}|${e[n.XRANGEPLAIN]})`, !0), u.comparatorTrimReplace = "$1$2$3", o("HYPHENRANGE", `^\\s*(${e[n.XRANGEPLAIN]})\\s+-\\s+(${e[n.XRANGEPLAIN]})\\s*$`), o("HYPHENRANGELOOSE", `^\\s*(${e[n.XRANGEPLAINLOOSE]})\\s+-\\s+(${e[n.XRANGEPLAINLOOSE]})\\s*$`), o("STAR", "(<|>)?=?\\s*\\*"), o("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), o("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
      } }), pa = X({ "node_modules/semver/internal/parse-options.js"(u, l) {
        H();
        var t = ["includePrerelease", "loose", "rtl"], s = (i) => i ? typeof i != "object" ? { loose: !0 } : t.filter((e) => i[e]).reduce((e, n) => (e[n] = !0, e), {}) : {};
        l.exports = s;
      } }), ca = X({ "node_modules/semver/internal/identifiers.js"(u, l) {
        H();
        var t = /^[0-9]+$/, s = (e, n) => {
          let r = t.test(e), o = t.test(n);
          return r && o && (e = +e, n = +n), e === n ? 0 : r && !o ? -1 : o && !r ? 1 : e < n ? -1 : 1;
        }, i = (e, n) => s(n, e);
        l.exports = { compareIdentifiers: s, rcompareIdentifiers: i };
      } }), Da = X({ "node_modules/semver/classes/semver.js"(u, l) {
        H();
        var t = $u(), { MAX_LENGTH: s, MAX_SAFE_INTEGER: i } = Mu(), { re: e, t: n } = la(), r = pa(), { compareIdentifiers: o } = ca(), c = class {
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
      } }), iu = X({ "node_modules/semver/functions/compare.js"(u, l) {
        H();
        var t = Da(), s = (i, e, n) => new t(i, n).compare(new t(e, n));
        l.exports = s;
      } }), da = X({ "node_modules/semver/functions/lt.js"(u, l) {
        H();
        var t = iu(), s = (i, e, n) => t(i, e, n) < 0;
        l.exports = s;
      } }), fa = X({ "node_modules/semver/functions/gte.js"(u, l) {
        H();
        var t = iu(), s = (i, e, n) => t(i, e, n) >= 0;
        l.exports = s;
      } }), ma = X({ "src/utils/arrayify.js"(u, l) {
        H(), l.exports = (t, s) => Object.entries(t).map((i) => {
          let [e, n] = i;
          return Object.assign({ [s]: e }, n);
        });
      } }), ga = X({ "node_modules/outdent/lib/index.js"(u, l) {
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
      } }), ya = X({ "src/main/core-options.js"(u, l) {
        H();
        var { outdent: t } = ga(), s = "Config", i = "Editor", e = "Format", n = "Other", r = "Output", o = "Global", c = "Special", h = { cursorOffset: { since: "1.4.0", category: c, type: "int", default: -1, range: { start: -1, end: Number.POSITIVE_INFINITY, step: 1 }, description: t`
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
      } }), au = X({ "src/main/support.js"(u, l) {
        H();
        var t = { compare: iu(), lt: da(), gte: fa() }, s = ma(), i = kn().version, e = ya().options;
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
            return m ? A : be(A, ae);
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
      } }), su = X({ "src/utils/is-non-empty-array.js"(u, l) {
        H();
        function t(s) {
          return Array.isArray(s) && s.length > 0;
        }
        l.exports = t;
      } }), Mr = X({ "src/utils/text/skip.js"(u, l) {
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
      } }), Ru = X({ "src/utils/text/skip-inline-comment.js"(u, l) {
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
      } }), Vu = X({ "src/utils/text/skip-trailing-comment.js"(u, l) {
        H();
        var { skipEverythingButNewLine: t } = Mr();
        function s(i, e) {
          return e === !1 ? !1 : i.charAt(e) === "/" && i.charAt(e + 1) === "/" ? t(i, e) : e;
        }
        l.exports = s;
      } }), Ju = X({ "src/utils/text/skip-newline.js"(u, l) {
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
      } }), ha = X({ "src/utils/text/get-next-non-space-non-comment-character-index-with-start-index.js"(u, l) {
        H();
        var t = Ru(), s = Ju(), i = Vu(), { skipSpaces: e } = Mr();
        function n(r, o) {
          let c = null, h = o;
          for (; h !== c; )
            c = h, h = e(r, h), h = t(r, h), h = i(r, h), h = s(r, h);
          return h;
        }
        l.exports = n;
      } }), kt = X({ "src/common/util.js"(u, l) {
        H();
        var { default: t } = (oa(), _t(Ou)), s = Fn(), { getSupportInfo: i } = au(), e = su(), n = Lu(), { skipWhitespace: r, skipSpaces: o, skipToLineEnd: c, skipEverythingButNewLine: h } = Mr(), m = Ru(), y = Vu(), p = Ju(), D = ha(), C = (R) => R[R.length - 2];
        function w(R) {
          return (O, Z, oe) => {
            let te = oe && oe.backwards;
            if (Z === !1)
              return !1;
            let { length: Ee } = O, q = Z;
            for (; q >= 0 && q < Ee; ) {
              let Y = O.charAt(q);
              if (R instanceof RegExp) {
                if (!R.test(Y))
                  return q;
              } else if (!R.includes(Y))
                return q;
              te ? q-- : q++;
            }
            return q === -1 || q === Ee ? q : !1;
          };
        }
        function P(R, O) {
          let Z = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, oe = o(R, Z.backwards ? O - 1 : O, Z), te = p(R, oe, Z);
          return oe !== te;
        }
        function A(R, O, Z) {
          for (let oe = O; oe < Z; ++oe)
            if (R.charAt(oe) === `
`)
              return !0;
          return !1;
        }
        function N(R, O, Z) {
          let oe = Z(O) - 1;
          oe = o(R, oe, { backwards: !0 }), oe = p(R, oe, { backwards: !0 }), oe = o(R, oe, { backwards: !0 });
          let te = p(R, oe, { backwards: !0 });
          return oe !== te;
        }
        function S(R, O) {
          let Z = null, oe = O;
          for (; oe !== Z; )
            Z = oe, oe = c(R, oe), oe = m(R, oe), oe = o(R, oe);
          return oe = y(R, oe), oe = p(R, oe), oe !== !1 && P(R, oe);
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
          let Z = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0, oe = 0;
          for (let te = Z; te < R.length; ++te)
            R[te] === "	" ? oe = oe + O - oe % O : oe++;
          return oe;
        }
        function d(R, O) {
          let Z = R.lastIndexOf(`
`);
          return Z === -1 ? 0 : B(R.slice(Z + 1).match(/^[\t ]*/)[0], O);
        }
        function F(R, O) {
          let Z = { quote: '"', regex: /"/g, escaped: "&quot;" }, oe = { quote: "'", regex: /'/g, escaped: "&apos;" }, te = O === "'" ? oe : Z, Ee = te === oe ? Z : oe, q = te;
          if (R.includes(te.quote) || R.includes(Ee.quote)) {
            let Y = (R.match(te.regex) || []).length, ge = (R.match(Ee.regex) || []).length;
            q = Y > ge ? Ee : te;
          }
          return q;
        }
        function a(R, O) {
          let Z = R.slice(1, -1), oe = O.parser === "json" || O.parser === "json5" && O.quoteProps === "preserve" && !O.singleQuote ? '"' : O.__isInHtmlAttribute ? "'" : F(Z, O.singleQuote ? "'" : '"').quote;
          return g(Z, oe, !(O.parser === "css" || O.parser === "less" || O.parser === "scss" || O.__embeddedInHtml));
        }
        function g(R, O, Z) {
          let oe = O === '"' ? "'" : '"', te = /\\(.)|(["'])/gs, Ee = R.replace(te, (q, Y, ge) => Y === oe ? Y : ge === O ? "\\" + ge : ge || (Z && /^[^\n\r"'0-7\\bfnrt-vx\u2028\u2029]$/.test(Y) ? Y : "\\" + Y));
          return O + Ee + O;
        }
        function E(R) {
          return R.toLowerCase().replace(/^([+-]?[\d.]+e)(?:\+|(-))?0*(\d)/, "$1$2$3").replace(/^([+-]?[\d.]+)e[+-]?0+$/, "$1").replace(/^([+-])?\./, "$10.").replace(/(\.\d+?)0+(?=e|$)/, "$1").replace(/\.(?=e|$)/, "");
        }
        function b(R, O) {
          let Z = R.match(new RegExp(`(${t(O)})+`, "g"));
          return Z === null ? 0 : Z.reduce((oe, te) => Math.max(oe, te.length / O.length), 0);
        }
        function x(R, O) {
          let Z = R.match(new RegExp(`(${t(O)})+`, "g"));
          if (Z === null)
            return 0;
          let oe = /* @__PURE__ */ new Map(), te = 0;
          for (let Ee of Z) {
            let q = Ee.length / O.length;
            oe.set(q, !0), q > te && (te = q);
          }
          for (let Ee = 1; Ee < te; Ee++)
            if (!oe.get(Ee))
              return Ee;
          return te + 1;
        }
        function T(R, O) {
          (R.comments || (R.comments = [])).push(O), O.printed = !1, O.nodeDescription = ee(R);
        }
        function I(R, O) {
          O.leading = !0, O.trailing = !1, T(R, O);
        }
        function $(R, O, Z) {
          O.leading = !1, O.trailing = !1, Z && (O.marker = Z), T(R, O);
        }
        function V(R, O) {
          O.leading = !1, O.trailing = !0, T(R, O);
        }
        function M(R, O) {
          let { languages: Z } = i({ plugins: O.plugins }), oe = Z.find((te) => {
            let { name: Ee } = te;
            return Ee.toLowerCase() === R;
          }) || Z.find((te) => {
            let { aliases: Ee } = te;
            return Array.isArray(Ee) && Ee.includes(R);
          }) || Z.find((te) => {
            let { extensions: Ee } = te;
            return Array.isArray(Ee) && Ee.includes(`.${R}`);
          });
          return oe && oe.parsers[0];
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
        l.exports = { inferParserByLanguage: M, getStringWidth: n, getMaxContinuousCount: b, getMinNotPresentContinuousCount: x, getPenultimate: C, getLast: s, getNextNonSpaceNonCommentCharacterIndexWithStartIndex: D, getNextNonSpaceNonCommentCharacterIndex: k, getNextNonSpaceNonCommentCharacter: J, skip: w, skipWhitespace: r, skipSpaces: o, skipToLineEnd: c, skipEverythingButNewLine: h, skipInlineComment: m, skipTrailingComment: y, skipNewline: p, isNextLineEmptyAfterIndex: S, isNextLineEmpty: j, isPreviousLineEmpty: N, hasNewline: P, hasNewlineInRange: A, hasSpaces: f, getAlignmentSize: B, getIndentSize: d, getPreferredQuote: F, printString: a, printNumber: E, makeString: g, addLeadingComment: I, addDanglingComment: $, addTrailingComment: V, isFrontMatterNode: U, isNonEmptyArray: e, createGroupIdMapper: _ };
      } }), qu = {};
      ft(qu, { basename: () => zu, default: () => Qu, delimiter: () => Du, dirname: () => Uu, extname: () => Yu, isAbsolute: () => lu, join: () => Wu, normalize: () => ou, relative: () => Xu, resolve: () => Rr, sep: () => cu });
      function Gu(u, l) {
        for (var t = 0, s = u.length - 1; s >= 0; s--) {
          var i = u[s];
          i === "." ? u.splice(s, 1) : i === ".." ? (u.splice(s, 1), t++) : t && (u.splice(s, 1), t--);
        }
        if (l)
          for (; t--; t)
            u.unshift("..");
        return u;
      }
      function Rr() {
        for (var u = "", l = !1, t = arguments.length - 1; t >= -1 && !l; t--) {
          var s = t >= 0 ? arguments[t] : "/";
          if (typeof s != "string")
            throw new TypeError("Arguments to path.resolve must be strings");
          s && (u = s + "/" + u, l = s.charAt(0) === "/");
        }
        return u = Gu(pu(u.split("/"), function(i) {
          return !!i;
        }), !l).join("/"), (l ? "/" : "") + u || ".";
      }
      function ou(u) {
        var l = lu(u), t = Hu(u, -1) === "/";
        return u = Gu(pu(u.split("/"), function(s) {
          return !!s;
        }), !l).join("/"), !u && !l && (u = "."), u && t && (u += "/"), (l ? "/" : "") + u;
      }
      function lu(u) {
        return u.charAt(0) === "/";
      }
      function Wu() {
        var u = Array.prototype.slice.call(arguments, 0);
        return ou(pu(u, function(l, t) {
          if (typeof l != "string")
            throw new TypeError("Arguments to path.join must be strings");
          return l;
        }).join("/"));
      }
      function Xu(u, l) {
        u = Rr(u).substr(1), l = Rr(l).substr(1);
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
      function Uu(u) {
        var l = Vr(u), t = l[0], s = l[1];
        return !t && !s ? "." : (s && (s = s.substr(0, s.length - 1)), t + s);
      }
      function zu(u, l) {
        var t = Vr(u)[2];
        return l && t.substr(-1 * l.length) === l && (t = t.substr(0, t.length - l.length)), t;
      }
      function Yu(u) {
        return Vr(u)[3];
      }
      function pu(u, l) {
        if (u.filter)
          return u.filter(l);
        for (var t = [], s = 0; s < u.length; s++)
          l(u[s], s, u) && t.push(u[s]);
        return t;
      }
      var Ku, Vr, cu, Du, Qu, Hu, Ea = rt({ "node-modules-polyfills:path"() {
        H(), Ku = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/, Vr = function(u) {
          return Ku.exec(u).slice(1);
        }, cu = "/", Du = ":", Qu = { extname: Yu, basename: zu, dirname: Uu, sep: cu, delimiter: Du, relative: Xu, join: Wu, isAbsolute: lu, normalize: ou, resolve: Rr }, Hu = "ab".substr(-1) === "b" ? function(u, l, t) {
          return u.substr(l, t);
        } : function(u, l, t) {
          return l < 0 && (l = u.length + l), u.substr(l, t);
        };
      } }), Ca = X({ "node-modules-polyfills-commonjs:path"(u, l) {
        H();
        var t = (Ea(), _t(qu));
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
      } }), Zn = {};
      ft(Zn, { __assign: () => qr, __asyncDelegator: () => ja, __asyncGenerator: () => Pa, __asyncValues: () => Ia, __await: () => Sr, __awaiter: () => Sa, __classPrivateFieldGet: () => $a, __classPrivateFieldSet: () => Ma, __createBinding: () => Ta, __decorate: () => va, __exportStar: () => wa, __extends: () => Fa, __generator: () => Ba, __importDefault: () => Oa, __importStar: () => La, __makeTemplateObject: () => _a, __metadata: () => xa, __param: () => ba, __read: () => Zu, __rest: () => Aa, __spread: () => Na, __spreadArrays: () => ka, __values: () => du });
      function Fa(u, l) {
        Jr(u, l);
        function t() {
          this.constructor = u;
        }
        u.prototype = l === null ? Object.create(l) : (t.prototype = l.prototype, new t());
      }
      function Aa(u, l) {
        var t = {};
        for (var s in u)
          Object.prototype.hasOwnProperty.call(u, s) && l.indexOf(s) < 0 && (t[s] = u[s]);
        if (u != null && typeof Object.getOwnPropertySymbols == "function")
          for (var i = 0, s = Object.getOwnPropertySymbols(u); i < s.length; i++)
            l.indexOf(s[i]) < 0 && Object.prototype.propertyIsEnumerable.call(u, s[i]) && (t[s[i]] = u[s[i]]);
        return t;
      }
      function va(u, l, t, s) {
        var i = arguments.length, e = i < 3 ? l : s === null ? s = Object.getOwnPropertyDescriptor(l, t) : s, n;
        if (typeof Reflect == "object" && typeof Reflect.decorate == "function")
          e = Reflect.decorate(u, l, t, s);
        else
          for (var r = u.length - 1; r >= 0; r--)
            (n = u[r]) && (e = (i < 3 ? n(e) : i > 3 ? n(l, t, e) : n(l, t)) || e);
        return i > 3 && e && Object.defineProperty(l, t, e), e;
      }
      function ba(u, l) {
        return function(t, s) {
          l(t, s, u);
        };
      }
      function xa(u, l) {
        if (typeof Reflect == "object" && typeof Reflect.metadata == "function")
          return Reflect.metadata(u, l);
      }
      function Sa(u, l, t, s) {
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
      function Ba(u, l) {
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
      function Ta(u, l, t, s) {
        s === void 0 && (s = t), u[s] = l[t];
      }
      function wa(u, l) {
        for (var t in u)
          t !== "default" && !l.hasOwnProperty(t) && (l[t] = u[t]);
      }
      function du(u) {
        var l = typeof Symbol == "function" && Symbol.iterator, t = l && u[l], s = 0;
        if (t)
          return t.call(u);
        if (u && typeof u.length == "number")
          return { next: function() {
            return u && s >= u.length && (u = void 0), { value: u && u[s++], done: !u };
          } };
        throw new TypeError(l ? "Object is not iterable." : "Symbol.iterator is not defined.");
      }
      function Zu(u, l) {
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
      function Na() {
        for (var u = [], l = 0; l < arguments.length; l++)
          u = u.concat(Zu(arguments[l]));
        return u;
      }
      function ka() {
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
      function Pa(u, l, t) {
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
      function ja(u) {
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
      function Ia(u) {
        if (!Symbol.asyncIterator)
          throw new TypeError("Symbol.asyncIterator is not defined.");
        var l = u[Symbol.asyncIterator], t;
        return l ? l.call(u) : (u = typeof du == "function" ? du(u) : u[Symbol.iterator](), t = {}, s("next"), s("throw"), s("return"), t[Symbol.asyncIterator] = function() {
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
      function _a(u, l) {
        return Object.defineProperty ? Object.defineProperty(u, "raw", { value: l }) : u.raw = l, u;
      }
      function La(u) {
        if (u && u.__esModule)
          return u;
        var l = {};
        if (u != null)
          for (var t in u)
            Object.hasOwnProperty.call(u, t) && (l[t] = u[t]);
        return l.default = u, l;
      }
      function Oa(u) {
        return u && u.__esModule ? u : { default: u };
      }
      function $a(u, l) {
        if (!l.has(u))
          throw new TypeError("attempted to get private field on non-instance");
        return l.get(u);
      }
      function Ma(u, l, t) {
        if (!l.has(u))
          throw new TypeError("attempted to set private field on non-instance");
        return l.set(u, t), t;
      }
      var Jr, qr, ur = rt({ "node_modules/tslib/tslib.es6.js"() {
        H(), Jr = function(u, l) {
          return Jr = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t, s) {
            t.__proto__ = s;
          } || function(t, s) {
            for (var i in s)
              s.hasOwnProperty(i) && (t[i] = s[i]);
          }, Jr(u, l);
        }, qr = function() {
          return qr = Object.assign || function(u) {
            for (var l, t = 1, s = arguments.length; t < s; t++) {
              l = arguments[t];
              for (var i in l)
                Object.prototype.hasOwnProperty.call(l, i) && (u[i] = l[i]);
            }
            return u;
          }, qr.apply(this, arguments);
        };
      } }), ei = X({ "node_modules/vnopts/lib/descriptors/api.js"(u) {
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
      } }), Ra = X({ "node_modules/vnopts/lib/descriptors/index.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = (ur(), _t(Zn));
        l.__exportStar(ei(), u);
      } }), Gr = X({ "scripts/build/shims/chalk.cjs"(u, l) {
        H();
        var t = (s) => s;
        t.grey = t, t.red = t, t.bold = t, t.yellow = t, t.blue = t, t.default = t, l.exports = t;
      } }), ti = X({ "node_modules/vnopts/lib/handlers/deprecated/common.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = Gr();
        u.commonDeprecatedHandler = (t, s, i) => {
          let { descriptor: e } = i, n = [`${l.default.yellow(typeof t == "string" ? e.key(t) : e.pair(t))} is deprecated`];
          return s && n.push(`we now treat it as ${l.default.blue(typeof s == "string" ? e.key(s) : e.pair(s))}`), n.join("; ") + ".";
        };
      } }), Va = X({ "node_modules/vnopts/lib/handlers/deprecated/index.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = (ur(), _t(Zn));
        l.__exportStar(ti(), u);
      } }), Ja = X({ "node_modules/vnopts/lib/handlers/invalid/common.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = Gr();
        u.commonInvalidHandler = (t, s, i) => [`Invalid ${l.default.red(i.descriptor.key(t))} value.`, `Expected ${l.default.blue(i.schemas[t].expected(i))},`, `but received ${l.default.red(i.descriptor.value(s))}.`].join(" ");
      } }), ni = X({ "node_modules/vnopts/lib/handlers/invalid/index.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = (ur(), _t(Zn));
        l.__exportStar(Ja(), u);
      } }), qa = X({ "node_modules/vnopts/node_modules/leven/index.js"(u, l) {
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
      } }), ri = X({ "node_modules/vnopts/lib/handlers/unknown/leven.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = Gr(), t = qa();
        u.levenUnknownHandler = (s, i, e) => {
          let { descriptor: n, logger: r, schemas: o } = e, c = [`Ignored unknown option ${l.default.yellow(n.pair({ key: s, value: i }))}.`], h = Object.keys(o).sort().find((m) => t(s, m) < 3);
          h && c.push(`Did you mean ${l.default.blue(n.key(h))}?`), r.warn(c.join(" "));
        };
      } }), Ga = X({ "node_modules/vnopts/lib/handlers/unknown/index.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = (ur(), _t(Zn));
        l.__exportStar(ri(), u);
      } }), Wa = X({ "node_modules/vnopts/lib/handlers/index.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = (ur(), _t(Zn));
        l.__exportStar(Va(), u), l.__exportStar(ni(), u), l.__exportStar(Ga(), u);
      } }), ir = X({ "node_modules/vnopts/lib/schema.js"(u) {
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
      } }), Xa = X({ "node_modules/vnopts/lib/schemas/alias.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = ir(), t = class extends l.Schema {
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
      } }), Ua = X({ "node_modules/vnopts/lib/schemas/any.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = ir(), t = class extends l.Schema {
          expected() {
            return "anything";
          }
          validate() {
            return !0;
          }
        };
        u.AnySchema = t;
      } }), za = X({ "node_modules/vnopts/lib/schemas/array.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = (ur(), _t(Zn)), t = ir(), s = class extends t.Schema {
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
      } }), Ya = X({ "node_modules/vnopts/lib/schemas/boolean.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = ir(), t = class extends l.Schema {
          expected() {
            return "true or false";
          }
          validate(s) {
            return typeof s == "boolean";
          }
        };
        u.BooleanSchema = t;
      } }), fu = X({ "node_modules/vnopts/lib/utils.js"(u) {
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
      } }), Ka = X({ "node_modules/vnopts/lib/schemas/choice.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = ir(), t = fu(), s = class extends l.Schema {
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
      } }), ui = X({ "node_modules/vnopts/lib/schemas/number.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = ir(), t = class extends l.Schema {
          expected() {
            return "a number";
          }
          validate(s, i) {
            return typeof s == "number";
          }
        };
        u.NumberSchema = t;
      } }), Qa = X({ "node_modules/vnopts/lib/schemas/integer.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = fu(), t = ui(), s = class extends t.NumberSchema {
          expected() {
            return "an integer";
          }
          validate(i, e) {
            return e.normalizeValidateResult(super.validate(i, e), i) === !0 && l.isInt(i);
          }
        };
        u.IntegerSchema = s;
      } }), Ha = X({ "node_modules/vnopts/lib/schemas/string.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = ir(), t = class extends l.Schema {
          expected() {
            return "a string";
          }
          validate(s) {
            return typeof s == "string";
          }
        };
        u.StringSchema = t;
      } }), Za = X({ "node_modules/vnopts/lib/schemas/index.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = (ur(), _t(Zn));
        l.__exportStar(Xa(), u), l.__exportStar(Ua(), u), l.__exportStar(za(), u), l.__exportStar(Ya(), u), l.__exportStar(Ka(), u), l.__exportStar(Qa(), u), l.__exportStar(ui(), u), l.__exportStar(Ha(), u);
      } }), es = X({ "node_modules/vnopts/lib/defaults.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = ei(), t = ti(), s = ni(), i = ri();
        u.defaultDescriptor = l.apiDescriptor, u.defaultUnknownHandler = i.levenUnknownHandler, u.defaultInvalidHandler = s.commonInvalidHandler, u.defaultDeprecatedHandler = t.commonDeprecatedHandler;
      } }), ts = X({ "node_modules/vnopts/lib/normalize.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = es(), t = fu();
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
      } }), ns = X({ "node_modules/vnopts/lib/index.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = (ur(), _t(Zn));
        l.__exportStar(Ra(), u), l.__exportStar(Wa(), u), l.__exportStar(Za(), u), l.__exportStar(ts(), u), l.__exportStar(ir(), u);
      } }), rs = X({ "src/main/options-normalizer.js"(u, l) {
        H();
        var t = ns(), s = Fn(), i = { key: (y) => y.length === 1 ? `-${y}` : `--${y}`, value: (y) => t.apiDescriptor.value(y), pair: (y) => {
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
            let a = F.schemas, g = be(a, fe);
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
      } }), Bn = X({ "src/language-js/loc.js"(u, l) {
        H();
        var t = su();
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
      } }), us = X({ "src/main/load-parser.js"(u, l) {
        H(), l.exports = () => {
        };
      } }), is = X({ "scripts/build/shims/babel-highlight.cjs"(u, l) {
        H();
        var t = Gr(), s = { shouldHighlight: () => !1, getChalk: () => t };
        l.exports = s;
      } }), as = X({ "node_modules/@babel/code-frame/lib/index.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 }), u.codeFrameColumns = n, u.default = r;
        var l = is(), t = !1;
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
            if (un.emitWarning)
              un.emitWarning(y, "DeprecationWarning");
            else {
              let p = new Error(y);
              p.name = "DeprecationWarning", console.warn(new Error(y));
            }
          }
          return h = Math.max(h, 0), n(o, { start: { column: h, line: c } }, m);
        }
      } }), mu = X({ "src/main/parser.js"(u, l) {
        H();
        var { ConfigError: t } = xr(), s = Bn();
        us();
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
              let { codeFrameColumns: A } = as();
              throw w.codeFrame = A(m, P, { highlightCode: !0 }), w.message += `
` + w.codeFrame, w;
            }
            throw w;
          }
        }
        l.exports = { parse: h, resolveParser: c };
      } }), ii = X({ "src/main/options.js"(u, l) {
        H();
        var t = Ca(), { UndefinedParserError: s } = xr(), { getSupportInfo: i } = au(), e = rs(), { resolveParser: n } = mu(), r = { astFormat: "estree", printer: {}, originalText: void 0, locStart: null, locEnd: null };
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
      } }), ss = X({ "src/main/massage-ast.js"(u, l) {
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
      } }), fn = X({ "src/main/comments.js"(u, l) {
        H();
        var t = Br(), { builders: { line: s, hardline: i, breakParent: e, indent: n, lineSuffix: r, join: o, cursor: c } } = mt(), { hasNewline: h, skipNewline: m, skipSpaces: y, isPreviousLineEmpty: p, addLeadingComment: D, addDanglingComment: C, addTrailingComment: w } = kt(), P = /* @__PURE__ */ new WeakMap();
        function A(I, $, V) {
          if (!I)
            return;
          let { printer: M, locStart: U, locEnd: _ } = $;
          if (V) {
            if (M.canAttachComment && M.canAttachComment(I)) {
              let R;
              for (R = V.length - 1; R >= 0 && !(U(V[R]) <= U(I) && _(V[R]) <= _(I)); --R)
                ;
              V.splice(R + 1, 0, I);
              return;
            }
          } else if (P.has(I))
            return P.get(I);
          let ee = M.getCommentChildNodes && M.getCommentChildNodes(I, $) || typeof I == "object" && Object.entries(I).filter((R) => {
            let [O] = R;
            return O !== "enclosingNode" && O !== "precedingNode" && O !== "followingNode" && O !== "tokens" && O !== "comments" && O !== "parent";
          }).map((R) => {
            let [, O] = R;
            return O;
          });
          if (ee) {
            V || (V = [], P.set(I, V));
            for (let R of ee)
              A(R, $, V);
            return V;
          }
        }
        function N(I, $, V, M) {
          let { locStart: U, locEnd: _ } = V, ee = U($), R = _($), O = A(I, V), Z, oe, te = 0, Ee = O.length;
          for (; te < Ee; ) {
            let q = te + Ee >> 1, Y = O[q], ge = U(Y), ye = _(Y);
            if (ge <= ee && R <= ye)
              return N(Y, $, V, Y);
            if (ye <= ee) {
              Z = Y, te = q + 1;
              continue;
            }
            if (R <= ge) {
              oe = Y, Ee = q;
              continue;
            }
            throw new Error("Comment location overlaps with node location");
          }
          if (M && M.type === "TemplateLiteral") {
            let { quasis: q } = M, Y = F(q, $, V);
            Z && F(q, Z, V) !== Y && (Z = null), oe && F(q, oe, V) !== Y && (oe = null);
          }
          return { enclosingNode: M, precedingNode: Z, followingNode: oe };
        }
        var S = () => !1;
        function j(I, $, V, M) {
          if (!Array.isArray(I))
            return;
          let U = [], { locStart: _, locEnd: ee, printer: { handleComments: R = {} } } = M, { avoidAstMutation: O, ownLine: Z = S, endOfLine: oe = S, remaining: te = S } = R, Ee = I.map((q, Y) => Object.assign(Object.assign({}, N($, q, M)), {}, { comment: q, text: V, options: M, ast: $, isLastComment: I.length - 1 === Y }));
          for (let [q, Y] of Ee.entries()) {
            let { comment: ge, precedingNode: ye, enclosingNode: Le, followingNode: Q, text: W, options: ne, ast: ue, isLastComment: Fe } = Y;
            if (ne.parser === "json" || ne.parser === "json5" || ne.parser === "__js_expression" || ne.parser === "__vue_expression" || ne.parser === "__vue_ts_expression") {
              if (_(ge) - _(ue) <= 0) {
                D(ue, ge);
                continue;
              }
              if (ee(ge) - ee(ue) >= 0) {
                w(ue, ge);
                continue;
              }
            }
            let Se;
            if (O ? Se = [Y] : (ge.enclosingNode = Le, ge.precedingNode = ye, ge.followingNode = Q, Se = [ge, W, ne, ue, Fe]), J(W, ne, Ee, q))
              ge.placement = "ownLine", Z(...Se) || (Q ? D(Q, ge) : ye ? w(ye, ge) : C(Le || ue, ge));
            else if (f(W, ne, Ee, q))
              ge.placement = "endOfLine", oe(...Se) || (ye ? w(ye, ge) : Q ? D(Q, ge) : C(Le || ue, ge));
            else if (ge.placement = "remaining", !te(...Se))
              if (ye && Q) {
                let we = U.length;
                we > 0 && U[we - 1].followingNode !== Q && B(U, W, ne), U.push(Y);
              } else
                ye ? w(ye, ge) : Q ? D(Q, ge) : C(Le || ue, ge);
          }
          if (B(U, V, M), !O)
            for (let q of I)
              delete q.precedingNode, delete q.enclosingNode, delete q.followingNode;
        }
        var k = (I) => !/[\S\n\u2028\u2029]/.test(I);
        function J(I, $, V, M) {
          let { comment: U, precedingNode: _ } = V[M], { locStart: ee, locEnd: R } = $, O = ee(U);
          if (_)
            for (let Z = M - 1; Z >= 0; Z--) {
              let { comment: oe, precedingNode: te } = V[Z];
              if (te !== _ || !k(I.slice(R(oe), O)))
                break;
              O = ee(oe);
            }
          return h(I, O, { backwards: !0 });
        }
        function f(I, $, V, M) {
          let { comment: U, followingNode: _ } = V[M], { locStart: ee, locEnd: R } = $, O = R(U);
          if (_)
            for (let Z = M + 1; Z < V.length; Z++) {
              let { comment: oe, followingNode: te } = V[Z];
              if (te !== _ || !k(I.slice(O, ee(oe))))
                break;
              O = R(oe);
            }
          return h(I, O);
        }
        function B(I, $, V) {
          let M = I.length;
          if (M === 0)
            return;
          let { precedingNode: U, followingNode: _, enclosingNode: ee } = I[0], R = V.printer.getGapRegex && V.printer.getGapRegex(ee) || /^[\s(]*$/, O = V.locStart(_), Z;
          for (Z = M; Z > 0; --Z) {
            let { comment: oe, precedingNode: te, followingNode: Ee } = I[Z - 1];
            t.strictEqual(te, U), t.strictEqual(Ee, _);
            let q = $.slice(V.locEnd(oe), O);
            if (R.test(q))
              O = V.locStart(oe);
            else
              break;
          }
          for (let [oe, { comment: te }] of I.entries())
            oe < Z ? w(U, te) : D(_, te);
          for (let oe of [U, _])
            oe.comments && oe.comments.length > 1 && oe.comments.sort((te, Ee) => V.locStart(te) - V.locStart(Ee));
          I.length = 0;
        }
        function d(I, $) {
          let V = I.getValue();
          return V.printed = !0, $.printer.printComment(I, $);
        }
        function F(I, $, V) {
          let M = V.locStart($) - 1;
          for (let U = 1; U < I.length; ++U)
            if (M < V.locStart(I[U]))
              return U - 1;
          return 0;
        }
        function a(I, $) {
          let V = I.getValue(), M = [d(I, $)], { printer: U, originalText: _, locStart: ee, locEnd: R } = $;
          if (U.isBlockComment && U.isBlockComment(V)) {
            let Z = h(_, R(V)) ? h(_, ee(V), { backwards: !0 }) ? i : s : " ";
            M.push(Z);
          } else
            M.push(i);
          let O = m(_, y(_, R(V)));
          return O !== !1 && h(_, O) && M.push(i), M;
        }
        function g(I, $) {
          let V = I.getValue(), M = d(I, $), { printer: U, originalText: _, locStart: ee } = $, R = U.isBlockComment && U.isBlockComment(V);
          if (h(_, ee(V), { backwards: !0 })) {
            let Z = p(_, V, ee);
            return r([i, Z ? i : "", M]);
          }
          let O = [" ", M];
          return R || (O = [r(O), e]), O;
        }
        function E(I, $, V, M) {
          let U = [], _ = I.getValue();
          return !_ || !_.comments || (I.each(() => {
            let ee = I.getValue();
            !ee.leading && !ee.trailing && (!M || M(ee)) && U.push(d(I, $));
          }, "comments"), U.length === 0) ? "" : V ? o(i, U) : n([i, o(i, U)]);
        }
        function b(I, $, V) {
          let M = I.getValue();
          if (!M)
            return {};
          let U = M.comments || [];
          V && (U = U.filter((O) => !V.has(O)));
          let _ = M === $.cursorNode;
          if (U.length === 0) {
            let O = _ ? c : "";
            return { leading: O, trailing: O };
          }
          let ee = [], R = [];
          return I.each(() => {
            let O = I.getValue();
            if (V && V.has(O))
              return;
            let { leading: Z, trailing: oe } = O;
            Z ? ee.push(a(I, $)) : oe && R.push(g(I, $));
          }, "comments"), _ && (ee.unshift(c), R.push(c)), { leading: ee, trailing: R };
        }
        function x(I, $, V, M) {
          let { leading: U, trailing: _ } = b(I, V, M);
          return !U && !_ ? $ : [U, $, _];
        }
        function T(I) {
          if (I)
            for (let $ of I) {
              if (!$.printed)
                throw new Error('Comment "' + $.value.trim() + '" was not printed. Please report this error!');
              delete $.printed;
            }
        }
        l.exports = { attach: j, printComments: x, printCommentsSeparately: b, printDanglingComments: E, getSortedChildNodes: A, ensureAllCommentsPrinted: T };
      } }), os = X({ "src/common/ast-path.js"(u, l) {
        H();
        var t = Fn();
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
      } }), ls = X({ "src/main/multiparser.js"(u, l) {
        H();
        var { utils: { stripTrailingHardline: t } } = mt(), { normalize: s } = ii(), i = fn();
        function e(r, o, c, h) {
          if (c.printer.embed && c.embeddedLanguageFormatting === "auto")
            return c.printer.embed(r, o, (m, y, p) => n(m, y, c, h, p), c);
        }
        function n(r, o, c, h) {
          let { stripTrailingHardline: m = !1 } = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : {}, y = s(Object.assign(Object.assign(Object.assign({}, c), o), {}, { parentParser: c.parser, originalText: r }), { passThrough: !0 }), p = mu().parse(r, y), { ast: D } = p;
          r = p.text;
          let C = D.comments;
          delete D.comments, i.attach(C, D, r, y), y[Symbol.for("comments")] = C || [], y[Symbol.for("tokens")] = D.tokens || [];
          let w = h(D, y);
          return i.ensureAllCommentsPrinted(C), m ? typeof w == "string" ? w.replace(/(?:\r?\n)*$/, "") : t(w) : w;
        }
        l.exports = { printSubtree: e };
      } }), ps = X({ "src/main/ast-to-doc.js"(u, l) {
        H();
        var t = os(), { builders: { hardline: s, addAlignmentToDoc: i }, utils: { propagateBreaks: e } } = mt(), { printComments: n } = fn(), r = ls();
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
      } }), cs = X({ "src/main/range-util.js"(u, l) {
        H();
        var t = Br(), s = fn(), i = (D) => {
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
      } }), Ds = X({ "src/main/core.js"(u, l) {
        H();
        var { diffArrays: t } = fr(), { printer: { printDocToString: s }, debug: { printDocToDebug: i } } = mt(), { getAlignmentSize: e } = kt(), { guessEndOfLine: n, convertEndOfLineToChars: r, countEndOfLineChars: o, normalizeEndOfLine: c } = rr(), h = ii().normalize, m = ss(), y = fn(), p = mu(), D = ps(), C = cs(), w = "\uFEFF", P = Symbol("cursor");
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
            let I, $, V, M, U;
            if (F.cursorNode && T.cursorNodeText ? (I = F.locStart(F.cursorNode), $ = E.slice(I, F.locEnd(F.cursorNode)), V = F.cursorOffset - I, M = T.cursorNodeStart, U = T.cursorNodeText) : (I = 0, $ = E, V = F.cursorOffset, M = 0, U = T.formatted), $ === U)
              return { formatted: T.formatted, cursorOffset: M + V, comments: b };
            let _ = [...$];
            _.splice(V, 0, P);
            let ee = [...U], R = t(_, ee), O = M;
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
`, E) + 1), I = g.slice(T, E).match(/^\s*/)[0], $ = e(I, F.tabWidth), V = N(x, Object.assign(Object.assign({}, F), {}, { rangeStart: 0, rangeEnd: Number.POSITIVE_INFINITY, cursorOffset: F.cursorOffset > E && F.cursorOffset <= b ? F.cursorOffset - E : -1, endOfLine: "lf" }), $), M = V.formatted.trimEnd(), { cursorOffset: U } = F;
          U > b ? U += M.length - x.length : V.cursorOffset >= 0 && (U = V.cursorOffset + E);
          let _ = g.slice(0, E) + M + g.slice(b);
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
      } }), ds = X({ "src/common/util-shared.js"(u, l) {
        H();
        var { getMaxContinuousCount: t, getStringWidth: s, getAlignmentSize: i, getIndentSize: e, skip: n, skipWhitespace: r, skipSpaces: o, skipNewline: c, skipToLineEnd: h, skipEverythingButNewLine: m, skipInlineComment: y, skipTrailingComment: p, hasNewline: D, hasNewlineInRange: C, hasSpaces: w, isNextLineEmpty: P, isNextLineEmptyAfterIndex: A, isPreviousLineEmpty: N, getNextNonSpaceNonCommentCharacterIndex: S, makeString: j, addLeadingComment: k, addDanglingComment: J, addTrailingComment: f } = kt();
        l.exports = { getMaxContinuousCount: t, getStringWidth: s, getAlignmentSize: i, getIndentSize: e, skip: n, skipWhitespace: r, skipSpaces: o, skipNewline: c, skipToLineEnd: h, skipEverythingButNewLine: m, skipInlineComment: y, skipTrailingComment: p, hasNewline: D, hasNewlineInRange: C, hasSpaces: w, isNextLineEmpty: P, isNextLineEmptyAfterIndex: A, isPreviousLineEmpty: N, getNextNonSpaceNonCommentCharacterIndex: S, makeString: j, addLeadingComment: k, addDanglingComment: J, addTrailingComment: f };
      } }), pr = X({ "src/utils/create-language.js"(u, l) {
        H(), l.exports = function(t, s) {
          let { languageId: i } = t, e = be(t, pe);
          return Object.assign(Object.assign({ linguistLanguageId: i }, e), s(t));
        };
      } }), fs = X({ "node_modules/esutils/lib/ast.js"(u, l) {
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
      } }), ai = X({ "node_modules/esutils/lib/code.js"(u, l) {
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
      } }), ms = X({ "node_modules/esutils/lib/keyword.js"(u, l) {
        H(), function() {
          var t = ai();
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
      } }), gs = X({ "node_modules/esutils/lib/utils.js"(u) {
        H(), function() {
          u.ast = fs(), u.code = ai(), u.keyword = ms();
        }();
      } }), cr = X({ "src/language-js/utils/is-block-comment.js"(u, l) {
        H();
        var t = /* @__PURE__ */ new Set(["Block", "CommentBlock", "MultiLine"]), s = (i) => t.has(i == null ? void 0 : i.type);
        l.exports = s;
      } }), ys = X({ "src/language-js/utils/is-node-matches.js"(u, l) {
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
      } }), Yt = X({ "src/language-js/utils/index.js"(u, l) {
        H();
        var t = gs().keyword.isIdentifierNameES5, { getLast: s, hasNewline: i, skipWhitespace: e, isNonEmptyArray: n, isNextLineEmptyAfterIndex: r, getStringWidth: o } = kt(), { locStart: c, locEnd: h, hasSameLocStart: m } = Bn(), y = cr(), p = ys(), D = "(?:(?=.)\\s)", C = new RegExp(`^${D}*:`), w = new RegExp(`^${D}*::`);
        function P(L) {
          var Ae, ut;
          return ((Ae = L.extra) === null || Ae === void 0 ? void 0 : Ae.parenthesized) && y((ut = L.trailingComments) === null || ut === void 0 ? void 0 : ut[0]) && C.test(L.trailingComments[0].value);
        }
        function A(L) {
          let Ae = L == null ? void 0 : L[0];
          return y(Ae) && w.test(Ae.value);
        }
        function N(L, Ae) {
          if (!L || typeof L != "object")
            return !1;
          if (Array.isArray(L))
            return L.some((Pt) => N(Pt, Ae));
          let ut = Ae(L);
          return typeof ut == "boolean" ? ut : Object.values(L).some((Pt) => N(Pt, Ae));
        }
        function S(L) {
          return L.type === "AssignmentExpression" || L.type === "BinaryExpression" || L.type === "LogicalExpression" || L.type === "NGPipeExpression" || L.type === "ConditionalExpression" || ge(L) || ye(L) || L.type === "SequenceExpression" || L.type === "TaggedTemplateExpression" || L.type === "BindExpression" || L.type === "UpdateExpression" && !L.prefix || On(L) || L.type === "TSNonNullExpression";
        }
        function j(L) {
          var Ae, ut, Pt, jt, jn, nn;
          return L.expressions ? L.expressions[0] : (Ae = (ut = (Pt = (jt = (jn = (nn = L.left) !== null && nn !== void 0 ? nn : L.test) !== null && jn !== void 0 ? jn : L.callee) !== null && jt !== void 0 ? jt : L.object) !== null && Pt !== void 0 ? Pt : L.tag) !== null && ut !== void 0 ? ut : L.argument) !== null && Ae !== void 0 ? Ae : L.expression;
        }
        function k(L, Ae) {
          if (Ae.expressions)
            return ["expressions", 0];
          if (Ae.left)
            return ["left"];
          if (Ae.test)
            return ["test"];
          if (Ae.object)
            return ["object"];
          if (Ae.callee)
            return ["callee"];
          if (Ae.tag)
            return ["tag"];
          if (Ae.argument)
            return ["argument"];
          if (Ae.expression)
            return ["expression"];
          throw new Error("Unexpected node has no left side.");
        }
        function J(L) {
          return L = new Set(L), (Ae) => L.has(Ae == null ? void 0 : Ae.type);
        }
        var f = J(["Line", "CommentLine", "SingleLine", "HashbangComment", "HTMLOpen", "HTMLClose"]), B = J(["ExportDefaultDeclaration", "ExportDefaultSpecifier", "DeclareExportDeclaration", "ExportNamedDeclaration", "ExportAllDeclaration"]);
        function d(L) {
          let Ae = L.getParentNode();
          return L.getName() === "declaration" && B(Ae) ? Ae : null;
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
          return ge(L) && L.callee.type === "Identifier" && ["async", "inject", "fakeAsync", "waitForAsync"].includes(L.callee.name);
        }
        var $ = J(["JSXElement", "JSXFragment"]);
        function V(L, Ae) {
          if (L.parentParser !== "markdown" && L.parentParser !== "mdx")
            return !1;
          let ut = Ae.getNode();
          if (!ut.expression || !$(ut.expression))
            return !1;
          let Pt = Ae.getParentNode();
          return Pt.type === "Program" && Pt.body.length === 1;
        }
        function M(L) {
          return L.kind === "get" || L.kind === "set";
        }
        function U(L) {
          return M(L) || m(L, L.value);
        }
        function _(L) {
          return (L.type === "ObjectTypeProperty" || L.type === "ObjectTypeInternalSlot") && L.value.type === "FunctionTypeAnnotation" && !L.static && !U(L);
        }
        function ee(L) {
          return (L.type === "TypeAnnotation" || L.type === "TSTypeAnnotation") && L.typeAnnotation.type === "FunctionTypeAnnotation" && !L.static && !m(L, L.typeAnnotation);
        }
        var R = J(["BinaryExpression", "LogicalExpression", "NGPipeExpression"]);
        function O(L) {
          return ye(L) || L.type === "BindExpression" && Boolean(L.object);
        }
        var Z = /* @__PURE__ */ new Set(["AnyTypeAnnotation", "TSAnyKeyword", "NullLiteralTypeAnnotation", "TSNullKeyword", "ThisTypeAnnotation", "TSThisType", "NumberTypeAnnotation", "TSNumberKeyword", "VoidTypeAnnotation", "TSVoidKeyword", "BooleanTypeAnnotation", "TSBooleanKeyword", "BigIntTypeAnnotation", "TSBigIntKeyword", "SymbolTypeAnnotation", "TSSymbolKeyword", "StringTypeAnnotation", "TSStringKeyword", "BooleanLiteralTypeAnnotation", "StringLiteralTypeAnnotation", "BigIntLiteralTypeAnnotation", "NumberLiteralTypeAnnotation", "TSLiteralType", "TSTemplateLiteralType", "EmptyTypeAnnotation", "MixedTypeAnnotation", "TSNeverKeyword", "TSObjectKeyword", "TSUndefinedKeyword", "TSUnknownKeyword"]);
        function oe(L) {
          return L ? !!((L.type === "GenericTypeAnnotation" || L.type === "TSTypeReference") && !L.typeParameters || Z.has(L.type)) : !1;
        }
        function te(L) {
          let Ae = /^(?:before|after)(?:Each|All)$/;
          return L.callee.type === "Identifier" && Ae.test(L.callee.name) && L.arguments.length === 1;
        }
        var Ee = ["it", "it.only", "it.skip", "describe", "describe.only", "describe.skip", "test", "test.only", "test.skip", "test.step", "test.describe", "test.describe.only", "test.describe.parallel", "test.describe.parallel.only", "test.describe.serial", "test.describe.serial.only", "skip", "xit", "xdescribe", "xtest", "fit", "fdescribe", "ftest"];
        function q(L) {
          return p(L, Ee);
        }
        function Y(L, Ae) {
          if (L.type !== "CallExpression")
            return !1;
          if (L.arguments.length === 1) {
            if (I(L) && Ae && Y(Ae))
              return x(L.arguments[0]);
            if (te(L))
              return I(L.arguments[0]);
          } else if ((L.arguments.length === 2 || L.arguments.length === 3) && (L.arguments[0].type === "TemplateLiteral" || E(L.arguments[0])) && q(L.callee))
            return L.arguments[2] && !a(L.arguments[2]) ? !1 : (L.arguments.length === 2 ? x(L.arguments[1]) : T(L.arguments[1]) && Ne(L.arguments[1]).length <= 1) || I(L.arguments[1]);
          return !1;
        }
        var ge = J(["CallExpression", "OptionalCallExpression"]), ye = J(["MemberExpression", "OptionalMemberExpression"]);
        function Le(L) {
          let Ae = "expressions";
          L.type === "TSTemplateLiteralType" && (Ae = "types");
          let ut = L[Ae];
          return ut.length === 0 ? !1 : ut.every((Pt) => {
            if (ct(Pt))
              return !1;
            if (Pt.type === "Identifier" || Pt.type === "ThisExpression")
              return !0;
            if (ye(Pt)) {
              let jt = Pt;
              for (; ye(jt); )
                if (jt.property.type !== "Identifier" && jt.property.type !== "Literal" && jt.property.type !== "StringLiteral" && jt.property.type !== "NumericLiteral" || (jt = jt.object, ct(jt)))
                  return !1;
              return jt.type === "Identifier" || jt.type === "ThisExpression";
            }
            return !1;
          });
        }
        function Q(L, Ae) {
          return L === "+" || L === "-" ? L + Ae : Ae;
        }
        function W(L, Ae) {
          let ut = c(Ae), Pt = e(L, h(Ae));
          return Pt !== !1 && L.slice(ut, ut + 2) === "/*" && L.slice(Pt, Pt + 2) === "*/";
        }
        function ne(L, Ae) {
          return $(Ae) ? Ct(Ae) : ct(Ae, Ue.Leading, (ut) => i(L, h(ut)));
        }
        function ue(L, Ae) {
          return Ae.parser !== "json" && E(L.key) && De(L.key).slice(1, -1) === L.key.value && (t(L.key.value) && !(Ae.parser === "babel-ts" && L.type === "ClassProperty" || Ae.parser === "typescript" && L.type === "PropertyDefinition") || Fe(L.key.value) && String(Number(L.key.value)) === L.key.value && (Ae.parser === "babel" || Ae.parser === "acorn" || Ae.parser === "espree" || Ae.parser === "meriyah" || Ae.parser === "__babel_estree"));
        }
        function Fe(L) {
          return /^(?:\d+|\d+\.\d+)$/.test(L);
        }
        function Se(L, Ae) {
          let ut = /^[fx]?(?:describe|it|test)$/;
          return Ae.type === "TaggedTemplateExpression" && Ae.quasi === L && Ae.tag.type === "MemberExpression" && Ae.tag.property.type === "Identifier" && Ae.tag.property.name === "each" && (Ae.tag.object.type === "Identifier" && ut.test(Ae.tag.object.name) || Ae.tag.object.type === "MemberExpression" && Ae.tag.object.property.type === "Identifier" && (Ae.tag.object.property.name === "only" || Ae.tag.object.property.name === "skip") && Ae.tag.object.object.type === "Identifier" && ut.test(Ae.tag.object.object.name));
        }
        function we(L) {
          return L.quasis.some((Ae) => Ae.value.raw.includes(`
`));
        }
        function He(L, Ae) {
          return (L.type === "TemplateLiteral" && we(L) || L.type === "TaggedTemplateExpression" && we(L.quasi)) && !i(Ae, c(L), { backwards: !0 });
        }
        function Ft(L) {
          if (!ct(L))
            return !1;
          let Ae = s(de(L, Ue.Dangling));
          return Ae && !y(Ae);
        }
        function ht(L) {
          if (L.length <= 1)
            return !1;
          let Ae = 0;
          for (let ut of L)
            if (x(ut)) {
              if (Ae += 1, Ae > 1)
                return !0;
            } else if (ge(ut)) {
              for (let Pt of ut.arguments)
                if (x(Pt))
                  return !0;
            }
          return !1;
        }
        function Qe(L) {
          let Ae = L.getValue(), ut = L.getParentNode();
          return ge(Ae) && ge(ut) && ut.callee === Ae && Ae.arguments.length > ut.arguments.length && ut.arguments.length > 0;
        }
        function it(L, Ae) {
          if (Ae >= 2)
            return !1;
          let ut = (nn) => it(nn, Ae + 1), Pt = L.type === "Literal" && "regex" in L && L.regex.pattern || L.type === "RegExpLiteral" && L.pattern;
          if (Pt && o(Pt) > 5)
            return !1;
          if (L.type === "Literal" || L.type === "BigIntLiteral" || L.type === "DecimalLiteral" || L.type === "BooleanLiteral" || L.type === "NullLiteral" || L.type === "NumericLiteral" || L.type === "RegExpLiteral" || L.type === "StringLiteral" || L.type === "Identifier" || L.type === "ThisExpression" || L.type === "Super" || L.type === "PrivateName" || L.type === "PrivateIdentifier" || L.type === "ArgumentPlaceholder" || L.type === "Import")
            return !0;
          if (L.type === "TemplateLiteral")
            return L.quasis.every((nn) => !nn.value.raw.includes(`
`)) && L.expressions.every(ut);
          if (L.type === "ObjectExpression")
            return L.properties.every((nn) => !nn.computed && (nn.shorthand || nn.value && ut(nn.value)));
          if (L.type === "ArrayExpression")
            return L.elements.every((nn) => nn === null || ut(nn));
          if (An(L))
            return (L.type === "ImportExpression" || it(L.callee, Ae)) && Qt(L).every(ut);
          if (ye(L))
            return it(L.object, Ae) && it(L.property, Ae);
          let jt = { "!": !0, "-": !0, "+": !0, "~": !0 };
          if (L.type === "UnaryExpression" && jt[L.operator])
            return it(L.argument, Ae);
          let jn = { "++": !0, "--": !0 };
          return L.type === "UpdateExpression" && jn[L.operator] ? it(L.argument, Ae) : L.type === "TSNonNullExpression" ? it(L.expression, Ae) : !1;
        }
        function De(L) {
          var Ae, ut;
          return (Ae = (ut = L.extra) === null || ut === void 0 ? void 0 : ut.raw) !== null && Ae !== void 0 ? Ae : L.raw;
        }
        function G(L) {
          return L;
        }
        function he(L) {
          return L.filepath && /\.tsx$/i.test(L.filepath);
        }
        function K(L) {
          let Ae = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "es5";
          return L.trailingComma === "es5" && Ae === "es5" || L.trailingComma === "all" && (Ae === "all" || Ae === "es5");
        }
        function me(L, Ae) {
          switch (L.type) {
            case "BinaryExpression":
            case "LogicalExpression":
            case "AssignmentExpression":
            case "NGPipeExpression":
              return me(L.left, Ae);
            case "MemberExpression":
            case "OptionalMemberExpression":
              return me(L.object, Ae);
            case "TaggedTemplateExpression":
              return L.tag.type === "FunctionExpression" ? !1 : me(L.tag, Ae);
            case "CallExpression":
            case "OptionalCallExpression":
              return L.callee.type === "FunctionExpression" ? !1 : me(L.callee, Ae);
            case "ConditionalExpression":
              return me(L.test, Ae);
            case "UpdateExpression":
              return !L.prefix && me(L.argument, Ae);
            case "BindExpression":
              return L.object && me(L.object, Ae);
            case "SequenceExpression":
              return me(L.expressions[0], Ae);
            case "TSSatisfiesExpression":
            case "TSAsExpression":
            case "TSNonNullExpression":
              return me(L.expression, Ae);
            default:
              return Ae(L);
          }
        }
        var Je = { "==": !0, "!=": !0, "===": !0, "!==": !0 }, _e = { "*": !0, "/": !0, "%": !0 }, Ce = { ">>": !0, ">>>": !0, "<<": !0 };
        function v(L, Ae) {
          return !(le(Ae) !== le(L) || L === "**" || Je[L] && Je[Ae] || Ae === "%" && _e[L] || L === "%" && _e[Ae] || Ae !== L && _e[Ae] && _e[L] || Ce[L] && Ce[Ae]);
        }
        var z = new Map([["|>"], ["??"], ["||"], ["&&"], ["|"], ["^"], ["&"], ["==", "===", "!=", "!=="], ["<", ">", "<=", ">=", "in", "instanceof"], [">>", "<<", ">>>"], ["+", "-"], ["*", "/", "%"], ["**"]].flatMap((L, Ae) => L.map((ut) => [ut, Ae])));
        function le(L) {
          return z.get(L);
        }
        function Be(L) {
          return Boolean(Ce[L]) || L === "|" || L === "^" || L === "&";
        }
        function je(L) {
          var Ae;
          if (L.rest)
            return !0;
          let ut = Ne(L);
          return ((Ae = s(ut)) === null || Ae === void 0 ? void 0 : Ae.type) === "RestElement";
        }
        var Ke = /* @__PURE__ */ new WeakMap();
        function Ne(L) {
          if (Ke.has(L))
            return Ke.get(L);
          let Ae = [];
          return L.this && Ae.push(L.this), Array.isArray(L.parameters) ? Ae.push(...L.parameters) : Array.isArray(L.params) && Ae.push(...L.params), L.rest && Ae.push(L.rest), Ke.set(L, Ae), Ae;
        }
        function en(L, Ae) {
          let ut = L.getValue(), Pt = 0, jt = (jn) => Ae(jn, Pt++);
          ut.this && L.call(jt, "this"), Array.isArray(ut.parameters) ? L.each(jt, "parameters") : Array.isArray(ut.params) && L.each(jt, "params"), ut.rest && L.call(jt, "rest");
        }
        var Xe = /* @__PURE__ */ new WeakMap();
        function Qt(L) {
          if (Xe.has(L))
            return Xe.get(L);
          let Ae = L.arguments;
          return L.type === "ImportExpression" && (Ae = [L.source], L.attributes && Ae.push(L.attributes)), Xe.set(L, Ae), Ae;
        }
        function We(L, Ae) {
          let ut = L.getValue();
          ut.type === "ImportExpression" ? (L.call((Pt) => Ae(Pt, 0), "source"), ut.attributes && L.call((Pt) => Ae(Pt, 1), "attributes")) : L.each(Ae, "arguments");
        }
        function lt(L) {
          return L.value.trim() === "prettier-ignore" && !L.unignore;
        }
        function Ct(L) {
          return L && (L.prettierIgnore || ct(L, Ue.PrettierIgnore));
        }
        function Wt(L) {
          let Ae = L.getValue();
          return Ct(Ae);
        }
        var Ue = { Leading: 1 << 1, Trailing: 1 << 2, Dangling: 1 << 3, Block: 1 << 4, Line: 1 << 5, PrettierIgnore: 1 << 6, First: 1 << 7, Last: 1 << 8 }, gt = (L, Ae) => {
          if (typeof L == "function" && (Ae = L, L = 0), L || Ae)
            return (ut, Pt, jt) => !(L & Ue.Leading && !ut.leading || L & Ue.Trailing && !ut.trailing || L & Ue.Dangling && (ut.leading || ut.trailing) || L & Ue.Block && !y(ut) || L & Ue.Line && !f(ut) || L & Ue.First && Pt !== 0 || L & Ue.Last && Pt !== jt.length - 1 || L & Ue.PrettierIgnore && !lt(ut) || Ae && !Ae(ut));
        };
        function ct(L, Ae, ut) {
          if (!n(L == null ? void 0 : L.comments))
            return !1;
          let Pt = gt(Ae, ut);
          return Pt ? L.comments.some(Pt) : !0;
        }
        function de(L, Ae, ut) {
          if (!Array.isArray(L == null ? void 0 : L.comments))
            return [];
          let Pt = gt(Ae, ut);
          return Pt ? L.comments.filter(Pt) : L.comments;
        }
        var Ln = (L, Ae) => {
          let { originalText: ut } = Ae;
          return r(ut, h(L));
        };
        function An(L) {
          return ge(L) || L.type === "NewExpression" || L.type === "ImportExpression";
        }
        function Bt(L) {
          return L && (L.type === "ObjectProperty" || L.type === "Property" && !L.method && L.kind === "init");
        }
        function Tt(L) {
          return Boolean(L.__isUsingHackPipeline);
        }
        var Ut = Symbol("ifWithoutBlockAndSameLineComment");
        function On(L) {
          return L.type === "TSAsExpression" || L.type === "TSSatisfiesExpression";
        }
        l.exports = { getFunctionParameters: Ne, iterateFunctionParametersPath: en, getCallArguments: Qt, iterateCallArgumentsPath: We, hasRestParameter: je, getLeftSide: j, getLeftSidePathName: k, getParentExportDeclaration: d, getTypeScriptMappedTypeModifier: Q, hasFlowAnnotationComment: A, hasFlowShorthandAnnotationComment: P, hasLeadingOwnLineComment: ne, hasNakedLeftSide: S, hasNode: N, hasIgnoreComment: Wt, hasNodeIgnoreComment: Ct, identity: G, isBinaryish: R, isCallLikeExpression: An, isEnabledHackPipeline: Tt, isLineComment: f, isPrettierIgnoreComment: lt, isCallExpression: ge, isMemberExpression: ye, isExportDeclaration: B, isFlowAnnotationComment: W, isFunctionCompositionArgs: ht, isFunctionNotation: U, isFunctionOrArrowExpression: x, isGetterOrSetter: M, isJestEachTemplateLiteral: Se, isJsxNode: $, isLiteral: F, isLongCurriedCallExpression: Qe, isSimpleCallArgument: it, isMemberish: O, isNumericLiteral: a, isSignedNumericLiteral: g, isObjectProperty: Bt, isObjectType: b, isObjectTypePropertyAFunction: _, isSimpleType: oe, isSimpleNumber: Fe, isSimpleTemplateLiteral: Le, isStringLiteral: E, isStringPropSafeToUnquote: ue, isTemplateOnItsOwnLine: He, isTestCall: Y, isTheOnlyJsxElementInMarkdown: V, isTSXFile: he, isTypeAnnotationAFunction: ee, isNextLineEmpty: Ln, needsHardlineAfterDanglingComment: Ft, rawText: De, shouldPrintComma: K, isBitwiseOperator: Be, shouldFlatten: v, startsWithNoLookaheadToken: me, getPrecedence: le, hasComment: ct, getComments: de, CommentCheckFlags: Ue, markerForIfWithoutBlockAndSameLineComment: Ut, isTSTypeExpression: On };
      } }), mr = X({ "src/language-js/print/template-literal.js"(u, l) {
        H();
        var t = Fn(), { getStringWidth: s, getIndentSize: i } = kt(), { builders: { join: e, hardline: n, softline: r, group: o, indent: c, align: h, lineSuffixBoundary: m, addAlignmentToDoc: y }, printer: { printDocToString: p }, utils: { mapDoc: D } } = mt(), { isBinaryish: C, isJestEachTemplateLiteral: w, isSimpleTemplateLiteral: P, hasComment: A, isMemberExpression: N, isTSTypeExpression: S } = Yt();
        function j(F, a, g) {
          let E = F.getValue();
          if (E.type === "TemplateLiteral" && w(E, F.getParentNode())) {
            let $ = k(F, g, a);
            if ($)
              return $;
          }
          let b = "expressions";
          E.type === "TSTemplateLiteralType" && (b = "types");
          let x = [], T = F.map(a, b), I = P(E);
          return I && (T = T.map(($) => p($, Object.assign(Object.assign({}, g), {}, { printWidth: Number.POSITIVE_INFINITY })).formatted)), x.push(m, "`"), F.each(($) => {
            let V = $.getName();
            if (x.push(a()), V < T.length) {
              let { tabWidth: M } = g, U = $.getValue(), _ = i(U.value.raw, M), ee = T[V];
              if (!I) {
                let O = E[b][V];
                (A(O) || N(O) || O.type === "ConditionalExpression" || O.type === "SequenceExpression" || S(O) || C(O)) && (ee = [c([r, ee]), r]);
              }
              let R = _ === 0 && U.value.raw.endsWith(`
`) ? h(Number.NEGATIVE_INFINITY, ee) : y(ee, _, M);
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
            let T = [], I = x.map((_) => "${" + p(_, Object.assign(Object.assign({}, a), {}, { printWidth: Number.POSITIVE_INFINITY, endOfLine: "lf" })).formatted + "}"), $ = [{ hasLineBreak: !1, cells: [] }];
            for (let _ = 1; _ < E.quasis.length; _++) {
              let ee = t($), R = I[_ - 1];
              ee.cells.push(R), R.includes(`
`) && (ee.hasLineBreak = !0), E.quasis[_].value.raw.includes(`
`) && $.push({ hasLineBreak: !1, cells: [] });
            }
            let V = Math.max(b.length, ...$.map((_) => _.cells.length)), M = Array.from({ length: V }).fill(0), U = [{ cells: b }, ...$.filter((_) => _.cells.length > 0)];
            for (let { cells: _ } of U.filter((ee) => !ee.hasLineBreak))
              for (let [ee, R] of _.entries())
                M[ee] = Math.max(M[ee], s(R));
            return T.push(m, "`", c([n, e(n, U.map((_) => e(" | ", _.cells.map((ee, R) => _.hasLineBreak ? ee : ee + " ".repeat(M[R] - s(ee))))))]), n, "`"), T;
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
      } }), hs = X({ "src/language-js/embed/markdown.js"(u, l) {
        H();
        var { builders: { indent: t, softline: s, literalline: i, dedentToRoot: e } } = mt(), { escapeTemplateCharacters: n } = mr();
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
      } }), Es = X({ "src/language-js/embed/css.js"(u, l) {
        H();
        var { isNonEmptyArray: t } = kt(), { builders: { indent: s, hardline: i, softline: e }, utils: { mapDoc: n, replaceEndOfLine: r, cleanDoc: o } } = mt(), { printTemplateExpressions: c } = mr();
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
      } }), Cs = X({ "src/language-js/embed/graphql.js"(u, l) {
        H();
        var { builders: { indent: t, join: s, hardline: i } } = mt(), { escapeTemplateCharacters: e, printTemplateExpressions: n } = mr();
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
      } }), Fs = X({ "src/language-js/embed/html.js"(u, l) {
        H();
        var { builders: { indent: t, line: s, hardline: i, group: e }, utils: { mapDoc: n } } = mt(), { printTemplateExpressions: r, uncookTemplateElementValue: o } = mr(), c = 0;
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
      } }), As = X({ "src/language-js/embed.js"(u, l) {
        H();
        var { hasComment: t, CommentCheckFlags: s, isObjectProperty: i } = Yt(), e = hs(), n = Es(), r = Cs(), o = Fs();
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
      } }), vs = X({ "src/language-js/clean.js"(u, l) {
        H();
        var t = cr(), s = /* @__PURE__ */ new Set(["range", "raw", "comments", "leadingComments", "trailingComments", "innerComments", "extra", "start", "end", "loc", "flags", "errors", "tokens"]), i = (n) => {
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
      } }), si = {};
      ft(si, { EOL: () => hu, arch: () => bs, cpus: () => fi, default: () => Ei, endianness: () => oi, freemem: () => Di, getNetworkInterfaces: () => hi, hostname: () => li, loadavg: () => pi, networkInterfaces: () => yi, platform: () => xs, release: () => gi, tmpDir: () => gu, tmpdir: () => yu, totalmem: () => di, type: () => mi, uptime: () => ci });
      function oi() {
        if (typeof Wr > "u") {
          var u = new ArrayBuffer(2), l = new Uint8Array(u), t = new Uint16Array(u);
          if (l[0] = 1, l[1] = 2, t[0] === 258)
            Wr = "BE";
          else if (t[0] === 513)
            Wr = "LE";
          else
            throw new Error("unable to figure out endianess");
        }
        return Wr;
      }
      function li() {
        return typeof globalThis.location < "u" ? globalThis.location.hostname : "";
      }
      function pi() {
        return [];
      }
      function ci() {
        return 0;
      }
      function Di() {
        return Number.MAX_VALUE;
      }
      function di() {
        return Number.MAX_VALUE;
      }
      function fi() {
        return [];
      }
      function mi() {
        return "Browser";
      }
      function gi() {
        return typeof globalThis.navigator < "u" ? globalThis.navigator.appVersion : "";
      }
      function yi() {
      }
      function hi() {
      }
      function bs() {
        return "javascript";
      }
      function xs() {
        return "browser";
      }
      function gu() {
        return "/tmp";
      }
      var Wr, yu, hu, Ei, Ss = rt({ "node-modules-polyfills:os"() {
        H(), yu = gu, hu = `
`, Ei = { EOL: hu, tmpdir: yu, tmpDir: gu, networkInterfaces: yi, getNetworkInterfaces: hi, release: gi, type: mi, cpus: fi, totalmem: di, freemem: Di, uptime: ci, loadavg: pi, hostname: li, endianness: oi };
      } }), Bs = X({ "node-modules-polyfills-commonjs:os"(u, l) {
        H();
        var t = (Ss(), _t(si));
        if (t && t.default) {
          l.exports = t.default;
          for (let s in t)
            l.exports[s] = t[s];
        } else
          t && (l.exports = t);
      } }), Ts = X({ "node_modules/detect-newline/index.js"(u, l) {
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
      } }), ws = X({ "node_modules/jest-docblock/build/index.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 }), u.extract = p, u.parse = C, u.parseWithComments = w, u.print = P, u.strip = D;
        function l() {
          let N = Bs();
          return l = function() {
            return N;
          }, N;
        }
        function t() {
          let N = s(Ts());
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
      } }), Ns = X({ "src/language-js/utils/get-shebang.js"(u, l) {
        H();
        function t(s) {
          if (!s.startsWith("#!"))
            return "";
          let i = s.indexOf(`
`);
          return i === -1 ? s : s.slice(0, i);
        }
        l.exports = t;
      } }), Ci = X({ "src/language-js/pragma.js"(u, l) {
        H();
        var { parseWithComments: t, strip: s, extract: i, print: e } = ws(), { normalizeEndOfLine: n } = rr(), r = Ns();
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
      } }), ks = X({ "src/language-js/utils/is-type-cast-comment.js"(u, l) {
        H();
        var t = cr();
        function s(i) {
          return t(i) && i.value[0] === "*" && /@(?:type|satisfies)\b/.test(i.value);
        }
        l.exports = s;
      } }), Fi = X({ "src/language-js/comments.js"(u, l) {
        H();
        var { getLast: t, hasNewline: s, getNextNonSpaceNonCommentCharacterIndexWithStartIndex: i, getNextNonSpaceNonCommentCharacter: e, hasNewlineInRange: n, addLeadingComment: r, addTrailingComment: o, addDanglingComment: c, getNextNonSpaceNonCommentCharacterIndex: h, isNonEmptyArray: m } = kt(), { getFunctionParameters: y, isPrettierIgnoreComment: p, isJsxNode: D, hasFlowShorthandAnnotationComment: C, hasFlowAnnotationComment: w, hasIgnoreComment: P, isCallLikeExpression: A, getCallArguments: N, isCallExpression: S, isMemberExpression: j, isObjectProperty: k, isLineComment: J, getComments: f, CommentCheckFlags: B, markerForIfWithoutBlockAndSameLineComment: d } = Yt(), { locStart: F, locEnd: a } = Bn(), g = cr(), E = ks();
        function b(Ce) {
          return [G, Le, ee, M, U, _, oe, we, ue, Se, He, Ft, Ee, Q, W].some((v) => v(Ce));
        }
        function x(Ce) {
          return [V, Le, R, He, M, U, _, oe, Q, ne, Fe, Se, it, W, K].some((v) => v(Ce));
        }
        function T(Ce) {
          return [G, M, U, O, ye, Ee, Se, ge, Y, he, W, De].some((v) => v(Ce));
        }
        function I(Ce, v) {
          let z = (Ce.body || Ce.properties).find((le) => {
            let { type: Be } = le;
            return Be !== "EmptyStatement";
          });
          z ? r(z, v) : c(Ce, v);
        }
        function $(Ce, v) {
          Ce.type === "BlockStatement" ? I(Ce, v) : r(Ce, v);
        }
        function V(Ce) {
          let { comment: v, followingNode: z } = Ce;
          return z && E(v) ? (r(z, v), !0) : !1;
        }
        function M(Ce) {
          let { comment: v, precedingNode: z, enclosingNode: le, followingNode: Be, text: je } = Ce;
          if ((le == null ? void 0 : le.type) !== "IfStatement" || !Be)
            return !1;
          if (e(je, v, a) === ")")
            return o(z, v), !0;
          if (z === le.consequent && Be === le.alternate) {
            if (z.type === "BlockStatement")
              o(z, v);
            else {
              let Ke = v.type === "SingleLine" || v.loc.start.line === v.loc.end.line, Ne = v.loc.start.line === z.loc.start.line;
              Ke && Ne ? c(z, v, d) : c(le, v);
            }
            return !0;
          }
          return Be.type === "BlockStatement" ? (I(Be, v), !0) : Be.type === "IfStatement" ? ($(Be.consequent, v), !0) : le.consequent === Be ? (r(Be, v), !0) : !1;
        }
        function U(Ce) {
          let { comment: v, precedingNode: z, enclosingNode: le, followingNode: Be, text: je } = Ce;
          return (le == null ? void 0 : le.type) !== "WhileStatement" || !Be ? !1 : e(je, v, a) === ")" ? (o(z, v), !0) : Be.type === "BlockStatement" ? (I(Be, v), !0) : le.body === Be ? (r(Be, v), !0) : !1;
        }
        function _(Ce) {
          let { comment: v, precedingNode: z, enclosingNode: le, followingNode: Be } = Ce;
          return (le == null ? void 0 : le.type) !== "TryStatement" && (le == null ? void 0 : le.type) !== "CatchClause" || !Be ? !1 : le.type === "CatchClause" && z ? (o(z, v), !0) : Be.type === "BlockStatement" ? (I(Be, v), !0) : Be.type === "TryStatement" ? ($(Be.finalizer, v), !0) : Be.type === "CatchClause" ? ($(Be.body, v), !0) : !1;
        }
        function ee(Ce) {
          let { comment: v, enclosingNode: z, followingNode: le } = Ce;
          return j(z) && (le == null ? void 0 : le.type) === "Identifier" ? (r(z, v), !0) : !1;
        }
        function R(Ce) {
          let { comment: v, precedingNode: z, enclosingNode: le, followingNode: Be, text: je } = Ce, Ke = z && !n(je, a(z), F(v));
          return (!z || !Ke) && ((le == null ? void 0 : le.type) === "ConditionalExpression" || (le == null ? void 0 : le.type) === "TSConditionalType") && Be ? (r(Be, v), !0) : !1;
        }
        function O(Ce) {
          let { comment: v, precedingNode: z, enclosingNode: le } = Ce;
          return k(le) && le.shorthand && le.key === z && le.value.type === "AssignmentPattern" ? (o(le.value.left, v), !0) : !1;
        }
        var Z = /* @__PURE__ */ new Set(["ClassDeclaration", "ClassExpression", "DeclareClass", "DeclareInterface", "InterfaceDeclaration", "TSInterfaceDeclaration"]);
        function oe(Ce) {
          let { comment: v, precedingNode: z, enclosingNode: le, followingNode: Be } = Ce;
          if (Z.has(le == null ? void 0 : le.type)) {
            if (m(le.decorators) && !(Be && Be.type === "Decorator"))
              return o(t(le.decorators), v), !0;
            if (le.body && Be === le.body)
              return I(le.body, v), !0;
            if (Be) {
              if (le.superClass && Be === le.superClass && z && (z === le.id || z === le.typeParameters))
                return o(z, v), !0;
              for (let je of ["implements", "extends", "mixins"])
                if (le[je] && Be === le[je][0])
                  return z && (z === le.id || z === le.typeParameters || z === le.superClass) ? o(z, v) : c(le, v, je), !0;
            }
          }
          return !1;
        }
        var te = /* @__PURE__ */ new Set(["ClassMethod", "ClassProperty", "PropertyDefinition", "TSAbstractPropertyDefinition", "TSAbstractMethodDefinition", "TSDeclareMethod", "MethodDefinition", "ClassAccessorProperty", "AccessorProperty", "TSAbstractAccessorProperty"]);
        function Ee(Ce) {
          let { comment: v, precedingNode: z, enclosingNode: le, text: Be } = Ce;
          return le && z && e(Be, v, a) === "(" && (le.type === "Property" || le.type === "TSDeclareMethod" || le.type === "TSAbstractMethodDefinition") && z.type === "Identifier" && le.key === z && e(Be, z, a) !== ":" || (z == null ? void 0 : z.type) === "Decorator" && te.has(le == null ? void 0 : le.type) ? (o(z, v), !0) : !1;
        }
        var q = /* @__PURE__ */ new Set(["FunctionDeclaration", "FunctionExpression", "ClassMethod", "MethodDefinition", "ObjectMethod"]);
        function Y(Ce) {
          let { comment: v, precedingNode: z, enclosingNode: le, text: Be } = Ce;
          return e(Be, v, a) !== "(" ? !1 : z && q.has(le == null ? void 0 : le.type) ? (o(z, v), !0) : !1;
        }
        function ge(Ce) {
          let { comment: v, enclosingNode: z, text: le } = Ce;
          if ((z == null ? void 0 : z.type) !== "ArrowFunctionExpression")
            return !1;
          let Be = h(le, v, a);
          return Be !== !1 && le.slice(Be, Be + 2) === "=>" ? (c(z, v), !0) : !1;
        }
        function ye(Ce) {
          let { comment: v, enclosingNode: z, text: le } = Ce;
          return e(le, v, a) !== ")" ? !1 : z && (me(z) && y(z).length === 0 || A(z) && N(z).length === 0) ? (c(z, v), !0) : ((z == null ? void 0 : z.type) === "MethodDefinition" || (z == null ? void 0 : z.type) === "TSAbstractMethodDefinition") && y(z.value).length === 0 ? (c(z.value, v), !0) : !1;
        }
        function Le(Ce) {
          let { comment: v, precedingNode: z, enclosingNode: le, followingNode: Be, text: je } = Ce;
          if ((z == null ? void 0 : z.type) === "FunctionTypeParam" && (le == null ? void 0 : le.type) === "FunctionTypeAnnotation" && (Be == null ? void 0 : Be.type) !== "FunctionTypeParam" || ((z == null ? void 0 : z.type) === "Identifier" || (z == null ? void 0 : z.type) === "AssignmentPattern") && le && me(le) && e(je, v, a) === ")")
            return o(z, v), !0;
          if ((le == null ? void 0 : le.type) === "FunctionDeclaration" && (Be == null ? void 0 : Be.type) === "BlockStatement") {
            let Ke = (() => {
              let Ne = y(le);
              if (Ne.length > 0)
                return i(je, a(t(Ne)));
              let en = i(je, a(le.id));
              return en !== !1 && i(je, en + 1);
            })();
            if (F(v) > Ke)
              return I(Be, v), !0;
          }
          return !1;
        }
        function Q(Ce) {
          let { comment: v, enclosingNode: z } = Ce;
          return (z == null ? void 0 : z.type) === "LabeledStatement" ? (r(z, v), !0) : !1;
        }
        function W(Ce) {
          let { comment: v, enclosingNode: z } = Ce;
          return ((z == null ? void 0 : z.type) === "ContinueStatement" || (z == null ? void 0 : z.type) === "BreakStatement") && !z.label ? (o(z, v), !0) : !1;
        }
        function ne(Ce) {
          let { comment: v, precedingNode: z, enclosingNode: le } = Ce;
          return S(le) && z && le.callee === z && le.arguments.length > 0 ? (r(le.arguments[0], v), !0) : !1;
        }
        function ue(Ce) {
          let { comment: v, precedingNode: z, enclosingNode: le, followingNode: Be } = Ce;
          return (le == null ? void 0 : le.type) === "UnionTypeAnnotation" || (le == null ? void 0 : le.type) === "TSUnionType" ? (p(v) && (Be.prettierIgnore = !0, v.unignore = !0), z ? (o(z, v), !0) : !1) : (((Be == null ? void 0 : Be.type) === "UnionTypeAnnotation" || (Be == null ? void 0 : Be.type) === "TSUnionType") && p(v) && (Be.types[0].prettierIgnore = !0, v.unignore = !0), !1);
        }
        function Fe(Ce) {
          let { comment: v, enclosingNode: z } = Ce;
          return k(z) ? (r(z, v), !0) : !1;
        }
        function Se(Ce) {
          let { comment: v, enclosingNode: z, followingNode: le, ast: Be, isLastComment: je } = Ce;
          return Be && Be.body && Be.body.length === 0 ? (je ? c(Be, v) : r(Be, v), !0) : (z == null ? void 0 : z.type) === "Program" && (z == null ? void 0 : z.body.length) === 0 && !m(z.directives) ? (je ? c(z, v) : r(z, v), !0) : (le == null ? void 0 : le.type) === "Program" && (le == null ? void 0 : le.body.length) === 0 && (z == null ? void 0 : z.type) === "ModuleExpression" ? (c(le, v), !0) : !1;
        }
        function we(Ce) {
          let { comment: v, enclosingNode: z } = Ce;
          return (z == null ? void 0 : z.type) === "ForInStatement" || (z == null ? void 0 : z.type) === "ForOfStatement" ? (r(z, v), !0) : !1;
        }
        function He(Ce) {
          let { comment: v, precedingNode: z, enclosingNode: le, text: Be } = Ce;
          if ((le == null ? void 0 : le.type) === "ImportSpecifier" || (le == null ? void 0 : le.type) === "ExportSpecifier")
            return r(le, v), !0;
          let je = (z == null ? void 0 : z.type) === "ImportSpecifier" && (le == null ? void 0 : le.type) === "ImportDeclaration", Ke = (z == null ? void 0 : z.type) === "ExportSpecifier" && (le == null ? void 0 : le.type) === "ExportNamedDeclaration";
          return (je || Ke) && s(Be, a(v)) ? (o(z, v), !0) : !1;
        }
        function Ft(Ce) {
          let { comment: v, enclosingNode: z } = Ce;
          return (z == null ? void 0 : z.type) === "AssignmentPattern" ? (r(z, v), !0) : !1;
        }
        var ht = /* @__PURE__ */ new Set(["VariableDeclarator", "AssignmentExpression", "TypeAlias", "TSTypeAliasDeclaration"]), Qe = /* @__PURE__ */ new Set(["ObjectExpression", "ArrayExpression", "TemplateLiteral", "TaggedTemplateExpression", "ObjectTypeAnnotation", "TSTypeLiteral"]);
        function it(Ce) {
          let { comment: v, enclosingNode: z, followingNode: le } = Ce;
          return ht.has(z == null ? void 0 : z.type) && le && (Qe.has(le.type) || g(v)) ? (r(le, v), !0) : !1;
        }
        function De(Ce) {
          let { comment: v, enclosingNode: z, followingNode: le, text: Be } = Ce;
          return !le && ((z == null ? void 0 : z.type) === "TSMethodSignature" || (z == null ? void 0 : z.type) === "TSDeclareFunction" || (z == null ? void 0 : z.type) === "TSAbstractMethodDefinition") && e(Be, v, a) === ";" ? (o(z, v), !0) : !1;
        }
        function G(Ce) {
          let { comment: v, enclosingNode: z, followingNode: le } = Ce;
          if (p(v) && (z == null ? void 0 : z.type) === "TSMappedType" && (le == null ? void 0 : le.type) === "TSTypeParameter" && le.constraint)
            return z.prettierIgnore = !0, v.unignore = !0, !0;
        }
        function he(Ce) {
          let { comment: v, precedingNode: z, enclosingNode: le, followingNode: Be } = Ce;
          return (le == null ? void 0 : le.type) !== "TSMappedType" ? !1 : (Be == null ? void 0 : Be.type) === "TSTypeParameter" && Be.name ? (r(Be.name, v), !0) : (z == null ? void 0 : z.type) === "TSTypeParameter" && z.constraint ? (o(z.constraint, v), !0) : !1;
        }
        function K(Ce) {
          let { comment: v, enclosingNode: z, followingNode: le } = Ce;
          return !z || z.type !== "SwitchCase" || z.test || !le || le !== z.consequent[0] ? !1 : (le.type === "BlockStatement" && J(v) ? I(le, v) : c(z, v), !0);
        }
        function me(Ce) {
          return Ce.type === "ArrowFunctionExpression" || Ce.type === "FunctionExpression" || Ce.type === "FunctionDeclaration" || Ce.type === "ObjectMethod" || Ce.type === "ClassMethod" || Ce.type === "TSDeclareFunction" || Ce.type === "TSCallSignatureDeclaration" || Ce.type === "TSConstructSignatureDeclaration" || Ce.type === "TSMethodSignature" || Ce.type === "TSConstructorType" || Ce.type === "TSFunctionType" || Ce.type === "TSDeclareMethod";
        }
        function Je(Ce, v) {
          if ((v.parser === "typescript" || v.parser === "flow" || v.parser === "acorn" || v.parser === "espree" || v.parser === "meriyah" || v.parser === "__babel_estree") && Ce.type === "MethodDefinition" && Ce.value && Ce.value.type === "FunctionExpression" && y(Ce.value).length === 0 && !Ce.value.returnType && !m(Ce.value.typeParameters) && Ce.value.body)
            return [...Ce.decorators || [], Ce.key, Ce.value.body];
        }
        function _e(Ce) {
          let v = Ce.getValue(), z = Ce.getParentNode(), le = (Be) => w(f(Be, B.Leading)) || w(f(Be, B.Trailing));
          return (v && (D(v) || C(v) || S(z) && le(v)) || z && (z.type === "JSXSpreadAttribute" || z.type === "JSXSpreadChild" || z.type === "UnionTypeAnnotation" || z.type === "TSUnionType" || (z.type === "ClassDeclaration" || z.type === "ClassExpression") && z.superClass === v)) && (!P(Ce) || z.type === "UnionTypeAnnotation" || z.type === "TSUnionType");
        }
        l.exports = { handleOwnLineComment: b, handleEndOfLineComment: x, handleRemainingComment: T, getCommentChildNodes: Je, willPrintOwnComments: _e };
      } }), gr = X({ "src/language-js/needs-parens.js"(u, l) {
        H();
        var t = Fn(), s = su(), { getFunctionParameters: i, getLeftSidePathName: e, hasFlowShorthandAnnotationComment: n, hasNakedLeftSide: r, hasNode: o, isBitwiseOperator: c, startsWithNoLookaheadToken: h, shouldFlatten: m, getPrecedence: y, isCallExpression: p, isMemberExpression: D, isObjectProperty: C, isTSTypeExpression: w } = Yt();
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
                  let T = y(b), I = d.operator, $ = y(I);
                  return $ > T || F === "right" && $ === T || $ === T && !m(I, b) ? !0 : $ < T && b === "%" ? I === "+" || I === "-" : !!c(I);
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
      } }), Ai = X({ "src/language-js/print-preprocess.js"(u, l) {
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
      } }), Ps = X({ "src/language-js/print/html-binding.js"(u, l) {
        H();
        var { builders: { join: t, line: s, group: i, softline: e, indent: n } } = mt();
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
      } }), Eu = X({ "src/language-js/print/binaryish.js"(u, l) {
        H();
        var { printComments: t } = fn(), { getLast: s } = kt(), { builders: { join: i, line: e, softline: n, group: r, indent: o, align: c, indentIfBreak: h }, utils: { cleanDoc: m, getDocParts: y, isConcat: p } } = mt(), { hasLeadingOwnLineComment: D, isBinaryish: C, isJsxNode: w, shouldFlatten: P, hasComment: A, CommentCheckFlags: N, isCallExpression: S, isMemberExpression: j, isObjectProperty: k, isEnabledHackPipeline: J } = Yt(), f = 0;
        function B(a, g, E) {
          let b = a.getValue(), x = a.getParentNode(), T = a.getParentNode(1), I = b !== x.body && (x.type === "IfStatement" || x.type === "WhileStatement" || x.type === "SwitchStatement" || x.type === "DoWhileStatement"), $ = J(g) && b.operator === "|>", V = d(a, E, g, !1, I);
          if (I)
            return V;
          if ($)
            return r(V);
          if (S(x) && x.callee === b || x.type === "UnaryExpression" || j(x) && !x.computed)
            return r([o([n, ...V]), n]);
          let M = x.type === "ReturnStatement" || x.type === "ThrowStatement" || x.type === "JSXExpressionContainer" && T.type === "JSXAttribute" || b.operator !== "|" && x.type === "JsExpressionRoot" || b.type !== "NGPipeExpression" && (x.type === "NGRoot" && g.parser === "__ng_binding" || x.type === "NGMicrosyntaxExpression" && T.type === "NGMicrosyntax" && T.body.length === 1) || b === x.body && x.type === "ArrowFunctionExpression" || b !== x.body && x.type === "ForStatement" || x.type === "ConditionalExpression" && T.type !== "ReturnStatement" && T.type !== "ThrowStatement" && !S(T) || x.type === "TemplateLiteral", U = x.type === "AssignmentExpression" || x.type === "VariableDeclarator" || x.type === "ClassProperty" || x.type === "PropertyDefinition" || x.type === "TSAbstractPropertyDefinition" || x.type === "ClassPrivateProperty" || k(x), _ = C(b.left) && P(b.operator, b.left.operator);
          if (M || F(b) && !_ || !F(b) && U)
            return r(V);
          if (V.length === 0)
            return "";
          let ee = w(b.right), R = V.findIndex((q) => typeof q != "string" && !Array.isArray(q) && q.type === "group"), O = V.slice(0, R === -1 ? 1 : R + 1), Z = V.slice(O.length, ee ? -1 : void 0), oe = Symbol("logicalChain-" + ++f), te = r([...O, o(Z)], { id: oe });
          if (!ee)
            return te;
          let Ee = s(V);
          return r([te, h(Ee, { groupId: oe })]);
        }
        function d(a, g, E, b, x) {
          let T = a.getValue();
          if (!C(T))
            return [r(g())];
          let I = [];
          P(T.operator, T.left.operator) ? I = a.call((Z) => d(Z, g, E, !0, x), "left") : I.push(r(g("left")));
          let $ = F(T), V = (T.operator === "|>" || T.type === "NGPipeExpression" || T.operator === "|" && E.parser === "__vue_expression") && !D(E.originalText, T.right), M = T.type === "NGPipeExpression" ? "|" : T.operator, U = T.type === "NGPipeExpression" && T.arguments.length > 0 ? r(o([e, ": ", i([e, ": "], a.map(g, "arguments").map((Z) => c(2, r(Z))))])) : "", _;
          if ($)
            _ = [M, " ", g("right"), U];
          else {
            let Z = J(E) && M === "|>" ? a.call((oe) => d(oe, g, E, !0, x), "right") : g("right");
            _ = [V ? e : "", M, V ? " " : e, Z, U];
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
      } }), js = X({ "src/language-js/print/angular.js"(u, l) {
        H();
        var { builders: { join: t, line: s, group: i } } = mt(), { hasNode: e, hasComment: n, getComments: r } = Yt(), { printBinaryishExpression: o } = Eu();
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
      } }), Is = X({ "src/language-js/print/jsx.js"(u, l) {
        H();
        var { printComments: t, printDanglingComments: s, printCommentsSeparately: i } = fn(), { builders: { line: e, hardline: n, softline: r, group: o, indent: c, conditionalGroup: h, fill: m, ifBreak: y, lineSuffixBoundary: p, join: D }, utils: { willBreak: C } } = mt(), { getLast: w, getPreferredQuote: P } = kt(), { isJsxNode: A, rawText: N, isCallExpression: S, isStringLiteral: j, isBinaryish: k, hasComment: J, CommentCheckFlags: f, hasNodeIgnoreComment: B } = Yt(), d = gr(), { willPrintOwnComments: F } = Fi(), a = (W) => W === "" || W === e || W === n || W === r;
        function g(W, ne, ue) {
          let Fe = W.getValue();
          if (Fe.type === "JSXElement" && ge(Fe))
            return [ue("openingElement"), ue("closingElement")];
          let Se = Fe.type === "JSXElement" ? ue("openingElement") : ue("openingFragment"), we = Fe.type === "JSXElement" ? ue("closingElement") : ue("closingFragment");
          if (Fe.children.length === 1 && Fe.children[0].type === "JSXExpressionContainer" && (Fe.children[0].expression.type === "TemplateLiteral" || Fe.children[0].expression.type === "TaggedTemplateExpression"))
            return [Se, ...W.map(ue, "children"), we];
          Fe.children = Fe.children.map((v) => Le(v) ? { type: "JSXText", value: " ", raw: " " } : v);
          let He = Fe.children.some(A), Ft = Fe.children.filter((v) => v.type === "JSXExpressionContainer").length > 1, ht = Fe.type === "JSXElement" && Fe.openingElement.attributes.length > 1, Qe = C(Se) || He || ht || Ft, it = W.getParentNode().rootMarker === "mdx", De = ne.singleQuote ? "{' '}" : '{" "}', G = it ? " " : y([De, r], " "), he = Fe.openingElement && Fe.openingElement.name && Fe.openingElement.name.name === "fbt", K = E(W, ne, ue, G, he), me = Fe.children.some((v) => ye(v));
          for (let v = K.length - 2; v >= 0; v--) {
            let z = K[v] === "" && K[v + 1] === "", le = K[v] === n && K[v + 1] === "" && K[v + 2] === n, Be = (K[v] === r || K[v] === n) && K[v + 1] === "" && K[v + 2] === G, je = K[v] === G && K[v + 1] === "" && (K[v + 2] === r || K[v + 2] === n), Ke = K[v] === G && K[v + 1] === "" && K[v + 2] === G, Ne = K[v] === r && K[v + 1] === "" && K[v + 2] === n || K[v] === n && K[v + 1] === "" && K[v + 2] === r;
            le && me || z || Be || Ke || Ne ? K.splice(v, 2) : je && K.splice(v + 1, 2);
          }
          for (; K.length > 0 && a(w(K)); )
            K.pop();
          for (; K.length > 1 && a(K[0]) && a(K[1]); )
            K.shift(), K.shift();
          let Je = [];
          for (let [v, z] of K.entries()) {
            if (z === G) {
              if (v === 1 && K[v - 1] === "") {
                if (K.length === 2) {
                  Je.push(De);
                  continue;
                }
                Je.push([De, n]);
                continue;
              } else if (v === K.length - 1) {
                Je.push(De);
                continue;
              } else if (K[v - 1] === "" && K[v - 2] === n) {
                Je.push(De);
                continue;
              }
            }
            Je.push(z), C(z) && (Qe = !0);
          }
          let _e = me ? m(Je) : o(Je, { shouldBreak: !0 });
          if (it)
            return _e;
          let Ce = o([Se, c([n, _e]), n, we]);
          return Qe ? Ce : h([o([Se, ...K, we]), Ce]);
        }
        function E(W, ne, ue, Fe, Se) {
          let we = [];
          return W.each((He, Ft, ht) => {
            let Qe = He.getValue();
            if (Qe.type === "JSXText") {
              let it = N(Qe);
              if (ye(Qe)) {
                let De = it.split(Ee);
                if (De[0] === "") {
                  if (we.push(""), De.shift(), /\n/.test(De[0])) {
                    let he = ht[Ft + 1];
                    we.push(x(Se, De[1], Qe, he));
                  } else
                    we.push(Fe);
                  De.shift();
                }
                let G;
                if (w(De) === "" && (De.pop(), G = De.pop()), De.length === 0)
                  return;
                for (let [he, K] of De.entries())
                  he % 2 === 1 ? we.push(e) : we.push(K);
                if (G !== void 0)
                  if (/\n/.test(G)) {
                    let he = ht[Ft + 1];
                    we.push(x(Se, w(we), Qe, he));
                  } else
                    we.push(Fe);
                else {
                  let he = ht[Ft + 1];
                  we.push(b(Se, w(we), Qe, he));
                }
              } else
                /\n/.test(it) ? it.match(/\n/g).length > 1 && we.push("", n) : we.push("", Fe);
            } else {
              let it = ue();
              we.push(it);
              let De = ht[Ft + 1];
              if (De && ye(De)) {
                let G = Y(N(De)).split(Ee)[0];
                we.push(b(Se, G, Qe, De));
              } else
                we.push(n);
            }
          }, "children"), we;
        }
        function b(W, ne, ue, Fe) {
          return W ? "" : ue.type === "JSXElement" && !ue.closingElement || Fe && Fe.type === "JSXElement" && !Fe.closingElement ? ne.length === 1 ? r : n : r;
        }
        function x(W, ne, ue, Fe) {
          return W ? n : ne.length === 1 ? ue.type === "JSXElement" && !ue.closingElement || Fe && Fe.type === "JSXElement" && !Fe.closingElement ? n : r : n;
        }
        function T(W, ne, ue) {
          let Fe = W.getParentNode();
          if (!Fe || { ArrayExpression: !0, JSXAttribute: !0, JSXElement: !0, JSXExpressionContainer: !0, JSXFragment: !0, ExpressionStatement: !0, CallExpression: !0, OptionalCallExpression: !0, ConditionalExpression: !0, JsExpressionRoot: !0 }[Fe.type])
            return ne;
          let Se = W.match(void 0, (He) => He.type === "ArrowFunctionExpression", S, (He) => He.type === "JSXExpressionContainer"), we = d(W, ue);
          return o([we ? "" : y("("), c([r, ne]), r, we ? "" : y(")")], { shouldBreak: Se });
        }
        function I(W, ne, ue) {
          let Fe = W.getValue(), Se = [];
          if (Se.push(ue("name")), Fe.value) {
            let we;
            if (j(Fe.value)) {
              let He = N(Fe.value).slice(1, -1).replace(/&apos;/g, "'").replace(/&quot;/g, '"'), { escaped: Ft, quote: ht, regex: Qe } = P(He, ne.jsxSingleQuote ? "'" : '"');
              He = He.replace(Qe, Ft);
              let { leading: it, trailing: De } = W.call(() => i(W, ne), "value");
              we = [it, ht, He, ht, De];
            } else
              we = ue("value");
            Se.push("=", we);
          }
          return Se;
        }
        function $(W, ne, ue) {
          let Fe = W.getValue(), Se = (we, He) => we.type === "JSXEmptyExpression" || !J(we) && (we.type === "ArrayExpression" || we.type === "ObjectExpression" || we.type === "ArrowFunctionExpression" || we.type === "AwaitExpression" && (Se(we.argument, we) || we.argument.type === "JSXElement") || S(we) || we.type === "FunctionExpression" || we.type === "TemplateLiteral" || we.type === "TaggedTemplateExpression" || we.type === "DoExpression" || A(He) && (we.type === "ConditionalExpression" || k(we)));
          return Se(Fe.expression, W.getParentNode(0)) ? o(["{", ue("expression"), p, "}"]) : o(["{", c([r, ue("expression")]), r, p, "}"]);
        }
        function V(W, ne, ue) {
          let Fe = W.getValue(), Se = Fe.name && J(Fe.name) || Fe.typeParameters && J(Fe.typeParameters);
          if (Fe.selfClosing && Fe.attributes.length === 0 && !Se)
            return ["<", ue("name"), ue("typeParameters"), " />"];
          if (Fe.attributes && Fe.attributes.length === 1 && Fe.attributes[0].value && j(Fe.attributes[0].value) && !Fe.attributes[0].value.value.includes(`
`) && !Se && !J(Fe.attributes[0]))
            return o(["<", ue("name"), ue("typeParameters"), " ", ...W.map(ue, "attributes"), Fe.selfClosing ? " />" : ">"]);
          let we = Fe.attributes && Fe.attributes.some((Ft) => Ft.value && j(Ft.value) && Ft.value.value.includes(`
`)), He = ne.singleAttributePerLine && Fe.attributes.length > 1 ? n : e;
          return o(["<", ue("name"), ue("typeParameters"), c(W.map(() => [He, ue()], "attributes")), ...M(Fe, ne, Se)], { shouldBreak: we });
        }
        function M(W, ne, ue) {
          return W.selfClosing ? [e, "/>"] : U(W, ne, ue) ? [">"] : [r, ">"];
        }
        function U(W, ne, ue) {
          let Fe = W.attributes.length > 0 && J(w(W.attributes), f.Trailing);
          return W.attributes.length === 0 && !ue || (ne.bracketSameLine || ne.jsxBracketSameLine) && (!ue || W.attributes.length > 0) && !Fe;
        }
        function _(W, ne, ue) {
          let Fe = W.getValue(), Se = [];
          Se.push("</");
          let we = ue("name");
          return J(Fe.name, f.Leading | f.Line) ? Se.push(c([n, we]), n) : J(Fe.name, f.Leading | f.Block) ? Se.push(" ", we) : Se.push(we), Se.push(">"), Se;
        }
        function ee(W, ne) {
          let ue = W.getValue(), Fe = J(ue), Se = J(ue, f.Line), we = ue.type === "JSXOpeningFragment";
          return [we ? "<" : "</", c([Se ? n : Fe && !we ? " " : "", s(W, ne, !0)]), Se ? n : "", ">"];
        }
        function R(W, ne, ue) {
          let Fe = t(W, g(W, ne, ue), ne);
          return T(W, Fe, ne);
        }
        function O(W, ne) {
          let ue = W.getValue(), Fe = J(ue, f.Line);
          return [s(W, ne, !Fe), Fe ? n : ""];
        }
        function Z(W, ne, ue) {
          let Fe = W.getValue();
          return ["{", W.call((Se) => {
            let we = ["...", ue()], He = Se.getValue();
            return !J(He) || !F(Se) ? we : [c([r, t(Se, we, ne)]), r];
          }, Fe.type === "JSXSpreadAttribute" ? "argument" : "expression"), "}"];
        }
        function oe(W, ne, ue) {
          let Fe = W.getValue();
          if (Fe.type.startsWith("JSX"))
            switch (Fe.type) {
              case "JSXAttribute":
                return I(W, ne, ue);
              case "JSXIdentifier":
                return String(Fe.name);
              case "JSXNamespacedName":
                return D(":", [ue("namespace"), ue("name")]);
              case "JSXMemberExpression":
                return D(".", [ue("object"), ue("property")]);
              case "JSXSpreadAttribute":
                return Z(W, ne, ue);
              case "JSXSpreadChild":
                return Z(W, ne, ue);
              case "JSXExpressionContainer":
                return $(W, ne, ue);
              case "JSXFragment":
              case "JSXElement":
                return R(W, ne, ue);
              case "JSXOpeningElement":
                return V(W, ne, ue);
              case "JSXClosingElement":
                return _(W, ne, ue);
              case "JSXOpeningFragment":
              case "JSXClosingFragment":
                return ee(W, ne);
              case "JSXEmptyExpression":
                return O(W, ne);
              case "JSXText":
                throw new Error("JSXText should be handled by JSXElement");
              default:
                throw new Error(`Unknown JSX node type: ${JSON.stringify(Fe.type)}.`);
            }
        }
        var te = ` 
\r	`, Ee = new RegExp("([" + te + "]+)"), q = new RegExp("[^" + te + "]"), Y = (W) => W.replace(new RegExp("(?:^" + Ee.source + "|" + Ee.source + "$)"), "");
        function ge(W) {
          if (W.children.length === 0)
            return !0;
          if (W.children.length > 1)
            return !1;
          let ne = W.children[0];
          return ne.type === "JSXText" && !ye(ne);
        }
        function ye(W) {
          return W.type === "JSXText" && (q.test(N(W)) || !/\n/.test(N(W)));
        }
        function Le(W) {
          return W.type === "JSXExpressionContainer" && j(W.expression) && W.expression.value === " " && !J(W.expression);
        }
        function Q(W) {
          let ne = W.getValue(), ue = W.getParentNode();
          if (!ue || !ne || !A(ne) || !A(ue))
            return !1;
          let Fe = ue.children.indexOf(ne), Se = null;
          for (let we = Fe; we > 0; we--) {
            let He = ue.children[we - 1];
            if (!(He.type === "JSXText" && !ye(He))) {
              Se = He;
              break;
            }
          }
          return Se && Se.type === "JSXExpressionContainer" && Se.expression.type === "JSXEmptyExpression" && B(Se.expression);
        }
        l.exports = { hasJsxIgnoreComment: Q, printJsx: oe };
      } }), _n = X({ "src/language-js/print/misc.js"(u, l) {
        H();
        var { isNonEmptyArray: t } = kt(), { builders: { indent: s, join: i, line: e } } = mt(), { isFlowAnnotationComment: n } = Yt();
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
        var { printDanglingComments: t } = fn(), { builders: { line: s, softline: i, hardline: e, group: n, indent: r, ifBreak: o, fill: c } } = mt(), { getLast: h, hasNewline: m } = kt(), { shouldPrintComma: y, hasComment: p, CommentCheckFlags: D, isNextLineEmpty: C, isNumericLiteral: w, isSignedNumericLiteral: P } = Yt(), { locStart: A } = Bn(), { printOptionalToken: N, printTypeAnnotation: S } = _n();
        function j(B, d, F) {
          let a = B.getValue(), g = [], E = a.type === "TupleExpression" ? "#[" : "[", b = "]";
          if (a.elements.length === 0)
            p(a, D.Dangling) ? g.push(n([E, t(B, d), i, b])) : g.push(E, b);
          else {
            let x = h(a.elements), T = !(x && x.type === "RestElement"), I = x === null, $ = Symbol("array"), V = !d.__inJestEach && a.elements.length > 1 && a.elements.every((_, ee, R) => {
              let O = _ && _.type;
              if (O !== "ArrayExpression" && O !== "ObjectExpression")
                return !1;
              let Z = R[ee + 1];
              if (Z && O !== Z.type)
                return !1;
              let oe = O === "ArrayExpression" ? "elements" : "properties";
              return _[oe] && _[oe].length > 1;
            }), M = k(a, d), U = T ? I ? "," : y(d) ? M ? o(",", "", { groupId: $ }) : o(",") : "" : "";
            g.push(n([E, r([i, M ? f(B, d, F, U) : [J(B, d, "elements", F), U], t(B, d, !0)]), i, b], { shouldBreak: V, id: $ }));
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
      } }), vi = X({ "src/language-js/print/call-arguments.js"(u, l) {
        H();
        var { printDanglingComments: t } = fn(), { getLast: s, getPenultimate: i } = kt(), { getFunctionParameters: e, hasComment: n, CommentCheckFlags: r, isFunctionCompositionArgs: o, isJsxNode: c, isLongCurriedCallExpression: h, shouldPrintComma: m, getCallArguments: y, iterateCallArgumentsPath: p, isNextLineEmpty: D, isCallExpression: C, isStringLiteral: w, isObjectProperty: P, isTSTypeExpression: A } = Yt(), { builders: { line: N, hardline: S, softline: j, group: k, indent: J, conditionalGroup: f, ifBreak: B, breakParent: d }, utils: { willBreak: F } } = mt(), { ArgExpansionBailout: a } = xr(), { isConciselyPrintedArray: g } = Tr();
        function E(M, U, _) {
          let ee = M.getValue(), R = ee.type === "ImportExpression", O = y(ee);
          if (O.length === 0)
            return ["(", t(M, U, !0), ")"];
          if (I(O))
            return ["(", _(["arguments", 0]), ", ", _(["arguments", 1]), ")"];
          let Z = !1, oe = !1, te = O.length - 1, Ee = [];
          p(M, (Q, W) => {
            let ne = Q.getNode(), ue = [_()];
            W === te || (D(ne, U) ? (W === 0 && (oe = !0), Z = !0, ue.push(",", S, S)) : ue.push(",", N)), Ee.push(ue);
          });
          let q = !(R || ee.callee && ee.callee.type === "Import") && m(U, "all") ? "," : "";
          function Y() {
            return k(["(", J([N, ...Ee]), q, N, ")"], { shouldBreak: !0 });
          }
          if (Z || M.getParentNode().type !== "Decorator" && o(O))
            return Y();
          let ge = T(O), ye = x(O, U);
          if (ge || ye) {
            if (ge ? Ee.slice(1).some(F) : Ee.slice(0, -1).some(F))
              return Y();
            let Q = [];
            try {
              M.try(() => {
                p(M, (W, ne) => {
                  ge && ne === 0 && (Q = [[_([], { expandFirstArg: !0 }), Ee.length > 1 ? "," : "", oe ? S : N, oe ? S : ""], ...Ee.slice(1)]), ye && ne === te && (Q = [...Ee.slice(0, -1), _([], { expandLastArg: !0 })]);
                });
              });
            } catch (W) {
              if (W instanceof a)
                return Y();
              throw W;
            }
            return [Ee.some(F) ? d : "", f([["(", ...Q, ")"], ge ? ["(", k(Q[0], { shouldBreak: !0 }), ...Q.slice(1), ")"] : ["(", ...Ee.slice(0, -1), k(s(Q), { shouldBreak: !0 }), ")"], Y()])];
          }
          let Le = ["(", J([j, ...Ee]), B(q), j, ")"];
          return h(M) ? Le : k(Le, { shouldBreak: Ee.some(F) || Z });
        }
        function b(M) {
          let U = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
          return M.type === "ObjectExpression" && (M.properties.length > 0 || n(M)) || M.type === "ArrayExpression" && (M.elements.length > 0 || n(M)) || M.type === "TSTypeAssertion" && b(M.expression) || A(M) && b(M.expression) || M.type === "FunctionExpression" || M.type === "ArrowFunctionExpression" && (!M.returnType || !M.returnType.typeAnnotation || M.returnType.typeAnnotation.type !== "TSTypeReference" || $(M.body)) && (M.body.type === "BlockStatement" || M.body.type === "ArrowFunctionExpression" && b(M.body, !0) || M.body.type === "ObjectExpression" || M.body.type === "ArrayExpression" || !U && (C(M.body) || M.body.type === "ConditionalExpression") || c(M.body)) || M.type === "DoExpression" || M.type === "ModuleExpression";
        }
        function x(M, U) {
          let _ = s(M), ee = i(M);
          return !n(_, r.Leading) && !n(_, r.Trailing) && b(_) && (!ee || ee.type !== _.type) && (M.length !== 2 || ee.type !== "ArrowFunctionExpression" || _.type !== "ArrayExpression") && !(M.length > 1 && _.type === "ArrayExpression" && g(_, U));
        }
        function T(M) {
          if (M.length !== 2)
            return !1;
          let [U, _] = M;
          return U.type === "ModuleExpression" && V(_) ? !0 : !n(U) && (U.type === "FunctionExpression" || U.type === "ArrowFunctionExpression" && U.body.type === "BlockStatement") && _.type !== "FunctionExpression" && _.type !== "ArrowFunctionExpression" && _.type !== "ConditionalExpression" && !b(_);
        }
        function I(M) {
          return M.length === 2 && M[0].type === "ArrowFunctionExpression" && e(M[0]).length === 0 && M[0].body.type === "BlockStatement" && M[1].type === "ArrayExpression" && !M.some((U) => n(U));
        }
        function $(M) {
          return M.type === "BlockStatement" && (M.body.some((U) => U.type !== "EmptyStatement") || n(M, r.Dangling));
        }
        function V(M) {
          return M.type === "ObjectExpression" && M.properties.length === 1 && P(M.properties[0]) && M.properties[0].key.type === "Identifier" && M.properties[0].key.name === "type" && w(M.properties[0].value) && M.properties[0].value.value === "module";
        }
        l.exports = E;
      } }), bi = X({ "src/language-js/print/member.js"(u, l) {
        H();
        var { builders: { softline: t, group: s, indent: i, label: e } } = mt(), { isNumericLiteral: n, isMemberExpression: r, isCallExpression: o } = Yt(), { printOptionalToken: c } = _n();
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
      } }), _s = X({ "src/language-js/print/member-chain.js"(u, l) {
        H();
        var { printComments: t } = fn(), { getLast: s, isNextLineEmptyAfterIndex: i, getNextNonSpaceNonCommentCharacterIndex: e } = kt(), n = gr(), { isCallExpression: r, isMemberExpression: o, isFunctionOrArrowExpression: c, isLongCurriedCallExpression: h, isMemberish: m, isNumericLiteral: y, isSimpleCallArgument: p, hasComment: D, CommentCheckFlags: C, isNextLineEmpty: w } = Yt(), { locEnd: P } = Bn(), { builders: { join: A, hardline: N, group: S, indent: j, conditionalGroup: k, breakParent: J, label: f }, utils: { willBreak: B } } = mt(), d = vi(), { printMemberLookup: F } = bi(), { printOptionalToken: a, printFunctionTypeParameters: g, printBindExpressionCallee: E } = _n();
        function b(x, T, I) {
          let $ = x.getParentNode(), V = !$ || $.type === "ExpressionStatement", M = [];
          function U(Qe) {
            let { originalText: it } = T, De = e(it, Qe, P);
            return it.charAt(De) === ")" ? De !== !1 && i(it, De + 1) : w(Qe, T);
          }
          function _(Qe) {
            let it = Qe.getValue();
            r(it) && (m(it.callee) || r(it.callee)) ? (M.unshift({ node: it, printed: [t(Qe, [a(Qe), g(Qe, T, I), d(Qe, T, I)], T), U(it) ? N : ""] }), Qe.call((De) => _(De), "callee")) : m(it) ? (M.unshift({ node: it, needsParens: n(Qe, T), printed: t(Qe, o(it) ? F(Qe, T, I) : E(Qe, T, I), T) }), Qe.call((De) => _(De), "object")) : it.type === "TSNonNullExpression" ? (M.unshift({ node: it, printed: t(Qe, "!", T) }), Qe.call((De) => _(De), "expression")) : M.unshift({ node: it, printed: I() });
          }
          let ee = x.getValue();
          M.unshift({ node: ee, printed: [a(x), g(x, T, I), d(x, T, I)] }), ee.callee && x.call((Qe) => _(Qe), "callee");
          let R = [], O = [M[0]], Z = 1;
          for (; Z < M.length && (M[Z].node.type === "TSNonNullExpression" || r(M[Z].node) || o(M[Z].node) && M[Z].node.computed && y(M[Z].node.property)); ++Z)
            O.push(M[Z]);
          if (!r(M[0].node))
            for (; Z + 1 < M.length && m(M[Z].node) && m(M[Z + 1].node); ++Z)
              O.push(M[Z]);
          R.push(O), O = [];
          let oe = !1;
          for (; Z < M.length; ++Z) {
            if (oe && m(M[Z].node)) {
              if (M[Z].node.computed && y(M[Z].node.property)) {
                O.push(M[Z]);
                continue;
              }
              R.push(O), O = [], oe = !1;
            }
            (r(M[Z].node) || M[Z].node.type === "ImportExpression") && (oe = !0), O.push(M[Z]), D(M[Z].node, C.Trailing) && (R.push(O), O = [], oe = !1);
          }
          O.length > 0 && R.push(O);
          function te(Qe) {
            return /^[A-Z]|^[$_]+$/.test(Qe);
          }
          function Ee(Qe) {
            return Qe.length <= T.tabWidth;
          }
          function q(Qe) {
            let it = Qe[1].length > 0 && Qe[1][0].node.computed;
            if (Qe[0].length === 1) {
              let G = Qe[0][0].node;
              return G.type === "ThisExpression" || G.type === "Identifier" && (te(G.name) || V && Ee(G.name) || it);
            }
            let De = s(Qe[0]).node;
            return o(De) && De.property.type === "Identifier" && (te(De.property.name) || it);
          }
          let Y = R.length >= 2 && !D(R[1][0].node) && q(R);
          function ge(Qe) {
            let it = Qe.map((De) => De.printed);
            return Qe.length > 0 && s(Qe).needsParens ? ["(", ...it, ")"] : it;
          }
          function ye(Qe) {
            return Qe.length === 0 ? "" : j(S([N, A(N, Qe.map(ge))]));
          }
          let Le = R.map(ge), Q = Le, W = Y ? 3 : 2, ne = R.flat(), ue = ne.slice(1, -1).some((Qe) => D(Qe.node, C.Leading)) || ne.slice(0, -1).some((Qe) => D(Qe.node, C.Trailing)) || R[W] && D(R[W][0].node, C.Leading);
          if (R.length <= W && !ue)
            return h(x) ? Q : S(Q);
          let Fe = s(R[Y ? 1 : 0]).node, Se = !r(Fe) && U(Fe), we = [ge(R[0]), Y ? R.slice(1, 2).map(ge) : "", Se ? N : "", ye(R.slice(Y ? 2 : 1))], He = M.map((Qe) => {
            let { node: it } = Qe;
            return it;
          }).filter(r);
          function Ft() {
            let Qe = s(s(R)).node, it = s(Le);
            return r(Qe) && B(it) && He.slice(0, -1).some((De) => De.arguments.some(c));
          }
          let ht;
          return ue || He.length > 2 && He.some((Qe) => !Qe.arguments.every((it) => p(it, 0))) || Le.slice(0, -1).some(B) || Ft() ? ht = S(we) : ht = [B(Q) || Se ? J : "", k([Q, we])], f("member-chain", ht);
        }
        l.exports = b;
      } }), xi = X({ "src/language-js/print/call-expression.js"(u, l) {
        H();
        var { builders: { join: t, group: s } } = mt(), i = gr(), { getCallArguments: e, hasFlowAnnotationComment: n, isCallExpression: r, isMemberish: o, isStringLiteral: c, isTemplateOnItsOwnLine: h, isTestCall: m, iterateCallArgumentsPath: y } = Yt(), p = _s(), D = vi(), { printOptionalToken: C, printFunctionTypeParameters: w } = _n();
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
        var { isNonEmptyArray: t, getStringWidth: s } = kt(), { builders: { line: i, group: e, indent: n, indentIfBreak: r, lineSuffixBoundary: o }, utils: { cleanDoc: c, willBreak: h, canBreak: m } } = mt(), { hasLeadingOwnLineComment: y, isBinaryish: p, isStringLiteral: D, isLiteral: C, isNumericLiteral: w, isCallExpression: P, isMemberExpression: A, getCallArguments: N, rawText: S, hasComment: j, isSignedNumericLiteral: k, isObjectProperty: J } = Yt(), { shouldInlineLogicalExpression: f } = Eu(), { printCallExpression: B } = xi();
        function d(q, Y, ge, ye, Le, Q) {
          let W = g(q, Y, ge, ye, Q), ne = ge(Q, { assignmentLayout: W });
          switch (W) {
            case "break-after-operator":
              return e([e(ye), Le, e(n([i, ne]))]);
            case "never-break-after-operator":
              return e([e(ye), Le, " ", ne]);
            case "fluid": {
              let ue = Symbol("assignment");
              return e([e(ye), Le, e(n(i), { id: ue }), o, r(ne, { groupId: ue })]);
            }
            case "break-lhs":
              return e([ye, Le, " ", e(ne)]);
            case "chain":
              return [e(ye), Le, i, ne];
            case "chain-tail":
              return [e(ye), Le, n([i, ne])];
            case "chain-tail-arrow-chain":
              return [e(ye), Le, ne];
            case "only-left":
              return ye;
          }
        }
        function F(q, Y, ge) {
          let ye = q.getValue();
          return d(q, Y, ge, ge("left"), [" ", ye.operator], "right");
        }
        function a(q, Y, ge) {
          return d(q, Y, ge, ge("id"), " =", "init");
        }
        function g(q, Y, ge, ye, Le) {
          let Q = q.getValue(), W = Q[Le];
          if (!W)
            return "only-left";
          let ne = !x(W);
          if (q.match(x, T, (Fe) => !ne || Fe.type !== "ExpressionStatement" && Fe.type !== "VariableDeclaration"))
            return ne ? W.type === "ArrowFunctionExpression" && W.body.type === "ArrowFunctionExpression" ? "chain-tail-arrow-chain" : "chain-tail" : "chain";
          if (!ne && x(W.right) || y(Y.originalText, W))
            return "break-after-operator";
          if (W.type === "CallExpression" && W.callee.name === "require" || Y.parser === "json5" || Y.parser === "json")
            return "never-break-after-operator";
          if (b(Q) || I(Q) || M(Q) || U(Q) && m(ye))
            return "break-lhs";
          let ue = oe(Q, ye, Y);
          return q.call(() => E(q, Y, ge, ue), Le) ? "break-after-operator" : ue || W.type === "TemplateLiteral" || W.type === "TaggedTemplateExpression" || W.type === "BooleanLiteral" || w(W) || W.type === "ClassExpression" ? "never-break-after-operator" : "fluid";
        }
        function E(q, Y, ge, ye) {
          let Le = q.getValue();
          if (p(Le) && !f(Le))
            return !0;
          switch (Le.type) {
            case "StringLiteralTypeAnnotation":
            case "SequenceExpression":
              return !0;
            case "ConditionalExpression": {
              let { test: ne } = Le;
              return p(ne) && !f(ne);
            }
            case "ClassExpression":
              return t(Le.decorators);
          }
          if (ye)
            return !1;
          let Q = Le, W = [];
          for (; ; )
            if (Q.type === "UnaryExpression")
              Q = Q.argument, W.push("argument");
            else if (Q.type === "TSNonNullExpression")
              Q = Q.expression, W.push("expression");
            else
              break;
          return !!(D(Q) || q.call(() => R(q, Y, ge), ...W));
        }
        function b(q) {
          if (T(q)) {
            let Y = q.left || q.id;
            return Y.type === "ObjectPattern" && Y.properties.length > 2 && Y.properties.some((ge) => J(ge) && (!ge.shorthand || ge.value && ge.value.type === "AssignmentPattern"));
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
          let Y = $(q);
          if (t(Y)) {
            let ge = q.type === "TSTypeAliasDeclaration" ? "constraint" : "bound";
            if (Y.length > 1 && Y.some((ye) => ye[ge] || ye.default))
              return !0;
          }
          return !1;
        }
        function $(q) {
          return V(q) && q.typeParameters && q.typeParameters.params ? q.typeParameters.params : null;
        }
        function V(q) {
          return q.type === "TSTypeAliasDeclaration" || q.type === "TypeAlias";
        }
        function M(q) {
          if (q.type !== "VariableDeclarator")
            return !1;
          let { typeAnnotation: Y } = q.id;
          if (!Y || !Y.typeAnnotation)
            return !1;
          let ge = _(Y.typeAnnotation);
          return t(ge) && ge.length > 1 && ge.some((ye) => t(_(ye)) || ye.type === "TSConditionalType");
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
        function R(q, Y, ge) {
          let ye = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1, Le = q.getValue(), Q = () => R(q, Y, ge, !0);
          if (Le.type === "TSNonNullExpression")
            return q.call(Q, "expression");
          if (P(Le)) {
            if (B(q, Y, ge).label === "member-chain")
              return !1;
            let W = N(Le);
            return !(W.length === 0 || W.length === 1 && Z(W[0], Y)) || te(Le, ge) ? !1 : q.call(Q, "callee");
          }
          return A(Le) ? q.call(Q, "object") : ye && (Le.type === "Identifier" || Le.type === "ThisExpression");
        }
        var O = 0.25;
        function Z(q, Y) {
          let { printWidth: ge } = Y;
          if (j(q))
            return !1;
          let ye = ge * O;
          if (q.type === "ThisExpression" || q.type === "Identifier" && q.name.length <= ye || k(q) && !j(q.argument))
            return !0;
          let Le = q.type === "Literal" && "regex" in q && q.regex.pattern || q.type === "RegExpLiteral" && q.pattern;
          return Le ? Le.length <= ye : D(q) ? S(q).length <= ye : q.type === "TemplateLiteral" ? q.expressions.length === 0 && q.quasis[0].value.raw.length <= ye && !q.quasis[0].value.raw.includes(`
`) : C(q);
        }
        function oe(q, Y, ge) {
          if (!J(q))
            return !1;
          Y = c(Y);
          let ye = 3;
          return typeof Y == "string" && s(Y) < ge.tabWidth + ye;
        }
        function te(q, Y) {
          let ge = Ee(q);
          if (t(ge)) {
            if (ge.length > 1)
              return !0;
            if (ge.length === 1) {
              let Le = ge[0];
              if (Le.type === "TSUnionType" || Le.type === "UnionTypeAnnotation" || Le.type === "TSIntersectionType" || Le.type === "IntersectionTypeAnnotation" || Le.type === "TSTypeLiteral" || Le.type === "ObjectTypeAnnotation")
                return !0;
            }
            let ye = q.typeParameters ? "typeParameters" : "typeArguments";
            if (h(Y(ye)))
              return !0;
          }
          return !1;
        }
        function Ee(q) {
          return q.typeParameters && q.typeParameters.params || q.typeArguments && q.typeArguments.params;
        }
        l.exports = { printVariableDeclarator: a, printAssignmentExpression: F, printAssignment: d, isArrowFunctionVariableDeclarator: U };
      } }), Xr = X({ "src/language-js/print/function-parameters.js"(u, l) {
        H();
        var { getNextNonSpaceNonCommentCharacter: t } = kt(), { printDanglingComments: s } = fn(), { builders: { line: i, hardline: e, softline: n, group: r, indent: o, ifBreak: c }, utils: { removeLines: h, willBreak: m } } = mt(), { getFunctionParameters: y, iterateFunctionParametersPath: p, isSimpleType: D, isTestCall: C, isTypeAnnotationAFunction: w, isObjectType: P, isObjectTypePropertyAFunction: A, hasRestParameter: N, shouldPrintComma: S, hasComment: j, isNextLineEmpty: k } = Yt(), { locEnd: J } = Bn(), { ArgExpansionBailout: f } = xr(), { printFunctionTypeParameters: B } = _n();
        function d(E, b, x, T, I) {
          let $ = E.getValue(), V = y($), M = I ? B(E, x, b) : "";
          if (V.length === 0)
            return [M, "(", s(E, x, !0, (Z) => t(x.originalText, Z, J) === ")"), ")"];
          let U = E.getParentNode(), _ = C(U), ee = F($), R = [];
          if (p(E, (Z, oe) => {
            let te = oe === V.length - 1;
            te && $.rest && R.push("..."), R.push(b()), !te && (R.push(","), _ || ee ? R.push(" ") : k(V[oe], x) ? R.push(e, e) : R.push(i));
          }), T) {
            if (m(M) || m(R))
              throw new f();
            return r([h(M), "(", h(R), ")"]);
          }
          let O = V.every((Z) => !Z.decorators);
          return ee && O ? [M, "(", ...R, ")"] : _ ? [M, "(", ...R, ")"] : (A(U) || w(U) || U.type === "TypeAlias" || U.type === "UnionTypeAnnotation" || U.type === "TSUnionType" || U.type === "IntersectionTypeAnnotation" || U.type === "FunctionTypeAnnotation" && U.returnType === $) && V.length === 1 && V[0].name === null && $.this !== V[0] && V[0].typeAnnotation && $.typeParameters === null && D(V[0].typeAnnotation) && !$.rest ? x.arrowParens === "always" ? ["(", ...R, ")"] : R : [M, "(", o([n, ...R]), c(!N($) && S(x, "all") ? "," : ""), n, ")"];
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
      } }), Ur = X({ "src/language-js/print/type-annotation.js"(u, l) {
        H();
        var { printComments: t, printDanglingComments: s } = fn(), { isNonEmptyArray: i } = kt(), { builders: { group: e, join: n, line: r, softline: o, indent: c, align: h, ifBreak: m } } = mt(), y = gr(), { locStart: p } = Bn(), { isSimpleType: D, isObjectType: C, hasLeadingOwnLineComment: w, isObjectTypePropertyAFunction: P, shouldPrintComma: A } = Yt(), { printAssignment: N } = wr(), { printFunctionParameters: S, shouldGroupFunctionParameters: j } = Xr(), { printArrayItems: k } = Tr();
        function J(x) {
          if (D(x) || C(x))
            return !0;
          if (x.type === "UnionTypeAnnotation" || x.type === "TSUnionType") {
            let T = x.types.filter(($) => $.type === "VoidTypeAnnotation" || $.type === "TSVoidKeyword" || $.type === "NullLiteralTypeAnnotation" || $.type === "TSNullKeyword").length, I = x.types.some(($) => $.type === "ObjectTypeAnnotation" || $.type === "TSTypeLiteral" || $.type === "GenericTypeAnnotation" || $.type === "TSTypeReference");
            if (x.types.length - 1 === T && I)
              return !0;
          }
          return !1;
        }
        function f(x, T, I) {
          let $ = T.semi ? ";" : "", V = x.getValue(), M = [];
          return M.push("opaque type ", I("id"), I("typeParameters")), V.supertype && M.push(": ", I("supertype")), V.impltype && M.push(" = ", I("impltype")), M.push($), M;
        }
        function B(x, T, I) {
          let $ = T.semi ? ";" : "", V = x.getValue(), M = [];
          V.declare && M.push("declare "), M.push("type ", I("id"), I("typeParameters"));
          let U = V.type === "TSTypeAliasDeclaration" ? "typeAnnotation" : "right";
          return [N(x, T, I, M, " =", U), $];
        }
        function d(x, T, I) {
          let $ = x.getValue(), V = x.map(I, "types"), M = [], U = !1;
          for (let _ = 0; _ < V.length; ++_)
            _ === 0 ? M.push(V[_]) : C($.types[_ - 1]) && C($.types[_]) ? M.push([" & ", U ? c(V[_]) : V[_]]) : !C($.types[_ - 1]) && !C($.types[_]) ? M.push(c([" &", r, V[_]])) : (_ > 1 && (U = !0), M.push(" & ", _ > 1 ? c(V[_]) : V[_]));
          return e(M);
        }
        function F(x, T, I) {
          let $ = x.getValue(), V = x.getParentNode(), M = V.type !== "TypeParameterInstantiation" && V.type !== "TSTypeParameterInstantiation" && V.type !== "GenericTypeAnnotation" && V.type !== "TSTypeReference" && V.type !== "TSTypeAssertion" && V.type !== "TupleTypeAnnotation" && V.type !== "TSTupleType" && !(V.type === "FunctionTypeParam" && !V.name && x.getParentNode(1).this !== V) && !((V.type === "TypeAlias" || V.type === "VariableDeclarator" || V.type === "TSTypeAliasDeclaration") && w(T.originalText, $)), U = J($), _ = x.map((O) => {
            let Z = I();
            return U || (Z = h(2, Z)), t(O, Z, T);
          }, "types");
          if (U)
            return n(" | ", _);
          let ee = M && !w(T.originalText, $), R = [m([ee ? r : "", "| "]), n([r, "| "], _)];
          return y(x, T) ? e([c(R), o]) : V.type === "TupleTypeAnnotation" && V.types.length > 1 || V.type === "TSTupleType" && V.elementTypes.length > 1 ? e([c([m(["(", o]), R]), o, m(")")]) : e(M ? c(R) : R);
        }
        function a(x, T, I) {
          let $ = x.getValue(), V = [], M = x.getParentNode(0), U = x.getParentNode(1), _ = x.getParentNode(2), ee = $.type === "TSFunctionType" || !((M.type === "ObjectTypeProperty" || M.type === "ObjectTypeInternalSlot") && !M.variance && !M.optional && p(M) === p($) || M.type === "ObjectTypeCallProperty" || _ && _.type === "DeclareFunction"), R = ee && (M.type === "TypeAnnotation" || M.type === "TSTypeAnnotation"), O = R && ee && (M.type === "TypeAnnotation" || M.type === "TSTypeAnnotation") && U.type === "ArrowFunctionExpression";
          P(M) && (ee = !0, R = !0), O && V.push("(");
          let Z = S(x, I, T, !1, !0), oe = $.returnType || $.predicate || $.typeAnnotation ? [ee ? " => " : ": ", I("returnType"), I("predicate"), I("typeAnnotation")] : "", te = j($, oe);
          return V.push(te ? e(Z) : Z), oe && V.push(oe), O && V.push(")"), e(V);
        }
        function g(x, T, I) {
          let $ = x.getValue(), V = $.type === "TSTupleType" ? "elementTypes" : "types", M = $[V], U = i(M), _ = U ? o : "";
          return e(["[", c([_, k(x, T, V, I)]), m(U && A(T, "all") ? "," : ""), s(x, T, !0), _, "]"]);
        }
        function E(x, T, I) {
          let $ = x.getValue(), V = $.type === "OptionalIndexedAccessType" && $.optional ? "?.[" : "[";
          return [I("objectType"), V, I("indexType"), "]"];
        }
        function b(x, T, I) {
          let $ = x.getValue();
          return [$.postfix ? "" : I, T("typeAnnotation"), $.postfix ? I : ""];
        }
        l.exports = { printOpaqueType: f, printTypeAlias: B, printIntersectionType: d, printUnionType: F, printFunctionType: a, printTupleType: g, printIndexedAccessType: E, shouldHugType: J, printJSDocType: b };
      } }), zr = X({ "src/language-js/print/type-parameters.js"(u, l) {
        H();
        var { printDanglingComments: t } = fn(), { builders: { join: s, line: i, hardline: e, softline: n, group: r, indent: o, ifBreak: c } } = mt(), { isTestCall: h, hasComment: m, CommentCheckFlags: y, isTSXFile: p, shouldPrintComma: D, getFunctionParameters: C, isObjectType: w, getTypeScriptMappedTypeModifier: P } = Yt(), { createGroupIdMapper: A } = kt(), { shouldHugType: N } = Ur(), { isArrowFunctionVariableDeclarator: S } = wr(), j = A("typeParameters");
        function k(B, d, F, a) {
          let g = B.getValue();
          if (!g[a])
            return "";
          if (!Array.isArray(g[a]))
            return F(a);
          let E = B.getNode(2), b = E && h(E), x = B.match((I) => !(I[a].length === 1 && w(I[a][0])), void 0, (I, $) => $ === "typeAnnotation", (I) => I.type === "Identifier", S);
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
        var { printComments: t } = fn(), { printString: s, printNumber: i } = kt(), { isNumericLiteral: e, isSimpleNumber: n, isStringLiteral: r, isStringPropSafeToUnquote: o, rawText: c } = Yt(), { printAssignment: h } = wr(), m = /* @__PURE__ */ new WeakMap();
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
      } }), Yr = X({ "src/language-js/print/function.js"(u, l) {
        H();
        var t = Br(), { printDanglingComments: s, printCommentsSeparately: i } = fn(), e = Fn(), { getNextNonSpaceNonCommentCharacterIndex: n } = kt(), { builders: { line: r, softline: o, group: c, indent: h, ifBreak: m, hardline: y, join: p, indentIfBreak: D }, utils: { removeLines: C, willBreak: w } } = mt(), { ArgExpansionBailout: P } = xr(), { getFunctionParameters: A, hasLeadingOwnLineComment: N, isFlowAnnotationComment: S, isJsxNode: j, isTemplateOnItsOwnLine: k, shouldPrintComma: J, startsWithNoLookaheadToken: f, isBinaryish: B, isLineComment: d, hasComment: F, getComments: a, CommentCheckFlags: g, isCallLikeExpression: E, isCallExpression: b, getCallArguments: x, hasNakedLeftSide: T, getLeftSide: I } = Yt(), { locEnd: $ } = Bn(), { printFunctionParameters: V, shouldGroupFunctionParameters: M } = Xr(), { printPropertyKey: U } = Nr(), { printFunctionTypeParameters: _ } = _n();
        function ee(W, ne, ue, Fe) {
          let Se = W.getValue(), we = !1;
          if ((Se.type === "FunctionDeclaration" || Se.type === "FunctionExpression") && Fe && Fe.expandLastArg) {
            let it = W.getParentNode();
            b(it) && x(it).length > 1 && (we = !0);
          }
          let He = [];
          Se.type === "TSDeclareFunction" && Se.declare && He.push("declare "), Se.async && He.push("async "), Se.generator ? He.push("function* ") : He.push("function "), Se.id && He.push(ne("id"));
          let Ft = V(W, ne, ue, we), ht = Y(W, ne, ue), Qe = M(Se, ht);
          return He.push(_(W, ue, ne), c([Qe ? c(Ft) : Ft, ht]), Se.body ? " " : "", ne("body")), ue.semi && (Se.declare || !Se.body) && He.push(";"), He;
        }
        function R(W, ne, ue) {
          let Fe = W.getNode(), { kind: Se } = Fe, we = Fe.value || Fe, He = [];
          return !Se || Se === "init" || Se === "method" || Se === "constructor" ? we.async && He.push("async ") : (t.ok(Se === "get" || Se === "set"), He.push(Se, " ")), we.generator && He.push("*"), He.push(U(W, ne, ue), Fe.optional || Fe.key.optional ? "?" : ""), Fe === we ? He.push(O(W, ne, ue)) : we.type === "FunctionExpression" ? He.push(W.call((Ft) => O(Ft, ne, ue), "value")) : He.push(ue("value")), He;
        }
        function O(W, ne, ue) {
          let Fe = W.getNode(), Se = V(W, ue, ne), we = Y(W, ue, ne), He = M(Fe, we), Ft = [_(W, ne, ue), c([He ? c(Se) : Se, we])];
          return Fe.body ? Ft.push(" ", ue("body")) : Ft.push(ne.semi ? ";" : ""), Ft;
        }
        function Z(W, ne, ue, Fe) {
          let Se = W.getValue(), we = [];
          if (Se.async && we.push("async "), q(W, ne))
            we.push(ue(["params", 0]));
          else {
            let Ft = Fe && (Fe.expandLastArg || Fe.expandFirstArg), ht = Y(W, ue, ne);
            if (Ft) {
              if (w(ht))
                throw new P();
              ht = c(C(ht));
            }
            we.push(c([V(W, ue, ne, Ft, !0), ht]));
          }
          let He = s(W, ne, !0, (Ft) => {
            let ht = n(ne.originalText, Ft, $);
            return ht !== !1 && ne.originalText.slice(ht, ht + 2) === "=>";
          });
          return He && we.push(" ", He), we;
        }
        function oe(W, ne, ue, Fe, Se, we) {
          let He = W.getName(), Ft = W.getParentNode(), ht = E(Ft) && He === "callee", Qe = Boolean(ne && ne.assignmentLayout), it = we.body.type !== "BlockStatement" && we.body.type !== "ObjectExpression" && we.body.type !== "SequenceExpression", De = ht && it || ne && ne.assignmentLayout === "chain-tail-arrow-chain", G = Symbol("arrow-chain");
          return we.body.type === "SequenceExpression" && (Se = c(["(", h([o, Se]), o, ")"])), c([c(h([ht || Qe ? o : "", c(p([" =>", r], ue), { shouldBreak: Fe })]), { id: G, shouldBreak: De }), " =>", D(it ? h([r, Se]) : [" ", Se], { groupId: G }), ht ? m(o, "", { groupId: G }) : ""]);
        }
        function te(W, ne, ue, Fe) {
          let Se = W.getValue(), we = [], He = [], Ft = !1;
          if (function G() {
            let he = Z(W, ne, ue, Fe);
            if (we.length === 0)
              we.push(he);
            else {
              let { leading: K, trailing: me } = i(W, ne);
              we.push([K, he]), He.unshift(me);
            }
            Ft = Ft || Se.returnType && A(Se).length > 0 || Se.typeParameters || A(Se).some((K) => K.type !== "Identifier"), Se.body.type !== "ArrowFunctionExpression" || Fe && Fe.expandLastArg ? He.unshift(ue("body", Fe)) : (Se = Se.body, W.call(G, "body"));
          }(), we.length > 1)
            return oe(W, Fe, we, Ft, He, Se);
          let ht = we;
          if (ht.push(" =>"), !N(ne.originalText, Se.body) && (Se.body.type === "ArrayExpression" || Se.body.type === "ObjectExpression" || Se.body.type === "BlockStatement" || j(Se.body) || k(Se.body, ne.originalText) || Se.body.type === "ArrowFunctionExpression" || Se.body.type === "DoExpression"))
            return c([...ht, " ", He]);
          if (Se.body.type === "SequenceExpression")
            return c([...ht, c([" (", h([o, He]), o, ")"])]);
          let Qe = (Fe && Fe.expandLastArg || W.getParentNode().type === "JSXExpressionContainer") && !F(Se), it = Fe && Fe.expandLastArg && J(ne, "all"), De = Se.body.type === "ConditionalExpression" && !f(Se.body, (G) => G.type === "ObjectExpression");
          return c([...ht, c([h([r, De ? m("", "(") : "", He, De ? m("", ")") : ""]), Qe ? [m(it ? "," : ""), o] : ""])]);
        }
        function Ee(W) {
          let ne = A(W);
          return ne.length === 1 && !W.typeParameters && !F(W, g.Dangling) && ne[0].type === "Identifier" && !ne[0].typeAnnotation && !F(ne[0]) && !ne[0].optional && !W.predicate && !W.returnType;
        }
        function q(W, ne) {
          if (ne.arrowParens === "always")
            return !1;
          if (ne.arrowParens === "avoid") {
            let ue = W.getValue();
            return Ee(ue);
          }
          return !1;
        }
        function Y(W, ne, ue) {
          let Fe = W.getValue(), Se = ne("returnType");
          if (Fe.returnType && S(ue.originalText, Fe.returnType))
            return [" /*: ", Se, " */"];
          let we = [Se];
          return Fe.returnType && Fe.returnType.typeAnnotation && we.unshift(": "), Fe.predicate && we.push(Fe.returnType ? " " : ": ", ne("predicate")), we;
        }
        function ge(W, ne, ue) {
          let Fe = W.getValue(), Se = ne.semi ? ";" : "", we = [];
          Fe.argument && (Q(ne, Fe.argument) ? we.push([" (", h([y, ue("argument")]), y, ")"]) : B(Fe.argument) || Fe.argument.type === "SequenceExpression" ? we.push(c([m(" (", " "), h([o, ue("argument")]), o, m(")")])) : we.push(" ", ue("argument")));
          let He = a(Fe), Ft = e(He), ht = Ft && d(Ft);
          return ht && we.push(Se), F(Fe, g.Dangling) && we.push(" ", s(W, ne, !0)), ht || we.push(Se), we;
        }
        function ye(W, ne, ue) {
          return ["return", ge(W, ne, ue)];
        }
        function Le(W, ne, ue) {
          return ["throw", ge(W, ne, ue)];
        }
        function Q(W, ne) {
          if (N(W.originalText, ne))
            return !0;
          if (T(ne)) {
            let ue = ne, Fe;
            for (; Fe = I(ue); )
              if (ue = Fe, N(W.originalText, ue))
                return !0;
          }
          return !1;
        }
        l.exports = { printFunction: ee, printArrowFunction: te, printMethod: R, printReturnStatement: ye, printThrowStatement: Le, printMethodInternal: O, shouldPrintParamsWithoutParens: q };
      } }), Cu = X({ "src/language-js/print/decorators.js"(u, l) {
        H();
        var { isNonEmptyArray: t, hasNewline: s } = kt(), { builders: { line: i, hardline: e, join: n, breakParent: r, group: o } } = mt(), { locStart: c, locEnd: h } = Bn(), { getParentExportDeclaration: m } = Yt();
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
        var { isNonEmptyArray: t, createGroupIdMapper: s } = kt(), { printComments: i, printDanglingComments: e } = fn(), { builders: { join: n, line: r, hardline: o, softline: c, group: h, indent: m, ifBreak: y } } = mt(), { hasComment: p, CommentCheckFlags: D } = Yt(), { getTypeParametersGroupId: C } = zr(), { printMethod: w } = Yr(), { printOptionalToken: P, printTypeAnnotation: A, printDefiniteToken: N } = _n(), { printPropertyKey: S } = Nr(), { printAssignment: j } = wr(), { printClassMemberDecorators: k } = Cu();
        function J(x, T, I) {
          let $ = x.getValue(), V = [];
          $.declare && V.push("declare "), $.abstract && V.push("abstract "), V.push("class");
          let M = $.id && p($.id, D.Trailing) || $.typeParameters && p($.typeParameters, D.Trailing) || $.superClass && p($.superClass) || t($.extends) || t($.mixins) || t($.implements), U = [], _ = [];
          if ($.id && U.push(" ", I("id")), U.push(I("typeParameters")), $.superClass) {
            let ee = [g(x, T, I), I("superTypeParameters")], R = x.call((O) => ["extends ", i(O, ee, T)], "superClass");
            M ? _.push(r, h(R)) : _.push(" ", R);
          } else
            _.push(a(x, T, I, "extends"));
          if (_.push(a(x, T, I, "mixins"), a(x, T, I, "implements")), M) {
            let ee;
            F($) ? ee = [...U, m(_)] : ee = m([...U, _]), V.push(h(ee, { id: f($) }));
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
        function a(x, T, I, $) {
          let V = x.getValue();
          if (!t(V[$]))
            return "";
          let M = e(x, T, !0, (U) => {
            let { marker: _ } = U;
            return _ === $;
          });
          return [F(V) ? y(" ", r, { groupId: C(V.typeParameters) }) : r, M, M && o, $, h(m([r, n([",", r], x.map(I, $))]))];
        }
        function g(x, T, I) {
          let $ = I("superClass");
          return x.getParentNode().type === "AssignmentExpression" ? h(y(["(", m([c, $]), c, ")"], $)) : $;
        }
        function E(x, T, I) {
          let $ = x.getValue(), V = [];
          return t($.decorators) && V.push(k(x, T, I)), $.accessibility && V.push($.accessibility + " "), $.readonly && V.push("readonly "), $.declare && V.push("declare "), $.static && V.push("static "), ($.type === "TSAbstractMethodDefinition" || $.abstract) && V.push("abstract "), $.override && V.push("override "), V.push(w(x, T, I)), V;
        }
        function b(x, T, I) {
          let $ = x.getValue(), V = [], M = T.semi ? ";" : "";
          return t($.decorators) && V.push(k(x, T, I)), $.accessibility && V.push($.accessibility + " "), $.declare && V.push("declare "), $.static && V.push("static "), ($.type === "TSAbstractPropertyDefinition" || $.type === "TSAbstractAccessorProperty" || $.abstract) && V.push("abstract "), $.override && V.push("override "), $.readonly && V.push("readonly "), $.variance && V.push(I("variance")), ($.type === "ClassAccessorProperty" || $.type === "AccessorProperty" || $.type === "TSAbstractAccessorProperty") && V.push("accessor "), V.push(S(x, T, I), P(x), N(x), A(x, T, I)), [j(x, T, I, V, " =", "value"), M];
        }
        l.exports = { printClass: J, printClassMethod: E, printClassProperty: b, printHardlineAfterHeritage: B };
      } }), Si = X({ "src/language-js/print/interface.js"(u, l) {
        H();
        var { isNonEmptyArray: t } = kt(), { builders: { join: s, line: i, group: e, indent: n, ifBreak: r } } = mt(), { hasComment: o, identity: c, CommentCheckFlags: h } = Yt(), { getTypeParametersGroupId: m } = zr(), { printTypeScriptModifiers: y } = _n();
        function p(D, C, w) {
          let P = D.getValue(), A = [];
          P.declare && A.push("declare "), P.type === "TSInterfaceDeclaration" && A.push(P.abstract ? "abstract " : "", y(D, C, w)), A.push("interface");
          let N = [], S = [];
          P.type !== "InterfaceTypeAnnotation" && N.push(" ", w("id"), w("typeParameters"));
          let j = P.typeParameters && !o(P.typeParameters, h.Trailing | h.Line);
          return t(P.extends) && S.push(j ? r(" ", i, { groupId: m(P.typeParameters) }) : i, "extends ", (P.extends.length === 1 ? c : n)(s([",", i], D.map(w, "extends")))), P.id && o(P.id, h.Trailing) || t(P.extends) ? j ? A.push(e([...N, n(S)])) : A.push(e(n([...N, ...S]))) : A.push(...N, ...S), A.push(" ", w("body")), e(A);
        }
        l.exports = { printInterface: p };
      } }), Bi = X({ "src/language-js/print/module.js"(u, l) {
        H();
        var { isNonEmptyArray: t } = kt(), { builders: { softline: s, group: i, indent: e, join: n, line: r, ifBreak: o, hardline: c } } = mt(), { printDanglingComments: h } = fn(), { hasComment: m, CommentCheckFlags: y, shouldPrintComma: p, needsHardlineAfterDanglingComment: D, isStringLiteral: C, rawText: w } = Yt(), { locStart: P, hasSameLoc: A } = Bn(), { hasDecoratorsBeforeExport: N, printDecoratorsBeforeExport: S } = Cu();
        function j(b, x, T) {
          let I = b.getValue(), $ = x.semi ? ";" : "", V = [], { importKind: M } = I;
          return V.push("import"), M && M !== "value" && V.push(" ", M), V.push(d(b, x, T), B(b, x, T), a(b, x, T), $), V;
        }
        function k(b, x, T) {
          let I = b.getValue(), $ = [];
          N(I) && $.push(S(b, x, T));
          let { type: V, exportKind: M, declaration: U } = I;
          return $.push("export"), (I.default || V === "ExportDefaultDeclaration") && $.push(" default"), m(I, y.Dangling) && ($.push(" ", h(b, x, !0)), D(I) && $.push(c)), U ? $.push(" ", T("declaration")) : $.push(M === "type" ? " type" : "", d(b, x, T), B(b, x, T), a(b, x, T)), f(I, x) && $.push(";"), $;
        }
        function J(b, x, T) {
          let I = b.getValue(), $ = x.semi ? ";" : "", V = [], { exportKind: M, exported: U } = I;
          return V.push("export"), M === "type" && V.push(" type"), V.push(" *"), U && V.push(" as ", T("exported")), V.push(B(b, x, T), a(b, x, T), $), V;
        }
        function f(b, x) {
          if (!x.semi)
            return !1;
          let { type: T, declaration: I } = b, $ = b.default || T === "ExportDefaultDeclaration";
          if (!I)
            return !0;
          let { type: V } = I;
          return !!($ && V !== "ClassDeclaration" && V !== "FunctionDeclaration" && V !== "TSInterfaceDeclaration" && V !== "DeclareClass" && V !== "DeclareFunction" && V !== "TSDeclareFunction" && V !== "EnumDeclaration");
        }
        function B(b, x, T) {
          let I = b.getValue();
          if (!I.source)
            return "";
          let $ = [];
          return F(I, x) || $.push(" from"), $.push(" ", T("source")), $;
        }
        function d(b, x, T) {
          let I = b.getValue();
          if (F(I, x))
            return "";
          let $ = [" "];
          if (t(I.specifiers)) {
            let V = [], M = [];
            b.each(() => {
              let U = b.getValue().type;
              if (U === "ExportNamespaceSpecifier" || U === "ExportDefaultSpecifier" || U === "ImportNamespaceSpecifier" || U === "ImportDefaultSpecifier")
                V.push(T());
              else if (U === "ExportSpecifier" || U === "ImportSpecifier")
                M.push(T());
              else
                throw new Error(`Unknown specifier type ${JSON.stringify(U)}`);
            }, "specifiers"), $.push(n(", ", V)), M.length > 0 && (V.length > 0 && $.push(", "), M.length > 1 || V.length > 0 || I.specifiers.some((U) => m(U)) ? $.push(i(["{", e([x.bracketSpacing ? r : s, n([",", r], M)]), o(p(x) ? "," : ""), x.bracketSpacing ? r : s, "}"])) : $.push(["{", x.bracketSpacing ? " " : "", ...M, x.bracketSpacing ? " " : "", "}"]));
          } else
            $.push("{}");
          return $;
        }
        function F(b, x) {
          let { type: T, importKind: I, source: $, specifiers: V } = b;
          return T !== "ImportDeclaration" || t(V) || I === "type" ? !1 : !/{\s*}/.test(x.originalText.slice(P(b), P($)));
        }
        function a(b, x, T) {
          let I = b.getNode();
          return t(I.assertions) ? [" assert {", x.bracketSpacing ? " " : "", n(", ", b.map(T, "assertions")), x.bracketSpacing ? " " : "", "}"] : "";
        }
        function g(b, x, T) {
          let I = b.getNode(), { type: $ } = I, V = [], M = $ === "ImportSpecifier" ? I.importKind : I.exportKind;
          M && M !== "value" && V.push(M, " ");
          let U = $.startsWith("Import"), _ = U ? "imported" : "local", ee = U ? "local" : "exported", R = I[_], O = I[ee], Z = "", oe = "";
          return $ === "ExportNamespaceSpecifier" || $ === "ImportNamespaceSpecifier" ? Z = "*" : R && (Z = T(_)), O && !E(I) && (oe = T(ee)), V.push(Z, Z && oe ? " as " : "", oe), V;
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
      } }), Fu = X({ "src/language-js/print/object.js"(u, l) {
        H();
        var { printDanglingComments: t } = fn(), { builders: { line: s, softline: i, group: e, indent: n, ifBreak: r, hardline: o } } = mt(), { getLast: c, hasNewlineInRange: h, hasNewline: m, isNonEmptyArray: y } = kt(), { shouldPrintComma: p, hasComment: D, getComments: C, CommentCheckFlags: w, isNextLineEmpty: P } = Yt(), { locStart: A, locEnd: N } = Bn(), { printOptionalToken: S, printTypeAnnotation: j } = _n(), { shouldHugFunctionParameters: k } = Xr(), { shouldHugType: J } = Ur(), { printHardlineAfterHeritage: f } = kr();
        function B(d, F, a) {
          let g = F.semi ? ";" : "", E = d.getValue(), b;
          E.type === "TSTypeLiteral" ? b = "members" : E.type === "TSInterfaceBody" ? b = "body" : b = "properties";
          let x = E.type === "ObjectTypeAnnotation", T = [b];
          x && T.push("indexers", "callProperties", "internalSlots");
          let I = T.map((q) => E[q][0]).sort((q, Y) => A(q) - A(Y))[0], $ = d.getParentNode(0), V = x && $ && ($.type === "InterfaceDeclaration" || $.type === "DeclareInterface" || $.type === "DeclareClass") && d.getName() === "body", M = E.type === "TSInterfaceBody" || V || E.type === "ObjectPattern" && $.type !== "FunctionDeclaration" && $.type !== "FunctionExpression" && $.type !== "ArrowFunctionExpression" && $.type !== "ObjectMethod" && $.type !== "ClassMethod" && $.type !== "ClassPrivateMethod" && $.type !== "AssignmentPattern" && $.type !== "CatchClause" && E.properties.some((q) => q.value && (q.value.type === "ObjectPattern" || q.value.type === "ArrayPattern")) || E.type !== "ObjectPattern" && I && h(F.originalText, A(E), A(I)), U = V ? ";" : E.type === "TSInterfaceBody" || E.type === "TSTypeLiteral" ? r(g, ";") : ",", _ = E.type === "RecordExpression" ? "#{" : E.exact ? "{|" : "{", ee = E.exact ? "|}" : "}", R = [];
          for (let q of T)
            d.each((Y) => {
              let ge = Y.getValue();
              R.push({ node: ge, printed: a(), loc: A(ge) });
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
          let oe = c(E[b]), te = !(E.inexact || oe && oe.type === "RestElement" || oe && (oe.type === "TSPropertySignature" || oe.type === "TSCallSignatureDeclaration" || oe.type === "TSMethodSignature" || oe.type === "TSConstructSignatureDeclaration") && D(oe, w.PrettierIgnore)), Ee;
          if (Z.length === 0) {
            if (!D(E, w.Dangling))
              return [_, ee, j(d, F, a)];
            Ee = e([_, t(d, F), i, ee, S(d), j(d, F, a)]);
          } else
            Ee = [V && y(E.properties) ? f($) : "", _, n([F.bracketSpacing ? s : i, ...Z]), r(te && (U !== "," || p(F)) ? U : ""), F.bracketSpacing ? s : i, ee, S(d), j(d, F, a)];
          return d.match((q) => q.type === "ObjectPattern" && !q.decorators, (q, Y, ge) => k(q) && (Y === "params" || Y === "parameters" || Y === "this" || Y === "rest") && ge === 0) || d.match(J, (q, Y) => Y === "typeAnnotation", (q, Y) => Y === "typeAnnotation", (q, Y, ge) => k(q) && (Y === "params" || Y === "parameters" || Y === "this" || Y === "rest") && ge === 0) || !M && d.match((q) => q.type === "ObjectPattern", (q) => q.type === "AssignmentExpression" || q.type === "VariableDeclarator") ? Ee : e(Ee, { shouldBreak: M });
        }
        l.exports = { printObject: B };
      } }), Ls = X({ "src/language-js/print/flow.js"(u, l) {
        H();
        var t = Br(), { printDanglingComments: s } = fn(), { printString: i, printNumber: e } = kt(), { builders: { hardline: n, softline: r, group: o, indent: c } } = mt(), { getParentExportDeclaration: h, isFunctionNotation: m, isGetterOrSetter: y, rawText: p, shouldPrintComma: D } = Yt(), { locStart: C, locEnd: w } = Bn(), { replaceTextEndOfLine: P } = br(), { printClass: A } = kr(), { printOpaqueType: N, printTypeAlias: S, printIntersectionType: j, printUnionType: k, printFunctionType: J, printTupleType: f, printIndexedAccessType: B } = Ur(), { printInterface: d } = Si(), { printTypeParameter: F, printTypeParameters: a } = zr(), { printExportDeclaration: g, printExportAllDeclaration: E } = Bi(), { printArrayItems: b } = Tr(), { printObject: x } = Fu(), { printPropertyKey: T } = Nr(), { printOptionalToken: I, printTypeAnnotation: $, printRestSpread: V } = _n();
        function M(_, ee, R) {
          let O = _.getValue(), Z = ee.semi ? ";" : "", oe = [];
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
                let te = null;
                switch (O.type) {
                  case "EnumBooleanBody":
                    te = "boolean";
                    break;
                  case "EnumNumberBody":
                    te = "number";
                    break;
                  case "EnumStringBody":
                    te = "string";
                    break;
                  case "EnumSymbolBody":
                    te = "symbol";
                    break;
                }
                oe.push("of ", te, " ");
              }
              if (O.members.length === 0 && !O.hasUnknownMembers)
                oe.push(o(["{", s(_, ee), r, "}"]));
              else {
                let te = O.members.length > 0 ? [n, b(_, ee, "members", R), O.hasUnknownMembers || D(ee) ? "," : ""] : [];
                oe.push(o(["{", c([...te, ...O.hasUnknownMembers ? [n, "..."] : []]), s(_, ee, !0), n, "}"]));
              }
              return oe;
            }
            case "EnumBooleanMember":
            case "EnumNumberMember":
            case "EnumStringMember":
              return [R("id"), " = ", typeof O.init == "object" ? R("init") : String(O.init)];
            case "EnumDefaultedMember":
              return R("id");
            case "FunctionTypeParam": {
              let te = O.name ? R("name") : _.getParentNode().this === O ? "this" : "";
              return [te, I(_), te ? ": " : "", R("typeAnnotation")];
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
              let { kind: te } = O;
              return t.ok(te === "plus" || te === "minus"), te === "plus" ? "+" : "-";
            }
            case "ObjectTypeCallProperty":
              return O.static && oe.push("static "), oe.push(R("value")), oe;
            case "ObjectTypeIndexer":
              return [O.static ? "static " : "", O.variance ? R("variance") : "", "[", R("id"), O.id ? ": " : "", R("key"), "]: ", R("value")];
            case "ObjectTypeProperty": {
              let te = "";
              return O.proto ? te = "proto " : O.static && (te = "static "), [te, y(O) ? O.kind + " " : "", O.variance ? R("variance") : "", T(_, ee, R), I(_), m(O) ? "" : ": ", R("value")];
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
              return ["(", R("expression"), $(_, ee, R), ")"];
            case "TypeParameterDeclaration":
            case "TypeParameterInstantiation": {
              let te = a(_, ee, R, "params");
              if (ee.parser === "flow") {
                let Ee = C(O), q = w(O), Y = ee.originalText.lastIndexOf("/*", Ee), ge = ee.originalText.indexOf("*/", q);
                if (Y !== -1 && ge !== -1) {
                  let ye = ee.originalText.slice(Y + 2, ge).trim();
                  if (ye.startsWith("::") && !ye.includes("/*") && !ye.includes("*/"))
                    return ["/*:: ", te, " */"];
                }
              }
              return te;
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
        l.exports = { printFlow: M };
      } }), Os = X({ "src/language-js/utils/is-ts-keyword-type.js"(u, l) {
        H();
        function t(s) {
          let { type: i } = s;
          return i.startsWith("TS") && i.endsWith("Keyword");
        }
        l.exports = t;
      } }), Ti = X({ "src/language-js/print/ternary.js"(u, l) {
        H();
        var { hasNewlineInRange: t } = kt(), { isJsxNode: s, getComments: i, isCallExpression: e, isMemberExpression: n, isTSTypeExpression: r } = Yt(), { locStart: o, locEnd: c } = Bn(), h = cr(), { builders: { line: m, softline: y, group: p, indent: D, align: C, ifBreak: w, dedent: P, breakParent: A } } = mt();
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
          let F = f.getValue(), a = F.type === "ConditionalExpression", g = a ? "consequent" : "trueType", E = a ? "alternate" : "falseType", b = a ? ["test"] : ["checkType", "extendsType"], x = F[g], T = F[E], I = [], $ = !1, V = f.getParentNode(), M = V.type === F.type && b.some((ge) => V[ge] === F), U = V.type === F.type && !M, _, ee, R = 0;
          do
            ee = _ || F, _ = f.getParentNode(R), R++;
          while (_ && _.type === F.type && b.every((ge) => _[ge] !== ee));
          let O = _ || V, Z = ee;
          if (a && (s(F[b[0]]) || s(x) || s(T) || N(Z))) {
            $ = !0, U = !0;
            let ge = (Le) => [w("("), D([y, Le]), y, w(")")], ye = (Le) => Le.type === "NullLiteral" || Le.type === "Literal" && Le.value === null || Le.type === "Identifier" && Le.name === "undefined";
            I.push(" ? ", ye(x) ? d(g) : ge(d(g)), " : ", T.type === F.type || ye(T) ? d(E) : ge(d(E)));
          } else {
            let ge = [m, "? ", x.type === F.type ? w("", "(") : "", C(2, d(g)), x.type === F.type ? w("", ")") : "", m, ": ", T.type === F.type ? d(E) : C(2, d(E))];
            I.push(V.type !== F.type || V[E] === F || M ? ge : B.useTabs ? P(D(ge)) : C(Math.max(0, B.tabWidth - 2), ge));
          }
          let oe = [...b.map((ge) => i(F[ge])), i(x), i(T)].flat().some((ge) => h(ge) && t(B.originalText, o(ge), c(ge))), te = (ge) => V === O ? p(ge, { shouldBreak: oe }) : oe ? [ge, A] : ge, Ee = !$ && (n(V) || V.type === "NGPipeExpression" && V.left === F) && !V.computed, q = k(f), Y = te([S(f, B, d), U ? I : D(I), a && Ee && !q ? y : ""]);
          return M || q ? p([D([y, Y]), y]) : Y;
        }
        l.exports = { printTernary: J };
      } }), wi = X({ "src/language-js/print/statement.js"(u, l) {
        H();
        var { builders: { hardline: t } } = mt(), s = gr(), { getLeftSidePathName: i, hasNakedLeftSide: e, isJsxNode: n, isTheOnlyJsxElementInMarkdown: r, hasComment: o, CommentCheckFlags: c, isNextLineEmpty: h } = Yt(), { shouldPrintParamsWithoutParens: m } = Yr();
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
      } }), Ni = X({ "src/language-js/print/block.js"(u, l) {
        H();
        var { printDanglingComments: t } = fn(), { isNonEmptyArray: s } = kt(), { builders: { hardline: i, indent: e } } = mt(), { hasComment: n, CommentCheckFlags: r, isNextLineEmpty: o } = Yt(), { printHardlineAfterHeritage: c } = kr(), { printBody: h } = wi();
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
      } }), $s = X({ "src/language-js/print/typescript.js"(u, l) {
        H();
        var { printDanglingComments: t } = fn(), { hasNewlineInRange: s } = kt(), { builders: { join: i, line: e, hardline: n, softline: r, group: o, indent: c, conditionalGroup: h, ifBreak: m } } = mt(), { isStringLiteral: y, getTypeScriptMappedTypeModifier: p, shouldPrintComma: D, isCallExpression: C, isMemberExpression: w } = Yt(), P = Os(), { locStart: A, locEnd: N } = Bn(), { printOptionalToken: S, printTypeScriptModifiers: j } = _n(), { printTernary: k } = Ti(), { printFunctionParameters: J, shouldGroupFunctionParameters: f } = Xr(), { printTemplateLiteral: B } = mr(), { printArrayItems: d } = Tr(), { printObject: F } = Fu(), { printClassProperty: a, printClassMethod: g } = kr(), { printTypeParameter: E, printTypeParameters: b } = zr(), { printPropertyKey: x } = Nr(), { printFunction: T, printMethodInternal: I } = Yr(), { printInterface: $ } = Si(), { printBlock: V } = Ni(), { printTypeAlias: M, printIntersectionType: U, printUnionType: _, printFunctionType: ee, printTupleType: R, printIndexedAccessType: O, printJSDocType: Z } = Ur();
        function oe(te, Ee, q) {
          let Y = te.getValue();
          if (!Y.type.startsWith("TS"))
            return;
          if (P(Y))
            return Y.type.slice(2, -7).toLowerCase();
          let ge = Ee.semi ? ";" : "", ye = [];
          switch (Y.type) {
            case "TSThisType":
              return "this";
            case "TSTypeAssertion": {
              let Le = !(Y.expression.type === "ArrayExpression" || Y.expression.type === "ObjectExpression"), Q = o(["<", c([r, q("typeAnnotation")]), r, ">"]), W = [m("("), c([r, q("expression")]), r, m(")")];
              return Le ? h([[Q, q("expression")], [Q, o(W, { shouldBreak: !0 })], [Q, q("expression")]]) : o([Q, q("expression")]);
            }
            case "TSDeclareFunction":
              return T(te, q, Ee);
            case "TSExportAssignment":
              return ["export = ", q("expression"), ge];
            case "TSModuleBlock":
              return V(te, Ee, q);
            case "TSInterfaceBody":
            case "TSTypeLiteral":
              return F(te, Ee, q);
            case "TSTypeAliasDeclaration":
              return M(te, Ee, q);
            case "TSQualifiedName":
              return i(".", [q("left"), q("right")]);
            case "TSAbstractMethodDefinition":
            case "TSDeclareMethod":
              return g(te, Ee, q);
            case "TSAbstractAccessorProperty":
            case "TSAbstractPropertyDefinition":
              return a(te, Ee, q);
            case "TSInterfaceHeritage":
            case "TSExpressionWithTypeArguments":
              return ye.push(q("expression")), Y.typeParameters && ye.push(q("typeParameters")), ye;
            case "TSTemplateLiteralType":
              return B(te, q, Ee);
            case "TSNamedTupleMember":
              return [q("label"), Y.optional ? "?" : "", ": ", q("elementType")];
            case "TSRestType":
              return ["...", q("typeAnnotation")];
            case "TSOptionalType":
              return [q("typeAnnotation"), "?"];
            case "TSInterfaceDeclaration":
              return $(te, Ee, q);
            case "TSClassImplements":
              return [q("expression"), q("typeParameters")];
            case "TSTypeParameterDeclaration":
            case "TSTypeParameterInstantiation":
              return b(te, Ee, q, "params");
            case "TSTypeParameter":
              return E(te, Ee, q);
            case "TSSatisfiesExpression":
            case "TSAsExpression": {
              let Le = Y.type === "TSAsExpression" ? "as" : "satisfies";
              ye.push(q("expression"), ` ${Le} `, q("typeAnnotation"));
              let Q = te.getParentNode();
              return C(Q) && Q.callee === Y || w(Q) && Q.object === Y ? o([c([r, ...ye]), r]) : ye;
            }
            case "TSArrayType":
              return [q("elementType"), "[]"];
            case "TSPropertySignature":
              return Y.readonly && ye.push("readonly "), ye.push(x(te, Ee, q), S(te)), Y.typeAnnotation && ye.push(": ", q("typeAnnotation")), Y.initializer && ye.push(" = ", q("initializer")), ye;
            case "TSParameterProperty":
              return Y.accessibility && ye.push(Y.accessibility + " "), Y.export && ye.push("export "), Y.static && ye.push("static "), Y.override && ye.push("override "), Y.readonly && ye.push("readonly "), ye.push(q("parameter")), ye;
            case "TSTypeQuery":
              return ["typeof ", q("exprName"), q("typeParameters")];
            case "TSIndexSignature": {
              let Le = te.getParentNode(), Q = Y.parameters.length > 1 ? m(D(Ee) ? "," : "") : "", W = o([c([r, i([", ", r], te.map(q, "parameters"))]), Q, r]);
              return [Y.export ? "export " : "", Y.accessibility ? [Y.accessibility, " "] : "", Y.static ? "static " : "", Y.readonly ? "readonly " : "", Y.declare ? "declare " : "", "[", Y.parameters ? W : "", Y.typeAnnotation ? "]: " : "]", Y.typeAnnotation ? q("typeAnnotation") : "", Le.type === "ClassBody" ? ge : ""];
            }
            case "TSTypePredicate":
              return [Y.asserts ? "asserts " : "", q("parameterName"), Y.typeAnnotation ? [" is ", q("typeAnnotation")] : ""];
            case "TSNonNullExpression":
              return [q("expression"), "!"];
            case "TSImportType":
              return [Y.isTypeOf ? "typeof " : "", "import(", q(Y.parameter ? "parameter" : "argument"), ")", Y.qualifier ? [".", q("qualifier")] : "", b(te, Ee, q, "typeParameters")];
            case "TSLiteralType":
              return q("literal");
            case "TSIndexedAccessType":
              return O(te, Ee, q);
            case "TSConstructSignatureDeclaration":
            case "TSCallSignatureDeclaration":
            case "TSConstructorType": {
              if (Y.type === "TSConstructorType" && Y.abstract && ye.push("abstract "), Y.type !== "TSCallSignatureDeclaration" && ye.push("new "), ye.push(o(J(te, q, Ee, !1, !0))), Y.returnType || Y.typeAnnotation) {
                let Le = Y.type === "TSConstructorType";
                ye.push(Le ? " => " : ": ", q("returnType"), q("typeAnnotation"));
              }
              return ye;
            }
            case "TSTypeOperator":
              return [Y.operator, " ", q("typeAnnotation")];
            case "TSMappedType": {
              let Le = s(Ee.originalText, A(Y), N(Y));
              return o(["{", c([Ee.bracketSpacing ? e : r, q("typeParameter"), Y.optional ? p(Y.optional, "?") : "", Y.typeAnnotation ? ": " : "", q("typeAnnotation"), m(ge)]), t(te, Ee, !0), Ee.bracketSpacing ? e : r, "}"], { shouldBreak: Le });
            }
            case "TSMethodSignature": {
              let Le = Y.kind && Y.kind !== "method" ? `${Y.kind} ` : "";
              ye.push(Y.accessibility ? [Y.accessibility, " "] : "", Le, Y.export ? "export " : "", Y.static ? "static " : "", Y.readonly ? "readonly " : "", Y.abstract ? "abstract " : "", Y.declare ? "declare " : "", Y.computed ? "[" : "", q("key"), Y.computed ? "]" : "", S(te));
              let Q = J(te, q, Ee, !1, !0), W = Y.returnType ? "returnType" : "typeAnnotation", ne = Y[W], ue = ne ? q(W) : "", Fe = f(Y, ue);
              return ye.push(Fe ? o(Q) : Q), ne && ye.push(": ", o(ue)), o(ye);
            }
            case "TSNamespaceExportDeclaration":
              return ye.push("export as namespace ", q("id")), Ee.semi && ye.push(";"), o(ye);
            case "TSEnumDeclaration":
              return Y.declare && ye.push("declare "), Y.modifiers && ye.push(j(te, Ee, q)), Y.const && ye.push("const "), ye.push("enum ", q("id"), " "), Y.members.length === 0 ? ye.push(o(["{", t(te, Ee), r, "}"])) : ye.push(o(["{", c([n, d(te, Ee, "members", q), D(Ee, "es5") ? "," : ""]), t(te, Ee, !0), n, "}"])), ye;
            case "TSEnumMember":
              return Y.computed ? ye.push("[", q("id"), "]") : ye.push(q("id")), Y.initializer && ye.push(" = ", q("initializer")), ye;
            case "TSImportEqualsDeclaration":
              return Y.isExport && ye.push("export "), ye.push("import "), Y.importKind && Y.importKind !== "value" && ye.push(Y.importKind, " "), ye.push(q("id"), " = ", q("moduleReference")), Ee.semi && ye.push(";"), o(ye);
            case "TSExternalModuleReference":
              return ["require(", q("expression"), ")"];
            case "TSModuleDeclaration": {
              let Le = te.getParentNode(), Q = y(Y.id), W = Le.type === "TSModuleDeclaration", ne = Y.body && Y.body.type === "TSModuleDeclaration";
              if (W)
                ye.push(".");
              else {
                Y.declare && ye.push("declare "), ye.push(j(te, Ee, q));
                let ue = Ee.originalText.slice(A(Y), A(Y.id));
                Y.id.type === "Identifier" && Y.id.name === "global" && !/namespace|module/.test(ue) || ye.push(Q || /(?:^|\s)module(?:\s|$)/.test(ue) ? "module " : "namespace ");
              }
              return ye.push(q("id")), ne ? ye.push(q("body")) : Y.body ? ye.push(" ", o(q("body"))) : ye.push(ge), ye;
            }
            case "TSConditionalType":
              return k(te, Ee, q);
            case "TSInferType":
              return ["infer", " ", q("typeParameter")];
            case "TSIntersectionType":
              return U(te, Ee, q);
            case "TSUnionType":
              return _(te, Ee, q);
            case "TSFunctionType":
              return ee(te, Ee, q);
            case "TSTupleType":
              return R(te, Ee, q);
            case "TSTypeReference":
              return [q("typeName"), b(te, Ee, q, "typeParameters")];
            case "TSTypeAnnotation":
              return q("typeAnnotation");
            case "TSEmptyBodyFunctionExpression":
              return I(te, Ee, q);
            case "TSJSDocAllType":
              return "*";
            case "TSJSDocUnknownType":
              return "?";
            case "TSJSDocNullableType":
              return Z(te, q, "?");
            case "TSJSDocNonNullableType":
              return Z(te, q, "!");
            case "TSInstantiationExpression":
              return [q("expression"), q("typeParameters")];
            default:
              throw new Error(`Unknown TypeScript node type: ${JSON.stringify(Y.type)}.`);
          }
        }
        l.exports = { printTypescript: oe };
      } }), Ms = X({ "src/language-js/print/comment.js"(u, l) {
        H();
        var { hasNewline: t } = kt(), { builders: { join: s, hardline: i }, utils: { replaceTextEndOfLine: e } } = mt(), { isLineComment: n } = Yt(), { locStart: r, locEnd: o } = Bn(), c = cr();
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
      } }), Rs = X({ "src/language-js/print/literal.js"(u, l) {
        H();
        var { printString: t, printNumber: s } = kt(), { replaceTextEndOfLine: i } = br(), { printDirective: e } = _n();
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
      } }), Vs = X({ "src/language-js/printer-estree.js"(u, l) {
        H();
        var { printDanglingComments: t } = fn(), { hasNewline: s } = kt(), { builders: { join: i, line: e, hardline: n, softline: r, group: o, indent: c }, utils: { replaceTextEndOfLine: h } } = mt(), m = As(), y = vs(), { insertPragma: p } = Ci(), D = Fi(), C = gr(), w = Ai(), { hasFlowShorthandAnnotationComment: P, hasComment: A, CommentCheckFlags: N, isTheOnlyJsxElementInMarkdown: S, isLineComment: j, isNextLineEmpty: k, needsHardlineAfterDanglingComment: J, hasIgnoreComment: f, isCallExpression: B, isMemberExpression: d, markerForIfWithoutBlockAndSameLineComment: F } = Yt(), { locStart: a, locEnd: g } = Bn(), E = cr(), { printHtmlBinding: b, isVueEventBindingExpression: x } = Ps(), { printAngular: T } = js(), { printJsx: I, hasJsxIgnoreComment: $ } = Is(), { printFlow: V } = Ls(), { printTypescript: M } = $s(), { printOptionalToken: U, printBindExpressionCallee: _, printTypeAnnotation: ee, adjustClause: R, printRestSpread: O, printDefiniteToken: Z, printDirective: oe } = _n(), { printImportDeclaration: te, printExportDeclaration: Ee, printExportAllDeclaration: q, printModuleSpecifier: Y } = Bi(), { printTernary: ge } = Ti(), { printTemplateLiteral: ye } = mr(), { printArray: Le } = Tr(), { printObject: Q } = Fu(), { printClass: W, printClassMethod: ne, printClassProperty: ue } = kr(), { printProperty: Fe } = Nr(), { printFunction: Se, printArrowFunction: we, printMethod: He, printReturnStatement: Ft, printThrowStatement: ht } = Yr(), { printCallExpression: Qe } = xi(), { printVariableDeclarator: it, printAssignmentExpression: De } = wr(), { printBinaryishExpression: G } = Eu(), { printSwitchCaseConsequent: he } = wi(), { printMemberExpression: K } = bi(), { printBlock: me, printBlockBody: Je } = Ni(), { printComment: _e } = Ms(), { printLiteral: Ce } = Rs(), { printDecorators: v } = Cu();
        function z(je, Ke, Ne, en) {
          let Xe = le(je, Ke, Ne, en);
          if (!Xe)
            return "";
          let Qt = je.getValue(), { type: We } = Qt;
          if (We === "ClassMethod" || We === "ClassPrivateMethod" || We === "ClassProperty" || We === "ClassAccessorProperty" || We === "AccessorProperty" || We === "TSAbstractAccessorProperty" || We === "PropertyDefinition" || We === "TSAbstractPropertyDefinition" || We === "ClassPrivateProperty" || We === "MethodDefinition" || We === "TSAbstractMethodDefinition" || We === "TSDeclareMethod")
            return Xe;
          let lt = [Xe], Ct = v(je, Ke, Ne), Wt = Qt.type === "ClassExpression" && Ct;
          if (Ct && (lt = [...Ct, Xe], !Wt))
            return o(lt);
          if (!C(je, Ke))
            return en && en.needsSemi && lt.unshift(";"), lt.length === 1 && lt[0] === Xe ? Xe : lt;
          if (Wt && (lt = [c([e, ...lt])]), lt.unshift("("), en && en.needsSemi && lt.unshift(";"), P(Qt)) {
            let [Ue] = Qt.trailingComments;
            lt.push(" /*", Ue.value.trimStart(), "*/"), Ue.printed = !0;
          }
          return Wt && lt.push(e), lt.push(")"), lt;
        }
        function le(je, Ke, Ne, en) {
          let Xe = je.getValue(), Qt = Ke.semi ? ";" : "";
          if (!Xe)
            return "";
          if (typeof Xe == "string")
            return Xe;
          for (let lt of [Ce, b, T, I, V, M]) {
            let Ct = lt(je, Ke, Ne);
            if (typeof Ct < "u")
              return Ct;
          }
          let We = [];
          switch (Xe.type) {
            case "JsExpressionRoot":
              return Ne("node");
            case "JsonRoot":
              return [Ne("node"), n];
            case "File":
              return Xe.program && Xe.program.interpreter && We.push(Ne(["program", "interpreter"])), We.push(Ne("program")), We;
            case "Program":
              return Je(je, Ke, Ne);
            case "EmptyStatement":
              return "";
            case "ExpressionStatement": {
              if (Ke.parser === "__vue_event_binding" || Ke.parser === "__vue_ts_event_binding") {
                let Ct = je.getParentNode();
                if (Ct.type === "Program" && Ct.body.length === 1 && Ct.body[0] === Xe)
                  return [Ne("expression"), x(Xe.expression) ? ";" : ""];
              }
              let lt = t(je, Ke, !0, (Ct) => {
                let { marker: Wt } = Ct;
                return Wt === F;
              });
              return [Ne("expression"), S(Ke, je) ? "" : Qt, lt ? [" ", lt] : ""];
            }
            case "ParenthesizedExpression":
              return !A(Xe.expression) && (Xe.expression.type === "ObjectExpression" || Xe.expression.type === "ArrayExpression") ? ["(", Ne("expression"), ")"] : o(["(", c([r, Ne("expression")]), r, ")"]);
            case "AssignmentExpression":
              return De(je, Ke, Ne);
            case "VariableDeclarator":
              return it(je, Ke, Ne);
            case "BinaryExpression":
            case "LogicalExpression":
              return G(je, Ke, Ne);
            case "AssignmentPattern":
              return [Ne("left"), " = ", Ne("right")];
            case "OptionalMemberExpression":
            case "MemberExpression":
              return K(je, Ke, Ne);
            case "MetaProperty":
              return [Ne("meta"), ".", Ne("property")];
            case "BindExpression":
              return Xe.object && We.push(Ne("object")), We.push(o(c([r, _(je, Ke, Ne)]))), We;
            case "Identifier":
              return [Xe.name, U(je), Z(je), ee(je, Ke, Ne)];
            case "V8IntrinsicIdentifier":
              return ["%", Xe.name];
            case "SpreadElement":
            case "SpreadElementPattern":
            case "SpreadProperty":
            case "SpreadPropertyPattern":
            case "RestElement":
              return O(je, Ke, Ne);
            case "FunctionDeclaration":
            case "FunctionExpression":
              return Se(je, Ne, Ke, en);
            case "ArrowFunctionExpression":
              return we(je, Ke, Ne, en);
            case "YieldExpression":
              return We.push("yield"), Xe.delegate && We.push("*"), Xe.argument && We.push(" ", Ne("argument")), We;
            case "AwaitExpression": {
              if (We.push("await"), Xe.argument) {
                We.push(" ", Ne("argument"));
                let lt = je.getParentNode();
                if (B(lt) && lt.callee === Xe || d(lt) && lt.object === Xe) {
                  We = [c([r, ...We]), r];
                  let Ct = je.findAncestor((Wt) => Wt.type === "AwaitExpression" || Wt.type === "BlockStatement");
                  if (!Ct || Ct.type !== "AwaitExpression")
                    return o(We);
                }
              }
              return We;
            }
            case "ExportDefaultDeclaration":
            case "ExportNamedDeclaration":
              return Ee(je, Ke, Ne);
            case "ExportAllDeclaration":
              return q(je, Ke, Ne);
            case "ImportDeclaration":
              return te(je, Ke, Ne);
            case "ImportSpecifier":
            case "ExportSpecifier":
            case "ImportNamespaceSpecifier":
            case "ExportNamespaceSpecifier":
            case "ImportDefaultSpecifier":
            case "ExportDefaultSpecifier":
              return Y(je, Ke, Ne);
            case "ImportAttribute":
              return [Ne("key"), ": ", Ne("value")];
            case "Import":
              return "import";
            case "BlockStatement":
            case "StaticBlock":
            case "ClassBody":
              return me(je, Ke, Ne);
            case "ThrowStatement":
              return ht(je, Ke, Ne);
            case "ReturnStatement":
              return Ft(je, Ke, Ne);
            case "NewExpression":
            case "ImportExpression":
            case "OptionalCallExpression":
            case "CallExpression":
              return Qe(je, Ke, Ne);
            case "ObjectExpression":
            case "ObjectPattern":
            case "RecordExpression":
              return Q(je, Ke, Ne);
            case "ObjectProperty":
            case "Property":
              return Xe.method || Xe.kind === "get" || Xe.kind === "set" ? He(je, Ke, Ne) : Fe(je, Ke, Ne);
            case "ObjectMethod":
              return He(je, Ke, Ne);
            case "Decorator":
              return ["@", Ne("expression")];
            case "ArrayExpression":
            case "ArrayPattern":
            case "TupleExpression":
              return Le(je, Ke, Ne);
            case "SequenceExpression": {
              let lt = je.getParentNode(0);
              if (lt.type === "ExpressionStatement" || lt.type === "ForStatement") {
                let Ct = [];
                return je.each((Wt, Ue) => {
                  Ue === 0 ? Ct.push(Ne()) : Ct.push(",", c([e, Ne()]));
                }, "expressions"), o(Ct);
              }
              return o(i([",", e], je.map(Ne, "expressions")));
            }
            case "ThisExpression":
              return "this";
            case "Super":
              return "super";
            case "Directive":
              return [Ne("value"), Qt];
            case "DirectiveLiteral":
              return oe(Xe.extra.raw, Ke);
            case "UnaryExpression":
              return We.push(Xe.operator), /[a-z]$/.test(Xe.operator) && We.push(" "), A(Xe.argument) ? We.push(o(["(", c([r, Ne("argument")]), r, ")"])) : We.push(Ne("argument")), We;
            case "UpdateExpression":
              return We.push(Ne("argument"), Xe.operator), Xe.prefix && We.reverse(), We;
            case "ConditionalExpression":
              return ge(je, Ke, Ne);
            case "VariableDeclaration": {
              let lt = je.map(Ne, "declarations"), Ct = je.getParentNode(), Wt = Ct.type === "ForStatement" || Ct.type === "ForInStatement" || Ct.type === "ForOfStatement", Ue = Xe.declarations.some((ct) => ct.init), gt;
              return lt.length === 1 && !A(Xe.declarations[0]) ? gt = lt[0] : lt.length > 0 && (gt = c(lt[0])), We = [Xe.declare ? "declare " : "", Xe.kind, gt ? [" ", gt] : "", c(lt.slice(1).map((ct) => [",", Ue && !Wt ? n : e, ct]))], Wt && Ct.body !== Xe || We.push(Qt), o(We);
            }
            case "WithStatement":
              return o(["with (", Ne("object"), ")", R(Xe.body, Ne("body"))]);
            case "IfStatement": {
              let lt = R(Xe.consequent, Ne("consequent")), Ct = o(["if (", o([c([r, Ne("test")]), r]), ")", lt]);
              if (We.push(Ct), Xe.alternate) {
                let Wt = A(Xe.consequent, N.Trailing | N.Line) || J(Xe), Ue = Xe.consequent.type === "BlockStatement" && !Wt;
                We.push(Ue ? " " : n), A(Xe, N.Dangling) && We.push(t(je, Ke, !0), Wt ? n : " "), We.push("else", o(R(Xe.alternate, Ne("alternate"), Xe.alternate.type === "IfStatement")));
              }
              return We;
            }
            case "ForStatement": {
              let lt = R(Xe.body, Ne("body")), Ct = t(je, Ke, !0), Wt = Ct ? [Ct, r] : "";
              return !Xe.init && !Xe.test && !Xe.update ? [Wt, o(["for (;;)", lt])] : [Wt, o(["for (", o([c([r, Ne("init"), ";", e, Ne("test"), ";", e, Ne("update")]), r]), ")", lt])];
            }
            case "WhileStatement":
              return o(["while (", o([c([r, Ne("test")]), r]), ")", R(Xe.body, Ne("body"))]);
            case "ForInStatement":
              return o(["for (", Ne("left"), " in ", Ne("right"), ")", R(Xe.body, Ne("body"))]);
            case "ForOfStatement":
              return o(["for", Xe.await ? " await" : "", " (", Ne("left"), " of ", Ne("right"), ")", R(Xe.body, Ne("body"))]);
            case "DoWhileStatement": {
              let lt = R(Xe.body, Ne("body"));
              return We = [o(["do", lt])], Xe.body.type === "BlockStatement" ? We.push(" ") : We.push(n), We.push("while (", o([c([r, Ne("test")]), r]), ")", Qt), We;
            }
            case "DoExpression":
              return [Xe.async ? "async " : "", "do ", Ne("body")];
            case "BreakStatement":
              return We.push("break"), Xe.label && We.push(" ", Ne("label")), We.push(Qt), We;
            case "ContinueStatement":
              return We.push("continue"), Xe.label && We.push(" ", Ne("label")), We.push(Qt), We;
            case "LabeledStatement":
              return Xe.body.type === "EmptyStatement" ? [Ne("label"), ":;"] : [Ne("label"), ": ", Ne("body")];
            case "TryStatement":
              return ["try ", Ne("block"), Xe.handler ? [" ", Ne("handler")] : "", Xe.finalizer ? [" finally ", Ne("finalizer")] : ""];
            case "CatchClause":
              if (Xe.param) {
                let lt = A(Xe.param, (Wt) => !E(Wt) || Wt.leading && s(Ke.originalText, g(Wt)) || Wt.trailing && s(Ke.originalText, a(Wt), { backwards: !0 })), Ct = Ne("param");
                return ["catch ", lt ? ["(", c([r, Ct]), r, ") "] : ["(", Ct, ") "], Ne("body")];
              }
              return ["catch ", Ne("body")];
            case "SwitchStatement":
              return [o(["switch (", c([r, Ne("discriminant")]), r, ")"]), " {", Xe.cases.length > 0 ? c([n, i(n, je.map((lt, Ct, Wt) => {
                let Ue = lt.getValue();
                return [Ne(), Ct !== Wt.length - 1 && k(Ue, Ke) ? n : ""];
              }, "cases"))]) : "", n, "}"];
            case "SwitchCase": {
              Xe.test ? We.push("case ", Ne("test"), ":") : We.push("default:"), A(Xe, N.Dangling) && We.push(" ", t(je, Ke, !0));
              let lt = Xe.consequent.filter((Ct) => Ct.type !== "EmptyStatement");
              if (lt.length > 0) {
                let Ct = he(je, Ke, Ne);
                We.push(lt.length === 1 && lt[0].type === "BlockStatement" ? [" ", Ct] : c([n, Ct]));
              }
              return We;
            }
            case "DebuggerStatement":
              return ["debugger", Qt];
            case "ClassDeclaration":
            case "ClassExpression":
              return W(je, Ke, Ne);
            case "ClassMethod":
            case "ClassPrivateMethod":
            case "MethodDefinition":
              return ne(je, Ke, Ne);
            case "ClassProperty":
            case "PropertyDefinition":
            case "ClassPrivateProperty":
            case "ClassAccessorProperty":
            case "AccessorProperty":
              return ue(je, Ke, Ne);
            case "TemplateElement":
              return h(Xe.value.raw);
            case "TemplateLiteral":
              return ye(je, Ne, Ke);
            case "TaggedTemplateExpression":
              return [Ne("tag"), Ne("typeParameters"), Ne("quasi")];
            case "PrivateIdentifier":
              return ["#", Ne("name")];
            case "PrivateName":
              return ["#", Ne("id")];
            case "InterpreterDirective":
              return We.push("#!", Xe.value, n), k(Xe, Ke) && We.push(n), We;
            case "TopicReference":
              return "%";
            case "ArgumentPlaceholder":
              return "?";
            case "ModuleExpression": {
              We.push("module {");
              let lt = Ne("body");
              return lt && We.push(c([n, lt]), n), We.push("}"), We;
            }
            default:
              throw new Error("unknown type: " + JSON.stringify(Xe.type));
          }
        }
        function Be(je) {
          return je.type && !E(je) && !j(je) && je.type !== "EmptyStatement" && je.type !== "TemplateElement" && je.type !== "Import" && je.type !== "TSEmptyBodyFunctionExpression";
        }
        l.exports = { preprocess: w, print: z, embed: m, insertPragma: p, massageAstNode: y, hasPrettierIgnore(je) {
          return f(je) || $(je);
        }, willPrintOwnComments: D.willPrintOwnComments, canAttachComment: Be, printComment: _e, isBlockComment: E, handleComments: { avoidAstMutation: !0, ownLine: D.handleOwnLineComment, endOfLine: D.handleEndOfLineComment, remaining: D.handleRemainingComment }, getCommentChildNodes: D.getCommentChildNodes };
      } }), Js = X({ "src/language-js/printer-estree-json.js"(u, l) {
        H();
        var { builders: { hardline: t, indent: s, join: i } } = mt(), e = Ai();
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
      } }), yr = X({ "src/common/common-options.js"(u, l) {
        H();
        var t = "Common";
        l.exports = { bracketSpacing: { since: "0.0.0", category: t, type: "boolean", default: !0, description: "Print spaces between brackets.", oppositeDescription: "Do not print spaces between brackets." }, singleQuote: { since: "0.0.0", category: t, type: "boolean", default: !1, description: "Use single quotes instead of double quotes." }, proseWrap: { since: "1.8.2", category: t, type: "choice", default: [{ since: "1.8.2", value: !0 }, { since: "1.9.0", value: "preserve" }], description: "How to wrap prose.", choices: [{ since: "1.9.0", value: "always", description: "Wrap prose if it exceeds the print width." }, { since: "1.9.0", value: "never", description: "Do not wrap prose." }, { since: "1.9.0", value: "preserve", description: "Wrap prose as-is." }] }, bracketSameLine: { since: "2.4.0", category: t, type: "boolean", default: !1, description: "Put > of opening tags on the last line instead of on a new line." }, singleAttributePerLine: { since: "2.6.0", category: t, type: "boolean", default: !1, description: "Enforce single attribute per line in HTML, Vue and JSX." } };
      } }), qs = X({ "src/language-js/options.js"(u, l) {
        H();
        var t = yr(), s = "JavaScript";
        l.exports = { arrowParens: { since: "1.9.0", category: s, type: "choice", default: [{ since: "1.9.0", value: "avoid" }, { since: "2.0.0", value: "always" }], description: "Include parentheses around a sole arrow function parameter.", choices: [{ value: "always", description: "Always include parens. Example: `(x) => x`" }, { value: "avoid", description: "Omit parens when possible. Example: `x => x`" }] }, bracketSameLine: t.bracketSameLine, bracketSpacing: t.bracketSpacing, jsxBracketSameLine: { since: "0.17.0", category: s, type: "boolean", description: "Put > on the last line instead of at a new line.", deprecated: "2.4.0" }, semi: { since: "1.0.0", category: s, type: "boolean", default: !0, description: "Print semicolons.", oppositeDescription: "Do not print semicolons, except at the beginning of lines which may need them." }, singleQuote: t.singleQuote, jsxSingleQuote: { since: "1.15.0", category: s, type: "boolean", default: !1, description: "Use single quotes in JSX." }, quoteProps: { since: "1.17.0", category: s, type: "choice", default: "as-needed", description: "Change when properties in objects are quoted.", choices: [{ value: "as-needed", description: "Only add quotes around object properties where required." }, { value: "consistent", description: "If at least one property in an object requires quotes, quote all properties." }, { value: "preserve", description: "Respect the input use of quotes in object properties." }] }, trailingComma: { since: "0.0.0", category: s, type: "choice", default: [{ since: "0.0.0", value: !1 }, { since: "0.19.0", value: "none" }, { since: "2.0.0", value: "es5" }], description: "Print trailing commas wherever possible when multi-line.", choices: [{ value: "es5", description: "Trailing commas where valid in ES5 (objects, arrays, etc.)" }, { value: "none", description: "No trailing commas." }, { value: "all", description: "Trailing commas wherever possible (including function arguments)." }] }, singleAttributePerLine: t.singleAttributePerLine };
      } }), Gs = X({ "src/language-js/parse/parsers.js"() {
        H();
      } }), Au = X({ "node_modules/linguist-languages/data/JavaScript.json"(u, l) {
        l.exports = { name: "JavaScript", type: "programming", tmScope: "source.js", aceMode: "javascript", codemirrorMode: "javascript", codemirrorMimeType: "text/javascript", color: "#f1e05a", aliases: ["js", "node"], extensions: [".js", "._js", ".bones", ".cjs", ".es", ".es6", ".frag", ".gs", ".jake", ".javascript", ".jsb", ".jscad", ".jsfl", ".jslib", ".jsm", ".jspre", ".jss", ".jsx", ".mjs", ".njs", ".pac", ".sjs", ".ssjs", ".xsjs", ".xsjslib"], filenames: ["Jakefile"], interpreters: ["chakra", "d8", "gjs", "js", "node", "nodejs", "qjs", "rhino", "v8", "v8-shell"], languageId: 183 };
      } }), Ws = X({ "node_modules/linguist-languages/data/TypeScript.json"(u, l) {
        l.exports = { name: "TypeScript", type: "programming", color: "#3178c6", aliases: ["ts"], interpreters: ["deno", "ts-node"], extensions: [".ts", ".cts", ".mts"], tmScope: "source.ts", aceMode: "typescript", codemirrorMode: "javascript", codemirrorMimeType: "application/typescript", languageId: 378 };
      } }), Xs = X({ "node_modules/linguist-languages/data/TSX.json"(u, l) {
        l.exports = { name: "TSX", type: "programming", color: "#3178c6", group: "TypeScript", extensions: [".tsx"], tmScope: "source.tsx", aceMode: "javascript", codemirrorMode: "jsx", codemirrorMimeType: "text/jsx", languageId: 94901924 };
      } }), ki = X({ "node_modules/linguist-languages/data/JSON.json"(u, l) {
        l.exports = { name: "JSON", type: "data", color: "#292929", tmScope: "source.json", aceMode: "json", codemirrorMode: "javascript", codemirrorMimeType: "application/json", aliases: ["geojson", "jsonl", "topojson"], extensions: [".json", ".4DForm", ".4DProject", ".avsc", ".geojson", ".gltf", ".har", ".ice", ".JSON-tmLanguage", ".jsonl", ".mcmeta", ".tfstate", ".tfstate.backup", ".topojson", ".webapp", ".webmanifest", ".yy", ".yyp"], filenames: [".arcconfig", ".auto-changelog", ".c8rc", ".htmlhintrc", ".imgbotconfig", ".nycrc", ".tern-config", ".tern-project", ".watchmanconfig", "Pipfile.lock", "composer.lock", "mcmod.info"], languageId: 174 };
      } }), Us = X({ "node_modules/linguist-languages/data/JSON with Comments.json"(u, l) {
        l.exports = { name: "JSON with Comments", type: "data", color: "#292929", group: "JSON", tmScope: "source.js", aceMode: "javascript", codemirrorMode: "javascript", codemirrorMimeType: "text/javascript", aliases: ["jsonc"], extensions: [".jsonc", ".code-snippets", ".sublime-build", ".sublime-commands", ".sublime-completions", ".sublime-keymap", ".sublime-macro", ".sublime-menu", ".sublime-mousemap", ".sublime-project", ".sublime-settings", ".sublime-theme", ".sublime-workspace", ".sublime_metrics", ".sublime_session"], filenames: [".babelrc", ".devcontainer.json", ".eslintrc.json", ".jscsrc", ".jshintrc", ".jslintrc", "api-extractor.json", "devcontainer.json", "jsconfig.json", "language-configuration.json", "tsconfig.json", "tslint.json"], languageId: 423 };
      } }), zs = X({ "node_modules/linguist-languages/data/JSON5.json"(u, l) {
        l.exports = { name: "JSON5", type: "data", color: "#267CB9", extensions: [".json5"], tmScope: "source.js", aceMode: "javascript", codemirrorMode: "javascript", codemirrorMimeType: "application/json", languageId: 175 };
      } }), Ys = X({ "src/language-js/index.js"(u, l) {
        H();
        var t = pr(), s = Vs(), i = Js(), e = qs(), n = Gs(), r = [t(Au(), (c) => ({ since: "0.0.0", parsers: ["babel", "acorn", "espree", "meriyah", "babel-flow", "babel-ts", "flow", "typescript"], vscodeLanguageIds: ["javascript", "mongo"], interpreters: [...c.interpreters, "zx"], extensions: [...c.extensions.filter((h) => h !== ".jsx"), ".wxs"] })), t(Au(), () => ({ name: "Flow", since: "0.0.0", parsers: ["flow", "babel-flow"], vscodeLanguageIds: ["javascript"], aliases: [], filenames: [], extensions: [".js.flow"] })), t(Au(), () => ({ name: "JSX", since: "0.0.0", parsers: ["babel", "babel-flow", "babel-ts", "flow", "typescript", "espree", "meriyah"], vscodeLanguageIds: ["javascriptreact"], aliases: void 0, filenames: void 0, extensions: [".jsx"], group: "JavaScript", interpreters: void 0, tmScope: "source.js.jsx", aceMode: "javascript", codemirrorMode: "jsx", codemirrorMimeType: "text/jsx", color: void 0 })), t(Ws(), () => ({ since: "1.4.0", parsers: ["typescript", "babel-ts"], vscodeLanguageIds: ["typescript"] })), t(Xs(), () => ({ since: "1.4.0", parsers: ["typescript", "babel-ts"], vscodeLanguageIds: ["typescriptreact"] })), t(ki(), () => ({ name: "JSON.stringify", since: "1.13.0", parsers: ["json-stringify"], vscodeLanguageIds: ["json"], extensions: [".importmap"], filenames: ["package.json", "package-lock.json", "composer.json"] })), t(ki(), (c) => ({ since: "1.5.0", parsers: ["json"], vscodeLanguageIds: ["json"], extensions: c.extensions.filter((h) => h !== ".jsonl") })), t(Us(), (c) => ({ since: "1.5.0", parsers: ["json"], vscodeLanguageIds: ["jsonc"], filenames: [...c.filenames, ".eslintrc", ".swcrc"] })), t(zs(), () => ({ since: "1.13.0", parsers: ["json5"], vscodeLanguageIds: ["json5"] }))], o = { estree: s, "estree-json": i };
        l.exports = { languages: r, options: e, printers: o, parsers: n };
      } }), Ks = X({ "src/language-css/clean.js"(u, l) {
        H();
        var { isFrontMatterNode: t } = kt(), s = Fn(), i = /* @__PURE__ */ new Set(["raw", "raws", "sourceIndex", "source", "before", "after", "trailingComma"]);
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
      } }), vu = X({ "src/utils/front-matter/print.js"(u, l) {
        H();
        var { builders: { hardline: t, markAsRoot: s } } = mt();
        function i(e, n) {
          if (e.lang === "yaml") {
            let r = e.value.trim(), o = r ? n(r, { parser: "yaml" }, { stripTrailingHardline: !0 }) : "";
            return s([e.startDelimiter, t, o, o ? t : "", e.endDelimiter]);
          }
        }
        l.exports = i;
      } }), Qs = X({ "src/language-css/embed.js"(u, l) {
        H();
        var { builders: { hardline: t } } = mt(), s = vu();
        function i(e, n, r) {
          let o = e.getValue();
          if (o.type === "front-matter") {
            let c = s(o, r);
            return c ? [c, t] : "";
          }
        }
        l.exports = i;
      } }), Pi = X({ "src/utils/front-matter/parse.js"(u, l) {
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
      } }), Hs = X({ "src/language-css/pragma.js"(u, l) {
        H();
        var t = Ci(), s = Pi();
        function i(n) {
          return t.hasPragma(s(n).content);
        }
        function e(n) {
          let { frontMatter: r, content: o } = s(n);
          return (r ? r.raw + `

` : "") + t.insertPragma(o);
        }
        l.exports = { hasPragma: i, insertPragma: e };
      } }), Zs = X({ "src/language-css/utils/index.js"(u, l) {
        H();
        var t = /* @__PURE__ */ new Set(["red", "green", "blue", "alpha", "a", "rgb", "hue", "h", "saturation", "s", "lightness", "l", "whiteness", "w", "blackness", "b", "tint", "shade", "blend", "blenda", "contrast", "hsl", "hsla", "hwb", "hwba"]);
        function s(Q, W) {
          let ne = Array.isArray(W) ? W : [W], ue = -1, Fe;
          for (; Fe = Q.getParentNode(++ue); )
            if (ne.includes(Fe.type))
              return ue;
          return -1;
        }
        function i(Q, W) {
          let ne = s(Q, W);
          return ne === -1 ? null : Q.getParentNode(ne);
        }
        function e(Q) {
          var W;
          let ne = i(Q, "css-decl");
          return ne == null || (W = ne.prop) === null || W === void 0 ? void 0 : W.toLowerCase();
        }
        var n = /* @__PURE__ */ new Set(["initial", "inherit", "unset", "revert"]);
        function r(Q) {
          return n.has(Q.toLowerCase());
        }
        function o(Q, W) {
          let ne = i(Q, "css-atrule");
          return (ne == null ? void 0 : ne.name) && ne.name.toLowerCase().endsWith("keyframes") && ["from", "to"].includes(W.toLowerCase());
        }
        function c(Q) {
          return Q.includes("$") || Q.includes("@") || Q.includes("#") || Q.startsWith("%") || Q.startsWith("--") || Q.startsWith(":--") || Q.includes("(") && Q.includes(")") ? Q : Q.toLowerCase();
        }
        function h(Q, W) {
          var ne;
          let ue = i(Q, "value-func");
          return (ue == null || (ne = ue.value) === null || ne === void 0 ? void 0 : ne.toLowerCase()) === W;
        }
        function m(Q) {
          var W;
          let ne = i(Q, "css-rule"), ue = ne == null || (W = ne.raws) === null || W === void 0 ? void 0 : W.selector;
          return ue && (ue.startsWith(":import") || ue.startsWith(":export"));
        }
        function y(Q, W) {
          let ne = Array.isArray(W) ? W : [W], ue = i(Q, "css-atrule");
          return ue && ne.includes(ue.name.toLowerCase());
        }
        function p(Q) {
          let W = Q.getValue(), ne = i(Q, "css-atrule");
          return (ne == null ? void 0 : ne.name) === "import" && W.groups[0].value === "url" && W.groups.length === 2;
        }
        function D(Q) {
          return Q.type === "value-func" && Q.value.toLowerCase() === "url";
        }
        function C(Q, W) {
          var ne;
          let ue = (ne = Q.getParentNode()) === null || ne === void 0 ? void 0 : ne.nodes;
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
          var W, ne;
          return ((W = Q.value) === null || W === void 0 ? void 0 : W.type) === "value-root" && ((ne = Q.value.group) === null || ne === void 0 ? void 0 : ne.type) === "value-value" && Q.prop.toLowerCase() === "composes";
        }
        function I(Q) {
          var W, ne, ue;
          return ((W = Q.value) === null || W === void 0 || (ne = W.group) === null || ne === void 0 || (ue = ne.group) === null || ue === void 0 ? void 0 : ue.type) === "value-paren_group" && Q.value.group.group.open !== null && Q.value.group.group.close !== null;
        }
        function $(Q) {
          var W;
          return ((W = Q.raws) === null || W === void 0 ? void 0 : W.before) === "";
        }
        function V(Q) {
          var W, ne;
          return Q.type === "value-comma_group" && ((W = Q.groups) === null || W === void 0 || (ne = W[1]) === null || ne === void 0 ? void 0 : ne.type) === "value-colon";
        }
        function M(Q) {
          var W;
          return Q.type === "value-paren_group" && ((W = Q.groups) === null || W === void 0 ? void 0 : W[0]) && V(Q.groups[0]);
        }
        function U(Q) {
          var W;
          let ne = Q.getValue();
          if (ne.groups.length === 0)
            return !1;
          let ue = Q.getParentNode(1);
          if (!M(ne) && !(ue && M(ue)))
            return !1;
          let Fe = i(Q, "css-decl");
          return !!(Fe != null && (W = Fe.prop) !== null && W !== void 0 && W.startsWith("$") || M(ue) || ue.type === "value-func");
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
        function oe(Q) {
          return (Q == null ? void 0 : Q.type) === "value-colon";
        }
        function te(Q, W) {
          if (!V(W))
            return !1;
          let { groups: ne } = W, ue = ne.indexOf(Q);
          return ue === -1 ? !1 : oe(ne[ue + 1]);
        }
        function Ee(Q) {
          return Q.value && ["not", "and", "or"].includes(Q.value.toLowerCase());
        }
        function q(Q) {
          return Q.type !== "value-func" ? !1 : t.has(Q.value.toLowerCase());
        }
        function Y(Q) {
          return /\/\//.test(Q.split(/[\n\r]/).pop());
        }
        function ge(Q) {
          return (Q == null ? void 0 : Q.type) === "value-atword" && Q.value.startsWith("prettier-placeholder-");
        }
        function ye(Q, W) {
          var ne, ue;
          if (((ne = Q.open) === null || ne === void 0 ? void 0 : ne.value) !== "(" || ((ue = Q.close) === null || ue === void 0 ? void 0 : ue.value) !== ")" || Q.groups.some((Fe) => Fe.type !== "value-comma_group"))
            return !1;
          if (W.type === "value-comma_group") {
            let Fe = W.groups.indexOf(Q) - 1, Se = W.groups[Fe];
            if ((Se == null ? void 0 : Se.type) === "value-word" && Se.value === "with")
              return !0;
          }
          return !1;
        }
        function Le(Q) {
          var W, ne;
          return Q.type === "value-paren_group" && ((W = Q.open) === null || W === void 0 ? void 0 : W.value) === "(" && ((ne = Q.close) === null || ne === void 0 ? void 0 : ne.value) === ")";
        }
        l.exports = { getAncestorCounter: s, getAncestorNode: i, getPropOfDeclNode: e, maybeToLowerCase: c, insideValueFunctionNode: h, insideICSSRuleNode: m, insideAtRuleNode: y, insideURLFunctionInImportAtRuleNode: p, isKeyframeAtRuleKeywords: o, isWideKeywords: r, isLastNode: C, isSCSSControlDirectiveNode: a, isDetachedRulesetDeclarationNode: w, isRelationalOperatorNode: F, isEqualityOperatorNode: d, isMultiplicationNode: S, isDivisionNode: j, isAdditionNode: k, isSubtractionNode: J, isModuloNode: f, isMathOperatorNode: B, isEachKeywordNode: N, isForKeywordNode: P, isURLFunctionNode: D, isIfElseKeywordNode: A, hasComposesNode: T, hasParensAroundNode: I, hasEmptyRawBefore: $, isDetachedRulesetCallNode: g, isTemplatePlaceholderNode: E, isTemplatePropNode: b, isPostcssSimpleVarNode: x, isKeyValuePairNode: V, isKeyValuePairInParenGroupNode: M, isKeyInValuePairNode: te, isSCSSMapItemNode: U, isInlineValueCommentNode: _, isHashNode: ee, isLeftCurlyBraceNode: R, isRightCurlyBraceNode: O, isWordNode: Z, isColonNode: oe, isMediaAndSupportsKeywords: Ee, isColorAdjusterFuncNode: q, lastLineHasInlineComment: Y, isAtWordPlaceholderNode: ge, isConfigurationNode: ye, isParenGroupNode: Le };
      } }), eo = X({ "src/utils/line-column-to-index.js"(u, l) {
        H(), l.exports = function(t, s) {
          let i = 0;
          for (let e = 0; e < t.line - 1; ++e)
            i = s.indexOf(`
`, i) + 1;
          return i + t.column;
        };
      } }), to = X({ "src/language-css/loc.js"(u, l) {
        H();
        var { skipEverythingButNewLine: t } = Mr(), s = Fn(), i = eo();
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
      } }), no = X({ "src/language-css/utils/is-less-parser.js"(u, l) {
        H();
        function t(s) {
          return s.parser === "css" || s.parser === "less";
        }
        l.exports = t;
      } }), ro = X({ "src/language-css/utils/is-scss.js"(u, l) {
        H();
        function t(s, i) {
          return s === "less" || s === "scss" ? s === "scss" : /(?:\w\s*:\s*[^:}]+|#){|@import[^\n]+(?:url|,)/.test(i);
        }
        l.exports = t;
      } }), uo = X({ "src/language-css/utils/css-units.evaluate.js"(u, l) {
        l.exports = { em: "em", rem: "rem", ex: "ex", rex: "rex", cap: "cap", rcap: "rcap", ch: "ch", rch: "rch", ic: "ic", ric: "ric", lh: "lh", rlh: "rlh", vw: "vw", svw: "svw", lvw: "lvw", dvw: "dvw", vh: "vh", svh: "svh", lvh: "lvh", dvh: "dvh", vi: "vi", svi: "svi", lvi: "lvi", dvi: "dvi", vb: "vb", svb: "svb", lvb: "lvb", dvb: "dvb", vmin: "vmin", svmin: "svmin", lvmin: "lvmin", dvmin: "dvmin", vmax: "vmax", svmax: "svmax", lvmax: "lvmax", dvmax: "dvmax", cm: "cm", mm: "mm", q: "Q", in: "in", pt: "pt", pc: "pc", px: "px", deg: "deg", grad: "grad", rad: "rad", turn: "turn", s: "s", ms: "ms", hz: "Hz", khz: "kHz", dpi: "dpi", dpcm: "dpcm", dppx: "dppx", x: "x" };
      } }), io = X({ "src/language-css/utils/print-unit.js"(u, l) {
        H();
        var t = uo();
        function s(i) {
          let e = i.toLowerCase();
          return Object.prototype.hasOwnProperty.call(t, e) ? t[e] : i;
        }
        l.exports = s;
      } }), ao = X({ "src/language-css/printer-postcss.js"(u, l) {
        H();
        var t = Fn(), { printNumber: s, printString: i, hasNewline: e, isFrontMatterNode: n, isNextLineEmpty: r, isNonEmptyArray: o } = kt(), { builders: { join: c, line: h, hardline: m, softline: y, group: p, fill: D, indent: C, dedent: w, ifBreak: P, breakParent: A }, utils: { removeLines: N, getDocParts: S } } = mt(), j = Ks(), k = Qs(), { insertPragma: J } = Hs(), { getAncestorNode: f, getPropOfDeclNode: B, maybeToLowerCase: d, insideValueFunctionNode: F, insideICSSRuleNode: a, insideAtRuleNode: g, insideURLFunctionInImportAtRuleNode: E, isKeyframeAtRuleKeywords: b, isWideKeywords: x, isLastNode: T, isSCSSControlDirectiveNode: I, isDetachedRulesetDeclarationNode: $, isRelationalOperatorNode: V, isEqualityOperatorNode: M, isMultiplicationNode: U, isDivisionNode: _, isAdditionNode: ee, isSubtractionNode: R, isMathOperatorNode: O, isEachKeywordNode: Z, isForKeywordNode: oe, isURLFunctionNode: te, isIfElseKeywordNode: Ee, hasComposesNode: q, hasParensAroundNode: Y, hasEmptyRawBefore: ge, isKeyValuePairNode: ye, isKeyInValuePairNode: Le, isDetachedRulesetCallNode: Q, isTemplatePlaceholderNode: W, isTemplatePropNode: ne, isPostcssSimpleVarNode: ue, isSCSSMapItemNode: Fe, isInlineValueCommentNode: Se, isHashNode: we, isLeftCurlyBraceNode: He, isRightCurlyBraceNode: Ft, isWordNode: ht, isColonNode: Qe, isMediaAndSupportsKeywords: it, isColorAdjusterFuncNode: De, lastLineHasInlineComment: G, isAtWordPlaceholderNode: he, isConfigurationNode: K, isParenGroupNode: me } = Zs(), { locStart: Je, locEnd: _e } = to(), Ce = no(), v = ro(), z = io();
        function le(Ue) {
          return Ue.trailingComma === "es5" || Ue.trailingComma === "all";
        }
        function Be(Ue, gt, ct) {
          let de = Ue.getValue();
          if (!de)
            return "";
          if (typeof de == "string")
            return de;
          switch (de.type) {
            case "front-matter":
              return [de.raw, m];
            case "css-root": {
              let Bt = je(Ue, gt, ct), Tt = de.raws.after.trim();
              return Tt.startsWith(";") && (Tt = Tt.slice(1).trim()), [Bt, Tt ? ` ${Tt}` : "", S(Bt).length > 0 ? m : ""];
            }
            case "css-comment": {
              let Bt = de.inline || de.raws.inline, Tt = gt.originalText.slice(Je(de), _e(de));
              return Bt ? Tt.trimEnd() : Tt;
            }
            case "css-rule":
              return [ct("selector"), de.important ? " !important" : "", de.nodes ? [de.selector && de.selector.type === "selector-unknown" && G(de.selector.value) ? h : " ", "{", de.nodes.length > 0 ? C([m, je(Ue, gt, ct)]) : "", m, "}", $(de) ? ";" : ""] : ";"];
            case "css-decl": {
              let Bt = Ue.getParentNode(), { between: Tt } = de.raws, Ut = Tt.trim(), On = Ut === ":", L = q(de) ? N(ct("value")) : ct("value");
              return !On && G(Ut) && (L = C([m, w(L)])), [de.raws.before.replace(/[\s;]/g, ""), Bt.type === "css-atrule" && Bt.variable || a(Ue) ? de.prop : d(de.prop), Ut.startsWith("//") ? " " : "", Ut, de.extend ? "" : " ", Ce(gt) && de.extend && de.selector ? ["extend(", ct("selector"), ")"] : "", L, de.raws.important ? de.raws.important.replace(/\s*!\s*important/i, " !important") : de.important ? " !important" : "", de.raws.scssDefault ? de.raws.scssDefault.replace(/\s*!default/i, " !default") : de.scssDefault ? " !default" : "", de.raws.scssGlobal ? de.raws.scssGlobal.replace(/\s*!global/i, " !global") : de.scssGlobal ? " !global" : "", de.nodes ? [" {", C([y, je(Ue, gt, ct)]), y, "}"] : ne(de) && !Bt.raws.semicolon && gt.originalText[_e(de) - 1] !== ";" ? "" : gt.__isHTMLStyleAttribute && T(Ue, de) ? P(";") : ";"];
            }
            case "css-atrule": {
              let Bt = Ue.getParentNode(), Tt = W(de) && !Bt.raws.semicolon && gt.originalText[_e(de) - 1] !== ";";
              if (Ce(gt)) {
                if (de.mixin)
                  return [ct("selector"), de.important ? " !important" : "", Tt ? "" : ";"];
                if (de.function)
                  return [de.name, ct("params"), Tt ? "" : ";"];
                if (de.variable)
                  return ["@", de.name, ": ", de.value ? ct("value") : "", de.raws.between.trim() ? de.raws.between.trim() + " " : "", de.nodes ? ["{", C([de.nodes.length > 0 ? y : "", je(Ue, gt, ct)]), y, "}"] : "", Tt ? "" : ";"];
              }
              return ["@", Q(de) || de.name.endsWith(":") ? de.name : d(de.name), de.params ? [Q(de) ? "" : W(de) ? de.raws.afterName === "" ? "" : de.name.endsWith(":") ? " " : /^\s*\n\s*\n/.test(de.raws.afterName) ? [m, m] : /^\s*\n/.test(de.raws.afterName) ? m : " " : " ", ct("params")] : "", de.selector ? C([" ", ct("selector")]) : "", de.value ? p([" ", ct("value"), I(de) ? Y(de) ? " " : h : ""]) : de.name === "else" ? " " : "", de.nodes ? [I(de) ? "" : de.selector && !de.selector.nodes && typeof de.selector.value == "string" && G(de.selector.value) || !de.selector && typeof de.params == "string" && G(de.params) ? h : " ", "{", C([de.nodes.length > 0 ? y : "", je(Ue, gt, ct)]), y, "}"] : Tt ? "" : ";"];
            }
            case "media-query-list": {
              let Bt = [];
              return Ue.each((Tt) => {
                let Ut = Tt.getValue();
                Ut.type === "media-query" && Ut.value === "" || Bt.push(ct());
              }, "nodes"), p(C(c(h, Bt)));
            }
            case "media-query":
              return [c(" ", Ue.map(ct, "nodes")), T(Ue, de) ? "" : ","];
            case "media-type":
              return Ct(We(de.value, gt));
            case "media-feature-expression":
              return de.nodes ? ["(", ...Ue.map(ct, "nodes"), ")"] : de.value;
            case "media-feature":
              return d(We(de.value.replace(/ +/g, " "), gt));
            case "media-colon":
              return [de.value, " "];
            case "media-value":
              return Ct(We(de.value, gt));
            case "media-keyword":
              return We(de.value, gt);
            case "media-url":
              return We(de.value.replace(/^url\(\s+/gi, "url(").replace(/\s+\)$/g, ")"), gt);
            case "media-unknown":
              return de.value;
            case "selector-root":
              return p([g(Ue, "custom-selector") ? [f(Ue, "css-atrule").customSelector, h] : "", c([",", g(Ue, ["extend", "custom-selector", "nest"]) ? h : m], Ue.map(ct, "nodes"))]);
            case "selector-selector":
              return p(C(Ue.map(ct, "nodes")));
            case "selector-comment":
              return de.value;
            case "selector-string":
              return We(de.value, gt);
            case "selector-tag": {
              let Bt = Ue.getParentNode(), Tt = Bt && Bt.nodes.indexOf(de), Ut = Tt && Bt.nodes[Tt - 1];
              return [de.namespace ? [de.namespace === !0 ? "" : de.namespace.trim(), "|"] : "", Ut.type === "selector-nesting" ? de.value : Ct(b(Ue, de.value) ? de.value.toLowerCase() : de.value)];
            }
            case "selector-id":
              return ["#", de.value];
            case "selector-class":
              return [".", Ct(We(de.value, gt))];
            case "selector-attribute": {
              var Ln;
              return ["[", de.namespace ? [de.namespace === !0 ? "" : de.namespace.trim(), "|"] : "", de.attribute.trim(), (Ln = de.operator) !== null && Ln !== void 0 ? Ln : "", de.value ? lt(We(de.value.trim(), gt), gt) : "", de.insensitive ? " i" : "", "]"];
            }
            case "selector-combinator": {
              if (de.value === "+" || de.value === ">" || de.value === "~" || de.value === ">>>") {
                let Ut = Ue.getParentNode();
                return [Ut.type === "selector-selector" && Ut.nodes[0] === de ? "" : h, de.value, T(Ue, de) ? "" : " "];
              }
              let Bt = de.value.trim().startsWith("(") ? h : "", Tt = Ct(We(de.value.trim(), gt)) || h;
              return [Bt, Tt];
            }
            case "selector-universal":
              return [de.namespace ? [de.namespace === !0 ? "" : de.namespace.trim(), "|"] : "", de.value];
            case "selector-pseudo":
              return [d(de.value), o(de.nodes) ? p(["(", C([y, c([",", h], Ue.map(ct, "nodes"))]), y, ")"]) : ""];
            case "selector-nesting":
              return de.value;
            case "selector-unknown": {
              let Bt = f(Ue, "css-rule");
              if (Bt && Bt.isSCSSNesterProperty)
                return Ct(We(d(de.value), gt));
              let Tt = Ue.getParentNode();
              if (Tt.raws && Tt.raws.selector) {
                let On = Je(Tt), L = On + Tt.raws.selector.length;
                return gt.originalText.slice(On, L).trim();
              }
              let Ut = Ue.getParentNode(1);
              if (Tt.type === "value-paren_group" && Ut && Ut.type === "value-func" && Ut.value === "selector") {
                let On = _e(Tt.open) + 1, L = Je(Tt.close), Ae = gt.originalText.slice(On, L).trim();
                return G(Ae) ? [A, Ae] : Ae;
              }
              return de.value;
            }
            case "value-value":
            case "value-root":
              return ct("group");
            case "value-comment":
              return gt.originalText.slice(Je(de), _e(de));
            case "value-comma_group": {
              let Bt = Ue.getParentNode(), Tt = Ue.getParentNode(1), Ut = B(Ue), On = Ut && Bt.type === "value-value" && (Ut === "grid" || Ut.startsWith("grid-template")), L = f(Ue, "css-atrule"), Ae = L && I(L), ut = de.groups.some(($n) => Se($n)), Pt = Ue.map(ct, "groups"), jt = [], jn = F(Ue, "url"), nn = !1, xn = !1;
              for (let $n = 0; $n < de.groups.length; ++$n) {
                var An;
                jt.push(Pt[$n]);
                let mn = de.groups[$n - 1], Dt = de.groups[$n], vt = de.groups[$n + 1], Qr = de.groups[$n + 2];
                if (jn) {
                  (vt && ee(vt) || ee(Dt)) && jt.push(" ");
                  continue;
                }
                if (g(Ue, "forward") && Dt.type === "value-word" && Dt.value && mn !== void 0 && mn.type === "value-word" && mn.value === "as" && vt.type === "value-operator" && vt.value === "*" || !vt || Dt.type === "value-word" && Dt.value.endsWith("-") && he(vt))
                  continue;
                if (Dt.type === "value-string" && Dt.quoted) {
                  let wu = Dt.value.lastIndexOf("#{"), Nu = Dt.value.lastIndexOf("}");
                  wu !== -1 && Nu !== -1 ? nn = wu > Nu : wu !== -1 ? nn = !0 : Nu !== -1 && (nn = !1);
                }
                if (nn || Qe(Dt) || Qe(vt) || Dt.type === "value-atword" && (Dt.value === "" || Dt.value.endsWith("[")) || vt.type === "value-word" && vt.value.startsWith("]") || Dt.value === "~" || Dt.value && Dt.value.includes("\\") && vt && vt.type !== "value-comment" || mn && mn.value && mn.value.indexOf("\\") === mn.value.length - 1 && Dt.type === "value-operator" && Dt.value === "/" || Dt.value === "\\" || ue(Dt, vt) || we(Dt) || He(Dt) || Ft(vt) || He(vt) && ge(vt) || Ft(Dt) && ge(vt) || Dt.value === "--" && we(vt))
                  continue;
                let Tu = O(Dt), Mi = O(vt);
                if ((Tu && we(vt) || Mi && Ft(Dt)) && ge(vt) || !mn && _(Dt) || F(Ue, "calc") && (ee(Dt) || ee(vt) || R(Dt) || R(vt)) && ge(vt))
                  continue;
                let Al = (ee(Dt) || R(Dt)) && $n === 0 && (vt.type === "value-number" || vt.isHex) && Tt && De(Tt) && !ge(vt), Ri = Qr && Qr.type === "value-func" || Qr && ht(Qr) || Dt.type === "value-func" || ht(Dt), Vi = vt.type === "value-func" || ht(vt) || mn && mn.type === "value-func" || mn && ht(mn);
                if (!(!(U(vt) || U(Dt)) && !F(Ue, "calc") && !Al && (_(vt) && !Ri || _(Dt) && !Vi || ee(vt) && !Ri || ee(Dt) && !Vi || R(vt) || R(Dt)) && (ge(vt) || Tu && (!mn || mn && O(mn)))) && !((gt.parser === "scss" || gt.parser === "less") && Tu && Dt.value === "-" && me(vt) && _e(Dt) === Je(vt.open) && vt.open.value === "(")) {
                  if (Se(Dt)) {
                    if (Bt.type === "value-paren_group") {
                      jt.push(w(m));
                      continue;
                    }
                    jt.push(m);
                    continue;
                  }
                  if (Ae && (M(vt) || V(vt) || Ee(vt) || Z(Dt) || oe(Dt))) {
                    jt.push(" ");
                    continue;
                  }
                  if (L && L.name.toLowerCase() === "namespace") {
                    jt.push(" ");
                    continue;
                  }
                  if (On) {
                    Dt.source && vt.source && Dt.source.start.line !== vt.source.start.line ? (jt.push(m), xn = !0) : jt.push(" ");
                    continue;
                  }
                  if (Mi) {
                    jt.push(" ");
                    continue;
                  }
                  if (!(vt && vt.value === "...") && !(he(Dt) && he(vt) && _e(Dt) === Je(vt))) {
                    if (he(Dt) && me(vt) && _e(Dt) === Je(vt.open)) {
                      jt.push(y);
                      continue;
                    }
                    if (Dt.value === "with" && me(vt)) {
                      jt.push(" ");
                      continue;
                    }
                    (An = Dt.value) !== null && An !== void 0 && An.endsWith("#") && vt.value === "{" && me(vt.group) || jt.push(h);
                  }
                }
              }
              return ut && jt.push(A), xn && jt.unshift(m), Ae ? p(C(jt)) : E(Ue) ? p(D(jt)) : p(C(D(jt)));
            }
            case "value-paren_group": {
              let Bt = Ue.getParentNode();
              if (Bt && te(Bt) && (de.groups.length === 1 || de.groups.length > 0 && de.groups[0].type === "value-comma_group" && de.groups[0].groups.length > 0 && de.groups[0].groups[0].type === "value-word" && de.groups[0].groups[0].value.startsWith("data:")))
                return [de.open ? ct("open") : "", c(",", Ue.map(ct, "groups")), de.close ? ct("close") : ""];
              if (!de.open) {
                let jn = Ue.map(ct, "groups"), nn = [];
                for (let xn = 0; xn < jn.length; xn++)
                  xn !== 0 && nn.push([",", h]), nn.push(jn[xn]);
                return p(C(D(nn)));
              }
              let Tt = Fe(Ue), Ut = t(de.groups), On = Ut && Ut.type === "value-comment", L = Le(de, Bt), Ae = K(de, Bt), ut = Ae || Tt && !L, Pt = Ae || L, jt = p([de.open ? ct("open") : "", C([y, c([h], Ue.map((jn, nn) => {
                let xn = jn.getValue(), $n = nn === de.groups.length - 1, mn = [ct(), $n ? "" : ","];
                if (ye(xn) && xn.type === "value-comma_group" && xn.groups && xn.groups[0].type !== "value-paren_group" && xn.groups[2] && xn.groups[2].type === "value-paren_group") {
                  let Dt = S(mn[0].contents.contents);
                  Dt[1] = p(Dt[1]), mn = [p(w(mn))];
                }
                if (!$n && xn.type === "value-comma_group" && o(xn.groups)) {
                  let Dt = t(xn.groups);
                  !Dt.source && Dt.close && (Dt = Dt.close), Dt.source && r(gt.originalText, Dt, _e) && mn.push(m);
                }
                return mn;
              }, "groups"))]), P(!On && v(gt.parser, gt.originalText) && Tt && le(gt) ? "," : ""), y, de.close ? ct("close") : ""], { shouldBreak: ut });
              return Pt ? w(jt) : jt;
            }
            case "value-func":
              return [de.value, g(Ue, "supports") && it(de) ? " " : "", ct("group")];
            case "value-paren":
              return de.value;
            case "value-number":
              return [Wt(de.value), z(de.unit)];
            case "value-operator":
              return de.value;
            case "value-word":
              return de.isColor && de.isHex || x(de.value) ? de.value.toLowerCase() : de.value;
            case "value-colon": {
              let Bt = Ue.getParentNode(), Tt = Bt && Bt.groups.indexOf(de), Ut = Tt && Bt.groups[Tt - 1];
              return [de.value, Ut && typeof Ut.value == "string" && t(Ut.value) === "\\" || F(Ue, "url") ? "" : h];
            }
            case "value-comma":
              return [de.value, " "];
            case "value-string":
              return i(de.raws.quote + de.value + de.raws.quote, gt);
            case "value-atword":
              return ["@", de.value];
            case "value-unicode-range":
              return de.value;
            case "value-unknown":
              return de.value;
            default:
              throw new Error(`Unknown postcss type ${JSON.stringify(de.type)}`);
          }
        }
        function je(Ue, gt, ct) {
          let de = [];
          return Ue.each((Ln, An, Bt) => {
            let Tt = Bt[An - 1];
            if (Tt && Tt.type === "css-comment" && Tt.text.trim() === "prettier-ignore") {
              let Ut = Ln.getValue();
              de.push(gt.originalText.slice(Je(Ut), _e(Ut)));
            } else
              de.push(ct());
            An !== Bt.length - 1 && (Bt[An + 1].type === "css-comment" && !e(gt.originalText, Je(Bt[An + 1]), { backwards: !0 }) && !n(Bt[An]) || Bt[An + 1].type === "css-atrule" && Bt[An + 1].name === "else" && Bt[An].type !== "css-comment" ? de.push(" ") : (de.push(gt.__isHTMLStyleAttribute ? h : m), r(gt.originalText, Ln.getValue(), _e) && !n(Bt[An]) && de.push(m)));
          }, "nodes"), de;
        }
        var Ke = /(["'])(?:(?!\1)[^\\]|\\.)*\1/gs, Ne = /(?:\d*\.\d+|\d+\.?)(?:[Ee][+-]?\d+)?/g, en = /[A-Za-z]+/g, Xe = /[$@]?[A-Z_a-z\u0080-\uFFFF][\w\u0080-\uFFFF-]*/g, Qt = new RegExp(Ke.source + `|(${Xe.source})?(${Ne.source})(${en.source})?`, "g");
        function We(Ue, gt) {
          return Ue.replace(Ke, (ct) => i(ct, gt));
        }
        function lt(Ue, gt) {
          let ct = gt.singleQuote ? "'" : '"';
          return Ue.includes('"') || Ue.includes("'") ? Ue : ct + Ue + ct;
        }
        function Ct(Ue) {
          return Ue.replace(Qt, (gt, ct, de, Ln, An) => !de && Ln ? Wt(Ln) + d(An || "") : gt);
        }
        function Wt(Ue) {
          return s(Ue).replace(/\.0(?=$|e)/, "");
        }
        l.exports = { print: Be, embed: k, insertPragma: J, massageAstNode: j };
      } }), so = X({ "src/language-css/options.js"(u, l) {
        H();
        var t = yr();
        l.exports = { singleQuote: t.singleQuote };
      } }), oo = X({ "src/language-css/parsers.js"() {
        H();
      } }), lo = X({ "node_modules/linguist-languages/data/CSS.json"(u, l) {
        l.exports = { name: "CSS", type: "markup", tmScope: "source.css", aceMode: "css", codemirrorMode: "css", codemirrorMimeType: "text/css", color: "#563d7c", extensions: [".css"], languageId: 50 };
      } }), po = X({ "node_modules/linguist-languages/data/PostCSS.json"(u, l) {
        l.exports = { name: "PostCSS", type: "markup", color: "#dc3a0c", tmScope: "source.postcss", group: "CSS", extensions: [".pcss", ".postcss"], aceMode: "text", languageId: 262764437 };
      } }), co = X({ "node_modules/linguist-languages/data/Less.json"(u, l) {
        l.exports = { name: "Less", type: "markup", color: "#1d365d", aliases: ["less-css"], extensions: [".less"], tmScope: "source.css.less", aceMode: "less", codemirrorMode: "css", codemirrorMimeType: "text/css", languageId: 198 };
      } }), Do = X({ "node_modules/linguist-languages/data/SCSS.json"(u, l) {
        l.exports = { name: "SCSS", type: "markup", color: "#c6538c", tmScope: "source.css.scss", aceMode: "scss", codemirrorMode: "css", codemirrorMimeType: "text/x-scss", extensions: [".scss"], languageId: 329 };
      } }), fo = X({ "src/language-css/index.js"(u, l) {
        H();
        var t = pr(), s = ao(), i = so(), e = oo(), n = [t(lo(), (o) => ({ since: "1.4.0", parsers: ["css"], vscodeLanguageIds: ["css"], extensions: [...o.extensions, ".wxss"] })), t(po(), () => ({ since: "1.4.0", parsers: ["css"], vscodeLanguageIds: ["postcss"] })), t(co(), () => ({ since: "1.4.0", parsers: ["less"], vscodeLanguageIds: ["less"] })), t(Do(), () => ({ since: "1.4.0", parsers: ["scss"], vscodeLanguageIds: ["scss"] }))], r = { postcss: s };
        l.exports = { languages: n, options: i, printers: r, parsers: e };
      } }), mo = X({ "src/language-handlebars/loc.js"(u, l) {
        H();
        function t(i) {
          return i.loc.start.offset;
        }
        function s(i) {
          return i.loc.end.offset;
        }
        l.exports = { locStart: t, locEnd: s };
      } }), go = X({ "src/language-handlebars/clean.js"(u, l) {
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
      } }), yo = X({ "src/language-handlebars/html-void-elements.evaluate.js"(u, l) {
        l.exports = ["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"];
      } }), ho = X({ "src/language-handlebars/utils.js"(u, l) {
        H();
        var t = Fn(), s = yo();
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
      } }), Eo = X({ "src/language-handlebars/printer-glimmer.js"(u, l) {
        H();
        var { builders: { dedent: t, fill: s, group: i, hardline: e, ifBreak: n, indent: r, join: o, line: c, softline: h }, utils: { getDocParts: m, replaceTextEndOfLine: y } } = mt(), { getPreferredQuote: p, isNonEmptyArray: D } = kt(), { locStart: C, locEnd: w } = mo(), P = go(), { getNextNode: A, getPreviousNode: N, hasPrettierIgnore: S, isLastNodeOfSiblings: j, isNextNodeOfSomeType: k, isNodeOfSomeType: J, isParentOfSomeType: f, isPreviousNodeOfSomeType: B, isVoid: d, isWhitespaceNode: F } = ho(), a = 2;
        function g(G, he, K) {
          let me = G.getValue();
          if (!me)
            return "";
          if (S(G))
            return he.originalText.slice(C(me), w(me));
          let Je = he.singleQuote ? "'" : '"';
          switch (me.type) {
            case "Block":
            case "Program":
            case "Template":
              return i(G.map(K, "body"));
            case "ElementNode": {
              let _e = i(b(G, K)), Ce = he.htmlWhitespaceSensitivity === "ignore" && k(G, ["ElementNode"]) ? h : "";
              if (d(me))
                return [_e, Ce];
              let v = ["</", me.tag, ">"];
              return me.children.length === 0 ? [_e, r(v), Ce] : he.htmlWhitespaceSensitivity === "ignore" ? [_e, r(x(G, he, K)), e, r(v), Ce] : [_e, r(i(x(G, he, K))), r(v), Ce];
            }
            case "BlockStatement": {
              let _e = G.getParentNode(1);
              return _e && _e.inverse && _e.inverse.body.length === 1 && _e.inverse.body[0] === me && _e.inverse.body[0].path.parts[0] === _e.path.parts[0] ? [oe(G, K, _e.inverse.body[0].path.parts[0]), ge(G, K, he), ye(G, K, he)] : [O(G, K), i([ge(G, K, he), ye(G, K, he), te(G, K, he)])];
            }
            case "ElementModifierStatement":
              return i(["{{", ht(G, K), "}}"]);
            case "MustacheStatement":
              return i([I(me), ht(G, K), $(me)]);
            case "SubExpression":
              return i(["(", Ft(G, K), h, ")"]);
            case "AttrNode": {
              let _e = me.value.type === "TextNode";
              if (_e && me.value.chars === "" && C(me.value) === w(me.value))
                return me.name;
              let Ce = _e ? p(me.value.chars, Je).quote : me.value.type === "ConcatStatement" ? p(me.value.parts.filter((z) => z.type === "TextNode").map((z) => z.chars).join(""), Je).quote : "", v = K("value");
              return [me.name, "=", Ce, me.name === "class" && Ce ? i(r(v)) : v, Ce];
            }
            case "ConcatStatement":
              return G.map(K, "parts");
            case "Hash":
              return o(c, G.map(K, "pairs"));
            case "HashPair":
              return [me.key, "=", K("value")];
            case "TextNode": {
              let _e = me.chars.replace(/{{/g, "\\{{"), Ce = W(G);
              if (Ce) {
                if (Ce === "class") {
                  let Xe = _e.trim().split(/\s+/).join(" "), Qt = !1, We = !1;
                  return f(G, ["ConcatStatement"]) && (B(G, ["MustacheStatement"]) && /^\s/.test(_e) && (Qt = !0), k(G, ["MustacheStatement"]) && /\s$/.test(_e) && Xe !== "" && (We = !0)), [Qt ? c : "", Xe, We ? c : ""];
                }
                return y(_e);
              }
              let v = /^[\t\n\f\r ]*$/.test(_e), z = !N(G), le = !A(G);
              if (he.htmlWhitespaceSensitivity !== "ignore") {
                let Xe = /^[\t\n\f\r ]*/, Qt = /[\t\n\f\r ]*$/, We = le && f(G, ["Template"]), lt = z && f(G, ["Template"]);
                if (v) {
                  if (lt || We)
                    return "";
                  let ct = [c], de = ne(_e);
                  return de && (ct = Se(de)), j(G) && (ct = ct.map((Ln) => t(Ln))), ct;
                }
                let [Ct] = _e.match(Xe), [Wt] = _e.match(Qt), Ue = [];
                if (Ct) {
                  Ue = [c];
                  let ct = ne(Ct);
                  ct && (Ue = Se(ct)), _e = _e.replace(Xe, "");
                }
                let gt = [];
                if (Wt) {
                  if (!We) {
                    gt = [c];
                    let ct = ne(Wt);
                    ct && (gt = Se(ct)), j(G) && (gt = gt.map((de) => t(de)));
                  }
                  _e = _e.replace(Qt, "");
                }
                return [...Ue, s(Le(_e)), ...gt];
              }
              let Be = ne(_e), je = ue(_e), Ke = Fe(_e);
              if ((z || le) && v && f(G, ["Block", "ElementNode", "Template"]))
                return "";
              v && Be ? (je = Math.min(Be, a), Ke = 0) : (k(G, ["BlockStatement", "ElementNode"]) && (Ke = Math.max(Ke, 1)), B(G, ["BlockStatement", "ElementNode"]) && (je = Math.max(je, 1)));
              let Ne = "", en = "";
              return Ke === 0 && k(G, ["MustacheStatement"]) && (en = " "), je === 0 && B(G, ["MustacheStatement"]) && (Ne = " "), z && (je = 0, Ne = ""), le && (Ke = 0, en = ""), _e = _e.replace(/^[\t\n\f\r ]+/g, Ne).replace(/[\t\n\f\r ]+$/, en), [...Se(je), s(Le(_e)), ...Se(Ke)];
            }
            case "MustacheCommentStatement": {
              let _e = C(me), Ce = w(me), v = he.originalText.charAt(_e + 2) === "~", z = he.originalText.charAt(Ce - 3) === "~", le = me.value.includes("}}") ? "--" : "";
              return ["{{", v ? "~" : "", "!", le, me.value, le, z ? "~" : "", "}}"];
            }
            case "PathExpression":
              return me.original;
            case "BooleanLiteral":
              return String(me.value);
            case "CommentStatement":
              return ["<!--", me.value, "-->"];
            case "StringLiteral": {
              if (He(G)) {
                let _e = he.singleQuote ? '"' : "'";
                return we(me.value, _e);
              }
              return we(me.value, Je);
            }
            case "NumberLiteral":
              return String(me.value);
            case "UndefinedLiteral":
              return "undefined";
            case "NullLiteral":
              return "null";
            default:
              throw new Error("unknown glimmer type: " + JSON.stringify(me.type));
          }
        }
        function E(G, he) {
          return C(G) - C(he);
        }
        function b(G, he) {
          let K = G.getValue(), me = ["attributes", "modifiers", "comments"].filter((_e) => D(K[_e])), Je = me.flatMap((_e) => K[_e]).sort(E);
          for (let _e of me)
            G.each((Ce) => {
              let v = Je.indexOf(Ce.getValue());
              Je.splice(v, 1, [c, he()]);
            }, _e);
          return D(K.blockParams) && Je.push(c, De(K)), ["<", K.tag, r(Je), T(K)];
        }
        function x(G, he, K) {
          let me = G.getValue().children.every((Je) => F(Je));
          return he.htmlWhitespaceSensitivity === "ignore" && me ? "" : G.map((Je, _e) => {
            let Ce = K();
            return _e === 0 && he.htmlWhitespaceSensitivity === "ignore" ? [h, Ce] : Ce;
          }, "children");
        }
        function T(G) {
          return d(G) ? n([h, "/>"], [" />", h]) : n([h, ">"], ">");
        }
        function I(G) {
          let he = G.escaped === !1 ? "{{{" : "{{", K = G.strip && G.strip.open ? "~" : "";
          return [he, K];
        }
        function $(G) {
          let he = G.escaped === !1 ? "}}}" : "}}";
          return [G.strip && G.strip.close ? "~" : "", he];
        }
        function V(G) {
          let he = I(G), K = G.openStrip.open ? "~" : "";
          return [he, K, "#"];
        }
        function M(G) {
          let he = $(G);
          return [G.openStrip.close ? "~" : "", he];
        }
        function U(G) {
          let he = I(G), K = G.closeStrip.open ? "~" : "";
          return [he, K, "/"];
        }
        function _(G) {
          let he = $(G);
          return [G.closeStrip.close ? "~" : "", he];
        }
        function ee(G) {
          let he = I(G), K = G.inverseStrip.open ? "~" : "";
          return [he, K];
        }
        function R(G) {
          let he = $(G);
          return [G.inverseStrip.close ? "~" : "", he];
        }
        function O(G, he) {
          let K = G.getValue(), me = [], Je = it(G, he);
          return Je && me.push(i(Je)), D(K.program.blockParams) && me.push(De(K.program)), i([V(K), Qe(G, he), me.length > 0 ? r([c, o(c, me)]) : "", h, M(K)]);
        }
        function Z(G, he) {
          return [he.htmlWhitespaceSensitivity === "ignore" ? e : "", ee(G), "else", R(G)];
        }
        function oe(G, he, K) {
          let me = G.getValue(), Je = G.getParentNode(1);
          return i([ee(Je), ["else", " ", K], r([c, i(it(G, he)), ...D(me.program.blockParams) ? [c, De(me.program)] : []]), h, R(Je)]);
        }
        function te(G, he, K) {
          let me = G.getValue();
          return K.htmlWhitespaceSensitivity === "ignore" ? [Ee(me) ? h : e, U(me), he("path"), _(me)] : [U(me), he("path"), _(me)];
        }
        function Ee(G) {
          return J(G, ["BlockStatement"]) && G.program.body.every((he) => F(he));
        }
        function q(G) {
          return Y(G) && G.inverse.body.length === 1 && J(G.inverse.body[0], ["BlockStatement"]) && G.inverse.body[0].path.parts[0] === G.path.parts[0];
        }
        function Y(G) {
          return J(G, ["BlockStatement"]) && G.inverse;
        }
        function ge(G, he, K) {
          let me = G.getValue();
          if (Ee(me))
            return "";
          let Je = he("program");
          return K.htmlWhitespaceSensitivity === "ignore" ? r([e, Je]) : r(Je);
        }
        function ye(G, he, K) {
          let me = G.getValue(), Je = he("inverse"), _e = K.htmlWhitespaceSensitivity === "ignore" ? [e, Je] : Je;
          return q(me) ? _e : Y(me) ? [Z(me, K), r(_e)] : "";
        }
        function Le(G) {
          return m(o(c, Q(G)));
        }
        function Q(G) {
          return G.split(/[\t\n\f\r ]+/);
        }
        function W(G) {
          for (let he = 0; he < 2; he++) {
            let K = G.getParentNode(he);
            if (K && K.type === "AttrNode")
              return K.name.toLowerCase();
          }
        }
        function ne(G) {
          return G = typeof G == "string" ? G : "", G.split(`
`).length - 1;
        }
        function ue(G) {
          G = typeof G == "string" ? G : "";
          let he = (G.match(/^([^\S\n\r]*[\n\r])+/g) || [])[0] || "";
          return ne(he);
        }
        function Fe(G) {
          G = typeof G == "string" ? G : "";
          let he = (G.match(/([\n\r][^\S\n\r]*)+$/g) || [])[0] || "";
          return ne(he);
        }
        function Se() {
          let G = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;
          return Array.from({ length: Math.min(G, a) }).fill(e);
        }
        function we(G, he) {
          let { quote: K, regex: me } = p(G, he);
          return [K, G.replace(me, `\\${K}`), K];
        }
        function He(G) {
          let he = 0, K = G.getParentNode(he);
          for (; K && J(K, ["SubExpression"]); )
            he++, K = G.getParentNode(he);
          return !!(K && J(G.getParentNode(he + 1), ["ConcatStatement"]) && J(G.getParentNode(he + 2), ["AttrNode"]));
        }
        function Ft(G, he) {
          let K = Qe(G, he), me = it(G, he);
          return me ? r([K, c, i(me)]) : K;
        }
        function ht(G, he) {
          let K = Qe(G, he), me = it(G, he);
          return me ? [r([K, c, me]), h] : K;
        }
        function Qe(G, he) {
          return he("path");
        }
        function it(G, he) {
          let K = G.getValue(), me = [];
          if (K.params.length > 0) {
            let Je = G.map(he, "params");
            me.push(...Je);
          }
          if (K.hash && K.hash.pairs.length > 0) {
            let Je = he("hash");
            me.push(Je);
          }
          return me.length === 0 ? "" : o(c, me);
        }
        function De(G) {
          return ["as |", G.blockParams.join(" "), "|"];
        }
        l.exports = { print: g, massageAstNode: P };
      } }), Co = X({ "src/language-handlebars/parsers.js"() {
        H();
      } }), Fo = X({ "node_modules/linguist-languages/data/Handlebars.json"(u, l) {
        l.exports = { name: "Handlebars", type: "markup", color: "#f7931e", aliases: ["hbs", "htmlbars"], extensions: [".handlebars", ".hbs"], tmScope: "text.html.handlebars", aceMode: "handlebars", languageId: 155 };
      } }), Ao = X({ "src/language-handlebars/index.js"(u, l) {
        H();
        var t = pr(), s = Eo(), i = Co(), e = [t(Fo(), () => ({ since: "2.3.0", parsers: ["glimmer"], vscodeLanguageIds: ["handlebars"] }))], n = { glimmer: s };
        l.exports = { languages: e, printers: n, parsers: i };
      } }), vo = X({ "src/language-graphql/pragma.js"(u, l) {
        H();
        function t(i) {
          return /^\s*#[^\S\n]*@(?:format|prettier)\s*(?:\n|$)/.test(i);
        }
        function s(i) {
          return `# @format

` + i;
        }
        l.exports = { hasPragma: t, insertPragma: s };
      } }), bo = X({ "src/language-graphql/loc.js"(u, l) {
        H();
        function t(i) {
          return typeof i.start == "number" ? i.start : i.loc && i.loc.start;
        }
        function s(i) {
          return typeof i.end == "number" ? i.end : i.loc && i.loc.end;
        }
        l.exports = { locStart: t, locEnd: s };
      } }), xo = X({ "src/language-graphql/printer-graphql.js"(u, l) {
        H();
        var { builders: { join: t, hardline: s, line: i, softline: e, group: n, indent: r, ifBreak: o } } = mt(), { isNextLineEmpty: c, isNonEmptyArray: h } = kt(), { insertPragma: m } = vo(), { locStart: y, locEnd: p } = bo();
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
      } }), So = X({ "src/language-graphql/options.js"(u, l) {
        H();
        var t = yr();
        l.exports = { bracketSpacing: t.bracketSpacing };
      } }), Bo = X({ "src/language-graphql/parsers.js"() {
        H();
      } }), To = X({ "node_modules/linguist-languages/data/GraphQL.json"(u, l) {
        l.exports = { name: "GraphQL", type: "data", color: "#e10098", extensions: [".graphql", ".gql", ".graphqls"], tmScope: "source.graphql", aceMode: "text", languageId: 139 };
      } }), wo = X({ "src/language-graphql/index.js"(u, l) {
        H();
        var t = pr(), s = xo(), i = So(), e = Bo(), n = [t(To(), () => ({ since: "1.5.0", parsers: ["graphql"], vscodeLanguageIds: ["graphql"] }))], r = { graphql: s };
        l.exports = { languages: n, options: i, printers: r, parsers: e };
      } }), ji = X({ "node_modules/collapse-white-space/index.js"(u, l) {
        H(), l.exports = t;
        function t(s) {
          return String(s).replace(/\s+/g, " ");
        }
      } }), Ii = X({ "src/language-markdown/loc.js"(u, l) {
        H();
        function t(i) {
          return i.position.start.offset;
        }
        function s(i) {
          return i.position.end.offset;
        }
        l.exports = { locStart: t, locEnd: s };
      } }), No = X({ "src/language-markdown/constants.evaluate.js"(u, l) {
        l.exports = { cjkPattern: "(?:[\\u02ea-\\u02eb\\u1100-\\u11ff\\u2e80-\\u2e99\\u2e9b-\\u2ef3\\u2f00-\\u2fd5\\u2ff0-\\u303f\\u3041-\\u3096\\u3099-\\u309f\\u30a1-\\u30fa\\u30fc-\\u30ff\\u3105-\\u312f\\u3131-\\u318e\\u3190-\\u3191\\u3196-\\u31ba\\u31c0-\\u31e3\\u31f0-\\u321e\\u322a-\\u3247\\u3260-\\u327e\\u328a-\\u32b0\\u32c0-\\u32cb\\u32d0-\\u3370\\u337b-\\u337f\\u33e0-\\u33fe\\u3400-\\u4db5\\u4e00-\\u9fef\\ua960-\\ua97c\\uac00-\\ud7a3\\ud7b0-\\ud7c6\\ud7cb-\\ud7fb\\uf900-\\ufa6d\\ufa70-\\ufad9\\ufe10-\\ufe1f\\ufe30-\\ufe6f\\uff00-\\uffef]|[\\ud840-\\ud868\\ud86a-\\ud86c\\ud86f-\\ud872\\ud874-\\ud879][\\udc00-\\udfff]|\\ud82c[\\udc00-\\udd1e\\udd50-\\udd52\\udd64-\\udd67]|\\ud83c[\\ude00\\ude50-\\ude51]|\\ud869[\\udc00-\\uded6\\udf00-\\udfff]|\\ud86d[\\udc00-\\udf34\\udf40-\\udfff]|\\ud86e[\\udc00-\\udc1d\\udc20-\\udfff]|\\ud873[\\udc00-\\udea1\\udeb0-\\udfff]|\\ud87a[\\udc00-\\udfe0]|\\ud87e[\\udc00-\\ude1d])(?:[\\ufe00-\\ufe0f]|\\udb40[\\udd00-\\uddef])?", kPattern: "[\\u1100-\\u11ff\\u3001-\\u3003\\u3008-\\u3011\\u3013-\\u301f\\u302e-\\u3030\\u3037\\u30fb\\u3131-\\u318e\\u3200-\\u321e\\u3260-\\u327e\\ua960-\\ua97c\\uac00-\\ud7a3\\ud7b0-\\ud7c6\\ud7cb-\\ud7fb\\ufe45-\\ufe46\\uff61-\\uff65\\uffa0-\\uffbe\\uffc2-\\uffc7\\uffca-\\uffcf\\uffd2-\\uffd7\\uffda-\\uffdc]", punctuationPattern: "[\\u0021-\\u002f\\u003a-\\u0040\\u005b-\\u0060\\u007b-\\u007e\\u00a1\\u00a7\\u00ab\\u00b6-\\u00b7\\u00bb\\u00bf\\u037e\\u0387\\u055a-\\u055f\\u0589-\\u058a\\u05be\\u05c0\\u05c3\\u05c6\\u05f3-\\u05f4\\u0609-\\u060a\\u060c-\\u060d\\u061b\\u061e-\\u061f\\u066a-\\u066d\\u06d4\\u0700-\\u070d\\u07f7-\\u07f9\\u0830-\\u083e\\u085e\\u0964-\\u0965\\u0970\\u09fd\\u0a76\\u0af0\\u0c77\\u0c84\\u0df4\\u0e4f\\u0e5a-\\u0e5b\\u0f04-\\u0f12\\u0f14\\u0f3a-\\u0f3d\\u0f85\\u0fd0-\\u0fd4\\u0fd9-\\u0fda\\u104a-\\u104f\\u10fb\\u1360-\\u1368\\u1400\\u166e\\u169b-\\u169c\\u16eb-\\u16ed\\u1735-\\u1736\\u17d4-\\u17d6\\u17d8-\\u17da\\u1800-\\u180a\\u1944-\\u1945\\u1a1e-\\u1a1f\\u1aa0-\\u1aa6\\u1aa8-\\u1aad\\u1b5a-\\u1b60\\u1bfc-\\u1bff\\u1c3b-\\u1c3f\\u1c7e-\\u1c7f\\u1cc0-\\u1cc7\\u1cd3\\u2010-\\u2027\\u2030-\\u2043\\u2045-\\u2051\\u2053-\\u205e\\u207d-\\u207e\\u208d-\\u208e\\u2308-\\u230b\\u2329-\\u232a\\u2768-\\u2775\\u27c5-\\u27c6\\u27e6-\\u27ef\\u2983-\\u2998\\u29d8-\\u29db\\u29fc-\\u29fd\\u2cf9-\\u2cfc\\u2cfe-\\u2cff\\u2d70\\u2e00-\\u2e2e\\u2e30-\\u2e4f\\u3001-\\u3003\\u3008-\\u3011\\u3014-\\u301f\\u3030\\u303d\\u30a0\\u30fb\\ua4fe-\\ua4ff\\ua60d-\\ua60f\\ua673\\ua67e\\ua6f2-\\ua6f7\\ua874-\\ua877\\ua8ce-\\ua8cf\\ua8f8-\\ua8fa\\ua8fc\\ua92e-\\ua92f\\ua95f\\ua9c1-\\ua9cd\\ua9de-\\ua9df\\uaa5c-\\uaa5f\\uaade-\\uaadf\\uaaf0-\\uaaf1\\uabeb\\ufd3e-\\ufd3f\\ufe10-\\ufe19\\ufe30-\\ufe52\\ufe54-\\ufe61\\ufe63\\ufe68\\ufe6a-\\ufe6b\\uff01-\\uff03\\uff05-\\uff0a\\uff0c-\\uff0f\\uff1a-\\uff1b\\uff1f-\\uff20\\uff3b-\\uff3d\\uff3f\\uff5b\\uff5d\\uff5f-\\uff65]|\\ud800[\\udd00-\\udd02\\udf9f\\udfd0]|\\ud801[\\udd6f]|\\ud802[\\udc57\\udd1f\\udd3f\\ude50-\\ude58\\ude7f\\udef0-\\udef6\\udf39-\\udf3f\\udf99-\\udf9c]|\\ud803[\\udf55-\\udf59]|\\ud804[\\udc47-\\udc4d\\udcbb-\\udcbc\\udcbe-\\udcc1\\udd40-\\udd43\\udd74-\\udd75\\uddc5-\\uddc8\\uddcd\\udddb\\udddd-\\udddf\\ude38-\\ude3d\\udea9]|\\ud805[\\udc4b-\\udc4f\\udc5b\\udc5d\\udcc6\\uddc1-\\uddd7\\ude41-\\ude43\\ude60-\\ude6c\\udf3c-\\udf3e]|\\ud806[\\udc3b\\udde2\\ude3f-\\ude46\\ude9a-\\ude9c\\ude9e-\\udea2]|\\ud807[\\udc41-\\udc45\\udc70-\\udc71\\udef7-\\udef8\\udfff]|\\ud809[\\udc70-\\udc74]|\\ud81a[\\ude6e-\\ude6f\\udef5\\udf37-\\udf3b\\udf44]|\\ud81b[\\ude97-\\ude9a\\udfe2]|\\ud82f[\\udc9f]|\\ud836[\\ude87-\\ude8b]|\\ud83a[\\udd5e-\\udd5f]" };
      } }), bu = X({ "src/language-markdown/utils.js"(u, l) {
        H();
        var { getLast: t } = kt(), { locStart: s, locEnd: i } = Ii(), { cjkPattern: e, kPattern: n, punctuationPattern: r } = No(), o = ["liquidNode", "inlineCode", "emphasis", "esComment", "strong", "delete", "wikiLink", "link", "linkReference", "image", "imageReference", "footnote", "footnoteReference", "sentence", "whitespace", "word", "break", "inlineMath"], c = [...o, "tableCell", "paragraph", "heading"], h = new RegExp(n), m = new RegExp(r);
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
      } }), ko = X({ "src/language-markdown/embed.js"(u, l) {
        H();
        var { inferParserByLanguage: t, getMaxContinuousCount: s } = kt(), { builders: { hardline: i, markAsRoot: e }, utils: { replaceEndOfLine: n } } = mt(), r = vu(), { getFencedCodeBlockValue: o } = bu();
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
      } }), _i = X({ "src/language-markdown/pragma.js"(u, l) {
        H();
        var t = Pi(), s = ["format", "prettier"];
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
      } }), Po = X({ "src/language-markdown/print-preprocess.js"(u, l) {
        H();
        var t = Fn(), { getOrderedListItemInfo: s, mapAst: i, splitText: e } = bu(), n = /^.$/su;
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
      } }), jo = X({ "src/language-markdown/clean.js"(u, l) {
        H();
        var t = ji(), { isFrontMatterNode: s } = kt(), { startWithPragma: i } = _i(), e = /* @__PURE__ */ new Set(["position", "raw"]);
        function n(r, o, c) {
          if ((r.type === "front-matter" || r.type === "code" || r.type === "yaml" || r.type === "import" || r.type === "export" || r.type === "jsx") && delete o.value, r.type === "list" && delete o.isAligned, (r.type === "list" || r.type === "listItem") && (delete o.spread, delete o.loose), r.type === "text" || (r.type === "inlineCode" && (o.value = r.value.replace(/[\t\n ]+/g, " ")), r.type === "wikiLink" && (o.value = r.value.trim().replace(/[\t\n]+/g, " ")), (r.type === "definition" || r.type === "linkReference" || r.type === "imageReference") && (o.label = t(r.label)), (r.type === "definition" || r.type === "link" || r.type === "image") && r.title && (o.title = r.title.replace(/\\(["')])/g, "$1")), c && c.type === "root" && c.children.length > 0 && (c.children[0] === r || s(c.children[0]) && c.children[1] === r) && r.type === "html" && i(r.value)))
            return null;
        }
        n.ignoredProperties = e, l.exports = n;
      } }), Io = X({ "src/language-markdown/printer-markdown.js"(u, l) {
        H();
        var t = ji(), { getLast: s, getMinNotPresentContinuousCount: i, getMaxContinuousCount: e, getStringWidth: n, isNonEmptyArray: r } = kt(), { builders: { breakParent: o, join: c, line: h, literalline: m, markAsRoot: y, hardline: p, softline: D, ifBreak: C, fill: w, align: P, indent: A, group: N, hardlineWithoutBreakParent: S }, utils: { normalizeDoc: j, replaceTextEndOfLine: k }, printer: { printDocToString: J } } = mt(), f = ko(), { insertPragma: B } = _i(), { locStart: d, locEnd: F } = Ii(), a = Po(), g = jo(), { getFencedCodeBlockValue: E, hasGitDiffFriendlyOrderedList: b, splitText: x, punctuationPattern: T, INLINE_NODE_TYPES: I, INLINE_NODE_WRAPPER_TYPES: $, isAutolink: V } = bu(), M = /* @__PURE__ */ new Set(["importExport"]), U = ["heading", "tableCell", "link", "wikiLink"], _ = /* @__PURE__ */ new Set(["listItem", "definition", "footnoteDefinition"]);
        function ee(De, G, he) {
          let K = De.getValue();
          if (Se(De))
            return x(G.originalText.slice(K.position.start.offset, K.position.end.offset), G).map((me) => me.type === "word" ? me.value : me.value === "" ? "" : q(De, me.value, G));
          switch (K.type) {
            case "front-matter":
              return G.originalText.slice(K.position.start.offset, K.position.end.offset);
            case "root":
              return K.children.length === 0 ? "" : [j(ge(De, G, he)), M.has(Q(K).type) ? "" : p];
            case "paragraph":
              return ye(De, G, he, { postprocessor: w });
            case "sentence":
              return ye(De, G, he);
            case "word": {
              let me = K.value.replace(/\*/g, "\\$&").replace(new RegExp([`(^|${T})(_+)`, `(_+)(${T}|$)`].join("|"), "g"), (Ce, v, z, le, Be) => (z ? `${v}${z}` : `${le}${Be}`).replace(/_/g, "\\_")), Je = (Ce, v, z) => Ce.type === "sentence" && z === 0, _e = (Ce, v, z) => V(Ce.children[z - 1]);
              return me !== K.value && (De.match(void 0, Je, _e) || De.match(void 0, Je, (Ce, v, z) => Ce.type === "emphasis" && z === 0, _e)) && (me = me.replace(/^(\\?[*_])+/, (Ce) => Ce.replace(/\\/g, ""))), me;
            }
            case "whitespace": {
              let me = De.getParentNode(), Je = me.children.indexOf(K), _e = me.children[Je + 1], Ce = _e && /^>|^(?:[*+-]|#{1,6}|\d+[).])$/.test(_e.value) ? "never" : G.proseWrap;
              return q(De, K.value, { proseWrap: Ce });
            }
            case "emphasis": {
              let me;
              if (V(K.children[0]))
                me = G.originalText[K.position.start.offset];
              else {
                let Je = De.getParentNode(), _e = Je.children.indexOf(K), Ce = Je.children[_e - 1], v = Je.children[_e + 1];
                me = Ce && Ce.type === "sentence" && Ce.children.length > 0 && s(Ce.children).type === "word" && !s(Ce.children).hasTrailingPunctuation || v && v.type === "sentence" && v.children.length > 0 && v.children[0].type === "word" && !v.children[0].hasLeadingPunctuation || Ee(De, "emphasis") ? "*" : "_";
              }
              return [me, ye(De, G, he), me];
            }
            case "strong":
              return ["**", ye(De, G, he), "**"];
            case "delete":
              return ["~~", ye(De, G, he), "~~"];
            case "inlineCode": {
              let me = i(K.value, "`"), Je = "`".repeat(me || 1), _e = me && !/^\s/.test(K.value) ? " " : "";
              return [Je, _e, K.value, _e, Je];
            }
            case "wikiLink": {
              let me = "";
              return G.proseWrap === "preserve" ? me = K.value : me = K.value.replace(/[\t\n]+/g, " "), ["[[", me, "]]"];
            }
            case "link":
              switch (G.originalText[K.position.start.offset]) {
                case "<": {
                  let me = "mailto:";
                  return ["<", K.url.startsWith(me) && G.originalText.slice(K.position.start.offset + 1, K.position.start.offset + 1 + me.length) !== me ? K.url.slice(me.length) : K.url, ">"];
                }
                case "[":
                  return ["[", ye(De, G, he), "](", we(K.url, ")"), He(K.title, G), ")"];
                default:
                  return G.originalText.slice(K.position.start.offset, K.position.end.offset);
              }
            case "image":
              return ["![", K.alt || "", "](", we(K.url, ")"), He(K.title, G), ")"];
            case "blockquote":
              return ["> ", P("> ", ye(De, G, he))];
            case "heading":
              return ["#".repeat(K.depth) + " ", ye(De, G, he)];
            case "code": {
              if (K.isIndented) {
                let _e = " ".repeat(4);
                return P(_e, [_e, ...k(K.value, p)]);
              }
              let me = G.__inJsTemplate ? "~" : "`", Je = me.repeat(Math.max(3, e(K.value, me) + 1));
              return [Je, K.lang || "", K.meta ? " " + K.meta : "", p, ...k(E(K, G.originalText), p), p, Je];
            }
            case "html": {
              let me = De.getParentNode(), Je = me.type === "root" && s(me.children) === K ? K.value.trimEnd() : K.value, _e = /^<!--.*-->$/s.test(Je);
              return k(Je, _e ? p : y(m));
            }
            case "list": {
              let me = Z(K, De.getParentNode()), Je = b(K, G);
              return ye(De, G, he, { processor: (_e, Ce) => {
                let v = le(), z = _e.getValue();
                if (z.children.length === 2 && z.children[1].type === "html" && z.children[0].position.start.column !== z.children[1].position.start.column)
                  return [v, R(_e, G, he, v)];
                return [v, P(" ".repeat(v.length), R(_e, G, he, v))];
                function le() {
                  let Be = K.ordered ? (Ce === 0 ? K.start : Je ? 1 : K.start + Ce) + (me % 2 === 0 ? ". " : ") ") : me % 2 === 0 ? "- " : "* ";
                  return K.isAligned || K.hasIndentedCodeblock ? O(Be, G) : Be;
                }
              } });
            }
            case "thematicBreak": {
              let me = te(De, "list");
              return me === -1 ? "---" : Z(De.getParentNode(me), De.getParentNode(me + 1)) % 2 === 0 ? "***" : "---";
            }
            case "linkReference":
              return ["[", ye(De, G, he), "]", K.referenceType === "full" ? Qe(K) : K.referenceType === "collapsed" ? "[]" : ""];
            case "imageReference":
              switch (K.referenceType) {
                case "full":
                  return ["![", K.alt || "", "]", Qe(K)];
                default:
                  return ["![", K.alt, "]", K.referenceType === "collapsed" ? "[]" : ""];
              }
            case "definition": {
              let me = G.proseWrap === "always" ? h : " ";
              return N([Qe(K), ":", A([me, we(K.url), K.title === null ? "" : [me, He(K.title, G, !1)]])]);
            }
            case "footnote":
              return ["[^", ye(De, G, he), "]"];
            case "footnoteReference":
              return it(K);
            case "footnoteDefinition": {
              let me = De.getParentNode().children[De.getName() + 1], Je = K.children.length === 1 && K.children[0].type === "paragraph" && (G.proseWrap === "never" || G.proseWrap === "preserve" && K.children[0].position.start.line === K.children[0].position.end.line);
              return [it(K), ": ", Je ? ye(De, G, he) : N([P(" ".repeat(4), ye(De, G, he, { processor: (_e, Ce) => Ce === 0 ? N([D, he()]) : he() })), me && me.type === "footnoteDefinition" ? D : ""])];
            }
            case "table":
              return Y(De, G, he);
            case "tableCell":
              return ye(De, G, he);
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
        function R(De, G, he, K) {
          let me = De.getValue(), Je = me.checked === null ? "" : me.checked ? "[x] " : "[ ] ";
          return [Je, ye(De, G, he, { processor: (_e, Ce) => {
            if (Ce === 0 && _e.getValue().type !== "list")
              return P(" ".repeat(Je.length), he());
            let v = " ".repeat(Ft(G.tabWidth - K.length, 0, 3));
            return [v, P(v, he())];
          } })];
        }
        function O(De, G) {
          let he = K();
          return De + " ".repeat(he >= 4 ? 0 : he);
          function K() {
            let me = De.length % G.tabWidth;
            return me === 0 ? 0 : G.tabWidth - me;
          }
        }
        function Z(De, G) {
          return oe(De, G, (he) => he.ordered === De.ordered);
        }
        function oe(De, G, he) {
          let K = -1;
          for (let me of G.children)
            if (me.type === De.type && he(me) ? K++ : K = -1, me === De)
              return K;
        }
        function te(De, G) {
          let he = Array.isArray(G) ? G : [G], K = -1, me;
          for (; me = De.getParentNode(++K); )
            if (he.includes(me.type))
              return K;
          return -1;
        }
        function Ee(De, G) {
          let he = te(De, G);
          return he === -1 ? null : De.getParentNode(he);
        }
        function q(De, G, he) {
          if (he.proseWrap === "preserve" && G === `
`)
            return p;
          let K = he.proseWrap === "always" && !Ee(De, U);
          return G !== "" ? K ? h : " " : K ? D : "";
        }
        function Y(De, G, he) {
          let K = De.getValue(), me = [], Je = De.map((Be) => Be.map((je, Ke) => {
            let Ne = J(he(), G).formatted, en = n(Ne);
            return me[Ke] = Math.max(me[Ke] || 3, en), { text: Ne, width: en };
          }, "children"), "children"), _e = v(!1);
          if (G.proseWrap !== "never")
            return [o, _e];
          let Ce = v(!0);
          return [o, N(C(Ce, _e))];
          function v(Be) {
            let je = [le(Je[0], Be), z(Be)];
            return Je.length > 1 && je.push(c(S, Je.slice(1).map((Ke) => le(Ke, Be)))), c(S, je);
          }
          function z(Be) {
            return `| ${me.map((je, Ke) => {
              let Ne = K.align[Ke], en = Ne === "center" || Ne === "left" ? ":" : "-", Xe = Ne === "center" || Ne === "right" ? ":" : "-", Qt = Be ? "-" : "-".repeat(je - 2);
              return `${en}${Qt}${Xe}`;
            }).join(" | ")} |`;
          }
          function le(Be, je) {
            return `| ${Be.map((Ke, Ne) => {
              let { text: en, width: Xe } = Ke;
              if (je)
                return en;
              let Qt = me[Ne] - Xe, We = K.align[Ne], lt = 0;
              We === "right" ? lt = Qt : We === "center" && (lt = Math.floor(Qt / 2));
              let Ct = Qt - lt;
              return `${" ".repeat(lt)}${en}${" ".repeat(Ct)}`;
            }).join(" | ")} |`;
          }
        }
        function ge(De, G, he) {
          let K = [], me = null, { children: Je } = De.getValue();
          for (let [_e, Ce] of Je.entries())
            switch (W(Ce)) {
              case "start":
                me === null && (me = { index: _e, offset: Ce.position.end.offset });
                break;
              case "end":
                me !== null && (K.push({ start: me, end: { index: _e, offset: Ce.position.start.offset } }), me = null);
                break;
            }
          return ye(De, G, he, { processor: (_e, Ce) => {
            if (K.length > 0) {
              let v = K[0];
              if (Ce === v.start.index)
                return [Le(Je[v.start.index]), G.originalText.slice(v.start.offset, v.end.offset), Le(Je[v.end.index])];
              if (v.start.index < Ce && Ce < v.end.index)
                return !1;
              if (Ce === v.end.index)
                return K.shift(), !1;
            }
            return he();
          } });
        }
        function ye(De, G, he) {
          let K = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, { postprocessor: me } = K, Je = K.processor || (() => he()), _e = De.getValue(), Ce = [], v;
          return De.each((z, le) => {
            let Be = z.getValue(), je = Je(z, le);
            if (je !== !1) {
              let Ke = { parts: Ce, prevNode: v, parentNode: _e, options: G };
              ne(Be, Ke) && (Ce.push(p), v && M.has(v.type) || (ue(Be, Ke) || Fe(Be, Ke)) && Ce.push(p), Fe(Be, Ke) && Ce.push(p)), Ce.push(je), v = Be;
            }
          }, "children"), me ? me(Ce) : Ce;
        }
        function Le(De) {
          if (De.type === "html")
            return De.value;
          if (De.type === "paragraph" && Array.isArray(De.children) && De.children.length === 1 && De.children[0].type === "esComment")
            return ["{/* ", De.children[0].value, " */}"];
        }
        function Q(De) {
          let G = De;
          for (; r(G.children); )
            G = s(G.children);
          return G;
        }
        function W(De) {
          let G;
          if (De.type === "html")
            G = De.value.match(/^<!--\s*prettier-ignore(?:-(start|end))?\s*-->$/);
          else {
            let he;
            De.type === "esComment" ? he = De : De.type === "paragraph" && De.children.length === 1 && De.children[0].type === "esComment" && (he = De.children[0]), he && (G = he.value.match(/^prettier-ignore(?:-(start|end))?$/));
          }
          return G ? G[1] || "next" : !1;
        }
        function ne(De, G) {
          let he = G.parts.length === 0, K = I.includes(De.type), me = De.type === "html" && $.includes(G.parentNode.type);
          return !he && !K && !me;
        }
        function ue(De, G) {
          var he, K, me;
          let Je = (G.prevNode && G.prevNode.type) === De.type && _.has(De.type), _e = G.parentNode.type === "listItem" && !G.parentNode.loose, Ce = ((he = G.prevNode) === null || he === void 0 ? void 0 : he.type) === "listItem" && G.prevNode.loose, v = W(G.prevNode) === "next", z = De.type === "html" && ((K = G.prevNode) === null || K === void 0 ? void 0 : K.type) === "html" && G.prevNode.position.end.line + 1 === De.position.start.line, le = De.type === "html" && G.parentNode.type === "listItem" && ((me = G.prevNode) === null || me === void 0 ? void 0 : me.type) === "paragraph" && G.prevNode.position.end.line + 1 === De.position.start.line;
          return Ce || !(Je || _e || v || z || le);
        }
        function Fe(De, G) {
          let he = G.prevNode && G.prevNode.type === "list", K = De.type === "code" && De.isIndented;
          return he && K;
        }
        function Se(De) {
          let G = Ee(De, ["linkReference", "imageReference"]);
          return G && (G.type !== "linkReference" || G.referenceType !== "full");
        }
        function we(De) {
          let G = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [], he = [" ", ...Array.isArray(G) ? G : [G]];
          return new RegExp(he.map((K) => `\\${K}`).join("|")).test(De) ? `<${De}>` : De;
        }
        function He(De, G) {
          let he = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
          if (!De)
            return "";
          if (he)
            return " " + He(De, G, !1);
          if (De = De.replace(/\\(["')])/g, "$1"), De.includes('"') && De.includes("'") && !De.includes(")"))
            return `(${De})`;
          let K = De.split("'").length - 1, me = De.split('"').length - 1, Je = K > me ? '"' : me > K || G.singleQuote ? "'" : '"';
          return De = De.replace(/\\/, "\\\\"), De = De.replace(new RegExp(`(${Je})`, "g"), "\\$1"), `${Je}${De}${Je}`;
        }
        function Ft(De, G, he) {
          return De < G ? G : De > he ? he : De;
        }
        function ht(De) {
          let G = Number(De.getName());
          if (G === 0)
            return !1;
          let he = De.getParentNode().children[G - 1];
          return W(he) === "next";
        }
        function Qe(De) {
          return `[${t(De.label)}]`;
        }
        function it(De) {
          return `[^${De.label}]`;
        }
        l.exports = { preprocess: a, print: ee, embed: f, massageAstNode: g, hasPrettierIgnore: ht, insertPragma: B };
      } }), _o = X({ "src/language-markdown/options.js"(u, l) {
        H();
        var t = yr();
        l.exports = { proseWrap: t.proseWrap, singleQuote: t.singleQuote };
      } }), Lo = X({ "src/language-markdown/parsers.js"() {
        H();
      } }), Li = X({ "node_modules/linguist-languages/data/Markdown.json"(u, l) {
        l.exports = { name: "Markdown", type: "prose", color: "#083fa1", aliases: ["pandoc"], aceMode: "markdown", codemirrorMode: "gfm", codemirrorMimeType: "text/x-gfm", wrap: !0, extensions: [".md", ".livemd", ".markdown", ".mdown", ".mdwn", ".mdx", ".mkd", ".mkdn", ".mkdown", ".ronn", ".scd", ".workbook"], filenames: ["contents.lr"], tmScope: "source.gfm", languageId: 222 };
      } }), Oo = X({ "src/language-markdown/index.js"(u, l) {
        H();
        var t = pr(), s = Io(), i = _o(), e = Lo(), n = [t(Li(), (o) => ({ since: "1.8.0", parsers: ["markdown"], vscodeLanguageIds: ["markdown"], filenames: [...o.filenames, "README"], extensions: o.extensions.filter((c) => c !== ".mdx") })), t(Li(), () => ({ name: "MDX", since: "1.15.0", parsers: ["mdx"], vscodeLanguageIds: ["mdx"], filenames: [], extensions: [".mdx"] }))], r = { mdast: s };
        l.exports = { languages: n, options: i, printers: r, parsers: e };
      } }), $o = X({ "src/language-html/clean.js"(u, l) {
        H();
        var { isFrontMatterNode: t } = kt(), s = /* @__PURE__ */ new Set(["sourceSpan", "startSourceSpan", "endSourceSpan", "nameSpan", "valueSpan"]);
        function i(e, n) {
          if (e.type === "text" || e.type === "comment" || t(e) || e.type === "yaml" || e.type === "toml")
            return null;
          e.type === "attribute" && delete n.value, e.type === "docType" && delete n.value;
        }
        i.ignoredProperties = s, l.exports = i;
      } }), Mo = X({ "src/language-html/constants.evaluate.js"(u, l) {
        l.exports = { CSS_DISPLAY_TAGS: { area: "none", base: "none", basefont: "none", datalist: "none", head: "none", link: "none", meta: "none", noembed: "none", noframes: "none", param: "block", rp: "none", script: "block", source: "block", style: "none", template: "inline", track: "block", title: "none", html: "block", body: "block", address: "block", blockquote: "block", center: "block", div: "block", figure: "block", figcaption: "block", footer: "block", form: "block", header: "block", hr: "block", legend: "block", listing: "block", main: "block", p: "block", plaintext: "block", pre: "block", xmp: "block", slot: "contents", ruby: "ruby", rt: "ruby-text", article: "block", aside: "block", h1: "block", h2: "block", h3: "block", h4: "block", h5: "block", h6: "block", hgroup: "block", nav: "block", section: "block", dir: "block", dd: "block", dl: "block", dt: "block", ol: "block", ul: "block", li: "list-item", table: "table", caption: "table-caption", colgroup: "table-column-group", col: "table-column", thead: "table-header-group", tbody: "table-row-group", tfoot: "table-footer-group", tr: "table-row", td: "table-cell", th: "table-cell", fieldset: "block", button: "inline-block", details: "block", summary: "block", dialog: "block", meter: "inline-block", progress: "inline-block", object: "inline-block", video: "inline-block", audio: "inline-block", select: "inline-block", option: "block", optgroup: "block" }, CSS_DISPLAY_DEFAULT: "inline", CSS_WHITE_SPACE_TAGS: { listing: "pre", plaintext: "pre", pre: "pre", xmp: "pre", nobr: "nowrap", table: "initial", textarea: "pre-wrap" }, CSS_WHITE_SPACE_DEFAULT: "normal" };
      } }), Ro = X({ "src/language-html/utils/is-unknown-namespace.js"(u, l) {
        H();
        function t(s) {
          return s.type === "element" && !s.hasExplicitNamespace && !["html", "svg"].includes(s.namespace);
        }
        l.exports = t;
      } }), hr = X({ "src/language-html/utils/index.js"(u, l) {
        H();
        var { inferParserByLanguage: t, isFrontMatterNode: s } = kt(), { builders: { line: i, hardline: e, join: n }, utils: { getDocParts: r, replaceTextEndOfLine: o } } = mt(), { CSS_DISPLAY_TAGS: c, CSS_DISPLAY_DEFAULT: h, CSS_WHITE_SPACE_TAGS: m, CSS_WHITE_SPACE_DEFAULT: y } = Mo(), p = Ro(), D = /* @__PURE__ */ new Set(["	", `
`, "\f", "\r", " "]), C = (v) => v.replace(/^[\t\n\f\r ]+/, ""), w = (v) => v.replace(/[\t\n\f\r ]+$/, ""), P = (v) => C(w(v)), A = (v) => v.replace(/^[\t\f\r ]*\n/g, ""), N = (v) => A(w(v)), S = (v) => v.split(/[\t\n\f\r ]+/), j = (v) => v.match(/^[\t\n\f\r ]*/)[0], k = (v) => {
          let [, z, le, Be] = v.match(/^([\t\n\f\r ]*)(.*?)([\t\n\f\r ]*)$/s);
          return { leadingWhitespace: z, trailingWhitespace: Be, text: le };
        }, J = (v) => /[\t\n\f\r ]/.test(v);
        function f(v, z) {
          return !!(v.type === "ieConditionalComment" && v.lastChild && !v.lastChild.isSelfClosing && !v.lastChild.endSourceSpan || v.type === "ieConditionalComment" && !v.complete || ue(v) && v.children.some((le) => le.type !== "text" && le.type !== "interpolation") || K(v, z) && !a(v) && v.type !== "interpolation");
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
          return He(v).startsWith("pre");
        }
        function x(v, z) {
          let le = Be();
          if (le && !v.prev && v.parent && v.parent.tagDefinition && v.parent.tagDefinition.ignoreFirstLf)
            return v.type === "interpolation";
          return le;
          function Be() {
            return s(v) ? !1 : (v.type === "text" || v.type === "interpolation") && v.prev && (v.prev.type === "text" || v.prev.type === "interpolation") ? !0 : !v.parent || v.parent.cssDisplay === "none" ? !1 : ue(v.parent) ? !0 : !(!v.prev && (v.parent.type === "root" || ue(v) && v.parent || a(v.parent) || G(v.parent, z) || !ye(v.parent.cssDisplay)) || v.prev && !W(v.prev.cssDisplay));
          }
        }
        function T(v, z) {
          return s(v) ? !1 : (v.type === "text" || v.type === "interpolation") && v.next && (v.next.type === "text" || v.next.type === "interpolation") ? !0 : !v.parent || v.parent.cssDisplay === "none" ? !1 : ue(v.parent) ? !0 : !(!v.next && (v.parent.type === "root" || ue(v) && v.parent || a(v.parent) || G(v.parent, z) || !Le(v.parent.cssDisplay)) || v.next && !Q(v.next.cssDisplay));
        }
        function I(v) {
          return ne(v.cssDisplay) && !a(v);
        }
        function $(v) {
          return s(v) || v.next && v.sourceSpan.end && v.sourceSpan.end.line + 1 < v.next.sourceSpan.start.line;
        }
        function V(v) {
          return M(v) || v.type === "element" && v.children.length > 0 && (["body", "script", "style"].includes(v.name) || v.children.some((z) => te(z))) || v.firstChild && v.firstChild === v.lastChild && v.firstChild.type !== "text" && R(v.firstChild) && (!v.lastChild.isTrailingSpaceSensitive || O(v.lastChild));
        }
        function M(v) {
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
        function oe(v) {
          return v.lastChild ? oe(v.lastChild) : v;
        }
        function te(v) {
          return v.children && v.children.some((z) => z.type !== "text");
        }
        function Ee(v) {
          let { type: z, lang: le } = v.attrMap;
          if (z === "module" || z === "text/javascript" || z === "text/babel" || z === "application/javascript" || le === "jsx")
            return "babel";
          if (z === "application/x-typescript" || le === "ts" || le === "tsx")
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
          let { lang: le } = v.attrMap;
          if (!le || le === "postcss" || le === "css")
            return "css";
          if (le === "scss")
            return "scss";
          if (le === "less")
            return "less";
          if (le === "stylus")
            return t("stylus", z);
        }
        function Y(v, z) {
          if (v.name === "script" && !v.attrMap.src)
            return !v.attrMap.lang && !v.attrMap.type ? "babel" : Ee(v);
          if (v.name === "style")
            return q(v, z);
          if (z && K(v, z))
            return Ee(v) || !("src" in v.attrMap) && t(v.attrMap.lang, z);
        }
        function ge(v) {
          return v === "block" || v === "list-item" || v.startsWith("table");
        }
        function ye(v) {
          return !ge(v) && v !== "inline-block";
        }
        function Le(v) {
          return !ge(v) && v !== "inline-block";
        }
        function Q(v) {
          return !ge(v);
        }
        function W(v) {
          return !ge(v);
        }
        function ne(v) {
          return !ge(v) && v !== "inline-block";
        }
        function ue(v) {
          return He(v).startsWith("pre");
        }
        function Fe(v, z) {
          let le = 0;
          for (let Be = v.stack.length - 1; Be >= 0; Be--) {
            let je = v.stack[Be];
            je && typeof je == "object" && !Array.isArray(je) && z(je) && le++;
          }
          return le;
        }
        function Se(v, z) {
          let le = v;
          for (; le; ) {
            if (z(le))
              return !0;
            le = le.parent;
          }
          return !1;
        }
        function we(v, z) {
          if (v.prev && v.prev.type === "comment") {
            let Be = v.prev.value.match(/^\s*display:\s*([a-z]+)\s*$/);
            if (Be)
              return Be[1];
          }
          let le = !1;
          if (v.type === "element" && v.namespace === "svg")
            if (Se(v, (Be) => Be.fullName === "svg:foreignObject"))
              le = !0;
            else
              return v.name === "svg" ? "inline-block" : "block";
          switch (z.htmlWhitespaceSensitivity) {
            case "strict":
              return "inline";
            case "ignore":
              return "block";
            default:
              return z.parser === "vue" && v.parent && v.parent.type === "root" ? "block" : v.type === "element" && (!v.namespace || le || p(v)) && c[v.name] || h;
          }
        }
        function He(v) {
          return v.type === "element" && (!v.namespace || p(v)) && m[v.name] || y;
        }
        function Ft(v) {
          let z = Number.POSITIVE_INFINITY;
          for (let le of v.split(`
`)) {
            if (le.length === 0)
              continue;
            if (!D.has(le[0]))
              return 0;
            let Be = j(le).length;
            le.length !== Be && Be < z && (z = Be);
          }
          return z === Number.POSITIVE_INFINITY ? 0 : z;
        }
        function ht(v) {
          let z = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : Ft(v);
          return z === 0 ? v : v.split(`
`).map((le) => le.slice(z)).join(`
`);
        }
        function Qe(v, z) {
          let le = 0;
          for (let Be = 0; Be < v.length; Be++)
            v[Be] === z && le++;
          return le;
        }
        function it(v) {
          return v.replace(/&apos;/g, "'").replace(/&quot;/g, '"');
        }
        var De = /* @__PURE__ */ new Set(["template", "style", "script"]);
        function G(v, z) {
          return he(v, z) && !De.has(v.fullName);
        }
        function he(v, z) {
          return z.parser === "vue" && v.type === "element" && v.parent.type === "root" && v.fullName.toLowerCase() !== "html";
        }
        function K(v, z) {
          return he(v, z) && (G(v, z) || v.attrMap.lang && v.attrMap.lang !== "html");
        }
        function me(v) {
          let z = v.fullName;
          return z.charAt(0) === "#" || z === "slot-scope" || z === "v-slot" || z.startsWith("v-slot:");
        }
        function Je(v, z) {
          let le = v.parent;
          if (!he(le, z))
            return !1;
          let Be = le.fullName, je = v.fullName;
          return Be === "script" && je === "setup" || Be === "style" && je === "vars";
        }
        function _e(v) {
          let z = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : v.value;
          return v.parent.isWhitespaceSensitive ? v.parent.isIndentationSensitive ? o(z) : o(ht(N(z)), e) : r(n(i, S(z)));
        }
        function Ce(v, z) {
          return he(v, z) && v.name === "script";
        }
        l.exports = { htmlTrim: P, htmlTrimPreserveIndentation: N, hasHtmlWhitespace: J, getLeadingAndTrailingHtmlWhitespace: k, canHaveInterpolation: g, countChars: Qe, countParents: Fe, dedentString: ht, forceBreakChildren: M, forceBreakContent: V, forceNextEmptyLine: $, getLastDescendant: oe, getNodeCssStyleDisplay: we, getNodeCssStyleWhiteSpace: He, hasPrettierIgnore: B, inferScriptParser: Y, isVueCustomBlock: G, isVueNonHtmlBlock: K, isVueScriptTag: Ce, isVueSlotAttribute: me, isVueSfcBindingsAttribute: Je, isVueSfcBlock: he, isDanglingSpaceSensitiveNode: I, isIndentationSensitiveNode: b, isLeadingSpaceSensitiveNode: x, isPreLikeNode: ue, isScriptLikeTag: a, isTextLikeNode: F, isTrailingSpaceSensitiveNode: T, isWhitespaceSensitiveNode: E, isUnknownNamespace: p, preferHardlineAsLeadingSpaces: U, preferHardlineAsTrailingSpaces: _, shouldPreserveContent: f, unescapeQuoteEntities: it, getTextValueParts: _e };
      } }), Vo = X({ "node_modules/angular-html-parser/lib/compiler/src/chars.js"(u) {
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
      } }), Jo = X({ "node_modules/angular-html-parser/lib/compiler/src/aot/static_symbol.js"(u) {
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
      } }), qo = X({ "node_modules/angular-html-parser/lib/compiler/src/util.js"(u) {
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
      } }), Go = X({ "node_modules/angular-html-parser/lib/compiler/src/compile_metadata.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = Jo(), t = qo(), s = /^(?:(?:\[([^\]]+)\])|(?:\(([^\)]+)\)))|(\@[-\w]+)$/;
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
            let { encapsulation: b, template: x, templateUrl: T, htmlAst: I, styles: $, styleUrls: V, externalStylesheets: M, animations: U, ngContentSelectors: _, interpolation: ee, isInline: R, preserveWhitespaces: O } = E;
            if (this.encapsulation = b, this.template = x, this.templateUrl = T, this.htmlAst = I, this.styles = k($), this.styleUrls = k(V), this.externalStylesheets = k(M), this.animations = U ? f(U) : [], this.ngContentSelectors = _ || [], ee && ee.length != 2)
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
            let { isHost: b, type: x, isComponent: T, selector: I, exportAs: $, changeDetection: V, inputs: M, outputs: U, host: _, providers: ee, viewProviders: R, queries: O, guards: Z, viewQueries: oe, entryComponents: te, template: Ee, componentViewType: q, rendererType: Y, componentFactory: ge } = E, ye = {}, Le = {}, Q = {};
            _ != null && Object.keys(_).forEach((ue) => {
              let Fe = _[ue], Se = ue.match(s);
              Se === null ? Q[ue] = Fe : Se[1] != null ? Le[Se[1]] = Fe : Se[2] != null && (ye[Se[2]] = Fe);
            });
            let W = {};
            M != null && M.forEach((ue) => {
              let Fe = t.splitAtColon(ue, [ue, ue]);
              W[Fe[0]] = Fe[1];
            });
            let ne = {};
            return U != null && U.forEach((ue) => {
              let Fe = t.splitAtColon(ue, [ue, ue]);
              ne[Fe[0]] = Fe[1];
            }), new P({ isHost: b, type: x, isComponent: !!T, selector: I, exportAs: $, changeDetection: V, inputs: W, outputs: ne, hostListeners: ye, hostProperties: Le, hostAttributes: Q, providers: ee, viewProviders: R, queries: O, guards: Z, viewQueries: oe, entryComponents: te, template: Ee, componentViewType: q, rendererType: Y, componentFactory: ge });
          }
          constructor(E) {
            let { isHost: b, type: x, isComponent: T, selector: I, exportAs: $, changeDetection: V, inputs: M, outputs: U, hostListeners: _, hostProperties: ee, hostAttributes: R, providers: O, viewProviders: Z, queries: oe, guards: te, viewQueries: Ee, entryComponents: q, template: Y, componentViewType: ge, rendererType: ye, componentFactory: Le } = E;
            this.isHost = !!b, this.type = x, this.isComponent = T, this.selector = I, this.exportAs = $, this.changeDetection = V, this.inputs = M, this.outputs = U, this.hostListeners = _, this.hostProperties = ee, this.hostAttributes = R, this.providers = k(O), this.viewProviders = k(Z), this.queries = k(oe), this.guards = te, this.viewQueries = k(Ee), this.entryComponents = k(q), this.template = Y, this.componentViewType = ge, this.rendererType = ye, this.componentFactory = Le;
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
            let { type: b, providers: x, declaredDirectives: T, exportedDirectives: I, declaredPipes: $, exportedPipes: V, entryComponents: M, bootstrapComponents: U, importedModules: _, exportedModules: ee, schemas: R, transitiveModule: O, id: Z } = E;
            this.type = b || null, this.declaredDirectives = k(T), this.exportedDirectives = k(I), this.declaredPipes = k($), this.exportedPipes = k(V), this.providers = k(x), this.entryComponents = k(M), this.bootstrapComponents = k(U), this.importedModules = k(_), this.exportedModules = k(ee), this.schemas = k(R), this.id = Z || null, this.transitiveModule = O || null;
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
            let { useClass: x, useValue: T, useExisting: I, useFactory: $, deps: V, multi: M } = b;
            this.token = E, this.useClass = x || null, this.useValue = T, this.useExisting = I, this.useFactory = $ || null, this.dependencies = V || null, this.multi = !!M;
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
      } }), Wo = X({ "node_modules/angular-html-parser/lib/compiler/src/parse_util.js"(u) {
        H(), Object.defineProperty(u, "__esModule", { value: !0 });
        var l = Vo(), t = Go(), s = class {
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
      } }), Xo = X({ "src/language-html/print-preprocess.js"(u, l) {
        H();
        var { ParseSourceSpan: t } = Wo(), { htmlTrim: s, getLeadingAndTrailingHtmlWhitespace: i, hasHtmlWhitespace: e, canHaveInterpolation: n, getNodeCssStyleDisplay: r, isDanglingSpaceSensitiveNode: o, isIndentationSensitiveNode: c, isLeadingSpaceSensitiveNode: h, isTrailingSpaceSensitiveNode: m, isWhitespaceSensitiveNode: y, isVueScriptTag: p } = hr(), D = [w, P, N, j, k, B, J, f, d, S, F];
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
                let $ = new t(T.sourceSpan.start, I.sourceSpan.end), V = new t($.start, x.sourceSpan.end);
                x.condition = T.condition, x.sourceSpan = V, x.startSourceSpan = $, x.removeChild(I);
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
                let T = x.sourceSpan.start, I = null, $ = x.value.split(E);
                for (let V = 0; V < $.length; V++, T = I) {
                  let M = $[V];
                  if (V % 2 === 0) {
                    I = T.moveBy(M.length), M.length > 0 && b.insertChildBefore(x, { type: "text", value: M, sourceSpan: new t(T, I) });
                    continue;
                  }
                  I = T.moveBy(M.length + 4), b.insertChildBefore(x, { type: "interpolation", sourceSpan: new t(T, I), children: M.length === 0 ? [] : [{ type: "text", value: M, sourceSpan: new t(T.moveBy(2), I.moveBy(-2)) }] });
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
                let { leadingWhitespace: I, text: $, trailingWhitespace: V } = i(T.value), M = T.prev, U = T.next;
                $ ? (T.value = $, T.sourceSpan = new t(T.sourceSpan.start.moveBy(I.length), T.sourceSpan.end.moveBy(-V.length)), I && (M && (M.hasTrailingSpaces = !0), T.hasLeadingSpaces = !0), V && (T.hasTrailingSpaces = !0, U && (U.hasLeadingSpaces = !0))) : (g.removeChild(T), x--, (I || V) && (M && (M.hasTrailingSpaces = !0), U && (U.hasLeadingSpaces = !0)));
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
      } }), Uo = X({ "src/language-html/pragma.js"(u, l) {
        H();
        function t(i) {
          return /^\s*<!--\s*@(?:format|prettier)\s*-->/.test(i);
        }
        function s(i) {
          return `<!-- @format -->

` + i.replace(/^\s*\n/, "");
        }
        l.exports = { hasPragma: t, insertPragma: s };
      } }), xu = X({ "src/language-html/loc.js"(u, l) {
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
        var t = Br(), { isNonEmptyArray: s } = kt(), { builders: { indent: i, join: e, line: n, softline: r, hardline: o }, utils: { replaceTextEndOfLine: c } } = mt(), { locStart: h, locEnd: m } = xu(), { isTextLikeNode: y, getLastDescendant: p, isPreLikeNode: D, hasPrettierIgnore: C, shouldPreserveContent: w, isVueSfcBlock: P } = hr();
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
          return a(_) ? J(_.parent, ee) : g(_) ? M(_.next) : "";
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
          let Z = O.prev && O.prev.type === "comment" && E(O.prev.value), oe = typeof Z == "boolean" ? () => Z : Array.isArray(Z) ? (ge) => Z.includes(ge.rawName) : () => !1, te = _.map((ge) => {
            let ye = ge.getValue();
            return oe(ye) ? c(ee.originalText.slice(h(ye), m(ye))) : R();
          }, "attrs"), Ee = O.type === "element" && O.fullName === "script" && O.attrs.length === 1 && O.attrs[0].fullName === "src" && O.children.length === 0, q = ee.singleAttributePerLine && O.attrs.length > 1 && !P(O, ee) ? o : n, Y = [i([Ee ? " " : n, e(q, te)])];
          return O.firstChild && b(O.firstChild) || O.isSelfClosing && F(O.parent) || Ee ? Y.push(O.isSelfClosing ? " " : "") : Y.push(ee.bracketSameLine ? O.isSelfClosing ? " " : "" : O.isSelfClosing ? n : r), Y;
        }
        function T(_) {
          return _.firstChild && b(_.firstChild) ? "" : U(_);
        }
        function I(_, ee, R) {
          let O = _.getValue();
          return [$(O, ee), x(_, ee, R), O.isSelfClosing ? "" : T(O)];
        }
        function $(_, ee) {
          return _.prev && g(_.prev) ? "" : [V(_, ee), M(_)];
        }
        function V(_, ee) {
          return b(_) ? U(_.parent) : d(_) ? f(_.prev, ee) : "";
        }
        function M(_) {
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
        l.exports = { printClosingTag: A, printClosingTagStart: N, printClosingTagStartMarker: J, printClosingTagEndMarker: f, printClosingTagSuffix: k, printClosingTagEnd: S, needsToBorrowLastChildClosingTagEndMarker: F, needsToBorrowParentClosingTagStartMarker: a, needsToBorrowPrevClosingTagEndMarker: d, printOpeningTag: I, printOpeningTagStart: $, printOpeningTagPrefix: V, printOpeningTagStartMarker: M, printOpeningTagEndMarker: U, needsToBorrowNextOpeningTagStartMarker: g, needsToBorrowParentOpeningTagEndMarker: b };
      } }), zo = X({ "node_modules/parse-srcset/src/parse-srcset.js"(u, l) {
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
      } }), Yo = X({ "src/language-html/syntax-attribute.js"(u, l) {
        H();
        var t = zo(), { builders: { ifBreak: s, join: i, line: e } } = mt();
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
      } }), Ko = X({ "src/language-html/syntax-vue.js"(u, l) {
        H();
        var { builders: { group: t } } = mt();
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
      } }), Oi = X({ "src/language-html/get-node-content.js"(u, l) {
        H();
        var { needsToBorrowParentClosingTagStartMarker: t, printClosingTagStartMarker: s, needsToBorrowLastChildClosingTagEndMarker: i, printClosingTagEndMarker: e, needsToBorrowParentOpeningTagEndMarker: n, printOpeningTagEndMarker: r } = Pr();
        function o(c, h) {
          let m = c.startSourceSpan.end.offset;
          c.firstChild && n(c.firstChild) && (m -= r(c).length);
          let y = c.endSourceSpan.start.offset;
          return c.lastChild && t(c.lastChild) ? y += s(c, h).length : i(c) && (y -= e(c.lastChild, h).length), h.originalText.slice(m, y);
        }
        l.exports = o;
      } }), Qo = X({ "src/language-html/embed.js"(u, l) {
        H();
        var { builders: { breakParent: t, group: s, hardline: i, indent: e, line: n, fill: r, softline: o }, utils: { mapDoc: c, replaceTextEndOfLine: h } } = mt(), m = vu(), { printClosingTag: y, printClosingTagSuffix: p, needsToBorrowPrevClosingTagEndMarker: D, printOpeningTagPrefix: C, printOpeningTag: w } = Pr(), { printImgSrcset: P, printClassNames: A } = Yo(), { printVueFor: N, printVueBindings: S, isVueEventBindingExpression: j } = Ko(), { isScriptLikeTag: k, isVueNonHtmlBlock: J, inferScriptParser: f, htmlTrimPreserveIndentation: B, dedentString: d, unescapeQuoteEntities: F, isVueSlotAttribute: a, isVueSfcBindingsAttribute: g, getTextValueParts: E } = hr(), b = Oi();
        function x(I, $, V) {
          let M = (te) => new RegExp(te.join("|")).test(I.fullName), U = () => F(I.value), _ = !1, ee = (te, Ee) => {
            let q = te.type === "NGRoot" ? te.node.type === "NGMicrosyntax" && te.node.body.length === 1 && te.node.body[0].type === "NGMicrosyntaxExpression" ? te.node.body[0].expression : te.node : te.type === "JsExpressionRoot" ? te.node : te;
            q && (q.type === "ObjectExpression" || q.type === "ArrayExpression" || Ee.parser === "__vue_expression" && (q.type === "TemplateLiteral" || q.type === "StringLiteral")) && (_ = !0);
          }, R = (te) => s(te), O = function(te) {
            let Ee = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
            return s([e([o, te]), Ee ? o : ""]);
          }, Z = (te) => _ ? R(te) : O(te), oe = (te, Ee) => $(te, Object.assign({ __onHtmlBindingRoot: ee, __embeddedInHtml: !0 }, Ee));
          if (I.fullName === "srcset" && (I.parent.fullName === "img" || I.parent.fullName === "source"))
            return O(P(U()));
          if (I.fullName === "class" && !V.parentParser) {
            let te = U();
            if (!te.includes("{{"))
              return A(te);
          }
          if (I.fullName === "style" && !V.parentParser) {
            let te = U();
            if (!te.includes("{{"))
              return O(oe(te, { parser: "css", __isHTMLStyleAttribute: !0 }));
          }
          if (V.parser === "vue") {
            if (I.fullName === "v-for")
              return N(U(), oe);
            if (a(I) || g(I, V))
              return S(U(), oe);
            let te = ["^@", "^v-on:"], Ee = ["^:", "^v-bind:"], q = ["^v-"];
            if (M(te)) {
              let Y = U(), ge = j(Y) ? "__js_expression" : V.__should_parse_vue_template_with_ts ? "__vue_ts_event_binding" : "__vue_event_binding";
              return Z(oe(Y, { parser: ge }));
            }
            if (M(Ee))
              return Z(oe(U(), { parser: "__vue_expression" }));
            if (M(q))
              return Z(oe(U(), { parser: "__js_expression" }));
          }
          if (V.parser === "angular") {
            let te = (Q, W) => oe(Q, Object.assign(Object.assign({}, W), {}, { trailingComma: "none" })), Ee = ["^\\*"], q = ["^\\(.+\\)$", "^on-"], Y = ["^\\[.+\\]$", "^bind(on)?-", "^ng-(if|show|hide|class|style)$"], ge = ["^i18n(-.+)?$"];
            if (M(q))
              return Z(te(U(), { parser: "__ng_action" }));
            if (M(Y))
              return Z(te(U(), { parser: "__ng_binding" }));
            if (M(ge)) {
              let Q = U().trim();
              return O(r(E(I, Q)), !Q.includes("@@"));
            }
            if (M(Ee))
              return Z(te(U(), { parser: "__ng_directive" }));
            let ye = /{{(.+?)}}/s, Le = U();
            if (ye.test(Le)) {
              let Q = [];
              for (let [W, ne] of Le.split(ye).entries())
                if (W % 2 === 0)
                  Q.push(h(ne));
                else
                  try {
                    Q.push(s(["{{", e([n, te(ne, { parser: "__ng_interpolation", __isInHtmlInterpolation: !0 })]), n, "}}"]));
                  } catch {
                    Q.push("{{", h(ne), "}}");
                  }
              return s(Q);
            }
          }
          return null;
        }
        function T(I, $, V, M) {
          let U = I.getValue();
          switch (U.type) {
            case "element": {
              if (k(U) || U.type === "interpolation")
                return;
              if (!U.isSelfClosing && J(U, M)) {
                let _ = f(U, M);
                if (!_)
                  return;
                let ee = b(U, M), R = /^\s*$/.test(ee), O = "";
                return R || (O = V(B(ee), { parser: _, __embeddedInHtml: !0 }, { stripTrailingHardline: !0 }), R = O === ""), [C(U, M), s(w(I, M, $)), R ? "" : i, O, R ? "" : i, y(U, M), p(U, M)];
              }
              break;
            }
            case "text": {
              if (k(U.parent)) {
                let _ = f(U.parent, M);
                if (_) {
                  let ee = _ === "markdown" ? d(U.value.replace(/^[^\S\n]*\n/, "")) : U.value, R = { parser: _, __embeddedInHtml: !0 };
                  if (M.parser === "html" && _ === "babel") {
                    let O = "script", { attrMap: Z } = U.parent;
                    Z && (Z.type === "module" || Z.type === "text/babel" && Z["data-type"] === "module") && (O = "module"), R.__babelSourceType = O;
                  }
                  return [t, C(U, M), V(ee, R, { stripTrailingHardline: !0 }), p(U, M)];
                }
              } else if (U.parent.type === "interpolation") {
                let _ = { __isInHtmlInterpolation: !0, __embeddedInHtml: !0 };
                return M.parser === "angular" ? (_.parser = "__ng_interpolation", _.trailingComma = "none") : M.parser === "vue" ? _.parser = M.__should_parse_vue_template_with_ts ? "__vue_ts_expression" : "__vue_expression" : _.parser = "__js_expression", [e([n, V(U.value, _, { stripTrailingHardline: !0 })]), U.parent.next && D(U.parent.next) ? " " : n];
              }
              break;
            }
            case "attribute": {
              if (!U.value)
                break;
              if (/^PRETTIER_HTML_PLACEHOLDER_\d+_\d+_IN_JS$/.test(M.originalText.slice(U.valueSpan.start.offset, U.valueSpan.end.offset)))
                return [U.rawName, "=", U.value];
              if (M.parser === "lwc" && /^{.*}$/s.test(M.originalText.slice(U.valueSpan.start.offset, U.valueSpan.end.offset)))
                return [U.rawName, "=", U.value];
              let _ = x(U, (ee, R) => V(ee, Object.assign({ __isInHtmlAttribute: !0, __embeddedInHtml: !0 }, R), { stripTrailingHardline: !0 }), M);
              if (_)
                return [U.rawName, '="', s(c(_, (ee) => typeof ee == "string" ? ee.replace(/"/g, "&quot;") : ee)), '"'];
              break;
            }
            case "front-matter":
              return m(U, V);
          }
        }
        l.exports = T;
      } }), $i = X({ "src/language-html/print/children.js"(u, l) {
        H();
        var { builders: { breakParent: t, group: s, ifBreak: i, line: e, softline: n, hardline: r }, utils: { replaceTextEndOfLine: o } } = mt(), { locStart: c, locEnd: h } = xu(), { forceBreakChildren: m, forceNextEmptyLine: y, isTextLikeNode: p, hasPrettierIgnore: D, preferHardlineAsLeadingSpaces: C } = hr(), { printOpeningTagPrefix: w, needsToBorrowNextOpeningTagStartMarker: P, printOpeningTagStartMarker: A, needsToBorrowPrevClosingTagEndMarker: N, printClosingTagEndMarker: S, printClosingTagSuffix: j, needsToBorrowParentClosingTagStartMarker: k } = Pr();
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
            let I = [], $ = [], V = [], M = [], U = T.prev ? f(T.prev, T) : "", _ = T.next ? f(T, T.next) : "";
            return U && (y(T.prev) ? I.push(r, r) : U === r ? I.push(r) : p(T.prev) ? $.push(U) : $.push(i("", n, { groupId: E[x - 1] }))), _ && (y(T) ? p(T.next) && M.push(r, r) : _ === r ? p(T.next) && M.push(r) : V.push(_)), [...I, s([...$, s([J(b, F, a), ...V], { id: E[x] })]), ...M];
          }, "children");
        }
        l.exports = { printChildren: B };
      } }), Ho = X({ "src/language-html/print/element.js"(u, l) {
        H();
        var { builders: { breakParent: t, dedentToRoot: s, group: i, ifBreak: e, indentIfBreak: n, indent: r, line: o, softline: c }, utils: { replaceTextEndOfLine: h } } = mt(), m = Oi(), { shouldPreserveContent: y, isScriptLikeTag: p, isVueCustomBlock: D, countParents: C, forceBreakContent: w } = hr(), { printOpeningTagPrefix: P, printOpeningTag: A, printClosingTagSuffix: N, printClosingTag: S, needsToBorrowPrevClosingTagEndMarker: j, needsToBorrowLastChildClosingTagEndMarker: k } = Pr(), { printChildren: J } = $i();
        function f(B, d, F) {
          let a = B.getValue();
          if (y(a, d))
            return [P(a, d), i(A(B, d, F)), ...h(m(a, d)), ...S(a, d), N(a, d)];
          let g = a.children.length === 1 && a.firstChild.type === "interpolation" && a.firstChild.isLeadingSpaceSensitive && !a.firstChild.hasLeadingSpaces && a.lastChild.isTrailingSpaceSensitive && !a.lastChild.hasTrailingSpaces, E = Symbol("element-attr-group-id"), b = ($) => i([i(A(B, d, F), { id: E }), $, S(a, d)]), x = ($) => g ? n($, { groupId: E }) : (p(a) || D(a, d)) && a.parent.type === "root" && d.parser === "vue" && !d.vueIndentScriptAndStyle ? $ : r($), T = () => g ? e(c, "", { groupId: E }) : a.firstChild.hasLeadingSpaces && a.firstChild.isLeadingSpaceSensitive ? o : a.firstChild.type === "text" && a.isWhitespaceSensitive && a.isIndentationSensitive ? s(c) : c, I = () => (a.next ? j(a.next) : k(a.parent)) ? a.lastChild.hasTrailingSpaces && a.lastChild.isTrailingSpaceSensitive ? " " : "" : g ? e(c, "", { groupId: E }) : a.lastChild.hasTrailingSpaces && a.lastChild.isTrailingSpaceSensitive ? o : (a.lastChild.type === "comment" || a.lastChild.type === "text" && a.isWhitespaceSensitive && a.isIndentationSensitive) && new RegExp(`\\n[\\t ]{${d.tabWidth * C(B, ($) => $.parent && $.parent.type !== "root")}}$`).test(a.lastChild.value) ? "" : c;
          return a.children.length === 0 ? b(a.hasDanglingSpaces && a.isDanglingSpaceSensitive ? o : "") : b([w(a) ? t : "", x([T(), J(B, d, F)]), I()]);
        }
        l.exports = { printElement: f };
      } }), Zo = X({ "src/language-html/printer-html.js"(u, l) {
        H();
        var { builders: { fill: t, group: s, hardline: i, literalline: e }, utils: { cleanDoc: n, getDocParts: r, isConcat: o, replaceTextEndOfLine: c } } = mt(), h = $o(), { countChars: m, unescapeQuoteEntities: y, getTextValueParts: p } = hr(), D = Xo(), { insertPragma: C } = Uo(), { locStart: w, locEnd: P } = xu(), A = Qo(), { printClosingTagSuffix: N, printClosingTagEnd: S, printOpeningTagPrefix: j, printOpeningTagStart: k } = Pr(), { printElement: J } = Ho(), { printChildren: f } = $i();
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
      } }), el = X({ "src/language-html/options.js"(u, l) {
        H();
        var t = yr(), s = "HTML";
        l.exports = { bracketSameLine: t.bracketSameLine, htmlWhitespaceSensitivity: { since: "1.15.0", category: s, type: "choice", default: "css", description: "How to handle whitespaces in HTML.", choices: [{ value: "css", description: "Respect the default value of CSS display property." }, { value: "strict", description: "Whitespaces are considered sensitive." }, { value: "ignore", description: "Whitespaces are considered insensitive." }] }, singleAttributePerLine: t.singleAttributePerLine, vueIndentScriptAndStyle: { since: "1.19.0", category: s, type: "boolean", default: !1, description: "Indent script and style tags in Vue files." } };
      } }), tl = X({ "src/language-html/parsers.js"() {
        H();
      } }), Su = X({ "node_modules/linguist-languages/data/HTML.json"(u, l) {
        l.exports = { name: "HTML", type: "markup", tmScope: "text.html.basic", aceMode: "html", codemirrorMode: "htmlmixed", codemirrorMimeType: "text/html", color: "#e34c26", aliases: ["xhtml"], extensions: [".html", ".hta", ".htm", ".html.hl", ".inc", ".xht", ".xhtml"], languageId: 146 };
      } }), nl = X({ "node_modules/linguist-languages/data/Vue.json"(u, l) {
        l.exports = { name: "Vue", type: "markup", color: "#41b883", extensions: [".vue"], tmScope: "text.html.vue", aceMode: "html", languageId: 391 };
      } }), rl = X({ "src/language-html/index.js"(u, l) {
        H();
        var t = pr(), s = Zo(), i = el(), e = tl(), n = [t(Su(), () => ({ name: "Angular", since: "1.15.0", parsers: ["angular"], vscodeLanguageIds: ["html"], extensions: [".component.html"], filenames: [] })), t(Su(), (o) => ({ since: "1.15.0", parsers: ["html"], vscodeLanguageIds: ["html"], extensions: [...o.extensions, ".mjml"] })), t(Su(), () => ({ name: "Lightning Web Components", since: "1.17.0", parsers: ["lwc"], vscodeLanguageIds: ["html"], extensions: [], filenames: [] })), t(nl(), () => ({ since: "1.10.0", parsers: ["vue"], vscodeLanguageIds: ["vue"] }))], r = { html: s };
        l.exports = { languages: n, printers: r, options: i, parsers: e };
      } }), ul = X({ "src/language-yaml/pragma.js"(u, l) {
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
      } }), il = X({ "src/language-yaml/loc.js"(u, l) {
        H();
        function t(i) {
          return i.position.start.offset;
        }
        function s(i) {
          return i.position.end.offset;
        }
        l.exports = { locStart: t, locEnd: s };
      } }), al = X({ "src/language-yaml/embed.js"(u, l) {
        H();
        function t(s, i, e, n) {
          if (s.getValue().type === "root" && n.filepath && /(?:[/\\]|^)\.(?:prettier|stylelint|lintstaged)rc$/.test(n.filepath))
            return e(n.originalText, Object.assign(Object.assign({}, n), {}, { parser: "json" }));
        }
        l.exports = t;
      } }), Er = X({ "src/language-yaml/utils.js"(u, l) {
        H();
        var { getLast: t, isNonEmptyArray: s } = kt();
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
          return x(b.map((T) => T.length === 0 ? [] : S(T)).reduce((T, I, $) => $ !== 0 && b[$ - 1].length > 0 && I.length > 0 && !/^\s/.test(I[0]) && !/^\s|\s$/.test(t(T)) ? [...T.slice(0, -1), [...t(T), ...I]] : [...T, I], []).map((T) => T.reduce((I, $) => I.length > 0 && /\s$/.test(t(I)) ? [...I.slice(0, -1), t(I) + " " + $] : [...I, $], [])).map((T) => a.proseWrap === "never" ? [T.join(" ")] : T));
          function x(T) {
            if (f.chomping === "keep")
              return t(T).length === 0 ? T.slice(0, -1) : T;
            let I = 0;
            for (let $ = T.length - 1; $ >= 0 && T[$].length === 0; $--)
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
      } }), sl = X({ "src/language-yaml/print-preprocess.js"(u, l) {
        H();
        var { defineShortcut: t, mapNode: s } = Er();
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
      } }), Kr = X({ "src/language-yaml/print/misc.js"(u, l) {
        H();
        var { builders: { softline: t, align: s } } = mt(), { hasEndComments: i, isNextLineEmpty: e, isNode: n } = Er(), r = /* @__PURE__ */ new WeakMap();
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
      } }), ol = X({ "src/language-yaml/print/flow-mapping-sequence.js"(u, l) {
        H();
        var { builders: { ifBreak: t, line: s, softline: i, hardline: e, join: n } } = mt(), { isEmptyNode: r, getLast: o, hasEndComments: c } = Er(), { printNextEmptyLine: h, alignWithSpaces: m } = Kr();
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
      } }), ll = X({ "src/language-yaml/print/mapping-item.js"(u, l) {
        H();
        var { builders: { conditionalGroup: t, group: s, hardline: i, ifBreak: e, join: n, line: r } } = mt(), { hasLeadingComments: o, hasMiddleComments: c, hasTrailingComment: h, hasEndComments: m, isNode: y, isEmptyNode: p, isInlineNode: D } = Er(), { alignWithSpaces: C } = Kr();
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
            return ["? ", C(2, g), i, n("", k.map(J, "value", "leadingComments").map((M) => [M, i])), ": ", C(2, b)];
          if (N(B.content) && !o(B.content) && !c(B.content) && !h(B.content) && !m(B) && !o(d.content) && !c(d.content) && !m(d) && P(d.content, f))
            return [g, E, ": ", b];
          let x = Symbol("mappingKey"), T = s([e("? "), s(C(2, g), { id: x })]), I = [i, ": ", C(2, b)], $ = [E, ":"];
          o(d.content) || m(d) && d.content && !y(d.content, ["mapping", "sequence"]) || j.type === "mapping" && h(B.content) && D(d.content) || y(d.content, ["mapping", "sequence"]) && d.content.tag === null && d.content.anchor === null ? $.push(i) : d.content && $.push(r), $.push(b);
          let V = C(f.tabWidth, $);
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
      } }), pl = X({ "src/language-yaml/print/block.js"(u, l) {
        H();
        var { builders: { dedent: t, dedentToRoot: s, fill: i, hardline: e, join: n, line: r, literalline: o, markAsRoot: c }, utils: { getDocParts: h } } = mt(), { getAncestorCount: m, getBlockValueLineContents: y, hasIndicatorComment: p, isLastDescendantNode: D, isNode: C } = Er(), { alignWithSpaces: w } = Kr();
        function P(A, N, S) {
          let j = A.getValue(), k = m(A, (F) => C(F, ["sequence", "mapping"])), J = D(A), f = [j.type === "blockFolded" ? ">" : "|"];
          j.indent !== null && f.push(j.indent.toString()), j.chomping !== "clip" && f.push(j.chomping === "keep" ? "+" : "-"), p(j) && f.push(" ", N("indicatorComment"));
          let B = y(j, { parentIndent: k, isLastDescendant: J, options: S }), d = [];
          for (let [F, a] of B.entries())
            F === 0 && d.push(e), d.push(i(h(n(r, a)))), F !== B.length - 1 ? d.push(a.length === 0 ? e : c(o)) : j.chomping === "keep" && J && d.push(s(a.length === 0 ? e : o));
          return j.indent === null ? f.push(t(w(S.tabWidth, d))) : f.push(s(w(j.indent - 1 + k, d))), f;
        }
        l.exports = P;
      } }), cl = X({ "src/language-yaml/printer-yaml.js"(u, l) {
        H();
        var { builders: { breakParent: t, fill: s, group: i, hardline: e, join: n, line: r, lineSuffix: o, literalline: c }, utils: { getDocParts: h, replaceTextEndOfLine: m } } = mt(), { isPreviousLineEmpty: y } = kt(), { insertPragma: p, isPragma: D } = ul(), { locStart: C } = il(), w = al(), { getFlowScalarLineContents: P, getLastDescendantNode: A, hasLeadingComments: N, hasMiddleComments: S, hasTrailingComment: j, hasEndComments: k, hasPrettierIgnore: J, isLastDescendantNode: f, isNode: B, isInlineNode: d } = Er(), F = sl(), { alignWithSpaces: a, printNextEmptyLine: g, shouldPrintEndComments: E } = Kr(), { printFlowMapping: b, printFlowSequence: x } = ol(), T = ll(), I = pl();
        function $(O, Z, oe) {
          let te = O.getValue(), Ee = [];
          te.type !== "mappingValue" && N(te) && Ee.push([n(e, O.map(oe, "leadingComments")), e]);
          let { tag: q, anchor: Y } = te;
          q && Ee.push(oe("tag")), q && Y && Ee.push(" "), Y && Ee.push(oe("anchor"));
          let ge = "";
          B(te, ["mapping", "sequence", "comment", "directive", "mappingItem", "sequenceItem"]) && !f(O) && (ge = g(O, Z.originalText)), (q || Y) && (B(te, ["sequence", "mapping"]) && !S(te) ? Ee.push(e) : Ee.push(" ")), S(te) && Ee.push([te.middleComments.length === 1 ? "" : e, n(e, O.map(oe, "middleComments")), e]);
          let ye = O.getParentNode();
          return J(O) ? Ee.push(m(Z.originalText.slice(te.position.start.offset, te.position.end.offset).trimEnd(), c)) : Ee.push(i(V(te, ye, O, Z, oe))), j(te) && !B(te, ["document", "documentHead"]) && Ee.push(o([te.type === "mappingValue" && !te.content ? "" : " ", ye.type === "mappingKey" && O.getParentNode(2).type === "mapping" && d(te) ? "" : t, oe("trailingComment")])), E(te) && Ee.push(a(te.type === "sequenceItem" ? 2 : 0, [e, n(e, O.map((Le) => [y(Z.originalText, Le.getValue(), C) ? e : "", oe()], "endComments"))])), Ee.push(ge), Ee;
        }
        function V(O, Z, oe, te, Ee) {
          switch (O.type) {
            case "root": {
              let { children: q } = O, Y = [];
              oe.each((ye, Le) => {
                let Q = q[Le], W = q[Le + 1];
                Le !== 0 && Y.push(e), Y.push(Ee()), U(Q, W) ? (Y.push(e, "..."), j(Q) && Y.push(" ", Ee("trailingComment"))) : W && !j(W.head) && Y.push(e, "---");
              }, "children");
              let ge = A(O);
              return (!B(ge, ["blockLiteral", "blockFolded"]) || ge.chomping !== "keep") && Y.push(e), Y;
            }
            case "document": {
              let q = Z.children[oe.getName() + 1], Y = [];
              return _(O, q, Z, te) === "head" && ((O.head.children.length > 0 || O.head.endComments.length > 0) && Y.push(Ee("head")), j(O.head) ? Y.push(["---", " ", Ee(["head", "trailingComment"])]) : Y.push("---")), M(O) && Y.push(Ee("body")), n(e, Y);
            }
            case "documentHead":
              return n(e, [...oe.map(Ee, "children"), ...oe.map(Ee, "endComments")]);
            case "documentBody": {
              let { children: q, endComments: Y } = O, ge = "";
              if (q.length > 0 && Y.length > 0) {
                let ye = A(O);
                B(ye, ["blockFolded", "blockLiteral"]) ? ye.chomping !== "keep" && (ge = [e, e]) : ge = e;
              }
              return [n(e, oe.map(Ee, "children")), ge, n(e, oe.map(Ee, "endComments"))];
            }
            case "directive":
              return ["%", n(" ", [O.name, ...O.parameters])];
            case "comment":
              return ["#", O.value];
            case "alias":
              return ["*", O.value];
            case "tag":
              return te.originalText.slice(O.position.start.offset, O.position.end.offset);
            case "anchor":
              return ["&", O.value];
            case "plain":
              return ee(O.type, te.originalText.slice(O.position.start.offset, O.position.end.offset), te);
            case "quoteDouble":
            case "quoteSingle": {
              let q = "'", Y = '"', ge = te.originalText.slice(O.position.start.offset + 1, O.position.end.offset - 1);
              if (O.type === "quoteSingle" && ge.includes("\\") || O.type === "quoteDouble" && /\\[^"]/.test(ge)) {
                let Le = O.type === "quoteDouble" ? Y : q;
                return [Le, ee(O.type, ge, te), Le];
              }
              if (ge.includes(Y))
                return [q, ee(O.type, O.type === "quoteDouble" ? ge.replace(/\\"/g, Y).replace(/'/g, q.repeat(2)) : ge, te), q];
              if (ge.includes(q))
                return [Y, ee(O.type, O.type === "quoteSingle" ? ge.replace(/''/g, q) : ge, te), Y];
              let ye = te.singleQuote ? q : Y;
              return [ye, ee(O.type, ge, te), ye];
            }
            case "blockFolded":
            case "blockLiteral":
              return I(oe, Ee, te);
            case "mapping":
            case "sequence":
              return n(e, oe.map(Ee, "children"));
            case "sequenceItem":
              return ["- ", a(2, O.content ? Ee("content") : "")];
            case "mappingKey":
            case "mappingValue":
              return O.content ? Ee("content") : "";
            case "mappingItem":
            case "flowMappingItem":
              return T(O, Z, oe, Ee, te);
            case "flowMapping":
              return b(oe, Ee, te);
            case "flowSequence":
              return x(oe, Ee, te);
            case "flowSequenceItem":
              return Ee("content");
            default:
              throw new Error(`Unexpected node type ${O.type}`);
          }
        }
        function M(O) {
          return O.body.children.length > 0 || k(O.body);
        }
        function U(O, Z) {
          return j(O) || Z && (Z.head.children.length > 0 || k(Z.head));
        }
        function _(O, Z, oe, te) {
          return oe.children[0] === O && /---(?:\s|$)/.test(te.originalText.slice(C(O), C(O) + 4)) || O.head.children.length > 0 || k(O.head) || j(O.head) ? "head" : U(O, Z) ? !1 : Z ? "root" : !1;
        }
        function ee(O, Z, oe) {
          let te = P(O, Z, oe);
          return n(e, te.map((Ee) => s(h(n(r, Ee)))));
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
        l.exports = { preprocess: F, embed: w, print: $, massageAstNode: R, insertPragma: p };
      } }), Dl = X({ "src/language-yaml/options.js"(u, l) {
        H();
        var t = yr();
        l.exports = { bracketSpacing: t.bracketSpacing, singleQuote: t.singleQuote, proseWrap: t.proseWrap };
      } }), dl = X({ "src/language-yaml/parsers.js"() {
        H();
      } }), fl = X({ "node_modules/linguist-languages/data/YAML.json"(u, l) {
        l.exports = { name: "YAML", type: "data", color: "#cb171e", tmScope: "source.yaml", aliases: ["yml"], extensions: [".yml", ".mir", ".reek", ".rviz", ".sublime-syntax", ".syntax", ".yaml", ".yaml-tmlanguage", ".yaml.sed", ".yml.mysql"], filenames: [".clang-format", ".clang-tidy", ".gemrc", "CITATION.cff", "glide.lock", "yarn.lock"], aceMode: "yaml", codemirrorMode: "yaml", codemirrorMimeType: "text/x-yaml", languageId: 407 };
      } }), ml = X({ "src/language-yaml/index.js"(u, l) {
        H();
        var t = pr(), s = cl(), i = Dl(), e = dl(), n = [t(fl(), (r) => ({ since: "1.14.0", parsers: ["yaml"], vscodeLanguageIds: ["yaml", "ansible", "home-assistant"], filenames: [...r.filenames.filter((o) => o !== "yarn.lock"), ".prettierrc", ".stylelintrc", ".lintstagedrc"] }))];
        l.exports = { languages: n, printers: { yaml: s }, options: i, parsers: e };
      } }), gl = X({ "src/languages.js"(u, l) {
        H(), l.exports = [Ys(), fo(), Ao(), wo(), Oo(), rl(), ml()];
      } });
      H();
      var { version: yl } = kn(), Cr = Ds(), { getSupportInfo: hl } = au(), El = ds(), Cl = gl(), Fl = mt();
      function Dr(u) {
        let l = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
        return function() {
          for (var t = arguments.length, s = new Array(t), i = 0; i < t; i++)
            s[i] = arguments[i];
          let e = s[l] || {}, n = e.plugins || [];
          return s[l] = Object.assign(Object.assign({}, e), {}, { plugins: [...Cl, ...Array.isArray(n) ? n : Object.values(n)] }), u(...s);
        };
      }
      var Bu = Dr(Cr.formatWithCursor);
      ce.exports = { formatWithCursor: Bu, format(u, l) {
        return Bu(u, l).formatted;
      }, check(u, l) {
        let { formatted: t } = Bu(u, l);
        return t === u;
      }, doc: Fl, getSupportInfo: Dr(hl, 0), version: yl, util: El, __debug: { parse: Dr(Cr.parse), formatAST: Dr(Cr.formatAST), formatDoc: Dr(Cr.formatDoc), printToDoc: Dr(Cr.printToDoc), printDocToString: Dr(Cr.printDocToString) } };
    });
    return na();
  });
})(Ll);
const Ol = /* @__PURE__ */ Gi(Zr), $l = /* @__PURE__ */ eu({
  __proto__: null,
  default: Ol
}, [Zr]), Ml = /* @__PURE__ */ tu($l);
(function(qe) {
  Object.defineProperty(qe, "__esModule", { value: !0 }), qe.formatEBNF = qe.EBNFPlugin = qe.languages = void 0;
  const ze = Qn, Pe = nu, wt = Ml;
  qe.languages = [
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
  ];
  const At = {
    ebnf: {
      print: Pe.EBNFPrint
    }
  }, pt = {
    ebnf: {
      parse: ze.parse,
      astFormat: "ebnf",
      locStart: ze.locStart,
      locEnd: ze.locEnd,
      preprocess: ze.preprocess
    }
  }, sn = {
    ebnf: {
      printWidth: 80,
      tabWidth: 4,
      useTabs: !1
    }
  };
  qe.EBNFPlugin = {
    languages: qe.languages,
    printers: At,
    parsers: pt,
    defaultOptions: sn
  };
  const Kt = (dn) => wt.default.format(dn, {
    parser: "ebnf",
    plugins: [qe.EBNFPlugin]
  });
  qe.formatEBNF = Kt;
})(Wi);
async function Rl(qe) {
  const ze = Fr.commands.registerCommand("extension.vibes", () => {
    Fr.window.showInformationMessage("Vibes!");
  });
  qe.subscriptions.push(ze);
  const Pe = { language: "bbnf", scheme: "file" }, wt = Fr.languages.registerDocumentFormattingEditProvider(Pe, {
    provideDocumentFormattingEdits(At) {
      if (Fr.window.showInformationMessage("formattin"), At.getText().length === 0)
        return [];
      const pt = Wi.formatEBNF(At.getText());
      return [
        Fr.TextEdit.replace(
          new Fr.Range(
            At.positionAt(0),
            At.positionAt(At.getText().length)
          ),
          pt
        )
      ];
    }
  });
  qe.subscriptions.push(wt);
}
export {
  Rl as activate
};
//# sourceMappingURL=extension.js.map

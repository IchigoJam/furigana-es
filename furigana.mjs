import util from "https://taisukef.github.io/util/util.mjs";

const encodeHTML = function (s) {
  s = s.replace(/&/g, '&amp;')
  s = s.replace(/</g, '&lt;')
  s = s.replace(/>/g, '&gt;')
  return s
}
const decodeHTML = function (s) {
  s = s.replace(/(&lt;)/g, '<')
  s = s.replace(/(&gt;)/g, '>')
  s = s.replace(/(&amp;)/g, '&')
  return s
}

const getRubyConverter = async (urlRuby) => {
  const ruby = await util.fetchCSVtoJSON(urlRuby);
  // console.log(ruby);

  const enc = (s) => s;
  // const enc = encodeHTML;
  const replacebr = false;
  for (const r of ruby) {
    const kj = r.text;
    const kn = r.ruby;
    let ns = 0;
    const len = Math.min(kj.length, kn.length);
    for (let i = 0; i < len; i++) {
      if (kj.charAt(i) !== kn.charAt(i)) break;
      ns++;
    }
    let ne = 0;
    for (let i = 0; i < len; i++) {
      if (kj.charAt(kj.length - 1 - i) !== kn.charAt(kn.length - 1 - i)) break;
      ne++;
    }
    r.rubytag = `${enc(kj.substring(0, ns))}<ruby>${enc(kj.substring(
      ns,
      kj.length - ne
    ))}<rt>${enc(kn.substring(ns, kn.length - ne))}</rt></ruby>${enc(kj.substring(
      kj.length - ne
    ))}`;
  }
  ruby.sort((a, b) => b.text.length - a.text.length);

  const makeRubyText = function (s) {
    if (s.length === 0 || s === "-") return "";
    let p = 0;

    const res = [];
    let last = 0;
    for (;;) {
      A: for (const r of ruby) {
        const rk = r.text;
        for (let i = 0; i < rk.length; i++) {
          if (rk.charAt(i) !== s.charAt(p + i)) continue A;
        }
        res.push(enc(s.substring(last, p)));
        res.push(r.rubytag);
        p += rk.length;
        last = p
        p--
        break;
      }
      p++;
      if (p >= s.length) {
        res.push(enc(s.substring(last)))
        break
      }
    }
    const sres = res.join("");
    if (replacebr) {
      sres = sres.replace(/\n/g, "<br>");
    }
    return sres;
  };
  return makeRubyText;
};
const addRuby = async (urlRuby) => {
  const makeRubyText = await getRubyConverter(urlRuby);
  document.body.innerHTML = makeRubyText(document.body.innerHTML);
};

export default { addRuby, getRubyConverter };

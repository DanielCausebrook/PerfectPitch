var tr=Object.defineProperty;var de=t=>{throw TypeError(t)};var er=(t,e,r)=>e in t?tr(t,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[e]=r;var E=(t,e,r)=>er(t,typeof e!="symbol"?e+"":e,r),Ft=(t,e,r)=>e.has(t)||de("Cannot "+r);var m=(t,e,r)=>(Ft(t,e,"read from private field"),r?r.call(t):e.get(t)),R=(t,e,r)=>e.has(t)?de("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(t):e.set(t,r),b=(t,e,r,n)=>(Ft(t,e,"write to private field"),n?n.call(t,r):e.set(t,r),r),Dt=(t,e,r)=>(Ft(t,e,"access private method"),r);import{aa as rr,g as nr,ax as Ue,h as L,j as qt,d as sr,w as pe,H as ir,i as we,k as Kt,o as dt,ay as Ct,l as Le,m as Oe,n as ar,as as Be,q as or,P as ve,az as ie,aA as Me,aB as ae,aC as Vr,ar as ur,aD as lr,af as cr,ab as fr,a6 as hr,ao as Ar,ah as dr,aE as pr,a8 as wr,L as ge,T as vr,aF as Mr,am as gr,aG as mr,aH as xr,R as yr,aI as Er,aJ as kr,u as Fe,b as De}from"./CX2U9xgD.js";import{a as Sr,i as Rr,c as br,d as Ir,b as Nr,n as Wr,e as _r,l as qe}from"./y_bE-8p-.js";function Hn(t,e){return e}function Tr(t,e,r,n){for(var s=[],a=e.length,o=0;o<a;o++)Vr(e[o].e,s,!0);var i=a>0&&s.length===0&&r!==null;if(i){var u=r.parentNode;ur(u),u.append(r),n.clear(),H(t,e[0].prev,e[a-1].next)}lr(s,()=>{for(var V=0;V<a;V++){var c=e[V];i||(n.delete(c.k),H(t,c.prev,c.next)),cr(c.e,!i)}})}function Pn(t,e,r,n,s,a=null){var o=t,i={flags:e,items:new Map,first:null},u=(e&Ue)!==0;if(u){var V=t;o=L?qt(fr(V)):V.appendChild(rr())}L&&sr();var c=null,h=!1,v=hr(()=>{var l=r();return vr(l)?l:l==null?[]:Be(l)});nr(()=>{var l=pe(v),A=l.length;if(h&&A===0)return;h=A===0;let d=!1;if(L){var g=o.data===ir;g!==(A===0)&&(o=we(),qt(o),Kt(!1),d=!0)}if(L){for(var f=null,w,x=0;x<A;x++){if(dt.nodeType===8&&dt.data===Ar){o=dt,d=!0,Kt(!1);break}var k=l[x],p=n(k,x);w=Ke(dt,i,f,null,k,p,x,s,e),i.items.set(p,w),f=w}A>0&&qt(we())}if(!L){var y=dr;Cr(l,i,o,s,e,(y.f&Ct)!==0,n)}a!==null&&(A===0?c?Le(c):c=Oe(()=>a(o)):c!==null&&ar(c,()=>{c=null})),d&&Kt(!0),pe(v)}),L&&(o=dt)}function Cr(t,e,r,n,s,a,o,i){var N,st,fe,he;var u=(s&pr)!==0,V=(s&(ie|ae))!==0,c=t.length,h=e.items,v=e.first,l=v,A,d=null,g,f=[],w=[],x,k,p,y;if(u)for(y=0;y<c;y+=1)x=t[y],k=o(x,y),p=h.get(k),p!==void 0&&((N=p.a)==null||N.measure(),(g??(g=new Set)).add(p));for(y=0;y<c;y+=1){if(x=t[y],k=o(x,y),p=h.get(k),p===void 0){var q=l?l.e.nodes_start:r;d=Ke(q,e,d,d===null?e.first:d.next,x,k,y,n,s),h.set(k,d),f=[],w=[],l=d.next;continue}if(V&&Ur(p,x,y,s),p.e.f&Ct&&(Le(p.e),u&&((st=p.a)==null||st.unfix(),(g??(g=new Set)).delete(p))),p!==l){if(A!==void 0&&A.has(p)){if(f.length<w.length){var K=w[0],W;d=K.prev;var G=f[0],C=f[f.length-1];for(W=0;W<f.length;W+=1)me(f[W],K,r);for(W=0;W<w.length;W+=1)A.delete(w[W]);H(e,G.prev,C.next),H(e,d,G),H(e,C,K),l=K,d=C,y-=1,f=[],w=[]}else A.delete(p),me(p,l,r),H(e,p.prev,p.next),H(e,p,d===null?e.first:d.next),H(e,d,p),d=p;continue}for(f=[],w=[];l!==null&&l.k!==k;)(a||!(l.e.f&Ct))&&(A??(A=new Set)).add(l),w.push(l),l=l.next;if(l===null)continue;p=l}f.push(p),d=p,l=p.next}if(l!==null||A!==void 0){for(var _=A===void 0?[]:Be(A);l!==null;)(a||!(l.e.f&Ct))&&_.push(l),l=l.next;var M=_.length;if(M>0){var S=s&Ue&&c===0?r:null;if(u){for(y=0;y<M;y+=1)(fe=_[y].a)==null||fe.measure();for(y=0;y<M;y+=1)(he=_[y].a)==null||he.fix()}Tr(e,_,S,h)}}u&&or(()=>{var Ae;if(g!==void 0)for(p of g)(Ae=p.a)==null||Ae.apply()}),ve.first=e.first&&e.first.e,ve.last=d&&d.e}function Ur(t,e,r,n){n&ie&&Me(t.v,e),n&ae?Me(t.i,r):t.i=r}function Ke(t,e,r,n,s,a,o,i,u,V){var c=(u&ie)!==0,h=(u&Mr)===0,v=c?h?wr(s):ge(s):s,l=u&ae?ge(o):o,A={i:l,v,k:a,a:null,e:null,prev:r,next:n};try{return A.e=Oe(()=>i(t,v,l),L),A.e.prev=r&&r.e,A.e.next=n&&n.e,r===null?e.first=A:(r.next=A,r.e.next=A.e),n!==null&&(n.prev=A,n.e.prev=A.e),A}finally{}}function me(t,e,r){for(var n=t.next?t.next.e.nodes_start:r,s=e?e.e.nodes_start:r,a=t.e.nodes_start;a!==n;){var o=gr(a);s.before(a),a=o}}function H(t,e,r){e===null?t.first=r:(e.next=r,e.e.next=r&&r.e),r!==null&&(r.prev=e,r.e.prev=e&&e.e)}function Ge(t){var e,r,n="";if(typeof t=="string"||typeof t=="number")n+=t;else if(typeof t=="object")if(Array.isArray(t)){var s=t.length;for(e=0;e<s;e++)t[e]&&(r=Ge(t[e]))&&(n&&(n+=" "),n+=r)}else for(r in t)t[r]&&(n&&(n+=" "),n+=r);return n}function Lr(){for(var t,e,r=0,n="",s=arguments.length;r<s;r++)(t=arguments[r])&&(e=Ge(t))&&(n&&(n+=" "),n+=e);return n}function Or(t){return typeof t=="object"?Lr(t):t??""}function Xn(t){if(L){var e=!1,r=()=>{if(!e){if(e=!0,t.hasAttribute("value")){var n=t.value;zt(t,"value",null),t.value=n}if(t.hasAttribute("checked")){var s=t.checked;zt(t,"checked",null),t.checked=s}}};t.__on_r=r,mr(r),Sr()}}function jn(t,e){var r=t.__attributes??(t.__attributes={});r.checked!==(r.checked=e??void 0)&&(t.checked=e)}function Br(t,e){e?t.hasAttribute("selected")||t.setAttribute("selected",""):t.removeAttribute("selected")}function zt(t,e,r,n){var s=t.__attributes??(t.__attributes={});L&&(s[e]=t.getAttribute(e),e==="src"||e==="srcset"||e==="href"&&t.nodeName==="LINK")||s[e]!==(s[e]=r)&&(e==="style"&&"__styles"in t&&(t.__styles={}),e==="loading"&&(t[xr]=r),r==null?t.removeAttribute(e):typeof r!="string"&&Ye(t).includes(e)?t[e]=r:t.setAttribute(e,r))}function zn(t,e,r,n,s=!1,a=!1,o=!1){var i=e||{},u=t.tagName==="OPTION";for(var V in e)V in r||(r[V]=null);r.class&&(r.class=Or(r.class));var c=Ye(t),h=t.__attributes??(t.__attributes={});for(const f in r){let w=r[f];if(u&&f==="value"&&w==null){t.value=t.__value="",i[f]=w;continue}var v=i[f];if(w!==v){i[f]=w;var l=f[0]+f[1];if(l!=="$$"){if(l==="on"){const x={},k="$$"+f;let p=f.slice(2);var A=_r(p);if(Rr(p)&&(p=p.slice(0,-7),x.capture=!0),!A&&v){if(w!=null)continue;t.removeEventListener(p,i[k],x),i[k]=null}if(w!=null)if(A)t[`__${p}`]=w,Ir([p]);else{let y=function(q){i[f].call(this,q)};i[k]=br(p,t,y,x)}else A&&(t[`__${p}`]=void 0)}else if(f==="style"&&w!=null)t.style.cssText=w+"";else if(f==="autofocus")Nr(t,!!w);else if(f==="__value"||f==="value"&&w!=null)t.value=t[f]=t.__value=w;else if(f==="selected"&&u)Br(t,w);else{var d=f;s||(d=Wr(d));var g=d==="defaultValue"||d==="defaultChecked";if(w==null&&!a&&!g)if(h[f]=null,d==="value"||d==="checked"){let x=t;if(d==="value"){let k=x.defaultValue;x.removeAttribute(d),x.defaultValue=k}else{let k=x.defaultChecked;x.removeAttribute(d),x.defaultChecked=k}}else t.removeAttribute(f);else g||c.includes(d)&&(a||typeof w!="string")?t[d]=w:typeof w!="function"&&(L&&(d==="src"||d==="href"||d==="srcset")||zt(t,d,w))}f==="style"&&"__styles"in t&&(t.__styles={})}}}return i}var xe=new Map;function Ye(t){var e=xe.get(t.nodeName);if(e)return e;xe.set(t.nodeName,e=[]);for(var r,n=t,s=Element.prototype;s!==n;){r=Er(n);for(var a in r)r[a].set&&e.push(a);n=yr(n)}return e}function $n(t,e,r=e){var n=kr();qe(t,"input",s=>{var a=s?t.defaultValue:t.value;if(a=Gt(t)?Yt(a):a,r(a),n&&a!==(a=e())){var o=t.selectionStart,i=t.selectionEnd;t.value=a??"",i!==null&&(t.selectionStart=o,t.selectionEnd=Math.min(i,t.value.length))}}),(L&&t.defaultValue!==t.value||Fe(e)==null&&t.value)&&r(Gt(t)?Yt(t.value):t.value),De(()=>{var s=e();Gt(t)&&s===Yt(t.value)||t.type==="date"&&!s&&!t.value||s!==t.value&&(t.value=s??"")})}function ts(t,e,r=e){qe(t,"change",n=>{var s=n?t.defaultChecked:t.checked;r(s)}),(L&&t.defaultChecked!==t.checked||Fe(e)==null)&&r(t.checked),De(()=>{var n=e();t.checked=!!n})}function Gt(t){var e=t.type;return e==="number"||e==="range"}function Yt(t){return t===""?null:+t}const O=9007199254740992,Tt=O-1,Ut=-1>>>0,B=Ut+1,J=B/2,Jt=J-1,_t=1<<21,rt=_t-1;function oe(t){return t.next()|0}function Z(t,e){return e===0?t:r=>t(r)+e}function $t(t){const e=t.next()|0,r=t.next()>>>0;return(e&rt)*B+r+(e&_t?-9007199254740992:0)}function Je(t){for(;;){const e=t.next()|0;if(e&4194304){if((e&8388607)===4194304&&!(t.next()|0))return O}else{const r=t.next()>>>0;return(e&rt)*B+r+(e&_t?-9007199254740992:0)}}}function Ze(t){return t.next()>>>0}function Bt(t){const e=t.next()&rt,r=t.next()>>>0;return e*B+r}function Ve(t){for(;;){const e=t.next()|0;if(e&_t){if(!(e&rt)&&!(t.next()|0))return O}else{const r=t.next()>>>0;return(e&rt)*B+r}}}function Qe(t){return(t+1&t)===0}function Fr(t){return e=>e.next()&t}function Dr(t){const e=t+1,r=e*Math.floor(B/e);return n=>{let s=0;do s=n.next()>>>0;while(s>=r);return s%e}}function qr(t){return Qe(t)?Fr(t):Dr(t)}function Kr(t){return(t|0)===0}function Gr(t){return e=>{const r=e.next()&t,n=e.next()>>>0;return r*B+n}}function Yr(t){const e=t*Math.floor(O/t);return r=>{let n=0;do{const s=r.next()&rt,a=r.next()>>>0;n=s*B+a}while(n>=e);return n%t}}function Jr(t){const e=t+1;if(Kr(e)){const r=(e/B|0)-1;if(Qe(r))return Gr(r)}return Yr(e)}function ye(t,e){return r=>{let n=0;do{const s=r.next()|0,a=r.next()>>>0;n=(s&rt)*B+a+(s&_t?-9007199254740992:0)}while(n<t||n>e);return n}}function nt(t,e){if(t=Math.floor(t),e=Math.floor(e),t<-9007199254740992||!isFinite(t))throw new RangeError(`Expected min to be at least ${-9007199254740992}`);if(e>O||!isFinite(e))throw new RangeError(`Expected max to be at most ${O}`);const r=e-t;return r<=0||!isFinite(r)?()=>t:r===Ut?t===0?Ze:Z(oe,t+J):r<Ut?Z(qr(r),t):r===Tt?Z(Bt,t):r<Tt?Z(Jr(r),t):e-1-t===Tt?Z(Ve,t):t===-9007199254740992&&e===O?Je:t===-9007199254740992&&e===Tt?$t:t===-9007199254740991&&e===O?Z($t,1):e===O?Z(ye(t-1,e-1),1):ye(t,e)}function Zr(t){return(t.next()&1)===1}function te(t,e){return r=>t(r)<e}function Qr(t){if(t<=0)return()=>!1;if(t>=1)return()=>!0;{const e=t*B;return e%1===0?te(oe,e-J|0):te(Bt,Math.round(t*O))}}function Hr(t,e){return e==null?t==null?Zr:Qr(t):t<=0?()=>!1:t>=e?()=>!0:te(nt(0,e-1),t)}function Pr(t,e){const r=nt(+t,+e);return n=>new Date(r(n))}function He(t){return nt(1,t)}function Xr(t,e){const r=He(t);return n=>{const s=[];for(let a=0;a<e;++a)s.push(r(n));return s}}const jr="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-";function ue(t=jr){const e=t.length;if(!e)throw new Error("Expected pool not to be an empty string");const r=nt(0,e-1);return(n,s)=>{let a="";for(let o=0;o<s;++o){const i=r(n);a+=t.charAt(i)}return a}}const Pe="0123456789abcdef",zr=ue(Pe),$r=ue(Pe.toUpperCase());function tn(t){return t?$r:zr}function Ee(t,e){return t<0?Math.max(t+e,0):Math.min(t,e)}function ke(t){const e=+t;return e<0?Math.ceil(e):Math.floor(e)}function en(t,e,r,n){const s=e.length;if(s===0)throw new RangeError("Cannot pick from an empty array");const a=r==null?0:Ee(ke(r),s),o=n===void 0?s:Ee(ke(n),s);if(a>=o)throw new RangeError(`Cannot pick between bounds ${a} and ${o}`);const i=nt(a,o-1);return e[i(t)]}function rn(t,e){return e===1?t:e===0?()=>0:r=>t(r)*e}function Xe(t){return Bt(t)/O}function je(t){return Ve(t)/O}function nn(t,e,r=!1){if(isFinite(t)){if(!isFinite(e))throw new RangeError("Expected max to be a finite number")}else throw new RangeError("Expected min to be a finite number");return Z(rn(r?je:Xe,e-t),t)}const sn=Array.prototype.slice;function ee(t,e,r=0){const n=e.length;if(n)for(let s=n-1>>>0;s>r;--s){const o=nt(0,s)(t);if(s!==o){const i=e[s];e[s]=e[o],e[o]=i}}return e}function an(t,e,r){if(r<0||r>e.length||!isFinite(r))throw new RangeError("Expected sampleSize to be within 0 and the length of the population");if(r===0)return[];const n=sn.call(e),s=n.length;if(s===r)return ee(t,n,0);const a=s-r;return ee(t,n,a-1).slice(a)}const on=(()=>{try{if("x".repeat(3)==="xxx")return(t,e)=>t.repeat(e)}catch{}return(t,e)=>{let r="";for(;e>0;)e&1&&(r+=t),e>>=1,t+=t;return r}})();function it(t,e){return on("0",e-t.length)+t}function Vn(t){const e=t.next()>>>0,r=t.next()|0,n=t.next()|0,s=t.next()>>>0;return it(e.toString(16),8)+"-"+it((r&65535).toString(16),4)+"-"+it((r>>4&4095|16384).toString(16),4)+"-"+it((n&16383|32768).toString(16),4)+"-"+it((n>>4&65535).toString(16),4)+it(s.toString(16),8)}const ze={next(){return Math.random()*B|0}};class tt{constructor(e=ze){this.engine=e}int32(){return oe(this.engine)}uint32(){return Ze(this.engine)}uint53(){return Bt(this.engine)}uint53Full(){return Ve(this.engine)}int53(){return $t(this.engine)}int53Full(){return Je(this.engine)}integer(e,r){return nt(e,r)(this.engine)}realZeroToOneInclusive(){return je(this.engine)}realZeroToOneExclusive(){return Xe(this.engine)}real(e,r,n=!1){return nn(e,r,n)(this.engine)}bool(e,r){return Hr(e,r)(this.engine)}pick(e,r,n){return en(this.engine,e,r,n)}shuffle(e){return ee(this.engine,e)}sample(e,r){return an(this.engine,e,r)}die(e){return He(e)(this.engine)}dice(e,r){return Xr(e,r)(this.engine)}uuid4(){return Vn(this.engine)}string(e,r){return ue(r)(this.engine,e)}hex(e,r){return tn(r)(this.engine,e)}date(e,r){return Pr(e,r)(this.engine)}}const un=(()=>{try{const t=new ArrayBuffer(4),e=new Int32Array(t);if(e[0]=J,e[0]===-J)return Int32Array}catch{}return Array})();function ln(t=ze,e=16){const r=[];r.push(new Date().getTime()|0);for(let n=1;n<e;++n)r[n]=t.next()|0;return r}const re=(()=>{try{if(Math.imul(Ut,5)===-5)return Math.imul}catch{}const t=65535;return(e,r)=>{const n=e>>>16&t,s=e&t,a=r>>>16&t,o=r&t;return s*o+(n*o+s*a<<16>>>0)|0}})(),Y=624,P=Y-1,ne=397,Se=Y-ne,Zt=2567483615;class D{constructor(){this.data=new un(Y),this.index=0,this.uses=0}static seed(e){return new D().seed(e)}static seedWithArray(e){return new D().seedWithArray(e)}static autoSeed(){return D.seedWithArray(ln())}next(){(this.index|0)>=Y&&(Qt(this.data),this.index=0);const e=this.data[this.index];return this.index=this.index+1|0,this.uses+=1,cn(e)|0}getUseCount(){return this.uses}discard(e){if(e<=0)return this;for(this.uses+=e,(this.index|0)>=Y&&(Qt(this.data),this.index=0);e+this.index>Y;)e-=Y-this.index,Qt(this.data),this.index=0;return this.index=this.index+e|0,this}seed(e){let r=0;this.data[0]=r=e|0;for(let n=1;n<Y;n=n+1|0)this.data[n]=r=re(r^r>>>30,1812433253)+n|0;return this.index=Y,this.uses=0,this}seedWithArray(e){return this.seed(19650218),fn(this.data,e),this}}function Qt(t){let e=0,r=0;for(;(e|0)<Se;e=e+1|0)r=t[e]&J|t[e+1|0]&Jt,t[e]=t[e+ne|0]^r>>>1^(r&1?Zt:0);for(;(e|0)<P;e=e+1|0)r=t[e]&J|t[e+1|0]&Jt,t[e]=t[e-Se|0]^r>>>1^(r&1?Zt:0);r=t[P]&J|t[0]&Jt,t[P]=t[ne-1]^r>>>1^(r&1?Zt:0)}function cn(t){return t^=t>>>11,t^=t<<7&2636928640,t^=t<<15&4022730752,t^t>>>18}function fn(t,e){let r=1,n=0;const s=e.length;let a=Math.max(s,Y)|0,o=t[0]|0;for(;(a|0)>0;--a)t[r]=o=(t[r]^re(o^o>>>30,1664525))+(e[n]|0)+(n|0)|0,r=r+1|0,++n,(r|0)>P&&(t[0]=t[P],r=1),n>=s&&(n=0);for(a=P;(a|0)>0;--a)t[r]=o=(t[r]^re(o^o>>>30,1566083941))-r|0,r=r+1|0,(r|0)>P&&(t[0]=t[P],r=1);t[0]=J}const hn="data:audio/mpeg;base64,SUQzAwAAAAABAFRZRVIAAAAaAAAAMjAxOC0wOS0xN1QxNToyNjo0OS0wNDowMFREUkMAAAAaAAAAMjAxOC0wOS0xN1QxNToyNjo0OS0wNDowMFRYWFgAAAAuAAAAU29mdHdhcmUAQWRvYmUgQXVkaXRpb24gQ0MgMjAxOC4xIChNYWNpbnRvc2gp//uUZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAAGAAAMkABWVlZWVlZWVlZWVlZWVlZWgoKCgoKCgoKCgoKCgoKCgoK2tra2tra2tra2tra2tra24eHh4eHh4eHh4eHh4eHh4eH39/f39/f39/f39/f39/f39/////////////////////8AAABQTEFNRTMuMTAwBLkAAAAAAAAAADUgJAaqjQAB4AAADJDDPjzFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//vkRAAAAZMYWFUEYAgpgAstoAABGq1hX7mcgoNap6q3NbBR8ARQABSX8Y5EACgXAAFC/iehf6FUTfRCcAACE45wY/w/y5/v5R38v4f5d6gQ/9vLv4PlgGshRANS7gPjhACDhwIOKA/BAxxA7UGChz+XfLvD+TLv/9UMcoc//D/bSJYFpVAIAKRKre12AWJOXaLCQohACC0RTSFMkJH5AW940khYYxIBQTKSiT5X8ATi26pUq21ZisiBXRliIr+NFbm8qdsSWCEI8RccDCm+mEQrWh2InEorbG4TiFEUGnP5nJKspi8YllLWl1DBEajL1RGmryGH4xdhpplJnXoo65MkoLUNfTyWHIz9eJxCV8q2o1M0Nm5h2ruK5yaGeX8aSK02ofci5fvS2m5fziMspquXKWK9k+dfU9brSq9hVtS6lrVInKLXbGVy/KZnC1W7S/jKv0PAACAATBoAAAIICUsPIFA5mRy1jTBxGQM2HNkEHwJr5BnVBmTIcjOKZNQgHSoCCCMQhGIAQuWAQwIFmsJKsERRLpQW4yVLkJQhxChYuFKgqgCyjCRKKv+Fg8wUNKFgOB3cvGyyBgIMJBzOYaNAPXJX3Jc2tugw5fLrLWbCsWPK+RBZzEWRR6e5KmavfNR+19+IU8qjUE0ud+huUbhcq4wzDUhltavVvYy19u5ZYwffe9wpHYtRuYp60ZkcWpZiPR/WH1pLVwyrWu/z9/jr9zWUvhz/3dtiEraJd0RURkJJ3YAZG/QNYCkDnADAUpoiFGUS5Xm8ZSXYmIFGqtImWiTWx00Sa/57VRRIlMovOf12fMR2kcnT8y2b13m9dm3z//6/fJnKZ610ddm3/frytZISB1BZImCrQaAq0iEqFwsPyrUWm/46GeYdWhUYCJMwBUX1lpVYJWQzMxllwChk7zKo21p2nXgZ/gCiU3HlmUIaegfCdBy//DFC0mpNNxLOvs0tMUlxF/PtS837dcTPUbNc+vF1Uz/+xUJYxy0QdwVSmlftW85dQyqisIkp0FQKZiygM4gGBAAro4RNNOB0ljOisV2oVRyWtSQDK8+RZI04HLJ4idY/fl62lMCQlcaYTShC91KSZWk9BKvcqef302JDxZlD+4c3VZ1IdVEJ28jeudc6fu5lIUNTI04QKiHdyoNg2nMOILEvEKZkaJCb3AosWAQAO5mYiAAGC6CmaTMYXM/MAsCgLUMkBgBTJHLtOpjpRJCXuo2nPwmjLVKcPe5mY0PhDAHkZaNQZ9gYTuiAFMKR0w5xGhevmHtv//ukRMoAA247Uf88wABd52o/7CABDkkzPewYc0mjnic9gw35/9jiw54/0+vd13H8FdNu3/OYbqy6poZkVgklO1hA8ZF8iIWwL2tYHiIBS4empIatfaK/TbO2IxW45tdcE6ApMp3DtoEu/a4whIOTC8Jusi+DcFo6EysLABCsRLJRQ00E1eXaTugcyG5mpe0S/P8PFUSt9qfvK/SKyItN+3jHZA9CTjIUky+UGTXEzYbBTZenN1bBxeS/r2R+cVaeaqYdGRkQU5+B3ANQQEIIBYAIQUgFgK0U0uQR8VhlyqJ2kUWvxG5ygPicpBEWgbvQsLa9Me7J9AzNU0kmccsQH4UyBB5QbWVsLKN+X2lZ0qTB2c94mLafENEJhfYX4QxIEE0BGwkQBmGDD0JiSvPU3efcxEKkCABUpUWBkAEqqpnIn4Dhix0DU8FdKqtiWW4jX4pAdAq0yjosUaaNrxdpZVDFPI69AQxDajalEzfyclGnmoRgcKpuVphGpscYnB48cEDGDGeL4F9GPdWJxLO8M1yLFAW6qgFxc15cuxjDidHLxlMcCyNoYPdnpNsX8KRopKWQOk1pvMy6qHelAJ0AqFDEGmKSocJGZSllZEgQEEhN6wZlqczB2DRcqCJUYfJo//u0RNSABEJRT/sMM6Jv57nfPMOqEM15P+wkb8mqIeg9hJnULZJn6zg76ccs7yTMcISi6IqbWks2VXvRCjr3nleKZ2nZ2aIEphJo12vGzt9dstGrtt2f4PSCsLlEpJ3zvnfCrq3t7LmHdpEFS1uxAdKAaErEI4I3A0KKIjYuNbidsBSWaYjZ4cQ0w8kkaG5IZf2vlLs+DciZVJuUqr9DHJGpao013fYcU+qoTlDjMoCkdbLpiJV3jqJ1d3LtWELKXahy3c/WhnkAwwkRCphqDSh4KEYlAwq29D/rCRp5qrqGVESYTmAR6GIoTBJyA4QkLdIPoYp3MPQSAZH4CwfxOJS5XSQtwwkoKJO/ggOswKisIhJx4wiaaRdiT7YYigXEaaGYj/yt5VN5aWMJCQ1JkanWzxVz7a0SOST18/edNvlFafBZFN6u3buqmoWpEhPAEDCkUw1CSEgeeYJqsK+I8LkrkmhqhP5xYHdXqdphXC4UkBFqX9ErDGmCoIKTAQswFXEgw8wpM1AZSVS/onjxvJvo0CiYKP1hhWPbWkS/96VKl7USXhSyw4qfPuTCmSoVNRMxESzKso+AjaFig4aMKAEmQhorpNGJrE2Hc7MFDYhlMKpZVKqYjC1CApKt3SW1WOxSVPCcu9SFdyMwlp1tpFHzM8uqK2c/pkXMHQlKEZ1iLCfMNBqGaHeIhmxIJcIJiysFXSIkWh5GoJ2RE2VDJxJOW20ZJSRkjRcCu2tTy1YaxJFKji6LxtZ5pqLlAuNr//ukRO4AA8hKT/sJG+Bph6mfYYZUDU07Oew8Y8lTlmU5h5ix7Oeu5xuT5fI33OHXkkd1+SJHjNq82ncwGQlKfPmZym7zjY51TNyWSytCMAAFT1KD5iqo4QeiCopU8Go56OvKbWpIiEkd01F5OSEzyTwmqvWbOVOPMoBVYuNNJFAobwUqC6f+UBqgBD+vrGqBoKCiWdfY1lUv5QEMuCZ0GixXFQk8qGvOkusBFg1///lSoiRVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tkRPsEUvFFyfnpMGA/RJjtMeYARJSHEsCAZ8AcgGIAAAAGVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sUZOGP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV",An=""+new URL("../assets/sports golfing golf club swing hit ball iron from fairway 01.DU_08mhN.mp3",import.meta.url).href,dn=""+new URL("../assets/sports golfing golf club swing hit ball driver from tee 02.C6ffF-oX.mp3",import.meta.url).href,pn=""+new URL("../assets/sports golfing golf club swing hit ball wedge from fairway 04.C7KTYddj.mp3",import.meta.url).href,wn=""+new URL("../assets/sports golfing golf club swing hit ball wedge from hazzard sand trap 03.B2Bw8A-u.mp3",import.meta.url).href,vn=""+new URL("../assets/sports golfing golf ball land in hazzard sand trap 07.DSADQ3IR.mp3",import.meta.url).href,Mn=""+new URL("../assets/sports golfing golf ball land in water hazzard 03.C2Itf22d.mp3",import.meta.url).href,gn=""+new URL("../assets/sports golfing golf ball hit tree then ground 03.Byq-0M-K.mp3",import.meta.url).href,mn=""+new URL("../assets/sports golfing golf ball drops falls in hole 01.BWkOhIab.mp3",import.meta.url).href,xn=""+new URL("../assets/sports golfing golf bag putting away club 12v2.CH4c6c0V.mp3",import.meta.url).href,at=new AudioContext,I=class I{constructor(e,r,n){E(this,"audio",null);E(this,"track",null);E(this,"startAtMs",0);this.startAtMs=n??0,at!==null&&(this.audio=new Audio(e),this.audio.load(),this.audio.volume=r,this.track=at.createMediaElementSource(this.audio),this.track.connect(at.destination))}play(){this.audio!==null&&at!==null&&(at.state==="suspended"&&at.resume(),this.audio.currentTime=this.startAtMs/1e3,this.audio.play())}};E(I,"putter",new I(hn,1)),E(I,"iron",new I(An,.75)),E(I,"driver",new I(dn,.4)),E(I,"wedge",new I(pn,.35)),E(I,"sandWedge",new I(wn,.6)),E(I,"bunker",new I(vn,.5)),E(I,"water",new I(Mn,.7)),E(I,"tree",new I(gn,.3)),E(I,"hole",new I(mn,.6)),E(I,"select",new I(xn,.15));let ot=I;const $e=Math.sqrt(3),yn=.5*($e-1),pt=(3-$e)/6,Re=t=>Math.floor(t)|0,be=new Float64Array([1,1,-1,1,1,-1,-1,-1,1,0,-1,0,1,0,-1,0,0,1,0,-1,0,1,0,-1]);function En(t=Math.random){const e=kn(t),r=new Float64Array(e).map(s=>be[s%12*2]),n=new Float64Array(e).map(s=>be[s%12*2+1]);return function(a,o){let i=0,u=0,V=0;const c=(a+o)*yn,h=Re(a+c),v=Re(o+c),l=(h+v)*pt,A=h-l,d=v-l,g=a-A,f=o-d;let w,x;g>f?(w=1,x=0):(w=0,x=1);const k=g-w+pt,p=f-x+pt,y=g-1+2*pt,q=f-1+2*pt,K=h&255,W=v&255;let G=.5-g*g-f*f;if(G>=0){const M=K+e[W],S=r[M],N=n[M];G*=G,i=G*G*(S*g+N*f)}let C=.5-k*k-p*p;if(C>=0){const M=K+w+e[W+x],S=r[M],N=n[M];C*=C,u=C*C*(S*k+N*p)}let _=.5-y*y-q*q;if(_>=0){const M=K+1+e[W+1],S=r[M],N=n[M];_*=_,V=_*_*(S*y+N*q)}return 70*(i+u+V)}}function kn(t){const r=new Uint8Array(512);for(let n=0;n<512/2;n++)r[n]=n;for(let n=0;n<512/2-1;n++){const s=n+~~(t()*(256-n)),a=r[n];r[n]=r[s],r[s]=a}for(let n=256;n<512;n++)r[n]=r[n-256];return r}function Sn(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}var Ht={exports:{}},Pt={exports:{}},Ie;function Rn(){return Ie||(Ie=1,function(t,e){(function(r){const n=Math.PI*2;function s(a,o,i=null){var u,V;i?(u=i(),V=i()):(u=Math.random(),V=Math.random());var c=Math.sqrt(-2*Math.log(u))*Math.cos(n*V);return c*o+a}r(s)})(function(r){t.exports=r})}(Pt)),Pt.exports}var Ne;function bn(){return Ne||(Ne=1,function(t,e){(function(r){const n=Rn();var s=function(V){var c=Math.abs(V),h=1/(1+c/2),v=h*Math.exp(-c*c-1.26551223+h*(1.00002368+h*(.37409196+h*(.09678418+h*(-.18628806+h*(.27886807+h*(-1.13520398+h*(1.48851587+h*(-.82215223+h*.17087277)))))))));return V>=0?v:2-v},a=function(V){if(V>=2)return-100;if(V<=0)return 100;for(var c=V<1?V:2-V,h=Math.sqrt(-2*Math.log(c/2)),v=-.70711*((2.30753+h*.27061)/(1+h*(.99229+h*.04481))-h),l=0;l<2;l++){var A=s(v)-c;v+=A/(1.1283791670955126*Math.exp(-(v*v))-v*A)}return V<1?v:-v},o=function(V,c){if(c<=0)throw new Error("Variance must be > 0 (but was "+c+")");this.mean=V,this.variance=c,this.standardDeviation=Math.sqrt(c)};o.prototype.pdf=function(V){var c=this.standardDeviation*Math.sqrt(2*Math.PI),h=Math.exp(-Math.pow(V-this.mean,2)/(2*this.variance));return h/c},o.prototype.cdf=function(V){return .5*s(-(V-this.mean)/(this.standardDeviation*Math.sqrt(2)))},o.prototype.ppf=function(V){return this.mean-this.standardDeviation*Math.sqrt(2)*a(2*V)},o.prototype.mul=function(V){if(typeof V=="number")return this.scale(V);var c=1/this.variance,h=1/V.variance;return u(c+h,c*this.mean+h*V.mean)},o.prototype.div=function(V){if(typeof V=="number")return this.scale(1/V);var c=1/this.variance,h=1/V.variance;return u(c-h,c*this.mean-h*V.mean)},o.prototype.add=function(V){return i(this.mean+V.mean,this.variance+V.variance)},o.prototype.sub=function(V){return i(this.mean-V.mean,this.variance+V.variance)},o.prototype.scale=function(V){return i(this.mean*V,this.variance*V*V)},o.prototype.random=function(V,c=null){let h=this.mean,v=this.standardDeviation;return Array(V).fill(0).map(()=>n(h,v,c))};var i=function(V,c){return new o(V,c)},u=function(V,c){return i(c/V,1/V)};r(i)})(function(r){t.exports=r})}(Ht)),Ht.exports}var In=bn();const Nn=Sn(In);class F{constructor(e,r,n){E(this,"width");E(this,"height");E(this,"data");this.width=r,this.height=n,this.data=e}static of(e,r,n){return new F(Array(e).fill(null).map(s=>Array(r).fill(n)),e,r)}static build(e,r,n){let s=[];for(let a=0;a<e;a++){let o=[];for(let i=0;i<r;i++)o.push(n(a,i));s.push(o)}return new F(s,e,r)}copy(){return new F(this.data.map(e=>e.slice()),this.width,this.height)}}var Vt,ut,z,T;class Wn{constructor(e,r,n){R(this,Vt);R(this,ut);R(this,z);R(this,T,1);b(this,Vt,e),b(this,ut,r),b(this,z,n)}fromMatrix2D(e){if(m(this,Vt)!==e.width||m(this,ut)!==e.height)throw new Error("Dimensions do not match.");return new Lt(e)}setGlobalNoiseScale(e){b(this,T,e)}buildMap(e){return new Lt(F.build(m(this,Vt),m(this,ut),e))}buildNoiseMap(e){let r=new et(e*m(this,T),new tt(D.seed(m(this,z).uint32())));return this.buildMap((n,s)=>.5*r.get(n,s)+.5)}buildWarpNoiseMap(e,r,n){let s=new _n(e*m(this,T),r*m(this,T),n/m(this,T),new tt(D.seed(m(this,z).uint32())));return this.buildMap((a,o)=>.5*s.get(a,o)+.5)}buildLoopyNoiseMap(e,r,n,s,a,o){let i=new Tn(e*m(this,T),r/m(this,T),n*m(this,T),s/m(this,T),a*m(this,T),o,new tt(D.seed(m(this,z).uint32())));return this.buildMap((u,V)=>.5*i.get(u,V)+.5)}sum(e,...r){return this.buildMap((n,s)=>r.reduce((a,o)=>a+o.get(n,s)-e,e))}prod(...e){return this.buildMap((r,n)=>e.reduce((s,a)=>s*a.get(r,n),1))}}Vt=new WeakMap,ut=new WeakMap,z=new WeakMap,T=new WeakMap;class Lt{constructor(e){E(this,"inner");this.inner=e}apply(e){return this.inner.data.forEach(r=>r.forEach((n,s)=>r[s]=e(n))),this}shift(e){return this.inner.data.forEach(r=>r.forEach((n,s)=>r[s]=n+e)),this}scale(e,r){return r=r??0,this.inner.data.forEach(n=>n.forEach((s,a)=>n[a]=r+(s-r)*e)),this}pinch(e,r,n){r=r??0,n=n??1;let s=Math.pow(Math.E,-e);return this.inner.data.forEach(a=>a.forEach((o,i)=>{let u=o-r,V=Math.sign(u);a[i]=r+V*Math.pow(V*u/n,s)*n})),this}blur(e){return this.inner=Un(this.inner,e),this}invert(){return this.inner.data.forEach(e=>e.forEach((r,n)=>e[n]=1-r)),this}clamp(e,r){return e=e??0,r=r??1,this.inner.data.forEach(n=>n.forEach((s,a)=>n[a]=Math.min(r,Math.max(e,s)))),this}copy(){return new Lt(this.inner.copy())}get(e,r){return this.inner.data[e][r]}threshold(e){return this.inner.data.forEach(r=>r.forEach((n,s)=>r[s]=n>=e?1:0)),this}boolThreshold(e){return new F(this.inner.data.map(r=>r.map(n=>n>=e)),this.inner.width,this.inner.height)}toArray(){return this.inner.data.slice()}}var wt,lt,vt,Mt;class et{constructor(e,r){R(this,wt);R(this,lt);R(this,vt);R(this,Mt);b(this,wt,En(()=>r.real(0,1))),b(this,lt,e),b(this,vt,r.real(0,1)),b(this,Mt,r.real(0,1))}get(e,r){return m(this,wt).call(this,e/m(this,lt)+m(this,vt),r/m(this,lt)+m(this,Mt))}}wt=new WeakMap,lt=new WeakMap,vt=new WeakMap,Mt=new WeakMap;var gt,mt,xt,ct;class _n{constructor(e,r,n,s){R(this,gt);R(this,mt);R(this,xt);R(this,ct);b(this,ct,n),b(this,gt,new et(e,s)),b(this,mt,new et(r,s)),b(this,xt,new et(r,s))}get(e,r){let n=m(this,ct)*m(this,mt).get(e,r),s=m(this,ct)*m(this,xt).get(e,r);return m(this,gt).get(e+n,r+s)}}gt=new WeakMap,mt=new WeakMap,xt=new WeakMap,ct=new WeakMap;var yt,Et,kt,St,Rt,bt;class Tn{constructor(e,r,n,s,a,o,i){R(this,yt);R(this,Et);R(this,kt);R(this,St);R(this,Rt);R(this,bt);b(this,Rt,r),b(this,yt,new et(e,i)),b(this,Et,new et(a,i)),b(this,kt,new et(n,i)),b(this,St,s),b(this,bt,o*a)}get(e,r){const n=2*Math.PI;let s=m(this,bt)*m(this,Et).get(e,r)*n;s=(s%n+n)%n;let a=m(this,Rt)+m(this,St)*m(this,kt).get(e,r),o,i;return s<.25*n?(i=a*Math.sin(s),o=a*Math.cos(s)):s<.5*n?(i=a*Math.cos(s-.25*n),o=-a*Math.sin(s-.25*n)):s<.75*n?(i=-a*Math.sin(s-.5*n),o=-a*Math.cos(s-.5*n)):(i=-a*Math.cos(s-.75*n),o=a*Math.sin(s-.75*n)),m(this,yt).get(e+o,r+i)}}yt=new WeakMap,Et=new WeakMap,kt=new WeakMap,St=new WeakMap,Rt=new WeakMap,bt=new WeakMap;function Cn(t,e,r,n){let s=1;function a(l){return l[0]+","+l[1]}let o=a(e),i=[{position:e,markedRegion:[o]}],u=new Set([o]),V=e;function c(){const l=i.pop();for(const A of l.markedRegion)u.delete(A)}function h(l){return l[0]<0||l[0]>=t.width||l[1]<0||l[1]>=t.height||(l[0]===0||l[0]===t.width-1)&&(l[1]===0||l[1]===t.height-1)||t.data[l[0]][l[1]]}function v(l){return l[0]===r[0]&&l[1]===r[1]}for(;;){let l=n.integer(0,7),A=Kn(V,l);if(h(A)){for(let g=0;g<Math.min(2,i.length-1);g++)c();V=i[i.length-1].position;continue}if(v(A))return i.push({position:r,markedRegion:[]}),i.map(g=>g.position);let d=a(A);if(u.has(d)){let g=i[i.length-1];for(;!g.markedRegion.includes(d);){if(i.length===0)throw new Error("Path is empty!");c(),g=i[i.length-1]}if(g.position[0]===A[0]&&g.position[1]===A[1])V=g.position;else{for(let f=0;f<s;f++)c();V=i[i.length-1].position}}else{let g=[a(A)],f=i[i.length-1-s];if(f!==void 0)for(let w=-1;w<2;w++)for(let x=-1;x<2;x++){let k=[f.position[0]+x,f.position[1]+w];if(v(k)){for(let y=0;y<s;y++)c();return i.push({position:r,markedRegion:[]}),i.map(y=>y.position)}const p=a(k);u.has(p)||(g.push(p),u.add(p))}i.push({position:A,markedRegion:g}),V=A}}}function Un(t,e){if(e===0)return t.copy();const r=Nn(0,e);let n=[r.cdf(.5)-r.cdf(-.5)],s=n[0],a=0;for(;s<.9;){let V=r.cdf(a+1.5)-r.cdf(a+.5);n.push(V),n.unshift(V),s+=2*V,a++}function o(V,c,h){let v=Array(c).fill(null).map(()=>Array(V).fill(0));return h.forEach((l,A)=>{for(let d=0;d<l.length;d++){let g=0,f=0;for(let w=-a;w<=a;w++)f+=l[d+w]!==void 0?n[w+a]:0,g+=(l[d+w]??0)*n[w+a];v[d][A]=f===0?0:g/f}}),v}let i=o(t.width,t.height,t.data),u=o(t.height,t.width,i);return new F(u,t.width,t.height)}function Ln(t,e,r,n,s){const o=new tt(D.seed(s.uint32()));function i(h,v,l,A,d){let g=o.integer(l,(h-2*l)*Math.abs(d)-1);return d<0&&(g=h-g-1),[g,o.integer(A,v-2*A-1)]}let u,V,c=o.pick([-1,1]);if(t>e){let[h,v]=i(t,e,r,n,-c*.4);V=[h,v],[h,v]=i(t,e,r,n,c*.4),u=[h,v]}else{let[h,v]=i(e,t,n,r,-c*.4);V=[v,h],[h,v]=i(e,t,n,r,c*.4),u=[v,h]}return[V,u]}class le{constructor(e,r,n){E(this,"id");E(this,"name");E(this,"value");this.id=e,this.name=r,this.value=n}}class We extends le{constructor(r,n,s,a){super(r,n,s);E(this,"options");this.options=[{id:s,name:a}]}addOption(r,n){return this.options.push({id:r,name:n}),this}}class _e extends le{constructor(e,r,n){super(e,r,n)}}class Xt extends le{constructor(r,n,s,a,o,i){super(r,n,i);E(this,"sliderMin");E(this,"sliderMax");E(this,"sliderStep");this.sliderMin=s,this.sliderMax=a,this.sliderStep=o}}class On{constructor(){E(this,"settings",[])}addSetting(e){return this.settings.push(e),this}setting(e){return this.settings.find(r=>r.id===e)??null}is(e,r){var n;return((n=this.setting(e))==null?void 0:n.value)===r}get(e){var r;return((r=this.setting(e))==null?void 0:r.value)??null}}function es(){return new On().addSetting(new We("map","Map","result","Result").addOption("edge","Edge").addOption("walls","Walls").addOption("path","Path").addOption("pathEnds","Path Ends").addOption("l","Land").addOption("w","Water").addOption("r","Rock").addOption("f","Fairway").addOption("t","Trees").addOption("s","Sand").addOption("noise","Noise")).addSetting(new We("mapStage","Map Stage","end","End").addOption("1","1").addOption("2","2").addOption("3","3")).addSetting(new Xt("a","A",-1,1,.05,0)).addSetting(new Xt("b","B",-1,1,.05,0)).addSetting(new Xt("c","C",-1,1,.05,0)).addSetting(new _e("m","M",!1)).addSetting(new _e("n","N",!1))}class U{constructor(e){E(this,"map");this.map=e}}function Bn(t,e,r,n,s,a,o,i){let u=new Wn(t,e,o);if(i!=null&&i.is("map","noise"))return new U(u.buildLoopyNoiseMap(10,5,20,2,45,.03).inner);let V=u.buildMap((M,S)=>{let N=1;return M<=r+1&&(N*=Math.pow((M+1.5)/(r+3.5),.85)),M>=t-r-1&&(N*=Math.pow((t-1-(M-1.5))/(r+3.5),.85)),S<=n+1&&(N*=Math.pow((S+1.5)/(n+3.5),.85)),S>=e-n-1&&(N*=Math.pow((e-1-(S-1.5))/(n+3.5),.85)),N});if(i!=null&&i.is("map","edge"))return new U(V.inner);let c=[Math.round((s[0]+a[0])/2),Math.round((s[1]+a[1])/2)],h=Math.hypot(s[0]-a[0],s[1]-a[1]),v=Math.min(Math.min(t-2*r,e-2*n)/6,h/2-1.5),l=F.build(t,e,(M,S)=>Math.abs(c[0]-M)<=v&&Math.abs(c[1]-S)<=v&&Math.hypot(c[0]-M,c[1]-S)<v||M<r||M>=t-r||S<n||S>=e-n);if(i!=null&&i.is("map","walls"))return new U(l);let A=Cn(l,s,a,new tt(D.seed(o.uint32()))),d=F.of(t,e,0);for(const M of A)d.data[M[0]][M[1]]=1;let g=u.fromMatrix2D(d.copy()),f=u.fromMatrix2D(F.of(t,e,0));for(const M of[[-1,0],[1,0],[0,-1],[0,1]])f.inner.data[a[0]+M[0]][a[1]+M[1]]!==void 0&&(f.inner.data[a[0]+M[0]][a[1]+M[1]]=.65);for(const M of[[-1,0],[1,0],[0,-1],[0,1]])f.inner.data[s[0]+M[0]][s[1]+M[1]]===0&&(f.inner.data[s[0]+M[0]][s[1]+M[1]]=.45);if([1.5,1,.85,.7,.5,.3].forEach((M,S)=>{let N=A[S];N!==void 0&&(f.inner.data[N[0]][N[1]]+=M);let st=A[A.length-1-S];st!==void 0&&(f.inner.data[st[0]][st[1]]+=M)}),g.blur(1.7).scale(3).clamp(),f.blur(1.7).scale(4.5).clamp(),i!=null&&i.is("map","path"))return new U(i!=null&&i.get("m")?d:g.inner);if(i!=null&&i.is("map","pathEnds"))return new U(f.inner);let x=u.prod(u.prod(u.buildWarpNoiseMap(7,8,2.5),V.copy().pinch(.2,1)).invert(),f.copy().invert(),g.copy().scale(.08).invert()).invert().pinch(-.5,1);if(i!=null&&i.is("map","l"))return new U(x.inner);let k=x.copy().invert().threshold(.5).blur(.35).boolThreshold(.5);if(i!=null&&i.is("map","w"))return new U(k);let p=u.prod(u.prod(u.sum(.5,u.buildWarpNoiseMap(10,8,3)),x.copy().scale(.85).shift(.125).clamp()).invert(),f.copy().scale(3.5,1).clamp().invert()).invert();if(i!=null&&i.is("map","f"))return new U(p.inner);let y=p.boolThreshold(.5),q=u.prod(u.sum(.5,u.buildNoiseMap(25).scale(0,.5),u.buildWarpNoiseMap(12,12,6)),x.copy().shift(.25).clamp(),g.copy().pinch(-.2,1,.2).clamp().scale(.8).invert(),f.copy().scale(2,1).clamp().invert());if(i!=null&&i.is("map","r"))return new U(i!=null&&i.get("m")?x.copy().shift(.25).clamp().inner:q.inner);let K=q.threshold(.665).blur(.5).boolThreshold(.4),W=u.prod(u.sum(.5,u.buildNoiseMap(10).scale(.15,.5),u.buildWarpNoiseMap(4.5,8,4).scale(1,.5)),x.copy().invert().scale(4).shift(.25).clamp(),g.copy().pinch(.5,1).clamp().scale(.5).invert()).threshold(.58).blur(2);if(i!=null&&i.is("map","s"))return new U(i!=null&&i.get("m")?g.copy().pinch(.5,1).clamp().scale(.5).invert().inner:W.inner);let G=W.boolThreshold(.4),C=u.prod(u.sum(.5,u.buildWarpNoiseMap(10,15,2.5).scale(.15,.5),u.buildWarpNoiseMap(7,10,2).scale(.5,.5),u.buildWarpNoiseMap(3,8,2).scale(1,.5)),x.copy().scale(1.5).shift(.225).clamp(),f.copy().scale(2,1).clamp().invert(),p.copy().scale(3,1).clamp().invert(),W.copy().scale(1.5,1).clamp().invert());if(i!=null&&i.is("map","t"))return new U(C.inner);let _=C.boolThreshold(.65);return F.build(t,e,(M,S)=>{if(a[0]===M&&a[1]===S)return Q.Hole;switch(!0){case k.data[M][S]:return Q.Water;case K.data[M][S]:return Q.Rock;case _.data[M][S]:return Q.Tree;case G.data[M][S]:return Q.Sand;case y.data[M][S]:return Q.Fairway;default:return Q.Rough}})}function Fn(t,e,r,n,s,a,o){let i=Bn(t,e,r,n,s,a,o);if(i instanceof U)throw new Error("Terrain Generation returned debug map without any debug settings being supplied.");return i}var Q=(t=>(t[t.Hole=0]="Hole",t[t.Fairway=1]="Fairway",t[t.Rough=2]="Rough",t[t.Water=3]="Water",t[t.Sand=4]="Sand",t[t.Tree=5]="Tree",t[t.Rock=6]="Rock",t))(Q||{}),Dn=(t=>(t[t.None=0]="None",t[t.Stick=1]="Stick",t[t.Block=2]="Block",t))(Dn||{});function rs(t){switch(t){case 1:return new X("hsl(90, 60%, 40%)",0,!1,0,1);case 2:return new X("hsl(100, 60%, 35%)",0,!1,0,0);case 3:return new X("hsl(210, 50%, 60%)",0,!0,0,0).setLandSoundEffect(ot.water);case 4:return new X("hsl(55, 50%, 60%)",0,!1,-1,0).setLandSoundEffect(ot.bunker);case 5:return new X("hsl(120, 20%, 35%)",1,!1,0,0).setBlockSoundEffect(ot.tree);case 6:return new X("hsl(120, 0%, 30%)",2,!1,0,0).setBlockSoundEffect(ot.tree);case 0:return new X("hsl(170, 60%, 45%)",0,!1,0,0)}}class X{constructor(e,r,n,s,a){E(this,"primaryColor");E(this,"blockType");E(this,"outOfBounds");E(this,"shotModifier");E(this,"rollDistance");E(this,"landSoundEffect",null);E(this,"blockSoundEffect",null);this.primaryColor=e,this.blockType=r,this.outOfBounds=n,this.shotModifier=s,this.rollDistance=a}setLandSoundEffect(e){return this.landSoundEffect=e,this}setBlockSoundEffect(e){return this.blockSoundEffect=e,this}}var qn=(t=>(t[t.N=0]="N",t[t.NE=1]="NE",t[t.E=2]="E",t[t.SE=3]="SE",t[t.S=4]="S",t[t.SW=5]="SW",t[t.W=6]="W",t[t.NW=7]="NW",t))(qn||{}),$,Ot,It;const ce=class ce{constructor(e,r,n){R(this,$);R(this,Ot);R(this,It);b(this,$,e),b(this,Ot,r),b(this,It,n)}static generate(e,r,n,s,a){let[o,i]=Ln(e,r,n,s,new tt(D.seed(a.uint32()))),u=Fn(e,r,n,s,o,i,new tt(D.seed(a.uint32())));return new ce(u,i,o)}height(){return m(this,$).height}width(){return m(this,$).width}cell(e){return m(this,$).data[e[0]][e[1]]}tee(){return m(this,It)}isValidPosition(e){const r=e[0],n=e[1];return r>=0&&n>=0&&r<this.width()&&n<this.height()}};$=new WeakMap,Ot=new WeakMap,It=new WeakMap;let Te=ce;function Kn(t,e){switch(e){case 0:return[t[0],t[1]+1];case 1:return[t[0]+1,t[1]+1];case 2:return[t[0]+1,t[1]];case 3:return[t[0]+1,t[1]-1];case 4:return[t[0],t[1]-1];case 5:return[t[0]-1,t[1]-1];case 6:return[t[0]-1,t[1]];case 7:return[t[0]-1,t[1]+1]}}function Gn(t,e){return((t+e)%8+8)%8}function Yn(t){switch(t){case 0:return[0,1];case 1:return[1,1];case 2:return[1,0];case 3:return[1,-1];case 4:return[0,-1];case 5:return[-1,-1];case 6:return[-1,0];case 7:return[-1,1]}}var ft,ht,Nt;class jt{constructor(e,r,n){R(this,ft);R(this,ht);R(this,Nt);b(this,ft,e),b(this,ht,r),b(this,Nt,n??!1)}play(e){var r;m(this,Nt)?(r=e.querySelector(".glow-element"))==null||r.animate(m(this,ft),{duration:m(this,ht),iterations:1}):e.animate(m(this,ft),{duration:m(this,ht),iterations:1})}}ft=new WeakMap,ht=new WeakMap,Nt=new WeakMap;var At,Wt,se;const j=class j{constructor(e){R(this,At);b(this,At,e)}play(e){for(const r of m(this,At))r.play(e)}static combine(...e){return new j(e.reduce((r,n)=>(r.push(...m(n,At)),r),[]))}static glow(e,r,n){return new j([new jt([{boxShadow:`0 0 ${r}px ${r/2}px transparent`,easing:"ease-out"},{boxShadow:`0 0 ${r}px ${r/2}px ${e}`,easing:"ease-in",offset:.02},{boxShadow:`0 0 ${r}px ${r/2}px transparent`}],n,!0)])}static wobble(e,r,n){const o=Dt(this,Wt,se).call(this,e);let i=[{transform:`rotate3d(${o[0]}, ${-o[1]}, 0, 0deg)`,easing:"ease-out"},{transform:`rotate3d(${o[0]}, ${-o[1]}, 0, ${r}deg)`,offset:.05,easing:"cubic-bezier(.42,0,.58,1)"}];for(let u=1;u<6;u++)i.push({transform:`rotate3d(${o[0]}, ${-o[1]}, 0, ${r*Math.pow(-.625,u)}deg)`,offset:.05+u*(1-.05)/6,easing:"cubic-bezier(.42,0,.58,1)"});return i.push({transform:`rotate3d(${o[0]}, ${-o[1]}, 0, 0deg)`}),new j([new jt(i,n)])}static spin(e,r){let n=Dt(this,Wt,se).call(this,e);return new j([new jt([{transform:`rotate3d(${n[0]}, ${-n[1]}, 0, 0deg)`,easing:"cubic-bezier(0, 0.2, 0, 1)"},{transform:`rotate3d(${n[0]}, ${-n[1]}, 0, ${360*4}deg)`}],r)])}};At=new WeakMap,Wt=new WeakSet,se=function(e){return Yn(Gn(e,2))},R(j,Wt);let Ce=j;export{Q as C,U as D,D as M,tt as R,ot as S,_e as T,Bn as a,rs as b,es as c,ts as d,Pn as e,Xt as f,Ln as g,$n as h,Hn as i,We as j,jn as k,zn as l,Or as m,qn as n,Kn as o,Ce as p,en as q,Xn as r,zt as s,ze as t,Hr as u,Gn as v,Dn as w,Te as x};

var er=Object.defineProperty;var pe=t=>{throw TypeError(t)};var rr=(t,e,r)=>e in t?er(t,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[e]=r;var S=(t,e,r)=>rr(t,typeof e!="symbol"?e+"":e,r),Ft=(t,e,r)=>e.has(t)||pe("Cannot "+r);var u=(t,e,r)=>(Ft(t,e,"read from private field"),r?r.call(t):e.get(t)),k=(t,e,r)=>e.has(t)?pe("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(t):e.set(t,r),R=(t,e,r,n)=>(Ft(t,e,"write to private field"),n?n.call(t,r):e.set(t,r),r),Ot=(t,e,r)=>(Ft(t,e,"access private method"),r);import{aa as nr,d as sr,ax as Ue,h as U,j as Kt,g as ir,w as we,H as ar,i as ge,k as Yt,o as ft,ay as Ct,l as Le,m as Be,n as or,as as Fe,q as Vr,P as ve,az as se,aA as Me,aB as ie,aC as lr,ar as ur,aD as cr,af as fr,ab as Ar,a6 as hr,ao as dr,ah as pr,aE as wr,a8 as gr,L as xe,T as vr,aF as Mr,am as xr,aG as mr,aH as Er,R as yr,aI as kr,aJ as Sr,u as Oe,b as Ke}from"./DAIAyNcJ.js";import{a as Rr,i as br,c as Ir,d as Nr,b as _r,n as Wr,e as Tr,l as Ye}from"./pAR5L9hK.js";function Dn(t,e){return e}function Cr(t,e,r,n){for(var s=[],i=e.length,a=0;a<i;a++)lr(e[a].e,s,!0);var V=i>0&&s.length===0&&r!==null;if(V){var l=r.parentNode;ur(l),l.append(r),n.clear(),H(t,e[0].prev,e[i-1].next)}cr(s,()=>{for(var E=0;E<i;E++){var d=e[E];V||(n.delete(d.k),H(t,d.prev,d.next)),fr(d.e,!V)}})}function Jn(t,e,r,n,s,i=null){var a=t,V={flags:e,items:new Map,first:null},l=(e&Ue)!==0;if(l){var E=t;a=U?Kt(Ar(E)):E.appendChild(nr())}U&&ir();var d=null,x=!1,f=hr(()=>{var o=r();return vr(o)?o:o==null?[]:Fe(o)});sr(()=>{var o=we(f),w=o.length;if(x&&w===0)return;x=w===0;let A=!1;if(U){var b=a.data===ar;b!==(w===0)&&(a=ge(),Kt(a),Yt(!1),A=!0)}if(U){for(var h=null,p,g=0;g<w;g++){if(ft.nodeType===8&&ft.data===dr){a=ft,A=!0,Yt(!1);break}var m=o[g],c=n(m,g);p=De(ft,V,h,null,m,c,g,s,e),V.items.set(c,p),h=p}w>0&&Kt(ge())}if(!U){var M=pr;Ur(o,V,a,s,e,(M.f&Ct)!==0,n)}i!==null&&(w===0?d?Le(d):d=Be(()=>i(a)):d!==null&&or(d,()=>{d=null})),A&&Yt(!0),we(f)}),U&&(a=ft)}function Ur(t,e,r,n,s,i,a,V){var q,fe,Ae,he;var l=(s&wr)!==0,E=(s&(se|ie))!==0,d=t.length,x=e.items,f=e.first,o=f,w,A=null,b,h=[],p=[],g,m,c,M;if(l)for(M=0;M<d;M+=1)g=t[M],m=a(g,M),c=x.get(m),c!==void 0&&((q=c.a)==null||q.measure(),(b??(b=new Set)).add(c));for(M=0;M<d;M+=1){if(g=t[M],m=a(g,M),c=x.get(m),c===void 0){var W=o?o.e.nodes_start:r;A=De(W,e,A,A===null?e.first:A.next,g,m,M,n,s),x.set(m,A),h=[],p=[],o=A.next;continue}if(E&&Lr(c,g,M,s),c.e.f&Ct&&(Le(c.e),l&&((fe=c.a)==null||fe.unfix(),(b??(b=new Set)).delete(c))),c!==o){if(w!==void 0&&w.has(c)){if(h.length<p.length){var K=p[0],_;A=K.prev;var Y=h[0],v=h[h.length-1];for(_=0;_<h.length;_+=1)me(h[_],K,r);for(_=0;_<p.length;_+=1)w.delete(p[_]);H(e,Y.prev,v.next),H(e,A,Y),H(e,v,K),o=K,A=v,M-=1,h=[],p=[]}else w.delete(c),me(c,o,r),H(e,c.prev,c.next),H(e,c,A===null?e.first:A.next),H(e,A,c),A=c;continue}for(h=[],p=[];o!==null&&o.k!==m;)(i||!(o.e.f&Ct))&&(w??(w=new Set)).add(o),p.push(o),o=o.next;if(o===null)continue;c=o}h.push(c),A=c,o=c.next}if(o!==null||w!==void 0){for(var y=w===void 0?[]:Fe(w);o!==null;)(i||!(o.e.f&Ct))&&y.push(o),o=o.next;var I=y.length;if(I>0){var F=s&Ue&&d===0?r:null;if(l){for(M=0;M<I;M+=1)(Ae=y[M].a)==null||Ae.measure();for(M=0;M<I;M+=1)(he=y[M].a)==null||he.fix()}Cr(e,y,F,x)}}l&&Vr(()=>{var de;if(b!==void 0)for(c of b)(de=c.a)==null||de.apply()}),ve.first=e.first&&e.first.e,ve.last=A&&A.e}function Lr(t,e,r,n){n&se&&Me(t.v,e),n&ie?Me(t.i,r):t.i=r}function De(t,e,r,n,s,i,a,V,l,E){var d=(l&se)!==0,x=(l&Mr)===0,f=d?x?gr(s):xe(s):s,o=l&ie?xe(a):a,w={i:o,v:f,k:i,a:null,e:null,prev:r,next:n};try{return w.e=Be(()=>V(t,f,o),U),w.e.prev=r&&r.e,w.e.next=n&&n.e,r===null?e.first=w:(r.next=w,r.e.next=w.e),n!==null&&(n.prev=w,n.e.prev=w.e),w}finally{}}function me(t,e,r){for(var n=t.next?t.next.e.nodes_start:r,s=e?e.e.nodes_start:r,i=t.e.nodes_start;i!==n;){var a=xr(i);s.before(i),i=a}}function H(t,e,r){e===null?t.first=r:(e.next=r,e.e.next=r&&r.e),r!==null&&(r.prev=e,r.e.prev=e&&e.e)}function Je(t){var e,r,n="";if(typeof t=="string"||typeof t=="number")n+=t;else if(typeof t=="object")if(Array.isArray(t)){var s=t.length;for(e=0;e<s;e++)t[e]&&(r=Je(t[e]))&&(n&&(n+=" "),n+=r)}else for(r in t)t[r]&&(n&&(n+=" "),n+=r);return n}function Br(){for(var t,e,r=0,n="",s=arguments.length;r<s;r++)(t=arguments[r])&&(e=Je(t))&&(n&&(n+=" "),n+=e);return n}function Fr(t){return typeof t=="object"?Br(t):t??""}function Gn(t){if(U){var e=!1,r=()=>{if(!e){if(e=!0,t.hasAttribute("value")){var n=t.value;Xt(t,"value",null),t.value=n}if(t.hasAttribute("checked")){var s=t.checked;Xt(t,"checked",null),t.checked=s}}};t.__on_r=r,mr(r),Rr()}}function qn(t,e){var r=t.__attributes??(t.__attributes={});r.checked!==(r.checked=e??void 0)&&(t.checked=e)}function Or(t,e){e?t.hasAttribute("selected")||t.setAttribute("selected",""):t.removeAttribute("selected")}function Xt(t,e,r,n){var s=t.__attributes??(t.__attributes={});U&&(s[e]=t.getAttribute(e),e==="src"||e==="srcset"||e==="href"&&t.nodeName==="LINK")||s[e]!==(s[e]=r)&&(e==="style"&&"__styles"in t&&(t.__styles={}),e==="loading"&&(t[Er]=r),r==null?t.removeAttribute(e):typeof r!="string"&&Ge(t).includes(e)?t[e]=r:t.setAttribute(e,r))}function Zn(t,e,r,n,s=!1,i=!1,a=!1){var V=e||{},l=t.tagName==="OPTION";for(var E in e)E in r||(r[E]=null);r.class&&(r.class=Fr(r.class));var d=Ge(t),x=t.__attributes??(t.__attributes={});for(const h in r){let p=r[h];if(l&&h==="value"&&p==null){t.value=t.__value="",V[h]=p;continue}var f=V[h];if(p!==f){V[h]=p;var o=h[0]+h[1];if(o!=="$$"){if(o==="on"){const g={},m="$$"+h;let c=h.slice(2);var w=Tr(c);if(br(c)&&(c=c.slice(0,-7),g.capture=!0),!w&&f){if(p!=null)continue;t.removeEventListener(c,V[m],g),V[m]=null}if(p!=null)if(w)t[`__${c}`]=p,Nr([c]);else{let M=function(W){V[h].call(this,W)};V[m]=Ir(c,t,M,g)}else w&&(t[`__${c}`]=void 0)}else if(h==="style"&&p!=null)t.style.cssText=p+"";else if(h==="autofocus")_r(t,!!p);else if(h==="__value"||h==="value"&&p!=null)t.value=t[h]=t.__value=p;else if(h==="selected"&&l)Or(t,p);else{var A=h;s||(A=Wr(A));var b=A==="defaultValue"||A==="defaultChecked";if(p==null&&!i&&!b)if(x[h]=null,A==="value"||A==="checked"){let g=t;if(A==="value"){let m=g.defaultValue;g.removeAttribute(A),g.defaultValue=m}else{let m=g.defaultChecked;g.removeAttribute(A),g.defaultChecked=m}}else t.removeAttribute(h);else b||d.includes(A)&&(i||typeof p!="string")?t[A]=p:typeof p!="function"&&(U&&(A==="src"||A==="href"||A==="srcset")||Xt(t,A,p))}h==="style"&&"__styles"in t&&(t.__styles={})}}}return V}var Ee=new Map;function Ge(t){var e=Ee.get(t.nodeName);if(e)return e;Ee.set(t.nodeName,e=[]);for(var r,n=t,s=Element.prototype;s!==n;){r=kr(n);for(var i in r)r[i].set&&e.push(i);n=yr(n)}return e}function Qn(t,e,r=e){var n=Sr();Ye(t,"input",s=>{var i=s?t.defaultValue:t.value;if(i=Dt(t)?Jt(i):i,r(i),n&&i!==(i=e())){var a=t.selectionStart,V=t.selectionEnd;t.value=i??"",V!==null&&(t.selectionStart=a,t.selectionEnd=Math.min(V,t.value.length))}}),(U&&t.defaultValue!==t.value||Oe(e)==null&&t.value)&&r(Dt(t)?Jt(t.value):t.value),Ke(()=>{var s=e();Dt(t)&&s===Jt(t.value)||t.type==="date"&&!s&&!t.value||s!==t.value&&(t.value=s??"")})}function Hn(t,e,r=e){Ye(t,"change",n=>{var s=n?t.defaultChecked:t.checked;r(s)}),(U&&t.defaultChecked!==t.checked||Oe(e)==null)&&r(t.checked),Ke(()=>{var n=e();t.checked=!!n})}function Dt(t){var e=t.type;return e==="number"||e==="range"}function Jt(t){return t===""?null:+t}const L=9007199254740992,Tt=L-1,Ut=-1>>>0,B=Ut+1,G=B/2,Gt=G-1,Wt=1<<21,et=Wt-1;function ae(t){return t.next()|0}function Z(t,e){return e===0?t:r=>t(r)+e}function jt(t){const e=t.next()|0,r=t.next()>>>0;return(e&et)*B+r+(e&Wt?-9007199254740992:0)}function qe(t){for(;;){const e=t.next()|0;if(e&4194304){if((e&8388607)===4194304&&!(t.next()|0))return L}else{const r=t.next()>>>0;return(e&et)*B+r+(e&Wt?-9007199254740992:0)}}}function Ze(t){return t.next()>>>0}function Bt(t){const e=t.next()&et,r=t.next()>>>0;return e*B+r}function oe(t){for(;;){const e=t.next()|0;if(e&Wt){if(!(e&et)&&!(t.next()|0))return L}else{const r=t.next()>>>0;return(e&et)*B+r}}}function Qe(t){return(t+1&t)===0}function Kr(t){return e=>e.next()&t}function Yr(t){const e=t+1,r=e*Math.floor(B/e);return n=>{let s=0;do s=n.next()>>>0;while(s>=r);return s%e}}function Dr(t){return Qe(t)?Kr(t):Yr(t)}function Jr(t){return(t|0)===0}function Gr(t){return e=>{const r=e.next()&t,n=e.next()>>>0;return r*B+n}}function qr(t){const e=t*Math.floor(L/t);return r=>{let n=0;do{const s=r.next()&et,i=r.next()>>>0;n=s*B+i}while(n>=e);return n%t}}function Zr(t){const e=t+1;if(Jr(e)){const r=(e/B|0)-1;if(Qe(r))return Gr(r)}return qr(e)}function ye(t,e){return r=>{let n=0;do{const s=r.next()|0,i=r.next()>>>0;n=(s&et)*B+i+(s&Wt?-9007199254740992:0)}while(n<t||n>e);return n}}function rt(t,e){if(t=Math.floor(t),e=Math.floor(e),t<-9007199254740992||!isFinite(t))throw new RangeError(`Expected min to be at least ${-9007199254740992}`);if(e>L||!isFinite(e))throw new RangeError(`Expected max to be at most ${L}`);const r=e-t;return r<=0||!isFinite(r)?()=>t:r===Ut?t===0?Ze:Z(ae,t+G):r<Ut?Z(Dr(r),t):r===Tt?Z(Bt,t):r<Tt?Z(Zr(r),t):e-1-t===Tt?Z(oe,t):t===-9007199254740992&&e===L?qe:t===-9007199254740992&&e===Tt?jt:t===-9007199254740991&&e===L?Z(jt,1):e===L?Z(ye(t-1,e-1),1):ye(t,e)}function Qr(t){return(t.next()&1)===1}function zt(t,e){return r=>t(r)<e}function Hr(t){if(t<=0)return()=>!1;if(t>=1)return()=>!0;{const e=t*B;return e%1===0?zt(ae,e-G|0):zt(Bt,Math.round(t*L))}}function Pr(t,e){return e==null?t==null?Qr:Hr(t):t<=0?()=>!1:t>=e?()=>!0:zt(rt(0,e-1),t)}function Xr(t,e){const r=rt(+t,+e);return n=>new Date(r(n))}function He(t){return rt(1,t)}function jr(t,e){const r=He(t);return n=>{const s=[];for(let i=0;i<e;++i)s.push(r(n));return s}}const zr="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-";function Ve(t=zr){const e=t.length;if(!e)throw new Error("Expected pool not to be an empty string");const r=rt(0,e-1);return(n,s)=>{let i="";for(let a=0;a<s;++a){const V=r(n);i+=t.charAt(V)}return i}}const Pe="0123456789abcdef",$r=Ve(Pe),tn=Ve(Pe.toUpperCase());function en(t){return t?tn:$r}function ke(t,e){return t<0?Math.max(t+e,0):Math.min(t,e)}function Se(t){const e=+t;return e<0?Math.ceil(e):Math.floor(e)}function rn(t,e,r,n){const s=e.length;if(s===0)throw new RangeError("Cannot pick from an empty array");const i=r==null?0:ke(Se(r),s),a=n===void 0?s:ke(Se(n),s);if(i>=a)throw new RangeError(`Cannot pick between bounds ${i} and ${a}`);const V=rt(i,a-1);return e[V(t)]}function nn(t,e){return e===1?t:e===0?()=>0:r=>t(r)*e}function Xe(t){return Bt(t)/L}function je(t){return oe(t)/L}function sn(t,e,r=!1){if(isFinite(t)){if(!isFinite(e))throw new RangeError("Expected max to be a finite number")}else throw new RangeError("Expected min to be a finite number");return Z(nn(r?je:Xe,e-t),t)}const an=Array.prototype.slice;function $t(t,e,r=0){const n=e.length;if(n)for(let s=n-1>>>0;s>r;--s){const a=rt(0,s)(t);if(s!==a){const V=e[s];e[s]=e[a],e[a]=V}}return e}function on(t,e,r){if(r<0||r>e.length||!isFinite(r))throw new RangeError("Expected sampleSize to be within 0 and the length of the population");if(r===0)return[];const n=an.call(e),s=n.length;if(s===r)return $t(t,n,0);const i=s-r;return $t(t,n,i-1).slice(i)}const Vn=(()=>{try{if("x".repeat(3)==="xxx")return(t,e)=>t.repeat(e)}catch{}return(t,e)=>{let r="";for(;e>0;)e&1&&(r+=t),e>>=1,t+=t;return r}})();function nt(t,e){return Vn("0",e-t.length)+t}function ln(t){const e=t.next()>>>0,r=t.next()|0,n=t.next()|0,s=t.next()>>>0;return nt(e.toString(16),8)+"-"+nt((r&65535).toString(16),4)+"-"+nt((r>>4&4095|16384).toString(16),4)+"-"+nt((n&16383|32768).toString(16),4)+"-"+nt((n>>4&65535).toString(16),4)+nt(s.toString(16),8)}const ze={next(){return Math.random()*B|0}};class ${constructor(e=ze){this.engine=e}int32(){return ae(this.engine)}uint32(){return Ze(this.engine)}uint53(){return Bt(this.engine)}uint53Full(){return oe(this.engine)}int53(){return jt(this.engine)}int53Full(){return qe(this.engine)}integer(e,r){return rt(e,r)(this.engine)}realZeroToOneInclusive(){return je(this.engine)}realZeroToOneExclusive(){return Xe(this.engine)}real(e,r,n=!1){return sn(e,r,n)(this.engine)}bool(e,r){return Pr(e,r)(this.engine)}pick(e,r,n){return rn(this.engine,e,r,n)}shuffle(e){return $t(this.engine,e)}sample(e,r){return on(this.engine,e,r)}die(e){return He(e)(this.engine)}dice(e,r){return jr(e,r)(this.engine)}uuid4(){return ln(this.engine)}string(e,r){return Ve(r)(this.engine,e)}hex(e,r){return en(r)(this.engine,e)}date(e,r){return Xr(e,r)(this.engine)}}const un=(()=>{try{const t=new ArrayBuffer(4),e=new Int32Array(t);if(e[0]=G,e[0]===-G)return Int32Array}catch{}return Array})();function cn(t=ze,e=16){const r=[];r.push(new Date().getTime()|0);for(let n=1;n<e;++n)r[n]=t.next()|0;return r}const te=(()=>{try{if(Math.imul(Ut,5)===-5)return Math.imul}catch{}const t=65535;return(e,r)=>{const n=e>>>16&t,s=e&t,i=r>>>16&t,a=r&t;return s*a+(n*a+s*i<<16>>>0)|0}})(),J=624,P=J-1,ee=397,Re=J-ee,qt=2567483615;class O{constructor(){this.data=new un(J),this.index=0,this.uses=0}static seed(e){return new O().seed(e)}static seedWithArray(e){return new O().seedWithArray(e)}static autoSeed(){return O.seedWithArray(cn())}next(){(this.index|0)>=J&&(Zt(this.data),this.index=0);const e=this.data[this.index];return this.index=this.index+1|0,this.uses+=1,fn(e)|0}getUseCount(){return this.uses}discard(e){if(e<=0)return this;for(this.uses+=e,(this.index|0)>=J&&(Zt(this.data),this.index=0);e+this.index>J;)e-=J-this.index,Zt(this.data),this.index=0;return this.index=this.index+e|0,this}seed(e){let r=0;this.data[0]=r=e|0;for(let n=1;n<J;n=n+1|0)this.data[n]=r=te(r^r>>>30,1812433253)+n|0;return this.index=J,this.uses=0,this}seedWithArray(e){return this.seed(19650218),An(this.data,e),this}}function Zt(t){let e=0,r=0;for(;(e|0)<Re;e=e+1|0)r=t[e]&G|t[e+1|0]&Gt,t[e]=t[e+ee|0]^r>>>1^(r&1?qt:0);for(;(e|0)<P;e=e+1|0)r=t[e]&G|t[e+1|0]&Gt,t[e]=t[e-Re|0]^r>>>1^(r&1?qt:0);r=t[P]&G|t[0]&Gt,t[P]=t[ee-1]^r>>>1^(r&1?qt:0)}function fn(t){return t^=t>>>11,t^=t<<7&2636928640,t^=t<<15&4022730752,t^t>>>18}function An(t,e){let r=1,n=0;const s=e.length;let i=Math.max(s,J)|0,a=t[0]|0;for(;(i|0)>0;--i)t[r]=a=(t[r]^te(a^a>>>30,1664525))+(e[n]|0)+(n|0)|0,r=r+1|0,++n,(r|0)>P&&(t[0]=t[P],r=1),n>=s&&(n=0);for(i=P;(i|0)>0;--i)t[r]=a=(t[r]^te(a^a>>>30,1566083941))-r|0,r=r+1|0,(r|0)>P&&(t[0]=t[P],r=1);t[0]=G}const hn="data:audio/mpeg;base64,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FQk8qGvOkusBFg1///lSoiRVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tkRPsEUvFFyfnpMGA/RJjtMeYARJSHEsCAZ8AcgGIAAAAGVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sUZOGP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV",dn=""+new URL("../assets/sports golfing golf club swing hit ball iron from fairway 01.DU_08mhN.mp3",import.meta.url).href,pn=""+new URL("../assets/sports golfing golf club swing hit ball driver from tee 02.C6ffF-oX.mp3",import.meta.url).href,wn=""+new URL("../assets/sports golfing golf club swing hit ball wedge from fairway 04.C7KTYddj.mp3",import.meta.url).href,gn=""+new URL("../assets/sports golfing golf club swing hit ball wedge from hazzard sand trap 03.B2Bw8A-u.mp3",import.meta.url).href,vn=""+new URL("../assets/sports golfing golf ball land in hazzard sand trap 07.DSADQ3IR.mp3",import.meta.url).href,Mn=""+new URL("../assets/sports golfing golf ball land in water hazzard 03.C2Itf22d.mp3",import.meta.url).href,xn=""+new URL("../assets/sports golfing golf ball hit tree then ground 03.Byq-0M-K.mp3",import.meta.url).href,mn=""+new URL("../assets/sports golfing golf ball drops falls in hole 01.BWkOhIab.mp3",import.meta.url).href,Qt=new AudioContext,N=class N{constructor(e,r,n){S(this,"audio",null);S(this,"track",null);S(this,"startAtMs",0);this.startAtMs=n??0,Qt!==null&&(this.audio=new Audio(e),this.audio.load(),this.audio.volume=r,this.track=Qt.createMediaElementSource(this.audio),this.track.connect(Qt.destination))}play(){this.audio!==null&&(this.audio.currentTime=this.startAtMs/1e3,this.audio.play())}};S(N,"putter",new N(hn,1)),S(N,"iron",new N(dn,.75)),S(N,"driver",new N(pn,.4)),S(N,"wedge",new N(wn,.35)),S(N,"sandWedge",new N(gn,.6)),S(N,"bunker",new N(vn,.5)),S(N,"water",new N(Mn,.7)),S(N,"tree",new N(xn,.3)),S(N,"hole",new N(mn,.6));let st=N;const $e=Math.sqrt(3),En=.5*($e-1),At=(3-$e)/6,be=t=>Math.floor(t)|0,Ie=new Float64Array([1,1,-1,1,1,-1,-1,-1,1,0,-1,0,1,0,-1,0,0,1,0,-1,0,1,0,-1]);function yn(t=Math.random){const e=kn(t),r=new Float64Array(e).map(s=>Ie[s%12*2]),n=new Float64Array(e).map(s=>Ie[s%12*2+1]);return function(i,a){let V=0,l=0,E=0;const d=(i+a)*En,x=be(i+d),f=be(a+d),o=(x+f)*At,w=x-o,A=f-o,b=i-w,h=a-A;let p,g;b>h?(p=1,g=0):(p=0,g=1);const m=b-p+At,c=h-g+At,M=b-1+2*At,W=h-1+2*At,K=x&255,_=f&255;let Y=.5-b*b-h*h;if(Y>=0){const I=K+e[_],F=r[I],q=n[I];Y*=Y,V=Y*Y*(F*b+q*h)}let v=.5-m*m-c*c;if(v>=0){const I=K+p+e[_+g],F=r[I],q=n[I];v*=v,l=v*v*(F*m+q*c)}let y=.5-M*M-W*W;if(y>=0){const I=K+1+e[_+1],F=r[I],q=n[I];y*=y,E=y*y*(F*M+q*W)}return 70*(V+l+E)}}function kn(t){const r=new Uint8Array(512);for(let n=0;n<512/2;n++)r[n]=n;for(let n=0;n<512/2-1;n++){const s=n+~~(t()*(256-n)),i=r[n];r[n]=r[s],r[s]=i}for(let n=256;n<512;n++)r[n]=r[n-256];return r}function tr(t,e,r){let n=[];for(let s=0;s<t;s++){let i=[];for(let a=0;a<e;a++)i.push(r(s,a));n.push(i)}return n}var ht,dt,z,C;class Sn{constructor(e,r,n){k(this,ht);k(this,dt);k(this,z);k(this,C,1);R(this,ht,e),R(this,dt,r),R(this,z,n)}setGlobalNoiseScale(e){R(this,C,e)}buildNoiseMap(e){let r=new tt(e*u(this,C),new $(O.seed(u(this,z).uint32())));return this.buildMap((n,s)=>r.get(n,s))}buildWarpNoiseMap(e,r,n){let s=new Rn(e*u(this,C),r*u(this,C),n/u(this,C),new $(O.seed(u(this,z).uint32())));return this.buildMap((i,a)=>s.get(i,a))}buildLoopyNoiseMap(e,r,n,s,i,a){let V=new bn(e*u(this,C),r/u(this,C),n*u(this,C),s/u(this,C),i*u(this,C),a,new $(O.seed(u(this,z).uint32())));return this.buildMap((l,E)=>V.get(l,E))}buildMap(e){return new re(tr(u(this,ht),u(this,dt),e))}sum(...e){return this.buildMap((r,n)=>e.reduce((s,i)=>s+i.get(r,n),0))}prod01(...e){return this.buildMap((r,n)=>2*e.reduce((s,i)=>s*(.5*i.get(r,n)+.5),1)-1)}}ht=new WeakMap,dt=new WeakMap,z=new WeakMap,C=new WeakMap;var T;const ue=class ue{constructor(e){k(this,T);R(this,T,e)}apply(e){return u(this,T).forEach(r=>r.forEach((n,s)=>r[s]=e(n))),this}shift(e){return u(this,T).forEach(r=>r.forEach((n,s)=>r[s]=n+e)),this}scale(e,r){return r=r??0,u(this,T).forEach(n=>n.forEach((s,i)=>n[i]=r+(s-r)*e)),this}pinch(e,r,n){r=r??0,n=n??1;let s=Math.pow(Math.E,-e);return u(this,T).forEach(i=>i.forEach((a,V)=>{let l=a-r,E=Math.sign(l);i[V]=r+E*Math.pow(E*l/n,s)*n})),this}invert(){return u(this,T).forEach(e=>e.forEach((r,n)=>e[n]=-r)),this}clamp(e,r){return e=e??-1,r=r??1,u(this,T).forEach(n=>n.forEach((s,i)=>n[i]=Math.min(r,Math.max(e,s)))),this}copy(){return new ue(u(this,T).map(e=>e.slice()))}get(e,r){return u(this,T)[e][r]}threshold(e){return u(this,T).map(r=>r.map(n=>n>=e))}toArray(){return u(this,T).slice()}};T=new WeakMap;let re=ue;var pt,it,wt,gt;class tt{constructor(e,r){k(this,pt);k(this,it);k(this,wt);k(this,gt);R(this,pt,yn(()=>r.real(0,1))),R(this,it,e),R(this,wt,r.real(0,1)),R(this,gt,r.real(0,1))}get(e,r){return u(this,pt).call(this,e/u(this,it)+u(this,wt),r/u(this,it)+u(this,gt))}}pt=new WeakMap,it=new WeakMap,wt=new WeakMap,gt=new WeakMap;var vt,Mt,xt,at;class Rn{constructor(e,r,n,s){k(this,vt);k(this,Mt);k(this,xt);k(this,at);R(this,at,n),R(this,vt,new tt(e,s)),R(this,Mt,new tt(r,s)),R(this,xt,new tt(r,s))}get(e,r){let n=u(this,at)*u(this,Mt).get(e,r),s=u(this,at)*u(this,xt).get(e,r);return u(this,vt).get(e+n,r+s)}}vt=new WeakMap,Mt=new WeakMap,xt=new WeakMap,at=new WeakMap;var mt,Et,yt,kt,St,Rt;class bn{constructor(e,r,n,s,i,a,V){k(this,mt);k(this,Et);k(this,yt);k(this,kt);k(this,St);k(this,Rt);R(this,St,r),R(this,mt,new tt(e,V)),R(this,Et,new tt(i,V)),R(this,yt,new tt(n,V)),R(this,kt,s),R(this,Rt,a*i)}get(e,r){const n=2*Math.PI;let s=u(this,Rt)*u(this,Et).get(e,r)*n;s=(s%n+n)%n;let i=u(this,St)+u(this,kt)*u(this,yt).get(e,r),a,V;return s<.25*n?(V=i*Math.sin(s),a=i*Math.cos(s)):s<.5*n?(V=i*Math.cos(s-.25*n),a=-i*Math.sin(s-.25*n)):s<.75*n?(V=-i*Math.sin(s-.5*n),a=-i*Math.cos(s-.5*n)):(V=-i*Math.cos(s-.75*n),a=i*Math.sin(s-.75*n)),u(this,mt).get(e+a,r+V)}}mt=new WeakMap,Et=new WeakMap,yt=new WeakMap,kt=new WeakMap,St=new WeakMap,Rt=new WeakMap;function In(t,e,r,n,s){let i=1;function a(f){return f[0]+","+f[1]}let V=a(r),l=[{position:r,markedRegion:[V]}],E=new Set([V]),d=r;function x(){const f=l.pop();for(const o of f.markedRegion)E.delete(o)}for(;;)for(;;){let f=s.integer(0,7),o=Ln(d,f);if(o[0]<0||o[0]>=t||o[1]<0||o[1]>=e){for(let g=0;g<Math.min(2,l.length-1);g++)x();d=l[l.length-1].position;continue}if(o[0]===n[0]&&o[1]===n[1])return l.push({position:n,markedRegion:[]}),l.map(g=>g.position);let w=o[0]===0||o[0]===t-1,A=o[1]===0||o[1]===e-1;if(w&&A)continue;let b=a(o);if(E.has(b)){let g=!1;for(;!g;){if(l.length===0)throw new Error("Path is empty!");let m=l[l.length-1];if(m.markedRegion.includes(b)){if(m.position[0]===o[0]&&m.position[1]===o[1])d=m.position;else{for(let c=0;c<i;c++)x();d=l[l.length-1].position}g=!0}else x()}continue}let h=[a(o)],p=l[l.length-1-i];if(p!==void 0)for(let g=-1;g<2;g++)for(let m=-1;m<2;m++){let c=[p.position[0]+m,p.position[1]+g];if(c[0]===n[0]&&c[1]===n[1]){for(let W=0;W<i;W++)x();return l.push({position:n,markedRegion:[]}),l.map(W=>W.position)}const M=a(c);E.has(M)||(h.push(M),E.add(M))}l.push({position:o,markedRegion:h}),d=o;break}}function Ne(t,e,r){let n=[.0158,.0514,.1191,.1971,.2332,.1971,.1191,.0514,.0158];function s(V,l,E){let d=Array(l).fill(null).map(()=>Array(V).fill(0));return E.forEach((x,f)=>{for(let o=0;o<x.length;o++){let w=0;for(let A=-4;A<5;A++)w+=(x[o+A]??0)*n[A+4];d[o][f]=w}}),d}let i=s(t,e,r);return s(e,t,i)}function Nn(t,e,r){const i=new $(O.seed(r.uint32()));function a(d,x,f){let o=i.integer(1,(d-2)*Math.abs(f)-1);return f<0&&(o=d-o-1),[o,i.integer(1,x-2*1-1)]}let V,l,E=i.pick([-1,1]);if(t>e){let[d,x]=a(t,e,-E*.25);l=[d,x],[d,x]=a(t,e,E*.25),V=[d,x]}else{let[d,x]=a(e,t,-E*.25);l=[x,d],[d,x]=a(e,t,E*.25),V=[x,d]}return[l,V]}class le{constructor(e,r,n){S(this,"id");S(this,"name");S(this,"value");this.id=e,this.name=r,this.value=n}}class _e extends le{constructor(r,n,s,i){super(r,n,s);S(this,"options");this.options=[{id:s,name:i}]}addOption(r,n){return this.options.push({id:r,name:n}),this}}class We extends le{constructor(e,r,n){super(e,r,n)}}class Ht extends le{constructor(r,n,s,i,a,V){super(r,n,V);S(this,"sliderMin");S(this,"sliderMax");S(this,"sliderStep");this.sliderMin=s,this.sliderMax=i,this.sliderStep=a}}class _n{constructor(){S(this,"settings",[])}addSetting(e){return this.settings.push(e),this}setting(e){return this.settings.find(r=>r.id===e)??null}is(e,r){var n;return((n=this.setting(e))==null?void 0:n.value)===r}get(e){var r;return((r=this.setting(e))==null?void 0:r.value)??null}}function Pn(){return new _n().addSetting(new _e("map","Map","result","Result").addOption("edge","Edge").addOption("path","Path").addOption("pathEnds","Path Ends").addOption("l","Land").addOption("w","Water").addOption("r","Rock").addOption("f","Fairway").addOption("t","Trees").addOption("s","Sand")).addSetting(new _e("mapStage","Map Stage","end","End").addOption("1","1").addOption("2","2").addOption("3","3")).addSetting(new Ht("a","A",-1,1,.05,0)).addSetting(new Ht("b","B",-1,1,.05,0)).addSetting(new Ht("c","C",-1,1,.05,0)).addSetting(new We("m","M",!1)).addSetting(new We("n","N",!1))}class D{constructor(e){S(this,"map");this.map=e}}function Wn(t,e,r,n,s,i){let a=In(t,e,r,n,new $(O.seed(s.uint32()))),V=Array(t).fill(null).map(()=>Array(e).fill(0)),l=Array(t).fill(null).map(()=>Array(e).fill(0));for(const v of a)V[v[0]][v[1]]=1;for(const v of[[-1,0],[1,0],[0,-1],[0,1]])l[n[0]+v[0]][n[1]+v[1]]!==void 0&&(l[n[0]+v[0]][n[1]+v[1]]=.65);for(const v of[[-1,0],[1,0],[0,-1],[0,1]])l[r[0]+v[0]][r[1]+v[1]]===0&&(l[r[0]+v[0]][r[1]+v[1]]=.45);[1.5,1,.85,.7,.5,.3].forEach((v,y)=>{let I=a[y];I!==void 0&&(l[I[0]][I[1]]+=v);let F=a[a.length-1-y];F!==void 0&&(l[F[0]][F[1]]+=v)});let d=Ne(t,e,V),x=Ne(t,e,l),f=new Sn(t,e,s),o=f.buildMap((v,y)=>d[v][y]*6-1).clamp();if(i!=null&&i.is("map","path"))return new D(o.toArray());let w=f.buildMap((v,y)=>x[v][y]*9-1).clamp();if(i!=null&&i.is("map","pathEnds"))return new D(w.toArray());let A=f.buildMap((v,y)=>{let I=1;return v<=2&&(I*=Math.pow((v+1.5)/4.5,.85)),v>=t-3&&(I*=Math.pow((t-1-(v-1.5))/4.5,.85)),y<=2&&(I*=Math.pow((y+1.5)/4.5,.85)),y>=e-3&&(I*=Math.pow((e-1-(y-1.5))/4.5,.85)),2*I-1});if(i!=null&&i.is("map","edge"))return new D(A.toArray());let b=f.prod01(f.prod01(f.buildWarpNoiseMap(10,10,2.5),A.copy().pinch(.2,1,2)).invert(),w.copy().invert(),o.copy().scale(.08,-1).invert()).invert().pinch(-.2,1,2);if(i!=null&&i.is("map","l"))return new D(b.toArray());let h=b.copy().invert().threshold(.2);if(i!=null&&i.is("map","w"))return new D(h);let p=f.prod01(f.prod01(f.sum(f.buildWarpNoiseMap(10,8,3)),b.copy().scale(.85,-1).shift(.25).clamp()).invert(),w.copy().scale(3.5,1).clamp().invert()).invert();if(i!=null&&i.is("map","f"))return new D(p.toArray());let g=p.threshold(0),m=f.prod01(f.sum(f.buildLoopyNoiseMap(13,4,10,4,8,.025).scale(1),f.buildWarpNoiseMap(7,10,1).scale(0)),b.copy().scale(1.4,-1).shift(.4).clamp(),o.copy().pinch(-.2,1,.4).clamp().scale(.8,-1).invert(),w.copy().scale(2,1).clamp().invert());if(i!=null&&i.is("map","r"))return new D(m.toArray());let c=m.threshold(.15),M=f.prod01(f.sum(f.buildWarpNoiseMap(10,15,2.5).scale(.15),f.buildWarpNoiseMap(7,10,2).scale(.5),f.buildWarpNoiseMap(3,8,2).scale(1)),b.copy().scale(1.5,-1).shift(.45).clamp(),w.copy().scale(2,1).clamp().invert(),p.copy().scale(3,1).clamp().invert());if(i!=null&&i.is("map","t"))return new D(M.toArray());let W=M.threshold(.3),K=b.copy().invert().scale(2,-1).shift(.25).clamp(),_=f.prod01(f.sum(f.buildNoiseMap(8).scale(1)),K);if(i!=null&&i.is("map","s"))return new D(_.toArray());let Y=_.threshold(.45);return tr(t,e,(v,y)=>{if(n[0]===v&&n[1]===y)return Q.Hole;switch(!0){case h[v][y]:return Q.Water;case c[v][y]:return Q.Rock;case W[v][y]:return Q.Tree;case Y[v][y]:return Q.Sand;case g[v][y]:return Q.Fairway;default:return Q.Rough}})}function Tn(t,e,r,n,s){let i=Wn(t,e,r,n,s);if(i instanceof D)throw new Error("Terrain Generation returned debug map without any debug settings being supplied.");return i}var Q=(t=>(t[t.Hole=0]="Hole",t[t.Fairway=1]="Fairway",t[t.Rough=2]="Rough",t[t.Water=3]="Water",t[t.Sand=4]="Sand",t[t.Tree=5]="Tree",t[t.Rock=6]="Rock",t))(Q||{}),Cn=(t=>(t[t.None=0]="None",t[t.Stick=1]="Stick",t[t.Block=2]="Block",t))(Cn||{});function Xn(t){switch(t){case 1:return new X("hsl(90, 60%, 40%)",0,!1,0,1);case 2:return new X("hsl(100, 60%, 35%)",0,!1,0,0);case 3:return new X("hsl(210, 50%, 60%)",0,!0,0,0).setLandSoundEffect(st.water);case 4:return new X("hsl(55, 50%, 60%)",0,!1,-1,0).setLandSoundEffect(st.bunker);case 5:return new X("hsl(120, 20%, 35%)",1,!1,0,0).setBlockSoundEffect(st.tree);case 6:return new X("hsl(120, 0%, 30%)",2,!1,0,0).setBlockSoundEffect(st.tree);case 0:return new X("hsl(170, 60%, 45%)",0,!1,0,0)}}class X{constructor(e,r,n,s,i){S(this,"primaryColor");S(this,"blockType");S(this,"outOfBounds");S(this,"shotModifier");S(this,"rollDistance");S(this,"landSoundEffect",null);S(this,"blockSoundEffect",null);this.primaryColor=e,this.blockType=r,this.outOfBounds=n,this.shotModifier=s,this.rollDistance=i}setLandSoundEffect(e){return this.landSoundEffect=e,this}setBlockSoundEffect(e){return this.blockSoundEffect=e,this}}var Un=(t=>(t[t.N=0]="N",t[t.NE=1]="NE",t[t.E=2]="E",t[t.SE=3]="SE",t[t.S=4]="S",t[t.SW=5]="SW",t[t.W=6]="W",t[t.NW=7]="NW",t))(Un||{}),ot,Vt,bt,Lt,It;const ce=class ce{constructor(e,r,n,s,i){k(this,ot);k(this,Vt);k(this,bt);k(this,Lt);k(this,It);R(this,ot,e),R(this,Vt,r),R(this,bt,n),R(this,Lt,s),R(this,It,i)}static generate(e,r,n){let[s,i]=Nn(e,r,new $(O.seed(n.uint32()))),a=Tn(e,r,s,i,new $(O.seed(n.uint32())));return new ce(r,e,a,i,s)}height(){return u(this,ot)}width(){return u(this,Vt)}cell(e){return u(this,bt)[e[0]][e[1]]}tee(){return u(this,It)}isValidPosition(e){const r=e[0],n=e[1];return r>=0&&n>=0&&r<u(this,Vt)&&n<u(this,ot)}};ot=new WeakMap,Vt=new WeakMap,bt=new WeakMap,Lt=new WeakMap,It=new WeakMap;let Te=ce;function Ln(t,e){switch(e){case 0:return[t[0],t[1]+1];case 1:return[t[0]+1,t[1]+1];case 2:return[t[0]+1,t[1]];case 3:return[t[0]+1,t[1]-1];case 4:return[t[0],t[1]-1];case 5:return[t[0]-1,t[1]-1];case 6:return[t[0]-1,t[1]];case 7:return[t[0]-1,t[1]+1]}}function Bn(t,e){return((t+e)%8+8)%8}function Fn(t){switch(t){case 0:return[0,1];case 1:return[1,1];case 2:return[1,0];case 3:return[1,-1];case 4:return[0,-1];case 5:return[-1,-1];case 6:return[-1,0];case 7:return[-1,1]}}var lt,ut,Nt;class Pt{constructor(e,r,n){k(this,lt);k(this,ut);k(this,Nt);R(this,lt,e),R(this,ut,r),R(this,Nt,n??!1)}play(e){var r;u(this,Nt)?(r=e.querySelector(".glow-element"))==null||r.animate(u(this,lt),{duration:u(this,ut),iterations:1}):e.animate(u(this,lt),{duration:u(this,ut),iterations:1})}}lt=new WeakMap,ut=new WeakMap,Nt=new WeakMap;var ct,_t,ne;const j=class j{constructor(e){k(this,ct);R(this,ct,e)}play(e){for(const r of u(this,ct))r.play(e)}static combine(...e){return new j(e.reduce((r,n)=>(r.push(...u(n,ct)),r),[]))}static glow(e,r,n){return new j([new Pt([{boxShadow:`0 0 ${r}px ${r/2}px transparent`,easing:"ease-out"},{boxShadow:`0 0 ${r}px ${r/2}px ${e}`,easing:"ease-in",offset:.02},{boxShadow:`0 0 ${r}px ${r/2}px transparent`}],n,!0)])}static wobble(e,r,n){const a=Ot(this,_t,ne).call(this,e);let V=[{transform:`rotate3d(${a[0]}, ${-a[1]}, 0, 0deg)`,easing:"ease-out"},{transform:`rotate3d(${a[0]}, ${-a[1]}, 0, ${r}deg)`,offset:.05,easing:"cubic-bezier(.42,0,.58,1)"}];for(let l=1;l<6;l++)V.push({transform:`rotate3d(${a[0]}, ${-a[1]}, 0, ${r*Math.pow(-.625,l)}deg)`,offset:.05+l*(1-.05)/6,easing:"cubic-bezier(.42,0,.58,1)"});return V.push({transform:`rotate3d(${a[0]}, ${-a[1]}, 0, 0deg)`}),new j([new Pt(V,n)])}static spin(e,r){let n=Ot(this,_t,ne).call(this,e);return new j([new Pt([{transform:`rotate3d(${n[0]}, ${-n[1]}, 0, 0deg)`,easing:"cubic-bezier(0, 0.2, 0, 1)"},{transform:`rotate3d(${n[0]}, ${-n[1]}, 0, ${360*4}deg)`}],r)])}};ct=new WeakMap,_t=new WeakSet,ne=function(e){return Fn(Bn(e,2))},k(j,_t);let Ce=j;export{Q as C,D,O as M,$ as R,st as S,We as T,Wn as a,Xn as b,Pn as c,Hn as d,Jn as e,Ht as f,Nn as g,Qn as h,Dn as i,_e as j,qn as k,Zn as l,Fr as m,Un as n,Ln as o,Ce as p,Bn as q,Gn as r,Xt as s,rn as t,ze as u,Cn as v,Te as w};

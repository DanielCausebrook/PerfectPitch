import{S as A,o as Q,e as W,g as w,h as X,i as y,j as I,U as v,k as p,m as F,n as k,q as ee,v as re,w as ne,x as C,y as te,E as ie,H as se,z as ae,A as fe,B as K,C as Y,D as j,F as M,G as ue,I as le,L as _e,P as $,J as de,d as U,K as G,M as T,N as J,O as ce,R as oe,Q as H,T as ve,l as he,V as be,W as pe,X as Z,Y as Pe,Z as we,_ as ye}from"./DDsU38he.js";function E(e,r=null,u){if(typeof e!="object"||e===null||A in e)return e;const a=ee(e);if(a!==Q&&a!==W)return e;var t=new Map,d=re(e),h=w(0);d&&t.set("length",w(e.length));var P;return new Proxy(e,{defineProperty(l,n,i){(!("value"in i)||i.configurable===!1||i.enumerable===!1||i.writable===!1)&&X();var f=t.get(n);return f===void 0?(f=w(i.value),t.set(n,f)):y(f,E(i.value,P)),!0},deleteProperty(l,n){var i=t.get(n);if(i===void 0)n in l&&t.set(n,w(v));else{if(d&&typeof n=="string"){var f=t.get("length"),s=Number(n);Number.isInteger(s)&&s<f.v&&y(f,s)}y(i,v),z(h)}return!0},get(l,n,i){var o;if(n===A)return e;var f=t.get(n),s=n in l;if(f===void 0&&(!s||(o=I(l,n))!=null&&o.writable)&&(f=w(E(s?l[n]:v,P)),t.set(n,f)),f!==void 0){var _=p(f);return _===v?void 0:_}return Reflect.get(l,n,i)},getOwnPropertyDescriptor(l,n){var i=Reflect.getOwnPropertyDescriptor(l,n);if(i&&"value"in i){var f=t.get(n);f&&(i.value=p(f))}else if(i===void 0){var s=t.get(n),_=s==null?void 0:s.v;if(s!==void 0&&_!==v)return{enumerable:!0,configurable:!0,value:_,writable:!0}}return i},has(l,n){var _;if(n===A)return!0;var i=t.get(n),f=i!==void 0&&i.v!==v||Reflect.has(l,n);if(i!==void 0||F!==null&&(!f||(_=I(l,n))!=null&&_.writable)){i===void 0&&(i=w(f?E(l[n],P):v),t.set(n,i));var s=p(i);if(s===v)return!1}return f},set(l,n,i,f){var m;var s=t.get(n),_=n in l;if(d&&n==="length")for(var o=i;o<s.v;o+=1){var g=t.get(o+"");g!==void 0?y(g,v):o in l&&(g=w(v),t.set(o+"",g))}s===void 0?(!_||(m=I(l,n))!=null&&m.writable)&&(s=w(void 0),y(s,E(i,P)),t.set(n,s)):(_=s.v!==v,y(s,E(i,P)));var b=Reflect.getOwnPropertyDescriptor(l,n);if(b!=null&&b.set&&b.set.call(f,i),!_){if(d&&typeof n=="string"){var O=t.get("length"),S=Number(n);Number.isInteger(S)&&S>=O.v&&y(O,S+1)}z(h)}return!0},ownKeys(l){p(h);var n=Reflect.ownKeys(l).filter(s=>{var _=t.get(s);return _===void 0||_.v!==v});for(var[i,f]of t)f.v!==v&&!(i in l)&&n.push(i);return n},setPrototypeOf(){k()}})}function z(e,r=1){y(e,e.v+r)}function Oe(e,r,u=!1){C&&te();var a=e,t=null,d=null,h=v,P=u?ie:0,l=!1;const n=(f,s=!0)=>{l=!0,i(s,f)},i=(f,s)=>{if(h===(h=f))return;let _=!1;if(C){const o=a.data===se;!!h===o&&(a=ae(),fe(a),K(!1),_=!0)}h?(t?Y(t):s&&(t=j(()=>s(a))),d&&M(d,()=>{d=null})):(d?Y(d):s&&(d=j(()=>s(a))),t&&M(t,()=>{t=null})),_&&K(!0)};ne(()=>{l=!1,r(n),l||i(null,null)},P),C&&(a=ue)}let N=!1;function ge(e){var r=N;try{return N=!1,[e(),N]}finally{N=r}}const me={get(e,r){if(!e.exclude.includes(r))return p(e.version),r in e.special?e.special[r]():e.props[r]},set(e,r,u){return r in e.special||(e.special[r]=Ee({get[r](){return e.props[r]}},r,$)),e.special[r](u),G(e.version),!0},getOwnPropertyDescriptor(e,r){if(!e.exclude.includes(r)&&r in e.props)return{enumerable:!0,configurable:!0,value:e.props[r]}},deleteProperty(e,r){return e.exclude.includes(r)||(e.exclude.push(r),G(e.version)),!0},has(e,r){return e.exclude.includes(r)?!1:r in e.props},ownKeys(e){return Reflect.ownKeys(e.props).filter(r=>!e.exclude.includes(r))}};function Se(e,r){return new Proxy({props:e,exclude:r,special:{},version:w(0)},me)}const Re={get(e,r){let u=e.props.length;for(;u--;){let a=e.props[u];if(T(a)&&(a=a()),typeof a=="object"&&a!==null&&r in a)return a[r]}},set(e,r,u){let a=e.props.length;for(;a--;){let t=e.props[a];T(t)&&(t=t());const d=I(t,r);if(d&&d.set)return d.set(u),!0}return!1},getOwnPropertyDescriptor(e,r){let u=e.props.length;for(;u--;){let a=e.props[u];if(T(a)&&(a=a()),typeof a=="object"&&a!==null&&r in a){const t=I(a,r);return t&&!t.configurable&&(t.configurable=!0),t}}},has(e,r){if(r===A||r===J)return!1;for(let u of e.props)if(T(u)&&(u=u()),u!=null&&r in u)return!0;return!1},ownKeys(e){const r=[];for(let u of e.props){T(u)&&(u=u());for(const a in u)r.includes(a)||r.push(a)}return r}};function xe(...e){return new Proxy({props:e},Re)}function V(e){for(var r=F,u=F;r!==null&&!(r.f&(ce|oe));)r=r.parent;try{return H(r),e()}finally{H(u)}}function Ee(e,r,u,a){var B;var t=(u&ve)!==0,d=!he||(u&be)!==0,h=(u&pe)!==0,P=(u&we)!==0,l=!1,n;h?[n,l]=ge(()=>e[r]):n=e[r];var i=A in e||J in e,f=h&&(((B=I(e,r))==null?void 0:B.set)??(i&&r in e&&(c=>e[r]=c)))||void 0,s=a,_=!0,o=!1,g=()=>(o=!0,_&&(_=!1,P?s=U(a):s=a),s);n===void 0&&a!==void 0&&(f&&d&&le(),n=g(),f&&f(n));var b;if(d)b=()=>{var c=e[r];return c===void 0?g():(_=!0,o=!1,c)};else{var O=V(()=>(t?Z:Pe)(()=>e[r]));O.f|=_e,b=()=>{var c=p(O);return c!==void 0&&(s=void 0),c===void 0?s:c}}if(!(u&$))return b;if(f){var S=e.$$legacy;return function(c,R){return arguments.length>0?((!d||!R||S||l)&&f(R?b():c),c):b()}}var m=!1,q=!1,D=ye(n),x=V(()=>Z(()=>{var c=b(),R=p(D);return m?(m=!1,q=!0,R):(q=!1,D.v=c)}));return t||(x.equals=de),function(c,R){if(arguments.length>0){const L=R?p(x):d&&h?E(c):c;return x.equals(L)||(m=!0,y(D,L),o&&s!==void 0&&(s=L),U(()=>p(x))),c}return p(x)}}export{E as a,Oe as i,Se as l,Ee as p,xe as s};

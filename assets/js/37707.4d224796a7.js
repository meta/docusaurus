"use strict";(globalThis.rspackChunkwebsite||=[]).push([[37707],{52938(e,t,a){function i(e,t){e.accDescr&&t.setAccDescription?.(e.accDescr),e.accTitle&&t.setAccTitle?.(e.accTitle),e.title&&t.setDiagramTitle?.(e.title)}(0,a(48815).K)(i,"populateCommonDb"),a.d(t,{},{S:i})},70694(e,t,a){var i=a(52938),l=a(31664),r=a(58204),n=a(57236),s=a(64225),o=a(48815),c=a(29874),d=a(47165),p=n.UI.pie,h={sections:new Map,showData:!1,config:p},g=h.sections,u=h.showData,f=structuredClone(p),m=(0,o.K)(()=>structuredClone(f),"getConfig"),$=(0,o.K)(()=>{g=new Map,u=h.showData,(0,n.IU)()},"clear"),x=(0,o.K)(({label:e,value:t})=>{if(t<0)throw Error(`"${e}" has invalid value: ${t}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);g.has(e)||(g.set(e,t),s.R.debug(`added new section: ${e}, with value: ${t}`))},"addSection"),S=(0,o.K)(()=>g,"getSections"),w=(0,o.K)(e=>{u=e},"setShowData"),y=(0,o.K)(()=>u,"getShowData"),T={getConfig:m,clear:$,setDiagramTitle:n.ke,getDiagramTitle:n.ab,setAccTitle:n.SV,getAccTitle:n.iN,setAccDescription:n.EI,getAccDescription:n.m7,addSection:x,getSections:S,setShowData:w,getShowData:y},b=(0,o.K)((e,t)=>{(0,i.S)(e,t),t.setShowData(e.showData),e.sections.map(t.addSection)},"populateDb"),D={parse:(0,o.K)(async e=>{let t=await (0,c.qg)("pie",e);s.R.debug(t),b(t,T)},"parse")},C=(0,o.K)(e=>`
  .pieCircle{
    stroke: ${e.pieStrokeColor};
    stroke-width : ${e.pieStrokeWidth};
    opacity : ${e.pieOpacity};
  }
  .pieCircle.highlighted{
    scale: 1.05;
    opacity: 1;
  }
  .pieCircle.highlightedOnHover:hover{
    transition-duration: 250ms;
    scale: 1.05;
    opacity: 1;
  }
  .pieOuterCircle{
    stroke: ${e.pieOuterStrokeColor};
    stroke-width: ${e.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${e.pieTitleTextSize};
    fill: ${e.pieTitleTextColor};
    font-family: ${e.fontFamily};
  }
  .slice {
    font-family: ${e.fontFamily};
    fill: ${e.pieSectionTextColor};
    font-size:${e.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${e.pieLegendTextColor};
    font-family: ${e.fontFamily};
    font-size: ${e.pieLegendTextSize};
  }
`,"getStyles"),v=(0,o.K)(e=>{let t=[...e.values()].reduce((e,t)=>e+t,0),a=[...e.entries()].map(([e,t])=>({label:e,value:t})).filter(e=>e.value/t*100>=1);return(0,d.rLf)().value(e=>e.value).sort(null)(a)},"createPieArcs"),k=(0,o.K)((e,t,a,i)=>{s.R.debug("rendering pie chart\n"+e);let o=i.db,c=(0,n.D7)(),p=(0,r.$t)(o.getConfig(),c.pie),h=(0,l.D)(t),g=h.append("g");g.attr("transform","translate(225,225)");let{themeVariables:u}=c,[f]=(0,r.I5)(u.pieOuterStrokeWidth);f??=2;let m=p.legendPosition,$=p.textPosition,x=p.donutHole>0&&p.donutHole<=.9?p.donutHole:0,S=(0,d.JLW)().innerRadius(185*x).outerRadius(185),w=(0,d.JLW)().innerRadius(185*$).outerRadius(185*$),y=g.append("g");y.append("circle").attr("cx",0).attr("cy",0).attr("r",185+f/2).attr("class","pieOuterCircle");let T=o.getSections(),b=v(T),D=[u.pie1,u.pie2,u.pie3,u.pie4,u.pie5,u.pie6,u.pie7,u.pie8,u.pie9,u.pie10,u.pie11,u.pie12],C=0;T.forEach(e=>{C+=e});let k=b.filter(e=>"0"!==(e.data.value/C*100).toFixed(0)),A=(0,d.UMr)(D).domain([...T.keys()]);y.selectAll("mySlices").data(k).enter().append("path").attr("d",S).attr("fill",e=>A(e.data.label)).attr("class",e=>{let t="pieCircle";return"hover"===p.highlightSlice?t+=" highlightedOnHover":p.highlightSlice===e.data.label&&(t+=" highlighted"),t}),y.selectAll("mySlices").data(k).enter().append("text").text(e=>(e.data.value/C*100).toFixed(0)+"%").attr("transform",e=>"translate("+w.centroid(e)+")").style("text-anchor","middle").attr("class","slice");let K=g.append("text").text(o.getDiagramTitle()).attr("x",0).attr("y",-200).attr("class","pieTitleText"),R=[...T.entries()].map(([e,t])=>({label:e,value:t})),O=g.selectAll(".legend").data(R).enter().append("g").attr("class","legend");O.append("rect").attr("width",18).attr("height",18).style("fill",e=>A(e.label)).style("stroke",e=>A(e.label)),O.append("text").attr("x",22).attr("y",14).text(e=>o.getShowData()?`${e.label} [${e.value}]`:e.label);let M=Math.max(...O.selectAll("text").nodes().map(e=>e?.getBoundingClientRect().width??0)),z=450,W=490,F=22*R.length;switch(m){case"center":O.attr("transform",(e,t)=>"translate("+(-M/2-22)+","+(22*t-22*R.length/2)+")");break;case"top":z+=F,O.attr("transform",(e,t)=>`translate(${-M/2-22}, ${22*t-185})`),y.attr("transform",()=>`translate(0, ${F+22})`);break;case"bottom":z+=F,O.attr("transform",(e,t)=>"translate("+(-M/2-22)+","+(22*t- -207)+")");break;case"left":W+=22+M,O.attr("transform",(e,t)=>"translate(-207,"+(22*t-22*R.length/2)+")"),y.attr("transform",()=>`translate(${M+18+4}, 0)`);break;default:W+=22+M,O.attr("transform",(e,t)=>"translate(216,"+(22*t-22*R.length/2)+")")}let H=K.node()?.getBoundingClientRect().width??0,L=Math.min(0,225-H/2),I=Math.max(W,225+H/2)-L;h.attr("viewBox",`${L} 0 ${I} ${z}`),(0,n.a$)(h,z,I,p.useMaxWidth)},"draw");a.d(t,{},{diagram:{parser:D,db:T,renderer:{draw:k},styles:C}})}}]);
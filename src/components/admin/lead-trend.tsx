"use client";
import { useEffect, useId, useState } from "react";
import { adminRequest } from "./dashboard";
type Day = {date:string;count:number|null};
type Series = {start:string;end:string;daily:Day[]};
const colors=["#3377bc","#8560b5","#22846d"];
const label=(date:string)=>new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"});
export function LeadTrend({daily,revision}:{daily:{date:string;count:number}[];revision:number}) {
 const gradient=useId();
 const today=daily.at(-1)!.date;
 const [period,setPeriod]=useState("week");
 const [count,setCount]=useState(2);
 const [dates,setDates]=useState(()=>[today,daily[6].date,daily[0].date]);
 const [query,setQuery]=useState(""); const [requestId,setRequestId]=useState(0);
 const [result,setResult]=useState<{period:string;series:Series[]}|null>(null);
 const [loaded,setLoaded]=useState("");const [error,setError]=useState("");
 const [active,setActive]=useState<{series:number;index:number}|null>(null);
 useEffect(()=>{if(!query)return;let alive=true;const controller=new AbortController();adminRequest(`/api/admin/stats/compare?${query}`,{signal:controller.signal}).then(value=>{if(alive){setResult(value);setLoaded(query);setError("");setActive(null);}}).catch(error=>{if(alive)setError(error.message);});return()=>{alive=false;controller.abort();};},[query,revision,requestId]);
 const fallback=[daily.slice(-7),daily.slice(0,7)].map(days=>({start:days[0].date,end:days.at(-1)!.date,daily:days}));
 const series=result?.series||fallback;
 const monthly=result?.period==="month";
 const ceiling=Math.max(4,Math.ceil(Math.max(0,...series.flatMap(item=>item.daily.map(day=>day.count||0)))/4)*4);
 const slots=Math.max(...series.map(item=>item.daily.length));
 const x=(i:number)=>42+i*482/(slots-1),y=(v:number)=>194-v/ceiling*150;
 const selected=active&&series[active.series]?.daily[active.index];
 const pending=query!==loaded;
 return <article className="admin-chart admin-trend">
 <div className="admin-trend-heading"><div><span className="admin-trend-kicker">ENQUIRY ACTIVITY</span><h2>Lead comparison</h2></div><span className="admin-trend-period">{series.length} periods</span></div>
 <form className="admin-compare-controls" onSubmit={event=>{event.preventDefault();const params=new URLSearchParams({period});dates.slice(0,count).forEach(date=>params.append("date",date));setError("");setQuery(params.toString());setRequestId(value=>value+1);}}>
 <div className="admin-compare-options"><label>Compare<select value={period} onChange={event=>{setPeriod(event.target.value);if(event.target.value==="month")setDates([0,1,2].map(offset=>{const date=new Date(`${today}T12:00:00Z`);date.setUTCDate(1);date.setUTCMonth(date.getUTCMonth()-offset);return date.toISOString().slice(0,10);}));}}><option value="week">Weeks</option><option value="month">Months</option></select></label><label>Periods<select value={count} onChange={event=>setCount(Number(event.target.value))}><option value={2}>2 periods</option><option value={3}>3 periods</option></select></label></div>
 <div className="admin-compare-dates">{dates.slice(0,count).map((date,index)=><label key={index}><span><i style={{background:colors[index]}}/> {period==="week"?"Week":"Month"} {index+1}</span><input aria-label={`Comparison ${period} ${index+1}`} required type={period==="month"?"month":"date"} min={period==="month"?"1900-01":"1900-01-01"} max={period==="month"?"2100-12":"2100-12-31"} value={period==="month"?date.slice(0,7):date} onInput={event=>{const value=event.currentTarget.value;setDates(current=>current.map((item,i)=>i===index?(value&&period==="month"?value+"-01":value):item));}}/></label>)}</div>
 <div className="admin-compare-apply"><span>{period==="week"?"Select any date within each week. Weeks run Monday to Sunday.":"Compare daily activity across your selected months."}</span><button className="admin-button" type="submit">Compare</button></div>
 </form>
 <div className="admin-compare-feedback" role="status">{error|| (pending?"Updating comparison…":"")}</div>
 <div className="admin-comparison-totals">{series.map((item,index)=><div key={index} style={{color:colors[index]}}><strong>{item.daily.reduce((sum,day)=>sum+(day.count||0),0)}</strong><span>{label(item.start)} – {label(item.end)}</span></div>)}</div>
 <div className="admin-comparison-readout" aria-live="polite" style={{color:colors[active?.series||0]}}>{selected?`${label(selected.date)} · ${selected.count??"Not yet available"}${selected.count!==null?" leads":""}`:"Hover or select a point to see daily leads"}</div>
 <svg className="admin-trend-svg" viewBox="0 0 560 240" role="group" aria-label="Daily leads across selected comparison periods">
 <defs><linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={colors[0]} stopOpacity=".14"/><stop offset="100%" stopColor={colors[0]} stopOpacity="0"/></linearGradient></defs>
 {[0,1,2,3,4].map(tick=><g key={tick}><line x1="42" x2="524" y1={44+tick*37.5} y2={44+tick*37.5} stroke="#e0e8ef" strokeDasharray="4 5"/><text x="29" y={48+tick*37.5} textAnchor="end">{ceiling*(4-tick)/4}</text></g>)}
 {Array.from({length:slots},(_,i)=>i).filter(i=>slots===7||i===0||i===slots-1||(i+1)%5===0).map(i=><text key={i} x={x(i)} y="221" textAnchor="middle">{monthly?i+1:result?["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i]:`Day ${i+1}`}</text>)}
 {series.map((item,si)=>{const points=item.daily.map((day,i)=>({...day,i})).filter(day=>day.count!==null);const line=points.map(day=>`${x(day.i)},${y(day.count!)}`).join(" ");return <g key={si}>{si===0&&points.length>0&&<polygon points={`${x(0)},194 ${line} ${x(points.at(-1)!.i)},194`} fill={`url(#${gradient})`}/>}<polyline points={line} fill="none" stroke={colors[si]} strokeWidth="2.5" strokeDasharray={si===1?"6 4":si===2?"2 4":undefined} strokeLinejoin="round"/>{points.map(day=><g key={day.date} tabIndex={0} role="button" className="admin-trend-point" aria-label={`Period ${si+1}: ${label(day.date)}: ${day.count} leads`} onMouseEnter={()=>setActive({series:si,index:day.i})} onFocus={()=>setActive({series:si,index:day.i})} onClick={()=>setActive({series:si,index:day.i})} onKeyDown={event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();setActive({series:si,index:day.i});}}}><circle cx={x(day.i)} cy={y(day.count!)} r={slots>7?7:13} fill="transparent"/><circle cx={x(day.i)} cy={y(day.count!)} r={active?.series===si&&active.index===day.i?5:slots>7?2.5:4} fill="white" stroke={colors[si]} strokeWidth="2"/></g>)}</g>;})}
 </svg><p className="admin-week-note">{monthly?"Aligned by day of month. Shorter months end on their last day.":result?"Aligned Monday to Sunday.":"Showing the last 7 days against the preceding 7 days."} Future days are excluded. Today may be incomplete.</p>
 </article>;
}

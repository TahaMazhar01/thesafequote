"use client";
import { useState } from "react";
import { Download } from "lucide-react";
import { useNotification } from "./notifications";
export function LeadDownload({ filter, disabled }: { filter: {search:string;status:string;view:string;range:string;from:string;to:string}; disabled:boolean }) {
  const [format,setFormat]=useState("xlsx");
  const [busy,setBusy]=useState(false);
  const {notify}=useNotification();
  async function download(){
    setBusy(true);
    try {
      const response=await fetch("/api/admin/leads/export",{method:"POST",headers:{"Content-Type":"application/json"},cache:"no-store",signal:AbortSignal.timeout(60000),body:JSON.stringify({format,search:filter.search,status:filter.status,archived:String(filter.view==="archived"),deleted:String(filter.view==="trash"),range:filter.range,from:filter.from,to:filter.to})});
      if(!response.ok){const result=await response.json();throw new Error(result.error||"Download failed.");}
      const url=URL.createObjectURL(await response.blob());const link=document.createElement("a");link.href=url;link.download=`leads-${new Date().toISOString().slice(0,10)}.${format}`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
      notify({title:"Leads export ready",message:`${response.headers.get("X-Export-Count")||"Matching"} leads exported using the applied filters.`});
    }catch(error){notify({title:"Download unavailable",message:error instanceof Error?error.message:"Please try again."});}
    finally{setBusy(false);}
  }
  return <div className="admin-export"><div className="admin-tool-heading"><strong>Download filtered leads</strong><p>All matching rows · Up to 2,000 per file · Full field values</p></div><div className="admin-export-controls"><label>Format<select value={format} disabled={busy} onChange={event=>setFormat(event.target.value)}><option value="xlsx">Excel (.xlsx)</option><option value="csv">CSV (.csv)</option></select></label><button className="admin-button" disabled={disabled||busy} onClick={download}><Download size={18}/>{busy?"Preparing…":"Download leads"}</button></div></div>;
}

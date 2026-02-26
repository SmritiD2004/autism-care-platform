import { useState, useEffect } from "react";

export default function MLDemo() {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const check = async () => {
      try {
        await fetch("http://localhost:8501", { mode: "no-cors", signal: AbortSignal.timeout(3000) });
        setStatus("online");
      } catch {
        setStatus("offline");
      }
    };
    check();
    const interval = setInterval(async () => {
      try {
        await fetch("http://localhost:8501", { mode: "no-cors", signal: AbortSignal.timeout(2000) });
        setStatus("online");
        clearInterval(interval);
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:"#0d1117" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 1.5rem", height:52, flexShrink:0, background:"#131929", borderBottom:"1px solid #253047" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontWeight:700, color:"#e2e8f0", fontSize:15 }}>Predictive Intelligence Engine</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:7, padding:"4px 14px", borderRadius:20, background:"rgba(255,255,255,0.05)", border:"1px solid #253047", fontSize:12, color:"#94a3b8" }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background: status==="online"?"#00d4b4":status==="checking"?"#f59e0b":"#e53935" }} />
          {status==="online" ? "AI engine online" : status==="checking" ? "Connecting..." : "AI engine offline"}
        </div>
      </div>

      {status==="online" ? (
        <iframe src="http://localhost:8501" style={{ flex:1, border:"none", width:"100%", display:"block" }} title="ML Demo" />
      ) : status==="checking" ? (
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          <p style={{ color:"#64748b" }}>Connecting to ML engine...</p>
        </div>
      ) : (
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
          
          <h3 style={{ color:"#e2e8f0", margin:0 }}>ML engine not running</h3>
          <p style={{ color:"#64748b", fontSize:14 }}>Open a terminal and run:</p>
          <div style={{ background:"#131929", border:"1px solid #253047", borderRadius:8, padding:"12px 24px", fontFamily:"monospace", fontSize:14, color:"#00d4b4", lineHeight:1.8 }}>
            cd streamlit<br/>streamlit run app.py
          </div>
          <button onClick={()=>setStatus("checking")} style={{ padding:"10px 28px", background:"rgba(0,212,180,0.1)", color:"#00d4b4", border:"1px solid rgba(0,212,180,0.35)", borderRadius:8, fontSize:14, fontWeight:600, cursor:"pointer" }}>
            ↺ Retry
          </button>
        </div>
      )}
    </div>
  );
}
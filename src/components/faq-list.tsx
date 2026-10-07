"use client";
import { useState } from "react";
import { faqs } from "@/lib/content";
import { Icon } from "./icon";

export function FaqList({ full = false }: { full?: boolean }) {
  const [category, setCategory] = useState("All questions");
  const [search, setSearch] = useState("");
  const items = (full ? faqs : [faqs[0], faqs[2], faqs[3], faqs[5], faqs[8]]).filter(item => (category === "All questions" || category === item.category) && `${item.question} ${item.answer}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="faq-component">{full && <><label className="faq-search"><Icon name="message" size={20} /><span className="sr-only">Search frequently asked questions</span><input type="search" placeholder="What would you like to know?" value={search} onChange={e => setSearch(e.target.value)} /></label><div className="faq-filters" aria-label="Filter questions">{["All questions", "The basics", "Coverage & eligibility", "Getting a quote"].map(item => <button key={item} className={category === item ? "selected" : ""} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div></>}
    <div className="faq-list">{items.map(item => <details key={item.question}><summary>{item.question}<span><Icon name="plus" size={20} /></span></summary><div className="faq-answer"><p>{item.answer}</p></div></details>)}{items.length === 0 && <div className="no-results"><Icon name="message" size={32} /><h3>No matching questions yet.</h3><p>Try a different word, or contact us for a little guidance.</p><button className="text-link" onClick={() => { setSearch(""); setCategory("All questions"); }}>Clear search <Icon name="arrow" size={17} /></button></div>}</div>
  </div>;
}

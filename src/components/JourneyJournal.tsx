"use client";

import { memo, useState } from "react";
import { formatDuration, journalCsv, routes, type Journey } from "@/lib/drive";
import Icon from "./Icon";

type Props = { journeys: Journey[]; storageError: boolean; onDelete: (id: string) => void; onClear: () => void; onNote: (id: string, note: string) => void };

export default memo(function JourneyJournal({ journeys, storageError, onDelete, onClear, onNote }: Props) {
  const [showAll, setShowAll] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const today = new Date().toDateString();
  const todays = journeys.filter(j => new Date(j.startedAt).toDateString() === today);
  const totalDistance = journeys.reduce((n, j) => n + j.distance, 0);
  const exportCsv = () => {
    const url = URL.createObjectURL(new Blob([journalCsv(journeys)], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a"); a.href = url; a.download = "neural-drive-journeys.csv"; a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <section id="journey-journal" className="journey-journal" aria-labelledby="journal-title">
    <div className="journal-heading"><div><p className="eyebrow"><Icon name="journal" size={16} /> YOUR PERSONAL SPACE</p><h3 id="journal-title">Every journey is <em>yours.</em></h3><p>Small escapes, saved day by day.</p></div><span className="privacy-tag"><Icon name="lock" size={14} /> Saved on this device</span></div>
    <div className="journal-stats"><div><span>Today’s drives</span><strong>{todays.length.toString().padStart(2, "0")}</strong></div><div><span>Today’s active time</span><strong>{formatDuration(todays.reduce((n, j) => n + j.seconds, 0))}<small> min:sec</small></strong></div><div><span>Total explored</span><strong>{(totalDistance / 1000).toFixed(2)}<small> virtual km</small></strong></div></div>
    {storageError && <p className="storage-warning" role="alert">This browser cannot save your data. Keep this tab open and export your journeys before leaving.</p>}
    {journeys.length === 0 ? <div className="journal-empty"><span><Icon name="route" size={32} /></span><h4>Your first journey starts here.</h4><p>Choose a route above. When you end your drive, its time and virtual distance will appear here.</p></div> : <>
      <div className="journey-list">{(showAll ? journeys : journeys.slice(0, 4)).map(j => <article key={j.id} className="journey-entry"><span className={`route-token ${j.route}`}><Icon name={j.route === "city" ? "city" : j.route === "woodland" ? "tree" : "waves"} size={22} /></span><div className="journey-entry-main"><h4>{routes.find(r => r.id === j.route)!.name}</h4><p><time dateTime={j.startedAt}>{new Date(j.startedAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</time><span>{j.control === "switch" ? "Single-switch" : "Standard controls"}</span></p><details><summary>{j.note ? "Edit your reflection" : "Add a reflection"}</summary><label className="sr-only" htmlFor={`note-${j.id}`}>Reflection on {routes.find(r => r.id === j.route)!.name}</label><textarea id={`note-${j.id}`} value={j.note} onChange={e => onNote(j.id, e.target.value)} maxLength={280} rows={2} placeholder="How did that journey feel? (Optional)" /><small>{j.note.length}/280 · Saved on this device</small></details></div><div className="journey-numbers"><strong>{(j.distance / 1000).toFixed(2)} <small>km</small></strong><span>{formatDuration(j.seconds)} active</span></div><button className="icon-button" onClick={() => onDelete(j.id)} aria-label={`Delete ${routes.find(r => r.id === j.route)!.name} journey from ${new Date(j.startedAt).toLocaleString()}`}><Icon name="trash" size={16} /></button></article>)}</div>
      <div className="journal-actions">{journeys.length > 4 && <button className="quiet-button" onClick={() => setShowAll(v => !v)}>{showAll ? "Show recent" : `View all ${journeys.length} journeys`}</button>}<button className="quiet-button" onClick={exportCsv}><Icon name="download" size={15} /> Export journeys</button><button className="quiet-button danger-text" onClick={() => setConfirmClear(v => !v)}><Icon name="trash" size={15} /> Delete all</button></div>
      {confirmClear && <div className="delete-confirm" role="group" aria-label="Confirm deleting all journeys"><p>Delete all saved journeys and reflections from this browser?</p><button className="quiet-button danger-text" onClick={() => { onClear(); setConfirmClear(false); }}>Yes, delete journeys</button><button className="quiet-button" onClick={() => setConfirmClear(false)}>Keep journeys</button></div>}
    </>}
    <p className="journal-privacy"><Icon name="lock" size={13} /> Your journal stays in this browser, with up to 100 recent journeys. Anyone using this browser can see it. No GPS, health details, or brain activity is collected. Clearing browser data removes saved journeys.</p>
  </section>;
});

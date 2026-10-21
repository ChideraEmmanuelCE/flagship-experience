"use client";

import { memo } from "react";
import type { Preferences } from "@/lib/drive";
import Icon from "./Icon";

export default memo(function DriveSettings({ preferences: p, onChange }: { preferences: Preferences; onChange: (patch: Partial<Preferences>) => void }) {
  return <details className="drive-settings"><summary><Icon name="settings" size={18} /><span>Make yourself comfortable<small>Controls, pace, motion & contrast</small></span><Icon name="plus" size={18}/></summary>
    <div className="settings-grid">
      <label>Control style<select value={p.control} onChange={e => onChange({ control: e.target.value as Preferences["control"] })}><option value="standard">Buttons & keyboard</option><option value="switch">Single-switch scanning</option></select><small>Switch mode cycles through actions. Use one button, Enter, or Space to select.</small></label>
      <label>Driving pace<select value={p.pace} onChange={e => onChange({ pace: e.target.value as Preferences["pace"] })}><option value="gentle">Gentle · slower speeds</option><option value="normal">Regular · route speed</option></select><small>Acceleration and lane position are assisted in both modes.</small></label>
      <label>Scene motion<select value={p.motion} onChange={e => onChange({ motion: e.target.value as Preferences["motion"] })}><option value="system">Follow device preference</option><option value="reduced">Still scenery</option><option value="full">Moving road</option></select><small>Still scenery keeps the view steady while trip time and distance continue.</small></label>
      <label>Keyboard shortcuts<select value={p.shortcuts} onChange={e => onChange({ shortcuts: e.target.value as Preferences["shortcuts"] })}><option value="wasd">W / A / S / D</option><option value="arrows">Arrow keys</option><option value="off">Off</option></select><small>Focus the scene first. Space pauses; Escape pauses throughout the simulator.</small></label>
      <label>Switch scanning interval<select value={p.scanSeconds} onChange={e => onChange({ scanSeconds: Number(e.target.value) })}><option value={2}>2 seconds</option><option value={3}>3 seconds</option><option value={5}>5 seconds</option></select><small>Choose enough time to make a comfortable selection.</small></label>
      <label className="contrast-setting"><span>Clearer controls</span><span className="checkbox-row"><input type="checkbox" checked={p.contrast} onChange={e => onChange({ contrast: e.target.checked })}/> Increase interface contrast</span><small>Preferences are remembered in this browser. Choose what works for you; no diagnosis is needed.</small></label>
    </div>
  </details>;
});

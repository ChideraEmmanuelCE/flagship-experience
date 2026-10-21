import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceTelemetry, emptyTelemetry, emptyProfile, readProfile, finishJourney, journalCsv } from '../src/lib/drive.ts';
const journey = { id:'trip-1', startedAt:'2026-10-21T12:00:00Z', route:'coast', distance:1234, seconds:400, control:'standard', note:'' };

test('invalid or unsupported browser data recovers to safe defaults', () => {
  for (const raw of ['broken', 'null', '{"version":2}', '{"version":1,"journeys":[null,{}]}']) {
    const p=readProfile(raw); assert.equal(p.version,1); assert.equal(p.preferences.motion,'system'); assert.equal(p.journeys.length,0);
  }
});
test('profile validation preserves supported settings and rejects malformed trips', () => {
  const p=readProfile(JSON.stringify({version:1,preferences:{control:'switch', scanSeconds:5, route:'city', motion:'reduced', favorite:'city'},journeys:[journey,{...journey,id:'bad',distance:-1},{...journey,id:'bad2',seconds:'Infinity'},journey],draft:{...journey,note:'a'.repeat(500)}}));
  assert.equal(p.journeys.length,1); assert.equal(p.preferences.control,'switch'); assert.equal(p.preferences.motion,'reduced'); assert.equal(p.preferences.favorite,'city'); assert.equal(p.draft.note.length,280);
});
test('distance follows acceleration, braking settles at zero, and zero elapsed adds no time', () => {
  let t=emptyTelemetry(); for(let i=0;i<100;i++) t=advanceTelemetry(t,40,.1);
  assert.ok(t.speed>39 && t.speed<40); assert.ok(t.distance>90 && t.distance<115); assert.ok(Math.abs(t.seconds-10)<.001);
  const paused=advanceTelemetry(t,40,0); assert.equal(paused.distance,t.distance); assert.equal(paused.seconds,t.seconds);
  for(let i=0;i<100;i++) t=advanceTelemetry(t,0,.1); assert.equal(t.speed,0);
  const distance=t.distance; t=advanceTelemetry(t,0,.5); assert.equal(t.distance,distance);
});
test('finishing clears the draft, replaces duplicate IDs and caps retained journeys', () => {
  let p={...emptyProfile(),draft:journey}; p=finishJourney(p,journey); p=finishJourney(p,{...journey,distance:1500});
  assert.equal(p.draft,null); assert.equal(p.journeys.length,1); assert.equal(p.journeys[0].distance,1500);
  for(let i=0;i<110;i++) p=finishJourney(p,{...journey,id:`trip-${i}`}); assert.equal(p.journeys.length,100); assert.equal(p.journeys[0].id,'trip-109');
});
test('CSV keeps reflections quoted and neutralizes spreadsheet formulas', () => {
  const csv=journalCsv([{...journey,note:'=SUM(1,2) "note"'}]);
  assert.ok(csv.includes('"\'=SUM(1,2) ""note"""')); assert.ok(csv.includes('"1.234"')); assert.ok(csv.startsWith('Started,Route,'));
});

'use client';

import { Trash2 } from 'lucide-react';
import { useRef, useState, useTransition } from 'react';
import { saveQuestionSet } from '@/lib/questions/actions';
import { parseQuestionsJSON, IMPORT_EXAMPLE } from '@/lib/questions/parse';
import type { Section, Question, Choice } from '@/lib/types';

const CHOICES: Choice[] = ['A', 'B', 'C', 'D'];
const blankQ = (): Question => ({ text: '', options: { A: '', B: '', C: '', D: '' }, answer: 'A', timeLimit: 30 });

export function QuestionSetEditor({ setId, initialName, initialSections }: { setId: string; initialName: string; initialSections: Section[] }) {
  const [name, setName] = useState(initialName);
  const [sections, setSections] = useState<Section[]>(initialSections.length ? initialSections : [{ name: 'Section 1', questions: [] }]);
  const [active, setActive] = useState(0);
  const [draft, setDraft] = useState<Question>(blankQ());
  const [paste, setPaste] = useState('');
  const [flash, setFlash] = useState<{ msg: string; ok: boolean } | null>(null);
  const [saving, startSave] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const sec = sections[active];
  const qCount = sections.reduce((n, s) => n + s.questions.length, 0);
  const note = (msg: string, ok = true) => { setFlash({ msg, ok }); setTimeout(() => setFlash(null), 3000); };
  const patch = (fn: (draft: Section[]) => void) => setSections((prev) => { const next = structuredClone(prev); fn(next); return next; });

  function addSection() { patch((s) => s.push({ name: `Section ${s.length + 1}`, questions: [] })); setActive(sections.length); }
  function deleteSection(i: number) {
    if (sections.length === 1) return note('Keep at least one section.', false);
    if (!confirm('Delete this section and its questions?')) return;
    patch((s) => s.splice(i, 1)); setActive(0);
  }
  function addDraft() {
    if (!draft.text.trim() || CHOICES.some((c) => !draft.options[c].trim())) return note('Fill the question and all four options.', false);
    patch((s) => s[active].questions.push(structuredClone(draft)));
    setDraft(blankQ()); note('Question added.');
  }
  function deleteQ(qi: number) { patch((s) => s[active].questions.splice(qi, 1)); }
  function doImport(text: string) {
    const { questions, error } = parseQuestionsJSON(text);
    if (error || !questions) return note(error ?? 'Import failed.', false);
    patch((s) => s[active].questions.push(...questions));
    setPaste(''); note(`Imported ${questions.length} question${questions.length === 1 ? '' : 's'}.`);
  }
  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => doImport(String(r.result)); r.readAsText(f);
    e.target.value = '';
  }
  function exportJSON() {
    const blob = new Blob([JSON.stringify(sections, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `${name.replace(/\s+/g, '-').toLowerCase()}.json`; a.click(); URL.revokeObjectURL(a.href);
  }
  function save() { startSave(async () => { const r = await saveQuestionSet(setId, name, sections); note('error' in r ? r.error ?? 'Save failed' : 'Saved.', !('error' in r)); }); }

  const inp: React.CSSProperties = { padding: '9px 11px', borderRadius: 8, border: '1px solid #2a3244', background: '#0c1018', color: '#e8eef5', fontSize: 14, width: '100%' };
  const btn = (bg: string): React.CSSProperties => ({ padding: '9px 14px', borderRadius: 8, border: 'none', background: bg, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' });

  return (
    <div style={{ color: '#e8eef5' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 18, flexWrap: 'wrap' }}>
        <a href="/dashboard/questions" style={{ color: '#8a93a0', fontSize: 13, textDecoration: 'none' }}>← Sets</a>
        <input value={name} onChange={(e) => setName(e.target.value)} style={{ ...inp, width: 'auto', flex: 1, minWidth: 200, fontSize: 18, fontWeight: 800 }} />
        <span style={{ fontSize: 13, color: '#8a93a0' }}>{qCount} questions</span>
        <button style={btn('#334155')} onClick={exportJSON}>Export</button>
        <button style={btn('var(--primary,#cc0022)')} disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save'}</button>
      </div>

      {flash && <div style={{ marginBottom: 12, padding: '9px 13px', borderRadius: 8, fontSize: 13, background: flash.ok ? 'rgba(34,197,94,.12)' : 'rgba(239,68,68,.12)', color: flash.ok ? '#4ade80' : '#f87171', border: `1px solid ${flash.ok ? 'rgba(34,197,94,.35)' : 'rgba(239,68,68,.35)'}` }}>{flash.msg}</div>}

      {/* Section tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {sections.map((s, i) => (
          <button key={i} onClick={() => setActive(i)} style={{ ...btn(i === active ? 'rgba(37,99,235,.25)' : 'transparent'), border: '1px solid #2a3244', color: i === active ? '#93c5fd' : '#8a93a0' }}>
            {s.name} · {s.questions.length}
          </button>
        ))}
        <button onClick={addSection} style={{ ...btn('transparent'), border: '1px dashed #2a3244', color: '#8a93a0' }}>+ Section</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
        {/* Question list */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <input value={sec.name} onChange={(e) => patch((s) => { s[active].name = e.target.value; })} style={{ ...inp, width: 'auto', flex: 1, fontWeight: 700 }} />
            <button style={btn('rgba(239,68,68,.2)')} onClick={() => deleteSection(active)}>Delete section</button>
          </div>
          {sec.questions.length === 0 && <p style={{ color: '#8a93a0', fontSize: 14, padding: '20px 0' }}>No questions yet. Add one or import JSON →</p>}
          <div style={{ display: 'grid', gap: 8 }}>
            {sec.questions.map((q, qi) => (
              <div key={qi} style={{ border: '1px solid #1c2330', borderRadius: 10, padding: 12, background: '#0c1018' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                  <b style={{ fontSize: 14 }}>{qi + 1}. {q.text}</b>
                  <button onClick={() => deleteQ(qi)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 13 }}><Trash2 size={14} /></button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginTop: 8 }}>
                  {CHOICES.map((c) => (
                    <div key={c} style={{ fontSize: 12.5, padding: '4px 8px', borderRadius: 6, background: q.answer === c ? 'rgba(34,197,94,.14)' : '#12161f', color: q.answer === c ? '#4ade80' : '#b6bfca', border: `1px solid ${q.answer === c ? 'rgba(34,197,94,.4)' : '#1c2330'}` }}>
                      <b>{c}</b> {q.options[c]}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 6, fontFamily: 'ui-monospace' }}>{q.timeLimit}s</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: add + import */}
        <aside style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
          <div style={{ border: '1px solid #1c2330', borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 12, color: '#8a93a0', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Add a question</div>
            <div style={{ display: 'grid', gap: 6 }}>
              <textarea value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} placeholder="Question text…" style={{ ...inp, minHeight: 54, resize: 'vertical' }} />
              {CHOICES.map((c) => (
                <div key={c} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <button onClick={() => setDraft({ ...draft, answer: c })} title="Mark correct" style={{ width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 800, background: draft.answer === c ? '#22c55e' : '#1c2330', color: '#fff' }}>{c}</button>
                  <input value={draft.options[c]} onChange={(e) => setDraft({ ...draft, options: { ...draft.options, [c]: e.target.value } })} placeholder={`Option ${c}`} style={inp} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#8a93a0' }}>Time</span>
                <input type="number" value={draft.timeLimit} min={5} max={120} onChange={(e) => setDraft({ ...draft, timeLimit: Number(e.target.value) })} style={{ ...inp, width: 80 }} />
                <span style={{ fontSize: 12, color: '#8a93a0' }}>seconds · answer <b style={{ color: '#4ade80' }}>{draft.answer}</b></span>
              </div>
              <button style={btn('#2563eb')} onClick={addDraft}>+ Add to {sec.name}</button>
            </div>
          </div>

          <div style={{ border: '1px solid #1c2330', borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 12, color: '#8a93a0', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Import JSON</div>
            <button style={{ ...btn('transparent'), border: '1px solid #2563eb', color: '#93c5fd', width: '100%', marginBottom: 8 }} onClick={() => fileRef.current?.click()}>Choose file…</button>
            <input ref={fileRef} type="file" accept=".json" onChange={onFile} style={{ display: 'none' }} />
            <textarea value={paste} onChange={(e) => setPaste(e.target.value)} placeholder={IMPORT_EXAMPLE} style={{ ...inp, minHeight: 70, fontFamily: 'ui-monospace', fontSize: 11.5, resize: 'vertical' }} />
            <button style={{ ...btn('#2563eb'), width: '100%', marginTop: 8 }} onClick={() => doImport(paste)} disabled={!paste.trim()}>Import pasted JSON</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

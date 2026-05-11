'use client';

import { useState, useEffect } from 'react';
import { CollaboratorSchedule } from '@/types';
import api from '@/lib/api-client';

export function CollaboratorScheduleEditor({
  collaboratorId,
}: {
  collaboratorId: string;
}) {
  const [schedule, setSchedule] = useState<CollaboratorSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get(`/api/collaborators/${collaboratorId}/schedule`)
      .then(({ data }) => setSchedule(data))
      .catch(() => setMessage('Erro ao carregar agenda.'))
      .finally(() => setLoading(false));
  }, [collaboratorId]);

  const updateDay = (dayIndex: number, field: keyof CollaboratorSchedule, value: unknown) => {
    setSchedule((prev) =>
      prev.map((d) => (d.day_of_week === dayIndex ? { ...d, [field]: value } : d))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const payload = schedule.map((d) => ({
        day_of_week: d.day_of_week,
        is_working: d.is_working,
        work_start: d.work_start,
        work_end: d.work_end,
        lunch_start: d.lunch_start || null,
        lunch_end: d.lunch_end || null,
      }));
      const { data } = await api.put(`/api/collaborators/${collaboratorId}/schedule`, { schedules: payload });
      setSchedule(data);
      setMessage('Agenda salva!');
      setTimeout(() => setMessage(''), 2000);
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Erro ao salvar agenda.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="w-5 h-5 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600/70">Agenda Semanal</span>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] text-white text-xs font-semibold hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Salvar Agenda'}
        </button>
      </div>

      {schedule.map((day) => (
        <div
          key={day.day_of_week}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 border transition-all ${
            day.is_working
              ? 'bg-white/80 border-white/50'
              : 'bg-gray-50 border-gray-200 opacity-60'
          }`}
        >
          <label className="flex items-center gap-1.5 w-20 shrink-0 cursor-pointer">
            <input
              type="checkbox"
              checked={day.is_working}
              onChange={(e) => updateDay(day.day_of_week, 'is_working', e.target.checked)}
              className="w-3.5 h-3.5 rounded accent-amber-500"
            />
            <span className="text-xs font-medium text-[var(--color-text-primary)]">{day.day_name}</span>
          </label>

          {day.is_working && (
            <>
              <input
                type="time"
                value={day.work_start}
                onChange={(e) => updateDay(day.day_of_week, 'work_start', e.target.value)}
                className="w-[72px] px-1.5 py-1 rounded border border-amber-200 bg-white text-xs text-center focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-[var(--color-text-muted)]">ate</span>
              <input
                type="time"
                value={day.work_end}
                onChange={(e) => updateDay(day.day_of_week, 'work_end', e.target.value)}
                className="w-[72px] px-1.5 py-1 rounded border border-amber-200 bg-white text-xs text-center focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-[var(--color-text-muted)] ml-1">Almoco:</span>
              <input
                type="time"
                value={day.lunch_start || ''}
                onChange={(e) => updateDay(day.day_of_week, 'lunch_start', e.target.value || null)}
                className="w-[72px] px-1.5 py-1 rounded border border-gray-200 bg-white text-xs text-center focus:outline-none focus:border-amber-400"
                placeholder="--:--"
              />
              <span className="text-[10px] text-[var(--color-text-muted)]">-</span>
              <input
                type="time"
                value={day.lunch_end || ''}
                onChange={(e) => updateDay(day.day_of_week, 'lunch_end', e.target.value || null)}
                className="w-[72px] px-1.5 py-1 rounded border border-gray-200 bg-white text-xs text-center focus:outline-none focus:border-amber-400"
                placeholder="--:--"
              />
            </>
          )}
        </div>
      ))}

      {message && (
        <p className={`text-xs font-medium ${message.includes('Erro') ? 'text-[var(--color-rose)]' : 'text-[var(--color-green)]'}`}>
          {message}
        </p>
      )}
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

interface ReflectionEntry {
  id: number;
  date: string;
  focus: string;
  reflection: string;
  impact: number;
}

const SAMPLE_ENTRIES: ReflectionEntry[] = [
  {
    id: 1,
    date: '2024-08-15',
    focus: 'Classroom Management',
    reflection: 'Implemented a new seating arrangement that reduced distractions.',
    impact: 4
  },
  {
    id: 2,
    date: '2024-09-02',
    focus: 'Assessment Strategies',
    reflection: 'Piloted formative quizzes using exit tickets for immediate feedback.',
    impact: 5
  },
  {
    id: 3,
    date: '2024-09-20',
    focus: 'Student Engagement',
    reflection: 'Introduced collaborative note-taking to boost participation.',
    impact: 3
  }
];

export default function App() {
  const [entries] = useState<ReflectionEntry[]>(SAMPLE_ENTRIES);
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  const impactSummary = useMemo(() => {
    const totals = new Map<string, number>();
    entries.forEach((entry) => {
      totals.set(entry.focus, (totals.get(entry.focus) ?? 0) + entry.impact);
    });
    return Array.from(totals.entries());
  }, [entries]);

  useEffect(() => {
    if (!chartRef.current) {
      return;
    }

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: impactSummary.map(([focus]) => focus),
        datasets: [
          {
            label: 'Impact score',
            data: impactSummary.map(([, value]) => value),
            backgroundColor: '#3b82f6'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 10,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });

    return () => {
      chartInstance.current?.destroy();
    };
  }, [impactSummary]);

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <header className="sticky top-0 z-10 border-b border-base-300 bg-base-100/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-semibold text-primary">Teacher Self-Development Log</h1>
            <p className="text-sm opacity-70">
              Track classroom experiments, reflections, and growth goals in one place.
            </p>
          </div>
          <button className="btn btn-primary btn-sm">New Reflection</button>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 md:grid-cols-[2fr,1fr]">
        <section className="space-y-4">
          <div className="rounded-box bg-base-100 shadow">
            <div className="border-b border-base-200 px-6 py-4">
              <h2 className="text-lg font-medium">Recent Reflections</h2>
            </div>
            <ul className="divide-y divide-base-200">
              {entries.map((entry) => (
                <li key={entry.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="badge badge-primary badge-outline mb-2">{entry.focus}</span>
                      <h3 className="text-base font-semibold">{entry.date}</h3>
                      <p className="mt-2 text-sm leading-relaxed opacity-90">{entry.reflection}</p>
                    </div>
                    <div className="flex flex-col items-center justify-center rounded-box bg-primary/10 px-3 py-2 text-sm">
                      <span className="font-semibold text-primary">Impact</span>
                      <span className="text-xl font-bold text-primary">{entry.impact}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-box bg-base-100 p-6 shadow">
            <h2 className="text-lg font-medium">Impact Overview</h2>
            <p className="mt-1 text-sm opacity-70">
              Visualize where your experiments are paying off the most.
            </p>
            <div className="mt-4 h-64">
              <canvas ref={chartRef} aria-label="Impact chart" role="img" />
            </div>
          </div>

          <div className="rounded-box bg-base-100 p-6 shadow">
            <h2 className="text-lg font-medium">Upcoming Focus</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="badge badge-secondary badge-sm" />
                Observe student collaboration patterns next week.
              </li>
              <li className="flex items-center gap-2">
                <span className="badge badge-secondary badge-sm" />
                Prototype reflective prompts for advisory sessions.
              </li>
              <li className="flex items-center gap-2">
                <span className="badge badge-secondary badge-sm" />
                Plan peer observation with the science department.
              </li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}

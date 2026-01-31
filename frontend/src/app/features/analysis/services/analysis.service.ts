import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import type { Analysis, CreateAnalysisRequest } from '../../../models/analysis.model';

const BASE = '/api/v1';

/** Dummy completed analysis shown when API fails — so analysis detail UI is visible. */
const DUMMY_ANALYSIS: Analysis = {
  id: 'demo-analysis-1',
  conversation_id: 'demo-conv-1',
  status: 'completed',
  created_at: new Date().toISOString(),
  completed_at: new Date().toISOString(),
  results: {
    sentiment: {
      scores: [
        { message_index: 0, label: 'positive', score: 0.8 },
        { message_index: 1, label: 'positive', score: 0.9 },
        { message_index: 2, label: 'neutral', score: 0.1 },
        { message_index: 3, label: 'positive', score: 0.7 },
      ],
      aggregate: 'Overall positive tone with gratitude and cooperation.',
      emotional_labels: ['grateful', 'friendly', 'cooperative'],
    },
    clarity: { readability: 8.2, flags: ['Clear sentence structure', 'Appropriate length'] },
    behavioral: { message_length_avg: 42 },
  },
};

const DUMMY_ANALYSIS_IDS = new Set(['demo-analysis-1', 'demo-analysis-2', 'demo-analysis-3']);

@Injectable({ providedIn: 'root' })
export class AnalysisService {
  private readonly http = inject(HttpClient);

  /** Create analysis job for a conversation. When API fails, returns dummy analysis so user can still view results. */
  create(request: CreateAnalysisRequest): Observable<Analysis | null> {
    return this.http.post<Analysis>(`${BASE}/analyses`, request).pipe(
      catchError(() =>
        of({
          ...DUMMY_ANALYSIS,
          id: 'demo-analysis-1',
          conversation_id: request.conversation_id,
        })
      )
    );
  }

  /** Get analysis by id. Returns dummy completed analysis for demo ids when API fails. */
  getById(id: string): Observable<Analysis | null> {
    return this.http.get<Analysis>(`${BASE}/analyses/${id}`).pipe(
      catchError(() => {
        if (DUMMY_ANALYSIS_IDS.has(id)) {
          return of({ ...DUMMY_ANALYSIS, id, conversation_id: id.replace('analysis', 'conv') });
        }
        return of(null);
      })
    );
  }
}

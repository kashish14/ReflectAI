import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import type { Conversation } from '../../../models/conversation.model';
import type { PaginatedResponse } from '../../../models/api-response.model';

const BASE = '/api/v1';

/** Dummy conversations shown when API fails — so conversations list UI is visible. */
const DUMMY_CONVERSATIONS: (Conversation & { tenant_id?: string })[] = [
  { id: 'demo-conv-1', user_id: 'demo-user', source: 'manual', created_at: new Date().toISOString() },
  { id: 'demo-conv-2', user_id: 'demo-user', source: 'manual', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'demo-conv-3', user_id: 'demo-user', source: 'manual', created_at: new Date(Date.now() - 172800000).toISOString() },
];

const DUMMY_LIST_RESPONSE: PaginatedResponse<Conversation & { tenant_id?: string }> = {
  data: DUMMY_CONVERSATIONS,
  next_cursor: undefined,
};

@Injectable({ providedIn: 'root' })
export class ConversationService {
  private readonly http = inject(HttpClient);

  /** Create conversation (upload content). Returns created conversation. */
  create(content: string): Observable<Conversation & { tenant_id?: string }> {
    return this.http
      .post<Conversation & { tenant_id?: string }>(`${BASE}/conversations`, { content })
      .pipe(catchError(() => of(null as unknown as Conversation & { tenant_id?: string })));
  }

  /** List conversations with optional cursor and limit. Uses dummy data when API fails. */
  list(options?: { cursor?: string; limit?: number }): Observable<PaginatedResponse<Conversation & { tenant_id?: string }>> {
    const params: Record<string, string> = {};
    if (options?.cursor) params['cursor'] = options.cursor;
    if (options?.limit != null) params['limit'] = String(options.limit);
    return this.http
      .get<PaginatedResponse<Conversation & { tenant_id?: string }>>(`${BASE}/conversations`, { params })
      .pipe(catchError(() => of(DUMMY_LIST_RESPONSE)));
  }

  /** Get conversation by id. Returns dummy conversation for demo ids when API fails. */
  getById(id: string): Observable<(Conversation & { tenant_id?: string }) | null> {
    return this.http.get<Conversation & { tenant_id?: string }>(`${BASE}/conversations/${id}`).pipe(
      catchError(() => {
        const dummy = DUMMY_CONVERSATIONS.find((c) => c.id === id);
        return of(dummy ?? null);
      })
    );
  }
}

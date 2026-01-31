import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { DashboardComponent } from './features/dashboard/components/dashboard/dashboard.component';
import { ConversationListComponent } from './features/conversations/components/conversation-list/conversation-list.component';
import { ConversationUploadPageComponent } from './features/conversations/components/conversation-upload-page/conversation-upload-page.component';
import { ConversationDetailPageComponent } from './features/conversations/components/conversation-detail-page/conversation-detail-page.component';
import { AnalysisDetailPageComponent } from './features/analysis/components/analysis-detail-page/analysis-detail-page.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'conversations', component: ConversationListComponent },
      { path: 'conversations/upload', component: ConversationUploadPageComponent },
      { path: 'conversations/:id', component: ConversationDetailPageComponent },
      { path: 'analysis/:id', component: AnalysisDetailPageComponent },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];

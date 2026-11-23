import { TestBed } from '@angular/core/testing';
import { SentimentTrendVisualizationComponent } from './sentiment-trend-visualization.component';

describe('SentimentTrendVisualizationComponent', () => {
  it('renders one bar per data point with proportional segments', () => {
    const fixture = TestBed.createComponent(SentimentTrendVisualizationComponent);
    fixture.componentRef.setInput('data', [
      { label: 'Mon', positive: 3, neutral: 1, negative: 0 },
      { label: 'Tue', positive: 0, neutral: 0, negative: 0 },
    ]);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('.sentiment-trend__bar').length).toBe(2);
    const positive = el.querySelector<HTMLElement>('.sentiment-trend__segment--positive')!;
    expect(positive.style.height).toBe('75%');
  });

  it('treats an empty point as zero height instead of dividing by zero', () => {
    const fixture = TestBed.createComponent(SentimentTrendVisualizationComponent);
    const point = { label: 'Sat', positive: 0, neutral: 0, negative: 0 };
    expect(fixture.componentInstance.positiveRatio(point)).toBe(0);
  });
});

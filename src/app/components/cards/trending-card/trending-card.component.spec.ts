import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrendingCardComponent } from './trending-card.component';

describe('TrendingCardComponent', () => {
  let component: TrendingCardComponent;
  let fixture: ComponentFixture<TrendingCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TrendingCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrendingCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

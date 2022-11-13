import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmStatCardComponent } from './sm-stat-card.component';

describe('SmStatCardComponent', () => {
  let component: SmStatCardComponent;
  let fixture: ComponentFixture<SmStatCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmStatCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmStatCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

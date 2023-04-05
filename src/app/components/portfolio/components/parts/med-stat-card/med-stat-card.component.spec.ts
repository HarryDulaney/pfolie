import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedStatCardComponent } from './med-stat-card.component';

describe('MedStatCardComponent', () => {
  let component: MedStatCardComponent;
  let fixture: ComponentFixture<MedStatCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [MedStatCardComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MedStatCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

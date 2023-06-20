import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoldingViewComponent } from './holding-view.component';

describe('HoldingViewComponent', () => {
  let component: HoldingViewComponent;
  let fixture: ComponentFixture<HoldingViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HoldingViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HoldingViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

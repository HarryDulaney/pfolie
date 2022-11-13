import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileCheckComponent } from './mobile-check.component';

describe('MobileCheckComponent', () => {
  let component: MobileCheckComponent;
  let fixture: ComponentFixture<MobileCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MobileCheckComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

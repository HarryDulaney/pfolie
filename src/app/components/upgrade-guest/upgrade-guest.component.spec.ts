import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpgradeGuestComponent } from './upgrade-guest.component';

describe('UpgradeGuestComponent', () => {
  let component: UpgradeGuestComponent;
  let fixture: ComponentFixture<UpgradeGuestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ UpgradeGuestComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpgradeGuestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

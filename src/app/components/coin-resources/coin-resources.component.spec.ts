import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoinResourcesComponent } from './coin-resources.component';

describe('CoinResourcesComponent', () => {
  let component: CoinResourcesComponent;
  let fixture: ComponentFixture<CoinResourcesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CoinResourcesComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoinResourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

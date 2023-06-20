import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioTableExpandComponent } from './portfolio-table-expand.component';

describe('PortfolioTableExpandComponent', () => {
  let component: PortfolioTableExpandComponent;
  let fixture: ComponentFixture<PortfolioTableExpandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [PortfolioTableExpandComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioTableExpandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

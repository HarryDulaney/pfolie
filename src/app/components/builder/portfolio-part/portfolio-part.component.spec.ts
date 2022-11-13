import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioPartComponent } from './portfolio-part.component';

describe('PortfolioPartComponent', () => {
  let component: PortfolioPartComponent;
  let fixture: ComponentFixture<PortfolioPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PortfolioPartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

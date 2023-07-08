import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionWorkspaceComponent } from './transaction-workspace.component';

describe('TransactionWorkspaceComponent', () => {
  let component: TransactionWorkspaceComponent;
  let fixture: ComponentFixture<TransactionWorkspaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TransactionWorkspaceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionWorkspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

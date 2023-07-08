import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditableCardComponent } from './editable-card.component';

describe('WatchListCardComponent', () => {
  let component: EditableCardComponent;
  let fixture: ComponentFixture<EditableCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ EditableCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditableCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

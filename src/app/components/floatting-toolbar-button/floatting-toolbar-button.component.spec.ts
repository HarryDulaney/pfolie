import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloattingToolbarButtonComponent } from './floatting-toolbar-button.component';

describe('FloattingToolbarButtonComponent', () => {
  let component: FloattingToolbarButtonComponent;
  let fixture: ComponentFixture<FloattingToolbarButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [FloattingToolbarButtonComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FloattingToolbarButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

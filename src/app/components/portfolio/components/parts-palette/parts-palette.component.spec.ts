import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartsPaletteComponent } from './parts-palette.component';

describe('PartsPaletteComponent', () => {
  let component: PartsPaletteComponent;
  let fixture: ComponentFixture<PartsPaletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [PartsPaletteComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PartsPaletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

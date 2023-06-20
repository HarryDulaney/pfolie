import { Component } from '@angular/core';
import { ComponentService } from '../../services/component.service';
@Component({
    selector: 'app-parts-palette',
    templateUrl: './parts-palette.component.html',
    styleUrls: ['./parts-palette.component.scss'],
    standalone: true
})
export class PartsPaletteComponent {


  constructor(private componenetService: ComponentService) {
  }



}

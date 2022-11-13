import { Component, ComponentRef, Directive, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { ComponentService } from '../../services/component.service';
import { MedStatCardComponent } from '../parts/med-stat-card/med-stat-card.component';
import { SmStatCardComponent } from '../parts/sm-stat-card/sm-stat-card.component';
import { PartHostDirective } from './part-host.directive';
@Component({
  selector: 'app-parts-palette',
  templateUrl: './parts-palette.component.html',
  styleUrls: ['./parts-palette.component.scss']
})
export class PartsPaletteComponent {


  constructor(private componenetService: ComponentService) {
  }



}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chip, ChipModule } from 'primeng/chip';

@Component({
  selector: 'app-news-category',
  standalone: true,
  imports: [CommonModule, ChipModule],
  templateUrl: './news-category.component.html',
  styleUrls: ['./news-category.component.scss']
})
export class NewsCategoryComponent {
  @Input() activeCategory: string;
  @Input() category: string;
  @Output() selected: EventEmitter<string> = new EventEmitter<string>();


  select(chip: Chip) {
    this.selected.emit(this.category);
  }

}

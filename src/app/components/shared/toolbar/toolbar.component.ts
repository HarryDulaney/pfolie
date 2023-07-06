import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MenuItem, SharedModule } from 'primeng/api';
import { Inplace, InplaceModule } from 'primeng/inplace';
import { Menubar, MenubarModule } from 'primeng/menubar';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CommonModule, NgIf } from '@angular/common';
import { TooltipOptions } from 'primeng/tooltip';
import { ToolbarService } from './toolbar.service';


@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  standalone: true,
  providers: [ToolbarService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MenubarModule, SharedModule, InplaceModule, NgIf, ButtonModule, FormsModule, InputTextModule, ReactiveFormsModule]
})
export class ToolbarComponent implements OnDestroy, OnInit, AfterViewInit {
  @Input('styleClass') styleClass: string;
  @Input('tooltipOptions') tooltipOptions: TooltipOptions;
  @Input('isMain') isMain: boolean;
  @Input('label') label = 'loading...';

  @Output('onRename') onRename = new EventEmitter<string>();

  @ViewChild('menuBar') menuBar: Menubar;
  @ViewChild('nameEditor') nameEditor: Inplace;


  showCancelRename: boolean;
  menuItems: MenuItem[];
  editFormGroup: UntypedFormGroup = new UntypedFormGroup({});
  nameControl: UntypedFormControl = new UntypedFormControl('');
  editedLabel = '';
  destroySubject$ = new Subject();

  detectChanges() {
    this.cd.markForCheck();
  }

  constructor(
    private toolbarService: ToolbarService,
    private cd: ChangeDetectorRef
  ) {
    this.toolbarService.openToolbar();
  }

  ngOnInit(): void {
    this.toolbarService.menuSource$
      .pipe(takeUntil(this.destroySubject$))
      .subscribe({
        next: (menuItems) => {
          this.menuItems = menuItems;
          this.cd.markForCheck();
        }
      });

    this.toolbarService.eventSource$
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (ev) => {
          this.handleOutsideClick(ev.event);
        }
      );
  }

  ngAfterViewInit(): void {
    this.nameControl.setValue(this.label);
  }

  ngOnDestroy(): void {
    this.destroySubject$.next(true);
    this.destroySubject$.complete();
  }

  onEdit(event: any) {
    this.nameControl.setValue(this.label);
    this.editFormGroup = new UntypedFormGroup({
      name: this.nameControl
    });

    this.editFormGroup.valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe({
        next: (val) => {
          this.nameInputChanged(val.name);
          this.cd.markForCheck();
        }
      });

    this.nameEditor.activate();
  }

  close() {
    this.toolbarService.hideToolbar();
  }

  open() {
    this.toolbarService.openToolbar();
  }

  handleOutsideClick(event: any) {
    if (event.type === 'click' && this.menuBar.el.nativeElement.contains(event.target)) {
      if (this.nameEditor.active) {
        this.handleCancelRename();
      }
    }
  }


  /* ------------------------------------ Rename ------------------------------------- */
  handleRename() {
    if (this.label &&
      this.label.trim() !== '' &&
      this.label !== this.editedLabel) {
      this.onRename.emit(this.editedLabel);
    } else {
      this.nameEditor.deactivate();
    }
    this.showCancelRename = false;

  }

  nameInputChanged(value: any) {
    if (value && value !== this.label || value === '') {
      this.editedLabel = value;
      this.showCancelRename = true;
    } else {
      this.editedLabel = '';
      this.showCancelRename = false;
    }
  }


  handleCancelRename() {
    this.nameEditor.deactivate();
    this.editedLabel = '';
    this.showCancelRename = false;
    this.cd.markForCheck();
  }

  get service(): ToolbarService {
    return this.toolbarService;
  }

}
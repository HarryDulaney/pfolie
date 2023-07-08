import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild, inject } from '@angular/core';
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
import { ToastService } from 'src/app/services/toast.service';


@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  standalone: true,
  providers: [ToolbarService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MenubarModule, SharedModule, InplaceModule, NgIf, ButtonModule, FormsModule, InputTextModule, ReactiveFormsModule]
})
export class ToolbarComponent implements OnDestroy, OnInit, AfterViewInit, OnChanges {
  @Input('styleClass') styleClass: string;
  @Input('tooltipOptions') tooltipOptions: TooltipOptions;
  @Input('mainLabelToolTip') mainLabelToolTip: string;
  @Input('isMain') isMain: boolean;
  @Input('label') label = 'loading...';

  @Output('onRename') onRename = new EventEmitter<string>();

  @ViewChild('menuBar') menuBar: Menubar;
  @ViewChild('nameEditor') nameEditor: Inplace;

  toast: ToastService = inject(ToastService);
  private toolbarService: ToolbarService = inject(ToolbarService);
  private cd: ChangeDetectorRef = inject(ChangeDetectorRef);

  showCancelRename: boolean;
  menuItems: MenuItem[];
  editFormGroup: UntypedFormGroup = new UntypedFormGroup({});
  nameControl: UntypedFormControl = new UntypedFormControl('');
  destroySubject$ = new Subject();

  detectChanges() {
    this.cd.markForCheck();
  }

  constructor(
  ) {
    this.toolbarService.openToolbar();
  }

  ngOnChanges(changes: any): void {
    if (changes.label) {
      this.nameControl.setValue(this.label);
      this.cd.markForCheck();
    }
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

  }

  ngAfterViewInit(): void {
    this.nameControl.setValue(this.label);
  }

  ngOnDestroy(): void {
    this.destroySubject$.next(true);
    this.destroySubject$.complete();
  }

  onEdit(event: any) {
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

  /* ------------------------------------ Rename ------------------------------------- */

  /**
   * Handle validating the name input and emitting the rename event
   */
  handleRename() {
    if (this.nameEditor.active) {
      const editedName = this.editFormGroup.controls['name'].value;
      if (!editedName || editedName.trim() === '') {
        this.handleCancelRename();
        this.toast.showErrorToast('No input provided for rename, please enter a valid name before submit');
      } else if (!this.isChanged(editedName)) {
        this.handleCancelRename();
        this.toast.showInfoToast('Name value unchanged, no save required...');
      } else if (!this.isValidName(editedName)) {
        this.handleCancelRename();
        this.toast.showErrorToast('Invalid rename, the name must be less than 30 characters.');
      } else {
        this.onRename.emit(editedName);
      }

      this.showCancelRename = false;

    }
  }

  isValidName(name: string) {
    return name.length <= 30;
  }

  isChanged(name: string) {
    return name !== this.label;
  }

  nameInputChanged(value: any) {
    if (value && value !== this.label || value === '') {
      this.showCancelRename = true;
    } else {
      this.showCancelRename = false;
    }
  }


  handleCancelRename() {
    this.nameControl.patchValue(this.label);
    this.nameEditor.deactivate();
    this.showCancelRename = false;
    this.cd.markForCheck();
  }

  get service(): ToolbarService {
    return this.toolbarService;
  }

}
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MenuItem, SharedModule } from 'primeng/api';
import { ToolbarEvent } from 'src/app/models/events';
import { PortfolioService } from '../../services/portfolio.service';
import * as Const from '../../constants';
import { Inplace, InplaceModule } from 'primeng/inplace';
import { Menubar, MenubarModule } from 'primeng/menubar';
import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { NgIf } from '@angular/common';
import { ScreenService } from 'src/app/services/screen.service';
import { Portfolio, WatchList } from 'src/app/models/portfolio';
import { Watch } from 'typescript';
import { WatchListService } from 'src/app/services/watchlist.service';
import { TooltipOptions } from 'primeng/tooltip';


@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  standalone: true,
  imports: [MenubarModule, SharedModule, InplaceModule, NgIf, ButtonModule, FormsModule, InputTextModule]
})
export class ToolbarComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input('nameKey') nameKey: string;
  @Input('service') service: PortfolioService | WatchListService;
  @Input('navExpandProvider') navExpandProvider: Observable<boolean>;
  @Input('dataSource') dataSource$: Observable<Portfolio | WatchList>;
  @Input() screenSize: string;
  @Input('menuItems') menuItems: MenuItem[];

  @ViewChild('menuBar') menuBar: Menubar;
  @ViewChild('nameEditor') nameEditor: Inplace;


  showCancelRename: boolean;
  isNavExpanded: boolean;
  isMobile: boolean = false;
  isMain = false;

  styleClass: string;

  open: boolean = true;
  toolbarLabel: string;
  private currentData;
  fileMenuItems: MenuItem;
  actionItems: MenuItem;
  destroySubject$ = new Subject();

  tooltipOptions: TooltipOptions;

  detectChanges() {
    this.cd.detectChanges();
  }

  constructor(
    private screenService: ScreenService,
    private cd: ChangeDetectorRef) {
    this.tooltipOptions = screenService.tooltipOptions;
  }

  ngOnInit(): void {
    this.styleClass = this.getToolbarStyleClass();
    this.screenService.resizeSource$
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (size) => {
          this.styleClass = this.getToolbarStyleClass();
          this.cd.detectChanges();
        }
      );

    this.screenService.screenSource$
      .pipe(takeUntil(this.destroySubject$)).subscribe(
        (size) => {
          if (size === Const.CONSTANT.SCREEN_SIZE.XS) {
            this.isMobile = true;
          }
        });

    this.dataSource$
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (data) => {
          if (!data) {
            this.currentData = null;
            this.toolbarLabel = 'loading...';
            this.cd.detectChanges();
          } else {
            this.currentData = Object.assign({}, data);
            this.toolbarLabel = this.currentData[this.nameKey]; 
            this.isMain = this.currentData.isMain;
            this.cd.detectChanges();

          }
        }
      );

    this.navExpandProvider
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (expanded) => {
          this.isNavExpanded = expanded;
          this.styleClass = this.getToolbarStyleClass();
          this.cd.detectChanges();
        });
  }


  ngAfterViewInit(): void {
    this.service.eventSource$
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        (ev) => {
          if (ev.event.type === 'click' && ev.event.target.id !== this.menuBar.el.nativeElement.id) {
            if (this.nameEditor.active) {
              this.handleCancelRename();
            }
          }
        }
      );
  }


  ngOnDestroy(): void {
    this.destroySubject$.next(true);
    this.destroySubject$.complete();
  }


  getToolbarStyleClass(): string {
    if (this.screenSize === Const.CONSTANT.SCREEN_SIZE.S) {
      return 'toolbar-wrapper-mobile';
    } else if (this.isNavExpanded) {
      return 'toolbar-wrapper-nav-expanded';
    } else {
      return 'toolbar-wrapper-nav-contracted';
    }
  }


  close() {
    this.service.hideToolbar();
  }

  expand() {
    this.service.openToolbar();

  }


  /* ------------------------------------ Rename ------------------------------------- */
  handleRename() {
    if (this.toolbarLabel && this.toolbarLabel.trim() !== '' &&
      this.currentData[this.nameKey] !== this.toolbarLabel) {
      this.rename();
    } else {
      this.nameEditor.deactivate();
    }
    this.showCancelRename = false;

  }

  rename() {
    this.service.rename(this.toolbarLabel).then(
      () => {
        this.nameEditor.deactivate();

      }
    )
  }

  nameChanged(event) {
    if (event && event !== this.currentData[this.nameKey] || event === '') {
      this.showCancelRename = true;

    } else {
      this.showCancelRename = false;
    }

  }

  handleCancelRename() {
    this.nameEditor.deactivate();
    this.toolbarLabel = this.currentData[this.nameKey];
    this.showCancelRename = false;
  }

}

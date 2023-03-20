import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ToolbarEvent } from 'src/app/models/events';
import { PortfolioService } from '../../services/portfolio.service';
import * as Const from '../../../../constants';
import { Inplace } from 'primeng/inplace';
import { Menubar } from 'primeng/menubar';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('menuBar') menuBar: Menubar;
  @ViewChild('portfolioNameEditor') portfolioNameEditor: Inplace;
  @Input() isNavExpanded: boolean;
  @Input() screenSize: string;


  private toolbarEvent: EventEmitter<ToolbarEvent> = new EventEmitter();
  $toolbarSource = this.toolbarEvent.asObservable();
  showCancelRename: boolean;

  emitEvent(event: ToolbarEvent) {
    this.toolbarEvent.emit(event);
  }

  dynamicStyle: any = {};

  open: boolean = true;
  items: MenuItem[] | MenuItem;
  emptyItems: MenuItem[] = [];

  portfolioName: string;
  private currentPortfolio;

  portfolioItems: MenuItem;
  preferencesItems: MenuItem;
  testItems: MenuItem;
  destroySubject$ = new Subject();


  constructor(
    private portfolioService: PortfolioService  ) { }

  ngOnDestroy(): void {
    this.destroySubject$.next(true);
    this.destroySubject$.complete();
  }


  ngAfterViewInit(): void {
    this.portfolioService.eventSource$.pipe(takeUntil(this.destroySubject$)).subscribe(
      (ev) => {
        if (ev.event.type === 'click' && ev.event.target.id !== this.menuBar.el.nativeElement.id) {
          if (this.portfolioNameEditor.active) {
            this.handleCancelRename();
          }
        }
      }
    );

  }

  ngOnInit(): void {
    this.portfolioService.portfolio$.pipe(takeUntil(this.destroySubject$)).subscribe(
      (portfolio) => {
        if (!portfolio) {
          this.currentPortfolio = null;
          this.portfolioName = 'loading...';
        } else {
          this.currentPortfolio = Object.assign({}, portfolio);
          this.portfolioName = this.currentPortfolio.portfolioName;
          this.setMenuItems();

        }
      }
    );

    this.portfolioService.showToolbar.pipe(takeUntil(this.destroySubject$)
    ).subscribe((open) => {
      this.open = open;
    });

  }

  setMenuItems() {
    this.portfolioItems = {
      label: 'Portfolio',
      icon: 'pi pi-chart-pie',
      items: [
        {
          label: 'Add New Asset',
          icon: 'pi pi-dollar',
          command: (event) => {
          }
        }]
    }

    /*  this.testItems = {
        label: 'Test Componenets',
        icon: 'fa fa-beard',
        items: [
          {
            label: 'Small',
            command: (event) => {
              this.emitEvent({ event: event } as ToolbarEvent);
            }
          },
          {
            label: 'Medium',
            command: (event) => {
              this.emitEvent({ event: event } as ToolbarEvent);
            }
          },
          {
            label: 'Chart',
            command: (event) => {
              this.emitEvent({ event: event } as ToolbarEvent);
            }
          }
        ] */
    // }

    this.preferencesItems = {
      label: 'Preferences',
      icon: 'pi pi-cog',
      /*  items: [
          {
            label: 'Currency',
            icon: 'fa fa-currency',
            items: [{
              icon: 'fa fa-dollar',
              label: Const.TOOLBAR.CURRENCY.usd,
              disabled: this.preferences.view['currency'] === 'usd',
              command: (event) => {
                this.emitEvent({ event: event } as ToolbarEvent);
              }
            }],
          },
          {
            label: 'Palette',
            icon: 'fa fa-palette',
            items: [{
              label: Const.TOOLBAR.SIDEBAR_RIGHT,
              disabled: this.preferences.view['sidebarLocation'] === 'right',
              command: (event) => {
                this.emitEvent({ event: event } as ToolbarEvent);
              }
            },
             {
              label: Const.TOOLBAR.SIDEBAR_BOTTOM,
              disabled: this.preferences.view['sidebarLocation'] === 'bottom',
              command: (event) => {
                this.emitEvent({ event: event } as ToolbarEvent);
              }
            } ],
          }] */
    }
    let addComponentItem: MenuItem = {
      label: Const.TOOLBAR.NEW_COMPONENT,
      icon: 'pi pi-plus',
      tooltipOptions: {
        tooltipLabel: 'Choose a component to add to your dashboard',
        tooltipZIndex: '999999',
        tooltipStyleClass: 'text-sm',
      },
      command: (event) => {
        this.emitEvent({ event: event } as ToolbarEvent);
      }
    };

    this.items = [
      /*       this.portfolioItems,*/
      // this.preferencesItems,
      //  this.testItems
      addComponentItem
    ];
    if (this.menuBar) {
      if (this.menuBar.menubutton) {
        this.menuBar.menubutton.nativeElement.innerHTML = `<div></div>`;

      }
    }
  }

  getToolbarStyleClass(): string {
    if (this.screenSize === Const.CONSTANT.SCREEN_SIZE.XS) {
      return 'toolbar-wrapper-mobile';
    } else if (this.isNavExpanded) {
      return 'toolbar-wrapper-nav-expanded';
    } else {
      return 'toolbar-wrapper-nav-contracted';
    }
  }


  close() {
    this.portfolioService.hideToolbar();
  }

  expand() {
    this.portfolioService.openToolbar();

  }


  /* ------------------------------------ Rename Portfolio ------------------------------------- */
  handleRename() {
    if (this.portfolioName && this.portfolioName.trim() !== '' &&
      this.currentPortfolio.portfolioName !== this.portfolioName) {
      this.renamePortfolio();
    } else {
      this.portfolioNameEditor.deactivate();
    }
    this.showCancelRename = false;

  }
  renamePortfolio() {
    this.portfolioService.renamePortfolio(this.portfolioName).then(
      () => {
        this.portfolioNameEditor.deactivate();

      }
    )
  }

  portfolioNameChanged(event) {
    if (event && event !== this.currentPortfolio.portfolioName || event === '') {
      this.showCancelRename = true;

    } else {
      this.showCancelRename = false;
    }

  }

  handleCancelRename() {
    this.portfolioNameEditor.deactivate();
    this.portfolioName = this.currentPortfolio.portfolioName;
    this.showCancelRename = false;
  }

}

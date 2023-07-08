import { MediaMatcher } from '@angular/cdk/layout';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { switchMap } from 'rxjs/operators';
import { SearchComponent } from 'src/app/components/shared/search/search.component';
import { PortfolioBuilderService } from '../../services/portfolio-builder.service';
import { PortfolioService } from '../../services/portfolio.service';
import { AddEditService } from './add-edit.service';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SearchComponent as SearchComponent_1 } from '../shared/search/search.component';
import { SharedModule } from 'primeng/api';
import { NgIf } from '@angular/common';
import { SessionService } from 'src/app/services/session.service';

@Component({
    selector: 'app-add-edit',
    templateUrl: './add-edit.component.html',
    styleUrls: ['./add-edit.component.scss'],
    standalone: true,
    imports: [NgIf, FormsModule, ReactiveFormsModule, OverlayPanelModule, SharedModule, InputTextModule, InputNumberModule, ButtonModule, RippleModule]
})
export class AddEditComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('searchAssets') searchOverlay: OverlayPanel;
  @ViewChild(SearchComponent) searchComponent: SearchComponent;


  editForm: UntypedFormGroup;
  public readonly SEARCH_FORM_NAME = 'searchAssetField';
  searchFormControl: UntypedFormControl = new UntypedFormControl('', [Validators.required]);

  private _quantity: number;

  private _costBasis: number;

  assetId: string;

  private _sinceDate: Date;

  private _mode: string;

  assetIdError: boolean;
  quantityError: boolean;
  sinceDateError: boolean;
  costBasisError: boolean;

  mobileQuery: MediaQueryList;
  _mobileQueryListener: () => void;


  constructor(
    private cd: ChangeDetectorRef,
    private portfolioService: PortfolioService,
    private builder: PortfolioBuilderService,
    private sessionService:SessionService,
    private addEditService: AddEditService,
    media: MediaMatcher
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => {
      this.cd.detectChanges();
    };

    this.mobileQuery.addEventListener('change', this._mobileQueryListener);

    this.editForm = this.createFormGroup();
  }
  ngOnDestroy(): void {
    this.mobileQuery.removeEventListener('change', this._mobileQueryListener);

  }


  ngAfterViewInit(): void {
    this.searchFormControl.valueChanges.subscribe(word => {
      this.sessionService.filter(word);
    });


    this.editForm.get('quantity').valueChanges.subscribe(value => {
      if (value) {

      }
    });

    this.editForm.get('sinceDate').valueChanges.subscribe(value => {
      if (value) {
      }
    });

    this.editForm.get('costBasis').valueChanges.subscribe(value => {
      if (value) {

      }
    });

    this.searchOverlay.onShow.pipe(
      switchMap(show => {
        return this.searchComponent.onSelect;
      })
    ).subscribe(
      selected => {
        if (selected) {
          this.assetId = selected;
          this.searchOverlay.hide();
        }
      });

  }


  ngOnInit(): void {


  }

  showSearchOverlay(event) {
    if (!this.searchOverlay.overlayVisible) {
      this.searchOverlay.show(event);
    }
  }


  createFormGroup(): UntypedFormGroup {
    return new UntypedFormGroup({
      searchAssetField: this.searchFormControl,
      quantity: new UntypedFormControl(0, [Validators.required]),
      sinceDate: new UntypedFormControl(new Date(), [Validators.required]),
      costBasis: new UntypedFormControl(0, [Validators.required])
    });
  }


  hasErrors(editForm: UntypedFormGroup): boolean {
    return !editForm.valid || !editForm.touched || this.assetIdError || this.quantityError || this.sinceDateError || this.costBasisError;
  }


  submitHandler(event: any) {
    const quantity = this.editForm.get('quantity').value;
    const costBasis = this.editForm.get('costBasis').value;
    const sinceDate = this.editForm.get('sinceDate').value;
    const assetId = this.editForm.get('assetId').value;
    this.portfolioService.addPortfolioAsset(this.builder.getBasicOwnedAssetObject(assetId, quantity, costBasis));
  }

  public get quantity(): number {
    return this._quantity;
  }

  public set quantity(value: number) {
    this._quantity = value;
  }

  public get sinceDate(): Date {
    return this._sinceDate;
  }

  public set sinceDate(value: Date) {
    this._sinceDate = value;
  }

  public get costBasis(): number {
    return this._costBasis;
  }

  public set costBasis(value: number) {
    this._costBasis = value;
  }

  public get mode(): string {
    return this._mode;
  }

  public set mode(value: string) {
    this._mode = value;
  }

}
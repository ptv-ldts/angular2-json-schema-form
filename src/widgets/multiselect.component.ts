import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { JsonSchemaFormService } from '../library/json-schema-form.service';
import { buildTitleMap } from '../library/utilities/index';

import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown';

@Component({
  selector: 'multi-select-widget',
  template: `
    <div
      [class]="options?.htmlClass">
      <label *ngIf="options?.title"
        [attr.for]="'control' + layoutNode?._id"
        [class]="options?.labelHtmlClass"
        [class.sr-only]="options?.notitle"
        [innerHTML]="options?.title"></label>

      <angular2-multiselect 
        [data]="dropdownList"
        [ngModel]="selectedItems"
        (ngModelChange)="updateValue($event)"
      >
      </angular2-multiselect>
    </div>`,
})
export class MultiSelectComponent implements OnInit {
  private formControl: AbstractControl;
  public controlName: string;
  public controlValue: any;
  public controlDisabled: boolean = false;
  private boundControl: boolean = false;
  public options: any;
  public selectList: any[] = [];


  public dropdownList = [];
  public selectedItems = [];
  public dropdownSettings = {};

  @Input() formID: number;
  @Input() layoutNode: any;
  @Input() layoutIndex: number[];
  @Input() dataIndex: number[];

  constructor(
    private jsf: JsonSchemaFormService
  ) { }

  ngOnInit() {
    this.options = this.layoutNode.options;
    this.selectList = buildTitleMap(
      this.options.titleMap || this.options.enumNames,
      this.options.enum,
      !!this.options.required
    ).filter((value) => {
      return value.value && value.value !== '';
    });
    this.dropdownList = this.selectList.map((value, index, arr) => {
        return {id: index, itemName: value.value};
    });
    this.jsf.initializeControl(this);
    this.jsf.getControl(this)['setWarning'](!this.isValueInList());
    this.setSelectItemsFromArray(this.controlValue);
  }

  public isValueInList() {
    this.controlValue = this.controlValue || [];
    let valueInList = true;
    this.controlValue.forEach((value) => {
      valueInList = valueInList && this.selectList.filter((selection) => selection.value = value).length > 0;
    });
    return valueInList;
  }
  private setSelectItemsFromArray(array) {
    array = array || [];
    array.forEach((value) => {
      if (value != null) {
        this.selectedItems.push({itemName: value});
      }
    });
  }

  private getArrayFromSelectedItems() {
    return this.selectedItems.filter((value) => {
      return value != null;
    }).map((value, index, arr) => {
      return value.itemName;
    });
  }

  public updateValue(event) {
    this.jsf.updateMultiSelectionArray(this, this.getArrayFromSelectedItems());
    this.jsf.getControl(this)['setWarning'](!this.isValueInList());
  }
}

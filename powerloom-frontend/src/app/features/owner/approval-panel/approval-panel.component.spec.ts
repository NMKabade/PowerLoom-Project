import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalPanelComponent } from './approval-panel.component';

describe('ApprovalPanelComponent', () => {
  let component: ApprovalPanelComponent;
  let fixture: ComponentFixture<ApprovalPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovalPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovalPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

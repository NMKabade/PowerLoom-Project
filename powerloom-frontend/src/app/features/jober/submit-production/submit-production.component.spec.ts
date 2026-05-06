import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitProductionComponent } from './submit-production.component';

describe('SubmitProductionComponent', () => {
  let component: SubmitProductionComponent;
  let fixture: ComponentFixture<SubmitProductionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmitProductionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmitProductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

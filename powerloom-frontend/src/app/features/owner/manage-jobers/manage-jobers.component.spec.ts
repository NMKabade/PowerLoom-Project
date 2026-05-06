import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageJobersComponent } from './manage-jobers.component';

describe('ManageJobersComponent', () => {
  let component: ManageJobersComponent;
  let fixture: ComponentFixture<ManageJobersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageJobersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageJobersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

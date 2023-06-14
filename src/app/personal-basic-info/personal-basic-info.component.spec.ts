import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalBasicInfoComponent } from './personal-basic-info.component';

describe('PersonalBasicInfoComponent', () => {
  let component: PersonalBasicInfoComponent;
  let fixture: ComponentFixture<PersonalBasicInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PersonalBasicInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalBasicInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

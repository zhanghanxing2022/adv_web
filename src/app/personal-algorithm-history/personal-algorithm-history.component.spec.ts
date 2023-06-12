import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalAlgorithmHistoryComponent } from './personal-algorithm-history.component';

describe('PersonalAlgorithmHistoryComponent', () => {
  let component: PersonalAlgorithmHistoryComponent;
  let fixture: ComponentFixture<PersonalAlgorithmHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PersonalAlgorithmHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalAlgorithmHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

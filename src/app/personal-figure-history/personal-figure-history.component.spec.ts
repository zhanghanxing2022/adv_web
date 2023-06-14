import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalFigureHistoryComponent } from './personal-figure-history.component';

describe('PersonalFigureHistoryComponent', () => {
  let component: PersonalFigureHistoryComponent;
  let fixture: ComponentFixture<PersonalFigureHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PersonalFigureHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalFigureHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

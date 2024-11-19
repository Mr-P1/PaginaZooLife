import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsoAppTriviasComponent } from './uso-app-trivias.component';

describe('UsoAppTriviasComponent', () => {
  let component: UsoAppTriviasComponent;
  let fixture: ComponentFixture<UsoAppTriviasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsoAppTriviasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsoAppTriviasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

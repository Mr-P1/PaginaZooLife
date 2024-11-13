import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopularidadAnimalComponent } from './popularidad-animal.component';

describe('PopularidadAnimalComponent', () => {
  let component: PopularidadAnimalComponent;
  let fixture: ComponentFixture<PopularidadAnimalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopularidadAnimalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopularidadAnimalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopularidadPlantaComponent } from './popularidad-planta.component';

describe('PopularidadPlantaComponent', () => {
  let component: PopularidadPlantaComponent;
  let fixture: ComponentFixture<PopularidadPlantaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopularidadPlantaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopularidadPlantaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

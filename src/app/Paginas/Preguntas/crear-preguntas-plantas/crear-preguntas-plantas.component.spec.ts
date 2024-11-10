import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearPreguntasPlantasComponent } from './crear-preguntas-plantas.component';

describe('CrearPreguntasPlantasComponent', () => {
  let component: CrearPreguntasPlantasComponent;
  let fixture: ComponentFixture<CrearPreguntasPlantasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearPreguntasPlantasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearPreguntasPlantasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

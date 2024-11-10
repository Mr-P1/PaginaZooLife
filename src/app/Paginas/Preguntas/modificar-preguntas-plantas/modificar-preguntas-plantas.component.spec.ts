import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificarPreguntasPlantasComponent } from './modificar-preguntas-plantas.component';

describe('ModificarPreguntasPlantasComponent', () => {
  let component: ModificarPreguntasPlantasComponent;
  let fixture: ComponentFixture<ModificarPreguntasPlantasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModificarPreguntasPlantasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModificarPreguntasPlantasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

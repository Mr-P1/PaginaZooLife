import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearPreguntasComponent } from './crear-preguntas.component';

describe('CrearPreguntasComponent', () => {
  let component: CrearPreguntasComponent;
  let fixture: ComponentFixture<CrearPreguntasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearPreguntasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearPreguntasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

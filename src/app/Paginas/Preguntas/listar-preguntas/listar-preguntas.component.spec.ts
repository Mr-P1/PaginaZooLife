import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarPreguntasComponent } from './listar-preguntas.component';

describe('ListarPreguntasComponent', () => {
  let component: ListarPreguntasComponent;
  let fixture: ComponentFixture<ListarPreguntasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarPreguntasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarPreguntasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

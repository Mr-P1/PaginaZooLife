import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComentariosAplicacionComponent } from './comentarios-aplicacion.component';

describe('ComentariosAplicacionComponent', () => {
  let component: ComentariosAplicacionComponent;
  let fixture: ComponentFixture<ComentariosAplicacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComentariosAplicacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComentariosAplicacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

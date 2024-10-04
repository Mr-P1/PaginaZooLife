import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificarNoticiaComponent } from './modificar-noticia.component';

describe('ModificarNoticiaComponent', () => {
  let component: ModificarNoticiaComponent;
  let fixture: ComponentFixture<ModificarNoticiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModificarNoticiaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModificarNoticiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

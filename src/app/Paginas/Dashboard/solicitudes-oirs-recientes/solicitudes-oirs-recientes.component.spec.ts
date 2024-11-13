import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudesOirsRecientesComponent } from './solicitudes-oirs-recientes.component';

describe('SolicitudesOirsRecientesComponent', () => {
  let component: SolicitudesOirsRecientesComponent;
  let fixture: ComponentFixture<SolicitudesOirsRecientesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitudesOirsRecientesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitudesOirsRecientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

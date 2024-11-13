import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudesPendientesOirsComponent } from './solicitudes-pendientes-oirs.component';

describe('SolicitudesPendientesOirsComponent', () => {
  let component: SolicitudesPendientesOirsComponent;
  let fixture: ComponentFixture<SolicitudesPendientesOirsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitudesPendientesOirsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitudesPendientesOirsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

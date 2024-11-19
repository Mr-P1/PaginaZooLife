import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudesOirsComponent } from './solicitudes-oirs.component';

describe('SolicitudesOirsComponent', () => {
  let component: SolicitudesOirsComponent;
  let fixture: ComponentFixture<SolicitudesOirsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitudesOirsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitudesOirsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

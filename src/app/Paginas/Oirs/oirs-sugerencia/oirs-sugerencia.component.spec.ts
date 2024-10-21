import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OirsSugerenciaComponent } from './oirs-sugerencia.component';

describe('OirsSugerenciaComponent', () => {
  let component: OirsSugerenciaComponent;
  let fixture: ComponentFixture<OirsSugerenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OirsSugerenciaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OirsSugerenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

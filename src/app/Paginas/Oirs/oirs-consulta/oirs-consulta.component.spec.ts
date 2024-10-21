import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OirsConsultaComponent } from './oirs-consulta.component';

describe('OirsConsultaComponent', () => {
  let component: OirsConsultaComponent;
  let fixture: ComponentFixture<OirsConsultaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OirsConsultaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OirsConsultaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

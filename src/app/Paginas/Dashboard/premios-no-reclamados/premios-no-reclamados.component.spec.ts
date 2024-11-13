import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremiosNoReclamadosComponent } from './premios-no-reclamados.component';

describe('PremiosNoReclamadosComponent', () => {
  let component: PremiosNoReclamadosComponent;
  let fixture: ComponentFixture<PremiosNoReclamadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PremiosNoReclamadosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PremiosNoReclamadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

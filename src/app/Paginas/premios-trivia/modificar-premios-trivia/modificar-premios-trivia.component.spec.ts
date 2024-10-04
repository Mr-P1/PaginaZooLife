import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificarPremiosTriviaComponent } from './modificar-premios-trivia.component';

describe('ModificarPremiosTriviaComponent', () => {
  let component: ModificarPremiosTriviaComponent;
  let fixture: ComponentFixture<ModificarPremiosTriviaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModificarPremiosTriviaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModificarPremiosTriviaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

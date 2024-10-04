import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearPremiosTriviaComponent } from './crear-premios-trivia.component';

describe('CrearPremiosTriviaComponent', () => {
  let component: CrearPremiosTriviaComponent;
  let fixture: ComponentFixture<CrearPremiosTriviaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearPremiosTriviaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearPremiosTriviaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

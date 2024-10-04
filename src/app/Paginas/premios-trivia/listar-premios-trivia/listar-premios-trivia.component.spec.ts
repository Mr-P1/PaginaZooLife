import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarPremiosTriviaComponent } from './listar-premios-trivia.component';

describe('ListarPremiosTriviaComponent', () => {
  let component: ListarPremiosTriviaComponent;
  let fixture: ComponentFixture<ListarPremiosTriviaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarPremiosTriviaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarPremiosTriviaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

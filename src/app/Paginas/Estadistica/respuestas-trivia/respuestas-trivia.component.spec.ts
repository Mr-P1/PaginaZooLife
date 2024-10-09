import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RespuestasTriviaComponent } from './respuestas-trivia.component';

describe('RespuestasTriviaComponent', () => {
  let component: RespuestasTriviaComponent;
  let fixture: ComponentFixture<RespuestasTriviaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RespuestasTriviaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RespuestasTriviaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

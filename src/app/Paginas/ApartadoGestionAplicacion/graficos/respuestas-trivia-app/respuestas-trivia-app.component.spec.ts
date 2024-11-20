import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RespuestasTriviaAppComponent } from './respuestas-trivia-app.component';

describe('RespuestasTriviaAppComponent', () => {
  let component: RespuestasTriviaAppComponent;
  let fixture: ComponentFixture<RespuestasTriviaAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RespuestasTriviaAppComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RespuestasTriviaAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

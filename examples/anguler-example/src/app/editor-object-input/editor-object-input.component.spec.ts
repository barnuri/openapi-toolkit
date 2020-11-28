import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorObjectInputComponent } from './editor-object-input.component';

describe('EditorObjectInputComponent', () => {
  let component: EditorObjectInputComponent;
  let fixture: ComponentFixture<EditorObjectInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditorObjectInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorObjectInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

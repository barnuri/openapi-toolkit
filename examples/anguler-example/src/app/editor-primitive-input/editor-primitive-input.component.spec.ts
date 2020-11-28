import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorPrimitiveInputComponent } from './editor-primitive-input.component';

describe('EditorPrimitiveInputComponent', () => {
  let component: EditorPrimitiveInputComponent;
  let fixture: ComponentFixture<EditorPrimitiveInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditorPrimitiveInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorPrimitiveInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

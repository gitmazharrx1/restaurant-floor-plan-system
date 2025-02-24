import { Directive, ElementRef, EventEmitter, HostListener, Input, Output, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appDraggable]',
  standalone: true
})
export class DraggableDirective {
  @Input() itemIndex!: number;
  @Input() layout!: any[];
  @Output() positionChanged = new EventEmitter<any>();

  private offsetX = 0;
  private offsetY = 0;
  private isDragging = false;

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    event.preventDefault();
    this.isDragging = true;

    const rect = this.el.nativeElement.getBoundingClientRect();
    this.offsetX = event.clientX - rect.left;
    this.offsetY = event.clientY - rect.top;

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  onMouseMove = (event: MouseEvent) => {
    if (!this.isDragging) return;

    const parentRect = this.el.nativeElement.parentElement.getBoundingClientRect(); // Get drop-zone position
    const newX = event.clientX - parentRect.left - this.offsetX;
    const newY = event.clientY - parentRect.top - this.offsetY;

    this.renderer.setStyle(this.el.nativeElement, 'left', `${newX}px`);
    this.renderer.setStyle(this.el.nativeElement, 'top', `${newY}px`);
  };

  onMouseUp = () => {
    if (this.isDragging) {
      this.isDragging = false;
      const rect = this.el.nativeElement.getBoundingClientRect();
      const parentRect = this.el.nativeElement.parentElement.getBoundingClientRect(); // Get drop-zone position
      this.positionChanged.emit({ x: rect.left - parentRect.left, y: rect.top - parentRect.top });
    }

    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  };
}

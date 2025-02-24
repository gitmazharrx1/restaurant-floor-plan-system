import { Directive, ElementRef, HostListener, Input, Output, EventEmitter, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appDraggable]',
  standalone: true
})
export class DraggableDirective {
  @Input() itemIndex!: number; // Accept item index from the component
  @Output() positionChanged = new EventEmitter<{ index: number, x: number, y: number }>();

  private startX = 0;
  private startY = 0;
  private offsetX = 0;
  private offsetY = 0;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.renderer.setStyle(this.el.nativeElement, 'position', 'absolute');
    this.renderer.setStyle(this.el.nativeElement, 'cursor', 'grab');
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    event.preventDefault();

    this.startX = event.clientX;
    this.startY = event.clientY;

    const rect = this.el.nativeElement.getBoundingClientRect();
    this.offsetX = this.startX - rect.left;
    this.offsetY = this.startY - rect.top;

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  onMouseMove = (event: MouseEvent) => {
    const dropZone = this.el.nativeElement.parentElement;
    const dropZoneRect = dropZone.getBoundingClientRect();

    let newX = event.clientX - dropZoneRect.left - this.offsetX;
    let newY = event.clientY - dropZoneRect.top - this.offsetY;

    // Clamp position to stay within drop zone
    newX = Math.max(0, Math.min(newX, dropZoneRect.width - this.el.nativeElement.offsetWidth));
    newY = Math.max(0, Math.min(newY, dropZoneRect.height - this.el.nativeElement.offsetHeight));

    this.renderer.setStyle(this.el.nativeElement, 'left', `${newX}px`);
    this.renderer.setStyle(this.el.nativeElement, 'top', `${newY}px`);

    this.positionChanged.emit({ index: this.itemIndex, x: newX, y: newY });
  };

  onMouseUp = () => {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  };
}

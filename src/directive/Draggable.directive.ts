import { Directive, ElementRef, HostListener, Input, Output, EventEmitter, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appDraggable]',
  standalone: true
})
export class DraggableDirective {
  @Input() itemIndex!: number;
  @Output() positionChanged = new EventEmitter<{ index: number, x: number, y: number }>();

  private startX = 0;
  private startY = 0;
  private offsetX = 0;
  private offsetY = 0;
  private dropZone!: HTMLElement;

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    event.preventDefault();

    this.dropZone = this.el.nativeElement.parentElement;
    const rect = this.el.nativeElement.getBoundingClientRect();
    const dropZoneRect = this.dropZone.getBoundingClientRect();

    this.startX = event.clientX;
    this.startY = event.clientY;
    this.offsetX = this.startX - rect.left;
    this.offsetY = this.startY - rect.top;

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  onMouseMove = (event: MouseEvent) => {
    const dropZoneRect = this.dropZone.getBoundingClientRect();

    let newX = (event.clientX - dropZoneRect.left - this.offsetX) / dropZoneRect.width * 100;
    let newY = (event.clientY - dropZoneRect.top - this.offsetY) / dropZoneRect.height * 100;

    // Ensure position stays within drop zone
    newX = Math.max(0, Math.min(newX, 100 - this.el.nativeElement.offsetWidth / dropZoneRect.width * 100));
    newY = Math.max(0, Math.min(newY, 100 - this.el.nativeElement.offsetHeight / dropZoneRect.height * 100));

    this.renderer.setStyle(this.el.nativeElement, 'left', `${newX}%`);
    this.renderer.setStyle(this.el.nativeElement, 'top', `${newY}%`);

    this.positionChanged.emit({ index: this.itemIndex, x: newX, y: newY });
  };

  onMouseUp = () => {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  };
}
